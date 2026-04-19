const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../../frontend/pages/admin/index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Add 'DB Vehicles' nav item
if (!html.includes('db-vehicles')) {
  html = html.replace(
    /<div class="nav-item" onclick="showPanel\('db-products'\)"><i class="fa-solid fa-database"><\/i> DB Products<\/div>/,
    `<div class="nav-item" onclick="showPanel('db-vehicles')"><i class="fa-solid fa-car"></i> DB Vehicles</div>
        <div class="nav-item" onclick="showPanel('db-products')"><i class="fa-solid fa-database"></i> DB Products</div>`
  );
}

// 2. Add 'DB Vehicles' Panel
if (!html.includes('id="panel-db-vehicles"')) {
  const vehiclePanel = `
      <!-- ══════ DB VEHICLES ══════ -->
      <div class="panel" id="panel-db-vehicles">
        <div class="topbar">
          <h1><i class="fa-solid fa-car" style="color:var(--primary)"></i> DB Vehicles</h1>
        </div>
        <div class="card">
          <h3>Vehicle Brands</h3>
          <table class="prod-table">
            <thead><tr><th>ID</th><th>Name</th><th>Slug</th><th>Status</th></tr></thead>
            <tbody id="db-vehicle-brands-tbody"></tbody>
          </table>
        </div>
        <div class="card">
          <h3>Vehicle Models</h3>
          <table class="prod-table">
            <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Slug</th></tr></thead>
            <tbody id="db-vehicle-models-tbody"></tbody>
          </table>
        </div>
      </div>
  `;
  html = html.replace(/<!-- ══════ DB PRODUCTS ══════ -->/, vehiclePanel + '\n      <!-- ══════ DB PRODUCTS ══════ -->');
}

// 3. Update Product Form (Part Numbers & File Upload & Compat Vehicles)
// We will replace the Images <tr> and maybe insert Part Numbers and Compatibility.
if (!html.includes('db-prod-partNumbers')) {
  html = html.replace(
    /<tr><td>Condition<\/td><td><select id="db-prod-condition".*?<\/select><\/td><\/tr>/,
    `<tr><td>Condition</td><td><select id="db-prod-condition"><option value="new">New</option><option value="used">Used</option><option value="refurbished">Refurbished</option></select></td></tr>
              <tr><td>Part Numbers</td><td><input type="text" id="db-prod-partNumbers" placeholder="Comma separated"></td></tr>
              <tr><td>Compatible Vehicles</td><td><select id="db-prod-compatibility" multiple style="height: 80px;"></select></td></tr>`
  );
}

if (!html.includes('id="db-prod-image-upload"')) {
  html = html.replace(
    /<tr><td style="vertical-align: top; padding-top: 1rem;">Images \(JSON\)<\/td><td><textarea id="db-prod-images" rows="3" placeholder="\[.*?\]"><\/textarea><\/td><\/tr>/g,
    `<tr>
                <td style="vertical-align: top; padding-top: 1rem;">Images</td>
                <td>
                  <input type="file" id="db-prod-image-upload" multiple accept="image/*" style="margin-bottom: 0.5rem">
                  <div id="db-prod-image-preview" style="display:flex;gap:0.5rem;flex-wrap:wrap;"></div>
                  <input type="hidden" id="db-prod-images">
                </td>
              </tr>`
  );
}

fs.writeFileSync(file, html);
console.log('patched index.html successfully!');
