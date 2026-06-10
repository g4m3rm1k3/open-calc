# UI Lab 11 — The Canvas
## World Coordinates, the Render Loop, and Drawing Tools

---

**What you will build.**

The canvas comes alive. A world coordinate system with zoom and pan. A grid
and axes that scale with zoom. The line, circle, and arc tools from Lab 10
actually draw geometry. Live preview while moving the mouse. Snap to grid.
The viewport hint disappears when the first entity is placed.

This lab connects everything: the tool state machine (Lab 10), the action
system (Lab 9), the resize system (Lab 8), all feeding into one render loop.

**Concepts this lab teaches:**
- The world/screen coordinate system (from the canvas tutorial, now in the app)
- The render loop with dirty flag
- Drawing grid and axes that respond to zoom
- Mouse event handling on the canvas
- Wiring tool clicks to geometry creation
- The entity data model
- Live tool preview (rubber-band line, circle radius, arc)

---

## Part 1 — The coordinate system

You know this from the canvas tutorial. The key values:

```javascript
// ── View state ────────────────────────────────────────────────────
const view = {
  panX: 0,    // screen pixel where world (0,0) appears — set on first resize
  panY: 0,
  zoom: 40,   // pixels per world unit
};

function worldToScreen(wx, wy) {
  return {
    x: view.panX + wx * view.zoom,
    y: view.panY - wy * view.zoom,   // Y flip: world up = screen up
  };
}

function screenToWorld(sx, sy) {
  return {
    x:  (sx - view.panX) / view.zoom,
    y: -(sy - view.panY) / view.zoom,
  };
}

function snapToGrid(wx, wy) {
  if (!snapEnabled) return { x: wx, y: wy };
  const sp = gridSpacing();
  return {
    x: Math.round(wx / sp) * sp,
    y: Math.round(wy / sp) * sp,
  };
}

function gridSpacing() {
  const targetPx = 60;
  const raw      = targetPx / view.zoom;
  const mag      = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm     = raw / mag;
  const nice     = norm < 1.5 ? 1 : norm < 3.5 ? 2.5 : norm < 7.5 ? 5 : 10;
  return nice * mag;
}
```

The view starts with `panX` and `panY` at zero. Set them to the canvas center
on the first resize — this puts the world origin at the center of the viewport.

```javascript
// Called when the canvas is first sized or resized
function onCanvasResize() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  // Only center on first load — after that, preserve the view
  if (!view._initialized) {
    view.panX = (canvas._logicalWidth  || canvas.width)  / 2;
    view.panY = (canvas._logicalHeight || canvas.height) / 2;
    view._initialized = true;
  }

  markDirty();
}
```

`onCanvasResize` is the hook you put in Lab 8's `resizeCanvas` function —
`if (typeof onCanvasResize === 'function') onCanvasResize()`. It runs
automatically whenever the canvas resizes.

---

## Part 2 — The entity model

```javascript
// ── Entity storage ────────────────────────────────────────────────
let entities   = [];
let nextId     = 1;
const selected = new Set();  // Set of entity IDs

function addEntity(ent) {
  ent.id = nextId++;
  entities.push(ent);
  updateEntityCount();
  markDirty();
  return ent;
}

function deleteEntities(ids) {
  const idSet = new Set(ids);
  entities = entities.filter(e => !idSet.has(e.id));
  ids.forEach(id => selected.delete(id));
  updateEntityCount();
  markDirty();
}

function updateEntityCount() {
  const el = document.getElementById('status-entities');
  if (el) el.textContent = `${entities.length} entit${entities.length === 1 ? 'y' : 'ies'}`;
}

// Entity factories
function makeLine(x1, y1, x2, y2) {
  return { type: 'line', x1, y1, x2, y2 };
}

function makeCircle(cx, cy, r) {
  return { type: 'circle', cx, cy, r };
}

function makeArc(cx, cy, r, startDeg, endDeg, ccw = true) {
  return { type: 'arc', cx, cy, r, startDeg, endDeg, ccw };
}
```

---

## Part 3 — The undo stack

```javascript
// ── Undo stack ────────────────────────────────────────────────────
const undoStack = [];
const redoStack = [];
const MAX_UNDO  = 50;

function saveUndo(label = '') {
  undoStack.push({
    label,
    entities: entities.map(e => ({ ...e })),
    selected: new Set(selected),
  });
  redoStack.length = 0;
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoButtons();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push({
    label:    undoStack[undoStack.length - 1]?.label || '',
    entities: entities.map(e => ({ ...e })),
    selected: new Set(selected),
  });
  const snapshot = undoStack.pop();
  entities = snapshot.entities;
  selected.clear();
  snapshot.selected.forEach(id => selected.add(id));
  updateEntityCount();
  updateUndoButtons();
  markDirty();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push({
    label:    redoStack[redoStack.length - 1]?.label || '',
    entities: entities.map(e => ({ ...e })),
    selected: new Set(selected),
  });
  const snapshot = redoStack.pop();
  entities = snapshot.entities;
  selected.clear();
  snapshot.selected.forEach(id => selected.add(id));
  updateEntityCount();
  updateUndoButtons();
  markDirty();
}

function updateUndoButtons() {
  setUndoEnabled(
    undoStack.length > 0,
    redoStack.length > 0,
    undoStack[undoStack.length - 1]?.label,
    redoStack[redoStack.length - 1]?.label,
  );
}

onAction('undo', undo);
onAction('redo', redo);
onAction('delete', () => {
  if (selected.size === 0) return;
  saveUndo('Delete');
  deleteEntities([...selected]);
});
onAction('select-all', () => {
  entities.forEach(e => selected.add(e.id));
  markDirty();
});
```

---

## Part 4 — The render loop

```javascript
// ── Render loop ───────────────────────────────────────────────────
let _dirty = true;

function markDirty() { _dirty = true; }

function renderLoop() {
  if (_dirty) {
    render();
    _dirty = false;
  }
  requestAnimationFrame(renderLoop);
}

function render() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W   = canvas._logicalWidth  || canvas.width;
  const H   = canvas._logicalHeight || canvas.height;
  const dpr = window.devicePixelRatio || 1;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, W, H);

  drawGrid(ctx, W, H);
  drawAxes(ctx, W, H);
  drawEntities(ctx);
  drawToolPreview(ctx);
  drawCursorIndicator(ctx);

  ctx.restore();
}
```

The `ctx.scale(dpr, dpr)` at the top means all drawing coordinates are in
CSS pixels (logical pixels), not physical pixels. Your coordinate math stays
simple — you never think about `devicePixelRatio` in the drawing code.

---

## Part 5 — Drawing the grid and axes

```javascript
// ── Grid and axes ─────────────────────────────────────────────────
function drawGrid(ctx, W, H) {
  const sp  = gridSpacing();
  const maj = sp * 10;
  const tl  = screenToWorld(0, 0);
  const br  = screenToWorld(W, H);

  ctx.lineWidth = 1;

  // Minor grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for (let x = Math.floor(tl.x / sp) * sp; x <= br.x; x += sp) {
    const s = worldToScreen(x, 0);
    ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.lineTo(s.x, H); ctx.stroke();
  }
  for (let y = Math.floor(br.y / sp) * sp; y <= tl.y; y += sp) {
    const s = worldToScreen(0, y);
    ctx.beginPath(); ctx.moveTo(0, s.y); ctx.lineTo(W, s.y); ctx.stroke();
  }

  // Major grid
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  for (let x = Math.floor(tl.x / maj) * maj; x <= br.x; x += maj) {
    const s = worldToScreen(x, 0);
    ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.lineTo(s.x, H); ctx.stroke();
  }
  for (let y = Math.floor(br.y / maj) * maj; y <= tl.y; y += maj) {
    const s = worldToScreen(0, y);
    ctx.beginPath(); ctx.moveTo(0, s.y); ctx.lineTo(W, s.y); ctx.stroke();
  }

  // Ruler labels along edges
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '10px Consolas';
  ctx.textBaseline = 'bottom';
  ctx.textAlign    = 'left';
  for (let x = Math.ceil(tl.x / sp) * sp; x < br.x; x += sp) {
    const s = worldToScreen(x, 0);
    if (s.x < 4 || s.x > W - 20) continue;
    ctx.fillText(fmtCoord(x), s.x + 2, H - 2);
  }
  ctx.textBaseline = 'top';
  for (let y = Math.ceil(br.y / sp) * sp; y < tl.y; y += sp) {
    const s = worldToScreen(0, y);
    if (s.y < 4 || s.y > H - 14) continue;
    ctx.fillText(fmtCoord(y), 4, s.y + 2);
  }
}

function drawAxes(ctx, W, H) {
  const o = worldToScreen(0, 0);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(220,60,60,0.5)';
  ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(W, o.y); ctx.stroke();

  ctx.strokeStyle = 'rgba(60,200,80,0.5)';
  ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, H); ctx.stroke();
}

function fmtCoord(n) {
  const s = parseFloat(n.toPrecision(6)).toString();
  return s.length > 7 ? n.toExponential(1) : s;
}
```

---

## Part 6 — Drawing entities

```javascript
// ── Entity drawing ────────────────────────────────────────────────
const DEG = Math.PI / 180;

function drawEntities(ctx) {
  for (const ent of entities) {
    const isSelected = selected.has(ent.id);
    drawEntity(ctx, ent, isSelected);
  }
}

function drawEntity(ctx, ent, isSelected) {
  ctx.strokeStyle = isSelected ? '#ffcc44' : '#3377ff';
  ctx.lineWidth   = isSelected ? 2 : 1.5;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  switch (ent.type) {
    case 'line': {
      const a = worldToScreen(ent.x1, ent.y1);
      const b = worldToScreen(ent.x2, ent.y2);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Endpoint dots
      ctx.fillStyle = ctx.strokeStyle;
      [a, b].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSelected ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'circle': {
      const c      = worldToScreen(ent.cx, ent.cy);
      const rPx    = ent.r * view.zoom;
      ctx.beginPath();
      ctx.arc(c.x, c.y, rPx, 0, Math.PI * 2);
      ctx.stroke();

      // Center mark
      const mkSize = Math.min(6, rPx * 0.3);
      ctx.strokeStyle = isSelected ? '#ffcc4488' : '#3377ff88';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(c.x - mkSize, c.y); ctx.lineTo(c.x + mkSize, c.y);
      ctx.moveTo(c.x, c.y - mkSize); ctx.lineTo(c.x, c.y + mkSize);
      ctx.stroke();
      break;
    }
    case 'arc': {
      const c      = worldToScreen(ent.cx, ent.cy);
      const rPx    = ent.r * view.zoom;
      // Canvas arc goes CW; world CCW. Negate angles + flip direction flag.
      const startR = -ent.startDeg * DEG;
      const endR   = -ent.endDeg   * DEG;
      ctx.beginPath();
      ctx.arc(c.x, c.y, rPx, startR, endR, !ent.ccw);
      ctx.stroke();
      break;
    }
  }
}
```

---

## Part 7 — Mouse input on the canvas

```javascript
// ── Canvas mouse state ────────────────────────────────────────────
let cursorWorld  = { x: 0, y: 0 };  // snapped world position
let panDragState = null;

function initCanvasInput() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  canvas.addEventListener('mousedown',  onCanvasMouseDown);
  canvas.addEventListener('mousemove',  onCanvasMouseMove);
  canvas.addEventListener('mouseup',    onCanvasMouseUp);
  canvas.addEventListener('wheel',      onCanvasWheel, { passive: false });
  canvas.addEventListener('mouseleave', onCanvasMouseLeave);
}

function getCanvasPos(e) {
  const rect = document.getElementById('canvas').getBoundingClientRect();
  return {
    sx: e.clientX - rect.left,
    sy: e.clientY - rect.top,
  };
}

function onCanvasMouseMove(e) {
  const { sx, sy } = getCanvasPos(e);

  // Pan drag
  if (panDragState) {
    view.panX = panDragState.startPanX + (sx - panDragState.startSx);
    view.panY = panDragState.startPanY + (sy - panDragState.startSy);
    markDirty();
  }

  // Update cursor world position
  const raw  = screenToWorld(sx, sy);
  cursorWorld = snapToGrid(raw.x, raw.y);

  // Update status bar coordinates
  const el = document.getElementById('status-coords');
  if (el) {
    el.textContent =
      `X: ${cursorWorld.x.toFixed(3).padStart(9)}   Y: ${cursorWorld.y.toFixed(3).padStart(9)}`;
  }

  markDirty();
}

function onCanvasMouseDown(e) {
  // Middle mouse or alt+left = pan
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    e.preventDefault();
    const { sx, sy } = getCanvasPos(e);
    panDragState = { startSx: sx, startSy: sy,
                     startPanX: view.panX, startPanY: view.panY };
    document.getElementById('viewport').style.cursor = 'grabbing';
    return;
  }

  if (e.button !== 0) return;

  const { sx, sy } = getCanvasPos(e);
  const raw   = screenToWorld(sx, sy);
  const world = snapToGrid(raw.x, raw.y);

  handleToolClick(world.x, world.y, e);
}

function onCanvasMouseUp(e) {
  if (panDragState) {
    panDragState = null;
    updateCursor();
  }
}

function onCanvasMouseLeave() {
  if (panDragState) {
    panDragState = null;
    updateCursor();
  }
}

function onCanvasWheel(e) {
  e.preventDefault();
  const { sx, sy } = getCanvasPos(e);
  const before     = screenToWorld(sx, sy);
  const factor     = e.deltaY < 0 ? 1.12 : 1 / 1.12;

  view.zoom = Math.max(1, Math.min(5000, view.zoom * factor));
  view.panX = sx - before.x *  view.zoom;
  view.panY = sy + before.y *  view.zoom;

  const el = document.getElementById('status-zoom');
  if (el) el.textContent = `${view.zoom.toFixed(1)} px/u`;

  markDirty();
}
```

---

## Part 8 — Tool click handlers

```javascript
// ── Tool click dispatch ───────────────────────────────────────────
function handleToolClick(wx, wy, e) {
  switch (toolState.active) {
    case 'select':   handleSelectClick(wx, wy, e);   break;
    case 'line':     handleLineClick(wx, wy);         break;
    case 'circle':   handleCircleClick(wx, wy);       break;
    case 'arc':      handleArcClick(wx, wy);          break;
    case 'polyline': handlePolylineClick(wx, wy, e); break;
  }
}

// ── Line tool ─────────────────────────────────────────────────────
function handleLineClick(wx, wy) {
  if (toolState.state === 'idle') {
    advanceTool('first-point', { x1: wx, y1: wy });
  } else {
    saveUndo('Add Line');
    addEntity(makeLine(toolState.data.x1, toolState.data.y1, wx, wy));
    // Chain: end of this line is start of next
    advanceTool('first-point', { x1: wx, y1: wy });
    hideViewportHint();
  }
}

// ── Circle tool ───────────────────────────────────────────────────
function handleCircleClick(wx, wy) {
  if (toolState.state === 'idle') {
    advanceTool('center-placed', { cx: wx, cy: wy });
  } else {
    const r = Math.hypot(wx - toolState.data.cx, wy - toolState.data.cy);
    if (r > 0.001) {
      saveUndo('Add Circle');
      addEntity(makeCircle(toolState.data.cx, toolState.data.cy, r));
      hideViewportHint();
    }
    advanceTool('idle');
    toolState.state = 'idle';
  }
}

// ── Arc tool ──────────────────────────────────────────────────────
function handleArcClick(wx, wy) {
  if (toolState.state === 'idle') {
    advanceTool('center-placed', { cx: wx, cy: wy });

  } else if (toolState.state === 'center-placed') {
    const r        = Math.hypot(wx - toolState.data.cx, wy - toolState.data.cy);
    const startDeg = Math.atan2(wy - toolState.data.cy,
                                wx - toolState.data.cx) * 180 / Math.PI;
    advanceTool('start-placed', { r, startDeg });

  } else if (toolState.state === 'start-placed') {
    const endDeg = Math.atan2(wy - toolState.data.cy,
                              wx - toolState.data.cx) * 180 / Math.PI;
    saveUndo('Add Arc');
    addEntity(makeArc(
      toolState.data.cx, toolState.data.cy,
      toolState.data.r,
      toolState.data.startDeg, endDeg,
      true
    ));
    cancelTool();
    hideViewportHint();
  }
}

// ── Select tool ───────────────────────────────────────────────────
function handleSelectClick(wx, wy, e) {
  const hit = hitTest(wx, wy);
  if (!e.shiftKey) selected.clear();
  if (hit) {
    if (selected.has(hit.id)) selected.delete(hit.id);
    else selected.add(hit.id);
  }
  markDirty();
  updatePropertiesPanel();
}

// ── Polyline tool ─────────────────────────────────────────────────
function handlePolylineClick(wx, wy, e) {
  if (toolState.state === 'idle') {
    advanceTool('in-progress', { points: [{ x: wx, y: wy }] });
  } else {
    const pts = toolState.data.points;

    // Double-click finishes the polyline
    if (e.detail === 2 && pts.length >= 2) {
      finishPolyline();
      return;
    }

    pts.push({ x: wx, y: wy });
    advanceTool('in-progress', { points: pts });
    hideViewportHint();
  }
}

function finishPolyline() {
  const pts = toolState.data.points;
  if (pts && pts.length >= 2) {
    saveUndo('Add Polyline');
    addEntity({ type: 'polyline', points: pts.map(p => ({ ...p })) });
  }
  cancelTool();
}

// Enter finishes polyline
onAction('tool-confirm', finishPolyline);
```

Add `'enter': () => dispatch('tool-confirm')` to the keyboard shortcuts object.

---

## Part 9 — Tool preview

```javascript
// ── Tool preview (rubber-band) ────────────────────────────────────
function drawToolPreview(ctx) {
  if (toolState.state === 'idle') return;
  const cx = cursorWorld.x, cy = cursorWorld.y;

  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = 'rgba(100,180,255,0.6)';
  ctx.lineWidth   = 1;

  switch (toolState.active) {

    case 'line': {
      if (toolState.state !== 'first-point') break;
      const a = worldToScreen(toolState.data.x1, toolState.data.y1);
      const b = worldToScreen(cx, cy);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      // Dimension label
      const len = Math.hypot(cx - toolState.data.x1, cy - toolState.data.y1);
      drawDimLabel(ctx,
        `${len.toFixed(3)}`,
        (a.x + b.x) / 2, (a.y + b.y) / 2 - 12
      );
      // Start point marker
      ctx.setLineDash([]);
      ctx.fillStyle = '#3377ff';
      ctx.beginPath(); ctx.arc(a.x, a.y, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'circle': {
      if (toolState.state !== 'center-placed') break;
      const c  = worldToScreen(toolState.data.cx, toolState.data.cy);
      const r  = Math.hypot(cx - toolState.data.cx, cy - toolState.data.cy);
      const rPx = r * view.zoom;
      ctx.beginPath(); ctx.arc(c.x, c.y, rPx, 0, Math.PI * 2); ctx.stroke();
      drawDimLabel(ctx, `r ${r.toFixed(3)}`, c.x + rPx * 0.7, c.y - rPx * 0.7 - 12);
      ctx.setLineDash([]);
      ctx.fillStyle = '#3377ff';
      ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'arc': {
      if (toolState.state === 'center-placed') {
        const c   = worldToScreen(toolState.data.cx, toolState.data.cy);
        const rPx = Math.hypot(cx - toolState.data.cx,
                               cy - toolState.data.cy) * view.zoom;
        ctx.beginPath(); ctx.arc(c.x, c.y, rPx, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#3377ff';
        ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
      } else if (toolState.state === 'start-placed') {
        const c      = worldToScreen(toolState.data.cx, toolState.data.cy);
        const rPx    = toolState.data.r * view.zoom;
        const startR = -toolState.data.startDeg * DEG;
        const endR   = -Math.atan2(cy - toolState.data.cy,
                                   cx - toolState.data.cx);
        ctx.beginPath(); ctx.arc(c.x, c.y, rPx, startR, endR, false); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#3377ff';
        ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case 'polyline': {
      if (toolState.state !== 'in-progress') break;
      const pts = toolState.data.points;
      if (!pts || pts.length === 0) break;
      ctx.beginPath();
      const first = worldToScreen(pts[0].x, pts[0].y);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < pts.length; i++) {
        const s = worldToScreen(pts[i].x, pts[i].y);
        ctx.lineTo(s.x, s.y);
      }
      const cur = worldToScreen(cx, cy);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
      ctx.setLineDash([]);
      pts.forEach(pt => {
        const s = worldToScreen(pt.x, pt.y);
        ctx.fillStyle = '#3377ff';
        ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }
  }

  ctx.setLineDash([]);
}

function drawDimLabel(ctx, text, sx, sy) {
  ctx.setLineDash([]);
  ctx.font = '11px Consolas';
  const w  = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(sx - w / 2 - 4, sy - 8, w + 8, 16);
  ctx.fillStyle = '#ffdd88';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, sx, sy);
}
```

---

## Part 10 — Cursor indicator

```javascript
// ── Cursor crosshair ──────────────────────────────────────────────
function drawCursorIndicator(ctx) {
  const s    = worldToScreen(cursorWorld.x, cursorWorld.y);
  const size = 8;

  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(s.x - size, s.y); ctx.lineTo(s.x + size, s.y);
  ctx.moveTo(s.x, s.y - size); ctx.lineTo(s.x, s.y + size);
  ctx.stroke();

  ctx.strokeStyle = snapEnabled ? '#33bb77' : '#3377ff';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
  ctx.stroke();
}
```

---

## Part 11 — Hit testing for selection

```javascript
// ── Hit testing ───────────────────────────────────────────────────
function hitTest(wx, wy) {
  const tolerance = 6 / view.zoom;  // 6 screen pixels in world units

  for (let i = entities.length - 1; i >= 0; i--) {
    if (hitEntity(entities[i], wx, wy, tolerance)) return entities[i];
  }
  return null;
}

function hitEntity(ent, wx, wy, tol) {
  switch (ent.type) {
    case 'line':
      return distToSegment(wx, wy, ent.x1, ent.y1, ent.x2, ent.y2) < tol;
    case 'circle':
      return Math.abs(Math.hypot(wx - ent.cx, wy - ent.cy) - ent.r) < tol;
    case 'arc': {
      const d = Math.abs(Math.hypot(wx - ent.cx, wy - ent.cy) - ent.r);
      if (d > tol) return false;
      const angle = Math.atan2(wy - ent.cy, wx - ent.cx) * 180 / Math.PI;
      return angleInArc(angle, ent.startDeg, ent.endDeg, ent.ccw);
    }
    case 'polyline': {
      const pts = ent.points;
      for (let i = 0; i + 1 < pts.length; i++) {
        if (distToSegment(wx, wy, pts[i].x, pts[i].y,
                          pts[i+1].x, pts[i+1].y) < tol) return true;
      }
      return false;
    }
  }
  return false;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx*dx + dy*dy;
  if (lenSq < 1e-10) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / lenSq));
  return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
}

function angleInArc(a, start, end, ccw) {
  a     = ((a     % 360) + 360) % 360;
  start = ((start % 360) + 360) % 360;
  end   = ((end   % 360) + 360) % 360;
  if (ccw) {
    return start <= end ? a >= start && a <= end : a >= start || a <= end;
  } else {
    return start >= end ? a <= start && a >= end : a <= start || a >= end;
  }
}
```

---

## Part 12 — View actions and the viewport hint

```javascript
// ── View actions ──────────────────────────────────────────────────
onAction('fit', fitView);
onAction('reset-view', resetView);
onAction('zoom-in',  () => zoomBy(1.4));
onAction('zoom-out', () => zoomBy(1 / 1.4));

function fitView() {
  const canvas = document.getElementById('canvas');
  if (!canvas || entities.length === 0) return;
  const W = canvas._logicalWidth, H = canvas._logicalHeight;

  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
  entities.forEach(e => {
    const pts = entityPoints(e);
    pts.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
  });
  if (!isFinite(minX)) return;

  const pad  = 0.15;
  const dx   = (maxX - minX) * (1 + pad) || 20;
  const dy   = (maxY - minY) * (1 + pad) || 20;
  view.zoom  = Math.min(W / dx, H / dy) * 0.9;
  view.panX  = W / 2 - ((minX + maxX) / 2) * view.zoom;
  view.panY  = H / 2 + ((minY + maxY) / 2) * view.zoom;
  markDirty();
}

function resetView() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  view.zoom = 40;
  view.panX = (canvas._logicalWidth  || 800) / 2;
  view.panY = (canvas._logicalHeight || 600) / 2;
  const el = document.getElementById('status-zoom');
  if (el) el.textContent = '40.0 px/u';
  markDirty();
}

function zoomBy(factor) {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const cx = (canvas._logicalWidth  || 800) / 2;
  const cy = (canvas._logicalHeight || 600) / 2;
  const before = screenToWorld(cx, cy);
  view.zoom = Math.max(1, Math.min(5000, view.zoom * factor));
  view.panX = cx - before.x * view.zoom;
  view.panY = cy + before.y * view.zoom;
  const el = document.getElementById('status-zoom');
  if (el) el.textContent = `${view.zoom.toFixed(1)} px/u`;
  markDirty();
}

function entityPoints(e) {
  switch (e.type) {
    case 'line':     return [{ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }];
    case 'circle':   return [{ x: e.cx - e.r, y: e.cy }, { x: e.cx + e.r, y: e.cy },
                             { x: e.cx, y: e.cy - e.r }, { x: e.cx, y: e.cy + e.r }];
    case 'arc':      return [{ x: e.cx, y: e.cy }];
    case 'polyline': return e.points;
    default: return [];
  }
}

// ── Viewport hint ─────────────────────────────────────────────────
function hideViewportHint() {
  const hint = document.querySelector('.viewport-hint');
  if (hint) hint.style.display = 'none';
}
```

---

## Part 13 — Wiring it all together

Add the init calls at the bottom of your script:

```javascript
restoreLayout();
initSplitters();
resizeCanvas();
initMenus();
initToolPalette();
initKeyboardShortcuts();
initToolbarButtons();
setTool('select');
initCanvasInput();
requestAnimationFrame(renderLoop);
```

Save and refresh. Draw some lines. Draw a circle. Draw an arc. Press F to
fit the view. Press H to reset. Scroll to zoom. Alt+drag to pan. Press V
to select, click an entity — it turns yellow. Press Delete — it disappears.
Press Ctrl+Z — it comes back.

---

## What you learned in this lab

- `onCanvasResize` hook connects the resize system to the view system
- The render loop: dirty flag, `requestAnimationFrame`, one `render()` call
  per frame — never more
- `ctx.scale(dpr, dpr)` once at the start of render handles retina screens
  for all subsequent drawing code
- The entity model: plain objects, flat array, unique IDs
- Undo stack: snapshot the entity array before every modification
- Tool clicks call `advanceTool()` to advance the state machine and merge
  partial geometry data
- Hit testing in world coordinates: `6 / view.zoom` gives a consistent
  screen-pixel tolerance regardless of zoom level
- `distToSegment` tests if a point is within tolerance of a line segment
- Tool preview uses `setLineDash` and reduced opacity to distinguish it from
  real geometry

## What comes in Lab 12

The properties panel wired to selection. When you click an entity, the
Properties tab fills with that entity's data. You can edit a value and the
entity updates on the canvas immediately.
