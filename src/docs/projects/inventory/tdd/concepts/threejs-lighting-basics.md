# Concept: Minimal Real-Time Lighting — Ambient + Directional

**What you'll understand by the end:** why real-time 3D scenes typically combine two different, simple kinds of light rather than one, and what each contributes on its own.

**Prerequisites:** `threejs-renderer-scene-camera.md`.

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

A 3D shape rendered with no lighting model at all, or with only one kind of light, tends to look visually wrong in one of two specific, recognizable ways: flat and shapeless (every point on a surface the same brightness, no sense of form), or harshly split between fully lit and fully black (no illumination at all on anything facing away from the one light source). Something between those extremes is needed for a shape to read as solid.

## The Isolated Example

```typescript
import * as THREE from "three";

const scene = new THREE.Scene();
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x46d89f });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Stage 1: no lights at all.
// Real result: MeshStandardMaterial (a lit material) renders pure black —
// it has no light to reflect.

// Stage 2: ambient light only.
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
// Real result: the sphere renders as a uniform, flat gray-green disc —
// technically visible, but with no visible curvature or depth.

// Stage 3: add directional light.
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(2, 2, 2);
scene.add(dirLight);
// Real result: the sphere now shows a clear bright side facing the light
// and a darker (but not pure black) side facing away — real, visible
// curvature and form.
```

**What this proves:** each addition changes the render in a specific, attributable way — no light leaves a lit material black (it has nothing to reflect); ambient alone makes it visible but flat (every point lit equally, regardless of orientation); adding directional light on top is what actually reveals the sphere's 3D shape, because different points on its surface now receive different amounts of light depending on their angle to the light source.

## Mechanical Walkthrough

- **Ambient light** (`THREE.AmbientLight`) has no position or direction — it adds the same fixed amount of light to every surface in the scene, regardless of that surface's orientation. It exists to ensure nothing is ever *completely* unlit (real environments are rarely pure black in shadow, thanks to indirect/bounced light) — it is a simplified stand-in for that effect, not a physically accurate simulation of it.
- **Directional light** (`THREE.DirectionalLight`) simulates a light source infinitely far away, so its rays are treated as perfectly parallel (like real sunlight) — every point in the scene is lit from the same fixed direction, but *how much* light each point receives depends on that specific point's surface angle relative to the light, which is what produces visible shading and a sense of solid form.
- A material that ignores lighting entirely (like `LineBasicMaterial`, used for simple flat-colored lines) is unaffected by either kind of light — lighting only matters for materials specifically designed to react to it (`MeshStandardMaterial`, `MeshLambertMaterial`, and similar).
- Combining both is additive: a surface's final rendered brightness is the ambient contribution plus whatever directional contribution that specific point's angle produces.

## Execution Trace

Three real stages, the same sphere and material throughout, only the
scene's lights changing between them:

```
Stage 1: scene has 0 lights
  MeshStandardMaterial computes: (nothing to reflect) → every point on
  the sphere renders pure black, regardless of its surface angle

Stage 2: scene.add(AmbientLight(0xffffff, 0.7))
  MeshStandardMaterial computes: ambient contribution (0.7, uniform) +
  no directional contribution → every point gets the SAME flat
  brightness, regardless of angle → renders as one uniform gray-green
  disc, no visible curvature

Stage 3: scene.add(DirectionalLight(0xffffff, 0.8) at position (2,2,2))
  MeshStandardMaterial computes, per point on the sphere's surface:
    ambient contribution (0.7, still uniform, unchanged from Stage 2)
    + directional contribution (0.8 × how directly this specific
      point's surface normal faces the light at (2,2,2) — varies
      continuously across the sphere's real curved surface)
  → points facing the light: high total brightness (bright side)
  → points facing away: only the ambient 0.7 contributes (darker side,
    but not pure black, since ambient is still present)
  → renders with real, visible curvature and form
```

The ambient contribution (`0.7`) never changes once added in Stage 2 —
Stage 3's new visible shading comes entirely from the directional
light's own per-point angle calculation, added on top of that same
constant ambient base.

## CS Lens

This is a simplified, real-time-friendly approximation of how light actually behaves physically — a full physical simulation (tracing how light bounces around an entire scene, accumulating indirect illumination realistically) is computationally far too expensive to run many times per second, so real-time graphics substitutes cheap, direct approximations (a flat ambient term standing in for all indirect light; a single directional term standing in for a dominant light source) that produce a visually convincing result at a fraction of the cost. This tradeoff — physical accuracy versus real-time performance — is a recurring theme across real-time graphics generally.

Also recognized in: nearly every real-time 3D engine's "basic" lighting setup (Unity, Unreal, and every WebGL/OpenGL tutorial's starting point), and, more generally, any simulation domain that trades a fully accurate model for a cheaper approximation good enough for its actual purpose (a physics engine using simplified collision shapes instead of exact geometry, for a non-graphics example of the same underlying tradeoff).

## SE Lens

Adding both lights costs almost nothing computationally and is close to free to include even before a project's rendering strictly *needs* shading (a flat-colored line, for instance, ignores lighting entirely and would look identical with or without these lights present) — a real, deliberate example of setting up infrastructure a project's *next* real feature will need, at the moment the surrounding code is already being written, rather than revisiting the same file again later purely to add lights it could have had from the start.

## Connection

Builds on `threejs-renderer-scene-camera.md` — lights, like any other visible object, must be `scene.add()`ed to have any effect, using the exact same mechanism as any other scene member.

## Try It Yourself

1. Remove the directional light and increase the ambient light's intensity to `1.5` instead — observe that the sphere becomes fully bright but still completely flat, confirming intensity alone cannot substitute for a directional component's shading.
2. Change the directional light's `.position` to the opposite side of the sphere (e.g. `(-2, -2, -2)`) and observe the bright/dark sides swap accordingly — confirming the light's position genuinely determines *direction*, not just presence.
3. Add a second `DirectionalLight` from a different angle with a lower intensity, simulating a simple two-point studio lighting setup, and observe how it fills in some of the shadow side without fully flattening the shading the first light already established.
