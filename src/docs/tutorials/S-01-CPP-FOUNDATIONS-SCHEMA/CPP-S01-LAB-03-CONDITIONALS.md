# Lesson 3: A Branch Is a Promise That Only One Path Runs
### (LAB 03 — Conditionals and Boolean Logic)

**What you will build:** A dungeon room descriptor — a program that reads a floor number from the keyboard and prints a different description for each one, refined twice: once with `if`/`else if`/`else`, once with logical operators layered on top for a danger assessment, and once more as an equivalent `switch`. The transferable problem: every decision a program makes reduces to `true` or `false`, and the tools in this lesson — comparisons, `&&`/`||`/`!`, `if` chains, `switch` — are different ways of asking and combining that same yes/no question.

**What you need to know first:** LAB-02 — arithmetic and comparison-adjacent operators, `const`. LAB-01's `bool` type. LAB-00's `std::cout` and compiling with `make`.

**Terms introduced in this lesson**

> **`std::cin`** — the standard input stream; the counterpart to `std::cout`, reading from the keyboard.
> **Stream extraction operator (`>>`)** — reads a value from an input stream into a variable.
> **Comparison operator** — an operator (`==`, `!=`, `<`, `>`, `<=`, `>=`) that evaluates two operands to a `bool`.
> **Boolean logic** — a system with two values (`true`/`false`) and three operations (AND, OR, NOT) for combining them.
> **Logical AND (`&&`), OR (`||`), NOT (`!`)** — operators combining or inverting `bool` values.
> **Short-circuit evaluation** — evaluating only as much of a logical expression as is needed to determine its result, skipping the rest.
> **`if` / `else if` / `else`** — a branching construct running exactly one of several blocks, based on which condition (if any) is true first.
> **`switch` / `case` / `break` / `default`** — a branching construct dispatching on one variable's exact value.
> **Fallthrough** — a `switch` case with no `break`, causing execution to continue into the next case's code.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: `std::cin` — Reading a Value From the Keyboard

### The Problem

Every program so far has printed fixed values baked into the source code. A dungeon room descriptor needs to react to something the *user* provides at runtime — the floor number to describe — which means reading a value that doesn't exist until the program is already running.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `#include <iostream>` (LAB-00) — `std::cin` is declared there alongside `std::cout`.

### The New Code

```cpp
int floor = 0;

std::cout << "Enter floor number (1-" << TOTAL_FLOORS << "): ";
std::cin >> floor;
std::cout << "Floor " << floor << ": ";
```

### The Updated Project

```cpp
#include <iostream>

const int TOTAL_FLOORS = 5;   // ← new — named per LAB-02 Concept Unit 5's rule against magic numbers

int main() {
    std::cout << "=== Dungeon Room Descriptor ===" << std::endl;
    std::cout << std::endl;

    int floor = 0;                                                     // ← new

    std::cout << "Enter floor number (1-" << TOTAL_FLOORS << "): ";     // ← new
    std::cin >> floor;                                                  // ← new
    std::cout << "Floor " << floor << ": ";                             // ← new

    return 0;
}
```

### Concept Lab

Isolation would only reproduce this exact code with different variable names — `std::cin >> floor` already is the smallest possible demonstration, and it's also literally the real project code. Run it directly, verified this session, with input piped in to stand in for typing at a real keyboard:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ echo "3" | ./dungeon.exe
Enter floor number (1-5): Floor 3:
```

What that proves: `std::cin >> floor` paused conceptually at that line until a value (`3`, supplied here via the piped `echo`) was available, converted the text `"3"` into the integer `3`, stored it in `floor`, and the very next line's `std::cout << floor` printed that same `3` back — confirming the value genuinely moved from outside the program into `floor`.

### Mechanical Walkthrough

- `std::cin` — **(a) first appearance.** The standard input stream, declared in `<iostream>` alongside `std::cout` — its source is the keyboard (or, as verified above, anything piped into the program's standard input).
- `>>` — **(a) first appearance.** The **stream extraction operator** — reads a value out of the stream on its left and stores it in the variable on its right. This is the mirror image of `<<` (LAB-00): `<<` sends a value *into* a stream; `>>` pulls a value *out of* one.

### CS Lens

`std::cin` and `std::cout` are two directions of the same **stream abstraction** (LAB-00 Concept Unit 8) — one reads a sequence of characters, one writes one. This input/output symmetry recurs everywhere: file streams (`CPP-S02-LAB-18`) read and write with the same `>>`/`<<` pair, and network sockets follow the identical shape at a much larger scale.

### SE Lens

Reading input as text and converting it to `int` via `>>`, rather than requiring the program to know in advance exactly how many characters the user will type, is what lets a five-digit floor number and a one-digit floor number both work through the same line of code — the conversion, not a fixed-width read, is doing the real work.

### Watch for

If the user types something `>>` cannot convert to `int` (letters, for instance), `std::cin` enters an error state rather than crashing — `floor` is left unchanged (or zero-initialized, depending on context) and every subsequent `std::cin >>` silently does nothing until the error state is cleared. This lesson does not yet handle that case; LAB-13 (Error Handling) covers it directly.

### Connection

`floor` now holds a real, user-supplied value — every remaining Concept Unit in this lesson is about deciding what to do with it.

---

## Concept Unit 2: Comparison Operators

### The Problem

`floor` holds a number, but nothing yet asks a question about it — "is this floor 1?", "is this floor at least 3?" — the kind of yes/no question a branch (Concept Unit 4) needs an answer to before it can decide anything.

### No isolated code lab for this step

The six operators below are demonstrated together, standalone, since none of them individually needs a longer example.

### Concept Lab

```cpp
// scratch_compare.cpp  (disposable)
#include <iostream>
int main() {
    std::cout << (5 == 5) << " " << (5 != 3) << " " << (3 < 5) << " "
              << (5 > 3) << " " << (5 <= 5) << " " << (4 >= 5) << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_compare.cpp -o scratch_compare -std=c++17 -Wall -Wextra
$ ./scratch_compare.exe
1 1 1 1 1 0
```

What that proves: each comparison produces a `bool` (LAB-01), printed by `std::cout`'s default `1`/`0` convention (LAB-01 Concept Unit 7) — five true results, and one false (`4 >= 5`). This is the complete set: `==` (equal), `!=` (not equal), `<`, `>`, `<=`, `>=`, each comparing its two operands and evaluating to exactly one of `true` or `false`, never anything else.

This scratch file is discarded now; the real project's first comparison, `floor == 1`, appears in Concept Unit 4.

### Mechanical Walkthrough

- `==`, `!=`, `<`, `>`, `<=`, `>=` — **(a) first appearance, all six.** Binary operators, each producing a `bool` result from two operands of a comparable type.

### CS Lens

A comparison operator is a **predicate** — a function (here, built into the language as an operator) that answers a yes/no question about its inputs. Every `if` condition, every loop condition (LAB-04), and every sort's ordering rule (`CPP-S02-LAB-15`) is ultimately built from predicates like these.

### SE Lens

Six distinct comparison operators, rather than one generic "compare" that returns an ordering, exist because most conditions in real code ask a specific yes/no question ("is this the boss floor?") rather than needing a three-way ordering ("is A before, equal to, or after B?") — the specific operators read closer to the English question being asked.

### Watch for

`==` and `=` are visually one character apart and mean entirely different things — `=` assigns, `==` compares. This exact confusion was already caught by the compiler in LAB-02 Concept Unit 6's `-Wparentheses` warning; it reappears here because conditionals are precisely where this mistake does the most damage; see Concept Unit 4's Watch for.

### Connection

`floor == 1`, next, is this unit's `==` applied to the real variable this lesson is built around.

---

## Concept Unit 3: Boolean Logic — `&&`, `||`, `!`

### The Problem

A single comparison like `floor == 1` can only ask about one exact value at a time. "Is this floor dangerous *and* not the boss floor?" needs a way to combine two separate yes/no answers into one.

### No isolated code lab for this step

The truth tables below are demonstrated directly — small enough that a separate throwaway program would just restate them in code form with no added clarity.

### Explanation

Boolean logic (named for mathematician George Boole) works with exactly two values and three combining operations:

```
AND (&&): true only when BOTH sides are true
  false && false = false      OR (||): true when AT LEAST ONE side is true
  false && true  = false        false || false = false
  true  && false = false        false || true  = true
  true  && true  = true         true  || false = true
                                 true  || true  = true

NOT (!): flips the value
  !false = true
  !true  = false
```

An electrical analogy makes the shape concrete: `&&` is two switches wired in series — the circuit completes (the light turns on) only if *both* switches are closed; `||` is two switches wired in parallel — the circuit completes if *either* switch is closed; `!` is an inverter, swapping on for off.

### Mechanical Walkthrough

- `&&` — **(a) first appearance.** Logical AND — combines two `bool` expressions; the whole expression is `true` only when both sides are.
- `||` — **(a) first appearance.** Logical OR — `true` when at least one side is.
- `!` — **(a) first appearance.** Logical NOT — a **unary** operator (acts on one operand, unlike every operator so far in this curriculum, all of which took two) — inverts a single `bool`.

### CS Lens

These three operations — AND, OR, NOT — are functionally complete: every possible boolean function of any number of inputs can be built from some combination of just these three (this is exactly what digital logic gates in real CPU hardware are built from, at the transistor level — the electrical analogy above is not just a teaching device, it is literally how this logic is physically implemented).

### SE Lens

Expressing "dangerous but not the boss floor" as `isDangerous && !isBossFloor` (Concept Unit 6) reads close to the English sentence it represents — the alternative, nested `if` statements checking one condition at a time, would express the identical logic with more code and a less direct mapping to the English description of the rule.

### Connection

Concept Unit 6 combines `&&` and `!` for real, on `floor`-derived values — first, Concept Unit 4 needs the branching construct these boolean expressions feed into.

---

## Concept Unit 4: `if` / `else if` / `else`

### The Problem

`floor` holds a value and Concept Units 2–3 can now ask questions about it — but nothing yet *acts* on the answer. The program needs to run different code depending on which question comes back true.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Immediately after `std::cin >> floor;` and its print line.
- **Dependencies:** `floor` (Concept Unit 1), `==` (Concept Unit 2).

### The New Code

```cpp
if (floor == 1) {
    std::cout << "A dimly lit entrance chamber. Dust motes drift in stale air." << std::endl;
} else if (floor == 2) {
    std::cout << "A flooded passage. Water drips from the ceiling." << std::endl;
} else if (floor == 3) {
    std::cout << "Ancient ruins, walls covered in faded runes." << std::endl;
} else if (floor == 4) {
    std::cout << "A vast cavern, filled with the glow of bioluminescent fungi." << std::endl;
} else if (floor == 5) {
    std::cout << "The Dragon's Lair. You feel heat radiating from the walls." << std::endl;
} else {
    std::cout << "Floor " << floor << " does not exist. "
              << "The dungeon only has " << TOTAL_FLOORS << " levels." << std::endl;
}
```

### The Updated Project

```cpp
    std::cout << "Enter floor number (1-" << TOTAL_FLOORS << "): ";
    std::cin >> floor;
    std::cout << "Floor " << floor << ": ";

    if (floor == 1) {                                                                    // ← new
        std::cout << "A dimly lit entrance chamber. Dust motes drift in stale air." << std::endl;
    } else if (floor == 2) {                                                              // ← new
        std::cout << "A flooded passage. Water drips from the ceiling." << std::endl;
    } else if (floor == 3) {                                                              // ← new
        std::cout << "Ancient ruins, walls covered in faded runes." << std::endl;
    } else if (floor == 4) {                                                              // ← new
        std::cout << "A vast cavern, filled with the glow of bioluminescent fungi." << std::endl;
    } else if (floor == 5) {                                                              // ← new
        std::cout << "The Dragon's Lair. You feel heat radiating from the walls." << std::endl;
    } else {                                                                              // ← new
        std::cout << "Floor " << floor << " does not exist. "
                  << "The dungeon only has " << TOTAL_FLOORS << " levels." << std::endl;
    }

    return 0;
```

### Concept Lab

Building it up in two stages makes the "top to bottom, first match wins, rest skipped" rule visible before the full five-floor chain arrives. First, one branch only, verified this session:

```
$ echo "1" | ./dungeon.exe
Enter floor number (1-5): Floor 1: A dimly lit entrance chamber. Dust motes drift in stale air.
```

Then the full six-way chain (five floors plus `else`), verified this session for every case:

```
$ for f in 1 2 3 4 5 7; do echo "--- floor $f ---"; echo "$f" | ./dungeon.exe; done
--- floor 1 ---
Floor 1: A dimly lit entrance chamber. Dust motes drift in stale air.
--- floor 2 ---
Floor 2: A flooded passage. Water drips from the ceiling.
--- floor 3 ---
Floor 3: Ancient ruins, walls covered in faded runes.
--- floor 4 ---
Floor 4: A vast cavern, filled with the glow of bioluminescent fungi.
--- floor 5 ---
Floor 5: The Dragon's Lair. You feel heat radiating from the walls.
--- floor 7 ---
Floor 7: Floor 7 does not exist. The dungeon only has 5 levels.
```

What that proves: exactly one branch ran per input, and the chain evaluated top to bottom, stopping at the first true condition — `floor == 3` never got a chance to run for input `1`, because `floor == 1` already matched and the rest of the chain was skipped entirely, not merely "also checked and found false."

### Mechanical Walkthrough

- `if (floor == 1)` — **(a) first appearance.** Runs the following block only if the parenthesized condition is `true`.
- `else if (floor == 2)` — **(a) first appearance.** Checked only if every prior condition in the chain was `false`; if this one is `true`, its block runs and every condition after it is skipped.
- `else` — **(a) first appearance.** Runs only if every condition above it, throughout the whole chain, was `false` — has no condition of its own; it is the catch-all.

### CS Lens

Underneath the abstraction, `if`/`else if`/`else` compiles to conditional jump instructions (`JE`/`JNE` and similar, on x86) — evaluate the condition, and jump to a different point in the compiled machine code depending on the result. The C++ syntax is a readable abstraction over exactly the same raw jumps every branch in every language ultimately becomes.

### SE Lens

The chain guarantees mutual exclusivity — exactly one block runs, never zero-if-`else`-is-present and never more than one — which is what makes "each floor gets its own independent description" a safe assumption for a reader of this code, without needing to trace every possible input by hand to confirm no two blocks could both fire for the same `floor`.

### Watch for

A chain with no final `else` silently does nothing when every condition is false — for input a program doesn't control (like this floor number, typed by a user), an unhandled case should almost always have an explicit fallback, which is exactly why this lesson's chain ends in `else` rather than stopping after `floor == 5`.

### Connection

`floor` now produces a real per-floor description — Concept Unit 6 adds a second, independent judgment (danger level) layered on top of the same `floor` value, using the logical operators from Concept Unit 3.

---

## Concept Unit 5: `=` vs. `==` Inside a Condition — A Hard Concept, Reappearing

This is the same danger LAB-02 Concept Unit 6 already proved with a real compiler warning — restated here because a conditional is precisely where this specific mistake causes the most damage, not introduced as new.

### The Problem

`if (floor = 1)` and `if (floor == 1)` differ by one character and mean entirely different things: the first *assigns* `1` to `floor` and then tests the assigned value (always true, since `1` is nonzero); the second *compares* `floor` to `1`.

### Reappearance

Verified in LAB-02 Concept Unit 6: this compiles, runs, and silently overwrites the variable, with only a warning (`-Wparentheses`, part of `-Wall`) — never an error — to catch it. The same warning fires here, unchanged, because the underlying mistake is identical regardless of which condition it appears in.

### CS Lens

Same restatement as LAB-02: `=` and `==` are entirely different operators (assignment versus equality) that happen to look similar — a lexical accident of C's original design, inherited by C++, that has produced this exact bug class since the 1970s.

### SE Lens

Because this mistake produces only a warning, not an error, treating compiler warnings as advisory rather than mandatory to investigate is itself the deeper habit this Watch for exists to correct — a `-Wall` warning ignored often enough eventually hides a warning that mattered.

### Connection

Every condition written in the rest of this lesson (and this curriculum) uses `==`, never bare `=`, for exactly this reason.

---

## Concept Unit 6: Combining Conditions — `&&` and `!` on Real Values

### The Problem

The floor descriptions (Concept Unit 4) are independent per floor — but a *category* judgment ("is this dangerous?") spans multiple floors at once (3, 4, and 5) and needs a second, independent condition, layered on top of the same `floor` value, using the boolean operators from Concept Unit 3.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After the `if`/`else if`/`else` chain, before `return 0;`.
- **Dependencies:** `floor`, `TOTAL_FLOORS` (Concept Unit 1), `&&`/`!` (Concept Unit 3), `bool` (LAB-01).

### The New Code

```cpp
std::cout << std::endl;

bool isDangerous = (floor >= 3);
bool isBossFloor = (floor == TOTAL_FLOORS);

if (isDangerous && !isBossFloor) {
    std::cout << "Warning: This floor is dangerous. Proceed with caution." << std::endl;
} else if (isBossFloor) {
    std::cout << "Warning: The Dragon awaits. This is your final challenge." << std::endl;
} else {
    std::cout << "This floor is relatively safe." << std::endl;
}
```

### The Updated Project

Appended immediately after Concept Unit 4's chain, before `return 0;` — every line from Concept Unit 1 through here now appears in `main.cpp` in the order introduced.

### Concept Lab

No separate throwaway: this *is* already the smallest demonstration of `&&`/`!` acting on values with real meaning, and building a disposable version with fake names would strip away the exact thing worth seeing — that `isDangerous` and `isBossFloor` are themselves named `bool` variables, not just inline expressions.

Run it — verified this session, across every floor:

```
$ for f in 1 2 3 4 5; do echo "$f" | ./dungeon.exe | tail -1; done
This floor is relatively safe.
This floor is relatively safe.
Warning: This floor is dangerous. Proceed with caution.
Warning: This floor is dangerous. Proceed with caution.
Warning: The Dragon awaits. This is your final challenge.
```

What that proves: floors 1–2 are safe (`isDangerous` false), 3–4 are dangerous but not the boss (`isDangerous && !isBossFloor` true), and 5 alone triggers the boss branch (`isBossFloor` true, which short-circuits `isDangerous && !isBossFloor` to false first — covered next unit).

**A real gap this verification surfaced, worth naming rather than hiding:** floor `7` (invalid, per Concept Unit 4) still evaluates `isDangerous = (7 >= 3)` as `true` and prints the "dangerous" warning — verified this session. The danger check has no awareness that `floor` was already reported invalid earlier in the same run; it's a second, entirely independent judgment computed straight from the raw number, with no connection to Concept Unit 4's validity check. This is not a bug this lesson fixes — it's an honest example of two pieces of logic that look connected (both react to the same `floor`) but aren't actually coordinated, worth noticing before writing similar code.

### Mechanical Walkthrough

- `bool isDangerous = (floor >= 3);` — **(c) already basic**, reusing `bool` declaration (LAB-01) and `>=` (Concept Unit 2); the parentheses around the comparison are stylistic clarity, not required by precedence.
- `isDangerous && !isBossFloor` — **(a) first appearance of `&&` and `!` combined in one real expression.** Reads as "dangerous, and not the boss floor" — per Concept Unit 3's truth table, true only when `isDangerous` is true and `isBossFloor` is false.

### CS Lens

Storing an intermediate boolean result in a named variable (`isDangerous`) instead of inlining the comparison directly into the `if` is the boolean-logic version of LAB-02's "name your operands" principle — a reader sees *what* is being decided (`isDangerous`) separately from *how* it's computed (`floor >= 3`).

### SE Lens

`isDangerous && !isBossFloor` reads directly as its own English description, which is exactly the payoff logical operators exist for — the alternative, nested nested `if (floor >= 3) { if (floor != TOTAL_FLOORS) { ... } }`, expresses the identical rule with more structure and a less direct correspondence to the sentence "dangerous, but not the boss floor."

### Connection

`&&` here evaluates both sides in every case tested so far — Concept Unit 7 proves it doesn't always have to.

---

## Concept Unit 7: Short-Circuit Evaluation

### The Problem

`isDangerous && !isBossFloor` — does C++ always evaluate both `isDangerous` and `!isBossFloor`, even when the left side alone already determines the answer? If `isDangerous` is `false`, the whole `&&` expression must be `false` regardless of the right side — evaluating the right side at all would be wasted work, or worse, unsafe if it does something risky.

### No isolated code lab for this step

Reuses the real `isDangerous`/`isBossFloor` expression conceptually, but needs a dedicated Concept Lab to make the *skipped evaluation* itself visible — the real project code has no way to observe whether the right side ran or not, so a disposable version with an observable side effect is necessary here specifically.

### Concept Lab

```cpp
// scratch_shortcircuit.cpp  (disposable)
#include <iostream>
bool sideEffectAnd(bool value, int& counter) {   // int& — a reference parameter, taught properly in LAB-09; here only enough to observe a call happened
    counter++;
    return value;
}
int main() {
    int counter = 0;
    bool result = false && sideEffectAnd(true, counter);
    std::cout << "counter after && with false first: " << counter << std::endl;

    counter = 0;
    result = true && sideEffectAnd(true, counter);
    std::cout << "counter after && with true first: " << counter << std::endl;

    counter = 0;
    result = true || sideEffectAnd(true, counter);
    std::cout << "counter after || with true first: " << counter << std::endl;
    (void)result;   // silences an "unused variable" warning — result is never printed, only computed for its side effect
}
```

Run it — verified this session:

```
$ g++ scratch_shortcircuit.cpp -o scratch_shortcircuit -std=c++17 -Wall -Wextra
$ ./scratch_shortcircuit.exe
counter after && with false first: 0
counter after && with true first: 1
counter after || with true first: 0
```

What that proves, line by line: `false && sideEffectAnd(...)` never called `sideEffectAnd` at all — `counter` stayed `0` — because once the left side of `&&` is `false`, the overall result is already determined; there is no need to evaluate the right side, so C++ specifically does not. `true && sideEffectAnd(...)` *did* call it (`counter` became `1`), because the left side alone doesn't determine `&&`'s result. `true || sideEffectAnd(...)` never called it either (`counter` stayed `0`) — the mirror case for `||`: once the left side is `true`, the whole `||` is already `true`, so the right side is skipped.

This scratch file is discarded now; the real `isDangerous && !isBossFloor` never relies on the right side running for a needed side effect, so this project never observes the skip directly — but it is happening on every evaluation, per this proof.

### Mechanical Walkthrough

- `false && sideEffectAnd(true, counter)` — **(a) first appearance of an operator whose right operand may not execute at all**, a genuinely different behavior from every operator taught so far in this curriculum (LAB-02's arithmetic operators always evaluate both operands).

### CS Lens

Short-circuit evaluation is a **language-guaranteed evaluation order optimization**: rather than leaving it to the compiler's discretion whether to skip unnecessary work, the C++ standard *requires* `&&` and `||` to skip the right operand when the left already determines the answer — a guarantee, not a possible optimization.

### SE Lens

This guarantee is what makes a pattern like `if (index >= 0 && array[index] == target)` (arrays introduced properly in LAB-06) safe: when `index` is negative, `array[index]` is never evaluated at all, avoiding an out-of-bounds read that would otherwise be undefined behavior. The same guarantee is a hazard the moment a condition's right side is relied on to *run*, not just to be *true* — if it has a side effect the rest of the program depends on, short-circuiting will silently skip it whenever the left side alone decides the outcome.

### Watch for

Keep `if` conditions free of relied-upon side effects — use them only to read and test values. If a computation's side effect matters regardless of another condition's outcome, run it in its own statement before the `if`, not inside the condition where short-circuiting might skip it.

### Connection

This closes the logical-operator half of this lesson — `switch`, next, is a different branching tool for a narrower, more specific case than a general `&&`/`||` condition.

---

## Concept Unit 8: `switch` — Dispatching on a Discrete Value

### The Problem

Concept Unit 4's five-floor `if`/`else if` chain checks `floor == 1`, then `floor == 2`, and so on — five separate equality comparisons against the *same single variable*, differing only in which literal value they compare against. That specific, repeated shape has a dedicated construct built for it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified (the `if`/`else if`/`else` chain from Concept Unit 4 is replaced; the danger-assessment section from Concept Unit 6 is untouched).
- **Change type:** Replace.
- **Location:** Concept Unit 4's chain, exactly.
- **Dependencies:** `floor` (Concept Unit 1).

### The New Code

```cpp
switch (floor) {
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

### The Updated Project

Concept Unit 4's entire `if (floor == 1) { ... } else if ... else { ... }` block is deleted and replaced, in the same location, by the `switch` block above. Concept Unit 6's danger-assessment section, immediately after, is untouched.

### Concept Lab

The danger of an omitted `break` is the one thing the real project's own correctly-written `switch` can never demonstrate — it needs a deliberately broken disposable version:

```cpp
// scratch_fallthrough.cpp  (disposable — break removed from case 1 on purpose)
#include <iostream>
int main() {
    int floor = 1;
    switch (floor) {
        case 1: std::cout << "one" << std::endl;
        case 2: std::cout << "two" << std::endl; break;
        default: std::cout << "other" << std::endl;
    }
}
```

Compiling — verified this session:

```
$ g++ scratch_fallthrough.cpp -o scratch_fallthrough -std=c++17 -Wall -Wextra
scratch_fallthrough.cpp:5:44: warning: this statement may fall through [-Wimplicit-fallthrough=]
    5 |         case 1: std::cout << "one" << std::endl;
      |                                            ^~~~
scratch_fallthrough.cpp:6:9: note: here
    6 |         case 2: std::cout << "two" << std::endl; break;
      |         ^~~~
```

Running it anyway:

```
$ ./scratch_fallthrough.exe
one
two
```

What that proves: with `floor` equal to `1`, execution matched `case 1`, printed `"one"`, and then — with no `break` to stop it — fell straight through into `case 2`'s code and printed `"two"` as well, despite `floor` never equaling `2`. `-Wextra` (part of this course's standard flags) does catch this specific mistake with a named warning, the same way it caught LAB-02's assignment-in-condition bug — but, exactly like that case, it is only a warning; the program still compiled and ran with the wrong, doubled output.

This scratch file is discarded now; every `case` in the real `main.cpp` ends with an explicit `break`, so this fallthrough never happens there.

### Mechanical Walkthrough

- `switch (floor)` — **(a) first appearance.** Begins a dispatch on `floor`'s exact value.
- `case 1:` — **(a) first appearance.** A label — if `floor` equals `1`, execution jumps here and continues downward through the following statements until a `break` or the end of the `switch`.
- `break;` — **(a) first appearance.** Exits the `switch` immediately, preventing fallthrough into the next `case`, per the Concept Lab's proof of what happens without it.
- `default:` — **(a) first appearance.** Matches when no `case` value equals `floor` — the `switch` equivalent of `else`.

### CS Lens

A `switch` on a small, dense set of integer values can compile to a **jump table** — an array of machine-code addresses indexed directly by the value being switched on, letting the CPU jump straight to the right case in one step, rather than testing each value in sequence the way an `if`/`else if` chain (Concept Unit 4) does. Whether a specific compiler actually does this is an implementation detail, not a language guarantee — but it's the reason `switch` exists as a distinct construct rather than being pure syntactic sugar for `if`/`else if`.

### SE Lens

Choosing `switch` over `if`/`else if` for this exact case — one variable, several exact discrete values — makes every branch equally prominent and visually flat, rather than nested inside cascading `else if`s; the tradeoff is `switch`'s restriction to integer and `enum` types only (never `float`, `double`, or `std::string`) and the mandatory-but-easy-to-forget `break`, which Concept Unit 4's `if`/`else if` chain doesn't require at all.

### Run It

```
$ for f in 1 2 3 4 5 7; do echo "$f" | ./dungeon.exe; done
```

Verified this session — output identical to Concept Unit 4's `if`/`else if` version, floor for floor, including the `default` branch for `7`.

### Connection

This closes every branching construct in this lesson — the Closing section traces one full run through the finished program.

---

## Closing

### Connect the pieces

Trace floor `5` through the finished program: `std::cin >> floor` (Concept Unit 1) stores `5`. The `switch (floor)` (Concept Unit 8) matches `case 5`, printing the Dragon's Lair description. Immediately after, `bool isDangerous = (floor >= 3)` and `bool isBossFloor = (floor == TOTAL_FLOORS)` (Concept Unit 6) both evaluate to `true` — `TOTAL_FLOORS` is `5` (Concept Unit 1), so `floor == TOTAL_FLOORS` holds. `isDangerous && !isBossFloor` (Concept Unit 6, using Concept Unit 3's `&&`/`!`) evaluates `!isBossFloor` as `false`, making the whole expression `false` — so the `else if (isBossFloor)` branch runs instead, printing the boss warning. One value, `floor = 5`, drove two entirely independent branching decisions — a `switch` and an `if`/`else if` — each reaching its own correct conclusion from the same source.

### What breaks without this

Deliberately swap `&&` for `||` in `isDangerous && !isBossFloor` and reason through floor `5`, verified conceptually against Concept Unit 7's proven truth table: `isDangerous` is `true`, so `isDangerous || !isBossFloor` short-circuits to `true` immediately — `!isBossFloor` is never even evaluated (Concept Unit 7). The "dangerous but not boss" branch now incorrectly fires for the boss floor too, in addition to the `isBossFloor` branch never being reachable at all afterward. This is not a hypothetical; it is exactly the kind of one-character swap (`&&` to `||`) that compiles cleanly, runs without error, and silently changes which branch a real input takes.

### Exercises

1. Change `isDangerous`'s threshold from `floor >= 3` to `floor >= 2` and re-verify all five floors' danger output for real — confirm floor 2 now also reports "dangerous."
2. Write out, by hand, the fallthrough trace for `scratch_fallthrough.cpp` with `floor` changed to `2` instead of `1` — predict the output before running it, then compile and run to check.
3. Build the grade calculator from this lesson's Challenge yourself, then test it against seven scores you choose deliberately to hit every boundary: exactly `90`, exactly `89`, exactly `0`, `100`, and at least two invalid values (negative and over 100) — verify all seven for real, not by reading the code and assuming.
4. In the real `main.cpp`, change `switch (floor)`'s `default` case to omit its `break;` (it's the last case, so nothing follows it inside the `switch`) — recompile and confirm whether the compiler warns. Explain, in your own words, why a `break` on the *last* case in a `switch` has no observable effect either way, unlike every `break` before it.

### Definition of done

- [ ] `main.cpp` reads a floor number via `std::cin`, describes it via `switch`, and reports a danger level via `&&`/`!` on the same value.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`, and every `case` in the `switch` ends in `break`.
- [ ] All six inputs (floors 1–5, plus an invalid one) reproduce this lesson's verified output exactly, run for real, not predicted.
- [ ] You can explain, from Concept Unit 7's own proof, a concrete case where short-circuit evaluation would skip code a reader might expect to run.
- [ ] The grade calculator exercise is built, compiled, and tested against all boundary and invalid cases from Exercise 3.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-03: branching with if/else and switch, boolean logic, short-circuit evaluation"` — states why (a working decision-making program, every branch verified) not just what changed.
