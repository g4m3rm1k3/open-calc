# C++ Space Invaders — LAB 5 — Invader Bullets + Player Lives

**Prerequisites:**

*   LAB 4 — Invader tempo & difficulty ramp
*   You already have: player, invaders, player bullets, scoring, win condition, selftest

**What this lab adds:**

*   Invaders shoot bullets downward
*   Player has **lives**
*   Game ends with **GAME OVER** when lives hit zero
*   Randomness is **controlled and testable**
*   Bullet system scales cleanly (entity list reused)

***

## What You Will Build

After this lab:

*   Invaders periodically fire bullets (`!`) downward
*   If a bullet hits the player:
    *   Player loses a life
    *   Bullet disappears
*   HUD shows lives remaining
*   When lives reach 0:

<!---->

    GAME OVER
    Final score: 120
    Turns survived: 87

And you can verify behavior with:

```bash
./invaders --selftest
```

***

## Quick Check (answer before reading)

1.  **Prediction:** Why shouldn’t invaders fire every turn?
2.  **C++:** Why is a second `std::vector<Bullet>` better than reusing player bullets?
3.  **Software Engineering:** Why must randomness be injectable/testable?

(Answers at the end)

***

## Concepts (before code)

***

### Concept: Pattern — Entity List (second reuse)

**Name:** Entity List  
**Category:** Game architecture (non‑GoF)

**You’ve already used it for:**

*   Player bullets
*   Invaders

**Now reused for:**

*   Invader bullets

**Tradeoff:**  
All bullets update each turn → fine at small scale.

**Why it matters:**  
Same pattern, same mental model — no new complexity.

***

### Concept: Randomness with Control (C++ + SWE)

**The problem:**  
`rand()` produces:

*   biased results
*   non‑reproducible bugs
*   untestable behavior

**The solution:**  
Use `<random>` and keep the generator **owned by game state**.

**Minimal example:**

```cpp
#include <random>

std::mt19937 rng{123}; // fixed seed for reproducibility
std::uniform_int_distribution<int> dist(0, 10);
int roll = dist(rng);
```

**Why it matters here:**  
You can:

*   replay bugs
*   test firing rates
*   tune difficulty *without rewrites*

***

### Concept: Cooldown (Scheduling Pattern)

**What it is:**  
A timer that prevents an action from happening too often.

**Pattern:**

```cpp
cooldown -= 1;
if (cooldown <= 0) {
  fire();
  cooldown = reset;
}
```

**Why it matters here:**  
Invaders should fire:

*   not every turn
*   not unpredictably fast

This pairs perfectly with LAB 4’s tempo system.

***

### Concept: Lives as State (Game Design + SWE)

**What it is:**  
An integer counter representing player survivability.

**Why not a boolean?**  
Lives allow:

*   mistakes
*   tension curve
*   better learning structure

**Invariant:**  
Lives never < 0.

***

## Step 1 — Add player lives (visible first)

**Focus:**

*   C++: state variable
*   SWE: observable HUD
*   Game: survivability introduced safely

Add constant:

```cpp
const int playerStartingLives = 3;
```

Add state in `main()`:

```cpp
int playerLives = playerStartingLives;
```

Update HUD:

```cpp
std::cout
  << "Score: " << score
  << " | Lives: " << playerLives
  << " | Turn: " << turnNumber
  << " | Invaders: " << invadersRemaining
  << " | Invader step every: " << currentInvaderIntervalTurns
  << " | Countdown: " << invaderStepCountdownTurns
  << "\n";
```

### SAVE AND TRY

Rebuild and run.

**Expected:** HUD shows `Lives: 3`.

**Terminal verification:**

```bash
./invaders --selftest
```

***

## Step 2 — Add invader bullets (representation only)

Add constants:

```cpp
const char invaderBulletChar = '!';
```

Add state near player bullets:

```cpp
std::vector<Bullet> invaderBullets;
```

Render them (after board creation):

```cpp
for (const Bullet& b : invaderBullets) {
    board[b.y][b.x] = invaderBulletChar;
}
```

### SAVE AND TRY

Rebuild.

✅ No behavior change, but structure is ready.

***

## Step 3 — Invader firing cooldown + RNG

Add includes (first appearance):

```cpp
#include <random>
```

Add RNG state in `main()` **once**:

```cpp
std::mt19937 rng{42}; // fixed seed for now
std::uniform_int_distribution<int> invaderFireChance(0, 9);
```

Add cooldown state:

```cpp
int invaderFireCooldownTurns = 5;
```

Add helper:

```cpp
void tryFireInvaderBullet(
    std::vector<Bullet>& invaderBullets,
    const InvaderField& invaders,
    std::mt19937& rng,
    std::uniform_int_distribution<int>& chance
) {
    if (invaders.invaders.empty()) return;

    if (chance(rng) != 0) return; // ~10% chance

    // fire from a random invader
    std::uniform_int_distribution<int> pick(0, invaders.invaders.size() - 1);
    const Pos& shooter = invaders.invaders[pick(rng)];

    invaderBullets.push_back(Bullet{
        shooter.x,
        shooter.y + 1
    });
}
```

Call it during update **after cooldown logic**:

```cpp
invaderFireCooldownTurns -= 1;
if (invaderFireCooldownTurns <= 0) {
    tryFireInvaderBullet(invaderBullets, invaders, rng, invaderFireChance);
    invaderFireCooldownTurns = 5;
}
```

### SAVE AND TRY

Rebuild and run.

**You should see:**  
Occasional `!` bullets falling down.

***

## Step 4 — Move invader bullets (same pattern as player bullets)

Reuse the same logic shape:

```cpp
void moveInvaderBulletsDown(std::vector<Bullet>& bullets) {
    for (Bullet& b : bullets) {
        b.y += 1;
    }
}
```

Cleanup:

```cpp
void removeOffscreenInvaderBullets(std::vector<Bullet>& bullets) {
    const int bottomPlayableRow = boardHeight - 2;
    bullets.erase(
        std::remove_if(
            bullets.begin(),
            bullets.end(),
            const Bullet& b { return b.y >= bottomPlayableRow; }
        ),
        bullets.end()
    );
}
```

Call every turn.

✅ Bullets fall and disappear.

***

## Step 5 — Bullet hits player (collision reuse)

Add collision check:

```cpp
bool isBulletHittingPlayer(const Bullet& b, const Pos& playerPos) {
    return b.x == playerPos.x && b.y == playerPos.y;
}
```

Apply hits:

```cpp
bool applyInvaderBulletHits(
    std::vector<Bullet>& invaderBullets,
    Pos playerPos,
    int& playerLives
) {
    for (size_t i = 0; i < invaderBullets.size(); ++i) {
        if (isBulletHittingPlayer(invaderBullets[i], playerPos)) {
            invaderBullets.erase(invaderBullets.begin() + i);
            playerLives -= 1;
            return true;
        }
    }
    return false;
}
```

Call in update phase.

***

## Step 6 — GAME OVER condition

After hit processing:

```cpp
if (playerLives <= 0) {
    clearScreenSimple();
    std::cout << "GAME OVER\n";
    std::cout << "Final score: " << score << "\n";
    std::cout << "Turns survived: " << turnNumber << "\n";
    return 0;
}
```

***

## Step 7 — Extend `--selftest` (spec compliance)

Add:

```cpp
std::cout << "playerStartingLives=" << playerStartingLives << "\n";
std::cout << "invaderFireCooldownTurns=5\n";
```

Optional deterministic test:

```cpp
std::cout << "rngTest=" << invaderFireChance(rng) << "\n";
```

### Verify:

```bash
./invaders --selftest
```

***

## Final Check

| Feature           | Verify                    |
| ----------------- | ------------------------- |
| Invaders shoot    | `!` bullets appear        |
| Bullets fall      | Move downward every turn  |
| Player loses life | Bullet hits you           |
| Lives shown       | HUD updates               |
| GAME OVER works   | Lives reach 0             |
| RNG controlled    | Same seed = same behavior |
| Selftest complete | `./invaders --selftest`   |

***

## Quick Check Answers

**1. Why not fire every turn?**  
It would overwhelm the player and remove pacing. Cooldowns create readable difficulty curves.

**2. Why a second bullet list?**  
Single responsibility. Player bullets and invader bullets have different rules and lifetimes.

**3. Why controllable randomness?**  
So bugs become reproducible and systems become testable instead of “mysterious”.

***

## What You Learned

*   **C++:** `<random>`, stateful RNG, vector reuse, collision functions
*   **Software Engineering:** cooldowns, determinism, pattern reuse, invariants
*   **Game:** pressure systems, survivability, risk vs control

***


