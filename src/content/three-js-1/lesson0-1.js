// Three.js · Chapter 0 · Lesson 1
// What Is a Rendering Pipeline?
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   A rendering pipeline is the sequence of transformations that converts a
//   3D scene description (vertices, colours, textures) into a 2D image on screen.
//   Understanding this journey — from object space to screen pixels — is the
//   single most important mental model in all of real-time graphics.
//
// HISTORY:
//   - 1974: Ed Catmull proposes Z-buffer algorithm at Utah
//   - 1984: Silicon Graphics ships first hardware rasterisation pipeline (IRIS)
//   - 1996: 3dfx Voodoo — first consumer GPU with a fixed-function pipeline
//   - 2001: Nvidia GeForce 3 introduces programmable vertex shaders (DirectX 8)
//   - 2004: Shader Model 3.0 — programmable fragment shaders widely available
//   - 2007: OpenGL 3.2 / DirectX 10 — geometry shaders, transform feedback
//   - 2013: Mantle / 2016: Vulkan — explicit pipeline state objects replace hidden GL state
//   The story is one of moving from fixed, hard-wired silicon to fully programmable cores.
//
// MATHEMATICS:
//   1. Homogeneous coordinates: (x, y, z, w) — why the 4th component exists
//   2. Perspective divide: (x/w, y/w, z/w) → NDC space
//   3. Viewport transform: NDC → pixel coordinates
//      pixel_x = (NDC_x + 1) / 2 * viewport_width
//      pixel_y = (1 - NDC_y) / 2 * viewport_height  ← Y is flipped
//   4. Linear interpolation across a triangle: barycentric coordinates
//      P = α·A + β·B + γ·C,  where α+β+γ = 1
//
// CELL PLAN (9 cells to implement):
//   Cell 1: markdown — "The Journey of a Vertex" / why we need a pipeline at all
//   Cell 2: js       — Animated: a cube vertex traveling through each space
//                      Show 4 panels: Object → World → View → Clip → NDC → Screen
//   Cell 3: challenge— Q: "Which transform moves the camera in the scene?"
//   Cell 4: markdown — Homogeneous coordinates and the perspective divide explained
//   Cell 5: js       — Interactive: drag W slider, watch perspective divide squash/stretch
//                      Show (x,y,z,w) → (x/w, y/w, z/w) live
//   Cell 6: challenge— Q: "A point at (4, 2, 1, 2) in clip space. What are its NDC coords?"
//   Cell 7: markdown — Barycentric coordinates and rasterisation interpolation
//   Cell 8: js       — Interactive triangle with hoverable interior point
//                      Shows the 3 barycentric weights (α, β, γ) and interpolated colour
//   Cell 9: challenge— Q: "What happens if a barycentric weight is negative?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Pipeline Spaceship": a small cube drawn in each coordinate space side by side
//        Click a space to zoom in. Show the coordinate values updating in real time.
//   V2 — "Perspective Divide": a slider for W from 0.1 to 5.0
//        Left: clip-space point. Right: NDC point after divide. Show numerical calculation.
//   V3 — "Barycentric Explorer": clickable/draggable triangle
//        Three vertices each have a different colour. Interior point shows blended colour.
//        Numerical weights shown. Hovering outside → one weight goes negative → "clipped".
//
// CHALLENGE QUESTIONS:
//   1. View matrix purpose: moves objects to camera space (correct: D - "transforms
//      the world so the camera appears at the origin looking down -Z")
//   2. W component: what is (4, 2, 1, 2) in NDC? Answer: (2, 1, 0.5)
//   3. Barycentric: negative weight → fragment is outside the triangle → clipped/discarded
//
// THREE.JS PARALLEL:
//   camera.matrixWorldInverse  ← the View matrix Three.js computes automatically
//   camera.projectionMatrix    ← the Projection matrix
//   Object3D.matrix            ← the Model matrix (local transform)
//   Matrix4.multiplyMatrices() ← MVP multiplication
//   WebGLRenderer auto-passes  these as uniforms: modelViewMatrix, projectionMatrix
//
// STUDENT TASKS:
//   - Predict what NDC coords a point at the screen centre should have
//   - Manually compute the viewport transform for a 800×600 canvas
//   - Change vertex colours in the barycentric explorer and describe interpolation

const LESSON_3JS_0_1 = {
  title: 'What Is a Rendering Pipeline?',
  subtitle: 'The journey of a vertex from 3D space to a pixel on your screen.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 0-1

### What Is a Rendering Pipeline?
*The journey of a vertex from 3D space to a pixel on your screen.*

---

This lesson traces a single 3D point through every transformation stage until it becomes a coloured pixel — and makes every step fully interactive.

**🎯 What you'll master:**
- Why 4D homogeneous coordinates exist (and what the W component actually does)
- The six coordinate spaces: Object → World → View → Clip → NDC → Screen
- How the perspective divide creates the illusion of depth
- Barycentric coordinates — how colours, UVs, and normals are interpolated across triangle surfaces
- What "clipping" really means, geometrically

**🔬 Interactive experiments you'll run:**
- Watch a 3D cube transform through each space simultaneously, with live coordinate readouts
- Drag a W slider and see the perspective divide squash a point in real time
- Click inside a coloured triangle to see exact barycentric weights — then drag outside the edge and watch a weight go negative

**📐 Mathematics you'll derive:**
- perspective divide: (x/w, y/w, z/w) → NDC
- viewport transform: NDC → pixel coordinates (with the Y-flip explained)
- barycentric coordinates: P = αA + βB + γC where α+β+γ = 1

**⚡ Three.js connection:**
Three.js computes all of this automatically: \`camera.projectionMatrix\`, \`camera.matrixWorldInverse\`, \`Object3D.matrix\`. This lesson shows you *what those matrices contain* so you can manipulate them with confidence.`,
    },
  ],
};

export default {
  id: 'three-js-0-1-rendering-pipeline',
  slug: 'rendering-pipeline',
  chapter: 'three-js.0',
  order: 1,
  title: 'What Is a Rendering Pipeline?',
  subtitle: 'The journey of a vertex from 3D space to a pixel on your screen.',
  tags: ['three-js', 'pipeline', 'homogeneous-coordinates', 'ndc', 'clip-space', 'barycentric', 'foundations'],
  hook: {
    question: 'A 3D point at position (3, 1, -5) in your scene ends up at pixel (412, 307) on a 1920×1080 screen. What happened in between — and which of the six transformations along the way can you control?',
    realWorldContext: 'Every game engine, every 3D renderer, every GPU from a $20 embedded chip to a $2000 workstation card executes this exact sequence of transforms. Understanding it once means understanding all of them.',
  },
  intuition: {
    prose: [
      'A vertex travels through six coordinate spaces before becoming a pixel.',
      'Homogeneous coordinates (x, y, z, w) enable both linear transforms and perspective in one matrix.',
      'The perspective divide (÷w) is what creates the illusion of depth — distant objects appear smaller.',
      'Barycentric coordinates interpolate all per-vertex data (colour, UV, normal) across a triangle\'s surface.',
    ],
    callouts: [
      { type: 'important', title: 'The W component is not padding', body: 'W carries perspective information. After multiplying by the projection matrix, dividing by W compresses distant points toward the centre — this is what makes parallel lines converge.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Six spaces: Object → World (Model) → View (Camera) → Clip (Projection) → NDC (÷W) → Screen (Viewport)',
    'Homogeneous coords: (x,y,z,w). After projection matrix: divide all by w.',
    'NDC centre = (0,0,0). Corners = (±1, ±1, ±1). Y points up.',
    'Barycentric weights α+β+γ=1. Negative weight → outside triangle → fragment discarded.',
    'Three.js: camera.projectionMatrix × camera.matrixWorldInverse × object.matrix = MVP',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_1 };
