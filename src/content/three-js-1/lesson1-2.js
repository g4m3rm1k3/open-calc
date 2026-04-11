// Three.js · Chapter 1 · Lesson 2
// Vertex Buffers — VAO, VBO, EBO
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   GPU memory is separate from CPU memory. To draw anything, you must explicitly
//   upload data into GPU-side buffer objects. This lesson teaches the three buffer
//   types every WebGL program uses — VBO (vertex data), EBO (index data), VAO
//   (the state container that remembers which buffers go with which attributes).
//
// HISTORY:
//   - OpenGL 1.1 (1997): display lists — compiled GPU command sequences, no explicit buffers
//   - OpenGL 1.5 (2003): VBOs introduced — first true GPU-resident vertex data
//   - OpenGL 3.0 (2008): VAOs introduced — a single bind restores all buffer state
//   - WebGL 1 (2011): no VAO support
//   - WebGL 2 (2017): VAOs available via gl.createVertexArray()
//   - Three.js uses VAOs internally (via WebGLBindingStates) since r120
//   Before VAOs existed, every draw call required re-specifying all vertex attrib pointers!
//
// MATHEMATICS:
//   Memory layout for interleaved vertex data:
//     [px, py, pz, nx, ny, nz, u, v] per vertex  — 8 floats = 32 bytes/vertex
//   Stride = 32, offset_position=0, offset_normal=12, offset_uv=24.
//   Index buffer: instead of duplicating shared vertices, reference them by index.
//   Quad (4 vertices → 2 triangles = 6 indices vs 6×3=18 floats wasted):
//     vertices = [TL, TR, BL, BR]  (4 vertices × 3 floats = 12 floats)
//     indices  = [0,1,2,  2,1,3]   (6 uint16s = avoids duplicating TL, BR)
//   Video memory savings: for complex meshes, ~30-50% memory reduction through indexing.
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — GPU memory model. Why CPU can't just pass JS arrays to shaders.
//                      VBO = vertex buffer object. Memory on the GPU.
//   Cell 2: js       — "Memory Layout Visualiser": canvas showing CPU array → GPU buffer
//                      Animated bytes flying from JS array to a GPU memory block diagram.
//                      Hover a byte range to see what attribute it maps to (pos/normal/uv).
//   Cell 3: challenge— Q: "You have 4 vertices each with position + UV (5 floats).
//                           What is the stride? What is the UV offset in bytes?"
//   Cell 4: markdown — EBO / Index Buffer: sharing vertices between triangles
//                      Without EBO: a cube = 36 vertices. With EBO: 24 unique + 36 indices.
//                      Show the maths. Explain drawElements vs drawArrays.
//   Cell 5: js       — "Quad Builder": interactive canvas
//                      Left: 6-vertex approach (no EBO): shows 6 vertex dots, 2 appear twice
//                      Right: 4-vertex + EBO: shows 4 unique vertices + index list
//                      Slider: increase vertex count to show growing memory savings of EBO
//   Cell 6: challenge— Q: "A sphere mesh has 1,000 triangles. The average vertex is shared
//                           by 6 triangles. Roughly how much GPU memory does EBO save?"
//   Cell 7: markdown — VAO: Vertex Array Object. The state container.
//                      Without VAO: re-specify all attribPointers before every draw call
//                      With VAO: bind the VAO, and all attrib state is remembered.
//                      Show code comparison: 15 lines → 3 lines.
//   Cell 8: js       — "VAO Visualiser": a diagram showing a VAO box containing VBO links
//                      and attrib state. Click "bind VAO" → highlighting shows state restored.
//                      Compare to a row of individual bind calls.
//   Cell 9: challenge— Q: "When should you create a VAO? Once at startup or once per frame?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Memory Layout Diagram": byte-level box diagram of a vertex (pos+normal+uv)
//        Each field is colour-coded. Hovering shows the gl.vertexAttribPointer() call.
//        Slider to switch between packed and interleaved layouts.
//   V2 — "Index vs No-Index Quad": two side-by-side visualisations with vertex count badge
//        Slider for mesh complexity → shows exponential memory savings of EBO.
//   V3 — "VAO State Machine": boxes + arrows showing VAO contents
//        Before/after binding — shows the program state change.
//
// CHALLENGE QUESTIONS:
//   1. 5 floats, 4 bytes/float → stride=20 bytes. UV offset = 3 floats × 4 = 12 bytes.
//   2. Without EBO: 3000 vertices (3 per tri). With EBO: ~500 unique + 3000 indices.
//      Each vertex: 12 bytes (position). Saved: (3000-500)×12 = 30,000 bytes = ~30KB per 1K tris.
//   3. Create the VAO ONCE at startup. Bind each frame (cheap). Never recreate per frame.
//
// THREE.JS PARALLEL:
//   new THREE.BufferGeometry()                          — creates/manages the VAO
//   geometry.setAttribute('position', bufAttr)          — calls bufferData + attribPointer
//   geometry.setIndex([0,1,2, 2,1,3])                   — creates the EBO
//   new THREE.BufferAttribute(float32Array, 3)          — typed array + component count
//   geometry.attributes.position                        — access the position VBO
//   geometry.computeVertexNormals()                     — uses EBO to average normals
//
// STUDENT TASKS:
//   - Draw a quad using only drawArrays (6 vertices, 2 triangles) — no EBO
//   - Convert to drawElements with a 4-vertex EBO, verify same output
//   - Build a triangle strip using gl.TRIANGLE_STRIP to draw 4 triangles with 6 vertices
//   - Inspect geometry.attributes in Three.js using console.log

const LESSON_3JS_1_2 = {
  title: 'Vertex Buffers — VAO, VBO, EBO',
  subtitle: 'How to efficiently upload geometry data to the GPU — and why index buffers save memory.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 1-2

### Vertex Buffers — VAO, VBO, EBO
*The GPU has its own memory. You must explicitly upload everything into it. This is how.*

---

**🎯 What you'll master:**
- Why the GPU has separate memory (VRAM) and why you can't just pass JavaScript arrays to shaders
- **VBO** (Vertex Buffer Object): GPU-resident vertex data uploaded via \`gl.bufferData()\`
- **EBO** (Element/Index Buffer Object): indices that let you reuse vertices across triangles — a cube goes from 36 to 24+36
- **VAO** (Vertex Array Object): the state container that remembers which VBOs and attrib specs belong together
- Interleaved vs separate attribute packing — and how stride/offset map to your float layout

**🔬 Interactive experiments you'll run:**
- See memory byte-by-byte: hover fields in an interleaved vertex layout and see the \`gl.vertexAttribPointer()\` call it maps to
- Compare a quad drawn 6-vertex (no EBO) vs 4-vertex+EBO — watch the memory counter change as mesh complexity grows
- Click "Bind VAO" in an animated diagram and watch it restore all attribute state in one call vs 5 separate calls

**📐 Mathematics you'll derive:**
- Stride = floats-per-vertex × 4. Byte offset = preceding-floats × 4
- Memory saved by indexing: for N triangles where each vertex is shared by K triangles = (K-1)/K × vertex data saved
- A sphere with 10,000 shared vertices typically saves ~40-50% GPU memory with an EBO

**⚡ Three.js connection:**
\`BufferGeometry\` manages your VAO, \`BufferAttribute\` wraps your Float32Array, and \`geometry.setIndex()\` creates the EBO — all the state Three.js tracks behind the scenes through \`WebGLBindingStates\`.`,
    },
  ],
};

export default {
  id: 'three-js-1-2-vertex-buffers',
  slug: 'vertex-buffers',
  chapter: 'three-js.1',
  order: 2,
  title: 'Vertex Buffers — VAO, VBO, EBO',
  subtitle: 'How to efficiently upload geometry data to the GPU — and why index buffers save memory.',
  tags: ['three-js', 'webgl', 'vbo', 'vao', 'ebo', 'buffer-geometry', 'vertex-data', 'gpu-memory'],
  hook: {
    question: 'A character mesh has 50,000 triangles. Without index buffers, the GPU stores 150,000 vertex positions. With index buffers: 25,000 unique positions + 150,000 two-byte indices. How much memory just got saved — and why does that matter at 60 fps?',
    realWorldContext: 'Every game and 3D application uploads geometry using this exact pattern: VBO for vertex data, EBO for indices, VAO to remember the setup. The pattern has not changed since OpenGL 1.5 in 2003. Master it once and it works everywhere.',
  },
  intuition: {
    prose: [
      'GPU and CPU have separate memory. Data must be explicitly uploaded across the PCI-e bus.',
      'VBO: a block of GPU memory holding vertex attributes (position, normal, UV...).',
      'EBO: an index buffer. References vertices by number rather than duplicating shared vertices.',
      'VAO: a container that records which VBOs and attribute specifications belong together.',
      'Bind pipeline: bind VAO → bind VBO → specify attribs → (bind EBO) → draw.',
    ],
    callouts: [
      { type: 'tip', title: 'VAO creation timing', body: 'Create VAOs once at startup. Bind each frame. Recreating a VAO per frame is a common performance mistake — it forces the driver to re-validate the entire attribute state every draw call.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'VBO = GPU memory block. Upload: createBuffer → bindBuffer → bufferData (STATIC_DRAW for unchanging).',
    'EBO = index buffer. drawElements(TRIANGLES, count, UNSIGNED_SHORT, 0) uses it.',
    'VAO = remembered state: "this VBO contains position at offset 0, stride 20, 3 components".',
    'Interleaved layout: [pos,pos,pos,uv,uv, pos,pos,pos,uv,uv...]. Stride=20, uvOffset=12.',
    'Three.js: BufferGeometry = VAO + VBOs. geometry.setIndex() = EBO. All hidden.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_2 };
