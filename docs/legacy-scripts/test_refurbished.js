const fs = require('fs');
async function test() {
    const res = await fetch('https://spareblaze.com/product-category/refurbished/');
    const text = await res.text();
    fs.writeFileSync('test_refurbished.html', text);
    console.log("Done");
}
test();
