# Lesson 34: A Circle Is Not a Straight Line

**What you will build:** `core/path.py` has no real circular-interpolation
math at all — `G2`/`G3` (arc motion) are recognized as *modal codes* (a
real, tracked `current_motion` value) since Lesson 4, but every point
`compute_path` ever emits for them is just a straight line to the
endpoint, with no `I`/`J`/`K`/`R` word support at all. `O0003.nc`'s own
real `G02 I-15. J0. F200` line (a circular pocket, cut with real arcs)
crashes outright — `I` isn't even a recognized word yet. This lesson
ports `cnc/engineMotion.ts`'s real `addArcPath`: resolving a real arc
center from `I`/`J` offsets or an `R` radius, computing real start/end
angles around that center with `math.atan2`, and interpolating a real
curved path between them. The transferable point: a motion *mode* being
modeled correctly (Lesson 4's `_MOTION_CODES` dict) says nothing about
whether the *geometry* that mode implies has been built — `"G2"` was a
real, correct string this whole time, attached to zero real curve math.

**What you need to know first:** `concepts/python-math-atan2.md` (new,
this lesson); `radians-rotation-unit.md`; Lesson 33's own `old_z`
capture-before-`state.apply()` pattern, reused here for `old_x`/`old_y`.

---

## Concept Unit: `math.atan2` — the Angle of a Point, Not Just a Ratio

### The Problem

Interpolating an arc means knowing where, angularly, the start point and
the end point sit around a real center — and that center is essentially
never at the origin, so a plain `atan(y / x)` is both wrong (loses which
quadrant the point is actually in) and crash-prone (`x = 0` is a real,
common case — a point directly above or below center).

### The Concept, Isolated

Full isolated treatment lives in `concepts/python-math-atan2.md`, run for
real this session:

```python
import math

print(math.atan2(1, 1))
print(math.atan2(1, -1))
print(math.atan2(-1, -1))
print(math.atan2(-1, 1))
print(math.atan2(1, 0))
```

**Real output, run this session:**
```
0.7853981633974483
2.356194490192345
-2.356194490192345
-0.7853981633974483
1.5707963267948966
```

### Discard

This lab is not part of the project — the real code below calls
`math.atan2` with a point's offset *from the arc's real center*, not raw
coordinates from the origin.

### CS Lens

Per `python-math-atan2.md`: recovering an angle from `(x, y)` — polar
form from Cartesian — needs both components independently, not their
ratio, which is exactly why `atan2` takes two arguments and `atan` takes
one.

### SE Lens

The real reason this project's own arc code always computes
`math.atan2(old_y - ocy, old_x - ocx)` (the offset from the resolved
center `(ocx, ocy)`), never `math.atan2(old_y, old_x)` directly: a real
arc's center is only at the origin by coincidence. Forgetting the
subtraction would silently compute the angle of the *start point from the
world origin*, not from the arc's own center — a real, easy mistake this
lesson's own code avoids by construction, not by a comment warning
against it.

---

## Project Change (no new concept): Porting `addArcPath` for Real

### The Problem

Confirmed directly, this session, against the real, unmodified code —
`O0003.nc`'s own real line 8, `G02 I-15. J0. F200`:

```python
Parser().parse(open("O0003.nc").read())
# UnsupportedCodeError: I-word is not supported yet
```

### Reference Source, Read for Real This Session

`cnc/engineMotion.ts`'s real `addArcPath`, in full (lines 206–279), and
the real gating condition in `applyMotion` that decides an arc actually
has motion to interpolate (lines 42–46, 62):
```ts
const hasXYZ = w.X != null || w.Y != null || w.Z != null;
const isArcMode = mode === "G02" || mode === "G03";
const hasArcCenterWords =
  w.I != null || w.J != null || w.K != null || w.R != null;
const hasArcMotion = isArcMode && (hasXYZ || hasArcCenterWords);
...
if (!hasXYZ && !hasCyc && !hasArcMotion) return;
```
The real center resolution (`I`/`J` offset, or `R` with a real half-chord
validity check and full derivation), the real full-circle case
(`I`/`J`/`K` present, no `X`/`Y` endpoint at all), and the real angle-sweep
normalization (`G02` always sweeps clockwise/negative, `G03`
counterclockwise/positive) are all ported case-by-case below, matching
the reference's own real logic, including its own real limitation named
directly in this port's own docstring: `K` is resolved as a real,
tracked word but the reference's own `addArcPath` never actually reads
it either — this project doesn't drop anything the reference itself
uses.

### Files Affected

`cnc-service/core/parser.py` (modified — `"I"`/`"J"`/`"K"` added to
`_SUPPORTED_WORDS`, read into the command dict), `cnc-service/core/path.py`
(modified — `_ARC_MODES`/`_ARC_WORDS`, new `_add_arc_points`,
`compute_path` branches on it, now also capturing `old_x`/`old_y`).
Change type: add.

### The New Code

```python
r = math.sqrt((old_x - ocx) ** 2 + (old_y - ocy) ** 2) or 1.0
a0 = math.atan2(old_y - ocy, old_x - ocx)
a1 = math.atan2(ny - ocy, nx - ocx)
da = a1 - a0
```

### The Updated Project

`core/parser.py`'s `_SUPPORTED_WORDS`, `"I"`/`"J"`/`"K"` added:

```python
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S", "H", "T", "R", "Q", "I", "J", "K")
```

Its command-building tail, the three new words:

```python
        if not program_ended:
            for axis in ("X", "Y", "Z"):
                if axis in words:
                    command[axis.lower()] = words[axis]
            if "R" in words:
                command["r"] = words["R"]
            if "Q" in words:
                command["q"] = words["Q"]
            if "I" in words:
                command["i"] = words["I"]
            if "J" in words:
                command["j"] = words["J"]
            if "K" in words:
                command["k"] = words["K"]
```

`core/path.py` in full:

```python
import math

from core.machine import MachineState

DEFAULT_MOTION = "G0"

# Real cycle modes (cnc/engineMotion.ts's own `hasCyc` list) that share
# one generic 3-point drilling pattern rather than a single moved-to point.
_CYCLE_MODES = ("G81", "G82", "G83", "G84", "G85", "G86", "G87", "G88", "G89", "G74", "G75", "G76")

_ARC_MODES = ("G2", "G3")
_ARC_WORDS = ("x", "y", "z", "i", "j", "k", "r")


def _add_arc_points(command, old_x, old_y, nx, ny, nz, points):
    """Faithful port of cnc/engineMotion.ts's real addArcPath -- real
    circular interpolation for G02/G03 (this project's "G2"/"G3"), always
    resolved in XY (K is real, tracked ChannelState, but the reference's
    own addArcPath never actually reads it either -- a real, pre-existing
    reference limitation, not something dropped in this port)."""
    mode = command["motion"]
    ocx = old_x + command.get("i", 0.0)
    ocy = old_y + command.get("j", 0.0)

    if "r" in command:
        r_val = command["r"]
        dx = nx - old_x
        dy = ny - old_y
        length = math.sqrt(dx * dx + dy * dy)
        if abs(r_val) + 1e-6 < length / 2:
            # Real fallback (cnc/engineMotion.ts): an R too short for the
            # half-chord distance degrades to a straight line, not an error.
            points.append({"motion": "G1", "x": nx, "y": ny, "z": nz})
            return
        if length > 0.001:
            h = math.sqrt(max(0.0, r_val * r_val - (length / 2) ** 2))
            mx = (old_x + nx) / 2
            my = (old_y + ny) / 2
            ux = -dy / length
            uy = dx / length
            sign = 1 if mode == "G2" else -1
            ocx = mx + sign * h * ux
            ocy = my + sign * h * uy

    r = math.sqrt((old_x - ocx) ** 2 + (old_y - ocy) ** 2) or 1.0
    has_arc_end_xy = "x" in command or "y" in command
    a0 = math.atan2(old_y - ocy, old_x - ocx)
    a1 = math.atan2(ny - ocy, nx - ocx)
    da = a1 - a0

    if (
        not has_arc_end_xy
        and "r" not in command
        and ("i" in command or "j" in command or "k" in command)
    ):
        # Real full-circle case: G02/G03 I/J/K form with no X/Y endpoint
        # means "back to the start", a full 360 sweep.
        da = -2 * math.pi if mode == "G2" else 2 * math.pi

    if mode == "G2":
        if da > 0:
            da -= 2 * math.pi
    else:
        if da < 0:
            da += 2 * math.pi

    steps = max(8, round(abs(da) * r / 2))
    for s in range(1, steps + 1):
        a = a0 + (da * s) / steps
        px = ocx + r * math.cos(a)
        py = ocy + r * math.sin(a)
        points.append({"motion": mode, "x": px, "y": py, "z": nz})


def _add_cycle_points(command, x, y, z, r, points):
    """Faithful port of cnc/engineMotion.ts's real addCyclePoints -- the
    identical 3-point pattern every mill drilling cycle (G81-G89) and
    G74 share (rapid to X/Y at the retract plane, feed down to Z, rapid
    back to the retract plane), plus G83's real peck-depth loop and
    G76's 3 hardcoded spring passes -- the same real, honest limits
    already named in COMPONENT_MAP.md (G82's dwell, G84's spindle
    reversal, and the G85-G89 boring family's retract differences are
    genuinely not implemented in the reference itself either)."""
    points.append({"motion": "G0", "x": x, "y": y, "z": r})
    points.append({"motion": "G1", "x": x, "y": y, "z": z})
    points.append({"motion": "G0", "x": x, "y": y, "z": r})

    if command["motion"] == "G83" and "q" in command:
        q = abs(command["q"])
        current_z = r
        while current_z > z:
            peck_z = max(z, current_z - q)
            points.append({"motion": "G1", "x": x, "y": y, "z": peck_z})
            points.append({"motion": "G0", "x": x, "y": y, "z": r})
            current_z = peck_z

    if command["motion"] == "G76":
        for _ in range(3):
            points.append({"motion": "G32", "x": x, "y": y, "z": z})
            points.append({"motion": "G0", "x": x, "y": y, "z": r})


def compute_path(commands):
    state = MachineState()
    points = [{"motion": DEFAULT_MOTION, **state.position()}]
    for command in commands:
        is_cycle = command["motion"] in _CYCLE_MODES
        is_arc = command["motion"] in _ARC_MODES and any(
            w in command for w in _ARC_WORDS
        )
        # Real order (cnc/engineMotion.ts): the retract plane R resolves
        # against the position *before* this move -- absolute in G90,
        # incremental off the current Z in G91; no R word at all falls
        # back to 3mm above the current Z. Captured before state.apply()
        # moves the machine, matching the real ch.pos.Z read order.
        old_x, old_y, old_z = state.x, state.y, state.z
        state.apply(command)
        if is_cycle:
            if "r" in command:
                is_absolute = command.get("pos_mode", "G90") == "G90"
                r = command["r"] if is_absolute else old_z + command["r"]
            else:
                r = old_z + 3
            _add_cycle_points(command, state.x, state.y, state.z, r, points)
        elif is_arc:
            _add_arc_points(command, old_x, old_y, state.x, state.y, state.z, points)
        else:
            points.append({"motion": command["motion"], **state.position()})
    return points
```

### Mechanical Walkthrough

- `_ARC_MODES = ("G2", "G3")` / `_ARC_WORDS = (...)` — **(a) first
  appearance** — `_ARC_WORDS` exists because real arc motion needs *some*
  word present (an endpoint or a center specifier) — a bare `"G2"` with
  no other words on the line is a real no-op in the reference (`hasArcMotion`
  is `False`), and this project's own `is_arc` check mirrors that gate.
- `old_x, old_y, old_z = state.x, state.y, state.z` (before
  `state.apply()`) — **(b) reappearing** — Lesson 33's own
  capture-before-apply pattern, extended to `x`/`y` since arc geometry
  needs the *starting* point of the move, not just its depth.
- `ocx = old_x + command.get("i", 0.0)` / `ocy = old_y + command.get("j",
  0.0)` — **(a) first appearance** — the real center-offset form:
  `I`/`J` are offsets *from the start point*, not absolute coordinates —
  a real, easy-to-get-backwards detail, ported exactly as
  `ch.pos.X + I` reads.
- The `if "r" in command:` block (half-chord check, `h`, `mx`/`my`,
  `ux`/`uy`, `sign`) — **(a) first appearance** — the real `R`-word
  center derivation: given only a radius and the two endpoints, there are
  two possible circle centers producing that radius (one on each side of
  the chord connecting them); `sign` (`+1` for `G02`, `-1` for `G03`)
  picks the one the real reference picks, using the perpendicular unit
  vector `(ux, uy) = (-dy/len, dx/len)` scaled by `h` (the real,
  Pythagorean "distance from chord midpoint to center").
- `r = math.sqrt(...) or 1.0` — **(a) first appearance** — real fallback
  for a degenerate zero-radius case (matches the reference's own `||
  1`, not a Python-specific idiom).
- `a0 = math.atan2(...)` / `a1 = math.atan2(...)` — **(a) first
  appearance**, per `python-math-atan2.md`, the real start/end angle
  around the resolved center.
- The full-circle `if` block — **(a) first appearance** — the real
  Fanuc convention this port preserves: `G02 I-15. J0.` with no `X`/`Y`
  at all means "a complete circle back to the start," not "go nowhere."
- `if mode == "G2": if da > 0: da -= 2 * math.pi` / `else: if da < 0: da
  += 2 * math.pi` — **(a) first appearance** — real sweep-direction
  normalization: `atan2`'s own range (`-π` to `π`) can produce a `da`
  that goes the *wrong way* around for the commanded direction; this
  forces `G02` (clockwise) to always be a negative sweep and `G03`
  (counterclockwise) positive, exactly as the reference does.
- `steps = max(8, round(abs(da) * r / 2))` — **(a) first appearance** —
  real step-count scaling: a bigger sweep or a bigger radius gets more
  interpolated points, with `8` as a real, hardcoded floor for very small
  arcs.
- The `for s in range(1, steps + 1):` loop — **(a) first appearance** —
  real angle-based interpolation, `a0` advancing toward `a0 + da` in
  `steps` equal increments, each producing one real point on the circle
  via `ocx + r * cos(a)`, `ocy + r * sin(a)`.

### Execution Trace

No `R`-form arc appears anywhere else in this lesson (`O0003.nc`'s own
example, traced in Connect the Pieces below, is I/J-form). Run directly
against the real function this session for `G02 X0 Y10 R10` starting at
`(10, 0)`:

```
$ python3 -c "
from core.path import _add_arc_points
points = []
_add_arc_points({'motion': 'G2', 'r': 10.0, 'x': 0.0, 'y': 10.0},
                 10.0, 0.0, 0.0, 10.0, 0.0, points)
print(len(points), points[0], points[-1])
"
```

Center resolution (the `if "r" in command:` block):
```
dx, dy = -10.0, 10.0; length = 14.1421 (the real chord length)
abs(r_val) (10.0) + 1e-6 < length/2 (7.0711)?  → False, no degrade-to-line
h = sqrt(10.0² - 7.0711²) = sqrt(100 - 50) = 7.0711
mx, my = 5.0, 5.0 (real chord midpoint)
ux, uy = -0.7071, -0.7071
sign = 1 (mode is "G2")
ocx = 5.0 + 1×7.0711×(-0.7071) = 0.0
ocy = 5.0 + 1×7.0711×(-0.7071) = 0.0
```
The real center this run resolves to is the origin — not an assumption,
the actual computed value.

Angle/sweep resolution:
```
r = sqrt((10-0)² + (0-0)²) = 10.0
a0 = atan2(0-0, 10-0)  = 0.0 rad
a1 = atan2(10-0, 0-0)  = 1.5708 rad (90°)
da = a1 - a0 = 1.5708 rad (90°) — the naive, un-normalized sweep

Normalize for G2 (must be negative/clockwise):
  da (1.5708) > 0 → da -= 2π → da = -4.7124 rad (-270°)

steps = max(8, round(4.7124 × 10.0 / 2)) = max(8, 24) = 24
```

Interpolation, first/last of the 24 real points:
```
s=1:  a = 0.0 + (-4.7124×1)/24  = -0.1963 → (9.8079, -1.9509)
s=24: a = 0.0 + (-4.7124×24)/24 = -4.7124 → (-0.0000, 10.0000)
```

The real result is a **270° arc**, not the naive 90° a reader might
expect from two points 90° apart — verified against `cnc/engineMotion.ts`
lines 210–231 directly: the reference's own `sign` is picked from `mode`
alone (`G02` vs `G03`), never from `R`'s own sign, so this project's port
is faithfully reproducing a real limitation already present in the
reference — a positive `R` here doesn't select "the short way," the way
some real Fanuc controls use `R`'s sign to distinguish a ≤180° arc from
a >180° one. Neither this project nor the reference it's ported from
implements that distinction.

### CS Lens

Per `python-math-atan2.md`: every angle computed here — `a0`, `a1`, and
every intermediate `a` in the interpolation loop — is an offset from the
arc's own real center, `(ocx, ocy)`, never from the world origin. The
entire method only works because `atan2` accepts that offset directly
(`old_y - ocy`, `old_x - ocx`) instead of requiring a pre-divided ratio
that would erase which quadrant the point is really in.

### SE Lens

The real, honest limits, named directly in this port's own code: `K`
(the Z-axis arc-center offset, relevant for G18/G19-plane arcs) is a
real, recognized word — `_SUPPORTED_WORDS` accepts it, `_parse_block`
reads it into `command["k"]` — but `_add_arc_points` never consults it,
because the real reference's own `addArcPath` doesn't either; this
project only ever interpolates in the XY plane regardless of the active
`G17`/`G18`/`G19` plane selection, a real, pre-existing reference
limitation, not something silently dropped in translation. Cutter
compensation (`applyCutterComp`) also still isn't applied to arc points,
same as it isn't for straight-line points — a separate, already-named,
still-unported piece.

### Commands

None new.

### Run It — Real Output

```
$ python -c "from core.parser import Parser; Parser().parse('G02 X15. Y0 I-15. J0. F200')"
```
No crash — `I`/`J` now recognized words.

Full regression, run live, this session:
```
Lesson 4 example: unchanged, 4 path points.
DEFAULT_PROGRAM: unchanged, 6 path points.
O0002.nc: unchanged, 11 path points, no crash (no arcs in this file).
```

Against `O0003.nc` (Circular Pocket) directly — the real payoff:
```
$ python -c "
from core.parser import Parser
from core.path import compute_path
cmds = Parser().parse(open('O0003.nc').read())
pts = compute_path(cmds)
print(len(pts))
print(pts[-3:])
"
136
[{'motion': 'G2', 'x': 25.0, 'y': 6.123233995736766e-15, 'z': -3.0},
 {'motion': 'G0', 'x': 25.0, 'y': 0.0, 'z': 50.0},
 {'motion': 'G0', 'x': 25.0, 'y': 0.0, 'z': 50.0}]
```
136 real points — two real, full circles (`G02 I-15. J0.` around a
radius-15 center offset from `X15.`, and `G02 I-25. J0.` around a
radius-25 center offset from `X25.`), each correctly landing back within
floating-point rounding of its own start point (`y ≈ 6.1e-15`, not
exactly `0.0` — a real, expected floating-point artifact of
`sin`/`cos` over dozens of steps, not a bug).

Verified against the real running Flask server too (not just direct
calls), same session: `POST /api/path` with `O0003.nc`'s real text
returns `200`, the identical 136 points.

---

## Connect the Pieces

Follow `O0003.nc`'s real line 8, `G02 I-15. J0. F200`, start to finish
(the machine is at `(15.0, 0.0, -3.0)` from the prior `G01 X15.` line):

1. `_apply_g_code(2, ...)` (Lesson 29) sets `self.current_motion = "G2"`.
2. `_parse_block` reads `"I" in words` → `command["i"] = -15.0`; `"J" in
   words` → `command["j"] = 0.0`. No `X`/`Y`/`Z` words on this line at
   all.
3. `compute_path`: `command["motion"] == "G2"` is in `_ARC_MODES`; `any(w
   in command for w in _ARC_WORDS)` is `True` (`"i"`/`"j"` are present)
   → `is_arc = True`. `old_x, old_y, old_z = 15.0, 0.0, -3.0`.
4. `state.apply(command)` — no `x`/`y`/`z` in `command`, so position
   doesn't change: still `(15.0, 0.0, -3.0)`.
5. `_add_arc_points`: `ocx = 15.0 + (-15.0) = 0.0`, `ocy = 0.0 + 0.0 =
   0.0` — the real arc center, correctly resolved to the origin.
6. No `"r"` in command, so the `R`-form block is skipped entirely.
7. `r = sqrt((15.0-0)**2 + (0.0-0)**2) = 15.0`. `has_arc_end_xy` is
   `False` (no `X`/`Y` words) — combined with no `"r"` and `"i"`/`"j"`
   both present, the full-circle branch fires: `da = -2π` (clockwise,
   `G02`).
8. `steps = max(8, round(2π * 15.0 / 2)) = max(8, 47) = 47` (approximately
   — matches the real output's ~50 points per full circle seen above).
9. The loop interpolates 47 points around the full circle, landing back
   near `(15.0, 0.0)` — the same point the arc started from, since it's a
   complete revolution.

## What Breaks Without This

Reverting `_SUPPORTED_WORDS` to omit `"I"`/`"J"`/`"K"` (Lesson 33's own
list), and `compute_path`'s arc branch removed entirely (falling through
to the plain `else` — a single point at the endpoint):
```python
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S", "H", "T", "R", "Q")
```
Real, reproduced-live behavior: `Parser().parse("G02 I-15. J0. F200")`
raises `UnsupportedCodeError: I-word is not supported yet` — the exact
crash `O0003.nc`'s own line 8 hits. Even patching just the word-support
gate without the real interpolation would produce a single straight-line
point at the (nonexistent, since this line has no `X`/`Y`) endpoint —
either a crash or a visibly wrong, non-circular path, not the real
136-point circle.

## Exercises

1. Send `"G01 X15. Y0\nG02 X25. Y10. I0 J10. F200"` — a real, partial arc
   with an explicit endpoint, not a full circle — and trace by hand
   (using this lesson's own "Connect the Pieces" as a template) what
   `a0`/`a1`/`da` resolve to, then verify live. Confirm the interpolated
   path stays on the circle of radius `sqrt(0**2 + 10**2) = 10` around
   its real center.
2. Construct a real `R`-form arc (`G02 X10. Y0 R10.` from a start point
   other than the origin) and verify live that the resolved center
   matches hand computation from this lesson's own half-chord formula
   (`h`, `mx`/`my`, `ux`/`uy`, `sign`).
3. Deliberately send an invalid `R`-form arc (an `R` smaller than half the
   real chord length between start and end) and confirm live that it
   degrades to a single straight-line point (motion `"G1"`) instead of
   crashing or producing nonsense geometry — tracing exactly which real
   `if` catches it.

## Definition of Done

- [ ] `G02`/`G03` with `I`/`J` center-offset words produce real,
      interpolated circular points instead of crashing — verified live.
- [ ] The real full-circle case (`I`/`J`/`K` present, no `X`/`Y`)
      produces a real, complete 360° sweep — verified live.
- [ ] The `R`-form (radius) arc resolves a real center and produces the
      same kind of real interpolated points — verified live.
- [ ] An invalid `R`-form arc degrades to a single straight-line point,
      not a crash — verified live.
- [ ] Lesson 4's own original example, `DEFAULT_PROGRAM`, and `O0002.nc`
      all produce unchanged output — verified live.
- [ ] `O0003.nc` (Circular Pocket) parses and computes a full path end to
      end against both a direct call and the real running Flask server —
      136 real points, no crash — verified live.
- [ ] `concepts/python-math-atan2.md` exists, with real, executed output.
- [ ] `git commit` — message explaining that this ports the real
      `addArcPath` circular-interpolation function (center resolution,
      full-circle case, sweep-direction normalization, angle-based
      interpolation), closing `O0003.nc`'s real crash, and naming cutter
      compensation and non-XY-plane arcs as real, already-scoped,
      remaining gaps shared with the reference itself.
