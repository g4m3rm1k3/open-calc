// Three.js · Chapter 4 · Lesson 4
// Cubemaps & Skyboxes

const LESSON_3JS_4_4 = {
  title: 'Cubemaps & Skyboxes',
  subtitle: 'The six-faced texture that captures the entire environment for reflections and IBL.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Capturing the whole world in six textures

How does a mirror ball reflect its entire surroundings? It reflects light from every direction. To simulate this in a shader, you need a texture that stores colours for **every possible direction** — not just a flat surface.

A **cubemap** is exactly this: six textures arranged as the faces of a cube. Any direction vector points to a unique texel in one of the six faces. Sample with a direction, get a colour.

Cubemaps power:
- **Skyboxes** — the background environment seen from inside the cube
- **Environment reflections** — objects reflecting their surroundings
- **Image-Based Lighting (IBL)** — full environment lighting from an HDR photo`,
    },

    // ── 1. Cubemap structure ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cubemap Structure

Six faces: **+X, -X, +Y, -Y, +Z, -Z** — right, left, top, bottom, front, back.

Each face is a square texture. A direction vector \`(x, y, z)\` selects the face by its largest component:

\`\`\`
|x| > |y| && |x| > |z|  → +X or -X face
|y| > |x| && |y| > |z|  → +Y or -Y face
|z| > |x| && |z| > |y|  → +Z or -Z face
\`\`\`

Then the remaining two components (divided by the largest) give UV within that face.

**GLSL sampling is automatic — just provide the direction:**
\`\`\`glsl
uniform samplerCube uEnvMap;

void main() {
  vec3 dir = normalize(vWorldPos - uCamPos);  // view direction
  vec3 R = reflect(dir, vNormal);              // reflection direction
  vec4 envColour = textureCube(uEnvMap, R);   // sample environment
  gl_FragColor = envColour;
}
\`\`\`

You never need to manually select a face. The GPU's texture unit handles it.`,
    },

    // ── 2. Cubemap face diagram ───────────────────────────────────────────
    {
      type: 'js',
      id: 'cube-diagram',
      html: `<canvas id="c-cube" width="480" height="300" style="width:480px;height:300px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>`,
      startCode: `const c=document.getElementById('c-cube');
const ctx=c.getContext('2d');
ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,480,300);

// Draw cubemap cross layout: Top, Left, Front, Right, Back, Bottom
const S=60, PAD=30;
const faces=[
  {name:'+Y (top)',   x:PAD+S,   y:PAD,     col:'#4a8f'},
  {name:'-X (left)',  x:PAD,     y:PAD+S,   col:'#48af'},
  {name:'+Z (front)', x:PAD+S,   y:PAD+S,   col:'#f48f'},
  {name:'+X (right)', x:PAD+S*2, y:PAD+S,   col:'#8f4f'},
  {name:'-Z (back)',  x:PAD+S*3, y:PAD+S,   col:'#84af'},
  {name:'-Y (bot)',   x:PAD+S,   y:PAD+S*2, col:'#af8f'},
];
faces.forEach(f=>{
  ctx.fillStyle=f.col+'44';
  ctx.strokeStyle=f.col;
  ctx.lineWidth=2;
  ctx.fillRect(f.x,f.y,S,S);
  ctx.strokeRect(f.x,f.y,S,S);
  ctx.fillStyle='#fff';
  ctx.font='9px monospace';
  const parts=f.name.split(' ');
  ctx.fillText(parts[0],f.x+4,f.y+16);
  ctx.fillText(parts[1],f.x+4,f.y+28);
});

// Direction vector example
const cx=280,cy=120;
ctx.strokeStyle='#7bf';ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(cx,cy,50,0,Math.PI*2);
ctx.stroke();
ctx.fillStyle='#7bf2';ctx.fill();

// Draw axes
function vec(dx,dy,label,col){
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+dx,cy+dy);
  const len=Math.sqrt(dx*dx+dy*dy);
  ctx.lineTo(cx+dx-8*dx/len-5*dy/len,cy+dy-8*dy/len+5*dx/len);
  ctx.moveTo(cx+dx,cy+dy);
  ctx.lineTo(cx+dx-8*dx/len+5*dy/len,cy+dy-8*dy/len-5*dx/len);
  ctx.stroke();
  ctx.fillStyle=col;ctx.font='bold 12px monospace';
  ctx.fillText(label,cx+dx+6,cy+dy+4);
}
vec(50,0,'+X','#f77');
vec(-50,0,'-X','#f772');
vec(0,-45,'+Y','#7f7');
vec(0,45,'-Y','#7f72');
vec(30,30,'+Z','#7bf');
vec(-30,-30,'-Z','#7bf2');

ctx.fillStyle='#fff';ctx.font='bold 13px monospace';
ctx.fillText('Six cubemap faces',cx-50,cy+70);
ctx.fillStyle='#777';ctx.font='11px monospace';
ctx.fillText('Direction → largest component → face → UV',cx-80,cy+87);

// Note about sampling
ctx.fillStyle='#888';ctx.font='11px monospace';
ctx.fillText('textureCube(sampler, direction) — GPU selects face automatically',20,280);`,
    },

    // ── 3. Skybox ─────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Skybox Rendering

A skybox is a cubemap rendered as the background. The trick: render it **at infinite distance** so it's always behind everything else.

### WebGL Skybox Trick
\`\`\`glsl
// Vertex shader — force depth to 1.0 (the far plane)
void main() {
  vec4 pos = uProjection * mat4(mat3(uView)) * vec4(aPos, 1.0);
  // Strip translation from view matrix (mat3 extracts rotation only)
  gl_Position = pos.xyww;  // ← w/w = 1.0 after perspective divide = max depth
}

// Fragment shader
void main() {
  gl_FragColor = textureCube(uSkybox, vTexDir);
}
\`\`\`

The \`.xyww\` swizzle puts \`w\` in the z component. After perspective division (\`z/w = w/w = 1.0\`), the skybox always renders at depth 1.0 — the far plane.

### Three.js
\`\`\`javascript
import { CubeTextureLoader } from 'three'

const loader = new CubeTextureLoader()
const envMap = loader.load([
  '/skybox/px.jpg', '/skybox/nx.jpg',  // +X, -X
  '/skybox/py.jpg', '/skybox/ny.jpg',  // +Y, -Y
  '/skybox/pz.jpg', '/skybox/nz.jpg',  // +Z, -Z
])
scene.background = envMap   // use as skybox background
scene.environment = envMap  // use for PBR environment reflections
\`\`\``,
    },

    // ── 4. Reflection and refraction ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Environment Reflections & Refraction

### Reflection
\`\`\`glsl
vec3 I = normalize(vWorldPos - uCamPos);  // incident direction
vec3 R = reflect(I, normalize(vNormal));   // reflection
vec4 reflected = textureCube(uEnvMap, R);
\`\`\`

### Refraction (Snell's Law)
\`\`\`glsl
float eta = 1.0 / 1.5;  // air to glass (IOR 1.5)
vec3 T = refract(normalize(I), normalize(vNormal), eta);
vec4 refracted = textureCube(uEnvMap, T);

// Mix reflection and refraction (Fresnel approximation)
float fresnel = pow(1.0 - max(0.0, dot(-I, vNormal)), 5.0);
gl_FragColor = mix(refracted, reflected, fresnel);
\`\`\`

### Fresnel Effect
At grazing angles, even non-metals become highly reflective (water, glass). The Schlick approximation:
\`\`\`glsl
// F0 = base reflectance at 0° incidence (0.04 for glass)
float F0 = 0.04;
float fresnel = F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
\`\`\``,
    },

    // ── 5. Interactive reflection demo ────────────────────────────────────
    {
      type: 'js',
      id: 'reflection-demo',
      html: `<canvas id="c-ref" width="480" height="320" style="width:480px;height:320px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>IOR: <input id="ior" type="range" min="100" max="250" value="150" style="width:120px"> <span id="ior-v">1.50</span> (glass)</label>
  <label>Mix: <input id="rmix" type="range" min="0" max="100" value="80" style="width:100px"> <span id="rmix-v">0.80</span> reflect</label>
</div>`,
      startCode: `const c=document.getElementById('c-ref');
const gl=c.getContext('webgl');
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform float uIOR,uMix;
void main(){
  // Procedural environment: gradient sky + gradient ground + sun
  vec2 uv=vUV*2.-1.;
  float r2=dot(uv,uv);

  // Sky background
  float skyGrad=max(0.,vUV.y);
  vec3 skyCol=mix(vec3(.8,.85,.95),vec3(.2,.4,.8),skyGrad);
  // Sun
  vec2 sunPos=vec2(.6,.75);
  float sunD=length(vUV-sunPos);
  skyCol+=vec3(1.,.9,.5)*max(0.,1.-sunD*8.);
  // Ground
  vec3 groundCol=mix(vec3(.3,.5,.2),vec3(.6,.7,.4),vUV.y*2.);

  if(r2>1.){
    // Outside sphere: environment
    gl_FragColor=vec4(vUV.y>0.5?skyCol:groundCol,1);
    return;
  }

  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 I=normalize(vec3(0,0,-1)); // view direction
  // Reflection
  vec3 R=reflect(I,N);
  // Sample procedural env in reflection direction
  vec3 reflCol=R.y>0.?
    mix(vec3(.8,.85,.95),vec3(.2,.4,.8),R.y*.5+.5):
    mix(vec3(.3,.5,.2),vec3(.6,.7,.4),R.y*.5+.5);
  // Add sun in reflection
  vec2 rSun=R.xy/max(.001,1.+R.z);
  reflCol+=vec3(1.,.9,.5)*max(0.,1.-length(rSun-vec2(.3,.4))*6.);

  // Refraction
  float eta=1./uIOR;
  vec3 T=refract(I,N,eta);
  vec3 refrCol=T.y>0.?
    mix(vec3(.8,.85,.95),vec3(.2,.4,.8),T.y*.5+.5):
    mix(vec3(.3,.5,.2),vec3(.6,.7,.4),T.y*.5+.5);

  // Fresnel
  float cosTheta=max(0.,dot(-I,N));
  float F0=.04;
  float fres=F0+(1.-F0)*pow(1.-cosTheta,5.);
  float mix_=uMix*(1.-fres)+fres;

  vec3 col=mix(refrCol,reflCol,mix_);
  // slight blue tint for glass
  col*=vec3(.85,.9,1.);
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
const uIOR=gl.getUniformLocation(prog,'uIOR');
const uMix=gl.getUniformLocation(prog,'uMix');
const iorEl=document.getElementById('ior');
const mixEl=document.getElementById('rmix');
function draw(){
  const ior=iorEl.value/100,mix=mixEl.value/100;
  document.getElementById('ior-v').textContent=ior.toFixed(2);
  document.getElementById('rmix-v').textContent=mix.toFixed(2);
  gl.uniform1f(uIOR,ior);gl.uniform1f(uMix,mix);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
iorEl.addEventListener('input',draw);
mixEl.addEventListener('input',draw);
draw();`,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-skybox-depth',
      instruction: 'A skybox vertex shader sets gl_Position = pos.xyww instead of pos.xyzw. Why?',
      options: [
        { label: 'A', text: 'xyww moves the skybox to the origin to prevent camera-relative positioning errors' },
        { label: 'B', text: 'After perspective divide, z/w = w/w = 1.0, forcing the skybox to depth 1.0 so it always renders behind everything' },
        { label: 'C', text: 'xyww discards the w component, disabling perspective division for orthographic skybox rendering' },
        { label: 'D', text: 'This is a Three.js convention — xyww enables the skybox culling optimization' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-cubemap-sample',
      instruction: 'You sample a cubemap with direction vec3(0.7, 0.0, 0.7). Which face is selected?',
      options: [
        { label: 'A', text: '+Y face — Y is the up component in most cubemap layouts' },
        { label: 'B', text: '+Z face — Z is larger than Y, and approximately equal to X' },
        { label: 'C', text: '+X or +Z face (both equal magnitude) — the GPU picks one arbitrarily at this edge' },
        { label: 'D', text: 'The result is undefined — cubemaps don\'t support diagonal direction vectors' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-refraction',
      instruction: 'In refract(I, N, eta), what is eta for a ray passing from glass (IOR 1.5) into air (IOR 1.0)?',
      options: [
        { label: 'A', text: '1.5 — always the IOR of the material the light is entering' },
        { label: 'B', text: '1.0 — always the IOR of air, since one medium is always air' },
        { label: 'C', text: '1.0 / 1.5 = 0.667 — the ratio n_incident / n_transmitted (entering → exiting)' },
        { label: 'D', text: '1.5 / 1.0 = 1.5 — the ratio n_transmitted / n_incident' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Schlick Fresnel for env mapping ───────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Fresnel-Blended Environment Map

Use Schlick Fresnel to blend a flat albedo with a fake environment colour based on viewing angle.

\`fresnel = pow(1.0 - dot(N, V), 5.0)\`

**Requirements:**
1. Compute \`float cosTheta = max(0.0, dot(N, V))\`
2. Compute \`float fresnel = pow(1.0 - cosTheta, 5.0)\`
3. Output \`mix(albedo, envCol, fresnel)\` — blend from albedo at centre to env at rim

Result: sphere edge reflects the sky colour; centre shows the surface colour.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
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
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 albedo=vec3(.05,.1,.5);
  vec3 envCol=vec3(.8,.9,1.);  // sky colour
  // TODO 1: float cosTheta = max(0.0, dot(N, V))
  // TODO 2: float fresnel  = pow(1.0 - cosTheta, 5.0)
  // TODO 3: gl_FragColor   = vec4(mix(albedo, envCol, fresnel), 1.0)
  gl_FragColor=vec4(albedo,1.); // placeholder
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
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 albedo=vec3(.05,.1,.5);
  vec3 envCol=vec3(.8,.9,1.);
  float cosTheta=max(0.,dot(N,V));
  float fresnel=pow(1.-cosTheta,5.);
  gl_FragColor=vec4(mix(albedo,envCol,fresnel),1.);
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
      check: (code) => /dot\(N,\s*V\)/.test(code) && /pow\(1\.\s*-\s*cosTheta/.test(code) && /mix\(albedo/.test(code),
    },
  ],
}

export default {
  id: 'three-js-4-4-cubemaps',
  slug: 'cubemaps-and-skyboxes',
  chapter: 'three-js.4',
  order: 4,
  title: 'Cubemaps & Skyboxes',
  subtitle: 'The six-faced texture that captures the entire environment for reflections and IBL.',
  tags: ['three-js', 'cubemap', 'skybox', 'environment-map', 'reflections', 'ibl'],
  hook: {
    question: 'A mirror ball placed in a room should reflect the entire room. Six textures capture that room from all directions. One lookup direction returns one texel. How?',
    realWorldContext: 'Cubemap environment maps power the reflections in every photorealistic 3D renderer — from game engines to product visualisation tools. IBL from HDR cubemaps is the dominant real-time lighting paradigm.',
  },
  intuition: {
    prose: 'Cubemap: 6 faces, sample with a direction vec3. Skybox trick: gl_Position=pos.xyww → depth=1.0. Reflection: reflect(I,N). Refraction: refract(I,N,eta). scene.background=envMap in Three.js.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Cubemaps & Skyboxes', props: { lesson: LESSON_3JS_4_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['textureCube(sampler, dir). Skybox: pos.xyww → depth=1. Reflection: reflect(I,N). Refraction: refract(I,N, n1/n2). scene.environment = CubeTextureLoader result.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Skybox: pos.xyww → depth=1." Why set the W component to W (not 1) for the skybox?',
      options: [
        'It makes the skybox infinitely large',
        'After the perspective divide, z/w = w/w = 1.0 — the maximum depth. This ensures the skybox always renders behind everything else without writing a depth value that blocks real geometry',
        'It disables depth testing for the skybox faces',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Reflection: reflect(I, N)." A view ray hits a mirror surface. reflect(I, N) returns the outgoing direction. What does this direction represent?',
      options: [
        'The direction toward the light source',
        'The direction the reflected ray travels after bouncing off the surface — used to sample the cubemap to look up what the mirror sees in that direction',
        'The normal at the hit point',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Refraction: refract(I, N, n1/n2)." n1=1.0 (air), n2=1.5 (glass). What does n1/n2 ≈ 0.667 control?',
      options: [
        'The opacity of the glass material',
        'The ratio of the refractive indices — this determines how much the ray bends as it crosses the material boundary (Snell\'s Law)',
        'The thickness of the glass surface',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"scene.environment = CubeTextureLoader result." Setting the scene environment affects which material type most significantly?',
      options: [
        'MeshBasicMaterial — it ignores lighting so environment maps are its main source',
        'MeshStandardMaterial (PBR) — it uses the environment map as an image-based light source for ambient reflections and diffuse illumination',
        'MeshPhongMaterial — it uses the environment map for shadow calculations',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_4_4 }
