# SE Masterclass — LAB-78 — G-code Backplotter

**Prerequisites:** LAB-77 (CAD Viewer)

## Quick Check

Before starting, answer these (answers at the bottom):

1. G-code is a line-oriented text format. What earlier lab's tokenizer shape does parsing it resemble?
2. Why does a G-code interpreter need to track "current position" as state, rather than parsing each line independently?
3. What's the difference between a rapid move (G0) and a feed move (G1), and why does a backplotter usually render them differently?

## What You Will Build

A parser that reads raw G-code text and turns it into a list of line segments, rendered inside LAB-77's CAD viewport — rapid moves shown as thin dashed lines, feed (cutting) moves as solid colored lines, exactly like real CAM/CNC backplotting software.

```
G-code:
  G0 X0 Y0
  G1 X50 Y0 F500
  G1 X50 Y30
  G0 X0 Y30

Parsed segments:
  rapid: (0,0)  -> (50,0)   [G0]
  feed:  (50,0) -> (50,30)  [G1]
  rapid: (50,30) -> (0,30)  [G0]
```

## Concept: A Parser Pipeline Feeding a Spatial Renderer

**What it is:** G-code is the standard instruction language for CNC machines and 3D printers — a sequence of lines like `G1 X50 Y30 F500`, each meaning "move the tool to this position, cutting, at this feed rate." A backplotter parses that text and draws the resulting toolpath, so a machinist can visually verify a program before running it on real hardware.

**The problem before:** Every parser this curriculum has built so far (LAB-10/11/12's lexer/parser/evaluator, LAB-63's SQL query engine) turned text into a tree or an evaluated result. G-code doesn't need a tree — it's a flat sequence of *commands*, each of which mutates a running "where is the tool right now" state and optionally emits a line segment. This is closer to LAB-16's VM (a flat instruction stream, executed top to bottom, mutating registers) than to a recursive-descent parser.

**The solution:** Tokenize each line into a command letter (`G0`/`G1`) and a set of parameter letters (`X`, `Y`, `F`), interpret each command against a running "current position" state, and — for G0/G1 — emit a line segment from the old position to the new one. Feed that list of segments straight into LAB-77's `CadShape[]` renderer; nothing about the viewport needs to know its shapes came from G-code instead of hand-authored geometry.

**Canonical example:**

```typescript
function interpret(lines: GcodeLine[]): LineSegment[] {
  let current = new Vector2(0, 0)
  const segments: LineSegment[] = []
  for (const line of lines) {
    if (line.command === "G0" || line.command === "G1") {
      const next = new Vector2(line.x ?? current.x, line.y ?? current.y)
      segments.push({ from: current, to: next, rapid: line.command === "G0" })
      current = next
    }
  }
  return segments
}
```

**Project Application:** This is the last "parser" lab in the curriculum — it directly reuses LAB-77's viewport (pan/zoom/hit-test) unmodified, proving that lab's separation of "geometry data" from "viewport behavior" actually paid off: new data source, zero viewport changes.

**Watch for:** Forgetting that G-code parameters are *sticky* — `G1 X50 Y30` followed by `G1 X60` (no `Y`) means "move to X60, keeping Y at 30," not "Y becomes undefined/zero." Skipping the "current position" state and parsing each line in isolation breaks this immediately.

## Step 1: Tokenizing a line

```typescript
interface GcodeLine {
  command: string // "G0", "G1", etc.
  x?: number
  y?: number
  f?: number // feed rate, unused for drawing but real G-code carries it
}

function tokenizeLine(rawLine: string): GcodeLine | null {
  const line = rawLine.split(";")[0].trim() // strip comments (everything after ';')
  if (line.length === 0) return null

  const tokens = line.split(/\s+/)
  const command = tokens[0].toUpperCase()
  if (command !== "G0" && command !== "G1") return null // ignore other G/M codes for this lab

  const result: GcodeLine = { command }
  for (const token of tokens.slice(1)) {
    const letter = token[0].toUpperCase()
    const value = parseFloat(token.slice(1))
    if (letter === "X") result.x = value
    else if (letter === "Y") result.y = value
    else if (letter === "F") result.f = value
  }
  return result
}
```

This is character classification and sliding-window splitting in the same spirit as LAB-10's lexer, just line-oriented instead of character-by-character — G-code's grammar is simple enough that `split(/\s+/)` plus a per-token letter/number split covers it, without needing a full character-at-a-time state machine.

### SAVE AND TRY

```typescript
console.log(tokenizeLine("G1 X50 Y30 F500"))
// { command: "G1", x: 50, y: 30, f: 500 }
console.log(tokenizeLine("; this is a full-line comment"))
// null
console.log(tokenizeLine("G1 X60 ; move right"))
// { command: "G1", x: 60 }  -- comment stripped, Y left undefined (sticky, handled in Step 2)
```

## Step 2: Sticky state — interpreting the parsed lines

```typescript
import { Vector2 } from "../module-01-math/LAB-67-vectors"

interface Segment { from: Vector2; to: Vector2; rapid: boolean }

function interpretGcode(lines: GcodeLine[]): Segment[] {
  let current = new Vector2(0, 0)
  const segments: Segment[] = []

  for (const line of lines) {
    const nextX = line.x ?? current.x
    const nextY = line.y ?? current.y
    const next = new Vector2(nextX, nextY)

    if (next.x !== current.x || next.y !== current.y) {
      segments.push({ from: current, to: next, rapid: line.command === "G0" })
    }
    current = next
  }
  return segments
}
```

`line.x ?? current.x` is the "sticky parameter" rule made explicit: if this line didn't specify `X`, the tool's X coordinate doesn't change. This mirrors the running-state pattern LAB-16's VM used for its registers (`ADD`/`STORE` each read and mutate persistent state, not fresh state per instruction) — G-code position is exactly that kind of mutable, carried-forward state.

### SAVE AND TRY

```typescript
const lines = [tokenizeLine("G0 X0 Y0")!, tokenizeLine("G1 X50 Y0 F500")!, tokenizeLine("G1 Y30")!]
console.log(interpretGcode(lines))
// [
//   { from: (0,0), to: (50,0), rapid: true },
//   { from: (50,0), to: (50,30), rapid: false }   <- X stayed 50 (sticky), only Y changed
// ]
```

The second segment's `from.x` is `50`, not `0` and not undefined — confirming the sticky-X rule survived a line that only specified `Y`.

## Step 3: Full pipeline — text to segments

```typescript
function parseGcode(sourceText: string): Segment[] {
  const rawLines = sourceText.split("\n")
  const tokenized = rawLines.map(tokenizeLine).filter((line): line is GcodeLine => line !== null)
  return interpretGcode(tokenized)
}
```

This is the whole pipeline named in this lab's "Core concept": text → tokenize (Step 1) → interpret with running state (Step 2) → geometry. Three clearly separated stages, each independently testable — exactly the discipline LAB-10/11/12 established for the expression pipeline, applied to a different grammar.

### SAVE AND TRY

```typescript
const program = `
; simple rectangle pocket
G0 X0 Y0
G1 X50 Y0 F500
G1 X50 Y30
G1 X0 Y30
G1 X0 Y0
`
const segments = parseGcode(program)
console.log(segments.length) // 5 segments -- one per motion line, comment line produced nothing
```

## Step 4: Rendering into LAB-77's viewport

```typescript
type CadShape = { kind: "line"; from: Vector2; to: Vector2; selected: boolean; rapid: boolean }

function segmentsToShapes(segments: Segment[]): CadShape[] {
  return segments.map(seg => ({ kind: "line", from: seg.from, to: seg.to, selected: false, rapid: seg.rapid }))
}

function drawGcodeShape(ctx: CanvasRenderingContext2D, shape: CadShape) {
  ctx.beginPath()
  ctx.moveTo(shape.from.x, shape.from.y)
  ctx.lineTo(shape.to.x, shape.to.y)
  ctx.strokeStyle = shape.rapid ? "gray" : "blue"
  ctx.setLineDash(shape.rapid ? [4, 4] : [])
  ctx.lineWidth = shape.rapid ? 1 : 2
  ctx.stroke()
  ctx.setLineDash([])
}
```

`rapid` toggles both the dash pattern and color — matching the real convention this lab's concept section named (thin dashed for rapids, solid for feeds), so a machinist glancing at the plot can instantly tell "tool repositioning" from "tool cutting material," which is the entire point of backplotting before running a program on real hardware.

### SAVE AND TRY

Parse the rectangle program from Step 3, convert to `CadShape[]`, and render through LAB-77's `renderWorldScene`/camera pipeline. The result should look like a rectangle traced with one dashed gray line (the initial `G0` rapid to the start corner) and four solid blue lines (the `G1` cuts around the rectangle) — pan and zoom should work identically to LAB-77, since these are just ordinary `CadShape` line entries to the viewport.

## 🎯 Challenge

Add arc support: parse `G2`/`G3` (clockwise/counterclockwise arc moves with an `I`/`J` center offset, standard G-code arc syntax), and tessellate each arc into several short line segments for rendering, since the viewport only knows how to draw straight lines.

<details>
<summary>Solution</summary>

```typescript
function tokenizeArcLine(rawLine: string): GcodeLine & { i?: number; j?: number } | null {
  const line = rawLine.split(";")[0].trim()
  if (line.length === 0) return null
  const tokens = line.split(/\s+/)
  const command = tokens[0].toUpperCase()
  if (!["G0", "G1", "G2", "G3"].includes(command)) return null

  const result: GcodeLine & { i?: number; j?: number } = { command }
  for (const token of tokens.slice(1)) {
    const letter = token[0].toUpperCase()
    const value = parseFloat(token.slice(1))
    if (letter === "X") result.x = value
    else if (letter === "Y") result.y = value
    else if (letter === "I") result.i = value
    else if (letter === "J") result.j = value
    else if (letter === "F") result.f = value
  }
  return result
}

function tessellateArc(start: Vector2, end: Vector2, centerOffset: Vector2, clockwise: boolean, steps = 16): Vector2[] {
  const center = start.add(centerOffset)
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  let endAngle = Math.atan2(end.y - center.y, end.x - center.x)
  const radius = start.subtract(center).magnitude()

  if (clockwise && endAngle > startAngle) endAngle -= 2 * Math.PI
  if (!clockwise && endAngle < startAngle) endAngle += 2 * Math.PI

  const points: Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps)
    points.push(new Vector2(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius))
  }
  return points
}
```

`tessellateArc` walks `steps` evenly-spaced angles between the start and end angle (correcting direction based on clockwise/counterclockwise) and returns points along the arc — each consecutive pair becomes one short `Segment`, the same representation Step 2 already produces for straight moves, so the rest of the pipeline (rendering, pan/zoom) needs no changes at all.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Parsing G-code | Parse each line fully independently | Track running "current position" state across lines |
| Missing X or Y | Treat as 0 / undefined | Sticky — inherits the last known value |
| G0 vs G1 rendering | Draw identically | Dashed/thin for rapid (G0), solid/bold for feed (G1) |
| Connecting to the viewport | Build a new renderer | Reuse LAB-77's `CadShape` pipeline unchanged |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can't G-code lines be parsed in complete isolation from each other? | |
| 2 | What does `line.x ?? current.x` encode? | |
| 3 | Why render G0 moves differently from G1 moves? | |

## Quick Check Answers

1. G-code parameters are sticky — a line that omits `X` or `Y` means "keep the previous value," which requires carrying position state forward across lines rather than treating each line as self-contained.
2. The sticky-parameter rule: if this G-code line specified a new X value, use it; otherwise fall back to whatever X was before this line.
3. G0 is a rapid, non-cutting repositioning move; G1 is a feed move that actually cuts material — visually distinguishing them (dashed/thin vs. solid/bold) lets a machinist immediately see which parts of the toolpath are cutting versus just moving into position.

*Next: [LAB-79 — Pathfinding Visualizer](LAB-79-pathfinding-visualizer.md)*
