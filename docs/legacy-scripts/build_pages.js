const fs = require('fs');

// ─── Helper: common nav + footer snippet ──────────────────────
const NAV = (active) => `<nav class="navbar scrolled">
        <div class="nav-container">
            <a href="index.html" class="logo">
                <img src="images/spareblaze-logo.png" alt="SpareBlaze Logo" style="height: 54px; width: auto; object-fit: contain;">
            </a>
            <div class="search-container">
                <div class="search-category" id="custom-dropdown">
                    <div class="dropdown-selected">
                        <span id="dropdown-text">Select Vehicle</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </div>
                    <ul class="dropdown-options">
                        <li data-value="">All Vehicles</li>
                        <li data-value="maruti">MARUTI</li><li data-value="hyundai">HYUNDAI</li>
                        <li data-value="mahindra">MAHINDRA</li><li data-value="tata">TATA</li>
                        <li data-value="chevrolet">CHEVROLET</li><li data-value="honda">HONDA</li>
                        <li data-value="skoda">SKODA</li><li data-value="vw">VW</li>
                        <li data-value="toyota">TOYOTA</li><li data-value="nissan">NISSAN</li>
                        <li data-value="renault">RENAULT</li><li data-value="ford">FORD</li>
                        <li data-value="fiat">FIAT</li><li data-value="kia">KIA</li>
                        <li data-value="bmw">BMW</li><li data-value="audi">AUDI</li>
                        <li data-value="volvo">VOLVO</li>
                    </ul>
                </div>
                <input type="text" id="search-input" placeholder="Search by part name, brand, or OEM number...">
                <button class="search-btn" onclick="window.location.href='search.html'"><i class="fa-solid fa-search"></i></button>
                <div class="search-results" id="search-results"></div>
            </div>
            <div class="nav-actions">
                <a href="javascript:void(0);" class="nav-icon-btn"><i class="fa-regular fa-user"></i></a>
                <button class="nav-icon-btn cart-btn" id="cart-toggle">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="cart-badge" id="cart-count">0</span>
                </button>
            </div>
        </div>
    </nav>
    <div class="nav-categories">
        <div class="nav-container">
            <button class="all-categories-btn" onclick="window.location.href='categories.html'">
                <i class="fa-solid fa-bars-staggered"></i> All Categories
            </button>
            <ul class="category-links">
                <li><a href="after-market.html" ${active === 'after-market' ? 'class="highlight"' : ''}>After Market</a></li>
                <li><a href="refurbished.html" ${active === 'refurbished' ? 'class="highlight"' : ''}>Refurbished</a></li>
                <li><a href="used.html" ${active === 'used' ? 'class="highlight"' : ''}>Used</a></li>
                <li><a href="oem.html" ${active === 'oem' ? 'class="highlight"' : ''}>OEM</a></li>
                <li><a href="wholesale.html" ${active === 'wholesale' ? 'class="highlight"' : ''}>Wholesale</a></li>
            </ul>
        </div>
    </div>`;

const FOOTER = `<footer>
        <div class="footer-container">
            <div class="footer-brand">
                <a href="index.html" class="logo"><img src="images/spareblaze-logo-footer.png" alt="SpareBlaze Logo" style="width: 250px; height: auto;"></a>
                <p>India's trusted e-commerce platform for genuine car and SUV spare parts. Quality assured, delivered nationwide.</p>
                <div class="social-links">
                    <a href="javascript:void(0);"><i class="fa-brands fa-instagram"></i></a>
                    <a href="javascript:void(0);"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="javascript:void(0);"><i class="fa-brands fa-twitter"></i></a>
                    <a href="javascript:void(0);"><i class="fa-brands fa-youtube"></i></a>
                </div>
            </div>
            <div class="footer-links">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="index.html">About Us</a></li>
                    <li><a href="track-order.html">Track Order</a></li>
                    <li><a href="return-policy.html">Return Policy</a></li>
                    <li><a href="shipping-info.html">Shipping Info</a></li>
                    <li><a href="contact-us.html">Contact Us</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h3>Shop By Type</h3>
                <ul>
                    <li><a href="after-market.html">After Market</a></li>
                    <li><a href="refurbished.html">Refurbished</a></li>
                    <li><a href="used.html">Used</a></li>
                    <li><a href="oem.html">OEM</a></li>
                    <li><a href="wholesale.html">Wholesale</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>Contact</h3>
                <p><i class="fa-solid fa-phone"></i> +91 1800 123 4567</p>
                <p><i class="fa-solid fa-envelope"></i> support@spareblaze.in</p>
                <p><i class="fa-solid fa-location-dot"></i> Bengaluru, Karnataka, India</p>
                <h3 class="payment-title">Secure Payments</h3>
                <div class="payment-icons">
                    <i class="fa-brands fa-cc-visa"></i>
                    <i class="fa-brands fa-cc-mastercard"></i>
                    <span class="upi-text">UPI</span>
                    <span class="rupay-text">RuPay</span>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 SpareBlaze. All rights reserved. Designed for Indian Automotive Market.</p>
        </div>
    </footer>
    <div class="cart-overlay" id="cart-overlay"></div>
    <div class="cart-sidebar" id="cart-sidebar">
        <div class="cart-header">
            <h3>Your Cart</h3>
            <button class="close-btn" id="close-cart"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="cart-items" id="cart-items-container">
            <div class="empty-cart-msg">Your cart is currently empty.</div>
        </div>
        <div class="cart-footer">
            <div class="cart-total"><span>Total:</span><span class="total-amount" id="cart-total-amount">₹0</span></div>
            <button class="btn btn-primary w-100 checkout-btn" id="checkout-btn" disabled>Proceed to Secure Checkout</button>
        </div>
    </div>
    <script src="script.js"></script>`;

const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23e63900'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='14' fill='white'>SB</text></svg>">`;

const HEAD = (title) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - SpareBlaze | Premium Automotive Spare Parts</title>
    ${FAVICON}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        .page-hero {
            background: linear-gradient(135deg, var(--color-bg-base) 0%, #e2e8f0 100%);
            padding: 8rem 1.5rem 4rem;
            text-align: center;
            border-bottom: 1px solid var(--color-border);
        }
        .page-hero h1 { font-size: 3rem; color: var(--color-text-main); margin-bottom: 1rem; }
        .page-hero p { color: var(--color-text-muted); font-size: 1.1rem; max-width: 700px; margin: 0 auto; }
        .layout-container {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 2rem;
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 3rem 1.5rem 5rem;
            align-items: start;
        }
        @media (max-width: 768px) { .layout-container { grid-template-columns: 1fr; } }
        .sidebar-filters {
            background: var(--color-bg-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            padding: 1.5rem;
            position: sticky;
            top: 130px;
        }
        .filter-group { margin-bottom: 1.5rem; }
        .filter-group:last-child { margin-bottom: 0; }
        .filter-group h4 { font-size: 1rem; margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
        .filter-option { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--color-text-main); cursor: pointer; }
        .catalog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--color-bg-surface);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
            margin-bottom: 1.5rem;
        }
        .catalog-header select {
            border: 1px solid var(--color-border);
            padding: 0.3rem 0.6rem;
            border-radius: var(--radius-sm);
            color: var(--color-text-main);
        }
        .prod-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.5rem;
        }
        .type-badge {
            display: inline-block;
            background: var(--color-primary);
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-sm);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>`;

function loadLocalProducts(cat) {
    try {
        let content = require('fs').readFileSync(`${cat}-data-local.js`, 'utf8');
        // Handle both older after-market format and new module.exports format
        content = content.replace(/const [a-zA-Z]+Products = /, '').replace(/;(\nmodule\.exports = .*?;)?$/, '');
        let parsed = JSON.parse(content);
        return parsed.map((p, i) => ({
            name: p.title,
            price: p.amount || (p.price ? parseInt(p.price.replace(/[^0-9]/g, ''), 10) : 0),
            mrp: p.originalPrice ? parseInt(p.originalPrice.replace(/[^0-9]/g, ''), 10) : (p.price ? parseInt(p.price.replace(/[^0-9]/g, ''), 10) : 0),
            cat: p.brand,
            img: p.image,
            link: p.link,
            id: `${cat}_local_${i}`
        }));
    } catch (e) {
        console.warn(`Could not load local products for ${cat}`);
        return [];
    }
}

let amProducts = loadLocalProducts('after-market');
let refProducts = loadLocalProducts('refurbished');
let usedProducts = loadLocalProducts('used');
let oemProducts = loadLocalProducts('oem');
let wholesaleProducts = loadLocalProducts('wholesale');

// ─── Page definitions ──────────────────────────────────────────
const pages = [
    {
        slug: 'after-market',
        file: 'after-market.html',
        title: 'After Market Parts',
        badge: 'After Market',
        headline: 'After Market <span class="highlight">Parts</span>',
        desc: 'High-quality aftermarket replacement parts at competitive prices. Compatible with all major Indian car brands. Guaranteed quality and performance.',
        products: amProducts
    },
    {
        slug: 'refurbished',
        file: 'refurbished.html',
        title: 'Refurbished Parts',
        badge: 'Refurbished',
        headline: 'Refurbished <span class="highlight">Parts</span>',
        desc: 'Professionally restored automotive components tested to perform like new. Save up to 50% versus new replacements. Each unit quality-inspected before dispatch.',
        products: refProducts
    },
    {
        slug: 'used',
        file: 'used.html',
        title: 'Used Parts',
        badge: 'Used',
        headline: 'Used <span class="highlight">Parts</span>',
        desc: 'Tested and graded pre-owned spare parts at the lowest prices. Each part is inspected, cleaned, and cleared for safe reuse.',
        products: usedProducts
    },
    {
        slug: 'oem',
        file: 'oem.html',
        title: 'OEM Genuine Parts',
        badge: 'OEM Genuine',
        headline: 'OEM <span class="highlight">Genuine Parts</span>',
        desc: 'Original Equipment Manufacturer parts sourced directly from authorized distributors. Guaranteed perfect fit, manufacturer warranty intact.',
        products: oemProducts
    },
    {
        slug: 'wholesale',
        file: 'wholesale.html',
        title: 'Wholesale Bundles',
        badge: 'Wholesale',
        headline: 'Wholesale <span class="highlight">Bundles</span>',
        desc: 'Bulk packs and trade pricing for garages, service centers, and fleet operators. Minimum order quantities apply. Pan-India B2B delivery.',
        products: wholesaleProducts
    },
];

// ─── Generate each page ────────────────────────────────────────
pages.forEach(pg => {
    const productsHTML = pg.products.map(p => {
        const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
        const prodLink = p.link || `product.html?id=${encodeURIComponent(p.name)}`;
        const prodId = p.id || encodeURIComponent(p.name);
        const possibleVehicles = ['tata', 'maruti suzuki', 'hyundai', 'mahindra', 'toyota', 'kia', 'bmw', 'audi', 'volvo'];
        let assignedVehicle = possibleVehicles.find(v => p.name.toLowerCase().includes(v));
        if (!assignedVehicle) assignedVehicle = possibleVehicles[Math.floor(Math.random() * possibleVehicles.length)];
        const isFastDelivery = Math.random() > 0.3 ? 'true' : 'false';

        return `<div class="product-card" data-price="${p.price}" data-discount="${discount}" data-vehicles="${assignedVehicle}" data-fast-delivery="${isFastDelivery}">
                <div class="product-img-wrap">
                    <span class="product-badge">${pg.badge}</span>
                    <a href="${prodLink}">
                        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://dummyimage.com/400x300/ececec/000000.png&text=${encodeURIComponent(p.cat)}'">
                    </a>
                </div>
                <div class="product-info">
                    <div class="product-brand">${p.cat}</div>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="prod-price-area" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="price-current" style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary);">₹${parseInt(p.price).toLocaleString('en-IN')}</span>
                        ${p.mrp > p.price ? `<span class="price-mrp" style="font-size: 0.9rem; text-decoration: line-through; color: var(--color-text-muted); margin-left: 0.5rem;">₹${parseInt(p.mrp).toLocaleString('en-IN')}</span>` : ''}
                    </div>
                    <div class="product-compatibility"><i class="fa-solid fa-circle-check"></i> In Stock – Ships in 24hrs</div>
                    <div class="product-actions">
                        <a href="${prodLink}" class="btn view-details-btn"><i class="fa-solid fa-eye"></i> View Details</a>
                        <button class="btn btn-primary add-cart-btn" onclick="addToCart({id: '${prodId}', title: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}, img: '${p.img}'})"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                    </div>
                </div>
            </div>`;
    }).join('\n');

    const html = `${HEAD(pg.title)}
    ${NAV(pg.slug)}

    <!-- Page Hero -->
    <header class="page-hero">
        <h1>${pg.headline}</h1>
        <p>${pg.desc}</p>
    </header>

    <!-- Catalog -->
    <div class="layout-container">
        <!-- Sidebar -->
        <aside class="sidebar-filters">
            <div class="filter-group">
                <h4>Fulfilled By SpareBlaze</h4>
                <label class="filter-option"><input type="checkbox"> <i class="fa-solid fa-bolt" style="color:var(--color-warning)"></i> Fast Delivery</label>
            </div>
            <div class="filter-group">
                <h4>Price Range</h4>
                <label class="filter-option"><input type="radio" name="price"> Under ₹1,000</label>
                <label class="filter-option"><input type="radio" name="price"> ₹1,000 – ₹10,000</label>
                <label class="filter-option"><input type="radio" name="price"> Over ₹10,000</label>
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
        </aside>

        <!-- Main Content -->
        <main>
            <div class="catalog-header">
                <div><strong>${pg.products.length}</strong> products found</div>
                <div>
                    <label for="sort-by">Sort By: </label>
                    <select id="sort-by">
                        <option>Best Match</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Discount</option>
                    </select>
                </div>
            </div>
            <div class="prod-grid">
                ${productsHTML}
            </div>
        </main>
    </div>

    ${FOOTER}
    <script src="filter.js"></script>
    <script src="https://code.tidio.co/sienbawteqdozz2om1mswgszpjxm6zxg.js" async></script>
</body>
</html>`;

    fs.writeFileSync(pg.file, html);
    console.log(`Created ${pg.file}`);
});

// ─── Update nav links in all existing pages ────────────────────
const allPages = [
    'index.html', 'categories.html', 'brand.html', 'search.html',
    'contact-us.html', 'product.html', 'return-policy.html',
    'shipping-info.html', 'track-order.html'
];

const FAVICON_TAG = FAVICON;
const newNavUl = `<ul class="category-links">
                <li><a href="after-market.html">After Market</a></li>
                <li><a href="refurbished.html">Refurbished</a></li>
                <li><a href="used.html">Used</a></li>
                <li><a href="oem.html">OEM</a></li>
                <li><a href="wholesale.html">Wholesale</a></li>
            </ul>`;

const newFooterCats = `<div class="footer-links">
                <h3>Shop By Type</h3>
                <ul>
                    <li><a href="after-market.html">After Market</a></li>
                    <li><a href="refurbished.html">Refurbished</a></li>
                    <li><a href="used.html">Used</a></li>
                    <li><a href="oem.html">OEM</a></li>
                    <li><a href="wholesale.html">Wholesale</a></li>
                </ul>`;

allPages.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Add favicon if not present
    if (!html.includes('SB</text>')) {
        html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', FAVICON_TAG + '\n    <link rel="preconnect" href="https://fonts.googleapis.com">');
    }

    // Replace nav category-links
    html = html.replace(/<ul class="category-links">[\s\S]*?<\/ul>/, newNavUl);

    // Replace footer category div  
    html = html.replace(/<div class="footer-links">\s*<h3>(?:Categories|Shop By Type)<\/h3>[\s\S]*?<\/ul>/, newFooterCats);

    fs.writeFileSync(file, html);
    console.log(`Updated ${file}`);
});

console.log('\\nAll done!');

