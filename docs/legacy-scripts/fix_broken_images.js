const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'after-market-parts', 'images');

// Read the original product data to get product page URLs
const content = fs.readFileSync(path.join(__dirname, 'after-market-data.js'), 'utf8');
const match = content.match(/afterMarketProducts\s*=\s*(\[[\s\S]*\])/);
const allProducts = JSON.parse(match[1]);

// Find broken images: products where local image is 2618 bytes or missing
function getBrokenProductNumbers() {
    const broken = [];
    for (let i = 1; i <= 580; i++) {
        const padded = i;
        // Check various extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp'];
        let found = false;
        let isBroken = false;
        for (const ext of extensions) {
            const imgPath = path.join(imagesDir, `am_prod_${i}.${ext}`);
            if (fs.existsSync(imgPath)) {
                found = true;
                const size = fs.statSync(imgPath).size;
                if (size <= 3000) { // Any image under 3KB is broken
                    isBroken = true;
                }
                break;
            }
        }
        if (!found || isBroken) {
            broken.push(i);
        }
    }
    return broken;
}

// Determine the correct file extension from content-type or URL
function getExtFromUrl(url) {
    const u = url.split('?')[0].toLowerCase();
    if (u.endsWith('.png')) return 'png';
    if (u.endsWith('.jpeg') || u.endsWith('.jpg')) return 'jpg';
    if (u.endsWith('.webp')) return 'webp';
    if (u.endsWith('.gif')) return 'gif';
    return 'jpg'; // default
}

function getExtFromContentType(ct) {
    if (!ct) return null;
    if (ct.includes('png')) return 'png';
    if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
    if (ct.includes('webp')) return 'webp';
    if (ct.includes('gif')) return 'gif';
    return null;
}

function fetchUrl(url, followRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (followRedirects <= 0) return reject(new Error('Too many redirects'));
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SpareBlaze/1.0)' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                const loc = res.headers.location;
                res.resume();
                return fetchUrl(loc, followRedirects - 1).then(resolve).catch(reject);
            }
            let body = '';
            res.setEncoding('utf8');
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ body, statusCode: res.statusCode, contentType: res.headers['content-type'] }));
        }).on('error', reject);
    });
}

function downloadFile(url, dest, followRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (followRedirects <= 0) return reject(new Error('Too many redirects'));
        const lib = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(dest);
        lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SpareBlaze/1.0)' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                file.close();
                fs.unlink(dest, () => { });
                return downloadFile(res.headers.location, dest, followRedirects - 1).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => { });
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                // Verify file size
                const size = fs.statSync(dest).size;
                if (size < 1000) {
                    fs.unlink(dest, () => { });
                    reject(new Error(`File too small: ${size} bytes`));
                } else {
                    resolve({ contentType: res.headers['content-type'], size });
                }
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

// Extract product image from spareblaze.com product page HTML
function extractProductImage(html) {
    // Try WooCommerce product gallery image
    const patterns = [
        // wp-post-image (main featured image)
        /class="wp-post-image[^"]*"[^>]*src="([^"]+)"/i,
        // woocommerce gallery first image
        /class="woocommerce-product-gallery__image[^"]*"[\s\S]*?<img[^>]*src="([^"]+)"/i,
        // attachment-woocommerce_single
        /attachment-woocommerce_single[^"]*"[^>]*src="([^"]+)"/i,
        // attachment-woocommerce_single in src first
        /src="([^"]+)"[^>]*class="[^"]*attachment-woocommerce_single/i,
        // og:image meta
        /property="og:image"\s+content="([^"]+)"/i,
        /content="([^"]+)"\s+property="og:image"/i,
        // Also try woocommerce thumbnail
        /attachment-woocommerce_thumbnail[^"]*"[^>]*src="([^"]+)"/i,
        /src="([^"]+)"[^>]*class="[^"]*attachment-woocommerce_thumbnail/i,
    ];

    for (const pattern of patterns) {
        const m = html.match(pattern);
        if (m && m[1] && m[1].includes('spareblaze.com') && !m[1].includes('Screenshot-2025-12-24')) {
            return m[1];
        }
    }

    // Fallback: any wp-content/uploads image that is NOT the generic screenshot
    const allImgs = [...html.matchAll(/src="(https?:\/\/spareblaze\.com\/wp-content\/uploads\/[^"]+\.(jpg|jpeg|png|webp))"/gi)];
    for (const m of allImgs) {
        if (!m[1].includes('Screenshot-2025-12-24') && !m[1].includes('WhatsApp')) {
            return m[1];
        }
    }

    return null;
}

// Get existing file for a product number (may have different extension)
function getExistingFile(prodNum) {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of extensions) {
        const p = path.join(imagesDir, `am_prod_${prodNum}.${ext}`);
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function processProduct(prodNum) {
    const product = allProducts[prodNum - 1];
    if (!product) {
        console.log(`  [${prodNum}] No product data found`);
        return false;
    }

    const productUrl = product.link;
    if (!productUrl || productUrl === '#') {
        console.log(`  [${prodNum}] No product URL`);
        return false;
    }

    try {
        console.log(`  [${prodNum}] Fetching ${productUrl}`);
        const { body, statusCode } = await fetchUrl(productUrl);

        if (statusCode !== 200) {
            console.log(`  [${prodNum}] HTTP ${statusCode}`);
            return false;
        }

        const imgUrl = extractProductImage(body);
        if (!imgUrl) {
            console.log(`  [${prodNum}] No image found on page`);
            // Remove broken file
            const existing = getExistingFile(prodNum);
            if (existing) {
                const size = fs.statSync(existing).size;
                if (size <= 3000) fs.unlinkSync(existing);
            }
            return false;
        }

        console.log(`  [${prodNum}] Found image: ${imgUrl.substring(0, 80)}`);

        // Determine destination filename
        const ext = getExtFromUrl(imgUrl);
        const destPath = path.join(imagesDir, `am_prod_${prodNum}.${ext}`);

        // Remove old broken file (different extension)
        const existing = getExistingFile(prodNum);
        if (existing && existing !== destPath) {
            fs.unlinkSync(existing);
        }

        const result = await downloadFile(imgUrl, destPath);
        console.log(`  [${prodNum}] Downloaded! ${result.size} bytes -> am_prod_${prodNum}.${ext}`);
        return true;

    } catch (e) {
        console.log(`  [${prodNum}] Error: ${e.message}`);
        return false;
    }
}

async function main() {
    console.log('Finding broken images...');
    const broken = getBrokenProductNumbers();
    console.log(`Found ${broken.length} broken/missing images: ${broken.join(', ')}`);

    // Update after-market.html to fix image src extensions if needed
    // (will be done after downloads)

    let success = 0, failed = 0;
    const failedList = [];

    // Process in small batches to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < broken.length; i += batchSize) {
        const batch = broken.slice(i, i + batchSize);
        console.log(`\nBatch ${Math.floor(i / batchSize) + 1}: Products ${batch.join(', ')}`);

        const results = await Promise.all(batch.map(n => processProduct(n)));
        results.forEach((ok, idx) => {
            if (ok) success++;
            else { failed++; failedList.push(batch[idx]); }
        });

        // Small delay between batches
        if (i + batchSize < broken.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n=== DONE ===`);
    console.log(`Success: ${success}, Failed: ${failed}`);
    if (failedList.length > 0) {
        console.log(`Failed products: ${failedList.join(', ')}`);
    }

    // Now fix after-market.html to correct any wrong image extensions
    if (success > 0) {
        console.log('\nFixing image src extensions in after-market.html...');
        let html = fs.readFileSync(path.join(__dirname, 'after-market.html'), 'utf8');
        let changed = 0;

        for (let n = 1; n <= 580; n++) {
            const existing = getExistingFile(n);
            if (!existing) continue;
            const ext = path.extname(existing).slice(1);

            // Fix all extensions: jpg, jpeg, png, webp
            const pattern = new RegExp(`after-market-parts/images/am_prod_${n}\\.(jpg|jpeg|png|webp)`, 'g');
            const newSrc = `after-market-parts/images/am_prod_${n}.${ext}`;
            const updated = html.replace(pattern, newSrc);
            if (updated !== html) {
                html = updated;
                changed++;
            }
        }

        if (changed > 0) {
            fs.writeFileSync(path.join(__dirname, 'after-market.html'), html, 'utf8');
            console.log(`Updated ${changed} image references in after-market.html`);
        }
    }
}

main().catch(console.error);
