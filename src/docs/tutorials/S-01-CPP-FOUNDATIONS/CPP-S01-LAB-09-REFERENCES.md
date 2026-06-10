# C++ Masterclass — S-01 — LAB 09 — References and Pass-by-Reference

**Prerequisites:** LAB 08. You understand pointers, addresses, and dereferencing.

**What this lab adds:**
- References — an alias for an existing variable
- Why references are safer and cleaner than pointers for most use cases
- Pass-by-reference — the primary way to let functions modify caller's data in modern C++
- `const` references — reading large data cheaply without copying
- When to use a pointer vs a reference — the decision rule
- Updating `getValidInput` and `drawGrid` from LAB 05 to use proper `const` references

**Time:** ~55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In LAB 08, you wrote `void swap(int* a, int* b)` and called it with `swap(&x, &y)`.
>    The caller must explicitly write `&`. Is there a way to write a swap function
>    where the caller just writes `swap(x, y)` — no `&` required?
> 2. Can a reference be `nullptr`? Can a reference be reassigned to refer to a
>    different variable after it is created?
> 3. You have a large `std::string` (say, 10,000 characters). If you pass it to a
>    function as `void print(std::string s)`, how much data gets copied?
>    What is the cost of passing `const std::string& s` instead?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A clean rewrite of the swap function from LAB 08's challenge, plus a fully correct
dungeon map sketcher from LAB 05 — now with proper `const` references everywhere.
The output is unchanged; the code is safer and more efficient:

```
=== References Demo ===

swap(x, y):
  Before: x=10, y=25
  After:  x=25, y=10

=== Dungeon Map Sketcher ===
Enter dungeon width (2-20):  10
Enter dungeon height (2-10): 4

# # # # # # # # # #
# . . . . > . . . #
# . . . . . . . . #
# # # # # # # # # #
```

---

## Part 1 — What a Reference Is

### Concept: References — Aliases for Variables

**What they are:** A reference is another name (an alias) for an existing variable.
After declaring `int& ref = score`, `ref` and `score` refer to the exact same memory
location. They are interchangeable — changing `ref` changes `score` and vice versa.

**The problem before (using pointers for this):**
```cpp
void swap(int* a, int* b) {    // pointer version
    int temp = *a;
    *a = *b;
    *b = temp;
}
swap(&x, &y);   // caller must pass addresses explicitly
```
The caller must know to write `&`. Inside the function, every access requires `*`.
The syntax is noisy and error-prone.

**The solution (references):**
```cpp
void swap(int& a, int& b) {    // reference version
    int temp = a;              // no * needed — reads like a normal variable
    a = b;
    b = temp;
}
swap(x, y);   // caller writes normally — no & needed
```
The compiler handles the address mechanics. The code reads naturally.

**What references hide:** The pointer mechanics. The compiler generates the same
address-passing code under the hood — you just don't see the `*` and `&` noise.
References are syntactic sugar over pointers for the common case where you need
a non-null alias.

**The protected invariants:**
1. A reference must be initialized at declaration — you cannot have an uninitialized reference.
2. A reference cannot be `nullptr` — it always refers to a real variable.
3. A reference cannot be reassigned — `int& ref = a; ref = b` does not make `ref` refer
   to `b`; it copies `b`'s value into `a`.

**Canonical example:**
```cpp
int score = 100;
int& alias = score;   // alias is another name for score — same memory location

alias = 200;          // score is now 200
std::cout << score;   // prints 200
```

**Pointer vs Reference — when to use each:**

| Situation | Use |
|-----------|-----|
| Parameter that must not be null | Reference (`int& x`) |
| Parameter that might be null | Pointer (`int* x`) — check for `nullptr` before use |
| Must be reassignable to point elsewhere | Pointer |
| Most function parameters | Reference |
| OS/hardware interfaces | Pointer (they speak pointers) |
| Return from a function | Usually neither — return by value; return reference only for specific patterns |

**Watch for:** Returning a reference to a local variable is a dangling reference —
the same danger as a dangling pointer. When the function returns, the local variable
is destroyed. The reference now aliases destroyed memory.
```cpp
int& danger() {
    int local = 42;
    return local;   // ERROR: local is destroyed when function returns
}
```

---

## Step 1 — Reference Swap

Start fresh with a `main.cpp` that demonstrates references:

```cpp
#include <iostream>    // std::cout, std::endl

// Declaration: note int& parameters — these are references, not copies
void swapByRef(int& a, int& b);

// Definition
void swapByRef(int& a, int& b) {
    int temp = a;   // reads through reference — no * needed
    a = b;          // writes through reference — no * needed
    b = temp;
}

int main() {
    std::cout << "=== References Demo ===" << std::endl;
    std::cout << std::endl;
    std::cout << "swap(x, y):" << std::endl;

    int x = 10;
    int y = 25;
    std::cout << "  Before: x=" << x << ", y=" << y << std::endl;

    swapByRef(x, y);   // no & needed at the call site — references handle it

    std::cout << "  After:  x=" << x << ", y=" << y << std::endl;

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== References Demo ===

swap(x, y):
  Before: x=10, y=25
  After:  x=25, y=10
```

**Change something:** Change `swapByRef(int& a, int& b)` to `swapByRef(int a, int b)`
(remove the `&`). Recompile. Run. The swap no longer works — `x` and `y` stay the same.
The function received copies. Change the `&` back.

---

## Part 2 — `const` References for Efficiency

### Concept: `const` References — Read-Only Aliasing

**What they are:** `const T&` (a const reference to T) lets a function read a value
via reference (no copy made) while guaranteeing it will not modify the original.

**The performance argument:**
- Passing `std::string s` copies every character of the string into a new variable.
  A 10,000-character string requires a 10,000-byte copy on every function call.
- Passing `const std::string& s` passes only an 8-byte address. The function reads
  the original string directly. No copy.

**The safety guarantee:** `const` ensures the function cannot modify the string through
the reference. This is the caller's assurance that the function is read-only.

```
void print(std::string s)           // copies the whole string — expensive
void print(const std::string& s)    // passes an address — cheap; can't modify
void print(std::string& s)          // passes an address — cheap; CAN modify
```

**Rule of thumb:**
- **Small types** (`int`, `char`, `bool`, `float`) — pass by value. Copying is cheap;
  the overhead of a reference is comparable to the copy.
- **Large types** (`std::string`, `std::vector`, structs) — pass by `const&` when
  the function only reads, `&` when it needs to modify.

**Watch for:** Passing a temporary (literal) to a non-const reference is a compile error:
```cpp
void fill(std::string& s) { ... }
fill("hello");   // ERROR: "hello" is a temporary — can't bind to non-const reference
```
`const std::string&` accepts temporaries. Non-const references do not.

---

## Step 2 — Add the Full Dungeon Sketcher

Add the properly-referenced functions from LAB 05. All functions now use `const&`
where appropriate:

```cpp
#include <iostream>
#include <string>      // std::string

// ── Constants ────────────────────────────────────────────────────────────────
const int MIN_SIZE   =  2;
const int MAX_WIDTH  = 20;
const int MAX_HEIGHT = 10;

// ── Declarations ─────────────────────────────────────────────────────────────
void swapByRef(int& a, int& b);
int  getValidInput(const std::string& prompt, int minValue, int maxValue);
void drawGrid(int width, int height);

// ── Definitions ──────────────────────────────────────────────────────────────
void swapByRef(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

// const std::string& prompt: reads the string without copying it
int getValidInput(const std::string& prompt, int minValue, int maxValue) {
    int value = 0;
    do {
        std::cout << prompt << " (" << minValue << "-" << maxValue << "): ";
        std::cin >> value;
    } while (value < minValue || value > maxValue);
    return value;
}

// width and height are small ints — pass by value is fine
void drawGrid(int width, int height) {
    for (int row = 0; row < height; ++row) {
        for (int col = 0; col < width; ++col) {
            bool isTopRow    = (row == 0);
            bool isBottomRow = (row == height - 1);
            bool isLeftCol   = (col == 0);
            bool isRightCol  = (col == width  - 1);
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
    // (swap demo — same as Step 1)
    std::cout << "=== References Demo ===" << std::endl;
    std::cout << std::endl;
    int x = 10; int y = 25;
    std::cout << "  Before: x=" << x << ", y=" << y << std::endl;
    swapByRef(x, y);
    std::cout << "  After:  x=" << x << ", y=" << y << std::endl;

    std::cout << std::endl;
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;

    int w = getValidInput("Enter dungeon width",  MIN_SIZE, MAX_WIDTH);
    int h = getValidInput("Enter dungeon height", MIN_SIZE, MAX_HEIGHT);

    std::cout << std::endl;
    drawGrid(w, h);

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Swap demo, then the dungeon input prompts, then the grid.

**Verify `const&`:** Try adding `prompt = "changed";` inside `getValidInput`.
Recompile. You get: `error: assignment of read-only reference 'prompt'`. The `const`
in `const std::string&` prevents any modification inside the function. Remove that
line.

---

## 🎯 Challenge: Reference-Based Score Update

**You know:** References and pass-by-reference.

**Task:** Write a function `void applyDamage(int& currentHP, int damage, int& totalDamageTaken)`
that:
1. Subtracts `damage` from `currentHP` (never below 0)
2. Adds the actual damage dealt to `totalDamageTaken`

Call it three times with different damage values and print the results.

```cpp
int hp              = 100;
int totalDamage     = 0;
applyDamage(hp, 30, totalDamage);   // hp → 70,  totalDamage → 30
applyDamage(hp, 20, totalDamage);   // hp → 50,  totalDamage → 50
applyDamage(hp, 80, totalDamage);   // hp → 0,   totalDamage → 130 (only 50 actual damage)
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void applyDamage(int& currentHP, int damage, int& totalDamageTaken) {
    int actualDamage = damage;
    if (actualDamage > currentHP) actualDamage = currentHP;   // cap at remaining HP

    currentHP        -= actualDamage;   // modify original via reference
    totalDamageTaken += actualDamage;   // modify original via reference
}
```

**Key insight:** Both `currentHP` and `totalDamageTaken` are modified in-place via
references. `damage` is passed by value — the function only reads it. This pattern
(some parameters by reference to modify, some by value to read) is the standard
way C++ functions update multiple outputs without using return values. In the RPG
engine (S-09), this becomes the combat resolution system.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Reference swap | `swapByRef(x, y)` exchanges x and y — no & at call site |
| Value swap fails | Removing `&` from parameters leaves x and y unchanged |
| `const std::string&` | Adding `prompt = "x"` inside `getValidInput` causes a compile error |
| No copy on large types | `getValidInput` accepts a string without copying its contents |
| Grid draws correctly | 10×4 grid shows walls, floor tiles, and staircase |
| `applyDamage` | HP and total damage update in the caller after each call |

---

## Quick Check Answers

**1. Can you write `swap(x, y)` without requiring `&` at the call site?**
Yes — using references (`int& a, int& b`). The compiler generates the address-passing
code automatically. The caller writes `swap(x, y)` naturally. This is one of the
primary ergonomic advantages of references over raw pointers: the call site is clean.

**2. Can a reference be `nullptr`? Can it be reassigned?**
No to both. A reference must be bound to a real variable at declaration and cannot
be null. After `int& ref = a;`, writing `ref = b` copies `b`'s value into `a` —
it does not rebind `ref` to point to `b`. This is fundamentally different from a
pointer, which can be null and can be pointed at different objects. References are
simpler precisely because they cannot do these things.

**3. Cost of `std::string s` vs `const std::string& s`?**
`std::string s` copies every byte of the string. A 10,000-character string requires
allocating ~10,000 bytes, copying all of them, and deallocating when the function
returns — three heap operations plus the copy. `const std::string& s` passes exactly
8 bytes (the size of a pointer on 64-bit systems) — no allocation, no copy, no
deallocation. For frequently-called functions with large strings, this difference
is measurable in real programs.
