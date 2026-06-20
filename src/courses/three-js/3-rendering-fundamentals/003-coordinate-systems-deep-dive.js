// Three.js · Chapter 2 · Lesson 2
// Coordinate Systems Deep Dive

const LESSON_3JS_2_2 = {
  title: 'Coordinate Systems Deep Dive',
  subtitle: 'Which space every vector lives in — and how shader bugs trace back to getting it wrong.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### What You Will Learn

- The five coordinate spaces every 3D program uses and what lives in each
- Why you must never apply the Model matrix to a normal vector directly
- The **normal matrix** — why it is the inverse-transpose and when to use it
- **Tangent space** — the local coordinate system stored in normal maps
- The TBN matrix that converts tangent-space normals to world space
- How to diagnose coordinate space bugs by outputting vectors as colours

---

## Part 1 — The Five Spaces

Every vector in your shader lives in exactly one of these spaces:

| Space | Also called | What lives here | How to get here |
|-------|-------------|----------------|-----------------|
| **Object / Local** | Model space | Raw mesh vertices, local normals | Start here |
| **World** | Global | Light positions, camera position | × Model matrix (M) |
| **View / Camera** | Eye space | Vertices relative to the camera | × View matrix (V) |
| **Clip** | Homogeneous | gl_Position output | × Projection matrix (P) |
| **NDC** | Normalised Device | After perspective divide (÷w) | Automatic after clip |
| **Tangent** | TBN space | Normal map directions | Via TBN matrix |

**The rule:** Operations must happen in the same space. Adding a world-space light direction to a view-space vertex gives you nonsense. Most shader bugs trace to this.`,
    },

    {
      type: 'js',
      instruction: `### Space Visualiser — Track a Vertex Through the Pipeline

Select a vertex. Watch its coordinates transform through each space as you step through the pipeline. The colour of the vertex shows the space it's currently in.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="680" height="360" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:flex;gap:8px;font-family:monospace;font-size:11px;">
    <button class="spaceBtn" data-s="0" style="background:#f8717122;border:1px solid #f87171;color:#f87171;padding:5px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">Object</button>
    <button class="spaceBtn" data-s="1" style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:5px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">World</button>
    <button class="spaceBtn" data-s="2" style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:5px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">View</button>
    <button class="spaceBtn" data-s="3" style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:5px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">Clip</button>
    <button class="spaceBtn" data-s="4" style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:5px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">NDC</button>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var currentSpace = 0;

var SPACES = [
  { name: 'Object Space', color: '#f87171', desc: 'Raw mesh vertices. Origin at mesh centre. Cube goes from (-1,-1,-1) to (1,1,1).' },
  { name: 'World Space',  color: '#fb923c', desc: 'After Model matrix: mesh placed at (2,0,-3), rotated 45°, scaled 0.5× in world.' },
  { name: 'View Space',   color: '#4ade80', desc: 'After View matrix: camera is at origin looking down -Z. Light positions are here.' },
  { name: 'Clip Space',   color: '#38bdf8', desc: 'After Projection: perspective applied. W≠1. Clipping happens here.' },
  { name: 'NDC',          color: '#a78bfa', desc: 'After ÷W: range [-1,1] on all axes. Viewport transform maps this to pixels.' },
];

// Simulated vertex position through each space
var POSITIONS = [
  [1.0, 1.0, 1.0, 1.0],   // Object
  [2.71, 1.71, -2.29, 1.0], // World (translated+rotated)
  [0.71, 1.71, -5.29, 1.0], // View (camera moved back by 3)
  [0.42, 1.71, 5.09, 5.29], // Clip (P applied — note W≠1)
  [0.08, 0.32, 0.96, 1.0],  // NDC (÷W)
];

function mat4Label(i) {
  if (i === 0) return '— (start)';
  if (i === 1) return '× Model (M)';
  if (i === 2) return '× View (V)';
  if (i === 3) return '× Projection (P)';
  if (i === 4) return '÷ W (GPU divide)';
}

function draw() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0,0,W,H);

  var PIPE_X = 30, PIPE_Y = 50, BOX_W = 118, BOX_H = 50, GAP = 14;

  SPACES.forEach(function(sp, i) {
    var x = PIPE_X + i * (BOX_W + GAP);
    var active = i === currentSpace;
    ctx.fillStyle = active ? sp.color + '22' : '#0f172a';
    ctx.strokeStyle = active ? sp.color : '#334155';
    ctx.lineWidth = active ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(x, PIPE_Y, BOX_W, BOX_H, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = active ? sp.color : '#475569';
    ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(sp.name.split(' ')[0], x + BOX_W/2, PIPE_Y + 18);
    ctx.fillStyle = '#334155'; ctx.font = '9px monospace';
    ctx.fillText(sp.name.split(' ').slice(1).join(' '), x + BOX_W/2, PIPE_Y + 32);

    // Arrow
    if (i < SPACES.length - 1) {
      var ax = x + BOX_W + 2, ay = PIPE_Y + BOX_H/2;
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + GAP - 4, ay); ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(ax+GAP-4, ay-4); ctx.lineTo(ax+GAP, ay); ctx.lineTo(ax+GAP-4, ay+4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(mat4Label(i+1).slice(0,6), ax + GAP/2, ay - 6);
    }
  });

  // ── Current space details ──
  var sp = SPACES[currentSpace];
  var pos = POSITIONS[currentSpace];

  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = sp.color + '55'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(30, 120, W-60, H-130, 8); ctx.fill(); ctx.stroke();

  ctx.fillStyle = sp.color; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
  ctx.fillText(sp.name, 46, 142);
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';

  var lines = sp.desc.match(/.{1,80}(\s|$)/g) || [sp.desc];
  lines.forEach(function(l, i) { ctx.fillText(l.trim(), 46, 162 + i*16); });

  ctx.fillStyle = sp.color; ctx.font = 'bold 11px monospace';
  ctx.fillText('Vertex coordinate:', 46, 220);
  ctx.fillStyle = '#38bdf8'; ctx.font = '13px monospace';
  ctx.fillText('vec4(' + pos.map(v=>v.toFixed(2)).join(', ') + ')', 46, 238);

  if (currentSpace === 3) {
    ctx.fillStyle = '#f87171'; ctx.font = '10px monospace';
    ctx.fillText('Note: W = ' + pos[3].toFixed(2) + ' ≠ 1.0 — perspective not yet applied', 46, 258);
  }
  if (currentSpace === 4) {
    ctx.fillStyle = '#4ade80'; ctx.font = '10px monospace';
    ctx.fillText('After ÷W: all components now in [-1, 1]. GPU maps to screen pixels via viewport.', 46, 258);
  }

  ctx.fillStyle = '#334155'; ctx.font = '10px monospace';
  ctx.fillText('Transform: ' + mat4Label(currentSpace), 46, 280);
}

document.querySelectorAll('.spaceBtn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.spaceBtn').forEach(b => { b.style.background='#1e2a3f'; b.style.borderColor='#334155'; b.style.color='#64748b'; });
    var sp = SPACES[parseInt(this.dataset.s)];
    this.style.background = sp.color + '22';
    this.style.borderColor = sp.color;
    this.style.color = sp.color;
    currentSpace = parseInt(this.dataset.s);
    draw();
  });
});

draw();`,
      outputHeight: 420,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — The Normal Matrix Problem

This is the most common subtle shader bug in 3D graphics.

A surface normal must remain perpendicular to the surface after transformation. Applying the Model matrix directly to a normal works if the model is only rotated and translated — but **fails with non-uniform scaling**.

**Why:** If you scale X by 2 and Y by 1, a vertical surface becomes twice as wide. Its normal (pointing in X) should also change direction — but multiplying by the scale matrix scales the normal in the same direction as the surface, which is wrong.

\`\`\`
Surface (Y axis, horizontal)   →  after scale(2,1,1):  still Y axis (correct)
Normal  (X axis, perpendicular) → if we apply scale:    2× in X (wrong! no longer perpendicular)
\`\`\`

**The fix: the normal matrix**

The correct transform for normals is the **inverse transpose** of the upper-left 3×3 of the Model-View matrix:

\`\`\`glsl
uniform mat3 normalMatrix;   // = transpose(inverse(mat3(modelViewMatrix)))

void main() {
  vec3 worldNormal = normalize(normalMatrix * normal);  // CORRECT
  // NOT: normalize(mat3(modelMatrix) * normal)         // WRONG for non-uniform scale
}
\`\`\`

Three.js provides \`normalMatrix\` automatically in ShaderMaterial. In raw WebGL, compute it on the CPU:

\`\`\`js
var normalMat = mat3.create();
mat3.fromMat4(normalMat, modelViewMatrix);
mat3.invert(normalMat, normalMat);
mat3.transpose(normalMat, normalMat);
gl.uniformMatrix3fv(normalMatLoc, false, normalMat);
\`\`\``,
    },

    {
      type: 'challenge',
      instruction: `**Normal matrix:** An object is scaled non-uniformly: \`scale(1, 2, 1)\` — it is stretched twice as tall. A surface normal on the top face points straight up \`(0, 1, 0)\`. If you transform the normal using the Model matrix directly, what happens?`,
      options: [
        { label: 'A', text: 'The normal becomes (0, 2, 0) — it scales with the model, but normalize() corrects it to (0,1,0)' },
        { label: 'B', text: 'The normal stays (0, 1, 0) — scale does not affect the Y axis for a Y-aligned normal' },
        { label: 'C', text: 'A normal on a side face (1,0,0) becomes (1,0,0) after scale(1,2,1) — correct for this case, but a side face\'s normal would be wrong' },
        { label: 'D', text: 'The normal stays (0,1,0) after the model matrix but the SIDE face normals (1,0,0) and (0,0,1) become wrong — they are no longer perpendicular to the stretched surface' },
      ],
      check: (label) => label === 'D',
      successMessage: 'Correct. For scale(1,2,1): the top face is in the XZ plane, its normal (0,1,0) happens to stay correct. But a side face at the YZ plane has normal (1,0,0). After scale(1,2,1), the surface stretches 2× in Y — to stay perpendicular, the normal should tilt slightly in the -Y direction. The model matrix leaves it at (1,0,0) — wrong. The normal matrix (inverse-transpose) corrects this.',
      failMessage: 'Non-uniform scaling breaks normals on the surfaces that are NOT aligned to the scaling axis. scale(1,2,1) stretches Y — the top face normal (0,1,0) happens to be fine. But side faces whose normals are in X or Z now point in the wrong direction relative to the stretched surface. The normal matrix (inverse-transpose of model) is the fix.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Tangent Space and Normal Maps

A normal map stores a surface normal per pixel as an RGB colour. But the stored direction must be interpreted in **tangent space** — a local coordinate system aligned to the surface.

**Why tangent space?** If you stored world-space normals in the texture, rotating the mesh would invalidate all the normals. Tangent-space normals are stored relative to the surface — they rotate with the mesh automatically.

**The TBN matrix** converts from tangent space to world (or view) space:

\`\`\`
TBN = mat3(Tangent, Bitangent, Normal)

where:
  Tangent   = per-vertex, stored in geometry (like an extra attribute)
  Bitangent = cross(Normal, Tangent) × tangent.w   (w encodes handedness)
  Normal    = interpolated surface normal
\`\`\`

\`\`\`glsl
// Vertex shader — build TBN and pass to fragment shader
vec3 T = normalize(normalMatrix * tangent.xyz);
vec3 N = normalize(normalMatrix * normal);
T = normalize(T - dot(T, N) * N);   // re-orthogonalise (Gram-Schmidt)
vec3 B = cross(N, T) * tangent.w;   // tangent.w = ±1 for handedness
mat3 TBN = mat3(T, B, N);

// Fragment shader — decode normal map, transform to world space
vec3 mapNormal = texture(uNormalMap, vUv).rgb * 2.0 - 1.0;   // [0,1] → [-1,1]
vec3 worldNormal = normalize(TBN * mapNormal);
// worldNormal now used for lighting calculations
\`\`\`

**A flat normal map** stores \`(0.5, 0.5, 1.0)\` per pixel → decoded as \`(0, 0, 1)\` in tangent space → the surface normal points straight out. No perturbation.`,
    },

    {
      type: 'challenge',
      instruction: `**Normal map debugging:** Your normal map effect looks wrong — surfaces are lit as if flat, ignoring the normal map. You output \`vec4(mapNormal, 1.0)\` as the fragment colour and see a uniform flat blue colour everywhere. What is wrong?`,
      options: [
        { label: 'A', text: 'The texture is not uploaded correctly — the GPU is sampling zeroes' },
        { label: 'B', text: 'The normal map texture stores (0.5, 0.5, 1.0) per pixel — the flat tangent-space normal. The decode step (×2-1) has not been applied yet' },
        { label: 'C', text: 'The TBN matrix is inverted — you need to transpose it' },
        { label: 'D', text: 'The sampler2D type is wrong for a normal map' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A flat normal map stores (0.5, 0.5, 1.0) — which is a bluish colour. When decoded (×2-1) it becomes (0, 0, 1) — the straight-up tangent-space direction. If you see flat blue as a colour output, it means the texture is correctly uploaded, but you are looking at the raw stored values before decoding. Apply: mapNormal = texture(uNormalMap, vUv).rgb * 2.0 - 1.0.',
      failMessage: 'Flat blue = the texture is storing (0.5, 0.5, 1.0) which encodes the default "no perturbation" direction. This is correct texture content. The bug is the missing decode step: mapNormal = texture(uNormal, vUv).rgb * 2.0 - 1.0. Without this, you are using the [0,1] range values directly as normals — they all point roughly in the same direction.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-2-2-coord-systems',
  slug: 'coordinate-systems-deep-dive',
  chapter: 'three-js.2',
  order: 2,
  title: 'Coordinate Systems Deep Dive',
  subtitle: 'Which space every vector lives in — and how shader bugs trace back to getting it wrong.',
  tags: ['three-js', 'coordinate-space', 'normal-matrix', 'tangent-space', 'tbn', 'normal-map'],
  hook: {
    question: 'Your normals look wrong on a non-uniformly scaled object. The Model matrix says (0,1,0) but the lit result disagrees. Why?',
    realWorldContext: 'Coordinate space bugs — wrong normals, flipped directions, incorrect light positions — are the number one class of subtle shader errors. This lesson gives you the mental model to prevent and diagnose them.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Five spaces: Object → World (×M) → View (×V) → Clip (×P) → NDC (÷W).',
      'All lighting math must happen in the same space — mixing spaces produces nonsense.',
      'Normal matrix = transpose(inverse(mat3(modelViewMatrix))). Fixes non-uniform scale.',
      'Normal maps store tangent-space directions. Decode: rgb*2-1 maps [0,1]→[-1,1].',
      'TBN matrix: mat3(Tangent, Bitangent, Normal). Converts tangent-space normal to world.',
    ],
    callouts: [
      { type: 'important', title: 'Never Apply Model Matrix to Normals', body: 'mat3(modelMatrix) * normal breaks for any non-uniform scale. Use normalMatrix (inverse-transpose) — Three.js provides it automatically.' },
    ],
    visualizations: [{ id: 'JSNotebook', title: 'Coordinate Systems Deep Dive', props: { lesson: LESSON_3JS_2_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Normal matrix = transpose(inverse(modelView 3x3)). Never use modelMatrix for normals.',
    'Tangent space TBN: T=tangent, B=cross(N,T), N=normal. Normal maps stored in tangent space.',
    'Decode normal map: dir = texture.rgb * 2.0 - 1.0. Flat map = (0,0,1) = no perturbation.',
    'Three.js: normalMatrix built-in. modelMatrix, viewMatrix, projectionMatrix auto-provided.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Normal matrix = transpose(inverse(modelView 3x3))." You scale a mesh by (2, 1, 1) — double width only. What happens to normals transformed by just the model matrix?',
      options: [
        'Normals scale correctly alongside the geometry',
        'Normals tilt in the direction of the scale — a normal perpendicular to the stretched face no longer points the right direction, causing incorrect lighting',
        'Normals are not affected by scaling, only by rotation',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Tangent space TBN: T=tangent, B=cross(N,T), N=normal." Why is the binormal (B) computed as cross(N, T) rather than stored directly in the texture?',
      options: [
        'The binormal can always be reconstructed from N and T at zero storage cost — storing it would waste a texture channel',
        'The binormal is always (0, 1, 0) in world space',
        'The GPU computes binormals automatically',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Decode normal map: dir = texture.rgb * 2.0 - 1.0. Flat map = (0,0,1)." Why is a completely flat normal map stored as RGB (0.5, 0.5, 1.0)?',
      options: [
        'Blue is the Z axis in tangent space — (0, 0, 1) means no perturbation. Since textures store 0–1, (0,0,1) is encoded as (0.5, 0.5, 1.0) before decoding with ×2−1',
        'The flat colour must be neutral grey',
        'Normal maps always use a blue tint to indicate they are not colour textures',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Three.js: normalMatrix built-in. modelMatrix, viewMatrix, projectionMatrix auto-provided." When writing a custom Three.js shader, do you need to declare and upload these matrices yourself?',
      options: [
        'Yes — all uniforms must be declared and uploaded manually',
        'No — Three.js injects these as built-in uniforms when you use ShaderMaterial with the correct uniform names',
        'Only modelMatrix is automatic; view and projection must be uploaded manually',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_3JS_2_2 };
