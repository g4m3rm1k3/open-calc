export default {
  id: 'sim3-007',
  slug: 'full-game',
  chapter: 'sim3',
  order: 7,
  title: 'Full Game — State Machine & Scoring',
  subtitle: 'A game is a simulation governed by explicit phases. A state machine organises those phases, controls which logic runs each frame, and fires transitions when conditions are met.',
  tags: ['state-machine', 'game-loop', 'scoring', 'frames', 'userData', 'three.js', 'bowling'],
  aliases: 'state machine game loop scoring frames phases transition bowling simulation three.js full game',
  timeToComplete: 45,
  coreConcept: 'A finite state machine stores the current phase in a single variable (`gameState`). Each frame, `update()` checks that variable to decide what runs — ball physics, settle detection, or score display. A transition fires when a condition is met (`ball passed pins`, `motion stopped`, `timer elapsed`) and changes `gameState` to the next phase. Between-throw and between-frame resets differ in scope: between throws only the ball position resets; between frames everything resets.',
  prerequisites: ['sim3-006'],

  hook: {
    question: 'All the physics pieces are built. How does the simulation know when a frame starts, when it ends, when to score, and when to reset?',
    realWorldContext: 'Every interactive simulation has a control layer above its physics layer. In professional physics engines this is called a "game loop" or "simulation manager." It implements a finite state machine: a set of named phases, a variable tracking the current phase, and transition rules.\n\nThe same pattern appears at every scale. A bowling game has ROLLING → SETTLING → SCORING states. A character controller has IDLE → RUNNING → JUMPING → FALLING states. A network protocol has CONNECTING → HANDSHAKING → OPEN → CLOSING states. A CI pipeline has QUEUED → BUILDING → TESTING → DEPLOYING states. The implementation is always the same: one variable, one switch, explicit transitions. Learning to write a state machine in a concrete physics context gives you the template for orchestrating any time-varying system.',
  },

  intuition: {
    prose: [
      '**The state variable gates logic.** A single string (or integer) variable called `gameState` controls which code runs each frame. The ball only moves when `gameState === ROLLING`. Collision detection only runs in rolling states. Score display only runs in `SCORING`. This prevents actions from "leaking" into the wrong phase and makes the system\'s behaviour predictable.',

      '**Transitions are assignments.** A transition is just `gameState = NEXT_STATE` — nothing more. What makes it a transition rather than a plain assignment is *where* it appears: inside a conditional that tests the transition condition. `if (ball.z < PIN_DECK_Z) { gameState = SETTLING; stateTimer = 0; }` is a complete transition: condition, state change, timer reset.',

      '**Between-throw vs between-frame reset.** A two-throw frame requires two kinds of reset. Between throws: only the ball returns to the foul line. Downed pins stay down and are marked `pin.userData.isDown = true` so throw 2 skips them in collision detection. Between frames: everything resets — pins return to `pin.userData.homeLocalPos`, all physics state clears, `isDown` flags reset.',

      '**Settle detection.** After the ball passes the pins, the simulation must wait for all motion to stop before scoring. A timer-based settle (`wait 1.5 s`) is simple but may cut off slow pins. A motion-based settle checks `pin.userData.vel.lengthSq() < threshold` and `fallAngle >= MAX - epsilon` for every pin. Combining both (`motion check OR timeout`) is robust: fast settle when possible, always exits.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'L06 Challenge Answer — Tuned Impulse Constants',
        body: "```js\n// Values that give a convincing 1-3 pocket scatter:\nconst TRANSFER_FRACTION = 0.85;  // slightly energetic — pins fly fast enough to chain\nconst SCATTER_FRACTION  = 0.45;  // enough sideways motion for off-centre hits\nconst PIN_PIN_TRANSFER  = 0.65;  // secondary hits stay energetic\nconst PIN_PIN_SCATTER   = 0.30;  // moderate secondary spread\nconst FLOOR_FRICTION    = 0.90;  // pins decelerate in ~1 second\n```\n\nIf right-side pins (6, 9, 10) were not falling: increase `SCATTER_FRACTION` or `PIN_PIN_SCATTER`. If pins stopped before reaching the back row: reduce `FLOOR_FRICTION` toward 0.94–0.96.",
      },
      {
        type: 'procedure',
        title: 'State Machine Pattern',
        body: "```js\nconst STATE_ROLLING  = 'ROLLING';\nconst STATE_SETTLING = 'SETTLING';\nconst STATE_SCORING  = 'SCORING';\nconst STATE_WAITING  = 'WAITING';\n\nlet gameState  = STATE_ROLLING;\nlet stateTimer = 0;\n\nfunction update(deltaTime) {\n  stateTimer += deltaTime;\n\n  if (gameState === STATE_ROLLING) {\n    // advance ball, run collision detection\n    if (ball.z < PIN_DECK_Z - 0.5) {\n      gameState = STATE_SETTLING; stateTimer = 0;\n    }\n  }\n  else if (gameState === STATE_SETTLING) {\n    if (allPinsSettled() || stateTimer > MAX_SETTLE_TIME) {\n      gameState = STATE_SCORING; stateTimer = 0;\n      countPinsDown();\n    }\n  }\n  else if (gameState === STATE_SCORING) {\n    if (stateTimer > SCORING_DURATION) {\n      gameState = STATE_WAITING; stateTimer = 0;\n    }\n  }\n  else if (gameState === STATE_WAITING) {\n    if (stateTimer > WAITING_DURATION) {\n      resetForNextThrow();\n      gameState = STATE_ROLLING; stateTimer = 0;\n    }\n  }\n\n  advancePinPhysics(deltaTime);  // runs every frame regardless of state\n  renderer.render(scene, camera);\n}\n```",
      },
      {
        type: 'insight',
        title: 'userData.homeLocalPos',
        body: "Pins start in group-local positions set during scene setup. Once physics moves them, those local positions change permanently. Store the original position at creation time: `pin.userData.homeLocalPos = new THREE.Vector3(localX, localY, localZ)`. Between-frame reset then calls `pin.position.copy(pin.userData.homeLocalPos)` to restore every pin to its starting spot.",
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'State Machine: From Single-Phase to Full Game',
        mathBridge: 'Cell 1 introduces the state machine pattern with a 4-state minimal scene — no physics complexity, just the control structure. Cell 2 applies it to a two-throw bowling frame: throw 1, settle, preserve downed pins, throw 2. Cell 3 extends to a multi-frame game with frame tracking and per-frame visual feedback.',
        caption: 'All cells use Three.js 3D mode. OrbitControls active.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: State machine concept — 4 states, explicit transitions',
              mode: '3d',
              prose: [
                'One ball, one pin. Four named phases: `ROLLING`, `SETTLING`, `SCORING`, `WAITING`. A single `gameState` variable controls which logic runs each frame. A `stateTimer` counts elapsed seconds within the current state. Transitions are just `gameState = NEXT_STATE; stateTimer = 0` inside a conditional.',
                'Watch the ball glow gold during `SCORING` and go dark again during `WAITING`. The state names appear in the comments — follow them through the update loop. This exact structure (one variable, timer, explicit if-else chain) scales to any simulation: remove the physics, add the states that matter.',
              ],
              code: `// ─── State names ─────────────────────────────────────────────────────────
const STATE_ROLLING  = 'ROLLING';   // ball in flight toward pin
const STATE_SETTLING = 'SETTLING';  // action resolving — timer-based here
const STATE_SCORING  = 'SCORING';   // brief visual display of result
const STATE_WAITING  = 'WAITING';   // gap before next throw

// ─── Timing constants ─────────────────────────────────────────────────────
const SETTLE_DURATION  = 0.8;   // seconds to wait for pins to settle
const SCORING_DURATION = 1.2;   // seconds to show the scored state
const WAITING_DURATION = 0.6;   // gap before resetting

const BALL_SPEED  = 4.0;
const BALL_RADIUS = 0.108;
const PIN_POS     = new THREE.Vector3(0, 0, -6);
const BALL_START  = new THREE.Vector3(0, 0, 5);

let gameState  = STATE_ROLLING;
let stateTimer = 0;

const PIN_DEFAULT_HEX = 0xffffff;
const PIN_HIT_HEX     = 0xff2222;

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, 0.38, 16),
  new THREE.MeshStandardMaterial({ color: PIN_DEFAULT_HEX, roughness: 0.3 })
);
pinMesh.position.copy(PIN_POS);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);
ballMesh.position.copy(BALL_START);

function init() {
  scene.add(pinMesh);
  scene.add(ballMesh);
  scene.add(new THREE.GridHelper(16, 16));
  camera.position.set(3, 4, 8);
  camera.lookAt(0, 0, -2);
  renderer.render(scene, camera);
}

function update(deltaTime) {
  stateTimer += deltaTime;

  // ─── STATE: ROLLING ───────────────────────────────────────────────────
  if (gameState === STATE_ROLLING) {
    ballMesh.position.z -= BALL_SPEED * deltaTime;
    if (ballMesh.position.z < PIN_POS.z + 0.5) {
      // Ball reached pin — trigger hit visual, transition to SETTLING
      pinMesh.material.color.setHex(PIN_HIT_HEX);
      gameState  = STATE_SETTLING;
      stateTimer = 0;
    }
  }

  // ─── STATE: SETTLING ──────────────────────────────────────────────────
  else if (gameState === STATE_SETTLING) {
    if (stateTimer >= SETTLE_DURATION) {
      gameState  = STATE_SCORING;
      stateTimer = 0;
      ballMesh.material.emissive.setHex(0xffaa00);  // gold = scored
    }
  }

  // ─── STATE: SCORING ───────────────────────────────────────────────────
  else if (gameState === STATE_SCORING) {
    if (stateTimer >= SCORING_DURATION) {
      gameState  = STATE_WAITING;
      stateTimer = 0;
      ballMesh.material.emissive.set(0, 0, 0);      // gold fades
    }
  }

  // ─── STATE: WAITING ───────────────────────────────────────────────────
  else if (gameState === STATE_WAITING) {
    if (stateTimer >= WAITING_DURATION) {
      // Reset scene for next throw
      ballMesh.position.copy(BALL_START);
      pinMesh.position.copy(PIN_POS);
      pinMesh.material.color.setHex(PIN_DEFAULT_HEX);
      gameState  = STATE_ROLLING;
      stateTimer = 0;
    }
  }

  renderer.render(scene, camera);
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Two-throw frame — preserving state between throws',
              mode: '3d',
              prose: [
                'A real bowling frame requires two throws when the first throw does not knock all 10 pins. The key difference from a single-throw loop: when transitioning from `SETTLING_1` to `THROW_2`, only the ball resets — pins that fell stay down and are marked `pin.userData.isDown = true`. Throw 2\'s collision detection skips any pin with `isDown = true`.',
                'Between frames (`FRAME_DONE` → `THROW_1`), everything resets: pins return to `pin.userData.homeLocalPos`, all physics state clears, and `isDown` is set to `false` for every pin. The two different reset depths — ball-only vs full — are the structural insight of the two-throw frame.',
              ],
              code: `// ─── State names ─────────────────────────────────────────────────────────
const STATE_THROW_1    = 'THROW_1';
const STATE_SETTLING_1 = 'SETTLING_1';
const STATE_THROW_2    = 'THROW_2';
const STATE_SETTLING_2 = 'SETTLING_2';
const STATE_FRAME_DONE = 'FRAME_DONE';

// ─── Physics and lane constants ───────────────────────────────────────────
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
const BALL_X_OFFSET        = -0.2;
const HOOK_ANGLE_DEG       = 1.0;
const HOOK_RAD             = HOOK_ANGLE_DEG * Math.PI / 180;
const ballVelDir           = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ballVelocity         = ballVelDir.clone().multiplyScalar(BALL_SPEED);
const ANGULAR_SPEED        = BALL_SPEED / BALL_RADIUS;

const TRANSFER_FRACTION    = 0.85;
const SCATTER_FRACTION     = 0.45;
const FLOOR_FRICTION       = 0.90;
const STOP_SPEED           = 0.05;
const PIN_FALL_SPEED       = 4.0;
const PIN_FALL_MAX         = Math.PI / 2;
const MIN_SETTLE_TIME      = 0.5;
const MAX_SETTLE_TIME      = 2.0;
const FRAME_DONE_DURATION  = 1.5;

const PIN_SPACING  = 0.305;
const PIN_ROWS     = 4;
const PIN_HEIGHT   = 0.38;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 5.0;
const currentCamPos   = new THREE.Vector3();

const upVector    = new THREE.Vector3(0, 1, 0);
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const localX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const localY = FLOOR_TOP + PIN_HEIGHT / 2;
    const localZ = -rowIndex * PIN_SPACING;
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pinMesh.position.set(localX, localY, localZ);
    pinMesh.userData.homeLocalPos = new THREE.Vector3(localX, localY, localZ);
    pinMesh.userData.vel          = new THREE.Vector3();
    pinMesh.userData.falling      = false;
    pinMesh.userData.fallAngle    = 0;
    pinMesh.userData.isDown       = false;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

const hitByBall = new Set();
const hitByPin  = new Set();

let gameState  = STATE_THROW_1;
let stateTimer = 0;

const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);
const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

// ─── Helper: count newly downed pins and mark them ───────────────────────
function markHitPinsAsDown() {
  hitByBall.forEach(pin => { pin.userData.isDown = true; });
  hitByPin.forEach(pin  => { pin.userData.isDown = true; });
}

// ─── Helper: return true when all pin motion has stopped ─────────────────
function allPinsSettled() {
  if (stateTimer < MIN_SETTLE_TIME) return false;
  return pinMeshes.every(pin =>
    pin.userData.vel.lengthSq() < STOP_SPEED * STOP_SPEED &&
    (!pin.userData.falling || pin.userData.fallAngle >= PIN_FALL_MAX - 0.05)
  );
}

// ─── Helper: reset ball only (between throws in a frame) ─────────────────
function resetBallOnly() {
  ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  ballMesh.rotation.x = 0;
  currentCamPos.set(BALL_X_OFFSET, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  hitByBall.clear();
  hitByPin.clear();
}

// ─── Helper: reset everything for a new frame ─────────────────────────────
function resetFullFrame() {
  pinMeshes.forEach(pin => {
    pin.position.copy(pin.userData.homeLocalPos);
    pin.rotation.set(0, 0, 0);
    pin.userData.vel.set(0, 0, 0);
    pin.userData.falling   = false;
    pin.userData.fallAngle = 0;
    pin.userData.isDown    = false;
    pin.material.color.setHex(0xffffff);
  });
  hitByBall.clear();
  hitByPin.clear();
  resetBallOnly();
}

// ─── Helper: apply impulse to a pin on first contact ─────────────────────
function applyImpulse(pin) {
  pin.getWorldPosition(tempVec);
  const contactNormal = tempVec.clone().sub(ballMesh.position).normalize();
  const impulseMag    = ballVelocity.dot(contactNormal);
  if (impulseMag <= 0) return;
  const scatterDir = contactNormal.clone().cross(upVector).normalize();
  pin.userData.vel
    .copy(contactNormal).multiplyScalar(impulseMag * TRANSFER_FRACTION)
    .addScaledVector(scatterDir, impulseMag * SCATTER_FRACTION);
  pin.userData.falling = true;
}

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);
  resetBallOnly();
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  stateTimer += deltaTime;

  // ─── STATE: THROW_1 or THROW_2 — ball in flight ───────────────────────
  if (gameState === STATE_THROW_1 || gameState === STATE_THROW_2) {
    ballMesh.position.x += ballVelDir.x * BALL_SPEED * deltaTime;
    ballMesh.position.z += ballVelDir.z * BALL_SPEED * deltaTime;
    ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

    // Collision detection: skip pins already down
    pinMeshes.forEach(pin => {
      if (pin.userData.isDown) return;  // already knocked — skip for this throw
      pin.getWorldPosition(tempVec);
      const dist = tempVec.distanceTo(ballMesh.position);
      if (dist < SUM_OF_RADII && !hitByBall.has(pin)) {
        hitByBall.add(pin);
        applyImpulse(pin);
      }
    });

    // Transition once ball passes the pin deck
    if (ballMesh.position.z < PIN_DECK_Z - 0.5) {
      const nextSettling = gameState === STATE_THROW_1 ? STATE_SETTLING_1 : STATE_SETTLING_2;
      gameState  = nextSettling;
      stateTimer = 0;
    }
  }

  // ─── STATE: SETTLING_1 ────────────────────────────────────────────────
  else if (gameState === STATE_SETTLING_1) {
    if (allPinsSettled() || stateTimer > MAX_SETTLE_TIME) {
      const pinsDownT1 = hitByBall.size + hitByPin.size;
      markHitPinsAsDown();

      if (pinsDownT1 === 10) {
        // Strike: skip throw 2
        gameState  = STATE_FRAME_DONE;
        stateTimer = 0;
        ballMesh.material.emissive.setHex(0xffaa00);  // gold = strike
      } else {
        // Not a strike: reset ball for throw 2, keep downed pins
        resetBallOnly();
        gameState  = STATE_THROW_2;
        stateTimer = 0;
      }
    }
  }

  // ─── STATE: SETTLING_2 ────────────────────────────────────────────────
  else if (gameState === STATE_SETTLING_2) {
    if (allPinsSettled() || stateTimer > MAX_SETTLE_TIME) {
      markHitPinsAsDown();
      const totalDown = pinMeshes.filter(p => p.userData.isDown).length;
      const isSpare   = totalDown === 10;
      // Spare: green emissive. Partial: blue proportional to count.
      ballMesh.material.emissive.setHSL(
        isSpare ? 0.33 : 0.6,
        1.0,
        Math.min(totalDown * 0.06, 0.70)
      );
      gameState  = STATE_FRAME_DONE;
      stateTimer = 0;
    }
  }

  // ─── STATE: FRAME_DONE ────────────────────────────────────────────────
  else if (gameState === STATE_FRAME_DONE) {
    if (stateTimer > FRAME_DONE_DURATION) {
      ballMesh.material.emissive.set(0, 0, 0);
      resetFullFrame();
      gameState  = STATE_THROW_1;
      stateTimer = 0;
    }
  }

  // ─── Always: advance pin physics ──────────────────────────────────────
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

  // ─── Always: smooth camera follow ─────────────────────────────────────
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
              cellTitle: '3D: Multi-frame game — tracking frames and running score',
              mode: '3d',
              prose: [
                '`TOTAL_FRAMES = 3` keeps the game short for this demo — change it to `10` for a full game. Four states manage the cycle. `throwInFrame` distinguishes throw 1 from throw 2 within the same state machine: the `THROWING` state does the same collision work for both, but the `SETTLING` transitions branch based on `throwInFrame`. `totalScore` accumulates across all frames.',
                'The ball emissive glow encodes the current frame\'s result during `SCORING`: gold for a strike, green for a spare, and proportional blue for a partial frame. After `TOTAL_FRAMES` frames the game loops — the challenge at the end of this lesson asks you to stop the loop and add a proper `GAME_OVER` state instead.',
              ],
              code: `// ─── State names ─────────────────────────────────────────────────────────
const STATE_THROWING = 'THROWING';
const STATE_SETTLING = 'SETTLING';
const STATE_SCORING  = 'SCORING';
const STATE_WAITING  = 'WAITING';

// ─── Game parameters — change TOTAL_FRAMES to 10 for a full game ─────────
const TOTAL_FRAMES     = 3;
const SCORING_DURATION = 1.5;
const WAITING_DURATION = 0.6;
const MIN_SETTLE_TIME  = 0.5;
const MAX_SETTLE_TIME  = 2.0;

// ─── Physics constants ────────────────────────────────────────────────────
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
const BALL_X_OFFSET        = -0.2;
const HOOK_RAD             = 1.0 * Math.PI / 180;
const ballVelDir           = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ballVelocity         = ballVelDir.clone().multiplyScalar(BALL_SPEED);
const ANGULAR_SPEED        = BALL_SPEED / BALL_RADIUS;
const TRANSFER_FRACTION    = 0.85;
const SCATTER_FRACTION     = 0.45;
const FLOOR_FRICTION       = 0.90;
const STOP_SPEED           = 0.05;
const PIN_FALL_SPEED       = 4.0;
const PIN_FALL_MAX         = Math.PI / 2;

const PIN_SPACING = 0.305;
const PIN_ROWS    = 4;
const PIN_HEIGHT  = 0.38;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 5.0;
const currentCamPos   = new THREE.Vector3();

const upVector    = new THREE.Vector3(0, 1, 0);
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const localX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const localY = FLOOR_TOP + PIN_HEIGHT / 2;
    const localZ = -rowIndex * PIN_SPACING;
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pinMesh.position.set(localX, localY, localZ);
    pinMesh.userData.homeLocalPos = new THREE.Vector3(localX, localY, localZ);
    pinMesh.userData.vel          = new THREE.Vector3();
    pinMesh.userData.falling      = false;
    pinMesh.userData.fallAngle    = 0;
    pinMesh.userData.isDown       = false;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

// ─── Game tracking state ──────────────────────────────────────────────────
let gameState    = STATE_THROWING;
let stateTimer   = 0;
let throwInFrame = 1;   // 1 or 2
let frameNumber  = 1;   // 1 to TOTAL_FRAMES
let pinsThrow1   = 0;   // pins knocked on throw 1 of this frame
let totalScore   = 0;   // cumulative pins across all frames

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

function allPinsSettled() {
  if (stateTimer < MIN_SETTLE_TIME) return false;
  return pinMeshes.every(pin =>
    pin.userData.vel.lengthSq() < STOP_SPEED * STOP_SPEED &&
    (!pin.userData.falling || pin.userData.fallAngle >= PIN_FALL_MAX - 0.05)
  );
}

function applyImpulse(pin) {
  pin.getWorldPosition(tempVec);
  const contactNormal = tempVec.clone().sub(ballMesh.position).normalize();
  const impulseMag    = ballVelocity.dot(contactNormal);
  if (impulseMag <= 0) return;
  const scatterDir = contactNormal.clone().cross(upVector).normalize();
  pin.userData.vel
    .copy(contactNormal).multiplyScalar(impulseMag * TRANSFER_FRACTION)
    .addScaledVector(scatterDir, impulseMag * SCATTER_FRACTION);
  pin.userData.falling = true;
}

function resetBallOnly() {
  ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  ballMesh.rotation.x = 0;
  currentCamPos.set(BALL_X_OFFSET, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  hitByBall.clear();
  hitByPin.clear();
}

function resetFullFrame() {
  pinMeshes.forEach(pin => {
    pin.position.copy(pin.userData.homeLocalPos);
    pin.rotation.set(0, 0, 0);
    pin.userData.vel.set(0, 0, 0);
    pin.userData.falling   = false;
    pin.userData.fallAngle = 0;
    pin.userData.isDown    = false;
    pin.material.color.setHex(0xffffff);
  });
  resetBallOnly();
}

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);
  resetBallOnly();
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  stateTimer += deltaTime;

  // ─── STATE: THROWING ──────────────────────────────────────────────────
  if (gameState === STATE_THROWING) {
    ballMesh.position.x += ballVelDir.x * BALL_SPEED * deltaTime;
    ballMesh.position.z += ballVelDir.z * BALL_SPEED * deltaTime;
    ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

    pinMeshes.forEach(pin => {
      if (pin.userData.isDown) return;
      pin.getWorldPosition(tempVec);
      if (tempVec.distanceTo(ballMesh.position) < SUM_OF_RADII && !hitByBall.has(pin)) {
        hitByBall.add(pin);
        applyImpulse(pin);
      }
    });

    if (ballMesh.position.z < PIN_DECK_Z - 0.5) {
      gameState  = STATE_SETTLING;
      stateTimer = 0;
    }
  }

  // ─── STATE: SETTLING ──────────────────────────────────────────────────
  else if (gameState === STATE_SETTLING) {
    if (allPinsSettled() || stateTimer > MAX_SETTLE_TIME) {
      const pinsThisThrow = hitByBall.size + hitByPin.size;
      hitByBall.forEach(pin => { pin.userData.isDown = true; });
      hitByPin.forEach(pin  => { pin.userData.isDown = true; });

      if (throwInFrame === 1 && pinsThisThrow < 10) {
        // Not a strike: give throw 2 without scoring
        pinsThrow1 = pinsThisThrow;
        resetBallOnly();
        throwInFrame = 2;
        gameState    = STATE_THROWING;
        stateTimer   = 0;
      } else {
        // Strike OR end of throw 2: score the frame
        const totalPins  = throwInFrame === 1 ? pinsThisThrow : pinsThrow1 + pinsThisThrow;
        const isStrike   = throwInFrame === 1 && pinsThisThrow === 10;
        const isSpare    = throwInFrame === 2 && totalPins === 10;
        totalScore      += totalPins;

        // Ball emissive encodes result: gold=strike, green=spare, blue=partial
        if (isStrike) {
          ballMesh.material.emissive.setHex(0xffaa00);
        } else if (isSpare) {
          ballMesh.material.emissive.setHSL(0.33, 1.0, 0.50);
        } else {
          ballMesh.material.emissive.setHSL(0.6, 1.0, Math.min(totalPins * 0.06, 0.65));
        }

        gameState  = STATE_SCORING;
        stateTimer = 0;
      }
    }
  }

  // ─── STATE: SCORING ───────────────────────────────────────────────────
  else if (gameState === STATE_SCORING) {
    if (stateTimer >= SCORING_DURATION) {
      ballMesh.material.emissive.set(0, 0, 0);
      gameState  = STATE_WAITING;
      stateTimer = 0;
    }
  }

  // ─── STATE: WAITING — advance to next frame or loop ──────────────────
  else if (gameState === STATE_WAITING) {
    if (stateTimer >= WAITING_DURATION) {
      frameNumber += 1;
      throwInFrame  = 1;
      pinsThrow1    = 0;

      if (frameNumber > TOTAL_FRAMES) {
        // Game complete: loop back to frame 1 (challenge: add GAME_OVER here instead)
        frameNumber = 1;
        totalScore  = 0;
      }

      resetFullFrame();
      gameState  = STATE_THROWING;
      stateTimer = 0;
    }
  }

  // ─── Always: advance pin physics ──────────────────────────────────────
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

  // ─── Always: smooth camera follow ─────────────────────────────────────
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
              challengeTitle: 'Add a GAME_OVER state — stop the loop, celebrate the total',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'The game currently loops back to frame 1 after `TOTAL_FRAMES` frames. Replace that reset with a proper `GAME_OVER` state. When the game ends: stop the ball, apply a final emissive colour to the ball based on total score (gold for 90+, green for 60+, blue for anything else), and knock all still-standing pins flat as a visual "game over" effect.',
                'Two changes needed in `STATE_WAITING`: (1) define `const STATE_GAME_OVER = "GAME_OVER"` at the top, (2) when `frameNumber > TOTAL_FRAMES`, transition to `STATE_GAME_OVER` instead of resetting. In `update()`, the `STATE_GAME_OVER` branch should: set ball emissive based on `totalScore`, set `userData.falling = true` on all pins that are not already down, and skip ball movement forever after.',
              ],
              prompt: 'Add `const STATE_GAME_OVER = "GAME_OVER"` at the top. In `STATE_WAITING`, when `frameNumber > TOTAL_FRAMES`, set `gameState = STATE_GAME_OVER` instead of resetting. Add a `STATE_GAME_OVER` branch that fires once (use a `gameOverFired` flag): set `ballMesh.material.emissive` based on `totalScore` (gold if score >= 90, green if >= 60, blue otherwise) and set `userData.falling = true` on any pin where `!pin.userData.isDown`.',
              hint: 'Declare `let gameOverFired = false` alongside the other state variables. In the `STATE_GAME_OVER` branch: `if (!gameOverFired) { gameOverFired = true; /* apply emissive, knock remaining pins */ }`. For the emissive: `ballMesh.material.emissive.setHex(totalScore >= 90 ? 0xffaa00 : totalScore >= 60 ? 0x44dd44 : 0x4488ff)`. To knock remaining pins: `pinMeshes.forEach(pin => { if (!pin.userData.isDown) pin.userData.falling = true; })`.',
              code: `// ─── State names ─────────────────────────────────────────────────────────
const STATE_THROWING = 'THROWING';
const STATE_SETTLING = 'SETTLING';
const STATE_SCORING  = 'SCORING';
const STATE_WAITING  = 'WAITING';
// TODO: add STATE_GAME_OVER here

const TOTAL_FRAMES     = 3;    // change to 10 for a full game
const SCORING_DURATION = 1.5;
const WAITING_DURATION = 0.6;
const MIN_SETTLE_TIME  = 0.5;
const MAX_SETTLE_TIME  = 2.0;

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
const BALL_X_OFFSET        = -0.2;
const HOOK_RAD             = 1.0 * Math.PI / 180;
const ballVelDir           = new THREE.Vector3(Math.sin(HOOK_RAD), 0, -Math.cos(HOOK_RAD)).normalize();
const ballVelocity         = ballVelDir.clone().multiplyScalar(BALL_SPEED);
const ANGULAR_SPEED        = BALL_SPEED / BALL_RADIUS;
const TRANSFER_FRACTION    = 0.85;
const SCATTER_FRACTION     = 0.45;
const FLOOR_FRICTION       = 0.90;
const STOP_SPEED           = 0.05;
const PIN_FALL_SPEED       = 4.0;
const PIN_FALL_MAX         = Math.PI / 2;

const PIN_SPACING = 0.305;
const PIN_ROWS    = 4;
const PIN_HEIGHT  = 0.38;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 5.0;
const currentCamPos   = new THREE.Vector3();

const upVector    = new THREE.Vector3(0, 1, 0);
const pinGeometry = new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16);
const pinGroup    = new THREE.Group();
const pinMeshes   = [];
const tempVec     = new THREE.Vector3();

for (let rowIndex = 0; rowIndex < PIN_ROWS; rowIndex++) {
  const pinsInRow = rowIndex + 1;
  for (let colIndex = 0; colIndex < pinsInRow; colIndex++) {
    const localX = (colIndex - rowIndex / 2) * PIN_SPACING;
    const localY = FLOOR_TOP + PIN_HEIGHT / 2;
    const localZ = -rowIndex * PIN_SPACING;
    const pinMesh = new THREE.Mesh(
      pinGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pinMesh.position.set(localX, localY, localZ);
    pinMesh.userData.homeLocalPos = new THREE.Vector3(localX, localY, localZ);
    pinMesh.userData.vel          = new THREE.Vector3();
    pinMesh.userData.falling      = false;
    pinMesh.userData.fallAngle    = 0;
    pinMesh.userData.isDown       = false;
    pinGroup.add(pinMesh);
    pinMeshes.push(pinMesh);
  }
}
pinGroup.position.set(0, 0, PIN_DECK_Z);

let gameState    = STATE_THROWING;
let stateTimer   = 0;
let throwInFrame = 1;
let frameNumber  = 1;
let pinsThrow1   = 0;
let totalScore   = 0;
// TODO: declare let gameOverFired = false here

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

function allPinsSettled() {
  if (stateTimer < MIN_SETTLE_TIME) return false;
  return pinMeshes.every(pin =>
    pin.userData.vel.lengthSq() < STOP_SPEED * STOP_SPEED &&
    (!pin.userData.falling || pin.userData.fallAngle >= PIN_FALL_MAX - 0.05)
  );
}

function applyImpulse(pin) {
  pin.getWorldPosition(tempVec);
  const contactNormal = tempVec.clone().sub(ballMesh.position).normalize();
  const impulseMag    = ballVelocity.dot(contactNormal);
  if (impulseMag <= 0) return;
  const scatterDir = contactNormal.clone().cross(upVector).normalize();
  pin.userData.vel
    .copy(contactNormal).multiplyScalar(impulseMag * TRANSFER_FRACTION)
    .addScaledVector(scatterDir, impulseMag * SCATTER_FRACTION);
  pin.userData.falling = true;
}

function resetBallOnly() {
  ballMesh.position.set(BALL_X_OFFSET, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);
  ballMesh.rotation.x = 0;
  currentCamPos.set(BALL_X_OFFSET, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST);
  hitByBall.clear();
  hitByPin.clear();
}

function resetFullFrame() {
  pinMeshes.forEach(pin => {
    pin.position.copy(pin.userData.homeLocalPos);
    pin.rotation.set(0, 0, 0);
    pin.userData.vel.set(0, 0, 0);
    pin.userData.falling   = false;
    pin.userData.fallAngle = 0;
    pin.userData.isDown    = false;
    pin.material.color.setHex(0xffffff);
  });
  resetBallOnly();
}

function init() {
  scene.add(laneMesh);
  scene.add(pinGroup);
  scene.add(ballMesh);
  resetBallOnly();
  camera.fov = 35;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function update(deltaTime) {
  stateTimer += deltaTime;

  if (gameState === STATE_THROWING) {
    ballMesh.position.x += ballVelDir.x * BALL_SPEED * deltaTime;
    ballMesh.position.z += ballVelDir.z * BALL_SPEED * deltaTime;
    ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;
    pinMeshes.forEach(pin => {
      if (pin.userData.isDown) return;
      pin.getWorldPosition(tempVec);
      if (tempVec.distanceTo(ballMesh.position) < SUM_OF_RADII && !hitByBall.has(pin)) {
        hitByBall.add(pin);
        applyImpulse(pin);
      }
    });
    if (ballMesh.position.z < PIN_DECK_Z - 0.5) {
      gameState = STATE_SETTLING; stateTimer = 0;
    }
  }

  else if (gameState === STATE_SETTLING) {
    if (allPinsSettled() || stateTimer > MAX_SETTLE_TIME) {
      const pinsThisThrow = hitByBall.size + hitByPin.size;
      hitByBall.forEach(pin => { pin.userData.isDown = true; });
      hitByPin.forEach(pin  => { pin.userData.isDown = true; });
      if (throwInFrame === 1 && pinsThisThrow < 10) {
        pinsThrow1 = pinsThisThrow;
        resetBallOnly();
        throwInFrame = 2;
        gameState = STATE_THROWING; stateTimer = 0;
      } else {
        const totalPins = throwInFrame === 1 ? pinsThisThrow : pinsThrow1 + pinsThisThrow;
        const isStrike  = throwInFrame === 1 && pinsThisThrow === 10;
        const isSpare   = throwInFrame === 2 && totalPins === 10;
        totalScore += totalPins;
        if (isStrike) {
          ballMesh.material.emissive.setHex(0xffaa00);
        } else if (isSpare) {
          ballMesh.material.emissive.setHSL(0.33, 1.0, 0.50);
        } else {
          ballMesh.material.emissive.setHSL(0.6, 1.0, Math.min(totalPins * 0.06, 0.65));
        }
        gameState = STATE_SCORING; stateTimer = 0;
      }
    }
  }

  else if (gameState === STATE_SCORING) {
    if (stateTimer >= SCORING_DURATION) {
      ballMesh.material.emissive.set(0, 0, 0);
      gameState = STATE_WAITING; stateTimer = 0;
    }
  }

  else if (gameState === STATE_WAITING) {
    if (stateTimer >= WAITING_DURATION) {
      frameNumber += 1;
      throwInFrame  = 1;
      pinsThrow1    = 0;

      if (frameNumber > TOTAL_FRAMES) {
        // TODO: transition to STATE_GAME_OVER instead of resetting
        frameNumber = 1;
        totalScore  = 0;
      }

      resetFullFrame();
      gameState = STATE_THROWING; stateTimer = 0;
    }
  }

  // TODO: add STATE_GAME_OVER branch here

  // ─── Always: advance pin physics ──────────────────────────────────────
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

  // ─── Always: smooth camera follow ─────────────────────────────────────
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
