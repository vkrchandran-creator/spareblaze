const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listBrands() {
  return prisma.vehicleBrand.findMany({
    orderBy: { name: 'asc' },
    include: {
      models: {
        orderBy: { name: 'asc' }
      }
    }
  });
}

async function createBrand(data) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  return prisma.vehicleBrand.create({
    data: {
      name: data.name,
      slug,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
}

async function updateBrand(id, data) {
  return prisma.vehicleBrand.update({
    where: { id },
    data: {
      name: data.name,
      isActive: data.isActive
    }
  });
}

async function listModels(brandId) {
  const where = brandId ? { brandId } : {};
  return prisma.vehicleModel.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { brand: true }
  });
}

async function createModel(data) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  return prisma.vehicleModel.create({
    data: {
      name: data.name,
      slug,
      brandId: data.brandId
    }
  });
}

async function updateModel(id, data) {
  return prisma.vehicleModel.update({
    where: { id },
    data: {
      name: data.name,
      brandId: data.brandId
    }
  });
}

async function removeModel(id) {
  return prisma.vehicleModel.delete({
    where: { id }
  });
}

module.exports = {
  listBrands,
  createBrand,
  updateBrand,
  listModels,
  createModel,
  updateModel,
  removeModel
};
