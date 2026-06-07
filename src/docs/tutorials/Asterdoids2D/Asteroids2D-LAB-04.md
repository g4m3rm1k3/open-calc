# 2D Asteroids — LAB 04 — Asteroids and Random Motion

**Read Asteroids2D-LAB-03.md first.** That lab added bullets. This lab adds
the asteroids themselves — polygons that float across the screen in random
directions, spinning as they go.

**What this lab adds:**
- Asteroid objects with random size, position, velocity, and rotation
- Asteroids drawn as irregular polygons (not perfect circles)
- Asteroids spin as they float
- A second entity list alongside bullets

**What you will learn:**
- `Math.random()` — generating random numbers and using them for variety
- Drawing polygons with `ctx.moveTo` and `ctx.lineTo` in a loop
- The `Array.from()` pattern for creating arrays of objects
- Why `const` doesn't mean the array contents can't change

**Time:** 45–60 minutes.

---

## What You Will Build

Open the browser. In addition to the flying ship and bullets:
- 5 large asteroids appear at random positions near the edges
- Each moves in a random direction at a random speed
- Each spins at a random rate (some clockwise, some counter-clockwise)
- Each is drawn as an irregular polygon (rougher than a circle)
- Bullets do not yet destroy them — that comes in LAB-05

---

## Concept: `Math.random()` — Generating Random Numbers

**What it is:** A function that returns a random decimal number between 0
(inclusive) and 1 (exclusive) each time it is called.

```js
Math.random()   // returns something like 0.3417... or 0.9821... or 0.0002...
                // range: [0, 1)  — includes 0, never quite reaches 1
```

**Useful patterns built from `Math.random()`:**

```js
// Random integer from 0 to N-1 (inclusive):
Math.floor(Math.random() * N)

// Random integer from min to max (inclusive):
Math.floor(Math.random() * (max - min + 1)) + min

// Random decimal between min and max:
Math.random() * (max - min) + min

// Random boolean (true half the time):
Math.random() < 0.5

// Random sign (either 1 or -1):
Math.random() < 0.5 ? 1 : -1

// Random angle in radians (full circle):
Math.random() * Math.PI * 2
```

**For asteroids:**

```js
// Random speed between 0.5 and 2.0 pixels per frame:
const speed = Math.random() * 1.5 + 0.5;

// Random direction (any angle on the unit circle):
const angle = Math.random() * Math.PI * 2;

// Convert to velocity components:
const velocityX = Math.cos(angle) * speed;
const velocityY = Math.sin(angle) * speed;
```

**Watch for:** `Math.random()` never returns exactly 1. `Math.floor(Math.random() * 6)`
returns 0, 1, 2, 3, 4, or 5 — never 6. To get 1–6 (dice), add 1:
`Math.floor(Math.random() * 6) + 1`.

---

## Concept: Drawing a Polygon from an Array of Points

**What it is:** Using a loop with `ctx.lineTo` to draw a multi-sided shape
from an array of `[x, y]` coordinate pairs.

**The two-step model:**

```js
// Given an array of [x, y] pairs (relative to the shape's center):
const points = [
  [0, -20],    // top
  [15, -10],   // upper right
  [20, 10],    // lower right
  [10, 25],    // bottom right
  [-10, 25],   // bottom left
  [-20, 10],   // lower left
  [-15, -10],  // upper left
];

// Draw:
ctx.beginPath();
ctx.moveTo(points[0][0], points[0][1]);   // move to the first point (no line drawn)
for (let i = 1; i < points.length; i++) {
  ctx.lineTo(points[i][0], points[i][1]);  // draw a line to each subsequent point
}
ctx.closePath();   // draw a line back to the first point
ctx.stroke();      // paint the outline
```

**Making asteroids look rocky — random vertex displacement:**

Instead of a regular polygon (equal distances from center), we vary the radius
at each vertex:

```js
// A 10-sided asteroid with varying radius:
const numVertices = 10;
const baseRadius  = 40;    // average distance from center to edge

const points = [];
for (let i = 0; i < numVertices; i++) {
  const angle = (i / numVertices) * Math.PI * 2;  // evenly spaced angles
  const radius = baseRadius * (0.7 + Math.random() * 0.6);  // 70%–130% of base

  points.push([
    Math.cos(angle) * radius,   // x component
    Math.sin(angle) * radius,   // y component
  ]);
}
// Each vertex is at a slightly different radius — making the polygon irregular.
```

**Watch for:** The points array is built once when the asteroid is created and
stored on the asteroid object. The `rotationAngle` changes every frame but the
POINTS do not — we use `ctx.rotate()` to spin the drawing, not by recomputing
points.

---

## Concept: `Array.from()` — Creating Arrays with Initialization Logic

**What it is:** A method that creates a new array from a length, applying a
function to generate each element.

**The problem without it:**
```js
// Creating 5 asteroids with a for loop:
const asteroids = [];
for (let i = 0; i < 5; i++) {
  asteroids.push(createAsteroid());
}
```

**With `Array.from()`:**
```js
// Same result, one line:
const asteroids = Array.from({ length: 5 }, createAsteroid);
```

`Array.from({ length: N }, fn)` creates an array of N elements by calling `fn`
once per element. This is equivalent to the for-loop above.

You saw this in Yahtzee: `Array.from({ length: DIE_COUNT }, createDie)`.
Same pattern, different objects.

**When to use which:**
- `Array.from()` — when creating a batch of objects at once (initial spawn)
- `array.push()` — when adding objects one at a time (firing a bullet)

---

## Concept: `const` Arrays Are Still Mutable

**A common confusion:**

```js
const bullets = [];   // const means you cannot REASSIGN bullets to something else
bullets = [];         // ERROR: Assignment to constant variable
bullets = [1, 2, 3]; // ERROR: Assignment to constant variable

// But the CONTENTS of the array can change freely:
bullets.push({ x: 100 });   // FINE — modifying the array contents
bullets.splice(0, 1);        // FINE — removing an element
bullets[0].x = 200;          // FINE — modifying a property of an element
```

`const` means "this variable always points to this array." It does not mean
the array cannot change. The array itself is mutable — elements can be added,
removed, and modified.

This is the same for `const objects`:
```js
const ship = { x: 100 };
ship = { x: 200 };     // ERROR: cannot reassign ship
ship.x = 200;          // FINE: can change properties of the object
```

**Watch for:** Use `const` for every array and object in this series — the
binding (variable → value) never changes, only the contents change.

---

## Step 1 — Asteroid Size Configuration

Add at the top of `main.js`, with the other constants:

```js
// ── Asteroid constants ─────────────────────────────────────────────────────────

// ASTEROID_SIZES defines properties for each size category.
// Using an object keyed by size name makes the code self-documenting:
// ASTEROID_SIZES.large.radius vs ASTEROID_SIZES[0].radius.
const ASTEROID_SIZES = {
  large:  { radius: 45, speed: 1.2, numVertices: 12 },
  medium: { radius: 25, speed: 1.8, numVertices: 9  },
  small:  { radius: 12, speed: 2.5, numVertices: 7  },
};

const INITIAL_ASTEROID_COUNT = 5;   // number of large asteroids at game start
```

---

## Step 2 — The `createAsteroid` Function

Add before `update()`:

```js
// createAsteroid: builds one asteroid object at the given position and size.
// Called at game start and when a large/medium asteroid is destroyed (LAB-06).
//
// position: { x, y } — where to place the asteroid (default: random near edges)
// size: 'large' | 'medium' | 'small' (default: 'large')
function createAsteroid(position = null, size = 'large') {
  const config = ASTEROID_SIZES[size];

  // If no position given, place at a random edge location.
  // We avoid placing near the center (where the ship is) by choosing edge positions.
  let x, y;
  if (position) {
    x = position.x;
    y = position.y;
  } else {
    // Choose a random edge: top, bottom, left, or right.
    // Place the asteroid just outside the canvas edge.
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { x = Math.random() * canvas.width;  y = -config.radius; }           // top
    if (edge === 1) { x = Math.random() * canvas.width;  y = canvas.height + config.radius; } // bottom
    if (edge === 2) { x = -config.radius;                y = Math.random() * canvas.height; } // left
    if (edge === 3) { x = canvas.width + config.radius;  y = Math.random() * canvas.height; } // right
  }

  // Random direction: any angle on the full circle.
  const angle = Math.random() * Math.PI * 2;

  // Random speed within the size's range.
  // The speed varies ±30% around the config speed.
  const speed = config.speed * (0.7 + Math.random() * 0.6);

  // Random spin speed: ±0.02 to ±0.05 radians per frame.
  // Some clockwise (positive), some counter-clockwise (negative).
  const spinSpeed = (0.02 + Math.random() * 0.03) * (Math.random() < 0.5 ? 1 : -1);

  // Generate the polygon points in local space (centered at origin).
  // These points are stored on the asteroid — they are computed ONCE at creation.
  // Each frame we rotate the DRAWING CONTEXT, not the points themselves.
  const points = [];
  for (let i = 0; i < config.numVertices; i++) {
    // Evenly divide the circle among all vertices.
    const vertexAngle = (i / config.numVertices) * Math.PI * 2;

    // Randomize each vertex's distance from center: 70%–130% of the base radius.
    const radius = config.radius * (0.7 + Math.random() * 0.6);

    points.push([
      Math.cos(vertexAngle) * radius,   // x component
      Math.sin(vertexAngle) * radius,   // y component
    ]);
  }

  return {
    x,
    y,
    velocityX:     Math.cos(angle) * speed,
    velocityY:     Math.sin(angle) * speed,
    rotationAngle: Math.random() * Math.PI * 2,   // initial visual rotation
    spinSpeed,
    size,
    radius: config.radius,   // used for collision detection in LAB-05
    points,                  // polygon vertices in local space
  };
}
```

---

## Step 3 — The `asteroids` Entity List

After the `bullets` and `fireCooldown` declarations, add:

```js
// ── Asteroid state ────────────────────────────────────────────────────────────

// asteroids: entity list — all currently active asteroid objects.
// Array.from creates INITIAL_ASTEROID_COUNT asteroids by calling createAsteroid once each.
// createAsteroid is passed as the function (no parentheses — passing the function itself).
const asteroids = Array.from({ length: INITIAL_ASTEROID_COUNT }, () => createAsteroid());
```

---

## Step 4 — Update and Draw Asteroids

In `update()`, add after the bullet update code:

```js
  // ── Update asteroids ──────────────────────────────────────────────────────
  for (const asteroid of asteroids) {
    // Move:
    asteroid.x += asteroid.velocityX;
    asteroid.y += asteroid.velocityY;

    // Wrap at edges (same formula as ship and bullets):
    asteroid.x = (asteroid.x + canvas.width)  % canvas.width;
    asteroid.y = (asteroid.y + canvas.height) % canvas.height;

    // Spin: advance the rotation angle each frame.
    asteroid.rotationAngle += asteroid.spinSpeed;
  }
```

Add a `drawAsteroid` function:

```js
function drawAsteroid(asteroid) {
  ctx.save();

  // Move origin to asteroid center, then rotate.
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.rotationAngle);

  // Draw the polygon from the stored local-space points.
  ctx.beginPath();
  ctx.moveTo(asteroid.points[0][0], asteroid.points[0][1]);  // first point
  for (let i = 1; i < asteroid.points.length; i++) {
    ctx.lineTo(asteroid.points[i][0], asteroid.points[i][1]);
  }
  ctx.closePath();

  ctx.strokeStyle = '#aaaaaa';   // medium grey — asteroids are rocks
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}
```

Add a `drawAsteroids` function:

```js
function drawAsteroids() {
  for (const asteroid of asteroids) {
    drawAsteroid(asteroid);
  }
}
```

Update `render()`:

```js
function render() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawShip();
  drawBullets();
  drawAsteroids();   // ← add this line
}
```

---

### SAVE AND TRY

Save. Reload.

**You should see:**
- 5 irregular grey polygons moving in random directions
- Each spinning as it moves
- The ship and bullets work as before
- Asteroids wrap at edges (same as everything else)

**In DevTools Console:**
```js
asteroids.length
```
**Expected:** 5.

```js
asteroids[0]
```
**Expected:** An object with `x`, `y`, `velocityX`, `velocityY`, `rotationAngle`,
`spinSpeed`, `size`, `radius`, `points` properties.

```js
asteroids[0].points.length
```
**Expected:** 12 (the large asteroid vertex count from ASTEROID_SIZES.large.numVertices).

**Change something:** Change `INITIAL_ASTEROID_COUNT = 5` to `15`. Save. Reload.
15 asteroids appear — the array creation and the update/draw loops all scale
automatically. Change it back to `5`.

---

## 🎯 Challenge: Spawn Asteroids Away from the Ship

**Current problem:** Asteroids can spawn near the center of the screen — right
on top of the ship. The player gets immediately hit before they can react.

**Your task:** Modify the spawning logic so asteroids only spawn more than 150
pixels away from the canvas center (where the ship starts).

**Concept — checking distance:**

The distance between two points `(x1, y1)` and `(x2, y2)`:
```js
const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
```

**Hints:**
1. The ship starts at `(canvas.width / 2, canvas.height / 2)`.
2. In `createAsteroid`, after computing `x` and `y`, check if the distance
   from the center is more than 150. If not, try again.
3. Use a loop: keep generating random positions until you get a valid one.
4. Add a `while` loop (or a `do...while` loop) that re-rolls x and y until
   the distance condition is met.

---

<details>
<summary>▶ Solution — Minimum Spawn Distance</summary>

Replace the edge spawning block in `createAsteroid` with:

```js
  const MIN_SPAWN_DISTANCE = 150;   // minimum pixels from center to spawn asteroid
  const centerX = canvas.width  / 2;
  const centerY = canvas.height / 2;

  // Keep generating positions until we find one far enough from center.
  // 'do...while' runs the body first, then checks the condition.
  // This guarantees at least one attempt.
  let x, y;
  if (position) {
    x = position.x;
    y = position.y;
  } else {
    do {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * canvas.width;  y = -config.radius; }
      if (edge === 1) { x = Math.random() * canvas.width;  y = canvas.height + config.radius; }
      if (edge === 2) { x = -config.radius;                y = Math.random() * canvas.height; }
      if (edge === 3) { x = canvas.width + config.radius;  y = Math.random() * canvas.height; }

      const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    } while (distToCenter < MIN_SPAWN_DISTANCE);
    // If the generated position is too close, the loop runs again.
    // Edge positions are usually far from center, so this rarely loops more than once.
  }
```

**Key insight:** The `do...while` loop is perfect when you need to generate
something random and retry if it fails a condition. The `do` block always runs
at least once, making the logic cleaner than a pre-check approach. This is the
standard game dev technique for "find a valid random position."

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| 5 asteroids appear on reload | Grey polygons visible at start |
| Each asteroid has unique shape | No two look identical (random vertices) |
| Asteroids move in random directions | Different direction each reload |
| Asteroids spin as they move | Visible rotation while floating |
| Asteroids wrap at all edges | Watch one exit an edge — reappears opposite |
| Bullets and ship still work | LAB-03 features unaffected |
| Asteroids not on top of ship at start | No immediate collision at game start |
| Console: `asteroids[0].points` | Array of [x,y] pairs — 12 entries for large |

---

## What Is Next — LAB 05

LAB 05 makes bullets destroy asteroids: distance-based collision detection
between every bullet and every asteroid. When a bullet hits an asteroid,
both disappear. This introduces the O(n²) collision check and the Pythagorean
distance formula — the same math used for circle collision in every game.

*Continue to 2D Asteroids — LAB 05 — Collision Detection.*
