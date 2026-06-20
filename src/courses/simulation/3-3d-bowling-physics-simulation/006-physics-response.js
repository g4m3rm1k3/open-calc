export default {
  id: 'sim3-006',
  slug: 'physics-response',
  chapter: 'sim3',
  order: 6,
  title: 'Physics Response',
  subtitle: 'When two objects collide, the impact direction and dot/cross products determine how each object moves afterward. Impulse transfers momentum; the cross product gives the scatter axis.',
  tags: ['impulse', 'momentum', 'velocity', 'collision-response', 'cross-product', 'scatter', 'three.js', 'bowling'],
  aliases: 'impulse momentum velocity collision response scatter physics cross product three.js bowling simulation',
  timeToComplete: 40,
  coreConcept: 'On first contact, compute the impact normal (unit vector from ball to pin centre). The component of the ball\'s velocity along that normal is the impulse magnitude — it transfers to the pin. Multiply the impact normal by the impulse magnitude to get the pin\'s launch velocity. The cross product of the impact normal with the pin\'s vertical axis gives its spin/scatter axis. Each frame, advance pin positions by their velocity and decay velocity with a friction factor.',
  prerequisites: ['sim3-005'],
  nextLesson: 'full-game',

  hook: {
    question: 'The collision test fires. Now what? How does the simulation decide which direction each pin flies and how fast?',
    realWorldContext: 'Impulse-based collision response is the workhorse of every game physics engine. The core idea: at the moment of contact, some fraction of the ball\'s momentum transfers to the pin along the contact normal (the line between centres). The remaining velocity stays with the ball; the pin acquires a new velocity. Friction and spin add a perpendicular component via the cross product.\n\nThe same impulse calculation appears in billiards simulations, particle systems, rigid-body engines, and cloth solvers. The math is identical whether the objects are bowling pins, asteroids, or pool balls. Mastering it in this concrete context gives you the template for any elastic or inelastic collision in any simulation you will ever build.',
  },

  intuition: {
    prose: [
      '**Contact normal: the line between centres.** At the moment of collision, the direction from the ball centre to the pin centre is the *contact normal*. This is the axis along which the impulse acts. `contactNormal = (pinPos - ballPos).normalize()`. All of the transferred momentum goes along this direction.',

      '**Impulse magnitude.** The component of the ball\'s velocity that acts along the contact normal is `impulseMag = ballVelocity.dot(contactNormal)`. This is the "closing speed" — how fast the ball is approaching the pin along the contact line. The pin acquires this speed along the contact normal: `pinVelocity = contactNormal.clone().multiplyScalar(impulseMag * TRANSFER_FRACTION)`. A transfer fraction of 1.0 is a perfectly inelastic central hit; lower values model glancing blows.',

      '**Scatter from the cross product.** A pure impulse along the contact normal would send every pin straight forward. Real pins scatter sideways because the ball does not hit dead-centre. The cross product of the contact normal with the pin\'s vertical axis gives the scatter direction: `scatterDir = contactNormal.clone().cross(upVector).normalize()`. Multiplying by a scatter factor and adding to the pin velocity gives sideways motion proportional to how off-centre the hit was.',

      '**Per-frame kinematics.** Once a pin has a velocity, advance its position every frame: `pin.userData.pos.addScaledVector(pin.userData.vel, deltaTime)`. Decay the velocity with a floor friction factor each frame: `pin.userData.vel.multiplyScalar(FLOOR_FRICTION)`. When speed drops below a threshold, stop the pin. This gives a realistic deceleration without needing a proper physics engine.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'L05 Challenge Answer — Pin-Hit Counter',
        body: "```js\n// At module scope, alongside const hitPins = new Set():\nlet pinsHitCount = 0;\n\n// Inside the first-contact block, after hitPins.add(pin):\npinsHitCount += 1;\nballMesh.material.emissive.setHSL(0.6, 1.0, Math.min(pinsHitCount * 0.07, 0.80));\n\n// In the reset block, alongside hitPins.clear():\npinsHitCount = 0;\nballMesh.material.emissive.set(0, 0, 0);\n```\n\nEach new pin first-contact increments the counter immediately. The ball glows progressively brighter blue. A strike (10 pins) reaches `0.70` lightness — clearly visible blue emission.",
      },
      {
        type: 'procedure',
        title: 'Impulse Response Pattern',
        body: "```js\n// On first contact:\nconst contactNormal = tempVec.clone().sub(ballMesh.position).normalize();\n// contactNormal points FROM ball TO pin\n\n// How fast is the ball approaching along the contact line?\nconst impulseMag = ballVelocity.dot(contactNormal);\n\n// Pin acquires velocity along the contact normal\npin.userData.vel = contactNormal.clone().multiplyScalar(impulseMag * TRANSFER_FRACTION);\n\n// Add sideways scatter from the cross product\nconst upVector   = new THREE.Vector3(0, 1, 0);\nconst scatterDir = contactNormal.clone().cross(upVector).normalize();\npin.userData.vel.addScaledVector(scatterDir, impulseMag * SCATTER_FRACTION);\n\n// Each frame:\npin.userData.pos.addScaledVector(pin.userData.vel, deltaTime);\npin.userData.vel.multiplyScalar(FLOOR_FRICTION);  // friction decay\n```",
      },
      {
        type: 'insight',
        title: 'Transfer Fraction vs Scatter Fraction',
        body: "`TRANSFER_FRACTION` controls how much of the closing speed the pin inherits along the contact normal — higher values make pins fly faster. `SCATTER_FRACTION` controls how much sideways motion is added — higher values make pins spray wider. In a real bowling engine these come from the coefficient of restitution and friction. For simulation purposes, tuning them by feel is the right approach: start at `0.8` and `0.4` and adjust until the scatter pattern looks physically plausible.",
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Collision Response: Impulse and Scatter',
        mathBridge: 'Cell 1 shows the contact normal and impulse direction for a single pin hit using ArrowHelpers. Cell 2 applies the impulse to all pins on first contact — pins fly in the correct scatter direction. Cell 3 adds floor friction and spin so pins decelerate and come to rest.',
        caption: 'All cells use Three.js 3D mode. OrbitControls active.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: Contact normal and impulse direction — single pin visualised',
              mode: '3d',
              prose: [
                'Three arrows appear at the moment of first contact. The blue arrow is the contact normal (from ball centre to pin centre — the impulse axis). The orange arrow is the scatter direction (contact normal crossed with the vertical axis). The green arrow shows the resulting pin velocity: mostly forward along the contact normal with a small sideways scatter component.',
                'The ball starts at `BALL_X_OFFSET = -0.2 m` (left side of lane) and drifts right at 1°. It contacts the pin slightly left-of-centre, so the contact normal points slightly right-of-forward (+X). The cross product with the vertical axis gives the scatter direction — mostly +X (rightward). This is why a ball entering the 1-3 pocket from the left scatters pins to the right.',
              ],
              code: `// ─── Single-pin impulse visualisation ────────────────────────────────────
const BALL_RADIUS          = 0.108;
const PIN_COLLISION_RADIUS = 0.072;
const SUM_OF_RADII         = BALL_RADIUS + PIN_COLLISION_RADIUS;
const PIN_HEIGHT           = 0.38;
const BALL_SPEED           = 4.0;
const TRANSFER_FRACTION    = 0.80;   // fraction of closing speed given to pin
const SCATTER_FRACTION     = 0.35;   // sideways component fraction

const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelocity   = new THREE.Vector3(
  Math.sin(HOOK_RAD) * BALL_SPEED,
  0,
  -Math.cos(HOOK_RAD) * BALL_SPEED
);

const PIN_POS    = new THREE.Vector3(0, 0, -6);
const BALL_START = new THREE.Vector3(BALL_X_OFFSET, 0, 4);

const upVector  = new THREE.Vector3(0, 1, 0);
const tempVec   = new THREE.Vector3();

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.copy(PIN_POS);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);
ballMesh.position.copy(BALL_START);

// Arrow helpers shown at first contact — invisible until then
const ARROW_LEN        = 1.8;
const normalArrow      = new THREE.ArrowHelper(new THREE.Vector3(0,0,-1), PIN_POS, ARROW_LEN, 0x4488ff, 0.22, 0.10);
const scatterArrow     = new THREE.ArrowHelper(new THREE.Vector3(1,0,0),  PIN_POS, ARROW_LEN, 0xff6600, 0.22, 0.10);
const resultArrow      = new THREE.ArrowHelper(new THREE.Vector3(0,0,-1), PIN_POS, ARROW_LEN, 0x44dd44, 0.22, 0.10);
normalArrow.visible  = false;
scatterArrow.visible = false;
resultArrow.visible  = false;

let contactFired = false;

function init() {
  scene.add(pinMesh);
  scene.add(ballMesh);
  scene.add(normalArrow);
  scene.add(scatterArrow);
  scene.add(resultArrow);
  scene.add(new THREE.GridHelper(14, 14));

  camera.position.set(4, 6, 8);
  camera.lookAt(0, 0, -2);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  if (!contactFired) {
    // Advance ball until first contact
    ballMesh.position.x += ballVelocity.x * deltaTime;
    ballMesh.position.z += ballVelocity.z * deltaTime;

    const dist = ballMesh.position.distanceTo(PIN_POS);
    if (dist < SUM_OF_RADII) {
      contactFired = true;

      // ─── Compute contact normal: FROM ball TO pin ─────────────────
      PIN_POS.clone().sub(ballMesh.position).normalize(tempVec);
      const contactNormal = PIN_POS.clone().sub(ballMesh.position).normalize();

      // ─── Impulse magnitude: closing speed along contact normal ────
      const impulseMag = ballVelocity.dot(contactNormal);

      // ─── Scatter direction: cross product of normal with up ───────
      const scatterDir = contactNormal.clone().cross(upVector).normalize();

      // ─── Resulting pin velocity ───────────────────────────────────
      const pinVel = contactNormal.clone().multiplyScalar(impulseMag * TRANSFER_FRACTION);
      pinVel.addScaledVector(scatterDir, impulseMag * SCATTER_FRACTION);

      // ─── Show arrows at pin position ──────────────────────────────
      normalArrow.setDirection(contactNormal);
      normalArrow.position.copy(PIN_POS);
      normalArrow.visible = true;

      scatterArrow.setDirection(scatterDir);
      scatterArrow.position.copy(PIN_POS);
      scatterArrow.visible = true;

      resultArrow.setDirection(pinVel.clone().normalize());
      resultArrow.position.copy(PIN_POS);
      resultArrow.visible = true;
    }

    // Reset after ball travels past
    if (ballMesh.position.z < PIN_POS.z - 4) {
      ballMesh.position.copy(BALL_START);
      contactFired        = false;
      normalArrow.visible = false;
      scatterArrow.visible = false;
      resultArrow.visible = false;
    }
  }

  renderer.render(scene, camera);
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Impulse applied to all 10 pins on first contact',
              mode: '3d',
              prose: [
                'On first contact with each pin, the simulation computes the contact normal and assigns a velocity using the impulse formula. The contact normal direction differs for every pin because the ball approaches each one from a slightly different angle. Pins in the direct path fly mostly forward; pins on the edges receive a larger sideways scatter component.',
                'Each frame, pin positions are advanced by their velocity vector. Velocity is decayed by `FLOOR_FRICTION` each frame — a simple multiplicative factor that approximates sliding friction without solving friction forces explicitly. This gives realistic deceleration in about a second.',
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
const BALL_SPEED           = 5.0;

const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir     = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ballVelocity   = ballVelDir.clone().multiplyScalar(BALL_SPEED);
const ANGULAR_SPEED  = BALL_SPEED / BALL_RADIUS;

// ─── Collision response tuning ────────────────────────────────────────────
const TRANSFER_FRACTION  = 0.80;   // fraction of closing speed the pin inherits
const SCATTER_FRACTION   = 0.35;   // sideways scatter fraction
const FLOOR_FRICTION     = 0.92;   // velocity multiplier per frame (< 1 = friction)
const STOP_SPEED         = 0.05;   // m/s threshold — pin is considered at rest below this
const PIN_FALL_SPEED     = 4.0;
const PIN_FALL_MAX       = Math.PI / 2;

const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;
const currentCamPos   = new THREE.Vector3();

const upVector    = new THREE.Vector3(0, 1, 0);
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();
const tempVec2    = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    const localX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const localZ = -rowIndex * PIN_SPACING;
    pinMesh.position.set(localX, FLOOR_TOP + PIN_HEIGHT / 2, localZ);
    // Physics state stored on each mesh
    pinMesh.userData.vel       = new THREE.Vector3();  // world-space velocity
    pinMesh.userData.falling   = false;
    pinMesh.userData.fallAngle = 0;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

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
  ballMesh.position.x += ballVelDir.x * BALL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * BALL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  // ─── Reset ────────────────────────────────────────────────────────────
  if (ballMesh.position.z < PIN_DECK_Z - 2) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
    hitPins.clear();
    pinMeshes.forEach(pin => {
      // Restore local position within the group
      const rowIndex = pinMeshes.indexOf(pin);
      pin.position.set(pin.position.x, FLOOR_TOP + PIN_HEIGHT / 2, pin.position.z);
      pin.rotation.x         = 0;
      pin.userData.vel.set(0, 0, 0);
      pin.userData.falling   = false;
      pin.userData.fallAngle = 0;
    });
  }

  // ─── 2. Collision detection and impulse response ──────────────────────
  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);
    const dist = tempVec.distanceTo(ballMesh.position);

    if (dist < SUM_OF_RADII && !hitPins.has(pin)) {
      hitPins.add(pin);
      pin.userData.falling = true;

      // Contact normal: unit vector from ball centre to pin centre
      const contactNormal = tempVec.clone().sub(ballMesh.position).normalize();

      // Closing speed: how fast ball approaches pin along contact line
      const impulseMag = ballVelocity.dot(contactNormal);

      // Scatter axis: perpendicular to both contact normal and vertical
      const scatterDir = contactNormal.clone().cross(upVector).normalize();

      // Assign pin velocity: forward impulse + sideways scatter
      pin.userData.vel
        .copy(contactNormal).multiplyScalar(impulseMag * TRANSFER_FRACTION)
        .addScaledVector(scatterDir, impulseMag * SCATTER_FRACTION);
    }

    // ─── 3. Advance pin position and apply friction ───────────────────
    if (pin.userData.vel.lengthSq() > STOP_SPEED * STOP_SPEED) {
      pin.position.x += pin.userData.vel.x * deltaTime;
      pin.position.z += pin.userData.vel.z * deltaTime;
      pin.userData.vel.multiplyScalar(FLOOR_FRICTION);  // friction decay
    }

    // ─── 4. Advance fall rotation ─────────────────────────────────────
    if (pin.userData.falling) {
      pin.userData.fallAngle = Math.min(
        pin.userData.fallAngle + PIN_FALL_SPEED * deltaTime,
        PIN_FALL_MAX
      );
      pin.rotation.x = -pin.userData.fallAngle;
    }
  });

  // ─── 5. Smooth camera follow ──────────────────────────────────────────
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
              cellTitle: '3D: Pin-on-pin secondary collisions',
              mode: '3d',
              prose: [
                'Real bowling pins knock each other down — a ball directly hitting only 3 or 4 pins can produce a strike if those pins scatter into their neighbours. This cell adds a second collision loop that runs after the ball-pin impulse: any two pins that overlap apply the same impulse formula between themselves.',
                'The secondary collision loop is structurally identical to the ball-pin loop — same `distanceTo() < SUM_OF_RADII` test, same contact normal, same impulse formula. The difference is that pin-pin collisions use `PIN_COLLISION_RADIUS * 2` as the sum of radii (both objects are the same size), and the transfer fraction is lower (pins are lighter than the ball).',
              ],
              code: `// ─── Constants (same as Cell 2, adding pin-pin collision radius) ─────────
const LANE_LENGTH          = 18.3;
const LANE_WIDTH           = 1.05;
const LANE_THICKNESS       = 0.08;
const FLOOR_TOP            = LANE_THICKNESS / 2;
const FOUL_LINE_Z          = LANE_LENGTH / 2;
const PIN_DECK_Z           = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS          = 0.108;
const PIN_COLLISION_RADIUS = 0.072;
const SUM_OF_RADII_BALL    = BALL_RADIUS + PIN_COLLISION_RADIUS;
const SUM_OF_RADII_PIN_PIN = PIN_COLLISION_RADIUS * 2;  // pin vs pin
const BALL_SPEED           = 5.0;

const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir     = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ballVelocity   = ballVelDir.clone().multiplyScalar(BALL_SPEED);
const ANGULAR_SPEED  = BALL_SPEED / BALL_RADIUS;

const TRANSFER_FRACTION     = 0.80;
const SCATTER_FRACTION      = 0.35;
const PIN_PIN_TRANSFER      = 0.60;   // lower: pin-on-pin is less energetic than ball-on-pin
const PIN_PIN_SCATTER       = 0.25;
const FLOOR_FRICTION        = 0.92;
const STOP_SPEED            = 0.05;
const PIN_FALL_SPEED        = 4.0;
const PIN_FALL_MAX          = Math.PI / 2;

const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;

const CAM_HEIGHT      = 1.2;   // slightly higher — lets us see the scatter field
const CAM_BEHIND_DIST = 3.5;
const CAM_LOOK_AHEAD  = 4.0;
const SMOOTH_SPEED    = 4.0;
const currentCamPos   = new THREE.Vector3();

const upVector    = new THREE.Vector3(0, 1, 0);
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();
const tempVecB    = new THREE.Vector3();

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
    pinMesh.userData.vel       = new THREE.Vector3();
    pinMesh.userData.falling   = false;
    pinMesh.userData.fallAngle = 0;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

const hitByBall   = new Set();   // pins hit by ball this throw
const hitByPin    = new Set();   // pins hit by another pin this throw

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

function applyImpulse(receiverPin, impactorPos, impactorVel, transferFrac, scatterFrac) {
  receiverPin.getWorldPosition(tempVec);
  const contactNormal = tempVec.clone().sub(impactorPos).normalize();
  const impulseMag    = impactorVel.dot(contactNormal);
  if (impulseMag <= 0) return;  // moving away — no impulse to apply
  const scatterDir    = contactNormal.clone().cross(upVector).normalize();
  receiverPin.userData.vel
    .copy(contactNormal).multiplyScalar(impulseMag * transferFrac)
    .addScaledVector(scatterDir, impulseMag * scatterFrac);
  receiverPin.userData.falling = true;
}

function update(deltaTime) {
  // ─── 1. Advance ball ──────────────────────────────────────────────────
  ballMesh.position.x += ballVelDir.x * BALL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * BALL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z - 2) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
    hitByBall.clear();
    hitByPin.clear();
    pinMeshes.forEach(pin => {
      pin.position.set(pin.position.x, FLOOR_TOP + PIN_HEIGHT / 2, pin.position.z);
      pin.rotation.x         = 0;
      pin.userData.vel.set(0, 0, 0);
      pin.userData.falling   = false;
      pin.userData.fallAngle = 0;
    });
  }

  // ─── 2. Ball-pin collision (edge-triggered) ───────────────────────────
  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);
    const dist = tempVec.distanceTo(ballMesh.position);
    if (dist < SUM_OF_RADII_BALL && !hitByBall.has(pin)) {
      hitByBall.add(pin);
      applyImpulse(pin, ballMesh.position, ballVelocity, TRANSFER_FRACTION, SCATTER_FRACTION);
    }
  });

  // ─── 3. Pin-pin secondary collisions (edge-triggered) ────────────────
  // Only moving pins can knock stationary ones — avoids spurious re-hits.
  for (let i = 0; i < pinMeshes.length; i++) {
    if (pinMeshes[i].userData.vel.lengthSq() < STOP_SPEED * STOP_SPEED) continue;
    pinMeshes[i].getWorldPosition(tempVec);

    for (let j = 0; j < pinMeshes.length; j++) {
      if (i === j) continue;
      if (hitByPin.has(pinMeshes[j])) continue;  // already received a secondary hit
      pinMeshes[j].getWorldPosition(tempVecB);
      const dist = tempVec.distanceTo(tempVecB);
      if (dist < SUM_OF_RADII_PIN_PIN) {
        hitByPin.add(pinMeshes[j]);
        applyImpulse(
          pinMeshes[j],
          pinMeshes[i].position,
          pinMeshes[i].userData.vel,
          PIN_PIN_TRANSFER,
          PIN_PIN_SCATTER
        );
      }
    }
  }

  // ─── 4. Advance pin positions and fall animations ─────────────────────
  pinMeshes.forEach(pin => {
    if (pin.userData.vel.lengthSq() > STOP_SPEED * STOP_SPEED) {
      pin.position.x += pin.userData.vel.x * deltaTime;
      pin.position.z += pin.userData.vel.z * deltaTime;
      pin.userData.vel.multiplyScalar(FLOOR_FRICTION);
    }
    if (pin.userData.falling) {
      pin.userData.fallAngle = Math.min(
        pin.userData.fallAngle + PIN_FALL_SPEED * deltaTime,
        PIN_FALL_MAX
      );
      pin.rotation.x = -pin.userData.fallAngle;
    }
  });

  // ─── 5. Smooth camera follow ──────────────────────────────────────────
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
              challengeTitle: 'Tune the impulse constants for a realistic strike',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'The full simulation — ball-pin impulse, pin-pin secondary collisions, fall animation, camera follow — is running. Your task is to tune `TRANSFER_FRACTION`, `SCATTER_FRACTION`, `PIN_PIN_TRANSFER`, and `PIN_PIN_SCATTER` until a hook shot from the 1-3 pocket produces a realistic-looking strike.',
                'A real strike from the 1-3 pocket looks like this: the ball deflects slightly through the 1, 3, and 5 pins. The 1 knocks the 2, which knocks the 4 and 7. The 3 hits the 6 and 10. The 5 clears the 8 and 9. Start from the defaults and increase `SCATTER_FRACTION` if pins fly too straight, reduce `FLOOR_FRICTION` if they stop too fast. Try `TRANSFER_FRACTION` between 0.6 and 1.0 and observe how pin speed changes.',
              ],
              prompt: 'Adjust `TRANSFER_FRACTION` (try 0.6–1.0), `SCATTER_FRACTION` (0.2–0.6), `PIN_PIN_TRANSFER` (0.4–0.8), and `FLOOR_FRICTION` (0.88–0.96). Find values that make the 1-3 hook shot scatter all 10 pins plausibly. Comment each constant with the value you settled on and a one-line reason.',
              hint: 'Start with `TRANSFER_FRACTION = 0.85`, `SCATTER_FRACTION = 0.45`, `PIN_PIN_TRANSFER = 0.65`, `PIN_PIN_SCATTER = 0.30`, `FLOOR_FRICTION = 0.90`. The hook trajectory means the ball hits left-of-centre — if the right-side pins (6, 9, 10) are not falling, increase `SCATTER_FRACTION` or `PIN_PIN_SCATTER`. If pins stop before reaching the back row, lower `FLOOR_FRICTION`.',
              code: `// ─── Constants — tune these until the scatter looks right ────────────────
const LANE_LENGTH          = 18.3;
const LANE_WIDTH           = 1.05;
const LANE_THICKNESS       = 0.08;
const FLOOR_TOP            = LANE_THICKNESS / 2;
const FOUL_LINE_Z          = LANE_LENGTH / 2;
const PIN_DECK_Z           = -(LANE_LENGTH / 2 - 1.8);
const BALL_RADIUS          = 0.108;
const PIN_COLLISION_RADIUS = 0.072;
const SUM_OF_RADII_BALL    = BALL_RADIUS + PIN_COLLISION_RADIUS;
const SUM_OF_RADII_PIN_PIN = PIN_COLLISION_RADIUS * 2;
const BALL_SPEED           = 5.0;

const BALL_X_OFFSET  = -0.2;
const HOOK_ANGLE_DEG = 1.0;
const HOOK_RAD       = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir     = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ballVelocity   = ballVelDir.clone().multiplyScalar(BALL_SPEED);
const ANGULAR_SPEED  = BALL_SPEED / BALL_RADIUS;

// ─── TUNE THESE ───────────────────────────────────────────────────────────
const TRANSFER_FRACTION = 0.80;   // fraction of closing speed → pin forward velocity
const SCATTER_FRACTION  = 0.35;   // fraction of closing speed → pin sideways velocity
const PIN_PIN_TRANSFER  = 0.60;   // same for pin-on-pin hits
const PIN_PIN_SCATTER   = 0.25;
const FLOOR_FRICTION    = 0.92;   // velocity multiplier per frame (< 1 decelerates)
// ─────────────────────────────────────────────────────────────────────────

const STOP_SPEED   = 0.05;
const PIN_FALL_SPEED = 4.0;
const PIN_FALL_MAX   = Math.PI / 2;

const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;

const CAM_HEIGHT      = 1.2;
const CAM_BEHIND_DIST = 3.5;
const CAM_LOOK_AHEAD  = 4.0;
const SMOOTH_SPEED    = 4.0;
const currentCamPos   = new THREE.Vector3();

const upVector    = new THREE.Vector3(0, 1, 0);
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();
const tempVecB    = new THREE.Vector3();

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
    pinMesh.userData.vel       = new THREE.Vector3();
    pinMesh.userData.falling   = false;
    pinMesh.userData.fallAngle = 0;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

const hitByBall = new Set();
const hitByPin  = new Set();

const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);
const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function applyImpulse(receiverPin, impactorPos, impactorVel, transferFrac, scatterFrac) {
  receiverPin.getWorldPosition(tempVec);
  const contactNormal = tempVec.clone().sub(impactorPos).normalize();
  const impulseMag    = impactorVel.dot(contactNormal);
  if (impulseMag <= 0) return;
  const scatterDir = contactNormal.clone().cross(upVector).normalize();
  receiverPin.userData.vel
    .copy(contactNormal).multiplyScalar(impulseMag * transferFrac)
    .addScaledVector(scatterDir, impulseMag * scatterFrac);
  receiverPin.userData.falling = true;
}

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
  ballMesh.position.x += ballVelDir.x * BALL_SPEED * deltaTime;
  ballMesh.position.z += ballVelDir.z * BALL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z - 2) {
    ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
    ballMesh.rotation.x = 0;
    hitByBall.clear();
    hitByPin.clear();
    pinMeshes.forEach(pin => {
      pin.rotation.x = 0;
      pin.userData.vel.set(0, 0, 0);
      pin.userData.falling   = false;
      pin.userData.fallAngle = 0;
    });
  }

  pinMeshes.forEach(pin => {
    pin.getWorldPosition(tempVec);
    const dist = tempVec.distanceTo(ballMesh.position);
    if (dist < SUM_OF_RADII_BALL && !hitByBall.has(pin)) {
      hitByBall.add(pin);
      applyImpulse(pin, ballMesh.position, ballVelocity, TRANSFER_FRACTION, SCATTER_FRACTION);
    }
  });

  for (let i = 0; i < pinMeshes.length; i++) {
    if (pinMeshes[i].userData.vel.lengthSq() < STOP_SPEED * STOP_SPEED) continue;
    pinMeshes[i].getWorldPosition(tempVec);
    for (let j = 0; j < pinMeshes.length; j++) {
      if (i === j || hitByPin.has(pinMeshes[j])) continue;
      pinMeshes[j].getWorldPosition(tempVecB);
      if (tempVec.distanceTo(tempVecB) < SUM_OF_RADII_PIN_PIN) {
        hitByPin.add(pinMeshes[j]);
        applyImpulse(pinMeshes[j], pinMeshes[i].position, pinMeshes[i].userData.vel, PIN_PIN_TRANSFER, PIN_PIN_SCATTER);
      }
    }
  }

  pinMeshes.forEach(pin => {
    if (pin.userData.vel.lengthSq() > STOP_SPEED * STOP_SPEED) {
      pin.position.x += pin.userData.vel.x * deltaTime;
      pin.position.z += pin.userData.vel.z * deltaTime;
      pin.userData.vel.multiplyScalar(FLOOR_FRICTION);
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
      text: 'On collision, the impact normal is the unit vector from the ball center to the pin center. Why this direction rather than the ball\'s velocity direction?',
      options: [
        'The ball\'s velocity direction changes on every frame',
        'The impact normal describes where the ball\'s surface presses against the pin — the direction the force actually acts. The ball pushes the pin away from itself. Velocity direction would only be correct for a head-on hit; off-center hits (which scatter pins sideways) require the geometry of the contact point, not the ball\'s heading',
        'Three.js computes impact normals automatically',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The impulse magnitude is the dot product of the ball\'s velocity with the impact normal. What does this quantity measure physically?',
      options: [
        'The total speed of the ball at impact',
        'The component of the ball\'s velocity directed along the impact normal — how fast the ball is pushing into the pin in the contact direction. The perpendicular component (tangential velocity) does not contribute to the head-on push, only to spin. Extracting just this component gives the physically correct impulse',
        'The angle between ball velocity and pin center',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'After impact, pin velocity decays each frame: `pin.userData.vel.multiplyScalar(FLOOR_FRICTION)`. FLOOR_FRICTION is 0.9. After 10 frames, the velocity is 0.9¹⁰ ≈ 0.35× the original. What does this model?',
      options: [
        'The pin bouncing 10 times',
        'Rolling/sliding friction with the floor. Each frame the pin retains 90% of its speed. This is exponential decay — an approximation of real friction that smoothly slows pins to a stop without requiring a full rigid-body solver',
        'The pin losing mass as it slides',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '`pin.userData.vel.lengthSq() > STOP_SPEED * STOP_SPEED` uses squared length to check speed. Why compare squared lengths instead of `pin.userData.vel.length() > STOP_SPEED`?',
      options: [
        'lengthSq avoids a square root operation. Computing length requires √(x²+y²+z²); lengthSq is just x²+y²+z². Comparing squared values is mathematically equivalent (both sides are non-negative and the ordering is preserved) and significantly cheaper, especially in tight loops run 60 times per second per pin',
        'lengthSq is more numerically stable for very small velocities',
        'length() does not work for velocities, only for positions',
      ],
      correct: 0,
    },
  ],
}
