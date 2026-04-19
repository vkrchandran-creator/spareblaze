const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../../frontend/pages/product.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Extend normalizeApiProduct to keep raw data arrays
if (!html.includes('apiProduct.partNumbers')) {
  html = html.replace(`partNo: apiProduct.sku || apiProduct.slug || apiProduct.id,`, `partNo: apiProduct.sku || apiProduct.slug || apiProduct.id,
                    partNumbers: apiProduct.partNumbers || [],
                    compatibleVehicles: apiProduct.compatibleVehicles || [],
                    allImages: apiProduct.images || [],`);
}

if (!html.includes('p.partNumbers')) {
  // Make sure we carry them over if falling back to URL/dummy data
  html = html.replace(`p.partNo = p.partNo || 'SB-'`, `p.partNumbers = p.partNumbers || (p.partNo ? [p.partNo] : []);
                p.compatibleVehicles = p.compatibleVehicles || [];
                p.allImages = p.allImages && p.allImages.length ? p.allImages : [p.img];
                p.partNo = p.partNo || 'SB-'`);
}

// 2. Inject part numbers and fitment logic
if (!html.includes('// Populating Arrays UI')) {
   html = html.replace(`// Specs`, `
            // Populating Arrays UI
            if (p.partNumbers && p.partNumbers.length) {
                document.getElementById('spec-part-no').innerHTML = p.partNumbers.map(n => \`<span style="background:var(--bg-hover);padding:0.1rem 0.4rem;border-radius:4px;margin:2px;display:inline-block;">\${n}</span>\`).join('');
            } else {
                document.getElementById('spec-part-no').textContent = p.partNo || 'N/A';
            }
            
            const fTbody = document.getElementById('fitment-tbody');
            if (fTbody && p.compatibleVehicles && p.compatibleVehicles.length) {
                fTbody.innerHTML = p.compatibleVehicles.map(v => \`<tr>
                    <td>\${v.brand || 'Universal'}</td>
                    <td>\${v.model || v.name || '-'}</td>
                    <td>All</td>
                    <td>Any</td>
                    <td>Any</td>
                </tr>\`).join('');
            } else if(fTbody) {
                fTbody.innerHTML = \`<tr><td colspan="5" style="text-align:center;color:var(--muted)">Universal Fitment / No specific vehicle mapped</td></tr>\`;
            }
            
            // Multiple Images
            if (p.allImages && p.allImages.length > 0) {
                 const strip = document.querySelector('.thumbnail-strip');
                 if(strip) {
                    strip.innerHTML = p.allImages.map((img, i) => \`<div class="thumb-box \${i===0?'active':''}"><img id="thumb-\${i+1}" src="\${img}" alt="Thumb \${i+1}"></div>\`).join('');
                    const thumbs = document.querySelectorAll('.thumb-box');
                    thumbs.forEach(thumb => {
                        thumb.addEventListener('click', function () {
                            thumbs.forEach(t => t.classList.remove('active'));
                            this.classList.add('active');
                            document.getElementById('main-product-img').src = this.querySelector('img').src;
                        });
                    });
                 }
            }

            // Specs`);
}

// Remove old thumb listener since we duplicate it above securely against real arrays
if (html.includes('// Thumbnails')) {
   html = html.replace(/\/\/ Thumbnails[\s\S]*?\/\/ Cart Actions/, '// Cart Actions');
}

fs.writeFileSync(file, html);
console.log('patched product.html');
