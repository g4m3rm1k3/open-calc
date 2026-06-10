# Geometry Wars — LAB 04 — Collision, Death, and the State Machine

**Read GeomWars-LAB-03.md first.** That lab added Seekers. This lab adds the
consequence — Seekers that touch the ship kill the player — and a full game
state machine with lives, death pause, and game over.

**What this lab adds over LAB-03:**
- Ship-enemy collision detection (same circle-circle pattern as bullets)
- `GAME_STATE` finite state machine — identical pattern to Pac-Man LAB-05
- 3 lives, death pause (1.5 seconds), respawn
- Game over screen drawn on the pygame surface
- Score tracking — 10 points per Seeker destroyed
- Score and lives displayed with `pygame.font`

---

## How This Connects to Pac-Man

The state machine pattern is **exactly the same** as Pac-Man LAB-05.
Side by side:

```python
# Geometry Wars (Python)          # Pac-Man (JavaScript)
GAME_STATE = {                     const GAME_STATE = {
  'PLAYING':   'PLAYING',            PLAYING:   'PLAYING',
  'DEAD':      'DEAD',               DEAD:      'DEAD',
  'GAME_OVER': 'GAME_OVER',          GAME_OVER: 'GAME_OVER',
}                                  };

current_state = 'PLAYING'          let currentGameState = GAME_STATE.PLAYING;

# In update:                       # In update:
if current_state == 'PLAYING':     if (currentGameState === GAME_STATE.PLAYING) {
    update_gameplay()                  updateGameplay();
elif current_state == 'DEAD':      } else if (currentGameState === GAME_STATE.DEAD) {
    death_timer -= delta               deathTimerMs += deltaTime;
    if death_timer <= 0:               if (deathTimerMs >= DEATH_PAUSE_MS) {
        respawn()                          respawn();
                                       }
                                   }
```

The concept, structure, and flow are identical. Only the syntax differs.
Once you understand state machines, they transfer directly across languages.

---

## What You Will Build

When this lab is done:

- Enemy touching the ship → 1.5 second pause → respawn or game over
- 3 lives shown as small ship icons in the top-left
- Score shown in the top-right
- Game Over drawn on the pygame surface with a restart prompt
- Pressing R restarts the game

---

## Concept: Drawing Text in Pygame

**In JavaScript:** `ctx.fillText('GAME OVER', x, y)` — uses the canvas context.

**In pygame:** You use a `Font` object to render text to a `Surface`, then
`blit` (draw) that surface onto the screen.

```python
font = pygame.font.SysFont('monospace', 24)  # create a font object

# Render text to a new Surface (returns Surface, not None).
text_surface = font.render('GAME OVER', True, (255, 255, 0))
                           # text, antialiased, color

# blit: draw one Surface onto another at a position.
screen.blit(text_surface, (x, y))
# (x, y) is the TOP-LEFT corner of the text surface.
```

**`pygame.font.SysFont(name, size)`** — uses a font installed on the system.
`'monospace'` picks the system monospace font. For consistent results across
machines, use `pygame.font.Font(None, size)` which uses pygame's default font.

**`font.render(text, antialias, color)`:**
- `antialias = True` — smooth edges (looks better, slightly slower)
- Returns a new `Surface` — you must `blit` it somewhere to display it

**Centering text:** `text_surface.get_rect(center=(x, y))` returns a `Rect`
with the center at `(x, y)`:
```python
rect = text_surface.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
screen.blit(text_surface, rect)
```

---

## Step 1 — Add Game State and Scoring

Add to `main.py` below the enemy constants:

```python
# ── Game state ─────────────────────────────────────────────────────────────────
# Same finite state machine pattern as Pac-Man LAB-05.
# One variable tells us what the game is doing at any moment.

GAME_STATE_PLAYING   = 'PLAYING'
GAME_STATE_DEAD      = 'DEAD'
GAME_STATE_GAME_OVER = 'GAME_OVER'

current_game_state = GAME_STATE_PLAYING

# ── Lives and score ────────────────────────────────────────────────────────────

STARTING_LIVES       = 3
DEATH_PAUSE_SECONDS  = 1.5   # pause before respawn (same as Pac-Man's 1500ms)
POINTS_PER_SEEKER    = 10

lives_remaining   = STARTING_LIVES
current_score     = 0
death_timer       = 0.0     # counts down from DEATH_PAUSE_SECONDS during DEAD state
```

Add fonts after `pygame.init()`:

```python
# ── Fonts ──────────────────────────────────────────────────────────────────────
# pygame.font.Font(None, size) uses the default built-in font — no file needed.
# None = use built-in. size = approximate pixel height of characters.

font_ui       = pygame.font.Font(None, 28)   # for score and lives
font_title    = pygame.font.Font(None, 64)   # for "GAME OVER" title
font_subtitle = pygame.font.Font(None, 32)   # for prompts and subtitles
```

---

## Step 2 — Ship-Enemy Collision

Add below `check_bullet_enemy_collisions()`:

```python
def check_ship_enemy_collisions():
    """
    Checks if any alive enemy is overlapping the ship.
    If the game is not in PLAYING state, does nothing —
    prevents double-triggering death during the death pause.

    Circle-circle collision — same math as bullet-enemy in LAB-03
    and ghost-Pac-Man in Pac-Man LAB-04.
    """
    global current_game_state, lives_remaining, death_timer

    if current_game_state != GAME_STATE_PLAYING:
        return  # only check during active gameplay

    COLLISION_DISTANCE = SHIP_RADIUS + SEEKER_RADIUS

    for enemy in enemies:
        if not enemy.is_alive:
            continue

        delta    = ship_position - enemy.position
        distance = delta.length()

        if distance < COLLISION_DISTANCE:
            handle_player_death()
            return  # one collision is enough


def handle_player_death():
    """
    Called when an enemy touches the player.
    Transitions to DEAD state and starts the death pause timer.
    """
    global current_game_state, lives_remaining, death_timer

    lives_remaining  -= 1
    current_game_state = GAME_STATE_DEAD
    death_timer        = DEATH_PAUSE_SECONDS
```

---

## Step 3 — Respawn and Game Over

Add:

```python
def respawn_player():
    """
    Resets the ship to the center and clears all enemies.
    Called after the death pause when lives remain.
    """
    global ship_position, ship_angle, current_game_state

    ship_position      = pygame.math.Vector2(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2)
    ship_angle         = 0.0
    current_game_state = GAME_STATE_PLAYING

    # Clear enemies so the player doesn't immediately die again.
    # In Pac-Man this was done by resetGhosts() — same idea.
    enemies.clear()
    bullets.clear()


def trigger_game_over():
    global current_game_state
    current_game_state = GAME_STATE_GAME_OVER


def restart_game():
    """Resets ALL game state for a fresh start. Same as Pac-Man's restartGame()."""
    global current_game_state, lives_remaining, current_score, death_timer
    global ship_position, ship_angle, spawn_timer, fire_cooldown

    current_game_state = GAME_STATE_PLAYING
    lives_remaining    = STARTING_LIVES
    current_score      = 0
    death_timer        = 0.0
    spawn_timer        = SPAWN_INTERVAL
    fire_cooldown      = 0.0
    ship_position      = pygame.math.Vector2(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2)
    ship_angle         = 0.0

    enemies.clear()
    bullets.clear()
```

**`list.clear()` explained:**

Removes all elements from the list in-place. Equivalent to `bullets[:] = []`.
Used here instead of `bullets[:] = [b for b in bullets if False]` for clarity.
The game resumes with empty lists — no lingering bullets or enemies.

---

## Step 4 — Drawing the HUD and Overlays

Add:

```python
def draw_hud(surface):
    """
    Draws the score (top-right) and remaining lives (top-left).
    Called every frame during PLAYING and DEAD states.
    """
    # Score — top-right corner.
    score_text    = font_ui.render(f'SCORE  {current_score}', True, COLOR_UI_TEXT)
    score_rect    = score_text.get_rect(topright=(WINDOW_WIDTH - 16, 16))
    surface.blit(score_text, score_rect)

    # Lives — top-left as small ship icons.
    # We draw simple triangles using the same get_ship_world_points function.
    LIFE_ICON_SPACING = 28
    LIFE_ICON_SCALE   = 0.6   # smaller than the real ship
    for life_index in range(lives_remaining):
        icon_x    = 20 + life_index * LIFE_ICON_SPACING
        icon_y    = 24
        icon_pos  = pygame.math.Vector2(icon_x, icon_y)
        # Scale the icon points manually (no built-in scale parameter).
        icon_nose   = pygame.math.Vector2(0,  -14 * LIFE_ICON_SCALE)
        icon_wing_l = pygame.math.Vector2(-9 * LIFE_ICON_SCALE,  10 * LIFE_ICON_SCALE)
        icon_wing_r = pygame.math.Vector2( 9 * LIFE_ICON_SCALE,  10 * LIFE_ICON_SCALE)
        points = [
            (icon_pos + icon_nose),
            (icon_pos + icon_wing_l),
            (icon_pos + icon_wing_r),
        ]
        tuples = [(int(p.x), int(p.y)) for p in points]
        pygame.draw.polygon(surface, COLOR_SHIP, tuples)


def draw_overlay(surface, title_text, subtitle_text, prompt_text):
    """
    Draws a semi-transparent dark overlay with title, subtitle, and prompt.
    Same pattern as Pac-Man's drawOverlay() — drawn on the canvas (surface),
    not as an HTML element.

    In pygame, semi-transparency requires a separate Surface with per-pixel alpha.
    """
    # Create a transparent overlay surface.
    overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
    # SRCALPHA means each pixel has an alpha channel.
    overlay.fill((0, 0, 0, 180))  # RGBA: black at 70% opacity (180/255 ≈ 0.71)
    surface.blit(overlay, (0, 0))

    # Title — large, centered.
    title_surf = font_title.render(title_text, True, (255, 255, 50))
    title_rect = title_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 50))
    surface.blit(title_surf, title_rect)

    # Subtitle — score or level.
    sub_surf = font_subtitle.render(subtitle_text, True, (200, 200, 200))
    sub_rect = sub_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 10))
    surface.blit(sub_surf, sub_rect)

    # Prompt — how to restart.
    prompt_surf = font_ui.render(prompt_text, True, (130, 130, 150))
    prompt_rect = prompt_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 55))
    surface.blit(prompt_surf, prompt_rect)
```

**`pygame.Surface((w, h), pygame.SRCALPHA)` explained:**

By default, pygame Surfaces do not support transparency. `pygame.SRCALPHA`
creates a Surface where each pixel has an alpha (transparency) channel.
Filling it with `(0, 0, 0, 180)` makes a black layer at 70% opacity. When
blitted on top of the game, it dims everything beneath — the same effect as
`ctx.fillStyle = 'rgba(0,0,0,0.7)'` in JavaScript canvas.

---

## Step 5 — State-Aware Update and Full Game Loop

Update `run_game()`:

```python
def run_game():
    global ship_position, ship_angle, fire_cooldown, spawn_timer
    global current_game_state, death_timer, current_score

    while True:
        # ── Events ───────────────────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                raise SystemExit
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    if current_game_state == GAME_STATE_GAME_OVER:
                        restart_game()

        # ── Timing ───────────────────────────────────────────────────────────
        delta_ms      = clock.tick(TARGET_FPS)
        delta_seconds = delta_ms / 1000.0

        # ── State machine update ──────────────────────────────────────────────

        if current_game_state == GAME_STATE_PLAYING:

            # Ship movement
            keys_held = pygame.key.get_pressed()
            move_direction = pygame.math.Vector2(0, 0)
            if keys_held[pygame.K_w] or keys_held[pygame.K_UP]:    move_direction.y -= 1
            if keys_held[pygame.K_s] or keys_held[pygame.K_DOWN]:  move_direction.y += 1
            if keys_held[pygame.K_a] or keys_held[pygame.K_LEFT]:  move_direction.x -= 1
            if keys_held[pygame.K_d] or keys_held[pygame.K_RIGHT]: move_direction.x += 1
            if move_direction.length() > 0:
                move_direction = move_direction.normalize()
            ship_position += move_direction * SHIP_SPEED * delta_seconds
            ship_position.x %= WINDOW_WIDTH
            ship_position.y %= WINDOW_HEIGHT

            mouse_x, mouse_y = pygame.mouse.get_pos()
            ship_angle = math.atan2(mouse_y - ship_position.y, mouse_x - ship_position.x) + math.pi / 2

            # Shooting
            fire_cooldown -= delta_seconds
            if pygame.mouse.get_pressed()[0] and fire_cooldown <= 0:
                fire_bullet()
                fire_cooldown = FIRE_RATE_SECONDS

            # Spawning
            spawn_timer -= delta_seconds
            if spawn_timer <= 0:
                spawn_seeker()
                spawn_timer = SPAWN_INTERVAL

            # Update
            for bullet in bullets: bullet.update(delta_seconds)
            bullets[:] = [b for b in bullets if b.is_alive]

            for enemy in enemies: enemy.update(delta_seconds, ship_position)
            enemies[:] = [e for e in enemies if e.is_alive]

            # Collision
            killed_count = sum(1 for e in enemies if not e.is_alive)  # already pruned
            check_bullet_enemy_collisions()
            newly_killed = sum(1 for e in enemies if not e.is_alive)
            current_score += newly_killed * POINTS_PER_SEEKER

            check_ship_enemy_collisions()

        elif current_game_state == GAME_STATE_DEAD:
            # Count down the death pause.
            death_timer -= delta_seconds
            if death_timer <= 0:
                if lives_remaining > 0:
                    respawn_player()
                else:
                    trigger_game_over()

        # GAME_OVER state: do nothing until R is pressed (handled in events).

        # ── Draw ─────────────────────────────────────────────────────────────
        screen.fill(COLOR_BACKGROUND)

        for bullet in bullets: bullet.draw(screen)
        for enemy  in enemies: enemy.draw(screen)

        if current_game_state != GAME_STATE_DEAD or int(death_timer * 10) % 2 == 0:
            draw_ship(screen, ship_position, ship_angle)
            # Ship flashes during death pause (alternates visible/hidden every 100ms)

        draw_hud(screen)

        if current_game_state == GAME_STATE_GAME_OVER:
            draw_overlay(screen, 'GAME OVER', f'Score: {current_score}', 'Press R to restart')

        pygame.display.flip()

run_game()
```

**Ship flashing during death:**

`int(death_timer * 10) % 2 == 0` — `death_timer` counts down from 1.5.
Multiplying by 10 gives 15 → 0 over 1.5 seconds. `% 2` alternates between
0 and 1 every 0.1 seconds. The ship appears every other 0.1-second step —
a classic death flash effect, computed without a separate timer variable.

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**Test death:**
Let a Seeker reach you → ship disappears briefly → respawns at center (or game over).

**Test game over:**
Let Seekers catch you 3 times → GAME OVER overlay → press R → restart.

**Test score:**
Kill several Seekers → score in top-right increments by 10 each.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Enemy touching ship → death | Walk into Seeker — ship flashes |
| Death reduces lives by 1 | Life icon count decreases |
| Death pause then respawn | 1.5s pause; ship reappears at center |
| 3rd death → GAME OVER | Overlay shows score and restart prompt |
| R key restarts | Fresh game, lives = 3, score = 0 |
| Score +10 per Seeker | Kill Seekers — score increments |
| HUD always visible | Score and lives shown during play |
| State machine drives everything | `current_game_state` controls behavior |

---

## What Is Next — LAB 05

LAB 05 adds particle explosions — when a Seeker dies, it bursts into a shower
of small colored fragments that fade and shrink. This is the signature visual
effect of Geometry Wars.

---

*Continue to Geometry Wars — LAB 05 — Particle Explosions.*
