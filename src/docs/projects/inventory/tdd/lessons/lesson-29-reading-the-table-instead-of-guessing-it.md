# Lesson 29: Reading the Table Instead of Guessing It

**What you will build:** `core/parser.py`'s G-code handling recognizes
only `G0`–`G3` and rejects any line with more than one `G`-word — a real
crash for real, common G-code (`G21 G90 G17 G40 G49 G80`, a completely
ordinary preamble line). This lesson replaces that with a faithful,
case-by-case port of the real, already-proven, 45-test-covered dispatch
table this project's backend is a port of — `cnc/engineGCodeApply.ts`'s
`applyGCode`, extracted from `CNCEngine.ts` — instead of a smaller,
hand-picked subset. The transferable point: when a real, tested
implementation of the exact problem already exists, reading and porting
it is more reliable than writing a new approximation from general
knowledge of what a G-code parser probably needs.

**What you need to know first:** Lesson 4's own `_MOTION_CODES` lookup
table and its explicit, named scope cut ("Only cases 0–3 are ported...
a named, later lesson") — this lesson is that same table, finished;
Lesson 4's own citation of the real reference's silent-fallthrough
behavior ("its switch statement has no default case"); Lesson 28's
`error`-checking convention, which is what actually surfaces this
lesson's starting error message to a real user instead of a crash;
`dict-as-lookup-table.md`.

---

## Concept Unit: `math.floor` — Rounding Down, Not to the Nearest

### The Problem

A real G-code can carry a decimal suffix that still means the same base
code — `G43.1` is a variant of `G43` (tool length compensation), not an
unrelated code. Deciding "which case does this number belong to" means
stripping that suffix down to a whole number — and Python's `round()` is
the wrong tool: `round(43.6)` gives `44`, the wrong family entirely.

### The Concept, Isolated

First real use of `math.floor` in this project. Full isolated treatment
lives in `concepts/python-math-floor.md`, run for real this session:

```python
import math
print(math.floor(43.1))
print(math.floor(43.9))
print(round(43.9))
print(math.floor(-1.5))
```

**Real output, run this session:**
```
43
43
44
-2
```

### Discard

This lab is not part of the project — the real code below applies
`math.floor` to a real G-code value, not `43.1`/`43.9`.

### CS Lens

Per `python-math-floor.md`: `floor` and `round` are different real
rounding modes — always toward negative infinity, versus toward the
nearest value — and the difference genuinely changes the answer, not
just its precision.

### SE Lens

The real reference's own line, `Math.floor(g2)` (`cnc/engineGCodeApply.ts`
line 21), makes the same choice for the same reason: `round()` here
would misfile any G-code past its own `.5` decimal boundary into the
next case entirely.

---

## Concept Unit: Hardcoded Dispatch vs. Data-Driven Dispatch

### The Problem

G-codes and M-codes look like the same kind of problem — "a number that
means a specific action" — but the real reference engine handles them
with two genuinely different mechanisms: `cnc/engineGCodeApply.ts`'s
`applyGCode` is one fixed switch, shared by every real machine
definition; `cnc/engineMCodeApply.ts`'s `applyMCode` reads its mapping
from `machDef.mCodes`, a different real bank per machine. This lesson
only ports the first — understanding why the second is a genuinely
different, separate piece of work is why.

### The Concept, Isolated

Full isolated treatment lives in `concepts/hardcoded-vs-data-driven-dispatch.md`,
run for real this session:

```python
def apply_g_hardcoded(code):
    if code == 0: return "rapid"
    if code == 1: return "linear"
    return "unknown"

MACHINE_M_CODES = {
    "fanuc": {"spindle_cw": [3], "coolant_flood": [8]},
    "okuma": {"spindle_cw": [3, 43], "coolant_flood": [8, 51]},
}

def apply_m_data_driven(code, bank):
    if code in bank["spindle_cw"]: return "spindle_cw"
    if code in bank["coolant_flood"]: return "coolant_flood"
    return "unknown"

print(apply_g_hardcoded(0))
print(apply_m_data_driven(43, MACHINE_M_CODES["okuma"]))
print(apply_m_data_driven(43, MACHINE_M_CODES["fanuc"]))
```

**Real output, run this session:**
```
rapid
spindle_cw
unknown
```

**What this proves:** the identical input, `43`, produces two genuinely
different real answers depending purely on which bank is consulted — the
mapping itself is data, not fixed in the function. `G0` has no such
parameter at all; there's only ever one real answer.

### Discard

This lab is not part of the project — real project code doesn't yet
touch the M-code side at all (named, separate scope below).

### CS Lens

Per `hardcoded-vs-data-driven-dispatch.md`: compile-time versus run-time
configuration — the same real tension between "resolved once, by whoever
wrote the code" and "resolved per real caller, from whatever
configuration they supply."

### SE Lens

This is the real, concrete reason this lesson stops at G-codes: porting
M-codes faithfully would also require porting the relevant slice of
`MACHINE_DEFINITIONS` — a separate, real dependency, not a decision
against doing it. `cnc/machineDefinitions.ts`'s own `haas_mill` bank
confirms this isn't academic — it has real entries (`gearHigh: ["M41"]`,
`doorOpen: ["M80"]`) that `fanuc_mill`'s own bank has no equivalent for
at all.

---

## Project Change (no new concept): Porting `applyGCode` for Real

### The Problem

Everything above is proven in isolation. This unit replaces the old
G-code handling with a faithful, case-by-case port of the real dispatch
table.

### Reference Source, Read for Real This Session

`cnc/engineGCodeApply.ts` (in full — the real, extracted `applyGCode`,
originally `CNCEngine.ts`'s private `_applyGCode` method), and the real
loop that calls it, `cnc/CNCEngine.ts` lines 391–397:
```ts
const gs = this._gList(w);
const ms2 = this._mList(w);
for (const g of gs) {
  applyGCode(ch, ev, g, w, b);
}
```
and `_gList`'s real definition, lines 438–439:
```ts
_gList(w) {
  return w?.G == null ? [] : Array.isArray(w.G) ? w.G : [w.G];
}
```
Real default values for every field this unit touches, confirmed from
`cnc/channelState.ts`'s constructor (lines 68–133) and, for two fields
the constructor doesn't hardcode directly (`cycle`, `retPlane`),
`cnc/machineDefinitions.ts`'s `fanuc_mill.modals` block (`cycle.default:
"G80"`, `retPlane.default: "G98"`).

### Files Affected

`cnc-service/core/parser.py`. Change type: replace (the G-word handling
inside `_parse_block`) + add (a new `_apply_g_code` method, new `Parser`
state fields). Dependencies: Python's standard-library `math` module.

### The New Code

```python
went_home = False
if "G" in words:
    g_values = words["G"] if isinstance(words["G"], list) else [words["G"]]
    for g_value in g_values:
        if self._apply_g_code(g_value, words):
            went_home = True
```

### The Updated Project

`core/parser.py` in full — every line, nothing elided:

```python
import math

from core.lexer import parse_line

_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}

_SPINDLE_CW = 3
_SPINDLE_CCW = 4
_SPINDLE_STOP = 5
_COOLANT_MIST = 7
_COOLANT_FLOOD = 8
_COOLANT_OFF = 9
_SUPPORTED_M_CODES = (
    _SPINDLE_CW,
    _SPINDLE_CCW,
    _SPINDLE_STOP,
    _COOLANT_MIST,
    _COOLANT_FLOOD,
    _COOLANT_OFF,
)

_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S", "H")


class UnsupportedCodeError(Exception):
    pass


class Parser:
    def __init__(self, optional_skip_enabled=False):
        self.current_motion = "G0"
        self.optional_skip_enabled = optional_skip_enabled
        self.current_feed = 0
        self.spindle_rpm = 0
        self.spindle_dir = ""
        self.coolant_flood = False
        self.coolant_mist = False
        # Real fields and real defaults, ported from ChannelState
        # (cnc/channelState.ts's constructor) -- every one of these is set
        # by cnc/engineGCodeApply.ts's real applyGCode, below, faithfully
        # ported case-by-case.
        self.plane = "G17"                              # ← new
        self.units = "mm"                                # ← new
        self.cutter_comp = "G40"                          # ← new
        self.tool_length_comp = "G49"                     # ← new
        self.active_h = 0                                 # ← new
        self.css_speed_max = None                         # ← new
        self.active_wcs = "G54"                           # ← new
        self.cycle = "G80"                                # ← new
        self.pos_mode = "G90"                             # ← new
        self.css_mode = False                             # ← new
        self.css_speed = 0                                # ← new
        self.feed_mode = "G94"                            # ← new
        self.retract_plane = "G98"                        # ← new
        self.home = {"x": 0.0, "y": 0.0, "z": 0.0}         # ← new

    def parse(self, text):
        commands = []
        for raw_line in text.split("\n"):
            stripped = raw_line.strip()
            skip = stripped.startswith("/")
            if skip:
                stripped = stripped[1:].strip()
            words = parse_line(stripped)["words"]
            if not words:
                continue
            if skip and self.optional_skip_enabled:
                continue
            commands.append(self._parse_block(words))
        return commands

    def _parse_block(self, words):
        for letter in words:
            if letter not in _SUPPORTED_WORDS:
                raise UnsupportedCodeError(f"{letter}-word is not supported yet")

        went_home = False                                              # ← new
        if "G" in words:
            g_values = words["G"] if isinstance(words["G"], list) else [words["G"]]  # ← changed
            for g_value in g_values:                                   # ← changed
                if self._apply_g_code(g_value, words):                 # ← changed
                    went_home = True                                   # ← new

        if "M" in words:
            m_values = words["M"] if isinstance(words["M"], list) else [words["M"]]
            for m_value in m_values:
                m_int = int(m_value)
                if m_int not in _SUPPORTED_M_CODES:
                    raise UnsupportedCodeError(
                        f"M{m_int} is not a supported M-code yet"
                    )
                if m_int == _SPINDLE_CW:
                    self.spindle_dir = "CW"
                elif m_int == _SPINDLE_CCW:
                    self.spindle_dir = "CCW"
                elif m_int == _SPINDLE_STOP:
                    self.spindle_dir = ""
                elif m_int == _COOLANT_MIST:
                    self.coolant_mist = True
                elif m_int == _COOLANT_FLOOD:
                    self.coolant_flood = True
                elif m_int == _COOLANT_OFF:
                    self.coolant_flood = False
                    self.coolant_mist = False

        if "S" in words and self.spindle_dir:
            self.spindle_rpm = words["S"]

        if "F" in words:
            self.current_feed = words["F"]

        command = {
            "motion": self.current_motion,
            "feed": self.current_feed,
            "spindle_rpm": self.spindle_rpm,
            "spindle_dir": self.spindle_dir,
            "coolant_flood": self.coolant_flood,
            "coolant_mist": self.coolant_mist,
        }
        for axis in ("X", "Y", "Z"):
            if axis in words:
                command[axis.lower()] = words[axis]
        if went_home:                                                  # ← new
            # Real, unconditional behavior (cnc/engineGCodeApply.ts's G28
            # case): ch.pos.X = ch.home.X, etc. -- overwrites position
            # regardless of any X/Y/Z words also present on this line,
            # exactly as the real engine does.
            command["x"] = self.home["x"]                              # ← new
            command["y"] = self.home["y"]                              # ← new
            command["z"] = self.home["z"]                              # ← new
        return command

    def _apply_g_code(self, g_value, words):                           # ← new
        """Faithful port of cnc/engineGCodeApply.ts's real applyGCode --
        one modal G-code's real effect, ported case-by-case. Returns True
        only for G28 (real position change to home), so the caller can
        apply it to the command being built. The real switch has no
        default case -- an unrecognized G-code silently falls through and
        does nothing, exactly like the reference (named explicitly in
        Lesson 4 as the reference's own real behavior)."""
        g2 = round(g_value * 10) / 10
        g_int = math.floor(g2)

        if g_int in _MOTION_CODES:
            self.current_motion = _MOTION_CODES[g_int]
        elif g_int == 17:
            self.plane = "G17"
        elif g_int == 18:
            self.plane = "G18"
        elif g_int == 19:
            self.plane = "G19"
        elif g_int == 20:
            self.units = "inch"
        elif g_int == 21:
            self.units = "mm"
        elif g_int == 28:
            return True
        elif g_int == 40:
            self.cutter_comp = "G40"
        elif g_int == 41:
            self.cutter_comp = "G41"
        elif g_int == 42:
            self.cutter_comp = "G42"
        elif g_int == 43:
            self.tool_length_comp = "G43"
            if "H" in words:
                self.active_h = words["H"]
        elif g_int == 44:
            self.tool_length_comp = "G44"
        elif g_int == 49:
            self.tool_length_comp = "G49"
        elif g_int == 50:
            if "S" in words:
                self.css_speed_max = words["S"]
        elif g_int in (52, 53):
            pass  # real no-op: local coord shift / machine coord, unmodeled
        elif g_int in (54, 55, 56, 57, 58, 59):
            self.active_wcs = f"G{g_int}"
        elif g_int in (71, 72, 73, 74, 75, 76):
            # Real code sets these unconditionally, with no lathe-class
            # gate (only G70 itself is gated) -- ported exactly as found,
            # even though this project is mill-only and would never
            # realistically see these.
            self.current_motion = f"G{g_int}"
        elif g_int == 80:
            self.current_motion = "G80"
            self.cycle = "G80"
        elif g_int in (81, 82, 83, 84, 85, 86, 87, 88, 89):
            self.current_motion = f"G{g_int}"
            self.cycle = self.current_motion
        elif g_int == 90:
            self.pos_mode = "G90"
        elif g_int == 91:
            self.pos_mode = "G91"
        elif g_int == 92:
            if "S" in words:
                self.css_speed_max = words["S"]
        elif g_int == 94:
            self.feed_mode = "G94"
        elif g_int == 95:
            self.feed_mode = "G95"
        elif g_int == 96:
            self.css_mode = True
            if "S" in words:
                self.css_speed = words["S"]
        elif g_int == 97:
            self.css_mode = False
            if "S" in words:
                self.spindle_rpm = words["S"]
        elif g_int == 98:
            self.retract_plane = "G98"
        elif g_int == 99:
            self.retract_plane = "G99"
        return False
```

Everything above `_apply_g_code` is unchanged from Lessons 4–18 except
the two marked spots: the constructor's new fields, and the G-word
handling now looping and delegating instead of checking one value
inline. `_apply_g_code` itself is the entire new real table.

### Mechanical Walkthrough

Every distinct real case, in order, sorted honestly:

- `g_values = words["G"] if isinstance(...) else [words["G"]]` — **(b)
  reappearing** — the identical multi-value normalization already
  established for `M` (just above, unchanged) — a real, direct port of
  `_gList`'s own `Array.isArray(w.G) ? w.G : [w.G]` shape, now applied to
  `G` for the first time.
- `for g_value in g_values: if self._apply_g_code(...): went_home = True`
  — **(b) reappearing** loop-and-delegate shape, per `_gList`/`for (const
  g of gs) { applyGCode(...) }`; `went_home` — **(a) first appearance**
  of the mechanism — a local flag threading `_apply_g_code`'s one
  real side effect that isn't a plain field mutation (a full position
  override) back out to where the command dict gets built.
- `g2 = round(g_value * 10) / 10; g_int = math.floor(g2)` — **(a) first
  appearance**, per `python-math-floor.md`, direct port of `Math.floor(g2)`.
- `if g_int in _MOTION_CODES: ...` — **(b) reappearing**, Lesson 4's own
  table, now consulted from inside the new dispatcher instead of
  `_parse_block` directly.
- `elif g_int == 17/18/19: self.plane = ...` — **(a) first appearance**
  — plane selection, a real modal field this project never tracked
  before.
- `elif g_int == 20/21: self.units = ...` — **(a) first appearance** —
  units, real but not yet consumed by `MachineState`/the DRO (a named,
  honest gap, not a silent one — nothing downstream reads `self.units`
  yet).
- `elif g_int == 28: return True` — **(a) first appearance** — the one
  case with a real, immediate side effect beyond modal state; deliberately
  returns rather than mutating a field directly, so the caller can apply
  it to the actual command being built.
- `elif g_int == 40/41/42: self.cutter_comp = ...` / `elif g_int ==
  43/44/49: self.tool_length_comp = ...` (43 also reading `H`) — **(a)
  first appearance** of both fields; **(b) reappearing** the `if "H" in
  words` conditional-read shape, already established for `S`/`F` above.
- `elif g_int == 50/92: if "S" in words: self.css_speed_max = ...` — **(a)
  first appearance** — two real, different G-codes converging on the
  identical real field, ported exactly as the reference does (not
  simplified into one case, since they're genuinely two separate real
  codes that happen to do the same thing).
- `elif g_int in (52, 53): pass` — **(a) first appearance of the
  decision to do nothing** — real, recognized codes with a real,
  documented no-op in the reference itself, not an omission.
- `elif g_int in (54..59): self.active_wcs = f"G{g_int}"` — **(a) first
  appearance** — six real work-offset codes, one field, an f-string
  building the label instead of six separate branches (a small, real
  simplification of six identical-shaped reference cases into one).
- `elif g_int in (71..76): self.current_motion = f"G{g_int}"` — **(a)
  first appearance** — real lathe cycle codes, ported exactly including
  the real, honest quirk that only `G70` (not shown as its own branch
  here at all) is gated on lathe class in the reference; omitting `G70`
  entirely produces the identical real result (a no-op) for this
  project's mill-only model, since the gate would never pass anyway.
- `elif g_int == 80: ...` / `elif g_int in (81..89): ...` — **(a) first
  appearance** — canned-cycle codes, each setting both `current_motion`
  and `cycle` together, exactly as the reference's own two-assignment
  cases do.
- `elif g_int == 90/91: self.pos_mode = ...` — **(a) first appearance**.
- `elif g_int == 94/95: self.feed_mode = ...` — **(a) first appearance**.
- `elif g_int == 96/97: self.css_mode = ...` — **(a) first appearance** —
  `97` also reading `S` into `self.spindle_rpm` specifically (not a new
  `css_speed`-like field) — ported exactly as the reference's own
  `ch.rpm = w.S` line does.
- `elif g_int == 98/99: self.retract_plane = ...` — **(a) first
  appearance** — the reference's own `if (lathe) ... else ...` branch,
  narrowed to only the non-lathe half, since this project has no lathe
  concept to branch on at all.
- `return False` — **(c) already basic** — the default path for every
  case that isn't `G28`.

### CS Lens

Per `dict-as-lookup-table.md`'s own SE Lens, now confirmed in the real
project rather than just reasoned about: this dispatcher stays an
`if`/`elif` chain, not a dict, specifically because most of its real
cases *mutate different fields*, not return one shared kind of value —
exactly the case that concept file already named as unsuited to a plain
value-lookup dict.

### SE Lens

The real, honest limit: several of these fields (`units`, `plane`,
`cutter_comp`, `pos_mode`, and others) are now tracked correctly but
consumed by nothing downstream yet — `MachineState`/the DRO only ever
read `motion`/`feed`/`spindle_*`/`coolant_*`. That's a real, named,
future gap, not a silent one: the state is real and correct the moment
something needs it, rather than needing to be re-derived from scratch
later.

### Commands

None new — `math` is standard library, already available.

### Run It — Real Output

```
$ python -c "from core.parser import Parser; print(Parser().parse('G21 G90 G17 G40 G49 G80'))"
[{'motion': 'G80', 'feed': 0, 'spindle_rpm': 0, 'spindle_dir': '', 'coolant_flood': False, 'coolant_mist': False}]
```
The original crash line, fixed — `motion` correctly lands on `"G80"`
(the real, last-applied case in the list, since `G80` itself sets
`current_motion`, confirmed directly from the real switch, not assumed).

Full regression, run live, this session:
```
Lesson 4 example (G0 X10 Y20 / X30 / G1 Z-5 F100): unchanged, all three
commands identical to Lesson 4's own recorded output.
DEFAULT_PROGRAM (M3 S1000...M8): unchanged, 6 path points, spindle_dir
"CW", spindle_rpm 1000, coolant_flood True at the end.
```

Against the real, running server (not just direct calls):
```
$ curl -X POST http://127.0.0.1:5000/api/path -d '{"program": "<real O0002.nc>"}'
{"error": "T-word is not supported yet"}
status: 400
```
One real line further than before — `O0002.nc` now fails on its
*next* real gap (`T2 M06`, tool change), not the one this lesson fixes.
That gap is real, already investigated (`hardcoded-vs-data-driven-dispatch.md`'s
own SE Lens names exactly why it's a separate piece of work), and
deliberately not touched here.

---

## Connect the Pieces

Follow `O0002.nc`'s real second line, `G21 G90 G17 G40 G49 G80`, start to
finish:

1. The lexer (unchanged, Lessons 2–3) tokenizes it into one real,
   repeated-letter word: `{"G": [21.0, 90.0, 17.0, 40.0, 49.0, 80.0]}`.
2. `_parse_block` sees `"G" in words`, and since the value is already a
   list, loops over all six real values — where the old code raised
   immediately on seeing a list at all.
3. Each value goes through `_apply_g_code` in order: `21` → `self.units
   = "mm"`; `90` → `self.pos_mode = "G90"`; `17` → `self.plane = "G17"`;
   `40` → `self.cutter_comp = "G40"`; `49` → `self.tool_length_comp =
   "G49"`; `80` → `self.current_motion = "G80"`, `self.cycle = "G80"`.
4. None of the six return `True` (only `G28` does), so `went_home` stays
   `False` — no position override.
5. The command dict comes back with `motion: "G80"` — the real, last
   real motion-affecting code on that real line — and the line that used
   to crash the whole request now produces one real, correct command.

## What Breaks Without This

Reverting `_apply_g_code`'s call site back to the original inline check:
```python
if "G" in words:
    g_value = words["G"]
    if isinstance(g_value, list):
        raise UnsupportedCodeError(f"multiple G words on one line not supported yet: {g_value}")
```
Real, reproduced-live behavior: the exact same real request this lesson
fixed — `O0002.nc`'s line 2 — returns `400`,
`{"error": "multiple G words on one line not supported yet: [21.0, 90.0, 17.0, 40.0, 49.0, 80.0]"}`,
the identical failure this whole lesson exists to close.

## Exercises

1. Wire `self.units`/`self.plane`/`self.pos_mode` into `MachineState`
   and the DRO's own display — the real, named gap this lesson leaves
   open — and verify live that switching a real program between `G20`
   and `G21` actually changes what the DRO shows.
2. Send a real `G43.1 H2` line (the fractional tool-length-offset variant
   named in `python-math-floor.md`'s own exercises) and confirm it's
   correctly treated as `G43` — tracing exactly how `round(43.1 * 10) /
   10` then `math.floor(...)` produces `43`.
3. Using `hardcoded-vs-data-driven-dispatch.md`'s own real citation,
   read `cnc/machineDefinitions.ts`'s `haas_mill.mCodes` bank yourself
   and list every real M-code it recognizes that `fanuc_mill` doesn't —
   the real scope the eventual M-code lesson will have to account for.

## Definition of Done

- [ ] `O0002.nc`'s real line 2 (`G21 G90 G17 G40 G49 G80`) parses without
      error, `motion` lands on `"G80"` — verified live.
- [ ] Lesson 4's own original example and the app's `DEFAULT_PROGRAM`
      both produce unchanged output — verified live, not assumed.
- [ ] `O0002.nc` against the real running server now fails on `T-word`
      (a real, separate, later gap), not `multiple G words`.
- [ ] The M-code section is unchanged from before this lesson.
- [ ] `concepts/python-math-floor.md` and
      `concepts/hardcoded-vs-data-driven-dispatch.md` exist, each with
      real, executed output.
- [ ] `git commit` — message explaining that this closes a real crash by
      reading and porting the real, tested engine table this project's
      backend is a port of, and naming T-word/M06 as the next real,
      separate piece.
