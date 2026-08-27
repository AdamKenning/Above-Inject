// ==UserScript==
// @name         TimeKeeperInject
// @namespace    https://github.com/AdamKenning
// @version      1.0.0
// @description  Feature addition / QOL changes to TimeKeeper
// @author       Adam K

// @match        https://app.timekeeper.co.uk/home
// @icon         https://analyst.abovesurveying.com/img/logo@2x.png

// @resource     mainCss https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/timekeeper/timekeeper.css?v=1.0.0
// @grant GM_getResourceText

// @downloadURL  https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/timekeeper/timekeeper.user.js
// @updateURL    https://raw.githubusercontent.com/AdamKenning/Above-Inject/main/main/timekeeper/timekeeper.user.js
// ==/UserScript==

const STORAGE_KEY = "tk_recent_jobs";

function saveRecentEntry() {
    const jobInput = document.querySelector('input[name="job"]');
    const activityInput = document.querySelector('input[name="activity"]');
    if (!jobInput || !activityInput) return;
    const jobText = document.querySelector('#react-select-15--value-item')?.textContent || "Unknown Job";
    const activityText = document.querySelector('#react-select-18--value-item')?.textContent || "Unknown Activity";

    const entry = {
        jobId: jobInput.value, jobText,
        activityId: activityInput.value, activityText,
        timestamp: Date.now()
    };

    let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    items = items.filter( x => !(x.jobId === entry.jobId && x.activityId === entry.activityId));
    items.unshift(entry);
    items = items.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createRecentContainer() {
    if (document.querySelector("#tk-recent-container")) return;
    const dialog = document.querySelector(".clock-dialog");
    if (!dialog) return;
    const container = document.createElement("div");
    container.id = "tk-recent-container";
    container.innerHTML = `
        <div class="tk-header">
            Recent Jobs
        </div>
        <div class="tk-list"></div>
    `;
    dialog.parentNode.style.display = "flex";
    dialog.parentNode.style.gap = "15px";
    dialog.parentNode.appendChild(container);
    renderRecentList();
}

function renderRecentList() {
    const list = document.querySelector("#tk-recent-container .tk-list");
    if (!list) return;
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    list.innerHTML = "";
    items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "tk-recent-item";
        row.innerHTML = `
            <div class="job">${item.jobText}</div>
            <div class="activity">${item.activityText}</div>
        `;
        row.addEventListener("click", () => {applyRecentEntry(item);});
        list.appendChild(row);
    });
}

document.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.textContent.trim() === "Clock In") {saveRecentEntry();}
});

createRecentContainer();