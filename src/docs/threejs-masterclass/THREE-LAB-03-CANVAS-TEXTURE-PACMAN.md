# eCaM v2 — LAB 03 — CanvasTexture and Pac-Man

**Read [THREE-LAB-02-MESHES-AND-LIGHTING.md] first.** That lab explains standard materials, lighting, and groups.
This lab brings our dead plastic console to life by projecting a real, running 2D Canvas game onto the 3D screen.

**What this lab adds over LAB-02:**
- Understanding Textures vs Materials.
- Using `THREE.CanvasTexture` to bridge the 2D DOM and WebGL.
- Dynamically updating textures frame-by-frame.

---

## What You Will Build

By the end of this lab, the dark gray screen bezel on your 3D console will display a moving Pac-Man animation. 

Instead of writing a full Pac-Man game here, we will create a hidden 2D `<canvas>`, use standard `ctx.arc` commands to draw a yellow chomping circle, and tell Three.js to "paint" that canvas onto the 3D screen geometry every frame.

---

### Concept: Textures vs Materials

**What it is:** 
- A **Material** determines *how* light reacts with a surface (shiny, matte, transparent).
- A **Texture** is an image wrapped around the geometry to give it color detail (wood grain, brick pattern, or a game screen). 

**The problem before:** You can make a box dark gray by setting `color: 0x333333`. But you cannot draw a complex image like a game frame using just a hex color.

**The solution:** You pass a Texture object into the Material's `map` property. The renderer maps the 2D image pixels onto the 3D triangles.

**Example:**
```js
const textureLoader = new THREE.TextureLoader();
const brickTexture = textureLoader.load('bricks.jpg');

const material = new THREE.MeshStandardMaterial({ 
  map: brickTexture // The image dictates the color of every pixel
});
```

**Why it matters here:** We don't want a static image; we want a live, moving video game.

---

### Concept: `THREE.CanvasTexture`

**What it is:** A specific type of Texture in Three.js that uses a standard HTML `<canvas>` element as its image source.

**The problem before:** If you wanted to render a UI or a 2D game in 3D space, you would have to manually extract the image data from the canvas (`getImageData`), convert it to a WebGL-compatible array, and push it to the GPU every frame.

**The solution:** `CanvasTexture` does this automatically. You give it a reference to a DOM canvas, and it treats it like a live image source.

**Example:**
```js
// 1. A standard 2D canvas (does not need to be attached to the document)
const gameCanvas = document.createElement('canvas');
const ctx = gameCanvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);

// 2. Wrap it in a CanvasTexture
const screenTexture = new THREE.CanvasTexture(gameCanvas);

// 3. Use it in a material
const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
```

**Why it matters here:** This is the bridge. You already know how to build Pac-Man in an HTML canvas. Now you know how to put that canvas onto a 3D object.

---

## Step 1 — Creating the Hidden 2D Game Canvas

Add this to `main.js`, somewhere near the top (after your imports):

```js
// ── 2D Virtual Game Screen ───────────────────────────────────────────────────

// Create an HTML canvas in memory. We do not append it to document.body!
// It runs invisibly in the background.
const gameCanvas = document.createElement('canvas');
// Set resolution. A real Game Boy was 160x144, but let's make it sharp.
gameCanvas.width = 512;
gameCanvas.height = 512;

const gameCtx = gameCanvas.getContext('2d');

// Draw an initial background so it isn't transparent
gameCtx.fillStyle = '#111111'; // Dark background
gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
```

### SAVE AND TRY

Save. Open the app.

You should see: Nothing new. The canvas is in memory.

In DevTools Console, type:
  `gameCanvas.width`
Expected: `512`

---

## Step 2 — Applying the Texture to the Screen Bezel

Scroll down to where you defined the `bezelMesh` in Lab 02. We need to create a new mesh specifically for the screen itself, slightly in front of the bezel.

Modify the Bezel section to look like this:

```js
// 2. The Screen Bezel (Dark Gray Box)
const bezelGeo = new THREE.BoxGeometry(2.1, 1.8, 0.1);
const bezelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
bezelMesh.position.set(0, 0.8, 0.26); 
consoleGroup.add(bezelMesh);

// NEW: 2b. The Game Screen (A plane sitting just barely in front of the bezel)
const screenGeo = new THREE.PlaneGeometry(1.8, 1.5); // A flat 2D rectangle

// Create the CanvasTexture from our virtual canvas
const screenTexture = new THREE.CanvasTexture(gameCanvas);

// Use MeshBasicMaterial! Why? Because a TV/Console screen EMITS light.
// If we used StandardMaterial, the screen would get dark when turned away from the light.
// BasicMaterial ignores scene lighting, making it look like a glowing screen.
const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });

const screenMesh = new THREE.Mesh(screenGeo, screenMat);
// Position it exactly where the bezel is, but slightly further out on Z (0.26 + 0.051)
// We use 0.051 to ensure it is cleanly in front of the bezel to avoid "z-fighting" (flickering)
screenMesh.position.set(0, 0.8, 0.311);
consoleGroup.add(screenMesh);
```

### SAVE AND TRY

Save. Open the app.

You should see: A black rectangle appearing in the middle of your dark gray bezel. That black rectangle is the actual `<canvas>` being rendered in 3D!

Change `gameCtx.fillStyle = '#111111';` (in Step 1) to `gameCtx.fillStyle = 'blue';` and reload. 
You should see the screen turn blue.
Change it back.

---

### Concept: `texture.needsUpdate = true`

**What it is:** A flag you must set to tell WebGL that the underlying image data of a texture has changed and needs to be re-uploaded to the GPU.

**The problem before:** You update the 2D canvas using `ctx.fillRect()`. The 2D canvas changes in CPU memory. But WebGL cached the texture on the GPU during the first frame. Your 3D screen remains frozen on the first frame forever.

**The solution:** Set `texture.needsUpdate = true` inside your animation loop.

**Example:**
```js
function animate() {
  drawPacmanTo2DCanvas();
  // Tell Three.js the canvas changed!
  screenTexture.needsUpdate = true; 
  renderer.render(scene, camera);
}
```

**Why it matters here:** Without this, our Pac-Man will never move on the 3D screen.

**Watch for:** Uploading textures to the GPU is a heavy operation. Doing it 60 times a second (which we are doing) is fine for small canvases (512x512), but doing it for massive 4K canvases will severely drop your framerate.

---

## Step 3 — Animating Pac-Man on the Texture

First, we need to make `screenTexture` accessible to our animation loop. Move the definition of `screenTexture` up to the top of your file, right below where you created `gameCtx`:

```js
// Near the top of main.js:
const gameCanvas = document.createElement('canvas');
gameCanvas.width = 512;
gameCanvas.height = 512;
const gameCtx = gameCanvas.getContext('2d');

// EXPORT this texture so the animation loop can flag it for updates
export const screenTexture = new THREE.CanvasTexture(gameCanvas);
```

*(You will need to remove `const screenTexture = new THREE.CanvasTexture(gameCanvas);` from Step 2 to avoid redefining it).*

Now, let's write a simple 2D drawing function that mimics Pac-Man. Put this right before your `animate` loop:

```js
// ── 2D Game Logic ────────────────────────────────────────────────────────────

let pacmanX = 0;
function updateAndDraw2DGame() {
  // 1. Clear the 2D canvas frame
  gameCtx.fillStyle = '#111111';
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // 2. Update logic
  pacmanX += 3;
  if (pacmanX > gameCanvas.width + 50) pacmanX = -50;

  // 3. Draw Pac-Man (a simple yellow circle with a mouth)
  const mouthOpen = Math.sin(Date.now() * 0.01) * 0.5 + 0.5; // Oscillates 0 to 1
  const radius = 40;

  gameCtx.fillStyle = 'yellow';
  gameCtx.beginPath();
  // arc(x, y, radius, startAngle, endAngle)
  // We use mouthOpen to calculate the slice removed from the circle
  gameCtx.arc(
    pacmanX, 
    gameCanvas.height / 2, 
    radius, 
    0.2 * mouthOpen * Math.PI, 
    (2 - 0.2 * mouthOpen) * Math.PI
  );
  gameCtx.lineTo(pacmanX, gameCanvas.height / 2); // Line back to center to form the mouth
  gameCtx.fill();
}
```

Finally, update your `animate` loop to call this function and flag the texture:

```js
function animate() {
  requestAnimationFrame(animate);
  
  // Update 3D wobble
  consoleGroup.rotation.y += 0.005;
  consoleGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
  
  // NEW: Update 2D game
  updateAndDraw2DGame();
  
  // NEW: Tell WebGL the 2D canvas changed!
  screenTexture.needsUpdate = true;
  
  renderer.render(scene, camera);
}
```

### SAVE AND TRY

Save. Open the app.

You should see: A yellow Pac-Man moving across the screen of your rotating 3D console, chomping its mouth!

In DevTools Console, type:
  `screenTexture.needsUpdate`
Expected: You'll likely catch it as `false` or `true` depending on exactly when the frame paused, but typically Three.js resets it to `false` immediately after uploading it to the GPU.

Change `screenTexture.needsUpdate = true;` to be commented out `// screenTexture.needsUpdate = true;`. Save.
You should see a yellow Pac-Man frozen on the left side of the screen, completely unmoving, even though the console is still spinning. The 2D logic is running, but the GPU is not getting the new pictures.
Uncomment it.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Hidden 2D Canvas | The canvas exists in memory but is not disrupting the HTML DOM. |
| `CanvasTexture` | The 3D screen displays the contents of the 2D canvas. |
| `MeshBasicMaterial` | The screen remains bright and visible even when the console turns away from the light. |
| `needsUpdate` | Pac-Man moves across the screen continuously. |

---

## Up Next

**[LAB-04 — Raycasting and Interaction](./THREE-LAB-04-INTERACTION-AND-BUTTONS.md)**

You have a functioning screen, but you can't play the game. You can't click the 3D buttons. In LAB-04, we introduce the Raycaster to translate your 2D mouse clicks on the monitor into a 3D laser beam that detects when you intersect the A, B, or D-pad buttons, bridging user input into our game logic.
