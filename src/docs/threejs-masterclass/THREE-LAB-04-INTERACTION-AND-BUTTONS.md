# eCaM v2 — LAB 04 — Raycasting and Interaction

**Read [THREE-LAB-03-CANVAS-TEXTURE-PACMAN.md] first.** That lab explains how to project a running 2D Canvas onto a 3D plane.
This lab completes the masterclass by allowing the user to interact with the 3D console to play the 2D game.

**What this lab adds over LAB-03:**
- Converting 2D screen clicks into Normalized Device Coordinates (NDC).
- Using `THREE.Raycaster` to shoot virtual lasers into the 3D scene.
- Detecting intersections with specific 3D meshes (the buttons).
- Bridging 3D click events back into the 2D game logic.

---

## What You Will Build

By the end of this lab, you will be able to click on the spinning 3D "A" button on your console. 
When clicked, the button will momentarily flash white (visual feedback), and the 2D Pac-Man character on the screen will "jump" into the air.

---

### Concept: Normalized Device Coordinates (NDC)

**What it is:** A standard coordinate system used in 3D graphics where the center of the screen is `(0, 0)`, the top-right is `(1, 1)`, and the bottom-left is `(-1, -1)`. 

**The problem before:** Your browser DOM uses screen coordinates where the top-left is `(0, 0)` and the bottom-right is `(window.innerWidth, window.innerHeight)`. WebGL mathematics do not understand pixels; they understand a unified `-1` to `+1` mathematical space.

**The solution:** You must translate standard browser `clientX` and `clientY` coordinates into NDC before giving them to Three.js.

**Example:**
```js
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
  // Convert X: (pixels / total width) gives 0.0 to 1.0. 
  // Multiply by 2 gives 0.0 to 2.0. Subtract 1 gives -1.0 to 1.0.
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  
  // Convert Y: Same logic, but flipped because DOM Y goes down, NDC Y goes up.
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
```

**Why it matters here:** If you pass raw pixel coordinates like `(500, 300)` into a Raycaster, it thinks you clicked thousands of units off-screen.

---

### Concept: `THREE.Raycaster`

**What it is:** A utility that shoots an invisible straight line (a ray) from a starting point (the camera) through a target point (your mouse cursor in NDC) and reports every 3D object that the line hits.

**The problem before:** Trying to calculate if a 2D mouse click intersects a spinning, scaled, transformed 3D cylinder located 5 units away in perspective space requires intense matrix inversion mathematics.

**The solution:** You give the Raycaster the mouse coordinates and the camera. You tell it an array of objects to test against. It returns a sorted array of intersections (closest first).

**Example — smallest possible:**
```js
const raycaster = new THREE.Raycaster();

function checkIntersections() {
  // 1. Aim the raycaster from the camera through the mouse
  raycaster.setFromCamera(mouse, camera);

  // 2. See what it hits
  const intersects = raycaster.intersectObjects(scene.children);
  
  if (intersects.length > 0) {
    console.log("Hit:", intersects[0].object);
  }
}
```

**Why it matters here:** This is the *only* way to "click" on a 3D object in WebGL.

**Watch for:** `intersectObjects(array, recursive)` takes an array. If you pass it a single mesh instead of an array, it crashes. If you want to check inside a `Group`, you must pass `true` as the second argument so it checks children recursively.

---

## Step 1 — Setting up the Raycaster and Event Listener

At the bottom of `main.js` (below your `animate()` function), set up the Raycaster infrastructure:

```js
// ── Raycasting & Interaction ─────────────────────────────────────────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// We use 'pointerdown' instead of 'mousedown' because it supports touchscreens too!
window.addEventListener('pointerdown', (event) => {
  // 1. Calculate mouse position in Normalized Device Coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 2. Aim the raycaster
  raycaster.setFromCamera(mouse, camera);

  // 3. Check for intersections against the ENTIRE console group.
  // The 'true' argument means "check all children inside the group recursively".
  const intersects = raycaster.intersectObjects([consoleGroup], true);

  if (intersects.length > 0) {
    // We hit something! Get the closest object we hit.
    const clickedObject = intersects[0].object;
    console.log("Clicked on:", clickedObject);
  }
});
```

### SAVE AND TRY

Save. Open the app.

You should see: No visual changes yet.

In DevTools Console, click on the rotating gray body of the console. 
Expected output: `Clicked on: Mesh { ... }`. 
Expand the `Mesh` object in the console, look at its `geometry.type` property. It should say `"BoxGeometry"`.
Now click on the round red 'A' button. 
Expected output: `Clicked on: Mesh { ... }`. Its `geometry.type` should say `"CylinderGeometry"`.
Click on the empty black space around the console.
Expected output: Nothing. The `intersects` array is empty.

---

### Concept: Bridging 3D Events to 2D Logic

**What it is:** The architectural pattern of translating a 3D visual intersection into a pure game-logic command.

**The problem before:** 
```js
if (clickedObject === btnA) {
  // Doing game logic directly inside the UI click handler
  pacmanY -= 50; 
  gameScore += 10;
}
```
If you mix game logic into your 3D raycaster code, the code becomes tangled. You couldn't reuse the game logic for a keyboard press without copy-pasting.

**The solution:** Separation of concerns. The Raycaster detects the click and simply calls a dedicated game function like `triggerJump()`. The 3D code knows nothing about Pac-Man's Y-coordinates.

**Example:**
```js
// In 3D code:
if (clickedObject.name === 'ButtonA') {
  triggerJump(); // Tell the game what action happened
}

// In 2D game code:
function triggerJump() {
  velocity = -10; // Handle the physics
}
```

**Why it matters here:** We want to keep our 3D presentation layer separate from our 2D game state.

---

## Step 2 — Naming the Meshes

To detect *which* specific mesh we clicked, we need a way to identify them. Three.js allows you to assign string names to objects.

Scroll up to **Step 3** from Lab 02, where you created `btnA` and `btnB`.
Add names to them:

```js
const btnA = new THREE.Mesh(btnGeo, btnMat);
const btnB = new THREE.Mesh(btnGeo, btnMat);

// NEW: Assign names so we can identify them during raycasting
btnA.name = "ButtonA";
btnB.name = "ButtonB";
```

---

## Step 3 — Adding Game Logic and Click Handlers

Let's modify our 2D Pac-Man logic to support jumping. 

Scroll to `updateAndDraw2DGame()` from Lab 03. Update it to include a Y-coordinate and gravity:

```js
// ── 2D Game Logic ────────────────────────────────────────────────────────────

let pacmanX = 0;
let pacmanY = 256; // Start in the middle (512 / 2)
let velocityY = 0;

export function triggerJump() {
  // Only jump if we are on the ground (rough approximation)
  if (pacmanY >= 256) {
    velocityY = -15; // Negative Y goes UP in 2D Canvas
  }
}

function updateAndDraw2DGame() {
  gameCtx.fillStyle = '#111111';
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Update X logic
  pacmanX += 3;
  if (pacmanX > gameCanvas.width + 50) pacmanX = -50;

  // Update Y logic (Gravity)
  velocityY += 1; // Gravity pulls down
  pacmanY += velocityY;
  
  // Floor collision
  if (pacmanY > 256) {
    pacmanY = 256;
    velocityY = 0;
  }

  const mouthOpen = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
  const radius = 40;

  gameCtx.fillStyle = 'yellow';
  gameCtx.beginPath();
  gameCtx.arc(
    pacmanX, 
    pacmanY, // Use dynamic Y coordinate now
    radius, 
    0.2 * mouthOpen * Math.PI, 
    (2 - 0.2 * mouthOpen) * Math.PI
  );
  gameCtx.lineTo(pacmanX, pacmanY); 
  gameCtx.fill();
}
```

Finally, update the `pointerdown` event listener at the bottom of the file to trigger this jump and flash the button:

```js
window.addEventListener('pointerdown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([consoleGroup], true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    
    if (clickedObject.name === "ButtonA") {
      // 1. Visual feedback: Briefly turn the 3D button white
      const originalColor = clickedObject.material.color.getHex();
      clickedObject.material.color.setHex(0xffffff);
      
      // Reset color after 150ms
      setTimeout(() => {
        clickedObject.material.color.setHex(originalColor);
      }, 150);

      // 2. Trigger Game Logic
      triggerJump();
    }
  }
});
```

### SAVE AND TRY

Save. Open the app.

You should see: The console spinning. Pac-Man moves across the screen. 

Click the spinning red 'A' button. 
Expected: 
1. The 3D button flashes white for a fraction of a second.
2. The 2D Pac-Man on the screen jumps into the air and falls back down.

Click the gray body of the console.
Expected: Nothing happens. 

Change `velocityY = -15;` (inside `triggerJump`) to `-30;`. Save. Click the button.
Expected: Pac-Man jumps so high he flies off the top of the screen before falling back down.
Change it back.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| NDC Conversion | Clicking anywhere accurately aligns the raycaster (tested implicitly by clicking the moving button). |
| Raycasting `intersectObjects` | The raycaster correctly identifies the nested child object inside the group (because we used `recursive = true`). |
| Visual Feedback | The material color temporarily changes to white on click. |
| Logic Bridging | Clicking the 3D button successfully modifies variables in the 2D game state. |

---

## Masterclass Complete

You have successfully learned:
1. Retained-mode 3D rendering (Scene, Camera, Renderer).
2. Lighting and Materials (Standard Materials, Ambient/Directional lights).
3. The Composite Pattern (Group) for nested coordinate systems.
4. Texture Mapping (CanvasTexture) to merge 2D logic with 3D visuals.
5. Raycasting for user interaction.

You now possess the foundational knowledge to build interactive 3D web applications, games, and CAD tools. 
