# Rust Web Server — LAB 03 — Ownership, the Stack, and the Heap

**Prerequisites:** LAB 01 and LAB 02. You understand variables, types, functions, loops, and `if` statements. You have built and run a complete Rust program.

**What this lab adds:**
- A concrete mental model of the stack and the heap — two regions of memory with completely different rules
- Understanding of what memory management is, why it is hard, and what goes wrong when it is done incorrectly
- Rust's ownership system — the rules the compiler enforces to make memory safe without a garbage collector
- Borrowing and references — how to use data without taking ownership of it
- Shadowing — a Rust pattern you have already seen, now fully explained
- An extended version of the guessing game that passes data between functions safely

**Time:** 4–6 hours. This is the hardest conceptual lab in the series. Read slowly. Re-read the ownership section until the rules feel natural, not memorized.

---

> **Quick Check — try to answer before reading further:**
>
> 1. When a function finishes running, what do you think happens to the variables it created? Where do they go?
> 2. In Lab 02, you saw `&secret_number` passed to `.cmp()`. What do you think the `&` means — why would you pass `&something` instead of just `something`?
> 3. Languages like Python and JavaScript never make you think about memory — it is managed automatically. What do you think that automatic management costs? Can anything go wrong?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, your guessing game is restructured into functions — each doing one job — and passes data between them safely using Rust's ownership and borrowing rules. The game plays identically, but the code is organized like a real program:

```
$ cargo run

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1: 50
Too high.

Guess 2: 25
Too low.

Guess 3: 31
Correct! You got it in 3 guesses.

Thanks for playing!
```

Same output. Completely different internal structure. Understanding that structure is the goal of this lab.

---

## Part 1 — Memory: The Full Picture

In Lab 01 you learned that RAM is where running programs store their data. In Lab 02 you learned that every type has a fixed size in bits. Now you need to understand *where inside RAM* different data lives — because "RAM" is not a single uniform space. It is divided into regions with completely different behaviors.

### Concept: The Stack

**What it is:** The stack is a region of memory that works like a physical stack of trays in a cafeteria. You add trays to the top. You take trays from the top. You never reach into the middle.

**The technical name for this behavior:** LIFO — Last In, First Out. The last thing added is the first thing removed. This constraint is what makes the stack so fast.

**What lives on the stack:**
- Function call information (which function called which, and where to return to)
- Local variables with sizes known at compile time (integers, floats, booleans, chars, fixed-size arrays)
- References (pointers to data — we will get there)

**Why the stack is fast:** Adding something to the stack is just incrementing a number — a register called the **stack pointer** that tracks where the top of the stack currently is. Removing something is just decrementing that same number. No searching, no bookkeeping, no coordination. Two CPU instructions.

**The stack frame:**

Every time a function is called, Rust pushes a **stack frame** onto the stack. A stack frame is a block of memory holding:
- All of that function's local variables
- The return address — where in the caller's code to go back to when this function finishes

When the function returns, its entire stack frame is popped off — all its variables are gone in one operation. This is automatic, instant, and cannot be forgotten.

```
Stack grows downward as functions call each other:

│  main() frame        │ ← pushed first
│  - secret: i32 = 37  │
│  - guesses: u32 = 0  │
├──────────────────────┤
│  get_guess() frame   │ ← pushed when main() calls get_guess()
│  - input: String     │
│  - guess: i32        │
├──────────────────────┤
│  (next call goes here)│ ← stack grows downward
```

When `get_guess()` returns, its frame is popped. `main()` resumes exactly where it left off.

**The stack's limitation:** Everything on the stack must have a size known at compile time. The compiler needs to know how much space to reserve in the stack frame when it compiles the function. A function that might use 100 bytes or might use 100,000 bytes (depending on user input) cannot use the stack for that variable-size data.

---

### Concept: The Heap

**What it is:** The heap is a region of memory where data can be stored at runtime, at sizes not known until the program is actually running.

**The analogy:** A heap of memory is like a large shared workspace with a manager. When you need space, you ask the manager: "I need 50 bytes." The manager finds an empty region of 50 bytes, marks it as in use, and gives you its address. When you are done, you tell the manager: "I am done with those 50 bytes." The manager marks them as available again.

**The technical terms:**
- **Allocating** — asking the memory manager for a region of heap memory
- **Deallocating** (or **freeing**) — returning that region to the memory manager when done

**Why the heap is slower:** The memory manager has to search for a free region of the right size. That search takes time. Managing the bookkeeping (what is free, what is in use) takes time. Allocating heap memory is roughly 10–100 times slower than adding to the stack.

**What lives on the heap:**
- Data whose size is not known at compile time — like a String whose length depends on what the user types
- Data that needs to outlive the function that created it
- Large data structures

**The crucial insight — stack + heap together:**

When you write `let mut name = String::new()` in Rust, you get *two* things:

```
Stack:                    Heap:
┌─────────────────┐       ┌─────────────────────┐
│ name            │       │                     │
│  ptr ──────────────────►│  "Ada"              │
│  len: 3         │       │                     │
│  capacity: 8    │       └─────────────────────┘
└─────────────────┘
```

- On the **stack**: a small, fixed-size structure with three fields — a pointer (the memory address of the heap data), a length (how many bytes are currently used), and a capacity (how many bytes are allocated total)
- On the **heap**: the actual character data — "Ada" — which can grow or shrink as needed

The stack part of a `String` is always the same size (24 bytes on a 64-bit system — 8 bytes for each of three fields). That is why it can live on the stack. The heap part is whatever size it needs to be.

---

### Concept: The Memory Management Problem

**What it is:** Memory management is the discipline of allocating heap memory when you need it and deallocating it when you are done — correctly, completely, and without mistakes.

**Why it is hard:** Three categories of bugs, all catastrophic:

**Bug 1 — Memory leak:** You allocate memory and never free it. The program consumes more and more RAM until the OS kills it, or the machine runs out of memory. A web server with a memory leak runs fine for hours and then crashes, taking all active connections with it.

**Bug 2 — Use after free:** You free memory and then accidentally access it again. The memory manager may have given that region to another part of the program, or to another process. You read garbage data. You corrupt unrelated data. In C programs, this is one of the most common sources of security vulnerabilities — an attacker can craft inputs that cause your program to read or write attacker-controlled memory.

**Bug 3 — Double free:** You free the same memory twice. The memory manager's bookkeeping is corrupted. The next allocation might return memory that is simultaneously in use by two different parts of the program. Both parts overwrite each other's data.

**How other languages solve this:**

| Approach | Languages | How it works | What it costs |
|---|---|---|---|
| Manual management | C, C++ | Programmer calls `malloc()` and `free()` | Fast, but bugs 1–3 are common |
| Garbage collector | Python, Java, Go, JavaScript | Runtime periodically scans for unreachable memory and frees it | Safe, but pauses and overhead |
| Ownership system | Rust | Compiler enforces rules that prevent all three bugs at compile time | Zero runtime cost, no pauses, no bugs |

**Rust's position:** The ownership system is Rust's answer to this 50-year-old problem. The compiler enforces rules that make it impossible to write code with memory bugs — not by catching them at runtime, but by refusing to compile them. The code you ship is provably free of these bugs.

---

## Part 2 — Ownership

### Concept: Ownership — Rust's Memory Rule System

**What it is:** Ownership is a set of three rules the Rust compiler enforces about every value in your program. Together, they make memory safe without a garbage collector.

**What it hides:** Ownership hides the entire memory management problem. You never call `malloc` or `free`. You never worry about double frees or use-after-free. The compiler tracks who owns what and generates the correct `free` (called `drop` in Rust) calls automatically.

The invariant ownership protects: **every piece of heap memory has exactly one owner at any given time, and that memory is freed exactly when the owner goes out of scope — no earlier, no later.** You cannot accidentally free memory twice because only one owner exists. You cannot forget to free it because the compiler inserts the `drop` call automatically. You cannot use freed memory because the compiler refuses to compile code that accesses a value after it has been dropped.

**The three ownership rules:**

```
Rule 1: Every value in Rust has exactly one owner.

Rule 2: There can only be one owner at a time.

Rule 3: When the owner goes out of scope, the value is dropped
        (its heap memory is freed automatically).
```

These three rules, enforced at compile time, eliminate the entire category of memory bugs. Let us understand each one with concrete examples.

---

### Concept: Scope — Where a Variable Lives

**What it is:** A variable's scope is the region of code where it exists and is accessible. In Rust, scope is defined by curly braces `{}`.

**Canonical example (General Explanation):**

```rust
{                           // scope begins
    let greeting = String::from("Hello");
    println!("{}", greeting); // greeting is accessible here
}                           // scope ends — greeting is DROPPED here, its heap memory freed

println!("{}", greeting);   // COMPILE ERROR: greeting no longer exists
```

The moment execution reaches the closing `}`, Rust automatically inserts a call to `drop(greeting)` — the function that frees the heap memory. This is not something you write. It is generated by the compiler, always, consistently, with no way to forget it.

**Why curly braces define scope:** In Rust (and most C-family languages), every `{` opens a new scope and every `}` closes it. Variables declared inside a scope are invisible outside it. This applies to function bodies, `if` blocks, `loop` bodies, and any standalone `{}` block you write.

**Project Application:**

In the guessing game, `secret_number` is declared at the top of `main()`. Its scope is the entire `main()` function body. When `main()` returns (when your program ends), `secret_number` goes out of scope. For an `i32`, "dropping" just means the stack frame is popped — there is no heap memory to free. For a `String`, dropping frees the heap allocation.

---

### Concept: Move — Transferring Ownership

**What it is:** When you assign a heap-allocated value to a new variable, or pass it to a function, Rust **moves** ownership. The original variable becomes invalid.

**The problem this prevents:**

If two variables pointed to the same heap memory, and both tried to free it when they went out of scope, you would get a **double free** — bug #3 from our list. Rust prevents this by making the original variable invalid after the move. There is always exactly one owner.

**Canonical example (General Explanation):**

```rust
let name1 = String::from("Ada");  // name1 owns the heap memory containing "Ada"
let name2 = name1;                 // ownership MOVES to name2 — name1 is now invalid

println!("{}", name1);  // COMPILE ERROR: value borrowed here after move
                        // name1 no longer owns anything — it cannot be used
println!("{}", name2);  // this works — name2 is the owner now
```

**Why this does not apply to simple types like integers:**

```rust
let x = 5;    // x owns the value 5 — but 5 lives on the stack, not the heap
let y = x;    // x is COPIED — both x and y are valid

println!("{}", x);  // works fine — x was copied, not moved
println!("{}", y);  // works fine
```

Types whose data lives entirely on the stack (integers, floats, booleans, chars) are **copied** when assigned. Copying is cheap — you just duplicate the stack bytes. Types whose data lives on the heap (like `String`) are **moved** — the stack structure is copied but ownership of the heap data transfers. Only one owner at a time.

**The technical term:** Types that copy automatically implement the `Copy` trait. Types that move implement the `Drop` trait (they have heap memory that needs to be freed). We will study traits formally in Lab 04.

---

### Concept: Clone — Explicit Deep Copy

**What it is:** `.clone()` explicitly duplicates both the stack structure and the heap data — creating an independent copy that has its own ownership.

**The problem before:**

Sometimes you genuinely need two independent copies of data. Ownership's move semantics prevent accidental duplication, but deliberate duplication should be possible — it just has to be explicit.

**Canonical example:**

```rust
let name1 = String::from("Ada");
let name2 = name1.clone();  // explicitly copy both the stack info AND the heap data

println!("{}", name1);  // works — name1 still owns its own copy
println!("{}", name2);  // works — name2 owns an independent copy
```

**The cost of clone:** Clone allocates new heap memory and copies all the bytes. For a small string, this is negligible. For a vector of a million integers, it is expensive. This is why clone must be explicit — if it happened silently, programs would have hidden performance costs everywhere.

**Watch for:** If you find yourself calling `.clone()` frequently, it is often a sign that you should restructure your code to use references (coming next) instead. Clone is the escape hatch, not the first tool.

---

### Concept: Ownership Through Functions — Move on Call

**What it is:** Passing a heap-allocated value to a function moves ownership into that function. When the function returns, if it does not return the value back, it is dropped.

**Canonical example:**

```rust
fn print_name(name: String) {  // name is moved INTO this function
    println!("Hello, {}!", name);
}  // name goes out of scope here — its heap memory is freed

fn main() {
    let my_name = String::from("Ada");
    print_name(my_name);            // ownership moves to print_name
    println!("{}", my_name);        // COMPILE ERROR: my_name was moved
}
```

**The uncomfortable implication:**

If every function call moved ownership in and you could never use a value again afterward, programming would be nearly impossible. You would have to return ownership back from every function:

```rust
fn print_name(name: String) -> String {  // take name in, give it back
    println!("Hello, {}!", name);
    name  // return it so the caller gets ownership back
}

fn main() {
    let my_name = String::from("Ada");
    let my_name = print_name(my_name);  // get ownership back
    println!("{}", my_name);            // now this works
}
```

This is valid Rust but deeply tedious. It is not the right tool. The right tool is **borrowing**.

---

## Part 3 — Borrowing and References

### Concept: Reference — Borrow Without Taking Ownership

**What it is:** A reference is a value that points to data owned by someone else. Using a reference is called **borrowing** — you look at the data, use it, and give it back without ever taking ownership.

**What it hides:** A reference hides the memory address. Instead of working with a raw pointer (a number representing a memory address — which is how C does it), you work with a reference that the compiler tracks and validates. The compiler guarantees the reference always points to valid data.

The invariant references protect: **a reference can never outlive the data it refers to.** You cannot have a reference to data that has been dropped. The compiler verifies this at compile time through a system called the **borrow checker**. A reference to freed memory — called a **dangling reference** — is impossible in safe Rust.

**The syntax:**

```rust
let name = String::from("Ada");  // name owns the String
let r = &name;                   // r is a reference to name — borrows it
                                 // & means "a reference to"
println!("{}", r);               // we can read through the reference
println!("{}", name);            // name still owns the data — this still works
```

The `&` creates a reference. It does not transfer ownership. When `r` goes out of scope, nothing is dropped — `r` never owned anything.

**Canonical example (General Explanation):**

A library book. You do not own the book — the library does. You borrow it, read it, and return it. While you have it borrowed, you can read it but you cannot throw it away (you do not own it). After you return it, the library still has the book.

```rust
fn print_name(name: &String) {  // takes a reference — borrows, does not own
    println!("Hello, {}!", name);
}  // reference goes out of scope — nothing is dropped, name is still valid

fn main() {
    let my_name = String::from("Ada");
    print_name(&my_name);          // lend a reference — my_name keeps ownership
    println!("{}", my_name);       // still works — we never moved it
}
```

**Project Application:**

This is exactly how our refactored guessing game will work. `main()` owns `secret_number`. When we pass it to a `check_guess()` function, we pass `&secret_number` — a reference. `check_guess()` reads the value through the reference and returns a result. `main()` still owns `secret_number` after the call.

---

### Concept: Mutable Reference — Borrow With Permission to Change

**What it is:** A mutable reference (`&mut`) allows the borrower to modify the data it refers to.

**The rules:**

Rust enforces two rules about references that work together to prevent all data races:

```
Rule 1: You can have any number of immutable references (&T) at the same time.
        (Many readers — fine. No one is changing anything, so nothing conflicts.)

Rule 2: You can have exactly ONE mutable reference (&mut T) at a time,
        and NO immutable references at the same time.
        (One writer — and no readers while writing — prevents conflicting views.)
```

**What a data race is:** A data race happens when two parts of a program access the same memory simultaneously, at least one is writing, and there is no coordination between them. The result is unpredictable — you might read half-updated data, or two writes might interleave and corrupt each other. Data races are one of the hardest categories of bugs to find because they are not deterministic — they only appear under specific timing conditions.

Rust's reference rules make data races **impossible to compile**. Not just unlikely — impossible.

**Canonical example:**

```rust
let mut name = String::from("Ada");

let r1 = &name;        // immutable reference — ok
let r2 = &name;        // second immutable reference — ok (multiple readers allowed)
println!("{} {}", r1, r2);  // both used here — fine

// r1 and r2 are no longer used after this point — they go out of scope here

let r3 = &mut name;    // mutable reference — ok now (r1 and r2 are gone)
r3.push_str(" Lovelace");  // push_str appends to a String
println!("{}", r3);    // prints: Ada Lovelace
```

**Watch for:** The error message "cannot borrow as mutable because it is also borrowed as immutable" means you have an active immutable reference and are trying to create a mutable reference at the same time. Fix: make sure all immutable references are no longer in use before creating the mutable one.

---

### Concept: The Borrow Checker

**What it is:** The borrow checker is the part of the Rust compiler that enforces ownership and borrowing rules. It tracks every reference in your program and verifies that no reference outlives its owner and that mutable and immutable references never coexist.

**The mental model — lifetimes:**

Every reference has a **lifetime** — the span of code during which it is valid. The borrow checker traces these lifetimes and verifies:

1. The reference's lifetime is always shorter than (or equal to) the owner's lifetime
2. Mutable references have exclusive access — no other references to the same data exist simultaneously

You do not usually write lifetimes explicitly (the compiler infers them). But when you read error messages about "lifetime" issues, this is what they are about.

**The borrow checker error you will see most often:**

```
error[E0382]: borrow of moved value
  --> src/main.rs:5:20
   |
3  |     let name2 = name1;
   |                 ----- value moved here
4  |
5  |     println!("{}", name1);
   |                    ^^^^^ value borrowed here after move
```

**How to read this:** The compiler tells you exactly which line moved the value and which line tries to use it after the move. This error is a gift — in C, this would be a silent bug or a crash at runtime.

**The feeling of fighting the borrow checker:**

Every Rust programmer, beginner and expert alike, has been in a situation where the code seems logically correct but the borrow checker refuses it. This experience has a name: "fighting the borrow checker." When it happens, the answer is almost never to trick the compiler — it is to restructure the code. The borrow checker is usually revealing a genuine design problem: data that needs a clearer owner, a function that is doing too much, a lifetime that is longer than necessary.

---

## Part 4 — Shadowing

### Concept: Shadowing — Reusing a Variable Name

**What it is:** Shadowing is declaring a new variable with the same name as an existing variable. The new variable "shadows" (hides) the old one within the same scope.

**You already saw this in Lab 01:**

```rust
let mut name = String::new();
io::stdin().read_line(&mut name).expect("Failed");
let name = name.trim();   // ← this is shadowing — a NEW variable called name
                          //   the old mutable name is shadowed by this new immutable one
```

**Why shadowing instead of just changing the variable:**

```rust
// Option A — shadowing:
let name = name.trim();       // new variable, same name, different type (&str vs String)

// Option B — reassignment (only works if types match and variable is mut):
name = name.trim().to_string(); // would need mut, and requires type conversion
```

Shadowing lets you transform a value through several steps without needing different names (`name_raw`, `name_trimmed`, `name_final` — all for the same logical thing). It also lets the new variable have a completely different type than the old one.

**Canonical example (General Explanation):**

```rust
let spaces = "   ";          // spaces is a &str (a string reference)
let spaces = spaces.len();   // spaces is now a usize (a number)
println!("{}", spaces);      // prints: 3

// Without shadowing, you would need:
let spaces_str = "   ";
let spaces_count = spaces_str.len();
```

**Shadowing vs `mut`:**

| | Shadowing | `mut` |
|---|---|---|
| Creates a new variable | Yes | No — same variable |
| Can change type | Yes | No — type is fixed |
| Original is gone | After shadowing, yes | No — same storage |
| Requires `mut` keyword | No | Yes |

**Watch for:** Shadowing inside an inner scope does not affect the outer scope:

```rust
let name = "outer";
{
    let name = "inner";         // shadows in this inner scope only
    println!("{}", name);       // prints: inner
}
println!("{}", name);           // prints: outer — shadowing ended with the inner scope
```

---

## Part 5 — Refactoring the Guessing Game

Now you will reorganize the guessing game from Lab 02 into functions. This is not about making the game do more — it is about making the code's structure match the game's logical structure. This is a fundamental software engineering skill called **separation of concerns**: each function does exactly one job.

### Concept: Separation of Concerns

**What it is:** Separation of concerns is the principle that each function, module, or component in a program should be responsible for exactly one logical task.

**The problem before:**

When everything is in `main()`, a bug anywhere could affect everything. You cannot test `get_guess()` without running the whole game. You cannot read `check_guess()` in isolation — you have to read all of `main()` to understand it. As programs grow, monolithic functions become increasingly hard to understand, change, and debug.

**What it hides:** Properly separated concerns hide implementation details from each other. `main()` does not know how `get_guess()` reads input. `check_guess()` does not know how the secret number was generated. Each function is a black box: you know what goes in and what comes out, not how it works inside.

The invariant separation of concerns protects: **a change inside one function cannot break another function, as long as the function's inputs and outputs remain the same.** You can completely rewrite how `get_guess()` works — switching from keyboard input to a file, for example — and `main()` never changes.

**The three functions we will write:**

```
generate_secret()  → produces a random i32 between 1 and 100
get_guess()        → reads a guess from the player, returns an i32
check_guess()      → compares guess to secret, prints result, returns bool (was it correct?)
main()             → owns everything, calls the three functions in a loop
```

---

### Concept: Function Signatures — Inputs and Outputs

**What it is:** A function signature is the declaration of a function's name, its parameters (inputs), and its return type (output). It is the contract: "give me these things, I will give you back this."

**The full syntax:**

```rust
fn function_name(parameter_name: ParameterType) -> ReturnType {
    // body
    return_value  // the last expression without a semicolon is returned
                  // OR use `return value;` to return early
}
```

**Key rules:**

- Every parameter must have a name and a type — Rust never infers parameter types
- The return type comes after `->` — omit it entirely if the function returns nothing
- The last expression in a function body, **without a semicolon**, is returned automatically
- `return value;` exits the function immediately from anywhere in the body

**Canonical example (General Explanation):**

```rust
fn add(left: i32, right: i32) -> i32 {  // takes two i32s, returns one i32
    left + right                         // no semicolon — this is the return value
}

fn greet(name: &str) {                   // takes a reference to a string, returns nothing
    println!("Hello, {}!", name);
}

let result = add(3, 4);   // result is 7
greet("Ada");             // prints: Hello, Ada!
```

**Project Application:**

`check_guess(guess: i32, secret: &i32) -> bool`

This signature says: give me an `i32` (the guess — we can own it, it's just copied from the stack) and a reference to an `i32` (the secret — we borrow it, not take ownership). I will return a `bool`: `true` if the guess was correct, `false` otherwise.

---

### Step 1 — Create a New Project and Write `generate_secret`

Create a new project:

```
cargo new guessing_game_v2
cd guessing_game_v2
```

Add `rand` to `Cargo.toml`:

```toml
[dependencies]
rand = "0.8"
```

Open `src/main.rs`. Replace everything with:

```rust
use rand::Rng;            // ← for random number generation

fn generate_secret() -> i32 {           // ← no parameters, returns an i32
    rand::thread_rng().gen_range(1..=100) // ← no semicolon — this expression is the return value
}                                        //   the function produces a random number and gives it back

fn main() {
    let secret = generate_secret();      // ← call the function, own the result

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have 7 guesses. Good luck.");
    println!();
    println!("DEBUG — secret: {}", secret); // ← temporary: verify the function works
}
```

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

DEBUG — secret: 47
```

Run it three times. The number changes each time.

**Change something:** Add a `return` keyword explicitly:

```rust
fn generate_secret() -> i32 {
    return rand::thread_rng().gen_range(1..=100);  // explicit return — also valid
}
```

Both forms compile. The implicit form (no semicolon on last expression) is idiomatic Rust — you will see it everywhere. Change it back to the implicit form.

---

### Step 2 — Write `get_guess`

Add `get_guess()` below `generate_secret()`:

```rust
use rand::Rng;
use std::io;              // ← add this: for stdin and stdout

fn generate_secret() -> i32 {
    rand::thread_rng().gen_range(1..=100)
}

fn get_guess(guess_number: u32) -> i32 {         // ← takes which guess this is (for the prompt)
                                                  //   returns the player's guess as an i32
    print!("Guess {}: ", guess_number);           // ← show the guess number in the prompt
    io::stdout().flush()
        .expect("Could not flush stdout");        // ← force prompt to appear before waiting

    let mut input = String::new();                // ← empty String — lives on heap
                                                  //   mut because read_line writes into it

    io::stdin()
        .read_line(&mut input)                    // ← borrows input mutably — read_line needs
        .expect("Failed to read line");           //   to write into it, so &mut is required

    let input = input.trim();                     // ← shadow input: remove trailing newline
                                                  //   this is the shadowing pattern from Part 4

    input.parse().expect("Please type a number")  // ← convert text to i32 — return value
                                                  //   no semicolon: this expression is returned
}

fn main() {
    let secret = generate_secret();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have 7 guesses. Good luck.");
    println!();

    let guess = get_guess(1);                     // ← call get_guess for the first guess
    println!("You entered: {}", guess);           // ← verify it was read correctly
    println!("DEBUG — secret: {}", secret);
}
```

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1:
```

Type a number. You should see:

```
Guess 1: 42
You entered: 42
DEBUG — secret: 73
```

**Change something:** Try passing `2` to `get_guess(2)`. The prompt shows "Guess 2:". Change it back to `get_guess(1)`. This shows how the parameter controls the display.

---

### Step 3 — Write `check_guess`

Add `check_guess()` below `get_guess()`:

```rust
use std::cmp::Ordering;  // ← add this: for Ordering::Less/Equal/Greater

fn check_guess(guess: i32, secret: &i32) -> bool {
//             ↑               ↑             ↑
//             owned copy      borrowed ref  returns true if correct, false otherwise
//             (i32 is Copy — no move happens)

    match guess.cmp(secret) {                // ← .cmp() takes &i32 — secret already is &i32
        Ordering::Less => {
            println!("Too low.\n");
            false                            // ← guess was wrong — return false
        }
        Ordering::Greater => {
            println!("Too high.\n");
            false                            // ← guess was wrong — return false
        }
        Ordering::Equal => {
            println!("Correct!\n");
            true                             // ← guess was right — return true
        }
    }
}
```

Now update `main()` to call it:

```rust
fn main() {
    let secret = generate_secret();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have 7 guesses. Good luck.");
    println!();

    let guess = get_guess(1);
    let was_correct = check_guess(guess, &secret); // ← pass guess (owned copy) and &secret (reference)
    //                                  ↑
    //                                  & here creates a reference to secret
    //                                  main() keeps owning secret — we just lend it

    if was_correct {
        println!("You got it!");
    } else {
        println!("DEBUG — secret was: {}", secret); // ← secret still accessible — we only lent it
    }
}
```

---

### SAVE AND TRY

```
cargo run
```

Type a number. Verify:
- "Too low.", "Too high.", or "Correct!" appears
- After guessing correctly, `was_correct` is `true` and "You got it!" prints
- After guessing incorrectly, the DEBUG line shows the secret — confirming `secret` is still usable in `main()` after being borrowed by `check_guess()`

**The key thing to observe:** After calling `check_guess(guess, &secret)`, you can still use `secret` in `main()`. This is borrowing — `check_guess` read the secret through a reference and gave it back. If you had passed `secret` without `&`, ownership would have moved into `check_guess` and `secret` would be inaccessible in `main()` afterward.

**Change something:** Remove the `&` from `check_guess(guess, &secret)` — change it to `check_guess(guess, secret)`. You will need to update the function signature to `fn check_guess(guess: i32, secret: i32)` to match. It compiles. But now try to use `secret` after the call. You cannot — it was moved. Change it back to the reference version.

---

### Step 4 — Wire the Complete Game Loop

Replace `main()` with the full game loop:

```rust
const MAX_GUESSES: u32 = 7;     // ← named constant: max guesses — never changes

fn main() {
    let secret = generate_secret();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", MAX_GUESSES);
    println!();

    let mut guesses_taken: u32 = 0;   // ← count of guesses used so far

    loop {
        if guesses_taken >= MAX_GUESSES {       // ← all guesses exhausted
            println!("Out of guesses! The number was {}.", secret);
            break;
        }

        guesses_taken += 1;                     // ← increment before displaying

        let guess = get_guess(guesses_taken);   // ← get this guess from the player

        let correct = check_guess(guess, &secret); // ← borrow secret — check it

        if correct {
            println!(
                "You got it in {} {}!",
                guesses_taken,
                if guesses_taken == 1 { "guess" } else { "guesses" }
            );
            break;                              // ← game won — exit loop
        }
    }

    println!("Thanks for playing!");
}
```

The complete `src/main.rs` with all functions together:

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;

const MAX_GUESSES: u32 = 7;

fn generate_secret() -> i32 {
    rand::thread_rng().gen_range(1..=100)
}

fn get_guess(guess_number: u32) -> i32 {
    print!("Guess {}: ", guess_number);
    io::stdout().flush()
        .expect("Could not flush stdout");

    let mut input = String::new();

    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read line");

    let input = input.trim();           // ← shadow: remove newline

    input.parse().expect("Please type a number")
}

fn check_guess(guess: i32, secret: &i32) -> bool {
    match guess.cmp(secret) {
        Ordering::Less => {
            println!("Too low.\n");
            false
        }
        Ordering::Greater => {
            println!("Too high.\n");
            false
        }
        Ordering::Equal => {
            println!("Correct!\n");
            true
        }
    }
}

fn main() {
    let secret = generate_secret();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", MAX_GUESSES);
    println!();

    let mut guesses_taken: u32 = 0;

    loop {
        if guesses_taken >= MAX_GUESSES {
            println!("Out of guesses! The number was {}.", secret);
            break;
        }

        guesses_taken += 1;

        let guess = get_guess(guesses_taken);
        let correct = check_guess(guess, &secret);

        if correct {
            println!(
                "You got it in {} {}!",
                guesses_taken,
                if guesses_taken == 1 { "guess" } else { "guesses" }
            );
            break;
        }
    }

    println!("Thanks for playing!");
}
```

---

### SAVE AND TRY

```
cargo run
```

Play the complete game. Verify every feature from Lab 02 still works:
- Random number each game
- Numbered guesses
- "Too low." / "Too high." / "Correct!"
- Running out of guesses reveals the secret
- "Thanks for playing!" always appears

**In the terminal, observe the structure:**

```
cargo build 2>&1 | head -5
```

This builds without running and shows the first 5 lines of output. You should see the compiler confirming everything compiles cleanly — no warnings, no errors.

**Change something:** Change `fn check_guess` to print `"Way too low!\n"` when the guess is less than `secret - 20` (more than 20 below), and `"Too low.\n"` otherwise. You will need a nested `if` inside the `Ordering::Less` arm. Try it, then change it back.

---

## 🎯 Challenge: Add a `format_result` Function

**You know:** Functions, references, borrowing, `match`, `Ordering`, string formatting.

**Task:** Extract the win/loss message formatting into its own function called `format_result`. Instead of printing inside `check_guess` and `main`, `check_guess` should return an `Ordering` (not a `bool`), and a separate `format_result` function should take the `Ordering`, the `guess`, and the `guesses_taken`, and return a formatted `String` (the message to print). `main` prints the returned string.

**The new signatures you are working toward:**

```rust
fn check_guess(guess: i32, secret: &i32) -> Ordering
// returns the Ordering directly instead of printing and returning bool

fn format_result(result: Ordering, guess: i32, guesses_taken: u32) -> String
// takes the comparison result and produces the message string
// returns a String that main() will print
```

**Hints:**
1. `String::from("Too low.")` creates an owned `String` from a string literal
2. The `Ordering` type can be returned from a `match` arm just like any other value
3. `main()` will need to `match` on the returned `Ordering` to decide whether to `break`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;

const MAX_GUESSES: u32 = 7;

fn generate_secret() -> i32 {
    rand::thread_rng().gen_range(1..=100)
}

fn get_guess(guess_number: u32) -> i32 {
    print!("Guess {}: ", guess_number);
    io::stdout().flush().expect("Could not flush stdout");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read");
    let input = input.trim();
    input.parse().expect("Please type a number")
}

fn check_guess(guess: i32, secret: &i32) -> Ordering {
    guess.cmp(secret)        // return the Ordering directly — no printing, no bool
}                            // check_guess now does one thing only: compare

fn format_result(result: Ordering, guesses_taken: u32) -> String {
    match result {
        Ordering::Less    => String::from("Too low.\n"),
        Ordering::Greater => String::from("Too high.\n"),
        Ordering::Equal   => format!(             // format! works like println! but returns a String
            "Correct! You got it in {} {}!\n",    // instead of printing it
            guesses_taken,
            if guesses_taken == 1 { "guess" } else { "guesses" }
        ),
    }
}

fn main() {
    let secret = generate_secret();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", MAX_GUESSES);
    println!();

    let mut guesses_taken: u32 = 0;

    loop {
        if guesses_taken >= MAX_GUESSES {
            println!("Out of guesses! The number was {}.", secret);
            break;
        }

        guesses_taken += 1;

        let guess = get_guess(guesses_taken);
        let result = check_guess(guess, &secret);         // get the Ordering
        let message = format_result(result, guesses_taken); // get the message
        print!("{}", message);                            // print it

        if result == Ordering::Equal {                    // ← wait — does this compile?
            break;
        }
    }

    println!("Thanks for playing!");
}
```

**Wait — there is a problem with the above.** After `format_result(result, guesses_taken)`, the variable `result` is used again in `if result == Ordering::Equal`. But `Ordering` is a simple enum — it is `Copy`, so it is copied into `format_result`, not moved. The code compiles fine.

If `Ordering` were not `Copy` (if it were a complex type), you would need to either clone it or restructure the code to not use it after passing it to `format_result`. The compiler would tell you exactly this with a "value moved here" error.

**Key insight:** Separation of concerns is not just about organization — it clarifies *what each function needs to know*. `check_guess` no longer needs to know about `guesses_taken` or how to format messages. `format_result` no longer needs to know about `secret`. Each function's dependencies are visible in its signature. This is the first step toward code you can test, reuse, and modify independently.

</details>

---

## 🎯 Challenge 2: What Does the Borrow Checker Catch?

**You know:** Ownership, move semantics, borrowing rules.

**Task:** This is a reading challenge, not a coding challenge. Read each snippet and predict whether it compiles. Then type it into a `fn main()` in a scratch file and run `cargo build` to check your prediction. For each one that does not compile, explain *why* in one sentence.

```rust
// Snippet A
let s1 = String::from("hello");
let s2 = s1;
println!("{}", s1);
```

```rust
// Snippet B
let s1 = String::from("hello");
let s2 = &s1;
println!("{} {}", s1, s2);
```

```rust
// Snippet C
let mut s = String::from("hello");
let r1 = &s;
let r2 = &mut s;
println!("{} {}", r1, r2);
```

```rust
// Snippet D
let x = 5;
let y = x;
println!("{} {}", x, y);
```

```rust
// Snippet E
fn take(s: String) {}
let s = String::from("hello");
take(s);
println!("{}", s);
```

**Answers:**

- A: Does **not** compile. `s1` was moved into `s2`. Using `s1` after the move is forbidden — "value borrowed after move."
- B: **Compiles.** `s2` borrows `s1` with `&` — immutable reference. Both `s1` and `s2` can be read simultaneously.
- C: Does **not** compile. `r1` is an active immutable reference to `s`. Creating `r2` as a mutable reference while `r1` is still in scope violates the "no mutable reference while immutable references exist" rule.
- D: **Compiles.** `x` is an `i32` — a `Copy` type. `y = x` copies the value. Both variables are valid.
- E: Does **not** compile. `take(s)` moves `s` into the function. After the call, `s` is gone — "value borrowed after move."

---

## Final Check

| Feature | How to verify |
|---|---|
| `generate_secret()` works | Run game three times — different number each time |
| `get_guess()` reads input | Prompt shows "Guess 1:", input appears on same line |
| `check_guess()` borrows correctly | Use `secret` in `main()` after calling `check_guess()` — still accessible |
| "Too low." / "Too high." / "Correct!" | Test all three outcomes (use DEBUG line to find secret) |
| Game loop counts guesses | Prompts increment: "Guess 1:", "Guess 2:", etc. |
| Out of guesses reveals secret | Exhaust all 7 guesses — secret number printed |
| "Thanks for playing!" always appears | Both win and lose paths show this |
| Compiler accepts all borrowing | `cargo build` produces zero errors and zero warnings |

---

## Quick Check Answers

**1. When a function finishes running, what happens to the variables it created?**

Their stack frame is popped. For variables whose data lives on the stack (integers, floats, booleans), they simply cease to exist — the stack pointer moves back. For variables that own heap data (like `String`), Rust automatically calls `drop()` on them before the frame is popped — this frees the heap memory. The compiler inserts these `drop()` calls; you never write them manually. This is ownership rule 3: when the owner goes out of scope, the value is dropped. The entire mechanism is why Rust does not need a garbage collector — cleanup happens at deterministic, predictable moments, not "sometime later when the GC runs."

**2. In Lab 02, you passed `&secret_number` to `.cmp()`. What does the `&` mean?**

`&` creates a reference — it lends access to the value without transferring ownership. `.cmp()` needs to read `secret_number` to compare it against the guess. It does not need to own `secret_number` — ownership would mean `secret_number` is destroyed when `.cmp()` returns. The reference lets `.cmp()` read the value and then "give it back," leaving `secret_number` still owned by whoever declared it. References are how Rust lets functions use data without consuming it.

**3. Languages like Python and JavaScript manage memory automatically. What does that cost?**

A garbage collector (GC) periodically scans all allocated memory, identifies what is no longer reachable, and frees it. The costs: (1) **pause times** — the GC must sometimes stop your program to do its scan, causing unpredictable latency spikes. For a game, this is a frame stutter. For a web server handling real-time requests, this is a slow response. (2) **memory overhead** — the GC needs to keep objects alive until it scans them, so peak memory usage is higher than necessary. (3) **throughput overhead** — the GC itself consumes CPU cycles. For most software, these costs are acceptable. For systems software (operating systems, game engines, web servers at scale, embedded systems), they are not — which is exactly why Rust exists.
