/**
 * products-loader.js
 * Dynamically loads products from the SpareBlaze backend API and replaces
 * the static product grid on category listing pages.
 *
 * Works alongside filter.js — rendered cards carry the same data-* attributes
 * so the existing client-side filter/sort logic continues to work unchanged.
 */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────

  const API_BASE = (function () {
    var h = window.location.hostname;
    return (h === 'localhost' || h === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://api.spareblaze.com';
  }());

  var PAGE_LIMIT = 24; // products per API page

  /** Map page filename → category slug in the DB */
  var PAGE_FILTER_MAP = {
    'after-market': { type: 'aftermarket', badge: 'After Market' },
    'oem':          { type: 'oem', badge: 'OEM' },
    'used':         { condition: 'used', badge: 'Used' },
    'wholesale':    { pricing_model: 'wholesale', badge: 'Wholesale' },
    'refurbished':  { condition: 'refurbished', badge: 'Refurbished' },
  };

  // Detect which category this page belongs to
  var pageConfig = (function () {
    var file = window.location.pathname.replace(/\\/g, '/').split('/').pop().replace('.html', '');
    return PAGE_FILTER_MAP[file] || null;
  }());

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function fmtPrice(n) {
    return '₹' + parseFloat(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  function imgSrc(images) {
    if (!images || !images.length) return 'https://dummyimage.com/400x300/ececec/333&text=No+Image';
    var src = images[0];
    // absolute URL → use as-is; relative path → prefix with public folder
    return src.startsWith('http') ? src : ('../public/' + src.replace(/^\//, ''));
  }

  function vehicleAttr(compatibleVehicles) {
    if (!compatibleVehicles) return '';
    try {
      var cv = typeof compatibleVehicles === 'string' ? JSON.parse(compatibleVehicles) : compatibleVehicles;
      if (Array.isArray(cv)) return cv.map(function (v) { return (v.make || v.brand || String(v)).toLowerCase(); }).join(' ');
      if (typeof cv === 'object') return Object.values(cv).join(' ').toLowerCase();
    } catch (_) {}
    return String(compatibleVehicles).toLowerCase();
  }

  function badgeLabel(cat) {
    return (pageConfig && pageConfig.badge) || (cat && cat.name) || 'Part';
  }

  // ── Card HTML ────────────────────────────────────────────────────────────────

  function buildCard(p) {
    var img      = imgSrc(p.images);
    var price    = parseFloat(p.price)   || 0;
    var mrp      = parseFloat(p.mrp)     || price;
    var disc     = p.discountPercent     || 0;
    var inStock  = p.inventory && p.inventory.quantity > 0;
    var vehicles = vehicleAttr(p.compatibleVehicles);
    var brandName = (p.brandRef && p.brandRef.name) || p.brand || '';
    var detailUrl = 'product.html?id=' + encodeURIComponent(p.slug || p.id || p.title);

    return '<div class="product-card"' +
      ' data-price="'    + price.toFixed(2)    + '"' +
      ' data-discount="' + disc                + '"' +
      ' data-vehicles="' + (vehicles || brandName.toLowerCase()) + '"' +
      ' data-fast-delivery="' + (inStock ? 'true' : 'false') + '">' +

      '<div class="product-img-wrap">' +
        '<span class="product-badge">' + badgeLabel(p.category) + '</span>' +
        '<a href="' + detailUrl + '">' +
          '<img src="' + img + '" alt="' + p.title.replace(/"/g, '&quot;') + '" loading="lazy"' +
          ' onerror="this.src=\'https://dummyimage.com/400x300/ececec/333&text=No+Image\'">' +
        '</a>' +
      '</div>' +

      '<div class="product-info">' +
        (brandName ? '<div class="product-brand">' + brandName + '</div>' : '') +
        '<h3 class="product-title">' + p.title + '</h3>' +

        '<div class="prod-price-area" style="margin-top:.5rem;margin-bottom:.5rem">' +
          '<span class="price-current" style="font-size:1.25rem;font-weight:700;color:var(--color-primary)">' + fmtPrice(price) + '</span>' +
          (mrp > price
            ? '<span class="price-mrp" style="font-size:.9rem;text-decoration:line-through;color:var(--color-text-muted);margin-left:.5rem">' + fmtPrice(mrp) + '</span>'
            : '') +
          (disc > 0
            ? '<span class="product-discount" style="font-size:.8rem;color:#16a34a;font-weight:600;margin-left:.4rem">' + disc + '% off</span>'
            : '') +
        '</div>' +

        '<div class="product-compatibility">' +
          '<i class="fa-solid fa-circle-' + (inStock ? 'check' : 'xmark') + '"></i> ' +
          (inStock ? 'In Stock \u2013 Ships in 24hrs' : 'Out of Stock') +
        '</div>' +

        '<div class="product-actions">' +
          '<a href="' + detailUrl + '" class="btn view-details-btn"><i class="fa-solid fa-eye"></i> View Details</a>' +
          '<button class="btn btn-primary add-cart-btn"' +
            ' onclick="addToCart({id:\'' + p.id + '\',title:' + JSON.stringify(p.title) + ',price:' + price + ',mrp:' + mrp + ',img:' + JSON.stringify(img) + '})">' +
            '<i class="fa-solid fa-cart-plus"></i> Add to Cart' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ── State ────────────────────────────────────────────────────────────────────

  var state = {
    page:        1,
    totalPages:  1,
    total:       0,
    loading:     false,
  };

  var activeFilters = {
    minPrice: null,
    maxPrice: null,
    brands: [],
    type: [],
    condition: [],
    pricing_model: [],
    minDiscount: 0,
    inStock: false,
    sortLabel: 'Best Match',
    q: ''
  };

  // ── DOM refs (set after DOMContentLoaded) ────────────────────────────────────

  var grid, countEl, loadMoreBtn;

  function mapSortValue(label) {
    if (label === 'Price: Low to High') return 'price_asc';
    if (label === 'Price: High to Low') return 'price_desc';
    if (label === 'Discount') return 'discount_desc';
    return 'newest';
  }

  function buildUrl(page) {
    var params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_LIMIT));
    params.set('sort', mapSortValue(activeFilters.sortLabel));

    if (activeFilters.minPrice !== null && activeFilters.minPrice !== undefined) {
      params.set('minPrice', String(activeFilters.minPrice));
    }

    if (activeFilters.maxPrice !== null && activeFilters.maxPrice !== undefined) {
      params.set('maxPrice', String(activeFilters.maxPrice));
    }

    if (activeFilters.brands && activeFilters.brands.length) {
      params.set('brands', activeFilters.brands.join(','));
    }

    if (activeFilters.type && activeFilters.type.length) {
      params.set('type', activeFilters.type.join(','));
    }

    if (activeFilters.condition && activeFilters.condition.length) {
      params.set('condition', activeFilters.condition.join(','));
    }

    if (activeFilters.pricing_model && activeFilters.pricing_model.length) {
      params.set('pricing_model', activeFilters.pricing_model.join(','));
    }

    if (activeFilters.minDiscount) {
      params.set('minDiscount', String(activeFilters.minDiscount));
    }

    if (activeFilters.inStock) {
      params.set('inStock', 'true');
    }

    if (activeFilters.q) {
      params.set('q', activeFilters.q);
    }

    if (pageConfig) {
      Object.keys(pageConfig).forEach(function (key) {
        if (key !== 'badge') params.set(key, pageConfig[key]);
      });
    }

    return API_BASE + '/api/v1/products?' + params.toString();
  }

  function resetAndFetch(filters) {
    activeFilters = Object.assign({}, activeFilters, filters || {});
    state.page = 1;
    state.totalPages = 1;
    state.total = 0;
    showSkeleton();
    fetchPage(1);
  }

  // ── Fetch ────────────────────────────────────────────────────────────────────

  function fetchPage(page) {
    if (state.loading) return;
    state.loading = true;
    if (loadMoreBtn) { loadMoreBtn.disabled = true; loadMoreBtn.textContent = 'Loading…'; }

    var url = buildUrl(page);

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (!json.success) throw new Error(json.message || 'API error');

        var products = json.data || [];
        var pg       = json.pagination || {};

        state.page       = pg.page       || page;
        state.totalPages = pg.totalPages || 1;
        state.total      = pg.total      || products.length;
        renderProducts(products);
        updateCount();
        renderPagination();

      })
      .catch(function (err) {
        console.warn('[products-loader] API fetch failed, keeping static content.', err);
        // On error: leave static products in place and don't show load-more
        restoreStatic();
      })
      .finally(function () {
        state.loading = false;
        if (loadMoreBtn) { loadMoreBtn.disabled = false; loadMoreBtn.textContent = 'Load More Products'; }
      });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  function renderProducts(products) {
    if (state.page === 1) {
      grid.innerHTML = '';
    }

    if (!products.length && state.page === 1) {
      grid.innerHTML = '<div class="empty-cart-msg" style="grid-column:1/-1;text-align:center;padding:2rem 1rem">No products found in this category.</div>';
      return;
    }

    products.forEach(function (p) {
      grid.insertAdjacentHTML('beforeend', buildCard(p));
    });
  }

  function updateCount() {
    if (countEl) countEl.textContent = state.total;
  }

  function renderPagination() {
    if (!loadMoreBtn) return;
    loadMoreBtn.style.display = state.page < state.totalPages ? 'block' : 'none';
  }

  // ── Skeleton loader while waiting for API ────────────────────────────────────

  function showSkeleton() {
    var skeletons = '';
    for (var i = 0; i < 8; i++) {
      skeletons += '<div class="product-card" style="pointer-events:none;opacity:.6">' +
        '<div class="product-img-wrap" style="background:#e5e7eb;height:200px;border-radius:8px"></div>' +
        '<div class="product-info">' +
          '<div style="background:#e5e7eb;height:14px;border-radius:4px;margin:.6rem 0;width:40%"></div>' +
          '<div style="background:#e5e7eb;height:16px;border-radius:4px;margin:.4rem 0"></div>' +
          '<div style="background:#e5e7eb;height:16px;border-radius:4px;margin:.4rem 0;width:75%"></div>' +
          '<div style="background:#e5e7eb;height:22px;border-radius:4px;margin:.8rem 0;width:35%"></div>' +
        '</div>' +
      '</div>';
    }
    grid.innerHTML = skeletons;
  }

  // When API fails: put static content back (it was saved before clearing)
  var staticBackup = '';
  function restoreStatic() {
    if (staticBackup && grid) {
      grid.innerHTML = staticBackup;
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    if (!pageConfig) return; // not a recognized catalog listing page

    grid    = document.querySelector('.prod-grid') || document.querySelector('.products-grid');
    countEl = document.querySelector('.catalog-header strong') || document.getElementById('product-count');

    if (!grid) return;

    // Save static markup as fallback (in case API is down)
    staticBackup = grid.innerHTML;

    // Inject "Load More" button after the grid
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Load More Products';
    loadMoreBtn.className   = 'btn btn-outline';
    loadMoreBtn.style.cssText = 'display:none;margin:2rem auto;padding:.75rem 2rem;font-size:1rem;border-radius:8px;cursor:pointer;';
    loadMoreBtn.addEventListener('click', function () {
      fetchPage(state.page + 1);
    });
    grid.parentNode.insertBefore(loadMoreBtn, grid.nextSibling);

    window.SB_DB_PRODUCTS_LOADER = {
      refresh: resetAndFetch
    };

    document.addEventListener('sb:product-filters-change', function (event) {
      resetAndFetch(event.detail || {});
    });

    // Clear static content and show skeleton while API loads
    showSkeleton();
    fetchPage(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
