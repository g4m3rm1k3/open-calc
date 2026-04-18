// Digital Fundamentals · Unit 5 · Lesson 3
// Multiplexers and Demultiplexers
// ScienceNotebook format

export const LESSON_DF_5_3 = {
  title: 'Multiplexers and Demultiplexers',
  subtitle: 'Digital switches that route data — the building blocks of buses, datapaths, and function generators.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Multiplexer: Many Inputs, One Output

A **multiplexer** (MUX) is a digital switch: it selects one of N input signals and routes it to a single output. The selection is controlled by **select lines** — binary inputs that act like an address, choosing which input passes through.

A 2-to-1 MUX has 2 data inputs, 1 select line, and 1 output:
$$F = A \\cdot \\bar{S} + B \\cdot S$$

When S=0, F=A. When S=1, F=B. The select line chooses the channel.

**General rule**: a MUX with N select lines has $2^N$ data inputs. Common sizes:
- 2-to-1: 1 select line (74HC157 — quad 2-to-1)
- 4-to-1: 2 select lines (74HC153 — dual 4-to-1)
- 8-to-1: 3 select lines (74HC151)
- 16-to-1: 4 select lines (74HC150)

**Gate implementation of a 2-to-1 MUX**:
One NOT gate (for $\\bar{S}$), two AND gates (one per input), one OR gate combining them. Total: 4 gates.

**Why MUXes matter**:
- **Data routing**: CPU datapaths use MUXes to select between ALU operands, register file outputs, and immediate values
- **Function generation**: an N-input MUX can implement any N-variable Boolean function by connecting data inputs to 0 or 1
- **Bus arbitration**: multiple devices sharing a bus use MUX logic to determine whose data drives the line
- **Serialisation**: convert parallel data to serial by cycling through the select inputs`,
    },

    // ── Visual 1 — 2-to-1 and 4-to-1 MUX ────────────────────────────────────
    {
      type: 'js',
      instruction: `### MUX in action: 2-to-1 and 4-to-1

Select the MUX size. Toggle data inputs and select lines — the active data channel highlights and its value passes to the output. The internal AND-OR structure is shown for the 2-to-1 view.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="tab-btn active" id="m2" onclick="setMux(2)">2-to-1 MUX</button>
    <button class="tab-btn"        id="m4" onclick="setMux(4)">4-to-1 MUX</button>
    <button class="tab-btn"        id="m8" onclick="setMux(8)">8-to-1 MUX</button>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="muxcv" width="360" height="260"></canvas>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Data inputs</div>
      <div id="dataInputs" style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px"></div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Select lines</div>
      <div id="selInputs" style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap"></div>
      <div id="muxOut" style="padding:10px 14px;border-radius:8px;border:1.5px solid;font-size:15px;font-weight:700;text-align:center"></div>
      <div id="muxNote" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.tab-btn.active{border-color:#38bdf8;background:rgba(56,189,248,0.1);color:#38bdf8}
.d-btn{padding:5px 12px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.3);font-family:monospace;font-size:12px;cursor:pointer;text-align:left}
.d-btn.active-ch{border-color:#38bdf8;background:rgba(56,189,248,0.1);color:#38bdf8}
.d-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.08);color:#4ade80}
.d-btn.active-ch.hi{border-color:#4ade80;background:rgba(74,222,128,0.15);color:#4ade80}
.s-btn{width:36px;height:36px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.3);font-family:monospace;font-size:14px;font-weight:700;cursor:pointer}
.s-btn.hi{border-color:#fbbf24;background:rgba(251,191,36,0.1);color:#fbbf24}`,
      startCode: `
var muxSize=2;
var dataVals=[0,1,0,1,0,1,0,1];
var selBits=[0,0,0];
var cv=document.getElementById('muxcv'),ctx=cv.getContext('2d');

function selIdx(){
  var s=selBits.slice(0,Math.log2(muxSize));
  return parseInt(s.join(''),2);
}

function drawMux2(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var sel=selIdx(), out=dataVals[sel];
  var A=dataVals[0],B=dataVals[1],S=selBits[0];
  var nS=S?0:1, andA=A&nS, andB=B&S;

  function wire(x1,y1,x2,y2,v){
    ctx.strokeStyle=v?'#4ade80':'#475569';ctx.lineWidth=v?2.5:1.5;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function dot(x,y,v){ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);ctx.fillStyle=v?'#4ade80':'#475569';ctx.fill();}
  function notG(x,y,w,h,col,act){
    ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
    ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.lineTo(x+w-14,y+h/2);ctx.lineTo(x+4,y+h-4);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(x+w-9,y+h/2,5,0,2*Math.PI);ctx.fillStyle=act?col+'44':'#0d1527';ctx.fill();ctx.stroke();
  }
  function andG(x,y,w,h,col,act){
    ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
    ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.lineTo(x+w/2-4,y+4);
    ctx.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
    ctx.lineTo(x+4,y+h-4);ctx.closePath();ctx.fill();ctx.stroke();
  }
  function orG(x,y,w,h,col,act){
    ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
    ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.quadraticCurveTo(x+w/2-10,y+h/2,x+4,y+h-4);
    ctx.quadraticCurveTo(x+w/2,y+h,x+w-14,y+h/2);ctx.quadraticCurveTo(x+w/2,y,x+4,y+4);
    ctx.fill();ctx.stroke();
  }

  var gw=60,gh=44;
  var notX=50,notY=H/2-gh/2-10;
  var and1X=140,and1Y=30,and2X=140,and2Y=160;
  var orX=250,orY=H/2-gh/2;

  // S line
  wire(20,H/2,notX,notY+gh/2,S);
  dot(20,H/2,S);
  wire(20,H/2,20,and2Y+gh*0.7,S);
  wire(20,and2Y+gh*0.7,and2X,and2Y+gh*0.7,S);
  ctx.fillStyle=S?'#fbbf24':'rgba(251,191,36,0.4)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('S='+S,18,H/2+4);

  // NOT gate
  notG(notX,notY,gw,gh,'#fbbf24',!S);
  ctx.fillStyle='#fbbf24';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('NOT',notX+gw/2,notY-6);
  wire(notX+gw,notY+gh/2,and1X,and1Y+gh*0.7,!S);

  // A input
  wire(14,and1Y+gh*0.3,and1X,and1Y+gh*0.3,A);
  ctx.fillStyle=A?'#4ade80':'rgba(74,222,128,0.3)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('A='+A,12,and1Y+gh*0.3+4);

  // AND1
  andG(and1X,and1Y,gw,gh,'#0891b2',!!andA);
  ctx.fillStyle='#0891b2';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('AND',and1X+gw/2,and1Y-6);
  wire(and1X+gw,and1Y+gh/2,orX,orY+gh*0.3,!!andA);

  // B input
  wire(14,and2Y+gh*0.3,and2X,and2Y+gh*0.3,B);
  ctx.fillStyle=B?'#4ade80':'rgba(74,222,128,0.3)';ctx.textAlign='right';
  ctx.fillText('B='+B,12,and2Y+gh*0.3+4);

  // AND2
  andG(and2X,and2Y,gw,gh,'#7c3aed',!!andB);
  ctx.fillStyle='#7c3aed';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('AND',and2X+gw/2,and2Y-6);
  wire(and2X+gw,and2Y+gh/2,orX,orY+gh*0.7,!!andB);

  // OR
  orG(orX,orY,gw,gh,'#38bdf8',!!out);
  ctx.fillStyle='#38bdf8';ctx.font='bold 9px monospace';ctx.textAlign='center';
  ctx.fillText('OR',orX+gw/2,orY-6);
  wire(orX+gw,orY+gh/2,W-16,orY+gh/2,!!out);
  ctx.fillStyle=out?'#4ade80':'#475569';ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText('F='+out,W-14,orY+gh/2+4);

  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('F = A·S̄ + B·S = '+(S?'B':'A')+'='+out,W/2,H-8);
}

function drawMuxBox(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var n=muxSize, selN=Math.log2(n), sel=selIdx(), out=dataVals[sel];
  var bx=W/2-50,by=20,bw=100,bh=H-60;

  // Box
  ctx.fillStyle='rgba(56,189,248,0.06)';ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#38bdf8';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText(n+'-to-1',bx+bw/2,by+16);ctx.fillText('MUX',bx+bw/2,by+28);

  // Data input wires
  var spacing=bh/(n+1);
  for(var i=0;i<n;i++){
    var wy=by+spacing*(i+1);
    var isActive=i===sel;
    var col=isActive?'#38bdf8':dataVals[i]?'#4ade80':'#475569';
    ctx.strokeStyle=col;ctx.lineWidth=isActive?2.5:1.5;
    ctx.beginPath();ctx.moveTo(20,wy);ctx.lineTo(bx,wy);ctx.stroke();
    ctx.fillStyle=isActive?'#38bdf8':dataVals[i]?'#4ade80':'rgba(255,255,255,0.3)';
    ctx.font=(isActive?'bold ':'')+'10px monospace';ctx.textAlign='right';
    ctx.fillText('D'+i+'='+dataVals[i],18,wy+4);
    // Channel label on box
    ctx.fillStyle=isActive?'#38bdf8':'rgba(255,255,255,0.15)';
    ctx.font='9px monospace';ctx.textAlign='left';
    ctx.fillText(isActive?'→':'  ',bx+4,wy+4);
  }

  // Output wire
  var outY=by+bh/2;
  ctx.strokeStyle=out?'#4ade80':'#475569';ctx.lineWidth=out?2.5:1.5;
  ctx.beginPath();ctx.moveTo(bx+bw,outY);ctx.lineTo(W-16,outY);ctx.stroke();
  ctx.fillStyle=out?'#4ade80':'#475569';ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText('F='+out,W-14,outY+4);

  // Select lines (bottom)
  for(var s=0;s<selN;s++){
    var sx=bx+bw/2+(s-selN/2+0.5)*22;
    var sv=selBits[selN-1-s];
    ctx.strokeStyle=sv?'#fbbf24':'rgba(251,191,36,0.3)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(sx,by+bh);ctx.lineTo(sx,by+bh+20);ctx.stroke();
    ctx.fillStyle=sv?'#fbbf24':'rgba(251,191,36,0.4)';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('S'+(selN-1-s)+'='+sv,sx,by+bh+32);
  }
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Selecting channel D'+sel+' (binary '+selBits.slice(0,selN).join('')+')',W/2,H-8);
}

function buildControls(){
  var n=muxSize, selN=Math.log2(n);
  // Data buttons
  var dd=document.getElementById('dataInputs');dd.innerHTML='';
  for(var i=0;i<n;i++){
    var btn=document.createElement('button');
    var active=i===selIdx();
    btn.className='d-btn'+(active?' active-ch':'')+(dataVals[i]?' hi':'');
    btn.textContent='D'+i+' = '+dataVals[i]+(active?' ← selected':'');
    (function(idx){btn.onclick=function(){dataVals[idx]^=1;refresh();};})(i);
    dd.appendChild(btn);
  }
  // Select buttons
  var sd=document.getElementById('selInputs');sd.innerHTML='';
  for(var s=0;s<selN;s++){
    var btn2=document.createElement('button');
    btn2.className='s-btn'+(selBits[s]?' hi':'');
    btn2.textContent='S'+s+'='+selBits[s];
    btn2.style.width='56px';
    (function(idx){btn2.onclick=function(){selBits[idx]^=1;refresh();};})(s);
    sd.appendChild(btn2);
  }
}

function refresh(){
  var sel=selIdx(), out=dataVals[sel];
  buildControls();
  if(muxSize===2) drawMux2(); else drawMuxBox();
  var ob=document.getElementById('muxOut');
  ob.textContent='Output F = D'+sel+' = '+out;
  ob.style.borderColor=out?'#4ade80':'#475569';
  ob.style.color=out?'#4ade80':'#475569';
  ob.style.background=out?'rgba(74,222,128,0.06)':'rgba(255,255,255,0.03)';
  var selN=Math.log2(muxSize);
  document.getElementById('muxNote').textContent=
    muxSize+'-to-1 MUX. Select = '+selBits.slice(0,selN).join('')+'b = '+sel+' → D'+sel+' = '+out+
    '. '+muxSize+' data inputs, '+selN+' select line'+(selN>1?'s':'')+'.';
}

function setMux(n){
  muxSize=n;
  ['m2','m4','m8'].forEach(function(id,i){
    document.getElementById(id).className='tab-btn'+([2,4,8][i]===n?' active':'');
  });
  refresh();
}
window.setMux=setMux;
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 4-to-1 MUX has data inputs D0=1, D1=0, D2=1, D3=0 and select inputs S1=1, S0=0. Which data input is selected and what is the output?`,
      options: [
        { label: 'A', text: 'D1 is selected, output = 0' },
        { label: 'B', text: 'D2 is selected, output = 1 — S1S0 = 10 binary = 2 decimal' },
        { label: 'C', text: 'D3 is selected, output = 0 — S1S0 = 10 binary = 3?' },
        { label: 'D', text: 'D0 is selected, output = 1 — S=0 always selects D0' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. The select lines S1S0 form a 2-bit address. S1=1, S0=0 → binary 10 → decimal 2. Channel 2 (D2) is selected. D2=1, so output F=1.',
      failMessage: 'The select lines form a binary address: S1 is the MSB, S0 is the LSB. S1=1, S0=0 → 10 binary → 2 decimal → D2 is selected. D2=1, so F=1.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### MUX as a Function Generator

One of the most elegant applications of a MUX is implementing arbitrary Boolean functions. An N-select-line MUX can implement **any** Boolean function of N variables by simply wiring the data inputs to 0 or 1.

**How it works**: a 4-to-1 MUX with select lines connected to variables A and B has four channels corresponding to the four input combinations (AB=00, 01, 10, 11). These are exactly the four rows of the 2-variable truth table. Connecting each data input to the desired output for that row implements the function:

| A | B | Channel | Connect D to |
|---|---|---------|-------------|
| 0 | 0 |   D0    | F(0,0)       |
| 0 | 1 |   D1    | F(0,1)       |
| 1 | 0 |   D2    | F(1,0)       |
| 1 | 1 |   D3    | F(1,1)       |

**Example — XOR(A,B)**: truth table gives 0,1,1,0 → connect D0=0, D1=1, D2=1, D3=0.

**Extension to N+1 variables**: an $2^N$-to-1 MUX can implement any function of **N+1 variables** by connecting select lines to N variables and tying data inputs to the (N+1)th variable or its complement as needed. This was historically important when MUX ICs were cheaper than random logic.

**Modern relevance**: FPGAs (Field Programmable Gate Arrays) implement their logic cells as lookup tables (LUTs) — essentially MUXes with all inputs programmable as 0 or 1. A 6-input LUT is a 64-to-1 MUX whose 64 data inputs store the desired truth table. Every function in an FPGA is ultimately a programmed MUX.`,
    },

    // ── Visual 2 — MUX as function generator ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Program a MUX to implement any 2-variable function

Click the data input cells to set them to 0 or 1. The MUX implements the Boolean function defined by those four values. The truth table on the right shows the function, and the expression below identifies it.`,
      html: `<div style="padding:14px">
  <div style="margin-bottom:10px;font-size:11px;color:rgba(255,255,255,0.35)">Click D0–D3 to toggle. The MUX computes the function defined by those four bits.</div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <canvas id="fgcv" width="280" height="260"></canvas>
    </div>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Presets</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px" id="presets"></div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Function implemented</div>
      <div id="fgExpr" style="font-size:14px;font-weight:600;color:#38bdf8;min-height:20px;margin-bottom:6px"></div>
      <div id="fgTT" style="font-size:12px;line-height:2;color:rgba(255,255,255,0.5)"></div>
      <div id="fgNote" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;cursor:pointer}
.pre-btn{padding:4px 9px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.pre-btn:hover{background:rgba(255,255,255,0.06)}`,
      startCode: `
var D=[0,1,1,0]; // XOR by default
var cv=document.getElementById('fgcv'),ctx=cv.getContext('2d');

var PRESETS=[
  {name:'AND',  d:[0,0,0,1]},
  {name:'OR',   d:[0,1,1,1]},
  {name:'XOR',  d:[0,1,1,0]},
  {name:'XNOR', d:[1,0,0,1]},
  {name:'NAND', d:[1,1,1,0]},
  {name:'NOR',  d:[1,0,0,0]},
  {name:'A',    d:[0,0,1,1]},
  {name:'B',    d:[0,1,0,1]},
  {name:'All 0',d:[0,0,0,0]},
  {name:'All 1',d:[1,1,1,1]},
];

var FUNC_NAMES={
  '0000':'0 (always false)',
  '0001':'A\u00b7B (AND)',
  '0010':'A\u00b7B\u0305 (A AND NOT B)',
  '0011':'A (pass A)',
  '0100':'A\u0305\u00b7B (NOT A AND B)',
  '0101':'B (pass B)',
  '0110':'A\u2295B (XOR)',
  '0111':'A+B (OR)',
  '1000':'A\u0305\u00b7B\u0305 (NOR)',  // corrected: NOR = NOT(A+B)
  '1001':'\u0305A\u2295\u0305B\u0305 (XNOR)',
  '1010':'B\u0305 (NOT B)',
  '1011':'A+B\u0305',
  '1100':'A\u0305 (NOT A)',
  '1101':'A\u0305+B',
  '1110':'\u0305A\u0305\u0305\u00b7\u0305B\u0305 (NAND)',
  '1111':'1 (always true)',
};

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var bx=100,by=20,bw=80,bh=200;
  ctx.fillStyle='rgba(56,189,248,0.06)';ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#38bdf8';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('4-to-1',bx+bw/2,by+16);ctx.fillText('MUX',bx+bw/2,by+28);

  var spacing=bh/5;
  D.forEach(function(v,i){
    var wy=by+spacing*(i+1);
    // Clickable cells
    ctx.fillStyle=v?'rgba(56,189,248,0.15)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=v?'#38bdf8':'rgba(255,255,255,0.1)';ctx.lineWidth=v?1.5:0.5;
    ctx.beginPath();ctx.roundRect(10,wy-10,70,22,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=v?'#38bdf8':'rgba(255,255,255,0.3)';
    ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillText('D'+i+' = '+v,45,wy+5);
    // Wire
    ctx.strokeStyle=v?'#38bdf8':'rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(80,wy);ctx.lineTo(bx,wy);ctx.stroke();
  });

  // Select lines
  ctx.fillStyle='rgba(251,191,36,0.6)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('S1=A',bx+bw/2-16,by+bh+18);
  ctx.fillText('S0=B',bx+bw/2+16,by+bh+18);
  ctx.strokeStyle='rgba(251,191,36,0.4)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(bx+bw/2-16,by+bh);ctx.lineTo(bx+bw/2-16,by+bh+8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx+bw/2+16,by+bh);ctx.lineTo(bx+bw/2+16,by+bh+8);ctx.stroke();

  // Output
  ctx.strokeStyle='#4ade80';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(bx+bw,by+bh/2);ctx.lineTo(W-16,by+bh/2);ctx.stroke();
  ctx.fillStyle='#4ade80';ctx.font='bold 12px monospace';ctx.textAlign='left';
  ctx.fillText('F(A,B)',W-14,by+bh/2+4);
}

canvas.addEventListener=undefined; // use click instead
cv.onclick=function(e){
  var rect=cv.getBoundingClientRect();
  var my=(e.clientY-rect.top)*(cv.height/rect.height);
  var bh=200,by=20,spacing=200/5;
  for(var i=0;i<4;i++){
    var wy=by+spacing*(i+1);
    if(my>=wy-12&&my<=wy+12){D[i]^=1;refresh();break;}
  }
};

function updateInfo(){
  var key=D.join('');
  document.getElementById('fgExpr').textContent='F = '+(FUNC_NAMES[key]||key);
  var tt='';
  [[0,0],[0,1],[1,0],[1,1]].forEach(function(ab,i){
    tt+='A='+ab[0]+' B='+ab[1]+' \u2192 D'+i+'='+D[i]+'\n';
  });
  document.getElementById('fgTT').innerHTML=
    [[0,0],[0,1],[1,0],[1,1]].map(function(ab,i){
      return '<span style="color:rgba(255,255,255,0.3)">A='+ab[0]+' B='+ab[1]+' → </span>'+
        '<span style="color:'+(D[i]?'#38bdf8':'#475569')+'">D'+i+'='+D[i]+'</span>';
    }).join('<br>');
  var ones=D.filter(function(v){return v;}).length;
  document.getElementById('fgNote').textContent=
    'This MUX implements any of the 16 possible 2-variable Boolean functions just by changing D0–D3. '+
    'Currently '+ones+' out of 4 rows are 1. FPGAs use this principle: a 6-input LUT is a 64-to-1 MUX.';
}

function refresh(){draw();updateInfo();}

var pr=document.getElementById('presets');
PRESETS.forEach(function(p){
  var b=document.createElement('button');
  b.className='pre-btn';b.textContent=p.name;
  b.onclick=function(){D=p.d.slice();refresh();};
  pr.appendChild(b);
});
refresh();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `To implement the function F = A·B using a 4-to-1 MUX with S1=A and S0=B, what values should D0, D1, D2, D3 be set to?`,
      options: [
        { label: 'A', text: 'D0=0, D1=0, D2=0, D3=1 — AND is only 1 when both A=1 and B=1 (channel 3)' },
        { label: 'B', text: 'D0=1, D1=1, D2=1, D3=0 — NAND wiring' },
        { label: 'C', text: 'D0=0, D1=1, D2=1, D3=0 — XOR wiring' },
        { label: 'D', text: 'D0=0, D1=0, D2=1, D3=1 — A is 1 for channels 2 and 3' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. AND truth table: (0,0)→0, (0,1)→0, (1,0)→0, (1,1)→1. Channel D0 corresponds to A=0,B=0 → F=0. D1 → A=0,B=1 → F=0. D2 → A=1,B=0 → F=0. D3 → A=1,B=1 → F=1. So D=[0,0,0,1].',
      failMessage: 'Map the AND truth table to MUX channels: S1=A, S0=B. Channel 0 (A=0,B=0): AND=0 → D0=0. Channel 1 (A=0,B=1): AND=0 → D1=0. Channel 2 (A=1,B=0): AND=0 → D2=0. Channel 3 (A=1,B=1): AND=1 → D3=1.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Demultiplexer: One Input, Many Outputs

A **demultiplexer** (DEMUX) is the inverse of a MUX. It takes one data input and routes it to one of $2^N$ outputs, selected by N select lines. All unselected outputs are 0 (or held at a default).

$$Y_i = D \\cdot (\\text{select} = i)$$

The selected output follows the data input; all others are 0.

**1-to-2 DEMUX** (1 select line):
$$Y_0 = D \\cdot \\bar{S} \\qquad Y_1 = D \\cdot S$$

**1-to-4 DEMUX** (2 select lines):
$$Y_0 = D \\cdot \\bar{S_1} \\cdot \\bar{S_0} \\qquad Y_1 = D \\cdot \\bar{S_1} \\cdot S_0 \\qquad Y_2 = D \\cdot S_1 \\cdot \\bar{S_0} \\qquad Y_3 = D \\cdot S_1 \\cdot S_0$$

**The DEMUX-as-decoder trick**: if the data input D is held permanently at 1, the DEMUX becomes a **binary decoder** — it activates exactly one output based on the select address. This is how memory and I/O address decoding works: the address lines are the select inputs, and the active output enables the selected device.

**MUX + DEMUX = data bus**: a MUX at the transmitter selects which signal to send over a shared wire, and a DEMUX at the receiver routes the signal to the correct destination. This is the conceptual basis for time-division multiplexing (TDM) in communications.`,
    },

    // ── Visual 3 — DEMUX interactive ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### DEMUX: routing one input to one of many outputs

Toggle the data input and select lines. The data value propagates to exactly one output — all others remain 0. Then set D=1 permanently to see the DEMUX act as a decoder.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="tab-btn active" id="dx2" onclick="setDemux(2)">1-to-2</button>
    <button class="tab-btn"        id="dx4" onclick="setDemux(4)">1-to-4</button>
    <button class="tab-btn"        id="dx8" onclick="setDemux(8)">1-to-8</button>
  </div>
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="dxD" class="inp-btn">D = 0</button>
    <div style="display:flex;gap:5px" id="dxSel"></div>
    <div style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.3)">Active output: <span id="dxActive" style="color:#38bdf8;font-weight:700">Y0</span></div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="dxcv" width="320" height="260"></canvas>
    <div style="flex:1;min-width:180px">
      <div id="dxOutputs" style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px"></div>
      <div id="dxNote" style="font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.tab-btn.active{border-color:#4ade80;background:rgba(74,222,128,0.08);color:#4ade80}
.inp-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.s-btn{width:52px;height:32px;border-radius:6px;border:1.5px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.04);color:rgba(251,191,36,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.s-btn.hi{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}
.y-row{padding:4px 10px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.08);font-size:12px;font-family:monospace;color:rgba(255,255,255,0.25)}
.y-row.active{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80;font-weight:700}`,
      startCode: `
var dxSize=4, dxD=0, dxSel=[0,0,0];
var cv=document.getElementById('dxcv'),ctx=cv.getContext('2d');

function selIdx2(){
  var n=Math.log2(dxSize);
  return parseInt(dxSel.slice(0,n).join(''),2);
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var n=dxSize, selN=Math.log2(n), active=selIdx2();
  var bx=90,by=20,bw=80,bh=H-60;

  ctx.fillStyle='rgba(74,222,128,0.05)';ctx.strokeStyle='#4ade80';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#4ade80';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('1-to-'+n,bx+bw/2,by+16);ctx.fillText('DEMUX',bx+bw/2,by+28);

  // Data input
  ctx.strokeStyle=dxD?'#4ade80':'#475569';ctx.lineWidth=dxD?2.5:1.5;
  ctx.beginPath();ctx.moveTo(16,by+bh/2);ctx.lineTo(bx,by+bh/2);ctx.stroke();
  ctx.fillStyle=dxD?'#4ade80':'#f87171';ctx.font='500 11px monospace';ctx.textAlign='right';
  ctx.fillText('D='+dxD,14,by+bh/2+4);

  // Output wires
  var spacing=bh/(n+1);
  for(var i=0;i<n;i++){
    var wy=by+spacing*(i+1);
    var isActive=i===active, yVal=isActive?dxD:0;
    ctx.strokeStyle=yVal?'#4ade80':isActive?'rgba(74,222,128,0.2)':'#2a3a50';
    ctx.lineWidth=yVal?2.5:1;
    ctx.beginPath();ctx.moveTo(bx+bw,wy);ctx.lineTo(W-16,wy);ctx.stroke();
    ctx.fillStyle=yVal?'#4ade80':isActive?'rgba(74,222,128,0.4)':'rgba(255,255,255,0.2)';
    ctx.font=(isActive?'bold ':'')+'10px monospace';ctx.textAlign='left';
    ctx.fillText('Y'+i+'='+yVal,W-14,wy+4);
    // Arrow marker on active
    if(isActive){
      ctx.fillStyle='rgba(74,222,128,0.2)';
      ctx.beginPath();ctx.moveTo(bx+bw+2,wy-6);ctx.lineTo(bx+bw+14,wy);ctx.lineTo(bx+bw+2,wy+6);ctx.fill();
    }
  }

  // Select lines
  for(var s=0;s<selN;s++){
    var sx=bx+bw/2+(s-selN/2+0.5)*18;
    ctx.strokeStyle=dxSel[selN-1-s]?'#fbbf24':'rgba(251,191,36,0.3)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(sx,by+bh);ctx.lineTo(sx,by+bh+20);ctx.stroke();
    ctx.fillStyle=dxSel[selN-1-s]?'#fbbf24':'rgba(251,191,36,0.4)';
    ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('S'+(selN-1-s)+'='+dxSel[selN-1-s],sx,by+bh+32);
  }

  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Select='+dxSel.slice(0,selN).join('')+'b → Y'+active,W/2,H-8);
}

function buildControls(){
  var n=dxSize, selN=Math.log2(n), active=selIdx2();
  // Data button
  var db=document.getElementById('dxD');
  db.textContent='D = '+dxD;db.className='inp-btn'+(dxD?' hi':'');
  // Select buttons
  var sd=document.getElementById('dxSel');sd.innerHTML='';
  for(var s=0;s<selN;s++){
    var btn=document.createElement('button');
    btn.className='s-btn'+(dxSel[s]?' hi':'');
    btn.textContent='S'+s+'='+dxSel[s];
    (function(idx){btn.onclick=function(){dxSel[idx]^=1;refresh2();};})(s);
    sd.appendChild(btn);
  }
  // Output list
  var od=document.getElementById('dxOutputs');od.innerHTML='';
  for(var i=0;i<n;i++){
    var yVal=i===active?dxD:0;
    var div=document.createElement('div');
    div.className='y-row'+(i===active?' active':'');
    div.textContent='Y'+i+' = '+yVal+(i===active?' ← selected':'');
    od.appendChild(div);
  }
  document.getElementById('dxActive').textContent='Y'+active;
}

function refresh2(){
  buildControls();draw();
  var n=dxSize, selN=Math.log2(n), active=selIdx2();
  document.getElementById('dxNote').textContent=
    '1-to-'+n+' DEMUX. D='+dxD+', select='+dxSel.slice(0,selN).join('')+'b → Y'+active+
    '='+dxD+'. All other outputs = 0. '+
    (dxD===1?'With D=1, this acts as a binary decoder — exactly one output is HIGH.':
    'Try setting D=1 to use as a decoder.');
}

function setDemux(n){
  dxSize=n;
  ['dx2','dx4','dx8'].forEach(function(id,i){
    document.getElementById(id).className='tab-btn'+([2,4,8][i]===n?' active':'');
  });
  refresh2();
}
document.getElementById('dxD').onclick=function(){dxD^=1;refresh2();};
window.setDemux=setDemux;
refresh2();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 1-to-4 DEMUX has its data input D tied permanently to 1 and select inputs S1=1, S0=0. Which output is HIGH and what is this circuit acting as?`,
      options: [
        { label: 'A', text: 'Y0=1, acting as a NOT gate' },
        { label: 'B', text: 'Y2=1, acting as a 2-to-4 binary decoder — exactly one output active per address' },
        { label: 'C', text: 'All outputs=1, because D=1 drives all channels' },
        { label: 'D', text: 'Y3=1, S1S0=10 selects channel 3' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. S1=1, S0=0 → binary 10 → decimal 2 → Y2 is selected. D=1, so Y2=1. All others=0. With D permanently 1, the DEMUX activates exactly one output per address — that is the definition of a binary decoder. Used for memory chip select and I/O port enable.',
      failMessage: 'S1=1, S0=0 → 10 binary → 2 decimal → Y2 is selected. D=1 means the selected output is 1. All other outputs are 0. When D is held at 1, only the addressed output is ever HIGH — this is a 2-to-4 binary decoder. S1S0=10 means channel 2, not channel 3.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### MUX Trees and Real ICs

When you need a large MUX but only have smaller ones, you can build a **MUX tree** — multiple stages of MUXes. For example, an 8-to-1 MUX from four 2-to-1 MUXes:

- **Stage 1** (4× 2-to-1 MUXes): each selects one of its two data inputs using S0
- **Stage 2** (2× 2-to-1 MUXes): each selects from two Stage-1 outputs using S1
- **Stage 3** (1× 2-to-1 MUX): final selection using S2

The three select lines S2, S1, S0 together form a 3-bit address selecting one of 8 inputs.

**Real ICs**:

| Part | Description |
|------|-------------|
| 74HC151 | 8-to-1 MUX, 3 select lines, active-high output + complement |
| 74HC153 | Dual 4-to-1 MUX, separate enables |
| 74HC157 | Quad 2-to-1 MUX (4 independent channels sharing select) |
| 74HC138 | 3-to-8 decoder/DEMUX, active-low outputs |
| 74HC139 | Dual 2-to-4 decoder/DEMUX |

The **74HC138** (3-to-8 decoder) is worth special mention: it has three enable inputs (G1 active-high, G2A and G2B active-low), which allow multiple 74HC138s to be cascaded to build 4-to-16 or larger decoders. The enable inputs are gated by additional address bits — a 4-to-16 decoder uses one address bit to enable one of two 74HC138s.

**FPGA LUTs revisited**: modern FPGAs implement 4–6 input LUTs as small SRAM-backed MUX trees. A 4-input LUT is essentially a 16-to-1 MUX where all 16 data inputs are stored in SRAM cells programmed during configuration. This is why FPGAs can implement any combinational function — the LUT programs any truth table.`,
    },

    // ── Visual 4 — MUX tree and real IC comparison ────────────────────────────
    {
      type: 'js',
      instruction: `### MUX tree: building an 8-to-1 from 2-to-1 stages

Adjust all three select lines and a data input pattern. The tree propagates the selection stage by stage, each stage halving the candidates. The highlighted path shows which channel wins.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <div style="font-size:11px;color:rgba(255,255,255,0.35)">Select (S2 S1 S0):</div>
    <button id="ts2" class="s-btn">S2=0</button>
    <button id="ts1" class="s-btn">S1=0</button>
    <button id="ts0" class="s-btn">S0=0</button>
    <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:8px">→ Channel <span id="tChan" style="color:#38bdf8;font-weight:700">D0</span></div>
  </div>
  <div style="margin-bottom:10px;display:flex;gap:5px;flex-wrap:wrap" id="tDataBtns"></div>
  <canvas id="treecv" width="520" height="260"></canvas>
  <div id="treeNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.s-btn{padding:5px 10px;border-radius:6px;border:1.5px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.04);color:rgba(251,191,36,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.s-btn.hi{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}
.d-sml{padding:3px 8px;border-radius:5px;border:0.5px solid rgba(56,189,248,0.2);background:transparent;color:rgba(56,189,248,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.d-sml.hi{border-color:#38bdf8;background:rgba(56,189,248,0.12);color:#38bdf8}`,
      startCode: `
var tS=[0,0,0]; // S2 S1 S0
var tD=[0,1,0,1,1,0,1,0];
var cv=document.getElementById('treecv'),ctx=cv.getContext('2d');

function selChan(){return parseInt(tS.join(''),2);}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var ch=selChan(), out=tD[ch];

  // Layout: 8 inputs left → 4 mux stage → 2 mux stage → 1 mux → output
  // Columns at x = 40(inputs), 140(stage1), 260(stage2), 370(stage3), 440(out)
  var cols=[40,130,240,350];
  var boxW=60,boxH=36;

  // Determine which nodes are on the active path
  // Stage 1: 4 muxes, each takes 2 consecutive inputs, selects by S0
  // Stage 2: 2 muxes, each takes 2 stage-1 outputs, selects by S1
  // Stage 3: 1 mux, takes 2 stage-2 outputs, selects by S2

  var s0=tS[2],s1=tS[1],s2=tS[0];
  // Stage 1 outputs
  var st1=[tD[s0],tD[2+s0],tD[4+s0],tD[6+s0]];
  // Stage 2 outputs
  var st2=[st1[s1*2],st1[s1*2+1]];
  // Final
  var final2=st2[s2];

  // Which mux in each stage is on the active path?
  var activeSt1=Math.floor(ch/2); // which of 4 muxes in stage 1
  var activeSt2=Math.floor(ch/4); // which of 2 muxes in stage 2

  function drawMuxBox(x,y,w,h,col,isActive,label){
    ctx.fillStyle=isActive?col+'22':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=isActive?col:'rgba(255,255,255,0.1)';
    ctx.lineWidth=isActive?2:0.5;
    ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=isActive?col:'rgba(255,255,255,0.2)';
    ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText(label,x+w/2,y+h/2+4);
  }

  function drawWire(x1,y1,x2,y2,active,val){
    ctx.strokeStyle=active?(val?'#4ade80':'#475569'):'rgba(255,255,255,0.1)';
    ctx.lineWidth=active?2:0.5;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }

  // Draw 8 input labels
  var inputSpacing=(H-20)/8;
  for(var i=0;i<8;i++){
    var iy=14+i*inputSpacing;
    var isActive2=(i===ch);
    ctx.fillStyle=isActive2?'#38bdf8':(tD[i]?'#4ade80':'rgba(255,255,255,0.2)');
    ctx.font=(isActive2?'bold ':'')+'10px monospace';ctx.textAlign='right';
    ctx.fillText('D'+i+'='+tD[i],cols[0]-2,iy+4);
    drawWire(cols[0],iy,cols[1]-boxW/2,14+(Math.floor(i/2))*inputSpacing*2+inputSpacing,isActive2,tD[i]);
  }

  // Stage 1: 4 muxes
  for(var m=0;m<4;m++){
    var my=14+m*inputSpacing*2;
    var isAct=m===activeSt1;
    drawMuxBox(cols[1]-boxW/2,my,boxW,boxH,'#38bdf8',isAct,'MUX');
    ctx.fillStyle=isAct?'rgba(251,191,36,0.6)':'rgba(255,255,255,0.1)';
    ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('S0='+s0,cols[1],my+boxH+8);
    drawWire(cols[1]+boxW/2,my+boxH/2,cols[2]-boxW/2,14+(Math.floor(m/2))*inputSpacing*4+inputSpacing*2,isAct,st1[m]);
  }

  // Stage 2: 2 muxes
  for(var m=0;m<2;m++){
    var my=14+m*inputSpacing*4+inputSpacing;
    var isAct=m===activeSt2;
    drawMuxBox(cols[2]-boxW/2,my,boxW,boxH,'#818cf8',isAct,'MUX');
    ctx.fillStyle=isAct?'rgba(251,191,36,0.6)':'rgba(255,255,255,0.1)';
    ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('S1='+s1,cols[2],my+boxH+8);
    drawWire(cols[2]+boxW/2,my+boxH/2,cols[3]-boxW/2,H/2-boxH/2+boxH/2,isAct,st2[m]);
  }

  // Stage 3: 1 mux
  drawMuxBox(cols[3]-boxW/2,H/2-boxH/2,boxW,boxH,'#fbbf24',true,'MUX');
  ctx.fillStyle='rgba(251,191,36,0.7)';ctx.font='8px monospace';ctx.textAlign='center';
  ctx.fillText('S2='+s2,cols[3],H/2+boxH/2+8);
  drawWire(cols[3]+boxW/2,H/2,W-14,H/2,true,!!final2);
  ctx.fillStyle=final2?'#4ade80':'#475569';ctx.font='bold 13px monospace';ctx.textAlign='left';
  ctx.fillText('F='+final2,W-12,H/2+4);

  document.getElementById('tChan').textContent='D'+ch;
  document.getElementById('treeNote').textContent=
    'Select S2S1S0='+tS.join('')+'b = '+ch+' → D'+ch+'='+tD[ch]+
    '. Stage 1 uses S0 ('+s0+') to halve from 8→4 candidates. Stage 2 uses S1 ('+s1+') → 4→2. Stage 3 uses S2 ('+s2+') → 2→1.';
}

function buildDataBtns(){
  var db=document.getElementById('tDataBtns');db.innerHTML='';
  for(var i=0;i<8;i++){
    var btn=document.createElement('button');
    btn.className='d-sml'+(tD[i]?' hi':'');
    btn.textContent='D'+i+'='+tD[i];
    (function(idx){btn.onclick=function(){tD[idx]^=1;refresh3();};})(i);
    db.appendChild(btn);
  }
}

function refresh3(){
  buildDataBtns();draw();
  ['ts2','ts1','ts0'].forEach(function(id,i){
    document.getElementById(id).textContent='S'+i+'='+tS[i];
    document.getElementById(id).className='s-btn'+(tS[i]?' hi':'');
  });
}

['ts2','ts1','ts0'].forEach(function(id,i){
  document.getElementById(id).onclick=function(){tS[i]^=1;refresh3();};
});
refresh3();`,
      outputHeight: 400,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `How many 2-to-1 MUX gates are needed to build a 16-to-1 MUX tree, and how many select lines does it require?`,
      options: [
        { label: 'A', text: '8 MUXes, 3 select lines' },
        { label: 'B', text: '15 MUXes, 4 select lines — a perfect binary tree of depth 4' },
        { label: 'C', text: '16 MUXes, 4 select lines — one per input' },
        { label: 'D', text: '8 MUXes, 4 select lines' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. A 16-to-1 MUX tree: Stage 1: 8 × 2-to-1 MUXes (16→8). Stage 2: 4 × 2-to-1 (8→4). Stage 3: 2 × 2-to-1 (4→2). Stage 4: 1 × 2-to-1 (2→1). Total: 8+4+2+1 = 15 MUXes. 4 select lines (S3,S2,S1,S0) to address 16=2⁴ channels.',
      failMessage: 'A 16-to-1 MUX tree is a binary tree. Level 1: 8 MUXes (16→8). Level 2: 4 MUXes (8→4). Level 3: 2 MUXes (4→2). Level 4: 1 MUX (2→1). Total = 8+4+2+1 = 15 MUXes. Select lines: log₂(16) = 4 lines to address 16 channels.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Multiplexers and Demultiplexers

**Multiplexer (MUX)**: selects one of $2^N$ data inputs and routes it to a single output. N select lines act as a binary address.
$$F = \\sum_{i=0}^{2^N-1} D_i \\cdot m_i(S)$$
where $m_i(S)$ is the minterm of the select lines corresponding to channel i.

**MUX as function generator**: connect select lines to input variables, wire data inputs to the desired truth table values. Any N-variable function from a $2^N$-to-1 MUX. This is the principle behind FPGA LUTs.

**Demultiplexer (DEMUX)**: routes one data input to one of $2^N$ outputs. With D=1, acts as a binary decoder — exactly one output HIGH per address.

**MUX tree**: chain 2-to-1 MUXes in a binary tree. A $2^N$-to-1 MUX tree uses $2^N - 1$ two-input MUXes and N select lines.

**Key ICs**:
- 74HC151: 8-to-1 MUX
- 74HC153: dual 4-to-1 MUX
- 74HC138: 3-to-8 decoder (DEMUX with D=1), cascadable
- 74HC157: quad 2-to-1 MUX (4 parallel channels)

**MUX + DEMUX as a bus**: a MUX serialises parallel signals onto a shared wire; a DEMUX at the other end distributes them. Combined with a clock cycling the select lines, this implements time-division multiplexing.

Next lesson: Decoders and Encoders — circuits that convert between binary codes and one-hot representations, including priority encoders and BCD decoders.`,
    },
  ],
};

export default {
  id: 'df-5-3-mux-demux',
  slug: 'multiplexers-demultiplexers',
  chapter: 'df.5',
  order: 3,
  title: 'Multiplexers and Demultiplexers',
  subtitle: 'Digital switches that route data — the building blocks of buses, datapaths, and function generators.',
  tags: ['digital','multiplexer','MUX','demultiplexer','DEMUX','decoder','74HC151','74HC138','FPGA','LUT','data-routing'],
  hook: {
    question: 'An FPGA can implement any logic function you want. How? Every logic cell is a programmed multiplexer — a MUX whose data inputs store the desired truth table.',
    realWorldContext: 'MUXes appear everywhere: CPU datapaths select between register values and immediate operands. FPGA LUTs are 6-input MUXes. Memory decoders use DEMUX logic to select one chip out of many. The 74HC138 decoder is in virtually every microprocessor support circuit ever built.',
  },
  intuition: {
    prose: [
      'MUX: N select lines choose 1 of 2ᴺ inputs. Select = binary address of active channel.',
      'F = A·S̄ + B·S for 2-to-1. Gate cost: 1 NOT + 2 AND + 1 OR per channel pair.',
      'MUX as LUT: wire select to variables, data to truth table values → any function.',
      'DEMUX: one input, 2ᴺ outputs. Only selected output follows D; others = 0. D=1 → decoder.',
    ],
    callouts: [
      {type:'tip', title:'DEMUX = decoder when D=1', body:'Holding the data input HIGH makes a DEMUX activate exactly one output per address. This is how address decoders work — the 74HC138 is a 3-to-8 DEMUX used as a decoder.'},
      {type:'important', title:'MUX tree count', body:'A 2ᴺ-to-1 MUX built from 2-to-1 stages needs exactly 2ᴺ − 1 gates. Levels: 2ᴺ⁻¹ + 2ᴺ⁻² + ... + 1 = 2ᴺ − 1.'},
    ],
    visualizations:[{id:'ScienceNotebook',title:'Multiplexers and Demultiplexers',props:{lesson:LESSON_DF_5_3}}],
  },
  math:{prose:[],callouts:[],visualizations:[]},
  rigor:{prose:[],callouts:[],visualizations:[]},
  examples:[],challenges:[],
  mentalModel:[
    'MUX select lines = binary address. S1S0=10 → channel D2 (not D3).',
    'Gate implementation: 1 NOT per select bit, 1 AND per channel, 1 OR at output.',
    'Function generator: 2ᴺ-to-1 MUX implements any N-variable function. FPGA LUT = this.',
    'DEMUX with D=1: only addressed output is 1. Binary decoder. Used for chip select.',
    'MUX tree depth = log₂(N). Total gates = N−1 two-input MUXes for an N-to-1 tree.',
  ],
  checkpoints:['read-intuition'],
  quiz:[],
};