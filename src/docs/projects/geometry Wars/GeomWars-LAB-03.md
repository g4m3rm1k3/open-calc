# Geometry Wars — LAB 03 — The First Enemy

**Read GeomWars-LAB-02.md first.** That lab added shooting. This lab adds
Seekers — simple enemies that spawn at the window edges and chase the ship.
Shoot them before they reach you.

**What this lab adds over LAB-02:**
- `Enemy` base class with position, velocity, health
- `Seeker` enemy — chases the player directly (like Blinky in Pac-Man)
- Spawn system — enemies appear at random edge positions every few seconds
- Bullet-enemy intersection check (collision detection)
- Enemy death — removed from list when health reaches 0

**After this lab you have a real game** — fly, shoot, survive.

---

## How This Connects to Pac-Man and Tetris

**Blinky in Pac-Man** targeted Pac-Man's tile and chose the grid direction that
minimized tile distance. **Seekers in Geometry Wars** target the ship's pixel
position and move in the continuous direction that minimizes pixel distance.

The strategy is identical. The coordinate system is different:

| Pac-Man (tile grid) | Geometry Wars (pixel space) |
|---|---|
| Target = Pac-Man's tile (col, row) | Target = ship's pixel position (x, y) |
| Measure: Manhattan distance | Measure: Euclidean distance (Vector2) |
| Move 1 tile per update at intersections | Move continuously every frame |
| Direction: up/down/left/right (4 choices) | Direction: any angle (infinite choices) |

The chase logic:
```python
# Pac-Man (tile grid):
direction_to_player = (pacman_col - ghost_col, pacman_row - ghost_row)
# pick the valid grid direction closest to this

# Geometry Wars (pixel space):
direction_to_player = (ship_position - seeker_position).normalize()
seeker_velocity     = direction_to_player * SEEKER_SPEED
```

In Geometry Wars there are no walls and no grid — the seeker can move in any
direction, so "pick the valid direction closest" simplifies to "go directly."

---

## What You Will Build

When this lab is done:

- Seekers (red diamond shapes) spawn at random window edges every 2 seconds
- They move steadily toward the ship
- Bullets hitting a Seeker destroy it
- Up to 10 Seekers can be alive at once

---

## Concept: Spawning at Window Edges

**Why spawn at edges?** Enemies spawning at the center would appear inside the
player — instant death with no warning. Edges give the player time to react.

**How to pick a random edge spawn point:**

```python
import random

# Pick a random edge: 0=top, 1=bottom, 2=left, 3=right
edge = random.randint(0, 3)

if edge == 0:    # top edge
    x = random.uniform(0, WINDOW_WIDTH)
    y = 0
elif edge == 1:  # bottom edge
    x = random.uniform(0, WINDOW_WIDTH)
    y = WINDOW_HEIGHT
elif edge == 2:  # left edge
    x = 0
    y = random.uniform(0, WINDOW_HEIGHT)
else:            # right edge
    x = WINDOW_WIDTH
    y = random.uniform(0, WINDOW_HEIGHT)

spawn_position = pygame.math.Vector2(x, y)
```

`random.uniform(a, b)` returns a float between `a` and `b` — like
`Math.random() * (b - a) + a` in JavaScript.

`random.randint(a, b)` returns an integer from `a` to `b` inclusive — both
endpoints included. This differs from JavaScript's `Math.floor(Math.random() * n)`
which excludes the upper end.

---

## Concept: Drawing a Diamond

Seekers are drawn as diamond shapes — a square rotated 45 degrees. A diamond
is a polygon with 4 points: top, right, bottom, left.

```python
# Diamond points (local space, centered at origin):
# Size 10 means 10 pixels from center to each tip.
SIZE = 10
top    = pygame.math.Vector2( 0, -SIZE)
right  = pygame.math.Vector2( SIZE,  0)
bottom = pygame.math.Vector2( 0,  SIZE)
left   = pygame.math.Vector2(-SIZE,  0)
```

To rotate the diamond so it faces the player (like the ship faces the mouse),
rotate each point by the seeker's heading angle before drawing.

---

## Step 1 — Add Enemy Constants and the Seeker Class

Add to `main.py` below the bullet constants:

```python
# ── Enemy constants ────────────────────────────────────────────────────────────

SEEKER_SPEED       = 120     # pixels per second (slow and menacing)
SEEKER_HEALTH      = 1       # hits to kill (Seekers die in one shot)
SEEKER_RADIUS      = 10      # collision radius
SEEKER_SIZE        = 10      # visual size — tip-to-center distance

MAX_ENEMY_COUNT    = 10      # cap on simultaneous enemies
SPAWN_INTERVAL     = 2.0     # seconds between enemy spawns

COLOR_SEEKER       = (220,  50,  50)   # red
COLOR_SEEKER_INNER = (255, 130, 130)   # lighter red for inner diamond

# ── Enemy classes ──────────────────────────────────────────────────────────────

class Seeker:
    """
    A Seeker chases the player's ship directly, moving at constant speed
    in the direction from itself to the ship every frame.

    This is the continuous-space version of Blinky from Pac-Man.
    Instead of choosing a grid direction, it normalizes the vector to the
    target and moves along it.

    Attributes:
        position   (Vector2): world position
        velocity   (Vector2): movement per second (recomputed each frame)
        health     (int):     hits remaining before death
        is_alive   (bool):    False = remove from enemies list
        angle      (float):   current facing angle in radians (for drawing)
    """

    def __init__(self, spawn_position):
        self.position = spawn_position.copy()
        self.velocity = pygame.math.Vector2(0, 0)
        self.health   = SEEKER_HEALTH
        self.is_alive = True
        self.angle    = 0.0     # updated each frame to face the ship

    def update(self, delta_seconds, target_position):
        """
        Recompute velocity toward target_position and move.

        target_position: the ship's current position (Vector2).
        """
        direction = target_position - self.position

        # Only move if not already at the target (avoid zero-length normalize).
        if direction.length() > 0:
            self.velocity = direction.normalize() * SEEKER_SPEED
            # Update angle to face the target — used for rotated diamond drawing.
            self.angle = math.atan2(direction.y, direction.x) + math.pi / 2

        self.position += self.velocity * delta_seconds

    def take_hit(self):
        """
        Reduce health by 1. Mark dead if health reaches 0.
        Returns True if the enemy died from this hit.
        """
        self.health -= 1
        if self.health <= 0:
            self.is_alive = False
            return True  # caller knows to spawn particles, add score, etc.
        return False

    def draw(self, surface):
        """Draw the Seeker as a rotating diamond."""
        # Diamond points in local space.
        local_points = [
            pygame.math.Vector2( 0,          -SEEKER_SIZE),  # top tip
            pygame.math.Vector2( SEEKER_SIZE,  0),           # right tip
            pygame.math.Vector2( 0,            SEEKER_SIZE),  # bottom tip
            pygame.math.Vector2(-SEEKER_SIZE,  0),           # left tip
        ]

        # Rotate each point by self.angle and translate to world position.
        world_points = [
            (self.position + p.rotate_rad(self.angle))
            for p in local_points
        ]

        # Convert Vector2 to (x, y) tuples for pygame.draw.polygon.
        world_tuples = [(int(p.x), int(p.y)) for p in world_points]

        # Draw outer diamond (filled).
        pygame.draw.polygon(surface, COLOR_SEEKER, world_tuples)

        # Draw inner diamond — a smaller version for visual detail.
        inner_scale   = 0.5
        inner_points  = [
            (self.position + p.rotate_rad(self.angle) * inner_scale)
            for p in local_points
        ]
        inner_tuples  = [(int(p.x), int(p.y)) for p in inner_points]
        pygame.draw.polygon(surface, COLOR_SEEKER_INNER, inner_tuples)
```

**List comprehension for point transformation:**

```python
world_points = [(self.position + p.rotate_rad(self.angle)) for p in local_points]
```

This applies the same rotate-then-translate transform to each point in the list.
In JavaScript you did this with a `for` loop in `get_ship_world_points()` — this
is the Python equivalent in one line.

---

## Step 2 — Add Spawn State

Below the bullet state, add:

```python
# ── Enemy state ────────────────────────────────────────────────────────────────

enemies          = []   # all currently active enemies
spawn_timer      = 0.0  # seconds until next enemy spawn
```

Add the spawn function before `run_game()`:

```python
def spawn_seeker():
    """
    Spawns a Seeker at a random position along the window edge.
    Does nothing if the enemy cap is already reached.
    """
    if len(enemies) >= MAX_ENEMY_COUNT:
        return

    # Pick a random edge (0=top, 1=bottom, 2=left, 3=right).
    edge = random.randint(0, 3)

    if edge == 0:
        spawn_x = random.uniform(0, WINDOW_WIDTH)
        spawn_y = 0.0
    elif edge == 1:
        spawn_x = random.uniform(0, WINDOW_WIDTH)
        spawn_y = float(WINDOW_HEIGHT)
    elif edge == 2:
        spawn_x = 0.0
        spawn_y = random.uniform(0, WINDOW_HEIGHT)
    else:
        spawn_x = float(WINDOW_WIDTH)
        spawn_y = random.uniform(0, WINDOW_HEIGHT)

    enemies.append(Seeker(pygame.math.Vector2(spawn_x, spawn_y)))
```

Add `import random` at the top of `main.py` (next to `import math`).

---

## Step 3 — Bullet-Enemy Collision Detection

**Circle-circle collision** — the same pattern used in Pac-Man LAB-04 for
ghost-Pac-Man collision. Two circles collide when the distance between their
centers is less than the sum of their radii.

```
collision if: distance(bullet.position, enemy.position) < bullet_radius + enemy_radius
```

Add before `run_game()`:

```python
def check_bullet_enemy_collisions():
    """
    Checks every bullet against every enemy for circle overlap.
    If a bullet hits an enemy:
      - The bullet is marked dead (removed next frame)
      - The enemy takes a hit (may die)

    This is O(bullets × enemies). For small counts this is fine.
    For hundreds of objects, a spatial grid would be faster (CAD-LAB topic).
    """
    for bullet in bullets:
        if not bullet.is_alive:
            continue  # already dead this frame — skip

        for enemy in enemies:
            if not enemy.is_alive:
                continue

            delta    = bullet.position - enemy.position
            distance = delta.length()  # Euclidean distance between centers

            COLLISION_DISTANCE = BULLET_RADIUS + SEEKER_RADIUS

            if distance < COLLISION_DISTANCE:
                bullet.is_alive = False  # bullet is consumed
                enemy.take_hit()         # enemy takes damage
                break  # one bullet can only hit one enemy
```

**`break` inside a nested loop:**

`break` exits only the innermost loop — the `for enemy in enemies` loop.
The outer `for bullet in bullets` loop continues. This means one bullet can
only hit one enemy per frame, which is correct.

---

## Step 4 — Wire Everything into the Game Loop

Update `run_game()`:

```python
def run_game():
    global ship_position, ship_angle, fire_cooldown, spawn_timer

    while True:
        # ── Events ───────────────────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                raise SystemExit

        # ── Timing ───────────────────────────────────────────────────────────
        delta_ms      = clock.tick(TARGET_FPS)
        delta_seconds = delta_ms / 1000.0

        # ── Update ship (same as LAB-02) ──────────────────────────────────────
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

        # ── Shooting (same as LAB-02) ─────────────────────────────────────────
        fire_cooldown -= delta_seconds
        if pygame.mouse.get_pressed()[0] and fire_cooldown <= 0:
            fire_bullet()
            fire_cooldown = FIRE_RATE_SECONDS

        # ── Spawning ──────────────────────────────────────────────────────────
        spawn_timer -= delta_seconds
        if spawn_timer <= 0:
            spawn_seeker()
            spawn_timer = SPAWN_INTERVAL

        # ── Update bullets ─────────────────────────────────────────────────────
        for bullet in bullets:
            bullet.update(delta_seconds)
        bullets[:] = [b for b in bullets if b.is_alive]

        # ── Update enemies ─────────────────────────────────────────────────────
        for enemy in enemies:
            enemy.update(delta_seconds, ship_position)
        enemies[:] = [e for e in enemies if e.is_alive]

        # ── Collision ──────────────────────────────────────────────────────────
        check_bullet_enemy_collisions()

        # ── Draw ──────────────────────────────────────────────────────────────
        screen.fill(COLOR_BACKGROUND)

        for bullet in bullets:
            bullet.draw(screen)

        for enemy in enemies:
            enemy.draw(screen)

        draw_ship(screen, ship_position, ship_angle)

        pygame.display.flip()
```

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**You should see:**
- Red diamonds spawn at random edges every 2 seconds
- They slide toward your ship steadily
- Clicking fires bullets
- Bullets hitting enemies make them disappear

**Verify collision distance:**
```python
# Temporarily print distances (add to check_bullet_enemy_collisions):
# print(f"dist: {distance:.1f} threshold: {COLLISION_DISTANCE}")
```

**Slow enemies for easy testing:**
Temporarily change `SEEKER_SPEED = 30` — very slow. Shoot them easily.
Change back to `120`.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Seekers spawn at edges | Red diamonds appear at window borders |
| Seekers chase ship | They move toward your position |
| Bullet kills Seeker | Hit a Seeker → it disappears |
| Enemy cap prevents overflow | After 10 enemies, spawning stops until some die |
| Spawn timer works | New enemy every 2 seconds |
| No terminal errors | No red text |

---

## What Is Next — LAB 04

LAB 04 adds the consequence: Seekers that reach the ship kill the player.
You'll add lives, a death state, and game over — the same state machine pattern
as Pac-Man LAB-05.

---

*Continue to Geometry Wars — LAB 04 — Collision and Death.*
