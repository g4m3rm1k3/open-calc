// Three.js · Chapter 3 · Lesson 0
// The Lighting Equation — Building Phong from Scratch

const LESSON_3JS_3_0 = {
  title: 'The Lighting Equation',
  subtitle: 'Build ambient → diffuse → specular step by step. Each term derived from physics.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Why a flat circle becomes a sphere

Without lighting, a sphere and a disc are indistinguishable — both appear as a uniform colour disc on screen. **One dot product** changes everything.

\`N·L\` — the angle between the surface normal **N** and the light direction **L** — is the calculation that gives 3D objects their sense of volume and depth. Add a second dot product for specular highlights and a constant for ambient fill, and you have the **Phong lighting model**: the equation that defined real-time 3D graphics for 30 years.

In this lesson we build each term from first principles, derive the GLSL code, and watch the sphere emerge term by term.`,
    },

    // ── 1. Ambient — the baseline ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Term 1 — Ambient Light

Ambient light is a cheat for **indirect illumination**: light that has bounced around the scene so many times it arrives equally from all directions. We approximate it as a constant.

\`\`\`
I_ambient = K_a × I_a
\`\`\`

- **K_a** — surface ambient reflectance (0–1)
- **I_a** — ambient light intensity (colour)

In GLSL:
\`\`\`glsl
vec3 ambient = uKa * uAmbientColor;
\`\`\`

On its own, ambient gives a flat-shaded disc. No shape information — but it prevents the unlit side from being pure black.`,
    },

    // ── 2. Ambient interactive demo ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Interactive: Ambient only`,
    },
    {
      type: 'js',
      id: 'ambient-demo',
      html: `<canvas id="c-ambient" width="480" height="480" style="width:480px;height:480px;border-radius:8px;background:#111;display:block;margin:auto"></canvas>
<div style="text-align:center;margin-top:8px;font-family:monospace;color:#aaa">
  K_a: <input id="ka" type="range" min="0" max="100" value="30" style="width:120px">
  <span id="ka-val">0.30</span>
</div>`,
      startCode: `const c = document.getElementById('c-ambient');
const gl = c.getContext('webgl');
const ka = document.getElementById('ka');
const kaVal = document.getElementById('ka-val');

const vs = \`
attribute vec2 aPos;
varying vec2 vUV;
void main(){
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
\`;

const fs = \`
precision mediump float;
varying vec2 vUV;
uniform float uKa;

void main(){
  vec2 uv = vUV * 2.0 - 1.0;
  float r = length(uv);
  if(r > 1.0) { gl_FragColor = vec4(0.05,0.05,0.07,1.0); return; }
  vec3 albedo = vec3(0.8, 0.3, 0.1);
  vec3 ambient = uKa * vec3(1.0, 0.95, 0.9);
  gl_FragColor = vec4(ambient * albedo, 1.0);
}
\`;

function compile(type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog);
gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

const uKa = gl.getUniformLocation(prog, 'uKa');

function draw(){
  const v = ka.value / 100;
  kaVal.textContent = v.toFixed(2);
  gl.uniform1f(uKa, v);
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
ka.addEventListener('input', draw);
draw();`,
    },

    // ── 3. Diffuse ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Term 2 — Diffuse (Lambertian) Reflection

Diffuse light **scatters equally in all directions** from a matte surface. The brightness depends only on the angle between the surface normal **N** and the light direction **L**.

\`\`\`
I_diffuse = K_d × I_d × max(0, N·L)
\`\`\`

The \`max(0, …)\` clamps negative values — light from behind the surface contributes nothing.

\`N·L = 1\` when the light hits head-on. \`N·L = 0\` at the terminator (90°). Negative behind.

\`\`\`glsl
vec3 N = normalize(vNormal);          // surface normal (world space)
vec3 L = normalize(uLightPos - vFragPos); // direction to light
float diff = max(0.0, dot(N, L));
vec3 diffuse = uKd * uLightColor * diff;
\`\`\`

**This is the single calculation that gives objects their 3D shape.**`,
    },

    // ── 4. Diffuse + ambient sphere demo ─────────────────────────────────
    {
      type: 'js',
      id: 'diffuse-demo',
      html: `<canvas id="c-diff" width="480" height="480" style="width:480px;height:480px;border-radius:8px;background:#111;display:block;margin:auto"></canvas>
<div style="display:flex;gap:24px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>K_d: <input id="kd" type="range" min="0" max="100" value="80" style="width:100px"> <span id="kd-v">0.80</span></label>
  <label>Light X: <input id="lx" type="range" min="-200" max="200" value="100" style="width:100px"> <span id="lx-v">1.0</span></label>
  <label>Light Y: <input id="ly" type="range" min="-200" max="200" value="120" style="width:100px"> <span id="ly-v">1.2</span></label>
</div>`,
      startCode: `const c = document.getElementById('c-diff');
const gl = c.getContext('webgl');

const vs = \`
attribute vec2 aPos;
varying vec2 vUV;
void main(){
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
\`;
const fs = \`
precision mediump float;
varying vec2 vUV;
uniform float uKd;
uniform vec3 uLight;

void main(){
  vec2 uv = vUV * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if(r2 > 1.0){ gl_FragColor = vec4(0.05,0.05,0.07,1); return; }
  // reconstruct sphere normal from UV
  vec3 N = normalize(vec3(uv, sqrt(1.0 - r2)));
  vec3 L = normalize(uLight - vec3(uv * 2.0, 0.0));
  float diff = max(0.0, dot(N, L));
  vec3 albedo = vec3(0.8, 0.3, 0.1);
  vec3 ambient = 0.15 * vec3(1.0);
  vec3 diffuse = uKd * vec3(1.0, 0.95, 0.8) * diff;
  gl_FragColor = vec4((ambient + diffuse) * albedo, 1.0);
}
\`;
function sh(type, src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; }
const prog=gl.createProgram();
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(prog,'aPos');
gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
const uKd=gl.getUniformLocation(prog,'uKd');
const uLight=gl.getUniformLocation(prog,'uLight');
const kd=document.getElementById('kd');
const lx=document.getElementById('lx');
const ly=document.getElementById('ly');
const kdv=document.getElementById('kd-v');
const lxv=document.getElementById('lx-v');
const lyv=document.getElementById('ly-v');
function draw(){
  const k=kd.value/100, x=lx.value/100, y=ly.value/100;
  kdv.textContent=k.toFixed(2); lxv.textContent=x.toFixed(2); lyv.textContent=y.toFixed(2);
  gl.uniform1f(uKd,k);
  gl.uniform3f(uLight,x,y,1.5);
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
[kd,lx,ly].forEach(el=>el.addEventListener('input',draw));
draw();`,
    },

    // ── 5. Specular ──────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Term 3 — Specular Reflection

Specular is the shiny highlight — light reflected **in a mirror-like direction**. It depends on the angle between the **reflection direction R** and the **view direction V**.

\`\`\`
R = reflect(-L, N)          // mirror reflection of light around N
I_specular = K_s × I_s × max(0, R·V)^shininess
\`\`\`

**Shininess** controls the size of the highlight:
- **shininess = 2** → wide, rough highlight (chalk, matte plastic)
- **shininess = 32** → medium (painted wood)
- **shininess = 128** → tight, metallic highlight
- **shininess = 512** → mirror-like

\`\`\`glsl
vec3 R = reflect(-L, N);              // needs normalize(L) first
vec3 V = normalize(uCamPos - vFragPos);
float spec = pow(max(0.0, dot(R, V)), uShininess);
vec3 specular = uKs * uLightColor * spec;
\`\`\``,
    },

    // ── 6. Full Phong sphere ─────────────────────────────────────────────
    {
      type: 'js',
      id: 'phong-full',
      html: `<canvas id="c-phong" width="480" height="480" style="width:480px;height:480px;border-radius:8px;background:#111;display:block;margin:auto"></canvas>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;max-width:440px;margin:10px auto;font-family:monospace;color:#aaa;font-size:13px">
  <label>K_a: <input id="pka" type="range" min="0" max="50" value="10" style="width:90px"> <span id="pka-v">0.10</span></label>
  <label>K_d: <input id="pkd" type="range" min="0" max="100" value="75" style="width:90px"> <span id="pkd-v">0.75</span></label>
  <label>K_s: <input id="pks" type="range" min="0" max="100" value="60" style="width:90px"> <span id="pks-v">0.60</span></label>
  <label>Shininess: <input id="psh" type="range" min="1" max="256" value="32" style="width:90px"> <span id="psh-v">32</span></label>
  <label>Light X: <input id="plx" type="range" min="-200" max="200" value="120" style="width:90px"> <span id="plx-v">1.2</span></label>
  <label>Light Y: <input id="ply" type="range" min="-200" max="200" value="150" style="width:90px"> <span id="ply-v">1.5</span></label>
</div>`,
      startCode: `const c=document.getElementById('c-phong');
const gl=c.getContext('webgl');
const vs=\`
attribute vec2 aPos;
varying vec2 vUV;
void main(){ vUV=aPos*0.5+0.5; gl_Position=vec4(aPos,0,1); }
\`;
const fs=\`
precision mediump float;
varying vec2 vUV;
uniform float uKa,uKd,uKs,uSh;
uniform vec3 uLight;
void main(){
  vec2 uv=vUV*2.0-1.0;
  float r2=dot(uv,uv);
  if(r2>1.0){gl_FragColor=vec4(0.05,0.05,0.07,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.0-r2)));
  vec3 fragPos=vec3(uv,sqrt(1.0-r2));
  vec3 L=normalize(uLight-fragPos);
  vec3 V=normalize(vec3(0,0,3)-fragPos);
  vec3 R=reflect(-L,N);
  vec3 albedo=vec3(0.8,0.3,0.1);
  vec3 lightCol=vec3(1.0,0.95,0.85);
  vec3 ambient=uKa*vec3(0.6,0.7,0.9);
  float diff=max(0.0,dot(N,L));
  vec3 diffuse=uKd*lightCol*diff;
  float spec=pow(max(0.0,dot(R,V)),uSh);
  vec3 specular=uKs*lightCol*spec;
  gl_FragColor=vec4((ambient+diffuse)*albedo+specular,1);
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
['uKa','uKd','uKs','uSh','uLight'].forEach(n=>locs[n]=gl.getUniformLocation(prog,n));
const ids=['pka','pkd','pks','psh','plx','ply'];
const els={}; ids.forEach(i=>els[i]=document.getElementById(i));
function draw(){
  const ka=els.pka.value/100,kd=els.pkd.value/100,ks=els.pks.value/100;
  const sh=parseFloat(els.psh.value),lx=els.plx.value/100,ly=els.ply.value/100;
  document.getElementById('pka-v').textContent=ka.toFixed(2);
  document.getElementById('pkd-v').textContent=kd.toFixed(2);
  document.getElementById('pks-v').textContent=ks.toFixed(2);
  document.getElementById('psh-v').textContent=sh;
  document.getElementById('plx-v').textContent=lx.toFixed(2);
  document.getElementById('ply-v').textContent=ly.toFixed(2);
  gl.uniform1f(locs.uKa,ka);gl.uniform1f(locs.uKd,kd);
  gl.uniform1f(locs.uKs,ks);gl.uniform1f(locs.uSh,sh);
  gl.uniform3f(locs.uLight,lx,ly,2.0);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
ids.forEach(i=>els[i].addEventListener('input',draw));
draw();`,
    },

    // ── 7. The full equation ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Complete Phong Equation

\`\`\`
I = K_a·I_a  +  K_d·I_d·max(0, N·L)  +  K_s·I_s·max(0, R·V)^shininess
    ────────    ─────────────────────    ─────────────────────────────────
    ambient          diffuse                      specular
\`\`\`

**In full GLSL:**
\`\`\`glsl
vec3 N = normalize(vNormal);
vec3 L = normalize(uLightPos - vFragPos);
vec3 V = normalize(uCamPos - vFragPos);
vec3 R = reflect(-L, N);

vec3 ambient  = uKa * uAmbientColor;
vec3 diffuse  = uKd * uLightColor * max(0.0, dot(N, L));
vec3 specular = uKs * uLightColor * pow(max(0.0, dot(R, V)), uShininess);

gl_FragColor  = vec4((ambient + diffuse) * albedo + specular, 1.0);
\`\`\`

**Important notes:**
- Normalise **N** in the fragment shader — interpolated varyings lose unit length
- \`reflect(-L, N)\` — note the negation; \`reflect\` expects the incident direction (toward surface)
- Multiply specular **after** the albedo — specular highlights are usually the light colour, not surface colour`,
    },

    // ── 8. Term-by-term visualizer ────────────────────────────────────────
    {
      type: 'js',
      id: 'terms-vis',
      html: `<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
  <div><canvas id="c-a" width="150" height="150" style="border-radius:6px;background:#111"></canvas><p style="text-align:center;font-family:monospace;font-size:12px;color:#aaa;margin:4px 0">Ambient</p></div>
  <div><canvas id="c-d" width="150" height="150" style="border-radius:6px;background:#111"></canvas><p style="text-align:center;font-family:monospace;font-size:12px;color:#aaa;margin:4px 0">Diffuse</p></div>
  <div><canvas id="c-s" width="150" height="150" style="border-radius:6px;background:#111"></canvas><p style="text-align:center;font-family:monospace;font-size:12px;color:#aaa;margin:4px 0">Specular</p></div>
  <div><canvas id="c-f" width="150" height="150" style="border-radius:6px;background:#111"></canvas><p style="text-align:center;font-family:monospace;font-size:12px;color:#aaa;margin:4px 0">Combined</p></div>
</div>`,
      startCode: `function makeSphereGL(id, mode){
  const c=document.getElementById(id);
  const gl=c.getContext('webgl');
  const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*0.5+0.5;gl_Position=vec4(aPos,0,1);}\`;
  const fs=\`precision mediump float;varying vec2 vUV;uniform int uMode;
void main(){
  vec2 uv=vUV*2.0-1.0;
  float r2=dot(uv,uv);
  if(r2>1.0){gl_FragColor=vec4(0.05,0.05,0.07,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.0-r2)));
  vec3 fPos=vec3(uv,sqrt(1.0-r2));
  vec3 L=normalize(vec3(1.2,1.5,2.0)-fPos);
  vec3 V=normalize(vec3(0,0,3)-fPos);
  vec3 R=reflect(-L,N);
  vec3 albedo=vec3(0.8,0.3,0.1);
  vec3 lCol=vec3(1.0,0.95,0.85);
  vec3 amb=0.15*vec3(0.6,0.7,0.9);
  vec3 dif=0.8*lCol*max(0.0,dot(N,L));
  vec3 spe=0.6*lCol*pow(max(0.0,dot(R,V)),32.0);
  vec3 col=vec3(0);
  if(uMode==0) col=amb*albedo;
  else if(uMode==1) col=dif*albedo;
  else if(uMode==2) col=spe;
  else col=(amb+dif)*albedo+spe;
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
  gl.uniform1i(uMode,mode);
  gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
makeSphereGL('c-a',0);
makeSphereGL('c-d',1);
makeSphereGL('c-s',2);
makeSphereGL('c-f',3);`,
    },

    // ── 9. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Challenge 1`,
    },
    {
      type: 'challenge',
      id: 'q1-dot-product',
      instruction: 'A fragment has normal N = (0, 1, 0). The light direction (toward light) is L = (0, 0.707, 0.707). What is max(0, N·L)?',
      options: [
        { label: 'A', text: '0.0 — the dot product is zero because L has no Y component equal to N' },
        { label: 'B', text: '0.707 — N·L = 0×0 + 1×0.707 + 0×0.707 = 0.707' },
        { label: 'C', text: '1.0 — N and L point in the same hemisphere so the result is clamped to 1' },
        { label: 'D', text: '0.5 — the light is at 45° so it contributes half the full value' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 10. Challenge 2 ──────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-terminator',
      instruction: 'On a lit sphere, the "terminator" is the boundary between the lit and unlit sides. What value does N·L have exactly at the terminator?',
      options: [
        { label: 'A', text: '1.0 — the light is fully facing the surface at the edge' },
        { label: 'B', text: '0.5 — halfway between lit and dark' },
        { label: 'C', text: '0.0 — N and L are perpendicular at the terminator (90° angle)' },
        { label: 'D', text: '-1.0 — the surface faces directly away from the light' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 11. Challenge 3 ──────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-shininess',
      instruction: 'You increase shininess from 32 to 128. What happens to the specular highlight on the sphere?',
      options: [
        { label: 'A', text: 'It gets brighter (higher K_s)' },
        { label: 'B', text: 'It gets narrower and more intense at the centre — like polished metal vs. satin' },
        { label: 'C', text: 'It disappears — shininess above 100 disables specular in Phong' },
        { label: 'D', text: 'It moves to the opposite side of the sphere' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 12. Challenge 4 ──────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q4-normalize',
      instruction: 'You forget to call normalize() on vNormal in the fragment shader. The interpolated normal varies in length across the surface. What will the specular highlight look like?',
      options: [
        { label: 'A', text: 'Exactly the same — the dot product is independent of vector length' },
        { label: 'B', text: 'Blown out and too bright near the polygon edges where interpolated normals are longest' },
        { label: 'C', text: 'Dimmer than expected — longer normals reduce the dot product result' },
        { label: 'D', text: 'Completely black — unnormalized vectors break the reflect() function in GLSL' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── Coding Challenge: Complete Blinn-Phong ───────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Complete the Blinn-Phong Fragment Shader

The fragment shader below is missing its three lighting terms. Fill in each \`// TODO\` line.

**Requirements:**
1. \`ambient\` — constant 0.15 fill using the light colour
2. \`diffuse\` — \`max(0.0, dot(N, L))\` scaled by 0.8
3. \`specular\` — Blinn-Phong using half-vector H, shininess 32.0

The canvas should show a lit orange sphere when all three terms are correct.`,
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
  if(r2>1.){gl_FragColor=vec4(.05,.05,.1,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.,1.5,2.)-fP);
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 H=normalize(L+V);
  vec3 lCol=vec3(1.,.95,.85);
  vec3 albedo=vec3(.9,.4,.1);
  // TODO 1: vec3 ambient  = 0.15 * lCol
  // TODO 2: vec3 diffuse  = 0.8 * lCol * max(0.0, dot(N, L))
  // TODO 3: vec3 specular = 0.6 * lCol * pow(max(0.0, dot(N, H)), 32.0)
  gl_FragColor=vec4((ambient+diffuse)*albedo+specular,1.);
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
  if(r2>1.){gl_FragColor=vec4(.05,.05,.1,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fP=vec3(uv,sqrt(1.-r2));
  vec3 L=normalize(vec3(1.,1.5,2.)-fP);
  vec3 V=normalize(vec3(0.,0.,3.)-fP);
  vec3 H=normalize(L+V);
  vec3 lCol=vec3(1.,.95,.85);
  vec3 albedo=vec3(.9,.4,.1);
  vec3 ambient  = 0.15 * lCol;
  vec3 diffuse  = 0.8 * lCol * max(0.0, dot(N, L));
  vec3 specular = 0.6 * lCol * pow(max(0.0, dot(N, H)), 32.0);
  gl_FragColor=vec4((ambient+diffuse)*albedo+specular,1.);
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
      check: (code) => code.includes('dot(N, L)') && code.includes('dot(N, H)') && code.includes('0.15'),
    },
  ],
}

export default {
  id: 'three-js-3-0-lighting-equation',
  slug: 'the-lighting-equation',
  chapter: 'three-js.3',
  order: 0,
  title: 'The Lighting Equation',
  subtitle: 'Build ambient → diffuse → specular step by step. Each term derived from physics.',
  tags: ['three-js', 'phong', 'lighting', 'normals', 'diffuse', 'specular'],
  hook: {
    question: 'A sphere sits in a scene. Without lighting, it is a flat disc. You add one line to the fragment shader. The disc suddenly has depth and volume. What is that line?',
    realWorldContext: 'Diffuse lighting (the N·L dot product) is the single calculation that adds dimensionality to all 3D graphics. Without it, nothing has shape.',
  },
  intuition: {
    prose: 'The Phong model builds in three layers: ambient (constant fill), diffuse (N·L angle to light), and specular (R·V angle to viewer). Each term adds one physical phenomenon.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'The Lighting Equation', props: { lesson: LESSON_3JS_3_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Phong = ambient + diffuse(N·L) + specular(R·V)^shininess. Ambient=constant fill, diffuse=shape, specular=shiny highlight.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_3_0 }
