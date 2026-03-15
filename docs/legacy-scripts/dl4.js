const fs = require('fs');
const https = require('https');

const downloads = [
    { url: 'https://images.unsplash.com/photo-1549495765-b169ca0f33d7?w=500&q=80', dest: 'images/products/fog_lamps.jpg' },
    { url: 'https://images.unsplash.com/photo-1635334701257-227ae1fdb853?w=500&q=80', dest: 'images/products/strut_mount.jpg' },
    { url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500&q=80', dest: 'images/products/brake_rotor.jpg' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
            }
        };
        https.get(url, options, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else reject(new Error(`Failed ${response.statusCode}`));
        });
    });
}
Promise.all(downloads.map(d => downloadFile(d.url, d.dest).catch(console.error))).then(() => console.log('Done'));
