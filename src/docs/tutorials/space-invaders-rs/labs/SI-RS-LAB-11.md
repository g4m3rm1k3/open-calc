# Space Invaders in Rust — LAB 11 — Modules: Organizing a Real Project

**What you will have by the end of this lab:**
The game split across multiple files: `src/ship.rs`, `src/alien.rs`,
`src/bullet.rs`, `src/game.rs`. Each file owns what it describes.
`src/main.rs` is 20 lines. The game behavior is identical — only the
organization has changed.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. `src/main.rs` is currently ~200 lines. If you add sound, a menu,
>    different weapon types, and a boss — it will be 500+ lines. What
>    practical problem does this cause when you are looking for a bug?
> 2. You want `ship.rs` to define the `Ship` struct. How does `main.rs` get
>    access to it? Rust does not automatically share code between files.
> 3. Structs can have private fields — fields that only code in the same file
>    can read or change. Why would you want a field to be private?
>
> *(Answers at the bottom.)*

---

## The Problem: One File for Everything

Every struct, every function, every constant lives in `main.rs`. Finding the
alien movement code requires scrolling past ship code, bullet code, and particle
code first. Adding a new feature means deciding where in the 200-line file to
put it.

This is the same problem variables solved in LAB 01 — raw numbers mixed in with
everything. The solution is the same: give things names and places.

---

## The Concept: Modules — Named Compartments for Code

> **The Story:** A hardware store has sections — plumbing, electrical, paint,
> tools. You do not search the whole store for a wrench. You go to "tools."
> A Rust module is a named section of code. Related things live together.
> You go to `alien.rs` for alien things, `ship.rs` for ship things.

> **Term: module (`mod`)** — a namespace (a named compartment) that groups
> related code. In Rust, each file is automatically a module named after the file.

> **Term: `pub`** — short for "public." By default, everything in a module is
> private — only code in the same file can see it. `pub` makes it visible to
> other modules.

> **Term: `use`** — brings a name from another module into the current scope.
> `use crate::ship::Ship` means "I want to use the `Ship` type from the `ship`
> module in this crate without writing `ship::Ship` every time."

**The smallest possible example — two files:**

```
src/
  main.rs
  greet.rs
```

```rust
// src/greet.rs — a module file
pub fn hello(name: &str) {             // pub: visible outside this file
    println!("Hello, {}!", name);
}

fn secret() {                          // no pub: private — only greet.rs can use this
    println!("This is private.");
}
```

```rust
// src/main.rs
mod greet;         // tells Rust: "load src/greet.rs as a module named greet"
use greet::hello;  // bring hello into scope

fn main() {
    hello("World");         // works: hello is pub
    // greet::secret();     // error: secret is private
}
```

> **`mod name;`** (with semicolon) — tells Rust to load a file named
> `name.rs` from the `src/` directory and treat it as a module.
> Without the `mod` declaration, Rust does not know the file exists.

---

## Step 1 — Create `src/ship.rs`

Create a new file at `src/ship.rs`. Cut the `Ship` struct and its `impl` block
from `main.rs` and paste them here:

```rust
// src/ship.rs — everything related to the player's ship.

use macroquad::prelude::*;  // needed for draw_rectangle, is_key_down, etc.

pub struct Ship {            // pub: main.rs can create and use Ship
    pub x:      f32,
    pub y:      f32,
    pub width:  f32,
    pub height: f32,
    pub speed:  f32,
    pub start_x: f32,
}

impl Ship {
    pub fn new() -> Ship {
        Ship {
            x:       300.0,
            y:       550.0,
            width:   40.0,
            height:  20.0,
            speed:   4.0,
            start_x: 300.0,
        }
    }

    pub fn update(&mut self) {
        if is_key_down(KeyCode::Right) { self.x += self.speed; }
        if is_key_down(KeyCode::Left)  { self.x -= self.speed; }
        if self.x < 0.0                         { self.x = 0.0; }
        if self.x > screen_width() - self.width { self.x = screen_width() - self.width; }
    }

    pub fn draw(&self) {
        draw_rectangle(self.x, self.y, self.width, self.height, GREEN);
    }

    pub fn reset_position(&mut self) {
        self.x = self.start_x;
    }
}
```

> **`pub struct` vs `pub` on fields:**
> - `pub struct Ship` makes the *type* public — other files can name the type.
> - `pub x: f32` makes the *field* public — other files can read and write it.
> - Without `pub` on a field, code in `main.rs` cannot access `ship.x` directly.
>   It would have to use methods. For this game, public fields are simpler.

---

## Step 2 — Declare the Module in `main.rs`

At the very top of `src/main.rs`, add:

```rust
mod ship;    // load src/ship.rs
use ship::Ship;  // bring Ship into scope — no need to write ship::Ship everywhere
```

### SAVE AND TRY

```sh
cargo build
```

**Expected:** Compiles. The `Ship` type now comes from `ship.rs`. If you see
errors about `Ship` not being found, check that `pub` is on both the struct
and the fields being accessed from `main.rs`.

---

## Step 3 — Create `src/bullet.rs`

```rust
// src/bullet.rs

use macroquad::prelude::*;

pub struct Bullet {
    pub x:      f32,
    pub y:      f32,
    pub active: bool,
}

pub struct EnemyBullet {
    pub x: f32,
    pub y: f32,
}

impl Bullet {
    pub fn new() -> Bullet {
        Bullet { x: 0.0, y: 0.0, active: false }
    }

    pub fn fire(&mut self, ship: &crate::ship::Ship) {
        self.x      = ship.x + ship.width / 2.0;
        self.y      = ship.y;
        self.active = true;
    }

    pub fn update(&mut self) {
        if self.active {
            self.y -= 8.0;
            if self.y < 0.0 { self.active = false; }
        }
    }

    pub fn draw(&self) {
        if self.active {
            draw_rectangle(self.x - 2.0, self.y, 4.0, 10.0, WHITE);
        }
    }
}

pub fn draw_enemy_bullets(bullets: &[EnemyBullet]) {
    for b in bullets {
        draw_rectangle(b.x - 2.0, b.y, 4.0, 10.0, ORANGE);
    }
}
```

> **`crate::ship::Ship`** — `crate` refers to the root of the current project
> (`main.rs`). `crate::ship::Ship` means: "start at the root, go into the
> `ship` module, find the `Ship` type." This is the full path when you cannot
> use `use` (e.g., inside a different module's function signature).

> **`&[EnemyBullet]` vs `&Vec<EnemyBullet>`:** `&[T]` is a *slice* — a
> borrowed view into a sequence of `T`. Both `Vec<T>` and arrays can be
> borrowed as `&[T]`. It is more general: accepting `&[EnemyBullet]` works
> for both `Vec<EnemyBullet>` and fixed arrays. Prefer `&[T]` in function
> parameters when you only need to read.

Add to `main.rs`:
```rust
mod bullet;
use bullet::{Bullet, EnemyBullet};
```

### SAVE AND TRY

```sh
cargo build
```

---

## Step 4 — Create `src/alien.rs`

```rust
// src/alien.rs

use macroquad::prelude::*;

pub struct Alien {
    pub x:     f32,
    pub y:     f32,
    pub alive: bool,
    pub row:   usize,
}

impl Alien {
    pub fn new(x: f32, y: f32, row: usize) -> Alien {
        Alien { x, y, alive: true, row }
    }

    pub fn draw(&self) {
        if self.alive {
            let color = match self.row { 0 => PINK, 1 => ORANGE, _ => RED };
            draw_rectangle(self.x, self.y, 30.0, 20.0, color);
        }
    }
}

pub fn make_alien_grid() -> Vec<Alien> {
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

pub fn draw_aliens(aliens: &[Alien]) {
    for alien in aliens { alien.draw(); }
}
```

Add to `main.rs`:
```rust
mod alien;
use alien::{Alien, make_alien_grid, draw_aliens};
```

### SAVE AND TRY

```sh
cargo build
```

---

## Step 5 — The Slim `main.rs`

After moving everything out, `src/main.rs` should look like:

```rust
use macroquad::prelude::*;

mod ship;
mod bullet;
mod alien;

use ship::Ship;
use bullet::{Bullet, EnemyBullet};
use alien::{Alien, make_alien_grid, draw_aliens};

// Keep: GameState enum, Particle struct, rects_overlap, state functions,
// save/load high score, spawn_explosion — these have not been moved yet.
// They could go in their own modules too — that is the challenge.

#[macroquad::main("Space Invaders")]
async fn main() {
    let mut ship          = Ship::new();
    let mut bullet        = Bullet::new();
    let mut aliens        = make_alien_grid();
    let mut enemy_bullets : Vec<EnemyBullet> = Vec::new();
    // ... etc.

    loop {
        // ... game loop using the types from the modules ...
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Game plays identically. All behavior is unchanged. Open each
`.rs` file in your editor — each one is focused and short.

**Change something:** In `ship.rs`, change `GREEN` to `LIME` in `draw`. Recompile.
The ship is lime colored. You only needed to look in `ship.rs` — nowhere else.

---

## The Concept: Privacy — Controlling What Others See

> **The Story:** A car exposes a steering wheel, pedals, and a gear shift —
> the driver's interface. The engine internals, fuel injectors, and ABS sensors
> are hidden under the hood. You drive the car without knowing how the engine
> works, and the car manufacturer can change the engine without breaking your
> driving habits.
>
> In Rust, private fields are the hidden internals. Public methods are the
> steering wheel. This separation is called *encapsulation*.

**Why private fields matter:**

```rust
// If ship.x is private (no `pub`):
// ← From main.rs, this would fail:
ship.x += 5.0; // error: field `x` of struct `Ship` is private

// The only way to change ship.x is through a pub method:
ship.update(); // works — update() is pub and it changes self.x internally
```

The benefit: `ship.update()` enforces bounds checking. If `ship.x` is private,
no code outside `ship.rs` can accidentally set it to an invalid value like -500.
The struct maintains its own invariants.

For this game, public fields are simpler and fine. For a library you publish
for others to use, private fields protect users from breaking changes.

---

## 🎯 Challenge: Move State Functions to `src/game.rs`

**The goal:** Move `GameState`, `update_title`, `update_playing`, `update_game_over`,
`update_win`, `rects_overlap`, `spawn_explosion`, `Particle`, and
`draw_particles` into a new file `src/game.rs`.

`main.rs` then becomes:

```rust
use macroquad::prelude::*;
mod ship;
mod bullet;
mod alien;
mod game;
use game::GameState;

#[macroquad::main("Space Invaders")]
async fn main() {
    // ... create objects ...
    let mut state = GameState::Title;
    loop {
        game::tick(&mut state, /* ... other args */);
        next_frame().await
    }
}
```

This requires making `GameState` public, making all the state functions public,
and deciding what to pass to `game::tick`. You may need to introduce a single
`GameData` struct to bundle all mutable state rather than passing 10 arguments.

Try for at least 15 minutes — this is the real test of whether you have
understood modules.

---

<details>
<summary>▶ Show Solution Approach</summary>

```rust
// src/game.rs

use macroquad::prelude::*;
use crate::ship::Ship;
use crate::bullet::{Bullet, EnemyBullet};
use crate::alien::{Alien, make_alien_grid, draw_aliens};

pub enum GameState { Title, Playing, GameOver, Win, Paused }

// Bundle all mutable game data into one struct.
// This avoids 10-argument function signatures.
pub struct GameData {
    pub ship:          Ship,
    pub bullet:        Bullet,
    pub aliens:        Vec<Alien>,
    pub enemy_bullets: Vec<EnemyBullet>,
    pub fleet_dx:      f32,
    pub lives:         i32,
    pub score:         u32,
    pub wave:          u32,
    pub high_score:    u32,
}

impl GameData {
    pub fn new(high_score: u32) -> GameData {
        GameData {
            ship:          Ship::new(),
            bullet:        Bullet::new(),
            aliens:        make_alien_grid(),
            enemy_bullets: Vec::new(),
            fleet_dx:      1.5,
            lives:         3,
            score:         0,
            wave:          1,
            high_score,
        }
    }
}

// Main update function — called once per frame from main().
pub fn tick(state: &mut GameState, data: &mut GameData) {
    match state {
        GameState::Title    => update_title(state),
        GameState::Playing  => update_playing(state, data),
        GameState::GameOver => update_game_over(state, data.score),
        GameState::Win      => update_win(state, data.score, data.wave),
        GameState::Paused   => update_paused(state),
    }
}

// ... implement each update function (same logic as before, just in game.rs) ...
```

**The key insight:** `GameData` bundles state so you pass one thing instead of
many. This pattern (a "context" or "state" struct) is extremely common in Rust
programs. You will see it everywhere in real-world code.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `src/ship.rs` exists with `Ship` | File present and compiles |
| `src/bullet.rs` exists with `Bullet`, `EnemyBullet` | File present and compiles |
| `src/alien.rs` exists with `Alien`, `make_alien_grid` | File present and compiles |
| `main.rs` has `mod ship; mod bullet; mod alien;` | Three mod declarations at top |
| Game behavior unchanged | Play through — everything works |
| Changing color in `ship.rs` only requires that file | No change needed in other files |
| Challenge: `src/game.rs` created with `GameData` | Module exists and compiles |

---

## Quick Check Answers

**1. What practical problem does a 200+ line file cause?**
Finding code requires scrolling through unrelated code. Merge conflicts in version
control are more frequent and harder to resolve. Multiple people cannot work on
different features without constantly overwriting each other's edits. The cognitive
load of holding the entire file in your head grows with file size.

**2. How does `main.rs` get access to `Ship` defined in `ship.rs`?**
Two steps: `mod ship;` (tells Rust the file exists and creates a `ship` module)
and `use ship::Ship;` (brings `Ship` into scope without needing to write
`ship::Ship` every time). Without `mod ship;`, Rust ignores the file entirely.

**3. Why would you want a field to be private?**
To protect invariants — rules about what values are valid. If `ship.x` is private,
no external code can accidentally set it to a position outside the screen bounds.
Only `Ship::update()` (which enforces bounds) can change it. The struct is
always in a valid state. This is the encapsulation principle from object-oriented
design, applied in Rust.

---

## What Is Next — LAB 12

The project is properly organized. In LAB 12 we add the final game features:
a shield row the player hides behind (introducing 2D arrays), and a boss alien
on wave 4 that requires multiple hits (introducing a new field type and the
`HashMap` data structure to track per-alien hit counts).

*Continue to Space Invaders in Rust — LAB 12 — Shields and the Boss: 2D Data and `HashMap`.*
