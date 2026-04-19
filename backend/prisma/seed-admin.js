/**
 * SpareBlaze admin seeder
 *
 * Run: npm run db:seed:admin
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/hashPassword');

const prisma = new PrismaClient();

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@spareblaze.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
const adminName = (process.env.ADMIN_NAME || 'SpareBlaze Admin').trim();

function validateAdminInput() {
  if (!adminEmail || !adminEmail.includes('@')) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }

  if (!adminName) {
    throw new Error('ADMIN_NAME cannot be empty.');
  }

  if (adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
  }
}

async function seedAdmin() {
  validateAdminInput();
  const passwordHash = await hashPassword(adminPassword);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  if (existingAdmin) {
    const updatedAdmin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: adminName,
        passwordHash,
        role: 'admin',
        isVerified: true,
      },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    console.log('Admin user already exists. Updated admin profile/role:');
    console.log(updatedAdmin);
    return;
  }

  const adminUser = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isVerified: true,
    },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  console.log('Admin user created successfully:');
  console.log(adminUser);
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
