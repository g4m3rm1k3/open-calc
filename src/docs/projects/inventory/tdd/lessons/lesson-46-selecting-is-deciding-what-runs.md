# Lesson 46: Selecting Is Deciding What Runs

**What you will build:** a real step-through simulation feature —
Step/Play/Reset/Single-Block/speed controls in the DRO tab, and
per-operation checkboxes in the Operations tab that decide which
commands are even eligible to simulate — plus four real, independent
bugs found and fixed while building it, each one a distinct, reusable
lesson in its own right, not shipped silently. The reference has a
related mechanism; this project's own version is a deliberate,
carefully-reasoned divergence from it, named explicitly throughout.

**What you need to know first:** `core/machine.py`'s `MachineState`
(Lesson 05); `core/path.py`'s original `compute_path` (Lesson 06);
`react-useref-hook.md`; `react-useeffect-hook.md`; `browser-request-
animation-frame.md`; `deep-equality-vs-reference-equality.md`;
`caching-and-memoization.md`; the Operations tab itself (Lessons
41/44/45).

---

## Concept Unit: One Pass Instead of Two

### The Problem

The reference (`cnc/CNCEngine.ts`) keeps two real, separate mechanisms
for anything path-related: a full path, pre-computed once on *cloned*
channels (`_buildFullPath`), and live single-step re-execution on the
*real* channels (`stepChannel`/`stepAll`) that never records a path
point at all. `COMPONENT_MAP.md`'s own citation on this is direct: "all
path/backplot data comes exclusively from the eager `_buildFullPath()`
sweep... never from interactive stepping." That split exists to
protect a real, persistent, in-browser engine instance from being
disturbed by building a preview — stepping the *real* instance while a
preview build is also touching it would corrupt both.

This project has no such persistent instance to protect. Every
`/api/path` request is already stateless — a fresh `MachineState()`,
run once, per request. There is nothing a second, live mechanism would
be protecting from a first, cached one, because there is no first one
that persists across requests to begin with.

### Project Change

- **Reference Source** — `cnc/CNCEngine.ts`'s `_buildFullPath`/
  `stepChannel`/`stepAll`, cited above; **not ported** — the divergence
  is deliberate, reasoned through with the user directly before writing
  any code, and named here rather than silently diverging.
- **Files affected** — `cnc-service/core/path.py` (`compute_path`,
  replaced), `cnc-service/app.py` (`/api/path` route).
- **Change type** — replace.
- **Location** — where `compute_path` already lived.
- **Dependencies** — `core/machine.py`'s `MachineState` (unchanged).

### The New Code

```python
# Real, deliberate divergence from cnc/CNCEngine.ts's own dual mechanism
# (a full path pre-computed once on *cloned* channels via _buildFullPath,
# kept completely separate from stepChannel/stepAll's live re-execution
# on the *real* channels, which never records any path point --
# COMPONENT_MAP.md's own citation on this: "all path/backplot data comes
# exclusively from the eager _buildFullPath() sweep... never from
# interactive stepping"). That split exists to protect a real,
# persistent, in-browser engine instance from being disturbed by
# building a preview. This project has no such persistent instance to
# protect -- every request is already stateless -- so there is nothing
# to keep separate: one pass over `commands`, driving the exact same
# real `MachineState` this project already uses everywhere else,
# produces both the path (tagged per point with which command produced
# it, matching the reference's own per-point `bi` block-index tag) and a
# real, resolved machine-state snapshot after every command, in one
# call. "Stepping" a program is then just walking an index into this
# already-fully-resolved array -- no re-execution, no cloning, no
# separate live/preview distinction to maintain.
def compute_steps(commands):
    state = MachineState()
    points = [{"motion": DEFAULT_MOTION, "command_index": None, **state.position()}]
    states = []
    for index, command in enumerate(commands):
        is_cycle = command["motion"] in _CYCLE_MODES
        is_arc = command["motion"] in _ARC_MODES and any(
            w in command for w in _ARC_WORDS
        )
        old_x, old_y, old_z = state.x, state.y, state.z
        state.apply(command)
        before = len(points)
        if is_cycle:
            if "r" in command:
                is_absolute = command.get("pos_mode", "G90") == "G90"
                r = command["r"] if is_absolute else old_z + command["r"]
            else:
                r = old_z
            _add_cycle_points(command, state.x, state.y, state.z, r, points)
        elif is_arc:
            _add_arc_points(command, old_x, old_y, state.x, state.y, state.z, points)
        else:
            points.append({"motion": command["motion"], **state.position()})
        for point in points[before:]:
            point["command_index"] = index
        states.append(state.state())
    return {"points": points, "states": states}
```

`app.py`'s route becomes a one-line pass-through of the new shape:

```python
    # Real addition, for the step-through feature: `states` is one real,
    # resolved MachineState snapshot per command (position/feed/rpm/
    # spindle/coolant), and every point in `points` now carries
    # `command_index` naming which command produced it -- together, a
    # frontend can "step" by walking an index into these two already-
    # computed arrays, rather than re-executing anything per step.
    return compute_steps(commands)
```

### The Updated Project

`App.tsx`'s own `fetchPath` consumes both arrays from that one response
in a single call — the real replacement for what used to be two,
separate frontend fetches (`/api/path` for `points`, and
`MachineStatus.tsx`'s own independent `/api/simulate` for state, removed
in a later unit below):

```ts
interface PathResult {
  points: PathPoint[];
  states: MachineStateData[];
}

interface PathResponse {
  points?: PathPoint[];
  states?: MachineStateData[];
  error?: string;
}

// Real addition alongside `points`: `states` is core/path.py's own
// compute_steps -- one resolved MachineState snapshot per command,
// computed in the exact same pass as the path itself, not a second,
// redundant call (this replaced MachineStatus.tsx's own independent
// /api/simulate fetch entirely -- see that file's own note).
async function fetchPath(program: string): Promise<PathResult> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  logger.info(`fetchPath succeeded: ${data.points!.length} points, ${data.states!.length} steps`);
  return { points: data.points!, states: data.states! };
}
```

### Mechanical Walkthrough
- `points = [{"motion": DEFAULT_MOTION, "command_index": None, ...}]` —
  the synthetic starting point exists before any real command has run,
  so it has no real command to be tagged with; `None` names that
  honestly rather than defaulting it to `0` (which would falsely claim
  the first command produced it).
- `before = len(points)` / `for point in points[before:]: point["command_index"] = index`
  — a single command can add more than one point (an arc or a canned
  cycle expands into several segments); every point added *this
  iteration*, however many there are, gets tagged with the same real
  command index that produced all of them.
- `states.append(state.state())` — one snapshot per command, in the
- exact same loop that already walks `commands` to build `points` — no
  second pass, no second `MachineState()` instance, since the data
  needed for both was already being computed together.

### CS Lens

Not a hard CS concept — this is a direct, reasoned architectural
choice: two responsibilities (build a path, expose a snapshot per step)
that a stateful system must keep separate collapse safely into one pass
the moment the underlying system has no persistent state to protect.

### SE Lens

The real risk in a divergence like this isn't writing worse code — the
unified version is genuinely simpler — it's *silently* diverging from a
reference without naming why, so a future reader (including the user,
reviewing this later per the project's own phase-2 plan) can't tell
"deliberate simplification" from "accidentally missed a real
requirement." The comment in `compute_steps` and this lesson both name
the reference mechanism explicitly and state the real reason it doesn't
apply here — the divergence is documented, not hidden.

### Commands

None new.

### Run It

```pycon
>>> from core.path import compute_steps
>>> from core.parser import Parser
>>> commands = Parser().parse("M3 S1000\nG0 X10 Y20\nG1 Z-5 F100")
>>> result = compute_steps(commands)
>>> [p["command_index"] for p in result["points"]]
[None, 0, 1, 2]
>>> len(result["states"])
3
>>> result["states"][0]["spindle_rpm"]
1000
```

Real output, this session, confirmed directly against the exact
function used by `/api/path`.

---

## Concept Unit: Two Modes, One Exposed Value

### The Problem

Direct instruction: selected toolpaths should show *fully* — the
complete, already-resolved geometry — right up until Step or Play is
first pressed, at which point the display clears and rebuilds
progressively as stepping actually happens. That's two real, distinct
modes ("preview" and "stepping"), not one — and the reference doesn't
need this distinction at all, since its own preview and its own
stepping are already two separate mechanisms (the divergence named in
the unit above). This project's unified design needed a real state
variable to recover that same distinction on top of one shared array.

### Project Change

- **Reference Source** — none; a real addition beyond the reference,
  requested directly.
- **Files affected** — `cnc-web/src/usePlayback.ts` (new file).
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `react-useref-hook.md`, `react-useeffect-hook.md`.

### The New Code

The real shape this whole file exposes — every field a consumer
(`App.tsx`) can read or call, before any of its own internals:

```ts
export interface Playback {
  stepIndex: number;
  isPlaying: boolean;
  isReset: boolean;
  sbk: boolean;
  speedMode: SpeedMode;
  custSpeed: number;
  toggleCycle: () => void;
  step: () => void;
  toggleSbk: () => void;
  reset: () => void;
  setSpeedMode: (mode: SpeedMode) => void;
  setCustSpeed: (speed: number) => void;
}
```

The real command indices stepping actually visits — computed once,
here, from whichever command indices `BlockList`'s own checkboxes
reported as selected:

```ts
const eligibleIndices = useMemo(() => {
  if (!selectedIndices) return [];
  return states.map((_, i) => i).filter((i) => selectedIndices.has(i));
}, [states, selectedIndices]);
```

```ts
// `hasStarted` is the real distinction this feature needed and didn't
// have before: `false` means "preview" -- show the complete, selected
// toolpath, fully drawn, nothing executed yet. `true` means stepping
// has actually begun -- `cursor` (an index *into* `eligibleIndices`,
// not a raw command index) is what's real then, -1 meaning Reset
// (nothing revealed). The exposed `stepIndex` below is computed
// differently depending on which of these two modes is active.
const [hasStarted, setHasStarted] = useState(false);
const [cursor, setCursor] = useState(-1);

// The one real place "preview" and "stepping" actually differ:
// preview always exposes the *last* eligible index (the complete,
// selected toolpath, fully drawn) regardless of `cursor`; once
// stepping has begun, the real cursor position is what's exposed,
// `-1` meaning Reset (nothing revealed).
const stepIndex = !hasStarted
  ? (eligibleIndices.length > 0 ? eligibleIndices[eligibleIndices.length - 1] : -1)
  : cursor === -1
    ? -1
    : eligibleIndices[cursor];

// The first real Step (or Play) press from preview does two things in
// one action, deliberately: it clears the full preview (hasStarted
// flips true, and stepIndex's own computation above immediately stops
// reading "the last eligible index") *and* takes the first real step
// -- not a separate, wasted press that only clears and does nothing
// else. Real CNC cycle start doesn't arm the machine on one press and
// move it on the next.
const step = useCallback(() => {
  if (!hasStartedRef.current) {
    hasStartedRef.current = true;
    setHasStarted(true);
  }
  const eligible = eligibleRef.current;
  if (cursorRef.current >= eligible.length - 1) {
    playingRef.current = false;
    setIsPlaying(false);
    return;
  }
  const next = cursorRef.current + 1;
  cursorRef.current = next;
  setCursor(next);
}, []);
```

The refs `step` (and `autoRun`, next unit) actually read — every one of
them, declared alongside the state each mirrors:

```ts
const hasStartedRef = useRef(hasStarted);
const cursorRef = useRef(cursor);
const playingRef = useRef(isPlaying);
const sbkRef = useRef(sbk);
const speedModeRef = useRef(speedMode);
const custSpeedRef = useRef(custSpeed);
const statesRef = useRef(states);
const eligibleRef = useRef(eligibleIndices);
const playHandleRef = useRef<number | null>(null);
```

`backToPreview` — the one function every real trigger that should
return to preview (a fresh reparse, a changed selection, or an explicit
Reset press) shares, rather than three separate copies of the same four
lines:

```ts
const clearPlayHandle = useCallback(() => {
  if (playHandleRef.current != null) {
    clearTimeout(playHandleRef.current);
    cancelAnimationFrame(playHandleRef.current);
    playHandleRef.current = null;
  }
}, []);

const backToPreview = useCallback(() => {
  clearPlayHandle();
  hasStartedRef.current = false;
  setHasStarted(false);
  cursorRef.current = -1;
  setCursor(-1);
  playingRef.current = false;
  setIsPlaying(false);
}, [clearPlayHandle]);
```

### Mechanical Walkthrough
- `export interface Playback { ... }` — **(c) already basic** — a plain
  TS interface, the same construct used throughout this project since
  Lesson 17; the only real content worth naming is that every field on
  it is something `App.tsx` actually reads or calls, nothing internal
  leaks through.
- `states.map((_, i) => i).filter((i) => selectedIndices.has(i))` —
- **(b) reappearing** — `.map`/`.filter`, both already established;
  mapping each state to its own index first, then filtering *those*
  indices by membership in the real selected set, is what turns "which
  commands are selected" into "which positions in `states` are eligible,
  in order."
- `useRef(hasStarted)` and its eight siblings — **(b) reappearing**
  `useRef`'s mutable-value half (`react-useref-hook.md`, first used this
  way in this project's own code in Lesson 23) — nine separate refs, one
  per piece of state `step`/`autoRun` need to read without going stale
  inside their own stable-identity closures (the exact problem the
  ref-mirroring unit below exists to explain in depth).
- `clearPlayHandle`'s own `clearTimeout`/`cancelAnimationFrame` pair,
  called unconditionally on the same id — **(b) reappearing**, the
  identical "safe no-op on whichever one it isn't" shape already named
  for `autoRun`'s own two speed-mode branches, defined here as its own
  function specifically because three separate call sites (`autoRun`,
  `toggleCycle`, `backToPreview`) all need to cancel whatever's currently
  scheduled.
- `backToPreview` resets every piece of `hasStarted`/`cursor`/`isPlaying`
  state *and* its mirroring ref, in the same call — **(a) first
  appearance** of this exact "one shared reset function" shape in this
  project: three real, distinct triggers (reparse, selection change,
  Reset press) all needed the identical four-line reset, so it exists
  once, not three times.
- `!hasStarted ? eligibleIndices[eligibleIndices.length - 1] : ...` — a
- ternary, not two separate code paths that happen to agree — `preview`
  is not "stepping, frozen at the end"; it is a distinct rule
  (`stepIndex` always tracks the *last* eligible index, live, so
  changing the selection while still in preview updates what's shown
  immediately, with no step ever having been taken).
- `step()`'s own first-call branch flips `hasStarted` *and* still falls
  through to take a real step in the same call — verified directly by
  the user's own report once this shipped correctly: the first press of
  Step visibly clears the full preview and reveals only the first
  point, in one action.

### CS Lens

This is a small **state machine** with exactly two states (`preview`,
`stepping`) and one one-way transition between them (Step/Play presses
it forward; Reset, a fresh reparse, or a changed selection sends it
back) — `hasStarted` is that machine's own current state, and
`stepIndex`'s ternary is the machine's output function, computed
differently per state from the same underlying data.

### SE Lens

Exposing one computed value (`stepIndex`) from two internal modes,
rather than two separate values a consumer would have to choose between
itself, keeps every downstream reader (`App.tsx`'s `revealedPoints`
filter, the DRO's `currentState` lookup) simple and mode-agnostic — they
read one number and don't need to know or care which of the two real
rules produced it.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: selecting two
operations shows their complete toolpath immediately (preview); pressing
Step once clears the display down to a single point, then each further
press reveals one more; pressing Reset returns to full preview, not to
empty.
```

---

## Concept Unit: The Self-Rescheduling Play Loop

### The Problem

Cycle Start needs to advance through every eligible step on its own,
without the user pressing Step repeatedly, at a real, controllable
speed — and stop cleanly the moment Feed Hold (the same button, toggled)
is pressed.

### Introduce the Concept in Isolation

**REAPPEARING** — `concepts/browser-request-animation-frame.md` already
covers exactly this shape (a callback that reschedules itself,
checking a live condition each time before doing so) — read that first
if this is its first appearance in your own work. Nothing new to
introduce; this unit is that concept, applied for real.

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own `autoRun`, ported
  faithfully, including its one real, named quirk (below).
- **Files affected** — `cnc-web/src/usePlayback.ts`.
- **Change type** — add.
- **Location** — alongside `step`.
- **Dependencies** — `browser-request-animation-frame.md` (reappearing).

### The New Code

```ts
// A real port of autoRun's own two speed-mode branches, including its
// one real, named quirk: SBK is only ever checked in the non-MAX
// branch below -- at MAX speed, SBK has no observable effect at all,
// exactly like the reference (confirmed directly by reading its own
// real source before porting this).
const autoRun = useCallback(() => {
  if (!playingRef.current) return;
  const eligible = eligibleRef.current;
  if (cursorRef.current >= eligible.length - 1) {
    playingRef.current = false;
    setIsPlaying(false);
    return;
  }
  if (speedModeRef.current === "max") {
    for (let i = 0; i < 30 && playingRef.current && cursorRef.current < eligible.length - 1; i++) {
      step();
    }
    if (playingRef.current && cursorRef.current < eligible.length - 1) {
      playHandleRef.current = requestAnimationFrame(autoRun);
    } else {
      playingRef.current = false;
      setIsPlaying(false);
    }
    return;
  }
  step();
  if (!playingRef.current || cursorRef.current >= eligible.length - 1) {
    playingRef.current = false;
    setIsPlaying(false);
    return;
  }
  if (sbkRef.current) {
    playingRef.current = false;
    setIsPlaying(false);
    return;
  }
  // Real formula, ported directly: delay is derived from the *live*
  // feed rate at the step just taken (not a fixed constant), a speed
  // multiplier (1x real-time, or the custom slider ÷ 100), clamped to
  // a sane [1, 2000]ms range. The reference also multiplies by a real
  // feed-override fraction (`feedOvr`); this project has no feed-
  // override control yet (`OverrideSlider.jsx`, a separate, un-ported
  // component) -- deliberately treated as 1 (no override) here, named
  // rather than silently assumed away.
  const currentCommandIndex = eligible[cursorRef.current];
  const current = statesRef.current[currentCommandIndex];
  const feed = current?.feed || 200;
  const speedMultiplier = speedModeRef.current === "rt" ? 1 : custSpeedRef.current / 100;
  const delay = Math.max(1, Math.min(2000, 2 / ((feed / 60 / 1000) * speedMultiplier)));
  playHandleRef.current = window.setTimeout(autoRun, delay);
}, [step]);
```

The two functions `PlaybackControls.tsx`'s own buttons actually call —
Cycle Start/Feed Hold (one button, two states) and Single Block:

```ts
const toggleCycle = useCallback(() => {
  if (!hasStartedRef.current) {
    hasStartedRef.current = true;
    setHasStarted(true);
  }
  const next = !playingRef.current;
  playingRef.current = next;
  setIsPlaying(next);
  if (next) {
    autoRun();
  } else {
    clearPlayHandle();
  }
}, [autoRun, clearPlayHandle]);

const toggleSbk = useCallback(() => setSbk((s) => !s), []);
```

### Mechanical Walkthrough
- MAX speed batches up to 30 real steps per animation frame before
- rescheduling via `requestAnimationFrame` — fast enough to feel
  instantaneous for most real programs, still yielding to the browser's
  own repaint cycle rather than blocking it in one giant synchronous
  loop.
- Every other speed mode takes exactly one step, then reschedules via
- `window.setTimeout(autoRun, delay)` — `playHandleRef` holds whichever
  kind of handle is currently in flight (a `requestAnimationFrame` ID or
  a `setTimeout` ID); `clearPlayHandle` calls both `clearTimeout` and
  `cancelAnimationFrame` unconditionally on it, a safe no-op on whichever
  one it isn't, the same real "belt-and-suspenders" shape the reference
  itself uses in `resetProg`.
- SBK (Single Block) is checked only in the non-MAX branch — a real,
  faithful reference quirk (confirmed by reading `cnc/CNCSim.jsx`'s own
  source before porting, not an assumption): at MAX speed, arming SBK
  has no observable effect at all.
- `toggleCycle`'s own `!playingRef.current` — **(b) reappearing** —
  simple boolean inversion; the real content is *ordering*: it flips
  `hasStarted` first (so the very first Cycle Start press, exactly like
  the very first Step press, clears the preview), computes `next`
  *before* writing either the ref or the state so both genuinely agree,
- then calls `autoRun()` directly only when turning play *on* — turning
  it off just cancels whatever's scheduled, since `autoRun` itself
  already exits immediately once `playingRef.current` is false.
- `setSbk((s) => !s)` — **(b) reappearing** — the same updater-function
  form of `setState` already established, guaranteed to flip from
  whatever the state genuinely is at update time, not whatever `sbk`
  happened to close over.

### CS Lens / SE Lens

Not repeated — fully covered by `browser-request-animation-frame.md`.
The one addition this unit makes beyond that file: the delay itself is
*data-derived* (the live feed rate of the step just taken), not a fixed
interval — the loop's own pacing changes based on what it's simulating,
still using the identical self-rescheduling shape underneath.

### Commands

None new.

### Run It

```pycon
>>> feed, speed_multiplier = 200, 1.0
>>> max(1, min(2000, 2 / ((feed / 60 / 1000) * speed_multiplier)))
600.0
```

Matches `delay`'s own formula exactly — confirmed directly.

---

## Concept Unit: Color as State, Not Just Decoration

### The Problem

Two, real, separate requests: first, a faithful port of the reference's
own control bar (`cnc/components/PlaybackControls.jsx`) — the same ten
props, the same button set, the same conditional speed-slider. Then,
after live testing surfaced a real, reported point of confusion ("wait
I had single block on lol") — SBK being armed silently changed Cycle
Start's own behavior with no visual indication it was even on — a
direct follow-up request: color the controls by their real current
state (playing, armed, reset), not a fixed color regardless of state,
so the bar is readable at a glance.

### Project Change

- **Reference Source** — `cnc/components/PlaybackControls.jsx` (props
  and button set); the color-by-state behavior itself is a real
  addition beyond the reference, requested directly after a live bug
  report.
- **Files affected** — `cnc-web/src/PlaybackControls.tsx` (new file),
  `cnc-web/src/theme.css`.
- **Change type** — add.
- **Location** — new file; `theme.css`'s existing `.btn` rule (Lesson
  25) and `.block-operation`'s own styling (Lesson 41).
- **Dependencies** — none new.

### The New Code

```tsx
import type { SpeedMode } from "./usePlayback.ts";
import { Play, Square, StepForward, RotateCcw } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isReset: boolean;
  onToggleCycle: () => void;
  onStep: () => void;
  sbk: boolean;
  onToggleSbk: () => void;
  onReset: () => void;
  speedMode: SpeedMode;
  onSetSpeedMode: (mode: SpeedMode) => void;
  custSpeed: number;
  onSetCustSpeed: (speed: number) => void;
}

const SPEED_MODES: { id: SpeedMode; label: string }[] = [
  { id: "max", label: "MAX" },
  { id: "rt", label: "REAL-TIME" },
  { id: "custom", label: "CUSTOM" },
];

// A real, faithful port of cnc-sim/cnc/components/PlaybackControls.jsx --
// same 10 props, same button set, same conditional-slider behavior
// (shown only when speedMode === "custom"). Class names are this
// project's own (`btn`/`btn-am`/`btn-bl`/`btn.lg`, theme.css), not the
// reference's literal ones, but the same real states they key off of.
function PlaybackControls({
  isPlaying,
  isReset,
  onToggleCycle,
  onStep,
  sbk,
  onToggleSbk,
  onReset,
  speedMode,
  onSetSpeedMode,
  custSpeed,
  onSetCustSpeed,
}: PlaybackControlsProps) {
  return (
    <div className="ctrlbar">
      {/* Row 1: main playback controls */}
      <div className="btn-group">
        {/* Color = state, nothing else: green only while actually
            playing (not a fixed "go" color regardless of state), amber
            only while SBK is actively armed -- so glancing at the bar
            tells you what's really active without reading labels. */}
        <button
          type="button"
          className={`btn${isPlaying ? " btn-gr" : ""}`}
          onClick={onToggleCycle}
          title={isPlaying ? "Feed Hold" : "Cycle Start"}
        >
          {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <button type="button" className="btn" onClick={onStep} title="Step">
          <StepForward size={14} />
        </button>
        <button type="button" className={`btn${isReset ? " btn-rd" : ""}`} onClick={onReset} title="Reset">
          <RotateCcw size={14} />
        </button>
        <button type="button" className={`btn${sbk ? " btn-am" : ""}`} onClick={onToggleSbk} title="Single Block">
          SBK
        </button>
      </div>

      {/* Row 2: speed-mode controls */}
      <div className="ctrlbar-row">
        <div className="btn-group">
          {SPEED_MODES.map((mode) => (
            <button
              type="button"
              key={mode.id}
              className={`btn btn-sm${speedMode === mode.id ? " btn-bl" : ""}`}
              onClick={() => onSetSpeedMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: custom-speed slider, only when that mode is selected */}
      {speedMode === "custom" && (
        <div className="ctrlbar-row">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, padding: "4px" }}>
            <input
              type="range"
              min={1}
              max={5000}
              value={custSpeed}
              onChange={(e) => onSetCustSpeed(+e.target.value)}
              className="ctrlbar-slider"
              style={{ width: "100%", margin: 0 }}
            />
            <span className="ctrlbar-speed-value" style={{ minWidth: "40px", fontSize: "10px", fontWeight: "600", color: "var(--color-accent-blue-bright)" }}>
              {custSpeed}×
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaybackControls;
```

The real CSS these class names resolve to — `.btn-gr` (Lesson 41)
already existed; `.btn-am`/`.btn-bl`/`.btn-rd`/`.btn-group` are this
feature's own real additions, ported from the reference's own template
but bound to this project's design tokens rather than its literal hex
values:

```css
.btn:active {
  background: color-mix(in srgb, var(--color-accent-blue) 25%, transparent);
  border-color: var(--color-accent-blue-bright);
  color: #fff;
}
.btn-group {
  display: flex;
  width: 100%;
}
.btn-group .btn {
  flex: 1;
  border-radius: 0;
  margin-right: -1px;
}
.btn-group .btn:first-child {
  border-radius: 4px 0 0 4px;
}
.btn-group .btn:last-child {
  border-radius: 0 4px 4px 0;
  margin-right: 0;
}
.btn-group .btn:focus, .btn-group .btn:hover {
  position: relative;
  z-index: 1;
}
.btn-am {
  background: var(--color-amber-bg);
  color: var(--color-amber);
  border-color: color-mix(in srgb, var(--color-amber) 30%, transparent);
}
.btn-bl {
  background: color-mix(in srgb, var(--color-accent-blue) 15%, transparent);
  color: var(--color-accent-blue-bright);
  border-color: color-mix(in srgb, var(--color-accent-blue) 30%, transparent);
}
.btn-rd {
  background: color-mix(in srgb, #ff4444 15%, transparent);
  color: #ff6666;
  border-color: color-mix(in srgb, #ff4444 30%, transparent);
}
.btn.lg {
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
}
.btn.btn-sm {
  font-size: 9px;
  padding: 3px 7px;
}
```

**Genuinely new here, the rest already established:** `:active` (a
pseudo-class matching an element only for the real, brief moment it's
being clicked — mouse down, not yet released) and `:first-child`/
`:last-child` combined with the descendant combinator (Lesson 23) to
reach specifically the first/last real `.btn` inside a `.btn-group`,
letting the group's own outer corners stay rounded while every button
between them stays square. `:last-child` itself already appeared once,
Lesson 22's own `.ribbon-group:last-child`; `:focus`/`:hover` (Lesson
41/43) and `.btn.lg`/`.btn.btn-sm` (compound selectors, Lesson 18's own
`.btn.full`) are all reapplied, not new.

The control bar's own layout, ported directly from the reference's
`.ctrlbar`/`.ctrl-div` (`CNCSim.jsx:1708-1709`), with one real,
deliberate placement change:

```css
/* Reference placement was a full-width top bar (hence flex-nowrap +
   horizontal scroll, cnc/CNCSim.jsx:1708). Real, deliberate placement
   change per direct instruction: this now lives inside the DRO tab's
   own (narrow, ~260px) side panel, so it wraps instead -- scrolling
   sideways in a panel that width would be worse than wrapping. */
.ctrlbar {
  background: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ctrlbar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.ctrl-div {
  width: 1px;
  height: 22px;
  background: var(--color-border);
  margin: 0 2px;
  flex-shrink: 0;
}
.ctrlbar-label {
  font-size: 9px;
  color: var(--color-muted);
}
.ctrlbar-slider {
  width: 70px;
}
.ctrlbar-speed-value {
  font-size: 9px;
  color: var(--color-accent-blue-bright);
  min-width: 36px;
}
```

The same "color = real current state" idea, applied to a selected
operation's own border (Operations tab, the unit below):

```css
/* Real, per direct instruction: a checked Operations-tab checkbox is
   what this feature (App.tsx's own selectedCommandIndices) reads to
   decide what "simulate only this" means -- the glow is the same real
   green already used for an "on" status (--color-status-on) elsewhere
   in this project, not a new color introduced just for this. */
.block-operation-selected {
  border-color: var(--color-status-on);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--color-status-on), 0 0 12px color-mix(in srgb, var(--color-status-on) 60%, transparent);
}
```

### Mechanical Walkthrough
- `isPlaying`/`isReset`/`sbk` each drive exactly one conditional class
- append (`` `btn${cond ? " btn-x" : ""}` ``) — no separate "which color
  is this button right now" logic anywhere else; the button's own class
  string *is* the single source of truth for its displayed state.
- `.btn-group .btn { flex: 1; border-radius: 0; margin-right: -1px }`
- plus `:first-child`/`:last-child` overrides — the standard CSS shape
  for a row of visually-joined buttons (flat borders between them, only
  the two end buttons rounded) rather than a row of independently boxed
  ones.
- `--color-status-on` (the selection glow) and `--color-amber`/
  `--color-accent-blue`/`#ff4444` (the button states) are all *existing*
  design tokens or literal values already used elsewhere in this
  project — a deliberate reuse, not new colors invented just for this
  feature, named directly in both comments above.
- `SPEED_MODES.map((mode) => ...)` — **(b) reappearing** `.map`, the
  same array-of-`{id, label}`-objects shape this project's own
  `GROUP_ORDER`/`THEMES` (Lesson 24) already use, applied here to
  generate three buttons instead of hand-writing each one.
- `:active` on `.btn` — **(a) first appearance**: matches an element for
  the real, brief window between a mouse press and its release, giving
  every button on the bar the same instant, tactile "yes, this
- registered" feedback `:hover`/`:focus` alone can't — those track
  position and keyboard attention, neither tracks "is this specific
  button being pressed right now."

### CS Lens

Not a hard CS concept — a direct application of the same idea named in
this lesson's own preview-vs-stepping unit: one real, current state,
one deterministic function from that state to its own visual
representation, rather than a separate flag or class tracked
independently that could drift out of sync with the real state it's
supposed to reflect.

### SE Lens

The real, concrete failure this replaced: SBK being armed had no visual
indication at all before this — Cycle Start visibly executing exactly
one block per press read as a bug ("play acting like step") rather than
the correct, faithfully-ported reference behavior it actually was. The
fix isn't a new mechanism, only making an already-real, already-tracked
piece of state (`sbk`) visible where it previously wasn't — the
cheapest possible fix for a real confusion, since the state driving it
already existed.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: Cycle Start's own
button turns green only while actually playing (reverting to its
default color the instant Feed Hold or the program end stops it); SBK
turns amber only while armed; Reset turns red only in preview/reset
state -- confirmed by toggling each control directly and observing the
color change matched the real state change, not a fixed appearance.
```

---

## Concept Unit: A Ref That Was Never Actually Synced

### The Problem

Real bug, reported precisely by the user: "step is working after reset
but not cycle start, I think cycle start just shows immediately no
matter what speed is selected." Speed mode and custom speed visibly
changed in the UI (real React state, correctly updated) — but `autoRun`
kept behaving as though the very first speed mode (`"max"`) were still
selected, regardless of what the controls actually showed.

### Introduce the Concept in Isolation

First appearance of this exact failure mode in this project — full
standalone treatment: `concepts/ref-mirror-of-state-needs-manual-
sync.md`. Read that first; its own isolated example (a `multiplierRef`
copied once at mount, never updated, silently ignoring every later
change to `multiplier` state) is precisely this project's own mistake,
generalized.

### Project Change

- **Reference Source** — none; a real bug in this project's own new
  code, not a reference-fidelity question.
- **Files affected** — `cnc-web/src/usePlayback.ts`.
- **Change type** — add (three small sync effects).
- **Location** — directly after the refs they sync.
- **Dependencies** — `ref-mirror-of-state-needs-manual-sync.md`.

### The New Code

```ts
// Real bug, found and fixed: `sbkRef`/`speedModeRef`/`custSpeedRef`
// were declared from their state's own initial value and then never
// touched again -- `setSpeedMode`/`setCustSpeed`/`toggleSbk` (the
// controls' own onChange handlers) only ever updated the *state*, not
// these refs, so `autoRun` (which reads the refs, not the state, for
// the same close-over-stale-value reason documented above) always
// saw the values from first mount -- speedMode stuck at "max"
// regardless of what was actually selected. `hasStartedRef`/
// `cursorRef`/`playingRef` don't need this: every real place that
// changes them updates the ref and the state together, manually, at
// the same call site -- these three didn't have that.
useEffect(() => {
  sbkRef.current = sbk;
}, [sbk]);
useEffect(() => {
  speedModeRef.current = speedMode;
}, [speedMode]);
useEffect(() => {
  custSpeedRef.current = custSpeed;
}, [custSpeed]);
```

### Mechanical Walkthrough
Same mechanism as the concept file's own isolated example, applied to
three refs instead of one: `sbkRef`/`speedModeRef`/`custSpeedRef` all
existed already (`useRef(sbk)` etc., at declaration), but nothing wrote
to them again after mount. `hasStartedRef`/`cursorRef`/`playingRef`
happened to avoid this bug by accident, not by a different design rule
- — every real call site that changes them (`step`, `toggleCycle`,
`backToPreview`) already updates both the ref and the state together,
manually, since those particular values are only ever changed from
inside this same file's own functions. `sbk`/`speedMode`/`custSpeed`,
by contrast, are changed from `PlaybackControls.tsx`'s own `onChange`
handlers, calling the exposed `setSpeedMode`/`toggleSbk`/`setCustSpeed`
— which only ever update React state, since a public-facing setter
function has no reason to also know about a private, internal ref.

### CS Lens / SE Lens

Not repeated — fully covered by `ref-mirror-of-state-needs-manual-
sync.md`. This project's own concrete cost of missing it: not a crash,
not a console error — a control that visibly changed while producing no
observable effect at all, exactly the "silent, easy to mistake for
something else" failure mode the concept file names, diagnosed only by
methodically re-reading every ref declaration in the file and asking
what, if anything, kept each one current.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: after adding the
three sync effects, changing the speed-mode buttons and the custom
speed slider mid-playback visibly changed the step cadence immediately
-- confirmed by the user directly, correcting an earlier, unrelated
report ("wait I had single block on lol") once this fix and the SBK
behavior were both actually understood correctly.
```

---

## Concept Unit: Selecting Is Deciding What Runs

### The Problem

Detailed, multi-message specification from the user: checkboxes on the
Program row (select-all/clear-all) and on each Operation; a plain click
toggles just that operation, independently, with no modifier needed;
Shift+click additively range-selects between the last-clicked operation
and the one just clicked; a green glowing border shows what's selected;
and — the real design decision, stated as an explicit correction —
unchecked operations must not be simulated at all: no selection means
*nothing* is eligible, not "default to the whole program, narrowed by
what's unchecked."

### Introduce the Concept in Isolation

**REAPPEARING** for the range-select math itself (a `Set`, `Math.min`/
`Math.max` — no new concept needed there). The one genuinely new piece
— recovering each operation's real `command_index` range after it's
already been grouped — gets full standalone treatment in
`concepts/cumulative-offset-range-mapping.md`; read that first.

### Project Change

- **Reference Source** — none; a real addition beyond the reference,
  which has no operation-selection mechanism at all.
- **Files affected** — `cnc-web/src/BlockList.tsx`.
- **Change type** — add.
- **Location** — `OperationBlock`'s own header, the Program header, and
  a new module-level helper near `buildOperations`.
- **Dependencies** — `cumulative-offset-range-mapping.md`.

### The New Code

```ts
// Real, not inferred -- the [start, end] range (inclusive) of real
// command_index values (the same index space /api/path's own points/
// states are tagged with, Lesson 46) each operation occupies. `commands`
// is the *full*, untitled-comment-included array `/api/parse` returned;
// `titleOffset` is 1 when that leading title comment was stripped
// before grouping into operations, 0 otherwise -- without adding it
// back, every real command_index this function reports would be off by
// one whenever a program has a real title comment (which every real
// fixture in this repo does).
function operationCommandIndexRanges(
  operations: Command[][],
  titleOffset: number,
): { start: number; end: number }[] {
  let cursor = titleOffset;
  return operations.map((op) => {
    const start = cursor;
    cursor += op.length;
    return { start, end: cursor - 1 };
  });
}

function toggleOperationSelection(index: number, shiftKey: boolean) {
  setSelectedOperations((prev) => {
    const next = new Set(prev);
    if (shiftKey && lastClickedRef.current !== null) {
      const lo = Math.min(lastClickedRef.current, index);
      const hi = Math.max(lastClickedRef.current, index);
      for (let i = lo; i <= hi; i++) next.add(i);
    } else if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    return next;
  });
  lastClickedRef.current = index;
}

function toggleSelectAll() {
  setSelectedOperations((prev) =>
    prev.size === operations.length ? new Set() : new Set(operations.map((_, i) => i)),
  );
}
```

### The Updated Project

The reporting effect that turns operation-index selection into the real
command indices `usePlayback` actually needs:

```ts
// Reports the real, current selection upward as command_index values
// (App.tsx's own stepper reads this, not operation indices -- those
// are only meaningful within this component's own render).
useEffect(() => {
  const indices = new Set<number>();
  for (const opIndex of selectedOperations) {
    const range = operationRanges[opIndex];
    if (!range) continue;
    for (let i = range.start; i <= range.end; i++) indices.add(i);
  }
  onSelectionChange(indices);
}, [selectedOperations, operationRanges, onSelectionChange]);
```

`OperationBlock`'s header, converted from `<button>` to `<div>` for the
same real HTML-nesting reason `ToolCardList.tsx`'s own checkbox already
established (Lesson 18: an `<input>` cannot legally nest inside a
`<button>`):

```tsx
<div className="block-row-header" onClick={() => setExpanded((e) => !e)}>
  <input
    type="checkbox"
    checked={selected}
    onChange={() => {}}
    onClick={(e) => {
      e.stopPropagation();
      onToggleSelect(e.shiftKey);
    }}
  />
  <span className="block-row-toggle">{expanded ? "▾" : "▸"}</span>
  ...
</div>
```

`App.tsx`'s own consumption of the reported selection — the real place
"no selection means nothing eligible" is enforced:

```ts
// Real command indices the Operations tab's checkboxes have selected
// (BlockList.tsx reports this up whenever selection changes). Per
// direct correction: no selection means *nothing* is eligible, not
// "default to the whole program" -- selecting is how you say what
// gets simulated at all, not just how you narrow an already-showing
// default down.
const [selectedCommandIndices, setSelectedCommandIndices] = useState<Set<number> | null>(null);
const isEligible = (commandIndex: number) =>
  !!selectedCommandIndices && selectedCommandIndices.has(commandIndex);
```

The real CSS the two checkboxes' own real position (`OperationBlock`'s
row header, and the Program header right above it) depends on:

```css
.block-row-header input[type="checkbox"],
.block-program-header input[type="checkbox"] {
  margin: 0;
  flex-shrink: 0;
  accent-color: var(--color-status-on);
}
```

**(a) first appearance** of an **attribute selector** in this project:
`input[type="checkbox"]` matches an `<input>` element only when its real
`type` attribute is exactly `"checkbox"` — narrower than the bare type
selector `input` (which would also match a text field, a range slider,
anything sharing that one HTML tag), and it works with no class at all,
since the checkbox itself carries no `className` of its own here — only
its two possible *containers* do, which is why the rule is written as
two container-scoped, comma-separated descendant selectors rather than
one bare `input[type="checkbox"]`. `accent-color` is a real, standard
property that recolors a checkbox's own native checked-state fill
without replacing the browser's native checkbox rendering entirely (the
older, heavier alternative) — set to the same green already used for
every other "on" status in this project, not a new color.

### Mechanical Walkthrough

- `toggleOperationSelection`'s own plain-click branch (`else if
  next.has(index) ... else ...`) toggles exactly one operation,
  independently of every other one already checked — there is no
  modifier key required to check more than one, a real, deliberate
  simplification against a fuller "Explorer-style" model (Ctrl to
  add/remove, plain click replaces the whole selection) that was
  proposed first and explicitly corrected: "we can now leave selected
  operations checked and not have to hold control."
- The Shift+click branch instead computes an inclusive range between
  `lastClickedRef.current` (whichever operation index was clicked most
  recently, of *any* kind of click) and the newly clicked one, adding
  every index in between to whatever's already selected — additive, not
  replacing, per direct instruction ("but I still want a shift").
- `onChange={() => {}}` on the checkbox is a deliberate no-op — React
  warns about a "controlled input" (one with a `checked` prop) that has
  no `onChange` at all; the real toggle logic lives in `onClick`
  instead, specifically because `e.shiftKey` is available there and not
  on a synthetic `onChange` event.
- `isEligible`'s own `!!selectedCommandIndices && ...` — `null` (never
  selected anything yet) and an empty `Set` (selected something, then
  cleared it) both correctly resolve to "nothing eligible," matching
  the direct correction exactly: selecting is what grants eligibility at
  all, not a filter narrowing an implicit "everything" default.

### CS Lens

Not repeated for the range-map itself (`cumulative-offset-range-
mapping.md`'s own CS Lens covers it: a prefix sum). The selection model
as a whole is a small, real instance of a **set data structure** used
for exactly what it's good at: membership testing (`has`), and additive
union (Shift-range, select-all) — a `Set<number>`, not an array or a
boolean-per-operation map, specifically because "is this one selected"
and "add this whole range" are both native, O(1)/O(range-length)
`Set` operations.

### SE Lens

The real, load-bearing design decision named directly in this unit's
own Problem section — "no selection means nothing is eligible" — is not
the obvious default. The obvious default (empty selection = simulate
everything, checkboxes only *narrow* it) is arguably more familiar from
file-manager-style UIs. The user's own correction flipped that
deliberately: selection here isn't a filter on an implicit default, it's
the *only* source of what's eligible at all — a real domain decision
this project's own `isEligible`/`eligibleIndices` had to get right in
two separate places (`App.tsx` and `usePlayback.ts`), not one, since
both independently decide what counts as "nothing selected."

### Commands

None new.

### Run It

```pycon
>>> def operation_ranges(operations, title_offset):
...     cursor = title_offset
...     ranges = []
...     for op in operations:
...         start = cursor
...         cursor += len(op)
...         ranges.append((start, cursor - 1))
...     return ranges
>>> operation_ranges([[1, 2, 3], [4, 5]], title_offset=1)
[(1, 3), (4, 5)]
```

Matches `operationCommandIndexRanges` exactly, confirmed directly (a
title comment at index 0 shifts every real operation's range forward by
one, exactly as the in-lesson comment states).

---

## Concept Unit: A Correctness Trap: Reference Equality in Effect Dependencies

### The Problem

Real bug, reported precisely: "Okay now step and cycle start both are
doing nothing even with reset selected," followed by "reset...is
resetting the selection to nothing without intervention." Root cause,
found by reading the actual code, not guessing: `operations`/`remaining`
in `BlockList.tsx` were plain `const`s, recomputed fresh on *every*
render, for any reason at all — not just a real reparse. The selection-
reporting effect (above) depends on `operationRanges`, itself derived
from `operations` — a new, unmemoized array reference on every render
made that effect think the selection had changed on every render,
calling `onSelectionChange` constantly, which fed into `usePlayback`'s
own `eligibleIndices` recomputing constantly, which called
`backToPreview()` constantly — Cycle Start and Reset looked broken
because the preview state was being silently reset behind them, almost
every render.

### Introduce the Concept in Isolation

First appearance of this exact failure mode in this project — full
standalone treatment: `concepts/react-effect-dependency-reference-
equality.md`. Read that first; its own isolated example (an unmemoized
`.map()` feeding a `useEffect`'s dependency array, firing on every
unrelated render) is precisely this project's own mistake, generalized.

### Project Change

- **Reference Source** — none; a real bug in this project's own new
  code.
- **Files affected** — `cnc-web/src/BlockList.tsx`.
- **Change type** — replace (plain `const`s become `useMemo`).
- **Location** — directly above the selection-reporting effect.
- **Dependencies** — `react-effect-dependency-reference-equality.md`.

### The New Code

```ts
// Real, load-bearing memoization, not just tidiness: `commands` (from
// useState) is only a *new* reference after a genuine reparse -- but
// `.slice()`/`buildOperations()` themselves build a brand-new array
// every time this component renders at all, for *any* reason. Without
// useMemo here, `operations` (and everything downstream of it --
// `operationRanges`, the selection-reporting effect below) got a new
// reference on every render, not just real reparses -- which made the
// "report selection upward" effect re-fire constantly, which reset
// usePlayback's own preview state on almost every render, which is
// the real reason Cycle Start/Reset looked broken.
const remaining = useMemo(
  () => (commands ? (hasTitle ? commands.slice(1) : commands) : []),
  [commands, hasTitle],
);
const hasRealSeqNumbers = remaining.some((c) => c.has_real_seq_n);
const operations = useMemo(
  () => buildOperations(remaining, hasRealSeqNumbers),
  [remaining, hasRealSeqNumbers],
);
const titleOffset = hasTitle ? 1 : 0;
const operationRanges = useMemo(
  () => operationCommandIndexRanges(operations, titleOffset),
  [operations, titleOffset],
);
```

`hasTitle` itself had to move above every early return in the
component, computed unconditionally (`!!commands && ...`), since the
Rules of Hooks require every `useMemo`/`useEffect` call to run in the
same order on every render — it can't sit below an `if (!commands)
return ...` the way it did before this feature needed to depend on it.

### Mechanical Walkthrough
Exactly the mechanism `react-effect-dependency-reference-equality.md`
names: `commands.slice(1)` and `buildOperations(...)` are plain function
calls, re-evaluated in full on every render regardless of whether
- `commands` itself changed — wrapping each in `useMemo` with the real
input it actually depends on (`[commands, hasTitle]`, then `[remaining,
hasRealSeqNumbers]`, then `[operations, titleOffset]`) means each one
only produces a *new* reference when its own real inputs changed,
breaking the cascade.

### CS Lens / SE Lens

Not repeated — fully covered by the concept file, including its own SE
Lens naming exactly this project's own failure mode: "an effect that
reports a derived value upward to a parent... causes the parent to
re-render, which can cause the child to re-render again... a real,
self-sustaining loop." Confirmed directly, this session, as the actual
mechanism behind two separate user-facing symptoms that initially
looked unrelated (Cycle Start "not working," and selection "resetting
to nothing without intervention").

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: before this fix,
checking an operation and pressing Cycle Start visibly did nothing;
after adding the three useMemo calls, Cycle Start and Reset both behaved
correctly, and the selection stopped clearing itself on unrelated
renders.
```

---

## Concept Unit: Keeping Hidden Tabs Alive

### The Problem

Real bug, reported precisely: selection "resetting to nothing without
intervention" persisted even after the memoization fix above — a
*second*, independent bug compounding the first. Root cause:
`SidePanel.tsx` only ever rendered whichever tab was currently active
(`activeTab ? activeTab.content : ...`). Switching from the Operations
tab (where the checkboxes live) to the DRO tab (where Play/Step live,
per the earlier placement decision) unmounted `BlockList` entirely —
React discards a component's own state the instant it's no longer part
of the rendered tree — wiping `selectedOperations` back to its initial
empty `Set` every single time.

### Introduce the Concept in Isolation

First appearance of this exact failure mode in this project — full
standalone treatment: `concepts/keep-mounted-vs-conditional-unmount.md`.
Read that first; its own isolated example (`{visible && <Counter/>}`
resetting a click counter on every hide/show cycle) is precisely this
project's own `SidePanel` mistake, generalized.

### Project Change

- **Reference Source** — none; a real, pre-existing bug in
  `SidePanel.tsx`, exposed by this feature rather than caused by it —
  the moment any tab needed to keep meaningful state across a tab
  switch, this became a real, user-facing problem, not a latent one.
- **Files affected** — `cnc-web/src/SidePanel.tsx`.
- **Change type** — replace.
- **Location** — `side-panel-body`'s own render.
- **Dependencies** — `keep-mounted-vs-conditional-unmount.md`.

### The New Code

```tsx
{/* Real, not cosmetic: every open tab's content stays mounted,
    hidden via display:none rather than only ever rendering the
    active one. A tab's own real component state (BlockList.tsx's
    operation selection, a scroll position, a cursor position)
    used to be silently discarded the instant you switched away
    from it, since React unmounts anything not actually included
    in the returned tree -- not a hypothetical, a real bug this
    fixed (Lesson 46's own step-selection feature lost its
    selection on every switch to the DRO tab to press Play). */}
{tabs.length > 0 ? (
  tabs.map((tab) => (
    <div key={tab.id} style={{ display: tab.id === activeTabId ? "contents" : "none" }}>
      {tab.content}
    </div>
  ))
) : (
  <div className="side-panel-empty">No panels open.</div>
)}
```

The dead `activeTab` variable this replaces (`tabs.find((tab) => tab.id
=== activeTabId)`) was removed entirely — nothing else in the file
still read it.

### Mechanical Walkthrough
`display: "contents"` (not `"block"`) for the active tab specifically
- — `contents` makes the wrapping `<div>` itself disappear from layout
entirely, so its own children lay out exactly as if that `<div>` weren't
there at all, avoiding an extra, unstyled box in the DOM around every
tab's real content. Every tab (not just `BlockList`) now stays mounted
for as long as it's ever been opened, whether or not it happens to be
the one currently visible.

### CS Lens / SE Lens

Not repeated — fully covered by the concept file, including its SE
Lens's own real tradeoff (every hidden tab keeps its DOM nodes/state
alive, a real, if usually small, resource cost, versus a conditionally-
rendered tab silently losing state on every switch). The concrete win
named directly: this fix isn't scoped narrowly to `BlockList`'s own
selection — every other tab this project has or will ever add (a
scroll position, an in-progress edit, a collapsed/expanded state) now
survives a tab switch too, for free.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: checking two
operations in the Operations tab, switching to the DRO tab to press
Cycle Start, then switching back to Operations -- the same two
checkboxes remained checked, where before this fix the selection was
always empty on return.
```

---

## Concept Unit: One Less Redundant Fetch

### The Problem

`MachineStatus.tsx` had its own, independent `fetchState` call against
`/api/simulate`, on the same `debouncedCode` dependency `App.tsx`'s own
`fetchPath` (`/api/path`) already used — two separate backend requests,
computing overlapping real machine state, racing the same debounce,
every time the program changed. Once `/api/path` started returning a
full `states` array (one snapshot per command, the first unit above),
`MachineStatus`'s own independent fetch became pure duplication.

### Project Change

- **Reference Source** — none; a real, opportunistic simplification
  this feature's own backend change made possible, not requested
  separately.
- **Files affected** — `cnc-web/src/MachineStatus.tsx`, `cnc-web/src/App.tsx`.
- **Change type** — replace.
- **Location** — `MachineStatus`'s own component body.
- **Dependencies** — the `compute_steps` unit above.

### The New Code

```tsx
// Real, no longer independently fetched (see App.tsx's own note on this) --
// this used to be MachineStatus's own /api/simulate call, computing the
// exact same thing /api/path's new `states` array (core/path.py's
// compute_steps) already computes once, per command, for the step-through
// feature. App.tsx now owns fetching this and passes down whichever one
// entry (by stepIndex) is currently relevant -- one real computation,
// not two redundant ones racing the same debounce.
export interface MachineStateData {
  position: Position;
  feed: number;
  spindle_rpm: number;
  spindle_dir: string;
  coolant_flood: boolean;
  coolant_mist: boolean;
}

interface MachineStatusProps {
  state: MachineStateData | null;
}

function MachineStatus({ state }: MachineStatusProps) {
  if (!state) {
    return <p>loading machine state...</p>;
  }
  ...
}
```

`App.tsx`'s own real fallback for "nothing stepped yet" (`stepIndex ===
-1`, since JS's own array indexing returns `undefined` for `-1`, unlike
Python's negative indexing):

```ts
// The real, resolved state before any command has run -- matching a
// fresh core/machine.py MachineState()'s own real defaults exactly.
// Shown at stepIndex -1 (Reset): without this, `states[-1]` is
// `undefined` in JS (unlike Python's negative indexing), and the DRO
// would show "loading machine state..." forever at Reset instead of a
// real, honest zeroed/home state.
const HOME_STATE: MachineStateData = {
  position: { x: 0, y: 0, z: 0 },
  feed: 0,
  spindle_rpm: 0,
  spindle_dir: "",
  coolant_flood: false,
  coolant_mist: false,
};
const currentState = playback.stepIndex === -1 ? HOME_STATE : (states[playback.stepIndex] ?? null);
```

The real call that produces `playback` itself, and the filter that turns
`points` (every command's own, already-resolved geometry) into whatever
the viewport should actually reveal right now — this lesson's own title,
as real code:

```ts
const playback = usePlayback(states, selectedCommandIndices);
const revealedPoints = useMemo(
  () =>
    points.filter(
      (p) => p.command_index === null || (isEligible(p.command_index) && p.command_index <= playback.stepIndex),
    ),
  [points, playback.stepIndex, selectedCommandIndices],
);
```

And the real JSX wiring — where `PlaybackControls` and the now
prop-driven `MachineStatus` actually live, and where `revealedPoints`
replaces the raw `points` the viewport used to receive directly:

```tsx
if (id === "dro") {
  // PlaybackControls lives here now, not as a permanent top bar --
  // per direct instruction: the stepper is a DRO-tab concern, not
  // something that should occupy screen space for every other tab.
  return (
    <>
      <PlaybackControls
        isPlaying={playback.isPlaying}
        isReset={playback.isReset}
        onToggleCycle={playback.toggleCycle}
        onStep={playback.step}
        sbk={playback.sbk}
        onToggleSbk={playback.toggleSbk}
        onReset={playback.reset}
        speedMode={playback.speedMode}
        onSetSpeedMode={playback.setSpeedMode}
        custSpeed={playback.custSpeed}
        onSetCustSpeed={playback.setCustSpeed}
      />
      <MachineStatus state={currentState} />
    </>
  );
}
```
```tsx
<Viewport points={revealedPoints} themeId={themeId} />
```

### Mechanical Walkthrough
`MachineStatus` lost its own `useEffect`/`fetchState`/`logger` entirely
— it is now a pure, prop-driven display component, rendering whatever
`state` it's handed. `App.tsx` became the one real owner of "what is the
machine's current state," computing `currentState` from the same
`states` array `revealedPoints` already filters against, keyed by the
- same `playback.stepIndex` — one real source of truth, read in two
places, rather than two independent computations of the same thing.

- `revealedPoints`'s own filter — **(b) reappearing** `.filter` — keeps a
point either because it's the synthetic start point (`command_index ===
null`, always drawn) or because it's *both* eligible (its owning
command is really selected) *and* at or before the current step. That
second condition is what makes this whole feature's own title literally
true in code: a point whose command was never selected can never pass
- `isEligible`, no matter what `playback.stepIndex` is — selecting is what
grants a point eligibility to ever be drawn at all, stepping only
decides how far through the already-eligible set to reveal.
`useMemo`'s own three dependencies (`points`, `playback.stepIndex`,
- `selectedCommandIndices`) are every real input this filter reads — the
identical discipline the reference-equality unit above already
established, applied here on the first attempt rather than found as a
second bug.

### CS Lens

Not a hard CS concept — a direct instance of eliminating **redundant
computation**: two independent code paths were computing overlapping
real data from the same real input; recognizing the overlap once one
of them already had to change (for the step-through feature) let the
other be deleted rather than kept as parallel, duplicated work.

### SE Lens

The real, concrete cost this removed: a second real HTTP round-trip to
the backend, on every 900ms debounce tick, computing state this project
already had. Beyond the wasted request itself, two independent fetches
racing the same debounce is a real source of a *second*, subtler bug
class this project didn't happen to hit here but easily could have —
two requests resolving out of order, each overwriting the other's
result with stale data. Removing the second fetch entirely removes that
whole risk, not just the redundant work.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: the DRO tab's
position/feed/spindle/coolant readout updates correctly as Step/Play
advance stepIndex, driven entirely by App.tsx's own currentState lookup
-- no second network request observed in the browser's own network
panel for /api/simulate, confirming it's no longer called at all.
```

---

## Connect the Pieces

One real chain, start to finish: `/api/path` now returns `points` (each
tagged with the `command_index` that produced it) and `states` (one
`MachineState` snapshot per command), both from a single pass over the
program (`compute_steps`) rather than two separate mechanisms. The
Operations tab's checkboxes (`BlockList.tsx`) let a user decide which
real command indices are even eligible to simulate — reported upward as
a `Set<number>` via `operationCommandIndexRanges`, memoized correctly
so the report only actually changes when the real selection does.
`usePlayback` filters `states` down to just those eligible indices,
tracks whether stepping has actually begun (`hasStarted`), and exposes
one `stepIndex` either way — the complete, selected toolpath in
preview, or the real cursor position once Step/Play has been pressed.
`App.tsx` reads that one number to decide both which points to reveal
in the viewport and which single machine-state snapshot to show in the
DRO — the same real data, read consistently in two places, with no
second backend call needed for either. Every open side-panel tab now
survives being switched away from, so the selection driving all of this
doesn't silently vanish just because the user looked at a different
tab to press Play.

## What Breaks Without This

Reverting `operations`/`remaining`/`operationRanges` back to plain
`const`s (the pre-memoization state) and re-running the exact same
sequence — check two operations, switch to the DRO tab, press Cycle
Start:

```
Real, reproduced this session before the fix: Cycle Start visibly does
nothing; the console (with the temporary diagnostic logging re-added)
shows the selection-reporting effect firing on every render, not just
on real selection changes, each firing calling usePlayback's own
backToPreview() and resetting stepIndex to -1 before any real step can
accumulate.
```

Reverting `SidePanel.tsx` back to `activeTab ? activeTab.content : ...`
and repeating the same tab switch: the Operations tab's checkboxes are
visibly unchecked again the instant the DRO tab is opened, since
`BlockList` was unmounted and remounted from scratch.

## Exercises

1. Read `concepts/cumulative-offset-range-mapping.md`'s own Try-It-
   Yourself exercise 2 (a repeated word breaking a search-based
   alternative) and explain, in this project's own terms, what would
   go wrong if `operationCommandIndexRanges` searched for each
   operation's own first command in the flat list instead of tracking a
   running cumulative total — name a real program shape (from any
   fixture already in this repo) where two operations could plausibly
   look identical enough to make that search ambiguous.
2. Trace `stepIndex`'s own ternary by hand for a selection of three
   operations, stepping through all of them, then changing the
   selection to just one of the three mid-step — confirm (by reading
   the code, not just running it) that `usePlayback`'s own reset-on-
   selection-change effect returns to preview rather than leaving
   `cursor` pointing at a now-invalid position.
3. `ref-mirror-of-state-needs-manual-sync.md`'s own Try-It-Yourself
   exercise 3 asks what happens with a *conditional* ref sync. Find the
   one place in `usePlayback.ts` where a similar conditional update
   would be tempting (hint: `custSpeedRef` only matters when
   `speedMode === "custom"`) and explain why syncing it unconditionally
   anyway, every time `custSpeed` changes, is still the correct choice.

## Known Incomplete — Named Directly

- **The reference's `feedOvr` (feed-override) multiplier** is treated
  as `1` (no override) in `autoRun`'s own delay formula — this project
  has no feed-override control yet (`OverrideSlider.jsx`, a separate,
  un-ported reference component); named directly in the code comment
  rather than silently assumed away.
- **Styling for the control bar and selection glow** was iterated
  externally, alongside this feature, past what this lesson's own diff
  coverage tracks in full line-by-line detail (a `.btn-group`/`ctrlbar-
  row` restructuring, a custom-scrollbar addition, glassmorphism
  touches) — this lesson covers the real, functional/behavioral pieces
  in full; the purely cosmetic CSS additions are real but not narrated
  rule-by-rule here, per the user's own stated priority this session
  (lesson quality on the real mechanism first; the app's own visual
  polish is secondary, to be refined personally in phase 2).
- **This project's own `write lessons from the diff, not the story`
  discipline** applies here at real scale: this lesson covers eight
  distinct concept units from one large commit — verified, before
  writing, against the actual `git show` diff for every file named
  above, not from memory of the session's own back-and-forth.

## Definition of Done

- [x] `compute_steps` replacing `compute_path`, real divergence from
      the reference named directly, in code and in this lesson.
- [x] `usePlayback.ts`: preview-vs-stepping (`hasStarted`), the
      self-rescheduling `autoRun` (rAF/setTimeout, SBK-in-non-MAX-only
      quirk faithfully ported), three ref-sync effects fixing the
      speed-mode/SBK bug.
- [x] `BlockList.tsx`: independent per-operation checkboxes, Program
      select-all/clear-all, Shift-range-select, `operationCommandIndex
      Ranges`, real `useMemo` fixing the reference-instability cascade.
- [x] `SidePanel.tsx`: every open tab stays mounted, fixing the
      selection-loss-on-tab-switch bug.
- [x] `MachineStatus.tsx`: redundant `/api/simulate` fetch removed,
      now prop-driven from `App.tsx`'s own single `states` array.
- [x] Four new, project-independent concept files (`react-effect-
      dependency-reference-equality.md`, `keep-mounted-vs-conditional-
      unmount.md`, `cumulative-offset-range-mapping.md`, `ref-mirror-
      of-state-needs-manual-sync.md`).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 4/4 passing (`segments.test.ts`, updated for
      `command_index`).
- [x] Live-browser verification, this session, for every real behavior
      named above (preview display, Step/Play/Reset, selection
      checkboxes, the tab-switch fix, the ref-sync fix) — confirmed
      directly by the user across multiple rounds of real bug reports
      and fixes, not assumed.

```
git commit -m "Lesson 46: selecting is deciding what runs"
```
