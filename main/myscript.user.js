// ==UserScript==
// @name AboveInject
// @namespace https://github.com/AdamKenning
// @version 2.2.1
// @match https://analyst.abovesurveying.com/analystSurvey.php?*
// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js
// @updateURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js

// @resource mainCss https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/style.css
// @grant GM_getResourceText
// ==/UserScript==

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
                <button class="ak-toolbar-button" id="imageModeBtn"> </button>
                <button class="ak-toolbar-button" id="darkModeBtn"> </button>
                <button class="ak-toolbar-button" id="tmpBtn"> feature 3? </button>
                <button class="ak-toolbar-button" id="tmpBtn"> feature 4? </button> 
                <button class="ak-toolbar-button" id="tmpBtn"> feature 5? </button>
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

    // =========================================================
    // Layout
    // =========================================================

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

    const imageButton = document.querySelector('#imageModeBtn');
    if(imageButton && !imageButton.dataset.akBound){
        imageButton.dataset.akBound = 'true';
        imageButton.addEventListener('click', () => {
                imageMode = !imageMode;
                localStorage.setItem('imagePriorityMode',imageMode);
                applyLayout();
            }
        );
    }

    const darkModeButton = document.querySelector('#darkModeBtn');
    if (darkModeButton && !darkModeButton.dataset.akBound){
        darkModeButton.dataset.akBound = 'true';
        darkModeButton.addEventListener('click', () => {
                darkMode = !darkMode;
                localStorage.setItem('darkMode',darkMode);
                applyDarkMode();
            }
        );
    }

    // =========================================================
    // Monitor Table Changes
    // =========================================================

    const tbody = table.querySelector('tbody');

    if (tbody) {
        const tbodyObserver =
            new MutationObserver(() => {
                applyLayout();
                runDataChecks();
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