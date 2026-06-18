export default {
  id: 'sim3-004',
  slug: 'dot-and-cross-product',
  chapter: 'sim3',
  order: 4,
  title: 'Dot & Cross Product',
  subtitle: 'The dot product tells you how aligned two directions are. The cross product produces a direction perpendicular to both. Together they decompose any impact into a forward push and a sideways scatter.',
  tags: ['dot-product', 'cross-product', 'vector3', 'linear-algebra', 'impact', 'direction', 'three.js', 'bowling'],
  aliases: 'dot product cross product alignment perpendicular scatter impact direction vector three.js bowling simulation',
  timeToComplete: 35,
  coreConcept: 'dot(a, b) = |a||b|cos(θ) — for unit vectors this is simply cos(θ), the cosine of the angle between them. Result 1 = same direction; 0 = perpendicular; −1 = opposite. cross(a, b) produces a new vector perpendicular to both a and b; its direction follows the right-hand rule and its magnitude is |a||b|sin(θ).',
  prerequisites: ['sim3-003'],
  nextLesson: 'collision-detection',

  hook: {
    question: 'A bowling ball can hit a pin dead-on, with a glancing blow, or miss entirely. How does the simulation know the difference — and how does it decide which way the pin scatters?',
    realWorldContext: 'In every physics engine — Unity, Unreal, Bullet, Havok — every collision resolves the same way: decompose the relative velocity into the component along the contact normal (the push) and the component perpendicular to it (the friction/spin). Both decompositions come from exactly two operations: the dot product and the cross product.\n\nThese two operations also appear in every other domain of simulation: the dot product decides whether a character is facing the player (AI), whether a face polygon is visible (graphics culling), and how much force a rope exerts along its length (constraints). The cross product computes surface normals for lighting, torque for rigid bodies, and the axis of rotation for any joint. Learning them in a concrete physics context makes abstract linear algebra tangible.',
  },

  intuition: {
    prose: [
      '**dot(a, b) = cos(θ) for unit vectors.** If both `a` and `b` have length 1, their dot product equals the cosine of the angle between them. This gives a clean alignment reading: 1 = pointing the same way, 0 = perpendicular, −1 = exactly opposite. Any value above 0 means the vectors are less than 90° apart — the ball is at least partially heading toward the target.',

      '**Dot product as projection.** For non-unit vectors, `dot(a, b) = |a||b|cos(θ)`. Dividing by |b| gives the *scalar projection* of `a` onto `b`: how much of `a` lies in the direction of `b`. Multiplying the scalar projection by the unit vector `b/|b|` gives the *vector projection* — the component of `a` that acts along `b`. This is the magnitude of the direct hit on the pin.',

      '**cross(a, b) = vector perpendicular to both.** The cross product of two 3D vectors produces a new vector that is perpendicular to the plane they share. Its direction follows the right-hand rule: curl the fingers of your right hand from `a` toward `b` and your thumb points in the direction of `a × b`. Its magnitude is `|a||b|sin(θ)` — maximum when the vectors are perpendicular, zero when they are parallel.',

      '**Cross product finds the scatter axis.** When a ball hits a pin at an angle, the impact direction crossed with the pin\'s vertical axis gives the horizontal direction the pin will scatter. If the ball hits from the left, the cross product points forward-right — the pin goes to the right. This is the same mathematical operation used to compute surface normals for lighting, torque for rotating bodies, and rotation axes for any 3D joint.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'L03 Challenge Answer — Closest Pin',
        body: '```js\nconst tempVec = new THREE.Vector3(); // module scope, reused each frame\n\n// In update():\nlet closestDist = Infinity;\nlet closestPin  = null;\n\npinMeshes.forEach(pin => {\n  pin.getWorldPosition(tempVec);\n  const dist = tempVec.distanceTo(ballMesh.position);\n  if (dist < closestDist) { closestDist = dist; closestPin = pin; }\n});\n\npinMeshes.forEach(pin => { pin.material.color.setHex(PIN_WHITE_HEX); });\nif (closestPin && closestDist < HIGHLIGHT_DIST) {\n  closestPin.material.color.setHex(PIN_CLOSE_HEX);\n}\n```\n\n`getWorldPosition()` is needed because pins are children of `pinGroup` — their `position` property is local to the group, not world space.',
      },
      {
        type: 'procedure',
        title: 'Dot & Cross in Three.js',
        body: '```js\nconst a = new THREE.Vector3(1, 0, 0);\nconst b = new THREE.Vector3(0, 0, -1);\n\n// Dot product — returns a NUMBER (scalar)\nconst alignment = a.dot(b);        // = 0 (perpendicular)\n\n// Cross product — .cross() modifies IN PLACE → always .clone() first\nconst perp = a.clone().cross(b);   // = (0, 1, 0) by right-hand rule\n\n// Scalar projection of a onto b (how much of a acts along b direction)\nconst proj = a.dot(b.clone().normalize());\n\n// Vector projection\nconst bUnit = b.clone().normalize();\nconst vecProj = bUnit.clone().multiplyScalar(a.dot(bUnit));\n```',
      },
      {
        type: 'insight',
        title: 'Right-Hand Rule',
        body: '`a × b` direction: point fingers of right hand along `a`, curl toward `b` — thumb points in the direction of the result.\n\nStandard axis checks:\n• `X × Y = Z`  (right × up = forward)\n• `Y × Z = X`  (up × forward = right)\n• `Z × X = Y`  (forward × right = up)\n\nOrder matters: `a × b = −(b × a)`. Swapping the arguments flips the direction.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Dot Product, Cross Product, and Impact Analysis',
        mathBridge: 'Cell 1 shows the dot product as brightness — targets in the ball\'s path are white, perpendicular targets are black. Cell 2 visualises the three vectors of a glancing impact with ArrowHelpers. Cell 3 applies dot product per-frame to color all 10 pins by how much of the ball\'s velocity points toward them.',
        caption: 'All cells use Three.js 3D mode. OrbitControls active.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: Dot product as alignment — brightness = cos(θ)',
              mode: '3d',
              prose: [
                'Four target spheres sit at 0°, 45°, 90°, and 135° from the ball\'s heading. Each one is coloured by `Math.max(0, dot(ballVelDir, dirToTarget))` — pure cosine of the angle. The 0° target is white (dot = 1), the 45° target is medium grey (dot ≈ 0.71), and both the 90° and 135° targets are black (dot ≤ 0). Black means "the ball is not heading toward this target at all."',
                'The brightness mapping shows why the dot product is useful as a hit test: anything above zero is "in front of" the ball. A threshold like `dot > 0.9` selects only targets within ~26° of the ball\'s path — a tight cone for head-on hits. `dot > 0.5` selects everything within 60°.',
              ],
              code: `// ─── Ball heading direction (unit vector pointing in −Z) ──────────────
const BALL_VEL_DIR  = new THREE.Vector3(0, 0, -1);
const BALL_POS      = new THREE.Vector3(0, 0, 0);

// ─── Targets at four angles from the heading ────────────────────────────
// Angle 0°   = dead ahead.  dot = cos(0°)   = 1.0    → white
// Angle 45°  = left-front.  dot = cos(45°)  ≈ 0.71   → mid-grey
// Angle 90°  = hard left.   dot = cos(90°)  = 0.0    → black
// Angle 135° = left-behind. dot = cos(135°) ≈ -0.71  → clamped to 0 → black
const DEG_TO_RAD      = Math.PI / 180;
const TARGET_DIST     = 4.0;    // metres from ball to each target
const TARGET_RADIUS   = 0.22;
const DEMO_ANGLES_DEG = [0, 45, 90, 135];

// Position formula: angle θ measured off the -Z heading
//   x = −TARGET_DIST × sin(θ)   (0° = straight ahead, positive angles go left)
//   z = −TARGET_DIST × cos(θ)
const targetMeshes = DEMO_ANGLES_DEG.map(deg => {
  const rad      = deg * DEG_TO_RAD;
  const targetPos = new THREE.Vector3(
    -TARGET_DIST * Math.sin(rad),
    0,
    -TARGET_DIST * Math.cos(rad)
  );

  // Direction FROM ball TO this target (unit vector)
  const toTarget   = targetPos.clone().sub(BALL_POS).normalize();

  // dot product = cos(angle between two unit vectors)
  const dotProduct = BALL_VEL_DIR.dot(toTarget);

  // Clamp to [0, 1] — negative values (behind ball) render as black
  const brightness = Math.max(0, dotProduct);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(TARGET_RADIUS, 20, 20),
    // MeshBasicMaterial ignores lights — colour = raw dot product value
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(brightness) })
  );
  mesh.position.copy(targetPos);
  return mesh;
});

// Arrow showing ball velocity direction (orange, pointing in -Z)
const velocityArrow = new THREE.ArrowHelper(
  BALL_VEL_DIR, BALL_POS,
  3.0,          // arrow length
  0xff6600,     // orange
  0.30, 0.12    // head length, head width
);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.15, 20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e })
);

function init() {
  scene.add(ballMesh);
  scene.add(velocityArrow);
  targetMeshes.forEach(mesh => scene.add(mesh));
  scene.add(new THREE.GridHelper(10, 10));

  camera.position.set(5, 5, 6);
  camera.lookAt(0, 0, -1);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera);
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Cross product — the perpendicular scatter direction',
              mode: '3d',
              prose: [
                '`impactDir × upVector` produces a horizontal vector perpendicular to the impact direction — the direction the pin will scatter sideways. Three coloured arrows show all three vectors from the pin: the impact direction (blue), the pin\'s vertical axis (green), and their cross product (orange = scatter direction). Drag the camera to see how the orange arrow is truly perpendicular to both others.',
                'The ball approaches from the upper-right, so the impact direction points slightly left-forward. The cross product with (0,1,0) points forward-right — physically, the pin gets knocked to the right and forward. Reverse the ball\'s offset to the left side and re-run: the scatter arrow flips to the left. This is the rule cross product encodes.',
              ],
              code: `// ─── Setup: a pin and a ball approaching from slightly off-centre ──────
const PIN_HEIGHT        = 0.38;
const BALL_APPROACH_X   = 0.5;    // ball is 0.5 m to the right of the pin
const BALL_APPROACH_Z   = 3.0;    // ball starts 3 m in front of the pin
const ARROW_LENGTH      = 2.2;    // visual length for all three arrows

const pinPos           = new THREE.Vector3(0, 0, 0);
const ballApproachPos  = new THREE.Vector3(BALL_APPROACH_X, 0, BALL_APPROACH_Z);

// ─── Impact direction: from ball approach position toward the pin ──────
// This is the direction the ball is travelling at the moment of contact.
const impactDir = pinPos.clone().sub(ballApproachPos).normalize();
// impactDir ≈ (-0.164, 0, -0.986) — mostly forward, slightly left

// ─── Up vector: the pin stands along this axis ────────────────────────
const upVector = new THREE.Vector3(0, 1, 0);

// ─── Cross product: impactDir × upVector ──────────────────────────────
// Result is perpendicular to BOTH the impact direction AND the vertical axis.
// This tells us the horizontal scatter direction — which way the pin moves.
// .clone() is essential: .cross() modifies the vector IN PLACE.
const scatterDir = impactDir.clone().cross(upVector).normalize();
// For a ball coming from the right: scatterDir points forward-right

// ─── Visualise all three vectors as ArrowHelpers from the pin ──────────
const impactArrow  = new THREE.ArrowHelper(impactDir,  pinPos, ARROW_LENGTH, 0x4488ff, 0.22, 0.10);
const upArrow      = new THREE.ArrowHelper(upVector,   pinPos, ARROW_LENGTH, 0x44dd44, 0.22, 0.10);
const scatterArrow = new THREE.ArrowHelper(scatterDir, pinPos, ARROW_LENGTH, 0xff6600, 0.22, 0.10);

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.copy(pinPos);

// Small marker at ball approach position
const ballMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.108, 20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e })
);
ballMarker.position.copy(ballApproachPos);

function init() {
  scene.add(pinMesh);
  scene.add(ballMarker);
  scene.add(impactArrow);   // blue  — impact direction
  scene.add(upArrow);       // green — pin axis (up)
  scene.add(scatterArrow);  // orange — cross product (scatter direction)
  scene.add(new THREE.GridHelper(8, 8));

  camera.position.set(4, 3, 5);
  camera.lookAt(0, 0.5, 0);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  renderer.render(scene, camera);
}`,
            },
            {
              id: 3,
              cellTitle: '3D: Per-pin dot product — coloring the formation by hit strength',
              mode: '3d',
              prose: [
                'The ball rolls with a slight X-offset and a hook angle (small X-component of velocity). In `update()`, every pin\'s colour is recalculated from the current dot product of the ball\'s velocity direction with the direction to that pin. Pins squarely in the path stay white; pins at glancing angles fade to grey; pins out of the path turn black.',
                'As the ball approaches, the angular spread between pins grows — pins that appeared to be "in the path" from far away start to resolve into hit and non-hit zones. This per-frame dot product update is the directional precursor to collision detection: it identifies candidates before the distance test in L05.',
              ],
              code: `// ─── Lane and ball constants ────────────────────────────────────────────
const LANE_LENGTH     = 18.3;
const LANE_WIDTH      = 1.05;
const LANE_THICKNESS  = 0.08;
const FLOOR_TOP       = LANE_THICKNESS / 2;
const FOUL_LINE_Z     = LANE_LENGTH / 2;
const PIN_DECK_Z      = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS     = 0.108;

// ─── Ball trajectory: x-offset and slight hook angle ────────────────────
const BALL_X_OFFSET  = -0.2;   // metres left of centre at start
const HOOK_ANGLE_DEG = 1.0;     // rightward angle (hook shot drifts toward centre)
const DEG_TO_RAD     = Math.PI / 180;
const HOOK_RAD       = HOOK_ANGLE_DEG * DEG_TO_RAD;

// Velocity direction: mostly -Z, with small +X component from the hook
const ballVelDir = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ROLL_SPEED = 5.0;
const ANGULAR_SPEED = ROLL_SPEED / BALL_RADIUS;

// ─── Camera follow ──────────────────────────────────────────────────────
const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

// ─── Pin formation ──────────────────────────────────────────────────────
const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;
const pinGeometry  = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);

const pinGroup   = new THREE.Group();
const pinMeshes  = [];
const tempVec    = new THREE.Vector3(); // scratch vector, reused every frame

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinLocalX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const pinLocalZ = -rowIndex * PIN_SPACING;
    const pinMesh   = new THREE.Mesh(
      pinGeometry,
      // MeshBasicMaterial so colour shows purely without lighting influence
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    pinMesh.position.set(pinLocalX, FLOOR_TOP + PIN_HEIGHT / 2, pinLocalZ);
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

// ─── Lane and ball meshes ───────────────────────────────────────────────
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
  // ─── Ball rolls with hook trajectory ─────────────────────────────────
  ballMesh.position.x += ballVelDir.x * ROLL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime; // spin (dominant Z component)

  if (ballMesh.position.z < PIN_DECK_Z - 1) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
  }

  // ─── Color each pin by dot product with ball velocity direction ───────
  // For each pin: how much of ballVelDir points toward that pin right now?
  // dot = 1.0 → ball heading straight at it.  dot = 0 → out of the path.
  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);                       // world coords (not local)
    const dirToPin   = tempVec.clone().sub(ballMesh.position).normalize();
    const dotProduct = ballVelDir.dot(dirToPin);         // cos of angle between them
    const brightness = Math.max(0, dotProduct);          // clamp negative to 0
    pin.material.color.setScalar(brightness);            // white = in path, black = out
  });

  // ─── Smooth camera follow ─────────────────────────────────────────────
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
              challengeTitle: 'Implement dot product hit prediction',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'The starter code rolls the ball but does not update pin colors. Implement the per-pin dot product loop in `update()`. Each pin should glow white when the ball\'s velocity direction aligns with the direction to that pin, and go dark when the ball is heading elsewhere. This will make the "hit path" visually obvious as the ball approaches.',
                'Use `pin.getWorldPosition(tempVec)` to get each pin\'s world position (they are children of `pinGroup`, so `pin.position` is local). Compute the direction from ball to pin, take the dot product with `ballVelDir`, clamp the result to `[0, 1]`, and apply it to `pin.material.color.setScalar()`.',
              ],
              prompt: 'In `update()`, loop over `pinMeshes`. For each pin, get its world position with `pin.getWorldPosition(tempVec)`, compute the normalised direction from ball to pin, take the dot product with `ballVelDir`, clamp to `[0, 1]`, and set `pin.material.color.setScalar(brightness)`. The ball rolls with an x-offset — you should see an asymmetric glow pattern showing the head pin and two left-side pins brighter than the right side.',
              hint: 'Inside the `pinMeshes.forEach` call: `pin.getWorldPosition(tempVec)` then `const dirToPin = tempVec.clone().sub(ballMesh.position).normalize()` then `const brightness = Math.max(0, ballVelDir.dot(dirToPin))` then `pin.material.color.setScalar(brightness)`.',
              code: `// ─── Constants ────────────────────────────────────────────────────────
const LANE_LENGTH     = 18.3;
const LANE_WIDTH      = 1.05;
const LANE_THICKNESS  = 0.08;
const FLOOR_TOP       = LANE_THICKNESS / 2;
const FOUL_LINE_Z     = LANE_LENGTH / 2;
const PIN_DECK_Z      = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS     = 0.108;

const BALL_X_OFFSET   = -0.2;
const HOOK_ANGLE_DEG  = 1.0;
const HOOK_RAD        = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir      = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ROLL_SPEED      = 5.0;
const ANGULAR_SPEED   = ROLL_SPEED / BALL_RADIUS;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;
const pinGeometry  = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);

const pinGroup   = new THREE.Group();
const pinMeshes  = [];
const tempVec    = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshBasicMaterial({ color: 0x444444 }) // start dark
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
  }

  // TODO: loop over pinMeshes and set each pin's colour by dot product
  // pinMeshes.forEach(pin => { ... })

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
}
