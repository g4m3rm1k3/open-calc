# Junior to Senior — T8·L4 — Drei Helpers

**Prerequisites:** T8·L3 (Geometry, Materials, Lights). You can build 3D scenes.
This lesson explains HOW each Drei helper works internally, not just what it does —
specifically how `OrbitControls` updates the camera each frame, how `Html` stays
anchored to a 3D position, and why `<Line>` supports `lineWidth > 1` when raw Three.js lines don't.

**What this lab adds:**
- How `OrbitControls` intercepts mouse events and updates the camera per frame
- How `<Html>` projects a 3D position to 2D screen coordinates each frame
- Why `<Line>` uses `THREE.Line2` instead of `THREE.Line` — and what that means
- How `GizmoHelper` provides camera control by clicking its axes
- Building the CAD viewport step by step with each helper verified individually

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `<OrbitControls>` uses `useFrame` internally. When the user is NOT touching the
>    mouse, does `useFrame` still run? Does the camera position change?
> 2. `<Html position={[5, 2, 0]}>` — the camera orbits around the scene. Does the
>    HTML element stay anchored to the 3D point `(5, 2, 0)` as the camera moves?
>    How?
> 3. `<line>` (built-in Three.js Line) only supports `lineWidth: 1` on WebGL. `<Line>`
>    (Drei) supports any width. What is the implementation difference?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Build the Base Scene

```bash
npm install @react-three/drei
```

Create `src/App.tsx` from scratch for this lesson:

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber';

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e1e2e' }}>
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <Box />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** A blue box. You CANNOT move the camera yet. Try dragging the mouse —
nothing happens. The camera is fixed.

This is the problem OrbitControls solves.

---

### Concept: How `OrbitControls` Works

**What it is:** `OrbitControls` from Drei wraps Three.js's `OrbitControls` class.
It registers mouse event listeners on the canvas element and uses `useFrame` to apply
the resulting camera movement each frame.

**The mechanism — what OrbitControls does internally:**

```
1. On mount: adds event listeners to the canvas
   canvas.addEventListener('mousedown', onMouseDown)
   canvas.addEventListener('mousemove', onMouseMove)
   canvas.addEventListener('wheel',     onWheel)

2. Every frame (useFrame):
   if (controls.enabled && controls.needsUpdate) {
     controls.update()  // computes new camera position from mouse delta
   }
   // camera.position and camera.quaternion are now updated

3. On unmount: removes all event listeners
```

**Why it uses `useFrame`:** The camera position is updated by calling `controls.update()`
each frame. This is why `OrbitControls` must live inside `<Canvas>` — it uses `useFrame`,
which requires the R3F context.

**The `enableDamping` option:** When enabled, the camera continues to move after you
release the mouse, decelerating gradually. This is implemented by storing the previous
rotation velocity and applying a decay factor each frame in `controls.update()`.

---

## Step 2 — Add OrbitControls

Add to `App.tsx` inside `<Canvas>`:

```tsx
import { OrbitControls } from '@react-three/drei';

// Inside Canvas:
<OrbitControls
  enableDamping              // smooth deceleration after mouse release
  dampingFactor={0.05}       // how quickly the damping decays
  maxPolarAngle={Math.PI/2}  // prevent camera from going below the floor
/>
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** Drag with the left mouse button to orbit. Right-click to pan.
Scroll to zoom.

**In DevTools Performance tab, record while NOT moving the mouse:**

Expected: The animation loop still runs (OrbitControls calls `useFrame` every frame),
but the camera position stays the same when `dampingFactor` has settled to zero.
This is a slight overhead of OrbitControls even when idle.

**Change something:** Try `maxPolarAngle={Math.PI}` (allow going below the floor).
Expected: you can rotate the camera all the way under the scene. Change back to `Math.PI/2`.

---

## Step 3 — Add the Grid

```tsx
import { Grid, OrbitControls } from '@react-three/drei';

// Inside Canvas:
<Grid
  infiniteGrid         // extends the grid to the horizon
  cellSize={0.5}       // small cell spacing
  sectionSize={2}      // major grid line spacing
  cellColor="#2a2a3a"
  sectionColor="#444"
  fadeDistance={30}    // grid fades at this distance
/>
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** A dark grid extending to the horizon. The box sits on top of it.

**Change something:** Change `cellSize` to `2.0`. Expected: larger, coarser grid cells.
Try `sectionSize={10}`. The relationship between `cellSize` (small lines) and `sectionSize`
(major lines) gives the two-level grid appearance typical of CAD tools.

---

### Concept: How `<Html>` Stays Anchored to 3D Space

**What it is:** `<Html>` from Drei renders a React tree inside a `div` that is
positioned OVER the WebGL canvas. The position of the div is updated every frame to
match the projected 3D position.

**The mechanism — per-frame projection:**

```
Every frame (useFrame):
  1. Get the 3D anchor position in world space: (5, 2, 0)
  2. Transform to clip space: clipPos = projectionMatrix * viewMatrix * vec4(5, 2, 0, 1)
  3. Perspective divide: ndcX = clipX / clipW, ndcY = clipY / clipW
  4. Convert to screen pixels:
       screenX = (ndcX + 1) / 2 * canvas.width
       screenY = (1 - ndcY) / 2 * canvas.height
  5. Update the div's CSS: div.style.transform = `translate(${screenX}px, ${screenY}px)`
```

This is the full coordinate pipeline from T7-L4 running every frame to keep the HTML positioned.

**Why this matters for the CAD viewport:** Dimension annotations, measurement labels,
and tool descriptions need to stay anchored to specific 3D positions as the user orbits.
`<Html>` provides this automatically.

---

## Step 4 — Add Axis Labels With `<Html>`

```tsx
import { Grid, OrbitControls, Html, Line } from '@react-three/drei';

function AxisArrows() {
  return (
    <>
      {/* X axis — red */}
      <Line points={[[0,0,0],[5,0,0]]} color="red" lineWidth={3} />
      <Html position={[5.3, 0, 0]} center>
        <span style={{ color: 'red', fontSize: 14, fontWeight: 'bold', pointerEvents: 'none' }}>
          X
        </span>
      </Html>

      {/* Y axis — green */}
      <Line points={[[0,0,0],[0,5,0]]} color="green" lineWidth={3} />
      <Html position={[0, 5.3, 0]} center>
        <span style={{ color: 'green', fontSize: 14, fontWeight: 'bold', pointerEvents: 'none' }}>
          Y
        </span>
      </Html>

      {/* Z axis — blue */}
      <Line points={[[0,0,0],[0,0,5]]} color="royalblue" lineWidth={3} />
      <Html position={[0, 0, 5.3]} center>
        <span style={{ color: 'royalblue', fontSize: 14, fontWeight: 'bold', pointerEvents: 'none' }}>
          Z
        </span>
      </Html>
    </>
  );
}
```

### SAVE AND TRY

Add `<AxisArrows />` inside `<Canvas>`.

```bash
npm run dev
```

**You should see:** Three axis lines with X, Y, Z labels that stay anchored to the
ends of the lines as you orbit.

**Change something:** Remove `center` from one `<Html>`. Expected: the label no longer
centres on its anchor point — it anchors at the top-left corner of the HTML element.
Add `center` back.

**Verify the 3D position tracking works:** Orbit the camera widely. Expected: the labels
stay attached to the axes — they project correctly regardless of camera angle.

---

### Concept: Why `<Line>` from Drei Supports Width > 1

**The problem with `<line>` (native Three.js):**

WebGL's native line rendering (`gl.LINES`) only supports 1 pixel width. Requesting
`lineWidth > 1` is silently ignored on most browsers and GPUs (it's not part of the
WebGL spec).

**How Drei's `<Line>` solves it:**

Drei's `<Line>` uses `THREE.Line2` from Three.js's examples, which renders lines
as TRIANGLES rather than WebGL lines. Each line segment is converted to a thin
rectangle (two triangles) with the specified width. This works on all browsers
because triangles work everywhere.

The cost: slightly more geometry (2 triangles per line segment instead of 1 line).
The benefit: consistent line width on all platforms.

```tsx
// Native Three.js — width ignored on most browsers:
<line>
  <lineBasicMaterial linewidth={5} />   // ← does nothing on WebGL
</line>

// Drei Line — works everywhere:
<Line lineWidth={5} />   // ← rendered as triangles, works everywhere
```

---

## Step 5 — Add the GizmoHelper

```tsx
import { GizmoHelper, GizmoViewport } from '@react-three/drei';

// Inside Canvas, outside other components:
<GizmoHelper
  alignment="bottom-right"   // corner of the viewport
  margin={[80, 80]}          // distance from the edge in pixels
>
  <GizmoViewport
    axisColors={['red', 'green', 'royalblue']}
    labelColor="white"
  />
</GizmoHelper>
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** An orientation cube in the bottom-right corner showing X, Y, Z axes.
Click on the X axis label in the gizmo. Expected: the camera animates to the front/right
view looking along the X axis.

**Change something:** Move `alignment` to `"top-left"`. Expected: the gizmo moves to
the top-left corner of the viewport. Change back to `"bottom-right"`.

---

## 🎯 Challenge: Build a Dimension Annotation

**You know:** `<Line>`, `<Html>`, 3D positions.

**The mechanism:**

A dimension annotation consists of:
1. Extension lines: vertical lines from the measured edge up to the dimension line
2. Dimension line: horizontal line at a height above the geometry
3. Measurement text: `<Html>` anchored to the midpoint of the dimension line

**Task:** Build `<Dimension start={[0,0,0]} end={[4,0,0]} offset={0.5}>` that draws
a dimension annotation showing the distance `4.00` between the two points.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { Line, Html } from '@react-three/drei';
import * as THREE      from 'three';

export function Dimension({
  start:  [sx, sy, sz],
  end:    [ex, ey, ez],
  offset = 0.5,
  color  = 'white',
}: {
  start:  [number, number, number];
  end:    [number, number, number];
  offset?: number;
  color?:  string;
}) {
  const midX = (sx + ex) / 2;
  const midY = sy + offset;   // dimension line above the geometry

  const length = Math.sqrt((ex-sx)**2 + (ey-sy)**2 + (ez-sz)**2);

  return (
    <>
      {/* Left extension line */}
      <Line points={[[sx, sy, sz], [sx, sy + offset, sz]]} color={color} lineWidth={1} />
      {/* Right extension line */}
      <Line points={[[ex, ey, ez], [ex, ey + offset, ez]]} color={color} lineWidth={1} />
      {/* Dimension line */}
      <Line
        points={[[sx, sy + offset, sz], [ex, ey + offset, ez]]}
        color={color} lineWidth={1}
      />
      {/* Measurement label */}
      <Html position={[midX, midY + 0.1, sz]} center style={{ pointerEvents: 'none' }}>
        <span style={{ color, fontSize: 11, background: 'rgba(0,0,0,0.8)', padding: '1px 4px', borderRadius: 2 }}>
          {length.toFixed(2)}
        </span>
      </Html>
    </>
  );
}
```

**Usage:**
```tsx
<Dimension start={[0, 0, 0]} end={[4, 0, 0]} />
// Shows a horizontal dimension annotation showing "4.00"
```

**Key insight:** The offset parameter controls how far above the geometry the dimension
line floats. In CAD tools, this is called the "gap" between the geometry and the dimension
line. The extension lines bridge the gap.

</details>

---

## Final Check

| Component | How it works internally |
|---|---|
| `OrbitControls` | Mouse event listeners + `useFrame` calling `controls.update()` |
| `Grid` | Procedural geometry rendered behind other objects |
| `<Line>` | Triangles (THREE.Line2), not WebGL lines |
| `<Html>` | CSS transform updated every frame via coordinate projection |
| `GizmoHelper` | Separate mini camera + scene for the corner overlay |

---

## Quick Check Answers

**1. `OrbitControls` — when NOT touching mouse, does `useFrame` still run?**

Yes. `useFrame` runs every frame regardless of user input. `controls.update()` is called
every frame, but it does nothing if no input was received (damping has settled). The overhead
is minimal (a few math operations per frame), but it is non-zero. For performance-critical
applications with many controls, you can set `regress` prop to tell R3F to lower quality
when interacting, restoring it when idle.

**2. `<Html position={[5,2,0]}>` — does it stay anchored as the camera moves? How?**

Yes. Every frame, R3F projects the 3D anchor position `(5, 2, 0)` through the current
view and projection matrices to get screen coordinates. The HTML element's CSS
`transform` is updated to those screen coordinates. Since this runs every frame, the
HTML stays attached to the 3D point regardless of how the camera moves.

**3. `<Line>` from Drei vs native `<line>` — implementation difference?**

Drei's `<Line>` uses `THREE.Line2`, which renders line segments as pairs of triangles
(geometry-based lines). Each segment gets extruded into a thin rectangular strip in the
vertex shader, using the viewport size to maintain consistent pixel width. Native Three.js
`<line>` uses WebGL's `gl.LINES` primitive, which has a spec-mandated maximum width of 1
pixel on most platforms (the spec says implementations may ignore larger values).
