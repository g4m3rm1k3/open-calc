# Lesson 24: Ownership You Can See, and the Cycle That Defeats It
### (Project 9 — Mini Database Engine, C++)

**What you will build.** `Connection` from Lesson 23, managed by
`std::unique_ptr` instead of a hand-written destructor — RAII, applied
directly to heap memory, with almost no `new`/`delete` left visible at
all. Then `std::shared_ptr`, with its reference count watched changing
in real time — and a real, measured memory leak that `shared_ptr`
*doesn't* prevent, fixed with `std::weak_ptr`. The transferable problem
this lesson is actually about: ownership needs a real, enforced answer
to "who is responsible for freeing this," and even a correct-sounding
answer — "whoever's using it" — can quietly fail when two owners each
depend on the other.

**What you need to know first.** Lesson 23 in full — `new`/`delete`,
the measured leak, the use-after-free, and RAII's `Connection` class
with its own hand-written destructor.

---

## Concept Unit: `unique_ptr`

### The Problem

Lesson 23's `Connection` needed a hand-written destructor to get RAII's
guarantee. Most heap allocations in real C++ code aren't a custom class
built specifically to wrap a resource — they're a plain `new` somewhere,
needing a plain, matching `delete` somewhere else, with all of Lesson
23's own risks (a leak from a forgotten `delete`, a crash from a
duplicated one) still fully present. Something should give *any*
heap-allocated object RAII's guarantee, without writing a custom
wrapper class every time.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `unique_ptr_lab.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `<memory>`, part of the C++ standard library.

### The New Code

```cpp
#include <memory>

class Connection {
public:
    Connection() { std::cout << "Opening connection" << std::endl; }
    ~Connection() { std::cout << "Closing connection" << std::endl; }
    void query() { std::cout << "Running query" << std::endl; }
};
```

### The Updated Project

Brand-new throwaway file, shown whole above — `Connection` itself is
identical to Lesson 23's RAII version.

### Introduce the concept in isolation

```cpp
std::unique_ptr<Connection> conn(new Connection());
conn->query();
std::cout << "About to leave main" << std::endl;
```

Real output:

```
Opening connection
Running query
About to leave main
Closing connection
```

`conn` is a `std::unique_ptr<Connection>` — a **smart pointer**,
wrapping the real, raw pointer `new Connection()` returned. `conn->query()`
calls through it exactly the way a raw pointer would with `->`. And
"Closing connection" prints *after* "About to leave main," proving the
underlying `Connection`'s destructor ran automatically, at the exact
moment `conn` itself went out of scope at the end of `main` — with no
`delete` written anywhere in this code at all. `unique_ptr` is itself
built using exactly Lesson 23's own RAII idiom — its own destructor
calls `delete` on the raw pointer it holds — so this isn't a different
mechanism, it's the *same* mechanism, packaged once, in the standard
library, so it never has to be hand-written again for the common case
of "just clean up this one heap object."

### Discard the throwaway example

Not applicable — `unique_ptr_lab.cpp`'s own demonstration carries the
unit's real point directly; nothing here was a disposable stand-in for
something else.

### Mechanical walkthrough

- `#include <memory>` — **(a) first appearance** of this header:
  C++'s standard smart-pointer types live here.
- `std::unique_ptr<Connection> conn(new Connection());` — **(a) first
  appearance** of `unique_ptr` itself: a generic (Lesson 16's own
  concept, reappearing in C++'s own template syntax) wrapper type,
  constructed directly from a raw pointer returned by `new`.
- `conn->query();` — **(b) hard concept reappearing**: `->` for calling
  a method through a pointer-like object — `unique_ptr` overloads this
  operator specifically so it behaves like the raw pointer it wraps at
  the call site.

### CS lens

This is RAII (Lesson 23), applied once, generically, in the standard
library, instead of by hand in every class that happens to own a
resource. Also recognized in: Java's/C#'s own garbage-collected objects
achieving a *similar* end result (automatic cleanup) through a
completely different mechanism (a collector scanning for
unreachability, on its own schedule, rather than a deterministic scope
rule) — worth being precise that `unique_ptr` isn't "C++ getting garbage
collection," it's C++ getting RAII's determinism applied to the common
case with zero extra code.

### SE lens

Compare directly against Lesson 23's raw approach: `Connection* conn =
new Connection();` required a matching `delete conn;` on every exit
path, proven to fail when a path was missed. `std::unique_ptr<Connection>
conn(new Connection());` requires nothing further — ever — and the
compiler-enforced restriction proven in the next section makes it
*impossible* to accidentally end up with two owners both trying to free
the same memory. The real cost: `unique_ptr` genuinely means *unique* —
proven directly, not just by name.

### Commands needed

Same `g++`/execute pattern as Lesson 23.

### Run it

Shown above.

### Connecting sentence

`unique_ptr` gives any heap allocation RAII's guarantee for free — the
next unit proves the "unique" part of its name is a real, enforced
restriction, not just a suggestion.

---

## Concept Unit: Exclusive Ownership, Enforced

### The Problem

If two `unique_ptr`s somehow both pointed to the same `Connection`, both
would eventually try to `delete` it — the exact double-free danger
Lesson 23's own manual version was silently vulnerable to. `unique_ptr`
needs to make that scenario genuinely impossible, not just
discouraged.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `unique_ptr_copy_fail.cpp`,
  `unique_ptr_move.cpp` (both throwaway, this unit only).
- **Change type** — add.
- **Location** — new files.
- **Dependencies** — none new.

### The New Code

```cpp
std::unique_ptr<Connection> conn1(new Connection());
std::unique_ptr<Connection> conn2 = conn1;  // attempt to copy
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```
$ g++ -o unique_ptr_copy_fail unique_ptr_copy_fail.cpp
unique_ptr_copy_fail.cpp:12:41: error: use of deleted function 'std::unique_ptr<_Tp, _Dp>::unique_ptr(const std::unique_ptr<_Tp, _Dp>&) [...]'
    std::unique_ptr<Connection> conn2 = conn1;
                                        ^~~~~
unique_ptr.h:522:7: note: declared here
      unique_ptr(const unique_ptr&) = delete;
```

The error names the exact mechanism: `unique_ptr`'s own copy
constructor is explicitly `= delete;`d in the standard library's own
source — not merely undocumented or discouraged, genuinely removed from
the language's set of valid operations for this type. Attempting to
copy a `unique_ptr` is rejected before the program ever runs, the same
compile-time guarantee this curriculum has proven for type mismatches
since Java's Lesson 15.

But ownership sometimes genuinely needs to transfer — a `Connection`
built in one function, handed off to another, should still work:

```cpp
std::unique_ptr<Connection> conn1(new Connection());
std::unique_ptr<Connection> conn2 = std::move(conn1);

std::cout << "conn1 is now empty: " << (conn1 == nullptr) << std::endl;
std::cout << "conn2 owns it: " << (conn2 != nullptr) << std::endl;
```

Real output:

```
Opening connection
conn1 is now empty: 1
conn2 owns it: 1
```

`std::move(conn1)` doesn't copy — it transfers ownership: after this
line, `conn1` genuinely holds nothing (`conn1 == nullptr` is `1`, C++'s
`true`), and `conn2` is the sole owner. Exactly one `Connection` object
still exists, and exactly one thing owns it — proven by the destructor
running exactly once when the program ends, not twice.

### Discard the throwaway example

`unique_ptr_copy_fail.cpp`/`unique_ptr_move.cpp` are deleted — they
proved copying is genuinely blocked and moving genuinely transfers
sole ownership, isolated from `Connection`'s real project use.

### Mechanical walkthrough

- `std::unique_ptr<Connection> conn2 = conn1;` — **(a) first
  appearance, as a rejected case**: ordinary-looking assignment syntax,
  rejected specifically because `unique_ptr`'s copy constructor is
  deleted — not a generic error, a deliberate, named language feature.
- `std::move(conn1)` — **(a) first appearance** of `std::move`: doesn't
  physically move anything by itself — it casts `conn1` into a form
  that tells the compiler "treat this as something whose contents can
  be taken," which `unique_ptr`'s own move constructor then acts on,
  transferring the raw pointer internally and leaving `conn1` null.
- `conn1 == nullptr` — **(a) first appearance** of `nullptr`: C++'s
  modern, type-safe null-pointer literal — the direct counterpart to
  Python's `None`, JavaScript's `null`/`undefined`, Java's `null`, C#'s
  `null`, one more spelling of "no value" across six languages now.

### CS lens

This is **move semantics**: C++'s real, compiler-supported distinction
between *copying* something (two independent things exist afterward)
and *moving* it (one thing exists afterward, just now referenced by a
different name) — with `unique_ptr` as the clearest possible
illustration, since copying it is nonsensical (two owners of one
resource) while moving it is exactly the right operation for "hand
this off." Also recognized in: Rust's ownership model (outside this
curriculum, but directly inspired by C++'s own move semantics, taken
further and enforced even more strictly), C++'s own broader move
semantics applied to any type, not just smart pointers, covered in a
future lesson.

### SE lens

The alternative — a plain raw pointer, `Connection* conn`, with no
compiler enforcement of anything — allows exactly the accidental
double-ownership scenario this unit's Problem section named, silently,
with no warning until two `delete` calls on the same address eventually
collide. `unique_ptr` costs the syntax overhead of `std::move` whenever
ownership genuinely needs to transfer; in exchange, accidental,
unintended sharing of exclusive ownership is a compile error, not a
runtime bug waiting to happen.

### Commands needed

Same pattern.

### Run it

Both shown above.

### Connecting sentence

`unique_ptr` genuinely enforces one owner at a time — the next unit
turns to a real, common case where *more than one* owner is exactly
what's needed, and what C++ offers for it instead.

---

## Concept Unit: `shared_ptr`, and the Cycle That Breaks It

### The Problem

Sometimes ownership genuinely can't be exclusive — two different parts
of a database engine might both need a `Connection` to stay alive for
as long as *either* of them still needs it, with neither one knowing in
advance which will finish using it last. `unique_ptr`'s single-owner
model can't express this at all.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `shared_ptr_lab.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<memory>`.

### The New Code

```cpp
std::shared_ptr<Connection> a(new Connection());
std::cout << "Ref count after creating a: " << a.use_count() << std::endl;

{
    std::shared_ptr<Connection> b = a;
    std::cout << "Ref count after copying into b: " << a.use_count() << std::endl;
}
std::cout << "Ref count after b goes out of scope: " << a.use_count() << std::endl;
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
Opening connection
Ref count after creating a: 1
Ref count after copying into b: 2
Ref count after b goes out of scope: 1
About to leave main
Closing connection
```

Unlike `unique_ptr`, copying a `shared_ptr` is completely legal —
`std::shared_ptr<Connection> b = a;` genuinely works, and
`.use_count()` proves exactly what's happening underneath: a
**reference count**, incremented on every copy, decremented every time
a copy goes out of scope. The destructor — "Closing connection" — only
fires once that count reaches zero, proven here to happen exactly at
the end of `main`, after both `a` and the now-gone `b` have finished
with it, never a moment before either still needed it.

### Discard the throwaway example

`shared_ptr_lab.cpp`'s exact demonstration is deleted — the reference-
counting mechanism it proved carries forward conceptually into the next
unit's real, project-shaped danger.

### Project Change (the real danger)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `shared_ptr_cycle_scale.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```cpp
class TableB;

class TableA {
public:
    std::shared_ptr<TableB> relatedTable;
};

class TableB {
public:
    std::shared_ptr<TableA> relatedTable;
};

void createCycle() {
    std::shared_ptr<TableA> a(new TableA());
    std::shared_ptr<TableB> b(new TableB());
    a->relatedTable = b;
    b->relatedTable = a;
    // a and b go out of scope here -- but does the cycle keep both alive anyway?
}
```

### The Updated Project

Brand-new file, shown whole above — modeling exactly the kind of
relationship a real database engine needs: two tables, each aware of
the other (a foreign-key-shaped relationship), each holding a
`shared_ptr` to the other.

### Mechanical walkthrough

- `class TableB;` — **(a) first appearance** of a **forward
  declaration**: tells the compiler "a class named `TableB` exists," so
  `TableA` can reference it (as a `shared_ptr<TableB>`) before
  `TableB`'s own full definition appears later in the file — required
  here specifically because `TableA` and `TableB` each need to know
  about the other.
- `a->relatedTable = b; b->relatedTable = a;` — **(b) hard concept
  reappearing**: ordinary `shared_ptr` assignment, each one increasing
  the target's reference count by one — the exact mechanism proven in
  the isolated lab, now creating a **cycle**: `a` points to `b`, and `b`
  points right back to `a`.

Real, measured output — scaled up exactly the way Lesson 23 measured
its own leak, with 1KB of padding added to each object specifically to
make the leaked memory clearly visible against the process's baseline:

```
Memory before: 3576 KB
Memory after 100,000 leaked cycles: 216204 KB
```

**3.5 MB to 216 MB** — genuinely leaked, through `shared_ptr`, the exact
tool whose entire purpose is preventing leaks. Trace through why: each
call to `createCycle()` builds `a` and `b`, each with reference count
`1`; `a->relatedTable = b` and `b->relatedTable = a` each bump the
*other's* count to `2`. When `createCycle()` returns, its own local `a`
and `b` variables go out of scope, dropping each count back down by
one — to `1`, not `0`, because each object's *other* reference (held by
the object it's linked to) is still alive. Neither object's count ever
reaches zero. Neither is ever freed. And because each `createCycle()`
call creates a brand-new, permanently-orphaned pair, the leak grows with
every call — proven, at scale, exactly like Lesson 23's own raw-pointer
leak, despite using the tool specifically built to prevent it.

### CS lens

This is a **reference cycle**: reference counting, as a memory
management strategy, has a real, structural blind spot — it can never
detect a group of objects that reference each other but are
unreachable from anywhere else in the program, because *within the
cycle*, every object's count looks legitimately non-zero. Also
recognized in: Python's own reference-counting garbage collector
(which actually has a *supplementary* cycle detector specifically to
catch this — a real, additional mechanism C++'s `shared_ptr` does not
have built in), any parent/child object pair that each hold a strong
reference to the other in any reference-counted system, a real,
historically common source of memory leaks in Objective-C's ARC before
`weak` references were established practice there too.

### SE lens

`shared_ptr` is not the same guarantee as garbage collection, and this
lesson's own measurement is the proof, not a caveat to take on faith.
Reference counting is a real, useful, deterministic tool — but it is
*not* automatically cycle-safe, and code that models genuinely
bidirectional relationships (exactly what two related database tables
are) needs to actively decide which direction of the relationship is
the "real" owning one, and which is not.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

`shared_ptr` alone doesn't protect against this — C++ provides a
specific, narrower tool for exactly this shape of relationship,
completing the fix.

---

## Concept Unit: `weak_ptr`

### The Problem

`TableB.relatedTable` needs to reference `TableA` without counting as
real ownership — a pointer that can *observe* the relationship without
keeping the referenced object alive on its own.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `weak_ptr_fix.cpp`.
- **Change type** — modify `TableB.relatedTable`'s type.
- **Location** — `class TableB`.
- **Dependencies** — none new.

### The New Code

```cpp
class TableB {
public:
    std::weak_ptr<TableA> relatedTable;  // weak_ptr instead of shared_ptr
};
```

### The Updated Project

```cpp
class TableA {
public:
    std::shared_ptr<TableB> relatedTable;   // still shared_ptr -- TableA "owns" the link
};

class TableB {
public:
    std::weak_ptr<TableA> relatedTable;      // ← changed -- observes, doesn't own
};

void createCycle() {
    std::shared_ptr<TableA> a(new TableA());
    std::shared_ptr<TableB> b(new TableB());
    a->relatedTable = b;
    b->relatedTable = a;  // does not increase a's use_count
}
```

Only one line's type actually changed — `TableB`'s side of the
relationship — deliberately, to make one direction the genuine owner and
the other a non-owning observer, breaking the cycle without removing
the relationship itself.

### Mechanical walkthrough

- `std::weak_ptr<TableA> relatedTable;` — **(a) first appearance.**
  Holds a reference to an object managed by a `shared_ptr`, without
  incrementing its reference count at all — `b->relatedTable = a;` now
  leaves `a`'s count unaffected, exactly the missing piece.

### CS lens

`weak_ptr` is the standard, deliberate answer to reference cycles: one
direction of a bidirectional relationship holds real, counted ownership
(`shared_ptr`); the other holds a non-owning reference that can check
"does this still exist?" without ever being the reason it continues to.

### SE lens

Proven directly, at the identical scale as the leak itself:

```
Memory before: 3580 KB
Memory after 100,000 cycles broken with weak_ptr: 3712 KB
```

Same 100,000 iterations, same relationship being modeled — flat memory
instead of 216MB. The real design cost: `weak_ptr` requires deciding, up
front, which side of a relationship is the "real" owner — not always
obvious, and getting it backward doesn't cause an error, it just moves
the same cycle risk to the other direction. This is a real design
decision every bidirectional relationship in a reference-counted system
has to make deliberately, not a mechanical fix applied without
thought.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Every tool in this lesson traces back to Lesson 23's same core rule —
someone has to own a resource and be responsible for releasing it —
`unique_ptr` enforces exactly one owner, `shared_ptr` allows several
with a real count deciding when the last one is gone, and `weak_ptr` is
what makes a relationship expressible without that relationship itself
becoming an unaccounted-for owner.

---

## Closing

**Connect the pieces.** One relationship, through the whole lesson: a
`TableA` and a `TableB`, linked in both directions — `TableA` holds a
real, counted `shared_ptr` to `TableB`; `TableB` holds a `weak_ptr`
back, observing without owning. When both go out of scope, `TableA`'s
count correctly reaches zero (nothing else owns it), its destructor
runs, its own `shared_ptr` to `TableB` is released as part of that,
`TableB`'s count reaches zero too, and its destructor runs — a clean,
correct teardown in the right order, with the exact same relationship
this lesson's earlier cycle preserved, just with one direction no
longer counted as ownership.

**What breaks without this.** Already shown, measured, at real scale,
twice: the 216MB leak from an uncounted-for cycle, and its fix, flat at
the same scale. Deliberately not restaged — the measurement, run
directly against the exact code that needed it, was the whole point.

**Exercises.**
1. Reverse this lesson's fix — make `TableA.relatedTable` the
   `weak_ptr` and `TableB.relatedTable` the `shared_ptr` instead — and
   confirm, with real output, that the leak is still fixed either way,
   as long as exactly one direction is weak.
2. Add a `lock()` call — `weak_ptr::lock()` returns a `shared_ptr` if
   the referenced object still exists, or an empty one if it's already
   been destroyed — and use it to safely check, from `TableB`, whether
   its related `TableA` is still alive before using it.
3. Build a three-object cycle (`TableA` → `TableB` → `TableC` →
   back to `TableA`) using all `shared_ptr`, confirm it leaks at scale
   the same way this lesson's two-object cycle did, then fix it by
   making exactly one link in the chain a `weak_ptr`.

**Definition of done.**
- [ ] `unique_ptr` correctly manages a `Connection`'s lifetime with no
      explicit `delete`, confirmed against real output.
- [ ] You've triggered the real compile error from copying a
      `unique_ptr`, and confirmed `std::move` correctly transfers sole
      ownership instead.
- [ ] `shared_ptr`'s reference count, watched via `.use_count()`,
      correctly rises and falls as owners are added and removed.
- [ ] You've measured a real, 200MB-scale leak from a `shared_ptr`
      reference cycle, and confirmed `weak_ptr` fixes it at the
      identical scale.
- [ ] Commit with a message explaining why — e.g. `"Manage Connection
      with unique_ptr instead of a hand-written destructor, and break a
      measured shared_ptr reference-cycle leak between TableA and
      TableB with weak_ptr"` — not `"add smart pointers"`.

**Next lesson** stays in Project 9: the storage engine's own on-disk
layout begins, where raw memory, alignment, and the real cost of
pointer-chasing versus contiguous data start to matter in ways no
earlier phase of this curriculum ever had to measure.
