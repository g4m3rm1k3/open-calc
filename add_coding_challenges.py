import re, os

BASE = r"C:\Users\g4m3r\Documents\open-calc\src\content\three-js-1"

challenges = {}

challenges["lesson3-0.js"] = r"""
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
"""

challenges["lesson3-1.js"] = r"""
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
"""

challenges["lesson3-2.js"] = r"""
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
"""

challenges["lesson3-3.js"] = r"""
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
"""

challenges["lesson4-0.js"] = r"""
    // ── Coding Challenge: Grid of instances ──────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Draw a 5×5 Instance Grid

Using canvas 2D, draw 25 coloured squares arranged in a 5×5 grid — mirroring how \`InstancedMesh\` places 25 copies in one GPU draw call.

**Requirements:**
1. Outer loop: \`for (let row = 0; row < 5; row++)\`
2. Inner loop: \`for (let col = 0; col < 5; col++)\`
3. Position: \`x = 30 + col * 60\`, \`y = 30 + row * 60\`
4. Draw: \`ctx.fillRect(x, y, 40, 40)\``,
      html: `<canvas id="c" width="340" height="340" style="display:block;border-radius:8px;background:#0d0d18"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px;display:flex;justify-content:center}`,
      startCode: `const c = document.getElementById('c')
const ctx = c.getContext('2d')
ctx.fillStyle = '#0d0d18'
ctx.fillRect(0, 0, 340, 340)

// TODO 1: outer loop rows 0..4
// TODO 2:   inner loop cols 0..4
// TODO 3:     const x = 30 + col * 60
// TODO 4:     const y = 30 + row * 60
// TODO 5:     ctx.fillStyle = \\\`hsl(\\\${(row*5+col)*14},70%,55%)\\\`
// TODO 6:     ctx.fillRect(x, y, 40, 40)`,
      solutionCode: `const c = document.getElementById('c')
const ctx = c.getContext('2d')
ctx.fillStyle = '#0d0d18'
ctx.fillRect(0, 0, 340, 340)
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const x = 30 + col * 60
    const y = 30 + row * 60
    ctx.fillStyle = \\\`hsl(\\\${(row*5+col)*14},70%,55%)\\\`
    ctx.fillRect(x, y, 40, 40)
  }
}`,
      check: (code) => /for\s*\(/.test(code) && code.includes('row') && code.includes('col') && /fillRect/.test(code),
    },
"""

challenges["lesson4-1.js"] = r"""
    // ── Coding Challenge: Enable depth testing ───────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Enable the Depth Test

Two quads overlap: green at z=0 (closer) and red at z=-0.5 (further). Without depth testing, draw order decides the winner. With it, the z-buffer does.

**Requirements:**
1. \`gl.enable(gl.DEPTH_TEST)\` before drawing
2. \`gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)\` — clear both buffers
3. Keep drawing order: green first, then red

When correct, green always appears in front regardless of draw order.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec3 p;uniform vec3 u;varying vec3 vc;void main(){vc=u;gl_Position=vec4(p,1.);}\\\`
const fs=\\\`precision mediump float;varying vec3 vc;void main(){gl_FragColor=vec4(vc,1.);}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
// TODO 1: gl.enable(gl.DEPTH_TEST)
gl.clearColor(.05,.05,.1,1)
// TODO 2: gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
gl.clear(gl.COLOR_BUFFER_BIT) // replace this line
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.8,-.5,0,.2,-.5,0,-.8,.5,0,.2,.5,0]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.2,.9,.3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.5,-.5,.9,-.5,-.5,-.2,.5,-.5,.9,.5,-.5]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.9,.2,.2);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec3 p;uniform vec3 u;varying vec3 vc;void main(){vc=u;gl_Position=vec4(p,1.);}\\\`
const fs=\\\`precision mediump float;varying vec3 vc;void main(){gl_FragColor=vec4(vc,1.);}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
gl.enable(gl.DEPTH_TEST)
gl.clearColor(.05,.05,.1,1)
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.8,-.5,0,.2,-.5,0,-.8,.5,0,.2,.5,0]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.2,.9,.3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.5,-.5,.9,-.5,-.5,-.2,.5,-.5,.9,.5,-.5]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0)
gl.uniform3f(u,.9,.2,.2);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => code.includes('gl.enable(gl.DEPTH_TEST)') && code.includes('DEPTH_BUFFER_BIT'),
    },
"""

challenges["lesson4-2.js"] = r"""
    // ── Coding Challenge: Alpha blending ─────────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Set Up Alpha Blending

Draw a solid blue quad, then a semi-transparent orange quad over it using Porter-Duff **over** compositing.

**Requirements:**
1. \`gl.enable(gl.BLEND)\`
2. \`gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)\`
3. Draw blue (opaque) first, then orange with alpha=0.6

You should see blue through the orange in the overlap region.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec2 p;uniform vec4 u;varying vec4 vc;void main(){vc=u;gl_Position=vec4(p,0,1.);}\\\`
const fs=\\\`precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
gl.clearColor(.05,.05,.1,1);gl.clear(gl.COLOR_BUFFER_BIT)
// TODO 1: gl.enable(gl.BLEND)
// TODO 2: gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.9,-.6,.1,-.6,-.9,.6,.1,.6]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.1,.3,.9,1.);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.7,.9,-.7,-.2,.7,.9,.7]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.9,.5,.1,.6);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c = document.getElementById('c')
const gl = c.getContext('webgl')
gl.viewport(0, 0, c.width, c.height)
const vs=\\\`attribute vec2 p;uniform vec4 u;varying vec4 vc;void main(){vc=u;gl_Position=vec4(p,0,1.);}\\\`
const fs=\\\`precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const u=gl.getUniformLocation(prog,'u'),a=gl.getAttribLocation(prog,'p')
gl.clearColor(.05,.05,.1,1);gl.clear(gl.COLOR_BUFFER_BIT)
gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
const b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.9,-.6,.1,-.6,-.9,.6,.1,.6]),gl.STATIC_DRAW)
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.1,.3,.9,1.);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
const b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.2,-.7,.9,-.7,-.2,.7,.9,.7]),gl.STATIC_DRAW)
gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform4f(u,.9,.5,.1,.6);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => code.includes('gl.enable(gl.BLEND)') && code.includes('ONE_MINUS_SRC_ALPHA'),
    },
"""

challenges["lesson4-3.js"] = r"""
    // ── Coding Challenge: Grayscale post-process ──────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Grayscale Post-Process Pass

Complete the fullscreen fragment shader that reads a texture and outputs greyscale using the luminance formula:

\`L = 0.299*r + 0.587*g + 0.114*b\`

**Requirements:**
1. \`vec4 col = texture2D(uTex, vUV)\`
2. \`float L = 0.299*col.r + 0.587*col.g + 0.114*col.b\`
3. \`gl_FragColor = vec4(L, L, L, 1.0)\``,
      html: `<canvas id="c" width="400" height="260" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl'),W=c.width,H=c.height
gl.viewport(0,0,W,H)
const fbo=gl.createFramebuffer(),tex=gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D,tex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.bindFramebuffer(gl.FRAMEBUFFER,fbo)
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
function mkprog(v,f){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p}
const quad=new Float32Array([-1,-1,1,-1,-1,1,1,1])
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,quad,gl.STATIC_DRAW)
const p1=mkprog(\\\`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}\\\`,\\\`precision mediump float;void main(){vec2 uv=gl_FragCoord.xy/vec2(400.,260.);gl_FragColor=vec4(uv.x,uv.y,0.5,1.);}\\\`)
gl.useProgram(p1);gl.enableVertexAttribArray(gl.getAttribLocation(p1,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p1,'p'),2,gl.FLOAT,false,0,0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
gl.bindFramebuffer(gl.FRAMEBUFFER,null)
const fsP=\\\`precision mediump float;
uniform sampler2D uTex;varying vec2 vUV;
void main(){
  // TODO 1: vec4 col = texture2D(uTex, vUV)
  // TODO 2: float L  = 0.299*col.r + 0.587*col.g + 0.114*col.b
  // TODO 3: gl_FragColor = vec4(L, L, L, 1.0)
  gl_FragColor=vec4(.5,.5,.5,1.); // placeholder
}\\\`
const p2=mkprog(\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`,fsP)
gl.useProgram(p2);gl.enableVertexAttribArray(gl.getAttribLocation(p2,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p2,'p'),2,gl.FLOAT,false,0,0)
gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(p2,'uTex'),0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl'),W=c.width,H=c.height
gl.viewport(0,0,W,H)
const fbo=gl.createFramebuffer(),tex=gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D,tex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.bindFramebuffer(gl.FRAMEBUFFER,fbo)
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
function mkprog(v,f){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p}
const quad=new Float32Array([-1,-1,1,-1,-1,1,1,1])
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,quad,gl.STATIC_DRAW)
const p1=mkprog(\\\`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}\\\`,\\\`precision mediump float;void main(){vec2 uv=gl_FragCoord.xy/vec2(400.,260.);gl_FragColor=vec4(uv.x,uv.y,0.5,1.);}\\\`)
gl.useProgram(p1);gl.enableVertexAttribArray(gl.getAttribLocation(p1,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p1,'p'),2,gl.FLOAT,false,0,0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
gl.bindFramebuffer(gl.FRAMEBUFFER,null)
const fsP=\\\`precision mediump float;
uniform sampler2D uTex;varying vec2 vUV;
void main(){
  vec4 col=texture2D(uTex,vUV);
  float L=0.299*col.r+0.587*col.g+0.114*col.b;
  gl_FragColor=vec4(L,L,L,1.);
}\\\`
const p2=mkprog(\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`,fsP)
gl.useProgram(p2);gl.enableVertexAttribArray(gl.getAttribLocation(p2,'p'));gl.vertexAttribPointer(gl.getAttribLocation(p2,'p'),2,gl.FLOAT,false,0,0)
gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(p2,'uTex'),0)
gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /texture2D\(uTex/.test(code) && /0\.299/.test(code) && /0\.587/.test(code) && /vec4\(L,\s*L,\s*L/.test(code),
    },
"""

challenges["lesson4-4.js"] = r"""
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
"""

challenges["lesson5-0.js"] = r"""
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
"""

challenges["lesson5-1.js"] = r"""
    // ── Coding Challenge: Decode normal map ───────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Decode a Normal Map Texture

Normal maps store XYZ packed in RGB (0..1). To get the real normal:

1. Sample: \`vec4 raw = texture2D(uNmap, vUV * 4.0)\`
2. Unpack: \`vec3 N = raw.rgb * 2.0 - 1.0\`
3. Normalize: \`N = normalize(N)\`
4. Use in lighting: \`float NdL = max(0.0, dot(N, L))\`

The result should show a bumpy brick-like surface lit from the top-left.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const S=64,data=new Uint8Array(S*S*4)
for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const bx=x%16,by=y%8,edge=bx<1||bx>14||by<1||by>6
  const nx=edge?.5:(bx-7.5)/16,ny=edge?.5:(by-3.5)/8
  const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny))
  const i=(y*S+x)*4
  data[i]=Math.round((nx+1)*127.5);data[i+1]=Math.round((ny+1)*127.5)
  data[i+2]=Math.round(nz*127.5+127);data[i+3]=255
}
const nmTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,nmTex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,data)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT)
const vs=\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
uniform sampler2D uNmap;varying vec2 vUV;
void main(){
  vec3 L=normalize(vec3(1.,1.,1.));
  // TODO 1: vec4 raw = texture2D(uNmap, vUV * 4.0)
  // TODO 2: vec3 N   = raw.rgb * 2.0 - 1.0
  // TODO 3: N = normalize(N)
  // TODO 4: float NdL = max(0.0, dot(N, L))
  float NdL=0.5; // placeholder
  gl_FragColor=vec4(vec3(.8,.75,.6)*(0.15+NdL),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform1i(gl.getUniformLocation(prog,'uNmap'),0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      solutionCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const S=64,data=new Uint8Array(S*S*4)
for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const bx=x%16,by=y%8,edge=bx<1||bx>14||by<1||by>6
  const nx=edge?.5:(bx-7.5)/16,ny=edge?.5:(by-3.5)/8
  const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny))
  const i=(y*S+x)*4
  data[i]=Math.round((nx+1)*127.5);data[i+1]=Math.round((ny+1)*127.5)
  data[i+2]=Math.round(nz*127.5+127);data[i+3]=255
}
const nmTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,nmTex)
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,data)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT)
const vs=\\\`attribute vec2 p;varying vec2 vUV;void main(){vUV=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
uniform sampler2D uNmap;varying vec2 vUV;
void main(){
  vec3 L=normalize(vec3(1.,1.,1.));
  vec4 raw=texture2D(uNmap,vUV*4.);
  vec3 N=raw.rgb*2.-1.;
  N=normalize(N);
  float NdL=max(0.,dot(N,L));
  gl_FragColor=vec4(vec3(.8,.75,.6)*(0.15+NdL),1.);
}\\\`
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x}
const prog=gl.createProgram()
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
gl.linkProgram(prog);gl.useProgram(prog)
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
const a=gl.getAttribLocation(prog,'p')
gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
gl.uniform1i(gl.getUniformLocation(prog,'uNmap'),0)
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)`,
      check: (code) => /texture2D\(uNmap/.test(code) && /\*\s*2\.\s*-\s*1\./.test(code) && /normalize\(N\)/.test(code),
    },
"""

challenges["lesson5-2.js"] = r"""
    // ── Coding Challenge: ACES tonemapping ───────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Implement ACES Tonemapping

Without tonemapping, HDR values >1.0 clip to white. ACES rolls off highlights smoothly.

Implement the ACES approximation function and apply it:
\`\`\`glsl
vec3 aces(vec3 x){
  return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0);
}
\`\`\`

**Requirements:**
1. Define \`aces()\` with the formula above
2. Replace \`gl_FragColor = vec4(hdr, 1.0)\` with \`vec4(aces(hdr), 1.0)\``,
      html: `<canvas id="c" width="400" height="200" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),gl=c.getContext('webgl')
gl.viewport(0,0,c.width,c.height)
const vs=\\\`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}\\\`
const fs=\\\`precision mediump float;
varying vec2 v;
// TODO 1: vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.); }
void main(){
  vec3 hdr=vec3(v.x*3.,v.x*2.,v.x*1.5);
  // TODO 2: gl_FragColor=vec4(aces(hdr),1.)
  gl_FragColor=vec4(hdr,1.); // raw — clips to white
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
vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.);}
void main(){
  vec3 hdr=vec3(v.x*3.,v.x*2.,v.x*1.5);
  gl_FragColor=vec4(aces(hdr),1.);
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
      check: (code) => /2\.51/.test(code) && /2\.43/.test(code) && /aces\(hdr\)/.test(code),
    },
"""

challenges["lesson5-3.js"] = r"""
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
"""

challenges["lesson5-4.js"] = r"""
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
"""

challenges["lesson6-0.js"] = r"""
    // ── Coding Challenge: Robot arm hierarchy ────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Hierarchical Robot Arm with Canvas Transforms

Draw a 2-joint arm using \`ctx.save()\`/\`ctx.rotate()\`/\`ctx.translate()\`/\`ctx.restore()\` — the 2D equivalent of multiplying \`worldMatrix = parent.worldMatrix × localMatrix\`.

**Requirements:**
1. \`ctx.save()\` then \`ctx.rotate(shoulderAngle)\`
2. Draw upper arm, \`ctx.translate(armLen, 0)\`
3. \`ctx.rotate(elbowAngle)\`, draw forearm
4. \`ctx.restore()\``,
      html: `<canvas id="c" width="400" height="320" style="display:block;border-radius:8px;background:#0d0d18"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px;display:flex;justify-content:center}`,
      startCode: `const c=document.getElementById('c'),ctx=c.getContext('2d')
ctx.fillStyle='#0d0d18';ctx.fillRect(0,0,400,320)
const shoulderAngle=-Math.PI/6, elbowAngle=Math.PI/4, armLen=100
ctx.lineWidth=14;ctx.lineCap='round'
ctx.translate(200,300)
ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fillStyle='#7af';ctx.fill()

// TODO 1: ctx.save()
// TODO 2: ctx.rotate(shoulderAngle)
// TODO 3: draw upper arm: ctx.strokeStyle='#7af'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(armLen,0); ctx.stroke()
// TODO 4: ctx.translate(armLen, 0)
// TODO 5: draw elbow dot: ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fillStyle='#fa7'; ctx.fill()
// TODO 6: ctx.rotate(elbowAngle)
// TODO 7: draw forearm: ctx.strokeStyle='#fa7'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(armLen,0); ctx.stroke()
// TODO 8: ctx.restore()`,
      solutionCode: `const c=document.getElementById('c'),ctx=c.getContext('2d')
ctx.fillStyle='#0d0d18';ctx.fillRect(0,0,400,320)
const shoulderAngle=-Math.PI/6,elbowAngle=Math.PI/4,armLen=100
ctx.lineWidth=14;ctx.lineCap='round'
ctx.translate(200,300)
ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fillStyle='#7af';ctx.fill()
ctx.save()
ctx.rotate(shoulderAngle)
ctx.strokeStyle='#7af';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(armLen,0);ctx.stroke()
ctx.translate(armLen,0)
ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fillStyle='#fa7';ctx.fill()
ctx.rotate(elbowAngle)
ctx.strokeStyle='#fa7';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(armLen,0);ctx.stroke()
ctx.restore()`,
      check: (code) => /ctx\.save\(\)/.test(code) && /ctx\.rotate\(shoulderAngle\)/.test(code) && /ctx\.rotate\(elbowAngle\)/.test(code) && /ctx\.restore\(\)/.test(code),
    },
"""

challenges["lesson6-1.js"] = r"""
    // ── Coding Challenge: ECS particle update ────────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: ECS-Style Particle System

In a Structure-of-Arrays ECS, update N particles in one tight loop per component array.

**Requirements:**
1. \`for (let i = 0; i < N; i++)\`
2. \`px[i] += vx[i] * dt\` and \`py[i] += vy[i] * dt\`
3. Wrap X: \`if (px[i] > W) px[i] -= W; if (px[i] < 0) px[i] += W\`
4. Wrap Y similarly

300 dots should move and wrap around the canvas.`,
      html: `<canvas id="c" width="400" height="300" style="display:block;width:100%;border-radius:8px;background:#0d0d18"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:8px}`,
      startCode: `const c=document.getElementById('c'),ctx=c.getContext('2d')
const W=400,H=300,N=300
const px=new Float32Array(N).map(()=>Math.random()*W)
const py=new Float32Array(N).map(()=>Math.random()*H)
const vx=new Float32Array(N).map(()=>(Math.random()-.5)*2)
const vy=new Float32Array(N).map(()=>(Math.random()-.5)*2)
function update(dt){
  // TODO 1: for (let i = 0; i < N; i++) {
  // TODO 2:   px[i] += vx[i] * dt
  // TODO 3:   py[i] += vy[i] * dt
  // TODO 4:   if (px[i] > W) px[i] -= W; if (px[i] < 0) px[i] += W
  // TODO 5:   if (py[i] > H) py[i] -= H; if (py[i] < 0) py[i] += H
  // TODO 6: }
}
function draw(){
  ctx.fillStyle='#0d0d1888';ctx.fillRect(0,0,W,H)
  ctx.fillStyle='#7bf'
  for(let i=0;i<N;i++){ctx.beginPath();ctx.arc(px[i],py[i],2,0,Math.PI*2);ctx.fill()}
}
let last=performance.now()
function loop(now){const dt=(now-last)/16;last=now;update(dt);draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop)`,
      solutionCode: `const c=document.getElementById('c'),ctx=c.getContext('2d')
const W=400,H=300,N=300
const px=new Float32Array(N).map(()=>Math.random()*W)
const py=new Float32Array(N).map(()=>Math.random()*H)
const vx=new Float32Array(N).map(()=>(Math.random()-.5)*2)
const vy=new Float32Array(N).map(()=>(Math.random()-.5)*2)
function update(dt){
  for(let i=0;i<N;i++){
    px[i]+=vx[i]*dt; py[i]+=vy[i]*dt
    if(px[i]>W)px[i]-=W; if(px[i]<0)px[i]+=W
    if(py[i]>H)py[i]-=H; if(py[i]<0)py[i]+=H
  }
}
function draw(){
  ctx.fillStyle='#0d0d1888';ctx.fillRect(0,0,W,H)
  ctx.fillStyle='#7bf'
  for(let i=0;i<N;i++){ctx.beginPath();ctx.arc(px[i],py[i],2,0,Math.PI*2);ctx.fill()}
}
let last=performance.now()
function loop(now){const dt=(now-last)/16;last=now;update(dt);draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop)`,
      check: (code) => /px\[i\]\s*\+=\s*vx\[i\]\s*\*\s*dt/.test(code) && /py\[i\]\s*\+=\s*vy\[i\]\s*\*\s*dt/.test(code),
    },
"""

challenges["lesson6-2.js"] = r"""
    // ── Coding Challenge: Implement disposeScene ──────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Implement \`disposeScene\`

Complete the function that disposes every GPU resource in a scene graph, so \`renderer.info.memory\` reaches zero.

**Requirements:**
1. \`for (const node of scene.children)\`
2. \`node.geometry.dispose()\`
3. \`node.material.dispose()\`
4. \`if (node.material.map) node.material.map.dispose()\`

After calling \`disposeScene\`, the console should log \`{ geometries: 0, textures: 0 }\`.`,
      html: ``,
      css: `body{margin:0;padding:12px;font-family:monospace;font-size:13px;background:#0d0d18;color:#e2e8f0}`,
      startCode: `const renderer={info:{memory:{geometries:0,textures:0}}}
function makeNode(hasTex){
  renderer.info.memory.geometries++
  if(hasTex)renderer.info.memory.textures++
  return{
    geometry:{dispose(){renderer.info.memory.geometries--}},
    material:{dispose(){},map:hasTex?{dispose(){renderer.info.memory.textures--}}:null}
  }
}
const scene={children:[makeNode(true),makeNode(false),makeNode(true),makeNode(true)]}
console.log('Before:',JSON.stringify(renderer.info.memory))

function disposeScene(scene){
  // TODO 1: for (const node of scene.children)
  // TODO 2:   node.geometry.dispose()
  // TODO 3:   node.material.dispose()
  // TODO 4:   if (node.material.map) node.material.map.dispose()
}

disposeScene(scene)
console.log('After: ',JSON.stringify(renderer.info.memory)) // should be {"geometries":0,"textures":0}`,
      solutionCode: `const renderer={info:{memory:{geometries:0,textures:0}}}
function makeNode(hasTex){
  renderer.info.memory.geometries++
  if(hasTex)renderer.info.memory.textures++
  return{
    geometry:{dispose(){renderer.info.memory.geometries--}},
    material:{dispose(){},map:hasTex?{dispose(){renderer.info.memory.textures--}}:null}
  }
}
const scene={children:[makeNode(true),makeNode(false),makeNode(true),makeNode(true)]}
console.log('Before:',JSON.stringify(renderer.info.memory))
function disposeScene(scene){
  for(const node of scene.children){
    node.geometry.dispose()
    node.material.dispose()
    if(node.material.map)node.material.map.dispose()
  }
}
disposeScene(scene)
console.log('After: ',JSON.stringify(renderer.info.memory))`,
      check: (code) => /node\.geometry\.dispose\(\)/.test(code) && /node\.material\.dispose\(\)/.test(code) && /node\.material\.map\.dispose\(\)/.test(code),
    },
"""

challenges["lesson6-3.js"] = r"""
    // ── Coding Challenge: Build a render pipeline ─────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Assemble a Render Pipeline

Complete the \`RenderPipeline\` class and chain three passes in the correct order: shadows → main → tonemap.

**Requirements:**
1. \`add(pass)\` — push to \`this.passes\`, return \`this\` for chaining
2. \`render(state)\` — loop, skip disabled passes, call \`pass.execute(state)\`
3. Add passes: shadows, main, tonemap (in that order)

Console should print the three passes in sequence.`,
      html: ``,
      css: `body{margin:0;padding:12px;font-family:monospace;font-size:13px;background:#0d0d18;color:#e2e8f0}`,
      startCode: `class RenderPass{
  constructor(name,execute){this.name=name;this.execute=execute;this.enabled=true}
}
class RenderPipeline{
  constructor(){this.passes=[]}
  // TODO 1: add(pass){ this.passes.push(pass); return this }
  // TODO 2: render(state){ for(const pass of this.passes){ if(!pass.enabled)continue; pass.execute(state) } }
}
const pipeline=new RenderPipeline()
// TODO 3: pipeline
//   .add(new RenderPass('shadows', s=>console.log('1. Shadow pass')))
//   .add(new RenderPass('main',    s=>console.log('2. Main pass')))
//   .add(new RenderPass('tonemap', s=>console.log('3. Tonemap')))
pipeline.render({})`,
      solutionCode: `class RenderPass{
  constructor(name,execute){this.name=name;this.execute=execute;this.enabled=true}
}
class RenderPipeline{
  constructor(){this.passes=[]}
  add(pass){this.passes.push(pass);return this}
  render(state){for(const pass of this.passes){if(!pass.enabled)continue;pass.execute(state)}}
}
const pipeline=new RenderPipeline()
pipeline
  .add(new RenderPass('shadows',s=>console.log('1. Shadow pass')))
  .add(new RenderPass('main',   s=>console.log('2. Main pass')))
  .add(new RenderPass('tonemap',s=>console.log('3. Tonemap')))
pipeline.render({})`,
      check: (code) => /this\.passes\.push/.test(code) && /return this/.test(code) && /pass\.execute/.test(code) && code.includes("'shadows'") && code.includes("'main'") && code.includes("'tonemap'"),
    },
"""

challenges["lesson6-4.js"] = r"""
    // ── Coding Challenge: Normal debug visualiser ─────────────────────────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Normal Debug Visualiser

The classic first debugging tool: output surface normals as colour to verify they're correct.

Normals are -1..1; colours are 0..1. The mapping: \`colour = N * 0.5 + 0.5\`

**Requirements:**
1. Compute \`N\` from the sphere (the formula is provided — don't change it)
2. Replace the placeholder with: \`gl_FragColor = vec4(N * 0.5 + 0.5, 1.0)\`

Result: red=facing right, green=facing up, blue=facing you.`,
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
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  // TODO: gl_FragColor = vec4(N * 0.5 + 0.5, 1.0)
  gl_FragColor=vec4(.5,.5,.5,1.); // placeholder grey
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
      check: (code) => /N\s*\*\s*\.?5\s*\+\s*\.?5/.test(code),
    },
"""

# Process each file
for filename, challenge in challenges.items():
    path = os.path.join(BASE, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the closing of the cells array: `  ],\n}` followed by blank line then `export default`
    # Insert the coding challenge before `  ],`
    marker = '  ],\n}\n\nexport default'
    if marker not in content:
        print(f"WARNING: marker not found in {filename}")
        continue

    new_content = content.replace(marker, challenge + '  ],\n}\n\nexport default', 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filename}")

print("Done!")
