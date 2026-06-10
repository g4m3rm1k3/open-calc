# C++ Masterclass — S-02 — LAB 05 — Food Placement and Random Numbers

**Prerequisites:** S-02 LAB 04. You have Classic and Wrap modes working.

**What this lab adds:**
- Pseudorandom number generation — what "random" means in a deterministic computer
- `<random>` — the modern C++ random library (not `rand()`)
- Seeding with `std::random_device` — different results each run
- Uniform distribution — ensuring food lands anywhere equally
- Avoiding occupied cells — checking that food does not spawn on the snake
- A `placeFood()` function that respawns food correctly every time it is eaten

**Time:** ~55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A computer is deterministic — given the same inputs, it always produces the
>    same outputs. So how can it generate "random" numbers?
> 2. If you use `rand() % 18 + 1` to pick a column in a 20-wide grid (interior
>    columns 1–18), is every column equally likely? What problem might `rand()` have?
> 3. The snake occupies some cells. If food spawns on an occupied cell, the player
>    cannot collect it normally. How do you guarantee food always lands on a free cell?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The Snake game from LAB 04, upgraded with proper food mechanics:

```
Score: 3  |  Length: 6  |  Q=quit
```

Food now:
- Spawns randomly anywhere in the interior (not on the snake body)
- Respawns immediately after being eaten
- Never spawns on the same cell twice in a row (unless the snake moves)
- Uses the modern `<random>` engine — not `rand()`

---

## Part 1 — How Computers Generate "Random" Numbers

### Concept: Pseudorandom Number Generation

**What it is:** Computers are deterministic machines — the same code with the same
inputs always produces the same output. True randomness (from physical phenomena like
radioactive decay or thermal noise) is expensive to acquire. Instead, programs use
**pseudorandom number generators (PRNGs)** — mathematical formulas that produce
sequences of numbers that look statistically random but are completely deterministic.

**The two required components:**
1. **Engine** — the formula that generates the sequence. Given the same starting state,
   always produces the same sequence.
2. **Seed** — the starting state. Different seeds produce different sequences.
   Same seed always produces the same sequence.

**The seed problem:** If you always use the same seed (e.g., `1`), your program
produces the same "random" sequence every run. For a game, this means food appears
in the same positions every time — not useful.

**The solution — `std::random_device`:** A source of entropy from the OS (hardware
events, timing jitter, etc.) that provides a non-deterministic seed value. Using
`std::random_device` as the seed makes each run different.

**`rand()` — why not to use it:**
`rand()` is a C-era function with several problems:
- Small output range (0 to RAND_MAX, which may be only 32767 on some platforms)
- Poor statistical distribution — not all values are equally likely
- Global state — using it in multithreaded code causes data races
- Seeded with `srand(time(0))`, which changes only once per second — same second = same sequence

The `<random>` library (C++11) solves all these problems.

**The modern `<random>` approach:**
```cpp
#include <random>

std::random_device rd;                            // hardware entropy source for seeding
std::mt19937 rng(rd());                           // Mersenne Twister engine, seeded from rd
std::uniform_int_distribution<int> dist(1, 18);  // uniform distribution over [1, 18]

int value = dist(rng);                            // generate one value in [1, 18]
```

**`std::mt19937` — the Mersenne Twister:** A high-quality PRNG with a period of
2^19937 − 1 (the sequence does not repeat for an astronomically long time). It passes
all standard statistical tests for randomness. It is the standard choice for games,
simulations, and any non-cryptographic randomness need.

**`std::uniform_int_distribution<int>(a, b)`:** Guarantees every integer in `[a, b]`
is equally likely. This is NOT guaranteed by `rand() % N` — the modulo operation
introduces bias when RAND_MAX is not divisible by N.

**Watch for:** `std::random_device` may not be available on all platforms (it might
fall back to a deterministic sequence). For games, using `std::mt19937(std::random_device{}())`
is sufficient. For cryptographic purposes, use a cryptographically secure RNG.

---

## Step 1 — Set Up the RNG

Add near the top of `main.cpp`, before any functions:

```cpp
#include <random>      // std::mt19937, std::random_device, std::uniform_int_distribution

// ── RNG globals ──────────────────────────────────────────────────────────────
// Declared at file scope so all functions can use the same engine.
// The engine maintains state between calls — splitting it across functions
// would reset the state and reduce quality.
std::mt19937 g_rng(std::random_device{}());
//            ↑ Mersenne Twister  ↑ seeded from hardware entropy on each run
```

**File-scope variables:** `g_rng` is declared outside any function, at the top of
the file. This makes it accessible to any function in the file. The `g_` prefix
is a convention marking it as a global — use globals sparingly and name them clearly.
Here it is justified: an RNG has state that must persist across function calls.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** No change in behavior yet — we added the engine but haven't used
it. The program still compiles cleanly.

---

## Step 2 — The `placeFood` Function

Add before `main()`:

```cpp
// ── placeFood — find a random empty cell for food ─────────────────────────────
// Returns a Segment with a randomly chosen interior position not occupied by the snake.
// 'body' is checked to avoid spawning food on a snake segment.
// Loops until it finds a free cell — guaranteed to terminate if any free cell exists.
Segment placeFood(const std::deque<Segment>& body) {
    // Interior rows: 1 to GRID_ROWS-2  (exclude wall rows 0 and GRID_ROWS-1)
    // Interior cols: 1 to GRID_COLS-2  (exclude wall cols 0 and GRID_COLS-1)
    std::uniform_int_distribution<int> rowDist(1, GRID_ROWS - 2);
    std::uniform_int_distribution<int> colDist(1, GRID_COLS - 2);

    Segment food;
    bool    occupied = true;

    // Rejection sampling: keep picking until we find a free cell
    while (occupied) {
        food.row = rowDist(g_rng);   // pick a random interior row
        food.col = colDist(g_rng);   // pick a random interior col

        occupied = false;   // assume free until proven otherwise

        // Check every body segment
        for (const Segment& seg : body) {
            if (seg.row == food.row && seg.col == food.col) {
                occupied = true;   // this cell is taken — pick again
                break;             // no need to check more segments
            }
        }
    }

    return food;   // guaranteed: food.row/col is not occupied by the snake
}
```

**Rejection sampling:** The strategy of "pick a random candidate; if it fails, try
again." This is correct and simple. Its expected cost depends on how many cells are
free. If the snake occupies k cells out of N total interior cells, the expected number
of trials is `N / (N - k)`. For a 20×8 grid (108 interior cells) with a snake of
length 10, expected trials = `108 / 98 ≈ 1.1` — almost always one try.

**What happens if the grid is full?** If the snake fills every interior cell
(length = 108 for a 20×8 interior), `placeFood` loops forever. In practice, a
full grid means the player has won. We add a win-detection check before calling
`placeFood` in Step 3.

**Why `break` after finding an occupied cell?** Once we know the candidate is
occupied, checking remaining segments is wasted work. `break` exits the inner
for-loop immediately. The outer while-loop then picks a new candidate.

---

## Step 3 — Integrate `placeFood` into the Game Loop

In `main()`, replace the fixed food positions with calls to `placeFood`:

```cpp
    // ── Initial food placement ────────────────────────────────────────────────
    Segment food = placeFood(body);   // ← was: int foodRow = 2; int foodCol = 5;
```

Update the food collision and respawn logic in the game loop:

```cpp
        // ── Update ────────────────────────────────────────────────────────────
        bool ate = false;
        if (!updateSnake(body, dir, grid, food.row, food.col, ate, mode)) {
            running = false;
            break;
        }

        if (ate) {
            ++score;
            // Check for win condition before placing new food
            const int INTERIOR_CELLS = (GRID_ROWS - 2) * (GRID_COLS - 2);
            if (static_cast<int>(body.size()) >= INTERIOR_CELLS) {
                running = false;   // snake fills the grid — player wins
                break;
            }
            food = placeFood(body);   // ← was: fixed positions
        }
```

Update the render to use `food.row` and `food.col`:

```cpp
        grid[food.row][food.col] = TILE_FOOD;   // ← was: grid[foodRow][foodCol]
```

Update the `updateSnake` call signature to use `food.row`, `food.col`:
```cpp
        if (!updateSnake(body, dir, grid, food.row, food.col, ate, mode)) {
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Food appears at a random position each run (different from the
last). After eating it, new food appears at a different random position — never on
the snake's body.

**Run the program 3 times without changing anything.** Food appears at different
positions each run — the `random_device` seed ensures different sequences.

**Change something:** Replace `std::random_device{}()` with the literal `42`:
`std::mt19937 g_rng(42);`. Recompile. Run 3 times. Food appears in the same
positions every run — the seed is fixed. Change back to `std::random_device{}()`.

---

## 🎯 Challenge: Multiple Food Items

**You know:** `placeFood`, `std::deque`, `Segment`, the render loop.

**Task:** Support exactly 3 food items simultaneously. When one is eaten, immediately
spawn a replacement. Display all three `*` characters on the grid.

Store the food items in a `std::vector<Segment> foods(3)` (a dynamic array — covered
fully in S-03 Tetris; for now treat it like a fixed array that knows its size).

Update `updateSnake` to check collision with any food in the vector.

---

<details>
<summary>▶ Show Solution — Key Changes</summary>

```cpp
#include <vector>   // std::vector

// In main(), replace single food:
std::vector<Segment> foods(3);
for (int i = 0; i < 3; ++i) foods[i] = placeFood(body);

// In the update section, check all food items:
int eatenIdx = -1;
for (int i = 0; i < static_cast<int>(foods.size()); ++i) {
    if (newHead.row == foods[i].row && newHead.col == foods[i].col) {
        eatenIdx = i;
        break;
    }
}
bool ate = (eatenIdx >= 0);
if (ate) {
    ++score;
    foods[eatenIdx] = placeFood(body);   // replace eaten food immediately
}

// In the render section:
for (const Segment& f : foods) {
    grid[f.row][f.col] = TILE_FOOD;
}
```

**Key insight:** `std::vector<Segment>` stores 3 segments with `foods[i]` access.
When one is eaten, only that entry is replaced — the other two remain. This pattern
(a container of game entities, each independently updated) is the foundation of
the entity system you will build in S-09 RPG Engine.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Random food position | Run 3 times — food starts at different cells each time |
| Fixed seed reproducible | Seed `42` always places food at the same position |
| Food not on snake | Eat all food repeatedly — food never spawns on a body segment |
| Food respawns | Immediately after eating, a new `*` appears |
| Win detection | (Theoretical) `body.size() >= INTERIOR_CELLS` triggers clean exit |
| No infinite loop | Even with a long snake, `placeFood` terminates (rejection sampling) |

---

## Quick Check Answers

**1. How can a deterministic computer generate "random" numbers?**
It uses a pseudorandom number generator — a mathematical formula that produces a
long sequence of numbers with statistical properties similar to true randomness.
The sequence is completely determined by its seed. The key insight is that "random"
for games means "unpredictable to the player" — not "truly non-deterministic."
A well-seeded PRNG like Mersenne Twister is unpredictable in practice, even though
it is mathematically deterministic.

**2. Is `rand() % 18 + 1` uniformly distributed?**
Not exactly. `rand()` produces values from 0 to RAND_MAX. If RAND_MAX is not
divisible by 18, some values appear more often than others — this is called **modulo
bias**. For example, if RAND_MAX = 32767, then `32767 / 18 = 1820.38...`, meaning
values 1–7 appear 1821 times while values 8–18 appear only 1820 times out of every
32768 possible outputs. `std::uniform_int_distribution` eliminates this bias by
discarding values that would cause uneven distribution.

**3. How do you guarantee food lands on a free cell?**
Rejection sampling: generate a random position, check if it is occupied, and if so,
discard it and generate another. Repeat until an unoccupied cell is found. This is
correct and efficient when most cells are free. The expected number of attempts is
`total_cells / free_cells` — near 1.0 for most of the game. A worst-case analysis
(very long snake) shows the loop terminates unless the grid is completely full, which
we handle separately as a win condition.
