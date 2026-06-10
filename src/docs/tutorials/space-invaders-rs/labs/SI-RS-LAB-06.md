# Space Invaders in Rust — LAB 06 — Aliens Strike Back: Multiple Bullets and Game Over

**What you will have by the end of this lab:**
Aliens randomly fire bullets downward. If an alien bullet hits the ship, you
lose a life. Lose all three lives — game over screen. The game is now fully
two-sided and genuinely challenging.

**Time:** 45–55 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. The player has one bullet (`Bullet` struct, `active: bool`). The aliens
>    can fire many bullets at once — potentially one from each column.
>    What should the alien bullets be stored in? A struct? A Vec?
> 2. Every frame, one random living alien has a small chance to fire.
>    What do you need to generate a random number in Rust?
> 3. "Lose a life" means: the player's life count decreases by 1, the ship
>    resets to its starting position, and the game continues. But if lives
>    reach 0, the game ends instead. How would you write that decision?
>
> *(Answers at the bottom.)*

---

## The Problem: Only One Side Has Weapons

Right now the game is one-sided. The player shoots at stationary targets.
No tension, no danger, no real game. We need the aliens to fight back.

The aliens will fire `EnemyBullet` objects that travel downward. Multiple
alien bullets can be in the air simultaneously — one per attacking alien.
A `Vec<EnemyBullet>` handles this naturally.

---

## Step 1 — Define Enemy Bullets

Add a new struct above `async fn main()`:

```rust
struct EnemyBullet {
    x: f32,
    y: f32,
}
// Note: no `active` field. We will use a different strategy —
// we add bullets to the Vec when fired, and REMOVE them when they leave
// the screen. The Vec IS the list of active bullets.
```

> **Two strategies for "does this exist":**
> Strategy A (player bullet): one struct with `active: bool`. The struct always
> exists; the bool says whether it is in play. Works for exactly one bullet.
>
> Strategy B (enemy bullets): a `Vec`. Each entry IS an active bullet. To add
> a bullet: `push`. To remove one: delete it from the Vec. No bool needed —
> if it is in the Vec, it is active.

---

## Step 2 — Fire Enemy Bullets Randomly

Enemy bullets fire based on chance. Each frame, we pick a random living alien
and give it a small probability of shooting.

First, add `rand` — Rust's random number crate:

```sh
cargo add rand
```

Add the `use` line at the top of the file:

```rust
use rand::Rng; // Rng is the trait that provides random number methods
```

> **Term: `trait`** — a collection of abilities that a type can have. `Rng`
> provides the ability to generate random numbers. You will learn traits fully
> in LAB 09. For now: `use rand::Rng` gives you access to random numbers.

Add enemy bullet creation inside the game loop, after the alien movement code:

```rust
        // Alien firing: each frame, one random living alien may shoot.
        let living_aliens: Vec<&Alien> = aliens.iter()
            .filter(|a| a.alive)
            .collect();

        if !living_aliens.is_empty() {
            let mut rng = rand::thread_rng();

            // gen_bool(probability): returns true with the given probability.
            // 0.005 = 0.5% chance per frame. At 60 fps = ~18% chance per second.
            if rng.gen_bool(0.005) {
                // Pick a random alien from the living ones.
                let idx   = rng.gen_range(0..living_aliens.len());
                let alien = living_aliens[idx];

                enemy_bullets.push(EnemyBullet {
                    x: alien.x + 15.0, // center of the alien (30px wide)
                    y: alien.y + 20.0, // bottom of the alien
                });
            }
        }
```

> **`.filter(|a| a.alive)`** — keeps only the items where the condition is true.
> Returns an *iterator* of living aliens. `.collect()` turns that iterator back
> into a `Vec`.

> **`rand::thread_rng()`** — creates a random number generator local to the
> current thread (safe to use in any game loop). `gen_bool(p)` returns `true`
> with probability `p`. `gen_range(0..n)` returns a random integer from 0 to n-1.

Also add the variable declaration in `main()`, after `let mut aliens = ...`:

```rust
    let mut enemy_bullets: Vec<EnemyBullet> = Vec::new();
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Compiles (possibly with unused variable warnings, which is fine).
The aliens still march. No visible bullets yet because we haven't drawn them.

---

## Step 3 — Move and Draw Enemy Bullets

Add a draw function:

```rust
fn draw_enemy_bullets(bullets: &Vec<EnemyBullet>) {
    for b in bullets {
        draw_rectangle(b.x - 2.0, b.y, 4.0, 10.0, ORANGE);
    }
}
```

Inside the game loop, add movement and removal:

```rust
        // Move enemy bullets downward.
        for b in &mut enemy_bullets {
            b.y += 5.0;
        }

        // Remove bullets that have left the bottom of the screen.
        // retain: keep only items where the condition is TRUE.
        // Items where the condition is FALSE are removed from the Vec.
        enemy_bullets.retain(|b| b.y < screen_height());
```

> **`.retain(|b| condition)`** — removes any item from the `Vec` where the
> condition is `false`. Keeps items where it is `true`. This is the standard
> way to delete items from a Vec while iterating it.
>
> **Why `retain` instead of a for loop + remove?**
> You cannot remove items from a `Vec` while iterating over it with a regular
> `for` loop — the indices shift and you would skip items or panic. `retain`
> handles this safely.

Add to the drawing section:

```rust
        clear_background(BLACK);
        draw_ship(&ship);
        draw_bullet(&bullet);
        draw_aliens(&aliens);
        draw_enemy_bullets(&enemy_bullets); // ← new
        next_frame().await
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Orange bullets occasionally appear from aliens and travel down.
Multiple can be in the air simultaneously. They disappear when they exit the screen.

**Change something:** Change `0.005` to `0.02`. Aliens fire much more often.
Change to `0.001` — very rare. Find a difficulty you enjoy.

---

## Step 4 — Enemy Bullets Hit the Ship

Add a lives counter in `main()`:

```rust
    let mut lives: i32 = 3;
    let ship_start_x = 300.0; // remember the starting x so we can reset
```

Add collision checking after the enemy bullet movement:

```rust
        // Check if any enemy bullet hit the ship.
        let mut hit_ship = false;
        enemy_bullets.retain(|b| {
            let touching = rects_overlap(
                b.x - 2.0, b.y, 4.0, 10.0,           // bullet
                ship.x, ship.y, ship.width, ship.height, // ship
            );
            if touching { hit_ship = true; }
            !touching  // retain bullets that did NOT hit the ship
        });

        if hit_ship {
            lives -= 1;
            ship.x = ship_start_x; // reset ship position
            bullet.active = false; // cancel any in-flight player bullet
        }
```

> **`retain` with a side effect:** The closure `|b| { ... !touching }` checks
> the overlap AND sets `hit_ship = true` if there is a hit. This is a common
> pattern: process an item while deciding whether to keep it.

### SAVE AND TRY

```sh
cargo run
```

Let an alien bullet hit you — the ship resets to its starting position.
Get hit repeatedly — lives decreases (though we do not display it yet).

---

## Step 5 — Display Lives and Handle Game Over

Add a lives display in the drawing section:

```rust
        let lives_text = format!("Lives: {}", lives);
        draw_text(&lives_text, 20.0, 30.0, 30.0, WHITE);

        let score_text = format!("Score: {}", score);
        draw_text(&score_text, 20.0, 60.0, 30.0, WHITE);
```

Add a game-over check after the hit_ship block:

```rust
        if lives <= 0 {
            clear_background(BLACK);
            draw_text("GAME OVER", 250.0, 280.0, 70.0, RED);
            let s = format!("Final Score: {}", score);
            draw_text(&s, 280.0, 360.0, 40.0, WHITE);
            next_frame().await;
            loop { next_frame().await }
        }
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** "Lives: 3" shows at top left. Getting hit decreases the count.
Reaching "Lives: 0" shows the game over screen with your final score.

**Change something:** Change `lives: i32 = 3` to `lives: i32 = 1`. One hit
and you're done — brutal difficulty. Try it, then set it back to 3.

---

## The Concept: Closures — Functions Written Inline

You have used closures in several places: `|a| a.alive`, `|b| b.y < screen_height()`.
Now let's understand what they are.

> **The Story:** You are organizing files. You tell your assistant: "Put away
> everything that is older than 2020." You do not write a formal policy document —
> you just say the rule on the spot. A **closure** is a rule (a mini-function)
> written on the spot, right where you need it.

> **Term: closure** — an anonymous (unnamed) function defined inline. Written
> as `|parameters| expression`. It *captures* variables from the surrounding scope
> (unlike a standalone `fn` which cannot).

**The difference between a function and a closure:**

```rust
// A named function — cannot see variables from outside.
fn is_alive(a: &Alien) -> bool {
    a.alive
}

// A closure — same thing, written inline.
// The | | is the parameter list.
let is_alive = |a: &Alien| a.alive;

// Both work the same way when passed to .filter():
aliens.iter().filter(is_alive)
aliens.iter().filter(|a| a.alive)
```

**Capturing:**
```rust
let threshold = 100.0;  // a variable in the outer scope

// This closure CAPTURES `threshold` from outside.
// A standalone fn could not do this.
aliens.iter().filter(|a| a.x > threshold)
```

---

## 🎯 Challenge: Game Over When Aliens Reach the Bottom

**The goal:** If any alien descends to y > 500 (near the ship), the game is over —
they have invaded the planet.

You know: `.iter().any(|a| condition)`, `a.alive`, `a.y`.

Add the check after the alien movement code. Show a message like:
"THEY LANDED! GAME OVER" distinct from the "LIVES: 0" game over.

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
        // Check if any alien has reached the bottom.
        let invaded = aliens.iter().any(|a| a.alive && a.y > 500.0);
        if invaded {
            clear_background(BLACK);
            draw_text("THEY LANDED!", 220.0, 260.0, 60.0, RED);
            draw_text("GAME OVER",    260.0, 340.0, 60.0, RED);
            let s = format!("Score: {}", score);
            draw_text(&s, 300.0, 400.0, 40.0, WHITE);
            next_frame().await;
            loop { next_frame().await }
        }
```

**When to put this check:** After alien movement but before drawing. If aliens
land on a frame where `hit_right || hit_left` also triggers, you might see them
jump down AND trigger the check in the same frame. This is fine — it feels
dramatic. For a cleaner game, check after all alien updates are complete.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Orange enemy bullets appear | Watch for a few seconds |
| Multiple enemy bullets in air at once | Several orange bullets visible |
| Enemy bullets disappear at bottom | Watch them exit the screen |
| Ship hit → loses a life | Let bullets hit you — lives decreases |
| Ship resets on hit | Ship snaps back to start position |
| Lives: 0 → game over screen | Get hit 3 times |
| Score and lives displayed during play | Both visible at top of screen |
| Challenge: aliens landing = game over | Aliens drop low enough → special message |

---

## Quick Check Answers

**1. What should alien bullets be stored in?**
A `Vec<EnemyBullet>`. The number of alien bullets in the air at any moment varies —
zero when no one has fired, potentially many when several aliens shoot. A `Vec`
holds any number and handles adding (`.push`) and removing (`.retain`) cleanly.
A single struct with `active: bool` would only allow one enemy bullet at a time.

**2. What do you need to generate a random number?**
The `rand` crate (`cargo add rand`), the `use rand::Rng;` import, and
`rand::thread_rng()` to get a generator. Then `rng.gen_bool(probability)` for
a true/false result or `rng.gen_range(0..n)` for an integer in a range.

**3. How do you write "lose a life OR game over"?**
```rust
lives -= 1;
if lives <= 0 {
    // game over
} else {
    // reset ship, continue
}
```
`if`/`else` handles both cases. The `if` branch ends the game; the `else` branch
resets the ship. Only one runs per hit.

---

## What Is Next — LAB 07

The game plays well, but the code in `main()` has grown large and tangled.
In LAB 07 we learn how to split code into **modules** — separate files with
clear responsibilities. The game logic stays the same; the organization improves
dramatically, setting up everything needed for LAB 08 and beyond.

*Continue to Space Invaders in Rust — LAB 07 — Clean Code: Modules and `impl`.*
