# Space Invaders in Rust — LAB 04 — The Alien Fleet: Loops and `Vec`

**What you will have by the end of this lab:**
A grid of aliens marches across the top of the screen — 5 columns, 3 rows.
Your bullet travels upward. The aliens are visible. The scene looks like Space Invaders.
Collision comes in LAB 05.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. There are 15 aliens (5 columns × 3 rows). The challenge problem in LAB 03
>    showed that two bullets needed duplicated code. Imagine writing 15 separate
>    `Alien` variables — `alien1`, `alien2`, ... `alien15`. Why is this a problem?
> 2. When the aliens reach the right wall, they should drop down and march left.
>    When they reach the left wall, drop and march right. What information do
>    you need to store to make this work?
> 3. You want to draw all 15 aliens. You know how to draw one. What language
>    feature lets you repeat an action for each item in a collection?
>
> *(Answers at the bottom.)*

---

## The Problem: 15 Variables Is Absurd

In LAB 03's challenge, two bullets needed every piece of bullet code duplicated.
Imagine doing that for 15 aliens:

```rust
let mut alien1  = Alien { x: 100.0, y: 100.0, alive: true };
let mut alien2  = Alien { x: 160.0, y: 100.0, alive: true };
let mut alien3  = Alien { x: 220.0, y: 100.0, alive: true };
// ... 12 more ...
```

And then drawing:
```rust
draw_alien(&alien1);
draw_alien(&alien2);
// ... 13 more ...
```

And then moving every alien when the fleet reaches a wall... This approach
collapses immediately. We need a way to store a variable number of things
and do something to all of them with one piece of code.

---

## The Concept: `Vec<T>` — A List That Grows

> **The Story:** You are organizing a tournament. At the start, you do not
> know how many players will sign up. You keep a list on a clipboard. As players
> arrive, you add their name. As they lose, you cross them off. The list expands
> and shrinks. You never need to decide in advance how many lines the clipboard
> has.
>
> In Rust, this clipboard is called a `Vec` (pronounced "vector"). It holds
> any number of items of the same type. You add items with `push`. You read
> all items with a `for` loop.

> **Term: `Vec<T>`** — a list that can hold any number of values of type `T`.
> `T` is a placeholder for the actual type. `Vec<Alien>` holds aliens.
> `Vec<f32>` holds decimal numbers. `Vec<bool>` holds true/false values.

**The smallest possible example — before using it in the game:**

```rust
fn main() {
    let mut numbers: Vec<i32> = Vec::new();  // empty list of integers

    numbers.push(10);   // add 10 to the list
    numbers.push(20);   // add 20
    numbers.push(30);   // add 30

    // for loop: run this block once for each item in the list.
    for n in &numbers {
        println!("{}", n);  // prints 10, then 20, then 30
    }

    println!("Total items: {}", numbers.len()); // prints 3
}
```

> **Term: `push`** — adds one item to the end of a `Vec`. Like adding a new
> line to the clipboard.

> **Term: `for item in &collection`** — a loop that runs once for each item.
> `item` is the name you give to the current item for that iteration.
> The `&` means borrow (read without taking ownership) — same `&` as in LAB 03.

> **Term: `len()`** — returns how many items the `Vec` currently holds.

---

## Step 1 — Define the Alien Struct

Add above `struct Bullet`:

```rust
struct Alien {
    x:     f32,
    y:     f32,
    alive: bool,  // false = this alien was shot, do not draw it
}
```

---

## Step 2 — Create the Alien Grid

Add a function that builds a Vec of aliens in a grid pattern.
Put this above `async fn main()`:

```rust
fn make_alien_grid() -> Vec<Alien> {
    let mut aliens = Vec::new();

    let cols    = 5;      // 5 aliens across
    let rows    = 3;      // 3 rows deep
    let spacing = 80.0;   // pixels between alien centers
    let start_x = 100.0;  // x position of the leftmost alien
    let start_y = 80.0;   // y position of the top row

    for row in 0..rows {
        for col in 0..cols {
            aliens.push(Alien {
                x:     start_x + col as f32 * spacing,
                y:     start_y + row as f32 * spacing,
                alive: true,
            });
        }
    }

    aliens  // return the completed list
}
```

> **`0..cols`** — a *range*: the integers from 0 up to (but not including) `cols`.
> With `cols = 5`, this is: 0, 1, 2, 3, 4. Five values. Five columns.

> **`col as f32`** — `col` is an integer (type `i32`). Multiplying an integer
> by a decimal (`spacing`) requires them to be the same type. `as f32` converts
> the integer to a decimal. You will learn why Rust requires this in LAB 05.

> **Returning a value:** The function ends with `aliens` (no semicolon). In Rust,
> the last expression in a function is automatically returned. This is the value
> the caller receives.

### SAVE AND TRY

```sh
cargo build
```

**Expected:** Compiles with no errors. The function exists but is not called yet.
`cargo build` checks for errors without running the program.

---

## Step 3 — Add Aliens to `main` and Draw Them

In `async fn main()`, add the alien list after the bullet:

```rust
    let mut aliens = make_alien_grid();
```

Add a draw function above `async fn main()`:

```rust
fn draw_aliens(aliens: &Vec<Alien>) {
    for alien in aliens {
        if alien.alive {
            draw_rectangle(alien.x, alien.y, 30.0, 20.0, RED);
        }
    }
}
```

Add the call inside the game loop, in the drawing section:

```rust
        clear_background(BLACK);
        draw_ship(&ship);
        draw_bullet(&bullet);
        draw_aliens(&aliens);    // ← new
        next_frame().await
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** 15 red rectangles appear in a 5×3 grid near the top of the window.
Your ship and bullet still work exactly as before.

**Change something:** Change `RED` to `ORANGE` in `draw_aliens`. Run — all
aliens are orange with one change.

---

## The Concept: `for` Loops in Depth

The `for` loop is how you work with every item in a `Vec`. Let's look at
what is happening in `draw_aliens`:

```rust
for alien in aliens {
    if alien.alive {
        draw_rectangle(alien.x, alien.y, 30.0, 20.0, RED);
    }
}
```

- First iteration: `alien` = first alien in the list. Draw it if alive.
- Second iteration: `alien` = second alien. Draw it if alive.
- ... repeats until all 15 aliens have been visited.
- After the last alien, the loop ends.

> **The Rule:** A `for` loop visits every item in a collection, once, in order,
> from first to last. It cannot skip items. It cannot go backwards (without extra tools).

**Break it on purpose:** Change `for alien in aliens` to `for alien in &aliens`
and then to `for alien in aliens` again. In this context, both work — but they
have a difference in ownership. In LAB 05 you will learn exactly why.

---

## Step 4 — Make the Aliens March

Right now the aliens sit still. They need to march right, drop, march left, drop.
This requires storing the direction of movement.

Add a direction tracker to `main()` (not inside the alien struct — all aliens
move together as a fleet):

```rust
    let mut fleet_dx: f32 = 1.5;  // positive = moving right, negative = moving left
```

Inside the loop, after the bullet code, add alien movement:

```rust
        // Move all living aliens horizontally.
        for alien in &mut aliens {
            if alien.alive {
                alien.x += fleet_dx;
            }
        }

        // Check if any alien has reached the right or left wall.
        // If so, reverse direction and drop all aliens down.
        let hit_right = aliens.iter().any(|a| a.alive && a.x > screen_width() - 50.0);
        let hit_left  = aliens.iter().any(|a| a.alive && a.x < 20.0);

        if hit_right || hit_left {
            fleet_dx = -fleet_dx;           // reverse direction
            for alien in &mut aliens {
                if alien.alive {
                    alien.y += 20.0;        // drop down one row
                }
            }
        }
```

> **`&mut aliens` vs `&aliens`:**
> `&aliens` — borrow for reading (you can look but not change).
> `&mut aliens` — borrow for writing (you can look AND change).
> Moving aliens requires changing `alien.x` — so we need `&mut`.

> **`.iter().any(|a| condition)`** — checks if ANY item in the list
> satisfies the condition. Returns `true` as soon as one item does,
> `false` if none do. The `|a| condition` part is a *closure* — a mini
> function written inline. You will learn closures properly in LAB 06.
> For now: read `|a| a.alive && a.x > 750.0` as "for each alien `a`, check
> if it is alive AND its x is past 750."

### SAVE AND TRY

```sh
cargo run
```

**Expected:** The alien fleet marches right, drops, reverses, drops, reverses.
Your ship and bullets still work. The scene looks like Space Invaders.

**Change something:** Change `fleet_dx: f32 = 1.5` to `3.0`. The aliens march
faster. Change to `0.5` — very slow, almost imperceptible. Find a pace you like.

---

## Complete Code So Far

```rust
use macroquad::prelude::*;

struct Ship {
    x: f32, y: f32, width: f32, height: f32, speed: f32,
}

struct Bullet {
    x: f32, y: f32, active: bool,
}

struct Alien {
    x: f32, y: f32, alive: bool,
}

fn make_alien_grid() -> Vec<Alien> {
    let mut aliens = Vec::new();
    for row in 0..3 {
        for col in 0..5 {
            aliens.push(Alien {
                x:     100.0 + col as f32 * 80.0,
                y:      80.0 + row as f32 * 60.0,
                alive: true,
            });
        }
    }
    aliens
}

fn draw_ship(ship: &Ship) {
    draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
}

fn draw_bullet(bullet: &Bullet) {
    if bullet.active {
        draw_rectangle(bullet.x - 2.0, bullet.y, 4.0, 10.0, WHITE);
    }
}

fn draw_aliens(aliens: &Vec<Alien>) {
    for alien in aliens {
        if alien.alive {
            draw_rectangle(alien.x, alien.y, 30.0, 20.0, RED);
        }
    }
}

#[macroquad::main("Space Invaders")]
async fn main() {
    let mut ship   = Ship   { x: 300.0, y: 550.0, width: 40.0, height: 20.0, speed: 4.0 };
    let mut bullet = Bullet { x: 0.0,   y: 0.0,   active: false };
    let mut aliens = make_alien_grid();
    let mut fleet_dx: f32 = 1.5;

    loop {
        // Ship movement + bounds
        if is_key_down(KeyCode::Right) { ship.x += ship.speed; }
        if is_key_down(KeyCode::Left)  { ship.x -= ship.speed; }
        if ship.x < 0.0                         { ship.x = 0.0; }
        if ship.x > screen_width() - ship.width { ship.x = screen_width() - ship.width; }

        // Fire
        if is_key_pressed(KeyCode::Space) && !bullet.active {
            bullet.x = ship.x + ship.width / 2.0;
            bullet.y = ship.y;
            bullet.active = true;
        }

        // Move bullet
        if bullet.active {
            bullet.y -= 8.0;
            if bullet.y < 0.0 { bullet.active = false; }
        }

        // Move aliens
        for alien in &mut aliens {
            if alien.alive { alien.x += fleet_dx; }
        }
        let hit_right = aliens.iter().any(|a| a.alive && a.x > screen_width() - 50.0);
        let hit_left  = aliens.iter().any(|a| a.alive && a.x < 20.0);
        if hit_right || hit_left {
            fleet_dx = -fleet_dx;
            for alien in &mut aliens { if alien.alive { alien.y += 20.0; } }
        }

        // Draw
        clear_background(BLACK);
        draw_ship(&ship);
        draw_bullet(&bullet);
        draw_aliens(&aliens);
        next_frame().await
    }
}
```

---

## 🎯 Challenge: Make Different Rows Different Colors

**The goal:** Row 0 (top row) should be `PINK`, row 1 `ORANGE`, row 2 `RED`.

You will need to store the row number in the `Alien` struct so `draw_aliens`
knows which color to use. Add a `row: usize` field.

In `make_alien_grid`, set `row: row` when creating each alien.

In `draw_aliens`, use a `match` expression to pick the color:
```rust
let color = match alien.row {
    0 => PINK,
    1 => ORANGE,
    _ => RED,   // _ means "anything else"
};
```

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
struct Alien {
    x:    f32,
    y:    f32,
    alive: bool,
    row:  usize,   // ← new field
}

// In make_alien_grid:
for row in 0..3 {
    for col in 0..5 {
        aliens.push(Alien {
            x:     100.0 + col as f32 * 80.0,
            y:      80.0 + row as f32 * 60.0,
            alive: true,
            row,        // ← shorthand: when variable name matches field name
        });
    }
}

// In draw_aliens:
fn draw_aliens(aliens: &Vec<Alien>) {
    for alien in aliens {
        if alien.alive {
            let color = match alien.row {
                0 => PINK,
                1 => ORANGE,
                _ => RED,
            };
            draw_rectangle(alien.x, alien.y, 30.0, 20.0, color);
        }
    }
}
```

**`match`** — like `if`, but designed for choosing between multiple options.
`match alien.row { 0 => ..., 1 => ..., _ => ... }` reads: "if row is 0, use PINK;
if 1, use ORANGE; if anything else, use RED." The `_` is a catch-all that covers
every case not explicitly listed. You will use `match` constantly — it comes back
properly in LAB 08 (Game State).

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| 15 aliens appear in a 5×3 grid | Count the rectangles |
| Aliens march right, drop, reverse | Watch for 15+ seconds |
| Ship and bullets still work | Move and fire while aliens march |
| `draw_aliens` uses a `for` loop | One loop draws all 15 |
| `fleet_dx` speed change works | Tried different values |
| Challenge: three different row colors | Top row, middle, bottom different colors |

---

## Quick Check Answers

**1. Why is 15 separate variables a problem?**
Every operation — moving, drawing, collision checking — requires 15 lines of
nearly identical code. Adding a 16th alien requires adding code in six or more
places. Removing an alien (when it is shot) requires special-casing one variable.
A `Vec<Alien>` holds all 15, and one `for` loop handles all of them.

**2. What information does the fleet need to march correctly?**
`fleet_dx: f32` — the horizontal velocity. Positive = moving right. Negative =
moving left. When any alien touches a wall, negate `fleet_dx` (multiply by -1)
and drop all aliens down by a fixed amount. One number controls the entire fleet.

**3. What language feature repeats an action for each item?**
A `for` loop. `for alien in &mut aliens { alien.x += fleet_dx; }` applies the
movement to every alien in the list with one block of code.

---

## What Is Next — LAB 05

Bullets fly, aliens march — but nothing happens when they meet. In LAB 05 we
write collision detection: checking if the bullet's rectangle overlaps any
alien's rectangle. When it does, the alien dies and the bullet stops. For the
first time, something will actually blow up.

*Continue to Space Invaders in Rust — LAB 05 — Collision: Loops, `retain`, and Overlap Math.*
