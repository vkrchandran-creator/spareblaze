(function () {
    'use strict';

    var searchDebounceTimer = null;

    /* ─── Helpers ──────────────────────────────────────────── */

    function getFilterGroup(headingText) {
        let found = null;
        document.querySelectorAll('.sidebar-filters .filter-group').forEach(function (group) {
            const h4 = group.querySelector('h4');
            if (h4 && h4.textContent.trim().toLowerCase().includes(headingText.toLowerCase())) {
                found = group;
            }
        });
        return found;
    }

    function getLabelText(input) {
        const label = input.closest('label');
        if (!label) return '';
        // textContent includes child element text; inputs have no text, icons have none either
        return label.textContent.trim().toLowerCase();
    }

    function getApiBase() {
        var configured = window.BACKEND_URL || window.API_BASE;
        if (configured) return String(configured).replace(/\/$/, '');
        var host = window.location.hostname;
        return (host === 'localhost' || host === '127.0.0.1') ? 'http://localhost:5000' : '';
    }

    async function hydrateBrandFilters() {
        var group = getFilterGroup('Vehicle Brand');
        if (!group) return;

        try {
            var response = await fetch(getApiBase() + '/api/v1/products/brands');
            var payload = await response.json();
            if (!response.ok || !payload.success) return;

            var brands = Array.isArray(payload.data) ? payload.data : [];
            if (!brands.length) return;

            var title = group.querySelector('h4');
            group.innerHTML = '';
            if (title) group.appendChild(title);

            brands.forEach(function (brand) {
                var brandName = (brand && brand.name) ? String(brand.name).trim() : '';
                if (!brandName) return;

                var label = document.createElement('label');
                label.className = 'filter-option';
                label.innerHTML = '<input type="checkbox" value="' + brandName.replace(/"/g, '&quot;') + '"> ' + brandName;
                group.appendChild(label);
            });

            bindSidebarFilterInputs();
        } catch (_err) {
            // Keep static fallback brands if API is unavailable.
        }
    }

    /* ─── Read active filter values ───────────────────────── */

    function getActivePriceRange() {
        const checked = document.querySelector('input[name="price"]:checked');
        if (!checked) return null;
        const text = getLabelText(checked);
        if (text.includes('under') || text.includes('1,000') && text.includes('under')) {
            return { min: 0, max: 999.99 };
        }
        if (text.includes('over') || text.includes('10,000') && text.includes('over')) {
            return { min: 10000, max: Infinity };
        }
        // "₹1,000 – ₹10,000"
        return { min: 1000, max: 10000 };
    }

    function getSelectedBrands() {
        const group = getFilterGroup('Vehicle Brand');
        if (!group) return [];
        const brands = [];
        group.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
            brands.push((cb.value || getLabelText(cb)).trim());
        });
        return brands;
    }

    function getCheckedValues(headingText) {
        const group = getFilterGroup(headingText);
        if (!group) return [];
        const values = [];
        group.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
            values.push((cb.value || getLabelText(cb)).trim());
        });
        return values;
    }

    function getSelectedDiscountMin() {
        const group = getFilterGroup('Discount');
        if (!group) return 0;
        let min = 0;
        group.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
            const match = getLabelText(cb).match(/(\d+)%/);
            if (match) {
                const val = parseInt(match[1], 10);
                if (min === 0 || val < min) min = val; // show products meeting the lowest ticked threshold
            }
        });
        return min;
    }

    function isFastDeliveryOn() {
        const group = getFilterGroup('Fulfilled');
        if (!group) return false;
        const cb = group.querySelector('input[type="checkbox"]');
        return cb ? cb.checked : false;
    }

    function getSearchTerm() {
        const desktopSearch = document.getElementById('search-input');
        const mobileSearch = document.getElementById('mobile-search-input');
        return ((desktopSearch && desktopSearch.value) || (mobileSearch && mobileSearch.value) || '').trim();
    }

    function getSortValue() {
        const sortBy = document.getElementById('sort-by');
        return sortBy ? sortBy.value : 'Best Match';
    }

    function getDbFilterPayload() {
        const priceRange = getActivePriceRange();

        return {
            minPrice: priceRange ? priceRange.min : null,
            maxPrice: priceRange && Number.isFinite(priceRange.max) ? priceRange.max : null,
            brands: getSelectedBrands(),
            type: getCheckedValues('Product Type'),
            condition: getCheckedValues('Condition'),
            pricing_model: getCheckedValues('Pricing Model'),
            minDiscount: getSelectedDiscountMin(),
            inStock: isFastDeliveryOn(),
            sortLabel: getSortValue(),
            q: getSearchTerm()
        };
    }

    function requestDbProducts() {
        document.dispatchEvent(new CustomEvent('sb:product-filters-change', {
            detail: getDbFilterPayload()
        }));
    }

    function isDbBackedListing() {
        return !!window.SB_DB_PRODUCTS_LOADER;
    }

    /* ─── Main filter logic ────────────────────────────────── */

    function applyFilters() {
        if (isDbBackedListing()) {
            requestDbProducts();
            return;
        }

        const cards = document.querySelectorAll('.prod-grid .product-card, .products-grid .product-card');
        const priceRange = getActivePriceRange();
        const brands = getSelectedBrands();
        const discountMin = getSelectedDiscountMin();
        const fastOnly = isFastDeliveryOn();

        let visibleCount = 0;

        cards.forEach(function (card) {
            const price    = parseFloat(card.getAttribute('data-price')) || 0;
            const vehicles = (card.getAttribute('data-vehicles') || '').toLowerCase();
            const discount = parseFloat(card.getAttribute('data-discount')) || 0;
            const isFast   = card.getAttribute('data-fast-delivery') === 'true';

            let show = true;

            // Price Range (single active range from radio buttons)
            if (priceRange) {
                show = show && price >= priceRange.min && price <= priceRange.max;
            }

            // Vehicle Brand (OR logic — card matches if it fits any selected brand)
            if (brands.length > 0) {
                show = show && brands.some(function (brand) {
                    return vehicles.includes(brand);
                });
            }

            // Discount
            if (discountMin > 0) {
                show = show && discount >= discountMin;
            }

            // Fast Delivery
            if (fastOnly) {
                show = show && isFast;
            }

            card.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });

        // Update product count label
        const countEl = document.querySelector('.catalog-header strong') || document.getElementById('product-count');
        if (countEl) countEl.textContent = visibleCount;

        // Show / hide empty state
        let emptyMsg = document.getElementById('filter-empty-msg');
        if (visibleCount === 0) {
            if (!emptyMsg) {
                emptyMsg = document.createElement('p');
                emptyMsg.id = 'filter-empty-msg';
                emptyMsg.style.cssText = 'grid-column:1/-1;text-align:center;padding:2rem;color:#6b7280;font-size:1rem;';
                emptyMsg.textContent = 'No products match the selected filters.';
                const grid = document.querySelector('.prod-grid') || document.querySelector('.products-grid');
                if (grid) grid.appendChild(emptyMsg);
            }
            emptyMsg.style.display = '';
        } else if (emptyMsg) {
            emptyMsg.style.display = 'none';
        }
    }

    /* ─── Sort logic ───────────────────────────────────────── */

    function applySort(value) {
        if (isDbBackedListing()) {
            requestDbProducts();
            return;
        }

        const grid = document.querySelector('.prod-grid') || document.querySelector('.products-grid');
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll('.product-card'));

        cards.sort(function (a, b) {
            const priceA    = parseFloat(a.getAttribute('data-price'))    || 0;
            const priceB    = parseFloat(b.getAttribute('data-price'))    || 0;
            const discountA = parseFloat(a.getAttribute('data-discount')) || 0;
            const discountB = parseFloat(b.getAttribute('data-discount')) || 0;

            if (value === 'Price: Low to High')  return priceA - priceB;
            if (value === 'Price: High to Low')  return priceB - priceA;
            if (value === 'Discount')            return discountB - discountA;
            return 0; // Best Match — keep original order
        });

        // Re-append in sorted order (invisible empty-state message stays last)
        const emptyMsg = document.getElementById('filter-empty-msg');
        cards.forEach(function (card) { grid.appendChild(card); });
        if (emptyMsg) grid.appendChild(emptyMsg);
    }

    /* ─── Clear Filters ────────────────────────────────────── */

    function clearFilters() {
        document.querySelectorAll('.sidebar-filters input[type="checkbox"]').forEach(function (cb) {
            cb.checked = false;
        });
        document.querySelectorAll('.sidebar-filters input[type="radio"]').forEach(function (r) {
            r.checked = false;
        });

        const desktopSearch = document.getElementById('search-input');
        const mobileSearch = document.getElementById('mobile-search-input');
        if (desktopSearch) desktopSearch.value = '';
        if (mobileSearch) mobileSearch.value = '';

        const sortBy = document.getElementById('sort-by');
        if (sortBy) sortBy.value = 'Best Match';

        applyFilters();
    }

    /* ─── Init ─────────────────────────────────────────────── */

    function bindSidebarFilterInputs() {
        const sidebar = document.querySelector('.sidebar-filters');
        if (!sidebar) return;

        sidebar.querySelectorAll('input').forEach(function (input) {
            if (input.dataset.sbFilterBound === '1') return;
            input.dataset.sbFilterBound = '1';
            input.addEventListener('change', applyFilters);
        });
    }

    function ensureAttributeFilters() {
        const sidebar = document.querySelector('.sidebar-filters');
        if (!sidebar || sidebar.dataset.sbAttributeFilters === '1') return;
        sidebar.dataset.sbAttributeFilters = '1';

        const markup = [
            '<div class="filter-group sb-attribute-filter"><h4>Product Type</h4>',
            '<label class="filter-option"><input type="checkbox" value="oem"> OEM</label>',
            '<label class="filter-option"><input type="checkbox" value="aftermarket"> Aftermarket</label>',
            '</div>',
            '<div class="filter-group sb-attribute-filter"><h4>Condition</h4>',
            '<label class="filter-option"><input type="checkbox" value="new"> New</label>',
            '<label class="filter-option"><input type="checkbox" value="used"> Used</label>',
            '<label class="filter-option"><input type="checkbox" value="refurbished"> Refurbished</label>',
            '</div>',
            '<div class="filter-group sb-attribute-filter"><h4>Pricing Model</h4>',
            '<label class="filter-option"><input type="checkbox" value="retail"> Retail</label>',
            '<label class="filter-option"><input type="checkbox" value="wholesale"> Wholesale</label>',
            '</div>'
        ].join('');

        sidebar.insertAdjacentHTML('beforeend', markup);
        bindSidebarFilterInputs();
    }

    document.addEventListener('DOMContentLoaded', function () {
        const sidebar = document.querySelector('.sidebar-filters');
        if (!sidebar) return;

        ensureAttributeFilters();
        bindSidebarFilterInputs();
        hydrateBrandFilters();

        // Wire up sort dropdown
        const sortBy = document.getElementById('sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', function () {
                applySort(this.value);
                applyFilters();
            });
        }

        ['search-input', 'mobile-search-input'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', function () {
                window.clearTimeout(searchDebounceTimer);
                searchDebounceTimer = window.setTimeout(applyFilters, 300);
            });
        });

        // Inject "Clear Filters" link at the bottom of the sidebar
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear Filters';
        clearBtn.style.cssText = [
            'margin-top:1rem', 'width:100%', 'padding:0.5rem',
            'background:transparent', 'border:1px solid #d1d5db',
            'border-radius:6px', 'color:#6b7280', 'font-size:0.85rem',
            'cursor:pointer', 'transition:all 0.2s'
        ].join(';');
        clearBtn.addEventListener('mouseenter', function () {
            this.style.borderColor = 'var(--color-primary)';
            this.style.color = 'var(--color-primary)';
        });
        clearBtn.addEventListener('mouseleave', function () {
            this.style.borderColor = '#d1d5db';
            this.style.color = '#6b7280';
        });
        clearBtn.addEventListener('click', clearFilters);
        sidebar.appendChild(clearBtn);

        // Set initial count from visible cards
        const totalCards = document.querySelectorAll('.prod-grid .product-card, .products-grid .product-card').length;
        const countEl = document.querySelector('.catalog-header strong') || document.getElementById('product-count');
        if (countEl) countEl.textContent = totalCards;

        // Patch broken legacy product page links (e.g. after-market-parts/prod_1.html)
        // and redirect them to the dynamic product.html?id=<title> detail page.
        patchProductLinks();
    });

    function patchProductLinks() {
        var legacyPattern = /(-parts\/prod_|-parts\/images\/)/;
        document.querySelectorAll('.prod-grid .product-card, .products-grid .product-card').forEach(function (card) {
            var titleEl = card.querySelector('.product-title');
            if (!titleEl) return;
            var title = (titleEl.textContent || titleEl.innerText || '').trim();
            if (!title) return;
            var newHref = 'product.html?id=' + encodeURIComponent(title);
            card.querySelectorAll('a[href]').forEach(function (link) {
                if (legacyPattern.test(link.getAttribute('href') || '')) {
                    link.setAttribute('href', newHref);
                }
            });
        });
    }
})();
