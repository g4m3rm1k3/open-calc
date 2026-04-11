// Three.js · Chapter 1 · Lesson 4
// Attributes & Uniforms — CPU to GPU Data Flow
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   There are exactly two mechanisms for sending data from JavaScript (CPU) to
//   shaders (GPU): attributes (per-vertex, changes per vertex) and uniforms
//   (global, same value for every vertex and every pixel in a draw call).
//   Understanding which tool to use — and why — is the heart of shader programming.
//
// HISTORY:
//   - OpenGL 1.0 (1992): glColor, glNormal, glVertex — immediate mode, per-command per vertex
//   - OpenGL 1.5 (2003): VBO + glVertexAttribPointer — attributes from buffer objects
//   - OpenGL 2.0 (2004): Uniform variables — centralized constant data for all shader invocations
//   - OpenGL 3.1 (2009): Uniform Buffer Objects (UBOs) — batch multiple uniforms into one buffer
//   - WebGL 2: UBOs available (gl.createBuffer as UNIFORM_BUFFER) — not yet in WebGL 1
//   Uniforms are the primary way to animate shaders: pass time, matrix, colour per frame.
//
// MATHEMATICS:
//   Per-vertex data rate: attributes fire once per vertex = N_vertices times
//   Uniform data rate: uniforms fire once per draw call = 1 time regardless of vertex count
//   Example: 50,000 vertex mesh with a rotation matrix:
//     - As attribute: would need 50,000 copies of the matrix in the VBO (inefficient)
//     - As uniform: one copy, the GPU broadcasts to all shader invocations (correct)
//   UBO alignment rules: each uniform must be 4-byte aligned; std140 layout rules.
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — The two data paths. Analogy: attributes = each player's stats,
//                      uniforms = the game clock shared by everyone.
//   Cell 2: js       — "Data Flow Diagram": animated canvas showing:
//                      Left: CPU memory block with vertex arrays (position, colour per vertex)
//                      Center: draw call barrier
//                      Right: GPU — vertex shader invocations, each reading their slice
//                      A separate "uniform stream" hits ALL invocations simultaneously.
//   Cell 3: challenge— Q: "You want to animate 10,000 particles. Each particle has its own
//                           position that changes every frame. Should position be an attribute
//                           or a uniform? Why?"
//   Cell 4: markdown — Setting uniforms: gl.getUniformLocation() + gl.uniform1f/2f/3f/4f/Matrix4fv
//                      Timing: uniforms must be set AFTER gl.useProgram() and BEFORE gl.draw*
//   Cell 5: js       — LIVE: a triangle with a uTime uniform (float)
//                      The triangle's colour oscillates using sin(uTime)
//                      Task A: make it rotate using a rotation uniform (mat2 or angle uniform)
//                      Task B: pass a uColour uniform from a JS colour picker
//   Cell 6: challenge— Q: "You change a uniform value but the render looks the same.
//                           You called gl.uniform3fv before gl.useProgram. What's wrong?"
//   Cell 7: markdown — Per-vertex colour via attribute vs per-draw colour via uniform
//                      When to use each. Combining both in one shader.
//                      The 'flat' qualifier: disable interpolation of a varying (use vertex's value)
//   Cell 8: js       — "Attribute vs Uniform Comparator": two canvases side by side
//                      Left: 6 vertices each with a unique colour attribute → rainbow triangle
//                      Right: same geometry, single uColour uniform → solid colour
//                      Toggle which is actually "faster" for different scenarios (show draw-call cost)
//   Cell 9: challenge— Q: "In Three.js ShaderMaterial, what is the equivalent of gl.uniform1f(loc, v)?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Data Flow Diagram": animated CPU → GPU pipeline showing attribute vs uniform streams
//        Click a vertex → highlights its slice of the attribute buffer.
//        Click "uniform" → shows it hit ALL shader invocations with the same value.
//   V2 — "Uniform Animator": Live canvas with uTime, uColour, uScale sliders
//        Shows the JavaScript side (the uniform-setting calls) and the GLSL side simultaneously.
//        Real-time performance info: how expensive setting each uniform is.
//   V3 — "Attribute vs Uniform": side-by-side visual + code comparison
//        Slider for vertex count → shows when each approach is more efficient.
//
// CHALLENGE QUESTIONS:
//   1. Position changes per particle per frame → attribute (per-vertex, changes per vertex).
//      If position were a uniform, every vertex would have the SAME position.
//   2. gl.uniform* calls are only active for the currently-bound program (set by useProgram).
//      Must call gl.useProgram first, then set uniforms. Calling before = writes to wrong program or crashes.
//   3. Three.js: uniforms: { myValue: { value: 1.0 } } — the .value property is set from JS.
//      Update: material.uniforms.myValue.value = newValue; Three.js uploads on next render.
//
// THREE.JS PARALLEL:
//   Attributes:
//     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
//     In shader: in vec3 color; (attribute, Three.js provides this automatically)
//   Uniforms:
//     material = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0.0 } } })
//     Update: material.uniforms.uTime.value = clock.getElapsedTime()
//     In shader: uniform float uTime;
//   Built-in uniforms Three.js provides automatically (no setup needed):
//     uniform mat4 modelMatrix, viewMatrix, projectionMatrix, modelViewMatrix
//     uniform mat3 normalMatrix
//     uniform vec3 cameraPosition
//
// STUDENT TASKS:
//   - Add a per-vertex "intensity" attribute that dims/brightens each vertex's colour
//   - Animate a uWave uniform over time to create a wobbling vertex displacement
//   - Pass a colour from a JS HTML colour picker through a uniform to the fragment shader
//   - Print all uniform locations in a shader using gl.getProgramParameter(ACTIVE_UNIFORMS)

const LESSON_3JS_1_4 = {
  title: 'Attributes & Uniforms — CPU to GPU Data Flow',
  subtitle: 'The two mechanisms for sending data to shaders, and when to use each.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 1-4

### Attributes & Uniforms — CPU to GPU Data Flow
*Attributes change per vertex. Uniforms are the same for every vertex. Understanding this distinction is the entire job of data management in shaders.*

---

**🎯 What you'll master:**
- **Attributes**: per-vertex data (position, normal, UV, vertex colour). Each shader invocation reads its own slice of the buffer.
- **Uniforms**: per-draw-call constants (time, matrices, colours). One value shared across ALL invocations.
- The GPU's broadcasting model: why sending a matrix as a uniform is 50,000× more efficient than as an attribute for large meshes
- How to set uniforms correctly (\`gl.uniform1f\`, \`gl.uniformMatrix4fv\`) — including the common mistake of setting them before \`gl.useProgram\`
- **Varyings** revisited: data the vertex shader computes and passes to the fragment shader (interpolated in between)

**🔬 Interactive experiments you'll run:**
- Watch animated data flowing from CPU to GPU: attribute slices feeding individual shader invocations vs uniform values broadcasting to all invocations simultaneously
- Control a triangle's colour oscillation via a \`uTime\` uniform — then add a \`uColour\` uniform wired to a JS colour picker
- Compare per-vertex colours (attribute path) vs solid colour (uniform path) — see both code and visual result

**📐 Mathematics you'll derive:**
- Why animating via \`sin(uTime)\` creates smooth oscillation in shader output
- Performance: one \`gl.uniformMatrix4fv\` call per frame regardless of mesh size vs one attribute entry per vertex per frame

**⚡ Three.js connection:**
In Three.js ShaderMaterial: \`uniforms: { uTime: { value: 0.0 } }\`. Update with \`material.uniforms.uTime.value = clock.getElapsedTime()\`. Three.js also auto-provides: \`modelMatrix\`, \`viewMatrix\`, \`projectionMatrix\`, \`normalMatrix\`, and \`cameraPosition\` — no setup required.`,
    },
  ],
};

export default {
  id: 'three-js-1-4-attributes-uniforms',
  slug: 'attributes-and-uniforms',
  chapter: 'three-js.1',
  order: 4,
  title: 'Attributes & Uniforms — CPU to GPU Data Flow',
  subtitle: 'The two mechanisms for sending data to shaders, and when to use each.',
  tags: ['three-js', 'webgl', 'uniforms', 'attributes', 'glsl', 'data-flow', 'animation'],
  hook: {
    question: 'You want a mesh with 100,000 vertices to rotate slowly over time. You have two choices: store the rotation angle in each of the 100,000 vertex data slots, or store it once globally. Which one does the GPU prefer — and what are the two words graphics programmers use for these two choices?',
    realWorldContext: 'Every shader effect you have seen — rotating objects, colour cycles, animated waves, time-based procedural patterns — is driven by a uniform variable updated from JavaScript each frame. This is the most direct line of control you have over what every pixel on screen looks like.',
  },
  intuition: {
    prose: [
      'Attribute: per-vertex, fed from the VBO. Each shader invocation reads a different value.',
      'Uniform: per-drawcall constant. Every shader invocation (vertex AND fragment) reads the same value.',
      'Rule: if it changes per vertex → attribute. If it is the same for the whole draw call → uniform.',
      'Timeline: useProgram → set uniforms → bind VAO → draw. Uniforms set before useProgram are ignored.',
      'Three.js: material.uniforms.uTime.value = t — Three.js uploads on next renderer.render().',
    ],
    callouts: [
      { type: 'important', title: 'The most common uniform mistake', body: 'gl.uniform* calls only apply to the currently-bound program (the one set via gl.useProgram). Call useProgram FIRST, then set your uniforms. Calling uniform* before useProgram silently sets nothing.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Attribute: one value per vertex, read from VBO. Example: position, normal, UV, vertexColour.',
    'Uniform: one value for the whole draw call. Example: time, camera matrix, light position.',
    'Set order: gl.useProgram(prog) → gl.uniform1f(loc, val) → gl.drawArrays()',
    'Varying: vertex shader "out" → rasteriser interpolates → fragment shader "in".',
    'Three.js: uniforms: { uTime: { value: 0 } } → material.uniforms.uTime.value = t each frame.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_4 };
