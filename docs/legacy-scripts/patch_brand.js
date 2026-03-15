const fs = require('fs');

let html = fs.readFileSync('brand.html', 'utf8');

// 1. Fix sidebar class to include sidebar-filters (already done if run twice, so conditional)
html = html.replace(/class="catalog-sidebar"(?! sidebar-filters)/, 'class="catalog-sidebar sidebar-filters"');

// 2. Replace entire sidebar aside block with filter.js-compatible version
html = html.replace(
    /<aside class="catalog-sidebar sidebar-filters">[\s\S]*?<\/aside>/,
    `<aside class="catalog-sidebar sidebar-filters">
            <div class="filter-group">
                <h4>Fulfilled By SpareBlaze</h4>
                <label class="filter-option"><input type="checkbox" checked> <i class="fa-solid fa-bolt" style="color: var(--color-warning);"></i> Fast Delivery</label>
            </div>
            <div class="filter-group">
                <h4>Price Range</h4>
                <label class="filter-option"><input type="radio" name="price"> Under \u20b91,000</label>
                <label class="filter-option"><input type="radio" name="price" checked> \u20b91,000 \u2013 \u20b910,000</label>
                <label class="filter-option"><input type="radio" name="price"> Over \u20b910,000</label>
            </div>
            <div class="filter-group">
                <h4>Vehicle Brand</h4>
                <label class="filter-option"><input type="checkbox"> Tata</label>
                <label class="filter-option"><input type="checkbox"> Maruti Suzuki</label>
                <label class="filter-option"><input type="checkbox"> Hyundai</label>
                <label class="filter-option"><input type="checkbox"> Mahindra</label>
                <label class="filter-option"><input type="checkbox"> Toyota</label>
                <label class="filter-option"><input type="checkbox"> Kia</label>
            </div>
            <div class="filter-group">
                <h4>Discount</h4>
                <label class="filter-option"><input type="checkbox"> 10% and above</label>
                <label class="filter-option"><input type="checkbox"> 20% and above</label>
                <label class="filter-option"><input type="checkbox"> 30% and above</label>
            </div>
        </aside>`
);

// 3. Replace the entire product generation block from productTypes to innerHTML
const productBlockPattern = /const productTypes = \[[\s\S]*?grid\.innerHTML = productsHTML;/;
const newBlock = `const productTypes = [
                { cat: 'Filters', name: 'Oil Filter', price: 299, mrp: 350, img: 'images/products/oil-filter.jpg' },
                { cat: 'Filters', name: 'Air Filter Element', price: 450, mrp: 550, img: 'images/products/air-filter.jpg' },
                { cat: 'Brake Systems', name: 'Front Brake Pad Set', price: 1250, mrp: 1600, img: 'images/products/brake-pads.jpg' },
                { cat: 'Suspension', name: 'Shock Absorber Assembly', price: 2400, mrp: 2850, img: 'images/products/shock-absorber.jpg' },
                { cat: 'Electricals', name: 'Spark Plug Platinum', price: 450, mrp: 550, img: 'images/products/spark-plug.jpg' },
                { cat: 'Engine Parts', name: 'Timing Belt Kit', price: 3200, mrp: 3800, img: 'images/products/timing-belt.jpg' },
                { cat: 'Lighting', name: 'Halogen Bulb H4', price: 250, mrp: 300, img: 'images/products/headlamp.jpg' },
                { cat: 'Filters', name: 'Cabin AC Filter', price: 380, mrp: 450, img: 'images/products/cabin-filter.jpg' }
            ];

            // Render 8 products with filter data attributes
            let productsHTML = '';
            for (let i = 0; i < 8; i++) {
                const prod = productTypes[i % productTypes.length];
                const partNo = Math.random().toString(36).substring(2, 10).toUpperCase();
                const discount = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
                const isFastDelivery = Math.random() > 0.3 ? 'true' : 'false';
                productsHTML += '<div class="prod-card product-card" data-price="' + prod.price + '" data-discount="' + discount + '" data-vehicles="' + brandId + '" data-fast-delivery="' + isFastDelivery + '"><div class="prod-img-box"><a style="display:contents;" href="' + productUrl + '"><img src="' + prod.img + '" alt="' + prod.name + '" onerror="this.src=&apos;https://dummyimage.com/300x300/f3f4f6/aaa&apos;"></a><div class="discount-badge">-' + discount + '%</div></div><div class="prod-info"><a href="' + productUrl + '"><h3 class="prod-title" style="transition:color 0.2s;cursor:pointer" onmouseover="this.style.color=&apos;var(--color-primary)&apos;" onmouseout="this.style.color=&apos;var(--color-text-main)&apos;">' + displayName + ' ' + prod.name + '</h3></a><div class="prod-part-no">Part No: ' + partNo + '</div><div class="prod-price-area"><span class="price-current">\\u20b9' + prod.price.toLocaleString('en-IN') + '</span><span class="price-mrp">\\u20b9' + prod.mrp.toLocaleString('en-IN') + '</span></div><div class="prod-meta"><span><i class="fa-solid fa-check-circle"></i> Ships in 24 hrs</span><span style="color:var(--color-text-muted)"><i class="fa-solid fa-credit-card"></i> Secure Payment (UPI / Card)</span></div><a href="' + productUrl + '" class="btn-view" style="display:block;text-decoration:none">View Details</a></div></div>';
            }
            grid.innerHTML = productsHTML;
            // Boot filter engine after cards are injected into DOM
            if (typeof window.initFilters === 'function') { window.initFilters(); }`;

if (productBlockPattern.test(html)) {
    html = html.replace(productBlockPattern, newBlock);
    console.log('Product block replaced');
} else {
    console.error('Could not find productTypes block!');
}

// 4. Add filter.js script before Tidio tag
if (!html.includes('filter.js')) {
    html = html.replace(
        '<script src="https://code.tidio.co/sienbawteqdozz2om1mswgszpjxm6zxg.js"',
        '<script src="filter.js"></script>\n<script src="https://code.tidio.co/sienbawteqdozz2om1mswgszpjxm6zxg.js"'
    );
    console.log('filter.js injected');
}

fs.writeFileSync('brand.html', html);
console.log('brand.html patched successfully!');
