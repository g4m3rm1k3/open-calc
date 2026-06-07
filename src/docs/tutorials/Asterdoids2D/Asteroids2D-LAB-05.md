# 2D Asteroids — LAB 05 — Collision Detection

**Read Asteroids2D-LAB-04.md first.** That lab added asteroids. This lab makes
bullets destroy them — checking every bullet against every asteroid and removing
both when they collide.

**What this lab adds:**
- Bullet–asteroid collision detection using circle distance
- Asteroids are removed when hit
- Bullets are removed when they hit an asteroid
- Ship–asteroid collision detection (game over preparation)

**What you will learn:**
- The Pythagorean distance formula for 2D
- Circle–circle collision: the distance check
- The double-loop pattern for checking every pair (O(n²))
- Why we collect indices to remove rather than splicing during the loop

**Time:** 45–60 minutes.

---

## What You Will Build

Open the browser. Fire bullets at the grey asteroids. When a bullet touches
an asteroid, both disappear. No splitting yet — they just vanish. No score.
No game over. Just the satisfaction of making things blow up.

---

## Concept: Circle–Circle Collision Detection

**What it is:** Checking whether two circles overlap by comparing the distance
between their centers to the sum of their radii.

**The geometry:**

```
  Circle A         Circle B
     ○                ○
  radius A          radius B
     |<-- distance -->|

Not colliding: distance > radius A + radius B
Just touching: distance = radius A + radius B
Overlapping:   distance < radius A + radius B  ← COLLISION
```

**The distance formula (Pythagoras in 2D):**

```
distance = sqrt((x2 - x1)² + (y2 - y1)²)
```

For a bullet at `(bx, by)` and an asteroid at `(ax, ay)`:
```js
const dx = asteroid.x - bullet.x;   // horizontal separation
const dy = asteroid.y - bullet.y;   // vertical separation
const distance = Math.sqrt(dx * dx + dy * dy);
```

**The collision test:**
```js
const BULLET_COLLISION_RADIUS = 3;   // treat bullet as a small circle

if (distance < BULLET_COLLISION_RADIUS + asteroid.radius) {
  // COLLISION: bullet and asteroid are overlapping
}
```

**The optimization — avoid `Math.sqrt`:**

`Math.sqrt` is slightly slow. For a simple "less than" comparison, you can
compare the squares instead:

```js
// Instead of:
Math.sqrt(dx*dx + dy*dy) < radiusSum

// Use:
dx*dx + dy*dy < radiusSum * radiusSum
// Both sides squared — no sqrt needed.
// Valid because both sides are positive (squaring preserves the inequality direction).
```

This is called the **squared distance check**. Same result, no square root.
For large numbers of collisions (thousands of particles), this is noticeably faster.

**Watch for:** The squared distance shortcut only works for `<` and `>` comparisons,
not for actually computing the distance value. If you need to know HOW FAR apart
two objects are (for physics or sound volume), you still need `Math.sqrt`.

---

## Concept: Checking Every Pair — The Double Loop

**What it is:** To check every bullet against every asteroid, loop over all
bullets, and inside that loop, loop over all asteroids:

```js
for (const bullet of bullets) {
  for (const asteroid of asteroids) {
    // check this bullet against this asteroid
  }
}
```

**How many checks:**
- 5 bullets × 5 asteroids = 25 checks per frame
- 10 bullets × 15 asteroids = 150 checks per frame
- This is O(n²) — "O of n squared" — performance doubles when n doubles

At the scale of Asteroids (< 50 bullets, < 30 asteroids), O(n²) is fine.
For thousands of objects (city traffic simulation, particles), you would need
spatial partitioning (divide the world into a grid, only check nearby objects).
That is an advanced topic — O(n²) is the right approach to learn first.

---

## Concept: Collect-Then-Remove — Avoiding Splice Inside a Loop

**The problem:** We cannot splice (remove) elements from the `bullets` or
`asteroids` arrays while the double loop is running. Splicing changes indices
mid-iteration, causing skipped checks or double-removes.

**The solution — collect indices, then remove after the loop:**

```js
// Pass 1: find all collisions, record which items need removal.
const bulletsToRemove   = new Set();   // Set: like an array but no duplicates
const asteroidsToRemove = new Set();

for (let bi = 0; bi < bullets.length; bi++) {
  for (let ai = 0; ai < asteroids.length; ai++) {
    if (/* collision */) {
      bulletsToRemove.add(bi);    // record the index
      asteroidsToRemove.add(ai);  // record the index
    }
  }
}

// Pass 2: remove the marked items.
// Sort indices from highest to lowest BEFORE splicing.
// Splicing a lower index shifts all higher indices — removing from high to low
// avoids the index-shifting problem.
const bulletIndices   = [...bulletsToRemove].sort((a, b) => b - a);
const asteroidIndices = [...asteroidsToRemove].sort((a, b) => b - a);

for (const i of bulletIndices)   bullets.splice(i, 1);
for (const i of asteroidIndices) asteroids.splice(i, 1);
```

**`new Set()`:** A collection that holds unique values only. Adding the same
index twice keeps only one copy — a bullet can hit two asteroids simultaneously
but should only be removed once.

**Why sort descending:** If `bulletIndices = [1, 3]` and we remove index 1 first:
- After removing index 1: array shrinks, old index 3 is now index 2
- When we try to remove index 3: it doesn't exist (or is the wrong element)

Removing from the highest index first: old index 3 is removed first, array
shrinks above index 1, then we remove index 1 — always correct.

---

## Step 1 — Add the `checkCollisions` Function

Add this function before `update()`:

```js
// checkCollisions: tests every bullet against every asteroid.
// Removes bullets and asteroids that collide.
// Uses collect-then-remove to avoid index corruption during iteration.
function checkCollisions() {
  const BULLET_COLLISION_RADIUS = 4;   // treat each bullet as a circle of this radius

  // Sets collect the INDICES of items to remove (no duplicates automatically).
  const bulletsToRemove   = new Set();
  const asteroidsToRemove = new Set();

  // Double loop: every bullet vs every asteroid.
  for (let bi = 0; bi < bullets.length; bi++) {
    for (let ai = 0; ai < asteroids.length; ai++) {
      const bullet   = bullets[bi];
      const asteroid = asteroids[ai];

      // Squared distance check (no Math.sqrt — faster):
      const dx = asteroid.x - bullet.x;
      const dy = asteroid.y - bullet.y;
      const distanceSquared = dx * dx + dy * dy;

      // Collision if distance < (bullet radius + asteroid radius).
      // Squaring both sides: distanceSquared < (sum of radii)²
      const radiusSum = BULLET_COLLISION_RADIUS + asteroid.radius;

      if (distanceSquared < radiusSum * radiusSum) {
        // Collision! Mark both for removal.
        bulletsToRemove.add(bi);
        asteroidsToRemove.add(ai);
        // Don't splice here — we're in the middle of the loop.
        // Continue checking: this asteroid might be hit by ANOTHER bullet too.
      }
    }
  }

  // Remove marked items, highest index first (to avoid index corruption).
  // [...set] converts the Set to an array so we can call .sort().
  [...bulletsToRemove].sort((a, b) => b - a).forEach(i => bullets.splice(i, 1));
  [...asteroidsToRemove].sort((a, b) => b - a).forEach(i => asteroids.splice(i, 1));
}
```

---

## Step 2 — Call `checkCollisions` in the Game Loop

In `update()`, add after the bullet update and asteroid update sections:

```js
  // ── Collision detection ───────────────────────────────────────────────────
  checkCollisions();
```

---

### SAVE AND TRY

Save. Reload.

**Test:** Fly toward an asteroid. Fire. When a bullet reaches an asteroid, both
should disappear simultaneously.

**Test multiple hits:** Fire several bullets at a cluster of asteroids. Each
hit removes one bullet and one asteroid.

**In DevTools Console, while shooting:**
```js
asteroids.length
```
**Expected:** Decreases as you hit asteroids. When it reaches 0, no asteroids remain.

**Change something:** Change `BULLET_COLLISION_RADIUS = 4` to `BULLET_COLLISION_RADIUS = 30`.
Save. Reload. Bullets destroy asteroids from very far away — huge hit radius.
Change it back to `4`.

---

## 🎯 Challenge: Implement Ship–Asteroid Collision

**Current state:** The ship can fly through asteroids — no consequence.

**Your task:** Add collision detection between the SHIP and each asteroid.
When the ship touches an asteroid, log `"SHIP HIT!"` to the console for now
(game over logic comes in LAB-07).

**Concept:**

The ship's collision radius should be approximately 12 pixels (about the size
of the triangle). The check is the same circle-circle distance formula, but
comparing ship position to each asteroid position.

**Starter code:**

```js
// In checkCollisions(), after the bullet-asteroid loop:

const SHIP_COLLISION_RADIUS = 12;

for (let ai = 0; ai < asteroids.length; ai++) {
  // Compute distance between ship and this asteroid.
  // Use squared distance for efficiency.
  // If collision: console.log('SHIP HIT!');

  // Write this code:
}
```

**Hints:**
1. Use the same `dx`, `dy`, `distanceSquared`, `radiusSum` pattern.
2. The ship's position is `ship.x` and `ship.y`.
3. The asteroid's collision radius is stored in `asteroid.radius`.

---

<details>
<summary>▶ Solution — Ship–Asteroid Collision</summary>

In `checkCollisions()`, after the bullet-asteroid removal block:

```js
  // ── Ship–asteroid collision ────────────────────────────────────────────────
  const SHIP_COLLISION_RADIUS = 12;

  for (const asteroid of asteroids) {
    const dx = asteroid.x - ship.x;
    const dy = asteroid.y - ship.y;
    const distanceSquared = dx * dx + dy * dy;

    const radiusSum = SHIP_COLLISION_RADIUS + asteroid.radius;

    if (distanceSquared < radiusSum * radiusSum) {
      console.log('SHIP HIT!');
      // Game over logic will go here in LAB-07.
      break;   // only need to report one collision per frame
    }
  }
```

**Key insight:** This is the exact same formula as bullet-asteroid collision.
The only change is which two objects are being compared. The distance formula
is universal — it works for ship-asteroid, bullet-asteroid, asteroid-asteroid,
or any circle-circle pair.

</details>

---

## 🎯 Challenge: Count How Many Asteroids You've Destroyed

**Your task:** Track the number of asteroids destroyed and display it in the
browser's title bar.

**Concept — updating the title bar:**
```js
document.title = `Asteroids — Destroyed: ${count}`;
// document.title is the page title shown in the browser tab.
// It updates instantly when you assign to it.
// This is a quick way to show a number without building a HUD yet.
```

**Hints:**
1. Add a `let asteroidsDestroyed = 0` variable in the state section.
2. Inside `checkCollisions()`, increment it for each asteroid removed.
3. After removing asteroids, update `document.title`.

---

<details>
<summary>▶ Solution — Destroyed Count</summary>

In the state section:
```js
let asteroidsDestroyed = 0;
```

In `checkCollisions()`, after the removal loop:
```js
  // Track how many asteroids were destroyed this frame.
  // asteroidsToRemove.size = how many asteroids were removed.
  asteroidsDestroyed += asteroidsToRemove.size;

  // Update the browser tab title with the running total.
  document.title = `Asteroids — Destroyed: ${asteroidsDestroyed}`;
```

**Key insight:** `Set.size` is like `Array.length` — the number of items in the
set. Using it here counts the asteroids removed THIS FRAME, which we add to the
running total. `document.title` gives instant feedback without needing to build
a proper HUD yet — useful for testing any numeric state while developing.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Bullet destroys asteroid on contact | Fire at asteroid — both disappear |
| Bullet is consumed (only one hit) | One bullet removes one asteroid, not several |
| Ship-asteroid collision logs warning | Fly into asteroid — console shows "SHIP HIT!" |
| No asteroids remain after clearing all | Fire until `asteroids.length === 0` in console |
| Destroyed count increments | Browser tab title updates with each hit |
| Multiple bullets can hit different asteroids | Scatter fire — each hit independent |
| Performance stays smooth | Even with all collisions active — no frame rate drop |

---

## What Is Next — LAB 06

LAB 06 makes asteroids split instead of disappear. Large → 2 medium,
medium → 2 small, small → gone. This requires creating new asteroid objects
at the moment of destruction and immediately adding them to the entity list —
the "spawn from destruction" pattern.

*Continue to 2D Asteroids — LAB 06 — Splitting and Spawn from Destruction.*
