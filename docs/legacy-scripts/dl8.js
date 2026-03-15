const fs = require('fs');
const https = require('https');

async function searchUnsplash(query) {
    return new Promise((resolve) => {
        const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.results && json.results.length > 0) {
                        resolve(json.results[0].urls.regular);
                    } else resolve(null);
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

const targets = [
    { name: 'timing-belt.jpg', query: 'engine belt' },
    { name: 'cabin-filter.jpg', query: 'car air filter' },
    { name: 'headlamp.jpg', query: 'car headlight bulb' },
    { name: 'spark-plug.jpg', query: 'spark plug' },
    { name: 'strut_mount.jpg', query: 'car suspension' },
    { name: 'brake_rotor.jpg', query: 'disc brake' },
    { name: 'fog_lamps.jpg', query: 'car fog lights' }
];

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
    });
}

async function run() {
    for (let t of targets) {
        let imgUrl = await searchUnsplash(t.query);
        if (imgUrl) {
            console.log(`Downloading ${t.name} from ${imgUrl}`);
            await downloadFile(imgUrl, `images/products/${t.name}`);
        } else {
            console.log(`Failed to find image for ${t.query}`);
        }
    }
}
run();
