# Junior to Senior — T8·L6 — R3F Performance Patterns

**Prerequisites:** T8·L5 (Pointer Events). You can build interactive 3D scenes.
This lesson covers performance — the techniques needed when the scene grows from
a demo to a real CAD/CAM viewport with thousands of geometry items.

**What this lab adds:**
- `useMemo` for geometry and material — created once per lifecycle
- `instancedMesh` — rendering thousands of identical objects in one draw call
- `<Instances>` from Drei — the declarative API for instanced rendering
- `dispose()` in `useEffect` cleanup — releasing GPU memory
- Draw calls and why fewer is better

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You render 1,000 identical bolts. Each is a separate `<mesh>`. How many
>    draw calls is this? What is the instanced equivalent?
> 2. A component mounts, creates a `BufferGeometry`, then unmounts. The geometry
>    still exists on the GPU. What went wrong?
> 3. A geometry is created inside a component body (not `useMemo`). The parent
>    re-renders 10 times. How many geometries are created?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A scene with 1,000 geometry items that renders at 60fps using instancing:

```tsx
// 1,000 point markers using a single instanced mesh:
<PointCloud points={thousandPoints} />
// Renders in ONE draw call instead of 1,000
```

---

### Concept: Draw Calls

**What is a draw call?** Each time the CPU tells the GPU to draw geometry,
that is one draw call. GPUs are optimised for processing large batches of vertices,
but the per-call overhead is significant.

**The cost:**
- 100 draw calls: unnoticeable (~1ms overhead)
- 1,000 draw calls: starts to slow down (~10ms overhead)
- 10,000 draw calls: significant FPS drop on most hardware

**The rule:** Minimise the number of distinct draw calls. Group identical objects.

---

### Concept: Instanced Rendering

**What it is:** A single draw call that draws the same geometry many times, each
with a different transformation matrix (position, rotation, scale).

```tsx
import { useRef, useEffect, useMemo } from 'react';
import * as THREE                       from 'three';

function PointCloud({ positions }: { positions: THREE.Vector3[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Set instance matrices once (or when positions change):
  useEffect(() => {
    const matrix = new THREE.Matrix4();
    positions.forEach((pos, i) => {
      matrix.setPosition(pos);
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}  // [geo, mat, count]
    >
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
}
```

**Result:** 1,000 spheres in a single draw call.

---

### Concept: `dispose()` — Preventing GPU Memory Leaks

**The problem:** Three.js creates GPU resources (vertex buffers, textures) that
are not garbage-collected by JavaScript's GC. They must be explicitly freed.

```tsx
import { useEffect, useMemo } from 'react';
import * as THREE              from 'three';

function DisposedGeometry() {
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);

  // MUST dispose when component unmounts:
  useEffect(() => {
    return () => {
      geometry.dispose();     // frees GPU vertex buffer
    };
  }, [geometry]);

  return <mesh geometry={geometry}>...</mesh>;
}
```

**What needs disposing:**
- `geometry.dispose()` — vertex buffers
- `material.dispose()` — shader programs
- `texture.dispose()` — texture memory

**What does NOT need manual disposal:**
- Built-in R3F primitives (`<boxGeometry>`) are automatically disposed when the
  component unmounts (R3F handles this)
- Objects created imperatively inside `useMemo` DO need manual disposal

---

## Step 1 — Build the Performance Demo

Create `src/components/InstancedPoints.tsx`:

```tsx
import { useRef, useEffect, useMemo } from 'react';
import * as THREE                      from 'three';
import type { InstancedMesh }           from 'three';

interface InstancedPointsProps {
  count:      number;
  spread?:    number;
  pointSize?: number;
  color?:     string;
}

export function InstancedPoints({
  count     = 1000,
  spread    = 10,
  pointSize = 0.05,
  color     = 'white',
}: InstancedPointsProps) {
  const meshRef = useRef<InstancedMesh>(null!);

  // Generate random positions once:
  const positions = useMemo(
    () => Array.from({ length: count }, () => new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
    )),
    [count, spread]
  );

  // Set all instance matrices:
  useEffect(() => {
    const matrix = new THREE.Matrix4();
    positions.forEach((pos, i) => {
      matrix.setPosition(pos);
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[pointSize, 6, 6]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}
```

Create `src/components/PerformanceScene.tsx`:

```tsx
import { Canvas }          from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { InstancedPoints } from './InstancedPoints';

export function PerformanceScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <OrbitControls />
        <Stats />  {/* FPS counter and draw call stats */}

        {/* 5,000 points in ~5 draw calls (1,000 per mesh = 5 meshes): */}
        <InstancedPoints count={1000} color="white"   spread={20} />
        <InstancedPoints count={1000} color="cyan"    spread={15} />
        <InstancedPoints count={1000} color="magenta" spread={10} />
        <InstancedPoints count={1000} color="yellow"  spread={5}  pointSize={0.08} />
        <InstancedPoints count={1000} color="red"     spread={3}  pointSize={0.12} />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

Expected: 5,000 points at 60fps with only 5 draw calls.

**Change something:** Replace `<InstancedPoints count={1000}>` with 1,000 separate
`<mesh>` components. Expected: massive FPS drop. This demonstrates why instancing
is essential for dense point clouds, toolpaths, and geometry items in CAD/CAM.

---

## 🎯 Challenge: Animated Instanced Mesh

**You know:** `instancedMesh`, `useFrame`, `setMatrixAt`.

**Task:** Build `<FloatingPoints count={200}>` where each point bobs up and down
at a different frequency and phase, all using a single `instancedMesh`.

Algorithm in `useFrame`:
1. For each instance `i`, compute `y = sin(elapsedTime * freq[i] + phase[i]) * amplitude`
2. Update `matrix.setPosition(basePos[i].x, basePos[i].y + y, basePos[i].z)`
3. Set the matrix and mark `instanceMatrix.needsUpdate = true`

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useRef, useMemo, useEffect } from 'react';
import { useFrame }                    from '@react-three/fiber';
import * as THREE                      from 'three';

export function FloatingPoints({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const matrix  = useMemo(() => new THREE.Matrix4(), []);

  const data = useMemo(() => Array.from({ length: count }, () => ({
    base:  new THREE.Vector3((Math.random()-0.5)*20, 0, (Math.random()-0.5)*20),
    freq:  0.5 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    amp:   0.3 + Math.random() * 0.7,
  })), [count]);

  useEffect(() => {
    data.forEach(({ base }, i) => {
      matrix.setPosition(base);
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data, matrix]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    data.forEach(({ base, freq, phase, amp }, i) => {
      matrix.setPosition(base.x, base.y + Math.sin(t * freq + phase) * amp, base.z);
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="cyan" />
    </instancedMesh>
  );
}
```

**Key insight:** All 200 floating animations share a single `instancedMesh` —
still 1 draw call. `matrix.setPosition(...)` is fast; `needsUpdate = true` tells
the GPU to re-upload the instance matrices. The GPU processes all 200 transformations
in parallel.

</details>

---

## Final Check

| Pattern | Why |
|---|---|
| `useMemo` for geometry | Created once — not on every parent re-render |
| `useEffect` disposal | Frees GPU memory on unmount |
| `instancedMesh` for identical objects | 1000 objects → 1 draw call |
| `<Stats>` during development | Shows FPS and draw calls visually |
| `needsUpdate = true` | Signals GPU to re-upload changed data |

---

## Quick Check Answers

**1. 1,000 separate meshes vs instancedMesh — draw calls?**

1,000 separate meshes: 1,000 draw calls. Each mesh is a separate `THREE.Mesh`
object; the renderer issues one GPU draw call per mesh. With `instancedMesh`:
1 draw call (regardless of instance count). The GPU processes all 1,000 instances
in a single GPU invocation with different transformation matrices.

**2. `BufferGeometry` created in component, then component unmounts. GPU still has it. What went wrong?**

`geometry.dispose()` was never called. JavaScript garbage collects the JavaScript
object, but the GPU buffers (vertex buffers, index buffers) are independent resources
that must be explicitly freed. Without `dispose()`, the GPU accumulates orphaned
vertex data until the browser tab runs out of GPU memory. Fix: call `geometry.dispose()`
in a `useEffect` cleanup function.

**3. Geometry in component body (not `useMemo`), parent re-renders 10 times — how many geometries?**

10 geometries are created, and 9 are leaked. Each re-render calls the component
function, creating a new `BufferGeometry`. The old geometry is no longer referenced
by React (it's replaced by the new one) but the GPU buffers are never freed.
`useMemo` creates the geometry once and returns the same instance on re-renders.
