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
// FRONTEND_URL may be a comma-separated list for multi-origin support,
// e.g. "https://www.spareblaze.com,http://localhost:3000"
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    // if (!origin) return callback(null, true);
    if (!origin || origin === 'null') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' is not allowed`));
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

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/payments', require('./routes/payment.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
