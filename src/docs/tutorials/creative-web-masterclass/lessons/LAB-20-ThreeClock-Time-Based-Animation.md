# Creative Web Masterclass — LAB 20 — Three Clock: Time-Based Animation

**Prerequisites:** LAB-19. You have a lit Three.js scene with animated objects.

**What this lab adds:**
- `THREE.Clock` — Three.js's built-in time tracker
- `clock.getDelta()` — returns time since last call (delta time in seconds)
- `clock.getElapsedTime()` — total time since the clock started
- Frame-rate-independent animation with Three.js
- Using elapsed time for smooth oscillation and wave effects

**Time:** 40–55 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●             │
 │                                                      │
 │    Spheres arranged in a grid, each bobbing at a     │
 │    different phase — a smooth ripple wave effect     │
 └──────────────────────────────────────────────────────┘
   The wave uses elapsed time — not frame count — so
   it runs at the same speed on all hardware.
```

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-11, you tracked `lastTimestamp` and subtracted to get delta time. What does
>    `THREE.Clock` give you that eliminates this manual tracking?
> 2. `clock.getDelta()` and `clock.getElapsedTime()` are different. If you call them both
>    in the same `animate` function, is there a problem?
> 3. `sphere.rotation.y += 0.01` is frame-rate-dependent. How would you rewrite it using
>    `delta` to make it frame-rate-independent?
>
> *(Answers at the end)*

---

## Concept: `THREE.Clock`

**What it is:** `THREE.Clock` tracks time. It replaces the manual `lastTimestamp` pattern
from LAB-11 with two simple method calls:

```js
const clock = new THREE.Clock();   // start automatically

// In the animation loop:
const delta = clock.getDelta();          // seconds since last getDelta() call
const elapsed = clock.getElapsedTime();  // total seconds since clock was created
```

**`getDelta()`** returns the time since it was last called — perfect for
frame-rate-independent motion (`speed * delta`).

**`getElapsedTime()`** returns total time since the clock started — perfect for
continuous sine/cosine waves and oscillations.

**The critical rule:** Call `getDelta()` OR `getElapsedTime()` — **not both** in the same
loop. `getDelta()` internally updates the clock's "last call time" — if you call it and
then call `getElapsedTime()`, the second call reads state modified by the first. Use
`getElapsedTime()` for everything when you need time-based oscillations; use `getDelta()`
only when you need per-frame deltas.

**Watch for:** If you call `getDelta()` once, it resets the internal timer. Calling it
twice in one frame: the first call returns the frame delta (e.g., `0.016`); the second
call returns `0.000001` — the time between the two JavaScript calls. Always call it
exactly once per frame, at the start of `animate`.

---

## Concept: Elapsed Time for Oscillations

**What it is:** `clock.getElapsedTime()` gives a number that continuously increases.
Passing it to `Math.sin()` produces smooth oscillations that loop forever:

```js
const t = clock.getElapsedTime();

mesh.position.y = Math.sin(t) * 1.5;          // bobs at 1 cycle/second
mesh.position.y = Math.sin(t * 2) * 0.5;      // bobs twice as fast
mesh.rotation.y = t;                           // continuous rotation at 1 rad/s
mesh.rotation.y = t * Math.PI * 2;            // 1 full rotation per second
```

**Phase offset:** Add a constant to create a wave effect across multiple objects:

```js
// Each object has a different phase so they don't all bob at the same time
objectA.position.y = Math.sin(t + 0.0) * 0.5;     // phase 0
objectB.position.y = Math.sin(t + 1.0) * 0.5;     // phase 1 radian later
objectC.position.y = Math.sin(t + 2.0) * 0.5;     // phase 2 radians later
```

The phase offset shifts each sine wave so they start at a different point in their cycle.
The result is a ripple — objects move in sequence rather than all simultaneously.

---

## Step 1 — Create Files

Same HTML/CSS as previous Three.js labs.

---

## Step 2 — Setup and Grid of Spheres

`main.js`:

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Lights ----
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const clock = new THREE.Clock();   // start the clock

// ---- Grid of spheres ----
const COLS = 10;
const ROWS = 4;
const SPACING = 1.4;
const spheres = [];   // all sphere meshes

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const hue = (col / COLS) * 360;   // color varies across columns

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('hsl(' + hue + ', 70%, 60%)'),
        roughness: 0.3,
        metalness: 0.2
      })
    );

    // Position in a grid centered at the origin
    mesh.position.x = (col - COLS / 2 + 0.5) * SPACING;
    mesh.position.z = (row - ROWS / 2 + 0.5) * SPACING;

    // Store the grid coordinates for phase calculation
    mesh.userData.col = col;
    mesh.userData.row = row;

    scene.add(mesh);
    spheres.push(mesh);
  }
}
```

`mesh.userData` is an object Three.js provides on every object for storing custom data.
Using `mesh.userData.col = col` is the right place to store per-mesh data — it does not
interfere with Three.js's own properties.

`new THREE.Color('hsl(' + hue + ', 70%, 60%)')` creates a color from an HSL string —
the same format as CSS. This makes it easy to generate color ranges across the grid.

---

> **SAVE AND TRY**
>
> **You should see:** A 4×10 grid of colored spheres — red through cyan — all at y=0 (flat).
> No animation yet.

---

## Step 3 — Wave Animation with Elapsed Time

```js
function animate() {
  const t = clock.getElapsedTime();   // always use this — never getDelta for oscillations

  spheres.forEach(function (mesh) {
    const col = mesh.userData.col;
    const row = mesh.userData.row;

    // Phase: each column shifts the wave by 0.4 radians
    // Each row adds a small additional offset
    const phase = col * 0.4 + row * 0.2;

    // Y position oscillates based on time + phase
    mesh.position.y = Math.sin(t * 2 + phase) * 0.6;

    // Spin speed varies by column
    mesh.rotation.y = t * (0.5 + col * 0.05);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

`Math.sin(t * 2 + phase)`:
- `t` is elapsed seconds — increases continuously
- `* 2` doubles the frequency — 2 complete cycles per second
- `+ phase` shifts each sphere's starting point in the cycle
- `* 0.6` scales the amplitude to ±0.6 units of Y movement

Each sphere's `phase` is different, so they do not all reach their peak at the same time.
The result is a visible wave ripple across the grid.

---

> **SAVE AND TRY**
>
> **You should see:** The grid of spheres rippling up and down in a wave pattern — like
> a colorful oscillating 3D equalizer. The wave moves left-to-right (along columns).
>
> **Change something:** Change `col * 0.4` to `col * 0.8`. The wave spacing doubles —
> you can see more wave peaks at once. Change to `col * 0.1` — very slow wave, almost
> all spheres in sync. Change back to `0.4`.
>
> **Also try:** Change `Math.sin(t * 2 + phase)` to `Math.sin(t * 2 + phase) * Math.cos(t * 0.5 + row * 0.3)`.
> The amplitude now also oscillates — a more complex ripple pattern.

---

## Step 4 — Frame-Rate-Independent Rotation Using `getDelta`

For rotation speed controlled in "radians per second," use `getDelta`:

```js
// Replace the clock line
const clock = new THREE.Clock();
let totalAngle = 0;   // scene-level rotation accumulator

function animate() {
  const delta = clock.getDelta();   // use getDelta when you need per-frame speed control
  const t = clock.getElapsedTime(); // WARNING: calling both — see note below

  // ...
}
```

**Important note:** Calling both `getDelta()` and `getElapsedTime()` in the same frame
does cause the warning mentioned earlier — `getDelta` resets the internal timer. The
cleanest solution: use only `getElapsedTime()` for everything, and calculate your own
delta from frame-to-frame elapsed time differences:

```js
let lastT = 0;

function animate() {
  const t = clock.getElapsedTime();
  const delta = t - lastT;   // manual delta from elapsed time
  lastT = t;

  // Frame-rate-independent rotation: 1 radian per second
  spheres.forEach(function (mesh) {
    const phase = mesh.userData.col * 0.4 + mesh.userData.row * 0.2;
    mesh.position.y = Math.sin(t * 2 + phase) * 0.6;
    mesh.rotation.y += 1.0 * delta;   // 1 rad/s regardless of frame rate
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

This uses `getElapsedTime()` only — giving both oscillation time `t` and a correct
`delta` from the difference of consecutive `t` values.

---

> **SAVE AND TRY**
>
> **You should see:** The same wave, now with all spheres rotating at 1 radian per second
> independent of frame rate. The wave effect is identical — `getElapsedTime` is unchanged.

---

## 🎯 Challenge: Radial Wave

**You know:** Elapsed time, `Math.sin`, phase offsets, `userData`, `position`.

**Task:** Change the phase calculation from a column-based wave to a radial wave — distance
from center. Each sphere's phase is its distance from the center of the grid, so the wave
ripples outward from the center.

**Hint:**
```js
const cx = mesh.userData.col - COLS / 2;
const rz = mesh.userData.row - ROWS / 2;
const dist = Math.sqrt(cx * cx + rz * rz);   // distance from grid center
const phase = dist * 0.6;
```

Use `dist * 0.6` instead of `col * 0.4 + row * 0.2` for the phase.

---

<details>
<summary>▶ Show Solution</summary>

Change the `phase` calculation in `animate`:
```js
const col = mesh.userData.col - COLS / 2 + 0.5;
const row = mesh.userData.row - ROWS / 2 + 0.5;
const dist = Math.sqrt(col * col + row * row);
const phase = dist * 0.6;
mesh.position.y = Math.sin(t * 2 - phase) * 0.6;
```

The minus sign (`t * 2 - phase`) makes the wave travel outward from center instead of
inward. With `+ phase`, the wave travels inward. The sign controls wave direction.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Wave animation visible | Spheres bob in sequence, not all at once |
| Colors span the grid | Red through cyan (or similar) left to right |
| Frame-rate-independent | CPU throttle in DevTools — same speed |
| `getElapsedTime()` used | No `lastTimestamp` variable in code |

---

## What's Next

LAB 21 adds `OrbitControls` — mouse navigation that lets the user rotate and zoom the
camera. This is a Three.js add-on (not in the core library) and requires a different
import path.

---

## Quick Check Answers

**1. What does `THREE.Clock` eliminate?**
The manual pattern of saving `lastTimestamp`, computing `timestamp - lastTimestamp`, and
dividing by 1000. `clock.getDelta()` does all of this internally. You call it once per
frame and get a delta in seconds directly. The clock also handles the first-frame edge
case (where there is no previous timestamp) automatically.

**2. Calling both `getDelta()` and `getElapsedTime()` — is there a problem?**
Yes. `getDelta()` internally updates the clock's reference time. If you call `getDelta()`
and then `getElapsedTime()`, the elapsed time is correct, but if you call `getElapsedTime()`
and then `getDelta()`, the delta will be nearly zero because `getElapsedTime()` did not
update the reference time but the clock still tracks the elapsed time since start.
The safe approach: use only `getElapsedTime()`, compute your own delta by subtracting
the previous frame's elapsed time.

**3. Rewrite `sphere.rotation.y += 0.01` to use delta:**
```js
sphere.rotation.y += ROTATION_SPEED * delta;
// where ROTATION_SPEED = 0.01 * 60 = 0.6 radians per second
```
At 60fps, `delta ≈ 0.0167`, so `0.6 * 0.0167 ≈ 0.01` — same result. At 30fps,
`delta ≈ 0.033`, so `0.6 * 0.033 ≈ 0.02` — twice the per-frame rotation, compensating
for half the frames.
