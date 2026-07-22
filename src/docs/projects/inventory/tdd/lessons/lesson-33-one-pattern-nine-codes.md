# Lesson 33: One Pattern, Nine Codes

**What you will build:** `core/path.py`'s `compute_path` treats every
motion the same way — one command in, one point out. A real drilling
cycle (`G81`–`G89`, plus the lathe-class `G74`/`G75`/`G76`) isn't one
point at all: it's a real, shared 3-point rapid/feed/rapid pattern
(rapid to a retract plane, feed down to depth, rapid back), with `G83`
adding a real peck-depth loop and `G76` adding real spring passes. This
lesson ports that shared pattern — `cnc/engineMotion.ts`'s real
`addCyclePoints` — and the two words (`R`, `Q`) it depends on. The
transferable point: nine different G-codes sharing *one* real geometric
pattern is exactly the case a dispatch table (Lesson 4's own
`_MOTION_CODES`) can't express by itself — the pattern has to be its own
function, called *by* whichever code triggered it, not encoded as one
more branch returning one more point.

**What you need to know first:** Lesson 29's own citation that `cycle`
(`self.cycle`, `"G80"`–`"G89"`) and `retract_plane` (`self.retract_plane`,
`"G98"`/`"G99"`) were tracked but not yet consumed by anything; Lesson
31's `pos_mode` wiring, which this lesson's own retract-plane resolution
depends on directly.

---

## Project Change (no new concept): Porting `addCyclePoints` for Real

### The Problem

Confirmed directly, this session, against the real, unmodified code —
`O0002.nc`'s own real line 13, `G81 Z-10. R3. F80`:

```python
Parser().parse(open("O0002.nc").read())
# UnsupportedCodeError: R-word is not supported yet
```
Even past that, `compute_path`'s own one-command-one-point rule has
nothing that could produce a real drilling motion — a `G81` command
would just add a single point at the target depth, skipping the rapid
approach and retract entirely.

### Reference Source, Read for Real This Session

`cnc/engineMotion.ts`'s real `addCyclePoints`, in full. The real retract
plane resolution (lines 282–287):
```ts
const rz =
  w.R != null
    ? ch.posMode === "G90"
      ? w.R
      : ch.pos.Z + w.R
    : ch.pos.Z + 3;
```
The shared 3-point pattern (rapid to `rz`, feed to `dz`, rapid back to
`rz`), then `G83`'s real peck loop (`while (currentZ > dz) { ... }`,
gated on `w.Q != null`) and `G76`'s real, hardcoded 3 spring passes at
motion tag `"G32"` — both already fully cited in `COMPONENT_MAP.md`'s
own engine analysis, ported here for the first time.

### Files Affected

`cnc-service/core/parser.py` (modified — `"R"`/`"Q"` added to
`_SUPPORTED_WORDS`, read into the command dict), `cnc-service/core/path.py`
(modified — `_CYCLE_MODES`, new `_add_cycle_points`, `compute_path`
branches on it). Change type: add.

### The New Code

```python
def _add_cycle_points(command, x, y, z, r, points):
    points.append({"motion": "G0", "x": x, "y": y, "z": r})
    points.append({"motion": "G1", "x": x, "y": y, "z": z})
    points.append({"motion": "G0", "x": x, "y": y, "z": r})
```

### The Updated Project

`core/parser.py`'s `_SUPPORTED_WORDS`, `"R"`/`"Q"` added:

```python
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S", "H", "T", "R", "Q")
```

Its command-building tail, the two new words read into the command dict:

```python
        if not program_ended:
            for axis in ("X", "Y", "Z"):
                if axis in words:
                    command[axis.lower()] = words[axis]
            if "R" in words:
                command["r"] = words["R"]
            if "Q" in words:
                command["q"] = words["Q"]
```

`core/path.py` in full:

```python
from core.machine import MachineState

DEFAULT_MOTION = "G0"

# Real cycle modes (cnc/engineMotion.ts's own `hasCyc` list) that share
# one generic 3-point drilling pattern rather than a single moved-to point.
_CYCLE_MODES = ("G81", "G82", "G83", "G84", "G85", "G86", "G87", "G88", "G89", "G74", "G75", "G76")


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
        # Real order (cnc/engineMotion.ts): the retract plane R resolves
        # against the position *before* this move -- absolute in G90,
        # incremental off the current Z in G91; no R word at all falls
        # back to 3mm above the current Z. Captured before state.apply()
        # moves the machine, matching the real ch.pos.Z read order.
        old_z = state.z
        state.apply(command)
        if is_cycle:
            if "r" in command:
                is_absolute = command.get("pos_mode", "G90") == "G90"
                r = command["r"] if is_absolute else old_z + command["r"]
            else:
                r = old_z + 3
            _add_cycle_points(command, state.x, state.y, state.z, r, points)
        else:
            points.append({"motion": command["motion"], **state.position()})
    return points
```

### Mechanical Walkthrough

- `_CYCLE_MODES = (...)` — **(a) first appearance** — direct port of the
  reference's own `hasCyc` array (Lesson 4's own `_MOTION_CODES` is a
  dict keyed by number; this is a tuple checked by membership, since
  every entry here maps to the *same* function, not a distinct value).
- `old_z = state.z` (captured *before* `state.apply(command)`) — **(a)
  first appearance** — the real reason this line exists at all: the
  retract plane must resolve against the position the machine was at
  *before* this move, exactly like `ch.pos.Z` is read before
  `applyMotion` overwrites it in the reference.
- `is_absolute = command.get("pos_mode", "G90") == "G90"` /
  `r = command["r"] if is_absolute else old_z + command["r"]` — **(a)
  first appearance** — direct port of the real ternary
  (`w.R != null ? (ch.posMode === "G90" ? w.R : ch.pos.Z + w.R) : ch.pos.Z + 3`),
  reusing Lesson 31's own `pos_mode` field for the first time outside
  `MachineState`.
- `_add_cycle_points(command, x, y, z, r, points)` — **(a) first
  appearance** — the shared 3-point pattern, called once regardless of
  which of the 9 real cycle codes triggered it — `command["motion"]`
  itself (already correctly set per-code by `_apply_g_code`, Lesson 29)
  is only consulted again inside this function for the two codes
  (`G83`, `G76`) whose real behavior actually differs from the shared
  pattern.
- `if command["motion"] == "G83" and "q" in command: ...` (a `while`
  loop) — **(a) first appearance** — real peck-depth loop, gated
  exactly like the reference's own `w.Q != null` check; `abs(command["q"])`
  matches `Math.abs(w.Q)`.
- `if command["motion"] == "G76": for _ in range(3): ...` — **(a) first
  appearance** — the reference's own literal `for (let p = 0; p < 3;
  p++)`, tagging points `"G32"` (a motion mode this project has never
  emitted before, and doesn't otherwise interpret — it's the real
  reference's own tag for a thread-cutting pass, carried through
  unmodified).

### CS Lens

Nine real G-codes, one real function: the reference's own
`hasCyc.includes(mode)` check (ported here as `command["motion"] in
_CYCLE_MODES`) is doing the same job a dispatch table does — mapping an
input to a behavior — except the "behavior" nine different inputs map to
is the exact same function call, which is why a membership check against
a shared function call is the right shape here, not nine separate
branches that happen to call identical code.

### SE Lens

The real, honest limits, already named in `COMPONENT_MAP.md` before this
lesson ported anything: `G82`'s real dwell at the bottom of the hole,
`G84`'s real spindle-direction reversal for tapping, and the `G85`–`G89`
boring family's real, distinct retract behaviors are *not* in the
reference's own `addCyclePoints` either — every one of those 9 codes
genuinely produces the identical 3-point pattern in the real engine this
project is a port of. Porting them "more correctly" than the reference
itself would stop being a port.

### Commands

None new.

### Run It — Real Output

```
$ python -c "from core.parser import Parser; Parser().parse('G81 Z-10. R3. F80')"
[{'motion': 'G81', 'feed': 80.0, ..., 'pos_mode': 'G90', 'r': 3.0, 'z': -10.0}]
```
No crash — `R`/`Q` now recognized words.

Full regression, run live, this session:
```
Lesson 4 example: unchanged, 4 path points (3 commands + the initial
origin point compute_path always emits).
DEFAULT_PROGRAM: unchanged, 6 path points.
```

Against `O0002.nc`, run live this session — the real payoff, no crash at
all now:
```
$ python -c "
from core.parser import Parser
from core.path import compute_path
cmds = Parser().parse(open('O0002.nc').read())
pts = compute_path(cmds)
print(len(pts))
for p in pts: print(p)
"
11
{'motion': 'G0', 'x': 0.0, 'y': 0.0, 'z': 0.0}
{'motion': 'G80', 'x': 0.0, 'y': 0.0, 'z': 0.0}
{'motion': 'G80', 'x': 0.0, 'y': 0.0, 'z': 0.0}
{'motion': 'G80', 'x': 0.0, 'y': 0.0, 'z': 0.0}
{'motion': 'G0', 'x': 0.0, 'y': 0.0, 'z': 0.0}
{'motion': 'G0', 'x': 0.0, 'y': 0.0, 'z': 3.0}
{'motion': 'G1', 'x': 0.0, 'y': 0.0, 'z': -10.0}
{'motion': 'G0', 'x': 0.0, 'y': 0.0, 'z': 3.0}
{'motion': 'G80', 'x': 0.0, 'y': 0.0, 'z': -10.0}
{'motion': 'G0', 'x': 0.0, 'y': 0.0, 'z': 50.0}
{'motion': 'G0', 'x': 0.0, 'y': 0.0, 'z': 50.0}
```
The real, honest limit visible in this exact output: every hole drills at
`(0, 0)` — `O0002.nc`'s own bolt-circle math (`#104 = #102 * COS[#103]`,
etc.) never runs, since this project has no expression evaluator or real
`WHILE` loop execution yet (Lesson 30's own named, still-open gap). The
3-point cycle pattern itself (`G0` to `z: 3.0`, `G1` to `z: -10.0`, `G0`
back to `z: 3.0`) is real and correct for the one drill call that *does*
execute.

---

## Connect the Pieces

Follow `O0002.nc`'s real line 13, `G81 Z-10. R3. F80`, start to finish:

1. `_apply_g_code(81, ...)` (Lesson 29) sets `self.current_motion =
   "G81"`, `self.cycle = "G81"`.
2. `_parse_block` reads `"R" in words` → `command["r"] = 3.0`; `Z` is
   also in words → `command["z"] = -10.0`.
3. `compute_path` sees `command["motion"] == "G81"`, which is in
   `_CYCLE_MODES` → `is_cycle = True`. `old_z` is captured (whatever `Z`
   was before this line — `0.0`, from the prior `G00 X0 Y0`).
4. `state.apply(command)` moves `Z` to `-10.0` (absolute, `G90`).
5. `"r" in command` is `True`; `is_absolute` is `True` (`G90`) → `r =
   command["r"] = 3.0` directly (not `old_z + 3.0`).
6. `_add_cycle_points(command, 0.0, 0.0, -10.0, 3.0, points)` appends the
   real 3 points: rapid to `(0, 0, 3.0)`, feed to `(0, 0, -10.0)`, rapid
   back to `(0, 0, 3.0)` — `command["motion"] == "G83"`/`"G76"` are both
   `False` for `"G81"`, so neither extra branch fires.

## What Breaks Without This

Reverting `_SUPPORTED_WORDS` to omit `"R"`/`"Q"` (Lesson 32's own list),
and `compute_path` to its pre-cycle form:
```python
def compute_path(commands):
    state = MachineState()
    points = [{"motion": DEFAULT_MOTION, **state.position()}]
    for command in commands:
        state.apply(command)
        points.append({"motion": command["motion"], **state.position()})
    return points
```
Real, reproduced-live behavior: `Parser().parse("G81 Z-10. R3. F80")`
raises `UnsupportedCodeError: R-word is not supported yet` — the exact
crash `O0002.nc`'s own line 13 hits, one real line past where Lesson 32
left off.

## Exercises

1. Send `"G91 G81 Z-10. R3. F80"` (incremental mode active) and trace by
   hand what `r` resolves to, using this lesson's own "Connect the
   Pieces" as a template — then verify live. Is `old_z` the right base to
   add `3.0`/the R-word to, given it was captured *before*
   `state.apply()` ran?
2. Write a program using `G83` with a real `Q` word (a peck depth smaller
   than the total hole depth) and confirm live that multiple peck points
   appear, each retracting to the same `r`, using this lesson's own peck
   loop as reference for what to expect.
3. `_add_cycle_points`' docstring names `G82`'s dwell, `G84`'s spindle
   reversal, and `G85`–`G89`'s distinct retracts as real gaps *in the
   reference itself*, not just this port. Read `cnc/engineMotion.ts`'s
   `addCyclePoints` yourself and confirm directly that none of those 9
   codes get any special-cased handling beyond `G83`/`G76` — citing the
   specific lines that prove it.

## Definition of Done

- [ ] `G81 Z-10. R3. F80` (and the other 8 real cycle codes) produce the
      real 3-point rapid/feed/rapid pattern instead of a single point —
      verified live.
- [ ] `G83` with a real `Q` word produces real peck points; `G76`
      produces 3 real `G32`-tagged spring passes — verified live.
- [ ] The retract plane `R` resolves correctly in both `G90` and `G91` —
      verified live.
- [ ] Lesson 4's own original example and the app's `DEFAULT_PROGRAM`
      both produce unchanged output — verified live.
- [ ] `O0002.nc` against the real parser *and* `compute_path` now
      succeeds end to end, 11 real points, no crash — verified live. Real,
      named, deferred scope: every hole still drills at the origin, since
      macro variables/`WHILE` execution isn't implemented.
- [ ] `git commit` — message explaining that this ports the real, shared
      3-point cycle pattern (`addCyclePoints`) plus `G83`'s peck loop and
      `G76`'s spring passes, closing `O0002.nc`'s last real parser/path
      crash while naming macro-variable execution as the real, separate,
      remaining gap for that specific file.
