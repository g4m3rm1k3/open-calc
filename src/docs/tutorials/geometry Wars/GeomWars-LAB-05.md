# Geometry Wars — LAB 05 — Particle Explosions

**Read GeomWars-LAB-04.md first.** That lab added lives and game states. This
lab adds the signature visual of Geometry Wars: when an enemy dies, it explodes
into a shower of colored fragments that fly outward, shrink, and fade.

**What this lab adds over LAB-04:**
- `Particle` class — a short-lived dot with velocity, size, and lifetime
- `spawn_explosion(position, color)` — creates 20–30 particles at a point
- Particles list — same entity list pattern as bullets and enemies
- Alpha fading — particles fade to transparent as they age
- `check_bullet_enemy_collisions` updated to spawn explosion on kill

---

## How This Connects to Previous Labs

**The particle system is the entity list pattern again:**

```python
# Bullets:    bullets.append(Bullet(...))     → for b in bullets: b.update()
# Enemies:    enemies.append(Seeker(...))     → for e in enemies: e.update()
# Particles:  particles.append(Particle(...)) → for p in particles: p.update()
```

You've written this loop three times now. The container, the object type, and
the update logic differ — the structure is identical. This is one of the most
important patterns in game programming: **any dynamic object becomes an entry
in a list.**

**There is no JavaScript equivalent in our Pac-Man series** — Pac-Man had no
particle effects. But if you went back and added death particles to Pac-Man,
the structure would be exactly the same: a `particles` array, an `updateParticles()`
function, `particles = particles.filter(p => p.isAlive)`.

---

## What You Will Build

When this lab is done:

- Destroying a Seeker spawns a burst of red-orange particles
- Particles fly outward, slow down slightly, shrink, and fade over ~0.8 seconds
- The ship exploding (player death) spawns a burst of blue-white particles
- The screen looks significantly more alive

---

## Concept: Fading with `pygame.SRCALPHA`

**The problem:** Drawing a circle with decreasing `alpha` over time creates a
fade effect. But `pygame.draw.circle` does not accept an alpha parameter directly.

**The solution — draw to a temporary Surface with alpha, then blit it:**

```python
temp_surface = pygame.Surface((diameter, diameter), pygame.SRCALPHA)
alpha        = int(255 * (1.0 - age_fraction))   # 255 = opaque, 0 = transparent
color_with_alpha = (r, g, b, alpha)
pygame.draw.circle(temp_surface, color_with_alpha, (radius, radius), radius)
screen.blit(temp_surface, (center_x - radius, center_y - radius))
```

**Why this works:** The `temp_surface` has per-pixel alpha (`SRCALPHA`). Drawing
to it preserves the alpha value of the color. Blitting it to `screen` applies
the transparency.

**Performance note:** Creating a new Surface every frame for every particle is
expensive. For small particle counts (50–100) it is acceptable. For hundreds,
use a cached surface or `pygame.Surface.set_alpha()` instead. For this game,
the per-particle approach is fine.

**Alternative — simpler but no fade:**

Skip alpha entirely, just shrink the radius to 0. When radius reaches 0, particle
is dead. Shrinking to nothing is visually similar to fading. We do both.

---

## Step 1 — Add the Particle Class

Add to `main.py` below the `Seeker` class:

```python
# ── Particle constants ─────────────────────────────────────────────────────────

PARTICLE_LIFETIME    = 0.8    # seconds a particle lives
PARTICLE_SPAWN_COUNT = 24     # particles per explosion
PARTICLE_SPEED_MIN   = 60     # minimum initial speed in pixels/second
PARTICLE_SPEED_MAX   = 200    # maximum initial speed in pixels/second
PARTICLE_SIZE_START  = 5      # initial radius in pixels
PARTICLE_DRAG        = 0.92   # velocity multiplier per frame (< 1 = slows down)

# ── Particle class ─────────────────────────────────────────────────────────────

class Particle:
    """
    A short-lived visual fragment spawned when an enemy or the player explodes.

    Particles use the same entity list pattern as bullets and enemies.
    They are not game objects — they cannot collide with anything.
    Their only purpose is visual.

    Attributes:
        position (Vector2): world position
        velocity (Vector2): pixels per second
        color    (tuple):   RGB base color
        age      (float):   seconds alive (0.0 at spawn)
        is_alive (bool):    False when age >= PARTICLE_LIFETIME
    """

    def __init__(self, position, velocity, color):
        self.position = position.copy()
        self.velocity = velocity.copy()
        self.color    = color
        self.age      = 0.0
        self.is_alive = True

    def update(self, delta_seconds):
        """Move, age, apply drag, and mark dead when lifetime expires."""
        self.position += self.velocity * delta_seconds

        # Apply drag — slow the particle down each frame.
        # Multiplying by a number < 1 reduces magnitude each frame.
        # At PARTICLE_DRAG = 0.92 and 60fps:
        # after 1 second: 0.92^60 ≈ 0.007 — nearly stopped. Realistic deceleration.
        self.velocity *= PARTICLE_DRAG

        self.age += delta_seconds
        if self.age >= PARTICLE_LIFETIME:
            self.is_alive = False

    def draw(self, surface):
        """
        Draw the particle as a shrinking, fading circle.
        Size decreases linearly. Alpha decreases linearly.
        """
        # age_fraction: 0.0 at birth → 1.0 at death.
        age_fraction = self.age / PARTICLE_LIFETIME

        # Radius shrinks from PARTICLE_SIZE_START to 0 as age_fraction goes 0→1.
        # max(1, ...) ensures we never try to draw a zero-radius circle.
        current_radius = max(1, int(PARTICLE_SIZE_START * (1.0 - age_fraction)))

        # Alpha fades from 255 (opaque) to 0 (transparent).
        current_alpha  = int(255 * (1.0 - age_fraction))

        if current_alpha <= 0:
            return  # fully transparent — don't bother drawing

        diameter      = current_radius * 2
        temp_surface  = pygame.Surface((diameter, diameter), pygame.SRCALPHA)
        draw_color    = (self.color[0], self.color[1], self.color[2], current_alpha)
        pygame.draw.circle(temp_surface, draw_color, (current_radius, current_radius), current_radius)

        # Blit at the position offset by radius so the circle is centered.
        blit_x = int(self.position.x) - current_radius
        blit_y = int(self.position.y) - current_radius
        surface.blit(temp_surface, (blit_x, blit_y))
```

**Drag multiplication explained:**

```
frame 1: velocity = 200 * 0.92 = 184 px/s
frame 2: velocity = 184 * 0.92 = 169 px/s
frame 3: velocity = 169 * 0.92 = 155 px/s
...
```

Each frame, velocity is reduced by 8%. This is exponential decay — the same
equation as radioactive decay, population decline, and capacitor discharge.
The particle never quite stops (exponential decay never reaches zero), but after
60 frames (1 second) it is moving at less than 1% of its initial speed — effectively stopped.

---

## Step 2 — Add the Particles List and `spawn_explosion`

Add below the enemies list:

```python
# ── Particle state ─────────────────────────────────────────────────────────────

particles = []   # all currently active particles
```

Add the explosion spawner before `run_game()`:

```python
def spawn_explosion(position, color):
    """
    Creates PARTICLE_SPAWN_COUNT particles at the given position.
    Each particle flies in a random direction at a random speed.

    position (Vector2): world position of the explosion center
    color    (tuple):   RGB base color for the particles
    """
    for _ in range(PARTICLE_SPAWN_COUNT):
        # Random direction: any angle 0 → 2π.
        # math.tau = 2 * math.pi (Python 3.6+) — the full circle constant.
        angle = random.uniform(0, math.tau)

        # Random speed between min and max.
        speed = random.uniform(PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX)

        # Convert polar (angle, speed) to Cartesian (vx, vy) velocity.
        # cos(angle) = x component, sin(angle) = y component.
        velocity = pygame.math.Vector2(math.cos(angle) * speed, math.sin(angle) * speed)

        particles.append(Particle(position, velocity, color))
```

**`for _ in range(PARTICLE_SPAWN_COUNT)` explained:**

`_` is the conventional name for a loop variable you do not use. We repeat
the loop body `PARTICLE_SPAWN_COUNT` times but do not need the iteration
number — only the repetition. `_` signals to the reader: "the variable is
intentionally unused."

**Polar to Cartesian:**

A direction angle `θ` and speed `r` describe movement in polar coordinates.
To get Cartesian (x, y) velocity: `vx = cos(θ) * r`, `vy = sin(θ) * r`.

Random angle → unit circle point → scale by speed → velocity vector.
This is how you generate movement in any random direction at a controlled speed.

---

## Step 3 — Wire Explosions into Collision Detection

Update `check_bullet_enemy_collisions` to spawn an explosion when an enemy dies:

```python
def check_bullet_enemy_collisions():
    """Now also spawns particles when an enemy is killed."""
    global current_score

    for bullet in bullets:
        if not bullet.is_alive:
            continue

        for enemy in enemies:
            if not enemy.is_alive:
                continue

            delta    = bullet.position - enemy.position
            distance = delta.length()

            if distance < BULLET_RADIUS + SEEKER_RADIUS:
                bullet.is_alive = False
                died = enemy.take_hit()

                if died:
                    # Spawn explosion at the enemy's death position.
                    spawn_explosion(enemy.position, COLOR_SEEKER)
                    current_score += POINTS_PER_SEEKER

                break
```

Also spawn a blue explosion when the player dies. Update `handle_player_death`:

```python
def handle_player_death():
    global current_game_state, lives_remaining, death_timer

    # Blue-white explosion at the ship's position.
    spawn_explosion(ship_position, (150, 180, 255))

    lives_remaining   -= 1
    current_game_state = GAME_STATE_DEAD
    death_timer        = DEATH_PAUSE_SECONDS
```

---

## Step 4 — Update and Draw Particles in the Game Loop

In `run_game()`, add particle update and pruning inside the `PLAYING` block
(after enemy updates):

```python
# Update particles (happens in all states — explosions continue through death pause).
for particle in particles:
    particle.update(delta_seconds)
particles[:] = [p for p in particles if p.is_alive]
```

In the draw section, draw particles before enemies and ship:

```python
screen.fill(COLOR_BACKGROUND)

# Draw order: particles first (behind everything), then enemies, bullets, ship.
for particle in particles: particle.draw(screen)
for bullet   in bullets:   bullet.draw(screen)
for enemy    in enemies:   enemy.draw(screen)

if current_game_state != GAME_STATE_DEAD or int(death_timer * 10) % 2 == 0:
    draw_ship(screen, ship_position, ship_angle)

draw_hud(screen)
```

Also clear particles in `restart_game()`:
```python
particles.clear()
```

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**You should see:**
- Shooting a Seeker → it bursts into a shower of red-orange dots that fan out,
  slow down, shrink, and fade over about 0.8 seconds
- Walking into a Seeker → blue-white explosion at your ship position

**Count particles:**
```python
# Temporarily add inside the loop (after particles[:] = ...):
# print(f"Particles: {len(particles)}")
```
After one explosion: should print ~24. After 4 explosions: ~96. They fade and
the count returns to 0.

**Test at higher counts:**
Change `PARTICLE_SPAWN_COUNT = 60`. Kill several enemies rapidly. Should still
feel smooth (though the temp Surface per particle becomes noticeable at extremes).
Change back to `24`.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Killing Seeker → particles | Red-orange burst on enemy death |
| Player death → particles | Blue-white burst on ship death |
| Particles fly outward | Fan out from explosion center |
| Particles slow down | Velocity decreases each frame (drag) |
| Particles shrink | Radius decreases over lifetime |
| Particles fade | Alpha decreases over lifetime |
| Particles auto-remove | Count returns to 0 after ~0.8s with no new kills |
| Game still works | Lives, score, states all intact from LAB-04 |

---

## What Is Next — LAB 06

LAB 06 adds two more enemy types with different movement patterns:
- **Wanderer** — moves in a curving, organic path (random steering)
- **Splitter** — splits into two smaller Seekers when killed

---

*Continue to Geometry Wars — LAB 06 — More Enemy Types.*
