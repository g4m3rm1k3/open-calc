// LESSON_TETRIS_05.js
// Lesson 5 — Collision Detection
// The problem: pieces phase through each other. The floor check
// only tests walls and the bottom edge. It knows nothing about
// locked pieces already on the board.
// Concepts: predicate functions, the try→validate→commit pattern,
//           checking board cells, upgrading isValidPosition,
//           why the floor check and the locked-piece check are the same function.

const LESSON_TETRIS_05 = {
  title: 'Collision Detection',
  subtitle: 'Stop pieces from phasing through each other — by upgrading the validation function to check locked board cells.',
  sequential: true,
  cells: [

    // ─── PART 1: RECAP ────────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Recap: What we built in Lesson 4

By the end of Lesson 4 you had a controllable game:

\`\`\`js
moveLeft(piece)    // { ...piece, x: piece.x - 1 }
moveRight(piece)   // { ...piece, x: piece.x + 1 }
moveDown(piece)    // { ...piece, y: piece.y + 1 }
rotateShape(piece) // returns piece with shape rotated 90°

isWithinBounds(piece)  // checks walls and floor only

// keydown handler: candidate → validate → commit → render
\`\`\`

And one key principle:

> **Try before commit. Compute the candidate. Check it. Only assign if valid.**

The game is controllable. But there's a visible bug: pieces fall straight through locked pieces below them. Stack a few and watch them overlap.

---

## The problem we face now

\`isWithinBounds\` only checks three things:
- Is the piece past the left wall? (\`col < 0\`)
- Is the piece past the right wall? (\`col >= COLS\`)
- Is the piece past the floor? (\`row >= ROWS\`)

It knows nothing about the board. It has no idea that there are locked pieces already sitting there. So when the falling piece enters a cell that's already occupied, nothing stops it.

The fix is one function upgrade. We replace \`isWithinBounds\` with \`isValidPosition(piece, boardData)\` — which does everything \`isWithinBounds\` did, plus checks whether any cell the piece would occupy is already non-zero in \`boardData\`.

One extra argument. One extra condition. Everything else stays the same.`,
    },

    // ─── RECAP CELL ───────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's the Lesson 4 game. Start it and intentionally stack pieces on top of each other. Watch them phase through.

The bug is visible: pieces overlap locked cells as if they don't exist. Before moving on, understand exactly why — \`isWithinBounds\` checks coordinates against \`COLS\` and \`ROWS\`, but never looks at \`boardData[row][col]\`. It has no access to the board state.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="note" style="color:#f87171;font-family:monospace;font-size:11px;max-width:160px;line-height:1.7;border:1px solid #7f1d1d;border-radius:6px;padding:8px;background:#1c0a0a;margin-bottom:8px;">BUG: pieces phase through each other.<br><br>Stack some up to see it.</div>
    <button id="startBtn">▶ Start</button>
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
// BUG: checks walls/floor only, not locked pieces
function isWithinBounds(p){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS;}));}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
function tick(){const candidate=moveDown(activePiece);if(!isWithinBounds(candidate)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key))return;
  event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft') candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight') candidate=moveRight(activePiece);
  if(event.key==='ArrowDown') candidate=moveDown(activePiece);
  if(event.key==='ArrowUp') candidate=rotateShape(activePiece);
  if(event.key===' '){let dropped=activePiece;while(isWithinBounds(moveDown(dropped)))dropped=moveDown(dropped);lockPiece(dropped,boardData);activePiece=spawnPiece();}
  else if(event.key==='ArrowDown'&&!isWithinBounds(candidate)){lockPiece(activePiece,boardData);activePiece=spawnPiece();}
  else if(candidate&&isWithinBounds(candidate)){activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
});
renderBoard(cells,boardData,activePiece);`,
      outputHeight: 640,
    },

    // ─── PART 2: WHY THE BUG EXISTS ───────────────────────────────────────────

    {
      type: 'js',
      instruction: `The bug has one cause: \`isWithinBounds\` only receives the piece. It has no access to \`boardData\`.

Look at its signature:

\`\`\`js
function isWithinBounds(piece) { ... }
\`\`\`

It can check walls and floor because those are constants (\`COLS\`, \`ROWS\`). But to check locked pieces, it would need to look up \`boardData[row][col]\`. It doesn't have that.

The fix is to pass \`boardData\` as a second argument and rename the function to make the intent clear:

\`\`\`js
function isValidPosition(piece, boardData) { ... }
\`\`\`

Same logic as before, plus one extra condition: if \`boardData[boardRow][boardCol]\` is non-zero, that cell is occupied — the move is invalid.

Run the cell to see exactly what the board data looks like at the point where a collision should be detected.`,
      html: `<div id="whyDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#whyDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;

// Simulate a board with some locked pieces in row 18
const boardData = Array.from({ length: 20 }, () => Array(COLS).fill(0));
boardData[18][3] = 'cyan';
boardData[18][4] = 'cyan';
boardData[18][5] = 'cyan';
boardData[18][6] = 'cyan';

// A piece at y=16 trying to move to y=17
const piece = {
  x: 3, y: 16,
  shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]
};

// isWithinBounds — no boardData — MISSES the collision
function isWithinBounds(p) {
  return p.shape.every((row, r) =>
    row.every((val, c) => {
      if (!val) return true;
      return p.x + c >= 0 && p.x + c < COLS && p.y + r < 20;
    })
  );
}

// isValidPosition — HAS boardData — CATCHES the collision
function isValidPosition(p, bd) {
  return p.shape.every((row, r) =>
    row.every((val, c) => {
      if (!val) return true;
      const bc = p.x + c;
      const br = p.y + r;
      if (bc < 0 || bc >= COLS || br >= 20) return false;   // walls/floor
      if (bd[br][bc] !== 0) return false;                    // locked piece
      return true;
    })
  );
}

const candidate = { ...piece, y: piece.y + 1 }; // move to y=17

document.querySelector('#whyDemo').innerHTML = [
  'Board row 18: [' + boardData[18].map(v => v ? '■' : '·').join('') + ']',
  '',
  'Piece at y=16, moving to y=17',
  'Filled cells would land at rows: 17 and 18',
  '',
  'isWithinBounds(candidate):    ' + isWithinBounds(candidate) +
    '  ← WRONG: says valid',
  'isValidPosition(candidate, boardData): ' +
    isValidPosition(candidate, boardData) +
    '  ← CORRECT: detects collision',
  '',
  'The difference: isValidPosition checks boardData[br][bc] !== 0',
].join('<br>');`,
      outputHeight: 220,
    },

    // ─── PART 3: THE UPGRADED FUNCTION ────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here is the complete \`isValidPosition\` function. Read every line.

It checks three things for every filled cell in the piece's shape:
1. **Left wall:** \`boardCol >= 0\`
2. **Right wall:** \`boardCol < COLS\`
3. **Floor:** \`boardRow < ROWS\`
4. **Locked cell:** \`boardData[boardRow][boardCol] === 0\`

The first three existed in \`isWithinBounds\`. The fourth is new. That single condition — one extra \`&&\` — is the entire fix.

Notice the structure: we use \`every\` on both the outer array (rows) and the inner array (columns). The moment any filled cell fails any condition, \`every\` short-circuits and returns \`false\`. We never check more cells than necessary.

This function replaces \`isWithinBounds\` everywhere in the codebase. The game loop, the keyboard handler, the hard drop — all of them call this one function. One fix propagates everywhere.`,
      html: `<div id="fnDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#fnDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

function isValidPosition(piece, boardData) {
  return piece.shape.every((row, r) =>
    row.every((val, c) => {
      if (val === 0) return true;          // empty cell in shape — skip

      const boardCol = piece.x + c;
      const boardRow = piece.y + r;

      if (boardCol < 0)       return false; // left wall
      if (boardCol >= COLS)   return false; // right wall
      if (boardRow >= ROWS)   return false; // floor

      if (boardData[boardRow][boardCol] !== 0) return false; // locked piece

      return true;
    })
  );
}

// Test suite
const empty = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const filled = empty.map(r => [...r]);
filled[19][3] = 'cyan'; filled[19][4] = 'cyan';

const piece = {
  x: 3, y: 0,
  shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]
};

const tests = [
  ['Centre empty board',      { ...piece, x:3,  y:0  }, empty,  true ],
  ['Left wall (x=-1)',        { ...piece, x:-1, y:0  }, empty,  false],
  ['Right wall (x=8)',        { ...piece, x:8,  y:0  }, empty,  false],
  ['Floor (y=19)',            { ...piece, x:3,  y:19 }, empty,  false],
  ['Locked cell below',       { ...piece, x:3,  y:18 }, filled, false],
  ['One clear of locked',     { ...piece, x:3,  y:17 }, filled, true ],
];

document.querySelector('#fnDemo').innerHTML = tests.map(([label, p, bd, expected]) => {
  const result = isValidPosition(p, bd);
  const pass = result === expected;
  return (pass ? '✓' : '✗') + ' ' + label.padEnd(28) +
    ' → ' + result + (pass ? '' : ' (expected ' + expected + ')');
}).join('<br>');`,
      outputHeight: 220,
    },

    // ─── PART 4: EVERY VS SOME ────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `\`isValidPosition\` uses \`Array.every\`. Understanding when to use \`every\` versus \`some\` is important — they're opposite predicates and both appear throughout Tetris.

**\`array.every(fn)\`** — returns \`true\` if \`fn\` returns \`true\` for every element. Returns \`false\` as soon as any element fails. Use when you need all conditions to hold.

**\`array.some(fn)\`** — returns \`true\` if \`fn\` returns \`true\` for at least one element. Returns \`true\` as soon as any element passes. Use when you need at least one condition to hold.

In Tetris:
- \`isValidPosition\` uses \`every\` — all cells must be clear
- \`wouldHitFloor\` (Lesson 3) uses \`some\` — any cell past the floor is enough to trigger
- Line clearing (Lesson 6) uses \`every\` — every cell in a row must be filled

Both short-circuit: \`every\` stops at the first false, \`some\` stops at the first true. For a 4×4 shape matrix, at most 16 cells are checked — usually far fewer.`,
      html: `<div id="everyDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#everyDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.9;}`,
      startCode: `// every vs some — side by side

const cells = [0, 0, 'cyan', 0, 'red'];  // mixed row

// every: ALL must satisfy condition
const allFilled   = cells.every(v => v !== 0);  // false — some are 0
const allEmpty    = cells.every(v => v === 0);   // false — some are filled
const allValid    = cells.every((v, i) => i >= 0); // true — trivially

// some: AT LEAST ONE must satisfy
const anyFilled   = cells.some(v => v !== 0);   // true — cyan and red
const anyEmpty    = cells.some(v => v === 0);    // true — four zeros
const firstFilled = cells.findIndex(v => v !== 0); // 2

// Tetris usage examples
const fullRow    = ['cyan','red','blue','green','cyan','red','blue','green','cyan','red'];
const partialRow = ['cyan', 0,   'blue', 0,     'cyan', 0,   'blue', 0,    'cyan', 0  ];

document.querySelector('#everyDemo').innerHTML = [
  '// every — ALL cells must pass',
  'allFilled:          ' + allFilled,
  'allEmpty:           ' + allEmpty,
  '',
  '// some — ANY cell must pass',
  'anyFilled:          ' + anyFilled,
  'anyEmpty:           ' + anyEmpty,
  '',
  '// Tetris line-clear check:',
  'fullRow.every(v=>v!==0):     ' + fullRow.every(v => v !== 0) + '  ← clear this row',
  'partialRow.every(v=>v!==0):  ' + partialRow.every(v => v !== 0) + '  ← keep this row',
].join('<br>');`,
      outputHeight: 240,
    },

    // ─── PART 5: THE TICK FUNCTION UPDATE ─────────────────────────────────────

    {
      type: 'js',
      instruction: `With \`isValidPosition\` replacing \`isWithinBounds\`, the \`tick\` function needs one update: pass \`boardData\` as the second argument.

Before:
\`\`\`js
function tick() {
  const candidate = moveDown(activePiece);
  if (!isWithinBounds(candidate)) {
    lockPiece(activePiece, boardData);
    activePiece = spawnPiece();
  } else {
    activePiece = candidate;
  }
  renderBoard(cells, boardData, activePiece);
}
\`\`\`

After:
\`\`\`js
function tick() {
  const candidate = moveDown(activePiece);
  if (!isValidPosition(candidate, boardData)) {  // ← boardData added
    lockPiece(activePiece, boardData);
    activePiece = spawnPiece();
  } else {
    activePiece = candidate;
  }
  renderBoard(cells, boardData, activePiece);
}
\`\`\`

The keyboard handler gets the same update — every call to \`isWithinBounds\` becomes \`isValidPosition(candidate, boardData)\`.

That's the entire diff. One function, one extra argument, passed consistently everywhere it's called.`,
      html: `<div id="tickDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#tickDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:14px;font-size:13px;line-height:1.9;}`,
      startCode: `// Show exactly what changes between Lesson 4 and Lesson 5

const diff = [
  '  BEFORE (Lesson 4)              AFTER (Lesson 5)',
  '  ─────────────────────────────────────────────────────',
  '  isWithinBounds(piece)          isValidPosition(piece, boardData)',
  '',
  '  // In tick():',
  '  if (!isWithinBounds(          if (!isValidPosition(',
  '    candidate))                   candidate, boardData))',
  '',
  '  // In keydown handler:',
  '  if (!isWithinBounds(          if (!isValidPosition(',
  '    candidate))                   candidate, boardData))',
  '',
  '  // In hard drop loop:',
  '  while (isWithinBounds(        while (isValidPosition(',
  '    moveDown(dropped)))            moveDown(dropped), boardData))',
  '',
  '  // isWithinBounds removed.    // isValidPosition added.',
  '  // Used in 3 places.          // Used in the same 3 places.',
];

document.querySelector('#tickDemo').innerHTML = diff.join('<br>');
console.log('One function change. Propagates everywhere automatically.');`,
      outputHeight: 260,
    },

    // ─── PART 6: WHAT HAPPENS AT GAME OVER ───────────────────────────────────

    {
      type: 'js',
      instruction: `With collision detection working, a new situation arises: what happens when a piece spawns directly on top of locked pieces?

If the board fills up to the top, the newly spawned piece may immediately be in an invalid position — \`isValidPosition(spawnedPiece, boardData)\` returns false the moment it's created.

This is **game over**. The condition is simple to detect:

\`\`\`js
activePiece = spawnPiece();
if (!isValidPosition(activePiece, boardData)) {
  // game over — the spawn position is occupied
  stop();
}
\`\`\`

We're not building the full game over screen yet (that's Lesson 9). But we need to detect the condition and stop the loop — otherwise \`tick()\` will try to move an already-invalid piece and the game enters a broken state.

Add this check immediately after every \`spawnPiece()\` call.`,
      html: `<div id="goDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#goDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;
const ROWS = 20;

function isValidPosition(piece, boardData) {
  return piece.shape.every((row, r) =>
    row.every((val, c) => {
      if (val === 0) return true;
      const bc = piece.x + c, br = piece.y + r;
      if (bc < 0 || bc >= COLS || br >= ROWS) return false;
      if (boardData[br][bc] !== 0) return false;
      return true;
    })
  );
}

// Simulate a full board (rows 0-1 are full)
const boardData = Array.from({ length: ROWS }, (_, r) =>
  r < 2 ? Array(COLS).fill('red') : Array(COLS).fill(0)
);

// Spawn piece — it spawns at y=0, which is blocked
const newPiece = {
  x: Math.floor((COLS - 4) / 2), y: 0,
  colour: '#00f0f0',
  shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
};

const valid = isValidPosition(newPiece, boardData);

document.querySelector('#goDemo').innerHTML = [
  'Board rows 0-1: filled with locked pieces',
  'New piece spawns at y=0',
  '',
  'isValidPosition(newPiece, boardData): ' + valid,
  '',
  valid
    ? '→ Piece can spawn safely.'
    : '→ Spawn position blocked — GAME OVER.',
  '',
  '// In tick(), after lockPiece + spawnPiece:',
  'if (!isValidPosition(activePiece, boardData)) {',
  '  stop();  // halt the loop',
  '  // Lesson 9 adds the game over screen',
  '}',
].join('<br>');`,
      outputHeight: 240,
    },

    // ─── PART 7: CHALLENGE ────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You've seen everything you need:
- Why \`isWithinBounds\` misses locked pieces — it has no access to \`boardData\`
- The exact fix — \`isValidPosition(piece, boardData)\` adds one extra check: \`boardData[br][bc] !== 0\`
- Where the change propagates — \`tick()\`, the keyboard handler, the hard drop loop
- The game over detection — check \`isValidPosition\` immediately after every \`spawnPiece()\`

**Your job:**

1. Write \`isValidPosition(piece, boardData)\` — walls + floor + locked cell check
2. Replace every call to \`isWithinBounds\` with \`isValidPosition(piece, boardData)\`
3. Add game over detection after every \`spawnPiece()\` call

When it works, pieces will stack correctly. The game will actually be playable — pieces pile up, the board fills, and eventually the game stops.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Add collision detection.**

**\`isValidPosition(piece, boardData)\`**

Same structure as \`isWithinBounds\` but with one extra condition. For every filled cell in the shape, after checking walls and floor, check: \`if (boardData[boardRow][boardCol] !== 0) return false\`.

**Replace all three call sites:**
- In \`tick()\`: \`isValidPosition(candidate, boardData)\`
- In the keydown handler: \`isValidPosition(candidate, boardData)\`
- In the hard drop loop: \`isValidPosition(moveDown(dropped), boardData)\`

**Add game over check:**
After every \`activePiece = spawnPiece()\`, check \`isValidPosition(activePiece, boardData)\`. If false, call \`stop()\` and update the status display.

The auto-test verifies that \`isValidPosition\` correctly rejects a piece overlapping a locked cell.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div id="status" style="color:#94a3b8;font-family:monospace;font-size:11px;max-width:160px;line-height:1.6;margin-bottom:8px;"></div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:8px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:12px;text-align:center;">GAME OVER</div>
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap)ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}

// ── YOUR CODE: isValidPosition ────────────────────────────────────────────────
// Same as isWithinBounds but also checks boardData[boardRow][boardCol] !== 0
// Signature: isValidPosition(piece, boardData) → boolean

function isValidPosition(piece, boardData) {
  // YOUR CODE HERE
  // For every filled cell in piece.shape:
  //   const boardCol = piece.x + c;
  //   const boardRow = piece.y + r;
  //   Check: boardCol >= 0 && boardCol < COLS && boardRow < ROWS
  //   Check: boardData[boardRow][boardCol] === 0  ← NEW
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');

function handleGameOver(){
  stop();
  gameOverEl.style.display='block';
}

// ── YOUR CODE: tick ───────────────────────────────────────────────────────────
// Replace isWithinBounds → isValidPosition(candidate, boardData)
// After spawnPiece, check isValidPosition — call handleGameOver if false

function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){   // ← YOUR CHANGE: add boardData
    lockPiece(activePiece,boardData);
    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){  // ← YOUR ADDITION: game over check
      handleGameOver();
      return;
    }
  }else{
    activePiece=candidate;
  }
  renderBoard(cells,boardData,activePiece);
}

function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}

document.querySelector('#startBtn').addEventListener('click',start);

// ── YOUR CODE: keydown handler ────────────────────────────────────────────────
// Replace every isWithinBounds call with isValidPosition(candidate, boardData)

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
    // YOUR CHANGE: isValidPosition(moveDown(dropped), boardData)
    while(isValidPosition(moveDown(dropped),boardData)) dropped=moveDown(dropped);
    lockPiece(dropped,boardData);
    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);
    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else if(candidate&&isValidPosition(candidate,boardData)){
    activePiece=candidate;
  }
  renderBoard(cells,boardData,activePiece);
});

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
const status=document.querySelector('#status');
const testBoard=Array.from({length:ROWS},()=>Array(COLS).fill(0));
testBoard[2][3]='cyan'; testBoard[2][4]='cyan';
const pOk={x:3,y:0,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]};
const pCollide={x:3,y:1,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]};
const pWall={x:-1,y:0,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]};

try{
  const r1=isValidPosition(pOk,testBoard);
  const r2=isValidPosition(pCollide,testBoard);
  const r3=isValidPosition(pWall,testBoard);
  const pass=r1===true && r2===false && r3===false;
  status.innerHTML=
    'Clear position: '+(r1===true?'✓':'✗ (expected true)')+
    '<br>Locked cell: '+(r2===false?'✓':'✗ (expected false)')+
    '<br>Left wall: '+(r3===false?'✓':'✗ (expected false)');
  status.style.color=pass?'#10b981':'#f87171';
}catch(e){
  status.textContent='isValidPosition threw: '+e.message;
  status.style.color='#f87171';
}
renderBoard(cells,boardData,activePiece);`,
      solutionCode: `const COLS=10,ROWS=20,SPEED=500;
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
function isValidPosition(piece,boardData){
  return piece.shape.every((row,r)=>row.every((val,c)=>{
    if(val===0)return true;
    const bc=piece.x+c,br=piece.y+r;
    if(bc<0||bc>=COLS||br>=ROWS)return false;
    if(boardData[br][bc]!==0)return false;
    return true;
  }));
}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){stop();gameOverEl.style.display='block';}
function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);
    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else{activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
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
    while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);
    lockPiece(dropped,boardData);activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
});
const status=document.querySelector('#status');
const testBoard=Array.from({length:ROWS},()=>Array(COLS).fill(0));
testBoard[2][3]='cyan';testBoard[2][4]='cyan';
const pOk={x:3,y:0,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]};
const pCollide={x:3,y:1,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]};
const pWall={x:-1,y:0,colour:'c',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]};
const r1=isValidPosition(pOk,testBoard);
const r2=isValidPosition(pCollide,testBoard);
const r3=isValidPosition(pWall,testBoard);
const pass=r1===true&&r2===false&&r3===false;
status.innerHTML='Clear position: '+(r1===true?'✓':'✗')+'<br>Locked cell: '+(r2===false?'✓':'✗')+'<br>Left wall: '+(r3===false?'✓':'✗');
status.style.color=pass?'#10b981':'#f87171';
renderBoard(cells,boardData,activePiece);`,
      check: (code) => {
        const hasFn = /function isValidPosition\s*\(\s*piece\s*,\s*boardData\s*\)/.test(code);
        const checksBoard = /boardData\s*\[\s*b[rR]\s*\]\s*\[\s*b[cC]\s*\]/.test(code) ||
          /boardData\[.*\]\[.*\]\s*!==\s*0/.test(code);
        const usesInTick = /isValidPosition\s*\(\s*candidate\s*,\s*boardData\s*\)/.test(code);
        const hasGameOver = /isValidPosition\s*\(activePiece\s*,\s*boardData\s*\)/.test(code) &&
          /(handleGameOver|stop)\s*\(\s*\)/.test(code);
        return hasFn && checksBoard && usesInTick && hasGameOver;
      },
      successMessage: `Pieces stack. The game is genuinely playable now. One extra condition — boardData[br][bc] !== 0 — was all it took. This is what good architecture looks like: one small change fixes the behaviour everywhere.`,
      failMessage: `Three things: (1) isValidPosition must check boardData[boardRow][boardCol] !== 0 after the wall/floor checks. (2) Every call to isWithinBounds must become isValidPosition(piece, boardData). (3) After every spawnPiece(), check isValidPosition(activePiece, boardData) and call stop() if false.`,
      outputHeight: 700,
    },

    // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: Ghost piece.**

A ghost piece shows where the active piece will land if dropped. It renders as a faint outline below the active piece.

The algorithm — same as hard drop but render only:
1. Start from \`activePiece\`
2. Keep moving down while \`isValidPosition(moveDown(ghost), boardData)\` is true
3. Render the ghost at the final position with a semi-transparent colour

Add a third pass to \`renderBoard\` that draws the ghost. The ghost should only show if it's in a different row than the active piece (don't draw the ghost on top of the piece itself).

Hint: pass the ghost piece as an additional argument to renderBoard, or compute it inside renderBoard.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:8px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:12px;text-align:center;">GAME OVER</div>
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
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}

// YOUR CODE: compute the ghost piece position
function getGhost(piece, boardData) {
  // Start from the current piece.
  // Keep moving down while isValidPosition(moveDown(ghost), boardData) is true.
  // Return the final ghost piece.
}

// YOUR CODE: update renderBoard to draw the ghost
// Render order: 1) boardData, 2) ghost (faint), 3) active piece (solid)
// Use a semi-transparent colour for the ghost: piece.colour + '44' (hex alpha)
// Only draw ghost if ghost.y !== activePiece.y
function renderBoard(cells, boardData, activePiece=null) {
  for(let r=0;r<ROWS;r++)
    for(let c=0;c<COLS;c++)
      cells[r*COLS+c].style.background=boardData[r][c]||'';

  // YOUR CODE: draw ghost here (before active piece)

  if(activePiece)
    activePiece.shape.forEach((sr,r)=>sr.forEach((val,c)=>{
      if(!val)return;
      const idx=(activePiece.y+r)*COLS+(activePiece.x+c);
      if(idx>=0&&idx<cells.length)cells[idx].style.background=activePiece.colour;
    }));
}

const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){stop();gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key))return;
  event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft') candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight') candidate=moveRight(activePiece);
  if(event.key==='ArrowDown') candidate=moveDown(activePiece);
  if(event.key==='ArrowUp') candidate=rotateShape(activePiece);
  if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
});
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
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function getGhost(piece,boardData){let ghost=piece;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);return ghost;}
function renderBoard(cells,boardData,activePiece=null){
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';
  if(activePiece){
    const ghost=getGhost(activePiece,boardData);
    if(ghost.y!==activePiece.y)
      ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{
        if(!val)return;
        const idx=(ghost.y+r)*COLS+(ghost.x+c);
        if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';
      }));
    activePiece.shape.forEach((sr,r)=>sr.forEach((val,c)=>{
      if(!val)return;
      const idx=(activePiece.y+r)*COLS+(activePiece.x+c);
      if(idx>=0&&idx<cells.length)cells[idx].style.background=activePiece.colour;
    }));
  }
}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){stop();gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key))return;event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight')candidate=moveRight(activePiece);
  if(event.key==='ArrowDown')candidate=moveDown(activePiece);
  if(event.key==='ArrowUp')candidate=rotateShape(activePiece);
  if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
});
renderBoard(cells,boardData,activePiece);`,
      check: (code) =>
        /function getGhost/.test(code) &&
        /while\s*\(\s*isValidPosition\s*\(\s*moveDown/.test(code) &&
        /colour.*\+.*'44'|colour.*44/.test(code),
      successMessage: `Ghost piece works. The same while-loop pattern from hard drop, now used for display only. The faint colour is piece.colour + '44' — appending a hex alpha value to a hex colour string.`,
      failMessage: `getGhost: let ghost = piece; while (isValidPosition(moveDown(ghost), boardData)) ghost = moveDown(ghost); return ghost. Then in renderBoard, draw the ghost before the active piece using ghost.colour + '44' as the background.`,
      outputHeight: 700,
    },

    // ─── SEED ─────────────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's what you have at the end of Lesson 5. Pieces stack. Collision works. The game is genuinely playable for the first time.

But play it long enough and you'll notice: lines never clear. You fill the board row by row. Eventually you hit the top and get game over — but nothing ever clears.

Real Tetris rewards the player for completing rows. Completing four at once — a Tetris — is the highest reward. Lines clearing is what makes the game a game rather than a box-stacking exercise.

Lesson 6: **Line Clearing** — \`array.every\`, \`filter\`, and \`unshift\`.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div style="color:#94a3b8;font-family:monospace;font-size:11px;line-height:1.7;max-width:160px;margin-bottom:8px;">
      Pieces stack correctly now.<br><br>
      Fill the board — notice lines never clear.<br><br>
      That's Lesson 6.
    </div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:8px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:12px;text-align:center;">GAME OVER</div>
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
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';
  if(ap){
    let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);
    if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));
    ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));
  }
}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){stop();gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{
  const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!handled.includes(event.key))return;event.preventDefault();
  let candidate;
  if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);
  if(event.key==='ArrowRight')candidate=moveRight(activePiece);
  if(event.key==='ArrowDown')candidate=moveDown(activePiece);
  if(event.key==='ArrowUp')candidate=rotateShape(activePiece);
  if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
});
renderBoard(cells,boardData,activePiece);`,
      outputHeight: 660,
    },

  ],
};

export default {
  id: 'tetris-05-collision-detection',
  slug: 'tetris-collision-detection',
  chapter: 'tetris.5',
  order: 5,
  title: 'Collision Detection',
  subtitle: 'Stop pieces phasing through each other — upgrade isWithinBounds to isValidPosition by checking the board',
  tags: ['javascript', 'collision-detection', 'array-methods', 'every', 'some', 'predicate-functions', 'game-logic'],
  hook: {
    question: 'How do you detect when a moving piece would overlap something that\'s already there?',
    realWorldContext:
      'Collision detection is the foundation of every game. The same predicate-function pattern — compute candidate, validate, commit or reject — appears in physics engines, pathfinding, UI drag-and-drop, and form validation.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'isWithinBounds checked walls and floor. It had no access to boardData — so it could not detect locked pieces.',
      'isValidPosition(piece, boardData) adds one condition: boardData[boardRow][boardCol] !== 0.',
      'One extra argument. One extra check. Propagated to three call sites. The bug is fixed.',
      'After every spawnPiece, check isValidPosition — if false, the board is full: game over.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'One Change, Three Call Sites',
        body: 'tick(), the keydown handler, and the hard drop loop all called isWithinBounds. All three become isValidPosition(piece, boardData). Good architecture means one fix propagates everywhere.',
      },
      {
        type: 'tip',
        title: 'every vs some',
        body: 'isValidPosition uses every — ALL cells must be clear. wouldHitFloor used some — ANY cell past the floor is enough. Know which you need before you write the loop.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 5: Collision Detection',
        props: { lesson: LESSON_TETRIS_05 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'isValidPosition(piece, boardData) — walls + floor + locked cell check.',
    'boardData[boardRow][boardCol] !== 0 means that cell is occupied.',
    'every short-circuits on the first false. some short-circuits on the first true.',
    'After spawnPiece, always check isValidPosition — false means game over.',
    'The ghost piece uses the same while-isValidPosition-moveDown loop as hard drop.',
    'One function. Three call sites. One change fixes the behaviour everywhere.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};