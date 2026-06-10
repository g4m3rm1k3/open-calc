# UI Lab 8 — Splitters
## Drag to Resize Panels

---

**What you will build.**

The three splitter handles in your shell become functional. Dragging the
handle between the tool palette and canvas resizes the left dock. Dragging
the handle between the canvas and properties panel resizes the right dock.
Dragging the handle between the canvas and G-code panel resizes the bottom
dock. The layout saves to localStorage and restores on reload.

**Concepts this lab teaches:**
- Mouse event handling: mousedown, mousemove, mouseup
- Why you listen on `document`, not on the element
- Preventing text selection during drag
- Reading element dimensions with `getBoundingClientRect`
- Saving and restoring state with localStorage
- ResizeObserver for responding to size changes

---

## Part 1 — How a splitter works

A splitter is a thin element between two panels. When the user drags it,
you change the size of one adjacent panel. The other panel fills the
remaining space because it has `flex: 1`.

The naive approach fails: you listen for `mousemove` on the splitter itself.
But if the user moves the mouse too fast, the cursor slides off the splitter
and the drag stops.

The correct approach: listen for `mousedown` on the splitter, then listen
for `mousemove` and `mouseup` on `document`. That way the drag continues no
matter how fast the mouse moves — even outside the browser window.

```
mousedown on splitter  →  record start position and start size
mousemove on document  →  calculate delta, update panel size
mouseup on document    →  clean up listeners
```

---

## Part 2 — The splitter code

Add a `<script>` tag just before `</body>` in your `camtool.html`. Everything
in this lab goes inside that script tag.

Type this. Read every line before you type it.

**Step 1 — The initSplitters function. Save.**

```javascript
function initSplitters() {
  document.querySelectorAll('.splitter').forEach(handle => {
    handle.addEventListener('mousedown', onSplitterMouseDown);
  });
}
```

This finds every element with the `.splitter` class and attaches a mousedown
listener. You wrote three splitters in the HTML — they all get wired up here.

**Step 2 — The mousedown handler. Save.**

```javascript
function onSplitterMouseDown(e) {
  e.preventDefault();

  const handle   = e.currentTarget;
  const isV      = handle.classList.contains('splitter-v');
  const targetId = handle.dataset.target;
  const target   = document.getElementById(targetId);

  if (!target) return;

  const startX    = e.clientX;
  const startY    = e.clientY;
  const startSize = isV
    ? target.getBoundingClientRect().width
    : target.getBoundingClientRect().height;

  const isAfter = targetId === 'dock-right';

  handle.classList.add('dragging');
  document.body.style.cursor    = isV ? 'col-resize' : 'row-resize';
  document.body.style.userSelect = 'none';
```

`e.preventDefault()` stops the browser from starting a text selection drag.
`isV` — is this a vertical splitter (resizes width) or horizontal (resizes
height)? `target` is the panel being resized, identified by `data-target`
on the splitter. `startSize` is the current size before dragging begins.
`isAfter` — the right dock is to the right of the splitter, so dragging
right makes it smaller, not larger. The sign needs to flip.

```javascript
  function onMove(e) {
    const delta   = isV
      ? (e.clientX - startX)
      : (e.clientY - startY);

    const sign    = isAfter ? -1 : 1;
    const newSize = Math.max(40, startSize + delta * sign);

    if (isV) {
      target.style.width  = newSize + 'px';
    } else {
      target.style.height = newSize + 'px';
    }

    window.dispatchEvent(new CustomEvent('layout-changed'));
  }
```

`delta` is how far the mouse has moved from where the drag started. For the
right dock, the sign is flipped — dragging right reduces the dock width.
`Math.max(40, ...)` prevents the panel from collapsing to zero.
`layout-changed` is dispatched so the canvas can resize itself.

```javascript
  function onUp() {
    handle.classList.remove('dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    saveLayout();
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}
```

On mouseup, the cursor resets, listeners are removed (important — they would
accumulate if not removed), and the layout saves.

**Step 3 — Save and restore layout. Save.**

```javascript
function saveLayout() {
  const layout = {};
  ['dock-left', 'dock-right', 'dock-bottom'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    layout[id] = {
      width:  el.style.width  || null,
      height: el.style.height || null,
    };
  });
  localStorage.setItem('camtool-layout', JSON.stringify(layout));
}

function restoreLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem('camtool-layout') || '{}');
    Object.entries(saved).forEach(([id, sizes]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (sizes.width)  el.style.width  = sizes.width;
      if (sizes.height) el.style.height = sizes.height;
    });
  } catch (e) {
    // Ignore corrupt saved state
  }
}
```

`localStorage.setItem` saves a string. `JSON.stringify` converts the object
to a string. `JSON.parse` converts it back. The try/catch handles the case
where the saved JSON is corrupt or from an old version.

**Step 4 — Initialize on page load. Save.**

```javascript
restoreLayout();
initSplitters();
```

These two lines at the bottom of the script tag run when the page loads.

Save and refresh. Drag each splitter handle. The panels resize. Reload the
page — the layout is exactly where you left it.

---

## Part 3 — Resizing the canvas

When the layout changes, the canvas must resize to fill its container.
The canvas `width` and `height` attributes must match the actual pixel
dimensions of the container. Without this, canvas drawings appear stretched.

Add this after the splitter code:

**Step 1 — The resize function. Save.**

```javascript
function resizeCanvas() {
  const viewport = document.getElementById('viewport');
  const canvas   = document.getElementById('canvas');
  if (!canvas || !viewport) return;

  const rect = viewport.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;

  canvas.width  = Math.floor(rect.width  * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width  = rect.width  + 'px';
  canvas.style.height = rect.height + 'px';

  canvas._logicalWidth  = rect.width;
  canvas._logicalHeight = rect.height;

  if (typeof onCanvasResize === 'function') {
    onCanvasResize();
  }
}
```

`devicePixelRatio` is 2 on retina screens — the canvas buffer needs to be
2× larger than CSS pixels, then scaled down via `style.width/height`. Without
this, canvas drawings look blurry on retina screens.

`canvas._logicalWidth` and `_logicalHeight` store the CSS pixel dimensions
(what your coordinate math uses). The physical `canvas.width/height` are
the actual buffer dimensions (used by the drawing API). Always use the
logical dimensions for coordinate math.

`onCanvasResize` is a hook — if you define that function later (when you add
the drawing system), it gets called automatically.

**Step 2 — Listen for layout changes. Save.**

```javascript
window.addEventListener('resize', resizeCanvas);
window.addEventListener('layout-changed', resizeCanvas);

const viewportObserver = new ResizeObserver(resizeCanvas);
const viewportEl = document.getElementById('viewport');
if (viewportEl) viewportObserver.observe(viewportEl);

resizeCanvas();
```

`ResizeObserver` fires when the viewport element changes size — this catches
splitter drags, browser resizes, and any other layout changes. Calling
`resizeCanvas()` immediately ensures the canvas is the right size on load.

Save and refresh. Open browser DevTools and look at the canvas element.
Its `width` and `height` attributes should match the viewport dimensions
(times `devicePixelRatio`). Drag a splitter — the canvas attributes update.

---

## Part 4 — Minimum and maximum sizes

Right now panels can be dragged to 40px (the minimum from `Math.max(40, ...)`).
Add maximum sizes and a collapse-to-icon-mode for the left dock:

```javascript
const DOCK_CONSTRAINTS = {
  'dock-left':   { min: 40,  max: 300, collapseAt: 44 },
  'dock-right':  { min: 180, max: 500, collapseAt: null },
  'dock-bottom': { min: 28,  max: 400, collapseAt: null },
};

function onMove(e) {
  const delta    = isV ? (e.clientX - startX) : (e.clientY - startY);
  const sign     = isAfter ? -1 : 1;
  const constraints = DOCK_CONSTRAINTS[targetId] || { min: 40, max: 600 };
  const newSize  = Math.max(
    constraints.min,
    Math.min(constraints.max, startSize + delta * sign)
  );

  if (isV) {
    target.style.width  = newSize + 'px';
  } else {
    target.style.height = newSize + 'px';
  }

  // Icon mode for the left dock when very narrow
  if (targetId === 'dock-left' && constraints.collapseAt) {
    target.classList.toggle('icon-mode', newSize <= constraints.collapseAt + 2);
  }

  window.dispatchEvent(new CustomEvent('layout-changed'));
}
```

Replace the `onMove` function from Step 2 with this version. Now panels
cannot be dragged past their maximum or below their minimum.

Add the icon mode CSS to your `<style>` section:

```css
.dock-left.icon-mode .tool-palette {
  /* Already icon-only — tool-palette shows icons */
}
```

The left dock is already icon-only (it only has icon buttons). The `icon-mode`
class is a hook you can use later for text labels if you add them.

---

## Part 5 — Double-click to reset a panel

Double-clicking a splitter should reset the panel to its default size.

Add to `onSplitterMouseDown`, just before attaching the move/up listeners:

```javascript
handle.addEventListener('dblclick', function onDblClick() {
  handle.removeEventListener('dblclick', onDblClick);
  const defaults = {
    'dock-left':   { width:  '44px' },
    'dock-right':  { width:  '268px' },
    'dock-bottom': { height: '200px' },
  };
  const def = defaults[targetId];
  if (!def) return;
  if (def.width)  target.style.width  = def.width;
  if (def.height) target.style.height = def.height;
  target.classList.remove('icon-mode');
  window.dispatchEvent(new CustomEvent('layout-changed'));
  saveLayout();
});
```

Double-click any splitter handle — the panel snaps back to its default size.

---

## Part 6 — The complete script for this lab

Here is the complete JavaScript for Lab 8, in the correct order. Replace
whatever you have in your `<script>` tag with this clean version.

```javascript
// ── Layout constraints ────────────────────────────────────────────
const DOCK_CONSTRAINTS = {
  'dock-left':   { min: 40,  max: 300 },
  'dock-right':  { min: 180, max: 500 },
  'dock-bottom': { min: 28,  max: 400 },
};

// ── Splitter drag ─────────────────────────────────────────────────
function initSplitters() {
  document.querySelectorAll('.splitter').forEach(handle => {
    handle.addEventListener('mousedown', onSplitterMouseDown);
  });
}

function onSplitterMouseDown(e) {
  e.preventDefault();

  const handle      = e.currentTarget;
  const isV         = handle.classList.contains('splitter-v');
  const targetId    = handle.dataset.target;
  const target      = document.getElementById(targetId);
  if (!target) return;

  const startX      = e.clientX;
  const startY      = e.clientY;
  const startSize   = isV
    ? target.getBoundingClientRect().width
    : target.getBoundingClientRect().height;
  const isAfter     = targetId === 'dock-right';
  const constraints = DOCK_CONSTRAINTS[targetId] || { min: 40, max: 600 };

  handle.classList.add('dragging');
  document.body.style.cursor     = isV ? 'col-resize' : 'row-resize';
  document.body.style.userSelect = 'none';

  // Double-click to reset
  handle.addEventListener('dblclick', function reset() {
    handle.removeEventListener('dblclick', reset);
    const defaults = {
      'dock-left':   '44px',
      'dock-right':  '268px',
      'dock-bottom': '200px',
    };
    const def = defaults[targetId];
    if (def) {
      if (isV) target.style.width  = def;
      else     target.style.height = def;
      window.dispatchEvent(new CustomEvent('layout-changed'));
      saveLayout();
    }
  });

  function onMove(e) {
    const delta   = isV ? (e.clientX - startX) : (e.clientY - startY);
    const sign    = isAfter ? -1 : 1;
    const newSize = Math.max(
      constraints.min,
      Math.min(constraints.max, startSize + delta * sign)
    );
    if (isV) target.style.width  = newSize + 'px';
    else     target.style.height = newSize + 'px';
    window.dispatchEvent(new CustomEvent('layout-changed'));
  }

  function onUp() {
    handle.classList.remove('dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    saveLayout();
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}

// ── Layout persistence ────────────────────────────────────────────
function saveLayout() {
  const layout = {};
  ['dock-left', 'dock-right', 'dock-bottom'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    layout[id] = {
      width:  el.style.width  || null,
      height: el.style.height || null,
    };
  });
  localStorage.setItem('camtool-layout', JSON.stringify(layout));
}

function restoreLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem('camtool-layout') || '{}');
    Object.entries(saved).forEach(([id, sizes]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (sizes.width)  el.style.width  = sizes.width;
      if (sizes.height) el.style.height = sizes.height;
    });
  } catch (e) {}
}

// ── Canvas resize ─────────────────────────────────────────────────
function resizeCanvas() {
  const viewport = document.getElementById('viewport');
  const canvas   = document.getElementById('canvas');
  if (!canvas || !viewport) return;

  const rect = viewport.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;

  canvas.width  = Math.floor(rect.width  * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width  = rect.width  + 'px';
  canvas.style.height = rect.height + 'px';

  canvas._logicalWidth  = rect.width;
  canvas._logicalHeight = rect.height;

  if (typeof onCanvasResize === 'function') onCanvasResize();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('layout-changed', resizeCanvas);

const _viewportEl = document.getElementById('viewport');
if (_viewportEl) {
  new ResizeObserver(resizeCanvas).observe(_viewportEl);
}

// ── Init ──────────────────────────────────────────────────────────
restoreLayout();
initSplitters();
resizeCanvas();
```

Save and refresh. Drag all three splitters. Resize the browser window.
Reload — layout is preserved. Double-click a splitter — panel resets.

---

## What you learned in this lab

- Listen for `mousedown` on the element, then attach `mousemove` and `mouseup`
  to `document`. Always. Never to the element.
- `e.preventDefault()` on mousedown stops text-selection drag from interfering
- `document.body.style.userSelect = 'none'` during drag prevents text
  selection on other elements
- Always remove event listeners in the `mouseup` handler or they accumulate
- `getBoundingClientRect()` gives the current size of an element
- `localStorage` persists simple data as strings across page reloads
- `ResizeObserver` detects when an element's size changes
- `devicePixelRatio` — multiply canvas buffer by this for retina sharpness
- Canvas has two sizes: the buffer (`width`/`height` attributes) and the
  display (`style.width`/`style.height`). They must be set separately.

## What comes in Lab 9

The dropdown menus. Clicking File, Edit, View, Tools will open real dropdown
menus. You will build the menu system from scratch: opening, positioning,
closing on outside click, keyboard navigation, and wiring up the first
real actions (New, Save, Undo).
