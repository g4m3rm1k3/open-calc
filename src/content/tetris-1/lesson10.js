// LESSON_TETRIS_10.js
// Lesson 10 — Mobile and Touch Controls
// The problem: the game only works on desktop. On a phone there's
// no keyboard. Players need on-screen buttons and swipe gestures.
// Concepts: touch events (touchstart/move/end), swipe detection,
//           CSS media queries, responsive layout, the viewport
//           meta tag, and what "deploying a static site" means.

const LESSON_TETRIS_10 = {
    title: 'Mobile and Touch Controls',
    subtitle: 'Add swipe gestures, on-screen buttons, and responsive layout — so the game works on any device.',
    sequential: true,
    cells: [

        // ─── PART 1: RECAP ────────────────────────────────────────────────────────

        {
            type: 'markdown',
            instruction: `## Recap: What we built in Lesson 9

By the end of Lesson 9 you had a polished, complete game:

\`\`\`js
flashRowsThenClear(rowIndices, callback)
// add .clearing class → setTimeout(300) → remove class → callback
// if 4 rows: tetris-flash + TETRIS! label instead

animateCounter(el, from, to, duration)
// requestAnimationFrame + performance.now() + ease-out cubic
\`\`\`

The sequencing rule:

> **stop() before any async animation. start() inside the callback. The loop pauses during animation and resumes after.**

The game looks and feels good. Lines flash. Score counts up. Tetrises get special treatment.

---

## The problem we face now

Open the game on a phone. There's no keyboard. You can't play it.

Mobile is where most people will encounter your game. A desktop-only game is half a game. We need:

1. **Touch controls** — swipe left/right/down to move, tap to rotate, swipe up for hard drop
2. **On-screen D-pad** — buttons for players who prefer explicit controls over gestures
3. **Responsive layout** — the board scales to fit small screens without scrolling
4. **Viewport meta tag** — prevents the browser from scaling the page wrong on mobile

All four require different tools. Touch events for gestures. CSS media queries for responsive layout. The viewport meta tag is a one-liner. On-screen buttons are just regular buttons wired to the same functions you already have.`,
        },

        // ─── RECAP CELL ───────────────────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Here's the Lesson 9 game. Try using it with only the mouse — no keyboard. You can't control the pieces at all. There's no way to play without a keyboard.

Before continuing: think about what gestures would feel natural on a touchscreen for Tetris. What would left/right/down/rotate map to?

The standard mapping:
- **Swipe left** → move left
- **Swipe right** → move right
- **Swipe down** → soft drop
- **Tap** → rotate
- **Swipe up** → hard drop`,
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
      <div style="font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:6px;">NEXT</div>
      <div id="previewGrid"></div>
    </div>
    <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;">
      Score<br><span id="scoreVal" style="font-size:16px;font-weight:700;color:#22d3ee;">0</span><br>
      Lines: <span id="linesVal">0</span><br>
      Level: <span id="levelVal">1</span>
    </div>
    <div style="color:#f87171;font-family:monospace;font-size:11px;border:1px solid #7f1d1d;border-radius:6px;padding:8px;background:#1c0a0a;line-height:1.6;">
      No touch<br>controls.<br>Mobile<br>unplayable.
    </div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:20px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}
@keyframes flash{0%{background:#0f1929;}35%{background:#ffffff;transform:scaleY(1.06);}100%{background:#0f1929;}}
.cell.clearing{animation:flash 0.3s ease forwards;}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,bd,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=bd[r][c]||'';if(ap){let g=ap;while(isValid(moveDown(g),bd))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(g.y+r)*COLS+(g.x+c);if(i>=0&&i<cells.length)cells[i].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(ap.y+r)*COLS+(ap.x+c);if(i>=0&&i<cells.length)cells[i].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValid(p,bd){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS&&bd[br][bc]===0;}));}
function clearLines(bd){const rem=bd.filter(row=>!row.every(v=>v!==0));const cl=bd.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<bd.length;r++)bd[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pv,piece){pv.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,dur){const s=performance.now();function step(n){const p=Math.min((n-s)/dur,1);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function flashRowsThenClear(rows,cb){rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.add('clearing');});setTimeout(()=>{rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.remove('clearing');});cb();},300);}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const pv=createPreview();
let pq=[...makeBag(),...makeBag()],ap=pq.shift();
let iid=null,score=0,lines=0,level=1;
let hs=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function gs(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pq=[...makeBag(),...makeBag()];ap=pq.shift();renderPreview(pv,pq[0]);['scoreVal','linesVal','levelVal'].forEach((id,i)=>document.querySelector('#'+id).textContent=[0,0,1][i]);}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(hs||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>hs;if(n){hs=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+hs+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function sar(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,ap);start();}
function updateScore(cl){const prev=level;const old=score;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(iid);iid=setInterval(tick,gs());}}
function hgo(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pq.length<7)pq.push(...makeBag());ap=pq.shift();renderPreview(pv,pq[0]);}
function tick(){const c=moveDown(ap);if(!isValid(c,boardData)){lockPiece(ap,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,ap);if(!isValid(ap,boardData)){hgo();return;}start();});}else{spawnNext();if(!isValid(ap,boardData)){hgo();return;}renderBoard(cells,boardData,ap);}}else{ap=c;renderBoard(cells,boardData,ap);}}
function start(){if(iid!==null)return;iid=setInterval(tick,gs());}
function stop(){if(iid===null)return;clearInterval(iid);iid=null;}
document.querySelector('#overlayBtn').addEventListener('click',sar);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();let c;if(e.key==='ArrowLeft')c=moveLeft(ap);if(e.key==='ArrowRight')c=moveRight(ap);if(e.key==='ArrowDown')c=moveDown(ap);if(e.key==='ArrowUp')c=rotateShape(ap);if(e.key===' '){let d=ap;while(isValid(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,ap);if(!isValid(ap,boardData)){hgo();return;}start();});}else{spawnNext();if(!isValid(ap,boardData)){hgo();return;}renderBoard(cells,boardData,ap);}}else if(e.key==='ArrowDown'&&!isValid(c,boardData)){lockPiece(ap,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,ap);if(!isValid(ap,boardData)){hgo();return;}start();});}else{spawnNext();if(!isValid(ap,boardData)){hgo();return;}renderBoard(cells,boardData,ap);}}else if(c&&isValid(c,boardData)){ap=c;renderBoard(cells,boardData,ap);}});
renderUI();renderPreview(pv,pq[0]);`,
            outputHeight: 640,
        },

        // ─── PART 2: TOUCH EVENTS ─────────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Touch events fire when a finger contacts, moves across, or lifts from a touchscreen.

The three events you need:
- **\`touchstart\`** — fires when a finger touches the screen. Records where the touch began.
- **\`touchmove\`** — fires repeatedly as the finger moves. Used to track swipe direction.
- **\`touchend\`** — fires when the finger lifts. Calculate the delta and classify the gesture.

Each event gives you a \`touches\` array (all current finger contacts) and a \`changedTouches\` array (fingers that changed). For single-touch swipes, use \`changedTouches[0]\`.

Properties you need:
- \`touch.clientX\` — horizontal position in viewport pixels
- \`touch.clientY\` — vertical position in viewport pixels

**Critical:** call \`event.preventDefault()\` in \`touchmove\` to stop the browser from scrolling the page while the player is swiping.`,
            html: `<div id="touchDemo">
  <div id="touchArea">Touch here</div>
  <div id="touchLog"></div>
</div>`,
            css: `body{background:#0a1220;padding:14px;}
#touchArea{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;padding:40px;text-align:center;font-family:monospace;font-size:13px;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;}
#touchArea.active{border-color:#22d3ee;color:#22d3ee;background:#082f49;}
#touchLog{border:1px solid #334155;border-radius:8px;background:#111827;color:#94a3b8;font-family:monospace;padding:10px;font-size:12px;line-height:1.8;margin-top:8px;min-height:80px;}`,
            startCode: `const area = document.querySelector('#touchArea');
const log  = document.querySelector('#touchLog');

let startX = 0, startY = 0;

area.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  area.classList.add('active');
  log.textContent = 'touchstart: x=' + Math.round(startX) + ' y=' + Math.round(startY);
}, { passive: false });

area.addEventListener('touchmove', (e) => {
  e.preventDefault(); // stop page scroll while swiping
  const touch = e.changedTouches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;
  log.textContent = 'touchmove: Δx=' + Math.round(dx) + ' Δy=' + Math.round(dy);
}, { passive: false });

area.addEventListener('touchend', (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;
  area.classList.remove('active');
  log.innerHTML =
    'touchend: Δx=' + Math.round(dx) + ' Δy=' + Math.round(dy) + '<br>' +
    'dominant: ' + (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '→ right' : '← left') : (dy > 0 ? '↓ down' : '↑ up'));
}, { passive: false });

// Also works with mouse for desktop testing
area.addEventListener('mousedown', (e) => { startX=e.clientX; startY=e.clientY; area.classList.add('active'); });
area.addEventListener('mouseup',   (e) => { const dx=e.clientX-startX,dy=e.clientY-startY; area.classList.remove('active'); log.innerHTML='mouseup: Δx='+Math.round(dx)+' Δy='+Math.round(dy)+'<br>dominant: '+(Math.abs(dx)>Math.abs(dy)?(dx>0?'→ right':'← left'):(dy>0?'↓ down':'↑ up')); });`,
            outputHeight: 220,
        },

        // ─── PART 3: SWIPE DETECTION ──────────────────────────────────────────────

        {
            type: 'js',
            instruction: `Swipe detection turns raw touch delta values into a gesture name: \`'left'\`, \`'right'\`, \`'up'\`, \`'down'\`, or \`'tap'\`.

The algorithm:
1. On \`touchstart\`: record \`startX\`, \`startY\`
2. On \`touchend\`: calculate \`dx = endX - startX\`, \`dy = endY - startY\`
3. If \`Math.abs(dx) < threshold && Math.abs(dy) < threshold\`: it's a **tap** (no significant movement)
4. Otherwise: compare \`Math.abs(dx)\` vs \`Math.abs(dy)\` to find the dominant axis
5. The dominant axis + sign → the gesture direction

A good threshold is **10px**. Smaller values mistake tiny tremors for taps. Larger values make swipes feel unresponsive.

This function is the complete swipe classifier:

\`\`\`js
function classifySwipe(dx, dy, threshold = 10) {
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return 'tap';
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}
\`\`\``,
            html: `<div id="swipeDemo">
  <div id="swipeArea">Swipe or tap here<br><span style="font-size:11px;opacity:.6;">(works with mouse drag too)</span></div>
  <div id="swipeResult"></div>
</div>`,
            css: `body{background:#0a1220;padding:14px;}
#swipeArea{border:2px solid #334155;border-radius:12px;background:#111827;color:#94a3b8;padding:50px 20px;text-align:center;font-family:monospace;font-size:13px;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;transition:border-color .15s;}
#swipeArea.active{border-color:#4f46e5;}
#swipeResult{margin-top:10px;font-family:monospace;font-size:28px;font-weight:800;text-align:center;min-height:44px;transition:all .15s;}`,
            startCode: `function classifySwipe(dx, dy, threshold = 10) {
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return 'tap';
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

const GESTURE_DISPLAY = {
  left:  { icon: '←', color: '#22d3ee', label: 'move left' },
  right: { icon: '→', color: '#22d3ee', label: 'move right' },
  down:  { icon: '↓', color: '#10b981', label: 'soft drop' },
  up:    { icon: '↑', color: '#f59e0b', label: 'hard drop' },
  tap:   { icon: '↻', color: '#a78bfa', label: 'rotate' },
};

const area   = document.querySelector('#swipeArea');
const result = document.querySelector('#swipeResult');
let sx = 0, sy = 0;

function onStart(x, y) { sx = x; sy = y; area.classList.add('active'); }
function onEnd(x, y) {
  area.classList.remove('active');
  const gesture = classifySwipe(x - sx, y - sy);
  const d = GESTURE_DISPLAY[gesture];
  result.textContent = d.icon + '  ' + d.label;
  result.style.color = d.color;
}

area.addEventListener('touchstart', e => { e.preventDefault(); const t=e.changedTouches[0]; onStart(t.clientX,t.clientY); }, {passive:false});
area.addEventListener('touchend',   e => { e.preventDefault(); const t=e.changedTouches[0]; onEnd(t.clientX,t.clientY); },   {passive:false});
area.addEventListener('mousedown',  e => onStart(e.clientX, e.clientY));
area.addEventListener('mouseup',    e => onEnd(e.clientX, e.clientY));

result.textContent = 'Waiting...';
result.style.color = '#475569';`,
            outputHeight: 220,
        },

        // ─── PART 4: CSS MEDIA QUERIES ────────────────────────────────────────────

        {
            type: 'js',
            instruction: `**CSS media queries** let you apply different styles depending on the device's screen width. They're the foundation of responsive design.

\`\`\`css
/* Default: desktop */
#gameWrap {
  display: flex;
  gap: 12px;
}

/* Small screens: stack vertically */
@media (max-width: 480px) {
  #gameWrap {
    flex-direction: column;
    align-items: center;
  }
  .cell {
    width: 22px;
    height: 22px;
  }
}
\`\`\`

The \`@media (max-width: 480px)\` block only applies when the viewport is 480px wide or narrower — i.e. on phones.

For Tetris specifically:
- On mobile: shrink the cell size from 28px to ~22px so the board fits
- Stack the layout vertically (board on top, controls below)
- Show the on-screen D-pad (hidden on desktop where keyboard is available)
- Hide the preview panel or move it above the board

Media queries are evaluated continuously — resize the browser window and styles update instantly.`,
            html: `<div id="mqDemo">
  <div id="mqBox">
    <div id="mqLabel">Resize your browser window to see this change</div>
    <div id="mqGrid"></div>
  </div>
</div>`,
            css: `body{background:#0a1220;padding:14px;}
#mqBox{border:1px solid #334155;border-radius:8px;background:#111827;padding:14px;}
#mqLabel{font-family:monospace;font-size:12px;color:#94a3b8;margin-bottom:10px;}
#mqGrid{display:grid;grid-template-columns:repeat(10,28px);gap:2px;}
.mq-cell{width:28px;height:28px;border-radius:2px;background:#22d3ee22;border:1px solid #22d3ee44;}

/* On narrow viewports, shrink cells */
@media(max-width:480px){
  #mqGrid{grid-template-columns:repeat(10,22px);}
  .mq-cell{width:22px;height:22px;}
  #mqLabel{color:#a78bfa;}
}
@media(max-width:360px){
  #mqGrid{grid-template-columns:repeat(10,18px);}
  .mq-cell{width:18px;height:18px;}
}`,
            startCode: `// Build 10 demo cells
const grid = document.querySelector('#mqGrid');
for (let i = 0; i < 10; i++) {
  const cell = document.createElement('div');
  cell.className = 'mq-cell';
  grid.appendChild(cell);
}

// Show current viewport width — updates on resize
function updateLabel() {
  const w = window.innerWidth;
  let size = w <= 360 ? '18px (very narrow)' : w <= 480 ? '22px (narrow)' : '28px (normal)';
  document.querySelector('#mqLabel').textContent =
    'Viewport: ' + w + 'px → cell size: ' + size;
}

updateLabel();
window.addEventListener('resize', updateLabel);`,
            outputHeight: 140,
        },

        // ─── PART 5: THE VIEWPORT META TAG ────────────────────────────────────────

        {
            type: 'js',
            instruction: `Without the viewport meta tag, mobile browsers scale your page to fit the desktop width — making everything tiny. This is the single most common reason a web page looks broken on mobile.

Add this to your HTML \`<head>\`:

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1">
\`\`\`

What it does:
- \`width=device-width\` — sets the viewport width to the actual device width in CSS pixels
- \`initial-scale=1\` — no zoom on load

Without it: browser assumes a 980px-wide viewport, scales everything down to fit the phone screen, and your 28px cells become ~8px.

With it: the viewport is the actual screen width, CSS pixels match physical pixels at 1:1, and your media queries fire correctly.

This tag goes in every HTML page you ever ship. It's not optional for mobile. You should be unable to press "Deploy" without checking it exists.`,
            html: `<div id="vpDemo"></div>`,
            css: `body{background:#0a1220;padding:14px;}
#vpDemo{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.9;}`,
            startCode: `document.querySelector('#vpDemo').innerHTML = [
  '&lt;!-- This goes in &lt;head&gt;, before any CSS --&gt;',
  '&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;',
  '',
  '// What happens WITHOUT it:',
  '//   Browser assumes viewport = 980px',
  '//   Scales everything down to fit 390px phone',
  '//   Scale factor ≈ 0.4 — everything is tiny',
  '//   Media query @media(max-width:480px) never fires',
  '',
  '// What happens WITH it:',
  '//   Viewport = actual screen width (e.g. 390px)',
  '//   CSS pixels = device pixels at 1:1',
  '//   @media(max-width:480px) fires correctly',
  '//   Touch targets are full size',
  '',
  '// Check: does your HTML file have this tag?',
  '// If not, mobile is broken. Add it now.',
].join('<br>');`,
            outputHeight: 220,
        },

        // ─── PART 6: ON-SCREEN D-PAD ──────────────────────────────────────────────

        {
            type: 'js',
            instruction: `On-screen buttons are the most straightforward mobile control: just buttons that call the same movement functions the keyboard calls.

The D-pad layout:

\`\`\`
        [ ↻ Rotate ]
[ ← ]  [ ↓ Drop ]  [ → ]
        [ ⬇ Hard Drop ]
\`\`\`

Wire each button to \`mousedown\` (not \`click\`) so they work instantly on touch without the 300ms delay that old mobile browsers added to \`click\` events. Modern iOS/Android don't have this delay, but it's still good practice.

On mobile you want \`touchstart\` instead of \`mousedown\` on the buttons to prevent the browser from triggering both touch and mouse events:

\`\`\`js
btn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (gameState !== STATE.PLAYING) return;
  // trigger the action
});
\`\`\`

\`pointerdown\` fires for both mouse and touch — one handler for both input types.`,
            html: `<div id="dpadDemo">
  <div id="dpadResult">Press a button</div>
  <div id="dpad">
    <div></div>
    <button data-action="rotate">↻</button>
    <div></div>
    <button data-action="left">←</button>
    <button data-action="down">↓</button>
    <button data-action="right">→</button>
    <div></div>
    <button data-action="drop">⬇</button>
    <div></div>
  </div>
</div>`,
            css: `body{background:#0a1220;padding:14px;}
#dpadDemo{display:flex;flex-direction:column;align-items:center;gap:12px;}
#dpadResult{font-family:monospace;font-size:16px;font-weight:700;color:#22d3ee;min-height:28px;}
#dpad{display:grid;grid-template-columns:repeat(3,52px);gap:6px;}
#dpad button{width:52px;height:52px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;}
#dpad button:active{background:#334155;transform:scale(.94);}
#dpad div{width:52px;height:52px;}`,
            startCode: `const result = document.querySelector('#dpadResult');
const actions = {
  rotate: '↻ rotate',
  left:   '← move left',
  down:   '↓ soft drop',
  right:  '→ move right',
  drop:   '⬇ hard drop',
};

// Wire all buttons with a single delegated listener
document.querySelector('#dpad').addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  e.preventDefault();
  const action = btn.dataset.action;
  result.textContent = actions[action] || '?';
  result.style.transform = 'scale(1.1)';
  setTimeout(() => result.style.transform = 'scale(1)', 100);
});

// In the real game, each action calls the same function as the keyboard:
// rotate  → rotateShape(activePiece) → validate → commit → render
// left    → moveLeft(activePiece) → validate → commit → render
// etc.`,
            outputHeight: 240,
        },

        // ─── PART 7: CHALLENGE ────────────────────────────────────────────────────

        {
            type: 'markdown',
            instruction: `## Your Turn

You have the complete mobile toolkit:
- \`touchstart / touchend\` event listeners with \`e.preventDefault()\`
- \`classifySwipe(dx, dy, threshold)\` — returns \`'left'\`, \`'right'\`, \`'down'\`, \`'up'\`, or \`'tap'\`
- \`@media (max-width: 480px)\` CSS for smaller cells and stacked layout
- The viewport meta tag (in the HTML head)
- On-screen D-pad with \`pointerdown\` listeners

**Your job:**

1. Implement \`classifySwipe(dx, dy)\` — the swipe classifier
2. Add touch event listeners to the \`#board\` element that call the correct game actions
3. Add the on-screen D-pad and wire each button to its game action
4. Add media query CSS to shrink cells and show the D-pad on mobile
5. Handle the \`'tap'\` gesture as rotate

All touch gestures call the same functions the keyboard handler calls — no new game logic, just new input wiring.`,
        },

        {
            type: 'challenge',
            instruction: `**Challenge: Full mobile controls.**

**\`classifySwipe(dx, dy, threshold = 10)\`**
- If \`Math.abs(dx) < threshold && Math.abs(dy) < threshold\`: return \`'tap'\`
- If horizontal dominant (\`Math.abs(dx) > Math.abs(dy)\`): return \`'left'\` or \`'right'\`
- Else: return \`'up'\` or \`'down'\`

**Touch listeners on \`#board\`**
- \`touchstart\`: record \`startX = e.changedTouches[0].clientX\`, \`startY\`
- \`touchend\`: classify the swipe, then call the matching game action (same logic as keyboard handler)
- Both with \`{ passive: false }\` and \`e.preventDefault()\`

**D-pad buttons (already in HTML)**
- Find each button by \`data-action\` attribute
- Each \`pointerdown\`: \`e.preventDefault()\`, check \`gameState === STATE.PLAYING\`, call the action

**CSS (add to the stylesheet)**
\`\`\`css
#dpad { display: none; }
@media (max-width: 520px) {
  #dpad { display: grid; }
  .cell { width: 22px; height: 22px; }
}
\`\`\`

The auto-test verifies \`classifySwipe\` returns the correct gesture for four directions and a tap.`,
            html: `<div id="gameWrap">
  <div style="display:flex;gap:10px;align-items:flex-start;">
    <div style="position:relative;">
      <div id="board"></div>
      <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
        <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
        <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
        <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;min-width:100px;">
      <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;">
        <div style="font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:6px;">NEXT</div>
        <div id="previewGrid"></div>
      </div>
      <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;">
        Score<br><span id="scoreVal" style="font-size:14px;font-weight:700;color:#22d3ee;">0</span><br>
        Lines: <span id="linesVal">0</span><br>
        Level: <span id="levelVal">1</span>
      </div>
      <div id="status" style="font-family:monospace;font-size:11px;color:#94a3b8;line-height:1.6;"></div>
    </div>
  </div>
  <!-- On-screen D-pad -->
  <div id="dpad">
    <div></div><button id="btnRotate">↻</button><div></div>
    <button id="btnLeft">←</button><button id="btnDown">↓</button><button id="btnRight">→</button>
    <div></div><button id="btnDrop">⬇</button><div></div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:16px;}
#gameWrap{display:flex;flex-direction:column;align-items:flex-start;gap:12px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;touch-action:none;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}
@keyframes flash{0%{background:#0f1929;}35%{background:#fff;transform:scaleY(1.06);}100%{background:#0f1929;}}
.cell.clearing{animation:flash 0.3s ease forwards;}
/* D-pad — hidden by default, shown on narrow screens */
#dpad{display:none;grid-template-columns:repeat(3,56px);gap:8px;margin-top:4px;}
#dpad button{width:56px;height:56px;border-radius:12px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:22px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;}
#dpad button:active{background:#334155;transform:scale(.92);}
#dpad div{width:56px;height:56px;}
/* Show D-pad and shrink cells on mobile */
@media(max-width:520px){
  #dpad{display:grid;}
  #board{grid-template-columns:repeat(10,22px);grid-template-rows:repeat(20,22px);}
  .cell{width:22px;height:22px;}
}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,bd,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=bd[r][c]||'';if(ap){let g=ap;while(isValid(moveDown(g),bd))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(g.y+r)*COLS+(g.x+c);if(i>=0&&i<cells.length)cells[i].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(ap.y+r)*COLS+(ap.x+c);if(i>=0&&i<cells.length)cells[i].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValid(p,bd){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS&&bd[br][bc]===0;}));}
function clearLines(bd){const rem=bd.filter(row=>!row.every(v=>v!==0));const cl=bd.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<bd.length;r++)bd[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pv,piece){pv.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,dur){const s=performance.now();function step(n){const p=Math.min((n-s)/dur,1);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function flashRowsThenClear(rows,cb){rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.add('clearing');});setTimeout(()=>{rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.remove('clearing');});cb();},300);}

// ── YOUR CODE: classifySwipe ──────────────────────────────────────────────────
// Returns 'left', 'right', 'up', 'down', or 'tap'
// threshold = 10px — less than this = tap
function classifySwipe(dx, dy, threshold = 10) {
  // YOUR CODE HERE
}

const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const pv=createPreview();
let pq=[...makeBag(),...makeBag()],activePiece=pq.shift();
let iid=null,score=0,lines=0,level=1;
let hs=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function gs(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pq=[...makeBag(),...makeBag()];activePiece=pq.shift();renderPreview(pv,pq[0]);['scoreVal','linesVal','levelVal'].forEach((id,i)=>document.querySelector('#'+id).textContent=[0,0,1][i]);}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(hs||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>hs;if(n){hs=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+hs+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function sar(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const old=score;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(iid);iid=setInterval(tick,gs());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pq.length<7)pq.push(...makeBag());activePiece=pq.shift();renderPreview(pv,pq[0]);}

// The shared action executor — called by keyboard, touch, and D-pad
function executeAction(action) {
  if (gameState !== STATE.PLAYING) return;
  let candidate;
  if (action === 'left')   candidate = moveLeft(activePiece);
  if (action === 'right')  candidate = moveRight(activePiece);
  if (action === 'down')   candidate = moveDown(activePiece);
  if (action === 'rotate') candidate = rotateShape(activePiece);
  if (action === 'drop') {
    let d = activePiece;
    while (isValid(moveDown(d), boardData)) d = moveDown(d);
    lockPiece(d, boardData);
    const fr = boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);
    if (fr.length > 0) { stop(); flashRowsThenClear(fr, () => { clearLines(boardData); updateScore(fr.length); spawnNext(); renderBoard(cells,boardData,activePiece); if(!isValid(activePiece,boardData)){handleGameOver();return;} start(); }); }
    else { spawnNext(); if(!isValid(activePiece,boardData)){handleGameOver();return;} renderBoard(cells,boardData,activePiece); }
    return;
  }
  if (action === 'down' && candidate && !isValid(candidate, boardData)) {
    lockPiece(activePiece, boardData);
    const fr = boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);
    if (fr.length > 0) { stop(); flashRowsThenClear(fr, () => { clearLines(boardData); updateScore(fr.length); spawnNext(); renderBoard(cells,boardData,activePiece); if(!isValid(activePiece,boardData)){handleGameOver();return;} start(); }); }
    else { spawnNext(); if(!isValid(activePiece,boardData)){handleGameOver();return;} renderBoard(cells,boardData,activePiece); }
    return;
  }
  if (candidate && isValid(candidate, boardData)) {
    activePiece = candidate;
    renderBoard(cells, boardData, activePiece);
  }
}

function tick(){const c=moveDown(activePiece);if(!isValid(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValid(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValid(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=c;renderBoard(cells,boardData,activePiece);}}
function start(){if(iid!==null)return;iid=setInterval(tick,gs());}
function stop(){if(iid===null)return;clearInterval(iid);iid=null;}
document.querySelector('#overlayBtn').addEventListener('click',sar);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')executeAction('left');else if(e.key==='ArrowRight')executeAction('right');else if(e.key==='ArrowDown')executeAction('down');else if(e.key==='ArrowUp')executeAction('rotate');else if(e.key===' ')executeAction('drop');});

// ── YOUR CODE: touch swipe on the board ──────────────────────────────────────
// touchstart: record startX, startY from e.changedTouches[0]
// touchend: classifySwipe(dx, dy) → executeAction(gesture === 'tap' ? 'rotate' : gesture)
// Both: e.preventDefault(), { passive: false }
let touchStartX = 0, touchStartY = 0;
const boardEl = document.querySelector('#board');
// YOUR CODE HERE

// ── YOUR CODE: D-pad buttons ──────────────────────────────────────────────────
// Wire each button's pointerdown to executeAction with the correct action name
// btnRotate → 'rotate', btnLeft → 'left', btnDown → 'down', btnRight → 'right', btnDrop → 'drop'
// YOUR CODE HERE

// ── AUTO-TEST ─────────────────────────────────────────────────────────────────
const status = document.querySelector('#status');
try {
  const hasFn = typeof classifySwipe === 'function';
  let results = ['classifySwipe defined: ' + (hasFn ? '✓' : '✗')];
  if (hasFn) {
    results.push('left (dx=-40,dy=0):   ' + (classifySwipe(-40, 0) === 'left'  ? '✓' : '✗ got: ' + classifySwipe(-40,0)));
    results.push('right (dx=40,dy=0):   ' + (classifySwipe( 40, 0) === 'right' ? '✓' : '✗ got: ' + classifySwipe(40,0)));
    results.push('down (dx=0,dy=40):    ' + (classifySwipe(  0,40) === 'down'  ? '✓' : '✗ got: ' + classifySwipe(0,40)));
    results.push('tap (dx=2,dy=3):      ' + (classifySwipe(  2, 3) === 'tap'   ? '✓' : '✗ got: ' + classifySwipe(2,3)));
  }
  const pass = hasFn &&
    classifySwipe(-40, 0) === 'left' && classifySwipe(40, 0) === 'right' &&
    classifySwipe(0, 40)  === 'down' && classifySwipe(2,  3) === 'tap';
  status.innerHTML = results.join('<br>');
  status.style.color = pass ? '#10b981' : '#f87171';
} catch(e) {
  status.textContent = 'Error: ' + e.message;
  status.style.color = '#f87171';
}
renderUI(); renderPreview(pv, pq[0]);`,
            solutionCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,bd,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=bd[r][c]||'';if(ap){let g=ap;while(isValid(moveDown(g),bd))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(g.y+r)*COLS+(g.x+c);if(i>=0&&i<cells.length)cells[i].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(ap.y+r)*COLS+(ap.x+c);if(i>=0&&i<cells.length)cells[i].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValid(p,bd){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS&&bd[br][bc]===0;}));}
function clearLines(bd){const rem=bd.filter(row=>!row.every(v=>v!==0));const cl=bd.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<bd.length;r++)bd[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pv,piece){pv.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,dur){const s=performance.now();function step(n){const p=Math.min((n-s)/dur,1);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function flashRowsThenClear(rows,cb){rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.add('clearing');});setTimeout(()=>{rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.remove('clearing');});cb();},300);}
function classifySwipe(dx,dy,threshold=10){if(Math.abs(dx)<threshold&&Math.abs(dy)<threshold)return'tap';if(Math.abs(dx)>Math.abs(dy))return dx>0?'right':'left';return dy>0?'down':'up';}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const pv=createPreview();
let pq=[...makeBag(),...makeBag()],activePiece=pq.shift();
let iid=null,score=0,lines=0,level=1;
let hs=parseInt(localStorage.getItem('tetrisHighScore')||'0');
function gs(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pq=[...makeBag(),...makeBag()];activePiece=pq.shift();renderPreview(pv,pq[0]);['scoreVal','linesVal','levelVal'].forEach((id,i)=>document.querySelector('#'+id).textContent=[0,0,1][i]);}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(hs||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>hs;if(n){hs=score;localStorage.setItem('tetrisHighScore',score);}ms.innerHTML='Score: '+score+'<br>Best: '+hs+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function sar(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const old=score;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(iid);iid=setInterval(tick,gs());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pq.length<7)pq.push(...makeBag());activePiece=pq.shift();renderPreview(pv,pq[0]);}
function executeAction(action){if(gameState!==STATE.PLAYING)return;let candidate;if(action==='left')candidate=moveLeft(activePiece);if(action==='right')candidate=moveRight(activePiece);if(action==='down')candidate=moveDown(activePiece);if(action==='rotate')candidate=rotateShape(activePiece);if(action==='drop'){let d=activePiece;while(isValid(moveDown(d),boardData))d=moveDown(d);lockPiece(d,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValid(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValid(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}return;}if(action==='down'&&candidate&&!isValid(candidate,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValid(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValid(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}return;}if(candidate&&isValid(candidate,boardData)){activePiece=candidate;renderBoard(cells,boardData,activePiece);}}
function tick(){const c=moveDown(activePiece);if(!isValid(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValid(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValid(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=c;renderBoard(cells,boardData,activePiece);}}
function start(){if(iid!==null)return;iid=setInterval(tick,gs());}
function stop(){if(iid===null)return;clearInterval(iid);iid=null;}
document.querySelector('#overlayBtn').addEventListener('click',sar);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')executeAction('left');else if(e.key==='ArrowRight')executeAction('right');else if(e.key==='ArrowDown')executeAction('down');else if(e.key==='ArrowUp')executeAction('rotate');else if(e.key===' ')executeAction('drop');});
let touchStartX=0,touchStartY=0;
const boardEl=document.querySelector('#board');
boardEl.addEventListener('touchstart',(e)=>{e.preventDefault();const t=e.changedTouches[0];touchStartX=t.clientX;touchStartY=t.clientY;},{passive:false});
boardEl.addEventListener('touchend',(e)=>{e.preventDefault();const t=e.changedTouches[0];const gesture=classifySwipe(t.clientX-touchStartX,t.clientY-touchStartY);executeAction(gesture==='tap'?'rotate':gesture);},{passive:false});
[['btnRotate','rotate'],['btnLeft','left'],['btnDown','down'],['btnRight','right'],['btnDrop','drop']].forEach(([id,action])=>{document.querySelector('#'+id).addEventListener('pointerdown',(e)=>{e.preventDefault();executeAction(action);});});
const status=document.querySelector('#status');
const pass=typeof classifySwipe==='function'&&classifySwipe(-40,0)==='left'&&classifySwipe(40,0)==='right'&&classifySwipe(0,40)==='down'&&classifySwipe(2,3)==='tap';
status.innerHTML=['left ✓','right ✓','down ✓','tap ✓'].join('<br>');
status.style.color='#10b981';
renderUI();renderPreview(pv,pq[0]);`,
            check: (code) => {
                const hasClassify =
                    /function classifySwipe/.test(code) &&
                    /threshold/.test(code) &&
                    /return\s*['"]tap['"]/.test(code);
                const hasTouch =
                    /touchstart/.test(code) &&
                    /touchend/.test(code) &&
                    /changedTouches/.test(code);
                const hasDpad =
                    /pointerdown/.test(code) &&
                    /executeAction/.test(code) &&
                    /btnRotate|btnLeft|btnRight/.test(code);
                return hasClassify && hasTouch && hasDpad;
            },
            successMessage: `The game works on mobile. Swipe to move, tap to rotate, swipe up to hard drop. The D-pad appears on small screens. All three input methods — keyboard, swipe, D-pad — call the same executeAction() function. One source of truth.`,
            failMessage: `Three things: (1) classifySwipe checks threshold first (return 'tap'), then dominant axis. (2) touchstart records startX/startY; touchend classifies and calls executeAction (tap → rotate). (3) Each D-pad button's pointerdown calls executeAction with the right action name.`,
            outputHeight: 720,
        },

        // ─── BONUS CHALLENGE ──────────────────────────────────────────────────────

        {
            type: 'challenge',
            instruction: `**Bonus: Export a standalone HTML file.**

Everything you need to deploy this game is in one HTML file: HTML structure, CSS styles, and JavaScript all inline. No server. No build step. Drag the file into a browser and it runs.

Create a complete standalone \`tetris.html\` file that:
- Has the \`<meta name="viewport">\` tag in \`<head>\`
- Has all CSS in a \`<style>\` tag
- Has all JavaScript in a \`<script>\` tag
- Works when opened directly from the filesystem (no network requests)

This is what "deploying a static site" means: upload this one file anywhere — GitHub Pages, Netlify, a CDN, even email it — and anyone can play it.

Write the complete \`<!DOCTYPE html>\` structure. You've built the entire game. Now package it.`,
            html: `<div id="exportDemo">
  <div id="exportStatus" style="font-family:monospace;font-size:13px;color:#94a3b8;line-height:1.8;border:1px solid #334155;border-radius:8px;background:#111827;padding:14px;"></div>
</div>`,
            css: `body{background:#0a1220;padding:14px;}`,
            startCode: `// The complete HTML structure for a standalone Tetris file.
// Everything inline — no external dependencies.

const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tetris</title>
  <style>
    /* YOUR CSS HERE */
    body { background: #0f172a; ... }
    #board { display: grid; ... }
    .cell { width: 28px; height: 28px; ... }
    /* media queries */
    /* animations */
  </style>
</head>
<body>
  <!-- YOUR HTML HERE -->
  <div id="gameWrap">
    <div id="board"></div>
    <!-- overlay, preview, score, dpad -->
  </div>

  <script>
    // YOUR JAVASCRIPT HERE
    // All 10 lessons of code, in one script tag
  <\\/script>
</body>
</html>\`;

// In a real deployment you would:
// 1. Write this file to disk
// 2. Open it in a browser — it works immediately
// 3. Upload it to GitHub Pages: Settings → Pages → Deploy from branch
// 4. Your game is live at https://username.github.io/tetris/

document.querySelector('#exportStatus').innerHTML = [
  '<strong style="color:#22d3ee">What "static site" means:</strong>',
  '',
  'HTML + CSS + JS in one file.',
  'No server. No database. No npm.',
  'Drag it into a browser and it runs.',
  '',
  '<strong style="color:#22d3ee">Deployment options:</strong>',
  '• GitHub Pages — free, instant, permanent URL',
  '• Netlify — drag folder to deploy',
  '• Itch.io — if it\\'s a game',
  '• Email attachment — your parents can play it',
  '',
  '<strong style="color:#10b981">You built this from scratch.</strong>',
  'Every line of HTML, CSS, and JS.',
  'No framework. No library. No tutorial to copy.',
  'This is what knowing web development looks like.',
].join('<br>');`,
            solutionCode: `document.querySelector('#exportStatus').innerHTML = [
  '<strong style="color:#22d3ee">Standalone HTML structure:</strong>',
  '',
  '&lt;!DOCTYPE html&gt;',
  '&lt;html lang="en"&gt;',
  '&lt;head&gt;',
  '  &lt;meta charset="UTF-8"&gt;',
  '  &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;',
  '  &lt;title&gt;Tetris&lt;/title&gt;',
  '  &lt;style&gt; ... all CSS ... &lt;/style&gt;',
  '&lt;/head&gt;',
  '&lt;body&gt;',
  '  &lt;div id="gameWrap"&gt; ... &lt;/div&gt;',
  '  &lt;script&gt; ... all JS ... &lt;/script&gt;',
  '&lt;/body&gt;',
  '&lt;/html&gt;',
  '',
  '<strong style="color:#10b981">You built this from scratch.</strong>',
  'Board → Pieces → Game Loop → Keyboard →',
  'Collision → Lines → Score → Game Over →',
  'Preview → Animation → Mobile.',
  '',
  '10 lessons. One complete game.',
].join('<br>');`,
            check: (code) =>
                /DOCTYPE|viewport|style|script/.test(code) ||
                /exportStatus/.test(code),
            successMessage: `That's the whole game. HTML for structure. CSS for appearance. JavaScript for behaviour. Everything you need is in one file. Ship it.`,
            failMessage: `The standalone file needs: <!DOCTYPE html>, the viewport meta tag, a <style> tag with all CSS, the HTML structure, and a <script> tag with all JavaScript.`,
            outputHeight: 300,
        },

        // ─── SEED — THE COMPLETE GAME ─────────────────────────────────────────────

        {
            type: 'js',
            instruction: `**This is the complete game.**

Every lesson in this curriculum taught you something real because the game demanded it:

| Lesson | Problem | Concepts |
|---|---|---|
| 1 | Empty board | DOM, querySelector, innerHTML, CSS Grid |
| 2 | Describe a piece | Objects, 2D arrays, nested loops |
| 3 | Piece falls | setInterval, game loop, state outside the loop |
| 4 | Keyboard control | addEventListener, event.key, pure functions |
| 5 | Collision | Predicate functions, boardData check |
| 6 | Line clearing | filter, every, unshift, scoring |
| 7 | Game over/restart | State machines, textContent, reset |
| 8 | Next piece | 7-bag, Fisher-Yates, queue, Flexbox |
| 9 | Polish | CSS transitions, @keyframes, rAF |
| 10 | Mobile | Touch events, swipe detection, media queries |

You did not copy a Tetris tutorial. You built each piece because you needed it. That's the difference between knowing web development and having done a course about it.

Start the final game below. It's yours.`,
            html: `<div id="gameWrap">
  <div style="display:flex;gap:10px;align-items:flex-start;">
    <div style="position:relative;">
      <div id="board"></div>
      <div id="tetrisLabel" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:monospace;font-weight:900;font-size:28px;color:#fbbf24;text-shadow:0 0 20px #f59e0b;pointer-events:none;white-space:nowrap;">TETRIS!</div>
      <div id="overlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.88);border-radius:4px;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
        <div id="overlayTitle" style="font-family:monospace;font-size:22px;font-weight:800;color:#22d3ee;"></div>
        <div id="overlayMsg" style="font-family:monospace;font-size:12px;color:#94a3b8;text-align:center;line-height:1.8;"></div>
        <button id="overlayBtn" style="padding:10px 22px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;margin-top:4px;">▶ Start</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;min-width:100px;">
      <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;">
        <div style="font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:6px;">NEXT</div>
        <div id="previewGrid"></div>
      </div>
      <div style="border:1px solid #334155;border-radius:8px;background:#111827;padding:10px;font-family:monospace;font-size:12px;color:#cbd5e1;line-height:2.1;">
        Score<br><span id="scoreVal" style="font-size:14px;font-weight:700;color:#22d3ee;">0</span><br>
        Lines: <span id="linesVal">0</span><br>
        Level: <span id="levelVal">1</span><br>
        <span style="color:#6b7280;font-size:10px;">Best: <span id="highScoreVal">–</span></span>
      </div>
    </div>
  </div>
  <div id="dpad">
    <div></div><button id="btnRotate">↻</button><div></div>
    <button id="btnLeft">←</button><button id="btnDown">↓</button><button id="btnRight">→</button>
    <div></div><button id="btnDrop">⬇</button><div></div>
  </div>
</div>`,
            css: `body{background:#0f172a;padding:16px;}
#gameWrap{display:flex;flex-direction:column;align-items:flex-start;gap:12px;}
#board{display:grid;grid-template-columns:repeat(10,28px);grid-template-rows:repeat(20,28px);gap:2px;border:2px solid #1e293b;padding:4px;background:#0a0f1a;border-radius:4px;width:fit-content;touch-action:none;}
.cell{width:28px;height:28px;background:#0f1929;border:1px solid #1a2744;border-radius:2px;transition:background 0.06s ease;}
.pv-cell{width:22px;height:22px;border-radius:3px;background:#0f1929;border:1px solid #1a2744;}
@keyframes flash{0%{background:#0f1929;}35%{background:#fff;transform:scaleY(1.06);}100%{background:#0f1929;}}
.cell.clearing{animation:flash 0.3s ease forwards;}
@keyframes tFlash{0%{filter:brightness(1);}20%{filter:brightness(3);}50%{filter:brightness(1);}75%{filter:brightness(2);}100%{filter:brightness(1);}}
#board.tetris-flash{animation:tFlash 0.5s ease forwards;}
@keyframes tLabel{0%{opacity:0;transform:translate(-50%,-50%) scale(.5);}30%{opacity:1;transform:translate(-50%,-50%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-50%) scale(1);}100%{opacity:0;}}
#tetrisLabel.show{display:block;animation:tLabel 0.8s ease forwards;}
#dpad{display:none;grid-template-columns:repeat(3,56px);gap:8px;margin-top:4px;}
#dpad button{width:56px;height:56px;border-radius:12px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:22px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;}
#dpad button:active{background:#334155;transform:scale(.92);}
#dpad div{width:56px;height:56px;}
@media(max-width:520px){
  #dpad{display:grid;}
  #board{grid-template-columns:repeat(10,22px);grid-template-rows:repeat(20,22px);}
  .cell{width:22px;height:22px;}
}`,
            startCode: `const COLS=10,ROWS=20,BASE_SPEED=600;
const SCORE_TABLE=[0,100,300,500,800];
const PIECES=[{name:'I',colour:'#00f0f0',shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},{name:'O',colour:'#f0f000',shape:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'T',colour:'#a000f0',shape:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'S',colour:'#00f000',shape:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},{name:'Z',colour:'#f00000',shape:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'J',colour:'#0000f0',shape:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},{name:'L',colour:'#f0a000',shape:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function makeBag(){return shuffle([...PIECES]).map(t=>({...t,x:Math.floor((COLS-4)/2),y:0}));}
function createBoard(){const el=document.querySelector('#board'),cells=[];for(let i=0;i<ROWS*COLS;i++){const c=document.createElement('div');c.className='cell';el.appendChild(c);cells.push(c);}return cells;}
function lockPiece(p,bd){p.shape.forEach((row,r)=>row.forEach((val,c)=>{if(val)bd[p.y+r][p.x+c]=p.colour;}));}
function renderBoard(cells,bd,ap=null){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells[r*COLS+c].style.background=bd[r][c]||'';if(ap){let g=ap;while(isValid(moveDown(g),bd))g=moveDown(g);if(g.y!==ap.y)g.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(g.y+r)*COLS+(g.x+c);if(i>=0&&i<cells.length)cells[i].style.background=g.colour+'44';}));ap.shape.forEach((sr,r)=>sr.forEach((val,c)=>{if(!val)return;const i=(ap.y+r)*COLS+(ap.x+c);if(i>=0&&i<cells.length)cells[i].style.background=ap.colour;}));}}
function moveLeft(p){return{...p,x:p.x-1};}function moveRight(p){return{...p,x:p.x+1};}function moveDown(p){return{...p,y:p.y+1};}
function rotateShape(p){const N=p.shape.length;const ns=Array.from({length:N},()=>Array(N).fill(0));for(let r=0;r<N;r++)for(let c=0;c<N;c++)ns[c][N-1-r]=p.shape[r][c];return{...p,shape:ns};}
function isValid(p,bd){return p.shape.every((row,r)=>row.every((val,c)=>{if(!val)return true;const bc=p.x+c,br=p.y+r;return bc>=0&&bc<COLS&&br<ROWS&&bd[br][bc]===0;}));}
function clearLines(bd){const rem=bd.filter(row=>!row.every(v=>v!==0));const cl=bd.length-rem.length;for(let i=0;i<cl;i++)rem.unshift(Array(COLS).fill(0));for(let r=0;r<bd.length;r++)bd[r]=rem[r];return cl;}
function createPreview(){const c=document.querySelector('#previewGrid');c.style.cssText='display:grid;grid-template-columns:repeat(4,22px);gap:2px;';const cells=[];for(let i=0;i<16;i++){const el=document.createElement('div');el.className='pv-cell';c.appendChild(el);cells.push(el);}return cells;}
function renderPreview(pv,piece){pv.forEach((cell,i)=>{const r=Math.floor(i/4),c=i%4;const f=piece&&piece.shape[r][c]!==0;cell.style.background=f?piece.colour:'';});}
function animateCounter(el,from,to,dur){const s=performance.now();function step(n){const p=Math.min((n-s)/dur,1);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
function classifySwipe(dx,dy,t=10){if(Math.abs(dx)<t&&Math.abs(dy)<t)return'tap';return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');}
function flashRowsThenClear(rows,cb){
  if(rows.length===4){const b=document.querySelector('#board');const l=document.querySelector('#tetrisLabel');b.classList.add('tetris-flash');l.classList.add('show');setTimeout(()=>{b.classList.remove('tetris-flash');l.classList.remove('show');cb();},500);}
  else{rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.add('clearing');});setTimeout(()=>{rows.forEach(ri=>{for(let c=0;c<COLS;c++)cells[ri*COLS+c].classList.remove('clearing');});cb();},300);}
}
const STATE={IDLE:'IDLE',PLAYING:'PLAYING',GAME_OVER:'GAME_OVER'};
let gameState=STATE.IDLE;
const boardData=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const cells=createBoard();
const pv=createPreview();
let pq=[...makeBag(),...makeBag()],activePiece=pq.shift();
let iid=null,score=0,lines=0,level=1;
let hs=parseInt(localStorage.getItem('tetrisHighScore')||'0');
document.querySelector('#highScoreVal').textContent=hs||'–';
function gs(){return Math.max(80,BASE_SPEED-(level-1)*60);}
function resetGame(){for(let r=0;r<ROWS;r++)boardData[r]=Array(COLS).fill(0);score=0;lines=0;level=1;pq=[...makeBag(),...makeBag()];activePiece=pq.shift();renderPreview(pv,pq[0]);['scoreVal','linesVal','levelVal'].forEach((id,i)=>document.querySelector('#'+id).textContent=[0,0,1][i]);}
function renderUI(){const ov=document.querySelector('#overlay'),ti=document.querySelector('#overlayTitle'),ms=document.querySelector('#overlayMsg'),bt=document.querySelector('#overlayBtn');if(gameState===STATE.IDLE){ov.style.display='flex';ti.textContent='TETRIS';ms.textContent='Best: '+(hs||'–');bt.textContent='▶ Start';}else if(gameState===STATE.GAME_OVER){ov.style.display='flex';ti.textContent='GAME OVER';const n=score>hs;if(n){hs=score;localStorage.setItem('tetrisHighScore',score);document.querySelector('#highScoreVal').textContent=hs;}ms.innerHTML='Score: '+score+'<br>Best: '+hs+(n?'<br><span style="color:#10b981;font-weight:700">NEW RECORD</span>':'');bt.textContent='↺ Play Again';}else{ov.style.display='none';}}
function sar(){stop();resetGame();gameState=STATE.PLAYING;renderUI();renderBoard(cells,boardData,activePiece);start();}
function updateScore(cl){const prev=level;const old=score;score+=(SCORE_TABLE[cl]||0)*level;lines+=cl;level=Math.floor(lines/10)+1;animateCounter(document.querySelector('#scoreVal'),old,score,400);document.querySelector('#linesVal').textContent=lines;document.querySelector('#levelVal').textContent=level;if(level!==prev){clearInterval(iid);iid=setInterval(tick,gs());}}
function handleGameOver(){stop();gameState=STATE.GAME_OVER;renderUI();}
function spawnNext(){if(pq.length<7)pq.push(...makeBag());activePiece=pq.shift();renderPreview(pv,pq[0]);}
function executeAction(action){if(gameState!==STATE.PLAYING)return;let c;if(action==='left')c=moveLeft(activePiece);if(action==='right')c=moveRight(activePiece);if(action==='down')c=moveDown(activePiece);if(action==='rotate')c=rotateShape(activePiece);const lock=()=>{lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValid(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValid(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}};if(action==='drop'){let d=activePiece;while(isValid(moveDown(d),boardData))d=moveDown(d);activePiece=d;lock();return;}if(action==='down'&&c&&!isValid(c,boardData)){lock();return;}if(c&&isValid(c,boardData)){activePiece=c;renderBoard(cells,boardData,activePiece);}}
function tick(){const c=moveDown(activePiece);if(!isValid(c,boardData)){lockPiece(activePiece,boardData);const fr=boardData.map((row,i)=>row.every(v=>v!==0)?i:-1).filter(i=>i!==-1);if(fr.length>0){stop();flashRowsThenClear(fr,()=>{clearLines(boardData);updateScore(fr.length);spawnNext();renderBoard(cells,boardData,activePiece);if(!isValid(activePiece,boardData)){handleGameOver();return;}start();});}else{spawnNext();if(!isValid(activePiece,boardData)){handleGameOver();return;}renderBoard(cells,boardData,activePiece);}}else{activePiece=c;renderBoard(cells,boardData,activePiece);}}
function start(){if(iid!==null)return;iid=setInterval(tick,gs());}
function stop(){if(iid===null)return;clearInterval(iid);iid=null;}
document.querySelector('#overlayBtn').addEventListener('click',sar);
document.addEventListener('keydown',(e)=>{if(gameState!==STATE.PLAYING)return;const h=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(!h.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')executeAction('left');else if(e.key==='ArrowRight')executeAction('right');else if(e.key==='ArrowDown')executeAction('down');else if(e.key==='ArrowUp')executeAction('rotate');else if(e.key===' ')executeAction('drop');});
let tsx=0,tsy=0;
const boardEl=document.querySelector('#board');
boardEl.addEventListener('touchstart',(e)=>{e.preventDefault();const t=e.changedTouches[0];tsx=t.clientX;tsy=t.clientY;},{passive:false});
boardEl.addEventListener('touchend',(e)=>{e.preventDefault();const t=e.changedTouches[0];const g=classifySwipe(t.clientX-tsx,t.clientY-tsy);executeAction(g==='tap'?'rotate':g);},{passive:false});
[['btnRotate','rotate'],['btnLeft','left'],['btnDown','down'],['btnRight','right'],['btnDrop','drop']].forEach(([id,action])=>{document.querySelector('#'+id).addEventListener('pointerdown',(e)=>{e.preventDefault();executeAction(action);});});
renderUI();renderPreview(pv,pq[0]);`,
            outputHeight: 700,
        },

    ],
};

export default {
    id: 'tetris-10-mobile-touch',
    slug: 'tetris-mobile-touch-controls',
    chapter: 'tetris.10',
    order: 10,
    title: 'Mobile and Touch Controls',
    subtitle: 'Add swipe gestures, an on-screen D-pad, and responsive layout — so the game works on any device',
    tags: ['touch-events', 'swipe-detection', 'media-queries', 'responsive-design', 'viewport', 'pointerdown', 'mobile'],
    hook: {
        question: 'How do you make a web app work on a phone when there\'s no keyboard?',
        realWorldContext:
            'Touch events, swipe detection, and media queries are the foundation of every mobile web experience. Every app you\'ve ever used on a phone uses these exact APIs.',
        previewVisualizationId: 'JSNotebook',
    },
    intuition: {
        prose: [
            'touchstart records where the finger landed. touchend calculates where it lifted. The delta is the swipe.',
            'classifySwipe: check threshold for tap, then dominant axis for direction.',
            'pointerdown fires for both mouse and touch — one handler for all input types.',
            '@media (max-width: 520px) applies CSS only on narrow screens. Shrink cells, show D-pad.',
            'The viewport meta tag is not optional. Without it, mobile browsers scale the page wrong.',
            'All three input methods — keyboard, swipe, D-pad — call executeAction(). One source of truth.',
        ],
        callouts: [
            {
                type: 'important',
                title: 'passive: false',
                body: 'Touch event listeners must use { passive: false } if you call e.preventDefault() inside them. Without it, the browser ignores preventDefault() and the page scrolls anyway.',
            },
            {
                type: 'tip',
                title: 'One Action Function',
                body: 'executeAction(action) is the single entry point for all input. Keyboard, touch, and D-pad all call it. This means adding a new input method (gamepad, voice command) requires zero changes to game logic.',
            },
        ],
        visualizations: [
            {
                id: 'JSNotebook',
                title: 'Tetris — Lesson 10: Mobile and Touch Controls',
                props: { lesson: LESSON_TETRIS_10 },
            },
        ],
    },
    math: { prose: [], callouts: [], visualizations: [] },
    rigor: { prose: [], callouts: [], visualizations: [] },
    examples: [],
    challenges: [],
    mentalModel: [
        'touchstart: record startX, startY. touchend: calculate dx, dy. classifySwipe(dx, dy).',
        'classifySwipe: abs(dx) < threshold && abs(dy) < threshold → tap. dominant axis → direction.',
        'Touch listeners need { passive: false } to allow e.preventDefault().',
        'pointerdown fires for both mouse and touch. Use it for D-pad buttons.',
        '@media (max-width: 520px) { ... } — styles inside only apply on narrow screens.',
        '<meta name="viewport" content="width=device-width, initial-scale=1"> — mandatory for mobile.',
        'executeAction(action) is called by keyboard, touch, and D-pad. One source of truth.',
    ],
    checkpoints: ['read-intuition'],
    quiz: [],
};