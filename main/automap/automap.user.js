// ==UserScript==
// @name         AutomapInject
// @namespace    https://github.com/AdamKenning
// @version      0.0.2
// @description  Feature addition / QOL changes to the Automap page of Solargain
// @author       Adam K

// @match        https://analyst.abovesurveying.com/analystAutoMapV2.php?*
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @resource     mainCss https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/automap/automap.css

// @grant        GM_getResourceText

// @downloadURL  https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/automap/automap.user.js
// @updateURL    https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/automap/automap.user.js
// ==/UserScript==

const css = GM_getResourceText("mainCss");
const style = document.createElement("style");

style.textContent = css;
document.head.appendChild(style);

// dark mode - mod box fix
// type anywhere - go to anom after time out
// e.g. 191e --> open anom 191 and trigger clcik on edit button