# Junior to Senior — T8·L1 — The R3F Mental Model

**Prerequisites:** T7·L7 (Perspective vs Orthographic). You understand 3D math.
This lesson explains HOW React Three Fiber works — specifically what the reconciler
does when it sees `<mesh>`, why props like `position={[0,1,0]}` call `.set()` and not
`=`, and why you never use `setState` for animation.

**What this lab adds:**
- What the R3F reconciler actually does with your JSX — step by step
- Why lowercase element names (`<mesh>`) differ from uppercase React components
- How each prop type (array, scalar, dash-notation) maps to a different Three.js operation
- Why `useState` for animation causes re-renders and `useRef` + `useFrame` does not
- The `attach` prop — when R3F can't figure out where to attach a child

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `<mesh position={[0, 1, 0]}>` — what exact Three.js method call does this produce?
>    Hint: it is NOT `mesh.position = [0, 1, 0]`.
> 2. `<boxGeometry args={[2, 1, 0.5]} />` — what happens to the `args` array?
>    At what point in the lifecycle is the geometry created?
> 3. You have a rotating box. You update its rotation using `setState` every frame.
>    The component re-renders 60 times per second. What happens to the rest of the
>    React component tree?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See What Three.js Looks Like Without R3F

Before writing any R3F code, write the raw Three.js. Then you'll understand exactly
what R3F is doing for you.

Create `public/index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Three.js raw</title></head>
<body>
<canvas id="canvas"></canvas>
<script type="module">
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas   = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(800, 600);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 800/600, 0.1, 100);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Create geometry, material, mesh — three separate objects:
const geometry = new THREE.BoxGeometry(1, 1, 1);  // ← constructor args
const material = new THREE.MeshStandardMaterial({ color: 'orange' });
const mesh     = new THREE.Mesh(geometry, material);

mesh.position.set(0, 1, 0);   // ← .set() method call for Vector3

scene.add(mesh);               // ← explicit add to scene

const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

// Animation loop:
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.01;    // ← direct mutation each frame
  renderer.render(scene, camera);
}
animate();
</script>
</body>
</html>
```

### SAVE AND TRY

Open `public/index.html` directly in a browser.

**You should see:** A rotating orange cube. Notice what you had to do manually:
1. Create renderer, scene, camera
2. Create geometry, material, mesh separately
3. Call `mesh.position.set(...)` for positioning
4. Call `scene.add(mesh)` explicitly
5. Write the animation loop manually

R3F automates all of this. But understanding WHAT it automates helps you debug when things go wrong.

---

### Concept: What the R3F Reconciler Does

**What it is:** React's reconciler manages the virtual DOM for React apps. R3F
provides a CUSTOM reconciler that manages the Three.js scene graph instead of the DOM.

**The mechanism — what happens when R3F processes `<mesh>`:**

```tsx
// Your JSX:
<mesh position={[0, 1, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="orange" />
</mesh>

// What R3F does when it sees this:
// 1. 'mesh' is lowercase → R3F looks up THREE.Mesh
// 2. R3F calls: const mesh = new THREE.Mesh()
// 3. R3F calls: scene.add(mesh) (or parent.add(mesh) if nested)
// 4. R3F processes position={[0, 1, 0]} → calls: mesh.position.set(0, 1, 0)
//    (Arrays trigger .set() — NOT assignment)
// 5. R3F processes children:
//    - 'boxGeometry' → const geo = new THREE.BoxGeometry(...args)
//    - R3F attaches: mesh.geometry = geo
//    - 'meshStandardMaterial' → const mat = new THREE.MeshStandardMaterial(...)
//    - R3F attaches: mesh.material = mat
// 6. When component unmounts: scene.remove(mesh); geo.dispose(); mat.dispose()
```

**The lowercase rule:** In R3F, any lowercase JSX element name is treated as a Three.js
class name. `<mesh>` → `THREE.Mesh`. `<boxGeometry>` → `THREE.BoxGeometry`.
`<ambientLight>` → `THREE.AmbientLight`. Uppercase = a React component (your code).

**The auto-disposal guarantee:** When a component unmounts, R3F calls `.dispose()` on
geometries and materials and removes objects from the scene. You don't write cleanup code.

**You will see this again in:**
- Drei components like `<OrbitControls>` are uppercase — they are React components
- `extend({ MyCustomGeometry })` lets you register custom Three.js classes for lowercase use
- The R3F GitHub shows the reconciler source if you want to understand it deeply

---

## Step 2 — Build Your First R3F Scene

```bash
npm create vite@latest 3d-viewer -- --template react-ts
cd 3d-viewer && npm install
npm install @react-three/fiber three @types/three
```

Replace `src/App.tsx`:

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber';

function Box() {
  return (
    // Each of these becomes a Three.js operation:
    <mesh position={[0, 0, 0]}>        {/* new THREE.Mesh(), mesh.position.set(0,0,0) */}
      <boxGeometry args={[1, 1, 1]} /> {/* new THREE.BoxGeometry(1, 1, 1) */}
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function App() {
  return (
    // Canvas creates: renderer, scene, camera, render loop
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />  {/* new THREE.AmbientLight() */}
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

Open `http://localhost:5173`.

**You should see:** A grey box (no directional light yet — ambient only).

**In the browser console, verify the Three.js objects exist:**

```js
// R3F exposes the scene, camera, and renderer through its store.
// In development, you can access them via the devtools or by using useThree() in a component.
// For now, just verify no errors appear.
```

**Change something:** Change `intensity={0.5}` to `intensity={0}` on the ambient light.
Expected: the box disappears (completely dark). Change to `intensity={2}` — brighter.

---

### Concept: Prop Mapping — Why Arrays Call `.set()`

**What it is:** R3F maps different prop types to different Three.js operations:

```tsx
// Array → .set() method:
<mesh position={[1, 2, 3]} />
// → mesh.position.set(1, 2, 3)   ← .set() because Vector3.set(x,y,z) exists

// Scalar → direct assignment:
<mesh visible={false} />
// → mesh.visible = false   ← direct assignment for boolean

// Dash notation → nested property:
<mesh rotation-y={Math.PI / 4} />
// → mesh.rotation.y = Math.PI / 4   ← navigate the object hierarchy with dashes

// args → constructor arguments:
<boxGeometry args={[2, 1, 0.5]} />
// → new THREE.BoxGeometry(2, 1, 0.5)   ← spread as constructor args
```

**Why arrays call `.set()` instead of `=`:**

`mesh.position = [0, 1, 0]` would REPLACE the Vector3 object with an array — breaking
all of Three.js's internal references to the position. `mesh.position.set(0, 1, 0)` updates
the EXISTING Vector3 in place — safe.

**The `attach` prop for manual attachment:**

Usually R3F knows where to attach children (geometry → `.geometry`, material → `.material`).
For custom cases: `<customThing attach="children[0]" />` explicitly sets the property.
R3F's documentation has the full list of auto-detected attachment rules.

---

### Concept: Why `useState` Kills Animation Performance

**What it is:** `useState` triggers React re-renders. Re-renders are expensive. 60fps
animation means 60 re-renders per second.

**The problem — `useState` for rotation:**

```tsx
function BadBox() {
  const [rotY, setRotY] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRotY(r => r + 0.01);   // ← calls setState 60 times per second
    }, 16);
    return () => clearInterval(id);
  }, []);

  // rotY changing → React diffs the entire component → re-renders all children
  return <mesh rotation-y={rotY}><boxGeometry /></mesh>;
}
```

At 60fps, this causes: 60 `setState` calls → 60 re-renders → 60 virtual DOM diffs →
60 reconciler runs per second. Expensive.

**The solution — `useFrame` + ref:**

```tsx
function GoodBox() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    // Directly mutates the Three.js object — ZERO React involvement:
    ref.current.rotation.y += delta;
    // No setState. No re-render. No virtual DOM diff.
  });

  return (
    <mesh ref={ref}>  {/* ref gives us direct access to the THREE.Mesh */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

**How `useFrame` works:** R3F's render loop calls all registered `useFrame` callbacks
before each Three.js render. The callbacks receive `(state, delta)` where `delta` is
seconds since the last frame. React is not involved — no re-renders, no virtual DOM.

---

## Step 3 — Add Animation to the Box

Update `src/App.tsx`:

```tsx
// src/App.tsx
import { useRef }    from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

function RotatingBox() {
  // ref gives us a direct handle to the THREE.Mesh object:
  const meshRef = useRef<Mesh>(null!);

  // useFrame callback — runs before each Three.js render, outside React's cycle:
  useFrame((state, delta) => {
    // delta = seconds since last frame. Using delta = frame-rate independent:
    // At 60fps: delta ≈ 0.016. At 30fps: delta ≈ 0.033.
    // Either way, rotation.y increases by 1 radian per second.
    meshRef.current.rotation.y += delta;

    // We could also use state.clock.elapsedTime for absolute-time animations:
    // meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <RotatingBox />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** A lit, rotating orange cube.

**Open React DevTools Profiler:**
1. Click Record
2. Watch the animation for 2 seconds
3. Stop recording

**Expected:** No React re-renders during the animation. The profiler shows no component
re-rendering. The cube is rotating, but React doesn't know about it — Three.js is mutating
directly.

**Change something:** Replace `useFrame` with a `useState` approach:

```tsx
const [rotY, setRotY] = useState(0);
useEffect(() => {
  const id = setInterval(() => setRotY(r => r + 0.016), 16);
  return () => clearInterval(id);
}, []);
// And pass: <mesh rotation-y={rotY}>
```

Record the profiler again. **Expected:** Now you see constant React re-renders during
animation. The profiler shows the component re-rendering at 60fps. This is the performance
cost of using state for animation.

Switch back to `useRef` + `useFrame`.

---

## 🎯 Challenge: Add a Hover Scale Effect

**You know:** `useRef`, `useFrame`, R3F props.

**The mechanism to understand:**

`onPointerOver` and `onPointerOut` are R3F event props that fire when the mouse pointer
enters and leaves the mesh's bounding area. They use R3F's raycasting internally.

You cannot smoothly animate with `setState` (too many re-renders), but `useFrame` with
a target scale + lerp gives smooth animation without re-renders.

**Task:** Make the box grow to 1.5× scale when hovered and shrink back when the mouse leaves.
Use `useState` ONLY for the hover boolean (rare state change — acceptable).
Use `useFrame` + lerp for the smooth scale animation.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
function HoverBox() {
  const ref      = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    // Lerp toward target scale — smooth without triggering re-renders per frame:
    const target = hovered ? 1.5 : 1.0;
    ref.current.scale.x += (target - ref.current.scale.x) * Math.min(1, delta * 8);
    ref.current.scale.y = ref.current.scale.z = ref.current.scale.x;
    // Rotation continues regardless of hover:
    ref.current.rotation.y += delta;
  });

  return (
    <mesh
      ref={ref}
      onPointerOver={() => setHovered(true)}   // fires on mouse enter
      onPointerOut={()  => setHovered(false)}  // fires on mouse leave
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
```

**Key insight:** `setHovered` causes ONE re-render when hover state changes (acceptable —
this happens once per hover event). The `useFrame` lerp runs every frame without re-renders.
This pattern — rare state + per-frame ref mutation — is the R3F performance pattern.

</details>

---

## Final Check

| JSX | What R3F Does | Three.js Operation |
|---|---|---|
| `<mesh>` | Creates and adds to scene | `new THREE.Mesh(); scene.add(mesh)` |
| `position={[1,2,3]}` | Calls .set() | `mesh.position.set(1,2,3)` |
| `visible={false}` | Direct assignment | `mesh.visible = false` |
| `rotation-y={PI/4}` | Nested property | `mesh.rotation.y = PI/4` |
| `args={[1,1,1]}` | Constructor args | `new THREE.BoxGeometry(1,1,1)` |
| `ref={meshRef}` | Stores Three.js object | `meshRef.current = mesh` |

---

## Quick Check Answers

**1. `position={[0,1,0]}` — what exact Three.js method call?**

`mesh.position.set(0, 1, 0)`. R3F checks if the target property (`.position`) has a
`.set()` method. `THREE.Vector3` has `.set(x,y,z)`. When R3F sees an array prop for
a property that has `.set()`, it calls `.set()` with the array elements. This is safer
than `mesh.position = [0,1,0]` which would replace the Vector3 with an array.

**2. `args={[2,1,0.5]}` — what happens to the array?**

It is spread as constructor arguments: `new THREE.BoxGeometry(2, 1, 0.5)`. The geometry
is created when the component first renders and the element is mounted into the scene.
If `args` changes, R3F creates a new geometry (disposes the old one) — changing `args` at
runtime is valid but causes garbage collection.

**3. `setState` 60 times/second for rotation — what happens to the component tree?**

React re-renders the component 60 times per second. React's reconciliation algorithm
runs 60 times, diffing the virtual DOM. All child components of the animated component
are checked for re-renders too (they may be memoised, but checking costs time). At 60fps
with many animated objects, this becomes the performance bottleneck. `useRef` + `useFrame`
bypasses React entirely — Three.js mutates directly, zero reconciliation overhead.
