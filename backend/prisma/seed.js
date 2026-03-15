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

// ─── Data sources ─────────────────────────────────────────────────────────────

const afterMarketProducts = require(path.join(SEEDS, 'after-market-data.js'));
const oemProducts         = require(path.join(SEEDS, 'oem-data.js'));
const usedProducts        = require(path.join(SEEDS, 'used-data.js'));
const wholesaleProducts   = require(path.join(SEEDS, 'wholesale-data.js'));

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

  const categories = await Promise.all([
    prisma.category.upsert({
      where:  { slug: 'aftermarket' },
      update: {},
      create: { name: 'After Market', slug: 'aftermarket' },
    }),
    prisma.category.upsert({
      where:  { slug: 'oem' },
      update: {},
      create: { name: 'OEM', slug: 'oem' },
    }),
    prisma.category.upsert({
      where:  { slug: 'used' },
      update: {},
      create: { name: 'Used Parts', slug: 'used' },
    }),
    prisma.category.upsert({
      where:  { slug: 'wholesale' },
      update: {},
      create: { name: 'Wholesale', slug: 'wholesale' },
    }),
  ]);

  const [catAftermarket, catOem, catUsed, catWholesale] = categories;
  console.log(`   ✓ ${categories.length} categories ready\n`);

  // ── 2. Products ─────────────────────────────────────────────────────────────

  const batches = [
    { label: 'Aftermarket', data: afterMarketProducts, category: catAftermarket },
    { label: 'OEM',         data: oemProducts,         category: catOem         },
    { label: 'Used',        data: usedProducts,        category: catUsed        },
    { label: 'Wholesale',   data: wholesaleProducts,   category: catWholesale   },
  ];

  let globalIndex = 0;

  for (const { label, data, category } of batches) {
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
      const brand   = raw.brand ? raw.brand.trim() : null;
      const discount = typeof raw.discount === 'number' ? raw.discount : 0;

      if (!title) { skipped++; continue; }

      try {
        const product = await prisma.product.upsert({
          where:  { slug },
          update: {
            title,
            price,
            mrp,
            discountPercent: discount,
            brand,
            images: image ? [image] : [],
            isActive: true,
          },
          create: {
            title,
            slug,
            brand,
            categoryId:     category.id,
            price,
            mrp,
            discountPercent: discount,
            images:          image ? [image] : [],
            isActive:        true,
          },
        });

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
