# Lesson 5: A Function Is a Fix Applied Everywhere at Once
### (LAB 05 — Functions)

**What you will build:** The LAB-04 dungeon sketcher, restructured — with identical visible output — into named functions: `drawGrid`, `getValidInput`, and `main` itself shrunk to a handful of lines that read as a plain-English description of the program. The transferable problem: code duplicated across several places doesn't fail loudly when it drifts out of sync — one copy gets fixed, the others don't, and nothing announces the mismatch. A function makes that impossible by construction: there is exactly one copy of the logic, and every caller shares it.

**What you need to know first:** LAB-04 — `while`, `for`, `do-while`, nested loops, the exact grid-drawing and input-validation code this lesson restructures. LAB-03's `bool`/`&&`/`!`. LAB-00's `int main()` as a first example of a function, revisited here with the vocabulary to describe it properly.

**Terms introduced in this lesson**

> **Function** — a named, reusable block of code, invoked by name from anywhere in the program.
> **Declaration (function prototype)** — a statement telling the compiler a function's name, parameters, and return type, without its body.
> **Definition** — a function's actual code body.
> **Parameter** — a named input a function receives; **argument** — the actual value supplied at a specific call.
> **Call stack** — the region of memory tracking every currently active function call.
> **Stack frame** — the block of memory holding one function call's parameters, local variables, and return address.
> **Return value** — the value a function sends back to its caller via `return`.
> **Pass-by-value** — a function receiving a *copy* of an argument, not the original.
> **Scope** — the region of code where a declared name can be seen and used.
> **Shadowing** — declaring a name in an inner scope that reuses an outer scope's name, hiding the outer one within the inner block.
> **DRY (Don't Repeat Yourself)** — the principle that a piece of logic should exist in exactly one place.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: The Problem Functions Solve

### The Problem

LAB-04's grid-drawing nested loop is roughly 15 lines. If the dungeon sketcher needed to redraw the grid in three different places — an initial draw, after the player moves, after an enemy moves — the naive approach is pasting those 15 lines three times. A bug found in one copy has to be found and fixed in all three; missing one leaves the program behaving inconsistently depending on which copy ran.

### No isolated code lab for this step

This is best shown directly against the real, already-familiar LAB-04 code rather than an invented disposable example — the problem is specifically about *this* code's duplication, not a generic illustration.

### Explanation

```cpp
// Copy 1: initial draw
for (int row = 0; row < height; ++row) {
    for (int col = 0; col < width; ++col) { /* ... */ }
}

// Copy 2: after player moves (identical code)
for (int row = 0; row < height; ++row) {
    for (int col = 0; col < width; ++col) { /* ... */ }
}

// Copy 3: after enemy moves — a typo slipped in here
for (int row = 0; row < heigth; ++row) {   // ← only this copy breaks
```

A **function** collects that logic into one named, reusable block, called instead of retyped:

```cpp
void drawGrid(int width, int height) {
    // rendering code lives here — exactly once
}

drawGrid(width, height);   // initial draw
drawGrid(width, height);   // after player moves
drawGrid(width, height);   // after enemy moves
```

Fixing a bug in `drawGrid`'s body fixes every call site simultaneously — there is only one place a typo like `heigth` could even occur.

### CS Lens

Collecting one piece of logic into one named unit, called from many places, is **DRY (Don't Repeat Yourself)** — one of the most load-bearing principles in software engineering, and functions are its smallest, most fundamental instance in this curriculum: every larger abstraction built later in this series (classes in `CPP-S02-LAB-02`, modules, libraries) is, underneath, a way of organizing collections of functions.

### SE Lens

A function is also an **abstraction boundary**: a caller writing `drawGrid(width, height)` does not need to know *how* the grid is drawn — only that calling it draws it correctly. This is the identical hiding-of-implementation idea LAB-00 introduced for `std::cout` (hiding the OS's raw `write()`/`WriteFile()` calls) — a function is how a programmer creates that same kind of boundary for their own code, not just for what the standard library provides.

### Connection

Concept Unit 2 gives this idea its exact C++ syntax — declaration, definition, and call — before Concept Unit 3 applies it to the real dungeon sketcher.

---

## Concept Unit 2: Declaration, Definition, and the Call Stack

### The Problem

Concept Unit 1 showed `drawGrid` used, but not the exact syntax that makes it exist as a callable name the compiler recognizes, or what physically happens in memory when one function calls another.

### No isolated code lab for this step

`int main()` itself, taught fully back in LAB-00, already *is* a function — this unit names the vocabulary for something already familiar, rather than introducing new runnable syntax to isolate.

### Explanation

A function has three distinct parts:

```cpp
void drawGrid(int width, int height);   // declaration — ends with a semicolon, no body

void drawGrid(int width, int height) {  // definition — no semicolon, has a body
    // ...
}

drawGrid(10, 4);                        // call — execution jumps into the function's body
```

The **declaration** (or prototype) tells the compiler "this function exists, and this is its exact signature" — its name, parameter types, and return type — without providing the body. Placing declarations near the top of a file lets functions call each other regardless of which one is *defined* further down. The **definition** is the actual code. `void` (LAB-00's `int main()` used `int` instead) marks a function that performs an action but sends no value back to its caller.

The **call stack** is the region of RAM tracking every function call currently in progress. Calling `drawGrid(10, 4)` pushes a **stack frame** — a block of memory holding `width = 10`, `height = 4`, and a return address (where to resume once `drawGrid` finishes) — executes the body, then pops that frame and jumps back to the return address:

```
main() calls drawGrid()
  drawGrid() calls isTileWall()      (hypothetical helper — not yet in this project)
    isTileWall() finishes → returns to drawGrid()
  drawGrid() finishes → returns to main()
main() continues
```

### Mechanical Walkthrough

- `void drawGrid(int width, int height);` — **(a) first appearance.** A declaration: name (`drawGrid`), parameter types and names (`int width`, `int height`), return type (`void`), terminated by `;` with no body.
- `void drawGrid(int width, int height) { ... }` — **(a) first appearance of a definition written by hand** (LAB-00's `int main()` was the first function definition seen, but its own declaration/definition distinction was never named until now).

### CS Lens

The call stack is a literal **stack** data structure — last in, first out — the same abstract structure formally taught in `CPP-S02-LAB-09`; here, the hardware and the compiler are already using one, whether or not the programmer ever builds one by hand. Every function call pushes a frame; every return pops the most recently pushed one — never any other, which is exactly why a function returns to its own caller and not to some arbitrary earlier point in the program.

### SE Lens

Separating declaration from definition — the same preprocessor-era problem LAB-00 and `CPP-S02-LAB-01` solve with header files — lets `main` (defined last in the file, by convention in this lesson) call `drawGrid` (defined above it) and, just as easily, would let functions defined in *any* order call each other, as long as every function used has been declared before that use.

### Watch for

A function that calls itself, in a chain that never terminates, fills the call stack completely — a **stack overflow** crash, distinct from LAB-01's integer overflow despite the shared name; intentional, terminating recursion is covered properly in `CPP-S02-LAB-11`.

### Connection

Concept Unit 3 applies exactly this declaration/definition/call shape to the real LAB-04 grid-drawing code.

---

## Concept Unit 3: Extracting `drawGrid`

### The Problem

LAB-04's grid-rendering nested loop lives directly inside `main`, duplicating Concept Unit 1's exact problem the moment this project ever needs to draw more than once.

### Project Change

- **Reference Source:** LAB-04's finished `main.cpp` (this same series, prior lesson) — the nested-loop rendering logic is quoted verbatim below, unchanged in behavior, only relocated and parameterized.
- **Files affected:** `main.cpp` — restructured.
- **Change type:** Refactor (move code from `main`'s body into a new function).
- **Location:** Declaration near the top of the file; definition above `main`; call inside `main` where the loops used to be.
- **Dependencies:** LAB-04's grid-rendering logic (walls, staircase).

### The New Code

```cpp
void drawGrid(int width, int height);

void drawGrid(int width, int height) {
    for (int row = 0; row < height; ++row) {
        for (int col = 0; col < width; ++col) {
            bool isTopRow    = (row == 0);
            bool isBottomRow = (row == height - 1);
            bool isLeftCol   = (col == 0);
            bool isRightCol  = (col == width - 1);
            bool isWall      = isTopRow || isBottomRow || isLeftCol || isRightCol;
            bool isStairs    = (row == height / 2) && (col == width / 2) && !isWall;

            if (isWall)        { std::cout << "# "; }
            else if (isStairs) { std::cout << "> "; }
            else               { std::cout << ". "; }
        }
        std::cout << std::endl;
    }
}
```

### The Updated Project

```cpp
#include <iostream>

const int TOTAL_FLOORS = 5;
const int MIN_SIZE     = 2;
const int MAX_WIDTH    = 20;
const int MAX_HEIGHT   = 10;

// ── Function Declarations ──────────────────────
void drawGrid(int width, int height);   // ← new

// ── Function Definitions ───────────────────────
void drawGrid(int width, int height) {  // ← new
    for (int row = 0; row < height; ++row) {
        for (int col = 0; col < width; ++col) {
            bool isTopRow    = (row == 0);
            bool isBottomRow = (row == height - 1);
            bool isLeftCol   = (col == 0);
            bool isRightCol  = (col == width - 1);
            bool isWall      = isTopRow || isBottomRow || isLeftCol || isRightCol;
            bool isStairs    = (row == height / 2) && (col == width / 2) && !isWall;

            if (isWall)        { std::cout << "# "; }
            else if (isStairs) { std::cout << "> "; }
            else               { std::cout << ". "; }
        }
        std::cout << std::endl;
    }
}

// ── Main ────────────────────────────────────────
int main() {
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;
    std::cout << std::endl;

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

    std::cout << std::endl;
    drawGrid(dungeonWidth, dungeonHeight);   // ← new — replaces the inlined nested loops

    return 0;
}
```

### Concept Lab

No separate throwaway: `drawGrid` extracted from real, already-verified LAB-04 code *is* the demonstration — inventing a disposable stand-in would only obscure that this is a refactor of known-working code, not new logic.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ printf "12\n5\n" | ./dungeon.exe
=== Dungeon Map Sketcher ===

Enter dungeon width (2-20): Enter dungeon height (2-10): 
# # # # # # # # # # # # 
# . . . . . . . . . . # 
# . . . . . > . . . . # 
# . . . . . . . . . . # 
# # # # # # # # # # # #
```

**Correcting this lesson's own "What you will build" mockup before it's shown again:** an earlier draft of this lesson's target output placed the `>` one column left of where the real, verified code puts it — the actual formula is `col == width / 2`, and for `width = 12`, `width / 2 = 6` (LAB-02's integer division), landing the stairs at column index 6, not 4. The output above is the real, compiled, run result — not a hand-sketched approximation of it, per this schema's own standard.

What that proves: identical output to LAB-04, produced now by a single `drawGrid(dungeonWidth, dungeonHeight);` call instead of an inlined nested loop — confirming the refactor changed *where* the logic lives, not *what* it does.

### Mechanical Walkthrough

- `drawGrid(dungeonWidth, dungeonHeight)` — **(a) first appearance of a call to a hand-written function with arguments.** `dungeonWidth` and `dungeonHeight` are **arguments** — the actual values supplied at this specific call; `width` and `height`, inside `drawGrid`'s own definition, are its **parameters** — the names it uses internally, regardless of what the caller happened to name its own variables.

### CS Lens

`main` no longer contains rendering logic at all — it delegates. This delegation is the seed of every larger architecture this curriculum builds toward: a `main` (or, later, a top-level orchestrating class) that reads as a high-level story, calling out to named pieces that each handle one job.

### SE Lens

The caller (`main`) does not know or care *how* `drawGrid` decides wall versus floor versus stairs — only that calling it, with a width and a height, produces the correct grid. Verified concretely: adding a second `drawGrid(dungeonWidth, dungeonHeight);` call right after the first draws the identical grid twice, with zero additional loop code — proof that the logic genuinely lives in one place now, reusable on demand.

### Connection

`drawGrid` takes its width and height as *copies* — Concept Unit 4 makes that copying behavior, and why it matters, explicit.

---

## Concept Unit 4: Pass-by-Value — Functions Work on Copies

### The Problem

If `drawGrid` internally reassigned its `width` parameter (say, while computing something), would that change `dungeonWidth` back in `main`? Nothing said so far answers this — and the answer is not obvious from the syntax alone.

### No isolated code lab for this step

The real `drawGrid`/`main` pair never reassigns a parameter, so there's nothing to observe there directly — this needs a dedicated, deliberately-mutating Concept Lab.

### Concept Lab

```cpp
// scratch_byvalue.cpp  (disposable)
#include <iostream>
void attemptChange(int value) {
    value = 999;
    std::cout << "Inside: " << value << std::endl;
}
int main() {
    int score = 42;
    attemptChange(score);
    std::cout << "After: " << score << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_byvalue.cpp -o scratch_byvalue -std=c++17 -Wall -Wextra
$ ./scratch_byvalue.exe
Inside: 999
After: 42
```

What that proves: reassigning `value` to `999` *inside* `attemptChange` changed only that function's own local copy — `score`, in `main`, remained `42`, completely untouched. This is **pass-by-value**: calling `attemptChange(score)` copies `score`'s current value into a brand-new stack-frame variable named `value` (Concept Unit 2's stack frame, concretely observed); after that copy is made, `value` and `score` are two entirely separate memory locations that happen to have started with the same number.

This scratch file is discarded now; if `drawGrid`'s `width` parameter were ever reassigned internally, it would behave identically — `dungeonWidth` in `main` would be unaffected, per this proof.

### Mechanical Walkthrough

- `void attemptChange(int value)` — **(c) already basic** (Concept Unit 2's parameter syntax), with a plain `int` parameter — specifically *not* a reference (LAB-09), which is what makes this pass-by-value rather than something that could modify the caller's original.
- `value = 999;` — **(c) already basic** (assignment, LAB-01) — reassigns the local copy only.

### CS Lens

Pass-by-value is the same read-modify-write locality LAB-02's compound assignment introduced, scoped now to an entire stack frame instead of one variable: every function call gets its own private copies of its arguments, and nothing about modifying those copies can reach backward into the caller's frame.

### SE Lens

Copying arguments by default is a deliberate safety choice: a function meant only to *read* its inputs (like `drawGrid`, which only reads `width`/`height` to decide what to print) cannot accidentally corrupt the caller's variables, even if its own internal logic reassigns a parameter for convenience partway through. The tradeoff is real, though: sometimes a function's entire *purpose* is to modify the caller's variable — pass-by-value makes that impossible without an explicit different tool, which LAB-09 (references, `&`) provides.

### Connection

Return values, next, are how a function that *can't* modify its caller's variables directly still gets a result back to them.

---

## Concept Unit 5: Return Values

### The Problem

`attemptChange` (Concept Unit 4) computed `999` and then... the value simply vanished when the function ended, with `main` never seeing it. A function that computes something useful needs an explicit way to send that result back.

### No isolated code lab for this step

`return 0;` has appeared in every `main` since LAB-00 — this unit names the general mechanism properly, using a fresh example that returns a *computed* value rather than a fixed status code.

### Concept Lab

```cpp
// scratch_return.cpp  (disposable)
#include <iostream>
int calculateDamage(int attack, int defense) {
    int damage = attack - defense;
    if (damage < 0) damage = 0;
    return damage;
}
int main() {
    int result = calculateDamage(10, 3);
    std::cout << result << std::endl;
    int result2 = calculateDamage(3, 10);
    std::cout << result2 << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_return.cpp -o scratch_return -std=c++17 -Wall -Wextra
$ ./scratch_return.exe
7
0
```

What that proves: `calculateDamage(10, 3)` computed `10 - 3 = 7` and `return`ed it — `main`'s `int result` received that `7` directly, unlike Concept Unit 4's `attemptChange`, which had no `return` and no way to hand anything back. `calculateDamage(3, 10)` computed a negative `-7`, but the `if (damage < 0) damage = 0;` guard replaced it with `0` before returning — `result2` receives the *guarded* value, `0`, never the raw negative one; the caller only ever sees what `return` actually sends.

This scratch file is discarded now; `getValidInput`, next, uses this identical `return`-a-computed-value shape for real.

### Mechanical Walkthrough

- `int calculateDamage(int attack, int defense)` — **(a) first appearance of a non-`void` return type on a hand-written function.** The `int` before the name is the **return type** — the type of value this function sends back; it must match whatever `return` provides.
- `return damage;` — **(a) first appearance of returning a computed value**, distinct from LAB-00's `return 0;`, which returned a fixed literal.

### CS Lens

A return value is the function-call analog of an expression's own value (LAB-02) — `calculateDamage(10, 3)` is itself an expression that evaluates to `7`, exactly the way `2 + 3 * 4` evaluates to `14`; a function call is not fundamentally different from any other expression that produces a value, it just happens to run arbitrary code to compute it.

### SE Lens

Guarding the result inside `calculateDamage` (clamping negative damage to `0`) rather than leaving that check to every caller is the same DRY principle from Concept Unit 1 applied to a *rule*, not just repeated code: any caller of `calculateDamage` automatically gets correct, non-negative damage, with no risk of one caller remembering the clamp and another forgetting it.

### Connection

`getValidInput`, next, combines pass-by-value parameters (Concept Unit 4) and a return value (this unit) into one real, reusable function.

---

## Concept Unit 6: Extracting `getValidInput`

### The Problem

LAB-04's two `do-while` input-validation blocks (width, then height) are nearly identical — differing only in the prompt text and the min/max bounds — the exact duplication shape Concept Unit 1 opened this lesson with.

### Project Change

- **Reference Source:** LAB-04's finished `main.cpp` — the two `do-while` blocks are quoted, generalized into one function taking the varying parts (prompt, bounds) as parameters.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Refactor.
- **Location:** New declaration/definition alongside `drawGrid`'s; `main`'s two `do-while` blocks replaced with two calls.
- **Dependencies:** `do-while` (LAB-04), pass-by-value (Concept Unit 4), return values (Concept Unit 5).

### The New Code

```cpp
int getValidInput(const std::string& prompt, int minValue, int maxValue);

int getValidInput(const std::string& prompt, int minValue, int maxValue) {
    int value = 0;
    do {
        std::cout << prompt << " (" << minValue << "-" << maxValue << "): ";
        std::cin >> value;
    } while (value < minValue || value > maxValue);
    return value;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <string>   // ← new — std::string

const int TOTAL_FLOORS = 5;
const int MIN_SIZE     = 2;
const int MAX_WIDTH    = 20;
const int MAX_HEIGHT   = 10;

void drawGrid(int width, int height);
int getValidInput(const std::string& prompt, int minValue, int maxValue);   // ← new

void drawGrid(int width, int height) { /* unchanged, Concept Unit 3 */ }

int getValidInput(const std::string& prompt, int minValue, int maxValue) {   // ← new
    int value = 0;
    do {
        std::cout << prompt << " (" << minValue << "-" << maxValue << "): ";
        std::cin >> value;
    } while (value < minValue || value > maxValue);
    return value;
}

int main() {
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;
    std::cout << std::endl;

    int dungeonWidth  = getValidInput("Enter dungeon width",  MIN_SIZE, MAX_WIDTH);    // ← was: a do-while block
    int dungeonHeight = getValidInput("Enter dungeon height", MIN_SIZE, MAX_HEIGHT);   // ← was: a do-while block

    std::cout << std::endl;
    drawGrid(dungeonWidth, dungeonHeight);

    return 0;
}
```

### Concept Lab

No separate throwaway — this reuses Concept Unit 3's own pattern (extract real, already-verified LAB-04 logic into a function) with a second function.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ printf "12\n5\n" | ./dungeon.exe
```

Produces output identical to Concept Unit 3's verified run — confirming the refactor preserved behavior exactly.

### Mechanical Walkthrough

- `const std::string& prompt` — **(a) first appearance of `std::string`** (full treatment in LAB-07 — noted here only as "the standard library's text type, holding a sequence of characters," enough to use it as a parameter) **and (a) first appearance of `&` as part of a parameter type** — a **reference** parameter, letting the function read `prompt` without copying its entire text content on every call; full treatment in LAB-09, flagged here explicitly as a preview rather than silently used unexplained.
- `const std::string& prompt` (the `const` specifically) — **(c) reappearing**, per LAB-02 Concept Unit 5's rule — here preventing `getValidInput` from modifying the caller's string through the reference, the same immutability guarantee `const` provided for `CLOCK_SIZE`, applied to a parameter instead of a local variable.

### CS Lens

`getValidInput` is a **general-purpose function**, parameterized over exactly the two things that differ between its two call sites (the prompt text, the bounds) while the actual validation loop's *shape* — ask, check, repeat if invalid — stays fixed. This is the essential shape of abstraction: identify what varies, parameterize exactly that, and nothing more.

### SE Lens

`main` shrank to six meaningful lines — a reader sees "get width, get height, draw" at a glance, with none of the validation mechanics cluttering that top-level story. This is the real payoff of extracting functions well: not just avoiding duplication (Concept Unit 1), but making the *caller's* code read as a description of intent, with the how relegated to a well-named function a reader can look into only if they need to.

### Run It

Verified this session — adding a third call, `getValidInput("Enter floor count", 1, 10)`, before the grid draw, and printing its result, required writing zero new validation logic — only one line calling the already-correct function.

### Connection

`value` inside `getValidInput` and `width`/`height` inside `drawGrid` are all separate, independent variables, despite some sharing conceptual similarity — Concept Unit 7 explains exactly why that independence is guaranteed.

---

## Concept Unit 7: Scope

### The Problem

`getValidInput` and `drawGrid` are both allowed to use a local variable named `value` or reuse `row`/`col`-style names without colliding with each other, or with anything in `main` — nothing so far has explained why that's guaranteed safe rather than a coincidence of the names chosen.

### No isolated code lab for this step

Demonstrated directly with a minimal disposable example — small enough to need no larger project context.

### Concept Lab

```cpp
// scratch_scope.cpp  (disposable)
int main() {
    {
        int treasure = 100;
    }
    return treasure;   // treasure does not exist here
}
```

Compiling — verified this session:

```
$ g++ scratch_scope.cpp -o scratch_scope -std=c++17 -Wall -Wextra
scratch_scope.cpp:5:12: error: 'treasure' was not declared in this scope
    5 |     return treasure;
      |            ^~~~~~~~
```

What that proves: `treasure`'s **scope** — the region of code where it can be seen and used — begins at its declaration and ends at the closing `}` of the block (here, the inner `{ }`) it was declared in. Referencing it one line later, outside that block, is not merely bad practice; it is a compile error, because the compiler has already forgotten `treasure` exists.

A second, contrasting proof — shadowing, with a name reused deliberately in a nested block:

```cpp
// scratch_realshadow.cpp  (disposable)
#include <iostream>
int main() {
    int score = 1;
    {
        int score = 2;
        std::cout << score << std::endl;
    }
    std::cout << score << std::endl;
}
```

```
$ g++ scratch_realshadow.cpp -o scratch_realshadow -std=c++17 -Wall -Wextra -Wshadow
scratch_realshadow.cpp:5:13: warning: declaration of 'score' shadows a previous local [-Wshadow]
    5 |         int score = 2;
      |             ^~~~~
scratch_realshadow.cpp:3:9: note: shadowed declaration is here
    3 |     int score = 1;
      |         ^~~~~
$ ./scratch_realshadow.exe
2
1
```

What that proves: this compiles (unlike the first example) and runs — the inner `score` **shadows** the outer one for the duration of the inner block, printing `2`; once that block ends, the outer `score`, untouched, is visible again and prints `1`. `-Wshadow` (not part of `-Wall -Wextra`; added explicitly here) flags this as a warning specifically because it's a common source of confusion — a reader skimming the inner block might assume `score` refers to the outer one.

Both scratch files are discarded now; `getValidInput`'s `value` and `drawGrid`'s `width`/`height` never shadow each other or anything in `main` — they simply exist in entirely separate function scopes, never visible to each other at all, which is a stronger and simpler guarantee than shadowing's "visible but temporarily hidden."

### Mechanical Walkthrough

- `{ int treasure = 100; }` — **(a) first appearance of a bare block used purely to create scope**, with no `if`/`for`/function attached to it — legal C++, used here only to demonstrate scope boundaries in isolation.

### CS Lens

Scope is what makes local reasoning about a function possible at all: reading `getValidInput`'s body, a programmer never needs to check the rest of the file for other uses of `value` — its scope guarantees no other `value` can interfere, the same guarantee LAB-04's `for` loop counters relied on implicitly (a `for` loop's own counter is scoped to the loop, per LAB-04 Concept Unit 2's SE Lens) generalized now to whole functions.

### SE Lens

This course's own rule — never deliberately shadow a variable, always use a distinct name — trades the small convenience of reusing a familiar name for the guarantee that a reader never has to ask "which `score` does this line mean?" `-Wshadow`, verified above to catch this in real code, is worth adding to a project's build flags specifically because the mistake is silent otherwise: shadowing is legal, unambiguous to the compiler, and still a common source of a human reader misreading which variable a line actually touches.

### Connection

This closes every new concept in this lesson — the Closing section traces one call through the finished, function-organized program.

---

## Closing

### Connect the pieces

Follow one call end to end: `main` calls `getValidInput("Enter dungeon width", MIN_SIZE, MAX_WIDTH)` (Concept Unit 6) — a new stack frame (Concept Unit 2) is pushed, holding pass-by-value copies (Concept Unit 4) of the three arguments as `prompt`, `minValue`, `maxValue`. The `do-while` (LAB-04) inside runs, scoped entirely to this call (Concept Unit 7) — its local `value` cannot be seen from `main` or from `drawGrid`. Once valid input is entered, `return value;` (Concept Unit 5) sends the result back; the stack frame pops, and `main`'s `dungeonWidth` receives that returned value. The identical shape repeats for `dungeonHeight`, then both are passed — again by value — into `drawGrid` (Concept Unit 3), whose own stack frame, whose own scope, renders the grid using logic that has not changed one character since LAB-04 — only *where* that logic lives has changed.

### What breaks without this

Delete `getValidInput`'s *declaration* (keep the definition, but remove the standalone prototype line near the top of the file) while leaving `main`'s calls to it exactly as they are, if `getValidInput`'s *definition* is placed **after** `main` in the file — verified conceptually, matching Concept Unit 2's own explanation: the compiler processes the file top to bottom, and by the time it reaches `main`'s call to `getValidInput`, it has not yet seen anything named `getValidInput` at all, producing an "undeclared identifier" error. This is precisely why declarations are placed near the top, ahead of `main` — order-independence between functions is not automatic in C++; it is purchased specifically by declaring first, defining wherever convenient afterward.

### Exercises

1. Add a third `getValidInput` call — `int totalFloors = getValidInput("Enter floor count", 1, 10);` — before the grid draw, and print `"This dungeon has " << totalFloors << " floors."` afterward. Confirm no new validation logic was written, only a new call.
2. Implement this lesson's `printFloorList(int totalFloors)` Challenge: a function that prints LAB-04's "Generating floor N of M..." messages via a `for` loop, called once from `main` with `TOTAL_FLOORS`. Verify its output matches LAB-04's `while`-loop version exactly, produced now by a completely different loop kind inside a function instead of inline in `main`.
3. Inside `drawGrid`, add a line reassigning `width = 999;` immediately after the function's opening `{`, then rebuild and rerun with real input — confirm, per Concept Unit 4's proof, that `dungeonWidth` in `main`'s own output (print it right after the `drawGrid` call) is unaffected. Remove the line afterward.
4. Rebuild `scratch_realshadow.cpp` (Concept Unit 7) without `-Wshadow` and confirm it compiles with no warning at all under only `-Wall -Wextra` — then explain, in your own words, why this course adds `-Wshadow` as a deliberate, non-default choice rather than relying on the two flags used throughout the rest of this series.

### Definition of done

- [ ] `main.cpp` calls `drawGrid` and `getValidInput` — no rendering or validation loop remains inlined directly in `main`.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`, and reproduces this lesson's verified output exactly for a `12`×`5` run.
- [ ] `main`'s body is under 10 lines and reads, at a glance, as "get width, get height, draw."
- [ ] You can state, from Concept Unit 4's own proof, exactly what pass-by-value guarantees and what it does not.
- [ ] You can explain the difference between a declaration and a definition, and why declaration order (not definition order) is what the compiler actually requires.
- [ ] All four Exercises completed with real compiled output, including Exercise 3's parameter-reassignment proof rerun on this project's own code, not just the earlier scratch file.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-05: extracted drawGrid and getValidInput, main reads as a high-level story"` — states why (eliminating duplication, one place to fix each concern) not just what changed.
