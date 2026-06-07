# 2D Asteroids — LAB 03 — Bullets and Entity Lists

**Read Asteroids2D-LAB-02.md first.** That lab built the ship. This lab adds
firing — press Space to shoot bullets in the direction the ship is facing.

**What this lab adds:**
- Space key fires a bullet
- Bullets travel in the direction the ship was facing when fired
- Bullets disappear after a set time (lifetime)
- Fire rate limit — can't hold Space to fire instantly again

**What you will learn:**
- The entity list pattern — an array that holds all active "things" of one type
- Iterating backward through an array when removing elements
- The lifetime / expiry pattern for temporary objects

**Time:** 45–60 minutes.

---

## What You Will Build

Open the browser. The ship from LAB-02 is there. Press Space — a small white
dot fires from the nose in the direction the ship is facing. Multiple bullets
can be on screen at once. Each disappears after about 1.5 seconds. The ship
cannot fire again for 0.15 seconds after each shot (fire rate limit).

---

## Concept: The Entity List Pattern

**What it is:** An array that holds all active instances of one game object type.
Every frame: loop over the array, update each item, remove expired items.

**The problem without it:**

In LAB-02, the ship is a single object — there is only ever one ship. Bullets
are different: there can be 0 bullets, 1 bullet, or 20 bullets at the same time.
You cannot track 20 bullets with 20 separate variables.

**The pattern:**

```js
// WRONG — single variables cannot handle variable quantity:
let bullet1 = { x: 100, y: 100 };
let bullet2 = { x: 200, y: 150 };
// What happens at bullet number 21?

// RIGHT — a single array holds all of them:
const bullets = [];   // starts empty

// To add a bullet:
bullets.push({ x: 100, y: 100, velocityX: 0, velocityY: -5, lifetime: 90 });

// To update all bullets:
for (const bullet of bullets) {
  bullet.x += bullet.velocityX;
  bullet.y += bullet.velocityY;
  bullet.lifetime -= 1;
}

// To draw all bullets:
for (const bullet of bullets) {
  ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
}
```

**This pattern appears everywhere:**
- `bullets` — the list of all flying bullets
- `asteroids` — the list of all floating rocks (next lab)
- `particles` — the list of all explosion pieces (LAB-08)
- `enemies` — the list of all enemies in Pac-Man
- `shapes` — the list of all drawn shapes in the Drawing App

Once you understand this pattern, you understand how most game objects are managed.

**Pattern category:** Non-GoF (game architecture pattern)
**Official name:** Entity List (or Object Pool — a close relative)
**Tradeoff:** All bullets update every frame even if most are off-screen. For
small counts (< 100 bullets), this cost is negligible.
**You will see this again in:** LAB-04 (asteroids), LAB-08 (particles).

---

## Concept: Removing Items While Iterating — The Backward Loop

**The problem — removing while iterating forward:**

```js
const bullets = [bullet0, bullet1, bullet2, bullet3];
// Suppose bullet1 has expired and needs to be removed.

for (let i = 0; i < bullets.length; i++) {
  if (bullets[i].lifetime <= 0) {
    bullets.splice(i, 1);   // removes element at index i, shifts everything left
    // bullets is now [bullet0, bullet2, bullet3]
    // but i is still 1 — now pointing at bullet2
    // we SKIP bullet2 — it never gets checked!
  }
}
```

`Array.splice(index, 1)` removes one element and shifts all elements after it
left by one position. If you're iterating forward, the index that just shifted
into the current position gets skipped.

**The solution — iterate backward:**

```js
// Iterate from the last index down to 0.
// When we remove an element, only elements AFTER i shift.
// Since we're going backward, we've already processed those.
for (let i = bullets.length - 1; i >= 0; i--) {
  if (bullets[i].lifetime <= 0) {
    bullets.splice(i, 1);   // removes at i, shifts elements after i left
    // But we're going backward — we've already processed those elements.
    // i-- next iteration moves to i-1 — correct ✓
  }
}
```

**Visual:**
```
Forward loop — splice causes skipped element:
[A, B, C, D]
 i=0: keep A
 i=1: remove B → [A, C, D] — i is now 1, pointing at C — BUT i++ → i=2 → skip C!

Backward loop — splice is safe:
[A, B, C, D]
 i=3: keep D
 i=2: keep C
 i=1: remove B → [A, C, D] — i-- → i=0
 i=0: keep A — C and D already processed, shifting them didn't matter
```

**Watch for:** This is one of the most common bugs in game development. If
objects are sometimes not getting removed, or getting removed twice, check
whether the loop goes forward when it should go backward.

---

## Concept: Lifetime — Expiring Objects

**What it is:** A property on a temporary object that counts down each frame.
When it reaches zero (or below), the object is removed.

```js
const BULLET_LIFETIME = 90;   // frames the bullet exists (at 60fps ≈ 1.5 seconds)

// When creating a bullet:
bullets.push({
  x: ship.x,
  y: ship.y,
  velocityX: ...,
  velocityY: ...,
  lifetime: BULLET_LIFETIME,   // starts at 90, counts down
});

// In the update loop:
for (let i = bullets.length - 1; i >= 0; i--) {
  bullets[i].lifetime -= 1;   // decrement each frame

  if (bullets[i].lifetime <= 0) {
    bullets.splice(i, 1);    // remove the expired bullet
  }
}
```

**Why lifetime instead of checking if off-screen:**

A bullet fired in a direction that wraps around the screen could technically
stay on screen forever. Lifetime guarantees removal regardless of position.

**Watch for:** At 60fps, `lifetime = 60` means 1 second. At 30fps it means 2
seconds. In LAB-05 we introduce delta time to fix this. For now, fixed-frame
counting is simpler and fine for learning.

---

## Concept: Fire Rate Limiting

**The problem:** Without a rate limit, holding Space fires a new bullet every
single frame (60 bullets per second). The game becomes trivially easy and
performance suffers.

**The solution — a cooldown timer:**

```js
let fireCooldown = 0;   // frames remaining until the ship can fire again

// When Space is pressed:
if (keysHeld['Space'] && fireCooldown <= 0) {
  fireBullet();
  fireCooldown = 9;   // can't fire for 9 more frames (≈ 0.15 seconds at 60fps)
}

// In update(), decrement the cooldown each frame:
if (fireCooldown > 0) fireCooldown -= 1;
```

This is the same countdown pattern used for power pellet effects in Pac-Man —
a timer that counts down from a starting value to zero.

---

## Step 1 — Add Bullets to the State and Constants

At the top of `main.js`, add these constants (after the existing ones):

```js
// ── Bullet constants ───────────────────────────────────────────────────────────

const BULLET_SPEED    = 10;    // pixels per frame the bullet travels
const BULLET_LIFETIME = 90;    // frames before the bullet disappears (at 60fps ≈ 1.5s)
const BULLET_SIZE     = 3;     // the bullet is a 3×3 pixel square
const FIRE_COOLDOWN   = 9;     // frames between shots (at 60fps ≈ 0.15s)
```

After the `ship` object, add:

```js
// ── Bullet state ──────────────────────────────────────────────────────────────

// bullets: the entity list — all currently active bullets.
// Starts empty. Push to add, splice to remove.
const bullets = [];

// fireCooldown: frames remaining until the ship can fire again.
// Starts at 0 (can fire immediately).
let fireCooldown = 0;
```

---

## Step 2 — The `fireBullet` Function

Add this function before `update()`:

```js
// fireBullet: creates a new bullet object and adds it to the bullets array.
// Called when the player presses Space and the cooldown has expired.
function fireBullet() {
  // The bullet starts at the ship's nose position.
  // The nose is SHIP_NOSE_Y units ahead of the ship's center in local space.
  // We convert this to world space using the ship's angle.
  //
  // In local space: nose is at (0, SHIP_NOSE_Y).
  // In world space (after rotation):
  //   noseX = ship.x + sin(angle) * |SHIP_NOSE_Y|
  //   noseY = ship.y - cos(angle) * |SHIP_NOSE_Y|
  //
  // SHIP_NOSE_Y = -15 (negative), so |SHIP_NOSE_Y| = 15.
  const noseDistance = Math.abs(SHIP_NOSE_Y);   // 15 pixels from center to tip
  const bulletX = ship.x + Math.sin(ship.angle) * noseDistance;
  const bulletY = ship.y - Math.cos(ship.angle) * noseDistance;

  // The bullet travels in the direction the ship faces.
  // Same sin/cos formula as the thrust calculation — the facing direction vector.
  const bulletVX = Math.sin(ship.angle) * BULLET_SPEED;
  const bulletVY = -Math.cos(ship.angle) * BULLET_SPEED;   // negative: Y-down canvas

  // Add the new bullet to the entity list.
  bullets.push({
    x:         bulletX,
    y:         bulletY,
    velocityX: bulletVX,
    velocityY: bulletVY,
    lifetime:  BULLET_LIFETIME,
  });
}
```

---

## Step 3 — Update and Render Bullets

In the `update()` function, add bullet handling. Add after the ship movement code:

```js
  // ── Fire ──────────────────────────────────────────────────────────────────
  // Decrement cooldown each frame.
  if (fireCooldown > 0) fireCooldown -= 1;

  // Fire when Space is held AND cooldown has expired.
  if (keysHeld['Space'] && fireCooldown === 0) {
    fireBullet();
    fireCooldown = FIRE_COOLDOWN;   // reset cooldown
  }

  // ── Update bullets ────────────────────────────────────────────────────────
  // Iterate BACKWARD so we can splice (remove) without skipping elements.
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    // Move the bullet.
    bullet.x += bullet.velocityX;
    bullet.y += bullet.velocityY;

    // Wrap at edges (same formula as the ship).
    bullet.x = (bullet.x + canvas.width)  % canvas.width;
    bullet.y = (bullet.y + canvas.height) % canvas.height;

    // Decrement lifetime.
    bullet.lifetime -= 1;

    // Remove expired bullets.
    if (bullet.lifetime <= 0) {
      bullets.splice(i, 1);   // removes element at index i from the array
    }
  }
```

Add a `drawBullets()` function alongside `drawShip()`:

```js
function drawBullets() {
  ctx.fillStyle = '#ffffff';

  for (const bullet of bullets) {
    // Draw each bullet as a small square centered on its position.
    // fillRect(x, y, width, height) — x,y is the top-left corner.
    // To center a BULLET_SIZE × BULLET_SIZE square at (bullet.x, bullet.y):
    //   top-left corner = (bullet.x - BULLET_SIZE/2, bullet.y - BULLET_SIZE/2)
    ctx.fillRect(
      bullet.x - BULLET_SIZE / 2,
      bullet.y - BULLET_SIZE / 2,
      BULLET_SIZE,
      BULLET_SIZE
    );
  }
}
```

Update `render()` to call `drawBullets()`:

```js
function render() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawShip();
  drawBullets();   // ← add this line
}
```

---

### SAVE AND TRY — Step 3

Save. Reload.

**You should see:** The ship from LAB-02. Press Space — a small white square
appears at the ship's nose and travels in the facing direction.

**Test rate limiting:** Hold Space — fires one bullet, then another after ~0.15
seconds. Does not rapid-fire every frame.

**Test multiple bullets:** Fire 4–5 bullets in different directions as you turn.
All are on screen simultaneously.

**Test lifetime:** Stop firing and watch. Old bullets disappear after ~1.5 seconds.

**In DevTools Console:**
```js
bullets.length
```
Fire several bullets, run this — count shows the active bullet count.
Wait 2 seconds, run again — count should be back near 0.

**Change something:** Change `BULLET_LIFETIME = 90` to `BULLET_LIFETIME = 30`.
Save. Bullets disappear very quickly. Change `FIRE_COOLDOWN = 9` to
`FIRE_COOLDOWN = 2`. Save. Nearly rapid-fire. Change both back.

---

## 🎯 Challenge: Make the Bullet Inherit the Ship's Velocity

**Current behavior:** If the ship is moving right at full speed and fires
forward, the bullet travels in the facing direction at BULLET_SPEED. The ship's
momentum doesn't affect the bullet.

**Expected Asteroids behavior:** The bullet should also carry the ship's
momentum. If the ship is moving right and fires to the right, the bullet is
faster. If the ship is moving right and fires backward (after turning 180°),
the bullet is slower — potentially even going backward!

**Concept:** This is vector addition.

```
bullet velocity = bullet forward direction + ship velocity
```

In component form:
```
bulletVX = sin(angle) * BULLET_SPEED  +  ship.velocityX
bulletVY = -cos(angle) * BULLET_SPEED  +  ship.velocityY
```

**Your task:** Modify `fireBullet()` to add the ship's current velocity to the
bullet's velocity when it is created.

**Hints:**
1. Find the two lines in `fireBullet()` where `bulletVX` and `bulletVY` are computed.
2. Add `ship.velocityX` to `bulletVX` and `ship.velocityY` to `bulletVY`.
3. Test: fly fast in one direction, fire forward vs backward — notice the difference.

---

<details>
<summary>▶ Solution — Bullet Inherits Ship Velocity</summary>

In `fireBullet()`, change the velocity lines from:
```js
const bulletVX = Math.sin(ship.angle) * BULLET_SPEED;
const bulletVY = -Math.cos(ship.angle) * BULLET_SPEED;
```

To:
```js
// Bullet velocity = facing direction + ship's current momentum.
// Vector addition: add each component separately.
const bulletVX = Math.sin(ship.angle) * BULLET_SPEED + ship.velocityX;
const bulletVY = -Math.cos(ship.angle) * BULLET_SPEED + ship.velocityY;
```

**Key insight:** This is exactly how real physics works — a bullet fired from
a moving gun travels at the sum of the gun's velocity and the bullet's ejection
velocity. The formula is always: `total = own_velocity + inherited_velocity`.
This same vector addition appears in every game for projectiles, explosions,
and particle systems.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Space fires a bullet | White dot appears at ship nose |
| Bullet travels in facing direction | Turn ship, fire — bullet goes in nose direction |
| Bullet inherits ship velocity | Fast ship: forward shot faster, backward shot slower |
| Multiple bullets on screen | Fire several in quick succession — all visible |
| Bullets wrap at edges | Fire toward edge — bullet wraps to opposite side |
| Bullets expire after ~1.5 seconds | Watch bullets disappear without hitting anything |
| Fire rate limit works | Hold Space — not every frame, regular rate |
| Console: `bullets.length` shows count | Changes as bullets are fired and expire |

---

## What Is Next — LAB 04

LAB 04 adds asteroids — the actual rocks floating through space. They move
in random directions, spin as they move, and come in three sizes: large, medium,
and small. This lab introduces spawning objects from data and managing multiple
independent entity lists.

*Continue to 2D Asteroids — LAB 04 — Asteroids and Random Motion.*
