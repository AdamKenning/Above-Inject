const VERSION = "3.1.2";

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

// Move module: reusable "move one defect" using the page's own flow (select defect -> Move -> click target module).
// Exposed on the page as window.akMove (see API at the bottom). Console shortcut: akMoveModule(source, target, opts)
function moveModule(){
    //   source: 'selected' | defect layer | L.LatLng / [lat, lng] (a point inside the defect)
    //   target: 'left'|'right'|'up'|'down' | { dir, steps } | { cells: [dx, dy] } | { latlng } (module centre to drop on)
    //   opts:   { dryRun: false } (true = only show the target ring), { quiet: false }
    //
    //   returns { ok, reason?, from, to, response? }   (never throws)

    // ---- settings ----
    const SELECT_TIMEOUT_MS = 3000; // wait for Move button to enable after selecting the defect
    const MOVE_MODE_DELAY_MS = 100; // pause after pressing Move before clicking the target
    const SAVE_TIMEOUT_MS = 8000;   // wait for moveDefect.php to answer
    const SETTLE_MS = 150;          // pause after a save so the page can redraw the moved defect
    const DEFECT_PANE = 'sgDefectPane';
    const TABLE_PANE = 'sgTablePane';
    // ------------------

    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    let map = null, marker = null, lastClicked = null, queue = Promise.resolve();

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const waitFor = async (fn, ms, step = 50) => {
        const t = Date.now();
        while (Date.now() - t < ms) { const v = fn(); if (v) return v; await sleep(step); }
        return null;
    };
    const log = (quiet, ...a) => { if (!quiet) console.log('[ak]', ...a); };

    // ---------- map / layers ----------
    async function getMap(){
        if (map) return map;
        W.dispatchEvent(new Event('resize')); // makes Leaflet call getSize (hooked in apply)
        await sleep(150);
        if (!map) throw new Error('map not found');
        return map;
    }
    const layersIn = pane => Object.values(map._layers).filter(l => l.options && l.options.pane === pane);
    const defectLayers = () => layersIn(DEFECT_PANE).filter(l => l.getLatLngs && !l._layers && l._map);
    const toLatLng = x => W.L.latLng(x);

    // ---------- geometry (layer px: same space as the module grid, rotation-independent) ----------
    const ringPx = layer => layer.getLatLngs().flat(3).map(ll => map.latLngToLayerPoint(ll));

    function pointInRing(p, ring){
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const a = ring[i], b = ring[j];
            if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
        }
        return inside;
    }

    // centre + module edge vectors of a single-module defect
    function cell(layer){
        const L = W.L, p = ringPx(layer);
        const c = p.reduce((a, b) => a.add(b), L.point(0, 0)).divideBy(p.length);
        const e1 = p[1].subtract(p[0]), e2 = p[p.length - 1].subtract(p[0]);
        let across = Math.abs(e1.x) > Math.abs(e1.y) ? e1 : e2, up = across === e1 ? e2 : e1;
        if (across.x < 0) across = across.multiplyBy(-1);
        if (up.y > 0) up = up.multiplyBy(-1);
        return { c, across, up, corners: p.length };
    }

    // defect whose outline contains a lat/lng (works off screen: uses lat/lngs, not drawn paths)
    function defectAt(latlng){
        const p = map.latLngToLayerPoint(toLatLng(latlng));
        return defectLayers().find(l => pointInRing(p, ringPx(l))) || null;
    }
    // every defect containing a lat/lng (a module can hold several)
    function defectsAt(latlng){
        const p = map.latLngToLayerPoint(toLatLng(latlng));
        return defectLayers().filter(l => pointInRing(p, ringPx(l)));
    }

    // table layer under a point (Leaflet hit-test: target must be within the drawn area, i.e. on screen)
    const tableAt = lp => layersIn(TABLE_PANE).find(l => l._containsPoint && l._containsPoint(lp)) || null;

    const DIR = { left: [-1, 0], right: [1, 0], up: [0, 1], down: [0, -1] };
    function targetPoint(c, target){
        if (target && target.latlng) return map.latLngToLayerPoint(toLatLng(target.latlng));
        let dx, dy;
        if (typeof target === 'string') [dx, dy] = DIR[target] || [];
        else if (target && target.dir) { const s = target.steps || 1; const d = DIR[target.dir] || []; dx = d[0] * s; dy = d[1] * s; }
        else if (target && target.cells) [dx, dy] = target.cells;
        if (dx === undefined || dy === undefined) return null;
        return c.c.add(c.across.multiplyBy(dx)).add(c.up.multiplyBy(dy));
    }

    // ---------- resolving the source ----------
    function resolveSource(src){
        if (src === 'selected') {
            if (lastClicked && !lastClicked._map) lastClicked = null; // moved defects get a new layer
            return lastClicked;
        }
        if (src && src.getLatLngs) return src._map ? src : null;
        try { return defectAt(src); } catch (_) { return null; }
    }

    // ---------- page interaction ----------
    function fireClick(layer, latlng){
        const lp = map.latLngToLayerPoint(latlng), cp = map.layerPointToContainerPoint(lp);
        const r = map.getContainer().getBoundingClientRect();
        const oe = new W.MouseEvent('click', { bubbles: true, clientX: r.left + cp.x, clientY: r.top + cp.y });
        layer.fire('click', { latlng, layerPoint: lp, containerPoint: cp, originalEvent: oe }, true);
    }

    function waitForSave(){
        return new Promise(res => {
            const $ = W.jQuery;
            const t = setTimeout(() => { $(W.document).off('ajaxComplete', h); res(null); }, SAVE_TIMEOUT_MS);
            function h(e, xhr, s){
                if (!s || !/moveDefect\.php/.test(s.url)) return;
                clearTimeout(t); $(W.document).off('ajaxComplete', h);
                res({ status: xhr.status, body: xhr.responseJSON || xhr.responseText, sent: s.data });
            }
            $(W.document).on('ajaxComplete', h);
        });
    }

    function showRing(latlng, ok){
        if (marker) marker.remove();
        marker = W.L.circleMarker(latlng, { radius: 6, color: ok ? '#16a34a' : '#dc2626', weight: 3, fill: false, interactive: false }).addTo(map);
    }
    function clearRing(){ if (marker) { marker.remove(); marker = null; } }

    // ---------- the move ----------
    async function moveOne(source, target, { dryRun = false, quiet = false } = {}){
        const fail = (reason, extra) => { log(quiet, 'move skipped:', reason); return { ok: false, reason, ...extra }; };
        try { await getMap(); } catch (e) { return fail('map not found'); }

        const layer = resolveSource(source);
        if (!layer) return fail(source === 'selected' ? 'no defect clicked' : 'no defect at source');

        const c = cell(layer);
        if (c.corners !== 4) return fail(`defect has ${c.corners} corners (multi-module): not supported`);

        const tLp = targetPoint(c, target);
        if (!tLp) return fail('bad target');
        const from = map.layerPointToLatLng(c.c), to = map.layerPointToLatLng(tLp);
        const table = tableAt(tLp);
        showRing(to, !!table);
        if (!table) return fail('no module under target (off screen or gap)', { from, to });
        if (dryRun) { log(quiet, 'dry run ok', { from, to }); return { ok: true, dryRun: true, from, to }; }

        // 1. select defect
        fireClick(layer, from);
        const moveBtn = await waitFor(() => {
            const b = W.document.getElementById('Move');
            return b && !b.disabled && !b.hasAttribute('disabled') && b;
        }, SELECT_TIMEOUT_MS);
        if (!moveBtn) { clearRing(); return fail('defect did not select (Move not enabled)', { from, to }); }

        // 2. move mode
        moveBtn.click();
        await sleep(MOVE_MODE_DELAY_MS);

        // 3. click target module, wait for the save
        const saved = waitForSave();
        fireClick(table, to);
        const r = await saved;
        clearRing();
        if (!r) return fail(`no moveDefect.php response within ${SAVE_TIMEOUT_MS / 1000} s`, { from, to });
        if (r.status !== 200) return fail(`server returned ${r.status}`, { from, to, response: r });

        if (layer === lastClicked) lastClicked = null;
        await sleep(SETTLE_MS);
        log(quiet, 'moved', { from, to, sent: r.sent });
        return { ok: true, from, to, response: r };
    }

    // calls are queued so two moves never overlap
    function moveDefect(source, target, opts){
        const run = queue.then(() => moveOne(source, target, opts));
        queue = run.catch(() => {});
        return run;
    }

    function apply(){
        const L = W.L;
        if (!L || !L.Map || !L.Evented) return false;
        if (L.Map.prototype._akMoveModule) return true;
        L.Map.prototype._akMoveModule = true;

        const P = L.Map.prototype, origGetSize = P.getSize;
        P.getSize = function(){ if (!map) { map = this; W.__akMap = this; } return origGetSize.call(this); };

        // record clicks on individual defect polygons (their LayerGroup doesn't propagate events)
        const E = L.Evented.prototype, origFire = E.fire;
        E.fire = function(type){
            if (type === 'click' && this.options && this.options.pane === DEFECT_PANE && this.getLatLngs && !this._layers) {
                lastClicked = this;
                if (this._map && !map) { map = this._map; W.__akMap = map; }
            }
            return origFire.apply(this, arguments);
        };

        // ---- API ----
        W.akMove = {
            moveDefect,                                  // (source, target, opts) -> Promise<result>
            defectAt: ll => (map ? defectAt(ll) : null), // defect layer containing a lat/lng
            defectsAt: ll => (map ? defectsAt(ll) : []), // all defect layers containing a lat/lng
            cell: l => cell(l),                          // { c, across, up, corners } in layer px
            defectLayers: () => (map ? defectLayers() : []),
            tableAt: ll => (map ? tableAt(map.latLngToLayerPoint(toLatLng(ll))) : null),
            selected: () => resolveSource('selected'),
            getMap,
        };
        W.akMoveModule = moveDefect; // console shortcut
        return true;
    }

    if (!apply()) {
        const t = setInterval(() => { if (apply()) clearInterval(t); }, 100);
        setTimeout(() => clearInterval(t), 30000);
    }
}
moveModule();

// Grid move (step 1: source selection). Needs moveModule() loaded first (uses window.akMove).
function moveGrid(){
    //   G        enter grid mode: next click = first corner (anchor)
    //   hover    live preview: red outline + ✕ on every module of the block
    //   click    second corner; the block is normalised so the anchor is always its bottom-left.
    //            Checked, then ✕ stays only on modules that hold a defect (= what would be moved); red outline stays.
    //   Esc      cancel / clear

    // ---- settings ----
    const KEY = 'g';
    const MAX_CELLS = 2000;        // refuse silly grids
    const MAX_PREVIEW_X = 400;     // above this many cells the hover preview shows the outline only
    const TOAST_MS = 2200;
    const TABLE_PANE = 'sgTablePane';
    const MARK_PANE = 'akGridPane'; // our own pane above the defects
    const RED = '#dc2626';
    const GREEN = '#16a34a';
    // ------------------

    const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    let map = null, marks = null, preview = null, toastEl = null, toastTimer = null;
    let mode = 'off';              // off | anchor | extent | source-set
    let grid = null;               // see onFirstClick / onSecondClick
    let lastPreviewKey = null;

    // ---------- small helpers ----------
    function toast(msg, isError){
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.style.cssText = `position:fixed; left:50%; bottom:40px; transform:translateX(-50%); z-index:1000003;
                padding:8px 16px; border-radius:6px; font:600 14px/1.3 Arial,sans-serif; color:#fff;
                pointer-events:none; opacity:0; transition:opacity .15s ease; max-width:80vw; text-align:center;`;
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.style.background = isError ? 'rgba(220,38,38,.92)' : 'rgba(0,0,0,.75)';
        toastEl.style.opacity = '1';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, TOAST_MS);
    }

    const svgCursor = (body, hx, hy) =>
        `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'>${body}</svg>`)}") ${hx} ${hy}, crosshair`;
    const anchorSvg = col => `<g fill='none' stroke='${col}' stroke-width='2.4' stroke-linecap='round'><circle cx='14' cy='5' r='2.6'/><line x1='14' y1='7.6' x2='14' y2='24'/><line x1='9' y1='11' x2='19' y2='11'/><path d='M5 17 Q6 24 14 24 Q22 24 23 17'/></g>`;
    const ANCHOR_SVG = anchorSvg(RED);
    const ANCHOR_GREEN_SVG = anchorSvg(GREEN);
    const DOT_SVG = `<circle cx='14' cy='14' r='6' fill='${GREEN}' stroke='#fff' stroke-width='1.5'/>`;
    const X_SVG = `<g stroke='${RED}' stroke-width='3.2' stroke-linecap='round'><line x1='7' y1='7' x2='21' y2='21'/><line x1='21' y1='7' x2='7' y2='21'/></g>`;
    const X_FAINT_SVG = `<g stroke='${RED}' stroke-opacity='.55' stroke-width='2.6' stroke-linecap='round'><line x1='8' y1='8' x2='20' y2='20'/><line x1='20' y1='8' x2='8' y2='20'/></g>`;
    const BAD_SVG = `<circle cx='14' cy='14' r='6' fill='#f59e0b'/>`;

    const style = document.createElement('style');
    style.textContent = `
        .ak-grid-anchor, .ak-grid-anchor * { cursor: ${svgCursor(ANCHOR_SVG, 14, 14)} !important; }
        .ak-grid-extent, .ak-grid-extent * { cursor: ${svgCursor(X_SVG, 14, 14)} !important; }
        .ak-grid-dest, .ak-grid-dest * { cursor: ${svgCursor(ANCHOR_GREEN_SVG, 14, 14)} !important; }
        .ak-grid-mark { pointer-events: none; }
    `;
    document.head.appendChild(style);

    function setMode(m){
        mode = m;
        const c = map && map.getContainer();
        if (!c) return;
        c.classList.toggle('ak-grid-anchor', m === 'anchor');
        c.classList.toggle('ak-grid-extent', m === 'extent');
        c.classList.toggle('ak-grid-dest', m === 'dest');
        if (m !== 'extent' && m !== 'dest') clearPreview();
    }

    // ---------- geometry (layer px) ----------
    const L = () => W.L;
    const ringPx = layer => layer.getLatLngs().flat(3).map(ll => map.latLngToLayerPoint(ll));
    const dot = (a, b) => a.x * b.x + a.y * b.y;
    const len = a => Math.hypot(a.x, a.y);

    function pointInRing(p, ring){
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const a = ring[i], b = ring[j];
            if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
        }
        return inside;
    }

    const tables = () => Object.values(map._layers).filter(l => l.options && l.options.pane === TABLE_PANE && l.getLatLngs && !l._layers);
    const tableAtPx = p => tables().find(t => pointInRing(p, ringPx(t))) || null;

    // module size/orientation: taken from the nearest single-module defect
    function moduleVectors(nearPx){
        const ds = W.akMove.defectLayers().map(l => ({ l, c: W.akMove.cell(l) })).filter(d => d.c.corners === 4);
        if (!ds.length) return null;
        ds.sort((a, b) => a.c.c.distanceTo(nearPx) - b.c.c.distanceTo(nearPx));
        return { across: ds[0].c.across, up: ds[0].c.up };
    }

    // table's bottom-left corner in module axes
    function tableOrigin(tbl, v){
        const p = ringPx(tbl), ua = v.across.divideBy(len(v.across)), uu = v.up.divideBy(len(v.up));
        let best = null;
        for (const q of p) { const s = dot(q, ua) + dot(q, uu); if (!best || s < best.s) best = { q, s }; }
        return best.q;
    }

    // snap a layer-px point to the centre of the module it's on
    function snapModule(p, v){
        const tbl = tableAtPx(p);
        if (!tbl) return null;
        const o = tableOrigin(tbl, v);
        const d = p.subtract(o);
        const la = len(v.across), lu = len(v.up);
        const i = Math.floor(dot(d, v.across) / (la * la));
        const j = Math.floor(dot(d, v.up) / (lu * lu));
        const c = o.add(v.across.multiplyBy(i + 0.5)).add(v.up.multiplyBy(j + 0.5));
        if (!pointInRing(c, ringPx(tbl))) return null;
        return { tbl, c };
    }

    // current module vectors (rescaled if zoom changed since they were measured)
    function vecs(){
        const k = map.getZoomScale(map.getZoom(), grid.z);
        return { across: grid.across.multiplyBy(k), up: grid.up.multiplyBy(k) };
    }

    // block between the first corner and point c (both module centres), normalised to bottom-left origin
    function blockBetween(c){
        const { across, up } = vecs();
        const A = map.latLngToLayerPoint(grid.first);
        const d = c.subtract(A);
        const dx = Math.round(dot(d, across) / dot(across, across));
        const dy = Math.round(dot(d, up) / dot(up, up));
        const origin = A.add(across.multiplyBy(Math.min(0, dx))).add(up.multiplyBy(Math.min(0, dy)));
        // ai/aj: where the anchor (first click) sits inside the block
        return { origin, nx: Math.abs(dx) + 1, ny: Math.abs(dy) + 1, ai: Math.max(0, -dx), aj: Math.max(0, -dy), across, up };
    }
    const cellPx = (b, i, j) => b.origin.add(b.across.multiplyBy(i)).add(b.up.multiplyBy(j));
    function outlineLatLngs(b){
        const h = (fi, fj) => map.layerPointToLatLng(cellPx(b, fi, fj));
        return [h(-0.5, -0.5), h(b.nx - 0.5, -0.5), h(b.nx - 0.5, b.ny - 0.5), h(-0.5, b.ny - 0.5)];
    }

    // ---------- markers ----------
    function ensureLayers(){
        if (!map.getPane(MARK_PANE)) {
            const p = map.createPane(MARK_PANE);
            p.style.zIndex = 690;
            p.style.pointerEvents = 'none';
        }
        if (!marks) marks = L().layerGroup().addTo(map);
        if (!preview) preview = L().layerGroup().addTo(map);
    }
    const iconCache = {};
    const icon = (svg, size) => iconCache[svg + size] || (iconCache[svg + size] = L().divIcon({
        className: 'ak-grid-mark', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">${svg}</svg>`,
    }));
    function mark(group, latlng, svg, size = 20){
        ensureLayers();
        L().marker(latlng, { icon: icon(svg, size), pane: MARK_PANE, interactive: false, keyboard: false }).addTo(group);
    }
    function outline(group, b, dashed, col = RED){
        ensureLayers();
        L().polygon(outlineLatLngs(b), {
            pane: MARK_PANE, interactive: false, color: col, weight: 2.5, fill: true, fillColor: col, fillOpacity: 0.06,
            dashArray: dashed ? '6 5' : null,
        }).addTo(group);
    }
    const clearMarks = () => { if (marks) marks.clearLayers(); };
    const clearPreview = () => { if (preview) preview.clearLayers(); lastPreviewKey = null; };

    // ---------- flow ----------
    function cancel(msg){
        setMode('off'); grid = null; clearMarks(); clearPreview();
        W.akGrid = null;
        if (msg) toast(msg);
    }

    function onFirstClick(latlng){
        const p = map.latLngToLayerPoint(latlng);
        const v = moduleVectors(p);
        if (!v) { cancel(); toast('Grid move: no single-module defect on the map to measure module size from', true); return; }
        const s = snapModule(p, v);
        if (!s) { cancel(); toast('Grid move: that isn\'t a module (cancelled)', true); return; }
        grid = { first: map.layerPointToLatLng(s.c), across: v.across, up: v.up, z: map.getZoom() };
        clearMarks();
        mark(marks, grid.first, ANCHOR_SVG, 24);
        setMode('extent');
        toast('First corner set: click the opposite corner of the block');
    }

    // hover preview (UI only)
    let rafPending = false, lastMove = null;
    function onMove(e){
        if ((mode !== 'extent' && mode !== 'dest') || !inMap(e)) return;
        lastMove = e;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;
            if (mode === 'extent') drawPreview(lastMove); else if (mode === 'dest') drawDestPreview(lastMove);
        });
    }

    // destination preview (UI only): green outline + green anchor; green dot where each defect would land on a module,
    // red ✕ where it would land off a module. Off a module the outline just follows the cursor.
    // destination block whose anchor cell (ai, aj) lands on point a
    function destBlock(a){
        const { across, up } = vecs();
        return { origin: a.subtract(across.multiplyBy(grid.ai)).subtract(up.multiplyBy(grid.aj)), nx: grid.nx, ny: grid.ny, across, up };
    }
    function drawDestPreview(e){
        if (mode !== 'dest' || !grid) return;
        const raw = map.latLngToLayerPoint(map.mouseEventToLatLng(e));
        const s = snapModule(raw, vecs());
        const { across, up } = vecs();
        const a = s ? s.c : raw;  // destination anchor; block sits around it like the source does
        const b = destBlock(a);
        const key = s ? `${Math.round(s.c.x)},${Math.round(s.c.y)}` : 'raw';
        if (s && key === lastPreviewKey) return;
        clearPreview();
        lastPreviewKey = key;
        outline(preview, b, true, GREEN);
        mark(preview, map.layerPointToLatLng(a), ANCHOR_GREEN_SVG, 24);
        if (!s) return;
        for (const d of grid.defects) {
            const p = cellPx(b, d.i, d.j);
            mark(preview, map.layerPointToLatLng(p), tableAtPx(p) ? DOT_SVG : X_SVG, tableAtPx(p) ? 14 : 18);
        }
    }

    function onDestClick(latlng){
        const s = snapModule(map.latLngToLayerPoint(latlng), vecs());
        if (!s) { toast('Grid move: pick a module for the destination anchor', true); return; }
        const { across, up } = vecs();
        const b = destBlock(s.c);
        // destination exactly on top of the source would move every defect onto itself forever
        const src0 = map.latLngToLayerPoint(grid.origin);
        if (b.origin.distanceTo(src0) < 0.5 * Math.min(across.distanceTo([0, 0]), up.distanceTo([0, 0]))) {
            toast('Grid move: destination is the same as the source: pick a different module', true); return;
        }
        const targets = grid.defects.map(d => {
            const p = cellPx(b, d.i, d.j);
            return { ...d, to: map.layerPointToLatLng(p), ok: !!tableAtPx(p) };
        });
        grid.dest = { anchor: map.layerPointToLatLng(s.c), outline: outlineLatLngs(b), targets };
        const bad = targets.filter(t => !t.ok).length;
        // keep the destination drawn (solid) next to the source
        clearPreview();
        outline(marks, b, false, GREEN);
        mark(marks, grid.dest.anchor, ANCHOR_GREEN_SVG, 24);
        targets.forEach(t => mark(marks, t.to, t.ok ? DOT_SVG : X_SVG, t.ok ? 14 : 18));
        setMode('dest-set');
        const good = targets.filter(t => t.ok);
        if (!good.length) { cancel(); toast('Grid move: no defect would land on a module (cancelled)', true); return; }
        // let the markers paint before the blocking confirm dialog
        setTimeout(() => {
            if (mode !== 'dest-set') return;
            const msg = `Move ${good.length} defect${good.length === 1 ? '' : 's'} to the green block?` +
                (bad ? `\n\n${bad} defect${bad === 1 ? '' : 's'} would land off a module and will be skipped.` : '') +
                '\n\nThis saves each move to the database. When it finishes you can undo the whole move in one click.';
            if (!W.confirm(msg)) { cancel('Grid move cancelled'); return; }
            runMoves(b);
        }, 50);
    }

    // ---------- run ----------
    let abort = false, guardOpen = false, passThrough = false;


    // plan: [{ from: latlng, to: latlng, n?: max defects to take from this module }], run in order
    async function runPlan(plan, label){
        const mover = W.akMove;
        setMode('running'); abort = false;
        W.addEventListener('beforeunload', onUnload);
        const done = [];   // what actually moved, per module (used for undo)
        let moved = 0, failed = 0, k = 0;
        for (const s of plan) {
            k++;
            let here = 0;
            // keep moving until the module is empty: stacked defects may only get their own layer after the one above moves
            for (let guard = 0; guard < 20 && !abort && (s.n === undefined || here < s.n); guard++) {
                const layer = mover.defectsAt(s.from)[0];
                if (!layer) break;
                toast(`${label}: module ${k} of ${plan.length}, ${moved} moved…`);
                const r = await mover.moveDefect(layer, { latlng: s.to }, { quiet: true });
                if (r.ok) { moved++; here++; }
                else { failed++; console.warn('[ak] grid move skipped', r.reason, s); break; }
            }
            if (here) done.push({ from: s.from, to: s.to, n: here });
            if (abort) break;
        }
        W.removeEventListener('beforeunload', onUnload);

        return { moved, failed, stopped: abort, done };
    }

    async function runMoves(b){
        if (!W.akMove) { cancel(); toast('Grid move: moveModule not loaded', true); return; }
        // order so nothing lands on a defect that hasn't moved yet: furthest along the shift goes first
        const shift = b.origin.subtract(map.latLngToLayerPoint(grid.origin));
        const along = t => { const p = map.latLngToLayerPoint(t.ll); return p.x * shift.x + p.y * shift.y; };
        const plan = [];  // one entry per module (stacked defects share a cell)
        for (const t of grid.dest.targets.filter(t => t.ok).sort((a, c) => along(c) - along(a)))
            if (!plan.some(c => c.i === t.i && c.j === t.j)) plan.push({ i: t.i, j: t.j, from: t.ll, to: t.to });

        const r = await runPlan(plan, 'Moving');
        // record of this run: source/dest grids + what moved where (also on window.akGridLast)
        const record = { source: grid.outline, dest: grid.dest.outline, moves: r.done, at: new Date() };
        W.akGridLast = record;
        cancel();
        if (!r.moved) { toast(`Nothing moved${r.failed ? `, ${r.failed} failed (see console)` : ''}`, true); return; }
        showResult(record, `Moved ${r.moved} defect${r.moved === 1 ? '' : 's'}` +
            (r.failed ? `, ${r.failed} failed (see console)` : '') + (r.stopped ? ', stopped early' : '') + '.');
    }

    // after a run: keep, or undo by replaying the record backwards (dest -> source, reverse order)
    async function showResult(record, summary){
        clearMarks(); ensureLayers();
        const poly = (ll, col) => L().polygon(ll, { pane: MARK_PANE, interactive: false, color: col, weight: 2.5, fillColor: col, fillOpacity: 0.06 }).addTo(marks);
        poly(record.source, RED); poly(record.dest, GREEN);
        await new Promise(r => setTimeout(r, 50));   // let the outlines paint before the blocking dialog
        const keep = W.confirm(`${summary}\n\nKeep these moves?\n\nOK = keep\nCancel = undo (move everything back)`);
        if (keep) { clearMarks(); toast(`Kept. ${summary}`); return; }

        const back = record.moves.slice().reverse().map(m => ({ from: m.to, to: m.from, n: m.n }));
        const r = await runPlan(back, 'Undoing');
        clearMarks(); setMode('off');
        toast(`Undone: ${r.moved} defect${r.moved === 1 ? '' : 's'} moved back` +
            (r.failed ? `, ${r.failed} failed (see console)` : '') + (r.stopped ? ', stopped early' : ''), !!(r.failed || r.stopped));
    }

    // ---------- interruption guard (only while moving) ----------
    function onUnload(e){ e.preventDefault(); e.returnValue = ''; return ''; }
    const isReload = e => e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r');
    // returns true when the key was caught
    function guardKey(e){
        if (passThrough || !(e.key === 'Escape' || e.key === ' ' || isReload(e))) return false;
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        if (e.type !== 'keydown' || e.repeat || guardOpen) return true;
        guardOpen = true;
        const what = e.key === 'Escape' ? 'Stop' : e.key === ' ' ? 'Stop (Space)' : 'Reload';
        const copy = { key: e.key, code: e.code, keyCode: e.keyCode, which: e.which, bubbles: true, cancelable: true };
        const target = e.target;
        setTimeout(() => {   // out of the key handler so the dialog doesn't swallow the keyup oddly
            // OK (the default) is the safe choice: keep moving
            const stop = !W.confirm('Moving in progress.\n\nInterrupting now means you may not be able to undo. ' +
                'Let it finish and you can undo everything at the end.\n\n' +
                `OK = keep moving\nCancel = ${what.toLowerCase()} anyway`);
            guardOpen = false;
            if (!stop || mode !== 'running') return;
            abort = true;
            if (what === 'Reload') { W.removeEventListener('beforeunload', onUnload); W.location.reload(); return; }
            toast('Stopping after the current move…', true);
            if (e.key === ' ') {   // hand the Space press on to the page
                passThrough = true;
                try { target.dispatchEvent(new KeyboardEvent('keydown', copy)); } finally { passThrough = false; }
            }
        });
        return true;
    }
    function drawPreview(e){
        if (mode !== 'extent' || !grid) return;
        const p = map.latLngToLayerPoint(map.mouseEventToLatLng(e));
        const s = snapModule(p, vecs());
        if (!s) {
            if (lastPreviewKey) { clearPreview(); clearMarks(); mark(marks, grid.first, ANCHOR_SVG, 24); }
            return;
        }
        const b = blockBetween(s.c);
        const key = `${Math.round(b.origin.x)},${Math.round(b.origin.y)},${b.nx},${b.ny}`;
        if (key === lastPreviewKey) return;
        clearPreview();
        lastPreviewKey = key;
        outline(preview, b, true);
        if (b.nx * b.ny <= MAX_PREVIEW_X) {
            for (let j = 0; j < b.ny; j++) for (let i = 0; i < b.nx; i++) {
                if (i === b.ai && j === b.aj) continue; // anchor cell
                mark(preview, map.layerPointToLatLng(cellPx(b, i, j)), X_FAINT_SVG, 16);
            }
        }
        // anchor stays on the first module clicked
        clearMarks();
        mark(marks, grid.first, ANCHOR_SVG, 24);
    }

    function onSecondClick(latlng){
        const p = map.latLngToLayerPoint(latlng);
        const s = snapModule(p, vecs());
        if (!s) { toast('Grid move: that isn\'t a module: pick the opposite corner again', true); return; }
        const b = blockBetween(s.c);
        if (b.nx * b.ny > MAX_CELLS) { toast(`Grid move: too big (${b.nx * b.ny} modules)`, true); return; }

        // every cell centre must land on a module
        const cells = [], missing = [];
        for (let j = 0; j < b.ny; j++) for (let i = 0; i < b.nx; i++) {
            const c = cellPx(b, i, j);
            (tableAtPx(c) ? cells : missing).push({ i, j, ll: map.layerPointToLatLng(c) });
        }
        clearPreview();
        if (missing.length) {
            toast(`Grid move: ${missing.length} of ${b.nx * b.ny} cells have no module under them: pick a different corner`, true);
            missing.forEach(m => mark(preview, m.ll, BAD_SVG, 12));
            setTimeout(() => { if (mode === 'extent') clearPreview(); }, 1500);
            return;
        }

        // keep ✕ only on modules that hold a defect
        const defects = [];
        for (const c of cells) {
            for (const d of W.akMove.defectsAt(c.ll))   // a module can hold several defects: take them all
                if (W.akMove.cell(d).corners === 4 && !defects.some(x => x.layer === d)) defects.push({ ...c, layer: d });
        }

        grid.anchor = grid.first;                        // anchor never moves
        grid.origin = map.layerPointToLatLng(b.origin);  // bottom-left cell (internal)
        grid.ai = b.ai; grid.aj = b.aj;
        grid.nx = b.nx; grid.ny = b.ny;
        grid.cells = cells;
        grid.defects = defects;
        grid.outline = outlineLatLngs(b);

        clearMarks();
        outline(marks, b, false);
        defects.forEach(d => (d.i !== b.ai || d.j !== b.aj) && mark(marks, d.ll, X_SVG, 18)); // anchor cell keeps just the anchor
        mark(marks, grid.anchor, ANCHOR_SVG, 24);
        setMode('dest');
        toast(`Source block: ${b.nx} × ${b.ny} modules, ${defects.length} defect${defects.length === 1 ? '' : 's'}. Now click the destination anchor`);
        W.akGrid = grid; // for console inspection
    }

    // ---------- input ----------
    let downAt = null;
    function inMap(e){
        const c = map && map.getContainer();
        return c && e.target && c.contains(e.target) && !(e.target.closest && e.target.closest('.leaflet-control-container'));
    }

    const picking = () => mode === 'anchor' || mode === 'extent' || mode === 'dest';
    function onDown(e){ if (picking()) downAt = { x: e.clientX, y: e.clientY }; }

    function onClick(e){
        if (!picking() || !inMap(e)) return;
        e.stopPropagation(); e.preventDefault();            // keep the page from selecting things
        if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5) return; // was a pan
        const ll = map.mouseEventToLatLng(e);               // rotation-aware (rotateMap patches this)
        if (mode === 'anchor') onFirstClick(ll);
        else if (mode === 'extent') onSecondClick(ll);
        else onDestClick(ll);
    }

    function onKey(e){
        const a = document.activeElement;
        if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable)) return;
        if (mode === 'running') {
            guardKey(e);
            return;
        }
        if (e.key === 'Escape' && mode !== 'off') { e.preventDefault(); cancel('Grid move cancelled'); return; }
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.repeat) return;
        if (e.key.toLowerCase() !== KEY) return;
        e.preventDefault(); e.stopPropagation();
        if (!map) { toast('Grid move: map not ready', true); return; }
        clearMarks(); clearPreview(); grid = null;
        setMode('anchor');
        toast('Grid move: click the first corner module of the block');
    }

    let started = false;
    async function init(){
        if (started) return true;
        if (!W.akMove || !W.L) return false;
        try { map = await W.akMove.getMap(); } catch (_) { return false; }
        if (started) return true;
        started = true;
        document.addEventListener('keydown', onKey, true);
        W.addEventListener('keydown', e => { if (mode === 'running') guardKey(e); }, true); // window capture: before the page's own handlers
        W.addEventListener('keyup', e => { if (mode === 'running') guardKey(e); }, true);
        W.addEventListener('keypress', e => { if (mode === 'running') guardKey(e); }, true);
        document.addEventListener('mousedown', onDown, true);
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('click', onClick, true);
        document.addEventListener('dblclick', e => { if (picking() && inMap(e)) { e.stopPropagation(); e.preventDefault(); } }, true);
        return true;
    }

    let tries = 0;
    const t = setInterval(async () => {
        if (++tries > 60) return clearInterval(t);
        if (await init()) clearInterval(t);
    }, 500);
}
moveGrid();