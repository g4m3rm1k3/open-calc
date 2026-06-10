// Demo project loaded on first visit or via "Load Demo" button.
// Each entry is { name, content } — DocsCodeWorkspace creates real items via makeFile().

export const EXAMPLE_PROJECT = [
  {
    name: 'README.md',
    content: `# 👋 Welcome to Open-Calc Studio

This is your **code workspace** — a full development environment that runs right in the browser.
This demo project has a Snake game built with TypeScript. Click each file in the tree to explore it.

---

## What each file does

| File | Purpose |
|------|---------|
| \`README.md\` | This guide — project documentation |
| \`index.html\` | The game — open the **Preview** tab to play it |
| \`game.ts\` | TypeScript source — click **▶ Run** to execute in the terminal |
| \`types.ts\` | TypeScript interfaces with explanations |
| \`style.css\` | Game styles |

---

## How the workspace works

### 📁 File Tree
Create, rename, and delete files with the **+** button.
Click any file to open it in the editor.

### ✏️ Editor
Full Monaco editor — the same editor as VS Code.
Syntax highlighting and autocomplete for TypeScript, JavaScript, Python, HTML, CSS, and OpenMAT.

### ▶ Run
Executes the active file in the terminal.
Try it on \`game.ts\` — you'll see TypeScript running live.

### 🖥 Preview
Renders HTML files in a live iframe.
Click the **Preview** tab with \`index.html\` selected to play the game.

### 💻 Terminal
Run commands directly:
\`\`\`bash
node game.ts
python main.py
\`\`\`

---

## Starting your own project

1. Click **+** in the file tree to create a new file
2. Name it (\`main.py\`, \`app.ts\`, \`index.html\`, etc.)
3. Write your code and click **▶ Run**

Or follow a lesson and click **Code Along →** on any code block to send it here.

---

> 💡 **Your workspace is saved locally in your browser.**
> Sign in to sync across devices. Nothing here is sent to anyone.
`,
  },

  {
    name: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Snake — Studio Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'JetBrains Mono', monospace;
      color: #e2e8f0;
      gap: 16px;
    }
    h1 { font-size: 18px; letter-spacing: 0.1em; color: #4ade80; }
    #score { font-size: 14px; color: #94a3b8; }
    canvas { border: 2px solid #1e293b; border-radius: 6px; display: block; }
    #hint { font-size: 11px; color: #475569; }
  </style>
</head>
<body>
  <h1>🐍 SNAKE</h1>
  <div id="score">Score: 0</div>
  <canvas id="canvas" width="400" height="400"></canvas>
  <div id="hint">Arrow keys to move · R to restart</div>

  <script>
    // Plain JavaScript — no build step, works directly in the Preview tab.
    // The TypeScript version lives in game.ts — click that file and hit Run!
    const GRID = 20, CELL = 20, TICK = 110

    let snake = [{ x: 10, y: 10 }]
    let food = randCell()
    let dir = 'RIGHT', nextDir = 'RIGHT'
    let score = 0, alive = true

    const canvas = document.getElementById('canvas')
    const ctx    = canvas.getContext('2d')
    const scoreEl = document.getElementById('score')

    const DELTA    = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} }
    const OPPOSITE = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' }

    function randCell() {
      return { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
    }

    function step() {
      if (nextDir !== OPPOSITE[dir]) dir = nextDir
      const head = snake[0]
      const d = DELTA[dir]
      const nxt = { x: head.x + d.x, y: head.y + d.y }
      if (nxt.x < 0 || nxt.x >= GRID || nxt.y < 0 || nxt.y >= GRID) { alive = false; return }
      if (snake.some(p => p.x === nxt.x && p.y === nxt.y))            { alive = false; return }
      snake.unshift(nxt)
      if (nxt.x === food.x && nxt.y === food.y) {
        score++
        scoreEl.textContent = 'Score: ' + score
        food = randCell()
      } else {
        snake.pop()
      }
    }

    function draw() {
      const W = GRID * CELL
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, W, W)

      // Subtle grid
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i*CELL, 0); ctx.lineTo(i*CELL, W); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, i*CELL); ctx.lineTo(W, i*CELL); ctx.stroke()
      }

      // Food
      ctx.fillStyle = '#f59e0b'
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, CELL/2 - 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Snake — head is bright green, body fades
      snake.forEach(function(p, i) {
        ctx.fillStyle = i === 0 ? '#4ade80' : ('hsl(' + (120 + i*3) + ',60%,' + (45 - i*0.4) + '%)')
        ctx.beginPath()
        ctx.roundRect(p.x*CELL + 1, p.y*CELL + 1, CELL - 2, CELL - 2, i === 0 ? 5 : 3)
        ctx.fill()
      })

      // Game over overlay
      if (!alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.78)'
        ctx.fillRect(0, 0, W, W)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#f87171'
        ctx.font = 'bold 26px monospace'
        ctx.fillText('GAME OVER', W/2, W/2 - 24)
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '15px monospace'
        ctx.fillText('Final score: ' + score, W/2, W/2 + 12)
        ctx.fillStyle = '#64748b'
        ctx.font = '12px monospace'
        ctx.fillText('Press R to restart', W/2, W/2 + 40)
      }
    }

    function restart() {
      snake = [{ x: 10, y: 10 }]
      food = randCell()
      dir = nextDir = 'RIGHT'
      score = 0; alive = true
      scoreEl.textContent = 'Score: 0'
    }

    document.addEventListener('keydown', function(e) {
      var MAP = { ArrowUp:'UP', ArrowDown:'DOWN', ArrowLeft:'LEFT', ArrowRight:'RIGHT' }
      if (MAP[e.key]) { e.preventDefault(); nextDir = MAP[e.key] }
      if (e.key === 'r' || e.key === 'R') restart()
    })

    setInterval(function() { if (alive) step(); draw() }, TICK)
    draw() // draw initial frame immediately
  <\/script>
</body>
</html>
`,
  },

  {
    name: 'game.ts',
    content: `// ── Snake Game — TypeScript Terminal Demo ─────────────────────────────────────
// Click ▶ Run to execute this file in the terminal.
// This simulates a few game ticks and prints the state — no browser needed!

interface Point { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface GameState {
  snake: Point[]
  food: Point
  direction: Direction
  score: number
  tick: number
}

const GRID = 20

function randomCell(): Point {
  return {
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  }
}

function step(state: GameState): GameState {
  const DELTA: Record<Direction, Point> = {
    UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 },
  }
  const d = DELTA[state.direction]
  const head = state.snake[0]
  const next: Point = { x: head.x + d.x, y: head.y + d.y }

  const ate = next.x === state.food.x && next.y === state.food.y
  const newSnake = ate
    ? [next, ...state.snake]           // grow
    : [next, ...state.snake.slice(0, -1)] // move

  return {
    snake: newSnake,
    food: ate ? randomCell() : state.food,
    direction: state.direction,
    score: ate ? state.score + 1 : state.score,
    tick: state.tick + 1,
  }
}

function formatSnake(snake: Point[]): string {
  return snake.slice(0, 3).map(p => \`(\${p.x},\${p.y})\`).join('→') +
    (snake.length > 3 ? \`… +\${snake.length - 3} more\` : '')
}

// ── Run the simulation ─────────────────────────────────────────────────────────
let state: GameState = {
  snake: [{ x: 5, y: 10 }],
  food: { x: 9, y: 10 },   // place food in the snake's path
  direction: 'RIGHT',
  score: 0,
  tick: 0,
}

console.log('=== Snake Game Simulation ===\\n')
console.log(\`Grid: \${GRID}×\${GRID} | Initial food at (\${state.food.x},\${state.food.y})\\n\`)

for (let i = 0; i < 12; i++) {
  const prev = state
  state = step(state)
  const ate = state.score > prev.score
  console.log(
    \`Tick \${String(state.tick).padStart(2)}: \${formatSnake(state.snake)}\` +
    (ate ? \`  🍎 +1 → score \${state.score}\` : '')
  )
}

console.log(\`\\nFinal score: \${state.score} | Snake length: \${state.snake.length}\`)
console.log('\\nTypeScript: types checked, compiled, and running! ✓')
`,
  },

  {
    name: 'types.ts',
    content: `// ── TypeScript Types: A Quick Tour ────────────────────────────────────────────
// This file explains TypeScript's type system using the Snake game as an example.
// Click ▶ Run to see how the types work at runtime.

// ── Interfaces ─────────────────────────────────────────────────────────────────
// An interface defines the SHAPE of an object.
// TypeScript will error if you pass the wrong shape — caught before the code runs.

interface Point {
  x: number
  y: number
}

interface Player {
  name: string
  score: number
  position: Point   // ← interfaces can reference other interfaces
}

// ── Type Aliases ───────────────────────────────────────────────────────────────
// A 'type' alias names a type — useful for unions (one-of options).

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'  // only these 4 strings allowed

type Result<T> =
  | { ok: true;  value: T }      // success case
  | { ok: false; error: string } // failure case

// ── Generic Types ──────────────────────────────────────────────────────────────
// Generics let you write reusable type-safe functions.
// <T> is a type parameter — like a variable for types.

function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

function wrap<T>(value: T): Result<T> {
  return { ok: true, value }
}

// ── Record ─────────────────────────────────────────────────────────────────────
// Record<K, V> is a type-safe map from keys K to values V.

const DELTA: Record<Direction, Point> = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x: 1,  y:  0 },
}

// ── Demo ───────────────────────────────────────────────────────────────────────
const p1: Player = { name: 'Ada', score: 42, position: { x: 5, y: 10 } }
const dir: Direction = 'RIGHT'
const delta = DELTA[dir]
const newPos: Point = { x: p1.position.x + delta.x, y: p1.position.y + delta.y }

console.log('Player:', p1.name)
console.log('Direction:', dir, '→ delta', delta)
console.log('New position:', newPos)

const nums = [3, 1, 4, 1, 5]
console.log('first<number>([3,1,4,1,5]) =', first(nums))

const wrapped = wrap('hello')
console.log('wrap("hello") =', JSON.stringify(wrapped))
`,
  },

  {
    name: 'style.css',
    content: `/* Snake game styles — applied when bundled with index.html via the Preview tab */

/* These styles are separate from index.html to show CSS file separation.
   The Preview tab bundles all CSS and HTML together automatically. */

body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

canvas {
  image-rendering: pixelated;
}

/* Try editing this and switching to the Preview tab to see the change live! */
`,
  },
]
