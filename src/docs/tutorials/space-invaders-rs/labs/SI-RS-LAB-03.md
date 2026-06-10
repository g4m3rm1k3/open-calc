# Space Invaders in Rust — LAB 03 — Bounds and Bullets: Functions and `if`/`else`

**What you will have by the end of this lab:**
The ship cannot leave the screen. Pressing Space fires a bullet. The bullet
travels upward until it exits the top of the window. You have a playable
shooter — one bullet at a time.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. The ship's x position should never go below 0 (left edge) or above
>    760 (right edge, given an 800-pixel window and 40-pixel ship). You already
>    know `if`. How would you write the check to stop the ship at the left wall?
> 2. A bullet is a new moving object on screen — just like the ship, it has
>    a position. What would a `Bullet` struct need inside it?
> 3. Right now all of your drawing happens in the game loop. If you later need
>    to draw the ship in three different places (in the game, in a pause screen,
>    in a game-over screen), do you want to copy the `draw_rectangle` call
>    three times? What is the alternative?
>
> *(Answers at the bottom.)*

---

## Part A — Keep the Ship On Screen

## The Problem: The Ship Escapes

Hold the right arrow long enough and the ship walks off the right edge and disappears.
Hold left and it vanishes to the left. We need to clamp the position.

You already know how to check a condition with `if`. Try writing the check yourself
before reading on. The ship's x should never be less than `0.0` or greater than
`screen_width() - ship.width`.

Add this inside the loop, after the movement code:

```rust
        // Clamp: keep the ship inside the left and right edges.
        if ship.x < 0.0 {
            ship.x = 0.0;
        }
        if ship.x > screen_width() - ship.width {
            ship.x = screen_width() - ship.width;
        }
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** The ship stops at both walls. It cannot leave the screen.

**Change something:** Temporarily change `0.0` to `100.0` in the left clamp.
The ship is stopped 100 pixels from the left wall — like an invisible fence.
Change it back to `0.0`.

---

## The Concept: `if` / `else`

You have used `if` already. Let's be precise about what it does.

> **`if condition { ... }`** — runs the block only when `condition` is `true`.
> If `condition` is `false`, the block is skipped entirely.

> **`if condition { ... } else { ... }`** — when `condition` is `false`, the
> `else` block runs instead. Exactly one of the two blocks always runs.

**The smallest example:**
```rust
let x = 10;
if x > 5 {
    println!("big");   // runs because 10 > 5 is true
} else {
    println!("small"); // skipped
}
```

> **Comparison operators:**
> `>` greater than | `<` less than | `>=` greater than or equal | `<=` less than or equal
> `==` equal | `!=` not equal

Notice: comparison uses `==` (two equals signs), not `=` (one equals sign).
One `=` means *assign a value*. Two `==` means *compare two values*.

### Break It on Purpose

Change `if ship.x < 0.0` to `if ship.x = 0.0` (one `=` instead of two):

```sh
cargo run
```

**Expected error:**
```
error[E0308]: mismatched types
```

Rust tries to interpret `ship.x = 0.0` as an assignment (storing a value),
then realizes the result of an assignment is not a `bool`, and `if` requires
a `bool`. The error message is telling you: "`if` needs `true` or `false`, not
the result of storing a value."

**Fix it:** Change back to `ship.x < 0.0` (less than, one character).

---

## Part B — Fire a Bullet

## The Problem: There Is Nothing to Shoot

The game loop draws the ship. Now we need a second object — a bullet. It starts
at the ship's position and moves upward every frame until it leaves the screen.

First, let's think about what a bullet needs:
- A position (x, y) so we know where it is
- A flag to know if it currently exists on screen (active or not)

Define the struct above `struct Ship`:

```rust
struct Bullet {
    x:      f32,
    y:      f32,
    active: bool,  // true = bullet is flying; false = no bullet on screen
}
```

> **`bool` as a flag:** `active: bool` is used as an on/off switch.
> `true` means "this bullet exists and should be drawn and moved."
> `false` means "no bullet right now — do not draw or move it."

---

## Step 1 — Create the Bullet and Fire It

Create a bullet variable after the ship in `main()`:

```rust
    let mut bullet = Bullet {
        x:      0.0,    // position does not matter yet — bullet is inactive
        y:      0.0,
        active: false,  // no bullet on screen at game start
    };
```

Inside the loop, handle firing — Space bar creates the bullet at the ship's position:

```rust
        // Fire: if Space is pressed AND no bullet is active, launch one.
        if is_key_pressed(KeyCode::Space) && !bullet.active {
            bullet.x      = ship.x + ship.width / 2.0;  // center of the ship
            bullet.y      = ship.y;                       // top of the ship
            bullet.active = true;
        }
```

> **`is_key_pressed` vs `is_key_down`:**
> `is_key_down` is `true` every frame the key is held.
> `is_key_pressed` is `true` only on the first frame the key is pressed —
> then `false` until the key is released and pressed again.
> For firing, we want `is_key_pressed` — one tap, one bullet.

> **`&&` (and):** Both conditions must be true. `is_key_pressed(Space) && !bullet.active`
> means "Space was just pressed AND there is no bullet already flying."
> `!bullet.active` means "NOT active" — true when `active` is false.

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Nothing visible yet — the bullet exists but we do not draw or move it.
No errors. Pressing Space does not crash the game.

---

## Step 2 — Move and Draw the Bullet

After the fire code, add movement and drawing for the bullet:

```rust
        // Move the bullet upward if it is active.
        if bullet.active {
            bullet.y = bullet.y - 8.0;  // move up (y decreases toward the top)

            // Deactivate if it leaves the top of the screen.
            if bullet.y < 0.0 {
                bullet.active = false;
            }
        }
```

And in the drawing section, draw the bullet:

```rust
        clear_background(BLACK);
        draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
        // Draw bullet only when active.
        if bullet.active {
            draw_rectangle(bullet.x - 2.0, bullet.y, 4.0, 10.0, WHITE);
        }
        next_frame().await
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Press Space — a white rectangle shoots upward from the ship.
It disappears at the top. Then you can fire again.

**Change something:** Change `8.0` (bullet speed) to `15.0`. The bullet zips
across the screen very fast. Change it to `4.0` — very slow. Find a speed that
feels good.

---

## The Concept: Functions — Naming a Job

Right now the game loop is doing everything: reading input, moving the ship,
moving the bullet, drawing the ship, drawing the bullet. It will keep growing.
By LAB 06 it would be impossible to read.

The solution is to give each job a name and move it into its own **function**.

> **The Story:** Imagine a restaurant kitchen. The head chef does not personally
> cook every dish, wash every plate, and seat every customer. Each task is
> delegated to someone with a specific job. A function is a named job —
> "draw the ship," "move the bullet," "check if a bullet hit an alien."
> The game loop is the head chef: it calls the right function at the right time.

> **Term: function** — a named, reusable block of code. You define it once with
> `fn`. You *call* (run) it by writing its name followed by parentheses.

**The smallest example:**
```rust
fn greet() {
    println!("Hello!");
}

fn main() {
    greet();   // call the function — prints "Hello!"
    greet();   // call it again — prints "Hello!" again
}
```

Functions can also receive input and produce output — that comes in a moment.

---

## Step 3 — Extract Draw Functions

Let's move the drawing code out of the loop and into functions.

Add these two functions *above* `async fn main()` (and below the struct definitions):

```rust
fn draw_ship(ship: &Ship) {
    draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
}

fn draw_bullet(bullet: &Bullet) {
    if bullet.active {
        draw_rectangle(bullet.x - 2.0, bullet.y, 4.0, 10.0, WHITE);
    }
}
```

> **`&Ship` — what does the `&` mean?**
> When you pass `ship` to a function, Rust needs to decide: does the function
> get its own copy of `ship`, or does it borrow the original?
> `&Ship` means *borrow* — the function can read the ship's data but does not
> own it. The game loop keeps ownership. The function is like borrowing a book
> from a library — you read it and return it, you do not take it home forever.
> You will understand ownership deeply in LAB 05. For now: when you want a
> function to read a struct without changing it, write `&StructName`.

Update the drawing section in the game loop:

```rust
        clear_background(BLACK);
        draw_ship(&ship);      // pass a reference to ship
        draw_bullet(&bullet);  // pass a reference to bullet
        next_frame().await
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Identical behavior. The game loop is now shorter and easier to read.
Each drawing task has its own named function.

**Change something:** Inside `draw_ship`, change `GREEN` to `LIME`. Run —
the ship is a different shade. This is the value of functions: one change in
one place affects every use of that function.

---

## Complete Code So Far

```rust
use macroquad::prelude::*;

struct Ship {
    x:      f32,
    y:      f32,
    width:  f32,
    height: f32,
    speed:  f32,
}

struct Bullet {
    x:      f32,
    y:      f32,
    active: bool,
}

fn draw_ship(ship: &Ship) {
    draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
}

fn draw_bullet(bullet: &Bullet) {
    if bullet.active {
        draw_rectangle(bullet.x - 2.0, bullet.y, 4.0, 10.0, WHITE);
    }
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

    let mut bullet = Bullet {
        x:      0.0,
        y:      0.0,
        active: false,
    };

    loop {
        // Movement
        if is_key_down(KeyCode::Right) { ship.x += ship.speed; }
        if is_key_down(KeyCode::Left)  { ship.x -= ship.speed; }

        // Bounds
        if ship.x < 0.0                        { ship.x = 0.0; }
        if ship.x > screen_width() - ship.width { ship.x = screen_width() - ship.width; }

        // Fire
        if is_key_pressed(KeyCode::Space) && !bullet.active {
            bullet.x      = ship.x + ship.width / 2.0;
            bullet.y      = ship.y;
            bullet.active = true;
        }

        // Move bullet
        if bullet.active {
            bullet.y -= 8.0;
            if bullet.y < 0.0 { bullet.active = false; }
        }

        // Draw
        clear_background(BLACK);
        draw_ship(&ship);
        draw_bullet(&bullet);
        next_frame().await
    }
}
```

> **`ship.x += ship.speed`** is shorthand for `ship.x = ship.x + ship.speed`.
> `-=`, `*=`, `/=` work the same way. These are called *compound assignment operators*.

---

## 🎯 Challenge: Make the Ship Fire Faster

**The goal:** Right now only one bullet can exist at a time. You must wait for
the current bullet to leave the screen before firing again. Make it possible to
have **two** bullets in the air at the same time.

You will need a second `Bullet` variable. Think about:
- When Space is pressed and `bullet.active` is false, fire `bullet`
- When Space is pressed and `bullet.active` is true but `bullet2.active` is false, fire `bullet2`
- Both bullets move and deactivate independently

This is a hint for LAB 06 — where you will learn how to handle any number
of bullets without adding a new variable for each one.

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
    let mut bullet = Bullet { x: 0.0, y: 0.0, active: false };
    let mut bullet2 = Bullet { x: 0.0, y: 0.0, active: false };

    // In the loop:
    if is_key_pressed(KeyCode::Space) {
        if !bullet.active {
            bullet.x = ship.x + ship.width / 2.0;
            bullet.y = ship.y;
            bullet.active = true;
        } else if !bullet2.active {
            bullet2.x = ship.x + ship.width / 2.0;
            bullet2.y = ship.y;
            bullet2.active = true;
        }
    }

    // Move both bullets:
    if bullet.active  { bullet.y  -= 8.0; if bullet.y  < 0.0 { bullet.active  = false; } }
    if bullet2.active { bullet2.y -= 8.0; if bullet2.y < 0.0 { bullet2.active = false; } }

    // Draw both:
    draw_bullet(&bullet);
    draw_bullet(&bullet2);
```

**Notice the problem:** Two bullets required duplicating every piece of code.
Three bullets would triple it. Ten bullets would be absurd. This is why LAB 06
introduces `Vec<Bullet>` — a list that can hold any number of bullets with a
single piece of movement and drawing code.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Ship cannot exit left edge | Hold Left — ship stops at wall |
| Ship cannot exit right edge | Hold Right — ship stops at wall |
| Space fires a bullet | Press Space — white rectangle rises |
| Bullet disappears at top | Watch bullet exit the screen |
| After bullet disappears, can fire again | Fire, wait, fire again |
| `draw_ship` and `draw_bullet` are functions | They appear above `main` |
| `==` vs `=` error tested | Tried single `=` in `if`, saw error |
| Challenge: two bullets possible | Two bullets in air at same time |

---

## Quick Check Answers

**1. How do you check if `ship.x` is below zero?**
`if ship.x < 0.0 { ship.x = 0.0; }` — if the x is less than zero, snap it
back to zero. The `<` operator returns `true` when the left side is smaller.

**2. What does a `Bullet` struct need?**
At minimum: `x: f32`, `y: f32`, `active: bool`. Position tells us where to draw
it. `active` tells us whether it currently exists. You could add a `speed` field
too, if different bullets travel at different speeds.

**3. What is the alternative to copying `draw_rectangle` three times?**
A function. Define `fn draw_ship(ship: &Ship)` once. Call `draw_ship(&ship)`
anywhere you need it. If you change how the ship looks, you change one function.
All three call sites update automatically.

---

## What Is Next — LAB 04

You can shoot one bullet at a time. But it disappears and nothing happens.
In LAB 04 we add the alien fleet — a grid of colored rectangles marching
across the screen. For the first time, the game will have an objective.

*Continue to Space Invaders in Rust — LAB 04 — The Alien Fleet: Loops and Arrays.*
