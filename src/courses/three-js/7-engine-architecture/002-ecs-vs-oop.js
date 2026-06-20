// Three.js · Chapter 6 · Lesson 1
// ECS vs OOP Architecture

const LESSON_3JS_6_1 = {
  title: 'ECS vs OOP Architecture',
  subtitle: 'Cache-friendly entity-component systems vs object-oriented inheritance — and why it matters at 10,000 objects.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The cache miss problem

You have 10,000 objects. Each needs its position updated every frame. In a naive OOP design:

\`\`\`javascript
class GameObject {
  name; mesh; ai; health; position; velocity; animation; ...
  update() { this.position.add(this.velocity) }
}
const objects = [new GameObject(), new GameObject(), ...]
objects.forEach(o => o.update())
\`\`\`

Every \`o.update()\` call must first **load the entire object into the CPU cache**. But you only need \`position\` and \`velocity\`. You're loading hundreds of bytes of irrelevant data (mesh, AI, health, animation) just to add two vec3s. At 10,000 objects, this causes thousands of **cache misses** per frame.

**ECS** (Entity Component System) solves this by separating data from logic, storing each component type in contiguous arrays — **Structure of Arrays (SoA)** instead of Array of Structures.`,
    },

    // ── 1. SoA vs AoS ─────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Array of Structures vs Structure of Arrays

**Array of Structures (AoS) — traditional OOP:**
\`\`\`
Memory: [x1 y1 z1 vx1 vy1 vz1 name1 health1 ...] [x2 y2 z2 ...]
         ← GameObject 1 ──────────────────────────→  ← obj 2 ─→
\`\`\`
To update position for N objects: jump N × sizeof(GameObject) bytes.

**Structure of Arrays (SoA) — ECS:**
\`\`\`
posX: [x1, x2, x3, x4, x5, ...]
posY: [y1, y2, y3, y4, y5, ...]
velX: [vx1, vx2, vx3, ...]
\`\`\`
To update position for N objects: iterate three contiguous arrays. **Full cache line utilization.**

**Performance:** SoA position-update of 10,000 objects can be 5–10× faster than AoS, purely from cache effects — same operations, same result.

\`\`\`javascript
// SoA position update
for (let i = 0; i < count; i++) {
  posX[i] += velX[i] * dt
  posY[i] += velY[i] * dt
  posZ[i] += velZ[i] * dt
}
\`\`\``,
    },

    // ── 2. ECS fundamentals ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## ECS Fundamentals

**Entity Component System** has three parts:

- **Entity:** just an ID (a number). No data, no methods.
- **Component:** pure data struct attached to an entity. No methods.
- **System:** logic that operates on all entities that have a specific set of components.

\`\`\`javascript
// Minimal ECS implementation
class World {
  entities = 0
  components = new Map()  // componentType → Map<entityId, data>

  createEntity() { return this.entities++ }

  addComponent(entity, type, data) {
    if (!this.components.has(type)) this.components.set(type, new Map())
    this.components.get(type).set(entity, data)
  }

  getComponent(entity, type) {
    return this.components.get(type)?.get(entity)
  }

  query(...types) {
    // Return all entities that have ALL specified component types
    const first = this.components.get(types[0])
    if (!first) return []
    return [...first.keys()].filter(id =>
      types.every(t => this.components.get(t)?.has(id))
    )
  }
}

// Usage
const world = new World()
const entity = world.createEntity()
world.addComponent(entity, 'Position', { x: 0, y: 0, z: 0 })
world.addComponent(entity, 'Velocity', { x: 1, y: 0, z: 0 })

// Physics system
function physicsSystem(world, dt) {
  for (const id of world.query('Position', 'Velocity')) {
    const pos = world.getComponent(id, 'Position')
    const vel = world.getComponent(id, 'Velocity')
    pos.x += vel.x * dt
    pos.y += vel.y * dt
    pos.z += vel.z * dt
  }
}
\`\`\``,
    },

    // ── 3. Performance demo ───────────────────────────────────────────────
    {
      type: 'js',
      id: 'ecs-perf-demo',
      html: `<canvas id="c-ecs" width="480" height="280" style="width:480px;height:280px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Count: <input id="ecs-count" type="range" min="100" max="5000" value="1000" style="width:130px"> <span id="ecs-cnt-v">1000</span></label>
  <label>Mode: <select id="ecs-mode" style="background:#222;color:#ccc;border:1px solid #444;padding:2px 6px;border-radius:4px">
    <option value="aos">AoS (OOP)</option>
    <option value="soa">SoA (ECS)</option>
  </select></label>
</div>
<div style="text-align:center;font-family:monospace;font-size:12px;margin-top:4px" id="ecs-stats"></div>`,
      startCode: `const c=document.getElementById('c-ecs');
const ctx=c.getContext('2d');
const W=480,H=280;
let count=1000,mode='aos';
const countEl=document.getElementById('ecs-count');
const modeEl=document.getElementById('ecs-mode');
const statsEl=document.getElementById('ecs-stats');
countEl.addEventListener('input',()=>{count=parseInt(countEl.value);document.getElementById('ecs-cnt-v').textContent=count;init();});
modeEl.addEventListener('change',()=>{mode=modeEl.value;init();});

// AoS: array of objects
let aos=[];
// SoA: separate typed arrays
let soaX,soaY,soaVX,soaVY,soaHue;

function init(){
  aos=[];
  soaX=new Float32Array(count);soaY=new Float32Array(count);
  soaVX=new Float32Array(count);soaVY=new Float32Array(count);
  soaHue=new Float32Array(count);
  for(let i=0;i<count;i++){
    const x=Math.random()*W,y=Math.random()*H;
    const vx=(Math.random()-.5)*2,vy=(Math.random()-.5)*2;
    const hue=Math.random()*360;
    aos.push({x,y,vx,vy,hue,name:'obj'+i,health:100,mesh:null,ai:null,unused:new Array(10)});
    soaX[i]=x;soaY[i]=y;soaVX[i]=vx;soaVY[i]=vy;soaHue[i]=hue;
  }
}
init();

let lastT=performance.now(),totalUpdateMs=0,frameCount=0;
function frame(t){
  const dt=Math.min((t-lastT)/16,3);lastT=t;
  const t0=performance.now();

  if(mode==='aos'){
    // AoS update
    for(let i=0;i<aos.length;i++){
      const o=aos[i];
      o.x+=o.vx*dt;o.y+=o.vy*dt;
      if(o.x<0){o.x=0;o.vx*=-1;}if(o.x>W){o.x=W;o.vx*=-1;}
      if(o.y<0){o.y=0;o.vy*=-1;}if(o.y>H){o.y=H;o.vy*=-1;}
    }
  } else {
    // SoA update — contiguous memory access
    for(let i=0;i<count;i++){
      soaX[i]+=soaVX[i]*dt;soaY[i]+=soaVY[i]*dt;
      if(soaX[i]<0){soaX[i]=0;soaVX[i]*=-1;}if(soaX[i]>W){soaX[i]=W;soaVX[i]*=-1;}
      if(soaY[i]<0){soaY[i]=0;soaVY[i]*=-1;}if(soaY[i]>H){soaY[i]=H;soaVY[i]*=-1;}
    }
  }

  const updateMs=performance.now()-t0;
  totalUpdateMs=totalUpdateMs*.95+updateMs*.05;
  frameCount++;

  ctx.fillStyle='rgba(13,13,18,0.4)';ctx.fillRect(0,0,W,H);

  if(mode==='aos'){
    aos.forEach(o=>{
      ctx.beginPath();ctx.arc(o.x,o.y,2,0,Math.PI*2);
      ctx.fillStyle=\`hsl(\${o.hue},70%,60%)\`;ctx.fill();
    });
  } else {
    for(let i=0;i<count;i++){
      ctx.beginPath();ctx.arc(soaX[i],soaY[i],2,0,Math.PI*2);
      ctx.fillStyle=\`hsl(\${soaHue[i]},70%,60%)\`;ctx.fill();
    }
  }

  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 12px monospace';
  ctx.fillText(\`\${mode==='aos'?'AoS (OOP)':'SoA (ECS)'} — \${count} objects\`,10,22);
  ctx.fillStyle='rgba(127,191,255,0.9)';
  ctx.fillText(\`Update: \${totalUpdateMs.toFixed(2)}ms\`,10,40);
  statsEl.textContent=\`\${mode==='aos'?'AoS':'SoA'} update time: \${totalUpdateMs.toFixed(3)}ms for \${count} objects\`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);`,
    },

    // ── 4. Instanced mesh as ECS ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## InstancedMesh — ECS-style Batch Rendering

Three.js \`InstancedMesh\` is the practical ECS approach for rendering many identical objects:

\`\`\`javascript
// ECS-style: N entities share one mesh/material (component)
const count = 10000
const mesh = new THREE.InstancedMesh(geometry, material, count)

// Store transforms in typed arrays (SoA-friendly)
const positions = new Float32Array(count * 3)
const velocities = new Float32Array(count * 3)

// Initialize
for (let i = 0; i < count; i++) {
  positions[i*3]   = Math.random() * 100 - 50
  positions[i*3+1] = Math.random() * 10
  positions[i*3+2] = Math.random() * 100 - 50
}

// Update loop (physics system)
const dummy = new THREE.Object3D()
function updateSystem(dt) {
  for (let i = 0; i < count; i++) {
    positions[i*3]   += velocities[i*3]   * dt
    positions[i*3+1] += velocities[i*3+1] * dt
    positions[i*3+2] += velocities[i*3+2] * dt

    dummy.position.fromArray(positions, i * 3)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}
\`\`\`

1 draw call. SoA transforms. Full GPU throughput.`,
    },

    // ── 5. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-cache',
      instruction: 'In an AoS design, each object is 512 bytes. You iterate 10,000 objects to update only their position (12 bytes). A CPU cache line is 64 bytes. What fraction of loaded data is actually used?',
      options: [
        { label: 'A', text: '100% — the CPU pre-fetches only the bytes needed for the current operation' },
        { label: 'B', text: '50% — cache lines are split evenly between used and unused data' },
        { label: 'C', text: '~2.3% — 12 bytes used out of 512 loaded. Each cache miss brings in 64 bytes of which ~12 are useful' },
        { label: 'D', text: '12.5% — one eighth of each 512-byte object is the position data' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 6. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-ecs-query',
      instruction: 'An ECS world has components: Position, Velocity, Health, Renderable. The physics system queries for [Position, Velocity]. The render system queries for [Position, Renderable]. An entity has Position but not Velocity or Renderable. Which systems process it?',
      options: [
        { label: 'A', text: 'Both systems — it has Position which both require' },
        { label: 'B', text: 'Neither system — it doesn\'t satisfy the full component list of either query' },
        { label: 'C', text: 'Only the physics system — Velocity is optional in the query' },
        { label: 'D', text: 'Only the render system — Position is sufficient for rendering' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-instanced',
      instruction: 'After updating transforms for 500 InstancedMesh instances, what single call makes Three.js re-upload the instance matrices to the GPU?',
      options: [
        { label: 'A', text: 'mesh.updateMatrixWorld(true)' },
        { label: 'B', text: 'mesh.instanceMatrix.needsUpdate = true' },
        { label: 'C', text: 'mesh.geometry.attributes.instanceMatrix.needsUpdate = true' },
        { label: 'D', text: 'renderer.uploadInstancedMesh(mesh)' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

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
  ],
}

export default {
  id: 'three-js-6-1-ecs',
  slug: 'ecs-vs-oop',
  chapter: 'three-js.6',
  order: 1,
  title: 'ECS vs OOP Architecture',
  subtitle: 'Cache-friendly entity-component systems vs object-oriented inheritance — and why it matters at 10,000 objects.',
  tags: ['three-js', 'ecs', 'oop', 'architecture', 'performance', 'instancing'],
  hook: {
    question: 'Your scene has 10,000 objects. Updating their transforms takes 4ms in OOP. Rearranging the same data into Structure of Arrays takes 0.8ms. Same logic, same result. Why is it 5× faster?',
    realWorldContext: 'Unity\'s DOTS (2018) rewrote its engine around ECS and SoA. Overwatch, Battlefield, and Destiny all use ECS-like approaches for their simulations. The CPU cache is the bottleneck.',
  },
  intuition: {
    prose: 'AoS (OOP): array of fat objects — cache thrashing. SoA (ECS): separate typed arrays per attribute — full cache lines. ECS: entity=ID, component=data, system=logic. InstancedMesh = ECS rendering.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'ECS vs OOP Architecture', props: { lesson: LESSON_3JS_6_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['SoA: Float32Array per attribute → cache-friendly. ECS: entity=ID, component=data in SoA, system=query+update. InstancedMesh+setMatrixAt = ECS batch render.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"SoA: Float32Array per attribute → cache-friendly." Why is Structure of Arrays (SoA) faster than Array of Structures (AoS) for processing positions of 1000 entities?',
      options: [
        'SoA uses less memory because floats are smaller than objects',
        'Positions in SoA are contiguous in memory — the CPU fetches a cache line of positions all at once. In AoS, positions interleave with other fields, causing cache misses when only positions are needed',
        'SoA avoids JavaScript object overhead',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"ECS: entity = ID, component = data in SoA, system = query + update." In ECS, what is the role of a system?',
      options: [
        'A system is a JavaScript class that extends Entity',
        'A system queries all entities that have a specific set of components and processes them — separating logic from data',
        'A system manages GPU resource allocation',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"InstancedMesh + setMatrixAt() = ECS batch render." Why does InstancedMesh fit the ECS philosophy?',
      options: [
        'InstancedMesh stores matrices in a flat Float32Array (data), and a single draw call processes all instances (system) — matching ECS\'s data/logic separation and batch processing',
        'InstancedMesh uses an entity ID system internally',
        'InstancedMesh replaces the need for a scene graph',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A traditional OOP game engine has class Enemy extends Character. Adding a flying ability requires modifying the inheritance chain. How does ECS handle this instead?',
      options: [
        'ECS also uses inheritance — it just uses interfaces instead of classes',
        'In ECS, "flying" is a component. Adding it to any entity — Enemy, Player, or NPC — immediately gives them flight behaviour without any class hierarchy changes',
        'ECS does not support entity-specific abilities',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_6_1 }
