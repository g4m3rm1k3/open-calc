# Space Invaders in Rust — LAB 15 — Ship It: Release, Leaderboard, and Retrospective

**What you will have by the end of this lab:**
A release binary you can share. A top-5 leaderboard stored as a JSON file.
A name-entry screen on game over. A complete retrospective of every concept
taught across these 15 labs — and a clear bridge to the Barrier project.

**Time:** 50–60 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. `cargo build` (debug) and `cargo build --release` produce different binaries.
>    What are the two main differences in the release binary?
> 2. A leaderboard stores a list of (name, score) pairs sorted by score descending.
>    What Rust types would you use for the pair and for the list?
> 3. Entering a name means reading individual characters from keyboard input, one
>    at a time, and assembling them into a String. You know `is_key_pressed`.
>    But how do you read the actual character typed (not just the key code)?
>
> *(Answers at the bottom.)*

---

## Part A — Release Build

## The Concept: Debug vs Release

> **Debug build (`cargo build`)** — compiled with no optimization, full debug
> symbols, and extra checks. The binary is large (symbols take space) and slow
> to run. But: panics show exact file and line numbers; the compiler produces
> clear backtraces; debug assertions run. Use during development.

> **Release build (`cargo build --release`)** — compiled with maximum optimization
> (`-O3` equivalent). Dead code eliminated, loops unrolled, functions inlined.
> Typically 5–20× faster than debug. Debug symbols stripped — binary is much smaller.

**Add release profile settings to `Cargo.toml`:**

```toml
[profile.release]
opt-level     = 3        # maximum optimization
lto           = "thin"   # link-time optimization: optimize across crate boundaries
codegen-units = 1        # single compilation unit: slower compile, better code
strip         = "symbols" # remove debug symbols: smaller binary
```

> **LTO (Link-Time Optimization)** — normally, each crate is compiled independently
> and linked at the end. LTO gives the linker permission to optimize *across* crates —
> inlining functions from `rand` or `macroquad` directly into your code. Slower
> compile, faster runtime.

### SAVE AND TRY

```sh
cargo build --release
```

**The binary is at:** `target\release\space-invaders.exe` (Windows)
or `target/release/space-invaders` (Mac/Linux).

**Compare sizes:**
```sh
# Windows PowerShell:
(Get-Item target\debug\space-invaders.exe).Length / 1MB
(Get-Item target\release\space-invaders.exe).Length / 1MB
```

**Expected:** Release binary is 40–70% smaller than debug.

**Run directly:**
```sh
.\target\release\space-invaders.exe
```

---

## Part B — Name Entry on Game Over

## The Problem: The Leaderboard Needs a Name

When the game ends, we need the player's name. This means reading text input
character by character. macroquad provides `get_char_pressed()` for this.

> **`get_char_pressed() -> Option<char>`** — returns `Some(c)` if a character
> key was pressed this frame, `None` if no character key was pressed.
> Unlike `is_key_pressed(KeyCode::...)`, this returns the actual character —
> it handles Shift (uppercase), numbers, symbols, etc.

> **Term: `char`** — Rust's type for a single Unicode character. `'A'`, `'5'`,
> `'@'` are all `char` literals (single quotes). A `String` is a sequence of `char`.

---

## Step 1 — Add Name Entry State

Add to `GameState`:

```rust
pub enum GameState {
    Title,
    Playing,
    EnterName,  // ← new: player enters their name before game over
    GameOver,
    Win,
    Paused,
}
```

When lives reach zero, transition to `EnterName` instead of `GameOver`:

```rust
    if *lives <= 0 {
        *state = GameState::EnterName;
        return;
    }
```

Add a name buffer to `GameData`:

```rust
pub name_buffer: String,
```

---

## Step 2 — Write `update_enter_name`

```rust
fn update_enter_name(state: &mut GameState, data: &mut GameData) {
    clear_background(BLACK);
    draw_text("GAME OVER",          250.0, 200.0, 60.0, RED);
    draw_text("Enter your name:",   240.0, 290.0, 30.0, WHITE);

    // Show the name typed so far, with a blinking cursor approximation.
    let display = format!("{}_", data.name_buffer);
    draw_text(&display, 280.0, 340.0, 36.0, YELLOW);

    draw_text("Press ENTER to save score", 210.0, 420.0, 24.0, DARKGRAY);

    // Read character input.
    while let Some(c) = get_char_pressed() {
        if c == '\r' || c == '\n' {
            // Enter pressed — save and move to leaderboard.
            if data.name_buffer.is_empty() {
                data.name_buffer = "Anonymous".to_string();
            }
            save_leaderboard_entry(&data.name_buffer, data.score);
            *state = GameState::GameOver;
            return;
        } else if c == '\x08' {
            // Backspace (ASCII 8): remove the last character.
            data.name_buffer.pop();
        } else if data.name_buffer.len() < 12 && !c.is_control() {
            // Normal character — add to buffer if under 12 chars.
            data.name_buffer.push(c);
        }
    }
}
```

> **`while let Some(c) = get_char_pressed()`** — keep reading characters as long
> as `get_char_pressed()` returns `Some`. On a frame where multiple characters
> were queued (rare but possible), all are processed. When it returns `None`,
> the loop ends.

> **`'\x08'`** — a character literal for ASCII code 8, which is Backspace.
> `\x08` is a hex escape sequence — `\x` followed by two hex digits.

> **`is_control()`** — returns `true` for non-printable control characters
> (Enter, Tab, Escape, etc.). Filtering these prevents them from appearing
> in the name.

> **`String::pop()`** — removes and returns the last character from a `String`.
> Returns `Option<char>` — `None` if the string is empty. Here we ignore the
> return value (we just want the last character gone).

---

## Part C — The Leaderboard

## Step 3 — Leaderboard File Format

Store the leaderboard as JSON — a widely readable format that maps well to Rust
types.

Add `serde` and `serde_json`:
```sh
cargo add serde --features derive
cargo add serde_json
```

Define the leaderboard entry type:

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct LeaderboardEntry {
    pub name:  String,
    pub score: u32,
}
```

> **`#[derive(Serialize, Deserialize)]`** — serde's macros that automatically
> generate code to convert `LeaderboardEntry` to and from JSON. Without these,
> you would write hundreds of lines of conversion code by hand.

> **`serde`** — the most widely used serialization library in Rust's ecosystem.
> "Serialize" means "convert to a storable/transmittable format (JSON, binary, etc.)."
> "Deserialize" means "convert back from that format into a Rust type."

---

## Step 4 — Save and Load the Leaderboard

```rust
const LEADERBOARD_FILE: &str = "leaderboard.json";

fn load_leaderboard() -> Vec<LeaderboardEntry> {
    std::fs::read_to_string(LEADERBOARD_FILE)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()  // empty Vec if file missing or corrupt
}

fn save_leaderboard_entry(name: &str, score: u32) {
    let mut entries = load_leaderboard();

    entries.push(LeaderboardEntry { name: name.to_string(), score });

    // Sort descending by score.
    entries.sort_by(|a, b| b.score.cmp(&a.score));

    // Keep only the top 5.
    entries.truncate(5);

    if let Ok(json) = serde_json::to_string_pretty(&entries) {
        let _ = std::fs::write(LEADERBOARD_FILE, json);
    }
}
```

> **`sort_by(|a, b| b.score.cmp(&a.score))`** — sorts the Vec in place.
> The closure receives two entries `a` and `b` and returns their ordering.
> `b.score.cmp(&a.score)` reverses the natural order — largest score first.

> **`truncate(5)`** — shortens the Vec to at most 5 elements, removing the rest.

> **`serde_json::to_string_pretty`** — converts to JSON with indentation.
> `to_string` produces compact JSON (one line). `to_string_pretty` produces
> readable JSON (indented). Both are valid; pretty is better for human-readable files.

---

## Step 5 — Display the Leaderboard on Game Over

Update `update_game_over` to show the leaderboard:

```rust
fn update_game_over(state: &mut GameState, data: &GameData) {
    clear_background(BLACK);
    draw_text("GAME OVER",    250.0, 120.0, 60.0, RED);
    draw_text(&format!("Your score: {}", data.score), 290.0, 200.0, 30.0, WHITE);

    // Load and display the top 5.
    draw_text("TOP SCORES:", 310.0, 270.0, 28.0, YELLOW);
    let entries = load_leaderboard();
    for (i, entry) in entries.iter().enumerate() {
        let line = format!("{}. {}  {}", i + 1, entry.name, entry.score);
        draw_text(&line, 250.0, 310.0 + i as f32 * 35.0, 26.0, WHITE);
    }

    draw_text("Press ENTER to play again", 210.0, 520.0, 24.0, DARKGRAY);
    if is_key_pressed(KeyCode::Enter) {
        *state = GameState::Title;
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

Play, get hit three times, enter your name, press Enter. The game over screen
shows the leaderboard. Check `leaderboard.json` — it contains your entry as
readable JSON. Play again and beat your score — the leaderboard updates.

---

## The Retrospective: Every Concept Across 15 Labs

Every concept in this series was introduced because the game needed it —
not the other way around.

### Rust Language Fundamentals

| Concept | Lab | The game needed it for... |
|---------|-----|--------------------------|
| Variables (`let`) | 01 | Naming ship position so it is not a raw number |
| Mutation (`let mut`) | 02 | Moving the ship — position must change |
| Structs and fields | 02 | Grouping ship's four properties into one thing |
| `impl` and methods | 07 | Attaching behavior to structs (ship.draw, ship.update) |
| Constructors (`new`) | 07 | Creating a Ship with default values in one call |
| Enums and `match` | 08 | Tracking game state (title/playing/game-over/win) |
| `Vec<T>` | 04 | Storing 15 aliens without 15 variables |
| `for` loops | 04 | Drawing all 15 aliens with one block of code |
| Functions with return values | 05 | `rects_overlap` — returns `bool` |
| Closures `\|x\| expr` | 06 | `retain(|b| condition)`, `.any(|a| ...)`, `.filter` |
| `Option<T>` | 10 | File may not exist; boss index may not exist |
| `Result<T, E>` | 10 | File I/O can fail — must handle or propagate |
| `?` operator | 10 | Propagating errors without repeated `match` |
| 2D arrays `[[T; N]; M]` | 12 | Shield grid — each block is row/col addressable |
| `HashMap<K, V>` | 12 | Tracking boss hit count by alien index |
| Traits (`trait`, `impl Trait for Type`) | 13 | `Drawable` shared contract for Ship, Alien, Shield |
| Generics `<T: Trait>` | 13 | `draw_list` works for any Drawable type |
| `Box<dyn Trait>` | 13 | Mixed-type drawable list at runtime |
| `Serialize`, `Deserialize` | 15 | JSON leaderboard — human-readable save file |
| Module system (`mod`, `pub`, `use`) | 11 | Splitting code into focused files |
| Strings (`String` vs `&str`) | 09 | Fixed labels vs runtime-built text |
| `char` and text input | 15 | Reading player name character by character |

### Algorithms and Data Structures

| Concept | Lab | The game needed it for... |
|---------|-----|--------------------------|
| Rectangle overlap (AABB) | 05 | Collision: does bullet touch alien? |
| Scrolling buffer (wrap at boundary) | 14 | Stars wrap from bottom to top |
| Fisher-Yates (implicit, via `rand`) | 04 | Random alien fires randomly |
| Sorting (`sort_by`) | 15 | Leaderboard sorted by score descending |
| Truncation (`truncate`) | 15 | Keep top 5 only |
| Particle system | 09 | Per-particle velocity and lifetime |
| State machine | 08 | Exactly one game state active at any time |

### Computer Science Principles

| Principle | Lab | Applied in... |
|-----------|-----|--------------|
| DRY (Don't Repeat Yourself) | 07 | `Ship::new` eliminates duplicate initialization |
| Encapsulation | 07, 11 | Private fields, behavior in `impl` |
| Separation of Concerns | 11 | ship.rs, alien.rs, bullet.rs each own one thing |
| Open/Closed Principle | 13 | New types get `Drawable` — `draw_list` unchanged |
| Interface Segregation | 13 | Small traits (`Drawable`, `Update`) not one big trait |
| Single Responsibility | 11 | Each module/file has one job |
| Composition over Inheritance | 13 | Traits compose behavior; no inheritance needed |

### Systems Programming

| Concept | Lab | Applied in... |
|---------|-----|--------------|
| Frame rate independence | 14 | Delta time — speed in pixels/second |
| File I/O | 09, 15 | High score and leaderboard persistence |
| Binary size optimization | 15 | `cargo build --release`, LTO, strip |
| Error handling without exceptions | 10 | `Result`, `?`, `unwrap_or` |
| Memory layout awareness | 10, 13 | `Box<dyn>` for heap; arrays for stack |

---

## 🎯 Final Challenge: Add a Difficulty Selector on the Title Screen

**The goal:** Before starting, the player chooses Easy, Normal, or Hard.
- Easy: aliens move 50% slower, player has 5 lives
- Normal: current settings, 3 lives
- Hard: aliens move 50% faster, player has 1 life

You know: `GameState`, `enum`, `match`, `update_title`, keyboard input.

Design the difficulty selector UI and the struct/enum to represent the choice.
Pass the choice into `GameData::new()`.

There is no solution reveal for this challenge — you have all the tools.
This is your first fully independent feature implementation.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `cargo build --release` succeeds | Binary at `target/release/` |
| Release binary smaller than debug | Compared sizes |
| Name entry screen appears on game over | Type a name after dying |
| Backspace removes last character | Works in name entry |
| Enter submits name and saves entry | `leaderboard.json` updated |
| Leaderboard shows top 5 sorted | Correct order, max 5 entries |
| `leaderboard.json` is readable JSON | Open file, see JSON structure |
| Game plays from the release binary | Ran `.\target\release\space-invaders.exe` |
| Final challenge: difficulty selector | Three modes change speed and lives |

---

## Quick Check Answers

**1. What are the two main differences in the release binary?**
1. **Speed**: Release uses maximum optimization — the compiler inlines functions,
   eliminates dead code, and performs CPU-specific vectorization. Typically 5–20×
   faster than debug for CPU-intensive code. 2. **Size**: Release strips debug
   symbols (file names, line numbers, variable names stored for backtrace generation).
   The binary shrinks by 40–70%.

**2. What types for leaderboard (name, score) pair and list?**
`struct LeaderboardEntry { name: String, score: u32 }` for the pair. `Vec<LeaderboardEntry>`
for the list. `String` because names are built at runtime (from character input).
`u32` because scores are non-negative and cannot exceed ~4 billion.

**3. How do you read the actual character typed (not just key code)?**
`get_char_pressed() -> Option<char>` — macroquad returns the Unicode character
for the key, including Shift modifiers (so Shift+A gives `'A'`, not `'a'`).
This is different from `is_key_pressed(KeyCode::A)` which tells you the key was
pressed but not which character it represents (shift-state unknown).

---

## What Comes Next

You have built a complete, polished game from scratch. In doing so, you have
learned the full breadth of Rust's core features — not as isolated exercises,
but as solutions to real problems you encountered while building something you
can actually play.

Every concept maps directly to the next project:

| This game | Barrier KVM |
|-----------|-------------|
| `GameState` FSM | Connection lifecycle states |
| `Vec<Bullet>` + `retain` | Packet buffers + cleanup |
| `impl Drawable for Ship` | `impl Protocol for TCPTransport` |
| `mpsc` channels (in Rust ecosystem) | Input event routing |
| `mod ship; mod alien;` | `mod input; mod display; mod network;` |
| Delta time | Network latency compensation |
| `HashMap<usize, u32>` | Socket-to-session mapping |
| `serde` JSON | Protocol message serialization |
| `Result<T, E>` and `?` | Network error propagation |
| Release build | Barrier daemon binary |

The game was the vessel. You now hold the tools.

*End of the Space Invaders in Rust series.*
