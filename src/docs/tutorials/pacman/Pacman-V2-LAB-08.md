# Pac-Man V2 — LAB 08 — Ghost Catches Pac-Man (Euclidean Distance)

**Prerequisites:** LAB 07 — Ghost chases Pac-Man.

**What this lab builds:**
- Euclidean distance for precise pixel collision
- Detecting when Pac-Man and the ghost touch
- A simple penalty (reloading the game) to verify collision works

**Time:** 30–45 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. We used Manhattan distance for ghost pathfinding. Why can't we use it for collision detection between two circles?
> 2. How close do the centers of two circles need to be for them to touch?
> *(Answers at the end of this lab)*

---

## What You Will Build

The ghost chases you as before. But now, if the red circle touches the yellow
circle, the game immediately alerts "Caught!" and reloads. (A proper lives
system comes in LAB-09).

---

## Math: Euclidean Distance (Pythagorean Theorem)

**What it computes:** The straight-line distance between two points in 2D space.

**The real-world analogy:** The crow-flies distance. If you are in a field with
no obstacles, you walk directly from point A to point B.

**Canonical example:** A right triangle. The horizontal distance (dx) is one leg,
the vertical distance (dy) is the other leg. The distance between the points is
the hypotenuse.
`distance = Math.sqrt((dx * dx) + (dy * dy))`

```text
    A
    |\
    | \   hypotenuse (distance)
 dy |  \
    |   \
    |____\
      dx   B
```

**Why it matters here:** While Pac-Man's *pathfinding* is restricted to grid
lines (Manhattan distance), his *physical body* is a circle drawn at exact
pixel coordinates. To know if two circles are touching, we must measure the
straight-line pixel distance between their centers.

**Watch for:** `Math.sqrt` is computationally expensive compared to addition.
In massive physics engines, developers often use "squared distance"
(`dx*dx + dy*dy < radius*radius`) to avoid the square root. For Pac-Man with 4 ghosts,
`Math.sqrt` is perfectly fine.

---

## Logic: Circle Collision

**What it decides:** Are two circles overlapping?

**Truth table or plain-English breakdown:**
Two circles touch if the distance between their centers is less than the sum
of their radii.
- Distance = 20, Radii sum = 15 -> No collision.
- Distance = 10, Radii sum = 15 -> Collision!

**Canonical example:** You hold a plate (radius 10cm) and your friend holds a
plate (radius 10cm). If your hands (the centers) are 30cm apart, the plates don't touch.
If your hands are 15cm apart, the plates are overlapping.

**The code:**
```js
const dx = circle2.x - circle1.x;
const dy = circle2.y - circle1.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance < circle1.radius + circle2.radius) {
  // Collision!
}
```

---

## Step 1 — Add the Collision Check

Add this function after `updateGhost`:

```js
// checkGhostCollision: checks if Pac-Man is touching any ghost.
// Uses Euclidean distance for exact circle-to-circle collision.
// If caught, alerts the player and reloads the page (stub for LAB-09).
function checkGhostCollision() {
  const COLLISION_DISTANCE = PACMAN_RADIUS + GHOST_RADIUS;

  for (const ghost of ghosts) {
    const dx = pacman.pixelX - ghost.pixelX;
    const dy = pacman.pixelY - ghost.pixelY;
    
    // Pythagorean theorem:
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < COLLISION_DISTANCE) {
      // Collision! We caught Pac-Man.
      alert("Caught! Try again.");
      location.reload(); 
      return; // Stop checking further ghosts
    }
  }
}
```

Update `update()` to call the collision check at the end of the frame:

```js
function update() {
  if (keysHeld['ArrowRight']) { pacman.nextDirX =  1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowLeft'])  { pacman.nextDirX = -1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowDown'])  { pacman.nextDirX =  0; pacman.nextDirY =  1; }
  if (keysHeld['ArrowUp'])    { pacman.nextDirX =  0; pacman.nextDirY = -1; }

  updatePacman();
  checkDotEaten();
  ghosts.forEach(ghost => updateGhost(ghost));
  
  checkGhostCollision();   // ← add this
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** The ghost chases Pac-Man. Let the ghost hit Pac-Man. An
alert box pops up saying "Caught!". When you click OK, the page reloads and
the game resets.

**In DevTools Console:**
```js
Math.sqrt(3*3 + 4*4)
```
**Expected:** `5` — the classic 3-4-5 right triangle.

---

## 🎯 Challenge: A Fairer Hitbox (Tolerance)

**You know:** The current collision requires the circles to overlap by even
1 fraction of a pixel to trigger death. Visually, because the circles are
rendered with anti-aliasing (soft edges), it might feel like the ghost "snipes"
Pac-Man just before actually touching him.

**Task:** Add a small tolerance to the collision check so the player feels
it's fair. The ghost should have to overlap Pac-Man by a few pixels before
it counts.

**Hints:**
1. Look at `COLLISION_DISTANCE`.
2. Subtract a small number (like 3 or 4) from the sum of the radii.

---

<details>
<summary>▶ Show Solution</summary>

In `checkGhostCollision`:
```js
  // -3 gives a 3-pixel tolerance. They must overlap slightly.
  // This is a "forgiving hitbox", a standard game design trick.
  const COLLISION_DISTANCE = (PACMAN_RADIUS + GHOST_RADIUS) - 3;
```

**Key insight:** What is mathematically accurate is not always what feels best
to the player. Game hitboxes are almost always slightly smaller than the visual
art to prevent "cheap" deaths. 

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Collision detects touching | Let ghost touch Pac-Man -> Alert triggers |
| Game resets | After alert, the browser reloads and game is fresh |
| Near misses are safe | (If challenge done) Grazing the ghost doesn't kill you immediately |

---

## Quick Check Answers

**1. Why can't we use Manhattan distance for collision?**
Manhattan distance measures grid paths. If Pac-Man and a ghost are at slightly
different pixel coordinates (e.g., overlapping diagonally), Manhattan distance
would measure the path *around* the corner of a bounding box, giving a falsely
high distance. Euclidean distance measures the exact gap between their physical
bodies.

**2. How close do the centers need to be to touch?**
The sum of their radii. If Pac-Man has radius 7 and the Ghost has radius 8,
they touch when their centers are exactly 15 pixels apart. Any distance less
than 15 means they are overlapping.

---

## What Is Next — LAB 09

LAB 09 replaces `location.reload()` with a proper Finite State Machine (FSM)
and a lives system. We don't want the browser to refresh; we want the game state
to change from `PLAYING` to `DEAD`, wait a second, reset the positions, and go
back to `PLAYING` — or `GAME_OVER` if lives hit 0. 

*Continue to Pac-Man V2 — LAB 09 — Lives and Game States.*
