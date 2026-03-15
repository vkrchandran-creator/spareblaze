const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => { });
                return reject(new Error('HTTP ' + res.statusCode));
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(fs.statSync(dest).size); });
        }).on('error', reject);
    });
}

async function fix391() {
    const fallbackUrl = 'https://spareblaze.com/wp-content/uploads/2025/07/b3-270x270.jpg';
    const dest = path.join(__dirname, 'after-market-parts', 'images', 'am_prod_391.jpg');
    const oldPath = path.join(__dirname, 'after-market-parts', 'images', 'am_prod_391.png');
    if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('Removed broken am_prod_391.png');
    }

    const size = await downloadFile(fallbackUrl, dest);
    console.log('Downloaded fallback: ' + size + ' bytes -> am_prod_391.jpg');

    let html = fs.readFileSync(path.join(__dirname, 'after-market.html'), 'utf8');
    const before = html.match(/am_prod_391\.png/g)?.length || 0;
    html = html.replace(/am_prod_391\.png/g, 'am_prod_391.jpg');
    const after = html.match(/am_prod_391\.jpg/g)?.length || 0;
    fs.writeFileSync(path.join(__dirname, 'after-market.html'), html, 'utf8');
    console.log('Updated after-market.html: changed ' + before + ' -> ' + after + ' references');
}

fix391().catch(e => console.error('Error:', e.message));
