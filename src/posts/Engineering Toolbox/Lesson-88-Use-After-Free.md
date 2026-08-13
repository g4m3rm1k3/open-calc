# Lesson 88: The Memory Is Gone, but the Pointer Doesn't Know — Use-After-Free

**What you will build:** a real use-after-free bug, a more dangerous
variant where freed memory gets silently reused and aliased by an
unrelated allocation, a real double-free caught live by glibc's own
allocator, and the standard defensive fix. The transferable insight:
`free(p)` (Lesson 83) releases memory back to the allocator — it does
not, and cannot, change what `p` itself still points to. Every pointer
to memory that's been freed remains exactly as usable-*looking* as it
was the instant before, which is precisely what makes this bug
dangerous: nothing about the pointer changes, only the ground underneath
it.

**What you need to know first:** Lesson 83 (`malloc`/`free`) — this
lesson's entire subject is what happens in the gap Lesson 83's own
exercises deliberately left open: "do not attempt to explain or fix
[a double free] yet." Lesson 86 (stack vs. heap) previewed a related
idea (a dangling *stack* pointer); this lesson covers the heap
equivalent, which is both more common in real code and, as shown
directly, considerably harder for a compiler to catch automatically.

---

## Concept Unit: The Problem — Python Can't Have This Bug

### The Problem

Python's garbage collector (Lesson 83's own opening comparison) keeps
an object alive as long as *any* reference to it exists — there is
structurally no way to be left holding a reference to memory that's
already been reclaimed, because reclamation only happens once no
references remain at all.

### The New Code

```python
class Data:
    def __init__(self, value):
        self.value = value

d = Data(42)
ref = d
del d          # "delete" one reference
print(ref.value)  # still works -- the object is only freed once NO references remain
```

### Run It

```
42
```

`del d` removes *one* name's binding to the object — `ref` still holds
a live reference, so the object survives, and `ref.value` reads
correctly. Discarded now — the rest of this lesson does the C
equivalent, where `free(p)` has no concept of "other references" at
all, and doesn't check for any before releasing memory.

### CS Lens

Tracking how many references to an object currently exist, and only
reclaiming it once that count reaches zero, is a real garbage-collection
strategy called **reference counting** (one of several CPython actually
uses internally). C provides nothing like this — `malloc`/`free` are
purely manual, and `free(p)` means exactly "release this memory now,"
full stop, with zero awareness of whether any other pointer anywhere
in the program still refers to the same address.

---

## Concept Unit: A Basic Use-After-Free

### The Problem

Nothing about a pointer's own value changes when the memory it points
to is freed — `p` still holds the same address it always did. Reading
or writing through it anyway is exactly what this bug is.

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    *p = 42;
    printf("before free: *p = %d\n", *p);

    free(p);   // the memory is returned to the allocator...
    // ...but p itself still holds the SAME address it always did.

    printf("after free:  *p = %d   (p is now DANGLING -- this is undefined behavior)\n", *p);

    return 0;
}
```

### Run It

```
$ ./uaf_basic
before free: *p = 42
after free:  *p = 1548030900   (p is now DANGLING -- this is undefined behavior)
$ ./uaf_basic
before free: *p = 42
after free:  *p = 1595156151   (p is now DANGLING -- this is undefined behavior)
$ ./uaf_basic
before free: *p = 42
after free:  *p = 1434473826   (p is now DANGLING -- this is undefined behavior)
```

`*p` before `free` is reliably `42`, every run — genuinely correct.
`*p` after `free` is **different every single time**, and none of the
values are `42` — the memory `p` points to hasn't vanished (that's not
how virtual memory works, in general), but it's no longer guaranteed to
hold what was last written there, and nothing about dereferencing `p`
gives any signal that it's now reading memory the program itself
already declared it was done with.

### Mechanical Walkthrough

- `int *p = malloc(sizeof(int)); *p = 42;` — already-established from
  Lesson 83: `p` holds a real, valid heap address, and `42` is stored
  there.
- `free(p);` — releases the memory *back to the allocator's own
  bookkeeping* — marks it as available for a future allocation to
  reuse. It does not zero it out, does not change `p`'s value, and
  does not (and cannot) find and invalidate any other variable that
  might also hold this same address.
- `printf("...%d...", *p);` — `*p` dereferences the exact same address
  as before `free` — syntactically and mechanically identical to the
  first dereference. There is nothing different about this line of
  code itself; the danger is entirely in what the *memory* now means,
  not in how it's accessed.

### CS Lens

A pointer whose target has been invalidated, while the pointer itself
remains unchanged and appears exactly as usable as before, is called a
**dangling pointer** — the same term already introduced in Lesson 86
for a stack variable whose frame was destroyed. Use-after-free is the
heap-memory version of that same underlying problem, and — as the next
unit shows — considerably more dangerous in practice, because heap
memory is actively, routinely reused by later allocations in a way a
destroyed stack frame usually isn't within the same few instructions.

---

## Concept Unit: The Real Danger — Silent Aliasing

### The Problem

The previous unit's garbage values are alarming but relatively
harmless — nothing else in that program touched the freed memory. Real
use-after-free bugs are far more dangerous specifically because freed
memory gets *reused*: a later, completely unrelated allocation can
receive the exact same address, and the dangling pointer starts
silently reading and writing someone else's data.

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

struct Account {
    char owner[16];
    int balance;
};

int main() {
    struct Account *a = malloc(sizeof(struct Account));
    snprintf(a->owner, sizeof(a->owner), "Alice");
    a->balance = 1000;
    printf("account a: owner=%s, balance=%d, address=%p\n", a->owner, a->balance, (void *)a);

    free(a);   // 'a' is now dangling -- but the ADDRESS is still remembered

    struct Account *b = malloc(sizeof(struct Account));
    snprintf(b->owner, sizeof(b->owner), "Bob");
    b->balance = 50;
    printf("account b: owner=%s, balance=%d, address=%p\n", b->owner, b->balance, (void *)b);

    printf("account a (after b's allocation): owner=%s, balance=%d\n", a->owner, a->balance);

    return 0;
}
```

### Run It

```
account a: owner=Alice, balance=1000, address=0x562decd972a0
account b: owner=Bob, balance=50, address=0x562decd972a0
account a (after b's allocation): owner=Bob, balance=50
```

Look at the two addresses: **identical.** `glibc`'s allocator, having
just had exactly one `sizeof(struct Account)`-sized block returned via
`free(a)`, handed that *exact same block* straight back out for `b`'s
allocation — a completely ordinary, expected, and efficient thing for
an allocator to do. And `a`, never touched by any code after `free(a)`
was called, now reads `"Bob"` and `50` — **not because anything wrote
to `a` directly**, but because `a` and `b` are, at this point, two
different names for the exact same memory.

### Mechanical Walkthrough

- `free(a);` then `struct Account *b = malloc(sizeof(struct Account));`
  — the allocator's internal free-list (conceptually similar to a
  cache of "blocks currently available for reuse," related in spirit
  to Lesson 72's own LRU eviction logic, though the allocator's real
  strategy differs) offered up the just-freed block for this new
  request — a real, common, and entirely correct allocator behavior,
  not a bug in `malloc` itself.
- `printf("...%s, %d...", a->owner, a->balance);` — this final line
  never mentions `b` at all. It reads through `a`, exactly as it did
  in the very first `printf` call. The *code* is identical in shape;
  the *meaning* has completely changed underneath it, because the
  memory `a` refers to is now `b`'s data, not `a`'s.

### CS Lens

Two different pointers unintentionally referring to the same memory,
where writes through one are silently visible through the other, is
called **aliasing** — usually a deliberate, useful tool (Lesson 82's
own pointer-swap relies on exactly this), but genuinely dangerous when
it happens *unintentionally*, across what the program's own logic
believes are two separate, unrelated objects. This is the concrete
mechanism behind a large share of real-world use-after-free security
vulnerabilities: an attacker who can influence *when* a freed object's
memory gets reused, and *by what*, can sometimes make a program treat
attacker-controlled data as if it were a trusted, previously-validated
object — a genuinely serious class of real bug, which is exactly why
this failure mode is worth taking seriously rather than dismissing as
a corner case.

---

## What Breaks Without This — a Real Double-Free

### The Problem

A closely related mistake: calling `free` twice on the same pointer.
Worth proving directly that this is caught, and how.

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    *p = 42;
    printf("allocated and set: %d\n", *p);

    free(p);
    printf("freed once\n");

    free(p);   // freeing the SAME pointer a second time
    printf("if you see this, the double free wasn't caught\n");

    return 0;
}
```

### Run It

```
allocated and set: 42
freed once
free(): double free detected in tcache 2
Aborted
exit code: 134
```

The final `printf` never runs. **glibc's own memory allocator caught
this directly and aborted the program** — `free(): double free
detected in tcache 2`, `SIGABRT`, exit `134` — the same signal and
exit code as Lesson 87's stack-smashing detection, a different
subsystem catching a different category of corruption, using the same
underlying defensive philosophy: detect the corruption and terminate
immediately, rather than continue running with a corrupted allocator
state.

### Why This Is Catchable (and Why the Earlier Bug Often Isn't)

This specific mistake — freeing the *exact same pointer* twice, with
nothing else happening in between — is something glibc's allocator can
often detect, because it maintains its own internal bookkeeping about
which blocks are currently free, and can notice "this block is already
marked free." The earlier aliasing example is fundamentally *not*
detectable this way: reading through a dangling pointer after its
memory has been reused isn't an operation the allocator is even
involved in at all — `*a` is a plain memory read, indistinguishable at
that point from any other legitimate read, which is exactly why
use-after-free bugs are, in general, considerably harder to catch
automatically than double-frees.

## Concept Unit: The Fix — NULL It Out, Then Check

### The Problem

Given everything proven above, the standard, real defense is simple:
after freeing a pointer, immediately set it to `NULL`, and never
dereference a pointer without confirming it isn't `NULL` first.

### Project Change

- **Reference Source:** `uaf_basic.c` — this is a direct, deliberate
  fix to that exact pattern.
- **Files affected:** `uaf_fixed.c` (new file).
- **Change type:** modify.
- **Location:** immediately after the `free(p)` call.
- **Dependencies:** `NULL`, already established (Lesson 83, Lesson 85).

### The New Code

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    *p = 42;
    printf("before free: *p = %d\n", *p);

    free(p);
    p = NULL;   // the fix: nothing can reach the freed memory through 'p' anymore

    if (p != NULL) {
        printf("after free:  *p = %d\n", *p);
    } else {
        printf("after free:  p is NULL -- safely refused to dereference freed memory\n");
    }

    free(p);   // freeing NULL is explicitly defined and safe -- a real no-op
    printf("freed NULL safely -- no crash, no double-free\n");

    return 0;
}
```

### Run It

```
before free: *p = 42
after free:  p is NULL -- safely refused to dereference freed memory
freed NULL safely -- no crash, no double-free
```

No crash, no garbage read, no double-free — even the second `free(p)`
call at the end is completely safe, because `p` is `NULL` by that
point.

### Mechanical Walkthrough

- `free(p); p = NULL;` — **the entire fix, in one added line.**
  Freeing the memory doesn't change `p`'s value automatically (proven
  in the very first unit), so this line does it explicitly — after
  this point, `p` no longer refers to the freed block at all; it holds
  the same well-defined "points at nothing" value already established
  in Lesson 83 and Lesson 85.
- `if (p != NULL) { ... } else { ... }` — a real, checkable guard,
  reappearing directly from Lesson 83's own NULL-check pattern against
  a failed `malloc` — here applied to the *output* of a `free`
  discipline instead of the *input* of an allocation, but the same
  underlying habit: never dereference a pointer without first
  confirming it's safe to.
- `free(p);` (the second call) — **first appearance of confirming
  `free(NULL)` is explicitly, deliberately safe.** The C standard
  guarantees `free` on a `NULL` pointer does nothing at all — a real,
  documented no-op, not undefined behavior — which is exactly why
  setting a pointer to `NULL` after freeing it doesn't just prevent
  use-after-free, it also makes a later, accidental second `free` call
  on the same variable completely harmless instead of a crash.

### CS Lens

Overwriting a reference immediately after releasing what it pointed to
— so a stale reference can never silently persist — is a real,
standard defensive discipline, sometimes summarized as "null it after
you free it." It doesn't fix every possible use-after-free (a *second*
pointer to the same memory, one this lesson's fix never touched, would
still dangle exactly as before, restating this lesson's aliasing
danger) — but it closes off the single most common, most direct
version of the mistake, cheaply and reliably, which is exactly why it
is a genuinely common convention in real, careful C code.

## Exercises

- Extend the aliasing demo to a third `struct Account *c`, allocated
  *before* `free(a)` is called (so it can't reuse `a`'s block) — confirm
  `c` gets a different address than `a`, and that `a`'s dangling read
  only aliases allocations that happen *after* the free.
- Deliberately write to `a->balance = 99999;` *after* `free(a)` but
  *before* `b`'s allocation, then observe what `b->balance` reads as
  once it's allocated — confirm a use-after-free *write* can corrupt
  data that hasn't even been allocated yet, from the perspective of
  the code that will eventually use it.
- Research **Valgrind**'s `--track-origins=yes` option (already
  mentioned in Lesson 83's exercises) specifically for use-after-free
  detection, and run it against `uaf_basic.c` to see how a dedicated
  tool reports this bug compared to this lesson's own manual
  observation.
- Write a small "smart pointer"-style wrapper struct that pairs a raw
  pointer with a boolean `is_valid` flag, automatically set to `false`
  by a custom `safe_free` function — research how this pattern
  previews what Lesson 89/90 (Rust's ownership model) enforces
  automatically, at compile time, instead of by convention.

## Definition of Done

- [ ] The basic use-after-free demo run multiple times on your own
      machine, confirming genuinely different garbage values for
      `*p` after `free`, none matching the original `42`.
- [ ] The aliasing demo run for real, confirming `a` and `b` receive
      the *same* address, and that reading through the freed `a`
      pointer afterward shows `b`'s data.
- [ ] The double-free demo run for real, confirming a genuine
      `"double free detected"` message and `SIGABRT` (exit `134`).
- [ ] `uaf_fixed.c` run, confirming no crash, a clean NULL-check
      message, and a safe second `free(NULL)` call.
- [ ] Can explain out loud, without looking at the code, why a
      double-free is often catchable by the allocator while a
      use-after-free *read* usually is not.
- [ ] Committed, with a message explaining *why* — e.g.
      `"Use-after-free from scratch: a dangling pointer's memory gets
      silently reused by later allocations, a real double-free caught
      by glibc, and why nulling a pointer after free is the standard
      defense"` — not `"add use-after-free examples"`.
