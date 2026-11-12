// Tooltips / keybinds
function pjs_p1(){
    // Keybind setting
    const KEYBINDS = {
        s: { id: "Save",action: "Save"},
        d: { id: "Delete",action: "Delete"},
        r: { id: "Reset",action: "Reset"},
        e: { id: "Edit",action: "Edit"},
        x: { id: "Move",action: "Move"},
        c: { id: "GroupMove", action: "GroupMove" }
    };
    let searchActive = false;

    document.addEventListener("keydown", (event) => {
        if (event.repeat) return;
        const input = document.querySelector('#findDefectNum input[name="defectNum"]');
        const active = document.activeElement;
        if(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
        if (input && active === input) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                // Submit defect
                const input2 = document.querySelector('#findDefectNum input[name="defectNum"]');
                if (!input2) return;
                const form = input2.closest("form");
                if (!form) return;
                const button = form.querySelector('button[type="submit"]');
                if (button) button.click();
                else form.requestSubmit?.();
                searchActive = false;
                input2.blur();
                return;
            }
            if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Tab"].includes(event.key)) return;
            if (!/^[0-9]$/.test(event.key)) event.preventDefault(); // Allow
            return;
        }
        if(!active || active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT" || active.isContentEditable) return;

        if (/^[0-9]$/.test(event.key)) {
            if (!input) return;
            input.focus();
            if (!searchActive) {
                input.value = "";
                searchActive = true;
            }
            input.value += event.key;
            event.preventDefault();
            input.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }

        const key = event.key.toLowerCase();
        const bind = KEYBINDS[key];
        if (!bind) return;
        const button = document.getElementById(bind.id);
        if(!button || button.disabled || button.hasAttribute("disabled")) return;
        event.preventDefault();
        button.click();
    });

    document.addEventListener("input", (event) => {
        const input = document.querySelector('#findDefectNum input[name="defectNum"]');
        if (!input || event.target !== input) return;
        const input2 = document.querySelector('#findDefectNum input[name="defectNum"]');
        if (!input2) return;
        const cleaned = input2.value.replace(/\D+/g, '');
        if (cleaned !== input2.value) input2.value = cleaned;
    });

    // Hover = Keybinds
    function updateTooltips() {
        Object.entries(KEYBINDS).forEach(([key, bind]) => {
            const button = document.getElementById(bind.id);
            if (!button) return;
            button.title = `${key.toUpperCase()} : ${bind.action}`;
        });
    }
    updateTooltips();
    //new MutationObserver(updateTooltips).observe(document.body, {childList: true, subtree: true});
}
pjs_p1();

// Moved Around Stuff
function js_p2(){
    const panel = document.querySelector('.leaflet-control-anomalyForm');

    const form = panel.querySelector('form');
    const imageSection = form.querySelector('.image-section');

    const horizontalWrapper = document.createElement('div');
    horizontalWrapper.className = 'horizontal-wrapper';

    const leftPane = document.createElement('div');
    leftPane.className = 'left-pane';

    const thermalPane = document.createElement('div');
    thermalPane.className = 'thermal-pane';

    const rgbPane = document.createElement('div');
    rgbPane.className = 'rgb-pane';

    const bottomPane = document.createElement('div');
    bottomPane.className = 'bottom-pane';

    const group = document.querySelector('.group-size-count');
    if (group) group.childNodes[0].textContent = 'Group Size: ';
    const mods = document.querySelector('.selected-modules-count');
    if (mods) mods.childNodes[0].textContent = 'Mod Count: ';

    const counterGroup = document.querySelector('.selected-modules-count');
    counterGroup.parentNode.appendChild(document.querySelector('.zone-display'));
    counterGroup.parentNode.appendChild(document.querySelector('.group-size-count'));

    // move everything except imageSection
    Array.from(form.children).forEach(el => {

        const hasButton =
              el.querySelector?.('button');

        if (el === imageSection) {
            return;
        }

        if (hasButton) {
            bottomPane.appendChild(el);
        } else {
            leftPane.appendChild(el);
        }
    });

    // split thumbnails
    const thumbs = imageSection.querySelectorAll('.thumbnail');

    if (thumbs.length >= 2) {
        thermalPane.appendChild(thumbs[0]);
        rgbPane.appendChild(thumbs[1]);
    }

    // build layout
    horizontalWrapper.appendChild(leftPane);
    horizontalWrapper.appendChild(thermalPane);
    horizontalWrapper.appendChild(rgbPane);

    // add to form
    form.appendChild(horizontalWrapper);
    form.appendChild(bottomPane);


    function clampPanelToViewport() {
        const maxX = Math.max(0, window.innerWidth - panel.offsetWidth - 20);
        const maxY = Math.max(0, window.innerHeight - panel.offsetHeight);

        const currentX = parseInt(panel.style.left, 10) || 0;
        const currentY = parseInt(panel.style.top, 10) || 0;

        panel.style.left = `${Math.min(currentX, maxX)}px`;
        panel.style.top = `${Math.min(currentY, maxY)}px`;

        localStorage.setItem('anomalyPanelX', panel.style.left);
        localStorage.setItem('anomalyPanelY', panel.style.top);
    }

    window.addEventListener('resize', clampPanelToViewport);

    if (panel) {
        panel.style.left = localStorage.getItem('anomalyPanelX') || '0px';
        panel.style.top = localStorage.getItem('anomalyPanelY') || '0px';

        const handle = panel.querySelector('h3.mode');

        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '⇆';
        toggleBtn.title = 'Toggle Layout';
        toggleBtn.className = 'layout-toggle';
        handle.parentNode.insertBefore(toggleBtn, handle);

        const darkBtn = document.createElement('button');
        darkBtn.innerHTML = 'D';
        darkBtn.title = 'Toggle Dark Mode';
        darkBtn.className = 'layout-toggle';
        handle.parentNode.insertBefore(darkBtn, handle);

        const dragBar = document.createElement('div');
        dragBar.className = 'drag-bar';
        handle.parentNode.insertBefore(dragBar, handle);
        dragBar.appendChild(toggleBtn);
        dragBar.appendChild(darkBtn);
        dragBar.appendChild(handle);

        toggleBtn.addEventListener('click', () => {
            if (localStorage.getItem('anomalyPanelImagesHidden') === 'true') return;
            panel.classList.toggle('horizontal');
            localStorage.setItem(
                'anomalyPanelHorizontal',
                panel.classList.contains('horizontal')
            );
            requestAnimationFrame(clampPanelToViewport);
        });
        if (localStorage.getItem('anomalyPanelHorizontal') === 'true') panel.classList.add('horizontal');

        function updateDarkMode() {
            const enabled = localStorage.getItem('anomalyPanelDarkMode') === 'true';
            document.body.classList.toggle('anomaly-darkmode', enabled);
        }

        darkBtn.addEventListener('click', () => {
            const enabled = localStorage.getItem('anomalyPanelDarkMode') === 'true';
            localStorage.setItem('anomalyPanelDarkMode',(!enabled).toString());
            updateDarkMode();
        });

        updateDarkMode();


        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener('mousedown', (e) => {
            dragging = true;

            handle.classList.add('dragging');
            panel.classList.add('dragging');

            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;

            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;

            x = Math.max(0, Math.min(x, maxX - 20));
            y = Math.max(0, Math.min(y, maxY - 70));

            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;

            dragging = false;
            handle.classList.remove('dragging');
            panel.classList.remove('dragging');


            localStorage.setItem('anomalyPanelX', panel.style.left);
            localStorage.setItem('anomalyPanelY', panel.style.top);
        });
    }
}
js_p2();