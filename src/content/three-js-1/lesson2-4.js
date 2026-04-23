// Three.js · Chapter 2 · Lesson 4
// Colors, Materials & Phong Preview

const LESSON_3JS_2_4 = {
  title: 'Colors, Materials & Phong Preview',
  subtitle: 'sRGB vs linear colour, gamma correction, and your first lit sphere.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### What You Will Learn

- Why mixing colours in sRGB gives wrong results — and what linear colour space is
- Gamma encoding/decoding: the 2.2 power curve
- The Phong reflection model: ambient, diffuse, specular — one equation that gives surfaces volume
- How to implement Phong shading entirely in GLSL
- Three.js colour workflow: \`renderer.outputColorSpace\`, \`texture.colorSpace\`

---

## Part 1 — Linear vs sRGB Colour

Human vision is not linear. We perceive more difference between dark shades than between bright ones. Displays compensate by encoding values with a **gamma curve**:

\`\`\`
display_value = linear_value ^ (1/2.2)   // encoding — brightens darks
linear_value  = display_value ^ 2.2      // decoding — restores physics
\`\`\`

**The problem:** sRGB texture pixels are encoded. If you do lighting math on encoded values:
\`\`\`glsl
// WRONG — mixing encoded values
vec3 lit = texture(uAlbedo, vUv).rgb * lightIntensity;
// "50% grey" in sRGB is actually 21.4% brightness — so lighting is 2× too bright
\`\`\`

**The correct workflow:**
1. Decode sRGB texture → linear (at texture fetch time or manually with \`^2.2\`)
2. Do ALL lighting math in linear space
3. Encode back to sRGB at the very end (gamma correction)

\`\`\`glsl
// Fragment shader — correct workflow
vec3 albedo = pow(texture(uAlbedo, vUv).rgb, vec3(2.2));  // decode sRGB
vec3 lit    = doLighting(albedo, normal, lightDir);         // linear lighting
gl_FragColor = vec4(pow(lit, vec3(1.0/2.2)), 1.0);          // re-encode
\`\`\`

Three.js handles this automatically when you set:
\`\`\`js
renderer.outputColorSpace = THREE.SRGBColorSpace;  // final pass encodes to sRGB
texture.colorSpace = THREE.SRGBColorSpace;          // Three.js decodes on fetch
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Gamma Correction Comparator

Left: lighting in sRGB (wrong). Right: lighting in linear with gamma correction (correct). The blend between black and white reveals the perceptual difference.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <div style="display:flex;gap:12px;width:100%;justify-content:center;">
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:#f87171;font-family:monospace;font-size:10px;">sRGB math (wrong)</div>
      <canvas id="cv1" width="270" height="200" style="border-radius:8px;display:block;"></canvas>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
      <div style="color:#4ade80;font-family:monospace;font-size:10px;">Linear + gamma (correct)</div>
      <canvas id="cv2" width="270" height="200" style="border-radius:8px;display:block;"></canvas>
    </div>
  </div>
  <div style="color:#475569;font-family:monospace;font-size:10px;">The midpoint of the gradient should appear as medium grey — only the right version is correct</div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var VS = \`
  attribute vec2 aPos; varying vec2 vPos;
  void main() { vPos = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }
\`;

var FS_WRONG = \`
  precision mediump float; varying vec2 vPos;
  void main() {
    float t = vPos.x * 0.5 + 0.5;  // 0..1 left to right
    // Wrong: linear interpolation in sRGB space
    vec3 col = mix(vec3(0.0), vec3(1.0), t);
    gl_FragColor = vec4(col, 1.0);
  }
\`;

var FS_CORRECT = \`
  precision mediump float; varying vec2 vPos;
  void main() {
    float t = vPos.x * 0.5 + 0.5;
    // Correct: decode both endpoints to linear, blend, re-encode
    float linear = t;  // white is already 1.0 in linear
    // Apply gamma: lighter in shadows (perceptually correct)
    float gamma = pow(linear, 1.0/2.2);
    gl_FragColor = vec4(vec3(gamma), 1.0);
  }
\`;

function makeGL(id, fsSrc) {
  var canvas = document.getElementById(id);
  var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  gl.viewport(0,0,canvas.width,canvas.height);
  function sh(t,s) { var x=gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog); gl.useProgram(prog);
  var data = new Float32Array([-1,-1, 1,-1, 1,1, -1,1]);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog,'aPos');
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(loc);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

makeGL('cv1', FS_WRONG);
makeGL('cv2', FS_CORRECT);

console.log('Left: linear gradient in sRGB — appears too dark in shadows');
console.log('Right: linear gradient with gamma correction — even perceptual steps');`,
      outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: `**sRGB mixing:** You mix two sRGB colours: pure red \`(1,0,0)\` and pure blue \`(0,0,1)\` at \`t=0.5\`. You get a muddy purple instead of a clean violet. What went wrong and how do you fix it?`,
      options: [
        { label: 'A', text: 'The mix() function is wrong — use (a+b)/2 instead' },
        { label: 'B', text: 'The colours are sRGB encoded. Decode to linear first, mix in linear space, then re-encode. Linear blend of two pure colours gives the perceptually correct midpoint.' },
        { label: 'C', text: 'Red and blue cannot mix to violet — they need green' },
        { label: 'D', text: 'Mix (1,0,0) and (0,0,1) at t=0.5 always gives (0.5,0,0.5) — that is correct violet' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. sRGB-encoded (1,0,0) in linear space is actually (1.0, 0, 0) after decoding (^2.2). sRGB (0,0,1) in linear is (0, 0, 1.0). Mixed in linear and re-encoded, you get a clean violet. When you mix sRGB values directly, you are blending the gamma-curved numbers, which is perceptually incorrect and produces muddy results. This is why photo editors and 3D renderers always blend in linear space.',
      failMessage: 'mix() on sRGB values blends the encoded numbers. sRGB (1,0,0) decoded to linear = (1,0,0) (identical here). sRGB (0,0,1) decoded = (0,0,1). But greyscale values differ heavily: sRGB 0.5 decodes to linear 0.214. Blending in linear then re-encoding gives perceptually even results. Blending in sRGB skews toward dark.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — The Phong Lighting Model

Phong (1975) decomposes light into three components:

\`\`\`
I = Ka × Ia   +   Kd × Id × max(0, N·L)   +   Ks × Is × max(0, R·V)^shininess
    ─────────     ────────────────────────     ────────────────────────────────
    Ambient        Diffuse (N dot L)            Specular (reflected dot view)
\`\`\`

- **Ia, Id, Is** — ambient/diffuse/specular light intensities (from light source)
- **Ka, Kd, Ks** — ambient/diffuse/specular material coefficients (from material)
- **N** — surface normal (normalised)
- **L** — direction to light source (normalised)
- **R** — reflection of L about N: \`R = reflect(-L, N) = 2*(N·L)*N - L\`
- **V** — direction to viewer/camera (normalised)

**The \`max(0, N·L)\` clamp** prevents lighting from going negative when the light is behind the surface.

**Shininess** controls the specular highlight size: 2=rough (wide blur), 64=polished metal (tight dot), 256=mirror-like.

\`\`\`glsl
vec3 N = normalize(vNormal);                          // surface normal
vec3 L = normalize(uLightPos - vWorldPos);            // to light
vec3 V = normalize(uCamPos   - vWorldPos);            // to camera
vec3 R = reflect(-L, N);                              // reflected light ray

vec3 ambient  = Ka * uAmbientColor;
vec3 diffuse  = Kd * uLightColor * max(0.0, dot(N, L));
vec3 specular = Ks * uLightColor * pow(max(0.0, dot(R, V)), shininess);

gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Interactive Phong Sphere

Drag the light position. Adjust Ka, Kd, Ks, and shininess sliders. The sphere is ray-marched in the fragment shader — all shading is computed per-pixel.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="560" height="300" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:540px;font-family:monospace;font-size:11px;color:#64748b;">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <label>Ka (ambient): <span id="kaV">0.10</span></label>
      <input id="ka" type="range" min="0" max="0.5" step="0.01" value="0.1">
      <label>Kd (diffuse): <span id="kdV">0.80</span></label>
      <input id="kd" type="range" min="0" max="1" step="0.01" value="0.8">
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      <label>Ks (specular): <span id="ksV">0.60</span></label>
      <input id="ks" type="range" min="0" max="1" step="0.01" value="0.6">
      <label>Shininess: <span id="shV">32</span></label>
      <input id="sh" type="range" min="1" max="256" step="1" value="32">
    </div>
  </div>
  <div style="color:#475569;font-family:monospace;font-size:10px;">Drag light (yellow dot) on the sphere</div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0,0,canvas.width,canvas.height);

var VS = \`
  attribute vec2 aPos; varying vec2 vUV;
  void main() { vUV = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }
\`;
var FS = \`
  precision highp float;
  uniform vec2 uLight;
  uniform float uKa, uKd, uKs, uShininess;
  varying vec2 vUV;

  void main() {
    vec2 uv = vUV;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) { gl_FragColor = vec4(0.04, 0.07, 0.12, 1.0); return; }

    // Sphere normal at this pixel (orthographic projection)
    vec3 N = normalize(vec3(uv, sqrt(1.0 - r2)));
    vec3 albedo = vec3(0.2, 0.5, 1.0);

    vec3 lightPos = vec3(uLight, 1.5);
    vec3 fragPos  = vec3(uv, sqrt(1.0 - r2));
    vec3 L = normalize(lightPos - fragPos);
    vec3 V = normalize(vec3(0.0, 0.0, 1.0));
    vec3 R = reflect(-L, N);

    vec3 ambient  = uKa * vec3(0.2, 0.2, 0.3);
    vec3 diffuse  = uKd * vec3(1.0, 0.95, 0.8) * max(0.0, dot(N, L));
    vec3 specular = uKs * vec3(1.0) * pow(max(0.0, dot(R, V)), uShininess);

    vec3 col = albedo * (ambient + diffuse) + specular;
    gl_FragColor = vec4(col, 1.0);
  }
\`;

function sh(t,s){ var x=gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
var prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog); gl.useProgram(prog);

var data = new Float32Array([-1,-1, 1,-1, 1,1, -1,1]);
var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
var pL = gl.getAttribLocation(prog,'aPos');
gl.vertexAttribPointer(pL,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(pL);

var lightLoc = gl.getUniformLocation(prog,'uLight');
var kaLoc=gl.getUniformLocation(prog,'uKa'), kdLoc=gl.getUniformLocation(prog,'uKd');
var ksLoc=gl.getUniformLocation(prog,'uKs'), shLoc=gl.getUniformLocation(prog,'uShininess');

var lx = -0.6, ly = 0.7;
var dragging = false;

function getUniforms() {
  return {
    ka: parseFloat(document.getElementById('ka').value),
    kd: parseFloat(document.getElementById('kd').value),
    ks: parseFloat(document.getElementById('ks').value),
    sh: parseFloat(document.getElementById('sh').value),
  };
}
['ka','kd','ks','sh'].forEach(function(id) {
  document.getElementById(id).oninput = function() {
    document.getElementById(id+'V').textContent = parseFloat(this.value).toFixed(id==='sh'?0:2);
    render();
  };
});

canvas.addEventListener('mousedown', function(e) { dragging=true; });
canvas.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  var r = canvas.getBoundingClientRect();
  var W=canvas.width, H=canvas.height;
  lx = ((e.clientX-r.left)/(r.width))*2-1;
  ly = -(((e.clientY-r.top)/(r.height))*2-1);
  render();
});
canvas.addEventListener('mouseup', function() { dragging=false; });

function render() {
  var u = getUniforms();
  gl.clearColor(0.04,0.07,0.12,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(prog);
  gl.uniform2f(lightLoc, lx, ly);
  gl.uniform1f(kaLoc, u.ka); gl.uniform1f(kdLoc, u.kd);
  gl.uniform1f(ksLoc, u.ks); gl.uniform1f(shLoc, u.sh);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
render();
console.log('Drag the light. Adjust Ka/Kd/Ks/Shininess to explore the Phong model.');`,
      outputHeight: 400,
    },

    {
      type: 'challenge',
      instruction: `**Phong shininess:** You set shininess=2 vs shininess=256. What happens to the specular highlight's apparent size and the type of surface it suggests?`,
      options: [
        { label: 'A', text: 'Shininess=2: tiny bright dot (metallic). Shininess=256: large diffuse glow (rough surface).' },
        { label: 'B', text: 'Shininess=2: wide broad highlight (rough/matte). Shininess=256: tiny tight dot (polished/mirror-like).' },
        { label: 'C', text: 'Shininess does not affect size — only the colour of the specular reflection.' },
        { label: 'D', text: 'Both produce the same result — only Ks (specular coefficient) controls highlight size.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Shininess is the exponent of pow(R·V, shininess). Higher exponent = value falls off more sharply away from the perfect reflection angle = narrower, brighter highlight. Shininess 2 ≈ rough chalk. Shininess 32 ≈ plastic. Shininess 128 ≈ polished wood. Shininess 256+ ≈ mirror-like metal.',
      failMessage: 'pow(R·V, shininess): as shininess grows, the curve sharpens. At shininess=2, dot products slightly below 1.0 still contribute significantly — a wide soft highlight. At shininess=256, only dot products very close to 1.0 survive the exponent — a tiny tight dot. High shininess = glossy/metallic. Low shininess = matte/rough.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-2-4-colors-materials',
  slug: 'colors-and-materials',
  chapter: 'three-js.2',
  order: 4,
  title: 'Colors, Materials & Phong Preview',
  subtitle: 'sRGB vs linear colour, gamma correction, and your first lit sphere.',
  tags: ['three-js', 'color', 'srgb', 'gamma', 'phong', 'materials', 'lighting'],
  hook: {
    question: 'You mix red and white light in a shader and get muddy brownish pink instead of clean light pink. What colour space is to blame?',
    realWorldContext: 'sRGB/linear confusion is the most common cause of "my lighting looks washed out" or "my colours don\'t blend right" in WebGL.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'sRGB: perceptually encoded. Linear: physical light. Always decode sRGB before lighting.',
      'Decode: pow(rgb, 2.2). Encode: pow(rgb, 1/2.2). Three.js does this automatically.',
      'Phong = ambient + Kd*(N·L) + Ks*(R·V)^shininess.',
      'Shininess 2=rough wide highlight, 256=tiny metallic dot.',
      'renderer.outputColorSpace = SRGBColorSpace. texture.colorSpace = SRGBColorSpace.',
    ],
    callouts: [
      { type: 'important', title: 'Do All Lighting in Linear Space', body: 'If you skip gamma decoding, your lights will appear too bright in bright areas and too dim in shadows. Always decode sRGB textures before lighting math, then re-encode at output.' },
    ],
    visualizations: [{ id: 'JSNotebook', title: 'Colors, Materials & Phong Preview', props: { lesson: LESSON_3JS_2_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'sRGB: perceptual encoding. Linear: physical light. Always decode sRGB textures before lighting.',
    'Phong = ambient + Kd*(N·L) + Ks*(R·V)^shininess.',
    'renderer.outputColorSpace = SRGBColorSpace for correct gamma output.',
    'MeshPhongMaterial: color, specular, shininess, emissive.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_2_4 };
