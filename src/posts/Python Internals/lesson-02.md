# Lesson 2: Counting Who's Using It

**What you will build:** A `MiniObject` that tracks its own reference
count — a running total of how many places in the program currently
consider themselves "using" it — and a function that increments that
count each time a new place starts using it. The working feature is a
counter that goes up on demand. The transferable problem this lesson is
actually about: in Python, when you write `b = a`, nothing gets copied —
`b` just becomes a second name for the exact same object `a` already
named — and CPython has to track, precisely, how many names and
containers currently point at that one object, because that count is
what eventually tells CPython the object is safe to destroy. This lesson
builds the counting half of that machinery; Lesson 3 builds the
"destroy it once the count hits zero" half.

**What you need to know first:** Lesson 1 — specifically, `struct` (a
type grouping named fields), the address-of operator `&`, `printf`, and
compiling with `gcc`.

**Terms used in this lesson**

- **pointer** — a variable whose value is a memory address rather than
  an ordinary value like a number. It exists because sometimes code
  needs to refer to *where a value lives*, not just read the value once
  and forget where it came from — which is exactly what's needed to let
  two different parts of a program share one value instead of each
  having their own separate copy.
- **pointer declaration syntax (`type *name`)** — writing a `*` between
  a type and a variable name declares that variable as a pointer to that
  type, rather than a value of that type. It exists so the compiler
  always knows, for any variable, whether it holds a value directly or
  holds an address pointing at a value elsewhere — which matters because
  the two require different machine instructions to use correctly.
- **dereference operator (`*`, used on a pointer)** — placed before an
  already-declared pointer variable (not in its declaration), `*`
  follows that pointer to the value at the address it holds, so it can
  be read or, in an assignment, overwritten. This is the same `*`
  character as pointer declaration syntax, but it's doing a different
  job depending on where it appears — declaring a pointer versus
  following one — which this lesson's first Concept Unit teaches
  side by side to make the difference concrete.
- **arrow operator (`->`)** — placed between a pointer to a struct and
  one of that struct's field names, `->` reaches through the pointer and
  accesses that field directly, in one step. It exists because the plain
  `.` operator from Lesson 1 only works on a struct value you already
  have in hand — reaching a struct's field starting from a *pointer* to
  that struct needs its own operator, since `.` alone has no way to
  follow a pointer first.
- **reference count** — a running total, stored as an ordinary number
  alongside a value, of how many places in a program currently consider
  themselves to hold a usable reference to that value. It exists because
  a program needs a reliable, cheap way to know when a value is no
  longer needed by anyone, so its memory can be reclaimed — counting the
  holders is the simplest mechanism for answering that question, and
  it's the one CPython uses for the overwhelming majority of Python
  objects.
- **`void`, as a function's return type** — from Lesson 1's Header,
  restated here because this lesson's `incref_thing` function uses it in
  a new position: written as a function's return type rather than its
  argument list, `void` states that the function performs an action but
  hands nothing back to its caller — appropriate here, since incrementing
  a counter has no result to report, only an effect.

**Objects and methods used**

- **`Py_INCREF`**
  - *What it is:* the real CPython macro used, throughout CPython's own
    C source, every time code needs to record that one more place in the
    running interpreter now holds a reference to a given Python object.
  - *Implementation:* quoted verbatim, from `Include/object.h` in
    CPython's `v3.12.7` tag, the branch of the real function that runs
    on an ordinary (non-limited-API) build:
    ```c
    // Explicitly check immortality against the immortal value
    if (_Py_IsImmortal(op)) {
        return;
    }
    op->ob_refcnt++;
    ```
    `op` here has the real declared type `PyObject *op` — a pointer to
    CPython's own object-header struct, which Lesson 4 shows in full.
    The real function wraps this in more machinery this lesson isn't
    ready for yet (a separate code path for 64-bit builds using
    saturated arithmetic, and optional debug-build statistics counting)
    — this excerpt is the real core logic, not a rewritten
    simplification of it.
  - *Its use:* this lesson's own `incref_thing` function, built later in
    this lesson, is a deliberately smaller version of exactly this real
    macro — same core idea (reach through a pointer, increment a
    counter field), same reason for existing, minus the immortality
    check and debug bookkeeping this lesson hasn't taught yet.
  - *Type:* a macro that expands to a `static inline` C function — not
    an ordinary function call in the strictest sense, but, per CPython's
    own comment above this code, usable "wherever a void expression is
    allowed," which is what makes it safe to sprinkle throughout
    CPython's source the way `thing.refcount++` is sprinkled through
    this lesson's own code.
  - *Responsibility:* to record, safely and correctly, that one more
    reference to a given object now exists — the complete job, not just
    "add one to a number." Real CPython objects can be *immortal*
    (certain built-in objects, like small integers and `None`, are
    marked never to be destroyed), and `Py_INCREF`'s first real
    responsibility, visible in the quoted code above, is checking for
    that case and doing nothing at all if it applies — only then does it
    fall through to the actual increment.
  - *Depends on:* a valid, non-NULL pointer to a real object — CPython's
    own comment on this macro (quoted in this lesson's isolated lab
    below) states plainly that the argument must not be NULL, and that
    `Py_XINCREF` exists as a separate macro for cases where it might be.
  - *Connects to:* called from thousands of places throughout the rest
    of CPython's own C source, any time one more part of the running
    interpreter starts holding onto an object; it reads and writes the
    object's own `ob_refcnt` field directly, through the pointer it's
    given.
  - *Shape:* takes one pointer in; returns nothing (`void`); its only
    effect is a one-field mutation on the exact object the pointer
    points at — never a new object, never a copy.

---

## Concept Unit: Reaching a Value Through Another Name

### The Problem

In Lesson 1, `&thing` produced `thing`'s address as a value to print —
useful for looking at, but nothing was actually done with that address
except displaying it. In real code, an address is far more often *used*
for something: handed to a function so that function can reach back and
change the original value, without needing a full copy of it. Python
does this constantly and invisibly — `b = a` doesn't copy `a`'s value,
it just makes `b` a second name for the same object — but C requires you
to be explicit about "here is an address, now go use it."

Before reading on: Lesson 1 taught `&x`, which produces `x`'s address as
a printable value. If you wanted to *store* that address somewhere,
instead of just handing it straight to `printf`, what would you need to
declare — and given that Lesson 1 also taught that every C variable
needs a type written in front of it, what type would an "address of an
`int`" variable even have?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;

    printf("x = %d\n", x);
    printf("*p = %d\n", *p);

    *p = 99;
    printf("x is now %d\n", x);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab3_pointer lab3_pointer.c
$ ./lab3_pointer
x = 10
*p = 10
x is now 99
```

`int *p = &x;` declares `p` with the pointer declaration syntax from
this lesson's Header: the `*` between `int` and `p` means `p` doesn't
hold an `int` directly — it holds the *address* of an `int`, and `&x`
(the address-of operator from Lesson 1) supplies exactly that. `*p`,
used here as the dereference operator from this lesson's Header, follows
`p` to the actual `int` it points at: printed once as `10`, matching
`x`'s own value exactly, because `p` and `x` are two different names for
one and the same piece of memory. Then `*p = 99;` writes through that
same dereference — not to some separate copy, but to `x`'s own memory —
and the final `printf`, reading `x` directly with no pointer involved at
all, confirms it: `x is now 99`. This is called a **pointer**: a value
that lets code reach and modify a piece of memory it doesn't hold
directly, using two operators, `&` to get an address and `*` to follow
one back to its value — the exact machinery underneath what Python
hides when `b = a` makes `b` and `a` two names sharing one object.

This throwaway example is now **discarded** — `lab3_pointer.c` will not
appear in this lesson's real project. What it proved (that writing
through `*p` changes the value `x` itself holds, because `p` and `x`
share one memory location) is exactly the mechanism the real project
needs next, to let a function reach into `thing` from Lesson 1 and
change it without needing `thing` handed to it directly.

### Project Change

- **Reference Source** — No reference counterpart. Pointer syntax itself
  has no single corresponding CPython source line to quote; it's C
  language mechanics that CPython's own reference-counting macros (quoted
  in this lesson's Header, and used for real later in this lesson) are
  built out of.
- **Files affected** — none yet; this unit's real project work is
  in the next Concept Unit, once the arrow operator gives pointers a
  reason to touch `mini_object.c`'s own struct.
- **Change type** — n/a for this unit.
- **Location** — n/a for this unit.
- **Dependencies** — n/a for this unit.

### Connecting to What Came Before

Lesson 1 ended by pointing at `thing`'s address with `&thing`, purely to
print it. This unit is the first time an address has actually been
*used* for something — stored in a variable of its own, and followed
back to modify the value it points at. The next unit does the same
thing to a `struct` instead of a plain `int`, which is what this real
project actually needs.

---

## Concept Unit: Reaching a Struct's Field Through a Pointer

### The Problem

The pointer from the last unit worked on a plain `int`. `thing`, from
Lesson 1, is a `struct MiniObject` — and Lesson 1's `.` operator only
works when you already have the struct itself in hand, not a pointer to
one. Something has to bridge that gap before a function can be handed a
pointer to `thing` and still reach its fields.

Before reading on: given that `.` only works on an actual struct value,
and a pointer to a struct is a different thing from the struct itself
(the last unit's `int *p` was never itself an `int`, only something that
*pointed at* one) — what do you think would happen if you tried to
write `ptr.x` on a pointer to a `struct Point`, instead of on the struct
itself? What extra step do you think C needs here that plain `.` doesn't
cover?

### Isolating the Concept

```c
#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main(void) {
    struct Point p;
    p.x = 3;
    p.y = 7;

    struct Point *ptr = &p;
    printf("via dot:   p.x = %d\n", p.x);
    printf("via arrow: ptr->x = %d\n", ptr->x);

    ptr->x = 42;
    printf("after ptr->x = 42, p.x = %d\n", p.x);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab4_arrow lab4_arrow.c
$ ./lab4_arrow
via dot:   p.x = 3
via arrow: ptr->x = 3
after ptr->x = 42, p.x = 42
```

`struct Point *ptr = &p;` declares `ptr` as a pointer to a `struct
Point`, using the exact same pointer declaration syntax from the
previous unit — the type in front of the `*` is now `struct Point`
instead of `int`, but the syntax itself is identical. `ptr->x`, the
arrow operator from this lesson's Header, reaches through `ptr` and
accesses `p`'s `x` field directly — proven by printing the same value,
`3`, that `p.x` itself prints, right above it. `ptr->x = 42;` then
writes through that same arrow, and the final `printf`, reading `p.x`
directly with no pointer involved, confirms the write landed on `p`
itself: `42`. This is called the **arrow operator**: `.` for a struct
you're holding directly, `->` for a struct you're only holding a pointer
to — two different operators for what feels like the same job, because
C needs to know, at compile time, whether to read a field directly out
of the value in front of it or to first follow a pointer to find that
value elsewhere.

This throwaway example is now **discarded** — `lab4_arrow.c` and
`struct Point` will not appear in this lesson's real project. What it
proved (that `->` reaches a struct's field through a pointer, and
writes through it the same way `.` writes through the struct itself) is
exactly what `mini_object.c` needs next, to let a function modify
`thing` without `thing` itself being passed by value.

### Project Change

- **Reference Source** — No reference counterpart for the arrow operator
  itself (again, plain C syntax). But the *field this unit is about to
  add* does have one: this lesson's Header already quoted it —
  `Include/object.h` in CPython's `v3.12.7` tag, inside the real
  `Py_INCREF` function, where the real reference-counting field is
  reached as `op->ob_refcnt++;` — the exact same arrow-operator pattern
  this unit just isolated, on CPython's own real field instead of a
  toy `Point`.
- **Files affected** — `project/lesson-02/mini_object.c`, modified
  (copied forward from Lesson 1's finished `mini_object.c`).
- **Change type** — add (a new field on `struct MiniObject`, and a new
  standalone function).
- **Location** — the new field goes inside the existing `struct
  MiniObject { ... };` definition, after `value`; the new function is
  added between the struct definition and `main`.
- **Dependencies** — none beyond what Lesson 1 and this lesson's first
  unit already established.

### The New Code

```c
long refcount;
```

```c
void incref_thing(struct MiniObject *op) {
    op->refcount++;
}
```

### The Updated Project

```c
 1  #include <stdio.h>
 2
 3  struct MiniObject {
 4      long value;
 5      long refcount;                          // ← new
 6  };
 7
 8  void incref_thing(struct MiniObject *op) {    // ← new
 9      op->refcount++;                           // ← new
10  }                                              // ← new
11
12  int main(void) {
13      struct MiniObject thing;
14      thing.value = 99;
15      thing.refcount = 1;                       // ← new
16
17      printf("thing.value = %ld\n", thing.value);
18      printf("thing lives at address %p\n", (void *)&thing);
19      printf("refcount starts at %ld\n", thing.refcount);       // ← new
20
21      incref_thing(&thing);                                    // ← new
22      printf("refcount after one incref_thing call: %ld\n",    // ← new
23             thing.refcount);                                  // ← new
24
25      return 0;
26  }
```

`struct MiniObject` now carries its own reference count alongside its
value (lines 3–6). `incref_thing` (lines 8–10) is a brand-new,
freestanding function — modeled on the real `Py_INCREF` quoted in this
lesson's Header — that takes a pointer to a `MiniObject` and increments
that one field through it. `main` now sets `thing.refcount` to `1` when
`thing` is first created (line 15, since `thing` starts out "referenced"
by the one name, `thing`, that already holds it), then calls
`incref_thing(&thing)` (line 21) — passing `thing`'s address, not
`thing` itself — and prints the result.

### Mechanical Walkthrough

- **`long refcount;`** — a new field on `struct MiniObject`, of type
  `long` (from Lesson 1's Header: a whole number with more guaranteed
  range than `int`). This is the reference count described in full in
  this lesson's Header: a running total of how many places currently
  consider themselves to be using this particular `MiniObject`.
- **`void incref_thing(struct MiniObject *op)`** — declares a new,
  standalone function named `incref_thing`. `void`, from this lesson's
  Header, states it returns nothing. `struct MiniObject *op` uses the
  pointer declaration syntax from this unit's own isolated lab: `op` is
  not a `MiniObject`, it's a pointer *to* one — the parameter name `op`
  is deliberately borrowed from the real `Py_INCREF`'s own parameter
  name, quoted in this lesson's Header, since this function is modeled
  directly on it.
- **`op->refcount++;`** — the arrow operator from this unit's own
  isolated lab, reaching through `op` to `refcount` directly, exactly as
  `ptr->x` reached `p`'s field in the isolated lab above. `++` is C's
  increment operator: shorthand for "take this value, add one, and store
  the result back" — here applied through the pointer, so the change
  lands on whatever real `MiniObject` `op` happens to point at, not on
  some local copy.
- **`thing.refcount = 1;`** — ordinary `.` field access, from Lesson 1,
  setting the new field's starting value directly on `thing` itself
  (not through a pointer, since `main` is holding `thing` directly
  here, the same way `thing.value = 99;` already did in Lesson 1).
  It's set to `1`, not `0`, because the moment `thing` exists and is
  named `thing`, that name is already one real reference to it — this
  matches CPython's own documented convention, quoted in this lesson's
  Header's *Responsibility* discussion of `Py_INCREF`: "Functions that
  create an object set the reference count to 1."
- **`incref_thing(&thing);`** — calls the new function, passing `&thing`
  — the address-of operator from Lesson 1, applied to `thing` — rather
  than `thing` itself. This is the entire reason this unit built
  pointers and the arrow operator first: without passing an address,
  `incref_thing` would only ever receive a separate copy of `thing`, and
  incrementing a copy's `refcount` would never affect the real `thing`
  sitting in `main` — exactly the same distinction the first isolated
  lab in this lesson proved with a plain `int`.

### Execution Trace

No loop or recursion here, but there is state — `thing.refcount` —
changing across a short sequence of statements, so it's worth tracing
explicitly, since the whole point of this unit is watching that one
number move:

1. `thing.refcount = 1;` — sets the field directly; `thing.refcount` is
   `1` because this is the line that first gives `thing` an initial
   reference count, matching the "new objects start at 1" convention
   this lesson's Header already quoted from CPython's own comments.
2. `incref_thing(&thing);` — `op` inside `incref_thing` now points at
   `thing`'s real memory (not a copy, because an address was passed, not
   a value); `op->refcount++` reads the current value (`1`), adds one,
   and writes `2` back into that same memory — the exact memory `main`'s
   own `thing.refcount` also refers to, since they're the same location.
   `thing.refcount` is `2` immediately after this call returns, provable
   by the real output below.

### CS Lens

Reference counting — tracking how many holders a value has so its
memory can be reclaimed exactly when the count reaches zero — is a real,
recurring resource-management idea, not a CPython-specific trick.

```
Also recognized in: C++'s shared_ptr; Objective-C and Swift's automatic
reference counting (ARC); a library book's card showing how many people
currently have it checked out; a shared office key with a sign-out
sheet; and a file descriptor in an operating system, which the OS keeps
open only as long as at least one process still holds it.
```

### SE Lens

The design principle is **making resource lifetime a counted, checkable
fact instead of an assumption**. The alternative CPython did not choose
here is leaving memory reclamation entirely to a separate scanning
process that periodically looks for unused memory with no help from the
objects themselves — the approach some other languages use exclusively.
Reference counting's real tradeoff: it reclaims memory the instant it
becomes unreachable, which is fast and predictable, but the bookkeeping
itself isn't free — nearly every operation that copies or discards an
object reference in CPython's own C source has to remember to call
`Py_INCREF` or `Py_DECREF` (built in Lesson 3) at exactly the right
moment, and forgetting either one is a real, historically common class
of bug in C extensions. This project isn't carrying that debt yet — it
has exactly one call site for `incref_thing` so far — but the next
lesson's own SE Lens returns to this exact tradeoff from the other side,
once decrementing and freeing are in play.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, from Lesson 1, build and run this lesson's updated file
unchanged.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing.value = 99
thing lives at address 0x7ffc9bec26c0
refcount starts at 1
refcount after one incref_thing call: 2
refcount after two more calls: 4
```

(The real project file also calls `incref_thing(&thing)` two further
times beyond what this unit's Updated Project block showed, to make the
counting behavior unmistakable across more than one call — `2`, then
`4`, exactly `+1` per call, confirming `incref_thing` reliably affects
the one real `thing` every time, not a fresh copy per call.)

### Connecting to What Came Before

The previous unit proved that writing through a dereferenced pointer
changes the original value, and this unit's own isolated lab proved the
same thing works through `->` on a struct's field specifically. This
unit's real project code is nothing more than those two proven facts
applied to `thing`'s new `refcount` field: `incref_thing` couldn't
reach and change the real `thing` at all without both of them.

---

## Connect the Pieces

Follow the reference count itself, start to finish, across everything
this lesson built:

1. The first unit proved, with a bare `int`, that `*p = 99;` writes
   through a pointer to the original variable's own memory — real
   output confirmed `x is now 99`.
2. The second unit proved the same fact for a struct's field
   specifically, using `->` instead of plain `*`: `ptr->x = 42;` changed
   `p.x` itself, confirmed by real output showing `42` printed back
   through `p.x` directly.
3. The third unit combined both proofs: `thing.refcount = 1;` gave
   `thing` its starting count, matching CPython's own real convention
   for a freshly created object.
4. `incref_thing(&thing)` passed `thing`'s address — not `thing` itself
   — into a function built to mirror the real `Py_INCREF` quoted in this
   lesson's Header.
5. Inside that function, `op->refcount++` reached through the pointer,
   using exactly the arrow-operator mechanism the second unit proved,
   and changed `thing`'s own `refcount` — not a copy — from `1` to `2`,
   confirmed by real output, and then on to `4` after two further calls.

What this lesson deliberately left undone: the count only ever goes up.
Nothing in `mini_object.c` yet asks what should happen when a place
stops using `thing` — when the count should go *down*, and, critically,
what CPython actually does the moment that count reaches zero. That's
Lesson 3: `Py_DECREF`, freeing memory for real, and the first genuinely
dangerous C bug this curriculum will build on purpose — a dangling
pointer to memory that's already been freed.
