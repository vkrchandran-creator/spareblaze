/**
 * SpareBlaze — Database Seed Script
 *
 * Imports all 600 products from existing JS data files into PostgreSQL.
 *
 * Run: npm run db:seed
 * Or:  npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const SEEDS  = path.join(__dirname, '../../database/seeds');
const brandCache = new Map();
const CLEAN_BRANDS = [
  'Generic',
  'Bosch',
  'Minda',
  'NGK',
  'Denso',
  'Valeo',
  'Delphi',
  'Mahle',
  'SKF',
  'Exide',
  'Amaron',
  'Brembo',
  'LUK',
  'Hella',
  'Monroe',
  'Sachs',
  'Gabriel',
  'Philips',
  'TRW',
  'Mann Filter',
  'Puro',
];
const CLEAN_BRAND_SLUGS = new Set(CLEAN_BRANDS.map(slugifyBrand));
const FEATURED_BRAND_SLUGS = new Set(['bosch', 'minda', 'ngk', 'denso', 'valeo', 'delphi', 'mahle', 'skf', 'exide', 'amaron', 'brembo', 'hella']);
const CATEGORY_TREE = [
  { name: 'Brake System', children: ['Brake Pads', 'Brake Disc & Rotor', 'Brake Calipers', 'Brake Master Cylinder', 'Brake Sensors'] },
  { name: 'Engine Parts', children: ['Engine Filters', 'Spark Plugs', 'Engine Mounts', 'Timing Components', 'Fuel System'] },
  { name: 'Suspension & Steering', children: ['Shock Absorbers', 'Struts', 'Control Arms', 'Tie Rods', 'Steering Rack', 'Ball Joints'] },
  { name: 'Electrical', children: ['Alternators', 'Starter Motors', 'Sensors', 'Switches', 'Control Modules', 'Instrument Cluster'] },
  { name: 'Filters', children: ['Air Filters', 'Oil Filters', 'Fuel Filters', 'Cabin Filters'] },
  { name: 'Body Parts', children: ['Bumpers', 'Doors', 'Mirrors', 'Bonnet & Hood', 'Grille', 'Fenders'] },
  { name: 'Cooling & AC', children: ['Radiators', 'AC Compressors', 'Condensers', 'Cooling Fans', 'Thermostats'] },
  { name: 'Transmission', children: ['Clutch Kit', 'Flywheel', 'Gearbox Parts', 'Drive Shafts'] },
  { name: 'Lighting', children: ['Headlights', 'Tail Lights', 'Fog Lamps', 'Bulbs & LEDs'] },
  { name: 'Bearings & Hubs', children: ['Wheel Bearings', 'Hub Assemblies', 'Industrial Bearings'] },
  { name: 'Wipers & Washers', children: ['Wiper Blades', 'Washer Pumps'] },
  { name: 'General', children: ['Universal Parts'] },
];

const VEHICLE_DATA = [
  { brand: 'Tata', models: ['Punch', 'Safari', 'Nexon', 'Harrier', 'Tiago'] },
  { brand: 'Kia', models: ['Sonet', 'Seltos', 'Carens'] },
  { brand: 'Maruti Suzuki', models: ['Swift', 'Baleno', 'Brezza', 'Dzire'] },
  { brand: 'Hyundai', models: ['Creta', 'Venue', 'i20', 'Verna'] },
  { brand: 'Mahindra', models: ['Thar', 'XUV700', 'Scorpio'] }
];

// ─── Data sources ─────────────────────────────────────────────────────────────

const afterMarketProducts = require(path.join(SEEDS, 'after-market-data.js'));
const oemProducts         = require(path.join(SEEDS, 'oem-data.js'));
const usedProducts        = require(path.join(SEEDS, 'used-data.js'));
const wholesaleProducts   = require(path.join(SEEDS, 'wholesale-data.js'));
const refurbishedProducts = [];

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Decode HTML entities used in product titles */
function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8243;/g, '"')
    .replace(/&#8242;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Generate a URL-safe slug from a title.
 * Appends a numeric suffix to guarantee uniqueness within a batch.
 */
function slugify(title, index) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
  return `${base}-${index}`;
}

function slugifyBrand(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function upsertBrand(name) {
  const requestedSlug = slugifyBrand(name);
  const slug = CLEAN_BRAND_SLUGS.has(requestedSlug) ? requestedSlug : 'generic';
  const cleanName = CLEAN_BRANDS.find((brandName) => slugifyBrand(brandName) === slug) || 'Generic';
  if (brandCache.has(slug)) return brandCache.get(slug);

  const brand = await prisma.brand.upsert({
    where: { slug },
    update: {
      name: cleanName,
      isActive: true,
      isFeatured: FEATURED_BRAND_SLUGS.has(slug),
    },
    create: {
      name: cleanName,
      slug,
      isActive: true,
      isFeatured: FEATURED_BRAND_SLUGS.has(slug),
    },
    select: { id: true, name: true, slug: true },
  });

  brandCache.set(slug, brand);
  return brand;
}

function inferBrandName(raw) {
  const candidate = [raw.brand, raw.title].filter(Boolean).join(' ');
  const normalized = slugifyBrand(decodeHtml(candidate));
  const match = CLEAN_BRANDS.find((brandName) => {
    const slug = slugifyBrand(brandName);
    return slug !== 'generic' && normalized.includes(slug);
  });

  return match || 'Generic';
}

async function seedCleanBrands() {
  for (const name of CLEAN_BRANDS) {
    await upsertBrand(name);
  }
}

async function seedCategoryTree() {
  const categories = [];

  for (const [index, parent] of CATEGORY_TREE.entries()) {
    const parentCategory = await prisma.category.upsert({
      where:  { slug: slugifyBrand(parent.name) },
      update: { name: parent.name, parentId: null, isFeatured: index < 6 },
      create: { name: parent.name, slug: slugifyBrand(parent.name), parentId: null, isFeatured: index < 6 },
    });
    categories.push(parentCategory);

    for (const childName of parent.children || []) {
      const childCategory = await prisma.category.upsert({
        where:  { slug: slugifyBrand(childName) },
        update: { name: childName, parentId: parentCategory.id, isFeatured: false },
        create: { name: childName, slug: slugifyBrand(childName), parentId: parentCategory.id, isFeatured: false },
      });
      categories.push(childCategory);
    }
  }

  return categories;
}

async function seedVehicleTree() {
  const vehicleModelsList = [];
  for (const vData of VEHICLE_DATA) {
    const brandSlug = slugifyBrand(vData.brand);
    const brand = await prisma.vehicleBrand.upsert({
      where: { slug: brandSlug },
      update: { name: vData.brand, isActive: true },
      create: { name: vData.brand, slug: brandSlug, isActive: true },
    });
    
    for (const modelName of vData.models) {
      const modelSlug = slugifyBrand(modelName);
      const dbModel = await prisma.vehicleModel.upsert({
        where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
        update: { name: modelName },
        create: { name: modelName, slug: modelSlug, brandId: brand.id },
      });
      vehicleModelsList.push(dbModel);
    }
  }
  return vehicleModelsList;
}

function inferCategoryName(raw) {
  const title = decodeHtml(raw.title || '').toLowerCase();
  if (/(brake pad|front pads|rear pads|p\d{5})/.test(title)) return 'Brake Pads';
  if (/(rotor|brake disc)/.test(title)) return 'Brake Disc & Rotor';
  if (/caliper/.test(title)) return 'Brake Calipers';
  if (/master cylinder/.test(title)) return 'Brake Master Cylinder';
  if (/brake/.test(title)) return 'Brake System';
  if (/air filter/.test(title)) return 'Air Filters';
  if (/oil filter/.test(title)) return 'Oil Filters';
  if (/fuel filter/.test(title)) return 'Fuel Filters';
  if (/cabin filter/.test(title)) return 'Cabin Filters';
  if (/(spark plug|spark plugs)/.test(title)) return 'Spark Plugs';
  if (/(fuel pump|fuel system|injector)/.test(title)) return 'Fuel System';
  if (/(engine mount|mounting)/.test(title)) return 'Engine Mounts';
  if (/(timing|piston|engine)/.test(title)) return 'Engine Parts';
  if (/(shock absorber|shock)/.test(title)) return 'Shock Absorbers';
  if (/strut/.test(title)) return 'Struts';
  if (/control arm/.test(title)) return 'Control Arms';
  if (/tie rod/.test(title)) return 'Tie Rods';
  if (/steering rack/.test(title)) return 'Steering Rack';
  if (/ball joint/.test(title)) return 'Ball Joints';
  if (/alternator/.test(title)) return 'Alternators';
  if (/starter/.test(title)) return 'Starter Motors';
  if (/sensor/.test(title)) return 'Sensors';
  if (/switch/.test(title)) return 'Switches';
  if (/(bcm|ecu|module|control module)/.test(title)) return 'Control Modules';
  if (/instrument cluster/.test(title)) return 'Instrument Cluster';
  if (/compressor/.test(title)) return 'AC Compressors';
  if (/radiator/.test(title)) return 'Radiators';
  if (/condenser/.test(title)) return 'Condensers';
  if (/(cooling fan|fan assembly)/.test(title)) return 'Cooling Fans';
  if (/thermostat/.test(title)) return 'Thermostats';
  if (/clutch/.test(title)) return 'Clutch Kit';
  if (/flywheel/.test(title)) return 'Flywheel';
  if (/(gearbox|transmission)/.test(title)) return 'Gearbox Parts';
  if (/(drive shaft|driveshaft|cv joint)/.test(title)) return 'Drive Shafts';
  if (/(headlight|head lamp|headlamp)/.test(title)) return 'Headlights';
  if (/(tail light|taillight)/.test(title)) return 'Tail Lights';
  if (/fog/.test(title)) return 'Fog Lamps';
  if (/(bulb|led|lamp|light)/.test(title)) return 'Bulbs & LEDs';
  if (/mirror/.test(title)) return 'Mirrors';
  if (/bumper/.test(title)) return 'Bumpers';
  if (/door/.test(title)) return 'Doors';
  if (/(bonnet|hood)/.test(title)) return 'Bonnet & Hood';
  if (/grille/.test(title)) return 'Grille';
  if (/fender/.test(title)) return 'Fenders';
  if (/(wheel bearing|hub)/.test(title)) return 'Wheel Bearings';
  if (/bearing/.test(title)) return 'Industrial Bearings';
  if (/wiper/.test(title)) return 'Wiper Blades';
  return 'Universal Parts';
}

/** Parse the mixed price field — can be number or string like "18000.00" */
function parsePrice(val) {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

/**
 * Remap old image paths to new public paths.
 *
 * Old: "after-market-parts/images/am_prod_1.jpg"
 * New: "/product-images/aftermarket/am_prod_1.jpg"
 *
 * Old: "oem-parts/images/products/img_1.jpg"
 * New: "/product-images/oem/products/img_1.jpg"
 */
function remapImagePath(oldPath) {
  if (!oldPath) return null;
  return '/' + oldPath
    .replace('after-market-parts/images/', 'product-images/aftermarket/')
    .replace('oem-parts/images/',          'product-images/oem/')
    .replace('used-parts/images/',         'product-images/used/')
    .replace('wholesale-parts/images/',    'product-images/wholesale/');
}

// ─── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 SpareBlaze — Seeding database...\n');

  // ── 1. Categories ───────────────────────────────────────────────────────────
  console.log('── Creating categories...');

  const categories = await seedCategoryTree();
  await seedCleanBrands();

  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  console.log(`   ✓ ${categories.length} categories ready\n`);

  console.log('── Creating vehicles...');
  const vehicleModelsList = await seedVehicleTree();
  console.log(`   ✓ ${vehicleModelsList.length} vehicle models ready\n`);

  // ── 2. Products ─────────────────────────────────────────────────────────────

  const batches = [
    { label: 'Aftermarket', data: afterMarketProducts, attributes: { type: 'aftermarket', condition: 'new', pricingModel: 'retail' } },
    { label: 'OEM',         data: oemProducts,         attributes: { type: 'oem', condition: 'new', pricingModel: 'retail' } },
    { label: 'Used',        data: usedProducts,        attributes: { type: 'aftermarket', condition: 'used', pricingModel: 'retail' } },
    { label: 'Wholesale',   data: wholesaleProducts,   attributes: { type: 'aftermarket', condition: 'new', pricingModel: 'wholesale' } },
    { label: 'Refurbished', data: refurbishedProducts, attributes: { type: 'aftermarket', condition: 'refurbished', pricingModel: 'retail' } },
  ];

  let globalIndex = 0;

  for (const { label, data, attributes } of batches) {
    console.log(`── Seeding ${label} (${data.length} products)...`);
    let inserted = 0;
    let skipped  = 0;

    for (const raw of data) {
      globalIndex++;

      const title   = decodeHtml(raw.title || '').trim();
      const slug    = slugify(title, globalIndex);
      const price   = parsePrice(raw.amount);
      const mrp     = parsePrice(raw.originalPrice) || price; // fallback mrp = price
      const image   = remapImagePath(raw.image);
      const discount = typeof raw.discount === 'number' ? raw.discount : 0;
      const inferredBrand = inferBrandName(raw);
      const brandRecord = await upsertBrand(inferredBrand);
      const category = categoryByName.get(inferCategoryName(raw)) || categoryByName.get('General');
      const isFeaturedProduct = globalIndex <= 12;

      if (!title) { skipped++; continue; }

      // Pick 1-3 random vehicle models for compatibility
      const numVehicles = Math.floor(Math.random() * 3) + 1;
      const assignedVehicles = [];
      for(let i=0; i<numVehicles; i++) {
        const randomModel = vehicleModelsList[Math.floor(Math.random() * vehicleModelsList.length)];
        if(!assignedVehicles.some(v => v.id === randomModel.id)) {
           assignedVehicles.push(randomModel);
        }
      }
      
      const partNumbers = [`SB-${Math.floor(Math.random() * 90000 + 10000)}`];

      try {
        const product = await prisma.product.upsert({
          where:  { slug },
          update: {
            title,
            price,
            mrp,
            discountPercent: discount,
            brand: brandRecord.name,
            brandId: brandRecord ? brandRecord.id : null,
            categoryId: category.id,
            type: attributes.type,
            condition: attributes.condition,
            pricingModel: attributes.pricingModel,
            images: image ? [image] : [],
            partNumbers: partNumbers,
            isActive: true,
            isFeatured: isFeaturedProduct,
          },
          create: {
            title,
            slug,
            brand:          brandRecord.name,
            brandId:         brandRecord ? brandRecord.id : null,
            categoryId:     category.id,
            type:           attributes.type,
            condition:      attributes.condition,
            pricingModel:   attributes.pricingModel,
            price,
            mrp,
            discountPercent: discount,
            images:          image ? [image] : [],
            partNumbers:     partNumbers,
            isActive:        true,
            isFeatured:      isFeaturedProduct,
          },
        });

        for (const vModel of assignedVehicles) {
          await prisma.productVehicle.upsert({
            where: { productId_vehicleId: { productId: product.id, vehicleId: vModel.id } },
            update: {},
            create: { productId: product.id, vehicleId: vModel.id }
          });
        }

        // Create inventory record if it doesn't exist
        await prisma.inventory.upsert({
          where:  { productId: product.id },
          update: {},
          create: {
            productId:         product.id,
            quantity:          price > 0 ? 10 : 0, // no price = not yet in stock
            lowStockThreshold: 3,
          },
        });

        inserted++;
      } catch (err) {
        console.warn(`   ⚠ Skipped [${globalIndex}] "${title.substring(0, 60)}": ${err.message}`);
        skipped++;
      }
    }

    console.log(`   ✓ ${inserted} inserted / ${skipped} skipped\n`);
  }

  // ── 3. Summary ──────────────────────────────────────────────────────────────

  const [productCount, inventoryCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.inventory.count(),
    prisma.category.count(),
  ]);

  console.log('─────────────────────────────────────────');
  console.log('  Seed complete!');
  console.log(`  Categories : ${categoryCount}`);
  console.log(`  Products   : ${productCount}`);
  console.log(`  Inventory  : ${inventoryCount}`);
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((err) => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
