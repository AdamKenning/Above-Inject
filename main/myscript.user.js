// ==UserScript==
// @name         AboveInject
// @namespace    https://github.com/AdamKenning
// @version      2.7.3
// @description  Feature addition / QOL changes to the Survey page of Solargain
// @author       Adam K

// @match        https://analyst.abovesurveying.com/analystSurvey.php?*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @resource mainCss https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/style.css?v=2.7.2
// @grant GM_getResourceText
// @grant GM_info

// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js
// @updateURL   https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js
// ==/UserScript==

// Kill Switch
function addKillSwitch(){
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = localStorage.getItem('disableInject') === 'true' ? 'Enable Inject' : 'Disable Inject';
    toggleBtn.style.cssText = `
        background: #aaaaaa;
        color: #000000;
        border: 2px solid #000000;

        border-radius:4px;
        cursor:pointer;
        padding:4px 8px;
        min-width:100px;

        position: fixed;
        top: 2px;
        left: 15%;
        transform: translateX(-50%);
        z-index: 999999;
    `;
    toggleBtn.addEventListener('click', () => {
        const disabled = localStorage.getItem('disableInject') === 'true';
        localStorage.setItem('disableInject', (!disabled).toString());
        location.reload();
    });
    if (document.body) {document.body.appendChild(toggleBtn);}
    else {window.addEventListener('DOMContentLoaded', () => {document.body.appendChild(toggleBtn);});}
}
addKillSwitch()


// Version info
async function checkForUpdates(){
    const VERSION = GM_info.script.version;
    try{
        const response = await fetch(
            'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js?t=' + Date.now(), {cache: 'no-store'}
        );
        const text = await response.text();
        const match = text.match(/@version\s+([0-9.]+)/);
        if (!match) return;
        const githubVersion = match[1];

        console.log("Installed:", VERSION);
        console.log("GitHub:", githubVersion);

        const current = VERSION.split('.').map(Number);
        const latest = githubVersion.split('.').map(Number);
        const isPatchOnly = current[0] === latest[0] && current[1] === latest[1] && current[2] !== latest[2];

        const btn = document.createElement('button');
        btn.style.cssText = `
                    border: 2px solid #000000;
                    border-radius:4px;
                    cursor:pointer;
                    padding:4px 8px;
                    min-width:100px;

                    position: fixed;
                    top: 2px;
                    left: calc(15% + 140px);
                    transform: translateX(-50%);
                    z-index: 999999;
                `;

        if(githubVersion !== VERSION){
            btn.textContent = `v${VERSION} \u2794 v${githubVersion}`;
            btn.title = `Installed: ${VERSION}\nLatest:     ${githubVersion}\nClick to update`;

            if(!isPatchOnly){
                btn.style.background = '#ff4444';
                btn.style.color = '#fff';
                btn.classList.add('ak-update-available');
            }else{
                btn.style.background = '#aaaaaa';
                btn.style.color = '#000000';
            }

            btn.onclick = () => {window.open('https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js','_blank');};
        }else{
            btn.textContent = `v${VERSION}`;
            btn.title = `Installed: ${VERSION}\nLatest:     ${githubVersion}\nNo new updates`;
            btn.style.background = '#aaaaaa';
            btn.style.color = '#000000';
        }
        if (document.body){document.body.appendChild(btn);}
        else{window.addEventListener('DOMContentLoaded', () => {document.body.appendChild(btn);});}
    }catch (err){console.error('Version check failed', err);}
}
checkForUpdates();

// Main Logic
if(localStorage.getItem('disableInject') !== 'true'){
    // Change to last used tab
    window.addEventListener('load', () => {
        const lastTab = localStorage.getItem('akLastTab') || '#defectList';
        setTimeout(() => {document.querySelector(`a[href="${lastTab}"]`)?.click();}, 100);
        document.querySelectorAll('.nav.nav-tabs a').forEach(tab => {
            tab.addEventListener('click', () => {localStorage.setItem('akLastTab', tab.getAttribute('href'));});
        });
    });

    // Load CSS
    const css = GM_getResourceText("mainCss");
    const style = document.createElement("style");

    style.textContent = css;
    document.head.appendChild(style);

    // =========================================================
    // Main Logic
    // =========================================================

    if(localStorage.getItem('darkMode') === 'true'){document.documentElement.classList.add('dark-mode');}


    const mainObserver = new MutationObserver((mutations, obs) => {
        const table = document.querySelector('#dataTable');
        if (!table) return;

        // =========================================================
        // Toolbar
        // =========================================================

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
                        <button class="ak-toolbar-button" id="tmpBtn"> feature 5? </button>
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

        // =========================================================
        // Page Length Select
        // =========================================================

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

        // =========================================================
        // State
        // =========================================================

        if(localStorage.getItem('imagePriorityMode') === null){localStorage.setItem('imagePriorityMode','true');}
        let imageMode = localStorage.getItem('imagePriorityMode') === 'true';
        if(localStorage.getItem('darkMode') === null){localStorage.setItem('darkMode', 'true');}
        let darkMode = localStorage.getItem('darkMode') === 'true';
        if(localStorage.getItem('imageZoomLevel') === null){localStorage.setItem('imageZoomLevel', '0');}
        let imageZoomLevel = Number(localStorage.getItem('imageZoomLevel'));

        // =========================================================
        // Features
        // =========================================================

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
                    if (e.key !== 'Shift') return;
                    document.querySelectorAll('#dataTable .thumbnail img').forEach(img => {
                        img.style.transform = 'scale(1)';
                    });
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

                container.addEventListener('mouseleave', () => {
                    img.style.transformOrigin = 'center center';
                    img.style.transform = 'scale(1)';
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
                    img.style.transform = imageZoomLevel === 0 ? 'scale(1)' : `scale(${[1, 2, 4, 8][imageZoomLevel]})`;
                }, { passive: false });
            });

        }

        function hardFlushImageCache() {
            const cacheBuster = `${Date.now()}-${Math.random()}`;
            const images = document.querySelectorAll('#dataTable img');

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

            images.forEach(img => {
                const src = img.currentSrc || img.src;
                if (!src) return;
                img.dataset.realSrc = src;
                img.removeAttribute('src'); // force unload
                if(img.getBoundingClientRect().top < window.innerHeight * 2){
                    const url = new URL(src, location.href);
                    url.searchParams.set('_akcache', cacheBuster);
                    img.src = url.href;
                }else{
                    observer.observe(img);
                }
            });
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
                img.style.maxWidth = imageMode ? '500px' : '0px';
                img.style.width = imageMode ? '500px' : '0px';
                img.style.height = 'auto';
            });

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
            if (activePage && indicator) {indicator.textContent = activePage.textContent.trim();}
        }

        // =========================================================
        // Data checks
        // =========================================================

        function runDataChecks() {
            document.querySelectorAll('#dataTable tbody tr').forEach(row => {
                row.classList.remove('ak-warning');
                const cells = row.querySelectorAll('td');
                if (cells.length < 6) return;
                const anomalyType = cells[1].textContent.trim();
                const deltaTm = parseFloat(cells[5].textContent.trim());

                // Hot Spot / Multiple Hot Cells < 4
                if((anomalyType === 'Hot Spot' || anomalyType === 'Multiple Hot Cells') && !isNaN(deltaTm) && deltaTm < 4){
                    row.classList.add('ak-warning');
                }

                // Heated Junction Box < 7
                if(anomalyType === 'Heated Junction Box' && !isNaN(deltaTm) && deltaTm < 7){
                    row.classList.add('ak-warning');
                }

                // Missing Module / Tracker should always have ΔTm = 0
                if((anomalyType === 'Missing Module' || anomalyType === 'Tracker') && !isNaN(deltaTm) && deltaTm !== 0){
                    row.classList.add('ak-warning');
                }

            });
        }

        // =========================================================
        // Initial Setup
        // =========================================================

        applyLayout();
        applyDarkMode();
        runDataChecks();
        bindImageZoom();
        updatePageIndicator();

        const imageButton = document.querySelector('#imageModeBtn');
        if(imageButton && !imageButton.dataset.akBound){
            imageButton.dataset.akBound = 'true';
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

        // nav stuff

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
            pageUpBtn.addEventListener('click', () => {document.querySelector('#dataTable_wrapper')?.scrollIntoView({ behavior: 'smooth' });});
        }

        const pageDownBtn = document.querySelector('#pageDownBtn');
        if (pageDownBtn && !pageDownBtn.dataset.akBound) {
            pageDownBtn.dataset.akBound = 'true';
            pageDownBtn.addEventListener('click', () => {window.scrollTo({top: document.body.scrollHeight,behavior: 'smooth'});});
        }

        // =========================================================
        // Monitor Table Changes
        // =========================================================

        const tbody = table.querySelector('tbody');

        if (tbody) {
            const tbodyObserver = new MutationObserver(() => {
                applyLayout();
                runDataChecks();
                bindImageZoom();
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
}