# eCaM v2 — LAB 09 — The Composite Pattern (Assemblies)

**Read [THREE-LAB-08-BVH-AND-PERFORMANCE.md] first.**
This lab steps away from low-level memory and math, and moves into architectural design. If you are building a CAD/CAM application, you must handle complex hierarchical assemblies.

**What this lab adds:**
- Local Space vs World Space.
- The Composite Design Pattern.
- `THREE.Group`.

---

## What You Will Build

You will delete your spinning square and replace it with a 2-part robotic arm: A Base, and a bicep attached to it. 

---

### Concept: Local Space vs World Space

**What it is:** 
- *World Space* is the absolute `(0,0,0)` center of your entire 3D scene.
- *Local Space* is a coordinate system centered around a parent object. If you put a coffee cup on a table, the cup's *Local* position might be `(0, 10, 0)` relative to the table surface. If you move the table across the room, the cup's *Local* position is still `(0, 10, 0)` relative to the table, but its *World* position has changed massively.

**The problem before:** If you want to move a 50-part mechanical engine, you would have to calculate the new X, Y, and Z coordinates for all 50 parts manually, applying trigonometry to account for rotations.

**The solution:** Put all 50 parts inside a `THREE.Group`. 

---

### Pattern: The Composite Pattern (`THREE.Group`)

**What it is:** A structural pattern where a container object (the Group) acts exactly like a regular object (a Mesh). You can translate, rotate, and scale the Group, and the matrix math automatically cascades down to every child inside it.

**Example:**
```js
const table = new THREE.Group();
const cup = new THREE.Mesh(geo, mat);

cup.position.y = 10; // Local position (10 units above table center)
table.add(cup);

table.position.x = 100; // Move table 100 units right. The cup automatically moves too.
scene.add(table);
```

**Pattern category:** Structural
**Official name:** Composite (Gang of Four)
**Tradeoff:** Finding the absolute World coordinate of a deeply nested child requires traversing up the tree and multiplying matrices (`child.getWorldPosition()`), which is slightly slower than reading a flat `.position` vector.

---

## Step 1 — Building the Assembly

Open `main.js`. Delete your custom square geometry, material, mesh, and bounding box code.

Replace it with this basic robotic arm assembly:

```js
// ── Assemblies (The Composite Pattern) ───────────────────────────────────────

const plasticMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });

// 1. Create the Root Assembly Node
const robotArmAssembly = new THREE.Group();
scene.add(robotArmAssembly);

// 2. The Base of the robot (A wide, flat box)
const baseGeo = new THREE.BoxGeometry(4, 1, 4);
const baseMesh = new THREE.Mesh(baseGeo, plasticMaterial);
// The base sits on the floor
baseMesh.position.y = 0.5;
robotArmAssembly.add(baseMesh);

// 3. The Bicep of the robot (A tall, thin box)
const bicepGeo = new THREE.BoxGeometry(1, 5, 1);
const bicepMesh = new THREE.Mesh(bicepGeo, plasticMaterial);

// Local Position: Place it ON TOP of the base.
bicepMesh.position.y = 3; 

// We DO NOT add the bicep to the Scene. We add it to the Base!
// Wait, we add it to the assembly group instead of making it a child of the baseMesh directly.
// Best practice: Keep Meshes as visual leaves. Use Groups for structural nodes.
const bicepGroup = new THREE.Group();
bicepGroup.position.y = 1; // Pivot point sits on top of the base
bicepGroup.add(bicepMesh);

robotArmAssembly.add(bicepGroup);

window.robotArm = robotArmAssembly;
```

Remove the spinning logic from your `animate()` loop.

### SAVE AND TRY

Save. Open the app.

You should see: A T-shaped robot arm (a wide base with a tall pillar sticking out of it).

In DevTools Console, type:
  `window.robotArm.position.set(5, 0, 0)`
Expected: Both the base and the bicep instantly shift 5 units to the right together, proving the Composite pattern is working.
Change it back: `window.robotArm.position.set(0, 0, 0)`.

---

## Up Next

**[LAB-10 — Forward Kinematics](./THREE-LAB-10-FORWARD-KINEMATICS.md)**

You have a robot arm, but it is stiff. In LAB-10, we will learn about Forward Kinematics and Pivot Points. If you try to rotate the bicep right now, it will spin around its exact mathematical center, tearing it off the base. We will learn how to fix the rotational axis so it swings like a real mechanical joint.
