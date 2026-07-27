# Lesson 16: A Real DRO — Spindle, Feed, and Coolant

## What you will build

Real spindle and coolant state (`M3`/`M4`/`M5` direction, `S` speed,
`M7`/`M8`/`M9` coolant), real modal feed tracking (`F`), and — the actual
point of this lesson — a DRO (Digital Readout) panel in `cnc-web` ported
directly from the real reference's own JSX and embedded CSS, not
invented. This lesson also corrects course mid-build: a first draft of
the DRO component was written from inferred structure before the real
source was read, caught and rebuilt before being shipped.

## What you need to know first

Lesson 4: `Parser`'s modal-state pattern (`current_motion`). Lesson 5:
`MachineState.apply()`. Lesson 13/15: React components fetching typed
JSON. This lesson extends all three; no prior lesson's behavior changes.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/python-normalize-scalar-or-list.md`
- `../concepts/css-flexbox-layout.md`
- `../concepts/css-grid-layout.md`
- `../concepts/typescript-as-const-assertion.md`

## No pipeline diagram change

Spindle/feed/coolant are real machine state, same pipeline stage
(`Machine State`) Lesson 5 already built — this lesson adds fields to
it, not a new stage.

---

## Concept Unit: A Real Correction, Named Honestly

### What Happened

A first version of this lesson's DRO component was written from this
project's own prior research (`ChannelState`'s field names, read for
Lesson 5/8) rather than from the real, rendered JSX that actually
produces the reference app's DRO panel. Before it was wired in or
verified, you provided two real screenshots of the actual, running
reference application (now saved in this workspace as
`Screenshot 2026-07-19 141708.png` and `Screenshot 2026-07-19
141802.png`) and said, directly: don't stray from rebuilding the real,
working app. That was the right correction, and it's the entire reason
`LessonContract`'s "Reading the Real Source" section exists — a session
can genuinely believe it's building the real thing while actually
building a plausible-sounding approximation, and the only real defense
is reading the actual source, this session, before writing the real
code, not after.

### Reference Source, Read for Real This Session — After the Correction

`cnc-sim/cnc/CNCSim.tsx` lines 4568–4641, the actual JSX rendering the
DRO tab's "Work Position" and "Spindle / Feed" sections (quoted
verbatim):
```tsx
<div className="sec">Work Position</div>
{mach.axes.map((ax) => (
  <div className="dro" key={ax}>
    <span className="dro-ax" style={{ color: axisColor(ax) }}>{ax}</span>
    <span className="dro-num" style={{ color: ax === "Z" ? C.blue2 : C.txt }}>
      {(ms.pos[ax] || 0).toFixed(4)}
    </span>
    <span className="dro-unit">{mach.rotary.includes(ax) ? "°" : "mm"}</span>
  </div>
))}
{/* ...Machine (G53) section, deferred — see below... */}
<div className="sec">Spindle / Feed</div>
<div className="sgrid">
  <div className="sbox">
    <div className="sbox-l">Spindle</div>
    <div className="sbox-v" style={{ color: C.blue2 }}>{ms.rpm} RPM</div>
  </div>
  <div className="sbox">
    <div className="sbox-l">Dir</div>
    <div className="sbox-v" style={{ color: ms.dir === "CW" ? C.green2 : ms.dir === "CCW" ? C.amber2 : C.txt3 }}>
      {ms.dir || "OFF"}
    </div>
  </div>
  <div className="sbox">
    <div className="sbox-l">Feed</div>
    <div className="sbox-v" style={{ color: C.amber2 }}>{ms.feed}</div>
  </div>
  <div className="sbox">
    <div className="sbox-l">Coolant</div>
    <div className="sbox-v" style={{ color: ms.coolant ? C.teal : C.txt3 }}>
      {ms.coolant ? "ON" : "OFF"}
    </div>
  </div>
</div>
```
And the real `axisColor` function, line 4055:
```tsx
const axisColor = (ax) =>
  ax === "X" ? C.red : ax === "Y" ? C.green : ax === "Z" ? C.blue
    : ax === "B" ? C.purple : C.amber;
```
And the real, embedded stylesheet (`getCSS()`, lines 1688–1701) —
`.sec`/`.dro`/`.dro-ax`/`.dro-num`/`.dro-unit`/`.sgrid`/`.sbox`/`.sbox-l`/
`.sbox-v` — the exact real CSS this lesson ports into `theme.css`,
verbatim, only substituting this project's own token names for the
reference's inline `C.*` color references.

**Named, deliberate, honest scope, confirmed against the real
screenshots, not just the source:** the real DRO tab also has a
"Machine (G53)" section (`ms.mpos` — real machine coordinates, distinct
from work coordinates, requiring real work-offset support this project
hasn't built yet) and "Progress"/"Diagnostics" sections (real block-by-
block execution stepping and path statistics, neither built yet). This
lesson ports **only** "Work Position" and "Spindle / Feed" — the two
sections this project's real, current data can honestly support — the
rest are named, deferred gaps, not silently dropped.

---

## Concept Unit: Spindle Direction and Speed, Ported

### Reference Source, Read for Real This Session

`cnc/CNCEngine.ts` lines 1898–1908, inside `_applyMCode`:
```ts
if (match(def.spindleCW)) {
  ch.dir = "CW";
  if (w.S != null) ch.rpm = w.S;
}
if (match(def.spindleCCW)) {
  ch.dir = "CCW";
  if (w.S != null) ch.rpm = w.S;
}
if (match(def.spindleStop)) {
  ch.dir = "";
}
```
And line 1725: `if (w.S != null && ch.dir) ch.rpm = ev.resolve(w.S) ?? w.S;`
— a **second**, more general place `S` takes effect, independent of
whether `M3`/`M4` appears on the *same* line, gated only on the spindle
already being on (`ch.dir` truthy). And the real, per-machine-definition
M-code mapping, confirmed identical across every real machine definition
checked (`CNCEngine.ts` lines 110–117, 282–287, and more): `M03` →
spindle CW, `M04` → spindle CCW, `M05` → spindle stop, `M07` → coolant
mist, `M08` → coolant flood, `M09` → coolant off. **Named, deliberate
scope:** the reference reads these from a per-dialect `machDef.mCodes`
config (`MACHINE_DEFINITIONS`, this project's build-order priority #4,
not built yet); this lesson hardcodes the one real, confirmed-universal
mapping directly, the same deliberate simplification already applied to
comment delimiters (Lesson 3).

### The New Code

```python
_SPINDLE_CW = 3
_SPINDLE_CCW = 4
_SPINDLE_STOP = 5
_COOLANT_MIST = 7
_COOLANT_FLOOD = 8
_COOLANT_OFF = 9
_SUPPORTED_M_CODES = (
    _SPINDLE_CW, _SPINDLE_CCW, _SPINDLE_STOP,
    _COOLANT_MIST, _COOLANT_FLOOD, _COOLANT_OFF,
)
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F", "M", "S")
```
```python
if "M" in words:
    m_values = words["M"] if isinstance(words["M"], list) else [words["M"]]
    for m_value in m_values:
        m_int = int(m_value)
        if m_int not in _SUPPORTED_M_CODES:
            raise UnsupportedCodeError(f"M{m_int} is not a supported M-code yet")
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
```

### Mechanical Walkthrough

- `words["M"] if isinstance(words["M"], list) else [words["M"]]` — **(a)
  first appearance** of normalizing a value that might be a single item
  or a list into always-a-list.
  *(Full standalone treatment: ../concepts/python-normalize-scalar-or-list.md.)*
  Lesson 2's `tokenize()` already turns a
  *repeated* letter on one line into a real Python `list` (its own
  duplicate-word behavior) — a line like `"M3 M8"` produces `{"M": [3.0,
  8.0]}` — so this one line is what lets a single line legitimately turn
  on the spindle *and* coolant together, matching the real reference's
  own `for (const m of ms2)` loop over potentially-multiple M-codes per
  block.
- The `if m_int == _SPINDLE_CW: ... elif ...` chain — **(b) hard concept
  reappearing**: the identical modal-update shape as Lesson 4's motion-
  mode handling, now applied to a second, independent piece of modal
  state living alongside it in the same object.
- `if "S" in words and self.spindle_dir:` — **(a) first appearance** of
  this project's own port of the reference's *second* real S-handling
  site: `S` alone, on a line with no `M3`/`M4` at all, still updates
  `spindle_rpm` — but **only** if the spindle is already running
  (`self.spindle_dir` is truthy) — verified directly this session: `S`
  sent while the spindle is stopped (`M5` already applied) is correctly
  ignored, matching the real reference's own `&& ch.dir` guard exactly.

### Execution Trace

The `for m_value in m_values:` dispatch chain, against real line
`"M3 S1000"` (single M-code) — the per-line real output is already
shown below; this traces the internal `elif` chain that produces it:

```
words = {"M": 3.0, "S": 1000.0}
"M" in words? → Yes
m_values = words["M"] if isinstance(words["M"], list) else [words["M"]]
  → words["M"] (3.0) is not a list → m_values = [3.0]

for m_value in [3.0]:
  m_value = 3.0 → m_int = 3
  3 not in _SUPPORTED_M_CODES? → False (3 is _SPINDLE_CW) → continue
  m_int == _SPINDLE_CW (3)?  → True → self.spindle_dir = "CW"
  (elif branches for CCW/STOP/MIST/FLOOD/OFF never checked — the chain
  stops at the first True branch)
Loop ends (only 1 value in m_values).

if "S" in words and self.spindle_dir:
  "S" in words → True.  self.spindle_dir ("CW") → truthy → True
  → self.spindle_rpm = words["S"] = 1000.0
```

A line with two M-codes, `"M3 M8"` (spindle CW and coolant flood
together, the exact real case `python-normalize-scalar-or-list.md`
names above), traces the same loop running **twice**:

```
words = {"M": [3.0, 8.0]}
m_values = words["M"] (a list already) → m_values = [3.0, 8.0]

for m_value in [3.0, 8.0]:
  m_value=3.0 → m_int=3 → matches _SPINDLE_CW → self.spindle_dir = "CW"
  m_value=8.0 → m_int=8 → matches _COOLANT_FLOOD → self.coolant_flood = True
Loop ends (2 values, both applied) — both real state changes happened
from one single line, one loop, two iterations.
```

### Commands and Real Output

```python
program = "M3 S1000\nS2000\nM5\nS3000\nM8\nM9"
```
**Real output, run this session, one command per line of the program:**
```
{'spindle_rpm': 1000.0, 'spindle_dir': 'CW', ...}   # M3 S1000
{'spindle_rpm': 2000.0, 'spindle_dir': 'CW', ...}   # S2000 (dir already CW, alone)
{'spindle_rpm': 2000.0, 'spindle_dir': '', ...}     # M5 (rpm untouched)
{'spindle_rpm': 2000.0, 'spindle_dir': '', ...}     # S3000 IGNORED (dir empty)
{..., 'coolant_flood': True, ...}                   # M8
{..., 'coolant_flood': False, 'coolant_mist': False} # M9
```
Line 4 is the important, real, verified negative case: `S3000` with the
spindle stopped correctly leaves `spindle_rpm` at `2000`, not `3000` —
proving the `and self.spindle_dir` guard is doing real work, not just
present for show.

### CS Lens / SE Lens

Two independent pieces of modal state (`current_motion`, and now
`spindle_dir`/`spindle_rpm`/`coolant_flood`/`coolant_mist`) coexisting on
one `Parser` instance is the same **(b) reappearing** state-holding
pattern from Lesson 4's own `Counter` proof — nothing new to demonstrate
in isolation here; what's new is that real machines track *several*
independent modal facts simultaneously, not just one, and each is
updated by its own distinct trigger (a `G`-word for motion, an `M`-word
for spindle/coolant) without interfering with the others — verified
directly by the `M5`/`S3000` sequence above, where stopping the spindle
had zero effect on `current_motion`.

---

## Concept Unit: Feed Rate Becomes Real Modal State

### Reference Source

`cnc/CNCEngine.ts` line 1724: `if (w.F != null) ch.feed = ev.resolve(w.F)
?? w.F;` — real, already read for earlier lessons' own research, not
previously ported: `F` was accepted as a per-line, non-modal value since
Lesson 4 (`command["f"] = words["F"]`, only present on lines that
mention it). The reference's own `ch.feed` is a persistent field on
`ChannelState`, exactly like `motionMode` — **modal**, not per-line.

### The New Code

```python
if "F" in words:
    self.current_feed = words["F"]

command = {
    "motion": self.current_motion,
    "feed": self.current_feed,
    # ...
}
```

### SE Lens

This is a real, small, honest correction to this project's own prior
design, not a reference deviation: Lesson 4 modeled `F` as "present only
on lines that mention it," which was a real, if minor, mismatch with how
G-code feed rate actually behaves once you look at the reference's real
field (`ch.feed`, persistent) rather than just the token (`w.F`,
per-line). Fixed here, the moment building a real DRO made the
difference concretely visible rather than theoretical.

---

## Concept Unit: `MachineState` and `/api/simulate`, Extended

### The New Code

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
        # ... x/y/z unchanged ...
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
`/api/simulate` now returns `state.state()` instead of `{"position":
state.position()}` — **(a) a real, purely additive change**: `position`
remains a sub-key at the same path, so nothing consuming the old shape
breaks; new sibling keys (`feed`, `spindle_rpm`, etc.) are added
alongside it.

### Commands and Real Output

```
POST /api/simulate {"program": "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8"}
```
```json
{
  "position": { "x": 30.0, "y": 20.0, "z": -5.0 },
  "feed": 100.0,
  "spindle_rpm": 1000.0,
  "spindle_dir": "CW",
  "coolant_flood": true,
  "coolant_mist": false
}
```

---

## Concept Unit: The Real DRO, Ported

### The New Code

```tsx
const AXES = ["x", "y", "z"] as const;
const AXIS_LABEL_COLOR = {
  x: "var(--color-axis-x)",
  y: "var(--color-axis-y)",
  z: "var(--color-axis-z)",
};

function MachineStatus({ program }: MachineStatusProps) {
  const [state, setState] = useState<MachineStateData | null>(null);
  useEffect(() => { fetchState(program).then(setState); }, [program]);
  if (!state) return <p>loading machine state...</p>;

  const dirColor =
    state.spindle_dir === "CW" ? "var(--color-status-cw)"
    : state.spindle_dir === "CCW" ? "var(--color-status-ccw)"
    : "var(--color-muted)";
  const coolantOn = state.coolant_flood || state.coolant_mist;

  return (
    <>
      <div className="sec">Work Position</div>
      {AXES.map((axis) => (
        <div className="dro" key={axis}>
          <span className="dro-ax" style={{ color: AXIS_LABEL_COLOR[axis] }}>
            {axis.toUpperCase()}
          </span>
          <span className="dro-num" style={{ color: axis === "z" ? "var(--color-axis-z-value)" : "var(--color-text)" }}>
            {state.position[axis].toFixed(4)}
          </span>
          <span className="dro-unit">mm</span>
        </div>
      ))}
      <div className="sec">Spindle / Feed</div>
      <div className="sgrid">
        <div className="sbox"><div className="sbox-l">Spindle</div>
          <div className="sbox-v" style={{ color: "var(--color-axis-z-value)" }}>{state.spindle_rpm} RPM</div></div>
        <div className="sbox"><div className="sbox-l">Dir</div>
          <div className="sbox-v" style={{ color: dirColor }}>{state.spindle_dir || "OFF"}</div></div>
        <div className="sbox"><div className="sbox-l">Feed</div>
          <div className="sbox-v" style={{ color: "var(--color-status-ccw)" }}>{state.feed}</div></div>
        <div className="sbox"><div className="sbox-l">Coolant</div>
          <div className="sbox-v" style={{ color: coolantOn ? "var(--color-status-on)" : "var(--color-muted)" }}>
            {coolantOn ? "ON" : "OFF"}
          </div></div>
      </div>
    </>
  );
}
```

### Mechanical Walkthrough

- `const AXES = ["x", "y", "z"] as const;` — **(a) first appearance** of
  TypeScript's `as const` assertion.
  *(Full standalone treatment: ../concepts/typescript-as-const-assertion.md.)*
- `AXES.map((axis) => ...)` structure, `.toFixed(4)` — **(a) a real,
  corrected detail**: the reference uses **4** decimal places
  (`.toFixed(4)`), not 3 — my own first, unread-source draft used 3;
  fixed once the real line was actually read.
- `AXIS_LABEL_COLOR` — **(b) reappearing** object-as-lookup-table
  pattern (Lesson 4's `_MOTION_CODES`), ported directly from the
  reference's real `axisColor` function, same real per-axis colors
  (X red, Y green, Z blue), now real CSS custom properties instead of
  inline `C.red`/`C.green`/`C.blue` references.
- `dirColor` ternary chain — **(b) reappearing** (Lesson 9's segment-
  coloring ternary), ported directly from the reference's own identical
  three-way `ms.dir === "CW" ? ... : ms.dir === "CCW" ? ... : ...` chain.
- `.sec`/`.dro`/`.dro-ax`/`.dro-num`/`.dro-unit`/`.sgrid`/`.sbox`/
  `.sbox-l`/`.sbox-v` class names — **(a) chosen deliberately to match
  the reference's own real class names exactly**, not renamed —
  because the real CSS (next unit) was ported verbatim under those exact
  selectors; matching names here is what makes the port a port, not an
  independent restyling that happens to look similar.

### Execution Trace

`AXES.map(...)` against this same lesson's own real state,
`{position: {x:30.0, y:20.0, z:-5.0}, ...}` (shown below in "Commands
and Real Output"):

```
axis="x": AXIS_LABEL_COLOR["x"] = "var(--color-axis-x)"
  state.position["x"] (30.0).toFixed(4) → "30.0000"
  → <div className="dro" key="x">
      <span style={{color:"var(--color-axis-x)"}}>X</span>
      <span style={{color:"var(--color-text)"}}>30.0000</span>  ← not z, so var(--color-text)
      <span>mm</span>
    </div>

axis="y": AXIS_LABEL_COLOR["y"] = "var(--color-axis-y)"
  state.position["y"] (20.0).toFixed(4) → "20.0000"
  → <div className="dro" key="y"> ... "Y" ... "20.0000" ... </div>

axis="z": AXIS_LABEL_COLOR["z"] = "var(--color-axis-z)"
  state.position["z"] (-5.0).toFixed(4) → "-5.0000"
  → <div className="dro" key="z">
      <span style={{color:"var(--color-axis-z)"}}>Z</span>
      <span style={{color:"var(--color-axis-z-value)"}}>-5.0000</span>  ← axis==="z", different color
      <span>mm</span>
    </div>
```

Three real DRO rows from one `.map()` call — `Z`'s own readout is the
only one that gets `var(--color-axis-z-value)` instead of
`var(--color-text)`, since the ternary inside the JSX checks
`axis === "z"` fresh on every iteration, not just once.

### The New Code — Real CSS, Ported Verbatim

*(Full standalone treatments: ../concepts/css-flexbox-layout.md
(`.dro`'s `display:flex`) and ../concepts/css-grid-layout.md
(`.sgrid`'s `display:grid`).)*

```css
.sec{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--color-muted);
  text-transform:uppercase;margin:10px 0 6px;padding-bottom:4px;
  border-bottom:1px solid var(--color-border)}
.dro{display:flex;align-items:center;background:var(--color-bg);
  border:1px solid var(--color-border);border-radius:4px;padding:5px 8px;
  margin-bottom:3px;gap:8px}
.dro-ax{font-family:monospace;font-size:12px;font-weight:700;width:14px;
  flex-shrink:0}
.dro-num{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;
  flex:1;text-align:right;letter-spacing:-.5px}
.dro-unit{font-size:9px;color:var(--color-muted);min-width:20px}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px}
.sbox{background:var(--color-bg);border:1px solid var(--color-border);
  border-radius:4px;padding:5px 7px}
.sbox-l{font-size:8px;color:var(--color-muted);font-weight:700;
  letter-spacing:1px;text-transform:uppercase}
.sbox-v{font-size:13px;font-weight:700;margin-top:2px;font-family:monospace}
```
Every real rule from `getCSS()`'s DRO/spindle block, shown in full — none
elided. `.dro-ax` sizes the `X`/`Y`/`Z` axis-letter label; `.dro-unit`
sizes the small trailing unit text next to each DRO readout; `.sbox-l`/
`.sbox-v` are the small spindle/feed/coolant status boxes' own label and
value rows.

The two new real tokens these rules (and the ones above) depend on,
added to `theme.css`'s `:root` alongside `--color-axis-*`/
`--color-status-*`/`--color-muted`:
```css
--color-border: #2b3a55;
--color-text-dim: #90a4c2;
```
`--color-border` is used directly above (`.sec`/`.dro`/`.sbox`'s own
borders); `--color-text-dim` isn't consumed by any of *this* lesson's
own rules — added alongside its real siblings from the same
`PALETTE_DARK` read, for a later consumer, not yet used here.

### Mechanical Walkthrough

- Every rule above is the reference's own real, embedded stylesheet
  (`cnc-sim/cnc/CNCSim.tsx`'s `getCSS()`, lines 1688–1701), with only
  `${C.bg}`/`${C.bd}`/`${C.txt3}`-style template-literal color
  references replaced by this project's own `var(--color-bg)`/
  `var(--color-border)`/`var(--color-muted)` design tokens (Lesson 12) —
  **structure, spacing, and typography values copied exactly**, not
  reinterpreted.
- **(a) two new, real tokens added to `theme.css`**, cited from the same
  real `PALETTE_DARK` already read in full for Lesson 12:
  `--color-border: #2b3a55` (`bd`) and `--color-text-dim: #90a4c2`
  (`txt2`, not yet used by this exact lesson's rules but added alongside
  its real siblings for the same reason the others were).

### Commands and Real Output — Verified Live

Both servers restarted; a real headless browser (Playwright, this
session) loaded the actual page and a full-page screenshot was taken and
inspected directly: a real "WORK POSITION" section with three bordered
rows (X red, Y green, Z blue-accented value, all real 4-decimal
formatted numbers with an `mm` unit), and a real "SPINDLE / FEED" 2×2
grid — `1000 RPM`, `CW` (green), `100` (amber), `ON` (teal) — for the
real program `"M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8"`. Visually,
structurally, and in color language, a direct match to the real
screenshots provided this session, not an approximation.

## Connect the Pieces

1. `"M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8"` is parsed: `M3` sets
   `spindle_dir = "CW"`; the same line's `S1000` (spindle already on)
   sets `spindle_rpm = 1000`; two motion commands; `G1 ... F100` sets
   `current_feed = 100`; `M8` sets `coolant_flood = True`.
2. `MachineState` applies all six commands, accumulating final position
   *and* the real spindle/feed/coolant state alongside it.
3. `/api/simulate` returns the full `state()` — position plus every
   other real, live field.
4. `MachineStatus` fetches it and renders the real, ported DRO structure
   — verified, live, screenshot-confirmed against the actual reference
   app's own visual language.

## What Breaks Without This

Already demonstrated in full, live, this lesson — in two ways: (1) the
`S3000`-while-stopped case, which would silently apply if the `and
self.spindle_dir` guard were removed (real, verified negative case); and
(2) the entire first-draft DRO component, which would have shipped a
structurally different, unfaithful panel had the real screenshots and
real source not been consulted before finalizing it.

## Exercises

1. Send `"M3 M4"` (both directions on one line — a real, if unusual,
   input). Confirm which direction wins, and explain why from the
   `elif` chain's own real evaluation order.
2. Add `M09` alongside `M08` on the same line (`"M8 M9"`). Confirm the
   final coolant state and explain why from real evaluation order,
   left to right.
3. Open the two real screenshots in this workspace
   (`Screenshot 2026-07-19 141708.png`/`141802.png`) side by side with
   your own running `cnc-web` page. Name, in your own words, one real,
   visible difference beyond the already-named "Machine (G53)"/
   "Progress"/"Diagnostics" gaps.

## Definition of Done

- [ ] `core/parser.py` recognizes `M3`/`M4`/`M5`/`M7`/`M8`/`M9`/`S`,
      rejecting any other M-code by name; `F` is real modal state.
- [ ] `core/machine.py`/`/api/simulate` expose the full real state.
- [ ] `cnc-web/src/MachineStatus.tsx` renders "Work Position" and
      "Spindle / Feed", matching the real reference's structure, class
      names, and color language, verified with a real screenshot.
- [ ] You reproduced the `S`-while-stopped negative case yourself.
- [ ] You completed Exercises 1–3.
- [ ] Full regression: every prior route and `segments.test.ts`'s four
      tests still pass.
- [ ] A git commit exists explaining *why* (real spindle/feed/coolant
      state, and a DRO panel built from the actual reference source and
      real screenshots after a first, unread-source draft was caught
      and corrected before shipping).
