# Geometry Wars — LAB 07 — The Deforming Grid

**Read GeomWars-LAB-06.md first.** That lab added multiple enemy types. This
lab adds the signature Geometry Wars background: a grid of lines that ripples
and deforms when things explode near it.

**What this lab adds over LAB-06:**
- A 2D grid of points stored as a 2D list (like the Tetris board or Pac-Man maze)
- Spring physics: each point is pulled back to its resting position
- Explosions push nearby grid points outward
- Grid is drawn as blue lines connecting neighboring points

---

## How This Connects to Tetris and Pac-Man

**The grid data structure is the same pattern as the Tetris board and Pac-Man maze.**

| Game | 2D structure | What each cell stores |
|---|---|---|
| Tetris | `board[row][col]` — 2D list of ints | Color index (0–7) |
| Pac-Man | `maze[row][col]` — 2D list of ints | Tile type (0–3) |
| Geometry Wars | `grid[row][col]` — 2D list of objects | Point with position and velocity |

All three use the same access pattern: `grid[row][column]`. All three are
initialized with `[[value] * cols for _ in range(rows)]`. The data stored in
each cell is different; the container pattern is identical.

**New concept — spring physics:**

Each grid point has a "rest position" (where it should be) and a "current
position" (where it is now after being pushed). A virtual spring pulls it back.

```
acceleration = (rest_position - current_position) * SPRING_STIFFNESS
velocity    += acceleration * delta
current_pos += velocity    * delta
velocity    *= DAMPING     # reduce velocity each frame — energy dissipates
```

This is Hooke's Law: `F = -k * displacement`. The force pulling back is
proportional to how far the point has moved from its rest position. It
produces the characteristic elastic "bounce back" ripple.

---

## What You Will Build

When this lab is done:

- A blue/purple grid covers the background of the game
- Explosions push the grid outward in a visible ripple
- The grid slowly returns to its original shape after disturbance
- The game feels like the real Geometry Wars

---

## Concept: Spring Physics

**Hooke's Law for a single point:**

```
displacement  = rest_position - current_position
spring_force  = displacement * STIFFNESS
acceleration  = spring_force  (mass = 1 for simplicity)
velocity     += acceleration * delta_time
position     += velocity     * delta_time
velocity     *= DAMPING      (damping < 1: energy loss, oscillation stops)
```

**With `STIFFNESS = 0.2` and `DAMPING = 0.9`:**
- High stiffness → snaps back quickly (stiff spring)
- Low stiffness → slow return (loose spring)
- Damping near 1.0 → oscillates many times before settling (like a guitar string)
- Damping near 0.8 → settles quickly (like a suspension system)

**No spring between grid points?** This version only uses springs to the rest
position. A more complex version springs neighboring points to each other, which
creates waves that propagate across the grid. We keep it simple: each point only
knows its own rest position.

---

## Step 1 — Add the Grid

Add below the particle constants:

```python
# ── Grid constants ─────────────────────────────────────────────────────────────

GRID_SPACING       = 40     # pixels between grid lines at rest
GRID_STIFFNESS     = 0.18   # spring force coefficient (how quickly it snaps back)
GRID_DAMPING       = 0.88   # velocity multiplier per frame (< 1 = energy loss)
GRID_EXPLOSION_FORCE = 3000  # force applied to grid points during explosions

# Number of grid lines in each direction (derived from window size + spacing).
GRID_COLS = WINDOW_WIDTH  // GRID_SPACING + 2  # +2 for edge coverage
GRID_ROWS = WINDOW_HEIGHT // GRID_SPACING + 2

COLOR_GRID = (20, 20, 80)  # dark blue — visible but not distracting

# ── Grid data structure ─────────────────────────────────────────────────────────

class GridPoint:
    """
    A single intersection point in the background grid.

    rest_position:    the original pixel position of this point (never changes)
    position:         current pixel position (changes with spring physics)
    velocity:         current velocity (changes each frame)
    """
    __slots__ = ['rest_x', 'rest_y', 'x', 'y', 'vx', 'vy']
    # __slots__ is a Python optimization: tells Python the exact attributes this
    # class will have. Reduces memory per instance from ~120 bytes to ~56 bytes.
    # Important when you have hundreds of GridPoint objects.

    def __init__(self, rest_x, rest_y):
        self.rest_x = rest_x   # resting X position
        self.rest_y = rest_y   # resting Y position
        self.x      = rest_x   # current X position
        self.y      = rest_y   # current Y position
        self.vx     = 0.0      # current X velocity
        self.vy     = 0.0      # current Y velocity


def create_grid():
    """
    Creates the GRID_ROWS × GRID_COLS grid of GridPoint objects.
    Same initialization pattern as createBoard() in Tetris:
    grid[row][column] — 2D list of objects.
    """
    grid = []
    for row in range(GRID_ROWS):
        grid_row = []
        for col in range(GRID_COLS):
            rest_x = col * GRID_SPACING
            rest_y = row * GRID_SPACING
            grid_row.append(GridPoint(rest_x, rest_y))
        grid.append(grid_row)
    return grid

grid = create_grid()
```

**`__slots__` explained:**

By default, each Python object stores its attributes in a dictionary
(`__dict__`). Dictionaries have overhead. `__slots__` declares the attribute
names at the class level — Python stores them in a fixed-size array instead.
For a class with hundreds of instances (`GridPoint` × 400+ points), this saves
significant memory. You cannot add attributes not listed in `__slots__`.

---

## Step 2 — Update and Draw the Grid

Add before `run_game()`:

```python
def update_grid(delta_seconds):
    """
    Applies spring physics to every grid point each frame.
    Each point is pulled toward its rest position (Hooke's Law).
    Velocity is damped to prevent infinite oscillation.
    """
    for row in grid:
        for point in row:
            # Spring force: proportional to displacement from rest.
            force_x = (point.rest_x - point.x) * GRID_STIFFNESS
            force_y = (point.rest_y - point.y) * GRID_STIFFNESS

            # Apply force to velocity (F = ma, mass = 1 → a = F).
            point.vx += force_x
            point.vy += force_y

            # Move point by velocity.
            point.x += point.vx * delta_seconds
            point.y += point.vy * delta_seconds

            # Dampen velocity — simulates energy loss (friction).
            point.vx *= GRID_DAMPING
            point.vy *= GRID_DAMPING


def apply_explosion_to_grid(explosion_x, explosion_y, force_radius=150):
    """
    Pushes grid points outward from an explosion position.
    Called whenever an enemy or player explodes.

    Points within force_radius pixels of the explosion center are pushed
    away with force proportional to proximity (closer = stronger push).
    """
    for row in grid:
        for point in row:
            dx   = point.x - explosion_x
            dy   = point.y - explosion_y
            dist = math.sqrt(dx * dx + dy * dy)

            if dist < force_radius and dist > 0:
                # Force inversely proportional to distance: closer = stronger.
                # Divide by dist to normalize direction, divide again for falloff.
                force_magnitude = GRID_EXPLOSION_FORCE / (dist * dist + 1)
                                   # +1 prevents division by zero at dist ≈ 0

                point.vx += (dx / dist) * force_magnitude
                point.vy += (dy / dist) * force_magnitude


def draw_grid(surface):
    """
    Draws the grid as horizontal and vertical lines connecting neighboring points.
    Each line connects two adjacent GridPoint positions (which may be displaced).
    """
    # Horizontal lines: connect points along each row.
    for row_index, row in enumerate(grid):
        for col_index in range(len(row) - 1):
            point_a = row[col_index]
            point_b = row[col_index + 1]
            pygame.draw.line(
                surface,
                COLOR_GRID,
                (int(point_a.x), int(point_a.y)),
                (int(point_b.x), int(point_b.y)),
                1   # line width = 1 pixel
            )

    # Vertical lines: connect points between rows at the same column.
    for row_index in range(len(grid) - 1):
        for col_index in range(len(grid[0])):
            point_a = grid[row_index    ][col_index]
            point_b = grid[row_index + 1][col_index]
            pygame.draw.line(
                surface,
                COLOR_GRID,
                (int(point_a.x), int(point_a.y)),
                (int(point_b.x), int(point_b.y)),
                1
            )
```

---

## Step 3 — Wire Grid into the Game Loop

In `run_game()`, add grid update inside the `PLAYING` block (after particle update):

```python
update_grid(delta_seconds)
```

Update the draw section — grid is drawn before everything else (it is the background):

```python
screen.fill(COLOR_BACKGROUND)
draw_grid(screen)           # ← draw grid first (background layer)
for particle in particles: particle.draw(screen)
for bullet   in bullets:   bullet.draw(screen)
for enemy    in enemies:   enemy.draw(screen)
if current_game_state != GAME_STATE_DEAD or int(death_timer * 10) % 2 == 0:
    draw_ship(screen, ship_position, ship_angle)
draw_hud(screen)
```

Now trigger grid explosions in `spawn_explosion`:

```python
def spawn_explosion(position, color):
    """Now also disturbs the grid."""
    for _ in range(PARTICLE_SPAWN_COUNT):
        angle    = random.uniform(0, math.tau)
        speed    = random.uniform(PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX)
        velocity = pygame.math.Vector2(math.cos(angle) * speed, math.sin(angle) * speed)
        particles.append(Particle(position, velocity, color))

    # Push nearby grid points outward.
    apply_explosion_to_grid(position.x, position.y)
```

Also add grid reset in `restart_game()`:

```python
def restart_game():
    global grid
    # ... existing reset code ...
    grid = create_grid()   # fresh undisturbed grid
```

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**You should see:**
- Dark blue grid lines covering the background
- Killing an enemy → the grid ripples outward from the explosion point
- The grid slowly returns to its original shape
- Player death → large grid disturbance from the ship position

**Tweak spring constants:**
```python
GRID_STIFFNESS = 0.4   # snaps back very quickly — tight spring
GRID_STIFFNESS = 0.05  # very slow return — loose jelly
GRID_DAMPING   = 0.98  # oscillates for a long time (underdamped)
GRID_DAMPING   = 0.70  # returns quickly without oscillating (overdamped)
```

**Test grid array structure:**
Grid is a 2D list — same as `board` in Tetris:
```python
# Add temporarily (will cause terminal output):
print(len(grid), len(grid[0]))   # rows × columns
print(grid[0][0].x, grid[0][0].y)  # top-left point position
```

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Grid visible on background | Blue lines covering dark background |
| Grid ripples on explosion | Kill enemy → visible wave outward |
| Grid returns to original shape | Wait after explosion — grid settles |
| Damping prevents infinite oscillation | Grid stops after a few seconds |
| Player death distorts grid | Ship death → large ripple |
| Gameplay unaffected by grid | All LAB-06 features still work |
| Grid resets on restart | Fresh game → undistorted grid |

---

## What Is Next — LAB 08

LAB 08 adds the score multiplier (chain kills for bonus points), power-ups
(speed boost, shield), and screen shake on player death — the final gameplay
systems before the polish lab.

---

*Continue to Geometry Wars — LAB 08 — Multiplier, Power-ups, and Screen Shake.*
