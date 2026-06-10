# Junior to Senior — T8·L6 — R3F Performance Patterns

**Prerequisites:** T8·L5 (Pointer Events). You can build interactive 3D scenes.
This lesson explains WHY draw calls are expensive, HOW instanced rendering batches
them into one, and WHAT exactly happens when you call `needsUpdate = true` on a
buffer attribute.

**What this lab adds:**
- What a draw call is — the specific CPU-GPU boundary crossing that costs time
- How `instancedMesh` works — one draw call, N transform matrices, N objects
- Why `needsUpdate = true` on instanceMatrix causes a GPU re-upload
- The concrete timing difference between 1,000 meshes and 1 instanced mesh
- When `dispose()` is NOT needed (R3F primitives) vs when it IS (manual `new THREE.X()`)

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have 1,000 separate `<mesh>` components. Each frame, Three.js calls the
>    GPU 1,000 times to draw them. What is the bottleneck — GPU speed or something else?
> 2. `instancedMesh.setMatrixAt(i, matrix)` followed by
>    `instancedMesh.instanceMatrix.needsUpdate = true`. What does `needsUpdate = true`
>    actually trigger? What is the GPU upload?
> 3. You create `const geo = new THREE.SphereGeometry()` in a `useMemo`. The component
>    unmounts. R3F calls `dispose()` automatically. True or false?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Measure the Draw Call Problem

Create 100 separate sphere meshes and measure the frame rate:

```tsx
// src/App.tsx — the slow version first
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';

function SlowCloud() {
  return (
    <>
      {Array.from({ length: 1000 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}
    </>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Stats />   {/* FPS display from Drei */}
        <OrbitControls />
        <SlowCloud />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** `Stats` shows a low FPS (possibly 30fps or lower). The 1,000 meshes
cause 1,000+ draw calls per frame.

**In the browser — open the GPU profiler:**

DevTools → Performance → record a few seconds. Look for `Three.js:` entries in the
GPU track or check the WebGL calls in the frame.

---

### Concept: What a Draw Call Is and Why 1,000 Is Too Many

**What it is:** A draw call is the command the CPU sends to the GPU to draw one piece
of geometry. It includes: which vertex buffer to use, which shader program to run,
what uniforms (model matrix, material properties) to send.

**The cost structure:**

```
GPU processing of vertices:     very fast (parallel, hardware optimised)
CPU-to-GPU command overhead:    significant (each call crosses a software boundary)

1,000 meshes × (1 draw call setup + 1 GPU dispatch) per frame:
= 1,000 command boundary crossings per frame
= ~10ms overhead on typical hardware at 60fps
= NOT enough time for 60fps (16ms budget total)
```

**The GPU is NOT the bottleneck.** The CPU overhead of issuing 1,000 separate commands
is the bottleneck. The GPU can process millions of triangles — but it needs the commands
to be batched efficiently.

**The solution:** Send all 1,000 objects in ONE draw call using instancing.

**You will see this again in:**
- Every game engine's "batching" documentation
- Web: `gl.drawArraysInstanced()` is the WebGL API behind instancedMesh
- Unity: `Graphics.DrawMeshInstanced()` is the Unity equivalent
- The Godot/Unreal equivalents all solve the same problem

---

## Step 2 — Replace With Instanced Mesh

```tsx
// src/App.tsx — the fast version
import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame }           from '@react-three/fiber';
import { Stats, OrbitControls }       from '@react-three/drei';
import * as THREE                     from 'three';

function FastCloud() {
  const COUNT = 1000;
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Generate random positions ONCE (useMemo):
  const positions = useMemo(
    () => Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
    })),
    []  // never regenerated
  );

  // Set all instance matrices ONCE after mount:
  useEffect(() => {
    const matrix = new THREE.Matrix4();
    positions.forEach((pos, i) => {
      // Matrix4 encodes the transform for instance i:
      matrix.setPosition(pos.x, pos.y, pos.z);
      meshRef.current.setMatrixAt(i, matrix);
      // setMatrixAt writes to instancedMesh.instanceMatrix — a BufferAttribute
    });
    // Tell Three.js to upload the matrix buffer to the GPU:
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    // args = [geometry, material, instanceCount] — all three set at creation:
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, COUNT]}
      //    ^geometry    ^material  ^count
      //    Both undefined here — set as children below
    >
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Stats />
        <OrbitControls />
        <FastCloud />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** `Stats` shows 60fps (or close to it). The 1,000 spheres now render
in ONE draw call instead of 1,000.

**Change something:** Change `COUNT` back to 1,000 with separate meshes (the SlowCloud version).
Compare the FPS. Then switch to FastCloud with the same 1,000. The difference is the
instancing optimisation.

---

### Concept: How `instanceMatrix` and `needsUpdate` Work

**What it is:** An `instancedMesh` stores one 4×4 transform matrix per instance in a
`Float32Array` on the CPU. This array is a `BufferAttribute` called `instanceMatrix`.

**The mechanism — what `setMatrixAt` and `needsUpdate` do:**

```
instancedMesh.instanceMatrix = new BufferAttribute(Float32Array(N * 16), 16)
                                    ↑ one 4×4 matrix = 16 floats per instance

setMatrixAt(i, matrix):
  → writes matrix.elements to instanceMatrix.array[i * 16 ... i * 16 + 15]
  → nothing is sent to the GPU yet

instanceMatrix.needsUpdate = true:
  → before the next render, Three.js calls gl.bufferSubData() to upload the array
  → the GPU now has the new matrix data
  → all N instances will use the new matrices in the vertex shader
```

**Why you must set `needsUpdate = true`:**

Three.js caches the buffer data. Without `needsUpdate = true`, it assumes the data
hasn't changed and skips the upload. You explicitly tell it "I changed the data, re-upload it."

**The cost of `needsUpdate = true`:**

Uploading N × 16 floats to the GPU. For 1,000 instances: 1,000 × 16 × 4 bytes = 64KB
per frame. This is fast (microseconds), but you should only do it when the data actually changed.

---

## Step 3 — Animate the Cloud With `needsUpdate`

```tsx
function AnimatedCloud() {
  const COUNT   = 1000;
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const positions = useMemo(
    () => Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: 0,   // start at y=0
      z: (Math.random() - 0.5) * 20,
      phase: Math.random() * Math.PI * 2,  // random phase for wave
    })),
    []
  );

  const matrix = useMemo(() => new THREE.Matrix4(), []);  // reuse one matrix

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    positions.forEach((pos, i) => {
      // Each particle bobs up and down at its own phase:
      const y = Math.sin(t * 1.5 + pos.phase) * 2;
      matrix.setPosition(pos.x, y, pos.z);
      meshRef.current.setMatrixAt(i, matrix);
    });

    // Re-upload to GPU because positions changed:
    meshRef.current.instanceMatrix.needsUpdate = true;
    // Without this line: no animation — GPU uses stale data
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="cyan" />
    </instancedMesh>
  );
}
```

### SAVE AND TRY

Replace `FastCloud` with `AnimatedCloud` in App.tsx.

```bash
npm run dev
```

**You should see:** 1,000 cyan spheres bobbing at different phases — all still in one draw call.

**Change something:** Comment out `meshRef.current.instanceMatrix.needsUpdate = true`.
Expected: animation STOPS — the spheres freeze. The matrix data is updated in the CPU array,
but the GPU never receives the new data. Uncomment it and the animation resumes.

---

### Concept: When to Call `dispose()` — What R3F Does Automatically

**The rule:**

| Created with | `dispose()` called by |
|---|---|
| `<boxGeometry>` (R3F primitive) | R3F automatically on unmount |
| `<meshStandardMaterial>` (R3F primitive) | R3F automatically on unmount |
| `new THREE.BoxGeometry()` in useMemo | YOU must call in useEffect cleanup |
| `new THREE.MeshStandardMaterial()` in useMemo | YOU must call in useEffect cleanup |

**R3F tracks its own created objects.** When `<boxGeometry>` unmounts, R3F calls
`geometry.dispose()`. But when you call `new THREE.BoxGeometry()` yourself, R3F
doesn't know about it — you must dispose it yourself.

```tsx
// CORRECT — manual geometry disposal:
function ManualGeometry() {
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useEffect(() => {
    return () => {
      geo.dispose();   // ← GPU buffer freed on unmount
    };
  }, [geo]);

  return <mesh geometry={geo}><meshBasicMaterial /></mesh>;
}

// ALSO CORRECT — using R3F primitives (auto-disposed):
function AutoGeometry() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />   {/* R3F disposes on unmount */}
      <meshBasicMaterial />
    </mesh>
  );
}
```

---

## 🎯 Challenge: Geometry LOD (Level of Detail)

**You know:** `instancedMesh`, `useFrame`, `useMemo`.

**The mechanism to understand:**

LOD (Level of Detail) renders simpler geometry for distant objects:
- Near (< 5 units): 32 segments sphere
- Mid (5-20 units): 8 segments sphere
- Far (> 20 units): 4 segments sphere

This reduces vertex count for distant objects where the simplification is not visible.

**Task:** Build three `instancedMesh` components (one per LOD level) and assign
particles to the appropriate mesh based on their distance from the camera.

Use `useFrame` with `camera.position.distanceTo(particlePosition)` to classify each
particle. Toggle the LOD levels by changing which mesh receives each particle.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
function LODCloud() {
  const COUNT = 500;
  const nearRef = useRef<THREE.InstancedMesh>(null!);
  const midRef  = useRef<THREE.InstancedMesh>(null!);
  const farRef  = useRef<THREE.InstancedMesh>(null!);

  const positions = useMemo(
    () => Array.from({ length: COUNT }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40,
    )),
    []
  );

  const matrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ camera }) => {
    // Reset counts:
    let nearCount = 0, midCount = 0, farCount = 0;

    positions.forEach(pos => {
      const dist = camera.position.distanceTo(pos);
      matrix.setPosition(pos.x, pos.y, pos.z);

      if (dist < 5) {
        nearRef.current.setMatrixAt(nearCount++, matrix);
      } else if (dist < 20) {
        midRef.current.setMatrixAt(midCount++, matrix);
      } else {
        farRef.current.setMatrixAt(farCount++, matrix);
      }
    });

    // Update counts and buffers:
    nearRef.current.count = nearCount;
    midRef.current.count  = midCount;
    farRef.current.count  = farCount;

    nearRef.current.instanceMatrix.needsUpdate = true;
    midRef.current.instanceMatrix.needsUpdate  = true;
    farRef.current.instanceMatrix.needsUpdate  = true;
  });

  return (
    <>
      <instancedMesh ref={nearRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="lime" />
      </instancedMesh>
      <instancedMesh ref={midRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="cyan" />
      </instancedMesh>
      <instancedMesh ref={farRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshBasicMaterial color="white" />
      </instancedMesh>
    </>
  );
}
```

**Key insight:** Setting `instancedMesh.count = n` tells Three.js to only render
`n` instances from the buffer, even though the buffer has space for more. This is
how you "remove" instances without reallocating the buffer — change the count.
LOD swaps particles between meshes each frame based on distance.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Draw call difference | Stats: 1,000 meshes → low FPS; 1 instancedMesh → 60fps |
| `needsUpdate = true` required | Comment it out; animation stops |
| Matrix upload is per-change | `needsUpdate` only when data changed |
| Auto-dispose | R3F primitives: no cleanup needed. `new THREE.X()`: need `dispose()` |

---

## Quick Check Answers

**1. 1,000 meshes per frame — bottleneck is not GPU speed?**

Correct. The bottleneck is the CPU overhead of issuing 1,000 separate draw commands.
Each command crosses from the JavaScript/browser layer to the native GPU driver —
a relatively expensive operation. The GPU itself could handle far more geometry in one
go. Instancing batches all 1,000 objects into one command, removing the 1,000x
command overhead while letting the GPU process them in parallel.

**2. `setMatrixAt` + `needsUpdate = true` — what is the GPU upload?**

`setMatrixAt(i, matrix)` writes 16 floats to the CPU-side `Float32Array` (at offset
`i * 16`). Nothing is sent to the GPU yet. `needsUpdate = true` sets a flag on the
`BufferAttribute`. Before the next render, Three.js calls `gl.bufferSubData(target, offset, data)`
to upload the entire matrix buffer from CPU RAM to GPU VRAM. This is what "uploading"
means — copying bytes from the CPU's memory space to the GPU's memory space.

**3. `useMemo` geometry — R3F auto-disposes on unmount?**

False. R3F only automatically disposes objects it created (R3F primitives like `<boxGeometry>`).
When you call `new THREE.SphereGeometry()` yourself, R3F has no record of it and will not
dispose it. You must call `geo.dispose()` in a `useEffect` cleanup function when the
component unmounts.
