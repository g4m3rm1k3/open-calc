# Space Invaders in Rust — LAB 12 — Shields and the Boss: 2D Data and `HashMap`

**What you will have by the end of this lab:**
Three destructible shields the player hides behind — each shield made of a grid
of blocks that erode when hit. A boss alien on wave 4 that requires three hits
to kill, tracked with a `HashMap`. The game is now a complete, layered experience.

**Time:** 50–60 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. A shield is a 4×4 grid of small blocks. Each block can be present or
>    destroyed independently. What type would you use to represent a 4×4 grid
>    of on/off values in Rust?
> 2. The boss alien needs to track how many hits it has taken. The boss is one
>    alien in a `Vec<Alien>`. You need to associate a hit count WITH that specific
>    alien. How would you store per-alien data without changing the `Alien` struct
>    for all aliens?
> 3. When a bullet hits a shield block, the block should be destroyed. But
>    should the bullet stop, or continue through to possibly hit an alien behind
>    the shield?
>
> *(Answers at the bottom.)*

---

## Part A — Destructible Shields

## The Problem: Nowhere to Hide

The game offers no defense — the ship is fully exposed to enemy fire. Real Space
Invaders has shields (bunkers) the player shelters behind. Bullets from both sides
chip away at the shield blocks.

---

## The Concept: 2D Arrays — A Grid of Values

> **The Story:** A crossword puzzle is a grid — rows and columns. To know
> whether square (row 2, column 3) is filled, you look up the row first, then
> the column within that row. A 2D array in code works the same way: it is
> an array of arrays.

> **Term: 2D array** — an array where each element is itself an array.
> In Rust, `[[bool; 4]; 4]` is a 4×4 grid of booleans — four rows, each
> containing four booleans. The outer array has 4 elements (rows); each inner
> array has 4 elements (columns).

**The smallest possible example:**

```rust
fn main() {
    // A 3×3 grid of booleans, all starting as true.
    let mut grid: [[bool; 3]; 3] = [[true; 3]; 3];

    // Access element at row 1, column 2:
    grid[1][2] = false;

    // Print the grid:
    for row in &grid {
        for cell in row {
            print!("{} ", if *cell { "X" } else { "." });
        }
        println!(); // newline after each row
    }
}
// Output:
// X X X
// X X .
// X X X
```

> **`[T; N]`** — a fixed-size array of `N` elements of type `T`. The size
> is part of the type — `[bool; 4]` and `[bool; 5]` are different types.
> Unlike `Vec`, the size cannot change at runtime.

> **`[true; 3]`** — creates `[true, true, true]`. Shorthand for initializing
> all elements to the same value.

---

## Step 1 — Define the Shield Struct

Add to `src/bullet.rs` or create `src/shield.rs`:

```rust
// A Shield: a 4-wide × 4-tall grid of destructible blocks.
pub struct Shield {
    pub x:      f32,          // left edge position on screen
    pub y:      f32,          // top edge position
    pub blocks: [[bool; 4]; 4], // true = block exists, false = destroyed
}

// Size of each block in pixels.
pub const BLOCK_SIZE: f32 = 8.0;

impl Shield {
    pub fn new(x: f32, y: f32) -> Shield {
        Shield {
            x,
            y,
            blocks: [[true; 4]; 4], // all blocks start intact
        }
    }

    // Draw all surviving blocks.
    pub fn draw(&self) {
        for (row, row_data) in self.blocks.iter().enumerate() {
            for (col, &alive) in row_data.iter().enumerate() {
                if alive {
                    draw_rectangle(
                        self.x + col as f32 * BLOCK_SIZE,
                        self.y + row as f32 * BLOCK_SIZE,
                        BLOCK_SIZE - 1.0, // 1px gap between blocks
                        BLOCK_SIZE - 1.0,
                        Color::new(0.2, 0.8, 0.2, 1.0), // green shield color
                    );
                }
            }
        }
    }

    // Returns the rectangle for one block (for collision checking).
    pub fn block_rect(&self, row: usize, col: usize) -> (f32, f32, f32, f32) {
        (
            self.x + col as f32 * BLOCK_SIZE,
            self.y + row as f32 * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE,
        )
    }
}
```

> **`.iter().enumerate()`** — you used this in LAB 10. Here it gives us
> `(row_index, row_data)` for each row, then `(col_index, &alive)` for each
> cell. The `&alive` pattern destructures the reference — `alive` is then a `bool`.

---

## Step 2 — Create Three Shields and Draw Them

In `src/game.rs` (or `main.rs`), add shields to `GameData`:

```rust
use crate::shield::{Shield, BLOCK_SIZE};

pub struct GameData {
    // ... existing fields ...
    pub shields: Vec<Shield>,
}

impl GameData {
    pub fn new(high_score: u32) -> GameData {
        GameData {
            // ... existing fields ...
            shields: vec![
                Shield::new(150.0, 470.0),
                Shield::new(360.0, 470.0),
                Shield::new(570.0, 470.0),
            ],
        }
    }
}
```

In the drawing section, call `shield.draw()` for each shield:

```rust
    for shield in &data.shields {
        shield.draw();
    }
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Three green grids of blocks appear between the ship and the aliens.

---

## Step 3 — Bullet vs Shield Collision

Add collision checking between the player's bullet and shields. A hit destroys
the block the bullet touches (and stops the bullet):

```rust
    // Player bullet vs shields
    'outer: for shield in data.shields.iter_mut() {
        for row in 0..4 {
            for col in 0..4 {
                if shield.blocks[row][col] {
                    let (bx, by, bw, bh) = shield.block_rect(row, col);
                    if data.bullet.active && rects_overlap(
                        data.bullet.x - 2.0, data.bullet.y, 4.0, 10.0,
                        bx, by, bw, bh,
                    ) {
                        shield.blocks[row][col] = false; // destroy the block
                        data.bullet.active = false;       // stop the bullet
                        break 'outer; // exit all loops — bullet is gone
                    }
                }
            }
        }
    }
```

> **`'outer:` (labeled loop)** — you can label a loop with a name. `break 'outer`
> breaks out of the labeled loop, not just the innermost one. Without the label,
> `break` inside the `col` loop would only exit the `col` loop, not all three.

Also add enemy bullet vs shield collision (the block is destroyed but the bullet
also stops — alternatively, let enemy bullets pass through for difficulty):

```rust
    // Enemy bullets vs shields
    data.enemy_bullets.retain(|b| {
        let mut bullet_survives = true;
        for shield in data.shields.iter_mut() {
            for row in 0..4 {
                for col in 0..4 {
                    if shield.blocks[row][col] {
                        let (bx, by, bw, bh) = shield.block_rect(row, col);
                        if rects_overlap(b.x - 2.0, b.y, 4.0, 10.0, bx, by, bw, bh) {
                            shield.blocks[row][col] = false;
                            bullet_survives = false;
                        }
                    }
                }
            }
        }
        bullet_survives
    });
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Fire at the shields — blocks disappear one at a time. Enemy bullets
chip away at the shields from above. A fully eroded shield is just empty space.

---

## Part B — The Boss Alien

## The Problem: Wave 4 Has No Identity

After three waves of identical red rectangles, wave 4 would feel like more of
the same. A boss alien — larger, requires multiple hits — creates a climax.

---

## The Concept: `HashMap<K, V>` — Looking Up by Key

> **The Story:** A library card catalog (or a phone book). You look up a name
> (the *key*) and find a phone number (the *value*). You do not search every
> entry — you go directly to the right one. A `HashMap` is this lookup table.

> **Term: `HashMap<K, V>`** — stores (key, value) pairs. Given a key of type
> `K`, you get the associated value of type `V` in approximately O(1) time —
> constant time regardless of how many entries there are.

**The smallest possible example:**

```rust
use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, u32> = HashMap::new();

    scores.insert("Alice".to_string(), 100);
    scores.insert("Bob".to_string(),   75);

    // Look up a value by key:
    if let Some(alice_score) = scores.get("Alice") {
        println!("Alice: {}", alice_score); // prints: Alice: 100
    }

    // Modify a value:
    *scores.entry("Bob".to_string()).or_insert(0) += 25;
    // entry: "give me Bob's entry"; or_insert(0): "if missing, create with value 0"
    // += 25: add 25 to whatever was there (75 + 25 = 100)
}
```

> **`.entry(key).or_insert(default)`** — the standard pattern for "find or create."
> If the key exists, returns a mutable reference to its value. If not, inserts the
> default and returns a reference to it. Either way, you get a `&mut V` to modify.

**Why use `HashMap` for boss hit counts?**
The boss is alien index `0` (or whatever index we assign it). We need to store
"how many times has alien 0 been hit" without adding a `hits: u32` field to EVERY
alien (which would waste memory for the 14 normal aliens). A `HashMap<usize, u32>`
maps alien index → hit count only for aliens that have been hit.

---

## Step 4 — Spawn the Boss on Wave 4

In `GameData`, add:

```rust
pub alien_hits: HashMap<usize, u32>, // alien_index → hit count (for boss)
```

In `update_playing`, when spawning a new wave:

```rust
    if all_dead {
        data.wave += 1;
        data.alien_hits.clear(); // reset hit counts for new wave

        if data.wave == 4 {
            // Boss wave: spawn ONE large alien in the center.
            data.aliens = vec![Alien { x: 350.0, y: 100.0, alive: true, row: 99 }];
            // row: 99 = special sentinel value meaning "boss" — handled in draw
            data.fleet_dx = 2.0;
        } else if data.wave > 4 {
            data.state = GameState::Win; // cleared the boss = game won
        } else {
            data.aliens   = make_alien_grid();
            data.fleet_dx = 1.5 + data.wave as f32 * 0.5;
        }
    }
```

Update `Alien::draw` to handle the boss row:

```rust
    pub fn draw(&self, is_boss: bool) {
        if self.alive {
            if is_boss {
                // Boss: large magenta rectangle.
                draw_rectangle(self.x - 15.0, self.y - 15.0, 60.0, 50.0, MAGENTA);
                draw_text("BOSS", self.x - 5.0, self.y + 10.0, 20.0, WHITE);
            } else {
                let color = match self.row { 0 => PINK, 1 => ORANGE, _ => RED };
                draw_rectangle(self.x, self.y, 30.0, 20.0, color);
            }
        }
    }
```

---

## Step 5 — Boss Requires 3 Hits

Update the collision code to check hit count for boss aliens:

```rust
    // Player bullet vs aliens
    if data.bullet.active {
        for (idx, alien) in data.aliens.iter_mut().enumerate() {
            if alien.alive {
                let is_boss = alien.row == 99;
                let (aw, ah) = if is_boss { (60.0, 50.0) } else { (30.0, 20.0) };
                let (ax, ay) = if is_boss { (alien.x - 15.0, alien.y - 15.0) }
                               else { (alien.x, alien.y) };

                if rects_overlap(data.bullet.x - 2.0, data.bullet.y, 4.0, 10.0,
                                 ax, ay, aw, ah) {
                    data.bullet.active = false;
                    spawn_explosion(&mut data.particles, alien.x + 15.0, alien.y + 10.0);

                    if is_boss {
                        // Increment hit count for this alien index.
                        let hits = data.alien_hits.entry(idx).or_insert(0);
                        *hits += 1;

                        if *hits >= 3 {
                            alien.alive = false;
                            data.score += 500; // big points for the boss
                        } else {
                            // Boss flashes — show hit count.
                            // (The explosion particle already gives visual feedback.)
                        }
                    } else {
                        alien.alive  = false;
                        data.score  += 10 * data.wave;
                    }
                }
            }
        }
    }
```

### SAVE AND TRY

```sh
cargo run
```

Play through waves 1–3. On wave 4, a large BOSS appears. Hit it once — explosion
particles but it stays. Hit it twice — another explosion. Third hit — it dies
and "YOU WIN!" appears (or a final victory screen if you wire it up).

---

## 🎯 Challenge: Boss Health Bar

**The goal:** Display a red health bar above the boss that shrinks with each hit.
Three hits = empty bar = boss dies.

You know: `draw_rectangle`, `data.alien_hits.get(&idx)`, screen coordinates.

The bar should be:
- A full red rectangle (60px wide × 8px tall) at full health
- A green rectangle overlaid: `(3 - hits) / 3.0 * 60.0` pixels wide
- Positioned just above the boss sprite

Try for at least 10 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
// In the drawing section, after drawing the boss alien:
if data.wave == 4 {
    if let Some(boss) = data.aliens.first() {
        if boss.alive {
            let idx   = 0usize; // boss is always index 0 in wave 4
            let hits  = *data.alien_hits.get(&idx).unwrap_or(&0);
            let hp    = (3 - hits.min(3)) as f32 / 3.0; // 1.0 = full, 0.0 = dead

            // Background bar (dark red = missing health):
            draw_rectangle(boss.x - 15.0, boss.y - 30.0, 60.0, 8.0, DARKGRAY);

            // Foreground bar (green = remaining health):
            let bar_color = if hp > 0.5 { GREEN } else { ORANGE };
            draw_rectangle(boss.x - 15.0, boss.y - 30.0, 60.0 * hp, 8.0, bar_color);
        }
    }
}
```

**Key insight:** The health percentage `hp = remaining_hits / total_hits` is the
general formula for any health bar. Multiply by the bar's max width to get the
current width in pixels. This scales to any number of total hit points without
changing the drawing code.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Three shield grids appear on screen | Three green block grids visible |
| Player bullet destroys shield blocks | Fire at shield — blocks disappear |
| Enemy bullets also destroy shield blocks | Aliens chip away the shields |
| Wave 4 spawns boss alien | Large MAGENTA "BOSS" rectangle appears |
| Boss requires 3 hits | First two hits: particles, boss alive; third: dies |
| Boss worth 500 points | Score jumps +500 on boss death |
| Normal aliens unaffected by boss logic | Waves 1–3 play normally |
| Challenge: health bar above boss | Red/green bar shrinks with each hit |

---

## Quick Check Answers

**1. What type represents a 4×4 grid of on/off values?**
`[[bool; 4]; 4]` — a 4-element array where each element is itself a 4-element
bool array. Access with `grid[row][col]`. The inner `[4]` is the columns; the
outer `[4]` is the rows.

**2. How do you store per-alien data without changing the struct for all aliens?**
`HashMap<usize, u32>` — maps alien index to hit count. Only aliens that have
been hit appear in the map. The 14 normal aliens never have an entry. The boss's
hit count is looked up by its index. The map is empty at the start of each wave.

**3. Should a bullet stop after hitting a shield block?**
In classic Space Invaders: yes — the bullet stops (absorbed by the shield block).
This makes shields genuinely protective: the player must fire multiple shots to
clear a hole. If bullets passed through, shields would be cosmetic only.

---

## What Is Next — LAB 13

The game is content-complete. LAB 13 covers **traits** — Rust's system for shared
behavior across different types. You will define a `Drawable` trait that the Ship,
Alien, and Shield all implement, allowing one function to draw anything without
knowing exactly what type it is. This is Rust's version of interfaces and
polymorphism.

*Continue to Space Invaders in Rust — LAB 13 — Traits: Shared Behavior and Polymorphism.*
