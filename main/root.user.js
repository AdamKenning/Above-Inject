// ==UserScript==
// @name         Above.D.Inject
// @namespace    https://github.com/AdamKenning
// @version      2.0.0
// @description  Feature addition / QOL changes
// @author       Adam K

// @match        *://*/*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/root.user.js
// @updateURL   https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/root.user.js
// ==/UserScript==

const pageName = location.pathname.split('/').pop().replace('.php', '');

const supportedPages = {
    analystSurvey: {left: '15%'},
    //analystPortal: {left: '25%'},
    //analystAutoMapV2: {left: '10%'}
};
const pageConfig = supportedPages[pageName];
if (!pageConfig) return;

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
        left: ${pageConfig.left};
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
            'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js?t=' + Date.now(), {cache: 'no-store'}
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
                    background: #aaaaaa;
                    color: #000000;
                    border: 2px solid #000000;

                    border-radius:4px;
                    cursor:pointer;
                    padding:4px 8px;
                    min-width:100px;

                    position: fixed;
                    top: 2px;
                    left: calc(${pageConfig.left} + 120px);
                    transform: translateX(-50%);
                    z-index: 999999;
                `;

        if(githubVersion !== VERSION){
            btn.textContent = `v${VERSION} \u2794 v${githubVersion}`;
            btn.title = `Installed: ${VERSION}\nLatest:     ${githubVersion}\nClick to update`;
            btn.onclick = () => {window.open('https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js','_blank');};
        }else{
            btn.textContent = `v${VERSION}`;
            btn.title = `Installed: ${VERSION}\nLatest:     ${githubVersion}\nNo new updates`;
        }
        if (document.body){document.body.appendChild(btn);}
        else{window.addEventListener('DOMContentLoaded', () => {document.body.appendChild(btn);});}
    }catch (err){console.error('Version check failed', err);}
}
checkForUpdates();

if(localStorage.getItem('disableInject') !== 'true'){
    const path = `https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/${pageName}/` ;
    const script_js_path = `${path}script.js`;
    const style_css_path = `${path}style.css`;

    // Fetch CSS
    fetch(style_css_path + '?t=' + Date.now()).then(r => {
        if (!r.ok) throw new Error(`CSS failed: ${r.status}`);
        return r.text();
    }).then(css => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }).catch(console.error);

    // Fetch JS
    fetch(script_js_path + '?t=' + Date.now()).then(r => {
        if (!r.ok) throw new Error(`JS failed: ${r.status}`);
        return r.text();
    }).then(js => {
        const script = document.createElement('script');
        script.textContent = js;
        document.head.appendChild(script);
    }).catch(console.error);
}