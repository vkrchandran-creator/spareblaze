// Validates required environment variables on startup.
// Import this at the top of server.js before anything else.
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  PORT:           process.env.PORT || 5000,
  NODE_ENV:       process.env.NODE_ENV || 'development',
  DATABASE_URL:   process.env.DATABASE_URL,
  JWT_SECRET:     process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL:   process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL:    process.env.BACKEND_URL  || 'http://localhost:5000',
  PAYU_MERCHANT_KEY:  process.env.PAYU_MERCHANT_KEY,
  PAYU_MERCHANT_SALT: process.env.PAYU_MERCHANT_SALT,
  // SMTP — all optional; email is silently skipped if not configured
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
};
