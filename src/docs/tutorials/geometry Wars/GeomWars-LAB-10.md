# Geometry Wars — LAB 10 — Polish and Completion

**Read GeomWars-LAB-09.md first.** That lab added sound and high score. This
final lab adds a start screen, bullet color trails, wave-based difficulty
progression, and a complete cross-language summary of everything you've learned.

**What this lab adds over LAB-09:**
- A title screen with pulsing animated text
- Bullet trails — each bullet leaves a fading color trail behind it
- Wave-based enemy spawning (harder waves as kills accumulate)
- A `READY` state before each wave

---

## How This Connects to Everything

Before writing any code, read this summary. It is the most important section
in the entire series.

---

## The Pattern Dictionary — What You Can Now Build

After Tetris (JavaScript) + Pac-Man (JavaScript) + Geometry Wars (Python),
every game you will encounter uses some combination of these patterns:

### 1. The Game Loop
```python
# Python                              # JavaScript
while True:                           # requestAnimationFrame(gameLoop)
    delta = clock.tick(60) / 1000    # const delta = ts - prev
    update(delta)                     # update(delta)
    render()                          # render()
    pygame.display.flip()             # (automatic)
```
**Used in:** Every game ever made.

### 2. The Entity List
```python
# Any dynamic object: spawn, update, prune dead, draw
entities.append(Enemy(position))
for e in entities: e.update(delta)
entities[:] = [e for e in entities if e.is_alive]
for e in entities: e.draw(surface)
```
**Used in:** Bullets (LAB-02), Enemies (LAB-03), Particles (LAB-05),
Power-ups (LAB-08), Pac-Man ghosts, Tetris pieces (one entity, not a list).

### 3. The State Machine
```python
# currentGameState controls what update() and render() do.
# One variable = one truth about what the game is doing.
if state == PLAYING:   update_gameplay()
elif state == DEAD:    tick_death_timer()
elif state == GAME_OVER: wait_for_restart()
```
**Used in:** Pac-Man LAB-05, Geometry Wars LAB-04. Transferable to any game.

### 4. The Timer Pattern
```python
# Count down. When ≤ 0, trigger something.
timer -= delta
if timer <= 0:
    trigger_event()
    timer = INTERVAL  # reset
```
**Used in:** Pac-Man frightened mode, Tetris drop timer, GW spawn timer,
GW speed boost, GW shake duration.

### 5. Delta-Time Movement
```python
position += velocity * delta_seconds  # frame-rate independent
```
**Used in:** Geometry Wars (everything). Tetris used frame-counting. Pac-Man
used per-frame pixels. Delta-time is the professional standard.

### 6. Circle-Circle Collision
```python
if (a.position - b.position).length() < a.radius + b.radius:
    handle_collision()
```
**Used in:** Pac-Man ghost-Pac-Man, GW bullet-enemy, GW ship-enemy, GW power-up.

### 7. Coordinate Systems
- **Tile-based:** Pac-Man. Position = (column, row) integers.
- **Pixel-based:** Geometry Wars. Position = (x, y) floats.
- **Both:** Pac-Man used pixel position for drawing but tile position for logic.
- **Lesson:** Know which coordinate system each system needs; convert when crossing.

### 8. Polymorphism / Entity Types
```python
# All enemies share the same interface; behavior varies internally.
for enemy in enemies: enemy.update(delta, target)
# Seeker chases, Wanderer ignores target, Splitter splits on death.
```
**Used in:** Pac-Man ghost personalities, GW enemy classes.

---

## What Brick Breaker Would Look Like Now

Here is how you would plan Brick Breaker using the patterns you know:

```
Entity lists: bricks[], ball (one entity), paddle
State machine: READY → PLAYING → BALL_LOST → GAME_OVER → WIN
Timer: briefly pause after losing a ball (BALL_LOST state)
Collision:
  - Ball vs walls: reflect velocity (new concept — but trivial)
  - Ball vs paddle: reflect and adjust angle based on where it hits
  - Ball vs bricks: circle-rectangle (look up once, understand immediately)
Game loop: standard delta-time loop
Drawing: pygame.draw.rect for bricks, pygame.draw.circle for ball
```

**The only new thing:** circle-rectangle collision math. One StackOverflow
lookup. The rest you already know.

---

## Step 1 — Start Screen

Add `GAME_STATE_TITLE = 'TITLE'` to the game state constants.

Add the title screen drawing:

```python
def draw_title_screen(surface, elapsed_time):
    """
    Draws the title screen with animated text.
    elapsed_time: total seconds since game start — used for animation.
    """
    surface.fill(COLOR_BACKGROUND)

    # Animate the grid even on the title screen.
    draw_grid(surface)

    # Pulsing title text — scale amplitude with sin wave.
    # sin ranges -1 to 1; (sin + 1) / 2 ranges 0 to 1.
    pulse = (math.sin(elapsed_time * 2.0) + 1) / 2   # 0.0 → 1.0 pulsing
    title_brightness = int(180 + pulse * 75)          # 180 → 255 brightness
    title_color = (title_brightness, title_brightness, 50)

    title_surf = font_title.render('GEOMETRY WARS', True, title_color)
    title_rect = title_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 60))
    surface.blit(title_surf, title_rect)

    subtitle_surf = font_subtitle.render('Python Edition', True, (100, 100, 180))
    subtitle_rect = subtitle_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
    surface.blit(subtitle_surf, subtitle_rect)

    if int(elapsed_time * 2) % 2 == 0:   # blink every 0.5 seconds
        prompt_surf = font_ui.render('Click to Start', True, COLOR_UI_TEXT)
        prompt_rect = prompt_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 60))
        surface.blit(prompt_surf, prompt_rect)

    # Show high score on title screen.
    if high_score > 0:
        hs_surf = font_ui.render(f'Best Score: {high_score}', True, (120, 120, 160))
        hs_rect = hs_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 100))
        surface.blit(hs_surf, hs_rect)
```

Update `run_game()` event handling for the title screen:

```python
# In the events loop:
if event.type == pygame.MOUSEBUTTONDOWN:
    if current_game_state == GAME_STATE_TITLE:
        restart_game()
        current_game_state = GAME_STATE_PLAYING
```

In the draw section:
```python
if current_game_state == GAME_STATE_TITLE:
    draw_title_screen(game_surface, total_elapsed_time)
else:
    # ... existing draw code ...
```

Add `total_elapsed_time = 0.0` state variable and `total_elapsed_time += delta_seconds` each frame.

Set initial state to `GAME_STATE_TITLE`:
```python
current_game_state = GAME_STATE_TITLE
```

---

## Step 2 — Bullet Trails

Each bullet tracks its last few positions. Draw fading circles at each past position.

Update the `Bullet` class:

```python
class Bullet:
    TRAIL_LENGTH = 6   # how many past positions to store

    def __init__(self, position, velocity):
        self.position  = position.copy()
        self.velocity  = velocity.copy()
        self.lifetime  = 0.0
        self.is_alive  = True
        self.trail     = []   # list of past (x, y) positions, oldest first

    def update(self, delta_seconds):
        # Store current position in trail before moving.
        self.trail.append((self.position.x, self.position.y))
        if len(self.trail) > Bullet.TRAIL_LENGTH:
            self.trail.pop(0)   # remove oldest — keep trail at fixed length

        self.position += self.velocity * delta_seconds
        self.lifetime += delta_seconds
        if self.lifetime >= BULLET_MAX_LIFETIME:
            self.is_alive = False
        if (self.position.x < 0 or self.position.x > WINDOW_WIDTH or
                self.position.y < 0 or self.position.y > WINDOW_HEIGHT):
            self.is_alive = False

    def draw(self, surface):
        # Draw trail — older positions are smaller and dimmer.
        for i, (tx, ty) in enumerate(self.trail):
            fraction = (i + 1) / len(self.trail)   # 0 = oldest, 1 = newest
            trail_r  = max(1, int(BULLET_RADIUS * fraction * 0.7))
            alpha    = int(120 * fraction)
            # Simple dim-color trail (no per-pixel alpha for performance).
            dim_color = (
                int(COLOR_BULLET[0] * fraction * 0.6),
                int(COLOR_BULLET[1] * fraction * 0.6),
                int(COLOR_BULLET[2] * fraction * 0.3),
            )
            pygame.draw.circle(surface, dim_color, (int(tx), int(ty)), trail_r)

        # Draw the bullet itself.
        center = (int(self.position.x), int(self.position.y))
        pygame.draw.circle(surface, (200, 180, 30), center, BULLET_RADIUS + 2)
        pygame.draw.circle(surface, COLOR_BULLET,   center, BULLET_RADIUS)
```

**`list.pop(0)` explained:**

Removes and returns the element at index 0 (the oldest trail point). After
`pop(0)`, all remaining elements shift left by one index. For short lists (6
elements), this is fine. For longer lists, use `collections.deque` with
`maxlen` — it does this in O(1) instead of O(n).

---

## Step 3 — Wave Progression

Replace the flat `SPAWN_INTERVAL` with a wave system:

```python
current_wave   = 1
kills_in_wave  = 0
KILLS_PER_WAVE = 15   # clear this many kills to advance the wave
wave_text_timer = 0.0  # shows "WAVE X" briefly on wave start

def get_spawn_interval_for_wave(wave):
    """Enemies spawn faster at higher waves."""
    return max(0.5, SPAWN_INTERVAL - wave * 0.2)   # minimum 0.5 seconds

def advance_wave():
    global current_wave, kills_in_wave, spawn_timer, wave_text_timer
    current_wave    += 1
    kills_in_wave    = 0
    spawn_timer      = get_spawn_interval_for_wave(current_wave)
    wave_text_timer  = 2.5   # show "WAVE X" for 2.5 seconds
```

In `check_bullet_enemy_collisions`, after incrementing `kill_streak`:

```python
kills_in_wave += 1
if kills_in_wave >= KILLS_PER_WAVE:
    advance_wave()
```

Draw the wave notification in the HUD:

```python
if wave_text_timer > 0:
    wave_text_timer -= delta_seconds
    wave_surf = font_subtitle.render(f'WAVE {current_wave}', True, (200, 200, 255))
    wave_rect = wave_surf.get_rect(center=(WINDOW_WIDTH // 2, 60))
    game_surface.blit(wave_surf, wave_rect)
```

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**Title screen:** You see the animated title. Click to start.

**Bullet trails:** Rapid fire — notice the dim yellow tail behind each bullet.

**Wave progression:** Kill 15 enemies → "WAVE 2" appears briefly. Enemies spawn
faster. Kill 15 more → "WAVE 3". Progressively harder.

---

## Final Check — Complete Game

| Feature | How to verify |
|---------|--------------|
| Title screen shows | Start → animated title with "Click to Start" |
| High score on title | Best score visible if previously played |
| Click to start | Mouse click → game begins immediately |
| Bullet trails visible | Fire rapidly → dim yellow tail on bullets |
| Wave counter increases | Kill 15 → "WAVE 2" appears |
| Spawn speed increases each wave | Wave 3+ has noticeably faster spawns |
| All LAB-09 features intact | Sound, high score, shake, multiplier all work |
| All LAB-08 features intact | Power-ups, multiplier, screen shake work |

---

## The Complete Geometry Wars Series

| Lab | Feature added | Playable? |
|-----|--------------|-----------|
| LAB-01 | Ship on screen, WASD + mouse aim | ✅ Immediately |
| LAB-02 | Shooting — click to fire bullets | ✅ Shooting range |
| LAB-03 | Seeker enemies, spawning, collision | ✅ Real danger |
| LAB-04 | State machine, lives, game over | ✅ Complete loop |
| LAB-05 | Particle explosions, drag, fading | ✅ Looks great |
| LAB-06 | Wanderer, Splitter, Mini — polymorphism | ✅ Full challenge |
| LAB-07 | Deforming grid, spring physics | ✅ Signature look |
| LAB-08 | Multiplier, power-ups, screen shake | ✅ Full mechanics |
| LAB-09 | Sound synthesis, file high score | ✅ Complete polish |
| LAB-10 | Title screen, bullet trails, waves | ✅ Finished game |

---

## What To Build Next

You now have the foundation to build any of these in JavaScript or Python:

| Game | New concept required | Patterns you already know |
|---|---|---|
| **Brick Breaker** | Rectangle-circle collision, ball reflection | Entity lists, state machine, delta time |
| **Tetris (Python)** | Nothing new | You built Tetris in JS already — translate it |
| **Pac-Man (Python)** | `pygame.draw` for maze | Same state machine, same ghost AI |
| **Snake** | Linked list or deque for body | Entity list, state machine, keyboard input |
| **Asteroids** | Asteroid splitting, screen wrap | Splitter pattern, GW ship movement |
| **Space Invaders** | Formation movement, descending rows | Entity lists, timer patterns |
| **Platformer** | Gravity (constant downward force), ground collision | Spring physics from GW grid |

**The recommended path:**
1. Build Tetris in Python (translate from JS — pure syntax practice)
2. Build Brick Breaker in JavaScript (one new concept: rectangle-circle collision)
3. Build Pac-Man in Python (translate from JS — tile maps in pygame)
4. Pick a new game and design it yourself before looking at tutorials

By step 4, you are building games independently.
