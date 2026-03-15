const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'after-market.html',
    'refurbished.html',
    'used.html',
    'oem.html',
    'wholesale.html'
];

filesToPatch.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found.`);
        return;
    }

    let html = fs.readFileSync(filePath, 'utf8');
    let occurrencesReplaced = 0;

    // Use a regex to find all product-cards and process them one by one
    // The regex captures the data-price and img src, title, and the view details href to build a unique ID
    const cardRegex = /<div class="product-card" data-price="(\d+)".*?>([\s\S]*?)<\/div>\s*<\/div>/g;

    html = html.replace(/<div class="product-card" data-price="(\d+)"[^>]*>[\s\S]*?(?:<img[^>]*src="([^"]+)"[^>]*>)?[\s\S]*?<h3 class="product-title">([^<]+)<\/h3>[\s\S]*?<a href="([^"]+)" class="btn view-details-btn"[\s\S]*?<button class="btn btn-primary add-cart-btn" onclick="toggleCartItem\(0, this\)"><i[^>]*><\/i> Add to Cart<\/button>[\s\S]*?<\/div>\s*<\/div>/g,
        (match, price, imgSrc, title, href) => {
            let id;
            try {
                // Try to extract an ID from the href (e.g., product.html?id=... or after-market-parts/prod_X.html)
                if (href.includes('product.html?id=')) {
                    id = href.split('id=')[1];
                } else if (href.includes('after-market-parts/prod_')) {
                    id = href.split('/').pop().replace('.html', '');
                } else {
                    id = title; // fallback
                }
            } catch (e) {
                id = title;
            }

            const safeTitle = title.replace(/'/g, "\\'");
            const newBtn = `<button class="btn btn-primary add-cart-btn" onclick="addToCart({id: '${encodeURIComponent(id)}', title: '${safeTitle}', price: ${price}, img: '${imgSrc || ''}'})"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>`;

            occurrencesReplaced++;
            return match.replace(/<button class="btn btn-primary add-cart-btn" onclick="toggleCartItem\(0, this\)"><i class="fa-solid fa-plus"><\/i> Add to Cart<\/button>/, newBtn);
        });

    // Fallback: simpler regex if the complex one missed some due to structure variations
    const genericReplaceRegex = /<div class="product-card" data-price="(\d+)"[^>]*>([\s\S]*?)<img[^>]*src="([^"]+)"[^>]*>([\s\S]*?)<h3 class="product-title">([^<]+)<\/h3>([\s\S]*?)<a href="([^"]+)"[^>]*>([\s\S]*?)<button class="btn btn-primary add-cart-btn" onclick="toggleCartItem\(0,\s*this\)">/g;

    let html2 = html.replace(genericReplaceRegex, (match, price, p2, imgSrc, p4, title, p6, href, p8) => {
        let id = encodeURIComponent(title);
        if (href.includes('product.html?id=')) id = encodeURIComponent(href.split('id=')[1]);
        else if (href.includes('after-market-parts/prod_')) id = href.split('/').pop().replace('.html', '');

        const safeTitle = title.replace(/'/g, "\\'");

        let rep = `<div class="product-card" data-price="${price}" data-discount${p2}<img src="${imgSrc}"${p4}<h3 class="product-title">${title}</h3>${p6}<a href="${href}"${p8}<button class="btn btn-primary add-cart-btn" onclick="addToCart({id: '${id}', title: '${safeTitle}', price: ${price}, img: '${imgSrc}'})">`;

        // This is complex, so let's use DOM parsing using JSDOM or just a simple split/replace logic
        return match; // don't replace here, do it the robust way
    });

    // We will do a robust replacement method: split by product cards
    let finalHtml = '';
    const parts = html.split('<div class="product-card"');
    finalHtml = parts[0];

    for (let i = 1; i < parts.length; i++) {
        let cardChunk = parts[i];

        // Ensure it is actually a broken add to cart button
        if (cardChunk.includes('onclick="toggleCartItem(0, this)"')) {
            const priceMatch = cardChunk.match(/data-price="(\d+)"/);
            const price = priceMatch ? parseInt(priceMatch[1]) : 0;

            const imgMatch = cardChunk.match(/<img[^>]*src="([^"]+)"/);
            const img = imgMatch ? imgMatch[1] : '';

            const titleMatch = cardChunk.match(/<h3 class="product-title">([^<]+)<\/h3>/);
            const title = titleMatch ? titleMatch[1] : 'Unknown Product';

            const hrefMatch = cardChunk.match(/<a href="([^"]+)"/);
            const href = hrefMatch ? hrefMatch[1] : '';

            let id = encodeURIComponent(title);
            if (href.includes('product.html?id=')) id = encodeURIComponent(href.split('id=')[1]);
            else if (href.includes('after-market-parts/prod_')) id = href.split('/').pop().replace('.html', '');

            const safeTitle = title.replace(/'/g, "/'");

            const newBtn = `<button class="btn btn-primary add-cart-btn" onclick="addToCart({id: '${id}', title: '${safeTitle}', price: ${price}, img: '${img}'})">`;

            cardChunk = cardChunk.replace('<button class="btn btn-primary add-cart-btn" onclick="toggleCartItem(0, this)">', newBtn);

            // Fix the icon as well
            cardChunk = cardChunk.replace(/<i\s+class="fa-solid fa-plus">\s*<\/i>\s*Add to Cart/, '<i class="fa-solid fa-cart-plus"></i> Add to Cart');

            occurrencesReplaced++;
        }
        finalHtml += '<div class="product-card"' + cardChunk;
    }

    fs.writeFileSync(filePath, finalHtml);
    console.log(`Updated ${file}: replaced ${occurrencesReplaced} occurrences`);
});
