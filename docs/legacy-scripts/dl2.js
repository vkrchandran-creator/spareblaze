const fs = require('fs');
const https = require('https');

const downloads = [
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=RENAULT', dest: 'images/renault.png' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=JEEP', dest: 'images/jeep.png' },
    { url: 'https://dummyimage.com/150x150/ffffff/e63900&text=MG', dest: 'images/mg.png' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else reject();
        }).on('error', reject);
    });
}
Promise.all(downloads.map(d => downloadFile(d.url, d.dest))).then(() => console.log('Done'));
