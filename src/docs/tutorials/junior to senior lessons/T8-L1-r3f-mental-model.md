# Junior to Senior — T8·L1 — The R3F Mental Model

**Prerequisites:** T7·L7 (Perspective vs Orthographic). You understand 3D math.
This lesson starts Topic 8 by explaining how React Three Fiber (R3F) works — the
reconciler that bridges React's declarative model with Three.js's imperative API.

**What this lab adds:**
- R3F reconciler: JSX → Three.js `new` calls
- Lowercase elements: `<mesh>`, `<boxGeometry>` are Three.js classes
- Props map to properties and methods: `position={[x,y,z]}` calls `mesh.position.set(...)`
- `args={[]}` — the constructor arguments array
- `<Canvas>`: creates the WebGL context, renderer, and scene

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In Three.js (imperative), you create a box with `new THREE.BoxGeometry(1, 1, 1)`.
>    What is the R3F equivalent JSX?
> 2. `<mesh rotation-y={Math.PI / 4}>` — what Three.js property does this set?
> 3. A component calls `useState` and `useFrame`. The state changes every frame.
>    Why is this bad?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A rotating coloured cube in a Three.js scene, declared entirely in JSX:

```tsx
<Canvas>
  <ambientLight intensity={0.5} />
  <directionalLight position={[5, 5, 5]} />
  <mesh rotation-y={rotation}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

---

### Concept: The R3F Reconciler

**Three.js (imperative):**

```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 'orange' });
const mesh     = new THREE.Mesh(geometry, material);
mesh.position.set(0, 1, 0);
scene.add(mesh);
```

**R3F (declarative JSX):**

```tsx
<mesh position={[0, 1, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="orange" />
</mesh>
```

R3F's reconciler translates JSX into Three.js calls automatically:
- `<mesh>` → `new THREE.Mesh()`; `scene.add(mesh)`
- `<boxGeometry args={[1, 1, 1]}>` → `new THREE.BoxGeometry(1, 1, 1)`; attached as `mesh.geometry`
- `<meshStandardMaterial color="orange">` → `new THREE.MeshStandardMaterial({ color: 'orange' })`; attached as `mesh.material`
- `position={[0, 1, 0]}` → `mesh.position.set(0, 1, 0)` (arrays are spread)

---

### Concept: Prop Mapping

**How props map to Three.js:**

```tsx
// Array props → .set() call:
<mesh position={[0, 1, 0]} />        // mesh.position.set(0, 1, 0)
<mesh rotation={[0, Math.PI/4, 0]} /> // mesh.rotation.set(0, PI/4, 0)

// Scalar props → direct assignment:
<mesh visible={false} />             // mesh.visible = false

// Dash notation for nested properties:
<mesh rotation-y={Math.PI / 4} />    // mesh.rotation.y = PI/4
<mesh position-x={5} />              // mesh.position.x = 5

// args → constructor arguments:
<boxGeometry args={[2, 1, 0.5]} />   // new THREE.BoxGeometry(2, 1, 0.5)

// attach → explicit parent property:
<ambientLight attach="children-0" /> // scene.children[0] = light (rare — usually automatic)
```

---

### Concept: `useFrame` — Animation Without State

**The problem:** Updating rotation in `useState` causes a re-render every frame (60 fps).
Each re-render reconciles the React tree — expensive for animation.

**The solution:** `useFrame` runs every animation frame and lets you mutate Three.js
objects directly (through a `ref`) — bypassing React's re-render cycle entirely.

```tsx
import { useRef }  from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

function RotatingBox() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state, delta) => {
    // Mutate the Three.js object directly — NO setState, NO re-render:
    meshRef.current.rotation.y += delta;  // delta = seconds since last frame
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

**`delta`:** The time in seconds since the last frame. Always use `delta` to make
animations frame-rate independent: `rotation += delta` rotates at 1 radian/second
regardless of whether the frame rate is 30fps or 120fps.

---

## Step 1 — Set Up R3F

```bash
npm create vite@latest 3d-viewer -- --template react-ts
cd 3d-viewer
npm install
npm install @react-three/fiber three
npm install -D @types/three
```

Create `src/components/Scene.tsx`:

```tsx
import { Canvas }   from '@react-three/fiber';
import { RotatingBox } from './RotatingBox';

export function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <RotatingBox position={[0, 0, 0]} color="orange" />
        <RotatingBox position={[2, 0, 0]} color="cyan" speed={0.5} />
      </Canvas>
    </div>
  );
}
```

Create `src/components/RotatingBox.tsx`:

```tsx
import { useRef }   from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface RotatingBoxProps {
  position?: [number, number, number];
  color?:    string;
  speed?:    number;
}

export function RotatingBox({
  position = [0, 0, 0],
  color    = 'white',
  speed    = 1,
}: RotatingBoxProps) {
  const ref = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 0.7;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

Update `src/App.tsx`:

```tsx
import { Scene } from './components/Scene';
export default function App() { return <Scene />; }
```

### SAVE AND TRY

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: two rotating cubes — one orange, one cyan.
The cyan cube rotates at half the speed.

**Change something:** Add `wireframe` to the material:
```tsx
<meshStandardMaterial color={color} wireframe />
```

The cubes now show as wireframes. Remove it and they are solid again.

---

## Step 2 — Observe the JSX-to-Three.js Mapping

```tsx
// Add this temporarily to understand what's happening:
import { useThree } from '@react-three/fiber';

function Debugger() {
  const { scene, camera, gl } = useThree();
  console.log('Scene children:', scene.children.length);
  console.log('Camera position:', camera.position);
  console.log('GL renderer:', gl.getParameter(gl.VERSION));
  return null;  // renders nothing
}

// Add to Canvas:
<Canvas>
  <Debugger />
  {/* ... */}
</Canvas>
```

**Run and check the console.** You'll see that R3F has created real Three.js
objects — the scene graph is a real Three.js scene, accessible via `useThree`.

---

## 🎯 Challenge: Add a Hover Effect

**You know:** `useFrame`, `useRef`, R3F props.

**Task:** Add a hover effect to the rotating box:
- When the pointer hovers over the box, it grows to 1.5× its normal scale
- When the pointer leaves, it returns to 1× scale
- Use R3F's `onPointerOver` and `onPointerOut` events

Write the component with the hover effect. You do not need unit tests for this —
visual verification is sufficient.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useRef, useState } from 'react';
import { useFrame }         from '@react-three/fiber';
import type { Mesh }         from 'three';

export function HoverBox({ position = [0, 0, 0] as [number, number, number] }) {
  const ref     = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta;

    // Smoothly scale toward target (lerp):
    const target = hovered ? 1.5 : 1.0;
    ref.current.scale.x += (target - ref.current.scale.x) * 0.1;
    ref.current.scale.y = ref.current.scale.z = ref.current.scale.x;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={()  => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
```

**Key insight:** `useState` for hover is acceptable here because hover state changes
are user-driven (rare), not per-frame. The smooth scaling uses `useFrame` with a
lerp formula (10% of the way to target per frame) rather than `setState` for every
frame — the scale value lives in Three.js, not in React state.

</details>

---

## Final Check

| R3F concept | Three.js equivalent |
|---|---|
| `<mesh>` | `new THREE.Mesh()` + `scene.add()` |
| `args={[1,1,1]}` | `new THREE.BoxGeometry(1, 1, 1)` |
| `position={[0,1,0]}` | `mesh.position.set(0, 1, 0)` |
| `rotation-y={PI/4}` | `mesh.rotation.y = PI/4` |
| `useFrame` | `renderer.setAnimationLoop` callback |
| `useRef<Mesh>` | Direct Three.js object reference |
| `useThree` | Access to `scene`, `camera`, `gl` |

---

## Quick Check Answers

**1. `new THREE.BoxGeometry(1, 1, 1)` in R3F?**

`<boxGeometry args={[1, 1, 1]} />`. The element name `boxGeometry` maps to
`THREE.BoxGeometry`. The `args` array is spread as constructor arguments:
`new THREE.BoxGeometry(...args)`. When nested inside a `<mesh>`, R3F automatically
attaches it as `mesh.geometry`.

**2. `<mesh rotation-y={Math.PI / 4}>` — what does this set?**

`mesh.rotation.y = Math.PI / 4`. The dash notation accesses nested properties.
`rotation-y` maps to `mesh.rotation.y`. `position-x` maps to `mesh.position.x`.
This is more specific than `rotation={[0, PI/4, 0]}` which calls `.set()` on the
entire rotation.

**3. `useState` changes every frame. Why is this bad?**

Each `setState` call triggers React's reconciliation — the entire component tree
is diffed, the virtual DOM is compared, and the real DOM is updated. At 60fps, this
means 60 reconciliation cycles per second — expensive. For per-frame values (rotation,
camera position, particle positions), use refs and mutate Three.js objects directly
in `useFrame`. Only use `useState` for values that change as a result of user actions
(hover, selection) — not for continuous animation.
