// Three.js · Chapter 3 · Lesson 2
// Materials & Surface Properties

const LESSON_3JS_3_2 = {
  title: 'Materials & Surface Properties',
  subtitle: 'Ka, Kd, Ks, shininess — the four numbers that define any surface.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Four numbers, infinite surfaces

A shiny gold coin and a matte chalk sphere respond to the same light in radically different ways. The geometry is identical — a sphere. The shader is identical — Phong/Blinn-Phong. Only **four numbers** change:

| Surface | K_a | K_d | K_s | Shininess |
|---------|-----|-----|-----|-----------|
| Chalk   | 0.3 | 0.9 | 0.0 | 1         |
| Plastic | 0.1 | 0.6 | 0.4 | 32        |
| Painted metal | 0.05 | 0.5 | 0.7 | 128 |
| Gold mirror | 0.05 | 0.3 | 1.0 | 512 |
| Glowing lava | 0.8 | 0.6 | 0.1 | 4   |

Understanding the **physical meaning** of each coefficient lets you design any surface from first principles — not by trial and error.`,
    },

    // ── 1. K_a — Ambient coefficient ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## K_a — Ambient Reflectance

\`K_a\` controls how much indirect (ambient) light the surface reflects. It's roughly: **"how bright is the object in shadow?"**

- **K_a = 0.0** → pitch black in shadow (rare, unrealistic for most materials)
- **K_a = 0.1** → dark but visible — most non-glowing surfaces
- **K_a = 0.5** → half-lit in shadow — glowing/emissive materials
- **K_a = 1.0** → fully lit even in shadow — unphysical but useful for glow effects

**In Three.js:** \`MeshPhongMaterial({ ambient: 0x333333 })\` — but in modern Three.js (r73+) ambient is incorporated into the light's colour. Use \`scene.add(new THREE.AmbientLight(0x404040))\` to set scene-wide ambient.`,
    },

    // ── 2. K_d — Diffuse coefficient ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## K_d — Diffuse Reflectance

\`K_d\` controls how much directional light scatters off the surface. It represents the **colour** and **brightness** of the surface under light.

- High K_d → bright, visible surface (matte white paper: K_d ≈ 0.9)
- Low K_d → dark surface, little diffuse bounce (black cloth: K_d ≈ 0.05)
- K_d is typically a **vec3** (RGB) to encode the surface colour

\`\`\`glsl
vec3 albedo = vec3(0.8, 0.3, 0.1);     // orange-red surface
vec3 diffuse = uKd * lightColor * max(0.0, dot(N, L)) * albedo;
\`\`\`

**Physical constraint:** For energy conservation, \`K_d + K_s ≤ 1.0\`. Phong doesn't enforce this — you can have K_d=1 and K_s=1 — but the result looks unrealistically bright.`,
    },

    // ── 3. K_s and shininess ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## K_s & Shininess — The Specular Lobe

\`K_s\` is the peak brightness of the specular highlight. **Shininess** (also called the specular exponent \`n\`) controls the *width*:

\`\`\`glsl
float spec = pow(max(0.0, dot(N, H)), shininess);
vec3 specular = Ks * lightColor * spec;
\`\`\`

The specular lobe width is approximately \`90° / (shininess + 1)\` degrees at half-power. Every **doubling** of shininess roughly **halves** the highlight radius:

| Shininess | Typical surface        |
|-----------|----------------------|
| 1–4       | Chalk, rough clay    |
| 8–16      | Flat paint, skin     |
| 32–64     | Satin, semi-gloss    |
| 128–256   | Shiny plastic, lacquer |
| 512–2048  | Polished metal, glass |

**Note:** Specular colour ≠ albedo colour for metals. Gold reflects gold-coloured light (\`Ks = vec3(1.0, 0.85, 0.2)\`). In PBR this is called the **F0 tinted reflectance**.`,
    },

    // ── 4. Interactive material designer ─────────────────────────────────
    {
      type: 'js',
      id: 'material-designer',
      html: `<div style="display:flex;gap:20px;justify-content:center;align-items:flex-start;flex-wrap:wrap">
  <canvas id="c-mat" width="320" height="320" style="border-radius:10px;background:#111;flex-shrink:0"></canvas>
  <div style="font-family:monospace;color:#aaa;font-size:13px;min-width:220px">
    <div style="margin-bottom:12px;color:#fff;font-size:14px;font-weight:bold">Material Designer</div>
    <label style="display:block;margin:6px 0">K_a: <input id="mka" type="range" min="0" max="100" value="10" style="width:130px"> <span id="mka-v">0.10</span></label>
    <label style="display:block;margin:6px 0">K_d: <input id="mkd" type="range" min="0" max="100" value="75" style="width:130px"> <span id="mkd-v">0.75</span></label>
    <label style="display:block;margin:6px 0">K_s: <input id="mks" type="range" min="0" max="100" value="60" style="width:130px"> <span id="mks-v">0.60</span></label>
    <label style="display:block;margin:6px 0">Shininess: <input id="msh" type="range" min="1" max="512" value="64" style="width:130px"> <span id="msh-v">64</span></label>
    <label style="display:block;margin:6px 0">Albedo R: <input id="mr" type="range" min="0" max="100" value="80" style="width:130px"> <span id="mr-v">0.80</span></label>
    <label style="display:block;margin:6px 0">Albedo G: <input id="mg" type="range" min="0" max="100" value="60" style="width:130px"> <span id="mg-v">0.60</span></label>
    <label style="display:block;margin:6px 0">Albedo B: <input id="mb" type="range" min="0" max="100" value="10" style="width:130px"> <span id="mb-v">0.10</span></label>
    <hr style="border-color:#333;margin:10px 0">
    <div style="color:#777;font-size:12px">Presets:</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
      <button id="btn-chalk" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">Chalk</button>
      <button id="btn-plastic" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">Plastic</button>
      <button id="btn-metal" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">Metal</button>
      <button id="btn-gold" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">Gold</button>
      <button id="btn-lava" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">Lava</button>
    </div>
  </div>
</div>`,
      startCode: `const c=document.getElementById('c-mat');
const gl=c.getContext('webgl');
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform float uKa,uKd,uKs,uSh;
uniform vec3 uAlbedo;
void main(){
  vec2 uv=vUV*2.-1.;
  float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.05,.05,.07,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fPos=vec3(uv,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.5,2.,2.5)-fPos);
  vec3 V=normalize(vec3(0,0,3)-fPos);
  vec3 H=normalize(L+V);
  vec3 lCol=vec3(1.,.95,.85);
  vec3 amb=uKa*vec3(.5,.55,.7);
  vec3 dif=uKd*lCol*max(0.,dot(N,L));
  float spec=pow(max(0.,dot(N,H)),uSh);
  vec3 spe=uKs*lCol*spec;
  gl_FragColor=vec4((amb+dif)*uAlbedo+spe,1);
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
const locs={};
['uKa','uKd','uKs','uSh','uAlbedo'].forEach(n=>locs[n]=gl.getUniformLocation(prog,n));
const ids=['mka','mkd','mks','msh','mr','mg','mb'];
const els={}; ids.forEach(i=>els[i]=document.getElementById(i));
function setPreset(ka,kd,ks,sh,r,g,b){
  els.mka.value=Math.round(ka*100); els.mkd.value=Math.round(kd*100);
  els.mks.value=Math.round(ks*100); els.msh.value=sh;
  els.mr.value=Math.round(r*100); els.mg.value=Math.round(g*100); els.mb.value=Math.round(b*100);
  draw();
}
document.getElementById('btn-chalk').onclick=()=>setPreset(.25,.9,.0,1,.95,.95,.93);
document.getElementById('btn-plastic').onclick=()=>setPreset(.1,.6,.4,32,.8,.2,.1);
document.getElementById('btn-metal').onclick=()=>setPreset(.05,.4,.9,256,.75,.75,.78);
document.getElementById('btn-gold').onclick=()=>setPreset(.05,.3,1.,512,1.,.85,.2);
document.getElementById('btn-lava').onclick=()=>setPreset(.8,.7,.05,4,.95,.3,.05);
function draw(){
  const ka=els.mka.value/100,kd=els.mkd.value/100,ks=els.mks.value/100;
  const sh=parseFloat(els.msh.value);
  const r=els.mr.value/100,g=els.mg.value/100,b=els.mb.value/100;
  document.getElementById('mka-v').textContent=ka.toFixed(2);
  document.getElementById('mkd-v').textContent=kd.toFixed(2);
  document.getElementById('mks-v').textContent=ks.toFixed(2);
  document.getElementById('msh-v').textContent=sh;
  document.getElementById('mr-v').textContent=r.toFixed(2);
  document.getElementById('mg-v').textContent=g.toFixed(2);
  document.getElementById('mb-v').textContent=b.toFixed(2);
  gl.uniform1f(locs.uKa,ka);gl.uniform1f(locs.uKd,kd);
  gl.uniform1f(locs.uKs,ks);gl.uniform1f(locs.uSh,sh);
  gl.uniform3f(locs.uAlbedo,r,g,b);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
ids.forEach(i=>els[i].addEventListener('input',draw));
draw();`,
    },

    // ── 5. Three.js material mapping ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js Material Reference

\`MeshPhongMaterial\` exposes Phong properties directly:

\`\`\`javascript
const material = new THREE.MeshPhongMaterial({
  color:     0xcc4411,   // albedo (K_d × surface colour)
  specular:  0xffffff,   // K_s colour (white = neutral specular)
  shininess: 64,          // specular exponent
  emissive:  0x220000,   // self-illumination (like K_a but adds on top)
  side:      THREE.FrontSide,
})
\`\`\`

\`MeshStandardMaterial\` (PBR) replaces K_d/K_s/shininess with:
\`\`\`javascript
const pbr = new THREE.MeshStandardMaterial({
  color:     0xcc4411,
  roughness: 0.3,   // 0=mirror, 1=chalk (replaces shininess)
  metalness: 0.0,   // 0=dielectric, 1=metal (blends F0)
})
\`\`\`

For new projects, prefer \`MeshStandardMaterial\` — it's physically correct and matches glTF exports from Blender/Substance Painter.`,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-chalk',
      instruction: 'Which set of material properties best describes a piece of white chalk?',
      options: [
        { label: 'A', text: 'K_a=0.1, K_d=0.9, K_s=0.0, shininess=1 — bright diffuse, no specular highlight' },
        { label: 'B', text: 'K_a=0.1, K_d=0.3, K_s=0.9, shininess=512 — strong specular like polished glass' },
        { label: 'C', text: 'K_a=0.9, K_d=0.0, K_s=0.0, shininess=1 — fully ambient, invisible under direct light' },
        { label: 'D', text: 'K_a=0.0, K_d=0.5, K_s=0.5, shininess=64 — equal diffuse and specular, medium shine' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-gold-specular',
      instruction: 'A gold coin reflects gold-coloured light at its specular highlight. In Phong shading, how do you achieve a yellow-tinted specular highlight?',
      options: [
        { label: 'A', text: 'Set shininess to a high value — high shininess automatically tints the specular highlight yellow' },
        { label: 'B', text: 'Set K_s to a vec3 with high red and green, low blue — e.g., vec3(1.0, 0.85, 0.2)' },
        { label: 'C', text: 'This is impossible in Phong — specular highlights are always the light colour' },
        { label: 'D', text: 'Set the ambient colour to yellow — it will bleed into the specular calculation' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-energy',
      instruction: 'You set K_d = 1.0 and K_s = 1.0. What physical law does this violate — and what visual artifact does it cause?',
      options: [
        { label: 'A', text: 'Snell\'s Law — refracted light exits from the wrong side of the surface' },
        { label: 'B', text: 'Energy conservation — the surface reflects more light than it receives, making it appear unnaturally bright or "glowing"' },
        { label: 'C', text: 'The inverse square law — attenuation is ignored, making distant surfaces too bright' },
        { label: 'D', text: 'No law is violated — K_d + K_s > 1 is valid for metallic surfaces' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Energy-conserving material ─────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Energy-Conserving Material Shader

Set diffuse weight \`Kd = 0.7\` and specular weight \`Ks = 0.3\` (they sum to 1.0), then apply them to the lighting equation so the surface obeys energy conservation.

**Requirements:**
1. \`float Kd = 0.7\`
2. \`float Ks = 0.3\`
3. Final colour: \`0.1*albedo + Kd*albedo*NdL + Ks*lCol*spec\``,
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
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.5,1.5,2.)-fP);
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 H=normalize(L+V);
  vec3 lCol=vec3(1.);
  vec3 albedo=vec3(.1,.6,.9);
  float NdL=max(0.,dot(N,L));
  float spec=pow(max(0.,dot(N,H)),48.);
  // TODO 1: float Kd = 0.7
  // TODO 2: float Ks = 0.3
  // TODO 3: vec3 colour = 0.1*albedo + Kd*albedo*NdL + Ks*lCol*spec
  vec3 colour=vec3(0.5); // placeholder
  gl_FragColor=vec4(colour,1.);
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
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.5,1.5,2.)-fP);
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 H=normalize(L+V);
  vec3 lCol=vec3(1.);
  vec3 albedo=vec3(.1,.6,.9);
  float NdL=max(0.,dot(N,L));
  float spec=pow(max(0.,dot(N,H)),48.);
  float Kd=0.7;
  float Ks=0.3;
  vec3 colour=0.1*albedo+Kd*albedo*NdL+Ks*lCol*spec;
  gl_FragColor=vec4(colour,1.);
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
      check: (code) => /Kd\s*=\s*0\.7/.test(code) && /Ks\s*=\s*0\.3/.test(code) && /Kd\s*\*\s*albedo/.test(code) && /Ks\s*\*\s*lCol/.test(code),
    },
  ],
}

export default {
  id: 'three-js-3-2-material-properties',
  slug: 'material-surface-properties',
  chapter: 'three-js.3',
  order: 2,
  title: 'Materials & Surface Properties',
  subtitle: 'Ka, Kd, Ks, shininess — the four numbers that define any surface.',
  tags: ['three-js', 'materials', 'phong', 'shininess', 'pbr-preview'],
  hook: {
    question: 'Gold reflects yellow. Iron reflects grey. Both are metals. How do their material coefficients differ — and why does the colour of the specular highlight change for each?',
    realWorldContext: 'Material design — choosing Ka, Kd, Ks values — is as much art as science. Understanding the physical meaning of each coefficient lets you design any surface type from first principles.',
  },
  intuition: {
    prose: 'Ka=ambient fill, Kd=surface colour under light, Ks=specular brightness, shininess=highlight width. K_d+K_s≤1 for physical accuracy. Metals have coloured Ks; dielectrics have white Ks.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Materials & Surface Properties', props: { lesson: LESSON_3JS_3_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Ka,Kd,Ks,shininess define any Phong surface. Kd+Ks≤1 for energy conservation. Metals have tinted specular; dielectrics have white specular.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Kd+Ks≤1 for energy conservation." A material has Kd=0.8 and Ks=0.6. What physical law does this violate?',
      options: [
        'A surface cannot reflect more energy than it receives — Kd+Ks=1.4 means the material emits 40% more light than hits it',
        'The specular component must always be smaller than diffuse',
        'Energy conservation only applies to metallic materials',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Metals have tinted specular; dielectrics have white specular." Why does gold have a yellow specular highlight while plastic has a white one?',
      options: [
        'Metals absorb all diffuse light, leaving only specular — and metals\' reflection is tinted by their own colour (gold reflects yellow frequencies more than blue)',
        'Plastic is always white-coloured',
        'The specular colour is set by the light colour, not the material',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Ka, Kd, Ks, shininess define any Phong surface." Increasing shininess from 10 to 200 produces what visual change?',
      options: [
        'The object becomes generally brighter across its surface',
        'The specular highlight shrinks and sharpens — high shininess = mirror-like, low shininess = large diffuse-looking specular',
        'The ambient term increases',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A rubber ball and a polished chrome sphere are both lit the same way. The chrome sphere has a much higher Ks and shininess. What visible difference does this create?',
      options: [
        'The chrome sphere reflects the environment; the rubber ball does not show specular at all',
        'The chrome sphere has a small, bright, sharp specular highlight; the rubber ball has a large, dim, soft highlight or none',
        'The rubber ball is brighter because it scatters light more',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_3_2 }
