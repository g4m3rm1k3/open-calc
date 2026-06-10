# Lab 10 — Expert Path: Where Production Systems Live

### CAM System Masterclass

---

## What You Will Build

This is the final lab. By the end you will understand:

- **Post-processors** — how to generate G-code dialects for Fanuc, Grbl, and LinuxCNC from a single toolpath
- **Multi-tool programs** — tool change events (`M6 T1`) and tool library management
- **Rest machining** — detecting remaining material that needs a smaller tool
- **Web Workers** — processing large G-code files without freezing the browser
- **User accounts** — moving from `localStorage` to a server (JWT, bcrypt, HTTPS)
- **Testing strategy** — what to unit-test, what to integration-test, and visual regression
- **Where to go next** — 5-axis, mesh-based CAM, LinuxCNC, real hardware

**Time:** 6–8 hours.

---

## Part 1 — The Post-Processor Pattern

### What is a post-processor?

Every CNC controller speaks a slightly different dialect of G-code.

| Controller       | Quirk                                                          |
| ---------------- | -------------------------------------------------------------- |
| **Grbl** (hobby) | No tool change. Uses `M3/M5` for spindle. Minimal G-codes.     |
| **LinuxCNC**     | Full dialect. Supports `G41`/`G42` cutter radius compensation. |
| **Fanuc 0i**     | Blocks end with `;`. `G70`/`G71` lathe cycles.                 |
| **Haas**         | Specific subroutine format `O1234`. Probing with `G31`.        |

A **post-processor** is a module that takes the machine-independent toolpath
(moves array) and emits G-code in a specific dialect.

In Lab 07 you built a single `GCodeGenerator.js`. Now we make it configurable.

### The post-processor interface

Create `cam/js/gcode/PostProcessor.js`:

```js
// PostProcessor.js
// A configurable G-code emitter that supports multiple controller dialects.

// ── Dialect definitions ────────────────────────────────────────────────────────

export const DIALECTS = {
  grbl: {
    name: "Grbl (hobby)",
    lineEnd: "\n",
    blockSep: "", // no line numbers
    unitMode: "G21", // metric
    absMode: "G90",
    spindleOn: (rpm) => `M3 S${rpm}`,
    spindleOff: () => "M5",
    toolChange: null, // Grbl does not support tool changes
    programEnd: "M30",
    safeHome: "G0 Z5",
    coordDecimal: 3,
  },
  linuxcnc: {
    name: "LinuxCNC",
    lineEnd: "\n",
    blockSep: "",
    unitMode: "G21",
    absMode: "G90",
    spindleOn: (rpm) => `S${rpm} M3`,
    spindleOff: () => "M5",
    toolChange: (n) => `T${n} M6`,
    programEnd: "M30",
    safeHome: "G0 Z5",
    coordDecimal: 4,
  },
  fanuc: {
    name: "Fanuc 0i",
    lineEnd: ";\n", // Fanuc blocks end with ;
    blockSep: (n) => `N${String(n).padStart(4, "0")} `,
    unitMode: "G21",
    absMode: "G90",
    spindleOn: (rpm) => `S${rpm} M03`,
    spindleOff: () => "M05",
    toolChange: (n) => `T${String(n).padStart(2, "0")} M06`,
    programEnd: "M30",
    safeHome: "G0 Z5.0",
    coordDecimal: 3,
  },
};

// ── PostProcessor class ────────────────────────────────────────────────────────

export class PostProcessor {
  constructor(dialect = "grbl") {
    this.dialect = DIALECTS[dialect] ?? DIALECTS.grbl;
    this._lines = [];
    this._blockN = 10; // block number counter (Fanuc style)
  }

  // ── Emit methods ─────────────────────────────────────────────────────────────

  emit(line) {
    const sep =
      typeof this.dialect.blockSep === "function"
        ? this.dialect.blockSep(this._blockN)
        : (this.dialect.blockSep ?? "");
    this._lines.push(sep + line + this.dialect.lineEnd);
    this._blockN += 10;
  }

  // ── Standard sections ────────────────────────────────────────────────────────

  header(params = {}) {
    const { spindleSpeed = 10000, programName = "CAM_EXPORT" } = params;
    // Safety note: programName comes from user — strip non-alphanumeric characters
    const safeName = String(programName)
      .replace(/[^A-Z0-9_]/gi, "_")
      .slice(0, 32);

    if (this.dialect === DIALECTS.fanuc) {
      this.emit(`O${safeName}`);
    }
    this.emit(this.dialect.unitMode);
    this.emit(this.dialect.absMode);
    this.emit(this.dialect.spindleOn(spindleSpeed));
    this.emit("G4 P1"); // 1-second dwell to let spindle reach speed
  }

  toolChange(toolNumber) {
    if (!this.dialect.toolChange) return;
    this.emit(this.dialect.toolChange(toolNumber));
  }

  footer() {
    this.emit(this.dialect.spindleOff());
    this.emit(this.dialect.safeHome);
    this.emit(this.dialect.programEnd);
  }

  // ── Move emission ─────────────────────────────────────────────────────────────

  moves(movesArray) {
    const d = this.dialect.coordDecimal;
    let lastF = null;

    for (const m of movesArray) {
      const x = m.to.x.toFixed(d);
      const y = m.to.y.toFixed(d);
      const z = m.to.z.toFixed(d);

      if (m.type === "rapid") {
        this.emit(`G0 X${x} Y${y} Z${z}`);
        lastF = null; // reset F — Fanuc requires F after mode switch
      } else {
        const fWord = lastF !== m.feed ? ` F${m.feed}` : "";
        lastF = m.feed;
        this.emit(`G1 X${x} Y${y} Z${z}${fWord}`);
      }
    }
  }

  // ── Generate output ───────────────────────────────────────────────────────────

  generate(movesArray, params = {}) {
    this._lines = [];
    this._blockN = 10;

    this.header(params);
    this.moves(movesArray);
    this.footer();

    return this._lines.join("");
  }
}
```

Now the CAM panel needs a dialect selector:

```html
<div class="form-field">
  <label class="form-label">Controller</label>
  <select id="cam-controller" class="form-select">
    <option value="grbl">Grbl</option>
    <option value="linuxcnc">LinuxCNC</option>
    <option value="fanuc">Fanuc</option>
  </select>
</div>
```

In `cam-panel.js`, replace the `generateGCode` call:

```js
import { PostProcessor } from "../gcode/PostProcessor.js";
// ...
const dialect = document.getElementById("cam-controller")?.value ?? "grbl";
const pp = new PostProcessor(dialect);
const gcodeStr = pp.generate(moves, { spindleSpeed: params.spindle });
```

---

## Part 2 — Multi-Tool Programs

Add tool library management.

Create `cam/js/cam/ToolLibrary.js`:

```js
// ToolLibrary.js
// Manages a library of cutting tools.

const _defaultTools = [
  { id: 1, name: "6mm End Mill", type: "end_mill", dia: 6, flutes: 2 },
  { id: 2, name: "3mm End Mill", type: "end_mill", dia: 3, flutes: 2 },
  { id: 3, name: "10mm End Mill", type: "end_mill", dia: 10, flutes: 4 },
  { id: 4, name: "3mm Ball Nose", type: "ball_nose", dia: 3, flutes: 2 },
  { id: 5, name: "8mm Drill", type: "drill", dia: 8, flutes: 2 },
];

let _tools = [..._defaultTools];

export function getTools() {
  return _tools;
}
export function getTool(id) {
  return _tools.find((t) => t.id === id) ?? null;
}
export function addTool(tool) {
  _tools.push({ ...tool });
}
export function removeTool(id) {
  _tools = _tools.filter((t) => t.id !== id);
}

// Persist to localStorage
export function saveTools() {
  try {
    localStorage.setItem("cam_tool_library", JSON.stringify(_tools));
  } catch {} // localStorage may be unavailable
}

export function loadTools() {
  try {
    const raw = localStorage.getItem("cam_tool_library");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) _tools = parsed;
  } catch {}
}
```

---

## Part 3 — Rest Machining Concept

### What is rest machining?

After a roughing pass with a large tool, there is material left in corners and
tight pockets that the large tool could not reach. This is called **rest
material** or **residual stock**.

A **rest machining** (or **re-machining**) pass uses a smaller tool to remove
only the rest material, saving time compared to a full second pass with the
small tool.

The concept:

1. Run the roughing simulation on the depth map (Lab 09 `DepthMap`)
2. Compare the actual depth map to the **ideal** depth map (the geometry offset
   by tool radius)
3. Where actual depth > ideal depth (i.e. the rougher did not reach), that is
   rest material
4. Generate a toolpath for the rest material regions only

This is a simplified description. Full rest machining in commercial CAM uses
**3D stock models** (voxel or B-rep). We implement a 2D version using the
depth map.

```js
// cam/js/cam/RestMachining.js
// Detect rest material from a depth map and produce move suggestions.

export function findRestRegions(depthMap, idealDepth, threshold = 0.1) {
  // Returns a list of {col, row, wx, wy} where material remains
  const regions = [];

  for (let row = 0; row < depthMap.rows; row++) {
    for (let col = 0; col < depthMap.cols; col++) {
      const actualDepth = depthMap.getDepth(col, row);
      // If actual depth is significantly less deep than ideal, rest material exists
      if (actualDepth > idealDepth + threshold) {
        // World coordinates of this cell centre
        const wx = depthMap.bounds.minX + (col + 0.5) / depthMap.resolution;
        const wy = depthMap.bounds.minY + (row + 0.5) / depthMap.resolution;
        regions.push({ col, row, wx, wy });
      }
    }
  }
  return regions;
}

export function restRegionsToMoves(regions, depth, safeZ, feedRate) {
  // Simple approach: visit each rest region centre with a cutting move.
  // A full implementation would cluster regions and plan efficient paths.
  if (regions.length === 0) return [];

  const moves = [];
  let prev = null;

  for (const r of regions) {
    if (!prev) {
      // Rapid to first position
      moves.push({
        type: "rapid",
        from: { x: 0, y: 0, z: safeZ },
        to: { x: r.wx, y: r.wy, z: safeZ },
      });
      moves.push({
        type: "feed",
        from: { x: r.wx, y: r.wy, z: safeZ },
        to: { x: r.wx, y: r.wy, z: depth },
        feed: feedRate / 2,
      });
    } else {
      // Feed to next rest region (they are likely adjacent)
      moves.push({
        type: "feed",
        from: { x: prev.wx, y: prev.wy, z: depth },
        to: { x: r.wx, y: r.wy, z: depth },
        feed: feedRate,
      });
    }
    prev = r;
  }

  if (prev) {
    moves.push({
      type: "rapid",
      from: { x: prev.wx, y: prev.wy, z: depth },
      to: { x: prev.wx, y: prev.wy, z: safeZ },
    });
  }

  return moves;
}
```

---

## Part 4 — Web Workers: Don't Freeze the Browser

### The problem

The browser's main thread handles:

- JavaScript execution
- DOM rendering
- Event handling
- Animations

If your JavaScript runs a long computation (parsing a 10,000-line G-code file,
running a full depth-map simulation), the browser cannot update the UI. The
page freezes. This is always bad.

### The solution: Web Workers

A **Web Worker** runs JavaScript on a separate thread. It cannot access the DOM,
but it can do heavy computation and communicate results back to the main thread
via `postMessage`.

```
Main thread ──── postMessage(data) ──────► Worker thread
                                                │
                                        [Heavy computation]
                                                │
Main thread ◄─── postMessage(result) ──────────┘
```

Create `cam/js/workers/depth-map-worker.js`:

```js
// depth-map-worker.js
// Runs depth map simulation in a background thread.
// NO DOM access allowed in workers.

// We must inline or import the DepthMap logic.
// Workers support ES module imports with: new Worker(url, { type: 'module' })
import { DepthMap } from "../simulation/DepthMap.js";

self.onmessage = function (e) {
  const { moves, toolDia, bounds, resolution } = e.data;

  const dm = new DepthMap(bounds, resolution ?? 2);
  const toolRadius = toolDia / 2;
  let movesDone = 0;

  for (const move of moves) {
    if (move.type !== "feed") {
      movesDone++;
      continue;
    }

    const dx = move.to.x - move.from.x;
    const dy = move.to.y - move.from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / (toolRadius * 0.5)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = move.from.x + dx * t;
      const y = move.from.y + dy * t;
      const z = move.from.z + (move.to.z - move.from.z) * t;
      dm.updateAt(x, y, z, toolRadius);
    }

    movesDone++;

    // Report progress every 50 moves
    if (movesDone % 50 === 0) {
      self.postMessage({
        type: "progress",
        fraction: movesDone / moves.length,
      });
    }
  }

  // Return the raw depth data (typed array can be transferred efficiently)
  self.postMessage(
    {
      type: "done",
      data: dm.data.buffer, // transfer ArrayBuffer ownership (zero-copy)
      cols: dm.cols,
      rows: dm.rows,
      bounds,
      resolution,
    },
    [dm.data.buffer],
  ); // transferables list: dm.data is moved, not copied
};
```

Using the worker in `sim-panel.js`:

```js
let _depthWorker = null;

function runDepthMapInWorker(moves, toolDia, bounds) {
  // Clean up any previous worker
  if (_depthWorker) {
    _depthWorker.terminate();
    _depthWorker = null;
  }

  const progressBar = document.getElementById("sim-progress");
  if (progressBar) progressBar.style.width = "0%";

  _depthWorker = new Worker(
    new URL("../workers/depth-map-worker.js", import.meta.url),
    { type: "module" },
  );

  _depthWorker.postMessage({ moves, toolDia, bounds, resolution: 4 });

  _depthWorker.onmessage = (e) => {
    if (e.data.type === "progress") {
      if (progressBar)
        progressBar.style.width = `${Math.round(e.data.fraction * 100)}%`;
    }
    if (e.data.type === "done") {
      // Reconstruct the depth map from the transferred buffer
      const { data, cols, rows, bounds: b, resolution } = e.data;
      const arr = new Float32Array(data);

      // Render to the depth map canvas
      _renderDepthData(arr, cols, rows);

      if (progressBar) progressBar.style.width = "100%";
      _depthWorker = null;
    }
  };

  _depthWorker.onerror = (err) => {
    console.error("Depth map worker error:", err.message);
    _depthWorker = null;
  };
}

function _renderDepthData(arr, cols, rows) {
  const canvas = document.getElementById("depthmap-canvas");
  if (!canvas) return;

  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(cols, rows);
  const minD = Math.min(...arr) || -3;

  for (let i = 0; i < cols * rows; i++) {
    const f = Math.max(0, Math.min(1, arr[i] / minD));
    const b = Math.round(255 * (1 - f * 0.8));
    img.data[i * 4] = b;
    img.data[i * 4 + 1] = b;
    img.data[i * 4 + 2] = Math.round(b * 1.2);
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
```

### What `transfer` means

`postMessage(data, [transferables])` — the array buffer in `transferables` is
**moved** (transferred) from the worker to the main thread. This is zero-copy:
the underlying memory is handed over rather than duplicated. After the transfer,
the worker can no longer access `dm.data.buffer`. For large typed arrays (depth
maps with hundreds of thousands of cells), this is essential for performance.

---

## Part 5 — Authentication: From localStorage to a Server

### Current state

Your app stores everything in `localStorage`. This works for a single-user app
running locally, but:

- Data is tied to one browser
- No sharing between devices
- No user accounts

### What a server adds

```
Browser                     Server
   │                           │
   │  POST /api/auth/login      │
   │  { username, password } ──►│
   │                           │  Hash & compare
   │  { token: "eyJ..." }  ◄───│
   │                           │
   │  GET /api/files/my.nc     │
   │  Authorization: Bearer    │
   │  eyJ...              ─────►│
   │                           │  Verify token
   │  { content: "G21..." }◄───│
```

### Key security concepts

**Never store plain-text passwords.** Use a hashing function like **bcrypt**.
bcrypt is deliberately slow (to slow down brute-force attacks) and includes a
random **salt** (to prevent rainbow table attacks).

```python
# Server-side (Python, using the bcrypt library)
import bcrypt

def hash_password(plain: str) -> str:
    salt   = bcrypt.gensalt()                           # random salt
    hashed = bcrypt.hashpw(plain.encode(), salt)
    return hashed.decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
```

**JWT (JSON Web Token)**: A compact, URL-safe token format. The server signs the
token with a secret key. The client includes the token in every request. The
server verifies the signature to confirm the token is genuine.

```
Header.Payload.Signature
```

- **Header**: algorithm (`HS256`)
- **Payload**: claims (`{ sub: userId, exp: timestamp }`)
- **Signature**: HMAC-SHA256(base64(header) + '.' + base64(payload), secret)

The client stores the JWT in memory or `sessionStorage` (not `localStorage` — it
is accessible to any XSS script). For maximum security, store it in an
`HttpOnly` cookie so JavaScript cannot read it at all.

**HTTPS only**: Tokens in transit must be encrypted. Never deploy an
authenticated API over plain HTTP.

### A minimal Node.js auth endpoint sketch

```js
// server/auth.js (Node.js + Express — NOT part of the running app, just a sketch)
// This requires: npm install express jsonwebtoken bcryptjs

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// In production: store users in a database (PostgreSQL, MongoDB, etc.)
// For the sketch: in-memory store
const users = new Map();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Validate input at the boundary — never trust client data
  if (!username || typeof username !== "string" || username.length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters" });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  if (users.has(username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const hash = await bcrypt.hash(password, 12); // cost factor 12
  users.set(username, { username, hash });
  res.status(201).json({ message: "Registered" });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);

  // Always call bcrypt.compare even if user not found (to prevent timing attacks)
  const dummyHash = "$2a$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const valid = user
    ? await bcrypt.compare(password, user.hash)
    : (await bcrypt.compare(password, dummyHash)) && false;

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: username, iat: Date.now() },
    process.env.JWT_SECRET, // secret from environment, never hardcoded
    { expiresIn: "8h" },
  );

  res.json({ token });
});

export default router;
```

**Important:** `JWT_SECRET` must be in an environment variable, never hardcoded
in source code or committed to version control.

---

## Part 6 — Testing Strategy

### What to test and how

| Layer                       | What to test                                        | How                                              |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------ |
| **Math utilities**          | `Vector2`, `mat4`, `signedArea`, `offsetPolygon`    | Unit tests: assert exact output for known inputs |
| **Geometry engine**         | `Line`, `Circle`, `Arc` construction, endpoints     | Unit tests                                       |
| **G-code tokenizer/parser** | Known G-code strings → correct token/AST            | Unit tests                                       |
| **CAM pipeline**            | `detectProfiles` → `contourOperation` → valid moves | Unit tests                                       |
| **Post-processor**          | Each dialect produces valid output                  | Unit tests                                       |
| **State management**        | `History` undo/redo, `Command` pattern              | Unit tests                                       |
| **Renderer2D**              | Draws correct pixels for known geometry             | Visual regression                                |
| **Full pipeline**           | Draw → operate → export → re-parse → same geometry  | Integration test                                 |
| **Server API**              | Auth endpoints, file storage, error codes           | Integration test                                 |

### Unit test structure (vanilla, no framework)

```js
// test/run-all.js
// A minimal test runner — no dependencies.

let passed = 0;
let failed = 0;
const errors = [];

export function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
    failed++;
    errors.push({ name, error: e });
  }
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg ?? "Assertion failed");
}

export function assertClose(a, b, epsilon = 1e-6, msg) {
  if (Math.abs(a - b) > epsilon) {
    throw new Error(msg ?? `Expected ${a} ≈ ${b} (within ${epsilon})`);
  }
}

export function summary() {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
```

```js
// test/test-postprocessor.js
import { test, assert, summary } from "./run-all.js";
import { PostProcessor, DIALECTS } from "../js/gcode/PostProcessor.js";

const sampleMoves = [
  {
    type: "rapid",
    from: { x: 0, y: 0, z: 5 },
    to: { x: 10, y: 0, z: 5 },
    feed: 0,
  },
  {
    type: "feed",
    from: { x: 10, y: 0, z: 5 },
    to: { x: 10, y: 0, z: -3 },
    feed: 100,
  },
  {
    type: "feed",
    from: { x: 10, y: 0, z: -3 },
    to: { x: 50, y: 0, z: -3 },
    feed: 300,
  },
];

test("Grbl output contains G0, G1, M3, M30", () => {
  const pp = new PostProcessor("grbl");
  const out = pp.generate(sampleMoves);
  assert(out.includes("G0"), "G0 rapid");
  assert(out.includes("G1"), "G1 feed");
  assert(out.includes("M3"), "spindle on");
  assert(out.includes("M30"), "program end");
  assert(!out.includes(";"), "Grbl has no semicolons");
});

test("Fanuc output ends lines with semicolons", () => {
  const pp = new PostProcessor("fanuc");
  const out = pp.generate(sampleMoves);
  assert(out.includes(";\n"), "Fanuc block terminator");
});

test("LinuxCNC output has more decimal places than Grbl", () => {
  const grbl = new PostProcessor("grbl").generate(sampleMoves);
  const linux = new PostProcessor("linuxcnc").generate(sampleMoves);
  // LinuxCNC uses 4 decimal places, Grbl uses 3
  assert(
    linux.includes(".0000") || linux.includes("0000"),
    "LinuxCNC has more decimals",
  );
});

test("No HTML injection in G-code output", () => {
  const pp = new PostProcessor("grbl");
  const out = pp.generate(sampleMoves, {
    programName: "<script>alert(1)</script>",
  });
  assert(
    !out.includes("<script>"),
    "HTML injection stripped from program name",
  );
});

summary();
```

### Visual regression testing concept

For the 2D renderer, a visual regression test works like this:

1. **Record**: render known geometry to a canvas, save the pixel data as a
   base64 PNG (the "golden image")
2. **Compare**: on each test run, render the same geometry and compare pixel-by-
   pixel to the golden image
3. **Diff**: if pixels differ beyond a threshold, the test fails and shows a diff image

This is what tools like Playwright, Percy, and Chromatic do at scale. For our
app, a minimal version:

```js
// test/visual-regression.js
// Minimal visual regression for Renderer2D.

// Capture: call after a known render to save the golden image.
export function captureGolden(canvas, name) {
  const data = canvas.toDataURL("image/png");
  localStorage.setItem(`golden_${name}`, data);
}

// Compare: returns { passed, diffPixels, diffFraction }
export function compareToGolden(canvas, name) {
  const goldenData = localStorage.getItem(`golden_${name}`);
  if (!goldenData) return { passed: false, error: "No golden image saved" };

  // Load golden into an offscreen canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const oc = document.createElement("canvas");
      oc.width = canvas.width;
      oc.height = canvas.height;
      oc.getContext("2d").drawImage(img, 0, 0);

      const a = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
      const b = oc.getContext("2d").getImageData(0, 0, oc.width, oc.height);

      let diff = 0;
      for (let i = 0; i < a.data.length; i += 4) {
        const dr = Math.abs(a.data[i] - b.data[i]);
        const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
        const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
        if (dr + dg + db > 30) diff++;
      }

      const total = canvas.width * canvas.height;
      const fraction = diff / total;
      resolve({
        passed: fraction < 0.001,
        diffPixels: diff,
        diffFraction: fraction,
      });
    };
    img.src = goldenData;
  });
}
```

---

## Part 10 — Python Parallel: Testing and Security Patterns

```python
# test_runner.py
# A minimal test runner for all Python modules.
# Run: python3 test_runner.py

import traceback


# ── Minimal test framework ─────────────────────────────────────────────────────

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self._results = []

    def test(self, name: str, fn):
        try:
            fn()
            self.passed += 1
            self._results.append(('✓', name, None))
        except Exception as e:
            self.failed += 1
            self._results.append(('✗', name, traceback.format_exc()))

    def assert_eq(self, a, b, msg=''):
        if a != b:
            raise AssertionError(f'{msg}\n  expected: {b!r}\n  got:      {a!r}')

    def assert_close(self, a, b, eps=1e-6, msg=''):
        if abs(a - b) > eps:
            raise AssertionError(f'{msg}\n  expected: {b} ± {eps}\n  got: {a}')

    def summary(self):
        for icon, name, tb in self._results:
            print(f'  {icon} {name}')
            if tb:
                for line in tb.strip().split('\n'):
                    print(f'      {line}')
        print(f'\n{self.passed} passed, {self.failed} failed')
        return self.failed == 0


# ── Security: input sanitisation ──────────────────────────────────────────────

import re

def sanitise_program_name(raw: str) -> str:
    """Strip characters that could cause injection in G-code file headers.
    G-code is a text format; a malicious name could break block structure."""
    # Allow only ASCII alphanumeric and underscores
    safe = re.sub(r'[^A-Za-z0-9_]', '_', raw)
    return safe[:32]


def sanitise_gcode_value(raw) -> float:
    """Parse a G-code coordinate value. Only accept finite floats."""
    try:
        val = float(raw)
    except (ValueError, TypeError):
        raise ValueError(f'Invalid G-code value: {raw!r}')
    if not (-1e6 < val < 1e6):
        raise ValueError(f'G-code value out of range: {val}')
    return val


# ── Run all module tests ───────────────────────────────────────────────────────

def main():
    runner = TestRunner()

    runner.test('sanitise_program_name strips HTML', lambda: (
        runner.assert_eq(
            sanitise_program_name('<script>alert(1)</script>'),
            '_script_alert_1___script_'[:32],
        )
    ))

    runner.test('sanitise_program_name allows alphanumeric', lambda: (
        runner.assert_eq(sanitise_program_name('MY_PART_001'), 'MY_PART_001')
    ))

    runner.test('sanitise_gcode_value accepts valid float', lambda: (
        runner.assert_close(sanitise_gcode_value('12.345'), 12.345)
    ))

    runner.test('sanitise_gcode_value rejects string', lambda: (
        (_ for _ in ()).throw(AssertionError) if _raises(
            lambda: sanitise_gcode_value('hello'), ValueError
        ) is None else None
    ))

    # Import and run each module's tests
    import importlib
    for module_name in ['geometry', 'cam_operations', 'simulation']:
        try:
            mod = importlib.import_module(module_name)
            runner.test(f'{module_name}: run_tests()', mod.run_tests)
        except ImportError:
            pass  # module not yet written

    return runner.summary()


def _raises(fn, exc_type) -> bool:
    try:
        fn()
        return False
    except exc_type:
        return True
    except Exception:
        return False


if __name__ == '__main__':
    import sys
    ok = main()
    sys.exit(0 if ok else 1)
```

---

## Part 11 — C++ Track: Week 10 — `std::variant` and Modern Patterns

```cpp
// modern_cpp.cpp
// std::variant: a type-safe union.
// Applied to: G-code commands with different payloads.
//
// Compile: g++ -std=c++17 -Wall modern_cpp.cpp -o modern_cpp
// Run:     ./modern_cpp

#include <iostream>
#include <variant>
#include <vector>
#include <string>
#include <optional>
#include <charconv>

// ── G-code command types as distinct structs ───────────────────────────────────

struct RapidMove {
    double x, y, z;
};

struct FeedMove {
    double x, y, z;
    double feed;
};

struct SpindleOn {
    int rpm;
};

struct SpindleOff {};

struct ToolChange {
    int toolNumber;
};

// ── std::variant ──────────────────────────────────────────────────────────────

// A variant holds EXACTLY ONE value of one of the listed types at a time.
// It is a type-safe alternative to union.
// std::get<T>(v)       — get the value (throws if wrong type)
// std::get_if<T>(&v)   — get a pointer to the value (null if wrong type)
// std::visit(fn, v)    — call fn with the contained value (dispatches by type)
using GCodeCommand = std::variant<RapidMove, FeedMove, SpindleOn, SpindleOff, ToolChange>;

// ── Emitter: convert commands to G-code strings ────────────────────────────────

std::string emit(const GCodeCommand& cmd) {
    return std::visit([](const auto& c) -> std::string {
        using T = std::decay_t<decltype(c)>;

        if constexpr (std::is_same_v<T, RapidMove>) {
            return "G0 X" + std::to_string(c.x) +
                   " Y"   + std::to_string(c.y) +
                   " Z"   + std::to_string(c.z);
        }
        else if constexpr (std::is_same_v<T, FeedMove>) {
            return "G1 X" + std::to_string(c.x) +
                   " Y"   + std::to_string(c.y) +
                   " Z"   + std::to_string(c.z) +
                   " F"   + std::to_string(c.feed);
        }
        else if constexpr (std::is_same_v<T, SpindleOn>) {
            return "M3 S" + std::to_string(c.rpm);
        }
        else if constexpr (std::is_same_v<T, SpindleOff>) {
            return "M5";
        }
        else if constexpr (std::is_same_v<T, ToolChange>) {
            return "T" + std::to_string(c.toolNumber) + " M6";
        }
        return "";
    }, cmd);
}

// ── std::optional ──────────────────────────────────────────────────────────────

// optional<T> holds either a T value or nothing (nullopt).
// It replaces the pattern of using -1 or nullptr as sentinel values.
std::optional<double> parseFeedRate(const std::string& token) {
    if (token.empty() || token[0] != 'F') return std::nullopt;

    double val;
    auto result = std::from_chars(token.data() + 1, token.data() + token.size(), val);
    if (result.ec != std::errc{}) return std::nullopt;
    if (val <= 0 || val > 100000) return std::nullopt;
    return val;
}

// ── Structured bindings ────────────────────────────────────────────────────────

struct BoundingBox {
    double minX, minY, maxX, maxY;
};

BoundingBox computeBounds(const std::vector<std::pair<double,double>>& points) {
    if (points.empty()) return {0,0,0,0};
    auto [px, py] = points[0];  // structured binding
    double minX = px, maxX = px, minY = py, maxY = py;
    for (const auto& [x, y] : points) {  // structured binding in loop
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
}

int main() {
    // ── Build a mini toolpath using GCodeCommand ────────────────────────────
    std::vector<GCodeCommand> program = {
        SpindleOn{ 12000 },
        RapidMove{ 0, 0, 5 },
        RapidMove{ 10, 0, 5 },
        FeedMove{  10, 0, -3, 100 },
        FeedMove{  50, 0, -3, 300 },
        RapidMove{ 50, 0, 5 },
        SpindleOff{},
        ToolChange{ 2 },
        SpindleOn{ 18000 },
        // ... second tool operations ...
        SpindleOff{},
    };

    std::cout << "=== G-code output ===\n";
    for (const auto& cmd : program) {
        std::cout << emit(cmd) << "\n";
    }

    // ── std::optional demo ──────────────────────────────────────────────────
    std::cout << "\n=== Feed rate parsing ===\n";
    for (const std::string& tok : {"F300", "F0", "Fabc", "G1", ""}) {
        auto feed = parseFeedRate(tok);
        if (feed.has_value()) {
            std::cout << tok << " → " << feed.value() << " mm/min\n";
        } else {
            std::cout << tok << " → (not a feed rate)\n";
        }
    }

    // ── Structured bindings ─────────────────────────────────────────────────
    std::vector<std::pair<double,double>> pts = {{0,0},{10,5},{20,-3},{5,15}};
    auto bb = computeBounds(pts);
    std::cout << "\n=== Bounding box ===\n";
    std::cout << "min: (" << bb.minX << "," << bb.minY << ")\n";
    std::cout << "max: (" << bb.maxX << "," << bb.maxY << ")\n";

    return 0;
}
```

**New concepts:**

**`std::variant<A,B,C>`**: A type-safe union. The value is always exactly one of
the listed types. Unlike a C `union`, `variant` tracks which type is active and
throws `std::bad_variant_access` if you try to access the wrong type.

**`std::visit`**: Calls a callable with the currently active variant value. The
callable must handle every type in the variant. Combined with `if constexpr`
(compile-time if) this is the modern way to write type-dispatched code without
dynamic allocation.

**`if constexpr`**: A compile-time conditional. The body is only compiled if
the condition is true. Used in templates to select code for a specific type.

**`std::optional<T>`**: A value that may or may not be present. Better than
using `nullptr`, `-1`, or `""` as sentinels. `optional::has_value()` checks
presence. `optional::value()` gets the value (throws if empty). `*opt` also
works (undefined behaviour if empty). Use `value_or(default)` for safe access.

**Structured bindings** `auto [a, b] = pair;`: Unpack a struct, pair, tuple, or
array into named variables. Works in `for` loops. Cleaner than `.first`/`.second`.

---

## Part 12 — Where to Go Next

### The CAM system you have built

After these ten labs you have:

- A 2D CAD kernel (geometry, history, pan/zoom, snap)
- Drawing tools (line, circle, arc, select)
- Operations (offset, mirror, array, trim/extend)
- G-code importer/backplotter
- 2D CAM pipeline (profile detection, contour/pocket toolpaths)
- G-code exporter with multi-dialect post-processing
- 3D viewer (Three.js, toolpath visualisation, stock block)
- Toolpath animation with tool representation
- Depth-map material simulation
- Web Worker offloading for heavy computation
- Python parallel implementations of all core algorithms
- C++ weekly exercises covering the language from basics to templates

This is a real, functional CAM system — not a toy. Most professional CAM
systems do exactly these things, just with more operations, more geometry types,
more post-processors, and more years of edge-case handling.

### Next steps by interest

**If you want to go deeper into CAM:**

- **B-splines and NURBS** — smooth curves beyond arcs. ISO 6983 (the G-code
  standard) supports NURBS with G5.2/G5.3.
- **3-axis to 5-axis** — add rotation axes (A, B, C). The toolpath is now a
  stream of (X,Y,Z,A,B) positions. Tilt the tool to reach undercuts.
- **Mesh-based simulation** — replace the Z-map with a full voxel model (3D
  grid of occupied/empty cells). The tool is also a voxel mesh. Subtract the
  tool from the stock as it moves.
- **LinuxCNC** — open-source real-time machine control. You can run a simulated
  machine with AXIS (the GUI). Study how Hal (Hardware Abstraction Layer) works.

**If you want to go deeper into the browser:**

- **WebAssembly** — compile C++ or Rust to Wasm for near-native performance in
  the browser. The depth-map simulation in Wasm would be 10–50× faster.
- **WebGPU** — the successor to WebGL. Compute shaders allow running
  general-purpose GPU code for simulation, ray tracing, etc.
- **Service Workers** — cache assets and API responses for offline use.

**If you want to go deeper into the backend:**

- **PostgreSQL** — store geometry and toolpaths in a relational database.
  Geometry can be stored as JSONB or via PostGIS for spatial queries.
- **WebSockets** — real-time collaboration. Two users editing the same drawing
  in different browsers, with changes synchronised instantly.
- **Event sourcing** — instead of storing the current state, store every command
  ever executed. Replay them to reconstruct any past state. The `History` system
  you built is a tiny version of this idea.

**If you want production-grade code:**

- **TypeScript** — add static types to your JavaScript. Most professional CAD/
  CAM web apps are TypeScript.
- **Property-based testing** — instead of writing specific test cases, describe
  properties that should always hold (`for all valid profiles, contourOperation
produces at least one feed move`). Libraries: fast-check (JS), hypothesis (Python).
- **Profiling** — use Chrome DevTools Performance tab to find where your app
  spends time. For the renderer, use `performance.mark` and `performance.measure`.

---

## Masterclass Complete

You have reached the end of the series. Here is what you built, and the skills
it exercised:

| Lab | What you built                             | Skills                            |
| --- | ------------------------------------------ | --------------------------------- |
| 01  | Canvas viewport, world↔canvas math         | Coordinate systems, ES modules    |
| 02  | App shell: toolbar, panel, state           | DOM, CSS, state management        |
| 03  | Geometry engine: Line, Circle, Arc         | OOP, data structures              |
| 04  | Mouse interaction: snap, select, hover     | Events, hit testing               |
| 05  | Drawing tools, operations (offset, mirror) | Command pattern, history          |
| 06  | G-code tokenizer, parser, backplotter      | Lexing, parsing, AST              |
| 07  | 2D CAM: profile detection, toolpath gen    | Algorithms, polygon math          |
| 08  | Three.js 3D view                           | WebGL, scene graph, transforms    |
| 09  | Toolpath simulation, depth map             | Animation, workers, rasterisation |
| 10  | Post-processors, auth, testing             | Architecture, security, quality   |

The principles you practised — incremental development, working code at every
step, testing as you go, never storing plain-text passwords, always validating
at system boundaries — are not CAM-specific. They apply to every software
system you will ever build.

---

_End of the CAM System Masterclass._
