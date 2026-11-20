const VERSION = "2.1.1";

function keybinds(){
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
keybinds();

function ui(){
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
ui();

// SpeedUp: no closePath + batch same-style polygons into one fill
function speedup(){
    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    function apply(){
        const L = W.L;
        if (!L || !L.Canvas) return false;
        const P = L.Canvas.prototype;
        if (P._akBatched) return true;
        P._akBatched = true;

        const origCircle = P._updateCircle;

        P._akFlush = function(){
            const b = this._akBatch;
            if (!b) return;
            this._akBatch = null;
            this._fillStroke(this._ctx, b.layer); // one fill/stroke for the whole batch
        };

        P._updatePoly = function (layer, closed) {
            if (!this._drawing) return;
            const parts = layer._parts, ctx = this._ctx;
            if (!parts.length) return;
            const o = layer.options;
            const key = [closed, o.stroke, o.color, o.weight, o.opacity, o.lineCap, o.lineJoin,
                         o.dashArray, o.fill, o.fillColor, o.fillOpacity, o.fillRule].join('|');
            if (!this._akBatch || this._akBatch.key !== key) {
                this._akFlush();
                ctx.beginPath();
                this._akBatch = { key, layer };
            }
            for (let i = 0; i < parts.length; i++) {
                const ring = parts[i];
                if (!ring.length) continue;
                ctx.moveTo(ring[0].x, ring[0].y);
                for (let j = 1; j < ring.length; j++) ctx.lineTo(ring[j].x, ring[j].y);
                if (closed) ctx.lineTo(ring[0].x, ring[0].y);
            }
        };


        P._draw = function () {
            const bounds = this._redrawBounds;
            this._ctx.save();
            if (bounds) {
                const size = bounds.getSize();
                this._ctx.beginPath();
                this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
                this._ctx.clip();
            }
            this._drawing = true;
            this._akBatch = null;
            for (let order = this._drawFirst; order; order = order.next) {
                const layer = order.layer;
                if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
                    layer._updatePath();
                }
            }
            this._akFlush();
            this._drawing = false;
            this._ctx.restore();
        };
        return true;
    }
    if (!apply()) {
        const t = setInterval(() => { if (apply()) clearInterval(t); }, 100);
        setTimeout(() => clearInterval(t), 30000);
    }
}
speedup();

// Rotate map: Shift+wheel (Shift+Alt+wheel = fine), Shift+R = reset
function rotateMap(){
    // ---- settings ----
    const STEP_DEG = 1; // degrees per Alt+wheel notch
    const BIG_STEP_DEG = 10; // degrees per Alt+Shift+wheel notch
    const DEFAULT_DEG = 0; // starting / reset angle
    const REMEMBER_ANGLE = true; // false = always start at DEFAULT_DEG
    const TOAST_MS = 900; // how long the angle toast stays visible
    // ------------------

    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const KEY = 'akMapAngle:' + location.pathname + location.search;
    const saved = REMEMBER_ANGLE ? parseFloat(localStorage.getItem(KEY)) : NaN;
    let angle = Number.isFinite(saved) ? saved : DEFAULT_DEG;
    let map = null, rotor = null, redrawTimer = null, toast = null, toastTimer = null;

    const rad = () => angle * Math.PI / 180;
    const rot = (x, y, a) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });

    function showToast(){
        if (!toast) {
            toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000000; pointer-events: none;
                padding: 8px 16px; border-radius: 6px;
                font: 600 22px/1 Arial, sans-serif;
                color: #fff; background: rgba(0,0,0,0.65);
                opacity: 0; transition: opacity 0.15s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = `${angle}°`;
        toast.style.background = angle === 0 ? 'rgba(22,163,74,0.85)' : 'rgba(0,0,0,0.65)';
        toast.style.opacity = '1';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, TOAST_MS);
    }

    function apply(){
        const L = W.L;
        const pane = document.querySelector('.leaflet-map-pane');
        if (!L || !L.Map || !pane) return false;
        if (L.Map.prototype._akRot) return true;
        L.Map.prototype._akRot = true;

        // 1. capture the map instance the first time Leaflet asks for its size
        const origGetSize = L.Map.prototype.getSize;
        L.Map.prototype.getSize = function(){ map = map || this; return origGetSize.call(this); };

        // 2. wrapper that rotates around the container centre
        const container = pane.parentNode;
        rotor = document.createElement('div');
        rotor.className = 'ak-rotor';
        rotor.style.cssText = 'position:absolute;inset:0;transform-origin:50% 50%;z-index:400;';
        container.insertBefore(rotor, pane);
        rotor.appendChild(pane);

        // 3. un-rotate mouse positions (clicks, hover, canvas hit-test, wheel zoom anchor)
        const origM2C = L.Map.prototype.mouseEventToContainerPoint;
        L.Map.prototype.mouseEventToContainerPoint = function(e){
            const p = origM2C.call(this, e);
            if (!angle) return p;
            const s = this.getSize(), cx = s.x / 2, cy = s.y / 2;
            const r = rot(p.x - cx, p.y - cy, -rad());
            return L.point(r.x + cx, r.y + cy);
        };

        // 4. un-rotate drag deltas (map pan + marker drag inside the rotated pane)
        const origOnMove = L.Draggable.prototype._onMove;
        L.Draggable.prototype._onMove = function(e){
            if (!angle || !rotor.contains(this._element)) return origOnMove.call(this, e);
            if (e._simulated || !this._enabled) return;
            if (e.touches && e.touches.length > 1) { this._moved = true; return; }
            const first = (e.touches && e.touches.length === 1) ? e.touches[0] : e;
            let dx = first.clientX - this._startPoint.x, dy = first.clientY - this._startPoint.y;
            if (!dx && !dy) return;
            if (Math.abs(dx) + Math.abs(dy) < this.options.clickTolerance) return;
            const r = rot(dx, dy, -rad());
            const offset = L.point(r.x / this._parentScale.x, r.y / this._parentScale.y);
            L.DomEvent.preventDefault(e);
            if (!this._moved) {
                this.fire('dragstart');
                this._moved = true;
                this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);
                L.DomUtil.addClass(document.body, 'leaflet-dragging');
                this._lastTarget = e.target || e.srcElement;
                if (W.SVGElementInstance && this._lastTarget instanceof W.SVGElementInstance) {
                    this._lastTarget = this._lastTarget.correspondingUseElement;
                }
                L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
            }
            this._newPos = this._startPos.add(offset);
            this._moving = true;
            L.Util.cancelAnimFrame(this._animRequest);
            this._lastEvent = e;
            this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true);
        };

        // 5. load tiles for the rotated corners
        const origTiled = L.GridLayer.prototype._getTiledPixelBounds;
        L.GridLayer.prototype._getTiledPixelBounds = function(center){
            const b = origTiled.call(this, center);
            if (!angle) return b;
            const s = this._map.getSize(), d = Math.hypot(s.x, s.y);
            const px = (d - s.x) / 2, py = (d - s.y) / 2;
            return L.bounds(b.min.subtract([px, py]), b.max.add([px, py]));
        };

        setAngle(angle, true);
        return true;
    }

    // canvas/SVG renderers: enlarge their drawn area while rotated
    function updateRenderers(){
        if (!map) return;
        const s = map.getSize(), d = Math.hypot(s.x, s.y);
        const pad = angle ? Math.max(0.1, (d / Math.min(s.x, s.y) - 1) / 2) : 0.1;
        Object.values(map._layers).forEach(l => {
            if (l instanceof W.L.Renderer) l.options.padding = pad;
        });
        map.fire('moveend'); // redraw tiles + renderers once
    }

    function setAngle(a, immediate){
        a = Math.round(a); // snap to whole degrees
        angle = ((a % 360) + 540) % 360 - 180; // keep in -180..180
        if (angle === -180) angle = 180;
        if (Object.is(angle, -0)) angle = 0;
        rotor.style.transform = angle ? `rotate(${angle}deg)` : '';
        localStorage.setItem(KEY, angle);
        clearTimeout(redrawTimer);
        redrawTimer = setTimeout(updateRenderers, immediate ? 0 : 200); // redraw after wheel stops
        if (!immediate) showToast();
    }

    // Alt+wheel rotates by STEP_DEG, Alt+Shift+wheel by BIG_STEP_DEG; everything else passes through
    let altUsedForRotate = false;
    document.addEventListener('wheel', e => {
        if (!rotor || !e.altKey || e.ctrlKey || e.metaKey) return;
        if (!rotor.parentNode.contains(e.target)) return;
        e.preventDefault(); e.stopPropagation();
        const delta = e.deltaY || e.deltaX; // Shift+wheel often reports deltaX
        if (!delta) return;
        altUsedForRotate = true;
        setAngle(angle + Math.sign(delta) * (e.shiftKey ? BIG_STEP_DEG : STEP_DEG));
    }, { capture: true, passive: false });

    // On Windows, releasing Alt on its own focuses the browser menu; suppress that after rotating
    document.addEventListener('keyup', e => {
        if (e.key === 'Alt' && altUsedForRotate) {
            e.preventDefault();
            altUsedForRotate = false;
        }
    }, true);

    if (!apply()) {
        const t = setInterval(() => { if (apply()) clearInterval(t); }, 100);
        setTimeout(() => clearInterval(t), 30000);
    }
}
rotateMap();

// Info popup: Alt+I toggles a quick overview of the injected features
function infoPopup(){
    // ---- settings ----
    const HINT_MS = 2000; // how long the "Alt + I" hint stays on screen after load
    const HINT_DELAY = 1000; // wait a moment so it doesn't fight with the page loading
    // ------------------

    const SECTIONS = [
        ['Keybinds (when not typing in a field)', [
            ['S', 'Save'],
            ['D', 'Delete'],
            ['R', 'Reset'],
            ['E', 'Edit'],
            ['X', 'Move'],
            ['C', 'Group move'],
            ['0–9', 'Type a defect number to jump to it (Enter / Space to search)'],
        ]],
        ['Map', [
            ['Alt + wheel', 'Rotate map 1°'],
            ['Alt + Shift + wheel', 'Rotate map 10°'],
            ['Edge arrow', 'Click to jump back to the zone when it is off screen'],
        ]],
        ['Anomaly panel', [
            ['Drag title bar', 'Move the panel'],
            ['⇆ button', 'Toggle wide / narrow layout'],
            ['D button', 'Toggle dark mode'],
        ]],
        ['', [
            ['Alt + I', 'Show / hide this help'],
        ]],
    ];

    let box = null, hint = null;

    const style = document.createElement('style');
    style.textContent = `
    #ak-info{position:fixed;inset:0;z-index:1000001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);}
    #ak-info .ak-info-card{background:#fff;color:#222;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,.35);
        padding:12px 16px 14px;max-width:min(520px,92vw);max-height:85vh;overflow:auto;font:13px/1.45 Arial,sans-serif;}
    #ak-info .ak-info-head{font-weight:700;font-size:15px;color:#fff;background:#3498db;margin:-12px -16px 8px;padding:8px 16px;
        border-radius:6px 6px 0 0;display:flex;justify-content:space-between;align-items:center;}
    #ak-info .ak-info-x{cursor:pointer;padding:0 4px;}
    #ak-info .ak-info-sec{font-weight:700;margin:10px 0 4px;color:#1f6fb2;}
    #ak-info .ak-info-gap{height:8px;}
    #ak-info table{border-collapse:collapse;width:100%;}
    #ak-info td{padding:2px 6px;vertical-align:top;}
    #ak-info td:first-child{white-space:nowrap;width:1%;}
    #ak-info kbd, #ak-info-hint kbd{display:inline-block;min-width:18px;text-align:center;padding:1px 5px;border:1px solid #bbb;border-bottom-width:2px;
       border-radius:3px;background:#f6f6f6;font:600 11px/1.4 Arial,sans-serif;color:#333;}
    #ak-info-hint{position:fixed;top:12px;left:50%;transform:translate(-50%,-8px);z-index:1000001;pointer-events:none;
        padding:5px 12px;border-radius:14px;background:rgba(0,0,0,.65);color:#fff;font:12px/1.4 Arial,sans-serif;
        opacity:0;transition:opacity .3s ease, transform .3s ease;}
    #ak-info-hint.show{opacity:1;transform:translate(-50%,0);}
    `;
    document.head.appendChild(style);

    function build(){
        box = document.createElement('div');
        box.id = 'ak-info';
        box.innerHTML = `
            <div class="ak-info-card">
                <div class="ak-info-head">Above.D.Inject: page features <span class="ak-info-x" title="Close (Esc)">✕</span></div>
                ${SECTIONS.map(([title, rows]) => `
                    ${title ? `<div class="ak-info-sec">${title}</div>` : '<div class="ak-info-gap"></div>'}
                    <table>${rows.map(([k, v]) => `
                        <tr><td>${k ? k.split(' + ').map(x => `<kbd>${x}</kbd>`).join(' + ') : ''}</td><td>${v}</td></tr>`).join('')}
                    </table>`).join('')}
            </div>`;
        box.addEventListener('mousedown', e => { if (e.target === box || e.target.classList.contains('ak-info-x')) hide(); });
        document.body.appendChild(box);
    }

    function show(){ hideHint(); if (!box) build(); box.style.display = 'flex'; }
    function hide(){ if (box) box.style.display = 'none'; }
    const isOpen = () => box && box.style.display !== 'none';

    // small "Alt + I" reminder after load
    function showHint(){
        hint = document.createElement('div');
        hint.id = 'ak-info-hint';
        hint.innerHTML = 'Press <kbd>Alt</kbd> + <kbd>I</kbd> for Above.D.Inject info';
        document.body.appendChild(hint);
        requestAnimationFrame(() => hint.classList.add('show'));
        setTimeout(hideHint, HINT_MS);
    }
    function hideHint(){
        if (!hint) return;
        const h = hint; hint = null;
        h.classList.remove('show');
        setTimeout(() => h.remove(), 400);
    }
    setTimeout(showHint, HINT_DELAY);

    document.addEventListener('keydown', e => {
        if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyI') {
            e.preventDefault(); e.stopPropagation();
            isOpen() ? hide() : show();
        } else if (e.key === 'Escape' && isOpen()) {
            hide();
        }
    }, true);
}
infoPopup();

// Remember map view across reloads + arrow pointing back to the zone when it's off screen
function rememberView(){
    // ---- settings ----
    const MAX_AGE_MIN = 60; // ignore saved views older than this
    const SAME_ZONE_ONLY = true; // only restore if the reloaded page opens the same zone
    const MARGIN_VH = 1; // zone counts as "lost" if no part is visible inside this margin (in vh)
    const ARROW_INSET_PX = 28; // how far from the map edge the arrow sits
    // ------------------

    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const KEY = 'akMapView:' + location.pathname + location.search;
    const zoneNow = () => (document.getElementById('zoneId')?.textContent || '').trim();

    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
    let pending = saved && (Date.now() - saved.t) < MAX_AGE_MIN * 60000 ? saved : null;

    let map = null, saveTimer = null, zoneBounds = null, arrow = null, rafQueued = false;

    // ---------- save / restore ----------
    function save(){
        if (!map || !map._loaded) return;
        const c = map.getCenter();
        localStorage.setItem(KEY, JSON.stringify({ lat: c.lat, lng: c.lng, zoom: map.getZoom(), zone: zoneNow(), t: Date.now() }));
    }

    function hookMap(m){
        if (map) return;
        map = m;
        map.on('moveend zoomend', () => {
            queueArrow();
            if (pending) return; // don't overwrite the saved view before it's been restored
            clearTimeout(saveTimer);
            saveTimer = setTimeout(save, 300);
        });
        map.on('move zoom resize', queueArrow);
        W.addEventListener('pagehide', () => { if (!pending) save(); });
    }

    function currentAngle(){
        const r = document.querySelector('.ak-rotor');
        const m = r && /rotate\((-?[\d.]+)deg\)/.exec(r.style.transform || '');
        return m ? parseFloat(m[1]) * Math.PI / 180 : 0;
    }

    function buildArrow(){
        arrow = document.createElement('div');
        arrow.title = 'Zone is off screen: click to zoom back to it';
        arrow.style.cssText = `
            position:absolute; z-index:1000; width:34px; height:34px; margin:-17px 0 0 -17px;
            display:none; cursor:pointer; pointer-events:auto;
            border-radius:50%; background:rgba(52,152,219,.9); box-shadow:0 2px 8px rgba(0,0,0,.4);
            color:#fff; font:700 20px/34px Arial,sans-serif; text-align:center; user-select:none;
        `;
        arrow.textContent = '➜';
        arrow.addEventListener('mousedown', e => e.stopPropagation());
        arrow.addEventListener('click', e => {
            e.stopPropagation();
            if (map && zoneBounds) map.fitBounds(zoneBounds);
        });
        map.getContainer().appendChild(arrow);
    }

    function queueArrow(){
        if (rafQueued) return;
        rafQueued = true;
        requestAnimationFrame(() => { rafQueued = false; updateArrow(); });
    }

    function updateArrow(){
        if (!map || !zoneBounds || !map._loaded) { if (arrow) arrow.style.display = 'none'; return; }
        if (!arrow) buildArrow();

        const size = map.getSize(), cx = size.x / 2, cy = size.y / 2;
        const a = currentAngle(), cos = Math.cos(a), sin = Math.sin(a);
        // container point -> on-screen point (applies the map rotation around the centre)
        const toScreen = p => ({ x: cx + (p.x - cx) * cos - (p.y - cy) * sin, y: cy + (p.x - cx) * sin + (p.y - cy) * cos });

        const corners = [zoneBounds.getNorthWest(), zoneBounds.getNorthEast(), zoneBounds.getSouthEast(), zoneBounds.getSouthWest()]
            .map(ll => toScreen(map.latLngToContainerPoint(ll)));
        const minX = Math.min(...corners.map(p => p.x)), maxX = Math.max(...corners.map(p => p.x));
        const minY = Math.min(...corners.map(p => p.y)), maxY = Math.max(...corners.map(p => p.y));

        const m = window.innerHeight * MARGIN_VH / 100;
        const visible = maxX > m && minX < size.x - m && maxY > m && minY < size.y - m;
        if (visible) { arrow.style.display = 'none'; return; }

        // direction from map centre to zone centre, clamped to an inset rectangle at the map edge
        const tx = (minX + maxX) / 2 - cx, ty = (minY + maxY) / 2 - cy;
        const hx = cx - ARROW_INSET_PX, hy = cy - ARROW_INSET_PX;
        const k = Math.min(hx / Math.abs(tx || 1e-9), hy / Math.abs(ty || 1e-9));
        arrow.style.left = (cx + tx * k) + 'px';
        arrow.style.top = (cy + ty * k) + 'px';
        arrow.style.transform = `rotate(${Math.atan2(ty, tx)}rad)`;
        arrow.style.display = 'block';
    }

    function apply(){
        const L = W.L;
        if (!L || !L.Map) return false;
        const P = L.Map.prototype;
        if (P._akRememberView) return true;
        P._akRememberView = true;

        const origGetSize = P.getSize;
        P.getSize = function(){ hookMap(this); return origGetSize.call(this); };

        // the page calls fitBounds(zone bounds) when a zone loads: remember those bounds,
        // and on the first load after a reload use the saved view instead
        const origFit = P.fitBounds;
        P.fitBounds = function(bounds, options){
            hookMap(this);
            try { zoneBounds = L.latLngBounds(bounds); } catch (_) {}
            queueArrow();
            if (pending && (!SAME_ZONE_ONLY || !pending.zone || pending.zone === zoneNow())) {
                const v = pending;
                pending = null;
                return this.setView([v.lat, v.lng], v.zoom, { animate: false });
            }
            pending = null;
            return origFit.call(this, bounds, options);
        };
        return true;
    }

    if (!apply()) {
        const t = setInterval(() => { if (apply()) clearInterval(t); }, 100);
        setTimeout(() => clearInterval(t), 30000);
    }
}
rememberView();