# eCaM v2 — LAB 04 — Face Normals and Math

**Read [THREE-LAB-03-BUFFER-GEOMETRY-INDICES.md] first.** That lab showed how to build a flat square using raw `Float32Array` vertices and `Uint16Array` indices.
This lab introduces the mathematical prerequisite for calculating light, shadows, and physics in 3D space.

**What this lab adds over LAB-03:**
- `MeshStandardMaterial` and `DirectionalLight`.
- The mathematical concept of a "Normal Vector".
- Why raw position data isn't enough to calculate lighting.
- Using `computeVertexNormals()` to generate normal attributes.

---

## What You Will Build

By the end of this lab, you will upgrade your flat, glowing blue square from LAB-03 into a physically lit, matte surface that interacts dynamically with a 3D light source as it rotates.

---

### Concept: Physics-Based Materials and Lights

**What it is:** 
- `MeshStandardMaterial` calculates how light reflects off a surface based on physical properties like roughness and metalness.
- `DirectionalLight` emits parallel light rays from a specific angle (like the sun).

**The problem before:** We have been using `MeshBasicMaterial`. Basic material ignores lighting entirely; it just forces pixels to be a specific hex color on the screen. It looks flat, like a 2D vector drawing.

**The solution:** Add a `DirectionalLight` to the scene, and swap the material to `MeshStandardMaterial`.

**Example:**
```js
const light = new THREE.DirectionalLight(0xffffff, 1.0); // White light, 100% intensity
light.position.set(0, 0, 5); // Put it directly in front of the camera, pointing at the center
scene.add(light);

const material = new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.5 });
```

**Why it matters here:** CAD/CAM software requires depth perception. Without lighting and shadows, it is impossible to visually distinguish a convex bump from a concave dent in a solid model.

---

## Step 1 — Adding Light and Upgrading the Material

Open `main.js`. 

Right below your `camera.lookAt(ORIGIN);` from Lab 01, add the light source:

```js
// ── Lighting ─────────────────────────────────────────────────────────────────
const light = new THREE.DirectionalLight(0xffffff, 2.0); // Strong white light
// Place the light 5 units directly in front of the object
light.position.set(0, 0, 5); 
scene.add(light);
```

Next, scroll down to the material definition for your custom indexed geometry.
Change `MeshBasicMaterial` to `MeshStandardMaterial`:

```js
// Change this:
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00aaff, 
  roughness: 0.5, // 0 is shiny glass, 1 is matte chalk
  side: THREE.DoubleSide 
});
```

*(Leave `wireframe: false` off, or delete it, as we want to see the solid surface).*

### SAVE AND TRY

Save. Open the app.

You should see: **A pitch black square.** It is still spinning, but it is entirely black. 

Wait. You added a light, and you added a standard material. Why is it pitch black?

In DevTools Console, type:
  `window.customMesh.geometry.attributes.normal`
Expected: `undefined`

This leads us to the core concept of this lab.

---

### Concept: Normal Vectors

**What it is:** A mathematical Vector (a directional arrow) that points *exactly perpendicular* (90 degrees) away from a flat surface. 

**The problem before:** You gave the GPU the `position` of the four corners of your square. The GPU knows *where* the square is. But the GPU does not inherently know which way the square is "facing". 
If a ray of light from your `DirectionalLight` hits the square, the GPU looks for the "Normal" vector to calculate the angle of reflection. If there are no normal vectors, the GPU assumes the reflection angle is 0, meaning absolutely zero light bounces back to the camera. The result is pitch black.

**The solution:** Every vertex in your geometry must have a second `Float32Array` attached to it called the `normal` attribute. For a square lying flat on the XY plane (facing the camera), every vertex needs a Normal pointing straight OUT towards the camera `(X: 0, Y: 0, Z: 1)`.

**Example (Manual):**
```js
// The hard way: manually defining the direction every vertex is facing
const normals = new Float32Array([
  0, 0, 1, // Vertex 0 points out on +Z
  0, 0, 1, // Vertex 1 points out on +Z
  0, 0, 1, // Vertex 2 points out on +Z
  0, 0, 1  // Vertex 3 points out on +Z
]);
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
```

**Why it matters here:** If you import a broken STL file into your CAD app and it looks black or has weird dark triangles, it is because the Normal vectors are missing or inverted. Understanding Normals is the #1 debugging tool for broken 3D geometry.

---

### Concept: `computeVertexNormals()`

**What it is:** A helper function on `BufferGeometry` that analyzes your vertices and your indices, mathematically calculates the perpendicular 90-degree vector for every triangle using the "cross product", and automatically creates the `normal` BufferAttribute for you.

**The problem before:** Manually typing out `0, 0, 1` for a square is easy. Manually typing out the exact perpendicular angle for 15,000 vertices on a curved cylinder is impossible.

**The solution:** Call `geometry.computeVertexNormals()` immediately after defining your positions and indices.

**Watch for:** `computeVertexNormals()` is computationally expensive. If you have a static CAD model, you run it *once* when the geometry is created. If you have an animated mesh (like a character whose skin is bending), running this every single frame will crush your framerate.

---

## Step 2 — Computing the Normals

Open `main.js`. 
Find where you bound the indices to the geometry (`geometry.setIndex(...)`).
Immediately after that line, ask Three.js to calculate the normal vectors:

```js
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

// NEW: Ask Three.js to calculate which way the triangles are facing!
// It uses the position attribute and index array to calculate the cross products.
geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({ 
// ... rest of code
```

### SAVE AND TRY

Save. Open the app.

You should see: The square is light blue again! But this time, it is not a flat `BasicMaterial` color. 
Because the light is sitting at `(0, 0, 5)` (straight in front of the camera), watch what happens as the square rotates on the Y axis.
When it faces you directly, it is bright blue. As it turns away, it smoothly fades to black because the Normal vectors are turning away from the light source.

In DevTools Console, type:
  `window.customMesh.geometry.attributes.normal.array`
Expected: `Float32Array(12) [0, 0, 1, 0, 0, 1, ...]`
Three.js calculated exactly what we knew: the face is pointing directly towards `+Z`.

Change `light.position.set(0, 0, 5);` to `light.position.set(5, 0, 0);` (Move the light to the right side). Save.
You should see the square is pitch black when facing you, but lights up bright blue when it rotates to face the right edge of the screen!
Change it back to `(0, 0, 5)`.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `MeshStandardMaterial` | It interacts with light (becomes dark when rotated away). |
| The Normal Attribute | `geometry.attributes.normal` exists and contains `0, 0, 1` chunks. |
| The Light Source | Changing the light's X position changes exactly when the spinning square lights up. |

---

## Up Next

**[LAB-05 — Perspective vs Orthographic Cameras](./THREE-LAB-05-ORTHOGRAPHIC-CAMERAS.md)**

Your core 3D engine is built. You understand memory, geometry, indices, and lighting math.
Now we must look at the Camera. The `PerspectiveCamera` mimics the human eye, but in CAD/CAM software (like Mastercam, AutoCAD, or SolidWorks), perspective distortion makes drafting impossible. Parallel lines must remain parallel. In LAB-05, we swap out the camera for an `OrthographicCamera` and learn the math behind the View Frustum.
