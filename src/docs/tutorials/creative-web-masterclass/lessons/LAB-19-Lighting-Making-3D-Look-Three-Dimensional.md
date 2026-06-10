# Creative Web Masterclass — LAB 19 — Lighting: Making 3D Look Three-Dimensional

**Prerequisites:** LAB-18. You have `MeshStandardMaterial` and `DirectionalLight` working.

**What this lab adds:**
- `PointLight` — a light that radiates from a single point with distance falloff
- `SpotLight` — a cone-shaped beam of light
- `emissive` — a material property that makes surfaces glow regardless of lighting
- Moving lights — animating light position in the loop
- Helper objects to visualize light positions in development

**Time:** 50–65 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │                                                      │
 │         ★ ← moving point light (colored)             │
 │     ●        ■        ◎                              │
 │   sphere     box    torus                            │
 │                                                      │
 └──────────────────────────────────────────────────────┘
   A scene lit by an orbiting colored point light.
   Objects glow on the side facing the light.
```

---

> **Quick Check — answer before reading further:**
>
> 1. `DirectionalLight` simulates the sun — parallel rays from a direction. What kind of
>    real-world light does `PointLight` simulate?
> 2. What is the difference between a material's `color` and its `emissive` color?
> 3. When a light moves, do you need to call any special update function, or does
>    Three.js detect the change automatically?
>
> *(Answers at the end)*

---

## Concept: `PointLight`

**What it is:** A light that shines equally in all directions from a single point in
3D space. Like a light bulb. Intensity falls off with distance.

```js
const pointLight = new THREE.PointLight(
  0xff4466,   // color — tinted light
  3.0,        // intensity
  20          // distance — light fades to zero at this distance (0 = infinite)
);
pointLight.position.set(3, 3, 3);
scene.add(pointLight);
```

The `distance` parameter controls falloff. At 0 the light reaches infinitely (but dims
naturally). A finite `distance` creates a hard cutoff where the light abruptly fades —
useful for colored accent lights that should not bleed too far across the scene.

**Watch for:** Multiple point lights in a scene are expensive. Each light requires an
additional pass over all affected geometry. Keep lights below 4–5 per scene for real-time
performance.

---

## Concept: `SpotLight`

**What it is:** A cone-shaped beam of light, like a spotlight or flashlight.

```js
const spotLight = new THREE.SpotLight(0xffffff, 2.0);
spotLight.position.set(0, 8, 0);
spotLight.target.position.set(0, 0, 0);   // what the cone aims at
spotLight.angle = Math.PI / 6;             // cone half-angle: 30 degrees
spotLight.penumbra = 0.2;                  // softness of the cone edge (0=hard, 1=fully soft)
scene.add(spotLight);
scene.add(spotLight.target);   // the target must also be added to the scene
```

`penumbra` controls the softness of the cone edge — `0` gives a hard theatrical spotlight;
`0.3` gives a soft gradual falloff.

---

## Concept: `emissive` Material Property

**What it is:** `emissive` adds a glow color to the material that is independent of lighting.
The object appears to emit light of that color, even in complete darkness.

```js
const material = new THREE.MeshStandardMaterial({
  color: 0x222244,        // base color (reacts to lights)
  emissive: 0x3322ff,     // glow color (does not react to lights)
  emissiveIntensity: 0.5  // 0–1 scale for the glow brightness
});
```

**Important:** `emissive` makes the material *look* like it glows but does not actually
emit light that illuminates other objects. Use an actual `PointLight` if you want a glowing
object to light the scene around it.

**Project Application:**
The portfolio hero (LAB-30) uses emissive materials to make particles look like they
contain light, adding visual depth without the performance cost of extra lights.

---

## Step 1 — Create Files

`projects/lab-19/index.html` and `styles.css` — same as LAB-17/18.

---

## Step 2 — Scene Foundation

`main.js`:

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080810);   // very dark background
scene.fog = new THREE.Fog(0x080810, 15, 40);   // fog starts at 15 units, fully opaque at 40

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

`scene.fog = new THREE.Fog(color, near, far)` adds distance fog — objects fade into the
background color as they get farther away. This hides the hard edge where the scene ends
and adds atmospheric depth.

---

> **SAVE AND TRY**
>
> **You should see:** A very dark background. No objects yet — just fog-ready scene.

---

## Step 3 — Lights

```js
// Dim ambient — just enough to see silhouettes
const ambientLight = new THREE.AmbientLight(0x111133, 1.0);
scene.add(ambientLight);

// Moving point light — colored pink/red
const pointLight = new THREE.PointLight(0xff4488, 4.0, 25);
scene.add(pointLight);

// Small sphere mesh to show where the point light is
const lightSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xff4488 })   // same color as the light
);
scene.add(lightSphere);   // will be moved in the animate loop
```

`lightSphere` is a small visualization mesh at the same position as the light. It moves
with the light so you can see where the light is. This is a common development technique
for debugging light positions.

---

## Step 4 — Objects

```js
function makeMat(color, roughness, metalness, emissive) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive: emissive || 0x000000,
    emissiveIntensity: emissive ? 0.3 : 0
  });
}

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 32, 32),
  makeMat(0x6c63ff, 0.2, 0.1, 0x220088)   // purple, slight emissive glow
);
sphere.position.set(-3, 0, 0);
scene.add(sphere);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1.3, 1.3),
  makeMat(0x4ecdc4, 0.1, 0.9)   // teal, metallic
);
box.position.set(0, 0, 0);
scene.add(box);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.9, 0.32, 20, 80),
  makeMat(0xff6b6b, 0.4, 0.0)   // red, matte
);
torus.position.set(3, 0, 0);
scene.add(torus);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  makeMat(0x0d0d1a, 1.0, 0)
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
scene.add(floor);
```

---

> **SAVE AND TRY**
>
> **You should see:** Three dim objects — lit faintly by the dark ambient light. The
> point light exists but is at position (0,0,0) — inside the box — so the lighting
> looks odd. The animation loop will fix this.

---

## Step 5 — Animation Loop

```js
let lightAngle = 0;

function animate() {
  lightAngle += 0.012;

  // Orbit the point light around the scene
  pointLight.position.x = Math.cos(lightAngle) * 5;
  pointLight.position.z = Math.sin(lightAngle) * 5;
  pointLight.position.y = Math.sin(lightAngle * 0.7) * 2 + 2;   // slight vertical bob

  // Move the visual sphere to match the light
  lightSphere.position.copy(pointLight.position);

  // Rotate objects
  sphere.rotation.y += 0.008;
  box.rotation.x += 0.006;
  box.rotation.y += 0.008;
  torus.rotation.x += 0.01;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

`lightSphere.position.copy(pointLight.position)` copies the light's position vector
directly — `copy` replaces the sphere's X, Y, Z with the light's X, Y, Z in one call.

---

> **SAVE AND TRY**
>
> **You should see:** A pink/red light orbiting the scene. As it sweeps around, the bright
> side of each object changes — one side is lit pink, the other is dimly blue-purple from
> the ambient light. The small pink sphere shows exactly where the light is. The fog softens
> the scene edges.
>
> **Change something:** Change `pointLight.color.set(0x4466ff)` in the console. The light
> turns blue. Or add in `main.js`: `pointLight.color = new THREE.Color(0x44ff66)` for green.

---

## 🎯 Challenge: Second Colored Light

**You know:** `PointLight`, `scene.add`, the animation loop.

**Task:** Add a second `PointLight` with color `0x4488ff` (blue) that orbits in the
opposite direction: `Math.cos(-lightAngle) * 4, y = 1, Math.sin(-lightAngle) * 4`.
Add a matching small sphere mesh to show its position. The two colored lights should
create dramatic color-split lighting on the objects.

---

<details>
<summary>▶ Show Solution</summary>

```js
const pointLight2 = new THREE.PointLight(0x4488ff, 3.0, 20);
scene.add(pointLight2);

const lightSphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x4488ff })
);
scene.add(lightSphere2);

// In animate():
pointLight2.position.x = Math.cos(-lightAngle) * 4;
pointLight2.position.z = Math.sin(-lightAngle) * 4;
pointLight2.position.y = 1;
lightSphere2.position.copy(pointLight2.position);
```

**Key insight:** Two lights of opposite colors (warm and cool) orbiting the same objects
creates dramatic rim lighting — each side of an object is lit by a different hue, which is
a classic three-point lighting technique adapted for 3D scenes.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Objects are shaded (not flat) | Bright and dark faces visible |
| Point light orbits the scene | Light source position changes each frame |
| Light visualization sphere moves | Small sphere tracks the light |
| Emissive glow on sphere | Purple sphere has slight self-illumination even in shadow |
| Fog fades distant edges | Scene edges blend into background |

---

## What's Next

LAB 20 introduces `THREE.Clock` — a time-keeping utility that gives consistent delta time
for Three.js animations, removing the need to manage `lastTimestamp` manually.

---

## Quick Check Answers

**1. What real-world light does PointLight simulate?**
A point light simulates any light source that radiates equally in all directions from a
single point — a light bulb, a candle, a glowing ember, a lamp. Unlike the sun (directional
light with parallel rays), a point light gets dimmer with distance because the energy
spreads over a larger area as distance increases.

**2. Difference between `color` and `emissive`?**
`color` is the surface color that reacts to lighting — in shadow it becomes very dark
(or zero with no ambient). `emissive` is added directly to the final color regardless
of lighting — it makes the surface appear to glow. A surface in complete darkness with
`emissive: 0x3300ff` will still show blue, while the same surface with only `color: 0x3300ff`
will appear black in darkness.

**3. Moving a light — do you need to call an update function?**
No. Three.js reads the light's current `position` on every `renderer.render(scene, camera)`
call. You simply modify `position.x`, `position.y`, `position.z` in the animation loop
and the next render will use the new position. No explicit notification is needed.
