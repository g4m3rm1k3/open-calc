export default {
  id: 'sim3-005',
  slug: 'collision-detection',
  chapter: 'sim3',
  order: 5,
  title: 'Collision Detection',
  subtitle: 'Two spheres overlap when the distance between their centres falls below the sum of their radii. One test, checked every frame, is the foundation of every real-time physics engine.',
  tags: ['collision', 'sphere-sphere', 'distanceTo', 'set', 'edge-detection', 'userData', 'three.js', 'bowling'],
  aliases: 'collision detection sphere sphere distance overlap hit test physics userData set edge trigger three.js bowling simulation',
  timeToComplete: 35,
  coreConcept: 'distanceTo(other) < r1 + r2 — two spheres overlap when the distance between their centres is less than the sum of their radii. Checking this every frame is level-triggered detection: the condition is true for multiple frames while the ball overlaps. To fire a response exactly once per contact, use a Set — a pin is added on the frame it is first hit and skipped on all subsequent frames until the Set is cleared for the next throw.',
  prerequisites: ['sim3-004'],
  nextLesson: 'physics-response',

  hook: {
    question: 'The ball travels 18 metres toward 10 pins. When exactly does the simulation decide a collision has happened — and how does it make sure a pin is only counted once?',
    realWorldContext: 'Every physics engine reduces collision detection to the same question: do these two objects overlap right now? For convex shapes the answer comes from the GJK algorithm; for spheres it collapses to a single distance comparison.\n\nThe distance test runs every simulation frame — 60 times per second. But most simulations also need to know when something first happened: a score increments once, a sound plays once, a particle burst fires once. That requirement — the condition is true continuously, but the response fires at most once per event — is called edge-triggered detection. It appears in every game loop, every UI event system, and every hardware interrupt handler. The implementation is always the same: a Set or boolean flag that records "already processed."\n\nIn bowling, the sphere-sphere test is a reasonable approximation: the ball is a sphere, and the effective collision volume of a pin can be represented as a small sphere centred on its body. In a game with irregular shapes the collision hull would be a capsule or a convex mesh, but the level/edge-triggered logic applies unchanged.',
  },

  intuition: {
    prose: [
      '**Sphere-sphere test: one comparison.** Two spheres with radii `r1` and `r2` overlap when `distance(centre1, centre2) < r1 + r2`. Three.js provides `vec.distanceTo(other)` for the left side. The right side — `SUM_OF_RADII = r1 + r2` — is a constant you compute once outside the loop.',

      '**Level-triggered vs edge-triggered.** Checking `distance < sumOfRadii` every frame is *level-triggered*: the condition is `true` for multiple consecutive frames while the ball overlaps the pin. To fire a response exactly once — increment a score, start an animation — you need *edge detection*: fire only on the frame the condition first becomes `true`. Use a `Set`: `if (dist < SUM_OF_RADII && !hitPins.has(pin)) { hitPins.add(pin); /* runs once */ }`. Clear the `Set` at the start of each new throw.',

      '**Per-object state with `userData`.** Every Three.js `Mesh` has a `userData` property — a plain JavaScript object you can put anything on. Storing `pin.userData.fallAngle = 0` and `pin.userData.falling = false` directly on the mesh means the animation state travels with the object. There is no separate parallel array to keep in sync, and no index mismatch bugs.',

      '**Order of operations in `update()`.** The order matters for correctness: (1) advance positions, (2) test collisions against the *new* positions, (3) apply first-contact responses, (4) advance ongoing animations. Testing old positions creates one-frame lag in collision registration; applying responses before moving causes objects to appear to clip through each other.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'L04 Challenge Answer — Per-Pin Dot Product Loop',
        body: "```js\n// Inside update() — colour each pin by alignment with ball heading\npinMeshes.forEach(pin => {\n  pin.getWorldPosition(tempVec);\n  const dirToPin   = tempVec.clone().sub(ballMesh.position).normalize();\n  const brightness = Math.max(0, ballVelDir.dot(dirToPin));\n  pin.material.color.setScalar(brightness);  // white = in path, black = off-path\n});\n```\n\nThe hook shot (`BALL_X_OFFSET = -0.2`, `HOOK_ANGLE_DEG = 1.0`) tilts the heading slightly right of centre, so the head pin and left-side pins glow white while the right-side pins stay dark.",
      },
      {
        type: 'procedure',
        title: 'Sphere-Sphere Detection Pattern',
        body: "```js\n// Compute once — not inside the update loop\nconst SUM_OF_RADII = BALL_RADIUS + PIN_COLLISION_RADIUS;\n\n// Level-triggered: fires every frame the condition is true\nconst dist = ballMesh.position.distanceTo(pinMesh.position);\nif (dist < SUM_OF_RADII) { /* may run 30+ times for one collision */ }\n\n// Edge-triggered: fires at most once per pin per throw\nconst hitPins = new Set();\n// ...\nif (dist < SUM_OF_RADII && !hitPins.has(pin)) {\n  hitPins.add(pin);  // mark processed — block will not run again\n  // first-contact response here\n}\nhitPins.clear(); // reset at end of throw\n```",
      },
      {
        type: 'warning',
        title: 'Tunnelling at High Speeds',
        body: "The sphere-sphere test only checks overlap at the current frame position. If the ball moves more than `SUM_OF_RADII` in one frame it can pass completely through a pin without detection — this is called tunnelling. At 5 m/s and 60 fps the ball moves about 0.083 m per frame, well within the 0.18 m detection zone. At very high speeds a swept-sphere (capsule) test is required.",
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Sphere Collision: Detection and Response',
        mathBridge: "Cell 1 makes the collision condition visible: a wireframe sphere of radius SUM_OF_RADII surrounds the pin — when the ball centre enters it, the detection triggers. Cell 2 extends this to all 10 pins with a per-frame loop (level-triggered). Cell 3 adds edge-triggered first-contact logic via a Set and stores fall animation state in userData.",
        caption: 'All cells use Three.js 3D mode. OrbitControls active.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: Sphere-sphere collision — the distance test visualised',
              mode: '3d',
              prose: [
                'The wireframe green sphere around the pin has radius `SUM_OF_RADII = BALL_RADIUS + PIN_COLLISION_RADIUS`. The collision condition `distanceTo() < SUM_OF_RADII` becomes geometrically obvious: the moment the ball centre crosses the surface of that sphere, the test fires. Both the pin and the zone turn red to confirm it.',
                'This is a *level-triggered* check: the colours stay red for every frame the ball is inside the zone, then revert when the ball exits. The ball triggers the zone well before it visually reaches the pin body — because the detection distance (0.18 m) is the sum of both radii, not zero.',
              ],
              code: `// ─── Object dimensions ───────────────────────────────────────────────────
const BALL_RADIUS          = 0.108;   // regulation bowling ball
const PIN_COLLISION_RADIUS = 0.072;   // effective sphere approximation for pin body
const SUM_OF_RADII         = BALL_RADIUS + PIN_COLLISION_RADIUS;  // 0.180 m

const PIN_HEIGHT = 0.38;
const BALL_SPEED = 3.0;   // m/s

const PIN_POS      = new THREE.Vector3(0, 0, -3);
const BALL_START_Z = 5.5;

// ─── Collision zone: wireframe sphere with radius = SUM_OF_RADII ──────────
// The ball centre entering this sphere means distanceTo() < SUM_OF_RADII is true.
const zoneMesh = new THREE.Mesh(
  new THREE.SphereGeometry(SUM_OF_RADII, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0x44ff44, wireframe: true })
);
zoneMesh.position.copy(PIN_POS);

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.copy(PIN_POS);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);
ballMesh.position.set(0, 0, BALL_START_Z);

const PIN_DEFAULT_HEX  = 0xffffff;
const PIN_HIT_HEX      = 0xff2222;
const ZONE_DEFAULT_HEX = 0x44ff44;
const ZONE_HIT_HEX     = 0xff4444;

function init() {
  scene.add(zoneMesh);
  scene.add(pinMesh);
  scene.add(ballMesh);
  scene.add(new THREE.GridHelper(14, 14));

  // Overhead view — collision zone reads clearly as a circle in the XZ plane
  camera.position.set(0, 10, 4);
  camera.lookAt(0, 0, -1);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  // Advance ball along -Z toward the pin
  ballMesh.position.z -= BALL_SPEED * deltaTime;

  // Reset once ball travels well past the pin
  if (ballMesh.position.z < PIN_POS.z - 3) {
    ballMesh.position.set(0, 0, BALL_START_Z);
    pinMesh.material.color.setHex(PIN_DEFAULT_HEX);
    zoneMesh.material.color.setHex(ZONE_DEFAULT_HEX);
  }

  // ─── THE collision test ───────────────────────────────────────────────
  const dist        = ballMesh.position.distanceTo(PIN_POS);
  const isColliding = dist < SUM_OF_RADII;

  // Visual response: pin and zone turn red while isColliding is true
  pinMesh.material.color.setHex(isColliding  ? PIN_HIT_HEX      : PIN_DEFAULT_HEX);
  zoneMesh.material.color.setHex(isColliding ? ZONE_HIT_HEX     : ZONE_DEFAULT_HEX);

  renderer.render(scene, camera);
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Per-frame detection loop — level-triggered over all 10 pins',
              mode: '3d',
              prose: [
                'The detection loop runs over all 10 pins every frame. Any pin within `SUM_OF_RADII` of the ball turns red; others stay white. This is *level-triggered*: pins revert automatically as soon as the ball moves away. There is no memory of previous frames — each frame is evaluated independently.',
                'Notice the ball can be inside multiple collision zones at once. A head-on hit reaches the head pin first, but the second-row pins enter range within the next few frames. Level-triggered detection does not distinguish between "just hit" and "still overlapping." That distinction requires a Set, introduced in Cell 3.',
              ],
              code: `// ─── Lane constants ──────────────────────────────────────────────────────
const LANE_LENGTH          = 18.3;
const LANE_WIDTH           = 1.05;
const LANE_THICKNESS       = 0.08;
const FLOOR_TOP            = LANE_THICKNESS / 2;
const FOUL_LINE_Z          = LANE_LENGTH / 2;
const PIN_DECK_Z           = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS          = 0.108;
const PIN_COLLISION_RADIUS = 0.072;
const SUM_OF_RADII         = BALL_RADIUS + PIN_COLLISION_RADIUS;

// ─── Ball trajectory ──────────────────────────────────────────────────────
const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir     = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ROLL_SPEED     = 5.0;
const ANGULAR_SPEED  = ROLL_SPEED / BALL_RADIUS;

// ─── Pin formation ────────────────────────────────────────────────────────
const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;
const pinGeometry  = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);

const pinGroup  = new THREE.Group();
const pinMeshes = [];
const tempVec   = new THREE.Vector3();  // scratch vector, reused every frame

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pinMesh.position.set(
      (colIndex - rowIndex / 2) * PIN_SPACING,
      FLOOR_TOP + PIN_HEIGHT / 2,
      -rowIndex * PIN_SPACING
    );
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

const PIN_DEFAULT_HEX = 0xffffff;
const PIN_HIT_HEX     = 0xff2222;

// ─── Camera follow ────────────────────────────────────────────────────────
const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);
  ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  currentCamPos.set(BALL_X_OFFSET, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  // ─── 1. Roll ball ─────────────────────────────────────────────────────
  ballMesh.position.x += ballVelDir.x * ROLL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z - 1) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
    pinMeshes.forEach(pin => pin.material.color.setHex(PIN_DEFAULT_HEX));
  }

  // ─── 2. LEVEL-TRIGGERED detection: independent each frame ────────────
  // Pins revert to white on the same frame the ball exits the collision zone.
  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);               // group-local → world position
    const dist        = tempVec.distanceTo(ballMesh.position);
    const isColliding = dist < SUM_OF_RADII;
    pin.material.color.setHex(isColliding ? PIN_HIT_HEX : PIN_DEFAULT_HEX);
  });

  // ─── 3. Smooth camera follow ──────────────────────────────────────────
  const targetCamPos = new THREE.Vector3(
    ballMesh.position.x, CAM_HEIGHT, ballMesh.position.z + CAM_BEHIND_DIST
  );
  currentCamPos.lerp(targetCamPos, Math.min(SMOOTH_SPEED * deltaTime, 1.0));
  camera.position.copy(currentCamPos);
  camera.lookAt(ballMesh.position.x, 0, ballMesh.position.z - CAM_LOOK_AHEAD);

  renderer.render(scene, camera);
}`,
            },
            {
              id: 3,
              cellTitle: '3D: Edge-triggered first contact — Set + userData fall animation',
              mode: '3d',
              prose: [
                'A `Set` called `hitPins` converts level-triggered detection into edge-triggered. The collision condition still runs every frame, but the first-contact block only executes when `!hitPins.has(pin)`. The moment it runs, `hitPins.add(pin)` ensures it cannot run again for that pin until the `Set` is cleared at the next throw reset.',
                'Fall state lives on each mesh via `userData`. `pin.userData.falling` and `pin.userData.fallAngle` are plain properties — no external arrays needed. The fall animation advances independently of the collision test each frame: even after the ball has long moved on, falling pins continue rotating toward `PI / 2` (lying flat).',
              ],
              code: `// ─── Constants ───────────────────────────────────────────────────────────
const LANE_LENGTH          = 18.3;
const LANE_WIDTH           = 1.05;
const LANE_THICKNESS       = 0.08;
const FLOOR_TOP            = LANE_THICKNESS / 2;
const FOUL_LINE_Z          = LANE_LENGTH / 2;
const PIN_DECK_Z           = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS          = 0.108;
const PIN_COLLISION_RADIUS = 0.072;
const SUM_OF_RADII         = BALL_RADIUS + PIN_COLLISION_RADIUS;

const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir     = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ROLL_SPEED     = 5.0;
const ANGULAR_SPEED  = ROLL_SPEED / BALL_RADIUS;

const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;

// Fall animation: pin rotates from 0 to PI/2 (lying flat) at PIN_FALL_SPEED rad/s
const PIN_FALL_SPEED = 3.5;
const PIN_FALL_MAX   = Math.PI / 2;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pinMesh.position.set(
      (colIndex - rowIndex / 2) * PIN_SPACING,
      FLOOR_TOP + PIN_HEIGHT / 2,
      -rowIndex * PIN_SPACING
    );
    // Fall state lives on the mesh — no external arrays
    pinMesh.userData.falling   = false;
    pinMesh.userData.fallAngle = 0;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

// ─── hitPins: turns level detection into edge detection ───────────────────
// Pins enter this Set on first contact and stay until the Set is cleared.
const hitPins = new Set();

const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);
  ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  currentCamPos.set(BALL_X_OFFSET, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  // ─── 1. Advance ball ──────────────────────────────────────────────────
  ballMesh.position.x += ballVelDir.x * ROLL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  // ─── Reset throw ──────────────────────────────────────────────────────
  if (ballMesh.position.z < PIN_DECK_Z - 1) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
    hitPins.clear();  // new throw — all pins eligible for first contact again
    pinMeshes.forEach(pin => {
      pin.rotation.x         = 0;
      pin.userData.falling   = false;
      pin.userData.fallAngle = 0;
    });
  }

  // ─── 2. EDGE-TRIGGERED detection ─────────────────────────────────────
  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);
    const dist = tempVec.distanceTo(ballMesh.position);

    if (dist < SUM_OF_RADII && !hitPins.has(pin)) {
      // First contact: this block runs exactly once per pin per throw
      hitPins.add(pin);
      pin.userData.falling = true;
    }

    // ─── 3. Advance fall animation (runs every frame if falling) ──────
    if (pin.userData.falling) {
      pin.userData.fallAngle = Math.min(
        pin.userData.fallAngle + PIN_FALL_SPEED * deltaTime,
        PIN_FALL_MAX
      );
      // Negative X: pin falls forward, away from the foul line
      pin.rotation.x = -pin.userData.fallAngle;
    }
  });

  // ─── 4. Smooth camera follow ──────────────────────────────────────────
  const targetCamPos = new THREE.Vector3(
    ballMesh.position.x, CAM_HEIGHT, ballMesh.position.z + CAM_BEHIND_DIST
  );
  currentCamPos.lerp(targetCamPos, Math.min(SMOOTH_SPEED * deltaTime, 1.0));
  camera.position.copy(currentCamPos);
  camera.lookAt(ballMesh.position.x, 0, ballMesh.position.z - CAM_LOOK_AHEAD);

  renderer.render(scene, camera);
}`,
            },
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: 'Add a pin-hit counter that glows the ball',
              difficulty: 'easy',
              mode: '3d',
              prose: [
                'The edge-triggered fall logic is already in place. Your task: count how many pins have been knocked down this throw and reflect that count in the ball\'s emissive glow. A strike (10 pins) should make the ball glow bright blue; zero pins should leave it dark.',
                'Three changes needed: (1) declare `let pinsHitCount = 0` at the same scope as `hitPins`; (2) inside the first-contact block, after `hitPins.add(pin)`, increment the counter and update the glow; (3) reset the counter and clear the glow in the throw reset block. Use `ballMesh.material.emissive.setHSL(0.6, 1.0, Math.min(pinsHitCount * 0.07, 0.80))` — maps 0 pins to black, 10 pins to 70% lightness blue.',
              ],
              prompt: 'Declare `let pinsHitCount = 0` alongside `hitPins`. After `hitPins.add(pin)` add `pinsHitCount += 1` then call `ballMesh.material.emissive.setHSL(0.6, 1.0, Math.min(pinsHitCount * 0.07, 0.80))`. In the reset block add `pinsHitCount = 0` and `ballMesh.material.emissive.set(0, 0, 0)` alongside `hitPins.clear()`.',
              hint: 'Place `let pinsHitCount = 0` right after `const hitPins = new Set()`. Inside the `!hitPins.has(pin)` block: `hitPins.add(pin); pinsHitCount += 1; ballMesh.material.emissive.setHSL(0.6, 1.0, Math.min(pinsHitCount * 0.07, 0.80));`. In the reset block: `pinsHitCount = 0; ballMesh.material.emissive.set(0, 0, 0);`.',
              code: `// ─── Constants ───────────────────────────────────────────────────────────
const LANE_LENGTH          = 18.3;
const LANE_WIDTH           = 1.05;
const LANE_THICKNESS       = 0.08;
const FLOOR_TOP            = LANE_THICKNESS / 2;
const FOUL_LINE_Z          = LANE_LENGTH / 2;
const PIN_DECK_Z           = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS          = 0.108;
const PIN_COLLISION_RADIUS = 0.072;
const SUM_OF_RADII         = BALL_RADIUS + PIN_COLLISION_RADIUS;

const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir     = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ROLL_SPEED     = 5.0;
const ANGULAR_SPEED  = ROLL_SPEED / BALL_RADIUS;

const PIN_SPACING    = 0.305;
const PIN_ROWS       = 4;
const PIN_HEIGHT     = 0.38;
const PIN_FALL_SPEED = 3.5;
const PIN_FALL_MAX   = Math.PI / 2;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pinMesh.position.set(
      (colIndex - rowIndex / 2) * PIN_SPACING,
      FLOOR_TOP + PIN_HEIGHT / 2,
      -rowIndex * PIN_SPACING
    );
    pinMesh.userData.falling   = false;
    pinMesh.userData.fallAngle = 0;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

const hitPins = new Set();
// TODO: declare let pinsHitCount = 0 here

const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);
  ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  currentCamPos.set(BALL_X_OFFSET, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  ballMesh.position.x += ballVelDir.x * ROLL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z - 1) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
    hitPins.clear();
    // TODO: reset pinsHitCount to 0 and restore ball emissive to black
    pinMeshes.forEach(pin => {
      pin.rotation.x         = 0;
      pin.userData.falling   = false;
      pin.userData.fallAngle = 0;
    });
  }

  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);
    const dist = tempVec.distanceTo(ballMesh.position);

    if (dist < SUM_OF_RADII && !hitPins.has(pin)) {
      hitPins.add(pin);
      pin.userData.falling = true;
      // TODO: increment pinsHitCount and update ball emissive glow
    }

    if (pin.userData.falling) {
      pin.userData.fallAngle = Math.min(
        pin.userData.fallAngle + PIN_FALL_SPEED * deltaTime,
        PIN_FALL_MAX
      );
      pin.rotation.x = -pin.userData.fallAngle;
    }
  });

  const targetCamPos = new THREE.Vector3(
    ballMesh.position.x, CAM_HEIGHT, ballMesh.position.z + CAM_BEHIND_DIST
  );
  currentCamPos.lerp(targetCamPos, Math.min(SMOOTH_SPEED * deltaTime, 1.0));
  camera.position.copy(currentCamPos);
  camera.lookAt(ballMesh.position.x, 0, ballMesh.position.z - CAM_LOOK_AHEAD);

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
      text: 'Sphere-sphere collision: `ballMesh.position.distanceTo(pin.position) < BALL_RADIUS + PIN_RADIUS`. Why add both radii instead of just checking one?',
      options: [
        'Adding both prevents false positives when objects move fast',
        'The distance is between the two centers. A collision occurs when the surface of the ball (BALL_RADIUS from center) touches the surface of the pin (PIN_RADIUS from center). The surfaces meet when the center distance equals BALL_RADIUS + PIN_RADIUS. Checking only one radius would miss collisions by the amount of the other',
        'PIN_RADIUS is zero for thin pins, so only BALL_RADIUS matters',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A hit is fired exactly once per contact using `if (!hitPins.has(pin)) { hitPins.add(pin); ... }`. What happens without the Set?',
      options: [
        'The ball stops on first contact instead of passing through pins',
        'The collision condition is true for many consecutive frames while the ball overlaps the pin. Without the Set, the hit response would fire 10–20 times per contact, accelerating the pin to extreme speeds with each additional impulse — pins would fly off unrealistically fast',
        'hitPins is required by the Three.js physics engine',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Pin fall is animated by incrementing `pin.userData.fallAngle` and setting `pin.rotation.x = -fallAngle` each frame. What visual effect does clamping at PIN_FALL_MAX produce?',
      options: [
        'The pin bounces back up after reaching the maximum angle',
        'The pin tips over and stops flat on the floor (rotation of π/2 ≈ 90°) rather than continuing to spin. Without the clamp, the pin would rotate past horizontal and oscillate or disappear into the floor',
        'Clamping limits the rotation speed rather than the total angle',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '`pin.userData` is a plain JavaScript object that Three.js leaves empty for you to use. Why store simulation state here rather than in a parallel array indexed by pin number?',
      options: [
        'Three.js copies userData automatically to the physics engine',
        'Co-location: the pin\'s physics state (velocity, fallAngle, falling flag) lives on the same object as the pin\'s visual mesh. When looping over pinMeshes, each pin carries its own state — no index synchronization is needed between mesh arrays and state arrays, and no risk of the indices getting out of sync',
        'Parallel arrays are not supported in JavaScript for Three.js objects',
      ],
      correct: 1,
    },
  ],
}
