# C++ Masterclass — S-01 — LAB 02 — Operators and Arithmetic

**Prerequisites:** LAB 01. You have a type inspector that prints variable values and sizes.

**What this lab adds:**
- All arithmetic operators and how they work in binary
- Integer division — why `5 / 2` is `2`, not `2.5`
- The modulo operator `%` — one of the most useful operators in game and systems programming
- Operator precedence — why `2 + 3 * 4` is `14`, not `20`
- Compound assignment operators (`+=`, `-=`, `*=`, `/=`, `%=`)
- The increment and decrement operators (`++`, `--`) and their hidden danger
- Type conversion — what happens when you mix types in an expression

**Time:** ~60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In mathematics, `7 / 2 = 3.5`. In C++, `7 / 2` evaluates to `3`. Why?
> 2. What is `13 % 5`? (The `%` symbol here is the **modulo** operator, not percent.)
>    If you don't know, make a guess about what modulo might do.
> 3. Predict: If you write `int result = 2 + 3 * 4;`, what value does `result` hold?
>    Does C++ follow mathematical order of operations?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **calculator program** that demonstrates every operator. Each section adds one new
operator, shows it in action, and immediately compiles:

```
=== Arithmetic Operators ===
7 + 2  = 9
7 - 2  = 5
7 * 2  = 14
7 / 2  = 3       ← integer division: remainder discarded
7 % 2  = 1       ← modulo: the remainder

=== The Modulo Clock ===
Hour 14 on a 12-hour clock = 2
Hour 17 on a 12-hour clock = 5
Hour 24 on a 12-hour clock = 0

=== Operator Precedence ===
2 + 3 * 4     = 14   ← * before +
(2 + 3) * 4   = 20   ← () forces addition first
```

---

## Part 1 — Arithmetic Operators

### Concept: The Five Arithmetic Operators

**What they are:** The five symbols that perform basic math on numeric types.
They produce a new value without changing the original variables.

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `+` | Addition | `7 + 2` | `9` |
| `-` | Subtraction | `7 - 2` | `5` |
| `*` | Multiplication | `7 * 2` | `14` |
| `/` | Division | `7 / 2` | `3` (integer division) |
| `%` | Modulo | `7 % 2` | `1` |

**`*` for multiplication:** C++ uses `*` because it is on every keyboard. The
mathematical `×` and `·` symbols are not ASCII and cannot appear in source code.

**Integer division — the critical trap:** When both operands are `int`, the `/` operator
performs **integer division** — it discards the fractional part entirely. `7 / 2 = 3`,
not `3.5`. No rounding occurs; the fractional part is truncated (cut off). This is
because integers cannot represent fractions. To get `3.5`, at least one operand must be
a floating-point type: `7.0 / 2` or `(double)7 / 2`.

**Watch for:** Integer division silently discards the remainder. This is one of the most
common sources of off-by-one errors in games (e.g., centering a grid: `width / 2` might
give the wrong center if `width` is odd). Always check whether you need the remainder.

---

## Step 1 — Set Up the Calculator Shell

Update `main.cpp`. The entire file is shown — but type each block one at a time,
saving and compiling after each `SAVE AND TRY`:

```cpp
#include <iostream>    // std::cout, std::endl

int main() {
    std::cout << "=== Arithmetic Operators ===" << std::endl;

    int left  = 7;   // left operand — named, not a magic number
    int right = 2;   // right operand

    std::cout << left << " + " << right << " = " << left + right << std::endl;
    std::cout << left << " - " << right << " = " << left - right << std::endl;
    std::cout << left << " * " << right << " = " << left * right << std::endl;

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
=== Arithmetic Operators ===
7 + 2  = 9
7 - 2  = 5
7 * 2  = 14
```

**Change something:** Change `left = 7` to `left = -3`. Recompile. All three
results update. Change back to `7`.

---

## Step 2 — Integer Division

Add the division and modulo lines. Only new lines marked:

```cpp
    std::cout << left << " * " << right << " = " << left * right  << std::endl;
    std::cout << left << " / " << right << " = " << left / right  << std::endl;   // ← add
    std::cout << left << " % " << right << " = " << left % right  << std::endl;   // ← add
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
7 / 2  = 3
7 % 2  = 1
```

**Change something:** Change `left = 7` to `left = 10`. Integer division: `10 / 2 = 5`
(no remainder). Modulo: `10 % 2 = 0` (evenly divisible). Change back to `7`.

---

## Part 2 — The Modulo Operator (the one you will use constantly)

### Math: Modulo — Division's Remainder

**What it computes:** The **remainder** after integer division. `a % b` answers:
"After dividing `a` by `b` as many whole times as possible, how much is left over?"

**The real-world analogy — a clock:** A standard 12-hour clock wraps around after
12. The hour after 12 is 1, not 13. Modulo performs exactly this wrap-around:
`hour % 12` maps any hour number to the range 0–11.

```
13 % 12 = 1   → 1:00
15 % 12 = 3   → 3:00
24 % 12 = 0   → 12:00 (midnight)
```

**The canonical example:** A row of 5 seats (numbered 0–4). You have visitors
numbered 0, 1, 2, 3, 4, 5, 6, 7... Where does visitor N sit?

```
visitor 0 → seat 0 % 5 = 0
visitor 3 → seat 3 % 5 = 3
visitor 5 → seat 5 % 5 = 0   ← wraps to the start
visitor 7 → seat 7 % 5 = 2
visitor N → seat N % 5        (always 0-4, never out of range)
```

**The formula `value % max` constrains any value to the range `[0, max-1]`.** This
is used in every series in this masterclass:
- Snake body indexing (S-02) — wrapping the snake's position at grid edges
- Tetris piece rotation (S-03) — cycling through 4 rotations: `(rotation + 1) % 4`
- Hash tables (S-07) — mapping any key to a fixed number of "buckets"
- Networking (S-08) — wrapping sequence numbers

**Watch for:** In C++, `%` on negative numbers produces implementation-defined results
in old standards, but in C++11 and later, `(-7) % 3 = -1` (the remainder has the same
sign as the dividend). If you need a non-negative result for wrapping (like grid
positions), use a helper or ensure inputs are positive. In S-02 Snake, we handle this
explicitly.

**Project Application:** In S-02 Snake, when the snake's head moves past the right edge
of a 20-column grid (column index 20), we need it to reappear at column 0. The formula
`new_col = (old_col + 1) % GRID_COLS` does this automatically. You will write this in
the next series.

---

## Step 3 — The Modulo Clock Demonstration

Add a new section after the arithmetic block. Start with a blank line and a new header:

```cpp
    // (after the previous cout lines)
    std::cout << std::endl;
    std::cout << "=== The Modulo Clock ===" << std::endl;

    const int CLOCK_SIZE = 12;   // ← 'const' means this value cannot change after declaration

    // Show three examples of 24-hour → 12-hour conversion
    std::cout << "Hour 14 on a 12-hour clock = " << 14 % CLOCK_SIZE << std::endl;
    std::cout << "Hour 17 on a 12-hour clock = " << 17 % CLOCK_SIZE << std::endl;
    std::cout << "Hour 24 on a 12-hour clock = " << 24 % CLOCK_SIZE << std::endl;
```

**`const int CLOCK_SIZE = 12;` explained:** `const` declares a variable that cannot
be reassigned after initialization. Writing `CLOCK_SIZE = 5;` later would be a compile
error. By convention, `const` variables are named in ALL_CAPS to visually distinguish
them from regular variables. This is the same convention used throughout this masterclass.
Every literal number that has a meaning (like "12 hours on a clock") should be a named
`const` — never a bare number in the code.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== The Modulo Clock ===
Hour 14 on a 12-hour clock = 2
Hour 17 on a 12-hour clock = 5
Hour 24 on a 12-hour clock = 0
```

**Change something:** Change `CLOCK_SIZE` to `7` (a week). Now the formula converts
"day of the year" to "day of the week." `14 % 7 = 0`, `15 % 7 = 1`. Change back to `12`.

---

## Part 3 — Operator Precedence

### Concept: Operator Precedence — Which Operation Happens First

**What it is:** When an expression contains multiple operators, precedence determines
the order they are evaluated. C++ uses the same rules as standard mathematics:
multiplication and division before addition and subtraction.

**Why this must be defined:** Without a fixed order, `2 + 3 * 4` is ambiguous —
it could be `(2 + 3) * 4 = 20` or `2 + (3 * 4) = 14`. Computers need one answer.

**The precedence hierarchy (partial — the most common operators):**

```
Highest (evaluated first)
  ()        parentheses
  * / %     multiplication, division, modulo
  + -       addition, subtraction
Lowest (evaluated last)
  =         assignment
```

**The solution:** Use `()` to override the default order. `(2 + 3) * 4` forces addition
first regardless of default precedence. When in doubt, parenthesize — it costs nothing
and makes intent explicit.

**Canonical example:** Mathematics uses the same rules (PEMDAS/BODMAS). `2 + 3 * 4`
means "multiply first" in both math and C++. C++ is consistent with the arithmetic
you already know — the surprise for beginners is usually **integer division**, not
precedence.

**Watch for:** The assignment operator `=` has very low precedence. In `result = 2 + 3`,
the addition happens first, then the result is stored. This is correct. But when checking
equality you must use `==` (two equals signs), not `=`. Writing `if (x = 5)` assigns 5
to x (always true) instead of checking if x equals 5. This is a common and silent bug.

---

## Step 4 — Precedence Examples

Add a new section:

```cpp
    std::cout << std::endl;
    std::cout << "=== Operator Precedence ===" << std::endl;

    int withoutParens = 2 + 3 * 4;      // ← * evaluated first: 2 + 12 = 14
    int withParens    = (2 + 3) * 4;    // ← () forces + first: 5 * 4 = 20

    std::cout << "2 + 3 * 4     = " << withoutParens << "   <- * before +"     << std::endl;
    std::cout << "(2 + 3) * 4   = " << withParens    << "   <- () forces + first" << std::endl;
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== Operator Precedence ===
2 + 3 * 4     = 14   <- * before +
(2 + 3) * 4   = 20   <- () forces + first
```

---

## Part 4 — Compound Assignment and Increment

### Concept: Compound Assignment Operators — Modifying a Variable

**What they are:** Shorthand for "apply this operation to the variable and store
the result back in the same variable."

| Long form | Shorthand | Meaning |
|-----------|-----------|---------|
| `score = score + 10` | `score += 10` | Add 10 to score |
| `score = score - 1`  | `score -= 1`  | Subtract 1 from score |
| `score = score * 2`  | `score *= 2`  | Multiply score by 2 |
| `score = score / 2`  | `score /= 2`  | Divide score by 2 |
| `score = score % 10` | `score %= 10` | score mod 10 |

**Why these exist:** `score += 10` is shorter and harder to mistype than
`score = score + 10`. More importantly, it expresses intent: "update this
variable in place," not "compute something and assign it."

### Concept: Increment and Decrement — `++` and `--`

**What they are:** `++variable` (or `variable++`) adds 1. `--variable` subtracts 1.
These are so common (especially in loops) that C++ gives them their own operators.

**Pre vs Post — the hidden difference:**
- `++score` (pre-increment) — increments first, then returns the new value
- `score++` (post-increment) — returns the current value first, then increments

```cpp
int a = 5;
int b = ++a;   // a becomes 6 first, then b = 6.  Result: a=6, b=6
int c = a++;   // c = 6 first (current value), then a becomes 7. Result: a=7, c=6
```

**The rule:** For simple statements like `score++;` alone on a line, pre and post
do the same thing. The difference only matters when the expression's value is used.
**In this masterclass, we use `++variable` (pre-increment) exclusively** to avoid
the subtlety. This is also the style favored in modern C++.

**Watch for:** `score++` and `++score` look similar but behave differently when their
return value is used. In a loop like `for (int i = 0; i < 10; ++i)`, either works
because the return value of the increment expression is discarded. But `arr[i++]` vs
`arr[++i]` access different elements.

---

## Step 5 — Compound Assignment and Increment

Add a final section:

```cpp
    std::cout << std::endl;
    std::cout << "=== Compound Assignment ===" << std::endl;

    int health = 100;
    std::cout << "health starts at: " << health << std::endl;

    health -= 25;   // ← take damage: was health = health - 25
    std::cout << "after -=25:       " << health << std::endl;

    health += 10;   // ← heal: was health = health + 10
    std::cout << "after +=10:       " << health << std::endl;

    ++health;       // ← regen: was health = health + 1
    std::cout << "after ++health:   " << health << std::endl;
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== Compound Assignment ===
health starts at: 100
after -=25:       75
after +=10:       85
after ++health:   86
```

---

## 🎯 Challenge: Wrap a Grid Position

**You know:** The modulo operator and its wrap-around property.

**Task:** Write a small program that simulates a player moving on a 1D strip of
10 cells (numbered 0–9). The player starts at cell 0 and takes 7 steps right.
If they reach the end (cell 9), they wrap to cell 0 and continue. Print the
player's position after each step.

**Expected output:**
```
Start: 0
Step 1: 1
Step 2: 2
...
Step 7: 7
```
*(No wrap needed yet — extend to 14 steps to see it wrap.)*

**Hint:** The wrapping formula is `position = (position + 1) % STRIP_SIZE`.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
const int STRIP_SIZE   = 10;   // total cells on the strip (0 to STRIP_SIZE-1)
const int STEPS_TO_TAKE = 14;  // enough steps to wrap around

int position = 0;
std::cout << "Start: " << position << std::endl;

// We haven't covered loops yet — expand manually for now
// (In LAB 05, we replace this with a for loop)
position = (position + 1) % STRIP_SIZE; std::cout << "Step  1: " << position << std::endl;
position = (position + 1) % STRIP_SIZE; std::cout << "Step  2: " << position << std::endl;
position = (position + 1) % STRIP_SIZE; std::cout << "Step  3: " << position << std::endl;
// ... continue to step 14
```

**Key insight:** `(position + 1) % STRIP_SIZE` constrains `position` to 0–9
regardless of how many steps you take. This exact formula will appear in S-02 Snake
to wrap the snake's head at the edges of the grid — in both X and Y dimensions.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Integer division | `7 / 2` prints `3`, not `3.5` |
| Modulo remainder | `7 % 2` prints `1` |
| Clock wrapping | `14 % 12` prints `2`, `24 % 12` prints `0` |
| Precedence | `2 + 3 * 4` prints `14`; `(2 + 3) * 4` prints `20` |
| Compound assignment | `health -= 25` reduces health; `health += 10` increases it |
| Pre-increment | `++health` increases by 1 |
| `const` naming | `CLOCK_SIZE` is ALL_CAPS and cannot be reassigned |

---

## Quick Check Answers

**1. Why does `7 / 2` evaluate to `3` in C++?**
Because both operands are `int`, and integers cannot represent fractions. The
`/` operator on two integers performs **integer division** — it returns only the
whole-number quotient and discards the remainder entirely. The remainder is not
rounded — it is truncated. To get `3.5`, you need at least one floating-point operand:
`7.0 / 2` or `7 / 2.0` or `static_cast<double>(7) / 2`.

**2. What is `13 % 5`?**
`3`. Modulo returns the remainder after division. `13 / 5 = 2` with remainder `3`
(since `2 × 5 = 10` and `13 - 10 = 3`). Modulo is the mathematical operation that
extracts the "leftover" from integer division.

**3. Does C++ follow mathematical order of operations?**
Yes — `2 + 3 * 4 = 14`. C++ evaluates `*` before `+` by default, exactly as in
standard mathematics (PEMDAS). This is called **operator precedence**. To override
it, use parentheses: `(2 + 3) * 4 = 20`. When in doubt about precedence, parenthesize —
it never hurts and makes intent explicit.
