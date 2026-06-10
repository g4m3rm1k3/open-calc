# Junior to Senior — T8·L4 — Drei Helpers

**Prerequisites:** T8·L3 (Geometry, Materials, Lights). You can build 3D scenes.
This lesson covers Drei — the companion library that provides pre-built components
for the most common 3D UI patterns.

**What this lab adds:**
- `<OrbitControls>` — mouse orbit, pan, zoom
- `<Grid>` — the reference ground plane
- `<Line points={...}>` — drawing lines through 3D points
- `<Html>` — React/HTML inside the 3D scene
- `<GizmoHelper>` — the orientation cube overlay

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What does "orbit" mean in the context of `OrbitControls`?
> 2. `<Html>` renders React elements inside the 3D scene. How does it stay
>    anchored to a 3D position as the camera moves?
> 3. The `<GizmoHelper>` shows X, Y, Z axes. When you click the X label,
>    what should happen to the camera?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A CAD-ready viewport with essential navigation controls:

```tsx
<Canvas>
  <OrbitControls enableDamping />
  <Grid infiniteGrid fadeDistance={50} />
  <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
    <GizmoViewport />
  </GizmoHelper>
  <Line points={[[0,0,0], [5,0,0]]} color="red" lineWidth={2} />
  <Html position={[5.2, 0, 0]}>
    <span style={{ color: 'red', fontSize: 12 }}>X</span>
  </Html>
</Canvas>
```

---

### Concept: `OrbitControls`

**What it is:** Camera controller for rotating, panning, and zooming around a target.

```tsx
import { OrbitControls } from '@react-three/drei';

<OrbitControls
  enableDamping          // smooth deceleration after mouse release
  dampingFactor={0.05}   // damping strength
  enablePan              // right-click or two-finger pan
  enableZoom             // scroll zoom
  maxDistance={100}      // zoom limit (far)
  minDistance={0.5}      // zoom limit (near)
  maxPolarAngle={Math.PI / 2}  // prevent orbiting below the ground
  target={[0, 0, 0]}    // orbit around this point
/>
```

**Mouse controls:**
- Left drag: orbit (rotate around target)
- Right drag: pan (translate camera and target)
- Scroll: zoom (move camera toward/away from target)

**For CAD/CAM:** `maxPolarAngle={Math.PI / 2}` prevents the camera from going
below the XY plane — the natural constraint for viewing a machined part on a table.

---

### Concept: `<Grid>`

**What it is:** A reference plane with grid lines, showing the XZ ground plane.

```tsx
import { Grid } from '@react-three/drei';

<Grid
  infiniteGrid         // extends to the horizon
  cellSize={1}         // spacing between small cells
  sectionSize={10}     // spacing between major divisions
  cellColor="#444"
  sectionColor="#666"
  fadeDistance={50}    // fades at this camera distance
  renderOrder={-1}     // renders behind other objects
/>
```

---

### Concept: `<Line>`

**What it is:** Draws a polyline through an array of 3D points.

```tsx
import { Line } from '@react-three/drei';

// Draw a triangle:
<Line
  points={[[0,0,0], [1,0,0], [0.5, 1, 0], [0,0,0]]}  // closed with first point repeated
  color="cyan"
  lineWidth={2}
  dashed={false}
/>

// Draw a line from origin to (5, 0, 0):
<Line points={[Vec3.ZERO.toArray(), [5, 0, 0]]} color="red" lineWidth={3} />
```

`<Line>` from Drei uses `THREE.Line2` under the hood — it supports `lineWidth > 1`
on all browsers (unlike native `lineSegments` which only supports 1px on most browsers).

---

### Concept: `<Html>`

**What it is:** Renders React/HTML inside the 3D scene, anchored to a 3D position.
Stays positioned correctly as the camera orbits.

```tsx
import { Html } from '@react-three/drei';

// Annotation label anchored to a 3D point:
<Html
  position={[2, 1.5, 0]}
  center     // centres the HTML on the anchor point
  style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 4 }}
>
  <div>Length: 25.4mm</div>
</Html>
```

**Use in CAD/CAM:** Dimension annotations, tool labels, coordinate readouts.
The HTML is overlaid on the WebGL canvas but stays anchored to the 3D position.

---

## Step 1 — Build the CAD Viewport

Install Drei:

```bash
npm install @react-three/drei
```

Create `src/components/CadViewport.tsx`:

```tsx
import { Canvas }                                          from '@react-three/fiber';
import { OrbitControls, Grid, Line, Html, GizmoHelper, GizmoViewport } from '@react-three/drei';

function AxisArrows() {
  return (
    <>
      {/* X axis — red */}
      <Line points={[[0,0,0], [5,0,0]]} color="red" lineWidth={3} />
      <Html position={[5.3, 0, 0]} center style={{ color: 'red', fontSize: 12, fontWeight: 'bold' }}>X</Html>

      {/* Y axis — green */}
      <Line points={[[0,0,0], [0,5,0]]} color="green" lineWidth={3} />
      <Html position={[0, 5.3, 0]} center style={{ color: 'green', fontSize: 12, fontWeight: 'bold' }}>Y</Html>

      {/* Z axis — blue */}
      <Line points={[[0,0,0], [0,0,5]]} color="royalblue" lineWidth={3} />
      <Html position={[0, 0, 5.3]} center style={{ color: 'royalblue', fontSize: 12, fontWeight: 'bold' }}>Z</Html>
    </>
  );
}

function SamplePart() {
  return (
    <group>
      {/* A simple L-shaped profile (in XY plane) */}
      <Line
        points={[[0,0,0], [4,0,0], [4,2,0], [2,2,0], [2,4,0], [0,4,0], [0,0,0]]}
        color="cyan"
        lineWidth={2}
      />
      <Html position={[2, 2, 0]} center style={{
        color: 'white', background: 'rgba(0,100,255,0.8)',
        padding: '2px 6px', borderRadius: 3, fontSize: 11,
      }}>
        Profile A
      </Html>
    </group>
  );
}

export function CadViewport() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e1e2e' }}>
      <Canvas
        camera={{ position: [10, 8, 10], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1e1e2e');
        }}
      >
        {/* Navigation */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Orientation gizmo */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['red', 'green', 'royalblue']}
            labelColor="white"
          />
        </GizmoHelper>

        {/* Reference grid */}
        <Grid
          infiniteGrid
          cellSize={1}
          sectionSize={10}
          cellColor="#2a2a3a"
          sectionColor="#3a3a5a"
          fadeDistance={100}
        />

        {/* Scene content */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} />

        <AxisArrows />
        <SamplePart />
      </Canvas>
    </div>
  );
}
```

Update `src/App.tsx`:

```tsx
import { CadViewport } from './components/CadViewport';
export default function App() { return <CadViewport />; }
```

### SAVE AND TRY

```bash
npm run dev
```

Expected: a dark viewport with a grid, axis arrows, and the L-shaped profile.
Orbit with left-click drag, pan with right-click drag, zoom with scroll.
The gizmo in the bottom-right shows the current orientation and updates as you orbit.

---

## 🎯 Challenge: Add a Measurement Tool

**You know:** `<Line>`, `<Html>`, 3D coordinates.

**Task:** Build a `Dimension` component that draws a dimension line between two
3D points with the measurement displayed in millimetres:

```tsx
<Dimension
  start={[0, 0, 0]}
  end={[25.4, 0, 0]}
  offset={0.5}  // how far above the geometry the line floats
/>
// Should draw: |←——— 25.40mm ————→|
```

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { Line, Html } from '@react-three/drei';
import * as THREE      from 'three';

interface DimensionProps {
  start:  [number, number, number];
  end:    [number, number, number];
  offset?: number;
  color?:  string;
}

export function Dimension({ start, end, offset = 0.5, color = 'white' }: DimensionProps) {
  const s    = new THREE.Vector3(...start);
  const e    = new THREE.Vector3(...end);
  const mid  = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);

  // The dimension line floats above the geometry:
  const up  = new THREE.Vector3(0, 1, 0).multiplyScalar(offset);
  const sl  = s.clone().add(up);
  const el  = e.clone().add(up);
  const ml  = mid.clone().add(up);

  const length = s.distanceTo(e);

  return (
    <>
      {/* Dimension line */}
      <Line
        points={[sl.toArray(), el.toArray()]}
        color={color}
        lineWidth={1}
      />
      {/* Extension lines */}
      <Line points={[s.toArray(), sl.toArray()]} color={color} lineWidth={1} />
      <Line points={[e.toArray(), el.toArray()]} color={color} lineWidth={1} />
      {/* Measurement label */}
      <Html position={ml.toArray()} center style={{
        color, fontSize: 10, background: 'rgba(0,0,0,0.8)',
        padding: '1px 4px', borderRadius: 2, whiteSpace: 'nowrap',
      }}>
        {length.toFixed(2)}mm
      </Html>
    </>
  );
}
```

</details>

---

## Final Check

| Drei component | What it provides |
|---|---|
| `OrbitControls` | Mouse navigation: orbit/pan/zoom |
| `Grid` | Reference plane with configurable grid |
| `Line` | Polyline with lineWidth > 1 support |
| `Html` | React/HTML anchored to 3D position |
| `GizmoHelper` | Orientation cube overlay |
| `Text` | 3D text rendering |

---

## Quick Check Answers

**1. What does "orbit" mean in `OrbitControls`?**

Moving the camera around a fixed target point while always facing it —
like a satellite orbiting a planet. The camera stays at a fixed distance
from the target and rotates around it. Left-click drag moves the camera
along the sphere's surface while the target remains stationary.

**2. `<Html>` — how does it stay anchored to a 3D position?**

R3F projects the 3D anchor position to 2D screen coordinates on every frame
using the camera's view and projection matrices. It then positions the HTML
element at those screen coordinates using absolute CSS positioning on a
transparent overlay div. As the camera moves, the projection changes, and the
CSS position updates.

**3. Click the X label in `GizmoHelper` — what should happen?**

The camera should animate to look down the X axis (from +X toward the origin,
or from the origin looking toward +X). This is the standard CAD "go to right
side view" action. `GizmoViewport` from Drei handles this animation by
programmatically updating `OrbitControls`'s camera position when an axis is clicked.
