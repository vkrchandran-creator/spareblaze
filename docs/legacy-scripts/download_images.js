const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const productsDir = path.join(__dirname, 'images', 'products');
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                fs.unlink(dest, () => { });
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); console.log('Downloaded: ' + path.basename(dest)); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
    });
}

// Use Wikimedia / public domain SVG-based brand logos via clearbit or brandfetch-like APIs
// Using Wikipedia-hosted SVG images (public domain / fair use for commercial car brands)
const brandLogos = [
    { name: 'maruti.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Maruti_Suzuki_Logo.svg/320px-Maruti_Suzuki_Logo.svg.png' },
    { name: 'hyundai.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/320px-Hyundai_Motor_Company_logo.svg.png' },
    { name: 'tata.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Tata_logo.svg/320px-Tata_logo.svg.png' },
    { name: 'honda.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/320px-Honda.svg.png' },
    { name: 'toyota.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/320px-Toyota_carlogo.svg.png' },
    { name: 'kia.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/320px-Kia-logo.svg.png' },
    { name: 'ford.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/320px-Ford_logo_flat.svg.png' },
    { name: 'vw.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/320px-Volkswagen_logo_2019.svg.png' },
    { name: 'renault.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/g/g7/Renault_2021_Text.svg/320px-Renault_2021_Text.svg.png' },
    { name: 'skoda.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Skoda_logo_2016.svg/320px-Skoda_logo_2016.svg.png' },
    { name: 'nissan.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nissan_2020_logo.svg/320px-Nissan_2020_logo.svg.png' },
    { name: 'chevrolet.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Chevrolet_logo.svg/320px-Chevrolet_logo.svg.png' },
    { name: 'fiat.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/FIAT_logo.png/320px-FIAT_logo.png' },
    { name: 'jeep.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Jeep_logo.svg/320px-Jeep_logo.svg.png' },
    { name: 'mg.webp', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MG_Cars_logo.svg/320px-MG_Cars_logo.svg.png' },
];

// Real product thumbnail images from Unsplash
const productImages = [
    { name: 'oil-filter.jpg', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=300&fit=crop' },
    { name: 'air-filter.jpg', url: 'https://images.unsplash.com/photo-1591439657848-9f4b9ce436b9?w=300&h=300&fit=crop' },
    { name: 'brake-pads.jpg', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&h=300&fit=crop' },
    { name: 'shock-absorber.jpg', url: 'https://images.unsplash.com/photo-1506450692794-5a6390a8a6be?w=300&h=300&fit=crop' },
    { name: 'spark-plug.jpg', url: 'https://images.unsplash.com/photo-1616782296568-7d8dc8ea862b?w=300&h=300&fit=crop' },
    { name: 'timing-belt.jpg', url: 'https://images.unsplash.com/photo-1542289659-1e5f8f309a63?w=300&h=300&fit=crop' },
    { name: 'headlamp.jpg', url: 'https://images.unsplash.com/photo-1510903328227-f98b672f0f8c?w=300&h=300&fit=crop' },
    { name: 'cabin-filter.jpg', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=300&fit=crop' },
];

async function main() {
    const all = [
        ...brandLogos.map(b => ({ url: b.url, dest: path.join(imagesDir, b.name) })),
        ...productImages.map(p => ({ url: p.url, dest: path.join(productsDir, p.name) })),
    ];
    for (const item of all) {
        try {
            await download(item.url, item.dest);
        } catch (e) {
            console.error('Failed:', item.dest, e.message);
        }
    }
    console.log('All downloads complete!');
}
main();
