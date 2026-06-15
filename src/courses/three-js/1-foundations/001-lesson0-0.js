// Three.js · Chapter 0 · Lesson 0
// GPU vs CPU: The Hardware Divide

const LESSON_3JS_0_0 = {
  title: 'GPU vs CPU: The Hardware Divide',
  subtitle: 'Why graphics uses a completely different processor — and what that means for everything you will write.',
  sequential: true,

  cells: [

    // ── Section 1 ────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Why Does Your Computer Have Two Processors?

Open your task manager right now and you will see two entries that look like hardware duplicates: a CPU and a GPU. Both compute. Both have cores. Both have memory. So why do they both exist?

The answer is not "GPUs are newer." The answer is about **the shape of the problem**.

A CPU is designed for **latency-sensitive, serial workloads** — tasks where each step depends on the result of the previous step. Fetching a web page, running your operating system, parsing JSON, executing game logic. These tasks need a small number of extremely powerful cores, each capable of executing arbitrary code as fast as possible, with large caches to minimise wait time.

A GPU is designed for **throughput-sensitive, parallel workloads** — tasks where the exact same operation must be applied to millions of items simultaneously, and each computation is independent. Rendering a 1080p frame means computing a colour for 2,073,600 pixels. A 4K frame: 8,294,400 pixels. Every frame. 60 times per second. Crucially — each pixel's colour can be computed **independently** of every other pixel's colour.

This is the insight that makes GPUs exist: **when a problem has massive parallelism, you trade per-unit speed for raw count of units.**

A modern GPU has thousands of shader cores — individually simple processors, much slower than a CPU core. But they all execute simultaneously. The GPU wins by sheer volume of parallel work.

**The consequence for graphics programming:** Every shader you write is a tiny program that runs *simultaneously on thousands of GPU cores*. You write it once for a single vertex or pixel. The GPU runs it millions of times per frame. This shapes every decision you make as a graphics programmer.`,
    },

    // ── Visual 1 — CPU vs GPU parallel simulation ─────────────────────────
    {
      type: 'js',
      instruction: `### CPU vs GPU: The Parallel Processing DifferenceIn this simulation both sides must "render" 256 pixel blocks. The CPU processes them **sequentially** (one small group at a time across 8 cores). The GPU processes **all of them simultaneously**. Press **Run** and watch the frame rate difference emerge directly from parallelism — not from raw clock speed.`,
      html: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 0;background:#0a0f1e">
  <div style="display:flex;gap:8px">
    <button id="btn-run" style="padding:7px 22px;border-radius:8px;border:none;background:#38bdf8;color:#0a0f1e;font-family:monospace;font-weight:700;font-size:13px;cursor:pointer">▶ Run</button>
    <button id="btn-reset" style="padding:7px 22px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.6);font-family:monospace;font-weight:700;font-size:13px;cursor:pointer">↺ Reset</button>
  </div>
  <canvas id="cv" width="680" height="300"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;border-radius:10px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var COLS=16,ROWS=16,TOTAL=COLS*ROWS;
var running=false,cpuIdx=0,cpuFrames=0,gpuFrames=0;
var animId=null,startT=null;

document.getElementById('btn-run').onclick=function(){
  if(running)return;
  running=true;startT=performance.now();
  cpuIdx=0;cpuFrames=0;gpuFrames=0;
  loop();
};
document.getElementById('btn-reset').onclick=function(){
  running=false;cpuIdx=0;cpuFrames=0;gpuFrames=0;startT=null;
  if(animId)cancelAnimationFrame(animId);animId=null;
  draw();
};

function loop(){
  if(!running)return;
  // CPU: 3 blocks per animation frame (simulates serial processing across 8 cores)
  cpuIdx+=3;
  if(cpuIdx>=TOTAL){cpuFrames++;cpuIdx=0;}
  // GPU: finishes ALL blocks every single frame (massive parallelism)
  gpuFrames++;
  draw();
  animId=requestAnimationFrame(loop);
}

function drawPanel(ox,oy,w,h,title,sub,doneCount,isGPU,frames){
  var CELL=Math.floor((w-12)/COLS);
  var gridW=CELL*COLS,gridH=CELL*ROWS;
  var gx=ox+(w-gridW)/2,gy=oy+52;

  // Panel background
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(ox,oy,w,h,10);ctx.fill();ctx.stroke();

  // Title
  ctx.fillStyle=isGPU?'#4ade80':'#38bdf8';
  ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText(title,ox+w/2,oy+20);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
  ctx.fillText(sub,ox+w/2,oy+37);

  // Pixel blocks
  for(var i=0;i<TOTAL;i++){
    var col=i%COLS,row=Math.floor(i/COLS);
    var bx=gx+col*CELL,by=gy+row*CELL;
    var lit=isGPU?running:(i<doneCount);
    var isActive=!isGPU&&i===doneCount-1&&running;

    if(isActive){ctx.shadowColor='#38bdf8';ctx.shadowBlur=10;}
    if(lit){
      ctx.fillStyle=isGPU?'rgba(74,222,128,0.75)':(isActive?'#38bdf8':'rgba(56,189,248,0.5)');
    }else{
      ctx.fillStyle='rgba(255,255,255,0.07)';
    }
    ctx.fillRect(bx+1,by+1,CELL-2,CELL-2);
    ctx.shadowBlur=0;
  }

  // Frame counter
  if(running||frames>0){
    var elapsed=startT?((performance.now()-startT)/1000):0;
    var fps=elapsed>0?Math.round(frames/elapsed):0;
    ctx.fillStyle=isGPU?'#4ade80':'#38bdf8';
    ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('Frames: '+frames+(fps>0?' \u2248'+fps+' fps':''),ox+w/2,oy+h-8);
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  drawPanel(20,8,290,280,'\uD83D\uDDA5\uFE0F  CPU','8 cores — sequential',cpuIdx,false,cpuFrames);
  drawPanel(W-310,8,290,280,'\u26A1 GPU','~3000 cores — all at once',TOTAL,true,gpuFrames);

  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='bold 20px monospace';ctx.textAlign='center';
  ctx.fillText('VS',W/2,H/2-6);

  if(!running&&gpuFrames===0){
    ctx.fillStyle='rgba(255,255,255,0.22)';ctx.font='11px monospace';
    ctx.fillText('Press Run to start',W/2,H/2+18);
  }
}
draw();`,
      outputHeight: 370,
    },

    // ── Challenge 1 ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A GPU has 3,584 shader cores each at 1.8 GHz. A CPU has 16 cores at 5 GHz. You must compute a colour value for each of 2 million pixels — every pixel is fully independent. Which statement best explains why the GPU wins this task?`,
      options: [
        { label: 'A', text: 'The GPU wins because its aggregate clock speed (3584 × 1.8 GHz) is higher than the CPU\'s' },
        { label: 'B', text: 'The GPU wins because each computation is independent — all 3,584 cores run different pixels simultaneously. CPU runs 16 at most, GPU runs 3,584 per cycle. Independence enables parallelism; parallelism enables the GPU.' },
        { label: 'C', text: 'The GPU wins because it has a larger cache than the CPU, reducing memory stalls' },
        { label: 'D', text: 'The GPU wins because it has a higher per-core clock frequency than the CPU' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! The key is task independence. Each pixel colour has no dependency on any other, so all shader cores can work on different pixels simultaneously. GPU: 3,584 cores → ~559 batches to process 2M pixels. CPU: 16 cores → ~125,000 batches. The GPU\'s per-core slowness is irrelevant — it compensates with two orders of magnitude more parallel execution units. This insight is the foundation of all GPU architecture.',
      failMessage: 'Aggregate GHz comparisons and cache size are not the reason here. The reason is task independence. Pixel colour computations are "embarrassingly parallel" — no pixel needs any other pixel\'s result. This means the GPU can assign a different pixel to every one of its 3,584 cores simultaneously. 3,584 vs 16 simultaneous workers on the same task: the math favours the GPU by ~224×, despite each GPU core being slower per operation.',
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 310,
    },

    // ── Section 2 ────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Rendering Pipeline: From 3D Data to Pixels

When you call a draw command, the GPU executes a fixed sequence of stages called the **rendering pipeline**. Every shader you write, every buffer you create, every texture you bind maps precisely onto one of these five stages.

**① Vertex Shader** — Runs once per vertex. Takes your 3D position data and transforms it into screen-space coordinates. This is where the Model-View-Projection (MVP) matrix multiplication happens. You write this in GLSL; it runs in parallel across all vertices simultaneously.

**② Primitive Assembly** — The GPU connects your transformed vertices into triangles (or lines or points) using your index buffer. You don't write code for this stage — it is fixed hardware logic.

**③ Rasterisation** — The GPU determines which screen pixels fall inside each triangle. For a triangle covering 10,000 pixels, the rasteriser generates 10,000 "fragments" (pixel candidates). This is where your scene's complexity multiplies: one triangle → potentially thousands of fragments.

**④ Fragment Shader** — Runs once per fragment (once per screen pixel covered by a triangle). You decide what colour that pixel should be. This is where texture sampling, lighting calculations, and nearly all visual effects live. On a complex scene, this stage runs hundreds of millions of times per second.

**⑤ Output Merger** — Combines each fragment's computed colour with the existing framebuffer. Depth testing (which triangle is closest to the camera?) and alpha blending (transparency) happen here, using hardware-fixed logic you configure via state.

**The critical mental model:** You write code for stages ① and ④ only. The GPU hardware executes stages ②, ③, and ⑤ automatically based on your geometry and render state. Between the vertex stage and the fragment stage, the rasteriser amplifies your vertex count by the screen-space area of each triangle.`,
    },

    // ── Visual 2 — Pipeline diagram ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The GPU Rendering Pipeline — Interactive\n\nClick any stage to reveal what happens there and which Three.js API corresponds to it. The animated dot shows data flowing from vertex data to framebuffer output.`,
      html: `<canvas id="cv" width="700" height="300" style="cursor:pointer"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0,selected=-1;

var stages=[
  {name:'Vertex\\nShader',emoji:'\uD83D\uDCB9',color:'#38bdf8',
   threejs:'ShaderMaterial\\n.vertexShader',youWrite:true,
   desc:'Runs once per vertex. Transforms 3D position to clip space. You write GLSL here.'},
  {name:'Primitive\\nAssembly',emoji:'\uD83D\uDD3A',color:'#a78bfa',
   threejs:'geometry.setIndex()\\n(EBO)',youWrite:false,
   desc:'Connects vertices into triangles using index buffer. Fixed hardware — no code needed.'},
  {name:'Raster-\\nisation',emoji:'\uD83D\uDD33',color:'#fb923c',
   threejs:'(automatic)\\npoint/line/fill',youWrite:false,
   desc:'Determines which pixels are inside each triangle. Generates one fragment per pixel.'},
  {name:'Fragment\\nShader',emoji:'\uD83C\uDFA8',color:'#f87171',
   threejs:'ShaderMaterial\\n.fragmentShader',youWrite:true,
   desc:'Runs once per pixel covered. Computes final colour — textures, lighting, effects.'},
  {name:'Output\\nMerger',emoji:'\u2705',color:'#4ade80',
   threejs:'material.depthTest\\nmaterial.blending',youWrite:false,
   desc:'Depth test (front vs back) and alpha blend. Writes winning colour to framebuffer.'},
];

var N=stages.length;
var SW=108,SH=72,GAP=26;
var totalW=N*SW+(N-1)*GAP;
var startX=(W-totalW)/2,stageY=90;

function getX(i){return startX+i*(SW+GAP);}

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(W/rect.width);
  var my=(e.clientY-rect.top)*(H/rect.height);
  for(var i=0;i<N;i++){
    var sx=getX(i);
    if(mx>=sx&&mx<=sx+SW&&my>=stageY&&my<=stageY+SH){selected=selected===i?-1:i;return;}
  }
  selected=-1;
};

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Header
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('The GPU Rendering Pipeline — Click a stage',W/2,22);
  ctx.fillStyle='rgba(255,255,255,0.22)';ctx.font='10px monospace';
  ctx.fillText('Three.js API shown beneath each stage',W/2,38);

  // Animated dot
  var period=260;
  var pos=(t%period)/period;
  var dotStage=Math.floor(pos*N);
  var dotFrac=(pos*N)%1;
  var dsx=getX(Math.min(dotStage,N-1))+SW/2;
  var dex=dotStage<N-1?getX(dotStage+1)+SW/2:dsx;
  var dotX=dsx+(dex-dsx)*dotFrac;
  var dotY=stageY+SH/2;
  var dotColor=stages[Math.min(dotStage,N-1)].color;

  // Arrows
  for(var i=0;i<N-1;i++){
    var ax=getX(i)+SW,ay=stageY+SH/2,bx=getX(i+1);
    ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,ay);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-8,ay-5);ctx.lineTo(bx,ay);ctx.lineTo(bx-8,ay+5);
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();
  }

  // Stages
  for(var j=0;j<N;j++){
    var s=stages[j];
    var sx=getX(j),sy=stageY;
    var isSel=selected===j;
    var isAct=j===Math.min(dotStage,N-1);

    if(isAct){ctx.shadowColor=s.color;ctx.shadowBlur=18;}
    ctx.fillStyle=isSel?s.color+'30':'rgba(255,255,255,0.05)';
    ctx.strokeStyle=isSel?s.color:isAct?s.color+'aa':'rgba(255,255,255,0.14)';
    ctx.lineWidth=isSel?2.5:isAct?2:1;
    ctx.beginPath();ctx.roundRect(sx,sy,SW,SH,8);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;

    // "YOU WRITE" badge
    if(s.youWrite){
      ctx.fillStyle=s.color;ctx.font='bold 7px monospace';ctx.textAlign='left';
      ctx.fillText('YOU WRITE',sx+5,sy+13);
    }

    // Emoji
    ctx.font='20px sans-serif';ctx.textAlign='center';
    ctx.fillText(s.emoji,sx+SW/2,sy+SH/2+4);

    // Name
    ctx.fillStyle=isSel?s.color:'rgba(255,255,255,0.8)';
    ctx.font='bold 8px monospace';ctx.textAlign='center';
    s.name.split('\\n').forEach(function(part,pi,arr){
      ctx.fillText(part,sx+SW/2,sy+SH-14+(pi-arr.length+1)*11);
    });

    // Three.js label below box
    ctx.fillStyle='rgba(255,255,255,0.28)';ctx.font='8px monospace';
    s.threejs.split('\\n').forEach(function(part,pi){
      ctx.fillText(part,sx+SW/2,sy+SH+13+pi*11);
    });
  }

  // Animated dot
  ctx.beginPath();ctx.arc(dotX,dotY,7,0,Math.PI*2);
  ctx.fillStyle=dotColor;ctx.shadowColor=dotColor;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;

  // Info box for selected stage
  if(selected>=0){
    var sel=stages[selected];
    var bx=40,by=stageY+SH+50,bw=W-80,bh=66;
    ctx.fillStyle=sel.color+'18';ctx.strokeStyle=sel.color+'55';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();ctx.stroke();
    ctx.fillStyle=sel.color;ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText(sel.emoji+' '+sel.name.replace('\\n',' ')+(sel.youWrite?' \u2014 YOU WRITE THIS':' \u2014 Fixed Hardware'),bx+12,by+22);
    ctx.fillStyle='rgba(255,255,255,0.65)';ctx.font='11px monospace';
    ctx.fillText(sel.desc,bx+12,by+42);
    ctx.fillStyle='rgba(255,255,255,0.38)';ctx.font='10px monospace';
    ctx.fillText('Three.js: '+sel.threejs.replace('\\n',' '),bx+12,by+58);
  }else{
    ctx.fillStyle='rgba(255,255,255,0.22)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('\u2191 Click any stage to learn more',W/2,stageY+SH+68);
  }

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 350,
    },

    // ── Challenge 2 ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You have a scene with 200 triangles. After rasterisation, the average triangle covers 8,000 screen pixels. The scene runs at 60 fps. Approximately how many times does the fragment shader execute per second?`,
      options: [
        { label: 'A', text: '12,000 times/sec — once per triangle per frame (200 × 60)' },
        { label: 'B', text: '1,600,000 times/sec — once per pixel per frame without the fps factor' },
        { label: 'C', text: '96,000,000 times/sec — 200 triangles × 8,000 pixels × 60 fps' },
        { label: 'D', text: '480,000 times/sec — once per triangle–pixel pair per frame' },
      ],
      check: (label) => label === 'C',
      successMessage: "Correct! The fragment shader fires once per pixel covered, not once per triangle. Rasterisation converts each triangle into thousands of fragments. 200 × 8,000 = 1,600,000 pixels per frame. At 60 fps: 1,600,000 × 60 = 96,000,000 per second. Even a microsecond of wasted work per fragment costs 96 seconds of GPU time per second — 96× real time. This is exactly why fragment shader optimisation matters so much.",
      failMessage: "The fragment shader runs once per screen pixel covered by a triangle — not once per triangle. Rasterisation is the multiplier. Each triangle becomes up to thousands of fragments. 200 triangles × 8,000 pixels each = 1,600,000 pixels per frame × 60 fps = 96 million executions per second. This massive scale is why techniques like early-z culling (discarding fragments before the fragment shader) and draw call batching exist.",
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 310,
    },

    // ── Section 3 ────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Where Does Three.js Sit in the Stack?

Raw WebGL (the browser's low-level 3D API) exposes the rendering pipeline directly. You manually:

- Allocate and populate vertex buffers with typed arrays
- Write GLSL shader source as plain strings
- Compile each shader, link them into a program, and check compile errors
- Locate each uniform and attribute by index, then set their values
- Configure depth test, blending, and viewport state before every draw call
- Issue gl.drawElements(...) with the correct primitive type, count, and offset

A simple rotating cube in raw WebGL is 300–500 lines of careful boilerplate before anything appears on screen. Every mistake is a blank canvas with no error message.

**Three.js** wraps this pipeline with higher-level abstractions — here is the exact mapping:

| Pipeline Concept | Raw WebGL | Three.js |
|---|---|---|
| Vertex data | gl.createBuffer() + bufferData() | BufferGeometry |
| Index buffer | ElementArrayBuffer | geometry.setIndex() |
| Vertex shader | GLSL source string | ShaderMaterial.vertexShader |
| Fragment shader | GLSL source string | ShaderMaterial.fragmentShader |
| Shader uniforms | gl.uniform1f(loc, v) | uniforms: { key: { value: v } } |
| Camera matrices | Build 4×4 Float32Array manually | PerspectiveCamera |
| Lighting in GLSL | Write Phong / PBR by hand | MeshStandardMaterial |
| Draw call | gl.drawElements(...) | renderer.render(scene, camera) |

**The philosophy of this course:** You will learn both levels. For each concept, first see and understand the raw pipeline mechanism — why it works, what the GPU is actually doing. Then use Three.js to apply it efficiently. By the end, you will not be a Three.js user who copies documentation — you will be a **graphics programmer** who understands what Three.js does on your behalf, and knows exactly when to bypass it with raw GLSL.`,
    },

    // ── Visual 3 — Abstraction stack ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### The Graphics Software Stack\n\nHover over each layer to understand what you interact with at that level — and how much Three.js hides for you.`,
      html: `<canvas id="cv" width="700" height="310" style="cursor:pointer"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var hovered=-1;

var layers=[
  {label:'Your Application Code',
   sub:'Game logic, scene management, user input, animation',
   color:'#38bdf8',
   detail:'You are here. You create meshes, lights, cameras, and update them each frame. Three.js handles the rest below.'},
  {label:'Three.js',
   sub:'Scene, BufferGeometry, Material, WebGLRenderer, Camera',
   color:'#a78bfa',
   detail:'Manages the scene graph, builds WebGL buffers from your geometry, calls the correct gl.* functions for you.'},
  {label:'WebGL 2 API',
   sub:'gl.createBuffer(), gl.drawElements(), gl.uniform*(), gl.useProgram()',
   color:'#fb923c',
   detail:'The raw browser GPU interface. Talks directly to the GPU driver. This course shows you how to use it beneath Three.js.'},
  {label:'GPU Driver + Shader Compiler',
   sub:'Compiles your GLSL \u2192 GPU machine code, schedules work on cores',
   color:'#f87171',
   detail:'The driver takes your GLSL text, compiles it to GPU assembly, and dispatches it to shader cores. You write GLSL; it runs here.'},
  {label:'GPU Hardware',
   sub:'Shader cores, rasteriser, texture units, VRAM, framebuffer',
   color:'#4ade80',
   detail:'The silicon. Thousands of cores executing your compiled shader in parallel. 60+ frames per second of rasterised geometry.'},
];

var N=layers.length;
var LH=46,GAP=5;
var totalH=N*(LH+GAP);
var SX=40,SY=32,LW=W-80;

canvas.onmousemove=function(e){
  var rect=canvas.getBoundingClientRect();
  var my=(e.clientY-rect.top)*(H/rect.height);
  var found=-1;
  for(var i=0;i<N;i++){var ly=SY+i*(LH+GAP);if(my>=ly&&my<=ly+LH){found=i;break;}}
  if(found!==hovered){hovered=found;render();}
};
canvas.onmouseleave=function(){hovered=-1;render();};

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('The Graphics Software Stack \u2014 Hover a layer',W/2,20);

  for(var i=0;i<N;i++){
    var l=layers[i];
    var ly=SY+i*(LH+GAP);
    var hov=hovered===i;

    ctx.fillStyle=hov?l.color+'24':'rgba(255,255,255,0.05)';
    ctx.strokeStyle=hov?l.color:l.color+'55';ctx.lineWidth=hov?2:1;
    ctx.beginPath();ctx.roundRect(SX,ly,LW,LH,6);ctx.fill();ctx.stroke();

    // Left accent strip
    ctx.fillStyle=l.color;
    ctx.beginPath();ctx.roundRect(SX,ly,5,LH,3);ctx.fill();

    // Text
    ctx.fillStyle=hov?l.color:'rgba(255,255,255,0.85)';
    ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText(l.label,SX+16,ly+17);
    ctx.fillStyle='rgba(255,255,255,0.38)';ctx.font='10px monospace';
    ctx.fillText(l.sub,SX+16,ly+33);

    // Layer number
    ctx.fillStyle=l.color+'88';ctx.font='bold 18px monospace';ctx.textAlign='right';
    ctx.fillText(i+1,SX+LW-10,ly+LH/2+7);

    // Connector arrow
    if(i<N-1){
      ctx.fillStyle='rgba(255,255,255,0.18)';ctx.font='11px monospace';ctx.textAlign='center';
      ctx.fillText('\u2193',SX+LW/2,ly+LH+GAP/2+7);
    }
  }

  // Detail box
  var detailY=SY+N*(LH+GAP)+8;
  if(hovered>=0){
    var sel=layers[hovered];
    ctx.fillStyle=sel.color+'18';ctx.strokeStyle=sel.color+'44';ctx.lineWidth=1;
    ctx.beginPath();ctx.roundRect(SX,detailY,LW,48,8);ctx.fill();ctx.stroke();
    ctx.fillStyle=sel.color;ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText('\u2192 '+sel.detail,SX+12,detailY+20);
    // wrap second line if long
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px monospace';
    if(hovered===0)ctx.fillText('This is your primary working surface throughout this course.',SX+12,detailY+38);
    if(hovered===1)ctx.fillText('Three.js removes ~400 lines of WebGL boilerplate from a basic scene.',SX+12,detailY+38);
    if(hovered===2)ctx.fillText('Using ShaderMaterial brings you back to this layer while keeping Three.js above it.',SX+12,detailY+38);
    if(hovered===3)ctx.fillText('GLSL compilation errors appear here \u2014 no exception, just a blank screen.',SX+12,detailY+38);
    if(hovered===4)ctx.fillText('Every optimization technique ultimately targets reducing work at this layer.',SX+12,detailY+38);
  }else{
    ctx.fillStyle='rgba(255,255,255,0.22)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('\u2191 Hover any layer for details',W/2,detailY+24);
  }
}
render();`,
      outputHeight: 360,
    },

    // ── Challenge 3 ──────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You need a fire effect that Three.js's built-in materials cannot produce. Which approach is correct — and at which layer of the stack are you operating?`,
      options: [
        { label: 'A', text: 'Use MeshStandardMaterial with emissive set to an orange colour — staying at the Three.js layer' },
        { label: 'B', text: 'Write a custom GLSL fragment shader using Three.js\'s ShaderMaterial. You operate at the WebGL/GLSL layer, while Three.js continues managing geometry, camera, and the render loop above.' },
        { label: 'C', text: 'You must drop to raw WebGL entirely and abandon Three.js — custom shaders require leaving the library' },
        { label: 'D', text: 'Create a fire texture and apply it with MeshBasicMaterial — the GPU handles the effect automatically' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! ShaderMaterial lets you write custom GLSL for the vertex and fragment shader stages — the two stages you control — while Three.js continues managing everything else: scene graph, buffer uploads, camera matrix uniforms, and the render loop. You get the best of both worlds: Three.js handles 80% of the pipeline for free, and you take precise control of exactly the two shader stages that produce the visual. This pattern is the goal of the entire course.",
      failMessage: "Three.js provides ShaderMaterial specifically so you can write custom GLSL without abandoning the library. You author the vertex and fragment shaders in GLSL (operating at the WebGL/shader layer), while Three.js continues handling the scene graph, geometry buffers, camera matrices, and render loop. There is no need to drop to raw WebGL — ShaderMaterial is the bridge between Three.js convenience and full shader control.",
      html: '',
      css: `body{margin:0;padding:0;font-family:sans-serif}`,
      startCode: '',
      outputHeight: 310,
    },

  ],
};

export default {
  id: 'three-js-0-0-gpu-vs-cpu',
  slug: 'gpu-vs-cpu',
  chapter: 'three-js.0',
  order: 0,
  title: 'GPU vs CPU: The Hardware Divide',
  subtitle: 'Why graphics uses a completely different processor — and what that means for everything you will write.',
  tags: ['three-js', 'webgl', 'gpu', 'cpu', 'rendering-pipeline', 'glsl', 'foundations', 'parallelism'],
  hook: {
    question: 'Your computer has two processors. One runs your OS. The other colour-fills 96 million pixels every second. Why are they fundamentally different — and what does that shape for 3D programming?',
    realWorldContext: 'Every visual effect in every game, every 3D website, every GPU-accelerated neural network traces back to one insight: some computations are embarrassingly parallel. Mastering 3D graphics starts with understanding why that matters.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'CPUs have few powerful cores — built for serial, latency-sensitive work.',
      'GPUs have thousands of small cores — built for parallel, throughput-heavy work.',
      'Pixel colour computations are independent: the perfect GPU workload.',
      'The rendering pipeline has 5 stages: vertex shader → assembly → rasterisation → fragment shader → output merger.',
      'You write stages 1 and 4 (vertex + fragment shaders) in GLSL. The GPU handles the rest.',
    ],
    callouts: [
      { type: 'important', title: 'The fundamental mental model', body: 'Every shader you write executes simultaneously on thousands of GPU cores. You write it for one vertex or one pixel — the GPU scales it to millions automatically.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'GPU vs CPU — The Hardware Divide', props: { lesson: LESSON_3JS_0_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'GPU = thousands of slow cores all running simultaneously. CPU = few fast cores running sequentially.',
    'Graphics workloads are embarrassingly parallel — each pixel is independent.',
    '5 pipeline stages: vertex shader (write it) → assembly → rasterise → fragment shader (write it) → output.',
    'Three.js wraps WebGL. ShaderMaterial lets you write GLSL without leaving Three.js.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_0 };
