# Geometry Wars — LAB 01 — The Ship Moves (Python/Pygame)

**What this lab builds:** A black window with a small triangle (your ship) in
the center. WASD moves it. The ship points toward the mouse cursor at all times.
You can fly around the entire window immediately.

**Why Geometry Wars:** After Pac-Man (tile grid, fixed corridors) and Tetris
(falling pieces on a grid), Geometry Wars introduces free vector movement —
no tiles, no corridors, any angle. It is the natural next step.

**Prerequisite:** Python installed. Run `pip install pygame` in your terminal.

**Time:** 45–60 minutes.

---

## How This Lab Connects to JavaScript

| JavaScript (Pac-Man LAB-01) | Python/Pygame (this lab) |
|---|---|
| `canvas.getContext('2d')` | `pygame.display.set_mode()` |
| `requestAnimationFrame(gameLoop)` | `clock.tick(60)` inside a `while` loop |
| `ctx.fillStyle = '#ff0000'` | Color tuple `(255, 0, 0)` |
| `ctx.arc(x, y, r, 0, 2*Math.PI)` | `pygame.draw.circle(screen, color, (x, y), r)` |
| `keysHeld.ArrowLeft` | `pygame.key.get_pressed()[pygame.K_a]` |
| `event.preventDefault()` | `pygame.event.get()` loop |

**The game loop pattern is identical.** In JavaScript: `requestAnimationFrame`
calls your function every frame. In pygame: a `while True` loop calls
`clock.tick(60)` which blocks until the next frame. Both give you 60 frames
per second. Both give you a delta time. The structure is the same.

---

## What You Will Build

Open the Python file. You see:
- A black window (800×600)
- A white triangle (your ship) in the center
- WASD moves it around the window
- The ship rotates to always point at the mouse cursor
- The ship wraps at window edges (same as Pac-Man LAB-01)

---

## Project Setup

Create a folder called `geometry_wars`. Inside it:

```
geometry_wars/
  main.py
```

That is the entire project for LAB-01.

---

## Concept: pygame — The Three Layers

**What pygame is:** A Python library that opens a window, draws to it, and
handles input. It is the Python equivalent of the browser's Canvas API.

**Three things every pygame program needs:**

1. **`pygame.init()`** — starts all pygame systems. Must be the first call.
2. **`pygame.display.set_mode((width, height))`** — creates the window and
   returns a `Surface` — the thing you draw on. This is the pygame equivalent
   of `canvas.getContext('2d')`.
3. **The game loop** — a `while True` loop that handles events, updates state,
   draws, and calls `pygame.display.flip()` to show the frame.

```python
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
clock  = pygame.time.Clock()

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            raise SystemExit

    screen.fill((0, 0, 0))      # clear to black
    pygame.display.flip()        # show the frame
    clock.tick(60)               # wait until 1/60th second has passed
```

**`screen.fill((0, 0, 0))`** — fills the entire window with a color.
Colors in pygame are RGB tuples: `(red, green, blue)` where each value is 0–255.
`(0, 0, 0)` = black. `(255, 255, 0)` = yellow. `(255, 0, 0)` = red.

This is the pygame equivalent of:
```js
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

**`pygame.display.flip()`** — shows everything drawn this frame. Without it,
your drawing never appears on screen. In JavaScript this is automatic — the
browser shows the canvas at the end of each animation frame. In pygame you
must call `flip()` explicitly.

**`clock.tick(60)`** — sleeps until 60 frames per second is maintained.
Returns the number of milliseconds since the last call — that is your delta time.

**Watch for:** Unlike JavaScript, which runs in a browser tab and cannot crash
the tab, Python can crash the terminal. Always handle `pygame.QUIT` (clicking
the X button) or the window becomes unresponsive.

---

## Concept: Colors in Pygame

**In JavaScript:** CSS color strings — `'#ff0000'`, `'rgb(255, 0, 0)'`, `'red'`

**In pygame:** RGB tuples — `(255, 0, 0)`

Both represent the same concept: three channels (red, green, blue), each 0–255.
The syntax differs, the idea is identical.

Common colors used in Geometry Wars:

```python
COLOR_BACKGROUND = (0,   0,   10)   # very dark blue-black
COLOR_SHIP       = (200, 220, 255)  # pale blue-white
COLOR_BULLET     = (255, 255, 100)  # bright yellow
COLOR_ENEMY      = (255, 50,  50)   # red
COLOR_UI         = (180, 180, 200)  # dim white for text
```

**Why not name them `RED`, `BLUE`, etc.?** Because meaningful names like
`COLOR_SHIP` tell you what the color is for, not just what it looks like.
If you decide to change the ship color, you change one constant.

---

## Step 1 — The Window and Game Loop

Create `main.py` and type:

```python
import pygame
import math    # for trigonometry — we use this for ship rotation and aiming

# ── Constants ──────────────────────────────────────────────────────────────────
# All numbers that define the game live here.
# Change WINDOW_WIDTH and everything that depends on it scales.

WINDOW_WIDTH  = 800   # pixels wide
WINDOW_HEIGHT = 600   # pixels tall
TARGET_FPS    = 60    # frames per second

# Colors: RGB tuples (red, green, blue), each 0-255.
COLOR_BACKGROUND = (0,   0,   15)   # near-black with a hint of blue
COLOR_SHIP       = (180, 220, 255)  # pale blue-white for the ship
COLOR_UI_TEXT    = (150, 150, 180)  # dim text for score etc.

# ── Pygame setup ───────────────────────────────────────────────────────────────
pygame.init()

screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption('Geometry Wars')  # window title bar text

clock = pygame.time.Clock()

# ── Game loop ──────────────────────────────────────────────────────────────────

def run_game():
    while True:
        # ── 1. Events ────────────────────────────────────────────────────────
        # pygame.event.get() returns a list of events since the last call.
        # We must call this every frame or the OS thinks the app is frozen.
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                # User clicked the X button. Clean up and exit.
                pygame.quit()
                raise SystemExit

        # ── 2. Update ────────────────────────────────────────────────────────
        # (empty for now — update logic goes here in future steps)

        # ── 3. Draw ──────────────────────────────────────────────────────────
        screen.fill(COLOR_BACKGROUND)    # clear the window
        pygame.display.flip()            # show the drawn frame

        # ── 4. Timing ────────────────────────────────────────────────────────
        # clock.tick(TARGET_FPS) sleeps until the next frame is due.
        # It returns the actual milliseconds elapsed since the last call.
        # This is our delta time — we use it in LAB-05 for time-based movement.
        delta_ms = clock.tick(TARGET_FPS)

run_game()
```

**Why `raise SystemExit` instead of `sys.exit()`?**

`raise SystemExit` is the cleanest way to exit Python from inside a function.
`pygame.quit()` shuts down pygame (releases the display), then `raise SystemExit`
terminates the Python interpreter. Calling `sys.exit()` also works but requires
`import sys`.

---

### SAVE AND TRY — Step 1

Save `main.py`. Open a terminal in your `geometry_wars` folder. Type:
```
python main.py
```

**You should see:** A near-black window titled "Geometry Wars". Closing it with
the X button exits cleanly. No errors in the terminal.

**If you see `ModuleNotFoundError: No module named 'pygame'`:**
Run `pip install pygame` in your terminal first.

---

## Concept: `pygame.math.Vector2` — Position and Movement

**What it is:** A 2D vector — an `(x, y)` pair that supports math operations.

**The problem without it:** Moving at an angle requires trig:
```python
# PAINFUL: manually computing x and y components every time
speed = 3
angle = 0.785  # 45 degrees in radians
new_x = x + math.cos(angle) * speed
new_y = y + math.sin(angle) * speed
```

**With `pygame.math.Vector2`:**
```python
import pygame
velocity = pygame.math.Vector2(3, 0)   # moving right at speed 3
position = pygame.math.Vector2(100, 200)
position += velocity                    # x += 3, y += 0 automatically
```

Vectors support `+`, `-`, `*`, `/` directly. `position += velocity` is
equivalent to `position.x += velocity.x; position.y += velocity.y` but in one line.

**Connection to JavaScript:**
In Pac-Man, you tracked `pacman.pixelX` and `pacman.pixelY` as separate numbers.
In Geometry Wars we use `Vector2` to keep them together — `ship.position.x` and
`ship.position.y`. The concept is the same; the tool is better.

**`Vector2.normalize()`** — returns a version of the vector with length 1.
Used to get a direction without caring about magnitude:
```python
direction = pygame.math.Vector2(3, 4)  # length = 5 (Pythagoras: sqrt(9+16))
unit      = direction.normalize()       # length = 1, same direction
```

Multiplying a unit vector by a speed gives movement at that speed in that direction:
```python
movement = unit * SHIP_SPEED  # correct speed, correct direction
```

---

## Concept: Drawing a Triangle (the Ship)

**What it is:** `pygame.draw.polygon(surface, color, points)` draws a filled
polygon. For the ship, we draw a triangle centered at the ship's position,
rotated to face the mouse.

**The three points of the ship triangle** (in local space, centered at origin):

```
     (0, -12)     ← nose (front)
    /          \
(-8, 8)    (8, 8)  ← left/right wing tips
```

To rotate and position the triangle:
1. Start with the three local points
2. Rotate each point by the ship's angle
3. Add the ship's world position to each rotated point

**Rotating a point by angle θ:**
```
rotated_x = x * cos(θ) - y * sin(θ)
rotated_y = x * sin(θ) + y * cos(θ)
```

`Vector2.rotate_rad(angle)` does this automatically:
```python
local_point = pygame.math.Vector2(0, -12)
rotated     = local_point.rotate_rad(ship_angle)
world_point = rotated + ship_position
```

---

## Step 2 — The Ship

Add to `main.py`, before `run_game()`:

```python
# ── Ship constants ─────────────────────────────────────────────────────────────

SHIP_SPEED        = 4.0   # pixels per frame
SHIP_RADIUS       = 10    # collision radius (used in LAB-04)

# The three vertices of the ship triangle in local space (centered at origin).
# The nose points upward in local space (negative Y = up).
# We rotate this to face the mouse at draw time.
SHIP_NOSE_LOCAL   = pygame.math.Vector2(0,  -14)  # front tip
SHIP_WING_L_LOCAL = pygame.math.Vector2(-9,  10)  # left wing
SHIP_WING_R_LOCAL = pygame.math.Vector2( 9,  10)  # right wing

# ── Ship state ─────────────────────────────────────────────────────────────────

ship_position = pygame.math.Vector2(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2)
ship_angle    = 0.0   # radians — 0 = pointing up (local space)
                       # rotated to face mouse each frame
```

Add these functions before `run_game()`:

```python
def get_ship_world_points(position, angle):
    """
    Returns the three world-space vertices of the ship triangle.
    Takes the local-space template points, rotates them by angle,
    and translates them to world position.

    This is the same pattern as drawing Pac-Man at a rotated angle —
    local shape + rotation + translation = world position.
    """
    nose   = position + SHIP_NOSE_LOCAL.rotate_rad(angle)
    wing_l = position + SHIP_WING_L_LOCAL.rotate_rad(angle)
    wing_r = position + SHIP_WING_R_LOCAL.rotate_rad(angle)

    # pygame.draw.polygon expects a list of (x, y) tuples, not Vector2 objects.
    return [(nose.x, nose.y), (wing_l.x, wing_l.y), (wing_r.x, wing_r.y)]


def draw_ship(surface, position, angle):
    """
    Draws the ship triangle at the given position and rotation angle.
    """
    world_points = get_ship_world_points(position, angle)
    pygame.draw.polygon(surface, COLOR_SHIP, world_points)

    # Draw a faint outline slightly brighter than the fill.
    OUTLINE_COLOR = (220, 240, 255)
    pygame.draw.polygon(surface, OUTLINE_COLOR, world_points, width=1)
    # width=1 draws only the outline (not filled). width=0 (default) fills.
```

**`pygame.draw.polygon(surface, color, points, width=0)` explained:**

- `surface` — what to draw on (almost always `screen`)
- `color` — RGB tuple
- `points` — list of `(x, y)` tuples defining the vertices
- `width` — stroke width; `0` fills the shape, `>0` draws only the outline

**`width=1` for outline explained:**

Calling `pygame.draw.polygon` twice — once filled, once with `width=1` — draws
a solid shape with a distinct border. This is the equivalent of:
```js
ctx.fill();    // fill
ctx.stroke();  // outline
```

---

## Step 3 — WASD Movement and Mouse Aiming

Replace `run_game()` with this updated version:

```python
def run_game():
    global ship_position, ship_angle

    while True:
        # ── Events ───────────────────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                raise SystemExit

        # ── Update ───────────────────────────────────────────────────────────

        # Read which keys are currently held down.
        # pygame.key.get_pressed() returns a sequence indexed by key constant.
        # This is the pygame equivalent of the keysHeld object in Pac-Man.
        keys_held = pygame.key.get_pressed()

        # Build a movement direction vector from held keys.
        # Each key contributes to X or Y movement.
        # Holding W and D simultaneously moves diagonally — handled naturally.
        move_direction = pygame.math.Vector2(0, 0)

        if keys_held[pygame.K_w] or keys_held[pygame.K_UP]:
            move_direction.y -= 1   # up = negative Y (same as canvas)
        if keys_held[pygame.K_s] or keys_held[pygame.K_DOWN]:
            move_direction.y += 1
        if keys_held[pygame.K_a] or keys_held[pygame.K_LEFT]:
            move_direction.x -= 1
        if keys_held[pygame.K_d] or keys_held[pygame.K_RIGHT]:
            move_direction.x += 1

        # Normalize diagonal movement so it isn't faster than axis-aligned.
        # Moving right+up at (1, -1) has length sqrt(2) ≈ 1.41.
        # After normalize: (0.707, -0.707) — length 1. Speed stays consistent.
        if move_direction.length() > 0:
            move_direction = move_direction.normalize()

        ship_position += move_direction * SHIP_SPEED

        # Wrap the ship at window edges (same pattern as Pac-Man LAB-01).
        ship_position.x = ship_position.x % WINDOW_WIDTH
        ship_position.y = ship_position.y % WINDOW_HEIGHT

        # Aim the ship toward the mouse cursor.
        # math.atan2(dy, dx) returns the angle from (ship) to (mouse) in radians.
        # The ship's local-space nose points up (negative Y), so we subtract π/2
        # to align the rotation origin with "up."
        mouse_x, mouse_y = pygame.mouse.get_pos()
        dx = mouse_x - ship_position.x
        dy = mouse_y - ship_position.y
        ship_angle = math.atan2(dy, dx) + math.pi / 2
        # atan2 returns: 0 = right, π/2 = down, π/-π = left, -π/2 = up.
        # Adding π/2 shifts it so 0 = up, matching our local-space nose direction.

        # ── Draw ─────────────────────────────────────────────────────────────
        screen.fill(COLOR_BACKGROUND)
        draw_ship(screen, ship_position, ship_angle)
        pygame.display.flip()

        clock.tick(TARGET_FPS)
```

**`global ship_position, ship_angle` explained:**

In Python, assigning to a variable inside a function creates a local variable
by default. `global` tells Python to use the module-level variables instead.
Without it, `ship_position += ...` would create a new local `ship_position`
and the module-level one would never change.

In JavaScript, you did not need this because variables declared with `let` or
`const` in the outer scope are accessible and mutatable from inner functions
through closure. Python's scoping rules differ.

**`move_direction.length()` explained:**

Returns the Euclidean length of the vector: `sqrt(x² + y²)`. If no keys are
held, `move_direction = (0, 0)` and `length() = 0`. We check `> 0` before
normalizing because `normalize()` on a zero-length vector is undefined (you
cannot make a zero vector have length 1).

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**You should see:** A white triangle in the center of a dark window.

**Test WASD:** The ship moves in the pressed direction.
**Test diagonal:** Hold W + D simultaneously — ship moves diagonally at the same
speed as horizontal or vertical movement.
**Test mouse aim:** Move the mouse around — the ship rotates to point at the cursor.
**Test edge wrap:** Move to the right edge — ship appears on the left.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Window opens at 800×600 | Title bar shows "Geometry Wars" |
| Ship visible at center | White triangle at center of dark window |
| WASD moves ship | All 4 directions respond |
| Diagonal movement is not faster | W+D moves same speed as W alone |
| Ship points at mouse | Rotate mouse around ship — triangle follows |
| Edge wrap works | Ship exits right edge, appears on left |
| No terminal errors | Terminal shows no red text |

---

## What Is Next — LAB 02

LAB 02 adds shooting: clicking the mouse fires a bullet in the direction the
ship is facing. You will learn about lists of active objects — a pattern used
for every moving thing in the game (bullets, enemies, particles).

---

*Continue to Geometry Wars — LAB 02 — Shooting.*
