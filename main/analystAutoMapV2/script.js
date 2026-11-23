const VERSION = "3.0.0";

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

// SpeedUp: time-sliced, visible-first redraw + merged module blocks + pan cache
function speedup(){
    // ---- settings ----
    const BUDGET_MS = 0.05; // drawing time per frame
    const VIEW_PAD = 0.25; // extra margin treated as on-screen (covers rotation)
    const SPLIT_RINGS = 200; // big layers get split into on-screen / off-screen rings
    const MERGE_PANES = ['sgRegisterPane']; // module quads merged into blocks, drawn fill-only ([] = off)
    const CACHE_PANES = ['sgRegisterPane', 'sgTablePane', 'sgTablelinePane']; // on pan: reuse old pixels, draw only the new strip ([] = off)
    const FAILSAFE_MS = 1000; // if one draw's setup takes longer than this (or throws), fall back to Leaflet until reload

    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const mergePanes = new Set(MERGE_PANES), cachePanes = new Set(CACHE_PANES);

    // ---- merge grid quads [a,b,c,d] sharing exact edges: rows -> strips -> blocks ----
    const k = p => p.x + ',' + p.y;
    const same = (p, q) => p.x === q.x && p.y === q.y;
    const degenerate = q => same(q[0], q[1]) || same(q[0], q[3]) || same(q[1], q[2]) || same(q[2], q[3]);

    function chain(items, startKey, nextKey, join){
        const byStart = new Map();
        for (const it of items) { const s = startKey(it); if (!byStart.has(s)) byStart.set(s, it); }
        const hasPrev = new Set();
        for (const it of items) { const n = byStart.get(nextKey(it)); if (n && n !== it) hasPrev.add(n); }
        const used = new Set(), out = [];
        const run = first => {
            let last = first, next;
            used.add(first);
            while ((next = byStart.get(nextKey(last))) && !used.has(next)) { used.add(next); last = next; }
            out.push(join(first, last));
        };
        for (const it of items) if (!hasPrev.has(it) && !used.has(it)) run(it);
        for (const it of items) if (!used.has(it)) run(it);
        return out;
    }
    function mergeQuads(quads){
        const strips = chain(quads, q => k(q[0]) + '|' + k(q[3]), q => k(q[1]) + '|' + k(q[2]), (f, l) => [f[0], l[1], l[2], f[3]]);
        return chain(strips, s => k(s[0]) + '|' + k(s[1]), s => k(s[3]) + '|' + k(s[2]), (f, l) => [f[0], f[1], l[2], l[3]]);
    }
    function mergedRings(L, layer){
        const src = layer._rings;
        if (layer._akMerge && layer._akMerge.src === src) return layer._akMerge.rings;
        const quads = [], other = [];
        for (const r of src) (r.length === 4 && !degenerate(r) ? quads : other).push(r);
        const rings = mergeQuads(quads).concat(other).map(r => { r._akB = L.bounds(r); return r; });
        layer._akMerge = { src, rings };
        return rings;
    }
    // ring fully inside bounds b?
    const inside = (r, b) => { for (const p of r) if (p.x < b.min.x || p.y < b.min.y || p.x > b.max.x || p.y > b.max.y) return false; return true; };

    function apply(){
        const L = W.L;
        if (!L || !L.Canvas) return false;
        const P = L.Canvas.prototype;
        if (P._akChunked) return true;
        P._akChunked = true;

        const origDraw = P._draw, origUpdate = P._update;
        let disabled = false;

        const keyOf = (l, closed) => { const o = l.options;
            return `${closed}|${o.stroke}|${o.color}|${o.weight}|${o.opacity}|${o.dashArray}|${o.fill}|${o.fillColor}|${o.fillOpacity}|${o.fillRule}`; };

        function fillOnly(renderer, ctx, layer){
            const o = layer.options;
            if (o.stroke && mergePanes.has(o.pane)) { o.stroke = false; renderer._fillStroke(ctx, layer); o.stroke = true; }
            else renderer._fillStroke(ctx, layer);
        }

        function disable(renderer, reason){
            disabled = true;
            P._draw = origDraw; P._update = origUpdate;
            if (renderer._akJob) renderer._akJob.cancelled = true;
            console.warn('[ak] speedup disabled until reload:', reason);
        }

        // pan cache: snapshot the finished canvas just before Leaflet resizes (= wipes) it
        P._update = function(){
            const c = this._container, map = this._map;
            const ok = !disabled && cachePanes.has(this.options.pane) && map && !map._animatingZoom
                && this._bounds && this._akDone && !this._akJob && c.width && c.height
                && this._akOrigin && this._akOrigin.equals(map.getPixelOrigin());
            if (ok) {
                const s = this._akSnap || (this._akSnap = document.createElement('canvas'));
                s.width = c.width; s.height = c.height;
                s.getContext('2d').drawImage(c, 0, 0);
                this._akSnapB = this._bounds;
            }
            this._akUseSnap = ok;
            return origUpdate.apply(this, arguments);
        };

        P._draw = function(){
            if (disabled) return origDraw.call(this);
            const t0 = performance.now();
            try { return chunkedDraw.call(this, L); }
            catch (err) { disable(this, err); return origDraw.call(this); }
            finally {
                const took = performance.now() - t0;
                if (!disabled && took > FAILSAFE_MS) disable(this, `draw setup took ${Math.round(took)} ms`);
            }
        };

        function chunkedDraw(L){
            const ctx = this._ctx, map = this._map;
            if (this._akJob) this._akJob.cancelled = true;
            this._akDone = false;
            this._akOrigin = map.getPixelOrigin();

            if (this._redrawBounds) {
                ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, this._container.width, this._container.height);
                ctx.restore();
            }

            let keep = null;
            if (this._akUseSnap) {
                this._akUseSnap = false;
                const ob = this._akSnapB, sz = ob.getSize();
                if (ob.intersects(this._bounds)) {
                    ctx.drawImage(this._akSnap, ob.min.x, ob.min.y, sz.x, sz.y);
                    keep = ob;
                }
            }

            const tl = map.containerPointToLayerPoint([0, 0]);
            const br = map.containerPointToLayerPoint(map.getSize());
            const pad = br.subtract(tl).multiplyBy(VIEW_PAD);
            const vp = L.bounds(tl.subtract(pad), br.add(pad));
            const draw = this._bounds;

            const now = [], later = [];
            for (let o = this._drawFirst; o; o = o.next) {
                const l = o.layer;
                if (mergePanes.has(l.options.pane) && l._rings && l._rings.length) {
                    const a = [], b = [];
                    for (const r of mergedRings(L, l)) {
                        if (!r._akB.intersects(draw)) continue;
                        if (keep && keep.contains(r._akB)) continue;
                        (r._akB.intersects(vp) ? a : b).push(r);
                    }
                    if (a.length) now.push({ l, rings: a });
                    if (b.length) later.push({ l, rings: b });
                    continue;
                }
                let parts = l._parts;
                if (!parts || !parts.length) continue;
                if (keep) {
                    if (l._pxBounds && keep.contains(l._pxBounds)) continue;
                    parts = parts.filter(r => r.length && !inside(r, keep));
                    if (!parts.length) continue;
                }
                if (parts.length > SPLIT_RINGS) {
                    const a = [], b = [];
                    for (const r of parts) if (r.length) (vp.contains(r[0]) ? a : b).push(r);
                    if (a.length) now.push({ l, rings: a });
                    if (b.length) later.push({ l, rings: b });
                } else {
                    ((l._pxBounds && l._pxBounds.intersects(vp)) ? now : later).push({ l, rings: parts });
                }
            }
            const work = now.concat(later);

            const job = { cancelled: false };
            this._akJob = job;
            let wi = 0, ri = 0;

            // draws until budget runs out; returns true when finished
            const run = () => {
                const t0 = performance.now();
                let curKey = null, curLayer = null;
                while (wi < work.length) {
                    const { l, rings } = work[wi];
                    const closed = l instanceof L.Polygon;
                    const key = keyOf(l, closed);
                    if (key !== curKey) {
                        if (curLayer) fillOnly(this, ctx, curLayer);
                        ctx.beginPath(); curKey = key; curLayer = l;
                    }
                    for (; ri < rings.length; ri++) {
                        const ring = rings[ri];
                        ctx.moveTo(ring[0].x, ring[0].y);
                        for (let j = 1; j < ring.length; j++) ctx.lineTo(ring[j].x, ring[j].y);
                        if (closed) ctx.lineTo(ring[0].x, ring[0].y);
                        if ((ri & 63) === 63 && performance.now() - t0 > BUDGET_MS) {
                            ri++; fillOnly(this, ctx, curLayer); return false;
                        }
                    }
                    wi++; ri = 0;
                    if (performance.now() - t0 > BUDGET_MS && wi < work.length) {
                        fillOnly(this, ctx, curLayer); return false;
                    }
                }
                if (curLayer) fillOnly(this, ctx, curLayer);
                return true;
            };

            const step = () => {
                if (job.cancelled || !this._map || disabled) return;
                ctx.save();
                if (keep) { // only paint outside the pasted area (no double-blended fills)
                    ctx.beginPath();
                    ctx.rect(draw.min.x, draw.min.y, draw.max.x - draw.min.x, draw.max.y - draw.min.y);
                    ctx.rect(keep.min.x, keep.min.y, keep.max.x - keep.min.x, keep.max.y - keep.min.y);
                    ctx.clip('evenodd');
                }
                let finished = false;
                try { finished = run(); }
                catch (err) { ctx.restore(); disable(this, err); this._redraw(); return; }
                ctx.restore();
                if (finished) { if (this._akJob === job) { this._akJob = null; this._akDone = true; } }
                else W.requestAnimationFrame(step);
            };
            step();
        }
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

    // canvas/SVG renderers: enlarge their drawn area while rotated (only redraw if padding changed)
    let lastPad = null;
    function updateRenderers(){
        if (!map) return;
        const s = map.getSize(), d = Math.hypot(s.x, s.y);
        const pad = angle ? Math.max(0.1, (d / Math.min(s.x, s.y) - 1) / 2) : 0.1;
        if (pad === lastPad) return; // same padding: the rotated pixels are still valid, nothing to redraw
        lastPad = pad;
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
    const MAX_AGE_MIN = 60;      // ignore saved views older than this
    const SAME_ZONE_ONLY = true; // only restore if the reloaded page opens the same zone
    const MIN_SAVE_ZOOM = 15;    // zoomed out further than this = view not saved (page allows 12)
    const MAX_SAVE_ZOOM = 24;    // zoomed in further than this  = view not saved (page allows 26)
    const MARGIN_VH = 1;         // zone counts as "lost" if no part is visible inside this margin (in vh)
    const ARROW_INSET_PX = 28;   // how far from the map edge the arrow sits
    const WARN_BORDER = '3px solid rgba(230,81,0,.85)'; // border shown while the view won't be saved
    // ------------------

    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const KEY = 'akMapView:' + location.pathname + location.search;
    const zoneNow = () => (document.getElementById('zoneId')?.textContent || '').trim();
    const zoomOk = z => z >= MIN_SAVE_ZOOM && z <= MAX_SAVE_ZOOM;

    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
    let pending = saved && (Date.now() - saved.t) < MAX_AGE_MIN * 60000 && zoomOk(saved.zoom) ? saved : null;

    let map = null, saveTimer = null, zoneBounds = null, arrow = null, rafQueued = false;
    let offscreen = false, warnBox = null;

    // ---------- unsafe-view warning ----------
    function isUnsafe(){
        return !!map && map._loaded && (!zoomOk(map.getZoom()) || offscreen);
    }

    function updateWarning(){
        if (pending) return;                  // nothing restored yet: leave the saved view alone
        const unsafe = isUnsafe();
        if (unsafe) localStorage.removeItem(KEY);
        if (!warnBox) {
            warnBox = document.createElement('div');
            // shown while the current view won't be remembered: reloading now returns to the default view
            warnBox.style.cssText = `position:fixed; inset:0; z-index:1000002; pointer-events:none; box-sizing:border-box; border:${WARN_BORDER}; display:none;`;
            document.body.appendChild(warnBox);
        }
        warnBox.style.display = unsafe ? 'block' : 'none';
    }

    // ---------- save / restore ----------
    function save(){
        if (!map || !map._loaded || isUnsafe()) return;
        const c = map.getCenter();
        localStorage.setItem(KEY, JSON.stringify({ lat: c.lat, lng: c.lng, zoom: map.getZoom(), zone: zoneNow(), t: Date.now() }));
    }

    function hookMap(m){
        if (map) return;
        map = m;
        map.on('moveend zoomend', () => {
            queueArrow();
            if (pending) return;               // don't overwrite the saved view before it's been restored
            clearTimeout(saveTimer);
            saveTimer = setTimeout(save, 300);
        });
        map.on('move zoom resize', queueArrow);
        W.addEventListener('pagehide', () => { if (!pending) save(); });
    }

    // ---------- off-screen arrow ----------
    function currentAngle(){
        const r = document.querySelector('.ak-rotor');
        const m = r && /rotate\((-?[\d.]+)deg\)/.exec(r.style.transform || '');
        return m ? parseFloat(m[1]) * Math.PI / 180 : 0;
    }

    function buildArrow(){
        arrow = document.createElement('div');
        arrow.className = 'ak-zone-arrow';
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
        requestAnimationFrame(() => { rafQueued = false; updateArrow(); updateWarning(); });
    }

    function updateArrow(){
        offscreen = false;
        if (!map || !zoneBounds || !map._loaded) { if (arrow) arrow.style.display = 'none'; return; }
        if (!arrow) buildArrow();

        const size = map.getSize(), cx = size.x / 2, cy = size.y / 2;
        const a = currentAngle(), cos = Math.cos(a), sin = Math.sin(a);
        const toScreen = p => ({ x: cx + (p.x - cx) * cos - (p.y - cy) * sin, y: cy + (p.x - cx) * sin + (p.y - cy) * cos });

        const corners = [zoneBounds.getNorthWest(), zoneBounds.getNorthEast(), zoneBounds.getSouthEast(), zoneBounds.getSouthWest()]
            .map(ll => toScreen(map.latLngToContainerPoint(ll)));
        const minX = Math.min(...corners.map(p => p.x)), maxX = Math.max(...corners.map(p => p.x));
        const minY = Math.min(...corners.map(p => p.y)), maxY = Math.max(...corners.map(p => p.y));

        const m = window.innerHeight * MARGIN_VH / 100;
        const visible = maxX > m && minX < size.x - m && maxY > m && minY < size.y - m;
        if (visible) { arrow.style.display = 'none'; return; }
        offscreen = true;

        const tx = (minX + maxX) / 2 - cx, ty = (minY + maxY) / 2 - cy;
        const hx = cx - ARROW_INSET_PX, hy = cy - ARROW_INSET_PX;
        const k = Math.min(hx / Math.abs(tx || 1e-9), hy / Math.abs(ty || 1e-9));
        arrow.style.left = (cx + tx * k) + 'px';
        arrow.style.top = (cy + ty * k) + 'px';
        arrow.style.transform = `rotate(${Math.atan2(ty, tx)}rad)`;
        arrow.style.display = 'block';
    }

    // ---------- patches ----------
    function apply(){
        const L = W.L;
        if (!L || !L.Map) return false;
        const P = L.Map.prototype;
        if (P._akRememberView) return true;
        P._akRememberView = true;

        const origGetSize = P.getSize;
        P.getSize = function(){ hookMap(this); return origGetSize.call(this); };

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