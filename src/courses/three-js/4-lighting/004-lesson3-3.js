// Three.js · Chapter 3 · Lesson 3
// Directional, Point & Spot Lights

const LESSON_3JS_3_3 = {
  title: 'Directional, Point & Spot Lights',
  subtitle: 'The geometry, attenuation, and GLSL of the three real-time light archetypes.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three lights, three geometric models

Three archetypal light sources underlie virtually every real-time lighting setup:

| Light | Model | L direction | Attenuation |
|-------|-------|------------|-------------|
| **Directional** | Infinite plane source (the sun) | Constant, no position | None — equally intense everywhere |
| **Point** | Omnidirectional point source (a bulb) | From position to fragment | 1/(a + b·d + c·d²) |
| **Spot** | Cone-restricted point source (a torch) | From position, within cone | Point attenuation + angular falloff |

Each requires a different calculation for the light direction **L** in your fragment shader.`,
    },

    // ── 1. Directional light ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Directional Light — The Sun

A directional light has **no position** — only a direction. All fragments receive light from the same angle. This models sources at infinite distance (sun, moon).

\`\`\`glsl
// Directional light
uniform vec3 uLightDir;          // direction the light travels (toward -Y = down)

vec3 L = normalize(-uLightDir);  // negate: L points TOWARD the light source
float diff = max(0.0, dot(N, L));
\`\`\`

**No attenuation** — a directional light is equally intense at any distance. This is why the sun doesn't get dimmer as you travel toward or away from it.

In Three.js:
\`\`\`javascript
const sun = new THREE.DirectionalLight(0xffffff, 1.0)
sun.position.set(5, 10, 3)   // acts as direction, not position
scene.add(sun)
\`\`\``,
    },

    // ── 2. Point light ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Point Light — The Bulb

A point light emits light in all directions from a single position. **L** depends on the fragment's position, so it changes per-pixel.

\`\`\`glsl
uniform vec3 uPointLightPos;

vec3 L = normalize(uPointLightPos - vFragPos);   // toward light
float dist = length(uPointLightPos - vFragPos);
\`\`\`

### Attenuation

Real light follows the **inverse square law**: intensity falls as 1/d². In practice we use a parameterised polynomial:

\`\`\`glsl
uniform float uConstant;    // usually 1.0
uniform float uLinear;      // e.g. 0.09
uniform float uQuadratic;   // e.g. 0.032

float attenuation = 1.0 / (uConstant + uLinear * dist + uQuadratic * dist * dist);
\`\`\`

| Range  | Constant | Linear | Quadratic |
|--------|----------|--------|-----------|
| 7      | 1.0      | 0.70   | 1.8       |
| 20     | 1.0      | 0.22   | 0.20      |
| 50     | 1.0      | 0.09   | 0.032     |
| 200    | 1.0      | 0.022  | 0.0019    |

(Ogre3D attenuation table — widely used reference values)`,
    },

    // ── 3. Point light demo ───────────────────────────────────────────────
    {
      type: 'js',
      id: 'point-light-demo',
      html: `<canvas id="c-pt" width="480" height="320" style="width:480px;height:320px;border-radius:8px;background:#111;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px;flex-wrap:wrap">
  <label>Linear: <input id="lin" type="range" min="0" max="100" value="22" style="width:90px"> <span id="lin-v">0.22</span></label>
  <label>Quadratic: <input id="quad" type="range" min="0" max="100" value="20" style="width:90px"> <span id="quad-v">0.020</span></label>
</div>
<p style="text-align:center;font-family:monospace;font-size:12px;color:#666;margin:4px 0">Click canvas to move the point light</p>`,
      startCode: `const c=document.getElementById('c-pt');
const gl=c.getContext('webgl');
const W=480,H=320;
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform vec3 uLightPos;
uniform float uLin,uQuad;
uniform vec2 uRes;
void main(){
  // Layout: three spheres side by side
  vec2 uv=(vUV*2.-1.)*vec2(uRes.x/uRes.y,1.);
  vec3 bgCol=vec3(.04,.04,.06);
  vec3 col=bgCol;
  vec3 sphereCenters[3];
  sphereCenters[0]=vec3(-1.2,0.,0.);
  sphereCenters[1]=vec3(0.,0.,0.);
  sphereCenters[2]=vec3(1.2,0.,0.);
  for(int i=0;i<3;i++){
    vec2 d=uv-sphereCenters[i].xy;
    float r2=dot(d,d);
    if(r2<.25){ // radius 0.5
      vec3 N=normalize(vec3(d,sqrt(.25-r2)));
      vec3 fPos=sphereCenters[i]+vec3(0,0,.5)*N;
      vec3 L=normalize(uLightPos-fPos);
      float dist=length(uLightPos-fPos);
      float att=1./(1.+uLin*dist+uQuad*dist*dist);
      vec3 V=normalize(vec3(0,0,3)-fPos);
      vec3 H=normalize(L+V);
      vec3 albedo=i==0?vec3(.8,.2,.2):i==1?vec3(.2,.7,.3):vec3(.2,.4,.9);
      vec3 lCol=vec3(1.,.9,.75);
      vec3 amb=.12*vec3(.4,.5,.7);
      float diff=max(0.,dot(N,L));
      float spec=pow(max(0.,dot(N,H)),48.);
      col=(amb+.8*lCol*diff)*albedo+.6*lCol*spec;
      col*=att;
      break;
    }
  }
  // draw light indicator
  vec2 lxy=uLightPos.xy;
  float ld=length(uv-lxy);
  if(ld<.05) col=mix(col,vec3(1.,.9,.5),1.-ld/.05);
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
const uLP=gl.getUniformLocation(prog,'uLightPos');
const uLin=gl.getUniformLocation(prog,'uLin');
const uQ=gl.getUniformLocation(prog,'uQuad');
const uRes=gl.getUniformLocation(prog,'uRes');
gl.uniform2f(uRes,W,H);
let lx=0,ly=0.5;
const linEl=document.getElementById('lin');
const quadEl=document.getElementById('quad');
function draw(){
  const l=linEl.value/100,q=quadEl.value/1000;
  document.getElementById('lin-v').textContent=l.toFixed(2);
  document.getElementById('quad-v').textContent=q.toFixed(3);
  gl.uniform3f(uLP,lx*(W/H),ly,1.5);
  gl.uniform1f(uLin,l);gl.uniform1f(uQ,q);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
c.addEventListener('click',e=>{
  const rect=c.getBoundingClientRect();
  lx=(e.clientX-rect.left)/rect.width*2-1;
  ly=-((e.clientY-rect.top)/rect.height*2-1);
  draw();
});
linEl.addEventListener('input',draw);
quadEl.addEventListener('input',draw);
draw();`,
    },

    // ── 4. Spot light ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Spot Light — The Stage Light

A spot light is a point light with an **angular cone restriction**. Fragments outside the cone receive no light.

\`\`\`glsl
uniform vec3 uSpotPos;
uniform vec3 uSpotDir;          // direction the spotlight points (normalized)
uniform float uInnerCutoff;     // cos(inner angle) — full intensity inside
uniform float uOuterCutoff;     // cos(outer angle) — zero intensity outside

vec3 L = normalize(uSpotPos - vFragPos);
float theta = dot(L, normalize(-uSpotDir));  // cos of angle from spot direction

// Smooth soft edge between inner and outer cone
float epsilon = uInnerCutoff - uOuterCutoff;
float intensity = clamp((theta - uOuterCutoff) / epsilon, 0.0, 1.0);

// intensity = 1 inside inner cone, 0 outside outer cone, smooth in between
float attenuation = /* point attenuation */ * intensity;
\`\`\`

**Why cos?** The dot product gives \`cos(angle)\`. Larger cos = smaller angle = more inside the cone. We set cutoffs as cosines (e.g., \`cos(12.5°) ≈ 0.976\`) because \`theta > cutoff\` means "inside the cone".`,
    },

    // ── 5. Spotlight demo ─────────────────────────────────────────────────
    {
      type: 'js',
      id: 'spotlight-demo',
      html: `<canvas id="c-spot" width="480" height="320" style="width:480px;height:320px;border-radius:8px;background:#111;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Inner°: <input id="inn" type="range" min="2" max="40" value="12" style="width:100px"> <span id="inn-v">12°</span></label>
  <label>Outer°: <input id="out" type="range" min="5" max="60" value="20" style="width:100px"> <span id="out-v">20°</span></label>
</div>
<p style="text-align:center;font-family:monospace;font-size:12px;color:#666;margin:4px 0">Click to move spotlight aim point</p>`,
      startCode: `const c=document.getElementById('c-spot');
const gl=c.getContext('webgl');
const W=480,H=320;
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform vec3 uSpotPos,uSpotDir;
uniform float uInner,uOuter;
uniform vec2 uRes;
void main(){
  vec2 uv=(vUV*2.-1.)*vec2(uRes.x/uRes.y,1.);
  vec2 d=uv;
  float r2=dot(d,d);
  if(r2>1.){gl_FragColor=vec4(.03,.03,.04,1);return;}
  vec3 N=normalize(vec3(d,sqrt(1.-r2)));
  vec3 fPos=N;
  vec3 L=normalize(uSpotPos-fPos);
  float dist=length(uSpotPos-fPos);
  float att=1./(1.+0.09*dist+0.032*dist*dist);
  float theta=dot(L,normalize(-uSpotDir));
  float eps=uInner-uOuter;
  float intensity=clamp((theta-uOuter)/eps,0.,1.);
  vec3 V=normalize(vec3(0,0,3)-fPos);
  vec3 H=normalize(L+V);
  vec3 albedo=vec3(.7,.72,.75);
  vec3 lCol=vec3(1.,.9,.75)*intensity*att;
  vec3 amb=.08*vec3(.3,.4,.6);
  float diff=max(0.,dot(N,L));
  float spec=pow(max(0.,dot(N,H)),96.);
  gl_FragColor=vec4(amb*albedo+lCol*(diff*.8*albedo+spec*.5),1);
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
const uSP=gl.getUniformLocation(prog,'uSpotPos');
const uSD=gl.getUniformLocation(prog,'uSpotDir');
const uIn=gl.getUniformLocation(prog,'uInner');
const uOut=gl.getUniformLocation(prog,'uOuter');
const uRes=gl.getUniformLocation(prog,'uRes');
gl.uniform2f(uRes,W,H);
const spotPos=[0,2,3];
let aimX=0,aimY=0;
const innEl=document.getElementById('inn');
const outEl=document.getElementById('out');
function draw(){
  const inner=parseFloat(innEl.value)*Math.PI/180;
  const outer=parseFloat(outEl.value)*Math.PI/180;
  document.getElementById('inn-v').textContent=innEl.value+'°';
  document.getElementById('out-v').textContent=outEl.value+'°';
  // spot direction = from spotPos toward aim point
  const dx=aimX-spotPos[0], dy=aimY-spotPos[1], dz=-spotPos[2];
  const dl=Math.sqrt(dx*dx+dy*dy+dz*dz);
  gl.uniform3f(uSP,...spotPos);
  gl.uniform3f(uSD,dx/dl,dy/dl,dz/dl);
  gl.uniform1f(uIn,Math.cos(inner));
  gl.uniform1f(uOut,Math.cos(outer));
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
c.addEventListener('click',e=>{
  const rect=c.getBoundingClientRect();
  aimX=(e.clientX-rect.left)/rect.width*2-1;
  aimY=-((e.clientY-rect.top)/rect.height*2-1);
  draw();
});
innEl.addEventListener('input',draw);
outEl.addEventListener('input',draw);
draw();`,
    },

    // ── 6. Three.js mapping ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js Light Objects

\`\`\`javascript
// Directional — like the sun
const dir = new THREE.DirectionalLight(0xffffff, 1.0)
dir.position.set(5, 10, 3)   // position defines direction from origin
scene.add(dir)

// Point — like a light bulb
const pt = new THREE.PointLight(0xff8844, 1.0, 50, 2)
// (colour, intensity, distance, decay)
// decay=2 → physically correct inverse square attenuation
pt.position.set(0, 2, 0)
scene.add(pt)

// Spot — like a stage light
const spot = new THREE.SpotLight(0xffffff, 1.0)
spot.position.set(0, 5, 0)
spot.target.position.set(0, 0, 0)  // aim point
spot.angle = Math.PI / 8           // half-angle of cone (22.5°)
spot.penumbra = 0.2                // soft edge fraction (0=hard, 1=soft)
spot.decay = 2
scene.add(spot)
scene.add(spot.target)
\`\`\``,
    },

    // ── 7. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-directional-attenuation',
      instruction: 'You place a directional light representing the sun in a scene. Moving the camera 100 units further from the objects should change the brightness how?',
      options: [
        { label: 'A', text: 'The scene gets dimmer — directional lights attenuate with camera distance like point lights' },
        { label: 'B', text: 'No change — directional lights have no position or distance attenuation' },
        { label: 'C', text: 'The scene gets brighter — directional light intensity increases with distance' },
        { label: 'D', text: 'Depends on the angle.penumbra setting of the light' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-spot-cutoff',
      instruction: 'A spotlight has innerCutoff = cos(15°) ≈ 0.966 and outerCutoff = cos(25°) ≈ 0.906. A fragment has theta = 0.93. What is its spotlight intensity?',
      options: [
        { label: 'A', text: '0.0 — theta < innerCutoff so it is outside the bright core' },
        { label: 'B', text: '1.0 — theta > outerCutoff so it receives full intensity' },
        { label: 'C', text: '~0.4 — theta falls in the penumbra zone and is partially lit by the smooth falloff' },
        { label: 'D', text: '-0.4 — negative clamped to 0' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 9. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-most-expensive',
      instruction: 'Which of the three light types requires the most GLSL instructions to compute the lighting contribution for a single fragment?',
      options: [
        { label: 'A', text: 'Directional — it needs the most vector normalizations' },
        { label: 'B', text: 'Point — because of the distance and attenuation polynomial calculation' },
        { label: 'C', text: 'Spot — it requires point attenuation PLUS angular cone calculations (dot product and clamp for penumbra)' },
        { label: 'D', text: 'All three require the same number of instructions' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Point light attenuation ────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Point Light — Inverse-Square Attenuation

Complete the point-light shader. Given \`lightPos\` and fragment position \`fP\`:

1. \`vec3 L = normalize(lightPos - fP)\`
2. \`float d = length(lightPos - fP)\`
3. \`float atten = 1.0 / (d * d)\`

The sphere should be brightest nearest the light and fall off with distance.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs = \\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs = \\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.03,.03,.06,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 lightPos=vec3(-0.8,1.2,2.0);
  // TODO 1: vec3 L = normalize(lightPos - fP)
  // TODO 2: float d = length(lightPos - fP)
  // TODO 3: float atten = 1.0 / (d * d)
  float NdL=max(0.,dot(N,L));
  vec3 albedo=vec3(.8,.5,.1);
  gl_FragColor=vec4(albedo*NdL*atten*3.+albedo*.05,1.);
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
      solutionCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs = \\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs = \\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.03,.03,.06,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 lightPos=vec3(-0.8,1.2,2.0);
  vec3 L=normalize(lightPos-fP);
  float d=length(lightPos-fP);
  float atten=1.0/(d*d);
  float NdL=max(0.,dot(N,L));
  vec3 albedo=vec3(.8,.5,.1);
  gl_FragColor=vec4(albedo*NdL*atten*3.+albedo*.05,1.);
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
      check: (code) => /normalize\(lightPos\s*-\s*fP\)/.test(code) && /length\(lightPos\s*-\s*fP\)/.test(code) && /1\.0\s*\/\s*\(d\s*\*\s*d\)/.test(code),
    },
  ],
}

export default {
  id: 'three-js-3-3-light-types',
  slug: 'directional-point-spot-lights',
  chapter: 'three-js.3',
  order: 3,
  title: 'Directional, Point & Spot Lights',
  subtitle: 'The geometry, attenuation, and GLSL of the three real-time light archetypes.',
  tags: ['three-js', 'directional-light', 'point-light', 'spot-light', 'attenuation'],
  hook: {
    question: 'A street lamp, the sun, and a stage spotlight. Three light sources. Three different geometric models. What property uniquely defines each one — and which requires the most GLSL instructions to compute?',
    realWorldContext: 'These three light types are the vocabulary of every 3D lighting setup — from game levels to film VFX. Mastering them means mastering real-time lighting.',
  },
  intuition: {
    prose: 'Directional: constant L direction, no attenuation. Point: L from position, inverse-square attenuation. Spot: point + angular cone clamp with smooth penumbra.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Directional, Point & Spot Lights', props: { lesson: LESSON_3JS_3_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Directional: L=-lightDir, no attenuation. Point: L=normalize(lightPos-fragPos), att=1/(a+b*d+c*d²). Spot: add theta=dot(L,-spotDir), intensity=clamp((theta-outer)/epsilon,0,1).'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_3_3 }
