# eCaM v2 — LAB 18 — Post-Processing

**Read [THREE-LAB-17-INSTANCED-MESH.md] first.** 
This is the final lab in the Three.js Masterclass. We will look at how to modify the final image before it reaches the screen.

**What this lab adds:**
- The `EffectComposer`.
- Render Passes.
- Adding selection outlines (a critical feature for CAD applications).

---

## What You Will Build

You will intercept the `WebGLRenderer` output. Instead of drawing directly to the screen, you will draw to an invisible memory buffer. Then, you will pass that image through an `OutlinePass` to draw glowing colored borders around objects you have selected, before finally displaying it to the user.

---

### Concept: The Render Pipeline (`EffectComposer`)

**What it is:** A system that chains multiple "Passes" (filters) together. 
Pass 1: Render the 3D scene.
Pass 2: Apply a blur.
Pass 3: Apply color correction.
Pass 4: Render to the screen.

**The problem before:**
```js
// Standard rendering
renderer.render(scene, camera); 
```
The renderer draws the scene directly to the `<canvas>`. Once drawn, the pixels are finalized. You cannot easily say "draw a glowing border around this specific mesh" using standard Materials, because standard materials are restricted to the triangles of the mesh itself. A glowing outline exists *outside* the geometry.

**The solution:** `EffectComposer`. It overrides `renderer.render()`. 

**Example:**
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

const composer = new EffectComposer(renderer);

// Pass 1: Draw the scene to memory
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Inside animate loop:
// renderer.render(scene, camera); <-- DELETE THIS
composer.render(); // Let the composer handle it
```

---

### Concept: The `OutlinePass`

**What it is:** A specific post-processing filter that analyzes the depth and normals of the image, finds the edges of specific objects you hand to it, and draws a colored stroke around them.

**The problem before:** Drawing outlines in 3D is mathematically very difficult. The classic "hack" was to duplicate the object, make it slightly larger, color it black, and flip the normals inside-out. This doubled your geometry count.

**The solution:** The `OutlinePass` does it purely in 2D pixel space, which is incredibly fast and visually perfect.

---

## Step 1 — Setting up the Composer

Open `main.js`. First, import the necessary addons at the top:

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
```

Now, replace your `// ── The Renderer ──` section from Lab 01/05. Add the Composer logic right after you define `renderer`:

```js
// ── Post-Processing Pipeline ─────────────────────────────────────────────────

// 1. Create the Composer
const composer = new EffectComposer(renderer);

// 2. The Base Pass (Render the raw 3D scene)
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 3. The Outline Pass
// Signature: (Resolution, Scene, Camera)
const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 
  scene, 
  camera
);

// Configure the outline visuals (CAD style)
outlinePass.edgeStrength = 5;       // Thick, glowing line
outlinePass.edgeGlow = 1;           // Slight glow
outlinePass.edgeThickness = 2;      // Crisp edge
outlinePass.visibleEdgeColor.set('#00ff00'); // Neon green for selection
outlinePass.hiddenEdgeColor.set('#190a05');  // Dark color if obscured by other geometry

composer.addPass(outlinePass);
```

Next, we must tell the `OutlinePass` *which* objects to draw borders around.
Let's just permanently select our Robot Arm Bicep for now. Add this right after configuring the `outlinePass`:

```js
// Tell the OutlinePass to highlight the bicepMesh
// Notice it takes an ARRAY of objects.
// Wait, we attached 'bicepGroup' to the window earlier. Let's use its children[0] which is the mesh.
if (window.bicepGroup) {
  outlinePass.selectedObjects = [window.bicepGroup.children[0]];
}
```

Finally, update your `animate` loop to use the Composer:

```js
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock ? clock.getDelta() : 0.016;
  if (mixer) mixer.update(delta);

  if (window.bicepGroup) {
    window.bicepGroup.position.lerp(targetBicepPosition, 0.05);
    window.bicepGroup.rotation.z = Math.sin(Date.now() * 0.002) * 0.5;
  }

  // DELETE THIS:
  // renderer.render(scene, camera);
  
  // ADD THIS:
  composer.render();
}
```

### SAVE AND TRY

Save. Open the app.

You should see: The robot arm swinging. But now, the red rubber bicep is wrapped in a thick, glowing neon green outline! As it swings back and forth, the outline perfectly traces its geometry in real-time.

In DevTools Console, type:
  `outlinePass.visibleEdgeColor.set('#ff00ff')`
Expected: The outline instantly changes to bright magenta.

---

## Final Architecture Connection

You have now built every system required for a professional CAD application:

1. **Selection (Lab 06):** User clicks the screen. Raycaster finds the Mesh.
2. **State (Lab 18):** You add the clicked Mesh to an array of `selectedMeshes`.
3. **Visual Feedback (Lab 18):** You pass `selectedMeshes` to `outlinePass.selectedObjects`. The mesh glows.
4. **Interaction (Lab 09 & 10):** The user drags the mouse. You update the local `position` of the Mesh inside its `Group`.
5. **Performance (Lab 08 & 17):** The raycaster uses a BVH tree, and the background geometry uses `InstancedMesh`, keeping the app at a flawless 60 FPS.

**Masterclass Complete.**
