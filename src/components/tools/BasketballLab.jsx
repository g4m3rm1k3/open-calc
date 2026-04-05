// BasketballLab — first-person 3D basketball sim, raw Three.js
// You ARE the shooter. Click to lock pointer, aim with mouse, click to shoot.
import { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY      = -22          // m/s² (pumped up for better game feel)
const BALL_RADIUS  = 0.12         // metres
const RIM_HEIGHT   = 3.05         // 10ft
const RIM_RADIUS   = 0.228        // inner radius (~18in / 2)
const RIM_TUBE     = 0.025        // rim pipe thickness
const BACKBOARD_W  = 1.83         // 6ft
const BACKBOARD_H  = 1.07         // 3.5ft
const BACKBOARD_Z  = +(RIM_RADIUS + 0.12)  // behind rim, away from player
const BB_Y_BOT     = RIM_HEIGHT - 0.28
const COURT_W      = 15
const COURT_L      = 28
const PLAYER_EYE   = 2.0          // camera eye height

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function simArc(ox, oy, oz, vx, vy, vz, steps, stepDt) {
  const pts = []
  let px = ox, py = oy, pz = oz
  let pvx = vx, pvy = vy, pvz = vz
  for (let i = 0; i < steps; i++) {
    pts.push(new THREE.Vector3(px, py, pz))
    pvx *= 0.9992; pvz *= 0.9992
    pvy += GRAVITY * stepDt
    px += pvx * stepDt; py += pvy * stepDt; pz += pvz * stepDt
    if (py < -0.5) break
  }
  return pts
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BasketballLab({ onClose }) {
  const mountRef       = useRef(null)
  const rendererRef    = useRef(null)
  const sceneRef       = useRef(null)
  const cameraRef      = useRef(null)
  const ballMeshRef    = useRef(null)
  const arcLineRef     = useRef(null)
  const basketGroupRef = useRef(null)
  const rafRef         = useRef(null)
  const clockRef       = useRef(new THREE.Clock(false))
  const hudRef         = useRef(null)

  // Mutable game-state — inside ref to avoid causing re-renders per frame
  const gs = useRef({
    phase:    'aim',   // 'aim' | 'flight' | 'done'
    ballPos:  new THREE.Vector3(),
    ballVel:  new THREE.Vector3(),
    yaw:      Math.PI, // camera horizontal angle (π = facing +Z toward basket)
    pitch:    0.40,    // camera vertical angle (radians up from horizon)
    power:    0.58,    // 0-1
    rimHits:  0,
    backboardHit: false,
    makes:    0,
    attempts: 0,
    locked:   false,
    doneTimer: 0,
    doneMsg:  '',
  })

  // React state (for UI only)
  const [makes,    setMakes]    = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [power,    setPower]    = useState(0.58)
  const [locked,   setLocked]   = useState(false)
  const [feedback, setFeedback] = useState('')

  // ── Shoot ─────────────────────────────────────────────────────────────────
  const shoot = useCallback(() => {
    const g   = gs.current
    const cam = cameraRef.current
    if (g.phase !== 'aim' || !cam) return
    const speed = g.power * 10 + 7     // 7–17 m/s

    // Direction from camera looking (quaternion avoids Euler sign-flip at yaw=π)
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(
      new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 1, 0), g.yaw)
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), g.pitch))
    )

    g.ballPos.set(
      cam.position.x + dir.x * 0.35,
      cam.position.y - 0.12,
      cam.position.z + dir.z * 0.35,
    )
    g.ballVel.set(dir.x * speed, dir.y * speed + 1.2, dir.z * speed)

    g.rimHits = 0
    g.backboardHit = false
    g.phase = 'flight'
    g.attempts++
    setAttempts(g.attempts)
    setFeedback('')

    const ball = ballMeshRef.current
    if (ball) { ball.position.copy(g.ballPos); ball.visible = true }
  }, [])

  // ── Three.js setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth || 800
    const H = mount.clientHeight || 540

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x060a14)
    scene.fog = new THREE.FogExp2(0x060a14, 0.038)
    sceneRef.current = scene

    // ── Camera ──────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(68, W / H, 0.01, 80)
    camera.position.set(0, PLAYER_EYE, COURT_L / 2 - 1.2 - 7.7) // just behind 3pt arc, facing basket
    camera.rotation.order = 'YXZ'
    cameraRef.current = camera

    // Quaternion helpers for gimbal-free FPS camera
    const _qCamY = new THREE.Quaternion()
    const _qCamX = new THREE.Quaternion()
    const _vUp    = new THREE.Vector3(0, 1, 0)
    const _vRight = new THREE.Vector3(1, 0, 0)

    // ── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))

    // 4 arena spotlights
    const spotCfg = [[-5, 11, -4], [5, 11, -4], [-5, 11, 4], [5, 11, 4]]
    spotCfg.forEach(([x, y, z]) => {
      const s = new THREE.SpotLight(0xfff5e0, 3.2, 28, 0.6, 0.35, 1.6)
      s.position.set(x, y, z); s.castShadow = true
      s.shadow.mapSize.set(512, 512)
      scene.add(s); scene.add(s.target)
    })
    // basket warm glow
    const bg = new THREE.PointLight(0xff6600, 2, 7)
    bg.position.set(0, RIM_HEIGHT + 1.2, COURT_L / 2 - 1)
    scene.add(bg)

    // ── Court floor ─────────────────────────────────────────────────────────
    {
      const geo = new THREE.BoxGeometry(COURT_W, 0.06, COURT_L)
      const mat = new THREE.MeshStandardMaterial({ color: 0xc4843a, roughness: 0.75, metalness: 0 })
      const m = new THREE.Mesh(geo, mat); m.position.y = -0.03; m.receiveShadow = true
      scene.add(m)
    }
    // Court markings (white lines as thin planes)
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    function addLine(w, d, x, z) {
      const geo = new THREE.BoxGeometry(w, 0.001, d)
      const m = new THREE.Mesh(geo, lineMat); m.position.set(x, 0.001, z)
      scene.add(m)
    }
    addLine(4.9, 0.05, 0, COURT_L / 2 - 5.8)   // FT line
    addLine(0.05, 5.8, -2.45, COURT_L / 2 - 2.9)  // left key
    addLine(0.05, 5.8,  2.45, COURT_L / 2 - 2.9)  // right key
    addLine(COURT_W, 0.05, 0, 0)                   // half-court line
    // 3-point arc
    {
      const pts = []
      const R = 7.24, bz = COURT_L / 2 - 1.2
      for (let a = -Math.PI * 0.62; a <= Math.PI * 0.62; a += 0.04)
        pts.push(new THREE.Vector3(Math.sin(a) * R, 0.002, bz - Math.cos(a) * R))
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffffff })
      ))
    }

    // ── Walls / arena backdrop ───────────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 1 })
    const wallDefs = [
      [COURT_W + 2, 13, 0, 6.5,  COURT_L / 2 + 1, 0],
      [COURT_W + 2, 13, 0, 6.5, -COURT_L / 2 - 1, Math.PI],
      [COURT_L + 2, 13, COURT_W / 2 + 1, 6.5, 0, -Math.PI / 2],
      [COURT_L + 2, 13, -COURT_W / 2 - 1, 6.5, 0, Math.PI / 2],
    ]
    wallDefs.forEach(([w, h, x, y, z, ry]) => {
      const geo = new THREE.PlaneGeometry(w, h)
      const m = new THREE.Mesh(geo, wallMat)
      m.position.set(x, y, z); m.rotation.y = ry
      scene.add(m)
    })
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1a, roughness: 1 })
    { const geo = new THREE.PlaneGeometry(COURT_W + 2, COURT_L + 2)
      const m = new THREE.Mesh(geo, ceilMat); m.rotation.x = Math.PI / 2; m.position.y = 13
      scene.add(m) }

    // Arena scoreboard glow at far wall
    { const geo = new THREE.PlaneGeometry(3, 1.5)
      const mat = new THREE.MeshBasicMaterial({ color: 0x002244 })
      const m = new THREE.Mesh(geo, mat); m.position.set(0, 9, COURT_L / 2 + 0.9); m.rotation.y = Math.PI
      scene.add(m) }

    // ── Basket group (far end, positive Z) ──────────────────────────────────
    const basketGrp = new THREE.Group()
    basketGrp.position.set(0, 0, COURT_L / 2 - 1.2)
    basketGroupRef.current = basketGrp
    scene.add(basketGrp)

    // Pole
    { const geo = new THREE.CylinderGeometry(0.07, 0.07, RIM_HEIGHT + 0.3, 12)
      const mat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.3 })
      const m = new THREE.Mesh(geo, mat); m.position.set(0, (RIM_HEIGHT + 0.3) / 2, BACKBOARD_Z + 0.12)
      m.castShadow = true; basketGrp.add(m) }

    // Support arm
    { const geo = new THREE.BoxGeometry(0.06, 0.06, 0.85)
      const mat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.3 })
      const m = new THREE.Mesh(geo, mat); m.position.set(0, RIM_HEIGHT + 0.38, BACKBOARD_Z + 0.1)
      basketGrp.add(m) }

    // Backboard glass
    { const geo = new THREE.BoxGeometry(BACKBOARD_W, BACKBOARD_H, 0.04)
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff, transmission: 0.9, roughness: 0.06,
        transparent: true, opacity: 0.5, side: THREE.DoubleSide
      })
      const m = new THREE.Mesh(geo, mat)
      m.position.set(0, BB_Y_BOT + BACKBOARD_H / 2, BACKBOARD_Z)
      basketGrp.add(m)

      // Aim square border
      const bMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      const rw = 0.59, rh = 0.45, ry = BB_Y_BOT + 0.32
      const rz = BACKBOARD_Z - 0.025
      ;[[rw, 0.02, 0, ry + rh / 2 + 0.01, rz],
        [rw, 0.02, 0, ry - rh / 2 - 0.01, rz],
        [0.02, rh + 0.04, -rw / 2 - 0.01, ry, rz],
        [0.02, rh + 0.04,  rw / 2 + 0.01, ry, rz]
      ].forEach(([bw, bh, bx, by, bZ]) => {
        const bg = new THREE.BoxGeometry(bw, 0.02, bh)
        const bm = new THREE.Mesh(bg, bMat); bm.position.set(bx, by, bZ)
        basketGrp.add(bm)
      })
    }

    // Rim (torus)
    { const geo = new THREE.TorusGeometry(RIM_RADIUS, RIM_TUBE, 10, 48)
      const mat = new THREE.MeshStandardMaterial({ color: 0xe04800, roughness: 0.35, metalness: 0.25 })
      const m = new THREE.Mesh(geo, mat); m.rotation.x = Math.PI / 2
      m.position.set(0, RIM_HEIGHT, 0); m.castShadow = true
      basketGrp.add(m) }

    // Net (line segments)
    {
      const segs = 14, rings = 8
      const topR = RIM_RADIUS - RIM_TUBE * 0.6, botR = topR * 0.30, netH = 0.48
      const lMat = new THREE.LineBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.65 })
      const pts = []
      // verticals
      for (let s = 0; s < segs; s++) {
        const th = (s / segs) * Math.PI * 2
        for (let r = 0; r < rings; r++) {
          const t0 = r / rings, t1 = (r + 1) / rings
          const r0 = THREE.MathUtils.lerp(topR, botR, t0)
          const r1 = THREE.MathUtils.lerp(topR, botR, t1)
          pts.push(
            new THREE.Vector3(Math.cos(th) * r0, RIM_HEIGHT - t0 * netH, Math.sin(th) * r0),
            new THREE.Vector3(Math.cos(th) * r1, RIM_HEIGHT - t1 * netH, Math.sin(th) * r1),
          )
        }
      }
      // horizontal rings
      for (let r = 0; r <= rings; r++) {
        const t = r / rings
        const rx = THREE.MathUtils.lerp(topR, botR, t)
        const y = RIM_HEIGHT - t * netH
        for (let s = 0; s < segs; s++) {
          const th0 = (s / segs) * Math.PI * 2
          const th1 = ((s + 1) / segs) * Math.PI * 2
          pts.push(
            new THREE.Vector3(Math.cos(th0) * rx, y, Math.sin(th0) * rx),
            new THREE.Vector3(Math.cos(th1) * rx, y, Math.sin(th1) * rx),
          )
        }
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      basketGrp.add(new THREE.LineSegments(geo, lMat))
    }

    // ── Ball ────────────────────────────────────────────────────────────────
    {
      const geo = new THREE.SphereGeometry(BALL_RADIUS, 28, 20)
      const mat = new THREE.MeshStandardMaterial({ color: 0xd06010, roughness: 0.6, metalness: 0.05 })
      const m = new THREE.Mesh(geo, mat); m.visible = false; m.castShadow = true
      ballMeshRef.current = m; scene.add(m)

      // Seam lines on ball
      const seamMat = new THREE.LineBasicMaterial({ color: 0x1a0800 })
      const R = BALL_RADIUS + 0.0015
      const pts30 = Array.from({ length: 65 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2
        return new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R * 0.28, Math.sin(a) * R * 0.96)
      })
      const pts31 = Array.from({ length: 65 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2
        return new THREE.Vector3(Math.cos(a) * R * 0.28, Math.sin(a) * R, Math.cos(a) * R * 0.96)
      })
      m.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts30), seamMat))
      m.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts31), seamMat))
    }

    // ── Arc preview line ─────────────────────────────────────────────────────
    {
      const pts = Array.from({ length: 80 }, () => new THREE.Vector3())
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.55 })
      const line = new THREE.Line(geo, mat); line.visible = false; line.frustumCulled = false
      arcLineRef.current = line; scene.add(line)
    }

    // ── Basket world position (relative to group) ────────────────────────────
    // absolute basket centre = basketGrp.position + (0, RIM_HEIGHT, 0)
    const BASKET_WORLD = new THREE.Vector3(0, RIM_HEIGHT, COURT_L / 2 - 1.2)

    // ── Pointer lock ──────────────────────────────────────────────────────────
    const dom = renderer.domElement

    function onLockChange() {
      const lk = document.pointerLockElement === dom
      gs.current.locked = lk; setLocked(lk)
    }
    document.addEventListener('pointerlockchange', onLockChange)

    function onDomClick() {
      if (!gs.current.locked) dom.requestPointerLock()
      else                    shoot()
    }
    dom.addEventListener('click', onDomClick)

    // ── Mouse move ────────────────────────────────────────────────────────────
    const SENS = 0.0022
    function onMouseMove(e) {
      const g = gs.current; if (!g.locked) return
      g.yaw   -= e.movementX * SENS
      g.pitch  = clamp(g.pitch - e.movementY * SENS * 0.65, -0.2, 1.35)
    }
    document.addEventListener('mousemove', onMouseMove)

    // ── Scroll: power ─────────────────────────────────────────────────────────
    function onWheel(e) {
      const g = gs.current
      g.power = clamp(g.power - e.deltaY * 0.0006, 0.05, 1)
      setPower(g.power)
    }
    dom.addEventListener('wheel', onWheel, { passive: true })

    // ── Keyboard: WASD move, R = reset, Q/E = power ───────────────────────────
    const keysDown = new Set()
    function onKeyDown(e) {
      keysDown.add(e.key)
      const g = gs.current
      if (e.key === 'r' || e.key === 'R') {
        g.phase = 'aim'; ballMeshRef.current.visible = false; setFeedback('')
      }
      if (e.key === 'e' || e.key === 'E') { g.power = clamp(g.power + 0.05, 0, 1); setPower(g.power) }
      if (e.key === 'q' || e.key === 'Q') { g.power = clamp(g.power - 0.05, 0, 1); setPower(g.power) }
      if (e.key === 'Escape') document.exitPointerLock()
    }
    function onKeyUp(e) { keysDown.delete(e.key) }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    // ── Resize ────────────────────────────────────────────────────────────────
    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ────────────────────────────────────────────────────────
    const clock = clockRef.current; clock.start()

    function loop() {
      rafRef.current = requestAnimationFrame(loop)
      const dt = clamp(clock.getDelta(), 0, 0.05)
      const g  = gs.current

      // Apply yaw/pitch via quaternion — avoids Euler sign-flip when yaw=π
      _qCamY.setFromAxisAngle(_vUp, g.yaw)
      _qCamX.setFromAxisAngle(_vRight, g.pitch)
      camera.quaternion.copy(_qCamY).multiply(_qCamX)

      // ── WASD movement ────────────────────────────────────────────────────
      if (g.locked && g.phase === 'aim') {
        const spd = 5 * dt
        const fwx = -Math.sin(g.yaw), fwz = -Math.cos(g.yaw)
        const rgx =  Math.cos(g.yaw), rgz = -Math.sin(g.yaw)
        if (keysDown.has('w') || keysDown.has('W')) { camera.position.x += fwx * spd; camera.position.z += fwz * spd }
        if (keysDown.has('s') || keysDown.has('S')) { camera.position.x -= fwx * spd; camera.position.z -= fwz * spd }
        if (keysDown.has('a') || keysDown.has('A')) { camera.position.x -= rgx * spd; camera.position.z -= rgz * spd }
        if (keysDown.has('d') || keysDown.has('D')) { camera.position.x += rgx * spd; camera.position.z += rgz * spd }
        camera.position.x = clamp(camera.position.x, -COURT_W / 2 + 0.5, COURT_W / 2 - 0.5)
        camera.position.z = clamp(camera.position.z, -COURT_L / 2 + 0.5, COURT_L / 2 - 0.5)
      }

      // ── Arc preview ──────────────────────────────────────────────────────
      const arcLine = arcLineRef.current
      if (arcLine) {
        if (g.phase === 'aim' && g.locked) {
          arcLine.visible = true
          const speed = g.power * 10 + 7
          const dir = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(new THREE.Quaternion().copy(_qCamY).multiply(_qCamX))
          const ox = camera.position.x + dir.x * 0.35
          const oy = camera.position.y - 0.12
          const oz = camera.position.z + dir.z * 0.35
          const arcPts = simArc(ox, oy, oz, dir.x * speed, dir.y * speed + 1.2, dir.z * speed, 80, 0.045)
          arcLine.geometry.setFromPoints(arcPts)
          arcLine.geometry.attributes.position.needsUpdate = true
        } else {
          arcLine.visible = false
        }
      }

      // ── Ball physics ──────────────────────────────────────────────────────
      const ball = ballMeshRef.current
      if (ball && g.phase === 'flight') {
        const STEPS = 4
        for (let s = 0; s < STEPS; s++) {
          const sdt = dt / STEPS
          g.ballVel.y += GRAVITY * sdt
          g.ballVel.x *= (1 - 0.003 * sdt * 60)
          g.ballVel.z *= (1 - 0.003 * sdt * 60)
          g.ballPos.addScaledVector(g.ballVel, sdt)

          // Spin rotation
          const spinAx = new THREE.Vector3(g.ballVel.z, 0, -g.ballVel.x).normalize()
          if (spinAx.lengthSq() > 0.01) {
            ball.rotateOnWorldAxis(spinAx, g.ballVel.length() / BALL_RADIUS * sdt * 0.85)
          }

          const bw = BASKET_WORLD
          const dx = g.ballPos.x - bw.x
          const dz = g.ballPos.z - bw.z
          const distXZ = Math.sqrt(dx * dx + dz * dz)

          // ── Rim collision (8 sample points on rim ring) ─────────────────
          if (Math.abs(g.ballPos.y - RIM_HEIGHT) < BALL_RADIUS + RIM_TUBE + 0.06) {
            for (let i = 0; i < 8; i++) {
              const th = (i / 8) * Math.PI * 2
              const rp = new THREE.Vector3(bw.x + Math.cos(th) * RIM_RADIUS, RIM_HEIGHT, bw.z + Math.sin(th) * RIM_RADIUS)
              const diff = g.ballPos.clone().sub(rp)
              const d = diff.length()
              if (d < BALL_RADIUS + RIM_TUBE + 0.002) {
                diff.normalize()
                g.ballPos.copy(rp).addScaledVector(diff, BALL_RADIUS + RIM_TUBE + 0.003)
                const vn = g.ballVel.dot(diff)
                if (vn < 0) {
                  g.ballVel.addScaledVector(diff, -(1 + 0.6) * vn)
                  g.ballVel.multiplyScalar(0.72)
                  g.rimHits++
                }
              }
            }
          }

          // ── Backboard ────────────────────────────────────────────────────
          const bbWorldZ = bw.z + BACKBOARD_Z
          if (
            g.ballPos.z > bbWorldZ - BALL_RADIUS - 0.01 &&
            g.ballPos.z < bbWorldZ + 0.07 &&
            Math.abs(g.ballPos.x - bw.x) < BACKBOARD_W / 2 + BALL_RADIUS &&
            g.ballPos.y > BB_Y_BOT - BALL_RADIUS &&
            g.ballPos.y < BB_Y_BOT + BACKBOARD_H + BALL_RADIUS
          ) {
            if (g.ballVel.z > 0.1) {
              g.ballPos.z = bbWorldZ - BALL_RADIUS - 0.003
              g.ballVel.z *= -0.82
              g.ballVel.x *= 0.93
              g.ballVel.y *= 0.9
              g.backboardHit = true
            }
          }

          // ── Floor ─────────────────────────────────────────────────────────
          if (g.ballPos.y < BALL_RADIUS) {
            g.ballPos.y = BALL_RADIUS
            if (Math.abs(g.ballVel.y) > 0.4) {
              g.ballVel.y *= -0.45; g.ballVel.x *= 0.8; g.ballVel.z *= 0.8
            } else {
              g.ballVel.set(0, 0, 0)
              g.phase = 'done'
              g.doneMsg = 'Miss'
              setFeedback('Miss')
              setTimeout(() => { gs.current.phase = 'aim'; ball.visible = false; setFeedback('') }, 1800)
            }
          }

          // ── Out of play ────────────────────────────────────────────────────
          if (Math.abs(g.ballPos.x) > 20 || Math.abs(g.ballPos.z) > 20) {
            g.phase = 'done'; g.doneMsg = 'Miss'
            setFeedback('Miss')
            setTimeout(() => { gs.current.phase = 'aim'; ball.visible = false; setFeedback('') }, 1500)
          }

          // ── Score check: ball descends through rim ─────────────────────────
          if (
            g.ballVel.y < 0 &&
            Math.abs(g.ballPos.y - RIM_HEIGHT) < BALL_RADIUS * 1.05 &&
            distXZ < RIM_RADIUS - BALL_RADIUS * 0.75
          ) {
            g.makes++; g.phase = 'done'
            const isSwish = g.rimHits === 0
            const isBankSwish = g.backboardHit && g.rimHits === 0
            const msg = isBankSwish ? 'BANK SHOT! 💥' : isSwish ? 'SWISH! 🏀' : g.rimHits > 1 ? 'Rattle in! 🔥' : 'BUCKET! 💪'
            g.doneMsg = msg
            setMakes(g.makes); setFeedback(msg)
            setTimeout(() => { gs.current.phase = 'aim'; ball.visible = false; setFeedback('') }, 2500)
          }
        }

        ball.position.copy(g.ballPos)
      }

      // ── HUD ───────────────────────────────────────────────────────────────
      const hud = hudRef.current
      if (hud) drawHud(hud, g, mount.clientWidth, mount.clientHeight)

      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      dom.removeEventListener('click', onDomClick)
      dom.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      if (document.pointerLockElement === dom) document.exitPointerLock()
      renderer.dispose()
      if (mount.contains(dom)) mount.removeChild(dom)
    }
  }, [shoot])

  const fgPct = attempts > 0 ? Math.round((makes / attempts) * 100) : 0

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#060a14' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 shrink-0 border-b border-slate-800"
        style={{ background: '#0c1225' }}>
        <span className="text-lg leading-none">🏀</span>
        <span className="text-sm font-semibold text-slate-200">Basketball Lab — First Person</span>
        <div className="flex-1" />

        {/* Score */}
        <div className="flex items-center gap-1.5 font-mono text-sm">
          <span className="text-emerald-400">{makes}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{attempts}</span>
          <span className="text-slate-600 text-xs ml-1">{fgPct}% FG</span>
        </div>

        {/* Power bar */}
        <div className="flex items-center gap-2 ml-3">
          <span className="text-xs text-slate-500 font-mono">Power</span>
          <div className="relative w-24 h-2 rounded overflow-hidden" style={{ background: '#1e293b' }}>
            <div className="absolute inset-y-0 left-0 rounded transition-all duration-75"
              style={{ width: `${power * 100}%`, background: `hsl(${120 - power * 120},75%,52%)` }} />
          </div>
          <span className="text-xs font-mono text-amber-400 w-8 text-right">{Math.round(power * 100)}%</span>
        </div>

        <button onClick={onClose}
          className="ml-3 px-2.5 py-1 text-xs rounded font-mono"
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
          ✕ Close
        </button>
      </div>

      {/* ── 3D viewport ──────────────────────────────────────────────────── */}
      <div ref={mountRef} className="flex-1 relative overflow-hidden" style={{ cursor: locked ? 'none' : 'default' }}>

        {/* HUD canvas (crosshair + power ring) */}
        <canvas ref={hudRef} className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }} />

        {/* Shot feedback */}
        {feedback && (
          <div className="absolute inset-x-0 pointer-events-none flex justify-center"
            style={{ top: '28%' }}>
            <span className="text-4xl font-black" style={{
              color: feedback.includes('SWISH') || feedback.includes('BANK') ? '#4ade80'
                   : feedback.includes('BUCKET') || feedback.includes('Rattle') ? '#fbbf24'
                   : '#f87171',
              textShadow: '0 0 40px currentColor, 0 2px 8px rgba(0,0,0,0.9)',
            }}>{feedback}</span>
          </div>
        )}

        {/* Click-to-play overlay */}
        {!locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}>
            <div className="text-7xl mb-5 select-none">🏀</div>
            <div className="text-2xl font-bold text-white mb-1">Basketball Physics Lab</div>
            <div className="text-slate-400 text-sm mb-8">First-person shooting — you're at the line</div>
            <button
              style={{ background: '#ea5a0a', borderRadius: 12 }}
              className="px-7 py-3 text-white font-bold text-lg hover:opacity-90 transition-opacity"
              onClick={() => rendererRef.current?.domElement.requestPointerLock()}>
              Click to Step on the Court
            </button>
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-1 text-xs font-mono text-slate-500">
              <span>W A S D</span><span className="text-slate-400">Move</span>
              <span>Mouse</span><span className="text-slate-400">Aim</span>
              <span>Scroll / Q, E</span><span className="text-slate-400">Power</span>
              <span>Click</span><span className="text-slate-400">Shoot</span>
              <span>R</span><span className="text-slate-400">Reset ball</span>
              <span>Esc</span><span className="text-slate-400">Unlock mouse</span>
            </div>
          </div>
        )}

        {/* In-game controls hint (dims after first shot) */}
        {locked && attempts === 0 && (
          <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none">
            <div className="flex gap-6 text-xs font-mono text-slate-500 bg-black/40 px-4 py-2 rounded-lg">
              <span>WASD — move</span>
              <span>Scroll/Q,E — power</span>
              <span>Click — shoot</span>
              <span>R — reset</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HUD draw (crosshair + power arc) ─────────────────────────────────────────
function drawHud(canvas, gs, w, h) {
  if (!canvas) return
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  if (!gs.locked) return

  const cx = w / 2, cy = h / 2

  // Outer power ring
  const ringR = 28
  ctx.strokeStyle = `hsl(${120 - gs.power * 120},75%,52%)`
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + gs.power * Math.PI * 2)
  ctx.stroke()

  // Crosshair lines
  ctx.strokeStyle = 'rgba(255,255,255,0.82)'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'square'
  const CL = 11, GAP = 5
  ctx.beginPath()
  ctx.moveTo(cx - CL - GAP, cy); ctx.lineTo(cx - GAP, cy)
  ctx.moveTo(cx + GAP, cy);     ctx.lineTo(cx + CL + GAP, cy)
  ctx.moveTo(cx, cy - CL - GAP); ctx.lineTo(cx, cy - GAP)
  ctx.moveTo(cx, cy + GAP);     ctx.lineTo(cx, cy + CL + GAP)
  ctx.stroke()

  // Centre dot
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill()
}
