# 2D Asteroids — LAB 07 — Lives, HUD, and Game State

**Read Asteroids2D-LAB-06.md first.** That lab added splitting. This lab adds
the complete game loop: lives, a score display on the canvas, and game-over /
restart logic.

**What this lab adds:**
- 3 lives — hitting an asteroid removes one
- Brief invulnerability after being hit (ship blinks)
- Score and lives shown on the canvas with `ctx.fillText`
- Game over screen when all lives are lost
- Press Enter to restart

**What you will learn:**
- `ctx.fillText` and `ctx.font` — drawing text on the canvas
- A finite state machine (playing → game-over → playing)
- The invulnerability blink using a frame counter
- `ctx.globalAlpha` — drawing things semi-transparent

**Time:** 60–75 minutes.

---

## What You Will Build

The ship now has 3 lives shown in the top-left as triangles. The score shows
in the top-right. Being hit by an asteroid removes a life and makes the ship
blink for 2 seconds (invulnerable while blinking). Losing all 3 lives shows
"GAME OVER" in the center with the final score. Press Enter to restart.

---

## Concept: Drawing Text on the Canvas — `ctx.fillText` and `ctx.font`

**What they are:** `ctx.font` sets the font used for text drawing. `ctx.fillText`
draws text at a given position using the current `fillStyle` color.

**Minimal example:**
```js
ctx.fillStyle = '#ffffff';               // text color: white
ctx.font      = '24px monospace';        // size and font family
ctx.fillText('SCORE: 1500', 20, 30);    // text, x, y
// x = horizontal position of the LEFT edge of the text
// y = vertical position of the TEXT BASELINE (not the top — the baseline)
```

**`ctx.font` format — CSS font shorthand:**
```
'[weight] [size]px [family]'
'bold 20px Arial'
'24px monospace'
'italic 16px sans-serif'
```

**The baseline — Y is not the top:**

```
  y=30 ─────────────────── ← the BASELINE (where letters sit)
        S C O R E            ← text appears above the baseline
        p g y                ← descenders hang below the baseline
```

If you want the top of text at pixel Y, set the fill position to `Y + fontSize`.
For text at the top of the canvas with 16px font:
`ctx.fillText('...', x, 20)` — baseline at 20, text top at approximately 4.

**`ctx.textAlign` — horizontal anchor:**
```js
ctx.textAlign = 'left';     // x is the left edge of the text (default)
ctx.textAlign = 'center';   // x is the center of the text
ctx.textAlign = 'right';    // x is the right edge of the text
```

For centered text on the canvas:
```js
ctx.textAlign = 'center';
ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
```

**Watch for:** `ctx.textAlign` persists between draws like `ctx.fillStyle`.
Always set it before drawing text. If you draw centered text and forget to
reset to `'left'` afterward, your next text call will be centered unexpectedly.

---

## Concept: The Finite State Machine

**What it is:** A way of managing which "mode" the game is in. At any moment,
the game is in exactly ONE state. Events cause transitions between states.

**Our states:**
```
'playing'   → Normal gameplay. Update ship, bullets, asteroids.
'dead'      → Ship was just hit. Wait for respawn timer. Ship invisible.
'game_over' → All lives gone. Show game over screen. Wait for Enter key.
```

**Transitions:**
```
playing  → dead       : ship-asteroid collision with lives remaining
dead     → playing    : respawn timer expires
playing  → game_over  : ship-asteroid collision with no lives remaining
game_over → playing   : player presses Enter (restart)
```

**Implementation — a single string variable:**

```js
let gameState = 'playing';   // current state

function update() {
  if (gameState === 'playing') {
    updateShip();
    updateBullets();
    updateAsteroids();
    checkCollisions();
  } else if (gameState === 'dead') {
    updateRespawnTimer();
    updateBullets();
    updateAsteroids();
  }
  // In 'game_over': nothing updates (game is frozen)
}

function render() {
  // Draw asteroids, bullets regardless of state.
  // Draw ship only in 'playing' and when blink allows it.
  // Draw HUD always.
  // Draw game-over overlay only in 'game_over'.
}
```

**Pattern category:** Behavioral
**Official name:** Finite State Machine (FSM) / State Pattern (Gang of Four)
**Tradeoff:** More branches in code. Worth it — without an FSM, game modes
create deeply nested if-else chains that are hard to reason about.
**You will see this again in:** Any interactive system with modes — tool modes
in the Drawing App, game phases in future games.

---

## Concept: `ctx.globalAlpha` — Semi-Transparent Drawing

**What it is:** A canvas property (0.0 to 1.0) that controls the opacity of
everything drawn until changed:

```js
ctx.globalAlpha = 1.0;   // fully opaque (default)
ctx.globalAlpha = 0.5;   // 50% transparent
ctx.globalAlpha = 0.0;   // invisible
```

**Using it for the ship blink:**

When the ship is in the 'dead' state, it blinks (alternates between visible
and invisible). We use a frame counter:

```js
// respawnTimer: counts DOWN from RESPAWN_DURATION to 0 (frames).
// When respawnTimer > 0: ship is respawning, check blink phase.
// When respawnTimer = 0: ship is fully back, always visible.

const RESPAWN_DURATION = 120;   // 2 seconds at 60fps

function drawShip() {
  // Blink: every 6 frames, toggle visibility.
  // respawnTimer % 12 < 6 → visible for 6 frames, invisible for 6.
  if (gameState === 'dead' && respawnTimer % 12 < 6) {
    return;   // skip drawing this frame (invisible phase)
  }

  // ... rest of drawShip
}
```

**`ctx.globalAlpha` for the game-over overlay:**

A semi-transparent black rectangle dims the game behind "GAME OVER":
```js
ctx.globalAlpha = 0.6;
ctx.fillStyle   = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalAlpha = 1.0;   // ALWAYS reset after — forgetting causes all subsequent draws to be transparent
```

**Watch for:** `ctx.globalAlpha` is one of the most commonly forgotten resets.
If text or shapes suddenly appear semi-transparent, a missing reset is usually
the cause.

---

## Step 1 — Add Lives and Game State to the State Section

In `main.js`, update the state section:

```js
// ── Game state ─────────────────────────────────────────────────────────────────

let score              = 0;
let lives              = 3;        // start with 3 lives
let asteroidsDestroyed = 0;
let waveNumber         = 1;

// gameState: the current mode of the game.
// Valid values: 'playing', 'dead', 'game_over'
let gameState    = 'playing';

// respawnTimer: counts down from RESPAWN_DURATION to 0 after being hit.
// While > 0: ship is in 'dead' state (blinking / invulnerable).
let respawnTimer = 0;
const RESPAWN_DURATION = 120;   // 2 seconds at 60fps
```

---

## Step 2 — Update the State Machine in `update()`

Replace the current `update()` function:

```js
function update() {
  // ── State: game over ──────────────────────────────────────────────────────
  // Frozen — nothing updates. Wait for Enter key to restart.
  if (gameState === 'game_over') return;

  // ── State: dead (respawning) ──────────────────────────────────────────────
  if (gameState === 'dead') {
    respawnTimer -= 1;

    if (respawnTimer <= 0) {
      // Respawn complete: move ship to center, clear velocity, go back to playing.
      ship.x         = canvas.width  / 2;
      ship.y         = canvas.height / 2;
      ship.velocityX = 0;
      ship.velocityY = 0;
      gameState      = 'playing';
    }

    // Asteroids and bullets still move during respawn.
    updateBullets();
    updateAsteroids();
    return;   // ship does not move or fire during respawn
  }

  // ── State: playing ────────────────────────────────────────────────────────
  updateShip();
  updateBullets();
  updateAsteroids();
  checkCollisions();
}

// Extract ship update into its own function for clarity:
function updateShip() {
  if (keysHeld['ArrowLeft'])  ship.angle -= ROTATION_SPEED;
  if (keysHeld['ArrowRight']) ship.angle += ROTATION_SPEED;

  if (keysHeld['ArrowUp']) {
    ship.velocityX += Math.sin(ship.angle) * THRUST_FORCE;
    ship.velocityY -= Math.cos(ship.angle) * THRUST_FORCE;
  }

  const speed = Math.sqrt(ship.velocityX ** 2 + ship.velocityY ** 2);
  if (speed > MAX_SPEED) {
    ship.velocityX = (ship.velocityX / speed) * MAX_SPEED;
    ship.velocityY = (ship.velocityY / speed) * MAX_SPEED;
  }

  ship.velocityX *= DRAG;
  ship.velocityY *= DRAG;
  ship.x         += ship.velocityX;
  ship.y         += ship.velocityY;
  ship.x          = (ship.x + canvas.width)  % canvas.width;
  ship.y          = (ship.y + canvas.height) % canvas.height;

  if (fireCooldown > 0) fireCooldown -= 1;
  if (keysHeld['Space'] && fireCooldown === 0) {
    fireBullet();
    fireCooldown = FIRE_COOLDOWN;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x  += bullet.velocityX;
    bullet.y  += bullet.velocityY;
    bullet.x   = (bullet.x + canvas.width)  % canvas.width;
    bullet.y   = (bullet.y + canvas.height) % canvas.height;
    bullet.lifetime -= 1;
    if (bullet.lifetime <= 0) bullets.splice(i, 1);
  }
}

function updateAsteroids() {
  for (const asteroid of asteroids) {
    asteroid.x             += asteroid.velocityX;
    asteroid.y             += asteroid.velocityY;
    asteroid.x              = (asteroid.x + canvas.width)  % canvas.width;
    asteroid.y              = (asteroid.y + canvas.height) % canvas.height;
    asteroid.rotationAngle += asteroid.spinSpeed;
  }
}
```

---

## Step 3 — Update `checkCollisions` for Lives

In `checkCollisions()`, update the ship-asteroid section:

```js
  // ── Ship–asteroid ──────────────────────────────────────────────────────────
  // Only check when playing (not while already dead/respawning).
  if (gameState === 'playing') {
    const SHIP_COLLISION_RADIUS = 12;

    for (const asteroid of asteroids) {
      const dx = asteroid.x - ship.x;
      const dy = asteroid.y - ship.y;
      const radiusSum = SHIP_COLLISION_RADIUS + asteroid.radius;

      if (dx*dx + dy*dy < radiusSum * radiusSum) {
        lives -= 1;

        if (lives <= 0) {
          // No lives left — game over.
          lives     = 0;
          gameState = 'game_over';
        } else {
          // Still have lives — start respawn.
          gameState    = 'dead';
          respawnTimer = RESPAWN_DURATION;
        }
        break;
      }
    }
  }
```

---

## Step 4 — Add Enter Key to Restart

In the `keydown` event listener, add restart logic:

```js
document.addEventListener('keydown', (event) => {
  keysHeld[event.code] = true;
  event.preventDefault();

  // Restart: Enter key when game over.
  if (event.code === 'Enter' && gameState === 'game_over') {
    restartGame();
  }
});
```

Add the `restartGame` function:

```js
// restartGame: resets all game state to starting conditions.
// Called when the player presses Enter on the game-over screen.
function restartGame() {
  // Reset ship:
  ship.x         = canvas.width  / 2;
  ship.y         = canvas.height / 2;
  ship.angle     = 0;
  ship.velocityX = 0;
  ship.velocityY = 0;

  // Clear all active entities:
  bullets.length   = 0;   // .length = 0 empties an array without reassigning it
  asteroids.length = 0;   // (we cannot use = [] because bullets is const)

  // Reset game stats:
  score              = 0;
  lives              = 3;
  asteroidsDestroyed = 0;
  waveNumber         = 1;
  gameState          = 'playing';

  // Spawn initial wave:
  for (let i = 0; i < INITIAL_ASTEROID_COUNT; i++) {
    asteroids.push(createAsteroid());
  }
}
```

**`array.length = 0` to empty a `const` array:**

We cannot do `bullets = []` because `bullets` is `const`. Setting
`bullets.length = 0` empties the array in place — the variable still
points to the same array object, so `const` is not violated.

---

## Step 5 — Draw the HUD and Game Over Screen

Replace the `render()` function:

```js
function render() {
  // Clear:
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Game entities:
  drawAsteroids();
  drawBullets();
  drawShip();   // drawShip handles blink internally (see below)

  // HUD (always shown):
  drawHUD();

  // Overlays:
  if (gameState === 'game_over') drawGameOver();
}

function drawShip() {
  // Blink during respawn: invisible for alternating 6-frame intervals.
  // respawnTimer % 12: cycles 0→11, 0→11...
  // < 6: first half of each 12-frame cycle → invisible
  if (gameState === 'dead' && respawnTimer % 12 < 6) return;
  if (gameState === 'game_over') return;

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);

  ctx.beginPath();
  ctx.moveTo(0, SHIP_NOSE_Y);
  ctx.lineTo(SHIP_WING_X, SHIP_WING_Y);
  ctx.lineTo(SHIP_TAIL_INNER, SHIP_WING_Y - 3);
  ctx.lineTo(0, SHIP_WING_Y + 5);
  ctx.lineTo(-SHIP_TAIL_INNER, SHIP_WING_Y - 3);
  ctx.lineTo(-SHIP_WING_X, SHIP_WING_Y);
  ctx.closePath();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Thruster flame:
  if (keysHeld['ArrowUp'] && gameState === 'playing') {
    const flameLength = 12 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(-4, SHIP_WING_Y + 2);
    ctx.lineTo(4, SHIP_WING_Y + 2);
    ctx.lineTo(0, SHIP_WING_Y + flameLength);
    ctx.closePath();
    ctx.fillStyle = '#ff6600';
    ctx.fill();
  }

  ctx.restore();
}

function drawHUD() {
  // Score — top right:
  ctx.fillStyle = '#ffffff';
  ctx.font      = '20px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE  ${score}`, canvas.width - 20, 30);

  // Lives — top left, drawn as small ship triangles:
  ctx.textAlign = 'left';
  ctx.fillText('LIVES', 20, 30);

  for (let i = 0; i < lives; i++) {
    const lifeX = 80 + i * 20;
    const lifeY = 18;

    ctx.save();
    ctx.translate(lifeX, lifeY);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Wave number — top center:
  ctx.textAlign = 'center';
  ctx.font      = '14px monospace';
  ctx.fillStyle = '#666666';
  ctx.fillText(`WAVE ${waveNumber}`, canvas.width / 2, 24);

  // Reset textAlign to default after HUD drawing:
  ctx.textAlign = 'left';
}

function drawGameOver() {
  // Dim overlay:
  ctx.globalAlpha = 0.65;
  ctx.fillStyle   = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;   // ← ALWAYS reset globalAlpha after use

  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  ctx.textAlign = 'center';

  ctx.fillStyle = '#ff4444';
  ctx.font      = 'bold 52px monospace';
  ctx.fillText('GAME OVER', cx, cy - 30);

  ctx.fillStyle = '#ffffff';
  ctx.font      = '24px monospace';
  ctx.fillText(`SCORE  ${score}`, cx, cy + 20);

  ctx.fillStyle = '#888888';
  ctx.font      = '16px monospace';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', cx, cy + 60);

  ctx.textAlign = 'left';   // reset
}
```

---

### SAVE AND TRY

Save. Reload.

**You should see:** Score top-right, "LIVES" with 3 small ship triangles top-left,
wave number centered at top.

**Test being hit:** Fly into an asteroid. Ship disappears and blinks for 2 seconds,
then reappears at center. Lives count drops by 1.

**Test game over:** Fly into asteroids until all 3 lives are gone. "GAME OVER" screen
appears with your score. Press Enter — game restarts from scratch.

**In DevTools Console:**
```js
lives
```
Check after being hit — should decrease by 1.

```js
gameState
```
Should be `'playing'`, `'dead'`, or `'game_over'` depending on current phase.

**Change something:** Change `RESPAWN_DURATION = 120` to `RESPAWN_DURATION = 30`.
Save. The ship blinks for only 0.5 seconds after being hit. Change back to `120`.

---

## 🎯 Challenge: Show "WAVE CLEAR!" Message When Clearing a Wave

**Current behavior:** When all asteroids are destroyed, a new wave spawns
silently. The player doesn't know they cleared a wave.

**Your task:** When a wave is cleared, briefly show "WAVE CLEAR!" text in the
center of the screen for 90 frames (1.5 seconds), then let the new wave spawn.

**Concept — a display timer:**
```js
let waveClearTimer = 0;   // frames remaining to show the "wave clear" message

// In render(), if waveClearTimer > 0: draw the message, decrement the timer.
// In checkCollisions(), when wave is cleared: set waveClearTimer = 90.
```

**Hints:**
1. Add `let waveClearTimer = 0` to the state section.
2. In the wave clear check in `checkCollisions()`, set `waveClearTimer = 90`
   before spawning the new wave. Actually — delay the new wave until the timer
   expires (spawn in `update()` when timer reaches 0 after being set).
3. In `drawGameOver` or alongside it, draw the text when `waveClearTimer > 0`.
4. Decrement `waveClearTimer` in `update()`.

---

<details>
<summary>▶ Solution — Wave Clear Message</summary>

State:
```js
let waveClearTimer      = 0;
let pendingWaveSpawn    = false;   // true when we've cleared but not yet spawned new wave
```

In `checkCollisions()`, replace the wave-clear block:
```js
  if (asteroids.length === 0 && gameState === 'playing') {
    waveNumber       += 1;
    waveClearTimer    = 90;      // show message for 90 frames
    pendingWaveSpawn  = true;    // flag: we need to spawn a new wave when timer expires
  }
```

In `update()`, at the end of the 'playing' block:
```js
  // Countdown wave clear timer:
  if (waveClearTimer > 0) {
    waveClearTimer -= 1;

    // Spawn new wave when the message finishes displaying:
    if (waveClearTimer === 0 && pendingWaveSpawn) {
      pendingWaveSpawn = false;
      const newCount = waveNumber + 1;
      for (let i = 0; i < newCount; i++) asteroids.push(createAsteroid());
    }
  }
```

In `render()`, after drawing the HUD:
```js
  // Wave clear overlay:
  if (waveClearTimer > 0) {
    // Fade: opacity decreases as timer approaches 0.
    ctx.globalAlpha = waveClearTimer / 90;   // 1.0 at full timer, 0 when expired
    ctx.fillStyle   = '#44ff88';
    ctx.font        = 'bold 36px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(`WAVE ${waveNumber} CLEAR!`, canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1.0;
    ctx.textAlign   = 'left';
  }
```

**Key insight:** `globalAlpha = waveClearTimer / 90` makes the text fade out as
the timer counts down. At frame 90: alpha = 1.0 (fully visible). At frame 45:
alpha = 0.5 (half transparent). At frame 0: alpha = 0 (gone). This is a common
pattern for smooth fade-outs using any countdown timer.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Score shown top-right | White number visible at top-right |
| Lives shown as ship triangles | 3 small triangles top-left |
| Wave number shown at top-center | "WAVE 1" visible |
| Being hit removes one life | Crash into asteroid — triangle disappears |
| Ship blinks during respawn | 2-second blink period after being hit |
| Ship respawns at center | After blinking: reappears at canvas center |
| Game over on last life | Losing 3rd life shows game over screen |
| Enter restarts game | Game over screen: Enter key starts fresh |
| Wave clear message shows | Clearing all asteroids shows brief message |
| `gameState` variable correct | Console check shows correct state at each phase |

---

## What Is Next — LAB 08

LAB 08 adds visual polish — explosion particles when asteroids are destroyed,
and a subtle starfield background. This introduces `ctx.globalAlpha` for
fading effects, and the particle system using the same entity-list pattern
already used for bullets and asteroids.

*Continue to 2D Asteroids — LAB 08 — Particles and Visual Polish.*
