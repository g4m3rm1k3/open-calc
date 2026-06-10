# CAD/CAM — Lesson 11 — Dimension Constraints

## What You Will Build

Select a line, click "Dimension" in the constraints panel, type a value — the line
extends or shrinks to exactly that length. Dimension labels appear on the canvas
beside each constrained line, showing the target length. The degrees of freedom
counter in the status bar shows how many unconstrained variables remain in the sketch.
An over-constrained sketch shows a red warning badge in the properties panel.

## What You Need to Know First

Lessons 01–10. The constraint solver (lesson 10) handles orientation constraints.
This lesson adds a scalar constraint (length), explains degrees of freedom, and
introduces dimension labels as a new rendering concern.

---

## The Problem

A horizontal constraint forces `ay = by` — a direction constraint. A dimension
constraint forces `|B - A| = target_length` — a scalar constraint. Scalar
constraints are harder because changing the length of a line must preserve either
the start point, the end point, or the midpoint. Which to preserve is a design
decision: most CAD tools preserve the start point for newly drawn lines. This lesson
uses the midpoint convention — more natural for editing existing geometry.

---

## Step 1 — Maths: Degrees of Freedom and the Constraint Equation

### Degrees of freedom

A 2D point has **2 degrees of freedom** (DOF) — it can move in X and Y
independently. A sketch with `n` unconstrained points has `2n` DOFs.

Each constraint equation reduces DOF by 1 (if it is independent of existing
constraints). A horizontal constraint removes 1 DOF (it fixes the relationship
between two Y coordinates). A fixed-point constraint removes 2 DOF (it fixes both
X and Y).

A **fully constrained** sketch has 0 DOF remaining — the geometry has exactly one
solution. An **under-constrained** sketch has positive DOF — some points can still
move freely. An **over-constrained** sketch has negative DOF — more constraints
than independent equations, meaning constraints conflict or are redundant.

For a sketch with `n` points and `c` constraint equations:
```
DOF = 2n - c
DOF = 0  → fully constrained
DOF > 0  → under-constrained (solver has free variables)
DOF < 0  → over-constrained (solver may fail or give inconsistent results)
```

This is a counting approximation — it assumes all constraints are independent.
In practice, two "redundant" constraints may express the same equation, giving
`DOF = 0` by count but still having a free variable.

### The distance constraint equation

For a line with endpoints `A = (ax, ay)` and `B = (bx, by)` and target length `L`:

```
f(ax, ay, bx, by) = sqrt((bx - ax)² + (by - ay)²) - L = 0
```

The partial derivatives (for the Jacobian):
```
∂f/∂ax = -(bx - ax) / sqrt(...)   (using chain rule on the square root)
∂f/∂ay = -(by - ay) / sqrt(...)
∂f/∂bx =  (bx - ax) / sqrt(...)
∂f/∂by =  (by - ay) / sqrt(...)
```

These are the analytical Jacobian entries. Because lesson 10 uses numerical
differentiation, the solver automatically computes these — no manual derivation
is needed. The solver works for any differentiable constraint function.

**SE lens — open for extension:**
The solver from lesson 10 is **open for extension** — adding a new constraint type
requires only implementing the constraint equation in `evaluateConstraints`.
The Jacobian, Newton-Raphson loop, and Gaussian elimination are closed for
modification. This is the same open/closed principle from the calculator's
lesson 09 dispatch table and lesson 19's intersection finder.

---

## Step 2 — Dimension Constraint Data Model

### Update `src/scene/sketch.ts`

Add `DISTANCE` to `ConstraintType`:

```typescript
export type ConstraintType =
  | 'HORIZONTAL'
  | 'VERTICAL'
  | 'FIXED_POINT'
  | 'COINCIDENT'
  | 'DISTANCE'

export interface SketchConstraint {
  readonly id:            string
  readonly type:          ConstraintType
  readonly targetLineId:  string
  readonly targetLength?: number  // only for DISTANCE
}
```

**`targetLength?: number` — optional property:**
The `?` makes `targetLength` optional — it is `undefined` for non-distance constraints
and a number for distance constraints. This avoids creating a separate type for
distance constraints while keeping the type compatible with the general constraint
interface. The trade-off: the type system does not enforce that `DISTANCE` constraints
have `targetLength` set. A discriminated union (`| { type: 'DISTANCE'; targetLength: number }`)
would be more precise but adds more boilerplate. For a small type system, the optional
property is acceptable.

---

## Step 3 — Extend the Constraint Evaluator

### Update `src/sketch/constraintSolver.ts`

In `evaluateConstraints`, add the `DISTANCE` case:

```typescript
if (constraint.type === 'DISTANCE') {
  const targetLength = constraint.targetLength ?? 0
  const axIndex = varMap.lineStartX.get(constraint.targetLineId)
  const ayIndex = varMap.lineStartY.get(constraint.targetLineId)
  const bxIndex = varMap.lineEndX.get(constraint.targetLineId)
  const byIndex = varMap.lineEndY.get(constraint.targetLineId)

  if (
    axIndex === undefined || ayIndex === undefined ||
    bxIndex === undefined || byIndex === undefined
  ) return 0

  const dx             = variables[bxIndex]! - variables[axIndex]!
  const dy             = variables[byIndex]! - variables[ayIndex]!
  const currentLength  = Math.hypot(dx, dy)

  return currentLength - targetLength
}
```

No changes to the Jacobian, Newton-Raphson loop, or reconstruction code — the solver
generalises automatically.

---

## Step 4 — DOF Counter

### Create `src/sketch/degreesOfFreedom.ts`

```typescript
import type { Sketch } from '../scene/sketch.js'

export function computeDegreesOfFreedom(sketch: Sketch): number {
  const pointCount      = sketch.lines.length * 2
                        + sketch.circles.length
                        + sketch.arcs.length
  const constraintCount = sketch.constraints.length
  return pointCount * 2 - constraintCount
}

export type ConstraintStatus = 'under' | 'fully' | 'over'

export function getConstraintStatus(dof: number): ConstraintStatus {
  if (dof > 0) return 'under'
  if (dof === 0) return 'fully'
  return 'over'
}
```

**`computeDegreesOfFreedom` — what it counts:**
- Each line has 2 points × 2 coordinates = 4 DOF
- Each circle centre has 1 point × 2 coordinates = 2 DOF (radius not a point)
- Each arc centre has 1 point × 2 coordinates = 2 DOF
- Each constraint removes 1 DOF

**Why circle radius is not counted:**
The radius is a scalar, not a point coordinate. The current solver only moves points.
Radius as a constrained variable would require adding it to the variable vector —
a future extension.

---

## Step 5 — Dimension Labels on Canvas

### Update `src/viewport/sketchRenderer.ts`

```typescript
export function buildDimensionLabel(
  line:         SketchLine,
  targetLength: number,
  viewport:     { xMin: number; xMax: number },
): THREE.Sprite {
  const midX = (line.start.x + line.end.x) / 2
  const midY = (line.start.y + line.end.y) / 2

  const canvas  = document.createElement('canvas')
  canvas.width  = 128
  canvas.height = 32

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle    = '#fbbf24'
  ctx.font         = 'bold 20px monospace'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${targetLength.toFixed(1)}`, 64, 16)

  const texture  = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite   = new THREE.Sprite(material)
  sprite.position.set(midX, midY + 0.5, 0.02)
  sprite.scale.set(1.5, 0.4, 1)
  sprite.name = `dim-${line.id}`

  return sprite
}
```

**`THREE.Sprite` — first appearance:**
A `Sprite` is a billboard object — it always faces the camera regardless of the
camera's orientation. It is used for 2D overlays rendered in 3D space: text labels,
icons, dimension annotations. The sprite's scale is in world units; `(1.5, 0.4, 1)`
makes a 1.5 × 0.4 unit rectangle in the XY sketch plane.

**`THREE.CanvasTexture` — first appearance:**
`CanvasTexture` converts a 2D canvas element's pixel content into a Three.js texture.
`document.createElement('canvas')` creates an off-screen canvas (not in the DOM).
Drawing text to it with the Canvas 2D API, then creating a `CanvasTexture` from it,
is the standard way to render text in Three.js (which has no built-in text renderer).

**`canvas.getContext('2d')` in Three.js context:**
This is the same Canvas 2D API used in the calculator project's lessons 11–12 for
the graph renderer — but here used to create texture content rather than a visible
drawing. The same API (`fillText`, `font`, `fillStyle`) is used in both contexts.

---

## Step 6 — UI: Dimension Input in the Properties Panel

Add a dimension input field to the constraints section that appears when a line is selected:

```tsx
function handleDimensionConstraint(inputValue: string): void {
  const targetLength = parseFloat(inputValue)
  if (isNaN(targetLength) || targetLength <= 0) return

  const sketchWithConstraint = addConstraintToSketch(
    sketch,
    'DISTANCE',
    selectedId!,
    targetLength,
  )
  const solvedSketch = solveConstraints(sketchWithConstraint)
  setSketch(solvedSketch)
}
```

Show DOF status in the status bar:

```tsx
const dof    = computeDegreesOfFreedom(sketch)
const status = getConstraintStatus(dof)

// In StatusBar render:
<span style={{ color: status === 'over' ? '#ef4444' : status === 'fully' ? '#22c55e' : 'inherit' }}>
  {status === 'over'   ? 'Over-constrained'   :
   status === 'fully'  ? 'Fully constrained'  :
                         `${dof} DOF free`}
</span>
```

---

## Debugging: When Dimension Constraints Produce Wrong Results

**Symptom: line changes length but snaps to a different length than entered**

The constraint is computing the current length correctly, but the solver converges to
a local minimum rather than the intended target. This can happen if the starting
geometry is very far from the target. The Newton-Raphson step size is not limited —
a very large step can jump past the solution. Add step limiting: `Δx = clamp(Δx, -maxStep, maxStep)` with `maxStep = 1.0` world unit.

**Symptom: over-constrained warning appears when it should not**

The DOF counter may be off — it counts constraints by number, not independence.
Two parallel constraints on the same line each count as 1 DOF reduction, but
one of them may be redundant (the line is already horizontal). The counter
correctly identifies this as over-constrained — the two constraints are not
independent, yet they both count.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `DISTANCE` constraint and its evaluator function are the pattern for all future
constraints: implement the equation `f = 0`, the solver handles the rest. In lesson
14 (sketch on a face), adding a "fix on plane" constraint will follow exactly this
pattern. The solver is unchanged.

`computeDegreesOfFreedom` is used in lesson 12 (extrusion) to require a fully-
constrained sketch before extruding. A sketch with DOF > 0 cannot be extruded
with a unique result — the solver would need to pick one of many valid configurations.

---

## What Breaks Without This

**Without the midpoint-preserving convention:**
The distance constraint changes the line's length, but if the start point is fixed
and only the end moves, dragging a line to a new length moves one endpoint far away.
The midpoint convention distributes the length change symmetrically — the line
grows or shrinks in both directions. Users find this more natural for editing.

**Without dimension labels:**
The applied dimension constraint is invisible — the user cannot see which lines are
constrained or to what length. Clicking "Dimension" and seeing no feedback creates
confusion about whether the constraint was applied at all.

---

## Definition of Done

- [ ] Select a line, type 50 in the dimension field — line becomes 50 units long
- [ ] Dimension label appears beside the line
- [ ] DOF counter in status bar shows correct count
- [ ] Over-constrained sketch shows red warning
- [ ] Fully constrained sketch shows green indicator
- [ ] You can explain degrees of freedom and compute DOF for a simple sketch
- [ ] You can write the distance constraint equation and its partial derivatives
- [ ] You can explain why the solver generalises automatically to new constraint types
- [ ] Run:
      ```
      git add src/
      git commit -m "Add dimension constraints: distance constraint equation extends solver, DOF counter, dimension labels via CanvasTexture sprites"
      ```

---

*Next: Lesson 12 — Extrusion. Select a closed profile, type a depth — a 3D solid
appears. Half-edge mesh representation, face normal computation, and the feature tree
are introduced.*
