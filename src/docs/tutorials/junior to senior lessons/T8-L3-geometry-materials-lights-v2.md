# Junior to Senior — T8·L3 — Geometry, Materials, and Lights

**Prerequisites:** T8·L2 (`useFrame` and `useThree`). You can animate without re-renders.
This lesson explains WHY `MeshBasicMaterial` ignores lights, HOW `MeshStandardMaterial`
uses the PBR lighting model, and WHAT happens to GPU memory when you create a geometry
inside a component body without `useMemo`.

**What this lab adds:**
- Why `MeshBasicMaterial` always looks flat — it skips the lighting calculation entirely
- How PBR (Physically Based Rendering) works — `metalness` and `roughness` explained
- Why creating geometry in a component body without `useMemo` causes GPU memory leaks
- How `BufferGeometry` works — what a Float32Array of positions actually is
- Why `ambientLight` makes everything flat and `directionalLight` adds shape

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `<meshBasicMaterial color="red" />` — there are no lights in the scene.
>    What colour does the mesh appear? What if you add an `<ambientLight>`?
> 2. A geometry is created inside a component body: `const geo = new THREE.BoxGeometry()`.
>    The parent component re-renders 100 times. How many BoxGeometry objects are created?
>    Are they cleaned up?
> 3. `<ambientLight intensity={1} />` is the only light. What does a sphere look like —
>    can you tell it's a sphere?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See the Material Difference

First, observe what happens with no lights — two materials side by side:

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        {/* No lights — intentionally */}

        {/* MeshBasicMaterial — ignores all lighting */}
        <mesh position={[-1.5, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial color="orange" />
        </mesh>

        {/* MeshStandardMaterial — requires light to see anything */}
        <mesh position={[1.5, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** Left sphere: orange and visible. Right sphere: black (completely dark).

This is the core difference: `MeshBasicMaterial` has a colour that is always displayed
at full brightness regardless of lights. `MeshStandardMaterial` participates in the
lighting calculation — with no lights, it receives zero light, so it renders black.

**Change something:** Add `<ambientLight intensity={1} />` inside Canvas.
Expected: BOTH spheres are now orange. But neither has any shading — both look like
flat circles. The ambient light fills everything equally, so there are no shadows or
highlights.

---

### Concept: Why `MeshBasicMaterial` Is Flat

**The mechanism — what the fragment shader does for each material:**

For `MeshBasicMaterial`:
```glsl
// GPU fragment shader (simplified):
gl_FragColor = vec4(color, 1.0);   // just the colour — lights ignored
```

For `MeshStandardMaterial`:
```glsl
// GPU fragment shader (simplified):
vec3 diffuse = color * dot(normal, lightDirection) * lightIntensity;
vec3 specular = ... // specular highlight calculation
gl_FragColor = vec4(diffuse + specular + ambient, 1.0);
```

The standard material computes how much light hits each point on the surface using
the dot product of the surface normal and the light direction (which you learned in T7-L2).
The basic material skips this calculation entirely.

**When to use `MeshBasicMaterial`:**
- Grid lines (always need to be visible regardless of lighting)
- UI overlays in 3D space (always full brightness)
- Debug visualisations
- Wireframes

**When to use `MeshStandardMaterial`:**
- Any real object that should look 3D
- Whenever metalness, roughness, or environmental reflections matter

**You will see this again in:**
- Three.js has 15+ material types: Lambert, Phong, Standard, Physical, Toon, etc.
- All real-world 3D applications use PBR materials (Standard or Physical)
- The difference is always: does the material respond to lights or not?

---

### Concept: PBR — What `metalness` and `roughness` Mean

**What it is:** PBR (Physically Based Rendering) materials use two parameters
to describe any real-world surface:

**`metalness` (0 to 1):**
- 0 = dielectric (plastic, wood, paint) — light scatters diffusely
- 1 = metal (gold, copper, chrome) — light reflects specularly

**`roughness` (0 to 1):**
- 0 = mirror-smooth — tight specular highlights
- 1 = rough — diffuse, no highlights

```tsx
<meshStandardMaterial metalness={0.9} roughness={0.1} color="#c0c0c0" />
// → polished metal (silver-like)

<meshStandardMaterial metalness={0} roughness={0.9} color="peru" />
// → matte surface (wood-like)

<meshStandardMaterial metalness={0} roughness={0} color="white" />
// → glass-like (perfectly smooth, non-metal)
```

**These values match reality:** Real-world measurement of materials gives metalness
and roughness values. Gold: metalness=1, roughness=0.3, color=(1,0.76,0.33).
Concrete: metalness=0, roughness=0.9, color=(0.5,0.5,0.5).

---

## Step 2 — See the PBR Difference

Update App.tsx to show four spheres with different PBR values, all lit with a directional light:

```tsx
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        {/* Matte plastic */}
        <mesh position={[-3, 0, 0]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color="royalblue" metalness={0} roughness={0.9} />
        </mesh>

        {/* Shiny plastic */}
        <mesh position={[-1, 0, 0]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color="royalblue" metalness={0} roughness={0.1} />
        </mesh>

        {/* Rough metal */}
        <mesh position={[1, 0, 0]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color="#b87333" metalness={1} roughness={0.7} />
        </mesh>

        {/* Polished metal */}
        <mesh position={[3, 0, 0]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color="#b87333" metalness={1} roughness={0.0} />
        </mesh>
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

**You should see:** Four spheres showing the progression from matte to polished and
plastic to metal. The rightmost sphere should show a tight specular highlight.

**Change something:** Remove the `<directionalLight>`. Expected: all spheres become
flat (only ambient). Add it back — the shape is revealed by the directional light's
shadows and highlights.

---

### Concept: Why `useMemo` Is Required for Custom Geometry

**The problem — creating geometry in a component body:**

```tsx
function BadGeometry() {
  // THIS RUNS ON EVERY RENDER:
  const geometry = new THREE.BufferGeometry();  // ← creates a new GPU buffer EACH RENDER
  const vertices = new Float32Array([...]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  // When the component re-renders (parent state change, etc.):
  // → old geometry is no longer referenced by React
  // → JavaScript GC will eventually free the JS object
  // → BUT the GPU buffer (allocated via WebGL) is NOT freed until geometry.dispose() is called
  // → geometry.dispose() is never called → GPU memory leak

  return <primitive object={geometry} />;
}
```

**The solution — `useMemo` creates geometry once:**

```tsx
function GoodGeometry() {
  const geometry = useMemo(() => {
    // This function runs ONCE when the component first mounts:
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([...]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geo;
  }, []);  // empty deps = never recreate

  // Cleanup when component unmounts:
  useEffect(() => {
    return () => geometry.dispose();  // frees the GPU buffer
  }, [geometry]);

  return <primitive object={geometry} />;
}
```

**What R3F does for built-in geometries:** `<boxGeometry>`, `<sphereGeometry>`, etc.
are automatically disposed when the component unmounts. You only need manual `dispose`
for geometries you create yourself with `new THREE.BufferGeometry()`.

**You will see this again in:**
- Any Three.js tutorial: "remember to call dispose()" — R3F automates this for built-ins
- Performance-sensitive applications: GPU memory leaks can cause slowdowns and crashes
- The `useFrame` hook for disposing: if you create geometry in `useFrame`, dispose it when done

---

## Step 3 — Build a Custom Line Geometry

Create a custom geometry that draws a hexagon outline:

```tsx
// src/components/Hexagon.tsx
import { useMemo, useEffect } from 'react';
import * as THREE             from 'three';

export function Hexagon({ radius = 1, color = 'cyan' }: { radius?: number; color?: string }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // 7 points: the 6 hexagon corners + closing point (= point 0 again):
    const vertices: number[] = [];
    for (let i = 0; i <= 6; i++) {
      const angle = (i / 6) * Math.PI * 2;  // 0, 60°, 120°, ..., 360°
      vertices.push(
        Math.cos(angle) * radius,  // x
        Math.sin(angle) * radius,  // y
        0,                          // z (flat in XY plane)
      );
    }

    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
      //                                                      ↑ 3 floats per vertex (x,y,z)
    );

    return geo;
  }, [radius]);  // recreate only when radius changes

  // Dispose the GPU buffer when the component unmounts:
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    // <line> = THREE.Line — draws connected vertices:
    <line geometry={geometry}>
      <lineBasicMaterial color={color} />
    </line>
  );
}
```

### SAVE AND TRY

Add `<Hexagon />` to the scene in App.tsx and run the app.

**You should see:** A cyan hexagon outline in the 3D scene.

**In the browser console, verify no geometry recreation:**

Add `console.log('geometry created')` inside the `useMemo` body. The parent component
should be able to re-render (change some state) without the geometry being recreated.

---

## 🎯 Challenge: Build an Animated Polygon

**You know:** Custom `BufferGeometry`, `useMemo`, `useFrame`.

**The mechanism to understand:**

To animate the geometry (change vertex positions each frame), you update the
`BufferAttribute` and set `needsUpdate = true`. This tells Three.js to re-upload
the vertex data to the GPU.

**Task:** Build `PulsatingCircle({ segments: number })` that draws a circle outline
where the radius oscillates using `Math.sin(elapsedTime)`.

You will need to update the geometry vertices each frame using `useFrame`.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useMemo, useEffect, useRef } from 'react';
import { useFrame }                    from '@react-three/fiber';
import * as THREE                      from 'three';

export function PulsatingCircle({ segments = 64 }: { segments?: number }) {
  const geometryRef = useRef<THREE.BufferGeometry>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // n+1 vertices: n segments + closing vertex
    const verts = new Float32Array((segments + 1) * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geo;
  }, [segments]);

  useEffect(() => {
    geometryRef.current = geometry;
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!geometryRef.current) return;

    const positions = geometryRef.current.attributes.position as THREE.BufferAttribute;
    const radius    = 1 + 0.3 * Math.sin(clock.elapsedTime * 2);  // oscillates 0.7→1.3

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.setXYZ(i, Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }

    // Tell Three.js the vertex data changed — re-upload to GPU:
    positions.needsUpdate = true;
  });

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="lime" />
    </line>
  );
}
```

**Key insight:** `needsUpdate = true` on the BufferAttribute tells Three.js to upload
the new vertex data to the GPU before the next render. Without it, Three.js uses the
cached data and the animation doesn't appear. Setting `needsUpdate = true` has a cost
(GPU upload) — only do it when the data actually changed.

</details>

---

## Final Check

| Material | Needs lights | Shows shape | Use for |
|---|---|---|---|
| `MeshBasicMaterial` | No | No | Lines, overlays, wireframes |
| `MeshStandardMaterial` | Yes | Yes | All real 3D objects |
| `LineBasicMaterial` | No | N/A | Line geometry |

---

## Quick Check Answers

**1. `MeshBasicMaterial`, no lights. What colour? Does adding `ambientLight` change it?**

Orange (the material colour) regardless of any lights — basic material ignores the
entire lighting calculation. Adding `ambientLight` does NOT change it — ambient light
only affects standard/lambert/phong materials. Basic material always renders at full
colour brightness.

**2. Geometry in component body, 100 re-renders. How many geometries created? Cleaned up?**

100 geometries are created — one per render. The JavaScript objects are garbage-collected
eventually, but the GPU buffers they reference are NOT freed until `.dispose()` is called.
`.dispose()` is never called on the old geometries. Over 100 renders, 99 GPU buffers leak.
With `useMemo`, 1 geometry is created and reused for all 100 renders.

**3. `ambientLight` only. Can you tell a sphere is a sphere?**

No — it looks like a flat circle. Ambient light illuminates every point on the sphere
equally, regardless of the surface normal direction. The dot product of the normal with
the light direction (which creates shading) is not part of the ambient calculation.
Without shading variation across the surface, there are no visual cues for depth or curvature.
