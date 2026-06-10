# C++ Masterclass — S-02 — LAB 04 — Wrapping at Edges: Modulo Applied

**Prerequisites:** S-02 LAB 03. You have a playable Snake game that ends on wall collision.

**What this lab adds:**
- The wall-wrapping mechanic — snake exits one side and enters the opposite
- Modulo arithmetic revisited and formalized as a boundary-constraint tool
- The signed modulo trap — why `%` fails for negative numbers in C++
- A safe `wrap()` utility function that handles all cases correctly
- Comparing two game modes: wall-death vs wall-wrap (a mode select screen)
- Applying the wrapping formula to both row and column independently

**Time:** ~55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In S-01 LAB 02, you learned that `value % max` constrains a value to `[0, max-1]`.
>    If the snake is at column 19 (the right wall) and moves right, what should
>    `(19 + 1) % 20` evaluate to?
> 2. The snake is at column 0 (the left wall) and moves left. New column = `0 - 1 = -1`.
>    In C++, what does `-1 % 20` evaluate to? Is it what you want?
> 3. Predict: What formula correctly wraps a value in the range `[0, max-1]`
>    for both positive overflow and negative underflow?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A Snake game with two playable modes selected at startup:

```
=== SNAKE ===

  [1]  Classic Mode   (walls kill)
  [2]  Wrap Mode      (walls wrap)
  [Q]  Quit

> 2

[Wrap Mode — exits one side, enters the other]

####################
#                  #
o                  #
O                  #   ← snake about to wrap from left to right
#                  #
#        *         #
#                  #
####################
```

In Wrap Mode, the `#` border is decorative — the snake passes through it.

---

## Part 1 — Modulo as a Boundary Constraint

### Math: The Wrapping Formula — Constraining a Value to a Range

**What it computes:** Given a value that may have gone outside `[0, max-1]`,
return the equivalent value inside that range by wrapping around.

**The formula for positive overflow:**
```
new_col = (col + 1) % GRID_COLS
```
If `col = 19` and `GRID_COLS = 20`: `(19 + 1) % 20 = 20 % 20 = 0`. ✓
The snake exits right (col 20) and enters left (col 0).

**The formula for positive overflow works because:**
- `x % N` maps any non-negative x to the range `[0, N-1]`
- `(x + 1) % N` specifically handles advancing by 1 with wraparound

**The signed modulo trap in C++:**
When `col = 0` and the snake moves left: `col - 1 = -1`.
In C++ (since C++11), the result of `%` has the same sign as the dividend:
```
-1 % 20 = -1   ← NOT 19
```
This is mathematically valid (it satisfies `(a/b)*b + a%b == a`) but useless for
wrapping. You want `19`, not `-1`.

**The safe wrapping formula — handles both positive overflow AND negative underflow:**
```
new_value = ((value % max) + max) % max
```

**Why this works:**
- Positive overflow: `(21 % 20 + 20) % 20 = (1 + 20) % 20 = 21 % 20 = 1` ✓
- Zero: `(0 % 20 + 20) % 20 = (0 + 20) % 20 = 0` ✓
- Negative underflow: `(-1 % 20 + 20) % 20 = (-1 + 20) % 20 = 19 % 20 = 19` ✓
- Large negative: `(-21 % 20 + 20) % 20 = (-1 + 20) % 20 = 19 % 20 = 19` ✓

**The real-world analogy — the clock, revisited:**
An analog clock wraps 12→0 and also wraps "3 hours before midnight" = 9pm, not -3.
The `((v % m) + m) % m` formula is the mathematical clock: it always gives the
correct "time" regardless of whether you went forward or backward past midnight.

**Project Application:** This formula appears in:
- S-02 Snake: wrapping the head at grid edges (this lab)
- S-03 Tetris: rotating piece data through 4 states: `(rotation + 1) % 4`
- S-07 Shell: rotating through command history with up/down arrows
- S-09 RPG: cycling through menu options

**Watch for:** This formula works for single-step movement (`value ± 1`).
For jumps larger than `max`, the `((v % m) + m) % m` form handles all cases correctly.
The simpler `(v + max) % max` only handles the case where `v >= -max`.

---

## Step 1 — The `wrap` Utility Function

Add before `main()` in your Snake `main.cpp` from LAB 03:

```cpp
// ── wrap — safe modulo that handles negative values ───────────────────────────
// Returns a value in [0, max-1] for any input value, positive or negative.
// Used to wrap grid coordinates when the snake exits one side of the board.
int wrap(int value, int max) {
    return ((value % max) + max) % max;
}
```

This is a pure utility — one job, no side effects, testable in isolation.

### SAVE AND TRY

Add a quick test in `main()` before the game loop (remove after verifying):

```cpp
    // Verify wrap() handles all cases
    std::cout << "wrap( 0, 20) = " << wrap( 0, 20) << "  (expect 0)"  << std::endl;
    std::cout << "wrap(19, 20) = " << wrap(19, 20) << "  (expect 19)" << std::endl;
    std::cout << "wrap(20, 20) = " << wrap(20, 20) << "  (expect 0)"  << std::endl;
    std::cout << "wrap(-1, 20) = " << wrap(-1, 20) << "  (expect 19)" << std::endl;
    std::cout << "wrap(21, 20) = " << wrap(21, 20) << "  (expect 1)"  << std::endl;
    _getch();   // pause to read before the game starts
```

```
make
.\dungeon
```

**You should see:** All five values match expectations. The formula is correct for
positive overflow, zero, and negative underflow. Remove the test lines.

---

## Part 2 — Game Mode Selection

### Concept: Mode State — Parameterizing Behavior at Runtime

**What it is:** Instead of hardcoding whether walls kill or wrap, the game reads the
player's preference at startup and stores it. A `bool wrapMode` flag changes behavior
in exactly one place: the collision check.

**Why this is good design:** The logic for "what happens when the snake reaches the
edge" lives in one function (`updateSnake`). Everything else — rendering, input,
scoring — is identical between modes. Changing behavior in one place that propagates
everywhere is the **Open-Closed Principle** in practice: the game is open to new modes,
closed to modification of existing behavior.

---

## Step 2 — Add Mode Selection

Add an enum and a mode-select screen before `main()`'s game loop:

```cpp
// ── GameMode ──────────────────────────────────────────────────────────────────
enum class GameMode {
    Classic,   // walls kill
    Wrap       // walls wrap to opposite side
};

// ── selectMode — show a menu and return the chosen mode ───────────────────────
GameMode selectMode() {
    clearScreen();
    std::cout << "=== SNAKE ===" << std::endl;
    std::cout << std::endl;
    std::cout << "  [1]  Classic Mode   (walls kill)" << std::endl;
    std::cout << "  [2]  Wrap Mode      (walls wrap)" << std::endl;
    std::cout << "  [Q]  Quit"                        << std::endl;
    std::cout << std::endl;
    std::cout << "> ";

    char key = _getch();
    if (key == '2') return GameMode::Wrap;
    if (key == 'q' || key == 'Q') {
        clearScreen();
        std::cout << "Goodbye!" << std::endl;
        exit(0);   // exit immediately on Q at mode select
    }
    return GameMode::Classic;   // default: any other key → Classic
}
```

**`exit(0)`:** Terminates the program immediately with exit code 0 (success).
Unlike `return` (which exits the current function), `exit` ends the entire program
regardless of how deeply nested the call is. Use it sparingly — in game startup
menus it is acceptable. In library code, avoid it.

---

## Step 3 — Update `updateSnake` for Wrap Mode

Modify the `updateSnake` function to accept `GameMode` and apply wrapping:

```cpp
bool updateSnake(std::deque<Segment>& body,
                 Direction dir,
                 const char grid[GRID_ROWS][GRID_COLS],
                 int foodRow, int foodCol,
                 bool& ate,
                 GameMode mode) {       // ← add mode parameter

    Segment newHead = body.front();

    if      (dir == Direction::Up)    { --newHead.row; }
    else if (dir == Direction::Down)  { ++newHead.row; }
    else if (dir == Direction::Left)  { --newHead.col; }
    else if (dir == Direction::Right) { ++newHead.col; }

    // ── Apply boundary behavior based on mode ─────────────────────────────────
    if (mode == GameMode::Wrap) {
        // Wrap: constrain row to playfield rows (1 to GRID_ROWS-2 — inside walls)
        // The wall tiles at row 0 and GRID_ROWS-1 are decorative in Wrap Mode.
        // We wrap within the interior only.
        newHead.row = wrap(newHead.row - 1, GRID_ROWS - 2) + 1;
        newHead.col = wrap(newHead.col - 1, GRID_COLS - 2) + 1;
        // Explanation:
        //   - Subtract 1 to shift interior rows to [0, GRID_ROWS-3]
        //   - Apply wrap within that range
        //   - Add 1 back to restore the offset
        //   e.g., row=7 (bottom wall row), interior size=6, wrap(7-1, 6)=wrap(6,6)=0 → 0+1=1 (top interior)
    } else {
        // Classic: hitting a wall tile ends the game
        if (grid[newHead.row][newHead.col] == TILE_WALL) {
            return false;
        }
    }

    // Self-collision (same in both modes)
    for (const Segment& seg : body) {
        if (seg.row == newHead.row && seg.col == newHead.col) {
            return false;
        }
    }

    ate = (newHead.row == foodRow && newHead.col == foodCol);
    body.push_front(newHead);
    if (!ate) body.pop_back();

    return true;
}
```

**The wrap formula for interior cells:**
The playfield interior is rows 1 to `GRID_ROWS-2` (inclusive). To wrap within this
range of size `GRID_ROWS-2`:
1. Shift to 0-based: `row - 1` maps interior row 1 → 0, row `GRID_ROWS-2` → `GRID_ROWS-3`
2. Wrap within the interior: `wrap(row - 1, GRID_ROWS - 2)`
3. Shift back: add 1

This ensures the snake exits row 1 (top interior) and enters from row `GRID_ROWS-2`
(bottom interior) — never landing on the `#` wall tiles.

---

## Step 4 — Wire Mode Select into `main()`

Add these changes to `main()`:

```cpp
int main() {
    GameMode mode = selectMode();   // ← add: choose mode before the game starts

    // Show mode name after selection
    clearScreen();
    if (mode == GameMode::Wrap) {
        std::cout << "[Wrap Mode — exits one side, enters the other]" << std::endl;
    } else {
        std::cout << "[Classic Mode — walls kill]" << std::endl;
    }
    Sleep(1000);   // show the mode label for 1 second

    // ... (rest of main unchanged until updateSnake call) ...

    // Update the updateSnake call to pass mode:
    if (!updateSnake(body, dir, grid, foodRow, foodCol, ate, mode)) {
```

### SAVE AND TRY

```
make
.\dungeon
```

**Test Classic Mode:** Select `1`. Steer into a wall — "Game Over."

**Test Wrap Mode:** Select `2`. Steer into the right wall — the snake appears on
the left. Steer into the top — appears at the bottom.

**Change something:** Change the `Sleep(1000)` to `Sleep(2000)` so the mode label
shows for 2 seconds. Run. Change back to `1000`.

---

## 🎯 Challenge: Diagonal Wrap Test

**You know:** `wrap()`, the interior coordinate formula.

**Task:** Write a standalone test function `void testWrap()` that verifies the
interior wrap formula for a 20×8 grid (GRID_COLS=20, GRID_ROWS=8). Test:
- Row 1 moving up → should wrap to row 6 (GRID_ROWS-2)
- Row 6 moving down → should wrap to row 1
- Col 1 moving left → should wrap to col 18 (GRID_COLS-2)
- Col 18 moving right → should wrap to col 1

Print "PASS" or "FAIL" for each case. Call `testWrap()` at the start of `main()`
(before `selectMode()`) and remove it when all cases pass.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void testWrap() {
    std::cout << "=== Wrap Tests ===" << std::endl;

    auto wrapRow = [](int r) { return wrap(r - 1, GRID_ROWS - 2) + 1; };
    auto wrapCol = [](int c) { return wrap(c - 1, GRID_COLS - 2) + 1; };

    // Moving up from top interior row (row 1)
    std::cout << "Row 1 up   → " << wrapRow(1 - 1) << "  expect " << (GRID_ROWS - 2) << " ";
    std::cout << (wrapRow(1 - 1) == GRID_ROWS - 2 ? "PASS" : "FAIL") << std::endl;

    // Moving down from bottom interior row
    std::cout << "Row 6 down → " << wrapRow(GRID_ROWS - 2 + 1) << "  expect 1 ";
    std::cout << (wrapRow(GRID_ROWS - 2 + 1) == 1 ? "PASS" : "FAIL") << std::endl;

    // Moving left from leftmost interior col (col 1)
    std::cout << "Col 1 left → " << wrapCol(1 - 1) << "  expect " << (GRID_COLS - 2) << " ";
    std::cout << (wrapCol(1 - 1) == GRID_COLS - 2 ? "PASS" : "FAIL") << std::endl;

    // Moving right from rightmost interior col
    std::cout << "Col 18 right → " << wrapCol(GRID_COLS - 2 + 1) << "  expect 1 ";
    std::cout << (wrapCol(GRID_COLS - 2 + 1) == 1 ? "PASS" : "FAIL") << std::endl;
}
```

**Key insight:** Writing a test function before integrating a formula into the game
saves significant debugging time. If the wrap formula is wrong, you find out
immediately in an isolated test — not by watching the snake teleport to unexpected
positions mid-game and trying to reproduce the conditions.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `wrap(20, 20) == 0` | Test confirms positive overflow wraps correctly |
| `wrap(-1, 20) == 19` | Test confirms negative underflow wraps correctly |
| Mode select screen | `[1]` and `[2]` keys choose the correct mode |
| Classic: wall kills | Steering into `#` ends the game |
| Wrap: right→left | Snake exits right wall and enters from left interior |
| Wrap: top→bottom | Snake exits top interior and enters from bottom interior |
| `_getch()` returns `'Q'` | Mode select Q exits cleanly |

---

## Quick Check Answers

**1. What does `(19 + 1) % 20` evaluate to?**
`0`. `20 % 20 = 0`. The snake exits column 19 (right interior) and wraps to column 0.
But column 0 is the wall — so the correct formula for wrapping within the interior
(columns 1 to 18 in a 20-wide grid) applies the additional offset: `wrap(col - 1, 18) + 1`.

**2. What does `-1 % 20` evaluate to in C++?**
`-1`. The C++11 standard defines `%` so that `(a/b)*b + a%b == a`. For `-1 / 20 = 0`
(truncated toward zero), `0 * 20 + (-1 % 20) = -1` requires `(-1 % 20) = -1`.
This is the opposite of what wrapping needs (which is 19). The `((v % m) + m) % m`
formula adds `m` before the second modulo, converting -1 to 19 correctly.

**3. The safe formula for both overflow and underflow?**
`((value % max) + max) % max`. The `+ max` step ensures the intermediate result
is always non-negative before the final `%` applies. For any value in the range
`[-max, 2*max-1]`, this formula returns a value in `[0, max-1]`. For values outside
that range (multiple wraps), it still works because `%` reduces them first.
