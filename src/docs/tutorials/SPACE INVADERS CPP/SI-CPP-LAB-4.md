# C++ Space Invaders — LAB 4 — Invader Tempo + Difficulty Ramp (Speed-Up)

**Prerequisites:** LAB 3 — Hit Detection + Score + Win + `--selftest`. This lab builds on your working turn-based Space Invaders.

**What this lab adds:**

*   Invaders move on a **tempo** (every N turns) instead of every turn
*   Tempo **ramps up** as invaders are destroyed (classic “they get faster” feel)
*   A HUD showing **turn**, **invaders remaining**, and **current tempo**
*   `--selftest` extended so every step has a solid terminal verification command

***

## What You Will Build

Before this lab, invaders move every turn (fast and flat difficulty).

After this lab:

*   At the start of the wave, invaders move slowly (e.g., every 3 turns)
*   As you destroy invaders, the tempo increases (every 2 turns → every 1 turn)
*   The HUD shows:

<!---->

    Score: 40 | Turn: 12 | Invaders: 14 | Invader step every: 2 turns

This is the first real “difficulty curve” mechanic.

***

## Quick Check — answer these before reading further:

1.  **Prediction:** If invaders only move every N turns, what does that do to game difficulty?
2.  **C++:** Why is it helpful to store “turn count” as an integer in state rather than recomputing it?
3.  **Software Engineering:** Why do we compute the invader interval from state (invaders remaining) instead of hard-coding “speedLevel variables” everywhere?
    *(Answers at the end of this lab)*

***

## Concept Blocks (before ANY new code)

### Concept: Derived State (Software Engineering Mental Model)

**What it is:** A value you **compute from other state** instead of storing separately.

**The problem before:** If you store `invaderSpeedLevel` manually, you must remember to update it everywhere (easy to forget → bugs).

**The solution:** Compute “invader step interval” from “invaders remaining” and constants.

**Smallest possible example:**

```cpp
int invadersRemaining = 18;
int intervalTurns = 3 - (18 - invadersRemaining) / 4;
```

**Why it matters here:** Difficulty ramp becomes predictable and easy to debug.

**Watch for:** Negative or zero intervals — always clamp to a minimum.

***

### Concept: Countdown Timer (Turn-Based Version)

**What it is:** An integer that counts down each loop until an action triggers.

**The problem before:** If invaders move every loop, you can’t control pacing.

**The solution:** Decrement `invaderStepCountdownTurns`; only move invaders when it hits 0.

**Smallest possible example:**

```cpp
countdown -= 1;
if (countdown == 0) { doThing(); countdown = resetValue; }
```

**Why it matters here:** This creates the “marching rhythm” of Space Invaders.

**Watch for:** Off-by-one errors (does it trigger too early/late?). We’ll make it testable via HUD.

***

### Concept: `std::max` / clamping values (C++)

**What it is:** A standard function to enforce minimum bounds.

**The problem before:** Interval can become 0 or negative as difficulty ramps.

**The solution:** Clamp to a minimum (e.g., 1 turn).

**Smallest possible example:**

```cpp
int safe = std::max(1, computedValue);
```

**Why it matters here:** Prevents impossible timing.

**Watch for:** Forgetting to include `<algorithm>` if you use `std::max`. (You already included it in LAB 3 for erase helpers—keep it.)

***

### Concept: Game Loop — Level 2 (Tempo inside Update)

**Name:** Game Loop (Input → Update → Render) with internal scheduling

**Why it exists:** Once you have multiple systems (player, bullets, invaders), you need rules for *when* each system updates.

**Concrete example from this lab:**

*   Bullets still update every turn
*   Invaders update only when countdown hits 0
*   The loop remains simple, but update timing becomes intentional

**You will see this again in:**

*   **LAB 8** when “turn countdown” becomes real-time using `std::chrono::steady_clock`
*   **LAB 7** when update rules differ by game mode (Start/Playing/GameOver)

**Watch for:** Hiding timing rules inside rendering — timing must live in update.

***

### Law 2 Note (Terminal mapping)

Law 2 (“Visible before styled”) maps to terminal labs as:

> **Visible output before behavior**
> We will show the tempo values on screen *before* we hook them into invader movement.

***

# Step 1 — Add HUD fields for Turn + Invader Count + Tempo (visible immediately)

**This step focuses on:**

*   **C++:** integers in state + printing
*   **Software Engineering:** observability (debuggable HUD)
*   **Game:** you can see pacing variables before they affect gameplay

Add these constants near your other constants:

```cpp
const int invaderStepIntervalStartTurns = 3; // invaders move every 3 turns at the start
const int invaderStepIntervalMinTurns   = 1; // fastest allowed tempo
const int invadersPerSpeedStep          = 4; // every 4 invaders destroyed -> faster
```

Add state variables in `main()` near `score`:

```cpp
int turnNumber = 0;
```

Add a helper function (near other helpers):

```cpp
int computeInvaderStepIntervalTurns(int initialInvaderCount, int invadersRemaining) {
    const int invadersDestroyed = initialInvaderCount - invadersRemaining;
    const int speedSteps = invadersDestroyed / invadersPerSpeedStep;

    const int rawInterval = invaderStepIntervalStartTurns - speedSteps;

    // Clamp so it never goes below the minimum.
    return std::max(invaderStepIntervalMinTurns, rawInterval);
}
```

Now in your render section (after drawing board), replace your score line with:

```cpp
const int invadersRemaining = static_cast<int>(invaders.invaders.size());
const int initialInvaderCount = invaderRows * invaderCols; // constant for this wave

const int currentInvaderIntervalTurns =
    computeInvaderStepIntervalTurns(initialInvaderCount, invadersRemaining);

std::cout
    << "Score: " << score
    << " | Turn: " << turnNumber
    << " | Invaders: " << invadersRemaining
    << " | Invader step every: " << currentInvaderIntervalTurns << " turns\n";
```

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** The HUD line printed under the board. Even though behavior hasn’t changed, you see:

*   Turn number (currently stuck at 0 until Step 2)
*   Invader count
*   “Invader step every: 3 turns”

**Terminal verification command:**

```bash
./invaders --selftest
```

Expected: Still prints `OK` plus your previous selftest info from LAB 3.

**Change something:** Set `invadersPerSpeedStep` to `1`. Rebuild.  
HUD should show invader interval would drop quickly once invaders are destroyed later. Change it back to `4`.

***

## 🎯 Challenge: Make the HUD show “Destroyed” count too

**You know:** Derived state is computed from other state.

**Task:** Append `| Destroyed: X` where `X = initial - remaining`.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
const int invadersDestroyed = initialInvaderCount - invadersRemaining;

std::cout
    << "Score: " << score
    << " | Turn: " << turnNumber
    << " | Invaders: " << invadersRemaining
    << " | Destroyed: " << invadersDestroyed
    << " | Invader step every: " << currentInvaderIntervalTurns << " turns\n";
```

**Key insight:** A good HUD makes invisible logic visible. That saves you from guessing and “Googling through bugs.”

</details>

***

# Step 2 — Turn counter increments each loop (behavior visible)

**This step focuses on:**

*   **C++:** incrementing state
*   **Software Engineering:** consistent “clock” for turn-based systems
*   **Game:** you can see time advancing

At the bottom of your loop (after input and updates), increment turn number:

```cpp
turnNumber += 1;
```

**Where exactly?** Put it right after your update section (after movement, collision, etc.) so it represents a completed tick.

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** Turn number increases by 1 each time you enter a command.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Change `turnNumber += 1;` to `turnNumber += 5;`.  
Turn jumps by 5 each tick. Change it back.

***

## 🎯 Challenge: Make Enter NOT increment the turn

**You know:** `command` is a string, empty when Enter is pressed.

**Task:** Only increment turn if `command` is not empty.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
if (!command.empty()) {
    turnNumber += 1;
}
```

**Key insight:** “What counts as time?” is a game design decision. Turning it into code is software engineering.

</details>

***

# Step 3 — Add invader tempo countdown (visible but not active yet)

**This step focuses on:**

*   **C++:** countdown integer state
*   **Software Engineering:** scheduling logic as explicit state
*   **Game:** we can inspect countdown before using it

Add state variable near `turnNumber`:

```cpp
int invaderStepCountdownTurns = invaderStepIntervalStartTurns;
```

Update the HUD to show it:

```cpp
std::cout
    << "Score: " << score
    << " | Turn: " << turnNumber
    << " | Invaders: " << invadersRemaining
    << " | Invader step every: " << currentInvaderIntervalTurns << " turns"
    << " | Countdown: " << invaderStepCountdownTurns << "\n";
```

At the end of each loop, decrement countdown:

```cpp
invaderStepCountdownTurns -= 1;
```

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** Countdown decreases each turn.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Set `invaderStepCountdownTurns -= 1;` to `-= 2;`  
Countdown drops faster. Change it back.

✅ Still playable.

***

## 🎯 Challenge: Make countdown wrap back to interval when it hits 0 (still without moving invaders)

**You know:** Countdown timer pattern.

**Task:** If countdown reaches 0, reset it to `currentInvaderIntervalTurns`.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

Put this after decrement:

```cpp
if (invaderStepCountdownTurns <= 0) {
    invaderStepCountdownTurns = currentInvaderIntervalTurns;
}
```

**Key insight:** A timer is just “count down, trigger, reset.” Once you understand it, you can schedule anything (spawns, cooldowns, animations).

</details>

***

# Step 4 — Apply tempo: invaders only step when countdown triggers

**This step focuses on:**

*   **C++:** conditional updates
*   **Software Engineering:** decoupling update frequencies
*   **Game:** invaders march slower at first (true Space Invaders feel)

Right now, you probably call:

```cpp
stepInvaders(invaders);
```

every loop.

Replace that single call with:

```cpp
if (invaderStepCountdownTurns <= 0) {
    stepInvaders(invaders);
    invaderStepCountdownTurns = currentInvaderIntervalTurns;
}
```

And make sure your countdown decrement happens **before** this check, so the “trigger” works.

A clean order for update phase becomes:

1.  bullets move
2.  bullets cleanup
3.  collision apply
4.  countdown decrement
5.  if countdown triggers → invaders step

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** Invaders do **not** move every turn anymore.  
They move only when countdown hits 0.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Set `invaderStepIntervalStartTurns = 1`.  
Invaders should move every turn again. Change it back.

***

## 🎯 Challenge: Keep bullets moving every turn even when invaders don’t

**You know:** update order matters.

**Task:** Ensure bullet movement is not inside the invader countdown `if` block.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

Make sure this is outside:

```cpp
moveBulletsUp(bullets);
removeOffscreenBullets(bullets);
```

and only this is inside:

```cpp
if (invaderStepCountdownTurns <= 0) {
    stepInvaders(invaders);
    invaderStepCountdownTurns = currentInvaderIntervalTurns;
}
```

**Key insight:** Different systems can run at different rates, but you must keep them independent.

</details>

***

# Step 5 — Speed ramp: interval updates as invaders are destroyed (difficulty curve)

**This step focuses on:**

*   **C++:** using derived state in real logic
*   **Software Engineering:** avoid storing redundant speed level
*   **Game:** classic “faster as you win”

You already compute:

```cpp
const int currentInvaderIntervalTurns =
    computeInvaderStepIntervalTurns(initialInvaderCount, invadersRemaining);
```

Now ensure your countdown reset always uses the **current** interval:

```cpp
invaderStepCountdownTurns = currentInvaderIntervalTurns;
```

That’s it — the tempo will ramp automatically as `invadersRemaining` decreases.

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** At the beginning invaders step every 3 turns.  
After you destroy a few invaders, the HUD should show “every 2 turns” and then “every 1 turn”.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Change `invadersPerSpeedStep` from 4 to 2.  
Speed should ramp faster. Change it back.

***

## 🎯 Challenge: Make the speed ramp visible in selftest

**You know:** Selftest prints diagnostics.

**Task:** In `--selftest`, print the interval for:

*   full invaders (initial)
*   half invaders
*   1 invader left

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

Inside `runSelfTest()` add:

```cpp
const int initialInvaderCount = invaderRows * invaderCols;

std::cout << "interval(initial)="
          << computeInvaderStepIntervalTurns(initialInvaderCount, initialInvaderCount)
          << "\n";

std::cout << "interval(half)="
          << computeInvaderStepIntervalTurns(initialInvaderCount, initialInvaderCount / 2)
          << "\n";

std::cout << "interval(1left)="
          << computeInvaderStepIntervalTurns(initialInvaderCount, 1)
          << "\n";
```

**Key insight:** A selftest lets you verify logic without needing perfect gameplay to reach a state.

</details>

***

# Step 6 — Extend `--selftest` to verify new constants (spec compliance reinforcement)

**This step focuses on:**

*   **C++:** adding stable verification points
*   **Software Engineering:** instrumentation culture
*   **Game:** no gameplay change, but reduces future Googling

In `runSelfTest()`, add:

```cpp
std::cout << "invaderStepIntervalStartTurns=" << invaderStepIntervalStartTurns << "\n";
std::cout << "invaderStepIntervalMinTurns=" << invaderStepIntervalMinTurns << "\n";
std::cout << "invadersPerSpeedStep=" << invadersPerSpeedStep << "\n";
```

### SAVE AND TRY

Save. Rebuild.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Expected:** Those three lines appear and match your constants.

**Change something:** Temporarily set `invaderStepIntervalMinTurns = 2`.  
Selftest should reflect it. Run the game and notice invaders never reach “every 1 turn”. Change back.

***

# Final Check (verify every feature)

| Feature                              | Exactly how to verify                                                 |
| ------------------------------------ | --------------------------------------------------------------------- |
| HUD shows Turn / Invaders / Interval | Run game → HUD prints those fields                                    |
| Turn counter increments              | Enter commands → Turn increases                                       |
| Countdown exists and changes         | HUD shows Countdown decreasing                                        |
| Invaders move only on tempo          | Invaders shift sideways only when countdown triggers                  |
| Tempo ramps up as invaders die       | Destroy invaders → HUD interval decreases (3 → 2 → 1)                 |
| `--selftest` validates new rules     | Run `./invaders --selftest` → prints new constants + interval samples |
| Game still winnable                  | Destroy all invaders → YOU WIN (from LAB 3) still triggers            |

***

## Quick Check Answers

**1. If invaders only move every N turns, what does that do to game difficulty?**  
It creates pacing: early game is manageable (time to aim), late game becomes tense (less time between steps).

**2. Why store turn count in state instead of recomputing?**  
Because “time” is a first-class concept. Storing it makes behavior explicit and debuggable.

**3. Why compute interval from state rather than storing speed variables everywhere?**  
Derived state avoids bugs where you forget to update one of the “speed” variables. The interval always reflects the true game state.

***

## What this lab taught (triple weave)

*   **C++:** derived values, countdown state, clamping with `std::max`, selftest expansion
*   **Software Engineering:** derived state, instrumentation, scheduling, separation of system rates
*   **Game:** Space Invaders pacing + difficulty ramp (classic feel)

***

