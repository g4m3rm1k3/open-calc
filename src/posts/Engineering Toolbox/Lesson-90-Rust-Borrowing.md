# Lesson 90: Using Without Owning — Borrowing and the Borrow Checker

**What you will build:** functions that borrow values with `&` instead
of taking ownership, a direct rebuild of Lesson 86's dangling-pointer
bug that the Rust compiler refuses to compile at all, and a real,
triggered violation of Rust's mutable/immutable borrowing rule — the
same rule that structurally prevents the exact class of race condition
Lesson 74 had to fix with a runtime `Lock`. The transferable insight:
Lesson 89's ownership rules alone would make Rust nearly unusable —
every function call would need to either take full ownership or force
a `.clone()`. Borrowing is the release valve: temporary, checked access
without ownership changing hands, and this lesson proves the compiler
enforces its safety rules exactly as strictly as ownership's own,
catching two real, previously-demonstrated bug classes before the
program ever runs.

**What you need to know first:** Lesson 89 (Rust ownership, `Drop`) —
this lesson assumes ownership and moves are already solid. Lesson 86
(stack vs. heap, the dangling-pointer compiler warning) and Lesson 74
(race conditions, `Lock`) — this lesson directly rebuilds one bug from
each, in Rust, to show the same failure caught differently.

---

## Concept Unit: The Problem — Ownership Alone Is Too Strict

### The Problem

Lesson 89's ownership rule — assigning or passing a value moves it —
means a function that only wants to *read* a value would, without some
other mechanism, take ownership away from its caller entirely, exactly
as demonstrably wrong as Lesson 89's own `s1`/`s2` failure.

### The New Code

```rust
fn print_length(s: String) -> usize {
    s.len()
}

fn main() {
    let name = String::from("Alice");
    let len = print_length(name);   // ownership MOVES into the function...
    println!("length: {}", len);
    println!("name: {}", name);      // ...so this should fail: name is gone
}
```

### Run It

```
error[E0382]: borrow of moved value: `name`
 --> lab1_ownership_cost.rs:9:26
  |
6 |     let name = String::from("Alice");
  |         ---- move occurs because `name` has type `String`, which does not implement the `Copy` trait
7 |     let len = print_length(name);   // ownership MOVES into the function...
  |                            ---- value moved here
9 |     println!("name: {}", name);      // ...so this should fail: name is gone
  |                          ^^^^ value borrowed here after move
  |
note: consider changing this parameter type in function `print_length` to borrow instead if owning the value isn't necessary
```

The exact same `E0382` error from Lesson 89 — but notice the compiler's
own suggestion this time: *"consider changing this parameter type... to
borrow instead."* `rustc` is naming the actual solution this lesson
builds. Discarded now; the fix is built next.

### CS Lens

A language whose *only* way to pass data into a function is either "give
it away permanently" or "make an expensive full copy" would be
genuinely painful to write real programs in — worth stating plainly:
this is exactly why borrowing exists, not an afterthought bolted onto
ownership, but the necessary second half of the same design.

---

## Concept Unit: `&` — Borrowing Instead of Moving

### The Problem

What's needed is a way to let a function use a value temporarily,
without transferring ownership — the caller keeps the value, fully
usable, both during and after the call.

### The New Code

```rust
fn print_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let name = String::from("Alice");
    let len = print_length(&name);   // BORROW -- lend a reference, don't give up ownership
    println!("length: {}", len);
    println!("name: {}", name);       // name is still valid -- ownership never left main
}
```

### Run It

```
length: 5
name: Alice
```

Both lines print correctly this time — `name` genuinely survives the
function call, unlike the previous unit's failure.

### Mechanical Walkthrough

- `fn print_length(s: &String) -> usize` — **first appearance of `&`
  in a function signature.** `s: &String` means "this parameter is a
  *reference* to a `String`, not a `String` itself" — directly
  analogous to Lesson 82's C pointers (`int *p` meant "a pointer to an
  `int`"), but with compile-time-enforced rules about how that
  reference can be used, covered later in this lesson.
- `print_length(&name)` — **first appearance of `&` at a call site.**
  `&name` creates a reference to `name`, handed to the function — this
  is called **borrowing**: the function receives temporary access, not
  ownership. When `print_length` returns, the borrow ends, and `name`
  is exactly as usable as it was before the call — genuinely,
  provably, confirmed by the second `println!` succeeding.
- `s.len()` inside the function — calling a method through a reference
  works identically to calling it on the owned value directly; Rust
  handles the dereferencing automatically here (a real, deliberate
  ergonomic choice, unlike C's explicit `->` from Lesson 85).

### CS Lens

Granting temporary, read-access to data without transferring
ownership of it is called **borrowing**, and a reference obtained this
way is sometimes called a "borrow." This is conceptually close to
Lesson 82's C pointers used purely for reading (a `const char *`
parameter, for instance) — the crucial difference, proven across the
rest of this lesson, is that Rust's compiler actively verifies borrows
are used safely, where C's `const` was only ever a promise the
compiler could catch violations of, never a guarantee against the
underlying memory-safety dangers Lessons 87 and 88 demonstrated.

---

## Concept Unit: The Borrow Checker Refuses a Dangling Reference

### The Problem

Lesson 86 showed a C function returning the address of a local
variable — a real, compiler-*warned* but still compiler-*permitted*
dangling pointer, one this lesson's own C compiler chose to neutralize
to `NULL` as a defensive courtesy, not because the language required
it. Worth rebuilding the identical scenario in Rust and seeing what
happens.

### The New Code

```rust
fn make_dangling_reference() -> &'static String {
    let local_value = String::from("hello");
    &local_value
}

fn main() {
    let r = make_dangling_reference();
    println!("{}", r);
}
```

### Run It

```
error[E0515]: cannot return reference to local variable `local_value`
 --> dangling_reference2.rs:3:5
  |
3 |     &local_value
  |     ^^^^^^^^^^^^ returns a reference to data owned by the current function

error: aborting due to previous error
```

**No binary produced at all.** Compare this directly against Lesson
86's own result: `gcc` compiled `make_dangling_pointer` successfully
(with only a warning), and the resulting program ran, printed a real
address, then crashed on dereference — a real, live consequence,
observed at runtime. `rustc` refuses to produce a program in the first
place. The bug never has a chance to run.

### The First Attempt Was Even Stricter

Before reaching this specific error, the very first, unannotated
attempt failed even earlier:

```rust
fn make_dangling_reference() -> &String {   // no lifetime specified at all
```

```
error[E0106]: missing lifetime specifier
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

Rust requires every reference in a function signature to carry a
**lifetime** — a compile-time-checked claim about how long the data it
points to is guaranteed to remain valid. A function returning `&String`
with no lifetime annotation is rejected before the compiler even
examines the function body, because there's no way to describe *any*
lifetime for a reference to purely local data — the two-stage failure
here (first "you haven't said how long this reference is valid,"
then, once forced to claim `'static` — "forever" — "that claim is
false") is the compiler methodically ruling out every possible way
this function's signature could be honest.

### Run It — Fixed

```rust
fn make_valid_string() -> String {
    let local_value = String::from("hello");
    local_value   // return the OWNED value itself, not a reference to it -- ownership moves out
}

fn main() {
    let r = make_valid_string();
    println!("{}", r);
}
```

```
hello
```

### Mechanical Walkthrough

- `&'static String` — **first appearance of an explicit lifetime
  annotation.** `'static` is a specific, real lifetime meaning "valid
  for the entire remaining life of the program" — the compiler's
  suggested fix from the first error, tried here specifically to see
  what happens next, not because it's actually correct.
- `E0515: cannot return reference to local variable` — the deeper,
  more specific failure: `local_value` is a stack-local `String`
  (Lesson 86's own stack-frame territory, now enforced at the Rust
  level), destroyed the instant `make_dangling_reference` returns —
  claiming a `'static` lifetime for a reference to it is provably
  false, and the compiler catches the falseness directly, by name.
- `fn make_valid_string() -> String { ... local_value }` (no `&`) —
  the fix returns the *owned value itself*, not a reference to it.
  Ownership moves out of the function to the caller, exactly like
  Lesson 89's own move semantics — `local_value`'s data doesn't need
  to "survive" the function returning in the sense a *reference* would
  require, because ownership of it transfers cleanly to `r` in `main`.

### CS Lens

This is the concrete, load-bearing payoff of this lesson: the exact
bug category Lesson 86 demonstrated running (a dangling reference to a
destroyed stack frame) is caught here at **compile time**, with a
specific, named error, before the program exists as a runnable binary
at all — not mitigated after the fact (Lesson 87's stack canary,
Lesson 88's glibc double-free detection), genuinely *prevented*.
Lifetimes are Rust's mechanism for extending ownership's compile-time
guarantees to *references*, not just owned values.

---

## What Breaks Without This — Mutable and Immutable Borrows, Together

### The Problem

Borrowing needs one more rule to be genuinely safe: if code could read
through one reference while *simultaneously* writing through another
reference to the same data, that's exactly the shape of Lesson 74's
own race condition — just without needing two threads to trigger it.
Rust forbids this outright, at compile time, in ordinary single-threaded
code.

### The New Code

```rust
fn main() {
    let mut data = vec![1, 2, 3];

    let immutable_ref = &data;         // an immutable borrow
    let mutable_ref = &mut data;       // a mutable borrow -- WHILE the immutable one is still alive

    println!("{:?}", immutable_ref);
    println!("{:?}", mutable_ref);
}
```

### Run It

```
error[E0502]: cannot borrow `data` as mutable because it is also borrowed as immutable
 --> borrow_conflict.rs:5:23
  |
4 |     let immutable_ref = &data;         // an immutable borrow
  |                         ----- immutable borrow occurs here
5 |     let mutable_ref = &mut data;       // a mutable borrow -- WHILE the immutable one is still alive
  |                       ^^^^^^^^^ mutable borrow occurs here
7 |     println!("{:?}", immutable_ref);
  |                      ------------- immutable borrow later used here

error: aborting due to previous error
```

Again, no binary produced — a real, specific violation, named exactly:
`data` cannot be borrowed as mutable while an immutable borrow of it is
still in use later in the program.

### The Fix

```rust
fn main() {
    let mut data = vec![1, 2, 3];

    {
        let ref1 = &data;   // multiple IMMUTABLE borrows at once -- totally fine
        let ref2 = &data;
        println!("ref1: {:?}, ref2: {:?}", ref1, ref2);
    }   // both immutable borrows end here

    let mutable_ref = &mut data;   // now safe -- no immutable borrows are still alive
    mutable_ref.push(4);
    println!("after push: {:?}", mutable_ref);
}
```

```
ref1: [1, 2, 3], ref2: [1, 2, 3]
after push: [1, 2, 3, 4]
```

Two things confirmed at once: **multiple immutable borrows** (`ref1`
and `ref2`) coexisting is completely fine — reading from several places
at once is safe. But the `mut` borrow only becomes legal once *both*
immutable borrows have gone out of scope (the inner `{ }` block,
directly reused from Lesson 89's own scope-and-drop mechanism) —
confirmed by the successful `push`.

### Mechanical Walkthrough

- `&data` (twice, for `ref1` and `ref2`) — multiple simultaneous
  immutable borrows are always allowed; reading the same data from
  several places at once can never cause the specific danger this rule
  exists to prevent.
- `&mut data` — **first appearance of a mutable reference.** Rust's
  actual rule, worth stating precisely: at any given point in the
  program, a value can have *either* any number of immutable
  (read-only) borrows, *or* exactly one mutable (read-write) borrow —
  never both kinds at once. The inner scope in the fixed version
  ensures `ref1` and `ref2` are both gone (out of scope, per Lesson
  89's own `Drop` timing) before `mutable_ref` is created, satisfying
  the rule.
- `mutable_ref.push(4);` — only possible because the borrow is
  genuinely mutable; an immutable `&data` reference would not permit
  calling `.push()` at all, a separate, related check this lesson
  doesn't dwell on but is worth knowing exists.

### CS Lens

This exact rule — "many readers or one writer, never both" — is a
direct, compile-time-enforced version of the same discipline Lesson 74
needed a *runtime* `threading.Lock` to provide, and Lesson 75's whole
lesson existed to show what happens when *two* such locks are acquired
in inconsistent order. In ordinary single-threaded Rust code, this rule
prevents a related but distinct danger (an iterator or reference
becoming invalid mid-use because the underlying data changed
unexpectedly underneath it) rather than a literal multi-thread race —
but the *same* borrowing rule extends directly into Rust's concurrent
code too, where it genuinely does prevent data races at compile time,
for exactly the same structural reason: code that would need a `Lock`
in Python or C often simply fails to compile in Rust, well before it
would ever get the chance to race.

## Exercises

- Write a function that takes `&mut Vec<i32>` and pushes a value onto
  it, confirming the caller's own vector reflects the change afterward
  — the mutable-borrow equivalent of Lesson 82's C pointer-based
  `swap`, achieving the same "let a function modify the caller's data"
  goal without any raw pointers at all.
- Deliberately create an immutable borrow, then try to also create a
  *second* mutable borrow (skip the first immutable one) at the same
  time as an existing mutable borrow — confirm Rust also rejects two
  simultaneous mutable borrows of the same data, not just a
  mutable/immutable mix.
- Research **NLL** (non-lexical lifetimes) — a real Rust compiler
  feature that lets a borrow's effective lifetime end at its *last
  use*, not just at the end of its enclosing scope — and rewrite the
  borrow-conflict fix without the extra inner `{ }` block, relying on
  NLL to end `ref1`/`ref2`'s borrows automatically once their last
  `println!` use is complete.
- Write a small program with two functions, one taking `&Vec<i32>`
  (read-only) and one taking `&mut Vec<i32>` (read-write), and confirm
  by reading each function's signature alone — without reading its
  body — which operations each is and isn't allowed to perform.

## Definition of Done

- [ ] The ownership-cost failure (`E0382`, forgetting to borrow)
      reproduced on your own machine, including reading the compiler's
      own suggested fix.
- [ ] `print_length` fixed with `&String`, confirming the caller's
      `name` remains valid after the call.
- [ ] Both dangling-reference errors reproduced in order — `E0106`
      (missing lifetime) and then `E0515` (cannot return reference to
      local variable) — confirming the compiler catches this before
      producing any binary at all.
- [ ] The dangling reference fixed by returning an owned `String`
      instead of a reference, confirmed to run and print correctly.
- [ ] The mutable/immutable borrow conflict (`E0502`) reproduced for
      real, and fixed by scoping the immutable borrows to end before
      the mutable one begins.
- [ ] Can explain out loud, without looking at the code, why Lesson
      86's C dangling-pointer program successfully compiled and ran
      (crashing only at the dereference), while this lesson's
      equivalent Rust program never compiled at all.
- [ ] Committed, with a message explaining *why* — e.g. `"Borrowing
      and the borrow checker: & lets functions read without taking
      ownership, and the compiler rejects both a dangling reference
      and a mutable/immutable borrow conflict before the program ever
      runs"` — not `"add borrowing examples"`.
