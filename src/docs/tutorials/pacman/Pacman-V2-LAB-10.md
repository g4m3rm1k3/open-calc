# Pac-Man V2 — LAB 10 — Power Pellets and Frightened Ghosts

**Prerequisites:** LAB 09 — Lives and FSM Game States.

**What this lab builds:**
- Power Pellets (rendering and eating)
- Ghost FSM (State Machine specifically for ghost behaviors)
- Visual state change (ghosts turn blue)
- Behavioral state change (ghosts wander randomly instead of chasing, collision is safe)

**Time:** 60–75 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. We have a Game FSM (`START`, `PLAYING`). Why do ghosts need their own FSM?
> 2. When a ghost is frightened, should it use Manhattan distance to target Pac-Man?
> 3. What happens if Pac-Man collides with a Frightened ghost?
> *(Answers at the end of this lab)*

---

## What You Will Build

Large blinking Power Pellets appear in the corners of the maze. When Pac-Man
eats one, the ghost turns blue and stops chasing him, wandering randomly instead.
If Pac-Man touches a blue ghost, he does not die. After a few seconds, the
ghost flashes and returns to normal.

---

## Mental Model: Ghost FSM

**What it is:** A secondary Finite State Machine that controls an individual
entity's behavior, separate from the global Game State FSM.

**Why it exists:** The game itself is `PLAYING`. But within that playing state,
the ghosts have their own modes. In classic Pac-Man, ghosts switch between
CHASE (hunting Pac-Man), SCATTER (returning to corners), and FRIGHTENED
(running away).

**Canonical example — Guard patrol:** A stealth game guard has a state machine:
`PATROL` (walking a route), `SUSPICIOUS` (heard a noise, looking around), and
`ATTACK` (sees the player, shooting). The overarching game is still active, but
the guard's AI decisions completely change based on its state.

```js
// Inside the ghost object:
const ghost = {
  // ... coordinates, speeds ...
  state: 'CHASE', // Or 'FRIGHTENED'
  frightenedTimer: 0
};
```

---

## Step 1 — Draw the Power Pellets

The maze data (from LAB-03) already has `3` (`TILE_POWER_PELLET`) in the four corners.
We just need to draw them.

Update `drawDots` to draw larger circles for Power Pellets. Replace your existing
`drawDots` function:

```js
const POWER_PELLET_RADIUS = 6;

// drawDots: draws both regular dots and power pellets if not eaten.
function drawDots() {
  for (let row = 0; row < MAZE_ROWS; row++) {
    for (let column = 0; column < MAZE_COLUMNS; column++) {

      const tileType = maze[row][column];
      
      // Skip if it's neither a dot nor a power pellet
      if (tileType !== TILE_DOT && tileType !== TILE_POWER_PELLET) continue;

      const key = dotKey(column, row);
      if (eatenDots.has(key)) continue;

      const pixelX = tileToPixel(column);
      const pixelY = tileToPixel(row);

      ctx.beginPath();
      
      if (tileType === TILE_DOT) {
        ctx.arc(pixelX, pixelY, DOT_RADIUS, 0, Math.PI * 2);
      } else {
        // It's a Power Pellet. Draw it larger.
        ctx.arc(pixelX, pixelY, POWER_PELLET_RADIUS, 0, Math.PI * 2);
      }

      ctx.fillStyle = DOT_COLOR;
      ctx.fill();
    }
  }
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** Four large dots in the corners of the maze. You can walk
over them, but nothing special happens yet. They act exactly like normal dots.

---

## Step 2 — Ghost FSM Variables and Visuals

Update `createGhost` to include the new FSM variables.

```js
const GHOST_STATE_CHASE = 'CHASE';
const GHOST_STATE_FRIGHTENED = 'FRIGHTENED';

function createGhost(spawnColumn, spawnRow, color) {
  return {
    pixelX:     tileToPixel(spawnColumn),
    pixelY:     tileToPixel(spawnRow),
    directionX: 0,
    directionY: -1,
    speed:      1.5,
    color:      color,
    
    // Ghost FSM state:
    state:           GHOST_STATE_CHASE,
    frightenedTimer: 0
  };
}
```

Update `drawGhost` to use the state to determine color:

```js
function drawGhost(ghost) {
  ctx.beginPath();
  ctx.arc(ghost.pixelX, ghost.pixelY, GHOST_RADIUS, 0, Math.PI * 2);
  
  // If frightened, turn blue! Otherwise, use normal color.
  if (ghost.state === GHOST_STATE_FRIGHTENED) {
    // Flash white if the timer is running out (under 60 frames)
    if (ghost.frightenedTimer < 60 && Math.floor(ghost.frightenedTimer / 10) % 2 === 0) {
      ctx.fillStyle = '#ffffff'; // White flash
    } else {
      ctx.fillStyle = '#0000ff'; // Blue
    }
  } else {
    ctx.fillStyle = ghost.color;
  }
  
  ctx.fill();
}
```

---

## Step 3 — Frightened Movement Logic

Currently, ghosts always target Pac-Man via `chooseDirectionToTarget`. We want
them to wander randomly when frightened.

Update `updateGhost`. We will add the timer logic, and branch the AI decision
based on `ghost.state`.

```js
function updateGhost(ghost) {
  // 1. Handle FSM Timers
  if (ghost.state === GHOST_STATE_FRIGHTENED) {
    ghost.frightenedTimer--;
    if (ghost.frightenedTimer <= 0) {
      ghost.state = GHOST_STATE_CHASE;
      ghost.speed = 1.5; // Return to normal speed
    }
  }

  // 2. Move
  ghost.pixelX += ghost.directionX * ghost.speed;
  ghost.pixelY += ghost.directionY * ghost.speed;

  // 3. Tile Alignment & Decisions
  const tileCenterX = tileToPixel(pixelToTile(ghost.pixelX));
  const tileCenterY = tileToPixel(pixelToTile(ghost.pixelY));

  const distFromCenterX = Math.abs(ghost.pixelX - tileCenterX);
  const distFromCenterY = Math.abs(ghost.pixelY - tileCenterY);
  const threshold       = ghost.speed + 1;

  if (distFromCenterX <= threshold && distFromCenterY <= threshold) {
    ghost.pixelX = tileCenterX;
    ghost.pixelY = tileCenterY;

    // AI DECISION BRANCHED BY FSM STATE
    let newDirection = null;

    if (ghost.state === GHOST_STATE_FRIGHTENED) {
      // Frightened ghosts wander randomly
      // (Using the function you wrote in LAB-06)
      newDirection = chooseRandomDirection(ghost);
    } else {
      // Normal ghosts chase Pac-Man
      const pacmanColumn = pixelToTile(pacman.pixelX);
      const pacmanRow    = pixelToTile(pacman.pixelY);
      newDirection = chooseDirectionToTarget(ghost, pacmanColumn, pacmanRow);
    }
    
    if (newDirection) {
      ghost.directionX = newDirection.dx;
      ghost.directionY = newDirection.dy;
    }
  }

  // 4. Wrapping
  if (ghost.pixelX < 0)             ghost.pixelX = CANVAS_WIDTH;
  if (ghost.pixelX > CANVAS_WIDTH)  ghost.pixelX = 0;
}
```

---

## Step 4 — Eating the Power Pellet

Now we wire it up. When Pac-Man eats a Power Pellet, all ghosts should transition
to the `FRIGHTENED` state.

Update `checkDotEaten`:

```js
function checkDotEaten() {
  const pacmanColumn = pixelToTile(pacman.pixelX);
  const pacmanRow    = pixelToTile(pacman.pixelY);

  const tileType = maze[pacmanRow][pacmanColumn];
  if (tileType !== TILE_DOT && tileType !== TILE_POWER_PELLET) return;

  const key = dotKey(pacmanColumn, pacmanRow);
  if (eatenDots.has(key)) return;

  eatenDots.add(key);
  
  if (tileType === TILE_DOT) {
    score += DOT_POINTS;
  } else if (tileType === TILE_POWER_PELLET) {
    score += 50; // Power pellets are worth more
    
    // Trigger FRIGHTENED state on all ghosts!
    for (const ghost of ghosts) {
      ghost.state = GHOST_STATE_FRIGHTENED;
      ghost.frightenedTimer = 300; // 5 seconds at 60fps
      ghost.speed = 1.0; // Ghosts move slower when frightened
      
      // Classic Pac-Man detail: Ghosts reverse direction immediately when frightened
      ghost.directionX *= -1;
      ghost.directionY *= -1;
    }
  }

  // Win condition check (if you did the LAB-09 challenge)
  if (eatenDots.size === totalDots) {
    gameState = STATE_WIN;
  }
}
```

---

## Step 5 — Safe Collision

Finally, if Pac-Man touches a Frightened ghost, he should NOT die.
(In the real game, he eats the ghost. For this lab, we just make them harmless
to keep it simple. Ghost eating involves yet another state: `EATEN`).

Update `checkGhostCollision`:

```js
function checkGhostCollision() {
  const COLLISION_DISTANCE = (PACMAN_RADIUS + GHOST_RADIUS) - 3;

  for (const ghost of ghosts) {
    // GUARD CLAUSE: If the ghost is frightened, it cannot hurt Pac-Man!
    if (ghost.state === GHOST_STATE_FRIGHTENED) {
      continue; // Skip collision check for this ghost
    }

    const dx = pacman.pixelX - ghost.pixelX;
    const dy = pacman.pixelY - ghost.pixelY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < COLLISION_DISTANCE) {
      gameState = STATE_DEAD;
      lives--;
      deathTimer = 60;
      return;
    }
  }
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** The ghost chases you normally. Navigate to a corner and eat
the large dot. Instantly, the ghost reverses direction, turns blue, moves slower,
and wanders randomly. Touch the blue ghost — you do not die. After a few seconds,
the blue ghost flashes white, then turns red and begins chasing you again!

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Power Pellets visible | Large dots in corners |
| Frightened Visuals | Eat power pellet -> ghost turns blue |
| Frightened Behavior | Eat power pellet -> ghost reverses and wanders |
| Safe Collision | Touch blue ghost -> Pac-Man survives |
| Frightened Timer | Wait 5 seconds -> ghost flashes white and turns red |

---

## Quick Check Answers

**1. Why do ghosts need their own FSM?**
The overarching Game FSM manages the *entire program's* state (menus, playing,
resetting). The Ghost FSM manages *AI behavior* while the game is in the
`PLAYING` state. Mixing them creates spaghetti code where `gameState = 'FRIGHTENED'`
makes no sense (is the whole game frightened?).

**2. Should a frightened ghost use Manhattan distance to target Pac-Man?**
No! Frightened ghosts don't want to reach Pac-Man. In our simple version, they
wander randomly. (In the authentic arcade game, they actually use a complex
pseudo-random targeting system, but random valid turns simulate the "fleeing"
feel well enough for this architecture).

**3. What happens if Pac-Man collides with a Frightened ghost?**
Because of the `continue` guard clause in `checkGhostCollision`, the collision
logic is simply skipped. To the collision system, frightened ghosts do not exist.

---

## What Is Next — Engine Completion

You have successfully built the Pac-Man Engine!
You've learned:
- **Game Loops** (requestAnimationFrame, state-render separation)
- **Grid Systems** (2D Arrays, pixelToTile transforms)
- **Data Structures** (Sets for instant lookups)
- **Architectural Patterns** (Entity Lists, Finite State Machines)
- **Math** (Manhattan grid distance vs Euclidean radial distance)

This engine is fundamentally the same architecture used to build classic RPGs
(Zelda), tower defense games, and grid-based strategy games. The math and logic
you learned here translates directly to C++, Rust, and Python.
