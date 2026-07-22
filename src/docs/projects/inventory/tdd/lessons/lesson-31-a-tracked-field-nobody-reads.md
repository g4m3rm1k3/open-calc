# Lesson 31: A Tracked Field Nobody Reads

**What you will build:** `core/parser.py` has tracked `pos_mode`
(`"G90"`/`"G91"`) correctly since Lesson 29 — but nothing downstream ever
reads it, so `G91` (incremental positioning) has had zero real effect
since it was added: an `X10` word always meant "go to absolute X=10,"
never "move 10 further from here," no matter which mode was active.
Separately, `G28` (return to reference) pre-resolved the home position
directly into the command dict, which meant any `X`/`Y`/`Z` word on the
*same* line as `G28` silently overwrote it — the real reference does the
opposite: home is set first, then the same line's words apply on top of
it. This lesson wires `pos_mode` into `MachineState.apply()` for real,
and fixes `G28`'s ordering to match. The transferable point: a field can
be real, correctly named, and correctly updated, and still be
completely inert if nothing ever consults it — "tracked" and "wired in"
are two different, separately verifiable claims.

**What you need to know first:** Lesson 29's own citation that `pos_mode`
was tracked but "consumed by nothing downstream yet"; Lesson 5's
`MachineState.apply()` (unconditional absolute assignment, unchanged
since).

---

## Project Change (no new concept): Real Absolute/Incremental Resolution, and `G28`'s Real Ordering

### The Problem

Confirmed directly, this session, against the real, unmodified code —
`G91` tracked but inert:

```python
Parser().parse("G91 G0 X10 Y5\nX10 Y5")
# both lines land at (10.0, 5.0) -- the second X10/Y5 should have added
# to the first, landing at (20.0, 10.0), if G91 meant anything.
```

`G28` discarding same-line words:

```python
Parser().parse("G0 X50 Y20\nG28 X30 Y40")
# final position: (0.0, 0.0, 0.0) -- X30/Y40 vanish entirely.
```

### Reference Source, Read for Real This Session

`cnc/engineMotion.ts`'s `applyMotion`, the real `av()` helper (lines
37–40):
```ts
const abs = ch.posMode === "G90";
const av = (cur, v) => {
  const resolved = ev.resolve(v) ?? v;
  return abs ? resolved : cur + resolved;
};
```
And `cnc/engineGCodeApply.ts`'s real `G28` case (lines 161–165) — a
direct, unconditional write to shared position state, with no flag or
return value at all:
```ts
case 28: // G28 return to reference
  ch.pos.X = ch.home.X;
  ch.pos.Y = ch.home.Y;
  ch.pos.Z = ch.home.Z;
  break;
```
The real "double apply" isn't special-cased merge logic — it's a direct
consequence of `ch.pos` being one shared, mutable object: `applyGCode`
(above) writes home into it first, then `applyMotion` (a separate, later
call in the same real block, per `_executeBlock`'s dispatch order — see
Lesson 29's own citation) reads whatever `X`/`Y`/`Z` words are on that
same line via `av()` and overwrites `ch.pos` again.

### Files Affected

`cnc-service/core/machine.py` (modified — `MachineState.apply()`),
`cnc-service/core/parser.py` (modified — `pos_mode` added to the command
dict; `G28`'s handling changed from pre-resolving home directly to a
`went_home` flag). Change type: fix (both are real, tracked/available
state whose consuming logic was previously wrong or absent).

### The New Code

```python
if command.get("went_home"):
    self.x, self.y, self.z = 0.0, 0.0, 0.0
is_absolute = command.get("pos_mode", "G90") == "G90"
if "x" in command:
    self.x = command["x"] if is_absolute else self.x + command["x"]
```

### The Updated Project

`core/machine.py` in full:

```python
class MachineState:
    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0
        self.feed = 0
        self.spindle_rpm = 0
        self.spindle_dir = ""
        self.coolant_flood = False
        self.coolant_mist = False

    def apply(self, command):
        # Real port of cnc/engineMotion.ts's applyMotion -- specifically
        # its "av()" helper (resolved = ev.resolve(v) ?? v; return abs ?
        # resolved : cur + resolved): absolute mode (G90) uses a word's
        # value directly; incremental mode (G91) adds it to the current
        # position. Previously this always behaved as if G90 were active,
        # regardless of what pos_mode actually tracked -- G91 was real,
        # tracked state with zero real effect until now.
        if command.get("went_home"):
            # Real, unconditional G28 behavior, applied before normal
            # axis resolution below -- see core/parser.py's own comment.
            self.x, self.y, self.z = 0.0, 0.0, 0.0
        is_absolute = command.get("pos_mode", "G90") == "G90"
        if "x" in command:
            self.x = command["x"] if is_absolute else self.x + command["x"]
        if "y" in command:
            self.y = command["y"] if is_absolute else self.y + command["y"]
        if "z" in command:
            self.z = command["z"] if is_absolute else self.z + command["z"]
        if "feed" in command:
            self.feed = command["feed"]
        if "spindle_rpm" in command:
            self.spindle_rpm = command["spindle_rpm"]
        if "spindle_dir" in command:
            self.spindle_dir = command["spindle_dir"]
        if "coolant_flood" in command:
            self.coolant_flood = command["coolant_flood"]
        if "coolant_mist" in command:
            self.coolant_mist = command["coolant_mist"]

    def position(self):
        return {"x": self.x, "y": self.y, "z": self.z}

    def state(self):
        return {
            "position": self.position(),
            "feed": self.feed,
            "spindle_rpm": self.spindle_rpm,
            "spindle_dir": self.spindle_dir,
            "coolant_flood": self.coolant_flood,
            "coolant_mist": self.coolant_mist,
        }
```

`core/parser.py`'s `_parse_block`, the command-building tail (everything
above it — the G-code loop, the still-unchanged old M-code block —
unchanged from Lesson 29):

```python
        command = {
            "motion": self.current_motion,
            "feed": self.current_feed,
            "spindle_rpm": self.spindle_rpm,
            "spindle_dir": self.spindle_dir,
            "coolant_flood": self.coolant_flood,
            "coolant_mist": self.coolant_mist,
            # Real field MachineState.apply() needs (cnc/engineMotion.ts's
            # applyMotion "av()" helper): decides whether X/Y/Z words below
            # are absolute positions or offsets from the current position.
            "pos_mode": self.pos_mode,
        }
        for axis in ("X", "Y", "Z"):
            if axis in words:
                command[axis.lower()] = words[axis]
        if went_home:
            # Real, unconditional G28 behavior (cnc/engineGCodeApply.ts):
            # ch.pos.X = ch.home.X, etc. -- applied by MachineState.apply()
            # *before* any X/Y/Z word on this same line, so a combined
            # "G28 X0 Y0" resolves those words relative to the just-homed
            # position, matching the real engine's own documented
            # double-apply behavior, rather than one or the other winning
            # outright (previously, this pre-resolved home right here and
            # let any X/Y/Z word on the same line simply overwrite it below,
            # instead of building on top of it).
            command["went_home"] = True
        return command
```

### Mechanical Walkthrough

- `is_absolute = command.get("pos_mode", "G90") == "G90"` — **(a) first
  appearance** — real port of `av()`'s `abs` variable, computed once per
  command instead of once per whole engine call (this project resolves
  one command at a time, not a whole recorder pass), defaulting to
  `"G90"` for any command dict that predates this field (none exist in
  this project's own test paths, but the default matches the reference's
  own real modal default anyway).
- `self.x = command["x"] if is_absolute else self.x + command["x"]` —
  **(a) first appearance** — the real `av()` ternary, applied per axis;
  `(b) reappearing` — the `if "x" in command:` guard shape itself,
  unchanged since Lesson 5.
- `if command.get("went_home"): self.x, self.y, self.z = 0.0, 0.0, 0.0`
  — **(a) first appearance** — the real, unconditional `G28` write,
  moved from `core/parser.py` into `MachineState.apply()` so it runs
  *before* the axis-resolution lines directly below it, reproducing the
  reference's own two-write ordering inside one method instead of across
  `applyGCode`/`applyMotion`'s two separate real calls.
- `"pos_mode": self.pos_mode` in the command dict — **(a) first
  appearance of this field being read by anything** — `Parser` has set
  `self.pos_mode` since Lesson 29; this is the first line that ever
  copies it into a command `MachineState` will see.
- `command["went_home"] = True` replacing the old direct
  `command["x"]/["y"]/["z"] = self.home[...]` assignment — **(a) first
  appearance** of the flag; **(b) reappearing** — the `if went_home:`
  guard itself, already present since Lesson 29, now doing less work
  directly and delegating the actual position write to `MachineState`.

### CS Lens

Real, observed proof that "tracked" and "consumed" are different claims:
`self.pos_mode` existed, was correctly set to `"G91"` by `_apply_g_code`,
and was inspectable on the `Parser` instance the entire time — yet
produced zero difference in any `compute_path` output until this lesson,
because nothing between "the field is set" and "a position gets
computed" ever read it. A correct write with no corresponding read is
observably identical to no write at all.

### SE Lens

Folding `G28`'s "go home" write and the normal axis-resolution write into
one method, `MachineState.apply()`, rather than reproducing the
reference's exact two-function split (`applyGCode` mutates `ch.pos`
directly; `applyMotion` mutates it again later) is a deliberate,
real simplification — this project's own `Parser`/`MachineState` split
already runs one command through one `apply()` call per line, so there's
no second, separate "motion phase" call to hang the second write on
without inventing one. The *order* (home write, then axis-word
resolution) is preserved exactly; the *mechanism* (one method, an
early-`if`, versus two independently-invoked functions) is not, and
doesn't need to be for the observable behavior to match.

### Commands

None new.

### Run It — Real Output

`G91`, before and after, run live this session:
```
# before (Lesson 29's own code, unmodified):
Parser().parse("G91 G0 X10 Y5\nX10 Y5") -> both lines: (10.0, 5.0, 0.0)

# after (this lesson):
Parser().parse("G91 G0 X10 Y5\nX10 Y5") -> (10.0, 5.0, 0.0), then (20.0, 10.0, 0.0)
```

`G28`, before and after, run live this session:
```
# before:
Parser().parse("G0 X50 Y20\nG28 X30 Y40") -> (50.0, 20.0, 0.0), then (0.0, 0.0, 0.0)

# after:
Parser().parse("G0 X50 Y20\nG28 X30 Y40") -> (50.0, 20.0, 0.0), then (30.0, 40.0, 0.0)
```

Full regression, run live, this session:
```
Lesson 4 example: unchanged, all three commands identical (now each also
carries "pos_mode": "G90", a real, harmless new field on every command).
DEFAULT_PROGRAM: unchanged, 6 path points.
O0002.nc against the real parser: still fails, still on T-word (line 3)
-- this lesson doesn't touch M-codes at all.
```

---

## Connect the Pieces

Follow `"G0 X50 Y20\nG28 X30 Y40"` end to end:

1. Line 1: `pos_mode` is `"G90"` (the default); `command = {"x": 50.0,
   "y": 20.0, "pos_mode": "G90", ...}`. `MachineState.apply()`: no
   `went_home`, `is_absolute` is `True`, so `self.x = 50.0`, `self.y =
   20.0`.
2. Line 2 (`G28 X30 Y40`): `_apply_g_code(28, ...)` returns `True`,
   setting `went_home = True` in `_parse_block`. The axis loop still
   runs, so `command["x"] = 30.0`, `command["y"] = 40.0` — then
   `command["went_home"] = True` is added alongside them, not instead of
   them.
3. `MachineState.apply()` sees `went_home` first: `self.x, self.y, self.z
   = 0.0, 0.0, 0.0` — the machine really goes home.
4. The very next lines in the same method then resolve `command["x"]`/
   `["y"]` normally: `is_absolute` is `True` (still `G90`), so `self.x =
   30.0`, `self.y = 40.0` — overwriting the just-homed values, exactly as
   the real reference's own separate, later `applyMotion` call would.
5. Final position: `(30.0, 40.0, 0.0)` — `Z` stays at the homed `0.0`
   since no `Z` word was on that line to overwrite it again.

## What Breaks Without This

Reverting `MachineState.apply()` to always resolve absolute (Lesson 5's
original code):
```python
if "x" in command:
    self.x = command["x"]
```
Real, reproduced-live behavior: `"G91 G0 X10 Y5\nX10 Y5"` lands both
lines at `(10.0, 5.0, 0.0)` — the second line's `X10 Y5` is silently
treated as "go to X=10, Y=5" instead of "move 10/5 further," with no
error and no visible sign anything is wrong, since `10.0` is a
perfectly valid position either way. Reverting `core/parser.py`'s `G28`
handling to its original direct-overwrite form reproduces the discarded-
words bug from the top of this lesson.

## Exercises

1. Send `"G91 G0 X10\nG90 X10"` — incremental then back to absolute on
   the same axis — and predict the final `X` before running it, then
   verify live.
2. `MachineState.apply()`'s `went_home` branch resets `Z` to `0.0` too,
   even when a program's real home position isn't the machine origin.
   `Parser.home` (Lesson 29) is hardcoded to `{"x": 0.0, "y": 0.0, "z":
   0.0}` and never actually read by this fix — trace why: what would
   have to change for a non-origin home position to work correctly here?
3. Using this lesson's own "Connect the Pieces," work out by hand what
   `"G91 G0 X50 Y20\nG28 X30 Y40"` produces (incremental mode active
   *before* the `G28` line) — then verify live. Is the `X30 Y40` on the
   `G28` line itself resolved as absolute or incremental? Justify your
   answer from the real code, not intuition.

## Definition of Done

- [ ] `G91` incrementally offsets `X`/`Y`/`Z` from the current position
      instead of being silently ignored — verified live.
- [ ] `G28 <axis words>` goes home first, then applies the same line's
      axis words on top of the homed position, instead of discarding
      them — verified live.
- [ ] Lesson 4's own original example and the app's `DEFAULT_PROGRAM`
      both produce unchanged output (aside from the new, harmless
      `pos_mode` field on every command) — verified live.
- [ ] `O0002.nc` still fails on the already-named `T`-word gap, unchanged
      by this lesson.
- [ ] `git commit` — message explaining that this closes two real,
      silent gaps: `G91` tracked-but-inert since Lesson 29, and `G28`
      discarding same-line axis words instead of building on top of the
      homed position, both fixed by reading `applyMotion`'s real `av()`
      helper and `applyGCode`'s real `G28` case directly.
