const fs = require('fs');
const path = require('path');

// This script patches all localized product pages to have a working Add to Cart script.
// The scrape_and_build_categories.js had stripped the inline script when building pages.

const dirs = [
    'after-market-parts',
    'oem-parts',
    'used-parts',
    'refurbished-parts',
    'wholesale-parts'
];

// The script to inject — wires up #page-add-cart and #page-buy-now
// reading product data from the existing static elements in the HTML
const CART_SCRIPT = `
    <script>
        // Product Page Cart Wiring
        document.addEventListener('DOMContentLoaded', function() {
            var addCartBtn = document.getElementById('page-add-cart');
            var buyNowBtn  = document.getElementById('page-buy-now');
            if (!addCartBtn) return;

            // Read product data from the baked-in DOM elements
            var title = (document.getElementById('product-title') || {}).textContent || document.title;
            var priceText = (document.getElementById('product-price') || {}).textContent || '0';
            var price = Math.round(parseFloat(priceText.replace(/[^\d.]/g, '')) * 100) / 100 || 0;
            var img = (document.getElementById('main-product-img') || {}).src || '';
            var id = 'prod_' + window.location.pathname.split('/').pop().replace('.html', '') + '_' + price;

            var productData = { id: id, title: title, price: price, img: img };

            addCartBtn.addEventListener('click', function() {
                if (window.addToCart) window.addToCart(productData);
            });
            if (buyNowBtn) {
                buyNowBtn.addEventListener('click', function() {
                    if (window.addToCart) window.addToCart(productData);
                });
            }
        });
    </script>`;

const TIDIO_TAG = '<script src="https://code.tidio.co/sienbawteqdozz2om1mswgszpjxm6zxg.js" async></script>';

let totalFixed = 0;
let totalSkipped = 0;

dirs.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) { console.log(`Skipping (not found): ${dir}`); return; }

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));
    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        let html = fs.readFileSync(filePath, 'utf8');

        // Skip if already patched
        if (html.includes('Product Page Cart Wiring')) {
            totalSkipped++;
            return;
        }

        // Skip if there's no page-add-cart button (not a product detail page)
        if (!html.includes('page-add-cart')) {
            totalSkipped++;
            return;
        }

        // Inject before the Tidio script tag, or before </body>
        if (html.includes(TIDIO_TAG)) {
            html = html.replace(TIDIO_TAG, CART_SCRIPT + '\n' + TIDIO_TAG);
        } else {
            html = html.replace('</body>', CART_SCRIPT + '\n</body>');
        }

        fs.writeFileSync(filePath, html, 'utf8');
        totalFixed++;
    });

    console.log(`Processed ${files.length} files in ${dir}/`);
});

console.log(`\nDone! Fixed: ${totalFixed}, Skipped: ${totalSkipped}`);
