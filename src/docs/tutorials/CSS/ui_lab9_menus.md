# UI Lab 9 — Dropdown Menus
## Click to Open, Click Outside to Close

---

**What you will build.**

Clicking File, Edit, View, or Tools in the menubar opens a real dropdown menu.
Moving the mouse to a different menu item switches menus without clicking.
Pressing Escape closes the open menu. Clicking anywhere outside closes it.
Checkable menu items toggle their checked state. Disabled items cannot be
clicked. Menu items fire actions that other parts of the app respond to.

**Concepts this lab teaches:**
- Building a menu system from scratch
- Positioning a dropdown relative to its trigger
- The outside-click pattern
- Mouse hover switching between open menus
- The action/event dispatch pattern
- Checkable and disabled menu items
- Keyboard navigation

---

## Part 1 — The architecture

A menu system has three parts that talk to each other:

**The trigger** — a button in the menubar. Click it to open the menu.

**The popup** — the dropdown panel. Created once and reused. Positioned
absolutely over the page.

**The action dispatcher** — when a menu item is clicked, it fires a named
action. The rest of the app listens for actions and responds.

The action dispatcher is the key architectural decision. Instead of each menu
item directly calling a function, it dispatches a named event:

```javascript
// Menu item fires an action
dispatch('new-file');

// Somewhere else in the app, anything can listen
onAction('new-file', () => {
  // create a new file
});
```

This decouples the menu from the rest of the app. The menu does not need to
know what `new-file` does. Multiple listeners can respond to the same action.
This is exactly how Qt's `QAction` system works — the action is a named signal,
and slots connect to it from anywhere.

---

## Part 2 — The menu definitions

First, define what each menu contains. This is data — not DOM, not HTML.
Add this to your `<script>` tag, before all other code.

```javascript
// ── Menu definitions ──────────────────────────────────────────────
// Each menu is an array of items.
// type: 'item'      — a clickable action
// type: 'separator' — a horizontal rule
// type: 'check'     — a toggleable item (like "Snap to grid")
//
// action:    string that gets dispatched when clicked
// label:     display text
// shortcut:  displayed on the right side (cosmetic only here)
// disabled:  true = greyed out, not clickable
// checked:   initial checked state for type:'check' items
// id:        optional — lets you find and update this item later

const MENU_DEFINITIONS = {
  file: [
    { type: 'item', label: 'New',       action: 'new',      shortcut: 'Ctrl+N' },
    { type: 'item', label: 'Open…',     action: 'open',     shortcut: 'Ctrl+O' },
    { type: 'separator' },
    { type: 'item', label: 'Save',      action: 'save',     shortcut: 'Ctrl+S' },
    { type: 'item', label: 'Save As…',  action: 'save-as',  shortcut: 'Ctrl+Shift+S' },
    { type: 'separator' },
    { type: 'item', label: 'Import DXF…', action: 'import-dxf' },
    { type: 'item', label: 'Export G-code…', action: 'export-gcode' },
  ],

  edit: [
    { type: 'item', label: 'Undo',       action: 'undo', shortcut: 'Ctrl+Z',
      id: 'menu-undo', disabled: true },
    { type: 'item', label: 'Redo',       action: 'redo', shortcut: 'Ctrl+Y',
      id: 'menu-redo', disabled: true },
    { type: 'separator' },
    { type: 'item', label: 'Select All', action: 'select-all', shortcut: 'Ctrl+A' },
    { type: 'item', label: 'Delete',     action: 'delete',     shortcut: 'Delete' },
    { type: 'separator' },
    { type: 'check', label: 'Snap to Grid', action: 'toggle-snap',
      shortcut: 'S', checked: false, id: 'menu-snap' },
  ],

  view: [
    { type: 'item', label: 'Fit View',    action: 'fit',         shortcut: 'F' },
    { type: 'item', label: 'Reset View',  action: 'reset-view',  shortcut: 'H' },
    { type: 'separator' },
    { type: 'item', label: 'Zoom In',     action: 'zoom-in',     shortcut: 'Ctrl+=' },
    { type: 'item', label: 'Zoom Out',    action: 'zoom-out',    shortcut: 'Ctrl+-' },
    { type: 'separator' },
    { type: 'check', label: 'G-code Panel', action: 'toggle-gcode-panel',
      checked: true, id: 'menu-gcode-panel' },
    { type: 'check', label: 'Show Grid',  action: 'toggle-grid',
      checked: true, id: 'menu-grid' },
    { type: 'check', label: 'Show Axes',  action: 'toggle-axes',
      checked: true, id: 'menu-axes' },
  ],

  tools: [
    { type: 'item', label: 'Select',    action: 'tool-select',   shortcut: 'V' },
    { type: 'item', label: 'Line',      action: 'tool-line',     shortcut: 'L' },
    { type: 'item', label: 'Arc',       action: 'tool-arc',      shortcut: 'A' },
    { type: 'item', label: 'Circle',    action: 'tool-circle',   shortcut: 'C' },
    { type: 'item', label: 'Polyline',  action: 'tool-polyline', shortcut: 'P' },
    { type: 'separator' },
    { type: 'item', label: 'Measure',   action: 'tool-measure',  shortcut: 'M' },
    { type: 'separator' },
    { type: 'item', label: 'CAM Settings…', action: 'open-cam-settings' },
  ],
};
```

Read this carefully. Each item is a plain object. This data drives the entire
menu system. To add a new menu item, you add one object here. Nothing else
changes.

---

## Part 3 — The action system

Before building the menu, build the action system it dispatches to.
This is the central nervous system of the whole application.

```javascript
// ── Action system ─────────────────────────────────────────────────
// dispatch(action, data) — fire a named action
// onAction(action, handler) — listen for a named action

const _actionHandlers = {};

function dispatch(action, data = {}) {
  const handlers = _actionHandlers[action];
  if (handlers) {
    handlers.forEach(fn => fn(data));
  }
  // Also dispatch as a DOM event for loose coupling
  document.dispatchEvent(
    new CustomEvent('cam-action', { detail: { action, data } })
  );
}

function onAction(action, handler) {
  if (!_actionHandlers[action]) _actionHandlers[action] = [];
  _actionHandlers[action].push(handler);
}
```

`dispatch` calls all registered handlers for an action and also fires a DOM
event. `onAction` registers a handler. This is the publish/subscribe pattern —
the same concept as Qt signals and slots.

---

## Part 4 — Building the menu popups

Now build the DOM for each menu popup. These are created once on page load
and reused every time the menu opens.

Add CSS for the menus in your `<style>` section first.

**Step 1 — Menu popup CSS. Add to your styles, save.**

```css
/* ── Menu popup ─────────────────────────────────────────────────── */
.menu-popup {
  position: fixed;
  background: #0f0f22;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  padding: 4px;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7),
              0 0 0 1px rgba(255,255,255,0.04);
  z-index: 1000;
  display: none;
  user-select: none;
}

.menu-popup.open {
  display: block;
}

/* ── Menu items ─────────────────────────────────────────────────── */
.menu-item {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 10px 0 28px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  gap: 8px;
  transition: background 60ms ease;
}

.menu-item:hover {
  background: rgba(51, 119, 255, 0.18);
}

.menu-item.disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.menu-item-label {
  flex: 1;
  font-size: 13px;
  color: #c0c0d8;
  white-space: nowrap;
}

.menu-item-shortcut {
  font-size: 11px;
  font-family: 'Consolas', monospace;
  color: #445566;
  white-space: nowrap;
  margin-left: 24px;
}

/* Check indicator — ::before on .menu-item */
.menu-item.checkable::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  transform: translateY(-50%);
  transition: background 80ms ease;
}

.menu-item.checkable.checked::before {
  background: #3377ff;
  box-shadow: 0 0 4px rgba(51,119,255,0.6);
}

/* ── Separator ──────────────────────────────────────────────────── */
.menu-sep {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 3px 6px;
}
```

**Step 2 — Build menu DOM. Add to script, save.**

```javascript
// ── Menu DOM builder ──────────────────────────────────────────────
const _menuPopups = {};   // name → popup element
const _menuItemEls = {};  // id → element (for programmatic updates)

function buildMenus() {
  Object.entries(MENU_DEFINITIONS).forEach(([name, items]) => {
    const popup = document.createElement('div');
    popup.className = 'menu-popup';
    popup.id = 'menu-popup-' + name;

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'menu-sep';
        popup.appendChild(sep);
        return;
      }

      const el = document.createElement('div');
      el.className = 'menu-item';
      if (item.disabled)             el.classList.add('disabled');
      if (item.type === 'check')     el.classList.add('checkable');
      if (item.type === 'check' && item.checked) el.classList.add('checked');

      el.innerHTML = `
        <span class="menu-item-label">${item.label}</span>
        ${item.shortcut
          ? `<span class="menu-item-shortcut">${item.shortcut}</span>`
          : ''}
      `;

      el.addEventListener('click', () => {
        if (item.type === 'check') {
          el.classList.toggle('checked');
          dispatch(item.action, { checked: el.classList.contains('checked') });
        } else {
          dispatch(item.action);
        }
        closeAllMenus();
      });

      if (item.id) _menuItemEls[item.id] = el;
      popup.appendChild(el);
    });

    document.body.appendChild(popup);
    _menuPopups[name] = popup;
  });
}
```

Each popup is appended to `document.body`. This is important — menus need
to sit on top of everything, and the body is the right place for elements
positioned with `position: fixed`.

---

## Part 5 — Opening, positioning, and closing menus

**Step 1 — Open a menu. Add to script, save.**

```javascript
// ── Menu open/close ───────────────────────────────────────────────
let _openMenuName = null;

function openMenu(name, triggerEl) {
  closeAllMenus();

  const popup = _menuPopups[name];
  if (!popup) return;

  popup.classList.add('open');
  _openMenuName = name;

  // Mark the trigger as open
  triggerEl.classList.add('open');

  // Position the popup below the trigger
  positionPopup(popup, triggerEl);
}

function positionPopup(popup, trigger) {
  const rect = trigger.getBoundingClientRect();

  popup.style.left = rect.left + 'px';
  popup.style.top  = (rect.bottom + 2) + 'px';

  // After rendering, check if popup overflows the viewport
  // and adjust if necessary
  requestAnimationFrame(() => {
    const pr = popup.getBoundingClientRect();
    if (pr.right > window.innerWidth - 8) {
      popup.style.left = (window.innerWidth - pr.width - 8) + 'px';
    }
  });
}

function closeAllMenus() {
  Object.values(_menuPopups).forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.menu-btn.open').forEach(b => b.classList.remove('open'));
  _openMenuName = null;
}
```

`positionPopup` puts the popup directly below the trigger button using
`getBoundingClientRect()`. The `requestAnimationFrame` check runs after the
browser has laid out the popup — at that point its width is known and you can
check if it overflows the right edge.

**Step 2 — Wire the trigger buttons. Add to script, save.**

```javascript
function initMenus() {
  buildMenus();

  document.querySelectorAll('.menu-btn').forEach(btn => {
    const name = btn.dataset.menu;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (_openMenuName === name) {
        closeAllMenus();
      } else {
        openMenu(name, btn);
      }
    });

    // If another menu is already open, hover switches menus
    btn.addEventListener('mouseenter', () => {
      if (_openMenuName && _openMenuName !== name) {
        openMenu(name, btn);
      }
    });
  });

  // Click outside closes all menus
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-popup') && !e.target.closest('.menu-btn')) {
      closeAllMenus();
    }
  });

  // Escape closes menus
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _openMenuName) {
      closeAllMenus();
    }
  });
}
```

The hover switching — `if (_openMenuName && _openMenuName !== name)` — is what
makes menubar navigation feel like a native application. Once one menu is open,
moving the mouse to another trigger instantly switches to that menu without
requiring a click. Only works when a menu is already open.

`e.stopPropagation()` on the click handler prevents the event from bubbling
up to the `document` click listener, which would immediately close the menu
you just opened.

`e.target.closest('.menu-popup')` checks if the click was inside any menu
popup (items, scrollbars, etc.). `closest` walks up the DOM tree looking for
the selector — if found, the click was inside the menu and should not close it.

---

## Part 6 — Keyboard navigation

A real menu responds to arrow keys. Add keyboard navigation inside open menus.

```javascript
// ── Menu keyboard navigation ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!_openMenuName) return;

  const popup = _menuPopups[_openMenuName];
  if (!popup) return;

  const items = [...popup.querySelectorAll('.menu-item:not(.disabled)')];
  const focused = popup.querySelector('.menu-item.focused');
  const idx = focused ? items.indexOf(focused) : -1;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = items[(idx + 1) % items.length];
    setFocusedItem(popup, next);

  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = items[(idx - 1 + items.length) % items.length];
    setFocusedItem(popup, prev);

  } else if (e.key === 'Enter' && focused) {
    e.preventDefault();
    focused.click();
  }
});

function setFocusedItem(popup, item) {
  popup.querySelectorAll('.menu-item.focused')
       .forEach(el => el.classList.remove('focused'));
  if (item) {
    item.classList.add('focused');
    item.scrollIntoView({ block: 'nearest' });
  }
}
```

Add CSS for the focused state:

```css
.menu-item.focused {
  background: rgba(51, 119, 255, 0.18);
}
```

Now open a menu and press the arrow keys. Items highlight as you navigate.
Press Enter to activate the focused item.

---

## Part 7 — Programmatic menu item updates

The action system lets you update menu items from anywhere — enable/disable
undo when the undo stack changes, toggle checkmarks when state changes.

```javascript
// ── Menu item state API ───────────────────────────────────────────

function setMenuItemDisabled(id, disabled) {
  const el = _menuItemEls[id];
  if (!el) return;
  el.classList.toggle('disabled', disabled);
}

function setMenuItemChecked(id, checked) {
  const el = _menuItemEls[id];
  if (!el) return;
  el.classList.toggle('checked', checked);
}

function setMenuItemLabel(id, label) {
  const el = _menuItemEls[id];
  if (!el) return;
  const labelEl = el.querySelector('.menu-item-label');
  if (labelEl) labelEl.textContent = label;
}
```

You will use these in later labs. For example:

```javascript
// When the undo stack gets an item:
setMenuItemDisabled('menu-undo', false);
setMenuItemLabel('menu-undo', 'Undo Add Line');

// When the undo stack is empty:
setMenuItemDisabled('menu-undo', true);
setMenuItemLabel('menu-undo', 'Undo');

// When snap is toggled:
setMenuItemChecked('menu-snap', snapEnabled);
```

---

## Part 8 — Wiring the first real actions

Connect some actions to actual behavior so you can test the menu works.

```javascript
// ── Action handlers ───────────────────────────────────────────────

onAction('new', () => {
  if (confirm('Start a new drawing? Unsaved changes will be lost.')) {
    // Will clear entities when the drawing system exists
    setStatus('New drawing');
  }
});

onAction('toggle-gcode-panel', ({ checked }) => {
  const dock = document.getElementById('dock-bottom');
  if (!dock) return;
  dock.style.display = checked ? '' : 'none';
  window.dispatchEvent(new CustomEvent('layout-changed'));
});

onAction('toggle-grid', ({ checked }) => {
  // Will toggle grid rendering when canvas exists
  setStatus(checked ? 'Grid visible' : 'Grid hidden');
});

onAction('fit', () => {
  setStatus('Fit view');
  // Will call fitView() when canvas exists
});

onAction('reset-view', () => {
  setStatus('View reset');
  // Will call resetView() when canvas exists
});

// Status bar helper
function setStatus(msg, duration = 3000) {
  const el = document.getElementById('status-msg');
  if (!el) return;
  el.textContent = msg;
  if (duration > 0) {
    clearTimeout(setStatus._timer);
    setStatus._timer = setTimeout(() => {
      el.textContent = 'Ready — L=Line  C=Circle  A=Arc  V=Select  S=Snap  H=Reset  F=Fit';
    }, duration);
  }
}
```

The `toggle-gcode-panel` action immediately works — it hides and shows the
bottom dock. The others are stubs that will get real implementations in later
labs.

---

## Part 9 — Context menu

A right-click context menu uses the same popup system. Add one for the canvas.

**Add CSS for the context menu. It's the same `.menu-popup` class — no new CSS needed.**

**Add to script:**

```javascript
// ── Context menu ──────────────────────────────────────────────────
let _contextMenu = null;

function showContextMenu(items, x, y) {
  hideContextMenu();

  const popup = document.createElement('div');
  popup.className = 'menu-popup open';
  popup.id = 'context-menu';
  popup.style.left = x + 'px';
  popup.style.top  = y + 'px';

  items.forEach(item => {
    if (item.type === 'separator') {
      const sep = document.createElement('div');
      sep.className = 'menu-sep';
      popup.appendChild(sep);
      return;
    }
    const el = document.createElement('div');
    el.className = 'menu-item' + (item.disabled ? ' disabled' : '');
    el.innerHTML = `<span class="menu-item-label">${item.label}</span>`;
    el.addEventListener('click', () => {
      dispatch(item.action, item.data || {});
      hideContextMenu();
    });
    popup.appendChild(el);
  });

  document.body.appendChild(popup);
  _contextMenu = popup;

  // Clamp to viewport
  requestAnimationFrame(() => {
    const r = popup.getBoundingClientRect();
    if (r.right  > window.innerWidth  - 4) popup.style.left = (x - r.width)  + 'px';
    if (r.bottom > window.innerHeight - 4) popup.style.top  = (y - r.height) + 'px';
  });

  // Close on next click anywhere
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true });
  }, 0);
}

function hideContextMenu() {
  if (_contextMenu) {
    _contextMenu.remove();
    _contextMenu = null;
  }
}

// Wire right-click on the canvas viewport
document.getElementById('viewport')?.addEventListener('contextmenu', e => {
  e.preventDefault();
  showContextMenu([
    { type: 'item', label: 'Select All',  action: 'select-all' },
    { type: 'item', label: 'Delete Selected', action: 'delete' },
    { type: 'separator' },
    { type: 'item', label: 'Fit View',    action: 'fit' },
    { type: 'item', label: 'Reset View',  action: 'reset-view' },
    { type: 'separator' },
    { type: 'item', label: 'Paste',       action: 'paste', disabled: true },
  ], e.clientX, e.clientY);
});
```

Right-click on the canvas area. A context menu appears. Click an item — it
fires the action. Click outside or press Escape — it closes.

The `{ once: true }` option on the outside-click listener means the listener
removes itself after firing once — you don't need to manually `removeEventListener`.

---

## Part 10 — The complete script additions for Lab 9

Here is everything to add to your `<script>` section in the correct order.
Add it after the Lab 8 code (splitters and canvas resize).

```javascript
// ─── PASTE BELOW THE LAB 8 CODE ───────────────────────────────────

// ── Menu definitions
const MENU_DEFINITIONS = { /* ... paste from Part 2 ... */ };

// ── Action system
const _actionHandlers = {};
function dispatch(action, data = {}) {
  (_actionHandlers[action] || []).forEach(fn => fn(data));
  document.dispatchEvent(
    new CustomEvent('cam-action', { detail: { action, data } })
  );
}
function onAction(action, handler) {
  if (!_actionHandlers[action]) _actionHandlers[action] = [];
  _actionHandlers[action].push(handler);
}

// ── Menu DOM builder — paste from Part 4 Step 2
const _menuPopups = {};
const _menuItemEls = {};
function buildMenus() { /* ... */ }

// ── Menu open/close — paste from Part 5
let _openMenuName = null;
function openMenu(name, triggerEl) { /* ... */ }
function positionPopup(popup, trigger) { /* ... */ }
function closeAllMenus() { /* ... */ }

// ── Menu init — paste from Part 5 Step 2
function initMenus() { /* ... */ }

// ── Keyboard nav — paste from Part 6
function setFocusedItem(popup, item) { /* ... */ }

// ── Menu item state API — paste from Part 7
function setMenuItemDisabled(id, disabled) { /* ... */ }
function setMenuItemChecked(id, checked) { /* ... */ }
function setMenuItemLabel(id, label) { /* ... */ }

// ── Action handlers — paste from Part 8
onAction('new', () => { /* ... */ });
onAction('toggle-gcode-panel', ({ checked }) => { /* ... */ });
// ... etc

// ── Status helper — paste from Part 8
function setStatus(msg, duration = 3000) { /* ... */ }

// ── Context menu — paste from Part 9
let _contextMenu = null;
function showContextMenu(items, x, y) { /* ... */ }
function hideContextMenu() { /* ... */ }

// ── Add to init section at the bottom:
initMenus();
```

The init section at the bottom of your script should now be:

```javascript
restoreLayout();
initSplitters();
resizeCanvas();
initMenus();
```

Save and refresh. Click each menubar button — the dropdown opens below it.
Move the mouse to another menu trigger — it switches. Click outside — closes.
Press Escape — closes. Arrow keys navigate items. Right-click on the canvas —
context menu appears. Click "Toggle G-code Panel" in View menu — the bottom
dock hides and shows.

---

## What you learned in this lab

- The action system: `dispatch` fires a named event, `onAction` handles it —
  decouples menu from behavior, same as Qt's QAction
- Menu popups are built once and reused — toggled with `display: none/block`
  via a CSS class
- `position: fixed` + `getBoundingClientRect()` positions menus below their
  triggers regardless of page scroll
- `e.stopPropagation()` prevents the menu trigger's click from bubbling to
  the document's close-all-menus listener
- `e.target.closest('.menu-popup')` checks if a click was inside a menu
- Hover switching: only works when a menu is already open (`_openMenuName`)
- `{ once: true }` on addEventListener automatically removes the listener
  after it fires once
- `requestAnimationFrame` delays a callback until after the browser renders —
  lets you measure element size after it appears
- Context menus are the same system as dropdown menus, dynamically created

## What comes in Lab 10

The tool palette and keyboard shortcuts. Clicking a tool button activates it
(exclusive selection). Keyboard shortcuts switch tools from anywhere. The
status bar updates to show the active tool and show a hint for the current
tool's usage. The Escape key cancels the current tool operation.
