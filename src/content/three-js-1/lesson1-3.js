// Three.js · Chapter 1 · Lesson 3
// Shader Basics — GLSL Introduction
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   A shader is a small C-like program that runs on GPU cores. You write it once;
//   the GPU runs it in parallel on every vertex or every pixel simultaneously.
//   GLSL (OpenGL Shading Language) is the programming language for shaders.
//   This lesson teaches enough GLSL to write both stages correctly.
//
// HISTORY:
//   - Pre-2001: Fixed-function pipeline — no custom shaders, only on/off knobs
//   - 2001: DirectX 8 / OpenGL 2.0 assem-level vertex programs (ARB_vertex_program)
//   - 2003: OpenGL 2.0 — GLSL 1.10 introduced as a high-level shader language
//   - 2004: Shader Model 3.0 — 512 instruction limit raised to 65,535; mainstream adoption
//   - 2009: GLSL ES 1.00 — WebGL 1 shaders (restricted GLSL for embedded devices)
//   - 2013: GLSL ES 3.00 — WebGL 2 shaders (WebGL 2 target for this course)
//   GLSL ES 3.00 adds: in/out instead of attribute/varying, integer types, textureSize()
//
// MATHEMATICS / GLSL SYNTAX:
//   Types: float, int, uint, bool, vec2, vec3, vec4, mat2, mat3, mat4, sampler2D
//   Built-ins:
//     sin(x), cos(x), tan(x)     — trig (x in radians!)
//     pow(x,n), sqrt(x), abs(x)
//     mix(a, b, t)               — linear interpolation: a*(1-t) + b*t
//     clamp(x, min, max)         — clamp to range
//     normalize(v)               — unit vector
//     length(v)                  — vector magnitude
//     dot(a, b)                  — dot product
//     cross(a, b)                — cross product
//     reflect(I, N)              — reflection vector
//     texture(sampler, uv)       — sample a texture
//   Built-in fragment output:
//     out vec4 fragColor;        — (GLSL ES 3.00) the pixel colour
//   Built-in vertex output:
//     gl_Position = vec4(...)    — the clip-space position (required)
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — What is GLSL? Why a shader is a C-like language (not JS). 
//                      Vertex shader: one execution per vertex, outputs gl_Position
//                      Fragment shader: one execution per pixel, outputs a colour
//   Cell 2: js       — "GLSL Type Explorer": interactive type display
//                      Click vec3 → shows: vec3 v = vec3(1.0, 0.5, 0.0);
//                      Shows constructors, swizzling (.xyzw / .rgba), component access
//   Cell 3: challenge— Q: "vec4 c = vec4(1.0, 0.5, 0.25, 1.0). What is c.yz?"
//   Cell 4: markdown — Vertex shader: attributes (in vec3 aPosition) → built-in outputs
//                      Fragment shader: in variables from vertex stage + out vec4 fragColor
//                      Varying: the data passed from vertex → fragment (interpolated!)
//   Cell 5: js       — LIVE GLSL EDITOR: two Monaco editors (vertex + fragment)
//                      Compilable + runnable shader on a canvas quad
//                      Starter: passthrough vertex → solid colour fragment
//                      Task A: Output colour based on position (gradient from left to right)
//                      Task B: Output colour based on gl_FragCoord (screen-space coords)
//   Cell 6: challenge— Q: "Why is the varying (the position you pass from vertex to frag)
//                           NOT the same as gl_FragCoord?"
//   Cell 7: markdown — GLSL ES precision qualifiers: lowp, mediump, highp
//                      Fragment shaders require explicit precision declaration in mobile.
//                      Performance: lowp is faster on mobile GPUs (16-bit vs 32-bit).
//   Cell 8: js       — "Built-in Playground": A canvas with a full-screen quad
//                      Dropdown of ~8 sample GLSL snippets (sin waves, circles, UV pattern...)
//                      Live-edit each. Students can paste their own GLSL ideas.
//   Cell 9: challenge— Q: "What happens to a varying vec3 colour between a vertex where
//                           it is (1,0,0) and an adjacent vertex where it is (0,0,1)?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "GLSL Type Explorer": a large canvas showing all GLSL types as clickable cards
//        Click a type → see constructor syntax, swizzle examples, and use cases.
//   V2 — "Dual GLSL Editor": Monaco vertex + fragment editors with live canvas behind
//        Errors shown inline. Vertex compile errors vs program link errors distinguished.
//   V3 — "Shader Cookbook": dropdown library of 8 shader patterns
//        UV checker, sine wave animation, circle SDF, colour gradient, noise...
//        Each is editable. "Fork" creates a personal copy.
//
// CHALLENGE QUESTIONS:
//   1. c.yz = vec2(0.5, 0.25) — swizzling extracts the y and z components as a vec2
//   2. Varying position comes from vertex shader and is interpolated across the triangle.
//      gl_FragCoord is the screen-space (pixel) position of the fragment — entirely different.
//      Varying position is in whatever space the vertex shader outputs it (world, view, etc.)
//   3. Between the two vertices, the GPU linearly interpolates: colour = (1-t)*(1,0,0) + t*(0,0,1)
//      At t=0.5 you get (0.5, 0, 0.5) — purple. This is barycentric interpolation in action.
//
// THREE.JS PARALLEL:
//   new THREE.ShaderMaterial({
//     vertexShader: `...`,           — exact GLSL code (GLSL ES 3.00 format)
//     fragmentShader: `...`,         — exact GLSL code
//     uniforms: { ... }              — the uniform bindings
//   })
//   Three.js prepends shader chunk headers (#define GLSL 3, precision mediump float, etc.)
//   Available built-ins: position, normal, uv (attributes). modelViewMatrix etc. (uniforms).
//   THREE.RawShaderMaterial — NO auto-prepended headers. You control every line.
//
// STUDENT TASKS:
//   - Write a fragment shader that outputs a red circle, black outside (use length())
//   - Write a vertex shader that offsets each vertex position by sin(time * 0.001)
//   - Use the varying to pass world-space normal from vertex to fragment, output as rgb colour
//   - Find and fix a shader that crashes: a division by zero inside the fragment shader

const LESSON_3JS_1_3 = {
  title: 'Shader Basics — GLSL Introduction',
  subtitle: 'Writing your first GPU programs: the language, the types, and the two shader stages.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 1-3

### Shader Basics — GLSL Introduction
*GLSL is C for your GPU. Write it once; watch it run on thousands of cores simultaneously.*

---

**🎯 What you'll master:**
- GLSL ES 3.00 — the shader language for WebGL 2: types, operators, built-ins
- The **vertex shader**: runs per-vertex, must write \`gl_Position\`, anything else is optional
- The **fragment shader**: runs per-pixel, must write one \`out vec4\` colour, anything else is optional
- **Varyings**: data passed from vertex → fragment stage. The GPU interpolates it across the triangle.
- The full precision qualifier system (\`mediump\`, \`highp\`, \`lowp\`) and when mobile performance demands it
- Swizzling: \`v.xyz\`, \`v.rgba\`, \`v.xy = v.ba\` — GLSL's most expressive feature

**🔬 Interactive experiments you'll run:**
- Edit live GLSL vertex + fragment shaders and see changes render in real time
- Work through a shader cookbook: UV checkerboard, sine-wave animation, circle signed-distance function, noise
- Build a gradient by passing position as a varying and converting it to colour in the fragment stage

**📐 Mathematics you'll derive:**
- How the GPU linearly interpolates varyings using barycentric coordinates
- The \`mix(a, b, t)\` function and how it produces smooth gradients across triangle surfaces
- How \`sin(time)\` in a vertex shader produces animation: displacement oscillates smoothly

**⚡ Three.js connection:**
\`ShaderMaterial\` takes your exact GLSL strings (Three.js prepends version + precision headers). \`RawShaderMaterial\` gives you a completely clean slate with zero automatic headers — maximum control, maximum responsibility.`,
    },
  ],
};

export default {
  id: 'three-js-1-3-shader-basics',
  slug: 'shader-basics',
  chapter: 'three-js.1',
  order: 3,
  title: 'Shader Basics — GLSL Introduction',
  subtitle: 'Writing your first GPU programs: the language, the types, and the two shader stages.',
  tags: ['three-js', 'webgl', 'glsl', 'vertex-shader', 'fragment-shader', 'varyings', 'swizzle'],
  hook: {
    question: 'A fragment shader runs 96 million times per second. Each run takes one statement. The output of all 96 million runs is one frame. What does the statement look like — and what language is it written in?',
    realWorldContext: 'GLSL is the programming language running inside your GPU right now as you read this in a browser. Every website using WebGL, every game visual effect, every GPU-based machine learning operation executes GLSL (or its equivalent). Learning it once opens every graphics pipeline in existence.',
  },
  intuition: {
    prose: [
      'GLSL is C-like: typed variables, functions, control flow. No pointers, no heap, no recursion.',
      'vec2, vec3, vec4: the workhorses. Built-in operations: dot, cross, normalize, mix, clamp.',
      'Vertex shader: in attributes → transform → gl_Position + optional out varyings.',
      'Fragment shader: in varyings (interpolated) → compute colour → out vec4 fragColor.',
      'Varyings are linearly interpolated by the rasteriser between the triangle\'s vertices.',
    ],
    callouts: [
      { type: 'note', title: 'GLSL ES 3.00 vs 1.00', body: 'In WebGL 2 (GLSL ES 3.00): use "in" and "out" instead of "attribute" and "varying". Declare precision per shader. The first line must be: #version 300 es' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'GLSL types: float, vec2/3/4, mat4, sampler2D. Swizzle: v.xyz, v.yx, v.rgba',
    'Vertex shader: gl_Position required. Pass data out with "out vec3 vNormal;" declarations.',
    'Fragment shader: in vec3 vNormal; — receives interpolated varyings. Write: out vec4 fragColor;',
    'Built-in functions: normalize, dot, cross, reflect, mix, clamp, length, texture',
    'Three.js ShaderMaterial: your GLSL runs as-is (with Three.js header prepended).',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_3 };
