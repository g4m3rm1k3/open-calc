// LESSON_TETRIS_08.js
// Lesson 8 — Next Piece Preview
// The problem: you can't see what piece is coming next.
// Expert Tetris strategy depends entirely on knowing the next piece.
// Concepts: the 7-bag randomiser, rendering a second grid,
//           CSS Flexbox for layout, reusing render logic,
//           separating the piece queue from the active piece.

const LESSON_TETRIS_08 = {
    title: 'Next Piece Preview',
    subtitle: 'Show the next piece in a side panel — and replace pure random with the 7-bag algorithm for fair piece distribution.',
    sequential: true,
    cells: [

        // ─── PART 1: RECAP ────────────────────────────────────────────────────────

        {
            type: 'markdown',
            instruction: `## Recap: What we built in Lesson 7

By the end of Lesson 7 you had a complete game lifecycle:

\`\`\`js
const STATE = { IDLE, PLAYING, GAME_OVER }
let gameState = STATE.IDLE

resetGame()        // wipes board + score, spawns fresh piece
renderUI()         // derives all display from gameState
startOrRestart()   // stop → reset → PLAYING → renderUI → start
handleGameOver()   // stop → GAME_OVER → renderUI
\`\`\`

And one key principle:

> **State-driven rendering: call renderUI() after every state change. The display always catches up.**

The game has a start screen, clean game over, restart, and high score.

---

## The problem we face now

Play for a while. You're flying blind — you never know what piece is coming next.

In real Tetris, the next piece preview is essential. It lets you plan two moves ahead. Without it, the game feels unfair — you're constantly reacting to surprises instead of playing strategically.

There are two problems to solve:
1. **What piece comes next?** Pure \`Math.random()\` can give you five S-pieces in a row. That's not bad luck — it's a broken randomiser. The official Tetris spec uses the **7-bag algorithm** for fair distribution.
2. **How do we show it?** We need a second smaller grid in a side panel, rendered from the next piece's shape data.

Both problems are solved by the same pattern: maintain a piece **queue** instead of spawning on demand.`,
        },

        // ─── RECAP CELL ───────────────────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Here's the Lesson 7 game. Play it and notice two things:

1. You never know what's coming next — pure random gives you no information
2. You'll occasionally get runs of the same piece, or long droughts of the I-piece

Both problems come from \`Math.random()\`. The fix is the 7-bag algorithm.

Before continuing: look at the current \`spawnPiece()\`. It picks randomly from all 7 pieces every time. That's the function we're replacing.`,
            html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
    </div>
  </div>
  <div style="min-width:140px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;margin-bottom:8px;">
      Score<br><span id="scoreVal" style="font-size:18px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <div style="color:#f87171;font-family:monospace;font-size:11px;line-height:1.6;border:1px solid #7f1d1d;border-radius:6px;padding:8px;background:#1c0a0a;">
      No preview.<br>Pure random.<br>Can give runs<br>of same piece.
    </div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
// Current spawnPiece — pure random, no preview
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece(),intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;activePiece=spawnPiece();document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){overlay.style.display='flex';title.textContent='GAME OVER';const isNew=score>highScore;if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);}msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');btn.textContent='↺ Play Again';}else{overlay.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const c=moveDown(activePiece);if(!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=c;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderBoard(cells,boardData,activePiece);`,
            outputHeight: 640,
        },

        // ─── PART 2: THE 7-BAG ALGORITHM ──────────────────────────────────────────

        {
            type: 'js',
            instruction: `The **7-bag algorithm** is the official Tetris piece randomiser. Instead of picking randomly from all 7 pieces each time, it:

1. Creates a "bag" containing one of each of the 7 pieces
2. Shuffles the bag
3. Deals pieces from the bag one at a time
4. When the bag is empty, creates and shuffles a new bag

This guarantees: you will never wait more than 12 pieces for any specific piece. You will never get more than two of the same piece in a row. The distribution is perfectly fair over every 7-piece cycle.

Pure \`Math.random()\` has no such guarantees — the probability of getting four S-pieces in a row is (1/7)⁴ ≈ 0.04%, which sounds small but happens frequently in long games. The 7-bag eliminates this.

The shuffle used is the **Fisher-Yates algorithm** — the standard correct way to shuffle an array.`,
            html: `<div id="bagDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#bagDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
            startCode: `const PIECE_NAMES = ['I','O','T','S','Z','J','L'];

// Fisher-Yates shuffle — the correct shuffle algorithm
function shuffle(array) {
  const a = [...array]; // copy — don't mutate original
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]; // swap
  }
  return a;
}

// Generate 3 bags and show their contents
const bags = [];
for (let b = 0; b < 3; b++) {
  bags.push(shuffle([...PIECE_NAMES]));
}

// Show distribution
const sequence = bags.flat();
const counts = {};
PIECE_NAMES.forEach(n => counts[n] = 0);
sequence.forEach(n => counts[n]++);

document.querySelector('#bagDemo').innerHTML = [
  'Bag 1: [' + bags[0].join(', ') + ']',
  'Bag 2: [' + bags[1].join(', ') + ']',
  'Bag 3: [' + bags[2].join(', ') + ']',
  '',
  'Over 21 pieces, each piece appears exactly 3 times:',
  ...PIECE_NAMES.map(n => '  ' + n + ': ' + counts[n] + ' times'),
  '',
  '// Compare to pure random — run this a few times:',
  'Pure random 21 picks: [' +
    Array.from({length: 21}, () => PIECE_NAMES[Math.floor(Math.random()*7)]).join(', ') +
  ']',
].join('<br>');`,
            outputHeight: 280,
        },

        // ─── PART 3: THE PIECE QUEUE ──────────────────────────────────────────────

        {
            type: 'js',
            instruction: `With the 7-bag algorithm, \`spawnPiece\` is replaced by a **piece queue** — an array of upcoming pieces.

The queue works like this:
- On game start, generate two bags worth of pieces (14 pieces) and put them in the queue
- Each time a piece is needed, \`shift()\` the first piece off the queue
- When the queue gets short (fewer than 7 pieces), generate a new bag and push all 7 onto the end

This means the queue always has at least 7 pieces in it. The "next piece" is always \`queue[0]\` — just look at the front without removing it.

The preview panel shows \`queue[0]\`. When a piece locks, the active piece becomes \`queue.shift()\` — it moves the next piece into play. If the queue is short, a new bag is appended.`,
            html: `<div id="queueDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#queueDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
            startCode: `const PIECES = [
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
const COLS = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBag() {
  return shuffle([...PIECES]).map(t => ({
    ...t, x: Math.floor((COLS - 4) / 2), y: 0
  }));
}

// The piece queue
let pieceQueue = [...makeBag(), ...makeBag()]; // start with 2 bags

function nextPiece() {
  if (pieceQueue.length < 7) {
    pieceQueue.push(...makeBag()); // refill when running low
  }
  return pieceQueue.shift(); // take from front
}

const log = [];
log.push('Queue length at start: ' + pieceQueue.length);
log.push('Next piece (peek): ' + pieceQueue[0].name);
log.push('');

// Deal 8 pieces and show the sequence
for (let i = 0; i < 8; i++) {
  const p = nextPiece();
  log.push('Deal ' + (i+1) + ': ' + p.name + '  queue length: ' + pieceQueue.length);
}

document.querySelector('#queueDemo').innerHTML = log.join('<br>');`,
            outputHeight: 240,
        },

        // ─── PART 4: CSS FLEXBOX FOR LAYOUT ───────────────────────────────────────

        {
            type: 'js',
            instruction: `We need the board and the side panel (preview + score) sitting next to each other.

**CSS Flexbox** makes this trivial. A flex container arranges its direct children either in a row or column. The key properties:

- \`display: flex\` — makes the element a flex container
- \`flex-direction: row\` — children arranged side by side (default)
- \`flex-direction: column\` — children stacked vertically
- \`gap: 12px\` — space between children
- \`align-items: flex-start\` — children align to the top (not stretched to full height)

For Tetris: the outer container is \`display: flex; gap: 12px; align-items: flex-start\`. Inside: the board on the left, a side panel on the right. The side panel is itself \`display: flex; flex-direction: column; gap: 8px\` to stack the preview and score vertically.

No absolute positioning. No floats. Just flexbox.`,
            html: `<div id="flexDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#flexDemo{font-family:monospace;font-size:12px;}
.flex-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;}
.flex-col{display:flex;flex-direction:column;gap:8px;}
.box{border:1px solid #334155;border-radius:8px;background:#111827;padding:12px;color:#cbd5e1;}
.tall{height:80px;display:flex;align-items:center;justify-content:center;color:#22d3ee;font-weight:700;}
.label{font-size:10px;color:#6b7280;text-align:center;margin-top:4px;}`,
            startCode: `document.querySelector('#flexDemo').innerHTML = \`
  <div style="color:#94a3b8;margin-bottom:10px;">
    flex-direction: row (default) — children side by side:
  </div>
  <div class="flex-row">
    <div>
      <div class="box tall" style="width:140px;">Board<br>(main)</div>
      <div class="label">flex child 1</div>
    </div>
    <div class="flex-col">
      <div class="box" style="width:100px;height:80px;display:flex;align-items:center;justify-content:center;color:#a78bfa;">Preview</div>
      <div class="box" style="width:100px;padding:10px;">
        Score<br>Lines<br>Level
      </div>
      <div class="label">flex child 2<br>(column inside)</div>
    </div>
  </div>
  <div style="color:#94a3b8;margin-top:4px;font-size:11px;">
    outer: display:flex; gap:12px; align-items:flex-start<br>
    side panel: display:flex; flex-direction:column; gap:8px
  </div>
\`;`,
            outputHeight: 240,
        },

        // ─── PART 5: RENDERING THE PREVIEW ────────────────────────────────────────

        {
            type: 'js',
            instruction: `The preview panel is a 4×4 grid showing the next piece's shape. It uses the exact same rendering pattern as the main board — cells in a grid, coloured by data.

The only difference: it's 4×4 instead of 10×20, and it always shows one specific piece rather than the board state.

\`\`\`js
function renderPreview(previewCells, piece) {
  previewCells.forEach((cell, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const filled = piece.shape[row][col] !== 0;
    cell.style.background = filled ? piece.colour : '';
  });
}
\`\`\`

The preview cells are created once (16 cells in a 4×4 grid) and reused every time the next piece changes — the same \`createBoard\` pattern at a smaller scale.

Call \`renderPreview\` whenever the active piece changes — at the start of the game, and every time a piece locks and a new one becomes active.`,
            html: `<div id="previewDemo" style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;"></div>`,
            css: `body{background:#0a1220;padding:14px;}
.pv-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;}
.pv-label{color:#94a3b8;font-family:monospace;font-size:11px;}
.pv-grid{display:grid;grid-template-columns:repeat(4,22px);gap:2px;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#111827;border:1px solid #1e293b;}`,
            startCode: `const PIECES = [
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];

function createPreview(container) {
  const grid = document.createElement('div');
  grid.className = 'pv-grid';
  const cells = [];
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'pv-cell';
    grid.appendChild(cell);
    cells.push(cell);
  }
  container.appendChild(grid);
  return cells;
}

function renderPreview(previewCells, piece) {
  previewCells.forEach((cell, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const filled = piece.shape[row][col] !== 0;
    cell.style.background = filled ? piece.colour : '';
    cell.style.borderColor = filled ? piece.colour + '88' : '';
  });
}

// Render all 4 pieces as previews
const container = document.querySelector('#previewDemo');
PIECES.forEach(piece => {
  const wrap = document.createElement('div');
  wrap.className = 'pv-wrap';
  const label = document.createElement('div');
  label.className = 'pv-label';
  label.textContent = piece.name + '-piece';
  wrap.appendChild(label);
  const cells = createPreview(wrap);
  renderPreview(cells, piece);
  container.appendChild(wrap);
});`,
            outputHeight: 160,
        },

        // ─── PART 6: INTEGRATING THE QUEUE ────────────────────────────────────────

        {
            type: 'js',
            instruction: `With the queue in place, the game flow changes slightly:

**Before (pure random):**
\`\`\`js
activePiece = spawnPiece(); // random every time
\`\`\`

**After (queue-based):**
\`\`\`js
// On game start:
pieceQueue = [...makeBag(), ...makeBag()];
activePiece = pieceQueue.shift();

// When a piece locks:
if (pieceQueue.length < 7) pieceQueue.push(...makeBag());
activePiece = pieceQueue.shift();
renderPreview(previewCells, pieceQueue[0]); // show what's next
\`\`\`

The key change: \`activePiece\` now comes from the queue, not from \`Math.random()\`. The preview always shows \`pieceQueue[0]\` — the piece that will become active next.

Notice \`pieceQueue[0]\` is a **peek** — it reads the front of the queue without removing it. The piece is only removed (\`shift()\`) when it actually becomes the active piece.`,
            html: `<div id="integDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#integDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
            startCode: `const PIECES = [
  {name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
  {name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
  {name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
  {name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
];
const COLS = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function makeBag() {
  return shuffle([...PIECES]).map(t => ({
    ...t, x: Math.floor((COLS-4)/2), y: 0
  }));
}

// Show the game flow with the queue
let pieceQueue = [...makeBag(), ...makeBag()];
const log = [];

log.push('=== Game Start ===');
log.push('Queue filled: ' + pieceQueue.map(p=>p.name).join(', '));
log.push('');

// Simulate: activePiece = first from queue
let activePiece = pieceQueue.shift();
log.push('Active piece: ' + activePiece.name);
log.push('Next (preview): ' + pieceQueue[0].name);  // peek, don't remove
log.push('Queue length: ' + pieceQueue.length);
log.push('');

// Simulate: piece locks, new piece from queue
log.push('=== Piece locks ===');
if (pieceQueue.length < 7) pieceQueue.push(...makeBag());
activePiece = pieceQueue.shift();
log.push('Active piece: ' + activePiece.name);
log.push('Next (preview): ' + pieceQueue[0].name);
log.push('Queue length: ' + pieceQueue.length);

document.querySelector('#integDemo').innerHTML = log.join('<br>');`,
            outputHeight: 240,
        },

        // ─── PART 7: CHALLENGE ────────────────────────────────────────────────────

        {
            type: 'markdown',
            instruction: `## Your Turn

You have all the pieces:
- The 7-bag algorithm with Fisher-Yates shuffle
- The piece queue: \`makeBag()\`, \`pieceQueue\`, \`shift()\` to consume, \`pieceQueue[0]\` to peek
- CSS Flexbox for the side panel layout
- \`createPreview()\` and \`renderPreview()\` for the 4×4 preview grid
- Where to call \`renderPreview\` — whenever \`activePiece\` changes

**Your job:**

1. Implement \`shuffle(arr)\` — Fisher-Yates in-place swap
2. Implement \`makeBag()\` — shuffles PIECES, adds x/y spawn position to each
3. Replace \`spawnPiece()\` with queue-based piece management — \`pieceQueue.shift()\` + refill when \`< 7\`
4. Implement \`createPreview()\` — builds 16 cells in a 4×4 grid, returns them
5. Implement \`renderPreview(cells, piece)\` — colours cells based on piece.shape
6. Call \`renderPreview\` after every piece transition

The layout is already done in the HTML — the board and side panel are side by side using flexbox. You just need to wire up the logic.`,
        },

        {
            type: 'challenge',
            instruction: `**Challenge: Next piece preview with 7-bag randomiser.**

**\`shuffle(arr)\`** — Fisher-Yates:
\`for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }\`
Return the shuffled array (or shuffle in place — your choice).

**\`makeBag()\`** — creates one shuffled bag of 7 pieces with spawn positions:
\`shuffle([...PIECES]).map(t => ({ ...t, x: Math.floor((COLS-4)/2), y: 0 }))\`

**Queue management** — replace \`spawnPiece()\` calls:
- On game start / reset: \`pieceQueue = [...makeBag(), ...makeBag()]\`, \`activePiece = pieceQueue.shift()\`
- On piece lock: \`if (pieceQueue.length < 7) pieceQueue.push(...makeBag())\`, \`activePiece = pieceQueue.shift()\`
- After each transition: \`renderPreview(previewCells, pieceQueue[0])\`

**\`createPreview(containerEl)\`** — 16 divs in a \`grid-template-columns: repeat(4, 1fr)\` grid. Return the cells array.

**\`renderPreview(cells, piece)\`** — for each cell, calculate \`row = Math.floor(i/4)\`, \`col = i%4\`, set background to \`piece.colour\` if \`piece.shape[row][col] !== 0\`, else \`''\`.`,
            html: `<div id="gameWrap" style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;min-width:110px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;">
      <div style="font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;">Next</div>
      <div id="previewGrid"></div>
    </div>
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;">
      Score<br><span id="scoreVal" style="font-size:16px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <div id="status" style="font-family:monospace;font-size:11px;color:#94a3b8;line-height:1.6;"></div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}

// ── YOUR CODE: shuffle ────────────────────────────────────────────────────────
function shuffle(arr) {
  // YOUR CODE HERE — Fisher-Yates
  // for (let i = arr.length - 1; i > 0; i--) { swap arr[i] with random arr[0..i] }
  return arr;
}

// ── YOUR CODE: makeBag ────────────────────────────────────────────────────────
// shuffle([...PIECES]) then map each to add x and y spawn position
function makeBag() {
  // YOUR CODE HERE
}

// ── YOUR CODE: createPreview ──────────────────────────────────────────────────
// Create 16 .pv-cell divs in a 4×4 grid inside #previewGrid
// Return the array of cell elements
function createPreview() {
  const container = document.querySelector('#previewGrid');
  // YOUR CODE HERE
  // container.style.display = 'grid'
  // container.style.gridTemplateColumns = 'repeat(4, 22px)'
  // container.style.gap = '2px'
}

// ── YOUR CODE: renderPreview ──────────────────────────────────────────────────
// For each cell: row = Math.floor(i/4), col = i%4
// If piece.shape[row][col] !== 0: set background to piece.colour
// Else: set background to ''
function renderPreview(previewCells, piece) {
  // YOUR CODE HERE
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
// ── YOUR CODE: pieceQueue ─────────────────────────────────────────────────────
// let pieceQueue = [...makeBag(), ...makeBag()];
let pieceQueue = [];
let activePiece = PIECES[0]; // placeholder — replaced in resetGame
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}

// ── YOUR CODE: resetGame — replace spawnPiece with queue ──────────────────────
function resetGame(){
  for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);
  score=0;lines=0;level=1;
  // YOUR CODE HERE:
  // pieceQueue = [...makeBag(), ...makeBag()];
  // activePiece = pieceQueue.shift();
  // renderPreview(previewCells, pieceQueue[0]);
  document.querySelector('#scoreVal').textContent='0';
  document.querySelector('#linesVal').textContent='0';
  document.querySelector('#levelVal').textContent='1';
}

function renderUI(){const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){overlay.style.display='flex';title.textContent='GAME OVER';const isNew=score>highScore;if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);}msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');btn.textContent='↺ Play Again';}else{overlay.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}

// ── YOUR CODE: tick — replace spawnPiece with queue ───────────────────────────
function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);
    const cl=clearLines(boardData);
    if(cl>0)updateScore(cl);
    // YOUR CODE HERE:
    // if (pieceQueue.length < 7) pieceQueue.push(...makeBag());
    // activePiece = pieceQueue.shift();
    // renderPreview(previewCells, pieceQueue[0]);
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else{activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
const status=document.querySelector('#status');
try{
  const testArr=[1,2,3,4,5,6,7];
  const shuffled=shuffle([...testArr]);
  const isShuffled=typeof shuffle==='function';
  const bagWorks=typeof makeBag==='function'&&makeBag&&(()=>{try{const b=makeBag();return b&&b.length===7&&b[0].x!==undefined;}catch{return false;}})();
  const previewWorks=typeof renderPreview==='function';
  const results=[
    'shuffle(): '+(isShuffled?'✓':'✗'),
    'makeBag() → 7 pieces with x,y: '+(bagWorks?'✓':'✗'),
    'renderPreview(): '+(previewWorks?'✓':'✗'),
  ];
  status.innerHTML=results.join('<br>');
  status.style.color=(isShuffled&&bagWorks&&previewWorks)?'#10b981':'#f87171';
}catch(e){status.textContent='Error: '+e.message;status.style.color='#f87171';}
renderUI();`,
            solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createPreview(){const container=document.querySelector('#previewGrid');container.style.display='grid';container.style.gridTemplateColumns='repeat(4,22px)';container.style.gap='2px';const cells=[];for(let i=0;i<16;i++){const c=document.createElement('div');c.className='pv-cell';container.appendChild(c);cells.push(c);}return cells;}
function renderPreview(previewCells,piece){previewCells.forEach((cell,i)=>{const row=Math.floor(i/4),col=i%4;const filled=piece&&piece.shape[row][col]!==0;cell.style.background=filled?piece.colour:'';cell.style.borderColor=filled?piece.colour+'88':'';});}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()];
let activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){overlay.style.display='flex';title.textContent='GAME OVER';const isNew=score>highScore;if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);}msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');btn.textContent='↺ Play Again';}else{overlay.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
const status=document.querySelector('#status');
status.innerHTML='shuffle(): ✓<br>makeBag() → 7 pieces with x,y: ✓<br>renderPreview(): ✓';
status.style.color='#10b981';
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            check: (code) => {
                const hasShuffle = /function shuffle/.test(code) &&
                    /\[a\[i\]\s*,\s*a\[j\]\]\s*=\s*\[a\[j\]\s*,\s*a\[i\]\]/.test(code);
                const hasMakeBag = /function makeBag/.test(code) &&
                    /shuffle/.test(code);
                const hasCreatePreview = /function createPreview/.test(code) &&
                    /pv-cell|pvCell/.test(code);
                const hasRenderPreview = /function renderPreview/.test(code) &&
                    /Math\.floor\(i\s*\/\s*4\)/.test(code);
                const hasQueue = /pieceQueue\.shift\(\)/.test(code) &&
                    /makeBag\(\)/.test(code);
                return hasShuffle && hasMakeBag && hasCreatePreview && hasRenderPreview && hasQueue;
            },
            successMessage: `The preview works and the 7-bag guarantees fair distribution. You'll never wait more than 12 pieces for any specific piece. The preview panel reuses the exact same rendering pattern as the main board — different scale, same logic.`,
            failMessage: `Five things: (1) shuffle uses Fisher-Yates swap: [a[i],a[j]]=[a[j],a[i]]. (2) makeBag shuffles PIECES and adds x/y. (3) createPreview builds 16 .pv-cell divs in a 4-column grid. (4) renderPreview checks piece.shape[row][col] using row=Math.floor(i/4), col=i%4. (5) pieceQueue.shift() replaces spawnPiece() everywhere.`,
            outputHeight: 720,
        },

        // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

        {
            type: 'challenge',
            instruction: `**Bonus: Show the next 3 pieces.**

Instead of one preview, show three upcoming pieces in a queue display.

Replace the single \`renderPreview\` with \`renderQueue\` that shows \`pieceQueue[0]\`, \`pieceQueue[1]\`, and \`pieceQueue[2]\` stacked vertically, each in a 4×4 mini-grid.

Create three sets of preview cells (3 × 16 = 48 cells total). On each piece transition, call \`renderQueue\` with the three next pieces.

The queue is always refilled before the display is updated, so \`pieceQueue[0]\`, \`[1]\`, and \`[2]\` are always defined.`,
            html: `<div id="gameWrap" style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;min-width:110px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;">
      <div style="font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;">Next</div>
      <div id="queueDisplay" style="display:flex;flex-direction:column;gap:6px;"></div>
    </div>
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;">
      Score<br><span id="scoreVal" style="font-size:16px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
.pv-cell{width:18px;height:18px;border-radius:2px;background:#0f1929;border:1px solid #1a2744;}
.pv-grid{display:grid;grid-template-columns:repeat(4,18px);gap:2px;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}

// YOUR CODE: createQueueDisplay() and renderQueue(pieces)
// Create 3 separate 4×4 grids inside #queueDisplay
// renderQueue(pieces) takes pieceQueue.slice(0,3) and renders each into its grid

function createQueueDisplay() {
  const container = document.querySelector('#queueDisplay');
  // YOUR CODE HERE
  // Create 3 mini-grids, each with 16 .pv-cell divs
  // Return array of 3 cell arrays: [[16 cells], [16 cells], [16 cells]]
}

function renderQueue(allCells, pieces) {
  // YOUR CODE HERE
  // allCells = [[16], [16], [16]]
  // For each slot i: renderPreview(allCells[i], pieces[i])
}

function renderPreview(cells, piece) {
  cells.forEach((cell, i) => {
    const row = Math.floor(i/4), col = i%4;
    const filled = piece && piece.shape[row][col] !== 0;
    cell.style.background = filled ? piece.colour : '';
    cell.style.borderColor = filled ? piece.colour+'88' : '';
  });
}

const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const queueCells=createQueueDisplay();
let pieceQueue=[...makeBag(),...makeBag()];
let activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){overlay.style.display='flex';title.textContent='GAME OVER';const isNew=score>highScore;if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);}msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');btn.textContent='↺ Play Again';}else{overlay.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();if(queueCells)renderQueue(queueCells,pieceQueue.slice(0,3));`,
            solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function renderPreview(cells,piece){cells.forEach((cell,i)=>{const row=Math.floor(i/4),col=i%4;const filled=piece&&piece.shape[row][col]!==0;cell.style.background=filled?piece.colour:'';cell.style.borderColor=filled?piece.colour+'88':'';});}
function createQueueDisplay(){const container=document.querySelector('#queueDisplay');const allCells=[];for(let s=0;s<3;s++){const grid=document.createElement('div');grid.className='pv-grid';const cells=[];for(let i=0;i<16;i++){const c=document.createElement('div');c.className='pv-cell';grid.appendChild(c);cells.push(c);}container.appendChild(grid);allCells.push(cells);}return allCells;}
function renderQueue(allCells,pieces){allCells.forEach((cells,i)=>{if(pieces[i])renderPreview(cells,pieces[i]);});}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const queueCells=createQueueDisplay();
let pieceQueue=[...makeBag(),...makeBag()];
let activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){overlay.style.display='flex';title.textContent='GAME OVER';const isNew=score>highScore;if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);}msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');btn.textContent='↺ Play Again';}else{overlay.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderQueue(queueCells,pieceQueue.slice(0,3));if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderQueue(queueCells,pieceQueue.slice(0,3));`,
            check: (code) =>
                /createQueueDisplay|queueDisplay/.test(code) &&
                /renderQueue/.test(code) &&
                /slice\s*\(\s*0\s*,\s*3\s*\)/.test(code),
            successMessage: `Three-piece preview works. pieceQueue.slice(0, 3) is a non-destructive peek at the next three pieces — it reads without consuming. The queue is always at least 7 deep before you slice, so indices 0, 1, and 2 are always defined.`,
            failMessage: `createQueueDisplay creates 3 mini-grids (3 × 16 cells). renderQueue loops allCells and calls renderPreview for each. Call renderQueue(queueCells, pieceQueue.slice(0, 3)) — slice(0,3) peeks at the first 3 without removing them.`,
            outputHeight: 720,
        },

        // ─── SEED ─────────────────────────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Here's what you have at the end of Lesson 8. A complete Tetris game with a next-piece preview, the 7-bag randomiser, and a proper side panel layout.

Play it. Notice how the preview changes the game feel — you can plan ahead, set up Tetrises, and recover from bad positions instead of just reacting.

**What the game has now:**
- Boards, pieces, collision, line clearing, score, speed, ghost piece
- Game over screen, restart, high score
- Next piece preview (or 3-piece queue)
- Fair 7-bag distribution

**What's next:**

The game is functionally complete. The remaining lessons add polish: line-clear animations, mobile touch controls, and responsive layout. These lessons teach CSS transitions, touch events, and media queries — the web development skills that separate a working prototype from a shippable product.`,
            html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;min-width:110px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;">
      <div style="font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;">Next</div>
      <div id="previewGrid"></div>
    </div>
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;">
      Score<br><span id="scoreVal" style="font-size:16px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span><br>
      <span style="color:#6b7280;font-size:10px;">Best: <span id="highScoreVal">–</span></span>
    </div>
    <div style="color:#94a3b8;font-family:monospace;font-size:10px;line-height:1.6;">
      Lesson 9:<br>Line clear<br>animation +<br>CSS transitions
    </div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createPreview(){const container=document.querySelector('#previewGrid');container.style.display='grid';container.style.gridTemplateColumns='repeat(4,22px)';container.style.gap='2px';const cells=[];for(let i=0;i<16;i++){const c=document.createElement('div');c.className='pv-cell';container.appendChild(c);cells.push(c);}return cells;}
function renderPreview(previewCells,piece){previewCells.forEach((cell,i)=>{const row=Math.floor(i/4),col=i%4;const filled=piece&&piece.shape[row][col]!==0;cell.style.background=filled?piece.colour:'';cell.style.borderColor=filled?piece.colour+'88':'';});}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()];
let activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
document.querySelector('#highScoreVal').textContent=highScore||'–';
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){overlay.style.display='flex';title.textContent='GAME OVER';const isNew=score>highScore;if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);document.querySelector('#highScoreVal').textContent=highScore;}msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');btn.textContent='↺ Play Again';}else{overlay.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=candidate;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            outputHeight: 660,
        },

    ],
};

export default {
    id: 'tetris-08-next-piece-preview',
    slug: 'tetris-next-piece-preview',
    chapter: 'tetris.8',
    order: 8,
    title: 'Next Piece Preview',
    subtitle: 'Show upcoming pieces and replace pure random with the 7-bag algorithm for fair distribution',
    tags: ['javascript', 'arrays', 'queue', 'shuffle', 'flexbox', 'css-grid', 'algorithms'],
    hook: {
        question: 'How do you show what\'s coming next — and how do you make sure the randomiser is actually fair?',
        realWorldContext:
            'The 7-bag algorithm and Fisher-Yates shuffle appear in card games, playlist shufflers, quiz randomisers, and A/B testing systems. Any time you need "random but fair", this is the pattern.',
        previewVisualizationId: 'JSNotebook',
    },
    intuition: {
        prose: [
            'Pure Math.random() can give long runs of the same piece. The 7-bag guarantees every piece appears exactly once per 7.',
            'Fisher-Yates shuffle: swap each element with a random earlier element. The only correct shuffle algorithm.',
            'The queue separates piece generation from piece consumption. pieceQueue[0] peeks. pieceQueue.shift() consumes.',
            'renderPreview reuses the same row*4+col pattern as the main board — different scale, identical logic.',
            'CSS Flexbox: display:flex on the container, flex-direction:column on the side panel. Gap handles spacing.',
        ],
        callouts: [
            {
                type: 'important',
                title: 'Peek vs Consume',
                body: 'pieceQueue[0] reads the next piece without removing it — this is the preview. pieceQueue.shift() removes and returns it — this is when the piece becomes active. Never shift() to preview.',
            },
            {
                type: 'tip',
                title: 'Refill Before Consuming',
                body: 'Always check pieceQueue.length < 7 and refill before calling shift(). This guarantees the queue never runs dry and pieceQueue[0] through [2] are always defined.',
            },
        ],
        visualizations: [
            {
                id: 'JSNotebook',
                title: 'Tetris — Lesson 8: Next Piece Preview',
                props: { lesson: LESSON_TETRIS_08 },
            },
        ],
    },
    math: { prose: [], callouts: [], visualizations: [] },
    rigor: { prose: [], callouts: [], visualizations: [] },
    examples: [],
    challenges: [],
    mentalModel: [
        '7-bag: one of each piece per bag, shuffled. Never more than 12 pieces between any specific piece.',
        'Fisher-Yates: for i from end to 1, swap arr[i] with random arr[0..i]. The correct shuffle.',
        'makeBag(): shuffle([...PIECES]).map(t => ({...t, x: spawnX, y: 0}))',
        'Queue: start with 2 bags. Refill when length < 7. shift() to consume. [0] to peek.',
        'renderPreview: row = Math.floor(i/4), col = i%4. Same index math as the main board.',
        'Flexbox: display:flex on outer (row), display:flex;flex-direction:column on side panel.',
    ],
    checkpoints: ['read-intuition'],
    quiz: [],
};