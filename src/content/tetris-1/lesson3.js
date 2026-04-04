// LESSON_TETRIS_03.js
// Lesson 3 — The Game Loop
// The problem: the piece is on the board but it just sits there.
// We need it to fall automatically, one row at a time.
// Concepts: setInterval, clearInterval, the game loop pattern,
//           state outside the loop, tick → update → render.

const LESSON_TETRIS_03 = {
  title: 'The Game Loop',
  subtitle: 'Make the piece fall using setInterval — and learn why every game is built around a repeating tick.',
  sequential: true,
  cells: [

    // ─── PART 1: RECAP ────────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Recap: What we built in Lesson 2

By the end of Lesson 2 you had:

\`\`\`js
const PIECES    // array of 7 tetromino objects {name, colour, shape}
spawnPiece()    // returns a new piece at the top centre of the board
renderBoard(cells, boardData, activePiece)  // two-pass render
\`\`\`

And one key rule:

> **boardData holds locked pieces. activePiece floats on top. Never write the active piece into boardData until it lands.**

The render function's second pass overlays the active piece on the board data without mutating it.

---

## The problem we face now

The piece spawns at the top. It just sits there.

Tetris needs pieces to **fall automatically** — one row down, every N milliseconds, forever, until something stops the game.

To make that work we need to answer three questions:
1. How do you run a function repeatedly on a timer?
2. How do you structure the "one tick" of work?
3. Where does the game state live — inside the timer, or outside it?

All three answers are in this lesson.`,
    },

    // ─── RECAP CELL ──────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's the Lesson 2 result. A piece is on the board. It's static.

Before moving on, make sure you can answer:
- What does \`spawnPiece()\` return? What are all its properties?
- Why does \`renderBoard\` loop through \`activePiece.shape\` in the second pass?
- Why don't we write \`activePiece\` into \`boardData\` immediately?

If any of those are unclear, re-read the Lesson 2 seed cell before continuing.`,
      html: `<div id="board"></div>`,
      css: `body{background:#0f172a;display:flex;justify-content:center;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];
function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}
function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS + (activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
renderBoard(cells, boardData, activePiece);
console.log('Piece on board:', activePiece.name, '— static for now.');`,
      outputHeight: 620,
    },

    // ─── PART 2: setInterval ──────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `\`setInterval(fn, ms)\` calls a function repeatedly, every \`ms\` milliseconds, until you stop it.

It returns an **interval ID** — an integer handle you use to cancel the interval later. Store it. You will need it.

\`clearInterval(id)\` cancels the interval. The function stops being called.

These two functions are the basis of every game loop, animation, and polling mechanism in browser JavaScript. The key properties:
- The callback runs **asynchronously** — it goes through the event loop queue (from Lesson 0.2: the callback only runs when the call stack is clear)
- The interval is **approximate** — if your callback takes longer than \`ms\` to run, the next call will be delayed
- You **must** save the ID if you ever want to stop it

Run the cell and watch the counter tick.`,
      html: `<div id="counter"></div><div id="log"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#counter{font-size:48px;font-weight:800;color:#22d3ee;font-family:monospace;margin-bottom:10px;}
#log{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:10px;font-size:12px;line-height:1.8;}`,
      startCode: `let count = 0;
const counterEl = document.querySelector('#counter');
const logEl = document.querySelector('#log');

// setInterval returns an ID — save it so we can stop later
const intervalId = setInterval(() => {
  count++;
  counterEl.textContent = count;

  if (count >= 5) {
    clearInterval(intervalId);  // stop after 5 ticks
    logEl.innerHTML +=
      'Stopped at count=' + count + '<br>' +
      'intervalId was: ' + intervalId;
  }
}, 600);

logEl.innerHTML =
  'setInterval started. ID = ' + intervalId + '<br>' +
  'Ticking every 600ms...<br>';

console.log('Interval started, ID:', intervalId);`,
      outputHeight: 200,
    },

    // ─── PART 3: STATE OUTSIDE THE LOOP ──────────────────────────────────────

    {
      type: 'js',
      instruction: `Here is the most important architectural rule of a game loop:

**State lives outside the loop. The loop reads and updates state — it doesn't own it.**

If you declare variables inside the \`setInterval\` callback, they reset to their initial values on every tick. The callback has no memory between calls.

If you declare variables outside — in the enclosing scope — they persist across every tick. The callback can read and update them, and those changes survive to the next tick.

This is why \`boardData\`, \`activePiece\`, and \`cells\` are declared outside the loop. The loop manipulates them. It doesn't create them.

Run both versions and see the difference.`,
      html: `<div id="wrong"></div><div id="right"></div>`,
      css: `body{background:#0a1220;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px;}
#wrong,#right{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.8;}`,
      startCode: `// ✗ WRONG: state inside the loop resets every tick
let wrongCount = 0;
const wrongId = setInterval(() => {
  let x = 0;   // ← declared inside: resets to 0 every tick
  x++;
  document.querySelector('#wrong').textContent =
    '✗ State INSIDE loop:\n' +
    'x resets to 0 every tick\n' +
    'x after ++ = ' + x + '  (always 1)\n' +
    'tick #' + (++wrongCount);
  if (wrongCount >= 4) clearInterval(wrongId);
}, 700);

// ✓ RIGHT: state outside the loop persists
let y = 0;    // ← declared outside: persists between ticks
let rightCount = 0;
const rightId = setInterval(() => {
  y++;         // y accumulates across ticks
  document.querySelector('#right').textContent =
    '✓ State OUTSIDE loop:\n' +
    'y persists between ticks\n' +
    'y = ' + y + '  (grows each tick)\n' +
    'tick #' + (++rightCount);
  if (rightCount >= 4) clearInterval(rightId);
}, 700);`,
      outputHeight: 200,
    },

    // ─── PART 4: THE TICK PATTERN ─────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Every game loop follows the same three-step pattern on every tick:

**1. Update state** — change the game data based on what should happen this frame. Move the piece down. Check collisions. Clear lines.

**2. Render** — redraw the visual representation of the new state. Never render in the middle of updating.

**3. Schedule next tick** — handled automatically by \`setInterval\`.

This order is non-negotiable. If you render before updating, you display stale state. If you update in multiple places and render in between, you get visual inconsistencies.

The tick function is a pure transformation: take the current state, compute the next state, render it. That's all.`,
      html: `<div id="tickVis"></div><div id="tickLog"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#tickVis{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;}
.tick-cell{width:28px;height:28px;border-radius:4px;background:#1e293b;border:1px solid #334155;transition:all 0.1s;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:10px;color:#475569;}
.tick-cell.active{background:#22d3ee;border-color:#67e8f9;color:#0c4a6e;}
#tickLog{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:10px;font-size:12px;line-height:1.8;}`,
      startCode: `// Minimal game loop demonstrating tick → update → render

// STATE (outside the loop)
let position = 0;
const TOTAL = 10;

// RENDER: visual representation of state
function render(pos) {
  const vis = document.querySelector('#tickVis');
  vis.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const cell = document.createElement('div');
    cell.className = 'tick-cell' + (i === pos ? ' active' : '');
    cell.textContent = i;
    vis.appendChild(cell);
  }
}

// TICK: update state, then render
let tickNum = 0;
const id = setInterval(() => {
  // 1. UPDATE STATE
  position = (position + 1) % TOTAL;
  tickNum++;

  // 2. RENDER
  render(position);

  document.querySelector('#tickLog').innerHTML =
    'Tick #' + tickNum + '<br>' +
    'State: position = ' + position + '<br>' +
    'Pattern: update state → render → wait → repeat';

  if (tickNum >= 12) clearInterval(id);
}, 500);

render(position); // initial render before first tick`,
      outputHeight: 200,
    },

    // ─── PART 5: MOVING THE PIECE DOWN ────────────────────────────────────────

    {
      type: 'js',
      instruction: `Moving the piece down is one line of state change:

\`\`\`js
activePiece.y += 1;
\`\`\`

That's it. The piece's \`y\` coordinate increases by 1. Then we call \`renderBoard\` and the piece appears one row lower.

No DOM manipulation. No searching for cells. Just change the number, re-render.

This is why the data/display separation from Lesson 2 matters: moving the piece is a trivial state change. The render function handles all the visual complexity.

But there's a problem — if we just keep incrementing \`y\`, the piece will fall off the bottom of the board and keep going. We need to handle that. For now, watch the piece fall freely and we'll add the floor check in the challenge.`,
      html: `<div id="board"></div>`,
      css: `body{background:#0f172a;display:flex;justify-content:center;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];
function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}
function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS + (activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}

// STATE
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();

// TICK — just move down and render, no floor check yet
const loopId = setInterval(() => {
  activePiece.y += 1;          // update state
  renderBoard(cells, boardData, activePiece);  // render

  // Stop after it falls off screen so the demo doesn't run forever
  if (activePiece.y > ROWS + 2) {
    clearInterval(loopId);
    console.log('Piece fell off the bottom — we need a floor check!');
  }
}, 300);

renderBoard(cells, boardData, activePiece);
console.log('Piece falling... (no floor check yet)');`,
      outputHeight: 620,
    },

    // ─── PART 6: THE FLOOR CHECK — PREVIEW ───────────────────────────────────

    {
      type: 'js',
      instruction: `When the piece can't fall any further — because it would go below row 19 — it needs to **lock** in place and a new piece spawns.

We don't have full collision detection yet (that's Lesson 6). But we can handle the simplest case right now: checking whether any filled cell in the piece's shape would land below the last row.

The check: for every filled cell in the shape, compute \`activePiece.y + r + 1\`. If that value would be \`>= ROWS\`, the piece can't move down.

When the piece can't fall:
1. Write it into \`boardData\` (lock it)
2. Spawn a new piece

This is a simplified lock — it won't detect other pieces in the way yet. Full collision detection comes in Lesson 6.`,
      html: `<div id="board"></div><div id="info"></div>`,
      css: `body{background:#0f172a;display:flex;flex-direction:column;align-items:center;padding:20px;gap:8px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
#info{color:#94a3b8;font-family:monospace;font-size:12px;text-align:center;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];
function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}
function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS + (activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}

// Simplified floor check: would any filled cell go below row 19?
function wouldHitFloor(piece) {
  return piece.shape.some((row, r) =>
    row.some((val, c) => val && piece.y + r + 1 >= ROWS)
  );
}

// Lock piece into boardData
function lockPiece(piece, boardData) {
  piece.shape.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) boardData[piece.y + r][piece.x + c] = piece.colour;
    })
  );
}

// STATE
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
let pieceCount = 1;
const infoEl = document.querySelector('#info');

const loopId = setInterval(() => {
  if (wouldHitFloor(activePiece)) {
    lockPiece(activePiece, boardData);  // write into boardData
    activePiece = spawnPiece();          // spawn next piece
    pieceCount++;
    if (pieceCount > 8) { clearInterval(loopId); return; }
  } else {
    activePiece.y += 1;
  }
  renderBoard(cells, boardData, activePiece);
  infoEl.textContent = 'Piece #' + pieceCount + ' — ' + activePiece.name;
}, 280);

renderBoard(cells, boardData, activePiece);`,
      outputHeight: 660,
    },

    // ─── PART 7: clearInterval AND GAME STATES ────────────────────────────────

    {
      type: 'js',
      instruction: `A game needs to be **startable**, **pauseable**, and **stoppable**. That means the interval must be controllable.

The pattern:
- \`intervalId = null\` — track whether the loop is running
- \`start()\` — calls \`setInterval\`, stores the ID
- \`stop()\` — calls \`clearInterval\` with the stored ID, sets it to null
- Before starting, check if \`intervalId !== null\` to avoid creating duplicate loops

**Never call \`setInterval\` twice without calling \`clearInterval\` first.** You'll get two loops running simultaneously, each advancing the game state. The piece will fall twice as fast and the game becomes unpredictable.

This is one of the most common bugs in beginner game code.`,
      html: `<div id="display"></div>
<div style="display:flex;gap:8px;margin-top:10px;">
  <button id="startBtn">Start</button>
  <button id="stopBtn">Stop</button>
  <button id="resetBtn">Reset</button>
</div>`,
      css: `body{background:#0a1220;padding:14px;}
#display{font-size:52px;font-weight:800;color:#22d3ee;font-family:monospace;
         border:1px solid #334155;border-radius:8px;background:#111827;
         padding:16px;text-align:center;min-width:120px;}
button{padding:8px 16px;background:#1e293b;border:1px solid #334155;
       color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;}
button:hover{background:#334155;}`,
      startCode: `let count = 0;
let intervalId = null;   // null = not running
const display = document.querySelector('#display');

function render() {
  display.textContent = count;
}

function start() {
  if (intervalId !== null) return;  // already running — don't duplicate
  intervalId = setInterval(() => {
    count++;
    render();
  }, 200);
  console.log('Started. ID:', intervalId);
}

function stop() {
  if (intervalId === null) return;  // already stopped
  clearInterval(intervalId);
  intervalId = null;
  console.log('Stopped at count:', count);
}

function reset() {
  stop();
  count = 0;
  render();
  console.log('Reset.');
}

document.querySelector('#startBtn').addEventListener('click', start);
document.querySelector('#stopBtn').addEventListener('click', stop);
document.querySelector('#resetBtn').addEventListener('click', reset);

render();`,
      outputHeight: 180,
    },

    // ─── PART 8: CHALLENGE ────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You've seen all the pieces:
- \`setInterval\` / \`clearInterval\` — the timer mechanism
- State outside the loop — so it persists between ticks
- \`tick()\` pattern — update state, then render
- The floor check — detect when the piece can't fall further
- \`lockPiece\` — write the piece into boardData
- Start/stop/reset — controlling the loop

**Your job:** Complete the \`tick()\` function and the \`start()\` / \`stop()\` functions to build a working falling-piece game.

The scaffold has all the setup complete. You fill in three things:
1. \`tick()\` — one game step: check floor → lock or move → render
2. \`start()\` — begin the interval, guard against duplicates
3. \`stop()\` — cancel the interval safely

When it works, you'll see pieces spawn, fall, lock, and new pieces spawn — indefinitely. That's a game loop.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Build the game loop.**

Complete three functions:

**\`tick()\`**
- If the active piece would hit the floor: lock it into \`boardData\`, spawn a new piece
- Otherwise: move the piece down one row (\`activePiece.y += 1\`)
- Always call \`renderBoard\` at the end

**\`start()\`**
- If the loop is already running, return immediately (no duplicate intervals)
- Otherwise: set \`intervalId = setInterval(tick, SPEED)\`

**\`stop()\`**
- If not running, return immediately
- Otherwise: \`clearInterval(intervalId)\`, set \`intervalId = null\`

The test button at the bottom starts and stops the loop to verify both work.`,
      html: `<div id="board"></div>
<div style="display:flex;gap:8px;margin-top:10px;">
  <button id="startBtn">▶ Start</button>
  <button id="stopBtn">⏸ Stop</button>
</div>
<div id="status"></div>`,
      css: `body{background:#0f172a;display:flex;flex-direction:column;align-items:center;padding:20px;gap:10px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:8px 18px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;}
button:hover{background:#334155;}
#status{color:#94a3b8;font-family:monospace;font-size:12px;text-align:center;max-width:320px;line-height:1.7;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const SPEED = 400; // ms per tick

const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}

function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS + (activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}

function wouldHitFloor(piece) {
  return piece.shape.some((row, r) =>
    row.some((val, c) => val && piece.y + r + 1 >= ROWS)
  );
}

function lockPiece(piece, boardData) {
  piece.shape.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) boardData[piece.y + r][piece.x + c] = piece.colour;
    })
  );
}

// ── GAME STATE ───────────────────────────────────────────────────────────────
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
let intervalId = null;

// ── YOUR CODE HERE ────────────────────────────────────────────────────────────

// tick()
// One game step. Called by setInterval.
// If activePiece would hit the floor: lockPiece, then spawnPiece
// Otherwise: activePiece.y += 1
// Always: renderBoard(cells, boardData, activePiece)
function tick() {
  // YOUR CODE HERE
}

// start()
// Start the game loop. Guard against duplicate intervals.
// intervalId = setInterval(tick, SPEED)
function start() {
  // YOUR CODE HERE
}

// stop()
// Stop the game loop safely.
// clearInterval, set intervalId = null
function stop() {
  // YOUR CODE HERE
}

// ── BUTTONS ───────────────────────────────────────────────────────────────────
document.querySelector('#startBtn').addEventListener('click', () => {
  start();
  document.querySelector('#status').textContent = 'Loop running...';
});
document.querySelector('#stopBtn').addEventListener('click', () => {
  stop();
  document.querySelector('#status').textContent = 'Loop stopped.';
});

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
// Runs start(), waits, checks piece moved, then stops.
const status = document.querySelector('#status');
renderBoard(cells, boardData, activePiece);
const startY = activePiece.y;

setTimeout(() => {
  start();
  setTimeout(() => {
    const movedDown = activePiece.y > startY || boardData.some(r => r.some(v => v !== 0));
    stop();
    if (movedDown) {
      status.textContent = '✓ Game loop works. Pieces fall and lock correctly.';
      status.style.color = '#10b981';
    } else {
      status.textContent = 'Piece did not move. Check your tick() function.';
      status.style.color = '#f87171';
    }
  }, SPEED * 6);
}, 100);`,
      solutionCode: `const COLS = 10;
const ROWS = 20;
const SPEED = 400;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];
function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}
function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS + (activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}
function wouldHitFloor(piece) {
  return piece.shape.some((row, r) =>
    row.some((val, c) => val && piece.y + r + 1 >= ROWS)
  );
}
function lockPiece(piece, boardData) {
  piece.shape.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) boardData[piece.y + r][piece.x + c] = piece.colour;
    })
  );
}
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
let intervalId = null;

function tick() {
  if (wouldHitFloor(activePiece)) {
    lockPiece(activePiece, boardData);
    activePiece = spawnPiece();
  } else {
    activePiece.y += 1;
  }
  renderBoard(cells, boardData, activePiece);
}

function start() {
  if (intervalId !== null) return;
  intervalId = setInterval(tick, SPEED);
}

function stop() {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

document.querySelector('#startBtn').addEventListener('click', () => {
  start();
  document.querySelector('#status').textContent = 'Loop running...';
});
document.querySelector('#stopBtn').addEventListener('click', () => {
  stop();
  document.querySelector('#status').textContent = 'Loop stopped.';
});

renderBoard(cells, boardData, activePiece);
const status = document.querySelector('#status');
const startY = activePiece.y;
setTimeout(() => {
  start();
  setTimeout(() => {
    const movedDown = activePiece.y > startY || boardData.some(r => r.some(v => v !== 0));
    stop();
    status.textContent = movedDown
      ? '✓ Game loop works. Pieces fall and lock correctly.'
      : 'Piece did not move. Check tick().';
    status.style.color = movedDown ? '#10b981' : '#f87171';
  }, SPEED * 6);
}, 100);`,
      check: (code) => {
        const hasTick = /function tick\(\)/.test(code) &&
          /activePiece\.y\s*\+=\s*1/.test(code) &&
          /renderBoard/.test(code);
        const hasStart = /function start\(\)/.test(code) &&
          /setInterval\s*\(\s*tick/.test(code) &&
          /intervalId\s*!==\s*null/.test(code);
        const hasStop = /function stop\(\)/.test(code) &&
          /clearInterval/.test(code) &&
          /intervalId\s*=\s*null/.test(code);
        return hasTick && hasStart && hasStop;
      },
      successMessage: `Pieces fall and lock. That's the core of every game loop ever written: tick → update → render → wait → repeat.`,
      failMessage: `Three functions to check: tick() must call activePiece.y += 1 (or lockPiece) then renderBoard. start() must guard with if(intervalId !== null) return. stop() must clearInterval and set intervalId = null.`,
      outputHeight: 700,
    },

    // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: Variable speed.**

Add a speed control. Every time a piece locks, increase the speed by reducing the interval delay. Use \`clearInterval\` + \`setInterval\` to restart the loop at the new speed.

Start at 600ms. Decrease by 40ms each time a piece locks. Minimum speed: 80ms.

Display the current speed next to the board.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="speedDisplay" style="color:#22d3ee;font-family:monospace;font-size:13px;margin-bottom:8px;"></div>
    <div id="pieceCount" style="color:#94a3b8;font-family:monospace;font-size:12px;"></div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px;">
      <button id="startBtn">▶ Start</button>
      <button id="stopBtn">⏸ Stop</button>
    </div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];
function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}
function createBoard() {
  const el = document.querySelector('#board');
  const cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const c = document.createElement('div');
    c.className = 'cell';
    el.appendChild(c);
    cells.push(c);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS+(activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}
function wouldHitFloor(piece) {
  return piece.shape.some((row, r) =>
    row.some((val, c) => val && piece.y + r + 1 >= ROWS)
  );
}
function lockPiece(piece, boardData) {
  piece.shape.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) boardData[piece.y + r][piece.x + c] = piece.colour;
    })
  );
}

const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
let intervalId = null;
let speed = 600;     // starting ms per tick
let lockedCount = 0;

// YOUR CODE HERE
// tick():
//   - if wouldHitFloor: lockPiece, increment lockedCount,
//     reduce speed by 40 (min 80), restart loop at new speed, spawnPiece
//   - else: y += 1
//   - renderBoard
//   - update speedDisplay and pieceCount elements

// start() / stop() — same as main challenge

document.querySelector('#startBtn').addEventListener('click', () => start());
document.querySelector('#stopBtn').addEventListener('click', () => stop());

renderBoard(cells, boardData, activePiece);
document.querySelector('#speedDisplay').textContent = 'Speed: ' + speed + 'ms';`,
      solutionCode: `const COLS = 10, ROWS = 20;
const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];
function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape, x:Math.floor((COLS-4)/2), y:0 };
}
function createBoard() {
  const el = document.querySelector('#board'), cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const c = document.createElement('div'); c.className = 'cell';
    el.appendChild(c); cells.push(c);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS+(activePiece.x+c);
      if (idx >= 0 && idx < cells.length) cells[idx].style.background = activePiece.colour;
    }));
}
function wouldHitFloor(p) {
  return p.shape.some((row,r) => row.some((val,c) => val && p.y+r+1 >= ROWS));
}
function lockPiece(p, bd) {
  p.shape.forEach((row,r) => row.forEach((val,c) => { if (val) bd[p.y+r][p.x+c] = p.colour; }));
}
const boardData = Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
let intervalId = null, speed = 600, lockedCount = 0;

function restartLoop() {
  if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
  intervalId = setInterval(tick, speed);
}
function tick() {
  if (wouldHitFloor(activePiece)) {
    lockPiece(activePiece, boardData);
    lockedCount++;
    speed = Math.max(80, speed - 40);
    activePiece = spawnPiece();
    restartLoop();
  } else {
    activePiece.y += 1;
  }
  renderBoard(cells, boardData, activePiece);
  document.querySelector('#speedDisplay').textContent = 'Speed: ' + speed + 'ms';
  document.querySelector('#pieceCount').textContent = 'Locked: ' + lockedCount;
}
function start() { if (intervalId !== null) return; intervalId = setInterval(tick, speed); }
function stop() { if (intervalId === null) return; clearInterval(intervalId); intervalId = null; }
document.querySelector('#startBtn').addEventListener('click', () => start());
document.querySelector('#stopBtn').addEventListener('click', () => stop());
renderBoard(cells, boardData, activePiece);
document.querySelector('#speedDisplay').textContent = 'Speed: ' + speed + 'ms';`,
      check: (code) =>
        /speed\s*=\s*Math\.max/.test(code) &&
        /clearInterval/.test(code) &&
        /setInterval/.test(code),
      successMessage: `The game gets faster as pieces lock. clearInterval + new setInterval is the correct pattern for changing loop speed dynamically.`,
      failMessage: `To change the speed: clearInterval the old loop, update the speed variable, then setInterval with the new speed. Math.max(80, speed - 40) prevents it going faster than 80ms.`,
      outputHeight: 700,
    },

    // ─── SEED ─────────────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's what you have at the end of Lesson 3. Pieces spawn, fall, lock, and new pieces spawn. It's a game loop.

But try to control it. You can't. The piece falls wherever it wants.

In Lesson 4, we add \`addEventListener\` for keyboard input. Left, right, and down arrows will move the piece. Up arrow will rotate it. You'll finally be able to play.

Notice the structure of the code at this point:
- **Data:** PIECES, boardData, activePiece, intervalId, SPEED
- **Logic:** spawnPiece, tick, wouldHitFloor, lockPiece
- **Display:** createBoard, renderBoard
- **Control:** start, stop

Each group has one job. None of them know about the others' internal details. This separation is why adding keyboard controls in Lesson 4 won't require touching the game loop or the render function.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="info" style="color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.8;"></div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px;">
      <button id="startBtn">▶ Start</button>
      <button id="stopBtn">⏸ Stop</button>
    </div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;display:block;}`,
      startCode: `const COLS = 10;
const ROWS = 20;
const SPEED = 500;

const PIECES = [
  { name:'I', colour:'#00f0f0', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  { name:'O', colour:'#f0f000', shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'T', colour:'#a000f0', shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'S', colour:'#00f000', shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]] },
  { name:'Z', colour:'#f00000', shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'J', colour:'#0000f0', shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
  { name:'L', colour:'#f0a000', shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]] },
];

function spawnPiece() {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { name:t.name, colour:t.colour, shape:t.shape,
           x: Math.floor((COLS-4)/2), y: 0 };
}
function createBoard() {
  const el = document.querySelector('#board'), cells = [];
  for (let i = 0; i < ROWS*COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}
function renderBoard(cells, boardData, activePiece = null) {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      cells[row*COLS+col].style.background = boardData[row][col] || '';
  if (activePiece)
    activePiece.shape.forEach((sr, r) => sr.forEach((val, c) => {
      if (!val) return;
      const idx = (activePiece.y+r)*COLS+(activePiece.x+c);
      if (idx >= 0 && idx < cells.length)
        cells[idx].style.background = activePiece.colour;
    }));
}
function wouldHitFloor(piece) {
  return piece.shape.some((row, r) =>
    row.some((val, c) => val && piece.y + r + 1 >= ROWS)
  );
}
function lockPiece(piece, boardData) {
  piece.shape.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) boardData[piece.y + r][piece.x + c] = piece.colour;
    })
  );
}

// GAME STATE
const boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const cells = createBoard();
let activePiece = spawnPiece();
let intervalId = null;

function tick() {
  if (wouldHitFloor(activePiece)) {
    lockPiece(activePiece, boardData);
    activePiece = spawnPiece();
  } else {
    activePiece.y += 1;
  }
  renderBoard(cells, boardData, activePiece);
}

function start() {
  if (intervalId !== null) return;
  intervalId = setInterval(tick, SPEED);
}
function stop() {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

document.querySelector('#startBtn').addEventListener('click', start);
document.querySelector('#stopBtn').addEventListener('click', stop);

renderBoard(cells, boardData, activePiece);
document.querySelector('#info').innerHTML =
  'Lesson 3 complete.<br>Pieces fall and lock.<br><br>' +
  'Lesson 4 adds:<br>← → ↓ move piece<br>↑ rotate<br>' +
  'addEventListener<br>event.key';`,
      outputHeight: 660,
    },

  ],
};

export default {
  id: 'tetris-03-game-loop',
  slug: 'tetris-the-game-loop',
  chapter: 'tetris.1',
  order: 3,
  title: 'The Game Loop',
  subtitle: 'Make pieces fall automatically using setInterval — and learn the tick → update → render pattern',
  tags: ['javascript', 'setInterval', 'clearInterval', 'game-loop', 'state-management', 'async'],
  hook: {
    question: 'How does a game make things happen automatically, at regular intervals, without blocking everything else?',
    realWorldContext:
      'setInterval is the heartbeat of every browser game, animation, and polling system. The game loop pattern — tick, update, render, repeat — is used in every game engine ever written.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'setInterval(fn, ms) calls fn every ms milliseconds. clearInterval(id) stops it. Always save the ID.',
      'State lives outside the loop. The loop reads and updates it — it does not own it.',
      'Every tick: update state first, render second. Never render in the middle of an update.',
      'Guard start() against duplicates: if (intervalId !== null) return.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never Call setInterval Twice',
        body: 'Calling setInterval without first calling clearInterval creates a second loop running in parallel. The piece falls twice as fast and state becomes unpredictable. Always guard with if (intervalId !== null) return.',
      },
      {
        type: 'important',
        title: 'The Three-Step Tick',
        body: '1. Check if move is valid. 2. Update state (move or lock + spawn). 3. Render. This order is the same in every game loop in every language.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 3: The Game Loop',
        props: { lesson: LESSON_TETRIS_03 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'setInterval(fn, ms) → returns ID. clearInterval(id) → stops it.',
    'State lives outside the loop. Variables inside the callback reset every tick.',
    'Tick pattern: check validity → update state → render. Always in that order.',
    'intervalId = null means stopped. intervalId = a number means running.',
    'To change speed: clearInterval, update delay variable, new setInterval.',
    'wouldHitFloor checks if any filled cell would go past row ROWS-1.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};