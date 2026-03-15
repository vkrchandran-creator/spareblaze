const fs = require('fs');
const https = require('https');

const missing = [
    'used.webp', 'wholesale.webp', 'switches.webp', 'head-lights.webp',
    'steering-wheel.webp', 'universal.webp', 'xylo.webp', 'swift.webp',
    'maruti-suzuki.webp', 'porsche.webp', 'braking-system.webp', 'wagon-r.webp',
    'jaguar.webp', 's-presso.webp', 'chevrolet-cruze.webp'
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

Promise.all(missing.map(filename => {
    const text = filename.replace('.webp', '').toUpperCase();
    const url = `https://dummyimage.com/150x150/ffffff/e63900.png&text=${text}`;
    return downloadFile(url, `images/${filename}`).catch(console.error);
})).then(() => console.log('Done'));
