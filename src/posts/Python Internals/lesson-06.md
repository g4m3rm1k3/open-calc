# Lesson 6: When Counting Isn't Enough

**What you will build:** `MiniObject` gains a `ref` field — a pointer
to another `MiniObject` of its own kind — and `main` builds two real
objects, `a` and `b`, that point at each other. The working feature: a
program that creates two objects, has each hold a reference to the
other, then gives up its own references to both — and, using a real
counter this lesson adds specifically to prove it, shows that neither
object's destruction function is ever called, even though nothing
outside the pair can reach either one anymore. The transferable problem
this lesson is actually about: every lesson since Lesson 3 has trusted
reference counting to free memory at exactly the right moment, and it
has, every single time — until this lesson deliberately builds the one
shape reference counting cannot handle on its own. This isn't a bug in
`incref_thing` or `decref_thing`; both keep working exactly as
designed. The failure is structural, and seeing it happen for real,
with a real counter proving it, is what motivates Lesson 7's garbage
collector.

**What you need to know first:** Lesson 1 (`struct`, `NULL`), Lesson 2
(pointers, `->`), Lesson 3 (`malloc`, `free`, `if`), Lesson 4 (struct
embedding, chained member access), and Lesson 5 (function pointers,
`MiniTypeInfo`'s `dealloc` field).

**Terms used in this lesson**

- **self-referential struct** — a struct that declares a pointer to its
  own type as one of its own fields. It exists because C only requires
  a pointer's *target type* to be known by name at the point a pointer
  is declared — not fully defined yet — and a struct's own name is
  already available inside its own definition; this is what makes it
  legal for a `MiniObject` to hold a pointer to another `MiniObject`,
  even though, strictly, the struct isn't finished being defined until
  that exact field's line is passed.
- **reference cycle** — a chain of references that loops back on
  itself: object A holds a reference to object B, and object B, directly
  or through further objects, holds a reference back to A. It exists as
  a named hazard because plain reference counting has no way to detect
  it: every reference in the cycle is a real, legitimate reference, so
  every object's count stays above zero even after nothing *outside*
  the cycle can reach any of them.
- **memory leak** — memory that a program has allocated but can no
  longer reach or ever free, because nothing in the program retains a
  usable path to it anymore. It exists as a named failure mode because,
  unlike a crash, a leak doesn't announce itself — the program keeps
  running, appearing to work, while silently holding onto memory it
  will never give back, for as long as the program keeps running.

**Objects and methods used**

No new external objects or methods this lesson — every function this
lesson's project code calls (`malloc`, `incref_thing`, `decref_thing`,
`printf`) was already given full CRC treatment in Lessons 1, 2, 3, and
5. This lesson's entire point is what happens when those already-proven
functions are used correctly, on a structure they were never designed
to handle.

---

## Concept Unit: A Struct That Points at Its Own Kind

### The Problem

Every pointer field this curriculum has built so far points at a
*different* struct: `MiniObjectHeader` points at nothing else structural
of its own; `MiniObject` embeds a `MiniObjectHeader` and points at a
`MiniTypeInfo`. Nothing yet lets one `MiniObject` point at *another
MiniObject* — which is exactly what's needed for two objects to be able
to reference each other at all.

Before reading on: if a struct needs a field that points at another
instance of that exact same struct type, is there anything different
about declaring that, compared to a struct pointing at some other,
different struct type, the way `MiniObjectHeader` already points at
`MiniTypeInfo`? Does a struct's own definition need to be *finished*
before code inside that same definition can refer to it?

### Isolating the Concept

```c
#include <stdio.h>

struct Node {
    int value;
    struct Node *next;
};

int main(void) {
    struct Node a;
    struct Node b;

    a.value = 1;
    a.next = &b;

    b.value = 2;
    b.next = NULL;

    printf("a.value = %d\n", a.value);
    printf("a.next->value = %d\n", a.next->value);

    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab11_selfref lab11_selfref.c
$ ./lab11_selfref
a.value = 1
a.next->value = 2
```

`struct Node { int value; struct Node *next; };` declares `next` as a
pointer to `struct Node` — the exact same struct currently being
defined — using the ordinary pointer declaration syntax from Lesson 2,
with nothing special required for the fact that the pointed-to type and
the containing type are the same. This works because a pointer doesn't
need its target's full size to exist as a field — only code that
actually reads or writes *through* that pointer does, and none of that
code runs until after `struct Node`'s definition is completely
finished. `a.next = &b;` (the address-of operator, Lesson 1) points `a`
at `b`, and `a.next->value` (the arrow operator, Lesson 2) reaches
through that pointer to read `b`'s own field — real output confirms it,
printing `2`, `b`'s value, reached entirely through `a`. This is called
a **self-referential struct**: a struct that can hold a pointer to
another instance of its own type, which is exactly how real data
structures like linked lists are built, and exactly what this lesson's
real project needs next, to let one `MiniObject` point at another.

This throwaway example is now **discarded** — `lab11_selfref.c` and
`struct Node` will not appear in this lesson's real project. What it
proved — that a struct can legally hold a pointer to its own type, with
no special syntax beyond ordinary pointer declaration — is exactly what
`MiniObject` needs next.

### Project Change

- **Reference Source** — No reference counterpart for the
  self-referential struct mechanism itself (general C). The situation
  this field makes possible — one Python object holding a reference to
  another — is universal in real CPython (a `list` holding references
  to its items; a class instance holding a reference to another object
  through an attribute); no single line of CPython source corresponds
  to this specific field, since real CPython objects hold references to
  *arbitrary* other `PyObject`s, not specifically to other instances of
  their own exact type the way this lesson's simplified `ref` field
  does.
- **Files affected** — `project/lesson-06/mini_object.c`, modified
  (copied forward from Lesson 5's finished `mini_object.c`).
- **Change type** — add (`ref`, a new field on `MiniObject`).
- **Location** — inside `struct MiniObject`'s existing definition,
  after `value`.
- **Dependencies** — none beyond what Lesson 5 already established.

### The New Code

```c
struct MiniObject *ref;
```

### The Updated Project

```c
 1  struct MiniObject {
 2      struct MiniObjectHeader header;
 3      long value;
 4      struct MiniObject *ref;    // ← new
 5  };
```

`MiniObject` now has three fields instead of two: its embedded header
(carrying its reference count and type, from Lesson 4), its own
`value` (from Lesson 1), and, new in this lesson, `ref` — a pointer
that can point at another `MiniObject`, or, per Lesson 3's own
dangling-pointer material, safely at nothing at all, via `NULL`.

### Mechanical Walkthrough

- **`struct MiniObject *ref;`** — the self-referential pointer field
  from this unit's own isolated lab, using the pointer declaration
  syntax from Lesson 2. Nothing about `MiniObject`'s own earlier fields
  changes; this is a pure addition, exactly like adding `refcount` to
  `MiniObjectHeader` back in Lesson 2, or `type` to it in Lesson 4.

### Execution Trace

No loop or recursion in this unit's change — a single new field
declaration, nothing that executes at all on its own. No trace is
needed for the same reason already stated in every earlier lesson for
non-executing structural changes.

### CS Lens

A self-referential structure — one whose own type can point at more
instances of itself — is the foundation of an enormous range of real
data structures, precisely because it's what lets a structure's size be
unbounded at compile time.

```
Also recognized in: every linked list, in any language that has them
directly; a tree's own node pointing at its children (each of which is
itself a node of the same type); a filesystem directory entry pointing
at other directory entries; and, most directly relevant to where this
lesson is headed, any real Python data structure at all — a Python list
containing another list, a dictionary whose values are other
dictionaries, or, as this lesson is about to build, two plain objects
that simply happen to reference each other.
```

### SE Lens

The design principle here is almost the absence of one: this unit adds
no restriction at all on what `ref` can point at — any `MiniObject`,
including, as this lesson's next unit builds, `MiniObject`s that
already reference each other, or even an object pointing at *itself*.
The alternative not chosen: some kind of compile-time or run-time check
preventing a reference structure from ever looping back on itself. Real
CPython doesn't choose that alternative either, and for good reason:
disallowing cycles outright would also disallow enormous amounts of
completely legitimate code — a tree node's child pointing back to its
parent, a doubly-linked list, an object registering itself as its own
event listener. The real cost of allowing cycles unconditionally, which
this lesson's next unit makes concrete: the reference-counting machinery
this curriculum has built since Lesson 2, correctly, still cannot free
memory arranged this way, on its own, ever — a limitation this project
is about to demonstrate on purpose, and Lesson 7 exists specifically to
address.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted (this checkpoint
reflects only this unit's change, still using Lesson 5's single-object
`main`, with the new field simply initialized to `NULL` and printed):

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing->value = 99
thing->ref is currently (nil)
refcount starts at 1
thing has now been freed
```

`thing->ref is currently (nil)` confirms the new field exists, is
reachable through the same `->` chained access this curriculum has used
since Lesson 4, and correctly holds `NULL` — Lesson 3's own safe
"points at nothing" value — since nothing has pointed it at another
object yet.

### Connecting to What Came Before

Every previous lesson gave `MiniObject` new *capabilities* — a
reference count, a type, a destruction function — each one making the
object more complete on its own terms. This unit is different: `ref`
doesn't make a single `MiniObject` any more complete by itself. It only
matters once a *second* object exists to point at — which is exactly
what the next, final unit in this lesson builds.

---

## Concept Unit: Building a Cycle and Watching It Leak

### The Problem

`main`, as every previous lesson left it, only ever creates one object.
`ref`, from this lesson's first unit, does nothing meaningful pointed
at `NULL`. To actually see whether this curriculum's reference-counting
machinery handles two objects that reference each other, `main` needs
to build exactly that — for the first time in this curriculum, two real
objects at once.

Before reading on: if object `a` points at object `b`, and object `b`
points at object `a`, and then `main` itself gives up its own direct
references to both — using `decref_thing`, exactly as every previous
lesson has — what do you predict each object's `refcount` will be
afterward? Given `decref_thing`'s own logic (built in Lesson 3, still
unchanged here), do you think either object's `dealloc` function will
actually run?

### Isolating the Concept

This unit needs no fresh isolated lab: the two mechanisms it combines —
a self-referential pointer field, proven in this lesson's first unit,
and `incref_thing`/`decref_thing` themselves, proven across Lessons 2,
3, and 5 — have each already been proven for real. What's new here is
only the *situation* those already-proven pieces are placed into, which
this unit's own Mechanical Walkthrough explains directly against the
real project code.

### Project Change

- **Reference Source** — No reference counterpart for this specific
  scenario (it's a deliberately constructed demonstration), but the
  underlying fact it demonstrates is real and central to CPython's own
  design. Real CPython's own `gc` module documentation, read this
  session, describes the module as an interface to CPython's optional
  cyclic garbage collector — a separate mechanism from reference
  counting, that exists specifically because, as that same
  documentation notes, the collector "supplements the reference
  counting already used in Python." Lesson 7 opens up that supplement
  directly; this lesson exists to prove, firsthand, exactly why it's
  needed.
- **Files affected** — `project/lesson-06/mini_object.c`, modified
  further (building on this lesson's first unit's already-updated
  version).
- **Change type** — add (`dealloc_call_count`, a new global variable,
  and one new line inside `mini_object_dealloc`) and refactor (`main`'s
  entire body, rewritten to build two objects instead of one).
- **Location** — `dealloc_call_count` goes above `mini_object_dealloc`'s
  existing definition; the new line inside `mini_object_dealloc` goes
  at the start of its existing body; `main`'s entire body is replaced.
- **Dependencies** — none beyond what this lesson's first unit already
  established.

### The New Code

```c
long dealloc_call_count = 0;
```

```c
dealloc_call_count++;
```

```c
struct MiniObject *a = malloc(sizeof(struct MiniObject));
a->header.refcount = 1;
a->header.type = &MiniObject_Type;
a->value = 1;
a->ref = NULL;

struct MiniObject *b = malloc(sizeof(struct MiniObject));
b->header.refcount = 1;
b->header.type = &MiniObject_Type;
b->value = 2;
b->ref = NULL;

a->ref = b;
incref_thing(&b->header);

b->ref = a;
incref_thing(&a->header);
```

### The Updated Project

```c
 1  long dealloc_call_count = 0;                     // ← new
 2
 3  void mini_object_dealloc(struct MiniObjectHeader *op) {
 4      dealloc_call_count++;                         // ← new
 5      free(op);
 6  }
 7
 8  /* ... struct definitions, incref_thing, decref_thing: unchanged ... */
 9
10  int main(void) {
11      struct MiniObject *a = malloc(sizeof(struct MiniObject));  // ← new
12      a->header.refcount = 1;                                     // ← new
13      a->header.type = &MiniObject_Type;                          // ← new
14      a->value = 1;                                                // ← new
15      a->ref = NULL;                                               // ← new
16
17      struct MiniObject *b = malloc(sizeof(struct MiniObject));   // ← new
18      b->header.refcount = 1;                                      // ← new
19      b->header.type = &MiniObject_Type;                           // ← new
20      b->value = 2;                                                 // ← new
21      b->ref = NULL;                                                // ← new
22
23      printf("a refcount = %ld, b refcount = %ld\n",                // ← new
24             a->header.refcount, b->header.refcount);                // ← new
25
26      a->ref = b;                                                   // ← new
27      incref_thing(&b->header);                                     // ← new
28
29      b->ref = a;                                                   // ← new
30      incref_thing(&a->header);                                     // ← new
31
32      printf("after cross-referencing:\n");                         // ← new
33      printf("a refcount = %ld, b refcount = %ld\n",                // ← new
34             a->header.refcount, b->header.refcount);                // ← new
35
36      decref_thing(&a->header);                                     // ← new
37      decref_thing(&b->header);                                     // ← new
38
39      printf("after main lets go of its own references:\n");        // ← new
40      printf("a refcount = %ld, b refcount = %ld\n",                // ← new
41             a->header.refcount, b->header.refcount);                // ← new
42      printf("mini_object_dealloc has been called %ld times\n",     // ← new
43             dealloc_call_count);                                    // ← new
44
45      a = NULL;                                                     // ← new
46      b = NULL;                                                     // ← new
47      printf("a is now %p, b is now %p\n", (void *)a, (void *)b);   // ← new
48      printf("mini_object_dealloc has still been called %ld times\n",  // ← new
49             dealloc_call_count);                                    // ← new
50
51      return 0;                                                     // (unchanged)
52  }
```

`main` now builds two independent objects (lines 11–21), each starting
with a reference count of `1` — exactly like `thing` in every previous
lesson, since each is, at that point, owned by exactly one thing: the
local pointer variable holding it. Lines 26–30 then have each object
point at the other, correctly incrementing the *other* object's count
each time, following the exact convention Lesson 2's own quoted CPython
source described: storing a reference means incrementing what's being
referenced. Lines 36–37 have `main` give up its own two direct
references, exactly as every previous lesson's `main` has always done.
Everything from line 39 onward exists purely to observe what happens
next.

### Mechanical Walkthrough

- **`long dealloc_call_count = 0;`** — a new global variable, using the
  same global-variable declaration this lesson's own Header inherits
  from Lesson 4's `MiniObject_Type`, initialized to `0` directly in its
  declaration.
- **`dealloc_call_count++;`** (inside `mini_object_dealloc`) — the same
  increment operator from Lesson 3's own `count--`-adjacent material,
  here counting *up* instead of down, once per real call to
  `mini_object_dealloc`. This line exists purely as instrumentation —
  added specifically so this unit's own real output can prove, directly
  and without guessing, exactly how many times destruction actually
  happened.
- **`struct MiniObject *a = malloc(sizeof(struct MiniObject));`** and
  the four lines under it — creates `a` exactly the way `thing` has
  been created since Lesson 3: heap-allocated, its own header set up
  (refcount `1`, type pointing at the shared `MiniObject_Type`), its
  own `value` set, and, new in this lesson, `ref` explicitly set to
  `NULL` — the safe default from Lesson 3, since `a` doesn't reference
  anything yet at this point.
- **The same five lines, repeated for `b`** — a second, completely
  independent object, built the identical way, with a different
  `value` (`2` instead of `1`) so the two remain distinguishable, though
  this lesson's own `printf` calls don't happen to print either
  object's `value` directly.
- **`a->ref = b;`** — chained member access is not needed here, since
  `a` is already a pointer and `ref` is one of its own direct fields:
  just the arrow operator from Lesson 2, storing `b`'s own address
  (already held in the `b` pointer variable, with no need for `&`,
  exactly as Lesson 3's first unit explained for `thing` itself) into
  `a`'s `ref` field. `a` now points at `b`.
- **`incref_thing(&b->header);`** — immediately after `a` starts
  pointing at `b`, `b`'s own reference count is incremented, using the
  exact function from Lesson 2, reached through the exact
  `&b->header` chained-address pattern from Lesson 4. This is the one
  line in this whole unit doing the real conceptual work: it's what
  makes `a->ref = b` a real, counted reference, rather than a pointer
  that merely happens to point somewhere without `b`'s own count
  knowing about it — skipping this line would leave `b`'s count
  understating how many real references to it exist, a bug in the
  opposite direction from this lesson's own cycle problem.
- **`b->ref = a;` and `incref_thing(&a->header);`** — the identical
  pattern, in reverse: `b` now points at `a`, and `a`'s count is
  incremented to match. After these four lines, both `a->ref` and
  `b->ref` are set, and both objects' reference counts reflect two real
  holders each: the local pointer variable in `main`, and the other
  object's own `ref` field.
- **`decref_thing(&a->header);` and `decref_thing(&b->header);`** —
  the exact same function from Lesson 3, called on both objects, doing
  exactly what it has always done: decrementing each count by one, and
  checking whether that brings it to zero. Nothing about `decref_thing`
  itself is different here — this is the same, correct function this
  curriculum has trusted since Lesson 3, being called correctly.
- **`printf("mini_object_dealloc has been called %ld times\n", dealloc_call_count);`**
  — the first real, direct proof this lesson's output offers: reading
  the instrumentation counter added earlier in this unit, confirming,
  in a number rather than an assumption, exactly how many times
  destruction has actually run.
- **`a = NULL; b = NULL;`** — the same safe-pointer pattern from Lesson
  3's second unit, applied to both local variables. This does not, and
  cannot, affect either object's heap memory or reference count at all
  — it only changes what `main`'s own two local variables point at, the
  same distinction Lesson 3 first drew between a pointer's own value
  and what that pointer points at.
- **The final two `printf` calls** — print both now-`NULL` pointer
  values (proving `main` genuinely has no way left to reach either
  object directly) and the dealloc counter one more time, so the real
  output can show, side by side, that losing every direct handle to
  both objects changed nothing about how many times either was
  destroyed.

### Execution Trace

`a->header.refcount` and `b->header.refcount` both change value across
this sequence, so it's worth tracing explicitly:

1. `a` is created: `a->header.refcount = 1;` sets it directly — `a` is
   held only by its own local variable so far.
2. `b` is created: `b->header.refcount = 1;` — same reasoning, held only
   by its own local variable.
3. `a->ref = b;` followed by `incref_thing(&b->header);` — `b`'s count
   goes from `1` to `2`, because `b` is now held both by `b`'s own local
   variable *and* by `a`'s `ref` field.
4. `b->ref = a;` followed by `incref_thing(&a->header);` — `a`'s count
   goes from `1` to `2`, for the identical reason in reverse.
5. `decref_thing(&a->header);` — `a`'s count drops from `2` to `1`;
   `op->refcount == 0` is false (`1 != 0`), so `mini_object_dealloc`
   does not run. `a` is still held by `b->ref`, even though `main`'s own
   direct reference to it is now gone.
6. `decref_thing(&b->header);` — `b`'s count drops from `2` to `1`, for
   the identical reason: still held by `a->ref`, even though `main`'s
   own direct reference to it is gone too.
7. `a = NULL; b = NULL;` — changes only what `main`'s local variables
   point at. Neither object's `refcount` field is touched by these two
   lines at all; both remain at `1`, exactly as they were left in steps
   5 and 6.

At no point in this trace does either object's `refcount` ever reach
`0` — which is exactly why `dealloc_call_count`, confirmed by real
output below, stays at `0` throughout: `decref_thing`'s own `if
(op->refcount == 0)` check, correct and unchanged since Lesson 3, is
simply never true for either object, because each is still held by the
other.

### CS Lens

The failure this unit demonstrates for real — reference counting's
inability to reclaim a cycle on its own — is a well-known, named
limitation of the reference-counting strategy as a category, not a flaw
specific to this project's own `incref_thing`/`decref_thing`.

```
Also recognized in: real CPython itself, which is exactly why it ships
a separate cycle-collecting garbage collector alongside reference
counting (the subject of Lesson 7); Objective-C and Swift's ARC, which
has the identical known weakness and the identical common workaround
(a "weak reference" that doesn't increment the count, used deliberately
to break likely cycles, such as a parent/child pair); C++'s shared_ptr,
which has the exact same limitation and the exact same weak_ptr
workaround; and, more abstractly, any accounting system based purely on
counting claims rather than tracing actual reachability — two
companies that only ever invoice each other, forever, can each show a
real, uncollected balance owed, even if neither has done business with
anyone else in years.
```

### SE Lens

The design principle worth naming here is **the limits of a local
rule applied without a global view**. `incref_thing` and `decref_thing`
each only ever look at the one object they're given — they have no way
to ask "does anything *outside* this pair of objects still care about
either of us?" — and reference counting, as a strategy, is built
entirely out of exactly that kind of local, per-object rule. The
alternative real CPython actually uses, which this project hasn't built
yet: periodically stepping back and asking a genuinely different
question — not "what does this one object's count say," but "starting
from everything the running program can actually still reach directly,
what is and isn't reachable at all" — which requires looking at many
objects at once, not just one. The real cost this lesson's own project
is currently and honestly carrying: `a` and `b`'s memory, confirmed by
real output below, is genuinely never freed by this program — a real,
demonstrated memory leak, left in place on purpose, because Lesson 7 is
where this curriculum builds the actual fix rather than patching around
it inside `decref_thing` itself.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, unchanged since Lesson 1.

### Run It

Actually compiled and run this session, not predicted:

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
```

Every number matches this unit's own Execution Trace exactly: both
counts climb from `1` to `2` when the cross-references are built, both
settle back to `1` — never `0` — once `main` releases its own direct
references, and `mini_object_dealloc has been called 0 times` is the
real, direct proof that neither object was ever destroyed. The final
line confirms that setting both local pointers to `NULL` — the
strongest thing this program is able to do to "let go" of `a` and `b`
— changes nothing about that count: it stays at `0`, exactly as before,
because the objects it would have counted were never reached by that
line at all.

### Connecting to What Came Before

Every mechanism in this unit — `malloc`, the reference count field, the
type pointer, `incref_thing`, `decref_thing`, even the `dealloc`
function pointer from Lesson 5 — worked exactly as designed, exactly as
proven correct in every previous lesson. This unit changed none of
that machinery at all. It only changed the *shape* of what that
machinery was asked to manage, and that one change was enough to break
an assumption every previous lesson quietly depended on: that giving up
every direct reference to an object is the same as making that object
unreachable. This unit proved, with a real counter and real output,
that those two things are not the same at all once a cycle exists.

---

## Connect the Pieces

Follow both objects' reference counts, start to finish, across this
whole lesson:

1. The first unit added `ref` to `MiniObject`, proven safe in isolation
   on a throwaway `Node`/`next` pair — real output confirmed a value
   read entirely through a self-referential pointer.
2. The second unit built two real objects, `a` and `b`, each starting
   with a reference count of `1` — real output confirmed it.
3. `a->ref = b` and `b->ref = a`, each paired with a real
   `incref_thing` call, brought both counts to `2` — real output
   confirmed it, and this unit's own Execution Trace explained exactly
   why: each object gained a second, real holder.
4. `main` called `decref_thing` on both, exactly as every previous
   lesson's `main` has always done to release its own references — real
   output confirmed both counts settling at `1`, not `0`.
5. `main` set both local pointers to `NULL`, removing the last way this
   program itself could ever reach either object directly — and real
   output, from a counter added specifically to prove it, confirmed
   `mini_object_dealloc` had been called exactly `0` times, both before
   and after that final step.

`a` and `b`'s memory is gone, for the rest of this program's run, in
every sense that matters to the program itself: nothing in `main` can
reach either one anymore. But it was never freed. That is a real memory
leak, built on purpose, using nothing but correctly-working machinery
this curriculum has already proven, piece by piece, since Lesson 2.
Lesson 7 is where this curriculum stops demonstrating the problem and
starts building CPython's actual answer to it: a generational garbage
collector, which doesn't ask any single object "what does your count
say" at all — it starts from what the running program can still
directly reach, and works outward, to find exactly the kind of
unreachable-but-still-referenced memory this lesson just built.
