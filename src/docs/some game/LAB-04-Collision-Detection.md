# PhaserJS — LAB 04 — Bullets & Collision Detection

**Prerequisites:** LAB 03 (Trigonometry & Rotation). You have a ship that rotates and thrusts with arrow keys. You know: velocity vectors, `Math.cos/sin`, `ctx.translate/rotate`, `ctx.save/restore`, the distance formula.

**What this lab adds:**
- Spacebar fires a bullet in the direction the ship is facing
- Multiple bullets alive at once, each moving independently
- Static asteroids on screen (circles)
- Bullet-asteroid collision detection: hit = asteroid disappears

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A bullet travels at 8 pixels per frame. An asteroid has radius 25px. If the bullet's centre is 30px from the asteroid's centre, has it hit?
> 2. What data does one bullet need to have? Think: what must you store to move it independently from the ship?
> 3. What do you predict happens to the `bullets` array when a bullet flies off the right edge — should it wrap like the ship, or should something else happen?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
┌──────────────────────────────────────┐
│                                      │
│   ○       ○         ○                │
│     ○           ○                    │
│        ▲  •→→→→→→ [○ disappears!]   │
│       / \                            │
│                                      │
│  Spacebar = fire bullet              │
│  Bullets travel forward from ship    │
│  Asteroid hit = asteroid removed     │
└──────────────────────────────────────┘
```

Five asteroids appear at random positions on load. The ship can fire bullets that travel through space. When a bullet's centre gets within `bullet_radius + asteroid_radius` of an asteroid's centre, the asteroid is removed. Bullets that leave the screen are removed (not wrapped).

---

## Concept: Array of Objects — Entity Lists

**What it is:** A JavaScript array where each element is an object representing one entity (bullet, asteroid, enemy). The array is the canonical data structure for "multiple things of the same kind."

**The problem before:**
```js
// Storing two bullets as separate variables — falls apart at 3+
const bullet1 = { x: 100, y: 200, vx: 5, vy: 0, lifetime: 60 };
const bullet2 = { x: 150, y: 180, vx: 5, vy: 0, lifetime: 55 };
// To update both: two separate function calls, manually.
// To check 10 bullets against 5 asteroids: 50 individual checks, manually.
// To delete bullet 2: set it to null and handle null checks everywhere.
```

**The solution:**
```js
const bullets = []; // empty at start — bullets are added as the player fires

// Add a bullet:
bullets.push({ x: 100, y: 200, vx: 5, vy: 0, lifetime: 60 });

// Update ALL bullets with a loop:
for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
  bullets[bulletIndex].x += bullets[bulletIndex].vx;
}

// Remove bullets that expired — filter returns a NEW array with only passing elements:
bullets = bullets.filter(bullet => bullet.lifetime > 0);
```

**What it hides:**
An array with a loop hides the need to manually handle each entity individually. The invariant: **every entity of the same kind is processed with identical logic** — if you update one bullet correctly, every bullet in the array is updated correctly by the same loop. You never have to add a new `bullet3` variable when a third bullet is fired.

**Canonical example (General Explanation):**
A post office has a stack of parcels. A worker processes every parcel the same way: stamp, weigh, label. The worker doesn't care if there are 1 or 1000 parcels — the same steps apply to each. An array + loop is the programmer's version of this system.

```js
const parcels = [
  { weight: 2.1, destination: 'London' },
  { weight: 0.5, destination: 'Paris'  },
];
for (let i = 0; i < parcels.length; i++) {
  console.log(`Ship ${parcels[i].weight}kg to ${parcels[i].destination}`);
}
```

**Project Application (The "Why" here):**
Each bullet is an independent entity with its own position, velocity, and lifetime. An array lets us fire 0–20 bullets simultaneously, update them all in one loop, and remove expired ones cleanly.

**Why it matters here:** This pattern is the foundation for every game entity system — bullets, asteroids, enemies, particles. You'll use it in every remaining lab.

**Watch for:** Never modify an array while iterating it with a standard `for` loop (deleting elements shifts indices). Use `filter()` to create a new array without the expired elements — this is safe.

---

### Concept: `Array.filter()`

**What it is:** An array method that returns a NEW array containing only the elements for which the callback function returns `true`.

**The problem before:**
```js
// Removing expired bullets from an array manually:
const liveBullets = [];
for (let i = 0; i < bullets.length; i++) {
  if (bullets[i].lifetime > 0) {
    liveBullets.push(bullets[i]); // keep only live ones
  }
}
bullets = liveBullets; // replace old array
// This works but is verbose. Every entity type needs this pattern written out.
```

**The solution:**
```js
bullets = bullets.filter(bullet => bullet.lifetime > 0);
// Returns a new array containing ONLY bullets where lifetime > 0.
// The original array is not modified — filter always creates a new one.
```

**What it hides:**
`filter` hides the loop, the accumulator array, and the push logic. The invariant: **the returned array contains exactly the elements for which the callback returned `true`** — no manual indexing or accumulator management needed.

**Smallest possible example:**
```js
const numbers = [1, 2, 3, 4, 5];
const evens   = numbers.filter(n => n % 2 === 0); // [2, 4]
// numbers is unchanged: [1, 2, 3, 4, 5]
// evens is a new array:  [2, 4]
```

**Why it matters here:** We'll call `bullets.filter(...)` at the end of `update()` every frame to remove bullets that have left the screen or exceeded their lifetime.

**Watch for:** `filter` does NOT modify the original array. You must assign the result back: `bullets = bullets.filter(...)`. Forgetting the assignment means the bullets never disappear.

---

### Concept: `Array.push()`

**What it is:** Adds one element to the END of an array and returns the new array length.

**Smallest possible example:**
```js
const fruits = ['apple', 'banana'];
fruits.push('cherry');
// fruits is now: ['apple', 'banana', 'cherry']
```

**Project Application:** We call `bullets.push(newBullet)` every time the player fires. The new bullet object is added to the end of the array, and the next `update()` call will process it along with all existing bullets.

**Watch for:** `push` modifies the original array in place (unlike `filter` which returns a new one). Be consistent: always know which array methods mutate and which return new arrays.

---

## Step 1 — Copy LAB 03 Files

Create a new folder called `phaser-lab-04`. Copy `index.html`, `style.css`, and `main.js` from `phaser-lab-03`.

### SAVE AND TRY

Open `index.html`. Ship should rotate, thrust, and wrap as per LAB 03. Confirm before continuing.

---

## Step 2 — Spawn Asteroids

We'll add asteroids as an array of objects with position and radius.

**Add constants:**
```js
const ASTEROID_COUNT  = 5;    // ← ADD: number of asteroids to spawn
const ASTEROID_MIN_R  = 20;   // ← ADD: minimum asteroid radius in pixels
const ASTEROID_MAX_R  = 45;   // ← ADD: maximum asteroid radius in pixels
const ASTEROID_COLOR  = '#aaaaaa'; // ← ADD: grey
```

**Add asteroid state — place this after the `ship` state object:**
```js
// ─── Asteroids ────────────────────────────────────────────────────────────────
let asteroids = []; // ← ADD: will hold asteroid objects; 'let' because we'll reassign after collisions
```

**Add a spawn function — place after `resizeCanvas`:**
```js
// ─── Spawn Asteroids ──────────────────────────────────────────────────────────
function spawnAsteroids() {
  asteroids = []; // clear any existing asteroids before spawning fresh ones
  for (let asteroidIndex = 0; asteroidIndex < ASTEROID_COUNT; asteroidIndex++) {
    // Math.random() returns a decimal between 0 (inclusive) and 1 (exclusive).
    // Multiplying by a range and adding an offset maps it to the desired range.
    const radius = ASTEROID_MIN_R + Math.random() * (ASTEROID_MAX_R - ASTEROID_MIN_R);
    // radius: random number between ASTEROID_MIN_R and ASTEROID_MAX_R

    asteroids.push({
      x:      Math.random() * canvas.width,   // random x anywhere on canvas
      y:      Math.random() * canvas.height,  // random y anywhere on canvas
      radius: radius,
    });
  }
}
spawnAsteroids(); // ← call once to create the initial asteroids
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Still just the ship — asteroids are in the array but not drawn yet.

**In DevTools Console:**
```js
asteroids
```
**Expected:** An array of 5 objects, each with `x`, `y`, and `radius` properties. Run again after refresh — different positions each time (because `Math.random()`).

```js
asteroids[0].radius.toFixed(1)
```
**Expected:** A number between 20 and 45.

---

## Step 3 — Draw Asteroids

Add a draw function for asteroids. Place after `drawExhaust`:

```js
// ─── Draw Asteroid ────────────────────────────────────────────────────────────
function drawAsteroid(asteroid) {
  ctx.beginPath();
  ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
  // draw a circle at the asteroid's position with its radius
  ctx.strokeStyle = ASTEROID_COLOR; // grey outline
  ctx.lineWidth   = 2;
  ctx.stroke();
  // stroke (outline only) instead of fill — saves us a save/restore
  // because strokeStyle is set here but doesn't interfere with fill-based draws
}
```

**Update `render()` to draw all asteroids:**

```js
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw all asteroids
  for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
    drawAsteroid(asteroids[asteroidIndex]); // ← ADD
  }
  // asteroids.length automatically reflects removals — no special handling needed

  drawExhaust(ship.x, ship.y, ship.angle);
  drawShip(ship.x, ship.y, ship.angle);
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** 5 grey circle outlines scattered around the canvas. The ship sits on top of them. Refresh again — different positions.

**In DevTools Console:**
```js
asteroids.length
```
**Expected:** `5`

```js
asteroids.pop(); // remove the last asteroid
```
**Expected:** The asteroid count drops to 4 and one circle disappears from the screen immediately (next frame renders without it). Type `spawnAsteroids()` to reset.

---

## Step 4 — Fire Bullets

Now we add the bullet system: fire on Spacebar, move each bullet, remove off-screen bullets.

**Add constants:**
```js
const BULLET_SPEED    = 8;   // ← ADD: pixels per frame
const BULLET_RADIUS   = 3;   // ← ADD: visual radius and collision radius
const BULLET_LIFETIME = 90;  // ← ADD: frames before bullet is removed (~1.5 seconds at 60fps)
const BULLET_COLOR    = '#ffff00'; // ← ADD: yellow
```

**Add bullet state — after `asteroids`:**
```js
let bullets   = []; // ← ADD: array of active bullet objects
let canFire   = true; // ← ADD: prevents holding spacebar from rapid-firing
// 'canFire' is a guard: it goes false when space is pressed, true when space is released
```

**Add a fire function — after `spawnAsteroids`:**
```js
// ─── Fire Bullet ─────────────────────────────────────────────────────────────
function fireBullet() {
  bullets.push({
    x:        ship.x,                          // start at ship's centre
    y:        ship.y,
    vx:       Math.cos(ship.angle) * BULLET_SPEED, // fly in the direction the ship faces
    vy:       Math.sin(ship.angle) * BULLET_SPEED,
    lifetime: BULLET_LIFETIME,                 // how many frames until self-removal
  });
}
```

**Update keydown handler to also handle spacebar:**
```js
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  event.preventDefault();
  
  if (event.key === ' ' && canFire) { // ← ADD: space = fire, only if canFire
    fireBullet();
    canFire = false; // ← ADD: prevent holding space = machine gun
  }
});

document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
  if (event.key === ' ') canFire = true; // ← ADD: reset fire permission on release
});
```

**Update `update()` — add bullet movement and removal:**

```js
function update() {
  // [... rotation, thrust, drag, speed cap, ship movement — unchanged ...]

  // ── Bullets ────────────────────────────────────────────────────────────────
  for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
    bullets[bulletIndex].x        += bullets[bulletIndex].vx; // move each bullet
    bullets[bulletIndex].y        += bullets[bulletIndex].vy;
    bullets[bulletIndex].lifetime -= 1;
    // decrement lifetime every frame — bullet will be removed when this reaches 0
  }

  // Remove bullets that have expired OR left the canvas
  bullets = bullets.filter(bullet =>
    bullet.lifetime > 0 &&             // still has frames left
    bullet.x > 0 &&                    // inside left edge
    bullet.x < canvas.width &&         // inside right edge
    bullet.y > 0 &&                    // inside top edge
    bullet.y < canvas.height           // inside bottom edge
  );
  // filter returns a new array — only bullets passing ALL conditions survive
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Ship and asteroids as before. Press Spacebar — nothing visible yet (no draw function for bullets).

**In DevTools Console:**
- Press Spacebar once, then immediately type:
```js
bullets.length
```
**Expected:** `1`. Wait a few seconds, run again — `0` (bullet expired).

```js
bullets[0]
```
**Expected:** An object with `x`, `y`, `vx`, `vy`, `lifetime` — if caught quickly enough.

---

## Step 5 — Draw Bullets

Add the draw function and call it in `render()`:

```js
// ─── Draw Bullet ─────────────────────────────────────────────────────────────
function drawBullet(bullet) {
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = BULLET_COLOR;
  ctx.fill();
}
```

**Update `render()`:**
```js
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
    drawAsteroid(asteroids[asteroidIndex]);
  }

  // Draw all bullets
  for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
    drawBullet(bullets[bulletIndex]); // ← ADD
  }

  drawExhaust(ship.x, ship.y, ship.angle);
  drawShip(ship.x, ship.y, ship.angle);
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Press Spacebar — a yellow dot fires from the ship and travels forward. It disappears when it reaches an edge. Aim at an asteroid and fire — the bullet passes through (no collision yet).

**Change something:** Change `BULLET_LIFETIME = 90` to `BULLET_LIFETIME = 20`. Bullets now disappear much sooner. Change it back.

---

## Step 6 — Collision Detection

Now the important part. We need to check whether any bullet is close enough to any asteroid to count as a hit.

### Math: Distance Formula — Second Appearance

**In LAB 02** you used the distance formula to calculate a vector's speed (its own length).

**Here it appears in a new form:** We're computing the distance BETWEEN two separate points — a bullet and an asteroid centre. If that distance is less than the sum of their radii, they're overlapping.

```
Bullet at (bx, by) — radius: BULLET_RADIUS
Asteroid at (ax, ay) — radius: asteroid.radius

Distance between centres:
  dx = bx - ax
  dy = by - ay
  distance = Math.sqrt(dx*dx + dy*dy)

They overlap if:
  distance < BULLET_RADIUS + asteroid.radius
  (their circles are touching or overlapping)
```

**The visual proof:**
```
     ●←—r_bullet—→ . ←—r_asteroid—→ ○
     bullet                           asteroid
     
     If the gap between surfaces is 0:
       centre-to-centre distance = r_bullet + r_asteroid
     If the gap is negative (overlap):
       centre-to-centre distance < r_bullet + r_asteroid  ← HIT
```

**Why it matters here:** Every bullet must be checked against every asteroid. This is an O(b × a) operation — where b = number of bullets and a = number of asteroids. With 10 bullets and 5 asteroids: 50 comparisons per frame. This is fine for small counts but would need optimisation at large scale (LAB 05 will discuss this).

---

### Logic: Circle–Circle Collision

**What it decides:** Are two circles overlapping?

**Truth table (plain English):**

| `distance < r1 + r2` | Meaning |
|---|---|
| `true` | Circles overlap → collision |
| `false` | Circles are separated → no collision |

**The code:**
```js
function circlesOverlap(ax, ay, ar, bx, by, br) {
  // a = first circle (x, y, radius)
  // b = second circle (x, y, radius)
  const dx = bx - ax; // horizontal distance between centres
  const dy = by - ay; // vertical distance between centres
  const distanceSquared = dx * dx + dy * dy;
  // distanceSquared avoids Math.sqrt — we compare squares to save computation
  const radiiSum = ar + br;
  return distanceSquared < radiiSum * radiiSum;
  // if distance² < (r1+r2)², they overlap — same as: distance < r1+r2
}
```

**Why avoid `Math.sqrt`?** Square root is expensive (relatively). If `d < r`, then `d² < r²`. We can compare the squared values and skip the `sqrt` entirely. This is the **squared distance shortcut**.

**Watch for:** The shortcut only works for comparisons. If you need the ACTUAL distance (to display it, or to scale something by it), you still need `Math.sqrt`. Using squared distances for everything else is a best practice in game performance.

---

### Math: Squared Distance Shortcut

**What it computes:** Whether one value is less than another, without computing a square root.

**The real-world analogy:** You want to know if box A is heavier than box B. Instead of weighing each box precisely (expensive), you put them on a balance scale. The balance tells you which is heavier without giving you exact weights.

**The trick:**
```
If d < r, then d² < r²   (because both sides are positive, squaring preserves the inequality)

So instead of:
  Math.sqrt(dx*dx + dy*dy) < r1 + r2  // needs sqrt

We compute:
  dx*dx + dy*dy < (r1+r2) * (r1+r2)   // no sqrt needed ✓
```

**In code:**
```js
const distSquared = dx*dx + dy*dy;
const radiiSum    = r1 + r2;
if (distSquared < radiiSum * radiiSum) { /* hit! */ }
```

**Why it matters here:** We check collisions every frame for every bullet–asteroid pair. Removing `Math.sqrt` from a hot path (code that runs many times per frame) is a meaningful optimisation.

**Watch for:** Only valid for comparisons. `distSquared` is not the same number as `distance` — don't use it where you need the real distance value.

---

**Add the collision check function — after `fireBullet`:**

```js
// ─── Collision Detection ──────────────────────────────────────────────────────
function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = bx - ax;
  const dy = by - ay;
  const distanceSquared = dx * dx + dy * dy;
  const radiiSum        = ar + br;
  return distanceSquared < radiiSum * radiiSum;
  // true = circles are overlapping (hit), false = no overlap
}

function checkBulletAsteroidCollisions() {
  // For each bullet, check against each asteroid.
  // Collect the indices of asteroids that were hit.
  const hitAsteroidIndices = new Set();
  // Set: a collection of UNIQUE values — prevents double-counting if two bullets hit one asteroid
  // 'Set' is defined here: a Set is like an array but automatically removes duplicates.

  const survivingBullets = [];
  // bullets that did NOT hit anything survive to the next frame

  for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
    const bullet   = bullets[bulletIndex];
    let bulletHit  = false; // tracks if this bullet has hit anything

    for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
      const asteroid = asteroids[asteroidIndex];

      if (circlesOverlap(
        bullet.x,   bullet.y,   BULLET_RADIUS,
        asteroid.x, asteroid.y, asteroid.radius
      )) {
        hitAsteroidIndices.add(asteroidIndex); // mark this asteroid as hit
        bulletHit = true;                      // this bullet is consumed
        break; // stop checking this bullet against other asteroids — it's already used
      }
    }

    if (!bulletHit) {
      survivingBullets.push(bullet); // only keep bullets that didn't hit
    }
  }

  // Replace arrays with survivors only
  bullets    = survivingBullets;
  asteroids  = asteroids.filter((asteroid, index) => !hitAsteroidIndices.has(index));
  // keep only asteroids whose index is NOT in the hit set
}
```

**Call the collision check in `update()` — add at the end, before position wrapping:**

```js
function update() {
  // [rotation, thrust, drag, speed cap, ship movement — unchanged]

  // [bullet movement and lifetime decrement — unchanged]

  // bullets = bullets.filter(...) — the off-screen filter, unchanged

  checkBulletAsteroidCollisions(); // ← ADD: after bullet movement, before next frame
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Fly the ship toward an asteroid and fire. When the bullet's yellow dot touches the grey circle, the circle disappears.

**In DevTools Console:**
```js
asteroids.length
```
Shoot one asteroid. **Expected:** Drops from 5 to 4.

```js
// Check for a hit manually:
circlesOverlap(0, 0, 5, 3, 4, 5)
// Distance between (0,0) and (3,4) = 5. Radii sum = 10. 5 < 10 = true.
```
**Expected:** `true` — they overlap.

```js
circlesOverlap(0, 0, 5, 100, 100, 5)
// Distance = √(100²+100²) ≈ 141. Radii sum = 10. 141 < 10 = false.
```
**Expected:** `false` — far apart, no collision.

---

## 🎯 Challenge: Respawn When All Asteroids Are Destroyed

**You know:** `spawnAsteroids()`, `asteroids.length`, and the `update` function.

**Task:** When the last asteroid is destroyed, automatically call `spawnAsteroids()` to create a new set. Add a brief screen flash (change the background colour for 30 frames) to signal the new wave.

**Starting code (in `update`, after collision check):**
```js
if (asteroids.length === 0) {
  // respawn and flash here
}
```

**Hints:**
1. You need a `flashFrames` counter in your game state — starts at 0, set to 30 when triggered, decremented each frame.
2. In `render()`, use `flashFrames > 0 ? '#222244' : BG_COLOR` as the background fill colour.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add to game state:
```js
let flashFrames = 0; // ← ADD: countdown for screen flash effect
```

In `update()`, after collision detection:
```js
if (asteroids.length === 0) {
  spawnAsteroids();       // ← ADD: new wave
  flashFrames = 30;       // ← ADD: trigger 30-frame flash
}
if (flashFrames > 0) {
  flashFrames -= 1;       // ← ADD: count down the flash
}
```

In `render()`, change the background clear:
```js
ctx.fillStyle = flashFrames > 0 ? '#222244' : BG_COLOR; // ← change this line
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

**Key insight:** `flashFrames` is a **timer variable** — a counter that decrements each frame. This pattern (set to N, decrement to 0) is how timed effects work in game loops. You'll use it for: invincibility periods, reload delays, animation triggers, and UI transitions. The game loop's consistent frame rate makes "N frames" a reliable time measurement.

</details>

---

## 🎯 Challenge: Ship-Asteroid Collision

**You know:** `circlesOverlap`, the ship's position, and asteroid positions.

**Task:** If the ship touches any asteroid, reset the ship to the centre of the screen with zero velocity (no lives system yet — just reset position). Treat the ship as a circle with radius `SHIP_SIZE` for the collision check.

**Starting code (add to `checkBulletAsteroidCollisions`, or make a new function):**
```js
function checkShipAsteroidCollisions() {
  for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
    // check ship vs asteroids[asteroidIndex]
  }
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function checkShipAsteroidCollisions() {
  for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
    const asteroid = asteroids[asteroidIndex];
    if (circlesOverlap(
      ship.x, ship.y, SHIP_SIZE,
      asteroid.x, asteroid.y, asteroid.radius
    )) {
      // Ship hit an asteroid — reset to centre
      ship.x     = canvas.width  / 2;
      ship.y     = canvas.height / 2;
      ship.vx    = 0;
      ship.vy    = 0;
      ship.angle = 0;
      flashFrames = 20; // brief flash on death
      break; // only process one collision per frame
    }
  }
}

// Call in update() after bullet-asteroid collisions:
checkShipAsteroidCollisions(); // ← ADD
```

**Key insight:** Using `SHIP_SIZE` as the ship's collision radius is an approximation — the ship is actually a triangle, not a circle. Circle approximations are ubiquitous in game collision detection because they're cheap and "good enough." More accurate polygon collision is much more complex and usually not worth the cost for fast-moving objects. This tradeoff — accuracy vs. performance — is a recurring engineering decision you'll encounter throughout game development.

</details>

---

## Mental Model: Entity-Component Pattern (Preview)

Each game entity — ship, bullet, asteroid — is an **object with data** (position, velocity, radius) and is processed by **functions** (update, draw, collide). The data and the functions that operate on it are kept separate:

```
Data (state):      bullets = [{ x, y, vx, vy, lifetime }, ...]
Functions:         updateBullets(), drawBullet(), checkCollisions()
```

This separation means:
- Drawing logic never accidentally modifies positions
- Collision logic never accidentally affects rendering
- You can add new entity types without rewriting existing ones

In LAB 07 you'll formalise this into the full **Entity-Component** design pattern. For now, notice that every entity in this lab follows the same shape: a data object + a draw function + update logic.

---

## Final Check

| Feature | How to verify |
|---|---|
| 5 asteroids appear on load | Refresh — 5 grey circles at random positions |
| Asteroids at random positions | Refresh twice — different positions each time |
| Spacebar fires a bullet | Press space — yellow dot fires from ship nose |
| Bullet travels in ship's facing direction | Rotate ship, fire — bullet goes where the nose points |
| Bullet disappears at screen edge | Fire toward an edge — bullet vanishes at the boundary |
| Bullet disappears after lifetime | Fire into empty space — bullet disappears after ~1.5s |
| Bullet-asteroid collision works | Shoot an asteroid — it disappears on contact |
| Asteroids.length decreases | Console: `asteroids.length` — decrements with each hit |
| Hold spacebar = one shot only | Hold spacebar — fires once, not continuously |

---

## Complete `main.js` Reference

```js
// LAB 04 — Bullets & Collision Detection

// ─── Constants ────────────────────────────────────────────────────────────────
const SHIP_SIZE       = 15;
const SHIP_COLOR      = '#ffffff';
const EXHAUST_COLOR   = '#ff6600';
const BG_COLOR        = '#000000';
const ROTATION_SPEED  = 0.05;
const THRUST_FORCE    = 0.15;
const DRAG            = 0.99;
const MAX_SHIP_SPEED  = 6;
const ASTEROID_COUNT  = 5;
const ASTEROID_MIN_R  = 20;
const ASTEROID_MAX_R  = 45;
const ASTEROID_COLOR  = '#aaaaaa';
const BULLET_SPEED    = 8;
const BULLET_RADIUS   = 3;
const BULLET_LIFETIME = 90;
const BULLET_COLOR    = '#ffff00';

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ─── Game State ───────────────────────────────────────────────────────────────
const ship = { x: 0, y: 0, angle: 0, vx: 0, vy: 0 };
let asteroids  = [];
let bullets    = [];
let canFire    = true;
let flashFrames = 0;

// ─── Input ────────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  event.preventDefault();
  if (event.key === ' ' && canFire) { fireBullet(); canFire = false; }
});
document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
  if (event.key === ' ') canFire = true;
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

// ─── Spawn Asteroids ──────────────────────────────────────────────────────────
function spawnAsteroids() {
  asteroids = [];
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    asteroids.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      radius: ASTEROID_MIN_R + Math.random() * (ASTEROID_MAX_R - ASTEROID_MIN_R),
    });
  }
}
spawnAsteroids();

// ─── Fire Bullet ──────────────────────────────────────────────────────────────
function fireBullet() {
  bullets.push({
    x:        ship.x,
    y:        ship.y,
    vx:       Math.cos(ship.angle) * BULLET_SPEED,
    vy:       Math.sin(ship.angle) * BULLET_SPEED,
    lifetime: BULLET_LIFETIME,
  });
}

// ─── Collision Detection ──────────────────────────────────────────────────────
function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = bx - ax;
  const dy = by - ay;
  return (dx * dx + dy * dy) < (ar + br) * (ar + br);
}

function checkBulletAsteroidCollisions() {
  const hitAsteroidIndices = new Set();
  const survivingBullets   = [];
  for (let bi = 0; bi < bullets.length; bi++) {
    let hit = false;
    for (let ai = 0; ai < asteroids.length; ai++) {
      if (circlesOverlap(bullets[bi].x, bullets[bi].y, BULLET_RADIUS,
                         asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
        hitAsteroidIndices.add(ai);
        hit = true;
        break;
      }
    }
    if (!hit) survivingBullets.push(bullets[bi]);
  }
  bullets   = survivingBullets;
  asteroids = asteroids.filter((a, i) => !hitAsteroidIndices.has(i));
}

function checkShipAsteroidCollisions() {
  for (let ai = 0; ai < asteroids.length; ai++) {
    if (circlesOverlap(ship.x, ship.y, SHIP_SIZE,
                       asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
      ship.x = canvas.width / 2; ship.y = canvas.height / 2;
      ship.vx = 0; ship.vy = 0; ship.angle = 0;
      flashFrames = 20;
      break;
    }
  }
}

// ─── Draw Functions ───────────────────────────────────────────────────────────
function drawShip(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(SHIP_SIZE, 0);
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
  const len = SHIP_SIZE * (0.5 + Math.random() * 0.5);
  ctx.beginPath();
  ctx.moveTo(-SHIP_SIZE, 0);
  ctx.lineTo(-SHIP_SIZE - len, 0);
  ctx.strokeStyle = EXHAUST_COLOR;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawAsteroid(asteroid) {
  ctx.beginPath();
  ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
  ctx.strokeStyle = ASTEROID_COLOR;
  ctx.lineWidth   = 2;
  ctx.stroke();
}

function drawBullet(bullet) {
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = BULLET_COLOR;
  ctx.fill();
}

// ─── Update ───────────────────────────────────────────────────────────────────
function update() {
  if (keys['ArrowLeft'])  ship.angle -= ROTATION_SPEED;
  if (keys['ArrowRight']) ship.angle += ROTATION_SPEED;
  const TWO_PI = Math.PI * 2;
  ship.angle = ((ship.angle % TWO_PI) + TWO_PI) % TWO_PI;

  if (keys['ArrowUp']) {
    ship.vx += Math.cos(ship.angle) * THRUST_FORCE;
    ship.vy += Math.sin(ship.angle) * THRUST_FORCE;
  }
  ship.vx *= DRAG;
  ship.vy *= DRAG;
  const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  if (speed > MAX_SHIP_SPEED) {
    ship.vx = (ship.vx / speed) * MAX_SHIP_SPEED;
    ship.vy = (ship.vy / speed) * MAX_SHIP_SPEED;
  }
  ship.x = (ship.x + ship.vx + canvas.width)  % canvas.width;
  ship.y = (ship.y + ship.vy + canvas.height) % canvas.height;

  for (let bi = 0; bi < bullets.length; bi++) {
    bullets[bi].x        += bullets[bi].vx;
    bullets[bi].y        += bullets[bi].vy;
    bullets[bi].lifetime -= 1;
  }
  bullets = bullets.filter(b =>
    b.lifetime > 0 && b.x > 0 && b.x < canvas.width && b.y > 0 && b.y < canvas.height
  );

  checkBulletAsteroidCollisions();
  checkShipAsteroidCollisions();

  if (asteroids.length === 0) { spawnAsteroids(); flashFrames = 30; }
  if (flashFrames > 0) flashFrames -= 1;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  ctx.fillStyle = flashFrames > 0 ? '#222244' : BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let ai = 0; ai < asteroids.length; ai++) drawAsteroid(asteroids[ai]);
  for (let bi = 0; bi < bullets.length;   bi++) drawBullet(bullets[bi]);
  drawExhaust(ship.x, ship.y, ship.angle);
  drawShip(ship.x, ship.y, ship.angle);
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop() { update(); render(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
```

---

## What's Next

In **LAB 05** asteroids will move and split into smaller pieces when shot. This requires tracking asteroid velocity, handling the split logic, and managing a growing/shrinking entity list — which introduces **data structure** thinking: how arrays perform under insertions and deletions, and when to use different structures.

---

## Quick Check Answers

**1. Is 30px from the asteroid's centre a hit? (bullet radius not given, asteroid radius = 25px)**

It depends on the bullet's radius. With `BULLET_RADIUS = 3`: radii sum = 3 + 25 = 28. Distance = 30 > 28 → no hit, just barely missed. With `BULLET_RADIUS = 6`: radii sum = 6 + 25 = 31 > 30 → hit. This is why `BULLET_RADIUS` matters for game feel — larger radii make the game more forgiving.

**2. What data does one bullet need?**

At minimum: `x`, `y` (position — where it is right now), `vx`, `vy` (velocity — how it moves per frame), and `lifetime` (so it can be removed). Everything needed to move it independently from the ship and remove it at the right time. The ship's current state is NOT stored in the bullet — bullets are independent once fired.

**3. Should bullets wrap or be removed at the edge?**

In Asteroids-style games, bullets are removed. Wrapping would mean a bullet could come back and hit an asteroid (or the ship) from behind, which is confusing. More importantly, if bullets wrap and never die, the array grows without bound — a memory leak. Removal at the edge (or by lifetime) keeps the array bounded. The `bullets.filter(...)` call in `update()` handles this every frame.

---

*End of LAB 04. Next: [[LAB-05-Data-Structures]]*
