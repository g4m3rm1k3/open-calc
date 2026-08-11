# Lesson 82: A Variable Is a Place — Pointers, `&`, and `*`

**What you will build:** small, real C programs that print a
variable's own memory address, declare a pointer to it, read and write
through that pointer, and — the concrete payoff — a working `swap`
function, built only after proving directly why the obvious version
fails. The working feature is pointer-based mutation that actually
works. The transferable insight: in Python, a variable name is a label
attached to an object living somewhere the language deliberately never
shows; in C, a variable *is* a location in memory, with a real address,
and a pointer is nothing mysterious — just an ordinary variable whose
value happens to be another variable's address.

**What you need to know first:** Lesson 81 (compiling and running C) —
this lesson assumes comfort with `gcc`, `.c` files, and reading real
compiler/runtime output; nothing here revisits the compilation
pipeline itself.

---

## Concept Unit: The Problem — Python Never Shows You This

### The Problem

Python has `id()`, which returns *some* number associated with an
object — but it's opaque, not something Python code can use to
directly read or write memory, and Python functions can't use it to
let a function "reach back" and modify a caller's variable through
plain reassignment. C makes the address itself a first-class,
directly usable value.

### The New Code

```python
x = 42
print("value:", x)
print("id (memory location, sort of):", id(x))

def try_to_change(n):
    n = 99
    print("inside function, n is now:", n)

try_to_change(x)
print("after calling function, x is still:", x)
```

### Run It

```
value: 42
id (memory location, sort of): 11757000
inside function, n is now: 99
after calling function, x is still: 42
```

`id(x)` gives *a* number, but nothing about Python lets that number be
dereferenced, written through, or used to give `try_to_change` a way
to actually reach back into `main`'s `x`. `x` outside the function is
completely unaffected by what happened to `n` inside it — this
specific behavior, and *why* it happens, is the entire subject the
rest of this lesson makes concrete and controllable in C.

### CS Lens

Python's model here is often summarized as "pass by object reference"
— a name inside a function is bound to the *same object* the caller's
name was bound to, but reassigning that name inside the function
(`n = 99`) only changes what the *local* name points to, never the
caller's. C's model is simpler and more literal, worth previewing: C
is strictly **pass by value**, always — a function only ever receives
a *copy* of whatever was passed. The rest of this lesson is about what
that actually means, and the one real tool (a pointer) that works
around it deliberately.

---

## Concept Unit: `&` — Every Variable Has a Real Address

### The Problem

In C, a variable isn't just a name — it corresponds to an actual
location in the computer's memory, with a real, inspectable address.
Nothing about this is hidden the way it is in Python.

### Project Change

- **Reference Source:** No reference counterpart — first C-only
  concept in this curriculum with no Python analog to extend.
- **Files affected:** `address.c` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `stdio.h`.

### The New Code

```c
#include <stdio.h>

int main() {
    int x = 42;
    printf("value of x: %d\n", x);
    printf("address of x: %p\n", (void *)&x);
    return 0;
}
```

### Run It

```
$ ./address
value of x: 42
address of x: 0x7ffc6818f184
$ ./address
value of x: 42
address of x: 0x7ffe05b91794
```

The exact same program, run twice, reports two genuinely *different*
addresses for `x`. This isn't a bug — it's real proof of **ASLR**
(address space layout randomization), a security feature most modern
operating systems apply automatically: a program's memory layout is
deliberately shuffled on each run, making it harder for malicious code
to predict where specific data will live. `x`'s *value* is reliably
`42` every time; its *address* is not, and was never meant to be.

### Mechanical Walkthrough

- `int x = 42;` — already-established C variable declaration; worth
  restating precisely now: this line reserves a real, fixed-size block
  of memory (4 bytes, for a standard `int`) and stores `42` there.
- `&x` — **first appearance of the address-of operator.** `&` applied
  to a variable produces *that variable's own memory address* — not
  its value, its *location*. This is a genuinely different piece of
  information than `x` itself.
- `(void *)&x` — **first appearance of a cast to `void *`.** `&x`'s
  actual type is "pointer to `int`," specific to what it points at;
  casting it to `void *` (a generic pointer type, deliberately typeless)
  is done here purely because `printf`'s `%p` format specifier expects
  exactly that generic type — a real, standard C convention, not a
  workaround specific to this example.
- `%p` — **first appearance of the pointer-format specifier**, printing
  an address in hexadecimal, following `%d` (integers) and `\n`
  already established in Lesson 81.

### CS Lens

Treating a value's storage location as itself a first-class, directly
usable piece of data — not just an internal implementation detail the
language hides — is the foundational idea underneath everything else
in this lesson, and in C's memory model generally. Also recognized in:
Lesson 61's hex/binary viewer work treating a file's raw byte offsets
as meaningful, directly-addressable positions, and — a genuine,
worthwhile contrast — the fact that Python's `id()` exists specifically
*because* CPython's implementation happens to use an object's memory
address as a convenient, already-available unique identifier, even
though the language provides no way to use it as C's `&` does.

---

## Concept Unit: The Pointer — A Variable That Stores an Address

### The Problem

An address, once obtained via `&`, needs somewhere to be stored if
it's going to be used for anything beyond one immediate `printf` call
— exactly what an ordinary variable is for, just one whose value
happens to be an address rather than a number.

### The New Code

```c
#include <stdio.h>

int main() {
    int x = 42;
    int *p = &x;

    printf("x        = %d\n", x);
    printf("&x       = %p\n", (void *)&x);
    printf("p        = %p\n", (void *)p);
    printf("*p       = %d\n", *p);
    printf("&p       = %p (p's OWN address, different from what it stores)\n", (void *)&p);

    return 0;
}
```

### Run It

```
x        = 42
&x       = 0x7ffd7e9926ec
p        = 0x7ffd7e9926ec
*p       = 42
&p       = 0x7ffd7e9926f0 (p's OWN address, different from what it stores)
```

Four genuinely distinct pieces of information, confirmed directly:
`x`'s value (`42`), `x`'s address (`0x...26ec`), `p`'s value — which
*is* `x`'s address, confirmed by matching exactly — and `p`'s *own*
address (`0x...26f0`), four bytes later, entirely separate from what
`p` happens to be storing.

### Mechanical Walkthrough

- `int *p = &x;` — **first appearance of a pointer declaration.** The
  `*` here, in a declaration, means "`p` is a pointer to an `int`" —
  not the same `*` used for multiplication or dereferencing, a real,
  deliberate operator overload in C's own syntax worth naming
  explicitly, since it reads identically to the dereference operator
  used two lines later. `p`'s own type is "pointer to int" — it is
  *not* an `int` itself, even though what it stores is a number (an
  address, specifically).
- `p` (used alone, as in `printf("p = %p\n", (void *)p)`) — printing
  `p` directly prints *the address it stores* — `x`'s address — because
  that address *is* `p`'s value, the same way `42` is `x`'s value.
- `*p` — **first appearance of the dereference operator**, used as an
  expression rather than in a declaration. `*p` means "the value
  stored at the address `p` holds" — follow the pointer, retrieve what's
  actually there. Confirmed directly: `*p` prints `42`, matching `x`
  exactly, because `p` points at `x`'s own location.
- `&p` — address-of, applied to the pointer *itself*, not what it
  points to. `p` is a real variable, occupying its own real memory —
  this line proves that concretely: `&p` is a genuinely different
  address than `p`'s own *value* (`&x`), four bytes apart, matching a
  standard `int`'s size on this system, which is exactly where `x`'s
  own 4 bytes end and `p`'s own storage begins.

### CS Lens

A variable whose entire purpose is to hold another variable's location
— enabling one piece of code to refer to, and act on, a specific
memory location without needing to know or care about that location's
name — is the foundational mechanism behind: a hash table's stored
node references (Lesson 70), a linked list's `.next` field (Lesson
68), and a tree's `.left`/`.right` fields (Lesson 71) — every one of
those, all the way back, was conceptually *this exact idea*, just
expressed in Python through object references rather than raw
addresses, because Python was deliberately hiding the address layer
this lesson just made visible.

---

## Concept Unit: Writing Through a Pointer

### The Problem

Dereferencing to *read* a value is one direction; the more powerful
half is using that same `*p` syntax to *write* through a pointer —
modifying the original variable, from somewhere that only has its
address, not its name.

### The New Code

```c
#include <stdio.h>

int main() {
    int x = 42;
    int *p = &x;

    printf("before: x = %d, *p = %d\n", x, *p);

    *p = 99;   // write THROUGH the pointer

    printf("after:  x = %d, *p = %d\n", x, *p);

    return 0;
}
```

### Run It

```
before: x = 42, *p = 42
after:  x = 99, *p = 99
```

`x` was never directly assigned anywhere after its initial
declaration. `*p = 99;` is the only assignment in this program besides
the first line — and `x` changed anyway, because `*p = 99` doesn't
create or modify a new value called `*p`; it reaches through `p` to
the *exact memory location* `p` points at (which is `x`'s own
location) and overwrites what's stored there directly.

### Mechanical Walkthrough

- `*p = 99;` — **first appearance of dereference-and-assign, as
  opposed to dereference-and-read** from the previous unit. The `*p`
  on the *left* side of `=` means "the location `p` points at" — an
  assignment target, not a value being read — while the `*p` used
  inside `printf`'s argument list (on the right side, as a value) means
  "read what's at the location `p` points at." Same syntax, genuinely
  different role, determined entirely by which side of `=` it's on —
  already-familiar in spirit from ordinary variable assignment
  (`x = 99` versus reading `x`), just extended one level of indirection
  further.

### CS Lens

Modifying a value through a reference to its location, rather than
through the original name that created it, is the precise mechanism
underneath every earlier lesson's use of mutable shared state through
references — Lesson 72's `LRUCache` mutating a `Node`'s `.value`
through a reference stored in a hash map, Lesson 78's `MiniGit` reading
and writing through file paths (themselves a kind of named location) —
all conceptually this same "the name and the location are different
things, and you can act through the location" idea, now made
completely explicit and directly controllable.

---

## Concept Unit: Pass-by-Value — Why `swap` Fails Without Pointers

### The Problem

C functions receive *copies* of their arguments, always — this is
worth proving concretely, not just stated, because it explains exactly
why a natural-looking `swap` function does nothing useful, and sets up
precisely what pointers fix.

### The New Code

```c
#include <stdio.h>

void broken_swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    printf("inside broken_swap: a = %d, b = %d\n", a, b);
}

int main() {
    int x = 1, y = 2;
    printf("before: x = %d, y = %d\n", x, y);
    broken_swap(x, y);
    printf("after:  x = %d, y = %d\n", x, y);
    return 0;
}
```

### Run It

```
before: x = 1, y = 2
inside broken_swap: a = 2, b = 1
after:  x = 1, y = 2
```

Real, concrete proof: `a` and `b` genuinely *do* swap, inside
`broken_swap` — confirmed by the middle line. And `x`/`y` in `main`
are completely unaffected — confirmed by the last line, identical to
the first. The swap happened; it just happened to two variables
(`a`, `b`) that only ever existed as private copies, gone the moment
`broken_swap` returned.

### Mechanical Walkthrough

- `void broken_swap(int a, int b)` — when `broken_swap(x, y)` is
  called, `a` and `b` are **brand-new, separate variables**, each
  initialized by *copying* `x`'s and `y`'s current values — not
  references to `x` and `y` themselves, not aliases, genuinely
  independent memory. This is what "pass by value" concretely means in
  C: every function parameter is a fresh copy.
- The three-line swap inside the function (`temp = a; a = b; b = temp;`)
  operates entirely on that local copy's own memory — real, correct
  swapping logic, applied to variables that have no connection back to
  `main`'s `x` and `y` beyond their initial values.
- When `broken_swap` returns, `a` and `b` cease to exist — their
  memory is reclaimed — and `main`'s `x` and `y`, never having been
  touched at all, remain exactly as they started.

### CS Lens

Pass-by-value's most important consequence, worth stating precisely
now that it's been proven rather than just claimed: a C function can
never modify a caller's variable through an ordinary parameter — full
stop, no exceptions — the *only* way for a function to affect a
caller's data is to be given that data's *address*, explicitly, and to
write through it. This is a genuinely different rule than Python's own
model (where a mutable object passed to a function *can* be modified
in place through methods, even though reassigning the parameter name
itself can't reach the caller), and worth not conflating with it.

---

## Concept Unit: `swap`, Fixed — Passing Pointers

### The Problem

Given the previous unit's proof, the fix is now exactly predictable:
`broken_swap` needs the *addresses* of `x` and `y`, not their values,
so it can reach back and modify the original locations directly.

### Project Change

- **Reference Source:** `broken_swap.c` from the previous unit — this
  is a direct, deliberate fix to that exact function.
- **Files affected:** `real_swap.c` (new file, based on
  `broken_swap.c`'s structure).
- **Change type:** modify (conceptually the same function, corrected).
- **Location:** the function signature and body both change.
- **Dependencies:** `&` and `*`, both already established.

### The New Code

```c
#include <stdio.h>

void real_swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
    printf("inside real_swap: *a = %d, *b = %d\n", *a, *b);
}

int main() {
    int x = 1, y = 2;
    printf("before: x = %d, y = %d\n", x, y);
    real_swap(&x, &y);
    printf("after:  x = %d, y = %d\n", x, y);
    return 0;
}
```

### Run It

```
before: x = 1, y = 2
inside real_swap: *a = 2, *b = 1
after:  x = 2, y = 1
```

`x` and `y` in `main` are genuinely, permanently swapped this time —
the final line proves it, differing from the first line, unlike the
broken version's identical before/after.

### Mechanical Walkthrough

- `void real_swap(int *a, int *b)` — **the entire fix, in the
  signature.** `a` and `b` are now pointers — still copies, still
  pass-by-value (C never stops being pass-by-value; nothing about this
  contradicts the previous unit) — but what's being copied is no
  longer `x` and `y`'s *values*, it's their *addresses*. The copy
  itself (of an address) is cheap and harmless; what matters is that
  the copied address still points at the exact same original memory.
- `real_swap(&x, &y);` — the call site changes to match: `&x` and `&y`,
  not `x` and `y` — passing *locations*, deliberately, not values.
- `int temp = *a; *a = *b; *b = temp;` — the same three-line swap
  logic as before, but every reference to the parameters is now
  dereferenced first (`*a`, `*b`) — reading and writing through the
  pointers, reaching all the way back to `main`'s actual `x` and `y`
  memory, not some local copy.

### CS Lens

Passing an address instead of a value, specifically so a function can
modify data it doesn't itself own, is a real, named technique —
**pass by reference**, simulated in C through explicit pointers (C has
no true built-in pass-by-reference the way some other languages do;
this lesson's `&`/`*` pattern *is* how C achieves the same effect).
Also recognized in: any function anywhere that needs to report more
than one result back to its caller (a real, common reason to reach for
this pattern, beyond just `swap`), and out-parameters in APIs across
many languages that lack multiple return values as a native feature.

---

## Connect the Pieces

```c
#include <stdio.h>

void real_swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 1, y = 2;
    printf("&x = %p, &y = %p\n", (void *)&x, (void *)&y);
    printf("before: x = %d, y = %d\n", x, y);

    real_swap(&x, &y);

    printf("after:  x = %d, y = %d\n", x, y);
    printf("(x and y themselves never moved -- only what's stored AT their addresses changed)\n");

    return 0;
}
```

Every concept from this lesson in one program: `&x`/`&y` obtain real
addresses; `real_swap`'s `int *a, int *b` parameters receive copies of
those addresses (pass-by-value, unavoidable, even here); `*a`/`*b`
dereference to reach the original memory; and the result — `x` and `y`
genuinely swapped in `main` — is only possible because a pointer
carried a location across a function boundary that an ordinary
by-value `int` parameter never could.

## What Breaks Without This

Already proven directly, in full, by `broken_swap.c` earlier in this
lesson: without pointers, a function that looks like it should swap
two variables does real work, on real local variables, and accomplishes
nothing visible to its caller — silently, with no error, no warning,
just a program that quietly does less than its code appears to do.
This is worth sitting with as this lesson's central lesson: the bug
isn't a crash, it's code that *looks* correct and *is* correct, for
variables that turn out not to be the ones that mattered.

## Exercises

- Write a function `increment(int *n)` that adds 1 to whatever `n`
  points at, and confirm calling `increment(&x)` really does increase
  `x` in the caller.
- Write a function that takes two `int *` parameters and sets one to
  the smaller value, the other to the larger — a "sort two numbers"
  function using pointers instead of a return value.
- Declare a pointer `int *p` without initializing it (no `= &x`), and
  research what a compiler warning about an "uninitialized" or "wild"
  pointer means — do *not* dereference it, just observe the warning
  `gcc` produces.
- Declare `int **pp = &p;` (a pointer *to* a pointer) and print `p`,
  `*pp`, and `**pp` — confirm `*pp` equals `p` itself, and `**pp`
  reaches all the way through to `x`'s actual value.

## Definition of Done

- [ ] `address.c` compiled and run at least twice, confirming the
      printed address genuinely differs between runs (ASLR), while the
      value does not.
- [ ] The four-value pointer comparison (`x`, `&x`, `p`, `*p`, `&p`)
      run for real, confirming `p == &x` and `&p != p`.
- [ ] Writing through a pointer (`*p = 99;`) confirmed to change the
      original variable, on your own machine.
- [ ] `broken_swap.c` run and confirmed to fail exactly as described —
      the inner values swap, the caller's `x`/`y` do not.
- [ ] `real_swap.c` run and confirmed to actually swap `main`'s `x`
      and `y`, proving the fix.
- [ ] Can explain out loud, without looking at the code, why C is
      correctly described as "always pass by value," even after
      building a function that successfully modifies a caller's
      variables.
- [ ] Committed, with a message explaining *why* — e.g. `"Pointers
      from scratch: & for a variable's address, * to read or write
      through it, and why swap needs pointers under strict pass-by-
      value"` — not `"add pointer examples"`.
