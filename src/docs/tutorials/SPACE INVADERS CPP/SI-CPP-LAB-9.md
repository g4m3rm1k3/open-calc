# C++ Space Invaders — LAB 9 — Architecture Polish & Code Organization

**Prerequisites**

*   LAB 8 — Real‑Time Loop with `std::chrono`
*   You currently have:
    *   One main `.cpp` file
    *   GameState FSM
    *   Real‑time loop
    *   Bullets, invaders, shields, lives

***

## What This Lab Is About (Very Important)

This lab is **not** about new features.

It is about:

*   making your code **readable**
*   making changes **safe**
*   making future labs **easy instead of painful**

If you ever:

*   open a file and feel lost
*   hesitate to change code because it might break something
*   copy/paste logic because it’s “too tangled”

👉 this lab is how professionals prevent that.

***

## What You Will End With

After LAB 9 you will have:

    src/
      main.cpp
      game.h
      game.cpp
      render.h
      render.cpp
      entities.h
      timing.h

✅ Clear responsibility boundaries  
✅ No circular logic  
✅ No global state soup  
✅ The same game, cleaner design

***

## Quick Check (before reading)

1.  Why is “one giant file” bad even if it works?
2.  Why should headers contain *declarations*, not *logic*?
3.  Why must game logic never include rendering code?

(Answers at the end)

***

## Core Concepts (read before touching code)

***

### Concept: Translation Unit (C++)

**What it is**  
Each `.cpp` file is compiled separately, then linked together.

**Why that matters**

*   Code in one `.cpp` doesn’t “see” another unless declared in a header
*   Forces you to be explicit about interfaces (good thing)

***

### Concept: Header vs Implementation

| File   | Purpose        |
| ------ | -------------- |
| `.h`   | *What exists*  |
| `.cpp` | *How it works* |

**Golden rule**

> You should understand a header **without reading the implementation**.

***

### Concept: Separation of Concerns (SWE)

We now split the project like this:

| Area       | Handles                       |
| ---------- | ----------------------------- |
| Game logic | Rules, state changes          |
| Rendering  | Turning state into characters |
| Timing     | Frame pacing, dt              |
| Entities   | Shared data structures        |

This mirrors **real engines**, just smaller.

***

## Step 1 — Create `entities.h` (data only)

Create `entities.h`:

```cpp
#pragma once
#include <vector>

struct Pos {
    int x;
    int y;
};

struct Bullet {
    double x;
    double y;
};

struct ShieldTile {
    int x;
    int y;
    int hp;
};

struct InvaderField {
    std::vector<Pos> invaders;
    int moveDirX;
};
```

✅ **No functions**  
✅ **No logic**  
✅ Only shared data types

***

### SAVE AND TRY

Compile.

✅ No behavior change  
✅ File compiles

***

## Step 2 — Create `game.h` (game interface)

Create `game.h`:

```cpp
#pragma once
#include "entities.h"
#include <vector>

enum class GameState {
    Start,
    Playing,
    GameOver,
    Win
};

struct GameData {
    Pos playerPos;
    int playerLives;
    int score;
    double elapsedTime;

    std::vector<Bullet> playerBullets;
    std::vector<Bullet> invaderBullets;
    InvaderField invaders;
    std::vector<ShieldTile> shields;

    double invaderStepTimer;
};
```

✅ This is now your **single source of truth** for state.

***

## Step 3 — Move core logic into `game.cpp`

Create `game.cpp`:

```cpp
#include "game.h"
#include "timing.h"
```

Move these functions here from `main.cpp`:

*   `resetGame`
*   `stepInvaders`
*   collision helpers
*   shield/bullet logic
*   enemy firing logic

Prefix functions clearly:

```cpp
void updateGame(GameData& game, double dt);
void checkWinLoss(GameData& game, GameState& state);
```

**Important rule:**  
❌ No `std::cout`  
❌ No rendering  
✅ Only state mutation

***

### SAVE AND TRY

Compile + run.

✅ Same behavior  
✅ Cleaner boundaries

***

## Step 4 — Create `render.h` / `render.cpp`

`render.h`:

```cpp
#pragma once
#include "game.h"

void renderStartScreen();
void renderGame(const GameData& game);
void renderGameOver(const GameData& game);
void renderWin(const GameData& game);
```

`render.cpp`:

```cpp
#include "render.h"
#include <iostream>
```

Move **all** of this here:

*   board creation
*   drawing characters
*   HUD printing

✅ Rendering now depends on game state  
✅ Game logic never prints

***

## Step 5 — Create `timing.h`

```cpp
#pragma once
#include <chrono>

using Clock = std::chrono::steady_clock;
```

Used everywhere consistently.

***

## Step 6 — Simplify `main.cpp`

Now `main.cpp` becomes orchestration only:

```cpp
#include "game.h"
#include "render.h"
#include "timing.h"
#include <thread>

int main() {
    GameData game;
    GameState state = GameState::Start;

    resetGame(game);

    auto previous = Clock::now();

    while (true) {
        auto now = Clock::now();
        double dt = std::chrono::duration<double>(now - previous).count();
        previous = now;

        switch (state) {
            case GameState::Start:
                renderStartScreen();
                break;
            case GameState::Playing:
                updateGame(game, dt);
                renderGame(game);
                checkWinLoss(game, state);
                break;
            case GameState::GameOver:
                renderGameOver(game);
                break;
            case GameState::Win:
                renderWin(game);
                break;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }
}
```

✅ This file is now *easy to reason about*.

***

## Step 7 — Self‑Test still works (critical)

Keep `runSelfTest()` in `game.cpp` and call it from `main.cpp` before loop.

Thank Past‑You for requiring this.

***

## Final Check (LAB 9)

| Check                         | Result |
| ----------------------------- | ------ |
| No logic in render files      | ✅      |
| No printing in game logic     | ✅      |
| `main.cpp` under \~100 lines  | ✅      |
| All state lives in `GameData` | ✅      |
| Easy restart/reset            | ✅      |
| Same gameplay                 | ✅      |

***

## Quick Check Answers

**1. Why is one giant file bad?**  
Because small changes cause unpredictable side effects and slow understanding.

**2. Why headers ≠ logic?**  
Headers describe *contracts*. Logic belongs in implementations so it can change safely.

**3. Why no rendering in game logic?**  
Because gameplay rules should work even with a different renderer (terminal, SDL, tests).

***

## What LAB 9 Gave You

### C++

*   Proper header / source separation
*   Translation‑unit discipline
*   Compile‑time safety

### Software Engineering

*   Clear interfaces
*   Decoupled systems
*   Refactor‑friendly architecture

### Game Development

*   Engine‑shaped codebase
*   Renderer independence
*   Expandability

***

## You’re at a Big Milestone

At this point, you have:
✅ real‑time loop  
✅ state machine  
✅ clean architecture  
✅ test hook  
✅ data‑driven gameplay

This is *already better structured* than many hobby engines.

***

### Next directions (you choose)

*   **LAB 10** — Optional graphics (raylib / SDL) with *zero logic changes*
*   **LAB 10‑A** — Add sound (event‑driven)
*   **LAB 10‑B** — Add levels / waves

Tell me which one you want next and we’ll keep the same discipline.
