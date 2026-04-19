# AGENTS.md

## Project Overview

**SpareBlaze** is a premium automotive spare parts e-commerce platform built for the Indian market.
The platform focuses on selling genuine OEM and aftermarket automotive parts.

The project is a **full-stack monorepo** consisting of:
- A **frontend** — Vanilla HTML/CSS/JS served via Vercel (currently in Phase 1; product data still in JS files)
- A **backend** — Node.js/Express REST API with JWT auth, Prisma ORM, and PostgreSQL (Phases 2–8 built out)
- **PayU** is the payment gateway — hash generation and callback verification live server-side in the backend; the frontend POSTs directly to PayU using params returned by the backend.

---

# Tech Stack

### Backend

* Node.js + Express
* Prisma ORM → PostgreSQL
* JWT authentication (`jsonwebtoken` + `bcrypt`)
* **PayU** payment gateway (server-side: SHA-512 hash generation, response hash verification; redirect-based flow)
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

## Admin Panel / CMS

`frontend/pages/admin/index.html`

A full-featured, client-side CMS that stores all content in `localStorage` (key: `sb_cms_data`).

### CMS Architecture (3-file pattern)
For each content section, changes coordinate across:
1. **`frontend/js/data/cms-data.js`** — `DEFAULT_DATA` + merge guard + `applyXxx()` function (called in `applyAll()`)
2. **`frontend/js/admin/admin.js`** — `DEFAULT_DATA` mirror + `renderXxx()` / `collectXxx()` (wired into `renderAll()` / `collectAll()`)
3. **`frontend/pages/admin/index.html`** — Sidebar nav item + panel div with editor form

### CMS-Managed Sections
| Section | Data Key | Target Page |
|---------|----------|-------------|
| Hero Slider | `slides` | Homepage |
| Trust Bar | `trustBar` | Homepage |
| Car Brands | `carBrands` | Homepage |
| Top Categories | `topCategories` | Homepage |
| Featured Products | `featuredProducts` | Homepage |
| CTA Banner | `ctaBanner` | Homepage |
| Testimonials | `testimonials` | Homepage |
| Footer | `footer` | All pages |
| Navigation | `navLinks` | All pages |
| Identity (Logo/Meta) | `identity` | All pages |
| Theme Colors | `theme` | All pages |
| Category Pages | `categories` | Category listing pages |
| FAQ Page | `faqPage` | faq.html |
| Contact Us | `contactPage` | contact-us.html |
| Return Policy | `returnPolicyPage` | return-policy.html |
| Shipping Info | `shippingPage` | shipping-info.html |
| Size Guide | `sizeGuidePage` | size-guide.html |
| Track Order | `trackOrderPage` | track-order.html |
| Brand Logos | `brandLogos` | Homepage carousel |

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

The payment system uses **PayU** (supports UPI, cards, wallets, NetBanking — ideal for Indian market).

### Payment flow

| Step | Where | Description |
|------|-------|-------------|
| 1. Initiate | `POST /api/v1/payments/initiate` (backend) | Generates `txnid` + SHA-512 hash server-side; returns PayU form params to the browser |
| 2. Redirect | Frontend (`script.js`) | Auto-submits a hidden form to the PayU gateway endpoint |
| 3. PayU processes | PayU servers | User completes payment on PayU-hosted page |
| 4. Success callback | `POST /api/v1/payments/success` (backend) | Verifies response hash with `crypto.timingSafeEqual`; redirects to frontend with `?payment=success` |
| 5. Failure callback | `POST /api/v1/payments/failure` (backend) | Redirects to frontend with `?payment=failed` |
| 6. Toast | Frontend (`script.js → checkPaymentStatus()`) | Reads URL param, shows success/failure toast, then cleans up the URL |

### API endpoints

```
POST /api/v1/payments/initiate   — Public (no auth) — returns PayU form params + hash
POST /api/v1/payments/success    — Public — PayU success callback → redirect to frontend
POST /api/v1/payments/failure    — Public — PayU failure callback → redirect to frontend
```

### Environment variables required

```
PAYU_MERCHANT_KEY=          # From PayU Merchant Dashboard
PAYU_MERCHANT_SALT=         # From PayU Merchant Dashboard
BACKEND_URL=                # Your deployed backend URL (used to build surl/furl)
FRONTEND_URL=               # Your deployed frontend URL (used for post-payment redirect)
```

**Security:** `PAYU_MERCHANT_SALT` never leaves the server. The frontend receives only the pre-computed hash, not the salt.

**Test vs Production:** Set `NODE_ENV=production` in the backend to switch the PayU endpoint from `test.payu.in` to `secure.payu.in` automatically.

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

# Admin Seeder

Seed or promote an admin user with:

```bash
cd backend
npm run db:seed:admin
```

The script reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `backend/.env`.
If the email already exists, that user is updated with the seeded password/name, promoted to `role = admin`, and marked verified.

---

# Typical Development Tasks

When working on this codebase, Codex should prioritize:

1. Updating CSS styles to match new designs
2. Adding frontend logic to `script.js`
3. Extending cart functionality (e.g., promo codes)
4. Updating product datasets
5. Generating static HTML category pages using scripts

---

# Important Constraints
* Catalog storefront UI is DB-first: homepage brands/categories/featured products, category listings, brand pages, search results, and `product.html` read from backend APIs and use local JS datasets only as fallback fixtures.
* `Brand`, `Category`, and `Product` include `isFeatured`; the admin DB pages expose this flag so homepage sections can be driven from the database.
* Category listing pages and `product.html` now prefer backend API data and fall back to local JS datasets only when the API is unavailable
* Product categories describe what the part is, for example `Brake Pads`, `Engine Parts`, or `Suspension`. Do not use categories for selling type or condition.
* Product attributes describe how the part is sold: `type` (`oem`, `aftermarket`), `condition` (`new`, `used`, `refurbished`), and `pricingModel` / DB column `pricing_model` (`retail`, `wholesale`).
* Legacy category URLs for `aftermarket`, `oem`, `used`, `refurbished`, and `wholesale` are compatibility aliases only; backend filtering maps them to product attributes.
* Brands are normalized through the `Brand` table. `Product.brandId` is the source of truth; `Product.brand` is retained only as a temporary backward-compatible text snapshot.
* Seeded brands must be real part manufacturers only, for example `Bosch`, `Minda`, `NGK`, `Denso`, `Valeo`, `Delphi`, `Mahle`, `SKF`, `Exide`, `Amaron`, `Brembo`, `LUK`, `Hella`, `Monroe`, `TRW`, and similar part brands. Vehicle names, product categories, and generic search terms should map to the `Generic` fallback brand instead of becoming brands.
* Categories must stay product classifications only and may be hierarchical, for example `Brake System > Brake Pads`, `Filters > Air Filters`, `Electrical > Control Modules`, `Body Parts > Mirrors`, and `Cooling & AC > AC Compressors`.

* The backend is actively connected to catalog-facing frontend pages through `/api/v1/*` routes; CMS remains for non-catalog content.
* Local product/category/brand JS files are retained only as fallback fixtures when the API is unavailable.
* The frontend cart is still in-memory (`let cart = []`) — persistent DB cart is designed and ready in Phase 6
* Payment uses **PayU** — hash generation is server-side (`backend/src/services/payment.service.js`); never move salt to client-side JS

---

# Backend File Map

Brand management notes:

* Homepage car-brand cards, logo carousel, top categories, and featured products render from featured DB rows instead of CMS hardcoded lists.
* The frontend topbar brand dropdowns and search autocomplete are hydrated from `/api/v1/products/brands` and `/api/v1/products?q=...`; static HTML options are fallback only.
* Search submit and suggestion clicks route to clean URLs like `/pages/search?q=audi`; brand dropdowns route to `/pages/brand?id=audi`.
* Listing-page sidebar brand filters are hydrated from `/api/v1/products/brands`; filter changes dispatch fresh DB queries through `products-loader.js`.
* DB product brands now live in the `Brand` table and are linked from products via `brandId`; the admin panel has a separate `DB Brands` page, and `DB Products` reuses those brands in the product modal and Brand filter.
* The admin sidebar is organized into collapsible main-menu sections (`Storefront CMS`, `Content Pages`, `Catalog DB`, `Settings`, `Tools`) to keep the menu easier to navigate.
* `brand.html?id=<brand>` now renders live products from `GET /api/v1/products?brand=<brand>`.

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
│   └── payment.service.js       PayU: initiate (hash gen) / handleSuccess / handleFailure
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
3. **Frontend logic** → edit files under `frontend/js/`; set `window.BACKEND_URL` in HTML if backend is on a different domain
4. **Catalog data** → manage brands, categories, and products in DB admin pages; local JS datasets are fallback fixtures only
5. **Payment changes** → edit `backend/src/services/payment.service.js` only; keep `PAYU_MERCHANT_SALT` in `.env` — never in client JS
6. **After any change** → update the relevant documentation file (`AGENTS.md`, `ARCHITECTURE.md`, `README.md`)
