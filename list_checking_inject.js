// Type your JavaScript code here.

// =========================================================
// Inject CSS
// =========================================================
const style = document.createElement('style');
style.textContent = `
    /* =========================================================
        Dark Mode
        ========================================================= */

        html {transition: filter 0.5s ease;}
        img, video, canvas {transition: filter 0.5s ease;}
        
        html.dark-mode {filter: invert(1);}
        
        html.dark-mode img,
        html.dark-mode video,
        html.dark-mode canvas {filter: invert(1);}

    /* =========================================================
        GENERAL CLEANUP
        ========================================================= */
        div.container-fluid.nav-fixed{padding:0;}
        h1,h2{display:none;}
        div.box-title{padding:0!important;border:0!important;margin:0!important;}
        div.box.box-bordered.box-color.teal.details{padding:0;margin:0;}
        div.box-content.defectList.dataTables_wrapper{padding:0;}
        div.col-xs-12{padding:0!important;}
        .text-right{text-align:left;}

    /* =========================================================
        STICKY HEADER / TABLE LOOK
        ========================================================= */
        thead{
            position:sticky;
            top:32px;
            background:white;
            z-index:1050;
        }


        td{
            outline:1px solid rgba(0,0,0,.1);
            border:0!important;
        }

        #dataTable td,
        #dataTable th{
            padding-top:0 !important;
            padding-bottom:0 !important;
        }

        div.btn-group-vertical{
            height:0!important;
            width:40px!important;
        }

    /* =========================================================
        HIDE SPINNERS / BUTTON
        ========================================================= */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button{
            -webkit-appearance:none;
            margin:0;
        }

        #dataTable_wrapper > .row:first-child{
            position:sticky;
            top:0;
            z-index:1100;

            background:white;
            min-height:32px;
            height:32px;

            padding:0 !important;
            margin:0 !important;

            display:flex;
            align-items:center;
        }

        .ak-toolbar-button{
            background:#00aba9;
            color:#fff;
            border:none;
            border-radius:4px;
            cursor:pointer;
            padding:4px 8px;
            min-width:100px;
        }

        .ak-toolbar-button:hover{background:#00918f;}
        .ak-toolbar-button:active{transform:translateY(-2px);}

        #tmpBtn{
            border: 2px solid #00aba9;
            color:#00aba9;
            background:#fff;
        }

    /* =========================================================
        DATA MODE
        ========================================================= */

        .data-priority-mode th:nth-child(1),
        .data-priority-mode td:nth-child(1){
            width:20px!important;
            padding-right:0!important;
        }

        .data-priority-mode th:nth-child(2),
        .data-priority-mode td:nth-child(2){
            width:220px;
        }

        .data-priority-mode th:nth-child(3),
        .data-priority-mode td:nth-child(3),
        .data-priority-mode th:nth-child(4),
        .data-priority-mode td:nth-child(4),
        .data-priority-mode th:nth-child(5),
        .data-priority-mode td:nth-child(5),
        .data-priority-mode th:nth-child(6),
        .data-priority-mode td:nth-child(6),
        .data-priority-mode th:nth-child(7),
        .data-priority-mode td:nth-child(7),
        .data-priority-mode th:nth-child(8),
        .data-priority-mode td:nth-child(8){
            width:60px!important;
            padding-right:0!important;
        }

        .data-priority-mode th:nth-child(9),
        .data-priority-mode td:nth-child(9),
        .data-priority-mode th:nth-child(10),
        .data-priority-mode td:nth-child(10){
            width:0!important;
            padding:0!important;
            overflow:hidden;
        }

        .data-priority-mode th:nth-child(11),
        .data-priority-mode td:nth-child(11){
            width:auto;
        }

        .data-priority-mode th:nth-child(12),
        .data-priority-mode td:nth-child(12),
        .data-priority-mode th:nth-child(13),
        .data-priority-mode td:nth-child(13){
            width:90px;
        }

        .data-priority-mode th:nth-child(14),
        .data-priority-mode td:nth-child(14){
            width:300px;
        }

        .data-priority-mode th:nth-child(15),
        .data-priority-mode td:nth-child(15){display:none!important;}

    /* =========================================================
        IMAGE MODE
        ========================================================= */

        #dataTable.image-priority-mode thead .select2-container {
            width: 50px !important;
            min-width: 50px !important;
            max-width: 50px !important;

            height: 30px !important;
            min-height: 30px !important;
            max-height: 30px !important;
        }

        .image-priority-mode th:nth-child(4),
        .image-priority-mode td:nth-child(4),
        .image-priority-mode th:nth-child(5),
        .image-priority-mode td:nth-child(5),
        .image-priority-mode th:nth-child(7),
        .image-priority-mode td:nth-child(7),
        .image-priority-mode th:nth-child(8),
        .image-priority-mode td:nth-child(8),
        .image-priority-mode th:nth-child(13),
        .image-priority-mode td:nth-child(13),
        .image-priority-mode th:nth-child(14),
        .image-priority-mode td:nth-child(14){
            display:none!important;
        }

        .image-priority-mode th:nth-child(1),
        .image-priority-mode td:nth-child(1),
        .image-priority-mode th:nth-child(2),
        .image-priority-mode td:nth-child(2),
        .image-priority-mode th:nth-child(6),
        .image-priority-mode td:nth-child(6){
            width:20px!important;
            padding-right:0!important;
        }

        .image-priority-mode th:nth-child(3),
        .image-priority-mode td:nth-child(3){
            width:20px!important;
            padding-right:0!important;
        }

        .image-priority-mode th:nth-child(11),
        .image-priority-mode td:nth-child(11){
            width:60px!important;
            padding-right:0!important;
        }

        .image-priority-mode th:nth-child(12),
        .image-priority-mode td:nth-child(12){
            width:20px!important;
            padding-right:0!important;
        }

        .image-priority-mode th:nth-child(9),
        .image-priority-mode td:nth-child(9),
        .image-priority-mode th:nth-child(10),
        .image-priority-mode td:nth-child(10){
            width:500px!important;
            min-width:500px!important;
        }

        .image-priority-mode{
            table-layout:auto!important;
            width:100%!important;
        }

        .image-priority-mode td:nth-child(9),
        .image-priority-mode td:nth-child(10){
            width:45%!important;
        }

        .image-priority-mode td:nth-child(9) img,
        .image-priority-mode td:nth-child(10) img{
            width:100%!important;
            height:auto!important;
            max-width:none!important;
            max-height:none!important;
        }

        .image-priority-mode th:nth-child(4),
        .image-priority-mode td:nth-child(4){
            width:60px!important;
            min-width:60px!important;
            max-width:60px!important;
        }

        .image-priority-mode th:nth-child(12),
        .image-priority-mode td:nth-child(12){
            width:70px!important;
            min-width:70px!important;
            max-width:70px!important;
        }`;
    
document.head.appendChild(style);

// =========================================================
// Main Logic
// =========================================================

if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark-mode');
}

const mainObserver = new MutationObserver((mutations, obs) => {

    const table = document.querySelector('#dataTable');
    if (!table) return;

    // =========================================================
    // Toolbar
    // =========================================================

    function addToolbar() {

        const row = document.querySelector(
            '#dataTable_wrapper > .row:first-child'
        );

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
                <button
                    class="ak-toolbar-button"
                    id="imageModeBtn">
                </button>

                <button
                    class="ak-toolbar-button"
                    id="darkModeBtn">
                </button>

                <button
                    class="ak-toolbar-button"
                    id="tmpBtn">
                    feature 3?
                </button>

                <button
                    class="ak-toolbar-button"
                    id="tmpBtn">
                    feature 4?
                </button> 

                <button
                    class="ak-toolbar-button"
                    id="tmpBtn">
                    feature 5?
                </button>
            </div>
        `;

        left.after(middle);
    }

    // =========================================================
    // Page Length Select
    // =========================================================

    function customisePageLengths() {

        const select =
            document.querySelector(
                'select[name="dataTable_length"]'
            ) ||
            document.querySelector(
                '.dataTables_length select'
            );

        if (!select || select.dataset.akPatched) return;

        select.dataset.akPatched = 'true';

        select.innerHTML = `
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
        `;

        select.value = '100';

        select.dispatchEvent(
            new Event('change', { bubbles: true })
        );
    }

    // =========================================================
    // State
    // =========================================================

    if (
        localStorage.getItem('imagePriorityMode') === null
    ) {
        localStorage.setItem(
            'imagePriorityMode',
            'true'
        );
    }

    let imageMode = localStorage.getItem('imagePriorityMode') === 'true';

    if (localStorage.getItem('darkMode') === null) {
        localStorage.setItem('darkMode', 'true');
    }

    let darkMode = localStorage.getItem('darkMode') === 'true';
    

    // =========================================================
    // Layout
    // =========================================================

    function applyDarkMode() {

        document.documentElement.classList.toggle(
            'dark-mode',
            darkMode
        );

        const btn =
            document.querySelector('#darkModeBtn');

        if (btn) {
            btn.textContent =
                darkMode ? 'Light Mode' : 'Dark Mode';
        }
    }

    function applyLayout() {

        customisePageLengths();
        addToolbar();

        table.classList.remove(
            'image-priority-mode',
            'data-priority-mode'
        );

        table.classList.add(
            imageMode
                ? 'image-priority-mode'
                : 'data-priority-mode'
        );

        document
            .querySelectorAll(
                '#dataTable tbody img'
            )
            .forEach(img => {

                img.style.maxWidth =
                    imageMode ? '500px' : '0px';

                img.style.width =
                    imageMode ? '500px' : '0px';

                img.style.height = 'auto';

            });

        const btn =
            document.querySelector(
                '#imageModeBtn'
            );

        if (btn) {
            btn.textContent =
                imageMode ? 'Data  Mode' : 'Image Mode';
        }
    }

    // =========================================================
    // Initial Setup
    // =========================================================

    applyLayout();
    applyDarkMode();

    const imageButton =
        document.querySelector(
            '#imageModeBtn'
        );

    if (
        imageButton &&
        !imageButton.dataset.akBound
    ) {

        imageButton.dataset.akBound = 'true';

        imageButton.addEventListener(
            'click',
            () => {

                imageMode = !imageMode;

                localStorage.setItem(
                    'imagePriorityMode',
                    imageMode
                );

                applyLayout();

            }
        );
    }

    const darkModeButton =
        document.querySelector(
            '#darkModeBtn'
        );

    if (
        darkModeButton &&
        !darkModeButton.dataset.akBound
    ) {

        darkModeButton.dataset.akBound = 'true';

        darkModeButton.addEventListener(
            'click',
            () => {

                darkMode = !darkMode;

                localStorage.setItem(
                    'darkMode',
                    darkMode
                );

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