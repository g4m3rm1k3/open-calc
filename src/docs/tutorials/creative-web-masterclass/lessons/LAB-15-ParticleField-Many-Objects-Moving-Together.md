# Creative Web Masterclass — LAB 15 — Particle Field: Many Objects Moving Together

**Prerequisites:** LAB-14. You know canvas setup, `ctx.arc`, `ctx.fillRect`, and `requestAnimationFrame`.

**What this lab adds:**
- Particle objects — JavaScript objects with position, velocity, and appearance
- An array of particles — the `particles` array (always this name)
- `Math.random()` — generating random initial values
- The particle loop: create → animate → wrap → draw
- Alpha fade using `rgba()` for depth

**Time:** 55–70 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  · ·    ·         ·    ·   ·      · ·     ·          │
 │      ·     · ·         ·       ·            ·        │
 │  ·         ·    ·   ·    ·           ·    ·          │
 │     · ·         ·       · ·   ·               · ·    │
 │  ·      ·    ·    ·          ·    · ·      ·          │
 └──────────────────────────────────────────────────────┘
   200 particles drifting slowly upward, each with a
   random size, speed, and opacity. They wrap at the top.
```

---

> **Quick Check — answer before reading further:**
>
> 1. You want 200 circles on screen, each moving independently. Would you create 200 DOM
>    elements, or use canvas? Why?
> 2. Each particle needs an x, y, vx (x-velocity), vy (y-velocity), radius, and alpha.
>    What JavaScript data type would you use to represent one particle?
> 3. What happens every frame to a particle at `y = -5` (above the top edge) that moves
>    upward? What should happen instead?
>
> *(Answers at the end)*

---

## Concept: Particle Objects

**What it is:** A particle is a plain JavaScript object with properties that describe its
current state. Every frame, the animation loop reads the properties (position, velocity)
and draws the particle, then updates the properties by adding velocity to position.

**Canonical structure:**

```js
const particle = {
  x: 400,        // current x position (pixels)
  y: 300,        // current y position (pixels)
  vx: 0.5,       // x velocity — how much x changes per frame
  vy: -1.2,      // y velocity — negative = moving upward
  radius: 3,     // circle radius in pixels
  alpha: 0.7     // opacity (0 = invisible, 1 = fully opaque)
};
```

Each frame:
1. Draw the circle at `(particle.x, particle.y)`
2. Update: `particle.x += particle.vx; particle.y += particle.vy;`
3. Wrap: if the particle has left the canvas, move it back to the other side

**What it hides:** Nothing — this is plain data in a plain object. The simplicity is the
point. The animation loop works on the object; the object does not know about the loop.

**Project Application:**
LAB-16 adds mouse interaction to these same particles. LAB-32 (portfolio canvas widget)
uses a more advanced version with connection lines between nearby particles.

**Watch for:** Do not add methods to particle objects in this lab. Keep them as plain data
objects. The `animate` function does all the work — the particles are passive data.

---

## Concept: The `particles` Array

**What it is:** `particles` is an array of particle objects. The animation loop iterates
over it every frame to update and draw all particles.

```js
const particles = [];   // always this name

// Create 200 particles
for (let i = 0; i < 200; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,    // random between -0.25 and +0.25
    vy: -(Math.random() * 1.5 + 0.5),   // random between -0.5 and -2 (always upward)
    radius: Math.random() * 2 + 1,      // random between 1 and 3
    alpha: Math.random() * 0.5 + 0.2    // random between 0.2 and 0.7
  });
}
```

Each particle gets random initial values so they do not all start at the same place and
move at the same speed. `Math.random()` returns a number from 0 (inclusive) to 1 (exclusive).

**Why the naming convention:** The `particles` array is always named `particles` in this
course (and in most particle system code). When you see `particles.forEach(...)` you
immediately know what is being iterated.

---

## Concept: `Math.random()` Recipes

**What it is:** `Math.random()` returns a random number in [0, 1). These formulas scale
and shift it to produce useful ranges:

| Formula | Result range | Use case |
|---|---|---|
| `Math.random()` | 0 to 1 | opacity, fraction |
| `Math.random() * N` | 0 to N | position (0 to width) |
| `Math.random() * N + min` | min to min+N | radius (1 to 4), speed |
| `(Math.random() - 0.5) * N` | -N/2 to N/2 | x/y velocity (can go either direction) |
| `Math.floor(Math.random() * N)` | 0 to N-1 (integer) | random array index |

**Watch for:** `Math.random()` never returns exactly 1 — the upper bound is exclusive. For
positions from 0 to `canvas.width`, `Math.random() * canvas.width` is correct. You will
never get a particle exactly at `canvas.width` (the right edge), which is fine.

---

## Step 1 — Create Files

`projects/lab-15/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 15 — Particle Field</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <canvas id="main-canvas"></canvas>
    <script src="main.js"></script>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server. **You should see:** An empty dark page. Same as LAB-14.

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #0d0d1a; overflow: hidden; }
#main-canvas { display: block; }
```

Same minimal canvas CSS as LAB-14.

---

## Step 3 — Set Up Canvas and Create Particles

`main.js` — start with just canvas setup and particle creation. Draw nothing yet:

```js
const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const PARTICLE_COUNT = 200;
const particles = [];

// Create all particles with random starting values
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(Math.random() * 1.5 + 0.5),
    radius: Math.random() * 2 + 1,
    alpha: Math.random() * 0.5 + 0.2
  });
}
```

`(Math.random() - 0.5) * 0.5` for `vx`: `Math.random()` is 0–1, minus 0.5 makes it
-0.5 to 0.5, times 0.5 makes it -0.25 to 0.25. Small horizontal drift.

`-(Math.random() * 1.5 + 0.5)` for `vy`: `Math.random() * 1.5 + 0.5` is 0.5–2, negated
so it is always -0.5 to -2. Always upward.

---

> **SAVE AND TRY**
>
> **You should see:** Nothing visible yet — the canvas is dark. But open DevTools Console:
> ```js
> particles[0]   // inspect the first particle
> ```
> **Expected:** An object like `{ x: 342.1, y: 189.7, vx: -0.12, vy: -1.34, radius: 1.8, alpha: 0.43 }`.
> Run `particles.length` — should be 200.

---

## Step 4 — The Animation Loop: Update, Draw, Wrap

Add the animation function. This is the complete particle loop:

```js
function animate() {
  // Clear the canvas each frame — particles should not leave trails
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(function (p) {
    // --- UPDATE: move the particle ---
    p.x += p.vx;
    p.y += p.vy;

    // --- WRAP: if the particle exits the canvas, move it back in ---
    if (p.y < -p.radius) {
      // Particle has scrolled off the top — reset to bottom with a new random x
      p.y = canvas.height + p.radius;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -p.radius) { p.x = canvas.width + p.radius; }
    if (p.x > canvas.width + p.radius) { p.x = -p.radius; }

    // --- DRAW: render the particle as a circle ---
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(108, 99, 255, ' + p.alpha + ')';   // purple with variable opacity
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

The wrap logic: `p.y < -p.radius` means the particle has moved entirely above the top
edge (including its own radius). It resets to just below the bottom edge — `canvas.height
+ p.radius` — so it smoothly enters from below. A new random `x` prevents all particles
from appearing in a column.

`'rgba(108, 99, 255, ' + p.alpha + ')'` builds the color string with the particle's own
opacity. `108, 99, 255` is the RGB equivalent of `#6c63ff`.

---

> **SAVE AND TRY**
>
> **You should see:** 200 small purple dots slowly drifting upward, each at slightly
> different speeds and sizes. When a dot reaches the top, it reappears at the bottom.
> The motion is calm and continuous.
>
> **Change something:** Change `PARTICLE_COUNT` from 200 to 500. Save. The canvas is much
> denser. Change to 50 for a sparse field. Change back to 200.
>
> **Also try:** Change `vy: -(Math.random() * 1.5 + 0.5)` to `vy: (Math.random() * 1.5 + 0.5)`
> (remove the minus). Particles now drift downward and wrap at the bottom edge. Change
> the wrap logic: `if (p.y > canvas.height + p.radius) { p.y = -p.radius; }`. Change back.

---

## Step 5 — Add Depth: Size and Alpha Variation

The current particles all look flat because they move at similar speeds. Adding a correlation
between speed, size, and alpha makes fast particles look closer (bigger, brighter) and slow
ones look farther away (smaller, dimmer) — exactly like the parallax layers in LAB-13.

Update the particle creation loop:

```js
for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Speed tier controls size and opacity as well — faster = closer = bigger = brighter
  const speedTier = Math.random();   // 0 = slowest/farthest, 1 = fastest/closest
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(speedTier * 2 + 0.3),              // 0.3 to 2.3 px/frame
    radius: speedTier * 2.5 + 0.5,           // 0.5 to 3.0 px radius
    alpha: speedTier * 0.6 + 0.1             // 0.1 to 0.7 opacity
  });
}
```

Now `speedTier` is used for three properties at once: fast particles are large and opaque,
slow particles are tiny and faint. The single random value creates a consistent relationship
— no particle will be simultaneously fast and invisible.

---

> **SAVE AND TRY**
>
> **You should see:** The same drifting particles, but now with more visible variation.
> A few bright, large dots move quickly upward. Many small, faint specks drift slowly.
> The effect looks more like depth — like looking at stars near and far.
>
> **Compare:** Change `speedTier` back to a flat `Math.random()` for each property (separate
> randoms, no correlation). The depth illusion disappears — large dots can be slow and faint
> dots can be fast.

---

## 🎯 Challenge: Color Variation

**You know:** Particle creation, `rgba()`, `Math.random()`.

**Task:** Give each particle a random hue instead of all particles being the same purple.
Use HSL color: `'hsla(' + hue + ', 70%, 65%, ' + alpha + ')'`. Store `hue` as a particle
property. Set it to `Math.random() * 60 + 220` for a range from blue (220°) to purple (280°).

**Hint:** Add `hue` to the particle object and use it in the `fillStyle` string.

---

<details>
<summary>▶ Show Solution</summary>

In the particle creation loop, add a `hue` property:
```js
hue: Math.random() * 60 + 220   // 220°–280°: blue to purple
```

In the draw section, change the fill:
```js
ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 65%, ' + p.alpha + ')';
```

**Key insight:** HSL (Hue, Saturation, Lightness) makes color ranges easy — you set a
range of degrees (hue) rather than mixing RGB values. `220`–`280` covers cool blue to
purple. `0`–`360` covers the full spectrum.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| 200 particles visible | Canvas filled with dots |
| Particles drift upward | Motion is upward, not random direction |
| Particles wrap at top | Dots reappear at bottom after reaching top |
| Size/alpha variation | Mix of large/bright and small/faint dots |
| No trails | Each frame is clean (clearRect working) |

---

## What's Next

LAB 16 adds mouse interaction — particles near the cursor are pushed away, and a glowing
circle follows the mouse. You will use the distance formula for the first time.

---

## Transfer Exercise

The `particles` array pattern is the foundation of every particle system in games and
creative coding. In a game engine like Unity, each particle would be a `GameObject` with
a `Particle` component. Compare the manual array approach (this lab) to a Unity `ParticleSystem`
component: what does the Unity component hide from you? What control do you gain by managing
the array manually?

---

## Quick Check Answers

**1. 200 DOM elements or canvas?**
Canvas. DOM elements are tracked by the layout engine — each element has a style,
geometry, event listeners, and participates in layout calculations. Moving 200 DOM
elements per frame (each requiring a style write) can cause hundreds of layout
recalculations. Canvas draws 200 circles directly as pixels — no layout calculations,
no event system, just pixel writes. Above ~50–100 animated DOM elements, canvas is
significantly faster.

**2. What data type for one particle?**
A plain JavaScript object: `{ x, y, vx, vy, radius, alpha }`. Each property is a number.
The object is a named collection of related values — it is not a class instance and has
no methods. In JavaScript, plain objects are the simplest and most efficient data
container for particle state.

**3. What happens to a particle at `y = -5` moving upward?**
Each frame it moves further above the canvas — `y = -5, -6, -7, -8...` — eventually
reaching negative infinity. It disappears from view and wastes CPU on drawing a circle
that will never be seen. The fix is wrapping: when `y < -radius`, reset `y` to
`canvas.height + radius` so the particle re-enters from the bottom.
