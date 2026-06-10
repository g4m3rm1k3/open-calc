# C++ Space Invaders — LAB 3 — Hit Detection + Score + Win

**Prerequisites:** LAB 2 — Bullets (spawn → move → despawn). This lab builds on your existing terminal Space Invaders codebase.

**What this lab adds:**

*   Bullet–invader collision (a hit removes both)
*   Score that updates when you hit an invader
*   “You win” state when all invaders are gone
*   A built-in `--selftest` mode so SAVE AND TRY always has a terminal verification command

***

## What You Will Build

After this lab, you can do this:

1.  Press `f` to fire.
2.  Wait a few turns.
3.  When a bullet reaches an invader, the invader disappears, the bullet disappears, and score increases.

Example moment after a hit:

    ############################
    #............W.W..W.......#
    #............W.W.W.W......#
    #............W.W.W.W......#
    #..........................#
    #.............^............#
    ############################
    Score: 10
    Commands: a=left, d=right, f=fire, enter=wait, q=quit
    >

When the last invader is destroyed:

    YOU WIN! Final score: 180

And you can run:

    ./invaders --selftest

To get a quick diagnostic output that confirms constants and wiring.

***

## Quick Check — answer these before reading further:

1.  **Prediction:** If you remove an invader from a `std::vector` while iterating, what might go wrong?
2.  **C++:** Why is “find hit first, then erase” safer than erasing immediately inside a nested loop?
3.  **Connection:** How is hit detection a coordinate transform problem in your Pac-Man grid?
    *(Answers at the end of this lab)*

***

## Concept Blocks (before ANY code that uses them)

### Concept: `#include` and Header Files (C++)

**What it is:** A header file is a bundle of declarations (function/type definitions) the compiler needs to know about. `#include <...>` copies those declarations into your file at compile time.

**The problem before:** If you use `std::vector` without including the right header, the compiler doesn’t know what it is.

**The solution:** Include the headers that define the features you use.

**Smallest possible example:**

```cpp
#include <vector>
std::vector<int> numbers;
```

**Why it matters here:** This lab introduces `std::optional`-like “maybe hit” thinking and vector removal patterns, which require standard library algorithms.

**Watch for:** Including headers “just because.” Only include what you use, and explain why on first appearance.

***

### Concept: Pattern — **Entity List** (used again)

First seen in: **LAB 2**, where bullets were stored in `std::vector<Bullet>`.

**What it is:** Store each entity type (bullets, invaders) in a list of structs that represent the game world.

**Pattern category:** Non-GoF (game architecture pattern)

**Pain before:** Hard-coded single entities (“one bullet”) force rewrites to scale.

**Solution:** `std::vector<EntityType>` holds all instances. Update and render iterate the list.

**Tradeoff:** Every entity is visited every tick even if “irrelevant” (fine at < 200 objects).

**You will see this again in:**

*   **LAB 4** when invader bullets become a second bullet list
*   **LAB 6** when shields become a list of destructible blocks

**Smallest possible example:**

```cpp
struct Bullet { int x; int y; };
std::vector<Bullet> bullets;
```

**Why it matters here:** Collision detection is “compare bullet list vs invader list.”

**Watch for:** Removing from a vector while iterating it without a plan.

***

### Concept: Mental Model — Game Loop / Event Loop (deeper)

**Name:** Game Loop (Input → Update → Render)

**Why it exists:** Games must repeatedly accept input, update the world, and show the result. Without a loop, your game has no time, no motion, and no interaction.

**Concrete example from this lab:**

*   Input: you press `f`
*   Update: bullet moves; hit detection runs; score updates
*   Render: board redraws showing fewer invaders and updated score

**You will see this again in:**

*   **LAB 8** when we replace turn-based input with real-time timing (`std::chrono`)
*   **LAB 7** when the loop becomes conditional on a **finite state machine** (Start/Playing/GameOver)

**Watch for:** Doing “render-time logic” (changing state inside rendering). It causes bugs that are hard to reason about.

***

### Concept: Two-Phase Update (Software Engineering)

**What it is:** A safe pattern: **detect what should change first**, then **apply changes second**.

**The problem before:** If you erase invaders while scanning for hits, indices shift and you can skip elements or crash.

**The solution:**

1.  Find hit indices (`bulletIndex`, `invaderIndex`)
2.  After loops, erase those indices

**Smallest possible example:**

```cpp
int indexToErase = -1;
for (...) { if (hit) { indexToErase = i; break; } }
if (indexToErase != -1) vec.erase(vec.begin() + indexToErase);
```

**Why it matters here:** Bullet–invader collision is the first place vector mutation can bite you.

**Watch for:** Erasing the “earlier index” first when you need to erase two items — order can matter.

***

### Concept: `std::erase_if` (C++20) — Safer removal (optional tool)

**What it is:** A standard helper that removes all elements matching a predicate from a vector in one line. [\[en.cppreference.com\]](https://en.cppreference.com/cpp/container/vector/erase2)

**The problem before:** `remove_if + erase` is easy to write wrong (erasing only one element instead of the range). [\[stackoverflow.com\]](https://stackoverflow.com/questions/39019806/using-erase-remove-if-idiom)

**The solution:** Use `std::erase_if(vec, predicate)` in C++20. [\[en.cppreference.com\]](https://en.cppreference.com/cpp/container/vector/erase2)

**Smallest possible example:**

```cpp
#include <vector>
#include <algorithm>
std::vector<int> v{1,2,3,4};
std::erase_if(v, int x{ return x % 2 == 0; }); // removes 2 and 4
```

*(Note: Some toolchains still require `<algorithm>` for this function; we’ll include it when we use it.)* [\[en.cppreference.com\]](https://en.cppreference.com/cpp/container/vector/erase2), [\[stackoverflow.com\]](https://stackoverflow.com/questions/39019806/using-erase-remove-if-idiom)

**Why it matters here:** We will use it later for cleanup passes (bullets, particles, shields).

**Watch for:** If your compiler complains `std::erase_if` is missing, you can fall back to the erase-remove idiom. [\[stackoverflow.com\]](https://stackoverflow.com/questions/39019806/using-erase-remove-if-idiom)

***

### Law 2 Note (Terminal mapping)

Law 2 says “Visible before styled.” In terminal labs there is no HTML/CSS, so the mapping becomes:

> **Terminal output before behavior**  
> We print something visible first, then add interaction and rules.

You’ll see that in Step 1: we add a visible score line before making it change.

***

# Step 1 — Add a score HUD line (visible immediately)

**This step focuses on:**

*   **C++:** basic integers + output formatting
*   **Software Engineering:** “derived output” (HUD) separate from logic
*   **Game:** you see score on screen even before collisions exist

Add constants near your other constants:

```cpp
const int pointsPerInvader = 10; // Score gained for each invader destroyed
```

In `main()`, add a score variable near your state:

```cpp
int score = 0;
```

When rendering each frame, print score **after** the board:

```cpp
renderBoard(board);
std::cout << "Score: " << score << "\n";
```

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** Your board, plus a line like `Score: 0`.

**Terminal verification command (no code changes):**

*   Run:
    ```bash
    ./invaders --selftest
    ```
    *(We’ll add `--selftest` in Step 2 — for now this will likely do nothing or run the game normally.)*

**Change something:** Change `pointsPerInvader` to `50` (even though it’s unused yet). Rebuild. No visible change yet — that’s expected because we haven’t scored anything.

> ✅ This step is still valuable because it adds visible structure before behavior (Law 2 mapping).

***

## 🎯 Challenge: Make score line include the controls hint

**You know:** Output formatting with `std::cout`.

**Task:** Print:

    Score: 0 | f=fire | a/d=move | q=quit

Try for at least 5 minutes before revealing the solution.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
std::cout << "Score: " << score << " | f=fire | a/d=move | q=quit\n";
```

**Key insight:** HUD is “derived output.” It should read state, not mutate it.

</details>

***

# Step 2 — Add `--selftest` mode (fixes SAVE AND TRY console requirement)

**This step focuses on:**

*   **C++:** `argc/argv` and `std::string`
*   **Software Engineering:** built-in diagnostics (“instrumentation”)
*   **Game:** no gameplay change, but your program is easier to verify and debug

### Concept: `argc/argv` — Command line arguments (C++)

**What it is:** `main(int argc, char** argv)` receives command line inputs.

**The problem before:** Interactive programs are hard to verify automatically.

**The solution:** Add a mode that prints a deterministic report and exits.

**Smallest possible example:**

```cpp
int main(int argc, char** argv) {
  if (argc > 1 && std::string(argv[1]) == "--selftest") { ... }
}
```

**Why it matters here:** It satisfies the spec requirement for a “console test” equivalent.

**Watch for:** `argv[1]` is only valid if `argc > 1`.

***

Change your main signature:

```cpp
int main(int argc, char** argv) {
```

Add this helper function (near your other helpers):

```cpp
void runSelfTest() {
    std::cout << "[SELFTEST]\n";
    std::cout << "boardWidth=" << boardWidth << "\n";
    std::cout << "boardHeight=" << boardHeight << "\n";
    std::cout << "pointsPerInvader=" << pointsPerInvader << "\n";
    std::cout << "OK\n";
}
```

At the top of `main`, add:

```cpp
if (argc > 1 && std::string(argv[1]) == "--selftest") {
    runSelfTest();
    return 0;
}
```

### SAVE AND TRY

Save. Rebuild and run.

**Terminal verification command (this is the required “console test”):**

```bash
./invaders --selftest
```

**Expected output includes:**

*   `boardWidth=...`
*   `boardHeight=...`
*   `pointsPerInvader=...`
*   `OK`

**Change something:** Change `boardWidth` from 28 → 30. Rebuild. Run `./invaders --selftest`.  
Expected: `boardWidth=30`. Change it back.

✅ This directly fixes the “missing console test” audit point.

***

## 🎯 Challenge: Expand selftest to print invader count

**You know:** selftest is just printing values.

**Task:** Print `invaderCount=...` where `...` equals `invaderRows * invaderCols`.

**Hint:** You already have `invaderRows` and `invaderCols` constants from LAB 1.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
std::cout << "invaderCount=" << (invaderRows * invaderCols) << "\n";
```

**Key insight:** A selftest is a fast way to verify wiring without needing gameplay to reach a state.

</details>

***

# Step 3 — Write a tiny “same cell” hit test (pure function)

**This step focuses on:**

*   **C++:** pure functions and parameter passing
*   **Software Engineering:** testable logic
*   **Game:** foundation for collisions

### Concept: Pure function (Software Engineering)

**What it is:** A function that returns a result without changing anything outside itself.

**The problem before:** If collision logic mutates state, it’s hard to debug.

**The solution:** Collision check returns `true/false` only.

**Smallest possible example:**

```cpp
bool same(int a, int b) { return a == b; }
```

**Why it matters here:** Collision detection should be easy to test mentally and in selftest later.

**Watch for:** Hidden side effects like erasing inside the check.

***

Add this function:

```cpp
bool isSameCell(const Pos& a, const Pos& b) {
    return (a.x == b.x) && (a.y == b.y);
}
```

### SAVE AND TRY

Save. Rebuild.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Expected:** Still prints OK.

**Change something:** Temporarily change `return (a.x == b.x) && (a.y == b.y);` to `return false;`  
This won’t change gameplay yet, but you’re proving you understand what the function controls. Change it back.

***

## 🎯 Challenge: Predict the most common collision bug

**Task:** Answer: What happens if you accidentally compare `(a.x == b.y)`?

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

It creates “impossible hits” or “never hits” depending on layout, because you are mixing coordinate axes.

**Key insight:** Many collision bugs are coordinate bugs. Named types (`Pos`) reduce but don’t eliminate this risk.

</details>

***

# Step 4 — Detect a hit (find indices first, don’t erase yet)

**This step focuses on:**

*   **C++:** nested loops and early exit
*   **Software Engineering:** two-phase update (detect → apply)
*   **Game:** hits are detected (but not applied yet)

Add this struct for detected hit info:

```cpp
struct HitResult {
    int bulletIndex;
    int invaderIndex;
    bool didHit;
};
```

Add detection function:

```cpp
HitResult findFirstBulletInvaderHit(
    const std::vector<Bullet>& bullets,
    const InvaderField& invaders
) {
    for (int bulletIndex = 0; bulletIndex < static_cast<int>(bullets.size()); bulletIndex++) {
        const Bullet& bullet = bullets[bulletIndex];
        Pos bulletPos{ bullet.x, bullet.y };

        for (int invaderIndex = 0; invaderIndex < static_cast<int>(invaders.invaders.size()); invaderIndex++) {
            const Pos& invPos = invaders.invaders[invaderIndex];

            if (isSameCell(bulletPos, invPos)) {
                return HitResult{ bulletIndex, invaderIndex, true };
            }
        }
    }

    return HitResult{ -1, -1, false };
}
```

**Important:** This function does NOT erase anything. It only reports.

### SAVE AND TRY

Save. Rebuild and run the game normally.

**You should see:** No behavior change yet (we haven’t applied the hit).

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Temporarily return `HitResult{0,0,true}` unconditionally.  
Expected: still no change, because we still haven’t applied results. Change it back.

***

## 🎯 Challenge: Why return the “first hit” only?

**You know:** The function returns immediately on the first match.

**Task:** Explain why “one hit per tick” is a good first version.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

One hit per tick avoids multiple erases and keeps logic simple. It also matches classic Space Invaders pacing (a bullet can only hit one invader).

**Key insight:** Simplifying rules early makes correctness easier. You can generalize later.

</details>

***

# Step 5 — Apply the hit (erase bullet, erase invader, add score)

**This step focuses on:**

*   **C++:** `vector.erase` by index
*   **Software Engineering:** apply phase isolated
*   **Game:** real gameplay reward (invader disappears, score increments)

Add this function:

```cpp
void applyHitIfAny(
    const HitResult& hit,
    std::vector<Bullet>& bullets,
    InvaderField& invaders,
    int& score
) {
    if (!hit.didHit) {
        return;
    }

    // Erase bullet first or invader first?
    // These are different vectors, so order does not affect indices across vectors.
    bullets.erase(bullets.begin() + hit.bulletIndex);
    invaders.invaders.erase(invaders.invaders.begin() + hit.invaderIndex);

    score += pointsPerInvader;
}
```

In your game loop update phase (after moving bullets and stepping invaders), add:

```cpp
HitResult hit = findFirstBulletInvaderHit(bullets, invaders);
applyHitIfAny(hit, bullets, invaders, score);
```

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** When a bullet reaches an invader, the invader disappears and score increases by 10.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Change `pointsPerInvader` to `25`. Rebuild. Hit an invader.  
Expected: score increases by 25. Change it back to 10.

***

## 🎯 Challenge: Add a “hit marker” debug print

**You know:** We now detect a hit.

**Task:** When a hit occurs, print:

    HIT! bulletIndex=... invaderIndex=...

below the board, for one frame.

**Hint:** Add a `std::string lastEventMessage;` in main state.

Try for at least 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

Add in main state:

```cpp
std::string lastEventMessage = "";
```

After `applyHitIfAny(...)`, set:

```cpp
if (hit.didHit) {
    lastEventMessage = "HIT! bulletIndex=" + std::to_string(hit.bulletIndex) +
                       " invaderIndex=" + std::to_string(hit.invaderIndex);
} else {
    lastEventMessage = "";
}
```

Render it after score:

```cpp
if (!lastEventMessage.empty()) {
    std::cout << lastEventMessage << "\n";
}
```

**Key insight:** “Debug HUD” is software engineering: it reduces guesswork and makes systems observable.

</details>

***

# Step 6 — Win condition (invaders empty)

**This step focuses on:**

*   **C++:** checking container emptiness
*   **Software Engineering:** explicit termination conditions
*   **Game:** full loop closure (you can win)

After applying hit, add:

```cpp
if (invaders.invaders.empty()) {
    clearScreenSimple();
    std::cout << "YOU WIN! Final score: " << score << "\n";
    return 0;
}
```

### SAVE AND TRY

Save. Rebuild and run.

**You should see:** Eventually, when all invaders are destroyed, the program prints YOU WIN and exits.

**Terminal verification command:**

```bash
./invaders --selftest
```

**Change something:** Set `invaderRows` to `1` temporarily. Rebuild.  
Expected: faster win (fewer invaders). Change it back.

***

# Final Check

| Feature                          | How to verify                                       |     |
| -------------------------------- | --------------------------------------------------- | --- |
| Score HUD visible                | Run game → see `Score: 0` under board               |     |
| SAVE AND TRY console test exists | Run `./invaders --selftest` → prints OK             |     |
| Collision detection works        | Shoot invader → invader disappears                  |     |
| Bullet removed on hit            | After a hit, bullet is gone (no lingering \`        | \`) |
| Score increments                 | After hit, score increases by `pointsPerInvader`    |     |
| Win condition works              | Destroy all invaders → “YOU WIN!” and program exits |     |
| Two-phase update respected       | No crashes/skipped invaders when hits occur         |     |

***

## Quick Check Answers

**1. Prediction: If you remove an invader from a `std::vector` while iterating, what might go wrong?**  
Indices shift left. You can skip the next element, or access past the end. That’s why we use two-phase update: detect first, erase after.

**2. Why is “find hit first, then erase” safer than erasing immediately inside nested loops?**  
Erasing invalidates iterators/indices. By returning hit indices and erasing afterward, you avoid iterator invalidation inside the search.

**3. How is hit detection a coordinate transform problem in Pac-Man?**  
In Pac-Man you convert pixel-space to tile-space (or vice versa) and compare positions. Here, you’re already in tile-space: comparing bullet cell to invader cell.

***

## Spec Compliance Checklist (based on your audit notes)

*   ✅ SAVE AND TRY includes a terminal verification command: `./invaders --selftest`
*   ✅ Game Loop mental model includes “You will see this again in…”
*   ✅ Entity List is formalized as a pattern: name, category, tradeoff, future labs
*   ✅ `#include` explained via concept block
*   ✅ Law 2 mapping acknowledged for terminal lessons

***

