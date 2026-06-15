// Three.js · Chapter 5 · Lesson 4
// PBR — Physically Based Rendering

const LESSON_3JS_5_4 = {
  title: 'PBR — Physically Based Rendering',
  subtitle: 'The Cook-Torrance BRDF and the metalness-roughness model that unified game and film rendering.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The SIGGRAPH 2012 paper that changed everything

Brent Burley presented "Physically-Based Shading at Disney" at SIGGRAPH 2012. Within 3 years, Unreal Engine 4, Unity 5, and every major game engine had adopted PBR. By 2017, glTF 2.0 standardised the metalness-roughness workflow.

The insight: instead of arbitrary Ka/Kd/Ks/shininess values, **two physically grounded parameters** control any surface:

- **Metalness** (0–1): is this a metal or a dielectric?
- **Roughness** (0–1): how microscopically rough is the surface?

These two numbers, combined with a physically correct BRDF (Bidirectional Reflectance Distribution Function), reproduce any real-world surface. The same material looks correct under any lighting — studio, outdoor, candlelight — without retuning.`,
    },

    // ── 1. Metalness-roughness model ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Metalness / Roughness Model

### Roughness
Controls microfacet distribution — how scattered the surface normals are at a microscopic level.
- **Roughness = 0** → perfect mirror (all normals aligned)
- **Roughness = 1** → completely diffuse (normals in all directions)

### Metalness
Controls how light interacts with the surface at the quantum level:
- **Metalness = 0** (dielectric): plastic, glass, skin, wood — free electrons are bound. Light penetrates the surface, diffuse scattering occurs. F0 ≈ 0.04 (white specular).
- **Metalness = 1** (metal): copper, gold, iron — free electrons absorb and re-emit light. No diffuse component. F0 = albedo colour (tinted specular).

\`\`\`glsl
// F0 calculation
vec3 F0 = mix(vec3(0.04), albedo, metalness);
// Dielectrics: F0 = 0.04 (roughly 4% reflectance at 0°)
// Metals: F0 = albedo (the surface colour IS the specular reflectance)
\`\`\``,
    },

    // ── 2. Cook-Torrance BRDF ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Cook-Torrance BRDF

The Cook-Torrance microfacet BRDF:

\`\`\`
f(l,v) = D(h) × F(v,h) × G(l,v,h)
         ─────────────────────────
              4(n·l)(n·v)
\`\`\`

Three terms:

**D — Normal Distribution Function (GGX/Trowbridge-Reitz):**
Probability that microfacets face direction h (the half-vector).
\`\`\`glsl
float D_GGX(float NdotH, float roughness) {
  float a  = roughness * roughness;
  float a2 = a * a;
  float d  = (NdotH * NdotH * (a2 - 1.0) + 1.0);
  return a2 / (PI * d * d);
}
\`\`\`

**F — Fresnel (Schlick approximation):**
How much light is reflected vs. refracted at this angle.
\`\`\`glsl
vec3 F_Schlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
\`\`\`

**G — Geometry/Shadowing-Masking (Smith):**
Microfacets can shadow each other — reduces specular at grazing angles.
\`\`\`glsl
float G_Smith(float NdotV, float NdotL, float roughness) {
  float r  = roughness + 1.0;
  float k  = (r * r) / 8.0;
  float gv = NdotV / (NdotV * (1.0 - k) + k);
  float gl = NdotL / (NdotL * (1.0 - k) + k);
  return gv * gl;
}
\`\`\``,
    },

    // ── 3. PBR material explorer ──────────────────────────────────────────
    {
      type: 'js',
      id: 'pbr-demo',
      html: `<canvas id="c-pbr" width="480" height="320" style="width:480px;height:320px;border-radius:8px;display:block;margin:auto;background:#0d0d12"></canvas>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;max-width:440px;margin:10px auto;font-family:monospace;color:#aaa;font-size:13px">
  <label>Roughness: <input id="prgh" type="range" min="0" max="100" value="30" style="width:110px"> <span id="prgh-v">0.30</span></label>
  <label>Metalness: <input id="pmet" type="range" min="0" max="100" value="0" style="width:110px"> <span id="pmet-v">0.00</span></label>
  <label>Albedo R: <input id="par" type="range" min="0" max="100" value="80" style="width:110px"> <span id="par-v">0.80</span></label>
  <label>Albedo G: <input id="pag" type="range" min="0" max="100" value="30" style="width:110px"> <span id="pag-v">0.30</span></label>
  <label>Albedo B: <input id="pab" type="range" min="0" max="100" value="10" style="width:110px"> <span id="pab-v">0.10</span></label>
</div>
<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-family:monospace;font-size:11px">
  <button id="pb-plastic" style="background:#222;color:#ccc;border:1px solid #444;padding:3px 8px;border-radius:4px;cursor:pointer">Red Plastic</button>
  <button id="pb-gold" style="background:#222;color:#ccc;border:1px solid #444;padding:3px 8px;border-radius:4px;cursor:pointer">Gold</button>
  <button id="pb-iron" style="background:#222;color:#ccc;border:1px solid #444;padding:3px 8px;border-radius:4px;cursor:pointer">Rough Iron</button>
  <button id="pb-rubber" style="background:#222;color:#ccc;border:1px solid #444;padding:3px 8px;border-radius:4px;cursor:pointer">Rubber</button>
  <button id="pb-chrome" style="background:#222;color:#ccc;border:1px solid #444;padding:3px 8px;border-radius:4px;cursor:pointer">Chrome</button>
</div>`,
      startCode: `const c=document.getElementById('c-pbr');
const gl=c.getContext('webgl');
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`
precision highp float;
varying vec2 vUV;
uniform float uRoughness,uMetalness;
uniform vec3 uAlbedo;
const float PI=3.14159265;

float D_GGX(float NdH,float r){
  float a=r*r;float a2=a*a;
  float d=NdH*NdH*(a2-1.)+1.;
  return a2/(PI*d*d);
}
vec3 F_Schlick(float cos_,vec3 F0){
  return F0+(1.-F0)*pow(clamp(1.-cos_,0.,1.),5.);
}
float G_Smith(float NdV,float NdL,float r){
  float k=(r+1.)*(r+1.)/8.;
  float gv=NdV/(NdV*(1.-k)+k);
  float gl=NdL/(NdL*(1.-k)+k);
  return gv*gl;
}

void main(){
  vec2 uv=vUV*2.-1.;
  float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.06,.06,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fPos=N;
  vec3 L=normalize(vec3(1.5,2.,2.)-fPos*0.);
  vec3 V=normalize(vec3(0,0,3)-fPos);
  vec3 H=normalize(L+V);
  float NdL=max(0.,dot(N,L));
  float NdV=max(0.001,dot(N,V));
  float NdH=max(0.,dot(N,H));
  float HdV=max(0.,dot(H,V));
  vec3 F0=mix(vec3(.04),uAlbedo,uMetalness);
  float D=D_GGX(NdH,uRoughness);
  vec3 F=F_Schlick(HdV,F0);
  float G=G_Smith(NdV,NdL,uRoughness);
  vec3 spec=D*F*G/(4.*NdV*NdL+.001);
  vec3 kD=(1.-F)*(1.-uMetalness);
  vec3 diffuse=kD*uAlbedo/PI;
  vec3 lCol=vec3(1.,.95,.85)*3.;
  vec3 col=(diffuse+spec)*lCol*NdL;
  // Ambient IBL approximation
  col+=uAlbedo*.04*(1.-uMetalness)+F0*.1;
  // Gamma
  col=pow(max(col,vec3(0.)),vec3(1./2.2));
  gl_FragColor=vec4(col,1);
}
\`;
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
['uRoughness','uMetalness','uAlbedo'].forEach(n=>locs[n]=gl.getUniformLocation(prog,n));
const els={rgh:document.getElementById('prgh'),met:document.getElementById('pmet'),
  ar:document.getElementById('par'),ag:document.getElementById('pag'),ab:document.getElementById('pab')};
function setPreset(r,m,ar,ag,ab){
  els.rgh.value=Math.round(r*100);els.met.value=Math.round(m*100);
  els.ar.value=Math.round(ar*100);els.ag.value=Math.round(ag*100);els.ab.value=Math.round(ab*100);
  draw();
}
document.getElementById('pb-plastic').onclick=()=>setPreset(.3,0,.8,.2,.1);
document.getElementById('pb-gold').onclick=()=>setPreset(.1,1,1.,.76,.03);
document.getElementById('pb-iron').onclick=()=>setPreset(.75,1,.56,.57,.58);
document.getElementById('pb-rubber').onclick=()=>setPreset(.9,0,.05,.05,.05);
document.getElementById('pb-chrome').onclick=()=>setPreset(.05,1,.95,.93,.88);
function draw(){
  const r=els.rgh.value/100,m=els.met.value/100;
  const ar=els.ar.value/100,ag=els.ag.value/100,ab=els.ab.value/100;
  document.getElementById('prgh-v').textContent=r.toFixed(2);
  document.getElementById('pmet-v').textContent=m.toFixed(2);
  document.getElementById('par-v').textContent=ar.toFixed(2);
  document.getElementById('pag-v').textContent=ag.toFixed(2);
  document.getElementById('pab-v').textContent=ab.toFixed(2);
  gl.uniform1f(locs.uRoughness,Math.max(.01,r));
  gl.uniform1f(locs.uMetalness,m);
  gl.uniform3f(locs.uAlbedo,ar,ag,ab);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
Object.values(els).forEach(e=>e.addEventListener('input',draw));
draw();`,
    },

    // ── 4. Three.js PBR ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Three.js PBR — MeshStandardMaterial

\`\`\`javascript
const material = new THREE.MeshStandardMaterial({
  // Base colour
  color: 0xcc4411,                   // albedo
  map: albedoTexture,                 // albedo texture

  // PBR parameters
  roughness: 0.3,                    // 0=mirror, 1=chalk
  roughnessMap: roughnessTexture,     // per-pixel roughness
  metalness: 0.0,                    // 0=dielectric, 1=metal
  metalnessMap: metalnessTexture,     // per-pixel metalness

  // Additional maps
  normalMap: normalTexture,
  normalScale: new THREE.Vector2(1, 1),
  aoMap: aoTexture,                  // ambient occlusion
  aoMapIntensity: 1.0,
  emissive: 0x000000,
  emissiveMap: emissiveTexture,
  emissiveIntensity: 1.0,
})

// IBL (Image-Based Lighting) — critical for PBR to look correct
const envMap = await new THREE.RGBELoader().loadAsync('/env.hdr')
envMap.mapping = THREE.EquirectangularReflectionMapping
scene.environment = envMap           // automatically used by MeshStandardMaterial
\`\`\`

Without an environment map, PBR materials look flat and incorrect — they need the environment's diffuse and specular contributions.`,
    },

    // ── 5. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-f0-metal',
      instruction: 'For a gold material (metalness=1), what is the value of F0 used in the Fresnel term?',
      options: [
        { label: 'A', text: 'vec3(0.04) — the standard dielectric F0 regardless of metalness' },
        { label: 'B', text: 'vec3(0.04) + albedo — the sum of base reflectance and surface colour' },
        { label: 'C', text: 'The albedo colour itself — metals have F0 equal to their tinted specular reflectance' },
        { label: 'D', text: 'vec3(1.0) — perfect reflector for metalness=1' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 6. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-roughness',
      instruction: 'You increase roughness from 0.1 to 0.9. What changes in the rendered sphere?',
      options: [
        { label: 'A', text: 'The specular highlight gets wider and dimmer; the overall brightness increases due to more diffuse contribution' },
        { label: 'B', text: 'The specular highlight disappears and the surface becomes darker' },
        { label: 'C', text: 'The specular highlight gets brighter as the GGX D term increases with roughness' },
        { label: 'D', text: 'No visual change — roughness only affects the normal distribution, not the visible highlight' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-ibl',
      instruction: 'Without an environment map (IBL), a MeshStandardMaterial with roughness=0.9, metalness=0 looks flat and wrong. Why?',
      options: [
        { label: 'A', text: 'Roughness 0.9 requires a mipmap chain that only IBL provides' },
        { label: 'B', text: 'Three.js\'s PBR shaders do not activate without an environment map — the material falls back to white' },
        { label: 'C', text: 'PBR energy is split between direct lights and environment lighting. Without IBL, the environment contribution (indirect diffuse + specular) is zero — rough/matte surfaces rely heavily on this indirect light' },
        { label: 'D', text: 'Without IBL, the Fresnel term defaults to 0, disabling all specular' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Schlick Fresnel ─────────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Implement Schlick Fresnel

The Schlick approximation: \`F = F0 + (1-F0) * pow(1-cosTheta, 5)\`

**Requirements:**
1. Define \`vec3 F_Schlick(float cosTheta, vec3 F0)\` with the formula
2. Compute \`cosTheta = max(0.0, dot(N, V))\`
3. Set \`F0 = vec3(0.04)\` for a dielectric
4. Call \`F_Schlick(cosTheta, F0)\` — use result to tint sphere rim

Result: sphere edge glows white (Fresnel peak), centre stays dark blue.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
// TODO 1: vec3 F_Schlick(float cosTheta, vec3 F0){ return F0+(1.-F0)*pow(clamp(1.-cosTheta,0.,1.),5.); }
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  // TODO 2: float cosTheta = max(0.0, dot(N, V))
  // TODO 3: vec3 F0 = vec3(0.04)
  // TODO 4: vec3 fresnel = F_Schlick(cosTheta, F0)
  vec3 fresnel=vec3(0.04); // placeholder
  gl_FragColor=vec4(mix(vec3(.05,.1,.5),vec3(1.),fresnel),1.);
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
vec3 F_Schlick(float cosTheta,vec3 F0){return F0+(1.-F0)*pow(clamp(1.-cosTheta,0.,1.),5.);}
void main(){
  vec2 uv=v*2.-1.; float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.04,.04,.08,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  float cosTheta=max(0.,dot(N,V));
  vec3 F0=vec3(.04);
  vec3 fresnel=F_Schlick(cosTheta,F0);
  gl_FragColor=vec4(mix(vec3(.05,.1,.5),vec3(1.),fresnel),1.);
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
      check: (code) => /F_Schlick/.test(code) && /pow\(clamp\(1\.\s*-\s*cosTheta/.test(code),
    },
  ],
}

export default {
  id: 'three-js-5-4-pbr',
  slug: 'physically-based-rendering',
  chapter: 'three-js.5',
  order: 4,
  title: 'PBR — Physically Based Rendering',
  subtitle: 'The Cook-Torrance BRDF and the metalness-roughness model that unified game and film rendering.',
  tags: ['three-js', 'pbr', 'cook-torrance', 'brdf', 'metalness', 'roughness', 'ibl', 'ggx'],
  hook: {
    question: 'Under Phong shading, a white sphere looks white in a white room. Under PBR with IBL, it looks like a mirror ball, a rough chalk ball, or anything in between — depending on two numbers. What are those numbers?',
    realWorldContext: 'Disney\'s SIGGRAPH 2012 PBR paper changed the entire industry. Within 3 years, Unreal Engine 4 and Unity shipped PBR. By 2017 glTF 2.0 standardised the metalness-roughness workflow.',
  },
  intuition: {
    prose: 'Two params: roughness (microfacet spread) and metalness (dielectric vs metal). BRDF = D×F×G/(4·NdL·NdV). F0=0.04 for dielectrics, F0=albedo for metals. Needs IBL for correct indirect lighting.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'PBR — Physically Based Rendering', props: { lesson: LESSON_3JS_5_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['roughness=microfacet spread, metalness=0→kD=(1-F)(1-metal),F0=0.04; metal→kD=0,F0=albedo. BRDF=DFG/4. Three.js: MeshStandardMaterial + scene.environment.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_5_4 }
