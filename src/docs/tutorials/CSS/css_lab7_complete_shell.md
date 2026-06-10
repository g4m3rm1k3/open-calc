# CSS Masterclass — Lab 7
## Putting It All Together: The Complete Application Shell

---

**What this lab is about.**

This is the lab where everything clicks. You have learned the box model,
flexbox, grid, positioning, transitions, pseudo-classes, and pseudo-elements.
Now you build the complete `camtool.html` from scratch — not by pasting a
finished file, but by building it region by region, seeing each piece land,
understanding why every rule is there.

When you finish this lab you will have a complete, professional application
shell. It will look like real software. Every component will have correct
hover states, focus states, transitions, and visual polish. And you will
understand every single line of it because you wrote it and watched it change.

**How this lab works.**

You start a fresh `camtool.html`. You build the HTML skeleton first with zero
CSS. Then you add styles section by section — the shell structure, then the
menubar, then the toolbar, then the docks, then the panels inside them, then
the status bar. Each section is a BUILD step. Save and refresh after each one.

This file is the one you carry forward into every future lab. Every JavaScript
feature — the splitters, the menus, the canvas — attaches to this structure.
Build it carefully.

---

## Part 1 — The HTML skeleton

Create a fresh file called `camtool.html`. Type the complete HTML structure.
Do not add any CSS yet. Read every element as you type it and understand what
region it represents.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CAM Tool</title>
</head>
<body>

  <div class="app">

    <!-- ── Menubar ──────────────────────────────────────── -->
    <header class="menubar">
      <span class="app-brand">CAM</span>
      <nav class="menu-nav">
        <button class="menu-btn" data-menu="file">File</button>
        <button class="menu-btn" data-menu="edit">Edit</button>
        <button class="menu-btn" data-menu="view">View</button>
        <button class="menu-btn" data-menu="tools">Tools</button>
      </nav>
    </header>

    <!-- ── App body (everything below menubar) ──────────── -->
    <div class="app-body">

      <!-- ── Toolbar ──────────────────────────────────────── -->
      <div class="toolbar">

        <div class="tbtn-group">
          <button class="tbtn" data-action="new"  title="New (Ctrl+N)">
            <svg viewBox="0 0 16 16"><rect x="3" y="2" width="7" height="1"/><rect x="3" y="2" width="1" height="12"/><rect x="3" y="13" width="10" height="1"/><rect x="12" y="6" width="1" height="7"/><path d="M10 2 L13 5 L10 5 Z"/></svg>
          </button>
          <button class="tbtn" data-action="open" title="Open (Ctrl+O)">
            <svg viewBox="0 0 16 16"><path d="M2 5h4l1.5 2H14v6H2z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
          </button>
          <button class="tbtn" data-action="save" title="Save (Ctrl+S)">
            <svg viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="5" y="2" width="4" height="4"/><rect x="5" y="9" width="6" height="4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
          </button>
        </div>

        <div class="tbtn-sep"></div>

        <div class="tbtn-group">
          <button class="tbtn" id="btn-undo" data-action="undo"
                  title="Undo (Ctrl+Z)" disabled>
            <svg viewBox="0 0 16 16"><path d="M4 6H9a4 4 0 010 8H5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><polyline points="4,3 1,6 4,9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
          <button class="tbtn" id="btn-redo" data-action="redo"
                  title="Redo (Ctrl+Y)" disabled>
            <svg viewBox="0 0 16 16"><path d="M12 6H7a4 4 0 000 8h4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><polyline points="12,3 15,6 12,9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>

        <div class="tbtn-sep"></div>

        <div class="tbtn-group">
          <button class="tbtn" data-action="fit"   title="Fit view (F)">
            <svg viewBox="0 0 16 16"><polyline points="2,6 2,2 6,2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><polyline points="10,2 14,2 14,6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><polyline points="14,10 14,14 10,14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><polyline points="6,14 2,14 2,10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
          <button class="tbtn" data-action="reset-view" title="Reset view (H)">
            <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="8" y1="3" x2="8" y2="5" stroke="currentColor" stroke-width="1.4"/><line x1="8" y1="11" x2="8" y2="13" stroke="currentColor" stroke-width="1.4"/><line x1="3" y1="8" x2="5" y2="8" stroke="currentColor" stroke-width="1.4"/><line x1="11" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.4"/></svg>
          </button>
        </div>

        <!-- Spacer pushes right-side buttons to the far right -->
        <div class="tbtn-spacer"></div>

        <div class="tbtn-group">
          <button class="tbtn tbtn-accent" data-action="generate-gcode"
                  title="Generate G-code (Ctrl+G)">G-CODE</button>
          <button class="tbtn tbtn-success" data-action="simulate"
                  title="Simulate (Ctrl+Shift+S)">▶ SIM</button>
        </div>

      </div>

      <!-- ── Workspace (the three-column area) ─────────────── -->
      <div class="workspace">

        <!-- Left dock: tool palette -->
        <aside class="dock dock-left" id="dock-left">
          <div class="tool-palette">

            <button class="tool-btn active" data-tool="select" title="Select (V)">
              <svg viewBox="0 0 16 16"><path d="M4 2l8 8-3.5 1L7 14z" fill="currentColor"/></svg>
            </button>

            <button class="tool-btn" data-tool="line" title="Line (L)">
              <svg viewBox="0 0 16 16"><line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </button>

            <button class="tool-btn" data-tool="arc" title="Arc (A)">
              <svg viewBox="0 0 16 16"><path d="M3 13 A9 9 0 0 1 13 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </button>

            <button class="tool-btn" data-tool="circle" title="Circle (C)">
              <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            </button>

            <button class="tool-btn" data-tool="polyline" title="Polyline (P)">
              <svg viewBox="0 0 16 16"><polyline points="2,13 5,5 9,10 14,3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>

            <div class="tool-sep"></div>

            <button class="tool-btn" data-tool="measure" title="Measure (M)">
              <svg viewBox="0 0 16 16"><line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="2" y1="11" x2="5" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="5" y1="8" x2="8" y2="11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="8" y1="5" x2="11" y2="8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="11" y1="2" x2="14" y2="5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            </button>

          </div>
        </aside>

        <!-- Left splitter handle -->
        <div class="splitter splitter-v" data-target="dock-left"></div>

        <!-- Center column: viewport + bottom dock -->
        <div class="center-col">

          <!-- The canvas viewport -->
          <div class="viewport" id="viewport">
            <canvas id="canvas"></canvas>
            <div class="viewport-hint">
              Draw something — L for Line, C for Circle, A for Arc
            </div>
          </div>

          <!-- Bottom splitter handle -->
          <div class="splitter splitter-h" data-target="dock-bottom"></div>

          <!-- Bottom dock: G-code output -->
          <aside class="dock dock-bottom" id="dock-bottom">
            <div class="panel-header">
              <span class="panel-title">G-code Output</span>
              <div class="panel-actions">
                <button class="panel-btn" data-action="copy-gcode">Copy</button>
                <button class="panel-btn" data-action="download-gcode">Download .nc</button>
              </div>
            </div>
            <div class="panel-body">
              <textarea class="gcode-output" id="gcode-output"
                        readonly placeholder="Generate G-code to see output here..."></textarea>
            </div>
          </aside>

        </div>

        <!-- Right splitter handle -->
        <div class="splitter splitter-v" data-target="dock-right"></div>

        <!-- Right dock: tabbed panels -->
        <aside class="dock dock-right" id="dock-right">

          <!-- Tab bar -->
          <div class="tab-bar">
            <button class="tab active" data-tab="properties">Properties</button>
            <button class="tab" data-tab="layers">Layers</button>
            <button class="tab" data-tab="cam">CAM</button>
          </div>

          <!-- Properties tab -->
          <div class="tab-panel active" id="tab-properties">
            <div class="props-empty" id="props-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <circle cx="12" cy="12" r="9"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
              </svg>
              <span>No selection</span>
              <span class="props-hint">Click an entity on the canvas to see its properties</span>
            </div>
            <div class="props-content" id="props-content" style="display:none;">
              <!-- Filled dynamically by JavaScript -->
            </div>
          </div>

          <!-- Layers tab -->
          <div class="tab-panel" id="tab-layers">
            <div class="panel-header">
              <span class="panel-title">Layers</span>
              <div class="panel-actions">
                <button class="panel-btn" data-action="add-layer" title="Add layer">+</button>
              </div>
            </div>
            <div class="panel-body" id="layers-list">

              <div class="layer-item active-layer">
                <div class="layer-color" style="background:#3377ff;"></div>
                <span class="layer-name">Layer 0</span>
                <button class="layer-vis-btn" title="Toggle visibility">●</button>
              </div>

              <div class="layer-item">
                <div class="layer-color" style="background:#33bb77;"></div>
                <span class="layer-name">Layer 1</span>
                <button class="layer-vis-btn" title="Toggle visibility">●</button>
              </div>

              <div class="layer-item">
                <div class="layer-color" style="background:#dd3355;"></div>
                <span class="layer-name">Layer 2</span>
                <button class="layer-vis-btn" title="Toggle visibility">●</button>
              </div>

            </div>
          </div>

          <!-- CAM settings tab -->
          <div class="tab-panel" id="tab-cam">
            <div class="panel-body">

              <details class="section" open>
                <summary class="section-header">Speeds</summary>
                <div class="section-body">
                  <div class="prop-grid">
                    <label>Feed Rate</label>
                    <input type="number" class="form-input" id="cam-feed"
                           value="1200" min="1" max="30000">
                    <span class="form-unit">mm/min</span>

                    <label>Spindle</label>
                    <input type="number" class="form-input" id="cam-rpm"
                           value="12000" min="0" max="60000">
                    <span class="form-unit">RPM</span>
                  </div>
                </div>
              </details>

              <details class="section" open>
                <summary class="section-header">Depth</summary>
                <div class="section-body">
                  <div class="prop-grid">
                    <label>Safe Z</label>
                    <input type="number" class="form-input" id="cam-safez"
                           value="5" step="0.1">
                    <span class="form-unit">mm</span>

                    <label>Cut Depth</label>
                    <input type="number" class="form-input" id="cam-depth"
                           value="-2" step="0.1">
                    <span class="form-unit">mm</span>

                    <label>Passes</label>
                    <input type="number" class="form-input" id="cam-passes"
                           value="1" min="1" step="1">
                    <span class="form-unit"></span>

                    <label>Pass Depth</label>
                    <input type="number" class="form-input" id="cam-pass-depth"
                           value="2" step="0.1">
                    <span class="form-unit">mm</span>
                  </div>
                </div>
              </details>

              <details class="section">
                <summary class="section-header">Tool</summary>
                <div class="section-body">
                  <div class="prop-grid">
                    <label>Diameter</label>
                    <input type="number" class="form-input" id="cam-tool-dia"
                           value="6" step="0.1" min="0.1">
                    <span class="form-unit">mm</span>

                    <label>Units</label>
                    <select class="form-select" id="cam-units">
                      <option value="mm">Millimeters</option>
                      <option value="inch">Inches</option>
                    </select>
                    <span class="form-unit"></span>
                  </div>
                </div>
              </details>

              <div class="cam-actions">
                <button class="action-btn action-btn-primary"
                        data-action="generate-gcode">Generate G-code</button>
                <button class="action-btn action-btn-success"
                        data-action="simulate">▶ Simulate</button>
              </div>

            </div>
          </div>

        </aside>

      </div>

      <!-- ── Status bar ─────────────────────────────────────── -->
      <footer class="statusbar">
        <span class="status-msg" id="status-msg">
          Ready — L=Line  C=Circle  A=Arc  V=Select  S=Snap  H=Reset  F=Fit
        </span>
        <div class="status-right">
          <span class="status-item status-tool" id="status-tool">SELECT</span>
          <div class="status-sep"></div>
          <span class="status-item status-snap" id="status-snap">SNAP OFF</span>
          <div class="status-sep"></div>
          <span class="status-item" id="status-entities">0 entities</span>
          <div class="status-sep"></div>
          <span class="status-item" id="status-zoom">40.0 px/u</span>
          <div class="status-sep"></div>
          <span class="status-item status-coords" id="status-coords">
            X:   0.000   Y:   0.000
          </span>
        </div>
      </footer>

    </div>
  </div>

</body>
</html>
```

Save. Open in the browser. You see unstyled HTML — everything stacked, no
layout, browser default fonts and spacing. This is the raw structure. Every
element is here. Now you add CSS region by region.

---

## Part 2 — CSS variables and the universal reset

Add `<style>` inside `<head>`. These go first, before every other rule.
Add the variables, save, then the reset, save.

**Step 1 — CSS variables. Save.**

```css
:root {
  /* Backgrounds */
  --bg-base:       #080810;
  --bg-panel:      #0f0f1e;
  --bg-toolbar:    #0c0c1a;
  --bg-menubar:    #060610;
  --bg-input:      #080818;
  --bg-hover:      #16162e;
  --bg-active:     #1a1a38;
  --bg-selected:   #0e2244;
  --bg-section:    #0d0d1e;

  /* Borders */
  --border:        rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-focus:  rgba(51, 119, 255, 0.6);

  /* Text */
  --text-primary:  #c0c0d8;
  --text-secondary:#7788aa;
  --text-muted:    #445566;
  --text-label:    #556688;
  --text-bright:   #e0e0f0;

  /* Accent colors */
  --accent:        #3377ff;
  --accent-dim:    rgba(51, 119, 255, 0.14);
  --accent-glow:   rgba(51, 119, 255, 0.25);
  --success:       #33bb77;
  --success-dim:   rgba(51, 187, 119, 0.12);
  --danger:        #dd3355;
  --danger-dim:    rgba(221, 51, 85, 0.12);
  --warning:       #ff9933;

  /* Typography */
  --font-ui:   'Segoe UI', system-ui, sans-serif;
  --font-mono: 'Consolas', 'Courier New', monospace;

  /* Transitions */
  --t-fast:   80ms ease;
  --t-normal: 160ms ease;
  --t-slow:   240ms ease;
}
```

Nothing visible changes — variables are just definitions. But every color
from here on uses a variable. Changing one variable changes the entire theme.

**Step 2 — Reset and base. Save.**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

The page background turns white (body default) and "overflowed". You can see
all the content because there's no layout yet. The scrollbars are styled.

---

## Part 3 — The app shell structure

This is the flex column that stacks the menubar, app-body with everything
inside it. Add each rule, save, and observe.

**Step 1 — The outer app container. Save.**

```css
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 13px;
  line-height: 1.4;
}
```

The page turns dark. All content is still stacked vertically but inside a
column flex container that fills the viewport.

**Step 2 — The app-body fills everything below the menubar. Save.**

```css
.app-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
```

**Step 3 — The workspace is the three-column row. Save.**

```css
.workspace {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
```

**Step 4 — The center column stacks viewport and bottom dock. Save.**

```css
.center-col {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}
```

The structure is in place. Still no visible regions — everything is the same
dark color with no borders. The next part adds the visible regions.

---

## Part 4 — The menubar

**Step 1 — Menubar dimensions and background. Save.**

```css
.menubar {
  height: 28px;
  flex-shrink: 0;
  background: var(--bg-menubar);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 0;
}
```

A dark strip appears at the top. The border separates it from the body below.

**Step 2 — App brand. Save.**

```css
.app-brand {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #2a3a66;
  margin-right: 12px;
  user-select: none;
}
```

"CAM" appears in the top-left in a dim blue-grey. Subtle — it's the brand,
not the focus.

**Step 3 — Menu navigation buttons. Save.**

```css
.menu-nav {
  display: flex;
  align-items: center;
}

.menu-btn {
  height: 22px;
  padding: 0 10px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
  user-select: none;
}

.menu-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.menu-btn.open {
  background: var(--bg-active);
  color: var(--text-primary);
}
```

File, Edit, View, Tools appear as subtle text buttons. Hover over them —
they light up. The `.open` class is used by JavaScript when a menu is open.

---

## Part 5 — The toolbar

**Step 1 — Toolbar container. Save.**

```css
.toolbar {
  height: 36px;
  flex-shrink: 0;
  background: var(--bg-toolbar);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 6px;
  gap: 1px;
}
```

A slightly lighter strip appears below the menubar.

**Step 2 — Button groups and separator. Save.**

```css
.tbtn-group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.tbtn-sep {
  width: 1px;
  height: 18px;
  background: var(--border-strong);
  margin: 0 5px;
  flex-shrink: 0;
}

.tbtn-spacer {
  flex: 1;
}
```

The groups are in place. The spacer pushes the right-side buttons right.

**Step 3 — Toolbar buttons. Save.**

```css
.tbtn {
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background var(--t-fast),
    border-color var(--t-fast),
    color var(--t-fast),
    transform var(--t-fast);
  flex-shrink: 0;
}

.tbtn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
  flex-shrink: 0;
}
```

Icon buttons appear. They're dark and subtle against the toolbar background.

**Step 4 — Toolbar button states. Save.**

```css
.tbtn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.tbtn:active {
  background: var(--bg-active);
  transform: translateY(1px);
}

.tbtn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.tbtn:disabled {
  opacity: 0.28;
  cursor: default;
  pointer-events: none;
}
```

Hover over the buttons — they respond. The undo/redo buttons are visibly
greyed out because they have `disabled` in the HTML.

**Step 5 — Special button variants. Save.**

```css
.tbtn.tbtn-accent {
  width: auto;
  padding: 0 10px;
  background: var(--accent-dim);
  border-color: rgba(51,119,255,0.35);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  font-family: var(--font-mono);
}

.tbtn.tbtn-accent:hover {
  background: var(--accent-glow);
  border-color: rgba(51,119,255,0.6);
  color: #88aaff;
}

.tbtn.tbtn-success {
  width: auto;
  padding: 0 10px;
  color: var(--success);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.tbtn.tbtn-success:hover {
  background: var(--success-dim);
  border-color: rgba(51,187,119,0.3);
  color: #66ddaa;
}
```

The G-CODE button glows blue. The SIM button is green. Both have automatic
widths to fit their text. Save and look at the toolbar — it looks like real
software.

---

## Part 6 — The docks

**Step 1 — Shared dock properties. Save.**

```css
.dock {
  background: var(--bg-panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Step 2 — Left dock (tool palette). Save.**

```css
.dock-left {
  width: 44px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
}
```

A narrow column appears on the left.

**Step 3 — Right dock. Save.**

```css
.dock-right {
  width: 268px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
}
```

A panel appears on the right.

**Step 4 — Bottom dock. Save.**

```css
.dock-bottom {
  height: 200px;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
}
```

A panel appears at the bottom of the center column.

**Step 5 — Splitter handles. Save.**

```css
.splitter {
  flex-shrink: 0;
  background: var(--border);
  transition: background var(--t-fast);
  position: relative;
  z-index: 10;
}

.splitter-v {
  width: 3px;
  cursor: col-resize;
}

.splitter-h {
  height: 3px;
  cursor: row-resize;
}

.splitter:hover,
.splitter.dragging {
  background: var(--accent);
}
```

Three thin lines appear at the dock borders. Hover over them — they turn blue.
They are not functional yet (JavaScript comes in Lab 8) but they look correct.

---

## Part 7 — The viewport

**Step 1 — Viewport fills remaining space. Save.**

```css
.viewport {
  flex: 1;
  min-height: 0;
  position: relative;
  background: var(--bg-base);
  overflow: hidden;
}
```

The dark canvas area fills the center. `position: relative` makes it an
anchor for absolutely positioned children (the canvas element, overlays).

**Step 2 — The canvas fills the viewport. Save.**

```css
#canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

**Step 3 — The hint text centered in the viewport. Save.**

```css
.viewport-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--text-muted);
  pointer-events: none;
  letter-spacing: 0.03em;
}
```

The hint text floats centered in the viewport. `pointer-events: none` means
mouse clicks pass straight through it to the canvas underneath.

---

## Part 8 — The tool palette

**Step 1 — Palette container. Save.**

```css
.tool-palette {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 5px;
  gap: 2px;
  overflow-y: auto;
}
```

**Step 2 — Tool buttons. Save.**

```css
.tool-btn {
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background var(--t-fast),
    border-color var(--t-fast),
    color var(--t-fast),
    transform var(--t-fast);
}

.tool-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}
```

**Step 3 — Tool button states. Save.**

```css
.tool-btn:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.tool-btn.active {
  background: var(--accent-dim);
  border-color: rgba(51,119,255,0.4);
  color: var(--accent);
}

.tool-btn.active:hover {
  background: var(--accent-glow);
  border-color: rgba(51,119,255,0.6);
}

.tool-btn:active {
  transform: scale(0.90);
}

.tool-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.tool-sep {
  width: 24px;
  height: 1px;
  background: var(--border-strong);
  margin: 3px 0;
  flex-shrink: 0;
}
```

The select tool (V) is highlighted blue. The others are dim. Hover over them —
they respond. Click and hold — they press in.

---

## Part 9 — Panel headers, tabs, and sections

**Step 1 — Panel header. Save.**

```css
.panel-header {
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background: var(--bg-section);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  gap: 6px;
  user-select: none;
}

.panel-title {
  flex: 1;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-label);
}

.panel-actions {
  display: flex;
  gap: 4px;
}

.panel-btn {
  height: 20px;
  padding: 0 8px;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}

.panel-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
```

The G-code panel shows its "G-CODE OUTPUT" header with Copy and Download buttons.

**Step 2 — Tab bar. Save.**

```css
.tab-bar {
  display: flex;
  background: var(--bg-section);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  overflow-x: auto;
}

.tab {
  height: 30px;
  padding: 0 14px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font-ui);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color var(--t-fast), border-color var(--t-fast),
              background var(--t-fast);
  user-select: none;
}

.tab:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.02);
}

.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

Three tabs appear: Properties, Layers, CAM. Properties is highlighted.

**Step 3 — Tab panels. Save.**

```css
.tab-panel {
  display: none;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
}

.tab-panel.active {
  display: flex;
}
```

Only the active tab panel is visible. (Tab switching needs JavaScript — that
comes in Lab 9. For now Properties is always shown because it has `.active`.)

---

## Part 10 — The properties panel states

**Step 1 — Empty state. Save.**

```css
.props-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 20px;
  text-align: center;
}

.props-empty svg {
  width: 32px;
  height: 32px;
  color: var(--text-muted);
  opacity: 0.4;
}

.props-empty span {
  font-size: 13px;
  color: var(--text-muted);
}

.props-hint {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.6;
  line-height: 1.5;
}
```

The Properties panel shows a centered icon with "No selection" and a hint.
This is what the user sees before clicking anything on the canvas.

---

## Part 11 — Collapsible sections

**Step 1 — Section container. Save.**

```css
.section {
  border-bottom: 1px solid var(--border);
}
```

**Step 2 — Section header. Save.**

```css
.section-header {
  height: 26px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px 0 22px;
  background: var(--bg-section);
  border: none;
  color: var(--text-label);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  text-align: left;
  position: relative;
  list-style: none;
  transition: background var(--t-fast), color var(--t-fast);
}

.section-header::-webkit-details-marker { display: none; }
.section-header::marker { display: none; }

.section-header:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}
```

The section headers appear: SPEEDS, DEPTH, TOOL in the CAM tab.

**Step 3 — The CSS arrow. Save.**

```css
.section-header::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 50%;
  width: 5px;
  height: 5px;
  border-right: 1.5px solid var(--text-muted);
  border-bottom: 1.5px solid var(--text-muted);
  transform: translateY(-65%) rotate(-45deg);
  transition: transform var(--t-normal), border-color var(--t-fast);
}

.section-header:hover::before {
  border-color: var(--text-secondary);
}

details[open] > .section-header::before {
  transform: translateY(-35%) rotate(45deg);
}
```

Each section shows a → arrow. Click a header — it rotates to ↓ and the
content reveals. Click again — rotates back, content hides. Pure CSS, pure HTML.

**Step 4 — Section body. Save.**

```css
.section-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
```

---

## Part 12 — Form controls in the CAM panel

**Step 1 — The prop-grid (from Lab 4). Save.**

```css
.prop-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 5px 8px;
  align-items: center;
}

.prop-grid label {
  font-size: 11px;
  color: var(--text-label);
  text-align: right;
  white-space: nowrap;
  user-select: none;
}

.form-unit {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  min-width: 28px;
}
```

**Step 2 — Form inputs. Save.**

```css
.form-input {
  height: 24px;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 0 6px;
  outline: none;
  transition: border-color var(--t-normal), background var(--t-normal);
  min-width: 0;
  text-align: right;
  -moz-appearance: textfield;
}

.form-input::-webkit-outer-spin-button,
.form-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.form-input:focus {
  border-color: var(--border-focus);
  background: #0a0a22;
}

.form-input:hover:not(:focus) {
  border-color: rgba(255,255,255,0.18);
}
```

**Step 3 — Form select. Save.**

```css
.form-select {
  height: 24px;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 12px;
  padding: 0 20px 0 6px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'%3E%3Cpolyline points='0.5,0.5 4,4.5 7.5,0.5' fill='none' stroke='%23556688' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 8px;
  transition: border-color var(--t-normal);
  min-width: 0;
}

.form-select:focus {
  border-color: var(--border-focus);
}
```

The select elements show a custom chevron arrow. The native arrow is hidden.

**Step 4 — CAM action buttons. Save.**

```css
.cam-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
}

.action-btn {
  height: 30px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  font-family: var(--font-ui);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast),
              color var(--t-fast), transform var(--t-fast);
  letter-spacing: 0.02em;
}

.action-btn:active {
  transform: translateY(1px);
}

.action-btn-primary {
  background: var(--accent-dim);
  border-color: rgba(51,119,255,0.4);
  color: var(--accent);
}

.action-btn-primary:hover {
  background: var(--accent-glow);
  border-color: rgba(51,119,255,0.7);
  color: #88aaff;
}

.action-btn-success {
  background: var(--success-dim);
  border-color: rgba(51,187,119,0.3);
  color: var(--success);
}

.action-btn-success:hover {
  background: rgba(51,187,119,0.2);
  border-color: rgba(51,187,119,0.6);
  color: #66ddaa;
}
```

The Generate G-code and Simulate buttons appear in the CAM tab.

---

## Part 13 — The layers panel

**Step 1 — Layer items. Save.**

```css
.layer-item {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 10px;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--t-fast);
}

.layer-item:hover {
  background: var(--bg-hover);
}

.layer-item.active-layer {
  background: var(--bg-selected);
}

.layer-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.layer-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  user-select: none;
}

.layer-item.active-layer .layer-name {
  color: var(--text-primary);
}

.layer-vis-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 8px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--t-fast), background var(--t-fast);
}

.layer-vis-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
```

Click the Layers tab. Three layers appear, the first highlighted. Each has
a colored square, a name, and a visibility button.

---

## Part 14 — The G-code output area

**Step 1 — G-code textarea. Save.**

```css
.gcode-output {
  flex: 1;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: #44aa66;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  padding: 8px 10px;
  outline: none;
  resize: none;
  overflow-y: auto;
}

.gcode-output::placeholder {
  color: var(--text-muted);
  font-style: italic;
}
```

The G-code area is a dark green monospace textarea that fills the bottom panel.

---

## Part 15 — The status bar

**Step 1 — Status bar layout. Save.**

```css
.statusbar {
  height: 22px;
  flex-shrink: 0;
  background: var(--bg-menubar);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 0;
  user-select: none;
}

.status-msg {
  flex: 1;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-item {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  white-space: nowrap;
}

.status-sep {
  width: 1px;
  height: 11px;
  background: var(--border-strong);
  flex-shrink: 0;
}

.status-tool {
  color: var(--accent);
  font-weight: 600;
}

.status-snap {
  color: var(--text-muted);
}

.status-snap.on {
  color: var(--success);
}

.status-coords {
  min-width: 180px;
  text-align: right;
}
```

The status bar appears at the very bottom. SELECT is blue. SNAP OFF is dim.
Coordinates are right-aligned in a fixed-width area so they don't shift as
values change.

---

## Part 16 — Final polish

Add these at the end of your CSS. Save after each.

**Step 1 — Focus ring reset for mouse users. Save.**

```css
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**Step 2 — Text selection color. Save.**

```css
::selection {
  background: rgba(51,119,255,0.35);
  color: var(--text-bright);
}
```

**Step 3 — Prevent accidental text selection on UI elements. Save.**

```css
.menubar,
.toolbar,
.tool-palette,
.dock-left,
.tab-bar,
.panel-header,
.section-header,
.statusbar {
  user-select: none;
}
```

---

## Part 17 — What you have and what comes next

Save the file. Refresh the browser. Resize the browser window — everything
scales correctly. Interact with every element:

- Hover over menubar items — they highlight
- Hover over toolbar buttons — they respond, undo/redo are greyed out
- Hover over tool palette buttons — select tool is highlighted
- Click the Layers tab — it switches (this works because it uses native
  browser behavior... actually no, try it — you'll see only the Properties
  panel shows because tab switching needs JavaScript)
- Click the collapsible sections in the CAM tab — SPEEDS, DEPTH, TOOL
  open and close with animated arrows
- Hover over the splitter handles — they turn blue
- Every input focuses correctly with a blue border

The tab switching, splitters, menus, canvas drawing — all of that comes in
the JavaScript labs. But the shell is complete and correct. Every visual
detail is right. The CSS is organized, uses variables throughout, and will
be easy to maintain.

**What's in your file now:**
- CSS variables for the complete design system
- Universal reset and scrollbar styling
- Reduced-motion accessibility rule
- App shell: flex column, fills viewport
- Menubar with hover states
- Toolbar with buttons, separators, spacer, variant styles
- Tool palette with all states including active indicator
- Three docks: left (tool palette), right (tabbed), bottom (G-code)
- Splitter handles with hover states
- Tab bar with active tab indicator
- Properties panel empty state
- Collapsible sections with CSS arrow animation
- CAM settings panel with grid-aligned form
- Custom-styled inputs and select
- Layer list with active state
- G-code textarea
- Status bar with coordinate display

**Lab 8** adds the first JavaScript: the splitter drag system. You will
make those handles actually resize the panels when dragged. Then Lab 9 wires
up the dropdown menus. Lab 10 adds the tool palette switching and keyboard
shortcuts. Lab 11 connects the canvas. Each lab adds one feature to this
exact file.
