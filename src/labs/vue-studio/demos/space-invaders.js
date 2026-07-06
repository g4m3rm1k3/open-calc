// Space Invaders — Vue 3 demo project
// Purpose: shows real multi-file Vue project structure with SoC.
//   App.vue        — root: owns game state, wires child components
//   GameCanvas.vue — canvas rendering + game loop + keyboard input
//   ScoreDisplay.vue — presentational: receives props, renders HUD

export const SPACE_INVADERS = {
  id: 'space-invaders',
  label: 'Space Invaders',
  description: 'A full game with canvas rendering, game loop, and Vue reactivity across 3 components.',
  files: {

// ─────────────────────────────────────────────────────────────────────────────
'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'

// createApp(App) creates a Vue application instance.
// .mount('#app') tells Vue to take control of <div id="app"> in the HTML page.
createApp(App).mount('#app')
`,

// ─────────────────────────────────────────────────────────────────────────────
'src/App.vue': `<script setup lang="ts">
// App.vue owns the game state that is shared across components.
// GameCanvas runs the game loop and emits events upward when something happens.
// ScoreDisplay only knows about score and lives — it never touches the game itself.
// This is Vue's "data down, events up" principle.
import { ref } from 'vue'
import GameCanvas from './components/GameCanvas.vue'
import ScoreDisplay from './components/ScoreDisplay.vue'

// ref() makes these values reactive — Vue re-renders any template that reads them
// when their .value changes.
const score = ref(0)
const lives = ref(3)
const gameOver = ref(false)
const waveKey = ref(0) // incrementing this remounts GameCanvas → fresh wave

// Called by GameCanvas whenever the player destroys an invader.
// We keep score logic here (in the parent) not inside GameCanvas, because
// ScoreDisplay also needs it — and two children should not share state directly.
function onScore(points: number): void {
  score.value += points
}

// Called by GameCanvas when an invader reaches the player's row.
function onLifeLost(): void {
  lives.value--
  if (lives.value <= 0) {
    gameOver.value = true
  } else {
    waveKey.value++  // remount GameCanvas → fresh wave, lives unchanged
  }
}

// Wave cleared: no life lost, just start the next wave
function onWaveClear(): void {
  waveKey.value++
}

function restart(): void {
  score.value = 0
  lives.value = 3
  gameOver.value = false
  waveKey.value++
}
</script>

<template>
  <div class="shell">
    <!-- ScoreDisplay is a pure presentational component: receives data, shows it. -->
    <ScoreDisplay :score="score" :lives="lives" />

    <!-- v-if removes GameCanvas from the DOM (stopping the game loop) when game over. -->
    <!-- :key="waveKey" — changing key forces Vue to unmount and remount the component, -->
    <!-- giving us a clean game state for each new wave without extra reset logic. -->
    <GameCanvas
      v-if="!gameOver"
      :key="waveKey"
      @score="onScore"
      @life-lost="onLifeLost"
      @wave-clear="onWaveClear"
    />

    <div v-else class="game-over">
      <div class="go-title">GAME OVER</div>
      <div class="go-score">Score: {{ score }}</div>
      <button class="go-btn" @click="restart">PLAY AGAIN</button>
    </div>
  </div>
</template>

<style scoped>
.shell {
  background: #060614;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Courier New', monospace;
  color: #00ff88;
  user-select: none;
}
.game-over {
  margin-top: 80px;
  text-align: center;
}
.go-title {
  font-size: 52px;
  color: #ff4444;
  letter-spacing: .08em;
  margin-bottom: 16px;
}
.go-score {
  font-size: 24px;
  margin-bottom: 32px;
}
.go-btn {
  padding: 12px 32px;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  background: #00ff88;
  color: #060614;
  border: none;
  cursor: pointer;
  letter-spacing: .06em;
}
.go-btn:hover { background: #00cc66; }
</style>
`,

// ─────────────────────────────────────────────────────────────────────────────
'src/components/GameCanvas.vue': `<script setup lang="ts">
// GameCanvas owns the game loop, canvas rendering, and input handling.
// It knows nothing about Vue's reactive system for the fast-path (game loop)
// because reading/writing reactive refs inside requestAnimationFrame triggers
// unnecessary Vue scheduler overhead. Instead we use plain JS variables for
// all game state that changes every frame, and only emit events to App.vue
// when something meaningful happens (score, life lost, win).

import { ref, onMounted, onUnmounted } from 'vue'

// defineEmits<T>() — TypeScript generic form declares each event's payload type.
// 'score' carries one number argument; 'life-lost' and 'wave-clear' carry none.
// @vue/compiler-sfc reads the generic to validate emit() calls at compile time.
const emit = defineEmits<{
  score: [points: number]
  'life-lost': []
  'wave-clear': []
}>()

// Template ref: canvasEl.value is the actual <canvas> DOM element after mount.
// ref<HTMLCanvasElement | null>(null) — TypeScript generic makes canvasEl.value
// typed as HTMLCanvasElement | null rather than the less useful Ref<unknown>.
const canvasEl = ref<HTMLCanvasElement | null>(null)

// ── Canvas dimensions ──────────────────────────────────────────────────────
const W = 580, H = 480

// ── TypeScript interfaces for game objects ─────────────────────────────────
interface Vec2 { x: number; y: number; w: number; h: number }
interface Player extends Vec2 { speed: number }
interface Bullet extends Vec2 {}
interface Invader extends Vec2 { alive: boolean }

// ── Player ────────────────────────────────────────────────────────────────
// Plain JS object — not reactive. The game loop reads and writes this
// directly without going through Vue's reactivity system.
let player: Player = { x: W / 2 - 20, y: H - 48, w: 40, h: 18, speed: 5 }

// ── Bullets ───────────────────────────────────────────────────────────────
let bullets: Bullet[] = []
let shootCooldown = 0

// ── Invaders ──────────────────────────────────────────────────────────────
const ROWS = 4, COLS = 9
let invaders: Invader[] = []
let invDir = 1   // 1 = moving right, -1 = moving left
let invSpeed = 0.8

function initInvaders(): void {
  invaders = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      invaders.push({ x: 40 + c * 56, y: 50 + r * 38, w: 30, h: 18, alive: true })
    }
  }
}

// ── Keyboard input ─────────────────────────────────────────────────────────
// A plain object that tracks which keys are currently held.
// Polling this object each frame (rather than handling keydown events directly)
// prevents dropped inputs when the frame fires between two keydown events.
const keys: Record<string, boolean> = {}
function onKeyDown(e: KeyboardEvent): void {
  keys[e.code] = true
  if (e.code === 'Space') e.preventDefault()  // prevent page scroll
}
function onKeyUp(e: KeyboardEvent): void { keys[e.code] = false }

// ── Game loop ──────────────────────────────────────────────────────────────
let animId = 0

function update(): void {
  // Move player left / right
  if ((keys.ArrowLeft || keys.KeyA) && player.x > 0)
    player.x -= player.speed
  if ((keys.ArrowRight || keys.KeyD) && player.x + player.w < W)
    player.x += player.speed

  // Shoot
  if ((keys.Space || keys.ArrowUp) && shootCooldown <= 0) {
    bullets.push({ x: player.x + player.w / 2 - 1.5, y: player.y - 4, w: 3, h: 12 })
    shootCooldown = 18
  }
  if (shootCooldown > 0) shootCooldown--

  // Move bullets upward; remove those that leave the canvas
  bullets = bullets.filter(b => { b.y -= 9; return b.y + b.h > 0 })

  // Move invaders
  const alive = invaders.filter(i => i.alive)
  if (alive.length === 0) {
    // All invaders destroyed — bonus points then signal App.vue to start a new wave.
    // wave-clear is a separate event from life-lost so App.vue does NOT decrement lives.
    emit('score', 100)
    emit('wave-clear')
    return
  }

  const leftEdge  = Math.min(...alive.map(i => i.x))
  const rightEdge = Math.max(...alive.map(i => i.x + i.w))
  if (rightEdge >= W || leftEdge <= 0) {
    invDir *= -1
    invaders.forEach(i => { i.y += 18 })
    invSpeed = Math.min(invSpeed + 0.1, 3)  // speed up each bounce
  }
  invaders.forEach(i => { if (i.alive) i.x += invSpeed * invDir })

  // Bullet ↔ invader collision (AABB)
  for (const b of bullets) {
    for (const inv of alive) {
      if (b.x < inv.x + inv.w && b.x + b.w > inv.x &&
          b.y < inv.y + inv.h && b.y + b.h > inv.y) {
        inv.alive = false
        b.y = -999      // mark bullet for removal next frame
        emit('score', 10)
      }
    }
  }

  // Invaders reach player row → life lost
  if (alive.some(i => i.y + i.h >= player.y)) {
    emit('life-lost')
  }
}

function draw(ctx: CanvasRenderingContext2D): void {
  // Clear
  ctx.fillStyle = '#060614'
  ctx.fillRect(0, 0, W, H)

  // Ground line
  ctx.strokeStyle = '#00ff8844'
  ctx.beginPath()
  ctx.moveTo(0, player.y + player.h + 6)
  ctx.lineTo(W, player.y + player.h + 6)
  ctx.stroke()

  // Player — a classic spaceship triangle
  ctx.fillStyle = '#00ff88'
  ctx.beginPath()
  ctx.moveTo(player.x + player.w / 2, player.y)       // nose
  ctx.lineTo(player.x,               player.y + player.h)   // bottom-left
  ctx.lineTo(player.x + player.w,    player.y + player.h)   // bottom-right
  ctx.closePath()
  ctx.fill()

  // Bullets
  ctx.fillStyle = '#ffdd00'
  for (const b of bullets) ctx.fillRect(b.x, b.y, b.w, b.h)

  // Invaders — small rectangles with dot eyes
  for (const inv of invaders) {
    if (!inv.alive) continue
    // Body colour by row
    const row = Math.round((inv.y - 50) / 38)
    ctx.fillStyle = row === 0 ? '#ff4466' : row === 1 ? '#ff8844' : row === 2 ? '#ffcc00' : '#cc88ff'
    ctx.fillRect(inv.x, inv.y, inv.w, inv.h)
    // Eyes
    ctx.fillStyle = '#060614'
    ctx.fillRect(inv.x + 5,  inv.y + 5, 5, 5)
    ctx.fillRect(inv.x + 20, inv.y + 5, 5, 5)
    // Mouth
    ctx.fillRect(inv.x + 7,  inv.y + 12, 16, 3)
  }

  // Alive count
  ctx.fillStyle = '#ffffff44'
  ctx.font = '11px Courier New'
  ctx.fillText('invaders: ' + invaders.filter(i => i.alive).length, 8, H - 8)
}

function loop(): void {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  update()
  draw(ctx)
  animId = requestAnimationFrame(loop)
}

// onMounted runs after the canvas element exists in the DOM.
// We cannot access canvasEl.value before mount — the DOM does not exist yet.
onMounted(() => {
  initInvaders()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  animId = requestAnimationFrame(loop)
})

// onUnmounted runs when Vue removes this component (game over, or wave reset).
// ALWAYS cancel the animation frame and remove listeners here — otherwise
// they outlive the component and cause memory leaks or phantom game loops.
onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
  <!-- ref="canvasEl" gives us a reference to the actual DOM element.
       Vue populates canvasEl.value after onMounted runs. -->
  <canvas
    ref="canvasEl"
    :width="580"
    :height="480"
    style="display:block; border: 1px solid #00ff8844; background:#060614; outline:none"
    tabindex="0"
  />
  <div style="color:#ffffff44; font:11px 'Courier New', monospace; margin-top:6px; text-align:center">
    ← → move &nbsp;|&nbsp; SPACE shoot &nbsp;|&nbsp; click canvas to focus
  </div>
</template>
`,

// ─────────────────────────────────────────────────────────────────────────────
'src/components/ScoreDisplay.vue': `<script setup lang="ts">
// ScoreDisplay is a purely presentational component.
// It receives data via props and renders it — no game logic, no state, no events emitted.
// This is the simplest possible Vue component and the most reusable kind.
// The parent (App.vue) is the single source of truth for score and lives.

// defineProps<T>() — TypeScript generic form. The interface declares prop types.
// withDefaults() wraps it to provide default values.
// This is the TypeScript-idiomatic form recommended by the Vue 3 docs.
const props = withDefaults(defineProps<{
  score: number
  lives: number
}>(), {
  score: 0,
  lives: 3,
})
</script>

<template>
  <div class="hud">
    <div class="hud-item">
      <span class="label">SCORE</span>
      <!-- {{ score }} is a mustache binding: Vue evaluates the expression and
           renders its string value. When score changes, only this text node updates. -->
      <span class="value">{{ String(score).padStart(5, '0') }}</span>
    </div>
    <div class="hud-title">SPACE INVADERS</div>
    <div class="hud-item">
      <span class="label">LIVES</span>
      <!-- v-for renders one ♥ per remaining life.
           :key gives Vue a stable identity for each element so it can
           efficiently update the DOM when the list changes. -->
      <span class="value">
        <span v-for="i in lives" :key="i" class="heart">♥</span>
        <span v-for="i in (3 - lives)" :key="'e' + i" class="heart lost">♡</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 580px;
  padding: 14px 0 10px;
  font-family: 'Courier New', monospace;
  color: #00ff88;
  border-bottom: 1px solid #00ff8833;
  margin-bottom: 12px;
}
.hud-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.hud-title { font-size: 18px; letter-spacing: .12em; font-weight: bold; }
.label { font-size: 10px; letter-spacing: .15em; color: #00ff8888; }
.value { font-size: 20px; letter-spacing: .08em; }
.heart { color: #ff4444; margin: 0 1px; }
.heart.lost { color: #333; }
</style>
`,

  }
}
