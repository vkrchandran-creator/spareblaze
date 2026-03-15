const fs = require('fs');
const path = require('path');

// Load the updated local products array
const dataFilePath = path.join(__dirname, 'after-market-data-local.js');
let fileContent = fs.readFileSync(dataFilePath, 'utf8');
fileContent = fileContent.replace('const afterMarketProducts = ', '').replace(/;$/, '');
let products = JSON.parse(fileContent);

// Load the base template
const templatePath = path.join(__dirname, 'product.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');

const outputDir = path.join(__dirname, 'after-market-parts');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

console.log(`Generating ${products.length} local HTML pages...`);

// We want to remove the dynamic JS script at the bottom of product.html 
// that normally parses URL parameters. We replace it with nothing, and instead 
// inject the actual product data directly into the HTML tags.
// The script roughly starts around `<script>\n        // Product Page Specific Script`
// and ends at `</script>\n\n    <!-- Chat Widget -->`
templateHtml = templateHtml.replace(/<script>[\s\S]*?\/\/ Product Page Specific Script[\s\S]*?<\/script>/m, '');


// Fix relative asset paths in the template since the new pages are in a subfolder
// e.g. href="style.css" -> href="../style.css"
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


for (let i = 0; i < products.length; i++) {
    let p = products[i];
    let html = templateHtml;

    // We'll calculate a dummy part number and info
    let partNo = "SB-" + (10000 + i);
    let mrp = p.originalPrice || p.price;
    let safeTitle = p.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Inject Title Tags
    html = html.replace(/<title id="page-title">.*?<\/title>/, `<title id="page-title">${safeTitle} - SpareBlaze</title>`);

    // Inject Breadcrumbs
    html = html.replace(/<span id="bc-brand-name">Brand<\/span>/, `<span id="bc-brand-name">${p.brand}</span>`);
    html = html.replace(/<span id="bc-product-name">Product<\/span>/, `<span id="bc-product-name">${safeTitle}</span>`);

    // Brand Logo Logic (mock)
    let brandId = p.brand.toLowerCase().replace(/ /g, '-');
    const pngBrands = ['bmw', 'audi', 'volvo', 'mahindra', 'hyundai', 'honda', 'toyota', 'vw', 'tata', 'ford', 'fiat', 'chevrolet', 'maruti', 'maruti-suzuki'];
    const svgBrands = ['kia', 'nissan', 'renault', 'skoda', 'mg', 'jeep'];
    let finalLogo = `../images/${brandId}.webp`;
    if (pngBrands.includes(brandId)) {
        finalLogo = `../images/${brandId}.png`;
        if (brandId === 'maruti') finalLogo = `../images/maruti-suzuki.png`;
    } else if (svgBrands.includes(brandId)) {
        finalLogo = `../images/${brandId}.svg`;
    }

    html = html.replace(/<img id="panel-brand-logo"[^>]*>/g, `<img id="panel-brand-logo" src="${finalLogo}" onerror="this.src='../images/spareblaze-logo.png'">`);
    html = html.replace(/<span[\s\S]*?id="panel-brand-name">\s*Brand\s*<\/span>/, `<span id="panel-brand-name">${p.brand}</span>`);

    // Title
    html = html.replace(/<h1 class="product-title" id="product-title">.*?<\/h1>/, `<h1 class="product-title" id="product-title">${safeTitle}</h1>`);

    // Main Image
    // Note: p.image is already "after-market-parts/images/..." so we need to adjust the relative path to "../after-market-parts/images/..."
    let adjustedImgPath = "../" + p.image;
    html = html.replace(/<img id="main-product-img" src="".*?>/, `<img id="main-product-img" src="${adjustedImgPath}" alt="${safeTitle}">`);

    // Thumbnails (make them all the main image for simplicity)
    html = html.replace(/<img id="thumb-1" src="".*?>/, `<img id="thumb-1" src="${adjustedImgPath}" alt="Thumb 1">`);
    html = html.replace(/<img id="thumb-2" src="".*?>/, `<img id="thumb-2" src="${adjustedImgPath}" alt="Thumb 2">`);
    html = html.replace(/<img id="thumb-3" src="".*?>/, `<img id="thumb-3" src="${adjustedImgPath}" alt="Thumb 3">`);

    // Price Block
    html = html.replace(/<div class="price-current" id="product-price">.*?<\/div>/, `<div class="price-current" id="product-price">${p.price}</div>`);
    html = html.replace(/<span class="price-mrp" id="product-mrp">.*?<\/span>/, `<span class="price-mrp" id="product-mrp">MRP ${mrp}</span>`);
    html = html.replace(/<span class="price-saving" id="product-saving">.*?<\/span>/, `<span class="price-saving" id="product-saving">(Save ${p.discount || 0}%)</span>`);

    // Discount Badge near image
    let badgeHtml = p.discount > 0 ? `<div class="discount-badge" style="position: absolute; top: 1.5rem; left: 1.5rem; background: var(--color-error); color: white; padding: 0.3rem 0.8rem; font-weight: bold; border-radius: var(--radius-sm);" id="product-badge">-${p.discount}%</div>` : '';
    html = html.replace(/<div class="discount-badge"[\s\S]*?id="product-badge">-15%<\/div>/, badgeHtml);

    // Specs
    html = html.replace(/<td id="spec-part-no" style="font-family: monospace; font-weight: bold;">.*?<\/td>/, `<td id="spec-part-no" style="font-family: monospace; font-weight: bold;">${partNo}</td>`);
    html = html.replace(/<td id="spec-class">.*?<\/td>/, `<td id="spec-class">${p.brand} Parts</td>`);
    html = html.replace(/<td id="spec-mfg">.*?<\/td>/, `<td id="spec-mfg">${p.brand} Auto Components Mfg. Ltd.</td>`);

    // Add Cart Button click handler
    let addCartRegex = /<button class="btn btn-add-cart">.*?<\/button>/;
    let newAddCartBtn = `<button class="btn btn-add-cart" onclick="addToCart({id: 'am_local_${i}', title: '${safeTitle.replace(/'/g, "\\'")}', price: ${p.amount || p.price || 0}, img: '${adjustedImgPath}'})"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>`;
    html = html.replace(addCartRegex, newAddCartBtn);

    let buyNowRegex = /<button class="btn btn-primary btn-buy-now">.*?<\/button>/;
    let newBuyNowBtn = `<button class="btn btn-primary btn-buy-now" onclick="buyNow({id: 'am_local_${i}', title: '${safeTitle.replace(/'/g, "\\'")}', price: ${p.amount || p.price || 0}, img: '${adjustedImgPath}'})"><i class="fa-solid fa-bolt"></i> Buy Now</button>`;
    html = html.replace(buyNowRegex, newBuyNowBtn);

    // Save File
    let filename = `prod_${i + 1}.html`;
    fs.writeFileSync(path.join(outputDir, filename), html);

    // Update the local JSON array to point to this new page
    products[i].link = `after-market-parts/${filename}`;
}

// Write the final JSON file that `after-market.html` will consume
const jsContent = `const afterMarketProducts = ${JSON.stringify(products, null, 4)};`;
fs.writeFileSync(path.join(__dirname, 'after-market-data-local.js'), jsContent);

console.log('Successfully generated 580 localized HTML product pages and updated data file.');
