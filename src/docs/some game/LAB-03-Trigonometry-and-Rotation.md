# PhaserJS — LAB 03 — Trigonometry & Rotation

**Prerequisites:** LAB 02 (Vectors & Movement). You have a dot controllable with arrow keys, a velocity vector `{ vx, vy }`, keyboard input via `keys`, and `ctx.save/restore`. You understand unit vectors and normalisation.

**What this lab adds:**
- The dot becomes a triangle ship that visually faces a direction
- Left/Right arrows rotate the ship; Up arrow thrusts it forward
- The ship moves in whichever direction it's pointing (not just along axes)
- `ctx.translate` and `ctx.rotate` for drawing rotated shapes

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 02, pressing right gave `vx = 3, vy = 0`. In this lab, the ship can face any angle. If the ship faces 45°, what do you predict `vx` and `vy` will be? (Hint: we want speed = 3.)
> 2. If `Math.cos(0)` = 1 and `Math.cos(Math.PI)` = -1, what would you guess `Math.cos(Math.PI / 2)` equals?
> 3. The ship rotates. When you draw a triangle "pointing right" and then rotate it 90°, where does it point?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
┌──────────────────────────────────────┐
│                                      │
│    ←  →  : rotate ship               │
│    ↑     : thrust forward            │
│                                      │
│            ▲   ← ship faces up       │
│           / \     and drifts         │
│                                      │
│  (ship wraps at edges, drifts        │
│   in its thrust direction)           │
└──────────────────────────────────────┘
```

The ship is a triangle that visually rotates. Left/right arrows turn it. Up arrow fires the engine — the ship accelerates in whatever direction it's currently facing. Release the thrust — the ship coasts (like Asteroids). No braking unless you face backwards and thrust.

---

## Concept: The Angle — Storing Rotation as a Number

**What it is:** A single number (in **radians**) representing which direction the ship is facing. Zero means facing right. The angle increases clockwise on canvas (because Y increases downward).

**What radians are:**
A **radian** is a unit of angle measurement, like degrees. The relationship:
```
360° = 2 × π radians  (where π ≈ 3.14159)
180° = π radians
 90° = π/2 radians
  0° = 0 radians
```

Why radians? Because `Math.sin` and `Math.cos` in JavaScript take radians, not degrees. All trigonometry in game programming uses radians.

**Project Application (The "Why" here):**
Instead of storing `vx` and `vy` as our primary direction (LAB 02 approach), we'll store one angle. From that angle, `Math.cos` and `Math.sin` compute the direction vector automatically. This lets us rotate with simple `angle += ROTATION_SPEED` rather than rotating a vector manually.

**The dot state will change:**
```js
// LAB 02: stored velocity components directly
const dot = { x, y, vx, vy };

// LAB 03: store angle and speed, compute velocity when thrusting
const ship = { x, y, angle: 0, vx: 0, vy: 0 };
// angle = 0 means facing right (positive x direction)
```

**Watch for:** JavaScript's `Math.cos` / `Math.sin` expect radians. If you pass degrees, you'll get wrong results. Always convert: `degrees × (Math.PI / 180) = radians`.

---

### Math: `sin` and `cos` — The Unit Circle

**What it computes:** Given an angle, `Math.cos(angle)` gives the x-component of a unit vector pointing in that direction. `Math.sin(angle)` gives the y-component.

**The real-world analogy:**
Imagine a clock face with a unit-length hand (length = 1). The hand starts pointing right (3 o'clock position). As you rotate the hand, its tip traces a circle. At any moment:
- The tip's horizontal distance from centre = `cos(angle)`
- The tip's vertical distance from centre = `sin(angle)`

```
              (cos 90°=0, sin 90°=1)
                       ↑
                       │
(cos 180°=-1, 0) ←────●────→ (cos 0°=1, sin 0°=0)
                       │
                       ↓
              (cos 270°=0, sin 270°=-1)
```

**Canonical example — unit circle values:**

| Angle (degrees) | Angle (radians) | cos | sin | Direction |
|---|---|---|---|---|
| 0° | 0 | 1 | 0 | → right |
| 90° | π/2 | 0 | 1 | ↓ down (canvas!) |
| 180° | π | -1 | 0 | ← left |
| 270° | 3π/2 | 0 | -1 | ↑ up (canvas!) |

**Note:** On canvas, 90° points DOWN (not up) because Y increases downward.

**In code:**
```js
const angle   = Math.PI / 4;          // 45° in radians
const dirX    = Math.cos(angle);      // 0.707... (x component of direction)
const dirY    = Math.sin(angle);      // 0.707... (y component)
// This is already a unit vector — Math.sqrt(dirX² + dirY²) = 1 ✓
```

**To move at speed S in direction angle:**
```js
const vx = Math.cos(angle) * THRUST_SPEED;
const vy = Math.sin(angle) * THRUST_SPEED;
```
This is the LAB 02 normalisation workflow — but `cos/sin` already produce a unit vector, so no manual normalisation needed.

**Why it matters here:** When the player presses Up (thrust), we compute `vx` and `vy` from `ship.angle`. The ship accelerates in exactly the direction it's facing — however much it has been rotated.

**Watch for:** `Math.sin(0)` = 0, `Math.cos(0)` = 1. Zero angle points RIGHT, not up. This surprises everyone. In many game frameworks angle 0 points up — JavaScript's canvas is not one of them.

---

## Concept: Canvas Transforms — `ctx.translate` and `ctx.rotate`

**What it is:** Two canvas methods that shift the drawing origin and rotate the drawing axis before anything is drawn. Used to draw shapes at a position and angle without manually rotating every vertex.

**The problem before:**
```js
// To draw a triangle pointing at angle θ, centred at (cx, cy):
// You'd need to rotate each vertex manually:
const tip = {
  x: cx + Math.cos(angle) * size,
  y: cy + Math.sin(angle) * size,
};
const left = {
  x: cx + Math.cos(angle + 2.5) * size * 0.6,
  y: cy + Math.sin(angle + 2.5) * size * 0.6,
};
// ...and so on for every vertex, every frame. 
// Complex, fragile, hard to read.
```

**The solution:** Move the origin TO the object's position, rotate the coordinate system to the object's angle, then draw as if the object is at (0, 0) facing right.

```js
ctx.save();
ctx.translate(ship.x, ship.y);  // move origin to ship's position
ctx.rotate(ship.angle);          // rotate the coordinate system by ship's angle
// Now draw a triangle centred at (0,0) pointing right — canvas handles the math
ctx.beginPath();
ctx.moveTo(15, 0);    // tip: 15px to the right of origin
ctx.lineTo(-10, -8);  // back-left
ctx.lineTo(-10,  8);  // back-right
ctx.closePath();
ctx.fill();
ctx.restore(); // undo translate and rotate — next draw starts fresh
```

**What it hides:**
`translate/rotate` hide the matrix mathematics of 2D affine transforms. The invariant: **within a `save/restore` block, every drawing command uses the transformed coordinate system** — you can draw any shape at any angle by describing it at the origin pointing right, and the transform handles the rest.

**Canonical example (General Explanation):**
Think of a stamp and a stamp pad. You don't redesign the stamp for every angle — you tilt the pad itself, then stamp. `translate` positions the pad. `rotate` tilts it. Your drawing code is the stamp — it never changes.

**Project Application (The "Why" here):**
The ship triangle is always designed "pointing right, centred at origin." Each frame, we translate to the ship's position and rotate to its angle. No vertex math needed.

**Why it matters here:** This pattern works for any rotated shape — bullets, enemies, asteroids. You'll use it in every future lab.

**Watch for:** Order matters. `translate` THEN `rotate`. If you rotate first, the translation happens along the rotated axes — the object ends up in the wrong place. Always: translate to position, then rotate in place.

---

## Step 1 — Copy LAB 02 Files

Create a new folder called `phaser-lab-03`. Copy `index.html`, `style.css`, and `main.js` from `phaser-lab-02`.

### SAVE AND TRY

Open `index.html`.

**You should see:** The dot from LAB 02 — moving with arrow keys, green velocity arrow visible.

If anything is broken, fix it before continuing.

---

## Step 2 — Rename `dot` to `ship` and Add the Angle

The dot becomes a ship. We'll add an `angle` property and rename things for clarity.

**In `main.js` — update the game state object:**

```js
// ─── Game State ───────────────────────────────────────────────────────────────
const ship = {          // ← was: const dot = {
  x:     0,
  y:     0,
  angle: 0,             // ← ADD: ship's facing direction in radians (0 = right)
  vx:    0,             // ← was: MOVE_SPEED (ship starts stationary now)
  vy:    0,             // unchanged
};
```

**Update `resizeCanvas` to use the new name:**
```js
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  ship.y = canvas.height / 2; // ← was: dot.y
  ship.x = canvas.width  / 2; // ← ADD: start in the centre horizontally too
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** A black screen — `drawDot` still references `dot` (which no longer exists). This is expected. We'll fix it in the next step.

**In DevTools Console:**
```js
ship
```
**Expected:** `{ x: [half window width], y: [half window height], angle: 0, vx: 0, vy: 0 }` — the ship state, correctly initialised.

---

## Step 3 — Draw the Ship Triangle

Replace `drawDot` and `drawVelocityArrow` with a `drawShip` function.

**Remove** the old draw functions and **add**:

```js
// ─── Constants — add these ────────────────────────────────────────────────────
const SHIP_SIZE   = 15;        // ← ADD: half-length of ship in pixels
const SHIP_COLOR  = '#ffffff'; // ← ADD: ship fill colour (was DOT_COLOR)

// ─── Draw Ship ────────────────────────────────────────────────────────────────
function drawShip(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);   // move drawing origin to ship's position
  ctx.rotate(angle);     // rotate coordinate system to ship's facing angle

  // Draw a triangle centred at origin (0,0), pointing right (+x direction).
  // After translate+rotate, canvas draws this at the correct world position and angle.
  ctx.beginPath();
  ctx.moveTo( SHIP_SIZE,      0); // tip: forward (right of origin)
  ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.6); // back-left corner
  ctx.lineTo(-SHIP_SIZE,  SHIP_SIZE * 0.6); // back-right corner
  ctx.closePath();
  // closePath draws a line from back-right back to the tip, completing the triangle

  ctx.fillStyle   = SHIP_COLOR;
  ctx.fill();

  ctx.restore(); // undo translate and rotate
}
```

**Update `render()` to call the new function:**
```js
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawShip(ship.x, ship.y, ship.angle); // ← was: drawDot + drawVelocityArrow
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** A white triangle centred on the screen, pointing right.

**In DevTools Console:**
```js
ship.angle = Math.PI / 2; // 90 degrees = pointing down
```
**Expected:** The triangle immediately rotates to point downward. The ship position stays in the centre.

```js
ship.angle = Math.PI; // 180 degrees = pointing left
```
**Expected:** Triangle points left.

```js
ship.angle = 0; // reset
```
**Expected:** Triangle points right again.

**Change something:** Change `SHIP_SIZE = 15` to `SHIP_SIZE = 30`. Save. The triangle is twice as big. Change it back.

---

## 🎯 Challenge: Draw the Engine Flame

**You know:** `ctx.translate`, `ctx.rotate`, `ctx.save/restore`, drawing shapes at the origin.

**Task:** When the Up arrow key is held, draw a small orange triangle (`'#ff6600'`) behind the ship to represent the engine flame. It should point backwards (opposite to the ship's nose) and be about half the ship's size.

**Starting code (inside a new function, called from `drawShip` or from `render`):**
```js
function drawFlame(x, y, angle) {
  if (!keys['ArrowUp']) return; // only draw when thrusting
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Draw a triangle pointing LEFT (the back of the ship is to the left)
  // The ship's nose is at +x, so the back is at -x
  // Add your flame triangle here
  ctx.restore();
}
```

**Hint:** The flame tip should be further left than the ship's back edge (`-SHIP_SIZE`). The flame is smaller — try `SHIP_SIZE * 0.5` for its length.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
const FLAME_COLOR = '#ff6600'; // orange

function drawFlame(x, y, angle) {
  if (!keys['ArrowUp']) return; // only visible when thrusting

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const flameLength = SHIP_SIZE * 0.8; // flame extends back from ship

  ctx.beginPath();
  ctx.moveTo(-SHIP_SIZE, 0);                  // flame base: centre of ship's back
  ctx.lineTo(-SHIP_SIZE - flameLength, 0);    // flame tip: further back
  ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.3);  // back-left nozzle edge
  ctx.moveTo(-SHIP_SIZE, 0);
  ctx.lineTo(-SHIP_SIZE - flameLength, 0);
  ctx.lineTo(-SHIP_SIZE,  SHIP_SIZE * 0.3);  // back-right nozzle edge
  ctx.closePath();

  ctx.fillStyle = FLAME_COLOR;
  ctx.fill();
  ctx.restore();
}

// Call it in render(), after drawShip:
// drawFlame(ship.x, ship.y, ship.angle);
```

**Key insight:** Because we translated and rotated the canvas BEFORE drawing, "backward" is always in the `-x` direction in local coordinates, no matter what angle the ship is facing. The transform handles the world-space conversion. This is the power of `translate/rotate` — your drawing code stays simple.

</details>

---

## Step 4 — Add Rotation Controls

Now we make Left/Right arrows rotate the ship.

**Add a new constant:**
```js
const ROTATION_SPEED = 0.05; // ← ADD: radians rotated per frame (~2.9° per frame)
```

**Update `update()`** — replace the entire function:

```js
function update() {
  // ── Rotation ──────────────────────────────────────────────────────
  if (keys['ArrowLeft'])  ship.angle -= ROTATION_SPEED;
  // subtract from angle: counter-clockwise rotation on canvas
  if (keys['ArrowRight']) ship.angle += ROTATION_SPEED;
  // add to angle: clockwise rotation on canvas

  // ── Move (coast — no thrust yet) ──────────────────────────────────
  ship.x += ship.vx; // apply velocity to position
  ship.y += ship.vy;
  ship.x = (ship.x + canvas.width)  % canvas.width;
  ship.y = (ship.y + canvas.height) % canvas.height;
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The white triangle on screen. Press Left — it rotates counter-clockwise. Press Right — it rotates clockwise. The ship stays in place (no thrust yet).

**In DevTools Console:**
```js
(ship.angle * 180 / Math.PI).toFixed(1) + '°'
```
Rotate the ship. **Expected:** The angle in degrees, updating as you rotate (run the command several times).

**Change something:** Change `ROTATION_SPEED = 0.05` to `ROTATION_SPEED = 0.2`. Save. The ship rotates very fast. Change it back to `0.05`.

---

## Step 5 — Add Thrust

When Up is pressed, the ship accelerates in the direction it's facing.

### Concept: Acceleration

**What it is:** A change to velocity each frame. Instead of setting velocity directly (as in LAB 02), thrust *adds* to the current velocity. This means the ship builds up speed and coasts when thrust stops.

**The problem (direct velocity):**
```js
// LAB 02 approach — pressing right SETS velocity:
if (keys['ArrowRight']) { vx = MOVE_SPEED; vy = 0; }
// Release: velocity snaps to 0.
// Ships don't work this way — they build momentum.
```

**The solution — accumulate velocity:**
```js
// Thrust ADDS to existing velocity:
if (keys['ArrowUp']) {
  vx += Math.cos(ship.angle) * THRUST_FORCE;
  vy += Math.sin(ship.angle) * THRUST_FORCE;
}
// Release: velocity persists. Ship coasts. Thrust again: speed increases.
```

**What it hides:**
Acceleration hides the physics of force and mass from the game loop. The invariant: **velocity only changes when a force is applied** — `vx` and `vy` maintain their values between frames unless explicitly modified. This is why the ship coasts in space.

**Watch for:** Without a speed cap, the ship can accelerate infinitely. We'll add one in the challenge below.

---

**Add a new constant:**
```js
const THRUST_FORCE   = 0.1; // ← ADD: velocity added per frame while thrusting
const MAX_SHIP_SPEED = 6;   // ← ADD: maximum speed the ship can reach
```

**Update `update()` — add thrust logic:**

```js
function update() {
  // ── Rotation ──────────────────────────────────────────────────────
  if (keys['ArrowLeft'])  ship.angle -= ROTATION_SPEED;
  if (keys['ArrowRight']) ship.angle += ROTATION_SPEED;

  // ── Thrust ────────────────────────────────────────────────────────
  if (keys['ArrowUp']) {
    ship.vx += Math.cos(ship.angle) * THRUST_FORCE;
    // Add a small velocity component in the x-direction the ship is facing.
    // Math.cos(angle) gives the x-component of the facing direction (unit length).
    ship.vy += Math.sin(ship.angle) * THRUST_FORCE; // ← ADD
    // Math.sin(angle) gives the y-component of the facing direction.
  }

  // ── Speed cap ─────────────────────────────────────────────────────
  const currentSpeed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  // calculate the ship's actual speed (vector length)
  if (currentSpeed > MAX_SHIP_SPEED) {
    // scale velocity down to MAX_SHIP_SPEED while keeping direction identical
    const scale = MAX_SHIP_SPEED / currentSpeed;
    // scale: the ratio needed to bring speed to exactly MAX_SHIP_SPEED
    ship.vx *= scale; // ← ADD
    ship.vy *= scale; // ← ADD
  }

  // ── Move ──────────────────────────────────────────────────────────
  ship.x += ship.vx;
  ship.y += ship.vy;
  ship.x = (ship.x + canvas.width)  % canvas.width;
  ship.y = (ship.y + canvas.height) % canvas.height;
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The ship sitting still. Rotate with Left/Right. Press Up — the ship accelerates in the direction it's pointing! Release Up — ship coasts. Rotate while coasting — the ship's velocity is unchanged (it doesn't automatically steer, like a real spacecraft). Wrap at edges works on all four sides.

**In DevTools Console:**
```js
Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy).toFixed(2)
```
Hold Up for a few seconds, then run. **Expected:** A number approaching `6.00` (the max speed cap).

**Change something:** Change `THRUST_FORCE = 0.1` to `THRUST_FORCE = 0.5`. Save. The ship accelerates much faster. Change it back.

---

### Math: Clamping (Speed Cap)

**What it computes:** Constrains a value so it never exceeds a maximum (or falls below a minimum).

**The real-world analogy:** A car's speedometer redlines at 120mph — stepping harder on the accelerator does nothing once you're there. The engine can't push past the physical limit.

**Canonical example:**
```js
// Clamp a value between min and max:
const clamped = Math.max(min, Math.min(max, value));

// For our speed cap, we don't use Math.max/min directly.
// Instead we scale the velocity vector to maintain direction:
if (speed > MAX_SPEED) {
  const scale = MAX_SPEED / speed; // e.g. 6/8 = 0.75
  vx *= scale;  // vx: 5.6 → 4.2
  vy *= scale;  // vy: 5.6 → 4.2  (direction preserved)
}
```

**Why it matters here:** Without the cap, holding thrust forever makes the ship unreasonably fast and unwrappable. The scale approach is better than clamping components individually (which would distort direction).

**Watch for:** Clamping individual components (`vx = Math.min(vx, 6)`) changes the direction of movement. Always clamp the speed (vector length) and scale both components proportionally.

---

## 🎯 Challenge: Drag (Space Friction)

**You know:** Acceleration, the speed cap, and how velocity persists between frames.

**Task:** Add a small drag constant — each frame, multiply the ship's velocity by a value slightly less than 1. This simulates friction and means the ship slows down gradually when not thrusting.

**Starting code (inside `update`, after thrust):**
```js
// Drag goes here — between thrust and speed cap
```

**Hints:**
1. Try a `DRAG` constant of `0.99` — the ship loses 1% speed per frame.
2. Apply it: `ship.vx *= DRAG` and `ship.vy *= DRAG`.
3. With drag, you may want to increase `THRUST_FORCE` to compensate (try `0.15`).

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
const DRAG         = 0.99;  // ← ADD at top: velocity multiplier per frame (< 1 = friction)
const THRUST_FORCE = 0.15;  // ← increase from 0.1 to compensate for drag

// In update(), between the thrust block and the speed cap:
ship.vx *= DRAG; // reduce velocity by DRAG each frame (1% per frame at 0.99)
ship.vy *= DRAG;
```

**Key insight:** Multiplying by 0.99 every frame is **exponential decay** — speed halves approximately every 69 frames (~1.15 seconds at 60fps). This feels natural because objects in the real world slow down at a rate proportional to their current speed (like air resistance). `DRAG = 1.0` means no friction (pure space). `DRAG = 0.9` is very strong friction (sticky floor). Most games sit between 0.95 and 0.99 depending on desired feel.

</details>

---

## 🎯 Challenge: Wrap the Angle

**You know:** `ship.angle` accumulates as the player rotates.

**Task:** Rotating continuously in one direction, `ship.angle` keeps growing (or going negative). Over time it becomes very large numbers like `94.25`. This doesn't break anything in canvas, but it's messy. Apply the modulo wrap to keep `ship.angle` between 0 and `2 × Math.PI`.

**Why bother?** Large floating-point numbers accumulate rounding errors over time. Keeping the angle normalised prevents subtle precision bugs in very long sessions.

**Starting code:**
```js
// After rotating, add:
// ship.angle = ???
```

**Hint:** The formula is the same as position wrapping, but the maximum is `Math.PI * 2` (one full rotation).

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// After the rotation block in update():
const TWO_PI = Math.PI * 2; // full rotation in radians
ship.angle = ((ship.angle % TWO_PI) + TWO_PI) % TWO_PI;
// Same modulo-with-offset formula as position wrapping:
// adding TWO_PI first ensures negative angles wrap correctly.
```

**Key insight:** This is the exact same formula as position wrapping from LAB 01 — `(value + max) % max`. The "max" is `TWO_PI` instead of `canvas.width`. Recognising that the same pattern applies in different contexts is the essence of abstraction — one mental model, many applications.

</details>

---

## Step 6 — Draw the Thruster Exhaust

Add a visual indicator for thrust: a small diamond that flickers behind the ship when Up is held.

**Add to `main.js` after `drawShip`:**

```js
// ─── Constants ───────────────────────────────────────────────────────────────
const EXHAUST_COLOR = '#ff6600'; // ← ADD: orange for engine exhaust

function drawExhaust(x, y, angle) {
  if (!keys['ArrowUp']) return;
  // Only draw exhaust when the thrust key is held

  ctx.save();
  ctx.translate(x, y); // move to ship's position
  ctx.rotate(angle);   // align with ship's facing direction

  const exhaustLength = SHIP_SIZE * (0.5 + Math.random() * 0.5);
  // random flicker: between 0.5× and 1× ship size each frame
  // Math.random() returns a number between 0 (inclusive) and 1 (exclusive)

  ctx.beginPath();
  ctx.moveTo(-SHIP_SIZE,             0); // start at back-centre of ship
  ctx.lineTo(-SHIP_SIZE - exhaustLength, 0); // extend backward
  ctx.strokeStyle = EXHAUST_COLOR;
  ctx.lineWidth   = 3;
  ctx.stroke();

  ctx.restore();
}
```

**Update `render()`:**
```js
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawExhaust(ship.x, ship.y, ship.angle); // ← ADD: draw before ship so ship appears on top
  drawShip(ship.x, ship.y, ship.angle);
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The ship. Press Up — an orange flickering line appears behind the ship. Release — it disappears.

**In DevTools Console:**
```js
Math.random()
```
Run it several times. **Expected:** A different decimal number between 0 and 1 each time. This is the source of the exhaust flicker — a different length each frame.

**Change something:** Change `EXHAUST_COLOR = '#ff6600'` to `EXHAUST_COLOR = '#00ffff'`. Save. Exhaust becomes cyan. Change it back.

---

## Mental Model: The Transform Pipeline

**Name:** Coordinate Transform Pipeline

**Why it exists:** Every drawn object lives in its own local coordinate system (centred at origin, facing right). The transform pipeline converts from local coordinates to screen coordinates in a consistent, composable way.

**The pipeline for our ship:**
```
Local space      →  World space          →  Screen space
(ship at 0,0)       (ship at ship.x,y)      (canvas pixels)
pointing right      facing ship.angle

Steps:
1. ctx.translate(ship.x, ship.y)  — place origin at ship's world position
2. ctx.rotate(ship.angle)          — rotate local axes to ship's facing
3. Draw at (0,0) pointing right    — draw in local space
4. Canvas applies steps 1+2 automatically
```

**A concrete example from this lab:**
```js
// Ship at world position (300, 200), facing 45°
ctx.translate(300, 200);   // origin moves to (300,200) in screen space
ctx.rotate(Math.PI / 4);   // axes rotate 45° clockwise
ctx.moveTo(15, 0);          // in LOCAL space: 15px in the +x direction
// In SCREEN space: 15 * cos(45°) ≈ 10.6px right, 15 * sin(45°) ≈ 10.6px down
// The canvas computes this automatically
```

**Where it appears again:** LAB 04 (bullets inherit the ship's transform), LAB 06 (enemy ships use the same pattern), LAB 07 (each entity type draws itself with its own transform).

---

## Final Check

| Feature | How to verify |
|---|---|
| Ship triangle visible | Refresh — white triangle in centre of screen |
| Left arrow rotates counter-clockwise | Hold Left — triangle rotates CCW continuously |
| Right arrow rotates clockwise | Hold Right — triangle rotates CW continuously |
| Up arrow thrusts forward | Rotate ship, press Up — ship accelerates in the facing direction |
| Thrust direction matches ship angle | Face left, thrust — ship moves left |
| Ship coasts after thrust | Release Up — ship keeps moving at same velocity |
| Speed cap works | Hold Up for 5 seconds — `Math.sqrt(ship.vx**2 + ship.vy**2)` stays ≤ 6 |
| Exhaust shows when thrusting | Hold Up — orange flickering line behind ship |
| Exhaust disappears when released | Release Up — orange line gone |
| All edges wrap | Let ship drift to any edge — reappears on opposite side |

---

## Complete `main.js` Reference

```js
// LAB 03 — Trigonometry & Rotation

// ─── Constants ────────────────────────────────────────────────────────────────
const SHIP_SIZE      = 15;
const SHIP_COLOR     = '#ffffff';
const EXHAUST_COLOR  = '#ff6600';
const BG_COLOR       = '#000000';
const ROTATION_SPEED = 0.05;   // radians per frame
const THRUST_FORCE   = 0.15;   // velocity added per frame while thrusting
const DRAG           = 0.99;   // velocity multiplier per frame (friction)
const MAX_SHIP_SPEED = 6;      // maximum speed in pixels per frame

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ─── Game State ───────────────────────────────────────────────────────────────
const ship = {
  x:     0,
  y:     0,
  angle: 0,   // radians; 0 = facing right
  vx:    0,
  vy:    0,
};

// ─── Input State ──────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  event.preventDefault();
});
document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

// ─── Canvas Resize ────────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  ship.x = canvas.width  / 2;
  ship.y = canvas.height / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Draw Functions ───────────────────────────────────────────────────────────
function drawShip(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo( SHIP_SIZE,       0);
  ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.6);
  ctx.lineTo(-SHIP_SIZE,  SHIP_SIZE * 0.6);
  ctx.closePath();
  ctx.fillStyle = SHIP_COLOR;
  ctx.fill();
  ctx.restore();
}

function drawExhaust(x, y, angle) {
  if (!keys['ArrowUp']) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const exhaustLength = SHIP_SIZE * (0.5 + Math.random() * 0.5);
  ctx.beginPath();
  ctx.moveTo(-SHIP_SIZE, 0);
  ctx.lineTo(-SHIP_SIZE - exhaustLength, 0);
  ctx.strokeStyle = EXHAUST_COLOR;
  ctx.lineWidth   = 3;
  ctx.stroke();
  ctx.restore();
}

// ─── Update ───────────────────────────────────────────────────────────────────
function update() {
  // Rotation
  if (keys['ArrowLeft'])  ship.angle -= ROTATION_SPEED;
  if (keys['ArrowRight']) ship.angle += ROTATION_SPEED;

  // Keep angle between 0 and 2π
  const TWO_PI = Math.PI * 2;
  ship.angle = ((ship.angle % TWO_PI) + TWO_PI) % TWO_PI;

  // Thrust
  if (keys['ArrowUp']) {
    ship.vx += Math.cos(ship.angle) * THRUST_FORCE;
    ship.vy += Math.sin(ship.angle) * THRUST_FORCE;
  }

  // Drag
  ship.vx *= DRAG;
  ship.vy *= DRAG;

  // Speed cap
  const currentSpeed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  if (currentSpeed > MAX_SHIP_SPEED) {
    const scale = MAX_SHIP_SPEED / currentSpeed;
    ship.vx *= scale;
    ship.vy *= scale;
  }

  // Move
  ship.x += ship.vx;
  ship.y += ship.vy;
  ship.x = (ship.x + canvas.width)  % canvas.width;
  ship.y = (ship.y + canvas.height) % canvas.height;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawExhaust(ship.x, ship.y, ship.angle);
  drawShip(ship.x, ship.y, ship.angle);
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

---

## What's Next

In **LAB 04** you'll press Spacebar to fire bullets. Each bullet is an object with its own position and velocity — fired in the direction the ship is facing. You'll need to track multiple bullets at once (an **array**), and check whether any bullet is close enough to an asteroid to count as a hit. That "close enough" check uses the **distance formula** — which you already know from LAB 02.

---

## Quick Check Answers

**1. If the ship faces 45°, what will `vx` and `vy` be?**

`vx = Math.cos(π/4) × 3 ≈ 2.12` and `vy = Math.sin(π/4) × 3 ≈ 2.12`. At 45°, the direction vector splits equally between x and y — same as the challenge in LAB 02 where we solved `MOVE_SPEED / Math.sqrt(2)`. `cos` and `sin` give us those components directly without having to solve the equation manually.

**2. If `Math.cos(0)` = 1 and `Math.cos(π)` = -1, what is `Math.cos(π/2)`?**

`Math.cos(Math.PI / 2) = 0`. On the unit circle, at 90° (straight down on canvas), the hand is pointing straight down — its horizontal component is 0. The pattern: `cos` starts at 1 (right), drops to 0 (down), reaches -1 (left), returns to 0 (up), and back to 1 — a smooth wave. In this lab, `Math.cos(ship.angle)` is exactly this x-component of the ship's facing direction.

**3. When you draw a triangle pointing right and rotate it 90°, where does it point?**

On canvas, it points downward. Canvas rotates clockwise for positive angles because Y increases downward. A 90° clockwise rotation takes the +x direction (right) to the +y direction (down). If you expected "up" — that would be true in standard maths coordinates, but canvas's flipped Y-axis flips the rotation direction too.

---

*End of LAB 03. Next: [[LAB-04-Collision-Detection]]*
