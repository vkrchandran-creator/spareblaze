const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('after-market.html', 'utf8');
const imagesDir = path.join('after-market-parts', 'images');

const matches = [...html.matchAll(/src="after-market-parts\/images\/(am_prod_\d+\.[a-z]+)"/gi)];

let mismatch = 0;
const missing = [];
matches.forEach(m => {
    const fname = m[1];
    const fullPath = path.join(imagesDir, fname);
    if (!fs.existsSync(fullPath)) {
        mismatch++;
        missing.push(fname);
    }
});

console.log('Total img refs in HTML:', matches.length);
console.log('Mismatched (in HTML but not on disk):', mismatch);

if (missing.length > 0) {
    console.log('First 20 missing on disk:');
    missing.slice(0, 20).forEach(m => {
        // Find what the actual extension is on disk
        const baseName = m.split('.')[0];
        const exts = ['.jpg', '.jpeg', '.png', '.webp'];
        let actual = 'NONE';
        for (const ext of exts) {
            if (fs.existsSync(path.join(imagesDir, baseName + ext))) {
                actual = baseName + ext;
                break;
            }
        }
        console.log(`  HTML has: ${m}, Disk has: ${actual}`);
    });
}
