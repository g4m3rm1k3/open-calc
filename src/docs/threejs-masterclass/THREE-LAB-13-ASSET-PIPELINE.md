# eCaM v2 — LAB 13 — The Asset Pipeline (GLTF)

**Read [THREE-LAB-12-PHYSICALLY-BASED-RENDERING.md] first.** 
This lab connects your JavaScript application to external 3D authoring tools like Blender, Maya, or SolidWorks.

**What this lab adds:**
- Understanding the `GLTF` format.
- Asynchronous Loading (Promises and Callbacks).
- The `GLTFLoader`.

---

## What You Will Build

You will set up the infrastructure required to fetch a 3D model file from the network, parse it into Three.js geometry/materials, and inject it into the Scene Graph. 

*(Note: We will mock the loading process here so the code runs without requiring you to download external `.glb` files into your project folder yet).*

---

### Concept: The GLTF Format

**What it is:** GLTF (GL Transmission Format) is the "JPEG of 3D". It is an open-source JSON format that stores everything needed for a 3D scene: hierarchies, geometry, materials (PBR), and animations. `.glb` is the binary version of `.gltf` (everything packed into a single file).

**The problem before:** Earlier formats like `.obj` were massive text files that only stored raw triangles. They didn't support animations or a scene graph, and required a separate `.mtl` file just to define colors.

**The solution:** Always use GLTF/GLB for web 3D. It is highly compressed and natively structured for WebGL.

---

### Concept: Asynchronous Asset Loading

**What it is:** A 3D model might be 10MB. It takes time to download. You cannot pause the JavaScript Engine while you wait, or the entire browser will freeze. 

**The problem before:**
```js
// Synchronous (Bad)
const model = loader.loadSync('heavy_model.glb'); // Browser freezes for 5 seconds
scene.add(model);
```

**The solution:** You pass a "Callback" function. The loader fetches the file in the background. When it finishes parsing, it executes your callback, handing you the parsed scene graph.

**Example:**
```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

loader.load(
  'models/my_robot.glb', 
  // Success Callback
  (gltf) => {
    // gltf.scene contains the parsed Group
    scene.add(gltf.scene);
  },
  // Progress Callback (Optional)
  (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
  // Error Callback
  (error) => console.error("Failed to load model", error)
);
```

**Why it matters here:** Everything involving external assets (Textures, Models, Audio) is asynchronous. Your application must be architected to handle "Loading States" where the geometry does not yet exist.

---

## Step 1 — Implementing the GLTFLoader

Open `main.js`. We need to import the `GLTFLoader`. It is not part of the core `three` export; it is an "addon".

At the top of your file, add:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
```

Now, below your Assembly code, add the loading structure:

```js
// ── Asset Pipeline ───────────────────────────────────────────────────────────

const loader = new GLTFLoader();

// Since we don't have a real file, we won't execute loader.load() right now, 
// because it would throw an HTTP 404 error.
// Instead, let's create a simulated asynchronous loading process using setTimeout
// to demonstrate how the Scene Graph handles delayed injection.

console.log("Started loading external asset...");

setTimeout(() => {
  // Simulate the payload returned by GLTFLoader
  // In reality, this would be gltf.scene, a complex Group generated from the file.
  const simulatedImportedMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.2 })
  );
  simulatedImportedMesh.position.set(-3, 1, 0); // Place it to the left of the robot

  // Inject it into the live scene
  scene.add(simulatedImportedMesh);
  console.log("External asset fully loaded and added to scene.");

}, 2000); // Wait 2 seconds (simulating network download time)
```

### SAVE AND TRY

Save. Open the app.

You should see: The robot arm swinging. 
Wait exactly 2 seconds.
Expected: A shiny green sphere instantly "pops" into existence on the left side of the screen.

In DevTools Console, look at the logs.
Expected: 
`Started loading external asset...`
(2 seconds later)
`External asset fully loaded and added to scene.`

This proves that the WebGL Render Loop (`animate()`) does not crash or stop when objects are missing. It dynamically renders whatever is currently inside the `Scene` tree at that exact millisecond. Injecting new geometry asynchronously is perfectly safe.

---

## Up Next

**[LAB-14 — Skeletal Animation (Bones)](./THREE-LAB-14-SKELETAL-ANIMATION.md)**

Loading a static object is easy. Loading a human character that runs is hard. In LAB-14, we dissect the internal structure of an animated GLTF character. You will learn what an Armature is, how `SkinnedMesh` differs from a regular Mesh, and the concept of Vertex Weights.
