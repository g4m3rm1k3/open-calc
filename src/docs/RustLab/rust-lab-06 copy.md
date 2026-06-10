# Rust Web Server — LAB 06 — Traits, Generics, and Modules

**Prerequisites:** LAB 01–05. You understand variables, types, functions, loops, ownership, borrowing, structs, methods, enums, `Option<T>`, and `Result<T, E>`. You have a working guessing game with graceful error handling.

**What this lab adds:**
- What a trait is — a named contract of behavior — and why this is Rust's answer to polymorphism
- Defining your own traits and implementing them on multiple types
- Generic functions — writing code that works on any type that satisfies a contract
- The `Display` and `Debug` traits fully explained — you have used them, now you understand them
- Modules — splitting code across files, controlling what is public and what is private
- The `pub` keyword and Rust's visibility system
- Splitting the guessing game into a proper multi-file project: `main.rs`, `game.rs`, `error.rs`

**Time:** 4–6 hours. The concepts in this lab — traits and generics — are the foundation of almost everything in the Rust standard library and every crate you will ever use. Reading carefully here pays forward through every remaining lab.

---

> **Quick Check — try to answer before reading further:**
>
> 1. You have used `println!("{}", value)` with integers, strings, and now `GuessError`. How do you think Rust knows how to format all of them — they are completely different types?
> 2. A function `fn largest(a: i32, b: i32) -> i32` works only for `i32`. What would you need to write a single function that works for any comparable type — `i32`, `f64`, `char`, and types you have not even defined yet?
> 3. Right now all our code is in one file — `main.rs`. As a project grows to thousands of lines, what organizational problems do you think arise?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the guessing game's code is split across three files — organized the way a real Rust project is organized. The game plays identically. The change is entirely structural:

```
src/
├── main.rs       ← entry point, game loop — ~30 lines
├── game.rs       ← GameState struct and impl — the core logic
└── error.rs      ← GuessError enum and Display impl — the error types
```

You will also define a `Describable` trait and implement it on both `GameState` and `GuessError` — a hands-on demonstration of how traits enable one function to work across completely different types.

---

## Part 1 — The Problem Traits Solve

In Lab 04, `GameState` and `GuessError` both got `#[derive(Debug)]`. In Lab 05, you implemented `fmt::Display` for `GuessError`. You used these without fully understanding what they are. Now you will.

Consider this situation. You want a single function that prints a summary of any game-related type — `GameState`, `GuessError`, or any new type you add later. Without traits, you need a separate function for each type:

```rust
fn summarize_game(state: &GameState)   { /* ... */ }
fn summarize_error(err: &GuessError)   { /* ... */ }
fn summarize_round(round: &RoundInfo)  { /* ... */ }
```

Three functions doing structurally the same job. Every new type needs a new function. Nothing in the language enforces that all of them do the same thing. Nothing stops you from naming them inconsistently. Nothing lets you write one function that accepts all of them.

Traits solve this. Define a contract — "any type that implements `Describable` must have a `describe()` method" — and then write one function that accepts any type satisfying that contract.

---

## Part 2 — Traits

### Concept: Trait — A Named Contract of Behavior

**What it is:** A trait is a named set of method signatures. Any type that implements the trait must provide those methods. Code that depends on a trait can work with any type that implements it — without knowing which specific type.

**What it hides:** A trait hides the specific type behind a common interface. A function that accepts `impl Describable` does not know whether it is receiving a `GameState` or a `GuessError`. It only knows that whatever it received can be described. The details of *how* description works are hidden inside each type's `impl Describable` block.

The invariant traits protect: **every type implementing a trait must provide complete, working implementations of all required methods.** The compiler verifies this. You cannot implement a trait halfway and ship it. If the trait requires three methods and you only provide two, the code does not compile.

**The analogy — a legal contract:**

A contract says: "any party signing this contract agrees to provide services A, B, and C." It does not say who the party is — a company, an individual, a partnership. Any party that signs and fulfills the contract is interchangeable from the contract's perspective.

A trait works the same way. The trait is the contract. The types that implement it are the parties. Code that uses the trait does not care which party it is working with — only that the contract is fulfilled.

**Canonical example (General Explanation):**

```rust
trait Greet {                          // define the contract
    fn hello(&self) -> String;         // required method — must be implemented
    fn goodbye(&self) -> String {      // optional method — has a default implementation
        String::from("Goodbye!")       // types can override this or use the default
    }
}

struct English;
struct Spanish;

impl Greet for English {
    fn hello(&self) -> String {
        String::from("Hello!")
    }
    // goodbye() uses the default — no need to implement it
}

impl Greet for Spanish {
    fn hello(&self) -> String {
        String::from("¡Hola!")
    }
    fn goodbye(&self) -> String {      // override the default
        String::from("¡Adiós!")
    }
}

fn greet_someone(greeter: &impl Greet) {  // accepts ANY type implementing Greet
    println!("{}", greeter.hello());
}

greet_someone(&English);  // prints: Hello!
greet_someone(&Spanish);  // prints: ¡Hola!
```

**The `impl Greet` parameter syntax:** `&impl Greet` means "a reference to any type that implements `Greet`." The function does not know or care which specific type it receives — only that the type satisfies the `Greet` contract.

**Default method implementations:** A trait can provide a default implementation for any method. Types that implement the trait can choose to use the default or override it with their own. This is how `#[derive(Debug)]` works — `Debug` has a default formatting algorithm that most types can use. `Display` has no default — you must provide your own, because there is no universal way to format a type for human consumption.

**Watch for:** Rust's traits are similar to interfaces in Java or C#, and similar to type classes in Haskell. If you encounter these concepts elsewhere, the mental model transfers. The key difference from Java interfaces: Rust traits can have default implementations, and you can implement a trait on types you did not define — including types from the standard library.

---

### Concept: `impl Trait for Type` — Implementing a Trait

**What it is:** The syntax for providing a trait's required methods for a specific type.

**The syntax:**

```rust
trait TraitName {
    fn required_method(&self) -> ReturnType;
}

impl TraitName for TypeName {
    fn required_method(&self) -> ReturnType {
        // implementation here
    }
}
```

**The rules:**
- You must implement every required method — methods without a default
- Optional methods (with defaults) can be omitted or overridden
- The method signatures must match exactly — same parameter types, same return type
- You can implement a trait for any type you own. You can also implement a foreign trait (from a library) on your own type, or your own trait on a foreign type — but not both foreign at the same time (this prevents conflicts between libraries)

**Project Application:**

We will define a `Describable` trait with one required method:

```rust
trait Describable {
    fn describe(&self) -> String;
}
```

Then implement it on both `GameState` and `GuessError`. Both types become describable through the same interface.

---

### Step 1 — Define the `Describable` Trait

Open the `guessing_game_v2` project. For now, add the trait to the top of `src/main.rs`, above the other definitions:

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;
use std::fmt;

trait Describable {                          // ← define the contract
    fn describe(&self) -> String;            // ← one required method: returns a String description
                                             //   no default — every type must provide its own
}
```

**Why `-> String` instead of `-> &str`?** We could return `&str` (a string reference), but the lifetime rules would require the returned reference to live as long as `&self`. Returning `String` (an owned, heap-allocated string) avoids this constraint — the caller owns the returned string and can use it freely. We will understand lifetimes fully in Lab 07.

---

### Step 2 — Implement `Describable` for `GuessError`

Add the implementation below `impl fmt::Display for GuessError`:

```rust
impl Describable for GuessError {
    fn describe(&self) -> String {
        match self {
            GuessError::NotANumber =>
                String::from("Error: input was not a number"),
            GuessError::OutOfRange(n) =>
                format!("Error: {} is outside the valid range 1–100", n),
                // format! works like println! but returns a String instead of printing
            GuessError::TooManyInvalidAttempts =>
                String::from("Error: too many invalid attempts in a row"),
        }
    }
}
```

**`format!` — the silent `println!`:**

`format!` takes the same arguments as `println!` but returns a `String` instead of printing to the terminal. Use it whenever you need to build a formatted string to store, pass to a function, or return from a method.

```rust
let name = "Ada";
let score = 42;
let message = format!("{} scored {} points", name, score);
// message is now the String "Ada scored 42 points"
```

---

### Step 3 — Implement `Describable` for `GameState`

Add below the `impl GameState` block:

```rust
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
```

---

### Step 4 — Write a Generic Function Using `Describable`

Add this function below the trait implementations — before `generate_secret`:

```rust
fn print_description(item: &impl Describable) {  // ← accepts ANY type implementing Describable
    println!("[description] {}", item.describe()); // ← calls describe() — works on all Describable types
}
```

Now add two calls to `main()` to demonstrate it working on both types:

```rust
fn main() {
    let mut game = GameState::new();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    print_description(&game);   // ← GameState is Describable — this compiles

    loop {
        if game.is_over { break; }

        let guess_number = game.guesses_taken + 1;

        match get_guess(guess_number) {
            Err(e) => {
                print_description(&e);  // ← GuessError is also Describable — same function
                println!("{}\n", e);
            }
            Ok(guess) => {
                game.take_guess(guess);
            }
        }
    }

    print_description(&game);   // ← same function — different output because game ended

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

**You should see:**

```
I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

[description] Game in progress — 0 of 7 guesses used.

Guess 1: hello
[description] Error: input was not a number
that's not a number — enter a whole number

Guess 1: 50
Too high.

... (play to completion) ...

[description] Game over after 4 guesses. Player won.
Thanks for playing — well done!
```

**The key observation:** `print_description` is called with `&game` (a `&GameState`) and with `&e` (a `&GuessError`) — two completely different types. The function signature `&impl Describable` accepts both. The function body calls `.describe()` on whatever it receives. The compiler verified at compile time that both types implement `Describable`. This is polymorphism — one function, multiple types.

**Change something:** Add a second required method to `Describable`:

```rust
trait Describable {
    fn describe(&self) -> String;
    fn short_name(&self) -> String;   // ← add this
}
```

Try to compile. You will see an error for each type that now fails to implement the complete trait:

```
error[E0277]: the trait `Describable` is not implemented for `GameState`
note: `GameState` doesn't implement `Describable::short_name`
```

This is the trait contract enforcing itself. Remove `short_name` and recompile cleanly.

---

## Part 3 — Generics

### Concept: Generic Type Parameter — Code That Works on Any Type

**What it is:** A generic type parameter is a placeholder in a function, struct, or enum that is filled in with a specific type when the code is used. Generics let you write one piece of code that works correctly for many types.

**The problem before:**

```rust
fn largest_i32(a: i32, b: i32) -> i32 {
    if a > b { a } else { b }
}

fn largest_f64(a: f64, b: f64) -> f64 {
    if a > b { a } else { b }
}
```

The logic is identical. The only difference is the type. Without generics, you write the same logic once per type — infinitely. With generics, you write it once and the compiler generates the type-specific versions for you.

**The syntax:**

```rust
fn largest<T>(a: T, b: T) -> T {
//        ↑
//        T is a type parameter — a placeholder name (T for "Type" by convention)
//        a, b, and the return value all have type T — whatever T turns out to be
    if a > b { a } else { b }
}
```

**But this does not compile yet.** The problem: `a > b` uses the `>` operator, which not every type supports. You cannot compare two `Vec`s with `>`. You need to constrain what `T` can be — "T must be a type that supports comparison." That constraint is expressed with a trait bound.

**The trait bound — constraining what T can be:**

```rust
fn largest<T: PartialOrd>(a: T, b: T) -> T {
//              ↑
//              trait bound: T must implement PartialOrd
//              PartialOrd is the trait that provides >, <, >=, <=
    if a > b { a } else { b }
}
```

`T: PartialOrd` is a **trait bound** — a requirement placed on the type parameter. "T can be any type, as long as that type implements `PartialOrd`." The compiler checks every use of `largest` against this constraint. `largest(5, 3)` compiles because `i32` implements `PartialOrd`. `largest(vec![1], vec![2])` fails because `Vec<i32>` does not implement `PartialOrd`.

**What happens at compile time — monomorphization:**

When you call `largest(5, 3)`, the compiler creates a concrete function `largest_i32` behind the scenes. When you call `largest(3.14, 2.72)`, it creates `largest_f64`. This process is called **monomorphization** — making the generic code concrete for each type it is used with.

The cost: the compiled binary contains one copy of the function per type it was used with. This is a code size tradeoff. The benefit: **zero runtime overhead** — generic code in Rust is as fast as hand-written type-specific code. There is no boxing, no virtual dispatch, no runtime type checking. The compiler resolved everything at compile time.

**Canonical example (General Explanation):**

```rust
fn print_twice<T: std::fmt::Display>(value: T) {
//                 ↑
//                 T must implement Display (printable with {})
    println!("{}", value);
    println!("{}", value);
}

print_twice(42);          // T = i32   — compiles because i32: Display
print_twice("hello");     // T = &str  — compiles because &str: Display
print_twice(true);        // T = bool  — compiles because bool: Display
```

**Generics in structs and enums:**

You have already used generic types without knowing it:

```rust
Option<T>          // T is the type of the value that might be present
Result<T, E>       // T is the success type, E is the error type
Vec<T>             // T is the type of elements in the list (Lab 07)
```

These are all generic types. `Option<i32>` is `Option` with `T` filled in as `i32`. The standard library defines them once with generics; you use them with any type.

**Project Application:**

We will write a generic `print_twice` in the challenge. More importantly, understanding generics lets you read standard library documentation — nearly every useful function in Rust is generic. `Vec::push<T>`, `HashMap::insert<K, V>`, `Iterator::map<B, F>` — all generic. Without this concept, the standard library is impenetrable.

**Watch for:** Multiple trait bounds use `+`:

```rust
fn print_and_compare<T: Display + PartialOrd>(a: T, b: T) {
    println!("{} vs {}", a, b);
    if a > b { println!("first is larger"); }
}
```

`T: Display + PartialOrd` means "T must implement both Display and PartialOrd."

---

### Concept: `where` Clauses — Cleaner Trait Bounds

**What it is:** A `where` clause moves trait bounds out of the angle brackets and onto separate lines — improving readability when bounds become complex.

**The problem before:** With many bounds, the function signature becomes hard to read:

```rust
fn complex<T: Display + PartialOrd + Clone, U: Debug + Default>(a: T, b: U) -> T { ... }
```

**The solution — `where` clause:**

```rust
fn complex<T, U>(a: T, b: U) -> T
where
    T: Display + PartialOrd + Clone,   // bounds on T — each on its own line
    U: Debug + Default,                // bounds on U
{
    // body
}
```

Same meaning, dramatically more readable. Use `where` whenever a function has more than two type parameters or more than one bound per parameter. The standard library uses `where` clauses extensively — you will see them in documentation.

---

## Part 4 — Modules

### Concept: Module — A Named Scope for Organizing Code

**What it is:** A module is a named container that groups related definitions — functions, structs, enums, traits, and other modules — under one name. Modules control visibility (what outside code can access) and prevent name collisions (two things named `Error` in different modules do not conflict).

**What it hides:** A module hides its internal implementation details from outside code. The internals are private by default. Only what you explicitly mark `pub` (public) is accessible outside the module. This is Rust's encapsulation mechanism — the same concept as "private" and "public" in object-oriented languages, but applied at the module level rather than the class level.

The invariant modules protect: **private items are only accessible within the module that defines them.** Outside code cannot reach in and use internal helpers, access raw fields, or call implementation details. This enforces the separation between interface (what you promise to support) and implementation (how you do it).

**The module system — three forms:**

**Form 1 — Inline module:**

```rust
mod math {                        // define a module called math
    pub fn add(a: i32, b: i32) -> i32 {   // pub: visible outside the module
        a + b
    }

    fn internal_helper() { }     // no pub: only visible inside math
}

math::add(3, 4);                 // :: to access items inside a module
```

**Form 2 — File module (the one you will use):**

Create a file `src/math.rs`. Everything in that file is the `math` module. In `main.rs`, declare the module:

```rust
mod math;                        // tells Rust: load the module from src/math.rs

math::add(3, 4);
```

**Form 3 — Directory module:**

Create a folder `src/math/` with a file `src/math/mod.rs`. Everything in `mod.rs` defines the `math` module. Submodules go in other files inside the `math/` folder. We will use this structure when the web server grows large enough.

**The `pub` keyword:**

```rust
pub struct GameState { ... }     // the type is public — outside modules can use it
pub fn new() -> GameState { ... } // the function is public

struct InternalCache { ... }     // private — only visible inside this module
```

**Visibility rules:**
- Everything is private by default
- `pub` makes an item visible to the parent module
- `pub(crate)` makes an item visible everywhere in the crate but not to outside users
- `pub(super)` makes an item visible to the parent module only
- Struct fields are private by default — even if the struct itself is `pub`

**Struct field visibility:**

```rust
pub struct GameState {
    pub max_guesses: u32,     // public field — readable and writable from outside
    secret: i32,              // private field — only accessible inside this module
}
```

Making `secret` private means outside code cannot read the secret number directly — only through methods you provide. This is encapsulation enforced by the compiler.

**The `use` keyword in modules:**

`use` brings items into scope so you do not have to write the full path every time:

```rust
use std::cmp::Ordering;     // instead of writing std::cmp::Ordering everywhere

// After use:
Ordering::Less              // works
// Without use:
std::cmp::Ordering::Less    // also works but verbose
```

---

## Part 5 — Splitting the Project Into Files

Now you will reorganize the guessing game into three files. This is not about changing what the game does — it is about organizing the code the way a real project is organized. Every Rust project you see in the wild uses this structure.

**The target structure:**

```
src/
├── main.rs     ← game loop, entry point
├── game.rs     ← GameState struct, impl GameState, impl Describable for GameState
└── error.rs    ← GuessError enum, impl Display, impl Describable for GuessError
```

### Step 5 — Create `src/error.rs`

Create a new file: `src/error.rs`. Move the error-related code into it:

```rust
// src/error.rs — everything related to guess errors

use std::fmt;                          // needed for Display implementation
use crate::game::Describable;          // ← import Describable from the game module
                                       //   crate:: means "start from the root of this crate"
                                       //   crate::game::Describable = the Describable trait
                                       //   defined in src/game.rs

#[derive(Debug)]
pub enum GuessError {                  // ← pub: main.rs needs to use this type
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
```

**`crate::` — the path to your own crate's root:**

`crate` refers to the root of the current project — `src/main.rs` in a binary project. `crate::game::Describable` means: starting from the crate root, go into the `game` module, and find `Describable` there. This is the absolute path within your project.

---

### Step 6 — Create `src/game.rs`

Create a new file: `src/game.rs`. Move all game logic into it:

```rust
// src/game.rs — GameState and the Describable trait

use rand::Rng;                         // needed for generate_secret
use std::cmp::Ordering;               // needed for match in take_guess

// ── The Describable trait ─────────────────────────────────────────────────────

pub trait Describable {               // ← pub: error.rs needs to implement this trait
    fn describe(&self) -> String;
}

// ── GameState ─────────────────────────────────────────────────────────────────

#[derive(Debug)]
pub struct GameState {                // ← pub: main.rs constructs and uses GameState
    pub max_guesses:   u32,           // ← pub field: main.rs reads this for the intro message
    pub is_over:       bool,          // ← pub field: main.rs checks this to control the loop
    pub guesses_taken: u32,           // ← pub field: main.rs uses this for the guess prompt
    secret:            i32,           // ← private: no outside code should read the secret
    last_guess:        Option<i32>,   // ← private: internal detail of take_guess
}

impl GameState {

    pub fn new() -> GameState {       // ← pub: main.rs calls GameState::new()
        GameState {
            secret:        generate_secret(),
            guesses_taken: 0,
            max_guesses:   7,
            is_over:       false,
            last_guess:    None,
        }
    }

    pub fn take_guess(&mut self, guess: i32) { // ← pub: main.rs calls this
        self.guesses_taken += 1;
        self.last_guess = Some(guess);

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

    pub fn is_won(&self) -> bool {    // ← pub: main.rs calls this for the farewell message
        self.is_over && self.guesses_taken <= self.max_guesses
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

// ── Internal helper ───────────────────────────────────────────────────────────

fn generate_secret() -> i32 {         // ← no pub: only game.rs uses this
    rand::thread_rng().gen_range(1..=100)
}
```

**Why is `secret` private?**

`secret` is the information the player is trying to discover. If `secret` were `pub`, any code could read `game.secret` and immediately know the answer — defeating the point of the game. Making it private enforces the rule through the type system: the secret is only revealed when the game is over (through the `is_over` message printed by `take_guess`). Outside code cannot cheat.

This pattern — private fields, public methods — is the fundamental mechanism of encapsulation. The methods define what outside code is allowed to do with a `GameState`. The fields define how `GameState` works internally. The module boundary is the wall between them.

---

### Step 7 — Rewrite `src/main.rs`

Replace the entire contents of `main.rs` with a clean entry point:

```rust
// src/main.rs — entry point and game loop

mod game;                              // ← declare the game module — loads src/game.rs
mod error;                             // ← declare the error module — loads src/error.rs

use std::io;                           // for stdin, stdout, flush
use game::{GameState, Describable};    // ← bring GameState and Describable into scope
use error::GuessError;                 // ← bring GuessError into scope

fn get_guess(guess_number: u32) -> Result<i32, GuessError> {
    print!("Guess {}: ", guess_number);
    io::stdout().flush()
        .expect("Could not flush stdout");

    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read line");

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
    println!("[description] {}", item.describe());
}

fn main() {
    let mut game = GameState::new();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    print_description(&game);
    println!();

    let mut consecutive_invalid: u32 = 0;

    loop {
        if game.is_over { break; }

        let guess_number = game.guesses_taken + 1;

        match get_guess(guess_number) {
            Err(e) => {
                print_description(&e);
                println!("{}\n", e);
                consecutive_invalid += 1;
                if consecutive_invalid >= 3 {
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

**`use game::{GameState, Describable}`:**

The curly braces here are a **use glob** — a shorthand for importing multiple items from the same module in one line. It is equivalent to:

```rust
use game::GameState;
use game::Describable;
```

Both forms are valid. The grouped form is more compact.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

[description] Game in progress — 0 of 7 guesses used.

Guess 1: hello
[description] Error: input was not a number
that's not a number — enter a whole number

Guess 1: 50
Too high.

... (play to the end) ...

[description] Game over after 4 guesses. Player won.

Thanks for playing — well done!
```

**Verify the file structure worked:**

```
cargo build 2>&1
```

You should see three compilation steps — the compiler processes `error.rs`, `game.rs`, and `main.rs` separately and links them:

```
   Compiling guessing_game_v2 v0.1.0
    Finished dev profile
```

**Try accessing a private field.** Add this line to `main()`:

```rust
println!("{}", game.secret);   // ← try to read the private field
```

**You should see:**

```
error[E0616]: field `secret` of struct `GameState` is private
```

Remove the line. This is encapsulation working — `main.rs` cannot read `secret` because it is not in the `game` module and the field has no `pub`.

**Change something:** Change `secret: i32` to `pub secret: i32` in `game.rs`. Now `println!("{}", game.secret)` compiles. Observe the secret number printed before each guess. Change it back to private — put the wall back.

---

## Part 6 — The Standard Library's Most Important Traits

You have implemented two traits. The standard library defines hundreds. Here are the ones you will encounter most in this series — understanding them now means you can read standard library documentation.

### Concept: Standard Traits — The Common Language of Rust Types

**What they are:** Standard library traits are contracts that the Rust ecosystem recognizes. Types that implement them gain capabilities — printability, comparison, copying, iteration. They are the vocabulary every Rust programmer shares.

| Trait | Provides | How to get it | Used by |
|---|---|---|---|
| `Display` | `{}` formatting | Manual `impl` | `println!`, `format!`, `to_string()` |
| `Debug` | `{:?}` formatting | `#[derive(Debug)]` | Development output |
| `Clone` | `.clone()` | `#[derive(Clone)]` | Explicit deep copy |
| `Copy` | Implicit copy instead of move | `#[derive(Copy, Clone)]` | `i32`, `bool`, `char`, small types |
| `PartialEq` | `==` and `!=` | `#[derive(PartialEq)]` | Comparisons, testing |
| `PartialOrd` | `<`, `>`, `<=`, `>=` | `#[derive(PartialOrd)]` | Sorting, comparisons |
| `Default` | `TypeName::default()` | `#[derive(Default)]` | Zero/empty values |
| `Iterator` | `.map()`, `.filter()`, `.collect()`, etc. | Manual `impl` | All iteration |
| `From`/`Into` | Type conversion | Manual `impl` | Converting between types |

**Why `PartialEq` and not `Eq`?** `Eq` requires that equality is reflexive (`a == a` is always true), symmetric (`a == b` implies `b == a`), and transitive (`a == b` and `b == c` implies `a == c`). `f64` cannot implement `Eq` because `f64::NAN != f64::NAN` — a float "not a number" is not equal to itself, violating reflexivity. `PartialEq` relaxes the reflexivity requirement. For integers and most types, `PartialEq` and `Eq` are equivalent — but the distinction exists for mathematical correctness.

**`Copy` vs `Clone`:**

`Copy` means the type is copied implicitly when assigned — no explicit `.clone()` needed. A type can only be `Copy` if all its fields are `Copy`. `String` is not `Copy` because it owns heap memory — implicit copy would silently allocate new heap memory everywhere, hiding a performance cost. Rust requires heap allocations to be explicit (`.clone()`). Stack-only types (`i32`, `bool`, `char`, small arrays) are `Copy` because copying them is just duplicating a few bytes with no heap involvement.

---

## 🎯 Challenge: Add `#[derive(PartialEq)]` and Use It

**You know:** Traits, `derive`, `match`, `impl` blocks.

**Task:** Rust's derived `PartialEq` lets you compare two instances of a type with `==`. Do the following:

1. Add `#[derive(PartialEq)]` to `GuessError`
2. Write a function `fn is_input_error(e: &GuessError) -> bool` in `error.rs` that returns `true` if the error is `NotANumber` or `OutOfRange`, and `false` if it is `TooManyInvalidAttempts`
3. Use it in `main.rs` to print a different message when the error is `TooManyInvalidAttempts` versus other errors

**The new logic in `main()`:**

```rust
Err(e) => {
    if error::is_input_error(&e) {
        println!("{}\n", e);           // ← regular input error message
    } else {
        println!("Game terminated: {}\n", e); // ← termination message
    }
    // ... rest of error handling
}
```

**Hint:** `is_input_error` can use `matches!` — a macro that checks if a value matches a pattern and returns a `bool`:

```rust
matches!(e, GuessError::NotANumber | GuessError::OutOfRange(_))
// returns true if e is either NotANumber or OutOfRange (with any value)
```

Or use a plain `match`:

```rust
match e {
    GuessError::TooManyInvalidAttempts => false,
    _ => true,
}
```

Try both. The `matches!` version is more concise. The `match` version is more explicit.

---

<details>
<summary>▶ Show Solution</summary>

In `src/error.rs`, add `PartialEq` to the derive and add the function:

```rust
#[derive(Debug, PartialEq)]           // ← add PartialEq
pub enum GuessError {
    NotANumber,
    OutOfRange(i32),
    TooManyInvalidAttempts,
}

// ... existing Display and Describable impls unchanged ...

pub fn is_input_error(e: &GuessError) -> bool {   // ← pub so main.rs can call it
    matches!(e, GuessError::NotANumber | GuessError::OutOfRange(_))
    //                                 ↑
    //                                 | inside matches! means OR — matches either pattern
}
```

In `src/main.rs`, update the error arm:

```rust
Err(e) => {
    if error::is_input_error(&e) {
        print_description(&e);
        println!("{}\n", e);
    } else {
        println!("Game terminated: {}\n", e);
        game.is_over = true;
    }
    consecutive_invalid += 1;
    if consecutive_invalid >= 3 && !game.is_over {
        println!("Too many invalid attempts. Game over.");
        game.is_over = true;
    }
}
```

**Key insight:** `matches!` is a concise way to check whether a value matches one of several patterns without a full `match` block. It returns `bool`. The `|` inside `matches!` is pattern alternation — "matches this pattern OR that pattern." This is different from `||` (logical OR for booleans) — `|` is for pattern alternatives in `match` arms and `matches!`. You will see pattern alternation again when we build the HTTP request parser, where a single `match` arm often needs to handle several related cases.

</details>

---

## 🎯 Challenge 2: Implement `Default` for `GameState`

**You know:** Traits, `impl Trait for Type`, associated functions, struct construction.

**Task:** Implement the `Default` trait for `GameState`. The `Default` trait requires one method:

```rust
fn default() -> Self;   // Self means "this type" — equivalent to writing GameState here
```

When implemented, `GameState::default()` becomes an alternative to `GameState::new()` that follows a universal convention — any Rust code that knows about `Default` can create a default instance without knowing anything specific about `GameState`.

```rust
// After implementing Default, both of these work:
let game = GameState::new();      // your custom constructor
let game = GameState::default();  // the Default trait constructor
```

**Hint:** The implementation is one line — call `GameState::new()` and return it. `Default::default()` and `YourType::new()` often do the same thing — `Default` just provides the universal entry point.

---

<details>
<summary>▶ Show Solution</summary>

In `src/game.rs`:

```rust
impl Default for GameState {
    fn default() -> Self {   // Self = GameState — Rust substitutes the actual type name
        GameState::new()     // delegate to new() — keep the logic in one place
    }
}
```

In `main.rs`, you can now use either:

```rust
let mut game = GameState::default();  // works through the Default trait
let mut game = GameState::new();      // still works — both are valid
```

**Key insight:** `Default` matters most when writing generic code. A function `fn reset<T: Default>(item: &mut T)` can reset any type to its default state without knowing what the type is. In our web server, we will use `Default` for request parser state — a parser starts in a known empty state, processes data, and can be reset to that state between requests. Implementing `Default` for the parser state means generic reset code works without modification.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Three-file structure compiles | `cargo build` — no errors |
| `GameState` in `game.rs` works | Game plays normally — logic unchanged |
| `GuessError` in `error.rs` works | Invalid input shows correct error messages |
| `secret` field is private | Add `game.secret` to `main.rs` — compile error |
| `Describable` trait works on `GameState` | `[description] Game in progress...` prints at start |
| `Describable` trait works on `GuessError` | `[description] Error:...` prints on invalid input |
| `print_description` accepts both types | Both `&game` and `&e` passed to same function |
| `Describable` at end reflects game over | `[description] Game over after N guesses...` at end |
| `use` imports work across files | No "unresolved import" errors |
| `format!` builds strings correctly | Description strings contain correct values |

---

## Quick Check Answers

**1. How does Rust know how to format completely different types with `{}`?**

Every type that works with `{}` implements the `Display` trait — specifically, the `fmt` method on `fmt::Display`. When the compiler sees `println!("{}", value)`, it checks whether `value`'s type implements `Display`. If it does, it calls that type's `fmt` method to produce the formatted string. If it does not, the code fails to compile: "the trait `Display` is not implemented for `YourType`." Integers, strings, booleans, and `GuessError` can all be printed with `{}` because they all implement `Display` — either through the standard library's built-in implementations or through our custom `impl fmt::Display for GuessError`. The compiler resolves which implementation to call at compile time, with no runtime overhead.

**2. What would you need to write a single function that works for any comparable type?**

Two things: a type parameter (a placeholder `T` that represents "some type") and a trait bound constraining what `T` can be. `fn largest<T: PartialOrd>(a: T, b: T) -> T` uses `T` as the placeholder and `PartialOrd` as the constraint — "T can be any type that supports `<` and `>`." The compiler generates a concrete version of this function for every type it is called with (`i32`, `f64`, `char`, and so on). This process — monomorphization — happens at compile time, so generic code is as fast as hand-written type-specific code with zero runtime overhead.

**3. What organizational problems arise as a project grows to thousands of lines in one file?**

Four interconnected problems. First, navigation: finding a specific function or struct requires scrolling through thousands of lines or searching by name — neither scales. Second, coupling: when all code is in one file, it is easy for functions to call each other in ways that create invisible dependencies. Moving to separate files forces dependencies to be explicit — you cannot call `generate_secret()` from `main.rs` unless it is `pub` and imported. Third, compilation: Rust recompiles files that change. With one file, any change recompiles everything. With multiple files, only changed modules recompile — faster iteration. Fourth, collaboration: two people cannot easily edit the same file simultaneously without conflicts. Separate files let different parts of a codebase be owned by different team members.
