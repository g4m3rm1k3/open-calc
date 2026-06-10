# Lab 06 — G-code Backplotter

### CAM System Masterclass

---

## What You Will Build

By the end of this lab, you can:

- **Load a G-code file** from your computer into the browser
- **Parse** every command, tracking machine modal state
- **Backplot** the toolpath as coloured geometry (rapids in red, feeds in
  cyan, arcs as arcs)
- **Inspect** each move by hovering or clicking: see the line number, G-code,
  feed rate, and coordinates

The backplotter is the "read" half of a CAM system: it lets you verify what a
CNC machine will actually do with a program.

**Time:** 5–7 hours.

---

## Part 1 — What is G-code?

G-code is the language CNC machines speak. It looks like this:

```gcode
G21               ; units: millimetres
G90               ; absolute positioning
G0 X0 Y0 Z5       ; rapid move to start
G1 Z-2 F100       ; feed (cut) down into material at 100mm/min
G1 X50 F200       ; feed along X axis
G2 X60 Y10 I10 J0 ; clockwise arc: move to (60,10), centre offset (10,0)
G0 Z5             ; rapid up
M30               ; end of program
```

### Key vocabulary

| Word          | Meaning                                                      |
| ------------- | ------------------------------------------------------------ |
| `G0`          | Rapid move (move as fast as the machine allows — no cutting) |
| `G1`          | Linear feed (controlled speed, cutting)                      |
| `G2`          | Clockwise arc feed                                           |
| `G3`          | Counter-clockwise arc feed                                   |
| `G17`         | Select XY plane for arcs                                     |
| `G20` / `G21` | Units: inches / millimetres                                  |
| `G90` / `G91` | Absolute / incremental positioning                           |
| `M2` / `M30`  | End of program                                               |
| `Xn Yn Zn`    | Move to these coordinates                                    |
| `In Jn`       | Arc centre offset from current position                      |
| `Fn`          | Feed rate (mm/min or in/min)                                 |
| `Sn`          | Spindle speed (rpm)                                          |

### Modal state

G-code is **modal**: many codes stay active until changed. If you write
`G1 X10` then `X20` (no `G1`), the second line is still a feed because `G1`
is still the active mode.

The parser must track a **modal state dictionary** that records the current
active codes for each group:

```
modal.motion    = 'G0' | 'G1' | 'G2' | 'G3'  (last motion command)
modal.units     = 'G20' | 'G21'               (inches | mm)
modal.distance  = 'G90' | 'G91'               (absolute | incremental)
modal.plane     = 'G17' | 'G18' | 'G19'       (XY | XZ | YZ)
modal.position  = { x, y, z }                  (current machine position)
modal.feed      = number                        (last F value)
modal.spindle   = number                        (last S value)
```

---

## Part 2 — The Tokenizer

Parsing happens in two steps:

1. **Tokenize**: split raw text into words (letter+number pairs)
2. **Parse**: process a block (line) of tokens, update modal state, emit moves

### What a token is

A G-code file consists of **blocks** (one line = one block). Each block
contains **words**: a letter followed by a number. Words in a block can
come in any order within a block.

```
G1 X10.5 Y-3.25 F150
→ tokens: [G:1, X:10.5, Y:-3.25, F:150]
```

Create `cam/js/gcode/Tokenizer.js`:

```js
// Tokenizer.js
// Split a raw G-code text file into an array of blocks.
// Each block is an array of { letter, value } token objects.

// ── Comment stripping ─────────────────────────────────────────────────────

// G-code comments can be in parentheses (most common) or after a semicolon.
// We strip them before tokenizing.
function stripComments(line) {
  // Remove (parenthetical comments)
  line = line.replace(/\(.*?\)/g, "");
  // Remove ; to end of line
  const semi = line.indexOf(";");
  if (semi !== -1) line = line.slice(0, semi);
  return line;
}

// ── Tokenize one block (one G-code line) ─────────────────────────────────

// Returns an array of { letter, value } objects, or empty array.
// Example: "G1 X10.5 Y-3" → [{ letter:'G', value:1 }, { letter:'X', value:10.5 }, ...]
function tokenizeBlock(line) {
  const clean = stripComments(line).trim().toUpperCase();
  if (!clean) return [];

  const tokens = [];

  // Regex: a single letter followed by an optional sign and a decimal number.
  // The 'g' flag means find ALL matches in the string.
  const RE = /([A-Z])([-+]?[0-9]*\.?[0-9]+)/g;
  let match;

  while ((match = RE.exec(clean)) !== null) {
    tokens.push({
      letter: match[1],
      value: parseFloat(match[2]),
    });
  }

  return tokens;
}

// ── Tokenize a full G-code program text ─────────────────────────────────────

// Returns an array of blocks, each block is an array of tokens.
// Empty blocks (blank lines, comment-only lines) are filtered out.
export function tokenize(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];

  for (let i = 0; i < lines.length; i++) {
    const tokens = tokenizeBlock(lines[i]);
    if (tokens.length > 0) {
      blocks.push({ lineNumber: i + 1, tokens, raw: lines[i] });
    }
  }

  return blocks;
}
```

### Testing the tokenizer

Try this in your browser console after importing:

```js
// test-tokenizer.js (you can run this inline or as test-tokenizer.html)
import { tokenize } from "./js/gcode/Tokenizer.js";

const gcode = `
G21 G90
G0 X0 Y0 Z5
G1 Z-2 F100
G1 X50 F200
G2 X60 Y10 I10 J0
M30
`;

const blocks = tokenize(gcode);
for (const b of blocks) {
  console.log(`Line ${b.lineNumber}:`, b.tokens);
}
```

Expected output:

```
Line 2: [{letter:'G', value:21}, {letter:'G', value:90}]
Line 3: [{letter:'G', value:0}, {letter:'X', value:0}, ...]
...
```

---

## Part 3 — The Parser: Modal State Machine

The parser processes blocks one at a time and:

1. Updates the modal state (current G/M modes, position, feed)
2. Emits a **move** object for each motion command

Create `cam/js/gcode/Parser.js`:

```js
// Parser.js
// Parses tokenized G-code blocks and emits a flat list of moves.
// Each move describes one machine motion (rapid, feed, arc).

import { tokenize } from "./Tokenizer.js";

// ── Modal state defaults ───────────────────────────────────────────────────

function defaultModal() {
  return {
    motion: "G0", // last motion type
    units: "G21", // mm
    distance: "G90", // absolute
    plane: "G17", // XY
    position: { x: 0, y: 0, z: 0 },
    feed: 0,
    spindle: 0,
  };
}

// ── Parse ──────────────────────────────────────────────────────────────────

export function parse(gcode) {
  const blocks = tokenize(gcode);
  const modal = defaultModal();
  const moves = [];

  for (const block of blocks) {
    processBlock(block, modal, moves);
  }

  return moves;
}

// ── Process one block ──────────────────────────────────────────────────────

function processBlock(block, modal, moves) {
  const { lineNumber, tokens, raw } = block;

  // Extract all words from the block into a convenient lookup
  const words = {};
  for (const t of tokens) {
    // Multiple G/M codes can appear in one block (e.g., G1 M3)
    // We handle them in order below.
    if (t.letter === "G" || t.letter === "M") {
      const key = t.letter + t.value;
      words[key] = t.value;
    } else {
      words[t.letter] = t.value;
    }
  }

  // ── Update modal state from this block ───────────────────────────────────

  // Units
  if ("G20" in words) modal.units = "G20";
  if ("G21" in words) modal.units = "G21";

  // Distance mode
  if ("G90" in words) modal.distance = "G90";
  if ("G91" in words) modal.distance = "G91";

  // Plane selection
  if ("G17" in words) modal.plane = "G17";
  if ("G18" in words) modal.plane = "G18";
  if ("G19" in words) modal.plane = "G19";

  // Feed rate
  if ("F" in words) modal.feed = words["F"];
  if ("S" in words) modal.spindle = words["S"];

  // ── Motion commands ───────────────────────────────────────────────────────

  // Determine the motion type for this block
  let motionType = null;

  if ("G0" in words) {
    motionType = "G0";
    modal.motion = "G0";
  }
  if ("G1" in words) {
    motionType = "G1";
    modal.motion = "G1";
  }
  if ("G2" in words) {
    motionType = "G2";
    modal.motion = "G2";
  }
  if ("G3" in words) {
    motionType = "G3";
    modal.motion = "G3";
  }

  // If this block has XYZ/IJ words but no motion code, inherit the last motion
  const hasPositionWords = "X" in words || "Y" in words || "Z" in words;
  if (hasPositionWords && motionType === null) {
    motionType = modal.motion;
  }

  // If no motion this block, nothing to emit
  if (!motionType || !hasPositionWords) return;

  // ── Compute target position ───────────────────────────────────────────────

  const from = { ...modal.position };

  // In absolute mode (G90), X/Y/Z are absolute coordinates.
  // In incremental mode (G91), X/Y/Z are offsets from current position.
  const isAbsolute = modal.distance === "G90";

  const to = {
    x: resolveCoord(words["X"], from.x, isAbsolute),
    y: resolveCoord(words["Y"], from.y, isAbsolute),
    z: resolveCoord(words["Z"], from.z, isAbsolute),
  };

  // ── Unit conversion ───────────────────────────────────────────────────────
  // Internally we always work in mm. If the file is in inches, convert.
  const mm = modal.units === "G20" ? 25.4 : 1;

  // ── Build the move object ─────────────────────────────────────────────────

  const moveBase = {
    lineNumber,
    raw,
    type: motionType,
    from: { x: from.x * mm, y: from.y * mm, z: from.z * mm },
    to: { x: to.x * mm, y: to.y * mm, z: to.z * mm },
    feed: modal.feed,
  };

  if (motionType === "G0" || motionType === "G1") {
    moves.push({ ...moveBase });
  }

  if (motionType === "G2" || motionType === "G3") {
    // Arc: we also need the IJ offsets (centre relative to current position)
    const i = (words["I"] ?? 0) * mm;
    const j = (words["J"] ?? 0) * mm;

    moves.push({
      ...moveBase,
      arcCentre: {
        x: from.x * mm + i,
        y: from.y * mm + j,
      },
      clockwise: motionType === "G2",
    });
  }

  // Update modal position for next block
  modal.position = { ...to };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function resolveCoord(wordValue, current, isAbsolute) {
  if (wordValue === undefined) return current;
  return isAbsolute ? wordValue : current + wordValue;
}
```

---

## Part 4 — Understanding Arc Math (G2/G3)

Before building the backplotter, we need to understand how G2/G3 arcs work.

### The IJ form

The most common arc representation in G-code uses **IJ offsets**: the arc
centre is specified as an offset from the **current position**, not as an
absolute coordinate.

Given:

- `FROM` = current position
- `TO` = target position
- `I`, `J` = offset from `FROM` to centre

So: `CENTRE = FROM + (I, J)`

From the centre, we can compute:

- `startAngle = atan2(FROM.y - CENTRE.y, FROM.x - CENTRE.x)`
- `endAngle   = atan2(TO.y   - CENTRE.y, TO.x   - CENTRE.x)`
- `radius     = distance(FROM, CENTRE)`

**G2** is clockwise (in standard math convention, clockwise is negative angle
direction). **G3** is counter-clockwise (positive angle direction).

### A visual

```
Centre at C
FROM at F (start of arc, angle α from centre)
TO   at T (end of arc, angle β from centre)

        T
       /
    C ——→ F
      \
       arc goes clockwise (G2)
```

The arc starts at angle α and sweeps clockwise to β. The arc length depends on
how much of the circle is swept.

---

## Part 5 — The Backplotter

The backplotter converts parsed moves into geometry objects that our existing
renderer can draw. It also colours them differently based on move type.

Create `cam/js/gcode/Backplotter.js`:

```js
// Backplotter.js
// Convert parsed G-code moves into geometry objects for the renderer.

import { Vector2 } from "../math/Vector2.js";
import { Line } from "../geometry/Line.js";
import { Arc } from "../geometry/Arc.js";

// The backplotter adds metadata to geometry objects for rendering:
// geom.moveType: 'rapid' | 'feed' | 'arc'
// geom.lineNumber: the G-code line number this geometry came from

export function backplot(moves) {
  const geometry = [];

  for (const move of moves) {
    // We only backplot XY moves (ignore Z-only moves for 2D backplot)
    const dx = move.to.x - move.from.x;
    const dy = move.to.y - move.from.y;
    const dz = move.to.z - move.from.z;

    const isXYMove = Math.abs(dx) > 1e-6 || Math.abs(dy) > 1e-6;

    if (!isXYMove) continue; // Z-only plunge: skip for 2D view

    if (move.type === "G0" || move.type === "G1") {
      const line = new Line(
        new Vector2(move.from.x, move.from.y),
        new Vector2(move.to.x, move.to.y),
      );
      line.moveType = move.type === "G0" ? "rapid" : "feed";
      line.lineNumber = move.lineNumber;
      line.feedRate = move.feed;
      geometry.push(line);
    }

    if (move.type === "G2" || move.type === "G3") {
      const geom = buildArcGeom(move);
      if (geom) geometry.push(geom);
    }
  }

  return geometry;
}

// ── Build an Arc geometry from an arc move ────────────────────────────────────

function buildArcGeom(move) {
  const cx = move.arcCentre.x;
  const cy = move.arcCentre.y;

  const startAngle = Math.atan2(move.from.y - cy, move.from.x - cx);
  const endAngle = Math.atan2(move.to.y - cy, move.to.x - cx);
  const radius = Math.sqrt((move.from.x - cx) ** 2 + (move.from.y - cy) ** 2);

  if (radius < 1e-6) return null;

  // G2 = clockwise. In our Arc class (CCW convention), we need to swap.
  // Our renderer draws arcs CCW from startAngle to endAngle.
  // For CW (G2), we swap start/end so the arc goes the right direction.
  let sa, ea;
  if (move.clockwise) {
    sa = endAngle;
    ea = startAngle;
  } else {
    sa = startAngle;
    ea = endAngle;
  }

  const arc = new Arc(new Vector2(cx, cy), radius, sa, ea);
  arc.moveType = "arc";
  arc.lineNumber = move.lineNumber;
  arc.feedRate = move.feed;
  return arc;
}
```

---

## Part 6 — Rendering G-code Geometry with Move Colours

The existing renderer draws all geometry in `--color-geometry`. For the
backplotter we want:

- **Rapid** (G0): red, thin, dashed
- **Feed** (G1, straight): cyan
- **Arc feed** (G2/G3): white/light
- **Z-only plunges**: not drawn in 2D

Update `Renderer2D.js` to handle `moveType` on geometry objects.

In `Renderer2D.js`, modify the `drawLine` and `drawArc` functions to check for
`moveType`:

```js
// In drawLine(), before setting strokeStyle:
function drawLine(ctx, geom) {
  const from = worldToCanvas(geom.p1.x, geom.p1.y);
  const to = worldToCanvas(geom.p2.x, geom.p2.y);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);

  if (geom.selected) {
    ctx.strokeStyle = getToken("--color-selected");
    ctx.lineWidth = 2.5;
  } else if (geom.moveType === "rapid") {
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
  } else if (geom.moveType === "feed") {
    ctx.strokeStyle = "#44ddff";
    ctx.lineWidth = 1.5;
  } else {
    ctx.strokeStyle = getToken("--color-geometry");
    ctx.lineWidth = 1.5;
  }

  ctx.stroke();
  ctx.setLineDash([]); // reset
  ctx.restore();
}
```

Apply similar logic to `drawArc()`: arc feed moves get the `--color-geometry`
colour (or a distinct colour if you prefer).

---

## Part 7 — File Loading with Security

The user loads a G-code file with `<input type="file">`. We use `FileReader`
to read it as text.

### Security considerations

1. **File type check**: Check the extension is `.nc`, `.gcode`, `.ngc`, `.txt`,
   or `.cnc`. Do NOT use the MIME type alone — browsers can lie about MIME types
   for local files. Check extension AND size.
2. **Size limit**: Reject files larger than 5MB. This prevents memory exhaustion
   from a giant crafted file.
3. **No eval**: We parse the text with our own tokenizer. We never call `eval()`
   on the content. G-code is data, not code.
4. **Content validation**: The tokenizer only extracts `[A-Z][number]` tokens.
   Everything else is silently ignored. There is no injection surface.

Create `cam/js/ui/gcode-loader.js`:

```js
// gcode-loader.js
// Handles loading a G-code file from disk.

const ALLOWED_EXTENSIONS = new Set([
  ".nc",
  ".gcode",
  ".ngc",
  ".cnc",
  ".txt",
  ".tap",
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function loadGCodeFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".nc,.gcode,.ngc,.cnc,.txt,.tap";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      document.body.removeChild(input);

      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      // ── Security check 1: file extension ────────────────────────────────
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        reject(
          new Error(
            `File type "${ext}" is not allowed. Use .nc, .gcode, .ngc, .cnc, or .txt`,
          ),
        );
        return;
      }

      // ── Security check 2: file size ──────────────────────────────────────
      if (file.size > MAX_FILE_SIZE) {
        reject(
          new Error(
            `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`,
          ),
        );
        return;
      }

      // ── Read as text ─────────────────────────────────────────────────────
      const reader = new FileReader();
      reader.onload = () => resolve({ text: reader.result, name: file.name });
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsText(file);
    });

    input.click();
  });
}
```

---

## Part 8 — Wiring the Backplotter into main.js

Create a `cam/js/gcode/index.js` re-export for convenience:

```js
// gcode/index.js
export { tokenize } from "./Tokenizer.js";
export { parse } from "./Parser.js";
export { backplot } from "./Backplotter.js";
```

Add to the toolbar HTML:

```html
<button
  class="btn-tool"
  id="btn-load-gcode"
  data-tooltip="Load G-code"
  title="Load G-code"
>
  NC
</button>
```

Add to `main.js`:

```js
import { parse } from "./gcode/index.js";
import { backplot } from "./gcode/index.js";
import { loadGCodeFile } from "./ui/gcode-loader.js";

// ── G-code panel state ───────────────────────────────────────────────────────
let gcodeText = ""; // raw text of the loaded file
let gcodeMoves = []; // parsed moves
let gcodeGeoms = []; // geometry objects from backplot

// A separate "layer" for gcode geometry — not mixed with the user's drawn objects
state.gcodeGeometry = [];

document
  .getElementById("btn-load-gcode")
  ?.addEventListener("click", async () => {
    try {
      const { text, name } = await loadGCodeFile();
      gcodeText = text;
      gcodeMoves = parse(text);
      gcodeGeoms = backplot(gcodeMoves);

      // Replace the gcode geometry layer
      state.gcodeGeometry = gcodeGeoms;

      document.getElementById("sb-msg").textContent =
        `Loaded: ${name} — ${gcodeMoves.length} moves, ${gcodeGeoms.length} drawn`;

      render();
    } catch (e) {
      alert(`Could not load G-code: ${e.message}`);
    }
  });
```

### Two geometry layers

We keep the user's drawn geometry (`state.geometry`) and the G-code geometry
(`state.gcodeGeometry`) separate. This means:

- Undo/redo only affects user geometry (you can't "undo" loading a file the
  same way — use the Load button to load a different file)
- Operations only affect user geometry
- The renderer draws both layers

Update `Renderer2D.js` to also draw `state.gcodeGeometry`:

```js
// In the main render function, after drawing state.geometry:
export function render() {
  // ... existing code ...

  // Draw G-code geometry layer (if any)
  for (const geom of state.gcodeGeometry ?? []) {
    DRAW_DISPATCH[geom.type]?.(ctx, geom);
  }
}
```

---

## BUILD 1 — Load a G-code File

Create a test file `test.nc` on your computer with this content:

```gcode
; Simple test program
G21           ; mm
G90           ; absolute
G0 X0 Y0 Z5
G1 Z-2 F100
G1 X50 F200
G1 X50 Y50
G1 X0  Y50
G1 X0  Y0
G2 X10 Y0 I5 J0 F150
G0 Z5
M30
```

1. Start Live Server, open the app
2. Click **NC** button in the toolbar
3. Select `test.nc`
4. The backplotted path should appear:
   - Rapid moves (G0) as red dashed lines
   - Feed moves (G1) as cyan solid lines
   - The arc (G2) as a curved line

---

## Part 9 — G-code Inspector Panel

When the user hovers over a backplotted move, show its details in a panel.

Add to `index.html`:

```html
<details id="section-gcode-info">
  <summary class="section-header">G-code Info</summary>
  <div class="section-body">
    <div id="gcode-hover-info" class="panel-empty">
      Hover over a move to see details.
    </div>
    <div class="form-field" style="margin-top: 8px">
      <label class="form-label">Lines</label>
      <span id="gcode-line-count" class="form-value">—</span>
    </div>
    <div class="form-field">
      <label class="form-label">Moves</label>
      <span id="gcode-move-count" class="form-value">—</span>
    </div>
    <div class="form-field">
      <label class="form-label">Drawn</label>
      <span id="gcode-drawn-count" class="form-value">—</span>
    </div>
  </div>
</details>
```

Add hover detection for G-code geometry in `main.js`:

```js
// In the mousemove handler, after updating status bar:
canvas.addEventListener("mousemove", (e) => {
  const cp = eventToCanvas(e);
  const world = canvasToWorld(cp.x, cp.y);
  sbX.textContent = `X: ${world.x.toFixed(3).padStart(9)}`;
  sbY.textContent = `Y: ${world.y.toFixed(3).padStart(9)}`;

  // Check for hover over G-code geometry
  const CLICK_DIST_MM = 5 / state.view.zoom;
  let hoveredMove = null;

  for (const g of state.gcodeGeometry ?? []) {
    if (g.type === "line") {
      const d = _distPointToSegment(world, g.p1, g.p2);
      if (d < CLICK_DIST_MM) {
        hoveredMove = g;
        break;
      }
    }
  }

  const infoEl = document.getElementById("gcode-hover-info");
  if (infoEl) {
    if (hoveredMove) {
      infoEl.textContent =
        `Line ${hoveredMove.lineNumber}: ${hoveredMove.moveType?.toUpperCase() ?? "?"}` +
        (hoveredMove.feedRate ? ` @ F${hoveredMove.feedRate}` : "");
    } else {
      infoEl.textContent = "Hover over a move to see details.";
    }
  }

  // ... rest of mousemove handler ...
});

// Helper (copy from SelectTool.js or move to a shared module)
function _distPointToSegment(p, a, b) {
  const ab = b.sub(a);
  const ap = p.sub(a);
  const len2 = ab.x * ab.x + ab.y * ab.y;
  if (len2 < 1e-20) return ap.magnitude();
  let t = ap.dot(ab) / len2;
  t = Math.max(0, Math.min(1, t));
  const closest = a.add(ab.scale(t));
  return p.distanceTo(closest);
}
```

Update the G-code stats panel after loading:

```js
document.getElementById("gcode-line-count")?.textContent =
  text.split("\n").length;
document.getElementById("gcode-move-count")?.textContent = gcodeMoves.length;
document.getElementById("gcode-drawn-count")?.textContent = gcodeGeoms.length;
```

---

## Part 10 — G-code Text View

A professional backplotter shows the G-code text alongside the plot, with the
current line highlighted. We implement a simplified version: a scrollable text
area with line numbers.

Add to `index.html` (in the right panel or as a new bottom panel):

```html
<details id="section-gcode-text">
  <summary class="section-header">G-code Source</summary>
  <div class="section-body" style="padding: 0">
    <pre id="gcode-text-view" class="gcode-text" readonly></pre>
  </div>
</details>
```

Add CSS:

```css
.gcode-text {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  background: var(--color-bg);
  color: var(--color-text-dim);
  padding: 8px;
  overflow: auto;
  max-height: 200px;
  margin: 0;
  white-space: pre;
  tab-size: 4;
}
```

Populate the text view when G-code is loaded:

```js
// After loading G-code in the click handler:
const textView = document.getElementById("gcode-text-view");
if (textView) {
  // Security: use textContent, never innerHTML.
  // The G-code text is user-provided data — we NEVER inject it as HTML.
  textView.textContent = text;
}
```

---

## Part 11 — Python Parallel: G-code Parser

```python
# gcode_parser.py
# Python G-code tokenizer and parser.
# Run: python3 gcode_parser.py

import re
import math
from dataclasses import dataclass, field
from typing import Optional


# ── Tokenizer ──────────────────────────────────────────────────────────────────

def strip_comments(line: str) -> str:
    # Remove (parenthetical comments)
    line = re.sub(r'\([^)]*\)', '', line)
    # Remove ; to end of line
    idx = line.find(';')
    if idx != -1:
        line = line[:idx]
    return line


def tokenize_block(line: str) -> list[dict]:
    clean = strip_comments(line).strip().upper()
    if not clean:
        return []
    pattern = re.compile(r'([A-Z])([-+]?[0-9]*\.?[0-9]+)')
    return [{'letter': m.group(1), 'value': float(m.group(2))}
            for m in pattern.finditer(clean)]


def tokenize(text: str) -> list[dict]:
    blocks = []
    for i, line in enumerate(text.splitlines(), 1):
        tokens = tokenize_block(line)
        if tokens:
            blocks.append({'line_number': i, 'tokens': tokens, 'raw': line})
    return blocks


# ── Parser ─────────────────────────────────────────────────────────────────────

@dataclass
class Move:
    line_number: int
    raw: str
    type: str           # 'G0', 'G1', 'G2', 'G3'
    from_pos: dict      # {'x': float, 'y': float, 'z': float}
    to_pos:   dict
    feed:     float = 0.0
    arc_centre: Optional[dict] = None   # {'x': float, 'y': float}
    clockwise:  bool = False


def parse(gcode: str) -> list[Move]:
    blocks = tokenize(gcode)
    modal  = {
        'motion':   'G0',
        'units':    'G21',
        'distance': 'G90',
        'plane':    'G17',
        'position': {'x': 0.0, 'y': 0.0, 'z': 0.0},
        'feed':     0.0,
    }
    moves = []

    for block in blocks:
        _process_block(block, modal, moves)

    return moves


def _process_block(block: dict, modal: dict, moves: list):
    tokens = block['tokens']
    words  = {}
    for t in tokens:
        if t['letter'] in ('G', 'M'):
            words[t['letter'] + str(int(t['value']))] = t['value']
        else:
            words[t['letter']] = t['value']

    # Update modal state
    for code, key in [('G20', 'units'), ('G21', 'units'),
                       ('G90', 'distance'), ('G91', 'distance'),
                       ('G17', 'plane'), ('G18', 'plane'), ('G19', 'plane')]:
        if code in words:
            modal[key] = code

    if 'F' in words: modal['feed'] = words['F']

    # Determine motion type
    motion_type = None
    for code in ('G0', 'G1', 'G2', 'G3'):
        if code in words:
            motion_type = code
            modal['motion'] = code
            break

    has_pos = any(k in words for k in ('X', 'Y', 'Z'))
    if has_pos and motion_type is None:
        motion_type = modal['motion']

    if not motion_type or not has_pos:
        return

    is_abs = modal['distance'] == 'G90'
    from_p = dict(modal['position'])

    def resolve(letter, current):
        if letter not in words:
            return current
        return words[letter] if is_abs else current + words[letter]

    to_p = {
        'x': resolve('X', from_p['x']),
        'y': resolve('Y', from_p['y']),
        'z': resolve('Z', from_p['z']),
    }

    mm = 25.4 if modal['units'] == 'G20' else 1.0

    move = Move(
        line_number = block['line_number'],
        raw         = block['raw'],
        type        = motion_type,
        from_pos    = {k: v * mm for k, v in from_p.items()},
        to_pos      = {k: v * mm for k, v in to_p.items()},
        feed        = modal['feed'],
    )

    if motion_type in ('G2', 'G3'):
        i = words.get('I', 0) * mm
        j = words.get('J', 0) * mm
        move.arc_centre = {
            'x': from_p['x'] * mm + i,
            'y': from_p['y'] * mm + j,
        }
        move.clockwise = (motion_type == 'G2')

    moves.append(move)
    modal['position'] = to_p


# ── Basic backplot (print moves) ───────────────────────────────────────────────

def describe_move(m: Move) -> str:
    f = m.from_pos
    t = m.to_pos
    base = (f"Line {m.line_number:4d}: {m.type}  "
            f"({f['x']:7.3f},{f['y']:7.3f}) → "
            f"({t['x']:7.3f},{t['y']:7.3f})")
    if m.feed:
        base += f"  F{m.feed}"
    if m.arc_centre:
        c = m.arc_centre
        base += f"  C({c['x']:.3f},{c['y']:.3f})"
    return base


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    gcode = """
G21
G90
G0 X0 Y0 Z5
G1 Z-2 F100
G1 X50 F200
G2 X60 Y10 I10 J0
M30
"""
    moves = parse(gcode)

    assert len(moves) == 4, f'Expected 4 moves, got {len(moves)}'
    assert moves[0].type == 'G0', f'First move should be G0, got {moves[0].type}'
    assert moves[1].type == 'G1', f'Second move G1, got {moves[1].type}'
    assert moves[3].type == 'G2', f'Last move G2, got {moves[3].type}'

    arc = moves[3]
    assert arc.arc_centre is not None, 'Arc should have centre'
    assert abs(arc.arc_centre['x'] - 60) < 1e-6, f"Arc centre X: {arc.arc_centre['x']}"

    print('All G-code parser tests passed!')
    print()
    print('Moves:')
    for m in moves:
        print(describe_move(m))


if __name__ == '__main__':
    run_tests()
```

---

## Part 12 — C++ Track: Week 6 — std::map and File I/O

```cpp
// gcode_demo.cpp
// Read a G-code file and count occurrences of each G-code command.
// Demonstrates: std::ifstream, std::map, std::regex (basic use).
//
// Compile: g++ -std=c++17 -Wall gcode_demo.cpp -o gcode_demo
// Run:     ./gcode_demo test.nc

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <map>
#include <regex>

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <gcode_file>\n";
        return 1;
    }

    // ── Open the file ──────────────────────────────────────────────────────
    std::ifstream file(argv[1]);
    if (!file.is_open()) {
        std::cerr << "Could not open file: " << argv[1] << "\n";
        return 1;
    }

    // ── Count G/M codes using std::map ────────────────────────────────────
    // std::map<Key, Value>: keeps entries sorted by key, O(log n) lookup.
    // Use std::unordered_map<K,V> for O(1) average if order doesn't matter.
    std::map<std::string, int> codeCounts;

    // Regex to find G/M codes: letter G or M followed by digits
    std::regex codePattern("[GM][0-9]+");

    std::string line;
    int lineNum = 0;

    while (std::getline(file, line)) {
        ++lineNum;

        // Strip comments (everything from ; onwards)
        auto semi = line.find(';');
        if (semi != std::string::npos) {
            line = line.substr(0, semi);
        }

        // Convert to uppercase
        for (char& c : line) c = std::toupper(c);

        // Find all G/M codes in this line
        auto begin = std::sregex_iterator(line.begin(), line.end(), codePattern);
        auto end   = std::sregex_iterator();

        for (auto it = begin; it != end; ++it) {
            std::string code = it->str();
            codeCounts[code]++;  // default-initialises to 0 then increments
        }
    }

    std::cout << "File: " << argv[1] << "  (" << lineNum << " lines)\n\n";
    std::cout << "G/M code counts:\n";

    // Iterating a std::map gives entries in sorted order by key
    for (const auto& [code, count] : codeCounts) {
        std::cout << "  " << code << ": " << count << "\n";
    }

    return 0;
}
```

**New concepts:**

`std::ifstream` — input file stream. `std::getline(file, line)` reads one
line at a time. The while loop reads until the file is exhausted (returns
false when the stream fails).

`std::map<K, V>` — an ordered key-value store (implemented as a red-black
tree). Accessing a key that does not exist with `map[key]` **creates** it with
a default value. This is intentional here: `codeCounts[code]++` starts at 0
if the code is new.

`const auto& [code, count]` — structured bindings (C++17). This destructures
the `std::pair<const string, int>` that `std::map` stores into named variables
`code` and `count`. Equivalent to writing `pair.first` and `pair.second`.

---

## Part 13 — Statistics and Toolpath Length

A useful feature for any backplotter is computing toolpath statistics.

Add to `cam/js/gcode/Backplotter.js`:

```js
// Compute statistics for a list of moves.
export function computeStats(moves) {
  let rapidLength = 0;
  let feedLength = 0;
  let arcLength = 0;
  let rapidCount = 0;
  let feedCount = 0;
  let arcCount = 0;

  for (const m of moves) {
    const dx = m.to.x - m.from.x;
    const dy = m.to.y - m.from.y;
    const dz = m.to.z - m.from.z;
    const dist3d = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (m.type === "G0") {
      rapidLength += dist3d;
      rapidCount++;
    } else if (m.type === "G1") {
      feedLength += dist3d;
      feedCount++;
    } else if (m.type === "G2" || m.type === "G3") {
      // Arc length = radius × angle
      if (m.arcCentre) {
        const r = Math.sqrt(
          (m.from.x - m.arcCentre.x) ** 2 + (m.from.y - m.arcCentre.y) ** 2,
        );
        const startA = Math.atan2(
          m.from.y - m.arcCentre.y,
          m.from.x - m.arcCentre.x,
        );
        const endA = Math.atan2(m.to.y - m.arcCentre.y, m.to.x - m.arcCentre.x);
        let sweep = endA - startA;
        // Normalise sweep to [0, 2π] for CCW (G3) and [0, -2π] for CW (G2)
        if (m.clockwise) {
          if (sweep > 0) sweep -= 2 * Math.PI;
        } else {
          if (sweep < 0) sweep += 2 * Math.PI;
        }
        arcLength += Math.abs(sweep * r);
        arcCount++;
      }
    }
  }

  return {
    rapidLength: rapidLength,
    feedLength: feedLength + arcLength,
    totalLength: rapidLength + feedLength + arcLength,
    rapidCount,
    feedCount,
    arcCount,
  };
}
```

Show the stats in the panel after loading:

```js
import { computeStats } from "./gcode/Backplotter.js";
// ...
const stats = computeStats(gcodeMoves);
document.getElementById("sb-msg").textContent =
  `${name} — Feed: ${stats.feedLength.toFixed(1)}mm  Rapid: ${stats.rapidLength.toFixed(1)}mm`;
```

---

## BUILD 2 — Full Backplotter Test

Create a more complex test file:

```gcode
; Box with rounded corners
G21 G90
G0 X-25 Y-25 Z5 F0
G1 Z-3 F100
G1 X25 Y-25 F300
G1 X25 Y25
G1 X-25 Y25
G1 X-25 Y-25
G0 Z5
; Pentagon
G0 X30 Y0
G1 Z-3 F100
G1 X39.27 Y28.53 F300
G1 X0 Y46.19
G1 X-39.27 Y28.53
G1 X-39.27 Y-28.53
G1 X30 Y0
G0 Z5
M30
```

Load it, and you should see the box and pentagon as backplotted lines.

---

## What You Have After Lab 06

```
cam/
  js/
    gcode/
      Tokenizer.js
      Parser.js
      Backplotter.js
      index.js
    ui/
      gcode-loader.js
python/
  gcode_parser.py
```

**Working features:**

- Load .nc/.gcode/.ngc/.cnc files from disk
- Parse G-code: handles G0, G1, G2, G3, G20/G21 units, G90/G91 distance modes
- Backplot: rapids in red dashed, feeds in cyan, arcs as arcs
- Hover over a move to see its line number, type, and feed rate
- Toolpath statistics (total feed length, rapid length)
- G-code text view in panel
- Auto-save does not persist G-code (only user geometry) — reload file on refresh

---

## DIVERGE POINTS

**1. G41/G42 tool radius compensation:** The parser could apply cutter radius
compensation, offsetting the toolpath by the tool radius outward or inward.
Implement using `OffsetOperation` from Lab 05.

**2. 3D backplot:** The current backplotter ignores Z. A 3D view would require
a WebGL renderer (Three.js or raw WebGL) — this is covered in Lab 08.

**3. Line highlighting:** When hovering a move, also highlight the corresponding
line in the G-code text view (use the `lineNumber` metadata, scroll to that
line with `scrollIntoView()`).

**4. Simulation player:** Instead of showing all moves at once, show them one
at a time with a Play button — like a movie. A `currentMoveIndex` variable and
a `requestAnimationFrame` loop would animate through `gcodeGeoms`.

**5. Error reporting:** Currently bad G-code is silently ignored. An "errors"
panel that lists unparsed tokens or invalid commands would help debug G-code
files.

---

_Continue to [Lab 07 — 2D CAM](LAB-07-2D-CAM.md)._
