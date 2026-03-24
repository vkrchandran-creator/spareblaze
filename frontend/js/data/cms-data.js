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
                {
                    id: 'eligible', icon: 'fa-solid fa-circle-check', color: 'green', title: 'Return Eligibility Criteria',
                    content: '<p class="criteria-intro">To qualify for a return, <strong>all</strong> of the following conditions must be met at the time of your return request:</p><ul class="check-list"><li><span class="ci"><i class="fa-solid fa-check"></i></span><span><strong>Within 30 days of delivery date</strong> — Returns initiated after 30 days of the confirmed delivery date will not be accepted.</span></li><li><span class="ci"><i class="fa-solid fa-check"></i></span><span><strong>Unused and uninstalled condition</strong> — The part must not have been fitted to or installed in any vehicle. Any fitment marks will void the return eligibility.</span></li><li><span class="ci"><i class="fa-solid fa-check"></i></span><span><strong>Original packaging, all accessories &amp; documentation intact</strong> — Return in the original manufacturer packaging with all accessories, bolts, gaskets, and any documentation.</span></li><li><span class="ci"><i class="fa-solid fa-check"></i></span><span><strong>Valid Order ID or invoice provided</strong> — You must provide your SpareBlaze Order ID (format: SB-XXXXXXXXX) or a copy of the purchase invoice.</span></li><li><span class="ci"><i class="fa-solid fa-check"></i></span><span><strong>Photographic or video evidence for defective claims submitted within 48 hours of delivery</strong> — For items received damaged or defective, clear unboxing evidence must be sent to support@spareblaze.com within 48 hours.</span></li></ul>'
                },
                {
                    id: 'non-eligible', icon: 'fa-solid fa-ban', color: 'red', title: 'Items Exempt from Returns',
                    content: '<div class="doa-badge"><i class="fa-solid fa-triangle-exclamation"></i> These items can only be returned if dead-on-arrival (DOA) with unboxing video proof</div><ul class="no-return-list"><li><span class="xi"><i class="fa-solid fa-xmark"></i></span><span><strong>Electrical &amp; electronic components</strong> — Sensors, ECUs, ignition modules, relays, and all electronic assemblies are non-returnable unless DOA with unboxing video.</span></li><li><span class="xi"><i class="fa-solid fa-xmark"></i></span><span><strong>Fluids, oils &amp; lubricants with broken factory seal</strong> — Engine oils, brake fluids, coolants, and any liquid products with tampered or opened seals cannot be returned.</span></li><li><span class="xi"><i class="fa-solid fa-xmark"></i></span><span><strong>Final Sale / clearance items</strong> — Products purchased at clearance or final sale prices are not eligible for return or exchange unless defective.</span></li><li><span class="xi"><i class="fa-solid fa-xmark"></i></span><span><strong>Installed or used parts showing fitment marks</strong> — Any component with visible signs of installation, mounting scratches, torque marks, or fluid contact is non-returnable.</span></li><li><span class="xi"><i class="fa-solid fa-xmark"></i></span><span><strong>Custom or special-order parts sourced on request</strong> — Parts ordered specifically for your vehicle that are not part of regular inventory cannot be returned.</span></li><li><span class="xi"><i class="fa-solid fa-xmark"></i></span><span><strong>Perishable items: air filters, cabin filters, bulbs</strong> — These items are non-returnable once removed from their sealed manufacturer packaging.</span></li></ul>'
                },
                {
                    id: 'process', icon: 'fa-solid fa-arrows-rotate', color: 'orange', title: 'How to Return — Step by Step',
                    content: '<div class="steps-grid"><div class="step-card"><span class="step-number">1</span><div class="step-icon"><i class="fa-solid fa-phone-volume"></i></div><h4>Initiate</h4><p>Contact us within 30 days of delivery via email at returns@spareblaze.in or call 1800 123 4567. Have your Order ID ready.</p></div><div class="step-card"><span class="step-number">2</span><div class="step-icon"><i class="fa-solid fa-camera"></i></div><h4>Document</h4><p>Share clear photographs or an unboxing video showing the defect, incorrect part, or damaged packaging with the return request.</p></div><div class="step-card"><span class="step-number">3</span><div class="step-icon"><i class="fa-solid fa-clipboard-check"></i></div><h4>Approval</h4><p>Our returns team reviews your request in 24\u201348 business hours and sends you a Return Authorisation (RA) number via email.</p></div><div class="step-card"><span class="step-number">4</span><div class="step-icon"><i class="fa-solid fa-truck-pickup"></i></div><h4>Pickup</h4><p>We schedule a free doorstep courier pickup within 2\u20133 business days. Pack the item securely with the RA number written on the box.</p></div><div class="step-card"><span class="step-number">5</span><div class="step-icon"><i class="fa-solid fa-magnifying-glass"></i></div><h4>Inspection</h4><p>Our warehouse team inspects the returned item within 3\u20135 business days of receipt to verify it meets all return eligibility criteria.</p></div><div class="step-card"><span class="step-number">6</span><div class="step-icon"><i class="fa-solid fa-money-bill-wave"></i></div><h4>Refund</h4><p>Refund is processed within 5\u201310 business days to your original payment method once inspection approval is confirmed.</p></div></div>'
                },
                {
                    id: 'refunds', icon: 'fa-solid fa-clock-rotate-left', color: 'blue', title: 'Refund Timelines',
                    content: '<table class="timeline-table"><thead><tr><th>Payment Method</th><th>Refund Timeline</th><th>Notes</th></tr></thead><tbody><tr><td><span class="method-icon"><i class="fa-solid fa-mobile-screen-button"></i> UPI / Net Banking</span></td><td><span class="days-badge">5\u20137 Business Days</span></td><td style="font-size:0.875rem;color:#64748b;">Fastest refund route; credited directly to your registered bank account.</td></tr><tr><td><span class="method-icon"><i class="fa-solid fa-credit-card"></i> Credit / Debit Card</span></td><td><span class="days-badge">7\u201310 Business Days</span></td><td style="font-size:0.875rem;color:#64748b;">Timeline depends on your issuing bank\u2019s processing cycle.</td></tr><tr><td><span class="method-icon"><i class="fa-solid fa-wallet"></i> SpareBlaze Wallet</span></td><td><span class="days-badge">2\u20133 Business Days</span></td><td style="font-size:0.875rem;color:#64748b;">Instant credit to your SpareBlaze account wallet balance.</td></tr><tr><td><span class="method-icon"><i class="fa-solid fa-money-bills"></i> Cash on Delivery (COD)</span></td><td><span class="days-badge">7\u201314 Business Days</span></td><td style="font-size:0.875rem;color:#64748b;">Refunded via bank transfer; please provide your IFSC and account details.</td></tr></tbody></table>'
                }
            ]
        },
        shippingPage: {
            pageTitle: 'Shipping <span class="highlight">Policy</span>',
            pageDesc: 'Pan-India delivery to 25,000+ PIN codes across all 28 states and union territories. Fast dispatch, real-time tracking, and free shipping on prepaid orders above \u20b91,500.',
            statCards: [
                { icon: 'fa-solid fa-truck-fast', value: 'Free Shipping above \u20b91,500', label: 'On all prepaid orders. No hidden charges, no minimum cart restrictions on eligible PIN codes.' },
                { icon: 'fa-solid fa-map-location-dot', value: '25,000+ PIN Codes', label: 'Covering every metro, Tier-2 city, rural town, and remote region across India.' },
                { icon: 'fa-solid fa-bolt', value: 'Ships in 24 Hours', label: 'All in-stock items are picked, quality-checked, and dispatched within 24 hours (Mon\u2013Sat).' }
            ],
            sections: [
                {
                    icon: 'fa-solid fa-clock', title: 'Section 1 \u2013 Delivery Timelines',
                    content: '<p>All in-stock items are dispatched within <strong>24 hours</strong> of order confirmation, Monday through Saturday (excluding national public holidays). Delivery timelines below are counted from the dispatch date and are business-day estimates:</p><div class="delivery-table-wrap"><table class="delivery-table"><thead><tr><th>Zone</th><th>Areas Covered</th><th>Est. Delivery</th><th>Shipping Fee</th></tr></thead><tbody><tr><td class="zone-name">Metro / Tier-1</td><td>Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, Surat</td><td>2\u20134 Business Days</td><td><span class="badge-free"><i class="fa-solid fa-check"></i> Free above \u20b91,500</span></td></tr><tr><td class="zone-name">Tier-2 Cities</td><td>Jaipur, Lucknow, Chandigarh, Bhopal, Indore, Nagpur, Coimbatore, Kochi, Vizag, Vadodara</td><td>3\u20135 Business Days</td><td><span class="badge-free"><i class="fa-solid fa-check"></i> Free above \u20b91,500</span></td></tr><tr><td class="zone-name">Tier-3 / Rural</td><td>Smaller towns, semi-urban, and rural areas across all states</td><td>5\u20138 Business Days</td><td><span class="badge-free"><i class="fa-solid fa-check"></i> Free above \u20b91,500</span></td></tr><tr><td class="zone-name">Remote / Hilly</td><td>J&amp;K, Himachal Pradesh, Uttarakhand hills, North-East states, Andaman &amp; Nicobar, Lakshadweep</td><td>7\u201310 Business Days</td><td><span class="badge-flat">\u20b999 flat</span></td></tr><tr><td class="zone-name">Heavy / Freight</td><td>Engine blocks, large body panels, axle assemblies (&gt;20 kg) \u2014 nationwide</td><td>+2\u20133 Days additional</td><td><span class="badge-calc"><i class="fa-solid fa-calculator"></i> Calculated at checkout</span></td></tr></tbody></table></div><div class="note-box"><i class="fa-solid fa-circle-info"></i><p>Timelines are estimates and may extend during peak seasons (festive sales, Diwali, year-end), national strikes, or severe weather. You will receive proactive SMS/email alerts if your delivery is expected to be delayed beyond the stated window.</p></div>'
                },
                {
                    icon: 'fa-solid fa-indian-rupee-sign', title: 'Section 2 \u2013 Shipping Charges',
                    content: '<p>We keep our pricing transparent \u2014 the exact shipping fee is shown clearly at checkout before you confirm payment. Here is a complete breakdown:</p><div class="charges-list"><div class="charge-row"><div class="charge-icon"><i class="fa-solid fa-gift"></i></div><div class="charge-text"><strong>Free Shipping (Prepaid &gt; \u20b91,500)</strong><span>All prepaid orders (UPI, card, net banking) above \u20b91,500 qualify for free standard shipping to all eligible PIN codes. No coupon required.</span></div><div class="charge-amount">\u20b90</div></div><div class="charge-row"><div class="charge-icon"><i class="fa-solid fa-box"></i></div><div class="charge-text"><strong>Standard Shipping (Prepaid &lt; \u20b91,500)</strong><span>Prepaid orders below the \u20b91,500 threshold attract a flat standard shipping fee. Applicable to Metro, Tier-2, and Tier-3 zones.</span></div><div class="charge-amount">\u20b999</div></div><div class="charge-row"><div class="charge-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div><div class="charge-text"><strong>Cash on Delivery (COD) Surcharge</strong><span>COD orders carry an additional handling fee over and above any applicable standard shipping charge. COD is limited to orders under \u20b910,000 and select PIN codes.</span></div><div class="charge-amount">+\u20b949</div></div><div class="charge-row"><div class="charge-icon"><i class="fa-solid fa-gauge-high"></i></div><div class="charge-text"><strong>Express Delivery (Select Metros)</strong><span>1\u20132 business day delivery available in Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, and Pune. Shown at checkout if available for your PIN code.</span></div><div class="charge-amount">\u20b9149</div></div><div class="charge-row"><div class="charge-icon"><i class="fa-solid fa-truck-moving"></i></div><div class="charge-text"><strong>Heavy / Freight Shipping</strong><span>For parts over 20 kg or oversized dimensions (e.g., engine assemblies, radiators, full door panels). Freight is calculated based on actual/volumetric weight and delivery zone at checkout.</span></div><div class="charge-amount">At checkout</div></div></div><div class="note-box"><i class="fa-solid fa-lightbulb"></i><p>Tip: Switching from COD to a prepaid method (UPI/card) on an order above \u20b91,500 saves you both the \u20b999 shipping fee and the \u20b949 COD surcharge \u2014 a saving of \u20b9148 on a single order.</p></div>'
                },
                {
                    icon: 'fa-solid fa-route', title: 'Section 3 \u2013 Your Order\u2019s Journey',
                    content: '<p>From the moment you confirm your order to the part arriving at your doorstep, here is exactly what happens at every stage:</p><div class="shipping-timeline"><div class="timeline-step"><div class="timeline-node"><i class="fa-solid fa-circle-check"></i></div><div class="timeline-content"><h4>Order Confirmed</h4><p>Your order is recorded in our system the instant payment is verified. You receive an order confirmation email and SMS with your unique Order ID, itemised summary, and estimated delivery date.</p><span class="timeline-badge">Instant</span></div></div><div class="timeline-step"><div class="timeline-node"><i class="fa-solid fa-magnifying-glass"></i></div><div class="timeline-content"><h4>Quality Check &amp; Packing</h4><p>Our warehouse team picks your part, performs a three-point quality inspection (visual, dimensional, and OEM cross-reference), then packs it using our multi-layer protection standards. OEM parts are sealed with holographic authenticity labels.</p><span class="timeline-badge">Within 12 hours</span></div></div><div class="timeline-step"><div class="timeline-node"><i class="fa-solid fa-truck-loading"></i></div><div class="timeline-content"><h4>Dispatched</h4><p>Your packed order is handed over to our logistics partner (Delhivery, BlueDart, or DTDC depending on your location). You receive a dispatch notification email containing your AWB number and a live tracking link.</p><span class="timeline-badge">Within 24 hours</span></div></div><div class="timeline-step"><div class="timeline-node"><i class="fa-solid fa-location-dot"></i></div><div class="timeline-content"><h4>In Transit</h4><p>Your shipment is on its way. Track real-time movement via the link in your dispatch email or through our <a href="track-order.html">Track Order</a> page using your Order ID and registered email. Tracking updates every 4\u20138 hours.</p><span class="timeline-badge">As per delivery zone</span></div></div><div class="timeline-step"><div class="timeline-node"><i class="fa-solid fa-person-biking"></i></div><div class="timeline-content"><h4>Out for Delivery</h4><p>The delivery agent calls you before arriving. Ensure someone is available at the delivery address with a valid ID for high-value orders. If unavailable, the agent will attempt redelivery on the next business day (up to 3 total attempts).</p><span class="timeline-badge">Day of delivery</span></div></div><div class="timeline-step"><div class="timeline-node"><i class="fa-solid fa-box-open"></i></div><div class="timeline-content"><h4>Delivered &amp; Signed</h4><p>Inspect the outer packaging before signing \u2014 if it shows visible damage, tamper, or wetness, photograph it clearly and note the damage on the delivery receipt before accepting. Contact us within 48 hours if the part inside is damaged. Your SparkPoints are credited within 48 hours of delivery confirmation.</p><span class="timeline-badge">On delivery</span></div></div></div>'
                },
                {
                    icon: 'fa-solid fa-box-open', title: 'Section 4 \u2013 Packaging Standards',
                    content: '<p>Automotive parts are precision components \u2014 a dented brake caliper or a cracked sensor housing renders the part useless. We engineer our packaging to withstand the real-world conditions of India\u2019s logistics network, including rough handling, long-haul freight, and monsoon weather:</p><div class="pack-grid"><div class="pack-card"><div class="pack-icon"><i class="fa-solid fa-layer-group"></i></div><h4>Multi-Layer Protection</h4><p>Bubble wrap inner lining, high-density foam inserts, and double-wall corrugated cartons for all delicate or metal components.</p></div><div class="pack-card"><div class="pack-icon"><i class="fa-solid fa-shield-halved"></i></div><h4>Tamper-Evident Seal</h4><p>Every package is sealed with a SpareBlaze branded tamper-evident security tape that shows visible damage if the carton is opened in transit.</p></div><div class="pack-card"><div class="pack-icon"><i class="fa-solid fa-tag"></i></div><h4>Authenticity Labels</h4><p>OEM and certified after-market parts carry holographic authenticity stickers that can be verified against our central registry.</p></div><div class="pack-card"><div class="pack-icon"><i class="fa-solid fa-file-invoice"></i></div><h4>Invoice Enclosed</h4><p>Every shipment includes a printed GST-compliant tax invoice \u2014 essential for warranty claims, returns, and input tax credit purposes.</p></div></div>'
                }
            ],
            faqItems: [
                { question: 'Can I change the delivery address after placing my order?', answer: 'Address changes are possible only <strong>before the order is dispatched</strong>. Contact us immediately via email or phone with your Order ID and the corrected address. Once the AWB is generated and the order is handed over to our courier partner, address changes are not possible in transit.' },
                { question: 'What if I am not home when the delivery agent arrives?', answer: 'The delivery agent will make <strong>up to 3 attempts</strong> on consecutive business days, calling you before each attempt. If all three attempts fail, the package is returned to our warehouse (marked RTO \u2014 Return to Origin). A refund for the item value (minus the COD handling fee for COD orders) is processed within 7\u201310 business days of the package reaching us.' },
                { question: 'Do you ship to APO/FPO military addresses or outside India?', answer: 'SpareBlaze currently ships <strong>exclusively within India</strong> and does not support APO, FPO, or international shipping addresses. We cover all 28 states, 8 union territories, and over 25,000 PIN codes domestically.' },
                { question: 'How are heavy or oversized parts like engine assemblies shipped?', answer: 'Heavy parts (over 20 kg) and oversized components such as engine assemblies, gearboxes, full door panels, and large body panels are shipped via <strong>surface freight</strong> using specialised automotive logistics partners. These shipments are palletised or crated depending on the item\u2019s fragility. Freight charges are calculated at checkout based on the actual or volumetric weight (whichever is higher) and your delivery zone.' }
            ]
        },
        sizeGuidePage: {
            pageTitle: 'Size &amp; Fitment <span class="highlight">Guide</span>',
            pageDesc: 'Reference charts and decoding guides to order the exact right part — first time, every time.',
            sections: [
                {
                    id: 'tyres', icon: 'fa-solid fa-circle-dot', title: 'Tyres',
                    content: '<div class="info-banner"><i class="fa-solid fa-circle-info"></i><p><strong>How to read your tyre size:</strong> The tyre size is stamped directly on the sidewall (e.g. <strong>205/55R16</strong>). You must match all three numbers \u2014 width, aspect ratio, and rim diameter \u2014 to ensure a safe and legal fitment.</p></div><div class="tyre-decoder"><div class="tyre-code"><span class="tc-w">205</span><span class="tc-sep">/</span><span class="tc-a">55</span><span class="tc-r">R</span><span class="tc-d">16</span></div><div class="tyre-legend"><div class="tyre-legend-item w"><div class="tl-val">205</div><div class="tl-label">Width (mm)</div><div class="tl-desc">Section width in millimetres</div></div><div class="tyre-legend-item a"><div class="tl-val">55</div><div class="tl-label">Aspect Ratio (%)</div><div class="tl-desc">Sidewall height as % of width</div></div><div class="tyre-legend-item d"><div class="tl-val">16</div><div class="tl-label">Rim Diameter (in)</div><div class="tl-desc">Wheel diameter in inches</div></div></div></div><div class="sg-table-wrap"><table class="sg-table"><thead><tr><th>Vehicle</th><th>Standard Tyre</th><th>Optional Upgrade</th><th>Rim Size</th></tr></thead><tbody><tr><td data-label="Vehicle"><strong>Maruti Swift</strong></td><td data-label="Standard">175/65R14</td><td data-label="Upgrade"><span class="badge badge-green">185/65R15</span></td><td data-label="Rim">14\u201315 inch</td></tr><tr><td data-label="Vehicle"><strong>Maruti Baleno</strong></td><td data-label="Standard">185/65R15</td><td data-label="Upgrade"><span class="badge badge-green">195/55R16</span></td><td data-label="Rim">15\u201316 inch</td></tr><tr><td data-label="Vehicle"><strong>Hyundai Creta</strong></td><td data-label="Standard">215/65R16</td><td data-label="Upgrade"><span class="badge badge-green">215/60R17</span></td><td data-label="Rim">16\u201317 inch</td></tr><tr><td data-label="Vehicle"><strong>Tata Nexon</strong></td><td data-label="Standard">215/60R16</td><td data-label="Upgrade"><span class="badge badge-green">215/55R17</span></td><td data-label="Rim">16\u201317 inch</td></tr><tr><td data-label="Vehicle"><strong>Mahindra XUV700</strong></td><td data-label="Standard">235/65R17</td><td data-label="Upgrade"><span class="badge badge-green">235/55R18</span></td><td data-label="Rim">17\u201318 inch</td></tr></tbody></table></div>'
                },
                {
                    id: 'brakes', icon: 'fa-solid fa-circle-stop', title: 'Brake Pads',
                    content: '<div class="info-banner"><i class="fa-solid fa-circle-info"></i><p><strong>How to find brake pad size:</strong> The OEM part number is printed on the existing brake pad backing plate or documented in your vehicle service manual. Alternatively, measure the pad length, width, and thickness with a calliper.</p></div><div class="sg-table-wrap"><table class="sg-table"><thead><tr><th>Vehicle</th><th>Front Pad Size</th><th>Rear Pad Size</th><th>OEM Ref.</th></tr></thead><tbody><tr><td data-label="Vehicle"><strong>Maruti Swift</strong></td><td data-label="Front">131.6 \u00d7 49.3 \u00d7 15.5 mm</td><td data-label="Rear">95.8 \u00d7 40.2 \u00d7 10.5 mm</td><td data-label="OEM">D2104 / D2187</td></tr><tr><td data-label="Vehicle"><strong>Hyundai Creta</strong></td><td data-label="Front">142.0 \u00d7 55.2 \u00d7 16.0 mm</td><td data-label="Rear">110.2 \u00d7 42.0 \u00d7 13.5 mm</td><td data-label="OEM">D1397 / D1544</td></tr><tr><td data-label="Vehicle"><strong>Tata Nexon</strong></td><td data-label="Front">137.5 \u00d7 52.7 \u00d7 15.8 mm</td><td data-label="Rear">Drum brakes (shoes)</td><td data-label="OEM">D2215 / S1125</td></tr></tbody></table></div>'
                },
                {
                    id: 'oilfilters', icon: 'fa-solid fa-filter', title: 'Oil Filters',
                    content: '<div class="info-banner"><i class="fa-solid fa-circle-info"></i><p><strong>Finding the right oil filter:</strong> Match by OEM part number from your service manual, or measure the thread diameter (M20, M22, etc.) and outer diameter of your current filter.</p></div><div class="sg-table-wrap"><table class="sg-table"><thead><tr><th>Vehicle / Engine</th><th>Thread</th><th>OD \u00d7 H</th><th>OEM Part No.</th></tr></thead><tbody><tr><td data-label="Vehicle"><strong>Maruti Swift (K12B)</strong></td><td data-label="Thread">M20 \u00d7 1.5</td><td data-label="Size">68 \u00d7 65 mm</td><td data-label="OEM">16510-61A31</td></tr><tr><td data-label="Vehicle"><strong>Hyundai Creta (1.5 MPi)</strong></td><td data-label="Thread">M20 \u00d7 1.5</td><td data-label="Size">76 \u00d7 80 mm</td><td data-label="OEM">26300-35530</td></tr><tr><td data-label="Vehicle"><strong>Tata Nexon (Revotorq)</strong></td><td data-label="Thread">M22 \u00d7 1.5</td><td data-label="Size">76 \u00d7 100 mm</td><td data-label="OEM">278607699906</td></tr></tbody></table></div>'
                },
                {
                    id: 'wipers', icon: 'fa-solid fa-wind', title: 'Wiper Blades',
                    content: '<div class="info-banner"><i class="fa-solid fa-circle-info"></i><p><strong>Measuring wiper blades:</strong> Measure the length of each wiper blade from end to end and note the connector type (hook, pin, or bayonet). Driver and passenger sides often have different lengths.</p></div><div class="sg-table-wrap"><table class="sg-table"><thead><tr><th>Vehicle</th><th>Driver Side</th><th>Passenger Side</th><th>Rear</th></tr></thead><tbody><tr><td data-label="Vehicle"><strong>Maruti Swift</strong></td><td data-label="Driver">22\u2033 (550 mm)</td><td data-label="Passenger">16\u2033 (400 mm)</td><td data-label="Rear">12\u2033 (300 mm)</td></tr><tr><td data-label="Vehicle"><strong>Hyundai Creta</strong></td><td data-label="Driver">26\u2033 (650 mm)</td><td data-label="Passenger">16\u2033 (400 mm)</td><td data-label="Rear">10\u2033 (250 mm)</td></tr><tr><td data-label="Vehicle"><strong>Tata Nexon</strong></td><td data-label="Driver">24\u2033 (600 mm)</td><td data-label="Passenger">16\u2033 (400 mm)</td><td data-label="Rear">12\u2033 (300 mm)</td></tr></tbody></table></div>'
                },
                {
                    id: 'belts', icon: 'fa-solid fa-rotate', title: 'Drive Belts',
                    content: '<div class="info-banner"><i class="fa-solid fa-circle-info"></i><p><strong>Belt identification:</strong> Drive belts are specified by length, width, and number of ribs. Check the markings printed on your existing belt (e.g. 6PK1050 = 6 ribs, 1050 mm effective length).</p></div><div class="sg-table-wrap"><table class="sg-table"><thead><tr><th>Vehicle / Engine</th><th>Belt Code</th><th>Ribs</th><th>Length</th></tr></thead><tbody><tr><td data-label="Vehicle"><strong>Maruti Swift (K12B)</strong></td><td data-label="Code">4PK875</td><td data-label="Ribs">4</td><td data-label="Length">875 mm</td></tr><tr><td data-label="Vehicle"><strong>Hyundai Creta (1.5L)</strong></td><td data-label="Code">6PK1050</td><td data-label="Ribs">6</td><td data-label="Length">1050 mm</td></tr><tr><td data-label="Vehicle"><strong>Tata Nexon (Revotorq)</strong></td><td data-label="Code">5PK1135</td><td data-label="Ribs">5</td><td data-label="Length">1135 mm</td></tr></tbody></table></div>'
                },
                {
                    id: 'measure', icon: 'fa-solid fa-ruler-combined', title: 'How to Measure',
                    content: '<p>If you cannot find an OEM part number or your vehicle is not listed above, measure the part yourself using these guidelines:</p><div class="measure-steps"><div class="measure-step"><span class="measure-num">1</span><div><h5>Remove the old part safely</h5><p>Ensure the vehicle is off and cooled down. Use the correct tools to remove the old component without damaging mounting points.</p></div></div><div class="measure-step"><span class="measure-num">2</span><div><h5>Clean and inspect</h5><p>Clean off grease, rust, or debris so you can see markings and measure accurately.</p></div></div><div class="measure-step"><span class="measure-num">3</span><div><h5>Measure key dimensions</h5><p>Use a digital calliper or a tape measure. Note length, width, thickness, thread pitch, and number of mounting holes as applicable.</p></div></div><div class="measure-step"><span class="measure-num">4</span><div><h5>Note OEM markings</h5><p>Photograph any part numbers, brand stamps, or QR codes on the old part. These help us cross-reference to the correct replacement.</p></div></div><div class="measure-step"><span class="measure-num">5</span><div><h5>Contact our experts</h5><p>Share the measurements and photos with our team via WhatsApp (+91 72599 55674) or email. We will identify the exact part for you.</p></div></div></div><div class="expert-cta"><div class="expert-cta-content"><h3>Still unsure about the right size?</h3><p>Our fitment experts will identify the correct part for your vehicle \u2014 free of charge.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="https://wa.me/917259955674" target="_blank" class="btn btn-primary"><i class="fa-brands fa-whatsapp"></i>&nbsp; WhatsApp an Expert</a><a href="contact-us.html" class="btn btn-secondary"><i class="fa-solid fa-headset"></i>&nbsp; Contact Support</a></div></div></div>'
                }
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
                { icon: 'fa-solid fa-envelope-open-text', color: 'orange', title: 'Dispatch Email', desc: 'When your order ships, we immediately send you an email containing the courier AWB number and a direct tracking link so you can follow your shipment in real time.' },
                { icon: 'fa-solid fa-mobile-screen-button', color: 'blue', title: 'SMS Alerts', desc: 'Receive automatic SMS updates at every key milestone \u2014 when your order is dispatched, arrives at a transit hub, goes out for delivery, and when it is delivered.' },
                { icon: 'fa-solid fa-headset', color: 'green', title: 'Need Help?', desc: 'If your tracking isn\u2019t updating or your order seems delayed, our support team is here. Call +91 7259955674 or email support@spareblaze.com.' }
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
        if (d.footer && d.footer.whatsapp === undefined) d.footer.whatsapp = DEFAULT_DATA.footer.whatsapp;
        // Migrate old placeholder phone number to real number
        if (d.footer && d.footer.phone === '+91 1800 123 4567') {
            d.footer.phone = '+91 7259955674';
            d.footer.phone2 = '+91 8050819131';
            localStorage.setItem(KEY, JSON.stringify(d));
        }
        // Migrate old email domain
        if (d.footer && d.footer.email === 'support@spareblaze.in') {
            d.footer.email = 'support@spareblaze.com';
            localStorage.setItem(KEY, JSON.stringify(d));
        }
        if (!d.ctaBanner) d.ctaBanner = DEFAULT_DATA.ctaBanner;
        if (!d.theme) d.theme = DEFAULT_DATA.theme;
        if (!d.slides || !d.slides.length) d.slides = DEFAULT_DATA.slides;
        if (!d.featuredProducts || !d.featuredProducts.length) d.featuredProducts = DEFAULT_DATA.featuredProducts;
        if (!d.testimonials || !d.testimonials.length) d.testimonials = DEFAULT_DATA.testimonials;
        if (!d.contactPage) d.contactPage = DEFAULT_DATA.contactPage;
        if (!d.faqPage) d.faqPage = DEFAULT_DATA.faqPage;
        if (!d.returnPolicyPage) d.returnPolicyPage = DEFAULT_DATA.returnPolicyPage;
        if (!d.shippingPage) d.shippingPage = DEFAULT_DATA.shippingPage;
        if (!d.sizeGuidePage) d.sizeGuidePage = DEFAULT_DATA.sizeGuidePage;
        if (!d.trackOrderPage) d.trackOrderPage = DEFAULT_DATA.trackOrderPage;
        if (!d.brandLogos) d.brandLogos = DEFAULT_DATA.brandLogos;

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

        // Remove stale default `categories` that came from old admin DEFAULT_DATA.
        // Those entries had placeholder paths like 'after-market-parts/brake-pad.jpg' that
        // remapImagePath() cannot resolve, causing applyCategoryPage() to wipe the static
        // product grid with broken images (flash-then-disappear on page refresh).
        const STALE_PLACEHOLDER_IMGS = [
            'after-market-parts/brake-pad.jpg',
            'after-market-parts/tie-rod.jpg',
            'after-market-parts/clutch.jpg',
            'after-market-parts/headlamp.jpg',
            'after-market-parts/shock-absorber.jpg',
            'after-market-parts/spark-plug.jpg'
        ];
        if (d.categories && d.categories.some(function (c) {
            return c.products && c.products.some(function (p) { return STALE_PLACEHOLDER_IMGS.indexOf(p.img) !== -1; });
        })) {
            // Clear only the placeholder img values; preserve any category meta the admin set
            d.categories = d.categories.map(function (c) {
                if (!c.products) return c;
                return Object.assign({}, c, {
                    products: c.products.map(function (p) {
                        return STALE_PLACEHOLDER_IMGS.indexOf(p.img) !== -1 ? Object.assign({}, p, { img: '' }) : p;
                    })
                });
            });
            localStorage.setItem(KEY, JSON.stringify(d));
        }

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
        const newContent = `
            :root {
                --color-primary: ${theme.primary} !important;
                --primary: ${theme.primary} !important;
                --primary-soft: ${theme.primarySoft} !important;
                --font-family-base: ${theme.fontFamily} !important;
            }
            body { font-family: var(--font-family-base) !important; }
        `;
        // Skip DOM write (and the full-page text reflow it triggers) when the
        // injected styles haven't actually changed. This prevents a visible
        // "shiver" on mobile product pages caused by the browser remeasuring
        // all text whenever a new <style> block is written to <head>.
        if (style && style.textContent === newContent) return;
        if (!style) {
            style = document.createElement('style');
            style.id = 'sb-theme-styles';
            document.head.appendChild(style);
        }
        style.textContent = newContent;
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
        // Phone numbers — support one or two
        const phoneNums = [f.phone, f.phone2].filter(Boolean);
        const phoneParagraphs = [...document.querySelectorAll('.footer-contact p')].filter(p => p.querySelector('.fa-phone'));
        phoneNums.forEach((num, i) => {
            if (phoneParagraphs[i]) {
                phoneParagraphs[i].innerHTML = `<i class="fa-solid fa-phone"></i> ${num}`;
            } else if (i > 0 && phoneParagraphs[0]) {
                // Page only has one phone <p> — insert the second one right after
                const newP = document.createElement('p');
                newP.innerHTML = `<i class="fa-solid fa-phone"></i> ${num}`;
                phoneParagraphs[0].after(newP);
            }
        });
        // Email & address
        document.querySelectorAll('.footer-contact p').forEach(p => {
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

    // ── 9. WhatsApp Float Button ──
    function applyWhatsApp() {
        const num = (d.footer && d.footer.whatsapp) || '';
        if (!num) return;
        // Strip everything except digits (wa.me requires digits only)
        const digits = num.replace(/\D/g, '');
        if (!digits) return;
        const btn = document.getElementById('wa-float-btn');
        if (btn) btn.href = 'https://wa.me/' + digits;
    }

    // ── 10. Featured Products ──
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

    // ── 11. Testimonials ──
    function applyTestimonials() {
        const t = d.testimonials; if (!t || !t.length) return;
        const track = document.getElementById('testimonials-track');
        if (!track) return;
        track.innerHTML = t.map(item => `
                <div class="testimonial-card">
                    <p class="testimonial-text">&ldquo;${esc(item.review)}&rdquo;</p>
                    <div class="testimonial-author">&mdash; ${esc(item.name)}</div>
                </div>`
        ).join('');
    }

    // ── 10. Category Page (Dynamic Rendering) ──
    function applyCategoryPage() {
        const cats = d.categories || [];
        const pageFile = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '');

        // Only render dynamically when admin has explicitly configured real products for this page.
        // Without this guard, the function would wipe the static HTML product grid (which already
        // has images loading) and replace it with new lazy-loaded <img> elements — causing images
        // to flash briefly then disappear on every page refresh.
        const catData = cats.find(c => c.id === pageFile);

        if (!catData) return;

        // Always apply hero text from category data when available
        const heroH1 = document.querySelector('.page-hero h1');
        if (heroH1 && (catData.title || catData.headline)) heroH1.innerHTML = catData.title || catData.headline || '';
        const heroP = document.querySelector('.page-hero p');
        if (heroP && catData.desc) heroP.textContent = catData.desc || '';

        if (!catData.products || !catData.products.length) return;

        // Skip product grid replacement if no product has a valid image that remapImagePath() can resolve.
        // Stale DEFAULT_DATA placeholder paths (e.g. 'after-market-parts/brake-pad.jpg') won't
        // be remapped and would produce broken images — keep the static HTML instead.
        const hasValidImage = catData.products.some(function (p) {
            if (!p.img || !p.img.trim()) return false;
            var remapped = remapImagePath(p.img);
            // remapImagePath rewrites known prefixes; if the result still starts with the same
            // legacy prefix the path was not resolved — treat as invalid placeholder.
            return remapped !== p.img || p.img.indexOf('../public/') === 0;
        });
        if (!hasValidImage) return;

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

    // ── 12. FAQ Page ──
    function applyFaqPage() {
        if (!window.location.pathname.includes('faq')) return;
        const faq = d.faqPage; if (!faq) return;

        // Page header
        const h1 = document.querySelector('.page-header h1');
        if (h1) h1.innerHTML = faq.pageTitle;
        const desc = document.querySelector('.page-header p');
        if (desc) desc.textContent = faq.pageDesc;

        // Quick links
        const ql = document.querySelector('.faq-quicklinks');
        if (ql) {
            ql.innerHTML = faq.categories.map(c =>
                '<a href="#' + c.id + '"><i class="' + c.icon + '"></i> ' + esc(c.title) + '</a>'
            ).join('');
        }

        // FAQ categories
        const wrapper = document.querySelector('.faq-wrapper');
        if (!wrapper) return;

        // Remove existing category sections and CTA
        wrapper.querySelectorAll('.faq-category, .faq-cta').forEach(el => el.remove());

        // Build categories
        faq.categories.forEach(cat => {
            const section = document.createElement('section');
            section.className = 'faq-category';
            section.id = cat.id;
            section.innerHTML = '<div class="faq-category-header"><div class="faq-cat-icon"><i class="' + cat.icon + '"></i></div><h2>' + esc(cat.title) + '</h2></div>' +
                cat.items.map(item =>
                    '<div class="faq-item"><button class="faq-question" aria-expanded="false">' +
                    esc(item.question) +
                    '<span class="faq-icon"><i class="fa-solid fa-plus"></i></span></button>' +
                    '<div class="faq-answer" role="region"><div class="faq-answer-inner">' +
                    item.answer +
                    '</div></div></div>'
                ).join('');
            wrapper.appendChild(section);
        });

        // Build CTA
        const cta = document.createElement('div');
        cta.className = 'faq-cta';
        cta.innerHTML = '<div class="cta-icon"><i class="fa-solid fa-headset"></i></div>' +
            '<h3>' + esc(faq.ctaTitle) + '</h3>' +
            '<p>' + esc(faq.ctaDesc) + '</p>' +
            '<div class="faq-cta-buttons">' +
            faq.ctaButtons.map(btn =>
                '<a href="' + esc(btn.href) + '"' + (btn.href.startsWith('http') ? ' target="_blank" rel="noopener"' : '') +
                ' class="btn ' + (btn.icon.includes('whatsapp') ? 'btn-secondary' : 'btn-primary') + '">' +
                '<i class="' + btn.icon + '"></i>&nbsp; ' + esc(btn.text) + '</a>'
            ).join('') +
            '</div>';
        wrapper.appendChild(cta);

        // Re-bind accordion behavior
        wrapper.querySelectorAll('.faq-item').forEach(function(item) {
            var btn = item.querySelector('.faq-question');
            btn.addEventListener('click', function() {
                var isOpen = item.classList.contains('open');
                wrapper.querySelectorAll('.faq-item').forEach(function(el) {
                    el.classList.remove('open');
                    el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Re-bind quick-links smooth scroll
        wrapper.parentElement.querySelectorAll('.faq-quicklinks a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ── 13. Contact Us Page ──
    function applyContactPage() {
        if (!window.location.pathname.includes('contact')) return;
        const cp = d.contactPage; if (!cp) return;

        // Page header
        const h1 = document.querySelector('.page-header h1');
        if (h1) h1.innerHTML = cp.pageTitle;
        const desc = document.querySelector('.page-header p');
        if (desc) desc.textContent = cp.pageDesc;

        // Channels grid
        const grid = document.querySelector('.channels-grid');
        if (grid && cp.channels) {
            grid.innerHTML = cp.channels.map(function (ch) {
                var isLiveChat = !ch.btnHref;
                var btnTag = isLiveChat
                    ? '<button class="btn btn-primary" style="width:100%;" onclick="if(window.tidioChatApi){window.tidioChatApi.open();}else{alert(\'Live chat is loading. Please try again in a moment.\');}"><i class="' + esc(ch.icon) + '"></i>&nbsp; ' + esc(ch.btnText) + '</button>'
                    : '<a href="' + esc(ch.btnHref) + '"' + (ch.btnHref.startsWith('http') ? ' target="_blank"' : '') + ' class="btn btn-primary" style="width:100%;"><i class="' + esc(ch.icon) + '"></i>&nbsp; ' + esc(ch.btnText) + '</a>';
                return '<div class="channel-card">' +
                    '<div class="channel-icon ' + esc(ch.color) + '"><i class="' + esc(ch.icon) + '"></i></div>' +
                    '<h3>' + esc(ch.title) + '</h3>' +
                    '<p class="channel-value">' + esc(ch.value) + '</p>' +
                    '<p class="channel-hours">' + esc(ch.hours).replace(/\n/g, '<br>') + '</p>' +
                    btnTag +
                    '</div>';
            }).join('');
        }

        // Info panel
        var ip = cp.infoPanel;
        if (ip) {
            var panel = document.querySelector('.info-panel-content');
            if (panel) {
                var emailsHtml = (ip.emails || []).map(function (e, i) {
                    return '<a href="mailto:' + esc(e) + '"' + (i > 0 ? ' style="display:block;margin-top:3px;"' : '') + '>' + esc(e) + '</a>';
                }).join('');
                var hoursHtml = (ip.hours || []).map(function (h) {
                    return '<tr><td>' + esc(h.day) + '</td><td>' + esc(h.time) + '</td></tr>';
                }).join('');
                panel.innerHTML =
                    '<h2>' + esc(ip.title) + '</h2>' +
                    '<div class="info-item"><div class="info-icon-circle"><i class="fa-solid fa-phone"></i></div><div class="info-item-body"><h4>Phone &amp; WhatsApp</h4><p>' + esc(ip.phone) + '</p><p>' + esc(ip.whatsapp) + '</p></div></div>' +
                    '<div class="info-divider"></div>' +
                    '<div class="info-item"><div class="info-icon-circle"><i class="fa-solid fa-envelope"></i></div><div class="info-item-body"><h4>Email Addresses</h4>' + emailsHtml + '</div></div>' +
                    '<div class="info-divider"></div>' +
                    '<div class="info-item"><div class="info-icon-circle"><i class="fa-solid fa-clock"></i></div><div class="info-item-body"><h4>Support Hours</h4><table class="hours-table">' + hoursHtml + '</table></div></div>' +
                    '<div class="info-divider"></div>' +
                    '<div class="info-item"><div class="info-icon-circle"><i class="fa-solid fa-location-dot"></i></div><div class="info-item-body"><h4>Office Address</h4><p>' + esc(ip.address).replace(/\n/g, '<br>') + '</p></div></div>';
            }
        }

        // Form labels
        var fl = cp.formLabels;
        if (fl) {
            var formCard = document.querySelector('.contact-form-card');
            if (formCard) {
                var h2 = formCard.querySelector('h2');
                if (h2) h2.innerHTML = '<i class="fa-solid fa-paper-plane" style="color:#e63900;margin-right:8px;"></i>' + esc(fl.heading);
            }
            var nameLabel = document.querySelector('label[for="cf-name"]');
            if (nameLabel) nameLabel.innerHTML = esc(fl.nameLabel) + ' <span class="req">*</span>';
            var emailLabel = document.querySelector('label[for="cf-email"]');
            if (emailLabel) emailLabel.innerHTML = esc(fl.emailLabel) + ' <span class="req">*</span>';
            var phoneLabel = document.querySelector('label[for="cf-mobile"]');
            if (phoneLabel) phoneLabel.textContent = fl.phoneLabel;
            var subjectLabel = document.querySelector('label[for="cf-topic"]');
            if (subjectLabel) subjectLabel.textContent = fl.subjectLabel;
            var msgLabel = document.querySelector('label[for="cf-message"]');
            if (msgLabel) msgLabel.innerHTML = esc(fl.messageLabel) + ' <span class="req">*</span>';
            var submitBtn = document.querySelector('#contact-form button[type="submit"]');
            if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>&nbsp; ' + esc(fl.submitBtn);
            var successEl = document.getElementById('form-success-msg');
            if (successEl) successEl.setAttribute('data-cms-msg', fl.successMsg);
        }

        // Quick links
        var qlGrid = document.querySelector('.quick-help-grid');
        if (qlGrid && cp.quickLinks) {
            qlGrid.innerHTML = cp.quickLinks.map(function (ql) {
                var isWhatsApp = ql.icon.includes('whatsapp');
                var iconStyle = isWhatsApp ? ' style="background:#dcfce7;color:#16a34a;"' : '';
                return '<a href="' + esc(ql.href) + '"' + (ql.href.startsWith('http') ? ' target="_blank"' : '') + ' class="quick-link-card">' +
                    '<div class="ql-icon"' + iconStyle + '><i class="' + esc(ql.icon) + '"></i></div>' +
                    '<div class="ql-text"><h4>' + esc(ql.title) + '</h4><p>' + esc(ql.desc) + '</p></div></a>';
            }).join('');
        }
    }

    // ── 14. Return Policy Page ──
    function applyReturnPolicy() {
        if (!window.location.pathname.includes('return-policy')) return;
        var rp = d.returnPolicyPage; if (!rp) return;

        // Page header
        var h1 = document.querySelector('.page-header-content h1') || document.querySelector('.page-header h1');
        if (h1) h1.innerHTML = rp.pageTitle;
        var desc = document.querySelector('.page-header-content p') || document.querySelector('.page-header p');
        if (desc) desc.textContent = rp.pageDesc;

        // Promise grid
        var grid = document.querySelector('.promise-grid');
        if (grid && rp.promiseCards) {
            grid.innerHTML = rp.promiseCards.map(function (c) {
                return '<div class="promise-card"><div class="promise-icon"><i class="' + esc(c.icon) + '"></i></div><h3>' + esc(c.title) + '</h3><p>' + esc(c.desc) + '</p></div>';
            }).join('');
        }

        // Policy sections
        var container = document.querySelector('.rp-container');
        if (container && rp.sections) {
            // Remove existing policy-card sections (keep promise-grid section and cta-card)
            container.querySelectorAll('.policy-card').forEach(function (el) { el.remove(); });
            var cta = container.querySelector('.cta-card');
            rp.sections.forEach(function (s) {
                var section = document.createElement('section');
                section.className = 'policy-card';
                section.innerHTML = '<div class="card-header ' + esc(s.color) + '"><div class="card-header-icon ' + esc(s.color) + '"><i class="' + esc(s.icon) + '"></i></div><h2>' + esc(s.title) + '</h2></div><div class="card-body">' + s.content + '</div>';
                if (cta) container.insertBefore(section, cta);
                else container.appendChild(section);
            });
        }
    }

    // ── 15. Shipping Info Page ──
    function applyShippingPage() {
        if (!window.location.pathname.includes('shipping-info')) return;
        var sp = d.shippingPage; if (!sp) return;

        // Page header
        var h1 = document.querySelector('.page-header h1');
        if (h1) h1.innerHTML = sp.pageTitle;
        var desc = document.querySelector('.page-header p');
        if (desc) desc.textContent = sp.pageDesc;

        // Stat cards
        var statsGrid = document.querySelector('.shipping-hero-stats');
        if (statsGrid && sp.statCards) {
            statsGrid.innerHTML = sp.statCards.map(function (c) {
                return '<div class="hero-stat-card"><div class="stat-icon"><i class="' + esc(c.icon) + '"></i></div><div class="stat-value">' + esc(c.value) + '</div><div class="stat-label">' + esc(c.label) + '</div></div>';
            }).join('');
        }

        // Content sections
        var contentSection = document.querySelector('.content-section');
        if (contentSection && sp.sections) {
            contentSection.querySelectorAll('.policy-card').forEach(function (el) { el.remove(); });
            var cta = contentSection.querySelector('.shipping-cta');
            sp.sections.forEach(function (s) {
                var card = document.createElement('div');
                card.className = 'policy-card';
                card.innerHTML = '<div class="policy-card-header"><div class="icon"><i class="' + esc(s.icon) + '"></i></div><h2>' + esc(s.title) + '</h2></div>' + s.content;
                if (cta) contentSection.insertBefore(card, cta);
                else contentSection.appendChild(card);
            });

            // Rebuild FAQ section
            if (sp.faqItems && sp.faqItems.length) {
                var faqCard = document.createElement('div');
                faqCard.className = 'policy-card';
                faqCard.innerHTML = '<div class="policy-card-header"><div class="icon"><i class="fa-solid fa-circle-question"></i></div><h2>Frequently Asked Shipping Questions</h2></div><div class="inline-faq">' +
                    sp.faqItems.map(function (item) {
                        return '<div class="inline-faq-item"><div class="ifaq-q"><i class="fa-solid fa-circle-dot"></i> ' + esc(item.question) + '</div><div class="ifaq-a">' + item.answer + '</div></div>';
                    }).join('') + '</div>';
                if (cta) contentSection.insertBefore(faqCard, cta);
                else contentSection.appendChild(faqCard);
            }
        }
    }

    // ── 16. Size Guide Page ──
    function applySizeGuide() {
        if (!window.location.pathname.includes('size-guide')) return;
        var sg = d.sizeGuidePage; if (!sg) return;

        // Page header
        var h1 = document.querySelector('.page-header-content h1') || document.querySelector('.page-header h1');
        if (h1) h1.innerHTML = sg.pageTitle;
        var desc = document.querySelector('.page-header-content p') || document.querySelector('.page-header p');
        if (desc) desc.textContent = sg.pageDesc;

        // Tab nav
        var tabNav = document.querySelector('.tab-nav');
        if (tabNav && sg.sections) {
            tabNav.innerHTML = sg.sections.map(function (s, i) {
                return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + esc(s.id) + '" role="tab"><i class="' + esc(s.icon) + '"></i> ' + esc(s.title) + '</button>';
            }).join('');
        }

        // Tab content panels
        var wrapper = document.querySelector('.tabs-wrapper');
        if (wrapper && sg.sections) {
            wrapper.querySelectorAll('.tab-content').forEach(function (el) { el.remove(); });
            sg.sections.forEach(function (s, i) {
                var panel = document.createElement('div');
                panel.className = 'tab-content' + (i === 0 ? ' active' : '');
                panel.id = 'tab-' + s.id;
                panel.innerHTML = s.content;
                wrapper.appendChild(panel);
            });

            // Re-bind tab switching
            wrapper.querySelectorAll('.tab-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    wrapper.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
                    wrapper.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
                    btn.classList.add('active');
                    var target = wrapper.querySelector('#tab-' + btn.getAttribute('data-tab'));
                    if (target) target.classList.add('active');
                });
            });
        }
    }

    // ── 17. Track Order Page ──
    function applyTrackOrder() {
        if (!window.location.pathname.includes('track-order')) return;
        var to = d.trackOrderPage; if (!to) return;

        // Page header
        var h1 = document.querySelector('.page-header-content h1') || document.querySelector('.page-header h1');
        if (h1) h1.innerHTML = to.pageTitle;
        var desc = document.querySelector('.page-header-content p') || document.querySelector('.page-header p');
        if (desc) desc.textContent = to.pageDesc;

        // Form labels
        var fl = to.formLabels;
        if (fl) {
            var card = document.querySelector('.tracking-card');
            if (card) {
                var h2 = card.querySelector('h2');
                if (h2) h2.innerHTML = '<i class="fa-solid fa-map-location-dot" style="color:#e63900;margin-right:8px;"></i>' + esc(fl.heading);
                var sub = card.querySelector('.card-sub');
                if (sub) sub.textContent = fl.subtext;
            }
            var orderIdLabel = document.querySelector('label[for="order-id-input"]');
            if (orderIdLabel) orderIdLabel.innerHTML = esc(fl.orderIdLabel) + ' <span style="color:#e63900;">*</span>';
            var emailLabel = document.querySelector('label[for="order-email-input"]');
            if (emailLabel) emailLabel.innerHTML = esc(fl.emailLabel) + ' <span style="color:#e63900;">*</span>';
            var submitBtn = document.getElementById('track-btn');
            if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>&nbsp; ' + esc(fl.submitBtn);
        }

        // Info cards
        var infoGrid = document.querySelector('.info-cards-grid');
        if (infoGrid && to.infoCards) {
            infoGrid.innerHTML = to.infoCards.map(function (c) {
                return '<div class="info-card"><div class="info-card-icon ' + esc(c.color) + '"><i class="' + esc(c.icon) + '"></i></div><h3>' + esc(c.title) + '</h3><p>' + esc(c.desc) + '</p></div>';
            }).join('');
        }
    }

    // ── 18. Brand Logos Carousel ──
    function applyBrandLogos() {
        var logos = d.brandLogos; if (!logos || !logos.length) return;
        var track = document.querySelector('.carousel-track');
        if (!track) return;
        // Build two sets (original + duplicate) for infinite scroll
        var items = logos.map(function (b) {
            return '<a href="' + esc(b.href || '#') + '" class="carousel-item"><img src="' + esc(b.img) + '" alt="' + esc(b.name) + '"></a>';
        }).join('');
        track.innerHTML = items + items;
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
        applyWhatsApp();
        applyFeaturedProducts();
        applyTestimonials();
        applyCategoryPage();
        applyFaqPage();
        applyContactPage();
        applyReturnPolicy();
        applyShippingPage();
        applySizeGuide();
        applyTrackOrder();
        applyBrandLogos();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyAll);
    else applyAll();
})();

