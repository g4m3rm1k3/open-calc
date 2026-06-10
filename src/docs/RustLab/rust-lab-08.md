# Rust Web Server — LAB 08 — Closures, Functional Patterns, and Phase 1 Complete

**Prerequisites:** LAB 01–07. You understand all core Rust types, ownership, borrowing, structs, enums, traits, generics, modules, `Vec`, `HashMap`, and iterators. The guessing game is a complete, multi-file Rust project.

**What this lab adds:**
- What a closure is — a function that captures its environment
- How the compiler represents closures in memory — the hidden struct
- The three closure traits: `Fn`, `FnMut`, `FnOnce` — and why there are three
- Lambda calculus — the mathematical origin of closures, and why it matters
- Higher-order functions — functions that take or return other functions
- Functional programming patterns and when they produce cleaner code than imperative loops
- A polished, complete version of the guessing game with all features integrated
- A retrospective on Phase 1 — what you now know and what Phase 2 will build on

**Time:** 4–5 hours

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 07, you wrote `.map(|&g| g.to_string())`. The `|&g| g.to_string()` part is a closure. What do you think makes a closure different from a regular function defined with `fn`?
> 2. You have written `for` loops that process every element in a list. What advantages do you think there might be to expressing the same logic as a chain of `.filter()`, `.map()`, and `.collect()` instead?
> 3. Higher-order functions are functions that take other functions as arguments or return them. Can you think of a real-world operation — not in programming — that takes another operation as input?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lab polishes the guessing game into its final form and demonstrates closure-based patterns throughout. The functional patterns you learn here — closures, higher-order functions, iterator chains — are the same patterns used in the web server's request processing pipeline.

```
$ cargo run

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1: hello
Invalid input: that's not a number — enter a whole number

Guess 1: 50
Too high.

Guess 2: 25
Too low.

Guess 3: 37
Correct! You got it in 3 guesses!

── Game Summary ──────────────────────────────
Guesses:  50 → high  |  25 → low  |  37 → correct
Average:  37  |  Spread: 25
Longest same-direction streak: 1
─────────────────────────────────────────────
Thanks for playing — well done!
```

---

## Part 1 — What a Closure Is

### Concept: Closure — A Function That Captures Its Environment

**What it is:** A closure is an anonymous function — a function without a name — that can capture variables from the scope where it is defined.

**The problem before:**

A regular function defined with `fn` can only access its own parameters and globally defined items. It cannot see local variables in the scope where it is called:

```rust
fn main() {
    let threshold = 50;

    // This does not work — fn cannot capture threshold:
    fn is_above_threshold(n: i32) -> bool {
        n > threshold   // ERROR: can't capture threshold
    }
}
```

A closure can:

```rust
fn main() {
    let threshold = 50;

    let is_above = |n: i32| -> bool {   // closure captures threshold
        n > threshold                    // threshold is captured from the surrounding scope
    };

    println!("{}", is_above(75));   // true
    println!("{}", is_above(25));   // false
}
```

**The syntax:**

```rust
|parameter: Type| -> ReturnType { body }

// Type annotations are usually optional — Rust infers them:
|parameter| body_expression

// Multiple parameters:
|a, b| a + b

// No parameters:
|| do_something()

// Multi-line body:
|x| {
    let doubled = x * 2;
    doubled + 1
}
```

**The vertical bars `||` are the closure delimiter.** Parameters go between them. This syntax comes from the mathematical tradition of lambda calculus, where a function is written as `λx. x + 1`. Rust's `|x| x + 1` is the same idea — an anonymous function with parameter `x` and body `x + 1`.

---

### Concept: Lambda Calculus — The Mathematical Origin of Closures

**What it is:** Lambda calculus is a formal mathematical system invented by Alonzo Church in the 1930s for expressing computation through function application. It is the theoretical foundation of functional programming and of closures specifically.

**Why it matters:** Every time you write a closure — in Rust, JavaScript, Python, Haskell, or any modern language — you are using a concept that Church formalized 90 years ago. Understanding the origin helps you understand why closures behave the way they do.

**The core ideas of lambda calculus:**

1. **Functions are values.** A function can be passed to another function as an argument, stored in a variable, and returned from a function. Functions are first-class citizens, not special constructs.

2. **Functions are anonymous.** A function does not need a name to exist. `λx. x + 1` is a complete, valid function — it takes `x` and returns `x + 1`. Names are just convenient labels.

3. **Capture is fundamental.** `λx. x + y` captures `y` from the surrounding context. The function "closes over" its environment — hence the name "closure."

**The Church-Turing thesis:** In 1936, independently, Alonzo Church (using lambda calculus) and Alan Turing (using Turing machines) proved that these two very different models of computation are equivalent — they can compute exactly the same things. Every program you write is, in a mathematical sense, a lambda expression. The programming languages we use today are sophisticated syntactic sugar over these foundational mathematical objects.

**The practical consequence:** Because functions are values in lambda calculus — and in Rust — you can:
- Store a closure in a variable
- Pass a closure to another function
- Return a closure from a function
- Store closures in a `Vec` or `HashMap`

This is the foundation of higher-order programming.

---

### Concept: How the Compiler Represents a Closure

**What it is:** When you write a closure that captures variables, the compiler creates a hidden struct that holds the captured values and implements one of the three function traits.

**The captured environment becomes struct fields:**

```rust
let threshold = 50;
let multiplier = 2;

let transform = |n: i32| -> i32 {
    (n - threshold) * multiplier   // captures both threshold and multiplier
};
```

The compiler internally generates something equivalent to:

```rust
struct TransformClosure {    // a hidden struct — you never see or name this
    threshold:  i32,         // captured variable — copy of threshold
    multiplier: i32,         // captured variable — copy of multiplier
}

impl TransformClosure {
    fn call(&self, n: i32) -> i32 {
        (n - self.threshold) * self.multiplier
    }
}
```

The closure `transform` is an instance of this hidden struct. Calling `transform(42)` calls the hidden `call` method.

**Why this matters:**

1. **Closures have a size.** A closure that captures three `i32`s has the size of three `i32`s on the stack. A closure that captures a `Vec` of a million elements has a million-element `Vec`'s worth of data behind it. Size matters when storing closures in data structures.

2. **Closures follow ownership rules.** The captured variables are either copied into the struct (for `Copy` types), moved into the struct, or borrowed. The same ownership rules from Lab 03 apply — the compiler enforces them on closures too.

3. **This is zero-cost.** The hidden struct is created at compile time. Calling a closure is calling a regular method. No dynamic dispatch, no heap allocation (for closures that fit on the stack). Closures in Rust are as fast as function calls.

---

### Concept: The Three Closure Traits — `Fn`, `FnMut`, `FnOnce`

**What they are:** Rust has three traits that describe how a closure interacts with its captured environment. The compiler automatically determines which trait(s) a closure implements based on what it does with its captures.

**Why three, not one?**

Ownership applies to closures just as it does to any other value. A closure that reads captured data is different from one that mutates it, which is different from one that consumes it. The three traits encode these three relationships:

| Trait | What the closure does with captures | Can be called |
|---|---|---|
| `Fn` | Reads captured values (immutable borrow) | Any number of times |
| `FnMut` | Modifies captured values (mutable borrow) | Any number of times, but not concurrently |
| `FnOnce` | Consumes captured values (takes ownership) | Exactly once |

Every `Fn` is also `FnMut`. Every `FnMut` is also `FnOnce`. The traits form a hierarchy:

```
FnOnce  ←  FnMut  ←  Fn
(weakest)           (strongest)
```

`Fn` is the strongest guarantee — the closure can be called repeatedly, concurrently, without restriction. `FnOnce` is the weakest — it can only be called once because calling it consumes something.

**Canonical examples:**

```rust
// Fn — reads captured data, callable any number of times:
let greeting = String::from("Hello");
let say_hello = || println!("{}", greeting);   // borrows greeting immutably
say_hello();   // works
say_hello();   // works again — greeting was not consumed

// FnMut — modifies captured data:
let mut count = 0;
let mut increment = || { count += 1; count }; // mutably borrows count
println!("{}", increment()); // 1
println!("{}", increment()); // 2

// FnOnce — consumes captured data:
let name = String::from("Ada");
let consume = move || {             // move forces ownership into the closure
    println!("{}", name);
    drop(name);                     // explicitly drop — name is consumed
};
consume();   // works
// consume(); // COMPILE ERROR — name was consumed in the first call
```

**The `move` keyword:**

`move` before a closure forces all captured variables to be moved into the closure — transferred into the hidden struct — rather than borrowed. Use `move` when:
- The closure needs to outlive the scope where the captured variables are defined
- You are sending a closure to another thread (threads require owned data)
- You want the closure to own its data rather than borrow it

**Project Application:**

Every closure you pass to `.map()`, `.filter()`, and `.sort_by()` is `Fn` — it reads captured data and can be called repeatedly on each element. We will also see `FnMut` when we write a closure that accumulates results.

**Watch for:** If the compiler gives you an error about a closure not implementing a trait (`closure is not Fn because it mutates a captured variable`), the fix is usually either: use `FnMut` in the function signature, or restructure the closure to not mutate — pull the mutable state out and pass it as a parameter instead.

---

## Part 2 — Higher-Order Functions

### Concept: Higher-Order Function — A Function That Takes or Returns Functions

**What it is:** A higher-order function is a function that either accepts one or more functions as parameters, or returns a function as its result, or both.

**What it enables:** Higher-order functions are the mechanism by which closures and iterators combine into expressive pipelines. Every iterator adapter (`.map()`, `.filter()`, `.sort_by()`) is a higher-order function — it takes a closure that describes what to do with each element.

**Canonical example (General Explanation):**

A sorting function. Sorting requires knowing how to compare two elements. The comparison logic is different for different types and different orderings (ascending, descending, by a specific field). Rather than hardcoding the comparison, `sort_by` takes a closure that implements the comparison:

```rust
let mut numbers = vec![50, 25, 75, 10, 90];

// Sort ascending (smallest first):
numbers.sort_by(|a, b| a.cmp(b));
println!("{:?}", numbers);   // [10, 25, 50, 75, 90]

// Sort descending (largest first):
numbers.sort_by(|a, b| b.cmp(a));
println!("{:?}", numbers);   // [90, 75, 50, 25, 10]
```

The `sort_by` function does not know or care how comparison works — it just calls the provided closure for each pair. The closure defines the order. This is the Strategy pattern from computer science (named in Lab 04's OOP discussion) — the algorithm's structure is fixed, but one piece of behavior is injectable.

**Writing a higher-order function:**

```rust
fn apply_twice<F: Fn(i32) -> i32>(f: F, value: i32) -> i32 {
//              ↑
//              F is a type parameter constrained to implement Fn(i32) -> i32
//              meaning: F is any closure (or function) that takes i32 and returns i32
    f(f(value))   // call f twice
}

let double = |x| x * 2;
println!("{}", apply_twice(double, 5));   // double(double(5)) = double(10) = 20

let add_ten = |x| x + 10;
println!("{}", apply_twice(add_ten, 5));  // add_ten(add_ten(5)) = add_ten(15) = 25
```

**Returning a closure from a function:**

```rust
fn make_multiplier(factor: i32) -> impl Fn(i32) -> i32 {
//                                 ↑
//                                 return type: some type that implements Fn(i32) -> i32
//                                 the compiler knows the exact type; we say impl Fn
    move |x| x * factor   // move: factor is captured into the closure
}

let triple = make_multiplier(3);
let quadruple = make_multiplier(4);

println!("{}", triple(10));    // 30
println!("{}", quadruple(10)); // 40
```

`make_multiplier` is a function factory — it returns a new closure each time, each capturing a different `factor`. The closures remember their captured `factor` even after `make_multiplier` returns. This is the "closure over the environment" that gives closures their name.

**Why `impl Fn` in the return type?** Each closure the compiler generates has a unique, anonymous type. You cannot write the return type as a concrete type — there is no name for it. `impl Fn(i32) -> i32` says "return some type that implements this trait" without naming the type. The compiler knows the exact type; `impl Trait` lets you avoid naming it.

---

## Part 3 — Functional Patterns in Practice

### Concept: Imperative vs Functional Style

**What they are:** Two complementary styles of expressing computation.

**Imperative style** describes *how* to compute — step by step, with explicit loops, mutable variables, and state changes:

```rust
// Find the sum of squares of even numbers (imperative):
let numbers = vec![1, 2, 3, 4, 5, 6];
let mut total = 0;
for &n in &numbers {
    if n % 2 == 0 {
        total += n * n;
    }
}
// total = 56 (4 + 16 + 36)
```

**Functional style** describes *what* to compute — a pipeline of transformations, no mutable state:

```rust
// Same computation (functional):
let total: i32 = numbers.iter()
    .filter(|&&n| n % 2 == 0)   // keep even numbers
    .map(|&n| n * n)             // square each one
    .sum();                      // add them all
// total = 56
```

**Which is better?** Neither is universally better. Functional chains are clearer when the computation is a data transformation pipeline — what you are doing is visible in the chain. Imperative loops are clearer when the logic has complex control flow — multiple early exits, dependencies between iterations, state that multiple branches read and write.

**The rule of thumb:**
- Transforming data (filter, map, sum, sort, group) → functional chain
- Coordinating behavior (game loop, server event loop, complex state machine) → imperative loop

Real programs use both. The skill is recognizing which fits the current situation.

---

### Step 1 — Rewrite the Stats Formatting With Closures

Open `main.rs`. Replace the summary printing block with a closure-based version:

```rust
if let Some(stats) = game.stats() {
    println!();
    println!("── Game Summary ──────────────────────────────");

    // Label each guess with its outcome — a functional transformation
    let labeled: Vec<String> = stats.guesses
        .iter()
        .map(|&g| {                                // ← closure over g (each guess)
            let label = if g > stats.highest / 2 + stats.lowest / 2 {
                "high"
            } else if g == stats.average {
                "correct"
            } else {
                "low"
            };
            format!("{} → {}", g, label)           // ← format each guess with its label
        })
        .collect();

    println!("Guesses:  {}", labeled.join("  |  "));

    let spread = stats.highest - stats.lowest;     // ← range of guesses
    println!("Average:  {}  |  Spread: {}", stats.average, spread);
    println!("Longest same-direction streak: {}", stats.longest_drought);

    println!("─────────────────────────────────────────────");
}
```

**What "spread" measures:** The spread (also called the **range** in statistics) is the difference between the highest and lowest values — it measures how widely the guesses varied. A small spread means the player quickly narrowed in on the answer. A large spread means the guesses were scattered. This is a simple measure of guessing efficiency.

---

### SAVE AND TRY

```
cargo run
```

Play a game. The summary should show guesses labeled with their direction:

```
── Game Summary ──────────────────────────────
Guesses:  50 → high  |  25 → low  |  37 → correct
Average:  37  |  Spread: 25
Longest same-direction streak: 1
─────────────────────────────────────────────
```

**Change something:** Change the label logic — instead of "high"/"low"/"correct", label each guess with how far it was from the answer:

```rust
let label = (g - stats.average).abs().to_string() + " away";
```

`(g - stats.average).abs()` gives the absolute distance from the average. `.abs()` returns the absolute value — the distance from zero, always positive. The labels would be "13 away", "12 away", "0 away". Change it back to the directional labels.

---

### Step 2 — Sort Guess History With `sort_by`

Add sorted output to the summary — a second view of the guesses in ascending order:

```rust
// After the labeled guesses line, add:
let mut sorted_guesses = stats.guesses.clone();  // ← clone so we can sort without affecting original
sorted_guesses.sort_by(|a, b| a.cmp(b));         // ← sort ascending using a closure

let sorted_strs: Vec<String> = sorted_guesses
    .iter()
    .map(|&g| g.to_string())
    .collect();

println!("Sorted:   {}", sorted_strs.join(" < "));
```

---

### SAVE AND TRY

```
cargo run
```

The summary now shows two views of the history:

```
Guesses:  50 → high  |  25 → low  |  37 → correct
Sorted:   25 < 37 < 50
```

**Change something:** Change `a.cmp(b)` to `b.cmp(a)`. The sort reverses — descending order. The `<` separator now looks wrong — change it to `>` at the same time. Change both back.

---

### Step 3 — Add a `with_formatted_history` Method Using a Closure Parameter

Add a method to `GameState` in `game.rs` that accepts a closure to format each guess:

```rust
pub fn with_formatted_history<F>(&self, formatter: F) -> Vec<String>
where
    F: Fn(i32) -> String,           // ← F is any closure that takes i32 and returns String
{
    self.history
        .iter()
        .map(|&g| formatter(g))     // ← call the closure for each guess
        .collect()
}
```

This method is generic over `F` — it accepts any closure that matches the `Fn(i32) -> String` signature. The caller decides how to format each guess.

Use it in `main.rs`:

```rust
// Replace the labeled Vec construction with:
let labeled = game.with_formatted_history(|g| {
    // This closure is called once per guess — g is each i32 in the history
    let label = if g.cmp(&stats.highest) == std::cmp::Ordering::Equal {
        "high"
    } else if g.cmp(&stats.lowest) == std::cmp::Ordering::Equal {
        "low"
    } else {
        "mid"
    };
    format!("{} → {}", g, label)
});
```

**What just happened:** `with_formatted_history` is a higher-order method — it takes a closure as a parameter. The method provides the iteration machinery; the closure provides the formatting logic. Neither knows the other's internals. This is the separation of concerns from Lab 04, now applied at the function level.

This is the exact pattern you will use in the web server for middleware: the server provides the request-handling loop, each middleware provides a closure describing what to do with each request.

---

### SAVE AND TRY

```
cargo run
```

Output should be the same as before. The change is architectural — the formatting logic is now injectable through a closure.

**Change something:** Pass a different closure to `with_formatted_history`:

```rust
let labeled = game.with_formatted_history(|g| format!("#{}", g));
```

The output becomes `#50  |  #25  |  #37`. Change it back to the original closure.

---

## Part 4 — The Complete Game

Here is the complete, final state of all three files. This is Phase 1 complete — the guessing game in its finished form.

### `src/error.rs` — Final

```rust
use std::fmt;
use crate::game::Describable;

#[derive(Debug, PartialEq)]
pub enum GuessError {
    NotANumber,
    OutOfRange(i32),
    TooManyInvalidAttempts,
}

impl fmt::Display for GuessError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            GuessError::NotANumber =>
                write!(f, "that's not a number — enter a whole number"),
            GuessError::OutOfRange(n) =>
                write!(f, "{} is out of range — enter a number between 1 and 100", n),
            GuessError::TooManyInvalidAttempts =>
                write!(f, "too many invalid attempts — game over"),
        }
    }
}

impl Describable for GuessError {
    fn describe(&self) -> String {
        match self {
            GuessError::NotANumber =>
                String::from("Error: input was not a number"),
            GuessError::OutOfRange(n) =>
                format!("Error: {} is outside the valid range 1–100", n),
            GuessError::TooManyInvalidAttempts =>
                String::from("Error: too many invalid attempts in a row"),
        }
    }
}

pub fn is_input_error(e: &GuessError) -> bool {
    matches!(e, GuessError::NotANumber | GuessError::OutOfRange(_))
}
```

### `src/game.rs` — Final

```rust
use rand::Rng;
use std::cmp::Ordering;
use std::collections::HashMap;

// ── Trait ─────────────────────────────────────────────────────────────────────

pub trait Describable {
    fn describe(&self) -> String;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

#[derive(Debug)]
pub struct GameStats {
    pub highest:         i32,
    pub lowest:          i32,
    pub average:         i32,
    pub guesses:         Vec<i32>,
    pub zones:           HashMap<String, u32>,
    pub longest_drought: u32,
}

// ── GameState ─────────────────────────────────────────────────────────────────

#[derive(Debug)]
pub struct GameState {
    pub max_guesses:   u32,
    pub is_over:       bool,
    pub guesses_taken: u32,
    secret:            i32,
    last_guess:        Option<i32>,
    pub history:       Vec<i32>,
}

impl GameState {

    pub fn new() -> GameState {
        GameState {
            secret:        generate_secret(),
            guesses_taken: 0,
            max_guesses:   7,
            is_over:       false,
            last_guess:    None,
            history:       Vec::with_capacity(7),
        }
    }

    pub fn take_guess(&mut self, guess: i32) {
        self.guesses_taken += 1;
        self.last_guess = Some(guess);
        self.history.push(guess);

        match guess.cmp(&self.secret) {
            Ordering::Less => {
                println!("Too low.\n");
            }
            Ordering::Greater => {
                println!("Too high.\n");
            }
            Ordering::Equal => {
                println!(
                    "Correct! You got it in {} {}!\n",
                    self.guesses_taken,
                    if self.guesses_taken == 1 { "guess" } else { "guesses" }
                );
                self.is_over = true;
            }
        }

        if self.guesses_taken >= self.max_guesses && !self.is_over {
            match self.last_guess {
                Some(n) => println!(
                    "Out of guesses! Your last guess was {}. The number was {}.",
                    n, self.secret
                ),
                None => println!("Out of guesses! The number was {}.", self.secret),
            }
            self.is_over = true;
        }
    }

    pub fn is_won(&self) -> bool {
        self.is_over && self.guesses_taken <= self.max_guesses
    }

    pub fn stats(&self) -> Option<GameStats> {
        if self.history.is_empty() {
            return None;
        }

        let count = self.history.len() as i32;
        let highest = *self.history.iter().max().unwrap();
        let lowest  = *self.history.iter().min().unwrap();
        let sum: i32 = self.history.iter().sum();
        let average  = sum / count;

        let mut zones: HashMap<String, u32> = HashMap::new();
        for &guess in &self.history {
            let zone = if guess <= 33 {
                "low (1–33)"
            } else if guess <= 66 {
                "mid (34–66)"
            } else {
                "high (67–100)"
            };
            let zone_count = zones.entry(zone.to_string()).or_insert(0);
            *zone_count += 1;
        }

        Some(GameStats {
            highest,
            lowest,
            average,
            guesses:         self.history.clone(),
            zones,
            longest_drought: self.longest_drought(),
        })
    }

    pub fn longest_drought(&self) -> u32 {
        if self.history.is_empty() {
            return 0;
        }

        let mut longest: u32 = 0;
        let mut current: u32 = 0;
        let mut last_direction: Option<Ordering> = None;

        for &guess in &self.history {
            let direction = guess.cmp(&self.secret);

            match direction {
                Ordering::Equal => {
                    if current > longest { longest = current; }
                    current = 0;
                    last_direction = None;
                }
                _ => {
                    if last_direction == Some(direction) {
                        current += 1;
                    } else {
                        if current > longest { longest = current; }
                        current = 1;
                    }
                }
            }

            last_direction = Some(direction);
        }

        if current > longest { longest = current; }
        longest
    }

    pub fn with_formatted_history<F>(&self, formatter: F) -> Vec<String>
    where
        F: Fn(i32) -> String,
    {
        self.history.iter().map(|&g| formatter(g)).collect()
    }

}

impl Describable for GameState {
    fn describe(&self) -> String {
        if self.is_over {
            format!(
                "Game over after {} {}. {}.",
                self.guesses_taken,
                if self.guesses_taken == 1 { "guess" } else { "guesses" },
                if self.is_won() { "Player won" } else { "Player lost" }
            )
        } else {
            format!(
                "Game in progress — {} of {} guesses used.",
                self.guesses_taken,
                self.max_guesses
            )
        }
    }
}

impl Default for GameState {
    fn default() -> Self {
        GameState::new()
    }
}

// ── Internal ──────────────────────────────────────────────────────────────────

fn generate_secret() -> i32 {
    rand::thread_rng().gen_range(1..=100)
}
```

### `src/main.rs` — Final

```rust
mod game;
mod error;

use std::io;
use std::cmp::Ordering;
use game::{GameState, Describable};
use error::GuessError;

fn get_guess(guess_number: u32) -> Result<i32, GuessError> {
    print!("Guess {}: ", guess_number);
    io::stdout().flush().expect("Could not flush stdout");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let input = input.trim();

    let number: i32 = match input.parse() {
        Ok(n)  => n,
        Err(_) => return Err(GuessError::NotANumber),
    };

    if number < 1 || number > 100 {
        return Err(GuessError::OutOfRange(number));
    }

    Ok(number)
}

fn print_description(item: &impl Describable) {
    println!("[info] {}", item.describe());
}

fn main() {
    let mut game = GameState::new();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    let mut consecutive_invalid: u32 = 0;

    loop {
        if game.is_over { break; }

        let guess_number = game.guesses_taken + 1;

        match get_guess(guess_number) {
            Err(e) => {
                println!("Invalid input: {}\n", e);
                consecutive_invalid += 1;
                if consecutive_invalid >= 3 && !game.is_over {
                    println!("Too many invalid attempts. Game over.");
                    game.is_over = true;
                }
            }
            Ok(guess) => {
                consecutive_invalid = 0;
                game.take_guess(guess);
            }
        }
    }

    if let Some(stats) = game.stats() {
        println!();
        println!("── Game Summary ──────────────────────────────");

        let labeled = game.with_formatted_history(|g| {
            let label = match g.cmp(&stats.highest) {
                Ordering::Equal => "high",
                _ => match g.cmp(&stats.lowest) {
                    Ordering::Equal => "low",
                    _ => "mid",
                }
            };
            format!("{} → {}", g, label)
        });

        println!("Guesses:  {}", labeled.join("  |  "));

        let spread = stats.highest - stats.lowest;
        println!("Average:  {}  |  Spread: {}", stats.average, spread);
        println!("Longest same-direction streak: {}", stats.longest_drought);
        println!("─────────────────────────────────────────────");
    }

    println!();
    print_description(&game);
    println!();

    if game.is_won() {
        println!("Thanks for playing — well done!");
    } else {
        println!("Thanks for playing — better luck next time!");
    }
}
```

---

### SAVE AND TRY

```
cargo run
```

Play a full game to completion. Verify:
- Invalid input shows "Invalid input: ..." without crashing
- Three consecutive invalid inputs ends the game
- The summary shows labeled guesses, average, spread, and drought
- The description shows "Game over after N guesses. Player won/lost."
- Both win and loss paths work correctly

Run it three times. Different secrets, different outcomes.

---

## 🎯 Challenge: Build a `GameRunner` That Plays Automatically

**You know:** Closures, `Fn`, higher-order functions, `Vec`, `HashMap`, `GameState`, all of Phase 1.

**Task:** Write a `GameRunner` struct with a method `play_with_strategy` that accepts a closure representing a guessing strategy. The runner calls the strategy closure once per turn to get each guess, plays the game, and returns the final `GameStats`.

```rust
struct GameRunner {
    game: GameState,
}

impl GameRunner {
    fn new() -> GameRunner {
        GameRunner { game: GameState::new() }
    }

    fn play_with_strategy<F>(&mut self, mut strategy: F) -> Option<GameStats>
    where
        F: FnMut(u32) -> i32,
        //  ↑
        //  FnMut because the strategy might update internal state (like a counter)
        //  takes the current guess number, returns the guess to make
    {
        // your implementation here
    }
}
```

**Test it with two strategies in `main`:**

```rust
// Strategy 1: always guess 50
let mut runner1 = GameRunner::new();
let stats1 = runner1.play_with_strategy(|_turn| 50);
println!("Always-50 strategy: {:?}", stats1.map(|s| s.guesses_taken));

// Strategy 2: binary search
let mut runner2 = GameRunner::new();
let mut low = 1i32;
let mut high = 100i32;
let stats2 = runner2.play_with_strategy(|_turn| {
    let guess = (low + high) / 2;
    // Note: we cannot update low/high without knowing the result
    // For now, just return the midpoint every time
    guess
});
println!("Binary search (simplified): {:?}", stats2.map(|s| s.guesses_taken));
```

**Hints:**
1. `play_with_strategy` loops until `game.is_over`, calling `strategy(game.guesses_taken + 1)` each turn
2. The strategy returns an `i32` — pass it directly to `game.take_guess()`
3. You will need to suppress `take_guess`'s `println!` output (or just accept the output for now)
4. Return `game.stats()` at the end

Try it before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add to `main.rs` (or a new `src/runner.rs` if you want to practice module organization):

```rust
struct GameRunner {
    game: GameState,
}

impl GameRunner {
    fn new() -> GameRunner {
        GameRunner { game: GameState::new() }
    }

    fn play_with_strategy<F>(&mut self, mut strategy: F) -> Option<GameStats>
    where
        F: FnMut(u32) -> i32,
    {
        while !self.game.is_over {                          // ← while loop — cleaner than loop+break here
            let guess_number = self.game.guesses_taken + 1;
            let guess = strategy(guess_number);             // ← call the strategy closure

            if guess >= 1 && guess <= 100 {                 // ← only valid guesses
                self.game.take_guess(guess);
            } else {
                // invalid strategy guess — end game to avoid infinite loop
                self.game.is_over = true;
            }
        }

        self.game.stats()
    }
}
```

In `main`:

```rust
// Always-50 strategy:
let mut runner1 = GameRunner::new();
let stats1 = runner1.play_with_strategy(|_| 50);  // _ discards the turn number — not needed
if let Some(s) = stats1 {
    println!("Always-50: {} guesses, secret was shown above", s.guesses_taken);
}

// Alternating high-low strategy:
let mut runner2 = GameRunner::new();
let mut toggle = false;
let stats2 = runner2.play_with_strategy(|_| {      // FnMut — mutates toggle
    toggle = !toggle;
    if toggle { 75 } else { 25 }
});
if let Some(s) = stats2 {
    println!("Alternating: {} guesses", s.guesses_taken);
}
```

**Key insight:** `play_with_strategy` is a higher-order method — it takes a strategy as a closure and runs it. Different strategies can be plugged in without changing `play_with_strategy` itself. This is the **Strategy pattern** from computer science: the algorithm's skeleton (the game loop) is fixed in `play_with_strategy`; the variable part (how to choose a guess) is injected by the caller as a closure.

The alternating strategy uses `FnMut` — the closure mutates `toggle` between calls. This is why `FnMut` exists: some strategies need to remember state between invocations. A pure binary search strategy would need to track `low` and `high` across calls — making it naturally `FnMut`.

In the web server, you will use this exact pattern for middleware: `server.handle_with(|request| { ... })`. The server provides the loop; the closure provides the handling logic.

</details>

---

## Part 5 — Phase 1 Retrospective

You have completed eight labs. Before moving to Phase 2, it is worth naming exactly what you know — because the concepts you have learned are not just Rust. They are foundational computer science.

### What You Now Understand

**Memory and hardware:**
- What a CPU is and how it executes instructions one at a time
- What RAM is, why it is fast, and why it is temporary
- The stack and the heap — two regions with completely different rules
- Binary, bits, bytes, and why memory sizes are powers of 2
- How structs, enums, Vec, and HashMap are laid out in memory

**Type systems:**
- What a type is — a label on bits that determines valid operations
- Static vs dynamic typing — compile-time vs runtime checking
- Generics and monomorphization — zero-cost type abstraction
- Traits — named contracts of behavior, Rust's answer to polymorphism

**Memory safety:**
- The three memory bugs: leak, use-after-free, double-free
- Ownership — one owner, dropped when scope ends
- Borrowing — read-only and mutable references with compiler-enforced rules
- The borrow checker — why fighting it usually reveals a real design problem

**Data structures:**
- Fixed arrays — stack-allocated, fixed size, zero overhead
- `Vec<T>` — heap-allocated, growable, amortized O(1) push
- `HashMap<K, V>` — hash-based lookup table, O(1) average access
- Iterators — lazy, composable, zero-overhead sequence processing

**Error handling:**
- The billion-dollar mistake — why null is dangerous
- `Option<T>` — absence made explicit in the type system
- `Result<T, E>` — operations that can fail, with structured errors
- The `?` operator — clean error propagation

**Functional programming:**
- Closures — anonymous functions that capture their environment
- Lambda calculus — the mathematical foundation
- The three closure traits — `Fn`, `FnMut`, `FnOnce`
- Higher-order functions — functions that take or return functions
- Iterator chains — composable data pipelines

**Software engineering:**
- Separation of concerns — each function, struct, and module does one job
- Encapsulation — hiding implementation behind a public interface
- The Strategy pattern — injecting behavior as a closure or trait object
- Multi-file organization — modules, `pub`, visibility rules
- Amortized analysis — reasoning about average-case cost across sequences

### What Phase 2 Builds On

Phase 2 — Labs 09–12 — leaves the guessing game behind and begins building toward the web server. Every concept above will reappear:

```
LAB 09 — Strings, Slices, and Text Processing
         The difference between &str and String — fully explained.
         Parsing raw bytes into structured text. The foundation
         of HTTP request parsing.

LAB 10 — The Operating System and Processes
         What an OS actually is. System calls — how your program
         asks the OS for resources. File descriptors — the OS's
         abstraction for files, sockets, pipes, and the terminal.
         stdin, stdout, stderr — what they actually are.

LAB 11 — Files, Paths, and the Filesystem
         Reading and writing files. The filesystem as a tree.
         Paths, permissions, and why they matter for a server.

LAB 12 — Processes and Standard I/O
         Spawning child processes. Pipes between processes.
         The foundation for understanding how a web server
         forks connections.
```

After Lab 12, Phase 3 begins — TCP sockets, raw networking, and building an HTTP server from scratch.

---

## Final Check

| Feature | How to verify |
|---|---|
| Full game plays correctly | Win and lose paths both work |
| Invalid input handled gracefully | "hello", "999", "" — all show error messages |
| Three consecutive invalids ends game | Type "hello" three times — game over |
| Guess history in summary | Summary shows all valid guesses in order |
| Labeled guesses correct | "high", "low", "mid" labels match their values |
| Spread calculated correctly | Highest minus lowest — verify manually |
| Longest drought correct | All-one-side streak counted correctly |
| `with_formatted_history` works | Changing the closure changes the output |
| `sort_by` with closure works | Sorted output is ascending |
| `GameRunner` plays automatically | Two strategies produce different outputs |
| Three-file structure intact | `cargo build` — zero errors, zero warnings |

---

## Quick Check Answers

**1. What makes a closure different from a regular function defined with `fn`?**

A closure can capture variables from the scope where it is defined. A regular `fn` can only access its own parameters and globally defined items — it cannot see local variables in its surrounding scope. When you write `|n: i32| n > threshold`, the closure captures `threshold` from the enclosing function. The compiler creates a hidden struct that holds `threshold` as a field, and the closure body becomes a method on that struct. A regular function has no such hidden struct and no capture mechanism. The second difference: closures are anonymous — they have no name, and their exact type is unique (generated by the compiler). Regular functions have names and explicit types.

**2. What advantages does a functional chain have over an imperative loop?**

Three main advantages. First, intent clarity: `numbers.iter().filter(|&&n| n % 2 == 0).map(|&n| n * n).sum()` tells you exactly what is happening at each stage — filter evens, square each, sum all — without reading the loop body to understand the intent. Second, composability: each stage is independent and can be added, removed, or replaced without touching the others. Adding `.take(5)` to limit to the first 5 results is one method call, not a rewrite of the loop condition. Third, no mutable state: functional chains do not use mutable variables to accumulate results — the data flows through the pipeline immutably, which makes the code easier to reason about and test. The disadvantage: complex control flow (multiple early exits, dependencies between iterations) is harder to express in a chain and better served by an imperative loop.

**3. What real-world operation takes another operation as input?**

Many. A recipe that says "cook until done" takes a doneness test as an input — the cook checks the food periodically using a criterion provided by the recipe. A delivery service takes a delivery action as input (leave at door, require signature, attempt once) — the logistics are fixed, the last-mile behavior is injected. A vending machine takes a product-selection action as input — the payment and dispensing mechanism is fixed, the specific product selection is provided by the user. In each case, the higher-order operation provides the framework (iteration, timing, sequencing) and the caller provides the specific behavior to execute within that framework. This separation — framework vs behavior — is exactly what `.map()`, `.filter()`, middleware pipelines, and the Strategy pattern implement in software.
