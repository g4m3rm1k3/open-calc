# PhaserJS — LAB 02 — Vectors & Movement

**Prerequisites:** LAB 01 (The Game Loop). You have a working `main.js` with `update()`, `render()`, and a game loop. You know: canvas setup, `requestAnimationFrame`, state objects, modulo wrapping, `drawDot()`.

**What this lab adds:**
- The dot moves in any direction, not just left
- You control direction by pressing arrow keys
- A velocity vector replaces the single `DOT_SPEED` constant
- Speed is separated from direction — you can change one without breaking the other

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 01, `DOT_SPEED = 3` moved the dot right. How would you make it move diagonally — both right AND down at the same time — using only what you knew then?
> 2. If a dot moves 3 pixels right and 4 pixels down each frame, how far does it actually travel per frame? (Hint: think about right triangles.)
> 3. What do you think happens to the dot's direction if you double both its horizontal and vertical speed values at the same time?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
┌──────────────────────────────────────┐
│                                      │
│         ←  ↑  →  ↓                  │
│     Arrow keys change direction      │
│                                      │
│              ●  →                    │
│         dot moves in the             │
│         direction you choose         │
│                                      │
│  (wraps at all four edges)           │
└──────────────────────────────────────┘
```

The dot starts moving right. Press any arrow key — the dot immediately changes direction. Speed stays the same regardless of direction. The dot wraps at all edges exactly as in LAB 01.

---

## Concept: Vector

**What it is:** A value that stores both a **direction** and a **magnitude** (size/length) as a pair of numbers — one for each axis.

**The problem before:**
```js
// LAB 01 approach — speed on one axis only:
const DOT_SPEED = 3;
dot.x += DOT_SPEED; // can only move right

// To move diagonally, you'd need two separate constants:
const DOT_SPEED_X = 3;
const DOT_SPEED_Y = 2;
dot.x += DOT_SPEED_X;
dot.y += DOT_SPEED_Y;
// These are now two disconnected values. 
// "What direction is the dot moving?" requires reading BOTH.
// "What is its speed?" requires calculating it from BOTH.
// Changing direction means changing two things separately — they can get out of sync.
```

**The solution:** Store both components together as one value — a **velocity vector**.
```js
const velocity = { x: 3, y: 0 }; // moving right at 3px/frame
// Direction: right (x is positive, y is zero)
// Speed: 3 (we'll prove this with the distance formula shortly)

dot.x += velocity.x; // apply horizontal component
dot.y += velocity.y; // apply vertical component
```

**What it hides:**
A velocity vector hides the coordination required to keep two separate speed variables in sync. The invariant it protects: **direction and magnitude are always stored together** — you cannot accidentally update horizontal speed while forgetting vertical speed, because they live in one object.

**Canonical example (General Explanation):**

Think of an arrow on a map showing which way a ship is sailing and how fast:
- The arrow's **direction** tells you which way
- The arrow's **length** tells you how fast (longer = faster)

In 2D code, an arrow is stored as two numbers: how far it points in x and how far in y.

```
Vector (3, 0)  →  points right,  length = 3
Vector (0, 3)  ↓  points down,   length = 3
Vector (3, 3)  ↘  points down-right, length = 4.24  (we'll prove this below)
Vector (-3, 0) ←  points left,   length = 3
```

```js
// A vector is just an object with x and y:
const myVector = { x: 3, y: 4 };
// Apply it to a position:
position.x += myVector.x;
position.y += myVector.y;
```

**Project Application (The "Why" here):**
Our dot needs to move in the direction the player chose with arrow keys. Storing velocity as `{ x, y }` means changing direction is just changing which values go into those two fields — the rest of the code (`update`, wrapping) doesn't need to change at all.

**Smallest possible example:**
```js
const position = { x: 100, y: 100 };
const velocity = { x: 2, y: -1 }; // moving right and slightly up

// Each frame:
position.x += velocity.x; // x: 100 → 102 → 104...
position.y += velocity.y; // y: 100 → 99  → 98...
```

**Why it matters here:** Replacing `DOT_SPEED` with a velocity vector is the change that unlocks all direction-based movement — including the keyboard controls in Step 4.

**Watch for:** In canvas coordinates, Y increases downward. A velocity with `y = -3` moves the dot **up** the screen. This is the opposite of what you might expect from maths class.

---

### Math: The Distance Formula (Vector Length)

**What it computes:** The straight-line distance between two points — or equivalently, the length (magnitude) of a vector.

**The real-world analogy:** A crow flying between two corners of a field doesn't follow the edges — it flies in a straight line. The distance formula finds that crow-flies distance, regardless of how far the journey is in each direction separately.

**Canonical example:**

Imagine a right triangle on a grid. One point is at (0, 0), the other at (3, 4):

```
(0,0) ────── 3 ──────► (3,0)
  │                       │
  4                        4
  │                       │
  ▼                       ▼
(0,4)                   (3,4) ← destination

Hypotenuse (direct path) = ?
```

The Pythagorean theorem: `distance² = dx² + dy²`

In plain English: square the horizontal gap, square the vertical gap, add them, take the square root.

```
dx = 3 - 0 = 3
dy = 4 - 0 = 4
distance = √(3² + 4²) = √(9 + 16) = √25 = 5
```

In code:
```js
const dx = 3;
const dy = 4;
const distance = Math.sqrt(dx * dx + dy * dy); // = 5
```

**Applying this to a velocity vector:**
A velocity vector `{ x: 3, y: 4 }` has a length (speed) of 5. The dot travels 5 pixels per frame along its diagonal path, even though it only moves 3 in x and 4 in y.

```js
const velocity = { x: 3, y: 4 };
const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
// speed = 5 — this is how fast the dot actually moves
```

**Why it matters here:** When the player presses a diagonal direction (e.g. right+down), we need the dot's actual speed to stay consistent. This formula tells us what speed the vector actually represents.

**Watch for:** `Math.sqrt(dx * dx + dy * dy)` — you square each component separately, THEN add, THEN take the root. A common mistake is computing `Math.sqrt(dx + dy) * Math.sqrt(dx + dy)`, which gives a completely wrong result.

---

### Math: The Unit Vector (Normalisation)

**What it computes:** A vector pointing in the same direction but with a length of exactly 1. Used to separate "which way" from "how fast."

**The real-world analogy:** A compass needle. It always points north — it doesn't tell you how fast you're going, just which way. A unit vector is the compass needle version of a velocity vector.

**Canonical example:**

Take any vector — say `{ x: 3, y: 4 }` (length = 5). To make it length 1, divide each component by the current length:

```
unit_x = 3 / 5 = 0.6
unit_y = 4 / 5 = 0.8

Proof: √(0.6² + 0.8²) = √(0.36 + 0.64) = √1 = 1  ✓
```

In code:
```js
const vector = { x: 3, y: 4 };
const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y); // 5
const unit = {
  x: vector.x / length, // 0.6
  y: vector.y / length, // 0.8
};
// unit now points the same direction but has length = 1
```

**To move at a specific speed in any direction:**
```js
const SPEED = 4;                           // desired speed in pixels/frame
const unit  = { x: 0.6, y: 0.8 };        // direction (unit vector)
const velocity = {
  x: unit.x * SPEED,  // 0.6 * 4 = 2.4
  y: unit.y * SPEED,  // 0.8 * 4 = 3.2
};
// Result: dot moves at exactly 4px/frame in the (3,4) direction
```

**Why it matters here:** Pressing arrow keys gives us a direction (e.g. right + down = `{ x: 1, y: 1 }`). If we used that directly as velocity, diagonal movement would be √2 times faster than axis-aligned movement. Normalising keeps speed consistent in all directions.

**Watch for:** Never normalise a zero-length vector (`{ x: 0, y: 0 }`). Dividing by zero gives `NaN` (Not a Number), which will make the dot disappear. Always check length > 0 before dividing.

---

## Step 1 — Copy Your LAB 01 Files

Create a new folder called `phaser-lab-02`. Copy `index.html`, `style.css`, and `main.js` from `phaser-lab-01` into it.

Open `main.js`. It should look like the complete reference at the end of LAB 01.

### SAVE AND TRY

Open `index.html` in your browser.

**You should see:** The white dot moving right and wrapping at the edges — exactly as LAB 01 ended.

**In DevTools Console:**
```js
dot
```
**Expected:** `{ x: [some number], y: [half the window height] }` — the dot state from LAB 01.

Everything should work before we change anything. If it doesn't, revisit LAB 01's Final Check.

---

## Step 2 — Replace `DOT_SPEED` with a Velocity Vector

We'll replace the single `DOT_SPEED` constant with a velocity object and update everything that uses it.

**In `main.js` — change the constants block at the top:**

```js
// ─── Constants ────────────────────────────────────────────────────────────────
const DOT_RADIUS = 12;       // size of the dot in pixels — unchanged
const DOT_COLOR  = '#ffffff'; // white — unchanged
const BG_COLOR   = '#000000'; // black — unchanged
const DOT_SPEED  = 3;        // ← REMOVE this line — was: const DOT_SPEED = 3
const MOVE_SPEED = 3;        // ← ADD this: pixels per frame — renamed for clarity
```

**Now update the game state object** (find the `dot` declaration):

```js
const dot = {
  x: 0,
  y: 0,
  vx: MOVE_SPEED, // ← ADD: horizontal velocity — positive = moving right
  vy: 0,          // ← ADD: vertical velocity   — zero = not moving up or down
};
// vx and vy together form the velocity vector.
// "v" is the conventional abbreviation for velocity in physics and game code.
```

**Now update `resizeCanvas`** — it still sets `dot.y`, that's fine, no change needed there.

**Now update the `update` function** to use the velocity vector:

```js
function update() {
  dot.x += dot.vx;  // ← was: dot.x += DOT_SPEED
  dot.y += dot.vy;  // ← ADD: apply vertical velocity each frame
  dot.x = (dot.x + canvas.width)  % canvas.width;  // horizontal wrap — unchanged
  dot.y = (dot.y + canvas.height) % canvas.height;  // ← ADD: vertical wrap
}
```

### SAVE AND TRY

Save. Refresh the browser.

**You should see:** The dot still moving right at the same speed. Nothing visually changed — we only refactored the internals.

**In DevTools Console:**
```js
dot.vx  // Expected: 3  (moving right)
dot.vy  // Expected: 0  (not moving vertically)
```

**Change something:** In the console, type:
```js
dot.vy = 2;
```
**Expected:** The dot immediately starts moving diagonally — right and down. The velocity vector now has both components active.

Type `dot.vy = 0` to stop vertical movement. The dot returns to moving right only.

---

## 🎯 Challenge: Diagonal Constant

**You know:** The velocity vector `{ vx, vy }` and how vector length works.

**Task:** Change the starting velocity so the dot moves at a 45° diagonal (equal x and y speed) but at the SAME total speed as before (3 pixels per frame). Use the distance formula to calculate what `vx` and `vy` should be.

**Hint:** If the total speed must be 3 and the direction is 45° (`vx === vy`), use the distance formula: `3 = √(vx² + vy²)` and solve for `vx`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// Speed = 3, direction = 45°, so vx = vy
// 3 = √(vx² + vx²) = √(2 * vx²)
// 3² = 2 * vx²
// vx² = 9/2 = 4.5
// vx = √4.5 ≈ 2.121

const DIAGONAL_COMPONENT = MOVE_SPEED / Math.sqrt(2); // ≈ 2.121

const dot = {
  x: 0,
  y: 0,
  vx: DIAGONAL_COMPONENT,
  vy: DIAGONAL_COMPONENT,
};
```

**Verification:**
```js
Math.sqrt(2.121 * 2.121 + 2.121 * 2.121) // ≈ 3  ✓
```

**Key insight:** `MOVE_SPEED / Math.sqrt(2)` is the formula for splitting any speed evenly between two equal axes. You'll use this exact formula whenever you want consistent speed in diagonal directions — including keyboard input where right+down are both pressed simultaneously.

</details>

---

## Concept: Keyboard Input with `keydown` / `keyup` Events

**What it is:** Two browser events that fire when the player presses or releases a key. Used to track which keys are currently held down.

**The problem before:**
```js
// Naive approach — listen for keydown and set velocity directly:
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') dot.vx = MOVE_SPEED;
});
// Problem: what happens when the player releases the key?
// The dot keeps moving right forever — keydown fires once but nothing stops it.
// Problem 2: what if ArrowRight AND ArrowDown are held simultaneously?
// The last keydown wins — you can't move diagonally.
```

**The solution:** Track which keys are *currently held* in a `keys` object. Update velocity in `update()` based on that snapshot — not directly inside the event listener.

```js
const keys = {}; // empty object — acts as a set of currently-held keys

document.addEventListener('keydown', (event) => {
  keys[event.key] = true;  // mark this key as held
});
document.addEventListener('keyup', (event) => {
  keys[event.key] = false; // mark this key as released
});

// In update():
if (keys['ArrowRight']) dot.vx =  MOVE_SPEED;
if (keys['ArrowLeft'])  dot.vx = -MOVE_SPEED;
// Both can be true simultaneously → diagonal movement works naturally
```

**What it hides:**
The `keys` object hides the complexity of tracking multiple simultaneous key states. The invariant: **`keys[keyName]` is always `true` if the key is currently held, `false` or `undefined` if it is not** — you never need to manually track press/release timing or multi-key combinations. The `update()` function reads the snapshot at the moment it runs.

**Canonical example (General Explanation):**
Think of a light switch panel with many switches. Each switch (key) is either ON (`true`) or OFF (`false`/not present). The panel doesn't know the history of which switches were flipped — it only knows the current state. Your `update()` function reads the panel once per frame and acts on what it sees.

```js
const keys = {};
document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup',   e => { keys[e.key] = false; });

// Check any key at any time:
if (keys['ArrowRight']) { /* right is held */ }
if (keys[' '])          { /* spacebar is held */ }
```

**Project Application (The "Why" here):**
We check `keys` inside `update()`, which runs 60 times per second. This means the dot responds immediately to input and stops immediately when a key is released — because `update()` re-evaluates direction every frame from the current key state.

**Why it matters here:** This is the input system every future lab will use for player control.

**Watch for:** `keys[e.key]` uses the key's string name (`'ArrowRight'`, `'ArrowLeft'`, `'ArrowUp'`, `'ArrowDown'`, `' '` for spacebar). The names are case-sensitive. Check the exact string in the console with `console.log(event.key)` inside the handler if something isn't working.

---

### Logic: Resolving Direction from Multiple Keys

**What it decides:** Given which arrow keys are held, what should the dot's velocity be?

**Truth table (horizontal axis):**

| ArrowLeft held | ArrowRight held | Result |
|---|---|---|
| false | false | `vx = 0` — no horizontal movement |
| true | false | `vx = -MOVE_SPEED` — moving left |
| false | true | `vx = +MOVE_SPEED` — moving right |
| true | true | `vx = 0` — both cancel out (player pressed both) |

Same logic applies to the vertical axis with ArrowUp and ArrowDown.

**The code:**
```js
// Horizontal: start at 0, then apply whichever keys are held
let inputX = 0;
if (keys['ArrowLeft'])  inputX -= 1; // subtract 1 for left
if (keys['ArrowRight']) inputX += 1; // add 1 for right
// Result: -1, 0, or +1

// Vertical:
let inputY = 0;
if (keys['ArrowUp'])   inputY -= 1; // up = negative y (canvas y-axis is flipped)
if (keys['ArrowDown']) inputY += 1; // down = positive y
```

**Watch for:** Both conditions use independent `if` (not `else if`). This is intentional — both can be true at once, and they cancel each other out. Using `else if` would prevent diagonal movement from working.

---

### Math: Normalising Input Direction

**What it computes:** The correct velocity given a raw input direction, keeping speed constant whether moving on one axis or diagonally.

**The problem:**
```
Input (1, 0)  → length = 1   → speed × 1   = 3.0 px/frame  ✓
Input (1, 1)  → length = √2  → speed × √2  = 4.24 px/frame ✗ diagonal is faster!
```

**The solution:** Normalise the input direction to length 1 before multiplying by speed.

```js
const inputX = 1; // right
const inputY = 1; // down
const inputLength = Math.sqrt(inputX * inputX + inputY * inputY); // √2 ≈ 1.414

// Guard against zero-length input (no keys held):
if (inputLength > 0) {
  dot.vx = (inputX / inputLength) * MOVE_SPEED; // (1/√2) * 3 ≈ 2.12
  dot.vy = (inputY / inputLength) * MOVE_SPEED; // (1/√2) * 3 ≈ 2.12
} else {
  dot.vx = 0;
  dot.vy = 0;
}
// Now speed is exactly MOVE_SPEED in all directions ✓
```

**Why it matters here:** Without normalisation, diagonal movement is ~41% faster than horizontal or vertical. This makes the game feel wrong — players instinctively notice this inconsistency.

**Watch for:** The `inputLength > 0` guard is not optional. If no keys are held, `inputX` and `inputY` are both 0, so `inputLength` is 0, and dividing by 0 gives `NaN` — which corrupts the dot's position permanently.

---

## Step 3 — Add the Key Tracking

Add to **`main.js`**, after the game state object and before `resizeCanvas`:

```js
// ─── Input State ──────────────────────────────────────────────────────────────
const keys = {};
// An object used as a dictionary: keys[keyName] = true when held, false when released.
// Empty at start — no keys held.

document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  // Mark this key as currently held.
  // event.key is a string like 'ArrowRight', 'ArrowUp', ' ' (spacebar), etc.
  event.preventDefault();
  // Stop the browser from scrolling when arrow keys are pressed.
  // Without this, arrow keys scroll the page instead of controlling the dot.
});

document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
  // Mark this key as released. Now update() will stop applying its direction.
});
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Dot still moving right. Nothing visual changed — we only set up tracking.

**In DevTools Console:**
- Press and hold the right arrow key. While holding it, type:
```js
keys['ArrowRight']
```
**Expected:** `true`

- Release the key, then type the same command.
**Expected:** `false`

**Change something:** Press several keys simultaneously, then type:
```js
keys
```
**Expected:** An object with `true` for every currently-held key and `false` for recently released ones — e.g. `{ ArrowRight: true, ArrowUp: false }`.

---

## Step 4 — Apply Input to Velocity

Now update the `update` function to read from `keys` and set velocity:

```js
function update() {
  // ── Read input ────────────────────────────────────────────────────
  let inputX = 0; // will be -1, 0, or +1 based on arrow keys
  let inputY = 0;

  if (keys['ArrowLeft'])  inputX -= 1; // ← add this
  if (keys['ArrowRight']) inputX += 1; // ← add this
  if (keys['ArrowUp'])    inputY -= 1; // ← add this (up = negative y on canvas)
  if (keys['ArrowDown'])  inputY += 1; // ← add this

  // ── Normalise direction and apply speed ───────────────────────────
  const inputLength = Math.sqrt(inputX * inputX + inputY * inputY);
  // inputLength: 0 if no keys, 1 if one axis, √2 ≈ 1.414 if diagonal

  if (inputLength > 0) {
    // At least one arrow key is held — set velocity in that direction
    dot.vx = (inputX / inputLength) * MOVE_SPEED;
    // Normalise: inputX/inputLength gives a unit component, then scale by MOVE_SPEED
    dot.vy = (inputY / inputLength) * MOVE_SPEED; // ← add this
  }
  // Note: if no keys are held, velocity stays unchanged from the last frame.
  // The dot keeps moving — we'll add a "stop when no key held" option in the challenge.

  // ── Move the dot ──────────────────────────────────────────────────
  dot.x += dot.vx; // apply velocity to position
  dot.y += dot.vy;
  dot.x = (dot.x + canvas.width)  % canvas.width;
  dot.y = (dot.y + canvas.height) % canvas.height;
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The dot moving right (initial velocity). Press arrow keys — the dot immediately changes direction. Press two arrow keys at once — the dot moves diagonally.

**In DevTools Console:**
```js
Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy).toFixed(2)
```
**Expected:** `"3.00"` — regardless of which direction the dot is moving. Press a diagonal, run this again — still `"3.00"`. The speed is constant in all directions.

**Change something:** Change `MOVE_SPEED = 3` to `MOVE_SPEED = 8`. Save. The dot zips around much faster. Change it back to `3`.

---

## 🎯 Challenge: Stop When No Key Is Held

**You know:** How velocity is set in `update()` when keys are pressed.

**Task:** Make the dot stop when no arrow key is held, instead of coasting. When the player presses a key, the dot should move. When they release all keys, the dot should stop immediately.

**Starting code (the relevant part of `update`):**
```js
if (inputLength > 0) {
  dot.vx = (inputX / inputLength) * MOVE_SPEED;
  dot.vy = (inputY / inputLength) * MOVE_SPEED;
}
// Add the "else" case here
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
if (inputLength > 0) {
  dot.vx = (inputX / inputLength) * MOVE_SPEED;
  dot.vy = (inputY / inputLength) * MOVE_SPEED;
} else {
  dot.vx = 0; // ← add this
  dot.vy = 0; // ← add this: no input → stop the dot
}
```

**Key insight:** The `else` branch runs every frame when no keys are held. Setting velocity to zero each frame means the dot stops immediately. Without the `else`, the last velocity persists forever — the dot coasts until the next key press. Both behaviours are valid in different games. Asteroids uses coasting (no `else`). Pac-Man uses stop (with `else`). Choose based on your game's feel.

</details>

---

## 🎯 Challenge: Speed Boost

**You know:** The velocity vector and how `MOVE_SPEED` scales it.

**Task:** Make the dot move 2× faster while the Shift key is held. Normal speed when released.

**Hints:**
1. `event.key` for Shift is `'Shift'` — the same `keys` tracking already handles it.
2. You need to decide what speed multiplier to use when `keys['Shift']` is true.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// In update(), replace the MOVE_SPEED references:

const BOOST_MULTIPLIER = 2; // how much faster Shift makes you  ← add at top as constant

// In update(), change the velocity calculation:
const currentSpeed = keys['Shift']
  ? MOVE_SPEED * BOOST_MULTIPLIER // Shift held: double speed
  : MOVE_SPEED;                   // normal speed

if (inputLength > 0) {
  dot.vx = (inputX / inputLength) * currentSpeed; // ← was: MOVE_SPEED
  dot.vy = (inputY / inputLength) * currentSpeed; // ← was: MOVE_SPEED
}
```

**Key insight:** The ternary operator `condition ? valueIfTrue : valueIfFalse` selects between two values based on a condition. It's a compact if/else for expressions. Here, it selects the speed multiplier based on whether Shift is held — the normalisation and direction logic don't change at all. This is a preview of the **Strategy Pattern** (LAB 07) — swapping one behaviour (speed) without changing the surrounding logic.

</details>

---

## Step 5 — Draw the Velocity Arrow (Visual Debug)

Right now it's hard to tell the dot's exact direction from watching it. Let's draw a small arrow showing the velocity vector — a common technique called a **debug visualisation**.

### Concept: `ctx.save()` and `ctx.restore()`

**What it is:** Two canvas methods that save and restore the full drawing state (fill colour, stroke colour, line width, transformations). Anything you change between `save()` and `restore()` is undone when `restore()` is called.

**The problem before:**
```js
ctx.strokeStyle = '#ff0000'; // red for the arrow
ctx.lineWidth   = 2;
// ... draw arrow ...
// Now we have to manually remember and reset EVERY property we changed:
ctx.strokeStyle = DOT_COLOR;
ctx.lineWidth   = 1;
// If we forget one property, all subsequent drawing is corrupted.
```

**The solution:**
```js
ctx.save();               // save ALL current settings
ctx.strokeStyle = '#ff0000';
ctx.lineWidth   = 2;
// ... draw arrow ...
ctx.restore();            // all settings restored — strokeStyle, lineWidth, everything
```

**What it hides:**
`save/restore` hides the need to manually track every canvas state property you've changed. The invariant: **after `restore()`, the drawing context is identical to what it was at the matching `save()` call** — no property change inside the save/restore block can leak out.

**Why it matters here:** The arrow uses different colours and line widths from the dot. `save/restore` means the dot's drawing code never needs to know or undo those changes.

**Watch for:** `save` and `restore` must be called in matching pairs. Every `save` needs exactly one `restore`. Nesting works (save → save → restore → restore), but an unmatched save causes all subsequent `restore` calls to fail silently.

---

Add a new draw function. Place it after `drawDot` and before `update`:

```js
// ─── Draw Velocity Arrow ──────────────────────────────────────────────────────
const ARROW_SCALE  = 8;       // how many pixels per unit of velocity
const ARROW_COLOR  = '#44ff88'; // bright green — visually distinct from the dot

function drawVelocityArrow(x, y, vx, vy) {
  const arrowEndX = x + vx * ARROW_SCALE;
  // the arrow tip is ARROW_SCALE pixels per unit of velocity ahead of the dot
  const arrowEndY = y + vy * ARROW_SCALE;

  ctx.save(); // ← save the current drawing state before we change it

  ctx.strokeStyle = ARROW_COLOR;
  ctx.lineWidth   = 2;         // thin line for the arrow shaft

  ctx.beginPath();
  ctx.moveTo(x, y);            // start at the dot's centre
  ctx.lineTo(arrowEndX, arrowEndY); // draw to the arrow tip
  ctx.stroke();                // paint the line (stroke, not fill — it's a line)

  ctx.restore(); // ← undo strokeStyle and lineWidth changes
}
```

Now call it inside `render()`:

```js
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawDot(dot.x, dot.y);
  drawVelocityArrow(dot.x, dot.y, dot.vx, dot.vy); // ← add this line
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** A short green line extending from the dot's centre, pointing in the direction the dot is moving. Press arrow keys — the arrow rotates to show the new direction. Press a diagonal — the arrow points diagonally.

**In DevTools Console:**
```js
dot.vx.toFixed(2) + ', ' + dot.vy.toFixed(2)
```
Press right arrow while running. **Expected:** `"3.00, 0.00"`. Press down arrow. **Expected:** `"0.00, 3.00"`. Press diagonal (right+down). **Expected:** `"2.12, 2.12"`.

**Change something:** Change `ARROW_SCALE = 8` to `ARROW_SCALE = 20`. The arrow grows longer, more visible. Change it back to `8`.

---

## 🎯 Challenge: Colour by Speed

**You know:** The distance formula for vector length. The `ctx.save/restore` pattern.

**Task:** Make the dot's fill colour change based on how fast it's moving. At `MOVE_SPEED`, it should be white. At `MOVE_SPEED * 2` (boost), it should be bright yellow `'#ffff00'`. Use `Math.sqrt` to calculate current speed, then choose the colour.

**Starting code:**
```js
function drawDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = DOT_COLOR; // ← this line needs to change
  ctx.fill();
}
```

**Hint:** `drawDot` doesn't currently know the velocity. You'll need to either pass `vx` and `vy` as parameters, or access `dot.vx` and `dot.vy` directly.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
const BOOST_COLOR  = '#ffff00'; // yellow when moving at boost speed

function drawDot(x, y, vx, vy) {
  // ← added vx, vy parameters
  const currentSpeed = Math.sqrt(vx * vx + vy * vy);
  // calculate actual speed from velocity components

  ctx.beginPath();
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = currentSpeed > MOVE_SPEED + 0.1
    ? BOOST_COLOR  // moving fast (boost active)
    : DOT_COLOR;   // normal speed
  ctx.fill();
}

// Update the render() call:
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawDot(dot.x, dot.y, dot.vx, dot.vy); // ← pass velocity
  drawVelocityArrow(dot.x, dot.y, dot.vx, dot.vy);
}
```

**Key insight:** `MOVE_SPEED + 0.1` adds a small tolerance to avoid floating-point edge cases where the speed might be `2.9999` instead of exactly `3.0`. Tolerance thresholds like this appear everywhere in game programming — you'll see them again in LAB 04 (collision detection).

</details>

---

## Concept: State — Level 2

**In LAB 01** you used a state object `{ x, y }` to store position.

**Here it appears in a more complex form:** The state now includes velocity `{ vx, vy }` alongside position. The state captures not just *where* the dot is, but *how it's moving*.

**The new complexity:** State now has two kinds of fields:
- **Position** (`x`, `y`) — where the dot IS right now
- **Velocity** (`vx`, `vy`) — how the dot IS CHANGING per frame

This separation matters: `render()` only reads position. `update()` reads velocity to compute the next position, then writes back to position. The two concerns stay clean.

---

## Final Check

| Feature | How to verify |
|---|---|
| Dot moves right on load | Refresh — dot moves right without any key press |
| Left arrow moves dot left | Press ArrowLeft — dot moves toward the left edge |
| Right arrow moves dot right | Press ArrowRight — dot moves toward the right edge |
| Up arrow moves dot up | Press ArrowUp — dot moves toward the top edge |
| Down arrow moves dot down | Press ArrowDown — dot moves toward the bottom edge |
| Diagonal movement works | Hold ArrowRight + ArrowDown simultaneously — dot moves diagonally |
| Speed is constant in all directions | Console: `Math.sqrt(dot.vx**2 + dot.vy**2).toFixed(1)` → `"3.0"` in all directions |
| Green arrow shows direction | A green line extends from the dot pointing the way it's moving |
| Arrow rotates with direction | Change direction with keys — arrow rotates to match |
| All edges wrap | Let dot exit each edge — it reappears at the opposite edge |

---

## Complete `main.js` Reference

```js
// LAB 02 — Vectors & Movement

// ─── Constants ────────────────────────────────────────────────────────────────
const DOT_RADIUS       = 12;
const DOT_COLOR        = '#ffffff';
const BG_COLOR         = '#000000';
const MOVE_SPEED       = 3;          // pixels per frame at full speed
const BOOST_MULTIPLIER = 2;          // speed multiplier when Shift is held
const ARROW_SCALE      = 8;          // pixels per velocity unit for debug arrow
const ARROW_COLOR      = '#44ff88';
const BOOST_COLOR      = '#ffff00';

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ─── Game State ───────────────────────────────────────────────────────────────
const dot = {
  x: 0,
  y: 0,
  vx: MOVE_SPEED, // initial velocity: moving right
  vy: 0,
};

// ─── Input State ──────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  event.preventDefault(); // stop arrow keys from scrolling the page
});
document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

// ─── Canvas Resize ────────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  dot.y = canvas.height / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Draw Functions ───────────────────────────────────────────────────────────
function drawDot(x, y, vx, vy) {
  const currentSpeed = Math.sqrt(vx * vx + vy * vy);
  ctx.beginPath();
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = currentSpeed > MOVE_SPEED + 0.1 ? BOOST_COLOR : DOT_COLOR;
  ctx.fill();
}

function drawVelocityArrow(x, y, vx, vy) {
  ctx.save();
  ctx.strokeStyle = ARROW_COLOR;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + vx * ARROW_SCALE, y + vy * ARROW_SCALE);
  ctx.stroke();
  ctx.restore();
}

// ─── Update ───────────────────────────────────────────────────────────────────
function update() {
  let inputX = 0;
  let inputY = 0;
  if (keys['ArrowLeft'])  inputX -= 1;
  if (keys['ArrowRight']) inputX += 1;
  if (keys['ArrowUp'])    inputY -= 1;
  if (keys['ArrowDown'])  inputY += 1;

  const inputLength = Math.sqrt(inputX * inputX + inputY * inputY);
  const currentSpeed = keys['Shift'] ? MOVE_SPEED * BOOST_MULTIPLIER : MOVE_SPEED;

  if (inputLength > 0) {
    dot.vx = (inputX / inputLength) * currentSpeed;
    dot.vy = (inputY / inputLength) * currentSpeed;
  } else {
    dot.vx = 0;
    dot.vy = 0;
  }

  dot.x += dot.vx;
  dot.y += dot.vy;
  dot.x = (dot.x + canvas.width)  % canvas.width;
  dot.y = (dot.y + canvas.height) % canvas.height;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawDot(dot.x, dot.y, dot.vx, dot.vy);
  drawVelocityArrow(dot.x, dot.y, dot.vx, dot.vy);
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

In **LAB 03** the dot becomes a ship. You'll use **trigonometry** — `sin` and `cos` — to make the ship face any angle and thrust in the direction it's pointing. The key ideas:

- The unit circle: every angle maps to a point, and that point IS a direction vector
- `Math.cos(angle)` and `Math.sin(angle)` give you the x and y components of that direction
- Pressing left/right rotates the ship; pressing up thrusts forward in the direction it's facing

The velocity vector you built today is the foundation — in LAB 03 we'll compute it from an angle instead of from arrow keys.

---

## Quick Check Answers

**1. In LAB 01, `DOT_SPEED = 3` moved the dot right. How would you make it move diagonally using only what you knew then?**

You'd need two separate constants: `DOT_SPEED_X = 3` and `DOT_SPEED_Y = 2`, then `dot.x += DOT_SPEED_X` and `dot.y += DOT_SPEED_Y`. This works for one fixed diagonal but doesn't let you change direction — and the actual speed would be `Math.sqrt(3² + 2²) = 3.6`, not either of the two constants. This is exactly the problem the velocity vector solves by storing both components together and letting normalisation keep the speed constant.

**2. If a dot moves 3 pixels right and 4 pixels down each frame, how far does it actually travel per frame?**

`Math.sqrt(3² + 4²) = Math.sqrt(9 + 16) = Math.sqrt(25) = 5` pixels per frame. The Pythagorean theorem gives the straight-line (crow-flies) distance. The 3-4-5 right triangle is the canonical example of this — the numbers work out to a perfect integer, which is why it's used to teach the formula.

**3. What happens to the dot's direction if you double both its horizontal and vertical speed values at the same time?**

The direction stays exactly the same — only the speed (magnitude) changes. Doubling both components scales the vector's length by 2 but doesn't change the angle it points. Mathematically: `atan2(2y, 2x) = atan2(y, x)` — the 2s cancel in the ratio. This is why normalisation works: dividing both components by the same length scales the vector to length 1 without changing its direction.

---

*End of LAB 02. Next: [[LAB-03-Trigonometry-and-Rotation]]*
