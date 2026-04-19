require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// FRONTEND_URL may be a comma-separated list for explicit production origins.
// Any localhost / 127.0.0.1 origin (any port) is always allowed in dev so
// the admin panel works regardless of which port the frontend dev server uses.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (!origin || origin === 'null') return true;   // curl / Postman / file://
  if (LOCALHOST_RE.test(origin))   return true;   // any localhost port
  return allowedOrigins.includes(origin);          // explicit production origins
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
// PayU callbacks are url-encoded form POSTs
app.use(express.urlencoded({ extended: true }));

// ── General rate limiting ─────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'spareblaze-api', env: process.env.NODE_ENV });
});

// ── Static Files ──────────────────────────────────────────────────────────────
const path = require('path');
app.use('/public/uploads', express.static(path.join(__dirname, '../../frontend/public/uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/payments', require('./routes/payment.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/upload', require('./routes/upload.routes'));
app.use('/api/v1/vehicles', require('./routes/vehicle.routes'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
