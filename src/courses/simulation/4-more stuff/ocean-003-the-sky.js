export default {
  id: 'ocean-003',
  slug: 'ocean-the-sky',
  chapter: 'ocean1',
  order: 3,
  title: 'The Sky — Sun, Clouds, and the Full Scene',
  subtitle: 'Day-night cycle, billboard clouds, moon and stars, then everything combined into a complete interactive ocean world.',
  tags: ['three.js', 'sky', 'day-night', 'sun', 'moon', 'clouds', 'Sprite', 'CanvasTexture', 'atmosphere', 'capstone'],
  aliases: 'sky sun moon stars clouds day night cycle atmosphere billboard sprite CanvasTexture ocean capstone',
  timeToComplete: 42,
  coreConcept: 'The sky is two independent systems: a sun on a circular orbit that drives light color and intensity, and billboard sprites for clouds and stars that always face the camera. Wire them to the ocean and boat from the previous lesson to complete the full scene.',
  prerequisites: ['ocean-the-boat'],
  nextLesson: null,

  hook: {
    question: 'The sun moves across the sky, light changes color, clouds drift overhead, stars appear at night. How many lines of code does that take — and how much of it is math you already know?',
    realWorldContext: "Day-night cycles appear in almost every open-world game (Minecraft, Skyrim, Red Dead Redemption). They are almost always the same technique: one directional light on a 2D orbit, sky/fog colors lerped through a palette of 4–6 keyframes. The math is a single angle that advances with time. Everything else is lerping between colors you pick by eye.",
  },

  intuition: {
    prose: [
      "**The sun is a DirectionalLight on a circle.** A single angle `sunAngle = (time / DAY_DURATION) * 2π` advances from 0 to 2π over the full day. The sun's position is `(cos(sunAngle) * radius, sin(sunAngle) * radius, 0)` — a circle in the XY plane. When `sin(sunAngle) > 0` the sun is above the horizon (daytime); when it's below, it's night. The light intensity and color follow a palette of keyframes that you lerp between based on the angle.",

      "**Sky color = lerp between 4 keyframes.** At `sunAngle = 0` (midnight) the sky is deep navy. At `π/2` (sunrise) it's amber-pink. At `π` (noon) it's bright blue. At `3π/2` (sunset) it's red-orange. Each frame you find where in the cycle you are, pick the two surrounding keyframes, and `color.lerpColors(a, b, t)`. The fog color tracks the horizon sky color so the distance fade looks atmospheric.",

      "**Billboard sprites for clouds.** `THREE.Sprite` is a mesh that always faces the camera — it's the right tool for clouds, smoke, lens flare, icons in 3D space. Create a `CanvasTexture` by drawing a radial gradient on a 2D canvas: white center fading to transparent edge. Assign it to a `SpriteMaterial`. Place sprites at random XY positions high in the sky. Each sprite gets a slow random drift velocity.",

      "**Stars are instanced or a Points cloud.** At night (`sunAngle > π`), fade in a `THREE.Points` object that represents the star field. The stars are fixed in world space — they don't move. Their opacity lerps from 0 (day) to 1 (deep night) using the same sky-phase logic as the light color. Using `THREE.Points` with a single draw call renders thousands of stars with zero extra cost.",

      "**Putting it all together.** The full capstone scene runs the ocean mesh, boat controls, spring camera, buoyancy, wake, day-night cycle, clouds, and buoys simultaneously. Each system is independent — they share the `time` variable and the `waveHeight` function, and nothing else. This is the architecture of a real game scene: isolated, composable systems that run in the same `update(dt)` loop.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'THREE.Sprite — billboard in 3D space',
        body: '`THREE.Sprite` is a special mesh that always rotates to face the camera — you never have to track the camera orientation manually. It uses a `SpriteMaterial` instead of `MeshStandardMaterial`. `sprite.scale.set(w, h, 1)` controls its world-space size. Sprites are not affected by scene lighting, which is correct for clouds and particles that emit their own light.',
      },
      {
        type: 'insight',
        title: 'CanvasTexture — draw anything as a texture',
        body: 'Create a 2D canvas, draw on it with the 2D context API (gradients, arcs, text, anything), then `new THREE.CanvasTexture(canvas)` wraps it as a GPU texture. Since sprites are just textured quads, a soft radial gradient on a canvas becomes a convincing cloud puff. Change the gradient colors to get smoke, glow effects, or lens flare.',
      },
      {
        type: 'warning',
        title: 'DirectionalLight position is a direction, not a location',
        body: 'Three.js `DirectionalLight` casts parallel rays, like the sun — the light rays are all parallel regardless of scene scale. The `light.position` vector defines the *direction* the light comes FROM (toward the scene origin), not an actual point in space. Setting `light.position.set(10, 10, 0)` means "light comes from the upper right." Moving it to `(-10, -5, 0)` makes the sun set on the left.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Building the Sky — Sun, Clouds, Then Everything',
        mathBridge: 'Cell 10 builds the day-night light cycle. Cell 11 adds billboard cloud sprites. Cell 12 adds the moon and stars. Cell 13 is the full capstone scene combining ocean, boat, camera, and sky.',
        caption: 'The last cell is the complete project. WASD/arrows to steer, mouse to orbit, watch the day pass.',
        initialProps: {
          initialCells: [

            // ── Cell 10: Day-night light cycle ────────────────────────────────
            {
              id: 10,
              cellTitle: 'Day-night cycle — a sun on a circle',
              mode: '3d',
              prose: [
                'The sun is a `DirectionalLight` whose position traces a circle in the XY plane as time advances. One full revolution = one day (`DAY_DURATION` seconds). `sunAngle = (time / DAY_DURATION) * 2π`. The sun\'s XY position is `(cos(sunAngle), sin(sunAngle))`. When `sin(sunAngle) < 0` the sun is below the horizon — we set light intensity to 0 (or a very small ambient value) and use the night palette.',
                'Sky and fog colors are defined as four keyframes at angles `0` (midnight), `π/2` (dawn), `π` (noon), `3π/2` (dusk). Each frame we find which keyframe pair surrounds the current angle, compute a local `t` in [0,1], and call `color.lerpColors(a, b, t)`. Using `THREE.MathUtils.smoothstep(t, 0, 1)` on the t value makes the transitions feel less mechanical.',
                'Try changing `DAY_DURATION` to `20` for a very fast day. Or set the initial `time` to `DAY_DURATION / 4` to start at dawn and watch the sunrise.',
              ],
              code: `// ── Day-night cycle ────────────────────────────────────────────

const DAY_DURATION = 30     // seconds per full day (try 30 for demo speed)
const SUN_DIST     = 20     // distance of sun orbit from origin
const MIN_LIGHT    = 0.04   // minimum light intensity at midnight

// Color palettes — [midnight, dawn, noon, dusk]
const SKY_PALETTE = [0x050a1a, 0xf4a460, 0x87ceeb, 0xff6030]
const FOG_PALETTE = [0x050a1a, 0xc08040, 0x87ceeb, 0xdd5522]
const SUN_PALETTE = [0x223366, 0xff9944, 0xfff4e0, 0xff7722]
const AMB_PALETTE = [0x050a1a, 0x554422, 0xfff4e0, 0x553311]

const SUN_ANGLES = [0, Math.PI/2, Math.PI, 3*Math.PI/2]  // midnight, dawn, noon, dusk

let sunLight, ambLight, time = 0

const _colorA = new THREE.Color(), _colorB = new THREE.Color()

function lerpPalette(palette, angle) {
  // Find which two keyframes surround the current angle
  const cycle = ((angle % (Math.PI*2)) + Math.PI*2) % (Math.PI*2)
  let ia = 0
  for (let i = 0; i < SUN_ANGLES.length; i++) {
    if (SUN_ANGLES[i] <= cycle) ia = i
  }
  const ib = (ia + 1) % SUN_ANGLES.length
  const angleA = SUN_ANGLES[ia]
  const angleB = ib === 0 ? Math.PI*2 : SUN_ANGLES[ib]
  const t = THREE.MathUtils.smoothstep((cycle - angleA) / (angleB - angleA), 0, 1)
  _colorA.setHex(palette[ia])
  _colorB.setHex(palette[ib])
  return new THREE.Color().lerpColors(_colorA, _colorB, t)
}

function init() {
  ambLight = new THREE.AmbientLight(0xffffff, 0.15)
  scene.add(ambLight)

  sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
  sunLight.castShadow = false
  scene.add(sunLight)

  // Simple ground plane for light reference
  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x006994, roughness: 0.2, side: THREE.DoubleSide })
  ))

  // Sun sphere (visual only — not the light)
  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffee88 })
  )
  sunSphere.name = 'sunVisual'
  scene.add(sunSphere)

  camera.position.set(0, 8, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const sunAngle = (time / DAY_DURATION) * Math.PI * 2

  // Sun position on XY circle (Z=0 so sun rises in East, sets in West)
  const sx = Math.cos(sunAngle) * SUN_DIST
  const sy = Math.sin(sunAngle) * SUN_DIST
  sunLight.position.set(sx, sy, SUN_DIST * 0.3)

  // Light color and intensity from palette
  const sunCol  = lerpPalette(SUN_PALETTE, sunAngle)
  const ambCol  = lerpPalette(AMB_PALETTE, sunAngle)
  sunLight.color.copy(sunCol)
  ambLight.color.copy(ambCol)

  // Intensity: full during day, fade out near horizon and below
  const elevation = Math.sin(sunAngle)   // -1 to +1; 0 = horizon
  sunLight.intensity = Math.max(MIN_LIGHT, elevation * 1.4)
  ambLight.intensity = Math.max(0.04, elevation * 0.35 + 0.12)

  // Sky and fog colors
  const skyCol = lerpPalette(SKY_PALETTE, sunAngle)
  const fogCol = lerpPalette(FOG_PALETTE, sunAngle)
  scene.background = skyCol
  scene.fog = new THREE.Fog(fogCol, 18, 44)

  // Move sun visual sphere
  const sunVis = scene.getObjectByName('sunVisual')
  if (sunVis) sunVis.position.set(sx * 0.7, sy * 0.7, SUN_DIST * 0.2)

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 11: Billboard clouds ──────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Billboard clouds — Sprite and CanvasTexture',
              mode: '3d',
              prose: [
                '`THREE.Sprite` always faces the camera. Combined with a soft circular texture it makes a convincing cloud puff. The texture is a `CanvasTexture`: draw a radial gradient (white center, transparent edge) on a 2D canvas, then pass the canvas element to `new THREE.CanvasTexture(canvas)`. One canvas, one texture, one material — all cloud sprites share the same material.',
                'Clouds drift slowly. Give each sprite a small random horizontal velocity `(vx, vz)`. Each frame add `vel * dt` to position. When a cloud drifts too far from center, wrap it to the opposite edge (`x > CLOUD_BOUND ? x -= CLOUD_BOUND*2 : ...`). This gives an infinite cloud field with a fixed pool of sprites.',
                'Cloud brightness follows the sun: multiply `SpriteMaterial.color` by the current sky brightness scalar. During sunset the clouds turn orange-pink automatically because the entire color palette shifts.',
              ],
              code: `// ── Billboard clouds — Sprite + CanvasTexture ────────────────

const CLOUD_COUNT  = 18
const CLOUD_HEIGHT_MIN = 7,  CLOUD_HEIGHT_MAX = 13
const CLOUD_SCALE_MIN  = 3.5, CLOUD_SCALE_MAX = 7.0
const CLOUD_BOUND  = 22     // wrap boundary (world units from center)
const CLOUD_SPEED  = 1.2    // max drift speed

const DAY_DURATION = 30
const SUN_DIST     = 20

let sunLight, ambLight, time = 0
const SKY_PALETTE=[0x050a1a,0xf4a460,0x87ceeb,0xff6030]
const FOG_PALETTE=[0x050a1a,0xc08040,0x87ceeb,0xdd5522]
const SUN_PALETTE=[0x223366,0xff9944,0xfff4e0,0xff7722]
const AMB_PALETTE=[0x050a1a,0x554422,0xfff4e0,0x553311]
const SUN_ANGLES=[0,Math.PI/2,Math.PI,3*Math.PI/2]
const _cA=new THREE.Color(),_cB=new THREE.Color()
function lerpPal(pal,angle){
  const c=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2)
  let ia=0; for(let i=0;i<SUN_ANGLES.length;i++) if(SUN_ANGLES[i]<=c) ia=i
  const ib=(ia+1)%SUN_ANGLES.length
  const aA=SUN_ANGLES[ia],aB=ib===0?Math.PI*2:SUN_ANGLES[ib]
  const t=THREE.MathUtils.smoothstep((c-aA)/(aB-aA),0,1)
  _cA.setHex(pal[ia]);_cB.setHex(pal[ib])
  return new THREE.Color().lerpColors(_cA,_cB,t)
}

// Cloud data
const cloudSprites = []
const cloudVels    = []   // {vx, vz} per cloud

function makeCloudTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60)
  grad.addColorStop(0,    'rgba(255,255,255,0.92)')
  grad.addColorStop(0.45, 'rgba(255,255,255,0.65)')
  grad.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(64, 64, 60, 0, Math.PI*2); ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

function init() {
  ambLight = new THREE.AmbientLight(0xffffff, 0.15); scene.add(ambLight)
  sunLight = new THREE.DirectionalLight(0xffffff, 1.2); scene.add(sunLight)

  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color:0x006994, roughness:0.2, side:THREE.DoubleSide })
  ))

  const cloudTex = makeCloudTexture()
  const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false })

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const sprite = new THREE.Sprite(cloudMat)
    const scale  = CLOUD_SCALE_MIN + Math.random() * (CLOUD_SCALE_MAX - CLOUD_SCALE_MIN)
    sprite.scale.set(scale, scale * 0.45, 1)
    sprite.position.set(
      (Math.random() - 0.5) * CLOUD_BOUND * 2,
      CLOUD_HEIGHT_MIN + Math.random() * (CLOUD_HEIGHT_MAX - CLOUD_HEIGHT_MIN),
      (Math.random() - 0.5) * CLOUD_BOUND * 2
    )
    scene.add(sprite)
    cloudSprites.push(sprite)
    cloudVels.push({
      vx: (Math.random() - 0.5) * CLOUD_SPEED,
      vz: (Math.random() - 0.5) * CLOUD_SPEED * 0.3,
    })
  }

  camera.position.set(0, 8, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

const _skyCol = new THREE.Color()

function update(dt) {
  time += dt
  const sunAngle = (time / DAY_DURATION) * Math.PI * 2
  const sx = Math.cos(sunAngle) * SUN_DIST, sy = Math.sin(sunAngle) * SUN_DIST
  sunLight.position.set(sx, sy, SUN_DIST * 0.3)
  const elevation = Math.sin(sunAngle)
  sunLight.color.copy(lerpPal(SUN_PALETTE, sunAngle))
  sunLight.intensity = Math.max(0.04, elevation * 1.4)
  ambLight.color.copy(lerpPal(AMB_PALETTE, sunAngle))
  ambLight.intensity = Math.max(0.04, elevation * 0.35 + 0.12)
  _skyCol.copy(lerpPal(SKY_PALETTE, sunAngle))
  scene.background = _skyCol.clone()
  scene.fog = new THREE.Fog(lerpPal(FOG_PALETTE, sunAngle), 18, 44)

  // Cloud drift + wrap
  const brightness = Math.max(0.2, elevation * 0.5 + 0.65)
  for (let i = 0; i < CLOUD_COUNT; i++) {
    const sp = cloudSprites[i], v = cloudVels[i]
    sp.position.x += v.vx * dt
    sp.position.z += v.vz * dt
    if (sp.position.x >  CLOUD_BOUND) sp.position.x -= CLOUD_BOUND * 2
    if (sp.position.x < -CLOUD_BOUND) sp.position.x += CLOUD_BOUND * 2
    if (sp.position.z >  CLOUD_BOUND) sp.position.z -= CLOUD_BOUND * 2
    if (sp.position.z < -CLOUD_BOUND) sp.position.z += CLOUD_BOUND * 2
    // Tint clouds with sky color at sunset
    sp.material.color.lerpColors(new THREE.Color(0xffffff), _skyCol, 0.18 * (1 - elevation))
    sp.material.opacity = brightness
  }

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 12: Moon and stars ────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'Moon and stars — night sky with Points',
              mode: '3d',
              prose: [
                'The moon is a `THREE.Sprite` on the opposite side of the sky from the sun: `moonAngle = sunAngle + π`. It glows with a soft white `CanvasTexture` halo and fades in as the sun sets and fades out as it rises. A `MeshBasicMaterial` sphere overlaid with a low-opacity halo sphere creates a nice glow.',
                'Stars are a single `THREE.Points` object with ~600 vertices scattered uniformly on a large sphere (radius ≈ 35). This is the **sphere point picking** technique: `theta = 2π * random, phi = acos(2 * random - 1)`. Each star\'s world position is fixed — only opacity changes with the time of day.',
                'Both fade with the same `nightFactor = Math.max(0, -Math.sin(sunAngle))` — it is 0 at noon, 1 at midnight, matching our intuition exactly.',
              ],
              code: `// ── Moon and stars ────────────────────────────────────────────

const DAY_DURATION = 30, SUN_DIST = 20
const STAR_COUNT   = 600
const STAR_RADIUS  = 38    // stars on a dome far from the scene

const SKY_PALETTE=[0x050a1a,0xf4a460,0x87ceeb,0xff6030]
const FOG_PALETTE=[0x050a1a,0xc08040,0x87ceeb,0xdd5522]
const SUN_PALETTE=[0x223366,0xff9944,0xfff4e0,0xff7722]
const AMB_PALETTE=[0x050a1a,0x554422,0xfff4e0,0x553311]
const SUN_ANGLES=[0,Math.PI/2,Math.PI,3*Math.PI/2]
const _cA=new THREE.Color(),_cB=new THREE.Color()
function lerpPal(pal,angle){
  const c=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2)
  let ia=0; for(let i=0;i<SUN_ANGLES.length;i++) if(SUN_ANGLES[i]<=c) ia=i
  const ib=(ia+1)%SUN_ANGLES.length,aA=SUN_ANGLES[ia],aB=ib===0?Math.PI*2:SUN_ANGLES[ib]
  const t=THREE.MathUtils.smoothstep((c-aA)/(aB-aA),0,1)
  _cA.setHex(pal[ia]);_cB.setHex(pal[ib])
  return new THREE.Color().lerpColors(_cA,_cB,t)
}

let sunLight,ambLight,moonSprite,starPoints,starMat,time=0

function makeSoftCircle(size,color,alpha) {
  const cv=document.createElement('canvas'); cv.width=cv.height=size
  const ctx=cv.getContext('2d')
  const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2*0.92)
  g.addColorStop(0, \`rgba(\${color},\${alpha})\`)
  g.addColorStop(0.55,\`rgba(\${color},\${alpha*0.6})\`)
  g.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(size/2,size/2,size/2*0.92,0,Math.PI*2); ctx.fill()
  return new THREE.CanvasTexture(cv)
}

function init() {
  ambLight=new THREE.AmbientLight(0xffffff,0.15); scene.add(ambLight)
  sunLight=new THREE.DirectionalLight(0xffffff,1.2); scene.add(sunLight)
  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(50,50),
    new THREE.MeshStandardMaterial({color:0x006994,roughness:0.2,side:THREE.DoubleSide})
  ))

  // Moon sprite
  const moonTex = makeSoftCircle(128, '220,220,255', 0.95)
  moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: moonTex, transparent: true, depthWrite: false, opacity: 0
  }))
  moonSprite.scale.set(3.2, 3.2, 1)
  scene.add(moonSprite)

  // Stars: Points on a large sphere
  const starPosArr = new Float32Array(STAR_COUNT * 3)
  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    starPosArr[i*3]   = STAR_RADIUS * Math.sin(phi) * Math.cos(theta)
    starPosArr[i*3+1] = STAR_RADIUS * Math.abs(Math.sin(phi))  // upper hemisphere only
    starPosArr[i*3+2] = STAR_RADIUS * Math.sin(phi) * Math.sin(theta)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPosArr, 3))
  starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, sizeAttenuation: true, transparent: true, opacity: 0 })
  starPoints = new THREE.Points(starGeo, starMat)
  scene.add(starPoints)

  camera.position.set(0, 8, 18)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function update(dt) {
  time += dt
  const sunAngle = (time / DAY_DURATION) * Math.PI * 2
  const elevation = Math.sin(sunAngle)

  // Sun light
  sunLight.position.set(Math.cos(sunAngle)*SUN_DIST, Math.sin(sunAngle)*SUN_DIST, SUN_DIST*0.3)
  sunLight.color.copy(lerpPal(SUN_PALETTE,sunAngle))
  sunLight.intensity=Math.max(0.04,elevation*1.4)
  ambLight.color.copy(lerpPal(AMB_PALETTE,sunAngle))
  ambLight.intensity=Math.max(0.04,elevation*0.35+0.12)
  scene.background=lerpPal(SKY_PALETTE,sunAngle).clone()
  scene.fog=new THREE.Fog(lerpPal(FOG_PALETTE,sunAngle),18,44)

  // Night factor: 0 at noon, 1 at midnight
  const nightFactor = Math.max(0, -elevation)

  // Moon: opposite side of sky from sun
  const moonAngle = sunAngle + Math.PI
  const moonX = Math.cos(moonAngle) * SUN_DIST * 0.8
  const moonY = Math.sin(moonAngle) * SUN_DIST * 0.8
  moonSprite.position.set(moonX, moonY, SUN_DIST * 0.2)
  moonSprite.material.opacity = nightFactor * 0.9

  // Stars: fade in at night
  starMat.opacity = nightFactor * 0.85

  renderer.render(scene, camera)
}`,
            },

            // ── Cell 13: Full capstone scene ───────────────────────────────────
            {
              id: 13,
              cellTitle: 'The complete ocean world — all systems running',
              mode: '3d',
              prose: [
                'This is the final cell — all the systems from the last three lessons running simultaneously. Ocean mesh with three-wave superposition. Boat with WASD/arrow controls, spring-follow orbit camera, buoyancy, pitch/roll, and a wake trail. Day-night cycle (3-minute days). Billboard clouds that drift and tint at sunset. Moon and stars at night. Random buoys scattered on the water.',
                'Notice how each system is still independent. The wave function is shared but nothing else crosses boundaries. The sky doesn\'t know about the boat. The buoyancy doesn\'t know about the camera. Adding a new feature (a lighthouse, a sail, a storm) only requires touching the one system it belongs to.',
                'WASD or arrow keys to steer. Shift for a speed boost. Mouse drag on the canvas to orbit the camera. Watch the sun move — a full day takes 3 minutes at this setting.',
              ],
              code: `// ── Full ocean world — ocean + boat + sky + clouds ────────────

// ═══ Tuning constants ═══════════════════════════════════════════
const BOAT_SPEED=6.0, BOAT_BOOST=12.0, TURN_RATE=1.8, FRICTION=1.2
const GRID_HALF=18.5
const CAM_DIST=9.0, CAM_HEIGHT=4.5, CAM_STIFF=4.5, ORBIT_SPEED=0.005
const BUOY_STIFF=5.0, SLOPE_EPS=0.5, HULL_OFFSET=0.19, PITCH_SCALE=0.7
const WAKE_LENGTH=80, WAKE_INTERVAL=0.06
const DAY_DURATION=180    // 3-minute day
const SUN_DIST=25
const CLOUD_COUNT=16
const CLOUD_HEIGHT_MIN=9, CLOUD_HEIGHT_MAX=15
const BUOY_COUNT=12

// ═══ Ocean / wave constants ═══════════════════════════════════════
const COLS=72, ROWS=72, TILE_SIZE=0.55
const W1_AMP=0.28,W1_FREQ=0.45,W1_SPEED=0.80
const W2_AMP=0.16,W2_FREQ=0.72,W2_SPEED=1.10,W2_DX=0.707,W2_DZ=0.707
const W3_AMP=0.09,W3_FREQ=1.50,W3_SPEED=1.60,W3_DX=-0.447,W3_DZ=0.894
const halfW=COLS*TILE_SIZE/2, halfD=ROWS*TILE_SIZE/2

function waveHeight(x,z,t){
  return W1_AMP*Math.sin(W1_FREQ*x-W1_SPEED*t)+
    W2_AMP*Math.sin(W2_FREQ*(x*W2_DX+z*W2_DZ)-W2_SPEED*t+1.5)+
    W3_AMP*Math.sin(W3_FREQ*(x*W3_DX+z*W3_DZ)-W3_SPEED*t+2.8)
}

// ═══ Sky palette helpers ═══════════════════════════════════════════
const SKY_PAL=[0x050a1a,0xf4a460,0x87ceeb,0xff6030]
const FOG_PAL=[0x050a1a,0xc08040,0x87ceeb,0xdd5522]
const SUN_PAL=[0x223366,0xff9944,0xfff4e0,0xff7722]
const AMB_PAL=[0x050a1a,0x554422,0xfff4e0,0x553311]
const SUN_ANG=[0,Math.PI/2,Math.PI,3*Math.PI/2]
const _cA=new THREE.Color(),_cB=new THREE.Color()
function lerpPal(pal,angle){
  const c=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2)
  let ia=0; for(let i=0;i<SUN_ANG.length;i++) if(SUN_ANG[i]<=c) ia=i
  const ib=(ia+1)%SUN_ANG.length,aA=SUN_ANG[ia],aB=ib===0?Math.PI*2:SUN_ANG[ib]
  const t=THREE.MathUtils.smoothstep((c-aA)/(aB-aA),0,1)
  _cA.setHex(pal[ia]);_cB.setHex(pal[ib])
  return new THREE.Color().lerpColors(_cA,_cB,t)
}

// ═══ Shared state ══════════════════════════════════════════════════
let posAttr,posArray,oceanGeo,oceanMat
let boatGroup,heading=0,vel=new THREE.Vector3()
let camPos=new THREE.Vector3(0,CAM_HEIGHT,CAM_DIST)
let camOrbitYaw=0,mouseX=0,mouseDown=false
let boatPitch=0,boatRoll=0,time=0
let sunLight,ambLight,moonSprite,starMat
const cloudSprites=[],cloudVels=[]
const buoyMeshes=[]

const wakeXZ=new Float32Array(WAKE_LENGTH*2)
let wakeHead=0,wakeTimer=0,wakeGeo,wakePosAttr,wakePosArr

let keyDownFn=null,keyUpFn=null,mouseDnFn=null,mouseMvFn=null,mouseUpFn=null
const KEYS=new Set()
const _camTarget=new THREE.Vector3(),_lookTarget=new THREE.Vector3()
const _pos=new THREE.Vector3(),_euler=new THREE.Euler(),_quat=new THREE.Quaternion()
const _scale=new THREE.Vector3(1,1,1),_matrix=new THREE.Matrix4()

// ── Cloud texture ──
function makeCloudTex(){
  const cv=document.createElement('canvas'); cv.width=cv.height=128
  const ctx=cv.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,58)
  g.addColorStop(0,'rgba(255,255,255,0.9)'); g.addColorStop(0.5,'rgba(255,255,255,0.55)'); g.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(64,64,58,0,Math.PI*2); ctx.fill()
  return new THREE.CanvasTexture(cv)
}
function makeMoonTex(){
  const cv=document.createElement('canvas'); cv.width=cv.height=128
  const ctx=cv.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,56)
  g.addColorStop(0,'rgba(220,220,255,0.95)'); g.addColorStop(0.5,'rgba(200,200,240,0.5)'); g.addColorStop(1,'rgba(0,0,0,0)')
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(64,64,56,0,Math.PI*2); ctx.fill()
  return new THREE.CanvasTexture(cv)
}

// ── Build ocean mesh ──
function buildOcean(){
  const vCount=(COLS+1)*(ROWS+1); posArray=new Float32Array(vCount*3); let vi=0
  for(let r=0;r<=ROWS;r++) for(let c=0;c<=COLS;c++){
    posArray[vi++]=c*TILE_SIZE-halfW; posArray[vi++]=0; posArray[vi++]=r*TILE_SIZE-halfD
  }
  const idx=new Uint32Array(COLS*ROWS*6); let ii=0
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const a=r*(COLS+1)+c,b=a+1,c2=a+(COLS+1),d=c2+1
    idx[ii++]=a;idx[ii++]=c2;idx[ii++]=b;idx[ii++]=b;idx[ii++]=c2;idx[ii++]=d
  }
  oceanGeo=new THREE.BufferGeometry(); posAttr=new THREE.BufferAttribute(posArray,3)
  oceanGeo.setAttribute('position',posAttr); oceanGeo.setIndex(new THREE.BufferAttribute(idx,1))
  oceanGeo.computeVertexNormals(); return oceanGeo
}

function init(){
  // Event listeners
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

  // Lighting
  ambLight=new THREE.AmbientLight(0xffffff,0.15); scene.add(ambLight)
  sunLight=new THREE.DirectionalLight(0xffffff,1.2); scene.add(sunLight)

  // Ocean
  oceanMat=new THREE.MeshStandardMaterial({color:0x006994,roughness:0.12,metalness:0.28,side:THREE.DoubleSide})
  scene.add(new THREE.Mesh(buildOcean(),oceanMat))

  // Wake line
  wakePosArr=new Float32Array(WAKE_LENGTH*3); wakePosAttr=new THREE.BufferAttribute(wakePosArr,3)
  wakeGeo=new THREE.BufferGeometry(); wakeGeo.setAttribute('position',wakePosAttr); wakeGeo.setDrawRange(0,0)
  scene.add(new THREE.Line(wakeGeo,new THREE.LineBasicMaterial({color:0xffffff,opacity:0.5,transparent:true})))

  // Boat
  boatGroup=new THREE.Group()
  boatGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,0.38,2.4),new THREE.MeshStandardMaterial({color:0xddddcc,roughness:0.6})))
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.42,0.9),new THREE.MeshStandardMaterial({color:0xeeeedd,roughness:0.6}))
  cabin.position.set(0,0.40,-0.1); boatGroup.add(cabin)
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,1.8,6),new THREE.MeshStandardMaterial({color:0x887766}))
  mast.position.set(0,1.1,0.2); boatGroup.add(mast)
  boatGroup.position.set(0,HULL_OFFSET,0); scene.add(boatGroup)

  // Buoys (instanced)
  const buoyInstMesh=new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.3,8,6),
    new THREE.MeshStandardMaterial({color:0xff6600,roughness:0.5}),
    BUOY_COUNT
  )
  scene.add(buoyInstMesh)
  const buoyXZ=[]
  for(let i=0;i<BUOY_COUNT;i++) buoyXZ.push([(Math.random()-0.5)*32,(Math.random()-0.5)*32])
  buoyMeshes.push(buoyInstMesh,buoyXZ)   // store for update

  // Clouds
  const cloudMat=new THREE.SpriteMaterial({map:makeCloudTex(),transparent:true,depthWrite:false})
  for(let i=0;i<CLOUD_COUNT;i++){
    const sp=new THREE.Sprite(cloudMat.clone())
    const sc=3.5+Math.random()*3.5
    sp.scale.set(sc,sc*0.42,1)
    sp.position.set((Math.random()-0.5)*44,CLOUD_HEIGHT_MIN+Math.random()*(CLOUD_HEIGHT_MAX-CLOUD_HEIGHT_MIN),(Math.random()-0.5)*44)
    scene.add(sp); cloudSprites.push(sp)
    cloudVels.push({vx:(Math.random()-0.5)*1.2,vz:(Math.random()-0.5)*0.4})
  }

  // Moon
  moonSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:makeMoonTex(),transparent:true,depthWrite:false,opacity:0}))
  moonSprite.scale.set(3.0,3.0,1); scene.add(moonSprite)

  // Stars
  const sArr=new Float32Array(500*3)
  for(let i=0;i<500;i++){
    const theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1)
    sArr[i*3]=38*Math.sin(phi)*Math.cos(theta)
    sArr[i*3+1]=38*Math.abs(Math.sin(phi))
    sArr[i*3+2]=38*Math.sin(phi)*Math.sin(theta)
  }
  const sGeo=new THREE.BufferGeometry(); sGeo.setAttribute('position',new THREE.BufferAttribute(sArr,3))
  starMat=new THREE.PointsMaterial({color:0xffffff,size:0.18,sizeAttenuation:true,transparent:true,opacity:0})
  scene.add(new THREE.Points(sGeo,starMat))

  camPos.set(0,CAM_HEIGHT,CAM_DIST)
  renderer.render(scene,camera)
}

const _skyCol=new THREE.Color()

function update(dt){
  time+=dt

  // ── Sky / lighting ──────────────────────────────────────────────
  const sunAngle=(time/DAY_DURATION)*Math.PI*2
  const elevation=Math.sin(sunAngle)
  const sx=Math.cos(sunAngle)*SUN_DIST, sy=Math.sin(sunAngle)*SUN_DIST
  sunLight.position.set(sx,sy,SUN_DIST*0.3)
  sunLight.color.copy(lerpPal(SUN_PAL,sunAngle))
  sunLight.intensity=Math.max(0.04,elevation*1.4)
  ambLight.color.copy(lerpPal(AMB_PAL,sunAngle))
  ambLight.intensity=Math.max(0.04,elevation*0.35+0.12)
  _skyCol.copy(lerpPal(SKY_PAL,sunAngle))
  scene.background=_skyCol.clone()
  scene.fog=new THREE.Fog(lerpPal(FOG_PAL,sunAngle),18,44)

  // Ocean tints slightly in sunset
  const warmth=Math.max(0,Math.cos(sunAngle+Math.PI/2)*0.3)
  oceanMat.color.setHex(0x006994)

  // ── Night elements ───────────────────────────────────────────────
  const nightFactor=Math.max(0,-elevation)
  const moonAngle=sunAngle+Math.PI
  moonSprite.position.set(Math.cos(moonAngle)*SUN_DIST*0.75,Math.sin(moonAngle)*SUN_DIST*0.75,SUN_DIST*0.2)
  moonSprite.material.opacity=nightFactor*0.88
  starMat.opacity=nightFactor*0.8

  // ── Clouds ───────────────────────────────────────────────────────
  const brightness=Math.max(0.2,elevation*0.5+0.65)
  for(let i=0;i<CLOUD_COUNT;i++){
    const sp=cloudSprites[i],v=cloudVels[i]
    sp.position.x+=v.vx*dt; sp.position.z+=v.vz*dt
    if(sp.position.x>24) sp.position.x-=48
    if(sp.position.x<-24) sp.position.x+=48
    if(sp.position.z>24) sp.position.z-=48
    if(sp.position.z<-24) sp.position.z+=48
    sp.material.opacity=brightness*0.78
  }

  // ── Boat input ───────────────────────────────────────────────────
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

  // ── Buoyancy ─────────────────────────────────────────────────────
  const bx=boatGroup.position.x,bz=boatGroup.position.z
  boatGroup.position.y=waveHeight(bx,bz,time)+HULL_OFFSET
  const slopeX=(waveHeight(bx+SLOPE_EPS,bz,time)-waveHeight(bx-SLOPE_EPS,bz,time))/(2*SLOPE_EPS)
  const slopeZ=(waveHeight(bx,bz+SLOPE_EPS,time)-waveHeight(bx,bz-SLOPE_EPS,time))/(2*SLOPE_EPS)
  boatPitch+=((-slopeZ*PITCH_SCALE)-boatPitch)*BUOY_STIFF*dt
  boatRoll +=((slopeX*PITCH_SCALE)-boatRoll)*BUOY_STIFF*dt
  boatGroup.rotation.set(boatPitch,heading,boatRoll,'YXZ')

  // ── Wake trail ───────────────────────────────────────────────────
  wakeTimer+=dt
  if(wakeTimer>=WAKE_INTERVAL){
    wakeTimer=0; wakeXZ[wakeHead*2]=bx; wakeXZ[wakeHead*2+1]=bz; wakeHead=(wakeHead+1)%WAKE_LENGTH
  }
  let drawCount=0
  for(let i=0;i<WAKE_LENGTH;i++){
    const idx=(wakeHead-1-i+WAKE_LENGTH)%WAKE_LENGTH
    const wx=wakeXZ[idx*2],wz=wakeXZ[idx*2+1]
    if(wx===0&&wz===0) break
    wakePosArr[i*3]=wx; wakePosArr[i*3+1]=waveHeight(wx,wz,time)+0.06; wakePosArr[i*3+2]=wz; drawCount++
  }
  wakePosAttr.needsUpdate=true; wakeGeo.setDrawRange(0,drawCount)

  // ── Floating buoys (instanced) ───────────────────────────────────
  const [buoyInst,buoyXZ]=buoyMeshes
  for(let i=0;i<BUOY_COUNT;i++){
    const [fx,fz]=buoyXZ[i]
    const fy=waveHeight(fx,fz,time)+0.3
    const sx2=(waveHeight(fx+SLOPE_EPS,fz,time)-waveHeight(fx-SLOPE_EPS,fz,time))/(2*SLOPE_EPS)
    const sz2=(waveHeight(fx,fz+SLOPE_EPS,time)-waveHeight(fx,fz-SLOPE_EPS,time))/(2*SLOPE_EPS)
    _pos.set(fx,fy,fz); _euler.set(-sz2*0.55,0,sx2*0.55); _quat.setFromEuler(_euler)
    _matrix.compose(_pos,_quat,_scale); buoyInst.setMatrixAt(i,_matrix)
  }
  buoyInst.instanceMatrix.needsUpdate=true

  // ── Ocean mesh ────────────────────────────────────────────────────
  const vCount=(COLS+1)*(ROWS+1)
  for(let i=0;i<vCount;i++) posArray[i*3+1]=waveHeight(posArray[i*3],posArray[i*3+2],time)
  posAttr.needsUpdate=true; oceanGeo.computeVertexNormals()

  // ── Camera spring follow ──────────────────────────────────────────
  const camAngle=heading+Math.PI+camOrbitYaw
  _camTarget.set(boatGroup.position.x+Math.sin(camAngle)*CAM_DIST,boatGroup.position.y+CAM_HEIGHT,boatGroup.position.z-Math.cos(camAngle)*CAM_DIST)
  camPos.x+=(_camTarget.x-camPos.x)*CAM_STIFF*dt
  camPos.y+=(_camTarget.y-camPos.y)*CAM_STIFF*dt
  camPos.z+=(_camTarget.z-camPos.z)*CAM_STIFF*dt
  camera.position.copy(camPos)
  _lookTarget.copy(boatGroup.position); _lookTarget.y+=0.8; camera.lookAt(_lookTarget)

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
      'The **day-night cycle** uses one angle: `θ(t) = (t / T) × 2π` where T is the day duration. The sun elevation (how high above the horizon) is `sin(θ)`. Elevation is +1 at noon, −1 at midnight, 0 at sunrise/sunset. It controls light intensity directly: `intensity = max(ε, elevation × 1.4)`. Everything else — color palette selection, star/moon opacity, fog density — is also a function of elevation or the angle itself.',

      'Color palette interpolation uses linear interpolation (lerp) between two adjacent keyframe colors. For N keyframes at known angles, find the pair surrounding the current angle, compute a local `t ∈ [0,1]`, and apply `THREE.MathUtils.smoothstep(t)` to ease in/out. `smoothstep(t) = 3t² − 2t³` maps `[0,1] → [0,1]` with zero first derivatives at both ends — this removes the visible "kink" you get from raw linear blending.',

      'The **uniform sphere sampling** formula for star positions (`phi = acos(2·random − 1)`) ensures equal density across the sphere surface. Naive `phi = π × random` concentrates stars near the poles. The correct formula inverts the cumulative distribution function of the cosine: `P(phi) = sin(phi)/2` → CDF `= (1 − cos(phi))/2` → inverse `= acos(1 − 2u)` where u is uniform on [0,1]. `acos(2·random − 1)` is equivalent since both 1−2u and 2u−1 are uniform on [−1,1].',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Smoothstep',
        body: '$$S(t) = 3t^2 - 2t^3, \\quad t \\in [0,1]$$\n\nMaps $[0,1] \\to [0,1]$ with $S(0)=0$, $S(1)=1$, $S\'(0)=S\'(1)=0$. The zero derivatives at both ends eliminate the "velocity kink" visible in linear color transitions.',
      },
      {
        type: 'theorem',
        title: 'Uniform Sphere Sampling',
        body: '$$\\phi = \\arccos(2u - 1), \\quad \\theta = 2\\pi v$$\n\nwhere $u, v \\sim U[0,1]$. Position: $(r\\sin\\phi\\cos\\theta,\\; r\\sin\\phi\\sin\\theta,\\; r\\cos\\phi)$. For upper hemisphere only: take $|\\sin\\phi|$ as the Y coordinate.',
      },
    ],
    visualizations: [],
  },

  practice: {
    prose: [
      'The capstone challenge adds a storm system triggered by a key press. The student must wire key input to sea state, change lighting to dramatic storm colors, and increase wave amplitudes — all while the boat continues to function correctly.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Challenge: Storm System',
        mathBridge: 'Press "E" to toggle a storm. In storm mode: raise wave scale to 2.5, tint the sky to dark grey, increase fog density, lower sun intensity sharply, and make the clouds darker. Transition smoothly using lerp on all parameters.',
        caption: 'Challenge difficulty: medium-hard. Requires modifying the wave system, sky palette, and fog simultaneously.',
        initialProps: {
          initialCells: [
            {
              id: 'c3',
              challengeType: 'extend',
              challengeNumber: 3,
              challengeTitle: 'Storm system — press E to summon a storm',
              difficulty: 'hard',
              mode: '3d',
              prose: [
                'Start from the full capstone scene (cell 13). Add a storm system triggered by pressing "E". When storm is active: lerp wave scale from 1.0 → 2.5 (pass as multiplier to waveHeight), lerp sky background from normal to dark grey (0x334455), lerp fog density to 0.06, lerp sunLight intensity down to 0.1. Transition speed: 0.8 per second via lerp. Toggle back to calm when "E" is pressed again.',
              ],
              prompt: 'Add `stormActive` boolean and `stormLevel` (0=calm, 1=storm) scalar. In update(), detect "KeyE" toggle (once per press — use a flag). Lerp stormLevel toward 0 or 1. Apply stormLevel to wave amplitude multiplier, sky color, fog density, light intensity.',
              hint: 'For the toggle: `if (KEYS.has(\'KeyE\') && !wasE) { stormActive = !stormActive; wasE = true } if (!KEYS.has(\'KeyE\')) wasE = false`. This fires once per keypress. Then `stormLevel += ((stormActive ? 1 : 0) - stormLevel) * 0.8 * dt`.',
              code: `// ── Starter: capstone + storm toggle ─────────────────────────
// Paste the full cell-13 code here and add the storm system

// In the constants section, add:
// const STORM_WAVE_SCALE = 2.5   // wave amplitude multiplier in a storm
// const STORM_SKY = 0x334455
// const STORM_FOG_NEAR = 8, STORM_FOG_FAR = 20

// In the state section, add:
// let stormLevel = 0, stormActive = false, wasE = false

// In update(), after the key input block, add the toggle:
// if (KEYS.has('KeyE') && !wasE) { stormActive = !stormActive; wasE = true }
// if (!KEYS.has('KeyE')) wasE = false
// stormLevel += ((stormActive ? 1 : 0) - stormLevel) * 0.8 * dt

// Then pass (1 + stormLevel * (STORM_WAVE_SCALE - 1)) as a scale multiplier
// to waveHeight() calls, and lerp sky/fog/light values based on stormLevel.

// TODO: paste cell-13 code and extend it here
`,
            },
          ],
        },
      },
    ],
  },
}
