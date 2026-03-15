const fs = require('fs');
const https = require('https');

const missing = [
    { name: 'timing-belt.jpg', text: 'Timing+Belt' },
    { name: 'cabin-filter.jpg', text: 'Cabin+Filter' },
    { name: 'headlamp.jpg', text: 'Headlamp' },
    { name: 'spark-plug.jpg', text: 'Spark+Plug' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };
        https.get(url, options, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else {
                reject(new Error(`Failed ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

Promise.all(missing.map(item => {
    const url = `https://dummyimage.com/400x300/ececec/000000.png&text=${item.text}`;
    return downloadFile(url, `images/products/${item.name}`).catch(console.error);
})).then(() => console.log('Done'));
