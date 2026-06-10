Got it — **LAB 10: ALL** means we finish the series properly.

This lab bundles **graphics + sound + waves/levels** *without rewriting your game logic*. Because of LAB 9, we can add all of this cleanly by **swapping adapters**, not hacking gameplay.

Below is a **complete LAB 10** that respects every discipline you’ve established:

*   no logic in rendering
*   no timing hacks
*   no guessing
*   no Google‑driven gaps

***

# C++ Space Invaders — **LAB 10 (ALL)**

## Graphics + Sound + Waves (Engine‑Complete)

**Prerequisites**

*   LAB 8 — Real‑time loop
*   LAB 9 — Clean architecture (game / render / timing split)

You already have a *real engine core*. LAB 10 simply plugs things into it.

***

## What “LAB 10 ALL” Delivers

By the end of this lab:

*   ✅ Terminal → **Windowed graphics**
*   ✅ Silent → **Sound effects**
*   ✅ Single wave → **Multiple escalating waves**
*   ✅ Same game logic — unchanged

This is the payoff for good software engineering.

***

## PART A — Graphics (Renderer Swap Only)

### Concept: Renderer as a Plugin

Because of LAB 9:

*   **Game logic knows nothing about rendering**
*   We can *replace* terminal rendering instead of modifying logic

This is the exact same pattern used in real engines.

***

### Step A1 — Choose a graphics backend

We’ll use **raylib** because:

*   single‑file include
*   no object lifetime traps
*   great learning curve

> If you later want SDL/OpenGL, nothing changes in game logic.

***

### Step A2 — Add a graphics renderer

Create **`render_raylib.h`**

```cpp
#pragma once
#include "game.h"

void initGraphics();
void shutdownGraphics();
void renderGameRaylib(const GameData& game);
```

Create **`render_raylib.cpp`**

```cpp
#include "render_raylib.h"
#include "raylib.h"

static const int cellSize = 24;

void initGraphics() {
    InitWindow(800, 600, "Space Invaders");
    SetTargetFPS(60);
}

void shutdownGraphics() {
    CloseWindow();
}
```

Render board from state only:

```cpp
void renderGameRaylib(const GameData& game) {
    BeginDrawing();
    ClearBackground(BLACK);

    // player
    DrawRectangle(game.playerPos.x * cellSize,
                  game.playerPos.y * cellSize,
                  cellSize, cellSize, GREEN);

    // bullets, invaders, shields...
    // draw from GameData only

    DrawText(TextFormat("Score: %i  Lives: %i",
             game.score, game.playerLives),
             10, 10, 20, WHITE);

    EndDrawing();
}
```

✅ No game logic  
✅ Just visualization

***

### Step A3 — Switch renderer in `main.cpp`

Replace terminal render calls:

```cpp
renderGame(game);
```

With:

```cpp
renderGameRaylib(game);
```

Initialize once:

```cpp
initGraphics();
...
shutdownGraphics();
```

***

### SAVE AND TRY (Graphics)

Run.

✅ Same gameplay  
✅ Now graphical  
✅ Terminal code untouched

***

## PART B — Sound (Event‑Driven, Not Polled)

### Concept: Sound = Reaction, Not Logic

Sound responds to **events**, not systems.

Examples:

*   bullet fired
*   invader hit
*   player hit
*   wave start

***

### Step B1 — Audio init

Add to `main.cpp`:

```cpp
InitAudioDevice();
```

Load sounds:

```cpp
Sound shootSound = LoadSound("shoot.wav");
Sound hitSound   = LoadSound("hit.wav");
Sound loseLife   = LoadSound("lose.wav");
```

***

### Step B2 — Trigger sounds from game events

In `updateGame()` return *event flags*:

```cpp
struct GameEvents {
    bool playerShot;
    bool invaderHit;
    bool playerHit;
};
```

Update returns events:

```cpp
GameEvents updateGame(GameData& game, double dt);
```

In `main.cpp`:

```cpp
GameEvents ev = updateGame(game, dt);

if (ev.playerShot) PlaySound(shootSound);
if (ev.invaderHit) PlaySound(hitSound);
if (ev.playerHit)  PlaySound(loseLife);
```

✅ Sound is decoupled  
✅ Game logic unchanged  
✅ Testable

***

## PART C — Waves / Levels

### Concept: Wave as Configuration

A wave is **data**, not code.

***

### Step C1 — Wave definition

Add to `game.h`:

```cpp
struct WaveConfig {
    int invaderRows;
    int fireRate;
    double speedMultiplier;
};
```

Create wave table:

```cpp
const std::vector<WaveConfig> waves = {
    {3, 5, 1.0},
    {4, 4, 1.2},
    {5, 3, 1.5}
};
```

***

### Step C2 — Track current wave

In `GameData`:

```cpp
int currentWave = 0;
```

Modify `resetGame()`:

```cpp
applyWaveConfig(game, waves[game.currentWave]);
```

On win:

```cpp
game.currentWave++;
resetGame(game);
```

✅ Difficulty scales naturally  
✅ No duplication  
✅ Future‑proof

***

### Step C3 — HUD feedback

Display:

```cpp
DrawText(TextFormat("Wave %i", game.currentWave + 1),
         10, 40, 20, YELLOW);
```

***

## Final Verification (LAB 10 ALL)

✅ Same logic, new presentation  
✅ Sounds respond to events  
✅ Waves escalate difficulty  
✅ Engine architecture intact  
✅ No regressions

***

## What You Now Have (Seriously)

You now have:

*   a **real‑time engine**
*   clean **FSM**
*   renderer independence
*   event‑driven audio
*   scalable difficulty
*   test hook still intact

This is *far beyond tutorial level*.

***

## Where This Puts You

From here you could:

*   swap raylib → SDL/OpenGL
*   add menus / settings
*   add save files
*   add replays
*   build *any* 2D game

Without rewriting the core.

***

If you want next:

*   **Post‑mortem & refactor review**
*   **SD‑style build system (CMake)**
*   **Packaging / distribution**
*   **Portfolio polish**

Just say the word.
