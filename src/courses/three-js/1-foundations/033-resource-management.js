// Three.js · Chapter 6 · Lesson 2
// Resource Management

const LESSON_3JS_6_2 = {
  title: 'Resource Management',
  subtitle: 'Allocate once, share everywhere, dispose when done — the patterns that prevent GPU memory leaks.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The memory leak nobody sees

You build a Three.js app. Navigate between scenes. Each scene loads textures, geometries, materials. After a dozen navigations, the browser tab is using 2GB of GPU memory — and still climbing. Reload fixes it. What happened?

**GPU memory is not garbage collected.** Unlike JavaScript heap memory (managed by the runtime), GPU resources are allocated by explicit API calls and freed only by explicit dispose calls. If you create 50 textures and never call \`texture.dispose()\`, all 50 remain in GPU memory forever — even after the Three.js objects are garbage collected on the CPU.

This lesson covers the tools and patterns to prevent this.`,
    },

    // ── 1. What to dispose ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## GPU Resources That Need Explicit Disposal

Every Three.js object that allocates GPU memory has a \`dispose()\` method:

\`\`\`javascript
// Geometry → GPU vertex buffers
geometry.dispose()

// Material → GPU shader programs
material.dispose()

// Texture → GPU texture objects
texture.dispose()

// Render targets → GPU FBO + attachments
renderTarget.dispose()

// WebGLRenderer itself (cleans up all GPU context resources)
renderer.dispose()
renderer.forceContextLoss()  // forcibly releases WebGL context
\`\`\`

**Disposing a mesh doesn't dispose its geometry/material:**
\`\`\`javascript
scene.remove(mesh)         // removes from scene
mesh.geometry.dispose()    // frees vertex buffer
mesh.material.dispose()    // frees shader
if (mesh.material.map) {
  mesh.material.map.dispose()  // frees texture
}
\`\`\`

**Disposing a material doesn't dispose its textures.** You must explicitly dispose each texture in \`material.map\`, \`material.normalMap\`, \`material.roughnessMap\`, etc.`,
    },

    // ── 2. renderer.info ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Monitoring GPU Memory Usage

\`\`\`javascript
// Live GPU resource counts
const info = renderer.info

console.log(info.memory.geometries)    // number of GPU geometry objects
console.log(info.memory.textures)      // number of GPU texture objects

console.log(info.render.calls)         // draw calls this frame
console.log(info.render.triangles)     // triangles rendered this frame
console.log(info.render.points)        // points rendered
console.log(info.render.lines)         // lines rendered

// Display in UI
function updateStats() {
  document.getElementById('geo').textContent = renderer.info.memory.geometries
  document.getElementById('tex').textContent = renderer.info.memory.textures
  document.getElementById('calls').textContent = renderer.info.render.calls
}
// Call once per frame in animation loop
\`\`\`

**Normal values:**
- Geometries: 1–200 for a typical scene
- Textures: 5–100 for a typical scene
- Draw calls: < 500 for smooth 60fps on mid-range hardware`,
    },

    // ── 3. Asset cache pattern ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Asset Cache — Share, Don't Duplicate

Loading the same texture 100 times for 100 trees = 100 GPU texture objects. Load once, share everywhere = 1 GPU texture object.

\`\`\`javascript
// Asset cache with reference counting
class AssetCache {
  #cache = new Map()  // key → { asset, refCount }

  load(key, loader) {
    if (this.#cache.has(key)) {
      const entry = this.#cache.get(key)
      entry.refCount++
      return entry.asset
    }
    const asset = loader()
    this.#cache.set(key, { asset, refCount: 1 })
    return asset
  }

  release(key) {
    const entry = this.#cache.get(key)
    if (!entry) return
    entry.refCount--
    if (entry.refCount <= 0) {
      entry.asset.dispose()   // free GPU memory
      this.#cache.delete(key)
    }
  }
}

const cache = new AssetCache()
const loader = new THREE.TextureLoader()

// Load with sharing
const tex = cache.load('bark.jpg', () => loader.load('/bark.jpg'))

// Multiple meshes share the same texture
const mat1 = new THREE.MeshStandardMaterial({ map: tex })
const mat2 = new THREE.MeshStandardMaterial({ map: tex })
// 1 GPU texture object for both
\`\`\``,
    },

    // ── 4. Interactive leak demo ──────────────────────────────────────────
    {
      type: 'js',
      id: 'resource-demo',
      html: `<canvas id="c-res" width="480" height="200" style="width:480px;height:200px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:10px;justify-content:center;margin-top:8px;flex-wrap:wrap">
  <button id="btn-add" style="background:#f873;color:#fff;border:1px solid #f87;padding:5px 12px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Add object (leak)</button>
  <button id="btn-add-safe" style="background:#7f93;color:#fff;border:1px solid #7f9;padding:5px 12px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Add object (safe)</button>
  <button id="btn-clear" style="background:#222;color:#ccc;border:1px solid #444;padding:5px 12px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px">Clear scene</button>
</div>
<div id="res-stats" style="text-align:center;font-family:monospace;font-size:12px;margin-top:6px;color:#aaa"></div>`,
      startCode: `const c=document.getElementById('c-res');
const ctx=c.getContext('2d');
const W=480,H=200;

// Simulate GPU resource tracking
let gpuObjects={geometries:0,textures:0,materials:0};
let sceneObjects=[];
let leakedObjects=[];

const statsEl=document.getElementById('res-stats');
function updateStats(){
  const sceneGeo=new Set(sceneObjects.map(o=>o.geoId)).size;
  const sceneTex=new Set(sceneObjects.map(o=>o.texId)).size;
  const leak=leakedObjects.length;
  statsEl.innerHTML=
    \`<span style="color:#7bf">Scene: \${sceneObjects.length} objects</span> · \`+
    \`<span style="color:#7f9">GPU Geo: \${gpuObjects.geometries} (shared: \${sceneGeo})</span> · \`+
    \`<span style="color:#fa7">GPU Tex: \${gpuObjects.textures}</span> · \`+
    \`<span style="color:\${leak>0?'#f87':'#aaa'}">Leaked (not disposed): \${leak}</span>\`;
}

let geoId=0,texId=0;
const sharedGeo={id:++geoId,used:0};
const sharedTex={id:++texId,used:0};
gpuObjects.geometries++;gpuObjects.textures++;

document.getElementById('btn-add').onclick=()=>{
  // Naive: create new GPU resource every time (leaks)
  const geo={id:++geoId,used:0};
  const tex={id:++texId,used:0};
  gpuObjects.geometries++;gpuObjects.textures++;
  const obj={geoId:geo.id,texId:tex.id,x:Math.random()*W*.8+W*.1,y:Math.random()*H*.6+H*.2,r:5+Math.random()*10,hue:Math.random()*360,geo,tex};
  sceneObjects.push(obj);
  leakedObjects.push({geo,tex}); // these won't be disposed!
  draw();updateStats();
};

document.getElementById('btn-add-safe').onclick=()=>{
  // Safe: reuse shared GPU resources
  sharedGeo.used++;sharedTex.used++;
  const obj={geoId:sharedGeo.id,texId:sharedTex.id,x:Math.random()*W*.8+W*.1,y:Math.random()*H*.6+H*.2,r:5+Math.random()*10,hue:Math.random()*360};
  sceneObjects.push(obj);
  draw();updateStats();
};

document.getElementById('btn-clear').onclick=()=>{
  // Dispose only owned resources (not shared)
  sceneObjects.forEach(o=>{
    if(o.geo&&!o._shared){gpuObjects.geometries--;o.geo=null;}
    if(o.tex&&!o._shared){gpuObjects.textures--;o.tex=null;}
  });
  sceneObjects=[];
  leakedObjects=[];
  gpuObjects.geometries=1;gpuObjects.textures=1; // shared ones remain
  draw();updateStats();
};

function draw(){
  ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,W,H);
  sceneObjects.forEach(o=>{
    const isShared=o.geoId===sharedGeo.id;
    ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
    ctx.fillStyle=isShared?\`hsl(\${o.hue},70%,50%)\`:\`hsl(\${o.hue},70%,40%)\`;
    ctx.fill();
    ctx.strokeStyle=isShared?'#7f9':'#f87';
    ctx.lineWidth=2;ctx.stroke();
  });
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='11px monospace';
  ctx.fillText('Green border=shared geo/tex. Red border=unique (potential leak if not disposed)',8,16);
}
draw();updateStats();`,
    },

    // ── 5. Scene cleanup pattern ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Complete Scene Cleanup Pattern

\`\`\`javascript
function disposeScene(scene, renderer) {
  scene.traverse(object => {
    // Dispose geometry
    if (object.geometry) {
      object.geometry.dispose()
    }

    // Dispose material(s)
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material]

    for (const material of materials) {
      if (!material) continue
      material.dispose()

      // Dispose all texture slots
      const textureSlots = [
        'map', 'normalMap', 'roughnessMap', 'metalnessMap',
        'aoMap', 'emissiveMap', 'envMap', 'lightMap',
        'displacementMap', 'alphaMap', 'bumpMap',
      ]
      for (const slot of textureSlots) {
        if (material[slot]) material[slot].dispose()
      }
    }
  })
}

// Usage on scene change
function switchScene(nextScene) {
  disposeScene(currentScene, renderer)
  currentScene = nextScene
}
\`\`\`

**Three.js v165+ helper:**
\`\`\`javascript
// Automatic traversal-based dispose (Three.js r165+)
renderer.dispose(scene)  // proposed API — check current version
\`\`\``,
    },

    // ── 6. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-dispose',
      instruction: 'You remove a mesh from the scene with scene.remove(mesh). The mesh has a texture. What GPU memory is freed?',
      options: [
        { label: 'A', text: 'All GPU memory — scene.remove() disposes the mesh, its geometry, material, and textures' },
        { label: 'B', text: 'Nothing — scene.remove() only removes the mesh from the scene graph. GPU resources remain until explicitly disposed' },
        { label: 'C', text: 'The geometry buffer only — Three.js tracks geometry but not textures' },
        { label: 'D', text: 'The texture only — textures are reference-counted and freed when no mesh references them' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-sharing',
      instruction: '1000 trees each use the same bark texture and leaf geometry. How many GPU texture objects and geometry buffers does the ideal implementation use?',
      options: [
        { label: 'A', text: '1000 textures and 1000 geometries — each mesh needs its own GPU copy' },
        { label: 'B', text: '1 texture and 1 geometry — shared by all 1000 meshes (or 1 InstancedMesh)' },
        { label: 'C', text: '2 textures (bark + leaf) and 2 geometries — one per unique visual' },
        { label: 'D', text: '1000 textures but 1 geometry — textures must be unique but geometry can be shared' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-renderer-info',
      instruction: 'After loading and rendering a scene, renderer.info.memory.textures shows 150. You expected ~20. What is the most likely cause?',
      options: [
        { label: 'A', text: 'Three.js generates 7 internal textures per material for PBR calculations' },
        { label: 'B', text: 'Duplicate texture loading — the same image file was loaded multiple times, creating separate GPU objects instead of being shared' },
        { label: 'C', text: '150 is normal — browser caching inflates the count to include cached textures' },
        { label: 'D', text: 'The renderer generates mipmaps as separate textures, so each texture creates 6–8 GPU objects' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

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
  ],
}

export default {
  id: 'three-js-6-2-resource-management',
  slug: 'resource-management',
  chapter: 'three-js.6',
  order: 2,
  title: 'Resource Management',
  subtitle: 'Allocate once, share everywhere, dispose when done — the patterns that prevent GPU memory leaks.',
  tags: ['three-js', 'memory', 'dispose', 'gpu-memory', 'caching', 'texture-compression'],
  hook: {
    question: 'You navigate between two scenes. Scene A unloads. Its 50 textures should be freed. But your GPU memory counter keeps growing. Where did the memory go — and what three lines of code fix it?',
    realWorldContext: 'Memory leaks in WebGL apps cause tab crashes, slow browser tabs, and GPU driver instability. The techniques in this lesson are the difference between a prototype and a production app.',
  },
  intuition: {
    prose: 'GPU memory is not GCed. Call dispose() on geometry, material, and each texture. scene.remove() does nothing to GPU. Share textures via cache. Monitor with renderer.info.memory.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Resource Management', props: { lesson: LESSON_3JS_6_2 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['GPU resources: explicit dispose(). scene.remove() ≠ free. traverse → geometry.dispose()+material.dispose()+texture.dispose(). Share via Map cache. renderer.info.memory to monitor.'],
  checkpoints: ['read-intuition'],
  quiz: [],
}

export { LESSON_3JS_6_2 }
