# TypeScript Tower Defense — LAB 14 — Game State and Score

**Prerequisites:** Lab 13 complete. Towers kill enemies before the exit; escaped enemies cost lives.

**What this lab adds:**
- `type GameState` — a string literal union that names the three possible states of the game
- A `score` variable — points awarded for killing enemies before they escape
- Input guards — keyboard and click do nothing in non-playing states
- Game over detection — lives reaching zero triggers the loss state
- Win detection — all waves cleared with lives remaining triggers the win state
- A full-screen overlay — displays the outcome and score, instructions to restart
- `resetGame()` — a function that returns every piece of state to its initial value
- `R` key restart — works from any state

**Time:** 60–90 minutes.

---

## What You Will Build

```
     During play:
     ┌─────────────────────────────────────────┐
     │ Wave 2/3  Enemies: 3  |  Score: 120  ... │
     │             [grid, towers, enemies]       │
     └─────────────────────────────────────────┘

     Game Over (lives = 0):
     ┌─────────────────────────────────────────┐
     │ Wave 1/3  Enemies: 2  |  Score: 40  ...  │
     │     ┌───────────────────────────┐        │
     │     │  GAME OVER                │        │
     │     │  Score: 40                │        │
     │     │  Press R to play again    │        │
     │     └───────────────────────────┘        │
     └─────────────────────────────────────────┘

     Win (all waves cleared):
     ┌─────────────────────────────────────────┐
     │ All waves complete!  |  Score: 680  ...  │
     │     ┌───────────────────────────┐        │
     │     │  YOU WIN                  │        │
     │     │  Score: 680               │        │
     │     │  Press R to play again    │        │
     │     └───────────────────────────┘        │
     └─────────────────────────────────────────┘
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. The game currently has no concept of "are we playing?" — input always works. What would happen if a player pressed `Space` or clicked a tile after the game ended? Why is that a problem?
> 2. What does `type GameState = 'playing' | 'gameover' | 'won'` accomplish that a plain `let state = 'playing'` does not?
> 3. To reset the game, you need to undo every change made during play. List all the pieces of state that need to be cleared or restored to their initial values.
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand the Concepts Before Touching Code

---

### Concept: Game State as a Type

Many programs exist in distinct modes where different rules apply. A game has at least three: playing (normal input), game over (show result, no input), and won (same). The simplest representation is a string:

```ts
type GameState = 'playing' | 'gameover' | 'won';
let gameState: GameState = 'playing';
```

Compare this to a plain variable without the type:

```ts
let gameState = 'playing'; // TypeScript infers string
```

With `type GameState`, TypeScript knows the only valid values are `'playing'`, `'gameover'`, and `'won'`. Assigning `gameState = 'pusing'` (a typo) is a compile-time error — caught before the code runs. Without the type, it is silently accepted and the game breaks at runtime.

**Checking state:**
```ts
if (gameState !== 'playing') return; // guard: ignore input if not playing
```

**Transitioning state:**
```ts
gameState = 'gameover'; // valid — TypeScript accepts it
gameState = 'paused';   // TypeScript ERROR: not in the union
```

You will see this pattern in: Redux stores, React state machines (XState), database row statuses, order lifecycle tracking, and anywhere a system has well-defined modes.

---

### Concept: Score — Points Scaled by Enemy Difficulty

Awarding score only when a tower kills an enemy (not when one escapes) creates the right incentive: good tower placement earns points, bad placement costs lives and no points.

Scaling score by enemy speed rewards stopping fast enemies, which are harder to kill:

```ts
const points = Math.round(enemy.speed * 50);
```

Wave 1 speed 1.5 → 75 points per kill.
Wave 3 speed 2.8 → 140 points per kill.

The full wave-3 kill count (8 enemies) at 140 each = 1120 points for a perfect run. A meaningful number that feels earned.

---

### Concept: Guard Clauses in Input Handlers

A **guard clause** is an early return at the top of a function that prevents the rest of the function from running unless a condition is met.

```ts
renderer.domElement.addEventListener('click', (event) => {
  if (gameState !== 'playing') return;  // ← guard: nothing works if not playing
  // ... rest of click handler ...
});
```

Without the guard, clicking after game over would place towers. Pressing `Space` after all waves finished would try to start a fourth wave and likely break things.

Guards are a cleaner alternative to wrapping all logic in a giant `if (gameState === 'playing') { ... }` block. They keep the "happy path" at the left margin, unindented.

---

### Concept: The Full-Screen Overlay

A `<div>` that covers the entire container and sits above everything communicates a major state change without reloading the page.

```ts
overlayEl.style.position = 'absolute';
overlayEl.style.inset = '0';          // equivalent to top/right/bottom/left all = 0
overlayEl.style.display = 'none';     // hidden until needed
overlayEl.style.alignItems = 'center';
overlayEl.style.justifyContent = 'center';
```

`inset: 0` is CSS shorthand for setting all four edges to 0 — the element fills its positioned parent completely.

`display: 'none'` versus `display: 'flex'`: switching between these is how you show and hide the overlay. When `'none'`, the element does not exist visually or interactively. When `'flex'`, it appears and centers its content.

---

### Concept: Resetting State

A reset function must undo every mutation the game has made. Each of these variables was mutated during play:

- `towers` — meshes added to scene, tiles marked occupied
- `enemies` — meshes added to scene
- `lives` — decremented
- `score` — incremented
- `gameState` — changed
- `currentWaveIndex` — advanced
- `waveActive` — set true/false
- `enemiesSpawnedThisWave` — incremented
- `spawnTimer` — accumulated

Forgetting any one of these creates a "dirty reset" — the game restarts but with stale data from the previous run. For example, forgetting to reset `currentWaveIndex` means Wave 1 is already complete on restart.

---

## Step 2 — Add the `GameState` Type and Variable

Open `src/main.ts`. Find the `// --- State ---` section. Add `GameState` just before it:

```ts
// --- Game State ---

type GameState = 'playing' | 'gameover' | 'won';
```

Then inside `// --- State ---`, add two new variables:

```ts
let gameState: GameState = 'playing';
let score: number = 0;
```

The state section now looks like this:

```ts
const towers: Tower[] = [];
const enemies: Enemy[] = [];
let activeTowerType: TowerType = 'basic';
let lives: number = 10;
let gameState: GameState = 'playing';
let score: number = 0;

let currentWaveIndex: number = -1;
let waveActive: boolean = false;
let enemiesSpawnedThisWave: number = 0;
let spawnTimer: number = 0;
```

> **SAVE AND TRY:** `GameState` and `score` are declared. No TypeScript errors. No visible change — these variables exist but nothing reads or writes them yet.

---

## Step 3 — Award Score When an Enemy Is Killed

Find the enemy cleanup block inside `update()`. It currently looks like this:

```ts
    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        gameEvents.emit('enemyKilled', enemy);
      }
    }
```

Update the `else` branch to calculate and award points:

```ts
    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        const points = Math.round(enemy.speed * 50);
        score += points;
        gameEvents.emit('enemyKilled', { points, score });
      }
    }
```

**Line by line:**

`const points = Math.round(enemy.speed * 50);`
Score for this kill. `enemy.speed * 50` scales reward by difficulty. `Math.round` removes decimal places — `2.8 * 50 = 140.0` stays `140`; a speed of `1.33 * 50 = 66.5` becomes `67`.

`score += points;`
`+=` is shorthand for `score = score + points`. Adds to the running total.

`gameEvents.emit('enemyKilled', { points, score });`
Emits an object with both the points just earned and the new running total. Any subscriber can choose to use either value. Passing `{ points, score }` is shorthand for `{ points: points, score: score }`.

> **SAVE AND TRY:** Kill enemies — score is being calculated and emitted. The HUD does not show it yet, but the logic is running. No TypeScript errors.

---

## Step 4 — Show Score in the HUD

Find `updateHUD()`. Add score to the displayed text:

```ts
function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
                '  Enemies: ' + remaining;
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
  }

  hudEl.textContent =
    waveLabel +
    '  |  Score: ' + score +
    '  |  Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}
```

The only change is adding `'  |  Score: ' + score +` to the textContent line.

Add one more event subscription to trigger a HUD refresh when an enemy is killed:

```ts
gameEvents.on('enemyKilled', () => { updateHUD(); });
```

> **CSS AND SEE:** Save and check the browser. Kill some enemies — the Score counter in the HUD should increment each time. The amount increases per kill based on the enemy's speed.

---

## Step 5 — Add Guards to Input Handlers

Now add state checks to the two input handlers so they do nothing unless the game is actively being played.

Find the click event listener on `renderer.domElement`. Add a guard at the top:

```ts
renderer.domElement.addEventListener('click', (event) => {
  if (gameState !== 'playing') return;  // ← add this line
  const dx = event.clientX - mouseDownX;
  // ... rest unchanged ...
});
```

Find the `keydown` event listener. Add guards to the Space, 1, and 2 cases:

```ts
window.addEventListener('keydown', (event) => {
  if (event.key === '1' && gameState === 'playing') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2' && gameState === 'playing') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === ' ') {
    event.preventDefault();
    if (gameState === 'playing') startNextWave();
  }
});
```

The `R` key reset (added in Step 8) is intentionally excluded from the guard — it must work in all states, including gameover and won.

`event.preventDefault()` stays outside the guard so the browser scroll prevention works regardless of game state.

> **SAVE AND TRY:** The guards exist but cannot be triggered yet since the game state never changes from `'playing'`. No visible difference. No TypeScript errors. The guard logic will activate in the steps below.

---

## Step 6 — Detect Game Over

Game over happens when `lives` reaches zero. The right place to check is inside the `'livesChanged'` event handler — that event fires every time lives decreases.

Find the event subscription section and update the `livesChanged` handler:

```ts
gameEvents.on('livesChanged', () => {
  updateHUD();
  if (lives <= 0 && gameState === 'playing') {
    gameState = 'gameover';
    gameEvents.emit('gameOver', score);
  }
});
```

**Line by line:**

`updateHUD();`
Still updates the HUD first — the lives change should be visible in the display before the overlay appears.

`if (lives <= 0 && gameState === 'playing')`
Two conditions: lives are exhausted AND we are currently playing. The `gameState === 'playing'` guard prevents this from firing during a reset where lives are temporarily set to 0, or from firing twice.

`gameState = 'gameover';`
Transition the state. From this point, the input guards in the click and keydown handlers will block all gameplay input.

`gameEvents.emit('gameOver', score);`
Announces the result. The overlay will subscribe to this.

> **SAVE AND TRY:** Let all 10 enemies escape without towers. On the last one, lives hits 0. Nothing visible changes yet — the overlay does not exist. But `gameState` is now `'gameover'`, so pressing Space or clicking tiles should do nothing. Confirm: after losing all lives, pressing `Space` does not start a new wave. Clicking tiles does not place towers.

---

## Step 7 — Detect the Win Condition

Winning happens when all waves are cleared and lives are still above zero. The natural place to check is inside `updateWaveSpawner`, where wave completion is already detected.

Find this block inside `updateWaveSpawner`:

```ts
  if (allSpawned && allCleared) {
    waveActive = false;
    gameEvents.emit('waveComplete', currentWaveIndex);
  }
```

Update it:

```ts
  if (allSpawned && allCleared) {
    waveActive = false;
    gameEvents.emit('waveComplete', currentWaveIndex);

    const isLastWave = currentWaveIndex >= WAVES.length - 1;
    if (isLastWave && lives > 0 && gameState === 'playing') {
      gameState = 'won';
      gameEvents.emit('gameWon', score);
    }
  }
```

**Line by line:**

`const isLastWave = currentWaveIndex >= WAVES.length - 1;`
True only after the final wave. Intermediate waves complete without triggering this.

`lives > 0`
Extra safety check. If somehow lives dropped to exactly 0 on the same frame the last enemy died, the game over condition is more appropriate. In practice this is nearly impossible, but defensive checks here prevent an ambiguous state.

`gameState === 'playing'`
Same reason as the game over guard: prevents double-triggering.

`gameEvents.emit('gameWon', score)`
Announces victory. The overlay subscribes to this.

> **SAVE AND TRY:** Play through all three waves and clear them. After the last enemy dies, `gameState` should become `'won'`. Confirm: pressing `Space` after winning does nothing. The HUD still shows "All waves complete!" because `updateHUD` is triggered by `waveComplete` first. The overlay is next.

---

## Step 8 — Create the Screen Overlay

Now build the overlay element. Find the section after the HUD element is created and before the scene setup. Add the overlay after `container.appendChild(hudEl)`:

### 8a — Create the overlay element

```ts
const overlayEl = document.createElement('div');
overlayEl.style.position = 'absolute';
overlayEl.style.inset = '0';
overlayEl.style.display = 'none';
overlayEl.style.flexDirection = 'column';
overlayEl.style.alignItems = 'center';
overlayEl.style.justifyContent = 'center';
overlayEl.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
overlayEl.style.color = 'white';
overlayEl.style.fontFamily = 'monospace';
overlayEl.style.textAlign = 'center';
overlayEl.style.pointerEvents = 'none';
overlayEl.style.whiteSpace = 'pre';
container.appendChild(overlayEl);
```

**Line by line:**

`overlayEl.style.inset = '0'`
Sets top, right, bottom, and left all to `0`. The overlay fills the entire `#game-container`, sitting on top of the canvas.

`overlayEl.style.display = 'none'`
Hidden by default. Changed to `'flex'` when game over or won.

`overlayEl.style.flexDirection = 'column'`
When visible, stacks content vertically. Works with `alignItems: 'center'` and `justifyContent: 'center'` to center everything both horizontally and vertically.

`overlayEl.style.backgroundColor = 'rgba(0, 0, 0, 0.75)'`
Semi-transparent black. `rgba` is `rgb` with a fourth value for opacity (0 = fully transparent, 1 = fully opaque). `0.75` lets the game grid show dimly through the overlay — a visual hint that the game is still underneath.

`overlayEl.style.whiteSpace = 'pre'`
Makes `\n` in `textContent` render as actual line breaks. Without this, all text runs together on one line.

`overlayEl.style.pointerEvents = 'none'`
Prevents the overlay from blocking the `R` key from reaching the `window.addEventListener('keydown', ...)` handler. The overlay is purely visual; input still reaches the page.

> **CSS AND SEE:** Save and check the browser. The overlay is invisible — that is correct. Nothing has changed visually. No TypeScript errors.

---

### 8b — Helper function to show the overlay

Add a helper function after `updateHUD()` and before the event subscriptions:

```ts
function showOverlay(title: string, subtitle: string): void {
  overlayEl.style.fontSize = '48px';
  overlayEl.textContent = title + '\n\n' + subtitle + '\n\nScore: ' + score + '\n\nPress R to play again';
  overlayEl.style.display = 'flex';
}

function hideOverlay(): void {
  overlayEl.style.display = 'none';
}
```

**What this does:**

`showOverlay` sets the text and makes the overlay visible. The `\n\n` between sections creates blank lines for spacing. `score` is read at call time — whatever score was accumulated before the game ended.

`hideOverlay` hides it again. Called during reset.

> **SAVE AND TRY:** Function is defined. No visible change — nothing calls it yet.

---

### 8c — Subscribe to game outcome events

Add two new subscriptions below the existing ones:

```ts
gameEvents.on('gameOver', () => {
  showOverlay('GAME OVER', 'Better luck next time');
});

gameEvents.on('gameWon', () => {
  showOverlay('YOU WIN', 'All enemies defeated');
});
```

> **SAVE AND TRY:** Let all lives drain to zero. The dark overlay should appear centered over the grid showing "GAME OVER", the score, and "Press R to play again". Then clear your browser, reload, clear all waves — "YOU WIN" should appear. Clicking or pressing Space on either screen does nothing — the guards are active.

---

## Step 9 — The Reset Function

Add `resetGame()` after `startNextWave()` and before the HUD Logic section:

```ts
function resetGame(): void {
  // Remove all tower meshes and free tiles
  for (let i = towers.length - 1; i >= 0; i--) {
    towers[i].tile.occupied = false;
    towers[i].dispose(scene);
  }
  towers.length = 0;

  // Remove all enemy meshes
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].dispose(scene);
  }
  enemies.length = 0;

  // Reset numeric state
  lives = 10;
  score = 0;

  // Reset wave state
  currentWaveIndex = -1;
  waveActive = false;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;

  // Return to playing state and refresh everything
  gameState = 'playing';
  hideOverlay();
  updateHUD();
}
```

**What each block does:**

**Tower cleanup:**
`towers[i].tile.occupied = false` — un-marks the tile so it can receive a new tower after reset. Without this, tiles remain blocked after a replay.
`towers[i].dispose(scene)` — removes the mesh from the Three.js scene.
`towers.length = 0` — empties the array without creating a new one.

**Enemy cleanup:**
Same pattern. No tile cleanup needed since enemies do not set `occupied`.

**Numeric state:**
`lives = 10` and `score = 0` restore the starting values. If you change the starting lives count elsewhere, update it here too — these two values must match.

**Wave state:**
All four wave variables reset to their initial values from Step 3. `currentWaveIndex = -1` is especially important — without it, Wave 1 would be "already complete" on replay.

**Returning to playing:**
`gameState = 'playing'` re-enables all input guards.
`hideOverlay()` removes the overlay.
`updateHUD()` refreshes the display to show "Press Space to start".

> **SAVE AND TRY:** `resetGame` is defined but not triggered yet. No TypeScript errors.

---

## Step 10 — Wire `R` to Reset

Find the `keydown` listener. Add the `R` key case:

```ts
window.addEventListener('keydown', (event) => {
  if (event.key === '1' && gameState === 'playing') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2' && gameState === 'playing') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === ' ') {
    event.preventDefault();
    if (gameState === 'playing') startNextWave();
  }
  if (event.key === 'r' || event.key === 'R') {
    resetGame();
  }
});
```

`event.key === 'r' || event.key === 'R'`
Handles both cases — whether CapsLock is on or off. No guard on game state: `R` should always work.

> **SAVE AND TRY:** The complete flow:
> 1. Lose all lives → overlay appears → press `R` → game resets cleanly
> 2. Clear all waves → overlay appears → press `R` → game resets cleanly
> 3. Press `R` in the middle of a game → instant reset (useful when testing)

---

## Step 11 — Verify the Complete Game Loop

Play through the full game deliberately to confirm every transition:

**Loss path:**
1. Start without placing any towers
2. Press `Space` — Wave 1 starts
3. Watch all 3 enemies walk past — 3 lives lost
4. Press `Space` again for Waves 2 and 3 — 13 more enemies escape
5. After the 10th escape, game over overlay should appear
6. Press `R` — everything resets, HUD shows "Press Space to start", score is 0

**Win path:**
1. Place 4–5 sniper towers along the path
2. Press `Space` — wave 1 starts, enemies die mid-path
3. Press `Space` for wave 2 and 3 — all enemies die
4. After the last Wave 3 enemy is killed, win overlay appears with the accumulated score
5. Press `R` — resets

**Mid-game reset:**
1. Start a wave, place towers, let it run for a few seconds
2. Press `R` — all towers and enemies removed, wave counter reset to -1, score back to 0
3. Click tiles to confirm they accept new towers

---

## Challenges

---

**Challenge 1 — High Score Persistence**

Store the highest score achieved across resets using `localStorage`. Display it in the overlay: "Score: 480  |  Best: 680".

Hints:
- `localStorage.setItem('highScore', String(score))` saves a string
- `localStorage.getItem('highScore')` returns a `string | null`
- `parseInt(str)` converts a string to a number; `parseInt(null)` returns `NaN` — use `|| 0` as a fallback

<details>
<summary>Solution</summary>

```ts
function getHighScore(): number {
  return parseInt(localStorage.getItem('highScore') || '0');
}

function saveHighScore(): void {
  if (score > getHighScore()) {
    localStorage.setItem('highScore', String(score));
  }
}

// In showOverlay, replace the textContent line:
overlayEl.textContent =
  title + '\n\n' + subtitle +
  '\n\nScore: ' + score +
  '  |  Best: ' + getHighScore() +
  '\n\nPress R to play again';

// Call saveHighScore() before showOverlay in both gameOver and gameWon handlers:
gameEvents.on('gameOver', () => {
  saveHighScore();
  showOverlay('GAME OVER', 'Better luck next time');
});

gameEvents.on('gameWon', () => {
  saveHighScore();
  showOverlay('YOU WIN', 'All enemies defeated');
});
```

`localStorage` is a browser API that stores key-value pairs as strings. The data persists across page reloads (unlike variables, which reset). It is not available in Node.js — only in browsers.

`parseInt('0')` → `0`. `parseInt('')` → `NaN`. The `|| 0` fallback handles the first-run case where no score is stored yet.

</details>

---

**Challenge 2 — Animated Score Popup**

When an enemy is killed, briefly show a "+140" text at the enemy's screen position that floats upward and fades out.

Hints:
- Create a `<div>` popup at the enemy's world position converted to screen coordinates — `THREE.Vector3.project(camera)` converts a world position to NDC
- Use CSS `transition` for the fade: `popupEl.style.transition = 'opacity 0.8s'` then set `opacity = '0'` on the next frame
- Remove the element from the DOM after the transition ends: `popupEl.addEventListener('transitionend', () => container.removeChild(popupEl))`

<details>
<summary>Solution</summary>

```ts
function showScorePopup(worldPos: THREE.Vector3, points: number): void {
  const projected = worldPos.clone().project(camera);
  const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const screenY = (-projected.y * 0.5 + 0.5) * window.innerHeight;

  const popup = document.createElement('div');
  popup.textContent = '+' + points;
  popup.style.position = 'absolute';
  popup.style.left = screenX + 'px';
  popup.style.top = screenY + 'px';
  popup.style.color = '#ffdd44';
  popup.style.fontFamily = 'monospace';
  popup.style.fontSize = '20px';
  popup.style.fontWeight = 'bold';
  popup.style.pointerEvents = 'none';
  popup.style.textShadow = '1px 1px 2px black';
  popup.style.transition = 'opacity 0.8s, top 0.8s';
  container.appendChild(popup);

  // Start the animation on the next frame (requestAnimationFrame ensures the element is in the DOM first)
  requestAnimationFrame(() => {
    popup.style.opacity = '0';
    popup.style.top = (screenY - 40) + 'px';
  });

  popup.addEventListener('transitionend', () => {
    if (container.contains(popup)) container.removeChild(popup);
  });
}

// Call it in the enemyKilled handler:
gameEvents.on('enemyKilled', (data) => {
  const { points } = data as { points: number; score: number };
  // 'enemy' is no longer in scope here — emit the position separately:
  updateHUD();
});
```

To pass the position, update the emit in the update loop:

```ts
} else {
  const points = Math.round(enemy.speed * 50);
  score += points;
  showScorePopup(enemy.mesh.position.clone(), points);
  gameEvents.emit('enemyKilled', { points, score });
}
```

`worldPos.clone().project(camera)` converts a world-space Vector3 to NDC (x and y in -1 to +1). The screen coordinate conversion is the inverse of the NDC-to-click conversion from Lab 06.

`enemy.mesh.position.clone()` is important — by the time the async `requestAnimationFrame` fires, the enemy mesh may have been disposed. Cloning the Vector3 captures the position immediately.

</details>

---

**Challenge 3 — Pause State**

Add a `'paused'` state to `GameState`. Press `P` to pause — the game loop keeps running (OrbitControls still work) but enemies stop moving, waves stop spawning, and towers stop firing. The HUD shows a "PAUSED" message.

Hints:
- Add `'paused'` to the union type
- In `update()`, check `if (gameState !== 'playing') { controls.update(); return; }` — this lets camera controls work but skips all entity updates
- `P` toggles between `'playing'` and `'paused'`: `gameState = gameState === 'playing' ? 'paused' : 'playing'`
- Show a small overlay or HUD change when paused

<details>
<summary>Solution</summary>

```ts
type GameState = 'playing' | 'gameover' | 'won' | 'paused';

// In update():
function update(deltaTime: number): void {
  controls.update(); // always runs — camera works while paused

  if (gameState !== 'playing') return; // skip everything else when paused/over/won

  for (let i = enemies.length - 1; i >= 0; i--) {
    // ... enemy loop ...
  }
  for (const tower of towers) {
    tower.update(deltaTime, enemies);
  }
  updateWaveSpawner(deltaTime);
}

// In keydown listener:
if (event.key === 'p' || event.key === 'P') {
  if (gameState === 'playing') {
    gameState = 'paused';
    overlayEl.style.fontSize = '36px';
    overlayEl.textContent = 'PAUSED\n\nPress P to resume';
    overlayEl.style.display = 'flex';
  } else if (gameState === 'paused') {
    gameState = 'playing';
    hideOverlay();
  }
}
```

The key insight: `controls.update()` is called unconditionally at the top of `update()`, before the `gameState` check. The camera always responds. Everything else stops.

The Space and 1/2 key guards use `gameState === 'playing'`, so they correctly block input while paused too.

</details>

---

## Quick Check Answers

1. **What happens without state guards:** After losing all lives, `Space` would start a new wave (incrementing `currentWaveIndex` past the end of the `WAVES` array, causing `WAVES[currentWaveIndex]` to be `undefined`). Clicking tiles would place towers and emit events on a "dead" game. Using `gameState` makes the game deterministic — only valid transitions are allowed.

2. **What `type GameState` adds over a plain `let`:** TypeScript infers `let state = 'playing'` as type `string`, which accepts any string including typos. `type GameState = 'playing' | 'gameover' | 'won'` makes TypeScript check every assignment at compile time. It also enables exhaustive checking — if you add a new state to the union later, TypeScript will show errors everywhere that state is not handled.

3. **State that must be reset:** `towers` (meshes removed, tiles freed), `enemies` (meshes removed), `lives` (back to 10), `score` (back to 0), `gameState` (back to `'playing'`), `currentWaveIndex` (back to -1), `waveActive` (back to false), `enemiesSpawnedThisWave` (back to 0), `spawnTimer` (back to 0). Missing any one causes stale data on the next playthrough.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Enemy killed by tower | Score increments in HUD |
| 2 | Fast enemy killed | Score increases more than slow enemy |
| 3 | Enemy escapes | Score unchanged, life decremented |
| 4 | All lives lost | Game over overlay appears with score |
| 5 | All waves cleared | Win overlay appears with score |
| 6 | Press `Space` on overlay | Nothing happens |
| 7 | Click tile on overlay | Nothing happens |
| 8 | Press `R` after game over | All towers and enemies gone, HUD shows "Press Space to start", score = 0 |
| 9 | Press `R` after win | Same clean reset |
| 10 | Press `R` mid-game | Instant clean reset, all state cleared |
| 11 | TypeScript terminal | Zero errors |

---

## Complete File Listing

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Event System ---

type EventCallback = (data: unknown) => void;

class EventEmitter {
  private listeners: Map<string, Array<EventCallback>> = new Map();

  on(eventName: string, callback: EventCallback): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    const callbacks = this.listeners.get(eventName)!;
    callbacks.push(callback);
  }

  emit(eventName: string, data: unknown): void {
    if (!this.listeners.has(eventName)) {
      return;
    }
    const callbacks = this.listeners.get(eventName)!;
    callbacks.forEach((callback) => {
      callback(data);
    });
  }
}

const gameEvents = new EventEmitter();

// --- Grid Types ---

interface Tile {
  row: number;
  col: number;
  walkable: boolean;
  occupied: boolean;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

// --- Tower Types ---

interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
  damage: number;
}

abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;
  readonly damage: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;
    this.damage = config.damage;

    const geometry = new THREE.CylinderGeometry(
      config.topRadius,
      config.bottomRadius,
      config.height,
      8
    );
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = config.height / 2;
    this.mesh.position.z = tile.mesh.position.z;
  }

  update(deltaTime: number, activeEnemies: Enemy[]): void {
    let target: Enemy | null = null;
    let closestDist = this.range;

    for (const enemy of activeEnemies) {
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= closestDist) {
        closestDist = dist;
        target = enemy;
      }
    }

    if (target !== null) {
      target.takeDamage(this.damage * deltaTime);
    }
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.25,
      bottomRadius: 0.35,
      height: 1.2,
      color: 0x3355ff,
      range: 1.5,
      damage: 25,
    });
  }
}

class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.15,
      bottomRadius: 0.20,
      height: 2.2,
      color: 0x778899,
      range: 3.5,
      damage: 60,
    });
  }
}

type TowerType = 'basic' | 'sniper';

// --- Enemy ---

class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  readonly maxHealth: number = 100;
  health: number = 100;
  done: boolean = false;
  escaped: boolean = false;

  constructor(worldPath: THREE.Vector3[], speed: number) {
    this.worldPath = worldPath;
    this.speed = speed;

    const geometry = new THREE.SphereGeometry(0.3, 12, 8);
    this.material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
    this.mesh = new THREE.Mesh(geometry, this.material);

    if (worldPath.length > 0) {
      this.mesh.position.copy(worldPath[0]);
    }
  }

  takeDamage(amount: number): void {
    if (this.done) return;
    this.health = Math.max(0, this.health - amount);
    const t = this.health / this.maxHealth;
    this.material.color.setRGB(1.0, t * 0.4, 0.0);
    if (this.health <= 0) {
      this.done = true;
    }
  }

  update(deltaTime: number): void {
    if (this.done) return;
    if (this.waypointIndex >= this.worldPath.length) {
      this.escaped = true;
      this.done = true;
      return;
    }

    const target = this.worldPath[this.waypointIndex];
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.05) {
      this.waypointIndex++;
      return;
    }

    const nx = dx / distance;
    const nz = dz / distance;
    this.mesh.position.x += nx * this.speed * deltaTime;
    this.mesh.position.z += nz * this.speed * deltaTime;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

// --- Wave Types ---

interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
}

const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5 },
  { enemyCount: 5, spawnInterval: 1.5, enemySpeed: 2.0 },
  { enemyCount: 8, spawnInterval: 1.0, enemySpeed: 2.8 },
];

// --- Game State ---

type GameState = 'playing' | 'gameover' | 'won';

// --- Constants ---

const GRID_ROWS = 8;
const GRID_COLS = 8;
const TILE_SIZE = 1;
const TILE_GAP = 0.05;
const GRID_OFFSET_X = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const DRAG_THRESHOLD_PX = 5;

const COLOR_TILE_LIGHT = 0x4a7c59;
const COLOR_TILE_DARK  = 0x2d5a3d;
const COLOR_PATH       = 0xa08060;

// --- Path ---

const PATH: Array<{ row: number; col: number }> = [
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 2 }, { row: 3, col: 2 },
  { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
  { row: 5, col: 5 },
  { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
];

const ENEMY_Y = 0.35;

const WORLD_PATH: THREE.Vector3[] = PATH.map(({ row, col }) =>
  new THREE.Vector3(
    GRID_OFFSET_X + col * TILE_SIZE,
    ENEMY_Y,
    GRID_OFFSET_Z + row * TILE_SIZE
  )
);

// --- Renderer ---

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('game-container')!;
container.appendChild(renderer.domElement);

// --- HUD ---

const hudEl = document.createElement('div');
hudEl.style.position = 'absolute';
hudEl.style.top = '16px';
hudEl.style.left = '16px';
hudEl.style.color = 'white';
hudEl.style.fontSize = '18px';
hudEl.style.fontFamily = 'monospace';
hudEl.style.pointerEvents = 'none';
hudEl.style.textShadow = '1px 1px 2px black';
container.appendChild(hudEl);

// --- Overlay ---

const overlayEl = document.createElement('div');
overlayEl.style.position = 'absolute';
overlayEl.style.inset = '0';
overlayEl.style.display = 'none';
overlayEl.style.flexDirection = 'column';
overlayEl.style.alignItems = 'center';
overlayEl.style.justifyContent = 'center';
overlayEl.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
overlayEl.style.color = 'white';
overlayEl.style.fontFamily = 'monospace';
overlayEl.style.textAlign = 'center';
overlayEl.style.pointerEvents = 'none';
overlayEl.style.whiteSpace = 'pre';
container.appendChild(overlayEl);

// --- Scene ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// --- Camera ---

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 10, 8);

// --- Lights ---

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- Controls ---

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2.2;

// --- Grid ---

const grid: Tile[][] = [];

for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const geometry = new THREE.PlaneGeometry(
      TILE_SIZE - TILE_GAP,
      TILE_SIZE - TILE_GAP
    );
    const material = new THREE.MeshStandardMaterial({
      color: (row + col) % 2 === 0 ? COLOR_TILE_LIGHT : COLOR_TILE_DARK,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = GRID_OFFSET_X + col * TILE_SIZE;
    mesh.position.z = GRID_OFFSET_Z + row * TILE_SIZE;

    scene.add(mesh);

    const tile: Tile = {
      row,
      col,
      walkable: true,
      occupied: false,
      mesh,
      material,
    };

    mesh.userData['tile'] = tile;
    grid[row][col] = tile;
  }
}

for (const { row, col } of PATH) {
  const tile = grid[row][col];
  tile.walkable = false;
  tile.material.color.setHex(COLOR_PATH);
}

// --- State ---

const towers: Tower[] = [];
const enemies: Enemy[] = [];
let activeTowerType: TowerType = 'basic';
let lives: number = 10;
let gameState: GameState = 'playing';
let score: number = 0;

let currentWaveIndex: number = -1;
let waveActive: boolean = false;
let enemiesSpawnedThisWave: number = 0;
let spawnTimer: number = 0;

// --- Tower Logic ---

function placeTower(tile: Tile): void {
  const tower: Tower =
    activeTowerType === 'basic' ? new BasicTower(tile) : new SniperTower(tile);
  towers.push(tower);
  scene.add(tower.mesh);
  tile.occupied = true;
  gameEvents.emit('towerPlaced', tower);
}

function removeTower(tile: Tile): void {
  const index = towers.findIndex((t) => t.tile === tile);
  if (index === -1) return;
  const tower = towers[index];
  tower.dispose(scene);
  towers.splice(index, 1);
  tile.occupied = false;
  gameEvents.emit('towerRemoved', tower);
}

// --- Enemy Logic ---

function spawnEnemy(speed: number = 2): void {
  const enemy = new Enemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}

// --- Wave Logic ---

function updateWaveSpawner(deltaTime: number): void {
  if (!waveActive) return;

  const wave = WAVES[currentWaveIndex];
  spawnTimer += deltaTime;

  if (spawnTimer >= wave.spawnInterval && enemiesSpawnedThisWave < wave.enemyCount) {
    spawnTimer -= wave.spawnInterval;
    spawnEnemy(wave.enemySpeed);
    enemiesSpawnedThisWave++;
    gameEvents.emit('waveProgress', { spawned: enemiesSpawnedThisWave, total: wave.enemyCount });
  }

  const allSpawned = enemiesSpawnedThisWave >= wave.enemyCount;
  const allCleared = enemies.length === 0;

  if (allSpawned && allCleared) {
    waveActive = false;
    gameEvents.emit('waveComplete', currentWaveIndex);

    const isLastWave = currentWaveIndex >= WAVES.length - 1;
    if (isLastWave && lives > 0 && gameState === 'playing') {
      gameState = 'won';
      gameEvents.emit('gameWon', score);
    }
  }
}

function startNextWave(): void {
  if (waveActive) return;
  if (currentWaveIndex >= WAVES.length - 1) return;

  currentWaveIndex++;
  waveActive = true;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;

  gameEvents.emit('waveStarted', currentWaveIndex);
}

function resetGame(): void {
  for (let i = towers.length - 1; i >= 0; i--) {
    towers[i].tile.occupied = false;
    towers[i].dispose(scene);
  }
  towers.length = 0;

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].dispose(scene);
  }
  enemies.length = 0;

  lives = 10;
  score = 0;
  currentWaveIndex = -1;
  waveActive = false;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;

  gameState = 'playing';
  hideOverlay();
  updateHUD();
}

// --- HUD and Overlay ---

function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
                '  Enemies: ' + remaining;
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
  }

  hudEl.textContent =
    waveLabel +
    '  |  Score: ' + score +
    '  |  Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}

function showOverlay(title: string, subtitle: string): void {
  overlayEl.style.fontSize = '48px';
  overlayEl.textContent =
    title + '\n\n' + subtitle + '\n\nScore: ' + score + '\n\nPress R to play again';
  overlayEl.style.display = 'flex';
}

function hideOverlay(): void {
  overlayEl.style.display = 'none';
}

gameEvents.on('towerPlaced',   () => { updateHUD(); });
gameEvents.on('towerRemoved',  () => { updateHUD(); });
gameEvents.on('typeChanged',   () => { updateHUD(); });
gameEvents.on('waveStarted',   () => { updateHUD(); });
gameEvents.on('waveComplete',  () => { updateHUD(); });
gameEvents.on('waveProgress',  () => { updateHUD(); });
gameEvents.on('enemyKilled',   () => { updateHUD(); });

gameEvents.on('livesChanged', () => {
  updateHUD();
  if (lives <= 0 && gameState === 'playing') {
    gameState = 'gameover';
    gameEvents.emit('gameOver', score);
  }
});

gameEvents.on('gameOver', () => {
  showOverlay('GAME OVER', 'Better luck next time');
});

gameEvents.on('gameWon', () => {
  showOverlay('YOU WIN', 'All enemies defeated');
});

updateHUD();

// --- Raycaster ---

const raycaster = new THREE.Raycaster();

// --- Input ---

let mouseDownX = 0;
let mouseDownY = 0;

renderer.domElement.addEventListener('mousedown', (event) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});

renderer.domElement.addEventListener('click', (event) => {
  if (gameState !== 'playing') return;

  const dx = event.clientX - mouseDownX;
  const dy = event.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;

  const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const tileMeshes = grid.flat().map((t) => t.mesh);
  const hits = raycaster.intersectObjects(tileMeshes);
  if (hits.length === 0) return;

  const tile = hits[0].object.userData['tile'] as Tile;

  if (!tile.walkable) return;
  if (tile.occupied) {
    removeTower(tile);
  } else {
    placeTower(tile);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === '1' && gameState === 'playing') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2' && gameState === 'playing') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === ' ') {
    event.preventDefault();
    if (gameState === 'playing') startNextWave();
  }
  if (event.key === 'r' || event.key === 'R') {
    resetGame();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game Loop ---

const clock = new THREE.Clock();
const MAX_DELTA = 0.1;

function update(deltaTime: number): void {
  controls.update();

  if (gameState !== 'playing') return;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);

    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        const points = Math.round(enemy.speed * 50);
        score += points;
        gameEvents.emit('enemyKilled', { points, score });
      }
    }
  }

  for (const tower of towers) {
    tower.update(deltaTime, enemies);
  }

  updateWaveSpawner(deltaTime);
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, MAX_DELTA);
  update(deltaTime);
  render();
}

animate();
```

---

> **Lab 15 Preview:** The game is playable end-to-end, but all towers behave identically — scan, target, deal flat damage. Lab 15 introduces tower *behavior* through abstract methods: an optional `onKill()` hook that fires when a tower gets the killing blow, letting each type react differently. The CannonTower will slow enemies it damages (a "slow" debuff using a speed multiplier). The SniperTower will chain damage to a second nearby enemy on kill. This introduces the template method pattern — the base class defines the shape of the behavior, subclasses fill in the details.
