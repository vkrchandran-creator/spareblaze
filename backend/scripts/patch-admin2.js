const fs = require('fs');
const path = require('path');

const jsFile = path.join(__dirname, '../../frontend/js/admin/admin.js');
let jsAdmin = fs.readFileSync(jsFile, 'utf8');

// Append vehicle loader logic if missing
if (!jsAdmin.includes('async function dbLoadVehicles')) {
  jsAdmin += `
async function dbLoadVehicles() {
    try {
        const brandsRes = await apiGet('/api/v1/vehicles/brands');
        const modelsRes = await apiGet('/api/v1/vehicles/models');
        
        window.dbVehBrands = brandsRes.data || [];
        window.dbVehModels = modelsRes.data || [];
        
        const bTbody = document.getElementById('db-vehicle-brands-tbody');
        if (bTbody) {
            bTbody.innerHTML = window.dbVehBrands.map(b => \`<tr><td>\${b.id}</td><td>\${b.name}</td><td>\${b.slug}</td><td>\${b.isActive?'Yes':'No'}</td></tr>\`).join('');
        }
        
        const mTbody = document.getElementById('db-vehicle-models-tbody');
        if (mTbody) {
            mTbody.innerHTML = window.dbVehModels.map(m => \`<tr><td>\${m.id}</td><td>\${m.name}</td><td>\${m.brand?.name}</td><td>\${m.slug}</td></tr>\`).join('');
        }
    } catch(e) {
        showToast('Error loading vehicles: '+e.message);
    }
}
`;
}

// Add vehicle hook to panel loader
if (!jsAdmin.includes(`if (name === 'db-vehicles')`)) {
  jsAdmin = jsAdmin.replace(`if (name === 'db-inventory')`, `
    if (name === 'db-vehicles') {
        if (!getToken()) { showLoginOverlay(); return; }
        dbLoadVehicles();
    }
    if (name === 'db-inventory')`);
}

// Patch Product modal open function to populate vehicles
if (!jsAdmin.includes(`// Load vehicle multi-select`)) {
    jsAdmin = jsAdmin.replace(`document.getElementById('pm-sku').value   = p.sku || '';`, `
        document.getElementById('pm-sku').value   = p.sku || '';
        document.getElementById('db-prod-partNumbers').value = p.partNumbers ? p.partNumbers.join(', ') : '';
        
        // Load vehicle multi-select
        const vSelect = document.getElementById('db-prod-compatibility');
        if (vSelect && window.dbVehBrands) {
           vSelect.innerHTML = window.dbVehBrands.map(b => {
               const models = window.dbVehModels.filter(m => m.brandId === b.id);
               return \`<optgroup label="\\$\\{b.name\\}">\` + models.map(m => \`<option value="\\$\\{m.id\\}">\\$\\{m.name\\}</option>\`).join('') + \`</optgroup>\`;
           }).join('');
           
           if(p.compatibleVehicles) {
               const savedIds = p.compatibleVehicles.map(cv => cv.id);
               Array.from(vSelect.options).forEach(opt => {
                   opt.selected = savedIds.includes(opt.value);
               });
           }
        }
        
        // populate uploaded images UI
        const imagePreview = document.getElementById('db-prod-image-preview');
        if (imagePreview && p.images && p.images.length) {
             imagePreview.innerHTML = p.images.map(img => \`<img src="\\$\\{img\\}" style="height:40px;width:40px;object-fit:cover;border-radius:4px">\`).join('');
             document.getElementById('db-prod-images').value = JSON.stringify(p.images);
        } else if(imagePreview) { imagePreview.innerHTML = ''; document.getElementById('db-prod-images').value = '[]'; }
    `);
}

// Patch save payload
if (!jsAdmin.includes(`partNumbers:`)) {
   jsAdmin = jsAdmin.replace(/const body   = {[\s\S]*?;/, `
    const pnString = document.getElementById('db-prod-partNumbers').value.trim();
    const partNumbers = pnString ? pnString.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const vSelect = document.getElementById('db-prod-compatibility');
    const compatibleVehicles = vSelect ? Array.from(vSelect.selectedOptions).map(o=>o.value) : [];
    const imagesJson = document.getElementById('db-prod-images').value;
    let finalImages = [];
    try { finalImages = JSON.parse(imagesJson); } catch(e) {}
    
    // Check if new images were uploaded
    const uploadInput = document.getElementById('db-prod-image-upload');
    if (uploadInput && uploadInput.files.length > 0) {
        const formData = new FormData();
        Array.from(uploadInput.files).forEach(f => formData.append('images', f));
        try {
            const upRes = await fetch('/api/v1/upload', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + getToken() },
                body: formData
            });
            const j = await upRes.json();
            if(j.success) {
               finalImages = [...finalImages, ...j.data.urls];
            }
        } catch(e) {
            console.error('Upload failed', e);
        }
    }
    if (finalImages.length === 0 && imgVal) finalImages = [imgVal];

    $&`);
    
    jsAdmin = jsAdmin.replace(`images:          imgVal ? [imgVal] : [],`, `images: finalImages, partNumbers, compatibleVehicles,`);
}

fs.writeFileSync(jsFile, jsAdmin);
console.log('patched admin.js successfully!');
