// Three.js · Chapter 6 · Lesson 0
// The Scene Graph

const LESSON_3JS_6_0 = {
  title: 'The Scene Graph',
  subtitle: 'The hierarchical transform tree — 40 years unchanged, the core of every 3D engine.',
  sequential: true,

  cells: [
    // ── 0. Hook ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## One rotation, six moving fingers

A robot reaches out its hand. Six fingers all move together as the hand rotates. None of the fingers were individually instructed to move — they just follow the hand because they are **children** of it in the scene graph.

The scene graph is a **tree of transforms**. Each node has a local transform (position, rotation, scale) relative to its parent. The GPU needs world-space coordinates. The engine multiplies local transforms up the tree to compute each node's world matrix.

This is the pattern invented by PHIGS in 1983, unchanged in Three.js, Unreal, Unity, Blender, and Pixar's USD today. The scene graph is the skeleton on which every 3D engine is built.`,
    },

    // ── 1. Local vs world space ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Local vs World Transform

Every node has two matrices:

- **Local matrix** — position/rotation/scale relative to parent
- **World matrix** — position/rotation/scale relative to world origin

\`\`\`
worldMatrix = parent.worldMatrix × localMatrix
\`\`\`

This is recursive: to compute a node's world matrix, multiply all ancestors' local matrices, root to leaf.

\`\`\`javascript
// Three.js Object3D
const arm = new THREE.Object3D()
arm.position.set(1, 0, 0)   // local: 1 unit right of parent
arm.rotation.z = Math.PI / 4  // local: 45° around Z

const hand = new THREE.Object3D()
hand.position.set(0, 2, 0)   // local: 2 units up from arm

arm.add(hand)    // hand is a child of arm

// hand.matrixWorld = arm.matrixWorld × arm.matrix (from arm's world pos)
//                  × hand.matrix (hand's local offset from arm)
\`\`\`

**Practical consequence:** Move the arm → hand, fingers, and all descendants follow automatically. No manual update needed.`,
    },

    // ── 2. Hierarchy demo ─────────────────────────────────────────────────
    {
      type: 'js',
      id: 'scene-graph-demo',
      html: `<canvas id="c-sg" width="480" height="320" style="width:480px;height:320px;border-radius:8px;background:#0d0d12;display:block;margin:auto"></canvas>
<div style="display:flex;gap:20px;justify-content:center;margin-top:8px;font-family:monospace;color:#aaa;font-size:13px">
  <label>Shoulder: <input id="sh-ang" type="range" min="-90" max="90" value="0" style="width:110px"> <span id="sh-v">0°</span></label>
  <label>Elbow: <input id="el-ang" type="range" min="-120" max="0" value="-60" style="width:110px"> <span id="el-v">-60°</span></label>
  <label>Wrist: <input id="wr-ang" type="range" min="-90" max="90" value="0" style="width:110px"> <span id="wr-v">0°</span></label>
</div>`,
      startCode: `const c=document.getElementById('c-sg');
const ctx=c.getContext('2d');
const W=480,H=320;
const shEl=document.getElementById('sh-ang');
const elEl=document.getElementById('el-ang');
const wrEl=document.getElementById('wr-ang');

function drawBone(ctx,len,col,label){
  ctx.strokeStyle=col;ctx.lineWidth=10;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,len);ctx.stroke();
  ctx.beginPath();ctx.arc(0,len,8,0,Math.PI*2);
  ctx.fillStyle=col;ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='11px monospace';
  ctx.fillText(label,12,len/2);
}

function draw(){
  const sh=parseFloat(shEl.value)*Math.PI/180;
  const el=parseFloat(elEl.value)*Math.PI/180;
  const wr=parseFloat(wrEl.value)*Math.PI/180;
  document.getElementById('sh-v').textContent=shEl.value+'°';
  document.getElementById('el-v').textContent=elEl.value+'°';
  document.getElementById('wr-v').textContent=wrEl.value+'°';

  ctx.fillStyle='#0d0d12';ctx.fillRect(0,0,W,H);

  // Origin
  const ox=W/2,oy=H-30;
  ctx.save();
  ctx.translate(ox,oy);
  ctx.rotate(sh); // shoulder rotation

  // Shoulder bone
  ctx.strokeStyle='#7bf';ctx.lineWidth=10;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-90);ctx.stroke();
  ctx.beginPath();ctx.arc(0,-90,8,0,Math.PI*2);ctx.fillStyle='#7bf';ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='11px monospace';
  ctx.fillText('Shoulder',12,-45);

  ctx.translate(0,-90);
  ctx.rotate(el); // elbow rotation

  // Forearm
  ctx.strokeStyle='#f87';ctx.lineWidth=8;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-80);ctx.stroke();
  ctx.beginPath();ctx.arc(0,-80,7,0,Math.PI*2);ctx.fillStyle='#f87';ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillText('Elbow',10,-40);

  ctx.translate(0,-80);
  ctx.rotate(wr); // wrist rotation

  // Hand
  ctx.strokeStyle='#7f9';ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-50);ctx.stroke();

  // Fingers (children of hand)
  for(let i=-2;i<=2;i++){
    ctx.save();
    ctx.translate(i*8,-50);
    ctx.strokeStyle='#7f9';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-25);ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillText('Wrist+Hand',10,-30);

  ctx.restore();

  // Labels
  ctx.fillStyle='#555';ctx.font='11px monospace';
  ctx.fillText('Each joint rotates all descendants — scene graph propagation',10,18);
  ctx.fillStyle='#7bf';ctx.fillText('■ Upper arm (shoulder child)',10,36);
  ctx.fillStyle='#f87';ctx.fillText('■ Forearm (elbow child)',10,50);
  ctx.fillStyle='#7f9';ctx.fillText('■ Hand+Fingers (wrist children)',10,64);
}
[shEl,elEl,wrEl].forEach(e=>e.addEventListener('input',draw));
draw();`,
    },

    // ── 3. World matrix computation ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## World Matrix Computation

Three.js computes world matrices lazily using a **dirty flag** system:

\`\`\`javascript
// Internally (simplified):
class Object3D {
  updateWorldMatrix(updateParents, updateChildren) {
    if (this.parent) {
      // worldMatrix = parent.worldMatrix × localMatrix
      this.matrixWorld.multiplyMatrices(
        this.parent.matrixWorld,
        this.matrix
      )
    } else {
      this.matrixWorld.copy(this.matrix)
    }

    if (updateChildren) {
      for (const child of this.children) {
        child.updateWorldMatrix(false, true)
      }
    }
  }
}
\`\`\`

**Dirty flag optimization:** Only recompute if the local matrix has changed (\`matrixWorldNeedsUpdate = true\`). A static scene of 10,000 objects updates 0 matrices per frame if nothing moves.

\`\`\`javascript
// Three.js: mark for update
mesh.position.set(1, 2, 3)  // sets matrixWorldNeedsUpdate automatically

// Force immediate recompute
mesh.updateMatrixWorld(true)  // updateChildren=true

// Get world position
const worldPos = new THREE.Vector3()
mesh.getWorldPosition(worldPos)
\`\`\``,
    },

    // ── 4. Traverse ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Traversing the Scene Graph

\`\`\`javascript
// Depth-first traversal
scene.traverse(object => {
  if (object.isMesh) {
    object.castShadow = true
    object.material.envMap = envMap
  }
})

// Only immediate children
for (const child of scene.children) {
  console.log(child.name)
}

// Find by name (depth-first search)
const sword = scene.getObjectByName('Sword')
const byID = scene.getObjectById(42)

// Filter to specific type
const meshes = []
scene.traverseVisible(obj => {
  if (obj.isMesh) meshes.push(obj)
})

// Remove from tree
parent.remove(child)
child.parent  // null after removal
\`\`\`

**Three.js scene graph node types:**
- \`Object3D\` — base class, transform only
- \`Mesh\` — geometry + material
- \`Group\` — logical container (same as Object3D, named for clarity)
- \`SkinnedMesh\` — mesh with bone skinning
- \`Light\` — light source
- \`Camera\` — camera`,
    },

    // ── 5. Challenge 1 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q1-world-matrix',
      instruction: 'A robot arm has: shoulder (rotation 30°), attached elbow (rotation 45°), attached hand. What is the hand\'s total world rotation?',
      options: [
        { label: 'A', text: '45° — only the hand\'s own parent (elbow) rotation applies' },
        { label: 'B', text: '75° — shoulder rotation (30°) + elbow rotation (45°) accumulate through the chain' },
        { label: 'C', text: '30° — only the root rotation applies to leaf nodes' },
        { label: 'D', text: '15° — the rotations average out through the hierarchy' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 6. Challenge 2 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q2-traverse',
      instruction: 'You load a glTF character with 50 meshes. To enable shadow casting on all of them, which is correct?',
      options: [
        { label: 'A', text: 'gltf.scene.castShadow = true — propagates to all children' },
        { label: 'B', text: 'gltf.scene.traverse(o => { if (o.isMesh) o.castShadow = true }) — visits every mesh in the hierarchy' },
        { label: 'C', text: 'gltf.meshes.forEach(m => m.castShadow = true) — iterates the glTF mesh list' },
        { label: 'D', text: 'renderer.shadowMap.castAll = true — enables casting for all objects globally' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

    // ── 7. Challenge 3 ───────────────────────────────────────────────────
    {
      type: 'challenge',
      id: 'q3-dirty-flag',
      instruction: 'You have 10,000 static trees in a scene. Each frame, one tree animates. How many world matrices does Three.js recompute per frame?',
      options: [
        { label: 'A', text: '10,000 — all matrices are recomputed every frame for consistency' },
        { label: 'B', text: 'Only the 1 animated tree and its descendants — dirty flag optimization recomputes only changed nodes' },
        { label: 'C', text: '2 — the animated tree and the scene root' },
        { label: 'D', text: '0 — world matrices are only computed when rendering, not per frame' },
      ],
      html: '',
      css: 'body{margin:0;padding:0;font-family:sans-serif}',
      startCode: '',
      outputHeight: 280,
    },

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
  ],
}

export default {
  id: 'three-js-6-0-scene-graph',
  slug: 'scene-graph',
  chapter: 'three-js.6',
  order: 0,
  title: 'The Scene Graph',
  subtitle: 'The hierarchical transform tree — 40 years unchanged, the core of every 3D engine.',
  tags: ['three-js', 'scene-graph', 'object3d', 'hierarchy', 'transform'],
  hook: {
    question: 'A robot\'s hand rotates 45°. Six child nodes (fingers) each follow automatically. How does the engine make all six move correctly from one rotation — without updating each individually?',
    realWorldContext: 'Every 3D engine — from Three.js to Unreal, from Blender to Pixar\'s USD — uses a hierarchical scene graph. The pattern was invented in 1983 with PHIGS and has not fundamentally changed.',
  },
  intuition: {
    prose: 'worldMatrix = parent.worldMatrix × localMatrix (recursive). Dirty flag: only recompute on change. traverse() for depth-first walk. Object3D base class: position, rotation, scale, children.',
    callouts: [],
    visualizations: [{ id: 'ScienceNotebook', title: 'The Scene Graph', props: { lesson: LESSON_3JS_6_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['worldMatrix = parent.worldMatrix × localMatrix. Dirty flag: only recompute changed nodes. scene.traverse(fn): depth-first. parent.add(child), parent.remove(child).'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"worldMatrix = parent.worldMatrix × localMatrix." A child mesh is positioned at (1, 0, 0) in local space. Its parent is at world position (5, 0, 0). Where is the child in world space?',
      options: [
        '(1, 0, 0) — local space is the same as world space',
        '(6, 0, 0) — the parent\'s world position is added to the child\'s local position through matrix multiplication',
        '(5, 0, 0) — the child\'s position is overridden by the parent',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Dirty flag: only recompute changed nodes." A parent node moves every frame; its 50 children are static. How many world matrices are recomputed per frame?',
      options: [
        'All 51 (parent + 50 children) — world matrices always recompute',
        '51 — but with dirty flags, only the parent and its descendents that depend on the changed parent need recomputation — which is still 51 here, but unchanged subtrees elsewhere are skipped',
        '1 — only the parent node',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"scene.traverse(fn): depth-first." You call traverse to collect all meshes. In what order are nodes visited for a tree with root, child A (with subchild A1), and child B?',
      options: [
        'root → A → B → A1',
        'root → A → A1 → B (depth-first: fully descend each branch before moving to the next sibling)',
        'root → B → A → A1',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"parent.add(child): child\'s local transform is relative to parent. World position may jump." You add an existing mesh that is at world (10, 0, 0) to a parent at world (5, 0, 0). Where does the child appear if its local position stays (10, 0, 0)?',
      options: [
        'At (10, 0, 0) — adding to a parent does not move the mesh',
        'At (15, 0, 0) — the child\'s local position (10, 0, 0) is now relative to the parent\'s world (5, 0, 0), so world position becomes (15, 0, 0)',
        'At (5, 0, 0) — the child resets to match the parent',
      ],
      correct: 1,
    },
  ],
}

export { LESSON_3JS_6_0 }
