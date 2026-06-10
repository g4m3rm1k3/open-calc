# UI Lab 12 — The Properties Panel
## Selection Drives the UI

---

**What you will build.**

When you click an entity on the canvas, the Properties panel fills with that
entity's data. Edit a number — the entity updates on the canvas in real time.
Change the layer — the entity moves to that layer. Select multiple entities —
the panel shows what they have in common. Deselect everything — the empty
state returns. This is the live properties inspector that makes a CAD tool
feel professional.

**Concepts this lab teaches:**
- The inspector pattern: UI driven entirely by selection state
- Building form rows dynamically from data
- Two-way binding: input changes update the model, model changes update the input
- Handling multiple selection in a properties panel
- The command pattern for property changes (so they are undoable)
- Updating specific inputs without rebuilding the whole panel

---

## Part 1 — The inspector pattern

The properties panel is not a form you design once. It is a view that rebuilds
itself whenever the selection changes. The data drives the UI.

```
selection changes
    → read selected entities
    → determine what fields to show
    → build the form
    → connect each field to update its entity on change
```

When a field changes:
```
user edits input
    → save undo snapshot
    → update entity in entities[]
    → redraw canvas
    → do NOT rebuild the form (too expensive, loses focus)
```

The key insight: rebuilding the form on selection change is fine because it
happens infrequently. Rebuilding it on every keypress in an input would be
terrible — it would clear focus and cursor position. So you rebuild on
selection change and do targeted updates on input change.

---

## Part 2 — Triggering the panel update

The properties panel needs to update whenever selection changes. Selection
changes in two places: canvas click (Lab 11's `handleSelectClick`) and
select-all / delete actions. Add a call to `updatePropertiesPanel()` at the
end of each:

In `handleSelectClick`:
```javascript
function handleSelectClick(wx, wy, e) {
  const hit = hitTest(wx, wy);
  if (!e.shiftKey) selected.clear();
  if (hit) {
    if (selected.has(hit.id)) selected.delete(hit.id);
    else selected.add(hit.id);
  }
  markDirty();
  updatePropertiesPanel();   // ← add this
}
```

In the delete action handler:
```javascript
onAction('delete', () => {
  if (selected.size === 0) return;
  saveUndo('Delete');
  deleteEntities([...selected]);
  updatePropertiesPanel();   // ← add this
});
```

In `onAction('select-all')`:
```javascript
onAction('select-all', () => {
  entities.forEach(e => selected.add(e.id));
  markDirty();
  updatePropertiesPanel();   // ← add this
});
```

---

## Part 3 — The panel builder

This is the main function. It reads the current selection, decides what to
show, and builds the DOM.

```javascript
// ── Properties panel ──────────────────────────────────────────────
function updatePropertiesPanel() {
  const emptyEl   = document.getElementById('props-empty');
  const contentEl = document.getElementById('props-content');
  if (!emptyEl || !contentEl) return;

  const selectedEntities = entities.filter(e => selected.has(e.id));

  if (selectedEntities.length === 0) {
    // Nothing selected — show empty state
    emptyEl.style.display   = '';
    contentEl.style.display = 'none';
    contentEl.innerHTML     = '';
    return;
  }

  emptyEl.style.display   = 'none';
  contentEl.style.display = '';

  if (selectedEntities.length === 1) {
    buildSingleEntityPanel(contentEl, selectedEntities[0]);
  } else {
    buildMultiEntityPanel(contentEl, selectedEntities);
  }
}
```

---

## Part 4 — Single entity panel

```javascript
function buildSingleEntityPanel(container, ent) {
  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'props-entity-header';
  header.innerHTML = `
    <span class="props-entity-type">${ent.type.charAt(0).toUpperCase() + ent.type.slice(1)}</span>
    <span class="props-entity-id">#${ent.id}</span>
  `;
  container.appendChild(header);

  // Geometry section
  const geoSection = buildSection('Geometry', true);
  buildGeometryFields(geoSection.body, ent);
  container.appendChild(geoSection.el);

  // Style section
  const styleSection = buildSection('Style', false);
  buildStyleFields(styleSection.body, ent);
  container.appendChild(styleSection.el);

  // Info section
  const infoSection = buildSection('Info', false);
  buildInfoFields(infoSection.body, ent);
  container.appendChild(infoSection.el);

  // Initialize section collapse behavior
  container.querySelectorAll('.section-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const expanded = hdr.getAttribute('aria-expanded') === 'true';
      hdr.setAttribute('aria-expanded', String(!expanded));
    });
  });
}
```

---

## Part 5 — Building sections programmatically

```javascript
function buildSection(title, openByDefault) {
  const details = document.createElement('details');
  details.className = 'section';
  if (openByDefault) details.open = true;

  const summary = document.createElement('summary');
  summary.className = 'section-header';
  summary.setAttribute('aria-expanded', String(openByDefault));
  summary.textContent = title;

  const body = document.createElement('div');
  body.className = 'section-body';

  details.appendChild(summary);
  details.appendChild(body);

  return { el: details, body };
}
```

---

## Part 6 — Geometry fields per entity type

```javascript
function buildGeometryFields(body, ent) {
  const grid = document.createElement('div');
  grid.className = 'prop-grid';

  switch (ent.type) {

    case 'line':
      addPropRow(grid, 'X1', ent, 'x1', 'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'Y1', ent, 'y1', 'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'X2', ent, 'x2', 'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'Y2', ent, 'y2', 'number', { step: 0.1, suffix: 'mm' });
      addReadonlyRow(grid, 'Length',
        Math.hypot(ent.x2 - ent.x1, ent.y2 - ent.y1).toFixed(4) + ' mm');
      break;

    case 'circle':
      addPropRow(grid, 'CX',     ent, 'cx', 'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'CY',     ent, 'cy', 'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'Radius', ent, 'r',  'number', { step: 0.1, min: 0.001, suffix: 'mm' });
      addReadonlyRow(grid, 'Circumference',
        (2 * Math.PI * ent.r).toFixed(4) + ' mm');
      addReadonlyRow(grid, 'Area',
        (Math.PI * ent.r * ent.r).toFixed(4) + ' mm²');
      break;

    case 'arc':
      addPropRow(grid, 'CX',        ent, 'cx',       'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'CY',        ent, 'cy',       'number', { step: 0.1, suffix: 'mm' });
      addPropRow(grid, 'Radius',    ent, 'r',        'number', { step: 0.1, min: 0.001, suffix: 'mm' });
      addPropRow(grid, 'Start',     ent, 'startDeg', 'number', { step: 1, suffix: '°' });
      addPropRow(grid, 'End',       ent, 'endDeg',   'number', { step: 1, suffix: '°' });
      const sweep = calcArcSweep(ent);
      addReadonlyRow(grid, 'Sweep',  sweep.toFixed(2) + '°');
      addReadonlyRow(grid, 'Length', (ent.r * sweep * Math.PI / 180).toFixed(4) + ' mm');
      break;

    case 'polyline':
      addReadonlyRow(grid, 'Points', ent.points.length.toString());
      addReadonlyRow(grid, 'Length', calcPolylineLength(ent).toFixed(4) + ' mm');
      break;
  }

  body.appendChild(grid);
}

function calcArcSweep(ent) {
  let sweep = ent.ccw
    ? ent.endDeg - ent.startDeg
    : ent.startDeg - ent.endDeg;
  if (sweep <= 0) sweep += 360;
  return sweep;
}

function calcPolylineLength(ent) {
  let total = 0;
  for (let i = 0; i + 1 < ent.points.length; i++) {
    total += Math.hypot(
      ent.points[i+1].x - ent.points[i].x,
      ent.points[i+1].y - ent.points[i].y
    );
  }
  return total;
}
```

---

## Part 7 — Style and info fields

```javascript
function buildStyleFields(body, ent) {
  const grid = document.createElement('div');
  grid.className = 'prop-grid';
  addPropRow(grid, 'Layer', ent, 'layer', 'select', {
    options: ['Layer 0', 'Layer 1', 'Layer 2'],
  });
  addPropRow(grid, 'Color', ent, 'color', 'color', {});
  body.appendChild(grid);
}

function buildInfoFields(body, ent) {
  const grid = document.createElement('div');
  grid.className = 'prop-grid';
  addReadonlyRow(grid, 'ID',   String(ent.id));
  addReadonlyRow(grid, 'Type', ent.type);
  body.appendChild(grid);
}
```

---

## Part 8 — The field builders

These are the workhorses. Each creates a row in the prop-grid and wires
the input to update the entity.

```javascript
// ── Field builders ────────────────────────────────────────────────

function addPropRow(grid, label, ent, key, type, opts = {}) {
  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  let inputEl;

  if (type === 'number') {
    inputEl = document.createElement('input');
    inputEl.type      = 'number';
    inputEl.className = 'form-input';
    inputEl.value     = ent[key] !== undefined ? Number(ent[key]).toFixed(
      opts.decimals !== undefined ? opts.decimals : 3
    ) : '';
    if (opts.step !== undefined) inputEl.step = opts.step;
    if (opts.min  !== undefined) inputEl.min  = opts.min;
    if (opts.max  !== undefined) inputEl.max  = opts.max;

    // Update entity on change
    inputEl.addEventListener('change', () => {
      const val = parseFloat(inputEl.value);
      if (isNaN(val)) return;
      saveUndo(`Edit ${label}`);
      ent[key] = val;
      markDirty();
      // Refresh readonly derived fields without rebuilding the whole panel
      refreshDerivedFields(ent);
    });

    // Live preview while typing (no undo save yet)
    inputEl.addEventListener('input', () => {
      const val = parseFloat(inputEl.value);
      if (!isNaN(val)) {
        ent[key] = val;
        markDirty();
      }
    });

  } else if (type === 'select') {
    inputEl = document.createElement('select');
    inputEl.className = 'form-select';
    (opts.options || []).forEach(opt => {
      const o = new Option(opt, opt, false, opt === ent[key]);
      inputEl.appendChild(o);
    });
    inputEl.addEventListener('change', () => {
      saveUndo(`Edit ${label}`);
      ent[key] = inputEl.value;
      markDirty();
    });

  } else if (type === 'color') {
    inputEl = document.createElement('input');
    inputEl.type      = 'color';
    inputEl.className = 'form-color';
    inputEl.value     = ent[key] || '#3377ff';
    inputEl.addEventListener('input', () => {
      ent[key] = inputEl.value;
      markDirty();
    });
    inputEl.addEventListener('change', () => {
      saveUndo(`Edit ${label}`);
    });
  }

  const unitEl = document.createElement('span');
  unitEl.className   = 'form-unit';
  unitEl.textContent = opts.suffix || '';

  grid.appendChild(labelEl);
  grid.appendChild(inputEl);
  grid.appendChild(unitEl);

  // Store reference for derived field updates
  inputEl.dataset.propKey = key;
  inputEl.dataset.entId   = ent.id;
}

function addReadonlyRow(grid, label, value, dataKey) {
  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className   = 'props-value';
  valueEl.textContent = value;
  if (dataKey) valueEl.dataset.derivedKey = dataKey;

  const unitEl = document.createElement('span');
  unitEl.className = 'form-unit';

  grid.appendChild(labelEl);
  grid.appendChild(valueEl);
  grid.appendChild(unitEl);
}
```

---

## Part 9 — Refreshing derived fields

When a user edits the radius of a circle, the Circumference and Area fields
should update immediately — but without rebuilding the whole form (which would
reset focus).

```javascript
function refreshDerivedFields(ent) {
  const contentEl = document.getElementById('props-content');
  if (!contentEl) return;

  // Find all readonly value elements and update them
  switch (ent.type) {
    case 'line': {
      const len = Math.hypot(ent.x2 - ent.x1, ent.y2 - ent.y1);
      setDerivedValue(contentEl, 'Length', len.toFixed(4) + ' mm');
      break;
    }
    case 'circle': {
      setDerivedValue(contentEl, 'Circumference',
        (2 * Math.PI * ent.r).toFixed(4) + ' mm');
      setDerivedValue(contentEl, 'Area',
        (Math.PI * ent.r * ent.r).toFixed(4) + ' mm²');
      break;
    }
    case 'arc': {
      const sweep = calcArcSweep(ent);
      setDerivedValue(contentEl, 'Sweep',  sweep.toFixed(2) + '°');
      setDerivedValue(contentEl, 'Length', (ent.r * sweep * Math.PI / 180).toFixed(4) + ' mm');
      break;
    }
  }
}

function setDerivedValue(container, label, value) {
  // Find the label in the prop-grid and update the adjacent value span
  const labels = container.querySelectorAll('.prop-grid label');
  for (const lbl of labels) {
    if (lbl.textContent === label) {
      const valueEl = lbl.nextElementSibling;
      if (valueEl && valueEl.classList.contains('props-value')) {
        valueEl.textContent = value;
      }
      break;
    }
  }
}
```

---

## Part 10 — Multiple selection panel

When multiple entities are selected, show what they share in common and
allow batch editing of common properties.

```javascript
function buildMultiEntityPanel(container, entities) {
  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'props-entity-header';
  header.innerHTML = `
    <span class="props-entity-type">${entities.length} entities selected</span>
    <span class="props-entity-id">${countByType(entities)}</span>
  `;
  container.appendChild(header);

  // Only show style section for multi-select
  const styleSection = buildSection('Style', true);
  const grid = document.createElement('div');
  grid.className = 'prop-grid';

  // Layer — show if all entities have the same layer, or show "(mixed)"
  const layers = [...new Set(entities.map(e => e.layer || 'Layer 0'))];
  const layerLabel = document.createElement('label');
  layerLabel.textContent = 'Layer';
  const layerSel = document.createElement('select');
  layerSel.className = 'form-select';

  if (layers.length === 1) {
    // All same layer
    ['Layer 0', 'Layer 1', 'Layer 2'].forEach(opt => {
      layerSel.appendChild(new Option(opt, opt, false, opt === layers[0]));
    });
  } else {
    // Mixed — show a "(mixed)" option first
    layerSel.appendChild(new Option('(mixed)', '', true, true));
    ['Layer 0', 'Layer 1', 'Layer 2'].forEach(opt => {
      layerSel.appendChild(new Option(opt, opt));
    });
  }

  layerSel.addEventListener('change', () => {
    if (!layerSel.value) return;
    saveUndo('Edit Layer');
    entities.forEach(e => { e.layer = layerSel.value; });
    markDirty();
  });

  grid.appendChild(layerLabel);
  grid.appendChild(layerSel);
  grid.appendChild(document.createElement('span'));

  styleSection.body.appendChild(grid);
  container.appendChild(styleSection.el);

  // Info
  const infoSection = buildSection('Info', false);
  const infoGrid = document.createElement('div');
  infoGrid.className = 'prop-grid';
  addReadonlyRow(infoGrid, 'Count', entities.length.toString());
  addReadonlyRow(infoGrid, 'Types', countByType(entities));
  infoSection.body.appendChild(infoGrid);
  container.appendChild(infoSection.el);
}

function countByType(entities) {
  const counts = {};
  entities.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
  return Object.entries(counts)
    .map(([type, n]) => `${n} ${type}${n > 1 ? 's' : ''}`)
    .join(', ');
}
```

---

## Part 11 — CSS for the properties panel

Add these to your `<style>` section.

```css
/* ── Properties panel ────────────────────────────────────────────── */
.props-entity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.props-entity-type {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
}

.props-entity-id {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.props-value {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Color input */
.form-color {
  height: 24px;
  width: 100%;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  background: var(--bg-input);
  cursor: pointer;
  padding: 1px 2px;
}

/* Live edit highlight — flash when a value is updated externally */
@keyframes flash-update {
  0%   { background: rgba(51,119,255,0.3); }
  100% { background: transparent; }
}

.form-input.updated {
  animation: flash-update 400ms ease forwards;
}
```

---

## Part 12 — Tab switching (now needed)

The tabs were styled in Lab 7 but not wired. Now you need them working so
you can switch to the Properties tab when an entity is selected.

```javascript
// ── Tab switching ─────────────────────────────────────────────────
function initTabs() {
  const tabBar = document.querySelector('.tab-bar');
  if (!tabBar) return;

  tabBar.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    const targetId = 'tab-' + tab.dataset.tab;

    // Deactivate all tabs and panels
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.remove('active');
    });

    // Activate clicked tab and its panel
    tab.classList.add('active');
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.add('active');
  });
}

// Auto-switch to Properties tab when selection changes
function switchToPropertiesTab() {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === 'properties');
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === 'tab-properties');
  });
}
```

Call `switchToPropertiesTab()` in `handleSelectClick` after `updatePropertiesPanel()`:

```javascript
function handleSelectClick(wx, wy, e) {
  const hit = hitTest(wx, wy);
  if (!e.shiftKey) selected.clear();
  if (hit) {
    if (selected.has(hit.id)) selected.delete(hit.id);
    else selected.add(hit.id);
    switchToPropertiesTab();    // ← auto-switch when something is selected
  }
  markDirty();
  updatePropertiesPanel();
}
```

---

## Part 13 — Keeping inputs in sync with canvas edits

When a user drags a grip point on the canvas (a feature you can add later),
the entity updates. The properties panel inputs need to reflect that change.
Build a general-purpose function for this:

```javascript
function syncPropertiesPanel(ent) {
  const contentEl = document.getElementById('props-content');
  if (!contentEl) return;

  // Find all inputs bound to this entity
  contentEl.querySelectorAll('[data-ent-id]').forEach(input => {
    if (parseInt(input.dataset.entId) !== ent.id) return;
    if (document.activeElement === input) return; // don't overwrite while typing

    const key = input.dataset.propKey;
    if (key === undefined || ent[key] === undefined) return;

    const newVal = typeof ent[key] === 'number'
      ? ent[key].toFixed(3)
      : ent[key];

    if (input.value !== newVal) {
      input.value = newVal;
      // Flash to show it changed
      input.classList.remove('updated');
      requestAnimationFrame(() => input.classList.add('updated'));
    }
  });

  refreshDerivedFields(ent);
}
```

---

## Part 14 — Add to init

Update the bottom of your script:

```javascript
restoreLayout();
initSplitters();
resizeCanvas();
initMenus();
initToolPalette();
initKeyboardShortcuts();
initToolbarButtons();
initTabs();           // ← new
setTool('select');
initCanvasInput();
requestAnimationFrame(renderLoop);
```

Save and refresh. Draw a line. Click it with the Select tool — it turns yellow
and the Properties tab appears with Geometry, Style, and Info sections. The
Geometry section shows X1, Y1, X2, Y2 as editable fields and Length as a
readonly derived value. Edit X2 — the line updates on the canvas as you type.
Press Tab — the next field focuses. Draw a circle, click it — different fields
appear. Select both — the multi-selection panel shows count and common layer.

---

## What you learned in this lab

- The inspector pattern: rebuild the UI on selection change, not on every
  input change — these have very different frequencies
- `buildSection` / `addPropRow` / `addReadonlyRow` are reusable builders —
  adding a new entity type means adding a `case` in `buildGeometryFields`
- Two events on inputs: `input` for live preview (no undo), `change` for
  committed edits (save undo). This gives responsiveness without polluting
  the undo stack with every keystroke
- `document.activeElement === input` prevents overwriting an input the user
  is currently typing in
- Derived fields (Length, Area, etc.) are updated separately from editable
  fields — `setDerivedValue` finds them by label text without rebuilding
- Multi-selection: `[...new Set(entities.map(e => e.layer))]` finds
  unique values — if length > 1, show "(mixed)"
- `animation` on `.updated` class: CSS keyframe flash communicates that a
  value changed without the user touching it

## What comes in Lab 13

The final lab. G-code generation wired to the action system. G-code loading
and parsing. The simulation playback with the speed slider. Export and
download. Everything plugged together into one complete, working CAD/CAM tool.
