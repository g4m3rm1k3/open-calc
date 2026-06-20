// Three.js · Chapter 2 · Lesson 3
// Camera System — FPS Camera

const LESSON_3JS_2_3 = {
  title: 'Camera System — FPS Camera',
  subtitle: 'Yaw, pitch, look direction — from mouse input to a View matrix.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### What You Will Learn

- The two-angle model: yaw (Y-axis) and pitch (X-axis)
- How to convert yaw/pitch to a look direction vector
- Why pitch is clamped to ±89° (the gimbal lock boundary)
- Building strafe and forward movement from the look direction
- The Pointer Lock API — capturing the mouse for FPS-style input
- Spherical coordinates → Cartesian for orbit cameras
- Three.js: \`PointerLockControls\`, \`OrbitControls\`, \`camera.rotation.order\`

---

## Part 1 — Yaw and Pitch

A first-person camera has two degrees of rotational freedom:

- **Yaw** — rotation around the world Y-axis (left/right head turn). Range: \`[−π, π]\` (unlimited)
- **Pitch** — rotation around the camera's local X-axis (up/down tilt). Range: \`[−89°, 89°]\` (clamped)

**Why clamp pitch to 89°?** At ±90° the camera looks straight up or down. The Y-axis becomes parallel to the look direction — the cross product for computing the right vector degenerates to zero (gimbal lock). Clamping to 89° keeps the math stable.

**The look direction formula:**

Given yaw \`θ\` and pitch \`φ\` (both in radians):

\`\`\`js
direction.x = Math.cos(yaw) * Math.cos(pitch);
direction.y = Math.sin(pitch);
direction.z = Math.sin(yaw) * Math.cos(pitch);
direction = normalize(direction);
\`\`\`

This is exactly the standard spherical-to-Cartesian conversion (using math convention — not the physics θ/φ convention which is swapped).`,
    },

    {
      type: 'js',
      instruction: `### Interactive FPS Camera — Drag to Rotate

Click the canvas to capture it, then drag to look around. Buttons move forward/back/strafe. The View matrix and look direction update in real time.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="640" height="380" style="border-radius:8px;display:block;width:100%;cursor:crosshair"></canvas>
  <div style="display:flex;gap:8px;font-family:monospace;font-size:11px;">
    <button id="fw" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px 14px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:11px;">↑ Forward</button>
    <button id="bk" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px 14px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:11px;">↓ Back</button>
    <button id="sl" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px 14px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:11px;">← Strafe</button>
    <button id="sr" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:6px 14px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:11px;">→ Strafe</button>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var cam = { x: 0, y: 0, z: 5 };
var yaw = -Math.PI / 2;   // face toward -Z
var pitch = 0;
var dragging = false, lastMX = 0, lastMY = 0;
var SENS = 0.003, SPEED = 0.3;

var OBJECTS = [
  { x:  0, y: 0, z:  0, color: '#f87171', label: 'origin' },
  { x:  3, y: 0, z: -2, color: '#4ade80', label: 'A' },
  { x: -2, y: 0, z:  1, color: '#38bdf8', label: 'B' },
  { x:  1, y: 1, z: -4, color: '#c084fc', label: 'C' },
];

function getDir() {
  return {
    x: Math.cos(yaw) * Math.cos(pitch),
    y: Math.sin(pitch),
    z: Math.sin(yaw) * Math.cos(pitch),
  };
}
function len(v) { return Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)||0.0001; }
function norm(v) { var l=len(v); return {x:v.x/l,y:v.y/l,z:v.z/l}; }
function cross(a,b) { return {x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x}; }
function dot(a,b) { return a.x*b.x+a.y*b.y+a.z*b.z; }

function move(dir, dist) {
  var d = getDir();
  var up = {x:0,y:1,z:0};
  var right = norm(cross(d, up));
  if (dir === 'f') { cam.x+=d.x*dist; cam.y+=d.y*dist; cam.z+=d.z*dist; }
  if (dir === 'b') { cam.x-=d.x*dist; cam.y-=d.y*dist; cam.z-=d.z*dist; }
  if (dir === 'l') { cam.x-=right.x*dist; cam.z-=right.z*dist; }
  if (dir === 'r') { cam.x+=right.x*dist; cam.z+=right.z*dist; }
}

document.getElementById('fw').onclick = function() { move('f', SPEED); };
document.getElementById('bk').onclick = function() { move('b', SPEED); };
document.getElementById('sl').onclick = function() { move('l', SPEED); };
document.getElementById('sr').onclick = function() { move('r', SPEED); };

canvas.addEventListener('mousedown', function(e) { dragging=true; lastMX=e.clientX; lastMY=e.clientY; });
canvas.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  yaw   += (e.clientX - lastMX) * SENS;
  pitch -= (e.clientY - lastMY) * SENS;
  pitch  = Math.max(-1.553, Math.min(1.553, pitch)); // ±89°
  lastMX = e.clientX; lastMY = e.clientY;
});
canvas.addEventListener('mouseup', function() { dragging=false; });

function project(wx, wy, wz) {
  var d  = getDir();
  var up = {x:0,y:1,z:0};
  var right = norm(cross(d, up));
  var camUp = cross(right, d);
  // Translate to view space
  var tx = wx - cam.x, ty = wy - cam.y, tz = wz - cam.z;
  var vx = dot({x:tx,y:ty,z:tz}, right);
  var vy = dot({x:tx,y:ty,z:tz}, camUp);
  var vz = dot({x:tx,y:ty,z:tz}, d);
  if (vz < 0.1) return null; // behind camera
  var fov = 1.2;
  var sx = (vx / (vz * Math.tan(fov/2))) * (W*0.5) + W*0.5;
  var sy = -(vy / (vz * Math.tan(fov/2))) * (H*0.5) + H*0.5;
  return { sx, sy, depth: vz };
}

function draw() {
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#070d18'; ctx.fillRect(0,0,W,H);

  // Ground grid
  for (var g=-6; g<=6; g++) {
    var p1 = project(g,-1,-6), p2 = project(g,-1,6);
    var p3 = project(-6,-1,g), p4 = project(6,-1,g);
    ctx.strokeStyle='#1e293b'; ctx.lineWidth=0.5;
    if (p1&&p2) { ctx.beginPath(); ctx.moveTo(p1.sx,p1.sy); ctx.lineTo(p2.sx,p2.sy); ctx.stroke(); }
    if (p3&&p4) { ctx.beginPath(); ctx.moveTo(p3.sx,p3.sy); ctx.lineTo(p4.sx,p4.sy); ctx.stroke(); }
  }

  // Objects (sort by depth)
  var visible = OBJECTS.map(function(o) {
    var p = project(o.x, o.y-0.5, o.z);
    return p ? { o, p } : null;
  }).filter(Boolean).sort((a,b) => b.p.depth - a.p.depth);

  visible.forEach(function({ o, p }) {
    var sz = Math.max(8, 50 / p.depth);
    ctx.fillStyle = o.color + '55'; ctx.strokeStyle = o.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.rect(p.sx-sz/2, p.sy-sz, sz, sz*1.2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = o.color; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(o.label, p.sx, p.sy-sz-4);
  });

  // HUD
  var d = getDir();
  ctx.fillStyle = '#0f172acc'; ctx.beginPath(); ctx.roundRect(10,10,W-20,70,6); ctx.fill();
  ctx.fillStyle='#475569'; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText('Camera: ('+cam.x.toFixed(1)+', '+cam.y.toFixed(1)+', '+cam.z.toFixed(1)+')', 18, 28);
  ctx.fillText('Yaw: '+( yaw*180/Math.PI).toFixed(1)+'°   Pitch: '+(pitch*180/Math.PI).toFixed(1)+'°', 18, 44);
  ctx.fillText('Look dir: ('+d.x.toFixed(2)+', '+d.y.toFixed(2)+', '+d.z.toFixed(2)+')', 18, 60);

  // Crosshair
  ctx.strokeStyle='#ffffff66'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-8,H/2); ctx.lineTo(W/2+8,H/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2,H/2-8); ctx.lineTo(W/2,H/2+8); ctx.stroke();

  if (!dragging) { ctx.fillStyle='#ffffff22'; ctx.font='11px monospace'; ctx.textAlign='center'; ctx.fillText('Drag to look | Buttons to move', W/2, H-14); }

  requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 480,
    },

    {
      type: 'challenge',
      instruction: `**Gimbal lock:** A camera has yaw=90° and pitch=90° (looking straight up). The player tries to strafe right. Strafe uses \`right = cross(lookDir, worldUp)\`. What goes wrong — and what is the fix?`,
      options: [
        { label: 'A', text: 'lookDir = (0,1,0) and worldUp = (0,1,0) — cross product of parallel vectors = zero vector. The camera has no right direction.' },
        { label: 'B', text: 'lookDir = (0,1,0) causes the yaw to lock at 90°' },
        { label: 'C', text: 'The pitch clamp prevents this — pitch cannot reach 90°' },
        { label: 'D', text: 'cross(lookDir, worldUp) produces (0,0,−1) — a valid right vector' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. When looking straight up, lookDir = worldUp = (0,1,0). cross((0,1,0), (0,1,0)) = (0,0,0) — no right direction. This is gimbal lock. The fix is to clamp pitch to ±89° so lookDir never becomes perfectly parallel to worldUp. Some engines use quaternions (which avoid gimbal lock entirely by representing orientation as a 4D rotation).',
      failMessage: 'At pitch=90°: lookDir = (0,1,0) = worldUp. cross(v, v) = zero for any vector. The right direction becomes undefined (division by zero in normalize). This is why FPS cameras clamp pitch to 89° — it keeps the lookDir safely away from the world-up direction so the cross product always produces a valid right vector.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Orbit Camera (Spherical Coordinates)

An orbit camera rotates around a target point. The camera position is given by spherical coordinates:

\`\`\`
radius    — distance from the target
theta (θ) — horizontal angle (azimuth)
phi   (φ) — vertical angle from top (polar)

camera.x = target.x + radius × sin(phi) × sin(theta)
camera.y = target.y + radius × cos(phi)
camera.z = target.z + radius × sin(phi) × cos(theta)
\`\`\`

Then \`lookAt(target)\` builds the View matrix. Scrolling changes radius (dolly). Horizontal drag changes theta. Vertical drag changes phi (clamped to \`(0, π)\` to avoid pole singularities).

**In Three.js** — \`OrbitControls\` implements this:

\`\`\`js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

function animate() {
  controls.update();   // must call each frame when damping is enabled
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
\`\`\`

**FPS controls** use \`PointerLockControls\`:

\`\`\`js
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => { /* game starts */ });
controls.addEventListener('unlock', () => { /* show menu */ });
\`\`\``,
    },

    {
      type: 'challenge',
      instruction: `**Three.js camera rotation order:** You rotate a Three.js camera with \`camera.rotation.x = pitch\` and \`camera.rotation.y = yaw\`. The camera starts looking the right way, but after rotating 90° in one axis the other axis stops working correctly. What causes this?`,
      options: [
        { label: 'A', text: 'Three.js does not support camera rotation — use lookAt instead' },
        { label: 'B', text: 'The default Euler rotation order is XYZ, but for an FPS camera you need YXZ — apply yaw first, then pitch in local space' },
        { label: 'C', text: 'camera.rotation is in radians but you passed degrees' },
        { label: 'D', text: 'pitch and yaw should be applied to the scene, not the camera' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Three.js Euler rotation order matters. XYZ (default) applies X rotation first in world space, then Y — so rotating Y after X tilts in unexpected ways. For FPS: set camera.rotation.order = "YXZ" — yaw (Y) first, then pitch (X) in the already-yawed local space. This matches how a human head turns: left-right first, then up-down.',
      failMessage: 'Euler rotation order: Three.js default is XYZ. For an FPS camera, you want YXZ — rotate around world Y (yaw) first, then around the local X (pitch) in the yawed space. Set camera.rotation.order = "YXZ" before applying rotations. PointerLockControls handles this for you.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-2-3-camera-system',
  slug: 'fps-camera',
  chapter: 'three-js.2',
  order: 3,
  title: 'Camera System — FPS Camera',
  subtitle: 'Yaw, pitch, look direction — from mouse input to a View matrix.',
  tags: ['three-js', 'camera', 'fps', 'lookat', 'yaw', 'pitch', 'orbit', 'quaternion'],
  hook: {
    question: 'A player moves the mouse 100 pixels to the right. How does that become a rotation — and what stops the camera from flipping upside-down?',
    realWorldContext: 'Every first-person game in existence uses this exact camera math. From Wolfenstein 3D (1992) to modern VR headsets — the yaw/pitch model is unchanged.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Yaw: world Y rotation. Pitch: local X rotation. Clamp pitch ±89° to prevent gimbal lock.',
      'lookDir = (cos(yaw)cos(pitch), sin(pitch), sin(yaw)cos(pitch)).',
      'Strafe = cross(lookDir, worldUp). Normalise before movement.',
      'Orbit: spherical coords → Cartesian → lookAt(target).',
      'Three.js: rotation.order = "YXZ" for FPS. PointerLockControls for mouse capture.',
    ],
    callouts: [
      { type: 'tip', title: 'Quaternions for Cameras', body: 'Euler angles suffer from gimbal lock and interpolation artefacts. Quaternions (camera.quaternion in Three.js) represent any rotation without singularities. OrbitControls and PointerLockControls use quaternions internally.' },
    ],
    visualizations: [{ id: 'JSNotebook', title: 'Camera System — FPS Camera', props: { lesson: LESSON_3JS_2_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Yaw: rotate world Y. Pitch: rotate local X. Clamp pitch ±89° to prevent flip.',
    'Camera direction: dir = (cos(yaw)cos(pitch), sin(pitch), sin(yaw)cos(pitch)).',
    'Strafe = cross(dir, worldUp). Normalise before movement.',
    'Orbit: spherical (radius, theta, phi) → Cartesian → camera position → lookAt.',
    'Three.js: PointerLockControls (FPS), OrbitControls (orbit), rotation.order="YXZ".',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Yaw: rotate world Y. Pitch: rotate local X. Clamp pitch ±89°." Why clamp pitch instead of allowing full 360° vertical rotation?',
      options: [
        'GPUs cannot handle negative Y rotation',
        'At ±90° the up vector aligns with the look direction, causing a gimbal flip — the camera\'s orientation becomes undefined and the view snaps or flips',
        'Clamping improves performance by reducing matrix calculations',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Strafe = cross(dir, worldUp). Normalise before movement." Why normalise the strafe vector?',
      options: [
        'The cross product always returns a unit vector',
        'The cross product magnitude varies with the angle between dir and worldUp — normalising ensures strafe speed is consistent regardless of pitch angle',
        'Normalisation converts the vector from world space to camera space',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Camera direction: dir = (cos(yaw)cos(pitch), sin(pitch), sin(yaw)cos(pitch))." What direction does this produce when yaw=0 and pitch=0?',
      options: [
        '(0, 0, -1) — looking along the negative Z axis (standard OpenGL forward)',
        '(1, 0, 0) — looking along the positive X axis',
        '(0, 1, 0) — looking straight up',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Orbit: spherical (radius, theta, phi) → Cartesian → camera position → lookAt." Why convert to Cartesian before setting camera position?',
      options: [
        'Three.js requires Cartesian coordinates for camera position — it has no spherical coordinate support',
        'Spherical coordinates describe a point on a sphere conceptually; Three.js needs (x, y, z) world position to place the camera, which is computed from radius × trig functions',
        'The conversion applies the view matrix automatically',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_3JS_2_3 };
