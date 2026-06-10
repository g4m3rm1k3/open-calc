# TypeScript Tower Defense — LAB 03 — The Game Loop

**Prerequisites:** Lab 02 complete. You have a Vite + TypeScript project running at `localhost:5173` with a rotating cube.

**What this lab adds:**
- A proper game loop with `update()` and `render()` as separate functions
- Delta time — rotation speed measured in radians-per-second instead of radians-per-frame
- `THREE.Clock` — the tool that measures how much time has passed between frames

**Time:** 45–60 minutes.

---

## What You Will Build

The cube still rotates. The visual result is nearly identical to Lab 02. What changes is how the rotation is calculated:

**Before (Lab 02):**
```
box.rotation.y += 0.01   ← "0.01 radians every frame"
```
On a 60fps screen: 0.01 × 60 = 0.6 radians/second  
On a 120fps screen: 0.01 × 120 = 1.2 radians/second  
On a slow 20fps machine: 0.01 × 20 = 0.2 radians/second  
**Speed depends on the machine.**

**After (Lab 03):**
```
box.rotation.y += ROTATION_SPEED * deltaTime   ← "1 radian every second"
```
On any machine, any frame rate: always 1 radian/second  
**Speed is independent of the machine.**

This is the foundation every game loop is built on.

---

> **Quick Check — try to answer before reading further:**
>
> 1. If your game runs at 30fps and rotation is `+= 0.01` per frame, how fast does the cube appear to spin compared to 60fps? Write your answer before reading on.
> 2. What do you think "delta" means in the phrase "delta time"? (Hint: think about what the Greek letter delta means in math or science.)
> 3. Why do you think `update()` and `render()` should be separate functions rather than one combined function?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Measure Time With `THREE.Clock`

Before you can fix the frame-rate problem, you need a way to measure how much time has passed between frames. Three.js provides a clock for exactly this purpose.

---

### Concept: `THREE.Clock`

**What it is:** An object that tracks elapsed time. Each time you call `clock.getDelta()`, it returns the number of seconds that have passed since the last time you called it.

**The problem before:**
Without measuring time, you only know "a frame happened." You do not know if that frame took 16ms (60fps), 8ms (120fps), or 50ms (20fps). All you can do is add a fixed amount per frame — which produces different real-world speeds on different machines.

**The solution:**
```ts
const clock = new THREE.Clock();

// Inside the loop — called on every frame:
const deltaTime = clock.getDelta(); // seconds since last frame

// Typical values:
// 60fps screen:  deltaTime ≈ 0.0167  (1/60 of a second)
// 120fps screen: deltaTime ≈ 0.0083  (1/120 of a second)
// 20fps machine: deltaTime ≈ 0.05    (1/20 of a second)
```

**The key insight:**
If you multiply your speed by `deltaTime`, the result is always "distance per second" regardless of frame rate:

```
60fps:  speed × 0.0167 × 60 frames = speed × 1.0 per second
120fps: speed × 0.0083 × 120 frames = speed × 1.0 per second
20fps:  speed × 0.05   × 20 frames  = speed × 1.0 per second
```

The multiplication cancels out the frame rate. Speed becomes machine-independent.

**Smallest possible example:**
```ts
const clock = new THREE.Clock();

function loop(): void {
  requestAnimationFrame(loop);
  const deltaTime = clock.getDelta(); // seconds since last call
  console.log(deltaTime);            // prints ~0.016 at 60fps
}

loop();
```

**Why it matters here:** This is the core of every game loop ever written. Physics, movement, animations, timers — everything that changes over time is multiplied by `deltaTime` to become frame-rate independent.

**Watch for:** Call `getDelta()` exactly once per frame, at the very start of the loop. Calling it twice in one frame would give the second call nearly zero — the clock resets each call.

---

Add a `THREE.Clock` to `src/main.ts`. Place it just before the animation loop:

```ts
// ── Clock ─────────────────────────────────────────────────────────────────────
// Measures elapsed time between frames.
// getDelta() returns seconds since the last call — called once per frame.
const clock: THREE.Clock = new THREE.Clock();
```

Then update the `animate` function to call `getDelta()` and log the result:

```ts
function animate(): void {
  const deltaTime: number = clock.getDelta(); // seconds since last frame

  // Temporary: print deltaTime so we can see what values it produces.
  // Remove this line after the SAVE AND TRY below.
  console.log('deltaTime:', deltaTime);

  requestAnimationFrame(animate);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}
```

---

### SAVE AND TRY

Save. The browser refreshes. Open the console (`F12`).

**You should see:** A flood of numbers scrolling — approximately 60 per second. Each number looks like `0.016` or `0.017`. This is the time in seconds between each frame.

**In the console:**
```
deltaTime: 0.016721...
deltaTime: 0.016834...
deltaTime: 0.017102...
```

The exact numbers vary slightly — this is normal. Frame timing is never perfectly consistent. What matters is that they hover around `1 / 60 ≈ 0.01667`.

**Change something:** Switch to a different browser tab for a few seconds, then come back. Notice that the first `deltaTime` after returning is much larger — maybe `2.0` or `3.0`. This is because `requestAnimationFrame` pauses when the tab is hidden, but the clock keeps running. You will fix this in a moment.

Remove the `console.log` line before continuing.

---

## Step 2 — Separate `update()` and `render()`

Right now `animate()` does everything: measures time, updates rotation, and renders. As the game grows, this single function would become hundreds of lines. Separating update and render is one of the most important structural decisions in game development.

---

### Concept: Update and Render Separation

**What it is:** Splitting the game loop into two distinct functions with distinct responsibilities:
- `update(deltaTime)` — changes the state of the world
- `render()` — draws the current state of the world

**The problem before:**
```ts
function animate(): void {
  // This does everything — hard to reason about as code grows:
  box.rotation.y += 0.01;       // state change
  renderer.render(scene, camera); // drawing
}
```

**The solution:**
```ts
function update(deltaTime: number): void {
  // ONLY state changes here — no drawing
  box.rotation.y += 0.01;
}

function render(): void {
  // ONLY drawing here — no state changes
  renderer.render(scene, camera);
}

function animate(): void {
  const deltaTime = clock.getDelta();
  requestAnimationFrame(animate);
  update(deltaTime);  // 1. change state
  render();           // 2. draw state
}
```

**Why the separation matters:**
- `update()` is pure logic — it can be tested without a renderer (you will do this in Lab 23)
- `render()` can be called at a different rate than `update()` in advanced setups
- When the game has 20 systems (pathfinding, combat, spawning, etc.), each system gets its own update call — they do not interfere with rendering

**Why update comes before render:**
If you render before updating, you draw the state from the *previous* frame — the player presses a key, the update moves the character, but the render already happened. The character appears one frame behind. Always: update first, then render.

**The function parameter `: number`:**
```ts
function update(deltaTime: number): void {
//                         ↑ type annotation on a parameter
//                           "deltaTime must be a number"
```

Function parameters are one place where TypeScript cannot infer the type — it does not know what callers will pass. You always annotate parameters explicitly.

**The return type `: void`:**
```ts
function update(deltaTime: number): void {
//                                  ↑ return type annotation
//                                    "this function returns nothing"
```

`void` means the function performs an action but does not produce a value. Both `update` and `render` return `void` — they change state or draw, they do not calculate and return a result.

---

Replace the entire animation loop section at the bottom of `main.ts` with this:

```ts
// ── Game Loop ─────────────────────────────────────────────────────────────────
// update() changes the state of the world.
// render() draws the current state of the world.
// animate() calls both in the right order, once per frame.

function update(deltaTime: number): void {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  const deltaTime: number = clock.getDelta();
  requestAnimationFrame(animate);
  update(deltaTime);
  render();
}

animate();
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** The same rotating cube. No visual change — this step was structural, not visual.

**In the console:**
No output — the log is removed.

**Change something:** Move the `render()` call to before `update()`:
```ts
function animate(): void {
  const deltaTime = clock.getDelta();
  requestAnimationFrame(animate);
  render();   // ← moved before update
  update(deltaTime);
}
```
Save. The cube still rotates — at 60fps the difference between "update first" and "render first" is one frame, which is invisible. But it is still wrong in principle. Move it back to `update()` then `render()`.

---

## Challenge: What Does `void` Do?

**You know:** `void` is the return type for functions that do not return a value.

**Task:** Add a `return 42;` statement inside `update()`:
```ts
function update(deltaTime: number): void {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  return 42; // ← add this
}
```

Before saving, predict what TypeScript will do. Then save and look at VS Code.

**No hints — reason it through first.**

---

<details>
<summary>▶ Show Answer</summary>

VS Code underlines `return 42` in red:
```
Type 'number' is not assignable to type 'void'.
```

`void` is a contract: "this function returns nothing." Returning `42` breaks that contract, and TypeScript enforces it.

**Key insight:** Return type annotations protect callers. If `update()` were declared to return `number`, callers might try to use that return value: `const result = update(dt); if (result > 0) { ... }`. With `void`, TypeScript prevents anyone from depending on a return value that does not exist.

Remove `return 42` before continuing.

</details>

---

## Step 3 — Fix the Frame-Rate Problem

Now that `update()` receives `deltaTime`, you can use it to make the rotation speed frame-rate independent.

---

### Concept: Radians

**What it is:** The unit used to measure angles in mathematics and in Three.js. `box.rotation.x` is in radians, not degrees.

**The relationship between radians and degrees:**

| Degrees | Radians |
|---|---|
| 360° (full circle) | 2π ≈ 6.283 |
| 180° (half circle) | π ≈ 3.14159 |
| 90° (quarter circle) | π/2 ≈ 1.5708 |
| 1° | π/180 ≈ 0.01745 |

**Converting in code:**
```ts
const degrees = 90;
const radians = degrees * (Math.PI / 180); // = 1.5708

// Three.js also provides a helper:
const radians2 = THREE.MathUtils.degToRad(90); // same result
```

**Why Three.js uses radians:**
All mathematical formulas for rotation — the matrix math inside Three.js, the trigonometry functions `Math.sin()` and `Math.cos()` — work in radians. Degrees are a human convenience; radians are what the math requires.

**Why it matters here:** When you write `ROTATION_SPEED = 1.0`, that is `1.0 radian per second`. One full rotation takes `2π ≈ 6.28 seconds`. This is a concrete, measurable speed.

**Watch for:** The most common radian mistake is writing angles as degrees by accident. If `box.rotation.x = 90` makes the cube barely move instead of rotating 90 degrees, you forgot to convert. `90 degrees = 1.57 radians`, not `90`.

---

### Concept: Frame-Rate Independence

**What it is:** Making game behavior the same regardless of how many frames per second the game runs at.

**The problem, demonstrated with numbers:**

```ts
// Per-frame approach (Lab 02):
box.rotation.y += 0.01; // radians per frame

// At 60fps:  0.01 × 60 frames = 0.6 rad/sec
// At 120fps: 0.01 × 120 frames = 1.2 rad/sec  ← twice as fast
// At 30fps:  0.01 × 30 frames  = 0.3 rad/sec  ← half as fast
```

**The solution:**

```ts
const ROTATION_SPEED = 1.0; // radians per second — a real-world unit

function update(deltaTime: number): void {
  // deltaTime is "fraction of a second this frame took"
  box.rotation.y += ROTATION_SPEED * deltaTime;

  // At 60fps:  1.0 × 0.0167 × 60 frames = 1.0 rad/sec ✓
  // At 120fps: 1.0 × 0.0083 × 120 frames = 1.0 rad/sec ✓
  // At 30fps:  1.0 × 0.033  × 30 frames  = 1.0 rad/sec ✓
}
```

The multiplication cancels the frame rate out. The cube always completes one full rotation in exactly `2π ≈ 6.28 seconds`, regardless of the machine.

**Watch for:** This same pattern — `speed × deltaTime` — applies to everything that moves: enemies walking along a path, bullets flying, towers rotating to aim. Every moving thing in the game will use this formula.

---

Add the rotation speed constant to `CONFIG` and update `update()` to use it.

First, add `rotationSpeed` to the `GameConfig` interface:

```ts
interface GameConfig {
  canvasWidth:    number;
  canvasHeight:   number;
  cameraFov:      number;
  cameraNear:     number;
  cameraFar:      number;
  cameraZ:        number;
  boxColor:       number;
  rotationSpeed:  number; // ← add this: radians per second
}
```

Add it to `CONFIG`:

```ts
const CONFIG: GameConfig = {
  canvasWidth:   800,
  canvasHeight:  600,
  cameraFov:     75,
  cameraNear:    0.1,
  cameraFar:     1000,
  cameraZ:       5,
  boxColor:      0x00aaff,
  rotationSpeed: 1.0, // ← add this: 1 radian per second
};
```

Update `update()` to use `deltaTime`:

```ts
function update(deltaTime: number): void {
  // Multiply speed by deltaTime so rotation is frame-rate independent.
  // 1 radian × (seconds this frame took) = correct distance this frame.
  box.rotation.x += CONFIG.rotationSpeed * deltaTime;
  box.rotation.y += CONFIG.rotationSpeed * deltaTime;
}
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** The cube rotating at a steady pace. Visually similar to before but now at exactly `1 radian/second` regardless of frame rate.

**In the console:**
```js
CONFIG.rotationSpeed
```
**Expected:** `1`

**Change something:** Change `rotationSpeed` to `0.3` in `CONFIG`. Save. The cube rotates much more slowly — nearly still. Change it to `6.28` (one full rotation per second). The cube spins fast. Change it back to `1.0`.

---

## Step 4 — Clamp Delta Time

There is one remaining problem. When you switch away from the browser tab and back, `requestAnimationFrame` was paused — but `THREE.Clock` kept running. The first `deltaTime` after returning could be `5.0` seconds, causing the cube to jump forward by `5 × rotationSpeed` in a single frame.

---

### Concept: Clamping

**What it is:** Restricting a value to stay within a minimum and maximum range. If the value exceeds the range, it is set to the nearest boundary.

**The problem:**
```ts
const deltaTime = clock.getDelta(); // could be 5.0 after a tab switch
box.rotation.y += 1.0 * 5.0; // rotates 5 radians in one frame — a visible jump
```

**The solution:**
```ts
// Clamp deltaTime to a maximum of 0.1 seconds (10fps minimum).
// Any frame that took longer than 0.1 seconds is treated as if it took 0.1.
const deltaTime = Math.min(clock.getDelta(), 0.1);
```

`Math.min(a, b)` returns the smaller of the two values. If `getDelta()` returns `5.0`, `Math.min(5.0, 0.1)` returns `0.1`. If it returns `0.016`, `Math.min(0.016, 0.1)` returns `0.016` — unchanged.

**The tradeoff:**
With the clamp, the game slows down noticeably when the frame rate drops below 10fps, rather than jumping ahead. Slowing down is better than jumping — a jump can teleport enemies through walls.

**`Math.min` vs `Math.max`:**

| Function | Returns | Used for |
|---|---|---|
| `Math.min(a, b)` | The smaller value | Capping a maximum |
| `Math.max(a, b)` | The larger value | Enforcing a minimum |

For clamping between a min and max, you combine them:
```ts
const clamped = Math.max(MIN, Math.min(MAX, value));
// equivalent to: if value < MIN → MIN; if value > MAX → MAX; else → value
```

**Watch for:** The clamp value `0.1` (100ms = 10fps) is a game design choice. If a frame takes longer than 0.1 seconds, the game slows down rather than jumping. Choose the clamp based on what feels acceptable in your game.

---

Update `animate()` to clamp `deltaTime`:

```ts
// Maximum deltaTime: 0.1 seconds (= 10fps).
// Prevents large jumps when the browser tab was hidden.
const MAX_DELTA: number = 0.1;

function animate(): void {
  // Clamp deltaTime so tab switches do not cause large jumps.
  const rawDelta: number    = clock.getDelta();
  const deltaTime: number   = Math.min(rawDelta, MAX_DELTA);

  requestAnimationFrame(animate);
  update(deltaTime);
  render();
}
```

Add `MAX_DELTA` to `CONFIG` as well:

```ts
interface GameConfig {
  canvasWidth:   number;
  canvasHeight:  number;
  cameraFov:     number;
  cameraNear:    number;
  cameraFar:     number;
  cameraZ:       number;
  boxColor:      number;
  rotationSpeed: number;
  maxDelta:      number; // ← add this
}

const CONFIG: GameConfig = {
  canvasWidth:   800,
  canvasHeight:  600,
  cameraFov:     75,
  cameraNear:    0.1,
  cameraFar:     1000,
  cameraZ:       5,
  boxColor:      0x00aaff,
  rotationSpeed: 1.0,
  maxDelta:      0.1, // ← add this
};
```

Update `animate()` to use `CONFIG.maxDelta`:

```ts
function animate(): void {
  const rawDelta: number  = clock.getDelta();
  const deltaTime: number = Math.min(rawDelta, CONFIG.maxDelta);

  requestAnimationFrame(animate);
  update(deltaTime);
  render();
}
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** The rotating cube. No visual change in normal use.

**Test the clamp:** Switch to a different browser tab. Wait 3 seconds. Switch back. The cube should continue rotating smoothly from where it left off — no jump. Without the clamp it would snap forward by 3 seconds worth of rotation.

**In the console:**
```js
CONFIG.maxDelta
```
**Expected:** `0.1`

**Change something:** Change `maxDelta` to `0.01`. Save. Now switch tabs and back. The cube barely moves when you return — the clamp is so aggressive that even short pauses are capped at 10ms worth of movement. Change it back to `0.1`.

---

## Challenge: Add a Second Rotation Axis Speed

**You know:** `CONFIG.rotationSpeed` controls how fast the box spins on both X and Y. `update()` uses it for both axes.

**Task:** Add separate speeds to `CONFIG`: `rotationSpeedX: 0.5` and `rotationSpeedY: 2.0`. Update the `GameConfig` interface and `update()` to use them. The cube should tumble slowly on X but spin fast on Y.

**Starting code:**
```ts
function update(deltaTime: number): void {
  box.rotation.x += CONFIG.rotationSpeed * deltaTime;
  box.rotation.y += CONFIG.rotationSpeed * deltaTime;
}
```

**Hint:** You need to add two new properties to the interface and to `CONFIG`, then use each one for its respective axis.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add to the interface:
```ts
interface GameConfig {
  // ...existing properties...
  rotationSpeedX: number;
  rotationSpeedY: number;
}
```

Add to CONFIG (remove `rotationSpeed` if you like, or keep it — it is no longer used):
```ts
const CONFIG: GameConfig = {
  // ...existing properties...
  rotationSpeedX: 0.5,
  rotationSpeedY: 2.0,
};
```

Update `update()`:
```ts
function update(deltaTime: number): void {
  box.rotation.x += CONFIG.rotationSpeedX * deltaTime;
  box.rotation.y += CONFIG.rotationSpeedY * deltaTime;
}
```

**Key insight:** Having separate speeds in `CONFIG` means you change one value in one place to adjust behavior. No hunting for magic numbers inside functions. In the game, every tower's fire rate, every enemy's movement speed, and every projectile's velocity will follow this exact pattern — named value in `CONFIG`, multiplied by `deltaTime` in `update()`.

Reset to `rotationSpeed: 1.0` on both axes before moving to Lab 04.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `THREE.Clock` is used | `clock.getDelta()` called once at the top of `animate()` |
| `update()` and `render()` are separate functions | Both exist as named functions, both called from `animate()` |
| `update()` takes `deltaTime: number` as a parameter | Check the function signature — TypeScript shows the type on hover |
| Rotation uses `deltaTime` | `box.rotation.y += CONFIG.rotationSpeed * deltaTime` |
| Tab switch does not cause a jump | Switch tabs, wait, return — cube continues smoothly |
| `CONFIG.maxDelta` clamps the value | `Math.min(rawDelta, CONFIG.maxDelta)` in `animate()` |

---

## Your Complete `src/main.ts`

```ts
import * as THREE from 'three';

// ── GameConfig Interface ──────────────────────────────────────────────────────
interface GameConfig {
  canvasWidth:   number;
  canvasHeight:  number;
  cameraFov:     number;
  cameraNear:    number;
  cameraFar:     number;
  cameraZ:       number;
  boxColor:      number;
  rotationSpeed: number;
  maxDelta:      number;
}

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG: GameConfig = {
  canvasWidth:   800,
  canvasHeight:  600,
  cameraFov:     75,
  cameraNear:    0.1,
  cameraFar:     1000,
  cameraZ:       5,
  boxColor:      0x00aaff,
  rotationSpeed: 1.0,
  maxDelta:      0.1,
};

// ── Renderer ─────────────────────────────────────────────────────────────────
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight);
document.body.appendChild(renderer.domElement);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov,
  CONFIG.canvasWidth / CONFIG.canvasHeight,
  CONFIG.cameraNear,
  CONFIG.cameraFar
);
camera.position.z = CONFIG.cameraZ;

// ── Box ───────────────────────────────────────────────────────────────────────
const boxGeometry: THREE.BoxGeometry          = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.boxColor });
const box: THREE.Mesh                         = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// ── Lights ────────────────────────────────────────────────────────────────────
const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// ── Clock ─────────────────────────────────────────────────────────────────────
const clock: THREE.Clock = new THREE.Clock();

// ── Game Loop ─────────────────────────────────────────────────────────────────
function update(deltaTime: number): void {
  box.rotation.x += CONFIG.rotationSpeed * deltaTime;
  box.rotation.y += CONFIG.rotationSpeed * deltaTime;
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  const rawDelta: number  = clock.getDelta();
  const deltaTime: number = Math.min(rawDelta, CONFIG.maxDelta);

  requestAnimationFrame(animate);
  update(deltaTime);
  render();
}

animate();
```

---

## Quick Check Answers

**1. If the game runs at 30fps and rotation is `+= 0.01` per frame, how fast does it spin compared to 60fps?**
At 60fps: `0.01 × 60 = 0.6` radians per second. At 30fps: `0.01 × 30 = 0.3` radians per second — exactly half as fast. A player on a slow machine sees a sluggish game while a player on a fast machine sees a much quicker one. This is the frame-rate problem that `deltaTime` solves.

**2. What does "delta" mean in "delta time"?**
In mathematics and science, the Greek letter delta (Δ) means "change in" or "difference." Delta time means "the change in time" — specifically, the amount of time that changed (passed) between the previous frame and the current one. You will see "delta" used throughout game development and engineering to mean "the difference between two measurements."

**3. Why should `update()` and `render()` be separate functions?**
Because they do fundamentally different things. `update()` changes state — it is pure logic that you can test without a renderer. `render()` draws state — it only reads what `update()` already computed. If they were combined, you could not test the game logic without also running the renderer. You could not swap renderers without touching the game logic. As the game grows, each system (pathfinding, combat, spawning) gets its own piece of `update()` — they never touch `render()` because they only care about game state, not how it is drawn.

---

*End of Lab 03.*

*Lab 04 replaces the rotating cube with a game grid — a 2D array of tiles rendered as flat planes, viewed from an elevated camera angle. This is the first piece of the actual game.*
