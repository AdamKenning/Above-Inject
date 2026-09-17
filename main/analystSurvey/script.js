const VERSION = "3.1.8";

// Change to last used tab
function restoreLastTab() {
    const lastTab = localStorage.getItem('akLastTab') || '#defectList';
    let restored = false;
    for(let i = 1; i <= 20; i++) {
        setTimeout(() => {
            if (restored) return;
            const tab = document.querySelector(`a[href="${lastTab}"]`);
            if (!tab) return;
            restored = true;
            tab.click();
            console.log(`Restored tab after ${i * 100}ms`);
        }, i * 100);
    }
    document.querySelectorAll('.nav.nav-tabs a').forEach(tab => {
        if (tab.dataset.akBound) return;
        tab.dataset.akBound = 'true';
        tab.addEventListener('click', () => {localStorage.setItem('akLastTab', tab.getAttribute('href'));});
    });
}
restoreLastTab();

// =========================================================
// Main Logic
// =========================================================
if(localStorage.getItem('darkMode') === 'true'){document.documentElement.classList.add('dark-mode');}

const mainObserver = new MutationObserver((mutations, obs) => {
    const table = document.querySelector('#dataTable');
    if (!table) return;

    // Local storage setting
    if(localStorage.getItem('imagePriorityMode') === null){localStorage.setItem('imagePriorityMode','true');}
    let imageMode = localStorage.getItem('imagePriorityMode') === 'true';
    if(localStorage.getItem('darkMode') === null){localStorage.setItem('darkMode', 'true');}
    let darkMode = localStorage.getItem('darkMode') === 'true';
    if(localStorage.getItem('imageZoomLevel') === null){localStorage.setItem('imageZoomLevel', '0');}
    let imageZoomLevel = Number(localStorage.getItem('imageZoomLevel'));
    if(localStorage.getItem('snapMode') === null){localStorage.setItem('snapMode', 'false');}
    let snapMode = localStorage.getItem('snapMode') === 'true';

    // Features
    function addToolbar() {
        const row = document.querySelector('#dataTable_wrapper > .row:first-child');
        if (!row || row.querySelector('.ak-toolbar')) return;

        const left = row.children[0];
        const right = row.children[1];

        left.className = 'col-sm-4';
        right.className = 'col-sm-4';

        const middle = document.createElement('div');

        middle.className = 'col-sm-4 ak-toolbar';

        middle.innerHTML = `
            <div style="
                display:flex;
                justify-content:center;
                align-items:center;
                gap:8px;
                height:34px;
            ">
                <div class="ak-feature-group">
                    <button class="ak-toolbar-button" id="imageModeBtn"> </button>
                    <button class="ak-toolbar-button" id="darkModeBtn"> </button>
                    <button class="ak-toolbar-button" id="zoomLevelBtn"> </button>
                    <button class="ak-toolbar-button" id="flushCacheBtn"> Flush Cache </button>
                    <button class="ak-toolbar-button" id="snapRowBtn"> Snap Row </button>
                </div>

                <div class="ak-nav-group">
                    <button class="ak-nav-btn" id="pageUpBtn">\u2B9D</button>
                    <button class="ak-nav-btn" id="pageDownBtn">\u2B9F</button>
                    <button class="ak-nav-btn" id="prevPageBtn">\u2B9C</button>
                    <button class="ak-nav-btn" id="nextPageBtn">\u2B9E</button>
                    <div class="ak-page-indicator" id="pageIndicator">1</div>
                </div>
            </div>
        `;

        left.after(middle);
    }

    function customisePageLengths() {
        const select = document.querySelector('select[name="dataTable_length"]') || document.querySelector('.dataTables_length select');
        if (!select || select.dataset.akPatched) return;
        select.dataset.akPatched = 'true';

        select.innerHTML = `
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1k</option>
        `;

        select.value = '100';
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function bindImageZoom(){
        if(!window.akShiftZoomBound){
            window.akShiftZoomBound = true;
            document.addEventListener('keydown', e =>{
                if(e.key !== 'Shift') return;
                document.querySelectorAll('#dataTable .thumbnail:hover img').forEach(img => {
                    img.style.transformOrigin = `${img.dataset.lastX}% ${img.dataset.lastY}%`;
                    img.style.transform = `scale(${[1, 2, 4, 8][imageZoomLevel]})`;
                });
            });

            document.addEventListener('keyup', e => {
                if(e.key !== 'Shift') return;
                document.querySelectorAll('#dataTable .thumbnail img').forEach(img => {img.style.transform = 'scale(1)';});
            });
        }

        document.querySelectorAll('#dataTable .thumbnail img').forEach(img => {
            if(img.dataset.zoomBound) return;
            img.dataset.zoomBound = 'true';
            const container = img.closest('.thumbnail');
            img.dataset.lastX = 50;
            img.dataset.lastY = 50;

            container.addEventListener('mousemove', e => {
                const rect = container.getBoundingClientRect();
                img.dataset.lastX = ((e.clientX - rect.left) / rect.width) * 100;
                img.dataset.lastY = ((e.clientY - rect.top) / rect.height) * 100;
                if(!e.shiftKey || imageZoomLevel === 0) return;
                img.style.transformOrigin = `${img.dataset.lastX}% ${img.dataset.lastY}%`;
                img.style.transform = `scale(${[1, 2, 4, 8][imageZoomLevel]})`;
            });

            container.addEventListener('mouseenter', e => {
                if(!e.shiftKey || imageZoomLevel === 0) return;
                clearTimeout(img._originResetTimer);
                img.style.transformOrigin = `${img.dataset.lastX}% ${img.dataset.lastY}%`;
                img.style.transform = `scale(${[1, 2, 4, 8][imageZoomLevel]})`;
            });

            container.addEventListener('mouseleave', () => {
                img.style.transformOrigin = `${img.dataset.lastX}% ${img.dataset.lastY}%`;
                img.style.transform = 'scale(1)';
                clearTimeout(img._originResetTimer);
                img._originResetTimer = setTimeout(() => {
                    if(!container.matches(':hover')) img.style.transformOrigin = 'center center';
                }, 500);
            });

            container.addEventListener('wheel', e => {
                if(!e.shiftKey) return;
                e.preventDefault();
                if(e.deltaY < 0) imageZoomLevel = Math.min(imageZoomLevel + 1, 3);
                else imageZoomLevel = Math.max(imageZoomLevel - 1, 0);

                localStorage.setItem('imageZoomLevel', imageZoomLevel);
                const zoomBtn = document.querySelector('#zoomLevelBtn');
                if(zoomBtn) zoomBtn.textContent = ['Zoom Off', 'Zoom 2x', 'Zoom 4x', 'Zoom 8x'][imageZoomLevel];

                img.style.transformOrigin = `${img.dataset.lastX}% ${img.dataset.lastY}%`;

                img.style.transform = imageZoomLevel === 0 ? 'scale(1)': `scale(${[1, 2, 4, 8][imageZoomLevel]})`;
            }, { passive: false });
        });
    }

    function hardFlushImageCache() {
        const cacheBuster = `${Date.now()}-${Math.random()}`;
        const images = [...document.querySelectorAll('#dataTable img')];
        images.sort((a, b) => getPriority(a) - getPriority(b));
        function getPriority(img) {
            const rect = img.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) return 0;
            if (rect.top >= window.innerHeight) return rect.top;
            return 1000000 + Math.abs(rect.top);
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                observer.unobserve(img);
                const src = img.dataset.realSrc;
                if (!src) return;
                const url = new URL(src, location.href);
                url.searchParams.set('_akcache', cacheBuster);
                img.src = url.href;
            });
        },{rootMargin: '1000px'});

        function processBatch(start = 0) {
            const batchSize = 20;
            const batch = images.slice(start, start + batchSize);
            batch.forEach(img => {
                const src = img.currentSrc || img.src;
                if (!src) return;
                img.dataset.realSrc = src;
                const w = img.naturalWidth;
                const h = img.naturalHeight;
                if (w && h) img.parentElement.style.aspectRatio = `${w}/${h}`;
                img.removeAttribute('src');
                const top = img.getBoundingClientRect().top;
                if (top > -500 && top < window.innerHeight * 2) {
                    const url = new URL(src, location.href);
                    url.searchParams.set('_akcache', cacheBuster);
                    img.src = url.href;
                }else observer.observe(img);
            });
            if(start + batchSize < images.length) requestIdleCallback(() => processBatch(start + batchSize));
        }
        processBatch();
    }

    function applyDarkMode() {
        document.documentElement.classList.toggle('dark-mode',darkMode);
        const btn = document.querySelector('#darkModeBtn');
        if (btn) {btn.textContent = darkMode ? 'Light Mode' : 'Dark Mode';}
    }

    function applyLayout(){
        customisePageLengths();
        addToolbar();

        table.classList.remove('image-priority-mode', 'data-priority-mode');
        table.classList.add(imageMode ? 'image-priority-mode' : 'data-priority-mode');

        document.querySelectorAll('#dataTable tbody img').forEach(img => {
            img.style.maxWidth = imageMode ? '600px' : '35px';
            img.style.width = imageMode ? '600px' : '35px';
            img.style.height = 'auto';
        });

        // Hijack loacte button to open in new tab
        document.addEventListener('click', e => {
            const btn = e.target.closest('.locate');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const surveyId = btn.getAttribute('surveyid');
            const defectId = btn.getAttribute('defectid');
            const url = `https://analyst.abovesurveying.com/analystAutoMapV2.php?surveyId=${surveyId}&defectId=${defectId}`;
            window.open(url, '_blank');
        }, true);

        const btn = document.querySelector('#imageModeBtn');
        if (btn){btn.textContent =imageMode ? 'Data  Mode' : 'Image Mode';}

        const zoomBtn = document.querySelector('#zoomLevelBtn');
        const labels = ['Zoom Off', 'Zoom 2x', 'Zoom 4x', 'Zoom 8x'];
        if(zoomBtn){
            zoomBtn.textContent =labels[imageZoomLevel];
            zoomBtn.title = 'Shift + Mouse Wheel over image to zoom';
        }

    }

    function updatePageIndicator(){
        const activePage = document.querySelector('#dataTable_paginate li.active a');
        const indicator = document.querySelector('#pageIndicator');
        const nextLi = document.querySelector('#dataTable_next');
        const totalPageLink = nextLi?.previousElementSibling?.querySelector('a');
        if(activePage && indicator && totalPageLink) indicator.textContent = `p. ${activePage.textContent.trim()} / ${totalPageLink.textContent.trim()}`;
    }

    function snapToNextRow(down = true){
        const rows = [...document.querySelectorAll('#dataTable tbody tr')];
        if (!rows.length) return;
        const headerOffset = 102;
        let currentRowIndex = 0;
        let smallestDistance = Infinity;
        rows.forEach((row, index) => {
            const distance = Math.abs(row.getBoundingClientRect().top - headerOffset);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                currentRowIndex = index;
            }
        });
        const targetIndex = down ? Math.min(currentRowIndex + 1, rows.length - 1) : Math.max(currentRowIndex - 1, 0);
        window.scrollBy({top: rows[targetIndex].getBoundingClientRect().top - headerOffset, behavior: 'auto'});
    }

    function bindSnapWheel() {
        if (window.akSnapWheelBound) return;
        window.akSnapWheelBound = true;
        document.addEventListener('wheel', e => {
            if(e.shiftKey) return;
            if(!snapMode) return;
            if (e.target.closest('.select2-dropdown') ||
                e.target.closest('.select2-results') ||
                e.target.closest('.select2-results__options')
            ){return;}
            e.preventDefault();
            snapToNextRow(e.deltaY > 0);

        }, { passive: false });
    }

    function runDataChecks() {
        document.querySelectorAll('#dataTable tbody tr').forEach(row => {
            row.classList.remove('ak-warning');
            const cells = row.querySelectorAll('td');
            if (cells.length < 6) return;
            const anomalyType = cells[1].textContent.trim();

            const peakTemp = parseFloat(cells[3].textContent.trim());
            const refTemp = parseFloat(cells[4].textContent.trim());
            const gradient = parseFloat(cells[5].textContent.trim());

            // Hot Spot / Multiple Hot Cells < 4
            if((anomalyType === 'Hot Spot' || anomalyType === 'Multiple Hot Cells') && !isNaN(gradient) && gradient < 4){
                row.classList.add('ak-warning');
            }

            // Heated Junction Box < 7
            if(anomalyType === 'Heated Junction Box' && !isNaN(gradient) && gradient < 7){
                row.classList.add('ak-warning');
            }

            // Missing Module / Tracker / Visual should always have Peak & Ref temp = 0
            if ((anomalyType === 'Missing Module' || anomalyType === 'Tracker' || anomalyType === 'Visual') &&
                (!isNaN(peakTemp) && peakTemp !== 0 || !isNaN(refTemp) && refTemp !== 0)) {
                row.classList.add('ak-warning');
            }
        });
    }

    // Setup
    applyLayout();
    applyDarkMode();
    runDataChecks();
    bindImageZoom();
    bindSnapWheel();
    updatePageIndicator();

    let currentRowIndex = null;

    // Keybinds
    document.addEventListener('keydown', e => {
        if (e.key === 'q') snapToNextRow(false);
        if (e.key === 'e') snapToNextRow(true);
        if (e.key === 'c' || e.key === 'C') document.documentElement.classList.toggle('ak-contrast-mode');
    });

    // Feature Button Assigning
    const imageButton = document.querySelector('#imageModeBtn');
    if(imageButton && !imageButton.dataset.akBound){
        imageButton.dataset.akBound = 'true';
        imageButton.title = 'contrast boost with C';
        imageButton.addEventListener('click', () => {
            imageMode = !imageMode;
            localStorage.setItem('imagePriorityMode',imageMode);
            applyLayout();
        });
    }

    const darkModeButton = document.querySelector('#darkModeBtn');
    if (darkModeButton && !darkModeButton.dataset.akBound){
        darkModeButton.dataset.akBound = 'true';
        darkModeButton.addEventListener('click', () => {
            darkMode = !darkMode;
            localStorage.setItem('darkMode',darkMode);
            applyDarkMode();
        });
    }

    const zoomButton = document.querySelector('#zoomLevelBtn');
    if(zoomButton && !zoomButton.dataset.akBound){
        zoomButton.dataset.akBound = 'true';
        zoomButton.addEventListener('click', () => {
            imageZoomLevel = (imageZoomLevel + 1) % 4;
            localStorage.setItem('imageZoomLevel',imageZoomLevel);
            applyLayout();
        });
    }

    const flushCacheButton = document.querySelector('#flushCacheBtn');
    if (flushCacheButton && !flushCacheButton.dataset.akBound) {
        flushCacheButton.dataset.akBound = 'true';
        flushCacheButton.addEventListener('click', () => {
            hardFlushImageCache();
            flushCacheButton.textContent = 'Flushing...';
            setTimeout(() => {flushCacheButton.textContent = 'Flush Cache';}, 1500);
        });
    }

    const snapRowBtn = document.querySelector('#snapRowBtn');
    if (snapRowBtn && !snapRowBtn.dataset.akBound) {
        snapRowBtn.dataset.akBound = 'true';
        snapRowBtn.title = 'Snap to next row with Q/E (or mouse)';
        snapRowBtn.textContent = snapMode ? 'Snap On' : 'Snap Off';
        snapRowBtn.addEventListener('click', () => {
            snapMode = !snapMode;
            localStorage.setItem('snapMode', snapMode);
            snapRowBtn.textContent = snapMode ? 'Snap On' : 'Snap Off';
        });
    }

    // Nav Button Assigning
    const prevPageBtn = document.querySelector('#prevPageBtn');
    if (prevPageBtn && !prevPageBtn.dataset.akBound) {
        prevPageBtn.dataset.akBound = 'true';
        prevPageBtn.addEventListener('click', () => {
            document.querySelector('.paginate_button.previous:not(.disabled)')?.click();
            setTimeout(updatePageIndicator, 50);
        });
    }

    const nextPageBtn = document.querySelector('#nextPageBtn');
    if (nextPageBtn && !nextPageBtn.dataset.akBound) {
        nextPageBtn.dataset.akBound = 'true';
        nextPageBtn.addEventListener('click', () => {
            document.querySelector('.paginate_button.next:not(.disabled)')?.click();
            setTimeout(updatePageIndicator, 50);
        });
    }

    const pageUpBtn = document.querySelector('#pageUpBtn');
    if (pageUpBtn && !pageUpBtn.dataset.akBound) {
        pageUpBtn.dataset.akBound = 'true';
        pageUpBtn.addEventListener('click', () => {
            const firstRow = document.querySelector('#dataTable tbody tr');
            if (!firstRow) return;
            const headerOffset = 100;
            window.scrollBy({top: firstRow.getBoundingClientRect().top - headerOffset, behavior: 'smooth'});
            currentRowIndex = 0;
        });
    }

    const pageDownBtn = document.querySelector('#pageDownBtn');
    if (pageDownBtn && !pageDownBtn.dataset.akBound) {
        pageDownBtn.dataset.akBound = 'true';
        pageDownBtn.addEventListener('click', () => {window.scrollTo({top: document.body.scrollHeight,behavior: 'smooth'});});
    }

    // Monitor Table Changes
    const tbody = table.querySelector('tbody');
    if(tbody){
        const tbodyObserver = new MutationObserver(() => {
            applyLayout();
            runDataChecks();
            bindImageZoom();
            bindSnapWheel();
            updatePageIndicator();
        });

        tbodyObserver.observe(tbody, {
            childList: true,
            subtree: true
        });
    }
    obs.disconnect();
});

mainObserver.observe(document.body, {
    childList: true,
    subtree: true
});
