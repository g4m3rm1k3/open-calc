# Space Invaders in Rust — LAB 08 — Game State: Enums and `match`

**What you will have by the end of this lab:**
A title screen ("Press Enter to Start"), a playing state, a game-over screen,
and a win screen — all properly connected. Beating the first wave spawns a
second faster wave. The game now has a complete arc from start to finish.

**Time:** 45–55 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. The game is currently always in "playing" mode from the moment it starts.
>    There is no title screen, no restart, no flow between states. What would
>    break if you just added a `if key_pressed { show_title }` at the top of
>    the loop without a formal state system?
> 2. You need the game to be in EXACTLY ONE state at a time: title, playing,
>    game-over, or win. What Rust type you have already seen lets you define
>    a fixed list of named options where exactly one is "active" at any time?
> 3. You have used `if` for two-way decisions. When you have four possible
>    states, `if / else if / else if / else` gets messy. Is there a better tool?
>
> *(Answers at the bottom.)*

---

## The Problem: The Game Has No Structure

Right now the game starts immediately, ends with a frozen screen, and cannot
be restarted without closing and reopening. There is no title screen. There is
no wave 2. The game is a single, linear event.

Real games have **states** — the game is always in one well-defined mode, and
events cause transitions between modes.

---

## The Concept: Enums — A Fixed List of Possibilities

> **The Story:** A traffic light is always in one of three states: Red, Yellow,
> or Green. It is never "between" states. It is never in two states at once.
> Transitions are predictable: Red → Green → Yellow → Red.
>
> An **enum** lets you define exactly this: a type with a fixed list of named
> states, and the guarantee that a value of that type is always exactly one
> of them.

> **Term: `enum`** — short for *enumeration*. A type that lists all possible
> values by name. A variable of an enum type holds exactly one of those names.

**The smallest possible example:**
```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn main() {
    let light = TrafficLight::Red;  // create a value of the enum type

    match light {
        TrafficLight::Red    => println!("Stop"),
        TrafficLight::Yellow => println!("Caution"),
        TrafficLight::Green  => println!("Go"),
    }
}
```

> **Term: `match`** — like a multi-way `if`, designed for enums. It checks
> which variant a value is and runs the matching arm. Rust enforces that you
> handle EVERY variant — if you add a new one and forget to handle it, the
> compiler gives an error.

**The critical difference from `if/else`:**
With `if/else`, you can forget a case and the compiler stays silent.
With `match` on an enum, forgetting a case is a compile error. This is
one of Rust's most powerful safety features.

---

## Step 1 — Define the Game State Enum

Add above the struct definitions:

```rust
// GameState: the game is always in exactly one of these states.
enum GameState {
    Title,    // title screen — game has not started
    Playing,  // active gameplay
    GameOver, // player ran out of lives
    Win,      // player cleared all waves
}
```

---

## Step 2 — Add State to `main()` and Split the Loop

In `async fn main()`, add a state variable:

```rust
    let mut state     = GameState::Title;  // start on the title screen
    let mut wave: u32 = 1;                 // track which wave we are on
```

Replace the entire game `loop` content with a match on state:

```rust
    loop {
        match state {
            GameState::Title   => state = update_title(&mut state),
            GameState::Playing => update_playing(
                &mut ship, &mut bullet, &mut aliens, &mut enemy_bullets,
                &mut fleet_dx, &mut lives, &mut score, &mut wave, &mut state,
            ),
            GameState::GameOver => update_game_over(&score, &mut state),
            GameState::Win      => update_win(&score, &wave, &mut state),
        }
        next_frame().await
    }
```

> **Why extract to functions?** The `match` arms should be short — they just
> decide WHAT to do in each state. The actual work happens in the function.
> This keeps `main()` as a clear state machine and hides the details.

---

## Step 3 — Write the State Functions

Add these functions above `async fn main()`. Each one handles one state —
updates game data and draws the current screen.

### Title Screen

```rust
fn update_title(state: &mut GameState) -> GameState {
    // Draw the title screen.
    clear_background(BLACK);
    draw_text("SPACE INVADERS", 160.0, 250.0, 60.0, GREEN);
    draw_text("Press ENTER to start", 230.0, 330.0, 30.0, WHITE);
    draw_text("Arrow keys: move  |  Space: fire", 200.0, 380.0, 24.0, DARKGRAY);

    // Wait for Enter to transition to Playing.
    if is_key_pressed(KeyCode::Enter) {
        return GameState::Playing;
    }
    GameState::Title // stay on title if Enter not pressed
}
```

> **Wait — `update_title` takes `&mut GameState` AND returns `GameState`?**
> Yes — and the outer `match` then assigns the return value to `state`.
> A cleaner pattern is to return the next state and let `main()` assign it.
> The function only needs to know "should I stay or transition?"

Actually, let's simplify — functions that need to change `state` can take
`&mut GameState` directly and just mutate it. The match arms become even cleaner:

```rust
    loop {
        match &state {
            GameState::Title    => update_title(&mut state),
            GameState::Playing  => update_playing(
                &mut ship, &mut bullet, &mut aliens, &mut enemy_bullets,
                &mut fleet_dx, &mut lives, &mut score, &mut wave, &mut state,
            ),
            GameState::GameOver => update_game_over(&score, &mut state),
            GameState::Win      => update_win(&score, &wave, &mut state),
        }
        next_frame().await
    }
```

```rust
fn update_title(state: &mut GameState) {
    clear_background(BLACK);
    draw_text("SPACE INVADERS", 160.0, 250.0, 60.0, GREEN);
    draw_text("Press ENTER to start", 230.0, 330.0, 30.0, WHITE);
    draw_text("Arrow keys: move  |  Space: fire", 200.0, 380.0, 24.0, DARKGRAY);

    if is_key_pressed(KeyCode::Enter) {
        *state = GameState::Playing;  // transition!
    }
}
```

> **`*state = ...`** — the `*` dereferences the `&mut GameState`. When you
> have a mutable reference (`&mut GameState`), writing to it requires `*` to
> say "write to the thing the reference POINTS TO, not the reference itself."
> You will understand references and dereferencing fully in LAB 10.

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Title screen appears. Arrow keys do nothing. Pressing Enter
transitions to the playing state (which still runs the old game loop code
for now — we will wrap it next).

---

## Step 4 — Wrap the Playing State

Extract the game loop body into `update_playing`. This is a large function
because the game itself is large — that is expected. The important thing is
that it now has a name and lives separately from the state routing:

```rust
fn update_playing(
    ship:          &mut Ship,
    bullet:        &mut Bullet,
    aliens:        &mut Vec<Alien>,
    enemy_bullets: &mut Vec<EnemyBullet>,
    fleet_dx:      &mut f32,
    lives:         &mut i32,
    score:         &mut u32,
    wave:          &mut u32,
    state:         &mut GameState,
) {
    ship.update();

    if is_key_pressed(KeyCode::Space) && !bullet.active {
        bullet.fire(ship);
    }
    bullet.update();

    // Alien marching
    for alien in aliens.iter_mut() {
        if alien.alive { alien.x += *fleet_dx; }
    }
    let hit_right = aliens.iter().any(|a| a.alive && a.x > screen_width() - 50.0);
    let hit_left  = aliens.iter().any(|a| a.alive && a.x < 20.0);
    if hit_right || hit_left {
        *fleet_dx = -(*fleet_dx);
        for alien in aliens.iter_mut() { if alien.alive { alien.y += 20.0; } }
    }

    // Alien firing (keep random firing code from LAB 06 here)
    // ...

    for b in enemy_bullets.iter_mut() { b.y += 5.0; }
    enemy_bullets.retain(|b| b.y < screen_height());

    // Collision: player bullet vs aliens
    if bullet.active {
        for alien in aliens.iter_mut() {
            if alien.alive && rects_overlap(bullet.x - 2.0, bullet.y, 4.0, 10.0,
                                            alien.x, alien.y, 30.0, 20.0) {
                alien.alive   = false;
                bullet.active = false;
                *score       += 10;
            }
        }
    }

    // Collision: enemy bullets vs ship
    let mut hit_ship = false;
    enemy_bullets.retain(|b| {
        let touching = rects_overlap(b.x - 2.0, b.y, 4.0, 10.0,
                                     ship.x, ship.y, ship.width, ship.height);
        if touching { hit_ship = true; }
        !touching
    });
    if hit_ship { *lives -= 1; ship.reset_position(); bullet.active = false; }

    // State transitions
    if *lives <= 0 {
        *state = GameState::GameOver;
        return;
    }
    if aliens.iter().all(|a| !a.alive) {
        *wave += 1;
        // Spawn next wave, faster than the previous.
        *aliens    = make_alien_grid();
        *fleet_dx  = 1.5 + *wave as f32 * 0.5;  // each wave is 0.5 faster
        enemy_bullets.clear();

        if *wave > 3 {
            *state = GameState::Win; // 3 waves cleared = victory
            return;
        }
        // else: continue playing with the new wave
    }

    // Draw
    clear_background(BLACK);
    ship.draw();
    bullet.draw();
    draw_aliens(aliens);
    draw_enemy_bullets(enemy_bullets);
    draw_text(&format!("Lives: {}  Score: {}  Wave: {}", lives, score, wave),
              20.0, 30.0, 26.0, WHITE);
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:**
1. Title screen appears
2. Press Enter → game starts
3. Kill all aliens → "Wave: 2" appears in the HUD, new grid spawns, faster
4. Kill wave 2 → "Wave: 3"
5. Kill wave 3 → transitions to Win state (write win function next)

---

## Step 5 — Game Over and Win State Functions

```rust
fn update_game_over(score: &u32, state: &mut GameState) {
    clear_background(BLACK);
    draw_text("GAME OVER",           250.0, 260.0, 70.0, RED);
    draw_text(&format!("Score: {}", score), 300.0, 350.0, 40.0, WHITE);
    draw_text("Press ENTER to restart",     220.0, 420.0, 30.0, DARKGRAY);

    if is_key_pressed(KeyCode::Enter) {
        *state = GameState::Title;  // back to title (main() will reset variables)
    }
}

fn update_win(score: &u32, wave: &u32, state: &mut GameState) {
    clear_background(BLACK);
    draw_text("YOU WIN!",            290.0, 240.0, 70.0, YELLOW);
    draw_text(&format!("Score: {}", score), 300.0, 330.0, 40.0, WHITE);
    draw_text(&format!("{} waves cleared!", wave), 270.0, 390.0, 34.0, GREEN);
    draw_text("Press ENTER to play again",  215.0, 450.0, 30.0, DARKGRAY);

    if is_key_pressed(KeyCode::Enter) {
        *state = GameState::Title;
    }
}
```

For the restart to work properly (resetting ship, score, lives) when returning
to Title, add a reset in `update_title` that runs when Enter is pressed:
```rust
// Or, reset in main() by detecting the transition TO Playing state.
// Full reset logic: pull into a reset_game() helper function.
```

### SAVE AND TRY

```sh
cargo run
```

Play through the game. Verify all four states work: Title → Playing → GameOver
(or Win) → Title again.

---

## 🎯 Challenge: The `_` Catch-All and Exhaustive `match`

**Break it on purpose:** Add a new enum variant to `GameState`:

```rust
enum GameState {
    Title,
    Playing,
    GameOver,
    Win,
    Paused,  // ← new variant
}
```

### SAVE AND TRY

```sh
cargo build
```

**Expected error:**
```
error[E0004]: non-exhaustive patterns: `GameState::Paused` not covered
```

> **The rule:** A `match` must handle EVERY variant. Adding `Paused` to the
> enum without handling it in the `match` is a compile error. Rust caught
> your unfinished feature before you ran the game.

**The task:** Implement a real pause. Press `Escape` during gameplay to enter
`GameState::Paused`. Show "PAUSED — Press Escape to continue" on screen.
Press `Escape` again to return to `GameState::Playing`.

Try for at least 10 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
// Add Paused to the enum (done above).

// In the match in main():
GameState::Paused => update_paused(&mut state),

// The paused update function:
fn update_paused(state: &mut GameState) {
    // NOTE: we do NOT call clear_background — the game frame underneath
    // is still visible (whatever was drawn last frame).
    // We just draw the pause overlay on top.
    draw_rectangle(0.0, 0.0, screen_width(), screen_height(),
                   Color::new(0.0, 0.0, 0.0, 0.5)); // semi-transparent black
    draw_text("PAUSED", 320.0, 280.0, 60.0, WHITE);
    draw_text("Press Escape to continue", 230.0, 360.0, 30.0, DARKGRAY);

    if is_key_pressed(KeyCode::Escape) {
        *state = GameState::Playing;
    }
}

// In update_playing, add at the top:
if is_key_pressed(KeyCode::Escape) {
    *state = GameState::Paused;
    return; // do not process any game updates this frame
}
```

**Key insight:** The `match` is exhaustive by design. The moment you add `Paused`
to the enum, every `match` in the entire program that covers `GameState` must
handle it. This is how Rust prevents you from adding a new feature to one part
of the code and forgetting to handle it everywhere else.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Title screen shows on startup | "SPACE INVADERS" text visible before game |
| Enter on title → game starts | Press Enter, game begins |
| Wave counter increments | HUD shows "Wave: 2" after clearing wave 1 |
| Wave 2 is faster than wave 1 | Aliens visibly march faster |
| 3 waves cleared → Win screen | Clear wave 3, see "YOU WIN!" |
| Lives 0 → Game Over screen | Get hit 3 times, see "GAME OVER" |
| Enter on Game Over → Title | Press Enter on game over, title returns |
| Challenge: Pause works | Escape pauses, Escape again resumes |
| Adding enum variant without `match` arm = error | Tested and confirmed |

---

## Quick Check Answers

**1. What breaks without a formal state system?**
Every frame would need multiple overlapping `if` checks to determine what to show.
Game logic (moving aliens) would run even on the title screen unless protected
by an `if`. Transition conditions would be scattered across the loop, making
bugs hard to find. State machines enforce that only the current state's code runs.

**2. What Rust type holds exactly one of a fixed list of named options?**
`enum`. A `GameState` variable always holds exactly one of: `Title`, `Playing`,
`GameOver`, or `Win`. It cannot hold two at once. It cannot hold a value not on
the list.

**3. What is a better tool than `if/else if/else if/else` for four states?**
`match`. It is designed for exactly this: testing which variant an enum holds
and running the matching code. Unlike `if/else`, `match` is exhaustive — the
compiler enforces that you handle every case.

---

## What Is Next — LAB 09

The game is complete — title screen, three waves, win and lose conditions.
In LAB 09 we add visual polish: a score multiplier that increases per wave,
an explosion effect when aliens die, and a high-score display that persists
across sessions by saving to a file.

*Continue to Space Invaders in Rust — LAB 09 — Polish: Files, Strings, and Effects.*
