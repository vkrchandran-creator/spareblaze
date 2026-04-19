# SpareBlaze

Premium automotive spare parts e-commerce platform for the Indian market.

## Project Structure

```
spareblaze/
├── frontend/       # HTML / CSS / JS client application (deployed to Vercel)
├── backend/        # Node.js / Express REST API (deployed to Railway/Render)
├── database/       # Prisma schema, seeds, and migration docs
├── docs/           # Architecture docs and legacy scripts archive
└── docker/         # Local development Docker config
```

## Quick Start (Local Development)

### 1. Start the database
```bash
cd docker
docker compose up -d
```

### 2. Set up the backend
```bash
cd backend
cp .env.example .env        # Fill in your values
npm install
npx prisma migrate dev      # Run after Phase 3 schema is complete
npm run dev
```

### 3. Open the frontend
Open `frontend/pages/index.html` in your browser, or serve with:
```bash
npx serve frontend
```

## Catalog Attribute Migration Note

SpareBlaze separates product categories from product selling attributes. Categories now mean what the part is, for example `Brake Pads`, `Engine Parts`, or `Suspension`. Product attributes now hold how it is sold: `type` (`oem`, `aftermarket`), `condition` (`new`, `used`, `refurbished`), and `pricing_model` (`retail`, `wholesale`).

Run the Prisma migration `20260419090000_add_product_attributes` before reseeding or editing DB products. It preserves existing rows, adds default-safe fields, moves legacy `Used`, `Refurbished`, `Wholesale`, `OEM`, and `Aftermarket` category assignments into product attributes, and assigns unknown real categories to `General`.

## Brand Normalization Note

Products now use `brandId` as the canonical relation to the `Brand` table. The old `brand` text column remains temporarily for backward compatibility, but new product writes from the admin panel send `brandId`.

Run migration `20260419103000_normalize_brands` to add `Brand.isActive`, seed the clean brand set, and backfill existing products from legacy `brand` text to `brandId`. Polluted brand values are preserved in the text column but mapped to the `Generic` brand relation.

The product seed now creates a category/subcategory hierarchy and infers product categories from titles, for example brake pads, air filters, mirrors, lighting, electrical modules, and AC compressors. It also infers known part manufacturers from titles before falling back to `Generic`.

## Development Phases

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full 11-phase development roadmap.

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Project Restructuring | ✅ Complete | Monorepo structure in place |
| Phase 2 — Backend Foundation    | ✅ Complete | Express app, error handler, env config, apiResponse util |
| Phase 3 — Database Setup        | ⚙️ In Progress | Prisma schema written; migrations pending |
| Phase 4 — Authentication        | ✅ Complete | JWT login/register, auth + admin middleware |
| Phase 5 — Product APIs          | ✅ Complete | CRUD + filtering; frontend still uses local JS files |
| Phase 6 — Cart Persistence      | ✅ Complete | DB-backed cart API built; frontend not yet migrated |
| Phase 7 — Order Management      | ✅ Complete | Full order lifecycle, admin status updates |
| Phase 8 — Payment Integration   | ✅ Complete (backend) | Razorpay: initiate, verify, webhook — frontend integration pending |
| Phase 9 — Admin Panel           | ⏳ Pending | Backend admin endpoints done; frontend UI not built |
| Phase 10 — Testing              | ⚙️ In Progress | `backend/tests/payment.test.js` exists; full suite pending |
| Phase 11 — Deployment           | ⏳ Pending | |

> **Payment gateway: Razorpay** — all payment logic is server-side in `backend/src/services/payment.service.js`. The legacy PayU code in `frontend/js/script.js` is deprecated.
