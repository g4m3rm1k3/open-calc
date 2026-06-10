# CAD/CAM — Lesson 10 — Constraint Solving

## What You Will Build

Select a line, then click "Horizontal" in the constraints panel. The line rotates
to become exactly horizontal, preserving its midpoint and length. Selecting
"Vertical" rotates it to vertical. An overconstrained state (applying conflicting
constraints) shows an error indicator. The sketch model stores constraints alongside
geometry, and the solver updates geometry to satisfy them.

## What You Need to Know First

Lessons 01–09. Lines exist in the sketch. This lesson adds a second layer to the
sketch: constraints that govern how geometry must relate to itself or to fixed
references. The solver is a standalone pure function.

---

## The Problem

Drawing a line freehand produces a line that is close to horizontal — maybe 2° off.
The designer's intent is horizontal. Without constraints, the line must be manually
adjusted to exactly 0°. With constraints, the designer declares their intent
("this line is horizontal") and the solver enforces it mathematically.

Constraints are equations. A horizontal constraint on a line with endpoints
`A = (ax, ay)` and `B = (bx, by)` is the equation `ay = by` (both endpoints have
the same Y coordinate). The solver finds the geometry configuration that satisfies
all active constraint equations simultaneously.

---

## Step 1 — Maths: Newton-Raphson for Systems of Equations

### The single-variable version

You already know Newton-Raphson from the calculator project's lesson 20. To find
where `f(x) = 0`:

```
x_{n+1} = x_n - f(x_n) / f'(x_n)
```

Starting from a guess `x_0`, each iteration produces a better approximation. The
method converges quadratically — each step roughly doubles the number of correct
digits.

### The multi-variable version

For `m` constraint equations `F(x) = 0` where `x = (x₁, x₂, ..., xₙ)` is a vector
of unknowns (the sketch point coordinates):

```
F(x) = [ f₁(x₁, x₂, ..., xₙ) ]   = 0
       [ f₂(x₁, x₂, ..., xₙ) ]
       [ ...                   ]
       [ fₘ(x₁, x₂, ..., xₙ) ]
```

The Newton-Raphson update step becomes:

```
x_{n+1} = x_n - J⁻¹ × F(x_n)
```

Where `J` is the **Jacobian matrix** — the matrix of partial derivatives of `F`
with respect to `x`.

### The Jacobian matrix

The Jacobian `J` is an `m × n` matrix where entry `J[i][j]` is the partial derivative
of constraint `i` with respect to variable `j`:

```
J[i][j] = ∂fᵢ / ∂xⱼ
```

For a horizontal constraint `f(ay, by) = ay - by = 0`:
```
∂f/∂ax = 0    ∂f/∂ay = 1
∂f/∂bx = 0    ∂f/∂by = -1
```

The Jacobian entry for (horizontal constraint, ay) is 1. For (horizontal constraint, by) is -1. All others are 0.

**Why the Jacobian?**
In single-variable Newton-Raphson, `f'(x)` tells how sensitive `f` is to changes in
`x`. The Jacobian generalises this to multiple variables: `J[i][j]` tells how
sensitive constraint `i` is to changes in variable `j`. Inverting the Jacobian
(or solving `J × Δx = -F`) gives the step direction that most reduces all constraint
errors simultaneously.

**Inverting J vs solving J Δx = -F:**
For the small systems in a sketch (typically < 20 variables), directly inverting `J`
is acceptable. For large systems (hundreds of variables), solving the linear system
is more numerically stable. This lesson uses direct inversion for clarity; the
numerical stability note is important context.

**CS lens — Newton-Raphson as gradient descent:**
Newton-Raphson on a system of equations is related to gradient descent in machine
learning — both iteratively reduce an error by stepping in the direction indicated
by derivatives. Newton-Raphson converges faster (quadratically) because it uses the
second-order information (the Jacobian). Gradient descent uses only first-order
information.

---

## Step 2 — Sketch Constraints Data Model

### Update `src/scene/sketch.ts`

```typescript
export type ConstraintType =
  | 'HORIZONTAL'
  | 'VERTICAL'
  | 'FIXED_POINT'
  | 'COINCIDENT'

export interface SketchConstraint {
  readonly id:           string
  readonly type:         ConstraintType
  readonly targetLineId: string
}

export interface Sketch {
  readonly lines:       readonly SketchLine[]
  readonly circles:     readonly SketchCircle[]
  readonly arcs:        readonly SketchArc[]
  readonly constraints: readonly SketchConstraint[]
}

let nextConstraintId = 0

export function addConstraintToSketch(
  sketch:     Sketch,
  type:       ConstraintType,
  lineId:     string,
): Sketch {
  const newConstraint: SketchConstraint = {
    id:           `constraint-${nextConstraintId++}`,
    type,
    targetLineId: lineId,
  }
  return {
    ...sketch,
    constraints: [...sketch.constraints, newConstraint],
  }
}
```

Update `createSketch` to include `constraints: []`.

---

## Step 3 — The Constraint Solver

### Create `src/sketch/constraintSolver.ts`

```typescript
import type { Sketch, SketchLine, SketchConstraint } from '../scene/sketch.js'
```

**What `src/sketch/constraintSolver.ts` is:**
`constraintSolver.ts` owns the Newton-Raphson solver for sketch constraints. It
accepts a `Sketch` and returns a new `Sketch` with adjusted point coordinates that
satisfy the constraints. It has no side effects, no DOM access, no Three.js
knowledge. It is a pure function.

**The variable vector:**
The solver works with a flat array of numbers — the "variable vector" `x`. For a
sketch with two lines (4 points, 8 coordinates):

```
x = [line0.start.x, line0.start.y, line0.end.x, line0.end.y,
     line1.start.x, line1.start.y, line1.end.x, line1.end.y]
```

A constraint index map records which position in `x` corresponds to which point
coordinate. After solving, the flat array is unpacked back into `SketchLine` objects.

```typescript
interface VariableMap {
  lineStartX: Map<string, number>
  lineStartY: Map<string, number>
  lineEndX:   Map<string, number>
  lineEndY:   Map<string, number>
}

function buildVariableVector(
  sketch: Sketch,
): { variables: number[]; varMap: VariableMap } {
  const variables: number[] = []
  const varMap: VariableMap = {
    lineStartX: new Map(),
    lineStartY: new Map(),
    lineEndX:   new Map(),
    lineEndY:   new Map(),
  }

  for (const line of sketch.lines) {
    varMap.lineStartX.set(line.id, variables.length)
    variables.push(line.start.x)
    varMap.lineStartY.set(line.id, variables.length)
    variables.push(line.start.y)
    varMap.lineEndX.set(line.id, variables.length)
    variables.push(line.end.x)
    varMap.lineEndY.set(line.id, variables.length)
    variables.push(line.end.y)
  }

  return { variables, varMap }
}
```

**Evaluate constraints:**

```typescript
function evaluateConstraints(
  variables:   number[],
  constraints: readonly SketchConstraint[],
  varMap:      VariableMap,
): number[] {
  return constraints.map((constraint) => {
    if (constraint.type === 'HORIZONTAL') {
      const ayIndex = varMap.lineStartY.get(constraint.targetLineId)
      const byIndex = varMap.lineEndY.get(constraint.targetLineId)
      if (ayIndex === undefined || byIndex === undefined) return 0
      return variables[ayIndex]! - variables[byIndex]!  // f = ay - by = 0
    }
    if (constraint.type === 'VERTICAL') {
      const axIndex = varMap.lineStartX.get(constraint.targetLineId)
      const bxIndex = varMap.lineEndX.get(constraint.targetLineId)
      if (axIndex === undefined || bxIndex === undefined) return 0
      return variables[axIndex]! - variables[bxIndex]!  // f = ax - bx = 0
    }
    return 0
  })
}
```

**Build Jacobian numerically:**

```typescript
const DERIVATIVE_STEP = 1e-7

function buildJacobian(
  variables:   number[],
  constraints: readonly SketchConstraint[],
  varMap:      VariableMap,
): number[][] {
  const numConstraints = constraints.length
  const numVariables   = variables.length

  const jacobian: number[][] = Array.from(
    { length: numConstraints },
    () => new Array(numVariables).fill(0),
  )

  const baseErrors = evaluateConstraints(variables, constraints, varMap)

  for (let varIndex = 0; varIndex < numVariables; varIndex++) {
    const perturbedVariables = [...variables]
    perturbedVariables[varIndex] = variables[varIndex]! + DERIVATIVE_STEP

    const perturbedErrors = evaluateConstraints(
      perturbedVariables, constraints, varMap,
    )

    for (let constraintIndex = 0; constraintIndex < numConstraints; constraintIndex++) {
      jacobian[constraintIndex]![varIndex] =
        (perturbedErrors[constraintIndex]! - baseErrors[constraintIndex]!) /
        DERIVATIVE_STEP
    }
  }

  return jacobian
}
```

**Numerical differentiation — `(f(x + h) - f(x)) / h`:**
The partial derivative `∂f/∂xⱼ` is approximated by perturbing `xⱼ` by a small `h`
and measuring the change in `f`. This is the **finite difference method**: it
computes derivatives numerically rather than symbolically.

Symbolic differentiation (computing exact formulas for each derivative) is more
accurate and faster at runtime. Numerical differentiation is correct for any
constraint function — even ones with complex formulas — without deriving the Jacobian
analytically. For a sketch solver where constraints are few (< 20) and clarity matters,
numerical differentiation is the right trade-off.

`DERIVATIVE_STEP = 1e-7` — the step size. Too large: the approximation is inaccurate.
Too small: floating-point cancellation causes the numerator to be 0 (both `f(x+h)`
and `f(x)` round to the same value). `1e-7` is the standard choice for 64-bit floats.

**Solve one Newton step (Gaussian elimination):**

```typescript
function newtonStep(
  variables:   number[],
  constraints: readonly SketchConstraint[],
  varMap:      VariableMap,
): number[] {
  const errors   = evaluateConstraints(variables, constraints, varMap)
  const jacobian = buildJacobian(variables, constraints, varMap)

  // Solve: J × Δx = -F using Gaussian elimination
  const numConstraints = constraints.length
  const numVariables   = variables.length

  // Augmented matrix [J | -F]
  const augmented = jacobian.map((row, rowIndex) => [
    ...row,
    -(errors[rowIndex] ?? 0),
  ])

  // Forward elimination
  for (let pivot = 0; pivot < Math.min(numConstraints, numVariables); pivot++) {
    const pivotRow = augmented[pivot]!
    const pivotVal = pivotRow[pivot] ?? 0
    if (Math.abs(pivotVal) < 1e-12) continue

    for (let row = 0; row < numConstraints; row++) {
      if (row === pivot) continue
      const factor = (augmented[row]![pivot] ?? 0) / pivotVal
      augmented[row] = augmented[row]!.map((value, col) => value - factor * (augmented[pivot]![col] ?? 0))
    }
    augmented[pivot] = augmented[pivot]!.map((value) => value / pivotVal)
  }

  // Extract Δx
  const delta = new Array(numVariables).fill(0)
  for (let constraintIndex = 0; constraintIndex < numConstraints; constraintIndex++) {
    delta[constraintIndex] = augmented[constraintIndex]![numVariables] ?? 0
  }

  return variables.map((value, index) => value + (delta[index] ?? 0))
}
```

**Gaussian elimination — first appearance:**
**Gaussian elimination** is the standard algorithm for solving systems of linear
equations `Ax = b`. It transforms the matrix into **row echelon form** by applying
row operations (multiplying a row by a scalar, subtracting a multiple of one row
from another). When complete, the unknowns can be read off directly.

This is the same technique taught in linear algebra courses for solving `2x + 3y = 8,
4x - y = 2`. Here it is applied programmatically to the Jacobian system.

**The main solver:**

```typescript
export function solveConstraints(
  sketch:       Sketch,
  maxIterations = 50,
  tolerance     = 1e-8,
): Sketch {
  if (sketch.constraints.length === 0) return sketch

  const { variables: initialVars, varMap } = buildVariableVector(sketch)
  let variables = initialVars

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const errors    = evaluateConstraints(variables, sketch.constraints, varMap)
    const maxError  = Math.max(...errors.map(Math.abs))

    if (maxError < tolerance) break

    variables = newtonStep(variables, sketch.constraints, varMap)
  }

  // Reconstruct sketch with solved coordinates
  const updatedLines = sketch.lines.map((line) => ({
    ...line,
    start: {
      x: variables[varMap.lineStartX.get(line.id)!]!,
      y: variables[varMap.lineStartY.get(line.id)!]!,
    },
    end: {
      x: variables[varMap.lineEndX.get(line.id)!]!,
      y: variables[varMap.lineEndY.get(line.id)!]!,
    },
  }))

  return { ...sketch, lines: updatedLines }
}
```

**`Math.max(...errors.map(Math.abs))` — spread and method reference:**
`errors.map(Math.abs)` creates an array of absolute values of all errors.
`Math.max(...absoluteErrors)` uses the spread operator to pass the array as
individual arguments to `Math.max`. The result is the maximum absolute constraint
error. If it is below `tolerance`, all constraints are satisfied to numerical
precision.

**`Math.abs` as a method reference:**
`array.map(Math.abs)` passes `Math.abs` as the mapping function without wrapping it
in an arrow function. `array.map(x => Math.abs(x))` is equivalent. Both are valid;
the direct reference is more concise.

---

## Step 4 — Wire to the Toolbar and Sketch

### Update `src/App.tsx`

When the "Horizontal" button is clicked in the constraints panel, call
`addConstraintToSketch` and then `solveConstraints`:

```tsx
function handleAddConstraint(type: ConstraintType): void {
  if (selectedId === null) return

  const sketchWithConstraint = addConstraintToSketch(
    sketch,
    type,
    selectedId,
  )
  const solvedSketch = solveConstraints(sketchWithConstraint)
  setSketch(solvedSketch)
}
```

Add `sketch` and `setSketch` as state in `App`. Pass them to `ViewportComponent`
and `ToolPanel`.

---

## Debugging: When the Solver Produces Wrong Results

**Symptom: line rotates wildly instead of becoming horizontal**

The Jacobian is degenerate (near-zero pivot) for the chosen constraint. The line
may already be nearly horizontal, or the variable numbering may be wrong. Log the
Jacobian matrix and check that its structure matches the expected partial derivatives.

**Symptom: constraint solver runs but line does not change**

`setSketch` is called but `ViewportComponent` is not re-rendering the sketch.
Verify the `sketch` prop is passed to `ViewportComponent` and a `useEffect` calls
`renderSketch` when `sketch` changes.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`solveConstraints` is a pure function. It accepts a `Sketch` and returns a `Sketch`.
In lesson 11 (dimension constraints), a distance constraint is added: the solver
receives the new constraint and adjusts the line length. The solver function grows
to handle the new constraint type; the interface is unchanged.

Newton-Raphson for constraint solving is the same algorithm the calculator project
used in lesson 20 for finding roots — the connection is explicit: lesson 10 of the
CAM project is lesson 20 of the calculator, generalised to multiple equations.

In lesson 15 (Python backend), the constraint solver moves to Python — but the
TypeScript interface it presents to the frontend remains the same. The frontend sends
a `Sketch` JSON object and receives a solved `Sketch` back. The solver's purity
makes this translation trivial.

---

## What Breaks Without This

**Without numerical differentiation:**
Every constraint type would require a manually-derived Jacobian row. Adding a new
constraint type requires deriving and implementing its partial derivatives. For a
simple horizontal constraint this is easy (`∂(ay - by)/∂ay = 1`). For a distance
constraint (lesson 11) or a tangency constraint, the derivative is complex. Numerical
differentiation makes adding new constraints a matter of implementing the constraint
equation only — the Jacobian computes itself.

**Without the tolerance check:**
The solver would run all 50 iterations even when constraints are already satisfied.
For constraints that are already satisfied (user applies horizontal to an already-
horizontal line), this wastes computation on 50 Newton steps that all compute Δx ≈ 0.
The `maxError < tolerance` early exit is essential for performance.

---

## Definition of Done

- [ ] Selecting a line and clicking "Horizontal" makes the line exactly horizontal
- [ ] "Vertical" makes the line exactly vertical
- [ ] Multiple constraints on different lines are solved simultaneously
- [ ] Applying conflicting constraints is shown in the UI (optional stretch goal)
- [ ] `solveConstraints` is a pure function with no side effects
- [ ] You can derive the Jacobian for the horizontal constraint by hand
- [ ] You can explain Newton-Raphson for systems of equations and why the Jacobian is needed
- [ ] You can explain Gaussian elimination at a high level
- [ ] You can explain numerical differentiation and why `h = 1e-7`
- [ ] Run:
      ```
      git add src/
      git commit -m "Add constraint solving: Newton-Raphson with numerical Jacobian solves horizontal/vertical constraints, Gaussian elimination linearises the system"
      ```

---

*Next: Lesson 11 — Dimension Constraints. Type 50 next to a line and it extends or
shrinks to exactly 50mm. Degrees of freedom counted. Over- and under-constrained
states shown in the UI.*
