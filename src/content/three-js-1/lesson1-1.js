// Three.js · Chapter 1 · Lesson 1
// Your First Triangle
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   The triangle is the GPU's atomic drawing unit. Everything in real-time 3D —
//   a sphere, a character, a mountain — is ultimately a set of triangles.
//   This lesson builds the minimum viable WebGL program: 3 vertices → 1 triangle
//   on screen. Every line is explained. Every step is breakable and fixable.
//
// HISTORY:
//   - 1968: Ivan Sutherland renders the first interactive 3D wireframe on a HMD
//   - 1971: Gouraud shading — interpolating colour across triangle vertices
//   - 1974: Phong shading — per-pixel lighting (not just per vertex)
//   - 1980s: Silicon Graphics builds hardware triangle rasterisation into silicon
//   - 1996: 3dfx Voodoo — consumer GPU. "Hello triangle" becomes a rite of passage.
//   - Today: the triangle shader pipeline has been the GPU standard for 30+ years
//   The triangle is not an arbitrary choice: it is always planar, always convex,
//   and requires no extra subdivision. Quads/polygons are split into triangles by the GPU.
//
// MATHEMATICS:
//   Vertex positions in NDC (Normalized Device Coordinates) for the first triangle:
//     A = (-0.5, -0.5, 0)   lower-left
//     B = ( 0.5, -0.5, 0)   lower-right
//     C = ( 0.0,  0.5, 0)   top-centre
//   No projection needed when you place vertices directly in NDC.
//   gl_Position must output a vec4 in clip space. Since w=1, clip=NDC for our example.
//   Winding order: counter-clockwise = front face in OpenGL/WebGL (gl.FRONT default).
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — Why triangles? History. Every mesh = triangle soup.
//                      Winding order: CCW = front face. CW = back face (culled by default).
//   Cell 2: js       — "Triangle Builder": interactive canvas showing 3 movable vertex dots
//                      connected by lines. Toggle "fill" to rasterise. Show winding order
//                      arrow (CCW vs CW). Flip winding → back face culling hides triangle.
//   Cell 3: challenge— Q: "You swap vertices A and B in the array. The triangle disappears.
//                           What happened? (winding order reversed → back-face culled)"
//   Cell 4: markdown — The minimum WebGL program step-by-step:
//                      1. Float32Array of vertex positions
//                      2. gl.createBuffer() → gl.bindBuffer() → gl.bufferData()
//                      3. glsl vertex shader source string (positions passthrough)
//                      4. glsl fragment shader source string (hardcoded colour)
//                      5. gl.createProgram() → attach → link → use
//                      6. gl.vertexAttribPointer() → gl.enableVertexAttribArray()
//                      7. gl.drawArrays(gl.TRIANGLES, 0, 3)
//   Cell 5: js       — LIVE editable code: full minimum WebGL triangle
//                      Students can edit the vertex positions and colours inline.
//                      Syntax errors → red overlay with the WebGL compile error.
//   Cell 6: challenge— Q: "You change gl.drawArrays(gl.TRIANGLES, 0, 3) to (gl.LINES, 0, 3).
//                           What do you see?"
//   Cell 7: markdown — Breaking the triangle: common first failures and how to diagnose them
//                      - Blank canvas: shader compile error (check gl.getShaderInfoLog)
//                      - Pink/magenta: fragment shader failed, fallback colour
//                      - Correct shape, wrong position: coordinate system confusion
//   Cell 8: js       — "Debug Clinic": a deliberately broken triangle with 4 selectable bugs
//                      (missing bind, wrong stride, wrong winding, null shader check)
//                      Student selects which bug is active and fixes it in the code editor.
//   Cell 9: challenge— Q: "Your triangle renders but the colours are incorrect. You suspect
//                           the fragment shader failed silently. How do you verify?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Triangle Winding Explorer": 3 draggable vertex dots
//        Shows CCW/CW label, winding arrow, whether front/back face is shown.
//        Toggle gl.CULL_FACE to show/hide culled faces.
//   V2 — "Live WebGL Editor": Monaco editor (GLSL mode) + live canvas
//        Compilation errors shown below the editor in red. Success: green checkmark.
//        Template: minimal triangle. Student edits and sees changes instantly.
//   V3 — "Debug Clinic": 4 preset broken states, student must identify and fix each.
//
// CHALLENGE QUESTIONS:
//   1. Swapping A and B reverses winding order → triangle faces backward → culled
//   2. gl.LINES draws 3 separate lines connecting vertex pairs (0-1, 2-3, 4-5).
//      With 3 vertices it draws 1 line (pair 0-1), ignoring vertex 2.
//      Use gl.LINE_LOOP for closed outline.
//   3. gl.getShaderInfoLog(shader) or gl.getProgramInfoLog(program) show compile errors.
//      These return null/empty on success. Always check in dev mode.
//
// THREE.JS PARALLEL:
//   new THREE.BufferGeometry()                         — empty geometry
//   geometry.setAttribute('position', bufferAttr)      — sets position VBO (like bufferData)
//   new THREE.MeshBasicMaterial({ color: 0xff0000 })   — hardcoded colour fragment shader
//   new THREE.Mesh(geometry, material)                 — triangle soup with a material
//   scene.add(mesh)                                    — adds to scene graph
//   renderer.render(scene, camera)                     — calls gl.drawArrays internally
//
// STUDENT TASKS:
//   - Change the triangle to an upside-down triangle (flip Y coords of all 3 vertices)
//   - Add a second triangle to make a quad (4 vertices, 2 triangles from 6 positions)
//   - Make the fragment shader output a colour based on time (use a uniform float uTime)
//   - Deliberately break the shader and read the error from gl.getShaderInfoLog()

const LESSON_3JS_1_1 = {
  title: 'Your First Triangle',
  subtitle: 'The "Hello, World" of GPU programming — from a Float32Array to a lit pixel.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 1-1

### Your First Triangle
*Every 3D scene is triangles. This is where you build your first one from nothing — 7 steps, zero magic.*

---

**🎯 What you'll master:**
- Why GPUs use triangles exclusively (always planar, always convex, hardware-optimal)
- **Winding order**: CCW = front face, CW = back face. Flipping vertex order = invisible triangle
- The 7-step minimum WebGL triangle program — every line explained, every line breakable
- Shader compile errors: how to read \`gl.getShaderInfoLog()\` (the one debugging tool WebGL gives you)
- Common first-triangle failures and how to diagnose each from the symptoms alone

**🔬 Interactive experiments you'll run:**
- Drag 3 vertices and watch the winding-order arrow flip between CCW/CW — then enable back-face culling and watch the triangle vanish
- Edit live WebGL code: change vertex positions, output colour — see changes in real time with compile errors shown immediately
- Work through 4 deliberately broken WebGL programs in the "Debug Clinic" and fix each bug

**📐 Mathematics you'll derive:**
- Why NDC coordinates range from -1 to +1 and how to place your triangle in the centre of the screen
- The relationship between \`gl_Position = vec4(x, y, z, 1.0)\` and the clip→NDC transformation

**⚡ Three.js connection:**
\`new THREE.Mesh(geometry, material)\` is the triangle. \`BufferGeometry\` is your \`Float32Array\`. \`MeshBasicMaterial\` is your hardcoded colour fragment shader. In this lesson you write all three from scratch — then see why Three.js's abstractions are worth having.`,
    },
  ],
};

export default {
  id: 'three-js-1-1-first-triangle',
  slug: 'first-triangle',
  chapter: 'three-js.1',
  order: 1,
  title: 'Your First Triangle',
  subtitle: 'The "Hello, World" of GPU programming — from a Float32Array to a lit pixel.',
  tags: ['three-js', 'webgl', 'triangle', 'vertex-shader', 'fragment-shader', 'winding-order', 'glsl'],
  hook: {
    question: 'A triangle has 3 vertices. Each vertex is 3 floats. That is 9 numbers. So why does drawing one triangle on screen in raw WebGL take 60+ lines of code — and what does every single line actually do?',
    realWorldContext: 'The first OpenGL triangle tutorial has been the rite of passage for graphics programmers since the 1990s. Every game graphics engineer, every shader artist, and every VFX programmer has built this exact thing. Now it is your turn.',
  },
  intuition: {
    prose: [
      'All 3D geometry — spheres, characters, terrain — is triangles. The GPU knows only triangles.',
      'Winding order defines which face is front: counter-clockwise = front (in WebGL default).',
      'The 7 steps: array → buffer → vertex shader → fragment shader → program → attrib → draw.',
      'gl.getShaderInfoLog() is your only debugger. Always check it. Always.',
    ],
    callouts: [
      { type: 'caution', title: 'Silent failures are everywhere', body: 'WebGL does not throw exceptions. A broken shader produces a blank canvas with no error. You must call gl.getShaderInfoLog() and gl.getProgramInfoLog() explicitly to see what went wrong.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Triangle = 3 vertices in CCW order. CPU sends as Float32Array → GPU buffer → draw.',
    'Vertex shader: runs once per vertex. gl_Position = vec4(x,y,z,1.0) in clip space.',
    'Fragment shader: runs once per pixel. Output: a vec4 colour (RGBA, each 0.0–1.0).',
    '7 steps: Float32Array → createBuffer → bufferData → shaders → program → attribPtr → drawArrays',
    'Three.js: geometry.setAttribute("position", attr) + MeshBasicMaterial = this entire lesson',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_1 };
