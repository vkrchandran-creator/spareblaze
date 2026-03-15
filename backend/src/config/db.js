const { PrismaClient } = require('@prisma/client');

// Singleton pattern — reuse one client across the app.
// In development, prevent multiple instances during hot reload.
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global._prisma) {
    global._prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  prisma = global._prisma;
}

module.exports = prisma;
