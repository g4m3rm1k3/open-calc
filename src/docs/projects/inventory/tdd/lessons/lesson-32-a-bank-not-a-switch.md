# Lesson 32: A Bank, Not a Switch

**What you will build:** `core/parser.py` recognized only six M-codes
(`M3`–`M5`, `M7`–`M9`) via a fixed list, and raised on everything else —
including `M06` (tool change), the real, next gap `O0002.nc` hits after
Lesson 29's G-code fix. Lesson 29's own "Hardcoded Dispatch vs.
Data-Driven Dispatch" concept unit named why this couldn't be a smaller
version of that same fix: the real reference's `applyMCode` doesn't
switch on fixed M-numbers at all — it reads a per-machine `mCodes` bank
and matches against it generically. This lesson ports that actual
mechanism — a bank plus a generic matcher — not a bigger hardcoded list
with `M6` added to it. The transferable point: two functions that look
like "the same kind of dispatch, just for different codes" can be
genuinely different mechanisms, and porting the *shape* faithfully
matters as much as porting the individual cases.

**What you need to know first:** Lesson 29's own
`concepts/hardcoded-vs-data-driven-dispatch.md`, and its real citation
that `haas_mill`'s own `mCodes` bank has entries (`gearHigh: ["M41"]`,
`doorOpen: ["M80"]`) `fanuc_mill`'s bank has no equivalent for at all —
this lesson is that same real shape, ported for the first time.

---

## Project Change (no new concept): Porting `applyMCode` for Real

### The Problem

Confirmed directly, this session, against the real, unmodified code:

```python
Parser().parse("T2 M06")
# UnsupportedCodeError: T-word is not supported yet
```
`T` wasn't even a recognized word yet, let alone `M06` a recognized
M-code — `O0002.nc`'s own real line 3 (`T2 M06 G43 H2`).

### Reference Source, Read for Real This Session

`cnc/engineMCodeApply.ts`'s real `applyMCode`, in full. The real
mechanism (lines 27–33):
```ts
const def = ch.machDef.mCodes || {};
const match = (arr) => {
  if (!Array.isArray(arr)) return false;
  return arr.some((code) => {
    const n = Number(String(code).replace(/[^0-9.+-]/g, ""));
    return Number.isFinite(n) && n === Number(m);
  });
};
```
followed by a sequence of independent checks — `if (match(def.spindleCW))
{ ... }`, `if (match(def.spindleCCW)) { ... }`, and so on — **not** an
if/else chain. `cnc/machineDefinitions.ts`'s real `fanuc_mill.mCodes`
bank (lines 70–90), the slice this project's mill-only model uses:
```ts
mCodes: {
  programStop: ["M00"],
  optionalStop: ["M01"],
  programEnd: ["M30", "M02"],
  spindleCW: ["M03"],
  spindleCCW: ["M04"],
  spindleStop: ["M05"],
  toolChange: ["M06"],
  coolantFlood: ["M08"],
  coolantMist: ["M07"],
  coolantOff: ["M09"],
  spindleOrient: ["M19"],
  // + subCall/subReturn/chuckOpen/tailstock/partCatcher/airBlast/
  //   coolantTap -- real entries this project has no concept for yet
},
```

### An Earlier Draft, Caught and Corrected Before Committing

The first version of this port, written before re-reading
`engineMCodeApply.ts`'s own source directly, hardcoded `if m_int == 3:
...`/`elif m_int == 6: ...` — a bigger version of the exact hardcoded
shape Lesson 29 already ported for G-codes, and the exact mistake that
lesson's own concept unit named as the reason M-codes needed separate,
later treatment. It produced identical *output* for every real case this
project exercises, but ported the wrong *mechanism* — silently
abandoning the real bank-plus-matcher shape for a fixed switch, which
would have made adding a second real machine definition (Lesson 29's own
named `haas_mill` example) require rewriting this method instead of just
adding a bank entry. Caught by re-reading the reference before writing
this lesson; replaced with the version below before any of it was
committed.

### Files Affected

`cnc-service/core/parser.py`. Change type: add (`_FANUC_MILL_M_CODES`,
`_m_code_matches`, a rewritten `_apply_m_code`, new `Parser` state
fields, `"T"` added to `_SUPPORTED_WORDS`) + fix (the G-code dispatch
order comment now applies for real, since M-codes finally short-circuit
correctly on program end).

### The New Code

```python
def _m_code_matches(bank_key, m_int):
    for code in _FANUC_MILL_M_CODES.get(bank_key, ()):
        digits = "".join(ch for ch in code if ch.isdigit() or ch in "+-.")
        if digits and float(digits) == m_int:
            return True
    return False
```

### The Updated Project

`core/parser.py`'s new module-level bank and matcher:

```python
_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}

_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S", "H", "T")

# Real, data-driven port of cnc/machineDefinitions.ts's fanuc_mill.mCodes
# bank -- the slice this project's mill-only model actually uses. The
# real bank also carries chuckOpen/tailstock/partCatcher/subCall/subReturn
# entries this project has no concept for yet (lathe-class hardware,
# subprogram storage) -- named, not ported, since nothing here could
# consume them regardless of the mechanism.
_FANUC_MILL_M_CODES = {
    "spindle_cw": ("M03",),
    "spindle_ccw": ("M04",),
    "spindle_stop": ("M05",),
    "tool_change": ("M06",),
    "coolant_mist": ("M07",),
    "coolant_flood": ("M08",),
    "coolant_off": ("M09",),
    "spindle_orient": ("M19",),
    "program_stop": ("M00",),
    "optional_stop": ("M01",),
    "program_end": ("M30", "M02"),
}


def _m_code_matches(bank_key, m_int):
    """Real port of cnc/engineMCodeApply.ts's own `match()` closure:
    strips every non-numeric character from each real code string in the
    bank ("M00" -> "00" -> 0.0) and compares against the block's actual
    M-value -- not a fixed Python int comparison against a hardcoded
    number, so the *mechanism* (a per-machine bank, matched generically)
    is what's ported, not just today's fanuc_mill numbers."""
    for code in _FANUC_MILL_M_CODES.get(bank_key, ()):
        digits = "".join(ch for ch in code if ch.isdigit() or ch in "+-.")
        if digits and float(digits) == m_int:
            return True
    return False
```

`Parser.__init__` in full, with the four new fields marked — everything
above them is unchanged from Lesson 31:

```python
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
        self.plane = "G17"
        self.units = "mm"
        self.cutter_comp = "G40"
        self.tool_length_comp = "G49"
        self.active_h = 0
        self.css_speed_max = None
        self.active_wcs = "G54"
        self.cycle = "G80"
        self.pos_mode = "G90"
        self.css_mode = False
        self.css_speed = 0
        self.feed_mode = "G94"
        self.retract_plane = "G98"
        self.home = {"x": 0.0, "y": 0.0, "z": 0.0}
        # Real fields, ported from ChannelState's own real defaults        # ← new
        # (cnc/channelState.ts: activeT=0, activeH=0, pendingT=0) and set  # ← new
        # by cnc/engineMCodeApply.ts's real applyMCode, below, for this    # ← new
        # project's one real machine definition (fanuc_mill's own mCodes  # ← new
        # bank, cnc/machineDefinitions.ts).                                # ← new
        self.active_t = 0                                                  # ← new
        self.pending_t = 0                                                 # ← new
        self.done = False                                                  # ← new
        self.waiting = None                                                # ← new
```

`_parse_block` in full, with every piece this lesson adds or changes
marked in place — the letter-support check and the G-word loop above the
M-word block are unchanged from Lesson 31:

```python
    def _parse_block(self, words):
        for letter in words:
            if letter not in _SUPPORTED_WORDS:
                raise UnsupportedCodeError(f"{letter}-word is not supported yet")

        went_home = False
        if "G" in words:
            g_values = words["G"] if isinstance(words["G"], list) else [words["G"]]
            for g_value in g_values:
                if self._apply_g_code(g_value, words):
                    went_home = True

        program_ended = False                                              # ← new
        if "M" in words:
            m_values = words["M"] if isinstance(words["M"], list) else [words["M"]]
            for m_value in m_values:
                if self._apply_m_code(m_value, words):                     # ← changed (was an inline elif chain on m_int)
                    program_ended = True                                   # ← new
                    break                                                  # ← new

        # Real dispatch order (cnc/CNCEngine.ts's _executeBlock, per       # ← new
        # COMPONENT_MAP.md's own citation): G-codes, then M-codes, then    # ← new
        # T/D/F/S/H words, then motion -- an M-code that returns truthy    # ← new
        # (program end) short-circuits everything after it in the same    # ← new
        # block, exactly like the real engine.                            # ← new
        if not program_ended:                                              # ← new
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
            "pos_mode": self.pos_mode,
        }
        if not program_ended:                                              # ← new
            for axis in ("X", "Y", "Z"):
                if axis in words:
                    command[axis.lower()] = words[axis]
        if went_home:
            command["went_home"] = True
        return command
```

Before this lesson, `words["M"]` was resolved by an inline `elif` chain
on a fixed `_SUPPORTED_M_CODES` tuple, right here inside `_parse_block`,
with no way to signal "program ended" back out. Now every M-value is
handed to `_apply_m_code` (below), and its real, data-driven return value
is what `program_ended` tracks — which is also what the new dispatch-order
gate on the `S`/`F` capture and the axis loop actually has to consult for
the first time; before this lesson that comment cited a dispatch order
with nothing yet able to violate it.

`_apply_m_code` itself, in full:

```python
    def _apply_m_code(self, m_value, words):
        """Faithful port of cnc/engineMCodeApply.ts's real applyMCode --
        a real, data-driven dispatch (see _m_code_matches/_FANUC_MILL_M_CODES
        above), not a fixed switch: every check below is an independent
        `if`, exactly like the reference's own sequence of `if
        (match(def...))` statements, not an if/elif chain -- in the real
        engine, two differently-named bank entries could share the same
        real M-number on some machine and both fire, and the mechanism
        ported here preserves that even though fanuc_mill's own bank
        happens not to exercise it. Returns True only for program end
        (M02/M30), matching the real code's own early-exit signal.
        M98/M99 (subroutine call/return) aren't ported -- this project has
        no subprogram storage at all yet, a separate, real piece of work.
        An M-code matching nothing in the bank is a silent no-op, not a
        raise -- the real applyMCode has no fallback error path either."""
        m_int = int(m_value)

        if _m_code_matches("spindle_cw", m_int):
            self.spindle_dir = "CW"
            if "S" in words:
                self.spindle_rpm = words["S"]
        if _m_code_matches("spindle_ccw", m_int):
            self.spindle_dir = "CCW"
            if "S" in words:
                self.spindle_rpm = words["S"]
        if _m_code_matches("spindle_stop", m_int):
            self.spindle_dir = ""
        if _m_code_matches("coolant_mist", m_int):
            self.coolant_mist = True
        if _m_code_matches("coolant_flood", m_int):
            self.coolant_flood = True
        if _m_code_matches("coolant_off", m_int):
            self.coolant_flood = False
            self.coolant_mist = False
        if _m_code_matches("tool_change", m_int):
            if "T" in words:
                self.active_t = words["T"]
                self.active_h = words["T"]
                self.pending_t = words["T"]
            elif self.pending_t is not None:
                self.active_t = self.pending_t
                self.active_h = self.pending_t
        if _m_code_matches("spindle_orient", m_int):
            pass  # real no-op: spindle orient, unmodeled
        if _m_code_matches("program_stop", m_int):
            self.waiting = {"type": "M00"}
        if _m_code_matches("optional_stop", m_int):
            pass  # real no-op unless ch.optSkip, never modeled as true
            # here (matches the real engine's own default -- COMPONENT_MAP.md's
            # own citation: "M01 with the optional-stop switch on produces
            # literally zero observable effect" even in the reference itself).
        if _m_code_matches("program_end", m_int):
            self.done = True
            return True
        return False
```

### Mechanical Walkthrough

- `_FANUC_MILL_M_CODES` — **(a) first appearance** — a real data bank,
  keyed by category, each value a tuple of real code strings, directly
  mirroring `fanuc_mill.mCodes`'s own shape; `(b) reappearing` — dict
  literal syntax itself, unchanged since Lesson 4's `_MOTION_CODES`.
- `_m_code_matches(bank_key, m_int)` — **(a) first appearance** — a real
  port of the reference's own `match()` closure, including its exact
  digit-stripping approach (`"".join(ch for ch in code if ch.isdigit() or
  ch in "+-.")`, ported from `code.replace(/[^0-9.+-]/g, "")`) rather than
  a simpler `code[1:]` slice, since the real function is written to
  tolerate code strings that aren't just `"M"` plus digits.
- `if _m_code_matches(...): ...` (repeated, unindented from each other) —
  **(a) first appearance** — independent checks, not `elif`, a real,
  deliberate structural choice ported from the reference's own sequence
  of separate `if (match(...))` statements — genuinely different from
  `_apply_g_code`'s `elif` chain one method above it.
- `program_ended` / `if not program_ended: ...` (twice — the
  `S`/`F` capture, then the axis loop) — **(a) first appearance** of the
  mechanism being real and load-bearing; the comment citing
  `_executeBlock`'s dispatch order was already present since Lesson 29,
  but had nothing to actually gate until this lesson gave `_apply_m_code`
  a real way to signal program end.
- `self.active_t`/`self.pending_t`/`self.done`/`self.waiting` — **(a)
  first appearance** — real `ChannelState` fields, previously entirely
  absent from this project.
- `"T"` added to `_SUPPORTED_WORDS` — **(a) first appearance** — the
  actual fix for the crash this lesson opened with.

### Execution Trace

`_apply_m_code`'s own body is 11 independent `if _m_code_matches(...)`
checks run in a fixed order every single call, with `program_ended`
carried into how the *next* call's caller behaves — traced against the
real program `T2 M06 / M03 S2000 / X10 F50 S9999 / M02`, the same one
already run live above:

```
Call 1 (line "T2 M06"): m_int = 6
  spindle_cw  ("M03"→3.0):  6 != 3.0  → False
  spindle_ccw ("M04"→4.0):  6 != 4.0  → False
  spindle_stop("M05"→5.0):  6 != 5.0  → False
  coolant_mist("M07"→7.0):  6 != 7.0  → False
  coolant_flood("M08"→8.0): 6 != 8.0  → False
  tool_change ("M06"→6.0):  6 == 6.0  → True
    "T" in words → active_t = active_h = pending_t = 2.0
  spindle_orient/program_stop/optional_stop/program_end: none match 6
  return False (program not ended)

Call 2 (line "M03 S2000"): m_int = 3
  spindle_cw ("M03"→3.0): 3 == 3.0 → True
    spindle_dir = "CW"; "S" in words → spindle_rpm = 2000.0
  every other check: no match
  return False

Call 3 (line "M02"): m_int = 2
  spindle_cw..optional_stop: no match
  program_end ("M30"→30.0): 2 != 30.0 → False
  program_end ("M02"→2.0):  2 == 2.0  → True
    self.done = True
  return True  ← program_ended
```

`program_ended` is reset to `False` at the top of every `_parse_block`
call (one call per line) — Call 3's own `True` only ever gates *that same
line's* own `S`/`F`/axis-word capture, not a later line's. That's exactly
what the real output above already shows: the `M02` line carries no new
`x`/`s`/`f` of its own, because `program_ended` had already flipped `True`
earlier in that same call, before that line's own axis-word gate ran.

### CS Lens

Per `hardcoded-vs-data-driven-dispatch.md`, now confirmed against the
real mechanism instead of a lab standing in for it: the same real input
(`m_int = 6`) is resolved by consulting `_FANUC_MILL_M_CODES["tool_change"]`
at the moment `_apply_m_code` runs, not by a branch baked into the
function's own source the way `_apply_g_code`'s `elif g_int == ...`
chain is. Swapping in a different bank (a `haas_mill` dict, say) would
change the answer with zero edits to `_apply_m_code` itself.

**REAPPEARING** (Lesson 3's `open-closed-principle.md`): this is that
same principle, now with a real, working second axis to prove it —
`_apply_m_code`'s own logic is *closed* for modification (Exercise 1 has
you add a whole new machine's M-code bank without touching it at all) but
*open* for extension (a new bank is just a new dict, `_FANUC_MILL_M_CODES`
alongside it). Lesson 3's own version of OCP was about tolerating one new
letter; this one is the fuller shape — an entire new machine's worth of
behavior, added as pure data.

### SE Lens

The real, honest limit named in the code's own comment: `chuckOpen`,
`tailstock`, `partCatcher`, `subCall`, `subReturn`, `coolantTap`, and
`airBlast` are real entries in `fanuc_mill.mCodes` that this port simply
doesn't carry — not because the *mechanism* couldn't hold them, but
because this project has no chuck/tailstock/subprogram concept for them
to drive yet. Adding them later is exactly the "add a bank entry, not a
new branch" story this lesson's own concept unit is about — the real
test of whether the mechanism, not just the cases, was actually ported
faithfully.

### Commands

None new.

### Run It — Real Output

```
$ python -c "from core.parser import Parser; print(Parser().parse('T2 M06'))"
[{'motion': 'G0', 'feed': 0, 'spindle_rpm': 0, 'spindle_dir': '', 'coolant_flood': False, 'coolant_mist': False, 'pos_mode': 'G90'}]
```
No crash — `T2 M06` now parses; `active_t`/`active_h`/`pending_t` all
become `2.0` on the `Parser` instance (confirmed directly).

Program-end short-circuit, run live this session:
```
$ python -c "
from core.parser import Parser
p = Parser()
for c in p.parse('T2 M06\nM03 S2000\nX10 F50 S9999\nM02'):
    print(c)
print(p.active_t, p.active_h, p.done)
"
{'motion': 'G0', ..., 'pos_mode': 'G90'}
{'motion': 'G0', ..., 'spindle_rpm': 2000.0, 'spindle_dir': 'CW', 'pos_mode': 'G90'}
{'motion': 'G0', ..., 'feed': 50.0, 'spindle_rpm': 9999.0, 'spindle_dir': 'CW', 'pos_mode': 'G90', 'x': 10.0}
{'motion': 'G0', ..., 'feed': 50.0, 'spindle_rpm': 9999.0, 'spindle_dir': 'CW', 'pos_mode': 'G90'}
2.0 2.0 True
```
The final `M02` line carries no new `x`/`s`/`f` — `program_ended` gated
them, exactly as the real dispatch order requires.

Full regression, run live, this session:
```
Lesson 4 example: unchanged.
DEFAULT_PROGRAM: unchanged, 6 path points.
```

Against `O0002.nc` directly:
```
$ python -c "from core.parser import Parser; Parser().parse(open('O0002.nc').read())"
core.parser.UnsupportedCodeError: R-word is not supported yet
```
One real line further — `O0002.nc`'s line 13 (`G81 Z-10. R3. F80`, a
real canned cycle), the real, next, already-visible gap. Canned-cycle
geometry is separate, later scope.

---

## Connect the Pieces

Follow `O0002.nc`'s real line 3, `T2 M06 G43 H2`, start to finish:

1. `_parse_block` sees `"T" in words` — now legal, since `_SUPPORTED_WORDS`
   includes it — but `T` itself is never read directly in `_parse_block`;
   it only matters to whichever M-code consults `words["T"]`.
2. `"G" in words` → `_apply_g_code(43, ...)` runs first (real dispatch
   order): sets `tool_length_comp = "G43"`, reads `words["H"] = 2.0` into
   `active_h`.
3. `"M" in words` → `_apply_m_code(6, words)`. `_m_code_matches("tool_change",
   6)` is `True` (`"M06"` strips to `6.0`), so `words["T"] = 2.0` is read:
   `active_t = active_h = pending_t = 2.0` — `active_h` gets overwritten
   again here, to the same value `G43 H2` just set it to, a real,
   harmless coincidence of this specific line, not a general guarantee.
4. `_apply_m_code` returns `False` (not a program-end code) —
   `program_ended` stays `False`.
5. `S`/`F` capture and the axis loop both run normally (nothing gates
   them) — no `X`/`Y`/`Z`/`S`/`F` words are on this line anyway, so the
   command comes back with just modal state, no crash.

## What Breaks Without This

Reverting `_SUPPORTED_WORDS` to omit `"T"` (Lesson 31's own list):
```python
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S", "H")
```
Real, reproduced-live behavior: `Parser().parse("T2 M06")` raises
`UnsupportedCodeError: T-word is not supported yet` — the exact crash
this lesson opened with, and the real, next line `O0002.nc` hits after
Lesson 30/31's fixes clear everything before it.

## Exercises

1. Add a second real machine bank, `_OKUMA_LATHE_M_CODES` (or any name),
   with `"tool_change": ("M06", "M42")` — a real, plausible lathe variant
   where `M42` also triggers a tool change — and confirm
   `_m_code_matches("tool_change", 42, bank=...)` (you'll need to thread a
   `bank` parameter through, since the current code hardcodes
   `_FANUC_MILL_M_CODES`) resolves correctly against the new bank without
   touching `_apply_m_code`'s own logic at all.
2. `_apply_m_code` uses independent `if`s, not `elif`. Construct a
   (synthetic, not real-`fanuc_mill`) bank where `spindle_cw` and
   `coolant_flood` share the same real number, and confirm both real
   effects fire for that one M-code — something an `elif` chain could
   never do.
3. Using this lesson's own "SE Lens," pick one real, un-ported bank entry
   (`chuckOpen`, say) and write down, in plain English, what would have
   to exist in this project (a chuck concept in `MachineState`? the DRO?)
   before porting it would produce any observable effect at all.

## Definition of Done

- [ ] `T2 M06` parses without error; `active_t`/`active_h`/`pending_t`
      all become the real tool number — verified live.
- [ ] An M-code matching nothing in `_FANUC_MILL_M_CODES` is a silent
      no-op, not a raise — verified live (e.g. `M50`, a real coolant-tap
      code this bank doesn't carry).
- [ ] `M02`/`M30` short-circuits `S`/`F`/axis-word application on the
      same line — verified live.
- [ ] Lesson 4's own original example and the app's `DEFAULT_PROGRAM`
      both produce unchanged output — verified live.
- [ ] `O0002.nc` against the real parser now fails on the already-named
      `R`-word/canned-cycle gap (line 13), not `T`-word.
- [ ] `git commit` — message explaining that this ports `applyMCode`'s
      real, data-driven mechanism (a bank plus a generic matcher), not a
      bigger hardcoded switch, naming an earlier, hardcoded draft that
      was caught and replaced before committing.
