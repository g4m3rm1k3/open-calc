# Space Invaders in Rust — LAB 07 — Clean Code: `impl` and Methods

**What you will have by the end of this lab:**
The same game as LAB 06, but with the ship, alien, and bullet logic moved
*onto* the structs themselves using `impl`. The game loop shrinks from ~60
lines to ~25 readable lines. Nothing changes on screen — everything changes
in how the code is organized.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. You have `draw_ship(&ship)` and `draw_bullet(&bullet)` as standalone
>    functions. Is there a way to call them as `ship.draw()` and `bullet.draw()`
>    instead — where the function "belongs" to the struct it operates on?
> 2. Every time you create a `Ship`, you write all five field values inline.
>    If you add a new field, you must update every place a `Ship` is created.
>    How would you make "create a Ship with default values" a reusable, one-line call?
> 3. The game loop currently does: move ship, check bounds, fire, move bullet,
>    move aliens, check walls, fire alien, move enemy bullets, check collisions.
>    That is a lot. Which of these logically "belong to" the ship? Which belong
>    to the aliens?
>
> *(Answers at the bottom.)*

---

## The Problem: All Logic Lives in One Place

After six labs, `async fn main()` is getting long. Every behavior — ship
movement, bullet firing, alien marching, collision — is packed into one function
that keeps growing.

Reading the code requires holding the entire game in your head simultaneously.
When a bug appears, you must scan dozens of lines to find where to look.

The solution is to attach behavior to the struct it belongs to.

---

## The Concept: `impl` — Giving Structs Behavior

> **The Story:** A car has properties (color, number of doors, fuel level)
> and actions (drive, brake, refuel). You do not define "drive" separately
> from the car and pass the car in every time. Drive belongs to the car.
> In code, `impl` lets you attach actions to a struct, so `car.drive()` works.

> **Term: `impl`** — short for "implementation." An `impl` block is where you
> define the functions that belong to a struct. These functions are called
> **methods**.

> **Term: method** — a function attached to a struct. Called with dot notation:
> `ship.update()`, `alien.draw()`. The first parameter is always `self` (the
> struct itself) or `&self` (borrowed) or `&mut self` (mutably borrowed).

**The smallest possible example — before applying to the game:**

```rust
struct Circle {
    x:      f32,
    y:      f32,
    radius: f32,
}

impl Circle {
    // A method that needs to READ the circle's data.
    // `&self` = borrow the circle for reading.
    fn area(&self) -> f32 {
        3.14159 * self.radius * self.radius
    }

    // A method that needs to CHANGE the circle's data.
    // `&mut self` = borrow the circle for writing.
    fn grow(&mut self, amount: f32) {
        self.radius += amount;
    }
}

fn main() {
    let mut c = Circle { x: 0.0, y: 0.0, radius: 5.0 };
    println!("Area: {}", c.area());   // calls area, reads radius
    c.grow(2.0);                       // calls grow, changes radius
    println!("New area: {}", c.area());
}
```

> **`self`** — inside an `impl` method, `self` refers to the struct instance
> the method was called on. `self.radius` is the specific circle's radius.
> `&self` = read-only access. `&mut self` = read/write access.

> **`new` — the constructor convention:** In Rust, constructors are just regular
> methods named `new` by convention. There is nothing special about the name —
> it is just what Rust programmers expect to see:

```rust
impl Circle {
    fn new(x: f32, y: f32, radius: f32) -> Circle {
        Circle { x, y, radius }  // shorthand when field name matches variable name
    }
}

// Usage:
let c = Circle::new(10.0, 20.0, 5.0);
// Notice the :: (double colon) — new is called on the TYPE, not an instance.
// It creates an instance, so it doesn't have a `self` yet.
```

> **`::` vs `.`:**
> `Circle::new(...)` — called on the TYPE Circle (creates something).
> `c.area()` — called on an INSTANCE c (uses something that exists).

---

## Step 1 — Add `impl Ship`

Replace the standalone `draw_ship` function with an `impl` block:

```rust
impl Ship {
    // Constructor: create a ship with default starting values.
    fn new() -> Ship {
        Ship {
            x:      300.0,
            y:      550.0,
            width:  40.0,
            height: 20.0,
            speed:  4.0,
        }
    }

    // Update: read keyboard input and move the ship.
    // &mut self: we need to change self.x.
    fn update(&mut self) {
        if is_key_down(KeyCode::Right) { self.x += self.speed; }
        if is_key_down(KeyCode::Left)  { self.x -= self.speed; }
        if self.x < 0.0                         { self.x = 0.0; }
        if self.x > screen_width() - self.width { self.x = screen_width() - self.width; }
    }

    // Draw: put pixels on screen representing the ship.
    // &self: reading only — no changes needed to draw.
    fn draw(&self) {
        draw_rectangle(self.x, self.y, self.width, self.height, GREEN);
    }
}
```

### SAVE AND TRY

```sh
cargo build
```

**Expected:** Compiles, likely with warnings about the old standalone `draw_ship`
function being unused. That is fine — we will delete it in a moment.

---

## Step 2 — Update `main()` to Use the Methods

In `async fn main()`, change:

```rust
// Old:
let mut ship = Ship { x: 300.0, y: 550.0, width: 40.0, height: 20.0, speed: 4.0 };
// ... input reading, bounds checking inline ...
draw_ship(&ship);

// New:
let mut ship = Ship::new();  // constructor
// ... in the loop:
ship.update();   // one call replaces 4 lines of input+bounds code
ship.draw();     // one call replaces draw_ship(&ship)
```

Also delete the old standalone `fn draw_ship(ship: &Ship)` — it is replaced
by `ship.draw()`.

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Identical game behavior. The ship moves and stays in bounds.
The game loop is 4 lines shorter.

**Change something:** In `Ship::update()`, add `self.y -= 0.5;` to make the
ship drift upward over time. Notice how you only need to look inside `impl Ship`
to find and fix ship behavior — it is all in one place. Remove the drift.

---

## Step 3 — Add `impl Bullet`

```rust
impl Bullet {
    fn new() -> Bullet {
        Bullet { x: 0.0, y: 0.0, active: false }
    }

    // Fire: activate the bullet at the ship's center.
    // Takes the ship position as arguments since Bullet doesn't own the ship.
    fn fire(&mut self, ship: &Ship) {
        self.x      = ship.x + ship.width / 2.0;
        self.y      = ship.y;
        self.active = true;
    }

    // Update: move upward and deactivate if off screen.
    fn update(&mut self) {
        if self.active {
            self.y -= 8.0;
            if self.y < 0.0 { self.active = false; }
        }
    }

    // Draw: render if active.
    fn draw(&self) {
        if self.active {
            draw_rectangle(self.x - 2.0, self.y, 4.0, 10.0, WHITE);
        }
    }
}
```

In `main()`, replace all standalone bullet code:

```rust
// Old:
if is_key_pressed(KeyCode::Space) && !bullet.active {
    bullet.x = ship.x + ship.width / 2.0;
    bullet.y = ship.y;
    bullet.active = true;
}
if bullet.active { bullet.y -= 8.0; if bullet.y < 0.0 { bullet.active = false; } }
draw_bullet(&bullet);

// New:
if is_key_pressed(KeyCode::Space) && !bullet.active {
    bullet.fire(&ship);
}
bullet.update();
bullet.draw();
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same behavior. Firing still works. The game loop is more readable.

---

## Step 4 — Add `impl Alien`

```rust
impl Alien {
    fn new(x: f32, y: f32, row: usize) -> Alien {
        Alien { x, y, alive: true, row }
    }

    fn draw(&self) {
        if self.alive {
            let color = match self.row { 0 => PINK, 1 => ORANGE, _ => RED };
            draw_rectangle(self.x, self.y, 30.0, 20.0, color);
        }
    }
}
```

Update `make_alien_grid` to use `Alien::new`:

```rust
fn make_alien_grid() -> Vec<Alien> {
    let mut aliens = Vec::new();
    for row in 0..3 {
        for col in 0..5 {
            aliens.push(Alien::new(
                100.0 + col as f32 * 80.0,
                 80.0 + row as f32 * 60.0,
                row,
            ));
        }
    }
    aliens
}
```

Update `draw_aliens`:

```rust
fn draw_aliens(aliens: &Vec<Alien>) {
    for alien in aliens { alien.draw(); }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same game. Each `Alien` now knows how to draw itself. The
`draw_aliens` function is a clean one-liner.

---

## The Complete Slimmed-Down Game Loop

After all the `impl` blocks, here is how `async fn main()` looks now:

```rust
#[macroquad::main("Space Invaders")]
async fn main() {
    let mut ship          = Ship::new();
    let mut bullet        = Bullet::new();
    let mut aliens        = make_alien_grid();
    let mut enemy_bullets : Vec<EnemyBullet> = Vec::new();
    let mut fleet_dx      : f32 = 1.5;
    let mut lives         : i32 = 3;
    let mut score         : u32 = 0;

    loop {
        ship.update();

        if is_key_pressed(KeyCode::Space) && !bullet.active {
            bullet.fire(&ship);
        }
        bullet.update();

        // Alien marching
        for alien in &mut aliens { if alien.alive { alien.x += fleet_dx; } }
        let hit_right = aliens.iter().any(|a| a.alive && a.x > screen_width() - 50.0);
        let hit_left  = aliens.iter().any(|a| a.alive && a.x < 20.0);
        if hit_right || hit_left {
            fleet_dx = -fleet_dx;
            for alien in &mut aliens { if alien.alive { alien.y += 20.0; } }
        }

        // Alien firing (from LAB 06)
        // ... (keep the random firing code here) ...

        // Enemy bullets move + remove off-screen
        for b in &mut enemy_bullets { b.y += 5.0; }
        enemy_bullets.retain(|b| b.y < screen_height());

        // Player bullet hits alien
        if bullet.active {
            for alien in &mut aliens {
                if alien.alive && rects_overlap(bullet.x - 2.0, bullet.y, 4.0, 10.0,
                                                alien.x, alien.y, 30.0, 20.0) {
                    alien.alive   = false;
                    bullet.active = false;
                    score        += 10;
                }
            }
        }

        // Enemy bullet hits ship
        let mut hit_ship = false;
        enemy_bullets.retain(|b| {
            let touching = rects_overlap(b.x - 2.0, b.y, 4.0, 10.0,
                                         ship.x, ship.y, ship.width, ship.height);
            if touching { hit_ship = true; }
            !touching
        });
        if hit_ship { lives -= 1; ship.x = 300.0; bullet.active = false; }

        // Win / lose checks
        if lives <= 0 {
            clear_background(BLACK);
            draw_text("GAME OVER", 250.0, 300.0, 70.0, RED);
            next_frame().await;
            loop { next_frame().await }
        }
        if aliens.iter().all(|a| !a.alive) {
            clear_background(BLACK);
            draw_text("YOU WIN!", 290.0, 300.0, 70.0, YELLOW);
            next_frame().await;
            loop { next_frame().await }
        }

        // Draw
        clear_background(BLACK);
        ship.draw();
        bullet.draw();
        draw_aliens(&aliens);
        draw_enemy_bullets(&enemy_bullets);
        draw_text(&format!("Lives: {}  Score: {}", lives, score), 20.0, 30.0, 26.0, WHITE);
        next_frame().await
    }
}
```

Compare this to what you had before — the loop is now focused on *orchestration*
(calling the right things in the right order) rather than implementation details.

---

## 🎯 Challenge: Add a `reset` Method to `Ship`

**The goal:** When the ship gets hit, the code currently does:
```rust
if hit_ship { lives -= 1; ship.x = 300.0; bullet.active = false; }
```

The `300.0` is hardcoded — if you ever change the starting position, you
must update both the `new()` method and this line. Fragile.

Add a method to `Ship`:
```rust
fn reset_position(&mut self) {
    // restore to starting x
}
```

Use it in the hit_ship block. Also consider: should `reset_position` know
the starting x? Should `Ship` store `start_x` as a field?

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
struct Ship {
    x:       f32,
    y:       f32,
    width:   f32,
    height:  f32,
    speed:   f32,
    start_x: f32,  // ← new field: remembers the starting position
}

impl Ship {
    fn new() -> Ship {
        Ship {
            x:       300.0,
            y:       550.0,
            width:   40.0,
            height:  20.0,
            speed:   4.0,
            start_x: 300.0, // ← set once, reused by reset
        }
    }

    fn reset_position(&mut self) {
        self.x = self.start_x; // no magic numbers
    }

    // ... update and draw unchanged ...
}

// In the game loop:
if hit_ship {
    lives -= 1;
    ship.reset_position(); // clear, readable, DRY (Don't Repeat Yourself)
    bullet.active = false;
}
```

> **DRY — Don't Repeat Yourself:** A principle in software engineering.
> If you write the same value or logic in more than one place, a future change
> requires you to find and update every copy. The `start_x` field is a single
> source of truth — change it once in `new()` and `reset_position` stays correct.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `ship.update()` replaces 4 lines of input+bounds | Game loop uses one call |
| `ship.draw()` replaces standalone function | No standalone `draw_ship` function |
| `bullet.fire(&ship)` sets bullet position | Firing still works |
| `Alien::new(x, y, row)` used in grid builder | Constructor used |
| `alien.draw()` called inside `draw_aliens` | Each alien draws itself |
| Game behavior is IDENTICAL to LAB 06 | Everything still works |
| Challenge: `ship.reset_position()` used | No hardcoded `300.0` in hit_ship block |

---

## Quick Check Answers

**1. Can functions be called with dot notation?**
Yes — that is exactly what `impl` does. `draw_ship(&ship)` becomes `ship.draw()`.
The function is defined inside `impl Ship`. The first parameter is `&self` instead
of `ship: &Ship`. The caller passes the struct implicitly via the dot.

**2. How do you make "create a Ship" a reusable one-liner?**
A `new()` method inside `impl Ship`. By convention, `new` is the constructor.
It is called with `Ship::new()` (double colon = called on the type, not an instance).
It returns a fully initialized `Ship` with all fields set to their starting values.

**3. Which logic "belongs to" the ship?**
Logic that depends primarily on the ship's own state: moving based on keyboard
input, staying in bounds, drawing itself, resetting its position. Logic that
involves multiple objects (collision between ship and bullet, or ship and alien)
belongs to the game loop, not to either individual struct — it requires both.

---

## What Is Next — LAB 08

The game works, but every session is identical — same wave, same speed, no
progression. In LAB 08 we add a **game state machine**: a formal way of tracking
whether we are in the title screen, playing, or on a game-over screen. We also
add a second wave that is faster than the first. The game now has an arc.

*Continue to Space Invaders in Rust — LAB 08 — Game State: Enums and `match`.*
