// ==UserScript==
// @name         Above.D.Inject
// @namespace    https://github.com/AdamKenning
// @version      1.0.1
// @description  Feature addition / QOL changes
// @author       Adam K

// @match        https://analyst*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @grant GM_getResourceText
// @grant GM_info

// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js
// @updateURL   https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js
// ==/UserScript==

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

if(localStorage.getItem('disableInject') !== 'true'){
    const routes = [
        {
            match: location.pathname.includes('analystSurvey.php'),
            js: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/survey/script.js',
            css:'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/survey/style.css'
        }
        // {
        //     match: location.pathname.includes('analystAutoMapV2.php'),
        //     js: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/automap/script.js',
        //     css: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/automap/style.css'
        // }
    ];
    const route = routes.find(r => r.match);
    if(route){
        loadCss(route.css);
        loadJs(route.js);
    }
}