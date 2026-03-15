/**
 * SpareBlaze Catalog Filter Engine
 * Applies Price Range, Vehicle Brand, and Discount filters to .product-card elements.
 * Each card must have: data-price, data-vehicles (comma-separated), data-discount (integer %)
 */
(function () {
    'use strict';

    function initFilters() {
        const grid = document.querySelector('.prod-grid') || document.querySelector('.products-grid');
        if (!grid) return;

        // Count display element (looks for <strong> inside .catalog-header)
        const countEl = document.querySelector('.catalog-header strong');

        // No-results placeholder
        let noResults = document.getElementById('no-results-msg');
        if (!noResults) {
            noResults = document.createElement('p');
            noResults.id = 'no-results-msg';
            noResults.style.cssText = 'grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--color-text-muted);font-size:1.1rem;display:none;';
            noResults.innerHTML = '<i class="fa-solid fa-filter" style="display:block;font-size:2rem;margin-bottom:1rem;"></i>No products match the selected filters.<br><small>Try adjusting or clearing the filters.</small>';
            grid.appendChild(noResults);
        }

        // Clear All button
        const sidebar = document.querySelector('.sidebar-filters');
        if (sidebar && !document.getElementById('clear-filters-btn')) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clear-filters-btn';
            clearBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Clear All Filters';
            clearBtn.style.cssText = 'width:100%;margin-top:1rem;padding:0.6rem;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:transparent;color:var(--color-text-muted);font-size:0.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.4rem;transition:all 0.2s;';
            clearBtn.addEventListener('mouseover', () => { clearBtn.style.borderColor = 'var(--color-primary)'; clearBtn.style.color = 'var(--color-primary)'; });
            clearBtn.addEventListener('mouseout', () => { clearBtn.style.borderColor = 'var(--color-border)'; clearBtn.style.color = 'var(--color-text-muted)'; });
            clearBtn.addEventListener('click', clearAllFilters);
            sidebar.appendChild(clearBtn);
        }

        // Attach change listeners to all filter inputs
        const allInputs = document.querySelectorAll('.sidebar-filters input[type="radio"], .sidebar-filters input[type="checkbox"]');
        allInputs.forEach(input => {
            input.addEventListener('change', applyFilters);
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);

        // Run once on load to reflect any pre-checked state
        applyFilters();
    }

    function getCards() {
        return Array.from(document.querySelectorAll('.prod-grid .product-card, .products-grid .product-card, .product-grid .product-card, #featured-products .product-card'));
    }

    function applyFilters() {
        const cards = getCards();

        // --- Collect Fast Delivery filter ---
        const fastDeliveryCheck = Array.from(document.querySelectorAll('.sidebar-filters input[type="checkbox"]'))
            .find(cb => {
                const lp = cb.parentElement.textContent.trim().toLowerCase();
                return lp.includes('fast delivery');
            });
        const requireFastDelivery = fastDeliveryCheck ? fastDeliveryCheck.checked : false;

        // --- Collect selected price range ---
        const priceRadio = document.querySelector('.sidebar-filters input[name="price"]:checked');
        let priceMin = 0, priceMax = Infinity;
        if (priceRadio) {
            const label = priceRadio.parentElement.textContent.trim();
            if (label.includes('Under')) {
                priceMax = 1000;
            } else if (label.includes('–') || label.includes('-')) {
                // Matches "₹1,000 – ₹10,000" or similar
                priceMin = 1000; priceMax = 10000;
            } else if (label.toLowerCase().includes('over') || label.toLowerCase().includes('above')) {
                priceMin = 10000;
            }
        }

        // --- Collect selected vehicle brands ---
        const vehicleChecks = Array.from(document.querySelectorAll('.sidebar-filters input[type="checkbox"]'))
            .filter(cb => {
                const grp = cb.closest('.filter-group');
                return grp && grp.querySelector('h4') && grp.querySelector('h4').textContent.trim() === 'Vehicle Brand';
            })
            .filter(cb => cb.checked)
            .map(cb => cb.parentElement.textContent.trim().toLowerCase());

        // --- Collect selected discount tiers ---
        const discountChecks = Array.from(document.querySelectorAll('.sidebar-filters input[type="checkbox"]'))
            .filter(cb => {
                const grp = cb.closest('.filter-group');
                return grp && grp.querySelector('h4') && grp.querySelector('h4').textContent.trim() === 'Discount';
            })
            .filter(cb => cb.checked)
            .map(cb => {
                const txt = cb.parentElement.textContent.trim();
                const match = txt.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
        const minDiscount = discountChecks.length > 0 ? Math.min(...discountChecks) : 0;

        let visibleCount = 0;

        cards.forEach(card => {
            const price = parseFloat(card.dataset.price || '0');
            const vehicles = (card.dataset.vehicles || '').toLowerCase();
            const discount = parseInt(card.dataset.discount || '0');
            const isFast = card.dataset.fastDelivery === 'true';

            // Fast Delivery filter
            const fastOk = !requireFastDelivery || isFast;

            // Price filter
            const priceOk = price >= priceMin && price <= priceMax;

            // Vehicle brand filter (substring match for compatibility lists)
            const vehicleOk = vehicleChecks.length === 0 ||
                vehicleChecks.some(v => vehicles.includes(v));

            // Discount filter
            const discountOk = minDiscount === 0 || discount >= minDiscount;

            const show = fastOk && priceOk && vehicleOk && discountOk;
            card.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });

        // Apply sort to visible cards
        applySortOrder();

        // Update count (Support both .catalog-header strong and #product-count)
        const countEl = document.querySelector('.catalog-header strong') || document.getElementById('product-count');
        if (countEl) countEl.textContent = visibleCount;

        // Show/hide no-results
        const noResults = document.getElementById('no-results-msg');
        if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    function applySortOrder() {
        const sortSelect = document.getElementById('sort-by');
        if (!sortSelect) return;
        const val = sortSelect.value;

        const grid = document.querySelector('.prod-grid') || document.querySelector('.products-grid');
        if (!grid) return;

        const cards = getCards();
        const visible = cards.filter(c => c.style.display !== 'none');
        const hidden = cards.filter(c => c.style.display === 'none');

        visible.sort((a, b) => {
            const pa = parseFloat(a.dataset.price || 0);
            const pb = parseFloat(b.dataset.price || 0);
            const da = parseInt(a.dataset.discount || 0);
            const db = parseInt(b.dataset.discount || 0);

            if (val === 'Price: Low to High') return pa - pb;
            if (val === 'Price: High to Low') return pb - pa;
            if (val === 'Discount') return db - da;
            return 0; // Best Match — keep original order
        });

        // Re-append in sorted order (visible first, then hidden)
        [...visible, ...hidden].forEach(c => grid.appendChild(c));
    }

    function clearAllFilters() {
        // Reset price radio to middle option
        const priceRadios = document.querySelectorAll('.sidebar-filters input[name="price"]');
        priceRadios.forEach((r, i) => { r.checked = (i === 0); });

        // Uncheck all vehicle brand & discount checkboxes
        document.querySelectorAll('.sidebar-filters input[type="checkbox"]').forEach(cb => {
            const grp = cb.closest('.filter-group');
            if (!grp) return;
            const title = grp.querySelector('h4') ? grp.querySelector('h4').textContent.trim() : '';
            if (title === 'Vehicle Brand' || title === 'Discount') cb.checked = false;
        });

        applyFilters();
    }

    // Init after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFilters);
    } else {
        initFilters();
    }

    // Expose to window for dynamic scripts
    window.initFilters = initFilters;
})();
