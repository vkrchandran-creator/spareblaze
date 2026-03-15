const fs = require('fs');
const path = require('path');

const directoryPath = 'd:/Ram/spareblaze.com';
let missingImages = [];

function checkImages(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // checkImages(fullPath); // Skip subdirs for now
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
            let match;
            while ((match = imgRegex.exec(content)) !== null) {
                let imgSrc = match[1];
                if (!imgSrc.startsWith('http')) {
                    // It's a local file
                    const absImgPath = path.join(dir, imgSrc);
                    if (!fs.existsSync(absImgPath)) {
                        missingImages.push({ file: fullPath, img: imgSrc, absImgPath });
                    }
                }
            }
        }
    }
}

checkImages(directoryPath);
checkImages(path.join(directoryPath, 'oem-parts'));
checkImages(path.join(directoryPath, 'after-market-parts'));
checkImages(path.join(directoryPath, 'used-parts'));
checkImages(path.join(directoryPath, 'refurbished-parts'));
checkImages(path.join(directoryPath, 'wholesale-parts'));

console.log(JSON.stringify(missingImages, null, 2));
