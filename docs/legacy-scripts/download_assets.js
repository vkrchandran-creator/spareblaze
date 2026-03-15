const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// Load the existing products array
const dataFilePath = path.join(__dirname, 'after-market-data.js');
let fileContent = fs.readFileSync(dataFilePath, 'utf8');

// A quick hack to extract the array, as the file is a JS script, not straight JSON
fileContent = fileContent.replace('const afterMarketProducts = ', '').replace(/;$/, '');
let afterMarketProducts = JSON.parse(fileContent);

const downloadDir = path.join(__dirname, 'after-market-parts', 'images');
const updatedProducts = [];

console.log(`Starting download of ${afterMarketProducts.length} images...`);

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        // Handle https vs http
        const client = url.startsWith('https') ? https : http;

        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
};

async function processImages() {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < afterMarketProducts.length; i++) {
        let product = afterMarketProducts[i];
        let originalImgUrl = product.image;

        // Handle dummy images or empty urls
        if (!originalImgUrl || originalImgUrl.includes('dummyimage')) {
            product.image = 'https://dummyimage.com/400x300/ececec/000000.png&text=No+Image';
            updatedProducts.push(product);
            continue;
        }

        let extension = path.extname(new URL(originalImgUrl).pathname) || '.jpg';
        let localFilename = `am_prod_${i + 1}${extension}`;
        let localFilePath = path.join(downloadDir, localFilename);

        try {
            await downloadImage(originalImgUrl, localFilePath);
            // Update the object to point to the local file
            product.image = `after-market-parts/images/${localFilename}`;
            successCount++;
            if (successCount % 50 === 0) console.log(`Downloaded ${successCount} images...`);
        } catch (error) {
            console.error(`Failed to download ${originalImgUrl}:`, error.message);
            // Fallback to absolute if it fails
            product.image = 'https://dummyimage.com/400x300/ececec/000000.png&text=Download+Failed';
            failCount++;
        }

        updatedProducts.push(product);
    }

    console.log(`\nDownload complete. Success: ${successCount}. Failed: ${failCount}.`);

    // Write back the updated data file
    const jsContent = `const afterMarketProducts = ${JSON.stringify(updatedProducts, null, 4)};`;
    fs.writeFileSync(path.join(__dirname, 'after-market-data-local.js'), jsContent);
    console.log(`Saved updated product list to after-market-data-local.js`);
}

processImages();
