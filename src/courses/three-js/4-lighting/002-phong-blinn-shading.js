// Three.js · Chapter 3 · Lesson 1
// Phong & Blinn-Phong Shading

const LESSON_3JS_3_1 = {
  title: 'Phong & Blinn-Phong Shading',
  subtitle: 'The half-vector fix that replaced Phong in every real-time renderer by 1990.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The seam that broke Phong

Phong shading has a flaw. At **grazing angles** — when the viewer is nearly perpendicular to the surface — the reflected vector **R** swings behind the surface. The \`max(0, R·V)\` term clamps to zero, producing a sharp seam where the specular highlight abruptly cuts off.

**Blinn-Phong** fixes this with a single substitution: replace R·V with **N·H**, where H is the **half-vector** halfway between L and V. H never swings behind the surface, so no seam appears. The math is also cheaper (no reflect() call), and the result is more physically plausible at grazing angles.

By 1990, every hardware renderer had adopted Blinn-Phong over the original Phong specular.`,
    },

    // ── 1. The half-vector ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Half-Vector H

\`\`\`glsl
vec3 H = normalize(L + V);   // halfway between light and view directions
\`\`\`

Intuition: H points in the direction a **perfect mirror** surface would need to face to reflect L toward V. When N ≈ H, the surface is close to that mirror orientation — strong specular.

**Phong specular:**
\`\`\`glsl
vec3 R = reflect(-L, N);
float spec = pow(max(0.0, dot(R, V)), shininess);
\`\`\`

**Blinn-Phong specular:**
\`\`\`glsl
vec3 H = normalize(L + V);
float spec = pow(max(0.0, dot(N, H)), shininess);
\`\`\`

The difference is subtle for most angles. At grazing angles (viewer near the horizon of the surface), Blinn-Phong produces a smooth falloff while Phong produces a sharp cutoff.

> **Note:** Blinn-Phong needs a ~4× higher shininess value to produce the same highlight *width* as Phong, because N·H spans a smaller angular range than R·V.`,
    },

    // ── 2. Side-by-side comparison demo ──────────────────────────────────
    {
      type: 'js',
      id: 'phong-vs-blinn',
      html: `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
  <div>
    <canvas id="c-phong" width="220" height="220" style="border-radius:8px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:13px;color:#f87;margin:6px 0">Phong (R·V)</p>
  </div>
  <div>
    <canvas id="c-blinn" width="220" height="220" style="border-radius:8px;background:#111;display:block"></canvas>
    <p style="text-align:center;font-family:monospace;font-size:13px;color:#7bf;margin:6px 0">Blinn-Phong (N·H)</p>
  </div>
</div>
<div style="display:flex;gap:24px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Shininess: <input id="sh" type="range" min="1" max="128" value="32" style="width:120px"> <span id="sh-v">32</span></label>
  <label>Grazing: <input id="gz" type="range" min="0" max="100" value="0" style="width:120px"> <span id="gz-v">0°</span></label>
</div>`,
      startCode: `function makeSphere(id, useBlinn){
  const c=document.getElementById(id);
  const gl=c.getContext('webgl');
  const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
  const fs=\`precision mediump float;
varying vec2 vUV;
uniform float uSh, uGraze;
uniform bool uBlinn;
void main(){
  vec2 uv=vUV*2.-1.;
  float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.05,.05,.07,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fPos=vec3(uv,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.2,1.5,2.)-fPos);
  // grazing: move camera toward horizon
  float g=uGraze;
  vec3 V=normalize(vec3(g*2.,0.,3.-g*2.5)-fPos);
  vec3 R=reflect(-L,N);
  vec3 albedo=vec3(.8,.3,.1);
  vec3 lCol=vec3(1.,.95,.85);
  vec3 amb=.15*vec3(.6,.7,.9);
  vec3 dif=.75*lCol*max(0.,dot(N,L));
  float specTerm;
  if(uBlinn){
    vec3 H=normalize(L+V);
    specTerm=pow(max(0.,dot(N,H)),uSh);
  } else {
    specTerm=pow(max(0.,dot(R,V)),uSh);
  }
  vec3 spec=.8*lCol*specTerm;
  gl_FragColor=vec4((amb+dif)*albedo+spec,1);
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
  const uSh=gl.getUniformLocation(prog,'uSh');
  const uGz=gl.getUniformLocation(prog,'uGraze');
  const uBl=gl.getUniformLocation(prog,'uBlinn');
  gl.uniform1i(uBl, useBlinn ? 1 : 0);
  return {gl,prog,uSh,uGz};
}
const p=makeSphere('c-phong',false);
const b=makeSphere('c-blinn',true);
const shEl=document.getElementById('sh');
const gzEl=document.getElementById('gz');
function draw(){
  const s=parseFloat(shEl.value), g=gzEl.value/100;
  document.getElementById('sh-v').textContent=s;
  document.getElementById('gz-v').textContent=Math.round(g*80)+'°';
  [p,b].forEach(({gl,uSh,uGz})=>{
    gl.uniform1f(uSh,s);
    gl.uniform1f(uGz,g);
    gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  });
}
shEl.addEventListener('input',draw);
gzEl.addEventListener('input',draw);
draw();`,
    },

    // ── 3. Multiple lights ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Multiple Lights — Superposition

Phong/Blinn-Phong is **linear**: multiple light contributions simply add together.

\`\`\`glsl
vec3 totalLight = ambient;   // ambient only once

for each light i:
  vec3 Li = normalize(lightPos[i] - fragPos);
  vec3 Hi = normalize(Li + V);

  totalLight += Kd * lightColor[i] * max(0.0, dot(N, Li));         // diffuse
  totalLight += Ks * lightColor[i] * pow(max(0.0, dot(N, Hi)), shininess); // specular

gl_FragColor = vec4(totalLight * albedo, 1.0);
\`\`\`

**Cost scales linearly with light count.** 10 lights = 10× the shader instructions. This is why forward rendering struggles with many dynamic lights — and why deferred rendering was invented (Chapter 5).`,
    },

    // ── 4. Multiple lights demo ───────────────────────────────────────────
    {
      type: 'js',
      id: 'multi-lights',
      html: `<canvas id="c-ml" width="480" height="320" style="width:480px;height:320px;border-radius:8px;background:#111;display:block;margin:auto"></canvas>
<p style="text-align:center;font-family:monospace;font-size:12px;color:#aaa;margin:8px 0">Click canvas to add lights (max 6) · Double-click to clear</p>`,
      startCode: `const c=document.getElementById('c-ml');
const gl=c.getContext('webgl');
const W=480,H=320;
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`
precision mediump float;
varying vec2 vUV;
uniform int uNLights;
uniform vec3 uLights[6];
uniform vec3 uLColors[6];
void main(){
  vec2 ar=vec2(float(480)/float(320),1.);
  vec2 uv=(vUV*2.-1.)*ar;
  float r2=dot(uv,uv);
  if(r2>ar.x*ar.x){gl_FragColor=vec4(.03,.03,.05,1);return;}
  // sphere at center radius 1
  if(r2>1.){gl_FragColor=vec4(.06,.06,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fPos=vec3(uv,sqrt(1.-r2));
  vec3 V=normalize(vec3(0,0,3)-fPos);
  vec3 albedo=vec3(.7,.7,.75);
  vec3 total=.08*vec3(.4,.5,.8);
  for(int i=0;i<6;i++){
    if(i>=uNLights) break;
    vec3 L=normalize(uLights[i]-fPos);
    vec3 H=normalize(L+V);
    float diff=max(0.,dot(N,L));
    float spec=pow(max(0.,dot(N,H)),64.);
    total+=uLColors[i]*(diff*.7+spec*.5);
  }
  gl_FragColor=vec4(total*albedo,1);
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
const uNL=gl.getUniformLocation(prog,'uNLights');
const uLL=gl.getUniformLocation(prog,'uLights[0]');
const uLC=gl.getUniformLocation(prog,'uLColors[0]');
const colors=[[1,.2,.2],[.2,.6,1],[.2,1,.4],[1,.8,.2],[1,.4,.8],[.4,.8,1]];
let lights=[[1.2,1.5,2.0]];
let lCols=[colors[0]];
function draw(){
  const flat=new Float32Array(18);
  const cFlat=new Float32Array(18);
  lights.forEach((l,i)=>{flat[i*3]=l[0];flat[i*3+1]=l[1];flat[i*3+2]=l[2];});
  lCols.forEach((c,i)=>{cFlat[i*3]=c[0];cFlat[i*3+1]=c[1];cFlat[i*3+2]=c[2];});
  gl.uniform1i(uNL,lights.length);
  for(let i=0;i<6;i++){
    const b=gl.getUniformLocation(prog,\`uLights[\${i}]\`);
    const bc=gl.getUniformLocation(prog,\`uLColors[\${i}]\`);
    gl.uniform3f(b,flat[i*3]||0,flat[i*3+1]||0,flat[i*3+2]||0);
    gl.uniform3f(bc,cFlat[i*3]||0,cFlat[i*3+1]||0,cFlat[i*3+2]||0);
  }
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
c.addEventListener('click',e=>{
  if(lights.length>=6) return;
  const rect=c.getBoundingClientRect();
  const x=((e.clientX-rect.left)/rect.width*2-1)*(W/H);
  const y=-(e.clientY-rect.top)/rect.height*2+1;
  lights.push([x,y,1.5]);
  lCols.push(colors[lights.length-1]);
  draw();
});
c.addEventListener('dblclick',()=>{lights=[[1.2,1.5,2.0]];lCols=[colors[0]];draw();});
draw();`,
    },

    // ── 5. Per-vertex vs per-fragment ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Gouraud vs Phong Shading

Confusingly, "Phong shading" means two things:
1. **The lighting model** (ambient + diffuse + specular) — the equation above
2. **Per-fragment interpolation** — evaluating the lighting in the *fragment* shader

**Gouraud shading** evaluates lighting per-**vertex**, then interpolates the colour across the triangle. Cheap, but specular highlights get washed out or missed entirely — the highlight can fall between vertices.

**Phong shading** (per-fragment) interpolates the *normal*, then evaluates lighting per-fragment. Much better highlights. The standard approach since the mid-1990s.

\`\`\`glsl
// Gouraud: compute lighting in VERTEX shader, pass colour as varying
// Phong:   pass vNormal as varying, compute lighting in FRAGMENT shader
\`\`\`

> Modern GPUs are fragment-bound anyway — the extra per-fragment math of Phong shading is rarely the bottleneck.`,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-half-vector',
      instruction: 'Why does Blinn-Phong use H = normalize(L + V) instead of the reflection vector R = reflect(-L, N)?',
      options: [
        { label: 'A', text: 'H is faster to compute than R, and the visual result is identical in all cases' },
        { label: 'B', text: 'H avoids the sharp cutoff that occurs when R passes behind the surface at grazing angles, and is more physically motivated' },
        { label: 'C', text: 'H produces wider highlights than R, which is more visually appealing for diffuse surfaces' },
        { label: 'D', text: 'Blinn-Phong requires H to avoid a GLSL driver bug in the reflect() function on older GPUs' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-multi-cost',
      instruction: 'A forward-rendered scene has 1 directional light. You add 3 more point lights. How does the fragment shader cost change?',
      options: [
        { label: 'A', text: 'Stays the same — lights are composited on a separate pass in forward rendering' },
        { label: 'B', text: 'Doubles — each pair of lights shares one shader pass' },
        { label: 'C', text: 'Increases by ~3× — each additional light adds roughly one more set of L/H/dot calculations' },
        { label: 'D', text: 'The GPU handles all lights in parallel so cost does not change with light count' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-gouraud-flaw',
      instruction: 'A triangle has its specular highlight peak exactly at its centre. You render it with Gouraud shading (per-vertex lighting). What will the centre look like?',
      options: [
        { label: 'A', text: 'Bright — the highlight is correctly computed at the three vertices and interpolated to the centre' },
        { label: 'B', text: 'Dim or dark — the highlight is evaluated at the vertices (which are far from the highlight peak) and the bright centre value is never computed' },
        { label: 'C', text: 'Identical to Phong shading — the GPU automatically upgrades Gouraud to per-fragment at the centre' },
        { label: 'D', text: 'The triangle is not rendered — Gouraud shading cannot handle specular highlights' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Half-vector ───────────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Compute the Blinn-Phong Half-Vector

The right sphere is missing its specular highlight because \`H\` and the specular term are not filled in.

**Requirements:**
1. \`vec3 H = normalize(L + V)\` — halfway between light and view
2. \`spec = pow(max(0.0, dot(N, H)), 64.0)\`

When correct, both spheres show a specular highlight. The right (Blinn-Phong) one is smoother at grazing angles.`,
      html: `<canvas id="c" width="440" height="260" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs = \\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs = \\\`precision mediump float;
varying vec2 v;
void main(){
  vec2 uv=v*2.-1.; uv.x*=1.7;
  float side=sign(uv.x);
  vec2 loc=vec2(uv.x-side*.85,uv.y);
  float r2=dot(loc,loc);
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(loc,sqrt(1.-r2)));
  vec3 fP=vec3(loc,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.2,1.5,2.)-fP);
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 lCol=vec3(1.,.92,.8);
  float spec;
  if(side<0.){
    vec3 R=reflect(-L,N);
    spec=pow(max(0.,dot(R,V)),64.);
  } else {
    // TODO 1: vec3 H = normalize(L + V)
    // TODO 2: spec = pow(max(0.0, dot(N, H)), 64.0)
    spec = 0.0; // placeholder
  }
  vec3 col=(0.15*lCol+lCol*max(0.,dot(N,L)))*vec3(.2,.5,.9)+.7*lCol*spec;
  gl_FragColor=vec4(col,1.);
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
  vec2 uv=v*2.-1.; uv.x*=1.7;
  float side=sign(uv.x);
  vec2 loc=vec2(uv.x-side*.85,uv.y);
  float r2=dot(loc,loc);
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(loc,sqrt(1.-r2)));
  vec3 fP=vec3(loc,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.2,1.5,2.)-fP);
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 lCol=vec3(1.,.92,.8);
  float spec;
  if(side<0.){
    vec3 R=reflect(-L,N);
    spec=pow(max(0.,dot(R,V)),64.);
  } else {
    vec3 H=normalize(L+V);
    spec=pow(max(0.,dot(N,H)),64.);
  }
  vec3 col=(0.15*lCol+lCol*max(0.,dot(N,L)))*vec3(.2,.5,.9)+.7*lCol*spec;
  gl_FragColor=vec4(col,1.);
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
      check: (code) => /H\s*=\s*normalize\(L\s*\+\s*V\)/.test(code) && /dot\(N,\s*H\)/.test(code),
    },
  ],
}

export default {
  id: 'three-js-3-1-phong-blinn',
  slug: 'phong-blinn-shading',
  chapter: 'three-js.3',
  order: 1,
  title: 'Phong & Blinn-Phong Shading',
  subtitle: 'The half-vector fix that replaced Phong in every real-time renderer by 1990.',
  tags: ['three-js', 'phong', 'blinn-phong', 'glsl', 'half-vector'],
  hook: {
    question: 'Phong and Blinn-Phong produce nearly identical results — except at extreme grazing angles where Phong shows a visible seam. Which uses the half-vector and why is it correct?',
    realWorldContext: 'Blinn-Phong replaced Phong in virtually every real-time renderer by 1990. The half-vector approach is more numerically stable and more physically plausible at grazing angles.',
  },
  intuition: {
    prose: 'Replace R·V with N·H (half-vector). H = normalize(L+V) never crosses the surface horizon, eliminating the Phong seam. Multiple lights sum linearly. Always compute lighting per-fragment.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Phong & Blinn-Phong Shading', props: { lesson: LESSON_3JS_3_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['H = normalize(L+V). Blinn-Phong = pow(max(0,dot(N,H)), shininess). No grazing seam. Multiple lights add linearly.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"H = normalize(L+V). Blinn-Phong = pow(max(0, dot(N,H)), shininess)." What is the half-vector H representing physically?',
      options: [
        'The midpoint between the light source and the camera positions in world space',
        'The direction halfway between the light direction and the view direction — a surface whose normal equals H reflects light directly toward the viewer',
        'The average of the surface normal and the light direction',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"No grazing seam." Blinn-Phong fixes a visual artifact that Phong has at grazing angles. What is that artifact?',
      options: [
        'Blinn-Phong prevents z-fighting on reflective surfaces',
        'In Phong, the reflection vector can swing past the 90° horizon, making the specular highlight cut off sharply at the silhouette edge. Blinn-Phong\'s half-vector avoids this cutoff',
        'Phong produces incorrect colours at low shininess values',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Multiple lights add linearly." If two point lights each contribute a diffuse colour of (0.4, 0.2, 0.1), what is the combined diffuse output?',
      options: [
        '(0.4, 0.2, 0.1) — only the stronger light is used',
        '(0.8, 0.4, 0.2) — each light\'s contribution is added independently, then summed',
        '(0.2, 0.1, 0.05) — contributions are averaged',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'When would you prefer Phong shading over Blinn-Phong?',
      options: [
        'When performance is critical — Phong is cheaper to compute',
        'When you need physical accuracy — Phong is the physically correct model',
        'Rarely — Blinn-Phong is generally preferred for its better behaviour at grazing angles and equivalent or better performance',
      ],
      correct: 2,
    },
  ],
}

export { LESSON_3JS_3_1 }
