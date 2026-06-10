# Junior to Senior — T8·L3 — Geometry, Materials, and Lights

**Prerequisites:** T8·L2 (`useFrame` and `useThree`). You can animate objects.
This lesson covers the three elements of every visible 3D object: its shape
(geometry), its appearance (material), and its illumination (lights).

**What this lab adds:**
- Geometry: `BoxGeometry`, `SphereGeometry`, `BufferGeometry` (custom)
- Materials: `MeshStandardMaterial` (PBR), `MeshBasicMaterial` (no lighting), `LineBasicMaterial`
- `mesh` = geometry + material — one mesh, one geometry, one material
- Lights: `ambientLight`, `directionalLight`, `pointLight`
- `useMemo` for geometry — created once, not on every render

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You use `MeshBasicMaterial`. The scene has no lights. What do you see?
> 2. You put `const geometry = new BoxGeometry(1, 1, 1)` inside a React component
>    body (not in `useMemo`). What happens every time the parent re-renders?
> 3. An `ambientLight` fills the scene evenly. A `directionalLight` creates shadows.
>    Which one alone makes objects "flat" with no shading?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A scene showing different materials and how lights affect them:

```tsx
<Canvas>
  {/* Lights */}
  <ambientLight intensity={0.3} />
  <directionalLight position={[5, 10, 5]} castShadow />
  <pointLight position={[-3, 2, 0]} color="blue" intensity={2} />

  {/* Meshes */}
  <mesh>
    <sphereGeometry args={[1, 64, 64]} />
    <meshStandardMaterial metalness={0.8} roughness={0.2} color="silver" />
  </mesh>

  {/* Custom wireframe line geometry */}
  <GridLines />
</Canvas>
```

---

### Concept: Geometry

**Built-in geometries:**

```tsx
<boxGeometry     args={[w, h, d, segmentsW, segmentsH, segmentsD]} />
<sphereGeometry  args={[radius, widthSeg, heightSeg]} />
<planeGeometry   args={[w, h, segW, segH]} />
<cylinderGeometry args={[topR, botR, h, radSeg, heightSeg]} />
<torusGeometry   args={[radius, tube, radSeg, tubeSeg]} />
```

**`BufferGeometry` for custom shapes:**

```ts
import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();

// Define vertices manually:
const vertices = new Float32Array([
  0, 0, 0,   // vertex 0
  1, 0, 0,   // vertex 1
  0, 1, 0,   // vertex 2
]);

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
```

**`useMemo` prevents recreation on every render:**

```tsx
import { useMemo } from 'react';
import * as THREE  from 'three';

function CustomShape() {
  // Only created ONCE — not on every parent re-render:
  const geometry = useMemo(() => {
    const geo  = new THREE.BufferGeometry();
    const verts = new Float32Array([...]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geo;
  }, []);  // empty deps — never recreated

  return <primitive object={geometry} />;
}
```

---

### Concept: Materials

**`MeshBasicMaterial`:** No lighting — always shows the color. Use for:
- UI overlays (always visible regardless of lights)
- Wireframes (where you want consistent appearance)
- Markers and indicators

```tsx
<meshBasicMaterial color="red" />             // solid color, no lighting
<meshBasicMaterial wireframe />               // wireframe view
<meshBasicMaterial color="white" opacity={0.5} transparent /> // transparent
```

**`MeshStandardMaterial`:** PBR (Physically Based Rendering) — responds to lights
with metalness and roughness controls:

```tsx
<meshStandardMaterial
  color="silver"
  metalness={0.8}    // 0 = plastic, 1 = metal
  roughness={0.1}    // 0 = mirror, 1 = rough
/>
```

**`LineBasicMaterial`:** For drawing lines.

```tsx
<lineBasicMaterial color="white" linewidth={2} />  // linewidth >1 only works on some browsers
```

---

### Concept: Lights

```tsx
// Fills everything equally — no shadows, no shading:
<ambientLight intensity={0.4} />

// Parallel rays from a direction — directional like sunlight:
<directionalLight
  position={[5, 10, 5]}
  intensity={1}
  castShadow
/>

// Radiates from a point — like a lamp:
<pointLight
  position={[-3, 2, 0]}
  color="blue"
  intensity={2}
  distance={10}  // light fades at this distance
/>

// Spotlight — cone of light:
<spotLight
  position={[0, 10, 0]}
  angle={Math.PI / 8}
  penumbra={0.1}  // soft edge
/>
```

**Rule of thumb:** Ambient (0.2–0.4) + directional (1.0) is the standard setup.
Add point lights for coloured accents or interior lighting.

---

## Step 1 — Build the Material Demo Scene

Create `src/components/MaterialDemo.tsx`:

```tsx
import { useRef, useMemo }  from 'react';
import { useFrame }         from '@react-three/fiber';
import * as THREE           from 'three';
import type { Mesh }         from 'three';

function MetalSphere({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null!);
  useFrame((_, d) => { ref.current.rotation.y += d * 0.5; });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.5, 64, 64]} />
      <meshStandardMaterial metalness={0.9} roughness={0.1} color="#c0c0c0" />
    </mesh>
  );
}

function MatteBox({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="peru" roughness={0.9} metalness={0} />
    </mesh>
  );
}

function WireframeTorus({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null!);
  useFrame((_, d) => { ref.current.rotation.x += d; ref.current.rotation.z += d * 0.7; });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.4, 0.15, 16, 100]} />
      <meshBasicMaterial color="lime" wireframe />
    </mesh>
  );
}

function GridFloor() {
  const geometry = useMemo(() => {
    const geo  = new THREE.BufferGeometry();
    const verts: number[] = [];
    const size = 5;

    for (let i = -size; i <= size; i++) {
      verts.push(-size, 0, i,   size, 0, i);  // horizontal lines
      verts.push(i, 0, -size,   i, 0,  size); // vertical lines
    }

    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry} position={[0, -1, 0]}>
      <lineBasicMaterial color="#333" />
    </lineSegments>
  );
}

export function MaterialDemo() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-4, 3, -2]} color="royalblue" intensity={3} distance={8} />

      <MetalSphere    position={[-2, 0, 0]} />
      <MatteBox       position={[ 0, 0, 0]} />
      <WireframeTorus position={[ 2, 0, 0]} />
      <GridFloor />
    </>
  );
}
```

Update `src/components/Scene.tsx` to use `MaterialDemo`.

### SAVE AND TRY

```bash
npm run dev
```

Expected: three different objects showing different materials with the blue point
light creating a coloured highlight on the left side.

**Change something:** Set `ambientLight intensity` to 0. The matte box becomes
almost black (only lit by directional). The wireframe torus stays bright
(MeshBasicMaterial ignores lighting). This demonstrates the material difference.

---

## 🎯 Challenge: Custom Line Geometry for a Profile

**You know:** `BufferGeometry`, `lineSegments`, `useMemo`.

**Task:** Build a `Profile` component that draws a closed polygon from an array
of 2D points (lines in the XY plane at Z=0):

```tsx
<Profile
  points={[[0,0], [1,0], [1,1], [0,1]]}
  color="cyan"
  closed  // connects last point back to first
/>
```

Use `BufferGeometry` with `lineSegments` (pairs of points) or `line` (connected).

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useMemo } from 'react';
import * as THREE  from 'three';

interface ProfileProps {
  points: [number, number][];
  color?: string;
  closed?: boolean;
}

export function Profile({ points, color = 'cyan', closed = false }: ProfileProps) {
  const geometry = useMemo(() => {
    const pts = closed ? [...points, points[0]] : points;
    const verts = new Float32Array(pts.flatMap(([x, y]) => [x, y, 0]));
    const geo   = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geo;
  }, [points, closed]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} />
    </line>
  );
}
```

**Key insight:** `<line>` (not `<lineSegments>`) draws a connected polyline —
each vertex connects to the next. Appending `points[0]` to the end closes the
profile. `useMemo` with `[points, closed]` deps recreates the geometry only when
the profile points change — not on every parent re-render.

</details>

---

## Final Check

| Material | Needs lights | Use case |
|---|---|---|
| `meshBasicMaterial` | No | Wireframes, UI overlays, always-visible markers |
| `meshStandardMaterial` | Yes | All physically realistic surfaces |
| `lineBasicMaterial` | No | Lines, grids, profiles |

| Geometry pattern | When |
|---|---|
| Built-in (`boxGeometry`, etc.) | Standard shapes |
| `BufferGeometry` in `useMemo` | Custom shapes — created once |
| `<primitive object={geo}>` | Pre-built Three.js geometry object |

---

## Quick Check Answers

**1. `MeshBasicMaterial`, no lights. What do you see?**

The solid, unlit color — as if every pixel is fully lit at 100% of the color value.
`MeshBasicMaterial` does not participate in the lighting calculation. It is always
the same color regardless of lights, shadows, or viewing angle. This is why it is
used for wireframes and overlays — they should always be visible and consistent.

**2. `const geometry = new BoxGeometry(...)` in component body — what happens on re-render?**

A new `BoxGeometry` object is created and uploaded to the GPU on every re-render.
Old geometry objects are not automatically disposed — GPU memory leaks. The app
progressively consumes more GPU memory. Use `useMemo` to create the geometry once,
and `useEffect` cleanup to `geometry.dispose()` when the component unmounts.

**3. `ambientLight` alone — what does shading look like?**

Flat — no shading at all. Ambient light fills every surface equally from every
direction. A sphere lit only by ambient light looks like a flat circle — no shadow
side, no highlight, no sense of 3D shape. Directional or point lights create the
shadows and highlights that give objects their 3D appearance.
