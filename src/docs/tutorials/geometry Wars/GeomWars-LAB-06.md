# Geometry Wars — LAB 06 — More Enemy Types

**Read GeomWars-LAB-05.md first.** That lab added particle explosions. This lab
adds two more enemy types with completely different movement patterns.

**What this lab adds over LAB-05:**
- `Wanderer` — moves in smooth curves, ignores the player (unpredictable)
- `Splitter` — chases like a Seeker but splits into two Minis on death
- `Mini` — a small fast Seeker spawned by Splitter death
- Mixed spawning — level progression determines which enemies appear

---

## How This Connects to Pac-Man

**Ghost personalities in Pac-Man:** Blinky (direct chase), Pinky (ahead of player),
Inky (erratic), Clyde (retreat when close). Each ghost used the same movement
system but with a different **target tile**. The behavior emerged from the target.

**Enemy types in Geometry Wars:** Seekers (direct chase), Wanderers (no target —
random steering), Splitters (chase then split). Each uses the same position-velocity
update system but with a different **velocity update rule**.

The architectural lesson: **vary the strategy, not the structure.** The game loop
does not need to know what type of enemy it is updating — it just calls
`enemy.update()`. The enemy decides its own behavior internally.

This is **polymorphism** — different classes with the same interface.

---

## Concept: Polymorphism in Python

**What it is:** Multiple classes that share the same method names so that
code calling them does not need to know which specific type it is dealing with.

```python
# All three classes have update() and draw() methods.
class Seeker:
    def update(self, delta, target): ...
    def draw(self, surface): ...

class Wanderer:
    def update(self, delta, target): ...  # target ignored — it wanders
    def draw(self, surface): ...

class Splitter:
    def update(self, delta, target): ...
    def draw(self, surface): ...

# The game loop does not care which type:
for enemy in enemies:
    enemy.update(delta_seconds, ship_position)  # works for all three
    enemy.draw(screen)
```

**Connection to JavaScript:** In Pac-Man, you could have done the same with:
```js
ghosts.forEach(g => updateGhost(g, getGhostTargetTile(g, blinky)));
```
Each ghost's `personality` determined the target. Python classes make the
strategy explicit — each class contains its own behavior.

---

## What You Will Build

When this lab is done:

- Yellow hexagons (Wanderers) drift around the screen in curves, ignoring you
- Green diamonds (Splitters) chase you; killing one spawns two Mini Seekers
- Small pink triangles (Minis) are fast and aggressive
- The spawn system randomly picks enemy types

---

## Step 1 — The Wanderer

**Wanderer movement:** Each frame, slightly rotate the velocity direction by a
small random angle. This creates a smooth curving path with no particular target.

```
current_direction = velocity.normalize()
small_rotation    = random.uniform(-MAX_TURN_RATE, MAX_TURN_RATE)
new_direction     = current_direction.rotate_rad(small_rotation)
velocity          = new_direction * WANDERER_SPEED
```

Add below the `Seeker` class:

```python
# ── Wanderer ───────────────────────────────────────────────────────────────────

WANDERER_SPEED     = 80     # pixels per second — slower than Seeker
WANDERER_RADIUS    = 12     # collision radius
WANDERER_HEALTH    = 1
WANDERER_TURN_RATE = 0.05   # max radians to turn per frame — controls curve tightness

COLOR_WANDERER       = (200, 200,  50)  # yellow
COLOR_WANDERER_INNER = (255, 255, 120)  # bright yellow center

class Wanderer:
    """
    A Wanderer drifts in smooth curves, ignoring the player.
    It is dangerous because its path is unpredictable.

    Movement: each frame, slightly randomize the heading direction.
    Drawing: a spinning regular hexagon.
    """

    def __init__(self, spawn_position):
        self.position  = spawn_position.copy()
        self.health    = WANDERER_HEALTH
        self.is_alive  = True
        self.rotation  = 0.0   # current rotation of the hexagon shape (radians)

        # Start with a random velocity direction.
        start_angle = random.uniform(0, math.tau)
        self.velocity = pygame.math.Vector2(
            math.cos(start_angle) * WANDERER_SPEED,
            math.sin(start_angle) * WANDERER_SPEED,
        )

    def update(self, delta_seconds, target_position):
        """
        target_position is passed for interface compatibility but ignored.
        The Wanderer steers randomly, not toward any target.
        """
        # Turn by a small random angle.
        turn = random.uniform(-WANDERER_TURN_RATE, WANDERER_TURN_RATE)
        self.velocity = self.velocity.rotate_rad(turn)

        # Ensure speed stays constant despite floating point drift.
        # (Repeated rotation can slowly change length due to rounding.)
        if self.velocity.length() > 0:
            self.velocity = self.velocity.normalize() * WANDERER_SPEED

        self.position += self.velocity * delta_seconds
        self.rotation += delta_seconds  # spin the shape continuously

        # Bounce off window edges instead of wrapping.
        if self.position.x < 0 or self.position.x > WINDOW_WIDTH:
            self.velocity.x *= -1
        if self.position.y < 0 or self.position.y > WINDOW_HEIGHT:
            self.velocity.y *= -1

    def take_hit(self):
        self.health -= 1
        if self.health <= 0:
            self.is_alive = False
            return True
        return False

    def draw(self, surface):
        """Draw as a regular hexagon that spins over time."""
        NUM_SIDES = 6
        OUTER_RADIUS = WANDERER_RADIUS
        INNER_RADIUS = WANDERER_RADIUS * 0.55

        def hexagon_points(radius, rotation_offset=0):
            """Returns (x, y) tuples for a regular hexagon."""
            points = []
            for i in range(NUM_SIDES):
                angle = (math.tau / NUM_SIDES) * i + self.rotation + rotation_offset
                x     = self.position.x + math.cos(angle) * radius
                y     = self.position.y + math.sin(angle) * radius
                points.append((int(x), int(y)))
            return points

        pygame.draw.polygon(surface, COLOR_WANDERER,       hexagon_points(OUTER_RADIUS))
        pygame.draw.polygon(surface, COLOR_WANDERER_INNER, hexagon_points(INNER_RADIUS, math.pi / NUM_SIDES))
```

**`Vector2.rotate_rad(angle)` on velocity — normalizing after rotation:**

Repeated floating-point rotation introduces tiny errors that accumulate over
many frames — the vector's length slowly drifts. `normalize() * WANDERER_SPEED`
corrects the length to exactly `WANDERER_SPEED` every frame. This is a common
technique in game programming called **re-normalization**.

---

### SAVE AND TRY — Step 1

Add Wanderers to the `spawn_seeker` function temporarily to test:

```python
# Temporarily replace spawn_seeker body:
def spawn_seeker():
    if len(enemies) >= MAX_ENEMY_COUNT: return
    # ... (edge position code) ...
    enemies.append(Wanderer(pygame.math.Vector2(spawn_x, spawn_y)))
```

Save. Run. **Expected:** Yellow hexagons drift in curves, bounce off walls.
Shooting them kills them (explosion spawns).
Restore to Seeker spawning after testing.

---

## Step 2 — The Splitter and Mini

Add below the `Wanderer` class:

```python
# ── Splitter and Mini ─────────────────────────────────────────────────────────

SPLITTER_SPEED  = 90     # slower than Seeker — gives warning time
SPLITTER_RADIUS = 14     # larger than Seeker
SPLITTER_HEALTH = 2      # takes 2 hits to kill (first hit splits it, or both at once)

MINI_SPEED      = 180    # faster than parent — dangerous
MINI_RADIUS     = 7      # small
MINI_HEALTH     = 1

COLOR_SPLITTER  = (50,  220,  80)   # green
COLOR_MINI      = (200,  80, 200)   # pink-purple

class Mini(Seeker):
    """
    A small, fast Seeker spawned when a Splitter dies.
    Inherits all Seeker behavior — just different constants.

    Python inheritance: Mini IS-A Seeker with overridden constants.
    We override __init__ to use different radius/health values.
    """

    def __init__(self, spawn_position):
        # Call the parent Seeker's __init__ to set up shared attributes.
        super().__init__(spawn_position)
        self.health = MINI_HEALTH

    def draw(self, surface):
        """Draw as a small filled triangle pointing toward velocity direction."""
        if self.velocity.length() > 0:
            self.angle = math.atan2(self.velocity.y, self.velocity.x) + math.pi / 2

        local_points = [
            pygame.math.Vector2( 0,     -MINI_RADIUS),
            pygame.math.Vector2(-MINI_RADIUS * 0.8,  MINI_RADIUS * 0.8),
            pygame.math.Vector2( MINI_RADIUS * 0.8,  MINI_RADIUS * 0.8),
        ]
        world_tuples = [(int((self.position + p.rotate_rad(self.angle)).x),
                         int((self.position + p.rotate_rad(self.angle)).y))
                        for p in local_points]
        pygame.draw.polygon(surface, COLOR_MINI, world_tuples)


class Splitter:
    """
    A Splitter chases the player like a Seeker.
    When killed, it spawns two Mini Seekers at its position.

    The split is handled by the collision system (in take_hit), which
    appends Minis to the enemies list when is_alive becomes False.
    """

    def __init__(self, spawn_position):
        self.position  = spawn_position.copy()
        self.velocity  = pygame.math.Vector2(0, 0)
        self.health    = SPLITTER_HEALTH
        self.is_alive  = True
        self.angle     = 0.0
        self.did_split = False  # True after spawning minis (prevent double-split)

    def update(self, delta_seconds, target_position):
        """Same chase logic as Seeker."""
        direction = target_position - self.position
        if direction.length() > 0:
            self.velocity = direction.normalize() * SPLITTER_SPEED
            self.angle    = math.atan2(direction.y, direction.x) + math.pi / 2
        self.position += self.velocity * delta_seconds

    def take_hit(self):
        self.health -= 1
        if self.health <= 0:
            self.is_alive = False
            return True
        return False

    def draw(self, surface):
        """Draw as a larger diamond with a green interior stripe."""
        SIZE = SPLITTER_RADIUS
        local_points = [
            pygame.math.Vector2( 0,    -SIZE),
            pygame.math.Vector2( SIZE,  0),
            pygame.math.Vector2( 0,     SIZE),
            pygame.math.Vector2(-SIZE,  0),
        ]
        world_tuples = [
            (int((self.position + p.rotate_rad(self.angle)).x),
             int((self.position + p.rotate_rad(self.angle)).y))
            for p in local_points
        ]
        pygame.draw.polygon(surface, COLOR_SPLITTER, world_tuples)

        # Inner cross pattern — drawn as two lines.
        cx, cy = int(self.position.x), int(self.position.y)
        pygame.draw.line(surface, (150, 255, 150), (cx, cy - SIZE // 2), (cx, cy + SIZE // 2), 2)
        pygame.draw.line(surface, (150, 255, 150), (cx - SIZE // 2, cy), (cx + SIZE // 2, cy), 2)
```

**`super().__init__(spawn_position)` explained:**

`super()` refers to the parent class (`Seeker`). `super().__init__(...)` calls
the parent's constructor. This sets up `self.position`, `self.velocity`,
`self.health`, etc. — everything Seeker's `__init__` creates. Then `Mini.__init__`
overrides `self.health` with the Mini-specific value. Without calling `super().__init__`,
the inherited attributes would not exist.

---

## Step 3 — Split on Death

Update `check_bullet_enemy_collisions` to spawn Minis when a Splitter dies:

```python
if died:
    spawn_explosion(enemy.position, COLOR_SEEKER)  # Seeker: red
    # Splitters spawn minis on death.
    if isinstance(enemy, Splitter) and not enemy.did_split:
        enemy.did_split = True
        # Spawn two Minis slightly offset from the death position.
        offset = pygame.math.Vector2(MINI_RADIUS * 2, 0)
        enemies.append(Mini(enemy.position + offset))
        enemies.append(Mini(enemy.position - offset))
        spawn_explosion(enemy.position, COLOR_SPLITTER)  # extra green explosion
    current_score += POINTS_PER_SEEKER
    break
```

**`isinstance(object, Class)` explained:**

Returns `True` if `object` is an instance of `Class` (or a subclass).
`isinstance(enemy, Splitter)` is `True` only for Splitter objects, not Seekers
or Wanderers. Used here to apply split behavior specifically to Splitters.

---

## Step 4 — Mixed Spawning

Replace `spawn_seeker()` with a spawner that picks enemy type randomly:

```python
def spawn_random_enemy():
    """
    Spawns a random enemy type based on current score.
    Early game: mostly Seekers.
    Mid game: Wanderers introduced.
    Later: Splitters appear.

    This is the same pattern as Pac-Man's ghost exit thresholds —
    enemy variety increases as the game progresses.
    """
    if len(enemies) >= MAX_ENEMY_COUNT:
        return

    edge = random.randint(0, 3)
    if edge == 0:   spawn_pos = pygame.math.Vector2(random.uniform(0, WINDOW_WIDTH), 0.0)
    elif edge == 1: spawn_pos = pygame.math.Vector2(random.uniform(0, WINDOW_WIDTH), float(WINDOW_HEIGHT))
    elif edge == 2: spawn_pos = pygame.math.Vector2(0.0, random.uniform(0, WINDOW_HEIGHT))
    else:           spawn_pos = pygame.math.Vector2(float(WINDOW_WIDTH), random.uniform(0, WINDOW_HEIGHT))

    # Determine enemy mix based on score.
    if current_score < 100:
        # Early: Seekers only.
        enemies.append(Seeker(spawn_pos))
    elif current_score < 300:
        # Mid: Seekers and Wanderers.
        enemy_class = random.choice([Seeker, Seeker, Wanderer])
        enemies.append(enemy_class(spawn_pos))
    else:
        # Late: all three types.
        enemy_class = random.choice([Seeker, Wanderer, Splitter])
        enemies.append(enemy_class(spawn_pos))
```

Update the spawn call in `run_game()`:
```python
# Change: spawn_seeker()
# To:
spawn_random_enemy()
```

Also update `check_bullet_enemy_collisions` to use the correct radius for each
enemy type. Replace the hardcoded `SEEKER_RADIUS` with a radius lookup:

```python
enemy_radius = SEEKER_RADIUS  # default
if isinstance(enemy, Wanderer):  enemy_radius = WANDERER_RADIUS
elif isinstance(enemy, Splitter): enemy_radius = SPLITTER_RADIUS
elif isinstance(enemy, Mini):     enemy_radius = MINI_RADIUS

if distance < BULLET_RADIUS + enemy_radius:
```

---

### SAVE AND TRY — Final

Save. Run. Play until score > 300.

**Early game:** Only red Seekers chase you.
**Mid game:** Yellow Wanderers drift around; Seekers still chase.
**Late game:** Green Splitters appear. Killing one → two pink Minis sprint out.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Wanderers drift in curves | Yellow hexagons curve around, ignore player |
| Wanderers bounce off walls | They do not wrap — they reverse at edges |
| Splitters chase player | Green diamonds move toward ship |
| Splitter death → two Minis | Kill green diamond → two fast pink triangles appear |
| Minis chase player | Pink triangles aggressively pursue ship |
| Enemy mix scales with score | Early = Seekers only; late = all types |
| Polymorphism — same loop | `for enemy in enemies: enemy.update(dt, pos)` handles all types |
| Particles for all types | Each enemy type spawns explosion on death |

---

## What Is Next — LAB 07

LAB 07 adds the signature Geometry Wars background: a grid of lines that deforms
when explosions and enemies push against it. This requires a 2D grid of points
and spring physics.

---

*Continue to Geometry Wars — LAB 07 — The Deforming Grid.*
