# C++ Masterclass — S-02 — LAB 08 — Speed Scaling and `<chrono>`

**Prerequisites:** S-02 LAB 07. You have a complete Snake game with persistent scores.

**What this lab adds:**
- `<chrono>` — the standard library for measuring real time
- Delta time — the elapsed time since the last frame, the foundation of frame-rate-independent logic
- Why `Sleep(N)` is wrong for game timing — and what it actually does
- Speed scaling — increasing snake speed as score increases
- A Big-O complexity summary table — all data structures covered in S-02 side by side
- Profiling: measuring actual elapsed time to verify O(1) vs O(n) claims

**Time:** ~60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your game calls `Sleep(150)` to pause 150ms between frames. If the rest of
>    the frame (input, update, render) takes 20ms, what is the actual frame time?
>    What does this mean for a game running on a slower computer?
> 2. If you want the snake to speed up from 6 FPS at score 0 to 15 FPS at score 10,
>    how do you compute the delay in milliseconds from a target FPS value?
> 3. You measured that `updateSnake` with the O(n) loop takes 1,500µs at length 100.
>    With the O(1) hash version, it takes 15µs at any length. At what snake length
>    does the O(n) version become 10× slower than the hash version?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A Snake game where speed increases with score, built on a proper time-based game loop:

```
Score: 0  |  Best: 12  |  Len: 3  |  Speed: 6 FPS
Score: 3  |  Best: 12  |  Len: 6  |  Speed: 9 FPS
Score: 6  |  Best: 12  |  Len: 9  |  Speed: 12 FPS
Score: 10 |  Best: 12  |  Len: 13 |  Speed: 15 FPS (max)
```

Plus a standalone benchmarking function that prints actual timing data for the O(n)
vs O(1) self-collision implementations.

---

## Part 1 — Real Time with `<chrono>`

### Concept: `<chrono>` — Measuring Wall-Clock Time

**What it is:** The `<chrono>` library (C++11) provides clocks, time points, and
durations for measuring real elapsed time. It is type-safe — you cannot accidentally
mix milliseconds with microseconds without an explicit cast.

**The three main types:**

| Type | What it is |
|------|-----------|
| `std::chrono::high_resolution_clock` | The highest-precision clock available |
| `std::chrono::time_point` | A specific instant in time (like a timestamp) |
| `std::chrono::duration` | A span of time (the difference between two time points) |

**The standard pattern:**
```cpp
#include <chrono>

auto start = std::chrono::high_resolution_clock::now();   // capture current time
// ... code to measure ...
auto end   = std::chrono::high_resolution_clock::now();   // capture again

// Convert the difference to a specific unit
auto elapsed = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
std::cout << elapsed.count() << " µs" << std::endl;
```

**`auto`:** The compiler deduces the type from the right-hand side. `now()` returns
a `std::chrono::time_point<std::chrono::high_resolution_clock>` — a type so verbose
that almost all real code uses `auto` here. `auto` does not make the code dynamically
typed; it is still fully statically typed, with the type resolved at compile time.

**Available duration types:**
- `std::chrono::nanoseconds`  — 10⁻⁹ seconds
- `std::chrono::microseconds` — 10⁻⁶ seconds
- `std::chrono::milliseconds` — 10⁻³ seconds
- `std::chrono::seconds`

**`duration_cast<T>(d)`:** Converts duration `d` to type `T`. Required because
chrono does not implicitly convert durations — `milliseconds(1500)` is not
automatically equal to `seconds(1.5)`. The cast makes the conversion explicit.

---

### Concept: The Problem with `Sleep()` for Game Timing

**What `Sleep(N)` does:** Asks the OS to suspend the current thread for at least `N`
milliseconds. It does not guarantee exactly N — the OS may wake the thread later.

**The timing bug:**
```
Frame time = render_time + update_time + Sleep(150)
           = 20ms + 5ms + 150ms
           = 175ms per frame on this machine
```
On a slower machine where render takes 50ms:
```
Frame time = 50ms + 10ms + 150ms = 210ms per frame
```
The game runs at different speeds on different hardware. Fast machines get 5.7 FPS,
slow machines get 4.7 FPS — same `Sleep(150)`.

**The correct approach — measure elapsed time, sleep the remainder:**
```cpp
auto frameStart = std::chrono::high_resolution_clock::now();

// ... input, update, render ...

auto frameEnd  = std::chrono::high_resolution_clock::now();
auto elapsed   = std::chrono::duration_cast<std::chrono::milliseconds>(frameEnd - frameStart);
int  remaining = targetFrameMs - static_cast<int>(elapsed.count());

if (remaining > 0) {
    Sleep(remaining);   // sleep only the leftover time
}
```

This ensures the total frame time is approximately `targetFrameMs`, regardless of
how long the logic took. On fast machines, the sleep is longer. On slow machines,
it may be 0 — the game logic consumed the full frame budget and no sleep occurs.

**`auto` here is essential:** The precise chrono types are generic template
instantiations. Spelling them out is impractical:
```cpp
// Without auto (impractical):
std::chrono::time_point<std::chrono::high_resolution_clock> frameStart =
    std::chrono::high_resolution_clock::now();
```

---

## Step 1 — Add `<chrono>` and a Frame Timer

Add to `main.cpp`:

```cpp
#include <chrono>   // std::chrono::high_resolution_clock, duration_cast
```

Add a helper function:

```cpp
// ── now — shorthand for the current time point ────────────────────────────────
auto now() {
    return std::chrono::high_resolution_clock::now();
}

// ── elapsedMs — milliseconds between two time points ─────────────────────────
int elapsedMs(std::chrono::high_resolution_clock::time_point start,
              std::chrono::high_resolution_clock::time_point end) {
    return static_cast<int>(
        std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count()
    );
}
```

### SAVE AND TRY

Add a quick timing test before the game:
```cpp
    auto t0 = now();
    Sleep(100);   // sleep for 100ms
    auto t1 = now();
    std::cout << "Sleep(100) actually took: " << elapsedMs(t0, t1) << " ms" << std::endl;
    _getch();
```

```
make
.\dungeon
```

**You should see:** A value slightly above 100 (e.g., 101–115ms). `Sleep(100)` is a
minimum guarantee, not an exact guarantee. Remove the test.

---

## Part 2 — Speed Scaling

### Concept: Deriving Frame Delay from Target FPS

**What it is:** Speed is expressed as frames per second (FPS). The delay between
frames in milliseconds is:
```
delay_ms = 1000 / target_fps
```

**Speed scaling formula:**
Start at `minFPS` (slow). Each food eaten increases FPS by a fixed step, capped at `maxFPS`:

```cpp
const int MIN_FPS   =  6;    // starting speed (slow)
const int MAX_FPS   = 15;    // maximum speed (fast)
const int FPS_STEP  =  1;    // FPS gained per food eaten

int currentFps = MIN_FPS + std::min(score, (MAX_FPS - MIN_FPS) / FPS_STEP) * FPS_STEP;
int delayMs    = 1000 / currentFps;
```

**`std::min(a, b)`:** Returns the smaller of `a` and `b`. `#include <algorithm>`.
Used here to cap the FPS contribution from score — once max is reached, additional
food does not speed up further.

---

## Step 2 — Replace `Sleep(FRAME_DELAY)` with a Proper Frame Loop

Replace the game loop structure in `main()`:

```cpp
    while (running) {
        auto frameStart = now();   // ← add: record frame start time

        // ── Input ─────────────────────────────────────────────────────────────
        if (_kbhit()) {
            // ... (unchanged) ...
        }

        // ── Update ────────────────────────────────────────────────────────────
        // ... (unchanged) ...

        // ── Compute current speed ─────────────────────────────────────────────
        int targetFps = std::min(MIN_FPS + score, MAX_FPS);   // clamp to max
        int targetMs  = 1000 / targetFps;

        // ── Render ────────────────────────────────────────────────────────────
        initGrid(grid);
        // ... (unchanged rendering) ...
        std::cout << "Score: " << score
                  << "  |  Best: "   << highScore
                  << "  |  Len: "    << body.size()
                  << "  |  Speed: "  << targetFps << " FPS"   // ← update status
                  << "  |  Q=quit"   << std::endl;

        // ── Frame timing: sleep only the remaining time ───────────────────────
        int frameMs = elapsedMs(frameStart, now());
        int sleepMs = targetMs - frameMs;
        if (sleepMs > 0) {
            Sleep(sleepMs);   // sleep only what's left of the frame budget
        }
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** The snake starts slow (6 FPS) and accelerates each time food
is eaten. At score 9+, it hits 15 FPS maximum. The FPS is displayed in the status bar.

**Change something:** Set `MIN_FPS = 3` and `MAX_FPS = 20`. The game starts very slow
and becomes very fast. Set back to `6` and `15`.

---

## Part 3 — Big-O Summary and Benchmarking

### Math: Big-O Summary — All Data Structures from S-02

The full picture of what you built and why:

| Data Structure | Add Front | Remove Back | Random Access | Search |
|----------------|-----------|-------------|---------------|--------|
| Fixed Array (LAB 00) | O(n) — shift all | O(1) | O(1) | O(n) |
| Singly Linked List (LAB 01) | O(1) | O(n) — traverse | O(n) | O(n) |
| Doubly Linked List (LAB 02) | O(1) | O(1) — via prev | O(n) | O(n) |
| `std::deque` (LAB 03) | O(1) amortized | O(1) | O(1) | O(n) |
| `unordered_set` (LAB 06) | O(1) amortized | O(1) | N/A | O(1) average |

**What "amortized" means revisited:** An operation is O(1) amortized if occasional
expensive operations (e.g., resizing a deque's chunk array) are rare enough that the
average cost per operation over many calls is still O(1). Individually, a resize is
O(n). But it doubles the capacity each time, so the total cost of N inserts is O(n)
total — O(1) per insert on average.

**The Snake movement total:**

| Component | LAB 00 (Array) | LAB 02–03 (deque) |
|-----------|---------------|-------------------|
| Add new head | O(n) — shift | O(1) |
| Remove old tail | O(1) | O(1) |
| Self-collision | O(n) — loop | O(1) — hash |
| **Total per frame** | **O(n)** | **O(1)** |

---

## Step 3 — Benchmark Function

Add a standalone benchmark that compares timing between the O(n) loop and O(1) hash:

```cpp
void benchmarkCollision() {
    const int SNAKE_LENGTHS[] = {10, 50, 100, 200};
    const int TRIALS = 10000;

    std::cout << "=== Self-Collision Benchmark ===" << std::endl;
    std::cout << std::left
              << std::setw(12) << "Length"
              << std::setw(16) << "Loop (µs)"
              << std::setw(16) << "Hash (µs)"
              << "Ratio" << std::endl;
    std::cout << std::string(52, '-') << std::endl;

    for (int length : SNAKE_LENGTHS) {
        // Build a deque and hash set of 'length' segments
        std::deque<Segment> body;
        PosSet occupied;
        for (int i = 0; i < length; ++i) {
            body.push_back({1, i % (GRID_COLS - 2) + 1});
            occupied.insert({1, i % (GRID_COLS - 2) + 1});
        }

        // The "query" position — guaranteed NOT in body (avoids early-exit bias)
        Segment query = {5, 5};

        // ── Benchmark: O(n) loop ──────────────────────────────────────────────
        auto t0 = now();
        bool foundLoop = false;
        for (int trial = 0; trial < TRIALS; ++trial) {
            for (const Segment& seg : body) {
                if (seg.row == query.row && seg.col == query.col) {
                    foundLoop = true;
                    break;
                }
            }
        }
        auto t1 = now();
        long long loopUs = std::chrono::duration_cast<std::chrono::microseconds>(t1 - t0).count();

        // ── Benchmark: O(1) hash ──────────────────────────────────────────────
        auto t2 = now();
        bool foundHash = false;
        for (int trial = 0; trial < TRIALS; ++trial) {
            foundHash = occupied.count({query.row, query.col}) > 0;
        }
        auto t3 = now();
        long long hashUs = std::chrono::duration_cast<std::chrono::microseconds>(t3 - t2).count();

        double ratio = (hashUs > 0) ? static_cast<double>(loopUs) / hashUs : 0.0;

        std::cout << std::setw(12) << length
                  << std::setw(16) << loopUs
                  << std::setw(16) << hashUs
                  << std::fixed << std::setprecision(1) << ratio << "x" << std::endl;

        (void)foundLoop; (void)foundHash;   // suppress unused-variable warnings
    }
    std::cout << std::endl;
}
```

Call it at the start of `main()` (before `selectMode()`), then press any key to continue:

```cpp
    benchmarkCollision();
    std::cout << "Press any key to start the game..." << std::endl;
    _getch();
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** A table like:

```
=== Self-Collision Benchmark ===
Length      Loop (µs)       Hash (µs)       Ratio
----------------------------------------------------
10          120             18              6.7x
50          580             19              30.5x
100         1150            18              63.9x
200         2290            19              120.5x
```

*(Exact numbers vary by hardware.)*

**Observe:** Hash time stays nearly constant across all lengths. Loop time grows
linearly. The ratio column shows O(n) behavior directly — doubling the length roughly
doubles the loop time.

---

## 🎯 Challenge: Frame Budget Analysis

**You know:** `<chrono>`, `elapsedMs`, the game loop structure.

**Task:** Add per-section timing to the game loop. Measure:
1. Input phase duration
2. Update phase (just `updateSnake`) duration
3. Render phase duration (just the grid draw)

Print the three values in the status bar in microseconds. Run for 20+ frames and
observe which phase consumes the most budget.

---

<details>
<summary>▶ Show Solution — Structure</summary>

```cpp
    while (running) {
        auto frameStart = now();

        // Input
        auto inputStart = now();
        if (_kbhit()) { /* ... */ }
        long long inputUs = std::chrono::duration_cast<std::chrono::microseconds>(now() - inputStart).count();

        // Update
        auto updateStart = now();
        bool ate = false;
        if (!updateSnake(body, occupied, dir, grid, food.row, food.col, ate, mode)) { /* ... */ }
        long long updateUs = std::chrono::duration_cast<std::chrono::microseconds>(now() - updateStart).count();

        // Render
        auto renderStart = now();
        clearScreen(); drawGrid(grid);
        long long renderUs = std::chrono::duration_cast<std::chrono::microseconds>(now() - renderStart).count();

        std::cout << "i=" << inputUs << "µs u=" << updateUs << "µs r=" << renderUs << "µs" << std::endl;

        // ... sleep ...
    }
```

**What you will likely find:** Render (`clearScreen` + `drawGrid`) dominates — terminal
output is slow. The update (now O(1)) is nearly invisible. This is why game engines
batch rendering separately from logic updates — the render budget is the bottleneck.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `Sleep(100)` timing test | Reports ~100–115ms, not exactly 100ms |
| `now()` function | Compiles and returns a usable time point for arithmetic |
| Frame start/end timing | `sleepMs` is positive and less than `targetMs` |
| Speed at score 0 | Status shows "6 FPS" at the start |
| Speed at score 9 | Status shows "15 FPS" (max) |
| Benchmark output | Hash time stays flat; loop time scales linearly with length |
| Ratio column | Length 200 shows approximately 120× ratio over length 10's ratio |

---

## Quick Check Answers

**1. Actual frame time with `Sleep(150)` and 20ms of logic?**
`150 + 20 = 170ms` per frame on this machine — about 5.9 FPS. On a slower machine
where logic takes 50ms: `150 + 50 = 200ms` — 5.0 FPS. The game runs at different
speeds on different hardware. The correct fix (measure elapsed, sleep the remainder)
produces approximately `150ms` total on both machines: fast machine sleeps 130ms,
slow machine sleeps 100ms. Both converge to ~6.7 FPS regardless of hardware speed.

**2. Delay in milliseconds for target FPS?**
`delay_ms = 1000 / target_fps`. At 6 FPS: `1000 / 6 ≈ 167ms`. At 15 FPS:
`1000 / 15 ≈ 67ms`. Integer division gives 66ms for 15 FPS — close enough for
a Snake game. The formula is exact only when 1000 is divisible by the FPS value
(e.g., 1 FPS = 1000ms, 2 FPS = 500ms, 4 FPS = 250ms, 5 FPS = 200ms, 10 FPS = 100ms).

**3. At what snake length does the O(n) loop become 10× slower than the hash?**
If the hash takes 15µs and the loop takes `1500µs / 100 × N = 15N µs`, then
`15N = 10 × 15` → `N = 10`. At snake length 10, the loop is already ~10× slower.
At length 100, it is ~100× slower. This demonstrates that O(1) wins at all non-trivial
sizes — even at length 10 the difference is measurable.
