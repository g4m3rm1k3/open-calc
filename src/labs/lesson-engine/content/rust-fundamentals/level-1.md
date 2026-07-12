---
series: rust-fundamentals
level: 1
title: Borrowing and References
lang: javascript
---

# Borrowing and References

Moving ownership every time you need to read a value would be unusable — you could never pass a string to a function and then use the string again. Rust's solution is **borrowing**: lending access to a value without transferring ownership. A reference (`&T`) is a pointer that borrows the value without owning it. The borrow checker enforces two rules at compile time that prevent data races and dangling pointers. By the end of this lesson you will understand both reference types, the two borrowing rules, and why they together eliminate entire categories of concurrency bugs.

## References — Borrowing Without Owning

A reference points to a value without owning it. When the reference goes out of scope, the value is not dropped — it is still owned by the original variable.

```javascript
// In real Rust:
//   let s = String::from("hello")
//   let r = &s         // r borrows s — r does NOT own s
//   println!("{}", r)  // reads through the reference
//   // s is still valid here — it was borrowed, not moved

// Simulation: a reference knows WHERE to find a value, doesn't own it
function demonstrateReference() {
  const memory = new Map()
  memory.set('s', 'hello')

  function makeImmutableRef(targetName) {
    return { read: () => memory.get(targetName) }
  }

  const r = makeImmutableRef('s')
  console.log('ref reads:', r.read())       // borrows — reads through the ref
  console.log('s still there:', memory.get('s'))  // s is NOT moved, still exists
}

demonstrateReference()
```

```text
ref reads: hello
s still there: hello
```

Execution trace:
```text
memory: { 's' → 'hello' }          (s is owned here)
makeImmutableRef('s') → r          (r points at 's' — no ownership transfer)
r.read()  → memory.get('s')        ('hello' — reads through the ref)
memory.get('s')  → 'hello'         (s is STILL there — borrow ended, s unaffected)
```

**CS lens:** In Rust's compiled output, a reference is a machine pointer — one word of memory containing the address. The borrow checker is a compile-time dataflow analysis that tracks reference lifetimes through the control-flow graph. It costs zero at runtime; all checking happens when you compile.

## The Two Borrowing Rules

At any point in a scope, Rust enforces exactly two rules:

```text
Rule 1: Any number of immutable references (&T) may coexist — read-only sharing is always safe.
Rule 2: Only ONE mutable reference (&mut T) may exist at a time — exclusive write access.
Constraint: You cannot have an immutable AND a mutable reference at the same time.
```

```javascript
function simulateBorrowRules() {
  let storedValue = 42
  let immutableCount = 0
  let mutableCount  = 0

  function borrow(mode) {
    if (mode === 'immutable') {
      if (mutableCount > 0)
        throw new Error('cannot borrow: value is mutably borrowed')
      immutableCount++
      return {
        read()    { return storedValue },
        release() { immutableCount-- },
      }
    }
    if (mode === 'mutable') {
      if (mutableCount > 0)
        throw new Error('cannot borrow as mutable: already mutably borrowed')
      if (immutableCount > 0)
        throw new Error('cannot borrow as mutable: immutable borrows exist')
      mutableCount++
      return {
        read()     { return storedValue },
        write(v)   { storedValue = v },
        release()  { mutableCount-- },
      }
    }
  }

  // Rule 1: many immutable refs — OK
  const r1 = borrow('immutable')
  const r2 = borrow('immutable')
  console.log('two immutable refs:', r1.read(), r2.read())
  r1.release(); r2.release()

  // Rule 2: one mutable ref — OK
  const rw = borrow('mutable')
  rw.write(100)
  console.log('after mutable write:', rw.read())
  rw.release()

  // Constraint violated: immutable + mutable at same time
  const r3 = borrow('immutable')
  try {
    borrow('mutable')
  } catch (e) {
    console.log('borrow error:', e.message)
  }
  r3.release()
}

simulateBorrowRules()
```

```text
two immutable refs: 42 42
after mutable write: 100
borrow error: cannot borrow as mutable: immutable borrows exist
```

**CS lens:** The two borrow rules are a compile-time proof of absence of **data races**. A data race requires: two accesses to the same memory location, at least one write, with no synchronisation. The borrow rules eliminate this: you either have multiple readers (no writer) or one writer (no readers). The same invariant enforced by `RwLock` at runtime, enforced by Rust's type system at compile time with zero overhead.

## Why the Rules Prevent Dangling References

The borrow checker also tracks **lifetimes** — how long each reference is valid — to prevent dangling pointers.

```javascript
// In real Rust, this fails to compile:
//   fn dangle() -> &String {
//     let s = String::from("hello")
//     &s              // ERROR: s is dropped at end of this function
//   }                 // s goes out of scope here — the returned ref would dangle

function demonstrateLifetimes() {
  const alive = new Set()

  function create(name, value) {
    alive.add(name)
    return { name, value }
  }

  function makeRef(handle) {
    return {
      deref() {
        if (!alive.has(handle.name))
          throw new Error(`dangling reference: '${handle.name}' was dropped`)
        return handle.value
      }
    }
  }

  function drop(handle) {
    alive.delete(handle.name)
  }

  // VALID: ref lives shorter than value
  const x = create('x', 'still alive')
  const rx = makeRef(x)
  console.log('valid deref:', rx.deref())
  // rx goes out of scope here (hypothetically), THEN x is dropped
  drop(x)

  // INVALID: ref outlives value
  let danglingRef
  const y = create('y', 'temporary')
  danglingRef = makeRef(y)
  drop(y)   // y is gone while danglingRef still exists

  try {
    danglingRef.deref()
  } catch (e) {
    console.log('runtime caught (Rust catches this at compile time):', e.message)
  }
}

demonstrateLifetimes()
```

```text
valid deref: still alive
runtime caught (Rust catches this at compile time): dangling reference: 'y' was dropped
```

Rust's rule: **a reference's lifetime must be a subset of the value's lifetime**. The compiler proves this statically. The annotation `'a` in function signatures like `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` explicitly names lifetimes so the compiler can check them across function boundaries.

**SE lens:** Lifetime errors are the most common stumbling block for Rust newcomers, but they are the compiler flagging a real bug that would have been a crash or security vulnerability in C. The learning curve of lifetimes is steep precisely because it forces you to be explicit about something C ignores and C++ handles imperfectly.

## Common Mistakes

```javascript
// MISTAKE 1: Holding a mutable borrow while reading
// (covered by borrow rules — won't compile in Rust)

// MISTAKE 2: Trying to return a reference to a local variable
// fn make_ref() -> &String {
//   let s = String::from("temp")
//   &s   // ERROR: s is dropped when function returns
// }
// FIX: return the String (owned), not a reference to it

// MISTAKE 3: Calling a method that takes &mut self while holding &self
// let r = &vec[0]      // immutable borrow of vec
// vec.push(42)         // ERROR: push() needs &mut self — mutable borrow
// println!("{}", r)    // r would dangle if push() reallocated
// FIX: clone r first, or don't hold r across the push

// These are the three most common borrow checker errors.
// Each one prevents a real memory bug.
console.log('borrow checker errors are compile-time bug reports')
```

```text
borrow checker errors are compile-time bug reports
```

## Challenge: borrow_checker

Implement a borrow checker enforcing Rust's two borrowing rules.

`createBorrowChecker(initialValue)` — returns an object with:
- `.borrow(mode)` — `mode` is `'immutable'` or `'mutable'`; returns a borrow handle; throws if a rule is violated: `'already mutably borrowed'` or `'immutable borrows exist'`
- `.release(handle)` — ends the borrow
- `.activeBorrows()` — returns `{ immutable: number, mutable: number }`

Handles from `borrow('immutable')` have `.read()`. Handles from `borrow('mutable')` have `.read()` and `.write(value)`. All reads/writes affect the same underlying value.

```challenge
function createBorrowChecker(initialValue) {
  return {
    borrow(mode) {
      return { read() { return null }, write(v) {} }
    },
    release(handle) {},
    activeBorrows() { return { immutable: 0, mutable: 0 } },
  }
}
```

```test
const bc = createBorrowChecker(10)
const r1 = bc.borrow('immutable')
const r2 = bc.borrow('immutable')
assert bc.activeBorrows().immutable === 2
assert r1.read() === 10
bc.release(r1); bc.release(r2)
assert bc.activeBorrows().immutable === 0
const rw = bc.borrow('mutable')
rw.write(99)
assert rw.read() === 99
bc.release(rw)
const r3 = bc.borrow('immutable')
let threw = false
try { bc.borrow('mutable') } catch (e) { threw = true }
assert threw === true
bc.release(r3)
```
