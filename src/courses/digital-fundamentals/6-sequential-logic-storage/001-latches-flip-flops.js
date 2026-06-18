// Digital Fundamentals · Unit 6 · Lesson 1
// Latches and Flip-Flops
// ScienceNotebook format

export const LESSON_DF_6_1 = {
  title: 'Latches and Flip-Flops',
  subtitle: 'The first sequential circuits — logic that remembers its past and forms the foundation of all clocked digital systems.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### From Combinational to Sequential Logic

Every circuit in Unit 5 was **combinational** — the output depends only on the current inputs. Give it the same inputs, get the same outputs, every time. There is no memory, no history, no state.

Real digital systems need memory. A CPU must remember register values between instructions. A traffic light controller must remember which phase it is in. A counter must remember its current count. These requirements demand **sequential logic** — circuits whose output depends not just on current inputs but on the **history** of past inputs.

The key property that makes sequential logic possible is **feedback**: routing an output back to an input. When the output of a gate feeds back to its own input (possibly through other gates), the circuit can maintain a stable state indefinitely — even after the input that set it has been removed.

**The SR latch** is the simplest sequential circuit. It uses two cross-coupled NOR (or NAND) gates where each gate's output feeds the other gate's input. This creates two stable states:
- **State Q=1**: output Q is HIGH, output Q̄ is LOW
- **State Q=0**: output Q is LOW, output Q̄ is HIGH

The circuit stays in whichever state it was last set to — it **remembers**. This is the fundamental mechanism behind every flip-flop, register, RAM cell, and cache in every computer ever built.`,
    },

    // ── Visual 1 — SR Latch ───────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### SR latch: cross-coupled NOR gates

Pulse the S (Set) and R (Reset) inputs. Watch Q and Q̄ respond — and notice that after S and R return to 0, the latch **holds its state**. This is sequential behaviour: the output depends on history, not just current inputs. The forbidden state (S=R=1) is shown explicitly.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="btnS" class="sr-btn">S = 0</button>
    <button id="btnR" class="sr-btn">R = 0</button>
    <div style="margin-left:auto;display:flex;gap:10px">
      <div class="q-badge" id="bdgQ">Q = <span id="vQ">0</span></div>
      <div class="q-badge" id="bdgQb">Q̄ = <span id="vQb">1</span></div>
    </div>
  </div>
  <canvas id="srcv" width="420" height="200"></canvas>
  <div id="srState" style="margin-top:10px;padding:10px 14px;border-radius:8px;border:1px solid;font-size:13px;font-weight:600"></div>
  <div style="margin-top:8px">
    <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em">State history</div>
    <div id="srHistory" style="display:flex;gap:4px;flex-wrap:wrap;min-height:28px"></div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:420px}
.sr-btn{padding:8px 22px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.4);font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.sr-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.q-badge{padding:6px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.1);font-size:14px;font-weight:700;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.03)}
.q-badge.active{border-color:#4ade80;color:#4ade80;background:rgba(74,222,128,0.08)}
.hist-pip{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-family:monospace}`,
      startCode: `
var S=0,R=0,Q=0;
var cv=document.getElementById('srcv'),ctx=cv.getContext('2d');
var history=[];

function norGate(c,x,y,w,h,col,active){
  c.fillStyle=active?col+'33':'#0d1527';
  c.strokeStyle=active?col:'#334155'; c.lineWidth=active?2:1.5;
  c.beginPath();
  c.moveTo(x+4,y+4);c.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);
  c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill();c.stroke();
  c.beginPath();c.arc(x+w+5,y+h/2,5,0,2*Math.PI);
  c.fillStyle=active?col+'44':'#0d1527';c.strokeStyle=active?col:'#334155';c.fill();c.stroke();
}
function wire(c,x1,y1,x2,y2,v,col){
  c.strokeStyle=col||(v?'#4ade80':'#475569');c.lineWidth=v?2.5:1.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function dot(c,x,y,v){c.beginPath();c.arc(x,y,4,0,2*Math.PI);c.fillStyle=v?'#4ade80':'#475569';c.fill();}

function computeNext(s,r,q){
  if(s===1&&r===1) return {q:q,qb:q,invalid:true};
  if(s===1) return {q:1,qb:0,invalid:false};
  if(r===1) return {q:0,qb:1,invalid:false};
  return {q:q,qb:1-q,invalid:false};
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var res=computeNext(S,R,Q);
  var invalid=S===1&&R===1;
  var gw=80,gh=56;
  var g1x=150,g1y=30,g2x=150,g2y=H-30-gh;
  var feedX=g1x+gw+40;

  // Input wires
  wire(ctx,14,g1y+gh*0.3,g1x,g1y+gh*0.3,S);
  ctx.fillStyle=S?'#4ade80':'rgba(255,255,255,0.3)';ctx.font='500 11px monospace';ctx.textAlign='right';
  ctx.fillText('S='+S,12,g1y+gh*0.3+4);
  wire(ctx,14,g2y+gh*0.7,g2x,g2y+gh*0.7,R);
  ctx.fillStyle=R?'#4ade80':'rgba(255,255,255,0.3)';
  ctx.fillText('R='+R,12,g2y+gh*0.7+4);

  // NOR gates
  norGate(ctx,g1x,g1y,gw,gh,'#0891b2',!!res.q);
  norGate(ctx,g2x,g2y,gw,gh,'#7c3aed',!!res.qb);
  ctx.fillStyle='#0891b2';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('NOR',g1x+gw/2,g1y-6);
  ctx.fillStyle='#7c3aed';ctx.fillText('NOR',g2x+gw/2,g2y-6);

  // Q output (top NOR output)
  var qOutX=g1x+gw+10;
  wire(ctx,qOutX,g1y+gh/2,feedX,g1y+gh/2,!!res.q);
  // Feedback wire: Q -> bottom NOR top input
  dot(ctx,feedX,g1y+gh/2,!!res.q);
  wire(ctx,feedX,g1y+gh/2,feedX,g2y+gh*0.3,!!res.q);
  wire(ctx,feedX,g2y+gh*0.3,g2x,g2y+gh*0.3,!!res.q);
  // Q label
  wire(ctx,feedX,g1y+gh/2,W-16,g1y+gh/2,!!res.q);
  ctx.fillStyle=res.q?'#4ade80':'#475569';ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText(invalid?'Q=?':'Q='+res.q,W-14,g1y+gh/2+4);

  // Qbar output (bottom NOR output)
  var qbOutX=g2x+gw+10;
  wire(ctx,qbOutX,g2y+gh/2,feedX+30,g2y+gh/2,!!res.qb);
  dot(ctx,feedX+30,g2y+gh/2,!!res.qb);
  wire(ctx,feedX+30,g2y+gh/2,feedX+30,g1y+gh*0.7,!!res.qb);
  wire(ctx,feedX+30,g1y+gh*0.7,g1x,g1y+gh*0.7,!!res.qb);
  wire(ctx,feedX+30,g2y+gh/2,W-16,g2y+gh/2,!!res.qb);
  ctx.fillStyle=res.qb?'#4ade80':'#475569';ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText(invalid?'Q̄=?':'Q̄='+res.qb,W-14,g2y+gh/2+4);

  // Feedback label
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px monospace';ctx.textAlign='center';
  ctx.fillText('feedback',feedX+15,H/2+4);
  if(invalid){
    ctx.fillStyle='rgba(239,68,68,0.15)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ef4444';ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText('FORBIDDEN STATE: S=R=1',W/2,H/2);
  }
}

function updateUI(){
  var res=computeNext(S,R,Q);
  var invalid=S===1&&R===1;
  if(!invalid) Q=res.q;
  ['S','R'].forEach(function(k){
    var v=k==='S'?S:R;
    var btn=document.getElementById('btn'+k);
    btn.textContent=k+' = '+v;btn.className='sr-btn'+(v?' hi':'');
  });
  document.getElementById('vQ').textContent=invalid?'?':Q;
  document.getElementById('vQb').textContent=invalid?'?':(1-Q);
  document.getElementById('bdgQ').className='q-badge'+(Q&&!invalid?' active':'');
  document.getElementById('bdgQb').className='q-badge'+(!Q&&!invalid?' active':'');

  var stateDiv=document.getElementById('srState');
  if(invalid){stateDiv.textContent='⚠ FORBIDDEN: S=R=1. Both NOR outputs try to be 1 simultaneously. When S and R return to 0 together, state is unpredictable.';stateDiv.style.borderColor='#ef4444';stateDiv.style.color='#ef4444';stateDiv.style.background='rgba(239,68,68,0.06)';}
  else if(S===1){stateDiv.textContent='SET: S=1 forces Q=1. This will be held after S returns to 0.';stateDiv.style.borderColor='#4ade80';stateDiv.style.color='#4ade80';stateDiv.style.background='rgba(74,222,128,0.06)';}
  else if(R===1){stateDiv.textContent='RESET: R=1 forces Q=0. This will be held after R returns to 0.';stateDiv.style.borderColor='#f87171';stateDiv.style.color='#f87171';stateDiv.style.background='rgba(239,68,68,0.06)';}
  else{stateDiv.textContent='HOLD: S=R=0. Latch holds its current state Q='+(Q?1:0)+'. Output depends on history, not current inputs.';stateDiv.style.borderColor=Q?'#4ade80':'rgba(255,255,255,0.15)';stateDiv.style.color=Q?'#4ade80':'rgba(255,255,255,0.5)';stateDiv.style.background='rgba(255,255,255,0.03)';}

  if(!invalid&&history.length===0||(history.length>0&&history[history.length-1].q!==Q)){
    history.push({s:S,r:R,q:Q});
    if(history.length>16) history.shift();
  }
  var hd=document.getElementById('srHistory');hd.innerHTML='';
  history.forEach(function(h){
    var pip=document.createElement('div');
    pip.className='hist-pip';
    pip.style.background=h.q?'rgba(74,222,128,0.2)':'rgba(255,255,255,0.06)';
    pip.style.border='1px solid '+(h.q?'#4ade80':'rgba(255,255,255,0.1)');
    pip.style.color=h.q?'#4ade80':'rgba(255,255,255,0.3)';
    pip.textContent='Q='+h.q;pip.title='S='+h.s+' R='+h.r;
    hd.appendChild(pip);
  });
  draw();
}

document.getElementById('btnS').onclick=function(){S^=1;updateUI();};
document.getElementById('btnR').onclick=function(){R^=1;updateUI();};
updateUI();`,
      outputHeight: 420,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `An SR latch is in state Q=1 (set). Both inputs S and R are then set to 0. What happens to Q?`,
      options: [
        { label: 'A', text: 'Q resets to 0 — removing the Set input causes the latch to clear' },
        { label: 'B', text: 'Q remains 1 — the latch holds its state when S=R=0, this is the HOLD condition' },
        { label: 'C', text: 'Q oscillates between 0 and 1 — feedback causes instability' },
        { label: 'D', text: 'Q becomes undefined — the output is unpredictable without active inputs' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. S=R=0 is the HOLD state. The SR latch maintains whatever Q was last set to. The feedback path keeps the circuit stable — Q=1 feeds back to keep Q̄=0, which feeds back to keep Q=1. This is the memory property of sequential logic.',
      failMessage: 'S=R=0 is the HOLD condition. The latch retains its current state through the feedback loop: Q=1 holds because Q=1 feeds into the lower NOR, keeping Q̄=0, which feeds into the upper NOR keeping Q=1. The state is stable and self-reinforcing.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The D Latch: Solving the Forbidden State

The SR latch has a problem: if S=R=1 is applied and then both inputs return to 0 simultaneously, the resulting state is unpredictable. This **forbidden state** is dangerous in practice.

The **D latch** (Data latch) eliminates the forbidden state by ensuring S and R are always complements. It adds a NOT gate: R = NOT(S), so the two inputs are tied together with only one degree of freedom.

The D latch has two inputs:
- **D** (Data): the value to store
- **EN** (Enable, also called Gate or Latch Enable): controls when D is captured

**Behaviour**:
- When **EN=1** (transparent): Q follows D — the latch is "open", the output tracks the input
- When **EN=0** (opaque): Q holds its last value — the latch is "closed", ignoring D

This is called a **level-sensitive** latch — it responds to the *level* of EN, not the edge.

$$Q_{next} = \\begin{cases} D & \\text{when EN=1} \\\\ Q & \\text{when EN=0} \\end{cases}$$

**The transparency problem**: while EN=1, any glitch or change on D immediately appears on Q. This "transparency" can cause timing problems in clocked systems — if the clock is used as EN, a long clock pulse lets Q be affected by changes in D throughout the entire clock-high period, not just at a defined moment.

The solution is **edge-triggering**, which is what the D flip-flop provides.`,
    },

    // ── Visual 2 — D Latch ────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### D latch: transparent when enabled

Toggle D and EN. When EN=1, Q follows D immediately (transparent). When EN=0, Q freezes. Watch the timing: changes to D only affect Q while EN is HIGH.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="btnD" class="inp-btn">D = 0</button>
    <button id="btnEN" class="inp-btn" style="border-color:rgba(251,191,36,0.5);color:rgba(251,191,36,0.6)">EN = 0</button>
    <div style="margin-left:auto;display:flex;gap:10px">
      <div class="q-badge" id="dlQ">Q = <span id="dlvQ">0</span></div>
    </div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="dlcv" width="320" height="180"></canvas>
    <div style="flex:1;min-width:160px">
      <div id="dlMode" style="padding:10px 14px;border-radius:8px;border:1.5px solid;font-size:13px;font-weight:600;margin-bottom:10px"></div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:5px">Timing trace (D=blue, Q=green, EN=amber)</div>
      <canvas id="dltrace" width="240" height="80"></canvas>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.inp-btn{padding:7px 20px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.q-badge{padding:6px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.1);font-size:14px;font-weight:700;color:rgba(255,255,255,0.4)}
.q-badge.active{border-color:#4ade80;color:#4ade80;background:rgba(74,222,128,0.08)}`,
      startCode: `
var D=0,EN=0,Q=0;
var trace=[];
var cv=document.getElementById('dlcv'),tc=document.getElementById('dltrace');
var ctx=cv.getContext('2d'),tctx=tc.getContext('2d');
var MAX_TRACE=40;

function norGateSmall(c,x,y,w,h,col,act){
  c.fillStyle=act?col+'33':'#0d1527';c.strokeStyle=act?col:'#334155';c.lineWidth=act?2:1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.quadraticCurveTo(x+w/2-8,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-12,y+h/2);c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill();c.stroke();
  c.beginPath();c.arc(x+w+4,y+h/2,4,0,2*Math.PI);
  c.fillStyle=act?col+'44':'#0d1527';c.fill();c.stroke();
}
function notGateSmall(c,x,y,w,h,col,act){
  c.fillStyle=act?col+'33':'#0d1527';c.strokeStyle=act?col:'#334155';c.lineWidth=act?2:1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+w-10,y+h/2);c.lineTo(x+4,y+h-4);c.closePath();c.fill();c.stroke();
  c.beginPath();c.arc(x+w-5,y+h/2,4,0,2*Math.PI);c.fillStyle=act?col+'44':'#0d1527';c.fill();c.stroke();
}
function wire2(c,x1,y1,x2,y2,v){
  c.strokeStyle=v?'#4ade80':'#475569';c.lineWidth=v?2.5:1.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var notD=D?0:1, S=D&&EN?1:0, Rn=notD&&EN?1:0;
  var qDisp=EN?D:Q;
  var gw=60,gh=44,notW=44,notH=36;
  var notX=46,notY=H/2-notH/2+20;
  var g1x=140,g1y=26,g2x=140,g2y=H-26-gh;
  var feedX=g1x+gw+36;

  // NOT gate on D
  wire2(ctx,14,H/2+20,notX,notY+notH/2,D);
  notGateSmall(ctx,notX,notY,notW,notH,'#ef4444',!!notD);
  ctx.fillStyle=D?'#4ade80':'rgba(255,255,255,0.35)';ctx.font='500 10px monospace';ctx.textAlign='right';
  ctx.fillText('D='+D,12,H/2+24);

  // EN input
  ctx.fillStyle=EN?'#fbbf24':'rgba(251,191,36,0.35)';ctx.textAlign='right';
  ctx.fillText('EN='+EN,12,g1y+gh*0.7+4);

  // D → NOR1 top input
  wire2(ctx,14,H/2+20,14,g1y+gh*0.3,D);
  wire2(ctx,14,g1y+gh*0.3,g1x,g1y+gh*0.3,D);
  // EN → NOR1 bottom
  wire2(ctx,10,g1y+gh*0.7,g1x,g1y+gh*0.7,EN);
  // NOT output → NOR2 top
  wire2(ctx,notX+notW+4,notY+notH/2,notX+notW+4,g2y+gh*0.3,notD);
  wire2(ctx,notX+notW+4,g2y+gh*0.3,g2x,g2y+gh*0.3,notD);
  // EN → NOR2 bottom
  wire2(ctx,10,g2y+gh*0.7,g2x,g2y+gh*0.7,EN);

  norGateSmall(ctx,g1x,g1y,gw,gh,'#0891b2',!!qDisp);
  norGateSmall(ctx,g2x,g2y,gw,gh,'#7c3aed',!!(!qDisp));
  ctx.fillStyle='#0891b2';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('NOR',g1x+gw/2,g1y-5);
  ctx.fillStyle='#7c3aed';ctx.fillText('NOR',g2x+gw/2,g2y-5);

  // Q out
  wire2(ctx,g1x+gw+8,g1y+gh/2,feedX,g1y+gh/2,!!qDisp);
  wire2(ctx,feedX,g1y+gh/2,feedX,g2y+gh*0.3,!!qDisp);
  wire2(ctx,feedX,g2y+gh*0.3,g2x,g2y+gh*0.3,!!qDisp);
  wire2(ctx,feedX,g1y+gh/2,W-14,g1y+gh/2,!!qDisp);
  ctx.fillStyle=qDisp?'#4ade80':'#475569';ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText('Q='+qDisp,W-12,g1y+gh/2+4);

  // Transparency indicator
  if(EN){
    ctx.fillStyle='rgba(251,191,36,0.12)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fbbf24';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText('TRANSPARENT — Q follows D',W/2,H-6);
  } else {
    ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('OPAQUE — Q holds',W/2,H-6);
  }
}

function drawTrace(){
  var W=tc.width,H=tc.height;
  tctx.clearRect(0,0,W,H);tctx.fillStyle='#0a0f1e';tctx.fillRect(0,0,W,H);
  if(trace.length<2) return;
  var n=Math.min(trace.length,MAX_TRACE);
  var tw=W/n;
  var sigs=[{key:'en',col:'#fbbf24',y:8},{key:'d',col:'#38bdf8',y:30},{key:'q',col:'#4ade80',y:52}];
  sigs.forEach(function(sig){
    tctx.strokeStyle=sig.col;tctx.lineWidth=2;
    tctx.beginPath();
    var start=Math.max(0,trace.length-MAX_TRACE);
    trace.slice(start).forEach(function(pt,i){
      var x=i*tw+1;
      var y=sig.y+(pt[sig.key]?0:16);
      if(i===0) tctx.moveTo(x,y); else {
        var prevY=sig.y+(trace[start+i-1][sig.key]?0:16);
        if(y!==prevY){tctx.lineTo(x,prevY);tctx.lineTo(x,y);}else tctx.lineTo(x,y);
      }
    });
    tctx.stroke();
    tctx.fillStyle=sig.col;tctx.font='7px monospace';tctx.textAlign='left';
    tctx.fillText(sig.key==='en'?'EN':sig.key==='d'?'D':'Q',2,sig.y+12);
  });
}

function updateD(){
  if(EN) Q=D;
  trace.push({d:D,en:EN,q:Q});
  if(trace.length>MAX_TRACE*2) trace=trace.slice(-MAX_TRACE);
  var qDisp=EN?D:Q;
  document.getElementById('dlvQ').textContent=qDisp;
  document.getElementById('dlQ').className='q-badge'+(qDisp?' active':'');
  var mode=document.getElementById('dlMode');
  if(EN){mode.textContent='TRANSPARENT: Q=D='+D+'. Any change to D immediately appears at Q.';mode.style.borderColor='#fbbf24';mode.style.color='#fbbf24';mode.style.background='rgba(251,191,36,0.06)';}
  else{mode.textContent='OPAQUE: Q held at '+Q+'. D='+D+' is ignored until EN goes HIGH.';mode.style.borderColor='rgba(255,255,255,0.15)';mode.style.color='rgba(255,255,255,0.5)';mode.style.background='rgba(255,255,255,0.03)';}
  document.getElementById('btnD').textContent='D = '+D;document.getElementById('btnD').className='inp-btn'+(D?' hi':'');
  var enb=document.getElementById('btnEN');
  enb.textContent='EN = '+EN;
  enb.style.borderColor=EN?'#fbbf24':'rgba(251,191,36,0.4)';
  enb.style.color=EN?'#fbbf24':'rgba(251,191,36,0.5)';
  enb.style.background=EN?'rgba(251,191,36,0.1)':'transparent';
  draw();drawTrace();
}
document.getElementById('btnD').onclick=function(){D^=1;updateD();};
document.getElementById('btnEN').onclick=function(){EN^=1;if(EN)Q=D;updateD();};
updateD();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A D latch has EN=1 and D=1, so Q=1. Then D changes to 0 while EN is still 1. What happens to Q?`,
      options: [
        { label: 'A', text: 'Q stays at 1 — the latch already captured D=1 and holds it' },
        { label: 'B', text: 'Q changes to 0 — when EN=1 the latch is transparent and Q follows D immediately' },
        { label: 'C', text: 'Q becomes undefined — D changed while EN was still high' },
        { label: 'D', text: 'Q changes to 0 only on the next rising edge of EN' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. While EN=1, the D latch is transparent — Q continuously tracks D. D changing from 1 to 0 while EN=1 immediately causes Q to change to 0. This is the transparency property — and the reason flip-flops (edge-triggered) are preferred in clocked systems.',
      failMessage: 'EN=1 makes the latch transparent. Q follows D in real time, not just when EN first goes high. D changing to 0 while EN is still 1 immediately sets Q=0. This is the transparency problem that motivates edge-triggered flip-flops.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The D Flip-Flop: Edge Triggering

The D flip-flop solves the transparency problem by capturing D only at a specific **clock edge** — the brief moment when the clock transitions from 0 to 1 (rising edge) or from 1 to 0 (falling edge). At all other times, Q is held regardless of what D does.

**How it works**: a D flip-flop is built from two D latches in a master-slave configuration:
1. **Master latch**: enabled when CLK=0 — it tracks D while the clock is LOW
2. **Slave latch**: enabled when CLK=1 — it transfers the master's value to Q when the clock is HIGH

On the **rising edge** (CLK: 0→1), the master latch closes (stops tracking D) and the slave latch opens (passes the master's value to Q). Q captures the value of D at the exact moment of the rising edge — a window of just nanoseconds.

**Setup and hold times**:
- **Setup time (tsu)**: D must be stable for at least tsu *before* the clock edge
- **Hold time (th)**: D must remain stable for at least th *after* the clock edge
Violating either constraint causes **metastability** — the flip-flop enters an indeterminate state that may take arbitrarily long to resolve.

**The symbol**: a D flip-flop has:
- Input: D (data), CLK (clock)
- Output: Q and Q̄
- The triangle on the CLK input indicates edge-triggering
- An inversion bubble before the triangle indicates falling-edge triggering`,
    },

    // ── Visual 3 — D Flip-Flop ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### D flip-flop: edge-triggered capture

Toggle D freely. The output Q only changes on the rising edge of CLK. Click CLK to generate a clock pulse — Q captures D's value at that instant and holds it until the next rising edge.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="ffD" class="inp-btn">D = 0</button>
    <button id="ffClk" class="clk-btn">▲ CLK pulse</button>
    <div style="margin-left:auto;display:flex;gap:10px">
      <div class="q-badge" id="ffQ">Q = <span id="ffvQ">0</span></div>
      <div class="q-badge" id="ffQb">Q̄ = <span id="ffvQb">1</span></div>
    </div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="ffcv" width="300" height="200"></canvas>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:5px">Timing diagram (last 20 events)</div>
      <canvas id="fftrace" width="260" height="100"></canvas>
      <div id="ffNote" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.inp-btn{padding:7px 20px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.clk-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(251,191,36,0.5);background:rgba(251,191,36,0.08);color:#fbbf24;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.q-badge{padding:6px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.1);font-size:14px;font-weight:700;color:rgba(255,255,255,0.4)}
.q-badge.active{border-color:#4ade80;color:#4ade80;background:rgba(74,222,128,0.08)}`,
      startCode: `
var D=0,Q=0,clkCount=0;
var traceEvents=[];
var cv=document.getElementById('ffcv'),tc=document.getElementById('fftrace');
var ctx=cv.getContext('2d'),tctx=tc.getContext('2d');

function drawFF(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // DFF box
  var bx=80,by=40,bw=100,bh=120;
  ctx.fillStyle='rgba(99,102,241,0.08)';ctx.strokeStyle='#6366f1';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#6366f1';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('D Flip-Flop',bx+bw/2,by+18);

  // CLK triangle symbol
  var tx=bx+6,ty=by+bh-28;
  ctx.strokeStyle='#fbbf24';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(tx,ty+10);ctx.lineTo(tx+10,ty+5);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.fillStyle='rgba(251,191,36,0.35)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('CLK',tx+14,ty+7);

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign='right';
  ctx.fillText('D',bx-4,by+50);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';
  ctx.fillText('(tsu/th)',bx-4,by+62);

  // Input wires
  ctx.strokeStyle=D?'#4ade80':'#475569';ctx.lineWidth=D?2.5:1.5;
  ctx.beginPath();ctx.moveTo(14,by+46);ctx.lineTo(bx,by+46);ctx.stroke();
  ctx.fillStyle=D?'#4ade80':'#f87171';ctx.font='500 11px monospace';ctx.textAlign='right';
  ctx.fillText('D='+D,12,by+50);

  ctx.strokeStyle='#fbbf24';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(14,by+bh-24);ctx.lineTo(bx,by+bh-24);ctx.stroke();
  ctx.fillStyle='#fbbf24';ctx.textAlign='right';
  ctx.fillText('CLK',12,by+bh-20);

  // Output wires
  ctx.strokeStyle=Q?'#4ade80':'#475569';ctx.lineWidth=Q?2.5:1.5;
  ctx.beginPath();ctx.moveTo(bx+bw,by+46);ctx.lineTo(W-14,by+46);ctx.stroke();
  ctx.fillStyle=Q?'#4ade80':'#475569';ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText('Q='+Q,W-12,by+50);
  ctx.strokeStyle=(1-Q)?'#4ade80':'#475569';ctx.lineWidth=(1-Q)?2.5:1.5;
  ctx.beginPath();ctx.moveTo(bx+bw,by+80);ctx.lineTo(W-14,by+80);ctx.stroke();
  ctx.fillStyle=(1-Q)?'#4ade80':'#475569';
  ctx.fillText('Q̄='+(1-Q),W-12,by+84);

  // Edge capture annotation
  if(clkCount>0){
    ctx.fillStyle='rgba(251,191,36,0.1)';ctx.strokeStyle='rgba(251,191,36,0.4)';ctx.lineWidth=1;
    ctx.beginPath();ctx.roundRect(bx+4,by+bh-52,bw-8,22,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fbbf24';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText('Captured D='+Q+' on edge #'+clkCount,bx+bw/2,by+bh-38);
  }

  // Rising edge arrow indicator
  ctx.strokeStyle='rgba(251,191,36,0.5)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(14,by+bh-16);ctx.lineTo(26,by+bh-28);ctx.stroke();
  ctx.fillStyle='rgba(251,191,36,0.5)';ctx.font='8px monospace';ctx.textAlign='left';
  ctx.fillText('↑ rising edge trigger',30,by+bh-14);
}

function drawTrace(){
  var W=tc.width,H=tc.height;
  tctx.clearRect(0,0,W,H);tctx.fillStyle='#0a0f1e';tctx.fillRect(0,0,W,H);
  var n=Math.min(traceEvents.length,24);
  if(n<2) return;
  var tw=W/n;
  var sigs=[{key:'d',col:'#38bdf8',y:6},{key:'clk',col:'#fbbf24',y:36},{key:'q',col:'#4ade80',y:66}];
  sigs.forEach(function(sig){
    tctx.strokeStyle=sig.col;tctx.lineWidth=2;
    tctx.beginPath();
    var ev=traceEvents.slice(-n);
    ev.forEach(function(pt,i){
      var x=i*tw+2;var y=sig.y+(pt[sig.key]?0:18);
      if(i===0) tctx.moveTo(x,y);
      else{var py=sig.y+(ev[i-1][sig.key]?0:18);if(y!==py){tctx.lineTo(x,py);tctx.lineTo(x,y);}else tctx.lineTo(x,y);}
    });
    tctx.stroke();
    tctx.fillStyle=sig.col;tctx.font='7px monospace';tctx.textAlign='left';
    tctx.fillText(sig.key==='clk'?'CLK':sig.key.toUpperCase(),2,sig.y+14);
  });
  // Mark rising edges
  traceEvents.slice(-n).forEach(function(pt,i){
    if(i>0&&pt.clk===1&&traceEvents.slice(-n)[i-1].clk===0){
      tctx.strokeStyle='rgba(251,191,36,0.5)';tctx.lineWidth=1;tctx.setLineDash([2,2]);
      tctx.beginPath();tctx.moveTo(i*tw+2,0);tctx.lineTo(i*tw+2,H);tctx.stroke();
      tctx.setLineDash([]);
    }
  });
}

function refresh3(){
  document.getElementById('ffD').textContent='D = '+D;
  document.getElementById('ffD').className='inp-btn'+(D?' hi':'');
  document.getElementById('ffvQ').textContent=Q;
  document.getElementById('ffvQb').textContent=(1-Q);
  document.getElementById('ffQ').className='q-badge'+(Q?' active':'');
  document.getElementById('ffQb').className='q-badge'+(!Q?' active':'');
  document.getElementById('ffNote').textContent=
    'Q='+Q+' was captured on clock edge #'+clkCount+'. D='+D+' will be captured on the NEXT rising edge. '+
    'D can change freely now without affecting Q.';
  drawFF();drawTrace();
}

document.getElementById('ffD').onclick=function(){
  D^=1;
  traceEvents.push({d:D,clk:0,q:Q});
  refresh3();
};
document.getElementById('ffClk').onclick=function(){
  // Rising edge
  traceEvents.push({d:D,clk:0,q:Q});
  traceEvents.push({d:D,clk:1,q:Q});
  Q=D; clkCount++;
  traceEvents.push({d:D,clk:1,q:Q});
  traceEvents.push({d:D,clk:0,q:Q});
  if(traceEvents.length>60) traceEvents=traceEvents.slice(-40);
  refresh3();
};
refresh3();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A D flip-flop has Q=0. D is changed to 1, then back to 0, then to 1 again — all without a clock edge. The clock then rises. What is Q after the rising edge?`,
      options: [
        { label: 'A', text: 'Q=0 — the first value D had (0) is captured' },
        { label: 'B', text: 'Q=1 — D\'s value at the moment of the rising clock edge is captured' },
        { label: 'C', text: 'Q=0 — the most recent low value of D is captured' },
        { label: 'D', text: 'Q is undefined — multiple D transitions before the clock edge corrupt the state' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A D flip-flop samples D at the instant of the rising clock edge. The history of D before the edge is irrelevant. D=1 at the moment the clock rises → Q=1. This is the key difference from a D latch — only the value at the edge matters, not what happened before.',
      failMessage: 'The D flip-flop captures D\'s value at exactly one moment: the rising clock edge. All previous values of D are irrelevant. D=1 at the clock edge → Q becomes 1. The multiple transitions before the edge are ignored.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Flip-Flop Variants and Timing

The D flip-flop is the most common type in modern digital design, but several other variants exist:

**JK flip-flop**: has two inputs J (Set-like) and K (Reset-like), plus a toggle mode when both J=K=1. Unlike the SR latch, J=K=1 is not forbidden — it causes the flip-flop to toggle its output on the next clock edge. The JK is universal — it can be configured as D (tie K=J̄), T (tie K=J), or SR (with no forbidden state issue). Historically common but rarely used in new designs.

**T flip-flop** (Toggle): a single T input. When T=1, Q toggles on each clock edge. When T=0, Q holds. T flip-flops are used in counters: connect T=1 permanently and Q toggles every clock cycle — a divide-by-2 circuit.

**Asynchronous inputs**: most flip-flops have override inputs that act immediately, regardless of the clock:
- **Preset (PRE̅)**: forces Q=1 asynchronously (active-low)
- **Clear (CLR̅)**: forces Q=0 asynchronously (active-low)

These are used for initialisation — setting all flip-flops to a known state at power-up or reset.

**Timing parameters**:
- $t_{clk-to-Q}$: time from rising clock edge to Q settling
- $t_{su}$: setup time — how early D must be stable before clock edge
- $t_h$: hold time — how long D must remain stable after clock edge
- $t_{clk-to-Q} + t_{logic} + t_{su} \\leq T_{clk}$: the fundamental timing constraint from Lesson 3.5`,
    },

    // ── Visual 4 — Flip-flop variants and timing ─────────────────────────────
    {
      type: 'js',
      instruction: `### JK and T flip-flops, and timing parameters

Explore JK (universal), T (toggle/counter), and timing constraints. For the timing view, adjust gate delay and see how many flip-flop stages fit in one clock period.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="tab-btn active" id="vJK" onclick="setFFVar('JK')">JK flip-flop</button>
    <button class="tab-btn"        id="vT"  onclick="setFFVar('T')">T flip-flop (counter)</button>
    <button class="tab-btn"        id="vTim" onclick="setFFVar('Timing')">Timing params</button>
  </div>
  <canvas id="ffvcv" width="520" height="240"></canvas>
  <div id="ffvNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.tab-btn.active{border-color:#6366f1;background:rgba(99,102,241,0.12);color:#818cf8}`,
      startCode: `
var ffVar='JK', jkJ=0, jkK=0, jkQ=0, jkClk=0;
var tQ=1, tClk=0, tCount=0;
var cv=document.getElementById('ffvcv'),ctx=cv.getContext('2d');

function box2(x,y,w,h,label,col,active){
  ctx.fillStyle=active?col+'22':'rgba(255,255,255,0.03)';
  ctx.strokeStyle=active?col:'rgba(255,255,255,0.1)';ctx.lineWidth=active?2:0.5;
  ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.fill();ctx.stroke();
  ctx.fillStyle=active?col:'rgba(255,255,255,0.35)';
  ctx.font=(active?'bold ':'')+'11px monospace';ctx.textAlign='center';
  ctx.fillText(label,x+w/2,y+h/2+4);
}
function wire3(x1,y1,x2,y2,v,col){
  ctx.strokeStyle=col||(v?'#4ade80':'#475569');ctx.lineWidth=v?2.5:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}

function drawJK(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var bx=170,by=40,bw=120,bh=140;
  box2(bx,by,bw,bh,'JK FF','#818cf8',true);
  ctx.fillStyle='#818cf8';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('JK Flip-Flop',bx+bw/2,by+18);
  // Triangle
  ctx.strokeStyle='#fbbf24';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(bx+8,by+bh-24);ctx.lineTo(bx+18,by+bh-29);ctx.lineTo(bx+8,by+bh-34);ctx.stroke();

  // Inputs
  [[' J',jkJ,'#818cf8',by+46],[' K',jkK,'#a78bfa',by+76],['CLK',1,'#fbbf24',by+bh-29]].forEach(function(inp){
    wire3(14,inp[3],bx,inp[3],inp[1],inp[2]);
    ctx.fillStyle=inp[2];ctx.font='500 11px monospace';ctx.textAlign='right';
    ctx.fillText(inp[0]+'='+inp[1],12,inp[3]+4);
  });

  // Outputs
  wire3(bx+bw,by+46,W-14,by+46,!!jkQ);
  ctx.fillStyle=jkQ?'#4ade80':'#475569';ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText('Q='+jkQ,W-12,by+50);
  wire3(bx+bw,by+76,W-14,by+76,!!(1-jkQ));
  ctx.fillStyle=(1-jkQ)?'#4ade80':'#475569';
  ctx.fillText('Q̄='+(1-jkQ),W-12,by+80);

  // Truth table
  var tx=20,ty=30,rh=22;
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ['J','K','Qₙ₊₁','Action'].forEach(function(h,i){ctx.fillText(h,tx+[14,44,74,120][i],ty);});
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(tx,ty+5);ctx.lineTo(tx+155,ty+5);ctx.stroke();
  [['0','0','Q','Hold',' '],['0','1','0','Reset',' '],['1','0','1','Set',' '],['1','1','Q̄','Toggle','!']].forEach(function(row,ri){
    var y2=ty+12+ri*rh;
    var isActive=row[0]==jkJ&&row[1]==jkK;
    if(isActive){ctx.fillStyle='rgba(99,102,241,0.12)';ctx.fillRect(tx,y2-12,155,rh);}
    row.slice(0,4).forEach(function(v,ci){
      ctx.fillStyle=isActive?'#818cf8':'rgba(255,255,255,0.35)';
      ctx.font=(isActive?'bold ':'')+'10px monospace';ctx.textAlign='center';
      ctx.fillText(v,tx+[14,44,74,120][ci],y2);
    });
  });

  // Control buttons
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Click J/K to toggle, then CLK pulse',20,H-8);

  // Interactive areas stored for click
  cv._jkAreas=[
    {x:14,y:by+38,w:bx-14,h:18,fn:function(){jkJ^=1;}},
    {x:14,y:by+68,w:bx-14,h:18,fn:function(){jkK^=1;}},
    {x:14,y:by+bh-37,w:bx-14,h:18,fn:function(){var nQ;if(jkJ===0&&jkK===0)nQ=jkQ;else if(jkJ===0)nQ=0;else if(jkK===0)nQ=1;else nQ=1-jkQ;jkQ=nQ;jkClk++;}}
  ];
  document.getElementById('ffvNote').textContent=
    'JK flip-flop: J=1,K=0 → Set. J=0,K=1 → Reset. J=0,K=0 → Hold. J=1,K=1 → Toggle (Q flips). '+
    'Current: J='+jkJ+', K='+jkK+', Q='+jkQ+'. Last action: '+
    (jkJ===0&&jkK===0?'Hold':jkJ===0?'Reset':jkK===0?'Set':'Toggle')+'. Click inputs then CLK area to advance.';
}

function drawT(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  // Show 3-bit counter built from T flip-flops
  var N=3;
  var bits=[(tCount>>2)&1,(tCount>>1)&1,tCount&1];
  var bw=80,bh=100,gap=20,startX=(W-N*(bw+gap))/2;
  var labels=['Q2 (MSB)','Q1','Q0 (LSB)'];
  bits.forEach(function(b,i){
    var x=startX+i*(bw+gap);
    box2(x,60,bw,bh,'T FF','#059669',true);
    ctx.fillStyle='#059669';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(labels[i],x+bw/2,54);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';
    ctx.fillText('T=1',x+bw/2,72);
    ctx.strokeStyle='#fbbf24';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x+8,60+bh-24);ctx.lineTo(x+18,60+bh-29);ctx.lineTo(x+8,60+bh-34);ctx.stroke();
    // Q value
    ctx.fillStyle=b?'#4ade80':'rgba(255,255,255,0.2)';ctx.font='bold 28px monospace';ctx.textAlign='center';
    ctx.fillText(b,x+bw/2,130);
    // Carry arrow
    if(i>0){
      ctx.strokeStyle='rgba(251,191,36,0.5)';ctx.lineWidth=1;ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(x-gap+2,130);ctx.lineTo(x-2,130);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(251,191,36,0.6)';ctx.font='8px monospace';ctx.textAlign='center';
      ctx.fillText('÷2',x-gap/2,124);
    }
  });

  // Count display
  ctx.fillStyle='#4ade80';ctx.font='bold 20px monospace';ctx.textAlign='center';
  ctx.fillText('Count = '+tCount+' ('+bits.join('')+'b)',W/2,200);

  // CLK pulse button area
  ctx.fillStyle='rgba(251,191,36,0.12)';ctx.strokeStyle='#fbbf24';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(W/2-70,210,140,30,6);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fbbf24';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('▲ CLK pulse',W/2,230);
  cv._tArea={x:W/2-70,y:210,w:140,h:30,fn:function(){tCount=(tCount+1)%8;draw4();}};
  document.getElementById('ffvNote').textContent=
    'Three T flip-flops with T=1 form a 3-bit ripple counter. Each T flip-flop divides its input frequency by 2. Q0 toggles every clock. Q1 toggles every 2 clocks. Q2 every 4. Count sequence: 0→1→2→3→4→5→6→7→0. Click CLK to advance.';
}

function drawTiming(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var tsu=3,th=1,tclkQ=4,tlogic=8,Tclk=tsu+th+tclkQ+tlogic+4;
  var scale=Math.floor((W-40)/Tclk);
  var px=function(t){return 20+t*scale;};
  var items=[
    {x0:0,    x1:tclkQ,  y:30, col:'#38bdf8', label:'t_clk-Q='+tclkQ+'ns'},
    {x0:tclkQ,x1:tclkQ+tlogic,y:60,col:'#a78bfa',label:'t_logic='+tlogic+'ns'},
    {x0:tclkQ+tlogic,x1:tclkQ+tlogic+tsu,y:90,col:'#fbbf24',label:'t_su='+tsu+'ns'},
    {x0:0,    x1:Tclk,   y:120,col:'rgba(255,255,255,0.4)',label:'T_clk='+Tclk+'ns'},
  ];
  // CLK edge
  ctx.strokeStyle='rgba(251,191,36,0.6)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(px(0),20);ctx.lineTo(px(0),H-20);ctx.stroke();
  ctx.fillStyle='#fbbf24';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText('CLK↑',px(0),16);
  ctx.strokeStyle='rgba(251,191,36,0.4)';
  ctx.beginPath();ctx.moveTo(px(Tclk),20);ctx.lineTo(px(Tclk),H-20);ctx.stroke();
  ctx.fillText('CLK↑',px(Tclk),16);

  items.forEach(function(item){
    var x1=px(item.x0),x2=px(item.x1);
    ctx.fillStyle=item.col.replace(')','').replace('rgba','rgba').split(',').slice(0,3).join(',')+(item.col.startsWith('#')?'33':'.15')+')';
    if(item.col.startsWith('#')) ctx.fillStyle=item.col+'22';
    ctx.strokeStyle=item.col;ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(x1,item.y-10,x2-x1,22,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=item.col;ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(item.label,(x1+x2)/2,item.y+5);
    // Arrows
    ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x1+4,item.y+14);ctx.lineTo(x1,item.y+10);ctx.lineTo(x1+4,item.y+6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x2-4,item.y+14);ctx.lineTo(x2,item.y+10);ctx.lineTo(x2-4,item.y+6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x1,item.y+10);ctx.lineTo(x2,item.y+10);ctx.stroke();
  });

  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('Constraint: T_clk \u2265 t_clk-Q + t_logic + t_su',20,H-10);
  ctx.fillText('= '+tclkQ+' + '+tlogic+' + '+tsu+' = '+( tclkQ+tlogic+tsu)+'ns  \u2192  f_max \u2248 '+Math.round(1000/(tclkQ+tlogic+tsu))+' MHz',20,H+4);
  document.getElementById('ffvNote').textContent=
    'The fundamental timing constraint: T_clk \u2265 t_clk-to-Q + t_logic + t_setup. Here: 4+8+3=15ns → f_max≈67MHz. Reducing logic depth (fewer gates between registers) directly increases the maximum clock frequency.';
}

function draw4(){
  if(ffVar==='JK') drawJK();
  else if(ffVar==='T') drawT();
  else drawTiming();
}

cv.onclick=function(e){
  var rect=cv.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(cv.width/rect.width);
  var my=(e.clientY-rect.top)*(cv.height/rect.height);
  if(ffVar==='JK'&&cv._jkAreas){
    cv._jkAreas.forEach(function(a){if(mx>=a.x&&mx<=a.x+a.w&&my>=a.y&&my<=a.y+a.h){a.fn();draw4();}});
  }
  if(ffVar==='T'&&cv._tArea){
    var a=cv._tArea;if(mx>=a.x&&mx<=a.x+a.w&&my>=a.y&&my<=a.y+a.h){a.fn();}
  }
};

function setFFVar(v){
  ffVar=v;
  ['JK','T','Timing'].forEach(function(k){
    document.getElementById('v'+k).className='tab-btn'+(ffVar===k?' active':'');
  });
  draw4();
}
window.setFFVar=setFFVar;
draw4();`,
      outputHeight: 420,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A T flip-flop has T=1 connected permanently. What does the circuit produce, and what is its output frequency relative to the input clock?`,
      options: [
        { label: 'A', text: 'The output stays at Q=1 permanently — T=1 sets the flip-flop' },
        { label: 'B', text: 'The output toggles on every rising clock edge, producing a square wave at half the clock frequency (divide-by-2)' },
        { label: 'C', text: 'The output toggles twice per clock cycle — once on rising and once on falling edge' },
        { label: 'D', text: 'The output is the same as D flip-flop — T=1 passes the clock through' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. T=1 means the flip-flop toggles its output on every rising clock edge. If Q=0 before the edge, Q becomes 1. If Q=1 before the edge, Q becomes 0. The output is a square wave at exactly half the clock frequency — a divide-by-2 circuit. Chain three T flip-flops for a divide-by-8 (3-bit binary counter).',
      failMessage: 'T=1: the flip-flop toggles on each rising clock edge. Q alternates 0,1,0,1,... — a square wave. Since it takes two clock edges to complete one output cycle, the output frequency = clock frequency / 2. Three chained T flip-flops give ÷2, ÷4, ÷8 — a 3-bit ripple counter.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Latches and Flip-Flops

**SR latch** (cross-coupled NOR gates): two stable states — SET (Q=1) and RESET (Q=0). HOLD when S=R=0. FORBIDDEN when S=R=1. The foundation of all sequential memory elements.

**D latch** (transparent latch): eliminates the forbidden state by tying R=NOT(S). When EN=1, Q=D (transparent). When EN=0, Q holds. Level-sensitive — responds to the *level* of EN.

**D flip-flop** (edge-triggered): captures D only at the rising (or falling) clock edge. Q is stable between edges regardless of D changes. Requires setup time before and hold time after the edge. The standard building block of all clocked digital design.

**JK flip-flop**: Hold (J=K=0), Reset (J=0,K=1), Set (J=1,K=0), Toggle (J=K=1). Universal — can emulate D, T, or SR. Historically important, now mostly replaced by D.

**T flip-flop**: T=0 holds, T=1 toggles on clock edge. T=1 permanently → divide-by-2, the building block of binary counters.

**Timing**: $T_{clk} \\geq t_{clk-to-Q} + t_{logic} + t_{su}$. Violating setup or hold time causes metastability.

Next lesson: registers and shift registers — combining flip-flops to store words and move data serially.`,
    },
  ],
};

export default {
  id: 'df-6-1-latches-flip-flops',
  slug: 'latches-flip-flops',
  chapter: 'df.6',
  order: 1,
  title: 'Latches and Flip-Flops',
  subtitle: 'The first sequential circuits — logic that remembers its past.',
  tags: ['digital','latch','flip-flop','SR-latch','D-latch','D-flip-flop','JK','T-flip-flop','sequential','edge-triggered','setup-time','hold-time'],
  hook: {
    question: 'Combinational logic forgets everything the moment its inputs change. How do computers remember anything at all?',
    realWorldContext: 'Every register in every CPU, every RAM cell, every cache line is ultimately a D flip-flop or a pair of cross-coupled inverters. The SR latch is the element on every FPGA configuration memory bit. Understanding flip-flops is understanding how state is stored in all digital hardware.',
  },
  intuition: {
    prose: [
      'SR latch: feedback between two NOR gates creates two stable states. Memory via feedback.',
      'D latch: transparent when EN=1 (Q=D), opaque when EN=0 (Q holds). Level-sensitive.',
      'D flip-flop: Q updates only at clock edge. History of D before the edge is irrelevant.',
      'JK: universal. T=J=K permanently wired: divide-by-2. Chain three: 3-bit counter.',
    ],
    callouts: [
      {type:'tip', title:'Latch vs flip-flop', body:'Latch: level-sensitive (responds to EN level). Flip-flop: edge-sensitive (responds to clock transition). In synchronous design, always use flip-flops — latches create timing hazards.'},
      {type:'important', title:'Setup and hold time', body:'D must be stable for t_su before and t_h after the clock edge. Violating either can cause metastability — the flip-flop enters a state between 0 and 1 that can take arbitrarily long to resolve, causing system failure.'},
    ],
    visualizations:[{id:'ScienceNotebook',title:'Latches and Flip-Flops',props:{lesson:LESSON_DF_6_1}}],
  },
  math:{prose:[],callouts:[],visualizations:[]},
  rigor:{prose:[],callouts:[],visualizations:[]},
  examples:[],challenges:[],
  mentalModel:[
    'Cross-coupled NOR: each gate output forces the other gate output via feedback. Two stable states.',
    'S=1: forces Q=1. R=1: forces Q=0. S=R=0: hold state. S=R=1: forbidden.',
    'D latch = SR latch + NOT gate. EN=1: transparent. EN=0: opaque.',
    'D flip-flop = master-slave latches. Q captures D at clock edge. Stable between edges.',
    'T_clk ≥ t_clkQ + t_logic + t_su. More logic between registers = lower max frequency.',
  ],
  checkpoints:['read-intuition'],
  quiz:[],
};