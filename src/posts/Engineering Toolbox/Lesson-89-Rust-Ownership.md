# Lesson 89: The Same Memory Task, No Garbage Collector, No Manual `free`

**What you will build:** the same "allocate a million times without
leaking" task from Lesson 83, this time in Rust — plus a real,
compiler-rejected attempt to use a value after its ownership has moved,
and a `Drop` implementation proving cleanup happens automatically, at
an exact, predictable moment, with zero garbage collector and zero
manual `free` call anywhere in the program. The transferable insight:
Python (Lessons 1–80) solved memory safety with a garbage collector,
checking at *runtime* whether anything still needs a value. C (Lessons
81–88) solved nothing automatically — every allocation needed a
matching, manually-written `free`, and forgetting one was a real,
demonstrated leak. Rust is a third approach: memory safety enforced at
*compile time*, through ownership rules, with no runtime garbage
collector and no manual `free` — this lesson proves both halves of
that claim directly, side by side with real, comparable numbers.

**What you need to know first:** Lesson 83 (`malloc`/`free`, the real
leak measured via `/proc/self/status`) — this lesson's entire "no
leak" proof is a direct rebuild of that exact experiment, in a new
language, for direct comparison. Lesson 81 (compiling C) — Rust's own
compile step (`rustc`) is used the same way, and this lesson assumes
that comfort rather than re-explaining it.

---

## Concept Unit: The Problem — Two Approaches Already Seen, a Third Coming

### The Problem

Python's model: a garbage collector checks, at runtime, whether any
reference to a value still exists, and reclaims it once none do —
convenient, but with real runtime cost, and (Lesson 88's own subject)
structurally incapable of ever leaving a *dangling* reference, at the
cost of never knowing exactly when cleanup happens. C's model: nothing
automatic at all — `malloc` and `free`, paired correctly by the
programmer, every time, with real, demonstrated consequences (Lesson
83's leak, Lesson 88's use-after-free) when that pairing is wrong.
Rust offers a third option, worth setting up precisely before proving
it: enforce correct pairing *before the program ever runs*, as a
compile-time check, with zero runtime garbage collector.

### CS Lens

This is worth stating as a real, meaningful axis of comparison across
memory management strategies, not just trivia: *when* is safety
checked, and *what* enforces it? Python: checked at runtime, enforced
by a garbage collector. C: not checked at all, enforced by programmer
discipline alone (Lessons 83, 87, 88 showed exactly what happens when
that discipline lapses). Rust: checked at compile time, enforced by
the compiler itself, refusing to produce a binary at all for programs
that violate its rules — the rest of this lesson makes each piece of
that claim concrete.

---

## Concept Unit: Ownership — Every Value Has Exactly One Owner

### The Problem

Rust's core rule, worth seeing fail before it's explained: every value
has exactly one owner at a time, and assigning it to a new variable
transfers ownership rather than copying or sharing it — the old
variable becomes genuinely, permanently unusable, not just
discouraged.

### The New Code

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;   // ownership MOVES from s1 to s2 -- s1 is no longer valid

    println!("s2 = {}", s2);
    println!("s1 = {}", s1);   // this line should fail to compile
}
```

### Run It

```
$ rustc ownership_basic.rs -o ownership_basic
error[E0382]: borrow of moved value: `s1`
 --> ownership_basic.rs:6:25
  |
2 |     let s1 = String::from("hello");
  |         -- move occurs because `s1` has type `String`, which does not implement the `Copy` trait
3 |     let s2 = s1;   // ownership MOVES from s1 to s2 -- s1 is no longer valid
  |              -- value moved here
...
6 |     println!("s1 = {}", s1);   // this line should fail to compile
  |                         ^^ value borrowed here after move
  |
help: consider cloning the value if the performance cost is acceptable
```

**No binary was produced at all.** This isn't a warning, and it isn't
a runtime crash the way Lesson 88's use-after-free was — the compiler
refuses outright, before the program can ever run, with a message that
names the exact problem (`value moved here`, `value borrowed here after
move`) and even suggests a real fix (`.clone()`).

### Run It — Fixed

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;

    println!("s2 = {}", s2);
    // s1 is genuinely gone -- not just unrecommended to use, structurally unavailable
}
```

```
s2 = hello
```

### Mechanical Walkthrough

- `let s1 = String::from("hello");` — creates a `String` (Rust's
  growable, heap-allocated string type — the closer analog to Python's
  `str` than C's fixed-size `char` arrays from Lesson 84), owned by
  `s1`.
- `let s2 = s1;` — **first appearance of a move.** Assigning `s1` to
  `s2` does not copy the string's heap data, and does not create two
  variables both referring to the same data (which would be exactly
  Lesson 88's dangerous aliasing, if either one could later be freed
  independently). It transfers ownership: `s2` now owns the data,
  and `s1` is left in a compiler-tracked "moved from" state —
  `s1` isn't a dangling pointer to freed memory (Lesson 88's failure);
  it's a variable the compiler now refuses to let anyone use at all.
- `println!("s1 = {}", s1);` — attempting to use a moved-from
  variable is a **compile error**, not a runtime bug waiting to
  happen. This is the single most important fact this lesson
  establishes: the exact class of bug Lesson 88 spent an entire lesson
  demonstrating — reading through a reference to memory that's no
  longer valid — is something Rust's ownership rules make impossible
  to even compile, for this specific case.

### CS Lens

Enforcing "exactly one owner, transferred rather than duplicated" at
compile time is called **ownership**, Rust's foundational memory-safety
mechanism. Also recognized in, and directly comparable to: C++'s
`std::unique_ptr` (a library-level attempt at the same discipline,
optional and bypassable), and — worth naming directly — this is
philosophically close to Lesson 78's `MiniGit` treating content as
owned by exactly one canonical hash-addressed location, just enforced
by the Rust compiler itself rather than a project's own conventions.

---

## Concept Unit: `Drop` — Automatic, Deterministic Cleanup

### The Problem

Given that ownership is always well-defined (exactly one owner, known
at every point), Rust can automatically clean up a value the instant
its owner goes out of scope — no garbage collector scanning for
unreachable objects at some unpredictable later time, no manually
written `free` call to remember. Worth proving this happens, and
proving exactly when.

### The New Code

```rust
struct Resource {
    name: String,
}

impl Drop for Resource {
    fn drop(&mut self) {
        println!("dropping: {}", self.name);
    }
}

fn main() {
    println!("creating a");
    let _a = Resource { name: String::from("a") };

    {
        println!("creating b (inner scope)");
        let _b = Resource { name: String::from("b") };
        println!("about to leave inner scope");
    }   // <- b is dropped HERE, automatically, the instant this scope ends

    println!("back in outer scope");
}   // <- a is dropped HERE, automatically, at the end of main
```

### Run It

```
creating a
creating b (inner scope)
about to leave inner scope
dropping: b
back in outer scope
dropping: a
```

Exactly as the comments predict: `b` is dropped the *instant* its
inner scope ends — before `"back in outer scope"` even prints — and
`a` is dropped only at the very end, once `main` itself finishes. No
garbage collector delay, no unpredictable timing — dropping happens at
a precise, statically-knowable point in the program's execution,
determined entirely by scope.

### Mechanical Walkthrough

- `impl Drop for Resource { fn drop(&mut self) { ... } }` — **first
  appearance of the `Drop` trait.** Any type implementing `Drop`
  supplies a `drop` method that Rust guarantees to call automatically,
  exactly once, when a value of that type's owner goes out of scope —
  no explicit call anywhere in `main` invokes it directly.
- `let _a = Resource { ... };` — the leading underscore in `_a` is a
  real Rust convention, not incidental: it tells the compiler "this
  variable is intentionally not read elsewhere," suppressing an
  otherwise-real "unused variable" warning, without changing anything
  about ownership or drop timing.
- The inner `{ ... }` block — an ordinary scope, exactly like a
  function body or an `if` block already familiar from earlier
  lessons — `_b`'s owner (`_b` itself) stops existing the moment this
  block ends, and Rust inserts the call to `drop` right there,
  automatically, as part of what the compiler generates.
- `}` closing `main` — the same mechanism applies to `_a`, at the very
  end of the function.

### CS Lens

Tying a resource's cleanup directly and automatically to the end of
its owner's scope is the same **RAII** (Resource Acquisition Is
Initialization) discipline already named as an aspiration in Lesson
83's own closing CS Lens — there, flagged as something C cannot enforce
automatically, only encourage by convention. This is what it looks
like enforced by a compiler: `Drop` is Rust's concrete, load-bearing
implementation of exactly that idea, not a coincidence of naming.

---

## Concept Unit: Rebuilding Lesson 83's Leak Test — No Leak Possible

### The Problem

Given everything proven above, the real, direct test: rebuild Lesson
83's exact experiment — a million heap allocations, measured against
real process memory — in Rust, with no `free` call anywhere, and
confirm memory usage stays flat.

### Project Change

- **Reference Source:** Lesson 83's `no_leak.c` — this project is a
  direct, deliberate rebuild of that exact experiment, in a new
  language, for direct numeric comparison.
- **Files affected:** `no_leak_rust.rs` (new file).
- **Change type:** add (new language, same underlying test).
- **Location:** n/a — brand-new file.
- **Dependencies:** `std::fs` (Rust's standard library file-reading,
  used here identically to Lesson 83's own `/proc/self/status` trick).

### The New Code

```rust
use std::fs;

fn print_memory(label: &str) {
    let status = fs::read_to_string("/proc/self/status").unwrap();
    for line in status.lines() {
        if line.starts_with("VmRSS") {
            println!("{:<45} {}", label, line);
        }
    }
}

fn main() {
    print_memory("before any allocation:");

    for round in 1..=5 {
        for i in 0..200_000 {
            let numbers: Box<[i32; 10]> = Box::new([i as i32; 10]);
            let _ = numbers[0];
            // no manual free anywhere -- 'numbers' is dropped automatically
            // HERE, at the end of this loop iteration, when it goes out of scope
        }
        let label = format!("after round {} (1,000,000 total allocations):", round);
        print_memory(&label);
    }
}
```

### Run It

```
before any allocation:                        VmRSS:	    2080 kB
after round 1 (1,000,000 total allocations):  VmRSS:	    2084 kB
after round 2 (1,000,000 total allocations):  VmRSS:	    2084 kB
after round 3 (1,000,000 total allocations):  VmRSS:	    2084 kB
after round 4 (1,000,000 total allocations):  VmRSS:	    2084 kB
after round 5 (1,000,000 total allocations):  VmRSS:	    2084 kB
```

**Flat.** 1,000,000 real heap allocations (`Box::new`, genuinely
placing data on the heap, the direct Rust equivalent of `malloc`), and
memory usage barely moves — matching Lesson 83's own `no_leak.c`
result almost exactly, achieved here with **zero explicit `free` calls
anywhere in this program**. Every single one of those million
allocations was reclaimed automatically, the instant `numbers` went
out of scope at the end of each loop iteration — the exact same `Drop`
mechanism from the previous unit, just applied to `Box`'s own built-in
`Drop` implementation instead of a custom one.

### Mechanical Walkthrough

- `Box<[i32; 10]>` — **first appearance of `Box`.** `Box::new(...)`
  allocates its argument on the heap (exactly like `malloc`, Lesson
  83) and returns a `Box`, which *owns* that heap allocation — `Box`
  itself implements `Drop`, and its own `drop` implementation calls
  the equivalent of `free` on the memory it owns.
- `let numbers: Box<[i32; 10]> = Box::new([i as i32; 10]);` — inside
  the inner loop, exactly mirroring Lesson 83's `int *leaked =
  malloc(sizeof(int) * 10);` in shape and size (ten `i32`s, the same
  as ten C `int`s) — the deliberate, direct point of comparison.
- No `free(numbers)` line exists anywhere in this file — and none is
  needed: `numbers` is a local variable; its owning scope is the inner
  `for` loop's body; the moment each iteration ends, `numbers` goes out
  of scope, and `Box`'s `Drop` implementation runs automatically,
  exactly as the previous unit's `Resource` did — freeing the heap
  memory it owned, immediately, deterministically, every single
  iteration.

### CS Lens

This is the concrete payoff of the entire lesson: the specific class of
bug Lesson 83 built an entire lesson around — a real, measured,
100%-attributable-to-one-missing-line leak — is not merely *less
likely* in safe Rust; it is **structurally impossible to write by
omission**. There is no `free` call to forget, because there is no
manual `free` call at all in ordinary, safe Rust code — cleanup is not
something the programmer remembers to do; it's something the ownership
system does automatically, every time, as a direct consequence of
scope.

---

## What Breaks Without This — Leaking in Rust Requires Saying So

### The Problem

It's worth being precise, and honest, about the actual claim: safe
Rust doesn't make memory leaks *literally* impossible in every sense
(a reference cycle, or a genuinely deliberate leak, can still occur) —
but it's worth proving that leaking, when it happens, requires an
explicit, clearly-named function call, not an easy-to-forget missing
line.

### The New Code

```rust
use std::mem;
// ... print_memory as before ...

fn main() {
    print_memory("before any allocation:");

    for round in 1..=5 {
        for i in 0..200_000 {
            let numbers: Box<[i32; 10]> = Box::new([i as i32; 10]);
            let _ = numbers[0];
            mem::forget(numbers);   // an EXPLICIT, named call to leak this on purpose
        }
        let label = format!("after round {} (1,000,000 total allocations):", round);
        print_memory(&label);
    }
}
```

### Run It

```
before any allocation:                        VmRSS:	    2144 kB
after round 1 (1,000,000 total allocations):  VmRSS:	   11520 kB
after round 2 (1,000,000 total allocations):  VmRSS:	   20896 kB
after round 3 (1,000,000 total allocations):  VmRSS:	   30268 kB
after round 4 (1,000,000 total allocations):  VmRSS:	   39644 kB
after round 5 (1,000,000 total allocations):  VmRSS:	   49020 kB
```

A real leak, genuinely reproduced, numbers closely matching Lesson
83's own `leak.c` climb. But look at what caused it:
**`std::mem::forget`** — a function whose entire documented purpose is
"take ownership of a value and deliberately skip calling its `Drop`
implementation." This is not a missing line, a typo, or an easily
overlooked omission the way `leak.c`'s absent `free(leaked)` was — it's
an explicit, named, impossible-to-write-by-accident function call.
Leaking in Rust requires *saying so*.

One honest, worth-knowing detail: compiling this same file with
optimizations enabled (`rustc -O`) makes the leak disappear entirely —
memory stays flat. The optimizer proves the leaked value is never
observably used after `mem::forget` runs and eliminates the whole
allocation as dead code. This isn't the compiler "fixing" the leak; a
real program that actually *uses* what it leaks (the entire point of
leaking something on purpose) would show the same growth as above
regardless of optimization level. The unoptimized build here exists
specifically to keep the comparison against Lesson 83's own C numbers
honest and direct.

### CS Lens

Requiring a deliberate, clearly-named opt-out (`mem::forget`,
`Box::leak`, and similar) to bypass automatic cleanup — rather than
requiring a deliberate, easy-to-forget opt-*in* (C's own `free`) — is
a real, meaningful shift in default safety. This is the same design
philosophy already valued throughout this curriculum in a different
context: Lesson 84's `%s` defaulting to trusting a null terminator was
a *dangerous* default, worth contrasting directly against Rust's
choice here to make the *safe* behavior (automatic cleanup) the
default, and the *dangerous* behavior (leaking) something that has to
be spelled out, by name, in the source.

## Exercises

- Modify the ownership example to use `.clone()` (as the compiler's
  own error message suggested) instead of removing the failing line,
  and confirm both `s1` and `s2` work afterward — then use `Drop` (from
  the second unit) on a cloned type to confirm *two* separate drops
  occur, proving `.clone()` genuinely creates two independently-owned
  values, not two references to one.
- Write a function that takes ownership of a `String` parameter (not a
  reference) and confirm, at the call site, that the original variable
  becomes unusable afterward — the same "ownership moves" rule applied
  to function calls instead of `let` assignments.
- Research Rust's **borrowing** (`&s1` instead of moving `s1` outright)
  as the mechanism that lets a function use a value *without* taking
  ownership of it — directly comparable to Lesson 82's C pointers, but
  with compile-time-enforced rules about how many borrows can exist
  simultaneously.
- Research `Rc<T>` (reference-counted pointer) as Rust's own opt-in
  mechanism for the "more than one owner" case ownership otherwise
  forbids — and research why a cycle of `Rc`s can still leak memory
  even in safe Rust, the one genuine, real caveat to this lesson's
  central claim.

## Definition of Done

- [ ] `rustc` confirmed working on your own machine (`rustc --version`).
- [ ] The moved-value compile error reproduced for real — confirming
      `rustc` refuses to build the program at all, with the exact
      `E0382` error.
- [ ] The `Drop` timing demo run for real, confirming `b` drops before
      `"back in outer scope"` prints, and `a` drops only at the very
      end.
- [ ] The Rust leak-test rebuild run for real, confirming flat memory
      usage across 1,000,000 heap allocations with zero manual `free`
      calls anywhere in the source.
- [ ] The `mem::forget` leak reproduced for real, confirming genuine
      memory growth closely matching Lesson 83's own C leak numbers —
      and confirming it required a specifically-named function call to
      cause.
- [ ] Can explain out loud, without looking at the code, the precise
      difference between Python's runtime garbage collection, C's
      manual `malloc`/`free`, and Rust's compile-time ownership — using
      *when* safety is checked and *what* enforces it as the
      comparison.
- [ ] Committed, with a message explaining *why* — e.g. `"Rust
      ownership vs. C malloc/free: the same million-allocation leak
      test stays flat with zero manual free calls, and leaking
      requires an explicit, named function, not a missing line"` —
      not `"add rust examples"`.
