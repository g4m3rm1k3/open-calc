# SE Masterclass — LAB-40 — Drawing App

**Language: TypeScript (Browser)** — same module as LAB-37–39.

**Prerequisites:** LAB-18/19 (the Strategy pattern IS composition applied to swappable algorithms — a "tool" is exactly LAB-19's `FlyBehavior`, redrawn) and LAB-23/24 (each stroke is a `Command`, undoable).

**What this lab adds:**
- The Canvas API: `getContext('2d')`, `beginPath`/`lineTo`/`stroke` — pixel drawing instead of DOM elements
- Tools as a Strategy pattern: Pen, Rectangle, Eraser — swappable, without the canvas event wiring ever changing
- Each stroke as a `Command` (LAB-23) — full undo/redo (LAB-24) for free
- Adding a brand-new tool with zero changes to existing tools or the canvas wiring

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-29's DOM manipulation created discrete ELEMENTS. Canvas drawing creates PIXELS with no memory of "what shape made this." What does this cost you, compared to DOM elements?
> 2. A Pen tool and a Rectangle tool both respond to `mousedown`/`mousemove`/`mouseup` — but do DIFFERENT things with those events. What pattern from LAB-19 handles "same event, different behavior depending on what's currently active"?
> 3. If every stroke is a `Command` with `execute()`/`undo()` (LAB-23), what does `undo()` need to do for a CANVAS, specifically — given canvas has no individual elements to remove?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a canvas you can draw on with a Pen tool, a Rectangle tool, and an Eraser — switchable via buttons, with working Undo.

```
[Pen] [Rectangle] [Eraser]     [Undo]

  (a canvas you can draw on, tool-dependent)
```

---

### Concept: Canvas Is Pixels, Not Elements

**What it is:** The `<canvas>` element gives you a 2D drawing CONTEXT (`canvas.getContext('2d')`) with imperative drawing commands — `beginPath()`, `moveTo(x, y)`, `lineTo(x, y)`, `stroke()`. Unlike LAB-29's DOM elements, once you draw a line, the canvas has NO memory of "there is a line here" — it's just colored PIXELS. You cannot later "select the line" or "move it" the way you could a DOM `<div>`.

**The problem before:** Comparing to LAB-29: a DOM `<div>` is a persistent, addressable OBJECT you can query, modify, or remove later. A canvas stroke is a one-time PAINTING operation — once drawn, the canvas only knows "these pixels are this color," not "a line was drawn from (10,10) to (50,50)."

**The solution:** To support undo, YOUR CODE (not the canvas) must remember what was drawn — exactly LAB-23's Command pattern: each stroke becomes a `Command` object your application tracks, and "undo" means "clear the canvas and REPLAY every remaining command," not "ask the canvas to remove one thing."

---

## Step 1 — Basic Freehand Drawing

```ts
// main.ts
const app = document.querySelector<HTMLDivElement>('#app')!
const canvas = document.createElement('canvas')
canvas.width = 500
canvas.height = 400
canvas.style.border = '1px solid #333'
app.appendChild(canvas)

const ctx = canvas.getContext('2d')!

let isDrawing = false

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true
  ctx.beginPath()                              // ← add: start a NEW path — LAB-05's stack-of-points idea, conceptually
  ctx.moveTo(e.offsetX, e.offsetY)
})

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return
  ctx.lineTo(e.offsetX, e.offsetY)                // ← add: extend the path to the new mouse position
  ctx.stroke()                                     // ← add: actually PAINT the pixels along the path so far
})

canvas.addEventListener('mouseup', () => {
  isDrawing = false
})
```

### SAVE AND TRY

Save. Click and drag on the canvas in the browser — confirm a freehand line follows your cursor.

**Confirm this is IMPERATIVE pixel painting, not DOM construction:** Nothing here calls `createElement` (LAB-29) — `ctx.stroke()` directly modifies the canvas's pixel buffer. Once painted, there is no way to `console.log` "what shapes exist on this canvas" — the canvas API itself has NO concept of individual shapes, only "what color is pixel (x, y) right now."

---

### Concept: Tools as a Strategy Pattern

**What it is:** LAB-19's Strategy pattern (swappable behavior objects), applied to drawing tools. A `Tool` interface defines `onMouseDown`/`onMouseMove`/`onMouseUp`. The CANVAS event wiring stays FIXED — it always calls "whatever the CURRENT tool's" handlers. Switching tools means swapping WHICH object those calls are forwarded to, exactly like LAB-19's `ComposedDuck.setFlyBehavior`.

---

## Step 2 — Tools as Swappable Strategies

```ts
// tools.ts
export interface Tool {
  onMouseDown(ctx: CanvasRenderingContext2D, x: number, y: number): void
  onMouseMove(ctx: CanvasRenderingContext2D, x: number, y: number): void
  onMouseUp(ctx: CanvasRenderingContext2D): void
}

export class PenTool implements Tool {
  private drawing = false
  onMouseDown(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    this.drawing = true
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  onMouseMove(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.drawing) return
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  onMouseUp(): void { this.drawing = false }
}

export class RectangleTool implements Tool {
  private startX = 0
  private startY = 0
  private drawing = false
  onMouseDown(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    this.drawing = true
    this.startX = x
    this.startY = y
  }
  onMouseMove(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.drawing) return
    ctx.strokeRect(this.startX, this.startY, x - this.startX, y - this.startY)
  }
  onMouseUp(): void { this.drawing = false }
}

export class EraserTool implements Tool {
  private drawing = false
  onMouseDown(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    this.drawing = true
    ctx.clearRect(x - 10, y - 10, 20, 20)
  }
  onMouseMove(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.drawing) return
    ctx.clearRect(x - 10, y - 10, 20, 20)
  }
  onMouseUp(): void { this.drawing = false }
}
```

```ts
// Replace main.ts's direct event handlers with tool delegation:
import { Tool, PenTool, RectangleTool, EraserTool } from './tools'

let currentTool: Tool = new PenTool()          // ← add: the "currently active behavior" — swappable, LAB-19-style

canvas.addEventListener('mousedown', (e) => currentTool.onMouseDown(ctx, e.offsetX, e.offsetY))
canvas.addEventListener('mousemove', (e) => currentTool.onMouseMove(ctx, e.offsetX, e.offsetY))
canvas.addEventListener('mouseup', () => currentTool.onMouseUp(ctx))

const toolbar = document.createElement('div')
const penBtn = document.createElement('button'); penBtn.textContent = 'Pen'
const rectBtn = document.createElement('button'); rectBtn.textContent = 'Rectangle'
const eraseBtn = document.createElement('button'); eraseBtn.textContent = 'Eraser'

penBtn.addEventListener('click', () => { currentTool = new PenTool() })
rectBtn.addEventListener('click', () => { currentTool = new RectangleTool() })
eraseBtn.addEventListener('click', () => { currentTool = new EraserTool() })

toolbar.append(penBtn, rectBtn, eraseBtn)
app.insertBefore(toolbar, canvas)
```

### SAVE AND TRY

Save. Click "Rectangle," drag on the canvas — confirm a rectangle outline appears instead of freehand lines. Click "Eraser," drag over existing drawing — confirm it clears pixels.

**Confirm the canvas wiring NEVER changed:** `canvas.addEventListener('mousedown', ...)` was written EXACTLY ONCE, and forwards to `currentTool.onMouseDown(...)` — swapping `currentTool = new RectangleTool()` changes WHAT HAPPENS on the next mousedown without touching the event listener itself at all. This is LAB-19's `setFlyBehavior` again: the canvas "has-a" current tool; it doesn't need a different CLASS or different wiring per tool.

---

## Step 3 — Undo Support via Commands

```ts
// Modify tools.ts's PenTool to RECORD points instead of drawing immediately, so it can be replayed:
export interface StrokeCommand {
  points: { x: number; y: number }[]
  execute(ctx: CanvasRenderingContext2D): void
}

export function createPenStroke(): { tool: Tool; getCommand: () => StrokeCommand } {
  const points: { x: number; y: number }[] = []
  const tool: Tool = {
    onMouseDown(ctx, x, y) { points.push({ x, y }) },
    onMouseMove(ctx, x, y) {
      if (points.length === 0) return
      points.push({ x, y })
      ctx.beginPath()
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    onMouseUp() {},
  }
  const getCommand = (): StrokeCommand => ({
    points: [...points],
    execute(ctx) {
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y)
        else ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()
    },
  })
  return { tool, getCommand }
}
```

```ts
// main.ts — an undo-aware drawing history:
const history: StrokeCommand[] = []

function redrawAll(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height)     // ← add: LAB-40's version of LAB-29's "wipe and rebuild"
  for (const command of history) {
    command.execute(ctx)                                 // ← add: LAB-23's Command replay
  }
}

let activeStroke = createPenStroke()
canvas.addEventListener('mousedown', (e) => activeStroke.tool.onMouseDown(ctx, e.offsetX, e.offsetY))
canvas.addEventListener('mousemove', (e) => activeStroke.tool.onMouseMove(ctx, e.offsetX, e.offsetY))
canvas.addEventListener('mouseup', () => {
  history.push(activeStroke.getCommand())
  activeStroke = createPenStroke()                        // start fresh for the NEXT stroke
})

const undoBtn = document.createElement('button')
undoBtn.textContent = 'Undo'
undoBtn.addEventListener('click', () => {
  history.pop()                                            // ← LAB-24's undo stack, at its simplest — pop the last command
  redrawAll()
})
toolbar.appendChild(undoBtn)
```

### SAVE AND TRY

Save. Draw a few strokes, click "Undo" repeatedly — confirm each click removes exactly the MOST RECENT stroke.

**Confirm the "clear and replay" mechanism, precisely:** `redrawAll()` clears the ENTIRE canvas, then re-executes EVERY remaining command in `history`, IN ORDER — because canvas pixels have no individual identity (this lab's opening Concept box), the ONLY way to "remove the last stroke" is to erase EVERYTHING and redraw everything EXCEPT that stroke. This is a direct, concrete consequence of canvas being pixels, not elements — contrast with LAB-24's `TextEditor`, where `undo()` could surgically reverse ONE specific change without touching anything else, because a string's characters DO have addressable positions.

---

## 🎯 Challenge: Add a Circle Tool

**You know:** Every existing tool implements the SAME `Tool` interface — adding a new one requires touching nothing else (LAB-18's OCP, LAB-19's composition).

**Task:** Add a `CircleTool` (drag from center outward, drawing a circle whose radius is the drag distance) without modifying `PenTool`, `RectangleTool`, `EraserTool`, or any of the canvas wiring code.

<details>
<summary>▶ Show Solution</summary>

```ts
export class CircleTool implements Tool {
  private centerX = 0
  private centerY = 0
  private drawing = false
  onMouseDown(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    this.drawing = true
    this.centerX = x
    this.centerY = y
  }
  onMouseMove(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.drawing) return
    const radius = Math.hypot(x - this.centerX, y - this.centerY)   // LAB-06's math-adjacent Pythagorean distance
    ctx.beginPath()
    ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  onMouseUp(): void { this.drawing = false }
}

// usage: a new toolbar button, exactly like the existing three:
const circleBtn = document.createElement('button')
circleBtn.textContent = 'Circle'
circleBtn.addEventListener('click', () => { currentTool = new CircleTool() })
toolbar.appendChild(circleBtn)
```

**Key insight:** `CircleTool` needed ZERO knowledge of `PenTool`, `RectangleTool`, or `EraserTool`'s implementations — it only needed to satisfy the SHARED `Tool` interface (LAB-17). This is the Strategy pattern's entire payoff: the SET of possible tools can grow indefinitely, one new class at a time, with the canvas wiring, the toolbar structure, and every OTHER tool completely undisturbed.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `Tool` interface, swappable `currentTool` | Photoshop/Figma/GIMP's tool palette — literally this pattern |
| Canvas `clearRect` + replay from `history` | How "undo" works in ANY raster (pixel-based) editor, as opposed to vector editors |
| `StrokeCommand` | LAB-23's Command pattern, applied to drawing actions |

**Where you will see this again:** LAB-76 (Physics Sandbox) and LAB-78 (G-code Backplotter) both use Canvas drawing extensively; LAB-70 (Render Loops) formalizes the "clear and redraw every frame" pattern this lab's `redrawAll()` already previewed.

---

## Final Check

| Feature | How to verify |
|---|---|
| Freehand drawing follows the mouse and paints pixels correctly | Step 1 |
| Switching between Pen/Rectangle/Eraser changes behavior without touching canvas wiring | Step 2 |
| Undo correctly removes exactly the most recent stroke, preserving earlier ones | Step 3 |
| A new `CircleTool` works with zero changes to existing tools or wiring | Challenge |
| You can explain, without notes, why canvas undo requires "clear and replay" instead of surgical removal | Concept box |

---

## Quick Check Answers

**1. What does canvas drawing cost you, compared to DOM elements?**

The ability to individually address, query, or modify a SPECIFIC shape after it's drawn — a canvas has no concept of "the rectangle at position 3" the way a DOM tree has an addressable `<div>` you could look up, restyle, or remove directly (LAB-29). Once pixels are painted, the canvas only knows colors, not shapes — which is exactly why this lab's undo (Step 3) had to track shapes SEPARATELY, in your own `history` array, rather than relying on the canvas to remember anything for you.

**2. Same events, different behavior per active tool — what pattern handles this?**

The Strategy pattern (LAB-19's composition, specifically) — `currentTool` HOLDS whichever `Tool` object is currently active, and the canvas's event listeners always forward to `currentTool`'s methods, never caring WHICH concrete tool that happens to be. Swapping `currentTool = new RectangleTool()` changes the BEHAVIOR without changing the WIRING, exactly like LAB-19's duck swapping its `flyBehavior` at runtime.

**3. What must `undo()` do for a canvas specifically?**

Clear the ENTIRE canvas and REPLAY every remaining command in order (Step 3's `redrawAll()`) — because canvas pixels have no individually removable identity, there is no way to "just erase this one stroke" the way LAB-24's text editor could surgically reverse one specific string operation. This is a direct, structural consequence of canvas being a PIXEL BUFFER rather than a tree of addressable objects — the SAME Command pattern (LAB-23) applies, but the actual UNDO MECHANISM (full clear-and-replay vs. surgical reversal) differs based on what kind of "document" is being edited.

---

*Next: [LAB-41 — File Explorer](LAB-41-file-explorer.md) — TypeScript (Browser), same module*
