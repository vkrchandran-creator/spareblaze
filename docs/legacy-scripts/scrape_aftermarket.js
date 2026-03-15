const fs = require('fs');

async function scrapePages() {
    let allProducts = [];
    const totalPages = 33;
    const baseUrl = 'https://spareblaze.com/product-category/after-market/page/';

    console.log(`Starting scraper for ${totalPages} pages concurrently...`);

    const constructUrl = (i) => i === 1 ? 'https://spareblaze.com/product-category/after-market/' : `${baseUrl}${i}/`;

    const fetchPage = async (i) => {
        let url = constructUrl(i);
        console.log(`Fetching page ${i}...`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch page ${i}: ${response.status}`);
                return [];
            }
            const html = await response.text();
            let pageProducts = [];

            const productBlocks = html.split('<div class="product type-product').slice(1);

            for (let block of productBlocks) {
                const imgMatch = block.match(/<img[^>]*src="([^"]+)"[^>]*class="attachment-woocommerce_thumbnail/i);
                let image = imgMatch ? imgMatch[1] : 'https://dummyimage.com/400x300/ececec/000000.png&text=No+Image';

                const titleMatch = block.match(/<h3 class="name[^"]*">\s*<a href="([^"]+)">([^<]+)<\/a>\s*<\/h3>/i);
                let link = titleMatch ? titleMatch[1] : '#';
                let title = titleMatch ? titleMatch[2].trim() : 'Unknown Product';

                const priceBlockMatch = block.match(/<span class="price">([\s\S]*?)<\/span><\/div>/i) || block.match(/<span class="price">([\s\S]*?)<\/span>\s*<\/div>/i);

                let price = '';
                let defaultPrice = '';
                let originalPrice = '';

                if (priceBlockMatch) {
                    const pb = priceBlockMatch[1];
                    const amounts = [...pb.matchAll(/<bdi>&#8377;<\/span>([^<]+)<\/bdi>/g)].map(m => m[1]);
                    const amounts2 = [...pb.matchAll(/<bdi><span[^>]*>&#8377;<\/span>([^<]+)<\/bdi>/g)].map(m => m[1]);
                    const finalAmounts = amounts.length > 0 ? amounts : amounts2;

                    if (finalAmounts.length === 2) {
                        price = "₹" + finalAmounts[0];
                        originalPrice = "₹" + finalAmounts[1];
                        defaultPrice = finalAmounts[0].replace(/,/g, '');
                    } else if (finalAmounts.length === 1) {
                        price = "₹" + finalAmounts[0];
                        defaultPrice = finalAmounts[0].replace(/,/g, '');
                    }
                } else {
                    const amounts = [...block.matchAll(/<bdi><span[^>]*>&#8377;<\/span>([^<]+)<\/bdi>/gi)];
                    if (amounts.length === 2) {
                        price = "₹" + amounts[0][1];
                        originalPrice = "₹" + amounts[1][1];
                        defaultPrice = amounts[0][1].replace(/,/g, '');
                    } else if (amounts.length >= 1) {
                        price = "₹" + amounts[0][1];
                        defaultPrice = amounts[0][1].replace(/,/g, '');
                    }
                }

                let discount = 0;
                if (price && originalPrice) {
                    let p = parseFloat(price.replace(/[^0-9.]/g, ''));
                    let o = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
                    if (o > p && o > 0) {
                        discount = Math.round(((o - p) / o) * 100);
                    }
                }

                const catMatch = block.match(/product_cat-([^ \"]+)/g);
                let brand = 'Auto Parts';
                if (catMatch) {
                    let cats = catMatch.map(c => c.replace('product_cat-', '').replace(/-/g, ' '));
                    brand = cats[cats.length - 1];
                    brand = brand.charAt(0).toUpperCase() + brand.slice(1);
                }

                pageProducts.push({
                    title: title,
                    image: image,
                    link: link,
                    price: price,
                    originalPrice: originalPrice,
                    amount: defaultPrice,
                    discount: discount,
                    brand: brand
                });
            }
            return pageProducts;
        } catch (e) {
            console.error(`Error on page ${i}:`, e.message);
            return [];
        }
    };

    // Process in batches
    const batchSize = 6;
    for (let i = 1; i <= totalPages; i += batchSize) {
        const batchPromises = [];
        for (let j = 0; j < batchSize && i + j <= totalPages; j++) {
            batchPromises.push(fetchPage(i + j));
        }
        const results = await Promise.all(batchPromises);
        results.forEach(res => allProducts.push(...res));
        console.log(`Processed up to page ${Math.min(i + batchSize - 1, totalPages)}`);
    }

    console.log(`Scraped ${allProducts.length} products total.`);
    const jsContent = `const afterMarketProducts = ${JSON.stringify(allProducts, null, 4)};`;
    fs.writeFileSync('after-market-data.js', jsContent);
    console.log('Saved to after-market-data.js');
}

scrapePages();
