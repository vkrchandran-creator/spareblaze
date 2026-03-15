const fs = require('fs');
const path = require('path');

const dirs = [
    'after-market-parts',
    'oem-parts',
    'used-parts',
    'refurbished-parts',
    'wholesale-parts',
    'products',
    'products-aftermarket'
];

const pngBrands = ['bmw', 'audi', 'volvo', 'mahindra', 'hyundai', 'honda', 'toyota', 'vw', 'tata', 'ford', 'fiat', 'chevrolet', 'maruti', 'maruti-suzuki'];
const svgBrands = ['kia', 'nissan', 'renault', 'skoda', 'mg', 'jeep'];

let totalFixed = 0;

dirs.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));
    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        let html = fs.readFileSync(filePath, 'utf8');

        // Extract the brand name from the panel
        const brandMatch = html.match(/<span id="panel-brand-name">([^<]+)<\/span>/);
        if (!brandMatch) return;

        let pBrand = brandMatch[1];
        let brandId = pBrand.toLowerCase().replace(/ /g, '-');

        let finalLogo = `../images/${brandId}.webp`;
        if (pngBrands.includes(brandId)) {
            finalLogo = `../images/${brandId}.png`;
            if (brandId === 'maruti') finalLogo = `../images/maruti-suzuki.png`;
        } else if (svgBrands.includes(brandId)) {
            finalLogo = `../images/${brandId}.svg`;
        }

        // Replace the logo IMG tag completely
        const newLogoHtml = `<img id="panel-brand-logo" src="${finalLogo}" onerror="this.src='../images/spareblaze-logo.png'">`;

        // Find existing image tag (could be src="", src="...", onerror="this.style.display='none'", etc.)
        let fixed = html.replace(/<img id="panel-brand-logo"[^>]*>/g, newLogoHtml);

        if (fixed !== html) {
            fs.writeFileSync(filePath, fixed);
            totalFixed++;
        }
    });
    console.log(`Processed ${files.length} files in ${dir}`);
});

console.log(`\nDone! Fixed brand logos in ${totalFixed} product pages.`);
