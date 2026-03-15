const fs = require('fs');
const path = require('path');

const dirs = [
    'after-market-parts',
    'oem-parts',
    'used-parts',
    'refurbished-parts',
    'wholesale-parts'
];

const logoImgPattern = /(<a\s[^>]*class="logo"[^>]*>[\s\S]*?<img\s)([^>]*?)(>)/g;

let totalFixed = 0;

dirs.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));
    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        let html = fs.readFileSync(filePath, 'utf8');

        // Fix all logo img tags to have consistent size styling and correct extension
        let fixed = html.replace(
            /(<a\s[^>]*class="logo"[^>]*>\s*<img\s)([^>]*?)(>)/g,
            (match, pre, attrs, close) => {
                // Update extension if it's .jpg
                attrs = attrs.replace(/spareblaze-logo\.jpg/gi, 'spareblaze-logo.png');

                // If style is already present with height, just update it
                if (/style=["'][^"']*height:\s*(\d+)px/i.test(attrs)) {
                    attrs = attrs.replace(/height:\s*\d+px/i, 'height: 54px');
                    return `${pre}${attrs}${close}`;
                }

                // Remove existing style attr if any
                attrs = attrs.replace(/\s*style="[^"]*"/gi, '');
                attrs = attrs.replace(/\s*style='[^']*'/gi, '');
                return `${pre}${attrs.trim()} style="height: 54px; width: auto; object-fit: contain;"${close}`;
            }
        );

        // Also fix any loose footer imgs without the .logo wrapper if they exist
        fixed = fixed.replace(/src="([^"]*?)spareblaze-logo\.jpg"/g, 'src="$1spareblaze-logo.png"');

        if (fixed !== html) {
            fs.writeFileSync(filePath, fixed);
            totalFixed++;
        }
    });
    console.log(`Processed ${files.length} files in ${dir}`);
});

console.log(`\nDone! Fixed logo styles in ${totalFixed} product pages.`);
