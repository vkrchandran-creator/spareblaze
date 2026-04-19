const fs = require('fs');
const html = fs.readFileSync('../frontend/pages/admin/index.html', 'utf8');
const idx = html.indexOf('id="prod-modal-overlay"');
console.log('Modal structure:', html.substring(idx - 10, idx + 1000));
