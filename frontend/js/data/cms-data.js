/**
 * SpareBlaze CMS Runtime v2
 * Reads edits from admin.html (localStorage) and applies them to every page.
 */
(function () {
    const KEY = 'sb_cms_data';
    const DEFAULT_DATA = {
        siteIdentity: {
            logoUrl: '../public/images/spareblaze-logo.png',
            siteName: 'SpareBlaze',
            tagline: "India's trusted e-commerce platform for genuine car and SUV spare parts. Quality assured, delivered nationwide.",
            copyright: "© 2026 SpareBlaze. All rights reserved. Designed for Indian Automotive Market."
        },
        navLinks: [
            { label: 'After Market', href: 'after-market.html' },
            { label: 'Refurbished', href: 'refurbished.html' },
            { label: 'Used', href: 'used.html' },
            { label: 'OEM', href: 'oem.html' },
            { label: 'Wholesale', href: 'wholesale.html' }
        ],
        footer: {
            phone: '+91 1800 123 4567',
            email: 'support@spareblaze.in',
            address: 'Bengaluru, Karnataka, India',
            instagram: 'javascript:void(0);',
            facebook: 'javascript:void(0);',
            twitter: 'javascript:void(0);',
            youtube: 'javascript:void(0);'
        },
        carBrands: [
            { label: 'MARUTI', id: 'maruti' }, { label: 'HYUNDAI', id: 'hyundai' },
            { label: 'TATA', id: 'tata' }, { label: 'MAHINDRA', id: 'mahindra' },
            { label: 'TOYOTA', id: 'toyota' }, { label: 'HONDA', id: 'honda' },
            { label: 'KIA', id: 'kia' }, { label: 'FORD', id: 'ford' },
            { label: 'VW', id: 'vw' }, { label: 'RENAULT', id: 'renault' },
            { label: 'SKODA', id: 'skoda' }, { label: 'NISSAN', id: 'nissan' },
            { label: 'CHEVROLET', id: 'chevrolet' }, { label: 'FIAT', id: 'fiat' },
            { label: 'JEEP', id: 'jeep' }, { label: 'MG', id: 'mg' },
            { label: 'BMW', id: 'bmw' }, { label: 'AUDI', id: 'audi' }, { label: 'VOLVO', id: 'volvo' }
        ],
        trustBar: [
            { icon: 'fa-solid fa-truck-fast', text: 'Pan-India Delivery' },
            { icon: 'fa-solid fa-shield-halved', text: 'OEM Assured' },
            { icon: 'fa-solid fa-credit-card', text: 'Secure Payment (UPI / Card)' },
            { icon: 'fa-solid fa-headset', text: '24/7 Expert Support' }
        ],
        topCategories: [
            { icon: '../public/images/engine.jpg', name: 'Engine Components', href: 'after-market.html' },
            { icon: '../public/images/brake.jpg', name: 'Brake Systems', href: 'after-market.html' },
            { icon: '../public/images/steering.jpg', name: 'Suspension & Steering', href: 'after-market.html' },
            { icon: '../public/images/battery.jpg', name: 'Electricals & Lighting', href: 'after-market.html' }
        ],
        ctaBanner: {
            headline: 'Need Help Finding The Right Part?',
            desc: 'Our automotive experts are here to assist you in finding the exact fit for your Indian vehicle model.',
            btnText: 'Contact Experts'
        },
        slides: [
            { id: 1, bg: '../public/images/slider-suspension.jpg', badge: '100% Genuine Parts', headline: 'Performance Meets Reliability', highlight: 'Reliability', subtitle: 'The ultimate destination for premium car and SUV spare parts tailored for Indian roads.', cta: 'Shop Now', ctaLink: 'categories.html', cta2: 'Browse Categories', cta2Link: 'wholesale.html' },
            { id: 2, bg: '../public/images/slider-brake-pad.jpg', badge: 'Monsoon Ready', headline: 'Upgrade Your Brakes', highlight: 'Brakes', subtitle: "Don't compromise on safety. Up to 20% off on premium brake pads and rotors.", cta: 'View Offers', ctaLink: 'categories.html?category=brakes', cta2: '', cta2Link: '' },
            { id: 3, bg: '../public/images/slider-engine.jpg', badge: 'OEM Certified', headline: 'Keep Your Engine Pristine', highlight: 'Pristine', subtitle: 'Shop authentic oil filters and engine components from authorized distributors.', cta: 'Shop Engine Parts', ctaLink: 'categories.html?category=engine', cta2: '', cta2Link: '' }
        ],
        featuredProducts: [
            { title: 'Chevrolet Cruze LED Headlights DRL Projector Lens (2009–2016)', brand: 'Chevrolet', price: 35000, mrp: 38000, img: '../public/images/products/cruze_headlights.png' },
            { title: 'High-Quality Genuine Clutch Disc & Kit Set for Nissan', brand: 'Nissan', price: 18000, mrp: 19000, img: '../public/images/products/nissan_clutch_kit.png' },
            { title: 'FF-5059M Fog Light with Bracket (RH) for Mahindra Scorpio S2/S3', brand: 'Mahindra', price: 975, mrp: 1255, img: '../public/images/products/scorpio_fog_light.png' },
            { title: 'High-Performance Brake Caliper Piston 9040 with Big Brake Disc', brand: 'Brembo', price: 92000, mrp: 110000, img: '../public/images/products/brake_rotor.jpg' },
            { title: 'BCM (Body Control Module) for Chevrolet Cruze – Automatic Used', brand: 'Chevrolet', price: 15000, mrp: 20000, img: '../public/images/products/fog_lamps.jpg' },
            { title: 'Premium Alloy Wheels – Style, Strength, and Performance', brand: 'Universal', price: 18000, mrp: 25000, img: '../public/images/products/brake_rotor.jpg' }
        ],
        theme: {
            primary: '#e63900',
            primarySoft: '#ffede6',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }
    };

    let d = null;
    try { const s = localStorage.getItem(KEY); if (s) d = JSON.parse(s); } catch (e) { }
    if (!d) {
        d = DEFAULT_DATA;
    } else {
        // Deep merge: fill in any missing top-level sections from defaults
        if (!d.trustBar || !d.trustBar.length) d.trustBar = DEFAULT_DATA.trustBar;
        if (!d.navLinks || !d.navLinks.length) d.navLinks = DEFAULT_DATA.navLinks;
        if (!d.carBrands || !d.carBrands.length) d.carBrands = DEFAULT_DATA.carBrands;
        if (!d.topCategories || !d.topCategories.length) d.topCategories = DEFAULT_DATA.topCategories;
        if (!d.siteIdentity) d.siteIdentity = DEFAULT_DATA.siteIdentity;
        if (!d.footer) d.footer = DEFAULT_DATA.footer;
        if (!d.ctaBanner) d.ctaBanner = DEFAULT_DATA.ctaBanner;
        if (!d.theme) d.theme = DEFAULT_DATA.theme;
        if (!d.slides || !d.slides.length) d.slides = DEFAULT_DATA.slides;
        if (!d.featuredProducts || !d.featuredProducts.length) d.featuredProducts = DEFAULT_DATA.featuredProducts;

        // Fix for logo path/extension migration
        if (d.siteIdentity && (
            d.siteIdentity.logoUrl === 'images/spareblaze-logo.jpg' ||
            d.siteIdentity.logoUrl === 'images/spareblaze-logo.png'
        )) {
            d.siteIdentity.logoUrl = '../public/images/spareblaze-logo.png';
            localStorage.setItem(KEY, JSON.stringify(d));
        }

        // Migrate broken 'images/...' paths to '../public/images/...' in stored data
        let needsSave = false;
        if (d.topCategories) {
            d.topCategories = d.topCategories.map(c => {
                let updated = { ...c };
                if (c.icon && c.icon.startsWith('images/')) {
                    needsSave = true;
                    updated.icon = '../public/' + c.icon;
                }
                // Migrate stale hrefs that pointed to non-functional categories.html?category=* URLs
                if (c.href && c.href.startsWith('categories.html?category=')) {
                    needsSave = true;
                    updated.href = 'after-market.html';
                }
                return updated;
            });
        }
        if (d.slides) {
            d.slides = d.slides.map(s => {
                if (s.bg && s.bg.startsWith('images/')) {
                    needsSave = true;
                    return { ...s, bg: '../public/' + s.bg };
                }
                return s;
            });
        }
        if (d.featuredProducts) {
            d.featuredProducts = d.featuredProducts.map(p => {
                if (p.img && p.img.startsWith('images/')) {
                    needsSave = true;
                    return { ...p, img: '../public/' + p.img };
                }
                return p;
            });
        }
        if (needsSave) localStorage.setItem(KEY, JSON.stringify(d));

        // Patch stale trust bar values — update any record still referencing the old return label
        if (d.trustBar) {
            d.trustBar = d.trustBar.map(item => {
                if (item.text === '7 Days Easy Return' || item.icon === 'fa-solid fa-rotate-left') {
                    return { icon: 'fa-solid fa-credit-card', text: 'Secure Payment (UPI / Card)' };
                }
                return item;
            });
            // Patch stale top categories if they are using FontAwesome icons instead of images
            if (d.topCategories && d.topCategories.some(c => c.icon.startsWith('fa-'))) {
                d.topCategories = DEFAULT_DATA.topCategories;
            }
        }
    }

    function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function set(sel, prop, val, root) {
        (root || document).querySelectorAll(sel).forEach(el => { if (val !== undefined && val !== '') el[prop] = val; });
    }
    function txt(sel, val, root) { set(sel, 'textContent', val, root); }

    // ── 0. Theme & Branding ──
    function applyTheme() {
        const theme = d.theme; if (!theme) return;
        let style = document.getElementById('sb-theme-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'sb-theme-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            :root {
                --color-primary: ${theme.primary} !important;
                --primary: ${theme.primary} !important;
                --primary-soft: ${theme.primarySoft} !important;
                --font-family-base: ${theme.fontFamily} !important;
            }
            body { font-family: var(--font-family-base) !important; }
        `;
    }

    // ── 1. Site Identity ──
    function applySiteIdentity() {
        const si = d.siteIdentity; if (!si) return;

        // Header Logo
        document.querySelectorAll('nav .logo img').forEach(img => {
            img.src = si.logoUrl || '../public/images/spareblaze-logo.png';
            img.style.height = '54px';
            img.style.width = 'auto';
            img.style.objectFit = 'contain';
        });

        // Footer Logo
        document.querySelectorAll('.footer-brand .logo img').forEach(img => {
            img.src = '../public/images/spareblaze-logo-footer.png';
            img.style.width = '250px';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
        });
    }

    // ── 2. Navigation links ──
    function applyNavLinks() {
        const nl = d.navLinks; if (!nl || !nl.length) return;
        const ul = document.querySelector('.category-links');
        if (!ul) return;
        ul.innerHTML = nl.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('');
    }

    // ── 3. Trust Bar ──
    function applyTrustBar() {
        const tb = d.trustBar; if (!tb || !tb.length) return;
        const wrap = document.querySelector('.trust-indicators');
        if (!wrap) return;
        wrap.innerHTML = tb.map(t => `<div class="trust-item"><i class="${t.icon}"></i> ${t.text}</div>`).join('');
    }

    // ── 4. Car Brands grid ──
    function applyCarBrands() {
        const cb = d.carBrands; if (!cb || !cb.length) return;
        const grid = document.querySelector('.makers-grid');
        if (!grid) return;
        grid.innerHTML = cb.map(b => `<a href="brand.html?id=${esc(b.id)}" class="maker-card">${esc(b.label)}</a>`).join('');
    }

    // ── 5. Top Categories ──
    function applyTopCategories() {
        const tc = d.topCategories; if (!tc || !tc.length) return;
        const grid = document.querySelector('.categories-grid');
        if (!grid) return;
        grid.innerHTML = tc.map(c => {
            const isImg = c.icon && (c.icon.includes('.') || c.icon.includes('/'));
            const iconHtml = isImg
                ? `<img src="${c.icon}" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                   <i class="fa-solid fa-gears" style="display:none; font-size: 3rem; color: var(--color-primary);"></i>`
                : `<i class="${c.icon}"></i>`;

            return `
                <div class="category-card">
                    <div class="cat-icon">
                        ${iconHtml}
                    </div>
                    <div class="cat-content">
                        <h3>${c.name}</h3>
                        <a href="${c.href}" class="cat-action">Explore <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── 6. CTA Banner ──
    function applyCtaBanner() {
        const cta = d.ctaBanner; if (!cta) return;
        txt('.cta-banner h2', cta.headline);
        txt('.cta-banner p', cta.desc);
        txt('.cta-banner .btn', cta.btnText);
    }

    // ── 7. Footer ──
    function applyFooter() {
        const f = d.footer; if (!f) return;
        // Contact
        document.querySelectorAll('.footer-contact p').forEach(p => {
            if (p.querySelector('.fa-phone') && f.phone) p.innerHTML = `<i class="fa-solid fa-phone"></i> ${f.phone}`;
            if (p.querySelector('.fa-envelope') && f.email) p.innerHTML = `<i class="fa-solid fa-envelope"></i> ${f.email}`;
            if (p.querySelector('.fa-location-dot') && f.address) p.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${f.address}`;
        });
        // Social links
        const socials = document.querySelectorAll('.social-links a');
        const keys = ['instagram', 'facebook', 'twitter', 'youtube'];
        socials.forEach((a, i) => { if (f[keys[i]] !== undefined) a.href = f[keys[i]] || 'javascript:void(0);'; });
    }

    // ── 8. Hero Carousel ──
    function applyCarousel() {
        const slides = d.slides; if (!slides) return;
        document.querySelectorAll('.hero .slide, .slider-container .slide').forEach((el, i) => {
            const s = slides[i]; if (!s) return;
            if (s.bg) el.style.backgroundImage = "url('" + s.bg + "')";
            const badge = el.querySelector('.badge'); if (badge && s.badge) badge.textContent = s.badge;
            const h1 = el.querySelector('h1');
            if (h1 && s.headline) h1.innerHTML = s.highlight ? s.headline.replace(s.highlight, `<span class="highlight">${s.highlight}</span>`) : s.headline;
            const p = el.querySelector('p'); if (p && s.subtitle) p.textContent = s.subtitle;

            const btns = el.querySelectorAll('.btn');
            if (btns[0]) {
                if (s.cta) {
                    btns[0].textContent = s.cta;
                    btns[0].style.display = '';
                    if (s.ctaLink) {
                        btns[0].onclick = (e) => {
                            e.preventDefault();
                            window.location.href = s.ctaLink;
                        };
                    }
                } else {
                    btns[0].style.display = 'none';
                }
            }
            if (btns[1]) {
                if (s.cta2) {
                    btns[1].textContent = s.cta2;
                    btns[1].style.display = '';
                    if (s.cta2Link) {
                        btns[1].onclick = (e) => {
                            e.preventDefault();
                            window.location.href = s.cta2Link;
                        };
                    }
                } else {
                    btns[1].style.display = 'none';
                }
            }
        });
    }

    // ── 9. Featured Products ──
    function applyFeaturedProducts() {
        if (d.featuredProducts) window.__sbCmsFeatured = d.featuredProducts;
    }

    // ── Image Path Remapper ──
    // Converts legacy relative paths from old directory structure to new public/ structure.
    function remapImagePath(rawPath) {
        if (!rawPath) return rawPath;
        return rawPath
            .replace('after-market-parts/images/', '../public/product-images/aftermarket/')
            .replace('oem-parts/images/products/', '../public/product-images/oem/products/')
            .replace('oem-parts/images/', '../public/product-images/oem/')
            .replace('used-parts/images/products/', '../public/product-images/used/products/')
            .replace('used-parts/images/', '../public/product-images/used/')
            .replace('wholesale-parts/images/products/', '../public/product-images/wholesale/products/')
            .replace('wholesale-parts/images/', '../public/product-images/wholesale/');
    }

    // ── 10. Category Page (Dynamic Rendering) ──
    function applyCategoryPage() {
        const cats = d.categories || [];
        const pageFile = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '');

        // Find existing global data if available
        const globalDataMap = {
            'after-market': typeof afterMarketProducts !== 'undefined' ? afterMarketProducts : null,
            'refurbished': typeof refurbishedProducts !== 'undefined' ? refurbishedProducts : null,
            'used': typeof usedProducts !== 'undefined' ? usedProducts : null,
            'oem': typeof oemProducts !== 'undefined' ? oemProducts : null,
            'wholesale': typeof wholesaleProducts !== 'undefined' ? wholesaleProducts : null
        };

        let catData = cats.find(c => c.id === pageFile);

        // If no CMS data yet, try to use global data from JS files
        if (!catData && globalDataMap[pageFile]) {
            catData = {
                id: pageFile,
                title: pageFile.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                products: globalDataMap[pageFile].map(p => ({
                    name: p.title || p.name,
                    price: parseFloat(String(p.amount || p.price).replace(/[^0-9.]/g, '')) || 0,
                    mrp: parseFloat(String(p.originalPrice || p.mrp || 0).replace(/[^0-9.]/g, '')) || 0,
                    brand: p.brand,
                    img: remapImagePath(p.image || p.img),
                    vehicle: p.vehicle || ''
                }))
            };
        }

        if (!catData) return;

        const heroH1 = document.querySelector('.page-hero h1');
        if (heroH1) heroH1.innerHTML = catData.title || catData.headline || '';
        const heroP = document.querySelector('.page-hero p');
        if (heroP) heroP.textContent = catData.desc || '';

        const grid = document.querySelector('.prod-grid');
        if (!grid) return;

        grid.innerHTML = catData.products.map(p => {
            // Always route through the dynamic product detail page
            const detailUrl = `product.html?id=${encodeURIComponent(p.name)}`;
            const imgSrc = remapImagePath(p.img) || 'https://dummyimage.com/300x300/20243a/888';
            return `
                <div class="product-card" data-price="${p.price}" data-discount="${p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0}" data-vehicles="${(p.vehicle || '').toLowerCase()}" data-fast-delivery="true">
                    ${p.label ? `<div class="product-badge">${p.label}</div>` : ''}
                    <a href="${detailUrl}" class="product-img-wrap">
                        <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.src='https://dummyimage.com/300x300/ececec/000000.png&text=No%20Image'">
                    </a>
                    <div class="product-info">
                        ${p.brand ? `<div class="product-cat">${p.brand}</div>` : ''}
                        <h3 class="product-title"><a href="${detailUrl}">${p.name}</a></h3>
                        ${p.vehicle ? `<div style="font-size:0.8rem; color:var(--muted); margin-bottom:0.5rem">${p.vehicle}</div>` : ''}
                        <div class="product-price">
                            ₹${(p.price || 0).toLocaleString('en-IN')}
                            ${p.mrp && p.mrp > p.price ? `<span>₹${p.mrp.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        <div class="product-stock ${p.stock === 'Out of Stock' ? 'out' : ''}">${p.stock || 'In Stock'}</div>
                        <a href="${detailUrl}" class="view-details-btn">View Details</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function applyAll() {
        applyTheme();
        applySiteIdentity();
        applyNavLinks();
        applyTrustBar();
        applyCarBrands();
        applyTopCategories();
        applyCtaBanner();
        applyFooter();
        applyCarousel();
        applyFeaturedProducts();
        applyCategoryPage();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyAll);
    else applyAll();
})();

