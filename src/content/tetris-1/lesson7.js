// LESSON_TETRIS_07.js
// Lesson 7 — Game Over and Restart
// The problem: the game ends but you can't restart. There's no
// clear visual for game over. The state isn't tracked cleanly.
// Concepts: state machines (IDLE/PLAYING/GAME_OVER), textContent
//           vs innerHTML, resetting state, click events on buttons,
//           conditional rendering based on game state.

const LESSON_TETRIS_07 = {
  title: 'Game Over and Restart',
  subtitle: 'Add a proper game over screen, a restart button, and clean state management using a state machine.',
  sequential: true,
  cells: [

    // ─── PART 1: RECAP ────────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Recap: What we built in Lesson 6

By the end of Lesson 6 you had a complete, scorable game:

\`\`\`js
clearLines(boardData)    // filter + unshift → returns count cleared
updateScore(cleared)     // SCORE_TABLE[n] * level, updates DOM
// In tick(): lockPiece → clearLines → updateScore → spawnPiece → game over check
\`\`\`

Key sequence rule:

> **Clear lines BEFORE spawning. If you spawn first, the new piece could overlap a row that clearLines would then delete.**

The game is playable. Lines clear. Score tracks. Speed increases.

---

## The problem we face now

When the board fills up, the game just stops. There's no visual feedback. No "Game Over" screen. No way to restart. The player has to reload the page.

This is a state management problem. The game is always in one of three states:
- **IDLE** — not started yet
- **PLAYING** — game loop running
- **GAME_OVER** — loop stopped, waiting for restart

Right now, the code doesn't track which state it's in. It just runs or doesn't run. Adding a proper game over and restart requires making the states explicit — a state machine.

We also need to understand what "reset" actually means: creating fresh state, not mutating the old state back to defaults.`,
    },

    // ─── RECAP CELL ───────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's the Lesson 6 game. Play until game over. Notice: the loop just stops. No screen. No restart option. The player is stuck.

This is what we're fixing. Before continuing, ask yourself: what would a real reset need to do? What variables would need to return to their initial values?`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div id="board"></div>
  <div style="min-width:140px;">
    <div id="scorePanel" style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;margin-bottom:8px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2;">
      Score<br><span id="scoreVal" style="font-size:18px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <button id="startBtn">▶ Start</button>
    <div id="gameOver" style="display:none;margin-top:8px;padding:10px;border:1px solid #ef4444;border-radius:6px;background:#1c0a0a;color:#f87171;font-family:monospace;font-size:11px;text-align:center;">GAME OVER<br><br>No restart.<br>Reload page.</div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
button{padding:7px 14px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;width:100%;}`,
      startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
let score=0,lines=0,level=1,intervalId=null;
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece();
function handleGameOver(){if(intervalId!==null){clearInterval(intervalId);intervalId=null;}document.querySelector('#gameOver').style.display='block';}
function tick(){const c=moveDown(activePiece);if(!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=c;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
document.querySelector('#startBtn').addEventListener('click',start);
document.addEventListener('keydown',(e)=>{const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderBoard(cells,boardData,activePiece);`,
      outputHeight: 640,
    },

    // ─── PART 2: STATE MACHINES ───────────────────────────────────────────────

    {
      type: 'js',
      instruction: `A **state machine** is a system that can be in exactly one state at a time, with defined transitions between states.

For Tetris, the game has three states:
- **IDLE** — waiting to start (start screen, or after game over before restart)
- **PLAYING** — game loop running, accepting input
- **GAME_OVER** — loop stopped, showing the game over screen

The rules:
- IDLE → PLAYING: when the player clicks Start/Restart
- PLAYING → GAME_OVER: when the spawn position is blocked
- GAME_OVER → IDLE (or directly PLAYING): when the player clicks Restart

Each state determines what the UI shows and what input is accepted. In GAME_OVER, keyboard controls do nothing. In IDLE, the game loop isn't running.

Tracking this with a single \`gameState\` variable makes the code much clearer than the current approach of checking \`intervalId !== null\` to determine if the game is running.`,
      html: `<div id="smDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#smDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `// State machine for Tetris game flow
const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' };

let gameState = STATE.IDLE;

function transition(newState) {
  console.log(gameState + ' → ' + newState);
  gameState = newState;
}

// Simulate game flow
const log = [];

log.push('Initial state: ' + gameState);

transition(STATE.PLAYING);       // player clicks Start
log.push('After Start: ' + gameState);

transition(STATE.GAME_OVER);     // board fills up
log.push('After board full: ' + gameState);

transition(STATE.PLAYING);       // player clicks Restart
log.push('After Restart: ' + gameState);

// Guard: keyboard input only works in PLAYING state
function handleKey(key) {
  if (gameState !== STATE.PLAYING) {
    return 'ignored — state is ' + gameState;
  }
  return 'processed: ' + key;
}

log.push('');
log.push('// Input guards:');
log.push('In PLAYING:   ' + handleKey('ArrowLeft'));
transition(STATE.GAME_OVER);
log.push('In GAME_OVER: ' + handleKey('ArrowLeft'));

document.querySelector('#smDemo').innerHTML = log.join('<br>');`,
      outputHeight: 240,
    },

    // ─── PART 3: textContent VS innerHTML ─────────────────────────────────────

    {
      type: 'js',
      instruction: `Two ways to set an element's content from JavaScript. They are not interchangeable.

**\`textContent\`** — sets the text content literally. HTML tags are treated as plain text and displayed as-is. Safe for user data or any value you don't control.

**\`innerHTML\`** — parses the string as HTML. Tags are rendered. Allows you to inject structure. **Never use this with user-provided data** — it's an XSS (cross-site scripting) vector.

For Tetris:
- Score, lines, level → \`textContent\`. These are numbers. No HTML needed.
- Game over overlay content → \`innerHTML\` is fine (you control the string).
- Never use \`innerHTML\` with anything from the player or from an API.

The rule: if in doubt, use \`textContent\`.`,
      html: `<div id="tcDemo">
  <div id="tc1" class="box">textContent target</div>
  <div id="tc2" class="box">innerHTML target</div>
  <div id="tc3" class="box">XSS demo (safe here)</div>
</div>
<div id="tcLog"></div>`,
      css: `body{background:#0a1220;padding:14px;}
.box{border:1px solid #334155;border-radius:6px;background:#111827;color:#cbd5e1;padding:10px;margin-bottom:6px;font-family:monospace;font-size:13px;}
#tcLog{color:#94a3b8;font-family:monospace;font-size:12px;margin-top:8px;line-height:1.8;}`,
      startCode: `// textContent: safe, literal
document.querySelector('#tc1').textContent = 'Score: <b>1500</b>';
// Result: shows the literal string "<b>1500</b>" — not bold

// innerHTML: renders HTML
document.querySelector('#tc2').innerHTML = 'Score: <b style="color:#22d3ee">1500</b>';
// Result: "Score:" then bold cyan "1500"

// Why textContent is safer
const userInput = '<img src=x onerror="alert(\'XSS\')">';
document.querySelector('#tc3').textContent = 'User said: ' + userInput;
// textContent treats it as plain text — no script executes
// If you used innerHTML here, the script WOULD execute

document.querySelector('#tcLog').innerHTML = [
  'textContent: treats everything as plain text',
  'innerHTML:   parses as HTML — renders tags',
  '',
  'Rule: use textContent for data you don\'t fully control.',
  'Use innerHTML only when you need to inject HTML structure',
  'and you control the entire string.',
].join('<br>');`,
      outputHeight: 200,
    },

    // ─── PART 4: WHAT "RESET" MEANS ───────────────────────────────────────────

    {
      type: 'js',
      instruction: `"Reset" means returning all mutable state to its initial values. It's not the same as reversing the last action — it's a full wipe.

For Tetris, reset means:
- \`boardData\` → all zeros (empty board)
- \`score\`, \`lines\`, \`level\` → 0, 0, 1
- \`activePiece\` → a new spawned piece
- \`intervalId\` → null (loop not running)
- DOM displays → updated to initial values
- Game over overlay → hidden

The critical insight: **reset creates fresh state, it doesn't mutate old state back to defaults**.

For \`boardData\`, we can't reassign the variable (other references would point to the old array). We mutate each row back to empty. For scalar values (\`score\`, \`lines\`, \`level\`), reassignment is fine.

This is why the function signature matters: \`resetGame()\` takes no arguments and touches the shared state directly.`,
      html: `<div id="resetDemo"></div>`,
      css: `body{background:#0a1220;padding:14px;}
#resetDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
      startCode: `const COLS = 10;
const ROWS = 5; // small for demo

// Simulate game state
let boardData = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
boardData[3] = Array(COLS).fill('cyan');  // some locked pieces
boardData[4] = Array(COLS).fill('red');

let score = 450;
let lines = 5;
let level = 2;

const snapshot = (label) => ({
  label,
  score, lines, level,
  fullRows: boardData.filter(r => r.every(v => v !== 0)).length,
  emptyRows: boardData.filter(r => r.every(v => v === 0)).length,
});

const before = snapshot('BEFORE reset');

// RESET: wipe all mutable state
function resetGame() {
  // Clear boardData in place (can't reassign — other refs exist)
  for (let r = 0; r < boardData.length; r++) {
    boardData[r] = Array(COLS).fill(0);
  }
  score = 0;
  lines = 0;
  level = 1;
}

resetGame();
const after = snapshot('AFTER reset');

document.querySelector('#resetDemo').innerHTML = [before, after].map(s =>
  s.label + ':<br>' +
  '  score=' + s.score + '  lines=' + s.lines + '  level=' + s.level + '<br>' +
  '  full rows=' + s.fullRows + '  empty rows=' + s.emptyRows
).join('<br><br>');`,
      outputHeight: 200,
    },

    // ─── PART 5: THE OVERLAY PATTERN ──────────────────────────────────────────

    {
      type: 'js',
      instruction: `An overlay is a div that sits on top of the game board, covering it, to show a message. It's toggled with \`display: none\` (hidden) and \`display: flex\` (visible).

The CSS positions it over the board using \`position: absolute\` on the overlay and \`position: relative\` on the board container. This is the standard pattern for modal-style UI in games.

The overlay contains:
- The message (GAME OVER or similar)
- The final score
- A button to restart

When the player clicks Restart, the overlay is hidden, game state is reset, and a new game begins.`,
      html: `<div id="overlayDemo" style="position:relative;width:fit-content;">
  <div id="fakeBoard"></div>
  <div id="overlay" style="display:none;">
    <div id="overlayContent">
      <div id="overlayTitle"></div>
      <div id="overlayScore"></div>
      <button id="overlayBtn">Play Again</button>
    </div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#fakeBoard{display:grid;grid-template-columns:repeat(6,32px);grid-template-rows:repeat(8,32px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;}
.fb{width:32px;height:32px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}
#overlay{position:absolute;inset:0;background:rgba(0,0,0,0.85);border-radius:4px;display:flex;align-items:center;justify-content:center;}
#overlayContent{text-align:center;font-family:monospace;color:#e2e8f0;}
#overlayTitle{font-size:18px;font-weight:800;color:#f87171;margin-bottom:8px;}
#overlayScore{font-size:12px;color:#94a3b8;margin-bottom:12px;}
#overlayBtn{padding:8px 16px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}
#overlayBtn:hover{background:#334155;}`,
      startCode: `// Build the fake board
const fb = document.querySelector('#fakeBoard');
const colours = ['#00f0f0','#f0f000','#a000f0','#00f000','#f00000','#0000f0','#f0a000'];
for (let i = 0; i < 48; i++) {
  const cell = document.createElement('div');
  cell.className = 'fb';
  // Fill some cells with colour
  if (i >= 30) cell.style.background = colours[i % colours.length];
  fb.appendChild(cell);
}

let fakeScore = 1250;

// Show the overlay with score
function showGameOver() {
  document.querySelector('#overlayTitle').textContent = 'GAME OVER';
  document.querySelector('#overlayScore').textContent = 'Score: ' + fakeScore;
  document.querySelector('#overlay').style.display = 'flex';
}

// Hide the overlay and reset
function hideOverlay() {
  document.querySelector('#overlay').style.display = 'none';
  fakeScore = 0;
  // In the real game: resetGame(), start new game
}

document.querySelector('#overlayBtn').addEventListener('click', hideOverlay);

// Show it after a moment so you can see the reveal
setTimeout(showGameOver, 800);`,
      outputHeight: 340,
    },

    // ─── PART 6: CONDITIONAL RENDERING FROM STATE ─────────────────────────────

    {
      type: 'js',
      instruction: `With a state machine, rendering becomes a function of state. Instead of imperatively showing and hiding elements, you write a \`renderUI()\` function that looks at \`gameState\` and sets everything to match.

\`\`\`js
function renderUI() {
  const playing = gameState === STATE.PLAYING;
  const idle    = gameState === STATE.IDLE;
  const over    = gameState === STATE.GAME_OVER;

  startBtn.textContent = idle ? '▶ Start' : '↺ Restart';
  startBtn.style.display = over || idle ? 'block' : 'none';
  overlay.style.display  = over ? 'flex' : 'none';
  // etc.
}
\`\`\`

This is called **state-driven rendering**. The UI reflects state — it doesn't drive state. Whenever state changes, call \`renderUI()\` and the display catches up automatically.

This pattern eliminates entire categories of bugs where the UI gets out of sync with the game state — because the UI is always re-derived from the source of truth rather than maintained separately.`,
      html: `<div id="srDemo">
  <div id="srStatus"></div>
  <div id="srButtons" style="display:flex;gap:8px;margin-top:10px;"></div>
</div>`,
      css: `body{background:#0a1220;padding:14px;}
#srStatus{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:13px;line-height:1.8;}
button{padding:8px 16px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}`,
      startCode: `const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' };
let gameState = STATE.IDLE;
let fakeScore = 0;

// All UI derived from gameState — no separate tracking
function renderUI() {
  const status = document.querySelector('#srStatus');
  const btns = document.querySelector('#srButtons');
  btns.innerHTML = ''; // clear buttons

  if (gameState === STATE.IDLE) {
    status.innerHTML = 'State: <b style="color:#22d3ee">IDLE</b><br>Waiting to start.';
    const btn = document.createElement('button');
    btn.textContent = '▶ Start Game';
    btn.onclick = () => { gameState = STATE.PLAYING; fakeScore = 0; renderUI(); };
    btns.appendChild(btn);
  }

  if (gameState === STATE.PLAYING) {
    status.innerHTML = 'State: <b style="color:#10b981">PLAYING</b><br>Score: ' + fakeScore;
    const endBtn = document.createElement('button');
    endBtn.textContent = '☠ Simulate Game Over';
    endBtn.onclick = () => { gameState = STATE.GAME_OVER; renderUI(); };
    const scoreBtn = document.createElement('button');
    scoreBtn.textContent = '+ 100 pts';
    scoreBtn.onclick = () => { fakeScore += 100; renderUI(); };
    btns.appendChild(scoreBtn);
    btns.appendChild(endBtn);
  }

  if (gameState === STATE.GAME_OVER) {
    status.innerHTML = 'State: <b style="color:#ef4444">GAME_OVER</b><br>Final Score: ' + fakeScore;
    const restartBtn = document.createElement('button');
    restartBtn.textContent = '↺ Play Again';
    restartBtn.onclick = () => { gameState = STATE.PLAYING; fakeScore = 0; renderUI(); };
    btns.appendChild(restartBtn);
  }
}

renderUI();`,
      outputHeight: 200,
    },

    // ─── PART 7: CHALLENGE ────────────────────────────────────────────────────

    {
      type: 'markdown',
      instruction: `## Your Turn

You have everything you need:
- \`STATE\` constants and \`gameState\` variable
- \`textContent\` for safe DOM updates
- The overlay pattern — \`position: absolute\` + \`display: flex/none\`
- \`resetGame()\` — wipes boardData, score, lines, level
- \`renderUI()\` — derives all UI from current \`gameState\`
- State transitions: IDLE → PLAYING → GAME_OVER → PLAYING

**Your job:**

1. Add the \`STATE\` enum and \`gameState\` variable
2. Implement \`resetGame()\` — clear board, reset all counters, update displays
3. Implement \`renderUI()\` — show/hide overlay and button based on state
4. Implement \`startOrRestart()\` — handles both Start and Restart in one function
5. Update \`handleGameOver()\` to set \`gameState = STATE.GAME_OVER\` and call \`renderUI()\`
6. Guard the keydown handler to only work in \`STATE.PLAYING\`

The game should feel like a real game: start screen, playing, game over with score, clean restart.`,
    },

    {
      type: 'challenge',
      instruction: `**Challenge: Full game lifecycle.**

**STATE and gameState**
\`const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' }\`
\`let gameState = STATE.IDLE\`

**\`resetGame()\`**
- Wipe \`boardData\`: \`for (let r = 0; r < ROWS; r++) boardData[r] = Array(COLS).fill(0)\`
- Reset \`score = 0; lines = 0; level = 1\`
- Spawn new \`activePiece\`
- Update DOM: scoreVal, linesVal, levelVal

**\`renderUI()\`**
- In IDLE or GAME_OVER: show overlay, set appropriate title and score text, show start/restart button
- In PLAYING: hide overlay

**\`startOrRestart()\`**
- \`stop()\` any running loop
- \`resetGame()\`
- \`gameState = STATE.PLAYING\`
- \`renderUI()\`
- \`start()\`

**\`handleGameOver()\`**
- \`stop()\`
- \`gameState = STATE.GAME_OVER\`
- Update overlay with final score
- \`renderUI()\`

**keydown guard**: if \`gameState !== STATE.PLAYING\` return early`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:10px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#f87171;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:13px;color:#94a3b8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;">▶ Start</button>
    </div>
  </div>
  <div style="min-width:140px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;margin-bottom:8px;">
      Score<br><span id="scoreVal" style="font-size:18px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <div id="status" style="color:#94a3b8;font-family:monospace;font-size:11px;line-height:1.6;"></div>
  </div>
</div>`,
      css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;}`,
      startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function spawnPiece(){const t=PIECES[Math.floor(Math.random()*PIECES.length)];return{name:t.name,colour:t.colour,shape:t.shape,x:Math.floor((COLS-4)/2),y:0};}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}

// ── STATE MACHINE ─────────────────────────────────────────────────────────────
// YOUR CODE HERE
// const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' };
// let gameState = STATE.IDLE;

// ── GAME STATE ────────────────────────────────────────────────────────────────
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
let activePiece=spawnPiece();
let intervalId=null,score=0,lines=0,level=1;

function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}

// ── YOUR CODE: resetGame ──────────────────────────────────────────────────────
// Wipe boardData rows, reset score/lines/level, spawn new activePiece,
// update #scoreVal #linesVal #levelVal
function resetGame(){
  // YOUR CODE HERE
}

// ── YOUR CODE: renderUI ───────────────────────────────────────────────────────
// Show/hide overlay based on gameState.
// In IDLE: overlayTitle='TETRIS', overlayMsg='', overlayBtn text='▶ Start'
// In GAME_OVER: overlayTitle='GAME OVER', overlayMsg='Score: '+score, btn='↺ Play Again'
// In PLAYING: overlay display='none'
function renderUI(){
  // YOUR CODE HERE
}

// ── YOUR CODE: startOrRestart ─────────────────────────────────────────────────
// stop() → resetGame() → gameState=PLAYING → renderUI() → start()
function startOrRestart(){
  // YOUR CODE HERE
}

function updateScore(cl){
  const prev=level;
  score+=(SCORE_TABLE[cl]||0)*level;
  lines+=cl;level=Math.floor(lines/10)+1;
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
  if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}
}

// ── YOUR CODE: handleGameOver — set state, renderUI ───────────────────────────
function handleGameOver(){
  stop();
  // YOUR CODE HERE: gameState = STATE.GAME_OVER, renderUI()
}

function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);
    const cl=clearLines(boardData);
    if(cl>0)updateScore(cl);
    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else{activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}

// ── YOUR CODE: wire overlay button ───────────────────────────────────────────
// document.querySelector('#overlayBtn').addEventListener('click', startOrRestart);

// ── YOUR CODE: keydown guard ──────────────────────────────────────────────────
// Add: if (gameState !== STATE.PLAYING) return; at the top of the handler
document.addEventListener('keydown',(e)=>{
  // YOUR GUARD HERE

  const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!h.includes(e.key))return;
  e.preventDefault();
  let c;
  if(e.key==='ArrowLeft')c=moveLeft(activePiece);
  if(e.key==='ArrowRight')c=moveRight(activePiece);
  if(e.key==='ArrowDown')c=moveDown(activePiece);
  if(e.key==='ArrowUp')c=rotateShape(activePiece);
  if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(c&&isValidPosition(c,boardData)){activePiece=c;}
  renderBoard(cells,boardData,activePiece);
});

// ── INIT ──────────────────────────────────────────────────────────────────────
// YOUR CODE HERE: renderUI() to show the start screen
renderBoard(cells,boardData,activePiece);

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
const status=document.querySelector('#status');
setTimeout(()=>{
  try{
    const hasState=typeof STATE!=='undefined'&&STATE.IDLE&&STATE.PLAYING&&STATE.GAME_OVER;
    const hasReset=typeof resetGame==='function';
    const hasRenderUI=typeof renderUI==='function';
    const hasStartRestart=typeof startOrRestart==='function';
    const results=[
      'STATE enum: '+(hasState?'✓':'✗'),
      'resetGame(): '+(hasReset?'✓':'✗'),
      'renderUI(): '+(hasRenderUI?'✓':'✗'),
      'startOrRestart(): '+(hasStartRestart?'✓':'✗'),
    ];
    const pass=hasState&&hasReset&&hasRenderUI&&hasStartRestart;
    status.innerHTML=results.join('<br>');
    status.style.color=pass?'#10b981':'#f87171';
  }catch(e){status.textContent='Error: '+e.message;status.style.color='#f87171';}
},200);`,
      solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
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
let activePiece=spawnPiece();
let intervalId=null,score=0,lines=0,level=1;

function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}

function resetGame(){
  for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);
  score=0;lines=0;level=1;
  activePiece=spawnPiece();
  document.querySelector('#scoreVal').textContent='0';
  document.querySelector('#linesVal').textContent='0';
  document.querySelector('#levelVal').textContent='1';
}

function renderUI(){
  const overlay=document.querySelector('#overlay');
  const title=document.querySelector('#overlayTitle');
  const msg=document.querySelector('#overlayMsg');
  const btn=document.querySelector('#overlayBtn');
  if(gameState===STATE.IDLE){
    overlay.style.display='flex';
    title.textContent='TETRIS';
    msg.textContent='';
    btn.textContent='▶ Start';
  }else if(gameState===STATE.GAME_OVER){
    overlay.style.display='flex';
    title.textContent='GAME OVER';
    msg.textContent='Score: '+score;
    btn.textContent='↺ Play Again';
  }else{
    overlay.style.display='none';
  }
}

function startOrRestart(){
  stop();
  resetGame();
  gameState=STATE.PLAYING;
  renderUI();
  renderBoard(cells,boardData,activePiece);
  start();
}

function updateScore(cl){
  const prev=level;
  score+=(SCORE_TABLE[cl]||0)*level;
  lines+=cl;level=Math.floor(lines/10)+1;
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
  if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}
}

function handleGameOver(){
  stop();
  gameState=STATE.GAME_OVER;
  renderUI();
}

function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);
    const cl=clearLines(boardData);
    if(cl>0)updateScore(cl);
    activePiece=spawnPiece();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
  }else{activePiece=candidate;}
  renderBoard(cells,boardData,activePiece);
}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}

document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);

document.addEventListener('keydown',(e)=>{
  if(gameState!==STATE.PLAYING)return;
  const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
  if(!h.includes(e.key))return;
  e.preventDefault();
  let c;
  if(e.key==='ArrowLeft')c=moveLeft(activePiece);
  if(e.key==='ArrowRight')c=moveRight(activePiece);
  if(e.key==='ArrowDown')c=moveDown(activePiece);
  if(e.key==='ArrowUp')c=rotateShape(activePiece);
  if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}
  else if(c&&isValidPosition(c,boardData)){activePiece=c;}
  renderBoard(cells,boardData,activePiece);
});

renderUI();
renderBoard(cells,boardData,activePiece);

const status=document.querySelector('#status');
setTimeout(()=>{
  const hasState=typeof STATE!=='undefined'&&STATE.IDLE&&STATE.PLAYING&&STATE.GAME_OVER;
  const pass=hasState&&typeof resetGame==='function'&&typeof renderUI==='function'&&typeof startOrRestart==='function';
  status.innerHTML=['STATE enum: ✓','resetGame(): ✓','renderUI(): ✓','startOrRestart(): ✓'].join('<br>');
  status.style.color='#10b981';
},200);`,
      check: (code) => {
        const hasState = /STATE\s*=\s*\{/.test(code) && /IDLE/.test(code) && /PLAYING/.test(code) && /GAME_OVER/.test(code);
        const hasReset = /function resetGame/.test(code) && /boardData\[r\]\s*=\s*Array/.test(code);
        const hasRenderUI = /function renderUI/.test(code) && /overlay.*display/.test(code);
        const hasGuard = /gameState\s*!==\s*STATE\.PLAYING/.test(code);
        return hasState && hasReset && hasRenderUI && hasGuard;
      },
      successMessage: `The full game lifecycle works. Start screen → play → game over with score → restart. The state machine makes every transition explicit and the UI always reflects the current state.`,
      failMessage: `Four things: (1) STATE = {IDLE, PLAYING, GAME_OVER} and let gameState = STATE.IDLE. (2) resetGame() must wipe boardData rows and reset score/lines/level. (3) renderUI() must set overlay display based on gameState. (4) keydown handler must return early if gameState !== STATE.PLAYING.`,
      outputHeight: 720,
    },

    // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      instruction: `**Bonus: High score with localStorage.**

Persist the high score between sessions using \`localStorage\`.

- On page load: read \`localStorage.getItem('tetrisHighScore')\` → display it
- After game over: if \`score > highScore\`, save with \`localStorage.setItem('tetrisHighScore', score)\`
- Show the high score in the game over overlay

\`localStorage\` stores strings. Use \`parseInt\` when reading back.

Add a high score display to the side panel and the game over screen.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#f87171;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
    </div>
  </div>
  <div style="min-width:150px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;margin-bottom:8px;">
      Score<br><span id="scoreVal" style="font-size:18px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span><br>
      <span style="color:#94a3b8;font-size:11px;">Best: <span id="highScoreVal">0</span></span>
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

// YOUR CODE HERE: load highScore from localStorage
// let highScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');
// document.querySelector('#highScoreVal').textContent = highScore;

function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;activePiece=spawnPiece();document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){
  const overlay=document.querySelector('#overlay');
  const title=document.querySelector('#overlayTitle');
  const msg=document.querySelector('#overlayMsg');
  const btn=document.querySelector('#overlayBtn');
  if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='';btn.textContent='▶ Start';}
  else if(gameState===STATE.GAME_OVER){
    overlay.style.display='flex';
    title.textContent='GAME OVER';
    // YOUR CODE HERE: show score AND high score in msg
    // Check if score > highScore, update and save if so
    btn.textContent='↺ Play Again';
  }else{overlay.style.display='none';}
}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const c=moveDown(activePiece);if(!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=c;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderBoard(cells,boardData,activePiece);`,
      solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
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
document.querySelector('#highScoreVal').textContent=highScore;
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;activePiece=spawnPiece();document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){
  const overlay=document.querySelector('#overlay');
  const title=document.querySelector('#overlayTitle');
  const msg=document.querySelector('#overlayMsg');
  const btn=document.querySelector('#overlayBtn');
  if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+highScore;btn.textContent='▶ Start';}
  else if(gameState===STATE.GAME_OVER){
    overlay.style.display='flex';title.textContent='GAME OVER';
    const isNew=score>highScore;
    if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);document.querySelector('#highScoreVal').textContent=highScore;}
    msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981">New record!</span>':'');
    btn.textContent='↺ Play Again';
  }else{overlay.style.display='none';}
}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const c=moveDown(activePiece);if(!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=c;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderBoard(cells,boardData,activePiece);`,
      check: (code) =>
        /localStorage\.getItem/.test(code) &&
        /localStorage\.setItem/.test(code) &&
        /highScore/.test(code),
      successMessage: `High score persists between sessions. localStorage.setItem saves strings. parseInt recovers them as numbers. The "new record" check is a derived condition — it belongs in renderUI right where you need it.`,
      failMessage: `Three steps: (1) let highScore = parseInt(localStorage.getItem('tetrisHighScore') || '0'). (2) In renderUI GAME_OVER branch: if (score > highScore) { highScore = score; localStorage.setItem('tetrisHighScore', score); }. (3) Display highScore in the overlay message.`,
      outputHeight: 720,
    },

    // ─── SEED ─────────────────────────────────────────────────────────────────

    {
      type: 'js',
      instruction: `Here's what you have at the end of Lesson 7. A complete, polished game lifecycle: start screen, playing, game over with score, clean restart, and high score persisted across sessions.

Play several games. Notice how cleanly the state machine handles every transition. The overlay appears when it should, disappears when it should. Keyboard input is automatically blocked in the wrong states.

This is what state-driven UI looks like: you don't manage show/hide logic in ten different places. You update \`gameState\` and call \`renderUI()\`. The display catches up.

**What's still missing:**

The game has one more major feature before it's truly complete — the **next piece preview**. Right now you can't see what's coming. In Lesson 8 we add the preview panel, the 7-bag randomiser for fair piece distribution, and CSS Flexbox to lay out the side panel properly.`,
      html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
      <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
      <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
      <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
    </div>
  </div>
  <div style="min-width:150px;">
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;margin-bottom:8px;">
      Score<br><span id="scoreVal" style="font-size:18px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span><br>
      <span style="color:#94a3b8;font-size:11px;">Best: <span id="highScoreVal">–</span></span>
    </div>
    <div style="color:#94a3b8;font-family:monospace;font-size:11px;line-height:1.6;">
      Lesson 8:<br>Next piece<br>preview +<br>7-bag fair<br>randomiser
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
document.querySelector('#highScoreVal').textContent=highScore||'–';
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;activePiece=spawnPiece();document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){
  const overlay=document.querySelector('#overlay'),title=document.querySelector('#overlayTitle'),msg=document.querySelector('#overlayMsg'),btn=document.querySelector('#overlayBtn');
  if(gameState===STATE.IDLE){overlay.style.display='flex';title.textContent='TETRIS';msg.textContent='Best: '+(highScore||'–');btn.textContent='▶ Start';}
  else if(gameState===STATE.GAME_OVER){
    overlay.style.display='flex';title.textContent='GAME OVER';
    const isNew=score>highScore;
    if(isNew){highScore=score;localStorage.setItem('tetrisHighScore',score);document.querySelector('#highScoreVal').textContent=score;}
    msg.innerHTML='Score: '+score+'<br>Best: '+highScore+(isNew?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');
    btn.textContent='↺ Play Again';
  }else{overlay.style.display='none';}
}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const c=moveDown(activePiece);if(!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=c;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);activePiece=spawnPiece();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderBoard(cells,boardData,activePiece);`,
      outputHeight: 660,
    },

  ],
};

export default {
  id: 'tetris-07-game-over-restart',
  slug: 'tetris-game-over-restart',
  chapter: 'tetris.7',
  order: 7,
  title: 'Game Over and Restart',
  subtitle: 'Add a start screen, game over overlay, and clean restart using a state machine and state-driven rendering',
  tags: ['javascript', 'state-machine', 'textContent', 'innerHTML', 'localStorage', 'conditional-rendering', 'click-events'],
  hook: {
    question: 'How do you manage a UI that looks completely different depending on what the program is doing?',
    realWorldContext:
      'State machines power authentication flows, checkout processes, onboarding wizards, and video players. The pattern — one variable tracks the state, one function derives the UI from it — is used in every serious web application.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'A state machine has exactly one active state at a time. Transitions are explicit and intentional.',
      'renderUI() derives all display from gameState — nothing is managed separately.',
      'resetGame() creates fresh state. It does not mutate old values back to defaults.',
      'textContent is safe for data. innerHTML is for HTML you control. Never mix them up.',
      'Guard keyboard input with if (gameState !== STATE.PLAYING) return — one line prevents all wrong-state bugs.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'State-Driven Rendering',
        body: 'Don\'t show/hide elements imperatively in ten places. Call renderUI() once after every state change. The display always reflects the current state automatically.',
      },
      {
        type: 'warning',
        title: 'textContent vs innerHTML',
        body: 'Use textContent for scores, names, and any data you don\'t control. innerHTML only for HTML strings you wrote yourself. Using innerHTML with user data is an XSS vulnerability.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Tetris — Lesson 7: Game Over and Restart',
        props: { lesson: LESSON_TETRIS_07 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'STATE = { IDLE, PLAYING, GAME_OVER } — exactly one active at a time.',
    'gameState drives all UI. Call renderUI() after every transition.',
    'resetGame(): wipe boardData rows in place, reset scalars, spawn new piece.',
    'startOrRestart(): stop → reset → PLAYING → renderUI → start.',
    'handleGameOver(): stop → GAME_OVER → renderUI.',
    'Keyboard guard: if (gameState !== STATE.PLAYING) return.',
    'localStorage stores strings. parseInt() when reading back numbers.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};