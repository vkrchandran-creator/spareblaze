const prisma = require('../config/db');

// ─── Select shape ────────────────────────────────────────────────────────────
// Reused on every cart read so the response shape is always consistent.

const ITEM_SELECT = {
  id:       true,
  quantity: true,
  product: {
    select: {
      id:             true,
      title:          true,
      slug:           true,
      brand:          true,
      price:          true,
      mrp:            true,
      discountPercent:true,
      images:         true,
      isActive:       true,
      inventory:      { select: { quantity: true } },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a clean cart response with subtotals and a summary.
 * Items whose product has been deactivated since being added are
 * flagged with `unavailable: true` so the frontend can warn the user.
 */
function formatCart(cartItems) {
  let totalAmount = 0;
  let totalItems  = 0;

  const items = cartItems.map(item => {
    const price       = Number(item.product.price);
    const subtotal    = price * item.quantity;
    const inStock     = item.product.inventory?.quantity ?? 0;
    const unavailable = !item.product.isActive || inStock === 0;

    if (!unavailable) {
      totalAmount += subtotal;
      totalItems  += item.quantity;
    }

    return {
      cartItemId:  item.id,
      quantity:    item.quantity,
      subtotal,
      unavailable,
      stockAvailable: inStock,
      product: {
        id:             item.product.id,
        title:          item.product.title,
        slug:           item.product.slug,
        brand:          item.product.brand,
        price,
        mrp:            Number(item.product.mrp),
        discountPercent:item.product.discountPercent,
        images:         item.product.images,
      },
    };
  });

  return {
    items,
    summary: {
      totalItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      itemCount:   items.length,
    },
  };
}

/**
 * Validate that a product exists, is active, and has enough stock.
 * Throws a descriptive error if any check fails.
 */
async function validateStock(productId, requestedQty, currentCartQty = 0) {
  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: {
      id: true, isActive: true, title: true,
      inventory: { select: { quantity: true } },
    },
  });

  if (!product || !product.isActive) {
    const err = new Error('Product not found or no longer available.');
    err.status = 404;
    throw err;
  }

  const stock     = product.inventory?.quantity ?? 0;
  const totalWant = requestedQty + currentCartQty;

  if (stock === 0) {
    const err = new Error(`"${product.title}" is out of stock.`);
    err.status = 400;
    throw err;
  }

  if (totalWant > stock) {
    const err = new Error(
      `Only ${stock} unit${stock > 1 ? 's' : ''} available for "${product.title}".`
    );
    err.status = 400;
    throw err;
  }

  return product;
}

// ─── Service functions ────────────────────────────────────────────────────────

/** Fetch the full cart for a user. */
async function getCart(userId) {
  const items = await prisma.cartItem.findMany({
    where:   { userId },
    select:  ITEM_SELECT,
    orderBy: { createdAt: 'asc' },
  });
  return formatCart(items);
}

/**
 * Add a product to the cart.
 * If the item already exists, increments its quantity.
 * Always validates that total quantity does not exceed available stock.
 */
async function add(userId, productId, quantity) {
  // Check what's already in the cart for this product
  const existing = await prisma.cartItem.findUnique({
    where:  { userId_productId: { userId, productId } },
    select: { id: true, quantity: true },
  });

  const currentQty = existing?.quantity ?? 0;
  await validateStock(productId, quantity, currentQty);

  await prisma.cartItem.upsert({
    where:  { userId_productId: { userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId, productId, quantity },
  });

  return getCart(userId);
}

/**
 * Set a cart item to an exact quantity.
 * quantity = 0 removes the item entirely.
 */
async function update(userId, productId, quantity) {
  if (quantity === 0) {
    return remove(userId, productId);
  }

  // Validate against stock (no current-cart offset — we're setting, not adding)
  await validateStock(productId, quantity, 0);

  const existing = await prisma.cartItem.findUnique({
    where:  { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (!existing) {
    const err = new Error('Item not found in cart.');
    err.status = 404;
    throw err;
  }

  await prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data:  { quantity },
  });

  return getCart(userId);
}

/** Remove a single item from the cart. */
async function remove(userId, productId) {
  // deleteMany avoids a 404 throw if the item doesn't exist
  await prisma.cartItem.deleteMany({
    where: { userId, productId },
  });
  return getCart(userId);
}

/** Remove all items from the cart. */
async function clear(userId) {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCart(userId);
}

/**
 * Merge a guest localStorage cart into the user's DB cart after login.
 *
 * Strategy:
 *   - For each guest item, check if the product already exists in the DB cart.
 *   - If it does: keep whichever quantity is higher.
 *   - If it doesn't: add it as a new cart item.
 *   - Skip items that fail stock validation rather than rejecting the whole merge.
 *
 * Returns the merged cart plus a `skipped` array with reasons for any failures.
 */
async function merge(userId, guestItems) {
  const skipped = [];

  for (const { productId, quantity } of guestItems) {
    if (!productId || !quantity || quantity < 1) continue;

    try {
      const existing = await prisma.cartItem.findUnique({
        where:  { userId_productId: { userId, productId } },
        select: { quantity: true },
      });

      if (existing) {
        // Keep the higher quantity, capped by stock
        const product = await prisma.product.findUnique({
          where:  { id: productId },
          select: { inventory: { select: { quantity: true } }, isActive: true },
        });

        if (!product?.isActive) continue; // silently skip inactive

        const maxAllowed = product.inventory?.quantity ?? 0;
        const merged     = Math.min(Math.max(existing.quantity, quantity), maxAllowed);

        if (merged > 0) {
          await prisma.cartItem.update({
            where: { userId_productId: { userId, productId } },
            data:  { quantity: merged },
          });
        }
      } else {
        // New item — validate before adding
        const currentQty = 0;
        await validateStock(productId, quantity, currentQty);
        await prisma.cartItem.create({ data: { userId, productId, quantity } });
      }
    } catch (err) {
      skipped.push({ productId, reason: err.message });
    }
  }

  const cart = await getCart(userId);
  return { ...cart, skipped };
}

module.exports = { getCart, add, update, remove, clear, merge };
