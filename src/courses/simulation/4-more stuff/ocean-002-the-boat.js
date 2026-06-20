export default {
  id: 'ocean-002',
  slug: 'ocean-the-boat',
  chapter: 'ocean1',
  order: 2,
  title: 'The Boat — Controls, Camera, and Buoyancy',
  subtitle: 'Build a steerable boat with WASD/arrow keys, a spring-follow orbit camera, wave buoyancy, and realistic pitch and roll.',
  tags: ['three.js', 'keyboard', 'camera', 'buoyancy', 'physics', 'spring', 'orbit', 'controls', 'boat'],
  aliases: 'boat keyboard controls WASD camera follow orbit buoyancy pitch roll spring',
  timeToComplete: 40,
  coreConcept: 'A controllable boat is three independent systems bolted together: a keyboard-driven heading and velocity, a spring-follow camera that orbits around the boat, and a buoyancy solver that samples the wave function to set position and tilt each frame.',
  prerequisites: ['ocean-building-the-water'],
  nextLesson: 'ocean-the-sky',

  hook: {
    question: 'Steering a boat in a game feels natural — but the camera, the controls, and the physics are three completely separate systems. How do they stay in sync without talking to each other?',
    realWorldContext: "Every third-person game — Zelda, GTA, Sea of Thieves — separates the player controller from the camera from the physics. The controller only moves the character. The camera spring-follows independently. Physics applies gravity, buoyancy, collisions. They're decoupled by design so you can swap out any one without breaking the others. You're building that architecture here, just without the abstraction layers.",
  },

  intuition: {
    prose: [
      "**Keyboard input: a Set of currently-held keys.** Polling `keydown` and `keyup` events and tracking them in a `Set` gives you clean per-frame 'is this key held?' queries. In `update(dt)` you check `KEYS.has('KeyW')` and apply thrust; no event listeners in the update loop. Clean up with `removeEventListener` every time `init()` runs so re-running the cell doesn't register duplicate handlers.",

      "**Heading and velocity.** The boat has a `heading` angle (radians, measured from -Z axis: 0 = forward along -Z, π/2 = right). Turning changes heading by `TURN_RATE * dt`. The forward direction is `(sin(heading), 0, -cos(heading))`. Thrust applies `BOAT_SPEED * dt` in that direction. Friction: `speed *= (1 - FRICTION * dt)` each frame prevents infinite acceleration. Clamping position keeps the boat inside the ocean grid.",

      "**Follow camera with mouse orbit.** The camera sits behind and above the boat at a fixed distance. 'Behind' means in the direction opposite the boat's heading, plus a `camOrbitYaw` offset that the player controls by dragging the mouse. Camera position: `boat.pos + [-sin(heading + orbitYaw) * CAM_DIST, CAM_HEIGHT, cos(heading + orbitYaw) * CAM_DIST]`. Spring-follow (`pos += (target − pos) × CAM_STIFFNESS × dt`) makes the camera lag naturally instead of snapping.",

      "**Buoyancy: sample the wave, set the Y.** Evaluate `waveHeight(boat.x, boat.z, t)` and set `boatGroup.position.y` to that value. For pitch and roll, compute the wave slope at the boat's position using finite differences, then interpolate the boat's rotation angles toward those slopes with a spring. The boat rocks with the water but doesn't snap violently.",

      "**Why a Group?** `boatGroup` holds the hull, mast, and any decorations as children. Moving `boatGroup` moves everything at once. Rotating `boatGroup` for buoyancy tilt also tilts everything together. Adding new visual elements is as simple as `boatGroup.add(newMesh)` — no coordinate math needed.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why use a Set for key input?',
        body: 'Browser `keydown` events repeat-fire while a key is held, with an initial delay before repeating. That makes them unreliable for smooth per-frame movement. Storing held keys in a `Set` and checking it once per frame bypasses the OS key-repeat entirely — you get perfectly smooth movement at exactly 60 fps.',
      },
      {
        type: 'definition',
        title: 'Spring follow for the camera',
        body: '`camPos += (camTarget - camPos) × k × dt` closes the gap by fraction `k·dt` each frame. When the boat turns, `camTarget` swings around it; the camera lags behind exponentially, creating the "heavy" feel of a physical camera on a crane arm. Too high k → snappy (k ≈ 10). Too low k → sluggish (k ≈ 1). k ≈ 4 is a good starting point.',
      },
      {
        type: 'warning',
        title: 'Remove event listeners before re-registering',
        body: 'If `init()` registers a `keydown` listener and you run the cell again, you now have TWO listeners — both fire on every key press. Always call `window.removeEventListener(event, savedRef)` before `window.addEventListener(event, newRef)`. Store the handler reference in a variable in the outer scope.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Building the Boat — Four Systems, One Simulation',
        mathBridge: 'Each cell adds one system to the boat. By cell 5 all four are running together. Run each cell to see a minimal working version of each system before they combine.',
        caption: 'WASD or arrow keys to steer. Hold Shift for speed boost. Mouse drag to orbit the camera.',
        initialProps: {
          initialCells: [

            // ── Cell 6: Boat hull and keyboard controls ────────────────────────
            {
              id: 6,
              cellTitle: 'The boat model and keyboard controls',
              mode: '3d',
              prose: [
                'The boat is a `THREE.Group` containing a flattened box hull and a taller box cabin. All child meshes inherit the group\'s position and rotation — this is the foundation of scene graph thinking. Moving the group moves the whole boat.',
                'Keyboard input uses a `Set<string>` of held key codes. On `keydown` we add the code; on `keyup` we remove it. In `update(dt)` we check `KEYS.has(\'KeyW\')` and apply `TURN_RATE` or `BOAT_SPEED`. This approach is immune to browser key-repeat delays and gives perfectly smooth movement.',
                'The forward direction in 3D from a heading angle is `(sin(heading), 0, −cos(heading))`. When `heading = 0` the boat faces −Z (into the screen). When `heading = π/2` it faces +X (right). `A`/`←` turns left (decreases heading), `D`/`→` turns right. Tip: try increasing `TURN_RATE` to `3.5` for a sports boat feel.',
              ],
              code: `// ── Boat model + keyboard controls ────────────────────────────

const BOAT_SPEED    = 6.0    // units/second at full speed
const BOAT_BOOST    = 12.0   // units/second when Shift held
const TURN_RATE     = 1.8    // radians/second
const FRICTION      = 1.2    // velocity decay per second (higher = more drag)
const GRID_HALF     = 18.5   // ocean boundary (keep boat inside)

let boatGroup, heading = 0
let vel = new THREE.Vector3()
let time = 0

let keyDownFn = null, keyUpFn = null
const KEYS = new Set()

function init() {
  // Clean up previous listeners before registering new ones
  if (keyDownFn) { window.removeEventListener('keydown', keyDownFn); window.removeEventListener('keyup', keyUpFn) }
  keyDownFn = e => KEYS.add(e.code)
  keyUpFn   = e => KEYS.delete(e.code)
  window.addEventListener('keydown', keyDownFn)
  window.addEventListener('keyup',   keyUpFn)

  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 20, 44)
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.55))
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.3)
  sun.position.set(12, 20, 10); scene.add(sun)

  // Ocean (flat plane — waves come in a later cell)
  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x006994, roughness: 0.15, metalness: 0.2, side: THREE.DoubleSide })
  ))

  // Boat group
  boatGroup = new THREE.THREE ? null : new THREE.Group()
  boatGroup = new THREE.Group()

  // Hull: flat, wide box
  boatGroup.add(new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.38, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.6 })
  ))

  // Cabin: smaller box sitting on top of hull
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.42, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xeeeedd, roughness: 0.6 })
  )
  cabin.position.set(0, 0.40, -0.1)
  boatGroup.add(cabin)

  // Mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 1.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x887766 })
  )
  mast.position.set(0, 1.1, 0.2)
  boatGroup.add(mast)

  boatGroup.position.set(0, 0.19, 0)
  scene.add(boatGroup)

  // GridHelper on the ocean for sense of scale
  scene.add(new THREE.GridHelper(40, 20, 0x224455, 0x224455))

  camera.position.set(0, 6, 12)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt

  const boost    = KEYS.has('ShiftLeft') || KEYS.has('ShiftRight')
  const maxSpeed = boost ? BOAT_BOOST : BOAT_SPEED

  // Turning
  if (KEYS.has('KeyA') || KEYS.has('ArrowLeft'))  heading += TURN_RATE * dt
  if (KEYS.has('KeyD') || KEYS.has('ArrowRight')) heading -= TURN_RATE * dt

  // Thrust in the forward direction
  const fwd = new THREE.Vector3(Math.sin(heading), 0, -Math.cos(heading))
  if (KEYS.has('KeyW') || KEYS.has('ArrowUp'))   vel.addScaledVector(fwd,  maxSpeed * dt)
  if (KEYS.has('KeyS') || KEYS.has('ArrowDown')) vel.addScaledVector(fwd, -maxSpeed * 0.5 * dt)

  // Friction: exponential decay toward zero
  vel.multiplyScalar(Math.max(0, 1 - FRICTION * dt))

  // Move and clamp inside ocean grid
  boatGroup.position.add(vel.clone().multiplyScalar(dt))
  boatGroup.position.x = THREE.MathUtils.clamp(boatGroup.position.x, -GRID_HALF, GRID_HALF)
  boatGroup.position.z = THREE.MathUtils.clamp(boatGroup.position.z, -GRID_HALF, GRID_HALF)

  // Face heading direction
  boatGroup.rotation.y = heading

  // Simple trailing camera (no spring yet — just offset behind boat)
  camera.position.set(
    boatGroup.position.x - Math.sin(heading) * 10,
    boatGroup.position.y + 5,
    boatGroup.position.z + Math.cos(heading) * 10
  )
  camera.lookAt(boatGroup.position)

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 7: Spring follow + orbit camera ───────────────────────────
            {
              id: 7,
              cellTitle: 'Spring-follow camera with mouse orbit',
              mode: '3d',
              prose: [
                'A spring-follow camera has two properties: it stays behind the boat (so you see where you\'re going) and it lags smoothly when the boat turns (so fast turns feel weighty, not jerky). The target position is computed from the boat heading; the actual camera position spring-follows that target.',
                '**Mouse orbit** adds horizontal rotation around the boat. Store a `camOrbitYaw` offset. On `mousedown`, record the starting X; on `mousemove`, update `camOrbitYaw += (currentX − startX) * ORBIT_SPEED`; on `mouseup`, stop. The camera angle becomes `boatHeading + Math.PI + camOrbitYaw` — `Math.PI` puts the default view behind the boat.',
                'The camera always `lookAt` a point slightly above the boat. This prevents the horizon tilting when the camera spring-follows vertically.',
              ],
              code: `// ── Spring-follow camera with mouse orbit ────────────────────

const BOAT_SPEED  = 6.0, BOAT_BOOST = 12.0
const TURN_RATE   = 1.8, FRICTION   = 1.2
const GRID_HALF   = 18.5
const CAM_DIST    = 9.0      // horizontal distance behind boat
const CAM_HEIGHT  = 4.5      // height above boat
const CAM_STIFF   = 4.5      // spring stiffness (higher = snappier)
const ORBIT_SPEED = 0.005    // mouse orbit sensitivity

let boatGroup, heading = 0
let vel = new THREE.Vector3()
let camPos = new THREE.Vector3(0, CAM_HEIGHT, CAM_DIST)
let camOrbitYaw = 0, mouseX = 0, mouseDown = false

let keyDownFn=null, keyUpFn=null, mouseDnFn=null, mouseMvFn=null, mouseUpFn=null
const KEYS = new Set()

function init() {
  if (keyDownFn) {
    window.removeEventListener('keydown', keyDownFn)
    window.removeEventListener('keyup', keyUpFn)
    renderer.domElement.removeEventListener('mousedown', mouseDnFn)
    window.removeEventListener('mousemove', mouseMvFn)
    window.removeEventListener('mouseup', mouseUpFn)
  }
  keyDownFn = e => KEYS.add(e.code)
  keyUpFn   = e => KEYS.delete(e.code)
  mouseDnFn = e => { mouseDown = true; mouseX = e.clientX }
  mouseMvFn = e => {
    if (!mouseDown) return
    camOrbitYaw += (e.clientX - mouseX) * ORBIT_SPEED
    mouseX = e.clientX
  }
  mouseUpFn = () => { mouseDown = false }
  window.addEventListener('keydown', keyDownFn)
  window.addEventListener('keyup',   keyUpFn)
  renderer.domElement.addEventListener('mousedown', mouseDnFn)
  window.addEventListener('mousemove', mouseMvFn)
  window.addEventListener('mouseup',  mouseUpFn)

  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 20, 44)
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.55))
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.3)
  sun.position.set(12, 20, 10); scene.add(sun)

  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    new THREE.MeshStandardMaterial({ color:0x006994, roughness:0.15, metalness:0.2, side:THREE.DoubleSide })
  ))
  scene.add(new THREE.GridHelper(42, 21, 0x224455, 0x224455))

  // Buoys as position markers (so you can see you're moving)
  const buoyMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.5 })
  const buoyGeo = new THREE.SphereGeometry(0.3, 8, 6)
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(buoyGeo, buoyMat)
    b.position.set((Math.random()-0.5)*34, 0.3, (Math.random()-0.5)*34)
    scene.add(b)
  }

  boatGroup = new THREE.Group()
  boatGroup.add(Object.assign(new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.38, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.6 })
  ), {}))
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.42,0.9),
    new THREE.MeshStandardMaterial({color:0xeeeedd,roughness:0.6}))
  cabin.position.set(0, 0.40, -0.1); boatGroup.add(cabin)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,1.8,6),
    new THREE.MeshStandardMaterial({color:0x887766}))
  mast.position.set(0, 1.1, 0.2); boatGroup.add(mast)
  boatGroup.position.set(0, 0.19, 0)
  scene.add(boatGroup)

  renderer.render(scene, camera)
}

const _camTarget = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()

function update(dt) {
  const boost    = KEYS.has('ShiftLeft') || KEYS.has('ShiftRight')
  const maxSpeed = boost ? BOAT_BOOST : BOAT_SPEED

  if (KEYS.has('KeyA') || KEYS.has('ArrowLeft'))  heading += TURN_RATE * dt
  if (KEYS.has('KeyD') || KEYS.has('ArrowRight')) heading -= TURN_RATE * dt

  const fwd = new THREE.Vector3(Math.sin(heading), 0, -Math.cos(heading))
  if (KEYS.has('KeyW') || KEYS.has('ArrowUp'))   vel.addScaledVector(fwd,  maxSpeed * dt)
  if (KEYS.has('KeyS') || KEYS.has('ArrowDown')) vel.addScaledVector(fwd, -maxSpeed * 0.5 * dt)

  vel.multiplyScalar(Math.max(0, 1 - FRICTION * dt))
  boatGroup.position.addScaledVector(vel, dt)
  boatGroup.position.x = THREE.MathUtils.clamp(boatGroup.position.x, -GRID_HALF, GRID_HALF)
  boatGroup.position.z = THREE.MathUtils.clamp(boatGroup.position.z, -GRID_HALF, GRID_HALF)
  boatGroup.rotation.y = heading

  // Camera target: behind and above the boat, with orbit yaw offset
  const camAngle = heading + Math.PI + camOrbitYaw
  _camTarget.set(
    boatGroup.position.x + Math.sin(camAngle) * CAM_DIST,
    boatGroup.position.y + CAM_HEIGHT,
    boatGroup.position.z - Math.cos(camAngle) * CAM_DIST
  )

  // Spring follow: close CAM_STIFF fraction of the gap per second
  camPos.x += (_camTarget.x - camPos.x) * CAM_STIFF * dt
  camPos.y += (_camTarget.y - camPos.y) * CAM_STIFF * dt
  camPos.z += (_camTarget.z - camPos.z) * CAM_STIFF * dt

  camera.position.copy(camPos)
  _lookTarget.copy(boatGroup.position).y += 0.8   // look slightly above the hull
  camera.lookAt(_lookTarget)

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 8: Buoyancy + pitch/roll ──────────────────────────────────
            {
              id: 8,
              cellTitle: 'Buoyancy — the boat rides the waves',
              mode: '3d',
              prose: [
                'Now replace the flat ocean with the animated wave surface and connect the boat to it. Each frame: (1) compute `waveHeight(boat.x, boat.z, t)` and set `boatGroup.position.y` to that value plus a small hull-above-waterline offset. (2) Compute wave slope via finite differences to get pitch and roll angles. (3) Spring-interpolate the current rotation angles toward those target angles for smooth response.',
                'The buoyancy spring uses a separate `BUOY_STIFF` from the camera spring. You want the boat to respond to waves relatively quickly (feels responsive) but not snap (looks floaty). A value around `5.0` works well. Compare it to a rigid `rotation.x = slopeX` — the spring version looks massively more natural.',
                'We use `Euler.x` for pitch (nose-up/down when riding longitudinal waves) and `Euler.z` for roll (lean side-to-side on cross-swells). The boat faces −Z when `heading = 0`, so `∂h/∂z` affects pitch and `∂h/∂x` affects roll.',
              ],
              code: `// ── Buoyancy — boat rides the animated ocean ─────────────────

const BOAT_SPEED=6.0, BOAT_BOOST=12.0, TURN_RATE=1.8, FRICTION=1.2
const GRID_HALF=18.5
const CAM_DIST=9.0, CAM_HEIGHT=4.5, CAM_STIFF=4.5, ORBIT_SPEED=0.005
const BUOY_STIFF  = 5.0    // how fast the boat tracks wave slope
const SLOPE_EPS   = 0.5    // finite-difference step
const HULL_OFFSET = 0.19   // boat waterline offset (hull half-height)
const PITCH_SCALE = 0.7    // fraction of wave slope applied as pitch/roll

const COLS=72, ROWS=72, TILE_SIZE=0.55
const W1_AMP=0.28,W1_FREQ=0.45,W1_SPEED=0.80
const W2_AMP=0.16,W2_FREQ=0.72,W2_SPEED=1.10,W2_DX=0.707,W2_DZ=0.707
const W3_AMP=0.09,W3_FREQ=1.50,W3_SPEED=1.60,W3_DX=-0.447,W3_DZ=0.894
const halfW=COLS*TILE_SIZE/2, halfD=ROWS*TILE_SIZE/2

function waveHeight(x, z, t) {
  return (
    W1_AMP*Math.sin(W1_FREQ*x - W1_SPEED*t) +
    W2_AMP*Math.sin(W2_FREQ*(x*W2_DX+z*W2_DZ) - W2_SPEED*t+1.5) +
    W3_AMP*Math.sin(W3_FREQ*(x*W3_DX+z*W3_DZ) - W3_SPEED*t+2.8)
  )
}

let posAttr, posArray, oceanGeo, boatGroup, heading=0
let vel=new THREE.Vector3(), camPos=new THREE.Vector3(0,CAM_HEIGHT,CAM_DIST)
let camOrbitYaw=0, mouseX=0, mouseDown=false
let boatPitch=0, boatRoll=0, time=0
let keyDownFn=null,keyUpFn=null,mouseDnFn=null,mouseMvFn=null,mouseUpFn=null
const KEYS=new Set()
const _camTarget=new THREE.Vector3(), _lookTarget=new THREE.Vector3()

function buildOcean() {
  const vCount=(COLS+1)*(ROWS+1)
  posArray=new Float32Array(vCount*3); let vi=0
  for(let r=0;r<=ROWS;r++) for(let c=0;c<=COLS;c++) {
    posArray[vi++]=c*TILE_SIZE-halfW; posArray[vi++]=0; posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6); let ii=0
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  oceanGeo=new THREE.BufferGeometry()
  posAttr=new THREE.BufferAttribute(posArray,3)
  oceanGeo.setAttribute('position',posAttr)
  oceanGeo.setIndex(new THREE.BufferAttribute(idx,1))
  oceanGeo.computeVertexNormals()
  return oceanGeo
}

function init() {
  if(keyDownFn){
    window.removeEventListener('keydown',keyDownFn); window.removeEventListener('keyup',keyUpFn)
    renderer.domElement.removeEventListener('mousedown',mouseDnFn)
    window.removeEventListener('mousemove',mouseMvFn); window.removeEventListener('mouseup',mouseUpFn)
  }
  keyDownFn=e=>KEYS.add(e.code); keyUpFn=e=>KEYS.delete(e.code)
  mouseDnFn=e=>{mouseDown=true;mouseX=e.clientX}
  mouseMvFn=e=>{if(!mouseDown)return;camOrbitYaw+=(e.clientX-mouseX)*ORBIT_SPEED;mouseX=e.clientX}
  mouseUpFn=()=>{mouseDown=false}
  window.addEventListener('keydown',keyDownFn); window.addEventListener('keyup',keyUpFn)
  renderer.domElement.addEventListener('mousedown',mouseDnFn)
  window.addEventListener('mousemove',mouseMvFn); window.addEventListener('mouseup',mouseUpFn)

  scene.background=new THREE.Color(0x87ceeb)
  scene.fog=new THREE.Fog(0x87ceeb,20,44)
  scene.add(new THREE.AmbientLight(0xfff4e0,0.55))
  const sun=new THREE.DirectionalLight(0xfff4e0,1.3); sun.position.set(12,20,10); scene.add(sun)
  scene.add(new THREE.Mesh(buildOcean(),
    new THREE.MeshStandardMaterial({color:0x006994,roughness:0.15,metalness:0.25,side:THREE.DoubleSide})))

  // Buoys
  const buoyMat=new THREE.MeshStandardMaterial({color:0xff6600,roughness:0.5})
  const buoyGeo=new THREE.SphereGeometry(0.28,8,6)
  for(let i=0;i<14;i++) {
    const b=new THREE.Mesh(buoyGeo,buoyMat)
    b.position.set((Math.random()-0.5)*34,(0),(Math.random()-0.5)*34)
    scene.add(b)
  }

  boatGroup=new THREE.Group()
  boatGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,0.38,2.4),
    new THREE.MeshStandardMaterial({color:0xddddcc,roughness:0.6})))
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.42,0.9),
    new THREE.MeshStandardMaterial({color:0xeeeedd,roughness:0.6}))
  cabin.position.set(0,0.40,-0.1); boatGroup.add(cabin)
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,1.8,6),
    new THREE.MeshStandardMaterial({color:0x887766}))
  mast.position.set(0,1.1,0.2); boatGroup.add(mast)
  boatGroup.position.set(0,HULL_OFFSET,0); scene.add(boatGroup)

  camPos.set(0,CAM_HEIGHT,CAM_DIST)
  renderer.render(scene,camera)
}

function update(dt) {
  time += dt
  const boost=KEYS.has('ShiftLeft')||KEYS.has('ShiftRight')
  const maxSpeed=boost?BOAT_BOOST:BOAT_SPEED

  if(KEYS.has('KeyA')||KEYS.has('ArrowLeft'))  heading+=TURN_RATE*dt
  if(KEYS.has('KeyD')||KEYS.has('ArrowRight')) heading-=TURN_RATE*dt
  const fwd=new THREE.Vector3(Math.sin(heading),0,-Math.cos(heading))
  if(KEYS.has('KeyW')||KEYS.has('ArrowUp'))   vel.addScaledVector(fwd, maxSpeed*dt)
  if(KEYS.has('KeyS')||KEYS.has('ArrowDown')) vel.addScaledVector(fwd,-maxSpeed*0.5*dt)
  vel.multiplyScalar(Math.max(0,1-FRICTION*dt))
  boatGroup.position.addScaledVector(vel,dt)
  boatGroup.position.x=THREE.MathUtils.clamp(boatGroup.position.x,-GRID_HALF,GRID_HALF)
  boatGroup.position.z=THREE.MathUtils.clamp(boatGroup.position.z,-GRID_HALF,GRID_HALF)

  // Buoyancy: set Y from wave surface
  const bx=boatGroup.position.x, bz=boatGroup.position.z
  boatGroup.position.y = waveHeight(bx,bz,time) + HULL_OFFSET

  // Pitch and roll from wave slope (finite differences)
  const slopeX = (waveHeight(bx+SLOPE_EPS,bz,time)-waveHeight(bx-SLOPE_EPS,bz,time))/(2*SLOPE_EPS)
  const slopeZ = (waveHeight(bx,bz+SLOPE_EPS,time)-waveHeight(bx,bz-SLOPE_EPS,time))/(2*SLOPE_EPS)
  const targetPitch = -slopeZ * PITCH_SCALE
  const targetRoll  =  slopeX * PITCH_SCALE
  boatPitch += (targetPitch-boatPitch)*BUOY_STIFF*dt
  boatRoll  += (targetRoll -boatRoll )*BUOY_STIFF*dt

  boatGroup.rotation.set(boatPitch, heading, boatRoll, 'YXZ')

  // Update ocean mesh
  const vCount=(COLS+1)*(ROWS+1)
  for(let i=0;i<vCount;i++) posArray[i*3+1]=waveHeight(posArray[i*3],posArray[i*3+2],time)
  posAttr.needsUpdate=true; oceanGeo.computeVertexNormals()

  // Spring camera
  const camAngle=heading+Math.PI+camOrbitYaw
  _camTarget.set(
    boatGroup.position.x+Math.sin(camAngle)*CAM_DIST,
    boatGroup.position.y+CAM_HEIGHT,
    boatGroup.position.z-Math.cos(camAngle)*CAM_DIST
  )
  camPos.x+=(_camTarget.x-camPos.x)*CAM_STIFF*dt
  camPos.y+=(_camTarget.y-camPos.y)*CAM_STIFF*dt
  camPos.z+=(_camTarget.z-camPos.z)*CAM_STIFF*dt
  camera.position.copy(camPos)
  _lookTarget.copy(boatGroup.position); _lookTarget.y+=0.8
  camera.lookAt(_lookTarget)

  renderer.render(scene,camera)
}`,
            },

            // ── Cell 9: Wake trail ─────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Boat wake — a trail of white foam',
              mode: '3d',
              prose: [
                'A wake trail is a fixed-length circular buffer of past positions. Each frame, push the current boat XZ into the buffer (overwriting the oldest entry). Render the trail as a `THREE.Line` or `THREE.Points` that reads positions from this buffer. The circular buffer has zero allocation cost — the same array is reused forever.',
                'White foam is rendered as a `THREE.Points` cloud centered on each wake entry. The opacity fades based on the entry\'s age in the buffer. Position each wake point on the wave surface (`waveHeight` at that XZ) so the foam appears to rest on the water rather than floating in the air.',
                'The trail length is `WAKE_LENGTH` entries; the buffer index wraps with `(wakeHead + 1) % WAKE_LENGTH`. Reading from newest to oldest: loop `for (let i = 0; i < WAKE_LENGTH; i++) { const idx = (wakeHead - i + WAKE_LENGTH) % WAKE_LENGTH; }`. This avoids sorting.',
              ],
              code: `// ── Boat wake — circular buffer trail ────────────────────────

const BOAT_SPEED=6.0,BOAT_BOOST=12.0,TURN_RATE=1.8,FRICTION=1.2,GRID_HALF=18.5
const CAM_DIST=9.0,CAM_HEIGHT=4.5,CAM_STIFF=4.5,ORBIT_SPEED=0.005
const BUOY_STIFF=5.0,SLOPE_EPS=0.5,HULL_OFFSET=0.19,PITCH_SCALE=0.7
const WAKE_LENGTH = 80       // number of entries in the wake buffer
const WAKE_SPREAD = 0.55     // lateral spread of foam particles
const WAKE_INTERVAL = 0.06   // seconds between wake entries

const COLS=72,ROWS=72,TILE_SIZE=0.55
const W1_AMP=0.28,W1_FREQ=0.45,W1_SPEED=0.80
const W2_AMP=0.16,W2_FREQ=0.72,W2_SPEED=1.10,W2_DX=0.707,W2_DZ=0.707
const W3_AMP=0.09,W3_FREQ=1.50,W3_SPEED=1.60,W3_DX=-0.447,W3_DZ=0.894
const halfW=COLS*TILE_SIZE/2,halfD=ROWS*TILE_SIZE/2

function waveHeight(x,z,t){
  return W1_AMP*Math.sin(W1_FREQ*x-W1_SPEED*t)+
    W2_AMP*Math.sin(W2_FREQ*(x*W2_DX+z*W2_DZ)-W2_SPEED*t+1.5)+
    W3_AMP*Math.sin(W3_FREQ*(x*W3_DX+z*W3_DZ)-W3_SPEED*t+2.8)
}

// Wake buffer: circular array of {x, z}
const wakeXZ = new Float32Array(WAKE_LENGTH * 2)  // [x0,z0, x1,z1, ...]
let wakeHead = 0, wakeTimer = 0

let posAttr,posArray,oceanGeo,boatGroup,heading=0
let vel=new THREE.Vector3(),camPos=new THREE.Vector3(0,CAM_HEIGHT,CAM_DIST)
let camOrbitYaw=0,mouseX=0,mouseDown=false,boatPitch=0,boatRoll=0,time=0
let keyDownFn=null,keyUpFn=null,mouseDnFn=null,mouseMvFn=null,mouseUpFn=null
const KEYS=new Set()
const _camTarget=new THREE.Vector3(),_lookTarget=new THREE.Vector3()

// Wake line geometry
let wakeGeo, wakePosAttr, wakePosArr

function buildOcean() {
  const vCount=(COLS+1)*(ROWS+1); posArray=new Float32Array(vCount*3); let vi=0
  for(let r=0;r<=ROWS;r++) for(let c=0;c<=COLS;c++){
    posArray[vi++]=c*TILE_SIZE-halfW;posArray[vi++]=0;posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6);let ii=0
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  oceanGeo=new THREE.BufferGeometry()
  posAttr=new THREE.BufferAttribute(posArray,3)
  oceanGeo.setAttribute('position',posAttr)
  oceanGeo.setIndex(new THREE.BufferAttribute(idx,1))
  oceanGeo.computeVertexNormals()
  return oceanGeo
}

function init() {
  if(keyDownFn){
    window.removeEventListener('keydown',keyDownFn);window.removeEventListener('keyup',keyUpFn)
    renderer.domElement.removeEventListener('mousedown',mouseDnFn)
    window.removeEventListener('mousemove',mouseMvFn);window.removeEventListener('mouseup',mouseUpFn)
  }
  keyDownFn=e=>KEYS.add(e.code);keyUpFn=e=>KEYS.delete(e.code)
  mouseDnFn=e=>{mouseDown=true;mouseX=e.clientX}
  mouseMvFn=e=>{if(!mouseDown)return;camOrbitYaw+=(e.clientX-mouseX)*ORBIT_SPEED;mouseX=e.clientX}
  mouseUpFn=()=>{mouseDown=false}
  window.addEventListener('keydown',keyDownFn);window.addEventListener('keyup',keyUpFn)
  renderer.domElement.addEventListener('mousedown',mouseDnFn)
  window.addEventListener('mousemove',mouseMvFn);window.addEventListener('mouseup',mouseUpFn)

  scene.background=new THREE.Color(0x87ceeb);scene.fog=new THREE.Fog(0x87ceeb,20,44)
  scene.add(new THREE.AmbientLight(0xfff4e0,0.55))
  const sun=new THREE.DirectionalLight(0xfff4e0,1.3);sun.position.set(12,20,10);scene.add(sun)
  scene.add(new THREE.Mesh(buildOcean(),
    new THREE.MeshStandardMaterial({color:0x006994,roughness:0.15,metalness:0.25,side:THREE.DoubleSide})))

  // Wake line
  wakePosArr=new Float32Array(WAKE_LENGTH*3)
  wakePosAttr=new THREE.BufferAttribute(wakePosArr,3)
  wakeGeo=new THREE.BufferGeometry()
  wakeGeo.setAttribute('position',wakePosAttr)
  wakeGeo.setDrawRange(0,0)
  scene.add(new THREE.Line(wakeGeo,
    new THREE.LineBasicMaterial({color:0xffffff,opacity:0.55,transparent:true,linewidth:2})))

  // Buoys
  const bmat=new THREE.MeshStandardMaterial({color:0xff6600,roughness:0.5})
  const bgeo=new THREE.SphereGeometry(0.28,8,6)
  for(let i=0;i<14;i++){const b=new THREE.Mesh(bgeo,bmat);b.position.set((Math.random()-0.5)*34,0,(Math.random()-0.5)*34);scene.add(b)}

  boatGroup=new THREE.Group()
  boatGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,0.38,2.4),new THREE.MeshStandardMaterial({color:0xddddcc,roughness:0.6})))
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.42,0.9),new THREE.MeshStandardMaterial({color:0xeeeedd,roughness:0.6}))
  cabin.position.set(0,0.40,-0.1);boatGroup.add(cabin)
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,1.8,6),new THREE.MeshStandardMaterial({color:0x887766}))
  mast.position.set(0,1.1,0.2);boatGroup.add(mast)
  boatGroup.position.set(0,HULL_OFFSET,0);scene.add(boatGroup)

  camPos.set(0,CAM_HEIGHT,CAM_DIST)
  renderer.render(scene,camera)
}

function update(dt) {
  time+=dt
  const boost=KEYS.has('ShiftLeft')||KEYS.has('ShiftRight')
  const maxSpeed=boost?BOAT_BOOST:BOAT_SPEED

  if(KEYS.has('KeyA')||KEYS.has('ArrowLeft'))  heading+=TURN_RATE*dt
  if(KEYS.has('KeyD')||KEYS.has('ArrowRight')) heading-=TURN_RATE*dt
  const fwd=new THREE.Vector3(Math.sin(heading),0,-Math.cos(heading))
  if(KEYS.has('KeyW')||KEYS.has('ArrowUp'))   vel.addScaledVector(fwd,maxSpeed*dt)
  if(KEYS.has('KeyS')||KEYS.has('ArrowDown')) vel.addScaledVector(fwd,-maxSpeed*0.5*dt)
  vel.multiplyScalar(Math.max(0,1-FRICTION*dt))
  boatGroup.position.addScaledVector(vel,dt)
  boatGroup.position.x=THREE.MathUtils.clamp(boatGroup.position.x,-GRID_HALF,GRID_HALF)
  boatGroup.position.z=THREE.MathUtils.clamp(boatGroup.position.z,-GRID_HALF,GRID_HALF)

  const bx=boatGroup.position.x,bz=boatGroup.position.z
  boatGroup.position.y=waveHeight(bx,bz,time)+HULL_OFFSET
  const slopeX=(waveHeight(bx+SLOPE_EPS,bz,time)-waveHeight(bx-SLOPE_EPS,bz,time))/(2*SLOPE_EPS)
  const slopeZ=(waveHeight(bx,bz+SLOPE_EPS,time)-waveHeight(bx,bz-SLOPE_EPS,time))/(2*SLOPE_EPS)
  boatPitch+=((-slopeZ*PITCH_SCALE)-boatPitch)*BUOY_STIFF*dt
  boatRoll +=((slopeX*PITCH_SCALE)-boatRoll)*BUOY_STIFF*dt
  boatGroup.rotation.set(boatPitch,heading,boatRoll,'YXZ')

  // Wake: record position periodically
  wakeTimer+=dt
  if(wakeTimer>=WAKE_INTERVAL){
    wakeTimer=0
    wakeXZ[wakeHead*2]  =bx
    wakeXZ[wakeHead*2+1]=bz
    wakeHead=(wakeHead+1)%WAKE_LENGTH
  }
  // Write wake positions into line geometry (ordered oldest→newest)
  let drawCount=0
  for(let i=0;i<WAKE_LENGTH;i++){
    const idx=(wakeHead-1-i+WAKE_LENGTH)%WAKE_LENGTH
    const wx=wakeXZ[idx*2],wz=wakeXZ[idx*2+1]
    if(wx===0&&wz===0) break
    const wy=waveHeight(wx,wz,time)+0.06   // sit just above water
    wakePosArr[i*3]=wx;wakePosArr[i*3+1]=wy;wakePosArr[i*3+2]=wz
    drawCount++
  }
  wakePosAttr.needsUpdate=true
  wakeGeo.setDrawRange(0,drawCount)

  // Ocean mesh
  const vCount=(COLS+1)*(ROWS+1)
  for(let i=0;i<vCount;i++) posArray[i*3+1]=waveHeight(posArray[i*3],posArray[i*3+2],time)
  posAttr.needsUpdate=true;oceanGeo.computeVertexNormals()

  // Camera
  const camAngle=heading+Math.PI+camOrbitYaw
  _camTarget.set(boatGroup.position.x+Math.sin(camAngle)*CAM_DIST,boatGroup.position.y+CAM_HEIGHT,boatGroup.position.z-Math.cos(camAngle)*CAM_DIST)
  camPos.x+=(_camTarget.x-camPos.x)*CAM_STIFF*dt
  camPos.y+=(_camTarget.y-camPos.y)*CAM_STIFF*dt
  camPos.z+=(_camTarget.z-camPos.z)*CAM_STIFF*dt
  camera.position.copy(camPos)
  _lookTarget.copy(boatGroup.position);_lookTarget.y+=0.8;camera.lookAt(_lookTarget)
  renderer.render(scene,camera)
}`,
            },

          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'The **boat heading** is stored as a single angle θ in radians. The forward direction vector is `(sin θ, 0, −cos θ)`. This is the unit circle in the XZ plane: θ=0 → (0,0,−1) = forward along −Z; θ=π/2 → (1,0,0) = right; θ=π → (0,0,1) = backward. Turning updates θ: `θ += turnRate × dt` (left) or `θ −= turnRate × dt` (right).',

      '**Friction as exponential decay.** Each frame `vel *= (1 − friction × dt)`. After T seconds with no thrust, speed is `v(T) = v₀ × (1 − friction × dt)^(T/dt) ≈ v₀ × e^(−friction × T)`. The half-life (time for speed to halve) is `t₁⁄₂ = ln(2) / friction ≈ 0.693 / friction`. With `friction = 1.2` the half-life is ~0.58 seconds — the boat decelerates briskly.',

      '**Pitch and roll from the wave gradient.** At boat position (x, z), the wave surface has slope: `∂h/∂x ≈ [h(x+ε,z) − h(x−ε,z)] / 2ε` (controls roll — lean left/right) and `∂h/∂z ≈ [h(x,z+ε) − h(x,z−ε)] / 2ε` (controls pitch — nose up/down). These are rotation angles in radians (for small angles, `tan θ ≈ θ`, so the slope value IS the angle in radians). The spring `angle += (target − angle) × k × dt` provides the lag.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Forward Direction from Heading',
        body: '$$\\hat{f} = (\\sin\\theta,\\; 0,\\; -\\cos\\theta)$$\n\n$\\theta = 0$ → faces $-Z$ (into screen). $\\theta = \\pi/2$ → faces $+X$ (right). This is just the unit circle rotated 90° so that "forward" aligns with the negative Z convention Three.js uses for cameras.',
      },
      {
        type: 'theorem',
        title: 'Spring Follow',
        body: '$$x_{n+1} = x_n + (x_{\\text{target}} - x_n) \\cdot k \\cdot \\Delta t$$\n\nGap closes by fraction $k \\cdot \\Delta t$ per frame. Equivalent to $x(t) = x_{\\text{target}} + (x_0 - x_{\\text{target}}) \\, e^{-kt}$. Half-life: $t_{1/2} = \\ln 2 / k \\approx 0.693/k$.',
      },
    ],
    visualizations: [],
  },

  practice: {
    prose: [
      'The challenge places buoys at known positions and asks the student to navigate to them. This integrates all five boat systems in one interactive game loop.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge: Navigate to the Buoys',
        mathBridge: 'Extend the cell 9 simulation. Add a HUD label (HTML overlay) showing distance to the nearest buoy. When distance < 2.0, mark that buoy as "visited" (change its color to green) and display a count of how many you\'ve reached.',
        caption: 'Challenge difficulty: medium. Adds distance checks and state tracking to the working boat + ocean system.',
        initialProps: {
          initialCells: [
            {
              id: 'c2',
              challengeType: 'extend',
              challengeNumber: 2,
              challengeTitle: 'Navigate to the buoys',
              difficulty: 'medium',
              mode: '3d',
              prose: [
                'Start from the cell-9 boat simulation (controls + camera + buoyancy + wake). Place 8 buoys at random positions. Each frame compute distance from boat to each buoy: `dist = Math.sqrt((bx−boat.x)² + (bz−boat.z)²)`. When `dist < CAPTURE_RADIUS`, mark the buoy captured (change material color to green, increment a counter). Display the counter and distance to nearest buoy in a `<div>` overlay on the canvas.',
              ],
              prompt: 'Add the 8 target buoys. In update(), loop over buoys and check distance. Capture when within CAPTURE_RADIUS. Update an HTML overlay element with the count and nearest distance. Win condition: all 8 captured.',
              hint: 'Create the overlay div in init(): `const hud = document.createElement(\'div\'); hud.style.cssText = \'position:absolute;top:8px;left:8px;color:white;font:14px monospace\'; renderer.domElement.parentElement.style.position=\'relative\'; renderer.domElement.parentElement.appendChild(hud)`. Update `hud.textContent` in update().',
              code: `// ── Starter: full boat sim — add buoy navigation ─────────────
// Copy your Cell 9 code here and extend it

const BOAT_SPEED=6.0,BOAT_BOOST=12.0,TURN_RATE=1.8,FRICTION=1.2,GRID_HALF=18.5
const CAM_DIST=9.0,CAM_HEIGHT=4.5,CAM_STIFF=4.5,ORBIT_SPEED=0.005
const BUOY_STIFF=5.0,SLOPE_EPS=0.5,HULL_OFFSET=0.19,PITCH_SCALE=0.7
const WAKE_LENGTH=80,WAKE_INTERVAL=0.06
const CAPTURE_RADIUS = 2.2   // how close to "collect" a buoy

const COLS=72,ROWS=72,TILE_SIZE=0.55
const W1_AMP=0.28,W1_FREQ=0.45,W1_SPEED=0.80
const W2_AMP=0.16,W2_FREQ=0.72,W2_SPEED=1.10,W2_DX=0.707,W2_DZ=0.707
const W3_AMP=0.09,W3_FREQ=1.50,W3_SPEED=1.60,W3_DX=-0.447,W3_DZ=0.894
const halfW=COLS*TILE_SIZE/2,halfD=ROWS*TILE_SIZE/2

function waveHeight(x,z,t){
  return W1_AMP*Math.sin(W1_FREQ*x-W1_SPEED*t)+
    W2_AMP*Math.sin(W2_FREQ*(x*W2_DX+z*W2_DZ)-W2_SPEED*t+1.5)+
    W3_AMP*Math.sin(W3_FREQ*(x*W3_DX+z*W3_DZ)-W3_SPEED*t+2.8)
}

// TODO: add buoy tracking arrays: buoyMeshes = [], buoyCaptured = []
// TODO: create HUD element in init()
// TODO: check distances and capture in update()

let posAttr,posArray,oceanGeo,boatGroup,heading=0
let vel=new THREE.Vector3(),camPos=new THREE.Vector3(0,CAM_HEIGHT,CAM_DIST)
let camOrbitYaw=0,mouseX=0,mouseDown=false,boatPitch=0,boatRoll=0,time=0
let keyDownFn=null,keyUpFn=null,mouseDnFn=null,mouseMvFn=null,mouseUpFn=null
const KEYS=new Set()
const _camTarget=new THREE.Vector3(),_lookTarget=new THREE.Vector3()
const wakeXZ=new Float32Array(WAKE_LENGTH*2)
let wakeHead=0,wakeTimer=0
let wakeGeo,wakePosAttr,wakePosArr

function buildOcean() {
  const vCount=(COLS+1)*(ROWS+1);posArray=new Float32Array(vCount*3);let vi=0
  for(let r=0;r<=ROWS;r++) for(let c=0;c<=COLS;c++){
    posArray[vi++]=c*TILE_SIZE-halfW;posArray[vi++]=0;posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6);let ii=0
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  oceanGeo=new THREE.BufferGeometry()
  posAttr=new THREE.BufferAttribute(posArray,3)
  oceanGeo.setAttribute('position',posAttr);oceanGeo.setIndex(new THREE.BufferAttribute(idx,1))
  oceanGeo.computeVertexNormals();return oceanGeo
}

function init() {
  if(keyDownFn){
    window.removeEventListener('keydown',keyDownFn);window.removeEventListener('keyup',keyUpFn)
    renderer.domElement.removeEventListener('mousedown',mouseDnFn)
    window.removeEventListener('mousemove',mouseMvFn);window.removeEventListener('mouseup',mouseUpFn)
  }
  keyDownFn=e=>KEYS.add(e.code);keyUpFn=e=>KEYS.delete(e.code)
  mouseDnFn=e=>{mouseDown=true;mouseX=e.clientX}
  mouseMvFn=e=>{if(!mouseDown)return;camOrbitYaw+=(e.clientX-mouseX)*ORBIT_SPEED;mouseX=e.clientX}
  mouseUpFn=()=>{mouseDown=false}
  window.addEventListener('keydown',keyDownFn);window.addEventListener('keyup',keyUpFn)
  renderer.domElement.addEventListener('mousedown',mouseDnFn)
  window.addEventListener('mousemove',mouseMvFn);window.addEventListener('mouseup',mouseUpFn)

  scene.background=new THREE.Color(0x87ceeb);scene.fog=new THREE.Fog(0x87ceeb,20,44)
  scene.add(new THREE.AmbientLight(0xfff4e0,0.55))
  const sun=new THREE.DirectionalLight(0xfff4e0,1.3);sun.position.set(12,20,10);scene.add(sun)
  scene.add(new THREE.Mesh(buildOcean(),
    new THREE.MeshStandardMaterial({color:0x006994,roughness:0.15,metalness:0.25,side:THREE.DoubleSide})))

  // Wake
  wakePosArr=new Float32Array(WAKE_LENGTH*3);wakePosAttr=new THREE.BufferAttribute(wakePosArr,3)
  wakeGeo=new THREE.BufferGeometry();wakeGeo.setAttribute('position',wakePosAttr);wakeGeo.setDrawRange(0,0)
  scene.add(new THREE.Line(wakeGeo,new THREE.LineBasicMaterial({color:0xffffff,opacity:0.55,transparent:true})))

  boatGroup=new THREE.Group()
  boatGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,0.38,2.4),new THREE.MeshStandardMaterial({color:0xddddcc,roughness:0.6})))
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.42,0.9),new THREE.MeshStandardMaterial({color:0xeeeedd,roughness:0.6}))
  cabin.position.set(0,0.40,-0.1);boatGroup.add(cabin)
  boatGroup.position.set(0,HULL_OFFSET,0);scene.add(boatGroup)

  camPos.set(0,CAM_HEIGHT,CAM_DIST)
  renderer.render(scene,camera)
}

function update(dt) {
  time+=dt
  const boost=KEYS.has('ShiftLeft')||KEYS.has('ShiftRight')
  const maxSpeed=boost?BOAT_BOOST:BOAT_SPEED
  if(KEYS.has('KeyA')||KEYS.has('ArrowLeft'))  heading+=TURN_RATE*dt
  if(KEYS.has('KeyD')||KEYS.has('ArrowRight')) heading-=TURN_RATE*dt
  const fwd=new THREE.Vector3(Math.sin(heading),0,-Math.cos(heading))
  if(KEYS.has('KeyW')||KEYS.has('ArrowUp'))   vel.addScaledVector(fwd,maxSpeed*dt)
  if(KEYS.has('KeyS')||KEYS.has('ArrowDown')) vel.addScaledVector(fwd,-maxSpeed*0.5*dt)
  vel.multiplyScalar(Math.max(0,1-FRICTION*dt))
  boatGroup.position.addScaledVector(vel,dt)
  boatGroup.position.x=THREE.MathUtils.clamp(boatGroup.position.x,-GRID_HALF,GRID_HALF)
  boatGroup.position.z=THREE.MathUtils.clamp(boatGroup.position.z,-GRID_HALF,GRID_HALF)
  const bx=boatGroup.position.x,bz=boatGroup.position.z
  boatGroup.position.y=waveHeight(bx,bz,time)+HULL_OFFSET
  const slopeX=(waveHeight(bx+SLOPE_EPS,bz,time)-waveHeight(bx-SLOPE_EPS,bz,time))/(2*SLOPE_EPS)
  const slopeZ=(waveHeight(bx,bz+SLOPE_EPS,time)-waveHeight(bx,bz-SLOPE_EPS,time))/(2*SLOPE_EPS)
  boatPitch+=((-slopeZ*PITCH_SCALE)-boatPitch)*BUOY_STIFF*dt
  boatRoll +=((slopeX*PITCH_SCALE)-boatRoll)*BUOY_STIFF*dt
  boatGroup.rotation.set(boatPitch,heading,boatRoll,'YXZ')

  // TODO: check buoy distances and capture here

  wakeTimer+=dt
  if(wakeTimer>=WAKE_INTERVAL){
    wakeTimer=0;wakeXZ[wakeHead*2]=bx;wakeXZ[wakeHead*2+1]=bz;wakeHead=(wakeHead+1)%WAKE_LENGTH
  }
  let drawCount=0
  for(let i=0;i<WAKE_LENGTH;i++){
    const idx=(wakeHead-1-i+WAKE_LENGTH)%WAKE_LENGTH
    const wx=wakeXZ[idx*2],wz=wakeXZ[idx*2+1]
    if(wx===0&&wz===0) break
    wakePosArr[i*3]=wx;wakePosArr[i*3+1]=waveHeight(wx,wz,time)+0.06;wakePosArr[i*3+2]=wz;drawCount++
  }
  wakePosAttr.needsUpdate=true;wakeGeo.setDrawRange(0,drawCount)

  const vCount=(COLS+1)*(ROWS+1)
  for(let i=0;i<vCount;i++) posArray[i*3+1]=waveHeight(posArray[i*3],posArray[i*3+2],time)
  posAttr.needsUpdate=true;oceanGeo.computeVertexNormals()

  const camAngle=heading+Math.PI+camOrbitYaw
  _camTarget.set(boatGroup.position.x+Math.sin(camAngle)*CAM_DIST,boatGroup.position.y+CAM_HEIGHT,boatGroup.position.z-Math.cos(camAngle)*CAM_DIST)
  camPos.x+=(_camTarget.x-camPos.x)*CAM_STIFF*dt
  camPos.y+=(_camTarget.y-camPos.y)*CAM_STIFF*dt
  camPos.z+=(_camTarget.z-camPos.z)*CAM_STIFF*dt
  camera.position.copy(camPos);_lookTarget.copy(boatGroup.position);_lookTarget.y+=0.8;camera.lookAt(_lookTarget)
  renderer.render(scene,camera)
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
      text: 'The boat\'s heading changes with arrow keys: `heading += TURN_RATE * dt * input`. Why multiply TURN_RATE by dt?',
      options: [
        'dt converts radians to degrees for the Three.js rotation system',
        'Turn rate is in radians per second. Multiplying by dt (seconds elapsed) gives the angle change for this specific frame. Without dt, the boat would turn faster on a slow machine (large dt) and slower on a fast one — multiplying by dt makes turning speed frame-rate independent',
        'Multiplying by dt prevents heading from exceeding 2π',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The spring-follow camera uses: `camPos.x += (_camTarget.x - camPos.x) * CAM_STIFF * dt`. With CAM_STIFF = 3, how many seconds does it take the camera to close roughly 95% of the gap to its target?',
      options: [
        'About 1 second — CAM_STIFF is the reciprocal of the time constant',
        'About 1 second. This is an exponential approach: at stiffness 3, the camera covers ~95% of the gap in 1/CAM_STIFF ≈ 0.33s × 3 ≈ 1s (since 63% per time constant × 3 constants ≈ 95%). Higher stiffness = snappier follow; lower = looser lag',
        'About 3 seconds — one second per stiffness unit',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The boat tilts to match the wave: `pitch = waveHeight(x+dx) - waveHeight(x-dx)` gives the slope, and `boatGroup.rotation.x = pitch`. Why sample two points and subtract rather than sampling just one?',
      options: [
        'Sampling one point gives the height; subtracting two adjacent points gives the slope (rise over run). The pitch angle is proportional to the slope of the water surface under the boat — a forward-tilting bow means the water is rising ahead. The two-point difference is the discrete equivalent of the derivative of the wave function',
        'Three.js rotation requires two sample points to compute a quaternion',
        'A single sample point gives the average height but not the orientation',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The lesson describes "three independent systems bolted together": keyboard input, spring camera, and buoyancy. What is the advantage of designing them independently?',
      options: [
        'Independent systems run on separate CPU cores automatically',
        'Each system has a clear input (keyboard state, boat position, wave function) and output (heading/speed, camera position, boat Y/rotation). They can be developed, tested, and modified in isolation. Changing the camera stiffness does not touch the buoyancy code; adding a joystick only changes the input layer',
        'Three.js requires each system to be in a separate file',
      ],
      correct: 1,
    },
  ],
}
