# Junior to Senior — T8·L5 — Pointer Events and Hit Testing

**Prerequisites:** T8·L4 (Drei Helpers). You have a navigable 3D viewport. This
lesson adds interactivity — clicking and hovering on 3D objects.

**What this lab adds:**
- `onClick`, `onPointerDown`, `onPointerOver`, `onPointerOut` on R3F meshes
- The event object: `event.point`, `event.object`, `event.distance`
- `event.stopPropagation()` — preventing hits through objects
- Hover state pattern: selected mesh ID in state
- Placing geometry by clicking the construction plane

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `event.point` vs `event.object` — what is each?
> 2. Two overlapping meshes. A click hits both. How do you ensure only the
>    front one receives the event?
> 3. You want the cursor to change to a pointer when hovering a mesh. How?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

An interactive point-placement tool where clicking the ground plane places a
marker at the click position:

```tsx
// Click the grid → place a sphere there
// Click a sphere → select it (highlight it)
// Click empty space → deselect
```

---

### Concept: Pointer Events in R3F

**What it is:** R3F attaches raycasting-based pointer events to any mesh.
When the pointer is over the mesh, events fire with 3D hit information.

```tsx
<mesh
  onClick={e => {
    console.log('Hit point:', e.point);       // Vec3 — world-space click position
    console.log('Hit object:', e.object);     // The Three.js Mesh object
    console.log('Distance:', e.distance);     // Distance from camera to hit
    e.stopPropagation();                      // Prevent event from reaching objects behind
  }}
  onPointerOver={() => setHovered(true)}
  onPointerOut={()  => setHovered(false)}
  onPointerDown={e => { /* drag start */ }}
  onPointerUp={e   => { /* drag end */ }}
>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>
```

---

### Concept: `event.stopPropagation()`

**The problem:** R3F's raycaster hits ALL meshes along the ray, front to back.
Without stopping propagation, clicking on a mesh in front also triggers the
`onClick` of meshes behind it.

```tsx
// Front mesh stops the event — back mesh never fires:
<mesh onClick={e => { e.stopPropagation(); console.log('Front hit'); }}>
  ...
</mesh>

// Behind the front mesh:
<mesh onClick={() => console.log('Only hit when front mesh is NOT in the way')}>
  ...
</mesh>
```

---

### Concept: The Cursor Style

```tsx
import { useThree } from '@react-three/fiber';

function ClickableMesh() {
  const { gl } = useThree();

  return (
    <mesh
      onPointerOver={() => { gl.domElement.style.cursor = 'pointer'; }}
      onPointerOut={()  => { gl.domElement.style.cursor = 'auto'; }}
      onClick={e => { e.stopPropagation(); /* handle click */ }}
    >
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

`gl.domElement` is the WebGL canvas element. Setting its cursor style changes
the cursor over the entire canvas — but only the pointer that triggers
`onPointerOver` changes it.

---

## Step 1 — Build the Point Placement Tool

Create `src/components/PointPlacer.tsx`:

```tsx
import { useState, useRef }                                  from 'react';
import { useThree }                                          from '@react-three/fiber';
import { Line, Html }                                        from '@react-three/drei';
import type { ThreeEvent }                                   from '@react-three/fiber';
import * as THREE                                            from 'three';

interface PlacedPoint {
  id:       number;
  position: [number, number, number];
}

function Marker({
  position,
  selected,
  onSelect,
}: {
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { gl } = useThree();
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => {
        setHovered(true);
        gl.domElement.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        gl.domElement.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={selected ? 'yellow' : hovered ? 'cyan' : 'white'}
        emissive={selected ? 'orange' : 'black'}
        emissiveIntensity={selected ? 0.3 : 0}
      />
    </mesh>
  );
}

function ConstructionPlane({ onPlacePoint }: { onPlacePoint: (pos: [number, number, number]) => void }) {
  const [hoverPos, setHoverPos] = useState<[number, number, number] | null>(null);

  return (
    <>
      {/* Invisible plane that receives clicks — larger than the grid */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          const p = e.point;
          onPlacePoint([
            Math.round(p.x * 10) / 10,  // snap to 0.1 units
            0,
            Math.round(p.z * 10) / 10,
          ]);
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          const p = e.point;
          setHoverPos([
            Math.round(p.x * 10) / 10,
            0,
            Math.round(p.z * 10) / 10,
          ]);
        }}
        onPointerLeave={() => setHoverPos(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Ghost point that follows the cursor */}
      {hoverPos && (
        <mesh position={hoverPos}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="white" opacity={0.5} transparent />
        </mesh>
      )}
    </>
  );
}

export function PointPlacer() {
  const [points, setPoints]     = useState<PlacedPoint[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const nextId = useRef(0);

  const handlePlacePoint = (pos: [number, number, number]) => {
    const id = nextId.current++;
    setPoints(prev => [...prev, { id, position: pos }]);
    setSelected(null);
  };

  return (
    <>
      {/* Coordinates display */}
      {selected !== null && (() => {
        const pt = points.find(p => p.id === selected);
        return pt ? (
          <Html position={pt.position} style={{
            color: 'yellow', background: 'rgba(0,0,0,0.8)',
            padding: '2px 6px', borderRadius: 3, fontSize: 11,
            transform: 'translate(10px, -20px)',
          }}>
            ({pt.position[0].toFixed(1)}, {pt.position[2].toFixed(1)})
          </Html>
        ) : null;
      })()}

      {/* Draw lines between points if > 1 */}
      {points.length >= 2 && (
        <Line
          points={points.map(p => p.position)}
          color="#555"
          lineWidth={1}
        />
      )}

      {/* Construction plane — click to place */}
      <ConstructionPlane onPlacePoint={handlePlacePoint} />

      {/* Rendered markers */}
      {points.map(pt => (
        <Marker
          key={pt.id}
          position={pt.position}
          selected={selected === pt.id}
          onSelect={() => setSelected(s => s === pt.id ? null : pt.id)}
        />
      ))}
    </>
  );
}
```

### SAVE AND TRY

Click on the ground plane to place points. Click a point to select it (turns yellow).
Move the mouse to see the ghost cursor. Click selected point again to deselect.

---

## 🎯 Challenge: Add Delete and Clear

**You know:** R3F pointer events, state management, `stopPropagation`.

**Task:** Add:
1. A "Delete selected point" button (when a point is selected)
2. A "Clear all" button

Both should be HTML overlay buttons, not 3D objects. Use `position: fixed` CSS.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// Add to the PointPlacer component return:
<>
  {/* Existing 3D content */}
  {/* ... */}

  {/* HTML controls — outside Canvas */}
  <div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8 }}>
    {selected !== null && (
      <button onClick={() => {
        setPoints(p => p.filter(pt => pt.id !== selected));
        setSelected(null);
      }}>
        Delete selected
      </button>
    )}
    <button onClick={() => { setPoints([]); setSelected(null); }}>
      Clear all
    </button>
    <span style={{ color: 'white', padding: '4px 8px' }}>
      {points.length} points
    </span>
  </div>
</>
```

Note: the HTML div goes outside `<Canvas>` in the parent component, not inside it.
The `PointPlacer` component returns 3D content for inside `<Canvas>`. The controls
go in `src/App.tsx` or a wrapper component.

</details>

---

## Final Check

| Event | Fires when |
|---|---|
| `onClick` | Click on mesh |
| `onPointerOver` | Pointer enters mesh bounding area |
| `onPointerOut` | Pointer leaves mesh |
| `onPointerDown` | Pointer button pressed on mesh |
| `onPointerMove` | Pointer moves over mesh |
| `stopPropagation()` | Prevents event reaching objects behind |

---

## Quick Check Answers

**1. `event.point` vs `event.object`?**

`event.point` is a `Vector3` — the exact 3D world-space position where the ray
hit the mesh surface. `event.object` is the Three.js `Mesh` object that was hit —
you can use it to get the mesh's ID, name, userData, or any other property. Use
`event.point` to know where in 3D space the click occurred. Use `event.object` to
know which mesh was clicked.

**2. Two overlapping meshes — how to ensure only the front one receives the event?**

Call `e.stopPropagation()` in the front mesh's event handler. Without this, R3F
passes the event to all meshes the ray intersects, from front to back. Once
`stopPropagation()` is called, R3F stops passing the event to subsequent objects.
This is analogous to `event.stopPropagation()` in regular DOM events.

**3. Cursor changes to pointer on mesh hover — how?**

```tsx
const { gl } = useThree();
onPointerOver={() => { gl.domElement.style.cursor = 'pointer'; }}
onPointerOut={()  => { gl.domElement.style.cursor = 'auto'; }}
```

`gl.domElement` is the actual `<canvas>` HTML element. Setting its cursor style
changes the browser cursor. Remember to reset it on `onPointerOut` — otherwise the
pointer cursor persists after the mouse leaves the mesh.
