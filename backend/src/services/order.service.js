const prisma = require('../config/db');

// ─── Status machine ───────────────────────────────────────────────────────────

const VALID_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
  delivered:  ['refunded'],
  cancelled:  [],
  refunded:   [],
};

// Statuses from which cancellation must restore inventory
const RESTORE_INVENTORY_ON_CANCEL = new Set(['pending', 'confirmed']);

// ─── Select shapes ────────────────────────────────────────────────────────────

const ORDER_SUMMARY_SELECT = {
  id:          true,
  status:      true,
  totalAmount: true,
  createdAt:   true,
  updatedAt:   true,
  _count:      { select: { items: true } },
};

const ORDER_DETAIL_SELECT = {
  id:              true,
  status:          true,
  totalAmount:     true,
  shippingAddress: true,
  notes:           true,
  createdAt:       true,
  updatedAt:       true,
  items: {
    select: {
      id:         true,
      quantity:   true,
      unitPrice:  true,
      totalPrice: true,
      product: {
        select: {
          id:     true,
          title:  true,
          slug:   true,
          brand:  true,
          images: true,
        },
      },
    },
  },
  payment: {
    select: {
      status:          true,
      gateway:         true,
      gatewayOrderId:  true,
      gatewayPaymentId:true,
      paidAt:          true,
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assertTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(
      `Cannot move order from '${currentStatus}' to '${newStatus}'. ` +
      `Allowed transitions: [${allowed.join(', ') || 'none'}].`
    );
    err.status = 422;
    throw err;
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create an order from the user's cart.
 *
 * Steps (all inside a single transaction):
 *  1. Verify address belongs to user
 *  2. Load cart items — error if empty
 *  3. Validate every item: active, sufficient stock
 *  4. Calculate total server-side
 *  5. Create Order + OrderItems (price snapshot)
 *  6. Decrement inventory for each item
 *  7. Clear the user's cart
 */
async function create(userId, addressId) {
  // 1 — Verify address ownership
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    const err = new Error('Delivery address not found.');
    err.status = 404;
    throw err;
  }

  // 2 — Load cart
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    select: {
      productId: true,
      quantity:  true,
      product: {
        select: {
          id:        true,
          title:     true,
          price:     true,
          isActive:  true,
          inventory: { select: { quantity: true } },
        },
      },
    },
  });

  if (cartItems.length === 0) {
    const err = new Error('Your cart is empty.');
    err.status = 400;
    throw err;
  }

  // 3 — Validate stock
  for (const item of cartItems) {
    if (!item.product.isActive) {
      const err = new Error(`"${item.product.title}" is no longer available.`);
      err.status = 400;
      throw err;
    }
    const stock = item.product.inventory?.quantity ?? 0;
    if (item.quantity > stock) {
      const err = new Error(
        `Insufficient stock for "${item.product.title}". ` +
        `Requested ${item.quantity}, available ${stock}.`
      );
      err.status = 400;
      throw err;
    }
  }

  // 4 — Calculate total server-side (never trust the client)
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  // 5, 6, 7 — Single atomic transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress: {
          label:   address.label,
          line1:   address.line1,
          line2:   address.line2,
          city:    address.city,
          state:   address.state,
          pincode: address.pincode,
        },
        items: {
          create: cartItems.map(item => ({
            productId:  item.productId,
            quantity:   item.quantity,
            unitPrice:  item.product.price,
            totalPrice: Number(item.product.price) * item.quantity,
          })),
        },
      },
      select: ORDER_DETAIL_SELECT,
    });

    // Decrement inventory for each item
    for (const item of cartItems) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data:  { quantity: { decrement: item.quantity } },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return order;
}

/** List orders for the authenticated user (newest first, paginated). */
async function list(userId, query = {}) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip  = (page - 1) * limit;

  const where = { userId };
  if (query.status) where.status = query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select:  ORDER_SUMMARY_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Get a single order — only if it belongs to the requesting user. */
async function getOne(userId, orderId) {
  const order = await prisma.order.findFirst({
    where:  { id: orderId, userId },
    select: ORDER_DETAIL_SELECT,
  });

  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }

  return order;
}

/**
 * Cancel an order (user action).
 * Users can only cancel pending or confirmed orders.
 * Restores inventory on cancellation.
 */
async function cancel(userId, orderId) {
  const order = await prisma.order.findFirst({
    where:  { id: orderId, userId },
    select: { id: true, status: true, items: { select: { productId: true, quantity: true } } },
  });

  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }

  assertTransition(order.status, 'cancelled');

  return prisma.$transaction(async (tx) => {
    // Restore inventory for cancellable statuses
    if (RESTORE_INVENTORY_ON_CANCEL.has(order.status)) {
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data:  { quantity: { increment: item.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where:  { id: orderId },
      data:   { status: 'cancelled' },
      select: ORDER_DETAIL_SELECT,
    });

    return updated;
  });
}

// ─── Admin functions ──────────────────────────────────────────────────────────

/** List all orders (admin). Supports status filter and pagination. */
async function adminList(query = {}) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip  = (page - 1) * limit;

  const where = {};
  if (query.status) where.status = query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        ...ORDER_SUMMARY_SELECT,
        shippingAddress: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Update order status (admin).
 * Enforces the status state machine.
 * Restores inventory when admin cancels a pending/confirmed order.
 * Accepts optional trackingNumber stored in the notes field.
 */
async function adminUpdateStatus(orderId, { status, trackingNumber, notes }) {
  const order = await prisma.order.findUnique({
    where:  { id: orderId },
    select: {
      id: true, status: true,
      items: { select: { productId: true, quantity: true } },
    },
  });

  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }

  assertTransition(order.status, status);

  // Build notes string
  const noteParts = [];
  if (trackingNumber) noteParts.push(`Tracking: ${trackingNumber}`);
  if (notes)          noteParts.push(notes);
  const notesValue = noteParts.length ? noteParts.join(' | ') : undefined;

  return prisma.$transaction(async (tx) => {
    // Restore inventory when admin cancels a pre-delivery order
    if (status === 'cancelled' && RESTORE_INVENTORY_ON_CANCEL.has(order.status)) {
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data:  { quantity: { increment: item.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(notesValue !== undefined && { notes: notesValue }),
      },
      select: ORDER_DETAIL_SELECT,
    });

    return updated;
  });
}

module.exports = { create, list, getOne, cancel, adminList, adminUpdateStatus };
