# eCaM v2 — LAB 06 — Raycasting Fundamentals

**Read [THREE-LAB-05-ORTHOGRAPHIC-CAMERAS.md] first.** That lab taught you how to project a 3D scene onto a flat 2D monitor using Orthographic projection.
This lab does the exact mathematical inverse. We will take a 2D click on your flat monitor, and project it backwards into the 3D scene to figure out what object you touched.

**What this lab adds over LAB-05:**
- Translating pixels to Normalized Device Coordinates (NDC).
- The `THREE.Raycaster` and its underlying math (Rays, Origins, Directions).
- Intersecting custom BufferGeometry.
- Adding interactive visual feedback (hover/click color changes).

---

## What You Will Build

By the end of this lab, you will be able to click on your spinning blue square. When you click it, it will turn red. When you click the empty space around it, it will turn back to blue. You will have built the foundational selection mechanism for any CAD application.

---

### Concept: Normalized Device Coordinates (NDC)

**What it is:** A universal 2D coordinate system where the center of the screen is exactly `(X: 0, Y: 0)`, the top-right corner is `(X: 1, Y: 1)`, and the bottom-left corner is `(X: -1, Y: -1)`.

**The problem before:** Your mouse gives you coordinates in pixels (`clientX: 500, clientY: 300`). The WebGL renderer does not care if your screen is 800 pixels wide or 4000 pixels wide; internally, the Projection Matrix we built in Lab 05 mathematically squashes everything down into a uniform `-1.0` to `+1.0` space before handing it to the GPU.

**The solution:** You must manually translate the DOM pixel coordinates into NDC floats.

**Example (The Math):**
```js
// 1. event.clientX / window.innerWidth gives a percentage (0.0 to 1.0)
// 2. Multiply by 2 stretches it to (0.0 to 2.0)
// 3. Subtract 1 shifts it to (-1.0 to 1.0)
const ndcX = (event.clientX / window.innerWidth) * 2 - 1;

// Y is identical, but inverted (negative sign), because DOM Y goes DOWN, but WebGL Y goes UP.
const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
```

**Why it matters here:** If you pass `(500, 300)` into the 3D Raycaster, it will think you are trying to click something 500 units to the right of your camera, completely missing your scene.

---

### Concept: The Mathematical Ray (`THREE.Raycaster`)

**What it is:** A Ray is a line with a starting point (an `origin` Vector3) and a direction (a normalized `direction` Vector3). It shoots outward infinitely.

**The problem before:** Figuring out if a line intersects a triangle in 3D space requires calculating the "Plane Equation" of the triangle, finding the point where the line hits that plane, and then calculating "Barycentric Coordinates" to determine if that intersection point actually lies *inside* the triangle's three vertices. Doing this for thousands of triangles in JavaScript would be incredibly complex to write from scratch.

**The solution:** `THREE.Raycaster`. You give it your NDC mouse coordinates and your Camera. It generates the correct mathematical Ray. You pass it an array of Meshes, and it runs the Barycentric intersection math internally, returning a list of every triangle it hit, sorted by distance.

**Example:**
```js
const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(ndcMouseVector, camera);

// Check if the ray hits myMesh
const intersects = raycaster.intersectObject(myMesh);
if (intersects.length > 0) {
  console.log("Hit!");
}
```

**Why it matters here:** This is the only way to "click" objects in WebGL. 

**Watch for:** `intersectObject()` tests a single mesh. `intersectObjects()` tests an array of meshes. If your geometry has thousands of vertices, running this every single frame (e.g., for hover effects) can cause severe frame drops. We will solve this performance issue in a future lab using Bounding Volume Hierarchies (BVH).

---

## Step 1 — Setting up the Raycaster

Open `main.js`. At the bottom of the file (after the `animate()` loop), add the Raycaster setup and the event listener:

```js
// ── Interaction: Raycasting ──────────────────────────────────────────────────

// 1. Create the Raycaster and a Vector2 to hold the NDC mouse coordinates
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 2. Listen for clicks ('pointerdown' supports both mouse and touchscreens)
window.addEventListener('pointerdown', (event) => {
  // Translate pixels to NDC (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Aim the Raycaster from the camera, through the specific point on the 2D screen
  raycaster.setFromCamera(mouse, camera);

  // Ask the Raycaster to check for intersections with our customMesh
  // (Note: customMesh was attached to 'window' in Lab 03 so we can access it here)
  if (window.customMesh) {
    // intersectObject takes the mesh to test. 
    // It returns an array of hits (in case it passed through multiple parts of the same mesh)
    const intersects = raycaster.intersectObject(window.customMesh);

    if (intersects.length > 0) {
      // Hit! Change color to Red
      window.customMesh.material.color.setHex(0xff0000);
      console.log("Hit at 3D Coordinate:", intersects[0].point);
    } else {
      // Miss! Change color back to Blue
      window.customMesh.material.color.setHex(0x00aaff);
      console.log("Miss");
    }
  }
});
```

### SAVE AND TRY

Save. Open the app.

You should see: The same spinning blue square from the previous lab.

1. Click on the empty gray background.
Expected: Console logs `Miss`, and the square stays blue.

2. Click directly on the spinning blue square.
Expected: The square instantly turns Red! Console logs `Hit at 3D Coordinate: {x: ..., y: ..., z: ...}`.

3. Click the background again.
Expected: It turns back to Blue.

In DevTools Console, type:
  `mouse.x`
Expected: A float between `-1.0` and `+1.0` representing exactly where your last click was horizontally.

**Change something:** 
Inside the click handler, change `intersects[0].point` to `intersects[0].faceIndex`. Save.
Click the square.
Expected: The console will log either `0` or `1`. Remember from Lab 03 that our square is made of exactly two triangles (Face 0 and Face 1). The Raycaster is precise enough to tell you *exactly which triangle* within the `BufferGeometry` you clicked.
Change it back to `intersects[0].point`.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| NDC Math | Clicking the far edges of the screen accurately registers misses, proving the pixel-to-NDC math matches the WebGL viewport perfectly. |
| Raycaster Integration | The color dynamically changes to Red when intersecting the mesh. |
| Intersection Precision | The raycaster correctly identifies hits even as the square is mathematically transformed (spinning) by the animation loop. |

---

## Mental Model: Big-O Complexity in WebGL

**What it is:** How the performance of an algorithm degrades as you add more data.
Currently, when you click, the Raycaster checks `intersectObject(customMesh)`. Our mesh has 2 triangles. The CPU does the Barycentric math 2 times. This is `O(N)` complexity (Linear time).

**Where you will see this again:**
Imagine a CAD file of a jet engine with 5,000,000 triangles. 
If you click the screen, `O(N)` means the CPU will freeze the browser while it does heavy mathematics 5,000,000 times just to find out what you clicked. In **LAB-08: Bounding Volume Hierarchies**, we will structure our geometry into an "Octree", changing the complexity to `O(log N)`, allowing the CPU to find the clicked triangle in just 22 checks instead of 5,000,000!

---

## Up Next

**[LAB-07 — Reverse-Engineering OrbitControls](./THREE-LAB-07-ORBIT-CONTROLS.md)**

You can view geometry and click on it, but you cannot move your viewpoint. You are glued to the floor. In a CAD/CAM application, navigating the 3D space is critical. In LAB-07, we will manually implement panning, zooming, and orbiting. We will explore the Gimbal Lock problem and why raw `rotation` parameters fail when building complex cameras.
