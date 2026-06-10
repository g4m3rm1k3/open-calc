# Junior to Senior — T8·L2 — `useFrame` and `useThree`

**Prerequisites:** T8·L1 (R3F Mental Model). You have a rotating cube. This
lesson goes deeper into the two most important R3F hooks — the animation loop
and the scene state accessor.

**What this lab adds:**
- `useFrame((state, delta) => ...)` — the animation loop callback
- `state.camera`, `state.scene`, `state.gl` — accessing core Three.js objects
- `state.clock.elapsedTime` — seconds since canvas was created
- `useThree()` — accessing the same state outside of `useFrame`
- Why `useState` in `useFrame` is expensive
- `useFrame` priority: running callbacks in order

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `useFrame` is called 60 times per second. Your callback takes 20ms. What happens?
> 2. `state.clock.elapsedTime` vs `delta` — when would you use each?
> 3. You need the camera's current position in a regular component (not inside
>    `useFrame`). Which hook do you use?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A scene with:
- An orbit indicator that shows the current camera distance
- A pulsing sphere that uses `elapsedTime` for a sine wave animation
- A debug overlay using `useThree` to read scene stats

---

### Concept: `useFrame` In Depth

**What it is:** R3F's per-frame callback. Runs after React's rendering but before
the Three.js render call. Ideal for:
- Animating Three.js object properties (rotation, position, scale)
- Updating physics, particles, custom shaders
- Reading scene state (camera position) to drive logic

**What it is NOT for:**
- Setting React state on every frame (triggers re-renders → performance death)
- Heavy computation (blocks the render loop)

```tsx
useFrame((state, delta) => {
  // state.clock.elapsedTime: seconds since canvas was created
  // delta: seconds since last frame (use for frame-rate independence)

  meshRef.current.rotation.y += delta;  // 1 radian/second, frame-rate independent
  meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;  // oscillate
});
```

**Priority:** Multiple `useFrame` calls in a component tree run in registration
order (usually parent before children). Pass an integer priority to control order:

```tsx
useFrame(callback, -1)  // runs BEFORE priority 0
useFrame(callback, 0)   // default
useFrame(callback, 1)   // runs AFTER priority 0
```

Lower priority numbers run first.

---

### Concept: `useThree`

**What it is:** Provides access to the R3F render state outside of `useFrame`.
Returns the same `state` object that `useFrame` receives.

```tsx
import { useThree } from '@react-three/fiber';

function CameraInfo() {
  const { camera, scene, gl, size } = useThree();

  return (
    <div>
      <p>Camera Z: {camera.position.z.toFixed(2)}</p>
      <p>Canvas: {size.width} × {size.height}</p>
      <p>Objects: {scene.children.length}</p>
    </div>
  );
}
```

**When to use:** For reading current state to render React (HTML) overlay elements.
For imperative setup that requires the Three.js objects (adding postprocessing effects,
setting up physics worlds, registering event listeners on the renderer).

**Warning:** `useThree` inside a component that renders inside `<Canvas>` works fine.
`useThree` outside of `<Canvas>` throws — the context is not available.

---

## Step 1 — Build the Demo Components

Create `src/components/PulsingSphere.tsx`:

```tsx
import { useRef }   from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function PulsingSphere({ frequency = 1 }: { frequency?: number }) {
  const ref = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    const scale = 1 + 0.3 * Math.sin(clock.elapsedTime * frequency * Math.PI * 2);
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref} position={[-2, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="cyan" wireframe />
    </mesh>
  );
}
```

Create `src/components/CameraTracker.tsx`:

```tsx
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree }          from '@react-three/fiber';

export function CameraTracker() {
  const [distance, setDistance] = useState(0);
  const frameCount = useRef(0);

  useFrame(({ camera }) => {
    frameCount.current++;
    // Only update state every 10 frames to avoid excessive re-renders:
    if (frameCount.current % 10 === 0) {
      setDistance(camera.position.length());
    }
  });

  return (
    <div style={{
      position: 'fixed', top: 16, left: 16,
      background: 'rgba(0,0,0,0.7)', color: 'white',
      padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace',
    }}>
      Camera distance: {distance.toFixed(2)}
    </div>
  );
}
```

Create `src/components/SceneStats.tsx`:

```tsx
import { useThree } from '@react-three/fiber';

export function SceneStats() {
  const { scene, gl, size } = useThree();
  const info = gl.info;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16,
      background: 'rgba(0,0,0,0.7)', color: '#aaa',
      padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12,
    }}>
      <div>Objects: {scene.children.length}</div>
      <div>Triangles: {info.render?.triangles ?? '—'}</div>
      <div>Canvas: {size.width} × {size.height}</div>
    </div>
  );
}
```

Update `src/components/Scene.tsx`:

```tsx
import { Canvas }         from '@react-three/fiber';
import { RotatingBox }    from './RotatingBox';
import { PulsingSphere }  from './PulsingSphere';
import { CameraTracker }  from './CameraTracker';
import { SceneStats }     from './SceneStats';

export function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <CameraTracker />
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <SceneStats />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} />
        <RotatingBox   position={[0,  0, 0]} color="orange" />
        <PulsingSphere frequency={0.5} />
      </Canvas>
    </div>
  );
}
```

### SAVE AND TRY

```bash
npm run dev
```

Expected: a rotating orange box, a pulsing cyan wireframe sphere, camera distance
display updating as you move (even without orbit controls — if you add OrbitControls
in T8·L4 it will update dynamically).

---

## Step 2 — Performance: When to Use Refs vs State

```tsx
// WRONG — re-renders every frame:
function RotatingBoxBad() {
  const [rotY, setRotY] = useState(0);

  useFrame((_, delta) => {
    setRotY(r => r + delta);  // triggers re-render 60×/second
  });

  return (
    <mesh rotation-y={rotY}>  {/* has to reconcile every frame */}
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}

// CORRECT — mutates Three.js object directly:
function RotatingBoxGood() {
  const ref = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta;  // no React re-render
  });

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

The `Bad` version calls `setRotY` 60 times/second, causing 60 React reconciliation
cycles per second. With hundreds of objects, this freezes the app.

The `Good` version uses `useRef` to get a reference to the Three.js `Mesh` object
and mutates its properties directly. Three.js reads the updated properties before
the next render call — no React involvement needed.

---

## 🎯 Challenge: Frame Counter

**You know:** `useFrame`, `useThree`, refs vs state.

**Task:** Build a `FrameCounter` component that displays:
- Current frame rate (FPS): updated once per second, not every frame
- Total frames rendered since the canvas was created

Use only `useRef` for the per-frame counter. Use `useState` only for the
once-per-second display update.

Write the component.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useState, useRef } from 'react';
import { useFrame }          from '@react-three/fiber';

export function FrameCounter() {
  const [fps, setFps]   = useState(0);
  const frameRef        = useRef(0);   // total frames — never triggers re-render
  const lastTimeRef     = useRef(0);   // last FPS calculation time
  const countSinceRef   = useRef(0);   // frames since last FPS calc

  useFrame(({ clock }) => {
    frameRef.current++;
    countSinceRef.current++;

    const elapsed = clock.elapsedTime;
    const timeSinceLast = elapsed - lastTimeRef.current;

    // Update FPS display once per second:
    if (timeSinceLast >= 1.0) {
      setFps(Math.round(countSinceRef.current / timeSinceLast));
      countSinceRef.current = 0;
      lastTimeRef.current   = elapsed;
    }
  });

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16,
      background: 'rgba(0,0,0,0.7)', color: fps >= 55 ? '#4caf50' : '#f44336',
      padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace',
    }}>
      {fps} FPS | {frameRef.current} total frames
    </div>
  );
}
```

**Key insight:** `frameRef.current++` runs every frame without a re-render.
`setFps(...)` runs once per second. The display shows the FPS (updated 1×/sec)
and total frames (always current from the ref). The green/red color provides
immediate feedback — green = smooth, red = performance problem.

</details>

---

## Final Check

| Concept | Rule |
|---|---|
| `useFrame` mutation | Mutate Three.js objects directly — no setState |
| `delta` vs `elapsedTime` | Use `delta` for physics/movement; `elapsedTime` for oscillations |
| Priority | Lower number = earlier execution |
| `useThree` | Works only inside `<Canvas>` tree |
| `useThree` from outside Canvas | Use `createPortal` or a separate component inside Canvas |

---

## Quick Check Answers

**1. `useFrame` callback takes 20ms. What happens?**

The frame rate drops below 60fps. R3F's `useFrame` is called before the Three.js
renderer draws the frame. If the callback takes 20ms, the total frame time is
>33ms (16ms target for 60fps). The renderer runs at the actual interval, not the
target 60fps. Users see stuttering. Heavy computation (pathfinding, collision
detection) should run off the main thread via `Web Workers`.

**2. `state.clock.elapsedTime` vs `delta` — when to use each?**

`delta`: for physics-based animations where you add a velocity per frame.
`rotation += velocity * delta` ensures 60fps and 30fps produce the same rotation.

`elapsedTime`: for oscillations and wave functions where you need an absolute
time reference. `Math.sin(elapsedTime * freq)` produces a consistent wave
regardless of frame timing — the position at time T is always the same.

**3. Camera position in a regular component — which hook?**

`useThree`. It returns the same `state` object as `useFrame`'s first argument, including
`state.camera`. For components inside `<Canvas>`, `useThree` is always available.
Note: `useThree` causes a re-render when the subscribed state changes — if you only
need a snapshot (not reactive updates), read `state.camera.position` directly in an
effect or event handler, or use `useThree(state => state.camera)` with a selector.
