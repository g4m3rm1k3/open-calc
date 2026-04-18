// Digital Fundamentals · Unit 5 · Lesson 1
// Adders: Half Adder, Full Adder, Ripple-Carry, Carry Lookahead
// ScienceNotebook format

export const LESSON_DF_5_1 = {
  title: 'Adders: Building Hardware That Adds',
  subtitle: 'From a single-bit half adder to a fast multi-bit carry-lookahead adder — the circuit at the heart of every ALU.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Half Adder

Every arithmetic operation a CPU performs ultimately reduces to binary addition. Understanding the adder circuit is therefore understanding the core of the ALU (Arithmetic Logic Unit).

The simplest adder — the **half adder** — adds two single bits A and B and produces two outputs:

- **Sum** = the single-bit result of A + B (the LSB of the two-bit sum)
- **Carry** = 1 if the result exceeds 1 (i.e., A=1 and B=1)

The truth table reveals the gate implementation directly:

| A | B | Sum | Carry |
|---|---|-----|-------|
| 0 | 0 |  0  |   0   |
| 0 | 1 |  1  |   0   |
| 1 | 0 |  1  |   0   |
| 1 | 1 |  0  |   1   |

The Sum column (0,1,1,0) is XOR. The Carry column (0,0,0,1) is AND.

$$\\text{Sum} = A \\oplus B \\qquad \\text{Carry} = A \\cdot B$$

The half adder uses exactly **one XOR gate and one AND gate** — the minimum possible for this function. It is called "half" because it cannot handle a carry-in from a previous bit position, which is needed for multi-bit addition.`,
    },

    // ── Visual 1 — Half adder and transition to full adder ────────────────────
    {
      type: 'js',
      instruction: `### Half adder — interactive

Toggle A and B. Watch the Sum and Carry outputs. Notice: when both inputs are 1, the sum column gives 0 (the carry "overflows" to the next bit). This is why carry exists — it represents the 2¹ place when adding single bits.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="bA" class="inp-btn">A = 0</button>
    <button id="bB" class="inp-btn">B = 0</button>
    <div style="margin-left:auto;display:flex;gap:10px">
      <div class="out-badge" style="border-color:#818cf8">Sum = <span id="vSum">0</span></div>
      <div class="out-badge" style="border-color:#ef4444">Carry = <span id="vCar">0</span></div>
    </div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="320" height="180"></canvas>
    <div style="flex:1;min-width:160px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Truth table</div>
      <canvas id="tt" width="200" height="130"></canvas>
      <div id="haNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.inp-btn{padding:7px 20px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.out-badge{padding:6px 14px;border-radius:8px;border:1.5px solid;background:rgba(255,255,255,0.04);font-size:13px;font-weight:600;color:rgba(255,255,255,0.8)}`,
      startCode: `
var A=0,B=0;
var cv=document.getElementById('cv'),tt=document.getElementById('tt');
var ctx=cv.getContext('2d'),ttc=tt.getContext('2d');

function xorGate(c,x,y,w,h,col,active){
  c.fillStyle=active?col+'33':'#0d1527';
  c.strokeStyle=active?col:'#334155'; c.lineWidth=active?2:1.5;
  c.beginPath();c.moveTo(x+8,y+4);c.quadraticCurveTo(x+w/2-6,y+h/2,x+8,y+h-4);c.stroke();
  c.beginPath();
  c.moveTo(x+12,y+4);c.quadraticCurveTo(x+w/2-6,y+h/2,x+12,y+h-4);
  c.quadraticCurveTo(x+w/2+4,y+h,x+w-14,y+h/2);
  c.quadraticCurveTo(x+w/2+4,y,x+12,y+4);
  c.fill();c.stroke();
  c.strokeStyle=active?col:'#334155'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x,y+h*0.3);c.lineTo(x+12,y+h*0.3);c.stroke();
  c.beginPath();c.moveTo(x,y+h*0.7);c.lineTo(x+12,y+h*0.7);c.stroke();
  c.beginPath();c.moveTo(x+w-4,y+h/2);c.lineTo(x+w+20,y+h/2);c.stroke();
}
function andGate(c,x,y,w,h,col,active){
  c.fillStyle=active?col+'33':'#0d1527';
  c.strokeStyle=active?col:'#334155'; c.lineWidth=active?2:1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+w/2-4,y+4);
  c.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  c.lineTo(x+4,y+h-4);c.closePath();c.fill();c.stroke();
  c.strokeStyle=active?col:'#334155'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(x,y+h*0.3);c.lineTo(x+4,y+h*0.3);c.stroke();
  c.beginPath();c.moveTo(x,y+h*0.7);c.lineTo(x+4,y+h*0.7);c.stroke();
  c.beginPath();c.moveTo(x+w,y+h/2);c.lineTo(x+w+20,y+h/2);c.stroke();
}
function wire(c,x1,y1,x2,y2,v){
  c.strokeStyle=v?'#4ade80':'#475569'; c.lineWidth=v?2.5:1.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function dot(c,x,y,v){
  c.beginPath();c.arc(x,y,4,0,2*Math.PI);
  c.fillStyle=v?'#4ade80':'#475569'; c.fill();
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var sum=A^B, carry=A&B;
  var gw=80,gh=56;
  var xorX=100,xorY=20,andX=100,andY=105;
  var forkX=50;

  // Input wires
  wire(ctx,18,xorY+gh*0.3,forkX,xorY+gh*0.3,A);
  wire(ctx,18,xorY+gh*0.7,forkX,xorY+gh*0.7,B);
  ctx.fillStyle=A?'#4ade80':'#f87171';ctx.font='500 11px monospace';ctx.textAlign='right';
  ctx.fillText('A='+A,16,xorY+gh*0.3+4);
  ctx.fillStyle=B?'#4ade80':'#f87171';
  ctx.fillText('B='+B,16,xorY+gh*0.7+4);

  // Fork lines
  wire(ctx,forkX,xorY+gh*0.3,xorX,xorY+gh*0.3,A);
  wire(ctx,forkX,xorY+gh*0.7,xorX,xorY+gh*0.7,B);
  dot(ctx,forkX,xorY+gh*0.3,A);dot(ctx,forkX,xorY+gh*0.7,B);
  wire(ctx,forkX,xorY+gh*0.3,forkX,andY+gh*0.3,A);
  wire(ctx,forkX,xorY+gh*0.7,forkX,andY+gh*0.7,B);
  wire(ctx,forkX,andY+gh*0.3,andX,andY+gh*0.3,A);
  wire(ctx,forkX,andY+gh*0.7,andX,andY+gh*0.7,B);

  // XOR gate
  xorGate(ctx,xorX,xorY,gw,gh,'#818cf8',!!sum);
  ctx.fillStyle='#818cf8';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('XOR',xorX+gw/2,xorY-6);
  wire(ctx,xorX+gw+20,xorY+gh/2,W-18,xorY+gh/2,!!sum);
  ctx.fillStyle=sum?'#818cf8':'#475569';ctx.font='500 11px monospace';ctx.textAlign='left';
  ctx.fillText('Sum='+sum,W-16,xorY+gh/2+4);

  // AND gate
  andGate(ctx,andX,andY,gw,gh,'#ef4444',!!carry);
  ctx.fillStyle='#ef4444';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('AND',andX+gw/2,andY-6);
  wire(ctx,andX+gw+20,andY+gh/2,W-18,andY+gh/2,!!carry);
  ctx.fillStyle=carry?'#ef4444':'#475569';ctx.font='500 11px monospace';ctx.textAlign='left';
  ctx.fillText('Carry='+carry,W-16,andY+gh/2+4);

  // Equation
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText(A+'+'+B+' = '+carry+''+(sum)+' (binary: '+(A+B).toString(2)+')',10,H-6);
}

function drawTT(){
  var W=tt.width,H=tt.height;
  ttc.clearRect(0,0,W,H);ttc.fillStyle='#0a0f1e';ttc.fillRect(0,0,W,H);
  var rows=[[0,0,0,0],[0,1,1,0],[1,0,1,0],[1,1,0,1]];
  var cw=[40,40,60,60],hY=16;
  ['A','B','Sum','Carry'].forEach(function(h,i){
    var col=i>=2?(i===2?'#818cf8':'#ef4444'):'rgba(255,255,255,0.35)';
    ttc.fillStyle=col;ttc.font='bold 10px monospace';ttc.textAlign='center';
    ttc.fillText(h,cw.slice(0,i).reduce(function(a,b){return a+b;},0)+cw[i]/2,hY);
  });
  ttc.strokeStyle='rgba(255,255,255,0.08)';ttc.lineWidth=0.5;
  ttc.beginPath();ttc.moveTo(0,hY+5);ttc.lineTo(W,hY+5);ttc.stroke();
  rows.forEach(function(row,ri){
    var y=hY+16+ri*24;
    var isActive=row[0]===A&&row[1]===B;
    if(isActive){ttc.fillStyle='rgba(255,255,255,0.05)';ttc.fillRect(0,y-14,W,22);}
    var cx=0;
    row.forEach(function(v,ci){
      var col=ci>=2?(ci===2?(v?'#818cf8':'rgba(99,102,241,0.3)'):(v?'#ef4444':'rgba(239,68,68,0.3)')):(v?'#4ade80':'rgba(255,255,255,0.3)');
      ttc.fillStyle=col;ttc.font=(isActive?'bold ':'')+'12px monospace';ttc.textAlign='center';
      ttc.fillText(v,cx+cw[ci]/2,y);
      cx+=cw[ci];
    });
  });
}

function refresh(){
  var sum=A^B,carry=A&B;
  document.getElementById('bA').textContent='A = '+A;document.getElementById('bA').className='inp-btn'+(A?' hi':'');
  document.getElementById('bB').textContent='B = '+B;document.getElementById('bB').className='inp-btn'+(B?' hi':'');
  document.getElementById('vSum').textContent=sum;
  document.getElementById('vCar').textContent=carry;
  document.getElementById('haNote').textContent=
    A+'  + '+B+' = '+(carry?'1':'')+(sum)+' in binary. '+
    (carry?'The carry bit represents 2¹ — the sum overflows 1 bit.':'No carry — the result fits in 1 bit.');
  draw();drawTT();
}
document.getElementById('bA').onclick=function(){A^=1;refresh();};
document.getElementById('bB').onclick=function(){B^=1;refresh();};
refresh();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A half adder has inputs A=1, B=1. What are Sum and Carry, and what does this represent in decimal?`,
      options: [
        { label: 'A', text: 'Sum=1, Carry=1 — binary 11, which is 3 in decimal' },
        { label: 'B', text: 'Sum=0, Carry=1 — binary 10, which is 2 in decimal' },
        { label: 'C', text: 'Sum=1, Carry=0 — the XOR result is 1' },
        { label: 'D', text: 'Sum=0, Carry=0 — the inputs cancel each other' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 1+1=2 in decimal = 10 in binary. The sum bit (LSB) is 0, the carry bit (the 2¹ position) is 1. The half adder correctly represents this as Sum=0, Carry=1. The carry must propagate to the next bit position.',
      failMessage: '1+1=2 in decimal. In binary: 2 = 10₂. The sum bit (LSB, weight 1) = 0. The carry bit (weight 2) = 1. Half adder: Sum = XOR(1,1) = 0, Carry = AND(1,1) = 1.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Full Adder

The half adder cannot be chained to add multi-bit numbers because it has no carry-in. When adding bit position 1 of two 4-bit numbers, you need to include the carry from bit position 0.

The **full adder** adds three bits: A, B, and Carry-in (Cᵢₙ). It produces two outputs: Sum and Carry-out (Cₒᵤₜ).

$$\\text{Sum} = A \\oplus B \\oplus C_{in}$$
$$C_{out} = (A \\cdot B) + (C_{in} \\cdot (A \\oplus B))$$

The Sum is a cascade of two XOR gates. The Carry-out detects the two ways a carry can be generated:
- Both A and B are 1 (AND term)
- The sum of A and B would carry, and Cᵢₙ pushes it over (the second AND term)

**Gate count**: 2 XOR + 2 AND + 1 OR = 5 gates per bit.

**Full adder from two half adders**: a full adder can be built from two half adders plus an OR gate:
1. Half adder 1: inputs A, B → partial Sum₁ and Carry₁
2. Half adder 2: inputs Sum₁, Cᵢₙ → final Sum and Carry₂
3. OR: Carry₁ OR Carry₂ → Cₒᵤₜ

This construction shows the modular nature of digital design — complex circuits built from simpler verified blocks.`,
    },

    // ── Visual 2 — Full adder ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Full adder — three inputs

Toggle A, B, and Carry-in. The circuit shows both the direct gate implementation and the two-half-adder construction. Observe: the Sum is always A⊕B⊕Cin, and Carry-out fires whenever two or more inputs are 1.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="fA" class="inp-btn">A = 0</button>
    <button id="fB" class="inp-btn">B = 0</button>
    <button id="fC" class="inp-btn" style="border-color:rgba(251,191,36,0.5);color:#fbbf24;background:rgba(251,191,36,0.05)">Cᵢₙ = 0</button>
    <div style="margin-left:auto;display:flex;gap:10px">
      <div class="out-badge" style="border-color:#818cf8">Sum = <span id="fSum">0</span></div>
      <div class="out-badge" style="border-color:#ef4444">Cₒᵤₜ = <span id="fCout">0</span></div>
    </div>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:10px">
    <button class="view-btn active" id="v0" onclick="setView(0)">Direct circuit</button>
    <button class="view-btn" id="v1" onclick="setView(1)">Two half-adders</button>
    <button class="view-btn" id="v2" onclick="setView(2)">Truth table</button>
  </div>
  <canvas id="fav" width="520" height="230"></canvas>
  <div id="faNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.inp-btn{padding:7px 16px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.out-badge{padding:6px 14px;border-radius:8px;border:1.5px solid;background:rgba(255,255,255,0.04);font-size:13px;font-weight:600;color:rgba(255,255,255,0.8)}
.view-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.view-btn.active{border-color:#818cf8;background:rgba(99,102,241,0.12);color:#818cf8}`,
      startCode: `
var A=0,B=0,Cin=0,view=0;
var fav=document.getElementById('fav'),ctx=fav.getContext('2d');

function XORg(c,x,y,w,h,col,act){
  c.fillStyle=act?col+'33':'#0d1527';c.strokeStyle=act?col:'#334155';c.lineWidth=act?2:1.5;
  c.beginPath();c.moveTo(x+8,y+4);c.quadraticCurveTo(x+w/2-6,y+h/2,x+8,y+h-4);c.stroke();
  c.beginPath();c.moveTo(x+12,y+4);c.quadraticCurveTo(x+w/2-6,y+h/2,x+12,y+h-4);
  c.quadraticCurveTo(x+w/2+4,y+h,x+w-14,y+h/2);c.quadraticCurveTo(x+w/2+4,y,x+12,y+4);
  c.fill();c.stroke();
}
function ANDg(c,x,y,w,h,col,act){
  c.fillStyle=act?col+'33':'#0d1527';c.strokeStyle=act?col:'#334155';c.lineWidth=act?2:1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+w/2-4,y+4);
  c.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  c.lineTo(x+4,y+h-4);c.closePath();c.fill();c.stroke();
}
function ORg(c,x,y,w,h,col,act){
  c.fillStyle=act?col+'33':'#0d1527';c.strokeStyle=act?col:'#334155';c.lineWidth=act?2:1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
  c.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);c.quadraticCurveTo(x+w/2,y,x+4,y+4);
  c.fill();c.stroke();
}
function w(c,x1,y1,x2,y2,v,col){
  c.strokeStyle=col||(v?'#4ade80':'#475569');c.lineWidth=v?2.5:1.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function dot(c,x,y,v){c.beginPath();c.arc(x,y,4,0,2*Math.PI);c.fillStyle=v?'#4ade80':'#475569';c.fill();}
function lbl(c,x,y,t,col,align){c.fillStyle=col||'rgba(255,255,255,0.4)';c.font='11px monospace';c.textAlign=align||'center';c.fillText(t,x,y);}

function drawDirect(){
  var W=fav.width,H=fav.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var sum=A^B^Cin, cout=(A&B)|(Cin&(A^B));
  var gw=68,gh=50;
  var x1=110,y1=15,x2=280,y2=15;
  var andX=120,andY=130,and2X=260,and2Y=130,orX=380,orY=150;

  // XOR cascade
  XORg(ctx,x1,y1,gw,gh,'#818cf8',!!(A^B));
  lbl(ctx,x1+gw/2,y1-7,'XOR₁','#818cf8');
  var ab=A^B;
  XORg(ctx,x2,y2,gw,gh,'#818cf8',!!sum);
  lbl(ctx,x2+gw/2,y2-7,'XOR₂','#818cf8');

  // Input wires
  lbl(ctx,16,y1+gh*0.3+4,'A='+A,A?'#4ade80':'#f87171','right');
  lbl(ctx,16,y1+gh*0.7+4,'B='+B,B?'#4ade80':'#f87171','right');
  w(ctx,18,y1+gh*0.3,x1,y1+gh*0.3,A);
  w(ctx,18,y1+gh*0.7,x1,y1+gh*0.7,B);
  dot(ctx,18,y1+gh*0.3,A);dot(ctx,18,y1+gh*0.7,B);

  // A,B forks to AND1
  w(ctx,18,y1+gh*0.3,18,andY+gh*0.3,A);
  w(ctx,18,y1+gh*0.7,18,andY+gh*0.7,B);
  w(ctx,18,andY+gh*0.3,andX,andY+gh*0.3,A);
  w(ctx,18,andY+gh*0.7,andX,andY+gh*0.7,B);

  // XOR1 output wire → XOR2 and AND2
  var mid1x=x1+gw+4; var mid1y=y1+gh/2;
  w(ctx,mid1x,mid1y,x2,y2+gh*0.3,ab);
  dot(ctx,mid1x+18,mid1y,ab);
  w(ctx,mid1x+18,mid1y,mid1x+18,and2Y+gh*0.3,ab);
  w(ctx,mid1x+18,and2Y+gh*0.3,and2X,and2Y+gh*0.3,ab);

  // Cin wire
  lbl(ctx,16,y2+gh*0.7+4,'Cᵢₙ='+Cin,Cin?'#fbbf24':'rgba(251,191,36,0.4)','right');
  w(ctx,18,y2+gh*0.7+40,x2,y2+gh*0.7,Cin);
  dot(ctx,18,y2+gh*0.7+40,Cin);
  w(ctx,18,y2+gh*0.7+40,18,and2Y+gh*0.7+10,Cin);
  w(ctx,18,and2Y+gh*0.7+10,and2X,and2Y+gh*0.7,Cin);

  // AND gates
  ANDg(ctx,andX,andY,gw,gh,'#ef4444',!!(A&B));
  lbl(ctx,andX+gw/2,andY-7,'AND₁','#ef4444');
  ANDg(ctx,and2X,and2Y,gw,gh,'#ef4444',!!(Cin&ab));
  lbl(ctx,and2X+gw/2,and2Y-7,'AND₂','#ef4444');

  // AND outputs to OR
  w(ctx,andX+gw,andY+gh/2,orX,orY+gh*0.3,!!(A&B));
  w(ctx,and2X+gw,and2Y+gh/2,orX,orY+gh*0.7,!!(Cin&ab));

  // OR
  ORg(ctx,orX,orY,gw,gh,'#ef4444',!!cout);
  lbl(ctx,orX+gw/2,orY-7,'OR','#ef4444');

  // Outputs
  w(ctx,x2+gw,y2+gh/2,W-16,y2+gh/2,!!sum);
  lbl(ctx,W-14,y2+gh/2+4,'Sum='+sum,sum?'#818cf8':'#475569','left');
  w(ctx,orX+gw,orY+gh/2,W-16,orY+gh/2,!!cout);
  lbl(ctx,W-14,orY+gh/2+4,'Cₒᵤₜ='+cout,cout?'#ef4444':'#475569','left');
}

function drawTwoHA(){
  var W=fav.width,H=fav.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var sum=A^B^Cin,cout=(A&B)|(Cin&(A^B));
  var ha1x=80,ha1y=40,ha2x=240,ha2y=70,orX=390,orY=115;
  var bw=100,bh=80;

  function drawHA(c,x,y,w2,h2,col,s,cr,lbl2){
    c.fillStyle=col+'0f';c.strokeStyle=col+'44';c.lineWidth=1.5;
    c.beginPath();c.roundRect(x,y,w2,h2,6);c.fill();c.stroke();
    c.fillStyle=col;c.font='bold 11px monospace';c.textAlign='center';
    c.fillText(lbl2,x+w2/2,y+h2/2-8);
    c.font='10px monospace';
    c.fillStyle=s?'#818cf8':'rgba(99,102,241,0.4)';c.fillText('S='+s,x+w2/2-18,y+h2/2+8);
    c.fillStyle=cr?'#ef4444':'rgba(239,68,68,0.4)';c.fillText('C='+cr,x+w2/2+18,y+h2/2+8);
  }

  var ab=A^B,cab=A&B,sum2=ab^Cin,cab2=ab&Cin;
  drawHA(ctx,ha1x,ha1y,bw,bh,'#0891b2',ab,cab,'HA₁');
  drawHA(ctx,ha2x,ha2y,bw,bh,'#7c3aed',sum2,cab2,'HA₂');

  // Inputs to HA1
  lbl(ctx,16,ha1y+bh*0.3+4,'A='+A,A?'#4ade80':'#f87171','right');
  lbl(ctx,16,ha1y+bh*0.7+4,'B='+B,B?'#4ade80':'#f87171','right');
  w(ctx,18,ha1y+bh*0.3,ha1x,ha1y+bh*0.3,A);
  w(ctx,18,ha1y+bh*0.7,ha1x,ha1y+bh*0.7,B);

  // HA1 sum → HA2 input
  w(ctx,ha1x+bw,ha1y+bh*0.35,ha2x,ha2y+bh*0.3,ab);
  lbl(ctx,(ha1x+bw+ha2x)/2,ha1y+bh*0.35-8,'AB='+ab,ab?'#0891b2':'rgba(8,145,178,0.4)');
  // HA1 carry → OR
  w(ctx,ha1x+bw,ha1y+bh*0.65,orX,orY+bh*0.25,cab);

  // Cin → HA2
  lbl(ctx,16,ha2y+bh*0.7+4,'Cᵢₙ='+Cin,Cin?'#fbbf24':'rgba(251,191,36,0.4)','right');
  w(ctx,18,ha2y+bh*0.7,ha2x,ha2y+bh*0.7,Cin);

  // HA2 carry → OR
  w(ctx,ha2x+bw,ha2y+bh*0.65,orX,orY+bh*0.55,cab2);

  // OR gate
  ORg(ctx,orX,orY,70,bh,'#ef4444',!!cout);
  lbl(ctx,orX+35,orY-8,'OR','#ef4444');

  // Outputs
  w(ctx,ha2x+bw,ha2y+bh*0.35,W-18,ha2y+bh*0.35,!!sum);
  lbl(ctx,W-16,ha2y+bh*0.35+4,'Sum='+sum,sum?'#818cf8':'#475569','left');
  w(ctx,orX+70,orY+bh/2,W-18,orY+bh/2,!!cout);
  lbl(ctx,W-16,orY+bh/2+4,'Cₒᵤₜ='+cout,cout?'#ef4444':'#475569','left');
}

function drawTTView(){
  var W=fav.width,H=fav.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var rows=[];
  for(var i=0;i<8;i++){var a=(i>>2)&1,b=(i>>1)&1,c=i&1;rows.push([a,b,c,a^b^c,(a&b)|(c&(a^b))]);}
  var cw=[50,50,60,70,70],hY=20,rh=24,sx=10;
  ['A','B','Cᵢₙ','Sum','Cₒᵤₜ'].forEach(function(h,i){
    var col=i>=3?(i===3?'#818cf8':'#ef4444'):'rgba(255,255,255,0.4)';
    ctx.fillStyle=col;ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(h,sx+cw.slice(0,i).reduce(function(a,b){return a+b;},0)+cw[i]/2,hY);
  });
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(sx,hY+5);ctx.lineTo(sx+cw.reduce(function(a,b){return a+b;}),hY+5);ctx.stroke();
  rows.forEach(function(row,ri){
    var y=hY+16+ri*rh;
    var isActive=row[0]===A&&row[1]===B&&row[2]===Cin;
    if(isActive){ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(sx,y-rh*0.6,cw.reduce(function(a,b){return a+b;}),rh);}
    var cx=sx;
    row.forEach(function(v,ci){
      var col=ci>=3?(ci===3?(v?'#818cf8':'rgba(99,102,241,0.3)'):(v?'#ef4444':'rgba(239,68,68,0.3)')):(v?'#4ade80':'rgba(255,255,255,0.3)');
      ctx.fillStyle=col;ctx.font=(isActive?'bold ':'')+'12px monospace';ctx.textAlign='center';
      ctx.fillText(v,cx+cw[ci]/2,y);cx+=cw[ci];
    });
  });
}

function setView(v){
  view=v;
  ['v0','v1','v2'].forEach(function(id,i){document.getElementById(id).className='view-btn'+(v===i?' active':'');});
  if(v===0) drawDirect();
  else if(v===1) drawTwoHA();
  else drawTTView();
}

function refresh(){
  var sum=A^B^Cin,cout=(A&B)|(Cin&(A^B));
  ['A','B'].forEach(function(k){
    var v=k==='A'?A:B;
    var btn=document.getElementById('f'+k);btn.textContent=k+' = '+v;btn.className='inp-btn'+(v?' hi':'');
  });
  var cb=document.getElementById('fC');
  cb.textContent='Cᵢₙ = '+Cin;
  cb.style.borderColor=Cin?'#fbbf24':'rgba(251,191,36,0.5)';
  cb.style.color=Cin?'#fbbf24':'rgba(251,191,36,0.6)';
  document.getElementById('fSum').textContent=sum;
  document.getElementById('fCout').textContent=cout;
  document.getElementById('faNote').textContent=
    'Full adder: '+A+'+'+B+'+'+(Cin?'1(Cᵢₙ)':'0')+' = '+cout+''+(sum)+
    ' in binary = '+(A+B+Cin)+' in decimal. Carry-out: '+(cout?'yes — passes 1 to next bit position.':'no.');
  setView(view);
}
document.getElementById('fA').onclick=function(){A^=1;refresh();};
document.getElementById('fB').onclick=function(){B^=1;refresh();};
document.getElementById('fC').onclick=function(){Cin^=1;refresh();};
window.setView=setView;
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A full adder has A=1, B=1, Cᵢₙ=1. What are Sum and Cₒᵤₜ, and what decimal value does this represent?`,
      options: [
        { label: 'A', text: 'Sum=1, Cₒᵤₜ=1 — decimal 3 (binary 11)' },
        { label: 'B', text: 'Sum=0, Cₒᵤₜ=0 — all inputs cancel' },
        { label: 'C', text: 'Sum=1, Cₒᵤₜ=0 — only the XOR matters' },
        { label: 'D', text: 'Sum=0, Cₒᵤₜ=1 — overflow only, no sum bit' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. 1+1+1=3 in decimal = 11₂. Sum = XOR(1,1,1) = 1 (odd number of 1s). Cₒᵤₜ = (1·1)+(1·XOR(1,1)) = 1+0 = 1. Result: Sum=1, Cₒᵤₜ=1 → binary 11 → decimal 3. ✓',
      failMessage: '1+1+1=3. In binary: 11₂. Sum bit = 1 (LSB of 3). Carry-out bit = 1 (MSB of 3). Verify: Sum = A⊕B⊕Cin = 1⊕1⊕1 = 1. Cout = (A·B)+(Cin·(A⊕B)) = (1·1)+(1·0) = 1. Sum=1, Cout=1.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Ripple-Carry Adder

Chain N full adders to add N-bit numbers. The carry-out of each stage connects to the carry-in of the next stage — the carry "ripples" from LSB to MSB.

For an N-bit ripple-carry adder:
- **Gate count**: N × 5 gates per full adder = 5N gates
- **Propagation delay**: up to 2N gate delays in the worst case (carry ripples through every stage)
- **Worst case**: adding 0111...1 + 0000...1 — the carry starts at bit 0 and must propagate through all N stages before the sum is valid

For a 32-bit adder: up to 64 gate delays. At 2 ns/gate, that is 128 ns — limiting the clock to about 8 MHz for just one addition. Modern CPUs run at 3+ GHz, so ripple-carry adders alone are far too slow.

**The overflow flags**:
- **Unsigned overflow (carry)**: the carry-out of the MSB. If set, the result exceeds 2ᴺ−1.
- **Signed overflow (V flag)**: carry into MSB ≠ carry out of MSB. Two positives gave a negative, or two negatives gave a positive.

Both flags are direct outputs of the N-bit adder with no additional logic — the hardware naturally provides them.`,
    },

    // ── Visual 3 — Ripple-carry adder ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Ripple-carry adder — live addition

Set the two operands with the sliders. Watch the carry ripple bit by bit from LSB to MSB. The carry propagation path is highlighted — this is the critical path that limits clock frequency.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">A = <strong id="lA" style="color:#0891b2">0</strong></div>
      <input type="range" id="slA" min="0" max="255" value="45" style="width:100%;accent-color:#0891b2">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">B = <strong id="lB" style="color:#7c3aed">0</strong></div>
      <input type="range" id="slB" min="0" max="255" value="83" style="width:100%;accent-color:#7c3aed">
    </div>
  </div>
  <canvas id="rca" width="560" height="240"></canvas>
  <div id="rcaResult" style="margin-top:10px;font-size:13px;line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}`,
      startCode: `
var valA=45,valB=83;
var rca=document.getElementById('rca'),ctx=rca.getContext('2d');

function toBits(n,b){return Array.from({length:b},function(_,i){return (n>>(b-1-i))&1;});}

function draw(){
  var W=rca.width,H=rca.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var BITS=8;
  var aBits=toBits(valA,BITS),bBits=toBits(valB,BITS);
  var carries=new Array(BITS+1).fill(0);
  var sums=new Array(BITS).fill(0);
  for(var i=BITS-1;i>=0;i--){
    var t=aBits[i]+bBits[i]+carries[i+1];
    sums[i]=t%2;carries[i]=Math.floor(t/2);
  }
  var result=(valA+valB)&0xFF;
  var overflow=valA+valB>255;
  var signedA=valA<128?valA:valA-256;
  var signedB=valB<128?valB:valB-256;
  var signedResult=result<128?result:result-256;
  var signedOverflow=(signedA>=0&&signedB>=0&&signedResult<0)||(signedA<0&&signedB<0&&signedResult>=0);

  var pad={l:30,r:16,t:12,b:40};
  var iW=W-pad.l-pad.r;
  var faW=Math.floor(iW/BITS)-2;
  var faH=120;
  var faY=pad.t+40;

  // Bit position labels
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  for(var i=0;i<BITS;i++){
    ctx.fillText('bit '+(BITS-1-i),pad.l+i*(faW+2)+faW/2,faY-28);
  }

  // A row
  for(var i=0;i<BITS;i++){
    var x=pad.l+i*(faW+2);
    ctx.fillStyle=aBits[i]?'rgba(8,145,178,0.2)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=aBits[i]?'#0891b2':'rgba(255,255,255,0.08)';ctx.lineWidth=aBits[i]?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x,faY-22,faW,16,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=aBits[i]?'#0891b2':'rgba(255,255,255,0.2)';
    ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(aBits[i],x+faW/2,faY-10);
  }
  ctx.fillStyle='#0891b2';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText('A',pad.l-4,faY-10);

  // B row
  for(var i=0;i<BITS;i++){
    var x=pad.l+i*(faW+2);
    ctx.fillStyle=bBits[i]?'rgba(124,58,237,0.2)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=bBits[i]?'#7c3aed':'rgba(255,255,255,0.08)';ctx.lineWidth=bBits[i]?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x,faY-4,faW,16,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=bBits[i]?'#7c3aed':'rgba(255,255,255,0.2)';
    ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(bBits[i],x+faW/2,faY+8);
  }
  ctx.fillStyle='#7c3aed';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText('B',pad.l-4,faY+8);

  // Full adder boxes
  for(var i=0;i<BITS;i++){
    var x=pad.l+i*(faW+2);
    var hasCIn=carries[i+1]>0;
    var hasCOut=carries[i]>0;
    var s=sums[i];
    ctx.fillStyle=s?'rgba(99,102,241,0.1)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=s?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)';ctx.lineWidth=s?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x,faY+16,faW,faH-10,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('FA',x+faW/2,faY+28);
    // Sum output
    ctx.fillStyle=s?'#818cf8':'rgba(255,255,255,0.2)';ctx.font='bold 13px monospace';
    ctx.fillText(s,x+faW/2,faY+52);
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='8px monospace';
    ctx.fillText('sum',x+faW/2,faY+64);
  }

  // Carry ripple path
  for(var i=0;i<BITS;i++){
    var x=pad.l+i*(faW+2);
    var cin=carries[i+1], cout=carries[i];
    if(cin){
      ctx.fillStyle='rgba(239,68,68,0.15)';ctx.strokeStyle='rgba(239,68,68,0.5)';ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(x,faY+70,faW,20,3);ctx.fill();ctx.stroke();
      ctx.fillStyle='#ef4444';ctx.font='8px monospace';ctx.textAlign='center';
      ctx.fillText('C←'+cin,x+faW/2,faY+84);
    }
    // Carry arrow between stages
    if(i<BITS-1&&cout){
      ctx.strokeStyle='#ef4444';ctx.lineWidth=2;
      var arrowX=x+faW+1;
      ctx.beginPath();ctx.moveTo(arrowX,faY+80);ctx.lineTo(arrowX,faY+80);ctx.stroke();
      ctx.fillStyle='#ef4444';
      ctx.beginPath();ctx.moveTo(arrowX-4,faY+76);ctx.lineTo(arrowX,faY+80);ctx.lineTo(arrowX+4,faY+76);ctx.fill();
    }
  }

  // Carry-out flag
  if(overflow){
    ctx.fillStyle='#ef4444';ctx.font='bold 10px monospace';ctx.textAlign='left';
    ctx.fillText('C=1',pad.l-26,faY+84);
  }

  // Sum row
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(pad.l-20,faY+faH+10);ctx.lineTo(W-pad.r,faY+faH+10);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText('Sum:',pad.l-4,faY+faH+24);
  sums.forEach(function(s,i){
    var x=pad.l+i*(faW+2);
    ctx.fillStyle=s?'#818cf8':'rgba(255,255,255,0.25)';
    ctx.font='bold 14px monospace';ctx.textAlign='center';
    ctx.fillText(s,x+faW/2,faY+faH+24);
  });
  // Overflow marker
  if(overflow){
    ctx.fillStyle='#ef4444';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('↑',pad.l-14,faY+faH+22);
  }

  // Labels below
  var stagesWithCarry=carries.filter(function(c,i){return i>0&&i<BITS&&c;}).length;
  var maxDelay=stagesWithCarry>0?stagesWithCarry*2+2:2;

  document.getElementById('lA').textContent=valA;
  document.getElementById('lB').textContent=valB;
  document.getElementById('rcaResult').innerHTML=
    '<span style="color:#0891b2">'+valA+'</span> + <span style="color:#7c3aed">'+valB+'</span> = '+
    '<strong style="color:#818cf8">'+result+'</strong>'+
    (overflow?' <span style="color:#ef4444">[UNSIGNED OVERFLOW — true sum='+( valA+valB)+']</span>':'')+
    (signedOverflow?' <span style="color:#f472b6">[SIGNED OVERFLOW]</span>':'')+
    '<br>Binary: '+toBits(valA,8).join('')+' + '+toBits(valB,8).join('')+' = '+(overflow?'1':'') +toBits(result,8).join('')+
    '<br><span style="color:rgba(255,255,255,0.35)">Carry chain through '+stagesWithCarry+' stage'+(stagesWithCarry!==1?'s':'')+'. Worst-case delay: 2×8=16 gate delays for 8-bit.</span>';
}

document.getElementById('slA').oninput=function(){valA=parseInt(this.value);draw();};
document.getElementById('slB').oninput=function(){valB=parseInt(this.value);draw();};
draw();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `An 8-bit ripple-carry adder has a worst-case propagation delay of 16 gate delays (2 per full adder × 8 stages). If each gate delay is 2 ns, what is the maximum clock frequency for a system that does one addition per clock cycle?`,
      options: [
        { label: 'A', text: '500 MHz — 1/(2 ns) = 500 MHz per gate' },
        { label: 'B', text: '31.25 MHz — 1/(16 × 2 ns) = 1/32 ns' },
        { label: 'C', text: '62.5 MHz — 1/(2 × 8 ns) counting only one delay per stage' },
        { label: 'D', text: '250 MHz — average delay, not worst-case' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Total worst-case delay = 16 gate delays × 2 ns/gate = 32 ns. Maximum clock frequency = 1/32 ns = 31.25 MHz. This is why ripple-carry adders are only used in non-speed-critical applications or for very narrow operands.',
      failMessage: 'Total propagation delay = 16 gate delays × 2 ns each = 32 ns. The clock period must be ≥ 32 ns. Maximum frequency = 1 / 32 ns = 31.25 MHz. Always multiply the number of gate delays by the per-gate delay to get the total path delay.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Carry Lookahead: Breaking the Ripple

The ripple-carry adder is slow because carry must propagate sequentially. The **carry lookahead adder (CLA)** eliminates this by computing all carries in parallel, using only two levels of logic.

**Key definitions** for each bit position i:
- **Generate**: $G_i = A_i \\cdot B_i$ — this stage will generate a carry regardless of carry-in
- **Propagate**: $P_i = A_i \\oplus B_i$ (or $A_i + B_i$) — this stage will propagate a carry-in to its carry-out

With G and P, the carry into each position can be computed directly:

$$C_1 = G_0 + P_0 \\cdot C_0$$
$$C_2 = G_1 + P_1 \\cdot G_0 + P_1 \\cdot P_0 \\cdot C_0$$
$$C_3 = G_2 + P_2 \\cdot G_1 + P_2 \\cdot P_1 \\cdot G_0 + P_2 \\cdot P_1 \\cdot P_0 \\cdot C_0$$

Each carry depends only on the **original inputs** A, B, and C₀ — not on the carry from the previous stage. All carries can be computed simultaneously in just 2 gate delays (one AND level, one OR level).

**CLA vs ripple-carry**:
- Ripple-carry N-bit: ~2N gate delays
- CLA N-bit: ~4 gate delays (constant, independent of N)
- CLA uses more gates (the carry expressions grow), but the speed gain is dramatic

**Real implementations**: 4-bit CLA blocks are cascaded (with group propagate/generate) to build 16-bit, 32-bit, and 64-bit adders. The 74182 IC is the classic 4-bit CLA lookahead unit. Modern CPUs use hybrid approaches — CLA within groups, ripple between groups — tuned to transistor characteristics.`,
    },

    // ── Visual 4 — CLA timing comparison ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Carry lookahead vs ripple-carry: timing comparison

Adjust the number of bits and gate delay. The timing diagram shows how ripple-carry delay grows linearly while CLA stays nearly constant. The crossover point where CLA wins appears clearly.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Bit width: <strong id="lBits" style="color:#e2e8f0">8</strong></div>
      <input type="range" id="slBits" min="4" max="64" value="8" style="width:100%;accent-color:#818cf8">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Gate delay: <strong id="lGD" style="color:#e2e8f0">2</strong> ns</div>
      <input type="range" id="slGD" min="1" max="5" value="2" style="width:100%;accent-color:#818cf8">
    </div>
  </div>
  <canvas id="cla" width="560" height="280"></canvas>
  <div id="claNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}`,
      startCode: `
var bits=8,gd=2;
var cla=document.getElementById('cla'),ctx=cla.getContext('2d');

function draw(){
  var W=cla.width,H=cla.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var rcaDelay=2*bits*gd;
  var claDelay=4*gd; // constant ~4 gate levels
  var maxDelay=Math.max(rcaDelay,80);

  var PAD={l:60,r:16,t:20,b:50};
  var iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;

  // Draw comparison bars
  var barH=40,gap=20;
  var rcaY=PAD.t+20, claY=rcaY+barH+gap;

  function drawBar(y,delay,col,label){
    var bw=(delay/maxDelay)*iW;
    ctx.fillStyle=col+'22';ctx.strokeStyle=col;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(PAD.l,y,bw,barH,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=col;ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText(delay+'ns',PAD.l+bw+6,y+barH/2+4);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='right';
    ctx.fillText(label,PAD.l-6,y+barH/2+4);
  }

  drawBar(rcaY,rcaDelay,'#ef4444','Ripple');
  drawBar(claY,claDelay,'#4ade80','CLA');

  // Speed ratio annotation
  var ratio=(rcaDelay/claDelay).toFixed(1);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('CLA is '+ratio+'× faster',W/2,claY+barH+20);

  // Delay vs bit-width chart
  var chartY=claY+barH+40, chartH=iH-(chartY-PAD.t), maxBits=64;
  if(chartH>60){
    // Axes
    ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(PAD.l,chartY);ctx.lineTo(PAD.l,chartY+chartH);ctx.lineTo(W-PAD.r,chartY+chartH);ctx.stroke();

    var maxY=2*maxBits*gd;
    function toX(b){return PAD.l+(b/maxBits)*iW;}
    function toY(d){return chartY+chartH-(d/maxY)*chartH;}

    // RCA line
    ctx.strokeStyle='#ef4444';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(toX(1),toY(2*gd));
    for(var b=2;b<=maxBits;b++) ctx.lineTo(toX(b),toY(2*b*gd));
    ctx.stroke();

    // CLA line (constant ~4 gate delays)
    ctx.strokeStyle='#4ade80';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(toX(1),toY(claDelay));ctx.lineTo(toX(maxBits),toY(claDelay));ctx.stroke();

    // Current bit marker
    ctx.beginPath();ctx.arc(toX(bits),toY(rcaDelay),5,0,2*Math.PI);
    ctx.fillStyle='#ef4444';ctx.fill();
    ctx.beginPath();ctx.arc(toX(bits),toY(claDelay),5,0,2*Math.PI);
    ctx.fillStyle='#4ade80';ctx.fill();

    // Axis labels
    [16,32,48,64].forEach(function(b){
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px monospace';ctx.textAlign='center';
      ctx.fillText(b+'b',toX(b),chartY+chartH+12);
    });
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('bit width →',toX(32),chartY+chartH+24);
    ctx.save();ctx.translate(PAD.l-20,(chartY+chartY+chartH)/2);ctx.rotate(-Math.PI/2);
    ctx.fillText('delay (ns)',0,0);ctx.restore();

    // Legend
    ctx.fillStyle='#ef4444';ctx.fillRect(W-100,chartY+6,16,3);
    ctx.fillText('Ripple',W-80,chartY+10);
    ctx.fillStyle='#4ade80';ctx.fillRect(W-100,chartY+20,16,3);
    ctx.fillText('CLA',W-80,chartY+24);
    ctx.fillStyle='rgba(255,255,255,0.2)';
  }

  document.getElementById('lBits').textContent=bits;
  document.getElementById('lGD').textContent=gd;
  document.getElementById('claNote').innerHTML=
    '<strong style="color:#ef4444">Ripple-carry '+bits+'-bit</strong>: '+rcaDelay+'ns ('+2*bits+' gate delays × '+gd+'ns).<br>'+
    '<strong style="color:#4ade80">CLA '+bits+'-bit</strong>: '+claDelay+'ns (4 gate levels × '+gd+'ns, independent of bit width).<br>'+
    'For 64-bit: ripple = '+(2*64*gd)+'ns → max '+Math.round(1000/(2*64*gd))+'MHz. CLA = '+claDelay+'ns → max '+Math.round(1000/claDelay)+'MHz.';
}

document.getElementById('slBits').oninput=function(){bits=parseInt(this.value);draw();};
document.getElementById('slGD').oninput=function(){gd=parseInt(this.value);draw();};
draw();`,
      outputHeight: 440,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In a carry-lookahead adder, what are the Generate (G) and Propagate (P) signals for bit position i, and what do they mean physically?`,
      options: [
        { label: 'A', text: 'G = A⊕B (XOR), P = A·B (AND) — G detects differences, P detects equality' },
        { label: 'B', text: 'G = A·B (AND), P = A⊕B (XOR) — G means this stage will generate a carry regardless of carry-in; P means a carry-in will propagate through' },
        { label: 'C', text: 'G = A+B (OR), P = A·B (AND) — G means either input is 1, P means both are 1' },
        { label: 'D', text: 'G = A·B·Cin, P = A⊕B⊕Cin — both depend on carry-in' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. G = A·B: if both inputs are 1, a carry is generated regardless of carry-in. P = A⊕B: if exactly one input is 1, a carry-in will propagate to carry-out (but no new carry is generated). These two signals allow carry computation at any bit position from just the original inputs A, B, and C₀ — eliminating the ripple dependency.',
      failMessage: 'Generate (G = A·B): both A and B are 1 → this stage produces a carry regardless of carry-in. Propagate (P = A⊕B): exactly one of A,B is 1 → carry-in passes through as carry-out. Crucially, neither G nor P depends on carry-in, enabling parallel carry computation.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Adders

**Half adder** (1 XOR + 1 AND):
$$\\text{Sum} = A \\oplus B \\qquad \\text{Carry} = A \\cdot B$$
Adds two single bits. No carry-in — use only at bit position 0.

**Full adder** (2 XOR + 2 AND + 1 OR, or 2 half adders + 1 OR):
$$\\text{Sum} = A \\oplus B \\oplus C_{in} \\qquad C_{out} = AB + C_{in}(A \\oplus B)$$
Adds three bits. Carry-in enables chaining for multi-bit addition.

**Ripple-carry adder** (N full adders chained):
- Simple and small: 5N gates
- Slow: worst-case 2N gate delays (carry must ripple through all stages)
- Unsigned overflow = carry-out of MSB; signed overflow = carry-in ≠ carry-out at MSB

**Carry-lookahead adder** (G/P signals, parallel carry computation):
$$G_i = A_i B_i \\qquad P_i = A_i \\oplus B_i$$
$$C_{i+1} = G_i + P_i C_i$$
- All carries computed in ~4 gate delays, independent of bit width
- More complex but dramatically faster for wide operands
- 4-bit CLA blocks (74182) cascaded for wider adders

Adders are the foundation of every ALU. The same principles extend to subtractors (add the 2's complement), comparators (look at the carry and difference), and multipliers (repeated addition with shifting). The next lesson covers comparators and their relationship to the subtractor.`,
    },
  ],
};

export default {
  id: 'df-5-1-adders',
  slug: 'adders-half-full-ripple-cla',
  chapter: 'df.5',
  order: 1,
  title: 'Adders: Building Hardware That Adds',
  subtitle: 'From a single-bit half adder to a fast multi-bit carry-lookahead adder.',
  tags: ['digital', 'adder', 'half-adder', 'full-adder', 'ripple-carry', 'carry-lookahead', 'CLA', 'ALU', 'arithmetic'],
  hook: {
    question: 'Your CPU adds two 64-bit numbers in a single clock cycle at 3 GHz. A naive chain of single-bit adders would take 128 gate delays — far too slow. How does it actually work?',
    realWorldContext: 'Every ADD instruction, every memory address calculation, every loop counter increment passes through an adder. The carry-lookahead adder was one of the first major circuit innovations that made fast computing possible. The 74283 4-bit CLA adder IC is still in production.',
  },
  intuition: {
    prose: [
      'Half adder: Sum=A⊕B, Carry=A·B. One XOR, one AND. No carry-in.',
      'Full adder: Sum=A⊕B⊕Cin, Cout=(A·B)+(Cin·(A⊕B)). Three inputs, two outputs.',
      'Ripple-carry: N full adders chained. Simple but 2N gate delays worst-case.',
      'CLA: G=A·B, P=A⊕B. All carries in parallel in 4 gate delays regardless of width.',
    ],
    callouts: [
      { type: 'tip', title: 'Full adder from two half adders', body: 'HA1(A,B) → partial sum S1, carry C1. HA2(S1,Cin) → final Sum, carry C2. OR(C1,C2) → Cout. Modular construction from verified blocks.' },
      { type: 'important', title: 'Overflow detection', body: 'Unsigned overflow: Cout of MSB. Signed overflow: carry_into_MSB ≠ carry_out_of_MSB. Both come directly from the adder with no extra logic.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Adders', props: { lesson: LESSON_DF_5_1 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Sum bit = XOR of all inputs (parity). Carry = majority function of inputs.',
    'Chain N full adders: Cout[i] → Cin[i+1]. The carry ripples LSB→MSB.',
    'Ripple worst case: 0111...1 + 0000...1. Carry starts at bit 0, touches every stage.',
    'CLA: precompute G=AB and P=A⊕B for each bit. Then C1,C2,...,CN all in parallel.',
    'G/P abstraction: G means "I will generate carry". P means "I will pass carry through".',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};