# UI Lab 10 — Tool Palette & Keyboard Shortcuts
## The Tool State Machine

---

**What you will build.**

Clicking a tool button activates it exclusively — the previous tool
deactivates. Keyboard shortcuts switch tools from anywhere on the page.
The status bar updates to show the active tool and a context-sensitive hint
for what to do next. Escape cancels the current operation. The tool system
dispatches events so the canvas (Lab 11) can respond without the tool code
knowing anything about drawing.

**Concepts this lab teaches:**
- Exclusive selection (radio-button behavior) without actual radio buttons
- The tool state machine: idle → first-point → second-point → done
- Separating tool state from rendering
- Context-sensitive status messages
- Keyboard shortcut system
- The hint system: telling the user what to do next

---

## Part 1 — The tool state machine

Every drawing tool is a state machine. It starts in `idle`. Each click
advances it through states until the geometry is complete, then it resets.

```
Line tool:
  idle → [click] → first-point → [click] → done → first-point (chain)
                                          → [Escape] → idle

Circle tool:
  idle → [click] → center-placed → [click] → done → idle

Arc tool:
  idle → [click] → center-placed → [click] → start-placed → [click] → done → idle
```

The state machine is just an object that holds the current state and any
partial data (the first click point, the center, etc.). The canvas reads
this state to draw previews. Clicks advance the state.

---

## Part 2 — Tool definitions

Define every tool in one place. Add this to your script, near the top with
the other definitions.

```javascript
// ── Tool definitions ──────────────────────────────────────────────
const TOOLS = {
  select: {
    name:     'select',
    label:    'SELECT',
    shortcut: 'v',
    hints: {
      idle: 'Click to select — Shift+click to add to selection — Drag to rubber-band select',
    },
  },
  line: {
    name:     'line',
    label:    'LINE',
    shortcut: 'l',
    hints: {
      idle:         'Click to place start point',
      'first-point': 'Click to place end point — Esc to cancel',
    },
  },
  arc: {
    name:     'arc',
    label:    'ARC',
    shortcut: 'a',
    hints: {
      idle:           'Click to place arc center',
      'center-placed': 'Click to place start point (defines radius)',
      'start-placed':  'Click to place end point — Esc to cancel',
    },
  },
  circle: {
    name:     'circle',
    label:    'CIRCLE',
    shortcut: 'c',
    hints: {
      idle:           'Click to place center point',
      'center-placed': 'Click to set radius — Esc to cancel',
    },
  },
  polyline: {
    name:     'polyline',
    label:    'POLYLINE',
    shortcut: 'p',
    hints: {
      idle:        'Click to place first point',
      'in-progress': 'Click to add point — Double-click or Enter to finish — Esc to cancel',
    },
  },
  measure: {
    name:     'measure',
    label:    'MEASURE',
    shortcut: 'm',
    hints: {
      idle:         'Click to place first measurement point',
      'first-point': 'Click second point to measure distance',
    },
  },
};
```

---

## Part 3 — The tool state

```javascript
// ── Tool state ────────────────────────────────────────────────────
const toolState = {
  active:  'select',  // which tool is active
  state:   'idle',    // which state within that tool
  data:    {},        // partial data: first point, center, etc.
};

// Read-only accessors
function getActiveTool()      { return toolState.active; }
function getToolPhase()       { return toolState.state; }
function getToolData()        { return toolState.data; }
function isToolIdle()         { return toolState.state === 'idle'; }
```

The tool state lives in one object. Everything that needs to know the current
tool reads from this object. Nothing writes to it except `setTool` and
`advanceTool`.

---

## Part 4 — Setting the active tool

```javascript
// ── Tool activation ───────────────────────────────────────────────
function setTool(name) {
  if (!TOOLS[name]) return;

  // Cancel any in-progress operation on the previous tool
  cancelTool();

  toolState.active = name;
  toolState.state  = 'idle';
  toolState.data   = {};

  // Update tool palette buttons
  document.querySelectorAll('.tool-btn').forEach(btn => {
    const isActive = btn.dataset.tool === name;
    btn.classList.toggle('active', isActive);
  });

  // Update status bar
  updateToolStatus();

  // Update canvas cursor
  updateCursor();

  // Dispatch so other parts of the app can respond
  dispatch('tool-changed', { tool: name });
}

function cancelTool() {
  toolState.state = 'idle';
  toolState.data  = {};
  dispatch('tool-cancelled');
  updateToolStatus();
}

function advanceTool(newState, newData = {}) {
  toolState.state = newState;
  toolState.data  = { ...toolState.data, ...newData };
  updateToolStatus();
}
```

`cancelTool` resets the state machine without changing the active tool. A line
tool that was waiting for a second point goes back to waiting for the first.

`advanceTool` moves to the next state and merges new data into `toolState.data`.
When the line tool gets its first click, it calls
`advanceTool('first-point', { x1: wx, y1: wy })`.

---

## Part 5 — Status bar updates

The hint system tells the user what to do next. It changes as the tool
advances through its states.

```javascript
// ── Tool status ───────────────────────────────────────────────────
function updateToolStatus() {
  const tool     = TOOLS[toolState.active];
  const toolLabel = document.getElementById('status-tool');
  const msgEl    = document.getElementById('status-msg');

  if (toolLabel) toolLabel.textContent = tool ? tool.label : '';

  if (msgEl && tool) {
    const hint = tool.hints[toolState.state] || tool.hints.idle || '';
    msgEl.textContent = hint;
  }
}
```

This replaces the static hint text. Now when you pick the Line tool, the
status bar says "Click to place start point". After the first click it says
"Click to place end point — Esc to cancel".

---

## Part 6 — Cursor updates

The cursor changes to match the active tool.

```javascript
// ── Cursor ────────────────────────────────────────────────────────
function updateCursor() {
  const viewport = document.getElementById('viewport');
  if (!viewport) return;

  const cursors = {
    select:   'default',
    line:     'crosshair',
    arc:      'crosshair',
    circle:   'crosshair',
    polyline: 'crosshair',
    measure:  'crosshair',
  };

  viewport.style.cursor = cursors[toolState.active] || 'default';
}
```

---

## Part 7 — Wiring the tool palette

```javascript
// ── Tool palette wiring ───────────────────────────────────────────
function initToolPalette() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolName = btn.dataset.tool;
      if (toolName) setTool(toolName);
    });
  });
}
```

---

## Part 8 — Keyboard shortcuts

The shortcut system listens for keydown events on the document. It checks
the active element first — if the user is typing in an input or textarea,
shortcuts are suppressed (except Escape).

```javascript
// ── Keyboard shortcuts ────────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', onKeyDown);
}

function onKeyDown(e) {
  // Suppress shortcuts when typing in inputs
  const tag = document.activeElement?.tagName?.toLowerCase();
  const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

  // Escape always works
  if (e.key === 'Escape') {
    e.preventDefault();
    if (_openMenuName) {
      closeAllMenus();
    } else if (!isToolIdle()) {
      cancelTool();
    }
    return;
  }

  if (isTyping) return;

  // Build a canonical key string: "ctrl+z", "shift+s", "f", etc.
  const parts = [];
  if (e.ctrlKey  || e.metaKey) parts.push('ctrl');
  if (e.shiftKey)               parts.push('shift');
  if (e.altKey)                 parts.push('alt');
  parts.push(e.key.toLowerCase());
  const keyStr = parts.join('+');

  // Tool shortcuts (single letters, no modifiers)
  if (parts.length === 1) {
    const key = parts[0];
    const toolMatch = Object.values(TOOLS).find(t => t.shortcut === key);
    if (toolMatch) {
      e.preventDefault();
      setTool(toolMatch.name);
      return;
    }
  }

  // Other shortcuts
  const shortcuts = {
    'ctrl+z':       () => dispatch('undo'),
    'ctrl+y':       () => dispatch('redo'),
    'ctrl+shift+z': () => dispatch('redo'),
    'ctrl+s':       () => dispatch('save'),
    'ctrl+o':       () => dispatch('open'),
    'ctrl+n':       () => dispatch('new'),
    'ctrl+a':       () => dispatch('select-all'),
    'delete':       () => dispatch('delete'),
    'backspace':    () => dispatch('delete'),
    'f':            () => dispatch('fit'),
    'h':            () => dispatch('reset-view'),
    'ctrl+=':       () => dispatch('zoom-in'),
    'ctrl+-':       () => dispatch('zoom-out'),
    'ctrl+g':       () => dispatch('generate-gcode'),
  };

  const handler = shortcuts[keyStr];
  if (handler) {
    e.preventDefault();
    handler();
  }
}
```

The key string approach is clean and extendable. To add a new shortcut:
add one entry to the `shortcuts` object. To remove one: delete the entry.

---

## Part 9 — Tool actions from the menu

The Tools menu dispatches `tool-select`, `tool-line`, etc. Wire them:

```javascript
// ── Tool actions from menu ────────────────────────────────────────
Object.values(TOOLS).forEach(tool => {
  onAction('tool-' + tool.name, () => setTool(tool.name));
});
```

One line connects all tool menu items to the `setTool` function. When you
add a new tool, add it to `TOOLS` and this line handles the menu
connection automatically.

---

## Part 10 — Toolbar button state

The toolbar also has undo/redo buttons. Wire them to the action system and
update their disabled state:

```javascript
// ── Toolbar button wiring ─────────────────────────────────────────
function initToolbarButtons() {
  document.querySelectorAll('[data-action]').forEach(el => {
    // Skip menu items — they have their own handlers
    if (el.classList.contains('menu-item')) return;

    el.addEventListener('click', () => {
      const action = el.dataset.action;
      if (action) dispatch(action);
    });
  });
}

// Update undo/redo button states
function setUndoEnabled(canUndo, canRedo, undoLabel, redoLabel) {
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');

  if (btnUndo) btnUndo.disabled = !canUndo;
  if (btnRedo) btnRedo.disabled = !canRedo;

  setMenuItemDisabled('menu-undo', !canUndo);
  setMenuItemDisabled('menu-redo', !canRedo);

  if (undoLabel) setMenuItemLabel('menu-undo', canUndo ? `Undo ${undoLabel}` : 'Undo');
  if (redoLabel) setMenuItemLabel('menu-redo', canRedo ? `Redo ${redoLabel}` : 'Redo');
}
```

`setUndoEnabled` will be called by the drawing system (Lab 11) whenever the
undo stack changes.

---

## Part 11 — Snap toggle

The snap state lives in the tool system since it affects how tools place points.

```javascript
// ── Snap state ────────────────────────────────────────────────────
let snapEnabled = false;

function setSnap(enabled) {
  snapEnabled = enabled;

  const el = document.getElementById('status-snap');
  if (el) {
    el.textContent = enabled ? 'SNAP ON' : 'SNAP OFF';
    el.classList.toggle('on', enabled);
  }

  setMenuItemChecked('menu-snap', enabled);
}

onAction('toggle-snap', ({ checked }) => {
  setSnap(checked !== undefined ? checked : !snapEnabled);
});

// S key toggles snap
onKeyDown_extend = onKeyDown; // preserve original
```

Add `'s': () => dispatch('toggle-snap')` to the shortcuts object in `onKeyDown`.

Wait — instead of patching, update the shortcuts object directly. Find where
you defined `shortcuts` in `onKeyDown` and add:

```javascript
's': () => dispatch('toggle-snap'),
```

---

## Part 12 — The complete additions for Lab 10

Add this to your script after the Lab 9 code. Then add the init calls.

```javascript
// ─── PASTE AFTER LAB 9 CODE ────────────────────────────────────────

const TOOLS = { /* paste from Part 2 */ };

const toolState = { active: 'select', state: 'idle', data: {} };

function getActiveTool()  { return toolState.active; }
function getToolPhase()   { return toolState.state; }
function getToolData()    { return toolState.data; }
function isToolIdle()     { return toolState.state === 'idle'; }

function setTool(name)    { /* paste from Part 4 */ }
function cancelTool()     { /* paste from Part 4 */ }
function advanceTool(newState, newData = {}) { /* paste from Part 4 */ }

function updateToolStatus() { /* paste from Part 5 */ }
function updateCursor()     { /* paste from Part 6 */ }
function initToolPalette()  { /* paste from Part 7 */ }
function initKeyboardShortcuts() { /* paste from Part 8 */ }
function initToolbarButtons()    { /* paste from Part 10 */ }
function setUndoEnabled(canUndo, canRedo, undoLabel, redoLabel) { /* paste from Part 10 */ }

let snapEnabled = false;
function setSnap(enabled) { /* paste from Part 11 */ }
onAction('toggle-snap', ({ checked }) => setSnap(checked !== undefined ? checked : !snapEnabled));

// Wire tool menu actions
Object.values(TOOLS).forEach(tool => {
  onAction('tool-' + tool.name, () => setTool(tool.name));
});
```

Update the init section at the bottom:

```javascript
restoreLayout();
initSplitters();
resizeCanvas();
initMenus();
initToolPalette();
initKeyboardShortcuts();
initToolbarButtons();
setTool('select');   // set default tool and update UI
```

Save and refresh. Click each tool button — the correct one highlights.
Press V, L, A, C, P, M — tools switch. The status bar shows the correct
hint for each tool. Press S — snap toggles on and off in the status bar.
Press Escape while a tool is active — nothing in the drawing yet, but the
state resets.

---

## What you learned in this lab

- Tool state machine: idle → states → done, stored in a plain object
- `setTool` is the single entry point for all tool changes — UI, keyboard,
  menu all call the same function
- Keyboard shortcut system: canonical key string, lookup table of handlers
- Suppress shortcuts when typing in inputs — check `document.activeElement`
- Status hints: each tool defines its own hints per state — the status bar
  just reads them
- `data-action` on HTML elements wires toolbar buttons to the action system
  without writing individual click handlers
- Snap state is owned by the tool system, reflected in the status bar and menu

## What comes in Lab 11

The canvas: world coordinates, the render loop, drawing geometry on the
canvas, and wiring the tool state machine to actual drawing. By the end
of Lab 11 you can draw lines, arcs, and circles with the tools you built
in this lab.
