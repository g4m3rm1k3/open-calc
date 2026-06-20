// Three.js 2 · Chapter 0 · Lesson 0
// Why ES Modules & Import Maps

const LESSON_3JS2_0_0 = {
  title: 'Why ES Modules & Import Maps',
  subtitle: 'How modern JavaScript organises dependencies — and why every Three.js tutorial that skips this is teaching you wrong habits.',
  sequential: true,

  cells: [

    // ── Cell 1: The Problem with the Old Way ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Problem With Classic Three.js Tutorials

Most Three.js tutorials you'll find online use a pattern that looks like this:

\`\`\`html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
  const scene = new THREE.Scene();
</script>
\`\`\`

This is the **global script pattern**. Three.js dumps everything onto \`window.THREE\` — a single global object — and your code reads from it. It works, but it has serious structural problems that will bite you the moment you write real software.

| Problem | What happens |
|---------|--------------|
| **No tree-shaking** | You load the entire 600 KB library even if you use 5% of it |
| **No explicit dependencies** | You cannot tell from reading a file what it needs |
| **Order sensitivity** | If your script runs before Three.js loads, it crashes |
| **Not how production JS is written** | React, Vue, Node, Vite, Webpack — all use modules |

Three.js r147+ recommends ES Modules exclusively. This course uses them from the start.

---

### What Is an ES Module?

An **ES Module** is a JavaScript file that explicitly declares what it imports and what it exports. The browser can read these declarations and build a dependency graph automatically.

\`\`\`js
// Before ES Modules — global variables everywhere:
var scene = new THREE.Scene();   // where did THREE come from? Who knows.

// With ES Modules — explicit:
import * as THREE from 'three';
const scene = new THREE.Scene(); // 'three' is declared right here
\`\`\`

\`import\` and \`export\` are keywords. The browser resolves them. No bundle tool required.

You activate module mode with **\`type="module"\`** on your script tag:
\`\`\`html
<script type="module" src="lessons/01-scene.js"></script>
\`\`\`

Without this attribute, \`import\` is a syntax error. This is the #1 error beginners hit.

> **Important:** Module scripts are always **deferred** (they run after the HTML is parsed, not immediately). They are always **strict mode**. And they have their own scope — variables declared in a module are not automatically global.`,
    },

    // ── Cell 2: Import Maps ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Import Maps — Browser-Native Dependency Resolution

ES Modules resolve imports by URL. Without a build tool, you'd need to write the full CDN URL everywhere:

\`\`\`js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
\`\`\`

If you use Three.js in 10 lesson files, you have 10 URLs to update when the version changes. This is unmaintainable.

**Import maps** solve this. They are a JSON blob in a \`<script type="importmap">\` tag that teaches the browser how to resolve bare specifiers (plain names like \`'three'\`) to real URLs.

\`\`\`html
<script type="importmap">
{
  "imports": {
    "three":         "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
\`\`\`

Now every lesson file can write:
\`\`\`js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
\`\`\`

The import map is the **single place** that maps abstract names to concrete URLs. Change CDN providers? Edit one line. Your 10 lesson files are untouched.

> **Engineering Principle — Dependency Inversion (SOLID):**
> Your lesson files depend on the *abstract name* \`'three'\`, not on the concrete CDN URL. High-level modules should not depend on low-level details — they should depend on abstractions.

---

### Why Pin a Version?

\`@0.160.0\` pins the version. If you write \`three@latest\`, a Three.js update could silently break your code on any future page load. Pinning means your code works the same today, next year, and whenever a classmate loads it on their machine.

For open-source educational tools (like this one), version pinning is not optional — it is a responsibility to your users.`,
    },

    // ── Cell 3: Project File Structure ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Project File Structure

A clean Three.js project has a simple structure. Every lesson's JavaScript lives in its own file. The HTML never changes — you only switch which JS file the script tag points to.

\`\`\`
threejs-project/
├── index.html              ← Write once, never edit again
├── lessons/
│   ├── 01-scene.js         ← Your First Scene
│   ├── 02-geometry.js      ← BufferGeometry
│   ├── 03-materials.js     ← Materials & PBR
│   ├── 04-transforms.js    ← Transforms
│   ├── 05-scene-graph.js   ← Scene Graph
│   ├── 06-lighting.js      ← Lighting
│   ├── 07-animation.js     ← Animation Loop
│   ├── 08-math-vectors.js  ← Math & Vectors
│   ├── 09-raycasting.js    ← Raycasting
│   ├── 10-curves.js        ← Curves & Surfaces
│   └── project.js          ← Final Project
└── shaders/
    ├── vertex.glsl
    └── fragment.glsl
\`\`\`

The master \`index.html\` file:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Three.js Lesson</title>

  <!-- Import map: maps 'three' → CDN URL. One file, one version. -->
  <script type="importmap">
  {
    "imports": {
      "three":         "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
    }
  }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100vw; height: 100vh; overflow: hidden; background: #0a0a0f; }
    canvas { display: block; position: fixed; top: 0; left: 0; }
    #info {
      position: fixed; top: 1rem; left: 1rem;
      font-family: monospace; font-size: 0.75rem;
      color: rgba(255,255,255,0.6);
      pointer-events: none; z-index: 10; line-height: 1.8;
    }
  </style>
</head>
<body>
  <div id="info"></div>
  <!-- To switch lessons: change the src attribute here. -->
  <script type="module" src="lessons/01-scene.js"></script>
</body>
</html>
\`\`\`

**Why \`overflow: hidden\` on body?** Three.js creates a \`<canvas>\` that fills the viewport. Without this, scrollbars appear when the canvas is positioned absolutely, creating a 2px gap.

**Why \`pointer-events: none\` on \`#info\`?** The info overlay sits on top of the canvas. Without this, the overlay intercepts mouse clicks that are meant for the 3D scene (orbit controls, raycasting).

> **Gotcha — \`Cannot use import statement outside a module\`:** You wrote \`<script src="...">\` but forgot \`type="module"\`. This is the #1 error beginners hit. Without \`type="module"\`, the browser treats your file as a classic script — and classic scripts do not understand the \`import\` keyword.

> **Gotcha — \`Access-Control-Allow-Origin\` error:** You opened \`index.html\` directly with \`file://\`. ES Modules require HTTP. Run \`python3 -m http.server 8080\` in your project directory and open \`http://localhost:8080\`.`,
    },

    // ── Cell 4: Challenge — Module Behaviour ─────────────────────────────────
    {
      type: 'challenge',
      instruction: `You add \`type="module"\` to a script tag. Which of the following statements about that script is TRUE?`,
      options: [
        { label: 'A', text: 'The script runs immediately when the browser encounters the tag, before the rest of the HTML is parsed.' },
        { label: 'B', text: 'Variables declared with var inside the module become properties of window, accessible globally.' },
        { label: 'C', text: 'The script is deferred by default — it runs after HTML parsing is complete, and it has its own private scope.' },
        { label: 'D', text: 'The script requires a bundler like Webpack to work in the browser.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Module scripts are always deferred — they parse the HTML first, then run the script. They also run in strict mode and have their own module scope, so top-level variables are NOT added to window. This is very different from classic scripts, which execute immediately and pollute the global scope.',
      failMessage: 'The correct answer is C. Module scripts are always deferred (run after HTML parsing), always strict, and have their own scope. A is wrong — that describes a classic script with no defer attribute. B is wrong — module scope isolates top-level vars from window. D is wrong — browsers support ES Modules natively without any bundler since 2017.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    // ── Cell 5: Challenge — Import Maps ──────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Given this import map:
\`\`\`json
{ "imports": { "three": "https://cdn.example.com/three@0.160.0/three.module.js" } }
\`\`\`

You have 12 lesson files each containing \`import * as THREE from 'three';\`. You want to upgrade to Three.js r165. How many files must you edit?`,
      options: [
        { label: 'A', text: '12 — every lesson file that imports three.' },
        { label: 'B', text: '1 — only the import map, which is the single source of truth for the URL.' },
        { label: 'C', text: '0 — import maps update automatically when a new CDN version is published.' },
        { label: 'D', text: '13 — the 12 lesson files plus the import map itself.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! The import map is the single source of truth. Your 12 lesson files use the bare specifier \'three\', not the URL. To upgrade, you edit the URL in the import map exactly once. This is the Dependency Inversion Principle in practice: code depends on abstract names, not concrete URLs.',
      failMessage: 'The answer is B — 1 file. The import map maps the bare specifier \'three\' to the CDN URL. All 12 lesson files import from \'three\' (the abstraction), not from the URL directly. Changing the URL in the import map is the only change needed. This is the entire point of import maps: centralise concrete dependency details.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

    // ── Cell 6: Challenge — Why not file:// ───────────────────────────────────
    {
      type: 'challenge',
      instruction: `A student opens \`index.html\` by double-clicking it in Windows Explorer. The URL bar shows \`file:///C:/projects/threejs/index.html\`. The console shows a CORS error on every ES Module import. What is the fix?`,
      options: [
        { label: 'A', text: 'Add crossorigin="anonymous" to every script tag.' },
        { label: 'B', text: 'Serve the files via a local HTTP server (e.g. python3 -m http.server) and open http://localhost:8080 instead.' },
        { label: 'C', text: 'Disable CORS in the browser settings.' },
        { label: 'D', text: 'Switch from ES Modules to the global script pattern.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The browser\'s same-origin policy blocks ES Module imports from file:// URLs — there is no "origin" to verify. The fix is always to use a local HTTP server. The simplest: `python3 -m http.server 8080` in the project folder. Node users can use `npx serve .` or `npx http-server`. Any static file server works.',
      failMessage: 'The answer is B. CORS errors on file:// URLs occur because the browser enforces origin-based security even for local files, and file:// has no origin. The solution is to use a local HTTP server. You cannot disable this in browser settings without removing a core security mechanism. D (reverting to globals) would work technically but teaches bad habits and loses all module benefits.',
      html: '', css: 'body{margin:0}', startCode: '', outputHeight: 200,
    },

  ],
}

export { LESSON_3JS2_0_0 }

export default {
  id: 'three-js-2-0-0-es-modules',
  slug: 'es-modules-import-maps',
  chapter: 'three-js-2.0',
  order: 0,
  title: LESSON_3JS2_0_0.title,
  subtitle: LESSON_3JS2_0_0.subtitle,
  tags: ['three-js', 'es-modules', 'import-maps', 'javascript', 'setup', 'cdn'],
  hook: {
    question: 'Why do most Three.js tutorials use a global <script> tag that dumps everything onto window.THREE — and why is that a habit you should never learn?',
    realWorldContext: 'Every professional JavaScript codebase — React, Vue, Node, Vite — uses ES Modules. The global script pattern is a shortcut that trades correctness for convenience, breaking tree-shaking, explicit dependencies, and modern tooling. This lesson sets up the right foundation from the start.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'ES Modules use import/export keywords — the browser resolves dependencies explicitly.',
      'type="module" on a script tag activates module mode: deferred execution, strict mode, own scope.',
      'Import maps map bare specifiers like "three" to CDN URLs — one file to update, not every lesson.',
      'Version pinning (@0.160.0) means classmates loading your project 2 years later get the same behaviour.',
      'Running from file:// breaks ES Module CORS — always use a local HTTP server.',
    ],
    callouts: [
      { type: 'important', title: 'The #1 beginner error', body: 'Forgetting type="module" on the script tag. Without it, import is a syntax error. The browser treats the file as a classic script.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: LESSON_3JS2_0_0.title, props: { lesson: LESSON_3JS2_0_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'ES Module: a JS file with explicit import/export declarations — dependencies are traceable.',
    'Import map: JSON in <script type="importmap"> — maps "three" → CDN URL in one place.',
    'type="module": activates import syntax, defers execution, enables strict mode.',
    'Always serve from http://localhost — file:// blocks ES Module imports via CORS.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"ES Module: a JS file with explicit import/export declarations." How does the browser resolve import \'three\' without an import map?',
      options: [
        'It fetches from a CDN automatically',
        'It fails — bare module specifiers like \'three\' have no URL meaning in browsers. Only relative paths or full URLs are understood without an import map',
        'It uses the node_modules folder',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"type=\'module\': activates import syntax, defers execution, enables strict mode." Why does deferring execution matter for scripts that manipulate the DOM?',
      options: [
        'Deferred scripts run before the HTML is parsed, giving them priority access to DOM elements',
        'Deferred scripts run after the HTML is parsed — DOM elements exist when the script executes, so no need for DOMContentLoaded event listeners',
        'Deferring prevents the script from blocking image loading',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Always serve from http://localhost — file:// blocks ES Module imports via CORS." Why does the file:// protocol block module imports?',
      options: [
        'file:// URLs do not support JavaScript',
        'CORS rules treat all file:// URLs as cross-origin — importing modules from a file:// page triggers CORS checks the local file system cannot satisfy',
        'file:// is only blocked in Firefox',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Import map: maps \'three\' → CDN URL in one place." You upgrade Three.js from r158 to r159. How many files do you change with an import map?',
      options: [
        'Every file that imports \'three\'',
        'One — the import map entry. All files that import \'three\' automatically pick up the new URL',
        'The import map plus every file that imports a Three.js class',
      ],
      correct: 1,
    },
  ],
}
