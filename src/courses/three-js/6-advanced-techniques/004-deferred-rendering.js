// Three.js · Chapter 5 · Lesson 3
// Deferred Rendering

const LESSON_3JS_5_3 = {
  title: 'Deferred Rendering',
  subtitle: 'Separate geometry from lighting — scale to 100 lights with constant per-light cost.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The lights problem

Forward rendering has a fundamental scaling problem: cost = O(geometry × lights). Every triangle must be shaded by every light that affects it. With 10 lights and 100K triangles, that's 1 million lighting calculations per frame.

**Deferred rendering** breaks the dependency. It separates the expensive geometry work from the expensive lighting work:

1. **Geometry pass:** Render all geometry once, storing surface data (position, normal, albedo) in a **G-buffer** — a set of render targets.
2. **Lighting pass:** For each light, read the G-buffer and compute lighting — touching only the screen pixels affected by that light.

Cost becomes O(geometry) + O(lights × screen pixels). Adding lights doesn't add geometry cost. AAA games use 50–200 dynamic lights only because of deferred rendering.`,
    },

    // ── 1. G-Buffer contents ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The G-Buffer (Geometry Buffer)

The G-buffer is a set of **Multiple Render Targets (MRT)** written in a single geometry pass:

| Render Target | Contents | Format |
|---------------|----------|--------|
| **G0** | Albedo (diffuse colour) | RGBA8 |
| **G1** | World-space normal | RGBA16F |
| **G2** | World-space position | RGBA32F |
| **G3** | Material properties (roughness, metalness, AO) | RGBA8 |

In GLSL (WebGL 2 / DRAW_FRAMEBUFFER):
\`\`\`glsl
// Geometry pass fragment shader — writes to 4 render targets
layout(location = 0) out vec4 gAlbedo;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gPosition;
layout(location = 3) out vec4 gMaterial;

void main() {
  gAlbedo = vec4(albedo, 1.0);
  gNormal = vec4(normalize(vNormal), 0.0);
  gPosition = vec4(vWorldPos, 1.0);
  gMaterial = vec4(roughness, metalness, ao, 0.0);
}
\`\`\``,
    },

    // ── 2. Lighting pass ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Lighting Pass

After the geometry pass, run a **full-screen quad** shader for each light, reading from the G-buffer:

\`\`\`glsl
// Lighting pass fragment shader
uniform sampler2D gAlbedo;
uniform sampler2D gNormal;
uniform sampler2D gPosition;
uniform vec3 uLightPos;
uniform vec3 uLightColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec3 albedo   = texture2D(gAlbedo, uv).rgb;
  vec3 normal   = texture2D(gNormal, uv).rgb;
  vec3 worldPos = texture2D(gPosition, uv).rgb;

  vec3 L = normalize(uLightPos - worldPos);
  vec3 V = normalize(uCamPos - worldPos);
  vec3 H = normalize(L + V);

  float diff = max(0.0, dot(normal, L));
  float spec = pow(max(0.0, dot(normal, H)), 64.0);

  float dist = length(uLightPos - worldPos);
  float att  = 1.0 / (1.0 + 0.1 * dist + 0.01 * dist * dist);

  gl_FragColor = vec4((diff * albedo + spec) * uLightColor * att, 1.0);
}
// Accumulate N lights using additive blending
\`\`\``,
    },

    // ── 3. G-Buffer visualization ──────────────────────────────────────────
    {
      type: 'js',
      id: 'gbuffer-vis',
      html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:480px;margin:auto">
  <div><canvas id="g-albedo" width="230" height="150" style="width:100%;border-radius:6px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:11px;color:#fa7;margin:3px 0">G0: Albedo</p></div>
  <div><canvas id="g-normal" width="230" height="150" style="width:100%;border-radius:6px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:11px;color:#7af;margin:3px 0">G1: World Normal</p></div>
  <div><canvas id="g-depth" width="230" height="150" style="width:100%;border-radius:6px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:11px;color:#7f9;margin:3px 0">G2: Depth (position.z)</p></div>
  <div><canvas id="g-final" width="230" height="150" style="width:100%;border-radius:6px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:11px;color:#fff;margin:3px 0">Final: Lit result</p></div>
</div>`,
      startCode: `function renderGBuffer(id, visualMode){
  const c=document.getElementById(id);
  const gl=c.getContext('webgl');
  const W=c.width,H=c.height;
  const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
  const fs=\`precision mediump float;
varying vec2 vUV;
uniform int uMode;
void main(){
  // Scene: two spheres on floor
  vec2 ar=vec2(float(\${W})/float(\${H}),1.);
  vec2 uv=(vUV*2.-1.)*ar;
  vec3 col=vec3(.1,.1,.12); // bg

  // Sphere 1
  vec2 s1=uv-vec2(-.6,0.);
  float r1=length(s1);
  if(r1<.5){
    vec3 N=normalize(vec3(s1,sqrt(.25-dot(s1,s1))));
    if(uMode==0) col=vec3(.8,.3,.1);     // albedo
    else if(uMode==1) col=N*.5+.5;       // normals as color
    else if(uMode==2){float d=1.-sqrt(dot(s1,s1))*.5;col=vec3(d);}
    else {
      vec3 L=normalize(vec3(1.5,2.,2.));
      vec3 V=normalize(vec3(0,0,3));
      vec3 H=normalize(L+V);
      float diff=max(0.,dot(N,L));
      float spec=pow(max(0.,dot(N,H)),48.);
      col=(.8*diff+.12)*vec3(.8,.3,.1)+spec*.7;
    }
  }
  // Sphere 2
  vec2 s2=uv-vec2(.6,0.);
  float r2=length(s2);
  if(r2<.45){
    vec3 N=normalize(vec3(s2,sqrt(.2025-dot(s2,s2))));
    if(uMode==0) col=vec3(.2,.5,.8);
    else if(uMode==1) col=N*.5+.5;
    else if(uMode==2){float d=1.-sqrt(dot(s2,s2))*.5;col=vec3(d);}
    else{
      vec3 L=normalize(vec3(1.5,2.,2.));
      vec3 V=normalize(vec3(0,0,3));
      vec3 H=normalize(L+V);
      float diff=max(0.,dot(N,L));
      float spec=pow(max(0.,dot(N,H)),96.);
      col=(.8*diff+.12)*vec3(.2,.5,.8)+spec*.9;
    }
  }
  gl_FragColor=vec4(col,1);
}\`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x;}
  const prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
  gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const al=gl.getAttribLocation(prog,'aPos');
  gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  const uMode=gl.getUniformLocation(prog,'uMode');
  gl.uniform1i(uMode,visualMode);
  gl.clearColor(.06,.06,.08,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
renderGBuffer('g-albedo',0);
renderGBuffer('g-normal',1);
renderGBuffer('g-depth',2);
renderGBuffer('g-final',3);`,
    },

    // ── 4. Forward vs deferred cost ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Forward vs Deferred — Cost Comparison

| | Forward | Deferred |
|--|---------|----------|
| **Geometry cost** | O(verts × lights) | O(verts) × 1 |
| **Lighting cost** | Per fragment, per light affecting it | Per pixel × light screen area |
| **Overdraw cost** | Full shade even if pixel overwritten | Geometry pass still overdraws |
| **Transparent objects** | Work natively | Require forward pass fallback |
| **MSAA** | Works natively | Expensive / not native |
| **Memory** | Framebuffer only | Framebuffer + G-buffer (4+ render targets) |
| **Lights** | ~4–8 dynamic lights | 50–200+ dynamic lights |

### When to use each

**Forward:** Small scenes, VR (MSAA required), mostly transparent objects, few lights, mobile.

**Deferred:** Large game worlds, many dynamic lights, modern desktop hardware, opaque-heavy scenes.

**Tiled/Clustered Forward:** Hybrid — divides screen into tiles, assigns lights per tile. Used by many modern games (Doom 2016, Unreal Engine 5).`,
    },

    // ── 5. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-deferred-cost',
      instruction: 'A forward-rendered scene has 10,000 triangles and 50 lights. Each triangle is affected by 10 lights on average. Approximately how many lighting calculations happen per frame?',
      options: [
        { label: 'A', text: '10,000 — one per triangle regardless of light count' },
        { label: 'B', text: '50,000 — one per triangle per unique light source' },
        { label: 'C', text: '100,000 — 10,000 triangles × 10 lights each' },
        { label: 'D', text: '500,000 — 10,000 triangles × 50 total lights (worst case)' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 6. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-gbuffer-contents',
      instruction: 'In a deferred renderer, the G-buffer stores world-space normals rather than screen-space normals. Why?',
      options: [
        { label: 'A', text: 'World-space normals fit in fewer bytes than screen-space normals' },
        { label: 'B', text: 'The lighting pass uses world-space light positions, so world-space normals allow the dot product without coordinate space conversion' },
        { label: 'C', text: 'Screen-space normals are always (0,0,1) for front-facing surfaces, making them useless for lighting' },
        { label: 'D', text: 'World-space normals don\'t require re-normalisation after interpolation, reducing GPU cost' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-transparent',
      instruction: 'A deferred renderer needs to draw transparent objects (glass, particles). What is the standard approach?',
      options: [
        { label: 'A', text: 'Store an additional G-buffer target for transparency — the lighting pass blends transparent and opaque results' },
        { label: 'B', text: 'Render transparent objects in a separate forward pass after the deferred lighting pass, composited on top' },
        { label: 'C', text: 'Disable depth testing for transparent objects so they overwrite G-buffer contents correctly' },
        { label: 'D', text: 'Transparency is impossible in deferred rendering — all transparent objects must be replaced with opaque approximations' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Normal visualiser (G-buffer) ────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Write World Normals to the G-Buffer

In deferred rendering the geometry pass encodes surface normals into a texture. Normals (-1..1) must be packed into 0..1 range for storage:

\`gl_FragColor = vec4(N * 0.5 + 0.5, 1.0)\`

**Requirements:**
1. Compute \`vec3 N = normalize(vec3(uv, sqrt(1.0 - r2)))\`
2. Output \`vec4(N * 0.5 + 0.5, 1.0)\` — encodes the normal as colour

Result: colourful sphere where red=+X, green=+Y, blue=+Z.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.05,.05,.1,1);return;}
  // TODO 1: vec3 N = normalize(vec3(uv, sqrt(1.0 - r2)))
  // TODO 2: gl_FragColor = vec4(N * 0.5 + 0.5, 1.0)
  gl_FragColor=vec4(.5,.5,.5,1.); // placeholder
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.clearColor(.05,.05,.1,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.05,.05,.1,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  gl_FragColor=vec4(N*.5+.5,1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.clearColor(.05,.05,.1,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /N\s*\*\s*\.?5\s*\+\s*\.?5/.test(code) && /normalize\(vec3\(uv/.test(code),
    },
  ],
}

export default {
  id: 'three-js-5-3-deferred-rendering',
  slug: 'deferred-rendering',
  chapter: 'three-js.5',
  order: 3,
  title: 'Deferred Rendering',
  subtitle: 'Separate geometry from lighting — scale to 100 lights with constant per-light cost.',
  tags: ['three-js', 'deferred', 'g-buffer', 'mrt', 'lighting'],
  hook: {
    question: 'Forward rendering costs O(geometry × lights) per frame. Deferred rendering costs O(geometry) + O(lights × screen-pixels). For 1 light they are equal. When does deferred significantly win?',
    realWorldContext: 'AAA games in 2024 commonly use 50–200 dynamic lights. This is only possible because of deferred rendering. Call of Duty, The Witcher 3, Cyberpunk 2077 — all deferred.',
  },
  intuition: {
    prose: 'Geometry pass writes albedo/normal/position to G-buffer MRTs. Lighting pass reads G-buffer per light. Cost: O(geo) + O(lights×pixels). Transparent objects need a separate forward pass.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Deferred Rendering', props: { lesson: LESSON_3JS_5_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Pass1: geo→G-buffer(albedo,normal,position). Pass2: per light, fullscreen quad reads G-buffer, shades pixels. O(geo)+O(lights×pixels). Transparent: forward pass after.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_5_3 }
