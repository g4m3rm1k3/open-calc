# CAD/CAM — Lesson 03 — Objects in 3D Space

## What You Will Build

A coloured box appears in the centre of the Three.js viewport. The properties panel
shows three number inputs labelled X, Y, and Z. Typing a new value in any input moves
the box to that position. The box is visible from all camera angles and moves
instantly when the position changes. No dragging, no animation — direct coordinate
input, like a CAD application's coordinate entry field.

## What You Need to Know First

Lessons 01–02. The Three.js viewport and React shell must be running. This lesson
adds to the scene graph (lesson 01) and extends the properties panel (lesson 02) with
interactive inputs.

---

## The Problem

A 3D viewport without objects is a floor with nothing on it. The first object
establishes the patterns for everything that follows: how geometry is represented as
data, how data changes flow from the UI to the scene, and the difference between
where an object is in the world versus where it is in its own local frame.

Every CAD object in this application will follow the same pattern:
1. Geometry data exists in TypeScript as a plain object (the model)
2. A Three.js mesh exists in the scene (the view)
3. React state connects them (when data changes, the mesh updates)

This is the **Model–View separation** — one of the oldest architectural principles
in software. The box's coordinates are not stored in the Three.js mesh. They are
stored in React state. The mesh reflects that state. Separating them means the
coordinates can be serialised, sent to the Python backend (lesson 15), and restored
without touching Three.js at all.

---

## Step 1 — Maths: 3D Vectors and Point Translation

### 3D vectors

A **vector** in 3D space is a triple of numbers: `(x, y, z)`. Vectors are used for
two different purposes, and the difference matters:

- **A point** describes a location: the box is at position `(3, 0, 0)`.
- **A direction** describes a displacement: the box moved `(3, 0, 0)` to the right.

Both use the same notation `(x, y, z)`, but their meaning is different. A point
has no inherent "magnitude." A direction has magnitude (length) and orientation.
Three.js uses `THREE.Vector3` for both — which purpose it serves is determined by
context.

In Three.js:
- X increases to the right
- Y increases upward
- Z increases toward the viewer

This is the standard **right-handed coordinate system** used in mathematics and
physics. CNC machines typically use a different convention (X right, Y away from
the viewer, Z up), which is the same system rotated 90° around X. We use Three.js's
convention for now and handle the CNC convention when generating G-code (lesson 24).

### Point translation

**Translation** is the operation of moving a point by adding a displacement vector:

```
P_new = P_old + displacement
```

Moving a box from position `(0, 0, 0)` to position `(3, 2, -1)`:

```
(0, 0, 0) + (3, 2, -1) = (3, 2, -1)
```

In Three.js, `mesh.position.set(3, 2, -1)` sets the mesh's position to `(3, 2, -1)`
in **world space** — the global coordinate system. The origin `(0, 0, 0)` of world
space is the point where the three axes meet, which is the centre of the grid.

### World space vs local space

**World space** is the global coordinate system. All objects have a position in
world space — where they are relative to the global origin.

**Local space** is an object's own coordinate system. An object's children are
positioned in the parent's local space. If a box is at world position `(5, 0, 0)`,
and a child object is at local position `(1, 0, 0)` relative to the box, the child's
world position is `(6, 0, 0)`.

For this lesson, the box has no children and no parent (other than the scene), so
its local space and world space are identical. The distinction becomes critical in
lesson 04 (transforms) and lesson 12 (feature trees).

---

## Step 2 — The Geometry Data Type

### The problem

Where do the box's dimensions and position live? They should not live in the
Three.js mesh — extracting coordinates from a Three.js object requires calling
`.position.x` on the mesh, which couples the data model to the rendering library.
The box's coordinates should be a plain TypeScript object that can be read and
written without any Three.js knowledge.

### Create `src/scene/types.ts`

Create a new directory `src/scene/` and a file `src/scene/types.ts`:

```typescript
export interface BoxObject {
  readonly id:       string
  position:          Readonly<{ x: number; y: number; z: number }>
  readonly size:     Readonly<{ width: number; height: number; depth: number }>
  readonly colour:   number
}
```

**What `src/scene/` is:**
`scene/` will own all data types and logic for the 3D scene's content — geometry
objects, their properties, and operations on them. It does not know about Three.js.
It does not know about React. It is pure data and pure functions over data.
The Three.js rendering code (in `viewport/`) knows about `scene/` types, but not
vice versa. This one-way dependency means the scene data model can be tested
independently of any graphics library.

**`interface BoxObject` — what each field is:**

`id: string` — a unique identifier for this box. Every object in the scene needs
an identity so it can be found, selected, and modified. In lesson 05 (selection),
raycasting will return a Three.js object — we will use `id` to find the corresponding
data model.

`position: Readonly<{ x, y, z }>` — the box's location in world space. `Readonly`
prevents mutation: to move the box, you create a new `BoxObject` with updated
`position`, rather than setting `box.position.x = 3`. Immutable data is easier to
reason about, easier to serialise, and eliminates a category of bugs where UI
shows stale state because the underlying object was mutated without triggering a
re-render.

`size: Readonly<{ width, height, depth }>` — the box's dimensions. `readonly` on
the field makes the field itself immutable (the reference cannot be replaced);
`Readonly<{...}>` on the object makes the object's properties immutable.

`colour: number` — the hex colour of the box as a number (Three.js uses `0xRRGGBB`
format, e.g., `0x38bdf8` for the accent blue).

### Create `src/scene/createBox.ts`

```typescript
import type { BoxObject } from './types.js'
```

**`import type` — recap from lesson 02:**
`import type` imports only the TypeScript type, producing no runtime JavaScript.
`BoxObject` is only needed for the return type annotation; no runtime value from
`types.ts` is used in this file.

```typescript
let nextBoxId = 0

export function createBox(
  x: number,
  y: number,
  z: number,
): BoxObject {
  const boxId = `box-${nextBoxId}`
  nextBoxId += 1

  return {
    id:       boxId,
    position: { x, y, z },
    size:     { width: 2, height: 2, depth: 2 },
    colour:   0x38bdf8,
  }
}
```

**`let nextBoxId = 0`:**
A module-level counter that increments each time a box is created. This produces
unique IDs: `box-0`, `box-1`, `box-2`, etc. It is not a global — it is module-scoped
(only visible inside this file). Module-scoped state is acceptable for ID generation
because the counter's only job is producing unique identifiers; it carries no
meaningful application state.

**Why `createBox` instead of a `class`:**
`BoxObject` is defined as an interface, not a class. The constructor is a plain
function. This is a **factory function** — a function that creates and returns an
object. Factory functions are preferred over `new ClassName()` when:
1. You need to pre-process arguments before construction
2. The created object's type is an interface (not a class instance)
3. You want to avoid inheritance hierarchies

Here, the factory function generates the `id` automatically and provides default
dimensions. The caller only needs to provide the position.

---

## Step 3 — React State

### The problem

The box's position must be stored somewhere that:
1. React can read to render the properties panel
2. React can write to when the user changes a coordinate
3. Three.js can read to position the mesh

React **state** is the answer. When React state changes, React re-renders the
components that depend on it, and the `useEffect` that manages the Three.js mesh
updates the mesh's position.

### The `useState` hook

Add to `src/components/PropertiesPanel.tsx`:

```tsx
import { useState }      from 'react'
import { BoxObject }     from '../scene/types.js'
import { createBox }     from '../scene/createBox.js'
```

**`import { useState } from 'react'`:**
`useState` is a React hook — the mechanism for giving a function component its own
mutable state. It is imported from `react` (same package as `useEffect` and `useRef`
from lesson 02).

```tsx
const [box, setBox] = useState<BoxObject>(() => createBox(0, 0, 0))
```

**`useState<T>(initialValue)` — first appearance:**
`useState` returns a pair: the current state value and a function to update it.
Array destructuring (`const [value, setValue] = useState(...)`) gives them names.

`useState<BoxObject>(() => createBox(0, 0, 0))` creates a box at the origin as the
initial state. The initial value is wrapped in an arrow function (called a **lazy
initialiser**) — `useState(() => createBox(...))` instead of `useState(createBox(...))`.
This matters because `useState(createBox(0,0,0))` calls `createBox` on every render,
while `useState(() => createBox(0,0,0))` calls it only once. For an expensive or
side-effectful initialiser, the lazy form is required. It is good practice to always
use the lazy form when the initial value requires a function call.

**`setBox(newBox)`:**
Calling `setBox` with a new `BoxObject` triggers a React re-render of every component
that uses `box`. The old `box` is not modified — `setBox` replaces the state with the
new value. This is why immutability in the `BoxObject` type is correct: the whole
object is replaced, never mutated.

### Pass state to components

The `PropertiesPanel` needs `box` and `setBox`. `ViewportComponent` needs `box` to
position the mesh. Both are children of `App`. The state must live in `App` and be
passed down as **props**.

**Props — first appearance:**
Props (short for **properties**) are the mechanism for passing data from a parent
component to a child component. A parent renders `<Child value={someData} />` and
the child receives `value` as a function parameter.

Update `src/App.tsx`:

```tsx
import { useState }          from 'react'
import { BoxObject }         from './scene/types.js'
import { createBox }         from './scene/createBox.js'
import { Toolbar }           from './components/Toolbar.js'
import { ToolPanel }         from './components/ToolPanel.js'
import { PropertiesPanel }   from './components/PropertiesPanel.js'
import { StatusBar }         from './components/StatusBar.js'
import { ViewportComponent } from './components/ViewportComponent.js'
```

**Import explanation:**
`import { useState } from 'react'` — `useState` is now needed in `App` because the
box state lives here (shared between `ViewportComponent` and `PropertiesPanel`).

`import { BoxObject } from './scene/types.js'` — `scene/types.ts` owns the geometry
data types. We import `BoxObject` as the type for the `useState` generic parameter
and the prop types of child components.

`import { createBox } from './scene/createBox.js'` — `scene/createBox.ts` owns the
box factory. We import `createBox` for the lazy initialiser in `useState`.

```tsx
export function App(): JSX.Element {
  const [box, setBox] = useState<BoxObject>(() => createBox(0, 0, 0))

  return (
    <div className="app-shell">
      <Toolbar />
      <ToolPanel />
      <ViewportComponent box={box} />
      <PropertiesPanel box={box} onBoxChange={setBox} />
      <StatusBar />
    </div>
  )
}
```

**`box={box}` and `onBoxChange={setBox}`:**
These are props. `box={box}` passes the current `BoxObject` to each child.
`onBoxChange={setBox}` passes the setter function to `PropertiesPanel` so it can
trigger state updates. Passing a setter as a prop is the React pattern for
**child-to-parent communication**: the child calls the function its parent gave it,
and the parent's state updates, which re-renders both.

---

## Step 4 — The Three.js Mesh

### The problem

`ViewportComponent` receives the `box` prop. When `box.position` changes, the Three.js
mesh at `mesh.position` must be updated to match. A `useEffect` that runs when `box`
changes handles this.

### Update `src/components/ViewportComponent.tsx`

Add prop types:

```tsx
import { useRef, useEffect } from 'react'
import * as THREE            from 'three'
import { initViewport }      from '../viewport/viewport.js'
import type { ViewportInstance } from '../viewport/viewport.js'
import type { BoxObject }    from '../scene/types.js'
```

**`import * as THREE from 'three'`:**
`three` is the Three.js library (lesson 01). We import it here because
`ViewportComponent` now creates a `THREE.Mesh` — a Three.js object — directly.
Lesson 01's Three.js objects lived in `viewport.ts`; this lesson adds object
creation to the component.

**`import type { BoxObject } from '../scene/types.js'`:**
`BoxObject` is needed for the prop type. `import type` because only the type is
needed, not any runtime value.

Define prop types:

```typescript
interface ViewportComponentProps {
  box: BoxObject
}
```

**TypeScript interface for props — first appearance:**
React component props are typed by defining an interface and using it as the
parameter type. `interface ViewportComponentProps` describes the shape of the
object that `App` passes to `ViewportComponent`. TypeScript checks that `App`
passes all required props with the correct types.

Update the component function:

```tsx
export function ViewportComponent({ box }: ViewportComponentProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef  = useRef<ViewportInstance | null>(null)
  const meshRef      = useRef<THREE.Mesh | null>(null)

  // Initialise Three.js once on mount
  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const viewport = initViewport(container)
    viewportRef.current = viewport

    // Create the box mesh
    const geometry = new THREE.BoxGeometry(
      2,   // width
      2,   // height
      2,   // depth
    )
    const material = new THREE.MeshStandardMaterial({ color: box.colour })
    const mesh     = new THREE.Mesh(geometry, material)
    meshRef.current = mesh
    viewport.scene.add(mesh)

    // Add a point light so the box is visible
    const light = new THREE.PointLight(0xffffff, 50, 100)
    light.position.set(5, 10, 5)
    viewport.scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    viewport.scene.add(ambientLight)

    viewport.animate()

    return () => {
      geometry.dispose()
      material.dispose()
      viewport.dispose()
    }
  }, [])  // Empty: run only once

  // Sync mesh position when box prop changes
  useEffect(() => {
    const mesh = meshRef.current
    if (mesh === null) return
    mesh.position.set(box.position.x, box.position.y, box.position.z)
  }, [box.position.x, box.position.y, box.position.z])

  return <div className="viewport-wrapper" ref={containerRef} />
}
```

**`{ box }: ViewportComponentProps` — destructuring props:**
The parameter `{ box }` destructures the props object — instead of `props.box`,
the variable `box` is directly available. This is idiomatic React.

**`THREE.BoxGeometry(width, height, depth)` — first appearance:**
`BoxGeometry` creates the vertex data for a rectangular box. The arguments are the
dimensions in world units. `new THREE.BoxGeometry(2, 2, 2)` creates a 2×2×2 cube.

Three.js geometry stores vertex positions, normals, and UV coordinates in **GPU
buffers** — arrays of numbers sent to the video card. `geometry.dispose()` in the
cleanup frees this GPU memory. All Three.js geometry and material objects must be
disposed when no longer needed.

**`THREE.MeshStandardMaterial` — first appearance:**
A material describes how a surface looks under lighting. `MeshStandardMaterial`
uses physically-based rendering (PBR) — it simulates how real materials interact
with light. The `color` property sets the base colour.

Other material types: `MeshBasicMaterial` ignores lighting (always full colour,
used for wireframes), `MeshPhongMaterial` uses an older non-PBR lighting model.
`MeshStandardMaterial` is correct for geometry that should look realistic under
the scene's lights.

**`THREE.Mesh(geometry, material)` — first appearance:**
A mesh combines a geometry (the shape) and a material (the appearance). This is
the fundamental Three.js renderable unit. Every visible object in a Three.js scene
is a mesh (or a collection of meshes).

**`THREE.PointLight` and `THREE.AmbientLight` — first appearance:**
Without lights, `MeshStandardMaterial` renders objects as black — physically-based
shading requires light sources.

`new THREE.PointLight(colour, intensity, distance)` creates a light that radiates
in all directions from a single point — like a bare light bulb. `intensity: 50`
controls brightness. `distance: 100` is the maximum range.

`new THREE.AmbientLight(colour, intensity)` adds a uniform fill light that reaches
every surface equally regardless of angle. `intensity: 0.2` gives a subtle fill
that prevents the unlit faces of the box from appearing completely black.

**The second `useEffect` — synchronising box position:**
```tsx
useEffect(() => {
  const mesh = meshRef.current
  if (mesh === null) return
  mesh.position.set(box.position.x, box.position.y, box.position.z)
}, [box.position.x, box.position.y, box.position.z])
```

The dependencies array `[box.position.x, box.position.y, box.position.z]` tells
React to run this effect whenever any of the three coordinates change. When `App`'s
`setBox` is called with a new position, React re-renders `ViewportComponent` with
the new `box` prop. The coordinates in the dependencies array have new values, so
this effect runs and calls `mesh.position.set(...)`, updating the Three.js mesh.

**Why two separate `useEffect` calls:**
The first effect (empty `[]`) runs once to initialise Three.js — creating geometry,
adding lights, starting the animation loop. The second effect runs every time the
box position changes. Combining them would reinitialise Three.js on every position
change, which is expensive and wrong. Separating them gives each effect the correct
dependency set.

### Walkthrough — user changes X to 3

```
1. User types '3' in the X input (PropertiesPanel)
2. PropertiesPanel calls onBoxChange({ ...box, position: { x: 3, y: 0, z: 0 } })
3. App's setBox is called with the new BoxObject
4. App re-renders with new box state
5. App passes new box prop to ViewportComponent
6. React detects box.position.x changed from 0 to 3
7. ViewportComponent's second useEffect runs
8. mesh.position.set(3, 0, 0) is called
9. Next animation frame: renderer draws the mesh at (3, 0, 0)
10. User sees the box moved to the right
```

**CS lens — reactive data flow:**
The data flows in one direction: state (in `App`) → props (to children) → Three.js
mesh. Nothing flows backward except through explicit event handlers (`onBoxChange`).
This unidirectional flow is the same principle as the reducer pattern from lesson 03
of the calculator project — state flows down, events flow up, the system is
predictable.

---

## Step 5 — The Properties Panel with Inputs

### Update `src/components/PropertiesPanel.tsx`

```tsx
import type { BoxObject } from '../scene/types.js'
```

**`import type { BoxObject } from '../scene/types.js'`:**
`scene/types.ts` owns the geometry data types. `BoxObject` is needed here to type
the incoming prop and the argument to `onBoxChange`.

```typescript
interface PropertiesPanelProps {
  box:          BoxObject
  onBoxChange:  (updatedBox: BoxObject) => void
}
```

**`(updatedBox: BoxObject) => void` — function type:**
`onBoxChange` is a function that accepts a `BoxObject` and returns nothing (`void`).
In TypeScript, `void` as a return type means the function's return value is not used
by the caller — the convention for event handlers and callbacks.

```tsx
export function PropertiesPanel({
  box,
  onBoxChange,
}: PropertiesPanelProps): JSX.Element {

  function handleCoordinateChange(
    axis:        'x' | 'y' | 'z',
    inputValue:  string,
  ): void {
    const parsedValue = parseFloat(inputValue)
    if (isNaN(parsedValue)) return

    onBoxChange({
      ...box,
      position: {
        ...box.position,
        [axis]: parsedValue,
      },
    })
  }

  return (
    <aside className="properties-panel">
      <p className="panel-section-title">Position</p>

      <div className="property-row">
        <label className="property-label" htmlFor="pos-x">X</label>
        <input
          id="pos-x"
          className="property-input"
          type="number"
          value={box.position.x}
          step={1}
          onChange={(event) => handleCoordinateChange('x', event.target.value)}
        />
      </div>

      <div className="property-row">
        <label className="property-label" htmlFor="pos-y">Y</label>
        <input
          id="pos-y"
          className="property-input"
          type="number"
          value={box.position.y}
          step={1}
          onChange={(event) => handleCoordinateChange('y', event.target.value)}
        />
      </div>

      <div className="property-row">
        <label className="property-label" htmlFor="pos-z">Z</label>
        <input
          id="pos-z"
          className="property-input"
          type="number"
          value={box.position.z}
          step={1}
          onChange={(event) => handleCoordinateChange('z', event.target.value)}
        />
      </div>
    </aside>
  )
}
```

**Controlled inputs — first appearance:**
`value={box.position.x}` makes this a **controlled input** — React owns the displayed
value. The input always shows the current state. When the user types, `onChange`
fires, `handleCoordinateChange` calls `onBoxChange`, React state updates, the
component re-renders, and the input shows the new value.

Without `value={...}`, the input is **uncontrolled** — the browser owns the value
and React does not know what it is. Uncontrolled inputs are suitable for simple forms
where you only read the value on submit. For a live coordinate display that must
always reflect the box's current position (including programmatic changes), controlled
inputs are required.

**`htmlFor` instead of `for`:**
`<label htmlFor="pos-x">` links the label to the input with `id="pos-x"`. Clicking
the label focuses the input — this is correct accessibility behaviour. JSX uses
`htmlFor` because `for` is a reserved keyword in JavaScript (the `for` loop).

**`event.target.value`:**
When an `<input>` element fires the `change` event, the event object contains
`target` — the element that fired the event. `event.target.value` is the current
string value of the input field. `parseFloat` converts it to a number.

**`[axis]: parsedValue` in the position update:**
`{ ...box.position, [axis]: parsedValue }` uses a computed property key (introduced
in the calculator's lesson 08 for variables). `axis` is `'x'`, `'y'`, or `'z'`.
`[axis]: parsedValue` creates a property whose name is the value of `axis`. This
lets one function handle all three axes without three separate branches.

**`'x' | 'y' | 'z'` as a type:**
The parameter `axis: 'x' | 'y' | 'z'` is a union of string literals — one of exactly
three values. TypeScript rejects `handleCoordinateChange('w', ...)`. This prevents
a whole class of bugs from typos in axis names.

### Add CSS for the property rows

Add to `src/style.css`:

```css
/* ── Property inputs ────────────────────────────────────────────────────────── */

.property-row {
  display:         flex;
  align-items:     center;
  gap:             8px;
  margin-bottom:   6px;
}

.property-label {
  font-size:   var(--font-size-label);
  color:       var(--colour-text-muted);
  width:       16px;
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.property-input {
  flex:             1;
  background-color: var(--colour-background);
  border:           1px solid var(--colour-border);
  border-radius:    4px;
  color:            var(--colour-text);
  font-family:      var(--font-mono);
  font-size:        var(--font-size-label);
  padding:          4px 6px;
  outline:          none;
}

.property-input:focus {
  border-color: var(--colour-accent);
}

/* Remove the browser's default number input spinners */
.property-input[type="number"]::-webkit-inner-spin-button,
.property-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
.property-input[type="number"] {
  -moz-appearance: textfield;
  appearance:      textfield;
}
```

**`:focus` pseudo-class:**
`:focus` matches an element when it is focused — when the user clicks it or tabs
to it. `border-color: var(--colour-accent)` highlights the focused input in accent
blue, providing a clear visual indicator of which field is active. This is a basic
accessibility requirement: sighted users navigating by keyboard must always be able
to see which element is focused.

**Removing number input spinners:**
Browsers render up/down arrows (spinners) on `<input type="number">`. In a CAD
application, direct text entry is preferred over clicking spinners. The
`-webkit-appearance: none` rule removes them in Webkit browsers (Chrome, Safari).
`-moz-appearance: textfield` removes them in Firefox.

---

## Step 6 — Run It

```
npm run dev
```

Open `http://localhost:5174`. You should see:
- A solid sky-blue box in the centre of the viewport (`0x38bdf8` — the accent colour)
- The properties panel shows three number inputs: X: 0, Y: 0, Z: 0
- Changing X to `3` moves the box to the right
- Changing Y to `2` lifts the box above the grid
- Changing Z to `-3` moves the box away from the viewer (into the screen)
- The viewport continues to orbit, pan, and zoom

**Why Y moves the box up:**
Three.js's Y axis is vertical. The box starts at Y=0, sitting half inside and half
above the grid (the geometry is 2 units tall, centred at Y=0, so it extends from
Y=-1 to Y=1). Setting Y=1 lifts it so its bottom face sits exactly on the grid.

---

## Debugging: When the Box Is Invisible

**Symptom: viewport renders but box is not visible**

Likely cause: no lights. `MeshStandardMaterial` requires lights. Verify the
`PointLight` and `AmbientLight` are created and added to the scene inside the
`useEffect`. Check the Elements tab in DevTools — the canvas should exist. Then
check the console for Three.js warnings about missing normals or invalid geometry.

**Symptom: box appears but does not move when coordinates are changed**

The second `useEffect` is not running. Check its dependencies array:
`[box.position.x, box.position.y, box.position.z]`. If the array is empty (`[]`),
the effect only runs once and never re-runs. If the array contains `box` (the whole
object) instead of the individual coordinates, it may not detect changes correctly
(if the object reference changes but the coordinates do not).

Add a temporary log to confirm the effect runs:
```tsx
useEffect(() => {
  console.log('position changed to', box.position)
  const mesh = meshRef.current
  if (mesh === null) return
  mesh.position.set(box.position.x, box.position.y, box.position.z)
}, [box.position.x, box.position.y, box.position.z])
```

**Symptom: typing a coordinate updates the input but the box does not move**

`handleCoordinateChange` is calling `parseFloat` but the input value is empty or
non-numeric. Verify `isNaN(parsedValue)` returns false for valid inputs. The early
return `if (isNaN(parsedValue)) return` prevents the update — this is correct
behaviour (do not move the box on invalid input), but also means the box will not
move while typing (e.g., typing `-3` passes through `-`, which parses as `NaN`).
This is acceptable for now; lesson 09 (snapping) introduces proper input handling.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`BoxObject` in `scene/types.ts` is the first geometry data type. As the project grows,
`scene/types.ts` will define many more: `Line`, `Circle`, `Arc`, `Solid`. All will
follow the same pattern: plain TypeScript objects with `id`, immutable geometry data,
and no Three.js types.

The `meshRef` pattern — storing a Three.js object in a ref and updating it via
`useEffect` — will appear for every geometry type. When lesson 12 adds extruded
solids, they will use the same pattern: a `useEffect` that creates the Three.js
mesh on mount and updates it when geometry data changes.

The one-way data flow (`state → props → Three.js`) established here scales to the
full application. In lesson 05 (selection), clicking the box produces an event that
flows back up to `App` via a callback, updating a `selectedId` state variable.
Components that depend on `selectedId` re-render. Three.js updates the highlight mesh.
The pattern is the same; the events and states are new.

---

## What Breaks Without This

**Without the second `useEffect` for position sync:**
The box initialises at `(0, 0, 0)` and never moves, regardless of what the user
types. The properties panel updates (the input value changes), React state updates,
`ViewportComponent` re-renders with the new `box` prop, but the Three.js mesh is
never told to move. The model (React state) and the view (Three.js mesh) are out of
sync. This is the bug that the Model–View separation is designed to prevent — and the
`useEffect` sync is the mechanism that prevents it.

**Without `geometry.dispose()` in the cleanup:**
Every time the component mounts, a new `BoxGeometry` is created and its vertex data
is uploaded to the GPU. If the component mounts and unmounts many times (navigating
away and back), GPU memory accumulates. Over time the application slows and eventually
crashes with an out-of-memory error. On most computers this takes hundreds of cycles
to become noticeable, which is why dispose bugs are often missed in development and
only appear in long-running production use.

**Without `isNaN(parsedValue) return` guard:**
If the user clears the input (value is `''`), `parseFloat('')` returns `NaN`.
`onBoxChange` is called with a `BoxObject` whose position contains `NaN`.
`mesh.position.set(NaN, 0, 0)` causes Three.js to render the mesh at an undefined
position — it disappears from the viewport. The user is confused and has no obvious
way to get the box back. The guard prevents NaN from entering the state.

---

## Definition of Done

- [ ] A coloured box appears in the viewport at `(0, 0, 0)`
- [ ] The properties panel shows three number inputs for X, Y, Z
- [ ] Changing X moves the box left/right; Y moves it up/down; Z moves it forward/back
- [ ] The box stays lit (visible highlights and shadows from the point light)
- [ ] Clearing an input does not make the box disappear or produce an error
- [ ] You can explain what a 3D vector is and the difference between using it as a
      point vs a direction
- [ ] You can explain world space vs local space and when they differ
- [ ] You can explain `useState` — what it returns, what happens when the setter is called
- [ ] You can explain controlled inputs — what makes them "controlled" and why that
      matters here
- [ ] You can explain the two separate `useEffect` calls — why they have different
      dependency arrays
- [ ] You can explain `MeshStandardMaterial` vs `MeshBasicMaterial` and when to use each
- [ ] You can explain why `geometry.dispose()` is required
- [ ] You can explain `'x' | 'y' | 'z'` as a TypeScript type
- [ ] You can trace the full path of a coordinate change: input → handler →
      `onBoxChange` → React state → prop → `useEffect` → Three.js
- [ ] Run:
      ```
      git add src/
      git commit -m "Add box object with coordinate input: scene types separate from Three.js, two-effect sync pattern keeps React state and Three.js mesh consistent"
      ```

---

*Next: Lesson 04 — 4×4 Transforms. The box is translated, rotated, and scaled by
applying transformation matrices. The matrix stack is explained. Why a 4th dimension
is needed to encode translation is derived from first principles.*
