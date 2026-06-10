# Lab 02 — The App Shell

### CAM System Masterclass

---

## What You Will Build

By the end of this lab the single-canvas page from Lab 01 has been transformed
into a complete application shell: a toolbar across the top, a resizable left
panel, the viewport in the center, and a status bar at the bottom. The shell is
built entirely from HTML and CSS — no JavaScript libraries, no UI frameworks.

Every structural decision you make here is permanent. The toolbar, panels, and
layout are the skeleton that every later lab adds organs to. You are not going
to redo this.

You will also meet a key concept: the difference between the **layout system**
(how regions are positioned and sized) and the **content system** (what is
inside each region). This lab builds the layout. The content comes in later labs.

**Time:** 3–4 hours.

---

## Prerequisites

Lab 01 complete. You have `index.html` with a working viewport.

---

## Part 1 — Why the Shell Matters

In Lab 01 we had one canvas filling the window. That is fine for a pure renderer
— a demo that just draws things. But a CAD application needs:

- A toolbar with tools and mode buttons
- A geometry list panel (so you can see and select what you've drawn)
- A properties panel (so you can edit selected geometry)
- A status bar with more information than just coordinates
- Possibly tabs, dialogs, context menus

These UI regions must coexist with the canvas without breaking it. The canvas
must keep filling its allocated space. Panels must be resizable without
JavaScript until the user needs drag-resize (we will add that in Lab 04).

This is an **application shell** — the structural skeleton. Getting it right
now means every lab that adds content to the shell is simple. Getting it wrong
means fighting the layout system every time you add a feature.

### The design principle: regions, not positions

Amateur UI code positions elements by X/Y coordinate:

```css
.toolbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
}
.panel {
  position: absolute;
  top: 40px;
  left: 0;
  width: 250px;
  height: calc(100% - 64px);
}
.canvas {
  position: absolute;
  top: 40px;
  left: 250px;
  right: 0;
  bottom: 24px;
}
```

This works until anything changes: add a menubar above the toolbar, and now
every absolute position needs updating. The layout is **fragile** because it
encodes exact positions instead of relationships.

Professional layouts express **relationships**:

> "The toolbar is at the top. The work area is below the toolbar. The left
> panel and the viewport share the work area horizontally. The status bar is
> at the bottom."

CSS Flexbox and CSS Grid express relationships. We use them exclusively.

---

## Part 2 — CSS Flexbox: The Complete Model

You saw Flexbox in Lab 01 (the two-region column). Now we need it fully.

### The flex container and flex items

When you set `display: flex` on an element, it becomes a **flex container**.
Its direct children become **flex items**. Only direct children — not
grandchildren — are controlled by the container's flex rules.

```css
/* The container */
.row {
  display: flex;
  flex-direction: row; /* children lay out left-to-right (default) */
}

/* Each direct child is a flex item */
.row > .item {
  /* flex item properties go here */
}
```

### The flex-direction axis

- `flex-direction: row` (default) — items lay out horizontally, left to right
- `flex-direction: column` — items lay out vertically, top to bottom

The direction creates two axes:

- **Main axis** — the direction items lay out (horizontal for `row`)
- **Cross axis** — perpendicular to main (`row` → cross axis is vertical)

Most flex properties refer to one of these axes.

### Controlling item size: `flex`

The `flex` property is shorthand for three sub-properties:

```css
flex: grow shrink basis;
```

- **`flex-grow`** — how much of the extra space this item takes relative to
  siblings. `flex-grow: 1` on one item and `0` on others means it gets all
  extra space. `flex-grow: 2` on one item and `1` on another means the first
  gets twice the extra space.
- **`flex-shrink`** — how much this item shrinks when there is _not_ enough
  space. `flex-shrink: 0` means "never shrink me."
- **`flex-basis`** — the starting size before grow/shrink is applied. Can be
  a length (`250px`) or `auto`.

Common patterns:

```css
flex: 1           /* = flex: 1 1 0 — take available space, allow shrink */
flex: 0 0 250px   /* = fixed 250px, no grow, no shrink */
flex-shrink: 0    /* do not shrink even if space is tight */
```

### Alignment

```css
/* On the container: */
align-items: center; /* cross-axis alignment of all items */
justify-content: space-between; /* main-axis distribution */

/* On a specific item: */
align-self: flex-end; /* overrides the container's align-items for this item */
```

### A minimal example to run right now

Before modifying your app, open a new blank file and test Flexbox directly:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        background: #222;
      }

      .container {
        display: flex;
        flex-direction: row;
        height: 200px;
        background: #333;
        gap: 4px; /* space between items */
        padding: 4px;
      }

      .fixed {
        flex: 0 0 80px; /* fixed 80px, no grow, no shrink */
        background: #446;
      }

      .grows {
        flex: 1; /* takes remaining space */
        background: #464;
      }

      .shrinks-not {
        flex: 0 0 120px; /* fixed, won't shrink */
        flex-shrink: 0;
        background: #644;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="fixed">80px fixed</div>
      <div class="grows">takes the rest</div>
      <div class="shrinks-not">120px fixed</div>
    </div>
  </body>
</html>
```

Open this. Resize the browser. The middle panel (`.grows`) absorbs all resizing.
The other two panels stay their fixed widths. This is the foundation of every
CAD layout.

---

## Part 3 — CSS Grid: The Shell Layout

For the overall application shell (the outermost layout), CSS Grid is better
than Flexbox because we have a two-dimensional layout: rows AND columns.

### What CSS Grid is

CSS Grid turns a container into a grid of rows and columns. You define the
tracks (rows and columns) on the container, then assign each child to a specific
position in the grid.

```css
.grid {
  display: grid;
  grid-template-columns: 250px 1fr; /* two columns: 250px and the rest */
  grid-template-rows: 40px 1fr 24px; /* three rows: toolbar, content, status */
}
```

The `fr` unit means "fraction of remaining space." `1fr` takes all remaining
space. `2fr` and `1fr` in two columns means the first column gets twice the
second.

Named template areas make layout readable:

```css
.grid {
  display: grid;
  grid-template-areas:
    "toolbar  toolbar"
    "panel    viewport"
    "status   status";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 40px 1fr 24px;
}

.toolbar {
  grid-area: toolbar;
}
.panel {
  grid-area: panel;
}
.viewport {
  grid-area: viewport;
}
.status {
  grid-area: status;
}
```

The ASCII art in `grid-template-areas` directly maps to what you see on screen.
Each quoted string is a row. Each word in the row is a column cell. If the same
name appears in multiple cells, that element spans those cells.

### When to use Grid vs Flexbox

- **Grid**: two-dimensional layout (rows AND columns) — use for the overall
  application shell
- **Flexbox**: one-dimensional layout (a row OR a column) — use for the
  contents inside each shell region (e.g., the status bar's spans, the
  toolbar's buttons)

In practice: Grid for the outer shell, Flexbox for the inner contents.

---

## Part 4 — Building the Shell

Let us now restructure `index.html` into a full application shell.

### Step 1 — Update the HTML structure

Replace the entire `<body>` content (the `<div id="app">` and its children)
with this:

```html
<body class="app-root">
  <!-- ── Toolbar ─────────────────────────────────────────────────────────── -->
  <header class="toolbar" id="toolbar">
    <div class="toolbar-brand">CAM</div>
    <div class="toolbar-group" id="tg-view">
      <!-- Tool buttons added in Lab 03 -->
    </div>
    <div class="toolbar-group" id="tg-geometry">
      <!-- Tool buttons added in Lab 03 -->
    </div>
    <div class="toolbar-spacer"></div>
    <div class="toolbar-group" id="tg-settings">
      <button class="tb-btn" id="btn-theme" title="Toggle theme (T)">◐</button>
    </div>
  </header>

  <!-- ── Work area (panel + viewport) ────────────────────────────────────── -->
  <div class="work-area">
    <!-- Left panel -->
    <aside class="panel panel-left" id="panel-left">
      <div class="panel-header">
        <span class="panel-title">Geometry</span>
        <button class="panel-toggle" id="btn-toggle-panel" title="Toggle panel">
          ‹
        </button>
      </div>
      <div class="panel-body" id="panel-geometry-body">
        <!-- Geometry list and add-form, added in Lab 03 -->
        <p class="panel-empty">No geometry yet.</p>
      </div>
    </aside>

    <!-- Resize handle between panel and viewport -->
    <div class="splitter splitter-v" id="splitter-left"></div>

    <!-- Viewport -->
    <div class="viewport-wrap" id="viewport-wrap">
      <canvas id="viewport"></canvas>
    </div>
  </div>

  <!-- ── Status bar ───────────────────────────────────────────────────────── -->
  <footer class="statusbar" id="statusbar">
    <span class="sb-item" id="sb-x">X: —</span>
    <span class="sb-item" id="sb-y">Y: —</span>
    <span class="sb-item" id="sb-zoom">1.00×</span>
    <span class="sb-item sb-msg" id="sb-msg">Ready</span>
  </footer>

  <script>
    // JavaScript from Lab 01 goes here — update element IDs to match above
    // (canvas is still 'viewport', sb-x, sb-y, sb-zoom, sb-msg are unchanged)
  </script>
</body>
```

### Step 2 — Update the CSS

Replace the entire `<style>` block with this. Read every comment:

```css
<style>

  /* ── Reset ──────────────────────────────────────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── Design tokens ───────────────────────────────────────────────────────── */
  :root {
    --color-bg:          #13131f;
    --color-surface:     #111120;
    --color-surface-alt: #161628;
    --color-border:      #252538;
    --color-text:        #ccccdd;
    --color-text-dim:    #778899;
    --color-text-faint:  #445566;
    --color-accent:      #4aaeff;
    --color-accent-dim:  #2a6ea8;
    --color-geometry:    #4aaeff;
    --color-selected:    #ff9944;
    --color-axis-x:      #ff4455;
    --color-axis-y:      #44ff77;
    --color-grid:        #1a1a2e;
    --color-grid-major:  #222238;

    --toolbar-height:    42px;
    --panel-width:       260px;
    --statusbar-height:  24px;

    --font-body: 'Segoe UI', system-ui, sans-serif;
    --font-mono: 'Cascadia Code', 'Consolas', monospace;

    --radius-sm: 3px;
    --radius-md: 5px;
  }

  [data-theme="light"] {
    --color-bg:          #f5f5fa;
    --color-surface:     #ebebf5;
    --color-surface-alt: #e0e0ee;
    --color-border:      #c8c8d8;
    --color-text:        #222233;
    --color-text-dim:    #445566;
    --color-text-faint:  #8899aa;
    --color-grid:        #d8d8e8;
    --color-grid-major:  #c0c0d4;
  }

  /* ── Root ────────────────────────────────────────────────────────────────── */
  html, body {
    height: 100%;
    overflow: hidden;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 13px;
  }

  /* ── App grid ────────────────────────────────────────────────────────────── */
  /* The entire app is a three-row grid:
     Row 1: toolbar  (fixed height)
     Row 2: work-area (takes all remaining height)
     Row 3: statusbar (fixed height)
  */
  .app-root {
    display: grid;
    grid-template-rows: var(--toolbar-height) 1fr var(--statusbar-height);
    grid-template-columns: 1fr;
    height: 100%;
  }

  /* ── Toolbar ─────────────────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    overflow: hidden;
  }

  .toolbar-brand {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--color-accent);
    padding: 0 8px 0 4px;
    margin-right: 8px;
    border-right: 1px solid var(--color-border);
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /* toolbar-spacer: push everything after it to the right */
  .toolbar-spacer {
    flex: 1;
  }

  /* toolbar button */
  .tb-btn {
    height: 28px;
    min-width: 28px;
    padding: 0 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--color-text-dim);
    font-family: var(--font-body);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: background 0.1s, border-color 0.1s, color 0.1s;
    user-select: none;
  }

  .tb-btn:hover {
    background: var(--color-surface-alt);
    border-color: var(--color-border);
    color: var(--color-text);
  }

  .tb-btn:active,
  .tb-btn.active {
    background: var(--color-accent-dim);
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  /* ── Work area ───────────────────────────────────────────────────────────── */
  /* Horizontal flex: panel | splitter | viewport */
  .work-area {
    display: flex;
    flex-direction: row;
    overflow: hidden;  /* children must not overflow the work area */
    min-height: 0;     /* allow flex children to shrink below their content size */
  }

  /* ── Left panel ──────────────────────────────────────────────────────────── */
  .panel-left {
    flex: 0 0 var(--panel-width);  /* fixed width, no grow/shrink from flex */
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    overflow: hidden;
  }

  /* Collapsed state: panel shrinks to just the header */
  .panel-left.collapsed {
    flex-basis: 0;
    overflow: hidden;
  }

  .panel-header {
    flex-shrink: 0;
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    border-bottom: 1px solid var(--color-border);
    gap: 8px;
  }

  .panel-title {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-faint);
  }

  .panel-toggle {
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    color: var(--color-text-faint);
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: color 0.1s, background 0.1s;
  }

  .panel-toggle:hover {
    color: var(--color-text);
    background: var(--color-surface-alt);
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;   /* scroll if content exceeds panel height */
    padding: 8px;
  }

  /* Scrollbar styling — subtle in both themes */
  .panel-body::-webkit-scrollbar { width: 6px; }
  .panel-body::-webkit-scrollbar-track { background: transparent; }
  .panel-body::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  .panel-empty {
    color: var(--color-text-faint);
    font-size: 12px;
    text-align: center;
    margin-top: 16px;
  }

  /* ── Splitter ─────────────────────────────────────────────────────────────── */
  /* The splitter is a drag-to-resize handle between the panel and viewport.
     For now it is static (just a visible border). Drag functionality comes
     in Lab 04. */
  .splitter-v {
    flex-shrink: 0;
    width: 4px;
    background: var(--color-border);
    cursor: col-resize;
    transition: background 0.15s;
  }

  .splitter-v:hover {
    background: var(--color-accent-dim);
  }

  /* ── Viewport wrap ────────────────────────────────────────────────────────── */
  /* flex: 1 makes it take all remaining horizontal space.
     min-width: 0 is critical: without it, flex items cannot shrink
     below their content's natural width. Causes layout bugs when
     the panel is wide. */
  .viewport-wrap {
    flex: 1;
    min-width: 0;
    position: relative;  /* so absolutely-positioned overlays work later */
    overflow: hidden;
  }

  #viewport {
    display: block;
    width: 100%;
    height: 100%;
    cursor: crosshair;
  }

  /* ── Status bar ───────────────────────────────────────────────────────────── */
  .statusbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 12px;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    font-size: 11px;
    font-family: var(--font-mono);
    user-select: none;
  }

  .sb-item {
    color: var(--color-text-dim);
  }

  .sb-msg {
    margin-left: auto;
    color: var(--color-text-faint);
  }

</style>
```

Save and reload. You should see:

- A dark toolbar at the top with "CAM" brand text and a `◐` button
- A left panel labeled "GEOMETRY" with "No geometry yet." inside
- The viewport (canvas with grid) in the center
- A thin splitter between panel and viewport
- The status bar at the bottom

---

## BUILD 1 — Verify layout

Resize the browser window in all directions. Confirm:

- The toolbar stays at the top and does not grow
- The left panel stays its fixed width
- The viewport takes all remaining space
- The status bar stays at the bottom
- Nothing overflows or scrolls (except the panel body, which has `overflow-y: auto`)

If anything scrolls unexpectedly, check that `html, body { overflow: hidden; }`
is in your CSS. If the viewport does not fill the space, check that
`.viewport-wrap` has `flex: 1; min-width: 0;`.

---

## Part 5 — Connecting the JavaScript

The JavaScript from Lab 01 references `document.getElementById('viewport')` for
the canvas. That ID is unchanged. But we moved the canvas inside `.viewport-wrap`,
so `resizeCanvas()` now reads the size of the canvas element itself (via
`getBoundingClientRect`), which correctly fills its container.

One update needed: the status bar elements changed from `#statusbar` containing
`#sb-x` etc. to a `.statusbar` containing `.sb-item` elements. The IDs are
unchanged (`sb-x`, `sb-y`, `sb-zoom`, `sb-msg`), so the JavaScript references
need no changes.

Add the theme button functionality. Add this inside your `<script>` block,
after the keyboard shortcut listener:

```js
// Theme button in toolbar
document.getElementById("btn-theme").addEventListener("click", () => {
  toggleTheme();
});
```

Add the panel toggle:

```js
// ── Panel toggle ──────────────────────────────────────────────────────────────
const panelLeft = document.getElementById("panel-left");
const btnTogglePanel = document.getElementById("btn-toggle-panel");

btnTogglePanel.addEventListener("click", () => {
  const isCollapsed = panelLeft.classList.contains("collapsed");
  panelLeft.classList.toggle("collapsed");
  // Rotate the arrow to indicate open/closed state
  btnTogglePanel.textContent = isCollapsed ? "‹" : "›";
  // Canvas size changed because the layout shifted — recalculate and redraw
  resizeCanvas();
  render();
});
```

Save and test:

- Click `◐` in the toolbar → theme toggles
- Click `‹` in the panel header → panel collapses, viewport grows; click `›` → panel re-opens

---

## BUILD 2 — Panel collapse

Collapse and expand the panel. Confirm:

- When collapsed, the viewport fills the full width
- When expanded, the panel takes its allocated width and the viewport shrinks
- The grid redraws correctly at the new canvas size in both states
- The `resizeCanvas()` + `render()` calls are what make this work — without them,
  the canvas drawing resolution would not update and the grid would look wrong

---

## Part 6 — The Toolbar Button System

Toolbar buttons need three states: normal, hover, and active (currently selected).
We already have CSS for all three states. Now we need a JavaScript system that
tracks which buttons are active and enforces mutual exclusivity within a group.

This introduces the concept of **UI state machines** — a formalized way of
thinking about which modes the application is in and what happens when modes
change.

### What a mode is

A CAD application is always in exactly one **active mode**:

- Select mode — clicking selects geometry
- Line mode — clicking places line endpoints
- Circle mode — clicking defines center and radius
- Pan mode — dragging pans the view

Only one mode can be active at a time. Clicking a toolbar button activates a
mode and deactivates the previous one. This is **mutual exclusion**: buttons in
the same group are mutually exclusive.

### Extending application state

Add a `mode` key to `state`:

```js
const state = {
  view: {
    panX: 0,
    panY: 0,
    zoom: 50,
  },
  mode: "select", // current active tool/mode
  geometry: [], // geometry objects — added in Lab 03
};
```

### A simple toolbar system

```js
// ── Toolbar mode system ───────────────────────────────────────────────────────

// All mode buttons (we will add more in Lab 03 when tools exist)
// Each button has: id, mode it activates
const MODE_BUTTONS = [
  // { id: 'btn-select', mode: 'select' },  ← added Lab 03
  // { id: 'btn-line',   mode: 'line'   },  ← added Lab 03
];

function setMode(newMode) {
  state.mode = newMode;

  // Update button visual states
  MODE_BUTTONS.forEach(({ id, mode }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (mode === newMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update status bar message
  sbMsg.textContent =
    newMode.charAt(0).toUpperCase() + newMode.slice(1) + " mode";
}

// Initialize
setMode("select");
```

This system is ready to receive buttons. We will populate `MODE_BUTTONS` and add
the actual button elements to the toolbar HTML in Lab 03.

---

## Part 7 — The Panel Section System

Panels in professional tools have collapsible sections. The geometry panel might
have an "Add Geometry" section (expanded when adding) and a "Properties" section
(expanded when something is selected). Each section can be independently open or
closed.

### The HTML `<details>` element

HTML has a built-in collapsible element: `<details>`. Its `<summary>` child is
always visible; the rest is shown only when open. No JavaScript required for
basic open/close behavior — it is native HTML.

```html
<details class="panel-section" open>
  <!-- open attribute = expanded by default -->
  <summary class="section-header">Add Geometry</summary>
  <div class="section-body">
    <!-- Form fields go here in Lab 03 -->
    <p>Geometry forms will appear here.</p>
  </div>
</details>

<details class="panel-section">
  <summary class="section-header">Geometry List</summary>
  <div class="section-body">
    <p class="panel-empty">No geometry yet.</p>
  </div>
</details>
```

Replace the panel body content:

```html
<div class="panel-body" id="panel-geometry-body">
  <details class="panel-section" open>
    <summary class="section-header">Add Geometry</summary>
    <div class="section-body" id="section-add">
      <p class="section-placeholder">
        Geometry tools appear here.<br />Coming in Lab 03.
      </p>
    </div>
  </details>

  <details class="panel-section">
    <summary class="section-header">Objects</summary>
    <div class="section-body" id="section-objects">
      <p class="panel-empty">Nothing drawn yet.</p>
    </div>
  </details>

  <details class="panel-section">
    <summary class="section-header">Properties</summary>
    <div class="section-body" id="section-properties">
      <p class="panel-empty">Select an object to edit it.</p>
    </div>
  </details>
</div>
```

Add CSS for the panel sections:

```css
/* ── Panel sections (<details>) ───────────────────────────────────────────── */

/* Remove the default browser triangle on <details> */
.panel-section > summary {
  list-style: none;
}
.panel-section > summary::-webkit-details-marker {
  display: none;
}

.panel-section {
  border-bottom: 1px solid var(--color-border);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-faint);
  cursor: pointer;
  user-select: none;
  background: var(--color-surface);
  transition:
    color 0.1s,
    background 0.1s;
}

.section-header:hover {
  color: var(--color-text-dim);
  background: var(--color-surface-alt);
}

/* Animated open/close indicator */
.section-header::after {
  content: "›";
  margin-left: auto;
  transition: transform 0.15s;
  font-size: 14px;
}

/* Rotate arrow when section is open */
details[open] > .section-header::after {
  transform: rotate(90deg);
}

.section-body {
  padding: 8px;
}

.section-placeholder {
  color: var(--color-text-faint);
  font-size: 11px;
  line-height: 1.6;
}
```

Save and reload. The panel now has three collapsible sections. Click each header
to open and close them. The arrow rotates (CSS-only animation, no JavaScript).

---

## BUILD 3 — Panel sections

Verify that all three sections open and close independently. The animation
should be smooth. In DevTools, click on a `<details>` element in the Elements
tab — you should see the `open` attribute appear and disappear as you click.

This is a reminder: HTML has powerful built-in behaviors. Use them before
reaching for JavaScript.

---

## Part 8 — Form Controls in the Panel

The panel will contain forms for adding geometry. Forms in a dark-themed
technical UI need specific styling — browser defaults look wrong.

Let us build and style the complete set of form controls you will use in Labs
03–07. This is not premature abstraction — you need these styled correctly once
so every lab that adds a form field just uses the class.

### Text input

```html
<!-- Preview this in isolation inside the section-body -->
<div class="form-field">
  <label class="form-label" for="demo-x">X (mm)</label>
  <input
    class="form-input"
    type="number"
    id="demo-x"
    value="0"
    step="0.1"
    placeholder="0.000"
  />
</div>
```

### Number input considerations

`<input type="number">` is the right element for numeric values. It provides:

- Spin buttons (up/down arrows) for small adjustments
- `step` attribute controls the increment
- `min` and `max` attributes for clamping (use when appropriate)
- Keyboard: up/down arrows increment by `step`, PageUp/PageDown by 10× step

**Security:** always validate numeric inputs in your JavaScript before using the
values. A user can type anything into a number input, and `input.value` is always
a string. Use `parseFloat(input.value)` and check for `NaN`:

```js
function readFloat(inputId, fallback = 0) {
  const val = parseFloat(document.getElementById(inputId).value);
  return isNaN(val) ? fallback : val;
}
```

### Dropdown select

```html
<div class="form-field">
  <label class="form-label" for="demo-type">Type</label>
  <select class="form-select" id="demo-type">
    <option value="line">Line</option>
    <option value="circle">Circle</option>
    <option value="arc">Arc</option>
  </select>
</div>
```

### Submit button

```html
<button class="btn-primary form-submit" type="button" id="btn-add">
  Add Line
</button>
```

### CSS for form controls

Add this to your `<style>` block:

```css
/* ── Form controls ───────────────────────────────────────────────────────── */

.form-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
}

.form-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-faint);
}

.form-input,
.form-select {
  width: 100%;
  height: 26px;
  padding: 0 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
  transition: border-color 0.1s;
  /* Remove browser default appearance on number inputs */
  -webkit-appearance: none;
  appearance: none;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--color-accent);
}

/* Suppress browser spin buttons on number inputs — we use keyboard */
.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.form-input[type="number"] {
  -moz-appearance: textfield;
}

/* Select dropdown arrow */
.form-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23778899'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
  cursor: pointer;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */

.btn-primary {
  width: 100%;
  height: 28px;
  background: var(--color-accent-dim);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s;
  user-select: none;
}

.btn-primary:hover {
  background: var(--color-accent);
  color: #fff;
}

.btn-primary:active {
  opacity: 0.85;
}

.btn-secondary {
  /* Same as btn-primary but transparent background */
  width: 100%;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-dim);
  font-family: var(--font-body);
  font-size: 12px;
  cursor: pointer;
  transition:
    background 0.1s,
    border-color 0.1s,
    color 0.1s;
  user-select: none;
}

.btn-secondary:hover {
  background: var(--color-surface-alt);
  border-color: var(--color-text-dim);
  color: var(--color-text);
}

.form-row {
  display: flex;
  gap: 6px;
}

.form-row .form-field {
  flex: 1;
}

.form-submit {
  margin-top: 4px;
}
```

Add a quick preview to the "Add Geometry" section body to confirm everything
looks right:

```html
<div class="section-body" id="section-add">
  <!-- Preview form — replaced by dynamic form in Lab 03 -->
  <div class="form-row">
    <div class="form-field">
      <label class="form-label">X1 (mm)</label>
      <input class="form-input" type="number" value="0" step="1" />
    </div>
    <div class="form-field">
      <label class="form-label">Y1 (mm)</label>
      <input class="form-input" type="number" value="0" step="1" />
    </div>
  </div>
  <div class="form-row">
    <div class="form-field">
      <label class="form-label">X2 (mm)</label>
      <input class="form-input" type="number" value="50" step="1" />
    </div>
    <div class="form-field">
      <label class="form-label">Y2 (mm)</label>
      <input class="form-input" type="number" value="30" step="1" />
    </div>
  </div>
  <button class="btn-primary form-submit" type="button">Add Line</button>
</div>
```

Save and reload. The form fields should look styled and professional. Focus any
input — it gets a blue border. Hover the button — it turns blue-filled.

---

## BUILD 4 — Form control audit

In DevTools → Elements, select one of the number inputs. In the Styles panel,
you should see your CSS rules applied. Check:

1. The border turns blue on focus (`:focus` styles)
2. The spin buttons are hidden
3. The button changes color on hover

If any are missing, there is a CSS specificity issue — your rule is being
overridden by another rule. Use DevTools to find which rule wins.

---

## Part 9 — Tooltip System

Tooltips show a description when the user hovers a button. They are especially
important for icon-only buttons where the function is not immediately obvious.

The native HTML `title` attribute gives a browser tooltip (plain text, styled
by the OS — looks different everywhere and appears with a long delay). For a
professional tool, we want consistent, styled tooltips.

A simple CSS-only approach: use a `data-tooltip` attribute and a CSS
`::after` pseudo-element. No JavaScript at all.

```css
/* ── Tooltips ─────────────────────────────────────────────────────────────── */
/* Elements with data-tooltip get a tooltip on hover.
   position: relative on the element, position: absolute on the tooltip. */

[data-tooltip] {
  position: relative;
}

[data-tooltip]::after {
  content: attr(data-tooltip); /* reads the data-tooltip attribute value */
  position: absolute;
  bottom: calc(100% + 6px); /* above the element */
  left: 50%;
  transform: translateX(-50%); /* center horizontally */
  background: #1a1a2e;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 11px;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  pointer-events: none; /* tooltip shouldn't intercept mouse events */
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 100;
}

[data-tooltip]:hover::after {
  opacity: 1;
}
```

Add `data-tooltip` to the theme button:

```html
<button
  class="tb-btn"
  id="btn-theme"
  data-tooltip="Toggle theme (T)"
  title="Toggle theme (T)"
>
  ◐
</button>
```

Save. Hover the `◐` button for about half a second — the tooltip appears.

> **Why keep the `title` attribute?** The `title` attribute is still used by
> screen readers and by the browser's built-in tooltip if JavaScript/CSS fails.
> Both together covers all cases.

---

## Part 10 — Responsive to Window Size

When the user resizes the browser window, several things must update:

1. The canvas drawing buffer size (already handled by `resizeCanvas()`)
2. The grid redraw (handled by calling `render()` in the resize listener)
3. The panel should stay its fixed width (handled by CSS)

The one edge case: if the browser window becomes narrower than the panel width,
the panel forces the viewport to zero width and may cause layout issues.

Add a minimum viewport width to prevent this:

```css
.viewport-wrap {
  flex: 1;
  min-width: 200px; /* ← add this */
  min-height: 0;
  position: relative;
  overflow: hidden;
}
```

When the window is narrower than `panel-width + 200px`, the panel will start
to be clipped instead of crushing the viewport to nothing. A full solution
would hide the panel automatically at narrow widths — a CSS media query:

```css
@media (max-width: 600px) {
  .panel-left {
    display: none;
  }
  .splitter-v {
    display: none;
  }
}
```

This hides the panel on very narrow screens. CAD tools are generally not mobile
apps, so this is a safety net rather than a primary requirement.

---

## Part 11 — The Complete Lab 02 File

Here is the complete `index.html` for Lab 02, combining the shell structure,
all CSS, and all JavaScript:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CAM</title>
    <style>
      /* ─── (Paste all CSS from Parts 4–9 above) ─── */
    </style>
  </head>
  <body class="app-root">
    <header class="toolbar" id="toolbar">
      <div class="toolbar-brand">CAM</div>
      <div class="toolbar-group" id="tg-view"></div>
      <div class="toolbar-group" id="tg-geometry"></div>
      <div class="toolbar-spacer"></div>
      <div class="toolbar-group" id="tg-settings">
        <button
          class="tb-btn"
          id="btn-theme"
          data-tooltip="Toggle theme (T)"
          title="Toggle theme (T)"
        >
          ◐
        </button>
      </div>
    </header>

    <div class="work-area">
      <aside class="panel panel-left" id="panel-left">
        <div class="panel-header">
          <span class="panel-title">Geometry</span>
          <button
            class="panel-toggle"
            id="btn-toggle-panel"
            title="Toggle panel"
          >
            ‹
          </button>
        </div>
        <div class="panel-body" id="panel-geometry-body">
          <details class="panel-section" open>
            <summary class="section-header">Add Geometry</summary>
            <div class="section-body" id="section-add">
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label">X1 (mm)</label>
                  <input
                    class="form-input"
                    type="number"
                    id="inp-x1"
                    value="0"
                    step="1"
                  />
                </div>
                <div class="form-field">
                  <label class="form-label">Y1 (mm)</label>
                  <input
                    class="form-input"
                    type="number"
                    id="inp-y1"
                    value="0"
                    step="1"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label">X2 (mm)</label>
                  <input
                    class="form-input"
                    type="number"
                    id="inp-x2"
                    value="50"
                    step="1"
                  />
                </div>
                <div class="form-field">
                  <label class="form-label">Y2 (mm)</label>
                  <input
                    class="form-input"
                    type="number"
                    id="inp-y2"
                    value="30"
                    step="1"
                  />
                </div>
              </div>
              <button
                class="btn-primary form-submit"
                type="button"
                id="btn-add-line"
              >
                Add Line
              </button>
            </div>
          </details>

          <details class="panel-section">
            <summary class="section-header">Objects</summary>
            <div class="section-body" id="section-objects">
              <p class="panel-empty">Nothing drawn yet.</p>
            </div>
          </details>

          <details class="panel-section">
            <summary class="section-header">Properties</summary>
            <div class="section-body" id="section-properties">
              <p class="panel-empty">Select an object to edit it.</p>
            </div>
          </details>
        </div>
      </aside>

      <div class="splitter splitter-v" id="splitter-left"></div>

      <div class="viewport-wrap" id="viewport-wrap">
        <canvas id="viewport"></canvas>
      </div>
    </div>

    <footer class="statusbar" id="statusbar">
      <span class="sb-item" id="sb-x">X: —</span>
      <span class="sb-item" id="sb-y">Y: —</span>
      <span class="sb-item" id="sb-zoom">1.00×</span>
      <span class="sb-item sb-msg" id="sb-msg">Ready</span>
    </footer>

    <script>
      // ── DOM references ──────────────────────────────────────────────────────
      const canvas = document.getElementById("viewport");
      const ctx = canvas.getContext("2d");
      const sbX = document.getElementById("sb-x");
      const sbY = document.getElementById("sb-y");
      const sbZoom = document.getElementById("sb-zoom");
      const sbMsg = document.getElementById("sb-msg");

      // ── Application state ───────────────────────────────────────────────────
      const state = {
        view: {
          panX: 0,
          panY: 0,
          zoom: 50,
        },
        mode: "select",
        geometry: [], // populated in Lab 03
      };

      // ── Canvas resize ───────────────────────────────────────────────────────
      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
      }

      resizeCanvas();
      window.addEventListener("resize", () => {
        resizeCanvas();
        render();
      });

      // ── CSS token reader ────────────────────────────────────────────────────
      function getToken(name) {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim();
      }

      // ── Coordinate transforms ───────────────────────────────────────────────
      function worldToCanvas(wx, wy) {
        const { panX, panY, zoom } = state.view;
        return {
          x: canvas.width / 2 + wx * zoom + panX,
          y: canvas.height / 2 - wy * zoom + panY,
        };
      }

      function canvasToWorld(cx, cy) {
        const { panX, panY, zoom } = state.view;
        return {
          x: (cx - canvas.width / 2 - panX) / zoom,
          y: -(cy - canvas.height / 2 - panY) / zoom,
        };
      }

      // ── Grid ────────────────────────────────────────────────────────────────
      function niceGridUnit(rough) {
        const v = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
        return v.find((n) => n >= rough) ?? v[v.length - 1];
      }

      function drawGrid() {
        const { zoom } = state.view;
        const tl = canvasToWorld(0, 0);
        const br = canvasToWorld(canvas.width, canvas.height);
        const unit = niceGridUnit((br.x - tl.x) / 8);
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = getToken("--color-grid");
        ctx.beginPath();
        for (
          let wx = Math.floor(tl.x / unit) * unit;
          wx <= br.x + unit;
          wx += unit
        ) {
          const x = Math.round(worldToCanvas(wx, 0).x) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
        }
        for (
          let wy = Math.floor(br.y / unit) * unit;
          wy <= tl.y + unit;
          wy += unit
        ) {
          const y = Math.round(worldToCanvas(0, wy).y) + 0.5;
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
        ctx.strokeStyle = getToken("--color-grid-major");
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const axX = Math.round(worldToCanvas(0, 0).x) + 0.5;
        const axY = Math.round(worldToCanvas(0, 0).y) + 0.5;
        ctx.moveTo(axX, 0);
        ctx.lineTo(axX, canvas.height);
        ctx.moveTo(0, axY);
        ctx.lineTo(canvas.width, axY);
        ctx.stroke();
        ctx.restore();
      }

      // ── Render ──────────────────────────────────────────────────────────────
      function render() {
        ctx.fillStyle = getToken("--color-bg") || "#13131f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        // drawGeometry() ← Lab 03
      }

      // ── Mouse utilities ─────────────────────────────────────────────────────
      function eventToCanvas(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      // ── Pan & Zoom ──────────────────────────────────────────────────────────
      let isPanning = false;
      let panStart = { x: 0, y: 0 };

      canvas.addEventListener("mousedown", (e) => {
        if (e.button === 1 || e.button === 2) {
          isPanning = true;
          panStart = eventToCanvas(e);
          e.preventDefault();
        }
      });

      canvas.addEventListener("mousemove", (e) => {
        const cp = eventToCanvas(e);
        const world = canvasToWorld(cp.x, cp.y);
        sbX.textContent = `X: ${world.x.toFixed(3).padStart(9)}`;
        sbY.textContent = `Y: ${world.y.toFixed(3).padStart(9)}`;

        if (isPanning) {
          state.view.panX += cp.x - panStart.x;
          state.view.panY += cp.y - panStart.y;
          panStart = cp;
          render();
        }
      });

      canvas.addEventListener("mouseleave", () => {
        sbX.textContent = "X:       —";
        sbY.textContent = "Y:       —";
      });

      window.addEventListener("mouseup", (e) => {
        if (e.button === 1 || e.button === 2) isPanning = false;
      });

      canvas.addEventListener("contextmenu", (e) => e.preventDefault());

      canvas.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          const cp = eventToCanvas(e);
          const before = canvasToWorld(cp.x, cp.y);
          const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          state.view.zoom = Math.max(
            1,
            Math.min(5000, state.view.zoom * factor),
          );
          const after = worldToCanvas(before.x, before.y);
          state.view.panX += cp.x - after.x;
          state.view.panY += cp.y - after.y;
          sbZoom.textContent = `${(state.view.zoom / 50).toFixed(2)}×`;
          render();
        },
        { passive: false },
      );

      // ── Keyboard shortcuts ──────────────────────────────────────────────────
      document.addEventListener("keydown", (e) => {
        const tag = document.activeElement.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        switch (e.key) {
          case "Home":
          case "f":
          case "F":
            state.view.panX = 0;
            state.view.panY = 0;
            state.view.zoom = 50;
            sbZoom.textContent = "1.00×";
            render();
            break;
          case "g":
          case "G":
            state.view.panX = 0;
            state.view.panY = 0;
            render();
            break;
          case "t":
          case "T":
            toggleTheme();
            break;
        }
      });

      // ── Theme ────────────────────────────────────────────────────────────────
      function toggleTheme() {
        const html = document.documentElement;
        html.dataset.theme = html.dataset.theme === "light" ? "dark" : "light";
        render();
      }

      document
        .getElementById("btn-theme")
        .addEventListener("click", toggleTheme);

      // ── Panel toggle ─────────────────────────────────────────────────────────
      const panelLeft = document.getElementById("panel-left");
      const btnTogglePanel = document.getElementById("btn-toggle-panel");

      btnTogglePanel.addEventListener("click", () => {
        panelLeft.classList.toggle("collapsed");
        btnTogglePanel.textContent = panelLeft.classList.contains("collapsed")
          ? "›"
          : "‹";
        resizeCanvas();
        render();
      });

      // ── Mode system ──────────────────────────────────────────────────────────
      function setMode(newMode) {
        state.mode = newMode;
        sbMsg.textContent = newMode.charAt(0).toUpperCase() + newMode.slice(1);
      }

      // ── Add Line (preview — full implementation in Lab 03) ───────────────────
      // This reads the form values and logs them to console.
      // In Lab 03 we replace this with real geometry creation.
      function readFloat(id, fallback = 0) {
        const val = parseFloat(document.getElementById(id).value);
        return isNaN(val) ? fallback : val;
      }

      document.getElementById("btn-add-line").addEventListener("click", () => {
        const x1 = readFloat("inp-x1");
        const y1 = readFloat("inp-y1");
        const x2 = readFloat("inp-x2");
        const y2 = readFloat("inp-y2");

        // For now, just draw on the canvas directly
        // In Lab 03, this will create a geometry object in state.geometry
        const p1 = worldToCanvas(x1, y1);
        const p2 = worldToCanvas(x2, y2);
        ctx.strokeStyle = getToken("--color-geometry");
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        sbMsg.textContent = `Line: (${x1}, ${y1}) → (${x2}, ${y2})`;
      });

      // ── Startup ──────────────────────────────────────────────────────────────
      setMode("select");
      render();
    </script>
  </body>
</html>
```

---

## Part 12 — The Python Parallel: tkinter App Shell

The Python equivalent of the app shell uses tkinter widgets. The mapping is
direct:

| HTML/CSS                    | tkinter                                              |
| --------------------------- | ---------------------------------------------------- |
| `display: grid` (app shell) | `pack(side='top')`, `pack(fill='both', expand=True)` |
| `display: flex` (toolbar)   | `Frame` with packed children                         |
| `<aside>` panel             | `Frame` with fixed width                             |
| `<canvas>`                  | `Canvas` widget                                      |
| `<footer>` status bar       | `Label` or `Frame` at bottom                         |
| CSS custom property         | Python constant or tk `StringVar`                    |
| `<details>` collapsible     | Custom using `Frame` + toggle                        |

```python
# cam_app_shell.py
# Run with: python3 cam_app_shell.py
# Demonstrates the same layout as Lab 02 HTML/CSS shell

import tkinter as tk
from tkinter import ttk

# ── Design tokens ──────────────────────────────────────────────────────────────
THEME = {
    'bg':           '#13131f',
    'surface':      '#111120',
    'border':       '#252538',
    'text':         '#ccccdd',
    'text_dim':     '#778899',
    'text_faint':   '#445566',
    'accent':       '#4aaeff',
    'font_body':    ('Segoe UI', 11),
    'font_mono':    ('Consolas', 10),
    'toolbar_h':    42,
    'panel_w':      260,
    'statusbar_h':  24,
}

class CamApp:
    def __init__(self, root):
        self.root = root
        self.root.title('CAM — Lab 02')
        self.root.geometry('1200x800')
        self.root.configure(bg=THEME['bg'])

        self._build_toolbar()
        self._build_work_area()
        self._build_statusbar()

    def _build_toolbar(self):
        """Build the top toolbar."""
        self.toolbar = tk.Frame(
            self.root,
            bg=THEME['surface'],
            height=THEME['toolbar_h'],
            bd=0,
            highlightthickness=1,
            highlightbackground=THEME['border'],
        )
        # pack at top, fill horizontally, do not expand
        self.toolbar.pack(side='top', fill='x')
        self.toolbar.pack_propagate(False)  # keep fixed height

        # Brand label
        tk.Label(
            self.toolbar, text='CAM',
            bg=THEME['surface'], fg=THEME['accent'],
            font=('Segoe UI', 12, 'bold'),
            padx=12,
        ).pack(side='left', pady=6)

        # Separator
        tk.Frame(
            self.toolbar, bg=THEME['border'], width=1
        ).pack(side='left', fill='y', padx=4, pady=6)

        # Theme toggle button
        self.btn_theme = tk.Button(
            self.toolbar, text='◐',
            bg=THEME['surface'], fg=THEME['text_dim'],
            activebackground=THEME['surface'],
            bd=0, padx=8, pady=4,
            cursor='hand2',
            command=self.toggle_theme,
        )
        self.btn_theme.pack(side='right', pady=6, padx=4)

    def _build_work_area(self):
        """Build the horizontal work area: panel + splitter + viewport."""
        self.work = tk.Frame(self.root, bg=THEME['bg'])
        self.work.pack(side='top', fill='both', expand=True)

        # Left panel
        self.panel = tk.Frame(
            self.work,
            bg=THEME['surface'],
            width=THEME['panel_w'],
            bd=0,
            highlightthickness=1,
            highlightbackground=THEME['border'],
        )
        self.panel.pack(side='left', fill='y')
        self.panel.pack_propagate(False)

        # Panel header
        panel_hdr = tk.Frame(self.panel, bg=THEME['surface'], height=32)
        panel_hdr.pack(fill='x')
        panel_hdr.pack_propagate(False)

        tk.Label(
            panel_hdr, text='GEOMETRY',
            bg=THEME['surface'], fg=THEME['text_faint'],
            font=('Segoe UI', 9, 'bold'),
        ).pack(side='left', padx=8)

        tk.Button(
            panel_hdr, text='‹',
            bg=THEME['surface'], fg=THEME['text_faint'],
            bd=0, command=self.toggle_panel,
        ).pack(side='right', padx=4)

        # Separator line
        tk.Frame(panel_hdr, bg=THEME['border'], height=1).pack(fill='x', side='bottom')

        # Panel body (scrollable)
        # Use a Text widget or Frame with Scrollbar for real content
        panel_body = tk.Frame(self.panel, bg=THEME['surface'])
        panel_body.pack(fill='both', expand=True)

        tk.Label(
            panel_body, text='No geometry yet.',
            bg=THEME['surface'], fg=THEME['text_faint'],
            font=THEME['font_mono'],
        ).pack(pady=16)

        # Splitter (a narrow frame as resize handle)
        self.splitter = tk.Frame(
            self.work, bg=THEME['border'], width=4, cursor='sb_h_double_arrow'
        )
        self.splitter.pack(side='left', fill='y')

        # Viewport canvas
        self.canvas = tk.Canvas(
            self.work, bg=THEME['bg'],
            highlightthickness=0,
        )
        self.canvas.pack(side='left', fill='both', expand=True)

        # Canvas dimensions (updated on resize)
        self.canvas_w = 0
        self.canvas_h = 0
        self.canvas.bind('<Configure>', self._on_canvas_resize)

    def _build_statusbar(self):
        """Build the bottom status bar."""
        self.statusbar = tk.Frame(
            self.root,
            bg=THEME['surface'],
            height=THEME['statusbar_h'],
            bd=0,
            highlightthickness=1,
            highlightbackground=THEME['border'],
        )
        self.statusbar.pack(side='bottom', fill='x')
        self.statusbar.pack_propagate(False)

        self.lbl_x = tk.Label(
            self.statusbar, text='X:       —',
            bg=THEME['surface'], fg=THEME['text_dim'],
            font=THEME['font_mono'],
        )
        self.lbl_x.pack(side='left', padx=12)

        self.lbl_y = tk.Label(
            self.statusbar, text='Y:       —',
            bg=THEME['surface'], fg=THEME['text_dim'],
            font=THEME['font_mono'],
        )
        self.lbl_y.pack(side='left', padx=4)

        self.lbl_zoom = tk.Label(
            self.statusbar, text='1.00×',
            bg=THEME['surface'], fg=THEME['text_dim'],
            font=THEME['font_mono'],
        )
        self.lbl_zoom.pack(side='left', padx=4)

        self.lbl_msg = tk.Label(
            self.statusbar, text='Ready',
            bg=THEME['surface'], fg=THEME['text_faint'],
            font=THEME['font_body'],
        )
        self.lbl_msg.pack(side='right', padx=12)

    def _on_canvas_resize(self, event):
        self.canvas_w = event.width
        self.canvas_h = event.height
        self.render()

    def render(self):
        """Redraw the canvas (stub — full implementation is same as Lab 01)."""
        # In the full app this calls drawGrid() etc.
        # For the shell demo we just fill the background.
        self.canvas.delete('all')
        # Grid would be drawn here — same logic as Python Lab 01

    def toggle_panel(self):
        if self.panel.winfo_ismapped():
            self.panel.pack_forget()
            self.splitter.pack_forget()
        else:
            self.panel.pack(side='left', fill='y', before=self.splitter)
            self.splitter.pack(side='left', fill='y', before=self.canvas)

    def toggle_theme(self):
        # A full theme toggle would update THEME and reconfigure all widgets.
        # Here we just show the concept.
        print('Theme toggle — full implementation requires updating all widget colors.')


def main():
    root = tk.Tk()
    app = CamApp(root)
    root.mainloop()


if __name__ == '__main__':
    main()
```

---

## Part 13 — The C++ Track: Week 2

This week: read from a file and parse numbers.

```cpp
// parse_points.cpp
// Compile: g++ -std=c++17 -Wall parse_points.cpp -o parse_points
// Run:     echo "10.5 20.0\n-5.0 30.7" | ./parse_points
//      or: ./parse_points < points.txt

#include <iostream>
#include <string>
#include <sstream>   // std::istringstream
#include <vector>

// A simple 2D point struct.
// Structs in C++ are classes where members are public by default.
struct Point2D {
    double x;
    double y;
};

int main() {
    std::vector<Point2D> points;   // a dynamically-sized list of Point2D
    std::string line;

    // Read stdin line by line until EOF
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        // Parse two doubles from the line
        std::istringstream iss(line);
        Point2D p;
        if (iss >> p.x >> p.y) {   // >> returns false if parsing fails
            points.push_back(p);   // append to vector
        } else {
            std::cerr << "Warning: could not parse line: " << line << '\n';
        }
    }

    // Print what we parsed
    std::cout << "Parsed " << points.size() << " points:\n";
    for (const Point2D& p : points) {
        // setprecision and fixed control float formatting
        std::cout << "  (" << p.x << ", " << p.y << ")\n";
    }

    return 0;
}
```

**What to understand:**

`std::vector<Point2D>` — a dynamic array. Unlike a C-style array, it can grow.
`push_back` appends an element. `size()` returns the count.

`std::getline(std::cin, line)` — reads one line from standard input. Returns
the stream reference, which is truthy while reading succeeds and falsy at EOF.
This is why it works as a `while` condition.

`std::istringstream` — creates a string-backed stream you can read from using
`>>`, exactly like reading from `std::cin`. Used to parse strings.

`const Point2D& p` — a `const` reference. References in C++ are aliases — `p`
refers to the actual element in the vector without copying it. `const` means
we promise not to modify it. This is the idiomatic way to iterate a vector of
structs without copying each element.

---

## What You Have After Lab 02

```
cam/
  index.html    ← Full app shell: toolbar, panel, viewport, status bar
```

```
python/
  cam_app_shell.py   ← Same shell in Python/tkinter
```

**Working features (in addition to Lab 01):**

- Toolbar with brand, button groups, and theme toggle button
- Resizable left panel with geometry/objects/properties sections
- Splitter (static — drag-resize added in Lab 04)
- Form inputs in panel (styled, working inputs)
- "Add Line" button that draws on the canvas (pre-geometry-system implementation)
- Panel collapse/expand
- Tooltip system (CSS-only)
- All Lab 01 features unchanged

**Nothing else.** The form button draws directly on the canvas (no geometry
object system yet). The panel sections are placeholders. In Lab 03 we build the
geometry engine and connect it to all of this.

---

## DIVERGE POINTS

**1. Multiple panels:** The current shell has one left panel. Professional tools
have panels on left and right (e.g., left for tools/geometry, right for
properties/operations). Extending to a right panel requires adding another
`panel-right` to the `.work-area` flex container. The CSS pattern is identical.

**2. Draggable/resizable splitter:** The static splitter currently only changes
cursor. Adding drag-resize requires `mousedown` on the splitter element, then
updating a CSS custom property or directly setting the panel's `flex-basis` on
`mousemove`. This is the Lab 04 topic.

**3. Persistent panel state:** Panel open/closed state and width can be saved to
`localStorage` so the UI remembers between sessions. Implementation:
`localStorage.setItem('panel-open', panelOpen)` on toggle, restore on load.
Security note: validate values from `localStorage` before using them.

**4. Dark/light mode persistence:** Currently the theme resets on page reload.
Save `document.documentElement.dataset.theme` to `localStorage` and restore it
on page load (before the page renders) to avoid flash of wrong theme.

---

_Continue to [Lab 03 — The Geometry Engine](LAB-03-THE-GEOMETRY-ENGINE.md)._
