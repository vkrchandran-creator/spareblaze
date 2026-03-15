# SpareBlaze — AI Development Context

> **Purpose:** This document allows a new AI session to immediately understand the project state and continue development without re-reading the entire codebase.
> **Last updated:** Phase 8 complete. Phase 9 (Admin Panel) is next.

---

## Project Overview

**SpareBlaze** is a production-grade automotive spare parts e-commerce platform for the Indian market. It sells OEM, aftermarket, used, and wholesale car parts — similar to boodmo.com.

The project was migrated from a flat frontend-only HTML/CSS/JS application into a clean full-stack monorepo during Phase 1.

---

## Repository Structure

```
spareblaze/
├── frontend/                  # Static HTML/CSS/JS (pre-API, served as-is)
│   ├── pages/                 # 14 HTML pages + admin/index.html
│   ├── css/style.css
│   ├── js/script.js, admin/admin.js
│   ├── js/data/               # Legacy JS product arrays (used by frontend until Phase 5 API wired)
│   ├── public/images/         # Brand logos
│   ├── public/product-images/ # Product images (aftermarket/, oem/, used/, wholesale/)
│   ├── legacy/static-pages/   # Archived static generated product pages (reference only)
│   └── vercel.json
│
├── backend/                   # Node.js / Express REST API  ← ACTIVE DEVELOPMENT
│   ├── src/
│   │   ├── app.js             # Express setup — Helmet, CORS, rate-limit, all routes wired
│   │   ├── server.js          # Entry point (PORT 5000)
│   │   ├── config/
│   │   │   ├── db.js          # Prisma singleton
│   │   │   └── env.js         # Env var validation on startup
│   │   ├── routes/            # auth, product, cart, order, payment, admin
│   │   ├── controllers/       # Thin — call service, return response
│   │   ├── services/          # All business logic lives here
│   │   ├── middleware/        # auth, admin, validate, rateLimit, errorHandler
│   │   └── utils/             # apiResponse, hashPassword, generateToken
│   ├── prisma/
│   │   ├── schema.prisma      # Full schema — 9 models
│   │   ├── seed.js            # Seeds 600 products from JS data files
│   │   └── migrations/        # 1 migration: 20260315064713_init
│   └── tests/                 # auth.test.js, product.test.js, cart.test.js, order.test.js
│
├── database/
│   └── seeds/                 # Source JS data files (after-market, oem, used, wholesale, cms)
│
├── docs/
│   ├── ARCHITECTURE.md        # Full 11-phase engineering blueprint
│   └── AI_CONTEXT.md          # This file
│
└── docker/
    ├── docker-compose.yml     # PostgreSQL container for local dev
    └── Dockerfile.backend
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS, Vanilla JS (no framework) |
| Backend | Node.js v20, Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL (hosted on Neon) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Validation | `express-validator` |
| Security | `helmet`, `express-rate-limit`, CORS |
| Payments | `razorpay` SDK (installed, not yet implemented) |
| Email | `nodemailer` (installed, not yet implemented) |
| Frontend deploy | Vercel (configured via `frontend/vercel.json`) |
| Backend deploy | Railway / Render (not yet deployed) |
| DB deploy | Neon (live, connected) |

---

## Database

**Provider:** Neon (PostgreSQL) — connection string is in `backend/.env` as `DATABASE_URL`.

**Migration:** One migration applied — `20260315064713_init`.

**Current live counts:** ~10 users, 601 products, 4 categories, 3 orders.

### Schema — 9 Models

```
User          id, name, email, passwordHash, phone, role(customer|admin), isVerified
Address       id, userId, label, line1, line2, city, state, pincode, isDefault
Category      id, name, slug, parentId (self-join for sub-categories)
Product       id, title, slug, description, sku, brand, categoryId, price, mrp,
              discountPercent, images(String[]), specifications(Json),
              compatibleVehicles(Json), isActive
Inventory     id, productId(unique), quantity, lowStockThreshold
CartItem      id, userId, productId, quantity  @@unique([userId, productId])
Order         id, userId, status(OrderStatus), totalAmount, shippingAddress(Json),
              notes, createdAt
OrderItem     id, orderId, productId, quantity, unitPrice, totalPrice  ← price snapshot
Payment       id, orderId(unique), gateway, gatewayOrderId, gatewayPaymentId,
              gatewaySignature, amount, currency(INR), status(PaymentStatus), paidAt
```

### Enums

```
Role:          customer | admin
OrderStatus:   pending | confirmed | processing | shipped | delivered | cancelled | refunded
PaymentStatus: pending | captured | failed | refunded
```

### Seed Data (from original JS files)

| Category | Products | Notes |
|---|---|---|
| aftermarket | 586 | Most have price + inventory = 10 |
| oem | 10 | No prices (amount = 0) |
| used | 1 | No price |
| wholesale | 3 | No price |

---

## Authentication System

- **JWT** — signed with `JWT_SECRET`, expires in `JWT_EXPIRES_IN` (7d)
- **Payload:** `{ userId, role, iat, exp }`
- **Storage:** Client stores token in `localStorage` (or `Authorization: Bearer` header)
- **Password:** bcrypt with 12 salt rounds
- **User enumeration protection:** Wrong password and non-existent email return the same 401 message
- **Rate limiting:** `/auth/login` and `/auth/register` — 10 requests / 15 min / IP
- **Roles:** `customer` (default) | `admin` (set directly in DB)

---

## Implemented Modules & Services

### `auth.service.js`
- `register(data)` — creates user, returns JWT + user
- `login(data)` — validates credentials, returns JWT + user
- `getProfile(userId)` — returns user + addresses
- `addAddress(userId, data)` — creates address, auto-sets isDefault for first address
- `listAddresses(userId)` — ordered: default first
- `deleteAddress(userId, addressId)` — ownership check, promotes next to default

### `product.service.js`
- `list(query)` — paginated, filterable: `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `sort`
- `search(q, query)` — case-insensitive `contains` on title + brand + description
- `byCategory(slug, query)` — validates category exists, delegates to `list()`
- `getOne(idOrSlug)` — accepts UUID or slug, full detail select
- `create(data)` — admin only, auto-generates unique slug, creates Inventory row (qty=0)
- `update(id, data)` — regenerates slug only if title changes
- `softDelete(id)` — sets `isActive = false`

### `cart.service.js`
- `getCart(userId)` — returns formatted cart: items, subtotal, summary, `unavailable` flag
- `add(userId, productId, qty)` — upserts (increments if exists), validates stock
- `update(userId, productId, qty)` — sets exact qty; qty=0 removes item
- `remove(userId, productId)` — idempotent deleteMany
- `clear(userId)` — deleteMany all items
- `merge(userId, guestItems)` — takes higher quantity, skips invalid items (never rejects whole merge)

### `payment.service.js`
- `initiate(userId, orderId)` — verifies order ownership + pending status, creates Razorpay order (amount in paise), upserts Payment row with `gatewayOrderId`; idempotent (returns existing if already pending)
- `verify(userId, { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature })` — HMAC-SHA256 check with `crypto.timingSafeEqual()`; on match: atomically updates Payment (`captured`, `paidAt`) + Order (`confirmed`); on mismatch: 400
- `handleWebhook(rawBody, signature)` — validates `X-Razorpay-Signature` (skips if no `RAZORPAY_WEBHOOK_SECRET` set); handles `payment.captured`, `payment.failed`, `refund.processed`; never throws — always resolves

### `order.service.js`
- `create(userId, addressId)` — atomic transaction: validates cart + stock → creates order + items (price snapshot) → decrements inventory → clears cart
- `list(userId, query)` — user's own orders, paginated, filterable by status
- `getOne(userId, orderId)` — ownership enforced
- `cancel(userId, orderId)` — user can cancel `pending` or `confirmed`; restores inventory
- `adminList(query)` — all orders, includes user info, filterable by status
- `adminUpdateStatus(orderId, { status, trackingNumber, notes })` — enforces state machine; restores inventory on admin cancel of pending/confirmed

---

## API Structure

All routes prefixed with `/api/v1`. All responses use the standard shape:
```json
{ "success": true|false, "message": "...", "data": {...}, "pagination": {...} }
```

### Auth — `/api/v1/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register, returns JWT |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | JWT | Current user + addresses |
| POST | `/logout` | JWT | Stateless (client discards token) |
| GET | `/addresses` | JWT | List user's addresses |
| POST | `/addresses` | JWT | Add address (validates 6-digit pincode) |
| DELETE | `/addresses/:addressId` | JWT | Delete own address |

### Products — `/api/v1/products`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List — `?category=&brand=&minPrice=&maxPrice=&inStock=&sort=&page=&limit=` |
| GET | `/search?q=` | Public | Full-text search |
| GET | `/category/:slug` | Public | By category slug |
| GET | `/:id` | Public | By UUID or slug |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft delete |

### Cart — `/api/v1/cart` (all JWT-protected)

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get cart with subtotals + summary |
| POST | `/add` | Add item (validates stock, increments if exists) |
| POST | `/merge` | Merge guest cart on login |
| PUT | `/update` | Set exact quantity (0 = remove) |
| DELETE | `/remove/:productId` | Remove item (idempotent) |
| DELETE | `/clear` | Empty cart |

### Orders — `/api/v1/orders` (all JWT-protected)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Create order from cart |
| GET | `/` | JWT | User's order history |
| GET | `/:id` | JWT | Order detail (ownership enforced) |
| PUT | `/:id/cancel` | JWT | Cancel pending/confirmed order |
| GET | `/admin/all` | Admin | All orders + user info |
| PUT | `/admin/:id/status` | Admin | Update status + optional tracking |

### Payments — `/api/v1/payments`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/initiate` | JWT | Create Razorpay order |
| POST | `/verify` | JWT | HMAC signature verification |
| POST | `/webhook` | Public | Razorpay async events |

### Admin — `/api/v1/admin` ← **Phase 9 — NOT YET IMPLEMENTED (next)**

| Method | Route | Description |
|---|---|---|
| GET | `/dashboard` | Revenue + order + stock stats |
| GET | `/inventory` | All stock levels |
| PUT | `/inventory/:productId` | Update stock quantity |
| GET | `/users` | List all users |

---

## Order Lifecycle

```
POST /orders (cart → order, inventory decremented, cart cleared)
       ↓
   [pending]  ←── user or admin cancel (inventory restored)
       ↓  payment verified (Phase 8)
  [confirmed] ←── admin cancel (inventory restored)
       ↓
 [processing]
       ↓
  [shipped]   ← trackingNumber stored in notes field
       ↓
 [delivered]
       ↓
 [refunded]
```

**State machine is enforced** — invalid transitions throw 422 with a descriptive message.

---

## Key Design Decisions

1. **Services own all logic.** Controllers are thin — they only parse `req`, call a service, and return a response. No DB queries in controllers.

2. **Standard response format.** Every response goes through `apiResponse.js` helpers (`success`, `paginated`, `error`). Never call `res.json()` directly in controllers.

3. **Server-side price calculation.** Order totals are always computed from DB prices, never from client-submitted values.

4. **Atomic transactions.** Order creation and cancellation use `prisma.$transaction()` — inventory + order + cart changes are all-or-nothing.

5. **Soft deletes for products.** `isActive = false` instead of hard delete — preserves order history integrity (OrderItems still reference the product).

6. **Price snapshots in OrderItems.** `unitPrice` and `totalPrice` are captured at order creation time. Product price changes do not affect existing orders.

7. **Cart isolation.** Cart, orders, and addresses are scoped to `userId` — no user can access another's data.

8. **Guest cart merge strategy.** On login, the higher quantity wins for duplicate items; invalid items are skipped silently rather than rejecting the whole merge.

9. **Slug uniqueness.** `uniqueSlug()` in product service appends an incrementing counter until it finds a free slug. Never fails on duplicates.

10. **Inventory is decremented on order creation** (status: `pending`), not on payment. This prevents overselling. Cancellation at any pre-delivery stage restores inventory.

11. **Error handling.** `err.status` is used to set the HTTP status code. All errors propagate through `next(err)` to the global `errorHandler.js`. Stack traces are only shown in `development` environment.

12. **Admin promotion.** Admin role is set directly in the DB (`UPDATE users SET role = 'admin'`). No self-registration to admin.

---

## Test Coverage

Each module has a dedicated end-to-end test file using `node:http` + native `fetch`. Tests run against the live Neon DB on a dedicated port.

| Test File | Cases | Assertions |
|---|---|---|
| `tests/auth.test.js` | 10 | 35 |
| `tests/product.test.js` | 21 | 69 |
| `tests/cart.test.js` | 17 | 62 |
| `tests/order.test.js` | 24 | 63 |
| `tests/payment.test.js` | 14 | 14 |
| **Total** | **86** | **243** |

Run a test: `NODE_ENV=test node tests/auth.test.js`

---

## Environment Variables (`backend/.env`)

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=<256-bit hex>
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=           ← needed for Phase 8
RAZORPAY_KEY_SECRET=       ← needed for Phase 8
SENDGRID_API_KEY=          ← needed for Phase 10
CLOUDINARY_URL=            ← needed for Phase 9 (admin image upload)
```

---

## Development Phase Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Project restructuring — monorepo setup | ✅ Complete |
| Phase 2 | Backend foundation — Express, middleware, route scaffold | ✅ Complete |
| Phase 3 | Database setup — Prisma schema, migrations, 600-product seed | ✅ Complete |
| Phase 4 | Authentication — register, login, JWT, addresses | ✅ Complete |
| Phase 5 | Product APIs — list, search, filter, sort, CRUD | ✅ Complete |
| Phase 6 | Cart persistence — DB-backed cart, stock validation, guest merge | ✅ Complete |
| Phase 7 | Order management — lifecycle, state machine, inventory transactions | ✅ Complete |
| Phase 8 | Razorpay payments — initiate, verify, webhook | ✅ Complete |
| **Phase 9** | **Admin panel — dashboard, inventory management** | **⏳ Next** |
| Phase 10 | Testing — Jest unit + integration suite | ⏳ Pending |
| Phase 11 | Deployment — Vercel + Railway/Render + production config | ⏳ Pending |

---

## Phase 8 — What to Build Next

### Goal
Wire `payment.controller.js` and `payment.service.js` so the checkout flow works end-to-end with Razorpay in test mode.

### Files to create/modify
- `backend/src/services/payment.service.js` — create (new file)
- `backend/src/controllers/payment.controller.js` — replace 501 stubs
- `backend/tests/payment.test.js` — new test file

### Flow to implement

```
1. POST /payments/initiate  { orderId }
   ├── Verify order belongs to user and is in 'pending' status
   ├── Call Razorpay API: razorpay.orders.create({ amount: totalInPaise, currency: 'INR', receipt: orderId })
   ├── Store gatewayOrderId in payments table (status: pending)
   └── Return { razorpayOrderId, amount, currency, keyId } to frontend

2. POST /payments/verify  { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
   ├── Reconstruct HMAC-SHA256: hmac(razorpay_order_id + '|' + razorpay_payment_id, RAZORPAY_KEY_SECRET)
   ├── Compare with razorpay_signature using crypto.timingSafeEqual()
   ├── On match:
   │   ├── Update Payment: status=captured, gatewayPaymentId, paidAt=now
   │   └── Update Order: status=confirmed
   └── On mismatch: return 400 — do NOT confirm the order

3. POST /payments/webhook  (raw body — already set up in app.js)
   ├── Validate X-Razorpay-Signature header against webhook secret
   ├── Handle: payment.captured, payment.failed, refund.processed
   └── Always return 200 immediately (even if processing fails)
```

### Razorpay test credentials
Set in `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```
Test cards and UPI at: https://razorpay.com/docs/payments/payments/test-card-details/

### Critical security note
The HMAC signature check **must** use `crypto.timingSafeEqual()` to prevent timing attacks. Never use `===` to compare signatures.

### Order status after each step
```
Order created    → status: pending   (Phase 7, done)
Payment initiated → status: pending   (no change yet)
Payment verified  → status: confirmed (Phase 8)
```
