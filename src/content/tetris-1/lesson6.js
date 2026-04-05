// LESSON_TETRIS_06.js
// Lesson 6 — Line Clearing
// The problem: the board fills up and nothing clears. Lines need
// to disappear when every cell in a row is filled, and the rows
// above need to fall down to fill the gap.
// Concepts: array.every, array.filter, array.unshift,
//           score calculation, the Tetris scoring system.

const LESSON_TETRIS_06 = {
  title: 'Line Clearing',
  subtitle: 'Clear complete rows, drop everything above, and track score — using filter, every, and unshift.',
  sequential: true,
  cells: [

    // ─── PART 1: RECAP ────────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Recap: What we built in Lesson 5

By the end of Lesson 5 you had a fully collision-aware game:

\`\`\`js
isValidPosition(piece, boardData)
// checks: left wall, right wall, floor, AND locked cells
// one extra argument, one extra condition, bug fixed everywhere
\`\`\`

And one important new rule:

> **After every spawnPiece(), check isValidPosition. If false: game over.**

Pieces stack correctly. The game is playable.

---

## The problem we face now

Play the Lesson 5 game long enough and the board fills up completely. Nothing ever clears. You just lose.

Real Tetris works differently: when every cell in a row is filled, that row disappears. Every row above it drops down one position. You get points. The game continues.

This is the mechanic that makes Tetris a game rather than a box-stacking exercise. Without line clearing, there's no reward, no tension, no reason to play carefully.

To implement it we need three array operations working together:
- \`array.every\` — detect a full row
- \`array.filter\` — remove full rows from boardData  
- \`array.unshift\` — add empty rows at the top to replace them

All three are standard JavaScript array methods. None require loops. Together they implement line clearing in about five lines of code.`,
    },

    // ─── RECAP CELL ───────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's the Lesson 5 game. Play it until the board fills. Notice lines don't clear — the board just fills up until game over.

Before continuing: look at \`tick()\`. After \`lockPiece\`, the locked piece is written into \`boardData\` and a new piece spawns. That's where line clearing needs to happen — right after \`lockPiece\`, before the next piece spawns.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div>
    <div style="color:#f87171;font-family:monospace;font-size:11px;max-width:150px;line-height:1.6;border:1px solid #7f1d1d;border-radius:6px;padding:8px;background:#1c0a0a;margin-bottom:8px;">Lines never clear.<br><br>Fill the board and watch it top out with no reward.</div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:8px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:11px;text-align:center;">GAME OVER</div>
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
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
document.addEventListener('keydown',(event)=>{const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!handled.includes(event.key))return;event.preventDefault();let candidate;if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);if(event.key==='ArrowRight')candidate=moveRight(activePiece);if(event.key==='ArrowDown')candidate=moveDown(activePiece);if(event.key==='ArrowUp')candidate=rotateShape(activePiece);if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}renderBoard(cells,boardData,activePiece);});
renderBoard(cells,boardData,activePiece);`,
      outputHeight: 640,
    },

    // ─── PART 2: DETECTING A FULL ROW ────────────────────────────────────────

    {
      type: 'js',
      instruction: `A row is full when every cell in it is non-zero. \`Array.every\` tests this in one expression.

\`\`\`js
const isFullRow = row.every(cell => cell !== 0);
\`\`\`

\`every\` returns \`true\` if the callback returns \`true\` for every element. The moment it finds a \`0\` (empty cell), it returns \`false\` immediately — it doesn't check the rest of the row.

This is exactly the same \`every\` used in \`isValidPosition\`. The pattern is identical: iterate cells, test a condition, short-circuit on the first failure.

Run the cell to see the detection working on several sample rows.`,
      html: `<div id="rowDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#rowDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;

const rows = [
  Array(COLS).fill('cyan'),                              // completely full
  ['cyan','red',0,'blue','cyan','red','blue','cyan','red','blue'], // one gap
  Array(COLS).fill(0),                                   // completely empty
  ['cyan','red','blue','green','cyan','red','blue','green','cyan','red'], // full, mixed colours
];

const labels = [
  'All filled  ',
  'One gap     ',
  'All empty   ',
  'Full, mixed ',
];

document.querySelector('#rowDemo').innerHTML = rows.map((row, i) => {
  const full = row.every(cell => cell !== 0);
  const visual = row.map(v => v ? '■' : '·').join('');
  return labels[i] + '[' + visual + ']  full? ' + full;
}).join('<br>');

console.log('A row is full when every(cell => cell !== 0) returns true.');`,
      outputHeight: 180,
    },

    // ─── PART 3: FILTER TO REMOVE FULL ROWS ──────────────────────────────────

    {
      type: 'js',
      instruction: `Once we can detect full rows, we need to remove them from \`boardData\`.

\`Array.filter\` creates a new array containing only the elements for which the callback returns \`true\`. Elements where the callback returns \`false\` are excluded.

\`\`\`js
const remaining = boardData.filter(row => row.some(cell => cell !== 0 || ...));
\`\`\`

More precisely — we keep rows that are NOT full:

\`\`\`js
const remaining = boardData.filter(row => !row.every(cell => cell !== 0));
// Keep rows that are not full (i.e. have at least one empty cell)
\`\`\`

\`filter\` returns a new array. It does not mutate \`boardData\`. The original is unchanged until we reassign.

This is the key insight: \`filter\` removes the cleared rows AND automatically handles the "rows above fall down" requirement — because after filtering, the remaining rows are already in the correct order. Nothing explicit needs to "fall."`,
      html: `<div id="filterDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#filterDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;

// Simulate a small board (6 rows) with rows 3 and 5 full
const board = [
  Array(COLS).fill(0),                      // row 0: empty
  ['cyan',0,0,'red',0,0,0,'blue',0,0],      // row 1: partial
  [0,0,'red',0,'cyan',0,'blue',0,0,0],      // row 2: partial
  Array(COLS).fill('cyan'),                  // row 3: FULL → clear
  ['red',0,'blue',0,'cyan',0,0,'red',0,0],  // row 4: partial
  Array(COLS).fill('red'),                   // row 5: FULL → clear
];

// Count full rows before filtering
const fullCount = board.filter(row => row.every(v => v !== 0)).length;

// Remove full rows — keep only rows that are NOT full
const remaining = board.filter(row => !row.every(v => v !== 0));

document.querySelector('#filterDemo').innerHTML = [
  'Before: ' + board.length + ' rows, ' + fullCount + ' full',
  'After filter: ' + remaining.length + ' rows remain',
  '',
  'Before:          After:',
  ...board.map((row, i) => {
    const full = row.every(v => v !== 0);
    const vis = row.map(v => v ? '■' : '·').join('');
    const kept = remaining.includes(row);
    return 'row ' + i + ': [' + vis + '] ' + (full ? '← CLEARED' : '← kept');
  }),
  '',
  '// Rows above cleared rows automatically "fall" because',
  '// filter preserves order — no explicit drop needed.',
].join('<br>');`,
      outputHeight: 280,
    },

    // ─── PART 4: UNSHIFT TO ADD EMPTY ROWS ───────────────────────────────────

    {
      type: 'js',
      instruction: `After filtering, \`boardData\` has fewer rows than \`ROWS\`. We need to add empty rows at the top to keep it at 20 rows.

\`Array.unshift\` adds one or more elements to the **beginning** of an array, in place. It's the opposite of \`push\` (which adds to the end).

\`\`\`js
boardData.unshift(Array(COLS).fill(0)); // add one empty row at top
\`\`\`

If we cleared N lines, we need to call \`unshift\` N times — once for each cleared row.

The full sequence:
1. \`filter\` to remove full rows (returns new array, shorter than ROWS)
2. Count how many were removed: \`cleared = ROWS - remaining.length\`
3. Loop \`cleared\` times, calling \`unshift(Array(COLS).fill(0))\` each time

After this, \`boardData\` is back to 20 rows, with empty rows at the top and existing rows shifted down.`,
      html: `<div id="unshiftDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#unshiftDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;
const ROWS = 6; // small for demo

// Board with 2 full rows
let board = [
  ['r',0,0,'b',0,0,0,'g',0,0],
  Array(COLS).fill('cyan'),    // full
  [0,0,'r',0,'c',0,'b',0,0,0],
  ['r',0,'b',0,'c',0,0,'r',0,0],
  Array(COLS).fill('red'),     // full
  [0,0,0,'b',0,0,'r',0,0,0],
];

const before = board.map(r => r.map(v=>v?'■':'·').join('')).join(' | ');

// STEP 1: filter out full rows
board = board.filter(row => !row.every(v => v !== 0));
const cleared = ROWS - board.length;

// STEP 2: add empty rows at top
for (let i = 0; i < cleared; i++) {
  board.unshift(Array(COLS).fill(0));
}

const after = board.map(r => r.map(v=>v?'■':'·').join('')).join(' | ');

document.querySelector('#unshiftDemo').innerHTML = [
  'Before (' + ROWS + ' rows): ' + before,
  '',
  'After filter: ' + (ROWS - cleared) + ' rows, ' + cleared + ' cleared',
  'After unshift: ' + board.length + ' rows (back to ' + ROWS + ')',
  '',
  'After:         ' + after,
  '',
  '// Empty rows added at TOP (unshift)',
  '// Existing rows shifted DOWN (automatic — they were always in order)',
  '// cleared = ' + cleared,
].join('<br>');`,
      outputHeight: 220,
    },

    // ─── PART 5: THE clearLines FUNCTION ─────────────────────────────────────

    {
      type: 'js',
      instruction: `Now we put it together. The complete \`clearLines\` function:

\`\`\`js
function clearLines(boardData) {
  const before = boardData.length;
  
  // Keep only rows that are NOT full
  const remaining = boardData.filter(
    row => !row.every(cell => cell !== 0)
  );
  
  const cleared = before - remaining.length;
  
  // Add empty rows at the top to replace cleared ones
  for (let i = 0; i < cleared; i++) {
    remaining.unshift(Array(COLS).fill(0));
  }
  
  // Copy back into the original array (mutate in place)
  for (let r = 0; r < COLS; r++) {
    boardData[r] = remaining[r];
  }
  
  return cleared; // how many lines were cleared
}
\`\`\`

It returns \`cleared\` — the count of lines removed. This is used for scoring.

Note: we copy back into the original array rather than replacing it. This keeps all existing references to \`boardData\` valid — the \`cells\` array, \`renderBoard\`, \`isValidPosition\` all hold a reference to the same \`boardData\` object. If we replaced it with a new object, they'd be pointing at the old one.`,
      html: `<div id="clDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#clDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;
const ROWS = 8; // small for demo

function clearLines(boardData) {
  const remaining = boardData.filter(
    row => !row.every(cell => cell !== 0)
  );
  const cleared = boardData.length - remaining.length;
  for (let i = 0; i < cleared; i++) {
    remaining.unshift(Array(COLS).fill(0));
  }
  // Copy back in place so existing references stay valid
  for (let r = 0; r < boardData.length; r++) {
    boardData[r] = remaining[r];
  }
  return cleared;
}

// Test
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
board[5] = Array(COLS).fill('cyan');  // full
board[6] = Array(COLS).fill('red');   // full
board[7] = ['r',0,'b',0,'c',0,'g',0,'r',0]; // partial

const snapshot = board.map(r => r.map(v=>v?'■':'·').join(''));
const cleared = clearLines(board);

document.querySelector('#clDemo').innerHTML = [
  'Before:',
  ...snapshot.map((r, i) => '  row ' + i + ': [' + r + ']'),
  '',
  'clearLines returned: ' + cleared,
  '',
  'After:',
  ...board.map((r, i) => '  row ' + i + ': [' + r.map(v=>v?'■':'·').join('') + ']'),
].join('<br>');`,
      outputHeight: 280,
    },

    // ─── PART 6: SCORING ─────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Clearing lines earns points. The original Tetris scoring system rewards clearing multiple lines at once:

| Lines cleared | Points (×level) |
|---|---|
| 1 | 100 |
| 2 | 300 |
| 3 | 500 |
| 4 | 800 |

Clearing four lines at once — a **Tetris** — is worth 800 points × level, not 400 (4 × 100). The non-linear scoring rewards the skill of setting up four-line clears.

Level increases every 10 lines. The game speeds up with each level.

\`\`\`js
const SCORE_TABLE = [0, 100, 300, 500, 800];
function calcScore(linesCleared, level) {
  return SCORE_TABLE[linesCleared] * level;
}
\`\`\`

We store \`score\`, \`lines\`, and \`level\` as top-level variables. After each \`clearLines\` call, we update all three and re-render the score display.`,
      html: `<div id="scoreDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#scoreDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `const SCORE_TABLE = [0, 100, 300, 500, 800];

function calcScore(linesCleared, level) {
  return (SCORE_TABLE[linesCleared] || 0) * level;
}

// Simulate a game sequence
let score = 0;
let lines = 0;
let level = 1;
const log = [];

function simulateClear(cleared) {
  const points = calcScore(cleared, level);
  score += points;
  lines += cleared;
  level = Math.floor(lines / 10) + 1;
  log.push(
    'Cleared ' + cleared + ' line' + (cleared > 1 ? 's' : '') +
    ' → +' + points + ' pts' +
    ' | total: ' + score +
    ' | lines: ' + lines +
    ' | level: ' + level
  );
}

simulateClear(1);   // single
simulateClear(2);   // double
simulateClear(1);   // single
simulateClear(4);   // Tetris!
simulateClear(3);   // triple
simulateClear(1);   // single — now level 2
simulateClear(4);   // Tetris at level 2 → 1600pts

document.querySelector('#scoreDemo').innerHTML = log.join('<br>');`,
      outputHeight: 200,
    },

    // ─── PART 7: WHERE clearLines LIVES IN THE LOOP ──────────────────────────

    {
      type: 'js',
      instruction: `Line clearing happens in \`tick()\`, immediately after \`lockPiece\` and before the game over check.

The sequence:

\`\`\`js
function tick() {
  const candidate = moveDown(activePiece);
  if (!isValidPosition(candidate, boardData)) {
    lockPiece(activePiece, boardData);     // 1. lock the piece
    
    const cleared = clearLines(boardData); // 2. clear full rows
    if (cleared > 0) updateScore(cleared); // 3. update score
    
    activePiece = spawnPiece();            // 4. spawn next piece
    if (!isValidPosition(activePiece, boardData)) {
      handleGameOver(); return;            // 5. check game over
    }
  } else {
    activePiece = candidate;
  }
  renderBoard(cells, boardData, activePiece);
}
\`\`\`

The order matters: clear lines from the locked state before spawning a new piece. If you spawned first and cleared second, the new piece could start inside a row that was about to clear.

This is a good example of why the ordering of operations in a game loop matters — the sequence of steps determines the game's behaviour.`,
      html: `<div id="orderDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#orderDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:14px;font-size:13px;line-height:2;}`,
      startCode: `document.querySelector('#orderDemo').innerHTML = [
  'tick() sequence when a piece can\'t fall further:',
  '',
  '  1. lockPiece(activePiece, boardData)',
  '     └── writes piece colours into boardData',
  '',
  '  2. cleared = clearLines(boardData)    ← NEW',
  '     └── removes full rows, adds empty rows at top',
  '     └── returns count of cleared rows',
  '',
  '  3. if (cleared > 0) updateScore(cleared)  ← NEW',
  '     └── adds points, increments lines + level',
  '',
  '  4. activePiece = spawnPiece()',
  '     └── new piece appears at top',
  '',
  '  5. if (!isValidPosition(activePiece, boardData))',
  '     └── game over check',
  '',
  '// Why this order? Clear BEFORE spawning.',
  '// If you spawn first, the new piece might overlap',
  '// a row that clearLines would then delete.',
].join('<br>');`,
      outputHeight: 300,
    },

    // ─── PART 8: CHALLENGE ────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You have all the pieces:
- \`row.every(cell => cell !== 0)\` — detect a full row
- \`boardData.filter(row => !row.every(...))\` — remove full rows
- \`remaining.unshift(Array(COLS).fill(0))\` — add empty rows at top
- \`SCORE_TABLE[cleared] * level\` — scoring formula
- The exact position in \`tick()\` where clearing happens

**Your job:**

1. Implement \`clearLines(boardData)\` — filter, count, unshift, copy back, return count
2. Implement \`updateScore(cleared)\` — adds points, updates lines, recalculates level
3. Update \`tick()\` to call both after \`lockPiece\`
4. Display score, lines, and level in the UI

The test section verifies \`clearLines\` against a known board state.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Clear lines and track score.**

**\`clearLines(boardData)\`**
- Filter out rows where \`row.every(cell => cell !== 0)\`
- Count how many were removed
- \`unshift\` that many empty rows at the beginning
- Copy back into \`boardData\` (mutate in place)
- Return the count

**\`updateScore(cleared)\`**
- Use \`SCORE_TABLE = [0, 100, 300, 500, 800]\`
- \`score += SCORE_TABLE[cleared] * level\`
- \`lines += cleared\`
- \`level = Math.floor(lines / 10) + 1\`
- Update the score/lines/level display elements

**In \`tick()\`**
- After \`lockPiece\`, call \`clearLines\`
- If cleared > 0, call \`updateScore\`

The auto-test verifies your \`clearLines\` removes full rows and restores the correct board height.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div style="min-width:140px;">
    <div id="scorePanel" style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;margin-bottom:8px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:1.9;">
      Score: <span id="scoreVal">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <button id="startBtn">▶ Start</button>
    <div id="status" style="margin-top:8px;color:#94a3b8;font-family:monospace;font-size:11px;line-height:1.6;"></div>
    <div id="gameOver" style="display:none;margin-top:8px;padding:8px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:11px;text-align:center;">GAME OVER</div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;width:100%;}`,
      startCode: `const COLS=10,ROWS=20,SPEED=500;
const SCORE_TABLE=[0,100,300,500,800];
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}

// ── YOUR CODE: clearLines ─────────────────────────────────────────────────────
// 1. filter: keep rows that are NOT full
// 2. count how many were removed
// 3. unshift that many empty rows
// 4. copy back into boardData (mutate in place)
// 5. return cleared count
function clearLines(boardData) {
  // YOUR CODE HERE
}

// ── YOUR CODE: updateScore ────────────────────────────────────────────────────
// score += SCORE_TABLE[cleared] * level
// lines += cleared
// level = Math.floor(lines / 10) + 1
// Update DOM: #scoreVal, #linesVal, #levelVal
let score=0, lines=0, level=1;
function updateScore(cleared) {
  // YOUR CODE HERE
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){stop();gameOverEl.style.display='block';}

// ── YOUR CODE: update tick ────────────────────────────────────────────────────
// After lockPiece, call clearLines.
// If cleared > 0, call updateScore(cleared).
function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);

    // YOUR CODE HERE: clearLines + updateScore

    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else{activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!handled.includes(event.key))return;event.preventDefault();let candidate;if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);if(event.key==='ArrowRight')candidate=moveRight(activePiece);if(event.key==='ArrowDown')candidate=moveDown(activePiece);if(event.key==='ArrowUp')candidate=rotateShape(activePiece);if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}renderBoard(cells,boardData,activePiece);});

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
const status=document.querySelector('#status');
const testBoard=Array.from({length:ROWS},()=>Array(COLS).fill(0));
testBoard[18]=Array(COLS).fill('cyan');   // full
testBoard[19]=Array(COLS).fill('red');    // full
testBoard[17]=['r',0,'b',0,'c',0,'g',0,'r',0]; // partial

try {
  const cl=clearLines(testBoard);
  const heightOk=testBoard.length===ROWS;
  const topEmpty=testBoard[0].every(v=>v===0);
  const partialPreserved=testBoard[ROWS-1].some(v=>v!==0);
  const pass=cl===2&&heightOk&&topEmpty&&partialPreserved;
  status.innerHTML=
    'cleared 2 rows: '+(cl===2?'✓':'✗ (got '+cl+')')+
    '<br>height still '+ROWS+': '+(heightOk?'✓':'✗')+
    '<br>empty rows at top: '+(topEmpty?'✓':'✗')+
    '<br>partial row kept: '+(partialPreserved?'✓':'✗');
  status.style.color=pass?'#10b981':'#f87171';
}catch(e){
  status.textContent='Error: '+e.message;
  status.style.color='#f87171';
}
renderBoard(cells,boardData,activePiece);`,
      solutionCode: `const COLS=10,ROWS=20,SPEED=500;
const SCORE_TABLE=[0,100,300,500,800];
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){
  const remaining=boardData.filter(row=>!row.every(cell=>cell!==0));
  const cleared=boardData.length-remaining.length;
  for(let i=0;i<cleared;i++)remaining.unshift(Array(COLS).fill(0));
  for(let r=0;r<boardData.length;r++)boardData[r]=remaining[r];
  return cleared;
}
let score=0,lines=0,level=1;
function updateScore(cleared){
  score+=(SCORE_TABLE[cleared]||0)*level;
  lines+=cleared;
  level=Math.floor(lines/10)+1;
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null;
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){stop();gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,SPEED);}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!handled.includes(event.key))return;event.preventDefault();let candidate;if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);if(event.key==='ArrowRight')candidate=moveRight(activePiece);if(event.key==='ArrowDown')candidate=moveDown(activePiece);if(event.key==='ArrowUp')candidate=rotateShape(activePiece);if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}renderBoard(cells,boardData,activePiece);});
const status=document.querySelector('#status');
const testBoard=Array.from({length:ROWS},()=>Array(COLS).fill(0));
testBoard[18]=Array(COLS).fill('cyan');testBoard[19]=Array(COLS).fill('red');testBoard[17]=['r',0,'b',0,'c',0,'g',0,'r',0];
const cl=clearLines(testBoard);
const pass=cl===2&&testBoard.length===ROWS&&testBoard[0].every(v=>v===0)&&testBoard[ROWS-1].some(v=>v!==0);
status.innerHTML='cleared 2: '+(cl===2?'✓':'✗')+'<br>height ok: '+(testBoard.length===ROWS?'✓':'✗')+'<br>top empty: '+(testBoard[0].every(v=>v===0)?'✓':'✗')+'<br>partial kept: '+(testBoard[ROWS-1].some(v=>v!==0)?'✓':'✗');
status.style.color=pass?'#10b981':'#f87171';
renderBoard(cells,boardData,activePiece);`,
      check: (code) => {
        const hasClearLines =
          /function clearLines/.test(code) &&
          /\.filter\s*\(/.test(code) &&
          /\.every\s*\(/.test(code) &&
          /\.unshift\s*\(/.test(code);
        const hasUpdateScore =
          /function updateScore/.test(code) &&
          /SCORE_TABLE/.test(code) &&
          /\*\s*level/.test(code);
        const hasInTick =
          /clearLines\s*\(\s*boardData\s*\)/.test(code) &&
          /updateScore/.test(code);
        return hasClearLines && hasUpdateScore && hasInTick;
      },
      successMessage: `Lines clear. Score tracks. The game is complete enough to be genuinely playable. filter + unshift in five lines — no explicit loop needed to "drop" rows because filter preserves order automatically.`,
      failMessage: `Three parts: clearLines needs .filter(row => !row.every(...)), count the cleared rows, .unshift empty rows, copy back in place. updateScore needs SCORE_TABLE[cleared] * level and DOM updates. tick() needs const cl = clearLines(boardData); if (cl > 0) updateScore(cl); after lockPiece.`,
      outputHeight: 720,
    },

    // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: Speed up with level.**

Right now the game speed never changes. Make the interval speed increase with each level.

- Level 1: 600ms per tick
- Level 2: 540ms
- Level 3: 480ms
- Formula: \`Math.max(80, 600 - (level - 1) * 60)\`

When \`updateScore\` causes a level increase, restart the game loop at the new speed. Use the same \`clearInterval\` + \`setInterval\` pattern from the bonus in Lesson 3.

Also display the current speed in the UI so the player can see it changing.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div style="min-width:150px;">
    <div id="scorePanel" style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;margin-bottom:8px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2;">
      Score: <span id="scoreVal">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span><br>
      Speed: <span id="speedVal">600ms</span>
    </div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:8px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:11px;text-align:center;">GAME OVER</div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;width:100%;}`,
      startCode: `const COLS=10,ROWS=20;
const SCORE_TABLE=[0,100,300,500,800];
const BASE_SPEED=600;
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const remaining=boardData.filter(row=>!row.every(cell=>cell!==0));const cleared=boardData.length-remaining.length;for(let i=0;i<cleared;i++)remaining.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=remaining[r];return cleared;}

let score=0,lines=0,level=1;
let intervalId=null;

function getSpeed(){
  // YOUR CODE HERE
  // Math.max(80, BASE_SPEED - (level - 1) * 60)
}

function restartLoop(){
  // YOUR CODE HERE
  // clearInterval, then setInterval(tick, getSpeed())
}

function updateScore(cleared){
  const prevLevel=level;
  score+=(SCORE_TABLE[cleared]||0)*level;
  lines+=cleared;
  level=Math.floor(lines/10)+1;
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
  document.querySelector('#speedVal').textContent=getSpeed()+'ms';
  // YOUR CODE HERE: if level changed, restartLoop()
}

const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece();
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){if(intervalId!==null){clearInterval(intervalId);intervalId=null;}gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
document.querySelector('#startBtn').addEventListener('click',()=>{start();document.querySelector('#speedVal').textContent=getSpeed()+'ms';});
document.addEventListener('keydown',(event)=>{const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!handled.includes(event.key))return;event.preventDefault();let candidate;if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);if(event.key==='ArrowRight')candidate=moveRight(activePiece);if(event.key==='ArrowDown')candidate=moveDown(activePiece);if(event.key==='ArrowUp')candidate=rotateShape(activePiece);if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}renderBoard(cells,boardData,activePiece);});
renderBoard(cells,boardData,activePiece);`,
      solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const remaining=boardData.filter(row=>!row.every(cell=>cell!==0));const cleared=boardData.length-remaining.length;for(let i=0;i<cleared;i++)remaining.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=remaining[r];return cleared;}
let score=0,lines=0,level=1,intervalId=null;
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function restartLoop(){if(intervalId!==null){clearInterval(intervalId);intervalId=null;}intervalId=setInterval(tick,getSpeed());}
function updateScore(cleared){
  const prevLevel=level;
  score+=(SCORE_TABLE[cleared]||0)*level;
  lines+=cleared;
  level=Math.floor(lines/10)+1;
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
  document.querySelector('#speedVal').textContent=getSpeed()+'ms';
  if(level!==prevLevel)restartLoop();
}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece();
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){if(intervalId!==null){clearInterval(intervalId);intervalId=null;}gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
document.querySelector('#startBtn').addEventListener('click',()=>{start();document.querySelector('#speedVal').textContent=getSpeed()+'ms';});
document.addEventListener('keydown',(event)=>{const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!handled.includes(event.key))return;event.preventDefault();let candidate;if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);if(event.key==='ArrowRight')candidate=moveRight(activePiece);if(event.key==='ArrowDown')candidate=moveDown(activePiece);if(event.key==='ArrowUp')candidate=rotateShape(activePiece);if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}renderBoard(cells,boardData,activePiece);});
renderBoard(cells,boardData,activePiece);`,
      check: (code) =>
        /Math\.max\s*\(\s*80/.test(code) &&
        /BASE_SPEED.*level|level.*BASE_SPEED/.test(code) &&
        /restartLoop|clearInterval.*setInterval/.test(code),
      successMessage: `The game gets faster as you clear lines. getSpeed() + restartLoop() on level change — the same pattern as Lesson 3's bonus, now integrated into the real scoring system.`,
      failMessage: `getSpeed: Math.max(80, BASE_SPEED - (level - 1) * 60). restartLoop: clearInterval(intervalId); intervalId = setInterval(tick, getSpeed()). In updateScore: save prevLevel before updating, then if (level !== prevLevel) restartLoop().`,
      outputHeight: 720,
    },

    // ─── SEED ─────────────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's what you have at the end of Lesson 6. A complete, scorable Tetris game.

Lines clear. Score tracks. Level increases. Speed ramps up. Ghost piece shows where pieces land. Game over detects correctly.

Play it. It's a real game now.

There are still things missing — no game over screen, no restart button, no next piece preview, no polish. But the core mechanic is complete. Everything from here is refinement.

Lesson 7: **Score Display, Level Speed, and Game Over Screen** — \`textContent\`, state machines, click events, resetting state.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div style="min-width:150px;">
    <div id="scorePanel" style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;margin-bottom:8px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2;">
      Score<br><span id="scoreVal" style="font-size:20px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:10px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:12px;text-align:center;line-height:1.6;">GAME<br>OVER<br><br>Lesson 7:<br>restart<br>button</div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;width:100%;}`,
      startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
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
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let ghost=ap;while(isValidPosition(moveDown(ghost),boardData))ghost=moveDown(ghost);if(ghost.y!==ap.y)ghost.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ghost.y+r)*COLS+(ghost.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ghost.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}
function moveRight(p){return{...p,x:p.x+1};}
function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const remaining=boardData.filter(row=>!row.every(cell=>cell!==0));const cleared=boardData.length-remaining.length;for(let i=0;i<cleared;i++)remaining.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=remaining[r];return cleared;}
let score=0,lines=0,level=1,intervalId=null;
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function restartLoop(){if(intervalId!==null){clearInterval(intervalId);intervalId=null;}intervalId=setInterval(tick,getSpeed());}
function updateScore(cleared){
  const prev=level;
  score+=(SCORE_TABLE[cleared]||0)*level;
  lines+=cleared; level=Math.floor(lines/10)+1;
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
  if(level!==prev)restartLoop();
}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece();
const gameOverEl=document.querySelector('#gameOver');
function handleGameOver(){if(intervalId!==null){clearInterval(intervalId);intervalId=null;}gameOverEl.style.display='block';}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(event)=>{const handled=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!handled.includes(event.key))return;event.preventDefault();let candidate;if(event.key==='ArrowLeft')candidate=moveLeft(activePiece);if(event.key==='ArrowRight')candidate=moveRight(activePiece);if(event.key==='ArrowDown')candidate=moveDown(activePiece);if(event.key==='ArrowUp')candidate=rotateShape(activePiece);if(event.key===' '){let dropped=activePiece;while(isValidPosition(moveDown(dropped),boardData))dropped=moveDown(dropped);lockPiece(dropped,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(event.key==='ArrowDown'&&!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(candidate&&isValidPosition(candidate,boardData)){activePiece=candidate;}renderBoard(cells,boardData,activePiece);});
renderBoard(cells,boardData,activePiece);`,
      outputHeight: 660,
    },

  ],
};

export default {
  id: 'tetris-06-line-clearing',
  slug: 'tetris-line-clearing',
  chapter: 'tetris.6',
  order: 6,
  title: 'Line Clearing',
  subtitle: 'Clear complete rows using filter, every, and unshift — and track score with the real Tetris scoring system',
  tags: ['javascript', 'array-methods', 'filter', 'every', 'unshift', 'scoring', 'game-logic'],
  hook: {
    question: 'How do you remove specific rows from an array and keep everything else in the right order?',
    realWorldContext:
      'filter + unshift is a pattern that appears in todo lists, undo stacks, notification queues, and feed algorithms. The same three array methods that clear Tetris lines are used to manage data in every web application.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'A row is full when row.every(cell => cell !== 0) returns true.',
      'filter keeps rows that are NOT full — full rows are removed automatically.',
      'filter preserves order, so rows above cleared rows "fall" without any explicit drop logic.',
      'unshift adds empty rows at the top to restore the board to 20 rows.',
      'Copy back in place (boardData[r] = remaining[r]) so existing references stay valid.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'filter Handles the Drop',
        body: 'You might expect to need a loop to "drop" rows above the cleared ones. You don\'t. filter preserves the order of remaining rows — they\'re automatically in the right position after filtering.',
      },
      {
        type: 'tip',
        title: 'Clear Before Spawn',
        body: 'Always call clearLines after lockPiece and before spawnPiece. If you spawned first, the new piece could overlap a row that clearLines would then delete.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 6: Line Clearing',
        props: { lesson: LESSON_TETRIS_06 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Full row: row.every(cell => cell !== 0)',
    'Remove full rows: boardData.filter(row => !row.every(cell => cell !== 0))',
    'Restore height: for (let i = 0; i < cleared; i++) remaining.unshift(Array(COLS).fill(0))',
    'Copy back in place: for (let r = 0; r < boardData.length; r++) boardData[r] = remaining[r]',
    'Score: SCORE_TABLE[cleared] * level — non-linear to reward multi-line clears',
    'Level: Math.floor(lines / 10) + 1 — increases every 10 lines',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};