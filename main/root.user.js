// ==UserScript==
// @name         Above.D.Inject
// @namespace    https://github.com/AdamKenning
// @version      1.0.0
// @description  Feature addition / QOL changes
// @author       Adam K

// @match        https://analyst*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @grant GM_getResourceText
// @grant GM_info

// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/root.user.js
// @updateURL   https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/root.user.js
// ==/UserScript==

const routes = [
    {
        match: location.pathname.includes('analystSurvey.php'),
        js: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/survey/script.js',
        css: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/survey/style.css'
    }
    // {
    //     match: location.pathname.includes('analystAutoMapV2.php'),
    //     js: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/automap/script.js',
    //     css: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/automap/style.css'
    // }
];

const route = routes.find(r => r.match);

if(localStorage.getItem('disableInject') !== 'true'){
    loadCss(route.css);
    loadJs(route.js);
}