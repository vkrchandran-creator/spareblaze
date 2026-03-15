const fs = require('fs');
const path = require('path');

const brandsToFetch = [
    { name: 'mahindra.png', query: 'File:Mahindra Auto.png' },
    { name: 'maruti-suzuki.png', query: 'File:Maruti_Suzuki_Logo.svg' },
    { name: 'hyundai.png', query: 'File:Hyundai_Motor_Company_logo.svg' },
    { name: 'kia.png', query: 'File:Kia_logo_2021.svg' },
    { name: 'nissan.png', query: 'File:Nissan_2020_logo.svg' },
    { name: 'toyota.png', query: 'File:Toyota_logo.svg' },
    { name: 'ford.png', query: 'File:Ford_Motor_Company_Logo.svg' },
    { name: 'mg.png', query: 'File:MG_logo.svg' },
    { name: 'renault.png', query: 'File:Renault_2021_logo.svg' },
    { name: 'skoda.png', query: 'File:Skoda_Auto_logo_(2022).svg' }
];

const imagesDir = path.join('d:', 'Ram', 'spareblaze.com', 'images');

const USER_AGENT = 'SpareblazeLogoUpdater/1.0 (contact@spareblaze.com)';

async function getImageUrl(filename) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&urlwidth=512&format=json`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === '-1' || !pages[pageId].imageinfo) {
            return null;
        }
        // Use thumburl if available (requested width), else fallback to full url
        return pages[pageId].imageinfo[0].thumburl || pages[pageId].imageinfo[0].url;
    } catch (err) {
        console.error(`Error querying API for ${filename}:`, err.message);
        return null;
    }
}

async function download(url, dest) {
    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
    });

    if (!res.ok) {
        throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`Downloaded ${path.basename(dest)}`);
}

async function main() {
    for (const brand of brandsToFetch) {
        const dest = path.join(imagesDir, brand.name);
        try {
            console.log(`Fetching URL for ${brand.name}...`);
            let url = await getImageUrl(brand.query);

            if (!url) {
                // Try Commons API if En Wiki fails
                const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(brand.query)}&prop=imageinfo&iiprop=url&urlwidth=512&format=json`;
                const commonsRes = await fetch(commonsUrl, { headers: { 'User-Agent': USER_AGENT } });
                const commonsData = await commonsRes.json();
                const pages = commonsData.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== '-1' && pages[pageId].imageinfo) {
                    url = pages[pageId].imageinfo[0].thumburl || pages[pageId].imageinfo[0].url;
                }
            }

            if (url) {
                console.log(`Downloading from ${url}...`);
                await download(url, dest);
            } else {
                console.log(`Could not find image URL for ${brand.query}`);
            }
            // Delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error(`Failed ${brand.name}:`, err.message);
        }
    }
}

main();
