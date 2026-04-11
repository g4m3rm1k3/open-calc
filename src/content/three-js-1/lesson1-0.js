// Three.js · Chapter 1 · Lesson 0
// Window & Context Setup
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   Before any pixel can be drawn, the browser needs a WebGL2 rendering context —
//   the software bridge between your JavaScript and the GPU driver. This lesson
//   sets up the canvas, creates the context, writes the first render loop, and
//   explains what happens each time the screen refreshes.
//
// HISTORY:
//   - 2006: Vladimir Vukicevic begins WebGL prototype at Mozilla (Canvas 3D)
//   - 2009: Khronos Group forms WebGL Working Group
//   - 2011: WebGL 1.0 shipped (OpenGL ES 2.0 binding for the web)
//   - 2017: WebGL 2.0 shipped (OpenGL ES 3.0 — adds instancing, UBOs, MRT)
//   - 2023: WebGPU emerges as the successor to WebGL (not yet covered in this course)
//   Three.js itself wraps WebGL 1 with a WebGL 2 fallback since r125.
//
// MATHEMATICS:
//   The render loop timing:
//     requestAnimationFrame fires ~16.67ms apart at 60Hz
//     DeltaTime = currentTime - previousTime
//     All animations should be multiplied by deltaTime (seconds) to be frame-rate independent
//   Canvas pixel ratio:
//     renderer.setPixelRatio(window.devicePixelRatio) — on Retina: 2×, renders 4× the pixels
//     Physical pixels = CSS pixels × devicePixelRatio
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — What is a context? The link between JavaScript and the GPU.
//   Cell 2: js       — Live editable code: create a canvas, get context, clear to colour
//                      Student changes gl.clearColor values and sees the canvas colour change.
//                      Shows the four-step pattern: get context → set state → execute → display
//   Cell 3: challenge— Q: "What does gl.clear(gl.COLOR_BUFFER_BIT) actually do?
//                           A) Resets the shader | B) Clears framebuffer colour data |
//                           C) Uploads vertex data | D) Swaps front/back buffer"
//   Cell 4: markdown — requestAnimationFrame: the render loop. Double buffering. VSync.
//                      deltaTime — why it matters for frame-rate independent animation
//   Cell 5: js       — Animated bouncing pixel: a 1×1 yellow square bouncing in a 300×300
//                      WebGL canvas. Shows the render loop structure in editable code.
//                      Task: change the bounce speed. Task: make it red.
//   Cell 6: challenge— Q: "If you removeEventListener for resize and the canvas becomes
//                           900px wide, what visual artefact appears?"
//   Cell 7: markdown — Pixel ratio, viewport, and scissor. Why Retina screens need special handling.
//   Cell 8: js       — Side-by-side: pixelRatio=1 vs pixelRatio=2 on a blurry text render
//                      Slider to toggle. Shows why WebGL text looks blurry by default.
//   Cell 9: challenge— Q: "Your canvas is 800×600 CSS pixels on a 2× Retina screen.
//                           What should you pass to gl.viewport()?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Colour Picker Context": RGBA colour sliders → gl.clearColor live preview
//        Shows the actual WebGL call text updating as sliders move
//   V2 — "Render Loop Inspector": animated canvas with a frame counter overlay
//        Pause button → shows we're NOT redrawing until RAF fires. Resume → smooth again.
//        Toggle "skip RAF" → canvas freezes proving why RAF is needed.
//   V3 — "Pixel Ratio Comparison": two identical canvases at DPR=1 and DPR=2
//        Zoom in on both to see aliasing. A toggle animates between them.
//
// CHALLENGE QUESTIONS:
//   1. gl.clear(gl.COLOR_BUFFER_BIT) clears the colour buffer (framebuffer colour data)
//   2. Canvas stretches/blurs — the internal drawing buffer doesn't match the CSS size.
//      Fix: update gl.viewport() and canvas.width/height on resize events.
//   3. gl.viewport(0, 0, 1600, 1200) — physical pixels = CSS * DPR = 800*2 × 600*2
//
// THREE.JS PARALLEL:
//   new THREE.WebGLRenderer({ canvas, antialias: true })   — creates context internally
//   renderer.setSize(width, height)                         — sets canvas + viewport
//   renderer.setPixelRatio(window.devicePixelRatio)         — Retina support
//   renderer.setAnimationLoop(callback)                     — wraps requestAnimationFrame
//   renderer.clear()                                        — gl.clear wrapper
//   renderer.info                                           — frame stats, draw calls, etc.
//
// STUDENT TASKS:
//   - Modify the bouncing square to bounce diagonally (fix the physics independently of fps)
//   - Add a resize event handler that correctly updates canvas size and viewport
//   - Comment out the gl.clear() call — explain what visual artefact appears and why

const LESSON_3JS_1_0 = {
  title: 'Window & Context Setup',
  subtitle: 'Creating a WebGL2 context, the render loop, and clearing the screen.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 1-0

### Window & Context Setup
*Before any pixel renders, the context must be created. This is where WebGL begins — and where Three.js hides 50 lines of boilerplate.*

---

**🎯 What you'll master:**
- What a WebGL context is and why the browser sandboxes GPU access through it
- The four-step WebGL pattern: **get context → set state → issue commands → display**
- The render loop with \`requestAnimationFrame\`: why you need it, what "double buffering" means, and how VSync works
- DeltaTime-based animation: why multiplying by elapsed time makes your code frame-rate independent
- The pixel ratio problem: why WebGL looks blurry on Retina displays and how to fix it

**🔬 Interactive experiments you'll run:**
- Live RGBA colour sliders → see your \`gl.clearColor\` changes happen in real time
- Pause and resume the render loop to observe exactly when redraws fire
- Compare a canvas at DPR=1 vs DPR=2 — zoom in to see the difference

**📐 Mathematics you'll derive:**
- Render budget: at 60 fps you have 16.67ms per frame. Fragment shader work that costs > 16ms = frame drops
- Physical pixels = CSS pixels × devicePixelRatio. Always pass physical pixels to \`gl.viewport()\`

**⚡ Three.js connection:**
\`new THREE.WebGLRenderer({ canvas })\` creates the WebGL2 context, sets the viewport, configures Retina support, and starts a render loop — these are the 50 lines of setup you skip by using Three.js. In this lesson, you write them by hand to understand exactly what Three.js does under the hood.`,
    },
  ],
};

export default {
  id: 'three-js-1-0-window-context',
  slug: 'window-and-context',
  chapter: 'three-js.1',
  order: 0,
  title: 'Window & Context Setup',
  subtitle: 'Creating a WebGL2 context, the render loop, and clearing the screen.',
  tags: ['three-js', 'webgl', 'context', 'render-loop', 'requestanimationframe', 'viewport', 'pixel-ratio'],
  hook: {
    question: 'Three.js renders your scene with one line: renderer.render(scene, camera). But behind that line the GPU ran ~60 commands. What are they — and what happens if one is missing?',
    realWorldContext: 'Every WebGL application in the world — from Google Maps 3D to the most complex game engine — opens with these exact context setup steps. Understanding them once means you can debug any blank-canvas problem in any WebGL app.',
  },
  intuition: {
    prose: [
      'The WebGL context is the controlled interface between JavaScript and your GPU driver.',
      'Every WebGL program opens with: canvas.getContext("webgl2"), then gl.clearColor(), then gl.clear().',
      'requestAnimationFrame fires before each screen repaint (~16.67ms at 60Hz). Your render loop lives here.',
      'DeltaTime: multiply all animations by (currentTime - prevTime) seconds to stay frame-rate independent.',
      'devicePixelRatio: on Retina, render at 2× resolution to avoid blur.',
    ],
    callouts: [
      { type: 'note', title: 'WebGL 1 vs WebGL 2', body: 'Always request WebGL 2 first with getContext("webgl2"). It adds instanced rendering, multiple render targets, and uniform buffer objects. Three.js uses WebGL 2 by default since r125.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Context = software bridge to GPU. One canvas, one context (can\'t share across canvases).',
    'Four-step pattern: get context → set state → issue commands → let browser display.',
    'Render loop: requestAnimationFrame(loop) — fires once per screen repaint, passes timestamp.',
    'DeltaTime: speed × (currentTime - prevTime) / 1000. Frame-rate independent.',
    'Three.js WebGLRenderer wraps all of this. renderer.setAnimationLoop(fn) = the render loop.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_0 };
