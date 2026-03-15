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
  RAZORPAY_KEY_ID:     process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};
