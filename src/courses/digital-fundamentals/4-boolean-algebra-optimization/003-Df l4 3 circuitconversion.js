// Digital Fundamentals · Unit 4 · Lesson 3
// Circuit Conversion: Bubble Pushing and NAND/NOR Implementations
// ScienceNotebook format

export const LESSON_DF_4_3 = {
  title: 'Circuit Conversion: Bubble Pushing and NAND/NOR Implementations',
  subtitle: 'How to convert any AND-OR circuit to all-NAND or all-NOR, and how to read mixed-logic schematics.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### From AND-OR to All-NAND

In Lesson 4.1 you proved algebraically that NAND-NAND equals AND-OR. In Lesson 4.2 the K-map gave you a minimal SOP expression. Now the question is: how do you systematically convert that SOP circuit into an all-NAND implementation — and do the same in reverse for POS using NOR gates?

The tool is **bubble pushing** — a graphical technique based on De Morgan's theorem that lets you transform gate circuits without touching the algebra.

**The two De Morgan symbol equivalences**:
- NAND gate = AND body with output bubble = OR body with input bubbles
- NOR gate = OR body with output bubble = AND body with input bubbles

**The bubble-pushing rules**:
1. A bubble on an output can be moved to become bubbles on all inputs, provided you flip the gate body (AND↔OR).
2. Two consecutive bubbles on a wire cancel — they are a double negation.
3. To convert AND-OR to NAND-NAND: add a bubble to each AND gate output and a bubble to the OR gate input for that wire — the two bubbles cancel so the function is unchanged, but now every gate has an output bubble (NAND or NOR form).

**The conversion procedure**:
1. Start with your AND-OR SOP circuit.
2. Add output bubbles to all first-level AND gates → they become NAND gates.
3. Add corresponding input bubbles to the OR gate for each connection → bubbles cancel (double negation).
4. The OR gate with all input bubbles = NAND gate (De Morgan equivalent).
5. Result: all-NAND circuit implementing the same function.`,
    },

    // ── Visual 1 — Bubble pushing step by step ────────────────────────────────
    {
      type: 'js',
      instruction: `### AND-OR → NAND-NAND via bubble pushing

Click through the three conversion steps. Each step adds or cancels bubbles. The truth table on the right confirms the function never changes.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:12px">
    <button class="step-btn active" id="s0" onclick="setStep(0)">1. AND-OR</button>
    <button class="step-btn" id="s1" onclick="setStep(1)">2. Add bubbles</button>
    <button class="step-btn" id="s2" onclick="setStep(2)">3. NAND-NAND</button>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="360" height="220"></canvas>
    <div style="flex:1;min-width:160px">
      <div id="stepTitle" style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:6px"></div>
      <div id="stepNote" style="font-size:12px;color:rgba(255,255,255,0.45);line-height:1.75;margin-bottom:10px"></div>
      <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em">Truth table (F = AB + CD)</div>
      <canvas id="tt" width="180" height="140"></canvas>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.step-btn{padding:6px 14px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.45);font-family:monospace;font-size:12px;cursor:pointer}
.step-btn.active{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}`,
      startCode: `
var step=0;
var canvas=document.getElementById('cv'),tt=document.getElementById('tt');
var ctx=canvas.getContext('2d'),ttc=tt.getContext('2d');

var STEPS=[
  {title:'AND-OR circuit',
   note:'Two AND gates feed an OR gate. This implements F = AB + CD. The standard SOP form — direct but uses mixed gate types.',
   g1bubble:false,g2bubble:false,orbubbles:false,orIsNAND:false},
  {title:'Add cancelling bubbles',
   note:'Add an output bubble to each AND gate and an input bubble to the OR gate on each corresponding wire. Each pair of bubbles cancels (double negation). The function is unchanged.',
   g1bubble:true,g2bubble:true,orbubbles:true,orIsNAND:false},
  {title:'NAND-NAND circuit',
   note:'AND + output bubble = NAND. OR + all input bubbles = NAND (De Morgan). The bubbles-on-wires cancel. Result: identical function, all NAND gates, single logic family.',
   g1bubble:true,g2bubble:true,orbubbles:false,orIsNAND:true},
];

function drawAND(c,x,y,w,h,col,hasBubble){
  c.fillStyle=col+'22'; c.strokeStyle=col; c.lineWidth=1.5;
  c.beginPath();
  c.moveTo(x+4,y+4); c.lineTo(x+w/2-4,y+4);
  c.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  c.lineTo(x+4,y+h-4); c.closePath(); c.fill(); c.stroke();
  if(hasBubble){
    c.beginPath(); c.arc(x+w+5,y+h/2,5,0,2*Math.PI);
    c.fillStyle=col+'33'; c.strokeStyle=col; c.lineWidth=1.5; c.fill(); c.stroke();
  }
  var iy1=y+h*0.3,iy2=y+h*0.7;
  c.strokeStyle=col+'88'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x-20,iy1);c.lineTo(x,iy1);c.stroke();
  c.beginPath();c.moveTo(x-20,iy2);c.lineTo(x,iy2);c.stroke();
  c.beginPath();c.moveTo(x+w+(hasBubble?10:0),y+h/2);c.lineTo(x+w+(hasBubble?10:0)+20,y+h/2);c.stroke();
}

function drawOR(c,x,y,w,h,col,inputBubbles,isNAND){
  c.fillStyle=col+'22'; c.strokeStyle=col; c.lineWidth=1.5;
  c.beginPath();
  c.moveTo(x+4,y+4);
  c.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);
  c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill(); c.stroke();
  if(isNAND){
    c.beginPath(); c.arc(x+w+5,y+h/2,5,0,2*Math.PI);
    c.fillStyle=col+'33'; c.strokeStyle=col; c.fill(); c.stroke();
  }
  var iy1=y+h*0.3,iy2=y+h*0.7;
  if(inputBubbles){
    c.beginPath();c.arc(x-5,iy1,5,0,2*Math.PI);c.fillStyle=col+'33';c.fill();c.stroke();
    c.beginPath();c.arc(x-5,iy2,5,0,2*Math.PI);c.fill();c.stroke();
  }
  c.strokeStyle=col+'88'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x-(inputBubbles?10:0)-20,iy1);c.lineTo(x-(inputBubbles?10:0),iy1);c.stroke();
  c.beginPath();c.moveTo(x-(inputBubbles?10:0)-20,iy2);c.lineTo(x-(inputBubbles?10:0),iy2);c.stroke();
  c.beginPath();c.moveTo(x+w+(isNAND?10:0),y+h/2);c.lineTo(x+w+(isNAND?10:0)+20,y+h/2);c.stroke();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  var s=STEPS[step];
  var gw=72,gh=52;
  var g1x=80,g1y=30,g2x=80,g2y=130;
  var orx=230,ory=H/2-gh/2;

  // AND gates
  drawAND(ctx,g1x,g1y,gw,gh,'#0891b2',s.g1bubble);
  drawAND(ctx,g2x,g2y,gw,gh,'#0891b2',s.g2bubble);

  // Input labels
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px monospace'; ctx.textAlign='right';
  ctx.fillText('A',g1x-22,g1y+gh*0.3+4); ctx.fillText('B',g1x-22,g1y+gh*0.7+4);
  ctx.fillText('C',g2x-22,g2y+gh*0.3+4); ctx.fillText('D',g2x-22,g2y+gh*0.7+4);

  // Gate labels
  ctx.fillStyle='#0891b2'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText(s.g1bubble?'NAND':'AND',g1x+gw/2,g1y-6);
  ctx.fillText(s.g2bubble?'NAND':'AND',g2x+gw/2,g2y-6);

  // Wires to OR
  var w1x=g1x+gw+(s.g1bubble?10:0)+20;
  var w2x=g2x+gw+(s.g2bubble?10:0)+20;
  ctx.strokeStyle='rgba(99,102,241,0.5)'; ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(w1x,g1y+gh/2);ctx.lineTo(w1x+20,g1y+gh/2);
  ctx.lineTo(w1x+20,ory+gh*0.3);ctx.lineTo(orx-(s.orbubbles?10:0),ory+gh*0.3);ctx.stroke();
  ctx.beginPath();ctx.moveTo(w2x,g2y+gh/2);ctx.lineTo(w2x+20,g2y+gh/2);
  ctx.lineTo(w2x+20,ory+gh*0.7);ctx.lineTo(orx-(s.orbubbles?10:0),ory+gh*0.7);ctx.stroke();

  // Cancel markers
  if(s.orbubbles&&step===1){
    ctx.strokeStyle='rgba(239,68,68,0.5)'; ctx.lineWidth=1;
    var cx1=w1x+14,cy1=g1y+gh/2;
    ctx.beginPath();ctx.moveTo(cx1-6,cy1-6);ctx.lineTo(cx1+6,cy1+6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx1+6,cy1-6);ctx.lineTo(cx1-6,cy1+6);ctx.stroke();
    var cx2=w2x+14,cy2=g2y+gh/2;
    ctx.beginPath();ctx.moveTo(cx2-6,cy2-6);ctx.lineTo(cx2+6,cy2+6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx2+6,cy2-6);ctx.lineTo(cx2-6,cy2+6);ctx.stroke();
    ctx.fillStyle='rgba(239,68,68,0.7)'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText('cancel',cx1,cy1+14); ctx.fillText('cancel',cx2,cy2+14);
  }

  // OR/NAND gate
  drawOR(ctx,orx,ory,gw,gh,'#7c3aed',s.orbubbles,s.orIsNAND);
  ctx.fillStyle='#7c3aed'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText(s.orIsNAND?'NAND':'OR',orx+gw/2,ory-6);

  // Output
  ctx.strokeStyle='#4ade80'; ctx.lineWidth=2;
  var outX=orx+gw+(s.orIsNAND?10:0)+20;
  ctx.beginPath();ctx.moveTo(outX,ory+gh/2);ctx.lineTo(outX+20,ory+gh/2);ctx.stroke();
  ctx.fillStyle='#4ade80'; ctx.font='bold 12px monospace'; ctx.textAlign='left';
  ctx.fillText('F',outX+22,ory+gh/2+4);

  // Expression
  var exprs=['F = AB + CD','F = \u0305A\u0305\u0305B\u0305 \u00b7 \u0305C\u0305\u0305D\u0305  (bubbles cancel)','F = \u0305\u0305\u0305(A\u0305\u0305B\u0305)\u0305\u0305\u00b7\u0305\u0305(C\u0305\u0305D\u0305)\u0305\u0305 = AB+CD'];
  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='11px monospace'; ctx.textAlign='left';
  ctx.fillText(exprs[step],10,H-8);
}

function drawTT(){
  var W=tt.width,H=tt.height;
  ttc.clearRect(0,0,W,H); ttc.fillStyle='#0a0f1e'; ttc.fillRect(0,0,W,H);
  var rows=[];
  for(var i=0;i<16;i++){
    var A=(i>>3)&1,B=(i>>2)&1,C=(i>>1)&1,D=i&1;
    rows.push([A,B,C,D,(A&B)|(C&D)]);
  }
  var rh=Math.floor((H-20)/16), cw=Math.floor(W/5);
  ['A','B','C','D','F'].forEach(function(h,i){
    ttc.fillStyle=i===4?'#4ade80':'rgba(255,255,255,0.35)';
    ttc.font='bold 9px monospace'; ttc.textAlign='center';
    ttc.fillText(h,i*cw+cw/2,12);
  });
  ttc.strokeStyle='rgba(255,255,255,0.08)'; ttc.lineWidth=0.5;
  ttc.beginPath();ttc.moveTo(0,15);ttc.lineTo(W,15);ttc.stroke();
  rows.forEach(function(row,ri){
    var y=18+ri*rh;
    row.forEach(function(v,ci){
      var col=ci===4?(v?'#4ade80':'rgba(255,255,255,0.2)'):'rgba(255,255,255,0.35)';
      ttc.fillStyle=col; ttc.font='9px monospace'; ttc.textAlign='center';
      ttc.fillText(v,ci*cw+cw/2,y);
    });
  });
}

function setStep(s){
  step=s;
  ['s0','s1','s2'].forEach(function(id,i){
    document.getElementById(id).className='step-btn'+(step===i?' active':'');
  });
  var t=STEPS[step];
  document.getElementById('stepTitle').textContent=t.title;
  document.getElementById('stepNote').textContent=t.note;
  draw(); drawTT();
}
window.setStep=setStep;
setStep(0);`,
      outputHeight: 400,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `After converting AND-OR to NAND-NAND via bubble pushing, why does the truth table stay the same?`,
      options: [
        { label: 'A', text: 'Because NAND and AND compute the same function' },
        { label: 'B', text: 'Because each added bubble is paired with a cancelling bubble — two negations cancel, leaving the logic unchanged' },
        { label: 'C', text: 'Because the output OR gate is not changed, only the AND gates' },
        { label: 'D', text: 'Because NAND-NAND and AND-OR are only equivalent for 2-input gates' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Each AND gate gets an output bubble → it becomes NAND. The OR gate gets input bubbles on those same wires → those pairs of bubbles (one on output, one on input of the same wire) are double negations that cancel exactly. No logic changes, only the gate symbols change to reflect the physical NAND implementation.',
      failMessage: 'The conversion works because every bubble added comes in a pair on the same wire — one on the driving gate\'s output and one on the receiving gate\'s input. Two bubbles on the same wire = NOT(NOT(x)) = x. They cancel, leaving the logical function identical.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight: 300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### POS to NOR-NOR

The dual of NAND-NAND for SOP is NOR-NOR for POS (Product of Sums). The same bubble-pushing procedure applies, but starting from an OR-AND circuit.

**POS circuit**: a two-level OR-AND circuit. First level: OR gates compute each sum term. Second level: AND gate combines them.

**NOR-NOR conversion**:
1. Add output bubbles to all first-level OR gates → they become NOR gates.
2. Add input bubbles to the AND gate for each connection → bubbles cancel.
3. AND gate with all input bubbles = NOR gate (De Morgan).
4. Result: all-NOR implementation of the POS expression.

**When to use POS/NOR-NOR vs SOP/NAND-NAND**:
- If the function has more 1-cells than 0-cells in the truth table, SOP (fewer minterms) is usually simpler.
- If the function has more 0-cells than 1-cells, POS (fewer maxterms) is usually simpler.
- In practice, the K-map for the complement $\\bar{F}$ gives the POS of F: group the 0-cells, complement the resulting SOP, apply De Morgan.

**Mixed implementations**: real chips often mix NAND and NOR gates. The bubble-pushing rules let you match bubbles at each connection — a bubble on a driving output cancels a bubble on the receiving input, regardless of the mix.`,
    },

    // ── Visual 2 — OR-AND → NOR-NOR ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### OR-AND → NOR-NOR via bubble pushing

The dual conversion: POS circuit becomes all-NOR. Step through the same three stages — add bubbles, observe cancellation, arrive at the NOR-NOR form.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:12px">
    <button class="step-btn active" id="p0" onclick="setPStep(0)">1. OR-AND</button>
    <button class="step-btn" id="p1" onclick="setPStep(1)">2. Add bubbles</button>
    <button class="step-btn" id="p2" onclick="setPStep(2)">3. NOR-NOR</button>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv2" width="360" height="220"></canvas>
    <div style="flex:1;min-width:160px">
      <div id="pTitle" style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:6px"></div>
      <div id="pNote" style="font-size:12px;color:rgba(255,255,255,0.45);line-height:1.75;margin-bottom:10px"></div>
      <div style="padding:10px 12px;border-radius:8px;background:rgba(99,102,241,0.06);border:0.5px solid rgba(99,102,241,0.2)">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px">Expression</div>
        <div id="pExpr" style="font-size:13px;color:#818cf8;font-weight:600"></div>
      </div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.step-btn{padding:6px 14px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.45);font-family:monospace;font-size:12px;cursor:pointer}
.step-btn.active{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}`,
      startCode: `
var pstep=0;
var cv2=document.getElementById('cv2'), ctx2=cv2.getContext('2d');
var PSTEPS=[
  {title:'OR-AND (POS) circuit',
   note:'Two OR gates feed an AND gate. Implements F = (A+B)(C+D). The standard POS form.',
   orBubble:false,andBubbles:false,andIsNOR:false,
   expr:'F = (A+B)(C+D)'},
  {title:'Add cancelling bubbles',
   note:'Output bubbles on OR gates + input bubbles on AND gate. Each pair on the same wire cancels.',
   orBubble:true,andBubbles:true,andIsNOR:false,
   expr:'F = ̄(A+B)·̄(C+D) with cancel pairs'},
  {title:'NOR-NOR circuit',
   note:'OR + output bubble = NOR. AND + all input bubbles = NOR (De Morgan). All gates are now NOR.',
   orBubble:true,andBubbles:false,andIsNOR:true,
   expr:'F = NOR(NOR(A,B), NOR(C,D)) = (A+B)(C+D)'},
];

function drawOR2(c,x,y,w,h,col,hasBubble){
  c.fillStyle=col+'22'; c.strokeStyle=col; c.lineWidth=1.5;
  c.beginPath();
  c.moveTo(x+4,y+4);c.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);
  c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill(); c.stroke();
  if(hasBubble){c.beginPath();c.arc(x+w+5,y+h/2,5,0,2*Math.PI);c.fillStyle=col+'33';c.fill();c.stroke();}
  var iy1=y+h*0.3,iy2=y+h*0.7;
  c.strokeStyle=col+'88'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x-20,iy1);c.lineTo(x+12,iy1);c.stroke();
  c.beginPath();c.moveTo(x-20,iy2);c.lineTo(x+12,iy2);c.stroke();
  c.beginPath();c.moveTo(x+w+(hasBubble?10:0),y+h/2);c.lineTo(x+w+(hasBubble?10:0)+20,y+h/2);c.stroke();
}

function drawAND2(c,x,y,w,h,col,inputBubbles,isNOR){
  c.fillStyle=col+'22'; c.strokeStyle=col; c.lineWidth=1.5;
  c.beginPath();
  c.moveTo(x+4,y+4);c.lineTo(x+w/2-4,y+4);
  c.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  c.lineTo(x+4,y+h-4);c.closePath();c.fill();c.stroke();
  if(isNOR){
    // actually draw NOR body instead
  }
  if(inputBubbles){
    var iy1=y+h*0.3,iy2=y+h*0.7;
    c.beginPath();c.arc(x-5,iy1,5,0,2*Math.PI);c.fillStyle=col+'33';c.fill();c.stroke();
    c.beginPath();c.arc(x-5,iy2,5,0,2*Math.PI);c.fill();c.stroke();
  }
  var iy1=y+h*0.3,iy2=y+h*0.7;
  c.strokeStyle=col+'88'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x-(inputBubbles?10:0)-20,iy1);c.lineTo(x-(inputBubbles?10:0),iy1);c.stroke();
  c.beginPath();c.moveTo(x-(inputBubbles?10:0)-20,iy2);c.lineTo(x-(inputBubbles?10:0),iy2);c.stroke();
  c.beginPath();c.moveTo(x+w,y+h/2);c.lineTo(x+w+20,y+h/2);c.stroke();
}

function drawNOR2(c,x,y,w,h,col){
  c.fillStyle=col+'22'; c.strokeStyle=col; c.lineWidth=1.5;
  c.beginPath();
  c.moveTo(x+4,y+4);c.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);
  c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill(); c.stroke();
  c.beginPath();c.arc(x+w+5,y+h/2,5,0,2*Math.PI);c.fillStyle=col+'33';c.fill();c.stroke();
  var iy1=y+h*0.3,iy2=y+h*0.7;
  c.strokeStyle=col+'88'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x-20,iy1);c.lineTo(x+12,iy1);c.stroke();
  c.beginPath();c.moveTo(x-20,iy2);c.lineTo(x+12,iy2);c.stroke();
  c.beginPath();c.moveTo(x+w+10,y+h/2);c.lineTo(x+w+30,y+h/2);c.stroke();
}

function pdraw(){
  var W=cv2.width,H=cv2.height;
  ctx2.clearRect(0,0,W,H); ctx2.fillStyle='#0a0f1e'; ctx2.fillRect(0,0,W,H);
  var s=PSTEPS[pstep];
  var gw=72,gh=52,g1x=80,g1y=30,g2x=80,g2y=130,andx=240,andy=H/2-gh/2;

  if(s.andIsNOR){
    drawOR2(ctx2,g1x,g1y,gw,gh,'#059669',true);
    drawOR2(ctx2,g2x,g2y,gw,gh,'#059669',true);
    drawNOR2(ctx2,andx,andy,gw,gh,'#059669');
    ctx2.fillStyle='#059669'; ctx2.font='bold 10px monospace'; ctx2.textAlign='center';
    ctx2.fillText('NOR',g1x+gw/2,g1y-6);
    ctx2.fillText('NOR',g2x+gw/2,g2y-6);
    ctx2.fillText('NOR',andx+gw/2,andy-6);
  } else {
    drawOR2(ctx2,g1x,g1y,gw,gh,'#059669',s.orBubble);
    drawOR2(ctx2,g2x,g2y,gw,gh,'#059669',s.orBubble);
    drawAND2(ctx2,andx,andy,gw,gh,'#0891b2',s.andBubbles,false);
    ctx2.fillStyle='#059669'; ctx2.font='bold 10px monospace'; ctx2.textAlign='center';
    ctx2.fillText(s.orBubble?'NOR':'OR',g1x+gw/2,g1y-6);
    ctx2.fillText(s.orBubble?'NOR':'OR',g2x+gw/2,g2y-6);
    ctx2.fillStyle='#0891b2';
    ctx2.fillText('AND',andx+gw/2,andy-6);
  }

  // Labels
  ctx2.fillStyle='rgba(255,255,255,0.4)'; ctx2.font='11px monospace'; ctx2.textAlign='right';
  ['A','B','C','D'].forEach(function(l,i){
    var gx=i<2?g1x:g2x, gy=i<2?g1y:g2y;
    ctx2.fillText(l,gx-22,gy+gh*(i%2===0?0.3:0.7)+4);
  });

  // Wires
  var w1x=g1x+gw+(s.orBubble?10:0)+20, w2x=g2x+gw+(s.orBubble?10:0)+20;
  ctx2.strokeStyle='rgba(99,102,241,0.4)'; ctx2.lineWidth=1.5;
  if(!s.andIsNOR){
    ctx2.beginPath();ctx2.moveTo(w1x,g1y+gh/2);ctx2.lineTo(w1x+18,g1y+gh/2);
    ctx2.lineTo(w1x+18,andy+gh*0.3);ctx2.lineTo(andx-(s.andBubbles?10:0),andy+gh*0.3);ctx2.stroke();
    ctx2.beginPath();ctx2.moveTo(w2x,g2y+gh/2);ctx2.lineTo(w2x+18,g2y+gh/2);
    ctx2.lineTo(w2x+18,andy+gh*0.7);ctx2.lineTo(andx-(s.andBubbles?10:0),andy+gh*0.7);ctx2.stroke();
  }

  // Output
  ctx2.strokeStyle='#4ade80'; ctx2.lineWidth=2;
  var outX=s.andIsNOR?andx+gw+30:andx+gw+20;
  ctx2.beginPath();ctx2.moveTo(outX,andy+gh/2);ctx2.lineTo(outX+20,andy+gh/2);ctx2.stroke();
  ctx2.fillStyle='#4ade80'; ctx2.font='bold 12px monospace'; ctx2.textAlign='left';
  ctx2.fillText('F',outX+22,andy+gh/2+4);
}

function setPStep(s){
  pstep=s;
  ['p0','p1','p2'].forEach(function(id,i){
    document.getElementById(id).className='step-btn'+(pstep===i?' active':'');
  });
  var t=PSTEPS[pstep];
  document.getElementById('pTitle').textContent=t.title;
  document.getElementById('pNote').textContent=t.note;
  document.getElementById('pExpr').textContent=t.expr;
  pdraw();
}
window.setPStep=setPStep;
setPStep(0);`,
      outputHeight: 380,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A POS expression is F = (A+B)(C+D̄). How many NOR gates does the NOR-NOR implementation require, and what are their inputs?`,
      options: [
        { label: 'A', text: '3 NOR gates: NOR(A,B), NOR(C,D̄), then NOR of those two outputs' },
        { label: 'B', text: '2 NOR gates: one for each sum term, ANDed together at the output' },
        { label: 'C', text: '4 NOR gates: one NOT per variable plus one combining NOR' },
        { label: 'D', text: '1 NOR gate: NOR implements OR-AND directly' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. NOR-NOR mirrors NAND-NAND: one NOR per sum term (first level), one NOR combining all first-level outputs (second level). For two sum terms: NOR1(A,B), NOR2(C,D̄), NOR3(NOR1_out, NOR2_out). Note D̄ requires an inverter before NOR2.',
      failMessage: 'NOR-NOR implementation: one NOR gate per OR term in the POS expression (first level), then one NOR gate combining all first-level outputs (second level). Two sum terms → 2 first-level NORs + 1 second-level NOR = 3 NOR gates total.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight: 300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Reading Mixed-Logic Schematics

Professional schematics routinely mix gate symbols from the two De Morgan equivalents. A NAND gate might be drawn as an AND body with an output bubble, or as an OR body with input bubbles — depending on which representation makes the signal flow clearer.

**The active-level convention**: engineers draw the symbol whose "active" indicator (bubble = active-low, no bubble = active-high) matches the signal's active level at that pin. This makes the schematic self-documenting:

- A signal named **RESET_N** (active-low reset) should drive active-low inputs (shown with bubbles). If the signal connects to an AND gate drawn with a bubble on that input, you know this input is triggered when the signal is LOW.
- When a bubble on an output connects to a bubble on an input, they cancel — the wire carries the un-inverted logic value.
- When a bubble on an output connects to a non-bubbled input, the inversion is real — the receiving gate sees the complement.

**The two rules for reading mixed logic**:
1. **Bubble-to-bubble**: logic value on the wire is the un-inverted logic — the two bubbles cancel.
2. **Bubble-to-plain** or **plain-to-plain**: the bubble represents a real inversion that affects the logic.

This notation is why experienced engineers can read a complex schematic quickly — they track where bubbles pair up (and cancel) versus where they stand alone (and invert).`,
    },

    // ── Visual 3 — Mixed logic schematic reader ───────────────────────────────
    {
      type: 'js',
      instruction: `### Mixed-logic signal tracing

Three circuits shown with mixed De Morgan symbols. Set the inputs and trace the signal — observe where bubbles cancel (double negation, no inversion) and where a lone bubble inverts the signal.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <button class="tab-btn active" id="ml0" onclick="setML(0)">Circuit 1</button>
    <button class="tab-btn"        id="ml1" onclick="setML(1)">Circuit 2</button>
    <button class="tab-btn"        id="ml2" onclick="setML(2)">Circuit 3</button>
  </div>
  <div style="display:flex;gap:12px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
    <button id="bA" class="inp-btn">A = 0</button>
    <button id="bB" class="inp-btn">B = 0</button>
    <button id="bC" class="inp-btn" style="display:none">C = 0</button>
  </div>
  <canvas id="cv3" width="500" height="200"></canvas>
  <div id="mlNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.75"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:500px}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#f472b6;background:rgba(219,39,119,0.1);color:#f472b6}
.inp-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}`,
      startCode: `
var A=0,B=0,C=0,mlMode=0;
var cv3=document.getElementById('cv3'),ctx3=cv3.getContext('2d');

var CIRCUITS=[
  {inputs:['A','B'],
   desc:'NAND gate (AND+bubble) drives a NAND gate (AND+bubble). Bubble-to-bubble on the wire: they cancel. Result = AND-AND = double AND? No — F = NOT(NOT(AB)) = AB.',
   fn:function(){return A&B;},
   draw:function(W,H){drawNANDtoNAND(W,H,A,B);}},
  {inputs:['A','B'],
   desc:'NAND gate output (bubble) connects to OR gate with input bubble. Bubble-to-bubble cancels on that wire. OR-with-bubble-input = real inversion before the OR? No — bubble pairs cancel, this implements (NOT(NOT(AB))) in the OR\'s context. Trace: NAND out = NOT(AB), OR-bubble on that input = NOT(NOT(AB)) = AB. F = AB + (other inputs).',
   fn:function(){return (A&B)|0;},
   draw:function(W,H){drawMixed1(W,H,A,B);}},
  {inputs:['A','B','C'],
   desc:'Two NAND outputs feed an OR with input bubbles. Each bubble pair cancels. The OR-with-all-input-bubbles = NAND. F = NOT(NOT(AB) AND NOT(BC)) = AB + BC.',
   fn:function(){return (A&B)|(B&C);},
   draw:function(W,H){drawMixed2(W,H,A,B,C);}},
];

function wCol(v){return v?'#4ade80':'#475569';}
function wW(v){return v?2.5:1.5;}

function bub(c,x,y,col,filled){
  c.beginPath();c.arc(x,y,5,0,2*Math.PI);
  c.fillStyle=filled?col+'44':'#0a0f1e';
  c.strokeStyle=col; c.lineWidth=1.5; c.fill(); c.stroke();
}

function gAND(c,x,y,w,h,col,outBub){
  c.fillStyle=col+'22';c.strokeStyle=col;c.lineWidth=1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+w/2-4,y+4);
  c.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  c.lineTo(x+4,y+h-4);c.closePath();c.fill();c.stroke();
  if(outBub){bub(c,x+w+5,y+h/2,col,true);}
}
function gOR(c,x,y,w,h,col,inBubs,outBub){
  c.fillStyle=col+'22';c.strokeStyle=col;c.lineWidth=1.5;
  c.beginPath();
  c.moveTo(x+4,y+4);c.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);
  c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill();c.stroke();
  if(inBubs){bub(c,x-5,y+h*0.3,col,true);bub(c,x-5,y+h*0.7,col,true);}
  if(outBub){bub(c,x+w+5,y+h/2,col,true);}
}
function wire(c,x1,y1,x2,y2,v){
  c.strokeStyle=wCol(v);c.lineWidth=wW(v);
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function lbl(c,x,y,t,col,align){
  c.fillStyle=col||'rgba(255,255,255,0.4)';c.font='11px monospace';
  c.textAlign=align||'center';c.fillText(t,x,y);
}

function drawNANDtoNAND(W,H,a,b){
  ctx3.clearRect(0,0,W,H);ctx3.fillStyle='#0a0f1e';ctx3.fillRect(0,0,W,H);
  var gw=72,gh=52,g1x=60,g1y=H/2-gh/2-10,g2x=240,g2y=H/2-gh/2-10;
  var n1=!(a&b)?1:0, F=a&b;
  gAND(ctx3,g1x,g1y,gw,gh,'#d97706',true);
  gAND(ctx3,g2x,g2y,gw,gh,'#d97706',true);
  wire(ctx3,20,g1y+gh*0.3,g1x,g1y+gh*0.3,a); lbl(ctx3,18,g1y+gh*0.3+4,'A='+a,wCol(a),'right');
  wire(ctx3,20,g1y+gh*0.7,g1x,g1y+gh*0.7,b); lbl(ctx3,18,g1y+gh*0.7+4,'B='+b,wCol(b),'right');
  var midX=g1x+gw+10;
  wire(ctx3,midX,g1y+gh/2,g2x,g2y+gh*0.3,n1);
  wire(ctx3,midX,g1y+gh/2,g2x,g2y+gh*0.7,n1);
  lbl(ctx3,midX+20,g1y+gh/2-8,n1+' (NAND)',wCol(n1),'left');
  // Bubble cancel annotation
  ctx3.fillStyle='rgba(251,191,36,0.6)';ctx3.font='9px monospace';ctx3.textAlign='center';
  ctx3.fillText('bubbles',g2x-22,g2y+gh*0.3-10);ctx3.fillText('cancel',g2x-22,g2y+gh*0.3);
  wire(ctx3,g2x+gw+10,g2y+gh/2,420,g2y+gh/2,F);
  lbl(ctx3,428,g2y+gh/2+4,'F='+F,wCol(F),'left');
  lbl(ctx3,g1x+gw/2,g1y-8,'NAND','#d97706');lbl(ctx3,g2x+gw/2,g2y-8,'NAND','#d97706');
  lbl(ctx3,W/2,H-8,'F = NOT(NOT(AB)) = AB = '+(a&b),'rgba(255,255,255,0.3)');
}

function drawMixed1(W,H,a,b){
  ctx3.clearRect(0,0,W,H);ctx3.fillStyle='#0a0f1e';ctx3.fillRect(0,0,W,H);
  var gw=72,gh=52,g1x=60,g1y=H/2-gh/2,orx=260,ory=H/2-gh/2;
  var nand=!(a&b)?1:0, F=a&b;
  gAND(ctx3,g1x,g1y,gw,gh,'#d97706',true);
  gOR(ctx3,orx,ory,gw,gh,'#7c3aed',true,false);
  wire(ctx3,20,g1y+gh*0.3,g1x,g1y+gh*0.3,a);lbl(ctx3,18,g1y+gh*0.3+4,'A='+a,wCol(a),'right');
  wire(ctx3,20,g1y+gh*0.7,g1x,g1y+gh*0.7,b);lbl(ctx3,18,g1y+gh*0.7+4,'B='+b,wCol(b),'right');
  wire(ctx3,g1x+gw+10,g1y+gh/2,orx-10,ory+gh*0.3,nand);
  lbl(ctx3,g1x+gw+50,g1y+gh/2-8,'NAND='+nand,wCol(nand),'left');
  ctx3.fillStyle='rgba(251,191,36,0.6)';ctx3.font='9px monospace';ctx3.textAlign='center';
  ctx3.fillText('bubble pair',orx-20,ory+gh*0.3-10);ctx3.fillText('cancels',orx-20,ory+gh*0.3);
  wire(ctx3,20,ory+gh*0.7+20,orx-10,ory+gh*0.7,0);
  lbl(ctx3,18,ory+gh*0.7+24,'0',wCol(0),'right');
  wire(ctx3,orx+gw,ory+gh/2,420,ory+gh/2,F);
  lbl(ctx3,428,ory+gh/2+4,'F='+F,wCol(F),'left');
  lbl(ctx3,g1x+gw/2,g1y-8,'NAND','#d97706');lbl(ctx3,orx+gw/2,ory-8,'OR (bubbled input)','#7c3aed');
  lbl(ctx3,W/2,H-8,'Bubble pair on wire cancels → F = AB + 0 = AB','rgba(255,255,255,0.3)');
}

function drawMixed2(W,H,a,b,c){
  ctx3.clearRect(0,0,W,H);ctx3.fillStyle='#0a0f1e';ctx3.fillRect(0,0,W,H);
  var gw=66,gh=48,g1x=50,g1y=20,g2x=50,g2y=120,orx=280,ory=H/2-gh/2;
  var n1=(a&b)?0:1, n2=(b&c)?0:1, F=(a&b)|(b&c);
  gAND(ctx3,g1x,g1y,gw,gh,'#d97706',true);
  gAND(ctx3,g2x,g2y,gw,gh,'#d97706',true);
  gOR(ctx3,orx,ory,gw,gh,'#7c3aed',true,false);
  wire(ctx3,14,g1y+gh*0.3,g1x,g1y+gh*0.3,a);lbl(ctx3,12,g1y+gh*0.3+4,'A',wCol(a),'right');
  wire(ctx3,14,g1y+gh*0.7,g1x,g1y+gh*0.7,b);lbl(ctx3,12,g1y+gh*0.7+4,'B',wCol(b),'right');
  wire(ctx3,14,g2y+gh*0.3,g2x,g2y+gh*0.3,b);lbl(ctx3,12,g2y+gh*0.3+4,'B',wCol(b),'right');
  wire(ctx3,14,g2y+gh*0.7,g2x,g2y+gh*0.7,c);lbl(ctx3,12,g2y+gh*0.7+4,'C',wCol(c),'right');
  wire(ctx3,g1x+gw+10,g1y+gh/2,orx-10,ory+gh*0.3,n1);
  wire(ctx3,g2x+gw+10,g2y+gh/2,orx-10,ory+gh*0.7,n2);
  wire(ctx3,orx+gw,ory+gh/2,450,ory+gh/2,F);
  lbl(ctx3,458,ory+gh/2+4,'F='+F,wCol(F),'left');
  lbl(ctx3,g1x+gw/2,g1y-8,'NAND','#d97706');
  lbl(ctx3,g2x+gw/2,g2y-8,'NAND','#d97706');
  lbl(ctx3,orx+gw/2,ory-8,'OR (bubbled)','#7c3aed');
  ctx3.fillStyle='rgba(251,191,36,0.5)';ctx3.font='8px monospace';ctx3.textAlign='center';
  ctx3.fillText('cancel',orx-20,ory+gh*0.3-8);ctx3.fillText('cancel',orx-20,ory+gh*0.7-8);
  lbl(ctx3,W/2,H-8,'F = AB + BC = '+(( a&b)|(b&c)),'rgba(255,255,255,0.3)');
}

function setML(m){
  mlMode=m;
  ['ml0','ml1','ml2'].forEach(function(id,i){
    document.getElementById(id).className='tab-btn'+(mlMode===i?' active':'');
  });
  document.getElementById('bC').style.display=m===2?'':'none';
  document.getElementById('mlNote').textContent=CIRCUITS[m].desc;
  refresh3();
}
function refresh3(){
  ['A','B','C'].forEach(function(k){
    var v=k==='A'?A:k==='B'?B:C;
    var btn=document.getElementById('b'+k);
    btn.textContent=k+' = '+v;btn.className='inp-btn'+(v?' hi':'');
  });
  CIRCUITS[mlMode].draw(cv3.width,cv3.height);
}
document.getElementById('bA').onclick=function(){A^=1;refresh3();};
document.getElementById('bB').onclick=function(){B^=1;refresh3();};
document.getElementById('bC').onclick=function(){C^=1;refresh3();};
window.setML=setML;
setML(0);`,
      outputHeight: 380,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A schematic shows a NAND gate output (bubble) connected to an AND gate input (no bubble). The NAND computes NOT(AB). What does the AND gate receive, and does the bubble cancel?`,
      options: [
        { label: 'A', text: 'The AND gate receives AB — the bubble on the NAND and the non-bubbled AND input cancel' },
        { label: 'B', text: 'The AND gate receives NOT(AB) — there is only one bubble, so no cancellation occurs' },
        { label: 'C', text: 'The AND gate receives 1 — NAND output is always inverted to 1' },
        { label: 'D', text: 'The AND gate receives AB — De Morgan automatically compensates' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Bubble cancellation requires a bubble on BOTH ends of the wire — one on the driving output and one on the receiving input. Here, the NAND has an output bubble but the AND input has none. No cancellation — the AND gate receives the inverted signal NOT(AB). This is a real inversion in the logic.',
      failMessage: 'Bubbles cancel only when BOTH ends of the wire have a bubble. Here, the NAND output has a bubble but the AND input does not. Only one bubble → no cancellation → the AND gate really does receive NOT(AB), the inverted signal.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight: 300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Choosing Between SOP/NAND and POS/NOR

Given a truth table, you can implement it as SOP (NAND-NAND) or POS (NOR-NOR). How do you decide?

**Rule of thumb**: implement the form with fewer terms.
- Count the 1-cells: if more than half the rows are 1, POS (fewer 0-cells to write maxterms) is likely simpler.
- Count the 0-cells: if more than half the rows are 0, SOP (fewer minterms) is likely simpler.
- Equal: run K-maps for both F and F̄, compare gate counts, choose the minimum.

**The complement shortcut for POS**:
1. Build the K-map for $\\bar{F}$ — group the 0-cells of F.
2. Read the minimal SOP of $\\bar{F}$.
3. Apply De Morgan to get the minimal POS of F: complement the SOP expression, then push bars inward.

**Example**: $\\bar{F} = AB + CD$ → apply De Morgan → $F = \\overline{AB + CD} = \\overline{AB} \\cdot \\overline{CD} = (\\bar{A}+\\bar{B})(\\bar{C}+\\bar{D})$ — the minimal POS.

**Practical note**: modern synthesis tools automatically evaluate both forms (and many others) and choose the minimum. Understanding the manual procedure gives you intuition about what the tool is doing and lets you predict which direction it will choose.`,
    },

    // ── Visual 4 — SOP vs POS comparison ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### SOP vs POS: which is simpler?

Toggle the truth table output cells. The tool counts minterms (for SOP) and maxterms (for POS) and shows both K-maps with their minimal expressions and gate counts. The recommended implementation highlights green.`,
      html: `<div style="padding:14px">
  <div style="margin-bottom:10px;font-size:11px;color:rgba(255,255,255,0.35)">Click F column to toggle. Compare SOP and POS gate counts.</div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:4px">Truth table</div>
      <canvas id="ttbl" width="180" height="200"></canvas>
    </div>
    <div style="flex:1;min-width:260px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div id="sopBox" class="impl-box">
          <div class="impl-title">SOP (NAND-NAND)</div>
          <div id="sopTerm" class="impl-expr"></div>
          <div id="sopCount" class="impl-count"></div>
        </div>
        <div id="posBox" class="impl-box">
          <div class="impl-title">POS (NOR-NOR)</div>
          <div id="posTerm" class="impl-expr"></div>
          <div id="posCount" class="impl-count"></div>
        </div>
      </div>
      <div id="recommendation" style="padding:8px 12px;border-radius:8px;font-size:12px;min-height:24px;line-height:1.6"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;cursor:pointer}
.impl-box{padding:10px 12px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03)}
.impl-box.better{border-color:#4ade80;background:rgba(74,222,128,0.06)}
.impl-title{font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.impl-expr{font-size:12px;font-weight:600;color:#818cf8;min-height:20px;line-height:1.6;word-break:break-all}
.impl-count{font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px}`,
      startCode: `
// 3-var function
var fvals=[0,1,1,0,0,1,1,1]; // default

var ttbl=document.getElementById('ttbl'),tctx=ttbl.getContext('2d');
var VARS=['A','B','C'];

function inputRow(i){ var r=[]; for(var b=2;b>=0;b--) r.push((i>>b)&1); return r; }

function mintermsOf(f){ return f.map(function(v,i){return v?i:-1;}).filter(function(i){return i>=0;}); }
function maxtermsOf(f){ return f.map(function(v,i){return v?-1:i;}).filter(function(i){return i>=0;}); }

// Very simple SOP builder (canonical)
function buildSOP(ones){
  if(!ones.length) return {expr:'0',literals:0,terms:0};
  if(ones.length===8) return {expr:'1',literals:0,terms:0};
  var terms=ones.map(function(m){
    var r=inputRow(m);
    return r.map(function(v,i){return v?VARS[i]:VARS[i]+'\u0305';}).join('');
  });
  return {expr:terms.join(' + '),literals:terms.reduce(function(a,t){return a+t.replace(/\u0305/g,'').length;},0),terms:terms.length};
}
function buildPOS(zeros){
  if(!zeros.length) return {expr:'1',literals:0,terms:0};
  if(zeros.length===8) return {expr:'0',literals:0,terms:0};
  var terms=zeros.map(function(m){
    var r=inputRow(m);
    return '('+r.map(function(v,i){return v?VARS[i]+'\u0305':VARS[i];}).join('+')+')';
  });
  return {expr:terms.join('\u00b7'),literals:terms.reduce(function(a,t){return a+t.replace(/[\u0305()]/g,'').length;},0),terms:terms.length};
}

function drawTT(){
  var W=ttbl.width,H=ttbl.height;
  tctx.clearRect(0,0,W,H); tctx.fillStyle='#0a0f1e'; tctx.fillRect(0,0,W,H);
  var colW=34,rh=22,hY=18;
  ['A','B','C','','F'].forEach(function(h,i){
    var col=i===4?'#818cf8':i===3?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.35)';
    tctx.fillStyle=col; tctx.font='bold 10px monospace'; tctx.textAlign='center';
    tctx.fillText(h,i*colW+colW/2,hY);
  });
  tctx.strokeStyle='rgba(255,255,255,0.08)'; tctx.lineWidth=0.5;
  tctx.beginPath();tctx.moveTo(0,hY+5);tctx.lineTo(W,hY+5);tctx.stroke();
  for(var i=0;i<8;i++){
    var y=hY+14+i*rh;
    var row=inputRow(i);
    row.forEach(function(v,ci){
      tctx.fillStyle=v?'#4ade80':'rgba(255,255,255,0.3)';
      tctx.font='11px monospace'; tctx.textAlign='center';
      tctx.fillText(v,ci*colW+colW/2,y);
    });
    tctx.fillStyle='rgba(255,255,255,0.1)'; tctx.font='9px monospace'; tctx.textAlign='center';
    tctx.fillText('m'+i,3*colW+colW/2,y);
    // F cell
    var fv=fvals[i];
    tctx.fillStyle=fv?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.03)';
    tctx.strokeStyle=fv?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)'; tctx.lineWidth=fv?1.5:0.5;
    tctx.beginPath();tctx.roundRect(4*colW+2,y-rh*0.6,colW-4,rh*0.85,3);tctx.fill();tctx.stroke();
    tctx.fillStyle=fv?'#818cf8':'rgba(255,255,255,0.2)';
    tctx.font='bold 12px monospace'; tctx.textAlign='center';
    tctx.fillText(fv,4*colW+colW/2,y);
  }
}

function update(){
  var ones=mintermsOf(fvals), zeros=maxtermsOf(fvals);
  var sop=buildSOP(ones), pos=buildPOS(zeros);
  document.getElementById('sopTerm').textContent=sop.expr;
  document.getElementById('sopCount').textContent=sop.terms+' AND + '+(sop.terms>1?'1 OR':'0')+'  = '+Math.max(0,sop.terms+(sop.terms>1?1:0))+' gates, '+sop.literals+' literals';
  document.getElementById('posTerm').textContent=pos.expr;
  document.getElementById('posCount').textContent=pos.terms+' OR + '+(pos.terms>1?'1 AND':'0')+'  = '+Math.max(0,pos.terms+(pos.terms>1?1:0))+' gates, '+pos.literals+' literals';

  var sopG=sop.terms+(sop.terms>1?1:0), posG=pos.terms+(pos.terms>1?1:0);
  var rec='',recCol='';
  if(sopG<posG){rec='SOP/NAND-NAND uses fewer gates ('+sopG+' vs '+posG+').';recCol='#4ade80';}
  else if(posG<sopG){rec='POS/NOR-NOR uses fewer gates ('+posG+' vs '+sopG+').';recCol='#4ade80';}
  else{rec='Both forms use the same number of gates ('+sopG+').';recCol='#fbbf24';}
  document.getElementById('recommendation').innerHTML='<span style="color:'+recCol+'">'+rec+'</span>';
  document.getElementById('sopBox').className='impl-box'+(sopG<=posG?' better':'');
  document.getElementById('posBox').className='impl-box'+(posG<=sopG?' better':'');
  drawTT();
}

ttbl.onclick=function(e){
  var rect=ttbl.getBoundingClientRect();
  var my=(e.clientY-rect.top)*(ttbl.height/rect.height);
  var hY=18,rh=22;
  var ri=Math.floor((my-hY-4)/rh);
  if(ri>=0&&ri<8){fvals[ri]^=1;update();}
};
update();`,
      outputHeight: 400,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 3-variable function has seven 1-cells and one 0-cell (m5 = 0). Which implementation form is simpler, and why?`,
      options: [
        { label: 'A', text: 'SOP — one minterm per 1-cell gives a clear expression' },
        { label: 'B', text: 'POS — only one maxterm (one 0-cell) gives F = (Ā+B+C̄), a single OR gate' },
        { label: 'C', text: 'Both are equivalent in gate count for this function' },
        { label: 'D', text: 'Neither — with 7 ones the function cannot be minimised' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Seven 1-cells in SOP = seven minterms + one OR gate = 8 gates minimum before simplification. But one 0-cell in POS = one maxterm = one OR gate — no AND gate needed at all. m5 has A=1,B=0,C=1 → maxterm is (Ā+B+C̄). F = (Ā+B+C̄). One gate. When the function is almost always 1, POS is dramatically simpler.',
      failMessage: 'Count each form: SOP would need 7 minterms (one per 1-cell), requiring many AND gates. POS needs only 1 maxterm (one per 0-cell): the single 0-cell at m5 (A=1,B=0,C=1) gives maxterm (Ā+B+C̄). F = (Ā+B+C̄) — just one OR gate. Always choose the form with fewer terms.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Circuit Conversion

**Bubble pushing** is the graphical application of De Morgan's theorem:
- A bubble can move from a gate output to all inputs if you flip AND↔OR.
- Two bubbles on the same wire cancel (double negation).

**AND-OR → NAND-NAND**: add output bubble to each AND gate, add input bubble to the OR gate on each wire. Bubbles pair and cancel → same function, all NAND gates.

**OR-AND → NOR-NOR**: the exact dual — add output bubbles to OR gates, input bubbles to the AND gate, bubbles cancel, all NOR gates.

**Mixed-logic reading**:
- Bubble-to-bubble on a wire: cancel, no inversion.
- Bubble-to-plain or plain-to-plain: real inversion.

**Choosing SOP vs POS**: count minterms (1-cells) vs maxterms (0-cells). Fewer terms = fewer gates. For functions close to all-1 or all-0, one form is dramatically simpler.

**The POS shortcut**: K-map the complement (group 0-cells), get SOP of F̄, apply De Morgan to get POS of F.

With this lesson, Unit 4 is complete. You can now take any truth table → K-map → minimal SOP or POS → NAND-NAND or NOR-NOR gate circuit. Unit 5 applies these tools to standard combinational building blocks: adders, comparators, multiplexers, and decoders.`,
    },
  ],
};

export default {
  id: 'df-4-3-circuit-conversion',
  slug: 'circuit-conversion-bubble-pushing',
  chapter: 'df.4',
  order: 3,
  title: 'Circuit Conversion: Bubble Pushing and NAND/NOR Implementations',
  subtitle: 'Convert any AND-OR or OR-AND circuit to all-NAND or all-NOR using bubble pushing.',
  tags: ['digital', 'bubble-pushing', 'NAND', 'NOR', 'de-morgan', 'SOP', 'POS', 'mixed-logic', 'circuit-conversion'],
  hook: {
    question: 'Your K-map gave you F = AB + CD. How do you turn that into actual gates on a chip — and why does every real chip use NAND gates instead of AND gates?',
    realWorldContext: 'Every logic synthesis tool converts SOP expressions to NAND-NAND internally. PCB schematics use mixed-logic notation daily. Understanding bubble pushing is the difference between reading a schematic and being lost in it.',
  },
  intuition: {
    prose: [
      'Bubble pushing: move a bubble from output to all inputs, flip AND↔OR — function unchanged.',
      'Paired bubbles on same wire cancel (double negation). Unpaired bubbles are real inversions.',
      'AND-OR → NAND-NAND: add bubble pair at each AND→OR wire. OR-AND → NOR-NOR: same dual.',
      'Fewer terms wins: 7 ones → SOP messy, POS = 1 maxterm = 1 gate.',
    ],
    callouts: [
      { type: 'tip', title: 'Bubble cancellation rule', body: 'Bubbles cancel only when BOTH ends of the wire have a bubble. One bubble = real inversion. Two bubbles = no inversion.' },
      { type: 'important', title: 'POS shortcut', body: 'K-map the 0-cells (complement). Read SOP of F̄. Apply De Morgan to get POS of F. No separate maxterm K-map needed.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Circuit Conversion', props: { lesson: LESSON_DF_4_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'NAND-NAND = AND-OR: proved by adding and cancelling bubble pairs at each inter-gate wire.',
    'NOR-NOR = OR-AND: exact dual of NAND-NAND conversion.',
    'Mixed logic: bubble-to-bubble cancels, bubble-to-plain is a real inversion.',
    'SOP for mostly-0 functions; POS for mostly-1 functions. Count minterms vs maxterms.',
    'POS of F = De Morgan applied to SOP of F̄.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};