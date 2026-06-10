# Geometry Wars — LAB 02 — Shooting

**Read GeomWars-LAB-01.md first.** That lab gave you a moving ship. This lab
adds shooting — clicking fires bullets that travel in the aimed direction.

**What this lab adds over LAB-01:**
- `bullets` list — a collection of all active bullets
- `Bullet` class — position, velocity, lifetime
- Mouse click spawns a bullet
- Bullets travel forward, expire after a set distance, and are removed
- Auto-fire: holding mouse button fires continuously

**After this lab you can fly around and shoot in any direction.**

---

## How This Connects to JavaScript and Pac-Man

**The bullet list pattern is universal.** In Pac-Man you had one `ghosts` array
that you looped with `forEach`. In Tetris you had one `board` array. Here you
have a `bullets` list. The pattern is:

```
On spawn:   list.append(new_object)
Each frame: for each object in list → update it
            remove dead objects from the list
On draw:    for each object in list → draw it
```

This is called the **Entity List pattern**. Every game uses it — for bullets,
enemies, particles, power-ups. The container is different, the objects are
different, but the update-then-prune-then-draw loop is identical.

| JavaScript (Pac-Man) | Python (Geometry Wars) |
|---|---|
| `ghosts.forEach(g => updateGhost(g))` | `for bullet in bullets: bullet.update()` |
| `ghosts.forEach(g => drawGhost(g))` | `for bullet in bullets: bullet.draw(screen)` |
| Filter dead: JS `filter(g => g.isAlive)` | Python: list comprehension `[b for b in bullets if b.is_alive]` |

---

## What You Will Build

When this lab is done:

- Click the mouse → a bullet fires toward the cursor
- Hold mouse → continuous fire
- Bullets travel straight and disappear after 0.5 seconds
- You can fill the screen with bullets and sweep them around with the mouse

---

## Concept: Python Classes

**What they are:** A way to group related data and functions into one reusable
template. Each instance (object) created from the class has its own copy of
the data.

**You already used this pattern in JavaScript** — the `pacman` and `ghost`
objects were plain objects `{ x, y, color }`. Python classes are the same idea,
but with a formal template.

```python
class Bullet:
    def __init__(self, position, velocity):
        # __init__ is the constructor — called when you do Bullet(pos, vel).
        # self refers to this specific bullet instance.
        self.position  = position.copy()  # Vector2 — current pixel position
        self.velocity  = velocity.copy()  # Vector2 — pixels moved per frame
        self.lifetime  = 0.0             # seconds this bullet has existed
        self.is_alive  = True            # False = remove from list next frame

    def update(self, delta_seconds):
        # Move the bullet.
        self.position += self.velocity * delta_seconds

        # Age the bullet — remove it after MAX_LIFETIME seconds.
        self.lifetime += delta_seconds
        if self.lifetime >= BULLET_MAX_LIFETIME:
            self.is_alive = False

    def draw(self, surface):
        # Draw the bullet as a small bright circle.
        pos_tuple = (int(self.position.x), int(self.position.y))
        pygame.draw.circle(surface, COLOR_BULLET, pos_tuple, BULLET_RADIUS)
```

**`self` explained:**

In Python, `self` is the first parameter of every method — it refers to the
instance the method is called on. When you write `bullet.update(delta)`, Python
automatically passes `bullet` as `self`. You must include `self` in the
definition but do not pass it when calling.

**`.copy()` on Vector2:**

`Vector2` is mutable — modifying it changes the original. If you store the
same Vector2 in two places and change one, both change. `.copy()` creates an
independent duplicate. Always `.copy()` when storing a Vector2 from outside the class.

---

## Step 1 — Add Bullet Constants and Class

Add to `main.py`, below the ship constants:

```python
# ── Bullet constants ───────────────────────────────────────────────────────────

BULLET_SPEED        = 600     # pixels per second
                               # NOTE: unlike Pac-Man and Tetris, Geometry Wars
                               # movement is per-SECOND (multiplied by delta time),
                               # not per-FRAME. This makes speed frame-rate independent.
BULLET_RADIUS       = 3       # drawn size in pixels
BULLET_MAX_LIFETIME = 0.6     # seconds before the bullet disappears

COLOR_BULLET        = (255, 240, 80)   # bright yellow

# ── Bullet class ───────────────────────────────────────────────────────────────

class Bullet:
    """
    A single bullet fired by the player.

    Attributes:
        position    (Vector2): current world position in pixels
        velocity    (Vector2): movement per second in pixels
        lifetime    (float):   seconds elapsed since spawn
        is_alive    (bool):    False = remove from bullets list next frame
    """

    def __init__(self, position, velocity):
        self.position  = position.copy()
        self.velocity  = velocity.copy()
        self.lifetime  = 0.0
        self.is_alive  = True

    def update(self, delta_seconds):
        """Move the bullet and age it. Mark dead when lifetime expires."""
        self.position += self.velocity * delta_seconds

        self.lifetime += delta_seconds
        if self.lifetime >= BULLET_MAX_LIFETIME:
            self.is_alive = False

        # Remove bullets that leave the window.
        if (self.position.x < 0 or self.position.x > WINDOW_WIDTH or
                self.position.y < 0 or self.position.y > WINDOW_HEIGHT):
            self.is_alive = False

    def draw(self, surface):
        """Draw this bullet as a small bright circle with a glow."""
        center = (int(self.position.x), int(self.position.y))

        # Outer glow — slightly larger, dimmer circle.
        pygame.draw.circle(surface, (200, 180, 30), center, BULLET_RADIUS + 2)
        # Inner bright core.
        pygame.draw.circle(surface, COLOR_BULLET, center, BULLET_RADIUS)
```

---

## Concept: Delta Time in Python — Per Second vs Per Frame

**In Pac-Man (JavaScript):** `MOVE_SPEED = 3` meant 3 pixels per frame.
This works if you can assume 60fps. At 30fps, Pac-Man would move half as fast.

**In Geometry Wars:** All speeds are per second, multiplied by delta time.

```python
delta_ms      = clock.tick(TARGET_FPS)   # milliseconds since last frame
delta_seconds = delta_ms / 1000.0        # convert to seconds

bullet.position += bullet.velocity * delta_seconds
# If delta_seconds = 0.016 (60fps) and speed = 600:
# movement = 600 * 0.016 = 9.6 pixels this frame ≈ 600 pixels per second ✓
```

**Why this matters:** Geometry Wars enemies and bullets move fast. If you used
per-frame speeds, a frame-rate dip from 60fps to 30fps would make everything
move half speed. Per-second speeds guarantee consistent behavior regardless of
frame rate.

**This is the same delta time concept from Tetris LAB-05** — where the drop
timer accumulated `deltaTime` each frame. Here we apply it to movement directly.

---

## Step 2 — Add the Bullets List and Spawn Logic

Add the bullets list and fire rate state below the ship state:

```python
# ── Bullet state ───────────────────────────────────────────────────────────────

bullets = []   # all currently active bullets

FIRE_RATE_SECONDS = 0.12    # minimum seconds between shots when holding mouse
fire_cooldown     = 0.0     # current cooldown remaining (counts down to 0)
```

Add the `fire_bullet` function before `run_game()`:

```python
def fire_bullet():
    """
    Creates a bullet at the ship's nose position traveling in the ship's
    aimed direction (toward the mouse cursor).

    The bullet velocity is computed by rotating a forward vector by the
    ship's current angle — same math as rotating the ship triangle vertices
    in LAB-01.
    """
    # The nose of the ship in world space (tip of the triangle).
    # We spawn the bullet here so it appears to come from the front.
    nose_offset   = SHIP_NOSE_LOCAL.rotate_rad(ship_angle)
    spawn_position = ship_position + nose_offset

    # The ship points in the direction of ship_angle.
    # A unit vector pointing "up" in local space is (0, -1).
    # Rotating it by ship_angle gives the forward direction in world space.
    forward_direction = pygame.math.Vector2(0, -1).rotate_rad(ship_angle)
    bullet_velocity   = forward_direction * BULLET_SPEED

    bullets.append(Bullet(spawn_position, bullet_velocity))
```

---

## Step 3 — Wire Bullets into the Game Loop

Update `run_game()` to handle bullets:

```python
def run_game():
    global ship_position, ship_angle, fire_cooldown

    while True:
        # ── Events ───────────────────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                raise SystemExit

        # ── Timing ───────────────────────────────────────────────────────────
        delta_ms      = clock.tick(TARGET_FPS)
        delta_seconds = delta_ms / 1000.0

        # ── Update ship ──────────────────────────────────────────────────────
        keys_held = pygame.key.get_pressed()

        move_direction = pygame.math.Vector2(0, 0)
        if keys_held[pygame.K_w] or keys_held[pygame.K_UP]:    move_direction.y -= 1
        if keys_held[pygame.K_s] or keys_held[pygame.K_DOWN]:  move_direction.y += 1
        if keys_held[pygame.K_a] or keys_held[pygame.K_LEFT]:  move_direction.x -= 1
        if keys_held[pygame.K_d] or keys_held[pygame.K_RIGHT]: move_direction.x += 1

        if move_direction.length() > 0:
            move_direction = move_direction.normalize()

        ship_position += move_direction * SHIP_SPEED * delta_seconds
                         # NOTE: now multiplied by delta_seconds — per second, not per frame
        ship_position.x %= WINDOW_WIDTH
        ship_position.y %= WINDOW_HEIGHT

        mouse_x, mouse_y = pygame.mouse.get_pos()
        dx = mouse_x - ship_position.x
        dy = mouse_y - ship_position.y
        ship_angle = math.atan2(dy, dx) + math.pi / 2

        # ── Shooting ─────────────────────────────────────────────────────────

        fire_cooldown -= delta_seconds  # count down toward 0

        # pygame.mouse.get_pressed() returns a tuple:
        # index 0 = left button, 1 = middle button, 2 = right button
        # True = currently held down.
        mouse_buttons = pygame.mouse.get_pressed()
        left_mouse_held = mouse_buttons[0]

        if left_mouse_held and fire_cooldown <= 0:
            fire_bullet()
            fire_cooldown = FIRE_RATE_SECONDS  # reset cooldown

        # ── Update bullets ───────────────────────────────────────────────────

        for bullet in bullets:
            bullet.update(delta_seconds)

        # Remove dead bullets from the list.
        # List comprehension: creates a new list with only alive bullets.
        # This is the Python equivalent of JS: bullets = bullets.filter(b => b.is_alive)
        #
        # Syntax: [expression for item in list if condition]
        # Reads: "keep bullet if bullet.is_alive is True"
        bullets[:] = [b for b in bullets if b.is_alive]
        # bullets[:] = replaces the list contents in-place (not creating a new list).
        # This matters if other parts of the code hold a reference to `bullets`.

        # ── Draw ─────────────────────────────────────────────────────────────
        screen.fill(COLOR_BACKGROUND)

        for bullet in bullets:
            bullet.draw(screen)

        draw_ship(screen, ship_position, ship_angle)  # ship drawn on top of bullets

        pygame.display.flip()
```

**List comprehension `[b for b in bullets if b.is_alive]` explained:**

This is Python's concise syntax for filtering a list. Equivalent to:

```python
surviving = []
for b in bullets:
    if b.is_alive:
        surviving.append(b)
bullets[:] = surviving
```

The `if` part is the filter condition — only elements where the condition is
`True` end up in the new list.

**`bullets[:]` vs `bullets =`:**

`bullets = [...]` creates a new list and rebinds the name `bullets` to it.
If anything else holds a reference to the old list, it still sees the old data.

`bullets[:] = [...]` replaces the contents of the existing list in-place.
Everything holding a reference to `bullets` sees the updated data.

For this game, `bullets = [...]` also works — there are no other references.
`bullets[:]` is shown because it is the safer habit.

---

### SAVE AND TRY — Final

Save. Run `python main.py`.

**Click the mouse** — a yellow bullet fires from the ship nose toward the cursor.
**Move the mouse while clicking** — bullets spread in a fan.
**Hold the mouse button** — rapid fire at `FIRE_RATE_SECONDS` intervals.

**Test bullet expiry:**
Fire bullets straight up and stop. They should disappear after 0.6 seconds.

**In the terminal, add a debug print:**

```python
# Temporarily add inside the game loop, after bullets[:] = [...]:
# print(f"Active bullets: {len(bullets)}")
```

Uncomment it, run, hold the fire button — the count should stay near
`0.6 / 0.12 = 5` (lifetime ÷ fire rate = max bullets at steady state).
Remove the print after testing.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Click fires bullet | Yellow circle appears and travels forward |
| Bullet travels toward cursor | Aim mouse up → bullet goes up |
| Bullets expire after 0.6s | Fire into open space → bullets fade after 0.6s |
| Hold mouse = rapid fire | Continuous shooting at ~8 shots/second |
| Bullets leave screen | Bullets that exit the window disappear |
| List stays bounded | Bullet count stable under continuous fire |
| No terminal errors | No red text in terminal |

---

## What Is Next — LAB 03

LAB 03 adds the first enemy — a Seeker that slowly chases the player. You will
learn how enemy spawning works and see the same chase-toward-player pattern you
used for Blinky in Pac-Man, now in continuous pixel space instead of tile space.

---

*Continue to Geometry Wars — LAB 03 — The First Enemy.*
