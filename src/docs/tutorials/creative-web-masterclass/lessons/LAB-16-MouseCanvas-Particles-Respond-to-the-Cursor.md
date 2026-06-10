# Creative Web Masterclass — LAB 16 — Mouse Canvas: Particles Respond to the Cursor

**Prerequisites:** LAB-15. You have the particle field running. You know `mousemove`, `Math.random`, and the animation loop.

**What this lab adds:**
- Reading mouse position relative to the canvas
- The distance formula — how far is the cursor from each particle?
- Push force — pushing particles away from the mouse
- A glowing cursor circle drawn on canvas
- Friction — velocity decay so particles slow down naturally

**Time:** 55–70 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  · ·    ·         ·    ·   ·      · ·     ·          │
 │      ·     ○ ← cursor glow     ·            ·        │
 │  ·    · ·   ·  ← particles pushed away              │
 │     ·    ·     · ·   ·               · ·    ·        │
 │  ·      ·    ·    ·          ·    · ·      ·          │
 └──────────────────────────────────────────────────────┘
   Move the cursor — a glow circle follows it. Particles
   within 100px are pushed away from the cursor.
```

---

> **Quick Check — answer before reading further:**
>
> 1. The `mousemove` event gives you `event.clientX` and `event.clientY`. Are these the
>    same as the canvas coordinates (0,0 at canvas top-left)?
> 2. What is the distance formula between two points `(x1, y1)` and `(x2, y2)`?
> 3. If a particle is 50px away from the mouse, and the influence radius is 100px, should the
>    push force be stronger or weaker than for a particle 90px away?
>
> *(Answers at the end)*

---

## Concept: Mouse Position Relative to Canvas

**What it is:** `event.clientX` and `event.clientY` give mouse coordinates relative to the
*viewport*. If the canvas is positioned at `(0, 0)` in the viewport (fills the window),
these coordinates equal canvas coordinates. But if the canvas has an offset (e.g., a header
above it), you need to subtract the canvas's bounding box position.

**The correct way:**

```js
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', function (event) {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;   // canvas-relative X
  mouseY = event.clientY - rect.top;    // canvas-relative Y
});
```

`canvas.getBoundingClientRect()` returns the canvas's position on screen. Subtracting
`rect.left` and `rect.top` converts from viewport coordinates to canvas coordinates.

For a full-window canvas with `margin: 0`, `rect.left` and `rect.top` are both 0, so
`event.clientX` and `mouseX` are the same. But using `getBoundingClientRect()` is always
correct — it works even if the canvas is not at the top-left of the page.

---

## Math: The Distance Formula

**What it computes:** The straight-line distance between two points.

**Formula:**

```
distance = √( (x2 - x1)² + (y2 - y1)² )
```

In JavaScript:

```js
const dx = p.x - mouseX;        // horizontal gap
const dy = p.y - mouseY;        // vertical gap
const distance = Math.sqrt(dx * dx + dy * dy);
```

**Why each part:**
- `dx = p.x - mouseX` is the signed horizontal gap. Negative if the particle is left of
  the mouse.
- `dy = p.y - mouseY` is the signed vertical gap.
- `dx * dx + dy * dy` is the sum of squares (always positive — squaring removes the sign).
- `Math.sqrt(...)` is the square root, giving the actual straight-line distance.

**Optimization note:** `Math.sqrt` is slow. If you only need to compare distances (e.g.,
"is this closer than 100px?"), compare `dx*dx + dy*dy < 100*100` (10000) instead of
taking the square root. In this lab we need the actual distance for the force calculation,
so we take the square root.

---

## Concept: Push Force — Direction and Magnitude

**What it is:** When a particle is within the influence radius, it receives a push
*away from* the cursor. The force has two components:
1. **Direction:** unit vector pointing from cursor to particle
2. **Magnitude:** proportional to how close the particle is

**Direction (unit vector):**

```js
const dx = p.x - mouseX;   // points from cursor TO particle (away from cursor)
const dy = p.y - mouseY;
const distance = Math.sqrt(dx * dx + dy * dy);

// Normalize: divide by distance to get a unit vector (length = 1)
const nx = dx / distance;   // normalized x direction
const ny = dy / distance;   // normalized y direction
```

A unit vector has length 1 — it encodes direction only, not distance. Multiplying it by a
force magnitude gives a vector with the right direction and magnitude.

**Magnitude (falloff):**

The push force should be stronger when the cursor is very close and weaker at the edge
of the influence radius. Linearly scaling by `1 - distance / radius` achieves this:

```js
const INFLUENCE_RADIUS = 100;
const PUSH_STRENGTH = 8;

if (distance < INFLUENCE_RADIUS) {
  const force = (1 - distance / INFLUENCE_RADIUS) * PUSH_STRENGTH;
  p.vx += nx * force;
  p.vy += ny * force;
}
```

When `distance = 0` (cursor exactly on the particle), `1 - 0/100 = 1` — maximum force.
When `distance = 100` (at the edge), `1 - 100/100 = 0` — no force. The force falls off
linearly from center to edge.

**Watch for:** Always check `if (distance > 0)` before dividing by it. If a particle is
exactly at the mouse position, `distance = 0`, and dividing `dx / 0 = NaN` (Not a Number)
will corrupt the particle state.

---

## Concept: Friction / Velocity Decay

**What it is:** Without friction, each push adds velocity permanently — particles accelerate
indefinitely. Multiplying velocity by a number slightly less than 1 each frame creates
friction — velocity gradually shrinks toward zero.

```js
p.vx *= 0.95;   // each frame, x velocity is 95% of what it was — loses 5% per frame
p.vy *= 0.95;
```

After 14 frames at 60fps (about 0.23 seconds), velocity is `0.95^14 ≈ 0.49` — about half
of the initial push. After 50 frames (0.8 seconds), it is `0.95^50 ≈ 0.077` — nearly gone.

The base particle drift velocity (`vy`) is also affected, so particles slow down and stop
after a push. To prevent them from stopping completely (you want them to always drift), add
back the baseline velocity after applying friction:

```js
p.vx = p.vx * 0.95 + p.baseVx * 0.05;   // decays toward base velocity, not zero
p.vy = p.vy * 0.95 + p.baseVy * 0.05;   // pulls back toward original drift speed
```

This makes particles "snap back" to their original speed after being disturbed.

---

## Step 1 — Copy the LAB-15 Project

```
projects/lab-16/index.html   (same as lab-15)
projects/lab-16/styles.css   (same as lab-15)
projects/lab-16/main.js      (start fresh — built on top of lab-15 concepts)
```

`index.html` and `styles.css` are identical to LAB-15. Only `main.js` changes.

---

## Step 2 — Extend the Particle Object with Base Velocity

`main.js`:

```js
const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let mouseX = 0;
let mouseY = 0;
let mouseOnCanvas = false;   // track whether mouse is over the canvas

canvas.addEventListener('mousemove', function (event) {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  mouseOnCanvas = true;
});

canvas.addEventListener('mouseleave', function () {
  mouseOnCanvas = false;   // cursor left — stop drawing the glow
});

const PARTICLE_COUNT = 200;
const particles = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const speedTier = Math.random();

  // Store base velocity — used to pull velocity back after disruption
  const baseVx = (Math.random() - 0.5) * 0.5;
  const baseVy = -(speedTier * 2 + 0.3);

  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: baseVx,           // current velocity — may differ from base after a push
    vy: baseVy,
    baseVx: baseVx,       // original drift velocity — used for recovery
    baseVy: baseVy,
    radius: speedTier * 2.5 + 0.5,
    alpha: speedTier * 0.6 + 0.1,
    hue: Math.random() * 60 + 220
  });
}
```

Each particle now has both `vx/vy` (current velocity, which changes) and `baseVx/baseVy`
(the original drift values, which never change). The animation loop uses `baseVx/baseVy` to
pull the particle back toward its natural speed after a push.

---

> **SAVE AND TRY**
>
> **You should see:** The same particle field as LAB-15. No visible change yet — the extra
> properties are there but not used. Open DevTools Console: `particles[0]` should now show
> both `vx` and `baseVx` fields.

---

## Step 3 — The Animation Loop with Mouse Interaction

```js
const INFLUENCE_RADIUS = 120;
const PUSH_STRENGTH = 6;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(function (p) {
    // --- MOUSE PUSH ---
    if (mouseOnCanvas) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distSq = dx * dx + dy * dy;           // squared distance (no sqrt yet)
      const radiusSq = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

      if (distSq < radiusSq && distSq > 0) {      // within radius, not at exact center
        const dist = Math.sqrt(distSq);            // only compute sqrt when needed
        const nx = dx / dist;                      // unit vector: from mouse toward particle
        const ny = dy / dist;
        const force = (1 - dist / INFLUENCE_RADIUS) * PUSH_STRENGTH;
        p.vx += nx * force;
        p.vy += ny * force;
      }
    }

    // --- FRICTION: velocity decays toward base velocity each frame ---
    p.vx = p.vx * 0.92 + p.baseVx * 0.08;
    p.vy = p.vy * 0.92 + p.baseVy * 0.08;

    // --- MOVE ---
    p.x += p.vx;
    p.y += p.vy;

    // --- WRAP ---
    if (p.y < -p.radius) { p.y = canvas.height + p.radius; p.x = Math.random() * canvas.width; }
    if (p.x < -p.radius) { p.x = canvas.width + p.radius; }
    if (p.x > canvas.width + p.radius) { p.x = -p.radius; }

    // --- DRAW ---
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 65%, ' + p.alpha + ')';
    ctx.fill();
  });

  // --- DRAW CURSOR GLOW ---
  if (mouseOnCanvas) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, INFLUENCE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner bright center
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(108, 99, 255, 0.8)';
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

Reading the key sections:
- `distSq < radiusSq && distSq > 0`: comparing squared values avoids `Math.sqrt` for the
  rejection test. Only compute `Math.sqrt` for particles that pass the test.
- `p.vx = p.vx * 0.92 + p.baseVx * 0.08`: weighted average — 92% current, 8% base.
  Over time this pulls velocity back toward `baseVx`.
- Cursor glow: draw a large circle at mouse position showing the influence radius, plus
  a small bright center dot.

---

> **SAVE AND TRY**
>
> **You should see:** The particle field with a glowing circle following the cursor. Move
> the cursor through the particles — they scatter away. Remove the cursor — they drift
> back toward their original motion.
>
> **Change something:** Change `PUSH_STRENGTH` from `6` to `20`. Move the cursor — particles
> shoot away violently. Change to `2` for a gentle nudge. Change back to `6`.
>
> **Also try:** Change `INFLUENCE_RADIUS` from `120` to `200`. The influence circle is larger
> and more particles are affected at once.
>
> **In DevTools Console:**
> ```js
> particles[0].vx   // check while moving cursor near that particle
> ```
> The value changes when the cursor is near. Move away — it settles back toward `baseVx`.

---

## 🎯 Challenge: Click Explosion

**You know:** Mouse events, push force, distance formula, velocity.

**Task:** When the user clicks anywhere on the canvas, all particles within 200px of the
click point receive a burst of velocity — much larger than the normal hover push. Use a
`click` event on the canvas and apply a force of 20 (compared to the normal `PUSH_STRENGTH`
of 6).

**Hint:** The `click` event also has `clientX` and `clientY`. Use `getBoundingClientRect`
the same way as for `mousemove` to get canvas-relative coordinates.

---

<details>
<summary>▶ Show Solution</summary>

```js
canvas.addEventListener('click', function (event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const BLAST_RADIUS = 200;
  const BLAST_STRENGTH = 20;

  particles.forEach(function (p) {
    const dx = p.x - clickX;
    const dy = p.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < BLAST_RADIUS && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      const force = (1 - dist / BLAST_RADIUS) * BLAST_STRENGTH;
      p.vx += nx * force;
      p.vy += ny * force;
    }
  });
});
```

**Key insight:** The click handler runs outside the animation loop — it modifies particle
`vx`/`vy` directly. The next frame of `animate()` reads the updated velocities and the
particles move accordingly. State changes can come from anywhere; the loop just reads
what it finds.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Cursor glow circle visible | Move mouse over canvas — glowing ring appears |
| Particles scatter from cursor | Move slowly — nearby particles push away |
| Particles recover after cursor moves | Move away — disturbed particles drift back |
| `mouseOnCanvas` flag works | Move cursor off canvas — glow disappears |
| Friction working | Pushed particles decelerate, not stop instantly |

---

## What's Next

LAB 17 starts Three.js — three objects are always required: a `scene`, a `camera`, and a
`renderer`. You will set up the minimum Three.js scene and see a rotating cube.

---

## Transfer Exercise

The push force formula uses `(1 - dist/radius) * strength` — a linear falloff. Real-world
forces (gravity, electromagnetism) use inverse-square falloff: force = `strength / (dist * dist)`.

Modify the push force in the challenge solution to use `strength / (dist * dist)`. How does
the behavior change? Why would linear falloff feel better for a UI effect even if inverse-square
is more "physically correct"?

---

## Quick Check Answers

**1. Are `event.clientX/Y` the same as canvas coordinates?**
Only if the canvas is positioned at (0, 0) in the viewport (no offset). In general, no.
`clientX/Y` is relative to the browser's viewport. Canvas coordinates are relative to the
canvas's top-left corner. To convert, subtract `canvas.getBoundingClientRect().left` from
`clientX` and `.top` from `clientY`. For a full-window canvas with no margin this
difference is zero — but using `getBoundingClientRect` is always safe.

**2. What is the distance formula between (x1, y1) and (x2, y2)?**
`distance = Math.sqrt((x2 - x1)² + (y2 - y1)²)`
This is the Pythagorean theorem applied to a right triangle where the legs are the
horizontal and vertical gaps between the two points.

**3. Should the push be stronger 50px away or 90px away?**
50px away — closer to the cursor means stronger force. The formula `(1 - dist/radius) * strength`
gives `(1 - 50/100) * 8 = 4` at 50px, and `(1 - 90/100) * 8 = 0.8` at 90px. The force
at 50px is 5× stronger. Particles near the cursor are pushed away quickly; particles
near the edge of the influence radius are barely nudged.
