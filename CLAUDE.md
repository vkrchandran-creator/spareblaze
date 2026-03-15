# CLAUDE.md

## Project Overview

**SpareBlaze** is a premium automotive spare parts e-commerce platform built for the Indian market.
The platform focuses on selling genuine OEM and aftermarket automotive parts.

The project is a **full-stack monorepo** consisting of:
- A **frontend** — Vanilla HTML/CSS/JS served via Vercel (currently in Phase 1; product data still in JS files)
- A **backend** — Node.js/Express REST API with JWT auth, Prisma ORM, and PostgreSQL (Phases 2–8 built out)
- **Razorpay** is the payment gateway — all payment logic lives server-side in the backend

> Legacy frontend files (`script.js`) still contain an old PayU form submission flow that predates the Razorpay backend. That code is deprecated and will be removed when the frontend migrates to call the backend payment API (Phase 8 frontend integration).

---

# Tech Stack

### Backend

* Node.js + Express
* Prisma ORM → PostgreSQL
* JWT authentication (`jsonwebtoken` + `bcrypt`)
* **Razorpay** payment gateway (server-side: order creation, HMAC-SHA256 signature verification, webhook handling)
* `express-validator` for request validation
* `express-rate-limit` for rate limiting

### Frontend

* HTML5
* Vanilla CSS
* Vanilla JavaScript

### Styling

`style.css`

Uses CSS variables for theming.

Example:

```css
--color-primary: #e63900
```

Layout uses a combination of:

* Flexbox
* CSS Grid
* Responsive breakpoints

Main breakpoints:

* `max-width: 992px`
* `max-width: 768px`

---

# Project File Structure

Main Files

```
index.html
product.html
admin.html
style.css
script.js
cms-data.js
```

Product Data Sources

```
after-market-data-local.js
oem-data-local.js
refurbished-data-local.js
```

These files contain **JavaScript arrays of product objects** which are injected into the UI.

There is currently **no backend database**.

---

# Page Architecture

## Homepage

`index.html`

Contains:

* Hero image slider
* Car brand category grid
* Featured products grid
* Interactive search bar

---

## Product Page

`product.html`

The product page dynamically renders content based on **URL parameters**.

Example:

```
product.html?id=1
product.html?title=Brake+Pad
```

The script matches the parameter with the product dataset and builds the page dynamically.

Rendered components include:

* Product title
* Images
* Specifications
* Price
* MRP
* Savings badge

---

## Category Pages

Examples:

```
after-market.html
oem.html
refurbished.html
```

These pages render product listings using the corresponding dataset file.

---

## Admin Panel

`admin.html`

A lightweight CMS interface used to modify product datasets.

---

# Cart System

The cart is implemented entirely in **client-side JavaScript** inside `script.js`.

Cart state:

```javascript
let cart = []
```

---

## Cart Functions

### addToCart(productData)

Adds a product to the cart or increments quantity if already present.

Also opens the slide-over cart UI.

---

### toggleCartItem(productId, btnElement)

Toggles the add/remove state on product cards.

---

### updateQuantity(productId, change)

Updates product quantity.

Triggers UI re-render.

---

### removeFromCart(productId)

Removes the product from the cart.

---

### updateCartUI()

Responsible for:

* Rendering cart items
* Updating total price
* Enabling/disabling checkout button

---

# Checkout System

Checkout is implemented via a **modal overlay** on:

* `index.html`
* `product.html`

HTML structure:

```
<div class="checkout-modal">
```

---

## Form Validation

The checkout form validates:

Name
Email (RegEx)
Phone (10 digits)
Address

---

## Payment Gateway

The payment system uses **Razorpay** (best-in-class for Indian market — supports UPI, cards, wallets, NetBanking).

### Backend payment flow (`backend/src/`)

| Step | File | Description |
|------|------|-------------|
| 1. Initiate | `services/payment.service.js → initiate()` | Creates a Razorpay order (amount in paise) and stores `gatewayOrderId` in the `payments` DB table |
| 2. Frontend modal | `frontend JS (to be built)` | Opens Razorpay checkout modal using `razorpayOrderId`, `amount`, `currency`, `keyId` returned from Step 1 |
| 3. Verify | `services/payment.service.js → verify()` | Verifies the HMAC-SHA256 signature using `crypto.timingSafeEqual`; on match updates payment to `captured` and order to `confirmed` |
| 4. Webhook | `services/payment.service.js → handleWebhook()` | Handles async Razorpay events: `payment.captured`, `payment.failed`, `refund.processed` |

### API endpoints

```
POST /api/v1/payments/initiate   — Auth required — creates Razorpay order
POST /api/v1/payments/verify     — Auth required — verifies signature, confirms order
POST /api/v1/payments/webhook    — Public (Razorpay IP) — handles async events
```

### Environment variables required

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

**Security:** Credentials are stored only in server environment variables. The `RAZORPAY_KEY_SECRET` never leaves the backend. The frontend only receives `RAZORPAY_KEY_ID` (public key) to open the checkout modal.

> **Note:** The legacy `script.js` in the frontend still contains an old PayU form-post flow. This is dead code — it will be removed when the frontend migrates to the Razorpay backend API (Phase 8).

---

# Product Page Enhancements

Recent updates include:

* Dynamic price calculations (MRP vs current price)
* Savings badge
* Cart sidebar integration
* Overlay cart UI

---

## Buy Now Logic

`window.buyNow()`:

1. Adds the product to the cart
2. Automatically opens the checkout modal
3. Allows instant checkout

---

# Styling and UI Constraints

## Z-Index Issues

Third-party scripts like **Tidio Chat** are injected asynchronously.

A MutationObserver in `script.js` temporarily hides the Tidio widget when the cart modal is open.

---

## Responsive Behavior

Grid layouts collapse at:

* 992px
* 768px

Mobile layout typically becomes a **single-column layout**.

---

# Typical Development Tasks

When working on this codebase, Claude should prioritize:

1. Updating CSS styles to match new designs
2. Adding frontend logic to `script.js`
3. Extending cart functionality (e.g., promo codes)
4. Updating product datasets
5. Generating static HTML category pages using scripts

---

# Important Constraints

* The **backend is built** (`backend/src/`) but not yet connected to the frontend (Phase 2–8 complete server-side; frontend integration pending)
* The frontend still loads product data from local JS files — this will be replaced by API calls in Phase 5
* The frontend cart is still in-memory (`let cart = []`) — persistent DB cart is designed and ready in Phase 6
* The old PayU frontend code in `script.js` is **deprecated** — do not extend it; all new payment work goes through the Razorpay backend API

---

# Backend File Map

```
backend/src/
├── server.js                    Entry point
├── app.js                       Express app (CORS, Helmet, middleware)
├── config/
│   ├── db.js                    Prisma client
│   └── env.js                   Validated env vars
├── routes/                      auth, product, cart, order, payment, admin
├── controllers/                 Parse req → call service → send response
├── services/                    Business logic + Prisma queries
│   └── payment.service.js       Razorpay: initiate / verify / webhook
├── middleware/
│   ├── auth.middleware.js        JWT verification
│   ├── admin.middleware.js       Role check
│   ├── validate.middleware.js    express-validator errors
│   └── rateLimit.middleware.js
└── utils/
    ├── apiResponse.js            Standardised { success, message, data }
    ├── generateToken.js
    └── hashPassword.js
```

---

# Typical Development Tasks

When working on this codebase:

1. **Backend work** → edit files under `backend/src/`; follow controller → service → Prisma pattern
2. **Frontend styling** → edit `frontend/css/style.css`
3. **Frontend logic** → edit files under `frontend/js/`; do NOT extend legacy `script.js` PayU code
4. **Product data** (interim) → edit `frontend/js/data/*.js` files until Phase 5 migration
5. **Payment changes** → edit `backend/src/services/payment.service.js` only; keep credentials in `.env`
6. **After any change** → update the relevant documentation file (`CLAUDE.md`, `ARCHITECTURE.md`, `README.md`)