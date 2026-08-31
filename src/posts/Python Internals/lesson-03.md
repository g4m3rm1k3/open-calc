# Lesson 3: Letting Go

**What you will build:** `thing` moves off the stack and onto the heap —
allocated with `malloc` instead of declared as an ordinary local variable
— and gains a matching `decref_thing` function that decrements its
reference count and, only once that count reaches zero, actually frees
its memory. The working feature is a `MiniObject` that gets created,
shared, released, and correctly destroyed, all through code you can
watch run. The transferable problem this lesson is actually about: in
Lesson 2, `incref_thing` only ever counted up — nothing ever came back
down, and nothing was ever actually freed, because `thing` lived on the
stack and would have vanished on its own the moment `main` returned
regardless of what its `refcount` said. Reference counting only means
anything for memory that *doesn't* automatically disappear — this lesson
gives `thing` that kind of memory, then builds the exact mechanism,
modeled on CPython's own real `Py_DECREF`, that decides the precise
moment it's safe to let it go.

**What you need to know first:** Lesson 1 (`struct`, `&`, `printf`,
compiling) and Lesson 2 (pointers, the arrow operator `->`, the
`refcount` field, and `incref_thing`).

**Terms used in this lesson**

- **heap** — a region of memory a running program can request from the
  operating system at any point while it's running, whose contents stay
  put until the program explicitly gives them back. It exists because
  the stack memory Lesson 1's `thing` lived in is automatically reclaimed
  the instant the function that declared it returns — fine for a value
  that's only needed briefly, but useless for anything, like a
  reference-counted object, that has to be able to outlive the exact
  function call that created it.
- **`NULL`** — a standard C constant meaning "this pointer points at
  nothing valid." It exists because a pointer variable always holds
  *some* address-shaped value, even before you've deliberately pointed
  it at anything real; `NULL` gives code an agreed-on way to say "this
  address is not one you should ever read or write through," and a
  pointer explicitly set to `NULL` after its target is freed is how this
  lesson marks "this memory is gone, don't use this pointer again."
- **dangling pointer** — a pointer that still holds the address of a
  piece of memory that has already been freed. It exists as a named
  hazard because C provides no automatic protection against reading or
  writing through one — the memory it points at may already have been
  handed back to the operating system, or reused for something
  completely unrelated, and nothing about the pointer itself changes to
  warn you.
- **`if` (conditional statement)** — a statement that runs the block of
  code following it only when a given condition evaluates to true, and
  skips that block entirely otherwise. It exists because not every
  action in a program should always happen — freeing `thing`'s memory,
  in this lesson, must happen only on the one specific decrement that
  brings its reference count to exactly zero, never on any of the
  decrements before that.
- **relational operator (`==`)** — compares two values and produces true
  if they're equal, false otherwise. It exists as a distinct operator
  from the single `=` (assignment, used throughout Lessons 1 and 2 to
  store a value into a variable) because C treats "store this value" and
  "check whether these are equal" as two completely different
  operations that happen to look similar; using `=` where `==` is meant
  is a famous, easy C mistake precisely because they look so alike but
  do such different things.

**Objects and methods used**

- **`malloc`**
  - *What it is:* a function from C's standard library (declared in
    `stdlib.h`, hence this lesson's new `#include <stdlib.h>`) that
    requests a block of heap memory of a given size and hands back a
    pointer to it.
  - *Implementation:* `void *malloc(size_t size);` — takes the number of
    bytes needed as its one argument, and returns `void *`: a pointer
    with no specific type attached, since `malloc` has no way of knowing
    in advance what kind of value the caller intends to store there.
  - *Its use:* this lesson's project needs `thing` to live on the heap,
    not the stack, so its lifetime can be controlled explicitly by
    reference count rather than by whatever function happens to declare
    it — `malloc` is C's standard way to obtain exactly that kind of
    memory.
  - *Type:* a standard-library function, real shipped code, not a
    language keyword.
  - *Responsibility:* to find a free block of heap memory at least as
    large as the requested size, mark it as in use so nothing else gets
    handed the same block, and return its address — the complete job,
    not just "gives you some memory." If no block that large is
    available, `malloc` returns `NULL` instead, which real production C
    code checks for and this lesson's own code does not, for the sake of
    staying focused on reference counting rather than defensive error
    handling.
  - *Depends on:* a size in bytes, almost always produced with the
    `sizeof` operator (introduced in this lesson's first Concept Unit)
    rather than typed as a raw number, so the request always matches the
    real, current size of whatever type is being allocated.
  - *Connects to:* called directly from this lesson's `main`; internally
    it calls into the C library's own heap-management machinery and,
    ultimately, the operating system's memory-management facilities —
    machinery this lesson doesn't open up, since it isn't this lesson's
    subject. Its return value flows directly into `thing`, and from
    there into every `->` access this lesson's code makes afterward.
  - *Shape:* takes one integer (a byte count) in; returns one untyped
    pointer (`void *`) out — or `NULL` on failure, a case this lesson's
    own code doesn't check for.

- **`free`**
  - *What it is:* the standard-library counterpart to `malloc` (also
    declared in `stdlib.h`), which returns a previously-`malloc`'d block
    of heap memory to the pool of memory available for future
    allocation.
  - *Implementation:* `void free(void *ptr);` — takes the exact pointer
    `malloc` originally returned, and returns nothing (`void`).
  - *Its use:* this lesson's `decref_thing` calls `free` on `thing`'s own
    memory, but only in the one specific case its reference count has
    just reached zero — this is the actual moment CPython's real
    reference counting exists to detect precisely.
  - *Type:* a standard-library function.
  - *Responsibility:* to mark the memory at the given address as
    available for reuse — nothing more. `free` does not erase the
    memory's contents, and it does not change the value of any pointer
    variable still holding that now-invalid address, which is precisely
    what makes a dangling pointer possible and why this lesson's own
    code explicitly sets `thing` to `NULL` immediately after freeing it.
  - *Depends on:* a pointer that was returned by an earlier `malloc`
    call (or a compatible allocation function) and hasn't already been
    freed — calling `free` twice on the same pointer, or on a pointer
    `malloc` never actually returned, is undefined behavior.
  - *Connects to:* called from `decref_thing`, which is this lesson's
    own function modeled on the real `Py_DECREF` quoted below; `free`
    itself hands the memory back to the same heap machinery `malloc`
    drew it from.
  - *Shape:* takes one pointer in; returns nothing; its effect is
    entirely on the heap's own internal bookkeeping, not on any value
    visible directly in this lesson's code, other than making the freed
    address unsafe to use afterward.

- **`Py_DECREF`**
  - *What it is:* the real CPython macro used, symmetrically with
    `Py_INCREF` from Lesson 2, every time code finishes using a
    reference to a Python object.
  - *Implementation:* quoted verbatim, from `Include/object.h` in
    CPython's `v3.12.7` tag — the real function's ordinary
    (non-debug-build) release path:
    ```c
    static inline Py_ALWAYS_INLINE void Py_DECREF(PyObject *op)
    {
        // Non-limited C API and limited C API for Python 3.9 and older access
        // directly PyObject.ob_refcnt.
        if (_Py_IsImmortal(op)) {
            return;
        }
        _Py_DECREF_STAT_INC();
        if (--op->ob_refcnt == 0) {
            _Py_Dealloc(op);
        }
    }
    ```
    `--op->ob_refcnt` decrements the object's real reference-count field
    through the pointer `op`, the same arrow-operator pattern Lesson 2
    isolated. `_Py_Dealloc` is the real function CPython calls once that
    count reaches zero — the actual object-destroying step, standing in
    the real macro exactly where this lesson's own `decref_thing` calls
    `free`. `_Py_DECREF_STAT_INC()` is optional debug-build statistics
    bookkeeping this lesson isn't building.
  - *Its use:* this lesson's `decref_thing`, built later in this lesson,
    is a deliberately smaller version of exactly this real macro — same
    core idea (decrement through a pointer, check for zero, destroy if
    so), minus the immortality check and debug statistics this
    curriculum hasn't built yet.
  - *Type:* a macro that expands to a `static inline` C function, same
    as `Py_INCREF` in Lesson 2.
  - *Responsibility:* to record that one reference to an object has
    ended, and, specifically and only on the exact decrement that brings
    the count to zero, to trigger that object's real destruction — the
    complete job, not just "subtracts one."
  - *Depends on:* a valid, non-NULL pointer to a real object whose
    reference count is currently at least 1 — decrementing a reference
    count that's already at zero is a serious bug in real CPython, the
    same category of danger this lesson's own dangling-pointer material
    is building toward.
  - *Connects to:* called from thousands of places throughout CPython's
    own C source, symmetrically with every place `Py_INCREF` is called;
    on the zero-count path, it calls into `_Py_Dealloc`, which
    ultimately reaches the specific object type's own destructor logic —
    machinery well beyond this lesson's `MiniObject`, which has no
    destructor of its own beyond the plain `free` its simplicity allows.
  - *Shape:* takes one pointer in; returns nothing; its effect is either
    nothing at all (count still above zero) or the complete destruction
    of the object the pointer refers to (count reached zero) — never
    anything in between.

---

## Concept Unit: Making Memory Outlive a Function

### The Problem

`thing`, as Lesson 1 and Lesson 2 left it, is declared directly inside
`main` — the same way `p` was declared inside `main` in Lesson 1's
throwaway `struct Point` example. That memory belongs to `main`'s own
stack frame, and C reclaims a function's stack frame automatically the
instant that function returns, with no say from the programmer at all.
Lesson 2 built a reference count for `thing`, but nothing about that
count actually controls when `thing`'s memory goes away — `main`
returning would erase it regardless of what the count says.

Before reading on: if a reference count is supposed to be the thing that
decides when memory gets reclaimed, what does that imply about where
that memory needs to live in the first place? Can you think of a reason
stack memory — which disappears automatically, on a fixed schedule tied
to function returns — would be the wrong kind of memory for something
whose lifetime a reference count is supposed to control instead?

### Isolating the Concept

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *n = malloc(sizeof(int));
    *n = 5;
    printf("*n = %d\n", *n);
    free(n);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab5_malloc lab5_malloc.c
$ ./lab5_malloc
*n = 5
```

`malloc(sizeof(int))`, from this lesson's Header, requests a block of
heap memory big enough to hold one `int`. `sizeof` is a compile-time
operator — not a function call, even though it's written with
parentheses — that produces the real, exact number of bytes an `int`
takes up on this machine; using `sizeof(int)` instead of guessing a
number (like `4`) is what makes this code correct on any machine, since
`int`'s exact size isn't guaranteed to be the same everywhere. `malloc`
hands back a `void *` (an untyped pointer, from this lesson's Header),
which is being stored directly into `int *n` — C allows an untyped
pointer to be assigned to any specific pointer type without an explicit
cast, unlike the `(void *)` cast Lesson 1 needed to go the *other*
direction, from a specific pointer type down to `void *`, for `printf`'s
`%p`. `*n = 5;` then dereferences `n` (the same dereference operator
Lesson 2 isolated) to write into the heap memory `malloc` just handed
back — proving this heap memory works exactly like the stack memory
Lesson 2's pointers pointed at: it can be written to and read from
through a pointer, the only difference being *where* it lives and *who*
controls when it goes away. `free(n)`, from this lesson's Header, hands
that memory back at the end. This is called **heap allocation**: memory
requested at runtime, which persists until explicitly freed, rather than
disappearing automatically the way a function's local variables do.

This throwaway example is now **discarded** — `lab5_malloc.c` will not
appear in this lesson's real project. What it proved — that `malloc`
produces real, writable, readable memory whose lifetime doesn't depend
on any function returning — is exactly what `thing` needs next, so its
own `refcount` field can actually mean something.

### Project Change

- **Reference Source** — a real counterpart exists for the general idea
  (CPython's own comment, already visible in the quoted material this
  lesson's Header cites for `Py_DECREF`, states plainly: "Objects are
  structures allocated on the heap"), but no single CPython source line
  corresponds to this specific `malloc` call — real CPython objects are
  allocated through its own internal allocator (`PyObject_Malloc` and
  related functions), which is out of scope for this lesson and belongs
  to a later lesson on memory allocation specifically.
- **Files affected** — `project/lesson-03/mini_object.c`, modified
  (copied forward from Lesson 2's finished `mini_object.c`).
- **Change type** — refactor (`thing` changes from a stack-declared
  struct to a heap-allocated pointer) plus configure (`#include
  <stdlib.h>` added, since `malloc` and `free` are declared there).
- **Location** — the `#include` goes alongside Lesson 1's existing
  `#include <stdio.h>`, at the top of the file; the refactor replaces
  `main`'s existing `struct MiniObject thing;` declaration and every `.`
  access to `thing`'s fields that follows it.
- **Dependencies** — none beyond the standard C library, already
  available through `gcc`.

### The New Code

```c
#include <stdlib.h>
```

```c
struct MiniObject *thing = malloc(sizeof(struct MiniObject));
thing->value = 99;
thing->refcount = 1;
```

### The Updated Project

```c
 1  #include <stdio.h>
 2  #include <stdlib.h>                                          // ← new
 3
 4  struct MiniObject {
 5      long value;
 6      long refcount;
 7  };
 8
 9  void incref_thing(struct MiniObject *op) {
10      op->refcount++;
11  }
12
13  int main(void) {
14      struct MiniObject *thing =                                // ← new
15          malloc(sizeof(struct MiniObject));                    // ← new
16      thing->value = 99;                                        // ← new
17      thing->refcount = 1;                                      // ← new
18
19      printf("thing->value = %ld\n", thing->value);             // ← new
20      printf("thing lives at address %p\n", (void *)thing);     // ← new
21      printf("refcount starts at %ld\n", thing->refcount);
22
23      incref_thing(thing);                                      // ← new
24      printf("refcount after one incref_thing call: %ld\n", thing->refcount);
25
26      incref_thing(thing);
27      incref_thing(thing);
28      printf("refcount after two more calls: %ld\n", thing->refcount);
29
30      return 0;
31  }
```

`thing` is now a pointer to heap memory (lines 14–15) instead of a
stack-declared struct — its fields are set and read through `->`
(lines 16–17, 19, 21, 24, 28) instead of the plain `.` Lesson 1 and
Lesson 2 used, since `thing` itself is now a pointer, not a struct held
directly. `incref_thing` is called with `thing` itself now (line 23),
not `&thing` as in Lesson 2 — `thing` is already an address, so there's
no need to take its address a second time. Line 20 drops the `&`
Lesson 1 and 2 used before `thing` for the same reason: `thing` already
*is* the address `%p` needs, cast straight to `void *`.

### Mechanical Walkthrough

- **`#include <stdlib.h>`** — a preprocessor directive, the same
  construct Lesson 1 introduced for `#include <stdio.h>`, this time
  pulling in the standard library's declarations for `malloc`, `free`,
  and `NULL` — none of which this file could legally call or use without
  it.
- **`struct MiniObject *thing = malloc(sizeof(struct MiniObject));`** —
  declares `thing` using the pointer declaration syntax from Lesson 2
  (`type *name`), this time with `struct MiniObject` as the pointed-to
  type. `malloc(sizeof(struct MiniObject))`, both explained in full in
  this lesson's Header and isolated lab, requests exactly enough heap
  memory to hold one `MiniObject` — `sizeof(struct MiniObject)` rather
  than `sizeof(int)` this time, since it's this lesson's own struct that
  needs the space, not a plain `int`. The `void *` `malloc` returns is
  assigned straight into `thing`, exactly as this unit's isolated lab
  proved is legal without an explicit cast.
- **`thing->value = 99;`** and **`thing->refcount = 1;`** — the arrow
  operator from Lesson 2, used here for the first time on `thing`
  specifically, now that `thing` is a pointer rather than a struct held
  directly. These set the same two fields Lesson 1 and Lesson 2 already
  set on `thing`, with identical values and identical meaning — only the
  operator reaching them has changed, from `.` to `->`, because what
  `thing` *is* has changed.
- **`printf("thing lives at address %p\n", (void *)thing);`** — the same
  `%p` format specifier and `(void *)` cast Lesson 1 introduced, but the
  value being cast is now `thing` itself, not `&thing`. `thing` already
  holds an address — it's a pointer — so there's nothing left to take
  the address *of*; casting `&thing` here would print the address of the
  pointer variable itself, not the address of the `MiniObject` it points
  at, which is a real and easy mistake to make when converting code from
  stack-based to heap-based the way this unit just did.
- **`incref_thing(thing);`** — calls Lesson 2's function, but with
  `thing` passed directly, not `&thing` as Lesson 2's own version of
  this call used. `incref_thing`'s parameter, `struct MiniObject *op`
  (unchanged from Lesson 2), expects a pointer — and `thing` now already
  is one, so handing it over directly is correct; handing over `&thing`
  now would produce a pointer to a pointer, a different and wrong type
  entirely.

### Execution Trace

No loop or recursion here; the sequence of statements runs once,
straight through, same as Lesson 1 and Lesson 2's own project code — no
`Iteration N:` trace is needed for the same reason stated in those
lessons.

### CS Lens

The distinction this unit builds — memory whose lifetime is tied to a
function's own execution (the stack) versus memory whose lifetime is
controlled explicitly by the program (the heap) — is a foundational idea
in how virtually every programming language manages memory, whether or
not that language ever shows it to you directly.

```
Also recognized in: Java and C#'s own stack-vs-heap split (primitives
and local variables on the stack, every object on the heap); a
function's local variables in literally any compiled language,
reclaimed automatically on return; a database connection pool, which
hands out connections that must live longer than the single function
that requested one; and Python's own object model, where every single
Python object — not just some of them — lives on the heap for exactly
this reason, which is why this curriculum needed this concept before it
could go any further.
```

### SE Lens

The design principle is **giving a value control over its own
lifetime, separate from the lifetime of whatever function happens to be
running when it's created**. The alternative — leaving `thing` on the
stack, the way Lesson 1 and Lesson 2 did — was not chosen here because
it's actually incompatible with reference counting doing anything
meaningful: a stack-allocated `thing` would be destroyed the moment
`main` returned regardless of what `refcount` said, making `refcount`
pure decoration. The real tradeoff of heap allocation: it buys a value
lifetime independent of any one function's execution, but heap memory
has to be *explicitly* given back with `free` — nothing does it
automatically — and forgetting to do so (a memory leak) or doing it
more than once, or too early, are real, common bug classes that stack
memory simply cannot produce, since the compiler handles stack cleanup
for you with no chance to get it wrong. This project is deliberately
carrying exactly that debt for one more Concept Unit: `thing` is
allocated here but not yet freed anywhere — the next two units in this
lesson exist specifically to close that gap correctly instead of with a
single unconditional `free` call.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, from Lesson 1, build and run this lesson's updated file
unchanged; `gcc` requires no special flag to link the standard library
functions `malloc` and `free` on this system.

### Run It

Actually compiled and run this session, not predicted (this checkpoint
reflects only this unit's changes, before the later units in this
lesson add freeing):

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing->value = 99
thing lives at address 0x55d25a0822a0
refcount starts at 1
refcount after one incref_thing call: 2
refcount after two more calls: 4
```

Worth noticing: this address, `0x55d25a0822a0`, is real and was printed
by the same `%p` mechanism Lesson 1 used — but it looks structurally
different from the stack addresses Lesson 1 printed (which started with
`0x7ffd...` or `0x7fff...`). That's not a coincidence: heap memory and
stack memory are deliberately placed in different regions of a process's
address space, which is often visible directly in the addresses
themselves, though the exact ranges are not something this lesson
guarantees or depends on.

### Connecting to What Came Before

Lesson 2 built a reference count that could only go up, sitting on
memory that would have vanished regardless of that count the moment
`main` returned. This unit gives that count something real to control:
memory that persists exactly as long as the program chooses to keep it,
and not one instant longer or shorter than that. The next unit addresses
what happens if that choice is made carelessly.

---

## Concept Unit: The Danger of Using Freed Memory

### The Problem

`free` hands memory back, but it doesn't erase `thing`'s pointer
variable itself — after calling `free(thing)`, `thing` would still hold
the exact same address it held a moment before, even though that
address no longer belongs to this program's data. Nothing about the C
language stops code from still using that stale address afterward.

Before reading on: if `free(thing)` doesn't change the *value* stored in
the `thing` variable — only what that address is allowed to be used for
— what do you think happens, structurally, if code keeps using `thing`
right after freeing it? Is this the kind of mistake you'd expect the
compiler to catch and refuse to build, the way it catches a missing
semicolon — or something else?

### Isolating the Concept

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *n = malloc(sizeof(int));
    *n = 5;
    free(n);
    n = NULL;
    printf("n is now %p\n", (void *)n);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab6_dangling lab6_dangling.c
$ ./lab6_dangling
n is now (nil)
```

After `free(n);`, `n` itself still technically holds the address it
always held — `free`, per this lesson's Header, only marks that memory
as available for reuse; it does not touch the `n` variable at all. A
pointer left in that state — still pointing at an address whose memory
has already been freed — is called a **dangling pointer**, from this
lesson's Header: reading or writing through it afterward is undefined
behavior, meaning C makes no guarantee at all about what happens — it
might appear to work by accident, it might silently corrupt unrelated
data, or it might crash, and which of those happens can change from run
to run with no warning. This lesson deliberately does not execute that
case to show you real output, because there's no real, reliable output
to show — its unpredictability is the entire danger. What this lab does
show, safely: `n = NULL;`, immediately after `free`, is the standard
defensive habit that prevents the danger entirely — `NULL`, from this
lesson's Header, is a value guaranteed to never be a valid, usable
address, so a pointer set to it can never be accidentally dereferenced
as if it still pointed at real data. The real, confirmed output above —
`n is now (nil)` — is `printf`'s own standard way of displaying a `NULL`
pointer value with `%p` on this system.

This throwaway example is now **discarded** — `lab6_dangling.c` will not
appear in this lesson's real project. What it proved — that setting a
pointer to `NULL` immediately after freeing what it pointed at is what
actually prevents a dangling pointer, since `free` alone doesn't do
that — is a habit the real project's own `main` adopts directly, once
`decref_thing` is built in the next unit.

### Project Change

- **Reference Source** — No reference counterpart; the dangling-pointer
  hazard itself is general C behavior, not a specific line of CPython
  source. (The *pattern* of nulling a pointer immediately after
  releasing it does have a real, more thorough CPython counterpart —
  the `Py_CLEAR` macro, visible in the same `Include/object.h` region
  this lesson's `Py_DECREF` was quoted from — but `Py_CLEAR` itself is
  out of scope for this lesson and is not being taught or quoted here.)
- **Files affected** — none yet; this unit is purely conceptual
  preparation for the next unit's real project change.
- **Change type** — n/a for this unit.
- **Location** — n/a for this unit.
- **Dependencies** — n/a for this unit.

### Connecting to What Came Before

The previous unit gave `thing` heap memory whose lifetime the program
controls directly, instead of memory the compiler cleans up
automatically. This unit is the reason that control has to be exercised
carefully: heap memory that's freed but still pointed at by a live
variable is exactly the failure mode reference counting exists to
prevent, and getting the *freeing* half of that machinery right — not
just the counting half — is what the next, final unit in this lesson
builds.

---

## Concept Unit: Releasing a Reference — and Freeing at Zero

### The Problem

`incref_thing`, from Lesson 2, only ever adds to `thing`'s reference
count. Nothing in this project yet does the opposite — records that a
place using `thing` is done with it, and, critically, recognizes the
one specific moment every user is done, so `thing`'s heap memory (from
this lesson's first unit) can be freed without leaving a dangling
pointer (this lesson's second unit) behind.

Before reading on: given everything built so far in this lesson — a
reference count that starts at some number greater than zero, and the
fact that freeing needs to happen at exactly one specific value of that
count, not every time it changes — what condition do you think should
trigger the actual `free` call? And once that call happens, what does
this lesson's second unit suggest should happen to the pointer that
triggered it?

### Isolating the Concept

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *n = malloc(sizeof(int));
    *n = 5;
    int count = 1;

    count--;
    if (count == 0) {
        printf("count reached zero, freeing\n");
        free(n);
        n = NULL;
    } else {
        printf("count is now %d, not freeing yet\n", count);
    }

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab7_conditional_free lab7_conditional_free.c
$ ./lab7_conditional_free
count reached zero, freeing
```

`count--;` is C's decrement operator — the mirror image of the `++`
Lesson 2 used in `incref_thing`, subtracting one from `count` and
storing the result back. `if (count == 0)`, from this lesson's Header,
checks the relational operator `==` (also from this lesson's Header,
distinct from the single `=` used earlier in this same line to declare
`count`) — only when that comparison is true does the block that follows
actually run. Here, `count` started at `1`, and one decrement brought it
to exactly `0`, so the `if` branch ran: it printed a message, called
`free(n)` (from this lesson's first unit and Header), and immediately
set `n = NULL` (from this lesson's second unit), all three inside the
same conditional block. The real output above confirms the `if` branch
is the one that actually executed — had `count` still been above zero,
the `else` branch's message would have printed instead. This is the
core shape of **conditional, count-triggered freeing**: decrement, check
for exactly zero, and only on that condition, free and null the pointer
— the same three-part shape this lesson's Header already quoted from the
real `Py_DECREF`.

This throwaway example is now **discarded** — `lab7_conditional_free.c`
will not appear in this lesson's real project. What it proved — that an
`if (count == 0)` check correctly gates a `free` call to happen exactly
once, only on the decrement that reaches zero — is exactly what
`decref_thing` needs to do for real, modeled directly on this lesson's
own quoted `Py_DECREF`.

### Project Change

- **Reference Source** — `Include/object.h`, CPython `v3.12.7` tag,
  within the `Py_DECREF` function definition, quoted verbatim in this
  lesson's Header. `decref_thing` is a deliberately smaller version of
  it: same decrement-check-destroy shape, without the immortality check
  or debug statistics the real macro also performs.
- **Files affected** — `project/lesson-03/mini_object.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — add (`decref_thing`, a new function) and add
  (new statements in `main`, calling it).
- **Location** — `decref_thing` goes immediately after `incref_thing`'s
  existing definition; the new calls go inside `main`, after the
  existing `incref_thing` calls this lesson's first unit already
  updated.
- **Dependencies** — `free`, already available via this lesson's
  first unit's `#include <stdlib.h>`.

### The New Code

```c
void decref_thing(struct MiniObject *op) {
    op->refcount--;
    if (op->refcount == 0) {
        free(op);
    }
}
```

```c
decref_thing(thing);
decref_thing(thing);
decref_thing(thing);
printf("refcount after three releases: %ld\n", thing->refcount);

decref_thing(thing);
printf("thing has now been freed\n");
thing = NULL;
printf("thing is now %p\n", (void *)thing);
```

### The Updated Project

```c
 1  #include <stdio.h>
 2  #include <stdlib.h>
 3
 4  struct MiniObject {
 5      long value;
 6      long refcount;
 7  };
 8
 9  void incref_thing(struct MiniObject *op) {
10      op->refcount++;
11  }
12
13  void decref_thing(struct MiniObject *op) {          // ← new
14      op->refcount--;                                  // ← new
15      if (op->refcount == 0) {                          // ← new
16          free(op);                                     // ← new
17      }                                                  // ← new
18  }                                                      // ← new
19
20  int main(void) {
21      struct MiniObject *thing =
22          malloc(sizeof(struct MiniObject));
23      thing->value = 99;
24      thing->refcount = 1;
25
26      printf("thing->value = %ld\n", thing->value);
27      printf("thing lives at address %p\n", (void *)thing);
28      printf("refcount starts at %ld\n", thing->refcount);
29
30      incref_thing(thing);
31      printf("refcount after one incref_thing call: %ld\n", thing->refcount);
32
33      incref_thing(thing);
34      incref_thing(thing);
35      printf("refcount after two more calls: %ld\n", thing->refcount);
36
37      printf("refcount before releases: %ld\n", thing->refcount);  // ← new
38
39      decref_thing(thing);                                          // ← new
40      decref_thing(thing);                                          // ← new
41      decref_thing(thing);                                          // ← new
42      printf("refcount after three releases: %ld\n", thing->refcount); // ← new
43
44      decref_thing(thing);                                          // ← new
45      printf("thing has now been freed\n");                         // ← new
46      thing = NULL;                                                 // ← new
47      printf("thing is now %p\n", (void *)thing);                   // ← new
48
49      return 0;
50  }
```

`main` now runs `thing` through its complete lifecycle: created with a
reference count of `1` (line 24), shared three more times via
`incref_thing` (lines 30, 33–34, bringing the count to `4`), then
released four times via the new `decref_thing` (lines 39–41 and 44) —
exactly enough releases to cancel out every earlier increment and the
initial reference together. The first three releases (lines 39–41) are
printed and checked safely (line 42, reading `thing->refcount` while
it's still `1` — real, valid memory); the fourth release (line 44) is
the one that brings the count to zero and triggers the real `free`
inside `decref_thing` — after that call, line 45 prints a plain message
with no further access to `thing`'s freed memory, line 46 sets `thing`
to `NULL` following this lesson's second unit's own proven pattern, and
line 47 prints that `NULL` value safely, since printing a pointer's
*value* is always safe — only reading or writing through it, once it's
`NULL` or dangling, is not.

### Mechanical Walkthrough

- **`void decref_thing(struct MiniObject *op)`** — declares a new
  function, symmetrical with `incref_thing` from Lesson 2: same `void`
  return type from this lesson's Header (no result to hand back), same
  `struct MiniObject *op` parameter using the pointer declaration syntax
  from Lesson 2, and the same borrowed parameter name `op`, since this
  function, like `incref_thing`, is modeled directly on a real CPython
  macro — here, `Py_DECREF`, quoted in full in this lesson's Header.
- **`op->refcount--;`** — the arrow operator from Lesson 2, reaching
  `op`'s `refcount` field, combined with the decrement operator `--`
  from this unit's own isolated lab: subtract one from the current
  value and store the result back, through the pointer, so the change
  lands on whatever real `MiniObject` `op` points at.
- **`if (op->refcount == 0) { free(op); }`** — the `if` conditional and
  `==` relational operator from this lesson's Header, both isolated in
  this unit's own throwaway lab. The condition reads `op->refcount`
  (already decremented by the line above) and compares it against `0`
  using `==`; only when that comparison is true does `free(op)` — from
  this lesson's first unit and Header — actually run, releasing `op`'s
  heap memory back to the system. On every other decrement, where the
  count is still above zero, this entire block is skipped, and the
  function simply returns having only changed the count.
- **`decref_thing(thing); decref_thing(thing); decref_thing(thing);`**
  — three separate calls, each passing `thing` (already a pointer, per
  this lesson's first unit) directly, exactly the way `incref_thing`
  is called earlier in `main`. Each call independently decrements
  `refcount` by one and checks it against zero; none of these three
  specific calls happens to be the one where the count reaches zero,
  since `refcount` starts this sequence at `4`.
- **`printf("refcount after three releases: %ld\n", thing->refcount);`**
  — the same `printf` and `%ld` format specifier from Lesson 2's
  Header, reading `thing->refcount` here while it is still real, valid
  memory — the count is `1` at this point, not yet zero, so `thing`
  has not been freed and this read is completely safe.
- **`decref_thing(thing);`** (the fourth call) — decrements `refcount`
  from `1` to `0`, and this time the `if` condition inside
  `decref_thing` is true: `free(op)` actually runs, and `thing`'s heap
  memory, from this point forward, is no longer valid to read or write.
- **`printf("thing has now been freed\n");`** — a plain string with no
  format specifiers and no reference to `thing` at all, deliberately:
  after the call above, reading `thing->refcount` again would be
  exactly the dangling-pointer hazard this lesson's second unit warned
  about, so this line avoids it entirely rather than trying to print
  anything derived from `thing`'s now-freed memory.
- **`thing = NULL;`** — the assignment operator `=` from Lesson 1,
  storing `NULL` (from this lesson's Header) into `thing` itself. This
  doesn't touch the freed memory at all — it changes what address
  `thing`, the variable, currently holds, following exactly the
  dangling-pointer-prevention pattern this lesson's second unit proved
  in isolation.
- **`printf("thing is now %p\n", (void *)thing);`** — the same `%p` and
  `(void *)` cast from earlier in this lesson, now printing `thing`'s
  new value, `NULL`, which this lesson's second unit already proved
  `printf` renders as `(nil)` on this system. This read is safe because
  it reads the pointer's own value — an ordinary, valid variable — not
  the freed memory that value used to point at.

### Execution Trace

`thing->refcount` changes value across a sequence of calls, so it's
worth tracing explicitly, continuing from where Lesson 2's own trace
left off (`refcount` at `4`, after Lesson 2's three `incref_thing`
calls):

1. `decref_thing(thing);` (first release) — `op->refcount--` reads `4`,
   writes back `3`; `op->refcount == 0` is false (`3 != 0`), so the `if`
   block is skipped and `free` does not run.
2. `decref_thing(thing);` (second release) — decrements `3` to `2`; the
   condition is still false, still skipped.
3. `decref_thing(thing);` (third release) — decrements `2` to `1`; still
   false, still skipped. `thing->refcount` is `1` here, matching the
   real, confirmed output `refcount after three releases: 1` below.
4. `decref_thing(thing);` (fourth release) — decrements `1` to `0`; this
   time `op->refcount == 0` is true, so `free(op)` runs, releasing
   `thing`'s heap memory for real. This is the only one of the four
   calls where the `if` block's body actually executes — the condition
   is checked identically all four times, but only this decrement
   produces the specific value, `0`, that makes it true.

### CS Lens

Freeing a resource only when its count of active users reaches exactly
zero, rather than on any fixed schedule, is the same core pattern this
lesson's earlier CS Lens (Lesson 2) already named for reference counting
itself — this unit is that pattern's other half, the trigger condition
rather than the count.

```
Also recognized in: a shared database connection closed only once every
borrower has returned it; a countdown latch in concurrent programming,
which releases waiting threads only on the count reaching zero; a
building's last person out turning off the lights, checked at every
single departure but only ever true once; and CPython's own real
Py_DECREF, quoted in full in this lesson's Header, which this unit's
own decref_thing was built to mirror.
```

### SE Lens

The design principle here is **coupling destruction to the exact
condition that makes it safe, instead of to a fixed point in the
program's structure**. The alternative not chosen: freeing `thing`
unconditionally at some fixed point in `main` — for instance, right
before `return 0;`, regardless of how many `incref_thing` calls had
happened. That alternative is simpler to write, but it's wrong the
moment more than one part of a program can hold a reference to the same
object, which is the entire situation reference counting exists to
handle: an unconditional free at a fixed point would either free memory
some other part of the program still legitimately expects to use, or
leak it by never freeing it at all if the "fixed point" isn't actually
guaranteed to run after every user is done. The real cost of the
conditional approach this unit builds instead: every single
`decref_thing` call must run the same check, even on the many calls
where nothing actually needs to happen, and getting that check's
condition exactly right — precisely `== 0`, never accidentally `<= 0`
or `< 1` in a way that could trigger twice — is exactly the kind of
detail real CPython bugs have come from historically. This project
isn't currently carrying debt from this choice; `decref_thing`'s
condition is correct as built. What it does not yet handle, and what a
future lesson in this curriculum will: what happens when two objects
end up referencing *each other*, so neither one's count ever reaches
zero even after nothing outside the pair still needs either of them —
the exact problem plain reference counting cannot solve on its own,
and the reason CPython also has a separate garbage collector.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing->value = 99
thing lives at address 0x56441c2c22a0
refcount starts at 1
refcount after one incref_thing call: 2
refcount after two more calls: 4
refcount before releases: 4
refcount after three releases: 1
thing has now been freed
thing is now (nil)
```

Every line matches this unit's own Execution Trace exactly: refcount
climbs from `1` to `4` through Lesson 2's `incref_thing` calls (already
verified in Lesson 2), holds at `1` through three safe releases, and the
fourth release triggers the real `free` inside `decref_thing` — visible
here only indirectly, through `thing`'s own value becoming `(nil)` after
being explicitly set to `NULL`, since nothing in this code reads
`thing`'s freed memory directly to prove the free happened.

### Connecting to What Came Before

The previous unit proved, in isolation, that a pointer set to `NULL`
immediately after `free` closes off the dangling-pointer hazard that
unit warned about. This unit combined that proof with the conditional
free-at-zero pattern from its own isolated lab, and applied both,
together, to the real `thing` this lesson's first unit moved onto the
heap — completing, for the first time in this curriculum, an object's
entire lifecycle: created with a starting reference, shared, released,
and correctly destroyed exactly once, at exactly the right moment.

---

## Connect the Pieces

Follow `thing`'s complete lifecycle, start to finish, across every unit
this lesson built:

1. The first unit moved `thing` off the stack and onto the heap with
   `malloc(sizeof(struct MiniObject))`, so its lifetime could be
   controlled by its own reference count instead of by whichever
   function happened to declare it — real output confirmed `thing`
   living at a real heap address, `0x56441c2c22a0`, structurally
   distinct from the stack addresses Lesson 1 printed.
2. The second unit proved, on a throwaway `int`, that `free` alone
   leaves a dangling pointer behind unless the pointer is explicitly set
   to `NULL` afterward — real output confirmed `printf` renders a
   `NULL` pointer as `(nil)` on this system.
3. The third unit combined both proofs into `decref_thing`, modeled
   directly on the real `Py_DECREF` quoted in this lesson's Header:
   decrement the count, check for exactly zero, and only then free.
4. `main` called `decref_thing(thing)` four times, matching the four
   references Lesson 2's `incref_thing` calls (plus `thing`'s own
   starting count of `1`) had built up — real output confirmed the
   count holding at `1` through the first three calls, exactly as this
   unit's own Execution Trace predicted.
5. The fourth call brought the count to `0`, triggering the real `free`
   inside `decref_thing` — and immediately afterward, `main` applied the
   second unit's own proven pattern directly: `thing = NULL;`, confirmed
   by real output showing `thing is now (nil)`.

That last step is what makes this lesson's title literal: `thing` isn't
just decremented, and it isn't just freed — it's *let go of*, safely,
with nothing left in the program still pointing at memory that no
longer belongs to it. But this lesson's own SE Lens already flagged the
one case this whole mechanism cannot handle on its own: two objects that
reference each other, where neither one's count can ever reach zero even
after nothing else in the program still needs either of them. Lesson 4
steps back first, to show CPython's actual `PyObject` header for real —
the genuine struct this whole curriculum's simplified `MiniObject` has
been standing in for since Lesson 1 — before Lesson 6 turns to the
reference-cycle gap directly, once a real, second `MiniObject` exists to
build one out of.
