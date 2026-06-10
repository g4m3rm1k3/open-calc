# Rust Web Server — LAB 02 — Types, Decisions, and Loops

**Prerequisites:** LAB 01 — How Computers Work and Your First Rust Program. You have Rust installed, you can run `cargo new` and `cargo run`, and you understand what a compiler does.

**What this lab adds:**
- A mental model of what a data type is and why computers need them
- Rust's core types: integers, floats, booleans, and characters — what they are and how they work in memory
- Making decisions in code with `if`, `else if`, and `else`
- Repeating work with `loop` and `while`
- Generating a random number (your first external library)
- A complete, playable number guessing game built one visible step at a time

**Time:** 3–5 hours if you read carefully and type everything yourself

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why do you think a computer needs to know what *type* of data something is before it can work with it? What would go wrong if it did not?
> 2. In Lab 01, the compiler refused to run code that had errors. What do you think the benefit of that is, versus a language that just tries to run your code and crashes when something goes wrong?
> 3. What do you think "generating a random number" means at the hardware level — is there something truly random happening inside the computer?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, your terminal will look like this:

```
$ cargo run
   Compiling guessing_game v0.1.0
    Finished dev profile
     Running `target/debug/guessing_game`

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1: 50
Too high.

Guess 2: 25
Too low.

Guess 3: 37
Too high.

Guess 4: 31
Correct! You got it in 4 guesses.
```

A complete, playable game. Every concept we need to build it will be taught before we use it.

---

## Part 1 — What is a Data Type?

### Concept: Data Type

**What it is:** A data type tells the compiler two things about a piece of data: what values it can hold, and how many bytes of memory it occupies.

**The problem before:**

Imagine memory as a long row of light switches — billions of them, each either on (1) or off (0). That is literally what RAM is. When the CPU stores a value in memory, it stores a pattern of ones and zeros. The number `65` and the letter `A` are stored as exactly the same pattern of bits — `01000001`. Without knowing the type, you cannot tell them apart.

```
Memory address 0x1000:  01000001

Is this the number 65?
Is this the letter 'A'?
Is this part of a larger number?
Is this a true/false value?

Without a type — impossible to know.
```

**The solution:**

A data type is the label on that memory. It tells the compiler: "this group of bytes is an integer" or "this group of bytes is a character." With that label, every operation on the data makes sense. The compiler knows how to add two integers. It knows how to compare two booleans. It knows that trying to add an integer and a letter is nonsensical — and it refuses to compile code that tries.

**What it hides:** A type hides the raw bit pattern. You write `let age = 25` and think about the number twenty-five. The compiler thinks about `00000000 00000000 00000000 00011001` — 32 bits arranged to represent 25 in binary. You never have to.

The invariant types protect: **every operation on a value is valid for that value's type.** You cannot accidentally divide a piece of text. You cannot accidentally add a boolean to a number. The compiler checks this before your program runs — not after.

**Canonical example (General Explanation):**

A spreadsheet column. If you mark a column as "Date," the spreadsheet knows how to sort it chronologically, how to calculate days between entries, and that typing "banana" in that column is an error. The column type is the contract: everything in here follows these rules.

**Why it matters here:** Rust is a **statically typed** language — every variable's type is known at compile time. This is different from Python or JavaScript, where types are checked while the program runs. Static typing means an entire category of bugs is caught before your program ever executes. For the web server you are building toward, this matters enormously: a type error that would crash a Python server at 3am is a compile error in Rust that never makes it to production.

**Watch for:** The phrase "type error" in a compiler message always means one specific thing: you used a value somewhere that expects a different type. The compiler will tell you what it expected and what it got. Read those messages carefully.

---

### Concept: Binary — How Computers Actually Store Numbers

**What it is:** Binary is the number system computers use — base 2, where every digit is either 0 or 1.

**Why computers use binary:**

A transistor — the fundamental physical unit inside a CPU — is a switch. It is either on or off. There is no "kind of on." This physical reality means computers naturally work in two states: 0 and 1. Everything a computer does, at the lowest level, is manipulation of these two states.

**How binary represents numbers:**

In the decimal system (base 10) you learned in school, each position is worth ten times the previous one:

```
   4    2    7
   ↑    ↑    ↑
 100s  10s   1s

427 = (4 × 100) + (2 × 10) + (7 × 1)
```

Binary works the same way, but each position is worth two times the previous one:

```
   1    0    1    1
   ↑    ↑    ↑    ↑
   8s   4s   2s   1s

1011 in binary = (1×8) + (0×4) + (1×2) + (1×1) = 11 in decimal
```

**The bit and the byte:**

- One binary digit (0 or 1) is called a **bit** — short for "binary digit"
- Eight bits grouped together is called a **byte**
- One byte can represent 256 different values (2⁸ = 256): the numbers 0 through 255

**Why this matters for types:** When Rust says `i32`, the `32` means 32 bits — 4 bytes of memory. A 32-bit integer can represent about 4 billion different values. When Rust says `i8`, it means 8 bits — 1 byte, 256 possible values. The type tells the compiler exactly how much memory to reserve and what range of values is valid.

**Math: Powers of 2 — The Vocabulary of Memory**

**What it computes:** 2ⁿ tells you how many different values can be represented with n bits.

**The real-world analogy:** A combination lock with n dials, each showing 0 or 1. One dial: 2 combinations (0 or 1). Two dials: 4 combinations (00, 01, 10, 11). Each new dial doubles the possibilities.

```
1 bit:   2¹  =          2 values  (0 or 1)
8 bits:  2⁸  =        256 values  (0 to 255)
16 bits: 2¹⁶ =     65,536 values  (0 to 65,535)
32 bits: 2³² = 4,294,967,296 values
64 bits: 2⁶⁴ = 18,446,744,073,709,551,616 values
```

**Why it matters here:** Every type in Rust has a fixed bit width. That width directly determines what values fit. Trying to store the number 300 in an `i8` (max value: 127) is like trying to fit three digits into a two-digit display. Rust catches this at compile time.

**Watch for:** The difference between signed and unsigned integers. Signed integers use one bit to store the sign (positive or negative), so they cover roughly half the positive range of an unsigned integer of the same size. `i8` goes from -128 to 127. `u8` goes from 0 to 255.

---

## Part 2 — Rust's Core Types

### Concept: Integer Types

**What it is:** An integer is a whole number — no decimal point. In Rust, integers come in different sizes and in signed (can be negative) or unsigned (always positive) flavors.

**Rust's integer types:**

| Type | Size | Range | Use when |
|---|---|---|---|
| `i8` | 8 bits | -128 to 127 | You need tiny numbers and space matters |
| `i32` | 32 bits | -2.1 billion to 2.1 billion | General purpose — the default |
| `i64` | 64 bits | -9.2 quintillion to 9.2 quintillion | Large numbers (file sizes, timestamps) |
| `u8` | 8 bits | 0 to 255 | Bytes of raw data, pixel values |
| `u32` | 32 bits | 0 to 4.3 billion | Counts that cannot be negative |
| `usize` | 32 or 64 bits | Depends on your CPU | Array indices, memory sizes |

**The naming convention:** `i` means signed integer (can be negative). `u` means unsigned integer (always zero or positive). The number is the bit width.

**Canonical example (General Explanation):**

```rust
let score: i32 = 1500;       // a signed 32-bit integer — can be negative
let byte_value: u8 = 200;    // an unsigned 8-bit integer — 0 to 255 only
let index: usize = 0;        // used for array positions — size matches the CPU
```

**Project Application:**

In our guessing game, we will use `i32` for the secret number and the player's guess. We could use `u32` (the number is always positive) but `i32` is Rust's default integer type and the one you will use most often. We will use `u32` for the guess counter — a count of attempts can never be negative.

**Watch for:** If you do arithmetic with two different integer types (like adding an `i32` and a `u32`), Rust will refuse to compile. Types must match. The fix is to convert one to the other — we will see how shortly.

---

### Concept: Integer Overflow — When Numbers Get Too Big

**What it is:** Integer overflow happens when a calculation produces a value larger than the type can hold.

**The real-world analogy:** An odometer that only has 5 digits. When it reaches 99,999 and you drive one more mile, it wraps around to 00,000. The number did not actually become zero — the display just ran out of space.

**Why this matters:**

In many languages (including C), integer overflow silently wraps around. You store 128 in an `i8` (max: 127) and you get -128 back. No warning. No crash. Your program just has wrong data, and you may not find out for a long time.

Rust handles this differently:
- In **debug mode** (what you use while developing): overflow causes an immediate panic (controlled crash) with a clear error message
- In **release mode** (what you ship): overflow wraps around, like C — but you opted into this

For now, you are always in debug mode. Rust will catch overflow immediately during development.

**Watch for:** This becomes important in our web server. Networking involves counting bytes, packet sizes, and memory offsets. Overflow in those calculations causes security vulnerabilities in C programs. Rust's debug-mode detection means you find the bug in development, not in production.

---

### Concept: Floating-Point Types — Numbers with Decimal Points

**What it is:** A floating-point number is a number that can have a fractional part — digits after the decimal point.

**Why "floating point":**

The decimal point can "float" to different positions. The number 3.14, 314.0, and 0.00314 all use the same underlying representation, just with the decimal point in different places. The technical standard for this (used by virtually every programming language and CPU) is called **IEEE 754**.

**Rust's float types:**

| Type | Size | Precision | Use when |
|---|---|---|---|
| `f32` | 32 bits | ~7 significant digits | When memory matters and precision does not |
| `f64` | 64 bits | ~15 significant digits | General purpose — the default |

**Canonical example:**

```rust
let pi: f64 = 3.14159265358979;   // 64-bit float — high precision
let ratio: f32 = 0.75;            // 32-bit float — lower precision, smaller
```

**An important caveat about floating-point math:**

Floating-point numbers cannot represent every decimal exactly. This is a fundamental limitation of storing infinite decimal numbers in finite bits.

```rust
let result = 0.1 + 0.2;
// You might expect: 0.3
// You actually get: 0.30000000000000004
```

This is not a Rust bug. It is how floating-point works in every language on every computer. For our guessing game, we use integers — no decimal point needed. We will encounter floats properly when we write our web server's timing code.

**Watch for:** Never compare floats with `==`. Instead, check if they are close enough: `(a - b).abs() < 0.0001`. We will cover this when it becomes relevant.

---

### Concept: Boolean — True or False

**What it is:** A boolean is a value that is exactly one of two things: `true` or `false`.

**Named after:** George Boole, a 19th-century mathematician who developed the algebra of logic — the mathematical framework that underlies all of computing. Every decision a computer makes, at the most fundamental level, is boolean: is this true or false? Is this bit 0 or 1?

**In memory:** A boolean is typically stored as one byte (even though it only needs one bit). The value `0` means `false`. Any non-zero value means `true`, though Rust always uses exactly `1` for `true`.

**Canonical example:**

```rust
let is_running: bool = true;
let has_won: bool = false;
let game_over: bool = is_running == false;  // false — game is still running
```

**Project Application:**

We will use a boolean to track whether the game is still running — `let mut game_over = false`. When the player guesses correctly, we set it to `true` and the game stops.

**Why it matters here:** Booleans are the output of every comparison (`5 > 3` produces `true`). Every `if` statement you write — we are getting to those — evaluates a boolean to decide which branch to take. Booleans are the glue between data and decisions.

---

### Concept: Character Type — A Single Symbol

**What it is:** A `char` in Rust is a single Unicode character — one letter, digit, symbol, or emoji.

**What Unicode is:** Unicode is the universal standard for encoding text. It assigns a unique number (called a code point) to every character in every writing system on Earth — plus emoji, mathematical symbols, ancient scripts, and more. There are over 140,000 characters in Unicode.

**In memory:** A Rust `char` always takes exactly 4 bytes (32 bits), because it needs to be able to hold any Unicode code point.

**Canonical example:**

```rust
let letter: char = 'A';        // single quotes for chars — not double quotes
let digit: char = '5';         // the character 5, not the number 5
let symbol: char = '€';        // the Euro sign
let emoji: char = '🦀';        // the Rust mascot — a crab
```

**The critical distinction:** Single quotes (`'A'`) mean a `char`. Double quotes (`"A"`) mean a `&str` — a string containing one character. They are completely different types. This trips up beginners constantly.

**Watch for:** You will almost never use `char` directly in early labs. Strings (sequences of chars) are what you work with most of the time. But `char` is the atom that strings are made of, and understanding it now will make strings make more sense later.

---

### Concept: Type Inference — Rust Figures Out the Type

**What it is:** Type inference is the compiler's ability to figure out what type a variable should be, based on what value you give it and how you use it.

**What it hides:** Without type inference, you would have to write the type of every single variable explicitly. This is tedious and clutters the code with information that is often obvious.

**Canonical example:**

```rust
let age = 25;            // Rust infers: this is i32 (the default integer type)
let ratio = 0.75;        // Rust infers: this is f64 (the default float type)
let is_done = false;     // Rust infers: this is bool
let initial = 'A';       // Rust infers: this is char
```

You can always write the type explicitly if you want clarity or if Rust cannot figure it out:

```rust
let age: i32 = 25;       // explicit type annotation — both are valid
let count: u32 = 0;      // sometimes you MUST be explicit to choose a non-default type
```

**The colon syntax:** `let name: Type = value` — the colon separates the variable name from its type annotation.

**When Rust cannot infer the type:** Sometimes Rust sees a number and genuinely does not know if you want `i32` or `u32` or `i64`. In those cases it will tell you: `type annotations needed`. The fix is always to add `: TypeName` after the variable name.

**Why it matters here:** In the guessing game, Rust will infer most types automatically. But when we read the player's guess (which comes in as text), we will have to explicitly tell Rust to parse it as a specific integer type — because Rust will not know whether you want the text "42" to become an `i32`, a `u64`, or something else.

---

## Part 3 — Making Decisions

### Concept: `if` — Conditional Execution

**What it is:** An `if` statement tells Rust to execute a block of code only if a condition is true.

**The problem before:**

Without `if`, every program does exactly the same thing every time. You cannot respond differently to different input. You cannot handle errors differently from success. You cannot check whether a guess is too high or too low. A program without decisions is not a program — it is a fixed sequence.

**The fundamental operation:** An `if` statement evaluates a **boolean expression** — a piece of code that produces `true` or `false` — and then decides which block of code to run.

**Canonical example (General Explanation):**

Real-world decision: "If it is raining, take an umbrella."

```
IF [condition] THEN [do this]
```

In Rust:

```rust
let is_raining = true;

if is_raining {                    // evaluate the boolean
    println!("Take an umbrella."); // runs only if is_raining is true
}
```

**The full form with `else`:**

```rust
if is_raining {
    println!("Take an umbrella.");
} else {
    println!("No umbrella needed.");
}
```

**The full form with `else if`:**

```rust
let temperature = 45;  // in Fahrenheit

if temperature < 32 {
    println!("Freezing.");
} else if temperature < 60 {
    println!("Cold.");
} else if temperature < 80 {
    println!("Comfortable.");
} else {
    println!("Hot.");
}
```

Rust evaluates each condition top to bottom and runs the first block whose condition is `true`. Once one matches, the rest are skipped.

**Syntax rules:**
- The condition goes directly after `if` — no parentheses required (unlike many other languages)
- The code block must be surrounded by `{` and `}`
- The condition must evaluate to a `bool` — Rust will not accept integers or strings as conditions

**Watch for:** A very common mistake from other languages — writing `if (condition)` with parentheses. Rust does not require them, but allows them. More importantly, Rust will reject `if 1 { ... }` — the number 1 is not a boolean. You must write `if count == 1 { ... }`.

---

### Concept: Comparison Operators — Producing Booleans

**What they are:** Comparison operators take two values and produce a `bool` — `true` if the comparison holds, `false` if it does not.

**The full set:**

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `==` | equal to | `5 == 5` | `true` |
| `!=` | not equal to | `5 != 3` | `true` |
| `<` | less than | `3 < 5` | `true` |
| `>` | greater than | `5 > 3` | `true` |
| `<=` | less than or equal to | `5 <= 5` | `true` |
| `>=` | greater than or equal to | `3 >= 5` | `false` |

**Critical distinction:** `=` assigns a value. `==` compares two values. These are completely different operations. Writing `if x = 5` when you mean `if x == 5` is a bug in most languages — in Rust, it is a compile error. The compiler will not let you confuse them.

**Canonical example:**

```rust
let guess = 42;
let secret = 37;

if guess > secret {
    println!("Too high.");
} else if guess < secret {
    println!("Too low.");
} else {
    println!("Correct!");
}
```

This is the exact logic we will use in the guessing game.

---

### Concept: `Ordering` — A Three-Way Comparison

**What it is:** When comparing two values, the result can be one of three things: the first is less than the second, they are equal, or the first is greater. Rust has a built-in type called `Ordering` that represents exactly these three possibilities.

**Why it exists:** A boolean `true`/`false` can only express two states. Some comparisons naturally have three outcomes. `Ordering` is the right tool for those.

**The three values:**
- `Ordering::Less` — the left side is smaller
- `Ordering::Equal` — they are the same
- `Ordering::Greater` — the left side is larger

**How to use it:** Call `.cmp()` on a value, passing the other value to compare against:

```rust
use std::cmp::Ordering;  // bring Ordering into scope

let guess = 42;
let secret = 37;

match guess.cmp(&secret) {              // .cmp() returns an Ordering
    Ordering::Less    => println!("Too low."),
    Ordering::Greater => println!("Too high."),
    Ordering::Equal   => println!("Correct!"),
}
```

**You just saw `match`** — a new concept we need to define before going further.

---

### Concept: `match` — Pattern Matching

**What it is:** `match` compares a value against a list of **patterns** and runs the code for the first pattern that matches.

**What it hides:** `match` hides a chain of `if`/`else if` comparisons. It does the same work, but more expressively — and with a guarantee the compiler enforces: **you must handle every possible case.** If `Ordering` has three variants and you only write two arms, the compiler refuses to compile. No case can be accidentally forgotten.

The invariant `match` protects: **exhaustiveness** — every possible value of the matched type is accounted for. This is a profound safety guarantee. In a web server, an unhandled case means a request that crashes the server. `match` makes that impossible to forget.

**Canonical example (General Explanation):**

A traffic light. It can be red, yellow, or green. You match on the current state and act accordingly:

```rust
let light = "red";

match light {
    "red"    => println!("Stop."),
    "yellow" => println!("Caution."),
    "green"  => println!("Go."),
    _        => println!("Unknown light color."),  // _ is the catch-all pattern
}
```

The `_` (underscore) is Rust's catch-all pattern — "match anything else." For types with a finite set of values (like `Ordering`), you do not need `_` because the compiler can verify you covered all cases.

**The syntax:**

```rust
match value_to_examine {
    pattern1 => code_to_run,
    pattern2 => code_to_run,
    pattern3 => {
        // for longer code, use curly braces
        code_line_one;
        code_line_two;
    },
}
```

**Why it matters here:** We use `match` on the `Ordering` result of comparing the guess to the secret number. It is cleaner than three `if`/`else if` blocks, and the compiler guarantees we handle all three outcomes.

---

## Part 4 — Repeating Work

### Concept: Loop — Repetition

**What it is:** A loop is a way to run a block of code more than once — either a fixed number of times, or until a condition changes.

**The problem before:**

Without loops, you would have to write the same code repeatedly — once for each time you want it to run. If a player can make seven guesses, you would write the guessing code seven times. If you later decided to allow ten guesses, you would rewrite it. This is unsustainable. Loops let you write the code once and control how many times it runs with data.

**The deeper idea — iteration:**

Iteration is the act of repeating a process, applying it to each element in a sequence or until a condition is met. It is one of the three fundamental building blocks of all computation, alongside sequence (do this, then this) and selection (if this, do that). Almost everything a computer does involves iteration somewhere.

**Rust has three loop constructs:**

---

### Concept: `loop` — Run Forever Until Told to Stop

**What it is:** `loop` runs its block of code repeatedly, with no built-in stopping condition. You must explicitly `break` out of it.

**Canonical example (General Explanation):**

A security guard checking badges. They check one badge, then the next, then the next — indefinitely, until their shift ends (the `break`).

```rust
loop {
    println!("Checking badge...");
    // some condition
    break;  // ← this exits the loop
}
```

**Project Application:**

Our guessing game uses `loop` because we do not know in advance how many guesses the player will need. We keep asking for guesses until either the player is correct or they run out of guesses — at which point we `break`.

**Watch for:** A `loop` without a `break` runs forever. This is called an **infinite loop**. In a game, this is sometimes intentional (the game loop). In other code, it is usually a bug. If your program seems to freeze, an infinite loop is the first thing to check. Press `Ctrl+C` to stop a frozen program.

---

### Concept: `while` — Loop While a Condition is True

**What it is:** `while` runs its block of code repeatedly, checking a condition before each iteration. When the condition becomes `false`, the loop stops.

**Canonical example (General Explanation):**

A vending machine dispensing items while coins are inserted:

```rust
let mut coins = 5;

while coins > 0 {
    println!("Dispensing item...");
    coins -= 1;  // subtract 1 from coins each time
}
// when coins reaches 0, the condition (coins > 0) is false, loop stops
```

**The difference from `loop`:** `loop` always runs at least once and you stop it with `break`. `while` checks its condition first — if the condition is already false, the body never runs at all.

**Why it matters here:** We will use `loop` for the main game (unknown number of iterations). We will see `while` in the next lab when iterating through collections.

---

### Math: Decrement and Increment — Changing a Value by One

**What it computes:** Adding 1 to a variable (incrementing) or subtracting 1 (decrementing) are the most common arithmetic operations in loops.

**In Rust:**

```rust
let mut count = 0;
count += 1;   // count is now 1 — short for: count = count + 1
count += 1;   // count is now 2
count -= 1;   // count is now 1 — short for: count = count - 1
```

**The `+=` and `-=` operators** are **compound assignment operators** — they perform the operation and assign the result in one step. Rust does not have `++` (increment by one) like some other languages — `count++` is not valid Rust.

**Why it matters here:** We track the number of guesses with a counter variable. Each guess increments the counter by one: `guesses_taken += 1`.

---

## Part 5 — Your First External Library

### Concept: External Library (Crate)

**What it is:** A crate is a Rust package — a collection of code that someone else wrote, which you can add to your project and use.

**The problem before:**

Generating a truly random number requires accessing hardware randomness sources — thermal noise in a chip, mouse movement, network packet timing. Writing that code from scratch is complex, OS-specific, and full of subtle correctness requirements. Nobody should write it from scratch for every project.

**What it hides:** The `rand` crate hides the entire complexity of random number generation — the hardware entropy source, the mathematical algorithm that expands that entropy into a sequence of random-looking numbers, and the OS-specific system calls to access the entropy. You call `rng.gen_range(1..=100)` and get a random number between 1 and 100.

The invariant it protects: **the distribution of random numbers is statistically uniform** — each number in the range is equally likely. You cannot accidentally write a biased random number generator by hand and not notice.

**Where crates live:** The official Rust crate registry is at `crates.io`. At time of writing, it hosts over 140,000 published crates. When you add a crate to `Cargo.toml`, cargo downloads it from `crates.io` automatically.

**The `Cargo.toml` file:**

This is the configuration file cargo reads to know what your project is and what it depends on. Open it now — it looks like this:

```toml
[package]
name = "hello_rust"
version = "0.1.0"
edition = "2021"

[dependencies]
```

The `[dependencies]` section is where you list external crates. Right now it is empty.

**A true random number:**

Actually — no. Computer "random" numbers are almost always **pseudorandom** — generated by a mathematical formula that produces numbers that *appear* random but are actually deterministic given the starting value (called the **seed**). The `rand` crate seeds its generator from true entropy sources (hardware noise), making the output unpredictable in practice. This distinction matters for security (cryptography requires true randomness) but not for games. We will revisit this when we build authentication for our web server.

**Watch for:** Every crate you add is code written by someone else running in your program. The Rust community takes crate quality seriously — the most popular crates (`rand`, `serde`, `tokio`) are reviewed by thousands of eyes. But adding a crate is a trust decision. Always check a crate's download count and documentation before using it in production.

---

## Part 6 — Building the Guessing Game

Now you will build the complete game, one visible step at a time. Create a new project:

```
cargo new guessing_game
cd guessing_game
```

---

### Step 1 — Print the Welcome Message

Open `src/main.rs`. Replace everything with:

```rust
fn main() {
    println!();                                            // ← blank line for breathing room
    println!("I'm thinking of a number between 1 and 100."); // ← the game's introduction
    println!("You have 7 guesses. Good luck.");            // ← set expectations upfront
    println!();                                            // ← blank line after intro
}
```

**What `println!()` with no arguments does:** Prints a blank line — just a newline character. Useful for visual spacing.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

```

**Change something:** Add another `println!("Let's begin!");` after the second line. Confirm it appears. Remove it.

---

### Step 2 — Add the Random Secret Number

Now we need a random number. First, add the `rand` crate to `Cargo.toml`.

Open `Cargo.toml` and add one line under `[dependencies]`:

```toml
[package]
name = "guessing_game"
version = "0.1.0"
edition = "2021"

[dependencies]
rand = "0.8"    # ← add this line: the rand crate, version 0.8
```

**What `"0.8"` means:** This tells cargo to use any version of `rand` that is compatible with `0.8` — specifically, any version from `0.8.0` up to but not including `0.9.0`. This is called **semantic versioning** (semver). The rule: the middle number (8) changes when new features are added, the first number (0) changes when something breaks backward compatibility. We want new features but not breaking changes.

Now add the random number to `src/main.rs`:

```rust
use rand::Rng;   // ← add this: bring the Rng trait into scope (we'll explain traits in Lab 4)
                 //   for now: this line is required to use .gen_range()

fn main() {
    let secret_number: i32 = rand::thread_rng()  // ← get a random number generator
                                                  //   thread_rng() gives one seeded from the OS
        .gen_range(1..=100);                      // ← generate a number in the range 1 to 100 inclusive
                                                  //   1..=100 means "from 1 to 100, including 100"
                                                  //   (without = it would exclude 100)

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have 7 guesses. Good luck.");
    println!();
    println!("DEBUG — secret number: {}", secret_number); // ← add temporarily so we can verify
}
```

**What `1..=100` means — The Range:**

`1..=100` is a **range** — a way to express "all values from 1 to 100." The `..=` means the endpoint (100) is included. Without the `=`, writing `1..100` would mean 1 to 99 (100 excluded). We will use ranges again when we iterate through collections.

---

### SAVE AND TRY

```
cargo run
```

The first time you run after adding a crate, cargo downloads it from `crates.io`. You will see extra output:

```
  Downloading rand v0.8.x
   Compiling rand v0.8.x
   Compiling guessing_game v0.1.0
    Finished dev profile
     Running target/debug/guessing_game

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

DEBUG — secret number: 73
```

(Your number will be different — it is random.)

**Run it three more times.** The secret number should be different each time.

**Change something:** Change `1..=100` to `1..=10`. Run it a few times. The numbers should all be between 1 and 10. Change it back to `1..=100`.

---

### Step 3 — Read One Guess from the Player

Add the input reading machinery to `main.rs`. Add the `use std::io` line at the top, and replace the DEBUG line with the input code:

```rust
use std::io;         // ← add this at the top: for reading keyboard input
use rand::Rng;

fn main() {
    let secret_number: i32 = rand::thread_rng()
        .gen_range(1..=100);

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have 7 guesses. Good luck.");
    println!();

    print!("Guess 1: ");           // ← print without a newline, so input appears on same line
    io::stdout().flush()           // ← force the text to appear NOW (explained below)
        .expect("Could not flush stdout");

    let mut input = String::new(); // ← empty string to hold what the player types

    io::stdin()
        .read_line(&mut input)     // ← wait for the player to type something and press Enter
        .expect("Failed to read line");

    let guess: i32 = input         // ← take the raw input string
        .trim()                    // ← remove the trailing newline
        .parse()                   // ← convert the text to a number
        .expect("Please type a number"); // ← crash if it is not a valid number

    println!("You guessed: {}", guess); // ← confirm we read it correctly
}
```

**New concepts to explain:**

**`print!` vs `println!`:** `println!` prints text and then moves to the next line. `print!` prints text without moving to the next line — the cursor stays at the end of what you printed. This is how `Guess 1: ` and the player's input end up on the same line.

**`io::stdout().flush()`:** This is about **buffering** — a concept we will encounter constantly in networking. When your program writes to the terminal, the operating system does not send each character immediately. It collects them in a **buffer** (a temporary holding area) and sends them in batches, because that is more efficient. The problem: `print!("Guess 1: ")` fills the buffer but the buffer might not be sent before `read_line` starts waiting. The player would see a blank line waiting for input, with no prompt. `.flush()` says "send the buffer right now, do not wait." We will understand buffering deeply when we write our web server — every network connection uses buffers.

**`.parse()`:** This converts a string (text) into a number. `"42"` becomes `42`. `.parse()` needs to know what type to produce — that is why we have `: i32` in the `let guess: i32` declaration. Without it, Rust would say "I don't know what type to parse into."

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

The program pauses waiting for input. Type a number and press Enter.

**You should then see:**

```
Guess 1: 50
You guessed: 50
```

**Change something:** Type a word instead of a number (like "hello"). The program will crash with a message about parsing. This is the `.expect()` triggering. We will handle this gracefully in Lab 5.

---

### Step 4 — Compare the Guess to the Secret Number

Add the comparison logic. Replace the final `println!` with a `match` on the comparison:

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;  // ← add this: brings Ordering::Less/Equal/Greater into scope

fn main() {
    let secret_number: i32 = rand::thread_rng()
        .gen_range(1..=100);

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have 7 guesses. Good luck.");
    println!();

    print!("Guess 1: ");
    io::stdout().flush()
        .expect("Could not flush stdout");

    let mut input = String::new();

    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read line");

    let guess: i32 = input
        .trim()
        .parse()
        .expect("Please type a number");

    match guess.cmp(&secret_number) {            // ← add this block
        Ordering::Less    => println!("Too low."),   // guess was below the secret
        Ordering::Greater => println!("Too high."),  // guess was above the secret
        Ordering::Equal   => println!("Correct! You got it!"), // exact match
    }
}
```

**What `&secret_number` means:** The `&` means "a reference to" — you are lending `.cmp()` the ability to read `secret_number` without giving it ownership. References are one of Rust's deepest and most important concepts — they get their own full lab (Lab 3). For now: when a function wants `&i32`, put `&` before your variable.

---

### SAVE AND TRY

```
cargo run
```

Type a number. You should see "Too low.", "Too high.", or "Correct!" depending on your guess compared to the secret.

**To verify all three outcomes**, temporarily add the DEBUG line back:

```rust
println!("DEBUG — secret is {}", secret_number); // ← add temporarily
```

Run it, see the secret number, then type numbers that you know are too low, too high, and exactly equal. Confirm all three outcomes appear. Remove the DEBUG line when done.

**Change something:** Change `Ordering::Less => println!("Too low.")` to `Ordering::Less => println!("Lower!")`. Confirm the message changes. Change it back.

---

### Step 5 — Add the Game Loop

Now make the game repeat, tracking guess count and stopping when the player wins or runs out of guesses:

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;

const MAX_GUESSES: u32 = 7;  // ← named constant: the maximum number of guesses allowed
                              //   const means this value NEVER changes — not even with mut
                              //   ALL_CAPS_WITH_UNDERSCORES is the Rust naming convention for constants
                              //   u32 because a count of guesses is always positive

fn main() {
    let secret_number: i32 = rand::thread_rng()
        .gen_range(1..=100);

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", MAX_GUESSES); // ← use the constant here
    println!();

    let mut guesses_taken: u32 = 0;  // ← track how many guesses have been used
                                     //   starts at 0, increments each loop iteration
    let mut game_over = false;       // ← boolean flag: has the game ended?
                                     //   false = still playing, true = done

    loop {                           // ← begin the game loop — runs until we break out

        if guesses_taken >= MAX_GUESSES {  // ← check if the player has used all their guesses
            println!("Out of guesses! The number was {}.", secret_number);
            game_over = true;
            break;                         // ← exit the loop immediately
        }

        guesses_taken += 1;          // ← count this guess (BEFORE asking for input, so display is 1-indexed)

        print!("Guess {}: ", guesses_taken); // ← show which guess number this is
        io::stdout().flush()
            .expect("Could not flush stdout");

        let mut input = String::new();

        io::stdin()
            .read_line(&mut input)
            .expect("Failed to read line");

        let guess: i32 = input
            .trim()
            .parse()
            .expect("Please type a number");

        match guess.cmp(&secret_number) {
            Ordering::Less    => println!("Too low.\n"),    // ← \n adds a blank line after the message
            Ordering::Greater => println!("Too high.\n"),   //   for visual breathing room between guesses
            Ordering::Equal   => {                          // ← curly braces for multiple lines
                let remaining = MAX_GUESSES - guesses_taken; // ← how many guesses were unused
                println!(
                    "Correct! You got it in {} {}.",        // ← {} placeholders
                    guesses_taken,
                    if guesses_taken == 1 { "guess" } else { "guesses" } // ← inline if expression
                );
                game_over = true;
                break;                   // ← exit the loop — game won
            }
        }

    } // ← end of loop

    if game_over {                    // ← this line is reached whether they won or ran out
        println!("\nThanks for playing!");
    }
}
```

**New concept: `const` vs `let`:**

`const` declares a value that can never change — not with `mut`, not ever. It is evaluated at compile time and baked into the program. `let` creates a variable that exists at runtime in memory. Use `const` for values that are fixed by design — maximum guesses, screen dimensions, timeout durations. Use `let` for values that depend on runtime conditions.

**New concept: `\n` inside a string:**

`\n` is an **escape sequence** — a way to write a special character inside a string. `\n` means "newline." So `"Too low.\n"` prints "Too low." followed by a blank line. The backslash tells Rust "the next character is not a literal character — it is a special instruction."

Common escape sequences:

| Sequence | Meaning |
|---|---|
| `\n` | Newline (move to next line) |
| `\t` | Tab (horizontal indent) |
| `\\` | A literal backslash |
| `\"` | A literal double quote inside a string |

**New concept: Inline `if` expression:**

```rust
if guesses_taken == 1 { "guess" } else { "guesses" }
```

In Rust, `if` can produce a value — it is an **expression**, not just a statement. This inline `if` evaluates to the string `"guess"` if `guesses_taken == 1`, or `"guesses"` otherwise. This is used directly inside `println!` to correctly pluralize the word. Both branches must produce the same type.

---

### SAVE AND TRY

```
cargo run
```

Play the complete game. Verify:
- Guesses are numbered 1 through 7
- "Too low." and "Too high." display correctly
- Winning displays the number of guesses taken
- Running out of guesses reveals the secret number
- "Thanks for playing!" appears in both cases

**Run it several times.** The secret number should be different each game.

**Change something:** Change `MAX_GUESSES` from `7` to `3`. Run the game. Notice how much harder it is. Notice also that the welcome message automatically updates because it references the constant. This is why we use named constants — change one value, everything that depends on it updates. Change it back to `7`.

---

## 🎯 Challenge: Track and Display the Guess History

**You know:** Variables, loops, `if` statements, `println!`, constants.

**Task:** At the end of the game — whether the player won or ran out of guesses — print every guess the player made, in order, each on its own line.

Example output when the player loses:

```
Out of guesses! The number was 42.

Your guesses were:
  Guess 1: 50
  Guess 2: 25
  Guess 3: 60
  Guess 4: 10
  Guess 5: 70
  Guess 6: 80
  Guess 7: 15
```

**What you need:** An array to store guesses as they are made. Here is the one new piece of syntax you need — an array in Rust:

```rust
let mut guesses: [i32; 7] = [0; 7];  // an array of 7 i32 values, all starting at 0
//               ↑     ↑    ↑  ↑
//               type  size  initial value × size
```

To store a guess at position `i` (where `i` starts at 0):
```rust
guesses[guesses_taken as usize - 1] = guess;
//              ↑
//              arrays are indexed starting at 0
//              guesses_taken is u32, array index must be usize — as usize converts it
```

To print the stored guesses afterward, use a `for` loop:
```rust
for index in 0..guesses_taken {
    println!("  Guess {}: {}", index + 1, guesses[index as usize]);
}
```

**Hints:**
1. Store the guess into the array immediately after parsing it, before the `match`
2. Print the history after the `loop` ends, inside the `if game_over` block

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;

const MAX_GUESSES: u32 = 7;

fn main() {
    let secret_number: i32 = rand::thread_rng()
        .gen_range(1..=100);

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", MAX_GUESSES);
    println!();

    let mut guesses_taken: u32 = 0;
    let mut game_over = false;
    let mut guess_history: [i32; 7] = [0; 7]; // ← array to hold up to 7 guesses

    loop {
        if guesses_taken >= MAX_GUESSES {
            println!("Out of guesses! The number was {}.", secret_number);
            game_over = true;
            break;
        }

        guesses_taken += 1;

        print!("Guess {}: ", guesses_taken);
        io::stdout().flush()
            .expect("Could not flush stdout");

        let mut input = String::new();

        io::stdin()
            .read_line(&mut input)
            .expect("Failed to read line");

        let guess: i32 = input
            .trim()
            .parse()
            .expect("Please type a number");

        guess_history[guesses_taken as usize - 1] = guess; // ← store this guess in the array
        //                              ↑
        //                              as usize converts u32 to the index type arrays require

        match guess.cmp(&secret_number) {
            Ordering::Less    => println!("Too low.\n"),
            Ordering::Greater => println!("Too high.\n"),
            Ordering::Equal   => {
                println!(
                    "Correct! You got it in {} {}.",
                    guesses_taken,
                    if guesses_taken == 1 { "guess" } else { "guesses" }
                );
                game_over = true;
                break;
            }
        }
    }

    if game_over {
        println!("\nYour guesses were:");
        for index in 0..guesses_taken {                     // ← 0..guesses_taken: from 0 up to (but not including) guesses_taken
            println!(
                "  Guess {}: {}",
                index + 1,                                  // ← display 1-indexed (human-friendly)
                guess_history[index as usize]               // ← retrieve from array by position
            );
        }
        println!("\nThanks for playing!");
    }
}
```

**Key insight:** Arrays in Rust have a fixed size set at compile time — `[i32; 7]` always holds exactly 7 values. You access elements by their position (index), starting at 0. Position 0 is the first element, position 6 is the seventh. This is called **zero-based indexing** and is universal across nearly all programming languages. The reason: an index is actually an *offset from the start* — the first element is zero steps from the start. We will explore this deeply when we study memory and pointers in Lab 6.

</details>

---

## Final Check

Verify every feature from this lab works before moving on:

| Feature | How to verify |
|---|---|
| Welcome message displays | Run `cargo run` — see the intro text with blank lines |
| Random secret number | Run the game three times — different numbers each time (add DEBUG line temporarily) |
| Input reads correctly | Type a number — it appears on the same line as the prompt |
| "Too low." displays | Guess a number you know is below the secret |
| "Too high." displays | Guess a number you know is above the secret |
| "Correct!" displays | Guess the exact secret number (use DEBUG line to find it) |
| Guess counter increments | Guess numbers increase: "Guess 1:", "Guess 2:", etc. |
| Out of guesses ends the game | Use all 7 guesses without winning — secret is revealed |
| "Thanks for playing!" appears | Both winning and losing show this message |
| `MAX_GUESSES` constant works | Change it to 3, rebuild, welcome message updates automatically |

---

## Quick Check Answers

**1. Why does a computer need to know the type of data before it can work with it?**

Because data in memory is just bits — patterns of ones and zeros with no inherent meaning. The number 65 and the letter 'A' are stored as identical bit patterns. Without a type label, the computer cannot tell them apart and cannot know which operations make sense. Adding two numbers is meaningful. Adding a number to a letter is not. The type system is how the computer (via the compiler) enforces that only meaningful operations happen. In Rust specifically, this check happens at compile time — before your program ever runs — so these errors are caught in development rather than in production.

**2. What is the benefit of a compiler that catches errors before running, versus a language that crashes at runtime?**

A compile-time error is discovered the moment you try to build — on your development machine, before any user sees the code. A runtime error crashes the program while it is running, potentially in front of a user, potentially after corrupting data, potentially weeks after you wrote the bug. For a web server serving millions of requests, a runtime crash might happen on request number 847,293 under a specific combination of inputs that you never tested. A compile-time error is impossible to ship. A runtime error is easy to ship without realizing it. Rust's compiler catches an unusually large class of errors at compile time — this is one of its most valuable properties.

**3. Is there something truly random happening inside a computer when it generates a random number?**

Almost never, for general-purpose code. What computers generate is called **pseudorandom** numbers — produced by a mathematical formula that takes a starting value (the **seed**) and generates a sequence of numbers that appear statistically random but are entirely deterministic. Given the same seed, you always get the same sequence. The `rand` crate seeds its generator from true entropy sources (thermal noise in chips, timing variations in hardware events, OS-collected randomness), which makes the output unpredictable in practice. But the generation itself is deterministic math, not physical randomness. True hardware random number generators exist (some CPUs have them — Intel's `RDRAND` instruction) and are used for cryptographic purposes. Our guessing game does not need cryptographic randomness — pseudorandom is perfectly fine for games.
