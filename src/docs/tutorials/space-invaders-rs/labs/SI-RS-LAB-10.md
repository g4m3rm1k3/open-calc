# Space Invaders in Rust — LAB 10 — Error Handling: `Result`, `Option`, and `?`

**What you will have by the end of this lab:**
The file I/O from LAB 09 properly handles all failure cases — missing file,
corrupted score, disk full — without panicking. You understand `Result<T, E>`
and `Option<T>`, the two types Rust uses for everything that can fail or be
absent.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. In most languages, if you try to open a file that does not exist, the program
>    crashes with an exception. Rust does not have exceptions. How does Rust tell
>    you that an operation failed without crashing?
> 2. `Vec::get(i)` retrieves the item at index `i`. But what if `i` is out of
>    bounds — there is no item there? The function cannot return a `Bullet` if
>    there is no bullet at that index. What does it return instead?
> 3. You used `.expect("message")` in LAB 09. What does `.expect` actually do
>    when the operation succeeded? What does it do when it failed?
>
> *(Answers at the bottom.)*

---

## The Problem: `.expect` Panics

In LAB 09 you wrote:

```rust
std::fs::write(SCORE_FILE, &text).expect("Could not write file");
```

`.expect` is quick to write but brutal in failure — if writing fails (disk full,
no permission, USB drive disconnected), the game crashes with:

```
thread 'main' panicked at 'Could not write file: Os { code: 28, ... }'
```

A proper game would handle this gracefully: log the failure, continue, maybe
show a "Could not save score" notice. To handle failures gracefully, you need
to understand what `.expect` is hiding.

---

## The Concept: `Result<T, E>` — Success or Failure, Made Explicit

> **The Story:** You hire a contractor to renovate your kitchen. When they finish,
> one of two things happens: they give you a completed kitchen (success), or
> they hand you an invoice for problems they found (failure) — a flooded pipe,
> a structural issue. The contractor does not ignore problems or silently fail —
> they tell you explicitly what happened.
>
> In Rust, any operation that can fail returns a `Result`. It is either
> `Ok(value)` (success, with a value) or `Err(error)` (failure, with an error
> description). You must decide what to do with either case.

> **Term: `Result<T, E>`** — a type with two variants:
> - `Ok(T)` — the operation succeeded. `T` is the success value type.
> - `Err(E)` — the operation failed. `E` is the error type.
> The names `T` and `E` are placeholders for the actual types.

**The smallest possible example:**

```rust
fn divide(a: f32, b: f32) -> Result<f32, String> {
    if b == 0.0 {
        Err("Cannot divide by zero".to_string())  // failure
    } else {
        Ok(a / b)                                  // success
    }
}

fn main() {
    match divide(10.0, 2.0) {
        Ok(result) => println!("Result: {}", result),  // prints: Result: 5
        Err(msg)   => println!("Error: {}", msg),
    }

    match divide(10.0, 0.0) {
        Ok(result) => println!("Result: {}", result),
        Err(msg)   => println!("Error: {}", msg),      // prints: Error: Cannot divide by zero
    }
}
```

> **What `.expect` actually does:**
> ```rust
> let result = divide(10.0, 2.0).expect("Division failed");
> // If Ok: unwraps and gives you 5.0
> // If Err: panics immediately with "Division failed: Cannot divide by zero"
> ```
> `.expect` is fine during early development or when failure is truly impossible.
> For user-facing code, you should handle the `Err` case explicitly.

---

## The Concept: `Option<T>` — Present or Absent

> **Term: `Option<T>`** — a type with two variants:
> - `Some(T)` — a value is present. `T` is the value type.
> - `None` — no value (absence, not failure).

> **The Story:** You search your pocket for your keys. Either you find them
> (`Some(keys)`) or your pocket is empty (`None`). `Option` is not about
> failure — it is about whether something exists.

**Where you have already seen `Option`:**

```rust
// Vec::first() returns Option — the Vec might be empty.
let aliens: Vec<Alien> = vec![];
match aliens.first() {
    Some(alien) => println!("First alien at x={}", alien.x),
    None        => println!("No aliens left"),
}

// Deck::deal() from earlier Uno labs returned Option<Card>
// because the deck might be empty.
```

**`Option` vs `Result`:**
- Use `Option` when something might not exist: first element, found item, parsed value.
- Use `Result` when something might fail: file I/O, network, parsing user input.

---

## Step 1 — Rewrite `load_high_score` with Proper Handling

Replace the `load_high_score` from LAB 09 with a version that explains each step:

```rust
fn load_high_score() -> u32 {
    // Step 1: Try to read the file. Returns Result<String, io::Error>.
    let file_contents = match std::fs::read_to_string(SCORE_FILE) {
        Ok(text) => text,
        Err(_)   => return 0, // file missing or unreadable — default to 0
    };

    // Step 2: Try to parse the text as a u32. Returns Result<u32, ParseIntError>.
    // .trim() removes any trailing newline that the file might have.
    match file_contents.trim().parse::<u32>() {
        Ok(score) => score,
        Err(_)    => 0, // file exists but contains invalid text — default to 0
    }
}
```

> **`parse::<u32>()`** — the `::<u32>` is called a *turbofish* (the name is
> official and beloved). It tells `parse` what type to produce. Without it,
> Rust might not know whether you want `u32`, `i32`, `f32`, etc.

> **`return 0` inside `match`:** The `return` keyword exits the function
> immediately. In the `Err` arm of the first match, `return 0` says "file could
> not be read — leave the function right now and give the caller 0."

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same behavior as before. Delete `highscore.txt` and run again —
no panic. The game starts with `high_score = 0`.

---

## Step 2 — Rewrite `save_high_score` to Report Failure

```rust
// Returns Ok(()) on success, Err(String) on failure.
// The caller can decide whether to show a message or silently continue.
fn save_high_score(score: u32) -> Result<(), String> {
    let text = score.to_string();
    std::fs::write(SCORE_FILE, &text)
        .map_err(|e| format!("Failed to save score: {}", e))
    // map_err: if the Result is Err, transform the error into our own type.
    // If it's Ok, pass Ok through unchanged.
}
```

> **`Result<(), String>`** — the `()` (unit type) means "success carries no value."
> We just care that writing succeeded. The `String` is our error message.

> **`map_err(|e| ...)`** — transforms the `Err` value without touching `Ok`.
> `std::fs::write` returns `Err(io::Error)` on failure. `map_err` converts it
> to `Err(String)` — a simpler type we control.

In `update_game_over` and `update_win`, handle the result:

```rust
    match save_high_score(*score) {
        Ok(())   => { /* saved successfully, do nothing */ }
        Err(msg) => {
            // Show a brief error on screen instead of crashing.
            draw_text(&msg, 20.0, screen_height() - 40.0, 20.0, RED);
        }
    }
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same behavior. To test the error path, temporarily change
`SCORE_FILE` to `"/invalid/path/score.txt"` — the save will fail and the
red error message appears at the bottom of the game-over screen. Change back.

---

## The Concept: The `?` Operator — Propagating Errors

Writing `match result { Ok(v) => v, Err(e) => return Err(e) }` on every
fallible call gets repetitive. Rust provides a shorthand: `?`.

```rust
// Without ?: manual match on every fallible call.
fn read_and_parse() -> Result<u32, String> {
    let text = match std::fs::read_to_string("score.txt") {
        Ok(t)  => t,
        Err(e) => return Err(e.to_string()),
    };
    let score = match text.trim().parse::<u32>() {
        Ok(n)  => n,
        Err(e) => return Err(e.to_string()),
    };
    Ok(score)
}

// With ?: the same thing, much shorter.
fn read_and_parse() -> Result<u32, String> {
    let text  = std::fs::read_to_string("score.txt").map_err(|e| e.to_string())?;
    let score = text.trim().parse::<u32>().map_err(|e| e.to_string())?;
    Ok(score)
}
```

> **`?`** — placed after a `Result` expression. If the result is `Ok(v)`, it
> unwraps `v` and continues. If the result is `Err(e)`, it immediately returns
> `Err(e)` from the current function. The function must return a `Result` for
> `?` to work.

> **The Rule:** `?` can only be used inside functions that return `Result` (or `Option`).
> Using `?` inside `fn main()` (which returns nothing) would fail.

---

## Step 3 — Rewrite `load_high_score` with `?`

```rust
// A helper function that can fail — uses ? for clean error propagation.
fn try_load_high_score() -> Result<u32, String> {
    let text  = std::fs::read_to_string(SCORE_FILE).map_err(|e| e.to_string())?;
    let score = text.trim().parse::<u32>().map_err(|e| e.to_string())?;
    Ok(score)
}

// The public function falls back to 0 on any failure.
fn load_high_score() -> u32 {
    try_load_high_score().unwrap_or(0)
}
```

> **`.unwrap_or(default)`** — if the `Result` is `Ok(v)`, returns `v`.
> If `Err`, returns `default` instead of panicking. Cleaner than `.expect` when
> a fallback value makes sense.

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same behavior. The code is now cleaner and the two failure modes
(file missing, file corrupted) are both handled without panicking.

---

## Step 4 — Apply `Option` to Alien Firing

In LAB 06, you picked a random living alien to fire. The `.collect()` approach
allocates a new Vec every frame. Here is a more idiomatic Rust approach using
`Option`:

```rust
// Get the list of living alien indices (no new Vec, just indices).
let living_indices: Vec<usize> = aliens.iter()
    .enumerate()                       // adds index: (0, alien0), (1, alien1)...
    .filter(|(_, a)| a.alive)          // keep only living aliens
    .map(|(i, _)| i)                   // take only the index
    .collect();

// Option<usize>: Some(index) if there are living aliens, None if all dead.
let chosen: Option<usize> = if living_indices.is_empty() {
    None
} else {
    Some(living_indices[rng.gen_range(0..living_indices.len())])
};

// Only fire if Some index was chosen.
if let Some(idx) = chosen {
    if rng.gen_bool(0.005) {
        let alien = &aliens[idx];
        enemy_bullets.push(EnemyBullet {
            x: alien.x + 15.0,
            y: alien.y + 20.0,
        });
    }
}
```

> **`if let Some(value) = option_variable`** — a pattern that runs the block
> only if the option contains `Some`. `value` is bound to the inner value.
> More concise than `match option { Some(v) => ..., None => {} }`.

> **`.enumerate()`** — wraps each item in a tuple with its index: the iterator
> yields `(0, item0)`, `(1, item1)`, etc.

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Alien firing works as before, now using idiomatic `Option`.

---

## 🎯 Challenge: Show Score File Status in the HUD

**The goal:** Show a small indicator in the HUD: "💾 Saved" when the score
file exists and was loaded successfully, or "💾 No save" when no file was found.

You know: `try_load_high_score()`, `draw_text`, `Result`.

In `async fn main()`, load the score and check what happened:

```rust
let (mut high_score, save_exists) = match try_load_high_score() {
    Ok(score) => (score, true),
    Err(_)    => (0, false),
};
```

Then in the HUD:
```rust
let save_icon = if save_exists { "SAVE OK" } else { "NO SAVE" };
draw_text(save_icon, screen_width() - 100.0, 30.0, 20.0, DARKGRAY);
```

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
// In main() — load high score and track whether a save file existed.
let load_result = try_load_high_score();
let mut high_score: u32  = load_result.as_ref().copied().unwrap_or(0);
let save_file_exists: bool = load_result.is_ok();

// Pass save_file_exists into update functions (or store in a global / state struct).
// In the HUD draw:
let indicator = if save_file_exists { "SAVE OK" } else { "NO SAVE" };
draw_text(indicator, screen_width() - 110.0, 30.0, 20.0,
          if save_file_exists { GREEN } else { DARKGRAY });
```

> **`.is_ok()`** — returns `true` if the `Result` is `Ok`, `false` if `Err`.
> There is also `.is_err()` for the opposite check. Both are read-only — they
> do not consume the `Result`.

**Why this matters:** Exposing the save-file status in the UI is a quality-of-life
feature. Players often wonder "did my score save?" A small indicator answers the
question without requiring them to find the file on disk.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Delete `highscore.txt`, run → no panic | File missing is handled gracefully |
| Corrupt `highscore.txt` (write "abc"), run → no panic | Parse failure handled |
| Invalid save path → red error message on screen | Tested with `/invalid/path` |
| `?` operator used in `try_load_high_score` | Code uses `?` not manual match |
| `if let Some(idx) = chosen` used for alien firing | Pattern used in firing code |
| Challenge: save indicator in HUD | "SAVE OK" or "NO SAVE" visible |

---

## Quick Check Answers

**1. How does Rust tell you an operation failed without crashing?**
It returns `Result<T, E>`. The `Ok(T)` variant carries the success value.
The `Err(E)` variant carries an error description. The caller receives the
`Result` and must handle both cases. Rust will warn (or error) if you ignore
a `Result` — silent failure is not allowed.

**2. What does `Vec::get(i)` return for an out-of-bounds index?**
`Option<&T>`. `Some(&item)` if `i` is a valid index. `None` if `i` is out of
bounds. Unlike `vec[i]` (which panics on out-of-bounds), `vec.get(i)` returns
`None` — the caller must decide what to do when the index does not exist.

**3. What does `.expect` do on success vs failure?**
On `Ok(v)`: unwraps and returns `v`. Equivalent to "give me the value, I know
it worked." On `Err(e)`: immediately panics with your message plus the error
details. There is no recovery — the program terminates. Use `.expect` when
failure truly cannot happen in your program logic. Use `match`, `if let`, `?`,
or `unwrap_or` when failure is possible and you want to handle it.

---

## What Is Next — LAB 11

The game is complete and handles errors properly. In LAB 11 we split the code
into multiple files using Rust's **module system** — `mod`, `pub`, and
`use` across files. The `ship.rs`, `alien.rs`, and `bullet.rs` files each own
their struct, and `main.rs` orchestrates them. This is how real Rust projects
are organized.

*Continue to Space Invaders in Rust — LAB 11 — Modules: Organizing a Real Project.*
