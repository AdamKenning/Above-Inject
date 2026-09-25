// ==UserScript==
// @name         AboveInject
// @namespace    https://github.com/AdamKenning
// @version      5.1.0
// @description  Feature addition / QOL changes to the Survey page of Solargain
// @author       Adam K

// @match        https://analyst.abovesurveying.com/analystSurvey.php?*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @grant GM_getResourceText
// @grant GM_info

// @downloadURL https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js
// @updateURL   https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/myscript.user.js
// ==/UserScript==

(function () {
    const overlay = document.createElement('div');

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: sans-serif;
    `;

    overlay.innerHTML = `
        <div style="
            background:#fff;
            color:#000;
            padding:30px;
            border-radius:12px;
            max-width:800px;
            text-align:center;
            box-shadow:0 10px 40px rgba(0,0,0,0.4);
        ">
            <h2>The Inject Has Been Moved</h2>

            <p>
                (No Functionality is Changing)
            </p>

            <p>
                Please install <strong>Above.D.Inject</strong>.
                and uninstall <strong>AboveInject</strong>
            
            </p>

            <img src="https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/temp/image.png" style="max-width:100%; border:1px solid ning/Above-Inject/main/root.user.js">

            <p>
                Click below to install the new version.
            </p>

            <p>
                <a href="https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/root.user.js"
                   target="_blank"
                   style="
                       display:inline-block;
                       padding:10px 20px;
                       background:#368EE0;
                       color:white;
                       text-decoration:none;
                       border-radius:6px;
                   ">
                    Install Above.D.Inject
                </a>
            </p>
        </div>
    `;

    document.body.appendChild(overlay);
})();
