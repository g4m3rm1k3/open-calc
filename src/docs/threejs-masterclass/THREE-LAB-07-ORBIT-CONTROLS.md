# eCaM v2 — LAB 07 — Reverse-Engineering OrbitControls

**Read [THREE-LAB-06-RAYCASTING-FUNDAMENTALS.md] first.**
This lab moves away from raycasting geometry and focuses on controlling the camera mathematically. In a CAD app, you need to pan, zoom, and orbit around your models precisely.

**What this lab adds:**
- Introduction to Spherical Coordinates.
- Why Euler angles cause "Gimbal Lock".
- Implementing basic Orbit mechanics without relying on a pre-built plugin.

---

## What You Will Build

You will take your static camera and write math to make it orbit around the `ORIGIN (0,0,0)` when the user drags the mouse. You will understand how professional camera controllers like Three.js's `OrbitControls` are built from scratch.

---

### Concept: Spherical Coordinates vs Cartesian Coordinates

**What it is:** 
- *Cartesian* uses X, Y, Z (Left/Right, Up/Down, Forward/Backward).
- *Spherical* uses Radius (Distance from center), Phi (Angle down from the North Pole), and Theta (Angle around the Equator).

**The problem before:** If a camera is at `(5, 5, 5)` and you want it to orbit around the center in a perfect circle while staying looking at the center, calculating the exact new X and Z Cartesian coordinates for every tiny mouse movement using raw Sine/Cosine math is a nightmare.

**The solution:** Convert the Cartesian `(X,Y,Z)` into Spherical `(Radius, Phi, Theta)`. Add the mouse movement to `Theta` (orbiting around), and convert it back to Cartesian `(X,Y,Z)`.

**Example:**
```js
const spherical = new THREE.Spherical().setFromVector3(camera.position);
spherical.theta += 0.05; // Orbit right
camera.position.setFromSpherical(spherical);
camera.lookAt(0,0,0);
```

**Why it matters here:** CAD trackball controls are entirely based on Spherical coordinates.

---

### Concept: Euler Angles and Gimbal Lock

**What it is:** Euler angles (`rotation.x`, `y`, `z`) apply rotations in a specific order (e.g., X then Y then Z). "Gimbal Lock" happens when two axes align perfectly, and you lose one degree of freedom (e.g., rotating X doesn't do anything because Y is flipped 90 degrees).

**The solution:** Quaternions. `THREE.Quaternion` is a 4D mathematical construct that represents a rotation without Gimbal Lock. Three.js uses Quaternions under the hood for all rotations. We mention it here because camera logic heavily relies on Quaternions to look at objects. `camera.lookAt()` generates a Quaternion internally.

---

## Step 1 — Basic Orbit Logic

Add this block to `main.js`, near the bottom before your animate loop.

```js
// ── Camera Controls (Orbit) ──────────────────────────────────────────────────

// Track mouse state
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// We store the camera's position as Spherical coordinates
const spherical = new THREE.Spherical().setFromVector3(camera.position);

window.addEventListener('pointerdown', (e) => {
  isDragging = true;
});

window.addEventListener('pointerup', () => {
  isDragging = false;
});

window.addEventListener('pointermove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    // Adjust Theta (orbit horizontally) and Phi (orbit vertically)
    // We multiply by a small sensitivity factor
    spherical.theta -= deltaX * 0.01;
    spherical.phi -= deltaY * 0.01;

    // Clamp Phi so the camera can't flip upside down over the poles
    // phi must be strictly greater than 0 and less than PI (180 degrees)
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

    // Convert back to Cartesian and apply to camera
    camera.position.setFromSpherical(spherical);
    
    // Crucial: The camera moved, so it must rotate to look back at the center
    camera.lookAt(ORIGIN);
  }

  // Store current position for the next frame
  previousMousePosition = { x: e.clientX, y: e.clientY };
});
```

### SAVE AND TRY

Save. Open the app. Click and drag the background.

You should see: The camera perfectly orbits around the spinning square!

Change `spherical.theta -= deltaX * 0.01;` to `spherical.theta += deltaX * 0.01;`. Save.
Now when you drag left, the camera orbits the opposite direction (inverted controls). Change it back.
