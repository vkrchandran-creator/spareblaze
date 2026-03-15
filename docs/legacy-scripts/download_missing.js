const fs = require('fs');
const https = require('https');

const downloads = [
    { url: 'https://loremflickr.com/500/500/headlight,car/all', dest: 'images/products/headlamp.jpg' },
    { url: 'https://loremflickr.com/500/500/sparkplug,car/all', dest: 'images/products/spark-plug.jpg' },
    { url: 'https://loremflickr.com/500/500/engine,belt/all', dest: 'images/products/timing-belt.jpg' },
    { url: 'https://loremflickr.com/500/500/car,part/all', dest: 'images/products/oil-filter.jpg' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=RENAULT', dest: 'images/renault.png' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=MAHINDRA', dest: 'images/mahindra.png' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=FORD', dest: 'images/ford.jpg' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=KIA', dest: 'images/kia.png' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=TATA', dest: 'images/tata.png' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=HONDA', dest: 'images/honda.png' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // follow redirect
                downloadFile(response.headers.location.startsWith('http') ? response.headers.location : `https://${response.req.host}${response.headers.location}`, dest).then(resolve).catch(reject);
            } else if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded ${dest}`);
                    resolve();
                });
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function run() {
    for (const d of downloads) {
        try {
            await downloadFile(d.url, d.dest);
        } catch (e) {
            console.error(`Error downloading ${d.dest}:`, e);
        }
    }
}

run();
