# eCaM v2 — LAB 03 — Indices and Shared Data

**Read [THREE-LAB-02-JS-TYPED-ARRAYS.md] first.** That lab explains why WebGL requires `Float32Arrays` to pass vertex data to the GPU.
This lab addresses a critical flaw in how we built that raw geometry. If you are importing a million-polygon STL or STEP file for CAD, doing it the way we did in Lab 02 will crash the browser's memory limits.

**What this lab adds over LAB-02:**
- Understanding vertex duplication memory waste.
- The concept of Indexed Geometry.
- Unsigned Integer Typed Arrays (`Uint16Array`).

---

## What You Will Build

By the end of this lab, you will expand your single triangle into a flat Square (a "Quad" made of two triangles). However, instead of sending 6 vertices (18 numbers) to the GPU, you will only send 4 vertices (12 numbers) and use an Index array to "connect the dots".

---

### Concept: Vertex Duplication (The Memory Waste)

**What it is:** In 3D graphics, hardware only knows how to draw triangles. To draw a square, you must draw two triangles next to each other.

**The problem before:**
```text
Triangle 1: Top-Left, Bottom-Left, Top-Right
Triangle 2: Top-Right, Bottom-Left, Bottom-Right
```
Notice that "Top-Right" and "Bottom-Left" are required for *both* triangles. 
If we use the method from Lab 02, our `Float32Array` must contain 6 vertices:
`[TL_x, TL_y, TL_z, BL_x, BL_y, BL_z, TR_x, TR_y, TR_z, TR_x, TR_y, TR_z, BL_x, BL_y, BL_z, BR_x, BR_y, BR_z]`
We just sent the exact same coordinate data to the GPU twice. 

For a square, this wastes 2 vertices. For a complex CAD model with millions of connected triangles, you are duplicating millions of vertices, wasting hundreds of megabytes of RAM and destroying your framerate.

**The solution:** Define each unique point in space exactly *once* in an array. Then, create a second array of simple integers (Indices) that say "Draw a triangle using Point 0, Point 1, and Point 2. Then draw a triangle using Point 2, Point 1, and Point 3."

**Example:**
```js
// Only the 4 unique corners
const vertices = new Float32Array([
  -1, 1, 0,  // Index 0: Top-Left
  -1,-1, 0,  // Index 1: Bottom-Left
   1, 1, 0,  // Index 2: Top-Right
   1,-1, 0   // Index 3: Bottom-Right
]);

// Connect the dots!
const indices = new Uint16Array([
  0, 1, 2, // Triangle 1
  2, 1, 3  // Triangle 2
]);
```

**Why it matters here:** Every imported CAD file, every GLTF character model, and almost all of Three.js's internal primitives use Indexed Geometry. You must know how to read and write it.

---

### Concept: Unsigned Integer Arrays (`Uint16Array`)

**What it is:** Another TypedArray, like `Float32Array`, but specifically designed to hold whole numbers (integers) without negative signs ("unsigned"). 
- `Uint16` means 16-bit integer (can hold numbers from 0 to 65,535).
- `Uint32` means 32-bit integer (can hold numbers from 0 to 4,294,967,295).

**The problem before:** You can't use a `Float32Array` for indices, because there is no such thing as "Vertex number 1.5". You can't use a standard JavaScript `[]` array because the GPU needs raw binary.

**The solution:** `Uint16Array` is perfect for indices, because it uses exactly half the memory of a 32-bit array, saving massive amounts of RAM.

**Watch for:** If your geometry has more than 65,535 unique vertices, a `Uint16Array` will overflow and your 3D model will look like an exploded spiderweb of glitching triangles. For massive CAD files, you *must* use `Uint32Array` for your indices. Since a square only has 4 vertices, `Uint16Array` is perfect here.

---

## Step 1 — Building the Indexed Quad

Open `main.js`. Replace the `// ── Custom Geometry ──` section from Lab 02 with this:

```js
// ── Custom Indexed Geometry ──────────────────────────────────────────────────

const geometry = new THREE.BufferGeometry();

// 1. The Vertices (Only the 4 unique corners of the square)
const vertices = new Float32Array([
  -2.0,  2.0,  0.0, // Index 0: Top-Left
  -2.0, -2.0,  0.0, // Index 1: Bottom-Left
   2.0,  2.0,  0.0, // Index 2: Top-Right
   2.0, -2.0,  0.0  // Index 3: Bottom-Right
]);

const positionAttribute = new THREE.BufferAttribute(vertices, 3);
geometry.setAttribute('position', positionAttribute);

// 2. The Indices (Connecting the dots)
// Draw triangle 1 using indices 0, 1, 2
// Draw triangle 2 using indices 2, 1, 3
const indices = new Uint16Array([
  0, 1, 2, 
  2, 1, 3  
]);

// 3. Bind the index array to the geometry
// Notice we use setIndex(), NOT setAttribute(). Indices are special.
// We also use a BufferAttribute with an itemSize of 1 (each number is a single index)
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

// 4. Material and Mesh
const material = new THREE.MeshBasicMaterial({ 
  color: 0x00aaff, // Light blue
  wireframe: false,
  side: THREE.DoubleSide 
});

const customMesh = new THREE.Mesh(geometry, material);
scene.add(customMesh);

window.customMesh = customMesh;
```

*(Ensure your `animate()` loop at the bottom is still rotating `window.customMesh.rotation.y += 0.01;`)*

### SAVE AND TRY

Save. Open the app.

You should see: A solid light blue square spinning in the center of the grid! It is mathematically composed of two perfect triangles seamlessly joined at the diagonal.

In DevTools Console, type:
  `window.customMesh.geometry.attributes.position.count`
Expected: `4` (The GPU only holds 4 vertices in memory).

Type:
  `window.customMesh.geometry.index.count`
Expected: `6` (The GPU draws 6 connected dots total: 2 triangles * 3 points).

**Change something:** 
Let's break the winding order. Change the indices to:
```js
const indices = new Uint16Array([
  0, 1, 2, 
  1, 2, 3 // Swapped the order of the second triangle!
]);
```
Save and look at the square. Wait, it looks exactly the same? 
Now change `side: THREE.DoubleSide` to `side: THREE.FrontSide`. Save.
As the square rotates, you will see it looks broken! Half of it disappears from the front, and the other half disappears from the back. 

In 3D graphics, the order you list the indices (Counter-Clockwise) dictates which way the face points. By swapping `2, 1, 3` to `1, 2, 3`, you flipped the second triangle "inside out".
Change both lines back to fix it.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `Uint16Array` | The square renders perfectly using index pointers. |
| Deduplication | `attributes.position.count` is 4 instead of 6, proving you saved 33% of the vertex memory. |
| Winding Order | A continuous front face proves your index ordering was consistently Counter-Clockwise. |

---

## Up Next

**[LAB-04 — Face Normals and Math](./THREE-LAB-04-NORMALS-AND-MATH.md)**

You have a perfect, efficient square. But if you try to light this square using a `MeshStandardMaterial` from the lights we learned about earlier, it will be pitch black. The GPU knows where the points are, but it doesn't know which direction the flat surface is "facing", so it can't calculate how light bounces off it. In LAB-04, we introduce the crucial mathematical concept of Normal Vectors.
