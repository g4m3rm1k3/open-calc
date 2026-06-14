// Three.js · Chapter 5 · Lesson 0
// Shadow Mapping

const LESSON_3JS_5_0 = {
  title: 'Shadow Mapping',
  subtitle: 'The 1978 two-pass algorithm that still powers all real-time shadows.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The oldest trick in real-time rendering

Frank Williams invented shadow mapping in 1977 for Lucasfilm's rendering of *Star Wars*. It became an Academy Award–winning technical achievement. 47 years later, it remains the foundational real-time shadow technique — because nothing cheaper has been found that looks as good.

The algorithm is elegant: **render the scene from the light's point of view**. Store the depths. When rendering from the camera, ask: "Is this fragment visible from the light — or is something else closer to the light at this position?" If something else is closer, the fragment is in shadow.

Two renders. One comparison. Shadows.`,
    },

    // ── 1. Algorithm overview ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Shadow Map Algorithm

**Pass 1 — Render from the light:**
\`\`\`javascript
// Set up a camera at the light's position
lightCamera.position.copy(lightPos)
lightCamera.lookAt(0, 0, 0)

// Render depth to shadow map texture
renderer.setRenderTarget(shadowMapTarget)
renderer.render(scene, lightCamera)
\`\`\`

**Pass 2 — Render from the camera, using the shadow map:**
\`\`\`glsl
// In the fragment shader:
// 1. Transform fragment position into light's clip space
vec4 lightSpacePos = uLightProjView * vec4(vWorldPos, 1.0);
// 2. Perspective divide → NDC [-1, 1] → UV [0, 1]
vec3 projCoords = lightSpacePos.xyz / lightSpacePos.w;
vec2 shadowUV = projCoords.xy * 0.5 + 0.5;
float fragDepth = projCoords.z * 0.5 + 0.5;
// 3. Sample the shadow map
float shadowDepth = texture2D(uShadowMap, shadowUV).r;
// 4. Compare — if fragment is further than stored depth, it's in shadow
float inShadow = fragDepth > shadowDepth + uBias ? 1.0 : 0.0;
\`\`\``,
    },

    // ── 2. Shadow map bias ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Shadow Map Bias — The Critical Tuning

Without bias, every surface self-shadows. The shadow map depth and the fragment depth are both computed from the same light space, but floating-point rounding causes them to differ slightly.

**Shadow acne:** the surface alternates between being in shadow and not, producing dark striped bands.

**Too much bias:** the shadow appears to "float" above surfaces — called **peter-panning** (after the boy who lost his shadow).

\`\`\`glsl
// Fixed bias (simple, often sufficient)
float bias = 0.005;
float inShadow = fragDepth > shadowDepth + bias ? 1.0 : 0.0;

// Slope-scale bias (varies with surface angle to light)
float cosTheta = clamp(dot(normal, lightDir), 0.0, 1.0);
float bias = max(0.05 * (1.0 - cosTheta), 0.005);
\`\`\`

Slope-scale bias applies more offset to surfaces nearly parallel to the light (where acne is worst) and less to surfaces facing the light (where peter-panning would be visible).`,
    },

    // ── 3. Shadow acne/bias visualizer ────────────────────────────────────
    {
      type: 'js',
      id: 'bias-demo',
      html: `<canvas id="c-bias" width="480" height="260" style="width:480px;height:260px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Bias: <input id="bias" type="range" min="0" max="100" value="5" style="width:150px"> <span id="bias-v">0.005</span></label>
</div>`,
      startCode: `const c=document.getElementById('c-bias');
const ctx=c.getContext('2d');
const W=480,H=260;
const biasEl=document.getElementById('bias');

function draw(){
  const bias=biasEl.value/1000;
  document.getElementById('bias-v').textContent=bias.toFixed(3);

  ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,W,H);

  // Simulate shadow rendering on a flat floor
  // Light from upper right
  const lightX=420,lightY=40;
  const floorY=180;
  const occluderX=240,occluderBase=180,occluderH=60;

  // Floor
  ctx.fillStyle='#2a3a2a';
  ctx.fillRect(0,floorY,W,H-floorY);

  // Compute shadow for each floor pixel
  for(let x=0;x<W;x++){
    // Ray from light to floor pixel
    const fy=floorY;
    const dx=x-lightX, dy=fy-lightY;
    const len=Math.sqrt(dx*dx+dy*dy);
    const steps=Math.floor(len);
    let inShadow=false;
    // Check if occluder is hit
    for(let s=0;s<steps;s++){
      const t=s/steps;
      const rx=lightX+dx*t, ry=lightY+dy*t;
      if(rx>occluderX-15&&rx<occluderX+15&&ry>occluderBase-occluderH&&ry<occluderBase){
        inShadow=true; break;
      }
    }

    // Self-shadow simulation: add "acne" based on angle and bias
    // Surface normal is straight up (0,1), light comes from angle
    const cosTheta=Math.abs(dy)/len;
    const slopeAcne=bias<0.003?(Math.sin(x*0.3)*0.5+0.5>0.5?0.3:0):0;
    const shadowStr=inShadow?0.85:slopeAcne;

    const flen=H-floorY;
    const grad=ctx.createLinearGradient(x,floorY,x,H);
    grad.addColorStop(0,\`rgba(0,0,0,\${shadowStr})\`);
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(x,floorY,1,flen);
  }

  // Occluder
  ctx.fillStyle='#4a5a7a';
  ctx.fillRect(occluderX-15,occluderBase-occluderH,30,occluderH);
  // Top cap
  ctx.beginPath();ctx.arc(occluderX,occluderBase-occluderH,15,Math.PI,0);ctx.fill();

  // Light indicator
  ctx.beginPath();ctx.arc(lightX,lightY,8,0,Math.PI*2);
  ctx.fillStyle='#ffd040';ctx.fill();
  ctx.fillStyle='rgba(255,208,64,0.1)';
  ctx.beginPath();ctx.arc(lightX,lightY,40,0,Math.PI*2);ctx.fill();

  // Labels
  ctx.fillStyle='#fff';ctx.font='bold 12px monospace';
  const label=bias<0.002?'⚠ Shadow Acne (bias too low)':
               bias>0.02?'⚠ Peter-Panning (bias too high)':
               '✓ Good bias — clean shadows';
  const col=bias<0.002?'#f87':bias>0.02?'#fa7':'#7f9';
  ctx.fillStyle=col;ctx.fillText(label,12,22);
  ctx.fillStyle='#666';ctx.font='11px monospace';
  ctx.fillText('bias = '+bias.toFixed(3),12,H-10);
}
biasEl.addEventListener('input',draw);
draw();`,
    },

    // ── 4. PCF filtering ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## PCF — Percentage Closer Filtering

Raw shadow maps produce **hard edges** — pixel-perfect aliasing. Real shadows have soft edges because light sources have area.

**PCF** (Percentage Closer Filtering, 1987) samples the shadow map multiple times in a kernel, averaging the shadow comparison results:

\`\`\`glsl
float shadow = 0.0;
vec2 texelSize = 1.0 / uShadowMapSize;
for (int x = -1; x <= 1; x++) {
  for (int y = -1; y <= 1; y++) {
    vec2 offset = vec2(float(x), float(y)) * texelSize;
    float pcfDepth = texture2D(uShadowMap, shadowUV + offset).r;
    shadow += fragDepth > pcfDepth + uBias ? 1.0 : 0.0;
  }
}
shadow /= 9.0;   // 3×3 kernel average
\`\`\`

PCF doesn't blur the depth values — it blurs the **binary shadow comparison**. This preserves depth accuracy while producing smooth shadow edges.

**Three.js PCF control:**
\`\`\`javascript
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap  // PCF with soft edges
// or THREE.BasicShadowMap (hard), THREE.PCFShadowMap (3×3 PCF)
light.shadow.mapSize.width = 2048
light.shadow.mapSize.height = 2048
light.shadow.camera.near = 0.5
light.shadow.camera.far = 100
\`\`\``,
    },

    // ── 5. Three.js shadow setup ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Complete Three.js Shadow Setup

\`\`\`javascript
// 1. Enable shadow rendering
const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// 2. Configure the light to cast shadows
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
dirLight.position.set(10, 20, 10)
dirLight.castShadow = true

// Shadow camera frustum — must encompass your scene
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far = 100
dirLight.shadow.camera.left = -20     // for orthographic shadow camera
dirLight.shadow.camera.right = 20
dirLight.shadow.camera.top = 20
dirLight.shadow.camera.bottom = -20

// Shadow map resolution
dirLight.shadow.mapSize.width = 2048   // higher = sharper but more memory
dirLight.shadow.mapSize.height = 2048
dirLight.shadow.bias = -0.001          // tune to remove acne without peter-panning

// 3. Objects: flag what casts and receives shadows
sphere.castShadow = true
floor.receiveShadow = true
\`\`\`

**Debugging shadows:**
\`\`\`javascript
// Visualize the shadow camera frustum
const helper = new THREE.CameraHelper(dirLight.shadow.camera)
scene.add(helper)
\`\`\``,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-two-pass',
      instruction: 'In shadow mapping\'s first pass, what exactly is written to the shadow map texture?',
      options: [
        { label: 'A', text: 'The colour of each surface as seen from the light\'s point of view' },
        { label: 'B', text: 'The depth (distance from light) of the closest surface at each shadow map texel' },
        { label: 'C', text: 'A binary mask: 1 if the surface is directly lit, 0 if it faces away from the light' },
        { label: 'D', text: 'The surface normal in light space, used for slope-scale bias in pass 2' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-bias-tradeoff',
      instruction: 'You increase shadow bias to fix acne, but now the character\'s feet no longer connect to their shadow — the shadow appears to float. What is this artifact called and what caused it?',
      options: [
        { label: 'A', text: 'Shadow leaking — the shadow passes through the floor mesh at high bias values' },
        { label: 'B', text: 'Peter-panning — too much bias offsets fragment depth past the shadow map depth even where the surface should be in shadow' },
        { label: 'C', text: 'Aliasing — the shadow map resolution is too low to represent the contact shadow correctly' },
        { label: 'D', text: 'Self-shadowing — the character mesh shadows itself due to incorrect bias direction' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-pcf',
      instruction: 'PCF (Percentage Closer Filtering) softens shadow edges by averaging multiple samples. What specifically is averaged?',
      options: [
        { label: 'A', text: 'The depth values in the shadow map (blurring the depth texture)' },
        { label: 'B', text: 'The colour values of the lit and shadowed surface' },
        { label: 'C', text: 'The binary shadow comparison results (0 or 1) from multiple shadow map samples' },
        { label: 'D', text: 'The normal vectors at nearby pixels to smooth the shadow boundary' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Shadow bias comparison ─────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Shadow Depth Comparison with Bias

Complete the shadow test. The fragment has a depth in light-space (\`fragDepth\`), and the shadow map stores the nearest occluder depth (\`shadowDepth\`).

**Requirements:**
1. \`float bias = 0.005\` — prevents self-shadowing acne
2. \`float shadow = fragDepth > shadowDepth + bias ? 1.0 : 0.0\`
3. \`NdL *= (1.0 - shadow * 0.85)\` — darken shadowed fragments

The right side of the sphere should appear shadowed.`,
      html: `<canvas id="c" width="400" height="280" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 L=normalize(vec3(1.,1.5,2.));
  float NdL=max(0.,dot(N,L));
  float fragDepth=0.6+uv.x*0.3;
  float shadowDepth=0.45;
  // TODO 1: float bias = 0.005
  // TODO 2: float shadow = fragDepth > shadowDepth + bias ? 1.0 : 0.0
  // TODO 3: NdL *= (1.0 - shadow * 0.85)
  vec3 albedo=vec3(.7,.6,.4);
  gl_FragColor=vec4(albedo*(0.1+NdL),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 L=normalize(vec3(1.,1.5,2.));
  float NdL=max(0.,dot(N,L));
  float fragDepth=0.6+uv.x*0.3;
  float shadowDepth=0.45;
  float bias=0.005;
  float shadow=fragDepth>shadowDepth+bias?1.:0.;
  NdL*=(1.-shadow*0.85);
  vec3 albedo=vec3(.7,.6,.4);
  gl_FragColor=vec4(albedo*(0.1+NdL),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /bias\s*=\s*0\.005/.test(code) && /shadowDepth\s*\+\s*bias/.test(code) && /1\.\s*-\s*shadow/.test(code),
    },
  ],
}

export default {
  id: 'three-js-5-0-shadow-mapping',
  slug: 'shadow-mapping',
  chapter: 'three-js.5',
  order: 0,
  title: 'Shadow Mapping',
  subtitle: 'The 1978 two-pass algorithm that still powers all real-time shadows.',
  tags: ['three-js', 'shadows', 'shadow-map', 'pcf', 'depth-texture'],
  hook: {
    question: 'A light casts a shadow on a floor. The GPU renders the scene twice — once from the light, once from the camera. What does it do with the two renders to decide which parts are in shadow?',
    realWorldContext: 'Frank Williams invented shadow mapping for Star Wars (1977). The algorithm has been the foundational real-time shadow technique for 45 years — because nothing cheaper has been found that looks as good.',
  },
  intuition: {
    prose: 'Pass 1: render depth from light → shadow map. Pass 2: project fragment into light space, compare depth — further = in shadow. Bias prevents acne. PCF averages comparisons for soft edges.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Shadow Mapping', props: { lesson: LESSON_3JS_5_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['shadowMap: render from light → store depth. Main pass: fragDepth > shadowDepth+bias → shadow. PCF: average 3×3 comparison. Three.js: renderer.shadowMap.enabled, light.castShadow.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_5_0 }
