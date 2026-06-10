# eCaM v2 — LAB 05 — Perspective vs Orthographic Cameras

**Read [THREE-LAB-04-NORMALS-AND-MATH.md] first.** That lab finalized our understanding of the core rendering pipeline by explaining lighting math and normals.
This lab moves away from geometry and focuses entirely on how the 3D world is mathematically projected onto your 2D monitor. 

**What this lab adds over LAB-04:**
- The mathematical difference between Perspective and Orthographic projection.
- `THREE.OrthographicCamera`.
- Solving window resize distortion (Aspect Ratio math).

---

## What You Will Build

By the end of this lab, you will replace the "human eye" camera with a purely mathematical "drafting" camera used in CAD/CAM software. You will also add a window resize listener so your application doesn't stretch and distort when the user changes their browser window size.

---

### Concept: The View Frustum

**What it is:** The mathematical 3D volume that represents exactly what the camera can see. Any object inside the Frustum is rendered to the screen. Any object outside the Frustum is "Clipped" (ignored by the GPU).

**The problem before:** You must explicitly define boundaries. If the GPU tries to render objects sitting at `Z = infinity`, the floating-point math overflows and crashes.

**The solution:** Define a `Near` and `Far` plane. 

**Why it matters here:** Both camera types we are about to discuss use a Frustum, but the *shape* of that Frustum fundamentally changes how the 3D world looks.

---

### Concept: Perspective vs Orthographic Projection

**What it is:** 
- **Perspective Camera:** The frustum is shaped like a Pyramid with the tip cut off. Objects further away take up less of the camera's volume, so they appear smaller on screen. This mimics human eyes and camera lenses. Parallel lines converge at a vanishing point.
- **Orthographic Camera:** The frustum is shaped like a perfect Rectangular Box. Size is not affected by distance. An object 1,000 units away looks exactly the same size as an object 1 unit away. Parallel lines never converge.

**The problem before:** If you use a `PerspectiveCamera` in a CAD application, drawing a perfect 2D floor plan is impossible. Two identical mechanical gears placed next to each other will look like they are different sizes depending on how close they are to the center of the lens. You cannot visually verify alignments.

**The solution:** Use an `OrthographicCamera` for drafting, blueprinting, and precision mechanical alignment.

**Constructor Signature (`OrthographicCamera`):**
`new THREE.OrthographicCamera(left, right, top, bottom, near, far)`
Notice there is no `FOV` (Field of View) angle. Instead, you explicitly declare the physical dimensions of the rectangular box.

---

## Step 1 — Switching to Orthographic

Open `main.js`. 
Find the `// ── Core Engine: The Camera ──` section. 
Comment out or delete the `PerspectiveCamera` code, and replace it with this:

```js
// ── Core Engine: The Orthographic Camera ─────────────────────────────────────

// Instead of an angle, we define how many "world units" wide our camera box is.
// Let's say we want to see 10 units horizontally across the screen.
const viewSize = 10;
const aspect = window.innerWidth / window.innerHeight;

// Calculate the boundaries of the box.
// If viewSize is 10, left is -5, right is +5.
// We multiply the Top and Bottom by the Aspect Ratio so the box is proportionally 
// scaled to the physical monitor, preventing the image from stretching.
const left = -viewSize / 2;
const right = viewSize / 2;
const topBound = (viewSize / aspect) / 2;
const bottomBound = -(viewSize / aspect) / 2;

const camera = new THREE.OrthographicCamera(
  left, 
  right, 
  topBound, 
  bottomBound, 
  0.1,   // near
  1000   // far
);

// We must pull the camera back AND up, and look at the origin, just like before.
// We use 5, 5, 5 to get a classic "Isometric" CAD view.
camera.position.set(5, 5, 5);
const ORIGIN = new THREE.Vector3(0, 0, 0);
camera.lookAt(ORIGIN);
```

### SAVE AND TRY

Save. Open the app.

You should see: The custom square and the grid from the previous lab. 
However, look closely at the grid lines. In Lab 04, the grid lines converged towards the horizon. Now, the grid lines are perfectly parallel, diamond-shaped, isometric lines. The square does not get smaller as it spins away. It is pure, mathematical isometric projection.

In DevTools Console, type:
  `camera.type`
Expected: `"OrthographicCamera"`

Change `camera.position.set(5, 5, 5);` to `camera.position.set(0, 5, 0);` (Looking straight down from the top). Save.
You should see a perfect, 2D top-down "blueprint" view of the grid and the spinning square! This is how 2D drawing software is built inside 3D engines.
Change it back to `(5, 5, 5)`.

---

### Concept: The Window Resize Event

**What it is:** A browser event fired whenever the user changes the size of their window.

**The problem before:** If you open the app right now, then click and drag the edge of your browser window to make it narrow, your 3D spinning square will squash and stretch like silly putty. 
Why? Because WebGL took the *original* aspect ratio when the page loaded, and now the CSS is violently stretching that static picture. 

**The solution:** Listen for the `resize` event. When it fires, you must do two things:
1. Update the `WebGLRenderer` internal size.
2. Update the Camera's aspect ratio/boundaries and recalculate its Projection Matrix.

**Example:**
```js
window.addEventListener('resize', () => {
  // Update Renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update Camera parameters (Orthographic example)
  const aspect = window.innerWidth / window.innerHeight;
  camera.top = (viewSize / aspect) / 2;
  camera.bottom = -(viewSize / aspect) / 2;
  
  // CRITICAL: Tell the camera to recalculate its internal matrix!
  camera.updateProjectionMatrix();
});
```

**Why it matters here:** A professional application must respond smoothly to the user's screen environment.

**Watch for:** Forgetting `camera.updateProjectionMatrix()` is the most common bug in Three.js. You can change `camera.fov` or `camera.top` all day, but until you call `updateProjectionMatrix`, the GPU will ignore the changes.

---

## Step 2 — Fixing Aspect Ratio Distortion

Add this block of code anywhere *after* you define the `camera` and `renderer`, but before the `animate()` loop:

```js
// ── Window Resize Handler ────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  // 1. Tell the renderer the window changed size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 2. Recalculate the Aspect Ratio
  const newAspect = window.innerWidth / window.innerHeight;

  // 3. Update the Orthographic Camera's Top and Bottom boundaries
  // (We leave Left and Right at -5 and 5, so the horizontal view never changes, 
  // but the vertical view expands/contracts to keep the proportions perfect).
  camera.top = (viewSize / newAspect) / 2;
  camera.bottom = -(viewSize / newAspect) / 2;

  // 4. Recalculate the Frustum math
  camera.updateProjectionMatrix();
});
```

### SAVE AND TRY

Save. Open the app.

You should see: No immediate change. 

Now, grab the edge of your browser window and drag it left and right to resize it. 
Expected: The spinning square and the grid should remain perfectly proportioned. They will not stretch or squash. The canvas will simply reveal more or less of the floor as you resize.

In DevTools Console, type:
  `window.innerHeight`
(Note the number).
Resize your window vertically.
Type:
  `camera.top`
Expected: The number should have changed to mathematically match your new window height.

Change `camera.updateProjectionMatrix();` by commenting it out `// camera.updateProjectionMatrix()`. Save.
Resize your window. 
You should see terrible stretching distortion again. The boundaries updated in JS memory, but were never sent to the WebGL Matrix.
Uncomment the line to fix it.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `OrthographicCamera` | Grid lines are perfectly parallel with zero vanishing point. |
| Resize Event | Resizing the browser window does not distort the aspect ratio of the square. |
| Projection Matrix | The stretching bug returns if `updateProjectionMatrix()` is omitted. |

---

## Up Next

**[LAB-06 — Raycasting Fundamentals](./THREE-LAB-06-RAYCASTING-FUNDAMENTALS.md)**

Your CAD environment is looking solid. You have geometry, lighting, and an isometric drafting camera.
But currently, it is a non-interactive video. You cannot click on the square. 
In LAB-06, we solve the hardest mathematical problem in 3D UX: translating a 2D mouse click on your monitor into a 3D ray that perfectly pierces the geometry in your scene.
