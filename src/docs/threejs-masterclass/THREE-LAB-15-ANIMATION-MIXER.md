# eCaM v2 — LAB 15 — The Animation Mixer

**Read [THREE-LAB-14-SKELETAL-ANIMATION.md] first.** 
This lab brings complex keyframe animations to life. Instead of coding procedural math (like `Math.sin()` for swinging a robot arm), you will play pre-recorded animation data from Blender.

**What this lab adds:**
- `THREE.AnimationClip` and `KeyframeTrack`.
- The `AnimationMixer` (The engine that plays clips).
- Clock delta time.

---

## What You Will Build

You will set up the `AnimationMixer`, create a dummy `AnimationClip` representing a character breathing ("Idle" animation), and integrate the mixer into the rendering loop using a `Clock` so the animation plays at the correct speed regardless of framerate.

---

### Concept: AnimationClips and Keyframes

**What it is:** 
- A `KeyframeTrack` stores a list of times and values (e.g., At 0s, X=0; At 1s, X=10). 
- An `AnimationClip` is a collection of KeyframeTracks (e.g., the tracks for moving the shoulder, elbow, and wrist simultaneously to create a "Walk" cycle).

**The problem before:** Moving objects programmatically using `Math.sin()` works for pendulums, but a human walk cycle involves complex, non-linear timing across 50 bones. You cannot write that in code.

**The solution:** Animators create the motion in Blender. The `.gltf` file contains the raw `AnimationClip` data. You just tell Three.js to "play" it.

---

### Concept: The AnimationMixer

**What it is:** The playback engine attached to a specific object. You give the mixer a Clip, it generates an `AnimationAction`, and you call `.play()` on it.

**The problem before:** If a 30 FPS animation is playing, and your monitor runs at 144 FPS, updating the animation by "1 frame" every time the loop runs will cause the character to run 5 times faster than normal. 

**The solution:** The Mixer requires *Delta Time* (the exact amount of time in milliseconds that has passed since the last render). It mathematically interpolates the keyframes so the animation plays perfectly smoothly, regardless of if the game is running at 30 FPS or 240 FPS.

**Example:**
```js
const mixer = new THREE.AnimationMixer(characterMesh);
const action = mixer.clipAction(walkClip);
action.play();

// Inside animate loop:
mixer.update(clock.getDelta());
```

---

## Step 1 — Setting up the Mixer and the Clock

Open `main.js`. First, we need a `Clock` to track delta time. Add this near the top of your file:

```js
// ── Animation Engine ─────────────────────────────────────────────────────────
const clock = new THREE.Clock();
```

Next, scroll down to where you created `mockCharacter` in Lab 14. Add the mixer logic:

```js
// 1. Create the Mixer and bind it to the Root object
const mixer = new THREE.AnimationMixer(mockCharacter.mesh);

// 2. Create a mock AnimationClip (Normally this comes from gltf.animations)
// We will create a simple track that scales the arm up and down to simulate "breathing".
const scaleTrack = new THREE.VectorKeyframeTrack(
  '.scale',          // Which property to animate
  [0, 1, 2],         // Times (0 seconds, 1 second, 2 seconds)
  [1,1,1,  1,1.1,1,  1,1,1] // Values at those times (X,Y,Z vectors)
);
const breatheClip = new THREE.AnimationClip('IdleBreathe', 2, [scaleTrack]);

// 3. Create an Action and Play it
const breatheAction = mixer.clipAction(breatheClip);
breatheAction.play();
```

Finally, update your `animate` loop to feed the clock into the mixer:

```js
function animate() {
  requestAnimationFrame(animate);

  // Get the exact time passed since the last frame (e.g., 0.016 seconds)
  const delta = clock.getDelta();

  // Tell the mixer to advance the animation by that exact amount
  mixer.update(delta);

  // (Keep your robot arm kinematics running too)
  if (window.bicepGroup) {
    window.bicepGroup.rotation.z = Math.sin(Date.now() * 0.002) * 0.5;
  }

  renderer.render(scene, camera);
}
```

### SAVE AND TRY

Save. Open the app.

You should see: The tall cylindrical arm is slowly "breathing", expanding vertically by 10% and shrinking back down over exactly 2 seconds. The animation loops infinitely. 

In DevTools Console, type:
  `breatheAction.setEffectiveTimeScale(2.0)`
Expected: The animation instantly plays twice as fast. `timeScale` is how you make characters sprint or enter slow-motion.

Change `breatheAction.play();` to `// breatheAction.play();`. Save.
The arm will freeze. The Mixer is updating, but no Actions are active.
Uncomment the line.

---

## Up Next

**[LAB-16 — Draw Calls & GPU Bottlenecks](./THREE-LAB-16-GPU-BOTTLENECKS.md)**

Phase 4 is complete. You can import assets and animate them. 
Now we enter **Phase 5: Extreme Performance**. What happens when you try to render an entire city, or a mechanical assembly with 10,000 identical screws? In LAB-16, you will learn why CPU single-thread overhead crashes your game, what a "Draw Call" is, and how to measure it.
