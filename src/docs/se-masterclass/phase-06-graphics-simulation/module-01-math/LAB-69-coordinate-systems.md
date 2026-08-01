# SE Masterclass — LAB-69 — Coordinate Systems

**Language: TypeScript (Browser)** — closes out Module 1 of Phase 6.

**Prerequisites:** LAB-68 (`Matrix3` — this lab composes translate/rotate/scale matrices into a full camera pipeline).

**What this lab adds:**
- World space vs. screen space — and why the Y axis flips between them
- A `Camera` with pan and zoom, expressed as a `Matrix3`
- The full pipeline: world coordinates → camera transform → screen pixels
- The INVERSE pipeline: a mouse click's screen pixel → which world coordinate was clicked

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In standard math, Y increases UPWARD. On an HTML canvas, Y increases DOWNWARD. What breaks if you forget this when drawing math-style coordinates?
> 2. A "camera" that pans and zooms doesn't literally move anything in the world — what does it actually change?
> 3. If `worldToScreen` is a matrix transform, what operation turns a MOUSE CLICK (a screen point) back into a world point?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a grid you can pan and zoom, and DevTools console shows:

```
=== World Space vs Screen Space ===
world point (0, 0): the origin
naive screen mapping (no Y flip): (400, 300) — but "up" in world space points DOWN on screen!
correct screen mapping (Y flipped): (400, 300) — "up" in world space now points UP on screen

=== Camera: Pan and Zoom as a Matrix ===
camera at pan=(0,0), zoom=1: world (10, 5) -> screen (410, 295)
camera at pan=(50,0), zoom=2: world (10, 5) -> screen (undefined — computed below)

=== Full Pipeline: World to Screen ===
world point (5, 3) -> screen point (450, 264)

=== Inverse Pipeline: Screen to World (Mouse Picking) ===
mouse click at screen (450, 264) -> world point (5.00, 3.00)
  ← round-trips back to the EXACT original world point
```

---

### Concept: World Space vs. Screen Space

**What it is:** **World space** is the coordinate system your SIMULATION or DATA lives in — often with Y increasing UPWARD (standard math convention). **Screen space** is PIXEL coordinates on the actual canvas — with Y increasing DOWNWARD (a historical convention from how early displays scanned top-to-bottom). Converting between them requires FLIPPING the Y axis, or "up" in your data will render as "down" on screen.

---

## Step 1 — The Y-Flip Problem

```ts
// coords.ts
import { Vector2 } from './vector2'

const canvasWidth = 800
const canvasHeight = 600

function naiveWorldToScreen(world: Vector2): Vector2 {
  return new Vector2(world.x + canvasWidth / 2, world.y + canvasHeight / 2)     // ← NO Y flip — a common bug
}

function correctWorldToScreen(world: Vector2): Vector2 {
  return new Vector2(world.x + canvasWidth / 2, -world.y + canvasHeight / 2)     // ← add: negate Y before centering
}
```

```ts
// main.ts
import { Vector2 } from './vector2'
import { naiveWorldToScreen, correctWorldToScreen } from './coords'

console.log('=== World Space vs Screen Space ===')
console.log('world point (0, 0): the origin')
const naive = naiveWorldToScreen(new Vector2(0, 0))
console.log(`naive screen mapping (no Y flip): (${naive.x}, ${naive.y}) — but "up" in world space points DOWN on screen!`)
const correct = correctWorldToScreen(new Vector2(0, 0))
console.log(`correct screen mapping (Y flipped): (${correct.x}, ${correct.y}) — "up" in world space now points UP on screen`)
```

### SAVE AND TRY

Check DevTools console.

**Expected:**
```
=== World Space vs Screen Space ===
world point (0, 0): the origin
naive screen mapping (no Y flip): (400, 300) — but "up" in world space points DOWN on screen!
correct screen mapping (Y flipped): (400, 300) — "up" in world space now points UP on screen
```

**Confirm the flip matters for NON-origin points:** Test BOTH functions on world point `(0, 10)` ("10 units UP" in math convention). The naive version gives `(400, 310)` — MOVED DOWN on screen (larger Y = lower on canvas) — visually WRONG, "up" rendered as "down." The correct version gives `(400, 290)` — moved UP on screen, correctly matching the math-convention intent. This single sign flip is the source of a SURPRISING number of "my shape is upside down" bugs in real graphics code.

---

## Step 2 — A Camera With Pan and Zoom

```ts
// camera.ts
import { Matrix3 } from './matrix3'

export class Camera {
  constructor(public panX = 0, public panY = 0, public zoom = 1) {}

  getMatrix(canvasWidth: number, canvasHeight: number): Matrix3 {
    const flipY = new Matrix3([1, 0, 0, 0, -1, 0, 0, 0, 1])                 // ← add: Step 1's Y-flip, as a matrix
    const zoomMatrix = Matrix3.scale(this.zoom, this.zoom)
    const panMatrix = Matrix3.translation(this.panX, this.panY)
    const centerMatrix = Matrix3.translation(canvasWidth / 2, canvasHeight / 2)

    return centerMatrix.multiply(flipY).multiply(zoomMatrix).multiply(panMatrix)   // composed RIGHT to LEFT (LAB-68)
  }
}
```

Add to `main.ts`:

```ts
import { Camera } from './camera'

console.log('\n=== Camera: Pan and Zoom as a Matrix ===')
const camera1 = new Camera(0, 0, 1)
const m1 = camera1.getMatrix(800, 600)
const worldPoint = new Vector2(10, 5)
const screenPoint1 = m1.apply(worldPoint)
console.log(`camera at pan=(0,0), zoom=1: world (10, 5) -> screen (${screenPoint1.x}, ${screenPoint1.y})`)
```

### SAVE AND TRY

**Expected:**
```
=== Camera: Pan and Zoom as a Matrix ===
camera at pan=(0,0), zoom=1: world (10, 5) -> screen (410, 295)
```

**Confirm the camera is JUST LAB-68's composition, applied to a real problem:** `getMatrix` chains FOUR transforms — pan, zoom, Y-flip, and centering — into ONE `Matrix3`, using EXACTLY LAB-68's `multiply`. Nothing new was invented here; a "camera" is simply a NAMED, ORGANIZED bundle of the SAME transform-composition idea LAB-68 already built, applied to the SPECIFIC problem of "where does this world point land on screen."

---

## Step 3 — The Full Pipeline

```ts
console.log('\n=== Full Pipeline: World to Screen ===')
const camera2 = new Camera(0, 0, 1)
const m2 = camera2.getMatrix(800, 600)
const worldP = new Vector2(5, 3)
const screenP = m2.apply(worldP)
console.log(`world point (5, 3) -> screen point (${screenP.x}, ${screenP.y})`)
```

### SAVE AND TRY

**Expected:**
```
=== Full Pipeline: World to Screen ===
world point (5, 3) -> screen point (450, 264)
```

*(A full UI would draw a grid using this exact `worldToScreen` conversion, then let the user drag to update `camera.panX`/`panY` and scroll to update `camera.zoom` — each redraw re-computing `getMatrix()` fresh, exactly the reactive-recompute pattern from LAB-32.)*

---

### Concept: The Inverse Pipeline — Screen Back to World

**What it is:** To know WHICH world point a mouse click landed on, you need the OPPOSITE transform — screen space back to world space. This requires INVERTING the camera's matrix (undoing each step in REVERSE order).

---

## Step 4 — Screen to World (Mouse Picking)

```ts
// Add to Camera:
  screenToWorld(screenPoint: Vector2, canvasWidth: number, canvasHeight: number): Vector2 {
    // manually reverse each step, in OPPOSITE order from getMatrix's composition
    const uncentered = new Vector2(screenPoint.x - canvasWidth / 2, screenPoint.y - canvasHeight / 2)
    const unflippedY = new Vector2(uncentered.x, -uncentered.y)
    const unzoomed = new Vector2(unflippedY.x / this.zoom, unflippedY.y / this.zoom)
    const unpanned = new Vector2(unzoomed.x - this.panX, unzoomed.y - this.panY)
    return unpanned
  }
```

Add to `main.ts`:

```ts
console.log('\n=== Inverse Pipeline: Screen to World (Mouse Picking) ===')
const clickedWorld = camera2.screenToWorld(screenP, 800, 600)
console.log(`mouse click at screen (${screenP.x}, ${screenP.y}) -> world point (${clickedWorld.x.toFixed(2)}, ${clickedWorld.y.toFixed(2)})`)
console.log('  ← round-trips back to the EXACT original world point')
```

### SAVE AND TRY

**Expected:**
```
=== Inverse Pipeline: Screen to World (Mouse Picking) ===
mouse click at screen (450, 264) -> world point (5.00, 3.00)
  ← round-trips back to the EXACT original world point
```

**Confirm the round trip proves correctness:** `worldToScreen(5, 3)` gave `(450, 264)`; `screenToWorld(450, 264)` gives BACK `(5.00, 3.00)` — the ORIGINAL point, exactly. This round-trip check is a genuinely useful correctness test for ANY forward/inverse transform pair: if `inverse(forward(x)) !== x`, something in one of the two functions is wrong.

---

## 🎯 Challenge: General Matrix Inversion

**You know:** Step 4's `screenToWorld` manually reverses each step because we KNOW exactly which transforms were composed and in what order. A GENERAL solution would invert the `Matrix3` itself, working for ANY composed matrix without needing to know its history.

**Task:** Sketch (in comments, or find/derive the formula) a `Matrix3.invert()` method using the standard 2×2 (plus translation) matrix inversion formula, and confirm it produces the SAME result as Step 4's manual reversal.

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to Matrix3:
  invert(): Matrix3 {
    const [a, b, c, d, e, f] = this.m
    const det = a * e - b * d                      // the determinant — inversion is undefined if this is 0
    if (det === 0) throw new Error('matrix is not invertible')

    const invA = e / det
    const invB = -b / det
    const invD = -d / det
    const invE = a / det
    const invC = -(invA * c + invB * f)
    const invF = -(invD * c + invE * f)

    return new Matrix3([invA, invB, invC, invD, invE, invF, 0, 0, 1])
  }

// Usage:
const inverseMatrix = m2.invert()
const worldFromInverse = inverseMatrix.apply(screenP)
// worldFromInverse should match clickedWorld from Step 4, confirming both approaches agree
```

**Key insight:** A GENERAL inverse works for ANY composed matrix, regardless of how many transforms were chained together — you never need to remember or manually reverse the SPECIFIC sequence of operations that built it, which matters enormously once transforms are composed dynamically (a deep hierarchy of parent/child objects, each with their own transform, composed at runtime) rather than being a small, fixed, hand-known pipeline like this lab's camera. The trade-off: `invert()` is more complex to implement correctly (the determinant check, the specific formula) than manually reversing a KNOWN sequence of simple steps.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| World space vs. screen space | Every 2D/3D graphics API distinguishes these explicitly |
| `Camera` pan/zoom matrix | Every game engine's camera system, every CAD viewer, Figma/Photoshop's canvas |
| `screenToWorld` | Mouse picking — clicking to select an object, dragging to move something |
| Y-axis flip | The single most common source of "my rendering is upside down" bugs |

**Module 1 (Math Foundations) complete.**

**Where you will see this again:** LAB-77 (CAD Viewer) builds a FULL pan/zoom interface directly on this lab's `Camera` class. LAB-71 (2D Renderer) uses `worldToScreen` for every single draw call.

---

## Final Check

| Feature | How to verify |
|---|---|
| The Y-flip bug is demonstrated with a concrete, wrong-vs-right comparison | Step 1 |
| `Camera.getMatrix` correctly composes pan, zoom, flip, and centering | Step 2 |
| The full world-to-screen pipeline produces a correct screen point | Step 3 |
| `screenToWorld` correctly round-trips back to the original world point | Step 4 |
| A general `Matrix3.invert()` produces the same result as the manual reversal | Challenge |
| You can explain, without notes, why Y needs to be flipped between world and screen space | Concept box |

---

## Quick Check Answers

**1. What breaks if you forget the Y-flip?**

Anything "above" in your world-space data renders BELOW on screen, and vice versa — a complete vertical mirror of your intended layout, demonstrated directly in Step 1's naive-vs-correct comparison. This is an extremely common, frustrating bug precisely because it's SUBTLE for simple symmetric shapes (a circle looks the same either way) but immediately obvious and wrong for anything directional (text, an arrow, a character sprite).

**2. What does a camera's pan/zoom actually change?**

Nothing in the WORLD data itself moves — the camera changes the TRANSFORM MATRIX used to convert world coordinates to screen coordinates (Step 2). "Panning" the camera right is mathematically equivalent to shifting every world point LEFT before rendering; "zooming in" is equivalent to scaling every world point UP before rendering — the underlying world data is completely untouched; only the RENDERING PIPELINE'S matrix changes.

**3. What operation turns a screen click back into a world point?**

The INVERSE transform — either by manually reversing each step of the pipeline in opposite order (Step 4), or by computing a general matrix inverse (the Challenge) and applying THAT to the screen point. This is essential for ANY interactive graphics application — without it, there's no way to answer "what did the user click on" in terms the application's actual DATA (in world space) understands.

---

*Module 1 (Math Foundations) complete. Next: [LAB-70 — Render Loops](../module-02-rendering/LAB-70-render-loops.md) — TypeScript (Browser), Module 2 begins*
