// Three.js · Chapter 1 · Lesson 5
// Transformations & the MVP Matrix
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   The Model-View-Projection (MVP) matrix chain is the mechanism that places 3D objects
//   into the scene and projects them onto the 2D screen. Every 3D renderer in history has
//   used this pattern. This lesson builds each matrix from first principles, combines them
//   into MVP, and shows exactly what breaks when any component is removed or wrong.
//
// HISTORY:
//   - 1965: Ivan Sutherland uses matrix transformations in Sketchpad (first interactive 3D)
//   - 1968: The MIT pipeline formalizes Model → Eye → Screen transforms
//   - 1970s: PARC researchers codify the View (camera) matrix separately from the world
//   - 1984: RenderMan introduces the matrix stack concept (push/pop for scene hierarchies)
//   - 1992: OpenGL standardises the separate GL_MODELVIEW and GL_PROJECTION matrix stacks
//   - 2008: OpenGL 3.2 removes the built-in matrix stacks — you must manage MVP yourself
//   - 2011: WebGL 1 follows: no built-in matrices, user manages everything (Three.js does this)
//   Three.js manages all three matrices automatically from camera and object properties.
//
// MATHEMATICS:
//   Model matrix M:    places object in world space (TRS composed)
//   View matrix V:     inverse of camera world transform (lookAt construction)
//     Camera lookAt construction (right-hand, Y-up):
//       forward = normalize(eye - center)
//       right   = normalize(world_up × forward)
//       up      = forward × right
//       V = 4×4 matrix from these three basis vectors + eye position
//   Projection matrix P (perspective):
//       P[0][0] = 1 / (aspect × tan(fovy/2))
//       P[1][1] = 1 / tan(fovy/2)
//       P[2][2] = -(far + near) / (far - near)
//       P[2][3] = -2 × far × near / (far - near)
//       P[3][2] = -1
//   Vertex computation: gl_Position = P × V × M × vec4(position, 1.0)
//   (In GLSL: projectionMatrix * modelViewMatrix * vec4(position, 1.0))
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — Why one multiplication isn't enough. The three separate concerns:
//                      object transform (M), camera placement (V), perspective (P).
//   Cell 2: js       — "MVP Chain Visualiser": a 3D scene with a cube
//                      Three toggle buttons: M / V / P. Disabling each shows what breaks.
//                      Disable M: object stuck at origin.
//                      Disable V: camera at (0,0,0) looking down -Z, world appears fixed.
//                      Disable P: orthographic (no perspective depth cues).
//   Cell 3: challenge— Q: "You remove the View matrix. The cube renders but looks wrong.
//                           Describe exactly what you'd see and why."
//   Cell 4: markdown — Building the View matrix: the lookAt construction.
//                      Walk through the math: forward, right, up, translation.
//                      Intuition: the View matrix is the camera's world matrix INVERTED.
//   Cell 5: js       — "Camera Laboratory": a top-down 2D view of a scene
//                      Drag the camera position dot and look-target dot.
//                      The 4×4 View matrix updates numerically in real time.
//                      "Apply" renders the scene from that camera's perspective on the right.
//   Cell 6: challenge— Q: "The camera is at (0, 0, 5) looking at the origin.
//                           What is the View matrix's translation column roughly?"
//   Cell 7: markdown — The Projection matrix: perspective vs orthographic.
//                      Derive the perspective matrix terms from similar triangles.
//                      FOV, aspect ratio, near/far planes — clipping and depth precision.
//   Cell 8: js       — "Projection Explorer":
//                      Sliders: FOV (45°–120°), near (0.01–1.0), far (10–1000), aspect ratio
//                      Visual: the view frustum drawn as a 2D trapezoid shape
//                      Below: numerical projection matrix values
//                      Toggle orthographic ↔ perspective to see street-level vs blueprint effect
//   Cell 9: challenge— Q: "Increasing FOV from 45° to 90° — does the scene look zoomed in
//                           or zoomed out? What happens to the horizontal compression?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "MVP Dissector": three-panel render showing result with/without each matrix.
//        Side-by-side before/after for M, V, and P removal.
//   V2 — "Camera Lab": top-down canvas with draggable camera and target dots.
//        View matrix updates live. Right panel shows 3D perspective result.
//   V3 — "Frustum Explorer": the view frustum as an interactive 3D frustum shape.
//        Sliders for FOV, near, far, aspect. Shows clipped objects disappear.
//
// CHALLENGE QUESTIONS:
//   1. Without View matrix: camera is treated as being at the world origin looking down -Z.
//      The cube at (2, 0, -5) would render slightly right of centre, no camera positioning.
//   2. View matrix for camera at (0,0,5) looking at origin: translation column ≈ (0, 0, -5, 1)
//      because the View matrix moves the world in the opposite direction of the camera.
//   3. Wider FOV = more of the scene visible = each object appears smaller = "zoomed out".
//      tan(45°/2) ≈ 0.414, tan(90°/2) = 1.0 → P[0][0] halved → everything appears half as wide.
//
// THREE.JS PARALLEL:
//   renderer.render(scene, camera) — internally computes P × V for the camera:
//     camera.updateMatrixWorld()           → rebuilds camera world matrix (camera.matrixWorld)
//     camera.matrixWorldInverse            → the View matrix V
//     camera.projectionMatrix              → the Projection matrix P
//   For objects:
//     object.updateMatrixWorld()           → rebuilds object.matrixWorld (Model matrix M)
//   In shaders (auto-provided by Three.js ShaderMaterial):
//     modelMatrix, viewMatrix, projectionMatrix, modelViewMatrix (V×M pre-multiplied)
//     camera.lookAt(target)                → sets the camera's rotation quaternion
//     new THREE.PerspectiveCamera(fov, aspect, near, far)  → builds projection matrix
//
// STUDENT TASKS:
//   - Manually implement a lookAt function from the formula and compare to THREE.Matrix4.lookAt()
//   - Change the camera FOV from 75° to 120° and describe the perspective distortion at the edges
//   - Implement an orbit camera (spherical coordinates → cartesian position → lookAt)
//   - Remove the Projection matrix from your shader and describe what orthographic projection looks like

const LESSON_3JS_1_5 = {
  title: 'Transformations & the MVP Matrix',
  subtitle: 'The mathematical pipeline that places objects in the world and projects them onto screen.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 1-5

### Transformations & the MVP Matrix
*Model × View × Projection. Three matrices. One vertex position. Every 3D scene ever rendered used this exact formula.*

---

**🎯 What you'll master:**
- The **Model matrix** (M): places your object's local coordinates into the world
- The **View matrix** (V): moves the entire world into a camera-relative coordinate system (the camera is always at the origin in view space)
- The **Projection matrix** (P): squashes the 3D frustum into the unit cube — this is where perspective depth comes from
- How to derive the **lookAt** View matrix from scratch (forward/right/up basis vectors + translation)
- The perspective projection matrix: how FOV, aspect ratio, near, and far planes combine into 16 numbers
- What breaks visually when each matrix is removed — the fastest way to understand what each does

**🔬 Interactive experiments you'll run:**
- Toggle M, V, and P on/off individually — see exactly what each contributes visually
- Drag a camera position and look-target in a top-down view and watch the View matrix update live
- Adjust FOV from 45° to 120° and observe barrel distortion at wide angles; vary near/far and watch the depth buffer run out of precision

**📐 Mathematics you'll derive:**
- lookAt construction: forward = normalize(eye − target), right = cross(up, forward), up = cross(forward, right)
- Perspective P matrix terms from similar triangles: tan(fov/2) shrinks x,y proportionally to depth
- Near/far clipping: Z precision = log2(far/near) bits. Setting near=0.001 with far=10000 = depth fighting guaranteed.

**⚡ Three.js connection:**
\`new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)\` builds P. \`camera.lookAt(target)\` builds V. \`object.matrix\` is M. Three.js multiplies them automatically. \`modelViewMatrix\` = V×M (pre-multiplied for efficiency). In your ShaderMaterial: \`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)\` — one line that hides all the work above.`,
    },
  ],
};

export default {
  id: 'three-js-1-5-mvp-matrix',
  slug: 'mvp-matrix',
  chapter: 'three-js.1',
  order: 5,
  title: 'Transformations & the MVP Matrix',
  subtitle: 'The mathematical pipeline that places objects in the world and projects them onto screen.',
  tags: ['three-js', 'webgl', 'mvp', 'model-matrix', 'view-matrix', 'projection-matrix', 'lookat', 'perspective', 'fov'],
  hook: {
    question: 'Your vertex shader has one job: output gl_Position. The right output gets produced by multiplying three 4×4 matrices together. What are those three matrices, what does each do — and what is the visual result when you accidentally omit one?',
    realWorldContext: 'The MVP matrix chain was formalised in the 1970s at Xerox PARC and has been the core of every 3D renderer since. OpenGL\'s deprecation of its built-in matrix stacks in 2008 forced every developer to manage MVP themselves. This is the knowledge gap Three.js fills — and this lesson shows you what\'s inside.',
  },
  intuition: {
    prose: [
      'M (Model): transforms object vertices from object space to world space. TRS matrix.',
      'V (View): transforms world-space vertices to camera space. Inverse of camera world matrix.',
      'P (Projection): transforms camera-space vertices to clip space. Encodes FOV and depth range.',
      'MVP = P × V × M. Applied right-to-left: M first (in column-major convention).',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)',
    ],
    callouts: [
      { type: 'warning', title: 'Near plane and depth fighting', body: 'Setting near too small (like 0.001) wastes virtually all depth buffer precision near the far plane. A good rule: near/far ratio should be < 10,000. For outdoor scenes: near=0.1, far=5000. Never set near=0.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(localPosition, 1.0)',
    'Model matrix: translation × rotation × scale. Three.js builds from object.position/rotation/scale.',
    'View matrix = inverse(camera world matrix). Camera is at origin in view space.',
    'Projection matrix: encodes FOV, aspect, near, far. Makes things farther away appear smaller.',
    'Three.js: PerspectiveCamera(fov, aspect, near, far) + camera.lookAt(target) sets V and P.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_5 };
