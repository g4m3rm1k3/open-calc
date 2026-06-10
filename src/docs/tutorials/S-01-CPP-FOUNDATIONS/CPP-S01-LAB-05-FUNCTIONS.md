# C++ Masterclass — S-01 — LAB 05 — Functions

**Prerequisites:** LAB 04. You can write loops and nested loops. You can draw a grid.

**What this lab adds:**
- Why functions exist — the problem they solve before you see the solution
- Function declaration, definition, and the call stack
- Parameters — passing data into a function
- Return values — getting data back out
- Pass-by-value — why functions work on copies, and when that matters
- Scope — where a variable can and cannot be seen
- `const` parameters — protecting data you pass in
- Splitting the dungeon map sketcher into well-named functions

**Time:** ~70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you have code to draw a dungeon grid and you need to draw it three times
>    in a program (beginning, after a change, after another change), how many
>    times must you write the drawing code if you do NOT use functions?
> 2. You call `drawGrid(width, height)`. Inside `drawGrid`, you write `width = 99`.
>    When the function returns, what is the value of `width` in the calling code?
>    (Predict based on what you know — the answer is not obvious.)
> 3. What is the difference between a function's *declaration* and its *definition*?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The dungeon map sketcher from LAB 04, restructured into clean, named functions.
The visible output is identical — but the code becomes readable and reusable:

```
=== Dungeon Map Sketcher ===

Enter dungeon width (2-20):  12
Enter dungeon height (2-10): 5

# # # # # # # # # # # #
# . . . . . . . . . . #
# . . . . > . . . . . #
# . . . . . . . . . . #
# # # # # # # # # # # #
```

The program is now organized as:
- `drawGrid(width, height)` — renders the map
- `getValidInput(min, max, prompt)` — handles validated input
- `main()` — orchestrates the flow at a high level

---

## Part 1 — The Problem Functions Solve

### Concept: Functions — Named, Reusable Blocks of Code

**What they are:** A named block of code that can be invoked (called) from any point
in the program. When called, execution jumps into the function; when the function
finishes, execution returns to exactly where it left off.

**The problem before (without functions):**
Imagine the dungeon renderer needs to run in three places: at the start, after the
player moves, and after an enemy moves. Without functions, you copy-paste the
entire nested loop three times.

```cpp
// BAD — three copies of the same 20-line rendering block
// Copy 1: initial draw
for (int row = 0; row < height; ++row) {
    for (int col = 0; col < width; ++col) { /* ... */ }
}

// Copy 2: after player moves (identical code)
for (int row = 0; row < height; ++row) {
    for (int col = 0; col < width; ++col) { /* ... */ }
}

// Copy 3: after enemy moves (identical code, but with a typo in this one)
for (int row = 0; row < heigth; ++row) {   // ← typo: 'heigth' — now only this copy breaks
```

When you fix a bug in the rendering code, you must find and fix all three copies.
If you miss one, different parts of the game behave differently.

**The solution:**
```cpp
void drawGrid(int width, int height) {
    // rendering code lives here — exactly once
}

// Three calls — one line each:
drawGrid(width, height);   // initial draw
drawGrid(width, height);   // after player moves
drawGrid(width, height);   // after enemy moves
```

Fix the code once — all three calls use the fix automatically.

**What it hides:** The implementation details of a task. The caller of `drawGrid`
does not need to know *how* the grid is drawn — only that calling `drawGrid(width, height)`
will draw it correctly. This is a fundamental abstraction: hiding complexity behind a name.

**The protected invariant:** If `drawGrid` is correct, every call to `drawGrid` produces
the correct result. A bug in rendering can only be fixed in one place, and fixing it
fixes all callsites simultaneously.

**Pattern category:** Non-GoF (fundamental language feature).
**You will see this pattern again in:** Every subsequent lab and every series. Functions
are the atom of code organization — everything else (classes, modules, libraries) is
built from them.

---

## Part 2 — Anatomy of a Function

### Concept: Declaration, Definition, and the Call Stack

**The three parts of any function:**

1. **Declaration (prototype):** Tells the compiler "this function exists, here is its
   signature." Placed near the top of the file so functions can call each other
   regardless of order.

   ```cpp
   void drawGrid(int width, int height);   // declaration — ends with semicolon
   ```

2. **Definition (implementation):** The actual code. Can appear anywhere in the file
   after the declaration.

   ```cpp
   void drawGrid(int width, int height) {   // definition — no semicolon, has a body
       for (int row = 0; ...) { ... }
   }
   ```

3. **Call:** Using the function. Execution jumps to the function's body.
   ```cpp
   drawGrid(10, 4);   // call — passes 10 for width, 4 for height
   ```

**`void` return type:** A function that returns nothing is declared with `void`. It
performs an action (like drawing) but does not produce a value.

**The call stack — how function calls work in memory:**

The **call stack** is a region of RAM where the program tracks all currently active
function calls. When you call `drawGrid(10, 4)`, the program:
1. Pushes a **stack frame** onto the call stack — a block of memory holding `width = 10`,
   `height = 4`, and a return address (where to go when done)
2. Executes the function body
3. Pops the stack frame — that memory is released
4. Jumps to the return address — back to where the call was made

**Canonical example — call stack with three functions:**
```
main() calls drawGrid()
  drawGrid() calls isTileWall()
    isTileWall() finishes → returns to drawGrid()
  drawGrid() finishes → returns to main()
main() continues
```

**Watch for:** If a function calls itself in a chain that never ends (infinite recursion),
the call stack fills up completely — a **stack overflow** crash. You will learn
intentional recursion (which terminates) in LAB 10.

---

## Step 1 — Extract the First Function

Restructure `main.cpp`. First, add a declaration above `main`. Then move the grid
drawing code into the function definition (which goes above `main` too):

```cpp
#include <iostream>

const int TOTAL_FLOORS = 5;
const int MIN_SIZE     = 2;
const int MAX_WIDTH    = 20;
const int MAX_HEIGHT   = 10;

// ── Function Declarations ────────────────────────────────────────────────────
void drawGrid(int width, int height);   // ← add: tells compiler this function exists

// ── Function Definitions ─────────────────────────────────────────────────────
void drawGrid(int width, int height) {  // ← add: the implementation
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

// ── Main ─────────────────────────────────────────────────────────────────────
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
    drawGrid(dungeonWidth, dungeonHeight);   // ← one clean call replaces the nested loops

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Identical output to LAB 04. The behavior is unchanged — the
structure of the code changed. The caller (`main`) no longer knows or cares how
the grid is drawn; it just says `drawGrid(...)` and the grid appears.

**Change something:** After `drawGrid(dungeonWidth, dungeonHeight);`, add a second
identical call. Recompile. The grid draws twice with no additional loop code.
Remove the second call.

---

## Part 3 — Parameters and Pass-by-Value

### Concept: Pass-by-Value — Functions Work on Copies

**What it is:** When you call `drawGrid(dungeonWidth, dungeonHeight)`, C++ copies
the values of `dungeonWidth` and `dungeonHeight` into the function's `width` and
`height` parameters. The function works with those copies. Changes to `width` inside
the function do NOT change `dungeonWidth` in `main`.

**The mechanism:** Each function call creates a new stack frame with its own copies
of the parameters. The original variables in the caller are untouched.

**Why this is the default:** It prevents functions from accidentally modifying data
they were only supposed to read. A rendering function should draw, not accidentally
resize the dungeon.

**Demonstration — seeing this clearly:**
```cpp
void attemptChange(int value) {
    value = 999;   // modifies the LOCAL copy, not the original
    std::cout << "Inside: " << value << std::endl;   // prints 999
}

int score = 42;
attemptChange(score);
std::cout << "After: " << score << std::endl;   // still 42 — the copy was changed, not score
```

**Watch for:** This means if you DO want a function to change a variable, you cannot
use a plain parameter — you need a reference (`&`). That is the subject of LAB 09.

---

### Concept: Return Values — Getting Data Back

**What it is:** A function can produce a value and send it back to the caller.
The `return` statement provides this value, and the caller can store or use it.

```
int calculateDamage(int attack, int defense) {
    int damage = attack - defense;   // compute
    if (damage < 0) damage = 0;     // enforce minimum
    return damage;                   // send back to caller
}

int result = calculateDamage(10, 3);   // result = 7
```

**The type before the function name (`int calculateDamage`):** This is the **return
type** — the type of value the function sends back. Must match the type in `return`.
`void` means no value is returned.

---

## Step 2 — Extract the Input Function

Add a function that handles the validated input. This is a function that returns a value:

```cpp
// Add this declaration above main:
int getValidInput(const std::string& prompt, int minValue, int maxValue);

// Add this definition above main:
int getValidInput(const std::string& prompt, int minValue, int maxValue) {
    int value = 0;
    do {
        std::cout << prompt << " (" << minValue << "-" << maxValue << "): ";
        std::cin >> value;
    } while (value < minValue || value > maxValue);
    return value;   // ← send the validated value back to the caller
}
```

**`const std::string& prompt` — two new things:**
1. `std::string` — the standard library string type (covered fully in LAB 07).
   For now: it holds a sequence of text characters.
2. `const std::string&` — a const reference. This lets the function read the string
   without copying it (references avoid copies) while `const` prevents the function
   from modifying it. We cover references in LAB 09 — note this as a preview.

Update `main()` to use the new function:

```cpp
int main() {
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;
    std::cout << std::endl;

    // ← was: two do-while loops with manual cout/cin
    int dungeonWidth  = getValidInput("Enter dungeon width",  MIN_SIZE, MAX_WIDTH);   // ← new
    int dungeonHeight = getValidInput("Enter dungeon height", MIN_SIZE, MAX_HEIGHT);  // ← new

    std::cout << std::endl;
    drawGrid(dungeonWidth, dungeonHeight);

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Identical behavior — but `main()` is now just 6 meaningful lines.
Someone reading `main` sees the whole story at a glance: get width, get height, draw.

**Change something:** Call `getValidInput` a third time to also ask for the number of
floors to generate (1–10). Print "This dungeon has X floors." after the grid. You only
write the validation loop once — `getValidInput` handles it.

---

## Part 4 — Scope

### Concept: Scope — Where a Variable Exists

**What it is:** The **scope** of a variable is the region of code where it can be
seen and used. In C++, a variable's scope begins at its declaration and ends at the
closing `}` of the block it was declared in.

**Block scope:**
```cpp
{
    int treasure = 100;     // 'treasure' is declared here
    std::cout << treasure;  // valid — we are inside the block
}
// treasure does not exist here — accessing it is a compile error
```

**Function scope:** Parameters and variables declared inside a function only exist
while that function is on the call stack. They are created when the function starts
and destroyed when it returns.

**Why this is a feature, not a limitation:** Scope prevents functions from interfering
with each other. The `value` variable inside `getValidInput` cannot clash with a `value`
variable inside `drawGrid` — they are in different scopes. You can name things
naturally without worrying about the entire program's naming.

**Watch for:** Declaring a variable with the same name in an inner block shadows the
outer one. `-Wshadow` (which you can add to `CXXFLAGS`) warns about this. In this
course, never shadow a variable — always use a different name.

---

## 🎯 Challenge: A `printFloors` Function

**You know:** Functions, return values, `for` loops.

**Task:** Write a function `void printFloorList(int totalFloors)` that prints
the list of "Generating floor N of M..." messages from LAB 04.

Call it from `main()` before drawing the grid. The output should be:
```
Generating floor 1 of 5...
Generating floor 2 of 5...
...
```

**Starting code:**
```cpp
void printFloorList(int totalFloors) {
    // implement here
}
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void printFloorList(int totalFloors) {
    for (int currentFloor = 1; currentFloor <= totalFloors; ++currentFloor) {
        std::cout << "Generating floor " << currentFloor
                  << " of " << totalFloors << "..." << std::endl;
    }
}

// In main(), add before drawGrid:
printFloorList(TOTAL_FLOORS);
std::cout << std::endl;
```

**Key insight:** `totalFloors` is a local copy of whatever value is passed in.
The function does not know or care about `TOTAL_FLOORS` — it works with whatever
number the caller provides. This makes the function general-purpose: you could pass
`3`, `10`, or `TOTAL_FLOORS` and it would behave correctly in all cases.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `drawGrid` function | Grid draws identically to LAB 04 output |
| `getValidInput` function | Invalid inputs repeat the prompt; valid inputs accepted |
| Pass-by-value | Add `width = 999;` inside `drawGrid` and verify `dungeonWidth` is unchanged in `main` |
| Return value | `getValidInput` returns an `int` that `main` stores and uses |
| Declarations above `main` | Reordering definitions does not cause "undeclared function" errors |
| `main` readability | `main()` body is < 10 lines and reads like a plain-English description |
| Scope | A variable declared inside `drawGrid` cannot be accessed in `main` |

---

## Quick Check Answers

**1. How many times must you write drawing code without functions?**
Three times — once per location where you need it. If the drawing code is 20 lines,
that is 60 lines total. Every bug fix must be applied to all three copies. Functions
solve this by letting you write the code once and invoke it as many times as needed.
This principle is called **DRY — Don't Repeat Yourself**.

**2. What is `width` in the calling code after `drawGrid` sets it to 99?**
Still the original value — **unchanged**. C++ passes parameters by value (by copy).
`drawGrid` received a copy of `dungeonWidth`; it modified its local copy to 99.
The original `dungeonWidth` variable in `main` is in a completely separate memory
location and was never touched. To allow a function to modify the caller's variable,
you must pass by reference (`&`) — covered in LAB 09.

**3. What is the difference between declaration and definition?**
A **declaration** (prototype) tells the compiler a function's name, parameter types,
and return type — but not its body. It ends with a semicolon. A **definition**
provides the actual code body inside `{ }`. The compiler needs declarations before
a function is called; the linker needs definitions to produce the final executable.
You can have many declarations of the same function but exactly one definition.
