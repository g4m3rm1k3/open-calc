# Lab 09 — Simulation: The Machine Comes Alive

### CAM System Masterclass

---

## What You Will Build

By the end of this lab you can:

- **Animate the toolpath** — step through each move over time, watching the tool
  position update in the 3D view
- **Play / pause / scrub** — full transport controls (play, pause, step forward,
  step backward, jump to start/end, scrub with a slider)
- **Show the tool** — a cylinder representing the cutter moving along the path
- **Track material removal** — a simple 2D depth map updated in real time as the
  tool moves through material (height-map simulation)
- **Report statistics** — current move number, elapsed time, total feed length,
  estimated cycle time
- **Export a simulation report** — a JSON summary of the simulated run

**Time:** 6–8 hours.

---

## Part 1 — What is a Machining Simulation?

### Why simulate?

Before sending G-code to a real machine, you want to verify:

1. **Collisions** — does the tool or holder crash into clamps, fixtures, or the stock?
2. **Gouges** — does the tool cut too deep or into a wall it should not?
3. **Air cuts** — are there moves that cut nothing (wasted time)?
4. **Cycle time** — how long will this job take?

A full simulation (as in commercial CAM software) is extremely complex. We
implement a **simplified visual simulation** that is educational and practically
useful, using the moves array from Lab 07.

### The simulation model

We model:

- **The tool**: a cylinder at the current position, moving along moves
- **The playback state**: current move index, interpolation fraction within the
  current move, playing/paused, speed multiplier
- **The depth map** (2D grid): a 2D array of depth values, updated as the tool
  moves through each cell. The initial value is 0 (top of stock). As the tool
  passes, the cell value becomes the cut depth.

---

## Part 2 — The Simulation State Machine

The simulation has four states:

```
IDLE ──────── load toolpath ──────► READY
READY ─────── play ──────────────► PLAYING
PLAYING ───── pause ─────────────► PAUSED
PAUSED ────── play ──────────────► PLAYING
PLAYING ───── reaches end ───────► DONE
DONE ──────── reset ─────────────► READY
```

Create `cam/js/simulation/SimController.js`:

```js
// SimController.js
// Controls simulation playback state and interpolation.

// ── State constants ────────────────────────────────────────────────────────────
export const SIM_IDLE = "idle";
export const SIM_READY = "ready";
export const SIM_PLAYING = "playing";
export const SIM_PAUSED = "paused";
export const SIM_DONE = "done";

// ── SimController ──────────────────────────────────────────────────────────────

export class SimController {
  constructor() {
    this.state = SIM_IDLE;
    this.moves = [];
    this.moveIndex = 0; // which move we are currently on
    this.fraction = 0; // 0.0–1.0 progress through the current move
    this.speed = 1.0; // playback speed multiplier
    this.onStep = null; // callback(moveIndex, fraction, position) called each frame
    this.onDone = null; // callback() called when simulation ends

    this._lastTime = null;
    this._animId = null;
  }

  // ── Load toolpath ────────────────────────────────────────────────────────────

  load(moves) {
    this.stop();
    this.moves = moves;
    this.moveIndex = 0;
    this.fraction = 0;
    this.state = moves.length > 0 ? SIM_READY : SIM_IDLE;
  }

  // ── Transport controls ───────────────────────────────────────────────────────

  play() {
    if (this.state !== SIM_READY && this.state !== SIM_PAUSED) return;
    this.state = SIM_PLAYING;
    this._lastTime = null;
    this._animId = requestAnimationFrame((t) => this._tick(t));
  }

  pause() {
    if (this.state !== SIM_PLAYING) return;
    this.state = SIM_PAUSED;
    if (this._animId !== null) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
  }

  stop() {
    this.pause();
    this.moveIndex = 0;
    this.fraction = 0;
    this.state = this.moves.length > 0 ? SIM_READY : SIM_IDLE;
    this._notifyStep();
  }

  stepForward() {
    if (this.state === SIM_PLAYING) this.pause();
    if (this.moveIndex >= this.moves.length - 1) return;
    this.moveIndex++;
    this.fraction = 0;
    this._notifyStep();
  }

  stepBack() {
    if (this.state === SIM_PLAYING) this.pause();
    if (this.moveIndex <= 0) return;
    this.moveIndex--;
    this.fraction = 0;
    this._notifyStep();
  }

  jumpToStart() {
    this.stop();
  }

  jumpToEnd() {
    if (this.state === SIM_PLAYING) this.pause();
    this.moveIndex = Math.max(0, this.moves.length - 1);
    this.fraction = 1;
    this.state = SIM_DONE;
    this._notifyStep();
  }

  // Scrub to a specific fraction of the total toolpath (0–1)
  scrub(totalFraction) {
    if (this.state === SIM_PLAYING) this.pause();
    if (this.moves.length === 0) return;

    const targetIndex = Math.floor(totalFraction * this.moves.length);
    this.moveIndex = Math.min(targetIndex, this.moves.length - 1);
    this.fraction = totalFraction * this.moves.length - this.moveIndex;
    this.state = SIM_PAUSED;
    this._notifyStep();
  }

  // ── Animation tick ────────────────────────────────────────────────────────────

  _tick(timestamp) {
    if (this.state !== SIM_PLAYING) return;

    if (this._lastTime === null) this._lastTime = timestamp;
    const dt = (timestamp - this._lastTime) / 1000; // seconds
    this._lastTime = timestamp;

    const move = this.moves[this.moveIndex];
    const duration = _moveDuration(move, this.speed);

    this.fraction += dt / duration;

    if (this.fraction >= 1) {
      // Finished this move — advance to next
      this.fraction = 0;
      this.moveIndex++;

      if (this.moveIndex >= this.moves.length) {
        // All moves done
        this.moveIndex = this.moves.length - 1;
        this.fraction = 1;
        this.state = SIM_DONE;
        this._notifyStep();
        this.onDone?.();
        return;
      }
    }

    this._notifyStep();
    this._animId = requestAnimationFrame((t) => this._tick(t));
  }

  // ── Notify callback ───────────────────────────────────────────────────────────

  _notifyStep() {
    if (!this.onStep) return;
    const pos = this.currentPosition();
    this.onStep(this.moveIndex, this.fraction, pos);
  }

  // ── Current world position ────────────────────────────────────────────────────

  currentPosition() {
    if (this.moves.length === 0) return { x: 0, y: 0, z: 0 };
    const m = this.moves[Math.min(this.moveIndex, this.moves.length - 1)];
    const t = Math.max(0, Math.min(1, this.fraction));
    return {
      x: m.from.x + (m.to.x - m.from.x) * t,
      y: m.from.y + (m.to.y - m.from.y) * t,
      z: m.from.z + (m.to.z - m.from.z) * t,
    };
  }

  // ── Total progress fraction (0–1) ────────────────────────────────────────────
  totalFraction() {
    if (this.moves.length === 0) return 0;
    return (this.moveIndex + this.fraction) / this.moves.length;
  }
}

// ── Move duration calculation ──────────────────────────────────────────────────

// How long does this move take at the given speed multiplier?
// For rapids, we use a fixed machine rapid speed of 3000mm/min.
// For feeds, we use the move's feed rate.
function _moveDuration(move, speedMultiplier) {
  const dx = move.to.x - move.from.x;
  const dy = move.to.y - move.from.y;
  const dz = move.to.z - move.from.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist < 1e-6) return 0.001;

  const feedMmPerSec =
    move.type === "rapid"
      ? 3000 / 60 // 3000 mm/min rapid
      : Math.max(1, move.feed) / 60;

  return dist / feedMmPerSec / speedMultiplier;
}
```

---

## Part 3 — The Tool in 3D

Add a moving tool cylinder to the 3D scene.

Add to `Renderer3D.js`:

```js
// ── Tool representation ────────────────────────────────────────────────────────

let _toolMesh = null;
let _toolTrailLine = null;
let _trailPositions = [];

export function initTool(toolDia = 6) {
  // Remove old tool
  if (_toolMesh) {
    scene.remove(_toolMesh);
    _toolMesh = null;
  }

  const radius = toolDia / 2;
  const height = toolDia * 3; // visible length

  // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
  const material = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2,
  });

  _toolMesh = new THREE.Mesh(geometry, material);

  // CylinderGeometry is centred at origin, oriented along Y axis.
  // Rotate so the axis is along Z (pointing down into material):
  _toolMesh.rotation.x = Math.PI / 2;

  scene.add(_toolMesh);
  _trailPositions = [];
}

export function updateToolPosition(x, y, z) {
  if (!_toolMesh) return;
  _toolMesh.position.set(x, y, z);

  // Trail: record positions for the path the tool has followed
  _trailPositions.push(x, y, z);

  // Update trail geometry (rebuild from positions)
  _updateTrail();
}

function _updateTrail() {
  // Remove old trail
  if (_toolTrailLine) {
    _toolTrailLine.geometry.dispose();
    scene.remove(_toolTrailLine);
    _toolTrailLine = null;
  }

  if (_trailPositions.length < 6) return; // need at least 2 points

  const positions = new Float32Array(_trailPositions);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    linewidth: 2,
  });
  _toolTrailLine = new THREE.Line(geometry, material);
  scene.add(_toolTrailLine);
}

export function clearToolTrail() {
  _trailPositions = [];
  if (_toolTrailLine) {
    _toolTrailLine.geometry.dispose();
    scene.remove(_toolTrailLine);
    _toolTrailLine = null;
  }
}
```

---

## Part 4 — The Simulation Panel UI

Add to `index.html`:

```html
<details id="section-simulation" open>
  <summary class="section-header">Simulation</summary>
  <div class="section-body">
    <!-- Transport controls -->
    <div style="display:flex; gap:4px; margin-bottom:8px; flex-wrap:wrap">
      <button class="btn-tool" id="sim-btn-start" title="Jump to start">
        ⏮
      </button>
      <button class="btn-tool" id="sim-btn-back" title="Step back">⏪</button>
      <button class="btn-tool" id="sim-btn-play" title="Play">▶</button>
      <button class="btn-tool" id="sim-btn-pause" title="Pause">⏸</button>
      <button class="btn-tool" id="sim-btn-forward" title="Step forward">
        ⏩
      </button>
      <button class="btn-tool" id="sim-btn-end" title="Jump to end">⏭</button>
    </div>

    <!-- Speed control -->
    <div class="form-field">
      <label class="form-label">Speed</label>
      <select id="sim-speed" class="form-select">
        <option value="0.1">0.1×</option>
        <option value="0.5">0.5×</option>
        <option value="1" selected>1×</option>
        <option value="5">5×</option>
        <option value="20">20×</option>
        <option value="100">100×</option>
      </select>
    </div>

    <!-- Scrub bar -->
    <div class="form-field">
      <label class="form-label">Progress</label>
      <input
        type="range"
        id="sim-scrub"
        class="form-input"
        min="0"
        max="1000"
        value="0"
        step="1"
      />
    </div>

    <!-- Stats -->
    <div class="form-field">
      <label class="form-label">Move</label>
      <span id="sim-stat-move" class="form-value">—</span>
    </div>
    <div class="form-field">
      <label class="form-label">Position</label>
      <span id="sim-stat-pos" class="form-value">—</span>
    </div>
    <div class="form-field">
      <label class="form-label">Type</label>
      <span id="sim-stat-type" class="form-value">—</span>
    </div>
    <div class="form-field">
      <label class="form-label">Feed</label>
      <span id="sim-stat-feed" class="form-value">—</span>
    </div>
    <div class="form-field">
      <label class="form-label">Est. time</label>
      <span id="sim-stat-time" class="form-value">—</span>
    </div>

    <!-- Tool diameter (for tool display) -->
    <div class="form-field" style="margin-top:8px">
      <label class="form-label">Tool ⌀</label>
      <input
        id="sim-tool-dia"
        class="form-input"
        type="number"
        value="6"
        step="0.5"
        min="0.1"
      />
    </div>

    <button
      class="btn-tool"
      id="sim-btn-load"
      style="width:100%;margin-top:8px"
    >
      Load from CAM
    </button>
  </div>
</details>
```

---

## Part 5 — Wiring the Simulation

Create `cam/js/simulation/sim-panel.js`:

```js
// sim-panel.js
// Wires the simulation panel to SimController and Renderer3D.

import {
  SimController,
  SIM_PLAYING,
  SIM_PAUSED,
  SIM_DONE,
} from "./SimController.js";
import {
  init3D,
  initTool,
  updateToolPosition,
  clearToolTrail,
  setCameraPreset,
} from "../renderer/Renderer3D.js";

let _sim = new SimController();
let _moves = [];
let _toolDia = 6;

export function initSimPanel(getMoves) {
  // getMoves is a function that returns the current toolpath moves
  document.getElementById("sim-btn-load")?.addEventListener("click", () => {
    _moves = getMoves() ?? [];
    _toolDia = parseFloat(
      document.getElementById("sim-tool-dia")?.value ?? "6",
    );

    _sim.load(_moves);
    clearToolTrail();
    initTool(_toolDia);
    updateScrub(0);
    updateStats(0, 0);
    setStatus("Loaded — press ▶ to simulate");

    // Ensure 3D view is active so the user sees the simulation
    document.getElementById("btn-view-3d")?.click();
    setCameraPreset("isometric");
  });

  document.getElementById("sim-btn-play")?.addEventListener("click", () => {
    if (_sim.state === SIM_DONE) _sim.stop();
    _sim.speed = parseFloat(document.getElementById("sim-speed")?.value ?? "1");
    _sim.play();
    updatePlayPauseButtons();
  });

  document.getElementById("sim-btn-pause")?.addEventListener("click", () => {
    _sim.pause();
    updatePlayPauseButtons();
  });

  document.getElementById("sim-btn-start")?.addEventListener("click", () => {
    _sim.jumpToStart();
    clearToolTrail();
    updatePlayPauseButtons();
  });

  document.getElementById("sim-btn-end")?.addEventListener("click", () => {
    _sim.jumpToEnd();
    updatePlayPauseButtons();
  });

  document.getElementById("sim-btn-back")?.addEventListener("click", () => {
    _sim.stepBack();
    updatePlayPauseButtons();
  });

  document.getElementById("sim-btn-forward")?.addEventListener("click", () => {
    _sim.stepForward();
    updatePlayPauseButtons();
  });

  document.getElementById("sim-scrub")?.addEventListener("input", (e) => {
    const f = parseInt(e.target.value) / 1000;
    _sim.scrub(f);
    updatePlayPauseButtons();
  });

  document.getElementById("sim-speed")?.addEventListener("change", (e) => {
    _sim.speed = parseFloat(e.target.value);
  });

  // ── Connect SimController callbacks ──────────────────────────────────────────

  _sim.onStep = (moveIndex, fraction, position) => {
    updateToolPosition(position.x, position.y, position.z);
    updateScrub(_sim.totalFraction());
    updateStats(moveIndex, fraction);
  };

  _sim.onDone = () => {
    setStatus("Simulation complete.");
    updatePlayPauseButtons();
  };
}

// ── UI helpers ─────────────────────────────────────────────────────────────────

function updatePlayPauseButtons() {
  const playBtn = document.getElementById("sim-btn-play");
  const pauseBtn = document.getElementById("sim-btn-pause");
  if (!playBtn || !pauseBtn) return;

  const playing = _sim.state === SIM_PLAYING;
  playBtn.disabled = playing;
  pauseBtn.disabled = !playing;
}

function updateScrub(fraction) {
  const scrub = document.getElementById("sim-scrub");
  if (scrub) scrub.value = Math.round(fraction * 1000);
}

function updateStats(moveIndex, fraction) {
  if (_moves.length === 0) return;

  const move = _moves[Math.min(moveIndex, _moves.length - 1)];
  const pos = _sim.currentPosition();

  document.getElementById("sim-stat-move")?.textContent =
    `${moveIndex + 1} / ${_moves.length}`;

  document.getElementById("sim-stat-pos")?.textContent =
    `X${pos.x.toFixed(2)} Y${pos.y.toFixed(2)} Z${pos.z.toFixed(2)}`;

  document.getElementById("sim-stat-type")?.textContent = move?.type ?? "—";
  document.getElementById("sim-stat-feed")?.textContent = move?.feed
    ? `${move.feed} mm/min`
    : "rapid";

  // Estimate remaining time
  const totalTime = estimateTotalTime(_moves, _sim.speed);
  const elapsed = totalTime * _sim.totalFraction();
  document.getElementById("sim-stat-time")?.textContent =
    `${formatTime(elapsed)} / ${formatTime(totalTime)}`;
}

function setStatus(msg) {
  const el = document.getElementById("sim-stat-move");
  // Just update the status in the first stat field
}

// Estimate total run time at given speed
function estimateTotalTime(moves, speed) {
  let total = 0;
  for (const m of moves) {
    const dx = m.to.x - m.from.x;
    const dy = m.to.y - m.from.y;
    const dz = m.to.z - m.from.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const feedMmPerSec =
      m.type === "rapid" ? 3000 / 60 : Math.max(1, m.feed) / 60;
    total += dist / feedMmPerSec;
  }
  return total / speed;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
```

Add to `main.js`:

```js
import { initSimPanel } from "./simulation/sim-panel.js";
// ...
// Pass a getter for the current toolpath moves
initSimPanel(() => window._lastCamMoves ?? []);
```

In `cam-panel.js`, expose the moves:

```js
// After generating moves:
window._lastCamMoves = _lastMoves;
```

---

## Part 6 — Depth Map Simulation

The depth map tracks where material has been removed. It is a 2D grid covering
the stock area, where each cell stores the deepest Z reached by the tool in that
cell.

This is a simplified version of what commercial CAM systems call a
**Z-map** or **height-map** simulation.

Create `cam/js/simulation/DepthMap.js`:

```js
// DepthMap.js
// A 2D grid tracking material removal depth.

export class DepthMap {
  // bounds: { minX, maxX, minY, maxY }
  // resolution: grid cells per mm
  constructor(bounds, resolution = 2) {
    this.bounds = bounds;
    this.resolution = resolution;

    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;

    this.cols = Math.ceil(w * resolution);
    this.rows = Math.ceil(h * resolution);

    // Initial depth = 0 (top of stock)
    this.data = new Float32Array(this.cols * this.rows).fill(0);
  }

  // World coordinates → grid indices
  worldToGrid(wx, wy) {
    const col = Math.floor((wx - this.bounds.minX) * this.resolution);
    const row = Math.floor((wy - this.bounds.minY) * this.resolution);
    return { col, row };
  }

  // Is a grid cell valid?
  inBounds(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  // Get the depth at a grid cell
  getDepth(col, row) {
    if (!this.inBounds(col, row)) return 0;
    return this.data[row * this.cols + col];
  }

  // Update the depth map for a single tool position.
  // The tool is a circle of radius toolRadius at (wx, wy).
  // It cuts to depth z (negative).
  updateAt(wx, wy, z, toolRadius) {
    // Compute the bounding box of the tool footprint in grid cells
    const minCol = Math.floor(
      (wx - toolRadius - this.bounds.minX) * this.resolution,
    );
    const maxCol = Math.ceil(
      (wx + toolRadius - this.bounds.minX) * this.resolution,
    );
    const minRow = Math.floor(
      (wy - toolRadius - this.bounds.minY) * this.resolution,
    );
    const maxRow = Math.ceil(
      (wy + toolRadius - this.bounds.minY) * this.resolution,
    );

    const r2 = toolRadius * toolRadius;

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (!this.inBounds(col, row)) continue;

        // World position of this cell centre
        const cx = this.bounds.minX + (col + 0.5) / this.resolution;
        const cy = this.bounds.minY + (row + 0.5) / this.resolution;

        // Is this cell inside the tool footprint?
        const dx = cx - wx;
        const dy = cy - wy;
        if (dx * dx + dy * dy > r2) continue;

        // Update depth: tool cuts to z, keep the deepest (most negative) value
        const idx = row * this.cols + col;
        if (z < this.data[idx]) {
          this.data[idx] = z;
        }
      }
    }
  }

  // Render the depth map onto a 2D canvas for visualisation.
  // canvas: an offscreen or visible <canvas> element.
  // minDepth: the darkest depth (e.g. -5mm = maximum cut)
  renderToCanvas(canvas, minDepth = -5) {
    const ctx = canvas.getContext("2d");
    canvas.width = this.cols;
    canvas.height = this.rows;

    const img = ctx.createImageData(this.cols, this.rows);

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const depth = this.data[row * this.cols + col];
        const fraction = Math.max(0, Math.min(1, depth / minDepth)); // 0=uncut, 1=full depth
        const brightness = Math.round(255 * (1 - fraction * 0.8)); // uncut=bright, cut=dark

        const idx = (row * this.cols + col) * 4;
        img.data[idx] = brightness; // R
        img.data[idx + 1] = brightness; // G
        img.data[idx + 2] = Math.round(brightness * 1.2); // B (slight blue tint for metal)
        img.data[idx + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(img, 0, 0);
  }
}
```

### How the depth map works

The depth map is a **raster** (pixel grid) representation of the stock surface.
Think of it as a heightfield: each cell stores the Z value of the top of the
remaining material at that XY location.

Initially all cells are Z=0 (uncut stock). As the tool moves through a cell,
the cell value updates to the tool's Z position (the cut depth).

This is the same concept as a **Z-buffer** in graphics: each pixel stores a
depth value, and we keep the "closest" (in this case, deepest) value.

---

## Part 7 — Depth Map Display Panel

Add a canvas for the depth map preview:

```html
<details id="section-depthmap">
  <summary class="section-header">Material Preview</summary>
  <div class="section-body">
    <canvas
      id="depthmap-canvas"
      style="width:100%;aspect-ratio:1;image-rendering:pixelated;
                   border:1px solid var(--color-border)"
    >
    </canvas>
    <div class="form-field" style="margin-top:8px">
      <label class="form-label">Update</label>
      <select id="depthmap-update-rate" class="form-select">
        <option value="every">Every move</option>
        <option value="10">Every 10 moves</option>
        <option value="done" selected>When done</option>
      </select>
    </div>
    <button
      class="btn-tool"
      id="btn-depthmap-run"
      style="width:100%;margin-top:8px"
    >
      Run full simulation
    </button>
  </div>
</details>
```

Add to `sim-panel.js`:

```js
import { DepthMap } from "./DepthMap.js";

let _depthMap = null;

// Run a full simulation (all moves at once) and show the depth map.
// This is separate from the animated simulation — it runs instantly.
function runFullDepthMapSim(moves, toolDia, bounds) {
  if (moves.length === 0 || !bounds) return;

  _depthMap = new DepthMap(bounds, 4); // 4 cells per mm

  const toolRadius = toolDia / 2;

  for (const move of moves) {
    if (move.type !== "feed") continue; // only cutting moves

    // Sample the move at small intervals and update the depth map at each sample
    const dx = move.to.x - move.from.x;
    const dy = move.to.y - move.from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / (toolRadius * 0.5))); // half-radius steps

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = move.from.x + dx * t;
      const y = move.from.y + dy * t;
      const z = move.from.z + (move.to.z - move.from.z) * t;
      _depthMap.updateAt(x, y, z, toolRadius);
    }
  }

  // Render to the depth map canvas
  const canvas = document.getElementById("depthmap-canvas");
  if (canvas) {
    _depthMap.renderToCanvas(canvas, params.depth ?? -3);
  }
}

// Call this from the Load button handler after loading moves:
document.getElementById("btn-depthmap-run")?.addEventListener("click", () => {
  // Get bounds from the profile
  const profiles = detectProfiles(_state?.geometry ?? []);
  if (profiles.length === 0) return;
  const pts = profiles[0].geoms.flatMap((g) => [g.p1, g.p2].filter(Boolean));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const bounds = {
    minX: Math.min(...xs) - 10,
    maxX: Math.max(...xs) + 10,
    minY: Math.min(...ys) - 10,
    maxY: Math.max(...ys) + 10,
  };
  runFullDepthMapSim(_moves, _toolDia, bounds);
});
```

---

## BUILD 1 — Full Simulation Test

1. Draw a 50×50mm square in the CAD view
2. Generate a contour toolpath (Lab 07 CAM panel)
3. Open the **Simulation** panel
4. Click **Load from CAM**
5. Switch to 3D view (the app switches automatically)
6. Press **▶** to play
7. Watch the tool cylinder move along the toolpath
8. The yellow trail shows the path already covered
9. Use the scrub bar to jump to any position
10. Click **Run full simulation** in the Material Preview panel — a top-down
    greyscale depth map appears showing where material was removed

---

## Part 8 — Simulation Report Export

After a simulation run, export a JSON report.

Add to `sim-panel.js`:

```js
import { downloadFile } from "../ui/file-operations.js";

function exportSimReport(moves, toolDia) {
  const rapidMoves = moves.filter((m) => m.type === "rapid");
  const feedMoves = moves.filter((m) => m.type === "feed");

  const totalFeedLen = feedMoves.reduce((sum, m) => {
    const d = Math.sqrt(
      (m.to.x - m.from.x) ** 2 +
        (m.to.y - m.from.y) ** 2 +
        (m.to.z - m.from.z) ** 2,
    );
    return sum + d;
  }, 0);

  const totalRapidLen = rapidMoves.reduce((sum, m) => {
    const d = Math.sqrt(
      (m.to.x - m.from.x) ** 2 +
        (m.to.y - m.from.y) ** 2 +
        (m.to.z - m.from.z) ** 2,
    );
    return sum + d;
  }, 0);

  const estimatedTime = estimateTotalTime(moves, 1);

  // Security: we build the report object directly — no user-controlled keys.
  // JSON.stringify is safe for output.
  const report = {
    generatedAt: new Date().toISOString(),
    toolDiameter: toolDia,
    totalMoves: moves.length,
    rapidMoves: rapidMoves.length,
    feedMoves: feedMoves.length,
    feedLengthMm: parseFloat(totalFeedLen.toFixed(2)),
    rapidLengthMm: parseFloat(totalRapidLen.toFixed(2)),
    estimatedTimeSeconds: parseFloat(estimatedTime.toFixed(1)),
    estimatedTimeFormatted: formatTime(estimatedTime),
    zMin: Math.min(...moves.map((m) => Math.min(m.from.z, m.to.z))),
    zMax: Math.max(...moves.map((m) => Math.max(m.from.z, m.to.z))),
  };

  const json = JSON.stringify(report, null, 2);
  downloadFile(json, "sim-report.json", "application/json");
}

// Add export button to the simulation panel
document.getElementById("sim-btn-export")?.addEventListener("click", () => {
  exportSimReport(_moves, _toolDia);
});
```

Add the button to the HTML:

```html
<button class="btn-tool" id="sim-btn-export" style="width:100%;margin-top:4px">
  Export Report
</button>
```

---

## Part 9 — Testing the Simulation

```js
// test-simulation.js

import {
  SimController,
  SIM_READY,
  SIM_PLAYING,
  SIM_DONE,
} from "./js/simulation/SimController.js";
import { DepthMap } from "./js/simulation/DepthMap.js";

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

// ── SimController tests ────────────────────────────────────────────────────────
console.group("SimController");

const sim = new SimController();
const moves = [
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

sim.load(moves);
assert(sim.state === SIM_READY, "State is READY after load");
assert(sim.moveIndex === 0, "moveIndex starts at 0");

sim.stepForward();
assert(sim.moveIndex === 1, "stepForward increments moveIndex");

sim.stepBack();
assert(sim.moveIndex === 0, "stepBack decrements moveIndex");

sim.jumpToEnd();
assert(sim.state === SIM_DONE, "jumpToEnd puts state in DONE");

sim.stop();
assert(sim.moveIndex === 0, "stop resets moveIndex to 0");
assert(sim.state === SIM_READY, "stop returns to READY");

const midPos = (() => {
  sim.scrub(0.5);
  return sim.currentPosition();
})();
assert(typeof midPos.x === "number", "scrub: position has x");
assert(typeof midPos.z === "number", "scrub: position has z");

console.groupEnd();

// ── DepthMap tests ─────────────────────────────────────────────────────────────
console.group("DepthMap");

const dm = new DepthMap({ minX: 0, maxX: 50, minY: 0, maxY: 50 }, 2);
assert(dm.cols > 0, "DepthMap has columns");
assert(dm.rows > 0, "DepthMap has rows");

// Initial depth should be 0 everywhere
assert(dm.getDepth(5, 5) === 0, "Initial depth is 0");

// Cut at (25, 25) with radius 3, depth -3
dm.updateAt(25, 25, -3, 3);
const { col, row } = dm.worldToGrid(25, 25);
assert(dm.getDepth(col, row) < 0, "Depth updated at cut position");
assert(dm.getDepth(0, 0) === 0, "Depth not updated far from cut");

console.groupEnd();

console.log(`\nResults: ${passed} passed, ${failed} failed`);
```

---

## Part 10 — Python Parallel: Simulation Engine

```python
# simulation.py
# Python simulation engine: animate moves and compute depth map.
# Run: python3 simulation.py

import math
import time
from dataclasses import dataclass, field
from typing import Optional, Callable


# ── Move type ──────────────────────────────────────────────────────────────────

@dataclass
class Move:
    type:      str    # 'rapid' | 'feed'
    from_pos:  dict   # {'x': float, 'y': float, 'z': float}
    to_pos:    dict
    feed:      float = 0.0


# ── Interpolation ──────────────────────────────────────────────────────────────

def interpolate_move(move: Move, t: float) -> dict:
    """Return the position at fraction t (0–1) along a move."""
    t = max(0.0, min(1.0, t))
    return {
        'x': move.from_pos['x'] + (move.to_pos['x'] - move.from_pos['x']) * t,
        'y': move.from_pos['y'] + (move.to_pos['y'] - move.from_pos['y']) * t,
        'z': move.from_pos['z'] + (move.to_pos['z'] - move.from_pos['z']) * t,
    }


def move_length(move: Move) -> float:
    d = move.to_pos
    f = move.from_pos
    return math.sqrt((d['x']-f['x'])**2 + (d['y']-f['y'])**2 + (d['z']-f['z'])**2)


def move_duration(move: Move, speed: float = 1.0) -> float:
    length = move_length(move)
    if length < 1e-6:
        return 0.0
    feed_mm_per_sec = (3000 if move.type == 'rapid' else max(1.0, move.feed)) / 60.0
    return length / feed_mm_per_sec / speed


def estimate_total_time(moves: list[Move], speed: float = 1.0) -> float:
    return sum(move_duration(m, speed) for m in moves)


# ── Depth map ──────────────────────────────────────────────────────────────────

class DepthMap:
    def __init__(self, bounds: dict, resolution: float = 2.0):
        """
        bounds: {'minX': float, 'maxX': float, 'minY': float, 'maxY': float}
        resolution: grid cells per mm
        """
        self.bounds     = bounds
        self.resolution = resolution
        w = bounds['maxX'] - bounds['minX']
        h = bounds['maxY'] - bounds['minY']
        self.cols = max(1, int(math.ceil(w * resolution)))
        self.rows = max(1, int(math.ceil(h * resolution)))
        self.data = [[0.0] * self.cols for _ in range(self.rows)]

    def world_to_grid(self, wx: float, wy: float) -> tuple[int, int]:
        col = int((wx - self.bounds['minX']) * self.resolution)
        row = int((wy - self.bounds['minY']) * self.resolution)
        return col, row

    def in_bounds(self, col: int, row: int) -> bool:
        return 0 <= col < self.cols and 0 <= row < self.rows

    def update_at(self, wx: float, wy: float, z: float, tool_radius: float):
        min_col = int((wx - tool_radius - self.bounds['minX']) * self.resolution)
        max_col = int(math.ceil((wx + tool_radius - self.bounds['minX']) * self.resolution))
        min_row = int((wy - tool_radius - self.bounds['minY']) * self.resolution)
        max_row = int(math.ceil((wy + tool_radius - self.bounds['minY']) * self.resolution))
        r2 = tool_radius ** 2

        for row in range(min_row, max_row + 1):
            for col in range(min_col, max_col + 1):
                if not self.in_bounds(col, row):
                    continue
                cx = self.bounds['minX'] + (col + 0.5) / self.resolution
                cy = self.bounds['minY'] + (row + 0.5) / self.resolution
                if (cx - wx)**2 + (cy - wy)**2 > r2:
                    continue
                if z < self.data[row][col]:
                    self.data[row][col] = z

    def min_depth(self) -> float:
        return min(v for row in self.data for v in row)

    def cells_cut(self) -> int:
        return sum(1 for row in self.data for v in row if v < 0)


# ── Full simulation (runs instantly) ──────────────────────────────────────────

def run_depth_simulation(moves: list[Move], tool_dia: float, bounds: dict,
                          resolution: float = 2.0) -> DepthMap:
    dm          = DepthMap(bounds, resolution)
    tool_radius = tool_dia / 2.0

    for move in moves:
        if move.type != 'feed':
            continue
        dx   = move.to_pos['x'] - move.from_pos['x']
        dy   = move.to_pos['y'] - move.from_pos['y']
        dist = math.sqrt(dx**2 + dy**2)
        steps = max(1, int(math.ceil(dist / (tool_radius * 0.5))))

        for i in range(steps + 1):
            t = i / steps
            pos = interpolate_move(move, t)
            dm.update_at(pos['x'], pos['y'], pos['z'], tool_radius)

    return dm


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    moves = [
        Move('rapid', {'x':0,  'y':0,  'z':5},  {'x':25, 'y':0, 'z':5},  0),
        Move('feed',  {'x':25, 'y':0,  'z':5},  {'x':25, 'y':0, 'z':-3}, 100),
        Move('feed',  {'x':25, 'y':0,  'z':-3}, {'x':25, 'y':25,'z':-3}, 300),
        Move('rapid', {'x':25, 'y':25, 'z':-3}, {'x':25, 'y':25,'z':5},  0),
    ]

    # Test interpolation
    pos = interpolate_move(moves[0], 0.5)
    assert abs(pos['x'] - 12.5) < 1e-6, f"Interpolate X: {pos['x']}"
    print('✓ Interpolation: midpoint of rapid move')

    # Test durations
    total = estimate_total_time(moves, 1.0)
    assert total > 0, f'Total time should be > 0: {total}'
    print(f'✓ Estimated time: {total:.2f}s')

    # Test depth map
    bounds = {'minX': -5, 'maxX': 55, 'minY': -5, 'maxY': 55}
    dm = run_depth_simulation(moves, tool_dia=6, bounds=bounds, resolution=2)

    assert dm.min_depth() < 0, 'Depth map should have some negative values'
    assert dm.cells_cut() > 0, 'Some cells should have been cut'
    print(f'✓ Depth map: {dm.cells_cut()} cells cut, min depth {dm.min_depth():.3f}mm')

    print('\nAll simulation tests passed!')


if __name__ == '__main__':
    run_tests()

    # Demo: print a simple ASCII depth map
    moves = [
        Move('feed', {'x': i*2, 'y':25, 'z':-2}, {'x': i*2+2, 'y':25, 'z':-2}, 300)
        for i in range(25)
    ]
    bounds = {'minX': 0, 'maxX': 50, 'minY': 0, 'maxY': 50}
    dm     = run_depth_simulation(moves, tool_dia=4, bounds=bounds, resolution=1)

    print('\nASCII depth map (. = uncut, # = cut):')
    for row in range(dm.rows - 1, -1, -1):  # flip Y for display
        print(''.join('#' if dm.data[row][col] < 0 else '.' for col in range(dm.cols)))
```

---

## Part 11 — C++ Track: Week 9 — Templates

```cpp
// templates_demo.cpp
// Function templates and class templates.
// Applied to: a generic circular buffer for simulation state history.
//
// Compile: g++ -std=c++17 -Wall templates_demo.cpp -o templates_demo
// Run:     ./templates_demo

#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
#include <array>

// ── Function template ──────────────────────────────────────────────────────────

// A template function works for any type T that supports the operations used.
// The compiler generates a separate version for each type you use it with.
template<typename T>
T clamp(T value, T low, T high) {
    if (value < low)  return low;
    if (value > high) return high;
    return value;
}

// Template with multiple type parameters
template<typename T, typename U>
double distance(T x1, T y1, U x2, U y2) {
    double dx = static_cast<double>(x2 - x1);
    double dy = static_cast<double>(y2 - y1);
    return std::sqrt(dx*dx + dy*dy);
}

// ── Class template ─────────────────────────────────────────────────────────────

// A ring buffer (circular buffer) stores the last N items.
// When full, it overwrites the oldest item.
// Useful for: undo history, simulation state history, data smoothing.
template<typename T, size_t Capacity>
class RingBuffer {
private:
    std::array<T, Capacity> _data;
    size_t _head  = 0;  // next write position
    size_t _count = 0;  // number of valid items

public:
    void push(const T& value) {
        _data[_head] = value;
        _head = (_head + 1) % Capacity;
        if (_count < Capacity) _count++;
    }

    // Get the Nth most recent item (0 = most recent)
    const T& get(size_t nBack) const {
        if (nBack >= _count) {
            throw std::out_of_range("RingBuffer: index out of range");
        }
        // _head points to the NEXT write position.
        // Most recent = _head - 1 (wrapping around).
        size_t idx = (_head + Capacity - 1 - nBack) % Capacity;
        return _data[idx];
    }

    size_t size()     const { return _count; }
    bool   empty()    const { return _count == 0; }
    bool   full()     const { return _count == Capacity; }

    // Iterate from oldest to newest
    void forEach(std::function<void(const T&, size_t)> fn) const {
        for (size_t i = 0; i < _count; i++) {
            size_t idx = (_head + Capacity - _count + i) % Capacity;
            fn(_data[idx], i);
        }
    }
};

// ── Simulation position history ────────────────────────────────────────────────

struct Position3D {
    double x, y, z;
};

int main() {
    // ── Function template usage ─────────────────────────────────────────────
    std::cout << "clamp(5, 0, 10)     = " << clamp(5, 0, 10)       << "\n";
    std::cout << "clamp(-3, 0.0, 1.0) = " << clamp(-3.0, 0.0, 1.0) << "\n";
    std::cout << "clamp(20, 0, 10)    = " << clamp(20, 0, 10)       << "\n";
    std::cout << "distance(0,0, 3,4)  = " << distance(0, 0, 3, 4)   << "\n";
    std::cout << "\n";

    // ── RingBuffer usage ────────────────────────────────────────────────────
    RingBuffer<Position3D, 5> history;  // keep last 5 positions

    std::cout << "Pushing 8 positions into a capacity-5 ring buffer:\n";
    for (int i = 0; i < 8; i++) {
        history.push({ double(i * 10), double(i * 5), -1.5 });
        std::cout << "  after push " << i
                  << ": size=" << history.size()
                  << ", most recent=("
                  << history.get(0).x << ","
                  << history.get(0).y << ")\n";
    }

    std::cout << "\nLast 3 positions (most recent first):\n";
    for (size_t i = 0; i < 3 && i < history.size(); i++) {
        auto [x, y, z] = history.get(i);  // structured bindings
        std::cout << "  [" << i << "] (" << x << ", " << y << ", " << z << ")\n";
    }

    // ── Using std::string in the template ──────────────────────────────────
    RingBuffer<std::string, 3> log;
    log.push("G0 X0 Y0");
    log.push("G1 Z-3 F100");
    log.push("G1 X50 F300");
    log.push("G0 Z5");  // overwrites "G0 X0 Y0"

    std::cout << "\nG-code log (last 3):\n";
    log.forEach([](const std::string& s, size_t i) {
        std::cout << "  " << i << ": " << s << "\n";
    });

    return 0;
}
```

**New concepts:**

**Function template** `template<typename T>`: The compiler generates a
type-specific version of the function for each `T` it is called with. No
runtime overhead — it is a compile-time mechanism.

**Class template** `template<typename T, size_t N>`: A class parameterised by
a type and/or a compile-time constant. `std::vector<int>`, `std::array<int,5>`,
and `std::map<string,int>` are all class templates from the standard library.

**`size_t`**: The type of sizes and indices in C++. It is an unsigned integer,
large enough to hold the size of any object. Prefer `size_t` for array indices
and loop counters that will never be negative.

**Non-type template parameter** (`size_t Capacity`): Template parameters can be
values (not just types). This allows the array size to be part of the type —
`RingBuffer<int, 5>` and `RingBuffer<int, 10>` are different types. The array
lives on the stack (not the heap) because its size is known at compile time.

---

## What You Have After Lab 09

```
cam/
  js/
    simulation/
      SimController.js
      DepthMap.js
      sim-panel.js
python/
  simulation.py
```

**Working features:**

- Play/pause/step/scrub through any toolpath
- Tool cylinder moves in 3D with a yellow trail
- Depth map computed for material removal visualisation
- Estimated cycle time display
- Simulation report JSON export
- Speed multiplier (0.1× to 100×)

---

## DIVERGE POINTS

**1. Arc interpolation in simulation:** `SimController` linearly interpolates
along the from/to straight-line distance even for arc moves. For arcs, the
actual path is curved. Implement arc interpolation: compute the angular
position along the arc at each time step.

**2. Smooth camera follow:** When playing, the 3D camera could smoothly follow
the tool position. Use `camera.position.lerp(target, 0.05)` to smoothly track.

**3. Gouge detection:** After running the depth map simulation, compare the
depth map values to the intended geometry. If any location has a depth deeper
than the programmed depth, flag it as a potential gouge.

**4. Live depth map update:** Instead of running the depth map only when
"Run full simulation" is clicked, update it incrementally in the `onStep`
callback. This gives a live "cutting" visual effect.

**5. Multi-tool simulation:** Add a tool change event when the G-code contains
`M6 T1` etc. Track which tool is active and update the tool diameter and
appearance accordingly.

**6. Collision detection:** Check whether the tool shank or holder (modelled
as a larger cylinder above the cutting length) intersects the stock or fixtures.

---

_Continue to [Lab 10 — Expert Path](LAB-10-EXPERT-PATH.md)._
