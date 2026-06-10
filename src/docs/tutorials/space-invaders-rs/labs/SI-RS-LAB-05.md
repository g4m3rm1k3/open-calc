# Space Invaders in Rust — LAB 05 — Collision: Overlap Math and Killing Aliens

**What you will have by the end of this lab:**
When your bullet hits an alien, the alien disappears and the bullet stops.
Killing all aliens shows a "You Win!" message. This is the first time the game
has a real objective.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. Two rectangles overlap if and only if they are close enough on BOTH the
>    horizontal axis AND the vertical axis. Think of two sliding doors: they
>    overlap only when they are in the same place left-to-right AND at the
>    same height. Can you write the condition in plain English before seeing
>    the code?
> 2. When a bullet hits alien #7 out of 15, you want to mark that alien as
>    `alive: false`. But you also want the bullet to stop. Both things happen
>    at the same moment. What Rust keyword from LAB 03 do you already know
>    that sets a `bool` to false?
> 3. What happens if you try to change items inside a `Vec` while checking
>    them in the same `for` loop? Think about this before reading.
>
> *(Answers at the bottom.)*

---

## The Problem: Bullets Pass Right Through Aliens

Run the game. Fire bullets. They fly straight through the aliens like ghosts.
Nothing reacts. There is no collision detection — we need to write it.

Collision detection answers one question per pair of objects: **do these two
rectangles overlap?**

---

## The Concept: Rectangle Overlap

> **The Story:** Imagine two pieces of paper on a table. They overlap if any
> part of one piece is covered by the other. Knowing whether they overlap
> requires knowing where each one starts and ends — horizontally and vertically.

Two rectangles overlap when ALL four of these are true at the same time:

```
rect_a's right edge  > rect_b's left edge    (A extends past B's left)
rect_a's left edge   < rect_b's right edge   (A starts before B's right)
rect_a's bottom edge > rect_b's top edge     (A extends past B's top)
rect_a's top edge    < rect_b's bottom edge  (A starts before B's bottom)
```

In code, given two rectangles each with `x, y, width, height`:

```rust
fn rects_overlap(ax: f32, ay: f32, aw: f32, ah: f32,
                 bx: f32, by: f32, bw: f32, bh: f32) -> bool {
    ax < bx + bw   // A's left is before B's right
    && ax + aw > bx // A's right is past B's left
    && ay < by + bh // A's top is before B's bottom
    && ay + ah > by // A's bottom is past B's top
}
```

> **`-> bool`** — the `->` in a function signature declares the *return type*.
> This function produces a `bool` value (true = overlap, false = no overlap).
> The caller receives that `bool` and can use it in an `if`.

> **`&&`** — "and": ALL conditions must be true for the whole expression to be true.

Let's verify this with the smallest possible example before using it in the game.
Mentally test it:
- Rectangle A: x=0, y=0, w=10, h=10 (a 10×10 box at the origin)
- Rectangle B: x=5, y=5, w=10, h=10 (another box, shifted 5 right and 5 down)
- Do they overlap? Yes — they share the region (5–10, 5–10).

Plug into the formula:
- `0 < 5+10 = 15` ✓
- `0+10=10 > 5` ✓
- `0 < 5+10=15` ✓
- `0+10=10 > 5` ✓
- All four true → overlap. ✓

Now test with no overlap:
- Rectangle A: x=0, y=0, w=10, h=10
- Rectangle B: x=20, y=0, w=10, h=10 (far to the right, no contact)
- `0 < 20+10=30` ✓ but `0+10=10 > 20`? No — 10 is NOT greater than 20. ✗
- One condition fails → no overlap. ✓

---

## Step 1 — Add the `rects_overlap` Function

Add this above `async fn main()`:

```rust
fn rects_overlap(ax: f32, ay: f32, aw: f32, ah: f32,
                 bx: f32, by: f32, bw: f32, bh: f32) -> bool {
    ax < bx + bw
        && ax + aw > bx
        && ay < by + bh
        && ay + ah > by
}
```

### SAVE AND TRY

```sh
cargo build
```

**Expected:** Compiles. The function exists but is not called yet.

---

## Step 2 — Check Bullet vs Every Alien

Now we need to loop through every alien and check if the bullet overlaps it.
If it does: kill the alien and deactivate the bullet.

Add this inside the game loop, after the bullet movement code:

```rust
        // Collision: bullet vs aliens
        if bullet.active {
            for alien in &mut aliens {
                if alien.alive {
                    let hit = rects_overlap(
                        bullet.x - 2.0, bullet.y, 4.0, 10.0,  // bullet rect
                        alien.x,        alien.y,  30.0, 20.0,  // alien rect
                    );
                    if hit {
                        alien.alive   = false;   // kill the alien
                        bullet.active = false;   // stop the bullet
                    }
                }
            }
        }
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Fire a bullet at an alien — the alien disappears and the bullet
stops. Fire at another alien — same result. The marching continues with
only surviving aliens.

**Change something:** Remove the `if bullet.active` outer check. Fire a bullet
and let it fly off the top without hitting anything. Then notice — on the next
fire, the "dead" bullet is checked against aliens on its way from 0,0. The outer
check prevents checking a bullet that is not in the air.

Put the outer check back.

---

## The Concept: Returning Values from Functions

`rects_overlap` returns a `bool`. Let's look at how that works:

```rust
fn add(a: f32, b: f32) -> f32 {  // -> f32: this function produces an f32
    a + b                         // last expression, no semicolon = returned value
}

fn main() {
    let result = add(3.0, 5.0);  // result holds the returned value: 8.0
    println!("{}", result);       // prints 8.0
}
```

> **The Rule:** The last expression in a function body (no semicolon at the end)
> is the return value. You can also write `return value;` explicitly anywhere,
> but Rust programmers usually prefer the no-semicolon style for the final value.

> **Semicolons matter:**
> - `a + b` → returns the result
> - `a + b;` → runs the expression and throws away the result (returns nothing)

---

## Step 3 — Detect Win Condition

Add a check after the collision code:

```rust
        // Win condition: all aliens defeated.
        let all_dead = aliens.iter().all(|a| !a.alive);
        if all_dead {
            // Draw a win message over the game and stop.
            clear_background(BLACK);
            draw_text("YOU WIN!", 300.0, 300.0, 60.0, YELLOW);
            next_frame().await;
            // Keep showing the win screen until the window is closed.
            loop { next_frame().await }
        }
```

> **`.iter().all(|a| condition)`** — returns `true` only if ALL items satisfy
> the condition. The opposite of `.any()` from LAB 04.
> `!a.alive` means "NOT alive" — an alien satisfies the condition if it is dead.

> **`draw_text(text, x, y, font_size, color)`** — macroquad's function for
> drawing text on screen. `font_size` is in pixels.

### SAVE AND TRY

```sh
cargo run
```

Kill all 15 aliens. "YOU WIN!" appears in yellow. The game freezes on that screen.

---

## The Concept: Ownership — Why `&` and `&mut` Exist

You have been writing `&aliens` and `&mut aliens` without a full explanation.
Now is the right moment.

> **The Story:** Imagine a library book. Only one person can *own* (check out)
> a book at a time. While someone else has it checked out, you cannot take it —
> but you can go to the library and READ it there. That is borrowing.
>
> In Rust, every value has exactly ONE owner. When the owner is done, the value
> is destroyed. If you want to give a function access to a value without giving
> up ownership, you *borrow* it with `&`.

> **Term: ownership** — every value in Rust has one owner (one variable that
> "has" it). When that variable ends, the value is cleaned up automatically.
> No garbage collector needed — Rust tracks this at compile time.

> **Term: borrow (`&T`)** — temporary read-only access to a value. Like reading
> a library book in the reading room. Many people can borrow (read) at the same time.

> **Term: mutable borrow (`&mut T`)** — temporary read AND write access. Like
> having the book checked out exclusively. Only one person at a time.

**Why does this matter for `Vec`?**

```rust
fn draw_aliens(aliens: &Vec<Alien>)      // borrow: read the list, don't change it
fn move_aliens(aliens: &mut Vec<Alien>)  // mutable borrow: read AND change positions
```

If you try to pass `aliens` without `&`, Rust *moves* ownership into the function.
The game loop no longer owns `aliens` after the call — it cannot use it again.

**Break it on purpose:** Change `draw_aliens(&aliens)` to `draw_aliens(aliens)`
(remove the `&`):

```sh
cargo run
```

**Expected error:**
```
error[E0382]: borrow of moved value: `aliens`
```

Rust says: you gave ownership to `draw_aliens`. After that call, the game loop
no longer has `aliens` — so it cannot pass it to `move_aliens` or check collisions.

**Fix it:** Put the `&` back. Ownership stays with the game loop. Functions
only borrow what they need.

---

## Complete Code So Far

```rust
use macroquad::prelude::*;

struct Ship   { x: f32, y: f32, width: f32, height: f32, speed: f32 }
struct Bullet { x: f32, y: f32, active: bool }
struct Alien  { x: f32, y: f32, alive: bool, row: usize }

fn make_alien_grid() -> Vec<Alien> {
    let mut aliens = Vec::new();
    for row in 0..3 {
        for col in 0..5 {
            aliens.push(Alien {
                x: 100.0 + col as f32 * 80.0,
                y:  80.0 + row as f32 * 60.0,
                alive: true,
                row,
            });
        }
    }
    aliens
}

fn rects_overlap(ax: f32, ay: f32, aw: f32, ah: f32,
                 bx: f32, by: f32, bw: f32, bh: f32) -> bool {
    ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

fn draw_ship(ship: &Ship) {
    draw_rectangle(ship.x, ship.y, ship.width, ship.height, GREEN);
}
fn draw_bullet(bullet: &Bullet) {
    if bullet.active { draw_rectangle(bullet.x - 2.0, bullet.y, 4.0, 10.0, WHITE); }
}
fn draw_aliens(aliens: &Vec<Alien>) {
    for alien in aliens {
        if alien.alive {
            let color = match alien.row { 0 => PINK, 1 => ORANGE, _ => RED };
            draw_rectangle(alien.x, alien.y, 30.0, 20.0, color);
        }
    }
}

#[macroquad::main("Space Invaders")]
async fn main() {
    let mut ship   = Ship   { x: 300.0, y: 550.0, width: 40.0, height: 20.0, speed: 4.0 };
    let mut bullet = Bullet { x: 0.0, y: 0.0, active: false };
    let mut aliens = make_alien_grid();
    let mut fleet_dx: f32 = 1.5;

    loop {
        if is_key_down(KeyCode::Right) { ship.x += ship.speed; }
        if is_key_down(KeyCode::Left)  { ship.x -= ship.speed; }
        if ship.x < 0.0                         { ship.x = 0.0; }
        if ship.x > screen_width() - ship.width { ship.x = screen_width() - ship.width; }

        if is_key_pressed(KeyCode::Space) && !bullet.active {
            bullet.x = ship.x + ship.width / 2.0;
            bullet.y = ship.y;
            bullet.active = true;
        }
        if bullet.active {
            bullet.y -= 8.0;
            if bullet.y < 0.0 { bullet.active = false; }
        }

        for alien in &mut aliens { if alien.alive { alien.x += fleet_dx; } }
        let hit_right = aliens.iter().any(|a| a.alive && a.x > screen_width() - 50.0);
        let hit_left  = aliens.iter().any(|a| a.alive && a.x < 20.0);
        if hit_right || hit_left {
            fleet_dx = -fleet_dx;
            for alien in &mut aliens { if alien.alive { alien.y += 20.0; } }
        }

        if bullet.active {
            for alien in &mut aliens {
                if alien.alive && rects_overlap(
                    bullet.x - 2.0, bullet.y, 4.0, 10.0,
                    alien.x, alien.y, 30.0, 20.0,
                ) {
                    alien.alive   = false;
                    bullet.active = false;
                }
            }
        }

        let all_dead = aliens.iter().all(|a| !a.alive);
        if all_dead {
            clear_background(BLACK);
            draw_text("YOU WIN!", 300.0, 300.0, 60.0, YELLOW);
            next_frame().await;
            loop { next_frame().await }
        }

        clear_background(BLACK);
        draw_ship(&ship);
        draw_bullet(&bullet);
        draw_aliens(&aliens);
        next_frame().await
    }
}
```

---

## 🎯 Challenge: Score Counter

**The goal:** Display a score at the top of the screen. Each alien killed adds
10 points. The score updates in real time as you play.

You know: `draw_text`, `let mut score: u32 = 0`, `score += 10`.

`draw_text` signature: `draw_text(text: &str, x: f32, y: f32, font_size: f32, color: Color)`

To convert a number to a displayable string:
```rust
let text = format!("Score: {}", score);  // creates "Score: 0", "Score: 10", etc.
draw_text(&text, 20.0, 30.0, 30.0, WHITE);
```

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
    let mut score: u32 = 0;  // add in main() alongside other variables

    // Inside the collision check, after alien.alive = false:
    alien.alive   = false;
    bullet.active = false;
    score        += 10;

    // In the drawing section, after clear_background:
    let score_text = format!("Score: {}", score);
    draw_text(&score_text, 20.0, 30.0, 30.0, WHITE);
```

> **`u32`** — an unsigned 32-bit integer. "Unsigned" means it cannot be negative
> (scores never go below zero). `u32` can hold values 0 to ~4 billion.
> Compare to `f32` (decimal numbers) and `i32` (integers including negatives).
> You will learn about all Rust's number types in LAB 07.

> **`format!`** — like `println!` but instead of printing to the terminal,
> it returns the formatted text as a `String`. You then pass that String to
> `draw_text`.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Bullet kills alien on contact | Fire at an alien — it disappears |
| Bullet stops when it hits alien | Bullet does not continue through |
| Remaining aliens keep marching | Survivors continue after one dies |
| All aliens dead → "YOU WIN!" | Kill all 15 — win screen appears |
| Removing `&` from `draw_aliens` causes error | Tried it, saw error, put `&` back |
| Challenge: score displays and updates | "Score: 0" shows, increases by 10 per kill |

---

## Quick Check Answers

**1. Plain-English overlap condition:**
Rectangle A overlaps rectangle B when: A's right edge is to the right of B's
left edge, AND A's left edge is to the left of B's right edge, AND A's bottom
is below B's top, AND A's top is above B's bottom. All four must be true — if
any one is false, there is a gap and they do not overlap.

**2. What Rust keyword sets a bool to false?**
Assignment: `alien.alive = false` and `bullet.active = false`. No special keyword
needed — you just assign the value directly.

**3. What happens if you try to change items in a Vec while iterating it?**
In Rust, you can have ONE mutable borrow OR many immutable borrows, but not both
at once. Iterating with `&mut aliens` is one mutable borrow. Trying to also read
the bullet (which has its own variable) is fine. But trying to start a second
mutable borrow on `aliens` inside the loop would fail. Rust prevents these
situations at compile time, before the program runs.

---

## What Is Next — LAB 06

The game has a win condition, but no lose condition. In LAB 06 the aliens shoot
back — enemy bullets travel downward. If any alien bullet hits the ship, the
game ends. You will also add lives. The game becomes genuinely challenging.

*Continue to Space Invaders in Rust — LAB 06 — Aliens Strike Back: Multiple Bullets and Game Over.*
