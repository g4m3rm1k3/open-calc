# 2D Asteroids — LAB 06 — Splitting and Spawn from Destruction

**Read Asteroids2D-LAB-05.md first.** That lab made bullets destroy asteroids.
This lab makes them split — large becomes 2 medium, medium becomes 2 small,
small disappears completely.

**What this lab adds:**
- Large asteroids split into 2 medium asteroids on hit
- Medium asteroids split into 2 small asteroids on hit
- Small asteroids disappear completely on hit
- Split pieces inherit the parent's velocity (with added random direction)

**What you will learn:**
- Collecting new objects to spawn alongside collecting objects to remove
- Using an object map to define what each size splits into
- Why you must add spawned objects AFTER the loop (same reason as splice)

**Time:** 40–50 minutes.

---

## What You Will Build

Shoot a large asteroid — it splits into 2 medium-sized asteroids that fly
outward. Shoot a medium one — 2 small asteroids. Shoot a small one — gone.
The full Asteroids experience.

---

## Concept: Spawn from Destruction — Collecting New Objects

**The pattern:** When object A is destroyed, it creates new objects B and C.
We cannot add B and C to the entity list during the collision loop — the loop
is currently iterating over that list.

**The solution:**

```js
// Collect objects to remove AND objects to add.
// Process BOTH collections after the loop completes.

const asteroidsToRemove = new Set();
const asteroidsToAdd    = [];       // new asteroids created from splits

for (let ai = 0; ai < asteroids.length; ai++) {
  if (/* hit */) {
    asteroidsToRemove.add(ai);
    // Create the children now, add to asteroidsToAdd list:
    const children = splitAsteroid(asteroids[ai]);
    asteroidsToAdd.push(...children);  // spread: add each child individually
  }
}

// Remove destroyed asteroids (high-to-low index):
[...asteroidsToRemove].sort((a, b) => b - a).forEach(i => asteroids.splice(i, 1));

// Add new asteroids (safe now — loop is done):
for (const child of asteroidsToAdd) {
  asteroids.push(child);
}
```

**`push(...children)`:** The spread operator `...` expands an array into
individual arguments. If `children = [asteroid1, asteroid2]`:
- `array.push(children)` adds ONE element — the array itself: `[..., [a1, a2]]`
- `array.push(...children)` adds TWO elements: `[..., a1, a2]`

We want the second form — we want each child asteroid as a separate element.

---

## Concept: Data-Driven Split Rules

**What it is:** Instead of `if size === 'large' ... else if size === 'medium'...`,
store the split rules in a plain object. The code reads the rule without knowing
the specific case.

**The problem — if-else chains:**
```js
// FRAGILE — adding a new size requires editing this function:
function getSplitSize(size) {
  if (size === 'large')  return 'medium';
  if (size === 'medium') return 'small';
  if (size === 'small')  return null;   // no split
}
```

**The solution — a lookup table:**
```js
// ROBUST — adding a new size only requires adding one entry here:
const SPLIT_INTO = {
  large:  'medium',   // large splits into medium
  medium: 'small',    // medium splits into small
  // small: undefined  — not listed = no split (returns undefined)
};

function getSplitSize(size) {
  return SPLIT_INTO[size];   // undefined if not in the table = no split
}
```

`SPLIT_INTO['small']` returns `undefined` because `small` is not a key.
Checking `if (splitSize)` catches both `undefined` (no split) and handles the
`large` and `medium` cases uniformly.

**Pattern category:** Non-GoF (Data-Driven Dispatch)
**Official name:** Table-Driven Methods / Data-Driven Dispatch
**Tradeoff:** The logic is less obvious than an if-chain, but it scales
to any number of sizes without changing the function.
**You will see this again in:** Any place where you have a mapping between
categories — score values per asteroid size, sound effects per event type.

---

## Step 1 — Add the Split Rules and Split Function

Add with the constants at the top of `main.js`:

```js
// ── Split rules ────────────────────────────────────────────────────────────────

// SPLIT_INTO: maps each asteroid size to the size its children become.
// undefined means no children (small asteroids disappear completely).
const SPLIT_INTO = {
  large:  'medium',
  medium: 'small',
  // small: not listed — returns undefined when accessed
};

// SCORE_FOR: points earned for destroying each size.
// Adding this now because scoring uses the same data-driven approach.
const SCORE_FOR = {
  large:  20,
  medium: 50,
  small:  100,
};
```

Add the `splitAsteroid` function before `checkCollisions`:

```js
// splitAsteroid: given a destroyed asteroid, returns an array of child asteroids.
// If the size does not split (small), returns an empty array.
//
// The children:
// - Spawn at the parent's position
// - Have the parent's velocity + a random deviation (spread outward)
// - Are of the next smaller size
function splitAsteroid(parent) {
  const childSizeName = SPLIT_INTO[parent.size];

  // If this size doesn't split, return no children.
  // SPLIT_INTO['small'] is undefined, which is falsy.
  if (!childSizeName) return [];

  const children = [];

  // Create 2 children:
  for (let i = 0; i < 2; i++) {
    // Random direction offset from the parent's velocity angle.
    // The children fly outward from the impact, not in exactly the same direction.
    const spreadAngle = (Math.random() - 0.5) * Math.PI;   // ±90° spread

    // Base direction: a random angle biased outward from the parent's path.
    const parentAngle  = Math.atan2(parent.velocityY, parent.velocityX);
    const childAngle   = parentAngle + spreadAngle;

    const childConfig = ASTEROID_SIZES[childSizeName];
    const childSpeed  = childConfig.speed * (0.8 + Math.random() * 0.5);

    const child = createAsteroid({ x: parent.x, y: parent.y }, childSizeName);

    // Override the child's velocity with the spread direction.
    // createAsteroid already set a random velocity, but we want it to spread
    // outward from the parent's direction, not purely random.
    child.velocityX = Math.cos(childAngle) * childSpeed + parent.velocityX * 0.3;
    child.velocityY = Math.sin(childAngle) * childSpeed + parent.velocityY * 0.3;
    // The parent's velocity × 0.3 = children carry 30% of the parent's momentum.

    children.push(child);
  }

  return children;
}
```

---

## Step 2 — Update `checkCollisions` to Spawn Children

Modify `checkCollisions()` to collect new asteroids alongside the removal sets:

```js
function checkCollisions() {
  const BULLET_COLLISION_RADIUS = 4;
  const SHIP_COLLISION_RADIUS   = 12;

  const bulletsToRemove   = new Set();
  const asteroidsToRemove = new Set();
  const asteroidsToAdd    = [];    // ← NEW: children from splits

  // ── Bullet–asteroid ────────────────────────────────────────────────────────
  for (let bi = 0; bi < bullets.length; bi++) {
    for (let ai = 0; ai < asteroids.length; ai++) {
      const bullet   = bullets[bi];
      const asteroid = asteroids[ai];

      const dx = asteroid.x - bullet.x;
      const dy = asteroid.y - bullet.y;
      const radiusSum = BULLET_COLLISION_RADIUS + asteroid.radius;

      if (dx*dx + dy*dy < radiusSum * radiusSum) {
        bulletsToRemove.add(bi);
        asteroidsToRemove.add(ai);

        // ← NEW: collect the split children.
        const children = splitAsteroid(asteroid);
        asteroidsToAdd.push(...children);   // spread: push each child individually

        // Add to score:
        asteroidsDestroyed += 1;
        score += SCORE_FOR[asteroid.size];
        document.title = `Asteroids — Score: ${score}`;
      }
    }
  }

  // Remove destroyed objects (high-to-low index):
  [...bulletsToRemove].sort((a, b) => b - a).forEach(i => bullets.splice(i, 1));
  [...asteroidsToRemove].sort((a, b) => b - a).forEach(i => asteroids.splice(i, 1));

  // ← NEW: add split children (safe to push now — loop is done):
  for (const child of asteroidsToAdd) {
    asteroids.push(child);
  }

  // ── Ship–asteroid ──────────────────────────────────────────────────────────
  for (const asteroid of asteroids) {
    const dx = asteroid.x - ship.x;
    const dy = asteroid.y - ship.y;
    const radiusSum = SHIP_COLLISION_RADIUS + asteroid.radius;

    if (dx*dx + dy*dy < radiusSum * radiusSum) {
      console.log('SHIP HIT!');
      break;
    }
  }
}
```

Add `score` to the state section:
```js
let score             = 0;
let asteroidsDestroyed = 0;
```

---

### SAVE AND TRY

Save. Reload.

**Test splitting:**
- Shoot a large (big) asteroid → it splits into 2 medium (smaller) pieces
- Shoot one of the medium pieces → 2 small (tiny) pieces
- Shoot a small piece → disappears completely

**Test score:**
The browser tab title updates with the score:
- Large asteroid: +20
- Medium asteroid: +50
- Small asteroid: +100

**In DevTools Console, after splitting several:**
```js
asteroids.length
```
Shoot one large → removes 1 large, adds 2 medium → count goes from 5 to 6.
Shoot both medium → removes 2 medium, adds 4 small → count goes from 6 to 8.

**Change something:** In `SCORE_FOR`, change `large: 20` to `large: 500`.
Save. Large asteroids award 500 points now. Change back to 20.

---

## 🎯 Challenge: Respawn a New Wave When All Asteroids Are Gone

**The problem:** Once you clear all asteroids, the game is empty. There should
be a new wave with one more asteroid than the previous wave.

**Your task:** After the collision removal code in `checkCollisions()`, check
if `asteroids.length === 0`. If so, spawn a new wave with `waveNumber + 1`
large asteroids (where `waveNumber` starts at 1 and increments).

**Hints:**
1. Add `let waveNumber = 1` to the state section.
2. After the `asteroidsToAdd` push loop, check `if (asteroids.length === 0)`.
3. Spawn `waveNumber + 1` new large asteroids (use a loop with `createAsteroid()`).
4. Increment `waveNumber` after spawning.

---

<details>
<summary>▶ Solution — New Wave Spawning</summary>

In the state section:
```js
let waveNumber = 1;
```

At the END of `checkCollisions()`, after everything else:
```js
  // ── Wave clear check ───────────────────────────────────────────────────────
  // If all asteroids are gone, spawn a new wave with one more asteroid.
  // We check AFTER all removes and adds so the count is accurate.
  if (asteroids.length === 0) {
    waveNumber += 1;
    const newWaveCount = waveNumber + 1;   // wave 1 → 2 asteroids, wave 2 → 3, etc.

    for (let i = 0; i < newWaveCount; i++) {
      asteroids.push(createAsteroid());    // createAsteroid() with no args = large, random edge
    }

    console.log(`Wave ${waveNumber} started — ${newWaveCount} asteroids`);
  }
```

**Key insight:** The wave check must come LAST — after splicing the destroyed
asteroids AND pushing the split children. If we check early, some frames show
`length === 0` temporarily even though split children are about to be added.
Order of operations matters: remove → add children → check for empty.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Large asteroid splits into 2 medium | Shoot large — 2 smaller pieces appear |
| Medium asteroid splits into 2 small | Shoot medium — 2 tiny pieces appear |
| Small asteroid disappears | Shoot small — nothing spawns |
| Split children spread outward | Pieces fly in different directions from impact |
| Score increments per size | Title bar shows score increasing correctly |
| New wave spawns when all clear | Clear all asteroids — new set appears |
| Wave count increments | Each clear: one more asteroid in next wave |
| Game still works normally | Ship, bullets, wrapping all still function |

---

## What Is Next — LAB 07

LAB 07 adds the HUD (score, lives, game over screen) using the canvas itself.
The ship gets lives — hitting an asteroid removes one. Losing all lives shows
a game-over screen with the final score. This introduces `ctx.fillText` for
text rendering and a simple game state machine (playing / game over / respawning).

*Continue to 2D Asteroids — LAB 07 — Lives, HUD, and Game State.*
