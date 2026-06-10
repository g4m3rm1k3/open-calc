# Space Invaders in Rust — LAB 02 — The Ship Moves: Mutation and Structs

**What you will have by the end of this lab:**
Your ship moves left and right with the arrow keys. It stays in one piece of
code — a `struct` — instead of four separate variables scattered around.

**Time:** 35–45 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. In LAB 01 you wrote `let ship_x = 300.0`. What do you think would happen
>    if you wrote `ship_x = ship_x + 5.0` inside the loop to move the ship?
>    Try it now, before reading. What error do you get?
> 2. The ship has four things about it: x position, y position, width, height.
>    Right now these are four separate variables. What is the problem with having
>    four separate things that all describe one object?
> 3. A keyboard key is either pressed or not pressed — it has two states. What
>    Rust type from LAB 01 also has exactly two states?
>
> *(Think about these now. Answers at the bottom.)*

---

## The Problem: The Ship Won't Move

Start with the code you had at the end of LAB 01:

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    let ship_x      = 300.0;
    let ship_y      = 550.0;
    let ship_width  = 40.0;
    let ship_height = 20.0;

    loop {
        clear_background(BLACK);
        draw_rectangle(ship_x, ship_y, ship_width, ship_height, GREEN);
        next_frame().await
    }
}
```

Let's try to move the ship. Inside the loop, before `draw_rectangle`, add:

```rust
        ship_x = ship_x + 1.0;  // try to move the ship right every frame
```

### SAVE AND TRY (expect failure)

```sh
cargo run
```

**Expected error:**
```
error[E0384]: cannot assign twice to immutable variable `ship_x`
```

Rust is refusing to let you change `ship_x`. Read the error message carefully —
it says *immutable*. You have run into one of Rust's most important rules.

**Fix it:** Remove that line for now. We are about to learn why this happened
and how to fix it properly.

---

## The Concept: Immutability — Variables That Cannot Change

> **The Story:** Imagine you write a number on a sticky note and stick it to
> your monitor. That number is there forever — you cannot change it without
> peeling off the sticky note and writing a new one.
>
> In Rust, `let ship_x = 300.0` creates a sticky note. The number `300.0`
> is written on it permanently. This is called **immutability** — the value
> cannot change.

> **Term: immutable** — cannot be changed after it is created. In Rust, all
> variables are immutable by default. This is intentional — it prevents a whole
> class of bugs where a value changes unexpectedly in a large program.

> **Term: mutable** — can be changed. You must explicitly ask Rust to make a
> variable mutable by writing `mut` after `let`.

**The fix:** `let mut` instead of `let`:

```rust
let mut ship_x = 300.0;  // "mut" = this value is allowed to change
```

Let's see the smallest possible example of this before applying it to the game.
Open a new terminal tab and make a tiny test:

```rust
fn main() {
    let x = 5;
    x = x + 1;      // error: cannot assign twice to immutable variable
    println!("{x}");
}
```

Now with `mut`:

```rust
fn main() {
    let mut x = 5;
    x = x + 1;      // fine: x is mutable
    println!("{x}"); // prints: 6
}
```

> **The Rule:** `let` = fixed forever. `let mut` = allowed to change.
> Rust forces you to declare your intention up front. If a variable changes,
> you must say so. This is not a restriction — it is a feature. It means you
> can read any `let` without `mut` and *know for certain* that value never changes.

---

## Step 1 — Make the Ship Move with `mut`

Update `ship_x` and `ship_y` to be mutable, and add the key-reading code:

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    let mut ship_x  = 300.0;    // ← mut: x will change when the player moves
    let ship_y      = 550.0;    // ← no mut: y never changes (ship only moves left/right)
    let ship_width  = 40.0;
    let ship_height = 20.0;

    loop {
        // Read keyboard input and move the ship.
        if is_key_down(KeyCode::Right) {
            ship_x = ship_x + 3.0;
        }
        if is_key_down(KeyCode::Left) {
            ship_x = ship_x - 3.0;
        }

        clear_background(BLACK);
        draw_rectangle(ship_x, ship_y, ship_width, ship_height, GREEN);
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** The ship moves left and right with the arrow keys.

**Change something:** Change `3.0` to `8.0`. The ship moves faster. Change it
to `1.0` — very slow. Find a speed that feels good to you, then keep it.

---

## What Is `is_key_down`?

`is_key_down(KeyCode::Right)` returns `true` if the right arrow key is currently
held down, `false` if it is not.

> **Term: `bool`** — a type with exactly two possible values: `true` or `false`.
> Named after George Boole, a mathematician who formalized logic. In code, `bool`
> is the answer to yes/no questions: "is this key pressed?", "did the bullet hit
> an alien?", "is the game over?"

> **Term: `if`** — runs a block of code only when a condition is true.
> `if is_key_down(KeyCode::Right) { ship_x = ship_x + 3.0; }` means:
> "IF the right key is down, THEN move the ship right."

> **Term: `KeyCode::Right`** — macroquad's name for the right arrow key.
> Other keys: `KeyCode::Left`, `KeyCode::Space`, `KeyCode::Escape`.

### Break It on Purpose

Change `KeyCode::Right` to `KeyCode::Righty` (a name that does not exist):

```sh
cargo run
```

**Expected error:**
```
error[E0599]: no variant named `Righty` found for enum `KeyCode`
```

> **The message tells you:** `KeyCode` is an enum (a type with a fixed list
> of named options). `Righty` is not on that list. Rust caught your typo at
> compile time — the game never ran with a bad key name.

**Fix it:** Change `Righty` back to `Right`.

---

## The Problem: Four Variables for One Thing

The ship now has four variables: `ship_x`, `ship_y`, `ship_width`, `ship_height`.
They all describe one object. As the game grows, you will pass the ship to
functions, check its position, draw it, and reset it. Passing four separate
variables every time is error-prone.

What if you forget to pass one? What if you reorder them accidentally?

The solution is to package all four into a single named thing.

---

## The Concept: Structs — Packaging Related Data Together

> **The Story:** Imagine filling out a form for a new employee at a company.
> The form has fields: Name, Department, Start Date, Salary. You do not carry
> four separate sticky notes for each employee — you carry one form that contains
> all four pieces of information together. A **struct** is that form in code.

> **Term: `struct`** — a custom type you define that groups related values
> together under one name. Each piece of data inside is called a **field**.

**The smallest possible example — before applying it to the game:**

```rust
struct Point {
    x: f32,
    y: f32,
}

fn main() {
    let p = Point { x: 10.0, y: 20.0 };
    println!("x is {}", p.x);  // access a field with a dot
    println!("y is {}", p.y);
}
```

> **Term: field** — a named value inside a struct. `p.x` reads the field named
> `x` from the struct stored in `p`. The dot is the accessor.

> **Term: `f32`** — a type for decimal numbers (floating-point, 32-bit). Screen
> positions are `f32` because they can be between pixels. This is why your
> numbers have `.0` — `300.0` is an `f32`, `300` is a whole number (different type).

---

## Step 2 — Define the Ship Struct

Now apply this to the game. First, define the struct at the top of the file,
*above* `async fn main()`:

```rust
use macroquad::prelude::*;

// A Ship has four properties. All are f32 (decimal numbers).
struct Ship {
    x:      f32,   // horizontal position (distance from left edge)
    y:      f32,   // vertical position (distance from top edge)
    width:  f32,   // how wide the ship is
    height: f32,   // how tall the ship is
}

#[macroquad::main("Space Invaders")]
async fn main() {
    // Create one Ship and store it in a variable called `ship`.
    // mut: the ship will change position when the player moves.
    let mut ship = Ship {
        x:      300.0,
        y:      550.0,
        width:  40.0,
        height: 20.0,
    };

    loop {
        if is_key_down(KeyCode::Right) {
            ship.x = ship.x + 3.0;   // access the field with a dot
        }
        if is_key_down(KeyCode::Left) {
            ship.x = ship.x - 3.0;
        }

        clear_background(BLACK);
        draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Exactly the same behavior as before. The ship moves left and right.
The only change is how the code is organized.

**Change something:** Add `ship.y = ship.y - 1.0;` below the left/right checks.
The ship slowly floats upward every frame. Remove it — we do not want that yet.

---

## Why This Is Better

Before the struct:
```rust
let mut ship_x  = 300.0;
let ship_y      = 550.0;
let ship_width  = 40.0;
let ship_height = 20.0;
// draw_rectangle(ship_x, ship_y, ship_width, ship_height, GREEN);
```

After the struct:
```rust
let mut ship = Ship { x: 300.0, y: 550.0, width: 40.0, height: 20.0 };
// draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
```

Later, when we write a function to draw the ship, we pass `ship` — one thing.
When we write a function to move it, we pass `ship` — one thing. When we want
to reset it to the starting position, we change one variable — `ship`.

The four things that describe the ship travel together because they *are* together.

---

## Step 3 — Add a Speed Field

Right now the speed (`3.0`) is a raw number buried in the movement code.
Let's give it a home in the struct:

```rust
struct Ship {
    x:      f32,
    y:      f32,
    width:  f32,
    height: f32,
    speed:  f32,   // ← new field: pixels per frame
}
```

Update the creation:
```rust
    let mut ship = Ship {
        x:      300.0,
        y:      550.0,
        width:  40.0,
        height: 20.0,
        speed:  3.0,   // ← new
    };
```

Update the movement:
```rust
        if is_key_down(KeyCode::Right) {
            ship.x = ship.x + ship.speed;  // ← use the field
        }
        if is_key_down(KeyCode::Left) {
            ship.x = ship.x - ship.speed;
        }
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same behavior. Now change `speed: 3.0` to `speed: 6.0` in the
`Ship` creation — one change, the ship moves faster. Change it to a value you like.

---

## 🎯 Challenge: Add Up and Down Movement

**The goal:** The ship currently only moves left and right. Add movement for
the Up and Down arrow keys. The ship should not move off the screen.

You know:
- `KeyCode::Up` and `KeyCode::Down` for the keys
- `ship.y = ship.y - ship.speed` moves up (y=0 is the top of the screen)
- `ship.y = ship.y + ship.speed` moves down
- The window is roughly 600 pixels tall — do not let `ship.y` go below 0 or above 580

Also add a `y` component to the struct's `speed` — or just reuse the same speed
for both directions. Your choice.

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use macroquad::prelude::*;

struct Ship {
    x:      f32,
    y:      f32,
    width:  f32,
    height: f32,
    speed:  f32,
}

#[macroquad::main("Space Invaders")]
async fn main() {
    let mut ship = Ship {
        x:      300.0,
        y:      550.0,
        width:  40.0,
        height: 20.0,
        speed:  4.0,
    };

    loop {
        if is_key_down(KeyCode::Right) { ship.x = ship.x + ship.speed; }
        if is_key_down(KeyCode::Left)  { ship.x = ship.x - ship.speed; }
        if is_key_down(KeyCode::Down)  { ship.y = ship.y + ship.speed; }
        if is_key_down(KeyCode::Up)    { ship.y = ship.y - ship.speed; }

        // Clamp to screen bounds (we will learn a cleaner way in LAB 03).
        if ship.y < 0.0   { ship.y = 0.0;   }
        if ship.y > 580.0 { ship.y = 580.0; }

        clear_background(BLACK);
        draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
        next_frame().await
    }
}
```

**What is new:** The bounds check at the bottom (`if ship.y < 0.0 ...`).
In LAB 03 we will learn how to use `screen_height()` and `screen_width()`
so the ship stops at the actual window edge regardless of window size.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Right arrow moves ship right | Hold right arrow — ship moves |
| Left arrow moves ship left | Hold left arrow — ship moves |
| `let ship_x = ...` without `mut` causes error | Remove `mut` and run |
| `ship.x` accesses the field | Reads correctly in `draw_rectangle` |
| All four values are in one `Ship` struct | No loose `ship_x`, `ship_y` variables |
| Changing `speed` in one place changes speed | Tested it |
| Challenge: up/down movement added | Up and Down keys move the ship |

---

## Quick Check Answers

**1. What happens when you write `ship_x = ship_x + 5.0` without `mut`?**
You get: `error[E0384]: cannot assign twice to immutable variable`. Rust refuses
to change a variable that was declared without `mut`. This is by design — it
prevents accidental changes to values that should stay fixed.

**2. What is the problem with four separate variables for one object?**
They become disconnected. You must remember to pass all four together. If you
add a fifth property later (like `speed`), you add a fifth separate variable and
must update every place. A struct keeps them together — if you pass `ship`, all
its properties travel with it automatically.

**3. What Rust type has exactly two states?**
`bool` — exactly two values: `true` and `false`. `is_key_down(KeyCode::Right)`
returns a `bool`. The `if` statement checks a `bool` — it runs its block when
the bool is `true` and skips it when `false`.

---

## What Is Next — LAB 03

The ship can move off the left and right edges of the screen — it just
disappears. In LAB 03 we fix that by clamping the position to the screen
boundaries, then we write the ship's first bullet. You will fire a shot with
the spacebar.

*Continue to Space Invaders in Rust — LAB 03 — Bounds and Bullets: Functions and `if`/`else`.*
