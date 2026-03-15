# SpareBlaze — Production Architecture & Development Blueprint

> **Document Type:** Technical Architecture & Engineering Blueprint
> **Version:** 1.0
> **Status:** Planning Phase
> **Audience:** Engineering Team

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Project Folder Structure](#2-project-folder-structure)
3. [File Migration Guide](#3-file-migration-guide)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Authentication System](#7-authentication-system)
8. [Cart System](#8-cart-system)
9. [Order Management](#9-order-management)
10. [Payment System](#10-payment-system)
11. [Admin System](#11-admin-system)
12. [Security](#12-security)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Development Roadmap](#15-development-roadmap)

---

## 1. System Architecture

### High-Level Overview

SpareBlaze upgrades from a static frontend into a decoupled, full-stack e-commerce platform. The architecture follows a **client-server separation** model where the frontend and backend are independent deployable units communicating via a REST API.

```
                          ┌─────────────────────────────────────────────┐
                          │              CLIENT LAYER                   │
                          │                                             │
                          │   Browser (HTML / CSS / Vanilla JS)         │
                          │   Hosted on → Vercel                        │
                          └──────────────────┬──────────────────────────┘
                                             │ HTTPS REST API calls
                                             │
                          ┌──────────────────▼──────────────────────────┐
                          │              API LAYER                      │
                          │                                             │
                          │   Node.js + Express                         │
                          │   JWT Auth Middleware                       │
                          │   Route Controllers                         │
                          │   Business Logic Services                   │
                          │   Hosted on → Railway / Render              │
                          └──────────────────┬──────────────────────────┘
                                             │ Prisma ORM queries
                                             │
                          ┌──────────────────▼──────────────────────────┐
                          │            DATABASE LAYER                   │
                          │                                             │
                          │   PostgreSQL                                │
                          │   Hosted on → Supabase / Neon               │
                          └─────────────────────────────────────────────┘
                                             │
                          ┌──────────────────▼──────────────────────────┐
                          │          EXTERNAL SERVICES                  │
                          │                                             │
                          │   Razorpay / PayU  → Payment Gateway        │
                          │   Cloudinary / S3  → Image Storage          │
                          │   SendGrid / Resend→ Transactional Email    │
                          └─────────────────────────────────────────────┘
```

### Architecture Principles

| Principle | Implementation |
|---|---|
| Separation of Concerns | Frontend, backend, and database are independent units |
| Stateless API | JWT tokens handle auth — no server-side sessions |
| Single Source of Truth | All product and order data lives in PostgreSQL |
| API-First | Frontend consumes the same API an external app would |
| Secure by Default | Auth, input validation, and rate limiting on every route |

---

## 2. Project Folder Structure

The current flat single-folder structure is reorganized into a clean monorepo layout.

```
spareblaze/
│
├── frontend/                        # All client-side code
│   ├── public/
│   │   ├── images/                  # Static product/brand images
│   │   └── favicon.ico
│   ├── pages/
│   │   ├── index.html               # Homepage
│   │   ├── product.html             # Product detail page
│   │   ├── category.html            # Generic category listing page
│   │   ├── cart.html                # Cart page
│   │   ├── checkout.html            # Checkout page
│   │   ├── login.html               # Login / Register
│   │   ├── account.html             # User account / order history
│   │   └── admin/
│   │       ├── index.html           # Admin dashboard
│   │       ├── products.html        # Product management
│   │       ├── orders.html          # Order management
│   │       └── inventory.html       # Inventory management
│   ├── css/
│   │   ├── style.css                # Global styles
│   │   ├── components.css           # Reusable UI components
│   │   └── admin.css                # Admin panel styles
│   ├── js/
│   │   ├── api.js                   # Centralized API client (fetch wrapper)
│   │   ├── auth.js                  # Login, register, JWT token handling
│   │   ├── cart.js                  # Cart UI logic (reads from API)
│   │   ├── checkout.js              # Checkout flow and payment init
│   │   ├── product.js               # Product page rendering
│   │   ├── search.js                # Search functionality
│   │   └── admin/
│   │       ├── dashboard.js
│   │       ├── products.js
│   │       └── orders.js
│   └── vercel.json                  # Vercel deployment config
│
├── backend/                         # Node.js / Express API
│   ├── src/
│   │   ├── server.js                # App entry point
│   │   ├── app.js                   # Express app setup
│   │   ├── config/
│   │   │   ├── db.js                # Prisma client instance
│   │   │   ├── env.js               # Validated env variables
│   │   │   └── constants.js         # App-wide constants
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── search.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js      # JWT creation, password hashing
│   │   │   ├── product.service.js   # Product queries and filtering
│   │   │   ├── cart.service.js      # Cart logic
│   │   │   ├── order.service.js     # Order lifecycle
│   │   │   ├── payment.service.js   # Payment gateway integration
│   │   │   ├── inventory.service.js # Stock management
│   │   │   └── email.service.js     # Order confirmation emails
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── admin.middleware.js  # Admin role check
│   │   │   ├── validate.middleware.js # Request body validation
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── errorHandler.js      # Global error handler
│   │   └── utils/
│   │       ├── hashPassword.js
│   │       ├── generateToken.js
│   │       └── apiResponse.js       # Standardized response format
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.js                  # Data seeding script
│   │   └── migrations/              # Auto-generated migration files
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── api/
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── database/
│   ├── seeds/
│   │   ├── products.seed.js         # Seed from existing JS data files
│   │   ├── categories.seed.js
│   │   └── users.seed.js
│   └── docs/
│       └── schema-diagram.md        # ERD and table documentation
│
├── docs/
│   ├── ARCHITECTURE.md              # This document
│   ├── API.md                       # Full API reference
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── CONTRIBUTING.md
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml           # Local full-stack dev environment
│
├── .gitignore
├── .env.example
└── README.md                        # Project overview and quick start
```

---

## 3. File Migration Guide

This section maps every existing file to its new location and explains the transformation required.

| Current File | New Location | Action Required |
|---|---|---|
| `index.html` | `frontend/pages/index.html` | Remove inline product data; fetch from API |
| `product.html` | `frontend/pages/product.html` | Replace JS data lookups with API call to `GET /products/:id` |
| `admin.html` | `frontend/pages/admin/index.html` | Rebuild to consume admin API endpoints |
| `style.css` | `frontend/css/style.css` | Move as-is; split admin styles into `admin.css` |
| `script.js` | Split into `frontend/js/*.js` | Decompose into `cart.js`, `checkout.js`, `product.js`, `auth.js` |
| `cms-data.js` | `database/seeds/` | Convert arrays into Prisma seed script to populate PostgreSQL |
| `after-market-data-local.js` | `database/seeds/products.seed.js` | Parse and insert into `products` table with `category = 'aftermarket'` |
| `oem-data-local.js` | `database/seeds/products.seed.js` | Parse and insert with `category = 'oem'` |
| `refurbished-data-local.js` | `database/seeds/products.seed.js` | Parse and insert with `category = 'refurbished'` |

### Migration Strategy

1. The existing JS product arrays are the source of truth for the initial seed
2. Write a one-time Node.js script that reads the three JS data files and inserts all products into PostgreSQL via Prisma
3. After seeding, the JS data files are deprecated — all reads go through the API
4. The frontend JS (`script.js`) is decomposed into focused modules, each communicating with the backend via a shared `api.js` fetch client

---

## 4. Backend Architecture

### Layer Responsibilities

```
Request → Route → Middleware → Controller → Service → Database
                                                         │
Response ←────────────────────────────────────────────────
```

| Layer | File Pattern | Responsibility |
|---|---|---|
| **Routes** | `*.routes.js` | Define URL paths and HTTP methods; attach middleware |
| **Middleware** | `*.middleware.js` | Auth checks, rate limiting, input validation, logging |
| **Controllers** | `*.controller.js` | Parse request, call service, send HTTP response |
| **Services** | `*.service.js` | Business logic, database queries via Prisma |
| **Utils** | `utils/` | Shared helpers: token generation, password hashing, response formatting |

### Request Lifecycle Example

```
POST /api/orders

1. rateLimit.middleware.js     → Check request rate
2. auth.middleware.js          → Verify JWT, attach req.user
3. validate.middleware.js      → Validate request body schema
4. order.controller.js         → Extract data, call service
5. order.service.js            → Check cart, verify stock, create order record
6. inventory.service.js        → Decrement product stock
7. email.service.js            → Send confirmation email
8. order.controller.js         → Return 201 with order ID
```

### Environment Variables (`.env`)

```
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/spareblaze

# JWT
JWT_SECRET=<256-bit-secret>
JWT_EXPIRES_IN=7d

# Payment
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email
SENDGRID_API_KEY=

# Storage
CLOUDINARY_URL=
```

---

## 5. Database Design

### Entity Relationship Overview

```
users ──< orders ──< order_items >── products
  │                                      │
  └──< cart_items >── products      inventory
                                         │
                                    categories
                          orders ──< payments
```

### Table Definitions

#### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR(100) | |
| `email` | VARCHAR(255) UNIQUE | |
| `password_hash` | TEXT | bcrypt hashed |
| `phone` | VARCHAR(15) | |
| `role` | ENUM('customer','admin') | Default: customer |
| `is_verified` | BOOLEAN | Email verification |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

#### `categories`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR(100) | e.g. OEM, Aftermarket, Refurbished |
| `slug` | VARCHAR(100) UNIQUE | URL-safe identifier |
| `parent_id` | UUID FK → categories | Supports sub-categories |
| `created_at` | TIMESTAMP | |

#### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `title` | VARCHAR(255) | |
| `slug` | VARCHAR(255) UNIQUE | SEO-friendly URL |
| `description` | TEXT | |
| `sku` | VARCHAR(100) UNIQUE | Stock Keeping Unit |
| `brand` | VARCHAR(100) | e.g. Bosch, Minda |
| `category_id` | UUID FK → categories | |
| `price` | DECIMAL(10,2) | Selling price |
| `mrp` | DECIMAL(10,2) | Maximum Retail Price |
| `images` | TEXT[] | Array of image URLs |
| `specifications` | JSONB | Flexible key-value specs |
| `compatible_vehicles` | JSONB | Car make/model/year compatibility |
| `is_active` | BOOLEAN | Soft delete / deactivation |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

#### `inventory`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products UNIQUE | |
| `quantity` | INTEGER | Current stock level |
| `low_stock_threshold` | INTEGER | Alert threshold |
| `updated_at` | TIMESTAMP | |

#### `cart_items`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `product_id` | UUID FK → products | |
| `quantity` | INTEGER | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| UNIQUE | `(user_id, product_id)` | One row per product per user |

#### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `status` | ENUM | See Order Lifecycle below |
| `total_amount` | DECIMAL(10,2) | |
| `shipping_address` | JSONB | Snapshot of address at order time |
| `notes` | TEXT | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Order Status ENUM:** `pending` → `confirmed` → `processing` → `shipped` → `delivered` → `cancelled` → `refunded`

#### `order_items`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders | |
| `product_id` | UUID FK → products | |
| `quantity` | INTEGER | |
| `unit_price` | DECIMAL(10,2) | Price snapshot at purchase time |
| `total_price` | DECIMAL(10,2) | |

#### `payments`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders UNIQUE | |
| `gateway` | VARCHAR(50) | 'razorpay' or 'payu' |
| `gateway_order_id` | VARCHAR(255) | ID from payment gateway |
| `gateway_payment_id` | VARCHAR(255) | ID after payment capture |
| `gateway_signature` | TEXT | Signature from gateway for verification |
| `amount` | DECIMAL(10,2) | |
| `currency` | VARCHAR(10) | Default: INR |
| `status` | ENUM('pending','captured','failed','refunded') | |
| `paid_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |

#### `addresses`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `label` | VARCHAR(50) | e.g. Home, Office |
| `line1` | TEXT | |
| `line2` | TEXT | |
| `city` | VARCHAR(100) | |
| `state` | VARCHAR(100) | |
| `pincode` | VARCHAR(10) | |
| `is_default` | BOOLEAN | |

---

## 6. API Design

All API endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create new user account |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/logout` | Auth | Invalidate token |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/reset-password` | Public | Reset with token |
| GET | `/auth/me` | Auth | Get current user profile |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List all products (paginated, filterable) |
| GET | `/products/:id` | Public | Get single product by ID or slug |
| GET | `/products/search` | Public | Full-text product search |
| GET | `/products/category/:slug` | Public | Products by category |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Soft-delete product |

**Query Parameters for `GET /products`:**
```
?category=oem
?brand=Bosch
?minPrice=100&maxPrice=5000
?compatible=Maruti+Swift+2019
?sort=price_asc|price_desc|newest
?page=1&limit=20
```

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Auth | Get user's cart |
| POST | `/cart/add` | Auth | Add item to cart |
| PUT | `/cart/update` | Auth | Update item quantity |
| DELETE | `/cart/remove/:productId` | Auth | Remove item from cart |
| DELETE | `/cart/clear` | Auth | Clear entire cart |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Auth | Create order from cart |
| GET | `/orders` | Auth | Get user's order history |
| GET | `/orders/:id` | Auth | Get single order detail |
| PUT | `/orders/:id/cancel` | Auth | Cancel an order |
| GET | `/admin/orders` | Admin | List all orders |
| PUT | `/admin/orders/:id/status` | Admin | Update order status |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/initiate` | Auth | Create payment order on gateway |
| POST | `/payments/verify` | Auth | Verify payment signature post-payment |
| POST | `/payments/webhook` | Public | Gateway webhook for async updates |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Stats: revenue, orders, products |
| GET | `/admin/inventory` | Admin | View stock levels |
| PUT | `/admin/inventory/:productId` | Admin | Update stock quantity |
| GET | `/admin/users` | Admin | List all users |

### Standard API Response Format

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 345,
    "totalPages": 18
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "JWT token is missing or invalid",
  "statusCode": 401
}
```

---

## 7. Authentication System

### JWT Flow

```
1. User submits email + password to POST /auth/login
2. Server verifies password against bcrypt hash in DB
3. Server generates a signed JWT containing { userId, role, iat, exp }
4. JWT returned to client in HTTP response body
5. Client stores JWT in localStorage (or httpOnly cookie for higher security)
6. All subsequent authenticated requests include:
   Authorization: Bearer <token>
7. auth.middleware.js verifies token signature and expiry on every protected route
8. req.user is populated with decoded token payload
```

### Security Considerations

| Concern | Solution |
|---|---|
| Password storage | `bcrypt` with salt rounds ≥ 12 |
| Token secret | Minimum 256-bit random secret |
| Token expiry | Short-lived access tokens (7 days); plan for refresh tokens |
| Admin access | Separate role check middleware (`admin.middleware.js`) after auth |
| Brute force | Rate limiting on `/auth/login` (max 5 attempts per 15 min per IP) |
| HTTPS | Enforced in production; all tokens transmitted over TLS only |
| Token in storage | For higher security, use `httpOnly` cookies instead of `localStorage` |

### User Roles

| Role | Access |
|---|---|
| `customer` | Cart, orders, profile, product browsing |
| `admin` | All customer access + product CRUD, order management, inventory |

---

## 8. Cart System

### Architecture: Database-Persistent Cart

The in-memory cart (`let cart = []`) is replaced with a persistent cart stored in the `cart_items` table.

### Cart Behavior

```
Guest user:
  → Cart stored in localStorage (temporary)
  → On login/register → cart is merged with their DB cart

Logged-in user:
  → Every cart action (add/update/remove) calls the API
  → Cart state is always fetched from DB on page load
  → Cart persists across sessions and devices
```

### Merge Strategy on Login

When a guest user logs in with items in `localStorage`:
1. Frontend sends current guest cart to `POST /cart/merge`
2. Backend compares guest cart items with DB cart
3. For duplicate products: take the higher quantity
4. Guest cart items are upserted into `cart_items` table
5. `localStorage` cart is cleared

### Cart Item Validation

Before adding to cart, the API:
- Verifies product exists and `is_active = true`
- Verifies requested quantity does not exceed `inventory.quantity`
- Returns stock availability in the response

---

## 9. Order Management

### Order Lifecycle

```
[Cart] → POST /orders → [Order: pending]
                              │
                         POST /payments/initiate
                              │
                    User completes payment on Razorpay
                              │
                         POST /payments/verify
                              │
                    Signature verified ✓ → [Order: confirmed]
                    Signature failed  ✗ → [Order: pending] (retry)
                              │
                    Admin updates → [Order: processing]
                              │
                    Admin updates → [Order: shipped]  + tracking info
                              │
                              └─────────────────→ [Order: delivered]
                                                 [Order: cancelled]
                                                 [Order: refunded]
```

### Order Creation Logic (`order.service.js`)

1. Fetch all cart items for the authenticated user
2. Validate each product is still active and in stock
3. Lock inventory rows to prevent race conditions (PostgreSQL `SELECT FOR UPDATE`)
4. Calculate total amount server-side — never trust client-submitted totals
5. Create `orders` record with status `pending`
6. Create `order_items` records with price snapshots
7. Decrement `inventory.quantity` for each product
8. Clear the user's `cart_items`
9. Return the new order ID to the frontend

### Email Notifications

Triggered by `email.service.js`:
- Order confirmation email on `confirmed`
- Shipping notification email on `shipped` (include tracking number)

---

## 10. Payment System

### Razorpay Integration (Recommended for India)

```
Step 1 — Initiate Payment
  Frontend: POST /payments/initiate { orderId }
  Backend:  Calls Razorpay API → creates a Razorpay Order
  Backend:  Stores gateway_order_id in payments table
  Backend:  Returns { razorpayOrderId, amount, currency, keyId } to frontend

Step 2 — Frontend Payment UI
  Frontend: Opens Razorpay checkout modal using returned data
  User:     Completes payment (UPI / Card / NetBanking / Wallet)
  Razorpay: Returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }

Step 3 — Verify Payment (Critical Security Step)
  Frontend: POST /payments/verify { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
  Backend:  Recreates HMAC-SHA256 signature using:
            HMAC(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
  Backend:  Compares generated signature with razorpay_signature
  Match ✓ → Update payment status to 'captured', update order to 'confirmed'
  No match ✗ → Return 400 error, flag for investigation

Step 4 — Webhook (Async Backup)
  Razorpay: Sends POST to /payments/webhook for async events
  Backend:  Validates webhook signature with shared secret
  Backend:  Handles payment.captured, payment.failed, refund.processed
```

### Why Server-Side Verification is Mandatory

The client cannot be trusted to confirm payment success. A malicious user could send a fake "payment successful" signal. The HMAC signature check on the backend — using the secret key only the server knows — is the only reliable confirmation that Razorpay processed a real payment.

---

## 11. Admin System

### Admin Dashboard Features

| Feature | Description |
|---|---|
| Revenue Overview | Total revenue today / this week / this month |
| Order Stats | Count by status (pending, confirmed, shipped, delivered) |
| Low Stock Alerts | Products where `quantity ≤ low_stock_threshold` |
| Product Management | Create, edit, deactivate products; upload images |
| Order Management | View all orders, update status, add tracking info |
| Inventory Management | Update stock quantities per product |
| User Management | View registered users |

### Admin Access Control

- Admin routes are protected by two middleware layers:
  1. `auth.middleware.js` — valid JWT required
  2. `admin.middleware.js` — `req.user.role === 'admin'` required
- Admin users are set directly in the database; no self-registration to admin role
- All admin actions are logged with timestamp and `userId` for auditability

### Product Image Uploads

Images are uploaded via the admin panel to **Cloudinary** (or AWS S3), not stored in the database. The `products.images` column stores an array of public image URLs returned by the storage service.

---

## 12. Security

### Application Security Checklist

| Category | Practice |
|---|---|
| **Authentication** | bcrypt password hashing (rounds ≥ 12), JWT with expiry |
| **Authorization** | Role-based middleware on every protected route |
| **Input Validation** | Validate all request bodies using `express-validator` or `zod` |
| **SQL Injection** | Fully prevented by Prisma's parameterized queries |
| **XSS** | Sanitize all user input before storing; use `Content-Security-Policy` headers |
| **CSRF** | For cookie-based auth: use CSRF tokens; for Bearer JWT: CSRF is not applicable |
| **Rate Limiting** | `express-rate-limit` on all public endpoints; stricter on `/auth` |
| **CORS** | Restrict `Access-Control-Allow-Origin` to frontend domain only |
| **Secrets** | Never commit `.env` files; use platform environment variable managers |
| **HTTPS** | Enforce HTTPS in production via hosting platform |
| **Helmet.js** | Set secure HTTP headers (X-Frame-Options, X-Content-Type-Options, etc.) |
| **Payment Data** | Never store raw card data; delegate entirely to Razorpay |
| **Error Exposure** | Never return stack traces or DB errors to the client in production |
| **Dependency Audit** | Run `npm audit` regularly; use Dependabot or Snyk |
| **Order Amounts** | Always calculate totals server-side; never trust client-submitted prices |

---

## 13. Testing Strategy

### Three-Layer Testing Approach

#### Layer 1 — Unit Tests
- **What:** Individual service functions and utility helpers
- **Tool:** Jest
- **Examples:**
  - `auth.service.generateToken()` returns a valid JWT
  - `order.service.calculateTotal()` computes correct amounts
  - `payment.service.verifySignature()` correctly validates/rejects signatures
- **Location:** `backend/tests/unit/`

#### Layer 2 — Integration Tests
- **What:** Service + database interaction (against a test PostgreSQL instance)
- **Tool:** Jest + Prisma test client
- **Examples:**
  - Creating an order decrements inventory correctly
  - Adding a duplicate cart item increments quantity instead of creating a new row
  - Cancelling an order restores inventory
- **Location:** `backend/tests/integration/`

#### Layer 3 — API Tests (End-to-End API)
- **What:** Full HTTP request/response testing against a running server
- **Tool:** Supertest + Jest
- **Examples:**
  - `POST /auth/login` with wrong password returns 401
  - `POST /orders` without auth returns 403
  - Complete checkout flow: register → add to cart → create order → verify payment
- **Location:** `backend/tests/api/`

### Test Coverage Targets

| Layer | Target Coverage |
|---|---|
| Unit | ≥ 80% of service functions |
| Integration | All database-critical flows |
| API | All documented endpoints |

### Testing Environment

- Tests run against a separate `spareblaze_test` PostgreSQL database
- Database is reset between test suites using Prisma `migrate reset`
- No production data or payment gateway is touched during tests; use Razorpay test mode

---

## 14. Deployment Architecture

### Infrastructure Map

| Component | Service | Notes |
|---|---|---|
| Frontend | **Vercel** | Auto-deploys from `main` branch; global CDN |
| Backend API | **Railway** or **Render** | Managed Node.js hosting with auto-scaling |
| Database | **Supabase** or **Neon** | Managed PostgreSQL with connection pooling |
| Image Storage | **Cloudinary** | Free tier sufficient for initial launch |
| Email | **SendGrid** or **Resend** | Transactional emails (order confirmations) |

### Deployment Configuration

#### Frontend (Vercel — `frontend/vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/pages/$1" }],
  "env": {
    "API_BASE_URL": "https://api.spareblaze.com"
  }
}
```

#### Backend (Railway/Render)
- Set all environment variables in the platform dashboard
- Run `prisma migrate deploy` as part of the build command, not at runtime
- Enable health check endpoint `GET /health` for uptime monitoring

#### Database (Supabase/Neon)
- Use connection pooling (PgBouncer) for production — Supabase provides this built-in
- Enable automated daily backups
- Run `prisma migrate deploy` from the backend's CI/CD pipeline

### CI/CD Pipeline (GitHub Actions — recommended)

```
On push to main:
  1. Run linter (ESLint)
  2. Run test suite (Jest)
  3. If tests pass:
     a. Deploy backend to Railway/Render
     b. Run database migrations
     c. Deploy frontend to Vercel (auto-triggered by Vercel GitHub integration)
```

### Environment Strategy

| Environment | Purpose |
|---|---|
| `development` | Local development with `docker-compose` (PostgreSQL in container) |
| `test` | Isolated test DB, Razorpay test mode, no real emails |
| `production` | Supabase/Neon DB, Razorpay live mode, real email delivery |

---

## 15. Development Roadmap

### Phase 1 — Project Restructuring
**Goal:** Reorganize file system, set up tooling, establish the new monorepo structure.

- Create the new folder structure as defined in Section 2
- Move all existing HTML/CSS/JS files to `frontend/`
- Initialize `backend/` as a new Node.js project (`npm init`)
- Set up ESLint, Prettier, `.gitignore`
- Set up `docker-compose.yml` for local PostgreSQL
- Initialize Git repository with proper branch strategy (`main`, `dev`, `feature/*`)

**Deliverable:** Clean project structure that compiles and runs locally.

---

### Phase 2 — Backend Foundation
**Goal:** Working Express server with organized architecture.

- Set up `app.js` with Express, CORS, Helmet, JSON body parser
- Implement global error handler (`errorHandler.js`)
- Implement standardized API response utility (`apiResponse.js`)
- Create `GET /health` endpoint
- Wire up route files (empty controllers to start)
- Configure environment variable validation

**Deliverable:** Express server running on port 5000 with all routes scaffolded.

---

### Phase 3 — Database Setup
**Goal:** PostgreSQL connected, all tables created, existing data migrated.

- Connect Prisma to PostgreSQL (local Docker instance)
- Write `schema.prisma` with all tables from Section 5
- Run `prisma migrate dev` to generate initial migration
- Write seed scripts to import existing JS product data into the database
- Run and verify seed — all products should be queryable

**Deliverable:** PostgreSQL database populated with existing product catalog.

---

### Phase 4 — Authentication
**Goal:** Working JWT-based user registration and login.

- Implement `POST /auth/register` — validate, hash password, create user
- Implement `POST /auth/login` — verify password, return JWT
- Implement `auth.middleware.js` — verify JWT on protected routes
- Implement `admin.middleware.js` — role check
- Implement `GET /auth/me` — return current user profile
- Rate limit auth endpoints

**Deliverable:** Users can register, log in, and access protected endpoints.

---

### Phase 5 — Product APIs
**Goal:** All product data served from PostgreSQL via REST API.

- Implement `GET /products` with filtering, sorting, and pagination
- Implement `GET /products/:id`
- Implement `GET /products/search` (PostgreSQL full-text search using `tsvector`)
- Implement `GET /products/category/:slug`
- Implement admin CRUD endpoints for products
- Update frontend JS to fetch products from API instead of local JS files

**Deliverable:** Frontend renders all products from the API. Local JS data files are deprecated.

---

### Phase 6 — Persistent Cart
**Goal:** Cart stored in database, synced across sessions.

- Implement all `GET|POST|PUT|DELETE /cart` endpoints
- Implement cart merge on login (`POST /cart/merge`)
- Update frontend `cart.js` to call API for all cart operations
- Remove `localStorage`-only cart logic
- Implement stock validation on add-to-cart

**Deliverable:** Cart persists on login across devices. Guest cart merges on login.

---

### Phase 7 — Order Management
**Goal:** Users can place and track orders.

- Implement `POST /orders` with full validation and inventory lock
- Implement `GET /orders` and `GET /orders/:id`
- Implement `PUT /orders/:id/cancel`
- Implement admin order listing and status update endpoints
- Update frontend checkout page to call order API

**Deliverable:** Full order placement flow working end-to-end (payment pending).

---

### Phase 8 — Payment Integration
**Goal:** Real payment processing with verified callbacks.

- Integrate Razorpay SDK into backend
- Implement `POST /payments/initiate` — create Razorpay order
- Implement `POST /payments/verify` — HMAC signature verification
- Implement `POST /payments/webhook` — handle async events
- Update frontend checkout to open Razorpay modal and call verify endpoint
- Test full payment flow in Razorpay test mode

**Deliverable:** Complete checkout → payment → order confirmation flow working with Razorpay test credentials.

---

### Phase 9 — Admin Panel
**Goal:** Functional admin dashboard for business operations.

- Build admin frontend pages (`frontend/pages/admin/`)
- Implement product creation and editing forms with image upload to Cloudinary
- Implement inventory management interface
- Implement order management with status updates
- Implement admin dashboard stats endpoint
- Protect all admin pages with client-side role check + server-side auth middleware

**Deliverable:** Admin can manage products, inventory, and orders through the web UI.

---

### Phase 10 — Testing
**Goal:** Test coverage across all critical paths.

- Write unit tests for all service functions
- Write integration tests for order + inventory + payment flows
- Write API tests for all endpoints (happy paths and error cases)
- Set up CI pipeline to run tests automatically on every push
- Achieve coverage targets defined in Section 13

**Deliverable:** Test suite passing in CI; all critical business flows covered.

---

### Phase 11 — Deployment
**Goal:** Production system live and stable.

- Provision Supabase/Neon PostgreSQL database
- Deploy backend to Railway or Render; set all environment variables
- Run `prisma migrate deploy` against production database
- Run production data seed
- Deploy frontend to Vercel; connect to production API URL
- Switch Razorpay credentials to live mode
- Configure custom domain (`spareblaze.com`, `api.spareblaze.com`)
- Set up uptime monitoring and error alerting
- Enable automated database backups

**Deliverable:** SpareBlaze is live in production and serving real users.

---

## Appendix: Technology Decisions Summary

| Decision | Choice | Reason |
|---|---|---|
| Backend framework | Express.js | Minimal, flexible, widely supported in India's dev ecosystem |
| ORM | Prisma | Type-safe queries, excellent migration tooling, great DX |
| Auth | JWT | Stateless, works seamlessly with decoupled frontend |
| Payment | Razorpay | Best-in-class for Indian market; supports UPI, wallets, cards |
| Database hosting | Supabase | Generous free tier, built-in connection pooling, Indian region available |
| Frontend hosting | Vercel | Zero-config deployment, global CDN, free tier |
| Image storage | Cloudinary | Free tier, easy URL-based transformations for thumbnails |
| Search | PostgreSQL full-text | Sufficient for initial scale; can upgrade to Algolia/Meilisearch later |

---

*This document is a living blueprint. Update it as architectural decisions are made or revised during development.*
