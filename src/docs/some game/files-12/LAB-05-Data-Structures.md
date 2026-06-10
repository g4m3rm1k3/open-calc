# PhaserJS — LAB 05 — Data Structures

**Prerequisites:** LAB 04 (Bullets & Collision Detection). You have a working Asteroids-style game with a ship, asteroids, and bullets. You know: arrays, `push`, `filter`, entity loops, `Math.random()`, `circlesOverlap`.

**What this lab adds:**
- Asteroids move and drift slowly across the screen
- Shooting an asteroid splits it into two smaller pieces (like real Asteroids)
- A **spawn Queue** prevents asteroids from appearing on top of the ship
- Big-O complexity is measured and explained for the collision loop

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 04, each bullet was checked against each asteroid. If there are 10 bullets and 20 asteroids, how many collision checks happen per frame? What if both numbers doubled?
> 2. When an asteroid splits into two children, what data do each child need that the parent had? What data do they need that the parent did NOT have?
> 3. If we want asteroids to never spawn within 100px of the ship, what information does the spawn function need that it currently doesn't use?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
┌──────────────────────────────────────┐
│  ○←        ○                         │
│       ○↗         ○↘                  │
│            ▲                         │
│    ○↙     / \     ○→                 │
│                                      │
│  [player shoots large asteroid]      │
│       ○  →  ○ + ○  (splits!)        │
│        small  small                  │
│  [shoot both smalls → gone]          │
└──────────────────────────────────────┘
```

Asteroids drift in random directions. Shooting a large asteroid splits it into two medium ones moving in slightly different directions. Shooting a medium creates two small ones. Shooting small ones destroys them completely. A safe-spawn zone around the ship prevents instant death on respawn.

---

## Concept: Big-O Notation — Measuring Algorithm Cost

**What it is:** A notation describing how the number of operations an algorithm performs scales as input size grows. Written as O(n), O(n²), O(log n), etc. — where n is the input size.

**Why it exists:** Two algorithms can both be "correct" but one might handle 10 items in 1 millisecond and 10,000 items in 16 minutes, while the other handles both in under 1ms. Big-O predicts which will happen without running the code.

**The real-world analogy — sorting a deck of cards:** If you compare every card to every other card to sort the deck, you make n × n comparisons for n cards. A 52-card deck: 52 × 52 = 2,704 comparisons. A 1,000-card deck: 1,000,000 comparisons. Doubling n quadruples the work. This is O(n²) — "n squared."

**The four you need to know:**

| Notation | Name | Doubles-n effect | Example |
|---|---|---|---|
| O(1) | Constant | No change | Array index access: `arr[5]` |
| O(n) | Linear | Doubles the work | One loop over n items |
| O(n²) | Quadratic | Quadruples the work | Loop inside a loop (both size n) |
| O(log n) | Logarithmic | +1 operation | Binary search |

**Our collision loop — measured:**
```js
for (let bi = 0; bi < bullets.length; bi++) {    // b iterations
  for (let ai = 0; ai < asteroids.length; ai++) { // a iterations each
    circlesOverlap(...);
  }
}
// Total: b × a checks per frame
// If b=10, a=10 → 100 checks
// If b=20, a=20 → 400 checks — doubled both, quadrupled work
// This is O(b × a) — quadratic in the worst case when b ≈ a
```

At our small scale (≤20 bullets, ≤20 asteroids) this is 400 checks per frame — trivially fast. At 1,000 of each: 1,000,000 checks per frame — unplayable. We won't hit that limit in this series, but naming it now is why game engines use **spatial partitioning** (dividing space into a grid) to reduce collision checks to O(n) in practice.

**Why it matters here:** After asteroids split, the total asteroid count grows. Understanding that our loop is O(b × a) tells us when to worry — and right now, we don't need to.

**Watch for:** Big-O measures the *rate of growth*, not the absolute speed. O(1) is not always faster than O(n) for small n — it depends on the constants. Big-O becomes meaningful when n gets large.

---

## Concept: Queue — FIFO Data Structure

**What it is:** A data structure where items are added at one end (the **back**) and removed from the other end (the **front**). The first item added is the first item removed — **FIFO**: First In, First Out.

**What FIFO means:** Imagine a queue at a coffee shop. The first person in line is the first served — nobody jumps ahead. Items are processed in the exact order they arrived.

**The problem before:**
```js
// We want to delay asteroid spawning until it's safe (ship not nearby).
// Without a queue, we'd have to check immediately and retry:
function spawnAsteroid() {
  // check if position is safe...
  // if not, try another position...
  // if still not, try again...
  // this is a random retry loop — it can run forever if the ship covers a lot of space
}
```

**The solution:** Put spawn requests in a queue. Each frame, check the front of the queue. If it's safe to spawn, do it and remove from the front. If not, leave it and try again next frame.

**What it hides:**
A Queue hides the decision of which end to add to and which to remove from. The FIFO invariant — first in, first out — is enforced inside the Queue's interface; callers cannot violate it without bypassing the interface entirely. Callers never need to know the internal order of elements.

**Canonical example (General Explanation):**

A printer queue. You print three documents. They print in the order you sent them — first sent, first printed. The printer doesn't care when you sent them; it only processes one at a time, from the front.

```js
// Queue implemented with a plain array:
const printQueue = [];

// Enqueue (add to back):
printQueue.push('document1.pdf');
printQueue.push('document2.pdf');
printQueue.push('document3.pdf');
// queue: ['document1.pdf', 'document2.pdf', 'document3.pdf']

// Dequeue (remove from front):
const nextJob = printQueue.shift(); // 'document1.pdf'
// queue: ['document2.pdf', 'document3.pdf']
// FIFO: document1 was added first, removed first
```

**Project Application (The "Why" here):**
When asteroids split, we want to spawn child asteroids — but not if a child would appear on top of the ship. We'll enqueue spawn requests and process one per frame, checking safety before each spawn. This prevents "safe zone" bypasses when many asteroids split at once.

**Smallest possible example:**
```js
const spawnQueue = [];

// Add a request:
spawnQueue.push({ x: 200, y: 300, radius: 20 });

// Process the front of the queue each frame:
if (spawnQueue.length > 0) {
  const request = spawnQueue[0]; // peek at front — don't remove yet
  if (isSafeToSpawn(request.x, request.y)) {
    spawnQueue.shift(); // remove from front
    asteroids.push(request); // actually spawn
  }
  // if not safe: leave in queue, try again next frame
}
```

**Why it matters here:** Without a queue, splitting asteroids that are near the ship might spawn children directly on top of it — instant death. The queue defers spawning until the position is confirmed safe.

**Watch for:** `Array.shift()` removes and returns the FIRST element. `Array.pop()` removes and returns the LAST element. Using `pop` here would give you LIFO (Last In, First Out) — a Stack, not a Queue. For FIFO, always: `push` to add, `shift` to remove.

---

### Concept: `Array.shift()`

**What it is:** Removes and returns the FIRST element of an array, shifting all remaining elements one position left.

**The problem before:**
```js
// Without shift, removing the first element is awkward:
const queue = ['a', 'b', 'c'];
const first = queue[0];       // get first element
queue.splice(0, 1);           // remove it — complex syntax
// splice(startIndex, deleteCount) — unintuitive
```

**The solution:**
```js
const queue = ['a', 'b', 'c'];
const first = queue.shift();  // removes 'a' and returns it
// queue is now: ['b', 'c']
```

**What it hides:**
`shift` hides the splice operation and index arithmetic needed to remove the first element. The invariant: **after `shift()`, the array's first element is what was previously the second**, and the returned value is what was the first.

**Watch for:** `shift()` on an empty array returns `undefined`, not an error. Always check `array.length > 0` before calling `shift()`.

---

### Math: Probability — `Math.random()` as a Decision Tool

**What it computes:** A random decimal between 0 (inclusive) and 1 (exclusive). Used to make decisions that happen a certain percentage of the time.

**The real-world analogy:** Flipping a biased coin. A normal coin: 50% heads. `Math.random() < 0.5` is heads. A coin that lands heads 30% of the time: `Math.random() < 0.3`.

**Canonical example:**
```js
// 30% chance of an event occurring:
if (Math.random() < 0.3) {
  // This block runs approximately 30% of the time
}

// Random number in a range [min, max):
const randomAngle = Math.random() * Math.PI * 2; // any angle 0 to 2π

// Random integer from 0 to n-1:
const randomIndex = Math.floor(Math.random() * n);
```

**Why it matters here:** Asteroid children need random drift directions and slightly varied speeds. `Math.random()` provides the randomness that makes each game feel different.

**Watch for:** `Math.random()` is seeded by the browser's internal clock — there's no way to get the same sequence twice. For reproducible games (multiplayer, replays), a seeded random number generator is needed. We'll use unseeded randomness throughout this series.

---

## Step 1 — Copy LAB 04 Files

Create a new folder called `phaser-lab-05`. Copy `index.html`, `style.css`, and `main.js` from `phaser-lab-04`.

### SAVE AND TRY

Open `index.html`. Ship, rotating asteroids, bullets, collisions — all working as per LAB 04.

---

## Step 2 — Give Asteroids Velocity

Currently asteroids are static. We'll add drift velocity to each one.

**Update `spawnAsteroids` to give each asteroid a random velocity:**

```js
// ─── Constants — add these ────────────────────────────────────────────────────
const ASTEROID_MIN_SPEED = 0.3; // ← ADD: slowest drift speed
const ASTEROID_MAX_SPEED = 1.2; // ← ADD: fastest drift speed

function spawnAsteroids() {
  asteroids = [];
  for (let asteroidIndex = 0; asteroidIndex < ASTEROID_COUNT; asteroidIndex++) {
    const radius = ASTEROID_MIN_R + Math.random() * (ASTEROID_MAX_R - ASTEROID_MIN_R);
    const speed  = ASTEROID_MIN_SPEED + Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED);
    // speed: random value between min and max drift speeds
    const angle  = Math.random() * Math.PI * 2;
    // angle: random direction — full circle (0 to 2π radians)

    asteroids.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      radius: radius,
      vx:     Math.cos(angle) * speed, // ← ADD: x-component of drift velocity
      vy:     Math.sin(angle) * speed, // ← ADD: y-component of drift velocity
      // Math.cos/sin of a random angle gives a unit direction,
      // multiplied by speed to get the actual velocity
    });
  }
}
```

**Update `update()` to move asteroids and wrap them:**

```js
function update() {
  // [rotation, thrust, drag, speed cap, ship movement — unchanged]

  // ── Move Asteroids ────────────────────────────────────────────────────────
  for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
    asteroids[asteroidIndex].x += asteroids[asteroidIndex].vx; // ← ADD
    asteroids[asteroidIndex].y += asteroids[asteroidIndex].vy; // ← ADD
    asteroids[asteroidIndex].x = (asteroids[asteroidIndex].x + canvas.width)  % canvas.width;  // ← ADD
    asteroids[asteroidIndex].y = (asteroids[asteroidIndex].y + canvas.height) % canvas.height; // ← ADD
  }

  // [bullet movement, collision detection — unchanged, placed after asteroid movement]
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Asteroids slowly drifting in random directions. Each refresh shows them moving differently.

**In DevTools Console:**
```js
asteroids[0].vx.toFixed(3) + ', ' + asteroids[0].vy.toFixed(3)
```
**Expected:** A small decimal number pair — e.g. `"0.847, -0.531"`. Run again after refresh for different values.

**Change something:** Change `ASTEROID_MAX_SPEED = 1.2` to `ASTEROID_MAX_SPEED = 5`. Save. Asteroids zip around. Change it back.

---

## Step 3 — Asteroid Size Tiers

Before we can split asteroids, we need a "tier" system — large splits into mediums, medium splits into smalls, small just dies.

### Concept: Data-Driven Dispatch

**What it is:** Instead of writing `if (tier === 'large') { ... } else if (tier === 'medium') { ... }`, store the tier-specific data in a table (object) and look it up by key.

**Pattern category:** Behavioral (Non-GoF — sometimes called the "Table-Driven" or "Data-Driven" approach)

**Official name:** Data-Driven Dispatch (also: Table-Driven Design)

**The problem before:**
```js
// Tier logic hard-coded in if/else chains:
function splitAsteroid(asteroid) {
  if (asteroid.tier === 'large') {
    const childRadius = 22;
    const childCount  = 2;
    // ... spawn with childRadius and childCount
  } else if (asteroid.tier === 'medium') {
    const childRadius = 12;
    const childCount  = 2;
    // ... same spawn code, different values
  }
  // Adding a new tier = editing this function = risky
}
```

**The solution:** Put the per-tier values in a lookup table. The function becomes generic — it reads from the table instead of hard-coding values.
```js
const ASTEROID_TIERS = {
  large:  { radius: 40, childTier: 'medium', childCount: 2 },
  medium: { radius: 22, childTier: 'small',  childCount: 2 },
  small:  { radius: 12, childTier: null,      childCount: 0 },
};
// Adding a new tier = adding one row to the table = safe
```

**Tradeoff:** Data-driven code can be harder to read for simple cases (the table must be found and read). It shines when: there are 3+ tiers/variants, the variants share the same logic with different values, or new variants will be added later.

**You will see this again in:** LAB 07 (enemy AI types — each enemy type is a row in a behaviour table).

**What it hides:**
The lookup table hides the branching logic that would otherwise require a long if/else chain. The invariant: **all tier-specific values live in one place** — changing a radius for one tier cannot accidentally affect another tier's radius.

**Watch for:** If a key doesn't exist in the lookup table, the result is `undefined`. Always validate that a tier exists before using its values.

---

**Add the tier table to constants:**

```js
// ─── Asteroid Tier Data ───────────────────────────────────────────────────────
const ASTEROID_TIERS = {
  large:  { radius: 40, childTier: 'medium', childCount: 2, speed: 0.8 }, // ← ADD
  medium: { radius: 22, childTier: 'small',  childCount: 2, speed: 1.4 }, // ← ADD
  small:  { radius: 12, childTier: null,      childCount: 0, speed: 2.0 }, // ← ADD
  // childTier: null means "don't split — just destroy"
};
// Note: ASTEROID_MIN_R, ASTEROID_MAX_R are now replaced by this table.
// Remove or keep them — they'll no longer be used for initial spawning.
```

**Update `spawnAsteroids` to use the tier table:**

```js
function spawnAsteroids() {
  asteroids = [];
  for (let asteroidIndex = 0; asteroidIndex < ASTEROID_COUNT; asteroidIndex++) {
    const tierData = ASTEROID_TIERS['large'];       // ← was: random radius calculation
    // all initial asteroids are 'large' tier
    const angle    = Math.random() * Math.PI * 2;
    const speed    = ASTEROID_MIN_SPEED + Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED);

    asteroids.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      radius: tierData.radius,                      // ← was: calculated from ASTEROID_MIN_R
      tier:   'large',                              // ← ADD: which tier this asteroid is
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed,
    });
  }
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** All asteroids are now the same large size (radius 40). They still drift. No visual change from the previous step — this confirms the tier table is wired correctly.

**In DevTools Console:**
```js
asteroids[0].tier   // Expected: 'large'
asteroids[0].radius // Expected: 40
ASTEROID_TIERS['medium'].radius // Expected: 22
```

---

## Step 4 — Add the Spawn Queue

Now we'll build the safe-spawn queue so children never appear on top of the ship.

**Add queue state — after `bullets` and `canFire`:**

```js
let spawnQueue = []; // ← ADD: pending asteroid spawn requests — processed one per frame
// Each element is a full asteroid object waiting for a safe spawn moment
```

**Add the safe-distance check and queue processor:**

```js
// ─── Constants ────────────────────────────────────────────────────────────────
const SAFE_SPAWN_DISTANCE = 120; // ← ADD: minimum pixels between spawn point and ship

// ─── Safe Spawn Check ─────────────────────────────────────────────────────────
function isSafeToSpawn(x, y) {
  const dx = x - ship.x;
  const dy = y - ship.y;
  const distSquared = dx * dx + dy * dy;
  // squared distance (avoids Math.sqrt — same optimisation as collision detection)
  return distSquared > SAFE_SPAWN_DISTANCE * SAFE_SPAWN_DISTANCE;
  // true = far enough from ship to spawn safely
}

// ─── Process Spawn Queue ──────────────────────────────────────────────────────
function processSpawnQueue() {
  if (spawnQueue.length === 0) return;
  // nothing to spawn — exit early

  const candidate = spawnQueue[0];
  // peek at the front of the queue without removing it yet

  if (isSafeToSpawn(candidate.x, candidate.y)) {
    spawnQueue.shift(); // remove from front — FIFO, first added = first processed
    asteroids.push(candidate); // add to live game
  }
  // if not safe: leave in queue. Next frame: try again.
  // The candidate stays at the front until it's safe to spawn.
}
```

**Call `processSpawnQueue` in `update()` — add at the end:**

```js
function update() {
  // [all existing update code — unchanged]
  processSpawnQueue(); // ← ADD: try to pop one pending asteroid each frame
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** No visible change — the queue is empty (nothing is enqueued yet). We'll test it after adding splitting.

**In DevTools Console:**
```js
// Manually enqueue a small asteroid near the ship's current position:
spawnQueue.push({ x: ship.x + 200, y: ship.y, radius: 12, tier: 'small', vx: 0.5, vy: 0.3 });
spawnQueue.length // Expected: 1
```

Wait a moment, then:
```js
spawnQueue.length // Expected: 0 — it was processed and moved to asteroids
asteroids.length  // Expected: 6 — original 5 + the new one
```

Now test the safety block:
```js
// Enqueue one RIGHT on top of the ship:
spawnQueue.push({ x: ship.x, y: ship.y, radius: 12, tier: 'small', vx: 0, vy: 0 });
spawnQueue.length // Expected: 1
```

Wait 2 seconds:
```js
spawnQueue.length // Expected: still 1 — it's blocked because it's too close to the ship
```

Fly the ship away, wait:
```js
spawnQueue.length // Expected: 0 — it spawned once the ship moved far enough away
```

---

## Step 5 — Split Asteroids on Hit

Now we wire the splitting logic: when a bullet hits an asteroid, instead of just removing the asteroid, we enqueue its children.

**Add the split function — after `processSpawnQueue`:**

```js
// ─── Split Asteroid ───────────────────────────────────────────────────────────
function splitAsteroid(asteroid) {
  const tierData = ASTEROID_TIERS[asteroid.tier];
  // look up this asteroid's tier in the data table
  // tierData contains: childTier, childCount, radius, speed

  if (tierData.childTier === null) return;
  // null childTier = small tier = no children, just disappears

  for (let childIndex = 0; childIndex < tierData.childCount; childIndex++) {
    const childTierData = ASTEROID_TIERS[tierData.childTier];
    // look up the CHILD tier's data (one level smaller)

    const spreadAngle = (Math.random() - 0.5) * Math.PI;
    // spreadAngle: random angle between -π/2 and +π/2 (~±90°)
    // (Math.random() - 0.5) maps [0,1) to [-0.5, 0.5)
    // multiplied by Math.PI gives [-π/2, π/2)
    // This creates a "cone" of possible child directions

    const parentAngle = Math.atan2(asteroid.vy, asteroid.vx);
    // Math.atan2(y, x): converts a velocity vector back to an angle in radians
    // This is the INVERSE of Math.cos/sin — given vx/vy, get the angle
    // We need it to scatter children around the parent's travel direction

    const childAngle = parentAngle + spreadAngle;
    // child moves in roughly the same direction as the parent, with spread

    spawnQueue.push({
      x:      asteroid.x,              // start at parent's position
      y:      asteroid.y,
      radius: childTierData.radius,    // smaller radius (from tier table)
      tier:   tierData.childTier,      // child's tier name (e.g. 'medium')
      vx:     Math.cos(childAngle) * childTierData.speed, // child moves faster
      vy:     Math.sin(childAngle) * childTierData.speed,
    });
    // pushed to spawnQueue (not asteroids directly) — safe spawn check applies
  }
}
```

**Update `checkBulletAsteroidCollisions` to call `splitAsteroid` on hit:**

Find the line `hitAsteroidIndices.add(ai)` and add the split call below it:

```js
// Inside the collision loop — find this block:
if (circlesOverlap(...)) {
  hitAsteroidIndices.add(ai);
  bulletHit = true;
  break;
}
```

Change it to:

```js
if (circlesOverlap(
  bullets[bulletIndex].x, bullets[bulletIndex].y, BULLET_RADIUS,
  asteroid.x, asteroid.y, asteroid.radius
)) {
  hitAsteroidIndices.add(asteroidIndex);
  splitAsteroid(asteroid); // ← ADD: enqueue children before removing parent
  bulletHit = true;
  break;
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Shoot a large asteroid — it disappears and two medium ones appear near that position. Shoot a medium — two small ones appear. Shoot a small — it disappears (no children). All children move in directions spreading from the parent's path.

**In DevTools Console:**
```js
asteroids.length
```
Start at 5. Shoot one large → 6 mediums (4 remaining larges + 2 new mediums). Shoot a medium → 7 (3 larges + 1 medium + 2 new smalls). Continue until field is cleared — asteroids.length drops to 0 and `spawnAsteroids()` fires (from the LAB 04 respawn challenge).

**Change something:** Change `spreadAngle`'s multiplier from `Math.PI` to `0.2`. Children now spray in nearly the same direction (tight cone). Change it back.

---

## 🎯 Challenge: Score System

**You know:** Data-driven dispatch (tier table), entity loops, and state variables.

**Task:** Add a score. Destroying a large asteroid = 20 points. Medium = 50 points. Small = 100 points. Display the score in the top-left corner with `ctx.fillText`.

**Starting code:**
```js
let score = 0; // ← ADD to state variables

// In splitAsteroid(), before the spawnQueue.push:
// add points based on asteroid.tier
// Look up points in a new SCORE_TABLE object, similar to ASTEROID_TIERS

// In render(), after clearing the canvas:
// ctx.font = '20px monospace';
// ctx.fillStyle = '#ffffff';
// ctx.fillText('Score: ' + score, 20, 40);
```

**Hints:**
1. Add a `SCORE_TABLE = { large: 20, medium: 50, small: 100 }` constant.
2. `score += SCORE_TABLE[asteroid.tier]` in `splitAsteroid` before the `if (childTier === null) return` check — even small asteroids should score points.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// ─── Constants ────────────────────────────────────────────────────────────────
const SCORE_TABLE = { large: 20, medium: 50, small: 100 }; // ← ADD

// ─── State ────────────────────────────────────────────────────────────────────
let score = 0; // ← ADD

// ─── splitAsteroid — updated ──────────────────────────────────────────────────
function splitAsteroid(asteroid) {
  score += SCORE_TABLE[asteroid.tier]; // ← ADD: award points for this hit

  const tierData = ASTEROID_TIERS[asteroid.tier];
  if (tierData.childTier === null) return;

  for (let childIndex = 0; childIndex < tierData.childCount; childIndex++) {
    // [rest of split logic unchanged]
  }
}

// ─── render — add score display ───────────────────────────────────────────────
function render() {
  ctx.fillStyle = flashFrames > 0 ? '#222244' : BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // [draw asteroids, bullets, exhaust, ship — unchanged]

  ctx.font      = '20px monospace'; // ← ADD: monospace keeps score digits stable
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Score: ' + score, 20, 40); // ← ADD: top-left corner
  // fillText(text, x, y) — y is the text baseline, not the top
}
```

**Key insight:** `SCORE_TABLE[asteroid.tier]` is data-driven dispatch in action — the same pattern as `ASTEROID_TIERS`. By centralising point values in a table, you can rebalance the scoring (harder-to-hit smalls should be worth more) without touching any game logic. This is the core benefit of data-driven design: policy (the values) is separated from mechanism (the code that uses them).

</details>

---

## 🎯 Challenge: Lives System

**You know:** Timer variables (from LAB 04's `flashFrames`), state objects, and `ctx.fillText`.

**Task:** Give the player 3 lives. When the ship hits an asteroid, subtract one life and reset the ship. When lives reach 0, stop the game loop (the ship stays on screen but doesn't move) and display "GAME OVER" in the centre.

**Starting code:**
```js
let lives = 3; // ← ADD

// In checkShipAsteroidCollisions, after resetting ship position:
// subtract 1 life
// if lives === 0: stop the game

// In render, display lives:
// ctx.fillText('Lives: ' + lives, 20, 70);
```

**Hint:** To stop the game loop, use a `let gameRunning = true` flag. In `loop()`: `if (!gameRunning) { render(); return; }` — still call `render()` so the "GAME OVER" message is visible, but don't call `update()` or `requestAnimationFrame(loop)`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// ─── State ────────────────────────────────────────────────────────────────────
let lives       = 3;    // ← ADD
let gameRunning = true; // ← ADD: false = game over, loop stops

// ─── checkShipAsteroidCollisions — updated ────────────────────────────────────
function checkShipAsteroidCollisions() {
  for (let ai = 0; ai < asteroids.length; ai++) {
    if (circlesOverlap(ship.x, ship.y, SHIP_SIZE,
                       asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
      ship.x = canvas.width / 2; ship.y = canvas.height / 2;
      ship.vx = 0; ship.vy = 0; ship.angle = 0;
      flashFrames = 20;

      lives -= 1; // ← ADD
      if (lives <= 0) gameRunning = false; // ← ADD: trigger game over
      break;
    }
  }
}

// ─── loop — updated ──────────────────────────────────────────────────────────
function loop() {
  if (!gameRunning) { // ← ADD
    render(); // draw the final state with GAME OVER message
    return;   // stop loop — requestAnimationFrame not called, so loop ends
  }
  update();
  render();
  requestAnimationFrame(loop);
}

// ─── render — add game over and lives display ─────────────────────────────────
function render() {
  // [existing clear and draw code]

  ctx.font = '20px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Lives: ' + lives, 20, 70); // ← ADD

  if (!gameRunning) { // ← ADD: show game over overlay
    ctx.font      = '48px monospace';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font      = '24px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
    ctx.textAlign = 'left'; // reset to default — prevents affecting other text
  }
}
```

**Key insight:** Stopping the loop by not calling `requestAnimationFrame` is the correct pattern — it lets the browser reclaim the callback slot. The `gameRunning` flag is a preview of the **Finite State Machine** concept in LAB 06, where we formalise multiple game states (menu, playing, paused, game over) and the transitions between them.

</details>

---

## Concept: Data Structures — Array vs. Queue vs. Stack

Now that you've used both, here's how they compare. All three can be implemented with a JavaScript array — the difference is which operations you use.

| Structure | Add at | Remove from | Order | Use when |
|---|---|---|---|---|
| Array | Anywhere | Anywhere | Any order | Random access needed (`arr[i]`) |
| Queue | Back (`push`) | Front (`shift`) | FIFO | Processing in arrival order |
| Stack | Top (`push`) | Top (`pop`) | LIFO | Undo/redo, recursion, parsing |

**LIFO** — Last In, First Out — defined: a Stack removes the most recently added item first. Think of a stack of plates: you always take from the top (the last plate placed).

**In this lab:** We used a Queue for spawn requests because we want to process them in the order they were generated — not skip over earlier requests to spawn the "newest" one. A Stack would accidentally give children from the most recent split priority over earlier, still-pending spawns.

**Why it matters going forward:** In LAB 06 and LAB 07, you'll see stacks used for state history (undo), and queues used for event dispatching. Knowing which to reach for — based on the required ordering — is one of the most useful CS instincts.

---

## Final Check

| Feature | How to verify |
|---|---|
| Asteroids drift | Refresh — all asteroids moving in random directions |
| Drift is random | Refresh twice — different directions each time |
| Large asteroid splits | Shoot a large — two mediums appear near its position |
| Medium asteroid splits | Shoot a medium — two smalls appear |
| Small asteroid destroyed | Shoot a small — it disappears, no children |
| Children move in spread directions | Shoot a large near the centre — children diverge |
| Safe spawn works | Position ship where asteroid was shot — child delayed until you move |
| Asteroids wrap at edges | Drift an asteroid to the edge — reappears opposite side |
| All-clear respawn | Clear all asteroids — new wave spawns |
| Score display | Top-left shows "Score: N" — increments on hit |
| Lives display | Top-left shows "Lives: 3" — decrements on ship hit |
| Game over stops loop | Lose all lives — "GAME OVER" appears, ship stops |

---

## What's Next

In **LAB 06** we formalise what you've been building toward: a **Finite State Machine** that governs the game's modes — Title Screen → Playing → Game Over → Title Screen. Right now the game starts in "playing" state immediately. In LAB 06 you'll add a proper title screen, pause state, and clean transitions between them — using a switch statement and a state object.

---

## Quick Check Answers

**1. How many collision checks happen per frame with 10 bullets and 20 asteroids? What if both doubled?**

10 × 20 = 200 checks per frame. If both doubled (20 bullets, 40 asteroids): 20 × 40 = 800 checks — four times as many from doubling both inputs. This confirms O(b × a) — quadratic growth. In practice, because we `break` as soon as a bullet hits, the average case is better than worst case. But Big-O describes worst case, which is still 200 or 800 respectively.

**2. What data do each child need that the parent had? What data is new?**

Children inherit `x` and `y` from the parent (they start at the parent's position). They need new values for `vx` and `vy` (different direction, higher speed — from the tier table), `radius` (smaller — from tier table), and `tier` (one level smaller). The parent's velocity is used only to compute the spread angle via `Math.atan2(asteroid.vy, asteroid.vx)` — not directly inherited.

**3. What does the safe-spawn function need that it currently doesn't use?**

It needs the ship's position (`ship.x`, `ship.y`), which is a global in our code but wasn't passed to the old `spawnAsteroids` function at all. The `isSafeToSpawn(x, y)` function accesses `ship.x` and `ship.y` directly from global scope. A more modular design would pass these as parameters — which becomes important when unit testing spawn logic without a real ship object.

---

*End of LAB 05. Next: [[LAB-06-Finite-State-Machine]]*
