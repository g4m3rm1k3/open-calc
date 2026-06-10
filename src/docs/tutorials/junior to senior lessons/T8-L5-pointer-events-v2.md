# Junior to Senior — T8·L5 — Pointer Events and Hit Testing

**Prerequisites:** T8·L4 (Drei Helpers). You have a navigable 3D viewport. This
lesson explains HOW R3F translates a 2D mouse click into 3D object hits — the raycasting
mechanism from T7-L6 applied to React components, and WHY `stopPropagation` is needed.

**What this lab adds:**
- What R3F does every frame to check for pointer events — the raycasting loop
- Why `event.point` is a Vec3 and how it is computed (from T7-L6)
- Why `event.stopPropagation()` is needed — R3F hits ALL objects along the ray
- The cursor change mechanism — `gl.domElement.style.cursor`
- Building a point-placement tool step by step: invisible plane → hit test → place marker

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The user moves the mouse over the canvas. R3F fires a ray every frame.
>    How many mesh objects does R3F check, and what does it find each frame?
> 2. Two overlapping meshes. The user clicks. R3F fires `onClick` on the FRONT mesh.
>    Does `onClick` on the BACK mesh also fire? How do you prevent it?
> 3. `onPointerOver={() => setHovered(true)}` — is this called when the mouse enters
>    the BOUNDING BOX of the mesh or the ACTUAL SURFACE of the mesh?
>
> *(Answers at the end of this lab)*

---

## How R3F Pointer Events Work — The Raycasting Loop

Every frame, R3F runs a raycaster from the camera through the current mouse position
(using the screen-to-ray algorithm from T7-L6). It intersects this ray with ALL meshes
in the scene that have pointer event handlers. The results are sorted by distance.

```
User moves mouse to pixel (400, 300).
R3F frame:
  1. Create ray from camera through (400, 300) [as in T7-L6]
  2. For each mesh with pointer handlers: test intersection
  3. Sort results by distance
  4. For closest intersected mesh: fire onPointerOver (if not already hovered)
  5. For previously hovered meshes no longer intersected: fire onPointerOut
  6. If mouse was clicked this frame: fire onClick on ALL intersected meshes, closest first
     (unless stopPropagation was called)
```

This is why `event.point` gives you the exact 3D hit position — it is the intersection
point computed by the ray-mesh test.

---

## Step 1 — See the Raycasting in Action

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

function ClickableBox() {
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    // event.point is the EXACT 3D position on the surface that was clicked:
    console.log('Hit position:', event.point.x.toFixed(2), event.point.y.toFixed(2), event.point.z.toFixed(2));
    // event.distance is the distance from the camera to the hit point:
    console.log('Distance from camera:', event.distance.toFixed(2));
    // event.object is the THREE.Mesh that was clicked:
    console.log('Hit object:', event.object.type);
  };

  return (
    <mesh onClick={onClick}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} />
        <OrbitControls />
        <ClickableBox />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

Open the browser console. Click on the box.

**You should see:**
```
Hit position: 0.73 0.32 1.00   ← the exact 3D surface point where you clicked
Distance from camera: 4.00      ← how far from the camera
Hit object: Mesh
```

**Change something:** Click on different faces of the box. The z coordinate changes
based on which face you hit (front face = z≈+1, back face = z≈-1 for a 2×2×2 box).
This shows `event.point` gives the actual surface hit.

---

### Concept: Why `stopPropagation` Is Needed

**The mechanism — R3F hits ALL objects along the ray:**

```tsx
// Two overlapping meshes:
<mesh position={[0, 0, 0.5]}>  {/* front mesh — closer to camera */}
  <boxGeometry />
  <meshStandardMaterial color="red" />
  onClick={(e) => {
    console.log('RED clicked');
    // Without stopPropagation: blue also fires
    // With stopPropagation: blue never fires
    e.stopPropagation();
  }}
</mesh>

<mesh position={[0, 0, -0.5]}>  {/* back mesh — further from camera */}
  <boxGeometry />
  <meshStandardMaterial color="blue" />
  onClick={() => console.log('BLUE clicked')}
</mesh>
```

Without `stopPropagation`: clicking on the red box fires BOTH "RED clicked" and
"BLUE clicked". The ray hit both meshes.

With `stopPropagation`: clicking on the red box fires only "RED clicked". The event
stops after the first (closest) mesh.

**Why this matters:** In the CAD viewport, a geometry item might be on top of the
construction plane. Without `stopPropagation`, clicking the item would ALSO fire the
construction plane's click handler — potentially placing a new point at the same location.

---

## Step 2 — See the Propagation Problem

```tsx
function OverlappingTest() {
  return (
    <>
      {/* Front mesh */}
      <mesh position={[0, 0, 0.5]}
        onClick={e => {
          console.log('FRONT clicked');
          // Comment out the next line to see propagation:
          e.stopPropagation();
        }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" opacity={0.8} transparent />
      </mesh>

      {/* Back mesh */}
      <mesh position={[0, 0, -0.5]}
        onClick={() => console.log('BACK clicked')}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  );
}
```

### SAVE AND TRY

Open the console. Click on the red (front) box.

**With `stopPropagation`:** Only "FRONT clicked" appears.
**Without `stopPropagation`:** Both "FRONT clicked" and "BACK clicked" appear.

Comment out `e.stopPropagation()`. Click again. **Expected:** Both log. Add it back.

---

### Concept: Cursor Changes

**The mechanism:** The WebGL canvas is a regular `<canvas>` HTML element. Setting
`canvas.style.cursor` changes the browser cursor over that element.

```tsx
import { useThree } from '@react-three/fiber';

function ClickableMesh() {
  const { gl } = useThree();  // gl = the WebGL renderer

  return (
    <mesh
      onPointerOver={() => {
        gl.domElement.style.cursor = 'pointer';   // change cursor on hover
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = 'auto';      // reset cursor on leave
      }}
      onClick={e => {
        e.stopPropagation();
        console.log('clicked');
      }}
    >
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

**Note on `pointerOver` vs `pointerEnter`:** R3F fires `onPointerOver` on the FIRST
frame the pointer intersects the mesh. `onPointerOut` fires on the first frame it no
longer intersects. This mirrors DOM `mouseover` / `mouseout` behaviour.

---

## Step 3 — Build the Point Placement Tool

The CAD application needs this interaction: user clicks the construction plane → a sphere
marker appears at the click position.

```tsx
// src/components/PointPlacer.tsx
import { useState } from 'react';
import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';

interface PlacedPoint {
  id:  number;
  pos: [number, number, number];
}

function ConstructionPlane({ onPlace }: { onPlace: (pos: [number,number,number]) => void }) {
  const { gl } = useThree();

  return (
    <mesh
      rotation-x={-Math.PI / 2}   // rotate flat (horizontal)
      onPointerOver={() => { gl.domElement.style.cursor = 'crosshair'; }}
      onPointerOut={()  => { gl.domElement.style.cursor = 'auto'; }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();

        // e.point is the exact 3D position on the plane:
        const p = e.point;

        // Snap to 0.1 unit grid:
        onPlace([
          Math.round(p.x * 10) / 10,
          0,   // keep on the plane (Y=0)
          Math.round(p.z * 10) / 10,
        ]);
      }}
    >
      {/* Large invisible plane that covers the viewport floor: */}
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />   {/* invisible but clickable */}
    </mesh>
  );
}

function Marker({
  pos,
  selected,
  onSelect,
}: {
  pos: [number,number,number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { gl } = useThree();

  return (
    <mesh
      position={pos}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();   // don't propagate to the construction plane
        onSelect();
      }}
      onPointerOver={() => { gl.domElement.style.cursor = 'pointer'; }}
      onPointerOut={()  => { gl.domElement.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={selected ? 'yellow' : 'white'}
        emissive={selected ? 'orange' : 'black'}
        emissiveIntensity={selected ? 0.3 : 0}
      />
    </mesh>
  );
}

export function PointPlacer() {
  const [points, setPoints]     = useState<PlacedPoint[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  let nextId = 0;

  return (
    <>
      <ConstructionPlane
        onPlace={pos => {
          setPoints(prev => [...prev, { id: nextId++, pos }]);
          setSelected(null);
        }}
      />

      {points.map(pt => (
        <Marker
          key={pt.id}
          pos={pt.pos}
          selected={selected === pt.id}
          onSelect={() => setSelected(s => s === pt.id ? null : pt.id)}
        />
      ))}
    </>
  );
}
```

### SAVE AND TRY

Add `<PointPlacer />` inside `<Canvas>` in App.tsx (alongside OrbitControls and Grid).

```bash
npm run dev
```

**You should see:** Clicking on the grid places white sphere markers. Clicking a marker
turns it yellow. The cursor changes to crosshair over the construction plane and to
pointer over markers.

**In the browser console, verify `stopPropagation` works:**

Add `console.log('plane click')` to `ConstructionPlane.onClick`. Click a marker.
Expected: "plane click" does NOT appear — the marker's `stopPropagation` prevented it.

---

## 🎯 Challenge: Add Delete and Coordinates Display

**You know:** R3F pointer events, `stopPropagation`, `<Html>`.

**Task:** Add two features to `PointPlacer`:
1. When a point is selected (yellow), show its coordinates in an `<Html>` overlay
2. Double-clicking a selected point deletes it

Write these interactions before implementing them. Think about:
- Which event fires on double-click? (`onDoubleClick`)
- How do you read coordinates from the selected point?
- Where should the `<Html>` element be positioned?

---

<details>
<summary>▶ Show Solution</summary>

**Coordinate display:**
```tsx
// In PointPlacer JSX, after the markers:
{selected !== null && (() => {
  const pt = points.find(p => p.id === selected);
  return pt ? (
    <Html position={pt.pos} style={{ pointerEvents: 'none' }}>
      <div style={{
        color: 'yellow', background: 'rgba(0,0,0,0.8)',
        padding: '2px 6px', borderRadius: 3, fontSize: 11,
        transform: 'translate(12px, -20px)',
      }}>
        ({pt.pos[0].toFixed(1)}, {pt.pos[2].toFixed(1)})
      </div>
    </Html>
  ) : null;
})()}
```

**Delete on double-click — add to Marker:**
```tsx
onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation();
  setPoints(prev => prev.filter(p => p.id !== props.id));
  setSelected(null);
}}
```

**Key insight:** `onDoubleClick` is a separate R3F event — it fires on two rapid clicks,
not on single clicks. This prevents accidental deletion when the user is just selecting.
The `e.stopPropagation()` prevents the double-click from reaching the construction plane
and placing a new point at the same location.

</details>

---

## Final Check

| Event | When it fires |
|---|---|
| `onClick` | Mouse button clicked AND released on the mesh |
| `onPointerOver` | First frame the ray intersects the mesh |
| `onPointerOut` | First frame the ray NO LONGER intersects |
| `onPointerMove` | Every frame the ray intersects the mesh (expensive!) |
| `onDoubleClick` | Two rapid clicks |

---

## Quick Check Answers

**1. Mouse moves over canvas. R3F fires a ray every frame. What does it check?**

R3F checks ALL meshes that have at least one pointer event handler registered. The ray
is tested against each mesh's geometry (or bounding box for a faster first pass). If the
mouse is not over any mesh, all handlers return without firing. If over a mesh, R3F tracks
which meshes are currently hovered and fires `onPointerOver`/`onPointerOut` when the state changes.

**2. Two overlapping meshes — does the back mesh's `onClick` fire?**

By default, yes — R3F fires `onClick` on ALL intersected meshes, sorted by distance,
until one calls `event.stopPropagation()`. If the front mesh does NOT call `stopPropagation`,
the event continues to the back mesh. Call `event.stopPropagation()` in the front mesh's
handler to prevent the back mesh from receiving the event.

**3. `onPointerOver` fires when mouse enters the bounding box or the actual surface?**

The actual surface. R3F uses Three.js raycasting which performs a ray-triangle intersection
test against the mesh's geometry. For a sphere, this means the pointer event only fires when
the mouse is over the actual curved surface of the sphere — not the square bounding box.
This is why you can click "inside" a torus ring without hitting the mesh.
