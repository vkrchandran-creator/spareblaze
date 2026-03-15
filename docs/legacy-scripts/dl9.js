const fs = require('fs');
const https = require('https');
const http = require('http');

const downloads = [
    { url: 'https://loremflickr.com/500/500/engine,belt', dest: 'images/products/timing-belt.jpg' },
    { url: 'https://loremflickr.com/500/500/car,filter', dest: 'images/products/cabin-filter.jpg' },
    { url: 'https://loremflickr.com/500/500/headlight', dest: 'images/products/headlamp.jpg' },
    { url: 'https://loremflickr.com/500/500/sparkplug', dest: 'images/products/spark-plug.jpg' },
    { url: 'https://loremflickr.com/500/500/suspension,car', dest: 'images/products/strut_mount.jpg' },
    { url: 'https://loremflickr.com/500/500/brake,disc', dest: 'images/products/brake_rotor.jpg' },
    { url: 'https://loremflickr.com/500/500/fog,car', dest: 'images/products/fog_lamps.jpg' }
];

function download(url, dest, redirects = 0) {
    if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
    return new Promise((resolve, reject) => {
        const req = (url.startsWith('https') ? https : http).get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redir = res.headers.location.startsWith('http') ? res.headers.location : `https://${new URL(url).host}${res.headers.location}`;
                resolve(download(redir, dest, redirects + 1));
            } else if (res.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else {
                reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
            }
        });
        req.on('error', reject);
    });
}

Promise.all(downloads.map(d => download(d.url, d.dest).then(() => console.log('Done ' + d.dest)).catch(console.error))).then(() => console.log('All downloads finished'));
