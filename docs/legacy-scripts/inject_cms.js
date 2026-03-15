const fs = require('fs');
const path = require('path');

// Pages to inject cms-data.js into
const pages = [
    'index.html',
    'after-market.html', 'refurbished.html', 'used.html', 'oem.html', 'wholesale.html',
    'brand.html', 'categories.html', 'search.html', 'product.html'
];

const ROOT = __dirname;
let updated = 0;

pages.forEach(fileName => {
    const filePath = path.join(ROOT, fileName);
    if (!fs.existsSync(filePath)) return;

    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already injected
    if (html.includes('cms-data.js')) {
        console.log('Already has cms-data.js: ' + fileName);
        return;
    }

    // If there's an existing filter.js tag, insert cms-data.js right after script.js
    // Otherwise insert before </body>
    if (html.includes('<script src="script.js">')) {
        html = html.replace('<script src="script.js"></script>', '<script src="cms-data.js"></script>\n    <script src="script.js"></script>');
    } else if (html.includes('<script src="script.js"')) {
        html = html.replace('<script src="script.js"', '<script src="cms-data.js"></script>\n    <script src="script.js"');
    } else {
        html = html.replace('</body>', '<script src="cms-data.js"></script>\n</body>');
    }

    fs.writeFileSync(filePath, html);
    console.log('Injected cms-data.js into: ' + fileName);
    updated++;
});

console.log('Done. Updated ' + updated + ' files.');
