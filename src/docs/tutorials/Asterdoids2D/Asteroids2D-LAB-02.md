# 2D Asteroids — LAB 02 — The Ship and Rotation

**Read Asteroids2D-LAB-01.md first.** That lab built the canvas, the game loop,
and a moving dot. This lab turns the dot into an Asteroids ship — a triangle
you rotate left/right and thrust forward.

**What this lab adds:**
- Arrow Left / Arrow Right keys rotate the ship
- Arrow Up thrusts forward in the facing direction
- The ship is drawn as a triangle at the correct rotation angle
- `ctx.save()` and `ctx.restore()` — the canvas transform stack

**What you will learn:**
- How to track which keys are currently held (not just tapped)
- `ctx.save()` and `ctx.restore()` — isolating transform changes
- `ctx.translate()` and `ctx.rotate()` — moving the origin to the object
- Rotation math: `cos` and `sin` to convert an angle to a direction vector

**Time:** 60–75 minutes.

---

## What You Will Build

Open the browser. You see:
- The black canvas from LAB-01 (dot is gone)
- A white triangle in the center — the ship
- Left/Right arrows rotate the ship in place
- Up arrow thrusts the ship forward (in the direction it faces)
- The ship coasts when you release Up (no friction yet)
- The ship wraps at all edges (from LAB-01)

Nothing shoots yet. No asteroids. Just a ship you can fly.

---

## Concept: Keyboard State — Held vs Tapped

**What the problem is:** You want to move the ship every frame the key is held.
Keyboard events have a different model than what you might expect.

**The browser keyboard events:**

```
keydown  → fires once when key is first pressed
           then fires repeatedly at the browser's auto-repeat rate (slow)
keyup    → fires once when key is released
```

**The problem with `keydown` alone:**

```js
// If you move the ship inside keydown:
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') ship.angle -= 0.1;
});
// This fires once immediately, then has a delay before repeating.
// The ship stutters — it rotates, pauses, then rotates rapidly.
// The delay is the OS keyboard repeat delay (~500ms by default).
```

**The solution — track held state:**

Instead of moving the ship inside `keydown`, track WHICH keys are currently
held in an object. Check that object each frame in `update()`.

```js
// A map of which keys are currently held.
const keysHeld = {};  // keys: 'ArrowLeft', 'ArrowRight', etc. values: true/false

document.addEventListener('keydown', (event) => {
  keysHeld[event.code] = true;   // mark this key as held
  event.preventDefault();         // prevent page scrolling when arrows pressed
});

document.addEventListener('keyup', (event) => {
  keysHeld[event.code] = false;  // mark this key as released
});

// Then in update():
function update() {
  if (keysHeld['ArrowLeft']) {
    ship.angle -= ROTATION_SPEED;  // runs every frame while held — smooth!
  }
}
```

**`event.code` vs `event.key`:**

```
event.key  → the character the key produces: 'a', 'A', 'ArrowLeft', ' '
             Changes with Shift and language settings.

event.code → the physical key location: 'KeyA', 'ArrowLeft', 'Space'
             Does not change with Shift. Same on every keyboard.
```

We use `event.code` for game controls because we care about where the key IS
on the keyboard, not what character it produces.

**Watch for:** Calling `event.preventDefault()` inside `keydown` prevents the
browser's default behavior for that key. For arrow keys, the default is page
scrolling. Without `preventDefault()`, pressing arrow keys while playing scrolls
the page at the same time as controlling the ship.

---

## Concept: `ctx.save()` and `ctx.restore()` — The Transform Stack

**What they are:** Functions that save and restore the canvas drawing state —
including any transforms (translate, rotate, scale) applied.

**The problem without them:**

Rotating the canvas with `ctx.rotate()` rotates everything drawn afterward —
including the next frame's background, the HUD, and every other object.

```js
ctx.rotate(0.5);       // rotate 0.5 radians
ctx.arc(100, 100, 10, 0, Math.PI * 2);
ctx.fill();
// Everything drawn after this is also rotated — background, other objects, all of it.
```

**The solution — save and restore:**

```js
ctx.save();           // save the current transform state (rotation=0, translation=origin)
ctx.rotate(0.5);      // apply rotation — only affects draws until restore()
ctx.arc(100, 100, 10, 0, Math.PI * 2);
ctx.fill();
ctx.restore();        // restore the saved state — rotation goes back to 0

// Now drawing continues at the original unrotated state:
ctx.fillRect(0, 0, canvas.width, canvas.height);  // not rotated ✓
```

**`save()` and `restore()` form a pair:** Always call `restore()` for every
`save()`. They work like a stack — you can nest them:

```js
ctx.save();      // save state A
  ctx.rotate(0.5);
  ctx.save();    // save state B (with rotation 0.5)
    ctx.rotate(0.3);  // now rotated 0.8 total
  ctx.restore(); // back to state B (rotation 0.5)
ctx.restore();   // back to state A (rotation 0)
```

**Watch for:** `save()` saves the entire drawing state: transforms, fill/stroke
colors, line width, alpha, etc. Not just transforms. This is useful — you can
change fillStyle inside a save/restore without affecting the state outside.

---

## Concept: `ctx.translate()` and `ctx.rotate()` — Drawing a Rotated Shape

**The problem:** A triangle has three corner points. If you rotate the ship 45°,
each corner needs to be recalculated. The math is doable but tedious.

**The easier approach — move the canvas origin to the object:**

Instead of rotating each point yourself, you:
1. Save the canvas state (`ctx.save()`)
2. Move the canvas origin to the object's center (`ctx.translate(x, y)`)
3. Rotate the canvas to the object's angle (`ctx.rotate(angle)`)
4. Draw the shape as if it were centered at (0, 0) and facing right/up
5. Restore the canvas state (`ctx.restore()`)

```js
function drawShip(ship) {
  ctx.save();

  // Move the canvas origin to the ship's position.
  // Now (0, 0) in drawing commands means "the ship's center."
  ctx.translate(ship.x, ship.y);

  // Rotate the canvas by the ship's angle.
  // Now drawing "up" draws in the ship's facing direction.
  ctx.rotate(ship.angle);

  // Draw the triangle centered at (0, 0) facing "up" (negative Y direction).
  // These points never change — they define the ship's shape in local space.
  ctx.beginPath();
  ctx.moveTo(0, -15);    // nose: 15 pixels "up" in rotated space
  ctx.lineTo(10, 10);    // right wing: 10 right, 10 down
  ctx.lineTo(-10, 10);   // left wing: 10 left, 10 down
  ctx.closePath();       // draw line back to nose, completing the triangle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 2;
  ctx.stroke();          // draw the outline only (no fill — Asteroids style)

  ctx.restore();
}
```

**`ctx.closePath()`:** Draws a straight line from the current point back to
the first point of the path (the `moveTo` point). For a triangle: after
`moveTo(nose)`, `lineTo(right wing)`, `lineTo(left wing)` — `closePath()`
completes the triangle by drawing back to the nose.

**`ctx.stroke()` vs `ctx.fill()`:**
- `ctx.fill()` — paints the interior of the shape solid
- `ctx.stroke()` — draws only the outline of the shape
- Classic Asteroids ships are drawn with `stroke()` only — hollow triangles

---

## Concept: Rotation Math — Angle to Direction Vector

**The problem:** The ship has an angle (a number in radians). When you press Up
to thrust, you need to know which direction to push the ship. The direction
depends on the angle.

**The solution — `Math.cos` and `Math.sin`:**

```
For angle θ (in radians):
  x-component of direction = Math.sin(θ)
  y-component of direction = Math.cos(θ)   (negated because Y goes down on canvas)
```

In the canvas coordinate system (Y increases downward), if angle 0 means
"pointing up" (toward negative Y):

```
ship.angle = 0:        direction = (sin 0,   -cos 0)   = (0,   -1) = straight up
ship.angle = π/2:      direction = (sin π/2, -cos π/2) = (1,    0) = right
ship.angle = π:        direction = (sin π,   -cos π)   = (0,    1) = down
ship.angle = 3π/2:     direction = (sin 3π/2,-cos 3π/2)= (-1,   0) = left
```

To thrust:
```js
const THRUST_FORCE = 0.15;   // acceleration per frame

ship.velocityX += Math.sin(ship.angle) * THRUST_FORCE;
ship.velocityY -= Math.cos(ship.angle) * THRUST_FORCE;   // negative because Y-down
```

Then apply velocity to position:
```js
ship.x += ship.velocityX;
ship.y += ship.velocityY;
```

**This is why velocity is separate from position.** Thrust accelerates the ship
(adds to velocity). Velocity moves the position. The ship keeps coasting after
you release Up because velocity is not reset — it continues until something
(drag, a wall, a collision) changes it.

**Radians vs degrees:**

JavaScript math functions use **radians**, not degrees.

```
Full circle:  2π radians  = 360 degrees
Half circle:  π radians   = 180 degrees
Right turn:   π/2 radians =  90 degrees

To convert: degrees × (Math.PI / 180) = radians
```

`ctx.rotate()` also takes radians. We use radians throughout.

---

## Step 1 — Remove the Dot, Add the Ship State

Replace the entire `main.js` with:

```js
// ── Canvas setup ──────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ── Constants ─────────────────────────────────────────────────────────────────

const ROTATION_SPEED = 0.05;   // radians per frame the ship turns
const THRUST_FORCE   = 0.15;   // velocity units added per frame while thrusting
const MAX_SPEED      = 8;      // maximum velocity magnitude (pixels/frame)

// Ship triangle vertices in local space (centered at origin, facing up).
// These are defined once. ctx.rotate() handles the actual rotation at draw time.
// Positive Y is DOWN on canvas, so the nose at (0, -15) points UP.
const SHIP_NOSE_Y      = -15;   // nose of the ship (up direction in local space)
const SHIP_WING_X      =  10;   // how wide the ship is (left and right wing)
const SHIP_WING_Y      =  10;   // where the wings sit along the body (below center)
const SHIP_TAIL_INNER  =   5;   // the two tail notch points (for the engine notch look)

// ── State ─────────────────────────────────────────────────────────────────────

const ship = {
  x:         canvas.width  / 2,   // starting X: horizontal center
  y:         canvas.height / 2,   // starting Y: vertical center
  angle:     0,                   // facing direction in radians (0 = pointing up)
  velocityX: 0,                   // horizontal speed (pixels per frame)
  velocityY: 0,                   // vertical speed   (pixels per frame)
};

// ── Input tracking ────────────────────────────────────────────────────────────

// keysHeld tracks which keys are currently pressed.
// We use event.code (physical key) not event.key (character produced).
const keysHeld = {};

document.addEventListener('keydown', (event) => {
  keysHeld[event.code] = true;
  // Prevent default browser behavior for arrow keys (page scroll).
  event.preventDefault();
});

document.addEventListener('keyup', (event) => {
  keysHeld[event.code] = false;
});

// ── Update ────────────────────────────────────────────────────────────────────

function update() {
  // Rotation: left/right arrows change the ship's angle.
  if (keysHeld['ArrowLeft']) {
    ship.angle -= ROTATION_SPEED;
  }
  if (keysHeld['ArrowRight']) {
    ship.angle += ROTATION_SPEED;
  }

  // Thrust: Up arrow adds velocity in the direction the ship faces.
  if (keysHeld['ArrowUp']) {
    // Convert angle to a direction vector using sin and cos.
    // angle = 0: sin(0) = 0, cos(0) = 1 → direction is (0, -1) = straight up ✓
    ship.velocityX += Math.sin(ship.angle) * THRUST_FORCE;
    ship.velocityY -= Math.cos(ship.angle) * THRUST_FORCE;   // negative: canvas Y is down
  }

  // Speed limit: cap the velocity magnitude at MAX_SPEED.
  // Magnitude (the speed) = sqrt(vx² + vy²) — Pythagoras.
  const speed = Math.sqrt(ship.velocityX ** 2 + ship.velocityY ** 2);
  if (speed > MAX_SPEED) {
    // Scale both components down proportionally so direction is preserved.
    // (vx / speed) is the unit direction vector's X component.
    ship.velocityX = (ship.velocityX / speed) * MAX_SPEED;
    ship.velocityY = (ship.velocityY / speed) * MAX_SPEED;
  }

  // Apply velocity to position.
  ship.x += ship.velocityX;
  ship.y += ship.velocityY;

  // Wrap at edges (same formula as LAB-01).
  ship.x = (ship.x + canvas.width)  % canvas.width;
  ship.y = (ship.y + canvas.height) % canvas.height;
}

// ── Render ────────────────────────────────────────────────────────────────────

function drawShip() {
  ctx.save();

  // Move the canvas origin to the ship's position.
  ctx.translate(ship.x, ship.y);

  // Rotate the canvas by the ship's angle.
  ctx.rotate(ship.angle);

  // Draw the ship triangle in local space.
  // All coordinates are relative to the ship's center (the new origin after translate).
  ctx.beginPath();
  ctx.moveTo(0, SHIP_NOSE_Y);                     // nose: straight up in local space
  ctx.lineTo(SHIP_WING_X, SHIP_WING_Y);           // right wing
  ctx.lineTo(SHIP_TAIL_INNER, SHIP_WING_Y - 3);   // right tail notch
  ctx.lineTo(0, SHIP_WING_Y + 5);                 // center tail base
  ctx.lineTo(-SHIP_TAIL_INNER, SHIP_WING_Y - 3);  // left tail notch
  ctx.lineTo(-SHIP_WING_X, SHIP_WING_Y);          // left wing
  ctx.closePath();                                 // back to nose

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}

function render() {
  // Clear: fill the canvas with black.
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawShip();
}

// ── Game loop ─────────────────────────────────────────────────────────────────

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

### SAVE AND TRY — Step 1

Save. Reload.

**You should see:** A white outlined triangle in the center of the black canvas.

**Test rotation:**
- Hold Left arrow → ship rotates counter-clockwise
- Hold Right arrow → ship rotates clockwise
- Release → ship holds its angle (no spring-back)

**Test thrust:**
- Point the nose toward the upper-right (rotate until the nose points there)
- Hold Up arrow → ship accelerates in that direction
- Release Up → ship keeps coasting in that direction (no friction)
- Hold Up again → ship continues accelerating

**In DevTools Console:**
```js
ship.angle
```
**Expected:** A number that changes as you rotate (increases right, decreases left).

```js
Math.sqrt(ship.velocityX ** 2 + ship.velocityY ** 2)
```
**Expected:** Current speed. Should increase while thrusting, stay constant while coasting.
Max value should be MAX_SPEED (8).

**Change something:** Change `ROTATION_SPEED = 0.05` to `ROTATION_SPEED = 0.15`.
The ship turns much faster. Change it back to `0.05`.

---

## 🎯 Challenge: Add Drag (Friction)

**The problem:** Right now the ship coasts forever. In the original Asteroids,
the ship gradually slows down after you stop thrusting. This makes the game
more controllable.

**Concept — drag as a multiplier:**

Instead of subtracting a fixed amount from speed (which would stop the ship
abruptly at low speeds), multiply velocity by a number slightly less than 1
each frame:

```
velocityX *= 0.98   // each frame: 98% of previous velocity
```

After 35 frames: `0.98^35 ≈ 0.49` — the ship is at half speed.
After 100 frames: `0.98^100 ≈ 0.13` — nearly stopped.
The ship slows gently — realistic inertia.

**Your task:** Add one line to the `update()` function that multiplies both
velocity components by a drag constant, causing the ship to gradually decelerate.

**Hints:**
1. Add a constant `const DRAG = 0.98` near the other constants.
2. Apply it to both `ship.velocityX` and `ship.velocityY` each frame.
3. Apply drag BEFORE applying velocity to position (order matters for feel).
4. Test: thrust then release — the ship should drift to a stop over ~3 seconds.

---

<details>
<summary>▶ Solution — Drag</summary>

Add the constant at the top:
```js
const DRAG = 0.98;   // velocity multiplier per frame — 1.0 = no drag, 0.0 = instant stop
```

In `update()`, before `ship.x += ship.velocityX`:
```js
// Apply drag: each frame velocity becomes 98% of what it was.
// This simulates space friction / engine cutoff deceleration.
// Applied BEFORE position update so the slowed velocity is used for movement.
ship.velocityX *= DRAG;
ship.velocityY *= DRAG;
```

**Key insight:** Multiplicative drag (`*= 0.98`) produces exponential decay —
the ship slows quickly at first then slower and slower, never quite reaching
zero (in pure math). In practice, very small velocities become zero due to
floating point precision. This feels natural. Subtractive drag (`-= 0.1`) would
feel mechanical — it stops instantly when velocity drops below the subtracted amount.

</details>

---

## 🎯 Challenge: Draw the Thruster Flame

When the player is thrusting, show a small flickering flame behind the ship.

**Concept:** The flame is drawn in the same local space as the ship (inside
the same `ctx.save()` / `ctx.restore()` block). Since the canvas is already
translated to the ship's position and rotated to its angle, a line drawn at
`(0, 15)` appears at the ship's tail — regardless of where the ship is or
which direction it faces.

**Your task:** Inside `drawShip()`, after drawing the triangle, add flame
drawing code that only runs when the Up arrow is held.

**Starter code — where to add it:**
```js
function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);

  // ... existing ship triangle drawing code ...

  // Add flame code here, inside save/restore, while canvas is still in local space.

  ctx.restore();
}
```

**Hints:**
1. Check `keysHeld['ArrowUp']` — only draw the flame when thrusting.
2. Draw a small triangle pointing downward (positive Y = downward in local space).
3. The flame sits BELOW the ship's center — use positive Y values.
4. Add flicker: `Math.random() * 5` changes the flame length each frame.
5. Color: `'#ff6600'` (orange) or `'#ffff00'` (yellow).

---

<details>
<summary>▶ Solution — Thruster Flame</summary>

Inside `drawShip()`, after drawing the ship triangle but before `ctx.restore()`:

```js
  // Draw thruster flame when thrusting.
  // We are still inside ctx.save()/ctx.restore(), in the ship's local space.
  // Positive Y = downward = behind the ship.
  if (keysHeld['ArrowUp']) {
    const flameLength = 12 + Math.random() * 8;  // 12–20 pixels, flickers each frame

    ctx.beginPath();
    ctx.moveTo(-4, SHIP_WING_Y + 2);    // left base of flame (at the tail)
    ctx.lineTo(4,  SHIP_WING_Y + 2);    // right base of flame
    ctx.lineTo(0,  SHIP_WING_Y + flameLength);  // flame tip (below tail)
    ctx.closePath();

    ctx.fillStyle = '#ff6600';   // orange
    ctx.fill();
  }
```

**Key insight:** The flame is drawn in local space without any extra translate or
rotate. Because we already called `ctx.translate(ship.x, ship.y)` and
`ctx.rotate(ship.angle)`, the flame automatically appears at the correct
world position and faces the correct direction. This is why the translate-rotate
approach is powerful — draw in local space, transforms handle placement.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Ship triangle visible at center | White outlined triangle at canvas center |
| Left arrow rotates counter-clockwise | Hold left: ship turns left smoothly |
| Right arrow rotates clockwise | Hold right: ship turns right smoothly |
| Up arrow thrusts in facing direction | Turn to a diagonal, thrust — moves diagonally |
| Ship coasts after releasing Up | Velocity maintained after key release |
| Drag decelerates ship | After releasing Up: ship slows to a stop |
| Ship wraps at all four edges | Fly off any edge: reappear on the opposite side |
| Flame appears while thrusting | Orange triangle at ship tail, flickering |
| No rotation/translation bleeds to other draws | Background is always horizontal |

---

## What Is Next — LAB 03

LAB 03 adds bullets. Pressing Space fires a bullet from the ship's nose in the
direction the ship faces. Bullets are stored in an **array** — a list of all
active bullets. Each frame: every bullet moves forward, and bullets that go
off-screen or have existed too long are removed. This is the entity list
pattern — the same one used for asteroids, enemies in Pac-Man, and particles.

*Continue to 2D Asteroids — LAB 03 — Bullets and Entity Lists.*
