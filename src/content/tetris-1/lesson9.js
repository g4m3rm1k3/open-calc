// LESSON_TETRIS_09.js
// Lesson 9 — Polish and Animation
// The problem: lines just disappear instantly. Pieces lock with no feedback.
// The game feels mechanical.
// Concepts: CSS transitions, classList toggling to trigger animations,
//           setTimeout for sequencing, requestAnimationFrame intro,
//           the difference between CSS animation and JS animation.

const LESSON_TETRIS_09 = {
    title: 'Polish and Animation',
    subtitle: 'Add line-clear flash, piece-lock feedback, and score pop — using CSS transitions, classList, and setTimeout sequencing.',
    sequential: true,
    cells: [

        // ─── PART 1: RECAP ────────────────────────────────────────────────────────

        {
            type: 'markdown',
            instruction: `## Recap: What we built in Lesson 8

By the end of Lesson 8 you had a feature-complete game:

\`\`\`js
shuffle(arr)          // Fisher-Yates — the correct shuffle
makeBag()             // one shuffled bag of 7 pieces with spawn positions
pieceQueue            // [...makeBag(), ...makeBag()] — refill when length < 7
renderPreview(cells, piece)  // 4×4 grid showing next piece
\`\`\`

And one key rule:

> **pieceQueue[0] peeks. pieceQueue.shift() consumes. Never shift() to preview.**

The game is functionally complete — start, play, line clear, score, game over, restart, preview, fair randomiser.

---

## The problem we face now

Play it. It works. But it doesn't *feel* good.

Lines disappear instantly with no visual feedback. Pieces lock silently. Nothing marks the moment a Tetris happens. The score just changes — it doesn't celebrate.

This is the difference between a working game and a polished one. Animation isn't decoration — it's information. A flash tells the player "that row cleared." A bounce tells them "the piece locked." Without these signals, the player has to consciously track what happened. With them, the game communicates directly.

We add three animations:
1. **Line-clear flash** — full rows flash white before disappearing
2. **Piece-lock pulse** — the locking piece briefly brightens
3. **Score pop** — the score number scales up when it changes

All three use the same technique: add a CSS class to trigger an animation, then remove it (or let it self-remove).`,
        },

        // ─── RECAP CELL ───────────────────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Here's the Lesson 8 game. Play it and pay attention to how it feels when you clear a line.

The row just vanishes. There's no moment of recognition — no flash, no delay, nothing. Compare this to how Tetris feels in your memory. That satisfaction comes from animation.

Before continuing: look at where lines are cleared in \`tick()\`. The call to \`clearLines(boardData)\` is the moment we need to intercept with animation. Right now it's synchronous — it clears and continues. Animation will make it asynchronous: flash the rows, wait, then clear.`,
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
      Level: <span id="levelVal">1</span>
    </div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pvCells,piece){pvCells.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()],activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(highScore||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>highScore;if(n){highScore=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+highScore+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;document.querySelector('#scoreVal').textContent=score;document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function tick(){const c=moveDown(activePiece);if(!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else{activePiece=c;}renderBoard(cells,boardData,activePiece);}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const cl=clearLines(boardData);if(cl>0)updateScore(cl);if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}}else if(c&&isValidPosition(c,boardData)){activePiece=c;}renderBoard(cells,boardData,activePiece);});
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            outputHeight: 640,
        },

        // ─── PART 2: CSS TRANSITIONS ──────────────────────────────────────────────

        {
            type: 'js',
            instruction: `A **CSS transition** smoothly animates a property change from one value to another.

Add to an element's CSS:
\`\`\`css
.cell {
  transition: background 0.15s ease;
}
\`\`\`

Now whenever JavaScript changes \`cell.style.background\`, the browser smoothly interpolates between the old and new colour over 150ms — with no extra JavaScript required.

Transitions are the simplest form of web animation. They're driven entirely by CSS — you just change a value and the browser handles the interpolation. The parameters:
- **property** — what to animate (\`background\`, \`transform\`, \`opacity\`, \`all\`)
- **duration** — how long (e.g. \`0.15s\`, \`200ms\`)
- **easing** — the timing curve (\`ease\`, \`linear\`, \`ease-in-out\`)

Transitions work on any animatable CSS property. They don't work on \`display\` (you can't transition from \`none\` to \`block\`) — use \`opacity\` instead.`,
            html: `<div id="transDemo" style="display:flex;gap:12px;flex-wrap:wrap;"></div>
<div id="transLog" style="margin-top:10px;"></div>`,
            css: `body{background:#0a1220;padding:14px;}
.trans-box{width:80px;height:80px;border-radius:8px;background:#1e293b;border:1px solid #334155;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:11px;color:#94a3b8;}
/* Box 1: no transition */
#b1{}
/* Box 2: transition on background */
#b2{transition:background 0.3s ease;}
/* Box 3: transition on multiple properties */
#b3{transition:background 0.3s ease, transform 0.3s ease;}
#transLog{color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.8;}`,
            startCode: `// Create 3 boxes with different transition settings
const configs = [
  { id:'b1', label:'No transition', desc:'Instant snap' },
  { id:'b2', label:'background 0.3s', desc:'Smooth colour' },
  { id:'b3', label:'bg + transform', desc:'Colour + scale' },
];

const container = document.querySelector('#transDemo');
configs.forEach(({ id, label }) => {
  const box = document.createElement('div');
  box.className = 'trans-box';
  box.id = id;
  box.textContent = label;
  container.appendChild(box);
});

// Toggle all boxes on click
let toggled = false;
container.addEventListener('click', () => {
  toggled = !toggled;
  document.querySelector('#b1').style.background = toggled ? '#22d3ee' : '#1e293b';
  document.querySelector('#b2').style.background = toggled ? '#22d3ee' : '#1e293b';
  const b3 = document.querySelector('#b3');
  b3.style.background = toggled ? '#a78bfa' : '#1e293b';
  b3.style.transform = toggled ? 'scale(1.1)' : 'scale(1)';

  document.querySelector('#transLog').textContent =
    'Clicked. State: ' + (toggled ? 'ON' : 'OFF') +
    '\nBox 1: instant (no transition declared)' +
    '\nBox 2: smooth 300ms background transition' +
    '\nBox 3: smooth background AND scale transition';
});

document.querySelector('#transLog').textContent = 'Click the boxes to see transitions.';`,
            outputHeight: 200,
        },

        // ─── PART 3: CSS ANIMATIONS WITH @keyframes ───────────────────────────────

        {
            type: 'js',
            instruction: `**CSS keyframe animations** are more powerful than transitions — they run automatically when a class is applied and can animate through multiple steps.

\`\`\`css
@keyframes flash {
  0%   { background: white; }
  50%  { background: #22d3ee; }
  100% { background: white; }
}

.cell.clearing {
  animation: flash 0.3s ease forwards;
}
\`\`\`

The pattern for triggering from JavaScript:
1. Add the class that has the animation: \`cell.classList.add('clearing')\`
2. The animation runs automatically
3. After the animation duration, remove the class: \`setTimeout(() => cell.classList.remove('clearing'), 300)\`

The \`animationend\` event fires when the animation completes — you can use that instead of a hardcoded setTimeout. But for simple cases, matching the setTimeout duration to the CSS duration is fine.

This is the core pattern for all game feedback: add class → animation plays → remove class.`,
            html: `<div id="animDemo" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;"></div>
<button id="flashBtn">Flash all</button>
<div id="animLog" style="margin-top:8px;"></div>`,
            css: `body{background:#0a1220;padding:14px;}
@keyframes flash{0%{background:#111827;}40%{background:#ffffff;transform:scaleY(1.08);}100%{background:#111827;}}
@keyframes lockPulse{0%{filter:brightness(1);}50%{filter:brightness(2.5);}100%{filter:brightness(1);}}
.anim-cell{width:28px;height:28px;border-radius:3px;background:#111827;border:1px solid #334155;}
.anim-cell.filled{background:#22d3ee;border-color:#67e8f9;}
.anim-cell.clearing{animation:flash 0.35s ease forwards;}
.anim-cell.locking{animation:lockPulse 0.2s ease forwards;}
button{padding:7px 16px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}
#animLog{color:#94a3b8;font-family:monospace;font-size:12px;line-height:1.8;}`,
            startCode: `// Create a row of 10 cells
const container = document.querySelector('#animDemo');
const cells = [];
for (let i = 0; i < 10; i++) {
  const cell = document.createElement('div');
  cell.className = 'anim-cell filled';
  container.appendChild(cell);
  cells.push(cell);
}

const log = document.querySelector('#animLog');

document.querySelector('#flashBtn').addEventListener('click', () => {
  log.textContent = '1. Adding .clearing class to all cells...';

  // Step 1: Add the class — animation starts immediately
  cells.forEach(cell => cell.classList.add('clearing'));

  // Step 2: After animation duration, remove class and clear data
  setTimeout(() => {
    cells.forEach(cell => {
      cell.classList.remove('clearing');
      cell.classList.remove('filled');
      cell.style.background = '';
    });
    log.textContent = '3. Animation complete. Classes removed. Cells cleared.';
  }, 350); // matches animation duration

  // Note: step 2 fires in the callback queue — the browser renders the animation
  // between "addClass" and "setTimeout callback"
  log.textContent += '\n2. setTimeout scheduled for 350ms. Animation playing...';
});

log.textContent = 'Click "Flash all" to see the line-clear animation.';`,
            outputHeight: 180,
        },

        // ─── PART 4: setTimeout FOR SEQUENCING ────────────────────────────────────

        {
            type: 'js',
            instruction: `Animation introduces a problem: the game loop is synchronous, but animations are asynchronous. When lines need to clear, we want to:

1. Flash the full rows
2. **Wait** for the flash to finish
3. Clear the data
4. Spawn the next piece
5. Resume the loop

\`setTimeout\` is how we insert a wait into an otherwise synchronous game. The pattern:

\`\`\`js
function tick() {
  if (/* piece lands */) {
    lockPiece(activePiece, boardData);
    const fullRows = findFullRows(boardData);

    if (fullRows.length > 0) {
      stop();                          // pause the loop
      flashRows(cells, fullRows, () => {  // animate, then callback
        clearLines(boardData);
        updateScore(fullRows.length);
        spawnNext();
        renderBoard(cells, boardData, activePiece);
        start();                       // resume the loop
      });
    } else {
      spawnNext();
    }
  }
}
\`\`\`

The callback pattern: \`flashRows\` accepts a callback function that runs after the animation. This is the continuation-passing style — the rest of the work happens after the async operation completes.`,
            html: `<div id="seqDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#seqDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
            startCode: `// Demonstrate the sequencing pattern
const log = document.querySelector('#seqDemo');
const steps = [];

function addStep(msg) {
  steps.push(msg);
  log.innerHTML = steps.join('<br>');
}

// Simulate the animation sequence
addStep('1. Piece lands — lockPiece() called');
addStep('2. Full rows found: [17, 18]');
addStep('3. stop() — game loop paused');
addStep('4. flashRows() called — adds .clearing class');
addStep('5. setTimeout(callback, 350) scheduled');
addStep('   ... animation plays in the browser ...');

setTimeout(() => {
  addStep('6. Callback fires after 350ms');
  addStep('7. clearLines(boardData) — data removed');
  addStep('8. updateScore(2) — +300 pts');
  addStep('9. spawnNext() — new piece from queue');
  addStep('10. renderBoard() — display updated');
  addStep('11. start() — game loop resumed');
  addStep('');
  addStep('Key insight: stop() + async work + start()');
  addStep('The loop pauses during animation, then resumes.');
}, 350);`,
            outputHeight: 280,
        },

        // ─── PART 5: requestAnimationFrame ────────────────────────────────────────

        {
            type: 'js',
            instruction: `**\`requestAnimationFrame\` (rAF)** schedules a callback to run before the browser's next repaint — typically 60 times per second.

It's the right tool when you need to animate smoothly in JavaScript (e.g. canvas drawing, smooth counter increments). It's NOT what you need for CSS animations (those handle themselves). And it's NOT what you need for a game tick on a fixed interval (use \`setInterval\` for that).

For Tetris, rAF is useful for one specific case: **animating a number counter** — like watching the score count up when you clear lines.

\`\`\`js
function animateCounter(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(from + (to - from) * progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
\`\`\`

\`performance.now()\` gives the current time in milliseconds with sub-millisecond precision. Combined with rAF, this produces smooth frame-rate-independent animation.`,
            html: `<div id="rafDemo">
  <div id="counter" style="font-size:52px;font-weight:800;color:#22d3ee;font-family:monospace;margin-bottom:12px;">0</div>
  <button id="animBtn">Animate to 1500</button>
  <div id="rafLog" style="margin-top:8px;"></div>
</div>`,
            css: `body{background:#0a1220;padding:14px;}
button{padding:7px 16px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;}
#rafLog{color:#94a3b8;font-family:monospace;font-size:12px;margin-top:6px;}`,
            startCode: `function animateCounter(el, from, to, duration) {
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out: starts fast, slows at end
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);

    if (progress < 1) {
      requestAnimationFrame(step); // schedule next frame
    } else {
      document.querySelector('#rafLog').textContent =
        'Animation complete. Frames ran at ~60fps.';
    }
  }

  requestAnimationFrame(step); // kick off the first frame
}

const counter = document.querySelector('#counter');
let currentScore = 0;

document.querySelector('#animBtn').addEventListener('click', () => {
  const target = currentScore + 1500;
  document.querySelector('#rafLog').textContent =
    'Animating ' + currentScore + ' → ' + target + '...';
  animateCounter(counter, currentScore, target, 600);
  currentScore = target;
});`,
            outputHeight: 200,
        },

        // ─── PART 6: THE COMPLETE ANIMATION SYSTEM ────────────────────────────────

        {
            type: 'js',
            instruction: `Here's the complete animation system for Tetris, using all three techniques together:

1. **CSS transition** on \`.cell\` — smooth colour changes as pieces move
2. **CSS keyframe + classList** — flash animation on line clears
3. **setTimeout sequencing** — pause loop, flash, clear, resume
4. **rAF counter** — score animates up when lines clear

The key function is \`flashRowsThenClear\`:

\`\`\`js
function flashRowsThenClear(fullRowIndices, callback) {
  // Highlight the full rows in the DOM
  fullRowIndices.forEach(rowIdx => {
    for (let c = 0; c < COLS; c++) {
      cells[rowIdx * COLS + c].classList.add('clearing');
    }
  });

  // After animation, remove class and run callback
  setTimeout(() => {
    fullRowIndices.forEach(rowIdx => {
      for (let c = 0; c < COLS; c++) {
        cells[rowIdx * COLS + c].classList.remove('clearing');
      }
    });
    callback(); // do the actual clear + spawn
  }, 300);
}
\`\`\`

And the updated \`tick()\` calls it when lines are found:

\`\`\`js
const fullRowIndices = boardData
  .map((row, i) => row.every(v => v !== 0) ? i : -1)
  .filter(i => i !== -1);

if (fullRowIndices.length > 0) {
  stop();
  flashRowsThenClear(fullRowIndices, () => {
    clearLines(boardData);
    updateScore(fullRowIndices.length);
    spawnNext();
    start();
  });
}
\`\`\``,
            html: `<div id="systemDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#systemDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:14px;font-size:12px;line-height:2;}`,
            startCode: `document.querySelector('#systemDemo').innerHTML = [
  'The three-layer animation system:',
  '',
  '  LAYER 1 — CSS transition on .cell',
  '  transition: background 0.06s ease',
  '  Effect: pieces move smoothly as colours change',
  '  Cost: zero JS — browser handles it',
  '',
  '  LAYER 2 — CSS keyframe + classList toggle',
  '  .clearing { animation: flash 0.3s ease }',
  '  Effect: full rows flash white before disappearing',
  '  Cost: add class → setTimeout → remove class',
  '',
  '  LAYER 3 — requestAnimationFrame counter',
  '  animateCounter(el, from, to, duration)',
  '  Effect: score counts up visually',
  '  Cost: rAF loop until complete',
  '',
  '  SEQUENCING — setTimeout as the coordinator',
  '  stop() → flash (async) → callback: clear + spawn + start()',
  '  The game loop pauses during animation and resumes after.',
].join('<br>');`,
            outputHeight: 280,
        },

        // ─── PART 7: CHALLENGE ────────────────────────────────────────────────────

        {
            type: 'markdown',
            instruction: `## Your Turn

You have the complete animation toolkit:
- CSS \`transition\` on \`.cell\` — declare it in the CSS, zero JS required
- CSS \`@keyframes flash\` + \`classList.add/remove\` — triggered from JS
- \`flashRowsThenClear(indices, callback)\` — the sequencing function
- \`animateCounter(el, from, to, duration)\` — rAF score animation
- The updated \`tick()\` pattern: find full rows → stop → flash → clear → resume

**Your job:**

1. Add \`@keyframes flash\` to the CSS and a \`.clearing\` class
2. Implement \`flashRowsThenClear(indices, callback)\`
3. Update \`tick()\` to find full row indices, call \`stop()\`, then \`flashRowsThenClear\` with a callback that clears, scores, spawns, and calls \`start()\`
4. Add \`animateCounter\` and use it in \`updateScore\`

The game should feel noticeably different — rows flash before clearing, the score counts up visually.`,
        },

        {
            type: 'challenge',
            instruction: `**Challenge: Animate line clears and score.**

**CSS (already in the template):** Add \`transition: background 0.06s ease\` to \`.cell\`. Add \`@keyframes flash\` and \`.cell.clearing\`.

**\`flashRowsThenClear(rowIndices, callback)\`**
- For each index in \`rowIndices\`, loop \`c = 0..COLS-1\` and add \`'clearing'\` class to \`cells[rowIdx * COLS + c]\`
- \`setTimeout(300)\`: remove \`'clearing'\` from those same cells, then call \`callback()\`

**Updated \`tick()\`**
- After \`lockPiece\`, find full rows: \`boardData.map((row,i) => row.every(v=>v!==0)?i:-1).filter(i=>i!==-1)\`
- If any full rows: \`stop()\` then \`flashRowsThenClear(fullRows, () => { clearLines; updateScore; spawnNext; start() })\`
- If no full rows: spawn immediately (no animation needed)

**\`animateCounter(el, from, to, duration)\`**
- Use \`requestAnimationFrame\` with \`performance.now()\`
- Ease-out: \`const eased = 1 - Math.pow(1 - progress, 3)\`
- Set \`el.textContent = Math.round(from + (to - from) * eased)\` each frame

The test verifies \`flashRowsThenClear\` adds the \`clearing\` class to the correct cells.`,
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
      Level: <span id="levelVal">1</span>
    </div>
    <div id="status" style="font-family:monospace;font-size:11px;color:#94a3b8;line-height:1.6;"></div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}
@keyframes flash{0%{background:#0f1929;}35%{background:#ffffff;transform:scaleY(1.06);}100%{background:#0f1929;}}
.cell.clearing{animation:flash 0.3s ease forwards;}
@keyframes scorePop{0%{transform:scale(1);}50%{transform:scale(1.3);}100%{transform:scale(1);}}
.score-pop{animation:scorePop 0.25s ease;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pvCells,piece){pvCells.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}

// ── YOUR CODE: animateCounter ─────────────────────────────────────────────────
// Uses requestAnimationFrame + performance.now()
// Ease-out: const eased = 1 - Math.pow(1 - progress, 3)
function animateCounter(el, from, to, duration) {
  // YOUR CODE HERE
}

// ── YOUR CODE: flashRowsThenClear ─────────────────────────────────────────────
// rowIndices: array of row numbers that are full
// callback: called after the flash animation completes
// 1. Add 'clearing' class to every cell in each full row
// 2. setTimeout(300): remove 'clearing' class, call callback()
function flashRowsThenClear(rowIndices, callback) {
  // YOUR CODE HERE
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()],activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(highScore||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>highScore;if(n){highScore=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+highScore+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}

// ── YOUR CODE: updateScore with animateCounter ────────────────────────────────
function updateScore(cl){
  const prev=level;
  const points=(SCORE_TABLE[cl]||0)*level;
  const oldScore=score;
  score+=points;
  lines+=cl;level=Math.floor(lines/10)+1;
  // YOUR CODE HERE: use animateCounter for the score element
  // animateCounter(document.querySelector('#scoreVal'), oldScore, score, 400)
  document.querySelector('#scoreVal').textContent=score;
  document.querySelector('#linesVal').textContent=lines;
  document.querySelector('#levelVal').textContent=level;
  if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}
}

function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}

function spawnNext(){
  if(pieceQueue.length<7)pieceQueue.push(...makeBag());
  activePiece=pieceQueue.shift();
  renderPreview(previewCells,pieceQueue[0]);
}

// ── YOUR CODE: updated tick ───────────────────────────────────────────────────
// Find full row indices. If any: stop() → flashRowsThenClear → callback (clear+score+spawn+start)
// If none: spawnNext() directly
function tick(){
  const candidate=moveDown(activePiece);
  if(!isValidPosition(candidate,boardData)){
    lockPiece(activePiece,boardData);

    // YOUR CODE HERE:
    // const fullRows = boardData.map((row,i) => row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);
    // if (fullRows.length > 0) {
    //   stop();
    //   flashRowsThenClear(fullRows, () => {
    //     clearLines(boardData);
    //     updateScore(fullRows.length);
    //     spawnNext();
    //     renderBoard(cells,boardData,activePiece);
    //     if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
    //     start();
    //   });
    // } else {
    //   spawnNext();
    //   if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
    //   renderBoard(cells,boardData,activePiece);
    // }

    // PLACEHOLDER — remove when you implement above:
    const cl=clearLines(boardData);if(cl>0)updateScore(cl);spawnNext();
    if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}
    renderBoard(cells,boardData,activePiece);
  }else{activePiece=candidate;renderBoard(cells,boardData,activePiece);}
}

function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(c&&isValidPosition(c,boardData)){activePiece=c;renderBoard(cells,boardData,activePiece);}});

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
const status=document.querySelector('#status');
setTimeout(()=>{
  try{
    const hasFlash=typeof flashRowsThenClear==='function';
    const hasRAF=typeof animateCounter==='function';
    // Test flashRowsThenClear adds .clearing to correct cells
    let classAdded=false;
    if(hasFlash){
      flashRowsThenClear([19],()=>{});
      classAdded=cells[19*COLS].classList.contains('clearing');
    }
    const results=[
      'flashRowsThenClear(): '+(hasFlash?'✓':'✗'),
      'animateCounter(): '+(hasRAF?'✓':'✗'),
      '.clearing class added: '+(classAdded?'✓':'✗'),
    ];
    const pass=hasFlash&&hasRAF&&classAdded;
    status.innerHTML=results.join('<br>');
    status.style.color=pass?'#10b981':'#f87171';
  }catch(e){status.textContent='Error: '+e.message;status.style.color='#f87171';}
},200);
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pvCells,piece){pvCells.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,duration){const start=performance.now();function step(now){const progress=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-progress,3);el.textContent=Math.round(from+(to-from)*eased);if(progress<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function flashRowsThenClear(rowIndices,callback){rowIndices.forEach(rowIdx=>{for(let c=0;c<COLS;c++)cells[rowIdx*COLS+c].classList.add('clearing');});setTimeout(()=>{rowIndices.forEach(rowIdx=>{for(let c=0;c<COLS;c++)cells[rowIdx*COLS+c].classList.remove('clearing');});callback();},300);}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()],activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(highScore||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>highScore;if(n){highScore=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+highScore+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const points=(SCORE_TABLE[cl]||0)*level;const old=score;score+=points;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=candidate;renderBoard(cells,boardData,activePiece);}}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(c&&isValidPosition(c,boardData)){activePiece=c;renderBoard(cells,boardData,activePiece);}});
const status=document.querySelector('#status');
status.innerHTML='flashRowsThenClear(): ✓<br>animateCounter(): ✓<br>.clearing class added: ✓';
status.style.color='#10b981';
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            check: (code) => {
                const hasFlash = /function flashRowsThenClear/.test(code) &&
                    /classList\.add\s*\(\s*['"]clearing['"]\s*\)/.test(code) &&
                    /setTimeout/.test(code);
                const hasRAF = /function animateCounter/.test(code) &&
                    /requestAnimationFrame/.test(code) &&
                    /performance\.now/.test(code);
                const hasUpdatedTick = /fullRows|fr\.length|fullRowIndices/.test(code) &&
                    /flashRowsThenClear/.test(code) &&
                    /stop\s*\(\s*\)/.test(code);
                return hasFlash && hasRAF && hasUpdatedTick;
            },
            successMessage: `The game feels alive. Lines flash before clearing. Score counts up. The three-layer animation system — CSS transition + classList toggle + rAF counter — handles the whole thing with no janky frame drops.`,
            failMessage: `Three parts: (1) flashRowsThenClear adds .clearing to cells[rowIdx*COLS+c] for each full row, then setTimeout(300) removes it and calls callback. (2) animateCounter uses requestAnimationFrame + performance.now() with eased progress. (3) tick finds full rows with .map/.filter, then stop() → flashRowsThenClear → callback with clearLines+updateScore+spawnNext+start.`,
            outputHeight: 720,
        },

        // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

        {
            type: 'challenge',
            instruction: `**Bonus: Tetris flash (4-line clear special effect).**

When the player clears 4 lines at once — a Tetris — add a special full-board flash effect instead of the regular row flash.

For a Tetris (4 lines cleared):
1. Flash the entire board white (\`board.classList.add('tetris-flash')\`)
2. After 400ms, remove the class and proceed with the normal callback

Add \`@keyframes tetrisFlash\` to the CSS and modify \`flashRowsThenClear\` to detect when 4 rows are clearing and use the special effect.

Also display a "TETRIS!" text label that appears and fades out over the board.`,
            html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="tetrisLabel" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:monospace;font-weight:900;font-size:28px;color:#fbbf24;text-shadow:0 0 20px #f59e0b;pointer-events:none;white-space:nowrap;">TETRIS!</div>
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
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}
@keyframes flash{0%{background:#0f1929;}35%{background:#ffffff;transform:scaleY(1.06);}100%{background:#0f1929;}}
.cell.clearing{animation:flash 0.3s ease forwards;}
@keyframes tetrisFlash{0%{filter:brightness(1);}20%{filter:brightness(3);}40%{filter:brightness(1);}60%{filter:brightness(2.5);}80%{filter:brightness(1);}100%{filter:brightness(1);}}
#board.tetris-flash{animation:tetrisFlash 0.5s ease forwards;}
@keyframes tetrisLabel{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5);}30%{opacity:1;transform:translate(-50%,-50%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-50%) scale(1);}100%{opacity:0;transform:translate(-50%,-50%) scale(1);}}
#tetrisLabel.show{display:block;animation:tetrisLabel 0.8s ease forwards;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pvCells,piece){pvCells.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,duration){const start=performance.now();function step(now){const progress=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-progress,3);el.textContent=Math.round(from+(to-from)*eased);if(progress<1)requestAnimationFrame(step);}requestAnimationFrame(step);}

// YOUR CODE: flashRowsThenClear with Tetris special case
// If rowIndices.length === 4:
//   - Add 'tetris-flash' to #board
//   - Show #tetrisLabel with class 'show'
//   - setTimeout(500): remove 'tetris-flash', remove 'show', call callback
// Else:
//   - Normal flash behaviour (add .clearing, setTimeout(300), remove, callback)
function flashRowsThenClear(rowIndices, callback) {
  if (rowIndices.length === 4) {
    // YOUR CODE HERE — Tetris special effect
  } else {
    rowIndices.forEach(rowIdx => {
      for (let c = 0; c < COLS; c++) cells[rowIdx*COLS+c].classList.add('clearing');
    });
    setTimeout(() => {
      rowIndices.forEach(rowIdx => {
        for (let c = 0; c < COLS; c++) cells[rowIdx*COLS+c].classList.remove('clearing');
      });
      callback();
    }, 300);
  }
}

const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()],activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(highScore||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>highScore;if(n){highScore=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+highScore+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const points=(SCORE_TABLE[cl]||0)*level;const old=score;score+=points;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=candidate;renderBoard(cells,boardData,activePiece);}}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(c&&isValidPosition(c,boardData)){activePiece=c;renderBoard(cells,boardData,activePiece);}});
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pvCells,piece){pvCells.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,duration){const start=performance.now();function step(now){const progress=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-progress,3);el.textContent=Math.round(from+(to-from)*eased);if(progress<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function flashRowsThenClear(rowIndices,callback){
  if(rowIndices.length===4){
    const board=document.querySelector('#board');
    const label=document.querySelector('#tetrisLabel');
    board.classList.add('tetris-flash');
    label.classList.add('show');
    setTimeout(()=>{
      board.classList.remove('tetris-flash');
      label.classList.remove('show');
      callback();
    },500);
  }else{
    rowIndices.forEach(rowIdx=>{for(let c=0;c<COLS;c++)cells[rowIdx*COLS+c].classList.add('clearing');});
    setTimeout(()=>{rowIndices.forEach(rowIdx=>{for(let c=0;c<COLS;c++)cells[rowIdx*COLS+c].classList.remove('clearing');});callback();},300);
  }
}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()],activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(highScore||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>highScore;if(n){highScore=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+highScore+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const points=(SCORE_TABLE[cl]||0)*level;const old=score;score+=points;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=candidate;renderBoard(cells,boardData,activePiece);}}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(c&&isValidPosition(c,boardData)){activePiece=c;renderBoard(cells,boardData,activePiece);}});
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            check: (code) =>
                /rowIndices\.length\s*===\s*4/.test(code) &&
                /tetris-flash/.test(code) &&
                /tetrisLabel/.test(code),
            successMessage: `The Tetris flash fires on 4-line clears. The three-layer animation system now has a special fourth mode for the highest reward. This is how games communicate hierarchy — regular events get regular feedback, exceptional events get exceptional feedback.`,
            failMessage: `Check rowIndices.length === 4 in flashRowsThenClear. Add 'tetris-flash' to the #board element and 'show' to #tetrisLabel. setTimeout(500) to match the longer animation duration, then remove both classes and call callback().`,
            outputHeight: 720,
        },

        // ─── SEED ─────────────────────────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Here's what you have at the end of Lesson 9. A complete, polished Tetris game. Lines flash before clearing. The score counts up. Four-line clears get a special effect. The game communicates what's happening without the player having to read anything.

**What the game has at this point:**
- Board, pieces, collision, ghost piece, line clearing
- 7-bag randomiser, next-piece preview
- Scoring, levels, speed progression
- Game over screen, restart, high score
- CSS transitions on every cell movement
- Line-clear flash animation
- Tetris special effect
- Animated score counter

This is a shippable game. You built it from scratch.

**Lesson 10** is the final lesson: **Mobile and Touch Controls**. The game works perfectly on desktop. On a phone, there's no keyboard. We add on-screen buttons and swipe detection, and make the layout responsive with CSS media queries.`,
            html: `<div style="display:flex;gap:12px;align-items:flex-start;">
  <div style="position:relative;">
    <div id="board"></div>
    <div id="tetrisLabel" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:monospace;font-weight:900;font-size:28px;color:#fbbf24;text-shadow:0 0 20px #f59e0b;pointer-events:none;white-space:nowrap;">TETRIS!</div>
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
      Lesson 10:<br>Mobile touch<br>controls +<br>media queries
    </div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}
@keyframes flash{0%{background:#0f1929;}35%{background:#ffffff;transform:scaleY(1.06);}100%{background:#0f1929;}}
.cell.clearing{animation:flash 0.3s ease forwards;}
@keyframes tetrisFlash{0%{filter:brightness(1);}20%{filter:brightness(3);}40%{filter:brightness(1);}60%{filter:brightness(2.5);}100%{filter:brightness(1);}}
#board.tetris-flash{animation:tetrisFlash 0.5s ease forwards;}
@keyframes tetrisLabel{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5);}30%{opacity:1;transform:translate(-50%,-50%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-50%) scale(1);}100%{opacity:0;}}
#tetrisLabel.show{display:block;animation:tetrisLabel 0.8s ease forwards;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,boardData,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=boardData[r][c]||'';if(ap){let g=ap;while(isValidPosition(moveDown(g),boardData))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(g.y+r)*COLS+(g.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const idx=(ap.y+r)*COLS+(ap.x+c);if(idx>=0&&idx<cells.length)cells[idx].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValidPosition(piece,boardData){return piece.shape.every((row,r)=>row.every((val,c)=>{if(val===0)return true;const bc=piece.x+c,br=piece.y+r;if(bc<0||bc>=COLS||br>=ROWS)return false;if(boardData[br][bc]!==0)return false;return true;}));}
function clearLines(boardData){const rem=boardData.filter(row=>!row.every(v=>v!==0));const cl=boardData.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<boardData.length;r++)boardData[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pvCells,piece){pvCells.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,duration){const start=performance.now();function step(now){const p=Math.min((now-start)/duration,1);const e=1-Math.pow(1-p,3);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function flashRowsThenClear(rowIndices,callback){
  if(rowIndices.length===4){const board=document.querySelector('#board');const label=document.querySelector('#tetrisLabel');board.classList.add('tetris-flash');label.classList.add('show');setTimeout(()=>{board.classList.remove('tetris-flash');label.classList.remove('show');callback();},500);}
  else{rowIndices.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.add('clearing');});setTimeout(()=>{rowIndices.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.remove('clearing');});callback();},300);}
}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const previewCells=createPreview();
let pieceQueue=[...makeBag(),...makeBag()],activePiece=pieceQueue.shift();
let intervalId=null,score=0,lines=0,level=1;
let highScore=parseInt(localStorage.getItem('tetrisHighScore')||'0');
document.querySelector('#highScoreVal').textContent=highScore||'–';
function getSpeed(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pieceQueue=[...makeBag(),...makeBag()];activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);document.querySelector('#scoreVal').textContent='0';document.querySelector('#linesVal').textContent='0';document.querySelector('#levelVal').textContent='1';}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(highScore||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>highScore;if(n){highScore=score;localStorage.setItem('tetrisHighScore',score);document.querySelector('#highScoreVal').textContent=highScore;}ms.innerHTML='Score: '+score+'<br>Best: '+highScore+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function startOrRestart(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const points=(SCORE_TABLE[cl]||0)*level;const old=score;score+=points;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(intervalId);intervalId=setInterval(tick,getSpeed());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pieceQueue.length<7)pieceQueue.push(...makeBag());activePiece=pieceQueue.shift();renderPreview(previewCells,pieceQueue[0]);}
function tick(){const candidate=moveDown(activePiece);if(!isValidPosition(candidate,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=candidate;renderBoard(cells,boardData,activePiece);}}
function start(){if(intervalId!==null)return;intervalId=setInterval(tick,getSpeed());}
function stop(){if(intervalId===null)return;clearInterval(intervalId);intervalId=null;}
document.querySelector('#overlayBtn').addEventListener('click',startOrRestart);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(activePiece);if(e.key==='ArrowRight')c=moveRight(activePiece);if(e.key==='ArrowDown')c=moveDown(activePiece);if(e.key==='ArrowUp')c=rotateShape(activePiece);if(e.key===' '){let d=activePiece;while(isValidPosition(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(e.key==='ArrowDown'&&!isValidPosition(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValidPosition(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else if(c&&isValidPosition(c,boardData)){activePiece=c;renderBoard(cells,boardData,activePiece);}});
renderUI();renderPreview(previewCells,pieceQueue[0]);`,
            outputHeight: 660,
        },

    ],
};

export default {
    id: 'tetris-09-polish-animation',
    slug: 'tetris-polish-animation',
    chapter: 'tetris.1',
    order: 9,
    title: 'Polish and Animation',
    subtitle: 'Line-clear flash, animated score, and Tetris special effects — using CSS transitions, keyframes, classList, and requestAnimationFrame',
    tags: ['css-transitions', 'css-animations', 'keyframes', 'classList', 'requestAnimationFrame', 'setTimeout-sequencing', 'polish'],
    hook: {
        question: 'How do you make a game feel good — not just work correctly?',
        realWorldContext:
            'Animation is information. Every good UI uses CSS transitions for micro-interactions, keyframe animations for discrete events, and rAF for smooth counter updates. The patterns here are identical to what you\'ll use in production web apps.',
        previewVisualizationId: 'JSNotebook',
    },
    intuition: {
        prose: [
            'CSS transition: declare on the element, browser handles the interpolation. Zero JS.',
            'CSS keyframe + classList: add a class to start an animation, setTimeout to remove it.',
            'The sequencing pattern: stop() → async animation → callback: clear + score + spawn + start().',
            'requestAnimationFrame: schedules callbacks at 60fps. Use for JS-driven smooth animation, not for the game tick.',
            'Animation is information — flash tells the player what cleared, score counting up confirms the reward.',
        ],
        callouts: [
            {
                type: 'important',
                title: 'Stop the Loop During Animation',
                body: 'The game loop must be paused while the line-clear animation plays. Call stop() before flashRowsThenClear and start() inside the callback. Otherwise the loop tries to spawn a new piece while the old rows are still flashing.',
            },
            {
                type: 'tip',
                title: 'CSS Transition vs CSS Animation',
                body: 'Use transition when you\'re changing a value and want it to interpolate smoothly. Use @keyframes when you want to define a multi-step sequence that plays automatically. Both can be triggered by classList changes.',
            },
        ],
        visualizations: [
            {
                id: 'JSNotebook',
                title: 'Tetris — Lesson 9: Polish and Animation',
                props: { lesson: LESSON_TETRIS_09 },
            },
        ],
    },
    math: { prose: [], callouts: [], visualizations: [] },
    rigor: { prose: [], callouts: [], visualizations: [] },
    examples: [],
    challenges: [],
    mentalModel: [
        'CSS transition: property + duration + easing declared in CSS. JS just changes the value.',
        '@keyframes: define steps from 0% to 100%. Applied via a class. Removed after duration.',
        'classList.add("clearing") → animation plays. setTimeout(300) → classList.remove("clearing").',
        'Sequencing: stop() → flashRowsThenClear(rows, callback) → callback: clearLines + updateScore + spawnNext + start().',
        'animateCounter: performance.now() + requestAnimationFrame + ease-out interpolation.',
        'rAF fires before each browser repaint (~60fps). Use for smooth JS-driven visual updates.',
    ],
    checkpoints: ['read-intuition'],
    quiz: [],
};