// Three.js · Chapter 6 · Lesson 4
// Debugging & Performance

const LESSON_3JS_6_4 = {
  title: 'Debugging & Performance',
  subtitle: 'Systematic GPU debugging methodology and performance profiling for real-time rendering.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## No exceptions. No stack traces. Silent wrong output.

A JavaScript bug throws an exception with a file name and line number. A GPU shader bug produces a black screen, wrong colours, or missing geometry — with no error message, no call stack, no indication of what went wrong.

GPU debugging requires a fundamentally different approach: **systematic visual inspection**. You make shader internals visible by outputting them as colours. You isolate variables. You bisect.

This lesson gives you a systematic debugging protocol that professional graphics engineers use — and the performance profiling workflow to find and fix bottlenecks.`,
    },

    // ── 1. Visual debugging ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Technique 1 — Visualize Shader Internals

The core debugging technique: **output internal values as colours**. Make the invisible visible.

\`\`\`glsl
// DEBUG: Visualize normals (should be smooth gradient, not hard edges)
gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);

// DEBUG: Visualize UVs (should be 0→1 gradient, red=U, green=V)
gl_FragColor = vec4(vUV, 0.0, 1.0);

// DEBUG: Visualize depth (brighter = closer)
float depth = gl_FragCoord.z;
gl_FragColor = vec4(vec3(1.0 - depth), 1.0);

// DEBUG: Visualize a specific computed value
float NdotL = max(0.0, dot(N, L));
gl_FragColor = vec4(vec3(NdotL), 1.0);

// DEBUG: Visualize shadow map value
float shadowDepth = texture2D(uShadowMap, shadowUV).r;
gl_FragColor = vec4(vec3(shadowDepth), 1.0);

// DEBUG: Check if value is out of expected range [0,1]
// Values > 1 appear as red, values < 0 appear as blue
float v = someValue;
if (v > 1.0) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // red = too high
else if (v < 0.0) gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // blue = too low
else gl_FragColor = vec4(v, v, v, 1.0);  // grey = in range
\`\`\``,
    },

    // ── 2. Shader debug visualizer ────────────────────────────────────────
    {
      type: 'js',
      id: 'debug-vis',
      html: `<canvas id="c-dbg" width="480" height="280" style="width:480px;height:280px;border-radius:8px;display:block;margin:auto;background:#0d0d12"></canvas>
<div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap">
  <button id="d-final" style="background:#7bf3;color:#fff;border:1px solid #7bf;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Final</button>
  <button id="d-normals" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Normals</button>
  <button id="d-uvs" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">UVs</button>
  <button id="d-ndotl" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">N·L</button>
  <button id="d-depth" style="background:#222;color:#ccc;border:1px solid #444;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:monospace">Depth</button>
</div>`,
      startCode: `const c=document.getElementById('c-dbg');
const gl=c.getContext('webgl');
const vs=\`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0,1);}\`;
const fs=\`precision mediump float;
varying vec2 vUV;
uniform int uMode;
void main(){
  vec2 uv=vUV*2.-1.;
  float r2=dot(uv,uv);
  if(r2>1.){gl_FragColor=vec4(.05,.05,.07,1);return;}
  vec3 N=normalize(vec3(uv,sqrt(1.-r2)));
  vec3 fPos=N;
  vec3 L=normalize(vec3(1.5,2.,2.)-fPos*0.);
  vec3 V=normalize(vec3(0,0,3)-fPos);
  vec3 H=normalize(L+V);
  float NdL=max(0.,dot(N,L));

  if(uMode==0){
    // Final shaded
    vec3 albedo=vec3(.8,.3,.1);
    vec3 lCol=vec3(1.,.95,.85);
    vec3 amb=.15*vec3(.4,.5,.7);
    float spec=pow(max(0.,dot(N,H)),64.);
    gl_FragColor=vec4((amb+.8*lCol*NdL)*albedo+.6*lCol*spec,1);
  } else if(uMode==1){
    // Normals debug
    gl_FragColor=vec4(N*.5+.5,1);
  } else if(uMode==2){
    // UV debug
    gl_FragColor=vec4(vUV,0,1);
  } else if(uMode==3){
    // N·L debug
    gl_FragColor=vec4(vec3(NdL),1);
  } else {
    // Depth approximation
    float d=1.-sqrt(r2)*.5;
    gl_FragColor=vec4(vec3(d),1);
  }
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
const modes=['final','normals','uvs','ndotl','depth'];
modes.forEach((m,i)=>{
  document.getElementById('d-'+m).onclick=()=>{
    gl.uniform1i(uMode,i);
    gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    modes.forEach(x=>{
      document.getElementById('d-'+x).style.background=x===m?'#7bf3':'#222';
      document.getElementById('d-'+x).style.borderColor=x===m?'#7bf':'#444';
    });
  };
});
gl.uniform1i(uMode,0);
gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_STRIP,0,4);`,
    },

    // ── 3. Shader compilation errors ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Technique 2 — Check Shader Compilation Errors

WebGL silently uses a default shader when compilation fails. Always check:

\`\`\`javascript
function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader))
    console.error('Source:', source.split('\\n').map((l, i) =>
      \`\${i + 1}: \${l}\`).join('\\n'))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function linkProgram(gl, vs, fs) {
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Link error:', gl.getProgramInfoLog(program))
    return null
  }
  return program
}
\`\`\`

**Common shader errors:**
- Missing \`precision\` declaration → \`precision mediump float;\` at top of fragment shader
- Mismatched varying names between vertex and fragment shader
- Using undefined uniforms (no error, but uniform location is \`-1\`)`,
    },

    // ── 4. Performance profiling ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Performance Profiling — Find the Bottleneck

There are four possible bottlenecks. They require different fixes:

| Bottleneck | Symptom | Fix |
|------------|---------|-----|
| **CPU draw calls** | High renderer.info.render.calls, GPU underloaded | Merge meshes, instancing, frustum culling |
| **Vertex throughput** | GPU busy on VS stage | Reduce polygon count, LOD |
| **Fragment ALU** | GPU busy on FS stage, shader has many instructions | Simplify shader, lower texture lookups |
| **Memory bandwidth** | Many large textures, overdraw | Compress textures, reduce overdraw, texture atlases |

**Ablation test approach:**
\`\`\`javascript
// Halve fragment shader cost (simplify or replace with constant)
// If fps doubles → fragment bound
// If fps doesn't change → bottleneck is elsewhere

// Set all materials to MeshBasicMaterial temporarily
scene.traverse(obj => {
  if (obj.isMesh) {
    obj._savedMaterial = obj.material
    obj.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  }
})
// If fps jumps dramatically → fragment bound (complex shaders)
\`\`\``,
    },

    // ── 5. Performance monitor ────────────────────────────────────────────
    {
      type: 'js',
      id: 'perf-monitor',
      html: `<canvas id="c-perf" width="480" height="260" style="width:480px;height:260px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px;flex-wrap:wrap">
  <label>Fragment complexity: <input id="fc" type="range" min="1" max="100" value="10" style="width:120px"> <span id="fc-v">10</span>×</label>
  <label>Object count: <input id="oc" type="range" min="10" max="2000" value="200" style="width:120px"> <span id="oc-v">200</span></label>
</div>`,
      startCode: `const c=document.getElementById('c-perf');
const ctx=c.getContext('2d');
const W=480,H=260;
const fcEl=document.getElementById('fc');
const ocEl=document.getElementById('oc');
const fpsHistory=new Array(60).fill(60);
let lastT=performance.now(),frames=0,fps=60;

let objects=[];
function initObjects(n){
  objects=[];
  for(let i=0;i<n;i++){
    objects.push({
      x:Math.random()*W,y:Math.random()*H,
      r:3+Math.random()*8,
      vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,
      hue:Math.random()*360,
      complexity:0
    });
  }
}
initObjects(200);
ocEl.addEventListener('input',()=>{
  document.getElementById('oc-v').textContent=ocEl.value;
  initObjects(parseInt(ocEl.value));
});
fcEl.addEventListener('input',()=>{
  document.getElementById('fc-v').textContent=fcEl.value;
});

function frame(t){
  const dt=Math.min((t-lastT)/16,3);
  const elapsed=t-lastT;
  lastT=t;
  frames++;

  // FPS calculation
  if(frames%10===0){
    fps=10000/elapsed/10||60;
    fpsHistory.shift();fpsHistory.push(Math.min(fps,120));
  }

  // Simulate "complex fragment work" — busy loop
  const fc=parseInt(fcEl.value);
  let dummy=0;
  for(let i=0;i<fc*500;i++) dummy+=Math.sin(i*.001);

  // Update and draw
  ctx.fillStyle='rgba(13,13,18,0.6)';ctx.fillRect(0,0,W,H);

  objects.forEach(o=>{
    o.x+=o.vx*dt;o.y+=o.vy*dt;
    if(o.x<0||o.x>W) o.vx*=-1;
    if(o.y<0||o.y>H) o.vy*=-1;
    ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
    ctx.fillStyle=\`hsl(\${o.hue},70%,50%)\`;ctx.fill();
  });

  // FPS graph
  const GX=10,GY=H-80,GW=W-20,GH=60;
  ctx.fillStyle='#0a0a10';ctx.fillRect(GX,GY,GW,GH);
  ctx.strokeStyle='#333';ctx.lineWidth=1;
  ctx.strokeRect(GX,GY,GW,GH);
  // Target line
  ctx.strokeStyle='#7f92';ctx.beginPath();
  ctx.moveTo(GX,GY+GH*(1-60/120));ctx.lineTo(GX+GW,GY+GH*(1-60/120));
  ctx.stroke();

  ctx.strokeStyle=fps>50?'#7f9':fps>30?'#fa7':'#f87';
  ctx.lineWidth=2;ctx.beginPath();
  fpsHistory.forEach((f,i)=>{
    const x=GX+i/60*GW;
    const y=GY+GH*(1-Math.min(f,120)/120);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 12px monospace';
  ctx.fillText(\`FPS: \${Math.round(fps)} | Objects: \${objects.length} | Fragment load: \${fc}×\`,GX+4,GY-6);
  ctx.fillStyle='#7f92';ctx.font='10px monospace';
  ctx.fillText('60fps target',GX+GW+4,GY+GH*(1-60/120)+3);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);`,
    },

    // ── 6. renderer.info reference ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## renderer.info — Your Real-Time Dashboard

\`\`\`javascript
const info = renderer.info

// GPU memory
info.memory.geometries    // vertex buffers on GPU
info.memory.textures      // textures on GPU

// Per-frame rendering stats (reset each frame)
info.render.calls         // draw calls — should be < 500
info.render.triangles     // triangles rendered
info.render.points        // points
info.render.lines         // lines
info.render.frame         // frame count

// Performance targets for 60fps on mid-range hardware
// Draw calls: < 500
// Triangles: < 2M visible triangles per frame
// Textures: < 100 (avoid exceeding GPU texture cache)
\`\`\`

**Useful browser tools:**
- **Chrome DevTools → Performance tab** — JS execution timeline, GPU frame time
- **Chrome SpectorJS extension** — WebGL draw call capture and replay
- **Stats.js library** — FPS / memory meter overlay
\`\`\`javascript
import Stats from 'three/addons/libs/stats.module.js'
const stats = new Stats()
document.body.appendChild(stats.dom)
// In animation loop:
stats.begin()
renderer.render(scene, camera)
stats.end()
\`\`\``,
    },

    // ── 7. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-debug-black',
      instruction: 'Your scene renders completely black. The first debugging step should be:',
      options: [
        { label: 'A', text: 'Check the browser console for shader compilation errors — a failed shader silently produces black' },
        { label: 'B', text: 'Increase the ambient light intensity — black usually means no ambient light' },
        { label: 'C', text: 'Set gl_FragColor = vec4(1,0,0,1) (red) in the fragment shader to confirm it\'s being reached' },
        { label: 'D', text: 'Both A and C — check shader errors AND confirm the fragment shader executes' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-bottleneck',
      instruction: 'Your scene runs at 30fps. You halve the fragment shader instruction count — fps barely changes. You then reduce the object count from 5000 to 500 — fps doubles to 60. What was the bottleneck?',
      options: [
        { label: 'A', text: 'Fragment ALU — the shader was too complex' },
        { label: 'B', text: 'CPU draw call overhead — 5000 objects meant 5000 draw calls, saturating the CPU-GPU command submission' },
        { label: 'C', text: 'Memory bandwidth — 5000 texture reads per frame exceeded the GPU cache' },
        { label: 'D', text: 'Vertex throughput — 5000 objects have too many triangles combined' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 9. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-normals-debug',
      instruction: 'You output vNormal * 0.5 + 0.5 as colour for debugging. You see sharp, hard edges between triangles instead of smooth gradients. What does this indicate?',
      options: [
        { label: 'A', text: 'The normals are correct — hard edges are expected for a low-polygon mesh' },
        { label: 'B', text: 'The geometry is using flat (per-face) normals instead of smooth (per-vertex) normals — call geometry.computeVertexNormals()' },
        { label: 'C', text: 'The normal matrix is not being applied — normals are in world space instead of view space' },
        { label: 'D', text: 'The vNormal varying is not being interpolated — add "smooth" qualifier to the varying declaration' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

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
  ],
}

export default {
  id: 'three-js-6-4-debugging-performance',
  slug: 'debugging-and-performance',
  chapter: 'three-js.6',
  order: 4,
  title: 'Debugging & Performance',
  subtitle: 'Systematic GPU debugging methodology and performance profiling for real-time rendering.',
  tags: ['three-js', 'debugging', 'performance', 'profiling', 'draw-calls', 'overdraw'],
  hook: {
    question: 'Your scene runs at 25fps. The fragment shader has 300 instructions. You halve them to 150 — but fps barely changes. What is the actual bottleneck, and how do you diagnose it?',
    realWorldContext: 'GPU debugging is uniquely hard: no exceptions, no stack traces, silent wrong outputs. Every professional graphics engineer has a systematic debugging protocol.',
  },
  intuition: {
    prose: 'Debug: gl_FragColor = internal value as colour. Check shader compile errors. Bottlenecks: draw calls (reduce count), vertex (LOD), fragment (simplify shader), bandwidth (compress tex). renderer.info for stats.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Debugging & Performance', props: { lesson: LESSON_3JS_6_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Debug: output values as colour. Check gl.getShaderInfoLog(). Bottleneck ablation: halve cost → if fps changes, you found it. renderer.info.render.calls<500, .memory.textures for monitoring.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_6_4 }
