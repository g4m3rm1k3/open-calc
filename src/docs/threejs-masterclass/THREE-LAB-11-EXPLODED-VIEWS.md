# eCaM v2 — LAB 11 — The Exploded View (State Machines)

**Read [THREE-LAB-10-FORWARD-KINEMATICS.md] first.**
This lab introduces procedural animation. You will build the classic CAD feature: an interactive "Exploded View" that smoothly tears an assembly apart to show its internal structure, and smoothly puts it back together.

**What this lab adds:**
- State Machines in 3D.
- Vector mathematics: `lerp` (Linear Interpolation).
- Decoupling target states from current states.

---

## What You Will Build

You will add a click event that toggles the state of your robot arm. When exploded, the bicep will float 5 units straight up into the air smoothly over 1 second. When clicked again, it will smoothly slide back down to attach to the base perfectly.

---

### Concept: Linear Interpolation (`lerp`)

**What it is:** A mathematical function that calculates a point somewhere on a straight line between two other points, based on a percentage (0.0 to 1.0).

**The problem before:** If you want an object to move from `Y=0` to `Y=10` smoothly over time, calculating the exact Y position for frame 1, frame 2, frame 3... requires managing timers, elapsed deltas, and division.

**The solution:** `THREE.Vector3.lerp(targetVector, alpha)`. 
- If `alpha` is `0.0`, it returns the start position.
- If `alpha` is `0.5`, it returns exactly halfway.
- If `alpha` is `1.0`, it returns the target position.

If you call `currentPos.lerp(targetPos, 0.1)` every single frame, the object will move 10% of the remaining distance every frame. This creates a beautifully smooth animation that starts fast and "eases out" perfectly into the target socket.

**Example:**
```js
const targetPos = new THREE.Vector3(0, 10, 0);

function animate() {
  // Move 5% closer to the target every frame
  mesh.position.lerp(targetPos, 0.05); 
}
```

---

### Concept: State Machines for Animations

**What it is:** Instead of saying "move the arm up", you define two rigid mathematical states: `ASSEMBLED` and `EXPLODED`. The object stores its "Target State". The animation loop just blindly `lerps` the object towards whatever its current Target State happens to be.

**Why it matters here:** If the user clicks "Explode" and then half a second later clicks "Assemble" before the animation finishes, the system won't break. The target simply changes mid-flight, and the `lerp` math seamlessly reverses direction.

---

## Step 1 — Defining the States and the Target

Open `main.js`. First, let's define the two mathematical states for the Bicep. Add this near your robot assembly code:

```js
// ── Assembly State Machine ───────────────────────────────────────────────────

// The two absolute states for the Bicep Group
const STATE_ASSEMBLED = new THREE.Vector3(0, 1, 0); // Resting on the base
const STATE_EXPLODED = new THREE.Vector3(0, 6, 0);  // Floating 5 units in the air

// The variable holding what the engine SHOULD be doing right now.
let targetBicepPosition = STATE_ASSEMBLED.clone(); 

// Listen for clicks on the window to toggle the state
window.addEventListener('pointerdown', () => {
  // If the target is currently ASSEMBLED, switch it to EXPLODED. Otherwise, switch back.
  if (targetBicepPosition.equals(STATE_ASSEMBLED)) {
    targetBicepPosition.copy(STATE_EXPLODED);
    console.log("Exploding assembly...");
  } else {
    targetBicepPosition.copy(STATE_ASSEMBLED);
    console.log("Rebuilding assembly...");
  }
});
```

Now, update your `animate` loop to mathematically chase the target every frame:

```js
function animate() {
  requestAnimationFrame(animate);

  if (window.bicepGroup) {
    // 1. Procedural Animation: Smoothly lerp towards the target position.
    // 0.05 means "move 5% of the remaining distance this frame".
    window.bicepGroup.position.lerp(targetBicepPosition, 0.05);

    // 2. Kinematics (Keep the swing animation running!)
    window.bicepGroup.rotation.z = Math.sin(Date.now() * 0.002) * 0.5;
  }

  renderer.render(scene, camera);
}
```

### SAVE AND TRY

Save. Open the app.

You should see: The robot arm swinging normally.

Click anywhere on the screen.
Expected: The swinging bicep smoothly slides 5 units straight up into the air, detaching from the base! It slows down naturally as it reaches the top (easing). 
Notice that it *keeps swinging* even while floating!

Click again.
Expected: It smoothly drops back down and mathematically locks perfectly into the `(0,1,0)` base socket.

Rapidly click the screen 5 times.
Expected: The bicep violently bounces up and down mid-air, never quite reaching the top or the bottom until you stop clicking. The `lerp` function seamlessly handles mid-flight interruptions without any complex logic or timers!

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `Vector3.lerp` | The movement starts fast and slows down as it approaches the destination. |
| State Decoupling | Clicking mid-flight immediately reverses direction smoothly without teleporting or throwing errors. |

---

## Up Next

**[LAB-12 — Physically Based Rendering (PBR)](./THREE-LAB-12-PHYSICALLY-BASED-RENDERING.md)**

Your interaction architecture is solid. Now we enter **Phase 4: Assets and Materials**. We need our CAD models to look like real metal and plastic. In LAB-12, we will dive deeply into the BRDF (Bidirectional Reflectance Distribution Function) and learn what `metalness` and `roughness` actually mean mathematically.
