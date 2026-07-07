// Space Invaders — Vue 3 multi-file SFC demo
// Demonstrates: data-down/events-up, defineEmits<T>(), canvas game loop,
// TypeScript interfaces, reactive state, and multi-component composition.

export const SPACE_INVADERS = {
  id: 'space-invaders',
  label: 'Space Invaders',
  description: 'Arcade game — components, TypeScript, canvas game loop, events-up pattern.',
  files: {

// ─────────────────────────────────────────────────────────────────────────────
'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
`,

// ─────────────────────────────────────────────────────────────────────────────
'src/App.vue': `<script setup lang="ts">
// App.vue is the single source of truth for all game state.
// Children receive data as props and communicate changes back via events —
// never touching shared state directly. This is "data down, events up."
import { ref } from 'vue'
import GameCanvas from './components/GameCanvas.vue'
import HUD from './components/HUD.vue'

const score    = ref(0)
const hiScore  = ref(0)
const lives    = ref(3)
const wave     = ref(1)
const gameOver = ref(false)
const waveKey  = ref(0)   // incrementing :key force-remounts GameCanvas — cleanest reset

// hasClicked lives here (not in GameCanvas) so the click-to-focus overlay
// persists across wave resets and life losses without resetting each time.
const hasClicked = ref(false)

function onScore(pts: number): void {
  score.value += pts
  if (score.value > hiScore.value) hiScore.value = score.value
}

function onLifeLost(): void {
  lives.value--
  if (lives.value <= 0) {
    gameOver.value = true
  } else {
    waveKey.value++
  }
}

function onWaveClear(): void {
  wave.value++
  waveKey.value++
}

function restart(): void {
  score.value = 0
  lives.value = 3
  wave.value  = 1
  gameOver.value = false
  waveKey.value++
}
</script>

<template>
  <div style="background:#040411;min-height:100vh;display:flex;flex-direction:column;align-items:center;font-family:'Courier New',monospace;color:#00ff88;user-select:none;padding:6px 0 0">

    <HUD :score="score" :hi-score="hiScore" :lives="lives" :wave="wave" />

    <!-- Game area wrapper — position:relative so the overlay can sit on top -->
    <div style="position:relative;display:inline-block;line-height:0">

      <GameCanvas
        v-if="!gameOver"
        :key="waveKey"
        :wave="wave"
        @score="onScore"
        @life-lost="onLifeLost"
        @wave-clear="onWaveClear"
      />

      <!-- Game Over screen occupies the same footprint as the canvas -->
      <div
        v-if="gameOver"
        style="width:520px;height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px"
      >
        <div style="font-size:44px;font-weight:bold;color:#ff3355;letter-spacing:.1em;text-shadow:0 0 28px #ff335566">GAME OVER</div>
        <div style="font-size:26px;color:#ffcc00;letter-spacing:.15em;text-shadow:0 0 14px #ffcc0055">{{ String(score).padStart(5,'0') }}</div>
        <div v-if="score >= hiScore && score > 0" style="font-size:12px;color:#ffcc00;letter-spacing:.1em;margin-bottom:4px">★ NEW BEST ★</div>
        <button
          @click="restart"
          style="margin-top:12px;padding:12px 36px;font-size:15px;font-family:'Courier New',monospace;font-weight:bold;background:transparent;color:#00ff88;border:2px solid #00ff88;cursor:pointer;letter-spacing:.1em;transition:background .15s"
          @mouseover="(e: MouseEvent) => (e.target as HTMLElement).style.background = '#00ff8818'"
          @mouseout="(e: MouseEvent) => (e.target as HTMLElement).style.background = 'transparent'"
        >PLAY AGAIN</button>
      </div>

      <!-- Click-to-play overlay — gives the iframe keyboard focus on first click.
           Lives in App so it does NOT reset when GameCanvas remounts. -->
      <div
        v-if="!hasClicked && !gameOver"
        @click="hasClicked = true"
        style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,4,17,.82);cursor:pointer;gap:10px"
      >
        <div style="font-size:30px">🕹️</div>
        <div style="font-size:15px;color:#00ff88;letter-spacing:.08em">Click to play</div>
        <div style="font-size:11px;color:#00ff8866;letter-spacing:.05em">← → / A D &nbsp;·&nbsp; SPACE / ↑ / W to shoot</div>
      </div>

    </div>
  </div>
</template>
`,

// ─────────────────────────────────────────────────────────────────────────────
'src/components/GameCanvas.vue': `<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// defineEmits<T>() — TypeScript generic declares each event and its argument types.
const props = defineProps<{ wave: number }>()
const emit  = defineEmits<{
  score:        [points: number]
  'life-lost':  []
  'wave-clear': []
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)

const W = 520, H = 400

// ── TypeScript interfaces ──────────────────────────────────────────────────
interface Rect     { x: number; y: number; w: number; h: number }
interface Player   extends Rect { speed: number }
interface Bullet   extends Rect {}
interface Invader  extends Rect { alive: boolean; row: number; col: number }
interface Bunker   extends Rect { hp: number; maxHp: number }
interface UFO      extends Rect { active: boolean; dir: number; visible: boolean }
interface Star     { x: number; y: number; r: number; b: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; sz: number }

// ── Pixel-art sprites: 10×6 grid rendered at 3px each = 30×18px per invader ──
const SPRITES: number[][] = [
  // Squid (row 0)
  [0,1,0,0,0,0,0,0,1,0, 1,0,1,1,1,1,1,1,0,1, 0,1,1,0,1,1,0,1,1,0, 0,1,1,1,1,1,1,1,1,0, 1,0,1,0,0,0,0,1,0,1, 0,1,0,0,0,0,0,0,1,0],
  // Crab (row 1)
  [1,0,0,0,1,1,0,0,0,1, 0,1,0,1,1,1,1,0,1,0, 1,1,1,1,1,1,1,1,1,1, 1,1,0,1,1,1,1,0,1,1, 1,0,0,0,1,1,0,0,0,1, 0,0,1,0,0,0,0,1,0,0],
  // Octopus (row 2)
  [0,0,0,1,1,1,1,0,0,0, 0,1,1,1,1,1,1,1,1,0, 1,1,1,0,1,1,0,1,1,1, 1,1,0,1,1,1,1,0,1,1, 0,0,1,0,0,0,0,1,0,0, 0,1,0,0,0,0,0,0,1,0],
  // Bug (row 3)
  [0,0,1,1,0,0,1,1,0,0, 0,0,0,1,1,1,1,0,0,0, 0,1,1,1,1,1,1,1,1,0, 1,1,0,1,1,1,1,0,1,1, 1,0,0,1,0,0,1,0,0,1, 0,1,0,0,0,0,0,0,1,0],
]
const ROW_COLORS = ['#ff4466', '#ff8844', '#ffcc00', '#cc88ff']

// ── All mutable state — reset completely by init() on each mount ───────────
let active     = true
let dying      = false
let dyingTimer = 0
let emitted    = false   // guard: prevents duplicate terminal emits
let animId     = 0
let animFrame  = 0

let player: Player       = { x: 0, y: 0, w: 40, h: 20, speed: 5 }
let bullets: Bullet[]    = []
let enemyBullets: Bullet[] = []
let shootCooldown  = 0
let enemyFireTimer = 60

const ROWS = 4, COLS = 9
let invaders: Invader[] = []
let invDir   = 1
let invSpeed = 0

let ufo: UFO      = { x: 0, y: 12, w: 48, h: 20, active: false, dir: 1, visible: false }
let ufoTimer      = 0

let bunkers:   Bunker[]   = []
let stars:     Star[]     = []
let particles: Particle[] = []

// ── init() — called fresh on every mount so each wave/life starts clean ─────
function init(): void {
  active = true; dying = false; dyingTimer = 0; emitted = false
  animFrame = 0; invDir = 1; emitted = false
  bullets = []; enemyBullets = []; particles = []
  shootCooldown = 0; enemyFireTimer = 55

  // Wave bonus: each successive wave starts faster
  invSpeed = 0.3 + (props.wave - 1) * 0.07

  player = { x: W / 2 - 20, y: H - 52, w: 40, h: 20, speed: 5 }

  stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.2 + 0.3, b: Math.random() * 0.7 + 0.3,
  }))

  invaders = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      invaders.push({ x: 28 + c * 54, y: 48 + r * 44, w: 30, h: 18, alive: true, row: r, col: c })

  bunkers = [
    { x: 56,  y: H - 76, w: 52, h: 26, hp: 8, maxHp: 8 },
    { x: 234, y: H - 76, w: 52, h: 26, hp: 8, maxHp: 8 },
    { x: 412, y: H - 76, w: 52, h: 26, hp: 8, maxHp: 8 },
  ]

  ufo = { x: 0, y: 12, w: 48, h: 20, active: false, dir: 1, visible: false }
  ufoTimer = 480 + Math.floor(Math.random() * 480)
}

// ── Helpers ───────────────────────────────────────────────────────────────
function hits(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function burst(x: number, y: number, color: string, n = 10): void {
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5
    const speed = 1.5 + Math.random() * 3
    particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1, color, sz: 2 + Math.random() * 2.5,
    })
  }
}

// ── Draw ─────────────────────────────────────────────────────────────────
function draw(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#040411'; ctx.fillRect(0, 0, W, H)

  // Twinkling stars
  for (const s of stars) {
    ctx.globalAlpha = s.b * (0.5 + 0.5 * Math.sin(animFrame * 0.04 + s.x))
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1

  // Ground line
  ctx.strokeStyle = '#00ff8820'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, player.y + player.h + 6); ctx.lineTo(W, player.y + player.h + 6); ctx.stroke()

  // Bunkers — alpha fades as hp drops
  for (const bk of bunkers) {
    if (bk.hp <= 0) continue
    ctx.globalAlpha = 0.2 + (bk.hp / bk.maxHp) * 0.8
    ctx.fillStyle = '#00cc55'
    const { x, y, w, h } = bk, lw = Math.floor(w * 0.29)
    ctx.fillRect(x + 6, y, w - 12, h - 8)
    ctx.fillRect(x, y + 5, w, h - 13)
    ctx.fillRect(x, y + h - 8, lw, 8)
    ctx.fillRect(x + w - lw, y + h - 8, lw, 8)
    ctx.globalAlpha = 1
  }

  // Invaders — two-frame walk animation (pixels shift ±1px every 20 frames)
  const walkAlt = Math.floor(animFrame / 20) % 2
  for (const inv of invaders) {
    if (!inv.alive) continue
    ctx.fillStyle = ROW_COLORS[inv.row % 4]
    const sprite = SPRITES[inv.row % 4], px = 3, dx = walkAlt ? -1 : 1
    for (let i = 0; i < 60; i++) {
      if (sprite[i]) ctx.fillRect(inv.x + (i % 10) * px + dx, inv.y + Math.floor(i / 10) * px, px, px)
    }
  }

  // UFO mystery ship
  if (ufo.active) {
    const { x, y, w, h } = ufo
    // Pulsing glow
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(animFrame * 0.25)
    ctx.fillStyle = '#ff44bb'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.65, w * 0.6, h * 0.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
    // Saucer body
    ctx.fillStyle = '#dd3399'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.65, w / 2, h * 0.38, 0, 0, Math.PI * 2); ctx.fill()
    // Dome
    ctx.fillStyle = '#ff88cc'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.38, w * 0.28, h * 0.32, 0, 0, Math.PI * 2); ctx.fill()
    // Porthole
    ctx.fillStyle = '#ffddee88'; ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.38, 4, 0, Math.PI * 2); ctx.fill()
    // "?" label
    ctx.fillStyle = '#ffddee'; ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center'
    ctx.fillText('?', x + w / 2, y + h + 11); ctx.textAlign = 'left'
  }

  // Enemy bullets
  for (const b of enemyBullets) {
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#ff4466'; ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4)
    ctx.globalAlpha = 1;    ctx.fillStyle = '#ff6688'; ctx.fillRect(b.x, b.y, b.w, b.h)
  }

  // Player bullets
  for (const b of bullets) {
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffdd00'; ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4)
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#ffdd00'; ctx.fillRect(b.x - 1, b.y, b.w + 2, b.h)
    ctx.globalAlpha = 1;   ctx.fillStyle = '#fff';    ctx.fillRect(b.x, b.y + 2, b.w, b.h - 4)
  }
  ctx.globalAlpha = 1

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = p.life; ctx.fillStyle = p.color
    ctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz)
  }
  ctx.globalAlpha = 1

  // Player — blinks every 4 frames while dying
  const showPlayer = !dying || Math.floor(animFrame / 4) % 2 === 0
  if (showPlayer) {
    const { x, y, w, h } = player
    // Thruster flame
    if (animFrame % 6 < 4) {
      const fh = 8 + (animFrame % 3) * 2
      ctx.globalAlpha = 0.6; ctx.fillStyle = '#00ff88'; ctx.fillRect(x + w * 0.35, y + h, w * 0.3, fh)
      ctx.fillStyle = '#fff'; ctx.fillRect(x + w * 0.42, y + h, w * 0.16, fh * 0.5)
      ctx.globalAlpha = 1
    }
    // Wings
    ctx.fillStyle = '#00cc66'
    ctx.beginPath(); ctx.moveTo(x, y+h); ctx.lineTo(x+w*0.22, y+h*0.55); ctx.lineTo(x+w*0.28, y+h); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(x+w, y+h); ctx.lineTo(x+w*0.78, y+h*0.55); ctx.lineTo(x+w*0.72, y+h); ctx.closePath(); ctx.fill()
    // Hull
    ctx.fillStyle = '#00ff88'
    ctx.beginPath(); ctx.moveTo(x+w/2, y); ctx.lineTo(x+w*0.82, y+h); ctx.lineTo(x+w*0.18, y+h); ctx.closePath(); ctx.fill()
    // Cockpit
    ctx.fillStyle = '#001a0d'; ctx.beginPath(); ctx.ellipse(x+w/2, y+h*0.48, 5, 4, 0, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#00ffcc88'; ctx.beginPath(); ctx.ellipse(x+w/2-1, y+h*0.45, 2, 2, 0, 0, Math.PI*2); ctx.fill()
  }

  // Red death flash (intensifies as timer counts down)
  if (dying) {
    ctx.globalAlpha = (1 - dyingTimer / 30) * 0.5
    ctx.fillStyle = '#ff2244'; ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
  }

  // Remaining count
  ctx.fillStyle = '#ffffff18'; ctx.font = '9px Courier New'
  ctx.fillText('remaining: ' + invaders.filter(i => i.alive).length, 8, H - 8)
}

// ── Input ─────────────────────────────────────────────────────────────────
const keys: Record<string, boolean> = {}
function onKeyDown(e: KeyboardEvent): void { keys[e.code] = true; if (e.code === 'Space') e.preventDefault() }
function onKeyUp(e: KeyboardEvent):   void { keys[e.code] = false }

// ── Update ────────────────────────────────────────────────────────────────
function update(): void {
  // Dying animation — counts down then emits exactly once
  if (dying) {
    dyingTimer--
    if (dyingTimer <= 0 && !emitted) {
      emitted = true; dying = false; active = false
      emit('life-lost')
    }
    return
  }

  // Player movement
  if ((keys.ArrowLeft  || keys.KeyA) && player.x > 0)            player.x -= player.speed
  if ((keys.ArrowRight || keys.KeyD) && player.x + player.w < W) player.x += player.speed

  // Player shoot
  if ((keys.Space || keys.ArrowUp || keys.KeyW) && shootCooldown <= 0) {
    bullets.push({ x: player.x + player.w / 2 - 1.5, y: player.y - 4, w: 3, h: 12 })
    shootCooldown = 16
  }
  if (shootCooldown > 0) shootCooldown--

  const alive = invaders.filter(i => i.alive)

  // Wave cleared
  if (alive.length === 0 && !emitted) {
    emitted = true; active = false
    emit('score', 100 * (props.wave))   // bigger bonus on later waves
    emit('wave-clear')
    return
  }

  // ── Invader movement — bounce and drop on hitting edges ─────────────────
  const leftEdge  = Math.min(...alive.map(i => i.x))
  const rightEdge = Math.max(...alive.map(i => i.x + i.w))
  if (rightEdge >= W - 4 || leftEdge <= 4) {
    invDir *= -1
    invaders.forEach(i => { i.y += 14 })
    invSpeed = Math.min(invSpeed + 0.06, 2.2)
  }
  invaders.forEach(i => { if (i.alive) i.x += invSpeed * invDir })

  // ── Enemy fires from the bottom invader of a random column ──────────────
  // col is stored at creation time (not derived from x) so it stays correct
  // as the whole formation drifts left and right.
  enemyFireTimer--
  if (enemyFireTimer <= 0) {
    enemyFireTimer = Math.max(20, 55 - props.wave * 3) + Math.floor(Math.random() * 40)
    const byCol = new Map<number, Invader>()
    for (const inv of alive) {
      const ex = byCol.get(inv.col)
      if (!ex || inv.y > ex.y) byCol.set(inv.col, inv)
    }
    const shooters = Array.from(byCol.values())
    const s = shooters[Math.floor(Math.random() * shooters.length)]
    enemyBullets.push({ x: s.x + s.w / 2 - 1.5, y: s.y + s.h, w: 3, h: 10 })
  }

  // ── UFO mystery ship ─────────────────────────────────────────────────────
  ufoTimer--
  if (ufoTimer <= 0 && !ufo.active) {
    ufo.active = true
    ufo.dir    = Math.random() < 0.5 ? 1 : -1
    ufo.x      = ufo.dir > 0 ? -ufo.w : W
    ufoTimer   = 600 + Math.floor(Math.random() * 600)
  }
  if (ufo.active) {
    ufo.x += 1.8 * ufo.dir
    if (ufo.x > W + ufo.w || ufo.x < -ufo.w * 2) ufo.active = false
  }

  // ── Move player bullets ──────────────────────────────────────────────────
  bullets = bullets.filter(b => {
    b.y -= 10
    if (b.y + b.h <= 0) return false

    // Hit UFO
    if (ufo.active && hits(b, ufo)) {
      ufo.active = false; b.y = -9999
      burst(ufo.x + ufo.w / 2, ufo.y + ufo.h / 2, '#ff88cc', 14)
      emit('score', (Math.floor(Math.random() * 6) + 1) * 50)  // 50–300 pts
      return false
    }

    // Hit bunker
    for (const bk of bunkers) {
      if (bk.hp > 0 && hits(b, bk)) { bk.hp--; return false }
    }

    // Hit invader (one bullet can only kill one invader)
    for (const inv of alive) {
      if (inv.alive && hits(b, inv)) {
        inv.alive = false; b.y = -9999
        burst(inv.x + 15, inv.y + 9, ROW_COLORS[inv.row % 4])
        emit('score', 10 + inv.row * 5)
        break
      }
    }

    return b.y > -9999
  })

  // ── Move enemy bullets ────────────────────────────────────────────────────
  const bulletSpeed = 3.2 + (props.wave - 1) * 0.2
  enemyBullets = enemyBullets.filter(b => {
    b.y += bulletSpeed
    if (b.y > H) return false
    for (const bk of bunkers) {
      if (bk.hp > 0 && hits(b, bk)) { bk.hp--; return false }
    }
    if (!dying && hits(b, player)) { dying = true; dyingTimer = 30; return false }
    return true
  })

  // ── Particles decay ───────────────────────────────────────────────────────
  particles = particles.filter(p => {
    p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.life -= 0.04
    return p.life > 0
  })

  // ── Invaders reach the player zone ───────────────────────────────────────
  if (!dying && alive.some(i => i.y + i.h >= player.y)) {
    dying = true; dyingTimer = 30
  }
}

// ── Game loop ─────────────────────────────────────────────────────────────
function loop(): void {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  animFrame++
  update()
  draw(ctx)
  // Keep looping while active OR while the dying animation is playing
  if (active || dying) animId = requestAnimationFrame(loop)
}

onMounted(() => {
  init()
  // Keyboard events bound to the iframe window — work as long as the iframe has focus.
  // The click-to-play overlay in App.vue gives the iframe focus on first click.
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  animId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  active = false
  cancelAnimationFrame(animId)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
  <canvas
    ref="canvasEl"
    :width="520"
    :height="400"
    style="display:block;outline:none"
  />
</template>
`,

// ─────────────────────────────────────────────────────────────────────────────
'src/components/HUD.vue': `<script setup lang="ts">
// Purely presentational: receives props, renders the heads-up display.
// withDefaults(defineProps<T>(), {...}) is the idiomatic TypeScript pattern
// for typed props with fallback values.
withDefaults(defineProps<{
  score:   number
  hiScore: number
  lives:   number
  wave:    number
}>(), { score: 0, hiScore: 0, lives: 3, wave: 1 })
</script>

<template>
  <div style="display:flex;align-items:center;justify-content:space-between;width:520px;padding:8px 4px 6px;border-bottom:1px solid #00ff8820;margin-bottom:6px">

    <!-- Score + hi-score column -->
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:90px">
      <span style="font-size:9px;letter-spacing:.18em;color:#00ff8855">SCORE</span>
      <span style="font-size:20px;letter-spacing:.1em">{{ String(score).padStart(5,'0') }}</span>
      <span style="font-size:9px;color:#00ff8844">BEST {{ String(hiScore).padStart(5,'0') }}</span>
    </div>

    <!-- Title + wave -->
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="font-size:15px;letter-spacing:.12em;font-weight:bold;text-shadow:0 0 10px #00ff8877">SPACE INVADERS</span>
      <span style="font-size:10px;letter-spacing:.1em;color:#00ff8866">WAVE {{ wave }}</span>
    </div>

    <!-- Lives column -->
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:90px">
      <span style="font-size:9px;letter-spacing:.18em;color:#00ff8855">LIVES</span>
      <span style="font-size:17px;letter-spacing:2px">
        <span v-for="i in lives"       :key="i"       style="color:#ff4466;text-shadow:0 0 6px #ff446688">♥</span>
        <span v-for="i in (3 - lives)" :key="'e' + i" style="color:#1e1e3a">♡</span>
      </span>
    </div>

  </div>
</template>
`,

  }
}
