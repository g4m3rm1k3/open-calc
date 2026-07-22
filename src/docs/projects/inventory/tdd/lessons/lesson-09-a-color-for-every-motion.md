# Lesson 9: A Color for Every Motion

## What you will build

The deferred piece Lesson 8 named explicitly: real toolpaths where rapid
moves (`G0`) and feed moves (`G1`) render as genuinely different colors,
matching the reference app exactly — red for rapid, green for feed.
`core/path.py` now records *which* motion mode produced each point;
`cnc-web` gets a new, independently-tested pure function,
`groupSegments()`, and a real automated test suite (Vitest) — this
project's first. The transferable problem: **a list of points is not
enough to draw a real toolpath — you also need to know what kind of move
connects each pair of them**, and **logic that transforms data (grouping
points into segments) is worth separating from logic that draws pixels**,
so the first can be tested in complete isolation from a browser or a
GPU.

## What you need to know first

Lesson 6: `compute_path()`'s point-recording loop. Lesson 8: the Three.js
scene, `THREE.Line`/`BufferGeometry`, and its own named, deferred gap —
this lesson closes it. Lesson 4: `Parser`'s `command["motion"]` field,
already computed, never yet used past `MachineState`.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/python-dict-unpacking.md`
- `../concepts/deep-equality-vs-reference-equality.md`
- `../concepts/automated-testing-unit-test-basics.md`
- `../concepts/pure-functions-testability.md`
- `../concepts/ternary-conditional-operator.md`
- `../concepts/javascript-array-foreach.md`
- `../concepts/typescript-type-only-import.md`
- `../concepts/test-doubles-and-mocking.md` — added retroactively, found
  missing while cross-referencing a professional-software-engineering-
  concepts checklist: this project's test suite has never needed one,
  which is itself worth teaching.

## Pipeline diagram

```
Text → Tokens → Commands → Machine State → Points → Picture
```
No new stage — this lesson makes the existing `Points` stage carry one
more real piece of information (which motion produced each point) so
`Picture` can use it. Concrete value: `"G0 X10 Y20\nG1 X30\nG0 Z-5"`'s
third point was, since Lesson 6, just `{"x": 30.0, "y": 20.0, "z": 0.0}`
— this lesson, it's `{"motion": "G1", "x": 30.0, "y": 20.0, "z": 0.0}`,
enough to know it should render green, not red.

---

## Concept Unit: Every Point Remembers What Made It

### The Problem

`compute_path()` (Lesson 6) records a position after every command but
throws away *which command* produced it — `state.apply(command)` reads
`command["motion"]` internally (Lesson 5) but nothing outside
`MachineState` ever sees it. Coloring a path by motion mode needs that
information to survive all the way to the frontend.

### Reference Source, Read for Real This Session

`cnc-sim/cnc/CNCBackplot.tsx` lines 913–947 (the real segment-grouping
loop this lesson ports, quoted, already read in full for Lesson 8's own
research):
```tsx
let currentSegment = {
  points: [new THREE.Vector3(pathPoints[0].machineX, ...)],
  mode: pathPoints[0].motionMode || "G00",
  channelId: pathPoints[0].channelId ?? 0,
};
for (let i = 1; i < pathPoints.length; i++) {
  const mode = pt.motionMode || "G00";
  if (mode !== currentSegment.mode || channelId !== currentSegment.channelId) {
    segments.push(currentSegment);
    currentSegment = {
      points: [currentSegment.points[currentSegment.points.length - 1], v],
      mode,
      channelId,
    };
  } else {
    currentSegment.points.push(v);
  }
}
segments.push(currentSegment);
```
This confirms the real source data this project needs: each of the
reference's own path points already carries a `motionMode` field
(`pathPoints[0].motionMode`) — exactly the piece `compute_path()` needs
to start recording. **Named, deliberate deviation:** `channelId` is not
ported — this project has no multichannel concept yet (a much later
build-order item); every point implicitly belongs to one, unnamed
channel.

### The New Code

```python
def compute_path(commands):
    state = MachineState()
    points = [{"motion": DEFAULT_MOTION, **state.position()}]
    for command in commands:
        state.apply(command)
        points.append({"motion": command["motion"], **state.position()})
    return points
```

### The Updated Project

The complete, current `core/path.py`:
```python
from core.machine import MachineState

DEFAULT_MOTION = "G0"


def compute_path(commands):
    state = MachineState()
    points = [{"motion": DEFAULT_MOTION, **state.position()}]
    for command in commands:
        state.apply(command)
        points.append({"motion": command["motion"], **state.position()})
    return points
```
As a whole: every point this function returns now carries both where the
machine was *and* what kind of move put it there — the origin point
defaults to `"G0"` (matching `MachineState`'s own default motion, Lesson
5), matching real machine behavior where the very first move, with no
prior context, is conventionally a rapid positioning move.

### Mechanical Walkthrough

- `DEFAULT_MOTION = "G0"` — **(a) first appearance** of a **module-level
  constant** in this file, named rather than inlined, specifically so the
  one place this default is decided is unambiguous and grep-able.
- `{"motion": DEFAULT_MOTION, **state.position()}` — **(a) first
  appearance** of `**` used in a **dict literal** (distinct from Lesson
  4's `**` inside f-string math — unrelated meanings sharing one
  character).
  *(Full standalone treatment: ../concepts/python-dict-unpacking.md.)*
  `**state.position()` **unpacks** every key-value pair from
  the dict `state.position()` returns (`x`, `y`, `z`) directly into this
  new, larger dict literal, alongside the explicitly-written `"motion"`
  key — equivalent to writing `{"motion": ..., "x": ..., "y": ...,
  "z": ...}` by hand, without needing to know or repeat `position()`'s
  exact fields here.
- `{"motion": command["motion"], **state.position()}` — same unpacking,
  now reading the *real* motion mode off the command that was just
  applied, rather than the constant — **(b) reappearing** dict indexing
  (`command["motion"]`, guaranteed present by every command `Parser`
  produces, Lesson 4).

### CS Lens

`**` unpacking here is **structural composition** — building a larger
value out of smaller, already-correct pieces without needing to name or
duplicate their internals — the same instinct as Lesson 6's `compute_path`
composing `MachineState`, expressed at the value level instead of the
function level.

### SE Lens

This is a real, minor **breaking change** to `/api/path`'s response shape
— every point gains a new field. Named honestly rather than silently: no
existing consumer breaks, because JSON consumers (Lesson 8's `viewport.
ts`) read named fields, not positional ones, and TypeScript's structural
typing (Lesson 7) means an object with *extra* fields still satisfies a
type that only names some of them — verified directly, next unit, before
`viewport.ts`'s own types are updated to actually use the new field.

---

## Concept Unit: A Pure Function, Ported and Tested Before It Touches a Scene

*(Full standalone treatment: ../concepts/pure-functions-testability.md.)*

### The Problem

Grouping points into same-motion runs is a real, non-trivial piece of
logic (Lesson 8 already showed real, escalating test cases exist for it
in spirit) — worth getting right and verifying *before* wiring it into
Three.js, where a mistake would be much harder to notice than a failing
assertion.

### Project Change

- **Reference Source** — `cnc-sim/cnc/CNCBackplot.tsx` lines 913–947,
  quoted and reconciled above (channel grouping deliberately omitted).
- **Files affected** — new `cnc-web/src/segments.ts`, new
  `cnc-web/src/segments.test.ts`.
- **Change type** — add.
- **Location** — `src/`, alongside `viewport.ts`.
- **Dependencies** — none beyond TypeScript itself; deliberately **zero**
  dependency on `three` — the whole point of separating this logic out.

### The New Code

```typescript
export interface PathPoint {
  motion: string;
  x: number;
  y: number;
  z: number;
}

export interface Segment {
  motion: string;
  points: PathPoint[];
}

export function groupSegments(points: PathPoint[]): Segment[] {
  if (points.length === 0) return [];
  const segments: Segment[] = [];
  let current: Segment = { motion: points[0].motion, points: [points[0]] };
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point.motion !== current.motion) {
      segments.push(current);
      current = {
        motion: point.motion,
        points: [current.points[current.points.length - 1], point],
      };
    } else {
      current.points.push(point);
    }
  }
  segments.push(current);
  return segments;
}
```

### Mechanical Walkthrough

- `export interface PathPoint { motion: string; x: number; ... }` — **(b)
  reappearing** interface syntax (Lesson 7) and `export` (Lesson 7's
  `vite.config.ts`; *../concepts/javascript-es-modules-import-export.md*),
  now the real shape
  `core/path.py` produces, `export`ed so other files (`main.ts`,
  `viewport.ts`) can import and use this exact type instead of each
  re-declaring their own copy — closing Lesson 8's own named, minor debt
  (a duplicated `Point` interface).
- `if (points.length === 0) return [];` — an explicit, named **edge
  case** — an empty path produces an empty segment list, not an error or
  a segment with no points.
- `let current: Segment = { motion: points[0].motion, points:
  [points[0]] };` — the first segment starts as just the first point,
  tagged with its own motion mode.
- `if (point.motion !== current.motion)` — **(a) first appearance of the
  actual grouping decision**, ported directly from the reference's
  identical comparison (`mode !== currentSegment.mode`): a change in
  motion mode ends the current run.
- `current = { motion: point.motion, points: [current.points[current.
  points.length - 1], point] };` — **(a) the one real, easy-to-miss
  detail, ported faithfully rather than simplified away**: the *new*
  segment starts with **two** points — the *last* point of the segment
  that just ended, plus this new one — not just the new point alone.
  Without this, two adjacent segments would each start and end at
  different points with a real, visible gap between them; verified
  broken and fixed, next unit.
- `current.points.push(point)` — same motion mode as the current run:
  extend it.
- `segments.push(current); return segments;` — the loop never pushes the
  *final* run inside itself (nothing after it changes the mode to detect
  the end), so it's pushed once, explicitly, after the loop — a real,
  common off-by-one shape worth naming, not just writing correctly by
  luck.

### Discard — Not This Time

Unlike every previous concept lab in this project, `groupSegments` is
**not** discarded — it's the real, project-permanent version, because
this exact escalating-input verification (next unit) *is* its real test
suite, not a disposable rehearsal. The Concept Isolation Rule's spirit
(prove a mechanism in isolation before trusting it inside something
larger) is honored here by testing it with zero dependency on Three.js
or a browser at all — isolation from *complexity*, not from the project
itself.

---

## Concept Unit: A Real, Automated Test Suite — This Project's First

*(Full standalone treatment: ../concepts/automated-testing-unit-test-basics.md.)*

### The Problem

Every previous verification in this project has been a script, run once,
by hand, its output pasted into a lesson. That doesn't scale, and it
doesn't protect against a *future* change silently breaking something
already proven correct.

### Commands, Run for Real

```
npm install --save-dev vitest
```
`vitest` — **(a) first appearance** — a real, automated test runner for
JavaScript/TypeScript, chosen (like `pytest` will be, in a later
`cnc-service` lesson) specifically because it integrates with this
project's existing tool (Vite itself; the name is not a coincidence —
Vitest reuses Vite's own fast module transformation).

### The New Code

```typescript
import { describe, it, expect } from "vitest";
import { groupSegments } from "./segments.ts";

describe("groupSegments", () => {
  it("returns one segment when every point shares the same motion mode", () => {
    const points = [
      { motion: "G1", x: 0, y: 0, z: 0 },
      { motion: "G1", x: 10, y: 0, z: 0 },
    ];
    expect(groupSegments(points)).toEqual([{ motion: "G1", points }]);
  });

  it("splits into a new segment when the motion mode changes", () => {
    const points = [
      { motion: "G0", x: 0, y: 0, z: 0 },
      { motion: "G0", x: 10, y: 20, z: 0 },
      { motion: "G1", x: 30, y: 20, z: 0 },
      { motion: "G0", x: 30, y: 20, z: -5 },
    ];
    const result = groupSegments(points);
    expect(result).toHaveLength(3);
    expect(result[0].motion).toBe("G0");
    expect(result[1].motion).toBe("G1");
    expect(result[2].motion).toBe("G0");
  });

  it("carries the boundary point into the next segment so the line stays connected", () => {
    const points = [
      { motion: "G0", x: 0, y: 0, z: 0 },
      { motion: "G1", x: 10, y: 0, z: 0 },
    ];
    const result = groupSegments(points);
    expect(result[0].points[result[0].points.length - 1]).toEqual(result[1].points[0]);
  });

  it("returns an empty array for an empty input", () => {
    expect(groupSegments([])).toEqual([]);
  });
});
```

### Mechanical Walkthrough

- `import { describe, it, expect } from "vitest";` — **(a) first
  appearance** of testing-framework syntax: `describe(name, fn)` groups
  related tests under one label, purely organizational; `it(name, fn)`
  (an alias for `test`) declares one real, individually-runnable test
  case, named in plain language describing the expected behavior;
  `expect(value)` wraps a real value so an assertion method can be
  chained onto it.
- `.toEqual(...)` — **(a) first appearance** — asserts **deep equality**
  (same structure and values, checked recursively) — the correct choice
  for comparing plain objects/arrays here, as opposed to `.toBe(...)`
  (checked in the next unit), which asserts the exact same reference —
  the identical `toBe`-vs-`toEqual` distinction this project's own
  `LessonContract` already names as a real, common gotcha.
  *(Full standalone treatment: ../concepts/deep-equality-vs-reference-equality.md.)*
- `.toHaveLength(3)` / `.toBe("G0")` — real, specific assertions read
  directly as English — each test's name states *what* is being proven;
  the assertions inside prove it precisely, not just "it didn't crash."
- Four `it(...)` blocks — **(a) an escalating sequence turned into a
  real, permanent test suite**: one motion mode throughout (no splitting
  at all), a real split with three segments, the specific
  boundary-connectedness detail named as its own explicit case, and the
  empty-input edge case — each isolating exactly one behavior, the same
  discipline this project's own lesson schema requires of its prose
  walkthroughs, now applied to code that checks itself.

### Commands and Real Output

```
npx vitest run
```
**Real output:**
```
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

**A real regression, caused on purpose, this session** — the boundary-
point line changed from
`points: [current.points[current.points.length - 1], point]` to just
`points: [point]` (silently dropping the connecting point):
```
 ❯ src/segments.test.ts (4 tests | 1 failed)
     × carries the boundary point into the next segment so the line stays connected

AssertionError: expected { motion: 'G0', x: +0, y: +0, z: +0 } to deeply equal { motion: 'G1', x: 10, y: +0, z: +0 }
```
Caught immediately, by the exact test written to guard against it — not a
general failure, the *one* specific test whose entire job is checking
this. Reverted immediately after confirming this; all four tests pass
again.

### CS Lens

An automated test suite is **executable specification** — the four
`it(...)` blocks above are simultaneously documentation of what
`groupSegments` is supposed to do and a real, repeatable check that it
still does it, rerunnable in milliseconds, forever, at zero marginal
cost per run — a fundamentally different guarantee than this project's
prior pattern of "run a script once, read the output, trust it stays
true."

Also recognized in: every real software project's CI pipeline (this
project has none yet — a real, named, future item), `cnc-service`'s own
still-unbuilt `pytest` suite (`CURRICULUM.md`'s own deferred build-order
item), and the general engineering principle that a behavior worth
getting right once is worth being able to verify stays right forever
afterward, automatically.

### SE Lens

Testing `groupSegments` required **zero** Three.js setup, no browser, no
canvas, no WebGL context — a direct, concrete payoff of keeping it a pure
function with no dependency on rendering, named back when it was first
written. The alternative — folding this logic directly into `drawPath`
(Lesson 8's own original, single-color version did exactly this, drawing
one line with no grouping at all) — would make testing it require
mocking or spinning up a real Three.js scene just to check a plain
data-transformation question, a real, avoidable cost this project's
architecture doesn't have to pay.

*(Added retroactively, found missing while cross-referencing a real
"what every professional developer should know" checklist: this
project's test suite has never needed a stub, fake, spy, or mock —
`groupSegments` being pure is exactly why. Full standalone treatment,
including what each of those terms actually means and when a pure
function *doesn't* let you avoid them:
../concepts/test-doubles-and-mocking.md.)*

---

## Concept Unit: Drawing One Line Per Segment, Colored by What It Is

### The New Code

```typescript
import { groupSegments, type PathPoint } from "./segments.ts";

const RAPID_COLOR = 0xff8b8b;
const FEED_COLOR = 0x46d89f;

function drawPath(points: PathPoint[]) {
  while (pathGroup.children.length) {
    pathGroup.remove(pathGroup.children[0]);
  }
  if (points.length < 2) return;
  const segments = groupSegments(points);
  segments.forEach((segment) => {
    const vectors = segment.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    const color = segment.motion === "G0" ? RAPID_COLOR : FEED_COLOR;
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geometry, material);
    pathGroup.add(line);
  });
}
```

### Mechanical Walkthrough

- `import { groupSegments, type PathPoint } from "./segments.ts";` —
  **(a) first appearance** of an **inline type-only import specifier**.
  *(Full standalone treatment: ../concepts/typescript-type-only-import.md.)*
  `groupSegments` is a real function, imported normally; `type PathPoint`
  marks that *specific* named import as type-only — it exists purely for
  `tsc`'s own checking and is completely erased from the real, compiled
  JavaScript output, since an `interface` (Lesson 7) never has any actual
  runtime existence to import in the first place.
- `RAPID_COLOR` / `FEED_COLOR` replace Lesson 8's single `PATH_COLOR` —
  **(b) reappearing** hex-literal constants, real values this time
  (`0xff8b8b`/`0x46d89f`) read directly from `useCncTheme.js`'s own real
  dark-theme `rapid`/`feed` fields (already cited in Lesson 8's own
  research).
- `groupSegments(points)` — **(b) reappearing**, the function just
  proven and tested in complete isolation, now called for the first time
  from inside a real Three.js context.
- `segments.forEach((segment) => { ... })` — **(a) first appearance** of
  `.forEach()`.
  *(Full standalone treatment: ../concepts/javascript-array-foreach.md.)*
  Runs a function once per array element, purely for its
  side effects (adding a `Line` to the scene), rather than `.map()`
  (Lesson 8), which *builds a new array* from the results — the correct
  choice here since nothing needs the return value, only the act of
  adding each line.
- `const color = segment.motion === "G0" ? RAPID_COLOR : FEED_COLOR;` —
  **(a) first appearance** of the **ternary conditional operator**
  (`condition ? ifTrue : ifFalse`) in this project.
  *(Full standalone treatment: ../concepts/ternary-conditional-operator.md.)*
  A compact
  `if`/`else` that produces a *value* rather than executing a block —
  read as "if this segment's motion is `G0`, the color is rapid red;
  otherwise, it's feed green" — a direct, one-line port of the
  reference's own identical ternary (`seg.mode === "G00" ? colors.rapid :
  channelColor`), simplified since this project has no channel-based
  color variation yet.
- The rest of the loop body (`BufferGeometry`, `LineBasicMaterial`,
  `THREE.Line`, `pathGroup.add`) — **(c) already established** (Lesson
  8), now run once *per segment* instead of once for the whole path.

### CS Lens

Each segment becoming its own independent `THREE.Line` object, rather
than one line with per-vertex colors, is a real, deliberate structural
choice: Three.js *does* support per-vertex coloring on a single geometry
(a real alternative), but multiple discrete line objects — one per
motion-mode run — is what the reference itself does, and it composes
naturally with this project's own `groupSegments`, which already thinks
in terms of discrete segments, not per-point color values.

### SE Lens

`drawPath` itself barely changed in complexity from Lesson 8 — nearly all
of the real new logic lives in `groupSegments`, independently tested,
imported, and trusted. This is the concrete payoff of last unit's
separation: the Three.js-facing code stays simple specifically because it
isn't also responsible for getting the grouping logic right.

### Commands and Real Output — Verified Live

Both servers running; a real headless browser (Playwright, this session),
with a temporarily larger test program (`"G0 X100 Y100\nG1 X-100
Y100\nG0 X-100 Y-100\nG1 X100 Y-100"` — reverted immediately after,
`main.ts`'s real, committed sample program is unchanged) to make the color
alternation visually unambiguous in a screenshot:

A real screenshot showed a real, four-segment path alternating red
(`G0`) → green (`G1`) → red (`G0`) → green (`G1`), each corner a visible
color change exactly where the program's own motion mode changes —
confirmed, then the temporary program reverted, `tsc`/`vitest` re-run
clean.

---

## Connect the Pieces

`"G0 X10 Y20\nX30\nG1 Z-5 F100"`, the exact program traced since Lesson 4:

1. `Parser` produces three commands, motion modes `G0`, `G0` (inherited),
   `G1` (Lesson 4).
2. `compute_path` now records `{"motion": "G0", ...}` for the origin,
   then `{"motion": "G0", ...}` and `{"motion": "G0", ...}` for the first
   two real points, then `{"motion": "G1", ...}` for the last — this
   lesson's real addition.
3. `groupSegments` (tested, isolated, this lesson) splits these four
   points into two segments: three `G0` points, then a two-point `G1`
   segment starting from the last `G0` point (the connecting-point rule,
   proven by its own dedicated test).
4. `drawPath` renders two `THREE.Line` objects — one red, one green —
   instead of Lesson 8's single, uniformly-colored line.

## What Breaks Without This

Already demonstrated in full, live, this lesson: dropping the
boundary-point-carrying logic doesn't crash anything — `vitest` catches
it immediately, by name, with the exact expected-vs-received values
printed, because a real test was written specifically to guard this exact
detail.

## Exercises

1. Add a `G2`/`G3` case to `drawPath`'s color ternary (treat both as
   feed-colored, alongside `G1`, for now — real arc rendering is a much
   later lesson) and explain, from Lesson 4's own scope limits, why `G2`/
   `G3` can even appear in a command's `"motion"` field already, despite
   this project not yet computing real arc geometry.
2. Write one more `it(...)` test case for `groupSegments`: three
   segments where the *first two* share a motion mode and the *third*
   differs, confirming exactly two segments come out (not three) for the
   first two, then one more.
3. Run `npx vitest run` after intentionally changing one existing test's
   expected value to something wrong. Read the real failure output and
   identify exactly which line of `groupSegments` would need to change to
   make that (wrong) expectation pass — then revert.

## Definition of Done

- [ ] `core/path.py`'s `compute_path` returns points with a real
      `"motion"` field; run directly, no server, matches this lesson's
      example.
- [ ] `cnc-web/src/segments.ts`/`segments.test.ts` exist; `npx vitest
      run` passes all four tests.
- [ ] You reproduced the boundary-point regression yourself and saw the
      exact test written to catch it fail, then confirmed it passes
      again after reverting.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] Opening `http://localhost:5180/` shows a real path with visibly
      different colors where the motion mode changes.
- [ ] You completed Exercises 1–3.
- [ ] A git commit exists explaining *why* (toolpaths now distinguish
      rapid from feed moves visually, matching the reference exactly,
      and this project has a real, automated, permanent test suite for
      the first time on its frontend).
