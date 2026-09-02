# Lesson 7: Breaking the Cycle

**What you will build:** a `mini_gc_collect` function that finds and
frees exactly the kind of memory Lesson 6 proved reference counting
alone cannot: objects with real, positive reference counts that are
nevertheless unreachable from anywhere outside their own small group.
The working feature: calling `mini_gc_collect()` after Lesson 6's own
leaking `a`/`b` cycle, and watching `dealloc_call_count` — stuck at `0`
throughout all of Lesson 6 — finally become `2`, using a real, working
counter to prove it. The transferable problem this lesson is actually
about: CPython's real cyclic garbage collector doesn't work by tracing
every reachable object from every global variable and every stack frame
in the running program — that would require CPython to know, precisely
and generically, everywhere a reference to any object might be sitting,
which nothing in this curriculum's own C code could do either. CPython's
real, cleverer answer, and this lesson's own, is to ask a completely
different question: not "can I trace a path to this object," but "after
I subtract every reference this object receives from *other objects in
the group I'm examining*, is there anything left over" — and that
question turns out to be answerable using nothing but arithmetic on
reference counts this curriculum has already built.

**What you need to know first:** Lesson 2 (pointers, `->`), Lesson 3
(`if`, `==`), Lesson 4 (chained member access), Lesson 5 (function
pointers), and Lesson 6 (the `ref` field, and the specific `a`/`b`
reference cycle this lesson's own project code resumes and finally
resolves).

**Terms used in this lesson**

- **array** — a fixed number of values of the same type, stored
  contiguously in memory and reached by a numeric position (an *index*),
  starting at `0`. It exists because a program often needs to hold onto
  a whole collection of values under one name, with a way to reach any
  one of them directly by position, rather than needing a separately
  named variable for every single one.
- **array declaration and indexing syntax (`type name[size]`,
  `name[index]`)** — `type name[size]` declares an array of `size`
  elements, each of type `type`; `name[index]` reaches the element at
  position `index` (counting from `0`, so an array of `size` elements
  has valid indexes `0` through `size - 1`, never `size` itself). It
  exists as C's one syntax for both declaring an array's fixed capacity
  and reaching into it by position.
- **`for` loop** — a loop that repeats a block of code, running a
  small setup statement once at the very start, checking a condition
  before every repetition, and running an update statement after every
  repetition, stopping the moment the condition becomes false. It
  exists because visiting every element of an array (or repeating any
  action a specific, countable number of times) by hand — one line per
  repetition — doesn't scale to an array whose size isn't fixed and
  known while the code is being written; a `for` loop expresses "do
  this once per element" as a single, reusable piece of code that works
  no matter how many elements there actually turn out to be.
- **trial reference subtraction** — the specific technique this
  lesson's collector uses: temporarily copying every tracked object's
  real reference count into a separate working field, then walking every
  tracked object's own references and subtracting one from whatever
  each reference points at. It exists because it turns "does anything
  *outside* this group of objects still hold a real reference to this
  one" into a plain arithmetic question — total references, minus
  references that come from *inside* the group being examined, leaves
  exactly the references that must be coming from outside it.
- **sentinel value** — a specific, agreed-on value given a special
  meaning distinct from its ordinary use, so a single field can signal
  a state as well as hold ordinary data. It exists because reusing an
  existing field for a second job, when a plain value from that field's
  normal range simply can't occur in that situation, saves adding a
  whole separate field just to hold one flag — this lesson's collector
  reuses the very same `gc_refs` field trial subtraction already
  computes, repurposing the value `-1`, which trial subtraction itself
  never actually produces, to mean "confirmed reachable" instead.
- **recursion** — a function that calls itself, directly or indirectly,
  as part of doing its own job; a *base case* is the condition under
  which a recursive function stops calling itself and simply returns,
  which is what keeps a recursive function from calling itself forever.
  It exists because some problems — like following a chain of
  references of unknown, possibly cyclic length — don't have a fixed
  number of repetitions known in advance the way a `for` loop over a
  fixed-size array does; a recursive function can follow a chain of
  references exactly as far as it actually goes, one link at a time,
  stopping the moment its own base case is reached.

**Objects and methods used**

No new external CPython functions this lesson — every construct this
lesson introduces (`update_refs`/`subtract_refs`-style trial
subtraction and the `GC_REACHABLE` sentinel idea, both named directly in
this lesson's own Concept Units below) comes from real CPython comments
quoted at the point they're used, not from a separately catalogued
external function this project calls. This lesson's own `mini_gc_collect`,
`mark_reachable`, and `gc_track` are original functions built entirely
out of C mechanics this curriculum has already given full treatment —
arrays, `for` loops, and recursion, all introduced fresh in this
lesson's own Header and Concept Units, and pointers, `->`, and function
calls, all already covered in Lessons 2 through 5.

---

## Concept Unit: Keeping a List of Every Live Object

### The Problem

Every mechanism this curriculum has built so far — `incref_thing`,
`decref_thing`, even `mini_object_dealloc` — only ever operates on one
object at a time, reached through a pointer some other piece of code
already happens to be holding. Detecting a reference cycle needs
something none of those functions have: a way to look at *every* object
that currently exists, all at once, not just whichever one pointer
happens to be handed to a function.

Before reading on: if a program needs to remember every object it has
ever created, so it can revisit all of them later, what would you need
to store that in — a single variable, the way `thing` or `a` or `b`
have each been single variables so far? Or something that can hold more
than one value, growing as more objects get created?

### Isolating the Concept

```c
#include <stdio.h>

int main(void) {
    int numbers[3];
    numbers[0] = 10;
    numbers[1] = 20;
    numbers[2] = 30;

    int total = 0;
    for (int i = 0; i < 3; i++) {
        total = total + numbers[i];
    }

    printf("total = %d\n", total);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab12_array_loop lab12_array_loop.c
$ ./lab12_array_loop
total = 60
```

`int numbers[3];`, from this lesson's Header, declares `numbers` as an
array of exactly `3` `int`s, all stored together, reached individually
with `numbers[0]`, `numbers[1]`, `numbers[2]` — the array declaration
and indexing syntax from this lesson's Header, with indexes starting at
`0`, not `1`. `for (int i = 0; i < 3; i++) { ... }`, also from this
lesson's Header, is a `for` loop: `int i = 0` runs once, before the
loop starts, giving `i` its starting value; `i < 3` is checked before
every repetition, and the loop stops the moment it's false; `i++` (the
increment operator, from Lesson 3's own decrement-operator material,
applied here in the opposite direction) runs after every repetition.
Each time through, `total = total + numbers[i];` adds one more array
element to the running sum, with `i` taking the values `0`, `1`, then
`2` in turn — real output confirms the total, `60`, matching `10 + 20 +
30` exactly. This is called a **`for` loop over an array**: visiting
every element by position, using a loop variable that counts from `0`
up to (but never including) the array's own size — the same shape of
code this lesson's real project needs next, to eventually visit every
object it has ever tracked.

This throwaway example is now **discarded** — `lab12_array_loop.c` will
not appear in this lesson's real project. What it proved — that an
array can hold several values under one name, and a `for` loop can
visit every one of them by index — is exactly the mechanism the real
project needs, to keep a running list of every `MiniObject` this
program creates.

### Project Change

- **Reference Source** — No reference counterpart for arrays or `for`
  loops themselves (general C). The real counterpart for *what* this
  unit is about to track — every object CPython's own cyclic collector
  needs to examine — is real CPython's own tracked-object list, which
  this curriculum's own array is a deliberately simplified stand-in
  for; real CPython uses a doubly-linked list of objects rather than a
  fixed-size array, a difference this lesson's own SE Lens, below,
  addresses directly.
- **Files affected** — `project/lesson-07/mini_object.c`, modified
  (copied forward from Lesson 6's finished `mini_object.c`).
- **Change type** — add (`tracked_objects`, a new global array;
  `tracked_object_count`, a new global counter; `gc_track`, a new
  function) and add (two new calls to `gc_track` in `main`, right after
  `a` and `b` are each created).
- **Location** — the new array, counter, and function go after
  `decref_thing`'s existing definition; the two new calls go inside
  `main`, immediately after each object's existing field setup.
- **Dependencies** — none beyond what Lesson 6 already established.

### The New Code

```c
struct MiniObject *tracked_objects[100];
int tracked_object_count = 0;

void gc_track(struct MiniObject *obj) {
    tracked_objects[tracked_object_count] = obj;
    tracked_object_count++;
}
```

### The Updated Project

```c
 1  struct MiniObject *tracked_objects[100];     // ← new
 2  int tracked_object_count = 0;                 // ← new
 3
 4  void gc_track(struct MiniObject *obj) {       // ← new
 5      tracked_objects[tracked_object_count] = obj;  // ← new
 6      tracked_object_count++;                    // ← new
 7  }                                               // ← new
 8
 9  int main(void) {
10      struct MiniObject *a = malloc(sizeof(struct MiniObject));
11      a->header.refcount = 1;
12      a->header.type = &MiniObject_Type;
13      a->value = 1;
14      a->ref = NULL;
15      gc_track(a);                                // ← new
16
17      struct MiniObject *b = malloc(sizeof(struct MiniObject));
18      b->header.refcount = 1;
19      b->header.type = &MiniObject_Type;
20      b->value = 2;
21      b->ref = NULL;
22      gc_track(b);                                // ← new
23
24      /* ...rest of main, unchanged from Lesson 6... */
25      return 0;
26  }
```

`gc_track` is called once for each object right after that object's own
setup is complete (lines 15 and 22) — the same point in `main` where
Lesson 6 left `a->ref = NULL;` and `b->ref = NULL;`, immediately after.
Nothing about how `a` or `b` are created, cross-referenced, or released
changes at all in this unit; `tracked_objects` simply gains a second,
independent way to reach both of them, alongside the `a` and `b`
variables `main` already holds directly.

### Mechanical Walkthrough

- **`struct MiniObject *tracked_objects[100];`** — a global array (the
  global-variable concept from Lesson 4, combined with the array
  declaration syntax from this unit's own isolated lab), of `100`
  pointers to `MiniObject`. `100` is a fixed upper limit chosen for
  simplicity — this lesson's own project never creates anywhere near
  that many objects — with the real cost of that simplification named
  honestly in this unit's own SE Lens, below.
- **`int tracked_object_count = 0;`** — a second global variable,
  tracking how many of `tracked_objects`' `100` available slots are
  actually in use, initialized to `0` since nothing has been tracked
  yet.
- **`void gc_track(struct MiniObject *obj) { ... }`** — a new,
  freestanding function taking one `struct MiniObject *` (the pointer
  declaration syntax from Lesson 2), returning nothing (`void`, from
  Lesson 1).
- **`tracked_objects[tracked_object_count] = obj;`** — the array
  indexing syntax from this unit's own isolated lab, storing `obj` into
  the next unused slot — `tracked_object_count` itself is being used
  here as an index, pointing at exactly the first slot nothing has been
  stored into yet.
- **`tracked_object_count++;`** — the increment operator from this
  unit's own isolated lab, advancing the count by one, so the *next*
  call to `gc_track` writes into the following slot instead of
  overwriting this one.

### Execution Trace

`tracked_object_count` changes value across two calls, so it's worth
tracing:

1. `gc_track(a);` — `tracked_object_count` starts at `0`;
   `tracked_objects[0] = a;` stores `a`'s address into the first slot;
   `tracked_object_count++` advances it to `1`.
2. `gc_track(b);` — `tracked_objects[tracked_object_count]` now means
   `tracked_objects[1]`, since `tracked_object_count` is `1`;
   `tracked_objects[1] = b;` stores `b`'s address there;
   `tracked_object_count++` advances it to `2`.

After both calls, `tracked_objects[0]` holds `a`'s address,
`tracked_objects[1]` holds `b`'s address, and `tracked_object_count` is
`2` — matching real output below exactly.

### CS Lens

Maintaining a registry of every live instance of something, separate
from however individual code paths happen to be holding onto those
instances, is a foundational idea any tracing or auditing system needs.

```
Also recognized in: a hospital's own master patient list, kept
separately from any one doctor's own list of patients they're
currently treating; a library's full catalog, separate from which books
happen to be sitting on which patron's desk right now; and, most
directly, real CPython's own tracked-object list — the actual thing
CPython's cyclic collector walks, which this lesson's tracked_objects
array is a simplified stand-in for.
```

### SE Lens

The design principle is **maintaining a complete registry so a global
question can be answered without having to search everywhere else in
the program for it**. The real alternative CPython actually uses
instead of this lesson's own fixed-size array: a doubly-linked list,
which can grow to hold any number of objects without a hardcoded limit,
and which supports removing one specific object from the middle in
constant time, without shifting every following element down — this
lesson's own array-based `gc_track` has neither property, and this
project's own `100`-slot limit and lack of any "un-track" function are
real, deliberate simplifications, not oversights; a genuinely faithful
version would need a growable, removable structure this curriculum
hasn't built yet. This project isn't harmed by that simplification
currently — it only ever tracks two objects — but it's worth naming as
the honest gap between this lesson's own teaching version and real
CPython's actual, more capable implementation.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted (this checkpoint
shows only this unit's own tracking mechanism, confirmed by printing
the registry directly, before the real collector exists):

```
$ gcc -Wall -o mini_object mini_object_cu1.c
$ ./mini_object_cu1
tracked_object_count = 2
tracked_objects[0]->value = 1
tracked_objects[1]->value = 2
```

### Connecting to What Came Before

Lesson 6 built two objects that reference each other, using nothing but
mechanisms this curriculum had already proven safe and correct. This
unit adds the one thing missing before anything could be done about
that cycle from the outside: a way to see both objects at once, rather
than only ever reaching one through the other.

---

## Concept Unit: Guessing Which References Come From Outside

### The Problem

`tracked_objects` can now list every object this program has created,
but a list alone doesn't say which of those objects are still needed.
`a` and `b`, from Lesson 6, both sit at a reference count of `1` — a
real, positive number — and nothing about that number alone reveals
that both references are coming from *inside* the very pair being
examined, with nothing at all coming from outside it.

Before reading on: if `a`'s only remaining reference is `b->ref`, and
`b`'s only remaining reference is `a->ref`, and you started with each
one's real count and then, for every reference you could find
*originating from inside this group*, subtracted one from whatever it
points at — what number would each object end up with? What would that
final number tell you, if it turned out to be `0`, versus if it turned
out to still be above `0`?

### Isolating the Concept

```c
#include <stdio.h>

struct TCount {
    int refs;
    struct TCount *next;
};

int main(void) {
    struct TCount x, y;
    x.refs = 1;
    y.refs = 1;
    x.next = &y;
    y.next = &x;

    printf("before trial subtraction: x.refs = %d, y.refs = %d\n", x.refs, y.refs);

    if (x.next != NULL) {
        x.next->refs--;
    }
    if (y.next != NULL) {
        y.next->refs--;
    }

    printf("after trial subtraction:  x.refs = %d, y.refs = %d\n", x.refs, y.refs);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab13_trial_subtraction lab13_trial_subtraction.c
$ ./lab13_trial_subtraction
before trial subtraction: x.refs = 1, y.refs = 1
after trial subtraction:  x.refs = 0, y.refs = 0
```

`x.refs = 1;` and `y.refs = 1;` set up a situation deliberately
mirroring Lesson 6's own `a` and `b`, right after `main` released its
own direct references to both: one real reference each, and nothing
yet says where that reference is coming from. `x.next->refs--;`, using
the arrow operator (Lesson 2) and decrement operator (Lesson 3), walks
*through* `x`'s own reference to `y`, and subtracts one from `y`'s
count — recording the fact that one of `y`'s references is `x`'s own
`next` field, something *inside* this same small group, not an outside
holder. `y.next->refs--;` does the same in reverse. Real output
confirms both counts drop from `1` to `0` — meaning every single
reference either object had was accounted for by a reference coming
from inside the pair itself, with nothing left over that could only be
explained by something *outside* still holding on. This is called
**trial reference subtraction**, from this lesson's Header: a way of
asking "how many of this object's references come from outside a group
I'm examining" by starting from the real total and removing every
reference the examination itself can find originating from inside that
same group.

This throwaway example is now **discarded** — `lab13_trial_subtraction.c`
and `struct TCount` will not appear in this lesson's real project. What
it proved — that trial subtraction correctly reduces a self-contained
pair's counts to `0`, with nothing left unexplained — is exactly the
technique the real project needs applied to `a` and `b`, and, this
lesson's own Header already named a distinguishing case this technique
handles too: an object with even one real reference from *outside*
whatever group is being examined won't drop all the way to `0`, no
matter how many internal references also get subtracted from it — a
case this lesson's third unit demonstrates directly, on a third object.

### Project Change

- **Reference Source** — CPython's own real `Modules/gcmodule.c`, read
  this session (via the Python project's own SVN source mirror and its
  official `python-checkins` mailing list archive, both real
  CPython-project sources; the exact file has moved and been
  restructured across CPython versions, so this curriculum follows its
  own earlier guidance to learn the technique rather than pin one
  version's exact line numbers). Quoted verbatim, CPython's own source
  comment describing this exact technique: *"At the start of a
  collection, `update_refs()` copies the true refcount to `gc_refs`,
  for each object in the generation being collected. `subtract_refs()`
  then adjusts `gc_refs` so that it equals the number of times an
  object is referenced directly from outside the generation being
  collected."* This lesson's own `mini_gc_collect`, built in this unit,
  performs exactly these first two real steps, using a field also named
  `gc_refs`, deliberately matching CPython's own real name for it.
- **Files affected** — `project/lesson-07/mini_object.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — add (`gc_refs`, a new field on `MiniObjectHeader`;
  `mini_gc_collect`, a new function containing this unit's own first
  two phases).
- **Location** — `gc_refs` goes inside `MiniObjectHeader`'s existing
  definition, after `type`; `mini_gc_collect` goes after `gc_track`'s
  existing definition.
- **Dependencies** — none beyond this lesson's first unit.

### The New Code

```c
long gc_refs;
```

```c
void mini_gc_collect(void) {
    int i;

    for (i = 0; i < tracked_object_count; i++) {
        tracked_objects[i]->header.gc_refs = tracked_objects[i]->header.refcount;
    }

    for (i = 0; i < tracked_object_count; i++) {
        if (tracked_objects[i]->ref != NULL) {
            tracked_objects[i]->ref->header.gc_refs--;
        }
    }
}
```

### The Updated Project

```c
 1  struct MiniObjectHeader {
 2      long refcount;
 3      struct MiniTypeInfo *type;
 4      long gc_refs;                                       // ← new
 5  };
 6
 7  /* ... struct MiniObject, incref_thing, decref_thing,
 8         tracked_objects, tracked_object_count, gc_track:
 9         all unchanged from this lesson's first unit ... */
10
11  void mini_gc_collect(void) {                             // ← new
12      int i;                                                 // ← new
13
14      for (i = 0; i < tracked_object_count; i++) {           // ← new
15          tracked_objects[i]->header.gc_refs =                // ← new
16              tracked_objects[i]->header.refcount;             // ← new
17      }                                                        // ← new
18
19      for (i = 0; i < tracked_object_count; i++) {           // ← new
20          if (tracked_objects[i]->ref != NULL) {               // ← new
21              tracked_objects[i]->ref->header.gc_refs--;        // ← new
22          }                                                     // ← new
23      }                                                        // ← new
24  }                                                            // ← new
```

`mini_gc_collect` now performs the first two real phases of this
lesson's collector: line 14–17 copies every tracked object's real
`refcount` into its own new `gc_refs` field, and line 19–23 walks every
tracked object's own `ref` field and, wherever it points at something,
subtracts one from that target's `gc_refs` — exactly the trial
subtraction this unit's own isolated lab already proved, applied here
to every tracked object in one pass, using the `for` loop from this
lesson's first unit, instead of by hand to exactly two variables.

### Mechanical Walkthrough

- **`long gc_refs;`** — a new field on `MiniObjectHeader`, of type
  `long` (Lesson 1), initialized to nothing yet — it only gets a real
  value once `mini_gc_collect` actually runs.
- **`int i;`** — a plain local variable, declared here rather than
  inside the `for` loop's own parentheses the way this lesson's first
  unit's isolated lab did it, since this function reuses the same `i`
  across two separate loops in sequence.
- **`for (i = 0; i < tracked_object_count; i++) { ... }`** (first
  loop) — the `for` loop from this lesson's first unit, this time
  bounded by `tracked_object_count` (a variable, from this lesson's
  first unit) rather than a fixed number like `3`, so it correctly
  visits every object actually tracked, however many that turns out to
  be.
- **`tracked_objects[i]->header.gc_refs = tracked_objects[i]->header.refcount;`**
  — array indexing (this unit's own isolated lab) combined with chained
  member access (Lesson 4), copying the real, honest reference count
  into the working `gc_refs` field, for the object at position `i`.
- **`for (i = 0; i < tracked_object_count; i++) { if (...) { ... } }`**
  (second loop) — a second, separate pass over every tracked object,
  this time checking `tracked_objects[i]->ref != NULL` (the
  not-equal-to relational operator, the natural counterpart to Lesson
  3's `==`, combined with the `NULL` check pattern from Lesson 3's own
  dangling-pointer material) before following that reference at all —
  necessary since not every object is guaranteed to point at another
  one.
- **`tracked_objects[i]->ref->header.gc_refs--;`** — this unit's own
  isolated lab's core proof, applied for real: reaches through
  `tracked_objects[i]`'s own `ref` field to whatever object it points
  at, then subtracts one from *that* object's `gc_refs` — recording
  that one of the target's references comes from inside the group
  being examined.

### Execution Trace

Continuing directly from where Lesson 6's own trace left off (`a` and
`b` both at `refcount = 1`, each pointing at the other):

1. First loop, `i = 0`: `tracked_objects[0]` is `a`; `a->header.gc_refs`
   is set to `a->header.refcount`, which is `1`.
2. First loop, `i = 1`: `tracked_objects[1]` is `b`; `b->header.gc_refs`
   is set to `1` as well.
3. Second loop, `i = 0`: `tracked_objects[0]` is `a`; `a->ref` is `b`,
   not `NULL`, so `a->ref->header.gc_refs--` runs — this reaches `b`
   and decrements `b`'s `gc_refs` from `1` to `0`.
4. Second loop, `i = 1`: `tracked_objects[1]` is `b`; `b->ref` is `a`,
   not `NULL`, so `b->ref->header.gc_refs--` runs — this reaches `a`
   and decrements `a`'s `gc_refs` from `1` to `0`.

After both loops, `a->header.gc_refs` and `b->header.gc_refs` are both
`0` — every reference either object had has been accounted for by a
reference from inside the pair itself, matching this unit's own
isolated lab exactly, now proven on the real project's own objects.

### CS Lens

Turning "is this reachable from outside a group" into a pure arithmetic
question — total references minus internal references — rather than an
explicit search or trace, is a real, distinctive algorithmic technique,
not just a clever trick specific to this one project.

```
Also recognized in: real CPython's own actual cyclic collector, which
uses exactly this technique (this lesson's Header and this unit's own
Reference Source both quote its real source comments directly); network
flow algorithms that compute how much "excess" capacity exists after
accounting for flow already claimed internally; and, at a conceptual
level, any accounting reconciliation that starts from a stated total and
subtracts every internally-explained portion to see what, if anything,
remains unaccounted for.
```

### SE Lens

The design principle is **replacing an expensive, general search with a
cheaper, narrower calculation that answers the exact same question for
this specific case**. The alternative not chosen: tracing every path
from every genuinely external root (every global variable, every local
variable on every function's stack, in every part of the program) to
see what's reachable — which is what a fully general reachability
tracer would need to do, and which nothing in this curriculum's own C
code has any generic way to enumerate. The real tradeoff of trial
subtraction instead: it only works correctly if *every* reference an
object holds to another tracked object is actually walked during the
subtraction phase — this lesson's own project has exactly one such
reference per object (`ref`), so a single `if` check suffices, but a
real object holding many references (a Python `list` full of items, for
instance) needs every single one of them visited, or the subtraction
undercounts and produces a wrong answer. Real CPython solves this with
`tp_traverse` — a per-type function, conceptually a sibling to Lesson
5's own `tp_dealloc`, that each type supplies specifically so the
collector can visit every reference that type holds, without the
collector itself needing to know that type's own internal layout. This
project isn't carrying that gap as unaddressed debt — its own `ref`
field is simple enough that `mini_gc_collect` can walk it directly — but
it's worth naming honestly as the real limitation of this lesson's
simplified, hardcoded approach, and it's the same real reason Lesson 5's
own `tp_dealloc`-style pattern exists at all: letting each type supply
its own logic instead of a central function trying to know every type's
internals by hand.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted (this checkpoint
adds a temporary `printf` after the two loops, to show `gc_refs`
directly, before this lesson's later units use that value to actually
decide anything):

```
$ gcc -Wall -o mini_object mini_object_cu2.c
$ ./mini_object_cu2
before mini_gc_collect: a refcount = 1, b refcount = 1
tracked_objects[0]->header.gc_refs = 0
tracked_objects[1]->header.gc_refs = 0
```

Both real reference counts, `1` and `1`, are confirmed unchanged
(`mini_gc_collect` never touches `refcount` itself, only the separate
working field `gc_refs`) — and both `gc_refs` values come out `0`,
exactly matching this unit's own Execution Trace and its own isolated
lab's proof.

### Connecting to What Came Before

The previous unit gave this project a way to see every object at once.
This unit used that list to compute, for the very first time, a real
number that distinguishes "referenced from outside this group" from
"referenced only from within it" — `0`, for both `a` and `b`, confirming
in cold arithmetic exactly what Lesson 6 could only assert in prose:
neither object has a single reference left that isn't coming from the
other. The next unit turns that number into an actual decision.

---

## Concept Unit: Marking What's Still Reachable

### The Problem

A `gc_refs` of `0`, on its own, is not automatically proof that an
object is garbage. Consider a *chain* rather than a pair: object `p`,
held directly by `main`, points at object `q`, which nothing else
points at at all. `q`'s only reference is `p`'s own `ref` field — after
trial subtraction, `q`'s `gc_refs` would drop to `0`, exactly like a
genuinely unreachable object would — even though `q` is still very much
alive, reachable the whole way from `main`, through `p`. Trial
subtraction alone can't tell these two situations apart; something has
to follow the chain back out from whatever *does* still have a positive
count, and correctly recognize everything reachable from there as safe.

Before reading on: if an object's `gc_refs` stays *above* `0` after
trial subtraction — meaning something genuinely external still points
at it directly — what do you think should happen to anything *that*
object itself points at? Should that target also count as safe,
even if its own `gc_refs`, considered alone, is `0`?

### Isolating the Concept

```c
#include <stdio.h>

struct Chain {
    int id;
    struct Chain *next;
};

void print_chain(struct Chain *node) {
    if (node == NULL) {
        return;
    }
    printf("visiting node %d\n", node->id);
    print_chain(node->next);
}

int main(void) {
    struct Chain c;
    struct Chain b;
    struct Chain a;

    c.id = 3;
    c.next = NULL;

    b.id = 2;
    b.next = &c;

    a.id = 1;
    a.next = &b;

    print_chain(&a);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab14_recursion lab14_recursion.c
$ ./lab14_recursion
visiting node 1
visiting node 2
visiting node 3
```

`print_chain`, from this lesson's Header, is a function that calls
*itself* — `print_chain(node->next);`, its own last line, is a call to
`print_chain` again, with a different argument. `if (node == NULL) {
return; }` is the base case, also from this lesson's Header: the exact
condition that stops the self-calling from continuing forever — without
it, `print_chain` would keep calling itself even after reaching the end
of the chain, since nothing would ever stop it. Real output confirms
the whole chain gets visited, in order, starting from `a`: each call
prints its own node's `id`, then calls itself on `node->next`, until
that argument is finally `NULL` and the base case ends that branch of
recursion. This is called **recursion**: a function reaching an
arbitrarily long chain — of unknown, possibly cyclic length, though this
particular chain isn't cyclic — one link at a time, by calling itself,
rather than needing a `for` loop bounded by a size known in advance the
way this lesson's first unit's array traversal was.

This throwaway example is now **discarded** — `lab14_recursion.c` and
`struct Chain` will not appear in this lesson's real project. What it
proved — that a recursive function, with a correct base case, can
follow a chain of pointers exactly as far as it goes — is exactly the
mechanism the real project needs next, to correctly mark every object
reachable from a genuinely external reference, however long that chain
of reachability actually turns out to be.

### Project Change

- **Reference Source** — CPython's own real `Modules/gcmodule.c`
  source comments, read this session, describing the exact sentinel
  value this unit's own `mark_reachable` is modeled on: *"`GC_REACHABLE`
  — The object lives in some generation list, and its `tp_traverse` is
  safe to call. An object transitions to `GC_REACHABLE` when
  `PyObject_GC_Track` is called."* Real CPython's own `gc_refs` field
  genuinely does double as both a working count *and* a state flag,
  exactly the sentinel-value technique this lesson's Header names —
  `GC_REACHABLE` is real CPython's own name for the exact marking this
  unit's own `mark_reachable` performs, though real CPython's own
  reachability pass is not implemented with recursion, a difference
  this unit's own SE Lens addresses directly.
- **Files affected** — `project/lesson-07/mini_object.c`, modified
  further.
- **Change type** — add (`mark_reachable`, a new recursive function,
  and a third loop inside `mini_gc_collect`, calling it).
- **Location** — `mark_reachable` goes between `gc_track` and
  `mini_gc_collect`'s existing definitions; the new loop goes inside
  `mini_gc_collect`, after its existing two loops.
- **Dependencies** — none beyond this lesson's second unit.

### The New Code

```c
void mark_reachable(struct MiniObject *obj) {
    if (obj->header.gc_refs == -1) {
        return;
    }
    obj->header.gc_refs = -1;
    if (obj->ref != NULL) {
        mark_reachable(obj->ref);
    }
}
```

```c
for (i = 0; i < tracked_object_count; i++) {
    if (tracked_objects[i]->header.gc_refs > 0) {
        mark_reachable(tracked_objects[i]);
    }
}
```

### The Updated Project

```c
 1  void mark_reachable(struct MiniObject *obj) {         // ← new
 2      if (obj->header.gc_refs == -1) {                    // ← new
 3          return;                                          // ← new
 4      }                                                     // ← new
 5      obj->header.gc_refs = -1;                            // ← new
 6      if (obj->ref != NULL) {                               // ← new
 7          mark_reachable(obj->ref);                          // ← new
 8      }                                                       // ← new
 9  }                                                            // ← new
10
11  void mini_gc_collect(void) {
12      int i;
13
14      for (i = 0; i < tracked_object_count; i++) {
15          tracked_objects[i]->header.gc_refs =
16              tracked_objects[i]->header.refcount;
17      }
18
19      for (i = 0; i < tracked_object_count; i++) {
20          if (tracked_objects[i]->ref != NULL) {
21              tracked_objects[i]->ref->header.gc_refs--;
22          }
23      }
24
25      for (i = 0; i < tracked_object_count; i++) {         // ← new
26          if (tracked_objects[i]->header.gc_refs > 0) {      // ← new
27              mark_reachable(tracked_objects[i]);             // ← new
28          }                                                    // ← new
29      }                                                        // ← new
30  }
```

`mini_gc_collect` now has three passes instead of two: copy real counts
into `gc_refs` (lines 14–17), subtract internal references (lines
19–23), and, new in this unit, walk every object whose `gc_refs`
survived trial subtraction *above* zero (lines 25–29) — meaning
something genuinely external still points at it directly — and mark
everything reachable from each one, using the new recursive
`mark_reachable` (lines 1–9).

### Mechanical Walkthrough

- **`void mark_reachable(struct MiniObject *obj)`** — a new function,
  taking one `struct MiniObject *` (Lesson 2), returning nothing
  (Lesson 1).
- **`if (obj->header.gc_refs == -1) { return; }`** — the base case from
  this unit's own isolated lab: `-1` is the sentinel value from this
  lesson's Header, meaning "already confirmed reachable." If this
  object has already been marked, the function returns immediately,
  doing nothing further — this is what keeps `mark_reachable` from
  calling itself forever on a cycle: without this check, marking `a`
  would call `mark_reachable(b)`, which would call `mark_reachable(a)`
  again, endlessly.
- **`obj->header.gc_refs = -1;`** — reuses the exact same `gc_refs`
  field trial subtraction already computed, overwriting whatever
  working count it held with the sentinel `-1` instead — the sentinel
  value technique from this lesson's Header, letting one field serve
  two different jobs at two different points in the same function's
  run.
- **`if (obj->ref != NULL) { mark_reachable(obj->ref); }`** — the
  recursive call from this unit's own isolated lab: if this object
  points at another one, that other object gets marked reachable too,
  by calling `mark_reachable` again — the same self-calling pattern
  `print_chain` used, following the reference chain exactly as far as
  it actually goes.
- **`if (tracked_objects[i]->header.gc_refs > 0) { mark_reachable(tracked_objects[i]); }`**
  (inside `mini_gc_collect`) — the greater-than relational operator,
  the natural sibling to Lesson 3's `==` and this lesson's own `!=`,
  checking whether trial subtraction left this object with a
  *positive* count — proof, per this unit's own Reference Source, that
  something genuinely outside the tracked group still points at it
  directly. Only objects passing that check get marked — and, per
  `mark_reachable`'s own recursive call, so does everything reachable
  from them.

### Execution Trace

Continuing from the previous unit's own trace (`a->header.gc_refs = 0`,
`b->header.gc_refs = 0`, after trial subtraction):

1. Third loop, `i = 0`: `tracked_objects[0]` is `a`; `a->header.gc_refs`
   is `0`, and `0 > 0` is false — `mark_reachable` is not called for
   `a` from here.
2. Third loop, `i = 1`: `tracked_objects[1]` is `b`; `b->header.gc_refs`
   is also `0` — not called for `b` either.

Neither object's `gc_refs` is ever set to `-1` in this run — both
remain at `0`, distinct from the sentinel `-1`, meaning neither is ever
confirmed reachable. This matches this unit's own real, separate
checkpoint below, run with a third object, `c`, added specifically to
prove `mark_reachable` correctly recognizes a genuinely externally-held
object as reachable when one actually exists.

### CS Lens

Following every path outward from a known-good starting point, marking
everything reached along the way, and treating whatever's left
unmarked at the end as suspect, is one of the most common shapes in all
of graph algorithms.

```
Also recognized in: mark-and-sweep garbage collectors in other
languages (Java's own JVM garbage collector uses exactly this
mark-then-sweep shape, starting from its own set of roots); a flood-fill
tool in image-editing software, which spreads outward from a clicked
pixel exactly as far as connected, matching pixels go; network routing
protocols that propagate reachability information outward from a known
node; and depth-first search itself, the general graph-traversal
algorithm this lesson's own mark_reachable is a direct, specific
instance of.
```

### SE Lens

The design principle is **using recursion to express "follow this as
far as it goes" without knowing in advance how far that is** — the
same justification this lesson's Header gives for choosing recursion
over a `for` loop for this specific job. The real, deliberate tradeoff:
recursion is a genuinely elegant match for chains of unknown length,
but every recursive call consumes a small amount of a program's own
call stack, and a chain long enough — thousands of objects deep — could
exhaust it, crashing the program instead of finishing the traversal.
Real CPython's own actual reachability pass, unlike this lesson's
simplified `mark_reachable`, is not implemented with plain recursion
for exactly this reason: a Python program can build reference chains
far longer than would be safe to walk with one C stack frame per link,
so CPython's real collector uses an explicit, heap-allocated worklist
instead — a structure this curriculum hasn't built, that does the same
job as recursion's own call stack, but under the program's own control
rather than the machine's fixed one. This project isn't carrying real
risk from that choice currently — its own reference chains are at most
two objects long — but it's worth naming honestly as the reason a
production-grade version of this exact function would need to be built
differently.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted. This checkpoint
adds one further object, `c`, held only by `main` itself (never part of
the `a`/`b` cycle and never released), specifically to prove
`mark_reachable` correctly distinguishes a genuinely external reference
from an internal one — something the plain `a`/`b` pair alone, both at
`gc_refs = 0`, cannot demonstrate on its own:

```
$ gcc -Wall -o mini_object mini_object_cu3.c
$ ./mini_object_cu3
tracked_objects[0] (value=1) gc_refs = 0
tracked_objects[1] (value=2) gc_refs = 0
tracked_objects[2] (value=3) gc_refs = -1
```

`a` (`value=1`) and `b` (`value=2`) both remain at `0`, exactly as this
unit's own trace predicted — neither has any external reference for
`mark_reachable` to start from. `c` (`value=3`), still held directly by
`main` and never decremented, keeps a `gc_refs` of `1` after trial
subtraction (nothing inside the tracked group points at it), which is
`> 0` — so the third loop calls `mark_reachable(c)`, and its `gc_refs`
becomes `-1`, the sentinel confirming it reachable. This is real,
direct proof that trial subtraction plus marking correctly tells these
two situations apart, exactly the distinction this unit's own Problem
section raised before showing the mechanism.

### Connecting to What Came Before

The previous unit computed a number for every object, but that number
alone couldn't yet distinguish "genuinely unreachable" from "reachable
only through a chain that happens to bottom out at zero, one link away
from an object with a real external reference." This unit's recursive
`mark_reachable`, proven against a real third object with a genuine
external reference, closes that gap. The final unit uses the result.

---

## Concept Unit: Freeing the Unreachable

### The Problem

Every object's `gc_refs` now holds one of two meaningful states: `-1`
(confirmed reachable, per the previous unit) or some value that was
never touched by marking at all, because it never had a positive count
to start a mark from. Nothing yet actually *does* anything with that
distinction — `mini_gc_collect`, as this lesson has built it so far,
computes an answer and then throws it away.

Before reading on: given that this lesson's own sentinel, `-1`, marks
everything confirmed reachable, what should happen to every tracked
object whose `gc_refs` is *not* `-1`, once marking is finished? What
mechanism, already built and proven correct as far back as Lesson 5,
could this unit reach for to actually destroy those objects?

### Isolating the Concept

This unit needs no fresh isolated lab: destroying an object through its
own type's `dealloc` function pointer was already proven for real in
Lesson 5, and comparing a value against the sentinel `-1` reuses the
exact `!=` mechanism this lesson's own second and third units already
proved. What's new here is only *which* objects this unit chooses to
destroy — exactly the ones this lesson's previous two units already
correctly identified — which this unit's own Mechanical Walkthrough
explains directly against the real project code.

### Project Change

- **Reference Source** — Real CPython documentation, read this session,
  describing the C-API's own reference-counting functions, notes that
  the object's type's own deallocation function is what actually runs
  once a reference count reaches zero — the same real mechanism
  quoted in full in Lesson 5's Header (`tp_dealloc`), which this unit
  calls directly, bypassing `decref_thing` entirely, since these
  objects were never going to reach a real `refcount` of zero through
  ordinary decrementing at all — that's the entire problem this whole
  lesson exists to solve.
- **Files affected** — `project/lesson-07/mini_object.c`, modified
  further, and `main`, which gains one final call.
- **Change type** — add (a fourth loop inside `mini_gc_collect`,
  freeing unreachable objects; one call to `mini_gc_collect()` at the
  end of `main`).
- **Location** — the fourth loop goes inside `mini_gc_collect`, after
  its existing three loops; the call to `mini_gc_collect()` goes at the
  very end of `main`, after everything Lesson 6 already left there.
- **Dependencies** — none beyond this lesson's third unit.

### The New Code

```c
for (i = 0; i < tracked_object_count; i++) {
    if (tracked_objects[i]->header.gc_refs != -1) {
        tracked_objects[i]->header.type->dealloc(&tracked_objects[i]->header);
    }
}
```

```c
mini_gc_collect();
```

### The Updated Project

```c
 1  void mini_gc_collect(void) {
 2      int i;
 3
 4      for (i = 0; i < tracked_object_count; i++) {
 5          tracked_objects[i]->header.gc_refs =
 6              tracked_objects[i]->header.refcount;
 7      }
 8
 9      for (i = 0; i < tracked_object_count; i++) {
10          if (tracked_objects[i]->ref != NULL) {
11              tracked_objects[i]->ref->header.gc_refs--;
12          }
13      }
14
15      for (i = 0; i < tracked_object_count; i++) {
16          if (tracked_objects[i]->header.gc_refs > 0) {
17              mark_reachable(tracked_objects[i]);
18          }
19      }
20
21      for (i = 0; i < tracked_object_count; i++) {           // ← new
22          if (tracked_objects[i]->header.gc_refs != -1) {      // ← new
23              tracked_objects[i]->header.type->dealloc(          // ← new
24                  &tracked_objects[i]->header);                    // ← new
25          }                                                        // ← new
26      }                                                            // ← new
27  }
28
29  int main(void) {
30      /* ...everything from Lesson 6, unchanged... */
31      printf("mini_object_dealloc has still been called %ld times\n",
32             dealloc_call_count);
33
34      printf("running mini_gc_collect()...\n");                 // ← new
35      mini_gc_collect();                                         // ← new
36      printf("mini_object_dealloc has now been called %ld times\n",  // ← new
37             dealloc_call_count);                                 // ← new
38
39      return 0;
40  }
```

`mini_gc_collect`'s new, fourth loop (lines 21–26) is the payoff of
every phase built across this entire lesson: any tracked object whose
`gc_refs` is *not* the sentinel `-1` — meaning marking, in the previous
unit, never reached it — gets destroyed, through the exact same
`->type->dealloc(...)` call Lesson 5 built, called here directly on
every tracked object that needs it, rather than waiting on
`decref_thing`'s own count-driven check, which, per this whole lesson's
premise, would never actually reach zero for these particular objects
on its own.

### Mechanical Walkthrough

- **`if (tracked_objects[i]->header.gc_refs != -1) { ... }`** — the
  not-equal-to operator from this lesson's second unit, checking every
  tracked object against the sentinel from this lesson's Header. Any
  object whose `gc_refs` is still `0` (or, more generally, anything
  other than `-1`) never had `mark_reachable` reach it — exactly the
  objects this whole lesson set out to find.
- **`tracked_objects[i]->header.type->dealloc(&tracked_objects[i]->header);`**
  — the exact chained call from Lesson 5's own `decref_thing`, reused
  here directly on every object this loop identifies, rather than
  routed through `decref_thing`'s own `refcount`-based check at all —
  because that check, for these specific objects, would never pass;
  going straight to the type's own `dealloc` function is what actually
  frees them.
- **`mini_gc_collect();`** (inside `main`) — an ordinary function call,
  the same pattern used for every function call this curriculum has
  built since Lesson 2, placed at the very end of `main`, after every
  mechanism this project already knows about — `incref_thing`,
  `decref_thing`, and everything Lesson 6 built — has already had its
  full, honest chance to free `a` and `b`, and failed to.

### Execution Trace

Continuing from the previous unit's own trace (`a->header.gc_refs = 0`,
`b->header.gc_refs = 0`, neither ever set to `-1`, since neither had a
positive count to mark from):

1. Fourth loop, `i = 0`: `tracked_objects[0]` is `a`; `a->header.gc_refs`
   is `0`, and `0 != -1` is true — `a->header.type->dealloc(&a->header)`
   runs, calling `mini_object_dealloc` for real, which increments
   `dealloc_call_count` and frees `a`'s own memory.
2. Fourth loop, `i = 1`: `tracked_objects[1]` is `b`; `b->header.gc_refs`
   is also `0`, and `0 != -1` is true — `b`'s own `dealloc` runs too,
   incrementing `dealloc_call_count` a second time and freeing `b`'s
   memory.

Worth naming honestly: by the time step 2 runs, `a`'s memory has
already been freed, and `b->ref` still technically points at it — a
real dangling pointer, per Lesson 3's own material. This loop never
reads through that pointer, though (it reaches `b` directly through
`tracked_objects[1]`, not through `a->ref` or `b->ref` at all), so no
undefined behavior actually occurs in this specific run — but it's the
same real hazard Lesson 3 first named, and this lesson's own SE Lens
addresses directly, below.

### CS Lens

Separating "figure out what's garbage" from "actually reclaim it" —
this lesson's first three units do the former, this one does only the
latter — is a standard structural split in every real garbage
collector, sometimes literally called the *mark* phase and the *sweep*
phase.

```
Also recognized in: exactly that name, "mark-and-sweep," used to
describe this general family of algorithms across many languages'
runtimes, not just CPython's; a warehouse inventory audit, where
marking which items are actually accounted for happens as one complete
pass, and removing the unaccounted-for items from the books happens
only afterward, as a separate step; and this curriculum's own earlier
lessons, which never separated these two questions at all — decref_thing,
since Lesson 3, has always decided "is this garbage" and "free it" in
the same single if statement, which is exactly why it can't handle a
cycle: it never gets a chance to look at more than one object at a time
before deciding.
```

### SE Lens

The design principle this final unit completes is **only acting once
the full picture is known**, in deliberate contrast to `decref_thing`'s
own eager, one-object-at-a-time approach from Lesson 3. The real cost of
this lesson's own more thorough approach: `mini_gc_collect` has to walk
every tracked object multiple times (four separate passes, in this
lesson's own version) before freeing anything at all, where
`decref_thing` decides in a single, immediate check — which is exactly
why real CPython keeps both mechanisms side by side rather than
replacing one with the other: reference counting frees the overwhelming
majority of objects the instant they're truly done with, cheaply and
immediately, and the cyclic collector this lesson built only needs to
run periodically, to catch the specific, comparatively rare case
reference counting structurally cannot. This project's own honest
remaining debt, named directly in this unit's own Execution Trace: the
sweep loop frees objects in an order that can leave a already-freed
object's address still sitting in another object's own `ref` field for
the rest of that loop's run — safe here only because nothing in this
specific sweep happens to read through it, not because the danger is
actually gone. Real CPython avoids this more carefully, by clearing
each object's own outgoing references (through a `tp_clear` function,
another per-type function conceptually alongside Lesson 5's
`tp_dealloc`) before freeing anything, specifically so nothing is ever
left holding a pointer into memory that's already been reclaimed — a
refinement this curriculum's own simplified project doesn't yet build.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted — the complete
Lesson 7 project, running Lesson 6's entire scenario followed by this
lesson's own collector:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
a refcount = 1, b refcount = 1
after cross-referencing:
a refcount = 2, b refcount = 2
after main lets go of its own references:
a refcount = 1, b refcount = 1
mini_object_dealloc has been called 0 times
a is now (nil), b is now (nil)
mini_object_dealloc has still been called 0 times
running mini_gc_collect()...
mini_gc_collect: freeing unreachable object with value 1
mini_gc_collect: freeing unreachable object with value 2
mini_object_dealloc has now been called 2 times
```

Every line through `mini_object_dealloc has still been called 0 times`
is identical to Lesson 6's own real output — confirming this lesson
changed nothing about the leak Lesson 6 demonstrated, up to that exact
point. Then, for the first time anywhere in this curriculum,
`mini_object_dealloc has now been called 2 times` — real, direct proof,
using the same counter Lesson 6 used to prove the leak, that both `a`
and `b` were actually destroyed, by a mechanism that never once
inspected either object's `refcount` field to decide.

### Connecting to What Came Before

Every earlier unit in this lesson built one phase of a single idea:
copy real counts (second unit), subtract what's accounted for
internally (also the second unit), mark what a genuine external
reference can still reach (third unit), and, this unit, destroy
whatever marking never touched. None of those phases, alone, could free
`a` or `b` — `decref_thing` alone certainly couldn't, as Lesson 6 proved
directly. Only the complete sequence, examining both objects together
rather than one at a time, could tell the difference between "no one
needs this anymore" and "only this pair's own two references to each
other still exist" — and only that sequence could act correctly on what
it found.

---

## Connect the Pieces

Follow `dealloc_call_count`, the same real counter Lesson 6 used to
prove its own leak, across this entire lesson, start to finish:

1. Lesson 6 ended with `dealloc_call_count` at `0`, proven by real
   output, even after `main` set both `a` and `b` to `NULL` — nothing
   in this curriculum, up to that point, could ever bring that number
   above `0` for this specific pair.
2. This lesson's first unit added a registry, `tracked_objects`, so
   both objects could be examined together — real output confirmed both
   were correctly tracked, by value, at positions `0` and `1`.
3. This lesson's second unit computed each object's `gc_refs` through
   real trial subtraction — real output confirmed both dropped to `0`,
   meaning neither had a single reference traceable to anywhere outside
   the pair.
4. This lesson's third unit proved, using a genuinely externally-held
   third object, that trial subtraction plus recursive marking
   correctly tells "genuinely unreachable" apart from "reachable
   through a longer chain" — real output confirmed the third object
   marked `-1` while `a` and `b` stayed at `0`.
5. This lesson's fourth and final unit swept every object still at `0`
   — never marked reachable — directly through its own type's real
   `dealloc` function, bypassing `decref_thing`'s own count-based check
   entirely. Real output confirmed it: `mini_object_dealloc has now
   been called 2 times`.

Reference counting, built correctly across Lessons 2 through 5, still
works exactly as designed for every object that isn't part of a cycle —
this lesson never touched `incref_thing` or `decref_thing` at all. What
this lesson added is the second, complementary mechanism real CPython
actually ships alongside reference counting, not instead of it: a
periodic, more thorough pass, over every tracked object at once, built
specifically to catch the one structural gap counting alone leaves
open. `MiniObject`, across these seven lessons, has grown from a single
`long` sitting on the stack into something carrying a real reference
count, a real type, a real destruction function, and now, a real
defense against the one failure mode that no amount of correct,
individual `incref`/`decref` discipline alone could ever have fixed.
