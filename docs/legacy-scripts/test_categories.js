const categories = ['refurbished', 'used', 'oem', 'wholesale'];

async function testCats() {
    for (let cat of categories) {
        const url = `https://spareblaze.com/product-category/${cat}/`;
        try {
            const res = await fetch(url);
            const text = await res.text();
            const productMatch = text.match(/class="product type-product/g);
            const numProducts = productMatch ? productMatch.length : 0;
            const paginationMatch = text.match(/class="page-numbers">\s*([0-9]+)\s*<\/a>[\s\S]*?class="next/);
            let pages = 1;
            if (paginationMatch) {
                pages = parseInt(paginationMatch[1], 10);
            } else if (text.includes('class="page-numbers"')) {
                // simple numbers without next
                const allPages = [...text.matchAll(/class="page-numbers">\s*([0-9]+)\s*<\/a>/g)];
                if (allPages.length > 0) {
                    pages = parseInt(allPages[allPages.length - 1][1], 10);
                }
            }
            console.log(`Category: ${cat} | Status: ${res.status} | Page 1 Products: ${numProducts} | Est Pages: ${pages}`);
        } catch (e) {
            console.log(`Failed to fetch ${cat}: ${e.message}`);
        }
    }
}
testCats();
