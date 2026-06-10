# C++ Masterclass — S-01 — LAB 03 — Conditionals and Boolean Logic

**Prerequisites:** LAB 02. You know all arithmetic operators and modulo.

**What this lab adds:**
- Boolean logic — the foundation of every decision a program makes
- The `if / else if / else` chain — the primary branching tool
- Comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`)
- Logical operators (`&&`, `||`, `!`) — combining conditions
- Short-circuit evaluation — a performance feature with a safety consequence
- The `switch` statement — a specialized branch for discrete values
- A practical project: a dungeon room descriptor that prints different text based on floor number

**Time:** ~60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In everyday English, "AND" and "OR" have intuitive meanings.
>    In programming, `true && false` evaluates to what?
>    And `true || false` evaluates to what?
> 2. What is the difference between `=` and `==` in C++?
>    (This is the single most common beginner bug in the language.)
> 3. Predict: If you write `if (floor >= 3 && floor <= 5)`, what range of
>    values for `floor` make this condition true?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **dungeon room descriptor** — the program reads a floor number and prints a
description of what the player finds there. This is the exact kind of logic that
will power the RPG's room generation in Series 09:

```
=== Dungeon Room Descriptor ===

Enter floor number (1-5): 1
Floor 1: A dimly lit entrance chamber. Dust motes drift in stale air.

Enter floor number (1-5): 3
Floor 3: Ancient ruins, walls covered in faded runes.

Enter floor number (1-5): 5
Floor 5: The Dragon's Lair. You feel heat radiating from the walls.

Enter floor number (1-5): 7
Floor 7: Invalid floor. The dungeon only has 5 levels.
```

---

## Part 1 — Boolean Logic

### Math: Boolean Logic — The Algebra of True and False

**What it computes:** Boolean logic (named after mathematician George Boole) is a
mathematical system with only two values — `true` and `false` — and three operations:
AND, OR, and NOT. Every conditional in every program is ultimately a combination of
these three operations.

**The real-world analogy:** An electrical circuit.
- `AND` = two switches in series: the light turns on only if BOTH switches are on
- `OR` = two switches in parallel: the light turns on if EITHER switch is on (or both)
- `NOT` = an inverter: flips on to off and off to on

**Truth tables** — all possible inputs and their outputs:

```
AND (&&): true only when BOTH sides are true
  false && false = false
  false && true  = false
  true  && false = false
  true  && true  = true

OR (||): true when AT LEAST ONE side is true
  false || false = false
  false || true  = true
  true  || false = true
  true  || true  = true

NOT (!): flips the value
  !false = true
  !true  = false
```

**The `bool` type** (introduced in LAB 01): A `bool` variable stores exactly one
boolean value: `true` (stored as 1) or `false` (stored as 0). Comparison operators
produce a `bool` result.

**Why this matters here:** Every `if` statement evaluates a condition to `true` or
`false`. Understanding `&&`, `||`, and `!` lets you write precise conditions like
"floor is between 3 and 5" (`floor >= 3 && floor <= 5`) rather than chaining multiple
`if` statements.

---

### Concept: Comparison Operators — Producing Boolean Results

**What they are:** Six operators that compare two values and produce `true` or `false`.

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| `==` | Equal to | `5 == 5` | `true` |
| `!=` | Not equal to | `5 != 3` | `true` |
| `<`  | Less than | `3 < 5` | `true` |
| `>`  | Greater than | `5 > 3` | `true` |
| `<=` | Less than or equal | `5 <= 5` | `true` |
| `>=` | Greater than or equal | `4 >= 5` | `false` |

**`=` vs `==` — the critical distinction:**
- `=` is the **assignment operator** — it stores a value into a variable. `score = 10;`
- `==` is the **equality comparison operator** — it checks if two values are equal. `score == 10`

Writing `if (score = 10)` instead of `if (score == 10)` assigns `10` to `score` and
then evaluates the condition as the value `10`, which is non-zero, so it is always true.
The program compiles without error and runs incorrectly. This bug has existed since
C was invented in the 1970s and still appears in code today.

**Watch for:** `-Wall` (which you have in your Makefile) will produce a warning
for `if (score = 10)`: `warning: suggest parentheses around assignment used as truth value`.
Always investigate compiler warnings.

---

## Step 1 — Read a Floor Number

Update `main.cpp` from LAB 02. Replace its contents with a fresh starting point —
we are building a new program. This is the last time we replace the whole file;
after this, all changes are incremental additions.

```cpp
#include <iostream>    // std::cout, std::cin, std::endl

const int TOTAL_FLOORS = 5;   // total floors in the dungeon — named constant, not a magic number

int main() {
    std::cout << "=== Dungeon Room Descriptor ===" << std::endl;
    std::cout << std::endl;

    int floor = 0;   // the floor the player wants to inspect — 0 means "not yet entered"

    std::cout << "Enter floor number (1-" << TOTAL_FLOORS << "): ";
    std::cin >> floor;   // std::cin reads one value from the keyboard and stores it in 'floor'
    std::cout << "Floor " << floor << ": ";   // will be followed by the description

    return 0;
}
```

**`std::cin >> floor` explained:** `std::cin` (character input) is the input stream —
the counterpart to `std::cout`. The `>>` operator (stream extraction) reads a value from
the keyboard and stores it in the variable on the right. Execution pauses here until
the user types a value and presses Enter. If the user types something that cannot be
converted to `int` (like letters), `std::cin` enters an error state — we handle that
in LAB 13.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** The prompt `Enter floor number (1-5): ` and the cursor waiting.
Type `3` and press Enter.

**You should see:** `Floor 3: ` with a space — no description yet. We add that next.

---

## Part 2 — Branching with `if`

### Concept: `if / else if / else` — Conditional Execution

**What it is:** A branching construct that runs different code depending on whether
a condition evaluates to `true`. It has three parts — all optional except the `if`:

```cpp
if (condition_A) {
    // runs when condition_A is true
} else if (condition_B) {
    // runs when condition_A was false AND condition_B is true
} else {
    // runs when ALL previous conditions were false
}
```

**The critical rule:** Once one condition is `true` and its block runs, the rest of
the chain is skipped entirely. The chain evaluates top to bottom and stops at the
first match. Order matters.

**What it hides:** Assembly jump instructions (`JMP`, `JNE`, `JE`). In machine code,
"if" is implemented by evaluating the condition and jumping to a different memory
address if the result is 0. The `if` statement is an abstraction over raw jumps.

**The protected invariant:** Exactly one branch executes per chain. You cannot have two
branches run from the same `if / else if / else` structure — the `else if` and `else`
guarantee mutual exclusivity.

**Canonical example:** A traffic light controller:
```cpp
if (light == "green") {
    drive();
} else if (light == "yellow") {
    slow_down();
} else {          // catches red and any unexpected value
    stop();
}
```
The conditions are mutually exclusive and cover all cases.

**Watch for:** Missing `else` can cause subtle bugs. If all conditions are false and
there is no `else`, the program silently does nothing. For inputs you control, this
might be fine. For user input (like floor numbers), always have an `else` that handles
invalid inputs.

---

## Step 2 — Add the First Branch

Add `if / else` immediately after the `std::cin >> floor;` line:

```cpp
    std::cin >> floor;

    if (floor == 1) {                                              // ← add
        std::cout << "A dimly lit entrance chamber. "             // ← add
                  << "Dust motes drift in stale air."             // ← add
                  << std::endl;                                    // ← add
    } else {                                                       // ← add
        std::cout << "(description coming...)" << std::endl;      // ← add
    }                                                              // ← add
```

### SAVE AND TRY

```
make
.\dungeon
```

Type `1` at the prompt. **You should see:**
```
Floor 1: A dimly lit entrance chamber. Dust motes drift in stale air.
```

Type `3` at the prompt. **You should see:**
```
Floor 3: (description coming...)
```

**Change something:** Change the `== 1` check to `== 2`. Type `1` — now floor 1 shows
"(description coming...)". Type `2` — floor 2 shows the chamber text. Change back to `== 1`.

---

## Step 3 — Add All Five Floors

Extend the chain. Each new `else if` is marked — the existing lines are shown for context:

```cpp
    if (floor == 1) {
        std::cout << "A dimly lit entrance chamber. Dust motes drift in stale air." << std::endl;
    } else if (floor == 2) {                                                       // ← add
        std::cout << "A flooded passage. Water drips from the ceiling." << std::endl; // ← add
    } else if (floor == 3) {                                                       // ← add
        std::cout << "Ancient ruins, walls covered in faded runes." << std::endl; // ← add
    } else if (floor == 4) {                                                       // ← add
        std::cout << "A vast cavern, filled with the glow of bioluminescent fungi." << std::endl; // ← add
    } else if (floor == 5) {                                                       // ← add
        std::cout << "The Dragon's Lair. You feel heat radiating from the walls." << std::endl; // ← add
    } else {                                                                       // ← was: else
        std::cout << "Floor " << floor << " does not exist. "                     // ← add
                  << "The dungeon only has " << TOTAL_FLOORS << " levels." << std::endl; // ← add
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Each floor number (1–5) produces its own description. Entering
`7` triggers the `else` branch.

---

## Part 3 — Combining Conditions

### Concept: Short-Circuit Evaluation — `&&` and `||` Stop Early

**What it is:** When evaluating `A && B`, if `A` is `false`, C++ does not evaluate `B`
at all — the result must be `false` regardless. Similarly, for `A || B`, if `A` is
`true`, C++ does not evaluate `B`.

**Why this is a feature:** It allows safety checks before potentially dangerous
operations:
```cpp
if (index >= 0 && array[index] == target) { ... }
```
If `index` is negative (invalid), the first condition fails and `array[index]` is
never evaluated — avoiding an out-of-bounds read crash.

**Why this is a hazard:** If `B` has a side effect (modifies a variable, increments
a counter, opens a file), that side effect will not happen when `A` short-circuits.
Code that relies on `B` always executing is a bug waiting to happen.

**The rule:** Keep conditions in `if` statements free of side effects. Use
conditions only to read and test values — use separate statements to modify state.

**Watch for:** `if (A || B)` where B must always run even when A is true. Short-circuit
means B will not run in that case. If B matters, evaluate it before the `if`.

---

## Step 4 — A Multi-Condition Check

Add a bonus section after the `if / else if / else` chain:

```cpp
    // Separate block to demonstrate logical operators
    std::cout << std::endl;

    bool isDangerous = (floor >= 3);      // ← floors 3, 4, 5 are dangerous
    bool isBossFloor = (floor == TOTAL_FLOORS);   // ← only floor 5 is the boss

    if (isDangerous && !isBossFloor) {            // ← dangerous but not the final boss
        std::cout << "Warning: This floor is dangerous. Proceed with caution." << std::endl;
    } else if (isBossFloor) {                     // ← the boss floor
        std::cout << "Warning: The Dragon awaits. This is your final challenge." << std::endl;
    } else {                                      // ← safe floors (1 or 2)
        std::cout << "This floor is relatively safe." << std::endl;
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**Test each floor:** Floors 1 and 2 print "safe." Floors 3 and 4 print "dangerous."
Floor 5 prints the boss warning.

**Change something:** Change `floor >= 3` to `floor >= 2`. Now floor 2 is also
dangerous. See how compound conditions let you describe ranges precisely. Change back.

---

## Part 4 — The `switch` Statement

### Concept: `switch` — Dispatching on a Discrete Value

**What it is:** A branch structure optimized for checking one variable against
multiple specific values. Where `if / else if` evaluates conditions top-to-bottom
(potentially checking many conditions before finding a match), a well-compiled
`switch` can jump directly to the right case.

**The structure:**
```cpp
switch (variable) {
    case VALUE_A:
        // code for VALUE_A
        break;   // ← REQUIRED: stops execution from falling into the next case
    case VALUE_B:
        // code for VALUE_B
        break;
    default:
        // runs if no case matched
        break;
}
```

**`break` is mandatory:** Without `break`, execution "falls through" to the next `case`
and runs its code too. Fallthrough is occasionally useful (multiple values sharing one
handler) but is the source of many bugs. Always add `break` unless you explicitly need
fallthrough, and add a comment when you do.

**When to use `switch` vs `if / else if`:**
- Use `switch` when comparing one variable against specific discrete values (enums,
  small integers, characters)
- Use `if / else if` for ranges (`floor >= 3`), multiple variables, or non-integer types

**Watch for:** `switch` in C++ only works with integer types and `enum` values — not
with `float`, `double`, or `std::string`.

---

## Step 5 — Refactor with `switch`

The floor description logic is a perfect candidate for `switch`. Replace the
`if / else if / else` chain (not the boolean section below it) with this:

```cpp
    switch (floor) {                        // ← was: if (floor == 1) ...
        case 1:
            std::cout << "A dimly lit entrance chamber. Dust motes drift in stale air." << std::endl;
            break;
        case 2:
            std::cout << "A flooded passage. Water drips from the ceiling." << std::endl;
            break;
        case 3:
            std::cout << "Ancient ruins, walls covered in faded runes." << std::endl;
            break;
        case 4:
            std::cout << "A vast cavern, filled with the glow of bioluminescent fungi." << std::endl;
            break;
        case 5:
            std::cout << "The Dragon's Lair. You feel heat radiating from the walls." << std::endl;
            break;
        default:
            std::cout << "Floor " << floor << " does not exist. "
                      << "The dungeon only has " << TOTAL_FLOORS << " levels." << std::endl;
            break;
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Identical behavior to the `if / else if` version. The code is
cleaner for this use case — each floor's description is equally prominent instead of
being nested inside cascading `else if` branches.

---

## 🎯 Challenge: Grade Calculator

**You know:** `if / else if / else`, comparison operators, logical operators.

**Task:** Write a program that reads a numeric score (0–100) and prints the
letter grade according to this scale:
- 90–100: A
- 80–89: B
- 70–79: C
- 60–69: D
- 0–59: F
- Anything else: "Invalid score"

**Starting code:**
```cpp
int score = 0;
std::cout << "Enter score (0-100): ";
std::cin >> score;
// Add your if/else if/else chain here
```

**Hint:** Use `score >= 90` for the A range. You only need to check the lower bound
of each range because `else if` guarantees the upper bound was already tested.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
int score = 0;
std::cout << "Enter score (0-100): ";
std::cin >> score;

if (score > 100 || score < 0) {
    std::cout << "Invalid score. Must be between 0 and 100." << std::endl;
} else if (score >= 90) {
    std::cout << "Grade: A" << std::endl;
} else if (score >= 80) {
    std::cout << "Grade: B" << std::endl;
} else if (score >= 70) {
    std::cout << "Grade: C" << std::endl;
} else if (score >= 60) {
    std::cout << "Grade: D" << std::endl;
} else {
    std::cout << "Grade: F" << std::endl;
}
```

**Key insight:** The `else if` chain implicitly provides an upper bound. The `>= 80`
check for B does not need `&& score < 90` because the `>= 90` check for A already
ran and failed. The chain guarantees: "if we reach this line, all previous conditions
were false." Order from highest to lowest enables this elegant shorthand.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `std::cin` reads input | Program waits for keyboard input and stores it |
| `if` branch | Floor 1 shows the entrance chamber text |
| `else if` chain | Each floor 1–5 shows a unique description |
| `else` fallback | Floor 7 shows the invalid message with the actual floor number |
| `&&` condition | Floors 3–4 show "dangerous"; floor 5 shows boss warning |
| `!` negation | `!isBossFloor` correctly excludes floor 5 from the "dangerous" message |
| `switch` | Behavior identical to the original `if/else if` version |
| Named constants | `TOTAL_FLOORS` used in output — changing it updates all references |

---

## Quick Check Answers

**1. What is `true && false`? What is `true || false`?**
`true && false = false` — AND requires both sides to be true. `true || false = true` —
OR requires only one side to be true. These match the Boolean logic truth tables. In
C++ code: `(5 > 3) && (2 > 4)` evaluates to `true && false = false`.

**2. What is the difference between `=` and `==`?**
`=` is assignment — it stores a value: `score = 10` puts 10 into `score`.
`==` is comparison — it checks equality: `score == 10` evaluates to `true` or `false`.
Writing `if (score = 10)` accidentally assigns 10 to `score` and then evaluates `10`
as the condition (always true, because 10 is non-zero). This is a compile-time-silent,
runtime-incorrect bug. The compiler warns about it with `-Wall`, which is why that flag
is in your Makefile.

**3. What range makes `floor >= 3 && floor <= 5` true?**
Exactly the integers 3, 4, and 5. The condition reads: "floor is at least 3 AND floor
is no more than 5." This is the standard pattern for range checks in C++. Any value
below 3 fails the `>= 3` part; any value above 5 fails the `<= 5` part; 3, 4, and 5
satisfy both simultaneously.
