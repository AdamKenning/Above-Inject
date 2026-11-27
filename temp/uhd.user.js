// ==UserScript==
// @name         Temp Swindon List Check Thing
// @namespace    http://tampermonkey.net/
// @version      2026-11-27.5
// @match        *://*/analystSurvey.php?surveyId=23280*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const T = '#DataTables_Table_0';
    let imgW = +localStorage.getItem('akImgW') || 500;
    const hidden = new Set();

    const css = document.createElement('style');
    const hideCss = document.createElement('style');
    css.textContent = `
        ${T} { table-layout: fixed !important; width: 100% !important; }
        ${T} th, ${T} td { white-space: normal !important; overflow-wrap: break-word; position: relative; }
        ${T} thead th { white-space: nowrap !important; overflow: hidden; }
        ${T} thead br { display: none; }
        ${T} .thumbnail img { width: 100%; }
        .ak-rs { position: absolute; top: 0; right: -4px; width: 8px; height: 100%; cursor: col-resize; z-index: 10; background: rgba(0,120,255,.25); }
        .ak-tr th { padding: 0 !important; font-size: 11px; text-align: center; overflow: visible !important; }
        .ak-t { cursor: pointer; color: #337ab7; }
        .ak-t.show { position: absolute; left: 0; top: 0; transform: translateX(-50%); z-index: 20; background: #ffc; border: 1px solid #999; padding: 0 3px; }
    `;
    document.head.append(css, hideCss);

    setInterval(() => {
        const table = document.querySelector(T);
        const sel = document.querySelector('.dataTables_length select');

        // Page length: extra options, remembered, default 100
        if (sel && !sel.dataset.ak) {
            sel.dataset.ak = 1;
            sel.innerHTML = [10, 25, 50, 100, 500, 1000].map(n => `<option>${n}</option>`).join('');
            sel.onchange = () => localStorage.setItem('akLen', sel.value);
            sel.value = localStorage.getItem('akLen') || 100;
            jQuery(sel).trigger('change');
        }
        if (!table || table.dataset.ak) return;
        table.dataset.ak = 1;

        const ths = [...table.querySelector('thead tr').children];
        const img = ths.findIndex(th => th.textContent.trim() === 'RGB Image');

        // Hide/show row
        const row = document.createElement('tr');
        row.className = 'ak-tr';
        ths.forEach((_, i) => {
            const cell = document.createElement('th');
            const t = document.createElement('span');
            t.className = 'ak-t';
            t.textContent = 'hide';
            t.onclick = e => {
                e.stopPropagation();
                hidden.has(i) ? hidden.delete(i) : hidden.add(i);
                t.textContent = hidden.has(i) ? 'show' : 'hide';
                t.classList.toggle('show', hidden.has(i));
                hideCss.textContent = [...hidden].map(n =>
                    `${T} tr > :nth-child(${n + 1}) { width: 0 !important; padding: 0 !important; border: 0; }
                     ${T} tr:not(.ak-tr) > :nth-child(${n + 1}) { font-size: 0; overflow: hidden; }
                     ${T} tr:not(.ak-tr) > :nth-child(${n + 1}) > * { display: none !important; }`).join('');
            };
            cell.appendChild(t);
            row.appendChild(cell);
        });
        ths[0].parentNode.before(row);
        if (img < 0) return;

        // Image column width (fixed layout reads the first row, so set both)
        const setW = () => { ths[img].style.width = row.children[img].style.width = imgW + 'px'; };
        setW();

        const rs = document.createElement('div');
        rs.className = 'ak-rs';
        rs.onclick = e => e.stopPropagation();
        rs.onmousedown = e => {
            e.preventDefault(); e.stopPropagation();
            const x0 = e.pageX, w0 = ths[img].offsetWidth;
            const move = ev => { imgW = Math.max(80, w0 + ev.pageX - x0); setW(); };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', move);
                localStorage.setItem('akImgW', imgW);
            }, { once: true });
        };
        ths[img].appendChild(rs);
    }, 500);
})();
