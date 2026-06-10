# Space Invaders in Rust — LAB 14 — Delta Time, Screen Shake, and Sound

**What you will have by the end of this lab:**
Movement speed that stays consistent regardless of frame rate (delta time).
A screen shake effect when the boss dies. A scrolling starfield background.
Sound effects for firing, explosions, and the boss death. The game feels like
a finished product.

**Time:** 45–55 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. Your game currently moves the ship `4.0` pixels per frame. On a 60 Hz monitor
>    that is 240 pixels per second. On a 30 Hz monitor, the same code would
>    move only 120 pixels per second — half as fast. Why would this happen,
>    and how do you fix it?
> 2. A screen shake effect means: offset everything by a small random amount
>    for a fraction of a second. Where in the draw code would you apply this
>    offset? Does it go before or after `clear_background`?
> 3. Sound requires loading an audio file and playing it at the right moment.
>    Should the audio file be loaded inside the game loop (every frame) or
>    once at startup? What would happen if you loaded it every frame?
>
> *(Answers at the bottom.)*

---

## Part A — Delta Time

## The Problem: Speed Depends on Frame Rate

`ship.x += 4.0` moves the ship 4 pixels per frame. At 60 fps: 240 pixels/second.
At 30 fps: 120 pixels/second. At 144 fps: 576 pixels/second.

The game runs at different speeds on different monitors. A player with a 144 Hz
display would find the game absurdly fast. A player on a slow machine would
find it sluggish.

---

## The Concept: Delta Time — Speed Per Second, Not Per Frame

> **The Story:** You are driving a car. Speed is measured in kilometres per hour —
> not "kilometres per engine rotation." The engine rotates at different speeds
> depending on gear, but your speed in km/h stays consistent. Delta time is the
> "per hour" — it normalizes movement to real-world time instead of frame count.

> **Term: delta time (`dt`)** — the number of seconds that elapsed since the
> last frame. At 60 fps: dt ≈ 0.0167 seconds. At 30 fps: dt ≈ 0.033 seconds.
> At 144 fps: dt ≈ 0.007 seconds.

**The formula:**
```
movement_per_frame = speed_per_second × delta_time
```

If `speed = 240.0` pixels per second:
- At 60 fps: `240.0 × 0.0167 = 4.0` pixels per frame ✓
- At 30 fps: `240.0 × 0.033 = 8.0` pixels per frame — but the frame is twice as long ✓
- At 144 fps: `240.0 × 0.007 = 1.68` pixels per frame — but 144 such frames per second ✓

All three produce the same visual speed: 240 pixels per second.

> **`get_frame_time()`** — macroquad's function that returns the delta time for
> the current frame in seconds. Call it once at the top of the game loop.

---

## Step 1 — Add Delta Time to Movement

At the top of the game loop (or inside `update_playing`):

```rust
    let dt = get_frame_time(); // seconds since last frame
```

Update `Ship::update` to accept `dt`:

```rust
pub fn update(&mut self, dt: f32) {
    let move_amount = self.speed * dt;  // speed is now pixels/second
    if is_key_down(KeyCode::Right) { self.x += move_amount; }
    if is_key_down(KeyCode::Left)  { self.x -= move_amount; }
    if self.x < 0.0                         { self.x = 0.0; }
    if self.x > screen_width() - self.width { self.x = screen_width() - self.width; }
}
```

Change `Ship::new()` to set speed in pixels-per-second:

```rust
    speed: 240.0,  // was 4.0 pixels/frame; now 240.0 pixels/second
```

Update `Bullet::update` and alien movement similarly:

```rust
// Bullet movement (in update_playing):
if data.bullet.active {
    data.bullet.y -= 500.0 * dt;  // 500 pixels/second upward
    if data.bullet.y < 0.0 { data.bullet.active = false; }
}

// Fleet movement:
for alien in data.aliens.iter_mut() {
    if alien.alive { alien.x += data.fleet_dx * dt * 60.0; }
    // × 60 because fleet_dx was tuned at 60fps; dt × 60 ≈ 1.0 at 60fps
}

// Enemy bullets:
for b in data.enemy_bullets.iter_mut() {
    b.y += 180.0 * dt;  // 180 pixels/second downward
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Game feels the same as before (if your monitor is 60 Hz).
The difference is that on any frame rate, the speed is consistent.

**Change something:** Set `speed: 480.0` — the ship moves twice as fast.
The bullet's `500.0` — adjust to change bullet speed. All changes are now
in real-world units (pixels per second) that you can reason about.

---

## Part B — Scrolling Starfield Background

## The Problem: The Background Is Featureless Black

A scrolling starfield makes the game feel like space and gives visual feedback
that "something is happening" even when the ship is still.

Each star is just a dot (a 2×2 rectangle) at a random position that moves
slowly downward. When it exits the bottom, it reappears at the top.

```rust
struct Star {
    x:     f32,
    y:     f32,
    speed: f32,  // pixels per second — varies to give depth illusion
    size:  f32,  // 1.0 = small/distant; 2.0 = large/close
}
```

Add stars to `GameData`:

```rust
pub stars: Vec<Star>,
```

Initialize 150 stars at random positions:

```rust
// In GameData::new():
use rand::Rng;
let mut rng = rand::thread_rng();
let stars: Vec<Star> = (0..150).map(|_| Star {
    x:     rng.gen_range(0.0..800.0),
    y:     rng.gen_range(0.0..600.0),
    speed: rng.gen_range(20.0..80.0),
    size:  if rng.gen_bool(0.3) { 2.0 } else { 1.0 },
}).collect();
```

> **`.map(|_| ...)​.collect()`** — `.map` transforms each item in an iterator.
> Here the input is `(0..150)` (integers 0 to 149). The `|_|` ignores the index
> (we do not need it). `.collect()` gathers the results into a `Vec<Star>`.
> This is the functional style alternative to a `for` loop with `push`.

Update and draw stars:

```rust
// In update_playing, before drawing:
for star in data.stars.iter_mut() {
    star.y += star.speed * dt;
    if star.y > screen_height() { star.y = 0.0; } // wrap to top
}

// In drawing section (BEFORE drawing everything else):
for star in &data.stars {
    let brightness = star.speed / 80.0; // faster = brighter (closer)
    let c = Color::new(brightness, brightness, brightness, 1.0);
    draw_rectangle(star.x, star.y, star.size, star.size, c);
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** A field of white dots slowly scrolls downward behind the game.
Brighter dots move faster (the parallax effect — closer stars move faster).

---

## Part C — Screen Shake

## The Concept: Screen Shake

Screen shake applies a random offset to the camera position for a short duration
after a dramatic event (boss death, player hit). Since macroquad's camera is
movable, we can shift everything drawn by a small random amount.

```rust
// Track shake state:
let mut shake_timer: f32    = 0.0;   // seconds remaining
let mut shake_amount: f32   = 0.0;   // max pixel offset
```

When the boss dies, set the shake:
```rust
shake_timer  = 0.5;   // shake for 0.5 seconds
shake_amount = 10.0;  // up to 10 pixels offset
```

In the draw section, apply the shake:
```rust
    let (offset_x, offset_y) = if shake_timer > 0.0 {
        shake_timer -= dt;
        let s = shake_amount * (shake_timer / 0.5); // fade out as time passes
        (rng.gen_range(-s..s), rng.gen_range(-s..s))
    } else {
        (0.0, 0.0)
    };

    // Apply offset to the camera:
    set_camera(&Camera2D {
        zoom: vec2(2.0 / screen_width(), 2.0 / screen_height()),
        offset: vec2(offset_x / screen_width(), offset_y / screen_height()),
        ..Default::default()
    });
    // Draw everything (with camera offset applied).
    // ...
    // Reset camera at end of frame:
    set_default_camera();
```

> **`Camera2D`** — macroquad's camera type. Setting a camera transforms all
> subsequent `draw_*` calls by the camera's position and zoom. `set_default_camera()`
> restores the normal (no transformation) camera.

### SAVE AND TRY

```sh
cargo run
```

Kill the boss. The entire screen shakes briefly then settles. The effect is
immediate and satisfying.

---

## Part D — Sound

## The Concept: Loading and Playing Audio

macroquad can load audio files (`ogg`, `wav`) and play them as sound effects
or music. Load once at startup; play when the event occurs.

First, you need audio files. Download a small, free set from [freesound.org](https://freesound.org)
or use any OGG/WAV files you have. Place them in a `sounds/` folder in your
project root:
```
space-invaders/
  sounds/
    shoot.wav
    explode.wav
    boss_die.wav
```

Enable audio in `Cargo.toml` if not already on (macroquad includes it by default).

```rust
// At startup (in main(), before the loop):
let sound_shoot   = load_sound("sounds/shoot.wav").await.unwrap_or_else(|_| {
    // If the sound file is missing, the game continues silently.
    // unwrap_or_else: use a fallback on Err instead of panicking.
    println!("[Audio] shoot.wav not found — no shoot sound.");
    // We cannot create a dummy Sound, so we skip this for now.
    panic!() // If this runs, the sound is mandatory. 
             // For a real game, handle gracefully.
});
```

> **`.await`** — sound loading is asynchronous (it reads from disk, which takes
> time). In an `async fn`, `.await` yields control until the load finishes.
> You have seen `.await` on `next_frame()` since LAB 01 — this is the same pattern.

> **For a robust game:** Use `Result` and skip sound on error rather than panicking.
> Many players run games from read-only locations or with restricted file access.

Play sounds at the right moments:

```rust
// When the player fires:
if is_key_pressed(KeyCode::Space) && !data.bullet.active {
    data.bullet.fire(&data.ship);
    play_sound_once(sound_shoot);  // plays the sound immediately
}

// When an alien dies:
alien.alive = false;
play_sound_once(sound_explode);

// When the boss dies:
alien.alive = false;
play_sound_once(sound_boss_die);
shake_timer  = 0.5;
shake_amount = 10.0;
```

> **`play_sound_once(sound)`** — plays the sound from the beginning, overlapping
> with any currently playing instances of the same sound.

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Shooting, explosions, and boss death all have audio feedback.
If sound files are missing, the game continues silently (if you handle the
error instead of panicking).

---

## 🎯 Challenge: Background Music

**The goal:** Load a looping background music track and play it continuously.

macroquad's `play_sound` (not `play_sound_once`) accepts a `PlaySoundParams`
struct where you can set `looped: true`.

```rust
use macroquad::audio::{play_sound, PlaySoundParams};

// At startup:
let music = load_sound("sounds/music.ogg").await?;

// After loading:
play_sound(music, PlaySoundParams {
    looped: true,
    volume: 0.5,  // 0.0 to 1.0
});
```

Try for at least 5 minutes before looking at the solution. The challenge
is making the music stop on game over and restart on the title screen.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use macroquad::audio::{play_sound, stop_sound, PlaySoundParams};

// Stop music when entering GameOver or Win state:
if *lives <= 0 {
    stop_sound(music);
    *state = GameState::GameOver;
}

// Restart music when going back to Playing from Title:
// In update_title, when Enter is pressed:
play_sound(music, PlaySoundParams { looped: true, volume: 0.5 });
*state = GameState::Playing;
```

**Key insight:** `stop_sound` immediately stops playback. For a fade-out effect,
you would decrease the volume over several frames using `set_sound_volume(sound, vol)`
until it reaches 0, then call `stop_sound`. This is an example of a feature that
looks simple on the surface (stop the music) but requires time-based logic to
feel polished.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Ship speed consistent at different frame rates | `get_frame_time()` used |
| Speed values in pixels/second | `speed: 240.0`, not `4.0` |
| Starfield scrolls downward | Dots move; wrap at bottom |
| Brighter/larger stars move faster | Parallax depth effect visible |
| Screen shakes on boss death | Brief shake on boss kill |
| Shake fades out (not abrupt stop) | Shake intensity decreases over time |
| Shoot sound plays on fire | Audio on Space press |
| Explode sound plays on alien death | Audio on kill |
| Challenge: music loops and stops on game over | Background music plays, stops |

---

## Quick Check Answers

**1. Why does frame-based movement vary with monitor speed?**
`ship.x += 4.0` runs once per frame. At 60 fps: 60 updates × 4.0 = 240 pixels
per second. At 144 fps: 144 updates × 4.0 = 576 pixels per second. With delta
time: `ship.x += 240.0 × dt`. At 60 fps: dt ≈ 0.0167, so 240 × 0.0167 ≈ 4.0
pixels per frame. At 144 fps: dt ≈ 0.007, so 240 × 0.007 ≈ 1.68 pixels per
frame — but 144 such frames happen per second, still totaling 240 pixels per second.

**2. Where does the shake offset go in the draw code?**
After `clear_background` but before all `draw_*` calls. The shake offset modifies
the camera, which transforms all subsequent draw calls. After drawing everything,
reset the camera with `set_default_camera()` so the offset does not carry to the
next frame. The offset must be recalculated each frame (random, fading).

**3. Should audio files be loaded inside the game loop?**
No — load once at startup. Loading a sound file reads from disk, which takes
milliseconds. If you load every frame at 60 fps, you would attempt 60 disk reads
per second, causing massive lag and likely crashing. Load once, store the result
in a variable, and call `play_sound_once(sound_handle)` (instant, from memory)
when needed.

---

## What Is Next — LAB 15

The game is polished, complete, and professionally structured. LAB 15 is the
capstone: a **release build** (`cargo build --release`), a high-score leaderboard
using a sorted `Vec` of (name, score) pairs, a complete retrospective of every
concept taught across the 15 labs, and a bridge to what comes next —
the Barrier KVM project where every single skill from this series applies directly.

*Continue to Space Invaders in Rust — LAB 15 — Ship It: Release, Leaderboard, and Retrospective.*
