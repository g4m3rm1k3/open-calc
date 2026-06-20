// Three.js · Chapter 2 · Lesson 1
// Multiple Textures & Blending

const LESSON_3JS_2_1 = {
  title: 'Multiple Textures & Blending',
  subtitle: 'Combining diffuse, roughness, and alpha maps — and how the GPU composites layered surfaces.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### What You Will Learn

- Bind multiple textures to different texture units and read them in one fragment shader
- The \`mix()\` GLSL function — linear interpolation between two values
- Alpha blending (Porter-Duff over operation) and the GPU blend equation
- Additive, multiplicative, and screen blend modes — and when to use each
- Diffuse + roughness + emissive map layering — the basis of PBR texturing
- Three.js: \`material.map\`, \`roughnessMap\`, \`aoMap\`, \`emissiveMap\`

---

## Part 1 — Multiple Texture Units

WebGL has 8–32 **texture units** (hardware slots). Each sampler2D uniform reads from one unit. To use two textures at once:

\`\`\`js
// Bind texture A to unit 0
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, textureA);
gl.uniform1i(gl.getUniformLocation(prog, 'uTexA'), 0);

// Bind texture B to unit 1
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, textureB);
gl.uniform1i(gl.getUniformLocation(prog, 'uTexB'), 1);
\`\`\`

\`\`\`glsl
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uBlend;

void main() {
  vec4 colA = texture(uTexA, vUv);
  vec4 colB = texture(uTexB, vUv);
  gl_FragColor = mix(colA, colB, uBlend);  // linear interpolation
}
\`\`\`

\`mix(a, b, t)\` is the GPU's lerp: \`a*(1-t) + b*t\`. At \`t=0\` you get A; at \`t=1\` you get B; in between you get a blend.`,
    },

    {
      type: 'js',
      instruction: `### Texture Blend Explorer

Two procedural textures on a quad. Drag the blend slider to interpolate between them, or switch to different blend modes. This is exactly how texture blending and material layering works in a fragment shader.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center">
  <canvas id="cv" width="560" height="280" style="border-radius:8px;display:block;width:100%"></canvas>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;font-family:monospace;font-size:11px;color:var(--color-text-secondary, #475569);">
    <div style="display:flex;gap:6px;align-items:center;">
      <span>Mix t:</span>
      <input id="blend" type="range" min="0" max="1" step="0.01" value="0.5" style="width:100px">
      <span id="bv">0.50</span>
    </div>
    <div style="display:flex;gap:5px;">
      <button class="modeBtn" data-m="mix"        style="background:#1e2a3f;border:1px solid #38bdf8;color:#38bdf8;padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">mix</button>
      <button class="modeBtn" data-m="add"        style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">add</button>
      <button class="modeBtn" data-m="multiply"   style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">multiply</button>
      <button class="modeBtn" data-m="screen"     style="background:#1e2a3f;border:1px solid #334155;color:var(--color-text-secondary, #475569);padding:4px 10px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:10px;">screen</button>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var mode = 'mix'; var blend = 0.5;

var VS = \`
  attribute vec2 aPos; attribute vec2 aUv; varying vec2 vUv;
  void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }
\`;
var FS = \`
  precision mediump float;
  uniform sampler2D uTexA; uniform sampler2D uTexB;
  uniform float uBlend; uniform int uMode;
  varying vec2 vUv;
  void main() {
    vec4 a = texture2D(uTexA, vUv);
    vec4 b = texture2D(uTexB, vUv);
    vec4 c;
    if (uMode == 0) c = mix(a, b, uBlend);
    else if (uMode == 1) c = clamp(a + b * uBlend, 0.0, 1.0);
    else if (uMode == 2) c = a * b;
    else c = 1.0 - (1.0 - a) * (1.0 - b);  // screen
    gl_FragColor = c;
  }
\`;
function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
var prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog); gl.useProgram(prog);

var data = new Float32Array([-1,-1,0,0, 1,-1,1,0, 1,1,1,1, -1,1,0,1]);
var idx  = new Uint16Array([0,1,2,0,2,3]);
var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
var pL = gl.getAttribLocation(prog,'aPos'), uL = gl.getAttribLocation(prog,'aUv');
gl.vertexAttribPointer(pL, 2, gl.FLOAT, false, 16, 0); gl.enableVertexAttribArray(pL);
gl.vertexAttribPointer(uL, 2, gl.FLOAT, false, 16, 8); gl.enableVertexAttribArray(uL);

function makeTex(fn) {
  var d = new Uint8Array(64*64*4);
  for (var y=0;y<64;y++) for (var x=0;x<64;x++) { var i=(y*64+x)*4; fn(x,y,i,d); }
  var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,d);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  return t;
}
// Tex A: blue checker
var texA = makeTex(function(x,y,i,d){ var ch=((x>>3)+(y>>3))%2; d[i]=ch?20:80; d[i+1]=ch?20:120; d[i+2]=ch?80:200; d[i+3]=255; });
// Tex B: orange gradient
var texB = makeTex(function(x,y,i,d){ d[i]=200+Math.sin(x*0.3)*50|0; d[i+1]=80+Math.cos(y*0.25)*40|0; d[i+2]=20; d[i+3]=255; });

var blendLoc = gl.getUniformLocation(prog,'uBlend');
var modeLoc  = gl.getUniformLocation(prog,'uMode');
gl.uniform1i(gl.getUniformLocation(prog,'uTexA'), 0);
gl.uniform1i(gl.getUniformLocation(prog,'uTexB'), 1);

function render() {
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texA);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texB);
  gl.useProgram(prog);
  gl.uniform1f(blendLoc, blend);
  gl.uniform1i(modeLoc, ['mix','add','multiply','screen'].indexOf(mode));
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

document.getElementById('blend').oninput = function() {
  blend = parseFloat(this.value);
  document.getElementById('bv').textContent = blend.toFixed(2);
  render();
};
document.querySelectorAll('.modeBtn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.modeBtn').forEach(b => { b.style.borderColor='#334155'; b.style.color='#64748b'; });
    this.style.borderColor='#38bdf8'; this.style.color='#38bdf8';
    mode = this.dataset.m; render();
  });
});

render();
console.log('Texture A = blue checker, Texture B = orange gradient');
console.log('mix(A,B,t): linear blend | add: glow effect | multiply: darken | screen: lighten');`,
      outputHeight: 360,
    },

    {
      type: 'challenge',
      instruction: `**Blend mode physics:** You want a particle fire effect. Particles near the flame centre should brighten the background — not darken it or alpha-blend over it. Which blend mode is physically correct for emissive/glow effects, and why is it order-independent?`,
      options: [
        { label: 'A', text: 'Alpha blend (Porter-Duff over) — standard transparency, sorted back-to-front' },
        { label: 'B', text: 'Multiply — dark particles darken the scene, creating shadow' },
        { label: 'C', text: 'Additive — result = src + dst. Accumulates light from each particle. No sorting needed because addition is commutative' },
        { label: 'D', text: 'Screen — inverted multiply, always produces lighter results but still order-dependent' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Additive blending (src + dst) is physically accurate for emissive light: each particle adds its brightness to the screen. Because a+b = b+a, draw order does not matter — a huge performance win. Fire, magic effects, lasers, explosions, and lens flares all use additive blending. The downside: additive always lightens — you cannot make dark particles with it.',
      failMessage: 'Fire and glow should ADD light, not replace it. Additive blend: gl.blendEquation(gl.FUNC_ADD) with gl.blendFunc(gl.ONE, gl.ONE). Each particle contributes its colour to the background. Result = A + B, independent of draw order — no back-to-front sorting required.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Alpha Blending

Standard transparency (Porter-Duff "over"):

\`\`\`
result = src.rgb * src.alpha + dst.rgb * (1 - src.alpha)
\`\`\`

In WebGL:
\`\`\`js
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);  // Porter-Duff over
\`\`\`

**Why draw order matters:** The equation uses \`dst\` (what is already in the framebuffer). If you draw a distant transparent object first, it writes a half-transparent result to the framebuffer. A nearer transparent object reads that half-transparent dst — correct. If the order is reversed, the nearer object writes first, then the far object composites on top — visually wrong.

**The sorting rule:** Render all opaque geometry first (any order — depth test handles it). Then render transparent geometry back-to-front sorted by distance from camera.

**Blend mode table:**

| Mode | GL call | Formula | Use |
|------|---------|---------|-----|
| Alpha | \`SRC_ALPHA, ONE_MINUS_SRC_ALPHA\` | src*a + dst*(1-a) | Standard transparency |
| Additive | \`ONE, ONE\` | src + dst | Fire, glow, particles |
| Premultiplied alpha | \`ONE, ONE_MINUS_SRC_ALPHA\` | src + dst*(1-a) | UI, text rendering |
| Multiply | \`DST_COLOR, ZERO\` | src * dst | Shadow, glass tint |

## Part 3 — PBR Texture Slots

Modern PBR materials combine multiple textures, each encoding a different surface property:

| Texture | What it stores | GLSL use |
|---------|----------------|----------|
| **Albedo / Diffuse** | Base colour (sRGB) | Base surface colour |
| **Roughness** | Surface micro-roughness (R channel) | Blurs specular highlight |
| **Metalness** | Is this area metal? (R channel, 0 or 1) | Metal tints specular to albedo colour |
| **Normal map** | Surface tilt direction (RGB → tangent vec) | Per-pixel lighting normal |
| **AO (Ambient Occlusion)** | Shadowed crevices (R channel) | Darkens ambient where light can't reach |
| **Emissive** | Self-illumination (RGB) | Added on top of lighting result |

\`\`\`glsl
vec4 albedo    = texture(uAlbedo, vUv);
float roughness = texture(uRoughness, vUv).r;
float metalness = texture(uMetalness, vUv).r;
vec4  emissive  = texture(uEmissive, vUv);

// Final colour = lighting * albedo * ao + emissive
gl_FragColor = vec4(lightResult * albedo.rgb + emissive.rgb, 1.0);
\`\`\``,
    },

    {
      type: 'challenge',
      instruction: `**Texture channel packing:** A roughness texture and a metalness texture could each be full RGBA images (4 channels each). Instead, game engines pack them into a single texture: roughness in the G channel, metalness in the B channel. What does this save — and what must the fragment shader do differently to use them?`,
      options: [
        { label: 'A', text: 'Saves one texture unit — the shader reads the packed texture once and uses .r and .g components' },
        { label: 'B', text: 'Saves one draw call per material' },
        { label: 'C', text: 'Saves one texture upload (halves VRAM) — the shader reads one sampler and uses texture(uORM, vUv).g for roughness and .b for metalness' },
        { label: 'D', text: 'Reduces UV interpolation cost — fewer UV attributes needed' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Packing multiple greyscale maps into RGBA channels halves (or quarters) the VRAM usage. The ORM (Occlusion/Roughness/Metalness) texture is the glTF standard: R=AO, G=Roughness, B=Metalness. The shader reads texture(uORM, vUv) once, then uses .r, .g, .b for the three values — one texture unit, one fetch, three properties.',
      failMessage: 'Packing roughness, metalness, and AO into one texture\'s R/G/B channels halves VRAM vs three separate textures. The GLSL reads float roughness = texture(uORM, vUv).g; float metalness = texture(uORM, vUv).b; — or better, vec3 orm = texture(uORM, vUv).rgb; then access .r/.g/.b. This is the glTF 2.0 standard ORM layout.',
      html: '', css: `body{margin:0;padding:0}`, startCode: '', outputHeight: 240,
    },

  ],
};

export default {
  id: 'three-js-2-1-multi-textures',
  slug: 'multiple-textures',
  chapter: 'three-js.2',
  order: 1,
  title: 'Multiple Textures & Blending',
  subtitle: 'Combining diffuse, roughness, and alpha maps — and how the GPU composites layered surfaces.',
  tags: ['three-js', 'textures', 'blending', 'alpha', 'mix', 'additive', 'pbr'],
  hook: {
    question: 'How does a PBR material use 4 separate textures — and how does the GPU combine them into one colour per pixel?',
    realWorldContext: 'Every PBR material in Unreal, Unity, or Three.js uses at least 4 texture slots. Multi-texturing is the baseline of modern 3D rendering.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Multiple textures: activeTexture(TEXTURE0+n) → bind → uniform1i(sampler, n).',
      'mix(a, b, t): linear interpolation. a*(1-t) + b*t. t=0 → a, t=1 → b.',
      'Alpha blend: result = src*alpha + dst*(1-alpha). Requires back-to-front sort.',
      'Additive blend: result = src + dst. Order-independent — perfect for particles, glow.',
      'PBR textures: albedo(RGB), roughness(R), metalness(R), normal(RGB), AO(R), emissive(RGB).',
    ],
    callouts: [
      { type: 'tip', title: 'ORM Packing', body: 'Pack Occlusion, Roughness, Metalness into one texture\'s R/G/B channels — halves VRAM vs three separate textures. glTF 2.0 standardises this layout.' },
    ],
    visualizations: [{ id: 'JSNotebook', title: 'Multiple Textures & Blending', props: { lesson: LESSON_3JS_2_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'mix(a,b,t): linear blend. AdditivBlend: a+b. MultiplyBlend: a*b.',
    'Alpha: src*src.a + dst*(1-src.a). Draw transparent back-to-front.',
    'Additive: src + dst. Order-independent — fire, glow, particles.',
    'Three.js: material.map, roughnessMap, metalnessMap, aoMap, emissiveMap.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Additive blending: src + dst. Order-independent — fire, glow, particles." Why is additive blending order-independent while alpha blending is not?',
      options: [
        'Additive blending does not use the alpha channel',
        'Addition is commutative — adding A then B equals adding B then A. Alpha over (src×a + dst×(1-a)) depends on what is already in dst, so draw order changes the result',
        'The GPU sorts particles automatically for additive blending',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Alpha: src×src.a + dst×(1-src.a). Draw transparent back-to-front." A semi-transparent red object is drawn in front of a blue background. What colour result do you get?',
      options: [
        'Pure red — the alpha is ignored once blending is active',
        'A mix of red and blue — red\'s contribution scales by its alpha, blue\'s contribution scales by (1 - red\'s alpha)',
        'Pure blue — the background is never overwritten by transparent objects',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"mix(a,b,t): linear blend." In GLSL, what does mix(vec3(1,0,0), vec3(0,0,1), 0.25) return?',
      options: [
        'vec3(0.75, 0.0, 0.25) — 75% red, 25% blue',
        'vec3(0.25, 0.0, 0.75) — 25% red, 75% blue',
        'vec3(0.5, 0.0, 0.5) — 50% red, 50% blue',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"MultiplyBlend: a*b." A roughness map has a value of 0.5 and the material base roughness is 0.8. After multiplying, what is the effective roughness?',
      options: [
        '1.3 — the values are added',
        '0.4 — 0.5 × 0.8 = 0.4 (multiplying darkens or reduces the base value)',
        '0.8 — the map overrides the base',
      ],
      correct: 1,
    },
  ],
};

export { LESSON_3JS_2_1 };
