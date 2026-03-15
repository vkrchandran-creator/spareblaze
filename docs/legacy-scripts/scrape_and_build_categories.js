const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const categories = ['refurbished', 'used', 'oem', 'wholesale'];
const templatePath = path.join(__dirname, 'product.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');
templateHtml = templateHtml.replace(/<script>[\s\S]*?\/\/ Product Page Specific Script[\s\S]*?<\/script>/m, '');
templateHtml = templateHtml.replace(/href="style\.css"/g, 'href="../style.css"');
templateHtml = templateHtml.replace(/src="script\.js"/g, 'src="../script.js"');
templateHtml = templateHtml.replace(/href="index\.html"/g, 'href="../index.html"');
templateHtml = templateHtml.replace(/href="search\.html"/g, 'href="../search.html"');
templateHtml = templateHtml.replace(/href="categories\.html"/g, 'href="../categories.html"');
templateHtml = templateHtml.replace(/href="after-market\.html"/g, 'href="../after-market.html"');
templateHtml = templateHtml.replace(/href="refurbished\.html"/g, 'href="../refurbished.html"');
templateHtml = templateHtml.replace(/href="used\.html"/g, 'href="../used.html"');
templateHtml = templateHtml.replace(/href="oem\.html"/g, 'href="../oem.html"');
templateHtml = templateHtml.replace(/href="wholesale\.html"/g, 'href="../wholesale.html"');
templateHtml = templateHtml.replace(/href="brand\.html\?id=([a-zA-Z0-9-]+)"/g, 'href="../brand.html?id=$1"');
templateHtml = templateHtml.replace(/src="images\/spareblaze-logo\.png"/g, 'src="../images/spareblaze-logo.png"');
templateHtml = templateHtml.replace(/src="https:\/\/spareblaze\.com\/wp-content\/uploads\/2025\/07\/WhatsApp-Image-2025-07-03-at-9\.08\.18-PM\.jpeg"/g, 'src="../images/spareblaze-logo.png"');

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                fs.unlink(dest, () => { });
                return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
    });
}

function extractNumber(str) {
    if (!str) return 0;
    const match = str.replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

async function scrapeCategory(cat) {
    console.log(`\n\n--- Scraping Category: ${cat} ---`);
    let allProducts = [];
    let page = 1;
    let url = `https://spareblaze.com/product-category/${cat}/`;

    try {
        const res = await fetch(url);
        const html = await res.text();
        const baseBlocks = html.split('<div class="product type-product').slice(1);

        for (let block of baseBlocks) {
            const imgMatch = block.match(/<img[^>]*src="([^"]+)"/i);
            const image = imgMatch ? imgMatch[1] : 'https://dummyimage.com/400x300/ececec/000000.png&text=No+Image';

            const titleMatch = block.match(/<h3 class="name[^"]*">\s*<a href="([^"]+)">([^<]+)<\/a>\s*<\/h3>/i);
            const link = titleMatch ? titleMatch[1] : '#';
            const title = titleMatch ? titleMatch[2].trim() : 'Unknown Product';

            let price = '';
            let originalPrice = '';

            const priceSection = block.match(/<span class="price">([\s\S]*?)<\/span>[\s\S]*?<\/div>/i);
            if (priceSection) {
                const amounts = [...priceSection[1].matchAll(/<bdi>(?:<span[^>]*>&#8377;<\/span>|&#8377;<\/span>)([^<]+)<\/bdi>/gi)];
                if (amounts.length === 2) {
                    originalPrice = "₹" + amounts[0][1];
                    price = "₹" + amounts[1][1];
                } else if (amounts.length === 1) {
                    price = "₹" + amounts[0][1];
                }
            }

            const catMatch = block.match(/product_cat-([^ \"]+)/g);
            let brand = 'Auto Parts';
            if (catMatch) {
                let cats = catMatch.map(c => c.replace('product_cat-', '').replace(/-/g, ' '));
                brand = cats[cats.length - 1];
                brand = brand.charAt(0).toUpperCase() + brand.slice(1);
            }

            allProducts.push({
                title, image, link, price, originalPrice, brand,
                amount: extractNumber(price)
            });
        }
    } catch (e) {
        console.error(`Error scraping ${cat}: ${e.message}`);
    }

    console.log(`Scraped ${allProducts.length} products for ${cat}.`);
    return allProducts;
}

async function buildLocalPagesAndData(cat, products) {
    const baseDir = path.join(__dirname, `${cat}-parts`);
    const imgDir = path.join(baseDir, 'images', 'products');

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    for (let i = 0; i < products.length; i++) {
        let p = products[i];

        // 1. Download image
        let ext = path.extname(p.image).split('?')[0];
        if (!ext) ext = '.jpg';
        let localImgName = `img_${i + 1}${ext}`;
        let localImgDest = path.join(imgDir, localImgName);
        let webImgPath = `${cat}-parts/images/products/${localImgName}`;

        if (!p.image.includes('dummyimage')) {
            try {
                await downloadImage(p.image, localImgDest);
                p.image = webImgPath; // update to local path
            } catch (e) {
                console.log(`Failed to d/l image for ${p.title}: ${e.message}`);
            }
        }

        // 2. Compute discount
        let discount = 0;
        if (p.price && p.originalPrice) {
            let pnum = extractNumber(p.price);
            let onum = extractNumber(p.originalPrice);
            if (onum > pnum && onum > 0) discount = Math.round(((onum - pnum) / onum) * 100);
        }
        p.discount = discount;

        // 3. Build HTML
        let html = templateHtml;
        let safeTitle = p.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        let partNo = "SB-" + cat.substring(0, 2).toUpperCase() + "-" + (1000 + i);
        let mrp = p.originalPrice || p.price;

        html = html.replace(/<title id="page-title">.*?<\/title>/, `<title id="page-title">${safeTitle} - SpareBlaze</title>`);
        html = html.replace(/<span id="bc-brand-name">Brand<\/span>/, `<span id="bc-brand-name">${p.brand}</span>`);
        html = html.replace(/<span id="bc-product-name">Product<\/span>/, `<span id="bc-product-name">${safeTitle}</span>`);

        let logoPath = `../images/${p.brand.toLowerCase().replace(/ /g, '-')}.webp`;
        html = html.replace(/<img id="panel-brand-logo" src="".*?>/, `<img id="panel-brand-logo" src="${logoPath}" onerror="this.style.display='none'">`);
        html = html.replace(/<span id="panel-brand-name">Brand<\/span>/, `<span id="panel-brand-name">${p.brand}</span>`);
        html = html.replace(/<h1 class="product-title" id="product-title">.*?<\/h1>/, `<h1 class="product-title" id="product-title">${safeTitle}</h1>`);

        let adjustedImgPath = "../" + p.image;
        html = html.replace(/<img id="main-product-img" src="".*?>/, `<img id="main-product-img" src="${adjustedImgPath}" alt="${safeTitle}">`);
        html = html.replace(/<img id="thumb-1" src="".*?>/, `<img id="thumb-1" src="${adjustedImgPath}" alt="Thumb 1">`);
        html = html.replace(/<img id="thumb-2" src="".*?>/, `<img id="thumb-2" src="${adjustedImgPath}" alt="Thumb 2">`);
        html = html.replace(/<img id="thumb-3" src="".*?>/, `<img id="thumb-3" src="${adjustedImgPath}" alt="Thumb 3">`);

        html = html.replace(/<div class="price-current" id="product-price">.*?<\/div>/, `<div class="price-current" id="product-price">${p.price}</div>`);
        html = html.replace(/<span class="price-mrp" id="product-mrp">.*?<\/span>/, `<span class="price-mrp" id="product-mrp">MRP ${mrp}</span>`);
        html = html.replace(/<span class="price-saving" id="product-saving">.*?<\/span>/, `<span class="price-saving" id="product-saving">(Save ${discount}%)</span>`);

        let badgeHtml = discount > 0 ? `<div class="discount-badge" style="position: absolute; top: 1.5rem; left: 1.5rem; background: var(--color-error); color: white; padding: 0.3rem 0.8rem; font-weight: bold; border-radius: var(--radius-sm);" id="product-badge">-${discount}%</div>` : '';
        html = html.replace(/<div class="discount-badge"[\s\S]*?id="product-badge">-15%<\/div>/, badgeHtml);

        html = html.replace(/<td id="spec-part-no" style="font-family: monospace; font-weight: bold;">.*?<\/td>/, `<td id="spec-part-no" style="font-family: monospace; font-weight: bold;">${partNo}</td>`);
        html = html.replace(/<td id="spec-class">.*?<\/td>/, `<td id="spec-class">${p.brand} Parts</td>`);
        html = html.replace(/<td id="spec-mfg">.*?<\/td>/, `<td id="spec-mfg">${p.brand} Auto Components Mfg. Ltd.</td>`);

        let newAddCartBtn = `<button class="btn btn-add-cart" onclick="addToCart({id: '${cat}_local_${i}', title: '${safeTitle.replace(/'/g, "\\'")}', price: ${p.amount || 0}, img: '${adjustedImgPath}'})"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>`;
        html = html.replace(/<button class="btn btn-add-cart">.*?<\/button>/, newAddCartBtn);

        let newBuyNowBtn = `<button class="btn btn-primary btn-buy-now" onclick="buyNow({id: '${cat}_local_${i}', title: '${safeTitle.replace(/'/g, "\\'")}', price: ${p.amount || 0}, img: '${adjustedImgPath}'})"><i class="fa-solid fa-bolt"></i> Buy Now</button>`;
        html = html.replace(/<button class="btn btn-primary btn-buy-now">.*?<\/button>/, newBuyNowBtn);

        let filename = `prod_${i + 1}.html`;
        fs.writeFileSync(path.join(baseDir, filename), html);

        p.link = `${cat}-parts/${filename}`;
    }

    const jsVarName = cat.replace(/-([a-z])/g, g => g[1].toUpperCase()) + "Products";
    const jsContent = `const ${jsVarName} = ${JSON.stringify(products, null, 4)};\nmodule.exports = ${jsVarName};`;
    fs.writeFileSync(path.join(__dirname, `${cat}-data-local.js`), jsContent);
    console.log(`Generated ${products.length} localized HTML pages for ${cat} and exported data to ${cat}-data-local.js`);
}

async function main() {
    for (let cat of categories) {
        const prods = await scrapeCategory(cat);
        if (prods.length > 0) {
            await buildLocalPagesAndData(cat, prods);
        }
    }
}

main();
