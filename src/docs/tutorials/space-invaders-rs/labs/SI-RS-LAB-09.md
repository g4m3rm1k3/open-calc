# Space Invaders in Rust — LAB 09 — Polish: Files, Strings, and Explosions

**What you will have by the end of this lab:**
A high score that persists between game sessions (saved to a file). A wave
score multiplier that rewards clearing quickly. Visual explosion particles when
aliens are destroyed. The game feels complete and satisfying.

**Time:** 45–55 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. The score is a `u32` in memory. When the game closes, memory is wiped.
>    How would you save the score between sessions? What file format would
>    you use for a single number?
> 2. An explosion effect shows several small particles flying outward from a
>    destroyed alien. Each particle has a position, velocity, and lifetime.
>    What struct would you use? What Vec would hold them?
> 3. `format!("Score: {}", score)` creates a String. What is the difference
>    between a `String` and a `&str`? You have seen both — now let's define them.
>
> *(Answers at the bottom.)*

---

## Part A — High Scores with File I/O

## The Problem: Score Resets Every Session

You beat wave 3 with 1200 points. You close the game. The score is gone.
Games that track high scores store them on disk. Rust's standard library
provides everything needed — no extra crate required.

---

## The Concept: Reading and Writing Files

> **The Story:** Imagine writing a phone number on a sticky note and putting
> it in a drawer. Tomorrow you can open the drawer and read it. The drawer is
> permanent storage — in a computer, that is the hard drive. Writing a file
> is like putting the sticky note in the drawer. Reading is like opening the drawer.

> **Term: `std::fs`** — Rust's built-in file-system module. `fs` is short for
> "file system." It provides `write` (create or overwrite a file) and
> `read_to_string` (read a file's entire contents as text).

**The smallest possible example:**

```rust
use std::fs;

fn main() {
    // Write a number to a file.
    fs::write("score.txt", "1500").expect("Could not write file");

    // Read it back.
    let contents = fs::read_to_string("score.txt").expect("Could not read file");
    println!("Saved score: {}", contents);  // prints: Saved score: 1500
}
```

> **`.expect("message")`** — file operations can fail (disk full, no permission,
> file missing). In Rust, these operations return `Result<..., Error>` — a type
> that is either success (`Ok`) or failure (`Err`). `.expect("message")` says:
> "if this succeeded, give me the value; if it failed, panic and print this message."
> You will learn `Result` fully in LAB 10. For now, `.expect` is safe to use.

> **`String` vs `&str`** — here is the explanation you have been waiting for:
>
> **`&str`** (string slice) — a borrowed reference to text stored somewhere else.
> Text literals like `"hello"` are `&str` — they live in the program's binary
> and are always available, but you cannot add to them or change their size.
>
> **`String`** — an owned, growable string stored in heap memory. You can push
> more characters onto it. `format!("Score: {}", score)` returns a `String`.
>
> **The analogy:** `&str` is a sticky note you borrowed from someone — you can
> read it but cannot keep it forever or add to it. `String` is your own sticky
> note that you bought — you own it and can write more on it.
>
> **The rule in practice:** Use `&str` for fixed text ("labels", "file names
> you know in advance"). Use `String` when text is built at runtime or needs
> to grow.

---

## Step 1 — Save and Load the High Score

Add these two functions above `async fn main()`:

```rust
const SCORE_FILE: &str = "highscore.txt"; // &str: a fixed filename, known at compile time

// save_high_score: write the score to a file.
// Overwrites the file if it already exists.
fn save_high_score(score: u32) {
    let text = score.to_string();               // convert u32 to String: "1500"
    let _ = std::fs::write(SCORE_FILE, &text);  // write to disk
    // The `let _ =` discards the Result — we don't panic if saving fails.
}

// load_high_score: read the saved score.
// Returns 0 if the file does not exist or cannot be parsed.
fn load_high_score() -> u32 {
    std::fs::read_to_string(SCORE_FILE)          // try to read the file
        .ok()                                    // convert Result to Option (None if error)
        .and_then(|s| s.trim().parse().ok())     // try to parse the text as u32
        .unwrap_or(0)                            // use 0 if anything failed
}
```

> **`.trim()`** — removes leading/trailing whitespace and newlines from a string.
> Files often have a trailing newline. Without `.trim()`, parsing "1500\n" as
> a number fails. With `.trim()`, it becomes "1500" and parses correctly.

> **`.parse()`** — converts a `&str` to a number (or any type that knows how
> to parse itself from text). Returns `Result` — succeeds if the text is a
> valid number, fails otherwise.

> **Method chaining:** `read_to_string(...).ok().and_then(...).unwrap_or(0)` is
> a chain of transformations. Each method takes the output of the previous one.
> This style avoids nested `if let` statements. You will see it frequently in Rust.

---

## Step 2 — Use High Score in the Game

In `async fn main()`:

```rust
    let mut high_score: u32 = load_high_score(); // load at startup
```

In `update_playing`, after updating `score`:
```rust
    if *score > *high_score {
        *high_score = *score;
    }
```

In `update_game_over` and `update_win`, save when the game ends:
```rust
    save_high_score(*score);
```

Display the high score in the HUD:
```rust
    draw_text(
        &format!("Lives: {}  Score: {}  Best: {}  Wave: {}",
                 lives, score, high_score, wave),
        20.0, 30.0, 24.0, WHITE
    );
```

### SAVE AND TRY

```sh
cargo run
```

Play a game, get some score, lose. Check the folder — `highscore.txt` now exists.
Open it — it contains your score as plain text. Restart the game — "Best: XXX"
shows your previous high score. Beat it — the file updates.

---

## Part B — Explosion Effects

## The Problem: Aliens Vanish Instantly

When a bullet hits an alien, the alien simply stops being drawn. It disappears
instantly. A small visual flourish — a burst of particles — would make the kill
feel satisfying.

---

## The Concept: Particles

A particle is a small moving object with a short lifetime. When an alien dies,
we spawn several particles at the alien's position. Each frame they move according
to their velocity and lose some lifetime. When lifetime reaches zero, they disappear.

```rust
struct Particle {
    x:        f32,
    y:        f32,
    vx:       f32,  // velocity: how many pixels per frame to move in x
    vy:       f32,  // velocity in y
    lifetime: f32,  // frames remaining before this particle disappears
}
```

> **Term: velocity** — the rate of change of position. `vx = 3.0` means
> "move 3 pixels right per frame." Negative `vx` moves left. Together,
> `vx` and `vy` define direction and speed.

---

## Step 3 — Define Particles and Spawn on Kill

Add the `Particle` struct and a `Vec<Particle>` in `main()`:

```rust
struct Particle {
    x: f32, y: f32,
    vx: f32, vy: f32,
    lifetime: f32,
}

// In main():
let mut particles: Vec<Particle> = Vec::new();
```

Add a function to spawn an explosion:

```rust
fn spawn_explosion(particles: &mut Vec<Particle>, x: f32, y: f32) {
    use rand::Rng;
    let mut rng = rand::thread_rng();

    for _ in 0..8 {  // 8 particles per explosion
        particles.push(Particle {
            x,
            y,
            vx:       rng.gen_range(-3.0..3.0),   // random direction
            vy:       rng.gen_range(-4.0..-0.5),  // always shoot upward a bit
            lifetime: rng.gen_range(15.0..30.0),  // random duration
        });
    }
}
```

> **`rng.gen_range(-3.0..3.0)`** — a random `f32` between -3.0 and 3.0.
> Negative values send the particle left; positive values send it right.

In the collision code inside `update_playing`, when an alien dies:

```rust
    if alien.alive && rects_overlap(...) {
        alien.alive   = false;
        bullet.active = false;
        *score       += 10;
        spawn_explosion(particles, alien.x + 15.0, alien.y + 10.0); // ← new
    }
```

---

## Step 4 — Move, Age, and Draw Particles

Add to `update_playing`:

```rust
    // Update particles: move and reduce lifetime.
    for p in particles.iter_mut() {
        p.x        += p.vx;
        p.y        += p.vy;
        p.lifetime -= 1.0;
        p.vy       += 0.1;  // slight gravity — particles arc downward
    }
    // Remove particles whose lifetime has expired.
    particles.retain(|p| p.lifetime > 0.0);
```

Add a draw function:

```rust
fn draw_particles(particles: &Vec<Particle>) {
    for p in particles {
        // Fade the particle as it ages: bright when new, dim before dying.
        // lifetime / max_lifetime gives a 0.0 to 1.0 fade factor.
        // We approximate: lifetime itself goes from ~30 to 0.
        let brightness = (p.lifetime / 30.0).min(1.0); // clamp to 1.0 max
        let color = Color::new(1.0, brightness, 0.0, brightness); // orange-to-red fade
        draw_rectangle(p.x, p.y, 3.0, 3.0, color);
    }
}
```

> **`Color::new(r, g, b, a)`** — creates a color directly from components.
> `r, g, b` are Red/Green/Blue from 0.0 to 1.0. `a` is alpha (opacity):
> 1.0 = fully visible, 0.0 = fully transparent. As `brightness` decreases,
> the particle fades out — both less bright and more transparent.

Call in the drawing section:

```rust
    draw_particles(particles);
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Shoot an alien — a burst of small orange particles fans outward
and fades over about half a second. Kill multiple aliens quickly — many
simultaneous bursts.

**Change something:** In `spawn_explosion`, change `8` to `20`. Much bigger
explosions. Change `rng.gen_range(-4.0..-0.5)` to `rng.gen_range(-8.0..-2.0)` —
particles shoot higher. Adjust to your taste.

---

## 🎯 Challenge: Wave Score Multiplier

**The goal:** Clearing wave 1 gives base points (10 per alien). Wave 2 should
give 20 per alien. Wave 3 gives 30. The multiplier equals the wave number.

You know: `wave: &u32`, `score += 10`.

Change the scoring line so each kill awards `10 * wave` points instead of `10`.
Display the multiplier in the HUD: "x2 multiplier" or similar.

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
// In the collision block:
*score += 10 * (*wave as u32);

// In the HUD draw:
draw_text(
    &format!("Lives: {}  Score: {}  Best: {}  Wave: {} (x{})",
             lives, score, high_score, wave, wave),
    20.0, 30.0, 24.0, WHITE
);
```

> **`*wave as u32`** — `wave` is `&mut u32` (a reference to a u32). `*wave`
> dereferences it to get the u32 value. `as u32` is redundant here (it already
> IS a u32 after dereferencing) but makes the intent clear. Both `*wave` and
> `*wave as u32` work.

**Why does this make the game better?** Wave 3 is harder (faster, more enemy fire).
The higher multiplier compensates by rewarding skilled play more. Game difficulty
and reward should scale together — this is a core game design principle.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `highscore.txt` created after first game | File appears in project folder |
| High score persists across restarts | Play, note score, restart, see "Best:" |
| High score only updates when beaten | Play below previous best — "Best:" unchanged |
| Particles appear on alien death | Kill an alien — burst of particles |
| Particles fade and disappear | Watch them shrink and vanish |
| Particles have slight gravity arc | They arc slightly downward |
| Challenge: wave multiplier active | Wave 2 kills show +20 instead of +10 |

---

## Quick Check Answers

**1. How would you save a score between sessions?**
Write it to a file with `std::fs::write`. A single number needs no special format —
just convert to a string with `.to_string()` and write the string. Read back with
`std::fs::read_to_string` and parse with `.parse()`.

**2. What struct and Vec for particles?**
A `Particle` struct with `x, y, vx, vy, lifetime` fields. A `Vec<Particle>` holds
all current particles. When an alien dies, push 8–20 new particles. Each frame,
move all particles by their velocity, decrease lifetime, and use `.retain()` to
remove expired ones.

**3. What is the difference between `String` and `&str`?**
`&str` is a borrowed reference to text stored elsewhere — fixed size, cannot grow.
Text literals like `"hello"` are `&str` stored in the program binary.
`String` is an owned, heap-allocated string that can grow. `format!` returns a
`String`. You can borrow a `String` as `&str` with `&my_string`. Functions that
only read text usually accept `&str`; functions that build text return `String`.

---

## What Is Next — LAB 10

The game is polished and complete. In LAB 10 we learn Rust's most important
error-handling tool — `Result<T, E>` — and apply it properly to the file
reading and writing we did in this lab. We also use it to make the game handle
corruption or missing files gracefully instead of panicking. This is the final
concept before the capstone.

*Continue to Space Invaders in Rust — LAB 10 — Error Handling: `Result`, `Option`, and Graceful Recovery.*
