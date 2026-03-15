const fs = require('fs');
const path = require('path');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Some links like view brand catalog have a hash, we can point them to brands page instead of broken link
    if (content.includes('href="#" id="view-brand-catalog"')) {
        content = content.replace(/href="#" id="view-brand-catalog"/g, 'href="javascript:void(0);" id="view-brand-catalog"');
        hasChanges = true;
    }

    if (content.includes('href="#" id="bc-brand-link"')) {
        content = content.replace(/href="#" id="bc-brand-link"/g, 'href="javascript:void(0);" id="bc-brand-link"');
        hasChanges = true;
    }

    if (hasChanges) {
        fs.writeFileSync(file, content);
    }
}

const root = __dirname;
let count = 0;

fs.readdirSync(root).forEach(file => {
    if (file.endsWith('.html')) {
        processFile(path.join(root, file));
        count++;
    }
});

const amPath = path.join(root, 'after-market-parts');
if (fs.existsSync(amPath)) {
    fs.readdirSync(amPath).forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(amPath, file));
            count++;
        }
    });
}
console.log(`Href fix applied to ${count} HTML files.`);
