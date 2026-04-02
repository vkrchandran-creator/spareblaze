/**
 * SpareBlaze CMS Admin Panel Script
 */

// ── API base URL — resolved immediately, before anything else runs ────────────
// Must be var (not const/let) so it is hoisted and safe to use from any
// function defined anywhere in this file.
var API = (function () {
    var proto = window.location.protocol;
    var host  = window.location.hostname;
    if (proto === 'file:')                          return 'http://localhost:5000';
    if (host  === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
    return 'https://api.spareblaze.com';
}());

// ── file:// warning — show banner and block DB features ──────────────────────
var IS_FILE_PROTOCOL = window.location.protocol === 'file:';
if (IS_FILE_PROTOCOL) {
    document.addEventListener('DOMContentLoaded', function () {
        var banner = document.createElement('div');
        banner.id = 'file-protocol-banner';
        banner.style.cssText = [
            'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
            'background:#b45309', 'color:#fff', 'padding:.75rem 1.5rem',
            'font-size:.9rem', 'display:flex', 'align-items:center', 'gap:1rem',
            'box-shadow:0 2px 8px rgba(0,0,0,.4)'
        ].join(';');
        banner.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation" style="font-size:1.1rem;flex-shrink:0"></i>' +
            '<span><strong>Admin panel opened as a local file.</strong> ' +
            'DB features (Categories, Products, Inventory) require the backend to be reachable. ' +
            'Open via a local server: run <code style="background:rgba(0,0,0,.25);padding:2px 6px;border-radius:4px">npx serve frontend</code> ' +
            'from the project root, then visit <strong>http://localhost:3000/pages/admin/</strong></span>';
        document.body.insertBefore(banner, document.body.firstChild);
    });
}

const STORAGE_KEY = 'sb_cms_data';
const AUTH_KEY = 'sb_admin_auth';
const CRED_KEY = 'sb_admin_creds';
const RECOVERY_KEY = 'sb_admin_recovery';
const DEFAULT_USER = 'spareblaze.com';
const DEFAULT_PASS = 'blaze26**';
const DEFAULT_SQ = 'What is your primary brand?';
const DEFAULT_SA = 'spareblaze';

// Default CMS Data
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
        phone: '+91 7259955674',
        phone2: '+91 8050819131',
        email: 'support@spareblaze.com',
        address: 'Bengaluru, Karnataka, India',
        whatsapp: '+91 7259955674',
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
        { icon: '../public/images/engine.jpg', color: '#e63900', name: 'Engine Components', href: 'after-market.html' },
        { icon: '../public/images/brake.jpg', color: '#c0392b', name: 'Brake Systems', href: 'after-market.html' },
        { icon: '../public/images/steering.jpg', color: '#2980b9', name: 'Suspension & Steering', href: 'after-market.html' },
        { icon: '../public/images/battery.jpg', color: '#f39c12', name: 'Electricals & Lighting', href: 'after-market.html' }
    ],
    ctaBanner: {
        headline: 'Need Help Finding The Right Part?',
        desc: 'Our automotive experts are here to assist you in finding the exact fit for your Indian vehicle model.',
        btnText: 'Contact Experts'
    },
    slides: [
        { id: 1, bg: '../public/images/slider-suspension.jpg', badge: '100% Genuine Parts', headline: 'Performance Meets Reliability', highlight: 'Reliability', subtitle: 'The ultimate destination for premium car and SUV spare parts tailored for Indian roads.', cta: 'Shop Now', ctaLink: 'categories.html', cta2: 'Browse Categories', cta2Link: 'wholesale.html' },
        { id: 2, bg: '../public/images/slider-brake-pad.jpg', badge: 'Monsoon Ready', headline: 'Upgrade Your Brakes', highlight: 'Brakes', subtitle: "Don't compromise on safety. Up to 20% off on premium brake pads and rotors.", cta: 'View Offers', ctaLink: 'after-market.html', cta2: '', cta2Link: '' },
        { id: 3, bg: '../public/images/slider-engine.jpg', badge: 'OEM Certified', headline: 'Keep Your Engine Pristine', highlight: 'Pristine', subtitle: 'Shop authentic oil filters and engine components from authorized distributors.', cta: 'Shop Engine Parts', ctaLink: 'after-market.html', cta2: '', cta2Link: '' }
    ],
    featuredProducts: [
        { title: 'Chevrolet Cruze LED Headlights DRL Projector Lens (2009–2016)', brand: 'Chevrolet', price: 35000, mrp: 38000, img: '../public/images/products/cruze_headlights.png' },
        { title: 'High-Quality Genuine Clutch Disc & Kit Set for Nissan', brand: 'Nissan', price: 18000, mrp: 19000, img: '../public/images/products/nissan_clutch_kit.png' },
        { title: 'FF-5059M Fog Light with Bracket (RH) for Mahindra Scorpio S2/S3', brand: 'Mahindra', price: 975, mrp: 1255, img: '../public/images/products/scorpio_fog_light.png' },
        { title: 'High-Performance Brake Caliper Piston 9040 with Big Brake Disc', brand: 'Brembo', price: 92000, mrp: 110000, img: '../public/images/products/brake_rotor.jpg' },
        { title: 'BCM (Body Control Module) for Chevrolet Cruze – Automatic Used', brand: 'Chevrolet', price: 15000, mrp: 20000, img: '../public/images/products/fog_lamps.jpg' },
        { title: 'Premium Alloy Wheels – Style, Strength, and Performance', brand: 'Universal', price: 18000, mrp: 25000, img: '../public/images/products/brake_rotor.jpg' }
    ],
    categories: [
        {
            id: 'after-market', title: 'After Market Parts', badge: 'After Market', desc: 'High-quality aftermarket replacement parts at competitive prices.', products: [
                { name: 'Bosch After Market Brake Pads – Front Set', price: 1299, mrp: 1800, cat: 'Brakes', img: '' },
                { name: 'TRW Tie Rod End Assembly (Pair)', price: 890, mrp: 1200, cat: 'Suspension', img: '' },
                { name: 'Valeo Clutch Plate & Pressure Set', price: 3400, mrp: 4200, cat: 'Drivetrain', img: '' },
                { name: 'Hella Headlamp Assembly – H4 Dual', price: 2100, mrp: 2900, cat: 'Lighting', img: '' },
                { name: 'Monroe Gas Shock Absorber – Rear (Pair)', price: 2800, mrp: 3600, cat: 'Suspension', img: '' },
                { name: 'NGK Spark Plugs (Set of 4)', price: 940, mrp: 1200, cat: 'Engine', img: '' }
            ]
        },
        {
            id: 'refurbished', title: 'Refurbished Parts', badge: 'Refurbished', desc: 'Professionally restored automotive components tested to perform like new.', products: [
                { name: 'Refurbished Alternator – 12V 70A', price: 4200, mrp: 8500, cat: 'Electricals', img: '' },
                { name: 'Refurbished AC Compressor', price: 5800, mrp: 12000, cat: 'AC System', img: '' },
                { name: 'Reconditioned Starter Motor', price: 3100, mrp: 6200, cat: 'Electricals', img: '' }
            ]
        },
        {
            id: 'used', title: 'Used Parts', badge: 'Used', desc: 'Tested and graded pre-owned spare parts at the lowest prices.', products: [
                { name: 'Used Tata Nexon Front Door Assembly', price: 3500, mrp: 7000, cat: 'Body Parts', img: '' },
                { name: 'Used Maruti Swift Engine Block (K12B)', price: 14000, mrp: 28000, cat: 'Engine', img: '' }
            ]
        },
        {
            id: 'oem', title: 'OEM Genuine Parts', badge: 'OEM Genuine', desc: 'Original Equipment Manufacturer parts from authorized distributors.', products: [
                { name: 'Tata Nexon OEM Oil Filter', price: 380, mrp: 450, cat: 'Filters', img: '' },
                { name: 'Maruti Genuine Air Filter', price: 520, mrp: 620, cat: 'Filters', img: '' }
            ]
        },
        {
            id: 'wholesale', title: 'Wholesale Bundles', badge: 'Wholesale', desc: 'Bulk packs and trade pricing for garages and fleet operators.', products: [
                { name: 'Bosch Oil Filter – Bulk Pack of 50', price: 9500, mrp: 14500, cat: 'Filters', img: '' },
                { name: 'NGK Spark Plugs – Trade Box of 100', price: 18000, mrp: 28000, cat: 'Engine', img: '' }
            ]
        }
    ],
    theme: {
        primary: '#e63900',
        primarySoft: '#ffede6',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    testimonials: [
        { name: 'Rahul Sharma', review: 'Great quality OEM parts at affordable prices. Delivered quickly to Bengaluru! Absolutely satisfied with the product and service.' },
        { name: 'Priya Nair', review: 'Found the exact brake pads I needed for my Maruti Swift. SpareBlaze made it so easy to find genuine parts online. Fast delivery too!' },
        { name: 'Anil Kumar', review: 'SpareBlaze is my go-to for all car spare parts. Genuine products and fast nationwide shipping. Highly recommended for every car owner!' },
        { name: 'Meera Pillai', review: 'Amazing customer support helped me find the right part for my Hyundai Creta. Will definitely order again from SpareBlaze.' }
    ],
    contactPage: {
        pageTitle: 'Contact <span class="highlight">Us</span>',
        pageDesc: 'Our automotive experts are available 6 days a week to help with compatibility, orders, and returns.',
        channels: [
            { icon: 'fa-brands fa-whatsapp', color: 'green', title: 'WhatsApp', value: '+91 72599 55674', hours: 'Fastest response\nMon\u2013Sat \u00a09AM\u20139PM IST', btnText: 'Chat Now', btnHref: 'https://wa.me/917259955674' },
            { icon: 'fa-solid fa-phone', color: 'orange', title: 'Phone', value: '1800 123 4567 (Toll-free)', hours: 'Mon\u2013Sat \u00a09AM\u20137PM IST', btnText: 'Call Now', btnHref: 'tel:18001234567' },
            { icon: 'fa-solid fa-envelope', color: 'blue', title: 'Email', value: 'support@spareblaze.com', hours: 'Response within\n24 business hours', btnText: 'Send Email', btnHref: 'mailto:support@spareblaze.com' },
            { icon: 'fa-solid fa-comments', color: 'purple', title: 'Live Chat', value: 'Chat on this page', hours: 'Mon\u2013Sat \u00a010AM\u20136PM IST', btnText: 'Start Chat', btnHref: '' }
        ],
        infoPanel: {
            title: "We're here for you",
            phone: 'Toll-free: 1800 123 4567',
            whatsapp: 'WhatsApp: +91 72599 55674',
            emails: ['support@spareblaze.com', 'sales@spareblaze.in', 'technical@spareblaze.in'],
            hours: [
                { day: 'Monday \u2013 Friday', time: '9:00 AM \u2013 7:00 PM' },
                { day: 'Saturday', time: '9:00 AM \u2013 5:00 PM' },
                { day: 'Sunday', time: 'Closed' }
            ],
            address: 'SpareBlaze India Pvt. Ltd.\nWhitefield Industrial Zone\nBengaluru \u2013 560066\nKarnataka, India'
        },
        formLabels: {
            heading: 'Send a Message',
            nameLabel: 'Full Name',
            emailLabel: 'Email Address',
            phoneLabel: 'Mobile Number',
            subjectLabel: 'Topic',
            messageLabel: 'Message',
            submitBtn: 'Send Message',
            successMsg: "Message sent! We'll respond to your email within 1 business day."
        },
        quickLinks: [
            { icon: 'fa-solid fa-comments', title: 'FAQ', desc: 'Answers to the most common questions', href: 'faq.html' },
            { icon: 'fa-solid fa-map-location-dot', title: 'Track Order', desc: 'Real-time shipment tracking by Order ID', href: 'track-order.html' },
            { icon: 'fa-solid fa-rotate-left', title: 'Return Policy', desc: '30-day hassle-free returns explained', href: 'return-policy.html' },
            { icon: 'fa-solid fa-truck-fast', title: 'Shipping Policy', desc: 'Delivery timelines, charges & areas', href: 'shipping-info.html' },
            { icon: 'fa-solid fa-ruler-combined', title: 'Size & Fitment Guide', desc: 'Tyre, brake pad & filter size charts', href: 'size-guide.html' },
            { icon: 'fa-brands fa-whatsapp', title: 'WhatsApp Chat', desc: 'Fastest support \u2014 Mon\u2013Sat 9AM\u20139PM', href: 'https://wa.me/917259955674' }
        ]
    },
    faqPage: {
        pageTitle: 'Frequently Asked <span class="highlight">Questions</span>',
        pageDesc: "Everything you need to know about ordering, compatibility, shipping, payments, and returns at SpareBlaze — answered clearly.",
        categories: [
            {
                id: 'cat-orders',
                icon: 'fa-solid fa-cart-shopping',
                title: 'Orders & Payments',
                items: [
                    { question: 'How do I place an order on SpareBlaze?', answer: '<p>Placing an order is straightforward. Use the search bar or browse by category to find the part you need. Select your vehicle make, model, and year to verify compatibility, then click <strong>Add to Cart</strong>. Once you\'ve finished shopping, go to your cart, click <strong>Proceed to Checkout</strong>, enter your delivery address, choose a payment method, and confirm your order.</p><p>You will receive an order confirmation email and SMS with your unique Order ID within a few minutes of successful payment. Keep this ID handy for tracking and support queries.</p>' },
                    { question: 'What payment methods does SpareBlaze accept?', answer: '<p>We support a comprehensive range of payment options to suit every customer:</p><ul><li><strong>UPI</strong> – Google Pay, PhonePe, Paytm, BHIM UPI, and all UPI-enabled apps</li><li><strong>Credit &amp; Debit Cards</strong> – Visa, Mastercard, RuPay (all major Indian banks)</li><li><strong>Net Banking</strong> – Supported for all major Indian banks including SBI, HDFC, ICICI, Axis</li><li><strong>Cash on Delivery (COD)</strong> – Available in select PIN codes for orders under ₹10,000, with an additional ₹49 handling fee</li><li><strong>EMI</strong> – No-cost and low-cost EMI options available on select credit cards (3, 6, 9, and 12-month tenures)</li></ul><p>All transactions are secured by 256-bit SSL encryption and processed through Razorpay, a PCI-DSS Level 1 compliant payment gateway.</p>' },
                    { question: 'Can I cancel or modify my order after placing it?', answer: '<p>Orders can be cancelled or modified within <strong>2 hours</strong> of placement, provided the item has not yet been dispatched from our warehouse. To request a change, contact our support team immediately with your Order ID via:</p><ul><li>Email: <a href="mailto:support@spareblaze.com">support@spareblaze.com</a></li><li>Phone: <a href="tel:+917259955674">+91 7259955674</a> (Mon–Sat, 9 AM – 7 PM IST)</li><li>WhatsApp: <a href="https://wa.me/917259955674" target="_blank" rel="noopener">Chat with us</a></li></ul><p>Once an order has been dispatched, it cannot be cancelled. You may initiate a return upon delivery if you no longer need the item.</p><div class="faq-tip"><i class="fa-solid fa-circle-info"></i><span>Act fast — our warehouse processes orders quickly and the 2-hour window closes once packing begins, even if it is within the 2-hour period.</span></div>' },
                    { question: 'How do I modify the delivery address on my order?', answer: '<p>Address changes are possible only <strong>before the order is dispatched</strong>. Contact support immediately with your Order ID and the corrected delivery address. Once a shipment is in transit, address changes are not possible — you would need to wait for delivery and then return/reorder if required.</p><p>For future orders, you can save multiple delivery addresses under <strong>My Account → Saved Addresses</strong> to avoid this issue.</p>' },
                    { question: 'How do I download my invoice for GST input credit?', answer: '<p>A tax invoice is automatically emailed to your registered address immediately after your order is confirmed. You can also download it any time from <strong>My Account → Order History → [Select Order] → Download Invoice</strong>. All invoices include the GSTIN of SpareBlaze, making them fully valid for GST input tax credit claims for your business.</p><p>If you need to add or update your GSTIN on an invoice, contact support within 48 hours of order placement.</p>' }
                ]
            },
            {
                id: 'cat-shipping',
                icon: 'fa-solid fa-truck-fast',
                title: 'Shipping & Delivery',
                items: [
                    { question: 'How long will my order take to arrive?', answer: '<p>Delivery timelines depend on your location, counted from the dispatch date:</p><ul><li><strong>Metro / Tier-1 Cities</strong> (Mumbai, Delhi, Bengaluru, Chennai, etc.) – 2–4 business days</li><li><strong>Tier-2 Cities</strong> (Jaipur, Lucknow, Coimbatore, Kochi, etc.) – 3–5 business days</li><li><strong>Tier-3 &amp; Rural Areas</strong> – 5–8 business days</li><li><strong>Remote / Hilly Regions</strong> (J&amp;K, North-East, Andaman &amp; Nicobar) – 7–10 business days</li><li><strong>Heavy / Freight Shipments</strong> – Add 2–3 extra days to the above estimates</li></ul><p>All in-stock items are dispatched within <strong>24 hours</strong> of order confirmation (Monday–Saturday). See our full <a href="shipping-info.html">Shipping Policy</a> for details.</p>' },
                    { question: 'Do you offer free shipping? What is the threshold?', answer: '<p><strong>Free shipping</strong> is available on all prepaid orders above <strong>₹1,500</strong>. Orders below this amount attract a flat shipping fee of ₹99. COD orders always carry an additional ₹49 handling charge regardless of order value. Express delivery in select metros costs an extra ₹149.</p><div class="faq-tip"><i class="fa-solid fa-lightbulb"></i><span>Paying via UPI, card, or net banking qualifies your order as prepaid and makes it eligible for free shipping above ₹1,500.</span></div>' },
                    { question: 'Is Cash on Delivery (COD) available everywhere?', answer: '<p>COD is available in most serviceable PIN codes across India but is subject to our logistics partners\' coverage. It is limited to orders under <strong>₹10,000</strong>. To check COD availability for your PIN code, simply enter your address at checkout — the COD option will appear if it is available for your location.</p><p>COD orders carry an additional <strong>₹49 handling fee</strong> and cannot be availed on orders already processed with prepaid payment methods.</p>' },
                    { question: 'What happens if I am not home at the time of delivery?', answer: '<p>If you are unavailable, the delivery agent will attempt redelivery on the next business day. Typically, <strong>up to 3 delivery attempts</strong> are made before the package is returned to our warehouse. You will receive an SMS/call before each attempt.</p><p>If all attempts fail, the order is marked as RTO (Return to Origin) and a refund (minus any applicable COD fee) is processed within 7–10 business days of the package returning to us. To reschedule delivery, contact the courier directly using the tracking number in your dispatch email.</p>' },
                    { question: 'Do you offer express or same-day delivery?', answer: '<p><strong>Express delivery</strong> (1–2 business days) is available for select metro cities — Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, and Pune. The express option will appear at checkout if it is available for your PIN code, with an additional charge of <strong>₹149</strong>. Same-day delivery is not currently available. We are actively expanding express coverage.</p>' }
                ]
            },
            {
                id: 'cat-returns',
                icon: 'fa-solid fa-rotate-left',
                title: 'Returns & Refunds',
                items: [
                    { question: 'What is SpareBlaze\'s return window?', answer: '<p>SpareBlaze offers a generous <strong>30-day return window</strong> from the date of delivery for eligible items. The item must be unused, in its original packaging with all accessories and documentation intact, and accompanied by the original invoice. For defective or damaged items, clear photographic or video evidence must be submitted at the time of raising the return request.</p><p>Read the complete conditions and exclusions in our <a href="return-policy.html">Return Policy</a>.</p>' },
                    { question: 'How do I initiate a return?', answer: '<ol><li><strong>Contact us</strong> within 30 days via email at <a href="mailto:support@spareblaze.com">support@spareblaze.com</a> or call +91 7259955674.</li><li><strong>Provide your Order ID</strong> and photos/video clearly showing the defect or issue.</li><li><strong>Receive approval</strong> — our team reviews the request within 24–48 business hours and issues a Return Authorisation (RA) number.</li><li><strong>Doorstep pickup</strong> is scheduled at no cost to you. Ensure the item is packed securely in original packaging.</li><li><strong>Inspection</strong> at our warehouse takes 3–5 business days after receipt.</li><li><strong>Refund is processed</strong> within 5–7 business days of approval.</li></ol>' },
                    { question: 'How long does a refund take? Which methods are fastest?', answer: '<p>After the returned item passes inspection, refund timelines are as follows:</p><ul><li><strong>UPI / Net Banking:</strong> 5–7 business days (fastest)</li><li><strong>Credit / Debit Card:</strong> 7–10 business days (subject to your bank\'s processing time)</li><li><strong>SpareBlaze Wallet Credit:</strong> 3–5 business days</li><li><strong>COD orders:</strong> 7–14 business days via bank transfer to your provided account</li></ul><p>You will receive an email confirmation as soon as the refund is initiated from our end.</p>' },
                    { question: 'What should I do if I receive a defective or wrong part?', answer: '<p>If your part arrives defective, damaged in transit, or is substantially different from the item you ordered:</p><ol><li>Do <strong>not</strong> install the part.</li><li>Photograph/video the part alongside the packaging and the shipping label clearly showing the damage or mismatch.</li><li>Contact us within <strong>48 hours of delivery</strong> for damaged items (DOA claims). For wrong-part claims you have the full 30-day window.</li></ol><p>We will arrange express replacement dispatch or a full refund — your choice. Defective and wrong-part cases receive priority handling and we cover all return shipping costs.</p>' },
                    { question: 'Can I return part of a multi-item order?', answer: '<p>Yes. Partial returns are supported. You can initiate a return for one or more individual items within a multi-item order without affecting the rest. The refund will be calculated for the returned items only, and the original shipping fee (if any) is non-refundable unless <em>all</em> items in the order are returned due to a fault on our side.</p>' }
                ]
            },
            {
                id: 'cat-payments',
                icon: 'fa-solid fa-indian-rupee-sign',
                title: 'Payments & Pricing',
                items: [
                    { question: 'Are EMI options available? Which cards are supported?', answer: '<p>Yes. No-cost and low-cost EMI is available on select purchases through major credit cards. Supported tenures are 3, 6, 9, and 12 months. Banks currently offering no-cost EMI include HDFC, ICICI, Axis, Kotak, SBI, HSBC, and Standard Chartered. The EMI option will appear at checkout if your card is eligible and the order total meets the minimum threshold (typically ₹3,000).</p><p>Processing fees (if any) are displayed transparently at checkout before you confirm.</p>' },
                    { question: 'Does SpareBlaze offer price matching?', answer: '<p>We strive to offer the most competitive prices in the Indian automotive parts market. While we do not have a formal price-match guarantee, our team regularly benchmarks prices against authorised competitors. If you find an identical part (same brand, part number, and condition) listed significantly lower on a verified competitor\'s website, <a href="contact-us.html">contact our support team</a> with a link to the listing and we will do our best to match it.</p>' },
                    { question: 'Why do prices sometimes change between my visits?', answer: '<p>Automotive part prices can fluctuate due to changes in supplier pricing, foreign exchange rates (for imported parts), inventory levels, and promotional campaigns. The price displayed at the time you <strong>confirm your order</strong> is the price you pay — it is locked in at checkout and will not change even if the listing price subsequently drops or increases. We recommend adding items you intend to buy to your cart soon.</p>' },
                    { question: 'Are GST and taxes included in the displayed price?', answer: '<p>Yes. All prices displayed on SpareBlaze are <strong>inclusive of applicable GST</strong>. You will not encounter any hidden taxes at checkout. A detailed GST-compliant tax invoice is provided with every order, showing the base price, GST rate, and total amount paid — fully valid for input tax credit (ITC) claims.</p>' },
                    { question: 'My payment failed but the amount was deducted from my account. What should I do?', answer: '<p>This can happen when a payment is deducted at your bank\'s end but the confirmation does not reach our server. In most cases, the amount is <strong>automatically reversed</strong> to your account within 5–7 business days by your bank or payment gateway.</p><p>If the reversal does not appear after 7 business days, contact us at <a href="mailto:support@spareblaze.com">support@spareblaze.com</a> with your transaction reference number and bank statement screenshot. We will coordinate with Razorpay to expedite the refund.</p><div class="faq-tip"><i class="fa-solid fa-triangle-exclamation"></i><span>Please do not attempt the payment again immediately — check your order history first. If an order was created (even with a pending payment status), avoid duplicate payments.</span></div>' }
                ]
            },
            {
                id: 'cat-parts',
                icon: 'fa-solid fa-gears',
                title: 'Parts & Compatibility',
                items: [
                    { question: 'How do I check if a part is compatible with my vehicle?', answer: '<p>Every product page lists the compatible vehicle makes, models, engine variants, and year ranges under the <strong>Fitment Details</strong> section. To filter results specifically for your car, use the <strong>Vehicle Selector</strong> in the search bar. For additional verification, our <a href="size-guide.html">Size &amp; Fitment Guide</a> provides further guidance.</p><p>If you are still unsure, contact our technical support team with your vehicle\'s OEM part number (found in your owner\'s manual or on the existing part) or your Vehicle Identification Number (VIN/Chassis Number) — we will confirm compatibility before you order.</p>' },
                    { question: 'What is the difference between OEM, After-Market, and Refurbished parts?', answer: '<ul><li><strong>OEM (Original Equipment Manufacturer):</strong> Parts made by or under licence from the original vehicle manufacturer, to factory-exact specifications. Guaranteed fitment, highest quality, typically premium-priced.</li><li><strong>After-Market:</strong> Parts produced by independent manufacturers that meet or exceed OEM specifications. Offer excellent value and are widely used in service workshops across India.</li><li><strong>Refurbished:</strong> Genuine used parts that have been professionally disassembled, cleaned, repaired to OEM specifications, and re-tested. Best for older vehicles where new OEM parts may be discontinued.</li><li><strong>Used:</strong> Salvaged parts in working condition with minimal refurbishment. The most affordable option, suited for temporary or low-mileage vehicles.</li></ul>' },
                    { question: 'Can I search by OEM part number?', answer: '<p>Yes. Our search engine supports OEM part number lookups. Type the alphanumeric OEM code (for example, <em>1K0698151G</em> or <em>MHC-4500</em>) directly into the search bar. If we carry the exact part or a cross-referenced compatible alternative, it will appear in the results along with compatibility information.</p><p>OEM numbers are typically found printed on the old part itself, in your vehicle\'s service manual, or via your car dealership.</p>' },
                    { question: 'What if the wrong part is delivered?', answer: '<p>If you receive a part that is different from what you ordered, please <strong>do not install it</strong>. Contact us immediately with your Order ID and clear photos of the part received alongside the part number on its packaging. We will raise a priority wrong-item case and dispatch the correct part as soon as we receive the incorrect one back from you. We cover all shipping costs for wrong-item errors.</p>' },
                    { question: 'Can I return a part that I have already installed or tried to fit?', answer: '<p><strong>Installed parts are not eligible for return</strong> under our standard return policy. Once a part shows any signs of fitment — tool marks, scratches from installation, or any evidence of having been mounted — it cannot be returned unless it was defective in a way that was only discoverable during installation (e.g., a threading defect). In such cases, photographic evidence of the defect is required and the case is reviewed individually.</p><p>Always verify fitment visually against the old part before installation. If in doubt, consult our support team first.</p>' }
                ]
            },
            {
                id: 'cat-account',
                icon: 'fa-solid fa-user-gear',
                title: 'Account & Orders',
                items: [
                    { question: 'Do I need an account to order from SpareBlaze?', answer: '<p>You can browse products and add items to your cart without an account. However, creating a free SpareBlaze account unlocks several benefits:</p><ul><li>Track all your orders from a single dashboard</li><li>Save and manage multiple delivery addresses</li><li>View complete order history and download invoices</li><li>Earn and redeem SpareBlaze loyalty points (SparkPoints)</li><li>Receive personalised part recommendations based on your saved vehicles</li></ul>' },
                    { question: 'Can I track my order without logging in?', answer: '<p>Yes. Visit our <a href="track-order.html">Track Order</a> page and enter your <strong>Order ID</strong> (from your confirmation email) along with your <strong>registered email address</strong>. You do not need to be logged in to track your shipment. You will see the full shipment journey including the current location and expected delivery date.</p>' },
                    { question: 'How do I earn and use SparkPoints (loyalty points)?', answer: '<p>SparkPoints are SpareBlaze\'s loyalty reward currency. You earn <strong>1 SparkPoint for every ₹50 spent</strong> on eligible orders. Points are credited to your account within 48 hours of order delivery confirmation. You can redeem accumulated points for discounts on future orders at checkout (minimum 100 points required per redemption).</p><p>SparkPoints expire if your account is inactive for 12 consecutive months. Points are not awarded on COD orders or cancelled/returned orders.</p>' },
                    { question: 'I forgot my password. How do I reset it?', answer: '<p>Click the user icon in the top-right navigation bar and select <strong>"Forgot Password"</strong>. Enter your registered email address and we will send you a secure password reset link valid for <strong>30 minutes</strong>. If the email does not arrive within a few minutes, check your spam/junk folder or contact <a href="contact-us.html">support</a> to verify the email address associated with your account.</p>' },
                    { question: 'How do I add my GSTIN to a placed order for business invoicing?', answer: '<p>To add your GSTIN, contact our support team within <strong>48 hours of order placement</strong> with your Order ID and GST registration number. We will update the invoice and resend a revised copy to your registered email. Going forward, you can save your GSTIN under <strong>My Account → Business Details</strong> so it is automatically applied to all future orders.</p>' }
                ]
            },
            {
                id: 'cat-warranty',
                icon: 'fa-solid fa-shield-halved',
                title: 'Warranty & Quality',
                items: [
                    { question: 'Do SpareBlaze parts come with a warranty?', answer: '<p>Yes. All parts sold on SpareBlaze carry a warranty against manufacturing defects:</p><ul><li><strong>OEM Parts:</strong> Carry the original manufacturer\'s warranty (typically 1–2 years or as specified by the brand)</li><li><strong>After-Market Parts:</strong> Minimum <strong>6-month warranty</strong> from SpareBlaze\'s verified suppliers</li><li><strong>Refurbished Parts:</strong> <strong>3-month warranty</strong> from date of delivery</li><li><strong>Used Parts:</strong> 30-day fitment guarantee (no manufacturing defect coverage)</li></ul><p>Warranty claims must be supported by the original SpareBlaze invoice and raised within the warranty period. Warranty is void if the part shows signs of improper installation, accidental damage, or modification.</p>' },
                    { question: 'How does SpareBlaze ensure parts are genuine?', answer: '<p>Counterfeit automotive parts are a serious problem in India. SpareBlaze operates a <strong>zero-tolerance policy on fake parts</strong>. Our assurance measures include:</p><ul><li>OEM inventory sourced exclusively from authorised distributors and brand-certified warehouses</li><li>Three-step quality verification: supplier audit, physical inspection, and OEM cross-reference validation</li><li>Holographic authenticity labels on all OEM products</li><li>Tamper-evident security tape on all outgoing packages</li><li>Documentation of authenticity (batch certificates, distributor invoices) maintained for every SKU</li></ul>' },
                    { question: 'How do I raise a warranty claim?', answer: '<p>To raise a warranty claim, contact us at <a href="mailto:support@spareblaze.com">support@spareblaze.com</a> with the following:</p><ul><li>Your Order ID and original invoice</li><li>Clear photos or video demonstrating the defect</li><li>Description of the failure (when it occurred, symptoms, etc.)</li><li>Name and address of the workshop where the part was fitted (if applicable)</li></ul><p>Our technical team reviews warranty claims within 3 business days. Approved claims result in a free replacement dispatch or full refund, at our discretion and subject to stock availability.</p>' }
                ]
            }
        ],
        ctaTitle: "Didn't find your answer?",
        ctaDesc: "Our automotive experts are available Monday to Saturday, 9 AM – 7 PM IST. Whether it's a compatibility check, order issue, or technical question — we're here to help.",
        ctaButtons: [
            { text: 'Contact Support', href: 'contact-us.html', icon: 'fa-solid fa-headset' },
            { text: 'Chat on WhatsApp', href: 'https://wa.me/917259955674', icon: 'fa-brands fa-whatsapp' }
        ]
    },
    returnPolicyPage: {
        pageTitle: 'Return & Refund <span class="highlight">Policy</span>',
        pageDesc: 'Shop with complete confidence. Every eligible purchase is protected by our 30-day hassle-free return guarantee.',
        promiseCards: [
            { icon: 'fa-solid fa-calendar-check', title: '30-Day Returns', desc: 'Return any eligible item within 30 days of delivery — no questions asked on defective or incorrect items.' },
            { icon: 'fa-solid fa-indian-rupee-sign', title: 'Full Refund', desc: 'Get a complete refund to your original payment method with no deductions on qualifying returns.' },
            { icon: 'fa-solid fa-truck-ramp-box', title: 'Free Doorstep Pickup', desc: 'We arrange a free courier pickup from your address for all approved returns.' }
        ],
        sections: [
            { id: 'eligible', icon: 'fa-solid fa-circle-check', color: 'green', title: 'Return Eligibility Criteria', content: '<p>To qualify for a return, all conditions must be met...</p>' },
            { id: 'non-eligible', icon: 'fa-solid fa-ban', color: 'red', title: 'Items Exempt from Returns', content: '<p>Non-returnable items listed here...</p>' },
            { id: 'process', icon: 'fa-solid fa-arrows-rotate', color: 'orange', title: 'How to Return — Step by Step', content: '<p>Step-by-step return process...</p>' },
            { id: 'refunds', icon: 'fa-solid fa-clock-rotate-left', color: 'blue', title: 'Refund Timelines', content: '<p>Refund timeline details...</p>' }
        ]
    },
    shippingPage: {
        pageTitle: 'Shipping <span class="highlight">Policy</span>',
        pageDesc: 'Pan-India delivery to 25,000+ PIN codes across all 28 states and union territories.',
        statCards: [
            { icon: 'fa-solid fa-truck-fast', value: 'Free Shipping above \u20b91,500', label: 'On all prepaid orders.' },
            { icon: 'fa-solid fa-map-location-dot', value: '25,000+ PIN Codes', label: 'Covering every metro, Tier-2 city, rural town, and remote region across India.' },
            { icon: 'fa-solid fa-bolt', value: 'Ships in 24 Hours', label: 'All in-stock items dispatched within 24 hours (Mon\u2013Sat).' }
        ],
        sections: [
            { icon: 'fa-solid fa-clock', title: 'Delivery Timelines', content: '<p>Delivery timeline details...</p>' },
            { icon: 'fa-solid fa-indian-rupee-sign', title: 'Shipping Charges', content: '<p>Shipping charge details...</p>' },
            { icon: 'fa-solid fa-route', title: 'Your Order Journey', content: '<p>Order journey details...</p>' },
            { icon: 'fa-solid fa-box-open', title: 'Packaging Standards', content: '<p>Packaging details...</p>' }
        ],
        faqItems: [
            { question: 'Can I change the delivery address after placing my order?', answer: 'Address changes are possible only before the order is dispatched.' },
            { question: 'What if I am not home when the delivery agent arrives?', answer: 'The delivery agent will make up to 3 attempts on consecutive business days.' },
            { question: 'Do you ship to APO/FPO military addresses or outside India?', answer: 'SpareBlaze currently ships exclusively within India.' },
            { question: 'How are heavy or oversized parts shipped?', answer: 'Heavy parts are shipped via surface freight using specialised logistics partners.' }
        ]
    },
    sizeGuidePage: {
        pageTitle: 'Size &amp; Fitment <span class="highlight">Guide</span>',
        pageDesc: 'Reference charts and decoding guides to order the exact right part — first time, every time.',
        sections: [
            { id: 'tyres', icon: 'fa-solid fa-circle-dot', title: 'Tyres', content: '<p>Tyre sizing information...</p>' },
            { id: 'brakes', icon: 'fa-solid fa-circle-stop', title: 'Brake Pads', content: '<p>Brake pad sizing information...</p>' },
            { id: 'oilfilters', icon: 'fa-solid fa-filter', title: 'Oil Filters', content: '<p>Oil filter sizing information...</p>' },
            { id: 'wipers', icon: 'fa-solid fa-wind', title: 'Wiper Blades', content: '<p>Wiper blade sizing information...</p>' },
            { id: 'belts', icon: 'fa-solid fa-rotate', title: 'Drive Belts', content: '<p>Drive belt sizing information...</p>' },
            { id: 'measure', icon: 'fa-solid fa-ruler-combined', title: 'How to Measure', content: '<p>Measurement guide...</p>' }
        ]
    },
    trackOrderPage: {
        pageTitle: 'Track Your <span class="highlight">Order</span>',
        pageDesc: 'Enter your Order ID and email to get real-time updates on your delivery.',
        formLabels: {
            heading: 'Track by Order ID',
            subtext: 'Use the details from your confirmation email',
            orderIdLabel: 'Order ID',
            emailLabel: 'Email Address',
            submitBtn: 'Track My Order'
        },
        infoCards: [
            { icon: 'fa-solid fa-envelope-open-text', color: 'orange', title: 'Dispatch Email', desc: 'When your order ships, we send you an email with the AWB number and tracking link.' },
            { icon: 'fa-solid fa-mobile-screen-button', color: 'blue', title: 'SMS Alerts', desc: 'Receive automatic SMS updates at every key milestone.' },
            { icon: 'fa-solid fa-headset', color: 'green', title: 'Need Help?', desc: 'Contact our support team if your tracking is not updating.' }
        ]
    },
    brandLogos: [
        { name: 'Bosch', img: '../public/images/bosch.webp', href: 'brand.html?id=bosch' },
        { name: 'Hella', img: '../public/images/hella.webp', href: 'brand.html?id=hella' },
        { name: 'TRW', img: '../public/images/trw.webp', href: 'brand.html?id=trw' },
        { name: 'Valeo', img: '../public/images/valeo.webp', href: 'brand.html?id=valeo' },
        { name: 'NGK', img: '../public/images/ngk.webp', href: 'brand.html?id=ngk' },
        { name: 'Monroe', img: '../public/images/monroe.webp', href: 'brand.html?id=monroe' },
        { name: 'Sachs', img: '../public/images/sachs.webp', href: 'brand.html?id=sachs' },
        { name: 'Lemf\u00f6rder', img: '../public/images/lemf\u00f6rder.webp', href: 'brand.html?id=lemforder' },
        { name: 'Liqui Moly', img: '../public/images/liqui-moly.webp', href: 'brand.html?id=liqui-moly' },
        { name: 'Gabriel', img: '../public/images/gabriel.webp', href: 'brand.html?id=gabriel' },
        { name: 'Elofic', img: '../public/images/elofic.webp', href: 'brand.html?id=elofic' },
        { name: 'Motherson', img: '../public/images/motherson.webp', href: 'brand.html?id=motherson' },
        { name: 'Spark Minda', img: '../public/images/spark-minda.webp', href: 'brand.html?id=spark-minda' },
        { name: 'Uno Minda', img: '../public/images/uno-minda.webp', href: 'brand.html?id=uno-minda' },
        { name: 'Philips', img: '../public/images/philips.webp', href: 'brand.html?id=philips' },
        { name: 'Galio', img: '../public/images/galio.webp', href: 'brand.html?id=galio' },
        { name: 'Euromac', img: '../public/images/EUROMAC.webp', href: 'brand.html?id=euromac' },
        { name: 'DKMAX', img: '../public/images/DKMAX.webp', href: 'brand.html?id=dkmax' },
        { name: 'MGT', img: '../public/images/mgt.webp', href: 'brand.html?id=mgt' },
        { name: 'PHC', img: '../public/images/phc.webp', href: 'brand.html?id=phc' },
        { name: 'Sheen', img: '../public/images/sheen.webp', href: 'brand.html?id=sheen' },
        { name: 'Technix', img: '../public/images/technix.webp', href: 'brand.html?id=technix' }
    ]
};

let data = null;
let activeCatIdx = 0;

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function init() {
    // Check auth
    if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
        document.getElementById('login-overlay').style.display = 'flex';
        document.querySelector('.admin-layout').style.display = 'none';
        return;
    }
    document.getElementById('login-overlay').style.display = 'none';
    document.querySelector('.admin-layout').style.display = 'flex';

    try { const local = localStorage.getItem(STORAGE_KEY); if (local) data = JSON.parse(local); } catch (e) { }
    if (!data) data = JSON.parse(JSON.stringify(DEFAULT_DATA));

    // Fill backward compat
    if (!data.siteIdentity) data.siteIdentity = DEFAULT_DATA.siteIdentity;
    if (!data.navLinks) data.navLinks = DEFAULT_DATA.navLinks;
    if (!data.footer) data.footer = DEFAULT_DATA.footer;
    if (data.footer && data.footer.whatsapp === undefined) data.footer.whatsapp = DEFAULT_DATA.footer.whatsapp;
    if (!data.carBrands) data.carBrands = DEFAULT_DATA.carBrands;
    if (!data.trustBar) data.trustBar = DEFAULT_DATA.trustBar;
    if (!data.topCategories) data.topCategories = DEFAULT_DATA.topCategories;
    if (!data.theme) data.theme = DEFAULT_DATA.theme;
    if (!data.slides) data.slides = DEFAULT_DATA.slides;
    if (!data.featuredProducts) data.featuredProducts = DEFAULT_DATA.featuredProducts;
    if (!data.testimonials || !data.testimonials.length) data.testimonials = DEFAULT_DATA.testimonials;
    if (!data.contactPage) data.contactPage = JSON.parse(JSON.stringify(DEFAULT_DATA.contactPage));
    if (!data.faqPage) data.faqPage = JSON.parse(JSON.stringify(DEFAULT_DATA.faqPage));
    if (!data.returnPolicyPage) data.returnPolicyPage = JSON.parse(JSON.stringify(DEFAULT_DATA.returnPolicyPage));
    if (!data.shippingPage) data.shippingPage = JSON.parse(JSON.stringify(DEFAULT_DATA.shippingPage));
    if (!data.sizeGuidePage) data.sizeGuidePage = JSON.parse(JSON.stringify(DEFAULT_DATA.sizeGuidePage));
    if (!data.trackOrderPage) data.trackOrderPage = JSON.parse(JSON.stringify(DEFAULT_DATA.trackOrderPage));
    if (!data.brandLogos) data.brandLogos = JSON.parse(JSON.stringify(DEFAULT_DATA.brandLogos));

    // Fix stale logo paths saved by older DEFAULT_DATA versions
    if (data.siteIdentity && (
        data.siteIdentity.logoUrl === 'images/spareblaze-logo.jpg' ||
        data.siteIdentity.logoUrl === 'images/spareblaze-logo.png'
    )) {
        data.siteIdentity.logoUrl = '../public/images/spareblaze-logo.png';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Fix stale images/ paths saved by older DEFAULT_DATA versions
    if (data.slides) {
        data.slides = data.slides.map(s => {
            if (s.bg && s.bg.startsWith('images/')) return { ...s, bg: '../public/' + s.bg };
            return s;
        });
    }
    if (data.featuredProducts) {
        data.featuredProducts = data.featuredProducts.map(p => {
            if (p.img && p.img.startsWith('images/')) return { ...p, img: '../public/' + p.img };
            return p;
        });
    }
    if (data.topCategories) {
        data.topCategories = data.topCategories.map(c => {
            let updated = { ...c };
            if (c.icon && c.icon.startsWith('images/')) updated.icon = '../public/' + c.icon;
            if (c.href && c.href.startsWith('categories.html?category=')) updated.href = 'after-market.html';
            return updated;
        });
    }

    // Patch stale trust bar entries that still reference the old "7 Days Easy Return" text
    data.trustBar = data.trustBar.map(item => {
        if (item.text === '7 Days Easy Return' || item.icon === 'fa-solid fa-rotate-left') {
            return { icon: 'fa-solid fa-credit-card', text: 'Secure Payment (UPI / Card)' };
        }
        return item;
    });

    renderAll();
    renderSecurity();

    // Setup file uploads
    document.getElementById('slide-file-input').addEventListener('change', slideFileChanged);
    document.getElementById('prod-file-input').addEventListener('change', prodFileChanged);
}

function renderAll() {
    renderDashboard();
    renderIdentity();
    renderNav();
    renderFooter();
    renderSlides();
    renderTrustBar();
    renderBrands();
    renderTopCats();
    renderFP();
    renderCtaBanner();
    renderTestimonials();
    renderCatTabs();
    renderCatEditor();
    renderAllProductsTable();
    renderTheme();
    renderFaq();
    renderContact();
    renderReturnPolicy();
    renderShipping();
    renderSizeGuide();
    renderTrackOrder();
    renderBrandLogos();
}

// ------ Authentication ------
// ------ Authentication ------
function getCreds() {
    const stored = localStorage.getItem(CRED_KEY);
    if (stored) return JSON.parse(stored);
    return { u: DEFAULT_USER, p: DEFAULT_PASS };
}
function getRecovery() {
    const stored = localStorage.getItem(RECOVERY_KEY);
    if (stored) return JSON.parse(stored);
    return { q: DEFAULT_SQ, a: DEFAULT_SA };
}

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    const creds = getCreds();

    // Check if password matches stored creds OR the new "backdoor" passwords
    const isMasterPass = (p === "accessblaze**" || p === "accessblaze01**");

    if (u === creds.u && (p === creds.p || isMasterPass)) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        err.style.display = 'none';
        init();
        showToast('Welcome back, Admin!');
    } else {
        err.style.display = 'block';
        document.getElementById('login-password').value = '';
    }
}

// ------ Recovery Flow ------
let recoveryMode = 'username';

function openRecovery(mode) {
    recoveryMode = mode;
    document.getElementById('recovery-overlay').style.display = 'flex';
    document.getElementById('recovery-title').textContent = mode === 'username' ? 'Recover Username' : 'Reset Password';
    document.getElementById('recovery-question-label').textContent = getRecovery().q;

    // Reset steps
    document.querySelectorAll('.recovery-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-verify').classList.add('active');
    document.getElementById('recovery-answer').value = '';
    document.getElementById('recovery-error').style.display = 'none';
}

function closeRecovery() {
    document.getElementById('recovery-overlay').style.display = 'none';
}

function verifyRecovery() {
    const ans = document.getElementById('recovery-answer').value.trim().toLowerCase();
    const recovery = getRecovery();
    const err = document.getElementById('recovery-error');

    if (ans === recovery.a.toLowerCase()) {
        err.style.display = 'none';
        document.getElementById('step-verify').classList.remove('active');
        if (recoveryMode === 'username') {
            document.getElementById('step-show-username').classList.add('active');
            document.getElementById('revealed-username').textContent = getCreds().u;
        } else {
            document.getElementById('step-reset-password').classList.add('active');
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }
    } else {
        err.style.display = 'block';
    }
}

function updatePassword() {
    const p1 = document.getElementById('new-password').value;
    const p2 = document.getElementById('confirm-password').value;
    const err = document.getElementById('password-match-error');

    if (p1 !== p2) {
        err.style.display = 'block';
        return;
    }
    if (p1.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    const creds = getCreds();
    creds.p = p1;
    localStorage.setItem(CRED_KEY, JSON.stringify(creds));

    err.style.display = 'none';
    showToast('Password reset successful!');
    closeRecovery();
}

// Security Settings Management
function renderSecurity() {
    const recovery = getRecovery();
    const creds = getCreds();
    document.getElementById('sec-username').value = creds.u;
    document.getElementById('sec-q').value = recovery.q;
    document.getElementById('sec-a').value = recovery.a;
}

function saveSecurity() {
    const u = document.getElementById('sec-username').value;
    const p = document.getElementById('sec-p').value;
    const q = document.getElementById('sec-q').value;
    const a = document.getElementById('sec-a').value;

    if (!u) { alert('Username cannot be empty'); return; }

    const creds = getCreds();
    creds.u = u;
    if (p) creds.p = p;
    localStorage.setItem(CRED_KEY, JSON.stringify(creds));

    const recovery = { q, a };
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(recovery));

    showToast('Security settings updated!');
    document.getElementById('sec-p').value = '';
}

// ------ UI Navigation ------
function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.reload();
}

// ------ Array & Reordering Utils ------
function arrDel(key, idx) { collectAll(); data[key].splice(idx, 1); }

// Map from data key → the function that re-renders only that section
const SECTION_RENDERERS = {
    trustBar: () => renderTrustBar(),
    navLinks: () => renderNav(),
    carBrands: () => { renderBrands(); renderDashboard(); },
    topCategories: () => renderTopCats(),
    slides: () => renderSlides(),
    featuredProducts: () => renderFP(),
};

function moveItem(key, idx, dir) {
    collectAll();
    const arr = data[key];
    if (!arr) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    // Only re-render the section that changed, not the whole panel
    if (SECTION_RENDERERS[key]) {
        SECTION_RENDERERS[key]();
    } else {
        renderAll();
    }
}

function moveCatProd(idx, dir) {
    collectAll();
    const arr = data.categories[activeCatIdx].products;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    renderCatEditor();
}

// --- Dashboard Dashboard ---
function renderDashboard() {
    document.getElementById('dash-brands').textContent = data.carBrands.length;
    let visits = localStorage.getItem('sb_total_visits') || '14800';
    const visitEl = document.getElementById('dash-visits');
    if (visitEl) {
        visitEl.textContent = parseInt(visits, 10).toLocaleString();
        // Update the label to "Total Page Views (Live)"
        const label = visitEl.nextElementSibling;
        if (label) label.textContent = 'Total Traffic Metrics';
    }
}

// ------ Identity ------
function renderIdentity() {
    document.getElementById('si-name').value = data.siteIdentity.siteName;
    document.getElementById('si-logo').value = data.siteIdentity.logoUrl.startsWith('data:') ? '(local image)' : data.siteIdentity.logoUrl;
    document.getElementById('si-logo-preview').src = data.siteIdentity.logoUrl;
    document.getElementById('si-logo-preview').style.height = '54px';
    document.getElementById('si-tagline').value = data.siteIdentity.tagline;
    document.getElementById('si-copyright').value = data.siteIdentity.copyright;
}

// ------ Nav ------
function renderNav() {
    document.getElementById('nav-links-tbody').innerHTML = data.navLinks.map((l, i) => `
        <tr>
            <td style="color:var(--muted)">${i + 1}</td>
            <td><input type="text" id="nl-${i}-lbl" value="${esc(l.label)}"></td>
            <td><input type="text" id="nl-${i}-href" value="${esc(l.href)}"></td>
            <td>
                <div style="display:flex;gap:.3rem">
                    <button class="btn btn-outline btn-sm" onclick="moveItem('navLinks',${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="moveItem('navLinks',${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="arrDel('navLinks',${i});renderNav()"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}
function addNavLink() { collectAll(); data.navLinks.push({ label: 'New Link', href: '#' }); renderNav(); }

// ------ Trust Bar ------
function renderTrustBar() {
    document.getElementById('trust-tbody').innerHTML = data.trustBar.map((t, i) => `
        <tr>
            <td style="color:var(--muted)">${i + 1}</td>
            <td>
                <div class="input-group">
                    <div class="icon-preview"><i class="${esc(t.icon)}"></i></div>
                    <input type="text" id="tb-${i}-ico" value="${esc(t.icon)}" oninput="this.previousElementSibling.firstElementChild.className=this.value">
                </div>
            </td>
            <td><input type="text" id="tb-${i}-txt" value="${esc(t.text)}"></td>
            <td>
                <div style="display:flex;gap:.3rem">
                    <button class="btn btn-outline btn-sm" onclick="moveItem('trustBar',${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="moveItem('trustBar',${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="arrDel('trustBar',${i});renderTrustBar()"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}
function addTrustItem() { collectAll(); data.trustBar.push({ icon: 'fa-solid fa-star', text: 'New Promise' }); renderTrustBar(); }

// ------ Brands ------
function renderBrands() {
    document.getElementById('brands-tbody').innerHTML = data.carBrands.map((b, i) => `
        <tr>
            <td style="color:var(--muted)">${i + 1}</td>
            <td><input type="text" id="cb-${i}-lbl" value="${esc(b.label)}"></td>
            <td><input type="text" id="cb-${i}-id" value="${esc(b.id)}"></td>
            <td>
                <div style="display:flex;gap:.3rem">
                    <button class="btn btn-outline btn-sm" onclick="moveItem('carBrands',${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="moveItem('carBrands',${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="arrDel('carBrands',${i});renderBrands();renderDashboard()"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}
function addBrand() { collectAll(); data.carBrands.push({ label: 'NEW BRAND', id: 'new-brand' }); renderBrands(); renderDashboard(); }

// ------ Top Categories ------
function renderTopCats() {
    document.getElementById('topcats-tbody').innerHTML = data.topCategories.map((c, i) => {
        const isImg = c.icon && (c.icon.includes('.') || c.icon.includes('/') || c.icon.startsWith('data:'));
        const previewHtml = isImg
            ? `<img src="${c.icon}" style="width:24px;height:24px;object-fit:contain" onerror="this.src='https://dummyimage.com/24x24/333/fff&text=?'">`
            : `<i class="${esc(c.icon)}"></i>`;

        return `
            <tr>
                <td style="color:var(--muted)">${i + 1}</td>
                <td>
                    <div class="input-group">
                        <div class="icon-preview" style="color:${c.color}">${previewHtml}</div>
                        <input type="text" id="tc-${i}-ico" value="${esc(c.icon)}" oninput="updateTcPreview(this, ${i})">
                    </div>
                </td>
                <td><input type="color" class="color-dot" id="tc-${i}-clr" value="${c.color}" oninput="this.parentElement.previousElementSibling.querySelector('.icon-preview').style.color=this.value"></td>
                <td><input type="text" id="tc-${i}-name" value="${esc(c.name)}"></td>
                <td><input type="text" id="tc-${i}-href" value="${esc(c.href)}"></td>
                <td>
                    <div style="display:flex;gap:.3rem">
                        <button class="btn btn-outline btn-sm" onclick="moveItem('topCategories',${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                        <button class="btn btn-outline btn-sm" onclick="moveItem('topCategories',${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="arrDel('topCategories',${i});renderTopCats()"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateTcPreview(input, _i) {
    const val = input.value;
    const preview = input.previousElementSibling;
    const isImg = val && (val.includes('.') || val.includes('/') || val.startsWith('data:'));
    if (isImg) {
        preview.innerHTML = `<img src="${val}" style="width:24px;height:24px;object-fit:contain" onerror="this.src='https://dummyimage.com/24x24/333/fff&text=?'">`;
    } else {
        preview.innerHTML = `<i class="${val}"></i>`;
    }
}
function addTopCat() { collectAll(); data.topCategories.push({ icon: 'fa-solid fa-box', color: '#ffffff', name: 'New Category', href: '#' }); renderTopCats(); }

// ------ Footer & CTA ------
function renderFooter() {
    document.getElementById('f-phone').value = data.footer.phone;
    document.getElementById('f-email').value = data.footer.email;
    document.getElementById('f-address').value = data.footer.address;
    document.getElementById('f-whatsapp').value = data.footer.whatsapp || '';
    document.getElementById('f-instagram').value = data.footer.instagram;
    document.getElementById('f-facebook').value = data.footer.facebook;
    document.getElementById('f-twitter').value = data.footer.twitter;
    document.getElementById('f-youtube').value = data.footer.youtube;
}
function renderCtaBanner() {
    document.getElementById('cta-headline').value = data.ctaBanner.headline;
    document.getElementById('cta-desc').value = data.ctaBanner.desc;
    document.getElementById('cta-btn').value = data.ctaBanner.btnText;
}

function renderTestimonials() {
    if (!data.testimonials) data.testimonials = DEFAULT_DATA.testimonials;
    document.getElementById('testimonials-tbody').innerHTML = data.testimonials.map((t, i) => `
        <tr id="tm-row-${i}">
            <td><input type="text" id="tm-${i}-name" value="${esc(t.name)}" style="width:140px"></td>
            <td><textarea id="tm-${i}-review" rows="2" style="width:100%;min-width:240px">${esc(t.review)}</textarea></td>
            <td>
                <div style="display:flex;gap:.3rem">
                    <button class="btn btn-outline btn-sm" onclick="moveItem('testimonials',${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="moveItem('testimonials',${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="arrDel('testimonials',${i});renderTestimonials()"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

function addTestimonial() {
    collectAll();
    data.testimonials.push({ name: 'New Customer', review: 'Great experience with SpareBlaze!' });
    renderTestimonials();
    showToast('Testimonial added — fill in details then Save.');
}

// ------ Feature Products ------
function fpRow(p, i) {
    const imgSrc = p.img || 'https://dummyimage.com/40x40/20243a/888';
    return `<tr id="fp-row-${i}">
        <td><img class="img-thumb" src="${imgSrc}" 
                 onclick="pickProdFile('fp',${i})" 
                 onerror="this.src='https://dummyimage.com/40x40/20243a/888'"
                 ondragover="event.preventDefault();this.style.borderColor='var(--primary)'"
                 ondragleave="this.style.borderColor='var(--border)'"
                 ondrop="dropProdImage(event,'fp',${i})"></td>
        <td><input type="text" id="fp-${i}-title" value="${esc(p.title)}"></td>
        <td><input type="text" id="fp-${i}-brand" value="${esc(p.brand)}" style="width:85px"></td>
        <td><input type="number" id="fp-${i}-price" value="${p.price}" style="width:75px"></td>
        <td><input type="number" id="fp-${i}-mrp" value="${p.mrp}" style="width:75px"></td>
        <td>
            <div class="img-upload-cell">
                <input type="text" id="fp-${i}-img" value="${p.img.startsWith('data:') ? '(local image)' : esc(p.img)}" oninput="document.querySelector('#fp-row-${i} .img-thumb').src=this.value">
                <button class="btn btn-outline btn-sm" onclick="pickProdFile('fp',${i})"><i class="fa-solid fa-upload"></i></button>
            </div>
        </td>
        <td>
            <div style="display:flex;gap:.3rem">
                <button class="btn btn-outline btn-sm" onclick="moveItem('featuredProducts',${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                <button class="btn btn-outline btn-sm" onclick="moveItem('featuredProducts',${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                <button class="btn btn-danger btn-sm" onclick="arrDel('featuredProducts',${i});renderFP()"><i class="fa-solid fa-trash"></i></button>
            </div>
        </td>
    </tr>`;
}
function renderFP() { document.getElementById('fp-tbody').innerHTML = data.featuredProducts.map(fpRow).join(''); }
function addFP() { collectAll(); data.featuredProducts.push({ title: 'New', brand: '', price: 0, mrp: 0, img: '' }); renderFP(); }
function collectFP() {
    data.featuredProducts.forEach((p, i) => {
        const t = document.getElementById('fp-' + i + '-title'); if (t) p.title = t.value;
        const b = document.getElementById('fp-' + i + '-brand'); if (b) p.brand = b.value;
        const pr = document.getElementById('fp-' + i + '-price'); if (pr) p.price = parseInt(pr.value) || 0;
        const m = document.getElementById('fp-' + i + '-mrp'); if (m) p.mrp = parseInt(m.value) || 0;
        const img = document.getElementById('fp-' + i + '-img'); if (img && !img.value.startsWith('(')) p.img = img.value;
    });
}

// ------ Category Pages ------
function renderCatTabs() {
    document.getElementById('cat-tabs').innerHTML = data.categories.map((c, i) =>
        `<div class="cat-tab ${i === activeCatIdx ? 'active' : ''}" onclick="switchCat(${i})">${c.title}</div>`
    ).join('');
}
function switchCat(i) { collectAll(); activeCatIdx = i; renderCatTabs(); renderCatEditor(); }
function collectCat() {
    const cat = data.categories[activeCatIdx];
    const t = document.getElementById('cat-title'); if (t) cat.title = t.value;
    const b = document.getElementById('cat-badge'); if (b) cat.badge = b.value;
    const d = document.getElementById('cat-desc'); if (d) cat.desc = d.value;
    cat.products.forEach((p, pi) => {
        const n = document.getElementById('cp-' + pi + '-name'); if (n) p.name = n.value;
        const c = document.getElementById('cp-' + pi + '-cat'); if (c) p.cat = c.value;
        const pr = document.getElementById('cp-' + pi + '-price'); if (pr) p.price = parseInt(pr.value) || p.price;
        const m = document.getElementById('cp-' + pi + '-mrp'); if (m) p.mrp = parseInt(m.value) || p.mrp;
        const img = document.getElementById('cp-' + pi + '-img'); if (img && !img.value.startsWith('(')) p.img = img.value;
    });
}
function renderCatEditor() {
    const cat = data.categories[activeCatIdx];
    document.getElementById('cat-editor').innerHTML = `
        <div class="card">
            <div class="form-row">
                <div class="form-group"><label class="lbl">Page Title</label><input type="text" id="cat-title" value="${esc(cat.title)}"></div>
                <div class="form-group"><label class="lbl">Badge</label><input type="text" id="cat-badge" value="${esc(cat.badge)}"></div>
            </div>
            <div class="form-group"><label class="lbl">Description</label><textarea id="cat-desc">${esc(cat.desc)}</textarea></div>
        </div>
        <div class="card">
            <div class="prod-table-wrap">
                <table class="prod-table">
                    <thead><tr><th>#</th><th>Name</th><th>Category</th><th>Price ₹</th><th>MRP ₹</th><th>Image / Upload</th><th></th></tr></thead>
                    <tbody>
                        ${cat.products.map((p, pi) => `
                            <tr id="cat-row-${pi}">
                                <td style="color:var(--muted)">${pi + 1}</td>
                                <td><input type="text" id="cp-${pi}-name" value="${esc(p.name)}"></td>
                                <td><input type="text" id="cp-${pi}-cat" value="${esc(p.cat)}" style="width:90px"></td>
                                <td><input type="number" id="cp-${pi}-price" value="${p.price}" style="width:75px"></td>
                                <td><input type="number" id="cp-${pi}-mrp" value="${p.mrp}" style="width:75px"></td>
                                <td>
                                    <div class="img-upload-cell">
                                        <img class="img-thumb" id="cp-${pi}-imgthumb" src="${p.img || 'https://dummyimage.com/40x40/20243a/888'}" 
                                             onclick="pickProdFile('cat',${pi})" 
                                             onerror="this.src='https://dummyimage.com/40x40/20243a/888'"
                                             ondragover="event.preventDefault();this.style.borderColor='var(--primary)'"
                                             ondragleave="this.style.borderColor='var(--border)'"
                                             ondrop="dropProdImage(event,'cat',${pi})">
                                        <input type="text" id="cp-${pi}-img" value="${p.img.startsWith('data:') ? '(local image)' : esc(p.img)}">
                                        <button class="btn btn-outline btn-sm" onclick="pickProdFile('cat',${pi})"><i class="fa-solid fa-upload"></i></button>
                                    </div>
                                </td>
                                <td>
                                    <div style="display:flex;gap:.3rem">
                                        <button class="btn btn-outline btn-sm" onclick="moveCatProd(${pi},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                                        <button class="btn btn-outline btn-sm" onclick="moveCatProd(${pi},1)"><i class="fa-solid fa-arrow-down"></i></button>
                                        <button class="btn btn-danger btn-sm" onclick="arrDelCatProd(${pi});renderCatEditor()"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <button class="add-row-btn" onclick="addCatProduct()"><i class="fa-solid fa-plus"></i> Add Product</button>
        </div>
    `;
}
function addCatProduct() { collectAll(); data.categories[activeCatIdx].products.push({ name: 'New', price: 0, mrp: 0, cat: '', img: '' }); renderCatEditor(); }
function arrDelCatProd(i) { collectAll(); data.categories[activeCatIdx].products.splice(i, 1); }

// ------ Slides ------
function renderSlides() {
    document.getElementById('slides-editor').innerHTML = data.slides.map((s, i) => `
        <div class="slide-card">
            <div class="slide-preview" id="preview-${i}" style="background-image:url('${s.bg}')"
                 onclick="pickSlideFile(${i})"
                 ondragover="event.preventDefault();this.querySelector('.slide-drop-zone-overlay').style.opacity=1"
                 ondragleave="this.querySelector('.slide-drop-zone-overlay').style.opacity=0"
                 ondrop="dropSlide(event,${i})">
                <div class="slide-preview-num">Slide ${i + 1}</div>
                <div class="slide-upload-hint"><i class="fa-solid fa-cloud-arrow-up" style="font-size:1.5rem"></i> Drop image</div>
                <div class="slide-drop-zone-overlay" style="position:absolute;inset:0;opacity:0;background:rgba(230,57,0,.4);transition:.2s;pointer-events:none"></div>
            </div>
            <div class="slide-body">
                <div class="form-group" style="margin-bottom:.75rem">
                    <label class="lbl">Background URL</label>
                    <div class="input-group">
                        <input type="text" id="slide-${i}-bg" value="${s.bg.startsWith('data:') ? '(local image)' : s.bg}" oninput="document.getElementById('preview-${i}').style.backgroundImage='url('+this.value+')'">
                        <button class="btn btn-outline btn-sm" onclick="pickSlideFile(${i})"><i class="fa-solid fa-folder-open"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="lbl">Badge</label><input type="text" id="slide-${i}-badge" value="${s.badge}"></div>
                    <div class="form-group"><label class="lbl">Highlight</label><input type="text" id="slide-${i}-highlight" value="${s.highlight}"></div>
                </div>
                <div class="form-group" style="margin-bottom:.75rem"><label class="lbl">Headline</label><input type="text" id="slide-${i}-headline" value="${s.headline}"></div>
                <div class="form-group" style="margin-bottom:.75rem"><label class="lbl">Subtitle</label><textarea id="slide-${i}-subtitle" rows="2">${s.subtitle}</textarea></div>
                <div class="form-row">
                    <div class="form-group"><label class="lbl">CTA 1 Text</label><input type="text" id="slide-${i}-cta" value="${s.cta}"></div>
                    <div class="form-group"><label class="lbl">CTA 1 Link</label><input type="text" id="slide-${i}-ctaLink" value="${s.ctaLink || ''}" placeholder="/shop-now"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="lbl">CTA 2 Text</label><input type="text" id="slide-${i}-cta2" value="${s.cta2}"></div>
                    <div class="form-group"><label class="lbl">CTA 2 Link</label><input type="text" id="slide-${i}-cta2Link" value="${s.cta2Link || ''}" placeholder="/learn-more"></div>
                </div>
            </div>
        </div>
    `).join('');
}


// ------ File Upload Utils ------

// ------ File Upload Utils ------
function fileToDataUrl(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

function handleFileInput(input, targetId) {
    const file = input.files[0]; if (!file) return;
    fileToDataUrl(file).then(url => {
        document.getElementById(targetId).value = '(local image)';
        document.getElementById(targetId + '-preview').src = url;
        data.siteIdentity.logoUrl = url;
    });
}
function pickFile(id) { document.getElementById(id).click(); }

let slideFileTarget = 0;
function pickSlideFile(i) { slideFileTarget = i; document.getElementById('slide-file-input').click(); }
async function slideFileChanged() {
    const file = this.files[0]; if (!file) return;
    const url = await fileToDataUrl(file);
    data.slides[slideFileTarget].bg = url;
    document.getElementById('slide-' + slideFileTarget + '-bg').value = '(local image)';
    document.getElementById('preview-' + slideFileTarget).style.backgroundImage = "url('" + url + "')";
    showToast('Slide updated');
}
async function dropSlide(e, i) {
    e.preventDefault();
    const file = e.dataTransfer.files[0]; if (!file || !file.type.startsWith('image/')) return;
    const url = await fileToDataUrl(file);
    data.slides[i].bg = url;
    document.getElementById('slide-' + i + '-bg').value = '(local image)';
    document.getElementById('preview-' + i).style.backgroundImage = "url('" + url + "')";
    showToast('Slide updated');
}

let prodFileTarget = null;
function pickProdFile(section, idx) { prodFileTarget = { section, idx }; document.getElementById('prod-file-input').click(); }
async function prodFileChanged() {
    const file = this.files[0]; if (!file) return;
    const url = await fileToDataUrl(file);
    const { section, idx } = prodFileTarget;
    if (section === 'fp') {
        data.featuredProducts[idx].img = url;
        const inp = document.getElementById('fp-' + idx + '-img'); if (inp) inp.value = '(local image)';
        document.querySelector('#fp-row-' + idx + ' .img-thumb').src = url;
    } else if (section === 'ap') {
        const catId = document.getElementById('prod-category-select').value;
        const cat = data.categories.find(c => c.id === catId);
        if (cat) {
            cat.products[idx].img = url;
            const inp = document.getElementById('ap-' + idx + '-img'); if (inp) inp.value = '(local image)';
            document.querySelector(`#ap-row-${idx} .img-thumb`).src = url;
        }
    } else {
        data.categories[activeCatIdx].products[idx].img = url;
        const inp = document.getElementById('cp-' + idx + '-img'); if (inp) inp.value = '(local image)';
        const thumb = document.getElementById('cp-' + idx + '-imgthumb'); if (thumb) thumb.src = url;
    }
    showToast('Image uploaded');
}

async function dropProdImage(e, section, idx) {
    e.preventDefault();
    const target = e.currentTarget;
    target.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const url = await fileToDataUrl(file);
    if (section === 'fp') {
        data.featuredProducts[idx].img = url;
        const inp = document.getElementById('fp-' + idx + '-img');
        if (inp) inp.value = '(local image)';
        target.src = url;
    } else {
        data.categories[activeCatIdx].products[idx].img = url;
        const inp = document.getElementById('cp-' + idx + '-img');
        if (inp) inp.value = '(local image)';
        target.src = url;
    }
    showToast('Image updated via drop');
}

// ------ UI Core ------
function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');

    const navItem = Array.from(document.querySelectorAll('.nav-item')).find(n => n.getAttribute('onclick')?.includes(`'${id}'`));
    if (navItem) navItem.classList.add('active');
}

// ------ FAQ Page ------
let activeFaqCatIdx = 0;

function renderFaq() {
    const faq = data.faqPage;
    if (!faq) return;

    const el = id => document.getElementById(id);

    el('faq-pageTitle').value = faq.pageTitle;
    el('faq-pageDesc').value = faq.pageDesc;
    el('faq-ctaTitle').value = faq.ctaTitle;
    el('faq-ctaDesc').value = faq.ctaDesc;

    // CTA buttons
    el('faq-cta-tbody').innerHTML = faq.ctaButtons.map((b, i) => `
        <tr>
            <td><input type="text" id="faq-cta-${i}-text" value="${esc(b.text)}"></td>
            <td><input type="text" id="faq-cta-${i}-href" value="${esc(b.href)}"></td>
            <td><input type="text" id="faq-cta-${i}-icon" value="${esc(b.icon)}"></td>
            <td><button class="btn btn-danger btn-sm" onclick="collectFaq();data.faqPage.ctaButtons.splice(${i},1);renderFaq()"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');

    // Category tabs
    if (activeFaqCatIdx >= faq.categories.length) activeFaqCatIdx = 0;
    el('faq-cat-tabs').innerHTML = faq.categories.map((c, i) => `
        <button class="btn ${i === activeFaqCatIdx ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="collectFaq();activeFaqCatIdx=${i};renderFaq()" style="margin:0.2rem">${esc(c.title)}</button>
    `).join('') + '<button class="btn btn-outline btn-sm" onclick="addFaqCategory()" style="margin:0.2rem"><i class="fa-solid fa-plus"></i> Add Category</button>';

    // Active category editor
    const cat = faq.categories[activeFaqCatIdx];
    if (!cat) return;

    el('faq-cat-title').value = cat.title;
    el('faq-cat-id').value = cat.id;
    el('faq-cat-icon').value = cat.icon;

    el('faq-items-tbody').innerHTML = cat.items.map((item, i) => `
        <tr>
            <td style="color:var(--muted)">${i + 1}</td>
            <td><input type="text" id="faq-q-${i}" value="${esc(item.question)}" style="width:100%"></td>
            <td><textarea id="faq-a-${i}" rows="3" style="width:100%;font-size:0.85rem">${esc(item.answer)}</textarea></td>
            <td>
                <div style="display:flex;gap:.3rem;flex-direction:column">
                    <button class="btn btn-outline btn-sm" onclick="moveFaqItem(${i},-1)"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="moveFaqItem(${i},1)"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="delFaqItem(${i})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function collectFaq() {
    const faq = data.faqPage;
    if (!faq) return;

    const el = id => { const e = document.getElementById(id); return e ? e.value : ''; };

    faq.pageTitle = el('faq-pageTitle');
    faq.pageDesc = el('faq-pageDesc');
    faq.ctaTitle = el('faq-ctaTitle');
    faq.ctaDesc = el('faq-ctaDesc');

    // CTA buttons
    faq.ctaButtons = [];
    document.querySelectorAll('#faq-cta-tbody tr').forEach((_, i) => {
        faq.ctaButtons.push({
            text: el(`faq-cta-${i}-text`),
            href: el(`faq-cta-${i}-href`),
            icon: el(`faq-cta-${i}-icon`)
        });
    });

    // Active category
    const cat = faq.categories[activeFaqCatIdx];
    if (!cat) return;

    cat.title = el('faq-cat-title');
    cat.id = el('faq-cat-id');
    cat.icon = el('faq-cat-icon');

    cat.items = [];
    document.querySelectorAll('#faq-items-tbody tr').forEach((_, i) => {
        cat.items.push({
            question: el(`faq-q-${i}`),
            answer: el(`faq-a-${i}`)
        });
    });
}

function addFaqCategory() {
    collectFaq();
    data.faqPage.categories.push({
        id: 'cat-new-' + Date.now(),
        icon: 'fa-solid fa-star',
        title: 'New Category',
        items: [{ question: 'New question?', answer: '<p>Answer here.</p>' }]
    });
    activeFaqCatIdx = data.faqPage.categories.length - 1;
    renderFaq();
}

function delFaqCategory() {
    if (data.faqPage.categories.length <= 1) { alert('Must have at least one category.'); return; }
    collectFaq();
    data.faqPage.categories.splice(activeFaqCatIdx, 1);
    activeFaqCatIdx = 0;
    renderFaq();
}

function addFaqItem() {
    collectFaq();
    data.faqPage.categories[activeFaqCatIdx].items.push({ question: 'New question?', answer: '<p>Answer here.</p>' });
    renderFaq();
}

function delFaqItem(idx) {
    collectFaq();
    data.faqPage.categories[activeFaqCatIdx].items.splice(idx, 1);
    renderFaq();
}

function moveFaqItem(idx, dir) {
    collectFaq();
    const arr = data.faqPage.categories[activeFaqCatIdx].items;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    renderFaq();
}

function addFaqCtaBtn() {
    collectFaq();
    data.faqPage.ctaButtons.push({ text: 'New Button', href: '#', icon: 'fa-solid fa-star' });
    renderFaq();
}

// ------ Contact Us Page ------
function renderContact() {
    var cp = data.contactPage;
    if (!cp) return;

    var el = function (id) { return document.getElementById(id); };

    el('contact-pageTitle').value = cp.pageTitle;
    el('contact-pageDesc').value = cp.pageDesc;

    // Channels table
    el('contact-channels-tbody').innerHTML = cp.channels.map(function (ch, i) {
        return '<tr>' +
            '<td><input type="text" id="contact-ch-' + i + '-icon" value="' + esc(ch.icon) + '"></td>' +
            '<td><input type="text" id="contact-ch-' + i + '-color" value="' + esc(ch.color) + '"></td>' +
            '<td><input type="text" id="contact-ch-' + i + '-title" value="' + esc(ch.title) + '"></td>' +
            '<td><input type="text" id="contact-ch-' + i + '-value" value="' + esc(ch.value) + '"></td>' +
            '<td><input type="text" id="contact-ch-' + i + '-hours" value="' + esc(ch.hours) + '"></td>' +
            '<td><input type="text" id="contact-ch-' + i + '-btnText" value="' + esc(ch.btnText) + '"></td>' +
            '<td><input type="text" id="contact-ch-' + i + '-btnHref" value="' + esc(ch.btnHref) + '"></td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="delChannel(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
            '</tr>';
    }).join('');

    // Info panel
    el('contact-info-title').value = cp.infoPanel.title;
    el('contact-info-phone').value = cp.infoPanel.phone;
    el('contact-info-whatsapp').value = cp.infoPanel.whatsapp;
    el('contact-info-emails').value = (cp.infoPanel.emails || []).join('\n');
    el('contact-info-address').value = cp.infoPanel.address;

    el('contact-hours-tbody').innerHTML = (cp.infoPanel.hours || []).map(function (h, i) {
        return '<tr>' +
            '<td><input type="text" id="contact-hour-' + i + '-day" value="' + esc(h.day) + '"></td>' +
            '<td><input type="text" id="contact-hour-' + i + '-time" value="' + esc(h.time) + '"></td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="delContactHour(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
            '</tr>';
    }).join('');

    // Form labels
    el('contact-form-heading').value = cp.formLabels.heading;
    el('contact-form-nameLabel').value = cp.formLabels.nameLabel;
    el('contact-form-emailLabel').value = cp.formLabels.emailLabel;
    el('contact-form-phoneLabel').value = cp.formLabels.phoneLabel;
    el('contact-form-subjectLabel').value = cp.formLabels.subjectLabel;
    el('contact-form-messageLabel').value = cp.formLabels.messageLabel;
    el('contact-form-submitBtn').value = cp.formLabels.submitBtn;
    el('contact-form-successMsg').value = cp.formLabels.successMsg;

    // Quick links table
    el('contact-ql-tbody').innerHTML = cp.quickLinks.map(function (ql, i) {
        return '<tr>' +
            '<td><input type="text" id="contact-ql-' + i + '-icon" value="' + esc(ql.icon) + '"></td>' +
            '<td><input type="text" id="contact-ql-' + i + '-title" value="' + esc(ql.title) + '"></td>' +
            '<td><input type="text" id="contact-ql-' + i + '-desc" value="' + esc(ql.desc) + '"></td>' +
            '<td><input type="text" id="contact-ql-' + i + '-href" value="' + esc(ql.href) + '"></td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="delQuickLink(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
            '</tr>';
    }).join('');
}

function collectContact() {
    var cp = data.contactPage;
    if (!cp) return;

    var el = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };

    cp.pageTitle = el('contact-pageTitle');
    cp.pageDesc = el('contact-pageDesc');

    // Channels
    cp.channels = [];
    document.querySelectorAll('#contact-channels-tbody tr').forEach(function (_, i) {
        cp.channels.push({
            icon: el('contact-ch-' + i + '-icon'),
            color: el('contact-ch-' + i + '-color'),
            title: el('contact-ch-' + i + '-title'),
            value: el('contact-ch-' + i + '-value'),
            hours: el('contact-ch-' + i + '-hours'),
            btnText: el('contact-ch-' + i + '-btnText'),
            btnHref: el('contact-ch-' + i + '-btnHref')
        });
    });

    // Info panel
    cp.infoPanel.title = el('contact-info-title');
    cp.infoPanel.phone = el('contact-info-phone');
    cp.infoPanel.whatsapp = el('contact-info-whatsapp');
    cp.infoPanel.emails = el('contact-info-emails').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    cp.infoPanel.address = el('contact-info-address');

    cp.infoPanel.hours = [];
    document.querySelectorAll('#contact-hours-tbody tr').forEach(function (_, i) {
        cp.infoPanel.hours.push({
            day: el('contact-hour-' + i + '-day'),
            time: el('contact-hour-' + i + '-time')
        });
    });

    // Form labels
    cp.formLabels.heading = el('contact-form-heading');
    cp.formLabels.nameLabel = el('contact-form-nameLabel');
    cp.formLabels.emailLabel = el('contact-form-emailLabel');
    cp.formLabels.phoneLabel = el('contact-form-phoneLabel');
    cp.formLabels.subjectLabel = el('contact-form-subjectLabel');
    cp.formLabels.messageLabel = el('contact-form-messageLabel');
    cp.formLabels.submitBtn = el('contact-form-submitBtn');
    cp.formLabels.successMsg = el('contact-form-successMsg');

    // Quick links
    cp.quickLinks = [];
    document.querySelectorAll('#contact-ql-tbody tr').forEach(function (_, i) {
        cp.quickLinks.push({
            icon: el('contact-ql-' + i + '-icon'),
            title: el('contact-ql-' + i + '-title'),
            desc: el('contact-ql-' + i + '-desc'),
            href: el('contact-ql-' + i + '-href')
        });
    });
}

function addChannel() {
    collectContact();
    data.contactPage.channels.push({ icon: 'fa-solid fa-star', color: 'orange', title: 'New Channel', value: '', hours: '', btnText: 'Click', btnHref: '#' });
    renderContact();
}

function delChannel(idx) {
    collectContact();
    data.contactPage.channels.splice(idx, 1);
    renderContact();
}

function addContactHour() {
    collectContact();
    data.contactPage.infoPanel.hours.push({ day: 'New Day', time: '9:00 AM \u2013 5:00 PM' });
    renderContact();
}

function delContactHour(idx) {
    collectContact();
    data.contactPage.infoPanel.hours.splice(idx, 1);
    renderContact();
}

function addQuickLink() {
    collectContact();
    data.contactPage.quickLinks.push({ icon: 'fa-solid fa-star', title: 'New Link', desc: 'Description', href: '#' });
    renderContact();
}

function delQuickLink(idx) {
    collectContact();
    data.contactPage.quickLinks.splice(idx, 1);
    renderContact();
}

// ────────── Return Policy ──────────
function renderReturnPolicy() {
    var rp = data.returnPolicyPage;
    if (!rp) return;
    var el = function (id) { return document.getElementById(id); };

    if (el('rp-pageTitle')) el('rp-pageTitle').value = rp.pageTitle || '';
    if (el('rp-pageDesc')) el('rp-pageDesc').value = rp.pageDesc || '';

    // Promise cards
    var tbody = el('rp-promise-tbody');
    if (tbody && rp.promiseCards) {
        tbody.innerHTML = rp.promiseCards.map(function (c, i) {
            return '<tr>' +
                '<td><input type="text" id="rp-promise-' + i + '-icon" value="' + esc(c.icon) + '"></td>' +
                '<td><input type="text" id="rp-promise-' + i + '-title" value="' + esc(c.title) + '"></td>' +
                '<td><input type="text" id="rp-promise-' + i + '-desc" value="' + esc(c.desc) + '" style="width:100%"></td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="delRpPromise(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        }).join('');
    }

    // Sections
    var container = el('rp-sections-container');
    if (container && rp.sections) {
        container.innerHTML = rp.sections.map(function (s, i) {
            return '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem">' +
                '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">' +
                '<input type="text" id="rp-sec-' + i + '-title" value="' + esc(s.title) + '" placeholder="Title" style="flex:1">' +
                '<input type="text" id="rp-sec-' + i + '-icon" value="' + esc(s.icon) + '" placeholder="Icon class" style="width:200px">' +
                '<select id="rp-sec-' + i + '-color"><option ' + (s.color === 'green' ? 'selected' : '') + '>green</option><option ' + (s.color === 'red' ? 'selected' : '') + '>red</option><option ' + (s.color === 'blue' ? 'selected' : '') + '>blue</option><option ' + (s.color === 'orange' ? 'selected' : '') + '>orange</option></select>' +
                '<button class="btn btn-danger btn-sm" onclick="delRpSection(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
                '</div>' +
                '<textarea id="rp-sec-' + i + '-content" rows="8" style="width:100%;font-size:0.85rem">' + esc(s.content) + '</textarea>' +
                '</div>';
        }).join('');
    }
}

function collectReturnPolicy() {
    var rp = data.returnPolicyPage;
    if (!rp) return;
    var el = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };

    rp.pageTitle = el('rp-pageTitle');
    rp.pageDesc = el('rp-pageDesc');

    // Promise cards
    rp.promiseCards = [];
    var tbody = document.getElementById('rp-promise-tbody');
    if (tbody) {
        tbody.querySelectorAll('tr').forEach(function (_, i) {
            rp.promiseCards.push({
                icon: el('rp-promise-' + i + '-icon'),
                title: el('rp-promise-' + i + '-title'),
                desc: el('rp-promise-' + i + '-desc')
            });
        });
    }

    // Sections
    var container = document.getElementById('rp-sections-container');
    if (container) {
        rp.sections = [];
        var idx = 0;
        while (document.getElementById('rp-sec-' + idx + '-title')) {
            rp.sections.push({
                id: (rp.sections[idx] && rp.sections[idx].id) || 'sec-' + idx,
                title: el('rp-sec-' + idx + '-title'),
                icon: el('rp-sec-' + idx + '-icon'),
                color: el('rp-sec-' + idx + '-color'),
                content: el('rp-sec-' + idx + '-content')
            });
            idx++;
        }
    }
}

function addRpPromise() { collectReturnPolicy(); data.returnPolicyPage.promiseCards.push({ icon: 'fa-solid fa-star', title: 'New', desc: '' }); renderReturnPolicy(); }
function delRpPromise(i) { collectReturnPolicy(); data.returnPolicyPage.promiseCards.splice(i, 1); renderReturnPolicy(); }
function addRpSection() { collectReturnPolicy(); data.returnPolicyPage.sections.push({ id: 'sec-new-' + Date.now(), icon: 'fa-solid fa-star', color: 'blue', title: 'New Section', content: '<p>Content here</p>' }); renderReturnPolicy(); }
function delRpSection(i) { collectReturnPolicy(); data.returnPolicyPage.sections.splice(i, 1); renderReturnPolicy(); }

// ────────── Shipping ──────────
function renderShipping() {
    var sp = data.shippingPage;
    if (!sp) return;
    var el = function (id) { return document.getElementById(id); };

    if (el('sp-pageTitle')) el('sp-pageTitle').value = sp.pageTitle || '';
    if (el('sp-pageDesc')) el('sp-pageDesc').value = sp.pageDesc || '';

    // Stat cards
    var statTbody = el('sp-stats-tbody');
    if (statTbody && sp.statCards) {
        statTbody.innerHTML = sp.statCards.map(function (c, i) {
            return '<tr>' +
                '<td><input type="text" id="sp-stat-' + i + '-icon" value="' + esc(c.icon) + '"></td>' +
                '<td><input type="text" id="sp-stat-' + i + '-value" value="' + esc(c.value) + '"></td>' +
                '<td><input type="text" id="sp-stat-' + i + '-label" value="' + esc(c.label) + '" style="width:100%"></td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="delSpStat(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        }).join('');
    }

    // Sections
    var container = el('sp-sections-container');
    if (container && sp.sections) {
        container.innerHTML = sp.sections.map(function (s, i) {
            return '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem">' +
                '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">' +
                '<input type="text" id="sp-sec-' + i + '-title" value="' + esc(s.title) + '" placeholder="Title" style="flex:1">' +
                '<input type="text" id="sp-sec-' + i + '-icon" value="' + esc(s.icon) + '" placeholder="Icon class" style="width:200px">' +
                '<button class="btn btn-danger btn-sm" onclick="delSpSection(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
                '</div>' +
                '<textarea id="sp-sec-' + i + '-content" rows="8" style="width:100%;font-size:0.85rem">' + esc(s.content) + '</textarea>' +
                '</div>';
        }).join('');
    }

    // FAQ items
    var faqTbody = el('sp-faq-tbody');
    if (faqTbody && sp.faqItems) {
        faqTbody.innerHTML = sp.faqItems.map(function (item, i) {
            return '<tr>' +
                '<td><input type="text" id="sp-faq-' + i + '-q" value="' + esc(item.question) + '" style="width:100%"></td>' +
                '<td><textarea id="sp-faq-' + i + '-a" rows="2" style="width:100%;font-size:0.85rem">' + esc(item.answer) + '</textarea></td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="delSpFaq(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        }).join('');
    }
}

function collectShipping() {
    var sp = data.shippingPage;
    if (!sp) return;
    var el = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };

    sp.pageTitle = el('sp-pageTitle');
    sp.pageDesc = el('sp-pageDesc');

    // Stat cards
    sp.statCards = [];
    var statTbody = document.getElementById('sp-stats-tbody');
    if (statTbody) {
        statTbody.querySelectorAll('tr').forEach(function (_, i) {
            sp.statCards.push({
                icon: el('sp-stat-' + i + '-icon'),
                value: el('sp-stat-' + i + '-value'),
                label: el('sp-stat-' + i + '-label')
            });
        });
    }

    // Sections
    sp.sections = [];
    var idx = 0;
    while (document.getElementById('sp-sec-' + idx + '-title')) {
        sp.sections.push({
            icon: el('sp-sec-' + idx + '-icon'),
            title: el('sp-sec-' + idx + '-title'),
            content: el('sp-sec-' + idx + '-content')
        });
        idx++;
    }

    // FAQ items
    sp.faqItems = [];
    var faqTbody = document.getElementById('sp-faq-tbody');
    if (faqTbody) {
        faqTbody.querySelectorAll('tr').forEach(function (_, i) {
            sp.faqItems.push({
                question: el('sp-faq-' + i + '-q'),
                answer: el('sp-faq-' + i + '-a')
            });
        });
    }
}

function addSpStat() { collectShipping(); data.shippingPage.statCards.push({ icon: 'fa-solid fa-star', value: 'New Stat', label: 'Description' }); renderShipping(); }
function delSpStat(i) { collectShipping(); data.shippingPage.statCards.splice(i, 1); renderShipping(); }
function addSpSection() { collectShipping(); data.shippingPage.sections.push({ icon: 'fa-solid fa-star', title: 'New Section', content: '<p>Content here</p>' }); renderShipping(); }
function delSpSection(i) { collectShipping(); data.shippingPage.sections.splice(i, 1); renderShipping(); }
function addSpFaq() { collectShipping(); data.shippingPage.faqItems.push({ question: 'New question?', answer: 'Answer here.' }); renderShipping(); }
function delSpFaq(i) { collectShipping(); data.shippingPage.faqItems.splice(i, 1); renderShipping(); }

// ────────── Size Guide ──────────
function renderSizeGuide() {
    var sg = data.sizeGuidePage;
    if (!sg) return;
    var el = function (id) { return document.getElementById(id); };

    if (el('sg-pageTitle')) el('sg-pageTitle').value = sg.pageTitle || '';
    if (el('sg-pageDesc')) el('sg-pageDesc').value = sg.pageDesc || '';

    // Sections (tabs)
    var container = el('sg-sections-container');
    if (container && sg.sections) {
        container.innerHTML = sg.sections.map(function (s, i) {
            return '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem">' +
                '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">' +
                '<input type="text" id="sg-sec-' + i + '-id" value="' + esc(s.id) + '" placeholder="Tab ID" style="width:120px">' +
                '<input type="text" id="sg-sec-' + i + '-title" value="' + esc(s.title) + '" placeholder="Title" style="flex:1">' +
                '<input type="text" id="sg-sec-' + i + '-icon" value="' + esc(s.icon) + '" placeholder="Icon class" style="width:200px">' +
                '<button class="btn btn-danger btn-sm" onclick="delSgSection(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
                '</div>' +
                '<textarea id="sg-sec-' + i + '-content" rows="10" style="width:100%;font-size:0.85rem">' + esc(s.content) + '</textarea>' +
                '</div>';
        }).join('');
    }
}

function collectSizeGuide() {
    var sg = data.sizeGuidePage;
    if (!sg) return;
    var el = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };

    sg.pageTitle = el('sg-pageTitle');
    sg.pageDesc = el('sg-pageDesc');

    // Sections
    sg.sections = [];
    var idx = 0;
    while (document.getElementById('sg-sec-' + idx + '-title')) {
        sg.sections.push({
            id: el('sg-sec-' + idx + '-id'),
            icon: el('sg-sec-' + idx + '-icon'),
            title: el('sg-sec-' + idx + '-title'),
            content: el('sg-sec-' + idx + '-content')
        });
        idx++;
    }
}

function addSgSection() { collectSizeGuide(); data.sizeGuidePage.sections.push({ id: 'tab-new-' + Date.now(), icon: 'fa-solid fa-star', title: 'New Tab', content: '<p>Content here</p>' }); renderSizeGuide(); }
function delSgSection(i) { collectSizeGuide(); data.sizeGuidePage.sections.splice(i, 1); renderSizeGuide(); }

// ────────── Track Order ──────────
function renderTrackOrder() {
    var to = data.trackOrderPage;
    if (!to) return;
    var el = function (id) { return document.getElementById(id); };

    if (el('to-pageTitle')) el('to-pageTitle').value = to.pageTitle || '';
    if (el('to-pageDesc')) el('to-pageDesc').value = to.pageDesc || '';

    // Form labels
    var fl = to.formLabels;
    if (fl) {
        if (el('to-fl-heading')) el('to-fl-heading').value = fl.heading || '';
        if (el('to-fl-subtext')) el('to-fl-subtext').value = fl.subtext || '';
        if (el('to-fl-orderId')) el('to-fl-orderId').value = fl.orderIdLabel || '';
        if (el('to-fl-email')) el('to-fl-email').value = fl.emailLabel || '';
        if (el('to-fl-submit')) el('to-fl-submit').value = fl.submitBtn || '';
    }

    // Info cards
    var infoTbody = el('to-info-tbody');
    if (infoTbody && to.infoCards) {
        infoTbody.innerHTML = to.infoCards.map(function (c, i) {
            return '<tr>' +
                '<td><input type="text" id="to-info-' + i + '-icon" value="' + esc(c.icon) + '"></td>' +
                '<td><select id="to-info-' + i + '-color"><option ' + (c.color === 'orange' ? 'selected' : '') + '>orange</option><option ' + (c.color === 'blue' ? 'selected' : '') + '>blue</option><option ' + (c.color === 'green' ? 'selected' : '') + '>green</option><option ' + (c.color === 'red' ? 'selected' : '') + '>red</option></select></td>' +
                '<td><input type="text" id="to-info-' + i + '-title" value="' + esc(c.title) + '"></td>' +
                '<td><input type="text" id="to-info-' + i + '-desc" value="' + esc(c.desc) + '" style="width:100%"></td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="delToInfoCard(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        }).join('');
    }
}

function collectTrackOrder() {
    var to = data.trackOrderPage;
    if (!to) return;
    var el = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };

    to.pageTitle = el('to-pageTitle');
    to.pageDesc = el('to-pageDesc');

    // Form labels
    if (!to.formLabels) to.formLabels = {};
    to.formLabels.heading = el('to-fl-heading');
    to.formLabels.subtext = el('to-fl-subtext');
    to.formLabels.orderIdLabel = el('to-fl-orderId');
    to.formLabels.emailLabel = el('to-fl-email');
    to.formLabels.submitBtn = el('to-fl-submit');

    // Info cards
    to.infoCards = [];
    var infoTbody = document.getElementById('to-info-tbody');
    if (infoTbody) {
        infoTbody.querySelectorAll('tr').forEach(function (_, i) {
            to.infoCards.push({
                icon: el('to-info-' + i + '-icon'),
                color: el('to-info-' + i + '-color'),
                title: el('to-info-' + i + '-title'),
                desc: el('to-info-' + i + '-desc')
            });
        });
    }
}

function addToInfoCard() { collectTrackOrder(); data.trackOrderPage.infoCards.push({ icon: 'fa-solid fa-star', color: 'blue', title: 'New Card', desc: '' }); renderTrackOrder(); }
function delToInfoCard(i) { collectTrackOrder(); data.trackOrderPage.infoCards.splice(i, 1); renderTrackOrder(); }

// ────────── Brand Logos ──────────
function renderBrandLogos() {
    var logos = data.brandLogos;
    if (!logos) return;
    var el = function (id) { return document.getElementById(id); };

    var tbody = el('bl-tbody');
    if (tbody) {
        tbody.innerHTML = logos.map(function (b, i) {
            return '<tr>' +
                '<td><input type="text" id="bl-' + i + '-name" value="' + esc(b.name) + '"></td>' +
                '<td><input type="text" id="bl-' + i + '-img" value="' + esc(b.img) + '" style="width:100%"></td>' +
                '<td><input type="text" id="bl-' + i + '-href" value="' + esc(b.href) + '"></td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="delBrandLogo(' + i + ')"><i class="fa-solid fa-trash"></i></button></td>' +
                '</tr>';
        }).join('');
    }
}

function collectBrandLogos() {
    var el = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
    data.brandLogos = [];
    var tbody = document.getElementById('bl-tbody');
    if (tbody) {
        tbody.querySelectorAll('tr').forEach(function (_, i) {
            data.brandLogos.push({
                name: el('bl-' + i + '-name'),
                img: el('bl-' + i + '-img'),
                href: el('bl-' + i + '-href')
            });
        });
    }
}

function addBrandLogo() { collectBrandLogos(); data.brandLogos.push({ name: 'New Brand', img: '../public/images/new-brand.webp', href: 'brand.html?id=new-brand' }); renderBrandLogos(); }
function delBrandLogo(i) { collectBrandLogos(); data.brandLogos.splice(i, 1); renderBrandLogos(); }

function collectAll() {
    collectIdentity();
    collectNav();
    collectFooter();
    collectSlides();
    collectTrust();
    collectBrands();
    collectTopCats();
    collectFP();
    collectCtaBanner();
    collectTestimonials();
    collectCat();
    collectAllProducts();
    collectTheme();
    collectFaq();
    collectContact();
    collectReturnPolicy();
    collectShipping();
    collectSizeGuide();
    collectTrackOrder();
    collectBrandLogos();
}

function saveAll() {
    collectAll();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showToast('All changes saved to local storage!');
}

function resetAll() {
    if (confirm('Reset all CMS data to defaults? This cannot be undone.')) {
        data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        saveAll();
        renderAll();
    }
}

function exportData() {
    collectAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spareblaze_cms_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ------ Individual Collectors ------
function collectIdentity() {
    data.siteIdentity.siteName = document.getElementById('si-name').value;
    data.siteIdentity.tagline = document.getElementById('si-tagline').value;
    data.siteIdentity.copyright = document.getElementById('si-copyright').value;
    const img = document.getElementById('si-logo');
    if (img && !img.value.startsWith('(')) data.siteIdentity.logoUrl = img.value;
}

function collectNav() {
    data.navLinks = [];
    document.querySelectorAll('#nav-links-tbody tr').forEach((_tr, i) => {
        data.navLinks.push({
            label: document.getElementById(`nl-${i}-lbl`).value,
            href: document.getElementById(`nl-${i}-href`).value
        });
    });
}

function collectFooter() {
    data.footer.phone = document.getElementById('f-phone').value;
    data.footer.email = document.getElementById('f-email').value;
    data.footer.address = document.getElementById('f-address').value;
    data.footer.whatsapp = document.getElementById('f-whatsapp').value;
    data.footer.instagram = document.getElementById('f-instagram').value;
    data.footer.facebook = document.getElementById('f-facebook').value;
    data.footer.twitter = document.getElementById('f-twitter').value;
    data.footer.youtube = document.getElementById('f-youtube').value;
}

function collectSlides() {
    data.slides.forEach((s, i) => {
        const bg = document.getElementById(`slide-${i}-bg`); if (bg && !bg.value.startsWith('(')) s.bg = bg.value;
        s.badge = document.getElementById(`slide-${i}-badge`).value;
        s.highlight = document.getElementById(`slide-${i}-highlight`).value;
        s.headline = document.getElementById(`slide-${i}-headline`).value;
        s.subtitle = document.getElementById(`slide-${i}-subtitle`).value;
        s.cta = document.getElementById(`slide-${i}-cta`).value;
        s.ctaLink = document.getElementById(`slide-${i}-ctaLink`).value;
        s.cta2 = document.getElementById(`slide-${i}-cta2`).value;
        s.cta2Link = document.getElementById(`slide-${i}-cta2Link`).value;
    });
}

function collectTrust() {
    data.trustBar = [];
    document.querySelectorAll('#trust-tbody tr').forEach((_tr, i) => {
        data.trustBar.push({
            icon: document.getElementById(`tb-${i}-ico`).value,
            text: document.getElementById(`tb-${i}-txt`).value
        });
    });
}

function collectBrands() {
    data.carBrands = [];
    document.querySelectorAll('#brands-tbody tr').forEach((_tr, i) => {
        data.carBrands.push({
            label: document.getElementById(`cb-${i}-lbl`).value,
            id: document.getElementById(`cb-${i}-id`).value
        });
    });
}

function collectTopCats() {
    data.topCategories = [];
    document.querySelectorAll('#topcats-tbody tr').forEach((_tr, i) => {
        data.topCategories.push({
            icon: document.getElementById(`tc-${i}-ico`).value,
            color: document.getElementById(`tc-${i}-clr`).value,
            name: document.getElementById(`tc-${i}-name`).value,
            href: document.getElementById(`tc-${i}-href`).value
        });
    });
}

function collectCtaBanner() {
    data.ctaBanner.headline = document.getElementById('cta-headline').value;
    data.ctaBanner.desc = document.getElementById('cta-desc').value;
    data.ctaBanner.btnText = document.getElementById('cta-btn').value;
}

function collectTestimonials() {
    data.testimonials = [];
    document.querySelectorAll('#testimonials-tbody tr').forEach((_tr, i) => {
        data.testimonials.push({
            name: document.getElementById(`tm-${i}-name`).value,
            review: document.getElementById(`tm-${i}-review`).value
        });
    });
}

// ------ All Products & Theme Logic ------
function renderAllProductsTable() {
    const catId = document.getElementById('prod-category-select').value;
    // Add listener only once
    const select = document.getElementById('prod-category-select');
    if (select && !select.dataset.listenerSet) {
        select.addEventListener('change', renderAllProductsTable);
        select.dataset.listenerSet = 'true';
    }
    let cat = data.categories.find(c => c.id === catId);

    // Find existing global data if available
    const globalDataMap = {
        'after-market': typeof afterMarketProducts !== 'undefined' ? afterMarketProducts : null,
        'refurbished': typeof refurbishedProducts !== 'undefined' ? refurbishedProducts : null,
        'used': typeof usedProducts !== 'undefined' ? usedProducts : null,
        'oem': typeof oemProducts !== 'undefined' ? oemProducts : null,
        'wholesale': typeof wholesaleProducts !== 'undefined' ? wholesaleProducts : null
    };

    if ((!cat || !cat.products || cat.products.length === 0) && globalDataMap[catId]) {
        const initialProducts = globalDataMap[catId].map(p => ({
            name: p.title || p.name,
            price: parseFloat(String(p.amount || p.price).replace(/[^0-9.]/g, '')),
            mrp: parseFloat(String(p.originalPrice || p.mrp || 0).replace(/[^0-9.]/g, '')),
            brand: p.brand || '',
            vehicle: p.vehicle || '',
            label: p.badge || p.label || '',
            stock: p.stock || 'In Stock',
            img: p.image || p.img || ''
        }));

        if (!cat) {
            cat = { id: catId, title: catId.replace(/-/g, ' '), products: initialProducts };
            data.categories.push(cat);
        } else {
            cat.products = initialProducts;
        }
    }

    if (!cat) {
        document.getElementById('allproducts-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--muted)">No products found for this category.</td></tr>';
        return;
    }

    document.getElementById('allproducts-tbody').innerHTML = cat.products.map((p, i) => `
        <tr id="ap-row-${i}">
            <td><img class="img-thumb" src="${p.img || 'https://dummyimage.com/40x40/20243a/888'}" 
                     onclick="pickProdFile('ap',${i})" 
                     onerror="this.src='https://dummyimage.com/40x40/20243a/888'"></td>
            <td><input type="text" id="ap-${i}-name" value="${esc(p.name)}"></td>
            <td><input type="text" id="ap-${i}-brand" value="${esc(p.brand || '')}" style="width:85px"></td>
            <td><input type="text" id="ap-${i}-vehicle" value="${esc(p.vehicle || '')}" style="width:100px"></td>
            <td><input type="number" id="ap-${i}-price" value="${p.price}" style="width:75px"></td>
            <td><input type="number" id="ap-${i}-mrp" value="${p.mrp}" style="width:75px"></td>
            <td><input type="text" id="ap-${i}-label" value="${esc(p.label || '')}" style="width:80px"></td>
            <td><select id="ap-${i}-stock" style="width:80px">
                <option value="In Stock" ${p.stock === 'In Stock' ? 'selected' : ''}>In Stock</option>
                <option value="Out of Stock" ${p.stock === 'Out of Stock' ? 'selected' : ''}>Out of Stock</option>
            </select></td>
            <td>
                <div style="display:flex;gap:.3rem">
                    <button class="btn btn-danger btn-sm" onclick="arrDelAllProd(${i})"><i class="fa-solid fa-trash"></i></button>
                    <input type="hidden" id="ap-${i}-img" value="${p.img.startsWith('data:') ? '(local image)' : esc(p.img)}">
                </div>
            </td>
        </tr>
    `).join('');
}

function addAllProduct() {
    const catId = document.getElementById('prod-category-select').value;
    const cat = data.categories.find(c => c.id === catId);
    if (!cat) return;
    collectAllProducts();
    cat.products.push({ name: 'New Product', price: 0, mrp: 0, brand: '', vehicle: '', label: '', stock: 'In Stock', img: '' });
    renderAllProductsTable();
}

function arrDelAllProd(i) {
    const catId = document.getElementById('prod-category-select').value;
    const cat = data.categories.find(c => c.id === catId);
    if (!cat) return;
    collectAllProducts();
    cat.products.splice(i, 1);
    renderAllProductsTable();
}

function collectAllProducts() {
    const catId = document.getElementById('prod-category-select').value;
    const cat = data.categories.find(c => c.id === catId);
    if (!cat) return;
    cat.products.forEach((p, i) => {
        const n = document.getElementById(`ap-${i}-name`); if (n) p.name = n.value;
        const b = document.getElementById(`ap-${i}-brand`); if (b) p.brand = b.value;
        const v = document.getElementById(`ap-${i}-vehicle`); if (v) p.vehicle = v.value;
        const pr = document.getElementById(`ap-${i}-price`); if (pr) p.price = parseInt(pr.value) || 0;
        const m = document.getElementById(`ap-${i}-mrp`); if (m) p.mrp = parseInt(m.value) || 0;
        const l = document.getElementById(`ap-${i}-label`); if (l) p.label = l.value;
        const s = document.getElementById(`ap-${i}-stock`); if (s) p.stock = s.value;
        const img = document.getElementById(`ap-${i}-img`); if (img && !img.value.startsWith('(')) p.img = img.value;
    });
}

function renderTheme() {
    document.getElementById('theme-primary').value = data.theme.primary;
    document.getElementById('theme-primary-soft').value = data.theme.primarySoft;
    document.getElementById('theme-font').value = data.theme.fontFamily;
}

function collectTheme() {
    data.theme.primary = document.getElementById('theme-primary').value;
    data.theme.primarySoft = document.getElementById('theme-primary-soft').value;
    data.theme.fontFamily = document.getElementById('theme-font').value;
}

function saveSecurity() {
    const u = document.getElementById('sec-username').value;
    const p = document.getElementById('sec-p').value;
    const q = document.getElementById('sec-q').value;
    const a = document.getElementById('sec-a').value;

    if (u) {
        const creds = getCreds();
        creds.u = u;
        if (p) creds.p = p;
        localStorage.setItem(CRED_KEY, JSON.stringify(creds));
    }
    if (q && a) {
        localStorage.setItem(RECOVERY_KEY, JSON.stringify({ q, a }));
    }
    showToast('Security settings updated!');
}

function renderSecurity() {
    const creds = getCreds();
    const recovery = getRecovery();
    document.getElementById('sec-username').value = creds.u;
    document.getElementById('sec-q').value = recovery.q;
    document.getElementById('sec-a').value = recovery.a;
}

// Init
init();

// ══════════════════════════════════════════════════════════════════════════════
// DB-CONNECTED ADMIN — Login, Categories, Products, Inventory
// (API base URL is declared at the very top of this file)
// ══════════════════════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────────────────────

function getToken() { return localStorage.getItem('sb_admin_token') || ''; }
function setToken(t) { localStorage.setItem('sb_admin_token', t); }
function clearToken() { localStorage.removeItem('sb_admin_token'); }

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

async function apiFetch(method, path, body) {
    var opts = { method: method, headers: authHeaders() };
    if (body !== undefined) opts.body = JSON.stringify(body);
    var r;
    try {
        r = await fetch(API + path, opts);
    } catch (netErr) {
        // Network-level failure — backend unreachable or CORS blocked
        throw new Error(
            'Cannot reach the backend at ' + API + '. ' +
            'Make sure the server is running (npm run dev) and try refreshing. ' +
            '(' + netErr.message + ')'
        );
    }
    var j;
    try { j = await r.json(); } catch (_) { throw new Error('Server returned an invalid response (HTTP ' + r.status + ')'); }
    if (r.status === 401) { clearToken(); showLoginOverlay(); throw Object.assign(new Error(j.message || 'Session expired. Please sign in again.'), { status: 401 }); }
    if (!j.success) throw Object.assign(new Error(j.message || 'API error'), { status: r.status });
    return j;
}

async function apiGet(path)           { return apiFetch('GET',    path); }
async function apiPost(path, body)    { return apiFetch('POST',   path, body); }
async function apiPut(path, body)     { return apiFetch('PUT',    path, body); }
async function apiDelete(path)        { return apiFetch('DELETE', path); }

// ── Login overlay ─────────────────────────────────────────────────────────────

function showLoginOverlay() {
    const el = document.getElementById('admin-login-overlay');
    if (el) el.style.display = 'flex';
}

function hideLoginOverlay() {
    const el = document.getElementById('admin-login-overlay');
    if (el) el.style.display = 'none';
}

async function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    const btn   = document.getElementById('login-btn');
    errEl.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';
    try {
        const j = await apiPost('/api/v1/auth/login', { email, password: pass });
        setToken(j.data.token);
        hideLoginOverlay();
        showToast('Signed in as ' + (j.data.user.name || email));
        dbLoadCategories();
    } catch (e) {
        errEl.textContent = e.message || 'Login failed. Check credentials.';
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
    }
}

async function checkAdminAuth() {
    if (!getToken()) { showLoginOverlay(); return false; }
    try {
        await apiGet('/api/v1/auth/me');
        return true;
    } catch (_) {
        clearToken();
        showLoginOverlay();
        return false;
    }
}

// Override the sidebar logout button to also clear the JWT
var _origHandleLogout = window.handleLogout;
window.handleLogout = function () {
    clearToken();
    if (typeof _origHandleLogout === 'function') _origHandleLogout();
};

// ── DB Categories ─────────────────────────────────────────────────────────────

var dbCats = [];
var dbProdPage = 1;
var dbProdSearch = '';
var dbSearchTimer = null;
var dbInvPage = 1;

async function dbLoadCategories() {
    const tbody = document.getElementById('db-cat-tbody');
    const errEl = document.getElementById('cat-db-error');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--muted)">Loading…</td></tr>';
    if (errEl) errEl.style.display = 'none';
    try {
        const j = await apiGet('/api/v1/categories');
        dbCats = j.data || [];
        populateCatSelects();
        tbody.innerHTML = dbCats.length === 0
            ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted)">No categories yet.</td></tr>'
            : dbCats.map(function (c) {
                var parentName = c.parentId ? ((dbCats.find(function (p) { return p.id === c.parentId; }) || {}).name || c.parentId) : '—';
                return '<tr>' +
                    '<td>' + esc(c.name) + '</td>' +
                    '<td style="color:var(--muted);font-size:.82rem">' + esc(c.slug) + '</td>' +
                    '<td>' + (c._count ? c._count.products : '—') + '</td>' +
                    '<td>' + parentName + '</td>' +
                    '<td><button class="btn btn-danger btn-sm" onclick="dbDeleteCategory(\'' + c.id + '\',\'' + esc(c.name) + '\')"><i class="fa-solid fa-trash"></i></button></td>' +
                    '</tr>';
            }).join('');
    } catch (e) {
        if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
        if (e.status === 401 || e.status === 403) showLoginOverlay();
    }
}

function populateCatSelects() {
    const opts = dbCats.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('');
    const parentSel = document.getElementById('new-cat-parent');
    if (parentSel) parentSel.innerHTML = '<option value="">None (top-level)</option>' + opts;
    const filterSel = document.getElementById('db-prod-cat-filter');
    if (filterSel) filterSel.innerHTML = '<option value="">All Categories</option>' + opts;
    const pmCat = document.getElementById('pm-cat');
    if (pmCat) pmCat.innerHTML = opts;
}

function openAddCategory() {
    document.getElementById('add-cat-form').style.display = 'block';
    document.getElementById('new-cat-name').focus();
}

async function submitAddCategory() {
    const name     = document.getElementById('new-cat-name').value.trim();
    const parentId = document.getElementById('new-cat-parent').value || null;
    const errEl    = document.getElementById('cat-db-error');
    if (!name) { if (errEl) { errEl.textContent = 'Category name is required.'; errEl.style.display = 'block'; } return; }
    try {
        await apiPost('/api/v1/categories', { name, parentId });
        document.getElementById('add-cat-form').style.display = 'none';
        document.getElementById('new-cat-name').value = '';
        showToast('Category "' + name + '" created.');
        dbLoadCategories();
    } catch (e) {
        if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
    }
}

async function dbDeleteCategory(id, name) {
    if (!confirm('Delete category "' + name + '"? This cannot be undone.')) return;
    const errEl = document.getElementById('cat-db-error');
    try {
        await apiDelete('/api/v1/categories/' + id);
        showToast('Category deleted.');
        dbLoadCategories();
    } catch (e) {
        if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
    }
}

// ── DB Products ───────────────────────────────────────────────────────────────

function dbSearchDebounce() {
    clearTimeout(dbSearchTimer);
    dbSearchTimer = setTimeout(function () {
        dbProdSearch = (document.getElementById('db-prod-search') || {}).value || '';
        dbLoadProducts(1);
    }, 400);
}

async function dbLoadProducts(page) {
    dbProdPage = page || 1;
    const tbody    = document.getElementById('db-prod-tbody');
    const countEl  = document.getElementById('db-prod-count');
    const pagEl    = document.getElementById('db-prod-pagination');
    if (!tbody) return;

    const catId  = (document.getElementById('db-prod-cat-filter') || {}).value || '';
    const search = dbProdSearch;

    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:1.5rem;color:var(--muted)">Loading…</td></tr>';

    try {
        var url = '/api/v1/products?page=' + dbProdPage + '&limit=20';
        if (catId)  url += '&category=' + encodeURIComponent(catId);
        if (search) url = '/api/v1/products/search?q=' + encodeURIComponent(search) + '&page=' + dbProdPage + '&limit=20';

        const j   = await apiGet(url);
        const prods = j.data || [];
        const pg    = j.pagination || {};

        if (countEl) countEl.textContent = (pg.total || prods.length) + ' products';

        tbody.innerHTML = prods.length === 0
            ? '<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--muted)">No products found.</td></tr>'
            : prods.map(function (p) {
                var img   = (p.images && p.images[0]) ? p.images[0] : '';
                var stock = p.inventory ? p.inventory.quantity : '—';
                var active = p.isActive ? '<span style="color:var(--success);font-size:.8rem">Active</span>' : '<span style="color:var(--danger);font-size:.8rem">Inactive</span>';
                return '<tr>' +
                    '<td><img src="' + esc(img || 'https://dummyimage.com/40x40/20243a/888') + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px" onerror="this.src=\'https://dummyimage.com/40x40/20243a/888\'"></td>' +
                    '<td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.title) + '</td>' +
                    '<td>' + esc(p.brand || '—') + '</td>' +
                    '<td>' + esc(p.category ? p.category.name : '—') + '</td>' +
                    '<td>₹' + parseFloat(p.price).toLocaleString('en-IN') + '</td>' +
                    '<td>₹' + parseFloat(p.mrp).toLocaleString('en-IN') + '</td>' +
                    '<td>' + (p.discountPercent || 0) + '%</td>' +
                    '<td>' + stock + '</td>' +
                    '<td>' + active + '</td>' +
                    '<td style="white-space:nowrap">' +
                        '<button class="btn btn-outline btn-sm" style="margin-right:.3rem" onclick="openEditProduct(\'' + p.id + '\')"><i class="fa-solid fa-pen"></i></button>' +
                        '<button class="btn btn-danger btn-sm" onclick="dbDeleteProduct(\'' + p.id + '\',\'' + esc(p.title.substring(0, 30)) + '\')"><i class="fa-solid fa-trash"></i></button>' +
                    '</td>' +
                    '</tr>';
            }).join('');

        // Pagination buttons
        if (pagEl && pg.totalPages > 1) {
            var btns = '';
            for (var i = 1; i <= pg.totalPages; i++) {
                btns += '<button class="btn ' + (i === dbProdPage ? 'btn-primary' : 'btn-outline') + ' btn-sm" onclick="dbLoadProducts(' + i + ')">' + i + '</button>';
            }
            pagEl.innerHTML = btns;
        } else if (pagEl) { pagEl.innerHTML = ''; }

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:1.5rem;color:var(--danger)">' + esc(e.message) + '</td></tr>';
        if (e.status === 401 || e.status === 403) showLoginOverlay();
    }
}

// ── Product Modal ─────────────────────────────────────────────────────────────

function openAddProduct() {
    document.getElementById('prod-modal-title').textContent = 'Add Product';
    document.getElementById('pm-id').value    = '';
    document.getElementById('pm-title').value = '';
    document.getElementById('pm-brand').value = '';
    document.getElementById('pm-price').value = '';
    document.getElementById('pm-mrp').value   = '';
    document.getElementById('pm-disc').value  = '0';
    document.getElementById('pm-qty').value   = '0';
    document.getElementById('pm-img').value   = '';
    document.getElementById('pm-desc').value  = '';
    document.getElementById('pm-sku').value   = '';
    if (dbCats.length === 0) dbLoadCategories();
    document.getElementById('prod-modal-overlay').style.display = 'flex';
}

async function openEditProduct(id) {
    try {
        const j = await apiGet('/api/v1/products/' + id);
        const p = j.data;
        document.getElementById('prod-modal-title').textContent = 'Edit Product';
        document.getElementById('pm-id').value    = p.id;
        document.getElementById('pm-title').value = p.title;
        document.getElementById('pm-brand').value = p.brand || '';
        document.getElementById('pm-price').value = p.price;
        document.getElementById('pm-mrp').value   = p.mrp;
        document.getElementById('pm-disc').value  = p.discountPercent || 0;
        document.getElementById('pm-qty').value   = p.inventory ? p.inventory.quantity : 0;
        document.getElementById('pm-img').value   = (p.images && p.images[0]) || '';
        document.getElementById('pm-desc').value  = p.description || '';
        document.getElementById('pm-sku').value   = p.sku || '';
        // Select correct category
        const pmCat = document.getElementById('pm-cat');
        if (pmCat && p.category) {
            for (var i = 0; i < pmCat.options.length; i++) {
                if (pmCat.options[i].value === p.categoryId) { pmCat.selectedIndex = i; break; }
            }
        }
        document.getElementById('prod-modal-overlay').style.display = 'flex';
    } catch (e) {
        showToast('Error: ' + e.message);
    }
}

function closeProdModal() {
    document.getElementById('prod-modal-overlay').style.display = 'none';
}

async function saveProdModal() {
    const id    = document.getElementById('pm-id').value;
    const title = document.getElementById('pm-title').value.trim();
    const price = parseFloat(document.getElementById('pm-price').value);
    const catId = document.getElementById('pm-cat').value;
    if (!title) { showToast('Title is required.'); return; }
    if (isNaN(price) || price < 0) { showToast('Valid price is required.'); return; }
    if (!catId) { showToast('Category is required.'); return; }

    const imgVal = document.getElementById('pm-img').value.trim();
    const body   = {
        title,
        brand:           document.getElementById('pm-brand').value.trim() || undefined,
        categoryId:      catId,
        price,
        mrp:             parseFloat(document.getElementById('pm-mrp').value) || price,
        discountPercent: parseInt(document.getElementById('pm-disc').value) || 0,
        images:          imgVal ? [imgVal] : [],
        description:     document.getElementById('pm-desc').value.trim() || undefined,
        sku:             document.getElementById('pm-sku').value.trim() || undefined,
    };

    try {
        if (id) {
            await apiPut('/api/v1/products/' + id, body);
            // Update stock if qty changed
            const qty = parseInt(document.getElementById('pm-qty').value) || 0;
            await apiPut('/api/v1/admin/inventory/' + id, { quantity: qty });
            showToast('Product updated.');
        } else {
            const j = await apiPost('/api/v1/products', body);
            const newId = j.data && j.data.id;
            if (newId) {
                const qty = parseInt(document.getElementById('pm-qty').value) || 0;
                if (qty > 0) await apiPut('/api/v1/admin/inventory/' + newId, { quantity: qty });
            }
            showToast('Product created.');
        }
        closeProdModal();
        dbLoadProducts(dbProdPage);
    } catch (e) {
        showToast('Error: ' + e.message);
    }
}

async function dbDeleteProduct(id, title) {
    if (!confirm('Deactivate "' + title + '…"? The product will be hidden from the store.')) return;
    try {
        await apiDelete('/api/v1/products/' + id);
        showToast('Product deactivated.');
        dbLoadProducts(dbProdPage);
    } catch (e) { showToast('Error: ' + e.message); }
}

// ── DB Inventory ──────────────────────────────────────────────────────────────

async function dbLoadInventory(page) {
    dbInvPage = page || 1;
    const tbody = document.getElementById('db-inv-tbody');
    const pagEl = document.getElementById('db-inv-pagination');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:1.5rem;color:var(--muted)">Loading…</td></tr>';

    try {
        const j    = await apiGet('/api/v1/admin/inventory?page=' + dbInvPage + '&limit=20');
        const items = j.data || [];
        const pg    = j.pagination || {};

        tbody.innerHTML = items.length === 0
            ? '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">No inventory records.</td></tr>'
            : items.map(function (inv) {
                var p       = inv.product || {};
                var lowFlag = inv.quantity <= inv.lowStockThreshold;
                var rowStyle = lowFlag ? 'background:rgba(246,166,9,.08)' : '';
                return '<tr style="' + rowStyle + '">' +
                    '<td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
                        (lowFlag ? '<span title="Low stock" style="color:var(--warning);margin-right:.4rem"><i class="fa-solid fa-triangle-exclamation"></i></span>' : '') +
                        esc(p.title || '—') +
                    '</td>' +
                    '<td>' + esc(p.category ? p.category.name : '—') + '</td>' +
                    '<td>₹' + parseFloat(p.price || 0).toLocaleString('en-IN') + '</td>' +
                    '<td><input type="number" id="inv-qty-' + esc(inv.productId) + '" value="' + inv.quantity + '" min="0" style="width:70px" onchange="this.dataset.dirty=\'1\'"></td>' +
                    '<td>' + inv.lowStockThreshold + '</td>' +
                    '<td><button class="btn btn-primary btn-sm" onclick="saveInventoryRow(\'' + esc(inv.productId) + '\')"><i class="fa-solid fa-check"></i></button></td>' +
                    '</tr>';
            }).join('');

        if (pagEl && pg.totalPages > 1) {
            var btns = '';
            for (var i = 1; i <= pg.totalPages; i++) {
                btns += '<button class="btn ' + (i === dbInvPage ? 'btn-primary' : 'btn-outline') + ' btn-sm" onclick="dbLoadInventory(' + i + ')">' + i + '</button>';
            }
            pagEl.innerHTML = btns;
        } else if (pagEl) { pagEl.innerHTML = ''; }

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:1.5rem;color:var(--danger)">' + esc(e.message) + '</td></tr>';
        if (e.status === 401 || e.status === 403) showLoginOverlay();
    }
}

async function saveInventoryRow(productId) {
    const inp = document.getElementById('inv-qty-' + productId);
    if (!inp) return;
    const qty = parseInt(inp.value, 10);
    if (isNaN(qty) || qty < 0) { showToast('Invalid quantity.'); return; }
    try {
        await apiPut('/api/v1/admin/inventory/' + productId, { quantity: qty });
        inp.dataset.dirty = '';
        showToast('Stock updated.');
    } catch (e) { showToast('Error: ' + e.message); }
}

// ── Wire panel activation to auto-load data ──────────────────────────────────

var _origShowPanel = window.showPanel;
window.showPanel = function (name) {
    if (typeof _origShowPanel === 'function') _origShowPanel(name);
    if (name === 'db-categories') {
        if (!getToken()) { showLoginOverlay(); return; }
        dbLoadCategories();
    }
    if (name === 'db-products') {
        if (!getToken()) { showLoginOverlay(); return; }
        if (dbCats.length === 0) dbLoadCategories();
        dbLoadProducts(1);
    }
    if (name === 'db-inventory') {
        if (!getToken()) { showLoginOverlay(); return; }
        dbLoadInventory(1);
    }
};

// ── Check auth on page load ───────────────────────────────────────────────────
checkAdminAuth();

