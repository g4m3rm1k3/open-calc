# Lab 04 — Interaction

### CAM System Masterclass

---

## What You Will Build

By the end of this lab, you can:

- **Click on the canvas to draw** geometry instead of typing numbers
- **Snap** to the grid and to existing geometry endpoints
- **Select** geometry by clicking or box-dragging
- **Undo and redo** any change with Ctrl+Z / Ctrl+Y
- **Modify** selected geometry properties in the panel

The app goes from a form-driven geometry editor to an interactive drawing tool.
This is the lab where it starts to feel like real software.

**Time:** 5–8 hours.

---

## Part 1 — Tools vs Modes: the Mental Model

In Lab 02 we added a `mode` field to `state` and mutually exclusive toolbar
buttons. The mode was a string: `'select'`, `'line'`, etc. That is the right
foundation, but we need to think carefully about what a "tool" actually means.

### What is a tool?

A tool is a **stateful interaction handler**. It:

1. Activates when the user selects it from the toolbar
2. Listens to mouse events (click, move, drag)
3. Accumulates input until the action is complete (e.g., click point 1, click
   point 2 → line drawn)
4. Produces a **Command** (explained in Part 5) that is applied to state
5. Deactivates or resets to wait for the next action

Different tools need different amounts of input:

- **Select tool**: click to select, drag to box-select
- **Line tool**: click p1, click p2 → done
- **Circle tool**: click center, click edge (or drag)
- **Arc tool**: click center, click start, click end

### Tool interface

All tools will implement the same interface:

```
activate()          — called when the user selects this tool
deactivate()        — called when switching away from this tool
onMouseDown(e)      — canvas mousedown
onMouseMove(e)      — canvas mousemove (always, not just while dragging)
onMouseUp(e)        — canvas mouseup
onKeyDown(e)        — keyboard input while tool is active
cancel()            — Escape pressed — reset without committing
renderPreview(ctx)  — draw tool preview (ghost line, cursor cross, etc.)
```

This is the **Strategy pattern**: the mouse event handlers in `main.js` simply
forward events to `activeTool.onMouseDown(e)`, etc. The active tool decides
what to do. Swapping tools means swapping the strategy object.

---

## Part 2 — Tool State Machine

Each tool works as a **state machine** — it has a defined set of states and
transitions between them based on events.

The Line tool, for example:

```
  [IDLE] ──── mousedown ────► [WAITING_P2]
                                    │
                         mousedown ─┘ → emit AddLineCommand → [IDLE]
                         Escape    ─┘ → cancel → [IDLE]
```

A state machine avoids a tangle of boolean flags like `hasFirstPoint`,
`isDrawing`, `waitingForSecond`. Instead there is one `phase` variable with
clear values. Reading the code tells you what is happening.

---

## Part 3 — Snap System

Before building tools, we need snapping. Snap means: when the user is about to
place a point, the app finds a "better" position nearby and uses that instead.

### Types of snap (in priority order):

1. **Grid snap** — round to the nearest grid point. Always active, lowest
   priority (overridden by geometry snaps)
2. **Endpoint snap** — snap to the start or end of any geometry object.
   Most common in CAD.
3. **Midpoint snap** — snap to the midpoint of a line or arc
4. **Center snap** — snap to the center of a circle or arc

For now we implement grid snap and endpoint snap. Midpoint and center snap
are left as DIVERGE POINTS.

### How snap works

1. Start with the raw world-space cursor position
2. For each geometry object in `state.geometry`, compute candidate snap points
3. Convert each candidate to canvas pixels and measure distance from cursor
4. If any candidate is within `SNAP_RADIUS` pixels, use the nearest one
5. Otherwise, fall back to grid snap

The snap radius is in **pixels**, not world mm. This means snap sensitivity
does not depend on zoom level — it always feels the same to the user.

Create `cam/js/snap.js`:

```js
// snap.js
// Snap utilities: given a raw world-space cursor, return the snapped world position.
// Also returns information about WHAT was snapped to (for visual feedback).

import { state } from "./state.js";
import { Vector2 } from "./math/Vector2.js";

// Snap radius in screen pixels. If a snap candidate is within this distance,
// we snap to it.
const SNAP_RADIUS = 12;

// How fine a grid to snap to (same nice-unit logic as the grid renderer)
function niceSnapUnit(zoom) {
  // At high zoom, snap to fine grid. At low zoom, snap coarser.
  const roughMm = 80 / zoom; // aim for ~80px between snap points
  const v = [0.1, 0.25, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500];
  return v.find((n) => n >= roughMm) ?? v[v.length - 1];
}

/**
 * Given a canvas-pixel position (cx, cy) and the canvas element,
 * return the best world-space snap position.
 *
 * Returns: { world: Vector2, type: string, source: Geometry | null }
 * type can be: 'endpoint', 'midpoint', 'center', 'grid', 'free'
 */
export function snap(cx, cy, canvas) {
  const { panX, panY, zoom } = state.view;

  // Convert canvas pixel → world mm
  function canvasToWorld(x, y) {
    return new Vector2(
      (x - canvas.width / 2 - panX) / zoom,
      -(y - canvas.height / 2 - panY) / zoom,
    );
  }

  // Convert world mm → canvas pixel
  function worldToCanvas(wx, wy) {
    return {
      x: canvas.width / 2 + wx * zoom + panX,
      y: canvas.height / 2 - wy * zoom + panY,
    };
  }

  // Distance in pixels between a world point and the canvas cursor
  function pixelDist(wx, wy) {
    const cp = worldToCanvas(wx, wy);
    const dx = cp.x - cx;
    const dy = cp.y - cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Gather geometry snap candidates ───────────────────────────────────────

  let bestDist = SNAP_RADIUS + 1;
  let bestWorld = null;
  let bestType = "free";
  let bestSource = null;

  for (const geom of state.geometry) {
    if (!geom.visible) continue;

    const candidates = getSnapCandidates(geom);

    for (const { world, type } of candidates) {
      const d = pixelDist(world.x, world.y);
      if (d < bestDist) {
        bestDist = d;
        bestWorld = world;
        bestType = type;
        bestSource = geom;
      }
    }
  }

  if (bestWorld) {
    return { world: bestWorld, type: bestType, source: bestSource };
  }

  // ── Grid snap fallback ─────────────────────────────────────────────────────

  const rawWorld = canvasToWorld(cx, cy);
  const unit = niceSnapUnit(zoom);
  const snappedX = Math.round(rawWorld.x / unit) * unit;
  const snappedY = Math.round(rawWorld.y / unit) * unit;

  return {
    world: new Vector2(snappedX, snappedY),
    type: "grid",
    source: null,
  };
}

// ── Get snap candidates for a geometry object ─────────────────────────────────

function getSnapCandidates(geom) {
  const candidates = [];

  if (geom.type === "line") {
    candidates.push({ world: geom.p1, type: "endpoint" });
    candidates.push({ world: geom.p2, type: "endpoint" });
    candidates.push({ world: geom.midpoint(), type: "midpoint" });
  }

  if (geom.type === "circle") {
    candidates.push({ world: geom.center, type: "center" });
    // Quadrant points
    const { center, radius } = geom;
    candidates.push({
      world: new Vector2(center.x + radius, center.y),
      type: "endpoint",
    });
    candidates.push({
      world: new Vector2(center.x - radius, center.y),
      type: "endpoint",
    });
    candidates.push({
      world: new Vector2(center.x, center.y + radius),
      type: "endpoint",
    });
    candidates.push({
      world: new Vector2(center.x, center.y - radius),
      type: "endpoint",
    });
  }

  if (geom.type === "arc") {
    candidates.push({ world: geom.center, type: "center" });
    candidates.push({ world: geom.startPoint(), type: "endpoint" });
    candidates.push({ world: geom.endPoint(), type: "endpoint" });
    candidates.push({ world: geom.midPoint(), type: "midpoint" });
  }

  return candidates;
}
```

### Displaying snap feedback

When the user hovers near a snap point, we draw a visual indicator: a small
square for endpoint, a triangle for midpoint, a circle for center.

Add this to `Renderer2D.js` as an exported function:

```js
// In Renderer2D.js — add to exports

// Draw a snap indicator at the given canvas position.
// snapResult: { world, type, source } from snap()
export function drawSnapIndicator(snapResult) {
  if (!snapResult || snapResult.type === "free") return;

  const cp = worldToCanvas(snapResult.world.x, snapResult.world.y);
  const size = 7;

  ctx.save();
  ctx.strokeStyle = getToken("--color-accent");
  ctx.lineWidth = 1.5;

  if (snapResult.type === "endpoint") {
    // Small square
    ctx.strokeRect(cp.x - size / 2, cp.y - size / 2, size, size);
  } else if (snapResult.type === "midpoint") {
    // Small triangle
    ctx.beginPath();
    ctx.moveTo(cp.x, cp.y - size / 2);
    ctx.lineTo(cp.x + size / 2, cp.y + size / 2);
    ctx.lineTo(cp.x - size / 2, cp.y + size / 2);
    ctx.closePath();
    ctx.stroke();
  } else if (snapResult.type === "center") {
    // Circle with cross
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cp.x - size, cp.y);
    ctx.lineTo(cp.x + size, cp.y);
    ctx.moveTo(cp.x, cp.y - size);
    ctx.lineTo(cp.x, cp.y + size);
    ctx.stroke();
  } else if (snapResult.type === "grid") {
    // Small cross-hair
    ctx.strokeStyle = getToken("--color-text-faint");
    ctx.lineWidth = 1;
    const ch = 4;
    ctx.beginPath();
    ctx.moveTo(cp.x - ch, cp.y);
    ctx.lineTo(cp.x + ch, cp.y);
    ctx.moveTo(cp.x, cp.y - ch);
    ctx.lineTo(cp.x, cp.y + ch);
    ctx.stroke();
  }

  ctx.restore();
}
```

---

## Part 4 — The Tool Base Class

Create `cam/js/tools/Tool.js`:

```js
// Tool.js
// Abstract base class for all interactive drawing tools.
// Subclasses override the event handler methods.

export class Tool {
  constructor(name) {
    this.name = name;

    // The canvas element — set by ToolManager.activate()
    this.canvas = null;

    // Callback to request a re-render
    this._requestRender = () => {};

    // Callback to commit a command: (command) => void
    this._commitCommand = () => {};
  }

  // Called by ToolManager when setting up
  _setup(canvas, requestRender, commitCommand) {
    this.canvas = canvas;
    this._requestRender = requestRender;
    this._commitCommand = commitCommand;
  }

  // ── Override these in subclasses ──────────────────────────────────────────

  // Called when this tool becomes active
  activate() {}

  // Called when switching to a different tool
  deactivate() {}

  // Mouse events (e is a MouseEvent, alreadyConverted: false)
  onMouseDown(e) {}
  onMouseMove(e) {}
  onMouseUp(e) {}

  // Keyboard
  onKeyDown(e) {}

  // Cancel (Escape) — reset without committing
  cancel() {}

  // Draw the tool's preview overlay. ctx is the 2D context.
  // This is called at the end of the main render() function.
  renderPreview(ctx) {}
}
```

---

## Part 5 — The Command Pattern and Undo/Redo

This is one of the most important design patterns in any application that lets
users make changes. Before building the tools, we need to understand commands.

### Why undo/redo is hard without a pattern

The naive approach: keep a copy of the entire state before each action. Then
"undo" means restore the previous copy. This works for tiny apps but:

- Memory: storing entire state copies is wasteful
- Granularity: you can't see what changed between steps
- Future: it's impossible to implement "redo a specific action"

### The Command pattern

Every user action is wrapped in a **Command object**. The command knows:

- `execute()`: how to perform the action
- `undo()`: how to reverse it
- `description`: a human-readable name (for a future Edit History panel)

Commands are stored in a stack. Undo pops the last command and calls `undo()`.
Redo re-executes it.

```
historyStack: [cmd1, cmd2, cmd3]    ← undo pops cmd3
redoStack:    [cmd3]                 ← redo re-executes cmd3
```

When a new action is performed after an undo, the redo stack is cleared. (If
you type text after pressing Ctrl+Z, you can't redo the undo.)

### The Command interface

```js
class Command {
  get description() {
    return "";
  }
  execute() {}
  undo() {}
}
```

Create `cam/js/history/Command.js`:

```js
// Command.js
// Base class and concrete commands for undo/redo.

import { state } from "../state.js";

// ── Base Command ──────────────────────────────────────────────────────────────

export class Command {
  get description() {
    return "Command";
  }
  execute() {
    throw new Error("Command.execute() not implemented");
  }
  undo() {
    throw new Error("Command.undo() not implemented");
  }
}

// ── AddGeometryCommand ────────────────────────────────────────────────────────

export class AddGeometryCommand extends Command {
  constructor(geom) {
    super();
    this.geom = geom;
  }

  get description() {
    return `Add ${this.geom.type} #${this.geom.id}`;
  }

  execute() {
    state.geometry.push(this.geom);
  }

  undo() {
    const idx = state.geometry.indexOf(this.geom);
    if (idx !== -1) state.geometry.splice(idx, 1);
  }
}

// ── DeleteGeometryCommand ──────────────────────────────────────────────────────

export class DeleteGeometryCommand extends Command {
  constructor(geoms) {
    super();
    // geoms: array of geometry objects to delete.
    // We record the objects themselves (not just IDs) so we can restore them.
    this.geoms = [...geoms];
    // Also record the original indices so we can restore to the same position.
    this.indices = geoms.map((g) => state.geometry.indexOf(g));
  }

  get description() {
    return `Delete ${this.geoms.length} object(s)`;
  }

  execute() {
    // Remove all the geometry objects from state.
    for (const g of this.geoms) {
      const idx = state.geometry.indexOf(g);
      if (idx !== -1) state.geometry.splice(idx, 1);
    }
  }

  undo() {
    // Restore all objects at their original positions.
    // We insert in reverse order to preserve correct indices.
    const sorted = [...this.geoms]
      .map((g, i) => ({ g, idx: this.indices[i] }))
      .sort((a, b) => a.idx - b.idx);

    for (const { g, idx } of sorted) {
      // Clamp index in case the list shrank
      const insertAt = Math.min(idx, state.geometry.length);
      state.geometry.splice(insertAt, 0, g);
    }
  }
}

// ── MoveGeometryCommand ────────────────────────────────────────────────────────

export class MoveGeometryCommand extends Command {
  constructor(geom, newP1, newP2OrCenter) {
    super();
    this.geom = geom;

    // Save old values so we can restore them on undo.
    if (geom.type === "line") {
      this.oldP1 = geom.p1;
      this.oldP2 = geom.p2;
      this.newP1 = newP1;
      this.newP2 = newP2OrCenter;
    } else if (geom.type === "circle" || geom.type === "arc") {
      this.oldCenter = geom.center;
      this.newCenter = newP1; // newP1 is the new center in this case
    }
  }

  get description() {
    return `Move ${this.geom.type} #${this.geom.id}`;
  }

  execute() {
    if (this.geom.type === "line") {
      this.geom.p1 = this.newP1;
      this.geom.p2 = this.newP2;
    } else {
      this.geom.center = this.newCenter;
    }
  }

  undo() {
    if (this.geom.type === "line") {
      this.geom.p1 = this.oldP1;
      this.geom.p2 = this.oldP2;
    } else {
      this.geom.center = this.oldCenter;
    }
  }
}
```

Now create `cam/js/history/History.js`:

```js
// History.js
// Manages the undo/redo stacks.
// Import { history } anywhere you need to execute commands or undo.

class History {
  constructor() {
    this._undoStack = [];
    this._redoStack = [];

    // Optional callback: called whenever the stacks change
    // Useful for updating "Undo/Redo" button enabled states.
    this.onChange = null;
  }

  // Execute a command and push it onto the undo stack.
  execute(command) {
    command.execute();
    this._undoStack.push(command);
    // Any new action clears the redo stack
    this._redoStack = [];
    this._notify();
  }

  // Undo the most recent command.
  undo() {
    const cmd = this._undoStack.pop();
    if (!cmd) return false;
    cmd.undo();
    this._redoStack.push(cmd);
    this._notify();
    return true;
  }

  // Redo the most recently undone command.
  redo() {
    const cmd = this._redoStack.pop();
    if (!cmd) return false;
    cmd.execute();
    this._undoStack.push(cmd);
    this._notify();
    return true;
  }

  get canUndo() {
    return this._undoStack.length > 0;
  }
  get canRedo() {
    return this._redoStack.length > 0;
  }

  get undoDescription() {
    const cmd = this._undoStack[this._undoStack.length - 1];
    return cmd ? `Undo "${cmd.description}"` : "Nothing to undo";
  }

  get redoDescription() {
    const cmd = this._redoStack[this._redoStack.length - 1];
    return cmd ? `Redo "${cmd.description}"` : "Nothing to redo";
  }

  // Clear both stacks (e.g., when loading a new file)
  clear() {
    this._undoStack = [];
    this._redoStack = [];
    this._notify();
  }

  _notify() {
    if (this.onChange) this.onChange();
  }
}

// Export a single shared instance — there is only one history for the app.
export const history = new History();
```

### Why a singleton?

`history` is exported as a singleton (one shared instance). This is appropriate
because the undo/redo history belongs to the application, not to any particular
component. Any module that creates geometry uses the same history object,
so undo always works regardless of where the action originated.

---

## BUILD 1 — Test Commands in the Browser Console

After wiring the history into `main.js` (Part 9), you will be able to open the
browser console and type:

```js
// This won't work until Part 9 — come back after and try it.
// Just understand the pattern for now.
//
// import { history } from './js/history/History.js';
// import { AddGeometryCommand } from './js/history/Command.js';
// import { Line } from './js/geometry/Line.js';
// import { Vector2 } from './js/math/Vector2.js';
//
// const line = new Line(new Vector2(0,0), new Vector2(10,10));
// history.execute(new AddGeometryCommand(line));
// console.log(state.geometry.length);  // 1
// history.undo();
// console.log(state.geometry.length);  // 0
// history.redo();
// console.log(state.geometry.length);  // 1
```

---

## Part 6 — The Select Tool

The Select tool is always the default tool. It handles:

- Click to select a single geometry object
- Click empty space to deselect all
- Drag to box-select (rubber-band rectangle selects everything inside)
- Delete/Backspace to delete selected objects

Create `cam/js/tools/SelectTool.js`:

```js
// SelectTool.js
// The default selection tool. Click to select, drag to box-select.

import { Tool } from "./Tool.js";
import { state } from "../state.js";
import { history } from "../history/History.js";
import { DeleteGeometryCommand } from "../history/Command.js";
import { snap } from "../snap.js";
import { worldToCanvas, canvasToWorld } from "../renderer/Renderer2D.js";

const DRAG_THRESHOLD = 4; // pixels — drag must move this far to start box-select

export class SelectTool extends Tool {
  constructor() {
    super("select");
    this._phase = "idle"; // 'idle' | 'dragging'
    this._dragStart = null; // canvas pixel coords where drag started
    this._dragEnd = null; // canvas pixel coords current drag position
    this._snapResult = null;
  }

  activate() {
    this._phase = "idle";
    if (this.canvas) this.canvas.style.cursor = "default";
  }

  deactivate() {
    this._phase = "idle";
  }

  onMouseDown(e) {
    if (e.button !== 0) return; // left button only
    const cp = this._eventToCanvas(e);
    this._dragStart = cp;
    this._dragEnd = cp;
    this._phase = "maybe-drag";
  }

  onMouseMove(e) {
    const cp = this._eventToCanvas(e);
    this._snapResult = snap(cp.x, cp.y, this.canvas);

    if (this._phase === "maybe-drag" && this._dragStart) {
      const dx = cp.x - this._dragStart.x;
      const dy = cp.y - this._dragStart.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        this._phase = "dragging";
      }
    }

    if (this._phase === "dragging") {
      this._dragEnd = cp;
    }

    this._requestRender();
  }

  onMouseUp(e) {
    if (e.button !== 0) return;
    const cp = this._eventToCanvas(e);

    if (this._phase === "maybe-drag") {
      // It was a click, not a drag
      this._handleClick(cp, e.shiftKey);
    } else if (this._phase === "dragging") {
      this._handleBoxSelect(e.shiftKey);
    }

    this._phase = "idle";
    this._dragStart = null;
    this._dragEnd = null;
    this._requestRender();
  }

  onKeyDown(e) {
    if (e.key === "Delete" || e.key === "Backspace") {
      this._deleteSelected();
    }
    if (e.key === "Escape") {
      this._deselectAll();
      this._requestRender();
    }
  }

  cancel() {
    this._phase = "idle";
    this._dragStart = null;
    this._dragEnd = null;
    this._deselectAll();
    this._requestRender();
  }

  renderPreview(ctx) {
    // Draw the rubber-band selection rectangle
    if (this._phase === "dragging" && this._dragStart && this._dragEnd) {
      const x = Math.min(this._dragStart.x, this._dragEnd.x);
      const y = Math.min(this._dragStart.y, this._dragEnd.y);
      const w = Math.abs(this._dragEnd.x - this._dragStart.x);
      const h = Math.abs(this._dragEnd.y - this._dragStart.y);

      ctx.save();
      ctx.strokeStyle = "rgba(100, 180, 255, 0.9)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x + 0.5, y + 0.5, w, h);
      ctx.fillStyle = "rgba(100, 180, 255, 0.08)";
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  _eventToCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  _handleClick(cp, addToSelection) {
    const world = canvasToWorld(cp.x, cp.y);
    const CLICK_DIST = 8 / state.view.zoom; // 8 pixels in world mm
    const hit = this._findHitGeometry(world, CLICK_DIST);

    if (!addToSelection) {
      this._deselectAll();
    }

    if (hit) {
      hit.selected = !hit.selected; // toggle if shift-clicking
    }
  }

  _handleBoxSelect(addToSelection) {
    if (!this._dragStart || !this._dragEnd) return;

    // Convert box corners to world space
    const w1 = canvasToWorld(this._dragStart.x, this._dragStart.y);
    const w2 = canvasToWorld(this._dragEnd.x, this._dragEnd.y);

    const minX = Math.min(w1.x, w2.x);
    const maxX = Math.max(w1.x, w2.x);
    const minY = Math.min(w1.y, w2.y);
    const maxY = Math.max(w1.y, w2.y);

    if (!addToSelection) this._deselectAll();

    for (const g of state.geometry) {
      if (!g.visible) continue;
      const bb = g.getBoundingBox();
      // Select if the bounding box is fully inside the selection rectangle
      if (
        bb.minX >= minX &&
        bb.maxX <= maxX &&
        bb.minY >= minY &&
        bb.maxY <= maxY
      ) {
        g.selected = true;
      }
    }
  }

  _findHitGeometry(worldPt, toleranceMm) {
    // Check in reverse order so the topmost-drawn geometry is selected first
    for (let i = state.geometry.length - 1; i >= 0; i--) {
      const g = state.geometry[i];
      if (!g.visible) continue;
      if (this._hitTest(g, worldPt, toleranceMm)) return g;
    }
    return null;
  }

  _hitTest(geom, pt, tol) {
    if (geom.type === "line") {
      return _distPointToSegment(pt, geom.p1, geom.p2) <= tol;
    }
    if (geom.type === "circle") {
      const d = geom.center.distanceTo(pt);
      return Math.abs(d - geom.radius) <= tol;
    }
    if (geom.type === "arc") {
      const d = geom.center.distanceTo(pt);
      if (Math.abs(d - geom.radius) > tol) return false;
      // Also check the angle is within the arc's sweep
      const angle = Math.atan2(pt.y - geom.center.y, pt.x - geom.center.x);
      return geom._containsAngle(angle);
    }
    return false;
  }

  _deselectAll() {
    for (const g of state.geometry) g.selected = false;
  }

  _deleteSelected() {
    const selected = state.geometry.filter((g) => g.selected);
    if (selected.length === 0) return;
    const cmd = new DeleteGeometryCommand(selected);
    this._commitCommand(cmd);
  }
}

// ── Geometry helpers ───────────────────────────────────────────────────────────

// Minimum distance from point P to line segment AB.
// This is used for hit-testing click on a line.
function _distPointToSegment(p, a, b) {
  const ab = b.sub(a);
  const ap = p.sub(a);
  const len2 = ab.magnitudeSquared();

  if (len2 < 1e-20) return ap.magnitude(); // degenerate segment (zero length)

  // Project P onto the line AB, clamped to [0, 1]
  let t = ap.dot(ab) / len2;
  t = Math.max(0, Math.min(1, t));

  // Closest point on the segment
  const closest = a.add(ab.scale(t));
  return p.distanceTo(closest);
}
```

### How the hit test for a line works

Clicking on a thin line in 2D requires projecting the cursor point onto the
line segment and checking whether the closest point is near enough.

Given:

- Point $P$ (cursor)
- Segment from $A$ to $B$

We want the point on $\overline{AB}$ closest to $P$.

$t = \frac{(P-A) \cdot (B-A)}{|B-A|^2}$, clamped to $[0, 1]$

Closest point: $C = A + t(B-A)$

Distance: $|P - C|$

If this distance is ≤ tolerance, the cursor hit the line.

---

## Part 7 — The Line Tool

Create `cam/js/tools/LineTool.js`:

```js
// LineTool.js
// Click to place point 1, click to place point 2 → creates a line.

import { Tool } from "./Tool.js";
import { snap, drawSnapIndicator } from "../snap.js";
import { worldToCanvas, canvasToWorld } from "../renderer/Renderer2D.js";
import { state } from "../state.js";
import { Vector2 } from "../math/Vector2.js";
import { Line } from "../geometry/Line.js";
import { AddGeometryCommand } from "../history/Command.js";

export class LineTool extends Tool {
  constructor() {
    super("line");
    this._phase = "idle"; // 'idle' | 'placing-p2'
    this._p1 = null; // Vector2, first point placed
    this._snapResult = null; // current snap under cursor
  }

  activate() {
    this._phase = "idle";
    this._p1 = null;
    if (this.canvas) this.canvas.style.cursor = "crosshair";
  }

  deactivate() {
    this._phase = "idle";
    this._p1 = null;
  }

  cancel() {
    this._phase = "idle";
    this._p1 = null;
    this._requestRender();
  }

  onMouseMove(e) {
    const cp = this._eventToCanvas(e);
    this._snapResult = snap(cp.x, cp.y, this.canvas);
    this._requestRender();
  }

  onMouseDown(e) {
    if (e.button !== 0) return;

    const cp = this._eventToCanvas(e);
    const snapped = snap(cp.x, cp.y, this.canvas);
    const worldPt = snapped.world;

    if (this._phase === "idle") {
      // Place the first point
      this._p1 = worldPt;
      this._phase = "placing-p2";
    } else {
      // Place the second point — commit the line
      const line = new Line(this._p1, worldPt);
      this._commitCommand(new AddGeometryCommand(line));

      // Reset to place another line from this endpoint (chain mode)
      // Press Escape to stop chaining.
      this._p1 = worldPt;
    }
  }

  onKeyDown(e) {
    if (e.key === "Escape") this.cancel();
  }

  renderPreview(ctx) {
    if (this._phase !== "placing-p2" || !this._p1) return;

    const cp1 = worldToCanvas(this._p1.x, this._p1.y);
    const snap = this._snapResult;
    if (!snap) return;
    const cp2 = worldToCanvas(snap.world.x, snap.world.y);

    // Ghost line from p1 to cursor
    ctx.save();
    ctx.strokeStyle = "rgba(100, 180, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cp1.x, cp1.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.stroke();
    ctx.restore();

    // Mark the first point
    ctx.save();
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    ctx.beginPath();
    ctx.arc(cp1.x, cp1.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw the snap indicator
    drawSnapIndicator(ctx, snap);
  }

  _eventToCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}
```

---

## Part 8 — Circle and Arc Tools

Create `cam/js/tools/CircleTool.js`:

```js
// CircleTool.js
// Click center, click edge → creates a circle.

import { Tool } from "./Tool.js";
import { snap, drawSnapIndicator } from "../snap.js";
import { worldToCanvas } from "../renderer/Renderer2D.js";
import { Vector2 } from "../math/Vector2.js";
import { Circle } from "../geometry/Circle.js";
import { AddGeometryCommand } from "../history/Command.js";

export class CircleTool extends Tool {
  constructor() {
    super("circle");
    this._phase = "idle"; // 'idle' | 'placing-edge'
    this._center = null;
    this._snapResult = null;
  }

  activate() {
    this._phase = "idle";
    this._center = null;
    if (this.canvas) this.canvas.style.cursor = "crosshair";
  }

  deactivate() {
    this._phase = "idle";
    this._center = null;
  }
  cancel() {
    this._phase = "idle";
    this._center = null;
    this._requestRender();
  }

  onMouseMove(e) {
    const cp = this._eventToCanvas(e);
    this._snapResult = snap(cp.x, cp.y, this.canvas);
    this._requestRender();
  }

  onMouseDown(e) {
    if (e.button !== 0) return;
    const cp = this._eventToCanvas(e);
    const snapped = snap(cp.x, cp.y, this.canvas).world;

    if (this._phase === "idle") {
      this._center = snapped;
      this._phase = "placing-edge";
    } else {
      const r = this._center.distanceTo(snapped);
      if (r < 1e-6) return; // zero radius — ignore
      this._commitCommand(new AddGeometryCommand(new Circle(this._center, r)));
      this._phase = "idle";
      this._center = null;
    }
  }

  onKeyDown(e) {
    if (e.key === "Escape") this.cancel();
  }

  renderPreview(ctx) {
    if (this._phase !== "placing-edge" || !this._center || !this._snapResult)
      return;

    const cc = worldToCanvas(this._center.x, this._center.y);
    const edge = worldToCanvas(
      this._snapResult.world.x,
      this._snapResult.world.y,
    );
    const r = Math.sqrt((edge.x - cc.x) ** 2 + (edge.y - cc.y) ** 2);

    if (r < 1) return;

    ctx.save();
    ctx.strokeStyle = "rgba(100, 180, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Center mark
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    ctx.beginPath();
    ctx.arc(cc.x, cc.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawSnapIndicator(ctx, this._snapResult);
  }

  _eventToCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}
```

Create `cam/js/tools/ArcTool.js`:

```js
// ArcTool.js
// Three-click arc: click center, click start point, click end point.

import { Tool } from "./Tool.js";
import { snap, drawSnapIndicator } from "../snap.js";
import { worldToCanvas } from "../renderer/Renderer2D.js";
import { Vector2 } from "../math/Vector2.js";
import { Arc } from "../geometry/Arc.js";
import { AddGeometryCommand } from "../history/Command.js";

export class ArcTool extends Tool {
  constructor() {
    super("arc");
    this._phase = "idle"; // 'idle' | 'placing-start' | 'placing-end'
    this._center = null;
    this._radius = 0;
    this._startAngle = 0;
    this._snapResult = null;
  }

  activate() {
    this._phase = "idle";
    this._center = null;
    if (this.canvas) this.canvas.style.cursor = "crosshair";
  }

  deactivate() {
    this._phase = "idle";
    this._center = null;
  }
  cancel() {
    this._phase = "idle";
    this._center = null;
    this._requestRender();
  }

  onMouseMove(e) {
    const cp = this._eventToCanvas(e);
    this._snapResult = snap(cp.x, cp.y, this.canvas);
    this._requestRender();
  }

  onMouseDown(e) {
    if (e.button !== 0) return;
    const cp = this._eventToCanvas(e);
    const snapped = snap(cp.x, cp.y, this.canvas).world;

    if (this._phase === "idle") {
      this._center = snapped;
      this._phase = "placing-start";
    } else if (this._phase === "placing-start") {
      this._radius = this._center.distanceTo(snapped);
      if (this._radius < 1e-6) return;
      this._startAngle = Math.atan2(
        snapped.y - this._center.y,
        snapped.x - this._center.x,
      );
      this._phase = "placing-end";
    } else {
      const endAngle = Math.atan2(
        snapped.y - this._center.y,
        snapped.x - this._center.x,
      );
      const arc = new Arc(
        this._center,
        this._radius,
        this._startAngle,
        endAngle,
      );
      this._commitCommand(new AddGeometryCommand(arc));
      this._phase = "idle";
      this._center = null;
    }
  }

  onKeyDown(e) {
    if (e.key === "Escape") this.cancel();
  }

  renderPreview(ctx) {
    if (!this._center || !this._snapResult) return;
    const cc = worldToCanvas(this._center.x, this._center.y);

    if (this._phase === "placing-start") {
      // Show line from center to cursor, radius circle
      const edge = worldToCanvas(
        this._snapResult.world.x,
        this._snapResult.world.y,
      );
      const r = Math.sqrt((edge.x - cc.x) ** 2 + (edge.y - cc.y) ** 2);
      if (r < 1) return;
      ctx.save();
      ctx.strokeStyle = "rgba(100, 180, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cc.x, cc.y);
      ctx.lineTo(edge.x, edge.y);
      ctx.stroke();
      ctx.restore();
    }

    if (this._phase === "placing-end") {
      const endPt = this._snapResult.world;
      const endAngle = Math.atan2(
        endPt.y - this._center.y,
        endPt.x - this._center.x,
      );
      const rPx = this._radius * state.view.zoom;

      ctx.save();
      ctx.strokeStyle = "rgba(100, 180, 255, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(cc.x, cc.y, rPx, -this._startAngle, -endAngle, true);
      ctx.stroke();
      ctx.restore();
    }

    // Center mark
    ctx.save();
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    ctx.beginPath();
    ctx.arc(cc.x, cc.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawSnapIndicator(ctx, this._snapResult);
  }

  _eventToCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}

// We need state for the arc preview
import { state } from "../state.js";
```

---

## Part 9 — Tool Manager and Wiring into main.js

Create `cam/js/tools/ToolManager.js`:

```js
// ToolManager.js
// Manages tool lifecycle: registers tools, activates/deactivates them,
// and forwards events to the active tool.

export class ToolManager {
  constructor(canvas, requestRender, commitCommand) {
    this._canvas = canvas;
    this._requestRender = requestRender;
    this._commitCommand = commitCommand;
    this._tools = new Map(); // name → Tool instance
    this._activeTool = null;
  }

  register(tool) {
    tool._setup(this._canvas, this._requestRender, this._commitCommand);
    this._tools.set(tool.name, tool);
  }

  activate(toolName) {
    if (this._activeTool) {
      this._activeTool.deactivate();
    }
    const tool = this._tools.get(toolName);
    if (!tool) {
      console.warn(`ToolManager: unknown tool "${toolName}"`);
      return;
    }
    this._activeTool = tool;
    tool.activate();
  }

  get active() {
    return this._activeTool;
  }

  // Forward events
  onMouseDown(e) {
    this._activeTool?.onMouseDown(e);
  }
  onMouseMove(e) {
    this._activeTool?.onMouseMove(e);
  }
  onMouseUp(e) {
    this._activeTool?.onMouseUp(e);
  }
  onKeyDown(e) {
    this._activeTool?.onKeyDown(e);
  }

  renderPreview(ctx) {
    this._activeTool?.renderPreview(ctx);
  }
}
```

Now update `cam/js/main.js` to wire everything together. This is the complete
new `main.js`:

```js
// main.js — updated for Lab 04

import { state } from "./state.js";
import {
  init as initRenderer,
  render as renderBase,
  worldToCanvas,
  canvasToWorld,
  drawSnapIndicator,
} from "./renderer/Renderer2D.js";
import { init as initPanel, updateObjectsList } from "./ui/panel.js";
import { history } from "./history/History.js";
import { SelectTool } from "./tools/SelectTool.js";
import { LineTool } from "./tools/LineTool.js";
import { CircleTool } from "./tools/CircleTool.js";
import { ArcTool } from "./tools/ArcTool.js";
import { ToolManager } from "./tools/ToolManager.js";

// ── DOM references ─────────────────────────────────────────────────────────
const canvas = document.getElementById("viewport");
const sbX = document.getElementById("sb-x");
const sbY = document.getElementById("sb-y");
const sbZoom = document.getElementById("sb-zoom");
const sbMsg = document.getElementById("sb-msg");

// ── Render function ────────────────────────────────────────────────────────
// The full render: base scene + tool preview + snap indicator

function render() {
  renderBase();

  const ctx = canvas.getContext("2d");
  toolManager.renderPreview(ctx);

  updateObjectsList();
}

// ── Canvas resize ──────────────────────────────────────────────────────────
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

// ── Tool Manager ───────────────────────────────────────────────────────────

// commitCommand: execute a command through history, then render and sync UI
function commitCommand(cmd) {
  history.execute(cmd);
  updateObjectsList();
  render();
}

const toolManager = new ToolManager(canvas, render, commitCommand);
toolManager.register(new SelectTool());
toolManager.register(new LineTool());
toolManager.register(new CircleTool());
toolManager.register(new ArcTool());
toolManager.activate("select");

// ── Mouse events ───────────────────────────────────────────────────────────

function eventToCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// Pan state (middle/right mouse)
let isPanning = false;
let panStart = { x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 1 || e.button === 2) {
    isPanning = true;
    panStart = eventToCanvas(e);
    e.preventDefault();
    return;
  }
  toolManager.onMouseDown(e);
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
    return;
  }

  toolManager.onMouseMove(e);
});

canvas.addEventListener("mouseleave", () => {
  sbX.textContent = "X:       —";
  sbY.textContent = "Y:       —";
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 1 || e.button === 2) {
    isPanning = false;
    return;
  }
  toolManager.onMouseUp(e);
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Zoom ───────────────────────────────────────────────────────────────────
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const cp = eventToCanvas(e);
    const before = canvasToWorld(cp.x, cp.y);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    state.view.zoom = Math.max(1, Math.min(5000, state.view.zoom * factor));
    const after = worldToCanvas(before.x, before.y);
    state.view.panX += cp.x - after.x;
    state.view.panY += cp.y - after.y;
    sbZoom.textContent = `${(state.view.zoom / 50).toFixed(2)}×`;
    render();
  },
  { passive: false },
);

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  // Undo / Redo
  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();
    if (history.undo()) {
      updateObjectsList();
      render();
    }
    sbMsg.textContent = history.undoDescription;
    return;
  }
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.shiftKey && e.key === "z"))
  ) {
    e.preventDefault();
    if (history.redo()) {
      updateObjectsList();
      render();
    }
    sbMsg.textContent = history.redoDescription;
    return;
  }

  // Tool shortcuts
  switch (e.key.toLowerCase()) {
    case "v":
      setTool("select");
      break;
    case "l":
      setTool("line");
      break;
    case "c":
      setTool("circle");
      break;
    case "a":
      setTool("arc");
      break;
    case "escape":
      toolManager.active?.cancel();
      setTool("select");
      break;
  }

  // Pass to active tool
  toolManager.onKeyDown(e);

  // View shortcuts
  switch (e.key) {
    case "f":
    case "F":
    case "Home":
      state.view.panX = 0;
      state.view.panY = 0;
      state.view.zoom = 50;
      sbZoom.textContent = "1.00×";
      render();
      break;
    case "t":
    case "T":
      toggleTheme();
      break;
  }
});

// ── Tool selection ─────────────────────────────────────────────────────────
const TOOLBAR_TOOL_BUTTONS = [
  { btnId: "btn-tool-select", toolName: "select" },
  { btnId: "btn-tool-line", toolName: "line" },
  { btnId: "btn-tool-circle", toolName: "circle" },
  { btnId: "btn-tool-arc", toolName: "arc" },
];

function setTool(toolName) {
  toolManager.activate(toolName);
  state.mode = toolName;

  for (const { btnId, toolName: tn } of TOOLBAR_TOOL_BUTTONS) {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.toggle("active", tn === toolName);
  }

  sbMsg.textContent = `Tool: ${toolName}`;
  render();
}

for (const { btnId, toolName } of TOOLBAR_TOOL_BUTTONS) {
  document
    .getElementById(btnId)
    ?.addEventListener("click", () => setTool(toolName));
}

// ── Theme ──────────────────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === "light" ? "dark" : "light";
  render();
}

document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);

// ── Panel toggle ───────────────────────────────────────────────────────────
const panelLeft = document.getElementById("panel-left");
const btnTogglePanel = document.getElementById("btn-toggle-panel");

btnTogglePanel?.addEventListener("click", () => {
  panelLeft.classList.toggle("collapsed");
  btnTogglePanel.textContent = panelLeft.classList.contains("collapsed")
    ? "›"
    : "‹";
  resizeCanvas();
  render();
});

// ── Initialization panel ───────────────────────────────────────────────────
initRenderer(canvas);
initPanel(commitCommand);

// ── Startup ────────────────────────────────────────────────────────────────
setTool("select");
render();
```

---

## Part 10 — Updated HTML: Tool Buttons

Add the tool buttons to the toolbar in `index.html`. Replace the existing
toolbar groups with:

```html
<div class="tg" id="tg-tools">
  <button
    class="btn-tool active"
    id="btn-tool-select"
    data-tooltip="Select (V)"
    title="Select"
  >
    ↖
  </button>
  <button
    class="btn-tool"
    id="btn-tool-line"
    data-tooltip="Line (L)"
    title="Line"
  >
    ╱
  </button>
  <button
    class="btn-tool"
    id="btn-tool-circle"
    data-tooltip="Circle (C)"
    title="Circle"
  >
    ○
  </button>
  <button class="btn-tool" id="btn-tool-arc" data-tooltip="Arc (A)" title="Arc">
    ◡
  </button>
</div>
```

Add CSS for the active state of tool buttons:

```css
.btn-tool {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-dim);
  border-radius: var(--radius-sm);
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.1s,
    color 0.1s,
    border-color 0.1s;
}

.btn-tool:hover {
  background: var(--color-surface-alt);
  color: var(--color-text);
}

.btn-tool.active {
  background: var(--color-accent-dim);
  color: var(--color-accent);
  border-color: var(--color-accent);
}
```

---

## BUILD 2 — Full Interaction Test

1. Open `index.html` via Live Server
2. Press **L** — cursor becomes a crosshair. Status bar shows "Tool: line"
3. Click on the canvas — a dot appears (first point placed)
4. Move the mouse — a ghost line follows the cursor
5. Hover near any existing geometry endpoint — the snap square appears and
   the ghost line snaps to that point
6. Click to place the second point — the line appears in the geometry list
7. Press **Escape** — exits line tool and returns to select tool
8. Press **Ctrl+Z** — the line disappears (undo)
9. Press **Ctrl+Y** — it reappears (redo)
10. Click a line in the viewport — it highlights orange
11. Press **Delete** — the selected line is deleted (as a command, so undoable)
12. Drag across multiple objects — rubber-band box selects them all

---

## Part 11 — Properties Panel

When geometry is selected, the panel should show its editable properties.
This makes the app a real editor, not just a viewer.

Add to `cam/js/ui/panel.js`:

```js
// Add to panel.js exports:

// Called by main.js after selection changes.
// Shows the properties of the selected geometry in the "Properties" panel section.
export function updatePropertiesPanel(commitCommand) {
  const container = document.getElementById("section-properties");
  if (!container) return;

  const selected = state.geometry.filter((g) => g.selected);

  if (selected.length === 0) {
    container.innerHTML =
      '<p class="panel-empty">Select an object to see properties.</p>';
    return;
  }

  if (selected.length > 1) {
    container.innerHTML = `<p class="panel-empty">${selected.length} objects selected.</p>`;
    return;
  }

  const geom = selected[0];

  // Build the properties form using DOM methods (no innerHTML for user data)
  const fragment = document.createDocumentFragment();

  const title = document.createElement("div");
  title.className = "prop-type";
  title.textContent = geom.describe();
  fragment.appendChild(title);

  // Build fields based on type
  const fields = getPropertyFields(geom);

  for (const field of fields) {
    const row = document.createElement("div");
    row.className = "form-field";

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = field.label;

    const input = document.createElement("input");
    input.className = "form-input";
    input.type = "number";
    input.value = field.get().toFixed(4);
    input.step = field.step ?? 0.1;

    input.addEventListener("change", () => {
      const val = parseFloat(input.value);
      if (isNaN(val)) return;
      // Validate
      if (field.min !== undefined && val < field.min) return;
      field.set(val);
      // Note: direct property edits are not yet wrapped in Commands.
      // That's a DIVERGE POINT.
      updateObjectsList();
      // Trigger re-render via the commitCommand callback... but here we
      // just call render directly since we're in the panel.
      // In practice you'd want a command here for undo support.
      const event = new CustomEvent("cam:render");
      document.dispatchEvent(event);
    });

    row.appendChild(label);
    row.appendChild(input);
    fragment.appendChild(row);
  }

  container.textContent = "";
  container.appendChild(fragment);
}

// Return an array of { label, get, set, step, min } descriptors for a geometry object.
function getPropertyFields(geom) {
  if (geom.type === "line") {
    return [
      {
        label: "X1 (mm)",
        get: () => geom.p1.x,
        set: (v) => (geom.p1 = new Vector2(v, geom.p1.y)),
      },
      {
        label: "Y1 (mm)",
        get: () => geom.p1.y,
        set: (v) => (geom.p1 = new Vector2(geom.p1.x, v)),
      },
      {
        label: "X2 (mm)",
        get: () => geom.p2.x,
        set: (v) => (geom.p2 = new Vector2(v, geom.p2.y)),
      },
      {
        label: "Y2 (mm)",
        get: () => geom.p2.y,
        set: (v) => (geom.p2 = new Vector2(geom.p2.x, v)),
      },
    ];
  }
  if (geom.type === "circle") {
    return [
      {
        label: "CX (mm)",
        get: () => geom.center.x,
        set: (v) => (geom.center = new Vector2(v, geom.center.y)),
      },
      {
        label: "CY (mm)",
        get: () => geom.center.y,
        set: (v) => (geom.center = new Vector2(geom.center.x, v)),
      },
      {
        label: "R (mm)",
        get: () => geom.radius,
        set: (v) => (geom.radius = v),
        step: 0.5,
        min: 0.001,
      },
    ];
  }
  if (geom.type === "arc") {
    return [
      {
        label: "CX (mm)",
        get: () => geom.center.x,
        set: (v) => (geom.center = new Vector2(v, geom.center.y)),
      },
      {
        label: "CY (mm)",
        get: () => geom.center.y,
        set: (v) => (geom.center = new Vector2(geom.center.x, v)),
      },
      {
        label: "R (mm)",
        get: () => geom.radius,
        set: (v) => (geom.radius = v),
        step: 0.5,
        min: 0.001,
      },
      {
        label: "Start (°)",
        get: () => geom.startAngle * (180 / Math.PI),
        set: (v) => (geom.startAngle = v * (Math.PI / 180)),
      },
      {
        label: "End (°)",
        get: () => geom.endAngle * (180 / Math.PI),
        set: (v) => (geom.endAngle = v * (Math.PI / 180)),
      },
    ];
  }
  return [];
}
```

In `main.js`, dispatch `cam:render` and call `updatePropertiesPanel` after
selection changes:

```js
// Add near the end of main.js, after the tool setup:

document.addEventListener("cam:render", () => {
  render();
  updatePropertiesPanel(commitCommand);
});

// And update the render function to also update the properties panel:
function render() {
  renderBase();
  const ctx = canvas.getContext("2d");
  toolManager.renderPreview(ctx);
  updateObjectsList();
  updatePropertiesPanel(commitCommand);
}
```

---

## Part 12 — Python Parallel: Commands and History

```python
# history.py
# Python implementation of the Command pattern and History.
# Run: python3 history.py

from dataclasses import dataclass, field
from typing import List, Optional, Any
from geometry import Vector2, Line, Circle, Geometry


# ── Command base ───────────────────────────────────────────────────────────────

class Command:
    @property
    def description(self) -> str:
        return 'Command'

    def execute(self):
        raise NotImplementedError

    def undo(self):
        raise NotImplementedError


# ── AddGeometryCommand ─────────────────────────────────────────────────────────

class AddGeometryCommand(Command):
    def __init__(self, geometry_list: list, geom: Geometry):
        self.geometry_list = geometry_list  # reference to state's geometry list
        self.geom = geom

    @property
    def description(self) -> str:
        return f'Add {self.geom.type} #{self.geom.id}'

    def execute(self):
        self.geometry_list.append(self.geom)

    def undo(self):
        self.geometry_list.remove(self.geom)


# ── DeleteGeometryCommand ──────────────────────────────────────────────────────

class DeleteGeometryCommand(Command):
    def __init__(self, geometry_list: list, geoms: list):
        self.geometry_list = geometry_list
        self.geoms   = list(geoms)
        self.indices = [geometry_list.index(g) for g in geoms]

    @property
    def description(self) -> str:
        return f'Delete {len(self.geoms)} object(s)'

    def execute(self):
        for g in self.geoms:
            self.geometry_list.remove(g)

    def undo(self):
        for g, idx in sorted(zip(self.geoms, self.indices), key=lambda x: x[1]):
            idx = min(idx, len(self.geometry_list))
            self.geometry_list.insert(idx, g)


# ── History ────────────────────────────────────────────────────────────────────

class History:
    def __init__(self):
        self._undo_stack: List[Command] = []
        self._redo_stack: List[Command] = []

    def execute(self, command: Command):
        command.execute()
        self._undo_stack.append(command)
        self._redo_stack.clear()

    def undo(self) -> bool:
        if not self._undo_stack:
            return False
        cmd = self._undo_stack.pop()
        cmd.undo()
        self._redo_stack.append(cmd)
        return True

    def redo(self) -> bool:
        if not self._redo_stack:
            return False
        cmd = self._redo_stack.pop()
        cmd.execute()
        self._undo_stack.append(cmd)
        return True

    @property
    def can_undo(self) -> bool:
        return bool(self._undo_stack)

    @property
    def can_redo(self) -> bool:
        return bool(self._redo_stack)


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    geometry = []
    h = History()

    line = Line(Vector2(0, 0), Vector2(10, 10))

    # Add
    h.execute(AddGeometryCommand(geometry, line))
    assert len(geometry) == 1, 'geometry has 1 item after add'

    # Undo add
    h.undo()
    assert len(geometry) == 0, 'geometry is empty after undo'
    assert h.can_redo, 'can redo after undo'

    # Redo add
    h.redo()
    assert len(geometry) == 1, 'geometry has 1 item after redo'
    assert not h.can_redo, 'cannot redo after redo'

    # Delete
    h.execute(DeleteGeometryCommand(geometry, [line]))
    assert len(geometry) == 0, 'empty after delete'

    # Undo delete
    h.undo()
    assert len(geometry) == 1, 'restored after undo delete'

    print('All history tests passed!')


if __name__ == '__main__':
    run_tests()
```

---

## Part 13 — C++ Track: Week 4 — References and const-correctness

This week: two C++ concepts you will see constantly — references and `const`.

```cpp
// references.cpp
// Demonstrates C++ references, const references, and why they matter.
// Compile: g++ -std=c++17 -Wall references.cpp -o references
// Run:     ./references

#include <iostream>
#include <vector>
#include <cmath>

struct Vector2 {
    double x, y;
    double magnitude() const { return std::sqrt(x*x + y*y); }
};

// BAD: passes by VALUE. A copy of the whole vector is made.
// For a 2-field struct this is fine, but for a large geometry list it's expensive.
double magnitudeByCopy(Vector2 v) {
    return v.magnitude();
}

// GOOD: passes by CONST REFERENCE. No copy. Can't modify the original.
// Use this for any parameter you only need to read.
double magnitudeByRef(const Vector2& v) {
    return v.magnitude();
}

// Demonstrates modifying via reference
void scaleInPlace(Vector2& v, double s) {
    v.x *= s;
    v.y *= s;
    // Can modify v because it's a non-const reference.
    // The caller's variable is modified.
}

// The difference between a pointer and a reference:
// Pointer: can be null, can be reassigned, uses -> to access members
// Reference: never null, can't be reassigned, uses . to access members
// Prefer references for function parameters.

int main() {
    Vector2 a = { 3, 4 };

    std::cout << "Magnitude by copy: "  << magnitudeByCopy(a) << "\n";
    std::cout << "Magnitude by ref: "   << magnitudeByRef(a)  << "\n";

    scaleInPlace(a, 2.0);
    std::cout << "After scale(2): " << a.x << ", " << a.y << "\n";  // 6, 8

    // Range-based for loop with const reference:
    std::vector<Vector2> points = { {1,0}, {0,1}, {3,4} };
    for (const Vector2& p : points) {
        std::cout << "Length: " << p.magnitude() << "\n";
        // p.x = 5;  // error: p is const
    }

    return 0;
}
```

---

## What You Have After Lab 04

```
cam/
  index.html
  js/
    state.js
    main.js
    math/Vector2.js
    geometry/Geometry.js, Line.js, Circle.js, Arc.js
    renderer/Renderer2D.js
    snap.js
    history/Command.js, History.js
    tools/Tool.js, ToolManager.js
    tools/SelectTool.js, LineTool.js, CircleTool.js, ArcTool.js
    ui/panel.js
```

**Working features:**

- Click on canvas to draw lines, circles, arcs
- Snap to grid (always) and to geometry endpoints, midpoints, centers
- Visual snap indicator (square/triangle/circle/crosshair)
- Rubber-band box selection
- Click to select, Shift+click to multi-select
- Full undo/redo with Ctrl+Z / Ctrl+Y
- Delete selected geometry with Delete key (undoable)
- Editable properties in the panel for selected geometry
- Tool keyboard shortcuts: V (select), L (line), C (circle), A (arc)
- Escape cancels current tool action, returns to select

---

## DIVERGE POINTS

**1. Wrap property edits in commands:** Right now editing a property in the panel
is not undoable. Creating a `ModifyPropertyCommand` that stores old/new values
and wraps property edits would make the properties panel fully undo-able.

**2. Endpoint chain mode:** The line tool currently places the next line's start
at the last placed end. A `chainMode` toggle could let the user press Enter
to stop chaining vs Escape to cancel the current segment.

**3. Ortho mode:** Holding Shift while drawing a line could constrain it to
0°/45°/90°. The snap function would need an `orthoConstrain(from, raw)` helper.

**4. More snap types:** Intersection snap (where two geometry objects cross),
tangent snap (point on a circle tangent from another point), and perpendicular
snap are all standard CAD snap types. They require more geometry math.

**5. Selection set operations:** Currently selecting deselects everything.
Shift+click to toggle individual objects, Ctrl+A to select all.

---

_Continue to [Lab 05 — Tools and Operations](LAB-05-TOOLS-AND-OPERATIONS.md)._
