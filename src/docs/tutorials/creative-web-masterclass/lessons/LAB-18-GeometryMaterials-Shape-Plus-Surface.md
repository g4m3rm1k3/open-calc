# Creative Web Masterclass — LAB 18 — Geometry + Materials: Shape Plus Surface

**Prerequisites:** LAB-17. You have a rotating cube and know scene/camera/renderer.

**What this lab adds:**
- `MeshStandardMaterial` — a physically-based material that responds to light
- `AmbientLight` and `DirectionalLight` — the two most common light types
- `SphereGeometry`, `TorusGeometry`, `PlaneGeometry` — more built-in shapes
- `roughness` and `metalness` properties — how a surface behaves under light
- A scene with multiple lit objects

**Time:** 50–65 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │                                                      │
 │    ●      ◎       ■      ▬                           │
 │  sphere  torus   cube  plane                         │
 │                                                      │
 │  All lit by a directional light — shaded surfaces    │
 └──────────────────────────────────────────────────────┘
   Four objects showing different geometries and
   materials. One light source makes them look 3D.
```

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-17, the cube looked like a flat 2D square until it rotated. Why does
>    `MeshBasicMaterial` make 3D objects look flat?
> 2. What is the difference between ambient light and directional light? When would you
>    use each?
> 3. What does "physically-based rendering" (PBR) mean? What two properties does
>    `MeshStandardMaterial` add that `MeshBasicMaterial` does not have?
>
> *(Answers at the end)*

---

## Concept: `MeshStandardMaterial` and PBR

**What it is:** `MeshStandardMaterial` is Three.js's physically-based rendering (PBR)
material. Unlike `MeshBasicMaterial` (flat color, no lighting), it simulates how real
surfaces reflect light using two properties: `roughness` and `metalness`.

```js
const material = new THREE.MeshStandardMaterial({
  color: 0x6c63ff,
  roughness: 0.4,    // 0 = mirror smooth, 1 = rough matte
  metalness: 0.2     // 0 = non-metallic (plastic, rock), 1 = fully metallic (chrome)
});
```

**The two properties:**

| Property | Low value | High value |
|---|---|---|
| `roughness` | Sharp specular highlight (shiny) | Diffuse, spread-out light (matte) |
| `metalness` | Non-metallic — light reflects diffusely | Metallic — reflects environment color |

**Real-world examples:**
- Plastic: `roughness: 0.7, metalness: 0`
- Polished metal: `roughness: 0.1, metalness: 1`
- Rubber: `roughness: 0.95, metalness: 0`
- Gold: `roughness: 0.2, metalness: 0.9`

**What it hides:** The BRDF (bidirectional reflectance distribution function) — the
mathematical model for how surfaces scatter light. Three.js uses the GGX/Trowbridge-Reitz
model. You see only `roughness` and `metalness`.

**Watch for:** `MeshStandardMaterial` requires light to show anything. Without a light in
the scene, standard material objects appear completely black. `MeshBasicMaterial` ignores
lights and always shows its full color.

---

## Concept: `AmbientLight` and `DirectionalLight`

**What they are:** Two fundamental light types that cover most use cases:

**`AmbientLight`** — fills the entire scene equally from all directions. No shadows.
Prevents objects from going completely black on their unlit sides. Think of it as a
"base brightness."

```js
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);   // white, 30% intensity
scene.add(ambientLight);
```

**`DirectionalLight`** — parallel rays from a direction (like the sun). Creates shading —
some faces are bright, others are dim. Supports shadows.

```js
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);   // white, 120% intensity
dirLight.position.set(5, 8, 5);   // the light comes FROM this position
scene.add(dirLight);
```

The `position` of a `DirectionalLight` sets the direction the light rays come *from*,
not where the light "source" is. The rays are always parallel (like sunlight).

**Canonical lighting setup** (covers ~80% of use cases):

```js
// Low-level fill light so nothing is fully black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Main light — creates shading and highlights
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);
```

**Watch for:** Light intensity is not capped at 1.0 in Three.js. `1.2` intensity is valid
and makes a brighter light. HDR (high dynamic range) rendering allows values above 1.

---

## Concept: Built-in Geometry Types

**What they are:** Three.js includes ready-made geometry constructors:

```js
new THREE.BoxGeometry(w, h, d)              // rectangular box
new THREE.SphereGeometry(r, widthSegs, heightSegs)   // sphere
new THREE.TorusGeometry(r, tube, radialSegs, tubularSegs)  // donut
new THREE.PlaneGeometry(w, h)               // flat rectangle (one-sided)
new THREE.CylinderGeometry(rTop, rBottom, h, segs)   // cylinder/cone
new THREE.ConeGeometry(r, h, segs)          // cone
```

Segments control smoothness: `SphereGeometry(1, 8, 8)` has visible polygons (faceted),
`SphereGeometry(1, 32, 32)` looks smooth. More segments = more CPU/GPU work.

**Watch for:** `PlaneGeometry` is single-sided — only the front face is rendered. If you
look at it from behind, it is invisible. To fix: `material.side = THREE.DoubleSide`.

---

## Step 1 — Create Files

Same HTML structure as LAB-17:

`projects/lab-18/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 18 — Geometry + Materials</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      }
    }
    </script>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

`styles.css`: same as LAB-17 — `body { margin:0; overflow:hidden; }`.

---

## Step 2 — Scene, Camera, Renderer

`main.js` — set up the foundation:

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);   // dark background color

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2, 8);   // raised slightly, pulled back
camera.lookAt(0, 0, 0);         // look at the scene origin

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

`scene.background = new THREE.Color(0x0d0d1a)` sets the Three.js background color
instead of relying on CSS. This is cleaner for Three.js scenes.

`camera.position.set(0, 2, 8)` places the camera 8 units back and 2 units up. Without
the `lookAt` call, the camera would point forward (along -Z) and might miss the objects.
`camera.lookAt(0, 0, 0)` rotates the camera to aim at the origin.

---

> **SAVE AND TRY**
>
> **You should see:** A solid dark background. No objects yet.

---

## Step 3 — Add Lights

```js
// Ambient: base fill — prevents unlit sides from going fully black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Directional: main light — creates shading and highlights
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);
```

---

> **SAVE AND TRY**
>
> **You should see:** Still a dark background — no objects yet, but lights are ready.
> Lights without objects have no visible effect. This is correct.

---

## Step 4 — Add Four Objects

```js
// ---- Shared material helpers ----
function makeMaterial(color, roughness, metalness) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// ---- Sphere ----
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 32, 32),
  makeMaterial(0x6c63ff, 0.3, 0.1)   // smooth, slightly shiny purple
);
sphere.position.set(-4, 0, 0);
scene.add(sphere);

// ---- Torus (donut) ----
const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.8, 0.3, 16, 64),
  makeMaterial(0xff6b6b, 0.5, 0.0)   // matte red
);
torus.position.set(-1.3, 0, 0);
scene.add(torus);

// ---- Box ----
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  makeMaterial(0x4ecdc4, 0.1, 0.8)   // teal, metallic-looking
);
box.position.set(1.5, 0, 0);
scene.add(box);

// ---- Plane (floor reference) ----
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  makeMaterial(0x161628, 0.9, 0.0)   // very dark, rough
);
plane.rotation.x = -Math.PI / 2;    // rotate flat — planes face upward by default after rotation
plane.position.y = -1.2;
scene.add(plane);
```

`makeMaterial(color, roughness, metalness)` is a small helper function to avoid repeating
`new THREE.MeshStandardMaterial({...})` four times. It takes the three most important
properties and returns a material.

The torus: `TorusGeometry(radius, tube, radialSegs, tubularSegs)` — `radius` is the
distance from the center to the tube center. `tube` is the tube's own radius. More segments
= smoother donut.

---

> **SAVE AND TRY**
>
> **You should see:** Three objects — a sphere, a donut, and a teal box — lit and shaded.
> The directional light creates bright faces and dark faces. The floor plane is visible
> beneath them.
>
> **Change something:** Change the torus's `roughness` from `0.5` to `0.05`. It becomes
> very shiny — you can see a small specular highlight from the light. Change the box's
> `metalness` from `0.8` to `0`. It looks like painted plastic instead of metal.

---

## Step 5 — Animation Loop

```js
function animate() {
  // Each object rotates at a different rate and axis
  sphere.rotation.y += 0.008;
  torus.rotation.x += 0.01;
  torus.rotation.z += 0.006;
  box.rotation.x += 0.006;
  box.rotation.y += 0.008;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

---

> **SAVE AND TRY**
>
> **You should see:** All three objects rotating with shaded surfaces — the lit faces are
> bright and the shaded faces are dim (but not black, because of the ambient light). The
> torus's donut shape is clearly visible in 3D.

---

## 🎯 Challenge: A Fourth Geometry

**You know:** `scene.add`, materials, lights, position, rotation.

**Task:** Add a `THREE.ConeGeometry(0.6, 1.5, 32)` to the scene at position `(3.5, 0, 0)`.
Give it a yellow material with `roughness: 0.6, metalness: 0`. In the animate function,
make it oscillate up and down using `Math.sin`:

```js
cone.position.y = Math.sin(Date.now() * 0.002) * 0.5;
```

`Date.now()` returns milliseconds since the Unix epoch — a continuously increasing number.
`* 0.002` slows it down. `Math.sin(...)` produces a value from -1 to 1. `* 0.5` scales
it to -0.5 to 0.5 — a 1-unit total bob.

---

<details>
<summary>▶ Show Solution</summary>

```js
const cone = new THREE.Mesh(
  new THREE.ConeGeometry(0.6, 1.5, 32),
  makeMaterial(0xffe66d, 0.6, 0)
);
cone.position.set(3.5, 0, 0);
scene.add(cone);

// In animate():
cone.position.y = Math.sin(Date.now() * 0.002) * 0.5;
cone.rotation.y += 0.01;
```

**Key insight:** `Date.now()` is a simple way to get time-based animation without tracking
`deltaTime`. Multiply by a small number to control speed. `Math.sin` gives smooth oscillation
between -1 and 1. LAB-20 introduces Three.js's `Clock` for cleaner time tracking.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All objects visible and lit | Sphere, torus, box visible with shading |
| Ambient light prevents all-black | Unlit sides are dim, not black |
| Directional light creates highlights | Bright faces on lit side |
| Floor plane visible | Dark surface below the objects |
| Objects rotate in animate loop | All three objects moving |

---

## What's Next

LAB 19 goes deeper into lighting — adding `PointLight`, `SpotLight`, and emissive materials.
Lighting is what transforms a 3D scene from looking like a toy into looking like a real
render.

---

## Transfer Exercise

`MeshStandardMaterial` uses PBR (physically-based rendering) with `roughness` and `metalness`
parameters. Game engines use the same model — Unreal Engine calls it the Material Editor with
the same Roughness and Metallic inputs.

Look up one real-world object (e.g., a brushed aluminum laptop lid, a matte ceramic mug,
a polished car hood). Estimate its `roughness` and `metalness` values and explain your
reasoning. What would happen if you set `roughness: 0, metalness: 0` for the car hood?

---

## Quick Check Answers

**1. Why does `MeshBasicMaterial` make 3D objects look flat?**
`MeshBasicMaterial` ignores lighting entirely — every point on the surface has the exact
same color (`color: 0x6c63ff`). There is no variation in brightness across faces. Without
bright/dark faces, the brain has no shading cue to perceive depth. The cube looks like a
flat square because all faces are the same color.

**2. Ambient vs. directional light?**
Ambient light emits equally in all directions — every surface in the scene is lit by the
same amount regardless of angle. It has no direction. Directional light has a direction
(like sunlight) — surfaces facing the light are bright, surfaces facing away are dark.
Use ambient as a fill to prevent fully black shadows; use directional as the main light
source for shading and highlights.

**3. What is PBR? What two properties does MeshStandardMaterial add?**
Physically-based rendering uses mathematical models based on real-world physics of light
scattering to make materials look realistic under a variety of lighting conditions. The
two core properties are `roughness` (how microscopically rough the surface is — controls
highlight sharpness) and `metalness` (whether the surface is conductive — metals reflect
light differently than non-metals, tinting reflections with the surface color).
