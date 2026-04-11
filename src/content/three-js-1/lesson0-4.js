// Three.js · Chapter 0 · Lesson 4
// Coordinate Spaces
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   Every quantity in 3D graphics is defined relative to a coordinate space.
//   Confusing which space a value lives in is the #1 source of subtle rendering bugs.
//   This lesson builds a crystal-clear mental model of all five spaces used along
//   the graphics pipeline, and shows exactly when data crosses from one to another.
//
// HISTORY:
//   - René Descartes (1637) invents Cartesian coordinates in "La Géométrie"
//   - 1965: Ivan Sutherland's Sketchpad uses Eye Space (camera coordinates)
//   - 1970s: The "Object → World → Eye → Clip" pipeline formalized at PARC and Utah
//   - 1984: RenderMan introduces shader coordinate system queries (shading space etc.)
//   - 1992: OpenGL fixes the right-handed world space convention; Y-up by default
//   - 2009: Inigo Quilez popularises SDF (signed distance field) art in "shader space"
//   The choice of coordinate space in shaders still causes bugs in 2024 (tangent space normals!).
//
// MATHEMATICS:
//   1. Object Space (Local Space): origin at object pivot. Vertex positions stored here in VBO.
//   2. World Space: after Model matrix. Objects placed in the shared scene coordinate system.
//   3. View Space (Camera/Eye Space): after View matrix. Camera at origin, looking down -Z.
//      Right-handed: +X right, +Y up, -Z into screen.
//   4. Clip Space: after Projection matrix. Frustum mapped to a cube. W ≠ 1.
//   5. NDC (Normalized Device Coordinates): after perspective divide (÷W). [-1,1]³ cube.
//   6. Screen/Window Space: after viewport transform. Units = pixels.
//   
//   Important tangent-space note (preview for normal mapping lesson):
//   Each triangle has its own tangent space defined by the TBN matrix,
//   where N=normal, B=bitangent, T=tangent. Normal maps stored in tangent space!
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — The five coordinate spaces, why each exists, and what lives in each
//   Cell 2: js       — "Space Traveller" animation: a cube in Object space
//                      Press "Apply Model" → cube jumps to World space with offset/rotation
//                      Press "Apply View" → camera-relative transform shown
//                      Press "Apply Projection" → frustum squish visible
//                      Press "Divide W" → NDC cube fits [-1,1]
//   Cell 3: challenge— Q: "A vertex has position (0,0,0) in Object Space. After a Model
//                           matrix that translates (5,0,0), where is it in World Space?"
//   Cell 4: markdown — The View matrix: WHO moves, the world or the camera?
//                      (Answer: the world. The camera is mathematically fixed at origin.)
//   Cell 5: js       — "Camera Illusion" canvas: toggle between "move camera right" and
//                      "move world left" — they produce identical rendered images.
//                      Show the matrix values side by side.
//   Cell 6: challenge— Q: "The View matrix's inverse is also called the 'camera matrix' or
//                           'world matrix'. What does it represent?"
//   Cell 7: markdown — Tangent space (preview): why normal maps need their own coordinate
//                      system, and how the TBN matrix transforms between spaces
//   Cell 8: js       — "Space Stack" diagram: vertical list of spaces with arrow between
//                      Show each matrix name. Click a matrix to see its numerical contents
//                      for a sample scene (a box at (3,0,-5) with camera at (0,2,0))
//   Cell 9: challenge— Q: "In which coordinate space does the fragment shader receive its
//                           varyings by default in a Three.js ShaderMaterial?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Space Traveller": step-through animation (Next Space button)
//        Shows a cube, colour-coded coordinate axes, and the matrix applied at each step
//   V2 — "Camera Illusion": two toggle buttons, one scene rendered two ways
//        Matrix inspection panel shows they produce the same result
//   V3 — "Space Stack Inspector": a vertical diagram of all spaces
//        Click any transition to see the 4×4 matrix that performs it, with a real example
//
// CHALLENGE QUESTIONS:
//   1. (0,0,0) object space → (5,0,0) world space after T(5,0,0) model matrix
//   2. Camera matrix (camera.matrixWorld) = inverse of View matrix. It places the camera in world space.
//   3. Fragment shader receives varyings in view/eye space (screen-space normals) or world space
//      depending on how the vertex shader transforms them. Three.js ShaderMaterial passes
//      position in both view space (vViewPosition) and world space if you set up the varying.
//
// THREE.JS PARALLEL:
//   object.matrixWorld           — world space matrix (Object → World)
//   camera.matrixWorldInverse    — view matrix (World → View)
//   camera.projectionMatrix      — projection matrix (View → Clip)
//   camera.projectionMatrixInverse — inverse: for reconstructing world pos from depth
//   Built-in GLSL uniforms in Three.js ShaderMaterial:
//     modelMatrix           = object → world
//     viewMatrix            = world → view
//     projectionMatrix      = view → clip
//     modelViewMatrix       = object → view (pre-multiplied)
//     normalMatrix          = 3×3 inverse-transpose of modelViewMatrix (for normals)
//
// STUDENT TASKS:
//   - Move an object to (5,0,0) and compute its view-space position by hand
//   - Verify: camera.position + camera.getWorldDirection() gives the look-at point
//   - Change the camera's Y position and observe what changes in the view matrix

const LESSON_3JS_0_4 = {
  title: 'Coordinate Spaces',
  subtitle: 'Object, World, View, Clip, NDC, and Screen space — and when data crosses between them.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 0-4

### Coordinate Spaces
*Every rendering bug involving "wrong direction" or "flipped normals" is a coordinate space confusion. This lesson ends those bugs forever.*

---

**🎯 What you'll master:**
- The 5 coordinate spaces in the rendering pipeline and what data lives in each:
  **Object → World → View → Clip → NDC → Screen**
- Why the camera appears stationary — it's really the world that moves (the View matrix moves everything else into camera-relative positions)
- The tangent space TBN matrix: the secret behind normal maps (a preview for Tier 4)
- Which coordinate space your vertex shader outputs into, and which your fragment shader receives
- How to debug "wrong-space" bugs: the most common class of shader error

**🔬 Interactive experiments you'll run:**
- Step a cube through each coordinate space one matrix at a time — watch positions change at every stage
- Toggle between "camera moves right" and "world moves left" — see they produce identical images and identical view matrices
- Click on any space transition to inspect the actual 4×4 matrix for a sample scene

**📐 Mathematics you'll derive:**
- Why the View matrix is the inverse of the camera's world transform
- The normal matrix: why you can't use the model matrix for normals (use the inverse-transpose instead)
- Tangent space: each triangle defines a local coordinate system where the normal map's RGB = XYZ direction

**⚡ Three.js connection:**
Three.js provides all these as built-in GLSL uniforms: \`modelMatrix\`, \`viewMatrix\`, \`projectionMatrix\`, \`modelViewMatrix\`, and crucially \`normalMatrix\` (the inverse-transpose 3×3 for correct normal transformation).`,
    },
  ],
};

export default {
  id: 'three-js-0-4-coordinate-spaces',
  slug: 'coordinate-spaces',
  chapter: 'three-js.0',
  order: 4,
  title: 'Coordinate Spaces',
  subtitle: 'Object, World, View, Clip, NDC, and Screen space — and when data crosses between them.',
  tags: ['three-js', 'coordinate-spaces', 'world-space', 'view-space', 'clip-space', 'ndc', 'tangent-space', 'foundations'],
  hook: {
    question: 'A vertex is at position (0,0,0) in object space. After four matrix multiplications, it becomes pixel (960,540) on a 1920×1080 screen. What are its coordinates at every step along the way?',
    realWorldContext: 'Over 80% of confusing shader bugs — wrong normals, flipped directions, misaligned effects — are coordinate space bugs. Knowing exactly which space every vector lives in eliminates an entire class of errors that trip up even experienced graphics engineers.',
  },
  intuition: {
    prose: [
      'Object space: vertex positions as stored in the mesh. Origin at the object\'s pivot.',
      'World space: after Model matrix. Shared coordinate system for the whole scene.',
      'View (Eye) space: after View matrix. Camera sits at origin, looking down -Z.',
      'Clip space: after Projection matrix. The GPU clips here. W ≠ 1 generally.',
      'NDC: after ÷W. Fits inside [-1,1]³. GPU does this automatically between vertex and fragment stage.',
      'Screen space: after viewport transform. Units are pixels. Origin at top-left (or bottom-left in OpenGL).',
    ],
    callouts: [
      { type: 'important', title: 'The camera never moves', body: 'The View matrix is mathematically equivalent to moving the entire world in the opposite direction of the camera. The camera is always at the origin in View space — that is why it is called Eye space.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Five spaces: Object → (Model M) → World → (View V) → Eye → (Proj P) → Clip → (÷W) → NDC → (Viewport) → Screen',
    'View matrix = inverse of camera world matrix. Camera is always at origin in Eye space.',
    'Normal matrix = transpose(inverse(modelViewMatrix 3×3)). Do not use model matrix for normals — non-uniform scale breaks them.',
    'Tangent space: per-triangle coordinate system. Normal maps store directions in this space (RGB = XYZ in tangent space).',
    'Three.js provides: modelMatrix, viewMatrix, projectionMatrix, modelViewMatrix, normalMatrix as built-in GLSL uniforms.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_4 };
