# C++ Masterclass — S-01 — LAB 04 — Loops

**Prerequisites:** LAB 03. You can branch with `if / else if / else` and read user input with `std::cin`.

**What this lab adds:**
- The `while` loop — the foundation of every game loop in this masterclass
- The `for` loop — indexed iteration over a range
- The `do-while` loop — guaranteed to run at least once (used for input validation)
- `break` — exiting a loop before the condition changes
- `continue` — skipping the rest of one iteration
- Nested loops — a loop inside a loop (the foundation of grid rendering)
- Loop invariants — the mental tool for proving a loop is correct

**Time:** ~70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `while` loop checks its condition before each iteration. What does that mean
>    for a `while` loop where the condition is `false` from the very start?
>    Will its body run zero times, once, or forever?
> 2. Consider the loop `for (int i = 0; i < 5; ++i)`. What values does `i` take?
>    List them in order.
> 3. Predict: If you have a loop that prints numbers from 1 to 10, and you add
>    `if (num == 5) continue;` inside it, what gets printed?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **dungeon map sketcher** — you enter dimensions and it draws a text map of a dungeon
floor. This is the exact rendering technique used in every game series that follows:

```
Enter dungeon width (2-20):  10
Enter dungeon height (2-10): 4

Generating floor 1 of 5...
Generating floor 2 of 5...
Generating floor 3 of 5...
Generating floor 4 of 5...
Generating floor 5 of 5...

# # # # # # # # # #
# . . . . . . . . #
# . . . . . . . . #
# # # # # # # # # #
```

---

## Part 1 — The `while` Loop

### Concept: The `while` Loop — Repeat While True

**What it is:** A loop that checks a condition before each iteration. If the condition
is `true`, the loop body runs. Then the condition is checked again. This continues until
the condition becomes `false`, at which point execution continues after the loop.

```
┌──────────────────────────────┐
│  while (condition) {         │
│      ↑                       │
│      └─── check condition ───┤
│          if true: run body   │
│          if false: exit loop │
│  }                           │
└──────────────────────────────┘
```

**The problem it solves:** Without loops, if you want to print "Generating floor..." 5
times, you must write 5 separate `std::cout` lines. If the number changes to 100, you
need 100 lines. Loops let you write the action once and repeat it as many times as needed.

**What it hides:** Assembly jump instructions (`JMP`). At the machine code level, a
loop is: evaluate condition → if false jump past the loop → if true run body → jump
back to the condition check. `while` is an abstraction over these raw jumps.

**The protected invariant (the loop invariant):** A claim that is true before the loop
starts, true after every iteration, and true when the loop ends. The invariant proves
the loop is correct. For the floor-generation loop, the invariant is: "at the start
of each iteration, `currentFloor` is the next floor that has not yet been generated."
When the loop ends, all floors have been generated exactly once.

**Canonical example — a countdown:**
```cpp
int count = 3;
while (count > 0) {      // condition: keep going while count is positive
    std::cout << count << std::endl;
    --count;             // move toward making the condition false (critical!)
}
// Output: 3, 2, 1
```

**Watch for:** The loop body must eventually make the condition `false`. If you forget
`--count` above, `count` stays at 3 forever, and the loop never exits — an **infinite
loop**. If your program stops responding, this is almost always the cause. Press
`Ctrl+C` in the terminal to force-quit it.

---

## Step 1 — Print Floor Generation Messages

Start fresh with a new `main.cpp`:

```cpp
#include <iostream>    // std::cout, std::endl

const int TOTAL_FLOORS = 5;   // how many dungeon floors exist

int main() {
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;
    std::cout << std::endl;

    int currentFloor = 1;   // loop variable: which floor we are about to generate

    while (currentFloor <= TOTAL_FLOORS) {   // keep going while floors remain
        std::cout << "Generating floor " << currentFloor
                  << " of " << TOTAL_FLOORS << "..." << std::endl;
        ++currentFloor;   // advance to the next floor — makes the condition eventually false
    }

    return 0;
}
```

**Loop invariant for this loop:** At the start of each iteration, `currentFloor` is
the next floor that has not yet been announced. When `currentFloor > TOTAL_FLOORS`,
all floors have been announced.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== Dungeon Map Sketcher ===

Generating floor 1 of 5...
Generating floor 2 of 5...
Generating floor 3 of 5...
Generating floor 4 of 5...
Generating floor 5 of 5...
```

**Change something:** Change `TOTAL_FLOORS` to `10`. Recompile. Run. All 10 floors
are announced without changing any loop code. Change back to `5`. This is why we
use named constants instead of magic numbers.

---

## Part 2 — The `for` Loop

### Concept: The `for` Loop — Compact Indexed Iteration

**What it is:** A loop designed specifically for iterating a known number of times,
with all loop management (initialization, condition, and update) in one line.

```cpp
for (initialization; condition; update) {
    // body
}
```

**The three parts:**
1. **Initialization** — runs once before the first check. Creates and sets the loop variable.
2. **Condition** — checked before each iteration. Loop continues while `true`.
3. **Update** — runs after each iteration. Usually advances the counter.

**Equivalence to `while`:** Every `for` loop is exactly equivalent to a `while` loop:
```cpp
// for loop:
for (int i = 0; i < 5; ++i) { body; }

// equivalent while loop:
int i = 0;
while (i < 5) { body; ++i; }
```

**Why prefer `for` over `while` for counted iteration?** Because all three pieces —
start value, condition, and increment — are visible in one line. A reader can immediately
see the loop's full range without scanning the body for the increment. Also, the loop
variable `i` is scoped to the loop itself and cannot be accidentally used outside.

**The conventional variable `i`:** For loop counters, `i` is the only single-letter
variable name permitted in this masterclass (and in most style guides). It stands for
"index" and is universally recognized as a loop counter. Use `j` for nested loops.

**Watch for:** `i < N` (strict less-than) is by far the most common condition for
iterating from `0` to `N-1` — which is how arrays and grid indices work (zero-indexed).
Using `i <= N` when you mean `i < N` is a classic off-by-one error.

**Canonical example — printing row indices 0 to 9:**
```cpp
for (int i = 0; i < 10; ++i) {
    std::cout << "Row " << i << std::endl;
}
```

---

## Step 2 — Print a Row of Tiles Using `for`

Add a row-drawing section after the `while` loop. Only new lines marked:

```cpp
    // (after the while loop)
    std::cout << std::endl;

    const int DUNGEON_WIDTH  = 10;   // ← add: number of columns in the dungeon
    const int DUNGEON_HEIGHT =  4;   // ← add: number of rows in the dungeon

    // Print one row of floor tiles to verify the for loop works
    for (int col = 0; col < DUNGEON_WIDTH; ++col) {   // ← add: iterate columns 0 to WIDTH-1
        std::cout << ". ";   // ← add: print floor tile followed by a space
    }
    std::cout << std::endl;   // ← add: end the row
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see** (after the generation messages):
```
. . . . . . . . . .
```

Ten dots in a row, separated by spaces. The loop ran exactly `DUNGEON_WIDTH` times.

**Change something:** Change `DUNGEON_WIDTH` to `5`. Run. Only 5 dots appear.
Change to `20`. Run. 20 dots. Change back to `10`.

---

## Part 3 — Nested Loops (Loops Inside Loops)

### Concept: Nested Loops — Iterating a 2D Space

**What it is:** A loop whose body contains another loop. The outer loop controls one
dimension; the inner loop controls another. Together they visit every cell of a 2D grid.

**The execution order:**
```
Outer iteration 1:
    Inner iteration 1, 2, 3... (complete inner loop)
Outer iteration 2:
    Inner iteration 1, 2, 3... (complete inner loop again)
...
```

**Total iterations = outer count × inner count.** A grid with 4 rows and 10 columns
requires 4 × 10 = 40 iterations to visit every cell.

**Canonical example — a multiplication table:**
```cpp
for (int row = 1; row <= 3; ++row) {
    for (int col = 1; col <= 3; ++col) {
        std::cout << row * col << " ";
    }
    std::cout << std::endl;   // new row after each complete inner pass
}
// Output:
// 1 2 3
// 2 4 6
// 3 6 9
```

**Project Application:** Every grid-based game in this masterclass — Snake, Tetris,
Sokoban, the RPG dungeon — renders by iterating all rows (outer loop) and all columns
(inner loop) and printing the appropriate tile character for each cell. The nested loop
pattern here IS the renderer pattern there.

**Watch for:** The inner loop variable (`j` or `col`) must be different from the outer
loop variable (`i` or `row`). If you accidentally write `for (int i = 0; ...)` for
both, the inner `i` shadows the outer one and the outer loop never completes correctly.

---

## Step 3 — Draw the Full Dungeon Grid

Replace the single-row `for` loop with a proper nested loop. Mark: only the `for` loop
line and the `endl` line are replaced — the `const` declarations stay:

```cpp
    const int DUNGEON_WIDTH  = 10;
    const int DUNGEON_HEIGHT =  4;

    // Outer loop: one iteration per row (top to bottom)
    for (int row = 0; row < DUNGEON_HEIGHT; ++row) {          // ← was: single row for loop
        // Inner loop: one iteration per column (left to right)
        for (int col = 0; col < DUNGEON_WIDTH; ++col) {       // ← add nested loop
            // Determine what tile to print at this (row, col) position
            bool isTopRow    = (row == 0);
            bool isBottomRow = (row == DUNGEON_HEIGHT - 1);
            bool isLeftCol   = (col == 0);
            bool isRightCol  = (col == DUNGEON_WIDTH - 1);
            bool isWall      = isTopRow || isBottomRow || isLeftCol || isRightCol;

            if (isWall) {
                std::cout << "# ";   // wall tile
            } else {
                std::cout << ". ";   // floor tile
            }
        }                                                       // ← end inner loop
        std::cout << std::endl;   // ← end of this row — move to next line
    }                                                           // ← end outer loop
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
# # # # # # # # # #
# . . . . . . . . #
# . . . . . . . . #
# # # # # # # # # #
```

Walls on all four edges, floor tiles inside. This is exactly the rendering pattern
used in every dungeon rendering system in later series.

**Change something:** Change `DUNGEON_HEIGHT` to `6`. Run. Two more rows of floor
tiles appear. Change `DUNGEON_WIDTH` to `15`. Run. The dungeon gets wider. The rendering
code needs no changes — it reads from the constants. Change both back.

---

## Part 4 — `break`, `continue`, and `do-while`

### Concept: `break` — Exiting a Loop Early

**What it is:** `break` immediately exits the innermost loop or `switch` statement
containing it. Execution resumes after the loop's closing `}`.

**Why it exists:** Sometimes you are searching for something and want to stop the loop
the moment you find it — processing more iterations wastes time and can cause bugs.

```cpp
// Search for the first wall row — stop as soon as we find it
for (int row = 0; row < DUNGEON_HEIGHT; ++row) {
    if (row == 0) {
        std::cout << "Top wall found at row " << row << std::endl;
        break;   // ← stop immediately; do not process remaining rows
    }
}
```

**Watch for:** `break` only exits the **innermost** loop. If you have nested loops and
want to exit both, you need a flag variable or a `goto` (which is rarely appropriate).

---

### Concept: `continue` — Skipping One Iteration

**What it is:** `continue` skips the rest of the current iteration and jumps directly
to the loop's update step (in a `for` loop) or condition check (in a `while` loop).

```cpp
// Print only odd numbers from 1 to 10
for (int i = 1; i <= 10; ++i) {
    if (i % 2 == 0) continue;   // ← skip even numbers
    std::cout << i << " ";
}
// Output: 1 3 5 7 9
```

**Watch for:** In a `while` loop, using `continue` when the increment is at the end
of the body creates an infinite loop — `continue` jumps back to the condition without
running the increment. Always ensure the increment is before the `continue`.

---

### Concept: `do-while` — Guaranteed First Execution

**What it is:** A loop whose body runs first, and the condition is checked after.
This guarantees the body executes at least once — even if the condition is false from
the start.

```cpp
do {
    // body runs first
} while (condition);   // then check — loop again if true
```

**When to use it:** Input validation loops — ask the user for input, then check if it
is valid. If invalid, ask again. You must ask at least once before you can validate.

```cpp
int choice = 0;
do {
    std::cout << "Enter 1-5: ";
    std::cin >> choice;
} while (choice < 1 || choice > 5);   // keep asking until valid
```

---

## Step 4 — Add Input Validation

Add a `do-while` input loop at the start of `main()`, before the generation loop.
The user now enters the dimensions, and the program validates them:

```cpp
    const int MIN_SIZE = 2;    // ← add: minimum allowed dungeon dimension
    const int MAX_WIDTH  = 20; // ← add: maximum width
    const int MAX_HEIGHT = 10; // ← add: maximum height

    int dungeonWidth  = 0;
    int dungeonHeight = 0;

    // Ask for width — repeat until the user gives a valid value
    do {
        std::cout << "Enter dungeon width (" << MIN_SIZE << "-" << MAX_WIDTH << "): ";
        std::cin >> dungeonWidth;
    } while (dungeonWidth < MIN_SIZE || dungeonWidth > MAX_WIDTH);

    // Ask for height — repeat until the user gives a valid value
    do {
        std::cout << "Enter dungeon height (" << MIN_SIZE << "-" << MAX_HEIGHT << "): ";
        std::cin >> dungeonHeight;
    } while (dungeonHeight < MIN_SIZE || dungeonHeight > MAX_HEIGHT);
```

Also update the grid loop to use `dungeonWidth` and `dungeonHeight` instead of the
old `const` values:
```cpp
    for (int row = 0; row < dungeonHeight; ++row) {     // ← was: DUNGEON_HEIGHT
        for (int col = 0; col < dungeonWidth; ++col) {  // ← was: DUNGEON_WIDTH
```

### SAVE AND TRY

```
make
.\dungeon
```

Type `25` for width. The prompt repeats — 25 is out of range. Type `10`. Accepted.
Type `1` for height. Repeats. Type `4`. Accepted. The grid draws with those dimensions.

---

## 🎯 Challenge: Add a Staircase

**You know:** Nested loops, `if` conditions inside loops, the rendering pattern.

**Task:** Add a `>` character inside the dungeon (not on a wall) at the exact center
of the grid — this will represent the staircase down to the next floor.

The center column is `dungeonWidth / 2` and the center row is `dungeonHeight / 2`.

Modify the rendering loop to: if `row == dungeonHeight / 2` AND `col == dungeonWidth / 2`,
print `> ` instead of `. `.

**Expected output (10×4 grid):**
```
# # # # # # # # # #
# . . . . . . . . #
# . . . . > . . . #
# # # # # # # # # #
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
// Inside the nested loop, replace the floor/wall print block:
bool isCenterRow = (row == dungeonHeight / 2);
bool isCenterCol = (col == dungeonWidth  / 2);
bool isStairs    = isCenterRow && isCenterCol && !isWall;

if (isWall) {
    std::cout << "# ";
} else if (isStairs) {
    std::cout << "> ";
} else {
    std::cout << ". ";
}
```

**Key insight:** The rendering loop is a general-purpose decision engine: for every
cell `(row, col)`, ask "what should be here?" and print it. In S-09 (RPG Engine),
this exact structure becomes the core renderer — it will check for the player, enemies,
items, and terrain in that order. The logic you wrote here is the seed of that system.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `while` loop | Floor generation messages print exactly `TOTAL_FLOORS` times |
| `for` loop | Grid rows print exactly `dungeonHeight` lines |
| Nested loop | Each row has exactly `dungeonWidth` tiles |
| Wall logic | All border cells print `#`; interior cells print `.` |
| `do-while` validation | Entering `25` for width repeats the prompt; `10` is accepted |
| `break` concept | Can explain what `break` would do to the outer loop |
| `continue` concept | Can predict the output of the odd-numbers example from the lab |
| Named constants | Changing `TOTAL_FLOORS` to `10` updates all output without code changes |

---

## Quick Check Answers

**1. What happens to a `while` loop where the condition starts `false`?**
The body runs **zero times**. A `while` loop checks the condition before the first
iteration. If it is already `false`, execution jumps immediately past the loop body.
This is different from `do-while`, which always runs the body at least once. In game
code, this often occurs intentionally: `while (!enemies.empty())` does nothing if
there are no enemies — which is correct behavior.

**2. What values does `i` take in `for (int i = 0; i < 5; ++i)`?**
`0, 1, 2, 3, 4`. The loop starts at `0` (initialization), runs while `i < 5`
(condition), and increments after each iteration. When `i` becomes `5`, the condition
`5 < 5` is `false` and the loop ends. **The loop runs 5 times, visiting values 0 through 4.**
This zero-based pattern (0 to N-1) matches how arrays are indexed, which is why it
is the standard form.

**3. What gets printed when `continue` skips `num == 5`?**
`1 2 3 4 6 7 8 9 10` — all numbers except 5. When `num` is 5, `continue` skips the
`std::cout` line and jumps to the increment (`++num`), so the loop advances to 6 and
continues normally. The number 5 is never printed; all others are.
