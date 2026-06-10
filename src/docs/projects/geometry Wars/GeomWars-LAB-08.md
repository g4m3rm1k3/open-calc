# Geometry Wars — LAB 08 — Multiplier, Power-ups, and Screen Shake

**Read GeomWars-LAB-07.md first.** That lab added the deforming grid. This lab
adds the score multiplier, two power-ups, and screen shake — making kills feel
impactful and rewarding sustained play.

**What this lab adds over LAB-07:**
- Score multiplier: 2× for 5 kills, 4× for 10, 8× for 20 kills in a row
- Multiplier resets on death
- Power-up items: Speed Boost (10 seconds) and Shield (absorbs one hit)
- Screen shake on player death — the camera shakes for visual feedback
- Power-ups drawn as spinning shapes, collected by contact

---

## How This Connects to Pac-Man

**The power-up system is structurally identical to Pac-Man's power pellets:**

| Pac-Man | Geometry Wars |
|---|---|
| Power pellet tile → eating activates frightened mode | Speed Boost item → collecting activates `speed_boost_timer` |
| `frightenedTimerMs` counts down | `speed_boost_timer` counts down |
| Ghosts turn blue during timer | `SHIP_SPEED` multiplied by 1.8 during timer |
| Timer expires → ghosts return to normal | Timer expires → speed returns to normal |

The multiplier is new, but the timer-based-effect pattern is something you've
seen twice now (Pac-Man frightened mode, Tetris drop speed). Each time: activate
a timer on event, count down, revert on expiry.

---

## What You Will Build

When this lab is done:

- Score multiplier shown in HUD (×1, ×2, ×4, ×8)
- Killing enemies without dying builds the multiplier
- Dying resets it to ×1
- Green capsule (Speed Boost) and blue circle (Shield) appear periodically
- Collecting Speed Boost makes the ship briefly much faster
- Collecting Shield absorbs the next hit (ship flashes briefly instead of dying)
- Camera shakes 0.5 seconds on death

---

## Concept: Screen Shake

**What it is:** Briefly offsetting every draw operation by a random small amount,
creating the illusion that the camera is shaking.

**Implementation:**

```python
shake_duration  = 0.0     # remaining seconds of shake
SHAKE_INTENSITY = 8        # max pixel offset
SHAKE_DECAY     = 12       # how quickly shake fades (intensity per second)

# Each frame during shake:
shake_offset_x = random.uniform(-shake_intensity, shake_intensity)
shake_offset_y = random.uniform(-shake_intensity, shake_intensity)

# Apply offset when blitting everything:
screen.blit(game_surface, (shake_offset_x, shake_offset_y))
```

**The trick:** Instead of drawing directly to `screen`, we draw everything to
an intermediate `game_surface`, then blit that surface to `screen` at the shake
offset. Shaking is then applied to the entire scene with one line.

This is the **double-buffer / intermediate surface** pattern — common in game
graphics.

---

## Step 1 — Add Multiplier and Shake State

Add to `main.py`:

```python
# ── Score multiplier ──────────────────────────────────────────────────────────

kill_streak            = 0        # kills since last death
current_multiplier     = 1        # current score multiplier

MULTIPLIER_THRESHOLDS  = [5, 10, 20]   # kills needed for each multiplier tier
MULTIPLIER_VALUES      = [2,  4,  8]   # corresponding multiplier values

def kills_to_multiplier(kills):
    """
    Returns the score multiplier for the given kill streak.
    0-4 kills: ×1. 5-9: ×2. 10-19: ×4. 20+: ×8.
    """
    multiplier = 1
    for i, threshold in enumerate(MULTIPLIER_THRESHOLDS):
        if kills >= threshold:
            multiplier = MULTIPLIER_VALUES[i]
    return multiplier

# ── Screen shake ──────────────────────────────────────────────────────────────

shake_duration       = 0.0    # remaining shake time in seconds
SHAKE_PEAK_INTENSITY = 8      # maximum pixel offset at shake start
SHAKE_DURATION_SECS  = 0.5    # how long the shake lasts
```

---

## Step 2 — Add Power-ups

Add a `PowerUp` class:

```python
# ── Power-up constants ────────────────────────────────────────────────────────

POWERUP_RADIUS         = 10
POWERUP_SPAWN_INTERVAL = 8.0    # seconds between power-up spawns
SPEED_BOOST_DURATION   = 10.0   # seconds speed boost lasts
SPEED_BOOST_MULTIPLIER = 1.8    # how much faster

COLOR_POWERUP_SPEED    = (50,  220, 80)   # green
COLOR_POWERUP_SHIELD   = (80,  150, 255)  # blue

POWERUP_TYPE_SPEED  = 'SPEED'
POWERUP_TYPE_SHIELD = 'SHIELD'

powerup_spawn_timer = POWERUP_SPAWN_INTERVAL
speed_boost_timer   = 0.0    # counts down; > 0 = boost active
has_shield          = False   # True = next hit is absorbed

class PowerUp:
    """
    A collectible item that gives a temporary effect.
    Spawns at a random position in the playfield (not at edges).
    """
    def __init__(self, position, powerup_type):
        self.position     = position.copy()
        self.powerup_type = powerup_type
        self.is_alive     = True
        self.age          = 0.0     # for spinning animation
        self.lifetime     = 12.0    # disappears after 12 seconds if not collected

    def update(self, delta_seconds):
        self.age      += delta_seconds
        self.lifetime -= delta_seconds
        if self.lifetime <= 0:
            self.is_alive = False

    def draw(self, surface):
        """Draw based on type — speed = spinning capsule, shield = pulsing circle."""
        cx, cy = int(self.position.x), int(self.position.y)

        if self.powerup_type == POWERUP_TYPE_SPEED:
            # Draw a spinning diamond (like Seeker but green).
            for scale, color in [(1.0, COLOR_POWERUP_SPEED), (0.5, (150, 255, 150))]:
                size = int(POWERUP_RADIUS * scale)
                pts  = [
                    (cx,        cy - size),
                    (cx + size, cy),
                    (cx,        cy + size),
                    (cx - size, cy),
                ]
                # Rotate points around center by self.age (spinning).
                rotated = []
                for px, py in pts:
                    dx_  = px - cx
                    dy_  = py - cy
                    nx   = dx_ * math.cos(self.age * 2) - dy_ * math.sin(self.age * 2)
                    ny   = dx_ * math.sin(self.age * 2) + dy_ * math.cos(self.age * 2)
                    rotated.append((int(cx + nx), int(cy + ny)))
                pygame.draw.polygon(surface, color, rotated)

        else:  # SHIELD
            # Draw a pulsing circle (radius oscillates).
            pulse_r = int(POWERUP_RADIUS + math.sin(self.age * 4) * 3)
            pygame.draw.circle(surface, COLOR_POWERUP_SHIELD, (cx, cy), pulse_r, 2)
            pygame.draw.circle(surface, (150, 200, 255),       (cx, cy), pulse_r // 2)

powerups = []

def spawn_powerup():
    """Spawns a random power-up at a random position in the playfield."""
    MARGIN = 60   # keep away from edges
    pos_x  = random.uniform(MARGIN, WINDOW_WIDTH  - MARGIN)
    pos_y  = random.uniform(MARGIN, WINDOW_HEIGHT - MARGIN)
    ptype  = random.choice([POWERUP_TYPE_SPEED, POWERUP_TYPE_SHIELD])
    powerups.append(PowerUp(pygame.math.Vector2(pos_x, pos_y), ptype))

def check_powerup_collection():
    """Checks if the ship is touching any power-up. Applies effect if so."""
    global speed_boost_timer, has_shield

    COLLECTION_DISTANCE = SHIP_RADIUS + POWERUP_RADIUS

    for powerup in powerups:
        if not powerup.is_alive: continue
        dist = (ship_position - powerup.position).length()
        if dist < COLLECTION_DISTANCE:
            if powerup.powerup_type == POWERUP_TYPE_SPEED:
                speed_boost_timer = SPEED_BOOST_DURATION
            else:
                has_shield = True
            powerup.is_alive = False
            spawn_explosion(powerup.position, (200, 200, 255))  # collection sparkle
```

---

## Step 3 — Intermediate Surface for Screen Shake

Replace `screen.fill(...)` drawing with an intermediate surface:

```python
# Add once after pygame setup:
game_surface = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
```

In `run_game()`, update the draw section to use `game_surface`:

```python
# ── Draw ─────────────────────────────────────────────────────────────────
game_surface.fill(COLOR_BACKGROUND)
draw_grid(game_surface)
for particle in particles: particle.draw(game_surface)
for powerup  in powerups:  powerup.draw(game_surface)
for bullet   in bullets:   bullet.draw(game_surface)
for enemy    in enemies:   enemy.draw(game_surface)
if current_game_state != GAME_STATE_DEAD or int(death_timer * 10) % 2 == 0:
    draw_ship(game_surface, ship_position, ship_angle)
draw_hud(game_surface)
if current_game_state == GAME_STATE_GAME_OVER:
    draw_overlay(game_surface, 'GAME OVER', f'Score: {current_score}', 'Press R to restart')

# Apply screen shake when blitting to the real screen.
if shake_duration > 0:
    intensity    = int(SHAKE_PEAK_INTENSITY * (shake_duration / SHAKE_DURATION_SECS))
    shake_x      = random.randint(-intensity, intensity)
    shake_y      = random.randint(-intensity, intensity)
    shake_duration -= delta_seconds
    if shake_duration < 0: shake_duration = 0
else:
    shake_x = shake_y = 0

screen.fill((0, 0, 0))   # fill real screen black (visible in shake margins)
screen.blit(game_surface, (shake_x, shake_y))
pygame.display.flip()
```

---

## Step 4 — Wire Everything into Update

In the `PLAYING` block of `run_game()`, after ship movement:

```python
# Speed boost effect.
if speed_boost_timer > 0:
    speed_boost_timer -= delta_seconds
    effective_speed    = SHIP_SPEED * SPEED_BOOST_MULTIPLIER
else:
    effective_speed    = SHIP_SPEED

# Replace: ship_position += move_direction * SHIP_SPEED * delta_seconds
# With:
ship_position += move_direction * effective_speed * delta_seconds
```

After enemy updates and collision, update kill streak and multiplier:

```python
# In check_bullet_enemy_collisions, after `died`:
if died:
    kill_streak        += 1
    current_multiplier  = kills_to_multiplier(kill_streak)
    current_score      += POINTS_PER_SEEKER * current_multiplier
    spawn_explosion(enemy.position, ...)
```

In `handle_player_death`, check shield first:

```python
def handle_player_death():
    global current_game_state, lives_remaining, death_timer
    global has_shield, shake_duration, kill_streak, current_multiplier

    if has_shield:
        has_shield = False   # absorb the hit — no death
        shake_duration = 0.15   # brief shake to signal hit absorbed
        return

    # No shield — take the hit.
    lives_remaining   -= 1
    kill_streak        = 0     # reset multiplier on death
    current_multiplier = 1
    shake_duration     = SHAKE_DURATION_SECS
    current_game_state = GAME_STATE_DEAD
    death_timer        = DEATH_PAUSE_SECONDS
    spawn_explosion(ship_position, (150, 180, 255))
```

Update the HUD to show multiplier and active power-ups:

```python
def draw_hud(surface):
    # Score.
    score_surf = font_ui.render(f'SCORE  {current_score}', True, COLOR_UI_TEXT)
    surface.blit(score_surf, score_surf.get_rect(topright=(WINDOW_WIDTH - 16, 16)))

    # Multiplier.
    mult_color = (255, 255, 50) if current_multiplier > 1 else COLOR_UI_TEXT
    mult_surf  = font_ui.render(f'×{current_multiplier}', True, mult_color)
    surface.blit(mult_surf, mult_surf.get_rect(topright=(WINDOW_WIDTH - 16, 44)))

    # Lives.
    # ... (same as before) ...

    # Active effects.
    if speed_boost_timer > 0:
        boost_surf = font_ui.render(f'BOOST {speed_boost_timer:.1f}s', True, COLOR_POWERUP_SPEED)
        surface.blit(boost_surf, (16, WINDOW_HEIGHT - 36))

    if has_shield:
        shield_surf = font_ui.render('SHIELD', True, COLOR_POWERUP_SHIELD)
        surface.blit(shield_surf, (16, WINDOW_HEIGHT - 60))
```

Add power-up spawning and collection in `PLAYING` update:

```python
powerup_spawn_timer -= delta_seconds
if powerup_spawn_timer <= 0:
    spawn_powerup()
    powerup_spawn_timer = POWERUP_SPAWN_INTERVAL

for powerup in powerups: powerup.update(delta_seconds)
powerups[:] = [p for p in powerups if p.is_alive]
check_powerup_collection()
```

Add to `restart_game()`:
```python
has_shield = False
speed_boost_timer = 0.0
kill_streak = 0
current_multiplier = 1
powerups.clear()
```

---

### SAVE AND TRY — Final

Save. Run. Kill 5 enemies without dying.

**You should see:**
- The multiplier display changes from ×1 to ×2 at 5 kills
- Points per kill jump accordingly
- Collect a green power-up → ship moves noticeably faster for 10 seconds
- Collect a blue power-up → next hit absorbed (shield indicator shows)
- Die → camera shakes, multiplier resets to ×1

```python
# Console test — check state:
current_multiplier   # current multiplier value
kill_streak          # kills since last death
speed_boost_timer    # > 0 if boosted
has_shield           # True if shielded
```

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Multiplier builds with kills | Kill 5: ×2, 10: ×4, 20: ×8 |
| Multiplier shown in HUD | ×2 in yellow when active |
| Death resets multiplier | Die → ×1 shown again |
| Speed boost collected | Fly through green diamond → faster ship |
| Boost timer visible | "BOOST 9.4s" countdown in HUD |
| Shield collected | Fly through blue circle → "SHIELD" in HUD |
| Shield absorbs one hit | Walk into enemy while shielded → no death |
| Screen shakes on death | Brief camera shake when dying |
| No shake on shield hit | Brief small shake but no full shake |
| Power-ups appear periodically | New power-up every 8 seconds |

---

## What Is Next — LAB 09

LAB 09 adds pygame sound synthesis (equivalent to Pac-Man's Web Audio API) —
shoot sounds, explosion sounds, death, and the ambient background hum — plus the
high score saved to a file using Python's standard library.

---

*Continue to Geometry Wars — LAB 09 — Sound and High Score.*
