# 2D Asteroids — LAB 10 — High Score, Polish, and Complete Review

**Read Asteroids2D-LAB-09.md first.** That lab added sound. This final lab adds
persistence (high score saved between sessions) and a start screen, then
reviews every concept and pattern used in the series.

**What this lab adds:**
- High score tracked and displayed
- High score persisted with `localStorage` (survives page refresh)
- Start screen before the first game
- `ctx.save()` / `ctx.restore()` for the starfield scale effect on the start screen

**What you will learn:**
- `localStorage` — the browser's simple key-value persistence store
- The `'start_screen'` state added to the FSM
- `ctx.scale()` — scaling the canvas transform

**Time:** 30–40 minutes (most of the lab is the review).

---

## What You Will Build

When the page first loads, a start screen shows the title, the high score from
previous sessions, and "PRESS ENTER TO START." Playing the game updates the
high score. Refreshing the page shows the saved high score.

---

## Concept: `localStorage` — Persisting Data Between Page Loads

**What it is:** A key-value store in the browser that survives page refreshes
and browser restarts. Each domain gets its own isolated storage.

**API:**
```js
// Write:
localStorage.setItem('asteroids_highscore', '1500');
// Key and value are BOTH strings — always.

// Read:
const saved = localStorage.getItem('asteroids_highscore');
// Returns the string '1500', or null if the key doesn't exist.

// Delete:
localStorage.removeItem('asteroids_highscore');

// Read with a fallback when key doesn't exist:
const highScore = parseInt(localStorage.getItem('asteroids_highscore') ?? '0', 10);
// ?? '0': if getItem returns null, use '0' instead.
// parseInt(..., 10): convert the string to an integer (base 10).
```

**Why `parseInt`:** `localStorage` stores strings. `'1500'` is not the same as
`1500` in comparisons (`'1500' > '999'` is false because string comparison is
alphabetical — `'1' < '9'`). Always convert to a number before comparing.

**The `??` operator (nullish coalescing):**

```js
null     ?? 'default'   // → 'default' (null is nullish)
undefined ?? 'default'  // → 'default' (undefined is nullish)
0        ?? 'default'   // → 0         (0 is NOT nullish — only null/undefined trigger)
''       ?? 'default'   // → ''        (empty string is NOT nullish)
```

Different from `||`:
```js
0  || 'default'   // → 'default' (0 is falsy — || treats it as "use default")
0  ?? 'default'   // → 0         (?? treats 0 as a valid value)
```

For numeric values that could legitimately be 0 (like a score), use `??` not `||`.

**Watch for:** `localStorage` throws an error in some browsers when the
storage quota is exceeded. For small values (scores, settings), this never
happens in practice. For large amounts of data, use IndexedDB instead.

---

## Concept: `ctx.scale()` — Scaling the Canvas Transform

**What it is:** Scales subsequent drawing operations.

```js
ctx.save();
ctx.scale(2, 2);           // everything drawn at 2× size
ctx.fillRect(10, 10, 50, 50);  // actually draws 100×100 at position (20, 20)
ctx.restore();

ctx.fillRect(10, 10, 50, 50);  // back to normal size
```

Combined with `translate` and `rotate`, `scale` is part of the full transform
toolkit. For the start screen, we use a subtle growing effect:

```js
// Scale from center of canvas:
ctx.save();
ctx.translate(canvas.width / 2, canvas.height / 2);  // move origin to center
ctx.scale(1.05, 1.05);                                // scale 5% larger
ctx.translate(-canvas.width / 2, -canvas.height / 2); // move origin back
// ... draw something slightly larger than normal
ctx.restore();
```

---

## Step 1 — Add `localStorage` High Score

In the state section, add:

```js
// ── Persistent state ──────────────────────────────────────────────────────────

// Read the saved high score from localStorage.
// localStorage.getItem returns null if the key was never written — use ?? '0'.
// parseInt converts the string to an integer.
let highScore = parseInt(localStorage.getItem('asteroids_highscore') ?? '0', 10);
```

Add a function to save the high score:

```js
// saveHighScore: writes the current score to localStorage if it beats the record.
// Called at game over.
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('asteroids_highscore', String(highScore));
    // String(highScore): convert number to string — localStorage requires strings.
  }
}
```

In `checkCollisions()`, in the `gameState === 'game_over'` assignment block:

```js
        gameState = 'game_over';
        saveHighScore();   // ← add this
```

---

## Step 2 — Add the Start Screen State

Add `'start_screen'` to the FSM. Update the initial `gameState`:

```js
let gameState = 'start_screen';   // was 'playing'
```

Update `update()` — add the start screen state:

```js
function update() {
  if (gameState === 'start_screen') return;   // frozen — wait for Enter
  if (gameState === 'game_over')    return;
  // ... rest of update unchanged
}
```

Update the Enter key handling in `keydown`:

```js
  // Enter starts game from start screen:
  if (event.code === 'Enter' && gameState === 'start_screen') {
    gameState = 'playing';
  }
  // Enter restarts from game over:
  if (event.code === 'Enter' && gameState === 'game_over') {
    restartGame();
  }
```

---

## Step 3 — Draw the Start Screen

Add to `render()`:

```js
  if (gameState === 'start_screen') drawStartScreen();
  if (gameState === 'game_over')    drawGameOver();
```

Add the function:

```js
function drawStartScreen() {
  // Semi-transparent overlay:
  ctx.globalAlpha = 0.8;
  ctx.fillStyle   = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;

  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;
  ctx.textAlign = 'center';

  // Title:
  ctx.fillStyle = '#ffffff';
  ctx.font      = 'bold 64px monospace';
  ctx.fillText('ASTEROIDS', cx, cy - 60);

  // High score (only shows if one is saved):
  if (highScore > 0) {
    ctx.fillStyle = '#aaaaaa';
    ctx.font      = '20px monospace';
    ctx.fillText(`BEST  ${highScore}`, cx, cy - 20);
  }

  // Instructions:
  ctx.fillStyle = '#ffffff';
  ctx.font      = '20px monospace';
  ctx.fillText('PRESS ENTER TO START', cx, cy + 30);

  ctx.fillStyle = '#666666';
  ctx.font      = '14px monospace';
  ctx.fillText('ARROWS: ROTATE & THRUST', cx, cy + 70);
  ctx.fillText('SPACE: FIRE', cx, cy + 92);

  ctx.textAlign = 'left';
}
```

Also update `drawGameOver()` to show the high score:

```js
  // In drawGameOver(), after showing the final score:
  if (score === highScore && score > 0) {
    ctx.fillStyle = '#ffdd44';
    ctx.font      = '16px monospace';
    ctx.fillText('NEW BEST!', cx, cy + 50);
  } else {
    ctx.fillStyle = '#555555';
    ctx.font      = '16px monospace';
    ctx.fillText(`BEST  ${highScore}`, cx, cy + 50);
  }
```

---

### SAVE AND TRY

Save. Reload.

**You should see:** The start screen with "ASTEROIDS" in large text, controls
reminder, and "PRESS ENTER TO START."

**Play:** Press Enter → game starts. Play until game over → see your score.
**Reload:** Start screen again — your high score should be shown if you scored > 0.

**In DevTools — verify persistence:**
1. Play and get a score. Game over.
2. Open DevTools → Application tab → Local Storage → your file's origin.
3. See the key `asteroids_highscore` with your score as the value.
4. Reload the page — the score appears on the start screen.

**Change something:** In DevTools Local Storage, change the value of
`asteroids_highscore` to `9999`. Reload — "BEST 9999" appears on the start screen.

---

## Complete Pattern and Concept Reference

Every concept and pattern used in this series, mapped to where you'll see
it next.

---

### JavaScript Concepts Covered

| Concept | First Use | Key Insight |
|---|---|---|
| `const` for arrays/objects | LAB-01 | `const` prevents reassignment, not mutation |
| `let` for mutable values | LAB-01 | Use `let` only when the variable is reassigned |
| Arrow functions `() => {}` | LAB-01 | Shorter function syntax |
| Template literals `` `text ${var}` `` | LAB-07 | String interpolation |
| `Array.from({ length: N }, fn)` | LAB-04 | Create an array of N objects in one line |
| `array.push(item)` | LAB-03 | Add one item to the end |
| `array.splice(i, 1)` | LAB-03 | Remove one item at index i |
| `new Set()` | LAB-05 | Unique-value collection (no duplicates) |
| `...spread` | LAB-06 | Expand array into individual arguments |
| `??` nullish coalescing | LAB-10 | Default for `null`/`undefined` only |
| `localStorage` | LAB-10 | Browser persistence — key/value strings |

---

### Canvas API Covered

| Method / Property | First Use | What It Does |
|---|---|---|
| `canvas.getContext('2d')` | LAB-01 | Returns the 2D drawing context |
| `ctx.fillStyle` | LAB-01 | Sets fill color (persists) |
| `ctx.fillRect(x, y, w, h)` | LAB-01 | Fills a rectangle |
| `ctx.beginPath()` | LAB-01 | Clears path buffer — required before each shape |
| `ctx.arc(x, y, r, 0, 2π)` | LAB-01 | Describes a circle |
| `ctx.fill()` | LAB-01 | Paints the described shape filled |
| `ctx.stroke()` | LAB-02 | Paints the described shape as outline only |
| `ctx.strokeStyle` | LAB-02 | Sets stroke color (persists) |
| `ctx.lineWidth` | LAB-02 | Sets stroke width (persists) |
| `ctx.moveTo(x, y)` | LAB-02 | Moves path pen without drawing |
| `ctx.lineTo(x, y)` | LAB-02 | Draws a line from current to (x,y) |
| `ctx.closePath()` | LAB-02 | Line back to the first moveTo point |
| `ctx.save()` | LAB-02 | Pushes current transform/state to stack |
| `ctx.restore()` | LAB-02 | Pops saved transform/state from stack |
| `ctx.translate(x, y)` | LAB-02 | Moves the canvas origin |
| `ctx.rotate(angle)` | LAB-02 | Rotates around current origin |
| `ctx.scale(x, y)` | LAB-10 | Scales subsequent drawing |
| `ctx.fillText(text, x, y)` | LAB-07 | Draws text at (x, baseline y) |
| `ctx.font` | LAB-07 | Sets font size and family (CSS format) |
| `ctx.textAlign` | LAB-07 | Horizontal anchor for fillText |
| `ctx.globalAlpha` | LAB-07 | Opacity for subsequent draws (0–1) |

---

### Patterns Covered

| Pattern | First Use Lab | What It Solves |
|---|---|---|
| **Game Loop** (requestAnimationFrame) | LAB-01 | Frame-rate-synced, non-blocking game loop |
| **Update/Render Separation** | LAB-01 | State changes separate from drawing |
| **Entity List** | LAB-03 | Managing variable-quantity game objects |
| **Backward Iteration for Removal** | LAB-03 | Correct index behavior during splice |
| **Lifetime / Expiry** | LAB-03 | Automatic object removal by age |
| **Fire Rate Cooldown** | LAB-03 | Limiting how fast repeated actions fire |
| **Collect-Then-Remove** | LAB-05 | Safe removal during collision iteration |
| **Data-Driven Dispatch** | LAB-06 | Config tables replace if-else chains |
| **Spawn From Destruction** | LAB-06 | Create objects at the moment others die |
| **Finite State Machine** | LAB-07 | Managing game modes (playing/dead/over) |
| **Generate Once, Draw Every Frame** | LAB-08 | Starfield — static data reused each frame |
| **Layered Rendering** | LAB-08 | Background → entities → effects → HUD |
| **Web Audio Signal Graph** | LAB-09 | Source → Gain → Destination |
| **Deferred Initialization** | LAB-09 | AudioContext created on first user gesture |

---

### How These Map to the 3D Asteroids Series

| 2D Concept | 3D Equivalent (Three.js) |
|---|---|
| `const ship = { x, y, velocityX, velocityY }` | `ship = { group: THREE.Group, velocity: THREE.Vector3 }` |
| `ctx.translate + ctx.rotate` | `mesh.position.set(x, y, z) + mesh.rotateOnAxis(axis, angle)` |
| `update()` → `render()` loop | `requestAnimationFrame` → `renderer.render(scene, camera)` |
| Entity list `const bullets = []` | Entity list `const bullets: Bullet[] = []` (TypeScript type) |
| `Math.sqrt(dx*dx + dy*dy)` | `posA.distanceTo(posB)` (Three.js Vector3 method) |
| `ctx.fillRect(0, 0, w, h)` | `scene.background = new THREE.Color(0x000011)` |
| `Math.sin(angle) * speed` | `new THREE.Vector3(sin, cos, 0)` (direction vector) |
| Starfield: random `fillRect` points | Starfield: `THREE.Points` with `BufferGeometry` |
| `ctx.globalAlpha` for fading | `material.opacity` and `material.transparent = true` |
| `audio.js` module | Same Web Audio API (unchanged in 3D) |

---

### How These Map to Your CAD/CAM Tool

| Game Concept | CAD/CAM Application |
|---|---|
| Entity list (bullets, asteroids) | Shape list (lines, circles, arcs) |
| Collect-then-remove | Command Pattern for undo (collect actions, apply/revert) |
| Finite State Machine | Tool modes (select tool, draw tool, dimension tool) |
| Wrapping position | Coordinate system clamping, viewport bounds |
| `ctx.translate + ctx.rotate` | Viewport pan + zoom (translate for pan, scale for zoom) |
| Layered rendering (bg → entities → HUD) | Grid → geometry → selection → dimensions → UI |
| Distance formula | Click-to-select (find nearest geometry to cursor) |
| Data-driven dispatch (SPLIT_INTO) | Geometry type dispatch (what to draw for 'line' vs 'arc') |
| `localStorage` | User preferences, recent files |

---

## Final Check — Complete Game

| Feature | How to verify |
|---------|--------------|
| Start screen shows on load | "ASTEROIDS" title, "PRESS ENTER" text |
| High score shows after first game | Reload after scoring — best score displayed |
| "NEW BEST" on game over | Beat your high score — gold text appears |
| All LAB-01–09 features work | Ship, thrust, bullets, split, lives, particles, sound |
| Game restarts correctly | Enter on game over → everything resets |
| `localStorage` persists | DevTools → Application → Local Storage shows value |

---

## What to Build Next

You have built a complete, polished 2D Asteroids game from scratch using:
- Vanilla HTML, CSS, and JavaScript
- The 2D Canvas API
- The Web Audio API
- Every major game architecture pattern

**You are now ready for:**

1. **3D Asteroids (Asteroids3D-LAB-01 through LAB-10)**
   — The same patterns, same entity lists, same game loop, same FSM.
   But in TypeScript + React + Three.js, with vectors, matrices, and quaternions.

2. **Tetris in JavaScript**
   — The grid, the Tetromino FSM, the line-clear event. All concepts you have
   now plus a different kind of collision (tile-based, not distance-based).

3. **The Drawing App**
   — Canvas coordinate transforms (pan and zoom), click-to-select (distance
   formula), the Command Pattern (undo/redo). All from this series.

4. **Your CAD/CAM prototype**
   — Start with the Drawing App's pan/zoom foundation. Every canvas technique
   you need is in this series.

*The 2D Asteroids series is complete.*
