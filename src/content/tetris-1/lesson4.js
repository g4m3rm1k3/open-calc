// LESSON_TETRIS_04.js
// Lesson 4 — Keyboard Control
// The problem: the piece falls but the player can't control it.
// Concepts: addEventListener, the event object, event.key,
//           event.preventDefault, pure movement functions,
//           event-driven vs loop-driven code coexisting.

const LESSON_TETRIS_04 = {
  title: 'Keyboard Control',
  subtitle: 'Wire up arrow keys to move and rotate the piece — and learn how event-driven code works alongside a game loop.',
  sequential: true,
  cells: [

    // ─── PART 1: RECAP ────────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Recap: What we built in Lesson 3

By the end of Lesson 3 you had a working game loop:

\`\`\`js
tick()   // one step: check floor → lock or move → render
start()  // setInterval(tick, SPEED) — guarded against duplicates
stop()   // clearInterval — sets intervalId = null
\`\`\`

And two key rules:

> **State lives outside the loop. The loop reads and updates it.**

> **Never call setInterval twice without clearInterval first.**

The pieces fall and lock. The board fills up. But you can't control anything.

---

## The problem we face now

The game runs itself. The player has no input.

Tetris needs four controls:
- **← left arrow** — move piece left one column
- **→ right arrow** — move piece right one column
- **↓ down arrow** — move piece down faster (soft drop)
- **↑ up arrow** — rotate the piece 90° clockwise

To make these work, we need to understand three things:
1. How do you run code when a specific key is pressed?
2. What information does the browser give you about the key event?
3. How do movement functions work — and why should they be pure?`,
    },

    // ─── RECAP CELL ───────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's the Lesson 3 result. Pieces fall and lock. Use the Start button.

Before moving on, make sure you can answer:
- What does \`tick()\` do if \`wouldHitFloor\` returns true?
- Why does \`start()\` check \`if (intervalId !== null) return\`?
- Why is \`activePiece\` declared outside \`tick()\`?`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div style="display:flex;flex-direction:column;gap:6px;">
    <button id="startBtn">▶ Start</button>
    <button id="stopBtn">⏸ Stop</button>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const COLS=10,ROWS=20,SPEED=500;
const PIECES=[
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function renderBoard(cells,boardData,activePiece=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(activePiece)activePiece.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(activePiece.y+r)*COLS+(activePiece.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=activePiece.colour;}));}
function wouldHitFloor(p){return p.shape.some((row,r)=>row.some((val,c)=>val&&p.y+r+1>=ROWS));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
function tick(){if(wouldHitFloor(activePiece)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}else{activePiece.y+=1;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
document.querySelector('#stopBtn').addEventListener('click',stop);
renderBoard(cells,boardData,activePiece);`,
      outputHeight: 640,
    },

    // ─── PART 2: addEventListener ─────────────────────────────────────────────

    {
      type: 'js',
      instruction: `\`addEventListener(eventType, handler)\` attaches a function to an element (or the document) that runs whenever the specified event occurs.

The syntax:

\`\`\`js
element.addEventListener('eventType', (event) => {
  // handler runs when the event fires
});
\`\`\`

Key properties:
- You can attach multiple listeners to the same element — they all run
- The handler receives an **event object** as its argument — it contains information about what happened
- \`document.addEventListener\` catches events anywhere on the page (useful for keyboard events)
- The listener runs through the **event loop** — same rules as setTimeout callbacks

Run the cell and click the boxes to see addEventListener in action.`,
      html: `<div id="demo" style="display:flex;gap:8px;">
  <div class="box" id="b1">Click me</div>
  <div class="box" id="b2">Click me</div>
  <div class="box" id="b3">Click me</div>
</div>
<div id="log"></div>`,
      css: `body{background:#0a1220;padding:14px;}
.box{width:90px;height:60px;border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:monospace;font-size:12px;transition:all .15s;}
.box:hover{border-color:#22d3ee;color:#22d3ee;}
.box.clicked{background:#082f49;border-color:#22d3ee;}
#log{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:10px;font-size:12px;line-height:1.8;margin-top:10px;min-height:60px;}`,
      startCode: `const log = document.querySelector('#log');
let clickCount = 0;

// Attach a listener to each box individually
['b1', 'b2', 'b3'].forEach(id => {
  document.querySelector('#' + id).addEventListener('click', (event) => {
    clickCount++;
    event.target.classList.add('clicked');  // event.target = the element clicked
    log.innerHTML =
      'Click #' + clickCount + '<br>' +
      'event.type: ' + event.type + '<br>' +
      'event.target.id: ' + event.target.id;
    console.log('Clicked:', event.target.id);
  });
});

// You can also listen on the parent — catches clicks on ANY child
document.querySelector('#demo').addEventListener('click', (event) => {
  console.log('Parent also received click on:', event.target.id);
});`,
      outputHeight: 200,
    },

    // ─── PART 3: KEYBOARD EVENTS AND event.key ────────────────────────────────

    {
      type: 'js',
      instruction: `Keyboard events fire on \`document\` (or any focused element). The most useful is \`keydown\` — fires when a key is pressed, repeats if held.

The event object for keyboard events has a \`key\` property — a string describing which key was pressed:
- Arrow keys: \`"ArrowLeft"\`, \`"ArrowRight"\`, \`"ArrowUp"\`, \`"ArrowDown"\`
- Letters: \`"a"\`, \`"b"\`, \`"Enter"\`, \`"Escape"\`, \`" "\` (space)

\`event.key\` is reliable across browsers. It's the property you want for game controls.

Two others exist but are less useful:
- \`event.code\` — physical key location (\`"KeyA"\`, \`"ArrowLeft"\`)
- \`event.keyCode\` — numeric code — **deprecated**, don't use it

Click the output area first so it has focus, then press keys.`,
      html: `<div id="keyDemo" tabindex="0">
  <div id="keyDisplay">Click here, then press any key</div>
  <div id="keyLog"></div>
</div>`,
      css: `body{background:#0a1220;padding:14px;}
#keyDemo{border:1px solid #334155;border-radius:8px;background:#111827;padding:14px;outline:none;cursor:pointer;}
#keyDemo:focus{border-color:#22d3ee;}
#keyDisplay{font-size:32px;font-weight:800;color:#22d3ee;font-family:monospace;text-align:center;margin-bottom:10px;min-height:44px;}
#keyLog{color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.8;}`,
      startCode: `const display = document.querySelector('#keyDisplay');
const log = document.querySelector('#keyLog');
const lines = [];

document.querySelector('#keyDemo').addEventListener('keydown', (event) => {
  display.textContent = event.key;

  const info = [
    'event.key:  "' + event.key + '"',
    'event.code: "' + event.code + '"',
    'event.repeat: ' + event.repeat,  // true if key is held down
  ];
  lines.unshift(info.join('   |   '));
  if (lines.length > 4) lines.pop();
  log.innerHTML = lines.join('<br>');
});

// For Tetris we listen on document so it always works
document.addEventListener('keydown', (event) => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
    console.log('Arrow key:', event.key);
  }
});`,
      outputHeight: 200,
    },

    // ─── PART 4: event.preventDefault ────────────────────────────────────────

    {
      type: 'js',
      instruction: `Arrow keys have default browser behaviour: they scroll the page.

In a game, you don't want the page to scroll when the player presses the arrow keys. \`event.preventDefault()\` cancels the default action.

Call it immediately inside the handler, before any game logic:

\`\`\`js
document.addEventListener('keydown', (event) => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
    event.preventDefault(); // stop page scroll
    // ... game logic
  }
});
\`\`\`

The rule: call \`preventDefault()\` only for keys you're handling. Don't cancel defaults globally — you'll break tab navigation, copy/paste, and other expected browser behaviour.`,
      html: `<div id="pdDemo">
  <p>This page has extra height so you can see scrolling.</p>
  <p style="margin-top:200px">Without preventDefault, arrow keys scroll here.</p>
  <p style="margin-top:200px">With preventDefault, they don't.</p>
  <div id="pdLog"></div>
</div>`,
      css: `body{background:#0a1220;padding:14px;font-family:monospace;color:#cbd5e1;font-size:13px;}
#pdLog{position:fixed;top:14px;right:14px;border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;padding:10px;font-size:12px;line-height:1.8;width:220px;}`,
      startCode: `const log = document.querySelector('#pdLog');
let prevented = 0, scrolled = 0;

window.addEventListener('scroll', () => {
  scrolled++;
  log.innerHTML = 'Scroll events: ' + scrolled + '<br>Keys prevented: ' + prevented;
});

document.addEventListener('keydown', (event) => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
    event.preventDefault();  // comment this out to see scrolling
    prevented++;
    log.innerHTML =
      'Key: ' + event.key + '<br>' +
      'Keys prevented: ' + prevented + '<br>' +
      'Scroll events: ' + scrolled;
  }
});

log.innerHTML = 'Press arrow keys...';`,
      outputHeight: 280,
    },

    // ─── PART 5: PURE MOVEMENT FUNCTIONS ─────────────────────────────────────

    {
      type: 'js',
      instruction: `Movement functions should be **pure** — they receive the current piece and return a new piece with the updated position. They don't mutate the original and they don't touch the DOM.

This design has two advantages:

1. **Testability** — you can call \`moveLeft(piece)\` and check the return value without a board or a DOM
2. **Safe validation** — you can compute the new position, check if it's valid, and only commit it if allowed. If the function mutated the piece directly, you'd have to un-mutate it on invalid moves.

The pattern for every movement:
\`\`\`js
const candidate = moveLeft(activePiece);   // compute new position
if (isValidPosition(candidate, boardData)) {  // check validity
  activePiece = candidate;                 // only commit if valid
}
renderBoard(...);
\`\`\`

We don't have full \`isValidPosition\` yet (Lesson 6). For now, we use basic boundary checks.`,
      html: `<div id="pureDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#pureDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:13px;line-height:1.9;}`,
      startCode: `// PURE movement functions — return new piece, don't mutate
function moveLeft(piece) {
  return { ...piece, x: piece.x - 1 };
}
function moveRight(piece) {
  return { ...piece, x: piece.x + 1 };
}
function moveDown(piece) {
  return { ...piece, y: piece.y + 1 };
}
function rotate(piece) {
  const N = piece.shape.length;
  const newShape = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      newShape[c][N - 1 - r] = piece.shape[r][c];
  return { ...piece, shape: newShape };
}

// The original piece is never changed
const piece = { x: 3, y: 5, colour: 'cyan',
  shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] };

const left  = moveLeft(piece);
const right = moveRight(piece);
const down  = moveDown(piece);
const rot   = rotate(piece);

document.querySelector('#pureDemo').innerHTML = [
  'Original:   x=' + piece.x + ', y=' + piece.y,
  'moveLeft:   x=' + left.x  + ', y=' + left.y,
  'moveRight:  x=' + right.x + ', y=' + right.y,
  'moveDown:   x=' + down.x  + ', y=' + down.y,
  '',
  'piece unchanged: x=' + piece.x + ' ← still 3',
  '',
  '// Spread creates a new object:',
  '{ ...piece, x: piece.x - 1 }',
  '// piece.x is still 3. left.x is 2.',
].join('<br>');`,
      outputHeight: 240,
    },

    // ─── PART 6: BOUNDARY CHECKING ────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Before committing a move, we need to check whether it's valid.

Full collision detection comes in Lesson 6. For now, we handle the two simplest cases:
- **Left wall:** no filled cell should have \`piece.x + col < 0\`
- **Right wall:** no filled cell should have \`piece.x + col >= COLS\`

The pattern: iterate every filled cell in the shape. For each one, compute its board position after the move. If any of them would be out of bounds, the move is invalid.

This is a **predicate function** — it returns \`true\` or \`false\` and has no side effects. You call it with the candidate position before committing.`,
      html: `<div id="boundDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#boundDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

// Basic boundary check — left/right walls and floor
// Full collision detection (including other pieces) comes in Lesson 6
function isWithinBounds(piece) {
  return piece.shape.every((row, r) =>
    row.every((val, c) => {
      if (!val) return true;          // empty cell — always ok
      const boardCol = piece.x + c;
      const boardRow = piece.y + r;
      return boardCol >= 0 &&         // not past left wall
             boardCol < COLS &&       // not past right wall
             boardRow < ROWS;         // not past floor
    })
  );
}

// Test cases
const piece = { x: 0, y: 5, colour: 'cyan',
  shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] };

const tests = [
  ['x=0 (valid)',   { ...piece, x: 0  }],
  ['x=-1 (invalid)',{ ...piece, x: -1 }],
  ['x=7 (valid)',   { ...piece, x: 7  }],
  ['x=8 (invalid)', { ...piece, x: 8  }],
  ['y=19 (valid)',  { ...piece, y: 19 }],
  ['y=20 (invalid)',{ ...piece, y: 20 }],
];

document.querySelector('#boundDemo').innerHTML =
  tests.map(([label, p]) =>
    (label + ':').padEnd(20) + isWithinBounds(p)
  ).join('<br>');

console.log('Boundary check ready. Full collision detection in Lesson 6.');`,
      outputHeight: 200,
    },

    // ─── PART 7: EVENT-DRIVEN + LOOP COEXISTING ───────────────────────────────

    {
      type: 'js',
      instruction: `The game loop and keyboard events run on the **same single thread**, managed by the same event loop.

They don't conflict — they take turns. When the interval fires, \`tick()\` runs to completion. Between ticks, keydown handlers can run. Both read and write the same \`activePiece\` object.

This coexistence works because JavaScript is single-threaded: only one piece of code runs at a time. There's no race condition between the game loop and the keyboard handler — they can't run simultaneously.

The practical consequence: keyboard input updates \`activePiece\` between ticks. When the next tick fires, it sees the updated position and renders from there. The two systems coordinate through shared state without ever communicating directly.`,
      html: `<div id="coexistVis"></div><div id="coexistLog"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#coexistVis{display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap;}
.cv{width:28px;height:28px;border-radius:4px;background:#1e293b;border:1px solid #334155;transition:all 0.08s;}
.cv.active{background:#22d3ee;border-color:#67e8f9;}
#coexistLog{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:10px;font-size:12px;line-height:1.8;}`,
      startCode: `// Game loop and keyboard events both update the same position variable.
// They never conflict — they take turns on the single thread.

const CELLS = 10;
let pos = 4;  // shared state

// Build the visual
const vis = document.querySelector('#coexistVis');
const cellEls = [];
for (let i = 0; i < CELLS; i++) {
  const el = document.createElement('div');
  el.className = 'cv';
  vis.appendChild(el);
  cellEls.push(el);
}

function render() {
  cellEls.forEach((el, i) => {
    el.classList.toggle('active', i === pos);
  });
}

const log = document.querySelector('#coexistLog');
function logMsg(msg) {
  log.innerHTML = msg + '<br>' + log.innerHTML.split('<br>').slice(0, 5).join('<br>');
}

// GAME LOOP: moves right every 1s (auto)
let tick = 0;
const loopId = setInterval(() => {
  tick++;
  pos = (pos + 1) % CELLS;
  render();
  logMsg('Loop tick #' + tick + ' → pos=' + pos);
}, 1000);

// KEYBOARD: left/right arrow moves immediately
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft')  { pos = Math.max(0, pos - 1); render(); logMsg('← key → pos=' + pos); }
  if (event.key === 'ArrowRight') { pos = Math.min(CELLS-1, pos + 1); render(); logMsg('→ key → pos=' + pos); }
});

render();
logMsg('Loop running. Press ← → keys to move independently.');`,
      outputHeight: 180,
    },

    // ─── PART 8: CHALLENGE ────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You've seen all the pieces:
- \`addEventListener('keydown', handler)\` — attach keyboard handling
- \`event.key\` — which key was pressed
- \`event.preventDefault()\` — stop arrow keys from scrolling
- Pure movement functions — return new piece, don't mutate
- Boundary checking — validate before committing
- Event loop coexistence — events and the loop share state safely

**Your job:** Add keyboard controls to the game.

You need to:
1. Implement \`moveLeft\`, \`moveRight\`, \`moveDown\`, and \`rotate\` as pure functions
2. Implement \`isWithinBounds\` to validate candidate positions
3. Wire up the \`keydown\` handler so each arrow key calls the right function, validates the result, and commits if valid

The game loop is already running. Your keyboard handler just updates \`activePiece\` — the next render call will pick it up automatically.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Wire up the keyboard.**

Complete four things:

**Pure movement functions** — \`moveLeft\`, \`moveRight\`, \`moveDown\`, \`rotateShape\`. Each takes the current piece and returns a new one. Use spread: \`{ ...piece, x: piece.x - 1 }\`.

**\`isWithinBounds(piece)\`** — returns true if every filled cell is within \`0 <= col < COLS\` and \`row < ROWS\`. Same pattern as the concept cell.

**\`keydown\` handler** — listen on \`document\`. For each arrow key:
- Call \`event.preventDefault()\`
- Compute the candidate: \`const candidate = moveLeft(activePiece)\`
- If \`isWithinBounds(candidate)\`, commit: \`activePiece = candidate\`
- Always call \`renderBoard\` after

**One special case for ↓:** If \`moveDown\` would go out of bounds (would hit floor), lock and spawn instead of just ignoring the key.

The test section verifies movement updates coordinates correctly.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="controls" style="color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.9;margin-bottom:10px;"></div>
    <button id="startBtn">▶ Start</button>
    <div id="status" style="margin-top:8px;color:#94a3b8;font-family:monospace;font-size:11px;max-width:180px;line-height:1.6;"></div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;display:block;}`,
      startCode: `const COLS=10, ROWS=20, SPEED=600;
const PIECES=[
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap)ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}
function wouldHitFloor(p){return p.shape.some((row,r)=>row.some((val,c)=>val&&p.y+r+1>=ROWS));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}

// ── YOUR CODE: PURE MOVEMENT FUNCTIONS ───────────────────────────────────────
// Return a new piece object with the updated property.
// Use spread: { ...piece, x: piece.x - 1 }

function moveLeft(piece) {
  // YOUR CODE HERE
}

function moveRight(piece) {
  // YOUR CODE HERE
}

function moveDown(piece) {
  // YOUR CODE HERE
}

function rotateShape(piece) {
  const N = piece.shape.length;
  const newShape = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      newShape[c][N - 1 - r] = piece.shape[r][c];
  return { ...piece, shape: newShape };
}

// ── YOUR CODE: BOUNDARY CHECK ────────────────────────────────────────────────
// Returns true if every filled cell is within bounds.
// Check: boardCol >= 0, boardCol < COLS, boardRow < ROWS

function isWithinBounds(piece) {
  // YOUR CODE HERE
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;

function tick(){
  if(wouldHitFloor(activePiece)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}
  else{activePiece.y+=1;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}

document.querySelector('#startBtn').addEventListener('click',()=>{
  start();
  document.querySelector('#controls').innerHTML =
    '← → move<br>↓ soft drop<br>↑ rotate<br>(click board area first)';
});

// ── YOUR CODE: KEYDOWN HANDLER ───────────────────────────────────────────────
// Listen on document for 'keydown'.
// Handle: ArrowLeft, ArrowRight, ArrowDown, ArrowUp
// For each: event.preventDefault(), compute candidate, check isWithinBounds,
//           commit if valid, always renderBoard after.
// Special case for ArrowDown: if candidate is out of bounds, lock + spawn instead.

document.addEventListener('keydown', (event) => {
  // YOUR CODE HERE
});

// ── TEST ──────────────────────────────────────────────────────────────────────
const status = document.querySelector('#status');
const results = [];

// Test moveLeft
const ml = typeof moveLeft === 'function' && moveLeft({ x:3, y:5, colour:'cyan', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] });
results.push('moveLeft:  ' + (ml && ml.x === 2 ? '✓' : '✗'));

// Test moveRight
const mr = typeof moveRight === 'function' && moveRight({ x:3, y:5, colour:'cyan', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] });
results.push('moveRight: ' + (mr && mr.x === 4 ? '✓' : '✗'));

// Test moveDown
const md = typeof moveDown === 'function' && moveDown({ x:3, y:5, colour:'cyan', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] });
results.push('moveDown:  ' + (md && md.y === 6 ? '✓' : '✗'));

// Test isWithinBounds
const ib1 = typeof isWithinBounds === 'function' &&
  isWithinBounds({ x:0, y:5, colour:'c', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] });
const ib2 = typeof isWithinBounds === 'function' &&
  !isWithinBounds({ x:-1, y:5, colour:'c', shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] });
results.push('bounds ok: ' + (ib1 && ib2 ? '✓' : '✗'));

const allPass = results.every(r => r.includes('✓'));
status.innerHTML = results.join('<br>');
status.style.color = allPass ? '#10b981' : '#f87171';

renderBoard(cells,boardData,activePiece);`,
      solutionCode: `const COLS=10,ROWS=20,SPEED=600;
const PIECES=[
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap)ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}
function wouldHitFloor(p){return p.shape.some((row,r)=>row.some((val,c)=>val&&p.y+r+1>=ROWS));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}

function moveLeft(piece){ return { ...piece, x: piece.x - 1 }; }
function moveRight(piece){ return { ...piece, x: piece.x + 1 }; }
function moveDown(piece){ return { ...piece, y: piece.y + 1 }; }
function rotateShape(piece){
  const N=piece.shape.length;
  const ns=Array.from({length:N},()=>Array(N).fill(0));
  for(let r=0;r<N;r++) for(let c=0;c<N;c++) ns[c][N-1-r]=piece.shape[r][c];
  return { ...piece, shape: ns };
}
function isWithinBounds(piece){
  return piece.shape.every((row,r)=>
    row.every((val,c)=>{
      if(!val) return true;
      const bc=piece.x+c, br=piece.y+r;
      return bc>=0 && bc<COLS && br<ROWS;
    })
  );
}

const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
function tick(){if(wouldHitFloor(activePiece)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}else{activePiece.y+=1;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
document.querySelector('#startBtn').addEventListener('click',()=>{start();document.querySelector('#controls').innerHTML='← → move<br>↓ soft drop<br>↑ rotate';});

document.addEventListener('keydown',(event)=>{
  const arrows=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'];
  if(!arrows.includes(event.key)) return;
  event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft')  candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight') candidate=moveRight(activePiece);
  if(event.key==='ArrowDown')  candidate=moveDown(activePiece);
  if(event.key==='ArrowUp')    candidate=rotateShape(activePiece);
  if(event.key==='ArrowDown' && !isWithinBounds(candidate)){
    lockPiece(activePiece,boardData);
    activePiece=spawnPiece();
  } else if(isWithinBounds(candidate)){
    activePiece=candidate;
  }
  renderBoard(cells,boardData,activePiece);
});

const status=document.querySelector('#status');
const ml=moveLeft({x:3,y:5,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]});
const mr=moveRight({x:3,y:5,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]});
const md=moveDown({x:3,y:5,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]});
const ib1=isWithinBounds({x:0,y:5,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]});
const ib2=!isWithinBounds({x:-1,y:5,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]});
const results=['moveLeft: '+(ml.x===2?'✓':'✗'),'moveRight: '+(mr.x===4?'✓':'✗'),'moveDown: '+(md.y===6?'✓':'✗'),'bounds ok: '+(ib1&&ib2?'✓':'✗')];
status.innerHTML=results.join('<br>');
status.style.color=results.every(r=>r.includes('✓'))?'#10b981':'#f87171';
renderBoard(cells,boardData,activePiece);`,
      check: (code) => {
        const hasMove =
          /function moveLeft/.test(code) &&
          /\.\.\.piece.*x.*piece\.x\s*-\s*1/.test(code);
        const hasBounds =
          /function isWithinBounds/.test(code) &&
          /bc\s*>=\s*0|boardCol\s*>=\s*0|piece\.x\s*\+/.test(code);
        const hasHandler =
          /addEventListener\s*\(\s*['"]keydown/.test(code) &&
          /ArrowLeft/.test(code) &&
          /preventDefault/.test(code) &&
          /renderBoard/.test(code);
        return hasMove && hasBounds && hasHandler;
      },
      successMessage: `The piece moves. You can play. The game loop handles gravity; the keyboard handler handles player input. Both share activePiece through the event loop — single thread, zero conflicts.`,
      failMessage: `Three things to check: (1) moveLeft returns {...piece, x: piece.x - 1} — pure, no mutation. (2) isWithinBounds checks every filled cell's boardCol >= 0 && < COLS && boardRow < ROWS. (3) The keydown handler calls preventDefault(), computes a candidate, validates with isWithinBounds, commits if valid, and always calls renderBoard.`,
      outputHeight: 700,
    },

    // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: Hard drop.**

Add a hard drop: pressing **Space** instantly drops the piece to the lowest valid position and locks it.

The algorithm:
1. Start from the current piece position
2. Keep calling \`moveDown\` until \`isWithinBounds\` returns false
3. The last valid position is the landing spot
4. Lock the piece there, spawn a new one

Add this to the existing keydown handler. Listen for \`event.key === ' '\` (space bar).`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="controls" style="color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.9;"></div>
    <button id="startBtn" style="margin-top:8px;">▶ Start</button>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const COLS=10,ROWS=20,SPEED=700;
const PIECES=[
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap)ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}
function wouldHitFloor(p){return p.shape.some((row,r)=>row.some((val,c)=>val&&p.y+r+1>=ROWS));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isWithinBounds(p){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS;}));}

const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
function tick(){if(wouldHitFloor(activePiece)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}else{activePiece.y+=1;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
document.querySelector('#startBtn').addEventListener('click',()=>{
  start();
  document.querySelector('#controls').innerHTML='← → move<br>↓ soft drop<br>↑ rotate<br>Space hard drop';
});

document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key)) return;
  event.preventDefault();

  let candidate;
  if(event.key==='ArrowLeft')  candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight') candidate=moveRight(activePiece);
  if(event.key==='ArrowDown')  candidate=moveDown(activePiece);
  if(event.key==='ArrowUp')    candidate=rotateShape(activePiece);

  if(event.key===' ') {
    // YOUR CODE HERE — hard drop
    // Keep calling moveDown until it goes out of bounds.
    // Lock the last valid position. Spawn a new piece.
    // Hint: let dropped = activePiece;
    //       while (isWithinBounds(moveDown(dropped))) { dropped = moveDown(dropped); }
    //       lockPiece(dropped, boardData); activePiece = spawnPiece();
  } else if(event.key==='ArrowDown' && !isWithinBounds(candidate)){
    lockPiece(activePiece,boardData);
    activePiece=spawnPiece();
  } else if(candidate && isWithinBounds(candidate)){
    activePiece=candidate;
  }

  renderBoard(cells,boardData,activePiece);
});

renderBoard(cells,boardData,activePiece);`,
      solutionCode: `const COLS=10,ROWS=20,SPEED=700;
const PIECES=[
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap)ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}
function wouldHitFloor(p){return p.shape.some((row,r)=>row.some((val,c)=>val&&p.y+r+1>=ROWS));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isWithinBounds(p){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS;}));}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
function tick(){if(wouldHitFloor(activePiece)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}else{activePiece.y+=1;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
document.querySelector('#startBtn').addEventListener('click',()=>{start();document.querySelector('#controls').innerHTML='← → move<br>↓ soft drop<br>↑ rotate<br>Space hard drop';});
document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key))return;
  event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft') candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight') candidate=moveRight(activePiece);
  if(event.key==='ArrowDown') candidate=moveDown(activePiece);
  if(event.key==='ArrowUp') candidate=rotateShape(activePiece);
  if(event.key===' '){
    let dropped=activePiece;
    while(isWithinBounds(moveDown(dropped))) dropped=moveDown(dropped);
    lockPiece(dropped,boardData);
    activePiece=spawnPiece();
  } else if(event.key==='ArrowDown'&&!isWithinBounds(candidate)){
    lockPiece(activePiece,boardData);activePiece=spawnPiece();
  } else if(candidate&&isWithinBounds(candidate)){
    activePiece=candidate;
  }
  renderBoard(cells,boardData,activePiece);
});
renderBoard(cells,boardData,activePiece);`,
      check: (code) =>
        /while\s*\(\s*isWithinBounds\s*\(\s*moveDown/.test(code) &&
        /lockPiece/.test(code) &&
        /spawnPiece/.test(code),
      successMessage: `Hard drop works. The while-loop pattern — keep going until the next step is invalid — is used everywhere in Tetris: hard drop, ghost piece, rotation kicks.`,
      failMessage: `The hard drop loop: let dropped = activePiece; while (isWithinBounds(moveDown(dropped))) { dropped = moveDown(dropped); } Then lock dropped and spawn a new piece.`,
      outputHeight: 700,
    },

    // ─── SEED ─────────────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's what you have at the end of Lesson 4. A playable Tetris game — pieces fall, you can move and rotate them, they lock when they hit the floor.

Play it. Notice what's still broken:
- Pieces phase through each other — no collision with locked pieces
- Lines never clear — the board fills up and the game continues anyway
- No score, no game over

Those are the next three lessons. But notice something first: the controls work even though we haven't touched \`tick()\`, \`renderBoard()\`, or any of the other functions. Adding keyboard input required only:
1. Four pure functions returning new positions
2. One boundary check function
3. One event listener

That's it. The architecture held. New features slot in without breaking existing ones.

Lesson 5: **Collision Detection** — the piece stops when it hits another piece.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="controls" style="color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.9;"></div>
    <button id="startBtn" style="margin-top:6px;">▶ Start</button>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const COLS=10,ROWS=20,SPEED=600;
const PIECES=[
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap)ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}

// Lesson 4 boundary check — walls and floor only
// Lesson 5 will upgrade this to also check locked pieces
function isWithinBounds(p){
  return p.shape.every((row,r)=>row.every((val,c)=>{
    if(!val)return true;
    const bc=p.x+c,br=p.y+r;
    return bc>=0&&bc<COLS&&br<ROWS;
  }));
}

const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;

function tick(){
  const candidate=moveDown(activePiece);
  if(!isWithinBounds(candidate)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}
  else{activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}

document.querySelector('#startBtn').addEventListener('click',()=>{
  start();
  document.querySelector('#controls').innerHTML=
    '← → move<br>↓ soft drop<br>↑ rotate<br>Space hard drop<br><br>Notice:<br>pieces phase<br>through each<br>other — Lesson 5<br>fixes this.';
});

document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key))return;
  event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft') candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight') candidate=moveRight(activePiece);
  if(event.key==='ArrowDown') candidate=moveDown(activePiece);
  if(event.key==='ArrowUp') candidate=rotateShape(activePiece);
  if(event.key===' '){
    let dropped=activePiece;
    while(isWithinBounds(moveDown(dropped))) dropped=moveDown(dropped);
    lockPiece(dropped,boardData); activePiece=spawnPiece();
  } else if(event.key==='ArrowDown'&&!isWithinBounds(candidate)){
    lockPiece(activePiece,boardData); activePiece=spawnPiece();
  } else if(candidate&&isWithinBounds(candidate)){
    activePiece=candidate;
  }
  renderBoard(cells,boardData,activePiece);
});

renderBoard(cells,boardData,activePiece);`,
      outputHeight: 660,
    },

  ],
};

export default {
  id: 'tetris-04-keyboard-control',
  slug: 'tetris-keyboard-control',
  chapter: 'tetris.4',
  order: 4,
  title: 'Keyboard Control',
  subtitle: 'Wire up arrow keys using addEventListener — and learn how event-driven code coexists with a game loop',
  tags: ['javascript', 'addEventListener', 'keydown', 'event-object', 'preventDefault', 'pure-functions', 'events'],
  hook: {
    question: 'How do you make code run when a specific key is pressed — and how does that coexist with a game loop already running?',
    realWorldContext:
      'Event-driven programming is how every user interface works. Buttons, keyboard shortcuts, mouse clicks — all addEventListener under the hood.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'addEventListener attaches a function to an event. The function runs each time the event fires.',
      'event.key gives you the key name as a string: "ArrowLeft", "ArrowRight", " " (space).',
      'event.preventDefault() stops the browser default — essential for arrow keys in a game.',
      'Movement functions are pure: they return a new piece, never mutate the original.',
      'The game loop and keyboard handler share activePiece through the event loop — single thread, no conflicts.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Try Before Commit',
        body: 'Compute the candidate position first. Validate it. Only assign activePiece = candidate if valid. Never move the piece and then check — you\'d have to undo.',
      },
      {
        type: 'tip',
        title: 'Pure Functions Enable Validation',
        body: 'Because movement functions return new objects without mutating, you can freely compute candidate positions, check them, and discard the ones that fail — at zero cost.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 4: Keyboard Control',
        props: { lesson: LESSON_TETRIS_04 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'addEventListener(type, handler) — attaches a function that runs on each event.',
    'event.key — string name of the key. ArrowLeft, ArrowRight, ArrowUp, ArrowDown, " ".',
    'event.preventDefault() — stops browser default behaviour for that event.',
    'Pure movement: { ...piece, x: piece.x - 1 }. Original unchanged. New object returned.',
    'Pattern: candidate = move(piece) → if (isWithinBounds(candidate)) activePiece = candidate.',
    'Game loop and keyboard handler share state through the event loop. No conflicts — single thread.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};