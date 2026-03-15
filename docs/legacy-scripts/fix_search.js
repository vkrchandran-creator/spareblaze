const fs = require('fs');
let h = fs.readFileSync('search.html', 'utf8');

// Fix 1: Wrap page-header in nav-container div for proper alignment
h = h.replace(
    /<header class="page-header">[\s\S]*?<\/header>/,
    '<header class="page-header">\n        <div class="nav-container">\n            <h1>Search <span class="highlight">Results</span></h1>\n            <div class="search-results-meta">Showing results for <span class="search-term">&quot;Brake Parts&quot;</span> (<strong id="product-count">8</strong> Items Found)</div>\n        </div>\n    </header>'
);

// Fix 2: Clean up the extra-indented aside tag
h = h.replace(/\s{16,}<aside class="sidebar-filters">/, '\n        <aside class="sidebar-filters">');

fs.writeFileSync('search.html', h);
console.log('search.html alignment fixed!');
