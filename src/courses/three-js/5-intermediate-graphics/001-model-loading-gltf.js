// Three.js · Chapter 4 · Lesson 0
// Model Loading — glTF & OBJ

const LESSON_3JS_4_0 = {
  title: 'Model Loading — glTF & OBJ',
  subtitle: 'Loading the "JPEG of 3D" and integrating external meshes into your scene.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The JPEG of 3D

In 2015 the Khronos Group (creators of OpenGL and WebGL) designed a new 3D file format from scratch. Their goal: what JPEG is to images, glTF should be to 3D — **compact, web-ready, universally supported**.

By 2022 glTF 2.0 became an **ISO standard**. Blender, Unreal, Unity, Sketchfab, Facebook, Google, Apple — all use it. Understanding glTF means you can load, inspect, and modify any 3D asset from any pipeline.

In this lesson we examine the glTF structure, walk through the Three.js GLTFLoader API, explore optimisation techniques (LOD, instancing), and contrast with the older OBJ format.`,
    },

    // ── 1. glTF structure ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## glTF File Structure

glTF is **JSON + binary**. A \`.gltf\` file is human-readable JSON that references:
- \`.bin\` — binary geometry (vertex positions, normals, UVs, indices)
- Image files — textures (PNG/JPEG)

A \`.glb\` file bundles everything into a **single binary file** — one HTTP request for 3D assets.

\`\`\`json
{
  "asset": { "version": "2.0" },
  "scenes": [{ "nodes": [0] }],
  "nodes": [{ "mesh": 0, "name": "Cube" }],
  "meshes": [{
    "primitives": [{
      "attributes": { "POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2 },
      "indices": 3,
      "material": 0
    }]
  }],
  "materials": [{
    "pbrMetallicRoughness": {
      "baseColorTexture": { "index": 0 },
      "metallicFactor": 0.0,
      "roughnessFactor": 0.5
    }
  }],
  "accessors": [...],  // describe how to read binary data
  "bufferViews": [...], // byte ranges within the .bin
  "buffers": [{ "uri": "model.bin", "byteLength": 12345 }]
}
\`\`\`

Every attribute (POSITION, NORMAL, TEXCOORD_0) is an **accessor** — it specifies data type, count, and a byte range into a buffer.`,
    },

    // ── 2. GLTFLoader in Three.js ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Loading glTF in Three.js

\`\`\`javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

// Async/await pattern
const gltf = await loader.loadAsync('/models/robot.glb')
scene.add(gltf.scene)

// Callback pattern
loader.load(
  '/models/robot.glb',
  (gltf) => {
    scene.add(gltf.scene)        // the root Object3D

    // Access animations
    const mixer = new THREE.AnimationMixer(gltf.scene)
    gltf.animations.forEach(clip => mixer.clipAction(clip).play())

    // Access individual meshes
    gltf.scene.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  },
  (progress) => console.log(progress.loaded / progress.total * 100 + '%'),
  (error) => console.error(error)
)
\`\`\`

**Key gltf properties:**
- \`gltf.scene\` — root Object3D (add this to scene)
- \`gltf.scenes\` — array of all scenes
- \`gltf.animations\` — array of AnimationClip
- \`gltf.cameras\` — cameras defined in the file
- \`gltf.asset\` — metadata (version, generator, copyright)`,
    },

    // ── 3. glTF structure diagram ─────────────────────────────────────────
    {
      type: 'js',
      id: 'gltf-diagram',
      html: `<canvas id="c-gltf" width="560" height="340" style="width:560px;height:340px;display:block;margin:auto;border-radius:8px;background:#0d0d12"></canvas>`,
      startCode: `const c=document.getElementById('c-gltf');
const ctx=c.getContext('2d');
ctx.fillStyle='#0d0d12';
ctx.fillRect(0,0,560,340);

// Draw a hierarchy of boxes with labels and arrows
function box(x,y,w,h,label,sub,col){
  ctx.fillStyle=col+'22';
  ctx.strokeStyle=col;
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.font='bold 13px monospace';
  ctx.fillText(label,x+10,y+18);
  if(sub){
    ctx.fillStyle='#888';
    ctx.font='11px monospace';
    sub.forEach((s,i)=>ctx.fillText(s,x+10,y+34+i*15));
  }
}
function arrow(x1,y1,x2,y2){
  ctx.strokeStyle='#446';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  const ux=dx/len,uy=dy/len;
  ctx.lineTo(x2-8*ux-5*uy,y2-8*uy+5*ux);
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-8*ux+5*uy,y2-8*uy-5*ux);
  ctx.stroke();
}

// glTF JSON
box(20,20,160,80,'glTF JSON',['scenes[]','nodes[]','meshes[]','materials[]'],'#7bf');
// .bin
box(220,20,130,55,'.bin buffer',['vertex data','normals, UVs','indices'],'#fa7');
// images
box(220,100,130,45,'.jpg/.png',['textures'],'#7f9');
// accessors
box(380,20,160,60,'Accessors',['byte offsets','component type','count'],'#f7a');
// bufferViews
box(380,100,160,50,'BufferViews',['byteOffset, length','stride, target'],'#af7');

// arrows
arrow(180,60,218,45);
arrow(180,70,218,115);
arrow(350,35,378,35);
arrow(350,120,378,120);

// legend
ctx.fillStyle='#666';
ctx.font='11px monospace';
ctx.fillText('glTF: JSON scene graph + binary geometry + image textures',20,310);
ctx.fillText('Accessor → BufferView → Buffer (byte range chain)',20,325);`,
    },

    // ── 4. OBJ format ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## OBJ — The Legacy Format

OBJ (Wavefront, 1984) is text-based and still widely used for simple geometry exchange:

\`\`\`obj
# cube.obj
v  1.0  1.0 -1.0   # vertex position
v  1.0 -1.0 -1.0
...
vt 0.0  0.0         # texture coordinate
vn 0.0  0.0 -1.0   # normal
f  1/1/1  2/2/1  3/3/1   # face: vertex/texcoord/normal indices
\`\`\`

**OBJ vs glTF:**

| Feature | OBJ | glTF |
|---------|-----|------|
| Format | ASCII text | JSON + binary |
| Materials | .mtl sidecar file | embedded in JSON |
| Animations | None | Yes (skinned + morph) |
| PBR materials | No | Yes (metalness/roughness) |
| File size | Large (text) | Small (binary) |
| Ecosystem | Legacy | Modern standard |

**Three.js OBJLoader:**
\`\`\`javascript
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'

const mtl = await new MTLLoader().loadAsync('/model.mtl')
mtl.preload()
const obj = new OBJLoader().setMaterials(mtl)
const mesh = await obj.loadAsync('/model.obj')
scene.add(mesh)
\`\`\``,
    },

    // ── 5. LOD and instancing ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Performance: LOD & Instancing

### Level of Detail (LOD)

Distant objects don't need high polygon counts. Three.js LOD swaps mesh resolution by camera distance:

\`\`\`javascript
const lod = new THREE.LOD()

// High detail: within 50 units
lod.addLevel(highPolyMesh, 0)
// Medium detail: 50–200 units
lod.addLevel(medPolyMesh, 50)
// Low detail: beyond 200 units
lod.addLevel(lowPolyMesh, 200)

scene.add(lod)
// lod.update(camera) called in animation loop
\`\`\`

### Instanced Mesh

100 identical trees → 1 draw call instead of 100:

\`\`\`javascript
const count = 1000
const mesh = new THREE.InstancedMesh(geometry, material, count)

const dummy = new THREE.Object3D()
for (let i = 0; i < count; i++) {
  dummy.position.set(Math.random()*100, 0, Math.random()*100)
  dummy.rotation.y = Math.random() * Math.PI * 2
  dummy.updateMatrix()
  mesh.setMatrixAt(i, dummy.matrix)
}
mesh.instanceMatrix.needsUpdate = true
scene.add(mesh)
\`\`\`

One draw call. N transforms. The GPU handles all instances in parallel.`,
    },

    // ── 6. Instancing demo ────────────────────────────────────────────────
    {
      type: 'js',
      id: 'instancing-demo',
      html: `<canvas id="c-inst" width="480" height="300" style="width:480px;height:300px;border-radius:8px;background:#0d1118;display:block;margin:auto"></canvas>
<div style="text-align:center;font-family:monospace;color:#888;font-size:13px;margin-top:8px">
  Instances: <input id="inst-count" type="range" min="1" max="200" value="64" style="width:140px"> <span id="inst-v">64</span>
  <span id="inst-fps" style="margin-left:16px;color:#7bf">fps: --</span>
</div>`,
      startCode: `// Instanced sphere demo using Canvas 2D (no Three.js available in sandbox)
// Shows the concept: N transforms, rendered efficiently
const c=document.getElementById('c-inst');
const ctx=c.getContext('2d');
const W=480,H=300;
let count=64;
let instances=[];
let lastT=performance.now();
let frames=0;
const fpEl=document.getElementById('inst-fps');

function makeInstances(n){
  instances=[];
  for(let i=0;i<n;i++){
    instances.push({
      x:Math.random()*W,
      y:Math.random()*H,
      r:4+Math.random()*10,
      vx:(Math.random()-.5)*1.5,
      vy:(Math.random()-.5)*1.5,
      hue:Math.random()*360
    });
  }
}
makeInstances(count);

const countEl=document.getElementById('inst-count');
const valEl=document.getElementById('inst-v');
countEl.addEventListener('input',()=>{
  count=parseInt(countEl.value);
  valEl.textContent=count;
  makeInstances(count);
});

function draw(t){
  const dt=Math.min((t-lastT)/16,3);
  lastT=t;
  frames++;
  if(frames%30===0) fpEl.textContent='fps: '+Math.round(1000/((t-(lastT-dt*16))||16));

  ctx.fillStyle='rgba(13,17,24,0.3)';
  ctx.fillRect(0,0,W,H);

  // "One draw call" — render all instances
  instances.forEach(inst=>{
    inst.x+=inst.vx*dt;
    inst.y+=inst.vy*dt;
    if(inst.x<inst.r){inst.x=inst.r;inst.vx*=-1;}
    if(inst.x>W-inst.r){inst.x=W-inst.r;inst.vx*=-1;}
    if(inst.y<inst.r){inst.y=inst.r;inst.vy*=-1;}
    if(inst.y>H-inst.r){inst.y=H-inst.r;inst.vy*=-1;}

    // Simple sphere illusion
    const grd=ctx.createRadialGradient(inst.x-inst.r*.3,inst.y-inst.r*.3,inst.r*.1,inst.x,inst.y,inst.r);
    grd.addColorStop(0,\`hsl(\${inst.hue},80%,70%)\`);
    grd.addColorStop(1,\`hsl(\${inst.hue},80%,20%)\`);
    ctx.beginPath();
    ctx.arc(inst.x,inst.y,inst.r,0,Math.PI*2);
    ctx.fillStyle=grd;
    ctx.fill();
  });

  ctx.fillStyle='rgba(100,180,255,0.9)';
  ctx.font='bold 12px monospace';
  ctx.fillText(\`\${count} instances — 1 draw call (InstancedMesh)\`,10,22);

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    },

    // ── 7. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-gltf-binary',
      instruction: 'A .glb file is loaded. What does the "b" in .glb stand for — and what is the main advantage over a .gltf file?',
      options: [
        { label: 'A', text: '.glb = GL Binary — bundles JSON + .bin + textures into one file, reducing HTTP requests' },
        { label: 'B', text: '.glb = GL Blender — a Blender-specific export format that includes scene hierarchy only' },
        { label: 'C', text: '.glb = GL Bytecode — compiled shader programs embedded alongside geometry' },
        { label: 'D', text: '.glb = GL Buffer — stores only geometry without materials or textures' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 8. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-instancing',
      instruction: 'You render 500 identical trees using 500 separate Mesh objects. Then you switch to InstancedMesh. What specifically decreases?',
      options: [
        { label: 'A', text: 'GPU memory usage — instancing compresses the vertex data' },
        { label: 'B', text: 'The number of draw calls — from 500 to 1, reducing CPU-GPU command overhead' },
        { label: 'C', text: 'The polygon count — instancing automatically uses lower LOD' },
        { label: 'D', text: 'Fragment shader cost — instances share a single fragment shader execution' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 9. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-traverse',
      instruction: 'After loading a glTF model, you want to enable shadow casting on every mesh. Which code is correct?',
      options: [
        { label: 'A', text: 'gltf.scene.castShadow = true — sets shadow casting for the entire scene node' },
        { label: 'B', text: 'gltf.meshes.forEach(m => m.castShadow = true) — iterates glTF mesh primitives' },
        { label: 'C', text: 'gltf.scene.traverse(child => { if (child.isMesh) child.castShadow = true }) — walks the full hierarchy' },
        { label: 'D', text: 'renderer.shadowMap.enabled = true — enables shadows globally for all objects' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

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
  ],
}

export default {
  id: 'three-js-4-0-model-loading',
  slug: 'model-loading-gltf',
  chapter: 'three-js.4',
  order: 0,
  title: 'Model Loading — glTF & OBJ',
  subtitle: 'Loading the "JPEG of 3D" and integrating external meshes into your scene.',
  tags: ['three-js', 'gltf', 'obj', 'model-loading', 'lod', 'instancing'],
  hook: {
    question: 'A character has 50,000 triangles. You load 100 of them in a forest scene. 5 million triangles in 100 separate draw calls. What two techniques reduce this to one draw call?',
    realWorldContext: 'glTF 2.0 is now an ISO standard (2022). Understanding its structure means you can load, parse, and modify any 3D file from Blender to Sketchfab to any online library.',
  },
  intuition: {
    prose: 'glTF = JSON scene + .bin geometry + images. GLTFLoader returns gltf.scene (Object3D). Traverse for isMesh to modify children. InstancedMesh: N copies, 1 draw call. LOD: swap mesh by distance.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'Model Loading — glTF & OBJ', props: { lesson: LESSON_3JS_4_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['glTF: JSON+binary. GLTFLoader.loadAsync() → gltf.scene. traverse(child=>child.isMesh). InstancedMesh(geo,mat,count)+setMatrixAt() = N objects, 1 draw call.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"GLTFLoader.loadAsync() → gltf.scene. traverse(child => child.isMesh)." Why traverse instead of using gltf.scene directly?',
      options: [
        'gltf.scene is not accessible directly',
        'A glTF file contains a scene graph with groups, lights, cameras, and meshes mixed together. traversing lets you find and operate on only the mesh nodes',
        'traverse runs faster than accessing gltf.scene',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"InstancedMesh(geo, mat, count) + setMatrixAt() = N objects, 1 draw call." What problem does InstancedMesh solve?',
      options: [
        'It allows different materials on each instance',
        'Drawing 1000 separate meshes issues 1000 draw calls — the CPU-GPU overhead dominates. InstancedMesh batches all instances into a single draw call, dramatically reducing overhead',
        'It automatically generates LODs for distant instances',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"glTF: JSON + binary." What is stored in the binary (.bin) file of a glTF?',
      options: [
        'The material definitions and texture filenames',
        'Vertex buffers, index buffers, and animation data — the dense numeric arrays that would be large and slow to parse as JSON',
        'The shader source code',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'After calling GLTFLoader.load(), you want to enable shadow casting on all loaded meshes. Where in the code do you do this?',
      options: [
        'Before calling load() — pass a shadow config to the loader',
        'Inside the onLoad callback, traverse the loaded gltf.scene and set mesh.castShadow = true on each mesh node',
        'After adding gltf.scene to the scene, Three.js applies shadows automatically',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_4_0 }
