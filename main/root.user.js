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

let enabled, left, path;
if(location.href.includes("analystSurvey")){
    ({enabled, left, path} = {
        enabled: localStorage.getItem('akEnableAnalystSurvey') !== 'false', left: '15%',
        path: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/analystSurvey/'
    });

    // Debug making it always true
    localStorage.setItem('akEnableAnalystSurvey', 'true');
}else if(location.href.includes("analystAutoMapV2")){
    ({enabled, left, path} = {
        enabled: localStorage.getItem('akEnableAutoMap') !== 'false', left: '10%',
        path: 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/analystAutoMapV2/'
    });

}else{
    return;
}

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
        left: ${left};
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
                    left: calc(${left} + 120px);
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

if(localStorage.getItem('disableInject') !== 'true' && enabled){
    Promise.all([
        fetch(`${path}style.css?t=` + Date.now(), {cache: 'no-store'}).then(r => {
            if (!r.ok) throw new Error(`CSS failed: ${r.status}`);
            return r.text();
        }),
        fetch(`${path}script.js?t=` + Date.now(), {cache: 'no-store'}).then(r => {
            if (!r.ok) throw new Error(`JS failed: ${r.status}`);
            return r.text();
        })
    ]).then(([css, js]) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        const script = document.createElement('script');
        script.textContent = js;
        document.head.appendChild(script);

        console.log("Resources loaded");
    }).catch(console.error);
}
