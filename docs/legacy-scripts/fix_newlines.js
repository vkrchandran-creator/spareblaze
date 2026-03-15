const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'after-market.html',
    'refurbished.html',
    'used.html',
    'oem.html',
    'wholesale.html'
];

filesToPatch.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found.`);
        return;
    }

    let html = fs.readFileSync(filePath, 'utf8');
    let occurrencesFixed = 0;

    // Find and replace newlines inside onclick="addToCart({...})"
    html = html.replace(/onclick="addToCart\(\{[^\}]+\}\)"/g, (match) => {
        // Only replace actual newline characters inside the string
        let fixedInfo = match.replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ').replace(/\r\n/g, ' ').replace(/\n/g, ' ');
        if (fixedInfo !== match) {
            occurrencesFixed++;
        }
        return fixedInfo;
    });

    if (occurrencesFixed > 0) {
        fs.writeFileSync(filePath, html);
        console.log(`Updated ${file}: fixed ${occurrencesFixed} newline errors in onclick`);
    } else {
        console.log(`${file}: 0 newline errors found.`);
    }
});
