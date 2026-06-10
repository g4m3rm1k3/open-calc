# eCaM v2 — LAB 08 — Bounding Volume Hierarchies (BVH)

**Read [THREE-LAB-06-RAYCASTING-FUNDAMENTALS.md] first.** That lab introduced Raycasting, but warned about the `O(N)` Big-O complexity trap. 
This lab solves the #1 performance issue in 3D CAD applications: selecting high-polygon models without freezing the browser.

**What this lab adds:**
- Big-O Notation in 3D Mathematics.
- Bounding Boxes.
- Spatial Data Structures (Trees) and BVH generation.

---

## What You Will Build

You will understand the theory behind a BVH plugin (like `three-mesh-bvh`) and manually implement a conceptual "Bounding Box" check to bypass expensive intersection math. 

---

### Concept: Big-O Complexity and `O(N)`

**What it is:** A way to describe how much slower an algorithm gets as data increases. `O(N)` means "Linear time". If you have 10 items, it takes 10 milliseconds. If you have 1,000,000 items, it takes 1,000,000 milliseconds (1,000 seconds).

**The problem before:** Raycasting checks every single triangle in a mesh to see if the ray hit it. A typical imported CAD screw thread has 10,000 triangles. An engine assembly has 5,000,000 triangles. Running `raycaster.intersectObject()` on 5 million triangles takes several seconds. The browser completely freezes when you click.

**The solution:** `O(log N)` complexity. Using a Bounding Volume Hierarchy tree, the engine groups the triangles into nested boxes. Instead of checking 5,000,000 triangles, it checks 1 giant box. Does the ray hit the box? Yes. Inside are 8 smaller boxes. Which one does the ray hit? Box 3. It discards the other 7 boxes and their 4.3 million triangles instantly. It repeats this until it finds the exact triangle. The entire check drops from 5,000,000 calculations to ~22 calculations.

---

### Concept: Bounding Boxes (`THREE.Box3`)

**What it is:** A mathematical box that perfectly encompasses a mesh. It is defined by exactly two Vector3s: `min` (the lowest X,Y,Z point) and `max` (the highest X,Y,Z point).

**The problem before:** You can't even begin to group triangles if you don't know the outer limits of the object.

**The solution:** Calculate the Bounding Box of your custom geometry once when it loads. Before doing complex triangle math, the Raycaster will do a hyper-fast check against the Bounding Box first. 

**Example:**
```js
geometry.computeBoundingBox();
console.log(geometry.boundingBox.max);
```

---

## Step 1 — Manual Bounding Box Optimization

In a real CAD application, you will import a library like `three-mesh-bvh`. But to understand *why* you need it, we will manually calculate a Bounding Box and see how Three.js uses it.

Open `main.js`. Find where you computed the normals for your custom geometry in Lab 04. Add this right after:

```js
geometry.computeVertexNormals();

// NEW: Calculate the Bounding Box.
// Three.js will now store a `boundingBox` object on the geometry.
geometry.computeBoundingBox();
```

Now, scroll down to your `pointerdown` Raycaster event from Lab 06.
When you call `raycaster.intersectObject(customMesh)`, Three.js does this internally:
1. Does the mesh have a bounding sphere or bounding box?
2. If yes, check if the ray hits the box first (Very fast, simple math).
3. If the ray MISSES the box, instantly return empty array `[]`. (Millions of triangle checks skipped!)
4. If the ray HITS the box, *then* check the actual triangles inside.

By adding `computeBoundingBox()`, you just implemented the first tier of a BVH optimization.

### SAVE AND TRY

Save. Open the app.

In DevTools Console, type:
  `window.customMesh.geometry.boundingBox`
Expected: An object with a `min` and `max` property. Look at `max`. It should say `x: 2, y: 2, z: 0`, matching the absolute largest coordinates we typed into our Float32Array!

---

## Up Next

**[LAB-09 — The Composite Pattern (Assemblies)](./THREE-LAB-09-COMPOSITE-ASSEMBLIES.md)**

Performance is handled. Now we must build complex machines. In LAB-09, we will use the Composite Pattern (`THREE.Group`) to assemble a multi-part Robot Arm. You will learn the difference between Local Space and World Space.
