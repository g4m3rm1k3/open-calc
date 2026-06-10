# eCaM v2 — LAB 17 — InstancedMesh

**Read [THREE-LAB-16-GPU-BOTTLENECKS.md] first.** 
This lab solves the bottleneck we just discovered. To build an efficient CAD/CAM engine, you must know how to render massive amounts of repetitive geometry.

**What this lab adds:**
- Transformation Matrices (`THREE.Matrix4`).
- `THREE.InstancedMesh`.

---

## What You Will Build

You will delete the terribly optimized `Group` of 5,000 meshes from the previous lab. You will replace it with an `InstancedMesh` that draws 10,000 cubes. The framerate will be flawless, and the WebGL Diagnostics will report exactly 1 Draw Call.

---

### Concept: Transformation Matrices (`Matrix4`)

**What it is:** A 4x4 grid of 16 numbers that holds the Position, Rotation, and Scale of an object all at once.

**The problem before:** When you write `mesh.position.set(5,0,0)`, Three.js internally converts that vector into a `Matrix4` before sending it to the GPU. 

**The solution:** When doing high-performance batching, we skip the `Mesh` object entirely. We generate the raw `Matrix4` data ourselves and pack it into a `Float32Array` to send to the GPU.

---

### Concept: `InstancedMesh`

**What it is:** A specialized Mesh that takes ONE Geometry, ONE Material, and an array of thousands of Matrices. 

**The problem before:** The CPU said: "Draw Cube 1 at (0,0,0)". Then "Draw Cube 2 at (1,0,0)". 

**The solution:** The CPU says: "Here is a Cube. Here is an array of 10,000 locations. GPU, draw them all. I am going to sleep." The GPU iterates over the array at blinding hardware speed. 

**Example:**
```js
const count = 10000;
const instanced = new THREE.InstancedMesh(geometry, material, count);

const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  dummy.position.set(Math.random(), Math.random(), Math.random());
  dummy.updateMatrix(); // Generate the Matrix4
  instanced.setMatrixAt(i, dummy.matrix); // Store the Matrix4 in the array
}

// CRITICAL: Tell WebGL the matrix array is ready
instanced.instanceMatrix.needsUpdate = true; 
```

**Why it matters here:** If your CAD application imports a bridge design with 250,000 identical rivets, `InstancedMesh` is the *only* way the browser will survive.

---

## Step 1 — Implementing Instancing

Open `main.js`. **DELETE** the `badPerformanceGroup` loop from Lab 16.

Replace it with this:

```js
// ── High Performance Instancing ──────────────────────────────────────────────

const INSTANCE_COUNT = 100000; // 100,000 cubes!

const instancedGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const instancedMat = new THREE.MeshStandardMaterial({ color: 0x00ffaa, roughness: 0.2 });

// Create the InstancedMesh
const instancedMesh = new THREE.InstancedMesh(instancedGeo, instancedMat, INSTANCE_COUNT);

// We use a "dummy" Object3D just to do the math for us. 
// We move it, ask it for its Matrix, and copy the Matrix into the array.
const dummy = new THREE.Object3D();

for (let i = 0; i < INSTANCE_COUNT; i++) {
  // Scatter them in a massive 100x100x100 volume
  dummy.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  
  // Give them random rotations
  dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

  // Compute the 4x4 Matrix
  dummy.updateMatrix();

  // Store the 4x4 Matrix at index 'i' in the massive internal Float32Array
  instancedMesh.setMatrixAt(i, dummy.matrix);
}

// Flag the data array to be uploaded to the GPU
instancedMesh.instanceMatrix.needsUpdate = true;

scene.add(instancedMesh);

// Log diagnostics
setTimeout(() => {
  console.log("Draw Calls this frame:", renderer.info.render.calls);
  console.log("Triangles this frame:", renderer.info.render.triangles);
}, 1000);
```

### SAVE AND TRY

Save. Open the app.

You should see: An absolutely massive, dense asteroid field of 100,000 green cubes floating around your assembly. The frame rate should be buttery smooth (60 FPS) despite rendering a galaxy of geometry.

In DevTools Console, look at the logs.
Expected:
`Draw Calls this frame: 6` (Your grid, axes, robot, and exactly **ONE** call for the 100,000 cubes!).
`Triangles this frame: 1200000` (1.2 Million triangles).

You are pushing 1.2 million triangles to the screen, lit by a dynamic directional light, and the CPU isn't breaking a sweat because it only issued 6 instructions.

---

## Up Next

**[LAB-18 — Post-Processing](./THREE-LAB-18-POST-PROCESSING.md)**

Your engine can now render massive datasets instantly. In the final lab of this masterclass, we will look at the Render Pipeline. When you select an object in CAD, it often glows with a thick colored outline. Achieving this requires intercepting the image *after* it is rendered, but *before* it hits the monitor, using the `EffectComposer`.
