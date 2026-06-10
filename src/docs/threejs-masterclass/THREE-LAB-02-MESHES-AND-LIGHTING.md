# eCaM v2 — LAB 02 — Meshes and Lighting

**Read [THREE-LAB-01-SCENE-CAMERA-RENDERER.md] first.** That lab explains the Scene, Camera, Renderer, and the basic animation loop.
This lab replaces our flat test cube with a complex, lit model of a handheld console using groups and physics-based rendering.

**What this lab adds over LAB-01:**
- Replacing flat colors with physically based materials (`MeshStandardMaterial`).
- Adding 3D Lights (`AmbientLight`, `DirectionalLight`) so standard materials are visible.
- The Composite Pattern via `THREE.Group` to combine multiple primitive shapes into one complex "Console" object.

---

## What You Will Build

By the end of this lab, you will have a 3D model of a retro handheld console floating in the center of your screen. 
It will have a gray rectangular plastic body, a darker gray screen bezel, a cross-shaped D-Pad, and two round action buttons. 
It will be lit by a directional light so you can clearly see shadows and highlights on the plastic surfaces.

---

### Concept: `THREE.MeshStandardMaterial`

**What it is:** A physically based rendering (PBR) material that reacts to light in a realistic way, calculating roughness and metalness.

**The problem before:** `MeshBasicMaterial` (used in Lab 01) ignores light entirely. It draws raw color pixels. A 3D cube made of Basic Material looks like a 2D flat hexagon because there is no shading on the faces to give the illusion of depth.

**The solution:** `MeshStandardMaterial` calculates how light hits each pixel based on the camera angle and light sources.

**Example — smallest possible:**
```js
const material = new THREE.MeshStandardMaterial({ 
  color: 0xcccccc, 
  roughness: 0.8, // 0 = perfectly smooth mirror, 1 = rough matte plastic
  metalness: 0.1  // 0 = plastic/wood, 1 = metal
});
```

**Why it matters here:** We want our console to look like a real physical object made of matte plastic.

**Watch for:** If you add a `MeshStandardMaterial` to a scene that has no lights, the object will render completely pitch black. No light = no color.

---

### Concept: Lights (`AmbientLight` and `DirectionalLight`)

**What it is:** Objects added to the scene graph that emit light rays so materials can be seen.
- `AmbientLight`: Globally illuminates all objects in the scene equally from all directions. Casts no shadows.
- `DirectionalLight`: Light emitted from a specific direction, like the sun. Causes faces pointing towards it to be bright, and faces pointing away to be dark.

**The problem before:** Without lights, standard materials are black. With only ambient light, objects look flat because there is no directional shading.

**The solution:** Combine a weak Ambient light (to prevent pitch-black shadows) with a strong Directional light (to provide depth and highlights).

**Example:**
```js
const ambient = new THREE.AmbientLight(0xffffff, 0.4); // white light, 40% intensity
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1.0); // 100% intensity
directional.position.set(5, 5, 2); // Put the sun up and to the right
scene.add(directional);
```

**Why it matters here:** We need lights to see the shapes of the buttons and the body of the console.

---

## Step 1 — Swapping to Standard Material and Adding Lights

In `main.js`, completely delete the `// ── Test Object ──` section from Lab 01 (delete the geometry, material, cube, and `scene.add(cube)`).
Also, in your `animate` function, delete the two lines spinning the cube (`cube.rotation.x += ...`).

Now add the Lighting setup before the animation loop:

```js
// ── Lighting ─────────────────────────────────────────────────────────────────

// 1. Ambient Light: Soft white light everywhere (prevents pitch black shadows)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Color, Intensity
scene.add(ambientLight);

// 2. Directional Light: Hard light from the top right (creates highlights/depth)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
// Move the light up, to the right, and slightly forward
directionalLight.position.set(5, 5, 2); 
scene.add(directionalLight);
```

### SAVE AND TRY

Save. Open the app.

You should see: A black screen. You deleted the cube! The lights are there, but there is nothing to illuminate.
(No console test needed here, move to the next step to add the object).

---

### Pattern: The Composite Pattern via `THREE.Group`

**What it is:** A structural pattern that lets you treat a group of objects exactly the same as a single object.

**The problem before:**
```js
// You have a console base, a screen, and 4 buttons.
scene.add(base);
scene.add(screen);
scene.add(btnA);
scene.add(btnB);

// Now you want to rotate the entire console.
base.rotation.y += 0.01;
screen.rotation.y += 0.01; // Oh no, the screen rotates around its OWN center, not the base's center!
btnA.rotation.y += 0.01;   // The buttons detach and float away in circles!
```

**The solution:** Add all pieces as children of a `Group`. The Group acts as a parent coordinate system. Move or rotate the Group, and all children move perfectly together.

**Example:**
```js
const consoleGroup = new THREE.Group();
consoleGroup.add(base);
consoleGroup.add(screen);

// Now rotate the group
consoleGroup.rotation.y += 0.01; // Everything rotates together as one solid object.
scene.add(consoleGroup);
```

**Pattern category:** Structural
**Official name:** Composite (Gang of Four)
**Tradeoff:** Adds a layer of nesting to your scene graph. To get the world position of a child, you have to multiply matrices instead of just reading `child.position`. (Three.js handles this via `child.getWorldPosition()`).
**You will see this again in:** LAB-04 when we need to check intersections against only the buttons.

---

## Step 2 — Creating the Game Boy Body

We will build the console inside a `Group`. Add this below the lighting:

```js
// ── The Console Model ────────────────────────────────────────────────────────

// Create a parent group to hold all the pieces together
const consoleGroup = new THREE.Group();
scene.add(consoleGroup);

// Shared material for plastic
const plasticMaterial = new THREE.MeshStandardMaterial({
  color: 0xdddddd, // light gray
  roughness: 0.8,  // mostly matte
  metalness: 0.1   // not metallic
});

// 1. The Main Body (Box)
// Width: 2.5, Height: 4.0, Depth: 0.5
const bodyGeo = new THREE.BoxGeometry(2.5, 4.0, 0.5);
const bodyMesh = new THREE.Mesh(bodyGeo, plasticMaterial);
consoleGroup.add(bodyMesh);

// 2. The Screen Bezel (Dark Gray Box)
// We make it slightly wider and taller than the actual screen.
const bezelGeo = new THREE.BoxGeometry(2.1, 1.8, 0.1);
const bezelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);

// Position the bezel on the upper half of the body.
// We push it slightly forward on the Z axis (0.25) so it sits ON the body (body depth is 0.5, so half is 0.25).
bezelMesh.position.set(0, 0.8, 0.26); 
consoleGroup.add(bezelMesh);
```

To see it clearly, let's slowly spin the whole group in the `animate` function. Update your animation loop:

```js
function animate() {
  requestAnimationFrame(animate);
  
  // Slowly rotate the entire console group
  consoleGroup.rotation.y += 0.005;
  consoleGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1; // Gentle wobble
  
  renderer.render(scene, camera);
}
```

### SAVE AND TRY

Save. Open the app.

You should see: A light gray rectangular brick with a dark gray screen area attached to the front. It should be slowly rotating left-to-right, and wobbling slightly up and down. Because of the directional light, the faces should transition smoothly from bright to dark as it spins.

In DevTools Console, type:
  `scene.children`
Expected: An array containing 3 items: an `AmbientLight`, a `DirectionalLight`, and a `Group`. (Your body and bezel are *inside* the Group).

Change `ambientLight` intensity to `0.0`. Save. You should see the shadowed side of the console become pitch black, proving the directional light is doing the heavy lifting.
Change it back to `0.4`.

---

### Concept: `THREE.CylinderGeometry`

**What it is:** Generates a 3D cylinder. 

**Constructor Signature:**
`new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)`

**Why it matters here:** Perfect for creating round action buttons (A/B buttons). By default, a cylinder stands upright on the Y axis. Since our console face points out along the Z axis, we will have to rotate the cylinders 90 degrees to point outwards.

---

## Step 3 — Creating the D-Pad and Buttons

Add this right after `consoleGroup.add(bezelMesh);` (before the animate loop).

```js
// 3. The Action Buttons (A / B)
// Radius: 0.2, Height/Thickness: 0.1, Segments: 32 (smooth circle)
const btnGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
const btnMat = new THREE.MeshStandardMaterial({ color: 0xaa0000, roughness: 0.7 }); // Dark red

const btnA = new THREE.Mesh(btnGeo, btnMat);
const btnB = new THREE.Mesh(btnGeo, btnMat);

// By default, cylinders point UP (Y axis). We need them pointing OUT (Z axis).
// Rotate them 90 degrees (Math.PI / 2 radians) on the X axis.
btnA.rotation.x = Math.PI / 2;
btnB.rotation.x = Math.PI / 2;

// Position them on the lower right
btnA.position.set(0.7, -1.0, 0.26); // Z is 0.26 to stick out past the body
btnB.position.set(0.1, -1.4, 0.26);

consoleGroup.add(btnA);
consoleGroup.add(btnB);

// 4. The D-Pad (Cross shape made of two overlapping boxes)
const dpadMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

// Vertical bar of the cross
const dpadVertGeo = new THREE.BoxGeometry(0.3, 0.9, 0.1);
const dpadVert = new THREE.Mesh(dpadVertGeo, dpadMat);
dpadVert.position.set(-0.6, -1.2, 0.26);
consoleGroup.add(dpadVert);

// Horizontal bar of the cross
const dpadHorizGeo = new THREE.BoxGeometry(0.9, 0.3, 0.1);
const dpadHoriz = new THREE.Mesh(dpadHorizGeo, dpadMat);
dpadHoriz.position.set(-0.6, -1.2, 0.26); // Exactly the same center as vertical
consoleGroup.add(dpadHoriz);
```

### SAVE AND TRY

Save. Open the app.

You should see: A complete handheld console! Dark red A and B buttons on the bottom right, and a black D-pad cross on the bottom left. 
Everything rotates perfectly together because they are all children of the `consoleGroup`.

In DevTools Console, type:
  `consoleGroup.children.length`
Expected: `6` (Body, Bezel, btnA, btnB, dpadVert, dpadHoriz).

Change `btnA.rotation.x = Math.PI / 2;` to `Math.PI / 4;`. Save. The button will look tilted and stick out awkwardly. 
Change it back.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `MeshStandardMaterial` | The console is no longer flat; faces transition smoothly based on angle to the light. |
| Lighting | Shadows exist. Setting `ambientLight` to 0 makes shadows pitch black. |
| The `Group` pattern | The entire console rotates as a single unit without the buttons detaching. |
| Cylinders | The A/B buttons are round. |

---

## Up Next

**[LAB-03 — CanvasTexture and Pac-Man](./THREE-LAB-03-CANVAS-TEXTURE-PACMAN.md)**

You have a console, but the screen is just a dark gray box. In LAB-03, we will create a 2D HTML `<canvas>` (where your Pac-Man game would run), and use `THREE.CanvasTexture` to dynamically stream those 2D pixels onto the 3D surface of our console in real time.
