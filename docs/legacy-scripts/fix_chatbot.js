const fs = require('fs');
const path = require('path');

const tidioScript = '<script src="https://code.tidio.co/sienbawteqdozz2om1mswgszpjxm6zxg.js" async></script>';

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Pattern to match explicit chat widget
    const chatWidgetRegex = /<!-- Chat Widget -->[\s\S]*?<div class="chat-widget">[\s\S]*?<\/div>\s*<\/div>\s*<button class="chat-button" id="chat-toggle-btn">[\s\S]*?<\/button>\s*<\/div>/;
    const fallbackRegex = /<!-- Chat Widget -->[\s\S]*?<\/body>/;
    const bodyReplacement = `${tidioScript}\n</body>`;

    if (chatWidgetRegex.test(content)) {
        content = content.replace(chatWidgetRegex, '');
        hasChanges = true;
    }

    if (content.includes('<!-- Chat Widget -->')) {
        content = content.replace(fallbackRegex, bodyReplacement);
        hasChanges = true;
    } else if (!content.includes('code.tidio.co') && content.includes('</body>')) {
        content = content.replace('</body>', bodyReplacement);
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
console.log(`Chatbot fix applied to ${count} HTML files.`);
