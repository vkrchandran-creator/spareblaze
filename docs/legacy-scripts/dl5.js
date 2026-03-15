const fs = require('fs');
const https = require('https');

const downloads = [
    { url: 'https://dummyimage.com/400x300/ececec/000000.png&text=Fog+Lamps', dest: 'images/products/fog_lamps.jpg' },
    { url: 'https://dummyimage.com/400x300/ececec/000000.png&text=Strut+Mount', dest: 'images/products/strut_mount.jpg' },
    { url: 'https://dummyimage.com/400x300/ececec/000000.png&text=Brake+Rotor', dest: 'images/products/brake_rotor.jpg' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };
        https.get(url, options, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else reject(new Error(`Failed ${response.statusCode}`));
        });
    });
}
Promise.all(downloads.map(d => downloadFile(d.url, d.dest).catch(console.error))).then(() => console.log('Done'));
