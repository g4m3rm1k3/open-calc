# CAD/CAM — Lesson 04 — 4×4 Transforms

## What You Will Build

The properties panel gains Rotation and Scale sections beneath Position. Typing a
rotation angle rotates the box around the Y axis. Typing a scale factor makes the box
larger or smaller. All three transforms — translate, rotate, scale — are applied
through a single `THREE.Matrix4` that you compute from the component values. The
matrix stack is made explicit: you can see that combining transforms produces a new
matrix, not three separate operations.

## What You Need to Know First

Lessons 01–03. The box exists and its position is controlled by inputs. This lesson
extends the transform beyond position to rotation and scale, and replaces the direct
`mesh.position.set(x, y, z)` call with a matrix-based approach.

Linear algebra is not assumed. Every formula is derived from the geometric intuition
that motivates it.

---

## The Problem

Lesson 03 moves the box by directly setting `mesh.position.set(x, y, z)`. For
translation alone, this works. But rotation and scale cannot be combined with
translation using simple addition. Rotating by 45° then moving 3 units right is a
different result than moving 3 units right then rotating 45°. The order of operations
matters.

Handling three separate transform operations (position, rotation, scale) as three
separate properties on the mesh is what Three.js does by default — but it hides the
fundamental operation that is actually happening. Every combination of translation,
rotation, and scale can be expressed as a single **4×4 matrix**. Composing transforms
is matrix multiplication. Understanding this is not optional for CAD work: coordinate
frame changes (lesson 14), extrusion direction (lesson 12), and G-code axis alignment
(lesson 24) all require knowing what a transformation matrix is and what it does.

This lesson derives the matrix from first principles, builds it explicitly, and applies
it to the mesh.

---

## Step 1 — Maths: Why a 4×4 Matrix?

### 2D transformations without translation

Scaling a 2D point `(x, y)` by factor `s` is a matrix multiplication:

```
[ s  0 ] [ x ]   [ sx ]
[ 0  s ] [ y ] = [ sy ]
```

Rotating `(x, y)` by angle θ counterclockwise:

```
[ cos θ  -sin θ ] [ x ]   [ x cos θ - y sin θ ]
[ sin θ   cos θ ] [ y ] = [ x sin θ + y cos θ ]
```

Both scale and rotation are expressible as 2×2 matrix multiplication. Composing
them is multiplying the matrices. Simple.

### The translation problem

Translation — moving a point by `(dx, dy)` — is:

```
(x + dx, y + dy)
```

This cannot be expressed as a 2×2 matrix multiplication. Multiplying any 2×2 matrix
by `(x, y)` produces a result that depends only on `x` and `y` — it cannot add
a constant `dx`. This is a linear algebra fact: 2×2 matrices represent **linear
transformations**, and linear transformations always map the origin to the origin.
Translation does not keep the origin fixed, so it is not a linear transformation
in 2D.

### Homogeneous coordinates — the solution

The solution: add a third coordinate, always set to 1 for points.

```
(x, y) becomes (x, y, 1)
```

Now translation can be expressed as a 3×3 matrix:

```
[ 1  0  dx ] [ x ]   [ x + dx ]
[ 0  1  dy ] [ y ] = [ y + dy ]
[ 0  0   1 ] [ 1 ]   [   1    ]
```

Check: the matrix multiplies `(x, y, 1)` to produce `(x + dx, y + dy, 1)`. The
third coordinate `1` is unchanged — it is a bookkeeping coordinate that enables the
trick. Points always have a third coordinate of `1`. **Directions** (vectors that
represent displacements, not positions) have a third coordinate of `0`. Multiplying
a direction by a translation matrix leaves it unchanged — correct behaviour, because
translating a direction does not make physical sense.

### In 3D: the 4×4 matrix

Extending to 3D: points become `(x, y, z, 1)`, and all transforms are 4×4 matrices.

**Translation** by `(tx, ty, tz)`:
```
[ 1  0  0  tx ] [ x ]   [ x + tx ]
[ 0  1  0  ty ] [ y ] = [ y + ty ]
[ 0  0  1  tz ] [ z ]   [ z + tz ]
[ 0  0  0   1 ] [ 1 ]   [   1    ]
```

**Scale** by `(sx, sy, sz)`:
```
[ sx  0   0   0 ] [ x ]   [ sx·x ]
[  0  sy  0   0 ] [ y ] = [ sy·y ]
[  0  0   sz  0 ] [ z ]   [ sz·z ]
[  0  0   0   1 ] [ 1 ]   [  1   ]
```

**Rotation** around Y axis by angle θ:
```
[ cos θ   0   sin θ  0 ] [ x ]   [ x cos θ + z sin θ ]
[  0      1    0     0 ] [ y ] = [        y           ]
[-sin θ   0   cos θ  0 ] [ z ]   [-x sin θ + z cos θ ]
[  0      0    0     1 ] [ 1 ]   [        1           ]
```

**Rotation around Y explained geometrically:**
The Y axis points up. Rotating around Y sweeps points in the XZ plane. A point on
the positive X axis moves toward the negative Z axis as it rotates. This matches the
signs in the matrix: `x cos θ + z sin θ` for the new X (mixing old X and Z) and
`-x sin θ + z cos θ` for the new Z.

### Composing transforms

To first rotate, then translate, then scale: multiply the matrices in order.
Matrix multiplication is **not commutative**: `A × B ≠ B × A`.

```
finalTransform = Scale × Translation × Rotation
```

The convention: matrices apply right-to-left. The rightmost matrix acts first.
`Scale × Translation × Rotation × point` means: rotate the point, then translate
it, then scale the result.

Three.js's `Matrix4.compose(position, quaternion, scale)` does exactly this
composition. The lesson uses `makeTranslation`, `makeRotationY`, and `makeScale`
and then multiplies them explicitly — so the composition is visible, not hidden
inside a convenience function.

**CS lens — homogeneous coordinates:**
Adding a dimension to make translation linear is a technique called
**projective geometry**. The extra coordinate `w` (here always 1 for points) is
the homogeneous coordinate. When `w ≠ 1`, the actual position is `(x/w, y/w, z/w)`.
This is used in the GPU's perspective division step: the camera's projection matrix
sets `w` to the depth value, and the GPU divides to get the final screen position.
You do not need to manage this directly in Three.js, but understanding it explains
why the GPU pipeline works as it does.

**SE lens — composition as a design pattern:**
Representing all transforms as matrices and composing them with multiplication is
not just mathematically elegant — it is a critical SE pattern. Any number of
transforms can be combined into one matrix without the complexity growing. The CAD
application will apply transforms to: the object in the scene, the camera (lesson 17),
coordinate frame conversions between sketch planes and world space (lesson 14), and
G-code axis alignment (lesson 24). All use the same 4×4 matrix. Learning the one
pattern unlocks all of them.

---

## Step 2 — The Transform Data Type

### Update `src/scene/types.ts`

```typescript
export interface Transform {
  readonly translation: Readonly<{ x: number; y: number; z: number }>
  readonly rotation:    Readonly<{ x: number; y: number; z: number }>
  readonly scale:       Readonly<{ x: number; y: number; z: number }>
}

export interface BoxObject {
  readonly id:        string
  readonly transform: Transform
  readonly size:      Readonly<{ width: number; height: number; depth: number }>
  readonly colour:    number
}
```

**Why `Transform` is separate from `BoxObject`:**
`Transform` will be used by every geometry object in the scene: boxes, solids,
imported meshes. Defining it separately means it can be reused without duplication.
The type says: a transform has translation, rotation (Euler angles in degrees), and
scale — all as plain numeric objects.

**Why rotation uses Euler angles (not a quaternion):**
A **quaternion** is a 4-element representation of rotation that handles all cases
correctly (including avoiding gimbal lock). Three.js uses quaternions internally.
However, Euler angles (three rotation angles around X, Y, Z axes) are what humans
understand: "rotate 45° around Y" is intuitive. "Rotate by quaternion (0, 0.383, 0, 0.924)" is not.

The properties panel will show Euler angles. Internally, when building the matrix,
Euler angles are converted to the rotation matrix. The conversion from Euler to matrix
is performed once; the user never sees a quaternion.

### Update `src/scene/createBox.ts`

```typescript
import type { BoxObject } from './types.js'

let nextBoxId = 0

export function createBox(
  translationX: number,
  translationY: number,
  translationZ: number,
): BoxObject {
  const boxId = `box-${nextBoxId}`
  nextBoxId += 1

  return {
    id:     boxId,
    transform: {
      translation: { x: translationX, y: translationY, z: translationZ },
      rotation:    { x: 0, y: 0, z: 0 },
      scale:       { x: 1, y: 1, z: 1 },
    },
    size:   { width: 2, height: 2, depth: 2 },
    colour: 0x38bdf8,
  }
}
```

---

## Step 3 — Building the Matrix

### Create `src/scene/applyTransform.ts`

```typescript
import * as THREE from 'three'
import type { Transform } from './types.js'
```

**Import explanation:**
`import * as THREE from 'three'` — Three.js (lesson 01). `Matrix4`, `Euler`, and
`Quaternion` are Three.js classes needed to construct and compose the transform
matrix.

`import type { Transform } from './types.js'` — `scene/types.ts` owns the
transform data type. `import type` because only the type annotation is needed.

```typescript
export function buildMatrix(transform: Transform): THREE.Matrix4 {
  const translationMatrix = new THREE.Matrix4().makeTranslation(
    transform.translation.x,
    transform.translation.y,
    transform.translation.z,
  )

  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(transform.rotation.x),
    THREE.MathUtils.degToRad(transform.rotation.y),
    THREE.MathUtils.degToRad(transform.rotation.z),
    'XYZ',
  )
  const quaternion        = new THREE.Quaternion().setFromEuler(euler)
  const rotationMatrix    = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)

  const scaleMatrix = new THREE.Matrix4().makeScale(
    transform.scale.x,
    transform.scale.y,
    transform.scale.z,
  )

  // Order: Scale, then Rotate, then Translate (TRS)
  // Matrix multiplication is right-to-left: rightmost is applied first
  const combinedMatrix = new THREE.Matrix4()
    .multiplyMatrices(translationMatrix, rotationMatrix)
  combinedMatrix.multiply(scaleMatrix)

  return combinedMatrix
}

export function applyTransform(
  mesh:      THREE.Object3D,
  transform: Transform,
): void {
  mesh.matrix.copy(buildMatrix(transform))
  mesh.matrixAutoUpdate = false
}
```

**`THREE.Matrix4` — first appearance:**
`Matrix4` stores a 4×4 matrix as a flat array of 16 numbers in column-major order
(columns left to right, top to bottom within each column). Three.js uses column-major
ordering to match WebGL's convention.

`.makeTranslation(tx, ty, tz)` constructs the translation matrix derived in step 1.
`.makeScale(sx, sy, sz)` constructs the scale matrix.
`.multiplyMatrices(A, B)` sets `this` to `A × B`.
`.multiply(B)` sets `this` to `this × B`.

**`THREE.Euler` and `THREE.MathUtils.degToRad` — first appearance:**
`THREE.Euler` stores rotation as three angles and an ordering string (`'XYZ'` means
"apply X rotation, then Y, then Z"). Three.js's `Euler` uses radians internally.

`THREE.MathUtils.degToRad(degrees)` converts degrees to radians: `degrees × π / 180`.
The same conversion used in the calculator's built-in functions (lesson 09 of the
calculator project) — angles must be in radians for trigonometry.

`new THREE.Quaternion().setFromEuler(euler)` converts the Euler angles to a
quaternion. Three.js's matrix construction from Euler angles goes through quaternion
to avoid gimbal lock in the intermediate conversion.

**`mesh.matrixAutoUpdate = false`:**
Three.js normally maintains an object's matrix automatically from `mesh.position`,
`mesh.rotation`, and `mesh.scale`. Setting `matrixAutoUpdate = false` tells Three.js
"I will manage this matrix myself; do not overwrite it from position/rotation/scale."
After this, `mesh.matrix.copy(buildMatrix(transform))` is the only way the mesh's
transform is updated.

**TRS order (Translate-Rotate-Scale):**
The standard order for combining transforms in 3D graphics is:
1. Scale first (before rotation, so scaling happens in local space)
2. Rotate second
3. Translate last (in world space, after rotation)

The matrix is computed as `Translation × Rotation × Scale`. Because matrix
multiplication applies right-to-left, Scale is applied first, then Rotation, then
Translation. This is the convention used by every 3D engine: Unity, Unreal, Blender,
OpenCASCADE.

**Walkthrough — `buildMatrix` for translation (3, 0, 0), rotation Y=45°, scale=1:**

```
translationMatrix = makeTranslation(3, 0, 0)
  = [ 1 0 0 3 ]
    [ 0 1 0 0 ]
    [ 0 0 1 0 ]
    [ 0 0 0 1 ]

euler = Euler(0, π/4, 0, 'XYZ')   (45° in radians is π/4)
quaternion = setFromEuler(euler)   (equivalent rotation as quaternion)
rotationMatrix = makeRotationFromQuaternion(quaternion)
  = [ cos(45°)  0  sin(45°)  0 ]     (Y-rotation matrix)
    [    0      1     0      0 ]
    [-sin(45°)  0  cos(45°)  0 ]
    [    0      0     0      1 ]
  ≈ [  0.707  0   0.707  0 ]
    [  0      1   0      0 ]
    [ -0.707  0   0.707  0 ]
    [  0      0   0      1 ]

scaleMatrix = makeScale(1, 1, 1) = identity matrix

combinedMatrix = translationMatrix × rotationMatrix × scaleMatrix
  = translationMatrix × rotationMatrix  (scale is identity, no change)
```

After applying this matrix, a point at the box's local origin `(0,0,1)` ends up
at world position: rotate by 45° → `(0.707, 0, 0.707)`, then translate +3 on X →
`(3.707, 0, 0.707)`. The rotation happens first (in local space), then the translation
moves the result to world space.

---

## Step 4 — Update the Component and Panel

### Update `src/components/ViewportComponent.tsx`

Replace the position `useEffect` with a transform `useEffect`:

```tsx
import { applyTransform } from '../scene/applyTransform.js'
import type { BoxObject }  from '../scene/types.js'
```

**`import { applyTransform } from '../scene/applyTransform.js'`:**
`scene/applyTransform.ts` owns the matrix construction and mesh-application logic
(this lesson). We import `applyTransform` — the function that builds a matrix and
copies it to the mesh — because `ViewportComponent` calls it whenever the box's
transform changes. The component does not need to know what a `Matrix4` is; it
delegates that to `applyTransform`.

```tsx
// Replace the position sync useEffect with:
useEffect(() => {
  const mesh = meshRef.current
  if (mesh === null) return
  applyTransform(mesh, box.transform)
}, [box.transform])
```

**`[box.transform]` as the dependency:**
When `box.transform` changes (any field inside it), this effect re-runs. Because
`BoxObject` is immutable and `setBox` always creates a new object, any change to
any transform field produces a new `box.transform` reference, which triggers the
effect.

This is simpler than listing all individual fields (`translation.x`, `rotation.y`,
etc.) — and correct, because a new `Transform` object reference means something
changed.

### Update `src/components/PropertiesPanel.tsx`

Add rotation and scale sections:

```tsx
import type { BoxObject, Transform } from '../scene/types.js'
```

```typescript
interface PropertiesPanelProps {
  box:         BoxObject
  onBoxChange: (updatedBox: BoxObject) => void
}

type TransformField = 'translation' | 'rotation' | 'scale'
type Axis           = 'x' | 'y' | 'z'
```

**`type` vs `interface` — first appearance:**
`type TransformField = 'translation' | 'rotation' | 'scale'` uses TypeScript's
`type` keyword instead of `interface`. Both create named types, but:
- `interface` describes the shape of an object — it has fields with types.
- `type` is an alias for any type expression — union types, intersection types,
  primitive types, or object shapes.

`type TransformField` is a union of literal strings — not an object shape, so `type`
is appropriate. `interface` would be wrong here.

```tsx
export function PropertiesPanel({ box, onBoxChange }: PropertiesPanelProps): JSX.Element {

  function handleFieldChange(
    section:    TransformField,
    axis:       Axis,
    inputValue: string,
  ): void {
    const parsedValue = parseFloat(inputValue)
    if (isNaN(parsedValue)) return

    onBoxChange({
      ...box,
      transform: {
        ...box.transform,
        [section]: {
          ...box.transform[section],
          [axis]: parsedValue,
        },
      },
    })
  }

  function vectorInputGroup(
    section: TransformField,
    label:   string,
  ): JSX.Element {
    const sectionData = box.transform[section]

    return (
      <>
        <p className="panel-section-title">{label}</p>
        {(['x', 'y', 'z'] as Axis[]).map((axis) => (
          <div key={axis} className="property-row">
            <label className="property-label" htmlFor={`${section}-${axis}`}>
              {axis.toUpperCase()}
            </label>
            <input
              id={`${section}-${axis}`}
              className="property-input"
              type="number"
              value={sectionData[axis]}
              step={section === 'rotation' ? 15 : section === 'scale' ? 0.1 : 1}
              onChange={(e) => handleFieldChange(section, axis, e.target.value)}
            />
          </div>
        ))}
      </>
    )
  }

  return (
    <aside className="properties-panel">
      {vectorInputGroup('translation', 'Position')}
      <div style={{ height: 12 }} />
      {vectorInputGroup('rotation', 'Rotation (°)')}
      <div style={{ height: 12 }} />
      {vectorInputGroup('scale', 'Scale')}
    </aside>
  )
}
```

**`<>` — React fragment — first appearance:**
`<>...</>` is a **React fragment** — a container that groups multiple JSX elements
without adding a DOM element. JSX requires a single root element, but sometimes you
want to return multiple elements without a wrapping `<div>`. A fragment satisfies
the single-root requirement without adding an extra node to the DOM.

**`(['x', 'y', 'z'] as Axis[]).map(...)` — first appearance of `.map` on JSX:**
`Array.map` is JavaScript's transform function for arrays — it calls a function for
each element and returns a new array of the results. In JSX, mapping an array of
data to an array of elements is the React pattern for rendering lists.

`key={axis}` is required by React for every element in a mapped list. React uses
the `key` to identify which element is which when the list changes. Without `key`,
React cannot efficiently update the list and will warn in the console. The key must
be unique within the list — the axis letter (`'x'`, `'y'`, `'z'`) is unique and
stable.

**`step={section === 'rotation' ? 15 : ...}`:**
The `step` attribute on `<input type="number">` controls the increment when using
the up/down arrows (even though we removed the spinner, the keyboard up/down arrows
still use `step`). For rotation: 15° steps. For scale: 0.1 steps. For translation: 1
unit steps. The ternary operator (introduced in the calculator's lesson 09) selects
the correct step value.

**`e.target.value` shorthand:**
`(e) => handleFieldChange(section, axis, e.target.value)` is the same pattern as
lesson 03 but passes both `section` and `axis`. The arrow function closes over
`section` and `axis` from the `map` iteration — each input gets its own specific
handler that knows which field to update.

---

## Debugging: When Transforms Do Not Apply

**Symptom: rotation has no effect — box does not rotate**

`mesh.matrixAutoUpdate` may still be `true`, causing Three.js to overwrite the
matrix each frame with the values from `mesh.rotation`. Verify `applyTransform` sets
`mesh.matrixAutoUpdate = false`. Also verify the mesh is being returned from
`initViewport` into `meshRef.current` — if `meshRef.current` is null, the effect
silently returns without doing anything.

**Symptom: scale makes the box disappear**

A scale value of `0` makes the matrix singular — the box collapses to a point and
Three.js skips rendering it. Add a guard in the scale inputs: if the parsed value
is `0`, return without updating. Alternatively, show a UI warning.

**Symptom: the properties panel inputs do not show the correct initial values**

The `createBox` factory initialises translation to `(0, 0, 0)`, rotation to
`(0, 0, 0)`, and scale to `(1, 1, 1)`. If `box.transform.scale.x` shows `0` or
`undefined`, check that `createBox` returns a `transform` with all three sections.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`buildMatrix(transform): THREE.Matrix4` is the function that converts the
application's data model into the graphics representation. Everywhere in the
remaining lessons where an object needs to be positioned or oriented in 3D space,
this same function (or one built on the same principles) is used.

The `Transform` type will be extended in lesson 14 (sketch on a face) where a
coordinate frame (local origin and axes) must be expressed as a matrix. The conversion
is identical — a rotation matrix with a translation component encodes a full coordinate
frame change. The derivation in this lesson is the foundation.

Lesson 17 (zoom and pan) modifies the camera's matrix — the same 4×4 structure, the
same TRS composition, the same left-to-right multiplication order. The camera is just
another object in the scene graph with a transform.

---

## What Breaks Without This

**Without `matrixAutoUpdate = false`:**
Three.js updates the mesh's matrix automatically from `mesh.position`, `mesh.rotation`,
and `mesh.scale`. If `matrixAutoUpdate` remains `true`, copying to `mesh.matrix`
has no effect — it is overwritten before the next frame. The box appears frozen at
the identity transform regardless of what `buildMatrix` computes.

**Without the TRS order (doing RST instead):**
Scale after rotation produces a **shear** for non-uniform scales. If the box is
rotated 45° and then scaled twice as wide along the X axis, the intended result is
a wide box rotated 45°. But if scale is applied after rotation, the "X axis" in
the scale operation is the world X axis — the box is stretched in world space,
producing a skewed rhombus instead of a rectangle. TRS order (scale in local space
first) is the universal convention for a reason.

**Without `degToRad`:**
`new THREE.Euler(45, 0, 0)` passes 45 to Three.js, which interprets it as radians.
45 radians is approximately 2578° — many full rotations. The box would spin wildly
to a random orientation instead of rotating 45°.

---

## Definition of Done

- [ ] The properties panel shows Translation, Rotation (°), and Scale sections
- [ ] Changing rotation Y rotates the box visibly around the Y axis
- [ ] Changing scale X stretches the box along X
- [ ] Changing scale to 0 on any axis removes the visible box (acceptable edge case)
- [ ] All transforms compose correctly: the box can be rotated and translated simultaneously
- [ ] `buildMatrix` is in `src/scene/applyTransform.ts`, not in the React component
- [ ] You can derive the 4×4 translation matrix from the homogeneous coordinates argument
- [ ] You can explain why matrix multiplication is not commutative and give an example
- [ ] You can explain TRS order and why scale must come first
- [ ] You can explain `matrixAutoUpdate = false` and what happens without it
- [ ] You can explain what `degToRad` does and why it is necessary
- [ ] You can explain React fragments and why `key` is required for mapped lists
- [ ] You can explain `type` vs `interface` in TypeScript and when to use each
- [ ] Run:
      ```
      git add src/
      git commit -m "Add 4x4 transform: buildMatrix composes TRS via matrix multiplication, properties panel exposes rotation and scale, matrixAutoUpdate disabled for manual matrix control"
      ```

---

*Next: Lesson 05 — Raycasting and Selection. Clicking the box selects it and
highlights its edges. A ray is cast from the camera through the click position into
the scene, and the first mesh it intersects is the selected object. The
Möller–Trumbore algorithm explains how ray-triangle intersection works.*
