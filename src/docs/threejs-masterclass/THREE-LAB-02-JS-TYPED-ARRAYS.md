# eCaM v2 — LAB 02 — JavaScript Memory and Typed Arrays

**Read [THREE-LAB-01-SCENE-CAMERA-RENDERER.md] first.** That lab established the rendering loop, the camera, and the basic scene graph.
This lab looks under the hood of the `BoxGeometry` primitive we used. Before we can build complex, custom 3D shapes for our CAD/CAM engine, we must understand how JavaScript talks to the GPU.

**What this lab adds over LAB-01:**
- Understanding how the V8 JavaScript Engine stores Arrays in memory.
- Understanding what WebGL actually requires (raw contiguous binary data).
- The `Float32Array` data structure.

---

## What You Will Build

By the end of this lab, you will replace the pre-built `BoxGeometry` cube with a single, massive custom triangle. You will define the exact X, Y, and Z coordinates of its three corners manually using raw binary memory structures, completely bypassing Three.js's helpful geometry generators.

---

### Concept: JavaScript Dynamic Arrays vs GPU Memory

**What it is:** In JavaScript, a standard Array `const arr = []` is dynamic. It can hold mixed types: `[1, "hello", { object: true }, 4.5]`. The GPU, however, only understands raw, continuous blocks of binary numbers.

**The problem before:**
```js
const myVertices = [
  0, 1, 0,  // top vertex
  -1, 0, 0, // bottom left
  1, 0, 0   // bottom right
];
```
In JavaScript, because `myVertices` can theoretically hold *anything*, the V8 engine does not store those numbers neatly in a row in RAM. It stores them as a "dictionary" or "hash map" of pointers scattered across memory. 
If you try to send this scattered array to the GPU to draw a triangle, the GPU will crash because it expects a single, unbroken block of 32-bit floats.

**The solution:** `TypedArrays`. These are special JavaScript objects introduced specifically for WebGL. They cannot hold strings. They cannot change size once created. They guarantee that the numbers are stored sequentially in raw RAM, exactly how a C++ program or a GPU expects them.

**Example:**
```js
// Create an unbroken block of memory for 9 floating-point numbers
const rawMemory = new Float32Array(9); 
rawMemory[0] = 0.0;
rawMemory[1] = 1.0;
// etc...
```

**Why it matters here:** Three.js primitives (like `BoxGeometry`) hide this from you. But in a CAD app, you aren't drawing standard boxes; you are generating custom toolpaths, swept surfaces, and imported CAD meshes. You *must* know how to feed raw numerical data to the GPU directly.

**Watch for:** `Float32Array` has a fixed length. If you create `new Float32Array(9)` and try to do `rawMemory.push(5)`, it will throw a TypeError. TypedArrays do not have a `.push()` method.

---

## Step 1 — Testing Typed Arrays in the Console

We don't need to write code in our editor yet. Let's prove how Typed Arrays work directly in the browser.

### SAVE AND TRY

Open `http://localhost:5173` (your app from LAB-01 should be running). Open the DevTools Console.

Type this into the console:
```js
const normalArray = [1, 2, 3];
normalArray.push(4);
normalArray;
```
Expected: `[1, 2, 3, 4]`. The array grew dynamically.

Now type this:
```js
const typedArray = new Float32Array(3);
typedArray[0] = 1.5;
typedArray[1] = 2.5;
typedArray[2] = 3.5;
typedArray;
```
Expected: `Float32Array(3) [1.5, 2.5, 3.5]`. Notice it looks different from a normal array.

Now try to break it:
```js
typedArray.push(4.5);
```
Expected: `Uncaught TypeError: typedArray.push is not a function`. 

**Why did it crash?** Because `Float32Array` requested exactly `3 * 32 bits = 96 bits` of continuous RAM from the operating system. There is no room to "push" a 4th number without requesting a completely new block of RAM and copying the old data over.

---

### Concept: `THREE.BufferGeometry` and `THREE.BufferAttribute`

**What it is:** 
- `BufferGeometry` is the base class for *all* geometry in Three.js. It is an empty shell.
- `BufferAttribute` is the wrapper that takes your `Float32Array` and attaches it to the `BufferGeometry` so WebGL knows how to read it.

**The problem before:** If you just hand the GPU a massive `Float32Array` containing `[0, 1, 0, -1, 0, 0, 1, 0, 0]`, the GPU doesn't know what the numbers mean. Are they X,Y,Z positions? Are they R,G,B colors? Are they UV texture coordinates?

**The solution:** You wrap the array in a `BufferAttribute`, and specify the "item size". If item size is `3`, WebGL knows to read the numbers in chunks of three `(X, Y, Z)`. 

**Example:**
```js
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([0,1,0, -1,0,0, 1,0,0]);

// itemSize is 3 because 3 numbers make up 1 vertex (X, Y, Z)
const positionAttribute = new THREE.BufferAttribute(vertices, 3);

// Attach the attribute to the geometry under the specific name 'position'
geometry.setAttribute('position', positionAttribute);
```

**Why it matters here:** This is the exact mechanism used to build every 3D object in existence. A 10-million polygon CAD model of a jet engine is ultimately just one massive `Float32Array` shoved into a `position` attribute.

---

## Step 2 — Building a Custom Triangle

Open `main.js`. 
Find the `// ── Scene Objects ──` section where you created the `BoxGeometry` and the `cube` in LAB-01.
**Delete** the `BoxGeometry`, the `cube`, and `scene.add(cube)`. Leave the grid and axes helpers.

Replace it with this:

```js
// ── Custom Geometry ──────────────────────────────────────────────────────────

// 1. Create the empty shell
const geometry = new THREE.BufferGeometry();

// 2. Define the vertices using a Float32Array.
// We need 1 triangle = 3 vertices.
// Each vertex needs 3 numbers (X, Y, Z).
// Total numbers needed: 9.
const vertices = new Float32Array([
   0.0,  2.0,  0.0, // Vertex 1 (Top Center: X=0, Y=2, Z=0)
  -2.0,  0.0,  0.0, // Vertex 2 (Bottom Left: X=-2, Y=0, Z=0)
   2.0,  0.0,  0.0  // Vertex 3 (Bottom Right: X=2, Y=0, Z=0)
]);

// 3. Tell Three.js how to read the array (chunks of 3)
const positionAttribute = new THREE.BufferAttribute(vertices, 3);

// 4. Bind the data to the 'position' slot in the WebGL shader
geometry.setAttribute('position', positionAttribute);

// 5. Create a material. 
// We use wireframe: false so we see the solid face, not just the edges.
// side: THREE.DoubleSide tells the renderer to draw both the front AND back of the triangle.
const material = new THREE.MeshBasicMaterial({ 
  color: 0xffaa00, // Orange
  wireframe: false,
  side: THREE.DoubleSide 
});

// 6. Combine into a Mesh and add to scene
const customMesh = new THREE.Mesh(geometry, material);
scene.add(customMesh);

// Expose it to the window so we can spin it in the animate loop
window.customMesh = customMesh;
```

Update your `animate()` loop at the bottom of the file to spin `customMesh` instead of the old `cube`:

```js
function animate() {
  requestAnimationFrame(animate);

  // Spin our custom triangle
  if (window.customMesh) {
    window.customMesh.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
```

### SAVE AND TRY

Save. Open the app.

You should see: A solid orange triangle spinning in the center of your grid. You have just successfully passed raw binary memory from JavaScript directly into the GPU pipeline.

In DevTools Console, type:
  `window.customMesh.geometry.attributes.position.array.length`
Expected: `9` (The 9 numbers in your Float32Array).

Change `side: THREE.DoubleSide` to `side: THREE.FrontSide`. Save. 
Watch the spinning triangle carefully. You should see it disappear entirely when it spins around to show its backside! In 3D graphics, triangles are one-sided by default to save rendering power. The "front" is determined by the order you listed the vertices (Counter-Clockwise). 
Change it back to `THREE.DoubleSide`.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `Float32Array` | The triangle renders. (If you used a standard `[]` array, the console would throw a massive WebGL error). |
| Chunk Size | The triangle has 3 corners. (If `itemSize` was set to `1` or `2`, the shape would tear or crash). |
| Winding Order | Setting `side: THREE.FrontSide` makes the back invisible, proving that triangles are 2D planes in 3D space. |

---

## Mental Model: Data vs Behavior Separation

**What it is:** In Three.js, data (Geometry) and behavior/appearance (Material) are strictly separated. 

**Where you will see this again:** Because the `Float32Array` is just pure data, you can attach *multiple* meshes to the exact same `BufferGeometry` object in memory. If you wanted to draw 500 identical triangles, you create ONE `Float32Array`, ONE `BufferGeometry`, and 500 `Meshes`. They all share the exact same block of memory, saving massive amounts of RAM. We will exploit this heavily in the performance labs later.

---

## Up Next

**[LAB-03 — Indices and Shared Data](./THREE-LAB-03-BUFFER-GEOMETRY-INDICES.md)**

You drew one triangle perfectly. But what if you want to draw a square? A square is made of 2 triangles (6 vertices). But 2 of those corners are touching! In LAB-03, we learn how to use `Indices` (`Uint16Array`) to reuse vertices, saving 33% of your memory bandwidth—an absolutely critical technique for rendering large CAD files.
