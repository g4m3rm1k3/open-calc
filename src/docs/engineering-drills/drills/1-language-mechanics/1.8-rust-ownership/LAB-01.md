# Drill 1.8 — Rust: Ownership and Borrowing

**Standalone drill. No prerequisites except basic programming knowledge.**
**Time estimate:** 90–120 minutes
**Environment:** Rust — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
**What you will build:** A small program that manages a list of items — written first in a way that would silently corrupt memory in C, then rewritten with Rust's ownership rules showing exactly why each rule exists
**What you will understand:** Why Rust has no garbage collector and no manual `free()` — and how ownership makes memory safety a compiler guarantee, not a runtime check

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. In C, you can do this: `char *p = malloc(10); free(p); printf("%s", p);` — read memory after freeing it. What is wrong with this? What can an attacker do with it?

2. If two variables point to the same heap data, and one variable's owner frees the memory, the other variable now points to freed memory. What is this bug called?

3. Rust's borrow checker is a compile-time check. What does this mean for runtime performance — how much slower is a Rust program because of the borrow checker?

4. What is the difference between a shared reference `&T` and a mutable reference `&mut T`? Can you have both at the same time for the same data?

*(Answers at the bottom of this lab.)*

---

## The Concept: Why Rust Exists

### Concept: The Memory Safety Problem

**What it is:**
Every program that uses heap memory (dynamically allocated — not on the stack) must answer three questions: when to allocate, when to free, and who is responsible for each. Getting any of these wrong causes either a crash or a security vulnerability — often silently.

**The problem languages face:**

```c
// C: manual memory management — you are responsible for everything
char *buf = malloc(100);         // allocate 100 bytes
strcpy(buf, user_input);         // copy input — but what if len(user_input) > 100?
process(buf);                    // use the buffer
free(buf);                       // you must free it — forget this and you leak memory
process(buf);                    // use-after-free — undefined behavior, exploit vector
free(buf);                       // double-free — heap corruption
```

In C, none of these mistakes produce compile errors. They either crash randomly, corrupt data silently, or allow attackers to execute arbitrary code. 70% of all CVEs (Common Vulnerabilities and Exposures) in security-critical software are memory safety bugs.

**The two approaches before Rust:**

1. **Manual management (C/C++):** Fast, but the programmer is responsible for every allocation and deallocation. Mistakes are silent and catastrophic.
2. **Garbage collection (Java, Python, Go):** Safe, but requires a GC runtime that pauses your program to collect garbage. Not acceptable for systems software, game engines, or real-time code.

**The solution:**
Rust's ownership system. The compiler statically determines the lifetime of every value and inserts the correct `free()` call at compile time — automatically, without a garbage collector. Memory safety is guaranteed at compile time. Runtime performance is identical to C.

**What it hides:**
The `drop()` call (Rust's equivalent of `free()`). Every time a variable goes out of scope, Rust automatically calls `drop()` on it. You never write `free()`. The compiler generates it correctly every time.

**Operational reality:**
Rust is used in: Firefox's rendering engine (Gecko), the Linux kernel (as of 6.1), Android (Google is rewriting memory-unsafe C++ code), Amazon AWS (Firecracker VMM), Discord's backend, and Cloudflare's workers runtime. The common thread: systems code where memory bugs are catastrophic and GC pauses are unacceptable.

**You will see this again in:**
Every Rust program ever. Understanding ownership is the entire prerequisite for Rust — nothing else in the language makes sense without it. It also deepens your understanding of how other languages handle memory — Python's reference counting, C++'s smart pointers, and Go's escape analysis all solve the same problem differently.

**Watch for:**
The borrow checker's error messages are often your first teacher. When the compiler refuses your code, it is always right — don't fight it, understand it. The error tells you exactly which ownership rule you violated.

---

## The Concept: Ownership Rules

### Concept: The Three Ownership Rules

**What it is:**
Rust's type system enforces three rules that make memory safety provable at compile time:

```
Rule 1: Every value has exactly one owner.
Rule 2: When the owner goes out of scope, the value is dropped (freed).
Rule 3: There can be multiple shared references (&T) OR one mutable reference (&mut T), but not both at the same time.
```

**Rule 1 and 2 — ownership and drop:**

```rust
{
    let s = String::from("hello");  // s owns the string data on the heap
    // ... use s ...
}   // s goes out of scope — Rust calls drop(s) here automatically
    // The heap memory is freed. No garbage collector. No free() call from you.
```

**Rule 1 — move semantics (heap data):**

```rust
let s1 = String::from("hello");
let s2 = s1;          // s1's ownership MOVES to s2
println!("{}", s1);   // ERROR: s1 no longer owns the data — it was moved
                       // This is NOT a copy — s1 is now invalid
```

This prevents double-free: if both `s1` and `s2` could own the same data, both would try to free it when they go out of scope. Rust makes it impossible by marking `s1` as moved.

**Copy types (stack data):**

```rust
let x = 5;            // integers live on the stack — they are Copy
let y = x;            // y gets a COPY of x's value — both are valid
println!("{} {}", x, y);   // works — x is still valid because integers are Copy
```

Stack values are trivially copyable — they have no heap allocation to double-free. Integers, booleans, chars, and tuples of Copy types are Copy.

**Rule 3 — borrowing:**

```rust
let mut s = String::from("hello");

let r1 = &s;          // shared reference — read-only
let r2 = &s;          // another shared reference — fine, multiple readers OK
println!("{} {}", r1, r2);

let r3 = &mut s;      // mutable reference — exclusive write access
// r1 and r2 are no longer used after here, so Rust allows r3
// If r1 or r2 were used after r3 was created, this would be a compile error
```

**Why Rule 3 prevents data races:**
A data race requires: two or more pointers to the same memory, at least one writing, without synchronization. Rule 3 makes this impossible — you can have many readers OR one writer, never both. This eliminates an entire class of concurrency bugs at compile time.

**Canonical example:**
A library book checkout system. One rule: a book is either (a) available for multiple people to read simultaneously in the library, or (b) checked out by exactly one person for modification. You cannot read a book in the library while someone has it checked out at home. Rust enforces this for every piece of data in your program.

**Constraints:**
- References cannot outlive the data they point to — the compiler tracks lifetimes to prevent dangling pointers
- A `String` cannot be both moved and borrowed in the same scope
- Mutability is opt-in — all variables are immutable by default (`let mut` to allow mutation)

**Failure modes:**
- `error[E0382]: borrow of moved value` — you tried to use a value after moving it
- `error[E0502]: cannot borrow as mutable because it is also borrowed as immutable` — Rule 3 violation
- `error[E0597]: does not live long enough` — a reference outlives the data it points to
- All of these are compile errors — they never reach runtime

---

## Step 1 — The Problem Rust Solves (Illustrated)

Create a new Rust project:

```bash
cargo new ownership-drill
cd ownership-drill
```

Replace `src/main.rs` with:

```rust
fn main() {
    // ── Ownership rule 1 + 2: automatic drop ──────────────────────────────────
    {
        let heap_string = String::from("I live on the heap");
        // String stores its data on the heap — length, capacity, pointer.
        // 'heap_string' owns this heap allocation.
        println!("Inside scope: {}", heap_string);
    }
    // heap_string goes out of scope here — Rust calls drop(heap_string)
    // The heap memory is freed. Automatically. No free() call required.
    // println!("{}", heap_string);  // ← uncomment to see the error

    // ── Ownership rule 1: move semantics ──────────────────────────────────────
    let s1 = String::from("hello");
    let s2 = s1;
    // s1's ownership has been MOVED to s2.
    // s1 is now invalid — it no longer owns anything.
    // Rust cannot allow s1 to be used — when s2 drops, the memory would already be freed.
    // println!("{}", s1);  // ← uncomment to see: "borrow of moved value: `s1`"
    println!("s2 owns the data: {}", s2);

    // ── Copy types: integers live on the stack and are copied, not moved ───────
    let x = 42;         // x is i32 — a Copy type (no heap allocation)
    let y = x;          // y gets a COPY of x — both x and y are valid
    println!("Both valid: x={}, y={}", x, y);

    // ── Borrowing: use data without taking ownership ───────────────────────────
    let s3 = String::from("world");
    let len = calculate_length(&s3);
    // &s3 is a REFERENCE — it borrows s3 without taking ownership.
    // s3 is still valid after the call.
    println!("Length of '{}' is {}", s3, len);
}

fn calculate_length(s: &String) -> usize {
    // s is a reference — it does not own the String
    // When this function returns, s goes out of scope but the String is NOT dropped
    // because s doesn't own it — s3 in main() still owns it
    s.len()
}
```

### COMPILE AND RUN

```bash
cargo run
```

**Expected output:**
```
Inside scope: I live on the heap
s2 owns the data: hello
Both valid: x=42, y=42
Length of 'world' is 5
```

**Terminal verification — see the compiler catch a move error:**

Uncomment the line `// println!("{}", s1);` and try to compile:

```bash
cargo build
```

Expected error:
```
error[E0382]: borrow of moved value: `s1`
  --> src/main.rs:16:20
   |
   |     let s1 = String::from("hello");
   |         -- move occurs because `s1` has type `String`
   |     let s2 = s1;
   |              -- value moved here
   |     println!("{}", s1);
   |                    ^^ value borrowed here after move
```

Read this error carefully. The compiler tells you: the move happened at `let s2 = s1`, so `s1` is invalid afterward. This is not a runtime crash — the compiler refused to produce an executable. Comment the line out again.

**Change something:** Try `let s2 = s1.clone()` instead of `let s2 = s1`. Now uncomment `println!("{}", s1)`. Both `s1` and `s2` are valid — `clone()` creates a deep copy on the heap. The tradeoff: `clone()` allocates new memory; a move doesn't. Use `clone()` only when you need two owners.

---

## Step 2 — Mutable References and the Borrow Rule

Replace `src/main.rs` with:

```rust
fn main() {
    // ── Mutable references: exclusive write access ────────────────────────────
    let mut s = String::from("hello");
    // 'mut' makes s mutable — Rust defaults to immutable (the safe choice)

    add_world(&mut s);
    // &mut s: a mutable reference — gives the function exclusive write access
    // After add_world returns, s is ours again
    println!("{}", s);  // prints "hello, world"

    // ── The borrow rule in action ─────────────────────────────────────────────
    let r1 = &s;        // shared reference — read-only
    let r2 = &s;        // another shared reference — fine, multiple readers OK
    println!("r1: {}, r2: {}", r1, r2);
    // r1 and r2 are last used here — their borrow ends here

    let r3 = &mut s;    // mutable reference — only one allowed at a time
    r3.push_str("!");   // mutate through the mutable reference
    println!("r3: {}", r3);
    // If you tried to use r1 or r2 after r3 was created, compiler error:
    // "cannot borrow `s` as mutable because it is also borrowed as immutable"
}

fn add_world(s: &mut String) {
    // s is a mutable reference — we can modify the String, but we don't own it
    // When this function returns, we don't drop it — the caller still owns it
    s.push_str(", world");
    // push_str appends to the String in place
}
```

### COMPILE AND RUN

```bash
cargo run
```

**Expected output:**
```
hello, world
r1: hello, world, r2: hello, world
r3: hello, world!
```

**Terminal verification — trigger Rule 3:**

Add this code after `let r1 = &s; let r2 = &s;` but before the `println!`:

```rust
let r3 = &mut s;   // add this line
```

```bash
cargo build
```

Expected error: `cannot borrow 's' as mutable because it is also borrowed as immutable`. Rust refuses to compile code with simultaneous mutable and shared borrows — no data race is possible. Remove the extra line.

**Change something:** Move the `println!("r1: {}, r2: {}", r1, r2)` line to AFTER `let r3 = &mut s`. The same borrow rule violation occurs — because r1 and r2 are now used after the mutable borrow. Rust's "non-lexical lifetimes" end borrows at their last use, not at the end of the block. Move the println back to before r3.

---

## Step 3 — A Complete Example: Item List

Replace `src/main.rs` with a small item management program:

```rust
// An item list that demonstrates all three ownership rules together

fn main() {
    let mut items: Vec<String> = Vec::new();
    // Vec<String> is a growable list of heap-allocated strings
    // items owns the Vec, which owns each String inside it

    add_item(&mut items, "Buy groceries".to_string());
    add_item(&mut items, "Call dentist".to_string());
    add_item(&mut items, "Fix the bike".to_string());

    println!("All items:");
    display_items(&items);    // shared borrow — items is read-only here

    println!("\nFirst item: {}", get_first(&items));  // another shared borrow

    mark_done(&mut items, 0); // mutable borrow — modifies the first item
    println!("\nAfter marking done:");
    display_items(&items);

    // items drops here — Vec and all the Strings inside it are freed
}

fn add_item(items: &mut Vec<String>, item: String) {
    // items: mutable reference to the Vec — we can modify it
    // item: we TAKE ownership of the String — the caller cannot use it after this call
    items.push(item);
    // push() moves item into the Vec — the Vec now owns it
}

fn display_items(items: &Vec<String>) {
    // items: shared reference — we can read but not modify
    for (i, item) in items.iter().enumerate() {
        // iter() borrows each element — we don't take ownership
        println!("  {}. {}", i + 1, item);
    }
}

fn get_first(items: &Vec<String>) -> &str {
    // Returns a reference to data inside items — NOT a copy
    // The returned reference is valid as long as items is valid
    // Rust's lifetime system tracks this — &str borrows from items
    if items.is_empty() {
        return "No items";
    }
    &items[0]  // reference to the first String's str data
}

fn mark_done(items: &mut Vec<String>, index: usize) {
    if index < items.len() {
        // Modify the string at index in place — append " [DONE]"
        items[index].push_str(" [DONE]");
        // items[index] gives us a mutable reference to the String at that position
    }
}
```

### COMPILE AND RUN

```bash
cargo run
```

**Expected output:**
```
All items:
  1. Buy groceries
  2. Call dentist
  3. Fix the bike

First item: Buy groceries

After marking done:
  1. Buy groceries [DONE]
  2. Call dentist
  3. Fix the bike
```

**In the terminal — experiment with ownership:**

```bash
# See all the compiled artifacts:
ls target/debug/

# Check that Rust produced a native binary (no VM, no runtime):
file target/debug/ownership-drill
# Expected: ELF 64-bit (Linux) or Mach-O (macOS) — native machine code
```

**Change something:** In `main()`, after calling `add_item`, try to use the String you passed:

```rust
let task = "Learn Rust".to_string();
add_item(&mut items, task);
println!("{}", task);  // ← add this — task was MOVED into add_item
```

Expected error: `borrow of moved value: task`. `add_item` takes `item: String` — full ownership. After the call, `task` is gone. Fix: either pass `task.clone()` to `add_item`, or change `add_item` to take `&str` (a reference) and convert internally.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a `TodoList` struct that owns its items and enforces these rules through Rust's ownership system.

**Requirements checklist:**

- [ ] `TodoList` is a struct containing a `Vec<String>` of items
- [ ] `TodoList::new() -> TodoList` — constructor, returns an owned TodoList
- [ ] `fn add(&mut self, item: String)` — takes ownership of the String (no clone)
- [ ] `fn remove(&mut self, index: usize) -> Option<String>` — removes and RETURNS the String (caller takes ownership)
- [ ] `fn get(&self, index: usize) -> Option<&str>` — returns a reference, not a copy
- [ ] `fn count(&self) -> usize` — returns the count
- [ ] `fn display(&self)` — prints all items
- [ ] A `main()` that creates a TodoList, adds three items, removes the second, and displays the result

**Starter:**

```rust
struct TodoList {
    // TODO: add a Vec<String> field
}

impl TodoList {
    fn new() -> TodoList {
        // TODO
    }

    fn add(&mut self, item: String) {
        // TODO: push item into the Vec — item is MOVED in
    }

    fn remove(&mut self, index: usize) -> Option<String> {
        // TODO: remove and return the String at index
        // Hint: Vec has a remove() method that shifts elements
    }

    fn get(&self, index: usize) -> Option<&str> {
        // TODO: return a reference to the str at index, or None
        // Hint: &self.items[index] gives a &String — use .as_str() to get &str
    }

    fn count(&self) -> usize {
        // TODO
    }

    fn display(&self) {
        // TODO
    }
}
```

**When you're done:** `cargo run` prints the initial three items, then the list after removing the second item (two items remain). `cargo build` completes with zero warnings. Changing `remove` to return `String` instead of `Option<String>` causes a compile error if you try to call it with an out-of-bounds index — you must handle the `Option`.

**Stuck? Ask AI:** "In Rust, my `remove` method needs to remove a String from a Vec and return it to the caller. The Vec::remove method exists but I'm not sure how to return an Option. How do I check the index bounds and return None if out of range, or return the String wrapped in Some if valid?"

---

## Quick Check Answers

**1. What is wrong with reading memory after `free()`?**
After `free(p)`, the memory at `p` is returned to the allocator — it may be immediately reused for something else. Reading it is called a **use-after-free** bug. The value you read is whatever happened to be written there by the next allocation — garbage at best. An attacker who can control what gets allocated in that memory can place data that your program then treats as trusted — function pointers, authentication flags, or anything your code reads from that address. Use-after-free bugs are one of the most commonly exploited memory vulnerabilities. Rust's ownership system makes them impossible: you cannot use `s1` after moving it, and the compiler enforces this.

**2. What is the double-free bug?**
If two variables (say `p1` and `p2`) point to the same heap memory, and both try to `free()` it when they go out of scope, the heap is corrupted. The second `free()` is called on already-freed memory. This is undefined behavior — the heap allocator's internal data structures are corrupted, leading to crashes or exploits. Rust prevents this with Rule 1: every value has exactly one owner. When `let s2 = s1` moves ownership, `s1` becomes invalid — only `s2` will call `drop()`. There is exactly one `drop()` call per heap allocation, always.

**3. How much slower is a Rust program because of the borrow checker?**
Zero. The borrow checker is a compile-time analysis — it runs during compilation and produces zero runtime code. The ownership rules are enforced entirely by the compiler. The compiled binary contains no ownership metadata, no reference counting, no garbage collection pauses. A Rust program's runtime performance is identical to an equivalent C program. This is what "zero-cost abstractions" means in Rust: the safety guarantees cost nothing at runtime.

**4. `&T` vs `&mut T` — can you have both at the same time?**
No. `&T` is a shared reference — immutable, multiple allowed simultaneously. `&mut T` is a mutable reference — exclusive, only one allowed at a time. You cannot have both `&T` and `&mut T` pointing to the same data simultaneously. This is Rust's rule for preventing data races: either many readers OR one writer, never both. The `display_items(&items)` call uses `&Vec<String>` — a shared reference. `mark_done(&mut items, 0)` uses `&mut Vec<String>` — a mutable reference. They cannot overlap — and in `main()`, they don't, because `display_items` completes before `mark_done` starts.
