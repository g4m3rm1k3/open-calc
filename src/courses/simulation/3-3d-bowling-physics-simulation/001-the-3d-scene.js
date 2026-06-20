export default {
  id: 'sim3-001',
  slug: 'the-3d-scene',
  chapter: 'sim3',
  order: 1,
  title: 'The 3D Scene',
  subtitle: 'Every Three.js object follows one recipe: Geometry + Material = Mesh. Master this recipe and you can build any 3D world — from a bowling lane to a space station.',
  tags: ['three.js', 'geometry', 'material', 'mesh', 'lighting', 'scene-graph', '3d', 'bowling'],
  aliases: 'three.js geometry material mesh lighting scene graph 3d bowling simulation beginners BoxGeometry SphereGeometry CylinderGeometry MeshStandardMaterial',
  timeToComplete: 30,
  coreConcept: 'A Three.js scene is a collection of Mesh objects. Each Mesh is the product of a Geometry (shape) and a Material (surface). Position every mesh with position.set(x, y, z), remembering that +Y is up. MeshStandardMaterial responds to lights physically; MeshBasicMaterial always renders at full colour.',
  prerequisites: ['sim1-001'],
  nextLesson: 'camera-and-motion',

  hook: {
    question: 'If a game engine needs to draw a bowling ball and 10 pins, how does the graphics card know the shape of each object, its colour, and where it sits in the world?',
    realWorldContext: 'Every 3D engine — Unreal, Unity, Three.js, Blender — stores objects the same way. Shape and surface are kept separate on purpose. The shape (geometry) is a mesh of triangles. The surface (material) is a set of rules for how light bounces off it. Combining them gives you a renderable object that can be repositioned, rotated, and scaled independently.\n\nThis separation is powerful: you can give 10 pins the same geometry (one copy of the shape in GPU memory) with 10 different positions, or swap a metallic material for a rubber one without touching the shape at all. Learning this pattern in Three.js gives you a mental model that transfers directly to every other 3D tool you will ever use.',
  },

  intuition: {
    prose: [
      '**Every 3D object is a Mesh.** Strip away the complexity of any 3D engine and you find the same pattern: an object is a mesh of triangles (the **Geometry**) combined with a surface description (the **Material**). The geometry is a cloud of vertices that defines the shape in local space. The material defines how light bounces off the surface. Combining them with `new THREE.Mesh(geometry, material)` produces a visible object you can place anywhere in world space.',

      '**BoxGeometry(width, height, depth)** creates a rectangular box centred at the origin. The first argument spans the X axis, the second the Y axis, the third the Z axis. A bowling lane is a very flat box: 1.05 m wide, 18.3 m deep, and only 0.08 m tall. Storing those numbers in named constants means changing `LANE_LENGTH` from 18.3 to 36.6 doubles the lane without touching any other line of code.',

      '**MeshStandardMaterial** uses Physically Based Rendering (PBR) — a model of how real surfaces reflect light. Two parameters control it: `roughness` (0 = perfect mirror, 1 = rough chalk) and `metalness` (0 = plastic/wood, 1 = pure metal). A polished maple lane sits around roughness 0.3, metalness 0. Without a light source, a StandardMaterial mesh renders completely black. The sandbox always provides one ambient fill light and one directional sun light.',

      '**position.set(x, y, z)** moves a mesh in world space. Three.js is Y-up: +Y points toward the ceiling. A BoxGeometry centred at the origin has its top face at `y = height / 2`. To rest a pin on top of the lane floor, the pin centre must be at `y = LANE_THICKNESS / 2 + PIN_HEIGHT / 2`. Getting this spatial arithmetic right is half of 3D programming.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of Sim-3: 3D Bowling',
        body: '**Previous:** Sim-2 (2D function plotter in Canvas)\n**This lesson:** Three.js scene graph — Geometry + Material = Mesh, lighting models, multiple mesh positions.\n**Next (L02):** Pin Formation — THREE.Vector3, Groups, placing 10 pins in the regulation diamond pattern.',
      },
      {
        type: 'procedure',
        title: 'The Three-Step Recipe',
        body: '```js\n// Step 1 — shape (only vertices, no colour)\nconst geo = new THREE.BoxGeometry(1, 1, 1)\n\n// Step 2 — surface (only appearance, no shape)\nconst mat = new THREE.MeshStandardMaterial({ color: 0x44aaff })\n\n// Step 3 — combine + register in the world\nconst mesh = new THREE.Mesh(geo, mat)\nscene.add(mesh)\n```\n\nGeometry and Material are independent objects. Many Meshes can share one Geometry (one GPU upload, many positions) or one Material (shared surface, different shapes).',
      },
      {
        type: 'insight',
        title: 'Y-Up Coordinate System',
        body: 'Three.js uses a right-handed, Y-up coordinate system:\n\n• **+X** → right\n• **+Y** → up (toward the ceiling)\n• **+Z** → toward the camera\n\nA BoxGeometry centred at origin has its top face at `y = height / 2`. To stack B on top of A:\n\n```js\nb.position.y = A_HEIGHT / 2 + B_HEIGHT / 2\n```\n\nAlways think in centre-points, not edges. `position.set()` always sets the centre of the object.',
      },
      {
        type: 'insight',
        title: 'Sharing Geometry is Free Performance',
        body: 'The left gutter and right gutter have identical shapes. Pass the same Geometry object to both Mesh constructors:\n\n```js\nconst gutterGeo = new THREE.BoxGeometry(0.25, 0.06, 18.3)\nconst leftGutter  = new THREE.Mesh(gutterGeo, mat)\nconst rightGutter = new THREE.Mesh(gutterGeo, mat)\n```\n\nThe vertex data is uploaded to the GPU exactly once. Each Mesh stores only its own transform (position, rotation, scale). With hundreds of identical objects this becomes **instancing** — the technique games use to render thousands of trees or bricks.',
      },
      {
        type: 'warning',
        title: "Don't Create Meshes in update()",
        body: 'Creating a `THREE.Mesh` allocates CPU memory, uploads vertex data to the GPU, and can trigger garbage collection. Do all object creation in `init()`. In `update()`, only read and modify existing meshes:\n\n```js\n// correct\nfunction init()      { ballMesh = new THREE.Mesh(geo, mat); scene.add(ballMesh) }\nfunction update(dt)  { ballMesh.position.z -= ROLL_SPEED * dt }\n\n// wrong — re-creates the mesh 60 times per second\nfunction update(dt)  { scene.add(new THREE.Mesh(geo, mat)) }\n```',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Building the Bowling Lane Scene',
        mathBridge: 'Three cells build the scene one concept at a time. Each cell is fully independent — run them in any order. Notice how named constants make every dimension self-documenting and easy to change.',
        caption: 'All cells use Three.js 3D mode. OrbitControls are active: drag to orbit, scroll to zoom, right-drag to pan.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: The lane floor — Geometry + Material = Mesh',
              mode: '3d',
              prose: [
                'The three-step recipe: create a **Geometry** (shape), create a **Material** (surface), combine them into a **Mesh**, and add the Mesh to the scene. All Three.js objects — from a floor tile to a spaceship hull — follow this identical pattern.',
                '`BoxGeometry(width, height, depth)` creates a box centred at the origin. The lane is a very flat box: 1.05 m wide (X), 0.08 m tall (Y), and 18.3 m long (Z). `MeshStandardMaterial` with low roughness gives the polished maple-wood look. Try changing `LANE_ROUGHNESS` from 0.35 to 0.9 and see how the surface changes.',
              ],
              code: `// ─── All dimensions are named constants — no magic numbers ─────────────
const LANE_LENGTH    = 18.3;     // regulation bowling lane length in metres
const LANE_WIDTH     = 1.05;     // regulation lane width in metres
const LANE_THICKNESS = 0.08;     // thin floor slab — very flat
const LANE_COLOR     = 0xc8a96e; // maple-wood tan
const LANE_ROUGHNESS = 0.35;     // polished wood: 0 = mirror, 1 = chalk

// Step 1: Geometry — defines the 3D shape (a cloud of vertices + triangles)
const laneGeometry = new THREE.BoxGeometry(
  LANE_WIDTH,       // x-axis: across the lane (side to side)
  LANE_THICKNESS,   // y-axis: very thin slab
  LANE_LENGTH       // z-axis: down the lane toward the pins
);

// Step 2: Material — defines how light interacts with the surface
const laneMaterial = new THREE.MeshStandardMaterial({
  color:     LANE_COLOR,     // base colour before lighting is applied
  roughness: LANE_ROUGHNESS, // how diffuse vs specular the reflection is
  metalness: 0.0,            // lane is wood, not metal
});

// Step 3: Mesh = Geometry + Material — the single visible object
const laneMesh = new THREE.Mesh(laneGeometry, laneMaterial);

function init() {
  scene.add(laneMesh);            // register mesh in the scene graph

  camera.position.set(0, 6, 14); // elevated view from the foul-line end
  camera.lookAt(0, 0, 0);        // aim at lane centre

  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera); // redraw every animation frame
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Lighting — MeshBasicMaterial vs MeshStandardMaterial',
              mode: '3d',
              prose: [
                '**MeshBasicMaterial** ignores all lights — it renders at full colour no matter how many lights exist in the scene. It is perfect for debug markers, UI overlays, and objects that should appear self-illuminated. **MeshStandardMaterial** uses Physically Based Rendering and responds to every light source. Watch both rotating cubes: the left one is always the same brightness on every face; the right one shows distinct light and shadow faces as it turns.',
                'The sandbox provides two default lights: an `AmbientLight` that softly fills every surface equally (prevents pure-black shadows), and a `DirectionalLight` from the right that casts sharp directional shading. Adding a second directional light from the opposite side acts as a *fill light* — it softens the hard shadow side without eliminating the shading contrast.',
              ],
              code: `// ─── Named constants ───────────────────────────────────────────────────
const BOX_SIZE         = 2.0;      // side length of each demo cube
const BOX_SEPARATION   = 3.0;      // distance each cube is from the centre
const DEMO_COLOR       = 0x4488dd; // medium blue for both cubes
const ROTATION_SPEED   = 0.7;      // radians per second
const FILL_LIGHT_POWER = 0.6;      // intensity of the added fill light

// ─── Left cube: MeshBasicMaterial — completely ignores lights ──────────
// BasicMaterial always renders at full colour, like a glowing LED panel.
const basicCube = new THREE.Mesh(
  new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE),
  new THREE.MeshBasicMaterial({ color: DEMO_COLOR })
);
basicCube.position.x = -BOX_SEPARATION; // place on the left

// ─── Right cube: MeshStandardMaterial — physically-based shading ───────
// StandardMaterial uses PBR: each face receives a different light level.
// Without any light in the scene this cube would be completely black.
const standardCube = new THREE.Mesh(
  new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE),
  new THREE.MeshStandardMaterial({
    color:     DEMO_COLOR, // same base colour as the basic cube
    roughness: 0.4,        // slightly rough — diffuse reflection dominates
    metalness: 0.0,
  })
);
standardCube.position.x = BOX_SEPARATION; // place on the right

let elapsedTime = 0; // total time accumulated since init() was called

function init() {
  scene.add(basicCube);
  scene.add(standardCube);

  // Add a fill light from the left so the shading difference is visible.
  // The sandbox already added an ambient + directional from the upper right.
  const fillLight = new THREE.DirectionalLight(0xffffff, FILL_LIGHT_POWER);
  fillLight.position.set(-10, 5, 8); // from the upper-left-front
  scene.add(fillLight);

  scene.add(new THREE.GridHelper(14, 14)); // orientation reference

  camera.position.set(0, 4, 12);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  elapsedTime += deltaTime;

  // Rotate both cubes at the same speed so the comparison is fair
  basicCube.rotation.y    = elapsedTime * ROTATION_SPEED;
  standardCube.rotation.y = elapsedTime * ROTATION_SPEED;

  renderer.render(scene, camera);
}`,
            },
            {
              id: 3,
              cellTitle: '3D: Multiple meshes — lane, gutters, pin, and ball',
              mode: '3d',
              prose: [
                'Every mesh has a `position` property — a `THREE.Vector3` in world space. `mesh.position.set(x, y, z)` places its centre at those coordinates. Because +Y is up, placing objects on the floor requires adding half-heights: the pin centre is at `FLOOR_TOP + PIN_HEIGHT / 2`. Getting this spatial arithmetic right is a core 3D skill.',
                'The two gutters are identical shapes — only their X position differs. A single `gutterGeometry` object is passed to both `THREE.Mesh` constructors. The shape is uploaded to the GPU once; each mesh stores only its own transform. This is free performance: whenever two objects have the same shape, share the geometry.',
              ],
              code: `// ─── Lane dimensions ──────────────────────────────────────────────────
const LANE_LENGTH     = 18.3;  // regulation lane length in metres
const LANE_WIDTH      = 1.05;  // regulation lane width in metres
const LANE_THICKNESS  = 0.08;  // floor slab height
const FLOOR_TOP       = LANE_THICKNESS / 2; // y-coordinate of the floor surface

// ─── Gutter dimensions ────────────────────────────────────────────────
const GUTTER_WIDTH    = 0.25;  // each gutter channel width
const GUTTER_HEIGHT   = 0.06;  // gutters are slightly lower than the lane
const GUTTER_OFFSET_X = (LANE_WIDTH + GUTTER_WIDTH) / 2; // centre-to-centre offset

// ─── Pin dimensions ────────────────────────────────────────────────────
const PIN_RADIUS_TOP  = 0.06;  // pin narrows toward the top
const PIN_RADIUS_BASE = 0.072; // pin widens slightly at the base
const PIN_HEIGHT      = 0.38;  // standard pin height
const PIN_POSITION_Z  = -6;    // pin placed toward the far end (demo scale)

// ─── Ball dimensions ───────────────────────────────────────────────────
const BALL_RADIUS   = 0.108;   // regulation ball radius (~10.8 cm)
const BALL_START_Z  = 6;       // ball starts near the foul-line end

// ─── Lane floor ────────────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);
// laneMesh stays at origin — its top face is exactly at y = FLOOR_TOP

// ─── Gutters — one geometry shared between two mesh instances ──────────
// Both gutters are the same shape: only x-position differs.
const gutterGeometry = new THREE.BoxGeometry(GUTTER_WIDTH, GUTTER_HEIGHT, LANE_LENGTH);
const gutterMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });

const leftGutter  = new THREE.Mesh(gutterGeometry, gutterMaterial);
const rightGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
leftGutter.position.x  = -GUTTER_OFFSET_X; // mirror to the left
rightGutter.position.x =  GUTTER_OFFSET_X; // mirror to the right

// ─── Pin — a tapered cylinder standing at the far end ─────────────────
const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(PIN_RADIUS_TOP, PIN_RADIUS_BASE, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
// Pin centre y = floor surface + half the pin height
pinMesh.position.set(0, FLOOR_TOP + PIN_HEIGHT / 2, PIN_POSITION_Z);

// ─── Ball — a sphere resting on the lane near the foul line ───────────
const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);
// Ball centre y = floor surface + ball radius (resting, not half-sunken)
ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, BALL_START_Z);

function init() {
  scene.add(laneMesh);
  scene.add(leftGutter);
  scene.add(rightGutter);
  scene.add(pinMesh);
  scene.add(ballMesh);

  camera.position.set(0, 5, 14); // behind the foul line, slightly elevated
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera);
}`,
            },
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: 'Add the backstop wall',
              difficulty: 'easy',
              mode: '3d',
              prose: [
                'The lane is missing its backstop — the vertical wall at the far end that stops the ball after it passes the pins. You already know everything you need: `BoxGeometry` for the wall shape, `MeshStandardMaterial` for a dark colour, and `position.set()` to place it. The Z coordinate of the far end of the lane is `-LANE_LENGTH / 2`.',
              ],
              prompt: 'Add a backstop wall at the far end of the lane (z = -LANE_LENGTH / 2). It should span the full lane plus both gutters (LANE_WIDTH + GUTTER_WIDTH * 2), stand 1 metre tall, and be 0.2 m thick. Use a dark grey material. Set its y position so the base rests on the floor (centre y = FLOOR_TOP + 0.5).',
              hint: 'Declare: `const BACKSTOP_WIDTH = LANE_WIDTH + GUTTER_WIDTH * 2`. Create: `new THREE.BoxGeometry(BACKSTOP_WIDTH, 1.0, 0.2)`. Material: `new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })`. Position: `backstopMesh.position.set(0, FLOOR_TOP + 0.5, -LANE_LENGTH / 2)`. Remember to call `scene.add(backstopMesh)` inside `init()`.',
              code: `// ─── Scene constants (same as Cell 3) ─────────────────────────────────
const LANE_LENGTH     = 18.3;
const LANE_WIDTH      = 1.05;
const LANE_THICKNESS  = 0.08;
const FLOOR_TOP       = LANE_THICKNESS / 2;
const GUTTER_WIDTH    = 0.25;
const GUTTER_HEIGHT   = 0.06;
const GUTTER_OFFSET_X = (LANE_WIDTH + GUTTER_WIDTH) / 2;

const PIN_RADIUS_TOP  = 0.06;
const PIN_RADIUS_BASE = 0.072;
const PIN_HEIGHT      = 0.38;
const BALL_RADIUS     = 0.108;

// ─── Lane ─────────────────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

// ─── Gutters ──────────────────────────────────────────────────────────
const gutterGeometry = new THREE.BoxGeometry(GUTTER_WIDTH, GUTTER_HEIGHT, LANE_LENGTH);
const gutterMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
const leftGutter     = new THREE.Mesh(gutterGeometry, gutterMaterial);
const rightGutter    = new THREE.Mesh(gutterGeometry, gutterMaterial);
leftGutter.position.x  = -GUTTER_OFFSET_X;
rightGutter.position.x =  GUTTER_OFFSET_X;

// ─── Pin ──────────────────────────────────────────────────────────────
const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(PIN_RADIUS_TOP, PIN_RADIUS_BASE, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.set(0, FLOOR_TOP + PIN_HEIGHT / 2, -6);

// ─── Ball ─────────────────────────────────────────────────────────────
const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);
ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, 6);

// ─── TODO: add the backstop wall ──────────────────────────────────────
// const BACKSTOP_WIDTH = ???
// const backstopMesh = new THREE.Mesh(???, ???)
// backstopMesh.position.set(???)

function init() {
  scene.add(laneMesh);
  scene.add(leftGutter);
  scene.add(rightGutter);
  scene.add(pinMesh);
  scene.add(ballMesh);
  // scene.add(backstopMesh)  ← uncomment when ready

  camera.position.set(0, 5, 14);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera);
}`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'In Three.js, +Y is the up axis. When positioning a ball of radius 0.5 sitting on the floor, what Y-coordinate should its center be at?',
      options: [
        '0 — the center is at the floor level',
        '0.5 — the center is one radius above the floor. If positioned at Y=0, the bottom half of the sphere would be below the floor plane',
        '1 — the diameter above the floor',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'MeshStandardMaterial responds to lights physically. MeshBasicMaterial ignores lights and renders at full color. When would you choose MeshBasicMaterial?',
      options: [
        'For all objects — MeshBasicMaterial renders faster than MeshStandardMaterial',
        'For objects that should always be fully visible regardless of lighting: lane edge lines, UI overlays, wireframes, or debugging visualizations. Standard is correct for opaque surfaces (the ball, pins, lane) where you want realistic shading and shadow response',
        'MeshBasicMaterial is required for objects that cast shadows',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A scene hierarchy: `scene.add(mesh)`. The lane is 18m long and placed with `lane.position.z = -9`. Why position it in the −Z direction?',
      options: [
        'Three.js cameras always look in the −Z direction by default. The lane extends away from the camera, which starts near Z=0 looking down −Z. Negative Z is "into the scene" — where the pins are',
        'Positive Z is reserved for the camera position',
        'The bowling convention is that gutters are along the Z axis',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The bowling app calls `renderer.render(scene, camera)` inside `update(deltaTime)`. Why is rendering inside update correct here, even though more complex apps often separate update and render passes?',
      options: [
        'Three.js requires render to be called inside update',
        'This simple scene has no post-processing or multi-pass rendering. Calling render once per frame at the end of update is the standard Three.js pattern: advance physics, then draw. Separate update/render passes are only needed for shadow maps, reflections, or render-to-texture effects',
        'Rendering inside update doubles the frame rate',
      ],
      correct: 1,
    },
  ],
}
