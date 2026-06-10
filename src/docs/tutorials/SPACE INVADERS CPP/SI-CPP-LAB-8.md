# C++ Space Invaders — LAB 8 — Real‑Time Game Loop (Frame‑Based)

**Prerequisites:**

*   LAB 7 — Game States (Start / Playing / Win / GameOver)
*   You currently have a **turn‑based** loop (press Enter = advance time)

***

## What This Lab Does (Big Picture)

We will replace this mental model:

> “Time advances when the user presses Enter”

with this:

> **Time advances continuously**, measured by the program

✅ The game updates \~60 times per second  
✅ Input no longer triggers time  
✅ Invaders, bullets, and cooldowns become *rate‑based*  
✅ Core logic barely changes — only *when* it runs

This is a **professional‑grade refactor**, not a hack.

***

## Quick Check (before reading)

1.  Why is `std::chrono::steady_clock` preferred over `system_clock`?
2.  Why do we still keep cooldown counters *after* switching to real time?
3.  What bug appears if frame rate controls game speed directly?

(Answers at the end)

***

## Core Concepts (must read before code)

***

### Concept: Real‑Time Game Loop

**What it is:**  
A loop that runs continuously, measuring how much time passed since the last iteration.

**Canonical form:**

```cpp
while (running) {
    pollInput();
    update(deltaTime);
    render();
}
```

**Key idea:**

> *The update logic uses elapsed time instead of assuming “one step per loop”*

***

### Concept: `std::chrono::steady_clock` (C++)

**Why this clock:**

*   Monotonic (never goes backward)
*   Not affected by system time changes
*   Designed for elapsed time measurement

**Minimal example:**

```cpp
auto now = std::chrono::steady_clock::now();
```

You already hinted at this in LAB 4 — now we use it fully.

***

### Concept: Delta Time (`dt`)

**What it is:**  
The time (in seconds) between two frames.

**Why it matters:**  
If your loop runs slower or faster:

*   Movement speed stays consistent
*   Gameplay remains fair

**Bad (frame‑dependent):**

```cpp
bullet.y -= 1;   // ❌ speed tied to frame rate
```

**Good (time‑dependent):**

```cpp
bullet.y -= speed * dt;  // ✅ consistent speed
```

***

### Concept: Rate vs Count (Critical Insight)

| Old (Turn‑Based) | New (Real‑Time)     |
| ---------------- | ------------------- |
| “Every 3 turns”  | “Every 0.5 seconds” |
| Step counter     | Time accumulator    |
| Guessing         | Measured            |

✅ We convert **counters into timers**, not logic into chaos.

***

## Step 1 — Add timing includes & constants

Add headers (first appearance → explained):

```cpp
#include <chrono>
#include <thread>
```

Add constants:

```cpp
const double targetFPS = 60.0;
const double targetFrameTime = 1.0 / targetFPS;
```

***

### SAVE AND TRY (Step 1)

Rebuild.

✅ No behavior change  
✅ Infrastructure only

**Terminal verification:**

```bash
./invaders --selftest
```

Optional selftest line:

```cpp
std::cout << "targetFrameTime=" << targetFrameTime << "\n";
```

***

## Step 2 — Replace turn counter with time accumulator

### Add time state

In `GameData`:

```cpp
double elapsedTime = 0.0;
```

Remove any code that increments `turnNumber` directly.

Instead, track time.

***

## Step 3 — Create real‑time loop skeleton

Replace your main game loop body with:

```cpp
using clock = std::chrono::steady_clock;

auto previousTime = clock::now();

while (true) {
    auto currentTime = clock::now();
    std::chrono::duration<double> frameDelta = currentTime - previousTime;
    previousTime = currentTime;

    double dt = frameDelta.count();
```

✅ `dt` is now the heart of your game.

***

### SAVE AND TRY (Step 3)

At this point the game may run *very fast* or freeze — expected.

✅ Don’t panic. Timing is wired; behavior is next.

***

## Step 4 — Cap frame rate (stability step)

Add at bottom of loop:

```cpp
auto frameEndTime = clock::now();
std::chrono::duration<double> frameDuration = frameEndTime - currentTime;

if (frameDuration.count() < targetFrameTime) {
    std::this_thread::sleep_for(
        std::chrono::duration<double>(targetFrameTime - frameDuration.count())
    );
}
```

✅ This prevents CPU melt  
✅ Keeps timing predictable

***

### SAVE AND TRY (Step 4)

Rebuild and run.

✅ Program no longer spikes CPU  
✅ Frame pacing stable

***

## Step 5 — Convert invader movement to time‑based

### Before (turn‑based)

```cpp
invaderStepCountdownTurns -= 1;
if (invaderStepCountdownTurns <= 0) {
    stepInvaders(invaders);
    invaderStepCountdownTurns = interval;
}
```

***

### After (time‑based)

Add state:

```cpp
double invaderStepTimer = 0.0;
```

Replace logic with:

```cpp
invaderStepTimer += dt;

double invaderStepIntervalSeconds =
    computeInvaderStepIntervalTurns(initialInvaderCount, invadersRemaining) * 0.25;

if (invaderStepTimer >= invaderStepIntervalSeconds) {
    stepInvaders(game.invaders);
    invaderStepTimer = 0.0;
}
```

✅ Same logic  
✅ Real‑time pacing

***

## Step 6 — Convert bullets to real movement

### Player bullets

Add constant:

```cpp
const double bulletSpeed = 10.0; // cells per second
```

Replace movement:

```cpp
for (Bullet& b : bullets) {
    b.y -= bulletSpeed * dt;
}
```

✅ Use `double` positions if desired for smoother motion (optional now)

***

### Invader bullets

Same pattern downward.

***

### SAVE AND TRY (Step 6)

✅ Bullets move smoothly  
✅ Speed consistent even if frame rate changes

(If movement feels too fast/slow → tune constants, not logic)

***

## Step 7 — Input decoupling (important)

**Rule:**

> Input should **not** advance time.

Keep input polling inside the loop, but **never block**.

Replace `std::getline` with non‑blocking input check (simple version):

```cpp
if (std::cin.rdbuf()->in_avail() > 0) {
    std::string command;
    std::getline(std::cin, command);
    handleInput(command);
}
```

✅ Frame loop keeps running  
✅ Player input does not pause the world

***

## Step 8 — Update HUD (time aware)

Replace Turn with Time:

```cpp
game.elapsedTime += dt;
```

Display:

```cpp
std::cout << "Time: " << static_cast<int>(game.elapsedTime)
          << "s | Lives: " << game.playerLives
          << " | Score: " << game.score << "\n";
```

***

## Step 9 — Extend `--selftest`

Add:

```cpp
std::cout << "realTimeLoop=enabled\n";
std::cout << "targetFPS=" << targetFPS << "\n";
```

***

## Final Check (LAB 8)

| Feature                   | Verify                                |
| ------------------------- | ------------------------------------- |
| Continuous gameplay       | Game runs without pressing Enter      |
| Frame‑rate capped         | CPU stable                            |
| Time‑based motion         | Bullets & invaders consistent         |
| Difficulty ramp preserved | Speed increases correctly             |
| Input non‑blocking        | Player moves anytime                  |
| Selftest updated          | `./invaders --selftest` prints timing |

***

## Quick Check Answers

**1. Why `steady_clock`?**  
It never moves backward and isn’t affected by system time changes.

**2. Why keep cooldowns?**  
Because they encode *rules*, not time. Only measurement changes.

**3. What bug happens without delta time?**  
Fast machines run harder/faster games — unfair and unstable.

***

## What LAB 8 Unlocks

### C++

*   `<chrono>`, `<thread>`
*   Real elapsed‑time measurement
*   Frame pacing

### Software Engineering

*   Time decoupling
*   Deterministic simulation
*   Loop‑based architectures used in GUI apps, engines, servers

### Game Dev

*   Real motion
*   Smooth difficulty
*   Professional loop structure

***

## Where You Are Now

You now have:
✅ A real game loop  
✅ Proper state management  
✅ Deterministic logic  
✅ Data‑driven difficulty  
✅ Architecture you can reuse in *any* app

***

