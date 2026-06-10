# Junior to Senior — T8·L2 — `useFrame` and `useThree`

**Prerequisites:** T8·L1 (R3F Mental Model). You have a rotating cube without re-renders.
This lesson goes deeper into `useFrame` and `useThree` by explaining WHERE in R3F's render
loop each hook runs, WHY `delta` exists and what breaks without it, and WHEN to use
`useThree` vs just reading from a ref.

**What this lab adds:**
- Where `useFrame` fits in the R3F render loop — before or after Three.js renders
- Why `delta` is the seconds since last frame — and what breaks if you add a fixed number instead
- What `state.clock.elapsedTime` is for — and when to use it vs `delta`
- How `useThree` subscribes to state changes — and why it causes re-renders
- `useFrame` priority — when two callbacks must run in a specific order

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `useFrame` callback: `mesh.rotation.y += 0.01`. The app runs at 30fps instead
>    of 60fps. How fast does the cube rotate? What about `mesh.rotation.y += delta`?
> 2. `state.clock.elapsedTime` is at 5.0 when you write `position.y = Math.sin(elapsedTime)`.
>    One second later it is 6.0. What is `position.y` at 5.5 seconds?
> 3. `useThree()` is called inside a component OUTSIDE the `<Canvas>`. What happens?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See the Frame Rate Problem

Open the app from T8-L1. Throttle the CPU in browser DevTools (Performance → CPU throttling → 6×).

**You should see:** The cube rotates SLOWER. With `rotation.y += 0.01`, the rotation speed
depends entirely on frame rate. At 60fps: 0.01 × 60 = 0.6 rad/second. At 30fps: 0.01 × 30
= 0.3 rad/second. Same code, different speeds on different hardware.

This is why `delta` exists.

---

### Concept: `useFrame` — Position in the Render Loop and the `delta` Parameter

**What it is:** R3F maintains an animation loop using `requestAnimationFrame`. Before each
Three.js render call, R3F runs all registered `useFrame` callbacks in order of registration
(and priority). The callbacks receive two arguments:

```ts
useFrame((state, delta) => {
  // state: the R3F render state (camera, scene, renderer, clock, etc.)
  // delta: time in SECONDS since the last frame
});
```

**The exact sequence of events each frame:**

```
1. requestAnimationFrame fires (browser calls this once per frame)
2. R3F updates state.clock
3. R3F calls all useFrame callbacks with (state, delta)
   — Your animation code runs here
4. R3F calls renderer.render(scene, camera)
   — Three.js draws the frame
5. Browser displays the frame
```

**Why delta is seconds, not milliseconds:**

At 60fps, `delta ≈ 0.01667` seconds. At 30fps, `delta ≈ 0.03333` seconds.

```ts
// Frame-rate INDEPENDENT animation:
mesh.rotation.y += delta;   // 1 radian per second, regardless of fps
// At 60fps: += 0.01667 per frame. Over 60 frames (1 second): 0.01667 × 60 = 1 radian
// At 30fps: += 0.03333 per frame. Over 30 frames (1 second): 0.03333 × 30 = 1 radian ✓

// Frame-rate DEPENDENT animation (WRONG):
mesh.rotation.y += 0.01;   // 0.01 per frame — different speed at different fps
// At 60fps: 0.01 × 60 = 0.60 radians/second
// At 30fps: 0.01 × 30 = 0.30 radians/second ← half the speed
```

**The rule:** Always use `delta` for anything that should animate at a fixed real-world speed.

**You will see this again in:**
- Game physics engines: `velocity * deltaTime` for consistent movement
- JavaScript `requestAnimationFrame` without a framework: manually track `performance.now()`
- The Unity game engine: `Time.deltaTime` is the exact equivalent

---

## Step 2 — Verify `delta` Fixes the Frame Rate Problem

Update `src/App.tsx` to show `delta` in action:

```tsx
function RotatingBox() {
  const ref  = useRef<Mesh>(null!);
  const fps  = useRef<number>(0);

  useFrame((state, delta) => {
    // delta is always the time since the last frame in SECONDS.
    // 1/delta = current frame rate:
    fps.current = Math.round(1 / delta);

    // Frame-rate independent rotation — always 1 rad/second regardless of fps:
    ref.current.rotation.y += delta;   // ← use delta, not a fixed number
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

### SAVE AND TRY

Run the app. In DevTools Performance tab, throttle CPU to 4×.

**You should see:** The cube rotates at the SAME visual speed even when the frame rate drops.
With CPU throttling, frame rate drops but rotation stays consistent — `delta` compensates.

**Change something:** Replace `+= delta` with `+= 0.016` (a fixed frame-time approximation).
Throttle CPU to 4×. **Expected:** Now the rotation is noticeably slower at low frame rates.
This is the concrete difference. Change back to `+= delta`.

---

### Concept: `elapsedTime` vs `delta` — When to Use Each

**`delta`:** Time since the LAST frame. Use for continuous motion: position += velocity * delta.

**`state.clock.elapsedTime`:** Total time since the Canvas was created. Use for oscillations
and wave functions that depend on the absolute current time:

```ts
useFrame(({ clock }) => {
  // Oscillates the y position at 1 Hz (one full cycle per second):
  ref.current.position.y = Math.sin(clock.elapsedTime * Math.PI * 2 * 1);
  //                                                     ↑            ↑
  //                                                2π rads/cycle   1 Hz

  // This is CORRECT for oscillation — elapsedTime gives an absolute reference.
  // If you used delta: position.y = Math.sin(someAccumulator),
  //   you'd need to accumulate delta each frame. elapsedTime does that for you.
});
```

**The rule:**
- **Motion** (position, rotation changes each frame): use `+= delta`
- **Oscillation** (sin/cos waves): use `elapsedTime` for a stable reference point

---

### Concept: `useThree` — Accessing Scene State From Components

**What it is:** `useThree()` returns the R3F render state from inside the Canvas tree.
The same state that `useFrame` receives.

**The mechanism — where the state lives:**

R3F creates a React context that holds the Three.js objects (scene, camera, gl/renderer, clock, etc.).
`useThree` reads from this context. Like any React context read, it causes the component
to re-render when the context value changes.

```tsx
function CameraInfo() {
  const { camera, size } = useThree();
  //       ↑               ↑
  //  THREE.Camera     { width, height }

  // This component re-renders when camera or size changes.
  // For camera position that changes EVERY FRAME, this is expensive.
  // Better: use useFrame to read camera position without re-rendering.

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, color: 'white' }}>
      Viewport: {size.width} × {size.height}
    </div>
  );
}
```

**`useThree` for reading vs `useFrame` for per-frame:**

```ts
// WRONG — re-renders every frame because camera.position changes:
function BadTracker() {
  const { camera } = useThree();
  // camera.position updates every frame (if orbit controls are running)
  // → every frame causes a React re-render
  return <div>{camera.position.z.toFixed(2)}</div>;
}

// CORRECT — reads camera each frame without re-rendering:
function GoodTracker() {
  const [z, setZ] = useState(0);
  useFrame(({ camera }) => {
    // Only call setState when the value meaningfully changes:
    const newZ = Math.round(camera.position.z * 10) / 10;
    if (newZ !== z) setZ(newZ);   // re-renders only when z changes by 0.1
  });
  return <div>{z}</div>;
}
```

**The outside-Canvas restriction:**

`useThree` reads from a React context provided by `<Canvas>`. If you use `useThree`
in a component rendered OUTSIDE `<Canvas>`, the context is not present and React throws:
`Error: R3F hooks can only be used within the Canvas component!`

The workaround for components outside Canvas: use `useStore` from `@react-three/fiber`
with a store reference passed down, or restructure so the component is inside Canvas.

---

## Step 3 — Build a Scene Stats Display

Create `src/components/SceneStats.tsx`:

```tsx
// src/components/SceneStats.tsx
import { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export function SceneStats() {
  const [fps, setFps]           = useState(0);
  const frameCount              = useRef(0);
  const lastUpdateTime          = useRef(0);
  const framesSinceLastUpdate   = useRef(0);

  // useThree gives us stable references — size doesn't change every frame:
  const { size, scene } = useThree();

  // useFrame for per-frame updates — only calls setState once per second:
  useFrame(({ clock }) => {
    frameCount.current++;
    framesSinceLastUpdate.current++;

    const elapsed = clock.elapsedTime;
    const timeSinceLast = elapsed - lastUpdateTime.current;

    // Update FPS display once per second — one re-render per second:
    if (timeSinceLast >= 1.0) {
      setFps(Math.round(framesSinceLastUpdate.current / timeSinceLast));
      framesSinceLastUpdate.current = 0;
      lastUpdateTime.current        = elapsed;
    }
  });

  // This renders inside Canvas — it must return a React fragment, not DOM elements:
  // To show HTML overlay over the WebGL canvas, use the Html component from Drei
  // For now, just log to verify it works:
  console.log(`FPS: ${fps}, size: ${size.width}×${size.height}, objects: ${scene.children.length}`);

  return null;   // renders nothing in 3D — just a side-effect component
}
```

### SAVE AND TRY

Add `<SceneStats />` inside `<Canvas>` in App.tsx.

```bash
npm run dev
```

**In the browser console:**

**You should see** FPS logged once per second (not 60 times per second). The `size`
and `scene.children.length` are also logged. This demonstrates that `useThree` gives
access to the Three.js objects without re-rendering every frame.

---

## 🎯 Challenge: Build a Camera Distance Tracker

**You know:** `useFrame`, `useState`, `useThree`, refs, delta.

**Task:** Build `CameraDistanceDisplay` — an HTML overlay that shows the camera's
distance from the origin, updated at most 5 times per second (every 200ms).

```tsx
// Usage inside Canvas:
<CameraDistanceDisplay />
// Shows: "Distance: 5.24m" updating 5 times per second
```

Use `state.clock.elapsedTime` to throttle updates. Use `useFrame` for per-frame polling
but `useState` only when the displayed value changes.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
import { useState, useRef } from 'react';
import { useFrame }         from '@react-three/fiber';
import { Html }             from '@react-three/drei';

export function CameraDistanceDisplay() {
  const [distance, setDistance] = useState(0);
  const lastUpdate = useRef(0);

  useFrame(({ camera, clock }) => {
    const elapsed = clock.elapsedTime;

    // Throttle updates to 5 per second (every 200ms):
    if (elapsed - lastUpdate.current < 0.2) return;
    lastUpdate.current = elapsed;

    // Read camera position and compute distance from origin:
    const d = camera.position.length();
    setDistance(Math.round(d * 100) / 100);   // round to 2 decimal places
  });

  // Html from Drei renders HTML elements anchored in 3D space (here at origin):
  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'fixed', top: 16, right: 16,
        background: 'rgba(0,0,0,0.7)', color: 'white',
        padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace',
      }}>
        Distance: {distance.toFixed(2)}
      </div>
    </Html>
  );
}
```

**Key insight:** The `0.2` throttle in `useFrame` means the state update (and re-render)
happens at most 5 times per second. But the distance is still checked every frame — cheap,
since it's just `camera.position.length()`. This pattern (check every frame, update state
only when needed and not too often) is the standard R3F pattern for performance-safe UI
overlays.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `delta` is frame-rate independent | Throttle CPU; `+= delta` stays same speed; `+= 0.016` slows down |
| `useFrame` runs before Three.js renders | Add `console.log` in `useFrame` — logs before frame appears |
| `useThree` re-renders on context change | `size` changes on window resize → component re-renders |
| `useThree` outside Canvas throws | Put `useThree` in a component outside `<Canvas>` → error |
| `elapsedTime` for oscillation | `Math.sin(elapsedTime * freq)` gives consistent wave |

---

## Quick Check Answers

**1. `+= 0.01` at 30fps vs 60fps. `+= delta` at 30fps vs 60fps.**

`+= 0.01` at 30fps: 0.01 × 30 = 0.3 rad/second. At 60fps: 0.01 × 60 = 0.6 rad/second.
Different machines see different rotation speeds — bad.

`+= delta` at 30fps: delta ≈ 0.0333. 0.0333 × 30 = 1.0 rad/second.
At 60fps: delta ≈ 0.0167. 0.0167 × 60 = 1.0 rad/second.
Same speed on all hardware — good.

**2. `position.y = Math.sin(elapsedTime)`. At t=5.5, what is y?**

`Math.sin(5.5) ≈ -0.706`. The sine function evaluates at absolute time 5.5 seconds —
it does not depend on frame rate at all. This is why `elapsedTime` is used for oscillations:
the position at any time T is always `Math.sin(T)`, regardless of how many frames ran
before T or what the frame rate was.

**3. `useThree()` outside `<Canvas>`. What happens?**

React throws an error: `R3F hooks can only be used within the Canvas component!`
R3F's `useThree` reads from a React context that is only provided inside `<Canvas>`.
Outside Canvas, the context is `undefined`. React's `useContext` returns `undefined`
and R3F detects this case and throws an informative error.
