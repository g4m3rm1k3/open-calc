# Pac-Man V2 — LAB 09 — Lives and Game States

**Prerequisites:** LAB 08 — Ghost collision resets via page reload.

**What this lab builds:**
- A Finite State Machine (FSM) for game phases
- Lives tracking
- A "Ready!" start screen and "Game Over" screen
- Proper position resetting without reloading the browser

**Time:** 45–60 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. Why is `location.reload()` a bad way to reset the game when Pac-Man is caught?
> 2. The game loop runs 60 times a second. If the game is "Game Over", should `updatePacman()` still run?
> 3. How do you keep the score and eaten dots from resetting when Pac-Man dies?
> *(Answers at the end of this lab)*

---

## What You Will Build

The game no longer reloads when you die. Instead, the game starts in a `START`
state showing "Press Space". When you play and get caught, the state changes to
`DEAD`, pausing movement for a moment. Then it resets Pac-Man and the ghosts
to their starting positions and resumes. If you lose 3 lives, you get a
`GAME_OVER` screen.

---

## Mental Model: Finite State Machine (FSM)

**What it is:** A system that can only be in exactly ONE predefined state at a
time. The system defines the states, and the specific events that transition
the system from one state to another.

**Why it exists:** Games need phases: menus, playing, paused, dead, game over.
If you just use random boolean flags (`isDead`, `isPlaying`, `isGameOver`), you
inevitably get bugs where the game is `isDead = true` AND `isPlaying = true` at
the same time. An FSM prevents this.

**Canonical example — a traffic light:** A traffic light is an FSM.
States: Green, Yellow, Red.
Transitions: Green -> Yellow -> Red -> Green.
A traffic light can never be Green and Red at the same time. There is one
variable (`state = 'GREEN'`), not three booleans.

**Where it will appear again:** LAB-10 when we give the Ghosts their own FSM
(Scatter, Chase, Frightened).

---

## Logic: Guard Clauses in the Game Loop

**What it decides:** Should this code run right now based on the current state?

**Canonical example:** A bouncer at a club. If you aren't on the list, the
bouncer stops you at the door. `if (!onList) return;` The rest of the club logic
only happens if you pass the guard.

**The code:**
```js
function update() {
  if (gameState !== STATE_PLAYING) {
    // If we are not playing (e.g. Game Over, or Dead), don't move anything!
    // We check input for restarting, then return.
    checkRestartInput();
    return; // Guard clause: Stop here.
  }

  // Normal playing logic...
  updatePacman();
}
```

---

## Step 1 — Add State Constants and Variables

Add these variables at the top of your state section (near `score` and `eatenDots`):

```js
// ── Game State (FSM) ──────────────────────────────────────────────────────────

const STATE_START     = 'START';     // Waiting for player to press Space
const STATE_PLAYING   = 'PLAYING';   // Active gameplay
const STATE_DEAD      = 'DEAD';      // Pac-Man caught, pausing before reset
const STATE_GAME_OVER = 'GAME_OVER'; // 0 lives, waiting to restart

let gameState = STATE_START;         // The FSM current state variable
let lives = 3;                       // Player lives
let deathTimer = 0;                  // Counter for the pause when caught
```

### SAVE AND TRY

Save. Nothing changes visually because we haven't wired the states to the loop.

---

## Step 2 — Hook FSM into Update

Update the `update()` function to use the guard clause pattern. It should only
move entities if the state is `PLAYING`.

Replace your `update()` function with this:

```js
function update() {
  // If we are in the START or GAME_OVER states, wait for the Space key.
  if (gameState === STATE_START || gameState === STATE_GAME_OVER) {
    if (keysHeld['Space']) {
      resetFullGame(); // We will write this next
    }
    return; // Stop here! No movement.
  }

  // If we are DEAD, just count down a timer, then reset positions.
  if (gameState === STATE_DEAD) {
    deathTimer--;
    if (deathTimer <= 0) {
      if (lives > 0) {
        resetPositions(); // We will write this next
        gameState = STATE_PLAYING;
      } else {
        gameState = STATE_GAME_OVER;
      }
    }
    return; // Stop here! No movement while dead.
  }

  // --- Normal PLAYING state ---

  if (keysHeld['ArrowRight']) { pacman.nextDirX =  1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowLeft'])  { pacman.nextDirX = -1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowDown'])  { pacman.nextDirX =  0; pacman.nextDirY =  1; }
  if (keysHeld['ArrowUp'])    { pacman.nextDirX =  0; pacman.nextDirY = -1; }

  updatePacman();
  checkDotEaten();
  ghosts.forEach(ghost => updateGhost(ghost));
  
  checkGhostCollision();
}
```

---

## Step 3 — The Reset Functions

In LAB-08 we used `location.reload()`. This wiped the score and eaten dots.
We need a function that *only* resets positions.

Add these functions:

```js
// resetPositions: puts Pac-Man and Ghosts back at their spawn points.
// Score, lives, and eaten dots remain unchanged.
function resetPositions() {
  // Reset Pac-Man
  pacman.pixelX = tileToPixel(PACMAN_SPAWN_COLUMN);
  pacman.pixelY = tileToPixel(PACMAN_SPAWN_ROW);
  pacman.directionX = 0;
  pacman.directionY = 0;
  pacman.nextDirX = 0;
  pacman.nextDirY = 0;

  // Reset all ghosts
  ghosts[0].pixelX = tileToPixel(GHOST_SPAWN_COLUMN);
  ghosts[0].pixelY = tileToPixel(GHOST_SPAWN_ROW);
  ghosts[0].directionX = 0;
  ghosts[0].directionY = -1;
}

// resetFullGame: called when starting a fresh game (from START or GAME_OVER).
// Wipes everything.
function resetFullGame() {
  score = 0;
  lives = 3;
  eatenDots.clear(); // Set.clear() empties the Set instantly
  resetPositions();
  gameState = STATE_PLAYING;
}
```

Now, update `checkGhostCollision()` to use our new FSM instead of reloading:

```js
function checkGhostCollision() {
  const COLLISION_DISTANCE = (PACMAN_RADIUS + GHOST_RADIUS) - 3;

  for (const ghost of ghosts) {
    const dx = pacman.pixelX - ghost.pixelX;
    const dy = pacman.pixelY - ghost.pixelY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < COLLISION_DISTANCE) {
      // FSM Transition: PLAYING -> DEAD
      gameState = STATE_DEAD;
      lives--;
      deathTimer = 60; // 60 frames = 1 second pause
      return;
    }
  }
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** A frozen game. Pac-Man and the Ghost are on screen but do
not move. Pressing arrows does nothing. Press `Spacebar`. The game starts!
Let the ghost hit you. The game pauses for 1 second, then positions reset, and
you can play again. Score and eaten dots are preserved.

**In DevTools Console:**
```js
gameState
```
**Expected:** `'START'`, `'PLAYING'`, `'DEAD'`, or `'GAME_OVER'` depending on
when you check it.

---

## Step 4 — Hook FSM into Render (UI)

We need text on screen to tell the player what state the FSM is in.

Add `drawUI` and call it at the end of `render()` (after `drawScore()`):

```js
// drawUI: Renders overlay text based on the current Game State.
function drawUI() {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center'; // Centers text at the given X coordinate

  const centerX = CANVAS_WIDTH / 2;

  if (gameState === STATE_START) {
    ctx.fillStyle = '#ffff00';
    ctx.fillText('READY!', centerX, CANVAS_HEIGHT / 2);
    ctx.font = '14px Arial';
    ctx.fillText('Press SPACE to Start', centerX, CANVAS_HEIGHT / 2 + 30);
  }

  if (gameState === STATE_GAME_OVER) {
    ctx.fillStyle = '#ff0000';
    ctx.fillText('GAME OVER', centerX, CANVAS_HEIGHT / 2);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Press SPACE to Restart', centerX, CANVAS_HEIGHT / 2 + 30);
  }

  // Draw Lives indicator in the bottom left
  ctx.fillStyle = '#ffff00';
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Arial';
  ctx.fillText(`LIVES: ${lives}`, 8, CANVAS_HEIGHT - 8);
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** Yellow "READY!" text in the center. Press Space to play.
Let the ghost catch you 3 times. See "GAME OVER" in red. Press Space to restart.

---

## 🎯 Challenge: Winning the Game State

**You know:** In LAB-05's challenge, we printed "YOU WIN" to the console. Now we
have a real FSM.

**Task:** Add a `STATE_WIN` state. When Pac-Man eats all the dots, transition to
`STATE_WIN`. In `drawUI`, show "YOU WIN!" in green. Let the player press Space
to restart the game.

**Hints:**
1. Add `const STATE_WIN = 'WIN';`.
2. Update the win check in `checkDotEaten()`.
3. Add a guard clause in `update()` so pressing Space in `STATE_WIN` calls `resetFullGame()`.
4. Add the rendering logic in `drawUI()`.

---

<details>
<summary>▶ Show Solution</summary>

In variables: `const STATE_WIN = 'WIN';`

In `checkDotEaten`:
```js
  if (eatenDots.size === totalDots) {
    gameState = STATE_WIN;
  }
```

In `update`:
```js
  if (gameState === STATE_START || gameState === STATE_GAME_OVER || gameState === STATE_WIN) {
    if (keysHeld['Space']) resetFullGame();
    return;
  }
```

In `drawUI`:
```js
  if (gameState === STATE_WIN) {
    ctx.fillStyle = '#00ff00';
    ctx.fillText('YOU WIN!', centerX, CANVAS_HEIGHT / 2);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Press SPACE to Play Again', centerX, CANVAS_HEIGHT / 2 + 30);
  }
```

**Key insight:** Adding new phases to a game is incredibly easy once the FSM
architecture is in place. You just define the state, define what triggers it,
and define what it looks like.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Starts in READY state | Text shows READY, entities don't move |
| Space starts game | Press Space -> Game plays normally |
| Collision removes life | Get hit -> Pause 1s -> Positions reset -> Lives goes down |
| Game Over triggers | Lose 3 lives -> GAME OVER text appears |
| Score persists | Eat dots, get hit -> Score does not reset to 0 |

---

## Quick Check Answers

**1. Why is `location.reload()` bad?**
Because the browser throws away all memory. Your `score`, your `eatenDots` Set,
and your `lives` variable are all destroyed. A game loop needs to maintain state
persistently.

**2. Should `updatePacman()` still run during Game Over?**
No. If the game is over, the player shouldn't be able to move Pac-Man. The guard
clause `if (gameState !== STATE_PLAYING) return;` prevents `updatePacman()` from
running.

**3. How do you keep score from resetting when Pac-Man dies?**
By separating `resetPositions()` from `resetFullGame()`. When caught, you only
reset coordinates, leaving the `score` and `eatenDots` variables untouched.

---

## What Is Next — LAB 10

LAB 10 introduces the iconic Power Pellet. When Pac-Man eats it, the Ghosts
get their own FSM! They transition into a `FRIGHTENED` state, turn blue, and
run away (randomly). This is where all the patterns (Data-driven rendering,
FSM, Distance, Grid math) come together.

*Continue to Pac-Man V2 — LAB 10 — Power Pellets and Frightened Ghosts.*
