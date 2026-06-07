# 2D Asteroids — LAB 08 — Particles and Visual Polish

**Read Asteroids2D-LAB-07.md first.** That lab added lives and game state.
This lab adds explosion particles and a starfield background — the visual
details that make the game feel finished.

**What this lab adds:**
- Particle explosions when asteroids are destroyed
- Starfield background (static stars)
- Ship destruction particles when the ship is hit
- Particles fade as they age (`ctx.globalAlpha`)

**What you will learn:**
- The particle system as another entity list (same pattern as bullets)
- Using `ctx.globalAlpha` for per-particle fade
- Drawing the starfield efficiently (generate once, draw every frame)
- Layered rendering: background → game objects → particles → HUD

**Time:** 45–60 minutes.

---

## What You Will Build

Shooting an asteroid causes an orange-white burst of debris that drifts outward
and fades over about 0.5 seconds. The ship leaves a blue particle burst when hit.
Stars fill the background — stationary, small white dots at varying brightness.
The game now looks and feels like Asteroids.

---

## Concept: The Particle — A Short-Lived Moving Dot

A particle is an entity list item with:
- Position (x, y)
- Velocity (velocityX, velocityY)
- Lifetime (how many frames remain)
- A display property that changes over time (color, size, or alpha)

```js
// Creating one particle:
{
  x:         explosionX,
  y:         explosionY,
  velocityX: Math.cos(randomAngle) * randomSpeed,
  velocityY: Math.sin(randomAngle) * randomSpeed,
  lifetime:  30,            // frames until gone
  maxLifetime: 30,          // stored for fade ratio calculation
  color:     '#ff8800',     // orange
  size:      2,             // radius in pixels
}
```

**Spawning multiple particles at once:**

When an asteroid is destroyed, we spawn N particles at the asteroid's position,
each flying in a different random direction:

```js
function spawnExplosion(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;          // any direction
    const speed = 1 + Math.random() * 3;               // 1–4 px/frame
    particles.push({
      x, y,
      velocityX:   Math.cos(angle) * speed,
      velocityY:   Math.sin(angle) * speed,
      lifetime:    20 + Math.floor(Math.random() * 15), // 20–35 frames
      maxLifetime: 35,
      color,
      size: 1 + Math.random() * 2,                     // 1–3 px radius
    });
  }
}
```

---

## Concept: Per-Particle Alpha Fade

Each particle fades from fully opaque to transparent as it ages.
The fade ratio: `particle.lifetime / particle.maxLifetime`

- At full lifetime (20/20): fade ratio = 1.0 → fully opaque
- At half lifetime (10/20): fade ratio = 0.5 → half transparent
- At zero lifetime (0/20):  fade ratio = 0.0 → invisible (and about to be removed)

Setting `ctx.globalAlpha` before drawing each particle:

```js
function drawParticles() {
  for (const particle of particles) {
    const fadeRatio = particle.lifetime / particle.maxLifetime;

    ctx.globalAlpha = fadeRatio;   // set transparency

    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;   // MUST reset after — always reset globalAlpha
}
```

**Watch for:** `ctx.globalAlpha` must be reset to `1.0` after the particle loop.
Otherwise every subsequent draw call (asteroids, ship, HUD) will also be
affected by the last particle's alpha.

---

## Concept: The Starfield — Generate Once, Draw Every Frame

**The approach:** Stars don't move. We generate their positions once at startup
(random x, y, and brightness) and store them in an array. Every frame, we draw
them all quickly.

**Why not regenerate each frame:**
```js
// BAD: Math.random() inside the game loop creates different stars every frame.
// Result: a flickering, randomly shifting field instead of fixed stars.
function render() {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;   // different position every frame!
    const y = Math.random() * canvas.height;
    ctx.fillRect(x, y, 1, 1);
  }
}
```

**Good: generate once:**
```js
// Generated ONCE when the script first runs:
const STAR_COUNT = 100;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x:          Math.random() * canvas.width,
  y:          Math.random() * canvas.height,
  brightness: 0.3 + Math.random() * 0.7,   // 30%–100% white
}));

// In render() — fast: just reads and draws:
function drawStarfield() {
  for (const star of stars) {
    ctx.globalAlpha = star.brightness;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(star.x, star.y, 1, 1);
  }
  ctx.globalAlpha = 1.0;
}
```

---

## Step 1 — Generate the Starfield

Add at the bottom of the constants section:

```js
// ── Starfield ─────────────────────────────────────────────────────────────────

const STAR_COUNT = 120;

// Generate star positions and brightness once.
// Array.from with a factory function: creates STAR_COUNT star objects.
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x:          Math.random() * canvas.width,
  y:          Math.random() * canvas.height,
  brightness: 0.2 + Math.random() * 0.8,   // dim to bright
}));
```

---

## Step 2 — Add the Particle Entity List

In the state section, add:

```js
const particles = [];   // entity list: all active explosion/effect particles
```

---

## Step 3 — Particle Functions

Add these functions alongside the existing draw functions:

```js
// spawnExplosion: creates a burst of particles at (x, y).
// count:   how many particles to spawn
// color:   color string for the particles (e.g., '#ff8800')
// speedMul: multiplier on particle speed (larger asteroids = bigger burst)
function spawnExplosion(x, y, count, color, speedMul = 1) {
  for (let i = 0; i < count; i++) {
    const angle    = Math.random() * Math.PI * 2;
    const speed    = (1 + Math.random() * 3) * speedMul;
    const lifetime = 20 + Math.floor(Math.random() * 15);   // 20–35 frames

    particles.push({
      x,
      y,
      velocityX:   Math.cos(angle) * speed,
      velocityY:   Math.sin(angle) * speed,
      lifetime,
      maxLifetime: lifetime,
      color,
      size:        0.8 + Math.random() * 1.8,   // 0.8–2.6 pixel radius
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x        += p.velocityX;
    p.y        += p.velocityY;
    p.lifetime -= 1;

    // Gentle drag: particles slow slightly as they age.
    p.velocityX *= 0.97;
    p.velocityY *= 0.97;

    if (p.lifetime <= 0) particles.splice(i, 1);
  }
}

function drawStarfield() {
  for (const star of stars) {
    ctx.globalAlpha = star.brightness;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(star.x, star.y, 1, 1);
  }
  ctx.globalAlpha = 1.0;
}

function drawParticles() {
  for (const particle of particles) {
    // Fade based on remaining lifetime:
    ctx.globalAlpha = particle.lifetime / particle.maxLifetime;
    ctx.fillStyle   = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;   // ← ALWAYS reset
}
```

---

## Step 4 — Spawn Particles on Asteroid Destruction

In `checkCollisions()`, in the bullet-asteroid hit block, after
`asteroidsToRemove.add(ai)`:

```js
        // Spawn particles at the asteroid's position.
        // Particle count and color depend on size:
        const particleConfig = {
          large:  { count: 16, color: '#ff8800', speedMul: 1.5 },
          medium: { count: 10, color: '#ff6600', speedMul: 1.2 },
          small:  { count: 6,  color: '#ffaa44', speedMul: 1.0 },
        };
        const config = particleConfig[asteroid.size];
        spawnExplosion(asteroid.x, asteroid.y, config.count, config.color, config.speedMul);
```

In the ship-asteroid collision block, after detecting the hit:

```js
        // Spawn ship destruction particles (blue/white):
        spawnExplosion(ship.x, ship.y, 20, '#88aaff', 1.2);
```

---

## Step 5 — Update the Game Loop

In `update()`, add:
```js
  updateParticles();   // add this to both 'playing' and 'dead' states
```

In `render()`, update to draw in the correct layer order:

```js
function render() {
  // Layer 1: clear (black background)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Layer 2: starfield (drawn first — behind everything)
  drawStarfield();

  // Layer 3: game entities
  drawAsteroids();
  drawBullets();
  drawShip();

  // Layer 4: particles (drawn ON TOP of game entities — they appear in front)
  drawParticles();

  // Layer 5: HUD (always on top)
  drawHUD();

  // Layer 6: overlays (game over screen, wave clear message)
  if (gameState === 'game_over') drawGameOver();
  if (waveClearTimer > 0)        drawWaveClear();
}
```

The order matters: stars behind everything, particles in front of asteroids
(explosions appear over the rock, not behind it), HUD always topmost.

---

### SAVE AND TRY

Save. Reload.

**You should see:**
- Stars scattered across the black background
- Shooting asteroids: orange particle burst at the hit location
- Being hit: blue/white burst at the ship's position
- Particles drift outward and fade to invisible
- Stars always visible behind everything

**In DevTools Console, while shooting:**
```js
particles.length
```
Should climb during active shooting (up to ~40–50), drop during pauses.

**Change something:** Change the large asteroid particle count from `16` to `50`.
Save. Large asteroids create a dramatically bigger explosion. Change back to `16`.

---

## 🎯 Challenge: Add Muzzle Flash When Firing

A brief white flash at the ship's nose when a bullet is fired — the standard
game effect for firing a weapon.

**Your task:** In `fireBullet()`, spawn 4–5 small white particles at the bullet's
starting position, moving outward from the ship nose.

**Hints:**
1. Call `spawnExplosion(bulletX, bulletY, 5, '#ffffff', 0.5)` at the end of
   `fireBullet()`. `bulletX` and `bulletY` are already computed in that function.
2. Reduce the spread by using a lower `speedMul` (0.3–0.5) so the flash is tight.
3. The particles are very short-lived by default — they disappear quickly, creating
   the "flash" effect without lingering.

---

<details>
<summary>▶ Solution — Muzzle Flash</summary>

At the end of `fireBullet()`:

```js
  // Muzzle flash: tiny white particles at the bullet origin.
  // speedMul = 0.4: tight burst, not a large explosion.
  spawnExplosion(bulletX, bulletY, 5, '#ffffff', 0.4);
```

That's the complete solution — one line. `spawnExplosion` already handles
all the random direction/size/lifetime logic.

**Key insight:** This is the reuse payoff from building a good general function.
`spawnExplosion(x, y, count, color, speedMul)` works for asteroid explosions,
ship destruction, AND muzzle flashes — just with different parameters. When you
see similar visual effects in different contexts, they usually share the same
underlying function.

</details>

---

## 🎯 Challenge: Add Thruster Trail Particles

While holding the Up arrow, emit particles from the ship's tail — a cyan/white
thruster trail.

**Your task:** In `updateShip()`, when the Up arrow is held and the game is
playing, spawn 1–2 particles per frame at the position behind the ship's tail.

**Concept — computing the tail position in world space:**

The tail is at `(0, SHIP_WING_Y + 5)` in local space. To convert to world space:
```js
const tailWorldX = ship.x + Math.sin(ship.angle + Math.PI) * 15;   // opposite of nose direction
const tailWorldY = ship.y - Math.cos(ship.angle + Math.PI) * 15;
```

Adding `Math.PI` to the angle gives the opposite direction (the tail).

**Hints:**
1. Spawn 1–2 particles per frame at the tail position.
2. Use color `'#44aaff'` (light blue) or `'#aaddff'`.
3. Use low `speedMul` (0.3) — thruster trail should be subtle.
4. Only spawn when `gameState === 'playing'` (not during respawn or game over).

---

<details>
<summary>▶ Solution — Thruster Trail</summary>

In `updateShip()`, after the Up arrow thrust block:

```js
  // Thruster trail particles:
  if (keysHeld['ArrowUp'] && gameState === 'playing') {
    // Tail position: opposite direction from nose, 15px from center.
    const tailX = ship.x + Math.sin(ship.angle + Math.PI) * 15;
    const tailY = ship.y - Math.cos(ship.angle + Math.PI) * 15;

    // Spawn 2 particles per frame at the tail:
    for (let i = 0; i < 2; i++) {
      // Particle angle: biased toward the tail direction, with spread.
      const particleAngle = (ship.angle + Math.PI) + (Math.random() - 0.5) * 0.8;
      const speed         = 0.5 + Math.random() * 1.5;
      const lifetime      = 8 + Math.floor(Math.random() * 8);

      particles.push({
        x:           tailX,
        y:           tailY,
        velocityX:   Math.sin(particleAngle) * speed,
        velocityY:  -Math.cos(particleAngle) * speed,
        lifetime,
        maxLifetime: lifetime,
        color:       '#44aaff',
        size:        0.8 + Math.random() * 1.2,
      });
    }
  }
```

**Key insight:** The thruster trail uses the same `particles` array and the
same `updateParticles()` / `drawParticles()` code. We don't need a separate
"thruster trail" system — it's just different parameters to the same entity list.
This is the core benefit of the entity list pattern: all particles, regardless
of source, are managed identically.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Starfield visible on black background | ~120 dim white dots at startup |
| Stars stay fixed (don't move) | Watch for 5 seconds — stars don't drift |
| Asteroid explosion spawns particles | Shoot asteroid — orange burst at impact |
| Large asteroids make bigger explosions | Compare large vs small hit effects |
| Ship destruction spawns blue particles | Crash into asteroid — blue burst |
| Particles fade as they age | Watch a burst after it appears — fades to invisible |
| Muzzle flash on firing | Brief white dot at ship nose each shot |
| Thruster trail while pressing Up | Light blue trail behind ship while thrusting |
| HUD still visible on top | Score and lives always readable |
| No alpha bleed | Asteroids/ship are fully opaque (globalAlpha resets working) |

---

## What Is Next — LAB 09

LAB 09 adds synthesized sound effects using the Web Audio API — shooting,
explosion, and thruster sounds without any audio files. This is the same pattern
used in the Pac-Man series and Geometry Wars: create an `AudioContext`, build
oscillators, shape their volume with gain envelopes. Then LAB 10 completes the
game with a high score system and a full review of every pattern used.

*Continue to 2D Asteroids — LAB 09 — Sound Effects.*
