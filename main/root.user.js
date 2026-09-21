// ==UserScript==
// @name         Above.D.Inject
// @namespace    https://github.com/AdamKenning
// @version      2.0.2
// @description  Feature addition / QOL changes
// @author       Adam K

// @match        *://*/*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @grant GM_getValue
// @grant GM_setValue
// @grant GM_openInTab

// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js
// @updateURL   https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js
// ==/UserScript==

const DEV_MODE = false;

let pending_update = false;
let latest_version = GM_info.script.version;
let github_version = null;

class Module {
    static BASE_PATH = 'https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/'
    static CACHE_TIMEOUT = 15 * 60 * 1000; // 15 mins

    constructor(name, posLeft, posDown) {
        this.name = name;
        this.posLeft = posLeft;
        this.posDown = posDown;
    }

    // Admin Enable
    get stateLive(){return GM_getValue(`${this.name}_stateLive`, false);}
    set stateLive(state){return GM_setValue(`${this.name}_stateLive`, state);}

    // User Enable
    get stateEnabled(){return GM_getValue(`${this.name}_stateEnabled`, true);}
    set stateEnabled(state){return GM_setValue(`${this.name}_stateEnabled`, state);}

    async fetchStyleCss(){
        try{
            return await fetch(`${Module.BASE_PATH}${this.name}/style.css?t=${Date.now()}`,{cache: 'no-store' }).then(r => r.text());
        }catch(err){
            console.error(`Version ${this.name} styleJS get failed: `, err);
            return null;
        }
    }

    async fetchScriptJs(){
        try{
            return await fetch(`${Module.BASE_PATH}${this.name}/script.js?t=${Date.now()}`,{cache: 'no-store' }).then(r => r.text());
        }catch(err){
            console.error(`Version ${this.name} styleJS get failed: `, err);
            return null;
        }
    }

    async load() {
        try{
            const [css, js] = await Promise.all([this.fetchStyleCss(),this.fetchScriptJs()]);
            if(!css || !js) throw new Error(`${this.name} resources missing`);

            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);

            const script = document.createElement('script');
            script.textContent = js;
            document.head.appendChild(script);

            console.log(`${this.name} loaded`);
        }
        catch(err){console.error(`${this.name} load failed`, err);}
    }

    async getVersion(){
        const checkTime = GM_getValue(`${this.name}_versionChecktime`, 0);
        if(Date.now() - checkTime >= Module.CACHE_TIMEOUT){
            const styleJs = await this.fetchScriptJs();
            if(styleJs){
                const match = styleJs.match(/const VERSION\s*=\s*['"]([^'"]+)['"]/); // <---------------------------- Maybe check ?
                if(match){
                    GM_setValue(`${this.name}_version`, match[1]);
                    GM_setValue(`${this.name}_versionChecktime`, Date.now());
                    return match[1]
                }
            }
        }
        return GM_getValue(`${this.name}_version`, null);
    }
}

const modules = [
    new Module("analystSurvey", '15%', '2px'),
    new Module("analystAutoMapV2", '20%', '10px'),
];

// Debug Force Overide
modules.find(m => m.name === "analystSurvey").stateLive = true;
modules.find(m => m.name === "analystAutoMapV2").stateLive = false;

// Main Stuff
const curentModule = modules.find(m => location.href.includes(m.name));

if(!curentModule || (!curentModule.stateLive && !DEV_MODE)) return;
if(curentModule.stateEnabled) curentModule.load();

async function checkForUpdates() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js?t=' + Date.now(), { cache: 'no-store' });
        const text = await response.text();
        const match = text.match(/@version\s+([0-9.]+)/);
        if (!match) return;
        github_version = match[1];
        if (github_version !== latest_version) pending_update = true;
    } catch (err) {console.error('Version check failed', err);}
}

async function addMenu() {
    const menu = document.createElement('div');
    menu.id = 'ak-menu';
    menu.style.cssText = `
        background: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 4px;
        width: 200px;

        position: fixed;
        top: ${curentModule.posDown};
        left: ${curentModule.posLeft};
        z-index: 999999;
        overflow: hidden;

        transition: width 0.2s ease;
    `;

    document.body.appendChild(menu);


    const header = document.createElement('div');
    header.style.cssText = `
        display: grid;
        grid-template-columns: 150px 50px;
        align-items: center;

        border-radius: 4px;
        padding: 2px 8px;
        background: #dddddd;

        transition: grid-template-columns 0.2s ease;
    `;

    const head_name = document.createElement('span');
    const head_version = document.createElement('span');
    const head_button = document.createElement('button');


    head_name.style.cssText = `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    head_version.style.textAlign = 'left';

    function updateHeader() {
        if (pending_update) {
            head_name.textContent = 'Upgrade Available';
            head_name.title = `${latest_version} -> ${github_version} Click to Upgrade`;
            head_name.style.cssText = `
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
                color: #0066cc;
                font-weight: bold;
                text-decoration: underline;
            `;
            head_name.onclick = () => {window.open('https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/root.user.js','_blank');};
        }else{
            head_name.textContent = 'Above.D.Inject';
            head_name.style.cssText = `
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            head_name.onclick = null;
        }
    }
    updateHeader();
    head_version.textContent = `v${GM_info.script.version}`;


    head_button.textContent = 'INFO';
    head_button.title = 'Open Project Repo';

    head_button.style.cssText = `
        display: none;
        width: 35px;
        padding: 0;
        border: none;
        border-radius: 4px;
        background: #368EE0;
        color: #000000;
    `;

    head_button.onclick = () => {window.open('https://github.com/AdamKenning/Above-Inject','_blank');};


    header.append(head_name, head_version, head_button);
    menu.appendChild(header);


    const details = document.createElement('div');

    details.style.cssText = `
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin-top: 0;

        transition:
            max-height 0.3s ease,
            opacity 0.3s ease,
            margin-top 0.3s ease;
    `;

    menu.appendChild(details);


    menu.addEventListener('mouseenter', () => {
        menu.style.width = '250px';

        header.style.gridTemplateColumns = '150px 50px 50px';

        details.style.maxHeight = '500px';
        details.style.opacity = '1';
        details.style.marginTop = '10px';

        head_button.style.display = 'block';
    });


    menu.addEventListener('mouseleave', () => {
        menu.style.width = '200px';

        header.style.gridTemplateColumns = '150px 50px';

        details.style.maxHeight = '0';
        details.style.opacity = '0';
        details.style.marginTop = '0';

        head_button.style.display = 'none';
    });

    // Per Module
    for(const module of modules){
        if(!module.stateLive && !DEV_MODE) continue;
        const isCurrent = module.name === curentModule.name;

        const row = document.createElement('div');
        row.style.cssText = `
            display:grid;
            grid-template-columns:150px 50px 50px;
            align-items:center;

            border-radius:4px;
            padding:2px 8px;
            margin-top:2px;

            background:#dddddd;
        `;

        const name = document.createElement('span');
        const version = document.createElement('span');
        const button = document.createElement('button');

        name.textContent = module.name;

        version.textContent = '...';
        version.title = `Updates Last Checked at ${new Date(GM_getValue(`${module.name}_versionChecktime`, 0)).toLocaleString()}`;

        button.textContent = module.stateEnabled ? 'OFF' : 'ON';
        button.title = `Turn ${module.stateEnabled ? 'OFF' : 'ON'} ${module.name} Edits`;
        button.classList.add('ak-respect_color');

        name.style.cssText = `
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
        `;

        version.style.textAlign = 'left';

        button.style.cssText = `
            width:35px;
            padding:0;
            border: none;
            border-radius:4px;
            background:${module.stateEnabled ? "#dd2222":"#22dd22"};
            color:${module.stateEnabled ? "#ffffff":"#000000"};
        `;

        button.addEventListener('click', () => {
            module.stateEnabled = !module.stateEnabled;
            location.reload();
        });

        row.append(name, version, button);
        details.appendChild(row);

        // Fetch/cache version without holding up creation of the row
        module.getVersion().then(v => {version.textContent = v ? `v${v}` : 'v_._._';});
    }
}

async function init() {
    await checkForUpdates();
    await addMenu();
}

init();
