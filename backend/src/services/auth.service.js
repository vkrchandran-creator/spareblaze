const prisma                        = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken }             = require('../utils/generateToken');

async function register({ name, email, phone, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  return { token, user };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Use a constant-time compare even on "not found" to prevent user enumeration
  const dummyHash = '$2a$12$invalidhashfortimingprotection000000000000000000000000';
  const passwordMatch = user
    ? await comparePassword(password, user.passwordHash)
    : await comparePassword(password, dummyHash);

  if (!user || !passwordMatch) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const token = generateToken({ userId: user.id, role: user.role });

  const safeUser = {
    id:        user.id,
    name:      user.name,
    email:     user.email,
    phone:     user.phone,
    role:      user.role,
    createdAt: user.createdAt,
  };

  return { token, user: safeUser };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, addresses: true },
  });

  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  return user;
}

// ─── Address management ───────────────────────────────────────────────────────

async function addAddress(userId, { label, line1, line2, city, state, pincode, isDefault }) {
  // If this is the first address or isDefault requested, unset current default first
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data:  { isDefault: false },
    });
  }

  const hasAny = await prisma.address.count({ where: { userId } });

  const address = await prisma.address.create({
    data: {
      userId,
      label:     label || 'Home',
      line1,
      line2:     line2 || null,
      city,
      state,
      pincode,
      isDefault: isDefault || hasAny === 0, // first address is default automatically
    },
  });

  return address;
}

async function listAddresses(userId) {
  return prisma.address.findMany({
    where:   { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
}

async function deleteAddress(userId, addressId) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    const err = new Error('Address not found.');
    err.status = 404;
    throw err;
  }

  await prisma.address.delete({ where: { id: addressId } });

  // If deleted address was default, promote the next one
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where:   { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
}

module.exports = { register, login, getProfile, addAddress, listAddresses, deleteAddress };
