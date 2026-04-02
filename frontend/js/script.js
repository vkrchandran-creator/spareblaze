/**
 * SpareBlaze JavaScript Logic
 * Handles interactive elements, mock cart, and search filtering
 */

// --- Visitor Tracking (Best Practice Implementation) ---
/**
 * Simple Frontend Visitor Tracker
 * In a production environment, this would integrate with a backend API or a service 
 * like Google Analytics. For this CMS, we use a robust localStorage/sessionStorage 
 * combination to simulate real-world tracking metrics.
 */
const VisitorTracker = (function () {
    const TOTAL_KEY = 'sb_total_visits';
    const SESSION_KEY = 'sb_session_active';
    const BASE_METRIC = 14800; // Simulated historical data

    function init() {
        let total = parseInt(localStorage.getItem(TOTAL_KEY) || BASE_METRIC, 10);
        if (!sessionStorage.getItem(SESSION_KEY)) {
            total++;
            localStorage.setItem(TOTAL_KEY, total.toString());
            sessionStorage.setItem(SESSION_KEY, 'true');
        }
        return total;
    }

    return { getCount: () => localStorage.getItem(TOTAL_KEY) || BASE_METRIC, init };
})();
VisitorTracker.init();

// --- Mock Data --- 
const products = [
    {
        id: 1,
        title: "Chevrolet Cruze LED Headlights DRL Projector Lens (2009–2016)",
        brand: "Chevrolet",
        compatibility: "Chevrolet Cruze (2009-2016)",
        price: 35000,
        originalPrice: 38000,
        image: "../public/images/products/cruze_headlights.png",
        category: "electricals",
        badge: "Premium Upgrade",
        fastDelivery: true
    },
    {
        id: 2,
        title: "High-Quality Genuine Clutch Disc & Kit Set for Nissan",
        brand: "Nissan",
        compatibility: "Nissan Sylphy, Livina",
        price: 18000,
        originalPrice: 19000,
        image: "../public/images/products/nissan_clutch_kit.png",
        category: "engine",
        badge: "Genuine",
        fastDelivery: true
    },
    {
        id: 3,
        title: "FF-5059M Fog Light with Bracket (RH) for Mahindra Scorpio S2/S3",
        brand: "Mahindra",
        compatibility: "Mahindra Scorpio S2, S3",
        price: 975,
        originalPrice: 1255,
        image: "../public/images/products/scorpio_fog_light.png",
        category: "electricals",
        badge: "Sale",
        fastDelivery: true
    },
    {
        id: 4,
        title: "High-Performance Brake Caliper Piston 9040 with Big Brake Disc",
        brand: "Brembo",
        compatibility: "Universal High Performance",
        price: 92000,
        originalPrice: 110000,
        image: "../public/images/products/brake_rotor.jpg",
        category: "brakes",
        badge: "Extreme Performance",
        fastDelivery: false
    },
    {
        id: 5,
        title: "BCM (Body Control Module) for Chevrolet Cruze – Automatic Used",
        brand: "Chevrolet",
        compatibility: "Chevrolet Cruze (AT)",
        price: 15000,
        originalPrice: 20000,
        image: "../public/images/products/fog_lamps.jpg",
        category: "electricals",
        badge: "Authentic Used",
        fastDelivery: true
    },
    {
        id: 6,
        title: "Premium Alloy Wheels – Style, Strength, and Performance",
        brand: "Universal",
        compatibility: "Fits Most Car Models (17-19 inch)",
        price: 18000,
        originalPrice: 25000,
        image: "../public/images/products/brake_rotor.jpg",
        category: "suspension",
        badge: "Premium",
        fastDelivery: true
    },
    {
        id: 7,
        title: "Brembo Premium Disc Brake Rotor Front",
        brand: "Brembo",
        compatibility: "Kia Seltos / Carens",
        price: 4500,
        originalPrice: 5200,
        image: "../public/images/products/brake_rotor.jpg",
        category: "brakes",
        badge: "Premium",
        fastDelivery: false
    },
    {
        id: 8,
        title: "Gabriel Strut Mount Assembly",
        brand: "Gabriel",
        compatibility: "Toyota Innova Crysta",
        price: 1250,
        originalPrice: 1500,
        image: "../public/images/products/strut_mount.jpg",
        category: "suspension",
        badge: "",
        fastDelivery: true
    },
    {
        id: 9,
        title: "BMW Genuine Oil Filter (High Performance)",
        brand: "BMW",
        compatibility: "BMW 3 Series, 5 Series, X1, X3",
        price: 3200,
        originalPrice: 3800,
        image: "../public/images/products/oil-filter.jpg",
        category: "engine",
        badge: "Performance",
        fastDelivery: true
    },
    {
        id: 10,
        title: "Audi A4/A6 Front Brake Pads Set",
        brand: "Audi",
        compatibility: "Audi A4, A6, Q3, Q5",
        price: 8500,
        originalPrice: 10500,
        image: "../public/images/products/brake-pads.jpg",
        category: "brakes",
        badge: "Premium",
        fastDelivery: true
    },
    {
        id: 11,
        title: "Volvo XC60/XC90 Air Filter Element",
        brand: "Volvo",
        compatibility: "Volvo XC60, XC90, S60, S90",
        price: 4200,
        originalPrice: 5200,
        image: "../public/images/products/air-filter.jpg",
        category: "engine",
        badge: "OEM Genuine",
        fastDelivery: false
    },
    {
        id: 12,
        title: "BMW M-Performance Spark Plugs (Set of 6)",
        brand: "BMW",
        compatibility: "BMW M3, M5, X5 M, X6 M",
        price: 12000,
        originalPrice: 14500,
        image: "../public/images/products/spark-plug.jpg",
        category: "electricals",
        badge: "M-Performance",
        fastDelivery: true
    },
    {
        id: 13,
        title: "Audi Genuine Fuel Filter",
        brand: "Audi",
        compatibility: "Audi A3, A4, A8, Q7",
        price: 4800,
        originalPrice: 5800,
        image: "../public/images/products/oil-filter.jpg",
        category: "engine",
        badge: "",
        fastDelivery: true
    },
    {
        id: 14,
        title: "Volvo LED Headlamp Control Module",
        brand: "Volvo",
        compatibility: "Volvo XC40, V60, V90",
        price: 15400,
        originalPrice: 18500,
        image: "../public/images/products/fog_lamps.jpg",
        category: "electricals",
        badge: "New Arrival",
        fastDelivery: true
    },
    {
        id: 15,
        title: "BMW Brake Disc Rotor Set (Front)",
        brand: "BMW",
        compatibility: "BMW 2 Series, 3 Series, 4 Series",
        price: 18000,
        originalPrice: 22500,
        image: "../public/images/products/brake_rotor.jpg",
        category: "brakes",
        badge: "",
        fastDelivery: false
    },
    {
        id: 16,
        title: "Audi Cooling Fan Assembly",
        brand: "Audi",
        compatibility: "Audi Q5, Q7, A6",
        price: 24500,
        originalPrice: 29800,
        image: "../public/images/products/shock-absorber.jpg",
        category: "engine",
        badge: "",
        fastDelivery: true
    },
    {
        id: 17,
        title: "Volvo Cabin AC Filter with Carbon",
        brand: "Volvo",
        compatibility: "Volvo S60, XC60, XC90",
        price: 2100,
        originalPrice: 2800,
        image: "../public/images/products/air-filter.jpg",
        category: "engine",
        badge: "Eco-Friendly",
        fastDelivery: true
    }
];

// --- DOM Elements & State ---
let cart = [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Visitor Tracker Already Init at top
    initSlider();
    initTestimonialsCarousel();
    initCustomDropdown();
    renderFeaturedProducts();
    setupCartListeners();
    setupSearch();
    setupScrollEffects();
    setupMobileMenu();
    setupMobileSearch();
    setupHelpDropdown();
    checkPaymentStatus();
    initScrollToTop();
});

// Show a toast based on PayU callback redirect params (?payment=success|failed)
function checkPaymentStatus() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment');
    if (!status) return;

    const isSuccess = status === 'success';
    const message = isSuccess
        ? 'Payment successful! Your order is confirmed.'
        : 'Payment failed or was cancelled. Please try again.';

    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
        'background:' + (isSuccess ? '#22c55e' : '#ef4444'),
        'color:#fff', 'padding:14px 28px', 'border-radius:8px',
        'font-weight:600', 'font-size:0.95rem', 'z-index:9999',
        'box-shadow:0 4px 16px rgba(0,0,0,0.18)', 'transition:opacity .4s',
    ].join(';');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after 5 s and clean up URL params
    setTimeout(() => { toast.style.opacity = '0'; }, 4600);
    setTimeout(() => { toast.remove(); }, 5000);
    window.history.replaceState({}, '', window.location.pathname);
}

// --- Move Tidio chat widget to bottom-LEFT ---
// Tidio sets its own position via inline JS, so CSS alone can't override it.
// We watch for the element to appear and forcibly reposition it.
(function moveTidioToLeft() {
    function applyTidioLeft() {
        const el = document.getElementById('tidio-chat');
        if (!el) return;
        // Only write styles when the position has actually drifted — avoids
        // triggering paint/composite cycles on every interval tick, which
        // caused visible jitter on mobile product pages.
        if (el.style.getPropertyValue('left') !== '20px') {
            el.style.setProperty('left', '20px', 'important');
            el.style.setProperty('right', 'auto', 'important');
            el.style.setProperty('bottom', '80px', 'important');
        }
        const iframe = document.getElementById('tidio-chat-code');
        if (iframe && iframe.style.getPropertyValue('left') !== '0px') {
            iframe.style.setProperty('left', '0px', 'important');
            iframe.style.setProperty('right', 'auto', 'important');
            iframe.style.setProperty('bottom', '80px', 'important');
        }
    }

    // Watch for Tidio being injected into the DOM
    const observer = new MutationObserver(() => {
        if (document.getElementById('tidio-chat')) {
            applyTidioLeft();
            // Keep watching in case Tidio repositions itself
            setInterval(applyTidioLeft, 1000);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();

// --- Custom Dropdown Logic ---
function initCustomDropdown() {
    const customDropdown = document.getElementById('custom-dropdown');
    if (!customDropdown) return;

    const dropdownText = document.getElementById('dropdown-text');
    const dropdownOptions = document.querySelectorAll('.dropdown-options li');

    // Toggle dropdown
    customDropdown.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'li') return;
        customDropdown.classList.toggle('active');
    });

    // Select option
    dropdownOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            if (value) {
                const prefix = window.location.pathname.includes('/after-market-parts/') ? '../' : '';
                window.location.href = prefix + `brand.html?id=${value}`;
            } else if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                const prefix = window.location.pathname.includes('/after-market-parts/') ? '../' : '';
                window.location.href = prefix + 'index.html';
            }
            if (dropdownText) dropdownText.textContent = option.textContent;
            customDropdown.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#custom-dropdown')) {
            customDropdown.classList.remove('active');
        }
    });
}

// --- Slider Logic ---
function initTestimonialsCarousel() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    const dotsContainer = document.getElementById('testimonials-dots');
    const prevBtn = document.getElementById('testimonials-prev');
    const nextBtn = document.getElementById('testimonials-next');

    let current = 0;
    let interval;

    function goTo(idx) {
        const count = track.children.length;
        if (!count) return;
        current = (idx + count) % count;
        track.style.transform = `translateX(-${current * 100}%)`;
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === current));
        }
        resetInterval();
    }

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        Array.from(track.children).forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'dot active' : 'dot';
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function resetInterval() {
        clearInterval(interval);
        interval = setInterval(() => goTo(current + 1), 5000);
    }

    function init() {
        buildDots();
        goTo(0);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // CMS populates the track asynchronously — observe until cards are injected
    if (track.children.length > 0) {
        init();
    } else {
        const observer = new MutationObserver(() => {
            if (track.children.length > 0) {
                observer.disconnect();
                init();
            }
        });
        observer.observe(track, { childList: true });
    }
}

function initSlider() {
    const heroSlider = document.getElementById('hero-slider');
    if (!heroSlider) return;

    const slides = heroSlider.querySelectorAll('.slide');
    if (!slides.length) return;

    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    let currentSlide = 0;
    let slideInterval;

    // Create dots if container exists
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; // Clear existing
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    const updateSlider = () => {
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (slides[currentSlide]) slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    };

    const goToSlide = (index) => {
        currentSlide = index;
        updateSlider();
        resetInterval();
    };

    const resetInterval = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });

    // Touch swipe support for mobile
    let touchStartX = 0;
    heroSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    heroSlider.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
            if (dx < 0) { nextSlide(); } else { prevSlide(); }
            resetInterval();
        }
    }, { passive: true });

    // Ensure first slide is active immediately
    updateSlider();

    // Start auto slider
    resetInterval();
}

// --- Formatting ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// --- Product Rendering ---
function renderFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products');
    if (!featuredGrid) return;

    featuredGrid.innerHTML = '';

    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const qParam = params.get('q');

    if (catParam) {
        window.ACTIVE_CATEGORY = catParam;
        const pageTitle = document.querySelector('.page-header h1');
        if (pageTitle) {
            const displayTitle = catParam.charAt(0).toUpperCase() + catParam.slice(1) + " Components";
            pageTitle.innerHTML = `${displayTitle.replace("Brakes Components", "Brake Systems").replace("Electricals Components", "Electricals & Lighting")}`;
        }
    }

    let productsToRender = products;

    if (qParam) {
        // Search results page: filter the full catalog by the query
        const term = qParam.toLowerCase().trim();
        productsToRender = products.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            (p.compatibility && p.compatibility.toLowerCase().includes(term))
        );

        // Update page header meta
        const searchTermEl = document.querySelector('.search-term');
        if (searchTermEl) searchTermEl.textContent = '"' + qParam + '"';
        const countEl = document.getElementById('product-count');
        if (countEl) countEl.textContent = productsToRender.length;

        // Pre-populate the search inputs with the query
        const searchInputEl = document.getElementById('search-input');
        if (searchInputEl) searchInputEl.value = qParam;
        const mobileInputEl = document.getElementById('mobile-search-input');
        if (mobileInputEl) mobileInputEl.value = qParam;
    } else if (window.__sbCmsFeatured && window.__sbCmsFeatured.length > 0 && !window.ACTIVE_CATEGORY) {
        // Support CMS-driven featured products if they exist and we're not on a category filter
        productsToRender = window.__sbCmsFeatured.map((p, idx) => ({
            id: p.id || ('cms-' + idx),
            title: p.title,
            brand: p.brand,
            price: p.price,
            originalPrice: p.mrp || p.price,
            image: p.img,
            compatibility: 'Genuine Spare Part',
            category: 'featured',
            badge: '',
            fastDelivery: true
        }));
    } else if (window.ACTIVE_CATEGORY) {
        productsToRender = products.filter(p => p.category === window.ACTIVE_CATEGORY);
    }

    productsToRender.forEach((product, index) => {
        // Add staggered animation delay
        const delay = index * 0.1;

        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.style.animationDelay = `${delay}s`;

        // Add data attributes for filtering
        const discountVal = product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

        card.setAttribute('data-price', product.price);
        card.setAttribute('data-vehicles', product.compatibility.toLowerCase());
        card.setAttribute('data-discount', discountVal);
        card.setAttribute('data-fast-delivery', product.fastDelivery ? 'true' : 'false');

        const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';

        // Check if item is already in cart
        const isInCart = cart.some(item => item.id === product.id);
        const btnClass = isInCart ? 'add-cart-btn added' : 'add-cart-btn';
        const btnIcon = isInCart ? 'fa-check' : 'fa-plus';

        const detailUrl = `product.html?id=${encodeURIComponent(product.title)}&price=${product.price}&mrp=${product.originalPrice || product.price}&img=${encodeURIComponent(product.image)}&brand=${encodeURIComponent(product.brand)}&vehicle=${encodeURIComponent(product.compatibility || '')}`;

        card.innerHTML = `
            <div class="product-img-wrap">
                ${badgeHtml}
                <a href="${detailUrl}">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </a>
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-title"><a href="${detailUrl}">${product.title}</a></h3>
                <div class="product-price">
                    ${formatCurrency(product.price)}
                    ${product.originalPrice > product.price ? `<span>${formatCurrency(product.originalPrice)}</span>` : ''}
                </div>
                <div class="product-compatibility">
                    <i class="fa-solid fa-circle-check"></i> ${product.compatibility}
                </div>
                <div class="product-actions">
                    <button class="btn view-details-btn" onclick="window.location.href='${detailUrl}'">
                        <i class="fa-solid fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary ${btnClass}" data-id="${product.id}" onclick="toggleCartItem(${product.id}, this)">
                        <i class="fa-solid ${btnIcon}"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;

        featuredGrid.appendChild(card);
    });
}

// --- Cart Logic ---
function setupCartListeners() {
    // Re-append cart elements to body so they come AFTER Tidio in DOM order,
    // ensuring they naturally stack above it at the same z-index level.
    const cartOverlayEl = document.getElementById('cart-overlay');
    const cartSidebarEl = document.getElementById('cart-sidebar');
    if (cartOverlayEl && cartSidebarEl) {
        document.body.appendChild(cartOverlayEl);
        document.body.appendChild(cartSidebarEl);
    }

    const cartToggle = document.getElementById('cart-toggle');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');

    // MutationObserver approach: watch the entire document for any Tidio element
    // being added/shown while cart is open and immediately hide it.
    let _cartIsOpen = false;
    let _tidioObserver = null;

    function suppressTidioNode(node) {
        if (!node || node.nodeType !== 1) return;
        const id = (node.id || '').toLowerCase();
        const cls = (node.className || '').toLowerCase();
        if (id.includes('tidio') || cls.includes('tidio')) {
            node.style.setProperty('display', 'none', 'important');
            node.style.setProperty('visibility', 'hidden', 'important');
        }
    }

    window.hideTidio = () => {
        _cartIsOpen = true;
        document.body.classList.add('cart-open');

        // Immediately hide all existing Tidio elements
        document.querySelectorAll('[id*="tidio"], [class*="tidio"]').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
        });

        // Start mutation observer to re-hide any Tidio elements that appear later
        if (!_tidioObserver) {
            _tidioObserver = new MutationObserver(mutations => {
                if (!_cartIsOpen) return;
                mutations.forEach(m => {
                    m.addedNodes.forEach(suppressTidioNode);
                    if (m.type === 'attributes' && m.target) suppressTidioNode(m.target);
                });
            });
            _tidioObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
    };

    window.showTidio = () => {
        _cartIsOpen = false;
        document.body.classList.remove('cart-open');

        // Stop observer
        if (_tidioObserver) {
            _tidioObserver.disconnect();
            _tidioObserver = null;
        }

        // Restore Tidio
        document.querySelectorAll('[id*="tidio"], [class*="tidio"]').forEach(el => {
            el.style.removeProperty('display');
            el.style.removeProperty('visibility');
        });
    };

    if (cartToggle && cartOverlay && cartSidebar) {
        cartToggle.addEventListener('click', () => {
            // Re-append to body end so cart elements are last in DOM order.
            // Tidio loads async and appends its iframe after page load, so without
            // this re-append, Tidio's z-index tie would win due to later DOM position.
            document.body.appendChild(cartOverlay);
            document.body.appendChild(cartSidebar);
            cartOverlay.classList.add('active');
            cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
            window.hideTidio();
        });
    }

    const closeCart = () => {
        if (cartOverlay) cartOverlay.classList.remove('active');
        if (cartSidebar) cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
        window.showTidio();
    };

    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    let proceedPayBtn = document.getElementById('proceed-pay-btn');
    let checkoutModal = document.getElementById('checkout-modal');
    let checkoutModalOverlay = document.getElementById('checkout-modal-overlay');

    // Dynamically inject checkout modal if missing
    if (!checkoutModal) {
        const modalHtml = `
            <div class="checkout-modal-overlay" id="checkout-modal-overlay"></div>
            <div class="checkout-modal" id="checkout-modal">
                <div class="checkout-header">
                    <h3>Complete Your Order</h3>
                    <button class="close-btn" id="close-checkout"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="checkout-body">
                    <form id="checkout-form">
                        <div class="form-group">
                            <label for="checkout-name">Full Name <span class="required">*</span></label>
                            <input type="text" id="checkout-name" placeholder="Enter your full name">
                            <div class="error-msg" id="error-name">Name is required</div>
                        </div>
                        <div class="form-group">
                            <label for="checkout-email">Email Address <span class="required">*</span></label>
                            <input type="email" id="checkout-email" placeholder="Enter your email">
                            <div class="error-msg" id="error-email">Valid email is required</div>
                        </div>
                        <div class="form-group">
                            <label for="checkout-phone">Phone Number <span class="required">*</span></label>
                            <input type="tel" id="checkout-phone" placeholder="10-digit mobile number">
                            <div class="error-msg" id="error-phone">Valid 10-digit phone is required</div>
                        </div>
                        <div class="form-group">
                            <label for="checkout-address">Delivery Address <span class="required">*</span></label>
                            <textarea id="checkout-address" rows="3" placeholder="Enter full delivery address"></textarea>
                            <div class="error-msg" id="error-address">Address is required</div>
                        </div>
                    </form>
                </div>
                <div class="checkout-footer">
                    <div class="checkout-amount-display">
                        Total to Pay: <span id="checkout-final-amount">₹0</span>
                    </div>
                    <button type="button" class="btn btn-primary w-100" id="proceed-pay-btn">
                        Proceed to Pay <i class="fa-solid fa-lock"></i>
                    </button>
                    <div class="payment-methods-icons">
                        <i class="fa-brands fa-cc-visa"></i>
                        <i class="fa-brands fa-cc-mastercard"></i>
                        <span>UPI</span>
                        <span>Net Banking</span>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        proceedPayBtn = document.getElementById('proceed-pay-btn');
        checkoutModal = document.getElementById('checkout-modal');
        checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
    }

    const closeCheckoutBtn = document.getElementById('close-checkout');

    const closeCheckout = () => {
        if (checkoutModal) checkoutModal.classList.remove('active');
        if (checkoutModalOverlay) checkoutModalOverlay.classList.remove('active');
    };

    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckout);
    if (checkoutModalOverlay) checkoutModalOverlay.addEventListener('click', closeCheckout);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                // Hide cart sidebar & open checkout modal
                closeCart();

                // Set total
                const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                document.getElementById('checkout-final-amount').textContent = formatCurrency(totalAmount);

                // Show checkout modal
                if (checkoutModalOverlay) checkoutModalOverlay.classList.add('active');
                if (checkoutModal) checkoutModal.classList.add('active');
            }
        });
    }

    if (proceedPayBtn) {
        proceedPayBtn.addEventListener('click', async () => {
            // Validate form
            const nameInput = document.getElementById('checkout-name');
            const emailInput = document.getElementById('checkout-email');
            const phoneInput = document.getElementById('checkout-phone');
            const addressInput = document.getElementById('checkout-address');

            let isValid = true;

            // Name validation
            if (!nameInput.value.trim()) {
                nameInput.parentElement.classList.add('has-error');
                isValid = false;
            } else {
                nameInput.parentElement.classList.remove('has-error');
            }

            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                emailInput.parentElement.classList.add('has-error');
                isValid = false;
            } else {
                emailInput.parentElement.classList.remove('has-error');
            }

            // Phone validation
            const phonePattern = /^[0-9]{10}$/;
            if (!phonePattern.test(phoneInput.value.trim().replace(/[^0-9]/g, ''))) {
                phoneInput.parentElement.classList.add('has-error');
                isValid = false;
            } else {
                phoneInput.parentElement.classList.remove('has-error');
            }

            // Address validation
            if (!addressInput.value.trim()) {
                addressInput.parentElement.classList.add('has-error');
                isValid = false;
            } else {
                addressInput.parentElement.classList.remove('has-error');
            }

            if (isValid) {
                proceedPayBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
                proceedPayBtn.disabled = true;

                try {
                    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    const firstname = nameInput.value.trim().replace(/[^a-zA-Z\s]/g, '');
                    const email = emailInput.value.trim();
                    const phone = phoneInput.value.trim().replace(/[^0-9]/g, '');

                    // Get PayU form params (including hash) from the Vercel serverless function.
                    // The salt never leaves the server — this keeps credentials secure.
                    // const res = await fetch('/api/payments/initiate', {
                    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                        ? 'http://localhost:5000'
                        : 'https://api.spareblaze.com';

                    const res = await fetch(`${API_BASE_URL}/api/v1/payments/initiate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            firstname,
                            email,
                            phone,
                            amount: totalAmount,
                            productinfo: 'SpareBlaze Auto Parts Order',
                            address: addressInput.value.trim(),
                            items: cart.map(item => ({
                                id:       item.id,
                                name:     item.title || item.name || 'Auto Part',
                                brand:    item.brand || '',
                                price:    item.price,
                                mrp:      item.mrp || item.price,
                                quantity: item.quantity,
                                img:      item.img || item.image || '',
                            })),
                        }),
                    });

                    if (!res.ok) throw new Error('Backend payment initiation failed');

                    const { data: { payuEndpoint, params } } = await res.json();

                    // Submit form directly to PayU with server-generated hash
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = payuEndpoint;

                    for (const [name, value] of Object.entries(params)) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = name;
                        input.value = value;
                        form.appendChild(input);
                    }

                    document.body.appendChild(form);
                    form.submit();

                } catch (err) {
                    console.error('Payment initiation error:', err);
                    proceedPayBtn.innerHTML = 'Proceed to Pay 🔒';
                    proceedPayBtn.disabled = false;
                    alert('Unable to initiate payment. Please try again.');
                }
            }
        });
    }
}

window.addToCart = function (productData) {
    let existingItemIndex = cart.findIndex(item => item.id === productData.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...productData, quantity: 1 });
    }

    updateCartUI();
    document.getElementById('cart-overlay').classList.add('active');
    document.getElementById('cart-sidebar').classList.add('active');
};

window.buyNow = function (productData) {
    // Add item if not exist
    let existingItemIndex = cart.findIndex(item => item.id === productData.id);
    if (existingItemIndex === -1) {
        cart.push({ ...productData, quantity: 1 });
        updateCartUI();
    }

    // Simulate clicking the checkout button immediately
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn && !checkoutBtn.disabled) {
        checkoutBtn.click();
    }
};

window.toggleCartItem = function (productId, btnElement) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        // Remove from cart
        cart.splice(existingItemIndex, 1);
        btnElement.classList.remove('added');
        btnElement.querySelector('i').className = 'fa-solid fa-plus';
    } else {
        // Add to cart with default qty 1
        cart.push({ ...product, quantity: 1 });
        btnElement.classList.add('added');
        btnElement.querySelector('i').className = 'fa-solid fa-check';

        // Optional: Auto open cart on first add
        if (cart.length === 1) {
            cartOverlay.classList.add('active');
            cartSidebar.classList.add('active');
        }
    }

    updateCartUI();
};

window.updateQuantity = function (productId, change) {
    // productId could be int from mockup or string from generate_pages.js payload
    const item = cart.find(i => i.id == productId);
    if (item) {
        if (change > 0) {
            item.quantity += 1;
        } else if (change < 0 && item.quantity > 1) {
            item.quantity -= 1;
        }
        updateCartUI();
    }
};

window.removeFromCart = function (productId) {
    cart = cart.filter(item => item.id != productId);

    // Update product card button if it exists on page
    const btnElement = document.querySelector(`.add-cart-btn[data-id="${productId}"]`);
    if (btnElement) {
        btnElement.classList.remove('added');
        btnElement.querySelector('i').className = 'fa-solid fa-plus';
    }

    updateCartUI();
};

function updateCartUI() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Update badge numbers
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        // Pulse animation
        el.style.transform = 'scale(1.2)';
        setTimeout(() => el.style.transform = 'scale(1)', 200);
    });

    // Update cart items container
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is currently empty.</div>';
        if (cartTotalAmount) cartTotalAmount.textContent = formatCurrency(0);
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalAmount = 0;

    cart.forEach(item => {
        totalAmount += item.price * item.quantity;
        let pIdString = typeof item.id === 'string' ? `'${item.id}'` : item.id;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item fade-in';
        itemEl.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.title}" style="width:50px; height:50px; object-fit:contain;">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
                <div class="cart-item-actions">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQuantity(${pIdString}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${pIdString}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${pIdString})">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    if (cartTotalAmount) cartTotalAmount.textContent = formatCurrency(totalAmount);
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// --- Search Logic ---
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Navigate to (or re-filter on) the search page with the current query
    function navigateToSearch() {
        const q = searchInput.value.trim();
        if (!q) return;
        window.location.href = 'search.html?q=' + encodeURIComponent(q);
    }

    // Wire the search button
    const searchBtn = searchInput.closest('.search-container')
        ? searchInput.closest('.search-container').querySelector('.search-btn')
        : null;
    if (searchBtn) {
        searchBtn.removeAttribute('onclick');
        searchBtn.addEventListener('click', navigateToSearch);
    }

    // Submit on Enter
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigateToSearch();
    });

    // Autocomplete dropdown (only present on pages that include #search-results)
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchInput.addEventListener('input', (e) => {
        const rawQuery = e.target.value.trim();
        const query = rawQuery.toLowerCase();

        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        const filtered = products.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            p.compatibility.toLowerCase().includes(query)
        );

        const searchUrl = 'search.html?q=' + encodeURIComponent(rawQuery);

        if (filtered.length > 0) {
            searchResults.innerHTML = filtered.slice(0, 5).map(p => `
            <div class="search-result-item" onclick="window.location.href='${searchUrl}'">
                    <i class="fa-solid fa-cog" style="font-size: 1.5rem; color: var(--color-text-muted);"></i>
                    <div class="search-result-info">
                        <h4>${p.title}</h4>
                        <p>${p.brand} · ${formatCurrency(p.price)}</p>
                    </div>
                </div>
            `).join('');

            // Add view all link if there are many results
            if (filtered.length > 5) {
                searchResults.innerHTML += `
            <div class="search-result-item" style="justify-content: center; color: var(--color-primary); font-weight: 500;" onclick="window.location.href='${searchUrl}'">
                View all ${filtered.length} results
            </div>
            `;
            }
        } else {
            searchResults.innerHTML = `
            <div class="search-result-item" style="justify-content: center; color: var(--color-text-muted);">
                No parts found for "${rawQuery}"
            </div>
            `;
        }

        searchResults.classList.add('active');
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
}

// --- Scroll Effects ---
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function updateScrolled() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // WHY: product pages (and legacy static pages) hardcode class="navbar scrolled"
    // in HTML. Mobile Chrome fires a synthetic scroll event as the URL bar
    // collapses on page load with scrollY still near 0, which removes .scrolled
    // and triggers the CSS transition: background/box-shadow (0.3s). The navbar's
    // backdrop-filter then forces a full compositor repaint during those 0.3s —
    // that is exactly what causes the visible shiver on mobile product pages.
    //
    // Fix: suppress the transition before syncing the initial scroll state, then
    // re-enable it after the browser has committed the first paint (double-rAF).
    navbar.style.transition = 'none';
    updateScrolled();
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            navbar.style.transition = '';
        });
    });

    window.addEventListener('scroll', updateScrolled, { passive: true });
}

// --- Mobile Menu (hamburger) ---
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    if (!btn) return;

    // Build the mobile nav menu element dynamically (avoids duplicate HTML in every page)
    let menu = document.getElementById('mobile-nav-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'mobile-nav-menu';
        menu.className = 'mobile-nav-menu';
        menu.innerHTML = `
            <div class="mobile-nav-header">Shop By Type</div>
            <ul>
                <li><a href="categories.html"><i class="fa-solid fa-bars-staggered" style="width:1.2em"></i> All Categories</a></li>
                <li><a href="after-market.html">After Market</a></li>
                <li><a href="refurbished.html">Refurbished</a></li>
                <li><a href="used.html">Used</a></li>
                <li><a href="oem.html">OEM</a></li>
                <li><a href="wholesale.html">Wholesale</a></li>
            </ul>`;
        document.body.appendChild(menu);
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        btn.classList.toggle('active', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking outside the menu or the button
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mobile-nav-menu') && !e.target.closest('#mobile-menu-btn')) {
            menu.classList.remove('open');
            btn.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// --- Mobile Search (vehicle select + search input) ---
function setupMobileSearch() {
    const mobileInput = document.getElementById('mobile-search-input');
    const mobileResults = document.getElementById('mobile-search-results');
    const mobileSelect = document.getElementById('mobile-vehicle-select');
    if (!mobileInput) return;

    // Vehicle select: navigate to brand page (same logic as desktop dropdown)
    if (mobileSelect) {
        mobileSelect.addEventListener('change', () => {
            const value = mobileSelect.value;
            if (!value) return;
            const prefix = window.location.pathname.includes('/after-market-parts/') ? '../' : '';
            window.location.href = prefix + `brand.html?id=${value}`;
        });
    }

    // Navigate to search page with the current mobile query
    function navigateToMobileSearch() {
        const q = mobileInput.value.trim();
        if (!q) return;
        window.location.href = 'search.html?q=' + encodeURIComponent(q);
    }

    // Wire the mobile search button
    const mobileSearchBtn = mobileInput.closest('.mobile-search-wrap')
        ? mobileInput.closest('.mobile-search-wrap').querySelector('.mobile-search-btn')
        : null;
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', navigateToMobileSearch);
    }

    // Submit on Enter
    mobileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigateToMobileSearch();
    });

    // Autocomplete dropdown
    if (!mobileResults) return;

    mobileInput.addEventListener('input', (e) => {
        const rawQuery = e.target.value.trim();
        const query = rawQuery.toLowerCase();
        if (query.length < 2) {
            mobileResults.classList.remove('active');
            return;
        }

        const filtered = products.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            (p.compatibility && p.compatibility.toLowerCase().includes(query))
        );

        const searchUrl = 'search.html?q=' + encodeURIComponent(rawQuery);

        if (filtered.length > 0) {
            mobileResults.innerHTML = filtered.slice(0, 5).map(p => `
                <div class="search-result-item" onclick="window.location.href='${searchUrl}'">
                    <i class="fa-solid fa-cog" style="font-size:1.3rem;color:var(--color-text-muted)"></i>
                    <div class="search-result-info">
                        <h4>${p.title}</h4>
                        <p>${p.brand} · ${formatCurrency(p.price)}</p>
                    </div>
                </div>`).join('');
        } else {
            mobileResults.innerHTML = `
                <div class="search-result-item" style="justify-content:center;color:var(--color-text-muted)">
                    No parts found for "${rawQuery}"
                </div>`;
        }
        mobileResults.classList.add('active');
    });

    // Close results on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-search')) {
            mobileResults.classList.remove('active');
        }
    });
}

// --- Global CTA Logic ---
window.addToCart = function (product) {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, image: product.img || product.image });
    }
    updateCartUI();

    // Open cart
    if (cartOverlay && cartSidebar) {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.buyNow = function (product) {
    window.addToCart(product);
};




// --- Help Dropdown (nav bar) ---
function setupHelpDropdown() {
    const helpItem = document.querySelector('.help-nav-item');
    const helpLink = document.querySelector('.help-nav-link');
    if (!helpItem || !helpLink) return;

    // Toggle open/closed on click (works on desktop AND touch/mobile)
    helpLink.addEventListener('click', (e) => {
        e.stopPropagation();
        helpItem.classList.toggle('open');
    });

    // Close when clicking anywhere outside the dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.help-nav-item')) {
            helpItem.classList.remove('open');
        }
    });

    // Close when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') helpItem.classList.remove('open');
    });

    // Inject Help links into the mobile hamburger menu (built dynamically in setupMobileMenu)
    // We wait a tick so setupMobileMenu has already created the menu element
    setTimeout(() => {
        const mobileMenu = document.getElementById('mobile-nav-menu');
        if (!mobileMenu || mobileMenu.querySelector('.mobile-help-header')) return;

        const helpSection = document.createElement('div');
        helpSection.innerHTML = `
            <div class="mobile-nav-header mobile-help-header">Help</div>
            <ul>
                <li><a href="faq.html"><i class="fa-solid fa-comments" style="width:1.2em"></i> FAQ</a></li>
                <li><a href="shipping-info.html"><i class="fa-solid fa-truck-fast" style="width:1.2em"></i> Shipping Policy</a></li>
                <li><a href="return-policy.html"><i class="fa-solid fa-rotate-left" style="width:1.2em"></i> Return Policy</a></li>
                <li><a href="size-guide.html"><i class="fa-solid fa-ruler" style="width:1.2em"></i> Size Guide</a></li>
                <li><a href="track-order.html"><i class="fa-solid fa-map-location-dot" style="width:1.2em"></i> Track Order</a></li>
                <li><a href="contact-us.html"><i class="fa-solid fa-headset" style="width:1.2em"></i> Contact Us</a></li>
            </ul>`;
        mobileMenu.appendChild(helpSection);
    }, 0);
}

function initScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
