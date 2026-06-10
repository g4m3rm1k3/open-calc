# eCaM v2 — LAB 12 — Physically Based Rendering (PBR)

**Read [THREE-LAB-11-EXPLODED-VIEWS.md] first.** 
This lab begins Phase 4: Materials and Characters. Before we import complex Blender models, we must understand the material system that makes them look real.

**What this lab adds:**
- PBR (Physically Based Rendering).
- The BRDF (Bidirectional Reflectance Distribution Function).
- Metalness and Roughness parameters.

---

## What You Will Build

You will replace your basic gray robot arm with a polished, highly reflective steel base and a matte rubber bicep, visually distinguishing the two materials using the exact same underlying lighting math.

---

### Concept: Physically Based Rendering (PBR)

**What it is:** A shading model that calculates light reflection using the actual laws of physics (specifically, the conservation of energy) rather than just "guessing" what a highlight should look like.

**The problem before:** Older algorithms (like Phong or Blinn-Phong shading) required you to manually pick a "Diffuse Color" and a separate "Specular Color" (highlight). If you made the highlight too bright, the object emitted more light than hit it, breaking reality and looking like plastic 1990s CGI.

**The solution:** `MeshStandardMaterial`. In PBR, energy is conserved. Light that hits a surface is split into two paths:
1. **Specular:** Bounces off the surface like a mirror.
2. **Diffuse:** Enters the material, scatters, and bounces back out carrying the material's color.
The total light leaving the surface can never exceed the light hitting it.

**Why it matters here:** PBR allows you to create photorealistic metal, rubber, wood, and glass simply by tweaking two sliders (`metalness` and `roughness`), knowing that the math will automatically keep the lighting realistic in any environment.

---

### Concept: Metalness and Roughness

**What it is:** The two primary sliders of the PBR system.
- **Metalness (0.0 to 1.0):** Is this object a dielectric (plastic/wood/rubber) or a conductor (gold/steel)? Metals have no diffuse color; all light is reflected as Specular.
- **Roughness (0.0 to 1.0):** Is the surface microscopically smooth (like a mirror) or microscopically bumpy (like chalk)? Bumps scatter the specular reflection, making the highlight wide and blurry.

**Example:**
```js
// Polished Chrome (Mirror)
const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.0 });

// Matte Rubber Tire
const rubber = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.0, roughness: 0.9 });
```

---

## Step 1 — Applying PBR Materials

Open `main.js`. Find where we defined `plasticMaterial` in Lab 09. 
Delete it and replace it with two distinct materials:

```js
// ── PBR Materials ────────────────────────────────────────────────────────────

// 1. Polished Steel for the Base
const steelMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xaaaaaa, 
  metalness: 0.9,  // 90% metallic
  roughness: 0.2   // Slightly scratched, but highly reflective
});

// 2. Matte Red Rubber for the Bicep
const rubberMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xaa0000, 
  metalness: 0.0,  // 0% metallic (Dielectric)
  roughness: 0.8   // Highly rough, light scatters heavily
});
```

Now, update the Mesh creation code slightly below that to use these new materials:

```js
// Base uses steel
const baseMesh = new THREE.Mesh(baseGeo, steelMaterial);

// Bicep uses rubber
const bicepMesh = new THREE.Mesh(bicepGeo, rubberMaterial);
```

### SAVE AND TRY

Save. Open the app.

You should see: The robot arm base is now a shiny gray metal, and the swinging bicep is a flat, matte red rubber. The contrast between how the light hits the two materials is striking.

In DevTools Console, type:
  `window.bicepGroup.children[0].material.roughness = 0.0;`
Expected: The matte red rubber instantly turns into perfectly smooth, shiny red plastic or car paint! The highlight from the directional light will become an incredibly sharp, tiny white dot.
Change it back: `window.bicepGroup.children[0].material.roughness = 0.8;`.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `metalness` | The steel base looks heavy and reflective compared to the red bicep. |
| `roughness` | Setting roughness to 0.0 creates a sharp specular highlight; 0.8 makes it flat and diffuse. |

---

## Up Next

**[LAB-13 — The Asset Pipeline (GLTF)](./THREE-LAB-13-ASSET-PIPELINE.md)**

You can build geometry from scratch and make it look real. But nobody builds a complex character or a detailed V8 engine using `BoxGeometry` arrays typed by hand. You build them in Blender. In LAB-13, we learn how to fetch, load, and parse `.gltf` and `.glb` files into the Three.js Scene Graph asynchronously.
