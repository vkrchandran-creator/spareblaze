const fs = require('fs');
const files = ['categories.html', 'brand.html', 'index.html', 'contact-us.html', 'product.html', 'return-policy.html', 'search.html', 'shipping-info.html', 'track-order.html'];

const mainNavReplacement = `<ul class="category-links">
                <li><a href="categories.html?category=after-market">After Market</a></li>
                <li><a href="categories.html?category=refurbished">Refurbished</a></li>
                <li><a href="categories.html?category=used">Used</a></li>
                <li><a href="categories.html?category=oem">OEM</a></li>
                <li><a href="categories.html?category=wholesale">Wholesale</a></li>
            </ul>`;

const footerNavReplacement = `<div class="footer-links">
                <h3>Categories</h3>
                <ul>
                    <li><a href="categories.html?category=after-market">After Market</a></li>
                    <li><a href="categories.html?category=refurbished">Refurbished</a></li>
                    <li><a href="categories.html?category=used">Used</a></li>
                    <li><a href="categories.html?category=oem">OEM</a></li>
                    <li><a href="categories.html?category=wholesale">Wholesale</a></li>
                </ul>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace main nav
    content = content.replace(/<ul class="category-links">[\s\S]*?<\/ul>/, mainNavReplacement);

    // Replace footer nav
    content = content.replace(/<div class="footer-links">\s*<h3>Categories<\/h3>\s*<ul>[\s\S]*?<\/ul>/, footerNavReplacement);

    fs.writeFileSync(file, content);
});
console.log('Update complete');
