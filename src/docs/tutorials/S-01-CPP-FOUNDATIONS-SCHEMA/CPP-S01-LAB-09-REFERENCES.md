# Lesson 9: A Reference Is a Pointer That Cannot Point Wrong
### (LAB 09 — References and Pass-by-Reference)

**What you will build:** A clean reference-based rewrite of LAB-08's `swap`, plus LAB-05's dungeon sketcher fully updated to use `const` references where they belong. The transferable problem: LAB-08's pointers can modify a caller's variable, but at the cost of `&` at every call site, `*` at every access, and three real dangers (wild, dangling, double-free) with no compiler help. A reference does the identical job — an alias for an existing variable — while making an entire category of pointer mistake impossible to write in the first place, not just easier to avoid.

**What you need to know first:** LAB-08 — pointers, addresses, dereferencing, dangling pointers. LAB-07's `std::string` and the cost of copying it. LAB-05's pass-by-value default.

**Terms introduced in this lesson**

> **Reference** — an alias for an existing variable; after binding, the reference and the original name the same memory location.
> **Binding** — the act of associating a reference with the variable it will alias, which happens exactly once, at declaration.
> **`const` reference** — a reference through which the referenced value cannot be modified, while still avoiding a copy.
> **Dangling reference** — a reference to a variable that has been destroyed; the reference equivalent of a dangling pointer.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: References — Aliases for Variables

### The Problem

LAB-08's `swap(int* a, int* b)` requires the caller to write `swap(&x, &y)` and the function body to write `*a`/`*b` everywhere — correct, but noisy, and every `&`/`*` is a spot where LAB-08's own Watch for (the three meanings of `*`) can cause a mistake.

### Project Change

- **Reference Source:** LAB-08's `swap` challenge solution (this same series, prior lesson) — quoted below, rewritten with references instead of pointers, same behavior.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file, rewriting known logic).
- **Location:** Declaration/definition above `main`; call inside `main`.
- **Dependencies:** LAB-08's `swap` logic, LAB-05's function syntax.

### The New Code

```cpp
void swapByRef(int& a, int& b);

void swapByRef(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}
```

### The Updated Project

```cpp
#include <iostream>

void swapByRef(int& a, int& b);   // ← new

void swapByRef(int& a, int& b) {  // ← new
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    std::cout << "=== References Demo ===" << std::endl;
    std::cout << std::endl;
    std::cout << "swap(x, y):" << std::endl;

    int x = 10;
    int y = 25;
    std::cout << "  Before: x=" << x << ", y=" << y << std::endl;

    swapByRef(x, y);   // ← new — no & needed at the call site

    std::cout << "  After:  x=" << x << ", y=" << y << std::endl;

    return 0;
}
```

### Concept Lab

```cpp
// scratch_alias.cpp  (disposable)
#include <iostream>
int main() {
    int score = 100;
    int& alias = score;

    alias = 200;
    std::cout << "score = " << score << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_alias.cpp -o scratch_alias -std=c++17 -Wall -Wextra
$ ./scratch_alias.exe
score = 200
```

What that proves: `alias = 200;` never mentions `score` by name, yet `score` itself changed — `alias` is not a separate variable holding a copy or an address; it *is* another name for `score`'s exact memory location, per this lesson's opening claim. This differs from LAB-08's pointer in one crucial way, worth proving directly:

```cpp
// scratch_reassign.cpp  (disposable)
#include <iostream>
int main() {
    int a = 1;
    int b = 2;
    int& ref = a;
    ref = b;
    std::cout << "a=" << a << " b=" << b << " ref=" << ref << std::endl;
}
```

```
$ g++ scratch_reassign.cpp -o scratch_reassign -std=c++17 -Wall -Wextra
$ ./scratch_reassign.exe
a=2 b=2 ref=2
```

What that proves: `ref = b;` did **not** make `ref` alias `b` instead of `a` — it *copied* `b`'s value (`2`) into `a`, because `ref` already refers to `a`, and `=` on an already-bound reference always means "assign to whatever I'm bound to," never "rebind me." `a` became `2`; `b` stayed `2` (unchanged, since it was only read); `ref`, still aliasing `a`, naturally shows `2` as well. A reference's binding is permanent, decided once, at declaration — this is fundamentally different from a pointer, which can be reassigned to a different address at any time.

Both scratch files are discarded now; `swapByRef`'s `a`/`b` parameters use this identical aliasing mechanism, bound to whatever the caller passes at each call.

### Mechanical Walkthrough

- `int& alias = score;` — **(a) first appearance of reference declaration syntax.** `int&` reads as "reference to `int`" — visually similar to LAB-08's `int*`, but `&` here is *part of the declaration's type*, a third role for `&` distinct from LAB-08's address-of operator and this same lesson's own upcoming parameter usage (all three unified by this unit's own explanation, not left as separate facts to memorize).
- `void swapByRef(int& a, int& b)` — **(a) first appearance of reference parameters.** `a` and `b` are bound to whatever the caller passes — `x` and `y` — for the duration of this one call.
- `swapByRef(x, y);` — **(a) first appearance of calling a reference-taking function with no `&` at the call site**, contrasted directly against LAB-08's `swap(&x, &y)`.

### CS Lens

A reference is, underneath, implemented using the identical address-passing machinery as a pointer (LAB-08) — the compiler generates the same code either way. What differs is entirely at the *language* level: references restrict what's expressible, ruling out an unbound or reassignable alias by construction, where a pointer permits both and leaves avoiding them to the programmer.

### SE Lens

`swapByRef(x, y)` reading exactly like a normal function call — no `&`, no visual signal that something unusual (an address, not a value) is being passed — is references' whole ergonomic argument: the *call site* looks identical to pass-by-value, while the *behavior* is pass-by-reference. This is also, per LAB-06's SE Lens on array decay, a real double-edged tradeoff: a reader cannot tell from `swapByRef(x, y)` alone, without checking the function's declaration, whether `x` and `y` might be modified — the same invisibility LAB-06 flagged for arrays, now general to any reference parameter.

### Run It

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== References Demo ===

swap(x, y):
  Before: x=10, y=25
  After:  x=25, y=10
```

Verified this session. Removing `&` from `swapByRef(int a, int b)` (reasoned through, matching LAB-05's own pass-by-value proof) would make the swap silently do nothing observable to `x`/`y` — the function would swap its own local copies and discard the result, exactly as LAB-05's `attemptChange` never touched its caller's `score`.

### Connection

Concept Unit 2 covers what a reference *cannot* do — the three restrictions that, together, are what make it safer than a pointer for this job.

---

## Concept Unit 2: What a Reference Cannot Do — and Why That's the Point

### The Problem

LAB-08 named three pointer dangers: wild (uninitialized), dangling (target destroyed), double-free. Does a reference share any of these risks?

### No isolated code lab for this step

The three restrictions below are each a direct answer to one of LAB-08's dangers — stated together since they form one coherent design decision, not three separate facts.

### Explanation

A reference must be **initialized at declaration** — `int& ref;` with no target does not compile at all, unlike a pointer, which compiles uninitialized and becomes "wild" (LAB-08) only when later dereferenced. A reference **cannot be null** — there is no reference equivalent of `nullptr`; it always refers to a real variable from the moment it exists. A reference **cannot be reassigned** to alias a different variable after binding — proven directly by Concept Unit 1's `scratch_reassign.cpp`, where `ref = b;` copied a value instead of rebinding.

Each restriction closes off exactly one pointer danger by making the *mistaken code itself* fail to compile, rather than compiling successfully and failing unpredictably at runtime:

| Pointer danger (LAB-08) | Reference's answer |
|---|---|
| Wild pointer (uninitialized) | Cannot exist uninitialized — compile error |
| Points to nothing (needs `nullptr` check) | Cannot be null — nothing to check |
| Reassigned to point somewhere unexpected | Cannot be reassigned — binding is permanent |

### CS Lens

This is the same principle LAB-02's `const` demonstrated at a smaller scale: turning a *runtime discipline* (the programmer promising not to leave a pointer wild, null-check before dereferencing, track what it currently points to) into a *compile-time guarantee* the compiler enforces automatically. References don't add new capability beyond pointers — they remove ways to misuse the capability that's already there.

### SE Lens

References do not eliminate every pointer danger — a **dangling reference** (Concept Unit 5) is still fully possible, because none of the three restrictions above say anything about the *lifetime* of what a reference is bound to, only about the binding itself being well-formed. This course's own rule of thumb (Concept Unit 4) reflects this precisely: use a reference by default; reach for a pointer only when nullability or reassignment is a genuine requirement, not a convenience.

### Connection

Concept Unit 3 puts a reference to work reading a large value cheaply — the second major reason references exist, beyond safety.

---

## Concept Unit 3: `const` References — Reading Without Copying

### The Problem

LAB-05's `getValidInput` took `const std::string& prompt` with a note to revisit it later. LAB-07 proved `std::string` manages its own growable storage — passing one by value (LAB-05's default) would copy that entire storage on every call, which is wasteful for a value the function only ever reads.

### Project Change

- **Reference Source:** LAB-05's `getValidInput` and `drawGrid` (this same series) — both quoted below, unchanged in behavior, with their parameter types now explained in full rather than previewed.
- **Files affected:** `main.cpp` — modified substantially (the swap demo from Concept Unit 1 is kept; the dungeon sketcher is added alongside it).
- **Change type:** Add (LAB-05's functions, brought into this file) + Refactor (their reference/value choices now justified explicitly).
- **Location:** Declarations/definitions alongside `swapByRef`; calls added to `main`.
- **Dependencies:** `std::string` (LAB-07), `do-while` input validation (LAB-04), nested-loop grid rendering (LAB-04, extracted in LAB-05).

### The New Code

```cpp
const int MIN_SIZE   =  2;
const int MAX_WIDTH  = 20;
const int MAX_HEIGHT = 10;

int  getValidInput(const std::string& prompt, int minValue, int maxValue);
void drawGrid(int width, int height);

int getValidInput(const std::string& prompt, int minValue, int maxValue) {
    int value = 0;
    do {
        std::cout << prompt << " (" << minValue << "-" << maxValue << "): ";
        std::cin >> value;
    } while (value < minValue || value > maxValue);
    return value;
}

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
```

### The Updated Project

```cpp
#include <iostream>
#include <string>   // ← new

const int MIN_SIZE   =  2;   // ← new
const int MAX_WIDTH  = 20;   // ← new
const int MAX_HEIGHT = 10;   // ← new

void swapByRef(int& a, int& b);
int  getValidInput(const std::string& prompt, int minValue, int maxValue);   // ← new
void drawGrid(int width, int height);                                        // ← new

void swapByRef(int& a, int& b) { /* unchanged, Concept Unit 1 */ }

int getValidInput(const std::string& prompt, int minValue, int maxValue) {   // ← new
    int value = 0;
    do {
        std::cout << prompt << " (" << minValue << "-" << maxValue << "): ";
        std::cin >> value;
    } while (value < minValue || value > maxValue);
    return value;
}

void drawGrid(int width, int height) { /* new — LAB-05's body, quoted above */ }

int main() {
    std::cout << "=== References Demo ===" << std::endl;
    std::cout << std::endl;
    int x = 10; int y = 25;
    std::cout << "  Before: x=" << x << ", y=" << y << std::endl;
    swapByRef(x, y);
    std::cout << "  After:  x=" << x << ", y=" << y << std::endl;

    std::cout << std::endl;
    std::cout << "=== Dungeon Map Sketcher ===" << std::endl;   // ← new

    int w = getValidInput("Enter dungeon width",  MIN_SIZE, MAX_WIDTH);    // ← new
    int h = getValidInput("Enter dungeon height", MIN_SIZE, MAX_HEIGHT);   // ← new

    std::cout << std::endl;
    drawGrid(w, h);                                                        // ← new

    return 0;
}
```

### Concept Lab

```cpp
// scratch_constref.cpp  (disposable — deliberately violates const)
#include <iostream>
#include <string>
int getValidInput(const std::string& prompt, int minValue, int maxValue) {
    prompt = "changed";
    return minValue + maxValue;
}
int main() { return 0; }
```

Compiling — verified this session:

```
$ g++ scratch_constref.cpp -o scratch_constref -std=c++17 -Wall -Wextra
scratch_constref.cpp:4:14: error: no match for 'operator=' (operand types are 'const std::string' ... and 'const char [8]')
    4 |     prompt = "changed";
      |              ^~~~~~~~~
...
      |   passing 'const std::string*' ... as 'this' argument discards qualifiers
```

**Worth being honest about the shape of this error, not just that it exists:** the real message is far longer than a clean one-line "cannot modify a const reference" — GCC's actual output walks through every overload of `std::string::operator=` it tried and rejected, several pages of near-match candidates. The line that actually matters is `discards qualifiers` — the compiler's way of saying "you're trying to modify something you only have read-only access to." This is a real, useful lesson in its own right: compiler errors are often long, and the actually-relevant line is not always the first one — reading for the specific phrase that names the problem (`discards qualifiers`, here) is a skill, not a formality.

This scratch file is discarded now; the real `getValidInput` never attempts to modify `prompt`.

### Explanation — the cost argument

Passing `std::string s` by value (LAB-05's default) copies every character on every call — for a short literal like `"Enter dungeon width"` the cost is trivial, but the *mechanism* doesn't know or care how long the string is; a 10,000-character string would copy all 10,000 bytes, every call. Passing `const std::string& s` passes only the address — 8 bytes on this 64-bit system (LAB-08's own pointer-size finding) — regardless of the string's actual length, with `const` guaranteeing (and, per the Concept Lab, enforcing at compile time) that the function cannot modify the caller's original through that access.

This course's rule of thumb: small types (`int`, `char`, `bool`, `float` — LAB-01) pass by value, since copying them costs about the same as passing a reference anyway; large types (`std::string`, `std::vector`, structs — LAB-10) pass by `const&` when only reading, by plain `&` when the function needs to modify the caller's original.

### Mechanical Walkthrough

- `const std::string& prompt` — **(a) first appearance of `const` combined with a reference parameter**, previewed without full explanation in LAB-05, explained fully here: `const` applies to what `prompt` refers to, not to `prompt`'s binding (which, per Concept Unit 2, is already permanently fixed for *any* reference, `const` or not) — it specifically forbids modifying the referenced `std::string` through this name.
- `void drawGrid(int width, int height)` — **(c) reappearing**, unchanged from LAB-05 — `width`/`height` stay plain `int` parameters (pass-by-value), per this unit's own rule of thumb: small types, copy is fine.

### CS Lens

`const T&` for large, read-only parameters is close to universal practice in real C++ codebases — it is the answer to "how do I read something big without paying to copy it" that references were built to provide, distinct from pointers' answer to "how do I modify something across a function boundary."

### Run It

```
$ g++ main2.cpp -o dungeon -std=c++17 -Wall -Wextra
$ printf "10\n4\n" | ./dungeon.exe
=== References Demo ===

  Before: x=10, y=25
  After:  x=25, y=10

=== Dungeon Map Sketcher ===
Enter dungeon width (2-20): Enter dungeon height (2-10): 
# # # # # # # # # # 
# . . . . . . . . # 
# . . . . > . . . # 
# # # # # # # # # #
```

Verified this session — swap demo followed by the full dungeon sketcher, both working from the same file.

### Connection

Concept Unit 4 names the decision rule this lesson has been building toward: pointer or reference, and when.

---

## Concept Unit 4: Pointer vs. Reference — The Decision Rule

### The Problem

LAB-08 and this lesson now both provide a way to let a function reach a caller's variable. Nothing has yet stated, plainly, which to reach for and when.

### No isolated code lab for this step

This is a design decision, not new syntax — a table, not a runnable proof.

### Explanation

| Situation | Use |
|---|---|
| Parameter that must never be absent | Reference (`int& x`) |
| Parameter that might legitimately be "nothing" | Pointer (`int* x`), checked against `nullptr` |
| Must be reassignable to refer to something else later | Pointer |
| Most function parameters, in practice | Reference |
| OS/hardware interfaces (later series) | Pointer — they speak pointers, not references |
| Returning a value from a function | Usually neither — return by value; return a reference only for specific, deliberate patterns not yet needed in this curriculum |

### CS Lens

This table is really one decision, asked once per parameter: does "this might not refer to anything" ever need to be a representable state? If yes, a reference cannot express it (Concept Unit 2) — reach for a pointer and `nullptr`. If no, a reference is strictly safer, per Concept Unit 2's three closed-off dangers, with no loss of capability for that specific job.

### SE Lens

Most function parameters in real, working C++ code turn out to be references, not pointers, precisely because "this parameter might be absent" is a genuinely rare requirement compared to "this parameter always refers to something real" — pointers remain essential (dynamic memory, OS interfaces, optional data), but as the exception reached for deliberately, not the default.

### Connection

Concept Unit 5 names the one danger references and pointers still share, despite everything Concept Unit 2 ruled out.

---

## Concept Unit 5: The Dangling Reference

### The Problem

Concept Unit 2 proved a reference cannot be null, cannot be uninitialized, cannot be reassigned — does that mean a reference is immune to LAB-08's dangling-pointer danger too?

### Concept Lab

```cpp
// scratch_danglingref.cpp  (disposable — deliberately reproduces LAB-08's danger, for references)
int& danger() {
    int local = 42;
    return local;
}
int main() { return 0; }
```

Compiling — verified this session:

```
$ g++ scratch_danglingref.cpp -o scratch_danglingref -std=c++17 -Wall -Wextra
scratch_danglingref.cpp:3:12: warning: reference to local variable 'local' returned [-Wreturn-local-addr]
    3 |     return local;
      |            ^~~~~
```

**Correcting a claim before repeating it:** an earlier version of this material labeled this pattern with a `// ERROR` comment, implying it fails to compile. Verified this session: it does not — `-Wreturn-local-addr` is a *warning*, the identical flag LAB-08 verified for the equivalent dangling-*pointer* mistake, not a hard compiler error. The program compiles successfully and produces a real reference to memory that no longer belongs to `danger`'s caller the moment `danger` returns — `local`'s stack frame (LAB-05) is reclaimed exactly as it would be for any function, and the returned reference now aliases memory the program doesn't own in any meaningful sense.

What that proves: Concept Unit 2's three restrictions govern only how a reference is *bound* — none of them said anything about how long the *bound-to* variable itself lives. A reference to a destroyed local variable is exactly as real a danger as LAB-08's dangling pointer, reached by an almost identical mistake, and caught (as a warning, not an error) by the identical compiler flag.

This scratch file is discarded now; no function in this lesson's own `main.cpp` returns a reference to a local variable.

### CS Lens

This is the one danger Concept Unit 2's restrictions cannot close off, because it isn't about the reference's own binding rules — it's about **object lifetime**, a property neither pointers nor references track automatically in C++. `CPP-S02-LAB-04` (RAII and the Rule of Three) is where this curriculum first builds real tools for managing lifetime deliberately, rather than relying on "don't do this" and a compiler warning.

### SE Lens

Treat `-Wreturn-local-addr` — for pointers (LAB-08) or references (here) — as a hard stop despite being "only" a warning: the fact that it compiles at all is a gap in what the compiler can guarantee, not permission to ship the code. This course's own standard flags (`-Wall -Wextra`) surface it; ignoring a warning in this specific category is exactly the habit LAB-03's Concept Unit 5 already warned against for a different (but equally silent) mistake.

### Connection

This closes every new reference concept in this lesson — the Closing section's Challenge (`applyDamage`) puts references to real, constructive use one more time before this lesson ends.

---

## Closing

### Connect the pieces

Follow `x` and `y` through `swapByRef` (Concept Unit 1): `int& a` and `int& b` bind to `x` and `y` for the duration of one call — no copy, no address explicitly written by the caller (Concept Unit 1's own contrast with LAB-08). `int temp = a;` reads through the alias; `a = b; b = temp;` write through it, exactly the way LAB-08's `*a = *b;` did, with none of the `*` noise. Meanwhile, `getValidInput`'s `const std::string& prompt` (Concept Unit 3) reads a string with zero copies, `const`-enforced (verified as a real, if verbose, compile error) never to be modified — and `drawGrid`'s plain `int width, int height` parameters stay pass-by-value on purpose, per Concept Unit 4's own rule, because copying two `int`s costs nothing worth optimizing away.

### What breaks without this

Contrast LAB-08's pointer `swap` against this lesson's `swapByRef` directly: `swap(&x, &y)` requires the caller to remember `&` at every call site — forgetting it (`swap(x, y)` on the pointer version) is a compile error, since `x` and `y` are `int`, not `int*`, so the mistake is at least caught immediately. But `int* a` left uninitialized (never demonstrated as running code in this lesson, per Concept Unit 2's own explanation of why references rule this out) compiles fine and fails only when dereferenced — a real, verified risk `swapByRef`'s `int&` parameters cannot reproduce at all, because a reference parameter is bound the instant the function is called, always to something real.

### Exercises

1. Reproduce Concept Unit 1's `scratch_reassign.cpp` yourself and, before running it, predict in writing what `a`, `b`, and `ref` will each print — then compile and check.
2. Build this lesson's `applyDamage` Challenge — `void applyDamage(int& currentHP, int damage, int& totalDamageTaken)`, capping damage at the remaining HP — and call it three times: `applyDamage(hp, 30, totalDamage)`, then `applyDamage(hp, 20, totalDamage)`, then `applyDamage(hp, 80, totalDamage)`, starting from `hp = 100, totalDamage = 0`. Verify your own output against real compiled results rather than assuming the arithmetic — a plausible-looking hand-computed total is exactly the mistake an earlier draft of this exact lesson made once (see the note below).
3. In your own `getValidInput`, temporarily change the parameter from `const std::string& prompt` to plain `std::string prompt` (pass by value), and confirm the function still behaves identically — then explain, without running anything further, exactly what changed about *cost*, not behavior.
4. Reproduce Concept Unit 5's dangling-reference warning, then actually call `danger()` and print `*`-style access to the result (via `int leaked = danger(); std::cout << leaked;` — note this reads the returned reference's value once before anything might overwrite that stack memory) and observe what prints — record whether it matches `42` or something else, and connect the result to Concept Unit 5's own warning that this is not a guaranteed outcome.

**A verified correction, worth knowing before attempting Exercise 2:** an earlier draft of this lesson's own `applyDamage` example claimed the third call would leave `totalDamage` at `130`. Run for real this session: after `hp` reaches `0` from `50 + 20`-style capping, the correct, verified total is `100` — `30 + 20 + 50` (the third call's damage capped at the `50` HP actually remaining), not `130`. This is not a hypothetical caution; it is the exact kind of hand-computed arithmetic error this schema's own verification requirement exists to catch, caught here on this lesson's own material.

### Definition of done

- [ ] `main.cpp` demonstrates `swapByRef` and the fully-referenced dungeon sketcher (`getValidInput`, `drawGrid`) in one file.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra` in its final, committed form.
- [ ] You can state, from Concept Unit 2's own proof, all three things a reference cannot do, and which pointer danger each one closes off.
- [ ] You can explain why `const std::string&` avoids a copy while a plain `std::string` parameter does not, in terms of what's actually passed at the call site.
- [ ] You can state, from Concept Unit 5's own verified finding, that a dangling reference compiles with only a warning — not an error — and why that matters.
- [ ] The `applyDamage` Challenge (Exercise 2) is built and its real output checked against this lesson's own corrected arithmetic, not assumed.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-09: reference-based swap and a fully const-correct dungeon sketcher"` — states why (safer, copy-free parameter passing, verified against LAB-08's pointer version) not just what changed.
