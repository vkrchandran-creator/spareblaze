const fs = require('fs');
const path = require('path');

let count = 0;

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;
    // Fix protocol-relative Tidio URLs (both single and double quote variants)
    content = content.replace(/src="\/\/code\.tidio\.co\//g, 'src="https://code.tidio.co/');
    content = content.replace(/src='\/\/code\.tidio\.co\//g, "src='https://code.tidio.co/");
    // Also ensure any pages missing Tidio entirely get it added
    if (!content.includes('code.tidio.co') && content.includes('</body>')) {
        content = content.replace('</body>', '<script src="https://code.tidio.co/sienbawteqdozz2om1mswgszpjxm6zxg.js" async></script>\n</body>');
    }
    if (content !== before) {
        fs.writeFileSync(filePath, content);
        count++;
    }
}

const root = __dirname;

// Root HTML files
fs.readdirSync(root).forEach(file => {
    if (file.endsWith('.html')) {
        fixFile(path.join(root, file));
    }
});

// after-market-parts subfolder
const amDir = path.join(root, 'after-market-parts');
if (fs.existsSync(amDir)) {
    fs.readdirSync(amDir).forEach(file => {
        if (file.endsWith('.html')) {
            fixFile(path.join(amDir, file));
        }
    });
}

console.log(`Protocol fix applied to ${count} files.`);
