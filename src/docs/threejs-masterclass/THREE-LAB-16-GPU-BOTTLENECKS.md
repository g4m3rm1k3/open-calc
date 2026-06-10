# eCaM v2 — LAB 16 — Draw Calls & GPU Bottlenecks

**Read [THREE-LAB-15-ANIMATION-MIXER.md] first.** 
This lab begins Phase 5: Extreme Performance. If you are building a CAD application, you will eventually hit a wall where your application drops from 60 FPS to 5 FPS. You must understand *why* it happens before you can fix it.

**What this lab adds:**
- WebGL Draw Calls.
- The CPU-GPU communication bottleneck.
- Inspecting `renderer.info`.

---

## What You Will Build

You will deliberately write terrible code to intentionally crash your framerate. You will then inspect the WebGLRenderer's internal diagnostics to see exactly how many times the CPU is screaming at the GPU per frame.

---

### Concept: The Draw Call Bottleneck

**What it is:** A "Draw Call" is the command the CPU sends to the GPU saying "Draw this specific Mesh with this Material".

**The problem before:** You have a CAD model of an engine. It has 10,000 identical screws. You create 10,000 `THREE.Mesh` objects and add them to the Scene. 
The GPU is incredibly fast. It can draw 5 million triangles in a millisecond. However, the *JavaScript CPU thread* is slow. Before drawing *each screw*, the CPU must prepare the WebGL state, compile the matrices, and send the Draw Call over the motherboard bus to the GPU. 
If you send 10,000 separate Draw Calls per frame, the GPU finishes drawing instantly and then sits idle, waiting for the slow CPU to send the next command. This is called being **CPU-Bound**.

**The solution:** You must reduce the number of Draw Calls. The golden rule of WebGL is: *Batch your data*. 10,000 screws should be rendered using exactly 1 Draw Call. (We will learn how in LAB-17).

---

### Concept: `renderer.info`

**What it is:** An object built into Three.js that tracks exactly what the GPU is doing every frame.

**Example:**
```js
console.log(renderer.info.render.calls); // How many Draw Calls happened this frame?
console.log(renderer.info.render.triangles); // How many triangles were drawn?
```

**Why it matters here:** If your app is slow, checking `renderer.info.render.calls` is step 1. If the number is above 1,000, you have an architecture problem, not a polygon problem.

---

## Step 1 — Intentionally Breaking Performance

Open `main.js`. Let's spawn 5,000 cubes. Add this near the bottom of your file (before the animate loop):

```js
// ── Performance Diagnostics ──────────────────────────────────────────────────

const badPerformanceGroup = new THREE.Group();
const testGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const testMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Spawning 5,000 separate Meshes
for (let i = 0; i < 5000; i++) {
  const mesh = new THREE.Mesh(testGeo, testMat);
  // Scatter them randomly
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20
  );
  badPerformanceGroup.add(mesh);
}

scene.add(badPerformanceGroup);

// Log the diagnostics to the console AFTER the first frame is rendered
setTimeout(() => {
  console.log("Draw Calls this frame:", renderer.info.render.calls);
  console.log("Triangles this frame:", renderer.info.render.triangles);
}, 1000);
```

### SAVE AND TRY

Save. Open the app.

You should see: A cloud of 5,000 tiny white cubes scattered around your scene. 
Depending on your computer, your browser might feel slightly sluggish, or the cooling fans might spin up.

In DevTools Console, look at the logs.
Expected:
`Draw Calls this frame: 5005` (5,000 cubes + the grid, axes, robot, etc).
`Triangles this frame: 60060`

This is terrible architecture. 5,000 draw calls is dangerously high for a browser. 

Change `i < 5000` to `i < 50000`. Save.
**WARNING: Your browser tab will likely freeze.** The CPU simply cannot process a loop of 50,000 WebGL state changes 60 times a second. Close the tab if it crashes, and change it back to `50` so your computer can rest.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `renderer.info` | The console accurately reports the massive number of draw calls you injected. |
| The Bottleneck | The visual lag at 50,000 meshes proves the CPU limits WebGL performance long before the GPU limits it. |

---

## Up Next

**[LAB-17 — InstancedMesh](./THREE-LAB-17-INSTANCED-MESH.md)**

Now that you've seen the browser choke on 5,000 draw calls, we will delete that code and replace it with `THREE.InstancedMesh`. We will render 100,000 cubes at a flawless 60 FPS using exactly 1 Draw Call by pushing transformation matrices directly to the GPU memory.
