import type { LabElement, BodyStyles, JsFile, SinglePageData, ExampleData, Example } from "./types";
import { el } from "./exampleGallery";

// ── Starter files ────────────────────────────────────────────────────────────
// Unlike EXAMPLES (finished, feature-complete demo projects — see
// exampleGallery.ts), these are deliberately bare: the smallest possible
// starting point for one tool or technique, commented line-by-line so the
// comments themselves teach the setup. Think `npm create vite@latest`'s
// template picker — pick a foundation, then build on top of it yourself.
// Kept in their own file/gallery/button so they never get mistaken for a
// finished example project.

function generateReactStarter(): SinglePageData {
  const appJsx = `// ── App.jsx ──────────────────────────────────────────────────────────────
// The minimal shape every React app in HTML Lab starts from: one component,
// one mount point, one render call. React/ReactDOM load automatically as
// soon as any .jsx file exists in the project — no CDN toggle needed.
// Add more files with "+ File" above as your app grows; files share one
// scope (no import/export), so a component defined in an earlier file is
// just available by name to any file listed after it. See the
// "Tetris (React)" example for what that looks like split across 4 files.

function App() {
  // useState gives a component memory across renders — calling setCount
  // schedules a re-render with the new value.
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '48px', color: '#f8fafc' }}>
      <h1 style={{ margin: '0 0 8px' }}>Hello, React</h1>
      <p style={{ color: '#94a3b8', margin: '0 0 20px' }}>Edit App.jsx and press ▶ Preview to see changes.</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px 22px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '15px' }}
      >
        Clicked {count} times
      </button>
    </div>
  );
}

// Mounts <App /> into the #root element declared in the HTML tab — the one
// line that connects the component tree to the actual page.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`;

  const jsFiles: JsFile[] = [{ id: "react-starter-app", name: "App.jsx", code: appJsx }];

  const elements: LabElement[] = [
    el("root", "div", null, {
      display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center",
      textAlign: "center", fontFamily: "system-ui, sans-serif", fontSize: "16px", color: "#94a3b8",
    }, "This canvas is static — press ▶ Preview above to run the React app.", { id: "root" }),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#0f172a", color: "#f8fafc",
    fontFamily: "system-ui, sans-serif", minHeight: "100vh",
  };

  return { elements, bodyStyles, jsFiles, customCss: "" };
}

function generateThreeJsStarter(): SinglePageData {
  const elements: LabElement[] = [
    el("three-starter-root", "div", null, {
      position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#0f172a",
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
      fontFamily: "system-ui, sans-serif", fontSize: "16px", color: "#94a3b8",
    }, "This canvas is static — press ▶ Preview above to run the Three.js scene.", { class: "three-starter-root" }),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#0f172a", overflow: "hidden", fontFamily: "system-ui, sans-serif",
  };

  const javascript = `// ── script.js ────────────────────────────────────────────────────────────
// The minimum needed to get something spinning with Three.js: a scene, a
// camera, a renderer attached to the page, one mesh, and a render loop.
// See the "Solar System" example for a fuller scene built from these same
// five ingredients.

var container = document.querySelector('.three-starter-root');
container.textContent = ''; // clear the "press Preview" placeholder text

// 1. A scene is the container every 3D object gets added to.
var scene = new THREE.Scene();

// 2. A camera defines the viewpoint. PerspectiveCamera(fov, aspect, near, far).
var camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.z = 4;

// 3. A renderer draws the scene from the camera's view into a <canvas>,
// which we then attach to the page ourselves.
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
container.appendChild(renderer.domElement);

// 4. A mesh = geometry (the shape) + material (how it's shaded/colored).
var geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
var material = new THREE.MeshStandardMaterial({ color: 0x60a5fa });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lighting — MeshStandardMaterial needs a light source to be visible at all.
scene.add(new THREE.DirectionalLight(0xffffff, 2));
scene.add(new THREE.AmbientLight(0x404040, 1.5));

// 5. The render loop — requestAnimationFrame reruns this every frame, which
// is how "animation" happens: change something, redraw, repeat.
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.013;
  renderer.render(scene, camera);
}
animate();

// Keep the canvas filling its container if the window is resized.
window.addEventListener('resize', function () {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});`;

  return { elements, bodyStyles, javascript, cdnLinks: ["threejs"] };
}

function generateCanvas2dStarter(): SinglePageData {
  const elements: LabElement[] = [
    el("canvas2d-root", "canvas", null, {
      display: "block", background: "#0f172a",
    }, "", { id: "canvas2d-root", width: "600", height: "400" }),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#0f172a", display: "flex",
    alignItems: "center", justifyContent: "center", minHeight: "100vh",
  };

  const javascript = `// ── script.js ────────────────────────────────────────────────────────────
// The raw <canvas> 2D API — no library. A canvas needs a 2D "context" to
// draw with; everything below is drawn by calling methods on that context.

var canvas = document.getElementById('canvas2d-root');
var ctx = canvas.getContext('2d');

// A ball with a position and a velocity — this is the entire "physics" a
// bouncing-ball animation needs.
var ball = { x: 100, y: 100, vx: 3, vy: 2, radius: 24 };

function draw() {
  // Clear the previous frame — without this you'd see a trail of every
  // frame ever drawn, since canvas drawing is just "paint pixels," not
  // "manage persistent shapes" like the DOM does.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.fill();
}

function step() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Bounce off walls by reversing velocity when the ball's edge hits one.
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.vx *= -1;
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.vy *= -1;

  draw();
  requestAnimationFrame(step);
}
step();`;

  return { elements, bodyStyles, javascript, customCss: "" };
}

function generateGridLayoutStarter(): SinglePageData {
  const elements: LabElement[] = [
    el("grid-root",    "div",    null,         { display: "grid", gridTemplateColumns: "200px 1fr", gridTemplateRows: "60px 1fr", gridTemplateAreas: "\"header header\" \"sidebar main\"", minHeight: "100vh" }, "", { id: "grid-root" }),
    el("grid-header",  "header", "grid-root",  { gridArea: "header", display: "flex", alignItems: "center", padding: "0 20px", background: "#1e293b", color: "#f8fafc", fontWeight: "700" }, "Header"),
    el("grid-sidebar", "nav",    "grid-root",  { gridArea: "sidebar", background: "#0f172a", color: "#94a3b8", padding: "20px" }, "Sidebar"),
    el("grid-main",    "main",   "grid-root",  { gridArea: "main", background: "#111827", color: "#f8fafc", padding: "20px" }, "Main content"),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", fontFamily: "system-ui, sans-serif",
  };

  const customCss = `/* This is the whole layout — one parent with display: grid, naming its
   areas, and three children each claiming one named area. No floats, no
   absolute positioning, no JS. Resize the preview to see it stay put. */
`;

  return { elements, bodyStyles, customCss };
}

function generateFetchStarter(): SinglePageData {
  const elements: LabElement[] = [
    el("fetch-root",   "div",    null,          { fontFamily: "system-ui, sans-serif", padding: "32px", color: "#f8fafc" }, "", { id: "fetch-root" }),
    el("fetch-title",  "h1",     "fetch-root",  { margin: "0 0 16px", fontSize: "22px" }, "Fetch a user"),
    el("fetch-button", "button", "fetch-root",  { padding: "8px 18px", borderRadius: "8px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px" }, "Load user", { id: "fetch-button" }),
    el("fetch-output", "pre",    "fetch-root",  { marginTop: "16px", padding: "14px", background: "#0f172a", borderRadius: "8px", fontSize: "13px", color: "#94a3b8", minHeight: "20px" }, "Press the button to fetch.", { id: "fetch-output" }),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#111827", minHeight: "100vh",
  };

  const javascript = `// ── script.js ────────────────────────────────────────────────────────────
// The shape of nearly every network request a frontend makes: fetch, await
// the response, parse the body, render it — with a try/catch so a failed
// request shows up as a message instead of a silent dead button.

var button = document.getElementById('fetch-button');
var output = document.getElementById('fetch-output');

button.addEventListener('click', async function () {
  output.textContent = 'Loading…';
  try {
    var response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    if (!response.ok) throw new Error('Request failed: ' + response.status);
    var user = await response.json();
    output.textContent = JSON.stringify(user, null, 2);
  } catch (err) {
    output.textContent = 'Error: ' + err.message;
  }
});`;

  return { elements, bodyStyles, javascript, customCss: "" };
}

function generateFormStarter(): SinglePageData {
  const elements: LabElement[] = [
    el("form-root",    "form",  null,         { display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "60px auto", fontFamily: "system-ui, sans-serif", padding: "24px", background: "#1e293b", borderRadius: "10px" }, "", { id: "form-root" }),
    el("form-title",   "h2",    "form-root",  { margin: "0 0 4px", color: "#f8fafc", fontSize: "18px" }, "Sign up"),
    el("form-email",   "input", "form-root",  { padding: "9px 10px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }, "", { id: "form-email", type: "text", placeholder: "Email" }),
    el("form-submit",  "button","form-root",  { padding: "9px 10px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: "14px" }, "Submit", { type: "submit" }),
    el("form-message", "p",     "form-root",  { margin: "0", fontSize: "13px", color: "#94a3b8", minHeight: "16px" }, "", { id: "form-message" }),
  ];

  const bodyStyles: BodyStyles = {
    margin: "0", padding: "0", background: "#0f172a", minHeight: "100vh",
  };

  const javascript = `// ── script.js ────────────────────────────────────────────────────────────
// The one pattern every form needs: intercept submit (preventDefault stops
// the browser's default full-page reload), validate, then respond.

var form = document.getElementById('form-root');
var email = document.getElementById('form-email');
var message = document.getElementById('form-message');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!email.value.includes('@')) {
    message.textContent = 'Enter a valid email address.';
    message.style.color = '#f87171';
    return;
  }

  message.textContent = 'Submitted: ' + email.value;
  message.style.color = '#4ade80';
  form.reset();
});`;

  return { elements, bodyStyles, javascript, customCss: "" };
}

// ── Gallery export ─────────────────────────────────────────────────────────────
export const STARTERS: Example[] = [
  {
    id: "react-starter",
    name: "React App",
    description: "One component, one mount point, one render call — the minimal React setup",
    icon: "⚛️",
  generate: generateReactStarter as () => ExampleData,
  },
  {
    id: "threejs-starter",
    name: "Three.js Scene",
    description: "Scene + camera + renderer + spinning cube — the 5 ingredients every Three.js project starts from",
    icon: "🧊",
    generate: generateThreeJsStarter as () => ExampleData,
    requiresCdn: ["threejs"],
  },
  {
    id: "canvas2d-starter",
    name: "Canvas 2D",
    description: "A bouncing ball drawn with the raw <canvas> 2D context — no libraries",
    icon: "🖌️",
    generate: generateCanvas2dStarter as () => ExampleData,
  },
  {
    id: "grid-layout-starter",
    name: "Grid Layout",
    description: "Header / sidebar / main built with CSS Grid areas — pure CSS, no JS",
    icon: "▦",
    generate: generateGridLayoutStarter as () => ExampleData,
  },
  {
    id: "fetch-starter",
    name: "Fetch / API",
    description: "Button click → fetch → await → render — the shape of a real network request",
    icon: "🌐",
    generate: generateFetchStarter as () => ExampleData,
  },
  {
    id: "form-starter",
    name: "Form + Validation",
    description: "Intercept submit, validate, respond — the pattern every form follows",
    icon: "📝",
    generate: generateFormStarter as () => ExampleData,
  },
];
