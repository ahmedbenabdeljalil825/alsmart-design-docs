document.addEventListener('DOMContentLoaded', function () {
    const basePath = document.body.dataset.basepath || '';

    // ===== Theme Toggle =====
    const themeBtn = document.getElementById('theme-btn');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.innerHTML = isDark
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        });
        // Set initial icon
        if (document.body.classList.contains('dark-mode')) {
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // ===== Search =====
    const searchInput = document.getElementById('sidebar-search');
    const mainSearch = document.getElementById('main-search');
    const resultsContainer = document.getElementById('search-results');
    let fuse;

    function initSearch() {
        if (typeof SEARCH_DATA !== 'undefined' && typeof Fuse !== 'undefined') {
            fuse = new Fuse(SEARCH_DATA, {
                keys: [
                    { name: 'name', weight: 0.7 },
                    { name: 'description', weight: 0.2 },
                    { name: 'category', weight: 0.1 }
                ],
                threshold: 0.4,
                includeScore: true
            });
        }
    }

    // Retry init since scripts are deferred
    initSearch();
    if (!fuse) setTimeout(initSearch, 200);

    function performSearch(query) {
        if (!fuse || !query || query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        const results = fuse.search(query).slice(0, 15);

        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(r => {
                const item = r.item;
                return `<a href="${basePath}${item.link}">
                    <div class="result-name">${item.name}</div>
                    <div class="result-cat">${item.category}</div>
                </a>`;
            }).join('');
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            resultsContainer.style.display = 'block';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', e => performSearch(e.target.value));
    }

    if (mainSearch) {
        mainSearch.addEventListener('input', e => {
            if (searchInput) {
                searchInput.value = e.target.value;
                searchInput.focus();
            }
            performSearch(e.target.value);
        });
    }

    document.addEventListener('click', e => {
        if (!e.target.closest('.search-box') && !e.target.closest('.search-hero')) {
            resultsContainer.style.display = 'none';
        }
    });

    // ===== Active Sidebar Link =====
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const parentDir = window.location.pathname.split('/').slice(-2, -1)[0] || '';
    const fullRef = parentDir ? parentDir + '/' + currentPath : currentPath;

    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.endsWith(currentPath) || href.endsWith(fullRef))) {
            link.classList.add('active');
        }
    });

    // ===== Back to Top =====
    const backBtn = document.getElementById('back-to-top');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            backBtn.classList.toggle('visible', window.scrollY > 300);
        });
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
