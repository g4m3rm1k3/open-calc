export default {
  id: 'sim3-003',
  slug: 'vectors-and-formation',
  chapter: 'sim3',
  order: 3,
  title: 'Vectors & Formation',
  subtitle: 'THREE.Vector3 is the universal data type of 3D simulation — it represents a position, a displacement, a direction, and a velocity. Same three numbers, different mathematical interpretations.',
  tags: ['three.js', 'vector3', 'formation', 'group', 'displacement', 'normalize', 'distanceTo', 'algorithm', '3d'],
  aliases: 'vector3 position direction displacement normalize distanceTo group hierarchy scene graph formation algorithm array three.js',
  timeToComplete: 35,
  coreConcept: 'THREE.Vector3 stores x, y, z and provides arithmetic: sub() for displacement, normalize() for direction, multiplyScalar() to scale, add() to translate, distanceTo() for distance. An array of Vector3 built with a loop avoids hardcoded positions and scales to any formation size. THREE.Group lets you position, rotate, and scale many meshes as a single unit.',
  prerequisites: ['sim3-002'],
  nextLesson: 'dot-and-cross-product',

  hook: {
    question: 'Bowling pins are always in the same diamond pattern. How do you place 10 of them without writing 10 separate position.set() calls — and how do you then move the whole formation to the pin deck as a single object?',
    realWorldContext: 'Every simulation that manages collections of objects faces the same two problems: how to compute initial positions algorithmically, and how to group objects so they can be transformed together.\n\nA crowd simulation spawns hundreds of agents at positions computed from a formula, not typed by hand. A particle system positions thousands of particles in a loop. A robotic arm has bones that are grouped in a hierarchy — rotating the shoulder automatically carries the elbow and wrist with it. THREE.Group solves the grouping problem. Arrays of THREE.Vector3 solve the position problem. Together they are the foundation of every scene with more than a handful of objects.',
  },

  intuition: {
    prose: [
      '**THREE.Vector3 is a triple (x, y, z) with arithmetic built in.** The same object type represents a position in world space, a displacement between two positions, a direction of travel, and a velocity. The distinction is in how you use it: subtract two positions and you get a displacement; normalize a displacement and you get a direction; multiply a direction by a speed and you get a velocity. Learning to fluently convert between these interpretations is the core skill of 3D programming.',

      '**Sub, normalize, multiplyScalar, add — the four fundamental operations.** `a.clone().sub(b)` computes the vector from b to a. `.normalize()` scales it to length 1, discarding distance but preserving direction. `.multiplyScalar(k)` scales all three components by k. `.add(v)` translates by v. Chaining these produces any vector expression: `origin.clone().add(direction.clone().multiplyScalar(speed * time))` is the basic projectile equation.',

      '**Always `.clone()` before a destructive operation.** Every method like `sub()`, `normalize()`, `add()`, and `multiplyScalar()` modifies the vector in place and returns `this`. Without `.clone()`, you corrupt the original. The pattern is: to compute something from `existingVec` without touching it, start with `existingVec.clone()` and chain the operations onto the copy.',

      '**THREE.Group is a scene graph node with no geometry.** Adding meshes to a Group makes them children — they inherit the group\'s position, rotation, and scale. Moving the group moves all children simultaneously. Child positions are in **local space** (relative to the group origin), not world space. This is how characters have bones, vehicles have wheels, and formations have members. It is the same concept as a transform hierarchy in Unity, Blender, or any other 3D system.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'L02 Challenge Answer — Smooth Lerp Follow',
        body: '```js\n// Module scope — persists between frames\nconst currentCamPos = new THREE.Vector3();\n\n// In init():\ncurrentCamPos.set(0, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);\n\n// In update():\nconst targetCamPos = new THREE.Vector3(\n  ballMesh.position.x,\n  CAM_HEIGHT,\n  ballMesh.position.z + CAM_BEHIND_DIST\n);\nconst lerpFactor = Math.min(SMOOTH_SPEED * deltaTime, 1.0);\ncurrentCamPos.lerp(targetCamPos, lerpFactor);\ncamera.position.copy(currentCamPos);\n```\n\n`Math.min(..., 1.0)` prevents overshoot at low frame rates. `SMOOTH_SPEED = 4` → floaty; `SMOOTH_SPEED = 12` → snappy.',
      },
      {
        type: 'procedure',
        title: 'Vector3 Key Methods',
        body: '```js\nconst a = new THREE.Vector3(1, 0, -3);\nconst b = new THREE.Vector3(0, 0, 0);\n\n// Displacement: vector FROM b TO a\nconst d = a.clone().sub(b);          // (1, 0, -3)\n\n// Distance: scalar magnitude of displacement\nconst dist = a.distanceTo(b);         // same as d.length()\n\n// Direction: unit vector (length = 1)\nconst dir = d.clone().normalize();    // (0.316, 0, -0.949)\n\n// Scale: multiply all components\nconst vel = dir.clone().multiplyScalar(5); // velocity at speed 5\n\n// Translate: add a vector\nconst future = a.clone().add(vel);    // position in 1 second\n```\n\nAll mutating methods return `this`, so calls chain. Always `.clone()` first if you need the original unchanged.',
      },
      {
        type: 'insight',
        title: 'Pin Formation Formula',
        body: 'Row `r` (0 = head pin) has `r + 1` pins. Pin `c` in row `r`:\n\n```\nx = (c − r/2) × PIN_SPACING\nz = HEAD_PIN_Z − r × PIN_SPACING\n```\n\nThe `c − r/2` term centres each row on `x = 0`. Row 0: c=0, offset=0. Row 1: c=0→ −0.5, c=1→ +0.5. Row 2: c=0→ −1, c=1→ 0, c=2→ +1. All in units of PIN_SPACING.',
      },
      {
        type: 'insight',
        title: 'Local Space vs World Space',
        body: 'When you add a mesh to a Group, `mesh.position` is in **local space** — relative to the group\'s own origin. The Group\'s `position` is in **world space**.\n\n```js\npin.position.set(0.305, 0.23, -0.305); // local: 0.305m right of group origin\ngroup.position.set(0, 0, -7.35);       // world: group is at z = -7.35\n// pin is at world position (0.305, 0.23, -7.655)\n```\n\nTo get a child\'s world position: `mesh.getWorldPosition(new THREE.Vector3())`.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Vector3 Arithmetic & Pin Formation',
        mathBridge: 'Cell 1 uses an ArrowHelper to visualise the displacement and direction vectors between two objects. Cell 2 computes all 10 pin positions with one nested loop. Cell 3 assembles everything — formation in a Group, smooth camera follow — into a complete scene. The challenge introduces distanceTo(), which is the foundation of collision detection in L05.',
        caption: 'All cells use Three.js 3D mode. OrbitControls are active.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: Vector3 arithmetic — displacement, direction, prediction',
              mode: '3d',
              prose: [
                '`pinPosition.clone().sub(ballPosition)` produces the **displacement** vector — it points from the ball to the pin and has the same length as the distance between them. `.normalize()` shrinks it to length 1, keeping only the direction. The orange arrow visualises these: it starts at the ball, points toward the pin, and its length equals the actual distance.',
                'The cyan marker shows where the ball will be **1 second from now** — computed by adding the velocity vector (direction × speed) to the current position. This is the basic kinematic equation: `position₁ = position₀ + velocity × Δt`. Every particle system, projectile, and physics body uses this.',
              ],
              code: `// ─── Named constants ───────────────────────────────────────────────────
const BALL_RADIUS     = 0.108;   // metres
const PIN_HEIGHT      = 0.38;
const FLOOR_Y         = 0.04;    // simplified floor surface y
const ROLL_SPEED      = 5.0;     // m/s — used for the prediction marker
const BALL_DEMO_Z     = 2.5;     // starting z for this demo

// ─── Positions stored as Vector3 objects ───────────────────────────────
const ballPosition = new THREE.Vector3(0, FLOOR_Y + BALL_RADIUS, BALL_DEMO_Z);
const pinPosition  = new THREE.Vector3(0, FLOOR_Y + PIN_HEIGHT / 2, 0);

// ─── Step 1: Displacement — the vector from ball to pin ────────────────
// .clone() creates a new Vector3 so pinPosition is not changed
// .sub(other) subtracts other's components from this vector
const displacement = pinPosition.clone().sub(ballPosition);
// displacement: (0, ~0, ~-2.5) — points in -Z toward the pin

// ─── Step 2: Direction — normalize to unit length (1.0) ───────────────
// Normalization divides each component by the vector's length.
// Result is a "heading" — WHERE to go, without HOW FAR.
const travelDir = displacement.clone().normalize();

// ─── Step 3: Predicted position — where ball will be in 1 second ──────
// Velocity vector = direction × speed (units: metres per second per axis)
const velocityVec    = travelDir.clone().multiplyScalar(ROLL_SPEED);
// Future position = current position + velocity × 1 second
const positionIn1Sec = ballPosition.clone().add(velocityVec);

// ─── Meshes ────────────────────────────────────────────────────────────
const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2 })
);
ballMesh.position.copy(ballPosition); // .copy() sets position to a Vector3

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.copy(pinPosition);

// Arrow showing the direction vector (orange, length = actual distance)
const directionArrow = new THREE.ArrowHelper(
  travelDir,             // unit direction vector
  ballPosition,          // arrow origin
  displacement.length(), // arrow length = gap between ball and pin
  0xff6600,              // orange colour
  0.18,                  // head length
  0.08                   // head width
);

// Small sphere marking the 1-second predicted position (cyan)
const predictionMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 12, 12),
  new THREE.MeshBasicMaterial({ color: 0x00ccff })
);
predictionMarker.position.copy(positionIn1Sec);

// Thin lane floor for spatial context
const laneFloor = new THREE.Mesh(
  new THREE.BoxGeometry(1.05, 0.08, 6),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);
laneFloor.position.z = -0.5; // centre the floor under the action

function init() {
  scene.add(laneFloor);
  scene.add(ballMesh);
  scene.add(pinMesh);
  scene.add(directionArrow); // visualises the displacement/direction vector
  scene.add(predictionMarker);

  camera.position.set(2.5, 2.0, 4.0);
  camera.lookAt(0, 0.3, 0.5);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera);
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Pin formation — array of Vector3 from a loop',
              mode: '3d',
              prose: [
                'Rather than writing 10 hardcoded `position.set()` calls, a nested loop computes every pin position from a formula. The outer loop walks the 4 rows (1 to 4 pins). The inner loop places each pin in the row using `(colIndex − rowIndex / 2) × PIN_SPACING` to centre the row on `x = 0`. Change `PIN_SPACING` or `PIN_ROWS` and the formation resizes automatically.',
                'Each pin gets its own `material.clone()` — this is essential. If all pins shared a single material object, changing one pin\'s colour would change all of them. `.clone()` creates a new material with the same initial values but an independent colour property. This is the standard pattern whenever objects need individual appearance states.',
              ],
              code: `// ─── Pin formation constants ───────────────────────────────────────────
const PIN_SPACING  = 0.305;   // regulation: 305 mm centre-to-centre (12 inches)
const PIN_ROWS     = 4;       // 4 rows: 1+2+3+4 = 10 pins total
const PIN_HEIGHT   = 0.38;    // standard pin height
const FLOOR_Y      = 0.04;    // floor surface y-coordinate
const HEAD_PIN_Z   = 0;       // head pin (row 0) sits at z = 0 in this demo

// ─── Shared geometry — one GPU upload for all 10 pins ──────────────────
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

const pinMeshes    = [];   // all 10 pin meshes (used in update for coloring)
const pinPositions = [];   // all 10 Vector3 positions (used for distance checks)

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1; // row 0 = 1 pin, row 3 = 4 pins

  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    // Centre each row on x = 0:
    // row 0: offset = 0         (one pin, dead centre)
    // row 1: offsets = -0.5, +0.5
    // row 2: offsets = -1, 0, +1
    // row 3: offsets = -1.5, -0.5, +0.5, +1.5
    const pinX = (colIndex - rowIndex / 2) * PIN_SPACING;

    // Step one PIN_SPACING further back in -Z for each successive row
    const pinZ = HEAD_PIN_Z - rowIndex * PIN_SPACING;

    const pinPos = new THREE.Vector3(pinX, FLOOR_Y + PIN_HEIGHT / 2, pinZ);
    pinPositions.push(pinPos);

    // Clone the material so each pin can have an independent colour
    const pinMesh = new THREE.Mesh(pinGeometry, baseMaterial.clone());
    pinMesh.position.copy(pinPos);
    pinMeshes.push(pinMesh);
  }
}

// ─── Lane floor for spatial reference ──────────────────────────────────
const laneFloor = new THREE.Mesh(
  new THREE.BoxGeometry(1.05, 0.08, 3),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);
laneFloor.position.z = -0.6;

function init() {
  pinMeshes.forEach(pin => scene.add(pin));
  scene.add(laneFloor);

  // Overhead-ish view to see the full diamond formation
  camera.position.set(0, 3, 2.5);
  camera.lookAt(0, 0, -0.4);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera);
}`,
            },
            {
              id: 3,
              cellTitle: '3D: THREE.Group — move the whole formation as one object',
              mode: '3d',
              prose: [
                '`new THREE.Group()` creates a scene graph node with no geometry. Adding meshes to it with `group.add(mesh)` makes them children: their `position` is now in local space (relative to the group origin), and they inherit every transform applied to the group. `pinGroup.position.set(0, 0, PIN_DECK_Z)` moves all 10 pins to the pin deck in one line.',
                'This cell also applies the smooth camera follow from L02 so the whole lane is visible. The ball rolls to the formation and resets — the pins stand still for now (L06 handles scatter). Notice how every concept from the previous lessons composes naturally: the Group from this lesson, the camera lerp from L02, the lane geometry from L01.',
              ],
              code: `// ─── Lane and ball constants ───────────────────────────────────────────
const LANE_LENGTH     = 18.3;
const LANE_WIDTH      = 1.05;
const LANE_THICKNESS  = 0.08;
const FLOOR_TOP       = LANE_THICKNESS / 2;
const FOUL_LINE_Z     = LANE_LENGTH / 2;
const PIN_DECK_Z      = -(LANE_LENGTH / 2 - 1.8); // regulation pin deck

const BALL_RADIUS     = 0.108;
const ROLL_SPEED      = 5.0;
const ANGULAR_SPEED   = ROLL_SPEED / BALL_RADIUS; // omega = v / r

// ─── Camera follow constants ────────────────────────────────────────────
const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3(); // lerp state persists across frames

// ─── Pin formation constants ────────────────────────────────────────────
const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;
const pinGeometry  = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinBaseMat   = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

// ─── Build the lane ─────────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

// ─── Build the pin formation inside a Group ─────────────────────────────
// Pin positions are LOCAL to the group (head pin at group origin)
const pinGroup = new THREE.Group();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinLocalX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const pinLocalZ = -rowIndex * PIN_SPACING;    // local -Z = toward the back

    const pinMesh = new THREE.Mesh(pinGeometry, pinBaseMat.clone());
    pinMesh.position.set(pinLocalX, FLOOR_TOP + PIN_HEIGHT / 2, pinLocalZ);
    pinGroup.add(pinMesh);  // add to group, not directly to scene
  }
}

// Move the entire group to the pin deck — all 10 pins move together
pinGroup.position.set(0, 0, PIN_DECK_Z);

// ─── Ball ───────────────────────────────────────────────────────────────
const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);  // one add() brings all 10 child pins into the scene
  scene.add(ballMesh);

  ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  currentCamPos.set(0, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);

  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  // ─── Ball motion ───────────────────────────────────────────────────────
  ballMesh.position.z -= ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z - 1) {
    ballMesh.position.z = FOUL_LINE_Z;
    ballMesh.rotation.x = 0;
  }

  // ─── Smooth camera follow (lerp from L02 challenge) ───────────────────
  const targetCamPos = new THREE.Vector3(
    ballMesh.position.x,
    CAM_HEIGHT,
    ballMesh.position.z + CAM_BEHIND_DIST
  );
  const lerpFactor = Math.min(SMOOTH_SPEED * deltaTime, 1.0);
  currentCamPos.lerp(targetCamPos, lerpFactor);
  camera.position.copy(currentCamPos);
  camera.lookAt(ballMesh.position.x, 0, ballMesh.position.z - CAM_LOOK_AHEAD);

  renderer.render(scene, camera);
}`,
            },
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: 'Highlight the closest pin using distanceTo()',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                '`Vector3.distanceTo(otherVector3)` returns the straight-line distance between two points — it is the length of the displacement vector between them, computed in one call. In `update()`, loop over all pins, compute the distance from each to the ball, track the minimum, and colour that pin red. Reset all other pins to white first so only one is highlighted at a time.',
                'This is the first step of collision detection: determine which object is closest to the projectile. L05 (Collision Detection) will extend this into a proper contact test. `distanceTo()` on a `Vector3` is `Math.sqrt((dx² + dy² + dz²))` — the Euclidean distance formula expressed as a method.',
              ],
              prompt: 'In `update()`, find the pin whose world position is closest to the ball. Colour it red (`PIN_CLOSE_HEX`) if the distance is less than `HIGHLIGHT_DIST`, and white (`PIN_WHITE_HEX`) otherwise. Every other pin should be white. Hint: call `pin.getWorldPosition(tempVec)` to get a pin\'s world position (since pins are children of `pinGroup`, their `pin.position` is local, not world).',
              hint: 'Declare `const tempVec = new THREE.Vector3()` at module scope. In `update()`, track `let closestDist = Infinity; let closestPin = null;`. Loop: `pinMeshes.forEach(pin => { pin.getWorldPosition(tempVec); const dist = tempVec.distanceTo(ballMesh.position); if (dist < closestDist) { closestDist = dist; closestPin = pin; } });`. Then reset all to white, and if `closestDist < HIGHLIGHT_DIST`, set `closestPin.material.color.setHex(PIN_CLOSE_HEX)`.',
              code: `// ─── Constants (same as Cell 3) ────────────────────────────────────────
const LANE_LENGTH     = 18.3;
const LANE_WIDTH      = 1.05;
const LANE_THICKNESS  = 0.08;
const FLOOR_TOP       = LANE_THICKNESS / 2;
const FOUL_LINE_Z     = LANE_LENGTH / 2;
const PIN_DECK_Z      = -(LANE_LENGTH / 2 - 1.8);

const BALL_RADIUS     = 0.108;
const ROLL_SPEED      = 5.0;
const ANGULAR_SPEED   = ROLL_SPEED / BALL_RADIUS;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

const PIN_SPACING     = 0.305;
const PIN_ROWS        = 4;
const PIN_HEIGHT      = 0.38;

// ─── Highlight colours ──────────────────────────────────────────────────
const PIN_WHITE_HEX   = 0xffffff;  // default pin colour
const PIN_CLOSE_HEX   = 0xff3333;  // red when ball is nearby
const HIGHLIGHT_DIST  = 2.5;       // metres — highlight threshold

// ─── TODO: world-position scratch vector (reused each frame) ───────────
// const tempVec = new THREE.Vector3()

// ─── Build scene ────────────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const pinGroup    = new THREE.Group();
const pinMeshes   = [];    // keep references for per-frame colour updates
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinBaseMat  = new THREE.MeshStandardMaterial({ color: PIN_WHITE_HEX, roughness: 0.3 });

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinLocalX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const pinLocalZ = -rowIndex * PIN_SPACING;
    const pinMesh   = new THREE.Mesh(pinGeometry, pinBaseMat.clone());
    pinMesh.position.set(pinLocalX, FLOOR_TOP + PIN_HEIGHT / 2, pinLocalZ);
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh); // store reference for colour changes
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);

  ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  currentCamPos.set(0, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  // ─── Ball motion ─────────────────────────────────────────────────────
  ballMesh.position.z -= ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z - 1) {
    ballMesh.position.z = FOUL_LINE_Z;
    ballMesh.rotation.x = 0;
  }

  // ─── Camera follow ───────────────────────────────────────────────────
  const targetCamPos = new THREE.Vector3(
    ballMesh.position.x, CAM_HEIGHT, ballMesh.position.z + CAM_BEHIND_DIST
  );
  currentCamPos.lerp(targetCamPos, Math.min(SMOOTH_SPEED * deltaTime, 1.0));
  camera.position.copy(currentCamPos);
  camera.lookAt(ballMesh.position.x, 0, ballMesh.position.z - CAM_LOOK_AHEAD);

  // ─── TODO: find the closest pin and colour it red ─────────────────────
  // Loop through pinMeshes.
  // Use tempVec.getWorldPosition() — wait, use pin.getWorldPosition(tempVec)
  // then tempVec.distanceTo(ballMesh.position)
  // Track closestDist and closestPin
  // After the loop: reset all to PIN_WHITE_HEX, then set closestPin to PIN_CLOSE_HEX

  renderer.render(scene, camera);
}`,
            },
          ],
        },
      },
    ],
  },
}
