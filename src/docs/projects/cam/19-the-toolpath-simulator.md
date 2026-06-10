# CAD/CAM — Lesson 19 — The Toolpath Simulator

## What You Will Build

Parsed G-code blocks become visible 3D lines in the viewport. Rapid moves (G0) appear
in a muted red; cutting moves (G1/G2/G3) appear in bright white. Arc moves (G02/G03)
are interpolated into 32 small straight segments that approximate the curve. The
toolpath updates whenever a G-code program is loaded. For the first time, loading a
G-code file produces a 3D picture of what the machine will do.

## What You Need to Know First

Lessons 01–18. Lesson 18 produced `ParsedBlock` — a structured representation of a
G-code block with absolute coordinates, motion mode, and arc parameters. Lesson 03
introduced Three.js line geometry and scene graph manipulation. Lesson 17 produced
`GcodeToken` as a discriminated union; this lesson uses the same pattern for
`MotionType`. The `arcI` and `arcJ` fields in `ParsedBlock` are used here for the
first time.

---

## The Problem

`ParsedBlock[]` from lesson 18 describes *what the machine will do* but produces no
visual output. There is no 3D picture. The toolpath simulator translates each block
into the 3D moves the machine will make — and then draws those moves as lines in the
Three.js scene.

This requires two separate concerns:

1. **Simulation** — traverse the block array, compute start/end positions for every
   move, interpolate arc moves into straight segments
2. **Rendering** — turn those positions into Three.js geometry and add it to the scene

These concerns are separated into two files. The simulator is a pure function — it
knows nothing about Three.js. The renderer knows nothing about G-code. Each is
independently testable, and either can be replaced without touching the other.

---

## Step 1 — The ToolpathSegment Boundary Type

### The problem

The simulator and the renderer need a shared type. Neither module should depend on the
other's internals. `ToolpathSegment` is that shared type — the boundary between the two
modules.

### Create `src/gcode/toolpathSegment.ts`

```typescript
export type MotionType = 'rapid' | 'cutting'

export interface ToolpathSegment {
  startX:     number
  startY:     number
  startZ:     number
  endX:       number
  endY:       number
  endZ:       number
  motionType: MotionType
}
```

**`MotionType` — what each value means:**
G-code distinguishes between two kinds of machine movement:

- **`'rapid'`** (G0): the machine moves as fast as possible. The tool is above the
  material — no cutting happens. Shown in red so the operator can see rapid traversals
  that cross the part boundary (a potential crash).
- **`'cutting'`** (G1/G2/G3): the machine moves at the programmed feed rate. The tool
  is at or entering the material. Shown in white.

The renderer uses `motionType` to choose colour. This is the **discriminated union**
pattern first introduced in lesson 17 for `GcodeToken`: carry a tag field so consumers
can make decisions without knowing the full context.

**`ToolpathSegment` — why only straight segments:**
`ToolpathSegment` represents a straight line from start to end. Arc moves (G02/G03)
are broken into 32 small `ToolpathSegment` objects that approximate the curve. By the
time the renderer receives segments, every move is a straight line. The renderer does
not need to know whether the original G-code had arcs — it just draws lines. This is
the **pipeline pattern**: each stage transforms data into a simpler, more uniform
representation that the next stage can process without special cases.

**SE lens — dependency inversion at the boundary:**
The simulator produces `ToolpathSegment[]`; the renderer consumes it. Neither module
depends on the other's internals — both depend on the shared type. This is
**dependency inversion**: high-level modules do not depend on low-level modules; both
depend on an abstraction. Changing how arcs are interpolated in the simulator does not
touch the renderer. Changing how the renderer colours lines does not touch the
simulator.

---

## Step 2 — Arc Interpolation

### The problem

G02 (clockwise arc) and G03 (counterclockwise arc) move the cutter along a circular
path. Three.js `LineSegments` can only draw straight lines. We approximate the arc by
dividing the angle it sweeps into 32 equal steps, computing a point at each step, and
connecting consecutive points as line segments.

### The maths — arc centre from I/J offsets

In G-code, a circular arc is specified with I and J words:
- `I` is the offset from the **start point** to the **arc centre** in the X direction
- `J` is the offset from the **start point** to the **arc centre** in the Y direction

So if the cutter starts at `(10, 0)` and the block says `I-10 J0`, the arc centre is:
```
centreX = 10 + (-10) = 0
centreY = 0  +    0  = 0
```
The centre is the origin. The radius is the distance from the start point to the centre:
```
radius = √((10 - 0)² + (0 - 0)²) = 10
```

### The maths — parametric arc stepping

Once we have the centre, start angle, and end angle:
```
startAngle = atan2(startY - centreY, startX - centreX)
endAngle   = atan2(endY   - centreY, endX   - centreX)
```

We sweep from `startAngle` to `endAngle` in 32 equal steps. At step `k` (from 1 to
32), the fraction of the arc completed is `k / 32`, and the current angle is:
```
angle = startAngle + (k / 32) × totalAngle
```
The point at that angle on the circle is:
```
x = centreX + radius × cos(angle)
y = centreY + radius × sin(angle)
```
Z moves linearly from start to end during the arc (the tool descends as it cuts).

**`Math.atan2(y, x)` — first appearance:**
`Math.atan2(y, x)` is the two-argument arctangent function. It returns the angle in
radians from the positive X axis to the point `(x, y)`, correctly handling all four
quadrants. Range: `(-π, π]`.

This differs from `Math.atan(y / x)`, which cannot distinguish `(1, 1)` from
`(-1, -1)` — both give the same ratio, but they are in opposite quadrants 180°
apart. `atan2` receives `y` and `x` separately and checks the signs of both to
determine the quadrant. Always use `atan2` when computing an angle from a point.

**Radian measure — recap:**
`Math.atan2` and `Math.cos`/`Math.sin` all use radians. A full circle is `2π ≈ 6.283`
radians. A quarter-circle is `π/2 ≈ 1.571` radians. `Math.PI` is the JavaScript
constant for π.

**The direction correction — why it is needed:**
`atan2` returns angles in `(-π, π]`. The difference `endAngle - startAngle` might have
the wrong sign for the arc direction we want. For example: a clockwise arc from angle
`2.8` to `-2.8` has `totalAngle = -2.8 - 2.8 = -5.6` — almost a full circle. But we
wanted a short clockwise sweep of `0.483` radians. Two conditional corrections handle
this:

- If clockwise and `totalAngle > 0` (we would sweep counterclockwise), subtract `2π`
  to make it negative (clockwise).
- If counterclockwise and `totalAngle < 0` (we would sweep clockwise), add `2π` to
  make it positive (counterclockwise).

### Create `src/gcode/arcInterpolator.ts`

```typescript
import type { ToolpathSegment } from './toolpathSegment.js'

const ARC_STEPS = 32
```

**`ARC_STEPS = 32` — why a named constant:**
32 steps produces a visually smooth arc at normal zoom levels. At 1 step, the arc is
a single straight line. At 1000 steps, the curve is perfect but creates 1000 × 2 × 3
= 6000 float values per arc segment — expensive for large programs. 32 is the standard
approximation quality for interactive toolpath visualisers. A named constant makes this
decision explicit and easy to adjust: change one number to change quality everywhere.

```typescript
export function interpolateArc(
  startX:    number,
  startY:    number,
  startZ:    number,
  endX:      number,
  endY:      number,
  endZ:      number,
  arcI:      number,
  arcJ:      number,
  clockwise: boolean,
): ToolpathSegment[] {
  const centreX = startX + arcI
  const centreY = startY + arcJ

  const startAngle = Math.atan2(startY - centreY, startX - centreX)
  const endAngle   = Math.atan2(endY   - centreY, endX   - centreX)

  let totalAngle = endAngle - startAngle

  if (clockwise  && totalAngle > 0) totalAngle -= 2 * Math.PI
  if (!clockwise && totalAngle < 0) totalAngle += 2 * Math.PI

  const radius = Math.sqrt(
    (startX - centreX) ** 2 +
    (startY - centreY) ** 2,
  )

  const segments: ToolpathSegment[] = []
  let previousX = startX
  let previousY = startY
  let previousZ = startZ

  for (let step = 1; step <= ARC_STEPS; step++) {
    const fraction = step / ARC_STEPS
    const angle    = startAngle + fraction * totalAngle
    const currentX = centreX + radius * Math.cos(angle)
    const currentY = centreY + radius * Math.sin(angle)
    const currentZ = startZ  + fraction * (endZ - startZ)

    segments.push({
      startX: previousX, startY: previousY, startZ: previousZ,
      endX:   currentX,  endY:   currentY,  endZ:   currentZ,
      motionType: 'cutting',
    })

    previousX = currentX
    previousY = currentY
    previousZ = currentZ
  }

  return segments
}
```

**`**` (exponentiation operator) — first appearance:**
`(startX - centreX) ** 2` raises the left operand to the power of the right. It is
equivalent to `Math.pow(startX - centreX, 2)` but more concise for squaring.

**Walkthrough — interpolating a quarter-circle arc:**
Input: start `(10, 0)`, end `(0, 10)`, `arcI = -10`, `arcJ = 0`, G03 (counterclockwise).

```
centreX = 10 + (-10) = 0
centreY = 0  +   0   = 0

startAngle = atan2(0 - 0, 10 - 0) = atan2(0, 10) = 0
endAngle   = atan2(10 - 0, 0 - 0) = atan2(10, 0) = π/2

totalAngle = π/2 - 0 = π/2  (positive = counterclockwise ✓, no correction needed)

radius = √(10² + 0²) = 10

Step 16/32: fraction=0.5, angle = 0 + 0.5 × π/2 = π/4
currentX = 0 + 10 × cos(π/4) ≈ 7.07
currentY = 0 + 10 × sin(π/4) ≈ 7.07
```

The midpoint of a 90° arc of radius 10 is `(7.07, 7.07)` — the 45° point on the
circle. Correct.

**CS lens — parametric curves:**
The position at any point on the arc is expressed as a function of the parameter
`fraction` (ranging 0→1). This is a **parametric curve**: position = function(parameter).
Parametric curves are the foundation of all CAD/CAM geometry. Every arc, spline, and
freeform surface in any CAD system is represented parametrically. The linear
interpolation `startZ + fraction × (endZ - startZ)` is the simplest parametric
curve — a straight line in 1D. Arc stepping is the same idea applied in 2D.

This pattern appears everywhere in production software: CSS `transition` easing, 3D
animation keyframing, and path-following in robotics all parameterise position as a
function of a 0→1 value.

---

## Step 3 — The Simulator

### The problem

The simulator traverses `ParsedBlock[]` and produces `ToolpathSegment[]`. For linear
and rapid moves, each block becomes one segment. For arc moves, it calls
`interpolateArc` and receives 32 segments. Blocks with parse errors are skipped.

### Create `src/gcode/simulator.ts`

```typescript
import type { ParsedBlock }     from './parser.js'
import type { ToolpathSegment } from './toolpathSegment.js'
import { interpolateArc }        from './arcInterpolator.js'
```

**Import explanation:**
`parser.ts` owns `ParsedBlock` — the structured block type from lesson 18. We use
`import type` because we only need the TypeScript type here, not any runtime value.
The compiled JavaScript output will not include this import at all.

`toolpathSegment.ts` owns the boundary type created in step 1.

`arcInterpolator.ts` owns the arc maths. The simulator delegates arc interpolation
to a focused single-responsibility function. The simulator does not know or care how
arcs are computed — it calls `interpolateArc` and collects the result. Swapping the
arc interpolation algorithm (for example, using 64 steps for higher quality) requires
changing one file.

**`import type` — first appearance:**
`import type { ParsedBlock }` imports only the TypeScript type annotation. No
JavaScript code is included in the compiled output. When a module is needed only for
its types, `import type` makes this explicit. TypeScript will produce an error if you
accidentally call a function or use a value from an `import type` import.

```typescript
export function simulateToolpath(blocks: ParsedBlock[]): ToolpathSegment[] {
  const segments: ToolpathSegment[] = []

  let currentX = 0
  let currentY = 0
  let currentZ = 0

  for (const block of blocks) {
    if (block.errors.length > 0) continue

    const targetX = block.targetX
    const targetY = block.targetY
    const targetZ = block.targetZ

    switch (block.motionMode) {
      case 'rapid':
        segments.push({
          startX: currentX, startY: currentY, startZ: currentZ,
          endX:   targetX,  endY:   targetY,  endZ:   targetZ,
          motionType: 'rapid',
        })
        break

      case 'linear':
        segments.push({
          startX: currentX, startY: currentY, startZ: currentZ,
          endX:   targetX,  endY:   targetY,  endZ:   targetZ,
          motionType: 'cutting',
        })
        break

      case 'arc-cw':
      case 'arc-ccw':
        if (block.arcI !== null && block.arcJ !== null) {
          const arcSegments = interpolateArc(
            currentX, currentY, currentZ,
            targetX,  targetY,  targetZ,
            block.arcI, block.arcJ,
            block.motionMode === 'arc-cw',
          )
          segments.push(...arcSegments)
        }
        break
    }

    currentX = targetX
    currentY = targetY
    currentZ = targetZ
  }

  return segments
}
```

**`if (block.errors.length > 0) continue` — why errors are skipped:**
A block with a lexer or parser error has unknown data — its `targetX/Y/Z` are default
zeros, not real positions. Including it in the toolpath would draw a spurious line
from wherever the tool was back to `(0, 0, 0)`. Skipping error blocks means the
rendered toolpath only shows valid moves.

**`switch` on string union — first appearance in this project:**
`switch (block.motionMode)` branches on the `motionMode` field of the `ParsedBlock`.
TypeScript knows that `motionMode` is of type `'rapid' | 'linear' | 'arc-cw' | 'arc-ccw'`
(the union type from lesson 18's `ModalState`). The `switch` cases cover the union
exhaustively. If we later add a new motion mode to the union and forget to handle it
here, TypeScript will warn us.

**`segments.push(...arcSegments)` — spread into push:**
`...arcSegments` spreads the array — it passes each element as a separate argument to
`push`. `segments.push(a, b, c)` adds three elements. `segments.push(...[a, b, c])`
is identical. This is equivalent to `for (const s of arcSegments) segments.push(s)`.
The spread operator in a function call was introduced in lesson 02's JSX spread; it
appears here in a different context.

**Walkthrough — simulating two blocks:**
```
G0 Z5         → rapid, targetX=0, targetY=0, targetZ=5
G1 X10 F300   → linear, targetX=10, targetY=0, targetZ=5
```

Starting state: `currentX=0, currentY=0, currentZ=0`.

Block 0 (rapid, Z5):
- Push `{ start:(0,0,0), end:(0,0,5), motionType:'rapid' }`
- Update: `currentZ = 5`

Block 1 (linear, X10):
- Push `{ start:(0,0,5), end:(10,0,5), motionType:'cutting' }`
- Update: `currentX = 10`

Result: two segments — a red vertical line rising to Z=5, then a white horizontal
line cutting to X=10. Exactly what the G-code describes.

**SE lens — simulation as a pure function:**
`simulateToolpath` takes data in, returns data out, and has no side effects. It does
not modify the DOM, does not write to the Three.js scene, does not update any global
variable. Given the same blocks, it always returns the same segments. This is a
**pure function**.

Pure functions are the most testable unit of code. The full complexity of toolpath
calculation — arc interpolation, error skipping, position tracking — is tested by
calling `simulateToolpath` with known input and checking the output. No Three.js, no
DOM, no browser required.

**CS lens — the interpreter pattern:**
`simulateToolpath` is an **interpreter** — a program that reads instructions (G-code
blocks) and executes them (produces geometric output). It maintains machine state
(`currentX/Y/Z`) across each instruction, exactly as the G-code machine controller
does. This is identical in structure to the calculator evaluator: walk a list of
operations, maintain state (the accumulator / environment), produce output. G-code
simulation and expression evaluation are the same computational pattern.

---

## Step 4 — Tests

### Create `src/gcode/simulator.test.ts`

```typescript
import { describe, test, expect } from 'vitest'
import { simulateToolpath }        from './simulator.js'
import type { ParsedBlock }        from './parser.js'

function makeBlock(overrides: Partial<ParsedBlock>): ParsedBlock {
  return {
    lineNumber:      null,
    programNumber:   null,
    motionMode:      'linear',
    targetX:         0,
    targetY:         0,
    targetZ:         0,
    arcI:            null,
    arcJ:            null,
    arcR:            null,
    feedRate:        300,
    spindleSpeed:    0,
    toolNumber:      null,
    auxFunction:     null,
    positioningMode: 'absolute',
    errors:          [],
    ...overrides,
  }
}

describe('toolpath simulator', () => {
  test('linear move produces one cutting segment', () => {
    const blocks   = [makeBlock({ targetX: 10, targetY: 5 })]
    const segments = simulateToolpath(blocks)
    expect(segments).toHaveLength(1)
    expect(segments[0].motionType).toBe('cutting')
    expect(segments[0].endX).toBe(10)
    expect(segments[0].endY).toBe(5)
  })

  test('rapid move produces one rapid segment', () => {
    const blocks   = [makeBlock({ motionMode: 'rapid', targetZ: 5 })]
    const segments = simulateToolpath(blocks)
    expect(segments[0].motionType).toBe('rapid')
  })

  test('arc-cw produces 32 cutting segments', () => {
    const blocks = [makeBlock({
      motionMode: 'arc-cw',
      targetX: 0, targetY: -10,
      arcI: -10, arcJ: 0,
    })]
    const segments = simulateToolpath(blocks)
    expect(segments).toHaveLength(32)
    expect(segments[0].motionType).toBe('cutting')
  })

  test('block with errors is skipped', () => {
    const blocks   = [makeBlock({ errors: ['bad token'] })]
    const segments = simulateToolpath(blocks)
    expect(segments).toHaveLength(0)
  })

  test('start position of second segment equals end of first', () => {
    const blocks = [
      makeBlock({ targetX: 10 }),
      makeBlock({ targetX: 20 }),
    ]
    const segments = simulateToolpath(blocks)
    expect(segments[1].startX).toBe(10)
  })
})
```

**`makeBlock` — why a factory function for tests:**
`ParsedBlock` has 14 fields. Constructing one in every test would be verbose and
fragile — if `ParsedBlock` gains a new required field, every test needs updating.
`makeBlock` provides defaults and accepts `Partial<ParsedBlock>` overrides. Tests
only specify what they care about, and the function name communicates intent.

**`Partial<T>` — first appearance:**
`Partial<ParsedBlock>` is a TypeScript **utility type** that makes every property
of `ParsedBlock` optional. `Partial<{ a: number; b: string }>` is equivalent to
`{ a?: number; b?: string }`. TypeScript provides a family of utility types:
`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`. They transform existing
types without repeating their definitions.

Run `npm test`. All five tests pass.

---

## Step 5 — Rendering the Toolpath

### The problem

`simulateToolpath` returns `ToolpathSegment[]`. Three.js needs this as a flat
position buffer in a `BufferGeometry` attached to `LineSegments` objects. We create
two `LineSegments` objects: one red for rapid moves, one white for cutting moves.

### Create `src/gcode/toolpathRenderer.ts`

```typescript
import * as THREE               from 'three'
import type { ToolpathSegment } from './toolpathSegment.js'

const COLOUR_RAPID   = new THREE.Color(0xef4444) // red
const COLOUR_CUTTING = new THREE.Color(0xf8fafc) // white
```

**`THREE.Color` — first appearance:**
`THREE.Color` stores a colour as RGB. `new THREE.Color(0xef4444)` parses the hex
integer. Defined at module scope as constants — they never change between calls, so
creating them once avoids allocating new objects every time `buildToolpathLines` runs.

```typescript
export interface ToolpathLineObjects {
  rapidLines:   THREE.LineSegments
  cuttingLines: THREE.LineSegments
}

export function buildToolpathLines(
  segments: ToolpathSegment[],
  scene:    THREE.Scene,
): ToolpathLineObjects {
  const rapidPositions:   number[] = []
  const cuttingPositions: number[] = []

  for (const segment of segments) {
    const target = segment.motionType === 'rapid'
      ? rapidPositions
      : cuttingPositions

    target.push(
      segment.startX,  segment.startZ, -segment.startY,
      segment.endX,    segment.endZ,   -segment.endY,
    )
  }

  const rapidLines   = createLineSegments(rapidPositions,   COLOUR_RAPID)
  const cuttingLines = createLineSegments(cuttingPositions, COLOUR_CUTTING)

  scene.add(rapidLines)
  scene.add(cuttingLines)

  return { rapidLines, cuttingLines }
}
```

**Coordinate axis remapping — G-code to Three.js:**
G-code uses Z as the vertical axis (the machine table is XY, the tool moves in Z).
Three.js uses Y as vertical (Y-up coordinate system). To place the toolpath correctly:

```
G-code X → Three.js X   (same direction)
G-code Y → Three.js -Z  (G-code Y goes away from viewer; Three.js -Z goes into the screen)
G-code Z → Three.js Y   (vertical, up)
```

Hence the push layout: `startX, startZ, -startY`. Without this remapping, a toolpath
cutting in the XY machining plane would appear as lines on the XZ floor of the scene —
flat on the ground instead of hovering at the correct height.

```typescript
function createLineSegments(
  positions: number[],
  colour:    THREE.Color,
): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  const material = new THREE.LineBasicMaterial({ color: colour })
  return new THREE.LineSegments(geometry, material)
}
```

**`THREE.BufferGeometry` — first appearance:**
`BufferGeometry` is Three.js's low-level geometry container. It stores all vertex data
as flat typed arrays that the GPU can consume directly — no JavaScript object overhead
per vertex. For toolpaths that may have thousands of segments, `BufferGeometry` is the
only correct choice.

`setAttribute('position', ...)` registers the vertex position buffer. The string
`'position'` is a Three.js convention: the WebGL vertex shader reads position data from
the attribute named `'position'`.

**`THREE.Float32BufferAttribute(positions, 3)` — first appearance:**
Wraps the flat number array as a GPU-ready buffer attribute. The `3` is the **item
size** — each vertex is described by 3 consecutive numbers (X, Y, Z). The flat layout
is `[x₀, y₀, z₀, x₁, y₁, z₁, ...]`. JavaScript arrays use 64-bit doubles; `Float32`
(32-bit) is GPU-standard precision and uses half the memory. Modern GPUs expect 32-bit
floats — the Three.js internal pipeline converts automatically when item size is given.

**`THREE.LineBasicMaterial` — first appearance:**
The simplest line material in Three.js: a flat colour with no shading calculation.
Shading would make toolpath lines appear to change brightness based on lighting angle,
which would add visual noise to a technical visualisation. Flat colour is correct here.

**`THREE.LineSegments` — first appearance:**
Renders pairs of vertices as disconnected segments. Vertices 0-1 form segment 0,
vertices 2-3 form segment 1, and so on. This matches the data layout: each
`ToolpathSegment` contributes a start vertex and an end vertex as a pair. This differs
from `THREE.Line`, which connects every vertex to the next in a continuous polyline.

**CS lens — structure of arrays vs array of structures:**
`BufferGeometry` uses a flat array: `[x₀, y₀, z₀, x₁, y₁, z₁, ...]`. The
alternative would be an array of objects: `[{x:0, y:0, z:0}, {x:1, y:0, z:0}]`. The
flat layout is a **structure of arrays** pattern — all X values together, all Y values
together. GPUs process flat buffers natively; the vertex shader receives one group of
3 floats at a time. Object overhead (heap allocation, property lookup indirection)
does not exist in a flat buffer. This pattern is used in game engines, physics
simulators, and scientific computing for the same reason: cache locality and minimal
allocations.

**SE lens — returning the line objects:**
`buildToolpathLines` returns `{ rapidLines, cuttingLines }` to its caller. The caller
stores these references so it can remove them from the scene when a new G-code file
is loaded:
```typescript
scene.remove(previousLines.rapidLines)
scene.remove(previousLines.cuttingLines)
```
If the old lines are not removed before adding new ones, each load accumulates
another pair of `LineSegments` in the scene — the viewport would show all previously
loaded toolpaths layered on top of each other.

---

## Connect the Pieces

The full G-code pipeline is now complete:

```
Raw text
  ──► tokeniseGcodeLine   (lesson 17 — lexer)
  ──► parseLine / parseGcode  (lesson 18 — parser)
  ──► simulateToolpath    (this lesson — simulator)
  ──► buildToolpathLines  (this lesson — renderer)
  ──► THREE.LineSegments in the scene
```

Each stage accepts the output of the previous stage. The parser and simulator both
operate on `ParsedBlock[]` — the simulator does not re-parse; it consumes the output
the parser already produced. This is the **Unix pipeline** architecture: each component
reads its input, transforms it, and writes output. The constraint: each component
knows only the types on its two sides, not the internals of any other stage.

The same pipeline structure appears in compilers (lex → parse → analyse → codegen),
build systems (source → transform → bundle → minify), and React rendering
(state → virtual DOM diff → DOM patch).

---

## What Breaks Without This

**Without the axis remapping:**
A toolpath cutting in the XY machining plane (Z constant) is rendered on the XZ floor
of the Three.js scene. It appears as a flat set of lines on the ground, invisible
from the default camera position (which looks down at the floor). Loading a G-code
file appears to produce no toolpath.

**Without `continue` on error blocks:**
A block with parse errors has `targetX = targetY = targetZ = 0` — the defaults from
`createInitialModalState`. The simulator draws a line from wherever the tool was back
to the origin. For a program with multiple invalid lines, this produces a web of
incorrect lines radiating to `(0, 0, 0)` — a visually alarming and completely wrong
toolpath.

**Without removing old `LineSegments` before adding new ones:**
Each time the user loads a G-code file, new `LineSegments` are added to the scene on
top of the existing ones. The toolpath appears to grow brighter (because more lines
overlap). Memory increases with each load. After ten loads, the scene contains 20
`LineSegments` objects — 19 of them invisible but still consuming GPU memory and
render time.

---

## Definition of Done

- [ ] `npm test` passes all five tests in `simulator.test.ts`
- [ ] A G-code file with linear moves displays as white lines in the viewport
- [ ] Rapid moves display as red lines
- [ ] A G02/G03 block with I/J words produces a curved approximation
- [ ] Blocks with parse errors produce no segments
- [ ] You can explain what `atan2` returns and why `atan(y/x)` is insufficient
- [ ] You can explain how I/J offsets define the arc centre from the start point
- [ ] You can explain `BufferGeometry` and `Float32BufferAttribute` — why flat arrays instead of objects
- [ ] You can explain the coordinate remapping and why G-code Z becomes Three.js Y
- [ ] You can explain the pipeline pattern and name one other system that uses the same architecture
- [ ] You can explain why `simulateToolpath` is a pure function and why that makes it easier to test
- [ ] Run:
      ```
      git add src/gcode/
      git commit -m "Add toolpath simulator and renderer: arc interpolation via I/J offsets, ToolpathSegment boundary type, axis-remapped Three.js LineSegments"
      ```

---

*Next: Lesson 20 — Tool Geometry. A JSON tool library defines three end mills. A panel
in the application shell lists them — clicking one selects it. The selected tool's
diameter drives the offset in lesson 21. An SVG cross-section diagram shows the tool
profile beside the details.*
