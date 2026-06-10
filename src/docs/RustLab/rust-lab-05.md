# Rust Web Server — LAB 05 — Enums, Option, and Real Error Handling

**Prerequisites:** LAB 01–04. You understand variables, types, functions, loops, ownership, borrowing, structs, methods, and `impl` blocks. You have a `GameState` struct driving the guessing game.

**What this lab adds:**
- What an enum is — a type that is exactly one of several named variants
- How enums are laid out in memory — the tagged union
- The billion-dollar mistake: what `null` is and why Rust eliminated it
- `Option<T>` — Rust's replacement for null, and how to work with it
- `Result<T, E>` — the type that represents operations that can fail
- The `?` operator — propagating errors without ceremony
- Graceful error handling: the guessing game no longer crashes when the player types a word instead of a number
- A new `GuessError` enum that describes every way a guess can be invalid

**Time:** 4–6 hours. This lab introduces the error handling model that every Rust program uses. It is worth reading twice.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 02, if you typed "hello" instead of a number, the game crashed. Why do you think the program crashed rather than printing an error message and asking again?
> 2. Many languages have a special value called `null` (or `nil`, or `None`) meaning "no value." What problems do you think arise from having a value that means "nothing" but can appear anywhere any other value can appear?
> 3. When a function can either succeed or fail, what information do you think the caller needs in both cases? What does the return type need to carry?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, typing "hello" or leaving a blank line no longer crashes the game. Invalid input is handled gracefully, and the player gets a clear message:

```
$ cargo run

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1: hello
That's not a number. Try again.

Guess 1: 999
Please enter a number between 1 and 100.

Guess 1: 50
Too high.

Guess 2: 25
Too low.

Guess 3: 37
Correct! You got it in 3 guesses!

Thanks for playing — well done!
```

Failed guesses do not count against the player's total. The game only increments `guesses_taken` when a valid, in-range number is entered.

---

## Part 1 — Enums

### Concept: Enum — A Type That Is Exactly One of Several Variants

**What it is:** An enum (short for "enumeration") is a type that can be exactly one of a fixed set of named possibilities. Each possibility is called a **variant**.

**The problem before:**

Imagine representing the suit of a playing card. A suit is one of four things: Hearts, Diamonds, Clubs, Spades. With what you know so far, you might represent it as a string:

```rust
let suit = "Hearts";
```

But a string can hold any text. `"hearts"`, `"HEARTS"`, `"herts"`, `"red"` are all valid strings. The type does not constrain the value to the four valid suits. The compiler cannot help you catch `"herts"`. You must check at runtime — and you might forget to.

An integer is no better:

```rust
let suit = 1;  // is 1 hearts? spades? clubs? only the programmer knows
```

**The solution:** An enum declares exactly which values are valid. The type and the valid values are defined in one place. The compiler enforces that you only use valid variants:

```rust
enum Suit {
    Hearts,
    Diamonds,
    Clubs,
    Spades,
}

let card_suit = Suit::Hearts;  // valid
let bad_suit = Suit::Herts;    // COMPILE ERROR — no such variant
```

**What it hides:** An enum hides the underlying representation. Rust stores enum variants as integers internally, but you never see or care about those integers. You work with meaningful names. The compiler maps names to numbers; you work with the abstraction.

The invariant enums protect: **a variable of an enum type can only hold a value that is one of the declared variants.** You cannot store an invalid state. If all valid states are declared, invalid states literally cannot be represented.

**Canonical example (General Explanation):**

A traffic light. A traffic light is exactly one of three states: Red, Yellow, Green. It is never `"reddish"` or `4` or `null`. An enum captures this precisely:

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn should_stop(light: TrafficLight) -> bool {
    match light {
        TrafficLight::Red    => true,
        TrafficLight::Yellow => true,   // cautious driver
        TrafficLight::Green  => false,
    }
}
```

**The `match` requirement:** When you `match` on an enum, the compiler requires you to handle every variant. If you add a fourth variant to `TrafficLight` later, every `match` on it fails to compile until you add the new arm. This is the exhaustiveness guarantee from Lab 03 — it makes adding new variants safe, because the compiler points to every place that needs updating.

**Syntax — defining and using an enum:**

```rust
enum EnumName {
    VariantOne,
    VariantTwo,
    VariantThree,
}

let value = EnumName::VariantOne;  // :: to access a variant

match value {
    EnumName::VariantOne   => { /* code */ }
    EnumName::VariantTwo   => { /* code */ }
    EnumName::VariantThree => { /* code */ }
}
```

**Watch for:** By convention, variant names are `PascalCase` (each word capitalized, no underscores) — `VariantOne`, not `variant_one` or `VARIANT_ONE`. The compiler does not enforce this, but the Rust community does.

---

### Concept: Enums With Data — Variants That Carry Values

**What it is:** Enum variants can carry data — each variant can hold different types and amounts of data, or none at all.

**Why this is powerful:**

A plain enum models states. An enum with data models states that carry context. Consider a network request result: it either succeeded (and carries the response data) or failed (and carries the error description). Both cases need data, but different data.

**Canonical example (General Explanation):**

```rust
enum Shape {
    Circle(f64),           // carries one value: the radius
    Rectangle(f64, f64),   // carries two values: width and height
    Triangle,              // carries nothing
}

let s = Shape::Circle(5.0);   // a circle with radius 5.0
let r = Shape::Rectangle(4.0, 3.0);
```

Accessing the data uses pattern matching with destructuring — extracting values from inside a variant:

```rust
match s {
    Shape::Circle(radius) => {
        println!("Circle with radius {}", radius); // radius is bound to 5.0
    }
    Shape::Rectangle(width, height) => {
        println!("{}×{} rectangle", width, height);
    }
    Shape::Triangle => {
        println!("A triangle");
    }
}
```

**The pattern binding:** In `Shape::Circle(radius)`, the name `radius` is created fresh and bound to the value inside the variant. This is called **destructuring** — pulling apart a structured value into its components. The name you use in the pattern does not have to match anything — it is a new variable created just for that `match` arm.

**Project Application:**

We will define a `GuessError` enum describing every way a guess can be invalid:

```rust
enum GuessError {
    NotANumber,              // the player typed text
    OutOfRange(i32),         // the player typed a number, but not 1–100 — carries the bad value
}
```

The `OutOfRange` variant carries the actual number the player typed — so we can tell them exactly what was wrong: "999 is out of range" rather than just "invalid input."

---

### Concept: Memory Layout of an Enum — The Tagged Union

**What it is:** An enum is stored in memory as a **tagged union** — a block of memory large enough to hold the largest variant, plus a small **tag** (a number) that records which variant is currently active.

**What a union is:** In C, a union is a block of memory that can hold different types at different times — the same bytes are reinterpreted depending on context. Unions are powerful but dangerous: nothing stops you from writing a float and reading it back as an integer.

**What the tag adds:** Rust's enum adds a tag — a small integer stored alongside the union data — that always records which variant is currently active. The tag is what makes the `match` statement work: the CPU reads the tag and jumps to the correct branch. You never read the tag directly — `match` does it for you.

**Concrete example:**

```rust
enum GuessError {
    NotANumber,        // no data — 0 bytes of payload
    OutOfRange(i32),   // 4 bytes of payload
}
```

Memory layout:

```
┌─────┬──────────────────────┐
│ tag │ payload              │
│ 1B  │ 4B (i32 or empty)    │
└─────┴──────────────────────┘

When variant is NotANumber:   tag = 0, payload = (unused)
When variant is OutOfRange:   tag = 1, payload = the i32 value
```

Total size: 5 bytes (plus alignment padding, typically rounded to 8). The `NotANumber` variant wastes 4 bytes of payload space it does not use — that is the cost of being able to hold either variant.

**Why this matters for your web server:** HTTP responses, parsed requests, and connection states will all be enums. Understanding that an enum's size is fixed — determined by its largest variant — means you can reason about memory usage in your server. A `Vec<HttpResponse>` holding 10,000 responses uses 10,000 × (size of largest variant) bytes, regardless of which variant each response is.

---

## Part 2 — The Billion-Dollar Mistake

### Concept: `null` — The Value That Means Nothing

**What it is:** `null` (also spelled `nil`, `None`, `nullptr` depending on the language) is a special value meaning "no value" — a variable that holds `null` holds nothing.

**Who invented it and why they regret it:**

Tony Hoare invented the null reference in 1965 while designing the ALGOL programming language. In 2009, he gave a talk at a software conference where he called it his "billion-dollar mistake":

> "I couldn't resist the temptation to put in a null reference, simply because it was so easy to implement. This has led to innumerable errors, vulnerabilities, and system crashes, which have probably caused a billion dollars of pain and damage in the last forty years."

**The problem with null:**

In languages with null (Java, C#, Python, JavaScript, C, C++), any variable of a reference or pointer type can be null. This means:

```java
// Java
String name = null;         // valid — name holds nothing
int length = name.length(); // CRASH at runtime — NullPointerException
```

The type `String` promises to be a string. But it might actually be `null`. The type system lies. You cannot know from the type alone whether a value is present or absent. You must check at runtime — and if you forget, the program crashes.

In Java, the `NullPointerException` is the single most common runtime error in the history of the language. In C, dereferencing a null pointer causes a segmentation fault and program crash. In C++, it is undefined behavior — the program may crash, may corrupt memory, may appear to work and corrupt something later.

**The correct abstraction:**

The right mental model is: "this value might be present, or it might be absent." That is a binary choice — a thing with two states. It should be a type that makes both states explicit and requires you to handle both. That is exactly what `Option<T>` is.

---

### Concept: `Option<T>` — Absence Made Explicit

**What it is:** `Option<T>` is an enum built into Rust's standard library. It has exactly two variants:

```rust
enum Option<T> {
    Some(T),   // a value of type T is present
    None,      // no value is present
}
```

The `T` is a **type parameter** — a placeholder for whatever type the option is holding. `Option<i32>` is an option that either holds an `i32` or holds nothing. `Option<String>` either holds a `String` or holds nothing.

**What it hides:** `Option<T>` hides the possibility of absence behind an explicit type. You cannot accidentally treat an `Option<i32>` as if it were definitely an `i32` — the compiler refuses. You must first handle both the `Some` and `None` cases.

The invariant `Option<T>` protects: **the presence or absence of a value is always visible in the type.** A function that returns `Option<i32>` is explicitly promising: "I might not give you a value." A function that returns `i32` is explicitly promising: "I will always give you a value." The type is the contract. The compiler verifies the contract is upheld.

**Canonical example (General Explanation):**

```rust
fn find_first_even(numbers: &[i32]) -> Option<i32> {
    for &n in numbers {
        if n % 2 == 0 {
            return Some(n);   // found one — return it wrapped in Some
        }
    }
    None                      // found nothing — return None
}

let result = find_first_even(&[1, 3, 5, 7]);   // None — no even numbers
let result = find_first_even(&[1, 3, 4, 7]);   // Some(4) — found 4
```

**Working with `Option` — the three main patterns:**

**Pattern 1 — `match`:** Handle both cases explicitly:

```rust
match find_first_even(&[1, 3, 4, 7]) {
    Some(n) => println!("Found: {}", n),
    None    => println!("None found"),
}
```

**Pattern 2 — `if let`:** Handle only the `Some` case, ignore `None`:

```rust
if let Some(n) = find_first_even(&[1, 3, 4, 7]) {
    println!("Found: {}", n);
    // if None, this block is skipped entirely
}
```

`if let` is syntactic sugar — it is a shorthand `match` that only has one arm. Use it when you only care about one variant and want to silently ignore the others.

**Pattern 3 — `.unwrap_or(default)`:** Extract the value or use a default if `None`:

```rust
let n = find_first_even(&[1, 3, 5]).unwrap_or(0);
// n is 0 because the list has no even numbers
```

**Watch for:** `.unwrap()` — which extracts the `Some` value or **panics** (crashes) if it is `None` — is tempting but dangerous. Use it only in tests or when you can prove `None` is impossible. We will use `.unwrap_or()`, `match`, and `if let` instead.

---

## Part 3 — Result and Error Handling

### Concept: `Result<T, E>` — Operations That Can Fail

**What it is:** `Result<T, E>` is an enum built into Rust's standard library representing an operation that either succeeds or fails:

```rust
enum Result<T, E> {
    Ok(T),   // success — carries the success value of type T
    Err(E),  // failure — carries the error value of type E
}
```

`T` is the type of the success value. `E` is the type of the error value.

**What it hides:** `Result<T, E>` hides the possibility of failure behind an explicit type. Like `Option`, it makes the success/failure duality visible in the type system. A function returning `Result<i32, String>` is contractually promising: "I might fail, and if I do, I will give you a `String` explaining why."

The invariant `Result` protects: **a caller cannot use a success value without first acknowledging that failure was possible.** You cannot extract the `i32` from a `Result<i32, String>` without handling the `Err` case. The compiler refuses. This eliminates the entire class of bugs where errors are silently ignored.

**Canonical example (General Explanation):**

Parsing a string into a number. The string might not be a valid number:

```rust
let good: Result<i32, _> = "42".parse();    // Ok(42)
let bad:  Result<i32, _> = "hello".parse(); // Err(ParseIntError { ... })

match good {
    Ok(n)  => println!("Parsed: {}", n),
    Err(e) => println!("Failed: {}", e),
}
```

**You have already used `Result` — with `.expect()`:**

```rust
input.parse().expect("Please type a number")
```

`.expect(msg)` extracts the `Ok` value — or panics with `msg` if it is `Err`. It is the escape hatch: "I know this could fail but I am choosing to crash rather than handle it." That is sometimes correct (startup, tests) and often wrong (user-facing input — which is exactly our situation).

**Working with `Result` — the four main patterns:**

**Pattern 1 — `match`:** Full explicit handling:

```rust
match "hello".parse::<i32>() {
    Ok(n)  => println!("Got: {}", n),
    Err(_) => println!("Not a number"),   // _ discards the error value we do not need
}
```

**Pattern 2 — `if let`:** Handle only success:

```rust
if let Ok(n) = "42".parse::<i32>() {
    println!("Got: {}", n);
}
```

**Pattern 3 — `.unwrap_or(default)`:** Use a default on failure:

```rust
let n: i32 = "hello".parse().unwrap_or(0);  // n is 0
```

**Pattern 4 — `.ok()`:** Convert a `Result` into an `Option` (discard the error):

```rust
let maybe: Option<i32> = "42".parse().ok();  // Some(42) or None
```

**What `::<i32>` means:** `.parse::<i32>()` is the **turbofish** syntax — an explicit type parameter passed to a generic function. When Rust cannot infer the target type from context, you tell it explicitly with `::<Type>`. The name "turbofish" comes from its visual resemblance to a fish. You will see it occasionally; context usually makes inference work without it.

---

### Concept: The `?` Operator — Propagating Errors

**What it is:** The `?` operator, placed after a `Result` or `Option` expression, does one of two things: if the value is `Ok(v)`, it unwraps and produces `v`; if the value is `Err(e)`, it immediately returns `Err(e)` from the current function.

**What it hides:** `?` hides a `match` expression that checks for errors and returns early. It is the mechanical part of error propagation — "if this failed, bail out immediately with the error." Hiding that boilerplate lets you read the happy path clearly.

**The raw version without `?`:**

```rust
fn parse_number(s: &str) -> Result<i32, String> {
    let n = match s.parse::<i32>() {
        Ok(n)  => n,
        Err(e) => return Err(e.to_string()),  // bail out with error
    };
    Ok(n * 2)
}
```

**The version with `?`:**

```rust
fn parse_number(s: &str) -> Result<i32, String> {
    let n = s.parse::<i32>().map_err(|e| e.to_string())?;  // ? bails on Err
    Ok(n * 2)
}
```

**Rules for using `?`:**
1. The function must return `Result<T, E>` or `Option<T>` — `?` propagates the error by returning from the function, so the function's return type must be compatible
2. The error types must be compatible (or convertible) — we will handle this with `.map_err()` when needed

**Project Application:**

`get_guess()` currently uses `.expect()` — it crashes on bad input. We will replace it with a function that returns `Result<i32, GuessError>` and uses `?` or `match` to handle errors gracefully.

**Watch for:** `?` in `main()` requires `main()` to return `Result`. For our game, we handle errors inside loops instead of propagating them out of `main()` — so we will use `match` inside `get_guess()` rather than `?` at the top level.

---

## Part 4 — Defining `GuessError`

### Step 1 — Define the `GuessError` Enum

Open the `guessing_game_v2` project from Lab 04. Add the enum above the `GameState` struct:

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;

#[derive(Debug)]                   // ← Debug lets us print GuessError with {:?}
enum GuessError {
    NotANumber,                    // ← player typed text that cannot be parsed as a number
    OutOfRange(i32),               // ← player typed a number, but outside 1–100
                                   //   the i32 carries what they actually typed
}
```

**Why carry the value in `OutOfRange`?**

Compare these two error messages:
- "That number is out of range." — tells the player nothing about what was wrong
- "999 is out of range. Enter a number between 1 and 100." — specific, actionable

The `i32` inside `OutOfRange(i32)` carries the actual bad value so we can include it in the message. This is the power of enums with data — the error variant carries the context needed to give a useful message.

---

### SAVE AND TRY

```
cargo build
```

**You should see:** No errors. The enum is defined but not yet used — Rust may warn about unused code. That is expected. The warning will disappear when we use `GuessError` in the next step.

---

### Step 2 — Rewrite `get_guess` to Return `Result`

Replace the existing `get_guess` function entirely:

```rust
fn get_guess(guess_number: u32) -> Result<i32, GuessError> {
//                                 ↑
//                                 now returns Result — either Ok(i32) or Err(GuessError)

    print!("Guess {}: ", guess_number);
    io::stdout().flush()
        .expect("Could not flush stdout");   // stdout flush failure is catastrophic — .expect() is fine here

    let mut input = String::new();

    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read line");      // stdin failure is also catastrophic — .expect() is fine

    let input = input.trim();                // shadow: remove trailing newline

    let number: i32 = match input.parse() { // try to parse the trimmed input as i32
        Ok(n)  => n,                         // ← parsing succeeded — n is the i32
        Err(_) => return Err(GuessError::NotANumber), // ← parsing failed — not a number
                                             //   return early with the NotANumber error
                                             //   _ discards the parse error (we have our own)
    };

    if number < 1 || number > 100 {          // ← check the range
        return Err(GuessError::OutOfRange(number)); // ← out of range — carry the bad value
    }

    Ok(number)                               // ← both checks passed — return success
}
```

**New concept — `||` (logical OR):**

`||` is the boolean OR operator. `a || b` is `true` if either `a` is true, or `b` is true, or both are true. It is false only when both are false.

`number < 1 || number > 100` means: "the number is below 1, OR the number is above 100." Either condition means the number is outside the valid range.

**The full set of boolean operators:**

| Operator | Name | Meaning |
|---|---|---|
| `&&` | AND | True only if both sides are true |
| `\|\|` | OR | True if either side (or both) is true |
| `!` | NOT | Flips true to false, false to true |

**Short-circuit evaluation:** `&&` and `||` are **short-circuit** operators. For `a && b`, if `a` is false, Rust never evaluates `b` — the result is already false. For `a || b`, if `a` is true, Rust never evaluates `b`. This is not just an optimization — it is behavior you can rely on. We will use it deliberately in the web server for guard conditions.

**Why use `return` here instead of the implicit return?**

`return Err(GuessError::NotANumber)` is an **early return** — it exits the function immediately from inside the `match`. The implicit return (last expression without semicolon) only works for the final value of the function body. When you need to exit early from inside a nested block, you must use explicit `return`.

---

### SAVE AND TRY

```
cargo build
```

**You should see an error.** The `main()` function still calls `get_guess()` the old way:

```
error[E0308]: mismatched types
  --> src/main.rs:XX:21
   |
   |         let guess = get_guess(guesses_taken);
   |                     ^^^^^^^^^ expected `i32`, found `Result<i32, GuessError>`
```

This is the compiler doing exactly what it should — it noticed that `get_guess` now returns `Result<i32, GuessError>` but `main()` is treating the result as if it were just an `i32`. We need to update `main()` to handle both cases.

---

### Step 3 — Update the Game Loop to Handle Errors

Replace the `loop` in `main()`:

```rust
loop {
    if game.is_over {
        break;
    }

    let guess_number = game.guesses_taken + 1;

    match get_guess(guess_number) {            // ← get_guess now returns Result
        Err(GuessError::NotANumber) => {
            println!("That's not a number. Try again.\n");
            // do NOT increment guesses_taken — this attempt does not count
            // the loop continues to the next iteration
        }
        Err(GuessError::OutOfRange(n)) => {   // ← n is bound to the bad number they typed
            println!("{} is out of range. Enter a number between 1 and 100.\n", n);
            // do NOT increment guesses_taken — this attempt does not count
        }
        Ok(guess) => {
            game.take_guess(guess);            // ← valid guess: process it normally
        }
    }
}
```

**Key design decision:** Invalid guesses do not count. If the player types "hello", the prompt shows `Guess 1:` again — they did not waste a guess. This is a user experience decision encoded in the control flow: we only call `game.take_guess()` (which increments `guesses_taken`) for valid input.

**The pattern `Err(GuessError::OutOfRange(n))`:**

This is **nested destructuring** — pattern matching inside pattern matching. The outer pattern `Err(...)` matches the `Err` variant of `Result`. The inner pattern `GuessError::OutOfRange(n)` matches the `OutOfRange` variant of `GuessError` and binds the carried `i32` to `n`. All in one clean `match` arm.

---

### SAVE AND TRY

```
cargo run
```

**Test all error cases:**

1. Type "hello" — should see "That's not a number. Try again."
2. Type "999" — should see "999 is out of range. Enter a number between 1 and 100."
3. Type "0" — should see "0 is out of range..."
4. Type a valid number — "Too high.", "Too low.", or "Correct!"
5. Verify that invalid inputs do NOT increment the guess counter — "Guess 1:" appears repeatedly until a valid number is entered

**Change something:** Change `return Err(GuessError::OutOfRange(number))` to only trigger when `number < 1` (remove the `|| number > 100` part). Run it, type 500, observe it is accepted as valid. Change it back.

---

## Part 5 — Implementing Display for `GuessError`

Right now, if we wanted to print a `GuessError` in a user-friendly way outside the `match` arms, we would have to `match` every time. Rust has a better tool: the `Display` trait.

### Concept: Traits — A Named Set of Methods a Type Promises to Implement

**What it is:** A trait is a named collection of method signatures. When a type implements a trait, it is promising: "I support all the methods this trait requires." Any code that works with the trait can call those methods on any type that implements it, without knowing which specific type it is.

**What it hides:** A trait hides the specific type behind a common interface. Code that works with a `Display` trait does not need to know whether it is formatting a `GuessError`, a `String`, or a custom `ServerStatus` — as long as they all implement `Display`, they can all be formatted with `{}`.

The invariant traits protect: **any type implementing a trait must provide all the methods the trait requires.** The compiler verifies completeness. You cannot implement half a trait and ship it.

**Full trait coverage is in Lab 06.** For now, we implement one specific trait — `Display` — to make `GuessError` printable with `{}`.

**The `Display` trait:**

```rust
use std::fmt;

impl fmt::Display for GuessError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // write! puts formatted text into f — the formatter
        // the return value fmt::Result indicates success or failure
        match self {
            GuessError::NotANumber       => write!(f, "that's not a number"),
            GuessError::OutOfRange(n)    => write!(f, "{} is out of range (enter 1–100)", n),
        }
    }
}
```

**Breaking down the signature:**

- `&self` — immutable reference to the `GuessError` being formatted (we are reading it, not changing it)
- `f: &mut fmt::Formatter` — a mutable reference to the formatter — the machinery that builds the output string
- `-> fmt::Result` — returns success or failure (write operations can fail if the output stream is full)
- `write!(f, ...)` — like `println!` but writes into `f` instead of the terminal

Once this is implemented, you can use `{}` with `GuessError` anywhere:

```rust
let error = GuessError::OutOfRange(999);
println!("{}", error);  // prints: 999 is out of range (enter 1–100)
```

---

### Step 4 — Add `Display` to `GuessError`

Add the `use std::fmt` import and the `impl fmt::Display` block. Place it directly below the `GuessError` enum definition:

```rust
use std::fmt;                                   // ← add this import: the formatting module

#[derive(Debug)]
enum GuessError {
    NotANumber,
    OutOfRange(i32),
}

impl fmt::Display for GuessError {              // ← implement Display for GuessError
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            GuessError::NotANumber       =>
                write!(f, "that's not a number — enter a whole number"),
            GuessError::OutOfRange(n)    =>
                write!(f, "{} is out of range — enter a number between 1 and 100", n),
        }
    }
}
```

Now update the `match` arms in `main()` to use `{}` formatting — the error formats itself:

```rust
loop {
    if game.is_over {
        break;
    }

    let guess_number = game.guesses_taken + 1;

    match get_guess(guess_number) {
        Err(e) => {                                    // ← catch ANY error variant in one arm
            println!("{}\n", e);                       // ← {} uses Display — the error formats itself
            // invalid input — do not count this guess
        }
        Ok(guess) => {
            game.take_guess(guess);
        }
    }
}
```

**`Err(e)` without specifying the variant:** Because `GuessError` implements `Display`, we can handle all error variants in one arm and just print the error. The `Display` implementation on `GuessError` handles the distinction between `NotANumber` and `OutOfRange` internally.

---

### SAVE AND TRY

```
cargo run
```

**Verify the same error behavior as Step 3** — but the messages now come from `GuessError`'s `Display` implementation, not from inline strings in `main()`. Changing the error messages now only requires changing `impl fmt::Display for GuessError` — not hunting through `main()`.

**Change something:** Update the `NotANumber` message in `impl fmt::Display` to say "Please type a whole number, like 42." Run it. Confirm the new message appears. Change it back.

---

## Part 6 — `Option` in Practice

### Step 5 — Add a `last_guess` Field to `GameState`

`Option<T>` is the right type whenever a value might not exist yet. The game has no "last guess" at the start — the concept does not apply until the first guess is made. `Option<i32>` models this precisely.

Add `last_guess` to `GameState`:

```rust
#[derive(Debug)]
struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
    last_guess:    Option<i32>,    // ← None at start — Some(n) after first guess
}
```

Update `GameState::new()` to initialize it:

```rust
fn new() -> GameState {
    GameState {
        secret:        generate_secret(),
        guesses_taken: 0,
        max_guesses:   7,
        is_over:       false,
        last_guess:    None,       // ← no guess has been made yet
    }
}
```

Update `take_guess` to record the last guess:

```rust
fn take_guess(&mut self, guess: i32) {
    self.guesses_taken += 1;
    self.last_guess = Some(guess); // ← record what was just guessed

    match guess.cmp(&self.secret) {
        // ... rest of take_guess unchanged ...
    }
    // ... rest of take_guess unchanged ...
}
```

Now use `last_guess` in the out-of-guesses message to include context:

```rust
if self.guesses_taken >= self.max_guesses && !self.is_over {
    match self.last_guess {
        Some(n) => println!(
            "Out of guesses! Your last guess was {}. The number was {}.",
            n, self.secret
        ),
        None => println!("Out of guesses! The number was {}.", self.secret),
        // None case is theoretically impossible here — guesses_taken >= 1
        // but the type system does not know that, so we handle it
    }
    self.is_over = true;
}
```

---

### SAVE AND TRY

```
cargo run
```

Play the game to a loss (use all 7 guesses). The out-of-guesses message should include your last guess.

**Add a temporary debug line** to verify `last_guess` updates correctly:

```rust
// Inside the Ok(guess) arm in main(), after game.take_guess(guess):
println!("DEBUG last_guess: {:?}", game.last_guess); // ← {:?} prints Option as Some(42) or None
```

After each valid guess, you should see `DEBUG last_guess: Some(42)` (or whatever you typed). At the start, if you could print it before any guess, it would show `None`. Remove the debug line after verifying.

**Change something:** Change `self.last_guess = Some(guess)` to be `Some(guess + 1)` temporarily. Play the game — the "last guess" in the out-of-guesses message will be one higher than what you typed. This demonstrates that the value inside `Some(...)` is just a regular `i32` — you can compute with it before wrapping it. Change it back.

---

The complete `src/main.rs` at the end of Lab 05:

```rust
use rand::Rng;
use std::io;
use std::cmp::Ordering;
use std::fmt;

// ── Error type ────────────────────────────────────────────────────────────────

#[derive(Debug)]
enum GuessError {
    NotANumber,
    OutOfRange(i32),
}

impl fmt::Display for GuessError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            GuessError::NotANumber    =>
                write!(f, "that's not a number — enter a whole number"),
            GuessError::OutOfRange(n) =>
                write!(f, "{} is out of range — enter a number between 1 and 100", n),
        }
    }
}

// ── Game state ────────────────────────────────────────────────────────────────

#[derive(Debug)]
struct GameState {
    secret:        i32,
    guesses_taken: u32,
    max_guesses:   u32,
    is_over:       bool,
    last_guess:    Option<i32>,
}

impl GameState {

    fn new() -> GameState {
        GameState {
            secret:        generate_secret(),
            guesses_taken: 0,
            max_guesses:   7,
            is_over:       false,
            last_guess:    None,
        }
    }

    fn take_guess(&mut self, guess: i32) {
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

    fn is_won(&self) -> bool {
        self.is_over && self.guesses_taken <= self.max_guesses
    }

}

// ── Standalone functions ───────────────────────────────────────────────────────

fn generate_secret() -> i32 {
    rand::thread_rng().gen_range(1..=100)
}

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

// ── Entry point ───────────────────────────────────────────────────────────────

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

        match get_guess(guess_number) {
            Err(e) => {
                println!("{}\n", e);
            }
            Ok(guess) => {
                game.take_guess(guess);
            }
        }
    }

    if game.is_won() {
        println!("Thanks for playing — well done!");
    } else {
        println!("Thanks for playing — better luck next time!");
    }
}
```

---

## 🎯 Challenge: Add a `TooManyAttempts` Variant

**You know:** Enums with data, `Result`, `match`, error handling, `Display` trait implementation.

**Task:** Add a third variant to `GuessError`:

```rust
TooManyInvalidAttempts,   // the player has typed invalid input 3 times in a row
```

When the player types invalid input 3 times in a row without a valid guess in between, `get_guess` should return `Err(GuessError::TooManyInvalidAttempts)`. When `main()` receives this error, it should end the game immediately — set `game.is_over = true` and print "Too many invalid attempts. Game over."

A valid guess resets the consecutive-invalid counter back to 0.

**What you need to add:**

1. The new variant in `GuessError`
2. A message for it in `impl fmt::Display for GuessError`
3. A `consecutive_invalid: u32` counter somewhere — either as a parameter to `get_guess` or as a field in `GameState`
4. Logic in the error-handling arm of `main()`'s `match` to increment the counter and check if it hit 3

**Hint:** The counter needs to persist across iterations of the `loop` in `main()`. A local variable declared before the loop is the right place.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
// Updated GuessError:
#[derive(Debug)]
enum GuessError {
    NotANumber,
    OutOfRange(i32),
    TooManyInvalidAttempts,           // ← new variant
}

// Updated Display:
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

// Updated main() loop:
fn main() {
    let mut game = GameState::new();
    let mut consecutive_invalid: u32 = 0;    // ← tracks invalid inputs in a row

    println!();
    println!("I'm thinking of a number between 1 and 100.");
    println!("You have {} guesses. Good luck.", game.max_guesses);
    println!();

    loop {
        if game.is_over {
            break;
        }

        let guess_number = game.guesses_taken + 1;

        match get_guess(guess_number) {
            Err(e) => {
                println!("{}\n", e);
                consecutive_invalid += 1;            // ← count this invalid attempt

                if consecutive_invalid >= 3 {
                    println!("Too many invalid attempts. Game over.");
                    game.is_over = true;             // ← end the game
                }
            }
            Ok(guess) => {
                consecutive_invalid = 0;             // ← reset on valid input
                game.take_guess(guess);
            }
        }
    }

    if game.is_won() {
        println!("Thanks for playing — well done!");
    } else {
        println!("Thanks for playing — better luck next time!");
    }
}
```

**Key insight:** The counter lives in `main()`, not in `get_guess()` — because `get_guess()` is stateless. It does not remember previous calls. State that persists across multiple calls to a function belongs to the caller, not the callee. This is a foundational principle of function design: functions are ideally stateless transformations. State belongs to the structure that owns the loop — in this case, `main()`. In a later lab, when we refactor this into a proper `Game` struct that owns its own loop, the counter will move into `GameState`. The location of state should match the scope of its relevance.

</details>

---

## 🎯 Challenge 2: Reading Exercise — `Option` vs `Result`

**This is a reading and reasoning challenge, not a coding challenge.**

For each situation below, decide whether `Option<T>` or `Result<T, E>` is the more appropriate return type. Explain your reasoning in one sentence each.

1. A function that searches a list for a value — it might or might not find one.
2. A function that opens a file — the file might not exist, might have wrong permissions, or the disk might be full.
3. A function that returns the first element of a list — the list might be empty.
4. A function that connects to a database — the database server might be down, credentials might be wrong, the network might be unreachable.
5. A function that parses a config file — it might be missing, corrupted, or contain unknown keys.

**Answers:**

1. **`Option<T>`** — absence of a result is normal and expected. There is no error. The value just was not there.
2. **`Result<T, E>`** — failure has several distinct causes, each actionable. The caller needs to know *why* it failed to respond correctly.
3. **`Option<T>`** — an empty list is a valid, non-error state. "No first element" is absence, not failure.
4. **`Result<T, E>`** — connection failure is an error condition with multiple causes. The caller needs the error details to log them, retry with backoff, or show the user a message.
5. **`Result<T, E>`** — missing config might be handled by falling back to defaults (reasonable). Corrupted config or unknown keys are errors requiring attention. The distinction matters, so `Result` is correct — and the `E` type would likely be its own enum with variants for each failure mode.

**The rule of thumb:** Use `Option` when absence is a normal, expected outcome — no failure occurred, the value just was not there. Use `Result` when something went wrong — the operation tried and failed, and the failure has a cause worth knowing.

---

## Final Check

| Feature | How to verify |
|---|---|
| `GuessError::NotANumber` works | Type "hello" — see the not-a-number message |
| `GuessError::OutOfRange` works | Type "999" — see "999 is out of range..." |
| Type "0" | See "0 is out of range..." |
| Invalid input does not count | Type "hello" three times — still shows "Guess 1:" |
| Valid guess counts normally | Type a number — guess counter increments |
| `Display` trait formats errors | Error messages come from `impl fmt::Display`, not inline strings |
| `last_guess` is `None` at start | Add `{:?}` print before first guess — see `None` |
| `last_guess` updates correctly | After a valid guess, debug print shows `Some(n)` |
| Out-of-guesses includes last guess | Exhaust all guesses — message includes what you last typed |
| Win/loss messages still correct | Win shows "well done!", loss shows "better luck next time!" |
| `cargo build` has zero errors | No compile errors, no warnings about unused code |

---

## Quick Check Answers

**1. Why did typing "hello" crash the game in Lab 02?**

`get_guess()` used `.expect("Please type a number")` to extract the `Ok` value from `.parse()`. `.expect()` panics — crashes the program with a message — when the value is `Err`. Parsing "hello" as an `i32` always returns `Err` because "hello" is not a valid integer. The `.expect()` saw `Err` and immediately crashed with the message. This was intentional at the time — it was the simplest possible approach. But `.expect()` is never appropriate for user-facing input, because users make mistakes. `Result` and `match` give us the tools to handle mistakes without crashing.

**2. What problems arise from `null` being allowed anywhere?**

Three interconnected problems. First, the type system lies: a variable typed as `String` might actually be `null` — the type does not tell you whether the value is present. Second, you cannot know from reading the code whether a given variable could be null — you have to read every function that might assign to it. Third, and most consequentially, null dereferences are silent until runtime. The program compiles, passes code review, and then crashes in production under the one input combination that hits the null path. Tony Hoare called it a billion-dollar mistake because this pattern — code that compiles cleanly but crashes at runtime due to an unhandled null — is behind a significant fraction of all software bugs in the last 60 years. `Option<T>` fixes this by making absence a type-level concept: the compiler forces you to handle `None` before you can use the value.

**3. When a function can succeed or fail, what does the return type need to carry?**

It needs to carry two things: the success value on the happy path, and the failure description on the error path. A plain return value like `i32` only has room for the success case — you cannot encode failure in it without compromising the valid range of success values (for example, returning -1 as a sentinel for "failed" — a common C pattern that contaminates the value space). `Result<T, E>` solves this cleanly: `Ok(T)` carries the success value, `Err(E)` carries the error. The caller must handle both — the compiler enforces it. The error type `E` can be as simple as a `String` or as structured as a custom enum like `GuessError` that describes every specific failure mode with its own variant.
