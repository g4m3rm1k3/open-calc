# PhaserJS — LAB 07 — Design Patterns

**Prerequisites:** LAB 06 (Finite State Machine). You have a complete game with title, playing, paused, and game over states. You know: FSM, switch statements, data-driven dispatch, arrays, closures (functions defined inside other functions), callbacks (functions passed as values).

**What this lab adds:**
- The **Observer Pattern** — a reusable event system replacing direct function calls
- The **Strategy Pattern** — each asteroid tier gets its own movement behaviour
- A refactored, extensible codebase you could hand to another developer

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Right now, `checkBulletAsteroidCollisions` calls `splitAsteroid` directly. What is the problem with this if you want to also play a sound effect, trigger a screen shake, and add a particle explosion when an asteroid is hit — all in different files?
> 2. In LAB 05, `ASTEROID_TIERS` stored different radii and speeds per tier. What would you need to change to make each tier move in a *different pattern* (not just a different speed)?
> 3. A "Strategy" is a swappable behaviour. Name two things in your current game that behave differently depending on context — things that already use different "strategies" implicitly.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The game looks and plays the same as LAB 06. But the code underneath changes significantly:

```
Before (LAB 06):                    After (LAB 07):
─────────────────────────────────   ─────────────────────────────────
checkBulletAsteroidCollisions()     checkBulletAsteroidCollisions()
  └─ directly calls:                  └─ emits: events.emit('asteroidHit', asteroid)
       splitAsteroid()                        ↓
       score += ...                  Any subscriber hears it:
       flashFrames = 30               ├─ scoreSystem.onAsteroidHit()
                                      ├─ splitAsteroid()
                                      └─ (future) soundSystem.onAsteroidHit()
```

Large asteroids orbit a fixed point instead of drifting in straight lines. Medium asteroids drift as before. Small asteroids move in a sine-wave pattern — a different strategy per tier.

---

## Concept: Observer Pattern

**What it is:** A design pattern where one object (the **Subject** or **EventEmitter**) maintains a list of interested parties (**Observers** or **Subscribers**) and notifies all of them when something happens — without knowing who they are or how many there are.

**Pattern category:** Behavioral

**Official name:** Observer (Gang of Four, 1994)

**The problem before — tight coupling:**
```js
// checkBulletAsteroidCollisions knows about everything it needs to notify:
function checkBulletAsteroidCollisions() {
  // ... collision logic ...
  if (hit) {
    splitAsteroid(asteroid);   // coupled to split logic
    score += SCORE_TABLE[...]; // coupled to score system
    flashFrames = 30;          // coupled to flash system
    // To add sound: add another line here — modifying this function
    // To add particles: add another line here — modifying this function
    // Every addition requires editing the collision function. It grows without bound.
  }
}
```

**The pain:** The collision function has to know about every consequence of a collision. Adding a new consequence (sound, particles, achievements) means editing a function that should only know about *detecting* collisions.

**The solution:**
```js
// Collision function only knows ONE thing — how to emit an event:
function checkBulletAsteroidCollisions() {
  if (hit) {
    events.emit('asteroidHit', asteroid); // broadcast: "an asteroid was hit"
    // That's all. This function's job is done.
  }
}

// Consequences are registered SEPARATELY, by whoever cares:
events.on('asteroidHit', (asteroid) => { splitAsteroid(asteroid); });
events.on('asteroidHit', (asteroid) => { score += SCORE_TABLE[asteroid.tier]; });
// Adding sound: events.on('asteroidHit', () => { sound.play('explosion'); });
// Adding particles: events.on('asteroidHit', (a) => { spawnParticles(a.x, a.y); });
// The collision function never changes.
```

**What it hides:**
The Observer pattern hides the list of subscribers from the emitter. The invariant: **the emitter never knows who is listening or how many listeners exist** — it always calls `events.emit(name, data)` the same way, regardless of whether 0 or 100 things are subscribed. Subscribers are added and removed independently without touching the emitter.

**Canonical example (General Explanation):**

A newspaper publisher. It prints papers and delivers them to everyone on the subscription list. It doesn't know who the subscribers are — it just delivers. Subscribers sign up and cancel independently. Adding a new subscriber doesn't change how the newspaper is printed.

```js
// General implementation:
const events = {
  subscribers: {},  // { eventName: [callback, callback, ...] }

  on(eventName, callback) {
    // 'on' means: "when this event fires, call this function"
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = []; // create list if first subscriber
    }
    this.subscribers[eventName].push(callback);
  },

  emit(eventName, data) {
    // 'emit' means: "this event just happened — notify all subscribers"
    const callbackList = this.subscribers[eventName] || [];
    for (let i = 0; i < callbackList.length; i++) {
      callbackList[i](data); // call each subscriber with the event data
    }
  },
};

// Usage:
events.on('asteroidHit', (asteroid) => console.log('hit!', asteroid.tier));
events.emit('asteroidHit', { tier: 'large' }); // logs: "hit! large"
```

**Project Application (The "Why" here):**
`checkBulletAsteroidCollisions` currently does too many things. We'll make it emit one event and nothing else. Score updates, splits, and flash effects become separate subscribers. The collision function is now testable in isolation — you can test "does this detect the hit?" without any of the consequences running.

**Tradeoff:** The Observer pattern makes code less immediately readable (you have to find all `events.on('asteroidHit', ...)` calls to understand what happens on a hit). It's worth this cost when the number of consequences is large or varies over time. For two or three consequences, direct calls are often clearer.

**You will see this again in:** Every browser DOM event (`addEventListener`) is Observer pattern. Every game engine's event system (Phaser's `this.events.on`, Unity's `UnityEvent`) is Observer pattern. React's `useEffect` with dependencies is a constrained Observer.

---

### Concept: Closure

**What it is:** A function that "closes over" (captures and remembers) variables from its surrounding scope, even after that scope has finished executing.

**Why it must be taught here:** Arrow functions used as Observer callbacks are closures — they capture variables from the surrounding scope. Without understanding this, the callbacks appear to use "magic" variables.

**The problem before (without understanding closures):**
```js
let score = 0;

// This works, but why? The callback is created when events.on is called,
// but it runs later — when emit fires. How does it still see 'score'?
events.on('asteroidHit', (asteroid) => {
  score += SCORE_TABLE[asteroid.tier]; // 'score' is from outer scope — is it available?
});
```

**The solution — what's actually happening:**

A closure captures a **reference** to the variable — not a copy of its value. When the callback runs later, it reads `score`'s CURRENT value (not its value when the closure was created).

```js
let counter = 0;

function makeAdder() {
  // counter is captured here — but by reference, not by value
  return function() {
    counter += 1;        // reads/writes the CURRENT counter, not a snapshot
    return counter;
  };
}

const add = makeAdder();
add(); // 1  — counter is now 1
add(); // 2  — counter is now 2
counter = 100;
add(); // 101 — captured counter, not a copy; reflects the assignment
```

**What it hides:**
Closures hide the need to explicitly pass state around as parameters. Instead of `callback(score, SCORE_TABLE, asteroid)`, the callback simply reads `score` and `SCORE_TABLE` from the scope where it was defined.

**Why it matters here:** Every Observer callback in this lab is a closure. When `score += SCORE_TABLE[asteroid.tier]` runs inside the callback, it updates the actual `score` variable in the outer scope — not a copy.

**Watch for:** Closures capture the **variable** (reference), not the **value**. This matters in loops — creating closures in a `for` loop over `let` works correctly (each iteration's `let` is a fresh binding), but over `var` (which is function-scoped, not block-scoped) can cause bugs.

---

## Step 1 — Copy LAB 06 Files

Create a new folder called `phaser-lab-07`. Copy `index.html`, `style.css`, and `main.js` from `phaser-lab-06`.

### SAVE AND TRY

Open `index.html`. Full game with FSM — title screen, playing, paused, game over — all working as per LAB 06.

---

## Step 2 — Build the Event Emitter

Add the event system to `main.js`. Place it directly after the constants block, before any state variables:

```js
// ─── Event Emitter ────────────────────────────────────────────────────────────
// Observer Pattern: a shared event bus that decouples emitters from subscribers.
const events = {
  subscribers: {},
  // An object used as a dictionary: { 'eventName': [callback, callback, ...] }
  // Starts empty — subscribers register themselves via events.on()

  on(eventName, callback) {
    // Register a subscriber: "when eventName fires, call callback"
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
      // First subscriber for this event — create the list
    }
    this.subscribers[eventName].push(callback);
    // Add callback to the list — all callbacks are called when the event fires
  },

  emit(eventName, data) {
    // Fire an event: call every callback registered for eventName
    const callbackList = this.subscribers[eventName] || [];
    // '|| []' handles the case where no subscribers exist — avoids iterating undefined
    for (let subscriberIndex = 0; subscriberIndex < callbackList.length; subscriberIndex++) {
      callbackList[subscriberIndex](data);
      // Call each subscriber, passing the event data
      // Subscribers can use or ignore 'data' — they decide
    }
  },
};
```

### SAVE AND TRY

Save. Refresh. Game should work exactly as before — we only added the `events` object, nothing uses it yet.

**In DevTools Console:**
```js
events.on('test', (data) => console.log('Received:', data));
events.emit('test', { message: 'hello!' });
```
**Expected:** `Received: { message: 'hello!' }` — the callback fires immediately.

```js
events.on('test', (data) => console.log('Second subscriber:', data.message));
events.emit('test', { message: 'world' });
```
**Expected:** BOTH subscribers fire: `Received: { message: 'world' }` AND `Second subscriber: world`. The emitter called all registered callbacks.

---

## Step 3 — Emit `asteroidHit` from Collision Detection

Now we wire the collision function to emit an event instead of calling consequences directly.

**Update `checkBulletAsteroidCollisions` — find the hit block:**

```js
// Before (direct calls — remove these consequence calls):
if (circlesOverlap(...)) {
  hitAsteroidIndices.add(asteroidIndex);
  splitAsteroid(asteroid);   // ← REMOVE direct call
  bulletHit = true;
  break;
}
```

**Replace with:**

```js
if (circlesOverlap(
  bullets[bulletIndex].x, bullets[bulletIndex].y, BULLET_RADIUS,
  asteroid.x, asteroid.y, asteroid.radius
)) {
  hitAsteroidIndices.add(asteroidIndex);
  events.emit('asteroidHit', asteroid); // ← ADD: broadcast the hit event with asteroid data
  // The collision function no longer knows what happens next.
  // Any registered subscriber will respond.
  bulletHit = true;
  break;
}
```

### SAVE AND TRY

Save. Refresh. Start game. Shoot an asteroid.

**You should see:** The asteroid disappears but does NOT split (no children appear). Score doesn't change. This is expected — we removed the direct calls but haven't registered subscribers yet.

**In DevTools Console:**
```js
// Manually register a test subscriber:
events.on('asteroidHit', (asteroid) => console.log('Hit!', asteroid.tier, 'at', asteroid.x.toFixed(0), asteroid.y.toFixed(0)));
```
Now shoot an asteroid. **Expected:** Console prints `Hit! large at 432 287` (or similar). The event is firing — nothing is acting on it yet.

---

## Step 4 — Register Subscribers

Now re-add the consequences as independent event subscribers. Place these after `processSpawnQueue` and before `update`:

```js
// ─── Event Subscribers ────────────────────────────────────────────────────────
// These run in the order they are registered — split first, then score, then flash.

events.on('asteroidHit', (asteroid) => {
  splitAsteroid(asteroid);
  // Split the asteroid into children (or destroy if small tier).
  // This subscriber handles the game-world consequence.
});

events.on('asteroidHit', (asteroid) => {
  score += SCORE_TABLE[asteroid.tier];
  // Award points for this hit.
  // This subscriber handles the scoring consequence.
});

events.on('asteroidHit', () => {
  flashFrames = Math.max(flashFrames, 10);
  // Trigger a brief screen flash.
  // Math.max ensures a longer existing flash isn't shortened by a new hit.
  // This subscriber handles the visual feedback consequence.
});
```

### SAVE AND TRY

Save. Refresh. Start game. Shoot asteroids.

**You should see:** Everything works exactly as LAB 06 — asteroids split, score increments, screen flashes. The game is identical from the player's perspective. The only change is architectural: consequences are now decoupled from detection.

**In DevTools Console:**
```js
// Count the subscribers:
events.subscribers['asteroidHit'].length
```
**Expected:** `3` — the three subscribers we just registered.

```js
// Add a fourth — a debug logger:
events.on('asteroidHit', (a) => console.log('Scored', SCORE_TABLE[a.tier], '— total:', score));
```
Shoot an asteroid. **Expected:** Console logs the points scored without any change to the collision function.

---

## 🎯 Challenge: Ship Hit Event

**You know:** `events.emit`, `events.on`, and how to decouple detection from consequences.

**Task:** Refactor `checkShipAsteroidCollisions` to emit a `'shipHit'` event instead of directly resetting the ship and decrementing lives. Register two subscribers: one that resets the ship position, and one that handles lives/game-over logic.

**Starting code:**
```js
// The current checkShipAsteroidCollisions body — refactor this:
function checkShipAsteroidCollisions() {
  if (invincibleFrames > 0) return;
  for (let ai = 0; ai < asteroids.length; ai++) {
    if (circlesOverlap(ship.x, ship.y, SHIP_SIZE,
                       asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
      // Currently: directly resets ship, decrements lives, sets game state
      // Change to: events.emit('shipHit', { x: ship.x, y: ship.y })
    }
  }
}
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// ─── checkShipAsteroidCollisions — refactored ─────────────────────────────────
function checkShipAsteroidCollisions() {
  if (invincibleFrames > 0) return;
  for (let ai = 0; ai < asteroids.length; ai++) {
    if (circlesOverlap(ship.x, ship.y, SHIP_SIZE,
                       asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
      events.emit('shipHit', { x: ship.x, y: ship.y }); // ← emit with position data
      break; // still only process one hit per frame
    }
  }
}

// ─── Subscribers (add alongside the asteroidHit subscribers) ─────────────────
events.on('shipHit', () => {
  // Reset ship position and velocity
  ship.x = canvas.width / 2; ship.y = canvas.height / 2;
  ship.vx = 0; ship.vy = 0; ship.angle = 0;
  flashFrames      = 20;
  invincibleFrames = 180;
});

events.on('shipHit', () => {
  // Handle lives and game over
  lives -= 1;
  if (lives <= 0) {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('asteroidHighScore', highScore.toString());
    }
    gameState = 'gameOver';
  }
});
```

**Key insight:** By emitting `{ x: ship.x, y: ship.y }` with the event, any subscriber (now or in the future) can use the hit location — for example, a particle system that spawns an explosion at the exact impact point. The subscriber that needs position uses it; the one that only cares about lives ignores the data. This is the power of passing rich event data: subscribers take only what they need.

</details>

---

## Concept: Strategy Pattern

**What it is:** A design pattern where a family of algorithms (behaviours) are defined separately and made interchangeable. The object that uses a behaviour doesn't know which specific one it has — it just calls it.

**Pattern category:** Behavioral

**Official name:** Strategy (Gang of Four, 1994)

**The problem before:**
```js
// Current asteroid movement — one behaviour for all tiers:
function updateAsteroid(asteroid) {
  asteroid.x += asteroid.vx; // drift in a straight line
  asteroid.y += asteroid.vy;
  // All asteroids move identically regardless of tier.
  // To add tier-specific movement, we'd add an if/else in this function:
  if (asteroid.tier === 'large') { /* orbit */ }
  else if (asteroid.tier === 'medium') { /* drift */ }
  else if (asteroid.tier === 'small') { /* sine wave */ }
  // This function grows with every new behaviour added.
  // The behaviours are coupled to the function — can't reuse them elsewhere.
}
```

**The solution:** Store a movement function ON the asteroid object. Call it — regardless of what it is.

```js
// Each asteroid carries its own movement function:
asteroid.moveFn = orbitMovement; // or driftMovement, or sineMovement

// The update loop calls it without knowing which:
function updateAsteroid(asteroid) {
  asteroid.moveFn(asteroid); // calls whatever function is stored
}
// The update loop never changes when you add new movement types.
// Adding a new behaviour = writing a new function + storing it on creation.
```

**What it hides:**
The Strategy pattern hides the selection logic for which algorithm to use. The invariant: **the caller always calls `asteroid.moveFn(asteroid)` and gets correct movement** — it never needs to check `asteroid.tier` to decide what to call.

**Canonical example (General Explanation):**

A GPS navigation app offers multiple route strategies: Fastest, Shortest, Avoid Tolls. The driver selects one. The app applies it when calculating the route — but the driving UI is the same regardless of which strategy is active. Strategies are swappable; the surrounding system is stable.

```js
const strategies = {
  fastest:     (origin, dest) => { /* highway-heavy route */ },
  shortest:    (origin, dest) => { /* fewest kilometres */ },
  avoidTolls:  (origin, dest) => { /* no toll roads */ },
};

// The caller chooses a strategy and calls it the same way regardless:
const route = strategies[userChoice](origin, destination);
```

**Project Application (The "Why" here):**
Each asteroid tier will have a different movement function stored in `ASTEROID_TIERS`. When an asteroid is created, it gets assigned its tier's `moveFn`. The update loop calls `asteroid.moveFn(asteroid)` — no tier checks needed.

**Tradeoff:** Strategy adds indirection — you must find the strategy function definition to understand what `moveFn` does. Worth the cost when: there are 3+ strategies, they're likely to change independently, or new strategies will be added.

**You will see this again in:** Sorting algorithms (sort by name vs. by date vs. by size), rendering pipelines (forward vs. deferred), enemy AI (patrol vs. chase vs. flee), physics integrators (Euler vs. Verlet vs. RK4).

---

### Math: Sine Wave Motion

**What it computes:** A smooth oscillating displacement — moving back and forth in a regular wave pattern.

**The real-world analogy:** A buoy on water. It doesn't drift in a straight line — it bobs up and down as waves pass. The bobbing height follows a sine wave over time.

**Canonical example:**

```
time:  0    1    2    3    4    5    6    7    8
sin:   0   0.84  0.91  0.14 -0.76 -0.96 -0.28  0.66  0.99
                 ▲ peak                ▼ trough
```

Each tick, `Math.sin(time)` oscillates between -1 and +1 in a smooth wave.

Applied to an asteroid's y-position:
```js
// asteroid.phase: a per-asteroid starting offset (so not all smalls sync up)
// asteroid.time:  increments every frame

asteroid.y += Math.sin(asteroid.time + asteroid.phase) * SINE_AMPLITUDE;
// asteroid.y oscillates above and below its baseline position
// SINE_AMPLITUDE controls how tall the wave is
asteroid.time += SINE_FREQUENCY;
// SINE_FREQUENCY controls how fast the wave cycles
```

**Why it matters here:** Small asteroids use sine-wave Y displacement on top of their regular drift — they snake across the screen instead of flying straight.

**Watch for:** `Math.sin` returns values between -1 and +1. To control the amplitude (height) of the wave, multiply the result. To control the frequency (speed of oscillation), scale the input angle.

---

## Step 5 — Write the Three Movement Strategies

**Add constants for sine-wave movement:**

```js
const SINE_AMPLITUDE  = 1.5;  // ← ADD: maximum pixels of sine-wave displacement per frame
const SINE_FREQUENCY  = 0.08; // ← ADD: how fast the wave cycles (radians per frame)
```

**Add three movement functions — place before `updatePlaying`:**

```js
// ─── Movement Strategies ──────────────────────────────────────────────────────

function driftMovement(asteroid) {
  // Straight-line drift — the original movement from earlier labs.
  asteroid.x += asteroid.vx;
  asteroid.y += asteroid.vy;
  // Simple: just apply velocity to position each frame.
}

function orbitMovement(asteroid) {
  // Large asteroids orbit a fixed point (their spawn position, stored as orbitCentreX/Y).
  asteroid.orbitAngle += asteroid.orbitSpeed;
  // Advance the orbit angle each frame — rotates around the centre point
  asteroid.x = asteroid.orbitCentreX + Math.cos(asteroid.orbitAngle) * asteroid.orbitRadius;
  asteroid.y = asteroid.orbitCentreY + Math.sin(asteroid.orbitAngle) * asteroid.orbitRadius;
  // Compute position from angle: same unit-circle math as ship thrust (LAB 03).
  // orbitRadius: how far from centre. orbitAngle: current position on the circle.
}

function sineWaveMovement(asteroid) {
  // Small asteroids: drift + sine-wave displacement in Y.
  asteroid.x += asteroid.vx; // drift horizontally as usual
  asteroid.y += asteroid.vy; // drift vertically as usual
  asteroid.phase += SINE_FREQUENCY;
  // phase accumulates each frame — drives the sine wave
  asteroid.y += Math.sin(asteroid.phase) * SINE_AMPLITUDE;
  // Add oscillating displacement to Y position — the "snake" effect
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** No visible change — the strategy functions are defined but not called yet (they're dead code at this point). No crash.

**In DevTools Console:**
```js
typeof driftMovement  // Expected: 'function'
typeof orbitMovement  // Expected: 'function'
```

---

## Step 6 — Store Strategies in the Tier Table

**Update `ASTEROID_TIERS` to include `moveFn`:**

```js
const ASTEROID_TIERS = {
  large:  { radius: 40, childTier: 'medium', childCount: 2, speed: 0.8,
            moveFn: orbitMovement  },   // ← ADD: large asteroids orbit
  medium: { radius: 22, childTier: 'small',  childCount: 2, speed: 1.4,
            moveFn: driftMovement  },   // ← ADD: mediums drift in straight lines
  small:  { radius: 12, childTier: null,      childCount: 0, speed: 2.0,
            moveFn: sineWaveMovement }, // ← ADD: smalls snake
};
```

**Important:** `ASTEROID_TIERS` references `orbitMovement`, `driftMovement`, and `sineWaveMovement` by name. This means the movement functions MUST be defined BEFORE `ASTEROID_TIERS` in the file. Move the movement strategy functions above the constants block, OR move `ASTEROID_TIERS` below the movement functions. The safest approach: move movement functions just before `ASTEROID_TIERS`.

---

## Step 7 — Assign `moveFn` at Spawn Time

When an asteroid is created, assign its movement function from the tier table and set any extra data the strategy needs.

**Update `spawnAsteroids`:**

```js
function spawnAsteroids() {
  asteroids = [];
  for (let asteroidIndex = 0; asteroidIndex < ASTEROID_COUNT; asteroidIndex++) {
    const tierData  = ASTEROID_TIERS['large'];
    const spawnX    = Math.random() * canvas.width;
    const spawnY    = Math.random() * canvas.height;
    const angle     = Math.random() * Math.PI * 2;
    const speed     = ASTEROID_MIN_SPEED + Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED);

    asteroids.push({
      x:             spawnX,
      y:             spawnY,
      radius:        tierData.radius,
      tier:          'large',
      vx:            Math.cos(angle) * speed,
      vy:            Math.sin(angle) * speed,
      moveFn:        tierData.moveFn,         // ← ADD: strategy assigned at spawn
      // Extra data for orbitMovement:
      orbitCentreX:  spawnX,                  // ← ADD: orbit around spawn point
      orbitCentreY:  spawnY,                  // ← ADD
      orbitAngle:    angle,                   // ← ADD: starting angle on the orbit
      orbitSpeed:    (Math.random() - 0.5) * 0.02, // ← ADD: small random orbit rate
      orbitRadius:   40 + Math.random() * 60, // ← ADD: orbit radius 40–100px
    });
  }
}
```

**Update `splitAsteroid` to also assign `moveFn` and any strategy data:**

```js
function splitAsteroid(asteroid) {
  score += SCORE_TABLE[asteroid.tier]; // (this moved to subscriber — remove from here)
  // Actually: in the subscriber version, score is updated by the subscriber.
  // splitAsteroid only handles the physical splitting.

  const tierData = ASTEROID_TIERS[asteroid.tier];
  if (tierData.childTier === null) return;

  for (let childIndex = 0; childIndex < tierData.childCount; childIndex++) {
    const childTierData = ASTEROID_TIERS[tierData.childTier];
    const spreadAngle   = (Math.random() - 0.5) * Math.PI;
    const parentAngle   = Math.atan2(asteroid.vy, asteroid.vx);
    const childAngle    = parentAngle + spreadAngle;
    const childX        = asteroid.x;
    const childY        = asteroid.y;

    spawnQueue.push({
      x:             childX,
      y:             childY,
      radius:        childTierData.radius,
      tier:          tierData.childTier,
      vx:            Math.cos(childAngle) * childTierData.speed,
      vy:            Math.sin(childAngle) * childTierData.speed,
      moveFn:        childTierData.moveFn,        // ← ADD: child gets its tier's strategy
      // Data for orbitMovement (used if child is large — normally won't be):
      orbitCentreX:  childX,
      orbitCentreY:  childY,
      orbitAngle:    childAngle,
      orbitSpeed:    (Math.random() - 0.5) * 0.02,
      orbitRadius:   30 + Math.random() * 40,
      // Data for sineWaveMovement (used if child is small):
      phase:         Math.random() * Math.PI * 2, // ← ADD: random starting phase
      // Each small asteroid starts its sine wave at a different point — no synchronised bobbing
    });
  }
}
```

### SAVE AND TRY

Save. Refresh. Start game.

**You should see:** Large asteroids orbit their spawn point in circles instead of drifting. Shoot a large — two medium pieces drift away in straight lines. Shoot a medium — two small pieces appear snaking in sine-wave paths.

**In DevTools Console:**
```js
asteroids[0].moveFn.name // Expected: 'orbitMovement'
asteroids[0].orbitRadius.toFixed(0) // Expected: a number between 40 and 100
```

**Change something:** Change `SINE_AMPLITUDE = 1.5` to `SINE_AMPLITUDE = 6`. Small asteroids snake wildly. Change it back.

---

## Step 8 — Use the Strategy in the Update Loop

**Update the asteroid movement loop in `updatePlaying`:**

```js
// ── Move Asteroids ──────────────────────────────────────────────────────────
for (let asteroidIndex = 0; asteroidIndex < asteroids.length; asteroidIndex++) {
  const asteroid = asteroids[asteroidIndex];
  asteroid.moveFn(asteroid); // ← was: asteroid.x += asteroid.vx; asteroid.y += asteroid.vy;
  // Call whichever movement strategy this asteroid has.
  // The update loop no longer cares which tier the asteroid is.

  // Wrap at edges — still needed for all movement types:
  asteroid.x = (asteroid.x + canvas.width)  % canvas.width;
  asteroid.y = (asteroid.y + canvas.height) % canvas.height;
}
```

### SAVE AND TRY

Save. Refresh. Start game.

**You should see:** Large asteroids orbit. Medium asteroids drift straight. Small asteroids snake. Each behaviour is distinct and visually clear.

**In DevTools Console:**
```js
// Swap a live asteroid's strategy at runtime:
asteroids[0].moveFn = sineWaveMovement;
asteroids[0].phase  = 0;
```
**Expected:** That asteroid immediately starts snaking — strategy changed at runtime with no other modifications.

---

## 🎯 Challenge: Add a Fourth Asteroid Tier

**You know:** Data-driven dispatch (tier table), Strategy pattern (moveFn), Observer pattern (event subscribers).

**Task:** Add a `'tiny'` tier that is created when a small is destroyed. Tiny asteroids are radius 6, move very fast (speed: 3.5), and spiral outward: each frame, their `orbitRadius` grows slightly and they orbit a fixed centre (reuse `orbitMovement` with a growing radius).

**Starting code:**
```js
// 1. Add to ASTEROID_TIERS:
const ASTEROID_TIERS = {
  // ... existing tiers ...
  tiny: { radius: 6, childTier: null, childCount: 0, speed: 3.5,
          moveFn: spiralMovement }, // create this function
};

// Update small's childTier:
small: { radius: 12, childTier: 'tiny', childCount: 3, speed: 2.0, ... }
//                            ↑ was: null        ↑ 3 tiny pieces

// 2. Write spiralMovement:
function spiralMovement(asteroid) {
  // orbit as usual, but increase orbitRadius each frame
}

// 3. Ensure splitAsteroid handles 'tiny' correctly (null childTier = destroy only)
```

**Hint:** In `spiralMovement`, add `asteroid.orbitRadius += 0.3` each frame before computing position. The spiral grows outward because the orbit radius increases while the angle continues rotating.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// ─── Spiral Movement Strategy ─────────────────────────────────────────────────
function spiralMovement(asteroid) {
  asteroid.orbitAngle  += asteroid.orbitSpeed; // advance angle
  asteroid.orbitRadius += 0.3;                 // spiral outward — radius grows
  asteroid.x = asteroid.orbitCentreX + Math.cos(asteroid.orbitAngle) * asteroid.orbitRadius;
  asteroid.y = asteroid.orbitCentreY + Math.sin(asteroid.orbitAngle) * asteroid.orbitRadius;
}

// ─── Updated ASTEROID_TIERS ───────────────────────────────────────────────────
const ASTEROID_TIERS = {
  large:  { radius: 40, childTier: 'medium', childCount: 2, speed: 0.8, moveFn: orbitMovement },
  medium: { radius: 22, childTier: 'small',  childCount: 2, speed: 1.4, moveFn: driftMovement },
  small:  { radius: 12, childTier: 'tiny',   childCount: 3, speed: 2.0, moveFn: sineWaveMovement },
  // ↑ was: childTier: null, childCount: 0
  tiny:   { radius: 6,  childTier: null,      childCount: 0, speed: 3.5, moveFn: spiralMovement },
};

// ─── SCORE_TABLE — add tiny ───────────────────────────────────────────────────
const SCORE_TABLE = { large: 20, medium: 50, small: 100, tiny: 200 };

// ─── splitAsteroid — spawnQueue entries for tiny need orbitSpeed/orbitRadius ──
// The existing splitAsteroid already adds these fields — no changes needed.
// When tiny is created from splitAsteroid, orbitCentreX/Y is set to child spawn position,
// orbitSpeed is random, orbitRadius starts at 10 (small starting radius for the spiral).
// Update the spawnQueue.push in splitAsteroid:
spawnQueue.push({
  // ... existing fields ...
  orbitRadius: 10, // ← override for tiny: start small, grow via spiralMovement
});
```

**Key insight:** Adding a new tier required: one new strategy function (`spiralMovement`), one new row in `ASTEROID_TIERS`, one new row in `SCORE_TABLE`, and changing `small.childTier` from `null` to `'tiny'`. The update loop, collision detection, rendering, and event system needed zero changes. This is the payoff of both Data-Driven Dispatch and the Strategy Pattern — extensibility without modification to existing code. In software engineering, this is called the **Open/Closed Principle**: open for extension, closed for modification.

</details>

---

## Mental Model: Separation of Concerns — The Completed Picture

Look at how the final file is structured:

```
Constants               — values only, no logic
Event system            — communication layer, no game knowledge
Game state              — data only, no functions
Input handlers          — reads input, fires events or transitions states
Spawn/management        — creates entities with correct initial data
Collision detection     — detects overlaps, emits events — no consequences
Event subscribers       — each consequence in its own independent function
Movement strategies     — each behaviour is a pure function of the asteroid
Draw functions          — only read state, never write it
State-specific update   — orchestrates the above per frame
State-specific render   — reads state and draws it, nothing else
Game loop               — calls update and render in the right order
```

**Data vs. Behaviour Separation** — the mental model: functions that READ state (render) are completely separate from functions that WRITE state (update). Event subscribers write state in response to events — but each one writes to a small, defined area.

**Why this matters professionally:** A codebase structured this way can be worked on by a team. One person owns the collision detection; another owns the score system; a third adds a new asteroid tier. None of them need to edit each other's code because consequences are decoupled via events, and behaviours are decoupled via strategies.

---

## Pattern: Data-Driven Dispatch — used again

**First seen in:** LAB 05 where `ASTEROID_TIERS` stored radius and speed per tier.

**Here it appears as:** `ASTEROID_TIERS` now stores `moveFn` — a function reference — per tier. The data table now carries not just values but behaviour.

**The difference:** In LAB 05, the table held scalar values (numbers, strings). Here, the table holds functions. This is the Strategy pattern realised through the Data-Driven Dispatch table — the two patterns compose naturally. The tier table is the dispatcher; the movement functions are the strategies.

---

## Final Check

| Feature | How to verify |
|---|---|
| Large asteroids orbit | Refresh, start game — larges move in circles, not straight lines |
| Medium asteroids drift | Shoot a large — two mediums drift in straight lines |
| Small asteroids snake | Shoot a medium — two smalls move in sine-wave paths |
| Event system fires | Console: `events.subscribers['asteroidHit'].length` → 3 |
| Score still works | Shoot asteroids — score increments as before |
| Split still works | Shooting large → mediums appear; medium → smalls appear |
| Ship hit event fires | Console: `events.on('shipHit', () => console.log('HIT'))` then fly into an asteroid |
| Strategy can swap at runtime | Console: `asteroids[0].moveFn = driftMovement` — asteroid changes movement immediately |
| Title / FSM still works | All LAB 06 screens still function correctly |
| New tier works (challenge) | Shoot a small — three tiny spiralling pieces appear |

---

## Complete Architecture Summary

You've built a complete game from scratch across 7 labs. Here is what each lab taught and how they connect:

| Lab | Feature Built | CS/SE Concept |
|---|---|---|
| 01 | Moving dot | Game loop, immediate rendering, modulo wrap |
| 02 | Keyboard-controlled dot | Vectors, unit vectors, normalisation, input state |
| 03 | Rotating ship with thrust | sin/cos, coordinate transforms, acceleration, drag |
| 04 | Bullets + collision | Arrays, filter, Big-O preview, distance formula, squared shortcut |
| 05 | Splitting asteroids + score | Big-O notation, Queue (FIFO), data-driven dispatch, probability |
| 06 | Title/pause/game over | Finite State Machine, switch statement, closures |
| 07 | Event system + strategies | Observer pattern, Strategy pattern, separation of concerns |

Every concept built on the previous one. The `vx/vy` velocity vector from LAB 02 became the direction of bullets in LAB 04. The `Math.cos/sin` from LAB 03 became the orbit movement strategy in LAB 07. The data-driven table from LAB 05 became the strategy dispatcher in LAB 07. The `flashFrames` timer from LAB 04 became the invincibility system in LAB 06.

This is software engineering: not isolated knowledge, but a connected structure where each piece supports the next.

---

## What's Next

You've completed the core series. From here, you can:

1. **Polish the game** — add sound (Web Audio API), high-score server (fetch + REST API), mobile touch controls
2. **Migrate to PhaserJS** — the same concepts apply; Phaser provides physics, asset loading, and scene management built in. Your patterns (FSM, Observer, Strategy) map directly onto Phaser's architecture
3. **Study the patterns deeper** — the Gang of Four book (Design Patterns, 1994) contains 23 patterns. You've now implemented 3 of them in context

---

## Quick Check Answers

**1. What is the problem with `checkBulletAsteroidCollisions` calling `splitAsteroid` directly?**

The collision function would need to be edited every time a new consequence is added (sound, particles, achievements). It becomes a "God function" — aware of every other system. If split logic changes, the collision function might need updating too, even though it's not related to splitting. Testing becomes hard: testing collision detection also requires all the consequence systems to be present and working. The Observer pattern solves all three: consequences are independent, the collision function never changes, and it can be tested in isolation.

**2. What would you need to change to make each tier move in a different pattern?**

In LAB 05, you'd have to add an `if/else if` chain inside the asteroid update loop, keyed on `asteroid.tier`. This couples the update loop to the tier system — adding a new tier requires modifying the update loop. The Strategy pattern solves this by storing the movement function directly on the asteroid object. The update loop calls `asteroid.moveFn(asteroid)` without knowing or caring what tier the asteroid is.

**3. Name two things in your current game that already use different strategies implicitly.**

Several correct answers: (1) The three asteroid tiers already had different speeds (`ASTEROID_TIERS.speed`) — speed-selection was data-driven dispatch, which is implicit strategy. (2) The FSM states (`'title'`, `'playing'`, `'paused'`, `'gameOver'`) select different render and update strategies via `switch` — the state IS the strategy selector. (3) The bullet fires in the direction the ship is facing — the direction calculation uses `Math.cos/sin` of `ship.angle`, which is a directional strategy that varies based on ship orientation.

---

*End of LAB 07. End of Series.*

---

## Series Complete 🎮

You built a complete Asteroids game from 3 blank files. You learned:

**Mathematics:** Modulo wrapping · Vector arithmetic · Normalisation · Distance formula · Pythagorean theorem · Trigonometry (sin/cos) · Radians · Exponential decay · Probability · Sine-wave oscillation

**Computer Science:** Game loop · Immediate rendering · Coordinate transforms · Arrays · Queues (FIFO) · Filter/push/shift · Big-O complexity · Finite State Machines · Closures

**Software Engineering:** State objects · Data-driven dispatch · Observer pattern · Strategy pattern · Separation of concerns · Open/Closed principle · Event-driven architecture
