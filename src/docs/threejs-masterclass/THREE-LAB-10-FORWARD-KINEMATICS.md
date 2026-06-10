# eCaM v2 — LAB 10 — Forward Kinematics and Pivot Points

**Read [THREE-LAB-09-COMPOSITE-ASSEMBLIES.md] first.**
This lab introduces mechanical movement. You will learn the foundational math of Forward Kinematics used in robotic simulations, 3D character skeletons, and CNC machine simulators.

**What this lab adds:**
- Forward Kinematics.
- Understanding how to mathematically offset pivot points.

---

## What You Will Build

You will fix the "tearing" problem of 3D rotations, ensuring that when the robotic bicep rotates, it acts like a real hinge attached to the base, rather than spinning around its own center of mass like a floating ghost.

---

### Concept: Pivot Point Offsets

**What it is:** By default, WebGL rotates geometry around its absolute center `(0,0,0)` in Local Space. If you have a 5-unit tall box centered at `0`, it spans from `Y=-2.5` to `Y=2.5`. Rotating it spins it like a propeller. 

**The problem before:** Mechanical parts (like an arm or a door) do not spin like propellers. They rotate around a hinge located at one of their edges.

**The solution:** You must offset the geometry's vertices *inside* its local space so that the hinge sits at `(0,0,0)`. 
If you shift the box's geometry UP by `2.5` units, the bottom of the box now sits at `0`, and the top of the box sits at `5`. When you rotate the mesh now, it rotates around the bottom edge, like a real hinge.

**Example:**
```js
const bicepGeo = new THREE.BoxGeometry(1, 5, 1);
// Shift the raw vertices UP by half the height
bicepGeo.translate(0, 2.5, 0); 
```

**Why it matters here:** This is the core mathematical trick behind all 3D rigging and skeletal animation.

---

## Step 1 — Implementing the Pivot Offset

Open `main.js`. In the Assembly section, modify the Bicep geometry:

```js
// 3. The Bicep of the robot (A tall, thin box)
const bicepGeo = new THREE.BoxGeometry(1, 5, 1);

// NEW: Shift the vertices UP by 2.5 units so the bottom of the box is at Y=0
bicepGeo.translate(0, 2.5, 0);

const bicepMesh = new THREE.Mesh(bicepGeo, plasticMaterial);

// Remove the old local positioning we did in Lab 09:
// bicepMesh.position.y = 3;  <-- DELETE THIS

const bicepGroup = new THREE.Group();
// Place the structural group exactly on top of the base (Y=1)
bicepGroup.position.y = 1; 

bicepGroup.add(bicepMesh);
robotArmAssembly.add(bicepGroup);

window.bicepGroup = bicepGroup; // Expose to window for testing
```

Now, update your `animate` loop to automatically swing the bicep back and forth:

```js
function animate() {
  requestAnimationFrame(animate);

  // Forward Kinematics: Rotate the joint.
  // Because we offset the geometry, this rotation acts like a mechanical hinge.
  if (window.bicepGroup) {
    window.bicepGroup.rotation.z = Math.sin(Date.now() * 0.002) * 0.5; // Swing left and right
  }

  renderer.render(scene, camera);
}
```

### SAVE AND TRY

Save. Open the app.

You should see: The bicep smoothly swinging left and right like a pendulum or a real robot arm! It stays perfectly attached to the center of the base.

Change `bicepGeo.translate(0, 2.5, 0);` by commenting it out. Save.
Watch the animation. The bicep is now spinning through the middle of the base like a broken video game. The hinge is completely wrong.
Uncomment the line to fix the pivot point.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `geometry.translate` | The visual shape of the box shifts, but its `Mesh` position remains `0,0,0`. |
| Forward Kinematics | Modifying the rotation of a parent group cascades down perfectly around the new mechanical pivot. |

---

## Up Next

**[LAB-11 — The Exploded View (State Machines)](./THREE-LAB-11-EXPLODED-VIEWS.md)**

Your assembly works perfectly. But in CAD applications, users often want to see how an assembly fits together by pulling it apart into an "Exploded View". In LAB-11, we will implement a basic State Machine and use Linear Interpolation (Lerp) to smoothly animate our assembly blowing apart and reassembling.
