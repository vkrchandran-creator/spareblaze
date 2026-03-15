const fs = require('fs');
const https = require('https');

// A selection of explicit public-domain/free car part images for realism
const downloads = [
    { url: 'https://images.unsplash.com/photo-1549495765-b169ca0f33d7?w=500&q=80', dest: 'images/products/headlamp.jpg' },
    { url: 'https://images.unsplash.com/photo-1635334701257-227ae1fdb853?w=500&q=80', dest: 'images/products/spark-plug.jpg' },
    { url: 'https://images.unsplash.com/photo-1610444589999-72c1c73a948e?w=500&q=80', dest: 'images/products/timing-belt.jpg' },
    { url: 'https://images.unsplash.com/photo-1600742194600-b55d9d73d2a3?w=500&q=80', dest: 'images/products/oil-filter.jpg' },
    { url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500&q=80', dest: 'images/products/shock-absorber.jpg' },
    { url: 'https://images.unsplash.com/photo-1574880345053-9ecb6a382c2a?w=500&q=80', dest: 'images/products/air-filter.jpg' },
    { url: 'https://images.unsplash.com/photo-1635334701257-227ae1fdb853?w=500&q=80', dest: 'images/products/cabin-filter.jpg' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else {
                reject(new Error(`Failed ${url}: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}
Promise.all(downloads.map(d => downloadFile(d.url, d.dest).catch(console.error))).then(() => console.log('Done'));
