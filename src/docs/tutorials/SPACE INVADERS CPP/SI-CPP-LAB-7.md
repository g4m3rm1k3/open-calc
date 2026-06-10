# C++ Space Invaders — LAB 7 — Game States & Reset Flow

**Prerequisites:**

*   LAB 6 — Shields (destructible barriers)
*   You have player lives, win/game‑over, selftest

***

## What You Will Build

You will restructure the game so it has **explicit modes**:

1.  **Start Screen**
        SPACE INVADERS
        Press Enter to Start
2.  **Playing**
    *   Normal gameplay loop
3.  **Game Over**
        GAME OVER
        Final score: 120
        Press Enter to Restart
4.  **Win**
        YOU WIN!
        Final score: 180
        Press Enter for Next Game

✅ You can restart **without restarting the program**  
✅ All state resets cleanly  
✅ No duplicated setup code

This is foundation‑level engine thinking.

***

## Quick Check (before reading)

1.  Why is `bool gameOver` not enough anymore?
2.  Why must “reset game” be its own function?
3.  Why should rendering depend on state, not the other way around?

(Answers at the end)

***

## Concepts (before code)

***

### Concept: Finite State Machine (FSM)

**Name:** Finite State Machine  
**Category:** Core software architecture pattern

**What it is:**  
A system that is **always in exactly one state**, and switches states explicitly.

**States in this lab:**

*   Start
*   Playing
*   GameOver
*   Win

**Minimal example:**

```cpp
enum class GameState { Start, Playing, GameOver };
GameState state = GameState::Start;
```

**Why it matters:**  
Removes tangled boolean logic:

```cpp
if (!gameOver && playing && !won) { ... }  // ❌
```

***

### Concept: State‑Driven Update & Render

**Rule:**

> Update behavior AND rendering depend on game state.

**Why:**

*   No accidental logic triggers
*   No “dead code paths”
*   Easier to add menus later

**Mental model:**

```cpp
switch (state) {
  case Start: renderStart(); break;
  case Playing: updateGame(); renderGame(); break;
}
```

***

### Concept: Reset as a First‑Class Operation

**What it is:**  
A function that rebuilds all game state from constants.

**Why it matters:**

*   Enables restart
*   Prevents leftover state bugs
*   Makes waves & levels trivial later

**Smell to avoid:**

```cpp
score = 0;
lives = 3;
bullets.clear();
// scattered across code ❌
```

***

### Concept: Explicit Ownership of State

**Rule:**  
All mutable state lives in one place (main or a struct).

**Why:**

*   Clear lifetime
*   Testability
*   Predictability

***

## Step 1 — Define game states (no behavior change)

**Focus:**

*   C++ `enum class`
*   Architecture clarity

Add near top:

```cpp
enum class GameState {
    Start,
    Playing,
    GameOver,
    Win
};
```

Add state variable:

```cpp
GameState gameState = GameState::Start;
```

***

### SAVE AND TRY (Step 1)

Rebuild.

✅ Program behavior unchanged  
✅ Just structure introduced

**Terminal verification:**

```bash
./invaders --selftest
```

Optional:

```cpp
std::cout << "gameState=Start\n";
```

***

## Step 2 — Extract full game reset into a function

**Focus:**

*   Software engineering discipline
*   No logic duplication

Create a struct to group state (optional but recommended):

```cpp
struct GameData {
    Pos playerPos;
    int playerLives;
    int score;
    int turnNumber;

    std::vector<Bullet> bullets;
    std::vector<Bullet> invaderBullets;
    InvaderField invaders;
    std::vector<ShieldTile> shields;

    int invaderStepCountdownTurns;
};
```

Create reset function:

```cpp
void resetGame(GameData& g) {
    g.playerPos = defaultPlayerPos();
    g.playerLives = playerStartingLives;
    g.score = 0;
    g.turnNumber = 0;

    g.bullets.clear();
    g.invaderBullets.clear();

    g.invaders = createInvaders();
    createShields(g.shields);

    g.invaderStepCountdownTurns = invaderStepIntervalStartTurns;
}
```

Call it once at startup **and** during restart later.

***

### SAVE AND TRY

Rebuild and run.

✅ Gameplay unchanged  
✅ Structure now centralized

***

## Step 3 — Start Screen state

Replace your main loop logic with a state switch.

At top of loop:

```cpp
clearScreenSimple();

switch (gameState) {
```

### Start screen rendering

```cpp
case GameState::Start: {
    std::cout << "SPACE INVADERS\n\n";
    std::cout << "Press Enter to Start\n";

    std::string input;
    std::getline(std::cin, input);

    if (input.empty()) {
        resetGame(game);
        gameState = GameState::Playing;
    }
    break;
}
```

***

### SAVE AND TRY

Run program.

✅ Game starts on title screen  
✅ Enter starts game

***

## Step 4 — Playing state (move existing logic here)

Wrap all existing gameplay logic:

```cpp
case GameState::Playing: {
    // input
    // update
    // collisions
    // rendering

    if (playerLives <= 0) {
        gameState = GameState::GameOver;
    }

    if (invaders.invaders.empty()) {
        gameState = GameState::Win;
    }
    break;
}
```

✅ **Do not `return 0` anymore** — state transition replaces exit.

***

### SAVE AND TRY

✅ You can now:

*   Die → game switches state
*   Win → game switches state
*   Program no longer exits early

***

## Step 5 — Game Over state

Add:

```cpp
case GameState::GameOver: {
    std::cout << "GAME OVER\n";
    std::cout << "Final score: " << game.score << "\n";
    std::cout << "Turns survived: " << game.turnNumber << "\n\n";
    std::cout << "Press Enter to Restart\n";

    std::string input;
    std::getline(std::cin, input);
    if (input.empty()) {
        resetGame(game);
        gameState = GameState::Playing;
    }
    break;
}
```

***

### SAVE AND TRY

✅ Lose all lives  
✅ See GAME OVER  
✅ Restart works

***

## Step 6 — Win state

Add:

```cpp
case GameState::Win: {
    std::cout << "YOU WIN!\n";
    std::cout << "Final score: " << game.score << "\n\n";
    std::cout << "Press Enter to Play Again\n";

    std::string input;
    std::getline(std::cin, input);
    if (input.empty()) {
        resetGame(game);
        gameState = GameState::Playing;
    }
    break;
}
```

***

### SAVE AND TRY

✅ Win the game  
✅ Restart works  
✅ Loop is clean

***

## Step 7 — Extend `--selftest` (state validation)

In `runSelfTest()`:

```cpp
std::cout << "GameStates=Start,Playing,GameOver,Win\n";
```

Optional deterministic test:

```cpp
GameData g;
resetGame(g);
std::cout << "resetLives=" << g.playerLives << "\n";
std::cout << "resetScore=" << g.score << "\n";
```

***

## Final Check

| Feature              | Verify                            |
| -------------------- | --------------------------------- |
| Start screen         | Program launches to title         |
| State transitions    | Start → Playing → Win/GameOver    |
| No early exits       | Program never `return`s mid‑game  |
| Restart works        | Enter resets game fully           |
| Reset is centralized | `resetGame()` is sole initializer |
| Selftest validates   | `./invaders --selftest`           |

***

## Quick Check Answers

**1. Why not `bool gameOver`?**  
Because you now have multiple distinct modes with different rules and rendering.

**2. Why reset in a function?**  
Because restart, next wave, or multiplayer reuse all need identical setup.

**3. Why render based on state?**  
Because rendering is output, and output must follow logic — not drive it.

***

## What LAB 7 Gave You

### C++

*   `enum class`
*   Struct‑based state ownership
*   Clean loop control

### Software Engineering

*   Finite State Machine architecture
*   Single‑entry resets
*   Elimination of tangled booleans

### Game Development

*   Menus
*   Restart flows
*   Engine‑style control structure

***


