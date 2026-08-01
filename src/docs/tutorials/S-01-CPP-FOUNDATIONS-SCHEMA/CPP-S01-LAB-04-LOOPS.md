# Lesson 4: Repetition Is a Condition Checked Again, Not Copy-Pasted Code
### (LAB 04 — Loops)

**What you will build:** A dungeon map sketcher — a program that validates user-entered dimensions with `do-while`, announces floor generation with `while`, and renders a walled grid (with a staircase at its center) using nested `for` loops. The transferable problem: every loop in this lesson is the same underlying machine — evaluate a condition, run a body, change something, evaluate the condition again — differing only in *when* the condition is checked and *how* the loop variable is managed. Once that shared machine is visible, `while`, `for`, and `do-while` stop being three things to memorize and become three configurations of one thing.

**What you need to know first:** LAB-03 — `if`/`else`, comparison and logical operators, `std::cin`. LAB-02's `++`/compound assignment. LAB-01's `bool`, LAB-00's `std::cout`/`make`.

**Terms introduced in this lesson**

> **Loop** — a construct that repeats a block of code while a condition holds.
> **Loop invariant** — a claim that is true before the loop starts, true after every iteration, and true when it ends; the tool for proving a loop does what it claims.
> **`while`** — a loop that checks its condition *before* each iteration, including the first.
> **Infinite loop** — a loop whose condition never becomes false, repeating forever.
> **`for`** — a loop combining initialization, condition, and update into one line, for counted iteration.
> **Nested loop** — a loop whose body contains another loop, together covering a two-dimensional space.
> **`break`** — exits the innermost enclosing loop (or `switch`) immediately.
> **`continue`** — skips the rest of the current iteration and jumps to the loop's next condition check (after running the update, in a `for`).
> **`do-while`** — a loop that checks its condition *after* each iteration, guaranteeing the body runs at least once.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: `while` — Repeat While True

### The Problem

Printing "Generating floor N of 5..." five times means either five nearly-identical `std::cout` lines, or a way to say "run this once per floor" without writing it out five separate times — and if `TOTAL_FLOORS` later becomes 100, five lines becomes an unmaintainable 100.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `<=` (LAB-03), `++` (LAB-02).

### The New Code

```cpp
int currentFloor = 1;

while (currentFloor <= TOTAL_FLOORS) {
    std::cout << "Generating floor " << currentFloor
              << " of " << TOTAL_FLOORS << "..." << std::endl;
    ++currentFloor;
}
```

### The Updated Project

```cpp
#include <iostream>

const int TOTAL_FLOORS = 5;   // ← new

int main() {
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;
    std::cout << std::endl;

    int currentFloor = 1;                                       // ← new

    while (currentFloor <= TOTAL_FLOORS) {                       // ← new
        std::cout << "Generating floor " << currentFloor
                  << " of " << TOTAL_FLOORS << "..." << std::endl;
        ++currentFloor;
    }

    return 0;
}
```

### Concept Lab

```cpp
// scratch_countdown.cpp  (disposable)
#include <iostream>
int main() {
    int count = 3;
    while (count > 0) {
        std::cout << count << std::endl;
        --count;
    }
}
```

Run it — verified this session:

```
$ g++ scratch_countdown.cpp -o scratch_countdown -std=c++17 -Wall -Wextra
$ ./scratch_countdown.exe
3
2
1
```

What that proves: the condition `count > 0` was checked *before* every iteration, including the last one — after `count` became `0`, the loop stopped without printing `0`, because the check happens before the body runs, not after. Deleting `--count` (verified conceptually, not run — running it would hang this terminal forever) would leave `count` permanently `3`, `3 > 0` permanently `true`, and the loop would never stop: an **infinite loop**. The line that changes the condition toward `false` is not optional decoration — without it, the loop's exit is unreachable.

This scratch file is discarded now; the real project's loop counts *up* toward `TOTAL_FLOORS` instead of down toward zero, using the identical check-then-run-then-advance shape.

### Mechanical Walkthrough

- `while (currentFloor <= TOTAL_FLOORS)` — **(a) first appearance.** Checked before every iteration, including the very first. If false immediately, the body never runs at all — zero times, not once.
- `++currentFloor;` — **(c) already basic** (LAB-02) — here specifically the line that eventually makes the condition false; without it, per the Concept Lab, the loop never terminates.

### CS Lens

`while` compiles to the same conditional-jump machinery as `if` (LAB-03) — evaluate condition, jump past the body if false, run the body, then jump *back* to the condition check, repeating. The only new piece, compared to a plain `if`, is that backward jump.

### SE Lens

The **loop invariant** — a claim true before the loop starts, after every iteration, and when it ends — is the tool for arguing a loop is *correct*, not merely "seems to work on the inputs tried so far." For this loop: "at the start of each iteration, `currentFloor` is the next floor not yet announced." That's true before the first iteration (`currentFloor = 1`, nothing announced yet), stays true after each `++currentFloor`, and when the loop ends (`currentFloor > TOTAL_FLOORS`), the invariant plus the exit condition together prove every floor from 1 to `TOTAL_FLOORS` was announced exactly once — not an assumption, a conclusion that follows from the invariant holding.

### Run It

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Dungeon Map Sketcher ===

Generating floor 1 of 5...
Generating floor 2 of 5...
Generating floor 3 of 5...
Generating floor 4 of 5...
Generating floor 5 of 5...
```

Verified this session.

### Connection

`while` handles "repeat until a condition changes" — Concept Unit 2 introduces a loop built specifically for "repeat a known number of times," the far more common shape for rendering a fixed-size grid.

---

## Concept Unit 2: `for` — Compact Indexed Iteration

### The Problem

Printing one row of ten dungeon tiles means counting from `0` to `9` — a `while` loop can do this, but its three moving parts (a variable declared before the loop, a condition, an increment inside the body) are physically scattered across three different locations, easy to get out of sync when writing a new one from scratch.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After Concept Unit 1's `while` loop, before `return 0;`.
- **Dependencies:** `<` (LAB-03), `++` (LAB-02).

### The New Code

```cpp
std::cout << std::endl;

const int DUNGEON_WIDTH  = 10;
const int DUNGEON_HEIGHT =  4;

for (int col = 0; col < DUNGEON_WIDTH; ++col) {
    std::cout << ". ";
}
std::cout << std::endl;
```

### The Updated Project

```cpp
    while (currentFloor <= TOTAL_FLOORS) {
        std::cout << "Generating floor " << currentFloor
                  << " of " << TOTAL_FLOORS << "..." << std::endl;
        ++currentFloor;
    }

    std::cout << std::endl;                                      // ← new

    const int DUNGEON_WIDTH  = 10;                                // ← new
    const int DUNGEON_HEIGHT =  4;                                // ← new

    for (int col = 0; col < DUNGEON_WIDTH; ++col) {                // ← new
        std::cout << ". ";                                        // ← new
    }                                                              // ← new
    std::cout << std::endl;                                       // ← new

    return 0;
```

### Concept Lab

```cpp
// scratch_for.cpp  (disposable)
#include <iostream>
int main() {
    for (int i = 0; i < 5; ++i) {
        std::cout << "Row " << i << std::endl;
    }
}
```

Run it — verified this session:

```
$ g++ scratch_for.cpp -o scratch_for -std=c++17 -Wall -Wextra
$ ./scratch_for.exe
Row 0
Row 1
Row 2
Row 3
Row 4
```

What that proves: `i` visited exactly `0, 1, 2, 3, 4` — five values, not six — `i < 5` is `false` the moment `i` reaches `5`, so `5` itself is never printed. This zero-based range (`0` to `N-1`) is the standard shape for counted iteration in C++ specifically because it matches how arrays are indexed (LAB-06) — a loop from `0` to `N-1` visits exactly every valid index of an `N`-element array, with no off-by-one adjustment needed.

This is functionally identical to a `while` loop written as `int i = 0; while (i < 5) { body; ++i; }` — every `for` loop is exactly this same `while` loop with its three moving parts collected onto one line instead of scattered across three. This scratch file is discarded now; the real project's `for (int col = 0; col < DUNGEON_WIDTH; ++col)` uses this identical shape, with `DUNGEON_WIDTH` instead of the literal `5`.

### Mechanical Walkthrough

- `for (int col = 0; col < DUNGEON_WIDTH; ++col)` — **(a) first appearance.** Three parts in one line: `int col = 0` (initialization — runs once, before the first check), `col < DUNGEON_WIDTH` (condition — checked before every iteration, exactly like `while`), `++col` (update — runs after every iteration's body, before the next condition check). `col` is scoped to the loop itself — it does not exist before the `for` line and cannot be read or written after the loop's closing `}`.

### CS Lens

A `for` loop's three-part header does not add new capability beyond `while` — it is **syntactic sugar**: a more compact, more readable spelling of an identical underlying loop, chosen specifically because "start, bound, step" are visible together for a reader instead of split across a declaration line, a condition line, and a body line.

### SE Lens

Because `col` is scoped to the `for` loop itself, it cannot be accidentally read after the loop ends (a compile error would result) or leak into an unrelated part of `main` — a `while` loop's counter, declared before the loop, remains visible and reusable (accidentally or otherwise) for the rest of the enclosing scope. This scoping is a real, if minor, robustness advantage `for` has over `while` for exactly this "count from A to B" case.

### Watch for

`i < N` (strict less-than) is the standard condition for iterating `0` to `N-1`; writing `i <= N` when `N-1` was meant is a classic off-by-one error, visiting one extra iteration the code likely didn't intend, and — once arrays exist in LAB-06 — reading or writing one past the array's valid range.

### Run It

```
$ ./dungeon.exe
...
. . . . . . . . . .
```

Verified this session — ten dots, matching `DUNGEON_WIDTH`.

### Connection

One row of tiles is drawn — Concept Unit 3 turns a single `for` into a full 2D grid by nesting a second one inside it.

---

## Concept Unit 3: Nested Loops — Covering a 2D Space

### The Problem

A dungeon floor isn't one row — it's `DUNGEON_HEIGHT` rows, each `DUNGEON_WIDTH` tiles wide, and every one of those tiles needs its own decision (wall or floor) based on its exact position.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified (Concept Unit 2's single `for` loop is replaced by two nested ones).
- **Change type:** Replace.
- **Location:** Concept Unit 2's `for` loop, exactly.
- **Dependencies:** `DUNGEON_WIDTH`, `DUNGEON_HEIGHT` (Concept Unit 2), `||` (LAB-03).

### The New Code

```cpp
for (int row = 0; row < DUNGEON_HEIGHT; ++row) {
    for (int col = 0; col < DUNGEON_WIDTH; ++col) {
        bool isTopRow    = (row == 0);
        bool isBottomRow = (row == DUNGEON_HEIGHT - 1);
        bool isLeftCol   = (col == 0);
        bool isRightCol  = (col == DUNGEON_WIDTH - 1);
        bool isWall      = isTopRow || isBottomRow || isLeftCol || isRightCol;

        if (isWall) {
            std::cout << "# ";
        } else {
            std::cout << ". ";
        }
    }
    std::cout << std::endl;
}
```

### The Updated Project

Concept Unit 2's `for (int col = ...) { std::cout << ". "; } std::cout << std::endl;` is deleted entirely and replaced, in the same location, by the nested-loop block above. `DUNGEON_WIDTH` and `DUNGEON_HEIGHT`'s declarations are unchanged.

### Concept Lab

```cpp
// scratch_multtable.cpp  (disposable)
#include <iostream>
int main() {
    for (int row = 1; row <= 3; ++row) {
        for (int col = 1; col <= 3; ++col) {
            std::cout << row * col << " ";
        }
        std::cout << std::endl;
    }
}
```

Run it — verified this session:

```
$ g++ scratch_multtable.cpp -o scratch_multtable -std=c++17 -Wall -Wextra
$ ./scratch_multtable.exe
1 2 3
2 4 6
3 6 9
```

What that proves: for each single value of the *outer* loop's `row`, the *entire inner* loop ran to completion (all three `col` values) before `row` advanced — the execution order is outer-iteration-1 (all of inner), then outer-iteration-2 (all of inner again), never interleaved. Total iterations were `3 × 3 = 9`, matching outer count times inner count.

This scratch file is discarded now; the real nested loop replaces `row * col` with a per-cell wall/floor decision, using the identical outer-controls-rows, inner-controls-columns structure.

### Mechanical Walkthrough

- `for (int row = 0; row < DUNGEON_HEIGHT; ++row)` — **(c) already basic**, reusing Concept Unit 2's `for` syntax for the outer dimension.
- `for (int col = 0; col < DUNGEON_WIDTH; ++col)` — **(c) already basic**, same syntax, nested inside the outer loop's body — a genuinely new *position* for familiar syntax, not new syntax itself.
- `isTopRow`, `isBottomRow`, `isLeftCol`, `isRightCol`, `isWall` — **(c) already basic** (LAB-03's named-boolean pattern), computed fresh on every one of the 40 (4×10) inner-loop iterations, since `row` and `col` are different on each one.

### CS Lens

Nested loops visiting every cell of a rectangular grid is the exact structure behind every 2D game renderer this curriculum builds toward — Snake's board, Tetris's playfield, an RPG's dungeon floor — all iterate rows and columns in this same outer/inner shape, differing only in what gets decided and printed per cell.

### SE Lens

Total work for a nested loop is outer-count × inner-count — for this grid, `DUNGEON_HEIGHT × DUNGEON_WIDTH` cells, each doing a constant amount of work (four comparisons, one combined `||`, one print). This multiplication is the first concrete instance, in this curriculum, of work scaling with the *product* of two independent sizes rather than the sum of them — worth noticing now, before `CPP-S02-LAB-15`'s sorting algorithms make the same shape matter for performance at a much larger scale.

### Watch for

The inner loop's variable must be distinct from the outer's (`row`/`col`, never `i`/`i`) — using the same name for both would either fail to compile (redeclaration in the same scope, if nested directly) or, in a scope where it's legal, silently shadow the outer variable, making the outer loop's own counter inaccessible and almost certainly wrong inside the inner loop's body.

### Run It

```
$ ./dungeon.exe
...
# # # # # # # # # # 
# . . . . . . . . # 
# . . . . . . . . # 
# # # # # # # # # #
```

Verified this session — walls on all four edges, floor tiles inside, exactly `DUNGEON_HEIGHT` rows of exactly `DUNGEON_WIDTH` tiles each.

### Connection

The grid renders with fixed dimensions — Concept Unit 6 makes those dimensions user-controlled; first, Concept Units 4–5 cover two loop-control tools this project doesn't use yet but needs to recognize.

---

## Concept Unit 4: `break` — Exiting a Loop Early

### The Problem

Some loops search for something and should stop the instant it's found — continuing to check already-answered iterations wastes work and, in code that assumes "the loop ran to completion," can cause real bugs.

### No isolated code lab for this step

Demonstrated directly — the search-and-stop pattern is small enough that the Concept Lab below doubles as the full explanation.

### Concept Lab

```cpp
// scratch_break.cpp  (disposable)
#include <iostream>
int main() {
    const int DUNGEON_HEIGHT = 4;
    for (int row = 0; row < DUNGEON_HEIGHT; ++row) {
        if (row == 0) {
            std::cout << "Top wall found at row " << row << std::endl;
            break;
        }
    }
}
```

Run it — verified this session:

```
$ g++ scratch_break.cpp -o scratch_break -std=c++17 -Wall -Wextra
$ ./scratch_break.exe
Top wall found at row 0
```

What that proves: the loop's condition (`row < DUNGEON_HEIGHT`) never became false on its own — `row` was still `0`, far short of `4` — but `break` exited immediately anyway, skipping rows `1`, `2`, and `3` entirely. `break` is an exit that bypasses the loop's own condition check, not a way of making the condition false.

This scratch file is discarded now; the real project's rendering loops (Concept Unit 3) never use `break` — every cell genuinely needs visiting to draw the full grid, so there is nothing to search for and stop early on.

### Mechanical Walkthrough

- `break;` — **(a) first appearance in a loop context** (reappearing from LAB-03's `switch`, where it prevented fallthrough — a related but distinct job: here, it exits a loop entirely, not just one `case`). Execution resumes immediately after the loop's closing `}`.

### CS Lens

`break` exiting only the **innermost** enclosing loop (or `switch`) — never an outer loop it happens to be nested inside — is a scoping rule, the same category of "innermost wins" rule that governs variable shadowing: the nearest enclosing construct is the one affected, not every enclosing construct at once.

### SE Lens

Exiting a nested loop's *outer* level from deep inside the inner one has no direct `break`-based tool in C++ — it requires either a flag variable checked by the outer loop's own condition, or (rarely appropriate, and not used in this curriculum) `goto`. This is a real, sometimes awkward gap in the language worth knowing exists before writing a nested search loop that assumes "one `break` handles it."

### Connection

`continue`, next, is a related but distinct control-flow tool — skipping one iteration's remainder, not the whole loop.

---

## Concept Unit 5: `continue` — Skipping the Rest of One Iteration

### The Problem

Sometimes a loop needs to skip just the *current* iteration's remaining work — not stop the loop entirely, the way `break` does — and move directly to the next one.

### No isolated code lab for this step

Demonstrated directly, immediately contrasted with `break` since the two are easy to conflate on a first encounter.

### Concept Lab

```cpp
// scratch_continue.cpp  (disposable — odd numbers only)
#include <iostream>
int main() {
    for (int i = 1; i <= 10; ++i) {
        if (i % 2 == 0) continue;
        std::cout << i << " ";
    }
    std::cout << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_continue.cpp -o scratch_continue -std=c++17 -Wall -Wextra
$ ./scratch_continue.exe
1 3 5 7 9
```

What that proves: every even `i` (LAB-02's `%` identifying evenness) hit `continue` and skipped the `std::cout` line entirely, but the loop kept running — `i` still advanced through all ten values via the `for` loop's own update step, unlike `break`, which would have stopped after the first even number. `continue` jumps to the *next* condition check (running the `for` loop's update step first, since that's part of the loop's own control flow, not the body) — it does not exit the loop.

A second run confirms this generalizes beyond parity — verified this session:

```
$ echo '#include <iostream>
int main() {
    for (int num = 1; num <= 10; ++num) {
        if (num == 5) continue;
        std::cout << num << " ";
    }
    std::cout << std::endl;
}' > scratch_continue2.cpp
$ g++ scratch_continue2.cpp -o scratch_continue2 -std=c++17 -Wall -Wextra
$ ./scratch_continue2.exe
1 2 3 4 6 7 8 9 10
```

Skipping exactly one value (`5`) via `continue` leaves every other value printed, in order, with the loop otherwise running normally to completion.

Both scratch files are discarded now; the real project's loops (Concept Unit 3) never use `continue` — every cell of the grid genuinely needs a print, never a skip.

### Mechanical Walkthrough

- `continue;` — **(a) first appearance.** Skips the remainder of the current iteration's body; in a `for` loop specifically, the update step (`++i`) still runs before the next condition check — `continue` does not bypass it.

### CS Lens

`break` and `continue` are two different **early-exit granularities** over the same loop machinery: `break` exits the whole construct; `continue` exits only the current pass through it. The same conceptual pair reappears, generalized, in exception handling (a `catch` that stops a whole operation versus code that recovers and keeps going) later in more advanced C++ work.

### SE Lens

In a `while` loop specifically (not `for`), `continue` jumps straight to the condition check — *skipping* any update statement placed after the `continue` inside the body. A `while` loop whose increment sits at the very end of the body, after a `continue`, becomes an infinite loop the moment that `continue` fires, because the increment never runs on that path. This is exactly the kind of bug Concept Unit 1's loop-invariant thinking is built to catch: if the invariant depends on an update that a control-flow shortcut can skip, the invariant no longer holds on every path.

### Connection

This closes the loop-control-flow tools — Concept Unit 6 returns to the dungeon sketcher itself, using `do-while` (not `break`/`continue`) to validate the dimensions before the grid renders.

---

## Concept Unit 6: `do-while` — Guaranteed First Execution

### The Problem

Validating user input (LAB-03's `std::cin` danger: bad input isn't rejected automatically) means "ask, then check; if invalid, ask again." The check can't happen *before* the first ask — there's nothing to check yet — so `while` (which checks before running the body even once) is the wrong tool for this specific shape.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified (the fixed `DUNGEON_WIDTH`/`DUNGEON_HEIGHT` constants from Concept Unit 2 are replaced by user-validated variables; Concept Unit 3's grid loop is updated to use them).
- **Change type:** Replace (constants become validated input) + Add (`do-while` blocks).
- **Location:** Start of `main`, before the floor-generation `while` loop.
- **Dependencies:** `std::cin` (LAB-03), `||` (LAB-03).

### The New Code

```cpp
const int MIN_SIZE   =  2;
const int MAX_WIDTH  = 20;
const int MAX_HEIGHT = 10;

int dungeonWidth  = 0;
int dungeonHeight = 0;

do {
    std::cout << "Enter dungeon width (" << MIN_SIZE << "-" << MAX_WIDTH << "): ";
    std::cin >> dungeonWidth;
} while (dungeonWidth < MIN_SIZE || dungeonWidth > MAX_WIDTH);

do {
    std::cout << "Enter dungeon height (" << MIN_SIZE << "-" << MAX_HEIGHT << "): ";
    std::cin >> dungeonHeight;
} while (dungeonHeight < MIN_SIZE || dungeonHeight > MAX_HEIGHT);
```

Concept Unit 3's grid loop is then updated: every `DUNGEON_WIDTH` becomes `dungeonWidth`, every `DUNGEON_HEIGHT` becomes `dungeonHeight` — the rendering logic itself does not change, only which variables it reads.

### The Updated Project

```cpp
int main() {
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;
    std::cout << std::endl;

    const int MIN_SIZE   =  2;                                     // ← new
    const int MAX_WIDTH  = 20;                                     // ← new
    const int MAX_HEIGHT = 10;                                     // ← new

    int dungeonWidth  = 0;                                         // ← new
    int dungeonHeight = 0;                                         // ← new

    do {                                                            // ← new
        std::cout << "Enter dungeon width (" << MIN_SIZE << "-" << MAX_WIDTH << "): ";
        std::cin >> dungeonWidth;
    } while (dungeonWidth < MIN_SIZE || dungeonWidth > MAX_WIDTH);  // ← new

    do {                                                            // ← new
        std::cout << "Enter dungeon height (" << MIN_SIZE << "-" << MAX_HEIGHT << "): ";
        std::cin >> dungeonHeight;
    } while (dungeonHeight < MIN_SIZE || dungeonHeight > MAX_HEIGHT); // ← new

    std::cout << std::endl;

    int currentFloor = 1;
    while (currentFloor <= TOTAL_FLOORS) { /* unchanged */ }

    for (int row = 0; row < dungeonHeight; ++row) {                 // ← was: DUNGEON_HEIGHT
        for (int col = 0; col < dungeonWidth; ++col) {              // ← was: DUNGEON_WIDTH
            /* wall/floor logic unchanged */
        }
    }

    return 0;
}
```

### Concept Lab

```cpp
// scratch_dowhile.cpp  (disposable)
#include <iostream>
int main() {
    const int MIN_SIZE = 2;
    const int MAX_WIDTH = 20;
    int dungeonWidth = 0;
    do {
        std::cout << "Enter dungeon width (" << MIN_SIZE << "-" << MAX_WIDTH << "): ";
        std::cin >> dungeonWidth;
    } while (dungeonWidth < MIN_SIZE || dungeonWidth > MAX_WIDTH);
    std::cout << "accepted: " << dungeonWidth << std::endl;
}
```

Run it, piping two inputs to stand in for two rounds of typing — verified this session:

```
$ g++ scratch_dowhile.cpp -o scratch_dowhile -std=c++17 -Wall -Wextra
$ printf "25\n10\n" | ./scratch_dowhile.exe
Enter dungeon width (2-20): Enter dungeon width (2-20): accepted: 10
```

What that proves: the prompt printed *twice* — the body ran once with `25` (out of range, condition still true, loop repeats), then again with `10` (in range, condition false, loop exits) — confirming the body runs, unconditionally, at least once before the condition is checked at all. A `while` loop checking `dungeonWidth < MIN_SIZE || dungeonWidth > MAX_WIDTH` *before* ever prompting would need `dungeonWidth` to already hold a value to test — there is no natural "before the first prompt" value that means anything, which is exactly the shape `do-while` exists for.

This scratch file is discarded now; the real project's two `do-while` blocks (width, then height) are exactly this pattern, run twice with different bounds.

### Mechanical Walkthrough

- `do { ... } while (condition);` — **(a) first appearance.** The body executes first; the condition, checked afterward, decides whether to run the body again. Note the trailing `;` after `while (condition)` — required here, unlike a `while` loop's own header, because this `while` is closing a statement, not opening one.

### CS Lens

`do-while` is `while`'s exact mirror: same condition-controls-repetition machinery, opposite check timing. Choosing between them is entirely about whether the body's *first* run should be conditional (`while`) or guaranteed (`do-while`) — nothing else about how they execute differs.

### SE Lens

Input validation is the canonical `do-while` use case specifically because there is no meaningful way to check "is the input valid?" before any input has been requested — the body (asking) must happen before the condition (checking what was asked) can be evaluated even once. Reaching for `while` here would require an awkward, artificial "pretend" first value just to make the pre-check pass, which is worse than simply using the loop shape built for this exact ordering.

### Run It

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ printf "10\n4\n" | ./dungeon.exe
=== Dungeon Map Sketcher ===

Enter dungeon width (2-20): Enter dungeon height (2-10): 
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

Verified this session — `10`/`4` accepted immediately (both within range), and the grid renders exactly as it did with the hardcoded constants in Concept Unit 3, now driven entirely by user input.

### Connection

Every dimension in the finished program now comes from validated user input — the Closing section's Exercise extends the render loop itself, per this lesson's own Challenge.

---

## Closing

### Connect the pieces

Trace a `10`×`4` run end to end: two `do-while` loops (Concept Unit 6) each run their body at least once, repeating only if the typed value falls outside `[MIN_SIZE, MAX_WIDTH]` or `[MIN_SIZE, MAX_HEIGHT]` — accepting `10` and `4` immediately since both are in range. The `while` loop (Concept Unit 1) then announces all five floors, its invariant guaranteeing each floor number 1–5 is announced exactly once. Finally, the nested `for` loops (Concept Units 2–3) visit all `4 × 10 = 40` cells of the now-user-sized grid, and for each one, four named booleans and one `||` (LAB-03) decide wall or floor — the identical decision logic Concept Unit 3 first proved on fixed constants, now reading `dungeonWidth`/`dungeonHeight` instead, with zero changes to the decision logic itself. Four different loop shapes — `do-while`, `while`, and two nested `for`s — cooperate in one program, each chosen for the specific repetition shape its section needed.

### What breaks without this

Deliberately remove `++currentFloor;` from the `while` loop's body (verified conceptually against Concept Unit 1's own proof, not run here — running it would hang) and the floor-generation section never terminates: `currentFloor` stays `1` forever, `1 <= TOTAL_FLOORS` stays `true` forever, and the program prints "Generating floor 1 of 5..." without end, never reaching the grid-rendering code that follows it. This is the infinite loop Concept Unit 1 warned about, made concrete: not a crash, not an error message — a program that simply never finishes, with `Ctrl+C` as the only way out.

### Exercises

1. Change `TOTAL_FLOORS` to `10` and confirm all ten "Generating floor..." lines print, with zero changes to the `while` loop itself — only the `const` changed.
2. Build this lesson's staircase Challenge: add `bool isCenterRow = (row == dungeonHeight / 2);`, `bool isCenterCol = (col == dungeonWidth / 2);`, `bool isStairs = isCenterRow && isCenterCol && !isWall;`, and an `else if (isStairs) { std::cout << "> "; }` branch between the existing wall and floor branches. Verify, for a real `10`×`4` run, that `>` appears at row 2, column 5 and nowhere else.
3. Predict, in writing, what `scratch_continue.cpp` (Concept Unit 5) would print if `i % 2 == 0` were changed to `i % 3 == 0` — then compile and run the change to check.
4. Write a small standalone program using `break` to find and print the *first* dungeon floor number (1 through `TOTAL_FLOORS`) evenly divisible by 3, stopping immediately once found — confirm it does not continue checking the remaining floors by adding a print statement after the loop that would only make sense if it checked all of them, and confirming that statement's context matches what actually ran.

### Definition of done

- [ ] `main.cpp` validates width and height with `do-while`, announces floors with `while`, and renders a walled grid with nested `for` loops, all three loop kinds used for real, not just described.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] Entering an out-of-range width or height (verified with piped input, e.g. `25` then `10`) causes the prompt to repeat exactly as many times as invalid values were given.
- [ ] You can state, from Concept Unit 1's own proof, why removing a loop's update step produces an infinite loop rather than a compile error.
- [ ] You can explain the difference between `break` and `continue` using Concept Units 4–5's own verified examples, not a memorized one-line definition.
- [ ] Exercises 2–4 completed with real compiled output, including Exercise 3's written prediction made before compiling.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-04: validated dungeon dimensions, floor announcements, and a rendered grid using while/for/do-while"` — states why (a working, user-driven renderer, every loop shape verified) not just what changed.
