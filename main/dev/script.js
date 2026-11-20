const VERSION = "1.0.0";

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

function speedup(){
    const W = unsafeWindow;
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

        P._updateCircle = function (layer) {
            this._akFlush(); // keep draw order around markers/circles
            return origCircle.call(this, layer);
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

        console.log('[ak] canvas batch patch applied');
        return true;
    }
    if (!apply()) {
        const t = setInterval(() => { if (apply()) clearInterval(t); }, 100);
        setTimeout(() => clearInterval(t), 30000);
    }
}
speedup();

function rotateMap(){
    // ---- settings ----
    const STEP_DEG = 1; // degrees per Alt+wheel notch
    const BIG_STEP_DEG = 10; // degrees per Alt+Shift+wheel notch
    const DEFAULT_DEG = 0; // starting / reset angle
    const REMEMBER_ANGLE = true; // false = always start at DEFAULT_DEG
    const TOAST_MS = 900; // how long the angle toast stays visible
    // ------------------

    const W = unsafeWindow;
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

function infoPopup(){
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
            ['', 'Angle shows mid-screen, turns green at 0°, and is remembered per page'],
            ['', 'Faster map redraw when panning/zooming'],
        ]],
        ['Anomaly panel', [
            ['Drag title bar', 'Move the panel (position is remembered)'],
            ['⇆ button', 'Toggle wide / narrow layout'],
            ['D button', 'Toggle dark mode'],
            ['Hover a button', 'Shows its keybind'],
        ]],
        ['', [
            ['Alt + I', 'Show / hide this help'],
        ]],
    ];

    let box = null;

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
    #ak-info kbd{display:inline-block;min-width:18px;text-align:center;padding:1px 5px;border:1px solid #bbb;border-bottom-width:2px;
    border-radius:3px;background:#f6f6f6;font:600 11px/1.4 Arial,sans-serif;color:#333;}
        `;
        document.head.appendChild(style);
        box.addEventListener('mousedown', e => { if (e.target === box || e.target.classList.contains('ak-info-x')) hide(); });
        document.body.appendChild(box);
    }

    function show(){ if (!box) build(); box.style.display = 'flex'; }
    function hide(){ if (box) box.style.display = 'none'; }
    const isOpen = () => box && box.style.display !== 'none';

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