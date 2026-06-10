# Rust Web Server — LAB 04 — Structs, Methods, and Modeling the World

**Prerequisites:** LAB 01–03. You understand variables, types, functions, loops, ownership, borrowing, and references. You have built a working guessing game organized into functions.

**What this lab adds:**
- What a struct is and why grouping data matters — the concept of a record
- How the compiler lays a struct out in memory
- Defining and instantiating your own custom types
- Methods — functions that belong to a type, called with dot notation
- `impl` blocks — where methods live
- Associated functions — functions on a type that do not operate on an instance
- A mental model of object-oriented thinking and where Rust agrees and disagrees with it
- A `GameState` struct that replaces the loose variables in `main()`, making the guessing game's data coherent and self-documenting

**Time:** 3–5 hours

---

> **Quick Check — try to answer before reading further:**
>
> 1. The guessing game in Lab 03 has `secret`, `guesses_taken`, and `MAX_GUESSES` as separate variables in `main()`. What problem do you think arises when a program has dozens or hundreds of related variables floating around separately?
> 2. A function called `check_guess` takes a guess and a secret. A method called `.check(guess)` is called on a game state object. What do you think the practical difference is between these two approaches?
> 3. Languages like Python and Java are called "object-oriented." Rust is not — but it has structs and methods. What do you think "object-oriented" means, and why might Rust have chosen a different path?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the guessing game's data is managed by a `GameState` struct. The loose variables scattered across `main()` become a single coherent object. The game plays identically — but the code now has the shape of a real program:

```
$ cargo run

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1: 50
Too high.

Guess 2: 25
Too low.

Guess 3: 37
Too high.

Guess 4: 30
Too low.

Guess 5: 33
Correct! You got it in 5 guesses.

Thanks for playing!
```

Same output. The transformation is in the structure underneath.

---

## Part 1 — The Problem With Loose Variables

Look at `main()` from Lab 03:

```rust
fn main() {
    let secret = generate_secret();
    let mut guesses_taken: u32 = 0;

    // ...loop that uses both secret and guesses_taken...
}
```

Now imagine the game grows. You want to:
- Track the player's guess history (an array of past guesses)
- Track whether the player won or lost
- Track the time each guess took
- Support multiple rounds

You would add more variables: `guess_history`, `player_won`, `guess_times`, `rounds_played`. `main()` becomes a wall of `let` declarations. Passing these to functions requires passing each one individually:

```rust
fn show_summary(secret: i32, guesses_taken: u32, guess_history: [i32; 7], player_won: bool) {
    // four parameters — all logically related, but the language does not know that
}
```

If you add a fifth piece of data, you update every function signature. If you pass them in the wrong order, the compiler might not catch it (what if two parameters have the same type?). The data is logically one thing — the state of a game — but the code treats it as a bag of unrelated variables.

This is the problem structs solve.

---

## Part 2 — Structs

### Concept: Struct — A Named Group of Related Data

**What it is:** A struct (short for "structure") is a custom data type that groups related pieces of data under one name. Each piece of data inside a struct is called a **field**.

**What it hides:** A struct hides the individual fields behind a named type. Instead of passing five separate variables representing a game's state, you pass one `GameState`. The relationship between the fields is encoded in the type itself — the compiler knows they belong together.

The invariant structs protect: **all the fields of a struct are always present together.** You cannot have a `GameState` with a `secret` but no `guesses_taken`. Either you have the whole struct or you have nothing. This prevents the class of bugs where some related variables are updated but others are forgotten.

**Canonical example (General Explanation):**

A paper form. A job application has fields: name, address, phone number, years of experience. The fields are related — they all describe one applicant. A struct is that form as a data type: a named collection of fields that always travel together.

In the physical world: a playing card. It has two properties that always exist together: a suit (hearts, diamonds, clubs, spades) and a rank (2 through Ace). You would never store a card as two separate floating variables `suit` and `rank` — you would group them. A struct is that grouping.

**The syntax — defining a struct:**

```rust
struct StructName {
    field_name: FieldType,
    another_field: AnotherType,
}
```

**The syntax — creating an instance:**

```rust
let instance = StructName {
    field_name: some_value,
    another_field: another_value,
};
```

**The syntax — accessing fields:**

```rust
println!("{}", instance.field_name);  // dot notation to read a field
instance.another_field = new_value;   // dot notation to write (only if instance is mut)
```

**Project Application:**

We will define a `GameState` struct with four fields:

```rust
struct GameState {
    secret:        i32,   // the number the player is trying to guess
    guesses_taken: u32,   // how many guesses have been used
    max_guesses:   u32,   // the maximum allowed
    is_over:       bool,  // whether the game has ended
}
```

Everything `main()` needs to know about an in-progress game lives in one place.

**Watch for:** Struct definitions end each field with a comma, not a semicolon. The struct definition itself does not end with a semicolon either — it ends with `}`. Forgetting commas between fields is a common early mistake.

---

### Concept: Memory Layout of a Struct

**What it is:** A struct's fields are laid out sequentially in memory — one after another — in a single contiguous block.

**Why this matters:**

When you create a `GameState`, Rust allocates one block of memory large enough to hold all four fields. For our struct:

```
GameState in memory (on the stack):
┌─────────────────────────────────────┐
│ secret        (i32 — 4 bytes)       │ offset 0
│ guesses_taken (u32 — 4 bytes)       │ offset 4
│ max_guesses   (u32 — 4 bytes)       │ offset 8
│ is_over       (bool — 1 byte + pad) │ offset 12
└─────────────────────────────────────┘
Total: ~16 bytes (exact size may vary due to alignment)
```

**Alignment and padding:** CPUs read memory most efficiently when values are at addresses that are multiples of their size. An `i32` (4 bytes) is fastest at addresses divisible by 4. A `bool` (1 byte) can go anywhere. When a struct's fields would not naturally line up to these boundaries, Rust inserts **padding** — unused filler bytes — to align them correctly. This is automatic and invisible to you, but it explains why a struct's size is sometimes larger than the sum of its fields.

**Why this is fast:** Because all fields are contiguous in memory, accessing any field is a simple offset calculation from the struct's base address. The CPU often has the entire struct in its cache — a small, extremely fast memory sitting between RAM and the CPU — after accessing the first field. Accessing `game.guesses_taken` right after `game.secret` is nearly instant.

**What if a struct contains a `String`?** The `String` fields live on the heap (as you learned in Lab 03). The struct on the stack contains the pointer, length, and capacity — just like any `String` variable. The struct itself stays on the stack; the text data lives on the heap.

---

### Step 1 — Define `GameState` and Create an Instance

Open the `guessing_game_v2` project from Lab 03. We will extend it in place.

Add the struct definition at the top of `src/main.rs`, above the functions. Add it right after the `use` statements:

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;

struct GameState {                    // ← add this block: define the struct
    secret:        i32,               //   the secret number to guess
    guesses_taken: u32,               //   how many guesses used so far
    max_guesses:   u32,               //   maximum guesses allowed
    is_over:       bool,              //   true when the game has ended
}
```

Now update `main()` to create a `GameState` instance instead of loose variables:

```rust
fn main() {
    let mut game = GameState {        // ← create an instance — mut because fields will change
        secret:        generate_secret(), // ← call generate_secret() to fill this field
        guesses_taken: 0,             //   starts at zero — no guesses yet
        max_guesses:   7,             //   allow 7 guesses
        is_over:       false,         //   game is not over yet
    };

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses); // ← access field with dot
    println!();

    println!("DEBUG — secret: {}", game.secret);  // ← verify field access works
}
```

**What `mut` on the instance means:** The fields of a struct instance can only be changed if the instance itself is declared `mut`. Rust does not let you make individual fields mutable while the instance is immutable. Either the whole struct is mutable or none of it is. This is a deliberate design choice — it keeps mutability explicit and predictable.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

DEBUG — secret: 63
```

**Change something:** Change `game.max_guesses` to `game.is_over` in the `println!`. You will get a type error — `is_over` is a `bool` and `{}` can display it, but confirm you see `false` printed. Change it back.

**Change something else:** Try accessing a field that does not exist — `game.player_name`. The compiler gives you: `no field 'player_name' on type 'GameState'`. This is the struct's contract at work — you cannot use fields that were not declared. Change back.

---

## Part 3 — Methods

Right now, `generate_secret()`, `get_guess()`, and `check_guess()` are standalone functions that happen to work with game data. They take game data as parameters. There is nothing connecting them to `GameState` except convention.

Methods change this. A method is a function that belongs to a type. It is called with dot notation on an instance. The connection between the function and the type is formal — the compiler enforces it.

### Concept: Method

**What it is:** A method is a function defined inside an `impl` block for a specific type. It always receives the instance it is called on as its first parameter, named `self`.

**What it hides:** Methods hide the separation between data and the operations that act on it. Instead of `check_guess(guess, &game.secret)` — a function that takes game data as a parameter — you write `game.check(guess)` — a method that knows it operates on a `GameState`. The connection is in the type system, not just naming conventions.

The invariant methods protect: **a method can only be called on the type it belongs to.** `game.check(guess)` is impossible to accidentally call on a `String` or an `i32`. The compiler enforces this. In a large codebase, this catches a class of bugs where functions are called on the wrong data.

**The `impl` block:**

```rust
impl TypeName {
    fn method_name(&self) -> ReturnType {
        // self is a reference to the instance this method was called on
        // access fields with self.field_name
    }
}
```

**The three forms of `self`:**

| Form | Meaning | Use when |
|---|---|---|
| `&self` | Immutable reference to the instance | Reading fields — most common |
| `&mut self` | Mutable reference to the instance | Modifying fields |
| `self` | Takes ownership of the instance | Consuming the instance (rare) |

**Canonical example (General Explanation):**

```rust
struct Rectangle {
    width:  f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {          // borrows self — reads width and height
        self.width * self.height     // access fields through self
    }

    fn scale(&mut self, factor: f64) { // mutably borrows self — modifies fields
        self.width  *= factor;
        self.height *= factor;
    }
}

let mut rect = Rectangle { width: 4.0, height: 3.0 };
println!("{}", rect.area());   // prints: 12
rect.scale(2.0);               // doubles both dimensions
println!("{}", rect.area());   // prints: 48
```

`rect.area()` is syntactic sugar for `Rectangle::area(&rect)` — Rust automatically passes the instance as the first argument. You write the convenient form; the compiler handles the translation.

**Project Application:**

`GameState` will have three methods:
- `new()` — creates a fresh game (an associated function — explained next)
- `take_guess(&mut self, guess: i32)` — processes one guess, updates state
- `is_won(&self) -> bool` — returns whether the player has won

---

### Concept: Associated Function — A Method Without `self`

**What it is:** An associated function is a function defined inside an `impl` block that does NOT take `self` as a parameter. It belongs to the type but does not operate on an instance.

**Why it exists:** Some operations belong to a type conceptually but do not act on an existing instance — most commonly, creating a new instance. The function `GameState::new()` belongs to `GameState` (it creates one) but it cannot take `self` as a parameter (no instance exists yet to pass).

**The calling syntax:**

```rust
// methods use dot notation — called on an instance:
game.take_guess(42);

// associated functions use :: notation — called on the type itself:
let game = GameState::new();
```

The `::` is called the **path separator**. You have already seen it: `rand::thread_rng()`, `String::from("hello")`, `io::stdin()`. All of these are associated functions — functions that belong to a type or module but do not require an existing instance.

**Canonical example:**

```rust
impl Rectangle {
    fn new(width: f64, height: f64) -> Rectangle {  // no self — creates a Rectangle
        Rectangle { width, height }                  // field shorthand: when variable name
    }                                                // matches field name, just write the name once
}

let r = Rectangle::new(4.0, 3.0);  // :: notation — creates an instance
```

**The field shorthand:** When a variable has the same name as a struct field, you can write just the name once instead of `field: field`. `Rectangle { width, height }` is the same as `Rectangle { width: width, height: height }`. You will see this frequently in Rust.

**Watch for:** `String::from("hello")` is an associated function on `String`. `"hello".to_string()` is a method on `&str`. Both produce the same result. The associated function form makes it explicit you are constructing a new `String`; the method form transforms an existing value. Both are correct — style and context guide the choice.

---

## Part 4 — Building `impl GameState`

### Step 2 — Add the `impl` Block with `new()`

Below the `GameState` struct definition, add the `impl` block:

```rust
struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
}

impl GameState {                              // ← begin the impl block for GameState

    fn new() -> GameState {                   // ← associated function: creates a fresh game
        GameState {                           //   construct and return a GameState
            secret:        generate_secret(), //   generate the secret number
            guesses_taken: 0,                 //   no guesses taken yet
            max_guesses:   7,                 //   allow 7 guesses
            is_over:       false,             //   game is not over
        }
    }

}                                             // ← end of impl block
```

Now update `main()` to use `GameState::new()`:

```rust
fn main() {
    let mut game = GameState::new();          // ← :: notation — associated function call

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    println!("DEBUG — secret: {}", game.secret);
}
```

---

### SAVE AND TRY

```
cargo run
```

**You should see the same output as before.** The change is internal — `GameState::new()` now encapsulates the creation logic.

**Change something:** Add a second field to the debug output:

```rust
println!("DEBUG — secret: {}, max_guesses: {}", game.secret, game.max_guesses);
```

Verify both fields print correctly. Remove the second part — keep only `game.secret`. We will remove the DEBUG line entirely in the next step.

---

### Step 3 — Add the `take_guess` Method

Inside the `impl GameState` block, add `take_guess` after `new()`:

```rust
impl GameState {

    fn new() -> GameState {
        GameState {
            secret:        generate_secret(),
            guesses_taken: 0,
            max_guesses:   7,
            is_over:       false,
        }
    }

    fn take_guess(&mut self, guess: i32) {         // ← &mut self: we will modify guesses_taken and is_over
        self.guesses_taken += 1;                   // ← increment the guess counter

        match guess.cmp(&self.secret) {            // ← compare guess to secret through self
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
                self.is_over = true;               // ← mark the game as over — player won
            }
        }

        if self.guesses_taken >= self.max_guesses && !self.is_over {
            // ran out of guesses without winning
            // !self.is_over means "is_over is false" — ! is the boolean NOT operator
            println!("Out of guesses! The number was {}.", self.secret);
            self.is_over = true;                   // ← mark the game as over — player lost
        }
    }

}
```

**New concept — the `!` (NOT) operator:**

`!value` flips a boolean: `!true` is `false`, `!false` is `true`. The condition `!self.is_over` means "the game is not yet over." It is shorthand for `self.is_over == false`.

**Why check `!self.is_over` in the out-of-guesses block?** If the player's last guess is correct, `Ordering::Equal` sets `self.is_over = true` first. The out-of-guesses check then sees `self.is_over` is already `true` and skips the "out of guesses" message — which would be wrong to print after a correct guess.

Now update `main()` to call `take_guess`:

```rust
fn main() {
    let mut game = GameState::new();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    let guess = get_guess(game.guesses_taken + 1); // ← +1 because guesses_taken is 0-indexed before the call
    game.take_guess(guess);                        // ← method call — updates game state

    println!("Game over: {}", game.is_over);       // ← verify state was updated correctly
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

Type a number. Depending on your guess:

```
Guess 1: 50
Too high.

Game over: false
```

or if you happen to guess correctly:

```
Guess 1: 47
Correct! You got it in 1 guess!

Game over: true
```

**The key thing to verify:** After calling `game.take_guess(guess)`, the `game.is_over` field reflects the result. The method modified the struct's state through `&mut self`. This is the core of what methods provide — behavior that reads and writes the type's own data.

**Change something:** Comment out the `self.is_over = true` line inside `Ordering::Equal` temporarily:

```rust
Ordering::Equal => {
    println!("Correct! ...");
    // self.is_over = true;   // ← comment this out
}
```

Guess the correct number. Observe that `Game over: false` prints even after a correct guess. This shows what `is_over` does — the game does not know it ended. Uncomment it and run again to confirm.

---

### Step 4 — Add the `is_won` Method and Wire the Full Loop

Add `is_won` to the `impl` block:

```rust
impl GameState {

    fn new() -> GameState { /* ... same as before ... */ }

    fn take_guess(&mut self, guess: i32) { /* ... same as before ... */ }

    fn is_won(&self) -> bool {             // ← &self: read-only — just checks a condition
        self.is_over                       // ← if guesses_taken < max and is_over is true, they won
            && self.guesses_taken <= self.max_guesses
        // is_over is true for both win AND loss
        // is_won distinguishes: won = is_over AND guesses not exhausted
        // (if they ran out, guesses_taken == max_guesses when is_over was set to true)
    }

}
```

Now replace `main()` with the complete game loop:

```rust
fn main() {
    let mut game = GameState::new();        // ← create fresh game state

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    loop {
        if game.is_over {                   // ← check if game ended after last guess
            break;
        }

        let guess_number = game.guesses_taken + 1; // ← next guess number for the prompt
        let guess = get_guess(guess_number);        // ← read one guess from player

        game.take_guess(guess);             // ← process it — updates game state
    }

    if game.is_won() {                      // ← method call — reads state
        println!("Thanks for playing — well done!");
    } else {
        println!("Thanks for playing — better luck next time!");
    }
}
```

The complete `src/main.rs` with everything together:

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;

struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
}

impl GameState {

    fn new() -> GameState {
        GameState {
            secret:        generate_secret(),
            guesses_taken: 0,
            max_guesses:   7,
            is_over:       false,
        }
    }

    fn take_guess(&mut self, guess: i32) {
        self.guesses_taken += 1;

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
            println!("Out of guesses! The number was {}.", self.secret);
            self.is_over = true;
        }
    }

    fn is_won(&self) -> bool {
        self.is_over && self.guesses_taken <= self.max_guesses
    }

}

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

    let input = input.trim();

    input.parse().expect("Please type a number")
}

fn main() {
    let mut game = GameState::new();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    loop {
        if game.is_over {
            break;
        }

        let guess_number = game.guesses_taken + 1;
        let guess = get_guess(guess_number);

        game.take_guess(guess);
    }

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

Play the complete game. Verify:
- Numbered guesses 1 through 7
- "Too low." / "Too high." / "Correct!" all work
- Running out of guesses reveals the secret
- Winning shows "well done!" — losing shows "better luck next time!"
- Run it three times — different secret each time

**Change something:** Change `max_guesses: 7` in `GameState::new()` to `max_guesses: 3`. Run it. Three guesses only, and the welcome message automatically reflects this because it reads `game.max_guesses`. Change it back to `7`.

**A structural observation:** `main()` is now 15 lines. It reads almost like English:
- Create a game
- Print the intro
- Loop: if over, stop — otherwise get a guess and process it
- Print the farewell

The complexity of *how* each step works is inside `GameState`'s methods. `main()` only knows *what* to do, not *how* it is done. This is separation of concerns applied to a type.

---

## Part 5 — Object-Oriented Thinking and Where Rust Stands

### Mental Model: Object-Oriented Programming vs Rust's Approach

**What object-oriented programming (OOP) is:**

Object-oriented programming is a programming paradigm — a style of organizing code — built around the idea that a program is a collection of **objects**, each combining data (called **state**) and behavior (called **methods**) in one unit. OOP languages typically have three features:

| Feature | What it means |
|---|---|
| **Encapsulation** | Hiding the internal state of an object — outside code cannot directly read or write fields |
| **Inheritance** | One type can extend another, inheriting its fields and methods |
| **Polymorphism** | Different types can respond to the same method call in different ways |

**Where Rust agrees with OOP:**

Rust has structs (data) and `impl` blocks (behavior), which together behave like objects. Rust has **traits** (coming in Lab 05) which provide polymorphism — different types responding to the same interface. Rust has encapsulation through its module system and the `pub` keyword (coming in Lab 06).

**Where Rust disagrees with OOP:**

Rust has **no inheritance**. You cannot make `AdvancedGameState` extend `GameState` and inherit its fields and methods. This is deliberate. Inheritance in OOP creates tight coupling — `AdvancedGameState` knows the internals of `GameState`, and changes to `GameState` can break `AdvancedGameState` in ways that are hard to predict. Rust uses **composition** instead: if `AdvancedGameState` needs `GameState`'s data, it contains a `GameState` as a field, rather than extending it.

**The practical difference:**

```rust
// OOP inheritance (not valid Rust — shown for contrast):
// class AdvancedGame extends GameState { ... }

// Rust composition:
struct AdvancedGame {
    base:       GameState,    // contains a GameState — does not extend it
    hint_count: u32,          // additional fields
}
```

Composition is more explicit — `AdvancedGame` has to decide which of `GameState`'s behavior it exposes and how. This verbosity is the point: the relationship is clear, and changes to `GameState` do not silently affect `AdvancedGame`.

**Where this matters for your web server:**

Every major component of your web server will be a struct: `HttpRequest`, `HttpResponse`, `Router`, `Connection`, `ServerConfig`. Their relationships will be through composition and traits, not inheritance. Understanding this model now means the web server's architecture will make sense when we build it.

---

## Part 6 — Deriving Useful Behavior

### Concept: `derive` — Automatic Trait Implementations

**What it is:** `derive` is an attribute (a compiler instruction) that automatically generates standard implementations of certain traits for your struct.

**What a trait is** (preview — full coverage in Lab 05): A trait is a named set of methods that a type can implement. Think of it as a contract: "this type promises to support these operations." Certain traits are so common and mechanical that Rust can generate the implementation automatically.

**The most useful derived traits:**

| Trait | What it adds |
|---|---|
| `Debug` | Allows printing the struct with `{:?}` for debugging |
| `Clone` | Allows `.clone()` to make a full copy of the struct |
| `Copy` | Allows the struct to be copied instead of moved (only if all fields are `Copy`) |
| `PartialEq` | Allows comparing two instances with `==` and `!=` |

**The syntax:**

```rust
#[derive(Debug, Clone)]   // ← attribute: placed directly above the struct definition
struct GameState {
    // fields...
}
```

**Canonical example (General Explanation):**

```rust
#[derive(Debug)]
struct Point {
    x: f64,
    y: f64,
}

let p = Point { x: 3.0, y: 4.0 };
println!("{:?}", p);   // prints: Point { x: 3.0, y: 4.0 }
println!("{:#?}", p);  // prints with pretty formatting — each field on its own line
```

Without `#[derive(Debug)]`, `println!("{:?}", p)` is a compile error — Rust does not know how to format `Point` for debug output.

**Why `{:?}` instead of `{}`:** `{}` uses the `Display` trait — formatted for end users. `{:?}` uses the `Debug` trait — formatted for developers. `Debug` is automatically derived; `Display` must be implemented manually (we will do this in Lab 05).

**Project Application:**

Adding `#[derive(Debug)]` to `GameState` lets us print the entire game state in one line during development — invaluable for debugging.

---

### Step 5 — Add `derive` to `GameState`

Add the attribute directly above the struct definition:

```rust
#[derive(Debug)]                  // ← add this line: enables {:?} printing for GameState
struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
}
```

Now add a temporary debug line to `main()` to see the full game state:

```rust
fn main() {
    let mut game = GameState::new();

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    loop {
        if game.is_over {
            break;
        }

        let guess_number = game.guesses_taken + 1;
        let guess = get_guess(guess_number);

        game.take_guess(guess);

        println!("DEBUG state: {:?}", game); // ← add temporarily: print entire struct
    }

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

After each guess, you should see the full state:

```
Guess 1: 50
Too high.

DEBUG state: GameState { secret: 37, guesses_taken: 1, max_guesses: 7, is_over: false }

Guess 2: 25
Too low.

DEBUG state: GameState { secret: 37, guesses_taken: 2, max_guesses: 7, is_over: false }

Guess 3: 37
Correct! You got it in 3 guesses!

DEBUG state: GameState { secret: 37, guesses_taken: 3, max_guesses: 7, is_over: true }
```

**Observe:** Every field prints automatically. `is_over` flips to `true` after the correct guess. `guesses_taken` increments correctly.

**Change something:** Change `{:?}` to `{:#?}` for pretty-printed output:

```rust
println!("DEBUG state: {:#?}", game);
```

You will see:

```
DEBUG state: GameState {
    secret: 37,
    guesses_taken: 1,
    max_guesses: 7,
    is_over: false,
}
```

The pretty format is easier to read for structs with many fields. Change it back to `{:?}`. Then remove the entire DEBUG line — we no longer need it.

---

## 🎯 Challenge: Add a `HintMode` to `GameState`

**You know:** Structs, fields, `impl` blocks, methods, `&self`, `&mut self`, `if` statements.

**Task:** Add a `hints_enabled: bool` field to `GameState`. When hints are enabled, `take_guess` should print an extra line after "Too high." or "Too low." — a hint telling the player whether the secret number is even or odd.

Example output with hints enabled:

```
Guess 1: 50
Too high.
Hint: the number is odd.

Guess 2: 25
Too low.
Hint: the number is odd.

Guess 3: 37
Correct! You got it in 3 guesses!
```

**What you need:**

The modulo operator `%` — you have not formally seen this yet, so here is the definition:

**Math: Modulo `%` — The Remainder After Division**

**What it computes:** `a % b` gives the remainder when `a` is divided by `b`.

**The real-world analogy:** Clock arithmetic. After 12 o'clock, the clock does not show 13 — it wraps to 1. `13 % 12 = 1`. After 24 hours, it wraps to 0. `24 % 12 = 0`.

```
7 % 2 = 1    (7 divided by 2 is 3, remainder 1 — odd)
8 % 2 = 0    (8 divided by 2 is 4, remainder 0 — even)
```

To check if a number is even: `number % 2 == 0`
To check if a number is odd: `number % 2 != 0`

**Starting point — add the field:**

```rust
struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
    hints_enabled: bool,   // ← add this field
}
```

**Hints:**
1. Update `GameState::new()` to set `hints_enabled: true` (or `false` — your choice)
2. Inside `take_guess`, after printing "Too high." or "Too low.", check `self.hints_enabled` and if true, print the even/odd hint
3. The hint uses `self.secret % 2`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
#[derive(Debug)]
struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
    hints_enabled: bool,          // ← new field
}

impl GameState {

    fn new() -> GameState {
        GameState {
            secret:        generate_secret(),
            guesses_taken: 0,
            max_guesses:   7,
            is_over:       false,
            hints_enabled: true,  // ← enable hints by default
        }
    }

    fn take_guess(&mut self, guess: i32) {
        self.guesses_taken += 1;

        match guess.cmp(&self.secret) {
            Ordering::Less => {
                println!("Too low.");
                if self.hints_enabled {                       // ← check if hints are on
                    if self.secret % 2 == 0 {                // ← even check via modulo
                        println!("Hint: the number is even.");
                    } else {
                        println!("Hint: the number is odd.");
                    }
                }
                println!();
            }
            Ordering::Greater => {
                println!("Too high.");
                if self.hints_enabled {
                    if self.secret % 2 == 0 {
                        println!("Hint: the number is even.");
                    } else {
                        println!("Hint: the number is odd.");
                    }
                }
                println!();
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
            println!("Out of guesses! The number was {}.", self.secret);
            self.is_over = true;
        }
    }

    fn is_won(&self) -> bool {
        self.is_over && self.guesses_taken <= self.max_guesses
    }

}
```

**Key insight:** The hint logic is identical in the `Less` and `Greater` arms. This repetition is a signal — in a real program, you would extract it into a helper method `fn print_hint(&self)` and call it from both arms. That refactor is a good exercise: try extracting it now. The method signature is `fn print_hint(&self)` — it reads `self.secret` and `self.hints_enabled`, so it only needs `&self`.

</details>

---

## 🎯 Challenge 2: Add a `new_with_options` Associated Function

**You know:** Associated functions, struct construction, parameters, `bool`.

**Task:** Write a second associated function `GameState::new_with_options(max_guesses: u32, hints_enabled: bool) -> GameState` that creates a game with custom settings. Then use it in `main()` to create a game with 5 guesses and hints disabled:

```rust
let mut game = GameState::new_with_options(5, false);
```

**Hint:** The body is nearly identical to `new()` — the difference is that `max_guesses` and `hints_enabled` come from the parameters instead of being hardcoded.

Try it before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
fn new_with_options(max_guesses: u32, hints_enabled: bool) -> GameState {
    GameState {
        secret:        generate_secret(),
        guesses_taken: 0,
        max_guesses,            // ← field shorthand: parameter name matches field name
        is_over:       false,
        hints_enabled,          // ← field shorthand again
    }
}
```

In `main()`:

```rust
let mut game = GameState::new_with_options(5, false);
```

**Key insight:** Having both `new()` and `new_with_options()` is a common pattern. `new()` is the sensible default — most callers do not need to customize settings. `new_with_options()` is the escape hatch for callers that do. Both are associated functions — neither requires an existing instance. In Lab 06, when we add a configuration file to the web server, this same pattern will let us have `ServerConfig::default()` and `ServerConfig::from_file(path)`.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `GameState` struct compiles | `cargo build` — no errors |
| `GameState::new()` creates a game | Run the game — different secret each time |
| `game.max_guesses` accessible | Welcome message shows correct number of guesses |
| `take_guess` increments counter | Guess prompts show 1, 2, 3... in order |
| `take_guess` prints correct responses | Test "Too low.", "Too high.", "Correct!" all appear |
| `is_over` set correctly | After correct guess, loop exits — game ends |
| `is_won()` distinguishes win from loss | Win shows "well done!", loss shows "better luck next time!" |
| Out of guesses handled | Exhaust all guesses — secret revealed, loss message shown |
| `#[derive(Debug)]` works | Add `{:?}` print temporarily — full struct prints |
| `GameState::new_with_options` (challenge) | Change to 5 guesses, hints off — game reflects settings |

---

## Quick Check Answers

**1. What problem arises when a program has dozens of related variables floating around separately?**

Several problems emerge simultaneously. First, function signatures become unwieldy — every function that needs game data requires every variable as a separate parameter. Adding one new piece of data means updating every function signature that touches game state. Second, there is nothing in the language enforcing that these variables travel together — you could accidentally pass the wrong value for a parameter when two have the same type. Third, the relationship between the variables is only in the programmer's head, not in the code. A struct makes the relationship explicit, enforced by the type system: a `GameState` always has all its fields, all at once, and functions that need game data say so clearly by taking a `GameState` rather than five separate parameters.

**2. What is the practical difference between `check_guess(guess, &game.secret)` and `game.check(guess)`?**

Both call the same logic. The difference is what the code communicates and what the compiler can verify. The function form `check_guess(guess, &game.secret)` says: "here is a function that happens to take a guess and a secret — their relationship is by convention." The method form `game.check(guess)` says: "checking a guess is something a `GameState` knows how to do — the relationship is in the type." The compiler enforces that `game.check()` can only be called on a `GameState`. You cannot accidentally call it on a `String` or an `i32`. As programs grow, this enforcement catches a class of bugs where the right function is called with the wrong data, or the right data goes to the wrong function.

**3. What does "object-oriented" mean, and why did Rust choose a different path?**

Object-oriented programming organizes code around objects that combine data and behavior, typically with three features: encapsulation (hiding internal state), inheritance (one type extending another), and polymorphism (different types responding to the same interface). Rust has encapsulation and polymorphism (through traits) but deliberately omits inheritance. The reason: inheritance creates implicit coupling between types. A subclass depends on the internals of its parent class — if the parent changes, the subclass may break in ways that are difficult to trace. Rust uses composition instead: if a type needs another type's capabilities, it contains that type as a field and decides explicitly what to expose. This is more verbose but more predictable. Rust's designers observed that in practice, the most common uses of inheritance in OOP codebases are better expressed as either composition (sharing data) or traits (sharing behavior) — so they kept those and removed the part that caused the most architectural problems.
