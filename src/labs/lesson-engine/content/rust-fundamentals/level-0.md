---
series: rust-fundamentals
level: 0
title: Ownership — Why Rust Exists
lang: javascript
---

# Ownership — Why Rust Exists

Before Rust, every systems programming language forced a trade-off: either the programmer managed memory manually (C, C++) with full control but the ability to corrupt it, or a garbage collector managed memory automatically (Java, Go) with safety but at a runtime cost. Rust breaks this trade-off. Its **ownership system** proves at compile time — with zero runtime overhead — that memory is always valid, always freed exactly once, and never accessed after it is freed. By the end of this lesson you will understand what ownership means, why the three ownership rules exist, and how move semantics prevent the memory bugs Rust was designed to eliminate.

## The Problem Rust Solves

To understand ownership, first understand what goes wrong without it. The most common memory bug in C is **use-after-free**: accessing memory that has already been freed.

```javascript
// In C, two pointers can point to the same memory.
// When one frees it, the other becomes a "dangling pointer."
// Reading through a dangling pointer is undefined behavior.
// This simulation shows the concept:

function simulateDanglingPointer() {
  let sharedMemory = { data: 'secret', freed: false }

  // Both pointer1 and pointer2 "point to" the same memory
  let pointer1 = sharedMemory
  let pointer2 = sharedMemory

  // pointer1 frees the memory
  pointer1.freed = true
  pointer1 = null

  // pointer2 is now a dangling pointer — still reading freed memory
  console.log('data read from freed memory:', pointer2.data)
  console.log('freed flag:', pointer2.freed)
}

simulateDanglingPointer()
```

```text
data read from freed memory: secret
freed flag: true
```

In real C, `pointer2` would read whatever bytes happen to be at that address — corrupted data, another variable's value, or crash. This class of bug causes the majority of critical security vulnerabilities in system software (CVEs from Chromium, Linux, Firefox).

**CS lens:** Use-after-free is **undefined behavior** at the C language specification level. The compiler is permitted to assume it never happens, which means it can (and does) generate surprising code when it does happen. Hardware memory protection (ASLR, stack canaries) reduces exploitability but cannot eliminate it. Only the language itself can.

## The Three Ownership Rules

Rust's answer is three rules the compiler enforces before any code runs:

```text
Rule 1: Every value has exactly one owner — the variable that holds it.
Rule 2: When the owner goes out of scope, the value is dropped (freed).
Rule 3: Ownership can be transferred (moved), but only one owner exists at a time.
```

We can simulate these rules in JavaScript to make the concept tangible:

```javascript
function makeOwnershipChecker() {
  const ownerMap = new Map()   // id → owner name
  const freedSet = new Set()   // ids that have been freed

  return {
    // Rule 1: bind creates a new owned value
    bind(ownerName, value) {
      const id = Symbol(String(value))
      ownerMap.set(id, ownerName)
      return { id, value }
    },

    // Rule 3: move transfers the one owner
    move(handle, newOwner) {
      if (freedSet.has(handle.id)) throw new Error('use after free')
      ownerMap.set(handle.id, newOwner)
    },

    // Rule 2: drop frees the value exactly once
    drop(handle) {
      if (freedSet.has(handle.id)) throw new Error('double free')
      freedSet.add(handle.id)
      ownerMap.delete(handle.id)
    },

    owner(handle) { return ownerMap.get(handle.id) ?? null },
    isAlive(handle) { return !freedSet.has(handle.id) },
  }
}

const checker = makeOwnershipChecker()

const h = checker.bind('s1', 'hello')
console.log('owner:', checker.owner(h))  // s1

checker.move(h, 's2')
console.log('owner after move:', checker.owner(h))  // s2

checker.drop(h)
console.log('alive after drop:', checker.isAlive(h))  // false

try {
  checker.drop(h)  // Rule 2: already freed
} catch (e) {
  console.log('error:', e.message)
}
```

```text
owner: s1
owner after move: s2
alive after drop: false
error: double free
```

Execution trace:
```text
bind('s1', 'hello')  → creates id=sym1, ownerMap: { sym1 → 's1' }
move(h, 's2')        → ownerMap: { sym1 → 's2' }  (s1 can no longer use it)
drop(h)              → freedSet: { sym1 }, ownerMap: {}
drop(h) again        → sym1 is in freedSet → throws 'double free'
```

**SE lens:** The key insight is that ownership is a **compile-time** property. In real Rust, the compiler tracks ownership through a data-flow analysis called **borrow checking** — it reads the source code and determines, without running the program, whether any ownership rule is violated. If one is, the program does not compile. No runtime check, no performance cost, no possibility of the bug slipping through.

## Move Semantics

In Rust, assigning a non-trivial value to a new variable **moves** it — the original becomes invalid.

```javascript
// In real Rust:
//   let s1 = String::from("hello")
//   let s2 = s1          // s1 is MOVED — now invalid
//   println!("{}", s1)   // compile error: borrow of moved value

function demonstrateMoveSemantics() {
  const moved = new Set()

  function rustAssign(destination, sourceId) {
    if (moved.has(sourceId)) {
      throw new Error(`borrow of moved value: '${sourceId}'`)
    }
    moved.add(sourceId)
    console.log(`  ${sourceId} → moved to ${destination}`)
    return destination
  }

  console.log('--- String (heap-allocated, non-Copy) ---')
  const s1 = 'string-handle-001'
  const s2 = rustAssign('s2', s1)  // s1 moves into s2
  console.log('s2:', s2)

  try {
    rustAssign('s3', s1)  // s1 was already moved
  } catch (e) {
    console.log('compile error:', e.message)
  }

  console.log('--- Integer (stack value, Copy) ---')
  const x = 5
  const y = x  // integers are Copy: both x and y stay valid
  console.log('x:', x, '  y:', y)
}

demonstrateMoveSemantics()
```

```text
--- String (heap-allocated, non-Copy) ---
  string-handle-001 → moved to s2
s2: s2
compile error: borrow of moved value: 'string-handle-001'
--- Integer (stack value, Copy) ---
x: 5   y: 5
```

**CS lens:** The Copy vs move distinction maps to where the data lives. Stack data (integers, booleans, fixed-size structs) can be copied cheaply — it is just bytes. Heap data (strings, vectors, anything dynamically sized) involves a pointer to allocated memory. Allowing silent copying of heap data would mean two variables own the same allocation — a double-free waiting to happen. Rust's type system encodes this distinction: types that implement the `Copy` trait are stack-only; all others are moved.

## Scope and Automatic Drop

The owned value is freed when the owning variable goes out of scope. No `free()` call. No garbage collector scan.

```javascript
function demonstrateDropOrder() {
  const log = []

  function makeTracked(name) {
    log.push(`CREATE ${name}`)
    return { name, drop: () => log.push(`DROP ${name}`) }
  }

  function innerScope() {
    const a = makeTracked('a')
    const b = makeTracked('b')
    // b drops first (LIFO), then a
    b.drop()
    a.drop()
  }

  const outer = makeTracked('outer')
  innerScope()
  outer.drop()

  log.forEach(entry => console.log(entry))
}

demonstrateDropOrder()
```

```text
CREATE outer
CREATE a
CREATE b
DROP b
DROP a
DROP outer
```

Execution trace:
```text
outer scope starts → outer created
  inner scope starts:
    a created
    b created
  inner scope ends (LIFO order):
    b dropped first (last created, first freed)
    a dropped second
outer scope ends → outer dropped
```

LIFO drop order means a value is always freed before any value it depends on. This is the foundation of Rust's **lifetime** system (covered in Level 1): the compiler tracks how long each value lives, and ensures references never outlive the value they point to.

## Non-Usage: When NOT to Use Ownership Transfer

Ownership transfer (moving) is the right tool when you want one thing to own the data exclusively. But it is the wrong tool when:

```text
You just want to READ a value without taking it → use a reference (&T)
You want to share data between multiple readers  → use a reference (&T)
You want to modify data without owning it       → use a mutable reference (&mut T)
You want to share ownership                     → use reference counting (Rc<T>)
```

Level 1 covers borrowing and references. The key intuition: **ownership is for when the new location must outlive the original**. For everything else, borrow.

## Challenge: ownership_tracker

Implement a value ownership tracker that enforces Rust's three rules.

`createOwnershipTracker()` — returns an object with:
- `.bind(name, value)` — creates a new owned value under `name`; returns a handle
- `.move(handle, newName)` — transfers ownership to `newName`; handle's owner updates
- `.isValid(handle)` — `true` if not yet dropped
- `.getValue(handle)` — returns the stored value (throws `'use after free'` if dropped)
- `.drop(handle)` — frees the value (throws `'double free'` if already dropped)
- `.owner(handle)` — returns the current owner name, or `null` if dropped

All handles are objects you define — the tests only call the methods above.

```challenge
function createOwnershipTracker() {
  return {
    bind(name, value) { return { _name: name, _value: value, _freed: false } },
    move(handle, newName) {},
    isValid(handle) { return false },
    getValue(handle) { return null },
    drop(handle) {},
    owner(handle) { return null },
  }
}
```

```test
const tracker = createOwnershipTracker()
const h = tracker.bind('x', 42)
assert tracker.isValid(h) === true
assert tracker.owner(h) === 'x'
assert tracker.getValue(h) === 42
tracker.move(h, 'y')
assert tracker.owner(h) === 'y'
tracker.drop(h)
assert tracker.isValid(h) === false
let threw = false
try { tracker.drop(h) } catch (e) { threw = e.message === 'double free' }
assert threw === true
```
