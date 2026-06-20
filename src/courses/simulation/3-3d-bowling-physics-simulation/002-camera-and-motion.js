export default {
  id: 'sim3-002',
  slug: 'camera-and-motion',
  chapter: 'sim3',
  order: 2,
  title: 'Camera & Motion',
  subtitle: 'An 18-metre lane is useless if the camera shows a flat plank. A narrow field-of-view compresses the perspective, and a camera follow keeps the action centred — no matter how long the lane is.',
  tags: ['three.js', 'camera', 'fov', 'perspective', 'motion', 'lerp', 'rolling', 'angular-velocity', 'bowling'],
  aliases: 'camera follow fov field of view perspective foreshorten lerp linear interpolation rolling angular velocity three.js',
  timeToComplete: 35,
  coreConcept: 'PerspectiveCamera.fov controls how wide the viewing cone is — narrow FOV creates telephoto compression that makes long scenes readable. A rolling ball requires both linear velocity (position change per second) and angular velocity (rotation per second) linked by ω = v / r. A camera follow sets camera.position relative to the ball every frame.',
  prerequisites: ['sim3-001'],
  nextLesson: 'pin-formation-vectors',

  hook: {
    question: 'Bowling alleys are 18 metres long. If you set up a camera that can see the whole lane at once, every object looks tiny. If you zoom in, you lose context. How do real bowling games solve this?',
    realWorldContext: 'Every sport simulation faces the same problem: the play area is much longer than it is wide. American football fields are 100 yards; cricket pitches are 20 metres; Formula 1 circuits are kilometres. The solution is always a combination of two techniques.\n\nFirst, a narrow field-of-view (telephoto lens effect) compresses the depth of the scene — distant objects appear closer than they really are, making the far end of the lane look reachable rather than tiny. Second, a camera follow attaches the viewpoint to the moving object so the action always stays in frame. Together these techniques make a geometrically correct 18-metre lane feel like a playable game environment.',
  },

  intuition: {
    prose: [
      '**Field of View (FOV)** is the angle of the camera\'s viewing cone. A wide FOV (75°) shows a large slice of the world — like a wide-angle lens. A narrow FOV (35°) shows a smaller slice — like a telephoto lens. The critical side-effect of a narrow FOV is **perspective compression**: objects at different depths appear closer together in Z than they really are. This makes a long lane look natural, the way it looks when you stand at the foul line and look toward the pins.',

      '**Rolling without slipping.** When a ball rolls along a surface, its rotation rate and translation rate are locked together. The angular velocity ω (radians per second) equals the linear velocity v divided by the radius r: ω = v / r. At 5 m/s with a 0.108 m radius ball, ω ≈ 46.3 rad/s — about 7 full rotations per second. If you move the position without rotating, the ball looks like it is sliding on ice. If you rotate without matching the linear speed, it looks like it is spinning in place.',

      '**Camera follow** in its simplest form is just one line in `update()`: set `camera.position` to the ball\'s position plus a fixed offset, then call `camera.lookAt()`. Because the camera is repositioned every frame (60 times per second), it appears to track the ball smoothly. The offset — how far behind and how high — controls the feel: close and low for intensity, far and high for tactical overview.',

      '**Lerp (linear interpolation)** smooths the hard snap. `lerp(a, b, t) = a + t*(b-a)` blends a fraction `t` of the way from `a` to `b` each frame. At t = 0.1, the camera moves 10% of the remaining gap each frame, which creates a smooth elastic follow. Lerp is a linear combination — the same mathematical operation as a weighted average and a cornerstone of animation, game physics, and signal processing.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'L01 Challenge Answer — Backstop Wall',
        body: 'The wall spans the full lane plus both gutters:\n\n```js\nconst BACKSTOP_WIDTH = LANE_WIDTH + GUTTER_WIDTH * 2;\nconst backstopMesh = new THREE.Mesh(\n  new THREE.BoxGeometry(BACKSTOP_WIDTH, 1.0, 0.2),\n  new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })\n);\nbackstopMesh.position.set(0, FLOOR_TOP + 0.5, -LANE_LENGTH / 2);\nscene.add(backstopMesh);\n```\n\n`-LANE_LENGTH / 2` is the Z coordinate of the far end. The wall centre Y is `FLOOR_TOP + 0.5` — floor surface plus half the 1 m wall, so the base is flush with the lane.',
      },
      {
        type: 'procedure',
        title: 'Changing FOV at Runtime',
        body: 'Changing `camera.fov` alone is not enough — you must rebuild the projection matrix:\n\n```js\ncamera.fov = 35;\ncamera.updateProjectionMatrix(); // required!\n```\n\nThe projection matrix converts 3D coordinates into 2D screen coordinates. It encodes the FOV, aspect ratio, and near/far clipping planes. Three.js does not automatically rebuild it when you change a property, so you must call `updateProjectionMatrix()` any time you change `fov`, `aspect`, `near`, or `far`.',
      },
      {
        type: 'insight',
        title: 'Rolling Without Slipping — ω = v / r',
        body: 'A sphere rolling without slipping satisfies: **ω = v / r**\n\n• v = linear speed (m/s)\n• r = sphere radius (m)\n• ω = angular speed (rad/s)\n\nIn code:\n```js\nconst ANGULAR_SPEED = ROLL_SPEED / BALL_RADIUS;\nball.rotation.x += ANGULAR_SPEED * deltaTime;\n```\n\nThe direction matters: rolling in −Z means the top of the sphere moves toward the camera, which is a positive rotation around X (right-hand rule). Swapping the sign gives the wrong roll direction.',
      },
      {
        type: 'insight',
        title: 'Lerp is a Linear Combination',
        body: '`lerp(a, b, t) = (1-t)*a + t*b`\n\nThis is exactly the formula for a **weighted average** — the same operation used in centre-of-mass calculations, colour blending, and animation curves. When `t = 0`, result = `a`. When `t = 1`, result = `b`. Values in between give a proportional blend.\n\nFor smooth camera follow, `t = SMOOTH_SPEED * deltaTime` means the gap closes at a fixed rate relative to elapsed time — frame-rate independent as long as `SMOOTH_SPEED * deltaTime` stays below 1.0.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Camera Techniques & Ball Motion',
        mathBridge: 'Cell 1 demonstrates the FOV effect visually. Cells 2 and 3 introduce the ω = v/r constraint. The challenge introduces lerp as a linear combination that appears constantly in animation, graphics, and control systems.',
        caption: 'All cells use Three.js 3D mode. Each cell is self-contained — run them independently.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: '3D: Field of View — the bowling camera',
              mode: '3d',
              prose: [
                'The simulation waits 4 seconds then switches from a wide overhead view (FOV 75°) to the bowling camera (FOV 35°, eye level, behind the foul line). Watch how perspective compression pulls the distant pin visually closer. Neither camera moves — only the FOV and position change.',
                '`camera.updateProjectionMatrix()` must be called after every FOV change. The projection matrix is the mathematical transformation that converts 3D world coordinates into 2D screen pixels — it encodes FOV, screen aspect ratio, and the near/far clipping planes. Three.js does not rebuild it automatically.',
              ],
              code: `// ─── Lane constants ────────────────────────────────────────────────────
const LANE_LENGTH    = 18.3;
const LANE_WIDTH     = 1.05;
const LANE_THICKNESS = 0.08;
const FLOOR_TOP      = LANE_THICKNESS / 2;
const GUTTER_WIDTH   = 0.25;
const GUTTER_OFFSET_X = (LANE_WIDTH + GUTTER_WIDTH) / 2;

// ─── Pin constants ─────────────────────────────────────────────────────
const PIN_HEIGHT     = 0.38;
const PIN_DECK_Z     = -(LANE_LENGTH / 2 - 1.8); // near the far end

// ─── Camera constants ──────────────────────────────────────────────────
const FOUL_LINE_Z      = LANE_LENGTH / 2;         // foul line is at +Z
const CAM_FOV_WIDE     = 75;    // standard wide angle — shows a large area
const CAM_FOV_NARROW   = 35;    // telephoto — compresses distant objects
const CAM_HEIGHT_HIGH  = 8;     // overhead view height
const CAM_HEIGHT_LOW   = 0.5;   // eye-level bowling view height
const CAM_Z_OVERHEAD   = FOUL_LINE_Z + 6;         // far back for overview
const CAM_Z_BOWLING    = FOUL_LINE_Z + 2;         // just behind the foul line
const SWITCH_TIME_SECS = 4;     // seconds before switching to bowling view

// ─── Build the scene ───────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const gutterGeometry  = new THREE.BoxGeometry(GUTTER_WIDTH, 0.06, LANE_LENGTH);
const gutterMaterial  = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
const leftGutter      = new THREE.Mesh(gutterGeometry, gutterMaterial);
const rightGutter     = new THREE.Mesh(gutterGeometry, gutterMaterial);
leftGutter.position.x  = -GUTTER_OFFSET_X;
rightGutter.position.x =  GUTTER_OFFSET_X;

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.set(0, FLOOR_TOP + PIN_HEIGHT / 2, PIN_DECK_Z);

let elapsedTime = 0; // total seconds since init()

function init() {
  scene.add(laneMesh);
  scene.add(leftGutter);
  scene.add(rightGutter);
  scene.add(pinMesh);

  // Start with overhead wide view
  camera.fov = CAM_FOV_WIDE;
  camera.updateProjectionMatrix();       // rebuild projection matrix
  camera.position.set(0, CAM_HEIGHT_HIGH, CAM_Z_OVERHEAD);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function update(deltaTime) {
  elapsedTime += deltaTime;

  if (elapsedTime < SWITCH_TIME_SECS) {
    // Overhead overview — the flat-plank problem
    camera.fov = CAM_FOV_WIDE;
    camera.position.set(0, CAM_HEIGHT_HIGH, CAM_Z_OVERHEAD);
    camera.lookAt(0, 0, 0);
  } else {
    // Bowling alley view — narrow FOV compresses the lane depth
    camera.fov = CAM_FOV_NARROW;
    camera.position.set(0, CAM_HEIGHT_LOW, CAM_Z_BOWLING);
    camera.lookAt(0, PIN_HEIGHT / 2, PIN_DECK_Z); // aim at pin height
  }

  // Must rebuild projection matrix whenever fov changes
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);
}`,
            },
            {
              id: 2,
              cellTitle: '3D: Rolling the ball — linear and angular velocity',
              mode: '3d',
              prose: [
                'The ball moves in the −Z direction at `ROLL_SPEED` metres per second. It must also **spin** to match that translation — rolling without slipping. The link is ω = v / r: angular velocity (rad/s) equals linear speed divided by radius. Without this, the ball looks like it is sliding on ice rather than rolling.',
                'The ball resets when it reaches the pin deck — recreating the moment before impact. All motion state lives on `ballMesh.position` and `ballMesh.rotation` directly; no extra variables needed. The fixed-angle bowling camera from Cell 1 reveals the full lane compression effect as the ball travels.',
              ],
              code: `// ─── Lane constants ────────────────────────────────────────────────────
const LANE_LENGTH    = 18.3;
const LANE_WIDTH     = 1.05;
const LANE_THICKNESS = 0.08;
const FLOOR_TOP      = LANE_THICKNESS / 2;
const GUTTER_WIDTH   = 0.25;
const GUTTER_OFFSET_X = (LANE_WIDTH + GUTTER_WIDTH) / 2;

// ─── Ball constants ─────────────────────────────────────────────────────
const BALL_RADIUS    = 0.108;            // regulation radius ~10.8 cm
const BALL_COLOR     = 0x1a1a2e;
const FOUL_LINE_Z    = LANE_LENGTH / 2;  // foul line: ball starts here
const PIN_DECK_Z     = -(LANE_LENGTH / 2 - 1.8); // where pins stand

// ─── Motion constants ───────────────────────────────────────────────────
const ROLL_SPEED     = 5.0;              // linear speed in metres per second
const ANGULAR_SPEED  = ROLL_SPEED / BALL_RADIUS; // omega = v / r (rad/s)

// ─── Camera constants ───────────────────────────────────────────────────
const CAM_HEIGHT_LOW = 0.5;
const CAM_Z_BOWLING  = FOUL_LINE_Z + 2;
const PIN_HEIGHT     = 0.38;

// ─── Build the scene ───────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const gutterGeometry = new THREE.BoxGeometry(GUTTER_WIDTH, 0.06, LANE_LENGTH);
const gutterMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
const leftGutter     = new THREE.Mesh(gutterGeometry, gutterMaterial);
const rightGutter    = new THREE.Mesh(gutterGeometry, gutterMaterial);
leftGutter.position.x  = -GUTTER_OFFSET_X;
rightGutter.position.x =  GUTTER_OFFSET_X;

const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.set(0, FLOOR_TOP + PIN_HEIGHT / 2, PIN_DECK_Z);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: BALL_COLOR, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(leftGutter);
  scene.add(rightGutter);
  scene.add(pinMesh);
  scene.add(ballMesh);

  // Place ball on the lane surface at the foul line
  ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);

  // Fixed bowling camera — narrow FOV compresses the lane
  camera.fov = 35;
  camera.updateProjectionMatrix();
  camera.position.set(0, CAM_HEIGHT_LOW, CAM_Z_BOWLING);
  camera.lookAt(0, PIN_HEIGHT / 2, PIN_DECK_Z);

  renderer.render(scene, camera);
}

function update(deltaTime) {
  // Move ball toward the pins
  ballMesh.position.z -= ROLL_SPEED * deltaTime;

  // Spin ball to match translation: omega = v / r (rolling without slipping)
  // Rolling in -Z means rotation.x increases (right-hand rule around X axis)
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  // Reset ball to foul line when it reaches the pin deck
  if (ballMesh.position.z < PIN_DECK_Z) {
    ballMesh.position.z = FOUL_LINE_Z;
    ballMesh.rotation.x = 0; // reset spin accumulation
  }

  renderer.render(scene, camera);
}`,
            },
            {
              id: 3,
              cellTitle: '3D: Camera follow — track the ball in update()',
              mode: '3d',
              prose: [
                'Camera follow is just three lines in `update()`: set `camera.position` to the ball\'s position plus a fixed offset, then call `camera.lookAt()` pointing ahead of the ball. Because the camera repositions 60 times per second, it appears to track smoothly. The offset values — how far behind, how high — control the feel of the shot.',
                '`CAM_LOOK_AHEAD` tells the camera to aim slightly in front of the ball rather than directly at it. This gives the viewer more visual context about where the ball is heading. Try setting it to 0 (camera stares at the ball centre) and compare — the forward-looking version feels more cinematic.',
              ],
              code: `// ─── Lane constants ────────────────────────────────────────────────────
const LANE_LENGTH    = 18.3;
const LANE_WIDTH     = 1.05;
const LANE_THICKNESS = 0.08;
const FLOOR_TOP      = LANE_THICKNESS / 2;
const GUTTER_WIDTH   = 0.25;
const GUTTER_OFFSET_X = (LANE_WIDTH + GUTTER_WIDTH) / 2;

// ─── Ball constants ─────────────────────────────────────────────────────
const BALL_RADIUS    = 0.108;
const FOUL_LINE_Z    = LANE_LENGTH / 2;
const PIN_DECK_Z     = -(LANE_LENGTH / 2 - 1.8);
const ROLL_SPEED     = 5.0;
const ANGULAR_SPEED  = ROLL_SPEED / BALL_RADIUS;  // omega = v / r

// ─── Camera follow constants ────────────────────────────────────────────
const CAM_HEIGHT      = 0.5;   // camera eye height above the floor
const CAM_BEHIND_DIST = 2.5;   // how far behind the ball the camera sits
const CAM_LOOK_AHEAD  = 5.0;   // how far ahead of the ball the camera aims

// ─── Build the scene ───────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const gutterGeometry = new THREE.BoxGeometry(GUTTER_WIDTH, 0.06, LANE_LENGTH);
const gutterMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
const leftGutter     = new THREE.Mesh(gutterGeometry, gutterMaterial);
const rightGutter    = new THREE.Mesh(gutterGeometry, gutterMaterial);
leftGutter.position.x  = -GUTTER_OFFSET_X;
rightGutter.position.x =  GUTTER_OFFSET_X;

const PIN_HEIGHT = 0.38;
const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.set(0, FLOOR_TOP + PIN_HEIGHT / 2, PIN_DECK_Z);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(leftGutter);
  scene.add(rightGutter);
  scene.add(pinMesh);
  scene.add(ballMesh);

  ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);

  camera.fov = 35;
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);
}

function update(deltaTime) {
  // ─── Move and spin the ball ─────────────────────────────────────────
  ballMesh.position.z -= ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z) {
    ballMesh.position.z = FOUL_LINE_Z;
    ballMesh.rotation.x = 0;
  }

  // ─── Camera follows the ball ─────────────────────────────────────────
  // Place camera behind and above the ball — hard snap, no smoothing yet
  camera.position.set(
    ballMesh.position.x,                    // same X as the ball
    CAM_HEIGHT,                              // fixed height
    ballMesh.position.z + CAM_BEHIND_DIST   // behind the ball in Z
  );

  // Aim ahead of the ball — where it is going, not where it is
  camera.lookAt(
    ballMesh.position.x,                    // same X
    0,                                       // look at floor level ahead
    ballMesh.position.z - CAM_LOOK_AHEAD    // ahead in -Z direction
  );

  renderer.render(scene, camera);
}`,
            },
            {
              id: 'c1',
              challengeType: 'modify',
              challengeNumber: 1,
              challengeTitle: 'Smooth camera follow with lerp',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                '`lerp(a, b, t) = a + t * (b - a)` — move a fraction `t` of the way from the current value to the target each frame. At `t = 0.1`, the camera closes 10% of the remaining gap per frame. The result: the camera lags slightly behind the ball, then accelerates to catch up — a smooth elastic follow rather than a rigid hard snap.',
                'This is the same operation as a weighted average: `(1-t)*current + t*target`. It appears constantly in animation, colour blending, audio mixing, and control systems. Three.js `Vector3` has a built-in `.lerp(targetVector, t)` method that interpolates all three components in one call.',
              ],
              prompt: 'Replace the hard camera snap in the starter code with a smooth lerp follow. Declare a `currentCamPos` Vector3 at module scope (initialised in `init()`). Each frame, compute the `targetCamPos`, then lerp `currentCamPos` toward it. Clamp the lerp factor to a maximum of 1.0 so it never overshoots. Copy the result to `camera.position`.',
              hint: 'Module scope: `const currentCamPos = new THREE.Vector3()`. In `init()`: `currentCamPos.set(0, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST)`. In `update()`: compute `targetCamPos`, then `const lerpFactor = Math.min(SMOOTH_SPEED * deltaTime, 1.0)`, then `currentCamPos.lerp(targetCamPos, lerpFactor)`, then `camera.position.copy(currentCamPos)`. Try SMOOTH_SPEED = 4 for a gentle follow and 12 for a tight one.',
              code: `// ─── Lane and ball constants (same as Cell 3) ──────────────────────────
const LANE_LENGTH    = 18.3;
const LANE_WIDTH     = 1.05;
const LANE_THICKNESS = 0.08;
const FLOOR_TOP      = LANE_THICKNESS / 2;
const GUTTER_WIDTH   = 0.25;
const GUTTER_OFFSET_X = (LANE_WIDTH + GUTTER_WIDTH) / 2;

const BALL_RADIUS    = 0.108;
const FOUL_LINE_Z    = LANE_LENGTH / 2;
const PIN_DECK_Z     = -(LANE_LENGTH / 2 - 1.8);
const ROLL_SPEED     = 5.0;
const ANGULAR_SPEED  = ROLL_SPEED / BALL_RADIUS;

const CAM_HEIGHT      = 0.5;
const CAM_BEHIND_DIST = 2.5;
const CAM_LOOK_AHEAD  = 5.0;
const SMOOTH_SPEED    = 6.0;  // higher = snappier follow, lower = floatier

// ─── TODO: declare currentCamPos here so it persists between frames ───
// const currentCamPos = new THREE.Vector3()

// ─── Build the scene ───────────────────────────────────────────────────
const laneMesh = new THREE.Mesh(
  new THREE.BoxGeometry(LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH),
  new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.35 })
);

const gutterGeometry = new THREE.BoxGeometry(GUTTER_WIDTH, 0.06, LANE_LENGTH);
const gutterMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
const leftGutter     = new THREE.Mesh(gutterGeometry, gutterMaterial);
const rightGutter    = new THREE.Mesh(gutterGeometry, gutterMaterial);
leftGutter.position.x  = -GUTTER_OFFSET_X;
rightGutter.position.x =  GUTTER_OFFSET_X;

const PIN_HEIGHT = 0.38;
const pinMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.072, PIN_HEIGHT, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
);
pinMesh.position.set(0, FLOOR_TOP + PIN_HEIGHT / 2, PIN_DECK_Z);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.1 })
);

function init() {
  scene.add(laneMesh);
  scene.add(leftGutter);
  scene.add(rightGutter);
  scene.add(pinMesh);
  scene.add(ballMesh);

  ballMesh.position.set(0, FLOOR_TOP + BALL_RADIUS, FOUL_LINE_Z);

  // TODO: initialise currentCamPos to the starting camera position
  // currentCamPos.set(0, CAM_HEIGHT, FOUL_LINE_Z + CAM_BEHIND_DIST)

  camera.fov = 35;
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);
}

function update(deltaTime) {
  // ─── Ball motion (same as Cell 3) ──────────────────────────────────
  ballMesh.position.z -= ROLL_SPEED * deltaTime;
  ballMesh.rotation.x += ANGULAR_SPEED * deltaTime;

  if (ballMesh.position.z < PIN_DECK_Z) {
    ballMesh.position.z = FOUL_LINE_Z;
    ballMesh.rotation.x = 0;
  }

  // ─── Hard follow (remove this block and replace with lerp) ─────────
  camera.position.set(
    ballMesh.position.x,
    CAM_HEIGHT,
    ballMesh.position.z + CAM_BEHIND_DIST
  );

  // TODO: replace the hard snap above with:
  // const targetCamPos = new THREE.Vector3(...)
  // const lerpFactor = Math.min(SMOOTH_SPEED * deltaTime, 1.0)
  // currentCamPos.lerp(targetCamPos, lerpFactor)
  // camera.position.copy(currentCamPos)

  camera.lookAt(
    ballMesh.position.x,
    0,
    ballMesh.position.z - CAM_LOOK_AHEAD
  );

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
      text: 'A narrow FOV (like 25°) vs a wide FOV (75°) on a long bowling lane. What visual effect does a narrow FOV create?',
      options: [
        'The lane appears shorter because less of it is visible',
        'Telephoto compression: the scene appears flattened and the pins look closer. A narrow FOV is like a zoom lens — it captures a small solid angle but shows distant objects larger. This makes an 18m lane look more dramatic and readable than a wide fisheye view',
        'The ball moves more slowly with a narrow FOV because fewer pixels change per frame',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Rolling motion links linear speed and angular speed: ω = v / r. If the ball has radius 0.12m and rolls at 5 m/s, what is its angular velocity?',
      options: [
        '5 × 0.12 = 0.6 rad/s',
        '5 / 0.12 ≈ 41.7 rad/s — for rolling without slipping, each radian of rotation advances the ball by r meters. Dividing linear speed by radius gives the required spin rate to match the forward motion',
        '5 + 0.12 = 5.12 rad/s',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The camera follows the ball with `camera.position.lerp(targetPos, factor)`. What does lerp do here and why is it preferred over setting position directly?',
      options: [
        'lerp teleports the camera to exactly targetPos every frame',
        'lerp blends from the current position toward the target by `factor` each frame: `pos = pos + (target - pos) * factor`. This creates a lag — the camera gradually catches up to the ball. Direct assignment would produce a perfectly rigid follow that looks mechanical and reveals every tiny position change as camera jitter',
        'lerp averages the current and target positions equally (50/50)',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '`camera.lookAt(x, 0, z - CAM_LOOK_AHEAD)` aims the camera slightly ahead of the ball. Why look ahead rather than directly at the current ball position?',
      options: [
        'Three.js camera.lookAt has a one-frame delay, so looking ahead compensates',
        'Looking directly at the ball center shows the lane behind the ball but cuts off lane ahead. Looking a few meters ahead keeps the target zone and approaching pins in view — the same reason a racing game camera tilts forward. You want to see where things are going, not just where the ball is now',
        'The ball\'s position is in world space but lookAt requires local space coordinates',
      ],
      correct: 1,
    },
  ],
}
