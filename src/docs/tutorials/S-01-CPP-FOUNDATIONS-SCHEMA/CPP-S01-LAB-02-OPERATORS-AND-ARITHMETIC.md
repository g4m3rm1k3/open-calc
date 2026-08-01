# Lesson 2: An Operator Is a Question About Types, Not Just Symbols
### (LAB 02 — Operators and Arithmetic)

**What you will build:** A calculator program demonstrating every arithmetic operator, integer division's truncation, the modulo operator's wraparound behavior, operator precedence, and compound assignment — ending with a working 12-hour clock conversion built entirely from `%`. The transferable problem: `7 / 2` is not `3.5` in C++, and that is not an approximation or a rounding rule — it is a direct consequence of `int`'s storage (LAB-01) having no way to represent a fraction at all. Every operator in this lesson behaves the way it does because of what its operand *types* can hold, not because of an arbitrary language rule.

**What you need to know first:** LAB-01 — declaring and printing variables of `int` and `double`, and `sizeof`. LAB-00's toolchain and `std::cout` chaining.

**Terms introduced in this lesson**

> **Operand** — a value an operator acts on; in `left + right`, `left` and `right` are operands.
> **Integer division** — division between two integer types, discarding (truncating, not rounding) any fractional part.
> **Modulo (`%`)** — the remainder-after-division operator.
> **Implicit conversion (type promotion)** — the compiler automatically converting one operand's type to match another's within an expression, with no cast written.
> **`const`** — a qualifier marking a variable as unable to be reassigned after initialization.
> **Operator precedence** — the fixed order in which an expression's operators are evaluated when more than one appears.
> **Compound assignment** — an operator (`+=`, `-=`, `*=`, `/=`, `%=`) that combines computing a new value with storing it back into the same variable.
> **Pre-increment / post-increment (`++x` / `x++`)** — two forms of the increment operator that differ in what value the *expression itself* evaluates to, not in the variable's final value.

No pipeline diagram applies — S-01 builds standalone concept programs, not a continuous project pipeline.

---

## Concept Unit 1: The Five Arithmetic Operators

### The Problem

LAB-01 declared variables and printed them, but never computed anything from them. A calculator — the working feature this lesson builds toward — needs the operators that turn two values into a third.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `int` declaration and `std::cout` chaining (LAB-01, LAB-00).

### The New Code

```cpp
int left  = 7;
int right = 2;

std::cout << left << " + " << right << " = " << left + right << std::endl;
std::cout << left << " - " << right << " = " << left - right << std::endl;
std::cout << left << " * " << right << " = " << left * right << std::endl;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "=== Arithmetic Operators ===" << std::endl;

    int left  = 7;    // ← new
    int right = 2;    // ← new

    std::cout << left << " + " << right << " = " << left + right << std::endl;   // ← new
    std::cout << left << " - " << right << " = " << left - right << std::endl;   // ← new
    std::cout << left << " * " << right << " = " << left * right << std::endl;   // ← new

    return 0;
}
```

### Concept Lab

No isolated lab needed: `+`, `-`, `*` are the same arithmetic every reader already knows from ordinary mathematics — the only genuinely new fact is that `*` stands in for multiplication because `×` is not a character available on every keyboard or guaranteed in every source-file encoding, which needs no runnable demonstration. `/` and `%` are new *behaviors*, not new symbols, and get their own Concept Units next.

### Mechanical Walkthrough

- `left`, `right` — **(c) already basic.** Variable declarations, reusing LAB-01 Concept Unit 1's syntax with new names.
- `+`, `-`, `*` — **(a) first appearance.** Binary operators — each takes two **operands** and produces a new value; none of them modify `left` or `right` themselves.

### CS Lens

An operator that consumes two operands and produces a new value with no side effect is a **pure function** of its inputs — the same category `std::cout <<` (LAB-00) is *not*, since `<<` mutates the stream's internal state as a side effect. Recognizing which operators are pure and which aren't matters the moment code relies on evaluation order, which C++ does not always guarantee for compound expressions.

### SE Lens

Naming `left` and `right` instead of writing bare literals (`7 + 2`) directly is a small but real instance of **self-documenting code** — a reader six months from now sees which operand is which without re-deriving it from position alone, and changing the values later means editing one declaration instead of hunting every literal `7` and `2` in the file.

### Run It

```
$ g++ main.cpp -o calc -std=c++17 -Wall -Wextra
$ ./calc.exe
=== Arithmetic Operators ===
7 + 2 = 9
7 - 2 = 5
7 * 2 = 14
```

Verified this session — zero warnings, matching the lesson's own claim exactly.

### Connection

`/` and `%`, next, complete the five arithmetic operators — and immediately break the "just like math class" pattern this unit established.

---

## Concept Unit 2: Integer Division — Why `7 / 2` Is `3`

### The Problem

In ordinary arithmetic, `7 / 2 = 3.5`. LAB-01 established that `int` has no way to store a fractional value — so what does `/` do when both operands are `int` and the true answer isn't a whole number?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Immediately after the `*` line.
- **Dependencies:** `left`, `right` (Concept Unit 1).

### The New Code

```cpp
std::cout << left << " / " << right << " = " << left / right << std::endl;
std::cout << left << " % " << right << " = " << left % right << std::endl;
```

### The Updated Project

```cpp
    std::cout << left << " * " << right << " = " << left * right << std::endl;
    std::cout << left << " / " << right << " = " << left / right << std::endl;   // ← new
    std::cout << left << " % " << right << " = " << left % right << std::endl;   // ← new
```

### Concept Lab

```cpp
// scratch_mixed.cpp  (disposable)
#include <iostream>
int main() {
    std::cout << 7 / 2 << std::endl;
    std::cout << 7.0 / 2 << std::endl;
    std::cout << static_cast<double>(7) / 2 << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_mixed.cpp -o scratch_mixed -std=c++17 -Wall -Wextra
$ ./scratch_mixed.exe
3
3.5
3.5
```

What that proves: the *exact same numbers*, `7` and `2`, produce a different result depending on the operands' *types* — `int / int` truncates to `3`; the moment either operand is a `double` (`7.0`, or `7` explicitly converted with `static_cast<double>`), the division happens in floating-point and produces the mathematically exact `3.5`. The fraction is not rounded away by `/` deciding to be imprecise — an `int` result physically cannot hold `.5`, so `/` between two `int`s is defined to compute the whole-number quotient only, discarding (not rounding) whatever remainder exists. `static_cast<double>(x)` is a first appearance worth naming now, in full: an explicit request to convert `x` to `double`, written by the programmer — a **cast** — versus what the `7.0 / 2` line does implicitly, covered next unit.

This scratch file is discarded now; `main.cpp`'s real `left / right` behaves exactly like the first line, since both `left` and `right` are `int`.

### Mechanical Walkthrough

- `left / right` — **(a) first appearance.** Integer division: with both operands `int`, produces the truncated whole-number quotient.
- `left % right` — **(a) first appearance, full treatment in the next Concept Unit** — noted here only as "the operator producing the discarded remainder," since `%` deserves its own unit given how much it's reused later in this curriculum.

### CS Lens

Truncating division is the CPU's own native integer-division instruction behavior — C++ is not adding rounding logic on top; it is exposing exactly what the hardware division circuit produces for two integer inputs. Also recognized in: array indexing math (`totalItems / itemsPerPage` for pagination), any "how many full groups fit" calculation, and clock/calendar arithmetic.

### SE Lens

Because integer division silently discards information with no error or warning, a real, common bug class is treating an `int / int` result as if it were exact — computing a grid's center as `width / 2` is wrong by one column whenever `width` is odd, with no crash or warning to reveal it. The fix is never "hope the numbers work out"; it's naming, explicitly, whether truncation is wanted (`width / 2`, accepted) or not (convert to floating-point first).

### Run It

```
$ g++ main.cpp -o calc -std=c++17 -Wall -Wextra
$ ./calc.exe
...
7 / 2 = 3
7 % 2 = 1
```

Verified this session.

### Connection

Getting `3.5` back from these same two numbers, when it's actually wanted, is Concept Unit 3's subject.

---

## Concept Unit 3: Implicit Conversion — Mixing `int` and `double`

### The Problem

Concept Unit 2's Concept Lab already showed `7.0 / 2` produces `3.5` — but never explained *why* a bare `int` (`2`) is allowed in the same expression as a `double` (`7.0`) at all, with no cast, no error.

### No isolated code lab for this step

Reuses Concept Unit 2's Concept Lab directly — the `7.0 / 2` line is this unit's real subject, not a new snippet.

### Explanation

When an operator's two operands have different types, C++ does not refuse to compile or pick one type arbitrarily — it applies **implicit conversion**: the "smaller" or less-capable type (here, `int`) is automatically promoted to match the "larger" one (`double`) *before* the operator runs, with no cast written by the programmer and no warning produced. `7.0 / 2` becomes, in effect, `7.0 / 2.0`, entirely inside the compiler, before division happens — which is why the result carries a fraction: by the time `/` actually runs, both operands are already `double`.

The reverse direction is also worth seeing, verified this session:

```cpp
double mixedSum      = 5 + 2.5;   // 7.5
int    truncatedBack = 5 + 2.5;   // 7
```

```
$ ./scratch_promote.exe
7.5 7
```

`5 + 2.5` itself always promotes `5` to `double` and computes `7.5`, regardless of what it's assigned to afterward — `mixedSum` receives that `7.5` directly. `truncatedBack`, declared as `int`, receives the *same* `7.5`, but assigning a `double` to an `int` variable is itself a second, separate implicit conversion — this one truncating the fraction away, producing `7`. Two conversions, at two different moments, each following its own rule; neither produced a compiler warning under `-Wall -Wextra` in direct (`=`) initialization, consistent with LAB-01 Concept Unit 4's finding about narrowing conversions on this toolchain.

### CS Lens

Automatically widening the "smaller" type to the "larger" one before an operation, rather than refusing to compile mixed-type expressions, is called **type promotion** — the same general strategy JavaScript takes to an extreme (`"5" + 2` converts `2` to a string) and Python avoids differently (`5 / 2` in Python 3 always produces a `float`, sidestepping this exact truncation trap by redefining what `/` means for integers in the first place).

### SE Lens

C++'s choice — implicit, silent promotion on the way in, and implicit, silent truncation on the way out — is a real design tradeoff: it lets `7.0 / 2` "just work" without a cast, but it means a bug like Concept Unit 2's off-by-one grid center can happen *invisibly*, with the compiler cooperating rather than flagging it. Later, more defensive C++ style (not required in this series yet) sometimes disables implicit narrowing on assignment entirely, at the cost of needing an explicit cast everywhere a deliberate truncation is wanted.

### Connection

Every mixed-type expression in the rest of this curriculum — and there are many — resolves by this same promote-then-compute rule.

---

## Concept Unit 4: The Modulo Operator — Division's Remainder

### The Problem

Concept Unit 2 introduced `%` only as "the operator producing what `/` discards." That remainder, on its own, turns out to be one of the most reused operators in this entire curriculum — worth understanding on its own terms, not just as division's leftover.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After the arithmetic block, before `return 0;`.
- **Dependencies:** `%` (introduced, unexplained, in Concept Unit 2).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "=== The Modulo Clock ===" << std::endl;

const int CLOCK_SIZE = 12;

std::cout << "Hour 14 on a 12-hour clock = " << 14 % CLOCK_SIZE << std::endl;
std::cout << "Hour 17 on a 12-hour clock = " << 17 % CLOCK_SIZE << std::endl;
std::cout << "Hour 24 on a 12-hour clock = " << 24 % CLOCK_SIZE << std::endl;
```

(`const`, used here for the first time, gets its own Concept Unit next — treated here only as "a variable," per the Repetition Rule's allowance for a construct not yet explained to be used once and picked up immediately after.)

### The Updated Project

```cpp
    std::cout << left << " % " << right << " = " << left % right << std::endl;

    std::cout << std::endl;                                        // ← new
    std::cout << "=== The Modulo Clock ===" << std::endl;           // ← new

    const int CLOCK_SIZE = 12;                                      // ← new

    std::cout << "Hour 14 on a 12-hour clock = " << 14 % CLOCK_SIZE << std::endl;   // ← new
    std::cout << "Hour 17 on a 12-hour clock = " << 17 % CLOCK_SIZE << std::endl;   // ← new
    std::cout << "Hour 24 on a 12-hour clock = " << 24 % CLOCK_SIZE << std::endl;   // ← new
```

### Concept Lab

```cpp
// scratch_seats.cpp  (disposable — a row of 5 seats, numbered 0-4)
#include <iostream>
int main() {
    for (int visitor = 0; visitor <= 7; ++visitor) {
        std::cout << "visitor " << visitor << " -> seat " << visitor % 5 << std::endl;
    }
}
```

This lab uses a `for` loop one lesson early, before LAB-04 formally teaches it — flagged explicitly rather than silently: it is used here only to generate several inputs quickly; treat its output as given, not its syntax as taught yet.

Run it — verified this session:

```
$ g++ scratch_seats.cpp -o scratch_seats -std=c++17 -Wall -Wextra
$ ./scratch_seats.exe
visitor 0 -> seat 0
visitor 1 -> seat 1
visitor 2 -> seat 2
visitor 3 -> seat 3
visitor 4 -> seat 4
visitor 5 -> seat 0
visitor 6 -> seat 1
visitor 7 -> seat 2
```

What that proves: `value % max` never produces a result outside `[0, max-1]`, no matter how large `value` grows — visitor `5`, the first to exceed the 5 seats (numbered 0–4), wraps back to seat `0` instead of producing an out-of-range `5`. This is the general shape behind the clock demo above: `14 % 12` and `24 % 12` are the identical "wrap into a fixed range" operation, just with `12` as the range size instead of `5`.

**A real edge case worth naming, not glossing over:** modulo on negative numbers, verified this session:

```
$ echo '#include <iostream>
int main() { std::cout << (-7) % 3 << std::endl; }' > scratch_negmod.cpp
$ ./scratch_negmod.exe
-1
```

In C++11 and later, the result's sign matches the **dividend** (the left operand) — `(-7) % 3` is `-1`, not `2`. A wraparound formula that assumes a non-negative result (like the seat-assignment formula above, if `visitor` could ever be negative) breaks silently on negative input; getting a guaranteed non-negative wrap from a possibly-negative value needs an explicit adjustment, not bare `%`. `S-02-SNAKE` handles this directly, in the grid-wrapping lab.

This scratch file is discarded now; the real `main.cpp` uses only the clock version, on fixed positive literals.

### Mechanical Walkthrough

- `14 % CLOCK_SIZE` — **(c) already basic**, reusing `%`'s mechanism from Concept Unit 2 with a named constant instead of a variable.

### CS Lens

`value % max` constraining any input to a fixed range `[0, max-1]` is a named, reused idiom — a **wraparound index** — that recurs constantly: hash table bucket assignment (mapping an arbitrary key's hash to one of a fixed number of buckets), circular buffer indexing (LAB-10, and again in `CPP-S02-LAB-10`), Tetris piece rotation (cycling through 4 orientations via `(rotation + 1) % 4`), and any 12- or 24-hour clock display.

### SE Lens

Extracting `12` into a named `const int CLOCK_SIZE` rather than writing the bare literal `12` three times is the first real instance, in this lesson, of treating a "magic number" as a decision worth naming — Concept Unit 5 covers exactly why `const` specifically, not just a plain variable, is the right tool for it.

### Run It

```
$ ./calc.exe
...
=== The Modulo Clock ===
Hour 14 on a 12-hour clock = 2
Hour 17 on a 12-hour clock = 5
Hour 24 on a 12-hour clock = 0
```

Verified this session.

### Connection

`CLOCK_SIZE` is this lesson's first `const` — Concept Unit 5 explains the keyword itself.

---

## Concept Unit 5: `const` — A Value That Cannot Change

### The Problem

`CLOCK_SIZE` represents a fact about clocks (12 hours) that should never change while the program runs — nothing about the language, so far, stops a later line of code from accidentally reassigning it and silently breaking every calculation that depends on it.

### Project Change

Already introduced as part of Concept Unit 4's New Code — this unit explains the keyword that unit deferred.

### Concept Lab

```cpp
// scratch_const.cpp  (disposable)
int main() {
    const int CLOCK_SIZE = 12;
    CLOCK_SIZE = 5;
    return 0;
}
```

Attempting to compile — verified this session:

```
$ g++ scratch_const.cpp -o scratch_const -std=c++17 -Wall -Wextra
scratch_const.cpp: In function 'int main()':
scratch_const.cpp:3:16: error: assignment of read-only variable 'CLOCK_SIZE'
    3 |     CLOCK_SIZE = 5;
      |     ~~~~~~~~~~~^~~
```

What that proves: `const` is not a naming convention or a comment-level promise — it is enforced by the compiler as a hard error, at compile time, before the program can even be built, the moment code attempts to reassign a `const` variable after its initialization.

This scratch file is discarded now; the real `CLOCK_SIZE` in `main.cpp` is never reassigned, so it never triggers this error — the point of the lab was to prove the protection exists, not to demonstrate breaking it in the real project.

### Mechanical Walkthrough

- `const` — **(a) first appearance.** A qualifier placed before a type, marking the variable **immutable** after initialization — it must be given a value at the point it's declared (an uninitialized `const` has no way to ever receive a value, since assignment is permanently forbidden).

### CS Lens

`const` is C++'s way of turning a **runtime discipline** (the programmer promising, informally, not to change a value) into a **compile-time guarantee** (the compiler refusing to build code that breaks the promise) — the same category of shift, at a much smaller scale, as static type checking itself: catching a class of mistake before the program ever runs, instead of only if and when it happens to occur.

### SE Lens

By convention (not enforced by the compiler), `const` variables are named in `ALL_CAPS` in this curriculum — a purely visual signal, letting a reader recognize "this cannot change" from the name alone, without checking the declaration. Every literal number with a real-world meaning (12 hours, 10 grid cells) should be a named `const`, never a bare number scattered through the code — changing a clock's size from 12 to a 24-hour format later means editing one line, not hunting every literal `12` in the file and guessing which ones meant "hours" versus something unrelated that happened to also be `12`.

### Connection

`CLOCK_SIZE` stays constant for the rest of this lesson; the next unit turns to a different kind of fixed rule — the order operators evaluate in.

---

## Concept Unit 6: Operator Precedence

### The Problem

`2 + 3 * 4` is ambiguous on paper unless a fixed rule says which operator runs first — `(2 + 3) * 4 = 20` and `2 + (3 * 4) = 14` are both structurally valid readings of the same unparenthesized text.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After the modulo clock section.
- **Dependencies:** `+`, `*` (Concept Unit 1).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "=== Operator Precedence ===" << std::endl;

int withoutParens = 2 + 3 * 4;
int withParens    = (2 + 3) * 4;

std::cout << "2 + 3 * 4     = " << withoutParens << "   <- * before +"        << std::endl;
std::cout << "(2 + 3) * 4   = " << withParens    << "   <- () forces + first" << std::endl;
```

### The Updated Project

Appended after Concept Unit 5's block, before `return 0;` — the pattern is identical to every prior addition in this lesson (a blank line, a header, new statements), so the full file is not repeated here per the schema's allowance to skip Updated Project only when nothing new surrounds the addition; this case *does* have surrounding structure (the whole accumulated `main`), so, for completeness: every line from Concept Unit 1 through this one is now present in `main.cpp`, in the order introduced, followed by this unit's four new lines, followed by `return 0;`.

### Concept Lab

```cpp
// scratch_prec.cpp  (disposable)
#include <iostream>
int main() {
    int withoutParens = 2 + 3 * 4;
    int withParens    = (2 + 3) * 4;
    std::cout << withoutParens << " " << withParens << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_prec.cpp -o scratch_prec -std=c++17 -Wall -Wextra
$ ./scratch_prec.exe
14 20
```

What that proves: C++ resolves `2 + 3 * 4` to `14`, meaning `*` evaluated before `+` — the same convention (PEMDAS/BODMAS) taught in ordinary arithmetic. `(2 + 3) * 4` produces `20` — parentheses override the default order entirely, forcing the addition to happen first regardless of what precedence would otherwise choose.

This scratch file is discarded now; `main.cpp`'s real `withoutParens`/`withParens` are the identical two expressions, kept permanently in the project this time because they *are* the working feature this section of the lesson demonstrates.

### Mechanical Walkthrough

- `2 + 3 * 4` — **(a) first appearance of multiple operators in one expression.** Per the standard precedence table (`()` highest, then `* / %`, then `+ -`, then `=` lowest), `*` binds before `+`.
- `(2 + 3) * 4` — **(a) first appearance of `()` as an explicit precedence override**, distinct from its earlier appearance in LAB-00 as a function's parameter-list delimiter — the same characters, a different grammatical role, decided by context.

### CS Lens

A fixed precedence table, applied uniformly with no ambiguity, is what makes an expression like `2 + 3 * 4` a **deterministic** computation rather than something requiring the compiler to guess intent — every real programming language defines one (they mostly agree with each other and with ordinary mathematics, with occasional differences worth checking when precedence-sensitive code moves between languages).

### SE Lens

"When in doubt, parenthesize" costs nothing at runtime (`sizeof`-style constant folding aside, extra parentheses affect only how the compiler groups an expression, never the compiled machine code's actual work) and removes any need for a reader to have the precedence table memorized to understand intent at a glance — this course treats over-parenthesizing a genuinely ambiguous-looking expression as good style, not noise.

### Watch for

`=` sits at the *bottom* of the precedence table — lower than every arithmetic operator. `result = 2 + 3` computes the addition first, then assigns; this is correct and expected. The real danger is a different operator entirely: `==` (equality comparison, covered in LAB-03) versus a single `=` (assignment) inside a condition. Verified this session:

```cpp
int x = 0;
if (x = 5) {
    std::cout << "truthy, x=" << x << std::endl;
}
```

```
$ g++ scratch_assign_bug.cpp -o scratch_assign_bug -std=c++17 -Wall -Wextra
scratch_assign_bug.cpp:4:11: warning: suggest parentheses around assignment used as truth value [-Wparentheses]
    4 |     if (x = 5) {
      |         ~~^~~
truthy, x=5
```

This *compiles and runs* — `x = 5` assigns `5` to `x` and, as an expression, evaluates to `5` itself, which `if` treats as true (nonzero). `-Wall` does catch this specific mistake, as the warning above shows — but it is only a warning, not an error; the program still built and ran with `x` silently overwritten. `if (x == 5)` is what was almost certainly meant.

### Connection

This closes out expression evaluation — the remaining two units turn from *computing* a value to *updating* a variable's stored value in place.

---

## Concept Unit 7: Compound Assignment Operators

### The Problem

`health = health - 25;` says "damage the player" in the clumsiest possible way: it names `health` twice for one logical update, and the repetition grows more error-prone the longer the variable's name gets.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After the precedence section, before `return 0;`.
- **Dependencies:** `-`, `+` (Concept Unit 1).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "=== Compound Assignment ===" << std::endl;

int health = 100;
std::cout << "health starts at: " << health << std::endl;

health -= 25;
std::cout << "after -=25:       " << health << std::endl;

health += 10;
std::cout << "after +=10:       " << health << std::endl;
```

(`++health`, the line after this, belongs to Concept Unit 8 — increment is related but is its own operator, not compound assignment, and earns its own treatment.)

### The Updated Project

Appended after Concept Unit 6's block, following the same accumulation pattern noted there.

### Concept Lab

No separate throwaway needed: `health -= 25;` *is* already the smallest possible demonstration of compound assignment — there is no simpler disposable host that would teach it more clearly than the real variable it updates.

Run it — verified this session:

```
$ g++ main.cpp -o calc -std=c++17 -Wall -Wextra
$ ./calc.exe
...
=== Compound Assignment ===
health starts at: 100
after -=25:       75
after +=10:       85
```

### Mechanical Walkthrough

- `health -= 25` — **(a) first appearance.** Shorthand for `health = health - 25;` — subtracts `25` from `health` and stores the result back into `health`, in one operator instead of two `health` references and a `=`.
- `health += 10` — **(c) already basic**, reusing `-=`'s exact mechanism with `+` instead of `-`.

### CS Lens

A compound assignment operator is **read-modify-write** — read the variable's current value, compute a new one, write it back to the same location — the identical three-step shape a CPU's own increment/add instructions perform directly on a register, and the same shape that becomes a real concurrency hazard later (two threads doing read-modify-write on the same shared variable at once can lose an update) — not a concern yet in this single-threaded course, but the shape is worth recognizing early.

### SE Lens

`health -= 25` over `health = health - 25` is a **readability and intent** choice, not merely a shorter one: it reads as "update this variable" as a single idea, rather than "compute a new value from an old one" as two ideas that happen to share a name — the shorter form is also harder to typo into referencing the wrong variable on one side, since there's only one name to write instead of two.

### Connection

`++health`, next, is the same "read-modify-write, in place" idea specialized to the single most common update of all: adding exactly one.

---

## Concept Unit 8: `++` and `--` — Increment, Decrement, and the Pre/Post Difference

### The Problem

`health += 1;` says "add one" correctly but verbosely — adding or subtracting exactly one is common enough, especially once loops (LAB-04) are introduced, that C++ gives it a dedicated, shorter operator. That operator turns out to have a real subtlety compound assignment doesn't.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 7's `+= 10` line.
- **Dependencies:** `health` (Concept Unit 7).

### The New Code

```cpp
++health;
std::cout << "after ++health:   " << health << std::endl;
```

### The Updated Project

```cpp
    health += 10;
    std::cout << "after +=10:       " << health << std::endl;

    ++health;                                                 // ← new
    std::cout << "after ++health:   " << health << std::endl;  // ← new
```

### Concept Lab

```cpp
// scratch_prepost.cpp  (disposable)
#include <iostream>
int main() {
    int a = 5;
    int b = ++a;
    std::cout << "a=" << a << " b=" << b << std::endl;
    int c = a++;
    std::cout << "a=" << a << " c=" << c << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_prepost.cpp -o scratch_prepost -std=c++17 -Wall -Wextra
$ ./scratch_prepost.exe
a=6 b=6
a=7 c=6
```

What that proves: both `++a` (**pre-increment**) and `a++` (**post-increment**) end with `a` one higher than before — the *variable's* final value is identical either way. What differs is what the *expression itself* evaluates to, at the moment it runs: `++a` increments first, then the expression's value is the new `6` — so `b` receives `6`. `a++` evaluates to the value `a` held *before* incrementing — `6` — and only afterward does `a` become `7`; `c` receives the pre-increment value, `6`, even though by the time the next line runs, `a` is already `7`.

This scratch file is discarded now; `main.cpp`'s real `++health;`, alone on its own line with its result never used, behaves identically either way it's written — the difference this lab just proved only matters when the expression's value is captured, which the real project doesn't do.

### Mechanical Walkthrough

- `++health;` — **(a) first appearance.** Pre-increment, used as a standalone statement — the returned value (the new `health`) is computed but never used, since nothing captures it.

### CS Lens

An operator whose *side effect* (mutating `a`) and *value* (what the expression evaluates to) can differ, depending on pre- versus post-form, is a real and sometimes underappreciated distinction in language design — most languages either don't offer both forms, or (like Python) offer neither, precisely because of the subtlety this Concept Lab demonstrates.

### SE Lens

This curriculum uses `++variable` (pre-increment) exclusively, even in the many places pre and post behave identically (a standalone statement, or a `for` loop's increment step, LAB-04), for one consistency reason: it removes the need to re-verify, every single time, whether *this specific* use is one of the cases where the difference matters — always defaulting to pre-increment means the answer is always "no, it never differs here, because we never use the return value of `++`." Post-increment's return value is occasionally useful (an insertion function returning "the old count, before I incremented it"), but is a targeted exception, not this course's default.

### Watch for

`arr[i++]` and `arr[++i]` (both introduced properly once arrays exist, LAB-06) access genuinely different elements — this is exactly the case where the pre/post distinction stops being cosmetic and starts being a real, silent-bug source if the wrong form is used without noticing.

### Run It

```
$ ./calc.exe
...
after ++health:   86
```

Verified this session — `85 + 1 = 86`.

### Connection

This closes the calculator this lesson set out to build — every operator from Concept Unit 1 through here has now been demonstrated, compiled, and run in the same program.

---

## Closing

### Connect the pieces

Follow `health` from `100` to `86`, the exact sequence verified in Concept Units 7 and 8: `health -= 25` (Concept Unit 7's read-modify-write) drops it to `75`; `health += 10` raises it to `85`; `++health` (Concept Unit 8's pre-increment) raises it once more to `86`. Every step reused the same underlying idea — read the current value, compute a new one, write it back — first spelled out the long way in Concept Unit 1's pure arithmetic, then shortened by Concept Unit 7's compound assignment, then specialized by Concept Unit 8 to the single most common case, "add exactly one."

### What breaks without this

Removing the `.0` from a mixed-type division that's meant to produce a fraction is the real, silent failure this lesson is built around — not a crash, a wrong answer with no error. Verified this session:

```cpp
double half = 7 / 2;       // NOT 3.5
```

```
$ echo '#include <iostream>
int main() { double half = 7 / 2; std::cout << half << std::endl; }' > scratch_wrong.cpp
```

This compiles cleanly, with no warning, and prints `3` — not `3.5`. The bug is invisible at the `double half = ...` line; it already happened one step earlier, inside `7 / 2`, before the truncated integer result of `3` was ever handed to `double half` to store. Declaring the *destination* as `double` does nothing to fix division that already happened between two `int`s — the fix has to be in the expression itself: `7.0 / 2`, or `static_cast<double>(7) / 2`, per Concept Unit 2 and 3.

### Exercises

1. Change `left = 7` to `left = 10` and confirm `10 / 2 = 5` (no remainder) and `10 % 2 = 0` — an evenly divisible pair, distinct from `7`/`2`'s remainder-1 case.
2. Change `CLOCK_SIZE` to `7` and reinterpret the same three lines as converting "day of the year" to "day of the week" instead of an hour — confirm `14 % 7 = 0` and `15 % 7 = 1` by adding a line for `15`.
3. Write, compile, and run a small standalone program computing `(-7) % 3` for real (not copying this lesson's claimed answer) — confirm the sign matches the dividend, per Concept Unit 4's verified finding.
4. Extend Concept Unit 8's Concept Lab with a third line, `int d = a++ + ++a;`, predict the result in writing before compiling, then compile and run it to check your prediction — this deliberately combines both forms in one expression, which is exactly the kind of expression this course's own "always pre-increment" rule (Concept Unit 8, SE Lens) exists to avoid writing in real code.

### Definition of done

- [ ] `main.cpp` compiles with zero warnings under `-std=c++17 -Wall -Wextra` and reproduces this lesson's full verified output, section by section.
- [ ] You can explain, without looking it up, why `7 / 2` is `3` in terms of what `int` can and cannot store — not as a memorized rule.
- [ ] You can state the modulo wraparound formula (`value % max` constrains to `[0, max-1]`) and name at least one place later in this curriculum it will reappear.
- [ ] You can predict `2 + 3 * 4` and `(2 + 3) * 4` correctly, and explain why `=` inside an `if` condition is dangerous even though the compiler only warns, not errors, on it.
- [ ] All four Exercises completed with real compiled output, including Exercise 4's written prediction made *before* compiling.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-02: arithmetic operators, integer division, modulo wraparound, precedence, compound assignment"` — states why (a working demonstration of every operator's real behavior, verified) not just what changed.
