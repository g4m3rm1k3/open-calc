// Digital Fundamentals · Unit 3 · Lesson 3
// XOR and XNOR: Difference, Equality, and Arithmetic
// ScienceNotebook format — prose cells, JS visuals, challenges

export const LESSON_DF_3_3 = {
  title: 'XOR and XNOR: Difference, Equality, and Arithmetic',
  subtitle: 'The two gates that make adders, comparators, parity checkers, and encryption possible.',
  sequential: true,
  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Gate That Asks "Are They Different?"

AND asks: are all inputs HIGH? OR asks: is any input HIGH? These are useful questions. But a third question comes up constantly in digital design: **are the two inputs different from each other?**

The **XOR gate** (Exclusive OR) answers exactly this. It outputs 1 when its inputs differ and 0 when they are the same. For two inputs:

| A | B | A XOR B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

The last row is what separates XOR from OR. Regular OR outputs 1 for all three combinations that have at least one 1 — including A=1, B=1. XOR outputs 0 for A=1, B=1 because the inputs are the same, not different.

The Boolean expression is $F = A \\oplus B$, read "A XOR B". The $\\oplus$ symbol is the standard notation.

**XNOR** (Exclusive NOR) is the complement: it outputs 1 when inputs are the **same** and 0 when they differ. $F = \\overline{A \\oplus B}$, also written $A \\odot B$. XNOR is an equality detector.

These two gates are not merely convenient shortcuts. They are structurally different from AND/OR/NAND/NOR in a fundamental way: **XOR cannot be implemented with a single-level gate** in standard CMOS. Every XOR implementation requires at least three gate delays (or uses a dedicated cell). This cost is worth paying because XOR is the exact operation that addition, parity, and comparison require.`,
    },

    // ── Visual 1 — XOR and XNOR truth tables ─────────────────────────────────
    {
      type: 'js',
      instruction: `### XOR and XNOR side by side

Toggle A and B to walk through all four input combinations. Watch the difference: XOR fires on "disagreement", XNOR fires on "agreement". The truth table highlights the active row.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
    <div style="margin-left:auto;display:flex;gap:10px">
      <div class="out-badge" id="bdgXOR"  style="border-color:#6366f1">XOR  = <span id="vXOR">0</span></div>
      <div class="out-badge" id="bdgXNOR" style="border-color:#db2777">XNOR = <span id="vXNOR">1</span></div>
    </div>
  </div>
  <canvas id="cv" width="560" height="300"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.inp-btn{padding:8px 22px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.out-badge{padding:6px 14px;border-radius:8px;border:1.5px solid;background:rgba(255,255,255,0.04);font-size:13px;font-weight:600;color:rgba(255,255,255,0.8)}`,
      startCode: `
var A=0,B=0;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function xor(a,b){return a^b;}
function xnor(a,b){return a^b^1;}

function drawXOR(ctx,x,y,w,h,col,active){
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  // Extra curve
  ctx.beginPath();
  ctx.moveTo(x+8,y+4);
  ctx.quadraticCurveTo(x+w/2-6,y+h/2,x+8,y+h-4);
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.stroke();
  // Main OR body
  ctx.beginPath();
  ctx.moveTo(x+12,y+4);
  ctx.quadraticCurveTo(x+w/2-6,y+h/2,x+12,y+h-4);
  ctx.quadraticCurveTo(x+w/2+4,y+h,x+w-14,y+h/2);
  ctx.quadraticCurveTo(x+w/2+4,y,x+12,y+4);
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.fill(); ctx.stroke();
}

function drawXNOR(ctx,x,y,w,h,col,active){
  drawXOR(ctx,x,y,w,h,col,active);
  // bubble
  ctx.beginPath(); ctx.arc(x+w+5,y+h/2,5,0,2*Math.PI);
  ctx.fillStyle=active?col+'44':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=1.5;
  ctx.fill(); ctx.stroke();
}

function wire(x1,y1,x2,y2,v,col){
  ctx.strokeStyle=col||(v?'#4ade80':'#475569');
  ctx.lineWidth=v?2.5:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var xo=xor(A,B), xno=xnor(A,B);
  var cA=A?'#4ade80':'#475569', cB=B?'#4ade80':'#475569';
  var gw=88, gh=72;

  // XOR gate (left)
  var g1x=60, g1y=40;
  wire(18,g1y+gh*0.3,g1x+12,g1y+gh*0.3,A); ctx.fillStyle=cA;ctx.font='500 12px monospace';ctx.textAlign='right';ctx.fillText('A='+A,16,g1y+gh*0.3+4);
  wire(18,g1y+gh*0.7,g1x+12,g1y+gh*0.7,B); ctx.fillStyle=cB;ctx.fillText('B='+B,16,g1y+gh*0.7+4);
  drawXOR(ctx,g1x,g1y,gw,gh,'#6366f1',xo);
  wire(g1x+gw-4,g1y+gh/2,g1x+gw+36,g1y+gh/2,xo);
  ctx.fillStyle=xo?'#6366f1':'#475569';ctx.font='500 12px monospace';ctx.textAlign='left';
  ctx.fillText('= '+xo,g1x+gw+40,g1y+gh/2+4);
  ctx.fillStyle='#6366f1';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('XOR',g1x+gw/2,g1y+gh+18);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';
  ctx.fillText('F = A \u2295 B',g1x+gw/2,g1y+gh+32);
  ctx.fillText(xo?'inputs DIFFER':'inputs SAME',g1x+gw/2,g1y+gh+46);

  // XNOR gate (right)
  var g2x=330, g2y=40;
  wire(288,g2y+gh*0.3,g2x+12,g2y+gh*0.3,A); ctx.fillStyle=cA;ctx.textAlign='right';ctx.fillText('A='+A,286,g2y+gh*0.3+4);
  wire(288,g2y+gh*0.7,g2x+12,g2y+gh*0.7,B); ctx.fillStyle=cB;ctx.fillText('B='+B,286,g2y+gh*0.7+4);
  drawXNOR(ctx,g2x,g2y,gw,gh,'#db2777',xno);
  wire(g2x+gw+10,g2y+gh/2,g2x+gw+46,g2y+gh/2,xno);
  ctx.fillStyle=xno?'#db2777':'#475569';ctx.font='500 12px monospace';ctx.textAlign='left';
  ctx.fillText('= '+xno,g2x+gw+50,g2y+gh/2+4);
  ctx.fillStyle='#db2777';ctx.font='bold 13px monospace';ctx.textAlign='center';
  ctx.fillText('XNOR',g2x+gw/2,g2y+gh+18);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';
  ctx.fillText('F = \u0305A\u2295\u0305B\u0305',g2x+gw/2,g2y+gh+32);
  ctx.fillText(xno?'inputs SAME':'inputs DIFFER',g2x+gw/2,g2y+gh+46);

  // Truth table
  var tbX=60, tbY=175;
  var hdrs=['A','B','XOR (A\u2295B)','XNOR'];
  var cw=[60,60,120,100];
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='bold 10px monospace';
  var cx=tbX;
  hdrs.forEach(function(h,i){ctx.textAlign='center';ctx.fillText(h,cx+cw[i]/2,tbY+12);cx+=cw[i];});
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(tbX,tbY+16);ctx.lineTo(tbX+cw.reduce(function(a,b){return a+b;}),tbY+16);ctx.stroke();

  [[0,0,0,1],[0,1,1,0],[1,0,1,0],[1,1,0,1]].forEach(function(row,ri){
    var y=tbY+28+ri*24;
    var isActive=row[0]===A&&row[1]===B;
    if(isActive){ctx.fillStyle='rgba(255,255,255,0.06)';ctx.fillRect(tbX,y-14,cw.reduce(function(a,b){return a+b;}),22);}
    var rcx=tbX;
    row.forEach(function(v,ci){
      var col='rgba(255,255,255,0.45)';
      if(ci===2) col=v?'#818cf8':'rgba(255,255,255,0.3)';
      if(ci===3) col=v?'#f472b6':'rgba(255,255,255,0.3)';
      if(isActive) col=ci===2?(v?'#818cf8':'#475569'):ci===3?(v?'#f472b6':'#475569'):'rgba(255,255,255,0.8)';
      ctx.fillStyle=col; ctx.font=(isActive?'bold ':'')+'12px monospace'; ctx.textAlign='center';
      ctx.fillText(v,rcx+cw[ci]/2,y);
      rcx+=cw[ci];
    });
  });

  // Difference annotation
  var note=xo?'Inputs are DIFFERENT \u2192 XOR=1, XNOR=0':'Inputs are SAME \u2192 XOR=0, XNOR=1';
  ctx.fillStyle=xo?'#818cf8':'#f472b6'; ctx.font='500 11px monospace'; ctx.textAlign='center';
  ctx.fillText(note,W/2,tbY+120);
}

function refresh(){
  document.getElementById('btnA').textContent='A = '+A;
  document.getElementById('btnA').className='inp-btn'+(A?' hi':'');
  document.getElementById('btnB').textContent='B = '+B;
  document.getElementById('btnB').className='inp-btn'+(B?' hi':'');
  document.getElementById('vXOR').textContent=xor(A,B);
  document.getElementById('vXNOR').textContent=xnor(A,B);
  draw();
}
document.getElementById('btnA').onclick=function(){A^=1;refresh();};
document.getElementById('btnB').onclick=function(){B^=1;refresh();};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 2-input XNOR gate has inputs A=0 and B=1. What is the output?`,
      options: [
        { label: 'A', text: '1 — XNOR always outputs 1 when any input is 1' },
        { label: 'B', text: '0 — the inputs are different, so XNOR (equality detector) outputs 0' },
        { label: 'C', text: '1 — XNOR outputs 1 when inputs are equal, 0 when different; A≠B so output is 1' },
        { label: 'D', text: '0 — XNOR is just OR with an inverted output' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. XNOR outputs 1 when inputs are equal, 0 when different. A=0 and B=1 are different, so XNOR=0. Equivalently: XOR(0,1)=1, then XNOR=NOT(XOR)=NOT(1)=0.',
      failMessage: 'XNOR is the equality detector: output 1 when A=B, output 0 when A≠B. Since A=0 and B=1 are different, XNOR=0. Option C has the correct rule but the wrong conclusion — A≠B gives output 0, not 1.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### XOR Is Binary Addition (Without the Carry)

Here is the key insight that makes XOR indispensable in arithmetic circuits:

$$0 + 0 = 0 \\ (\\text{sum}=0, \\text{carry}=0)$$
$$0 + 1 = 1 \\ (\\text{sum}=1, \\text{carry}=0)$$
$$1 + 0 = 1 \\ (\\text{sum}=1, \\text{carry}=0)$$
$$1 + 1 = 10_2 \\ (\\text{sum}=0, \\text{carry}=1)$$

Compare the **sum bit** column (0, 1, 1, 0) to the XOR truth table (0, 1, 1, 0). They are identical. XOR computes the sum bit of single-bit binary addition.

The **carry bit** column (0, 0, 0, 1) matches the AND truth table. AND computes the carry.

This means a **half adder** — the circuit that adds two bits and produces a sum and carry — is just:
$$\\text{Sum} = A \\oplus B$$
$$\\text{Carry} = A \\cdot B$$

One XOR gate and one AND gate. That is the complete circuit for adding two single bits.

A **full adder** extends this to handle a carry-in bit (needed when chaining adders for multi-bit numbers). It adds three bits: A, B, and Carry-in, producing Sum and Carry-out:
$$\\text{Sum} = A \\oplus B \\oplus C_{in}$$
$$\\text{Carry}_{out} = (A \\cdot B) + (C_{in} \\cdot (A \\oplus B))$$

Two XOR gates, two AND gates, one OR gate. Chain 8 full adders together and you have an 8-bit adder. This is how every CPU adds numbers.`,
    },

    // ── Visual 2 — Half adder and full adder ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Half adder and full adder

Switch between half adder (2 inputs) and full adder (3 inputs, includes carry-in). Toggle all inputs and watch the sum and carry outputs update. The carry-out lights up when the total exceeds 1.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="tab-btn active" id="tab-half" onclick="setMode('half')">Half Adder (A+B)</button>
    <button class="tab-btn" id="tab-full" onclick="setMode('full')">Full Adder (A+B+Cin)</button>
  </div>
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
    <button id="btnC" class="inp-btn" style="display:none">C_in = 0</button>
    <div style="margin-left:auto;display:flex;gap:8px">
      <div class="out-badge" style="border-color:#4ade80">Sum = <span id="vSum">0</span></div>
      <div class="out-badge" style="border-color:#ef4444">Carry = <span id="vCar">0</span></div>
    </div>
  </div>
  <canvas id="cv" width="560" height="220"></canvas>
  <div id="desc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.tab-btn{padding:6px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#6366f1;background:rgba(99,102,241,0.12);color:#818cf8}
.inp-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.out-badge{padding:6px 14px;border-radius:8px;border:1.5px solid;background:rgba(255,255,255,0.04);font-size:13px;font-weight:600;color:rgba(255,255,255,0.8)}`,
      startCode: `
var A=0,B=0,Cin=0,mode='half';
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function setMode(m){
  mode=m;
  document.getElementById('tab-half').className='tab-btn'+(m==='half'?' active':'');
  document.getElementById('tab-full').className='tab-btn'+(m==='full'?' active':'');
  document.getElementById('btnC').style.display=m==='full'?'':'none';
  refresh();
}

function drawXORgate(cx,cy,w,h,col,active){
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();ctx.moveTo(cx+8,cy+4);ctx.quadraticCurveTo(cx+w/2-6,cy+h/2,cx+8,cy+h-4);ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx+12,cy+4);
  ctx.quadraticCurveTo(cx+w/2-6,cy+h/2,cx+12,cy+h-4);
  ctx.quadraticCurveTo(cx+w/2+4,cy+h,cx+w-14,cy+h/2);
  ctx.quadraticCurveTo(cx+w/2+4,cy,cx+12,cy+4);
  ctx.fill(); ctx.stroke();
}
function drawANDgate(cx,cy,w,h,col,active){
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(cx+4,cy+4);ctx.lineTo(cx+w/2-4,cy+4);
  ctx.arc(cx+w/2-4,cy+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  ctx.lineTo(cx+4,cy+h-4);ctx.closePath();
  ctx.fill(); ctx.stroke();
}
function drawORgate(cx,cy,w,h,col,active){
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(cx+4,cy+4);
  ctx.quadraticCurveTo(cx+w/2-10,cy+h/2,cx+4,cy+h-4);
  ctx.quadraticCurveTo(cx+w/2,cy+h,cx+w-14,cy+h/2);
  ctx.quadraticCurveTo(cx+w/2,cy,cx+4,cy+4);
  ctx.fill(); ctx.stroke();
}
function w(x1,y1,x2,y2,v,col){
  ctx.strokeStyle=col||(v?'#4ade80':'#334155'); ctx.lineWidth=v?2:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function dot(x,y,v){
  ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);
  ctx.fillStyle=v?'#4ade80':'#475569'; ctx.fill();
}
function lbl(x,y,t,col,align){
  ctx.fillStyle=col||'rgba(255,255,255,0.5)'; ctx.font='11px monospace';
  ctx.textAlign=align||'center'; ctx.fillText(t,x,y);
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  var gw=72,gh=54;

  if(mode==='half'){
    var sum=A^B, carry=A&B;
    var cA=A?'#4ade80':'#475569', cB=B?'#4ade80':'#475569';
    var cSum=sum?'#818cf8':'#475569', cCar=carry?'#ef4444':'#475569';

    // XOR for sum
    var xorX=200,xorY=30;
    w(30,xorY+gh*0.3,xorX+12,xorY+gh*0.3,A,cA);
    w(30,xorY+gh*0.7,xorX+12,xorY+gh*0.7,B,cB);
    lbl(28,xorY+gh*0.3+4,'A='+A,cA,'right');
    lbl(28,xorY+gh*0.7+4,'B='+B,cB,'right');
    drawXORgate(xorX,xorY,gw,gh,'#6366f1',sum);
    w(xorX+gw-4,xorY+gh/2,420,xorY+gh/2,sum,cSum);
    lbl(430,xorY+gh/2+4,'Sum='+sum,cSum,'left');
    lbl(xorX+gw/2,xorY-10,'XOR','#6366f1');

    // AND for carry
    var andX=200,andY=130;
    dot(30,xorY+gh*0.3,A); dot(30,xorY+gh*0.7,B);
    w(30,xorY+gh*0.3,30,andY+gh*0.3,A,cA);
    w(30,xorY+gh*0.7,30,andY+gh*0.7,B,cB);
    w(30,andY+gh*0.3,andX,andY+gh*0.3,A,cA);
    w(30,andY+gh*0.7,andX,andY+gh*0.7,B,cB);
    drawANDgate(andX,andY,gw,gh,'#0891b2',carry);
    w(andX+gw-4,andY+gh/2,420,andY+gh/2,carry,cCar);
    lbl(430,andY+gh/2+4,'Carry='+carry,cCar,'left');
    lbl(andX+gw/2,andY-10,'AND','#0891b2');

    var total=A+B;
    lbl(W/2,H-10,A+' + '+B+' = '+total+' (binary: '+total.toString(2)+')', 'rgba(255,255,255,0.4)');

  } else {
    // Full adder
    var ab=A^B, sum2=ab^Cin;
    var c1=A&B, c2=ab&Cin, cout=c1|c2;
    var cA=A?'#4ade80':'#475569', cB=B?'#4ade80':'#475569', cCin=Cin?'#4ade80':'#475569';
    var cAB=ab?'#818cf8':'#475569', cSum2=sum2?'#4ade80':'#475569', cCout=cout?'#ef4444':'#475569';

    // Stage 1 XOR: A xor B
    var x1=120,y1=20,gw2=66,gh2=50;
    w(20,y1+gh2*0.3,x1+10,y1+gh2*0.3,A,cA); lbl(18,y1+gh2*0.3+4,'A='+A,cA,'right');
    w(20,y1+gh2*0.7,x1+10,y1+gh2*0.7,B,cB); lbl(18,y1+gh2*0.7+4,'B='+B,cB,'right');
    drawXORgate(x1,y1,gw2,gh2,'#6366f1',ab);
    lbl(x1+gw2/2,y1-8,'XOR1','#6366f1');

    // Stage 2 XOR: (A xor B) xor Cin = sum
    var x2=300,y2=20;
    w(x1+gw2-4,y1+gh2/2,x2+10,y2+gh2*0.3,ab,cAB);
    w(20,y2+gh2*0.7+30,x2+10,y2+gh2*0.7,Cin,cCin); lbl(18,y2+gh2*0.7+34,'Cin='+Cin,cCin,'right');
    drawXORgate(x2,y2,gw2,gh2,'#6366f1',sum2);
    w(x2+gw2-4,y2+gh2/2,490,y2+gh2/2,sum2,cSum2);
    lbl(496,y2+gh2/2+4,'Sum='+sum2,cSum2,'left');
    lbl(x2+gw2/2,y2-8,'XOR2','#6366f1');

    // AND1: A AND B
    var xa1=120,ya1=130;
    dot(20,y1+gh2*0.3,A); dot(20,y1+gh2*0.7,B);
    w(20,y1+gh2*0.3,20,ya1+gh2*0.3,A,cA);
    w(20,y1+gh2*0.7,20,ya1+gh2*0.7,B,cB);
    w(20,ya1+gh2*0.3,xa1,ya1+gh2*0.3,A,cA);
    w(20,ya1+gh2*0.7,xa1,ya1+gh2*0.7,B,cB);
    drawANDgate(xa1,ya1,gw2,gh2,'#0891b2',c1);
    lbl(xa1+gw2/2,ya1-8,'AND1','#0891b2');

    // AND2: Cin AND (A XOR B)
    var xa2=120,ya2=H-gh2-20;
    var midAB=x1+gw2+10;
    dot(midAB,y1+gh2/2,ab);
    w(midAB,y1+gh2/2,midAB,ya2+gh2*0.3,ab,cAB);
    w(midAB,ya2+gh2*0.3,xa2,ya2+gh2*0.3,ab,cAB);
    var cinY=y2+gh2*0.7+30;
    dot(20,cinY,Cin);
    w(20,cinY,20,ya2+gh2*0.7,Cin,cCin);
    w(20,ya2+gh2*0.7,xa2,ya2+gh2*0.7,Cin,cCin);
    drawANDgate(xa2,ya2,gw2,gh2,'#0891b2',c2);
    lbl(xa2+gw2/2,ya2-8,'AND2','#0891b2');

    // OR: c1 OR c2 = cout
    var xOR=300,yOR=ya1+20;
    w(xa1+gw2-4,ya1+gh2/2,xOR+10,yOR+gh2*0.3,c1,c1?'#0891b2':'#334155');
    w(xa2+gw2-4,ya2+gh2/2,xOR+10,yOR+gh2*0.7,c2,c2?'#0891b2':'#334155');
    drawORgate(xOR,yOR,gw2,gh2,'#ef4444',cout);
    w(xOR+gw2-4,yOR+gh2/2,490,yOR+gh2/2,cout,cCout);
    lbl(496,yOR+gh2/2+4,'Cout='+cout,cCout,'left');
    lbl(xOR+gw2/2,yOR-8,'OR','#ef4444');

    var total2=A+B+Cin;
    lbl(W/2,H-4,A+' + '+B+' + '+Cin+' = '+total2+' (binary: '+total2.toString(2)+')', 'rgba(255,255,255,0.4)');
  }
}

function refresh(){
  var sum,carry;
  if(mode==='half'){sum=A^B;carry=A&B;}
  else{var ab=A^B;sum=ab^Cin;carry=(A&B)|(Cin&ab);}
  ['A','B'].forEach(function(k){
    var v=k==='A'?A:B;
    var btn=document.getElementById('btn'+k);
    btn.textContent=k+' = '+v; btn.className='inp-btn'+(v?' hi':'');
  });
  var cb=document.getElementById('btnC');
  cb.textContent='C_in = '+Cin; cb.className='inp-btn'+(Cin?' hi':'');
  document.getElementById('vSum').textContent=sum;
  document.getElementById('vCar').textContent=carry;
  var descs={
    'half':'Half adder: Sum = A XOR B (the single-bit sum), Carry = A AND B (the carry into the next bit position). No carry-in — use this only for the least significant bit.',
    'full':'Full adder: adds three bits (A, B, carry-in). Two XOR gates cascade for the sum. Two AND gates detect the two ways a carry-out can be generated, ORed together for the final carry-out.',
  };
  document.getElementById('desc').textContent=descs[mode];
  draw();
}

document.getElementById('btnA').onclick=function(){A^=1;refresh();};
document.getElementById('btnB').onclick=function(){B^=1;refresh();};
document.getElementById('btnC').onclick=function(){Cin^=1;refresh();};
window.setMode=setMode;
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A half adder has inputs A=1 and B=1. What are the Sum and Carry outputs?`,
      options: [
        { label: 'A', text: 'Sum=1, Carry=1 — 1+1=2, so both bits are set' },
        { label: 'B', text: 'Sum=0, Carry=1 — 1+1=10 in binary: sum bit is 0, carry bit is 1' },
        { label: 'C', text: 'Sum=1, Carry=0 — XOR(1,1)=1 is the sum' },
        { label: 'D', text: 'Sum=0, Carry=0 — both inputs cancel out' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 1+1=2=10₂. The sum bit (rightmost) is 0, the carry bit is 1. In the half adder: Sum = XOR(1,1) = 0, Carry = AND(1,1) = 1. This carry propagates to the next bit position in a multi-bit adder.',
      failMessage: '1+1 in binary = 10₂ (two, written as one-zero). The sum bit of the current column is 0; the carry into the next column is 1. Half adder: Sum = XOR(1,1) = 0 (inputs same → XOR=0), Carry = AND(1,1) = 1.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### XOR in Parity Checking

A **parity bit** is an extra bit appended to a data word so that the total number of 1s is always even (even parity) or always odd (odd parity). If a single bit flips during transmission, the parity of the received word changes — detecting the error.

XOR is the perfect tool for parity calculation. The XOR of all bits in a word equals 1 if the number of 1s is odd, and 0 if it is even:

$$P = b_7 \\oplus b_6 \\oplus b_5 \\oplus b_4 \\oplus b_3 \\oplus b_2 \\oplus b_1 \\oplus b_0$$

For **even parity**, append $P$ as the parity bit — then the total count of 1s (data + parity) is always even.
For **odd parity**, append $\\bar{P}$ — then the total count is always odd.

At the receiver, XOR all received bits (including the parity bit). If the result is 0 (even parity scheme), no error. If the result is 1, a bit was flipped.

Parity checking is the simplest error detection scheme. It detects any single-bit error, but cannot detect two simultaneous bit flips (they cancel out in XOR). More powerful schemes — CRC, Hamming codes, Reed-Solomon — build on the same XOR foundation.

XOR also appears in more complex error-correcting codes (ECC RAM uses this), RAID disk arrays (RAID-5 stores an XOR parity stripe so any one drive can be reconstructed), and encryption (XOR is the core operation in stream ciphers and AES).`,
    },

    // ── Visual 3 — Parity checker ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Interactive parity checker

Click any bit to toggle it. The circuit XORs all 8 data bits to compute the even parity bit. Flip a single bit in transmission (the "corrupt" row) and watch the parity check fail — exactly one bit error is detected.`,
      html: `<div style="padding:14px">
  <div id="phaseRow" style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <button class="tab-btn active" id="ph-send" onclick="setPhase('send')">Sender: set data</button>
    <button class="tab-btn" id="ph-recv" onclick="setPhase('recv')">Receiver: check parity</button>
  </div>
  <canvas id="cv" width="560" height="320"></canvas>
  <div id="desc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.tab-btn{padding:6px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#6366f1;background:rgba(99,102,241,0.12);color:#818cf8}`,
      startCode: `
var data=[1,0,1,1,0,0,1,0];
var corrupt=-1; // index of corrupted bit (-1=none)
var phase='send';
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function parity(bits){return bits.reduce(function(a,b){return a^b;},0);}

function setPhase(p){
  phase=p;
  corrupt=-1;
  document.getElementById('ph-send').className='tab-btn'+(p==='send'?' active':'');
  document.getElementById('ph-recv').className='tab-btn'+(p==='recv'?' active':'');
  refresh();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var parBit=parity(data);
  var transmitted=data.concat([parBit]);  // 9 bits
  var received=transmitted.slice();
  if(corrupt>=0) received[corrupt]^=1;
  var checkParity=parity(received);
  var error=checkParity!==0;

  var cellW=50,cellH=46,startX=20,dataY=60,xorY=160,resultY=H-50;
  var N=phase==='send'?8:9;

  // Row label
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText(phase==='send'?'DATA BITS':'RECEIVED',startX-4,dataY+cellH/2+4);
  if(phase==='send') ctx.fillText('parity →',startX-4,dataY+cellH/2+4+60);

  var bitsToShow=phase==='send'?data:received;
  bitsToShow.forEach(function(b,i){
    var x=startX+i*cellW;
    var isCorrupt=phase==='recv'&&corrupt===i;
    var isPar=phase==='recv'&&i===8;
    var col=b?'#818cf8':'#334155';
    if(isCorrupt) col='#ef4444';
    if(isPar) col=b?'#4ade80':'#475569';
    ctx.fillStyle=col+'22';
    ctx.strokeStyle=col; ctx.lineWidth=isCorrupt?2.5:1.5;
    ctx.beginPath();ctx.roundRect(x+2,dataY,cellW-4,cellH,6);ctx.fill();ctx.stroke();
    ctx.fillStyle=col;ctx.font='bold 18px monospace';ctx.textAlign='center';
    ctx.fillText(b,x+cellW/2,dataY+cellH/2+6);
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px monospace';
    ctx.fillText(phase==='send'?('b'+( 7-i)):('b'+(phase==='recv'&&i===8?'P':(7-i))),x+cellW/2,dataY+cellH+12);
    if(isCorrupt){
      ctx.fillStyle='#ef4444';ctx.font='bold 9px monospace';
      ctx.fillText('FLIP!',x+cellW/2,dataY-6);
    }
  });

  if(phase==='send'){
    // Show parity computation
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('XOR all 8 bits:',startX,xorY-8);
    var chain=data.map(function(b){return b.toString();}).join(' \u2295 ')+' = '+parBit;
    ctx.fillText(chain,startX,xorY+10);
    // Parity bit display
    var px=startX+8*cellW+20;
    ctx.fillStyle='#4ade80'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText('Parity bit',px+cellW/2,xorY+30);
    ctx.fillStyle='#4ade8022'; ctx.strokeStyle='#4ade80'; ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(px+2,xorY+34,cellW-4,cellH,6);ctx.fill();ctx.stroke();
    ctx.fillStyle='#4ade80';ctx.font='bold 22px monospace';ctx.textAlign='center';
    ctx.fillText(parBit,px+cellW/2,xorY+34+cellH/2+7);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';
    ctx.fillText('Appended to data for transmission',startX,xorY+90);
    ctx.fillText('Even parity: total 1s in '+transmitted.join('')+' = '+transmitted.reduce(function(a,b){return a+b;})+' (even? '+(transmitted.reduce(function(a,b){return a+b;})%2===0?'yes':'no')+')',startX,xorY+106);

  } else {
    // Corruption controls
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('Click a bit above to simulate a transmission error',startX,dataY+cellH+28);
    // Check result
    var resultCol=error?'#ef4444':'#4ade80';
    ctx.fillStyle=resultCol+'22'; ctx.strokeStyle=resultCol; ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(startX,resultY-30,W-startX*2,42,8);ctx.fill();ctx.stroke();
    ctx.fillStyle=resultCol;ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText(error?'\u26a0 PARITY ERROR DETECTED — bit flip found (check parity='+checkParity+')':'\u2714 PARITY OK — all bits received correctly (check parity='+checkParity+')',W/2,resultY-6);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';
    ctx.fillText('XOR of all 9 received bits = '+checkParity+' ('+(checkParity?'non-zero = error':'zero = clean')+')',W/2,resultY+12);
  }
}

function refresh(){
  var parBit=parity(data);
  var ones=data.reduce(function(a,b){return a+b;},0);
  var descs={
    send:'The sender computes the XOR of all 8 data bits to get the even parity bit. This parity bit is appended before transmission. Toggle any data bit to see the parity bit update. Total 1s in the 9-bit word (including parity) will always be even.',
    recv:'The receiver XORs all 9 received bits (8 data + 1 parity). If result = 0: clean. If result = 1: exactly one bit was flipped. Click any received bit to simulate a transmission error — the check instantly detects it.',
  };
  document.getElementById('desc').textContent=descs[phase];
  draw();
}

canvas.onclick=function(e){
  if(phase!=='recv') return;
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(canvas.width/rect.width);
  var my=(e.clientY-rect.top)*(canvas.height/rect.height);
  var cellW=50,startX=20,dataY=60,cellH=46;
  if(my>=dataY&&my<=dataY+cellH){
    var idx=Math.floor((mx-startX)/cellW);
    if(idx>=0&&idx<=8){corrupt=(corrupt===idx)?-1:idx;refresh();}
  }
};
window.setPhase=setPhase;
refresh();`,
      outputHeight: 440,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A data byte 10110100 is transmitted with even parity. The parity bit is appended, making a 9-bit word. After transmission, the receiver XORs all 9 bits and gets 1. What does this mean?`,
      options: [
        { label: 'A', text: 'No error — parity of 1 means the data has an odd number of 1s, which is correct' },
        { label: 'B', text: 'An error was detected — a non-zero XOR result means an odd number of bits were flipped' },
        { label: 'C', text: 'Two bits were flipped — XOR of 1 indicates a double error' },
        { label: 'D', text: 'The parity bit itself was wrong when it was sent' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. In an even parity scheme, XORing all received bits (data + parity bit) should give 0 — meaning the total number of 1s is even. A result of 1 means the parity is wrong: an odd number of bits were flipped during transmission. Since single-bit errors are most common, this almost certainly means exactly one bit was corrupted.',
      failMessage: 'In even parity, the sender appends a parity bit so the total number of 1s is even. The receiver XORs all bits: if 0, parity is even (no error detected). If 1, parity is odd — something changed. This detects any single-bit error (or any odd number of bit flips). It cannot tell you which bit flipped, only that one did.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### XOR in Bit Manipulation and Encryption

Beyond arithmetic and error detection, XOR is the fundamental operation for several important programming and cryptography techniques.

**Bit toggling**: XOR with 1 flips a bit; XOR with 0 leaves it unchanged. This makes XOR the tool for selectively toggling bits in a register without affecting others:
$$\\text{result} = \\text{value} \\oplus \\text{mask}$$

**Swap without a temporary variable**: XOR has the property that $A \\oplus A = 0$ and $A \\oplus 0 = A$. This allows swapping two variables in three XOR operations:
$$A = A \\oplus B \\ \\rightarrow \\ B = A \\oplus B \\ \\rightarrow \\ A = A \\oplus B$$

**One-time pad (perfect encryption)**: XOR a message with a truly random key of the same length. The result is indistinguishable from random noise. XOR with the same key again recovers the original message. This is the **one-time pad** — the only provably unbreakable cipher, used by intelligence agencies. All practical stream ciphers (RC4, ChaCha20) are approximations of this idea.

**RAID-5 parity**: In a 4-disk RAID-5 array, a fifth "parity" disk stores the XOR of the corresponding blocks on all four data disks. If any one disk fails, the missing data can be reconstructed by XORing the remaining disks with the parity disk. This is the same parity principle from the last section, applied to entire disk blocks.

In every one of these applications, XOR's key property is the same: **it is its own inverse**. $A \\oplus B \\oplus B = A$. Apply XOR twice with the same value and you get back where you started.`,
    },

    // ── Visual 4 — XOR applications ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### XOR in action: bit manipulation, swap, encryption

Select an application and interact with it. All three demonstrate the same underlying property: XOR is self-inverse.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
    <button class="tab-btn active" id="tab-bits" onclick="setApp('bits')">Bit toggle</button>
    <button class="tab-btn" id="tab-swap" onclick="setApp('swap')">Variable swap</button>
    <button class="tab-btn" id="tab-enc"  onclick="setApp('enc')">Encryption</button>
  </div>
  <canvas id="cv" width="560" height="260"></canvas>
  <div id="desc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.tab-btn{padding:6px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#6366f1;background:rgba(99,102,241,0.12);color:#818cf8}`,
      startCode: `
var app='bits';
var value=0b10110010, mask=0b00001111;
var varA=42, varB=99;
var swapStep=0;
var swapVals=[[42,99],[42^99,99],[42^99,(42^99)^99],[(42^99)^((42^99)^99),(42^99)^99]];
var plaintext=[72,101,108,108,111]; // "Hello"
var key=[0xAB,0x3F,0x77,0xC2,0x5E];
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function setApp(a){
  app=a;swapStep=0;
  ['bits','swap','enc'].forEach(function(k){
    document.getElementById('tab-'+k).className='tab-btn'+(a===k?' active':'');
  });
  refresh();
}

function bin8(n){return (n&0xFF).toString(2).padStart(8,'0');}

function drawBitRow(y,label,val,col,clickable,rowIdx){
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText(label,50,y+16);
  for(var i=0;i<8;i++){
    var bit=(val>>(7-i))&1;
    var x=58+i*56;
    var bc=bit?col:'#334155';
    ctx.fillStyle=bc+'22'; ctx.strokeStyle=bc; ctx.lineWidth=bit?1.5:1;
    ctx.beginPath();ctx.roundRect(x,y,50,28,5);ctx.fill();ctx.stroke();
    ctx.fillStyle=bit?col:'rgba(255,255,255,0.25)';ctx.font='bold 16px monospace';ctx.textAlign='center';
    ctx.fillText(bit,x+25,y+20);
    if(clickable){
      (function(ii,ri){
        canvas._handlers=canvas._handlers||[];
        canvas._handlers.push({x:58+ii*56,y:y,w:50,h:28,fn:function(){
          if(ri===0) value^=(1<<(7-ii));
          else mask^=(1<<(7-ii));
          refresh();
        }});
      })(i,rowIdx);
    }
  }
  ctx.fillStyle=col;ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('= 0x'+((val&0xFF).toString(16).toUpperCase().padStart(2,'0')),58+8*56+6,y+18);
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  canvas._handlers=[];

  if(app==='bits'){
    var result=value^mask;
    drawBitRow(20,'value',value,'#818cf8',true,0);
    drawBitRow(64,'mask',mask,'#fbbf24',true,1);
    // XOR divider
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(58,98);ctx.lineTo(58+8*56,98);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='bold 12px monospace';ctx.textAlign='right';
    ctx.fillText('\u2295',50,115);
    drawBitRow(102,'result',result,'#4ade80',false,2);
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('Bits where mask=1 are toggled. Bits where mask=0 are unchanged.',58,160);
    ctx.fillText('Click any bit in value or mask rows to toggle it.',58,175);

  } else if(app==='swap'){
    var pairs=swapVals;
    var labels=['initial','A = A\u2295B','B = A\u2295B','A = A\u2295B'];
    var colA='#818cf8',colB='#4ade80';
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('Step '+swapStep+'/3',W/2,18);

    for(var s=0;s<=swapStep;s++){
      var y=30+s*52;
      var isActive=s===swapStep;
      ctx.fillStyle=isActive?'rgba(255,255,255,0.06)':'transparent';
      ctx.fillRect(20,y-4,W-40,44);
      ctx.fillStyle=isActive?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.2)';
      ctx.font=(isActive?'bold ':'')+'10px monospace';ctx.textAlign='left';
      ctx.fillText(labels[s],24,y+10);
      ctx.fillStyle=colA;ctx.font=(isActive?'bold ':'')+'14px monospace';
      ctx.fillText('A='+pairs[s][0],120,y+26);
      ctx.fillStyle=colB;
      ctx.fillText('B='+pairs[s][1],240,y+26);
      if(isActive&&s<3){
        ctx.fillStyle='#fbbf24';ctx.font='10px monospace';
        ctx.fillText('next: '+labels[s+1],360,y+26);
      }
    }
    if(swapStep===3){
      ctx.fillStyle='#4ade80';ctx.font='bold 12px monospace';ctx.textAlign='center';
      ctx.fillText('A and B swapped without a temporary variable!',W/2,H-16);
    }
    // Next button area (handled via click)
    if(swapStep<3){
      ctx.fillStyle='rgba(99,102,241,0.15)';ctx.strokeStyle='#6366f1';ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(W/2-60,H-38,120,28,6);ctx.fill();ctx.stroke();
      ctx.fillStyle='#818cf8';ctx.font='bold 11px monospace';ctx.textAlign='center';
      ctx.fillText('Next step \u2192',W/2,H-20);
      canvas._handlers.push({x:W/2-60,y:H-38,w:120,h:28,fn:function(){swapStep=Math.min(3,swapStep+1);refresh();}});
    } else {
      ctx.fillStyle='rgba(255,255,255,0.08)';ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(W/2-60,H-38,120,28,6);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign='center';
      ctx.fillText('Reset',W/2,H-20);
      canvas._handlers.push({x:W/2-60,y:H-38,w:120,h:28,fn:function(){swapStep=0;refresh();}});
    }

  } else {
    // Encryption
    var ciphertext=plaintext.map(function(b,i){return b^key[i];});
    var decrypted=ciphertext.map(function(b,i){return b^key[i];});
    var rowH=46,startY=10;
    var labels2=['Plaintext','XOR Key','Ciphertext','XOR Key','Decrypted'];
    var vals=[plaintext,key,ciphertext,key,decrypted];
    var colors=['#4ade80','#fbbf24','#ef4444','#fbbf24','#4ade80'];

    vals.forEach(function(row,ri){
      var y=startY+ri*rowH;
      ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='right';
      ctx.fillText(labels2[ri],78,y+18);
      if(ri===1||ri===3){
        ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='bold 14px monospace';ctx.textAlign='right';
        ctx.fillText('\u2295',62,y+20);
      } else if(ri===2){
        ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(82,y-4);ctx.lineTo(82+row.length*90,y-4);ctx.stroke();
      }
      row.forEach(function(v,ci){
        var x=82+ci*90;
        var col=colors[ri];
        var isChar=ri===0||ri===4;
        ctx.fillStyle=col+'18';ctx.strokeStyle=col+'66';ctx.lineWidth=1;
        ctx.beginPath();ctx.roundRect(x,y,78,34,5);ctx.fill();ctx.stroke();
        if(isChar){
          ctx.fillStyle=col;ctx.font='bold 16px monospace';ctx.textAlign='center';
          ctx.fillText(String.fromCharCode(v),x+24,y+22);
          ctx.fillStyle=col+'88';ctx.font='9px monospace';
          ctx.fillText('0x'+v.toString(16).toUpperCase().padStart(2,'0'),x+52,y+20);
        } else {
          ctx.fillStyle=col;ctx.font='11px monospace';ctx.textAlign='center';
          ctx.fillText('0x'+v.toString(16).toUpperCase().padStart(2,'0'),x+39,y+20);
        }
      });
    });
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('XOR with key: plaintext \u2192 ciphertext \u2192 plaintext. XOR is its own inverse.',82,H-6);
  }
}

function refresh(){
  var descs={
    bits:'Bit toggling with XOR mask: bits in the mask that are 1 flip the corresponding value bit; bits in the mask that are 0 leave the value bit unchanged. This is how firmware toggles specific hardware register bits without affecting others.',
    swap:'XOR swap: exchange A and B in three XOR operations, no temporary variable needed. Works because XOR is its own inverse: A\u2295B\u2295B = A. Not used in practice (compilers do better), but elegant proof of XOR self-inverse property.',
    enc:'One-time pad encryption: XOR each plaintext byte with the corresponding key byte. The result (ciphertext) looks random. XOR with the same key again perfectly recovers the original. This is the basis of all stream ciphers.',
  };
  document.getElementById('desc').textContent=descs[app];
  draw();
}

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(canvas.width/rect.width);
  var my=(e.clientY-rect.top)*(canvas.height/rect.height);
  (canvas._handlers||[]).forEach(function(h){
    if(mx>=h.x&&mx<=h.x+h.w&&my>=h.y&&my<=h.y+h.h) h.fn();
  });
};
window.setApp=setApp;
refresh();`,
      outputHeight: 400,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A value register contains 0b10110011. You want to flip bits 3 and 1 (counting from 0 at the right) without changing any other bits. Which XOR mask should you use?`,
      options: [
        { label: 'A', text: '0b11111111 — XOR with all 1s flips everything' },
        { label: 'B', text: '0b00001010 — set a 1 in bit positions 3 and 1 only' },
        { label: 'C', text: '0b00000011 — set bits 1 and 0' },
        { label: 'D', text: '0b10110011 — XOR with itself clears the register' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Bit 3 has value 2³=8 and bit 1 has value 2¹=2. The mask is 8+2=10=0b00001010. XOR: 10110011 ⊕ 00001010 = 10111001. Bits 3 and 1 flipped; all others unchanged. This is the standard idiom in embedded programming: value ^= mask;',
      failMessage: 'XOR with a mask flips exactly the bits where the mask is 1. To flip only bits 3 and 1: set bit 3 (value 8 = 2³) and bit 1 (value 2 = 2¹) in the mask. 8+2=10=0b00001010. Any bit where the mask is 0 is left unchanged.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: XOR and XNOR

**XOR** ($A \\oplus B$) outputs 1 when inputs **differ**. Output 0 when inputs are the same. Not the same as OR — the A=1,B=1 case gives 0, not 1.

**XNOR** ($\\overline{A \\oplus B}$) outputs 1 when inputs are the **same**. It is the equality detector.

**XOR is binary addition without carry**: the Sum bit of a 1-bit adder is exactly XOR. Combined with AND (for carry), XOR forms the half adder. Two XOR gates and two AND gates plus an OR gate form a full adder. Chain N full adders for an N-bit ripple-carry adder.

**XOR is the parity function**: XOR of all bits = 1 if count of 1s is odd, 0 if even. This is the basis of parity error detection, RAID-5 storage, and Hamming error-correcting codes.

**XOR is self-inverse**: $A \\oplus B \\oplus B = A$. Apply XOR twice with the same value and you get back the original. This property underpins bit toggling, the XOR swap trick, and one-time pad encryption.

In the next lesson: reading and drawing logic diagrams — how to trace signals through multi-gate circuits and derive truth tables from schematics.`,
    },
  ],
};

export default {
  id: 'df-3-3-xor-xnor',
  slug: 'xor-xnor-difference-equality-arithmetic',
  chapter: 'df.3',
  order: 2,
  title: 'XOR and XNOR: Difference, Equality, and Arithmetic',
  subtitle: 'The two gates that make adders, comparators, parity checkers, and encryption possible.',
  tags: ['digital', 'XOR', 'XNOR', 'half-adder', 'full-adder', 'parity', 'encryption', 'logic-gates', 'arithmetic'],
  hook: {
    question: 'Why does your CPU need a gate that outputs 1 only when its inputs disagree — and how does that one gate build everything from addition to encryption?',
    realWorldContext: 'Every addition your CPU performs uses XOR gates at the bit level. Every ECC RAM module uses XOR for error correction. Every RAID-5 array uses XOR for parity. Every stream cipher uses XOR as its core operation. XOR is arguably the most useful gate in digital design.',
  },
  intuition: {
    prose: [
      'XOR: output 1 when inputs differ. XNOR: output 1 when inputs match.',
      'XOR sum bit: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. Identical to binary addition sum.',
      'Half adder = XOR (sum) + AND (carry). Full adder = two XORs + two ANDs + OR.',
      'Parity = XOR of all bits. Self-inverse: A⊕B⊕B = A.',
    ],
    callouts: [
      { type: 'tip', title: 'XOR vs OR', body: 'The only difference: XOR(1,1)=0, OR(1,1)=1. XOR is "exclusive" — one OR the other, but not both.' },
      { type: 'important', title: 'Self-inverse property', body: 'A⊕B⊕B = A. This single property explains bit toggling, XOR swap, one-time pad encryption, and parity checking.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'XOR and XNOR', props: { lesson: LESSON_DF_3_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'XOR = "are they different?" XNOR = "are they the same?"',
    'XOR(A,B) = Sum bit of A+B. AND(A,B) = Carry bit of A+B.',
    'Half adder: Sum=A⊕B, Carry=A·B. Full adder adds carry-in with two more XOR/AND stages.',
    'Parity: XOR all N bits. Result = 1 if odd number of 1s. Append to make even parity.',
    'Self-inverse: applying XOR twice with same key/mask undoes itself. Foundation of encryption.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};