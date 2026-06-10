# PhaserJS — LAB 06 — Finite State Machine

**Prerequisites:** LAB 05 (Data Structures). You have a complete Asteroids-style game with ship, drifting asteroids, splitting, score, and lives. You know: arrays, queues, data-driven dispatch, timer variables, `ctx.fillText`.

**What this lab adds:**
- A proper Title Screen before the game starts
- A Pause state (press P) that freezes all movement
- A Game Over screen with final score
- Clean transitions between all states using a Finite State Machine

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 05, the `gameRunning` boolean stopped the game. What is the problem with using a single boolean if you also need a "paused" state and a "title screen" state?
> 2. What would happen if the player pressed P to pause while on the Title Screen — with the LAB 05 approach?
> 3. A Finite State Machine has "states" and "transitions." Without reading further — what states do you think our game needs?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
┌─────────────────────────────────────┐     Press ENTER
│         ASTEROID FIELD              │ ─────────────────►  ┌──────────────┐
│    Press ENTER to start             │                      │  Playing...  │
│                                     │                      │  P = pause   │
│    High score: 0                    │      ◄─────────────  └──────┬───────┘
└─────────────────────────────────────┘     All lives lost          │ P
            ▲                                                        ▼
            │                               ┌──────────────────────────────┐
            │                               │         PAUSED               │
            │                               │    Press P to resume         │
            └───────────────────────────────┘ Press ENTER for title screen │
                  (from game over screen)    └──────────────────────────────┘
```

Four states: `title`, `playing`, `paused`, `gameOver`. Each state controls what renders and what input does. Transitions are explicit and intentional.

---

## Concept: Finite State Machine (FSM)

**What it is:** A system that can be in exactly one of a finite number of named **states** at any time, and transitions between states only in response to defined **events**.

**FSM** — Finite State Machine — defined: "Finite" means the number of possible states is fixed and known in advance (not infinite). "State" means the current mode or condition of the system. "Machine" means there are rules for how it changes.

**The problem before:**
```js
// LAB 05 approach — booleans accumulate:
let gameRunning = true;
let isPaused    = false;
let onTitleScreen = true; // ... wait, gameRunning vs onTitleScreen conflict?

// In update():
if (!gameRunning) return;
if (isPaused) return;
if (onTitleScreen) return; // which flag wins when multiple are true?

// In input handler:
if (event.key === 'p') {
  if (!gameRunning) return; // can't pause if game over
  if (onTitleScreen) return; // can't pause on title
  isPaused = !isPaused;
}
// Every new state multiplies the number of flag combinations to reason about.
// With 3 booleans: 8 possible combinations. Most are invalid — but code must handle them all.
```

**The solution:** One `gameState` variable. One value at a time. Transitions are explicit.
```js
let gameState = 'title'; // only one value active at a time
// Valid values: 'title', 'playing', 'paused', 'gameOver'

// In update():
if (gameState !== 'playing') return; // one check, covers all non-playing states

// In input handler:
if (event.key === 'p' && gameState === 'playing') gameState = 'paused';
if (event.key === 'p' && gameState === 'paused')  gameState = 'playing';
// Transitions are explicit — no invalid combinations possible
```

**What it hides:**
An FSM hides the combinatorial explosion of flag combinations. The invariant: **the system is always in exactly one valid state** — it's impossible to be simultaneously "paused AND on the title screen" because `gameState` holds one string. Each transition is a deliberate assignment from one named state to another.

**Canonical example (General Explanation):**

A traffic light. It has exactly three states: Red, Yellow, Green. It is never "both Red and Green." It changes state only on specific events (timer fires → Green to Yellow). The set of states and transitions is finite and enumerable.

```
States:      Red, Yellow, Green
Events:      timer fires
Transitions: Green → Yellow (on timer)
             Yellow → Red   (on timer)
             Red    → Green (on timer)
```

In code:
```js
let lightState = 'red';

function onTimer() {
  if (lightState === 'red')    lightState = 'green';
  else if (lightState === 'green')  lightState = 'yellow';
  else if (lightState === 'yellow') lightState = 'red';
}
```

**Project Application (The "Why" here):**
Our game has four modes with very different behaviours. The FSM ensures: pressing P only pauses when playing (not on title or game over), game logic only runs when `gameState === 'playing'`, and the render function draws the correct screen for each state.

**Why it matters here:** Every game has an FSM, even if the developer didn't name it. Naming it is what makes it maintainable — adding a new state (e.g. "loading", "cutscene") is just adding a new case to the switch, not hunting for scattered if/else chains.

**Watch for:** FSMs become unwieldy when the number of states grows beyond ~10 or when transitions need to carry data. For complex AI, hierarchical FSMs or behaviour trees are used instead — but those start from this same foundation.

---

### Concept: `switch` Statement

**What it is:** A control structure that matches a value against multiple possible cases and executes the matching block. An alternative to long `if/else if` chains when comparing one variable against many known values.

**The problem before:**
```js
// Long if/else chain for dispatch:
if (gameState === 'title')    { renderTitle(); }
else if (gameState === 'playing')  { renderGame(); }
else if (gameState === 'paused')   { renderPaused(); }
else if (gameState === 'gameOver') { renderGameOver(); }
// Works, but every case re-reads `gameState`. Verbose and easy to mis-type.
```

**The solution:**
```js
switch (gameState) {
  case 'title':
    renderTitle();
    break; // REQUIRED: stop here, don't fall into the next case
  case 'playing':
    renderGame();
    break;
  case 'paused':
    renderPaused();
    break;
  case 'gameOver':
    renderGameOver();
    break;
  default:
    console.error('Unknown game state:', gameState);
    // default: runs if no case matches — useful for catching typos
}
```

**What it hides:**
`switch` hides the repetitive `gameState ===` comparisons in each branch. The invariant: **exactly one case block executes per switch call** (assuming correct `break` usage) — you cannot accidentally run two cases.

**Canonical example:**
```js
const dayNumber = 3;
switch (dayNumber) {
  case 1: console.log('Monday');    break;
  case 2: console.log('Tuesday');   break;
  case 3: console.log('Wednesday'); break; // ← this runs
  default: console.log('Weekend');
}
```

**Why it matters here:** Our `update()` and `render()` will both use a switch on `gameState` to determine what to do each frame.

**Watch for:** Forgetting `break` causes **fall-through** — the code continues into the next case even if it didn't match. This is a common bug. Always add `break` unless you intentionally want fall-through (which is rare and should be commented explicitly).

---

## Step 1 — Copy LAB 05 Files

Create a new folder called `phaser-lab-06`. Copy `index.html`, `style.css`, and `main.js` from `phaser-lab-05`.

### SAVE AND TRY

Open `index.html`. Full game should work as per LAB 05. Verify before continuing.

---

## Step 2 — Add the `gameState` Variable

Replace the LAB 05 `gameRunning` flag with the new FSM state variable.

**In `main.js` — find and update state variables:**

```js
// ─── Remove these LAB 05 variables: ──────────────────────────────────────────
// let gameRunning = true;  ← REMOVE (was: stop-flag)

// ─── Add the FSM state: ───────────────────────────────────────────────────────
let gameState   = 'title';  // ← ADD: start on the title screen, not in the game
// Valid values: 'title' | 'playing' | 'paused' | 'gameOver'

let highScore   = 0;        // ← ADD: persists between playthroughs this session
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The game runs immediately (nothing has changed the behaviour yet — we still call `update()` and `render()` unconditionally). The important thing is it doesn't crash.

**In DevTools Console:**
```js
gameState // Expected: 'title'
```

---

## Step 3 — Split `update()` and `render()` by State

Now we route each function through the FSM. This is the core architectural change.

**Replace the entire `update()` function:**

```js
function update() {
  switch (gameState) {
    case 'playing':
      updatePlaying(); // ← will create this function next
      break;
    case 'title':
    case 'paused':
    case 'gameOver':
      // these states don't advance simulation — nothing to update
      break;
  }
}
```

**Move the existing update logic into a new `updatePlaying()` function.** Place it BEFORE `update()`:

```js
// ─── Playing Update ───────────────────────────────────────────────────────────
function updatePlaying() {
  // [Paste all the existing update() body here — rotation, thrust, drag,
  //  speed cap, ship movement, asteroid movement, bullet movement,
  //  collision detection, spawn queue, respawn check]
  // Nothing changes inside — just moved into this named function.
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The game immediately starts playing (because `gameState` is `'title'` but `update()` does nothing in title state — wait, the ship should be visible but frozen). Actually, since we haven't updated `render()` yet, it still draws the game unconditionally. That's fine for this step — we're only testing that the refactor didn't break movement.

**In DevTools Console:**
```js
gameState = 'playing';
```
**Expected:** The ship starts moving, asteroids drift. The game is now in the playing state.

```js
gameState = 'paused';
```
**Expected:** Everything freezes. No movement. The rendered frame stays static.

```js
gameState = 'playing';
```
**Expected:** Movement resumes.

---

## Step 4 — Route `render()` by State

**Replace `render()` with a state-dispatching version:**

```js
function render() {
  // Clear the canvas first — always, regardless of state
  const bgColor = flashFrames > 0 ? '#222244' : BG_COLOR;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'title':
      renderTitle();    // ← will create this in Step 5
      break;
    case 'playing':
      renderPlaying();  // ← will create this in Step 5
      break;
    case 'paused':
      renderPlaying();  // draw the game world underneath
      renderPaused();   // then overlay the pause UI
      break;
    case 'gameOver':
      renderPlaying();  // draw the final game state underneath
      renderGameOver(); // then overlay the game over UI
      break;
  }
}
```

**Move the existing render body into `renderPlaying()`:**

```js
// ─── Playing Render ───────────────────────────────────────────────────────────
function renderPlaying() {
  // [Paste the existing render body here — all the asteroid/bullet/ship draws
  //  and the score/lives text — but NOT the canvas clear, which stays in render()]
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The screen goes black (the title render function doesn't exist yet so nothing draws in title state — that's expected). No crash.

**In DevTools Console:**
```js
gameState = 'playing';
```
**Expected:** The game scene draws — asteroids, ship, score. Everything from LAB 05 visible and working.

---

## Step 5 — Draw the Title Screen

**Add `renderTitle()` — place before `render()`:**

```js
// ─── Constants ────────────────────────────────────────────────────────────────
const TITLE_COLOR     = '#44ff88';  // ← ADD: green for title text
const SUBTITLE_COLOR  = '#aaaaaa';  // ← ADD: grey for instructions

function renderTitle() {
  const centreX = canvas.width  / 2;
  const centreY = canvas.height / 2;
  // centreX and centreY: the screen centre — all title text will be centred here

  ctx.textAlign = 'center';
  // textAlign 'center' means the x coordinate in fillText is the TEXT CENTRE,
  // not the left edge. This makes centring text trivial.

  ctx.font      = '56px monospace';
  ctx.fillStyle = TITLE_COLOR;
  ctx.fillText('ASTEROID FIELD', centreX, centreY - 60);
  // fillText(text, x, y) — y is the text BASELINE (bottom of letters), not the top

  ctx.font      = '22px monospace';
  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.fillText('Press ENTER to play', centreX, centreY);

  ctx.font      = '18px monospace';
  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.fillText('Arrow keys: rotate + thrust   Space: fire', centreX, centreY + 40);

  if (highScore > 0) {
    ctx.font      = '18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('High Score: ' + highScore, centreX, centreY + 80);
    // only show high score if the player has completed at least one game
  }

  ctx.textAlign = 'left'; // reset to default — prevents other text being centred
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** The title screen with "ASTEROID FIELD" in green, instructions in grey, and (after first playthrough) a high score.

**In DevTools Console:**
```js
highScore = 500;
```
**Expected:** "High Score: 500" appears on the title screen immediately (next render frame).

**Change something:** Change `TITLE_COLOR = '#44ff88'` to `TITLE_COLOR = '#ff4444'`. Title turns red. Change it back.

---

## Step 6 — Add Input Transitions

Now we wire ENTER and P keys to trigger FSM transitions.

**Update the `keydown` handler:**

```js
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  event.preventDefault();

  // ── FSM Transitions ────────────────────────────────────────────────────────
  if (event.key === 'Enter') {
    if (gameState === 'title' || gameState === 'gameOver') {
      // ENTER from title or game over → start a fresh game
      startNewGame(); // ← will create this function next
    }
  }

  if (event.key === 'p' || event.key === 'P') {
    if (gameState === 'playing') {
      gameState = 'paused'; // ← playing → paused
    } else if (gameState === 'paused') {
      gameState = 'playing'; // ← paused → playing (resume)
    }
    // P does nothing on title or game over screens
  }

  // ── Fire bullet (only when playing) ───────────────────────────────────────
  if (event.key === ' ' && canFire && gameState === 'playing') {
    // ← ADD: gameState check prevents firing on title/paused/gameOver
    fireBullet();
    canFire = false;
  }
});
```

**Add the `startNewGame` function — before the input handlers:**

```js
// ─── Start New Game ───────────────────────────────────────────────────────────
function startNewGame() {
  // Reset all game state to initial values for a fresh start
  ship.x     = canvas.width  / 2;
  ship.y     = canvas.height / 2;
  ship.angle = 0;
  ship.vx    = 0;
  ship.vy    = 0;

  score       = 0;         // reset score for new game
  lives       = 3;         // reset lives
  flashFrames = 0;
  bullets     = [];        // clear any lingering bullets
  spawnQueue  = [];        // clear any pending spawns

  spawnAsteroids();        // create fresh asteroid field
  gameState = 'playing';   // ← transition: title/gameOver → playing
}
```

**Update `checkShipAsteroidCollisions` to trigger `gameOver` state instead of `gameRunning = false`:**

```js
function checkShipAsteroidCollisions() {
  for (let ai = 0; ai < asteroids.length; ai++) {
    if (circlesOverlap(ship.x, ship.y, SHIP_SIZE,
                       asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
      ship.x = canvas.width / 2; ship.y = canvas.height / 2;
      ship.vx = 0; ship.vy = 0; ship.angle = 0;
      flashFrames = 20;
      lives -= 1;

      if (lives <= 0) {
        if (score > highScore) highScore = score; // ← ADD: update high score
        gameState = 'gameOver';                   // ← was: gameRunning = false
      }
      break;
    }
  }
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Title screen. Press ENTER — game starts. Press P — game freezes. Press P again — resumes. Lose all lives — game stops (but no Game Over screen yet — that's the next step).

**In DevTools Console:**
```js
gameState // Expected: 'title'
// Press ENTER:
gameState // Expected: 'playing'
// Press P:
gameState // Expected: 'paused'
// Press P again:
gameState // Expected: 'playing'
```

---

## Step 7 — Draw the Pause and Game Over Overlays

**Add `renderPaused()` — before `render()`:**

```js
function renderPaused() {
  // Draw a semi-transparent dark overlay over the game scene
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  // rgba: red=0, green=0, blue=0, alpha=0.5 (50% transparent black)
  // This dims the game world without hiding it completely
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centreX = canvas.width  / 2;
  const centreY = canvas.height / 2;

  ctx.textAlign = 'center';

  ctx.font      = '48px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PAUSED', centreX, centreY - 30);

  ctx.font      = '20px monospace';
  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.fillText('P — resume', centreX, centreY + 20);
  ctx.fillText('ENTER — title screen', centreX, centreY + 50);

  ctx.textAlign = 'left';
}
```

### SAVE AND TRY

Save. Refresh. Press ENTER to start. Press P.

**You should see:** The game world dims (dark overlay). "PAUSED" text appears in the centre. Press P — overlay disappears, game resumes.

**Change something:** Change the overlay opacity from `0.5` to `0.9`. The game world is nearly invisible behind the overlay. Change it back.

---

**Add `renderGameOver()` — before `render()`:**

```js
function renderGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 70% opaque dark overlay — heavier than pause to signal finality

  const centreX = canvas.width  / 2;
  const centreY = canvas.height / 2;

  ctx.textAlign = 'center';

  ctx.font      = '56px monospace';
  ctx.fillStyle = '#ff4444';
  ctx.fillText('GAME OVER', centreX, centreY - 60);
  // red for game over — universally understood signal of failure

  ctx.font      = '28px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Final Score: ' + score, centreX, centreY);

  if (score >= highScore && score > 0) {
    ctx.font      = '22px monospace';
    ctx.fillStyle = '#ffff00'; // yellow for achievement
    ctx.fillText('New High Score!', centreX, centreY + 40);
  }

  ctx.font      = '20px monospace';
  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.fillText('Press ENTER to play again', centreX, centreY + 80);

  ctx.textAlign = 'left';
}
```

### SAVE AND TRY

Save. Refresh. Start a game. Let all asteroids hit the ship until lives = 0.

**You should see:** Dark overlay. "GAME OVER" in red. Final score. "Press ENTER to play again" instruction. Press ENTER — fresh game starts from the title screen.

**In DevTools Console (while on Game Over screen):**
```js
gameState // Expected: 'gameOver'
highScore // Expected: your score (if it was the first game)
```

---

## Step 8 — Add "ENTER for title" from Pause

The `renderPaused()` overlay says "ENTER — title screen" — let's wire that transition.

**Update the ENTER key handler:**

```js
if (event.key === 'Enter') {
  if (gameState === 'title' || gameState === 'gameOver') {
    startNewGame();
  } else if (gameState === 'paused') { // ← ADD this branch
    gameState = 'title'; // ← paused → title (abandon current game)
  }
}
```

### SAVE AND TRY

Save. Refresh. Start game. Press P to pause. Press ENTER.

**You should see:** Returns to the title screen. High score is preserved.

---

## 🎯 Challenge: Invincibility Frames

**You know:** Timer variables (`flashFrames`), FSM state (`gameState`), and the ship collision check.

**Task:** After the ship is hit, make it invincible for 180 frames (~3 seconds at 60fps). During invincibility, the ship blinks (alternates visible/invisible every 6 frames) to signal the immunity period. Collisions are ignored while invincible.

**Starting code:**
```js
let invincibleFrames = 0; // ← ADD to state variables

// In checkShipAsteroidCollisions:
// Check invincibleFrames > 0 — if so, skip the collision entirely
// When a hit IS registered: set invincibleFrames = 180

// In updatePlaying:
// Decrement invincibleFrames each frame (if > 0)

// In renderPlaying / drawShip:
// Skip drawing the ship if invincibleFrames > 0 AND (invincibleFrames % 12) < 6
// This creates a blink: visible for 6 frames, hidden for 6, visible for 6...
```

**Hint:** The blink condition `invincibleFrames % 12 < 6` divides the invincibility period into 6-frame windows, alternating visible/hidden.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// ─── State ────────────────────────────────────────────────────────────────────
let invincibleFrames = 0; // ← ADD

// ─── checkShipAsteroidCollisions — updated ────────────────────────────────────
function checkShipAsteroidCollisions() {
  if (invincibleFrames > 0) return; // ← ADD: skip all collision checks while invincible

  for (let ai = 0; ai < asteroids.length; ai++) {
    if (circlesOverlap(ship.x, ship.y, SHIP_SIZE,
                       asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius)) {
      ship.x = canvas.width / 2; ship.y = canvas.height / 2;
      ship.vx = 0; ship.vy = 0; ship.angle = 0;
      flashFrames      = 20;
      invincibleFrames = 180; // ← ADD: 3 seconds of invincibility
      lives -= 1;
      if (lives <= 0) {
        if (score > highScore) highScore = score;
        gameState = 'gameOver';
      }
      break;
    }
  }
}

// ─── updatePlaying — add invincibility countdown ──────────────────────────────
function updatePlaying() {
  if (invincibleFrames > 0) invincibleFrames -= 1; // ← ADD at the top

  // [rest of update logic unchanged]
}

// ─── renderPlaying — blink ship during invincibility ─────────────────────────
function renderPlaying() {
  // [draw asteroids and bullets — unchanged]

  // Draw ship with blink logic:
  const shipVisible = invincibleFrames === 0 ||    // always visible when not invincible
                      (invincibleFrames % 12) < 6; // blink: visible 6f, hidden 6f
  // invincibleFrames % 12 cycles 0→11→0→11...
  // < 6 is true for 0,1,2,3,4,5 (visible half) and false for 6,7,8,9,10,11 (hidden half)

  if (shipVisible) {
    drawExhaust(ship.x, ship.y, ship.angle);
    drawShip(ship.x, ship.y, ship.angle);
  }

  // [score/lives text — unchanged]
}
```

**Key insight:** `invincibleFrames % 12 < 6` is the general blinking pattern. Changing `12` changes the blink period (12 frames = 0.2 seconds at 60fps). Changing `6` changes the duty cycle (how long visible vs. hidden within each period). The same pattern is used for any time-based on/off effect — flashing HUD elements, blinking warning indicators, flickering lights.

</details>

---

## 🎯 Challenge: High Score Persistence

**You know:** The browser's `localStorage` API allows storing small amounts of data that persists between page refreshes.

**Task:** Save `highScore` to `localStorage` when it's updated, and load it from `localStorage` when the page first loads. After getting a new high score, refresh the page — the high score should persist.

**Starting code:**
```js
// Load on startup (put this near the top of the file, after constants):
// highScore = parseInt(localStorage.getItem('asteroidHighScore') || '0', 10);
// parseInt converts a string to an integer
// '0' is the fallback if the key doesn't exist yet (first visit)

// Save when updated (in checkShipAsteroidCollisions, after the highScore update):
// localStorage.setItem('asteroidHighScore', highScore.toString());
```

**Hint:** `localStorage.getItem(key)` returns `null` if the key doesn't exist. The `|| '0'` fallback handles this. `parseInt(string, 10)` converts a string like `"500"` to the number `500`. The second argument `10` is the base (decimal — always use 10 unless you need hex or binary).

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// Near the top of main.js, after constants — update the highScore initialisation:
let highScore = parseInt(localStorage.getItem('asteroidHighScore') || '0', 10);
// ← was: let highScore = 0;
// localStorage.getItem returns null if not set → || '0' gives '0' as fallback
// parseInt('0', 10) = 0, parseInt('500', 10) = 500

// In checkShipAsteroidCollisions, after updating highScore:
if (score > highScore) {
  highScore = score;
  localStorage.setItem('asteroidHighScore', highScore.toString());
  // ← ADD: persist the new high score immediately
  // toString() converts 500 → '500' — localStorage only stores strings
}
```

**Key insight:** `localStorage` is a key-value store where both keys and values are strings. Every number must be converted to a string on save (`toString()`) and back to a number on load (`parseInt`). This string-only constraint is a limitation of the browser's storage API — not a JavaScript limitation. In a production game you'd typically use a server database and store scores per user account.

</details>

---

## Mental Model: Finite State Machine — Full System

Now that it's implemented, let's name all the parts formally:

**States:** `'title'`, `'playing'`, `'paused'`, `'gameOver'`

**Events (triggers):**
- ENTER key pressed
- P key pressed
- Lives reach 0

**Transition table:**

| Current State | Event | Next State |
|---|---|---|
| `title` | ENTER pressed | `playing` |
| `playing` | P pressed | `paused` |
| `playing` | lives reach 0 | `gameOver` |
| `paused` | P pressed | `playing` |
| `paused` | ENTER pressed | `title` |
| `gameOver` | ENTER pressed | `playing` (via `startNewGame`) |

**Where FSMs appear again:** Every enemy in LAB 07 has its own mini-FSM (idle → chasing → fleeing). Every UI widget in a real application is an FSM. Network connection states, animation states, loading states — all FSMs. The pattern is everywhere once you see it.

---

## Final Check

| Feature | How to verify |
|---|---|
| Title screen on load | Refresh — "ASTEROID FIELD" visible, game not running |
| ENTER starts game | Press ENTER — asteroids appear, ship active |
| P pauses game | Start game, press P — everything freezes, "PAUSED" overlay shows |
| P resumes | Press P again — overlay disappears, game continues |
| ENTER from pause → title | While paused, press ENTER — returns to title screen |
| Losing all lives → game over | Let ship hit asteroids until lives = 0 — "GAME OVER" overlay |
| ENTER from game over → new game | On game over screen, press ENTER — fresh game starts |
| High score tracked | Get a score, die, start again — previous score shown on title |
| Shooting on title does nothing | On title screen, press space — no bullets fired |
| Score resets on new game | Press ENTER from game over — score resets to 0 |
| `gameState` reflects current mode | Console: `gameState` while in each screen — correct string each time |

---

## Complete `main.js` Reference (Structure Only)

The complete file is long — here is the function structure to verify your file is organised correctly:

```
Constants block
  SHIP_SIZE, SHIP_COLOR, EXHAUST_COLOR, BG_COLOR
  ROTATION_SPEED, THRUST_FORCE, DRAG, MAX_SHIP_SPEED
  ASTEROID_COUNT, ASTEROID_TIERS, ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED
  BULLET_SPEED, BULLET_RADIUS, BULLET_LIFETIME, BULLET_COLOR
  SAFE_SPAWN_DISTANCE, SCORE_TABLE, TITLE_COLOR, SUBTITLE_COLOR

Canvas setup
  canvas, ctx

State variables
  ship { x, y, angle, vx, vy }
  asteroids [], bullets [], spawnQueue []
  gameState, score, highScore, lives
  canFire, flashFrames, invincibleFrames

Input
  keys {}
  keydown handler (FSM transitions + fire)
  keyup handler

Canvas resize
  resizeCanvas()

Game management
  startNewGame()
  spawnAsteroids()
  fireBullet()

Collision
  circlesOverlap()
  checkBulletAsteroidCollisions()
  checkShipAsteroidCollisions()
  splitAsteroid()
  isSafeToSpawn()
  processSpawnQueue()

Draw functions
  drawShip()
  drawExhaust()
  drawAsteroid()
  drawBullet()

State-specific update
  updatePlaying()

State-specific render
  renderTitle()
  renderPlaying()
  renderPaused()
  renderGameOver()

Main loop
  update()  — switches on gameState
  render()  — switches on gameState, then clears and calls appropriate render function
  loop()
  requestAnimationFrame(loop)
```

---

## What's Next

In **LAB 07** — the final lab — you'll apply **Software Engineering design patterns** to the game. The Observer pattern will replace direct function calls with an event system. The Strategy pattern will give each asteroid tier a different movement behaviour. You'll end up with code that's easier to extend, test, and maintain — and you'll understand *why* those patterns were invented.

---

## Quick Check Answers

**1. What is the problem with using a single boolean for multiple states?**

A boolean can only represent two states: true and false. With `gameRunning` and `isPaused` as separate booleans, there are 2 × 2 = 4 possible combinations, but only 3 are valid (running+unpaused, running+paused, stopped+unpaused). The fourth combination (stopped+paused) is invalid but possible — code must defensively handle it or bugs appear. With 3 booleans: 8 combinations, 5 invalid. The problem grows exponentially. A single `gameState` string allows exactly the combinations you define and nothing else.

**2. What would happen if the player pressed P to pause while on the Title Screen?**

With the LAB 05 approach and a simple `isPaused = !isPaused`, the game would enter a "paused" state while on the title screen — making the game unable to start properly. The FSM guard (`if (gameState === 'playing')`) prevents this: P only changes state when the current state is `'playing'`. Invalid transitions are structurally impossible, not just guarded by logic.

**3. What states do you think our game needs?**

The four we implemented: `'title'` (before starting), `'playing'` (game active), `'paused'` (game suspended), `'gameOver'` (all lives lost). A production game might add: `'loading'` (fetching assets), `'cutscene'` (playing a non-interactive sequence), `'leaderboard'` (showing scores from other players), `'settings'` (adjusting options). Each is a named, discrete mode with defined entry/exit conditions — expanding the FSM table is all that's needed.

---

*End of LAB 06. Next: [[LAB-07-Design-Patterns]]*
