// Digital Fundamentals · Unit 3 · Lesson 4
// Reading Logic Diagrams
// ScienceNotebook format — prose cells, JS visuals, challenges

export const LESSON_DF_3_4 = {
  title: 'Reading Logic Diagrams',
  subtitle: 'How to trace signals through multi-gate circuits, derive truth tables from schematics, and write Boolean expressions from diagrams.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### From Gates to Circuits

Individual gates are useful, but real logic circuits chain many gates together. The output of one gate feeds the input of another, signals split and merge, and the result is a circuit that computes a function of several input variables.

A **logic diagram** (also called a logic schematic) is the drawing that shows how gates are connected. Learning to read one fluently is as important as knowing the truth table of each gate — it is the primary language in which digital circuits are described, documented, and debugged.

Three skills are needed:

**1. Signal tracing** — given a specific input combination (A=1, B=0, C=1), propagate values through the diagram gate by gate from inputs to outputs. Every intermediate wire gets a value; the output is determined when you reach it.

**2. Truth table derivation** — repeat signal tracing for every possible input combination. A circuit with N inputs has 2ᴺ rows. For each row, record the output. The result is the complete truth table of the circuit.

**3. Boolean expression extraction** — write the algebraic expression for each gate's output, working left to right. The final gate's expression is the Boolean function implemented by the entire circuit.

These three operations — trace, tabulate, express — let you understand any combinational logic circuit from its diagram alone, without building it or simulating it.`,
    },

    // ── Visual 1 — Signal tracing on a 2-gate circuit ─────────────────────────
    {
      type: 'js',
      instruction: `### Signal tracing: a two-gate circuit

This circuit computes $F = (A \\cdot B) + C$. Set A, B, and C with the buttons, then click **Trace** to step through the signal propagation gate by gate. Each intermediate wire lights up as its value is determined.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
    <button id="btnC" class="inp-btn">C = 0</button>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      <button id="btnTrace" class="act-btn">▶ Trace</button>
      <button id="btnReset" class="rst-btn">↺ Reset</button>
    </div>
  </div>
  <canvas id="cv" width="560" height="220"></canvas>
  <div id="traceLog" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.9;min-height:40px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.inp-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.act-btn{padding:7px 18px;border-radius:8px;border:1.5px solid #6366f1;background:rgba(99,102,241,0.15);color:#818cf8;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.rst-btn{padding:7px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:13px;cursor:pointer}`,
      startCode: `
var A=0,B=0,C=0,step=0;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

// step 0 = inputs only, 1 = AND evaluated, 2 = OR evaluated (final)
var STEPS=[
  {wires:{A:null,B:null,C:null,mid:null,F:null}, log:'Click ▶ Trace to begin.'},
  {wires:{A:true,B:true,C:true,mid:null,F:null},  log:'Step 1: Read inputs. A=?, B=?, C=?'},
  {wires:{A:true,B:true,C:true,mid:true,F:null},  log:'Step 2: Evaluate AND gate. mid = A \u00b7 B = ?'},
  {wires:{A:true,B:true,C:true,mid:true,F:true},  log:'Step 3: Evaluate OR gate. F = mid + C = ?'},
];

function andOut(){return A&B;}
function orOut(){return andOut()|C;}

function drawAND(cx,cy,w,h,col,active){
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(cx+4,cy+4);ctx.lineTo(cx+w/2-4,cy+4);
  ctx.arc(cx+w/2-4,cy+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  ctx.lineTo(cx+4,cy+h-4);ctx.closePath();
  ctx.fill();ctx.stroke();
}
function drawOR(cx,cy,w,h,col,active){
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=active?col:'#334155'; ctx.lineWidth=active?2:1.5;
  ctx.beginPath();
  ctx.moveTo(cx+4,cy+4);
  ctx.quadraticCurveTo(cx+w/2-10,cy+h/2,cx+4,cy+h-4);
  ctx.quadraticCurveTo(cx+w/2,cy+h,cx+w-14,cy+h/2);
  ctx.quadraticCurveTo(cx+w/2,cy,cx+4,cy+4);
  ctx.fill();ctx.stroke();
}
function seg(x1,y1,x2,y2,lit,label,labelSide){
  var col=lit===null?'#2a3a50':lit?'#4ade80':'#475569';
  ctx.strokeStyle=col; ctx.lineWidth=lit?2.5:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  if(label!==undefined&&lit!==null){
    ctx.fillStyle=lit?'#4ade80':'#94a3b8';
    ctx.font='bold 11px monospace';ctx.textAlign=labelSide||'center';
    ctx.fillText(label,labelSide==='right'?x2+6:labelSide==='left'?x1-6:(x1+x2)/2,(y1+y2)/2-5);
  }
}
function dot(x,y,lit){
  if(lit===null) return;
  ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);
  ctx.fillStyle=lit?'#4ade80':'#475569'; ctx.fill();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  var sw=STEPS[step].wires;
  var mid=andOut(), F=orOut();
  var wA=sw.A?A:null, wB=sw.B?B:null, wC=sw.C?C:null;
  var wMid=sw.mid?(mid?1:0):null, wF=sw.F?(F?1:0):null;

  var gw=80,gh=64;
  var andX=130, andY=50;
  var orX=350,  orY=H/2-gh/2;

  // Input wires A,B → AND
  seg(30,andY+gh*0.3,andX,andY+gh*0.3,wA===null?null:!!wA,'A='+A,'right');
  seg(30,andY+gh*0.7,andX,andY+gh*0.7,wB===null?null:!!wB,'B='+B,'right');

  // AND gate
  drawAND(andX,andY,gw,gh,'#0891b2',wMid!==null&&!!wMid);
  ctx.fillStyle='#0891b2';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('AND',andX+gw/2,andY-8);

  // AND output → OR input (top)
  seg(andX+gw,andY+gh/2, andX+gw+30,andY+gh/2, wMid===null?null:!!wMid);
  seg(andX+gw+30,andY+gh/2, orX,orY+gh*0.3, wMid===null?null:!!wMid, wMid===null?'':('mid='+(wMid!==null?wMid:'?')));
  dot(andX+gw+30,andY+gh/2,wMid===null?null:!!wMid);

  // C wire → OR input (bottom)
  seg(30,orY+gh*0.7,orX,orY+gh*0.7,wC===null?null:!!wC,'C='+C,'right');

  // OR gate
  drawOR(orX,orY,gw,gh,'#7c3aed',wF!==null&&!!wF);
  ctx.fillStyle='#7c3aed';ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('OR',orX+gw/2,orY-8);

  // OR output → F
  seg(orX+gw-4,orY+gh/2,520,orY+gh/2,wF===null?null:!!wF, wF===null?'F=?':('F='+wF),'left');

  // Expression label
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText('Circuit: F = (A \u00b7 B) + C',30,H-10);

  // Step indicator dots
  for(var i=1;i<STEPS.length;i++){
    ctx.beginPath();ctx.arc(W-20-(STEPS.length-1-i)*16,H-12,4,0,2*Math.PI);
    ctx.fillStyle=step>=i?'#818cf8':'#2a3a50'; ctx.fill();
  }
}

function updateLog(){
  var mid=andOut(), F2=orOut();
  var msgs=[
    'Set A, B, C then click ▶ Trace to propagate.',
    'Inputs read: A='+A+', B='+B+', C='+C+'. Input wires are now live.',
    'AND gate: A\u00b7B = '+A+'\u00b7'+B+' = '+mid+'. Middle wire carries '+mid+'.',
    'OR gate: mid+C = '+mid+'+'+C+' = '+F2+'. Output F = '+F2+'.',
  ];
  document.getElementById('traceLog').textContent=msgs[step];
}

function refresh(){
  ['A','B','C'].forEach(function(k){
    var v=k==='A'?A:k==='B'?B:C;
    var btn=document.getElementById('btn'+k);
    btn.textContent=k+' = '+v; btn.className='inp-btn'+(v?' hi':'');
  });
  draw(); updateLog();
}

document.getElementById('btnA').onclick=function(){A^=1;step=0;refresh();};
document.getElementById('btnB').onclick=function(){B^=1;step=0;refresh();};
document.getElementById('btnC').onclick=function(){C^=1;step=0;refresh();};
document.getElementById('btnTrace').onclick=function(){
  step=Math.min(step+1,STEPS.length-1); refresh();
};
document.getElementById('btnReset').onclick=function(){step=0;refresh();};
refresh();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In the circuit F = (A · B) + C, what is F when A=0, B=1, C=1?`,
      options: [
        { label: 'A', text: 'F=0 — the AND gate blocks everything when A=0' },
        { label: 'B', text: 'F=1 — the AND gives 0, but C=1 makes the OR output 1' },
        { label: 'C', text: 'F=1 — the AND gives 1 because B=1' },
        { label: 'D', text: 'F=0 — the OR needs both inputs to be 1' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Step by step: AND(A=0, B=1) = 0·1 = 0. Then OR(mid=0, C=1) = 0+1 = 1. So F=1. The AND gate is blocked (A=0), but C feeds directly into the OR, which only needs one input to be HIGH.',
      failMessage: 'Trace gate by gate: AND(0,1)=0 (A=0 blocks the AND). Then OR(0,1)=1 (C=1 is enough for OR). F=1. Always evaluate each gate in order from inputs to output.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Deriving a Full Truth Table

Signal tracing gives you the output for one input combination. To fully characterise a circuit you need its **truth table** — the output for every possible input combination.

For a circuit with N inputs, there are $2^N$ input combinations. The systematic approach is to list them in binary order (000, 001, 010, 011, ...) and trace each one.

**Worked example**: the circuit $F = \\overline{A} \\cdot B + A \\cdot \\overline{B}$

This circuit has two inputs (A and B), so $2^2 = 4$ rows.

| A | B | $\\bar{A}$ | $\\bar{B}$ | $\\bar{A}\\cdot B$ | $A\\cdot\\bar{B}$ | F |
|---|---|-----------|-----------|-----------------|-----------------|---|
| 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 | 0 | 0 | 0 |

The output column (0,1,1,0) is exactly the XOR truth table. This circuit — two NOT gates, two AND gates, one OR gate — is one way to build XOR from simpler gates.

**Intermediate columns help**. Always compute sub-expressions (inverted inputs, partial AND terms) as separate columns before combining them. This mirrors the actual wire values in the schematic and makes errors obvious.

**The general procedure**:
1. List all $2^N$ input combinations in binary order.
2. Add a column for each intermediate signal (gate output that feeds another gate).
3. Fill columns left to right, evaluating each gate as you reach it.
4. The rightmost column is the circuit output.`,
    },

    // ── Visual 2 — Full truth table derivation ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Build the truth table row by row

Select a circuit from the dropdown. Click **Fill next row** to trace each input combination in order. Intermediate wire values appear as columns. When complete, the pattern in the output column reveals which function the circuit implements.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <select id="selCircuit" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:12px">
      <option value="xor2">F = Ā·B + A·B̄  (XOR from gates)</option>
      <option value="mux">F = A·S̄ + B·S  (2:1 Multiplexer)</option>
      <option value="maj">F = A·B + B·C + A·C  (Majority)</option>
    </select>
    <button id="btnNext" class="act-btn">Fill next row</button>
    <button id="btnAll"  class="fast-btn">Fill all</button>
    <button id="btnClr"  class="rst-btn">↺ Clear</button>
  </div>
  <canvas id="cv" width="560" height="300"></canvas>
  <div id="verdict" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;min-height:30px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.act-btn{padding:6px 14px;border-radius:8px;border:1.5px solid #6366f1;background:rgba(99,102,241,0.15);color:#818cf8;font-family:monospace;font-size:12px;font-weight:700;cursor:pointer}
.fast-btn{padding:6px 14px;border-radius:8px;border:1.5px solid #d97706;background:rgba(217,119,6,0.12);color:#fbbf24;font-family:monospace;font-size:12px;cursor:pointer}
.rst-btn{padding:6px 12px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
select{outline:none}`,
      startCode: `
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var filledRows=0;

var CIRCUITS={
  xor2:{
    inputs:['A','B'],
    cols:['A','B','\u0100','B\u0305','A\u0305\u00b7B','A\u00b7B\u0305','F'],
    colors:['#94a3b8','#94a3b8','#38bdf8','#38bdf8','#a78bfa','#a78bfa','#4ade80'],
    compute:function(r){ var A=r[0],B=r[1]; var nA=1-A,nB=1-B; return [A,B,nA,nB,nA&B,A&nB,(nA&B)|(A&nB)]; },
    rows:4,
    name:'XOR (A\u2295B)',
    verdict:'Output column 0,1,1,0 = XOR truth table. This is one gate-level implementation of XOR using NOT, AND, and OR gates.'
  },
  mux:{
    inputs:['A','B','S'],
    cols:['A','B','S','S\u0305','A\u00b7S\u0305','B\u00b7S','F'],
    colors:['#94a3b8','#94a3b8','#f472b6','#f472b6','#38bdf8','#a78bfa','#4ade80'],
    compute:function(r){ var A=r[0],B=r[1],S=r[2]; var nS=1-S; return [A,B,S,nS,A&nS,B&S,(A&nS)|(B&S)]; },
    rows:8,
    name:'2:1 MUX',
    verdict:'When S=0, F=A (top input selected). When S=1, F=B (bottom input selected). S is the select line — this is a 2-to-1 multiplexer.'
  },
  maj:{
    inputs:['A','B','C'],
    cols:['A','B','C','A\u00b7B','B\u00b7C','A\u00b7C','F'],
    colors:['#94a3b8','#94a3b8','#94a3b8','#38bdf8','#a78bfa','#f472b6','#4ade80'],
    compute:function(r){ var A=r[0],B=r[1],C=r[2]; return [A,B,C,A&B,B&C,A&C,(A&B)|(B&C)|(A&C)]; },
    rows:8,
    name:'Majority',
    verdict:'Output is 1 when 2 or more of the 3 inputs are 1. This is the majority function — used in fault-tolerant voting circuits and as the carry-generate in adders.'
  }
};

var curKey='xor2';
var cur=CIRCUITS[curKey];

function inputCombinations(n){
  var rows=[];
  for(var i=0;i<Math.pow(2,n);i++){
    var row=[];
    for(var b=n-1;b>=0;b--) row.push((i>>b)&1);
    rows.push(row);
  }
  return rows;
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var allRows=inputCombinations(cur.inputs.length);
  var nCols=cur.cols.length;
  var colW=Math.min(68, Math.floor((W-20)/nCols));
  var startX=10;
  var rowH=Math.min(32, Math.floor((H-40)/( allRows.length+1)));
  var headerY=20;

  // Headers
  cur.cols.forEach(function(h,i){
    ctx.fillStyle=cur.colors[i]||'rgba(255,255,255,0.4)';
    ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText(h, startX+i*colW+colW/2, headerY);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(startX,headerY+6);ctx.lineTo(startX+colW*nCols,headerY+6);ctx.stroke();

  // Vertical separator before output
  var sepX=startX+(nCols-1)*colW;
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(sepX,headerY+6);ctx.lineTo(sepX,H-8);ctx.stroke();

  // Rows
  allRows.forEach(function(inRow,ri){
    var y=headerY+14+ri*rowH;
    var isFilled=ri<filledRows;
    var isNext=ri===filledRows;

    if(isNext){
      ctx.fillStyle='rgba(255,255,255,0.04)';
      ctx.fillRect(startX,y-rowH*0.6,colW*nCols,rowH);
      ctx.strokeStyle='rgba(99,102,241,0.3)'; ctx.lineWidth=1;
      ctx.strokeRect(startX,y-rowH*0.6,colW*nCols,rowH);
    }

    if(isFilled){
      var computed=cur.compute(inRow);
      computed.forEach(function(v,ci){
        var col=ci===nCols-1?(v?'#4ade80':'#ef4444'):(cur.colors[ci]||'rgba(255,255,255,0.5)');
        ctx.fillStyle=col; ctx.font=(ci===nCols-1?'bold ':'')+'12px monospace'; ctx.textAlign='center';
        ctx.fillText(v, startX+ci*colW+colW/2, y);
      });
    } else {
      // Show input columns only
      inRow.forEach(function(v,ci){
        ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='12px monospace'; ctx.textAlign='center';
        ctx.fillText(v, startX+ci*colW+colW/2, y);
      });
      // Placeholder dashes for unfilled intermediate+output
      for(var ci=inRow.length;ci<nCols;ci++){
        ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.font='12px monospace'; ctx.textAlign='center';
        ctx.fillText('\u2014', startX+ci*colW+colW/2, y);
      }
    }
  });

  // Progress
  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='10px monospace'; ctx.textAlign='right';
  ctx.fillText(filledRows+'/'+cur.rows+' rows filled', W-10, H-6);
}

function updateVerdict(){
  if(filledRows>=cur.rows){
    document.getElementById('verdict').textContent='\u2714 Complete! '+cur.verdict;
    document.getElementById('verdict').style.color='#4ade80';
  } else {
    document.getElementById('verdict').textContent='Fill rows to reveal the circuit\'s function. ('+(cur.rows-filledRows)+' remaining)';
    document.getElementById('verdict').style.color='rgba(255,255,255,0.35)';
  }
}

document.getElementById('selCircuit').onchange=function(){
  curKey=this.value; cur=CIRCUITS[curKey]; filledRows=0; draw(); updateVerdict();
};
document.getElementById('btnNext').onclick=function(){
  if(filledRows<cur.rows){filledRows++;draw();updateVerdict();}
};
document.getElementById('btnAll').onclick=function(){
  filledRows=cur.rows; draw(); updateVerdict();
};
document.getElementById('btnClr').onclick=function(){
  filledRows=0; draw(); updateVerdict();
};
draw(); updateVerdict();`,
      outputHeight: 420,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A circuit has 3 inputs (A, B, C). How many rows does its complete truth table have, and which input combination comes immediately after A=0, B=1, C=1 in binary order?`,
      options: [
        { label: 'A', text: '6 rows; next is A=1, B=0, C=0' },
        { label: 'B', text: '8 rows; next is A=1, B=0, C=0' },
        { label: 'C', text: '8 rows; next is A=0, B=1, C=0 (decrement C)' },
        { label: 'D', text: '9 rows; next is A=1, B=1, C=1' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 3 inputs → 2³ = 8 rows. Listing in binary order: 000, 001, 010, 011, 100, 101, 110, 111. A=0,B=1,C=1 is row 011 = decimal 3. The next row is 100 = A=1, B=0, C=0.',
      failMessage: 'N inputs → 2ᴺ rows. For N=3: 2³=8 rows. Binary order counts from 000 to 111. 011 (A=0,B=1,C=1) is row 3 (decimal). Adding 1 in binary: 011+1=100 = A=1,B=0,C=0.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Extracting Boolean Expressions

Reading a logic diagram from left to right, you can write a Boolean expression for every wire in the circuit. The process is mechanical:

1. **Label the inputs**: A, B, C, ...
2. **Write the expression for each gate output**, using the gate's Boolean operation:
   - AND gate: output = (input1) · (input2)
   - OR gate: output = (input1) + (input2)
   - NOT gate: output = $\\overline{\\text{input}}$
   - NAND: output = $\\overline{\\text{input1} \\cdot \\text{input2}}$
   - NOR: output = $\\overline{\\text{input1} + \\text{input2}}$
   - XOR: output = input1 ⊕ input2
3. **Substitute**: when a gate's input comes from another gate's output, replace it with that gate's expression.
4. **Simplify** using Boolean algebra if needed (covered in Unit 4).

**Example**: a circuit with three gates:
- Gate 1 (NOT): output $= \\bar{A}$
- Gate 2 (AND): inputs = $\\bar{A}$ and B, output $= \\bar{A} \\cdot B$
- Gate 3 (OR): inputs = $\\bar{A} \\cdot B$ and C, output $= \\bar{A} \\cdot B + C$

The final expression $F = \\bar{A} \\cdot B + C$ describes the complete circuit. Given this expression, you can evaluate F for any input combination with algebra alone — no diagram needed.

The reverse direction — starting from an expression and drawing the circuit — is covered in Unit 4 when we look at circuit implementation from Boolean functions.`,
    },

    // ── Visual 3 — Expression builder ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Extract the Boolean expression

The diagram below shows a 3-gate circuit. Click each gate in left-to-right order to label its output wire with the correct sub-expression. When all gates are labelled, the full expression appears.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
    <button id="btnC" class="inp-btn">C = 0</button>
    <div style="margin-left:auto">
      <button id="btnReveal" class="act-btn">Reveal all</button>
      <button id="btnReset2" class="rst-btn" style="margin-left:6px">↺</button>
    </div>
  </div>
  <canvas id="cv" width="560" height="240"></canvas>
  <div id="exprLog" style="margin-top:10px;font-size:13px;line-height:1.9;min-height:60px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px;cursor:pointer}
.inp-btn{padding:7px 16px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.act-btn{padding:6px 14px;border-radius:8px;border:1.5px solid #6366f1;background:rgba(99,102,241,0.15);color:#818cf8;font-family:monospace;font-size:12px;cursor:pointer}
.rst-btn{padding:6px 10px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}`,
      startCode: `
var A=0,B=0,C=0;
// Revealed: 0=none, 1=NOT revealed, 2=NAND revealed, 3=OR revealed
var revealed=0;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

// Circuit: NOT(A) → NAND(NOT_A, B) → OR(NAND_out, C)
// F = NAND(NOT A, B) + C = NOT(NOT_A · B) + C = (A + NOT_B) + C
function notOut(){return 1-A;}
function nandOut(){return (notOut()&B)?0:1;}
function finalOut(){return nandOut()|C;}

var GATES=[
  {type:'NOT', x:100, y:80, w:72, h:56, col:'#059669',
   expr:function(){return '\u0100';},
   valFn:notOut,
   label:'NOT'},
  {type:'NAND',x:270, y:50, w:80, h:60, col:'#d97706',
   expr:function(){return '\u0305(\u0100\u00b7B)\u0305';},
   valFn:nandOut,
   label:'NAND'},
  {type:'OR',  x:430, y:85, w:80, h:58, col:'#7c3aed',
   expr:function(){return 'F = \u0305(\u0100\u00b7B)\u0305 + C';},
   valFn:finalOut,
   label:'OR'},
];

function drawGate(g, lit){
  var cx=g.x,cy=g.y,w=g.w,h=g.h,col=g.col;
  var active=lit;
  ctx.fillStyle=active?col+'33':'#0d1527';
  ctx.strokeStyle=revealed>GATES.indexOf(g)?col:(active?col:'#334155');
  ctx.lineWidth=active?2:1.5;

  if(g.type==='NOT'){
    ctx.beginPath();
    ctx.moveTo(cx+4,cy+4);ctx.lineTo(cx+w-14,cy+h/2);ctx.lineTo(cx+4,cy+h-4);ctx.closePath();
    ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(cx+w-9,cy+h/2,5,0,2*Math.PI);ctx.fill();ctx.stroke();
  } else if(g.type==='NAND'){
    ctx.beginPath();
    ctx.moveTo(cx+4,cy+4);ctx.lineTo(cx+w/2-4,cy+4);
    ctx.arc(cx+w/2-4,cy+h/2,h/2-4,-Math.PI/2,Math.PI/2);
    ctx.lineTo(cx+4,cy+h-4);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(cx+w+5,cy+h/2,5,0,2*Math.PI);ctx.fill();ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx+4,cy+4);
    ctx.quadraticCurveTo(cx+w/2-10,cy+h/2,cx+4,cy+h-4);
    ctx.quadraticCurveTo(cx+w/2,cy+h,cx+w-14,cy+h/2);
    ctx.quadraticCurveTo(cx+w/2,cy,cx+4,cy+4);
    ctx.fill();ctx.stroke();
  }
  // Gate type label
  ctx.fillStyle=col; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText(g.label, cx+w/2, cy-6);
}

function wireCol(v,ready){
  if(!ready) return '#2a3a50';
  return v?'#4ade80':'#475569';
}
function seg(x1,y1,x2,y2,v,ready){
  ctx.strokeStyle=wireCol(v,ready); ctx.lineWidth=ready&&v?2.5:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function dot(x,y,v,ready){
  if(!ready) return;
  ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);
  ctx.fillStyle=v?'#4ade80':'#475569'; ctx.fill();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var notV=notOut(), nandV=nandOut(), F=finalOut();
  var r0=revealed>=1, r1=revealed>=2, r2=revealed>=3;

  // Input A → NOT
  seg(30,GATES[0].y+GATES[0].h/2, GATES[0].x, GATES[0].y+GATES[0].h/2, A, true);
  ctx.fillStyle=A?'#4ade80':'#f87171'; ctx.font='500 11px monospace'; ctx.textAlign='right';
  ctx.fillText('A='+A, 28, GATES[0].y+GATES[0].h/2+4);

  // NOT gate
  drawGate(GATES[0], notV&&r0);

  // NOT output → fork → NAND top input
  var notOutX=GATES[0].x+GATES[0].w;
  var forkX=notOutX+22;
  seg(notOutX, GATES[0].y+GATES[0].h/2, forkX, GATES[0].y+GATES[0].h/2, notV, r0);
  seg(forkX, GATES[0].y+GATES[0].h/2, GATES[1].x, GATES[1].y+GATES[1].h*0.3, notV, r0);
  dot(forkX, GATES[0].y+GATES[0].h/2, notV, r0);

  // Label NOT output
  if(r0){
    ctx.fillStyle='#059669'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
    ctx.fillText('\u0100='+notV, forkX, GATES[0].y+GATES[0].h/2-8);
  }

  // Input B → NAND bottom
  seg(30, GATES[1].y+GATES[1].h*0.7, GATES[1].x, GATES[1].y+GATES[1].h*0.7, B, true);
  ctx.fillStyle=B?'#4ade80':'#f87171'; ctx.font='500 11px monospace'; ctx.textAlign='right';
  ctx.fillText('B='+B, 28, GATES[1].y+GATES[1].h*0.7+4);

  // NAND gate
  drawGate(GATES[1], nandV&&r1);

  // NAND output → OR top
  var nandOutX=GATES[1].x+GATES[1].w+10;
  seg(nandOutX, GATES[1].y+GATES[1].h/2, GATES[2].x, GATES[2].y+GATES[2].h*0.3, nandV, r1);
  if(r1){
    var midX=(nandOutX+GATES[2].x)/2;
    ctx.fillStyle='#d97706'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText('\u0305(\u0100\u00b7B)\u0305='+nandV, midX, GATES[1].y+GATES[1].h/2-8);
  }

  // Input C → OR bottom
  seg(30, GATES[2].y+GATES[2].h*0.7, GATES[2].x, GATES[2].y+GATES[2].h*0.7, C, true);
  ctx.fillStyle=C?'#4ade80':'#f87171'; ctx.font='500 11px monospace'; ctx.textAlign='right';
  ctx.fillText('C='+C, 28, GATES[2].y+GATES[2].h*0.7+4);

  // OR gate
  drawGate(GATES[2], F&&r2);

  // OR output → F
  seg(GATES[2].x+GATES[2].w-4, GATES[2].y+GATES[2].h/2, 540, GATES[2].y+GATES[2].h/2, F, r2);
  if(r2){
    ctx.fillStyle=F?'#4ade80':'#475569'; ctx.font='bold 12px monospace'; ctx.textAlign='left';
    ctx.fillText('F='+F, 542, GATES[2].y+GATES[2].h/2+4);
  } else {
    ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='12px monospace'; ctx.textAlign='left';
    ctx.fillText('F=?', 530, GATES[2].y+GATES[2].h/2+4);
  }

  // Click hints
  if(revealed<3){
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('click gate '+(revealed+1)+' ('+GATES[revealed].label+')', GATES[revealed].x+GATES[revealed].w/2, H-8);
  }
}

function updateLog(){
  var parts=[
    '① NOT: output = \u0100  (invert A)',
    '② NAND: output = \u0305(\u0100\u00b7B)\u0305  (NAND of \u0100 and B)',
    '③ OR:  output = F = \u0305(\u0100\u00b7B)\u0305 + C',
  ];
  var exprs=[
    '<span style="color:#059669">\u0100 = '+(1-A)+'</span>',
    '<span style="color:#d97706">\u0305(\u0100\u00b7B)\u0305 = '+nandOut()+'</span>',
    '<span style="color:#7c3aed">F = '+finalOut()+'</span>',
  ];
  var log='';
  for(var i=0;i<revealed;i++){
    log+=parts[i]+' → '+exprs[i]+'<br>';
  }
  if(revealed===0) log='<span style="color:rgba(255,255,255,0.3)">Click each gate in order to build up the Boolean expression.</span>';
  if(revealed===3) log+='<br><span style="color:#4ade80">Complete expression: F = \u0305(\u0100\u00b7B)\u0305 + C</span>';
  document.getElementById('exprLog').innerHTML=log;
}

function refresh(){
  ['A','B','C'].forEach(function(k){
    var v=k==='A'?A:k==='B'?B:C;
    var btn=document.getElementById('btn'+k);
    btn.textContent=k+' = '+v; btn.className='inp-btn'+(v?' hi':'');
  });
  draw(); updateLog();
}

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var mx=(e.clientX-rect.left)*(canvas.width/rect.width);
  var my=(e.clientY-rect.top)*(canvas.height/rect.height);
  for(var i=0;i<GATES.length;i++){
    var g=GATES[i];
    if(mx>=g.x-10&&mx<=g.x+g.w+15&&my>=g.y-10&&my<=g.y+g.h+10){
      if(i===revealed) revealed++;
      break;
    }
  }
  refresh();
};

document.getElementById('btnA').onclick=function(){A^=1;refresh();};
document.getElementById('btnB').onclick=function(){B^=1;refresh();};
document.getElementById('btnC').onclick=function(){C^=1;refresh();};
document.getElementById('btnReveal').onclick=function(){revealed=3;refresh();};
document.getElementById('btnReset2').onclick=function(){revealed=0;refresh();};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A circuit has a NAND gate whose inputs are A and B, feeding into a NOT gate. What is the Boolean expression for the NOT gate's output?`,
      options: [
        { label: 'A', text: 'F = A · B  (AND — double inversion cancels)' },
        { label: 'B', text: 'F = A + B  (OR by De Morgan)' },
        { label: 'C', text: 'F = NOT(A · B)  (same as NAND output)' },
        { label: 'D', text: 'F = NOT(A) · NOT(B)  (De Morgan applied once)' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. NAND output = NOT(A·B). The NOT gate inverts that: NOT(NOT(A·B)) = A·B. Double negation cancels. NAND followed by NOT is exactly how AND is built from NAND gates — the standard 2-NAND AND implementation.',
      failMessage: 'NAND output = NOT(A·B). The NOT gate inverts it again: NOT(NOT(A·B)) = A·B. Two inversions cancel — this is the double negation law of Boolean algebra: NOT(NOT(X)) = X. This circuit is AND built from NAND gates.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Common Circuit Patterns to Recognise

After tracing enough circuits, certain patterns become immediately recognisable. Knowing them lets you read a schematic at a glance instead of tracing every gate.

**The inverter chain**: NOT → NOT = wire. Two inversions cancel. In real designs, a double inverter is sometimes used deliberately to buffer a signal (add drive strength) without changing its logic value.

**NAND-NAND = AND-OR**: A two-level NAND network (inputs ANDed in the first level, results NANDed in the second level) implements Sum-of-Products logic. This is the canonical form: $F = \\overline{\\overline{AB} \\cdot \\overline{CD}} = AB + CD$.

**The multiplexer (MUX)**: $F = A \\cdot \\bar{S} + B \\cdot S$. When S=0, F=A. When S=1, F=B. A MUX is a digitally controlled switch. It appears constantly in CPU datapaths — selecting between results from different functional units.

**The majority gate**: $F = AB + BC + AC$. Output is 1 when 2 or more of 3 inputs are 1. Used in fault-tolerant systems (three sensors vote), and structurally identical to the carry-out of a full adder.

**The comparator (equality)**: XNOR(A,B) = 1 when A=B. For multi-bit equality, AND all the XNOR outputs together. If every bit matches, all XNORs output 1, the AND outputs 1 — equal.

Recognising these patterns is how experienced engineers read schematics quickly. Instead of tracing every gate, they identify the pattern and know the function immediately.`,
    },

    // ── Visual 4 — Circuit pattern gallery ─────────────────────────────────────
    {
      type: 'js',
      instruction: `### Recognise the pattern

Each circuit below implements a well-known function. Set the inputs and identify what the circuit computes. Select your answer from the dropdown, then check.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <button class="tab-btn active" id="p-mux"  onclick="setPat('mux')">Pattern 1</button>
    <button class="tab-btn"        id="p-maj"  onclick="setPat('maj')">Pattern 2</button>
    <button class="tab-btn"        id="p-cmp"  onclick="setPat('cmp')">Pattern 3</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="btnA" class="inp-btn">A = 0</button>
    <button id="btnB" class="inp-btn">B = 0</button>
    <button id="btnS" class="inp-btn" style="display:none">S = 0</button>
    <button id="btnC" class="inp-btn" style="display:none">C = 0</button>
  </div>
  <canvas id="cv" width="560" height="200"></canvas>
  <div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <span style="font-size:12px;color:rgba(255,255,255,0.4)">This circuit computes:</span>
    <select id="selAnswer" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:12px">
      <option value="">— select —</option>
      <option value="mux">2:1 Multiplexer (select A or B based on S)</option>
      <option value="maj">Majority function (output 1 when ≥2 inputs are 1)</option>
      <option value="eq">Equality detector (output 1 when A=B)</option>
      <option value="xor">XOR (output 1 when inputs differ)</option>
      <option value="and">AND (output 1 when all inputs are 1)</option>
    </select>
    <button id="btnCheck" class="act-btn">Check</button>
  </div>
  <div id="fb" style="margin-top:8px;font-size:12px;min-height:24px;line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.tab-btn{padding:6px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.tab-btn.active{border-color:#818cf8;background:rgba(99,102,241,0.12);color:#818cf8}
.inp-btn{padding:7px 16px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.act-btn{padding:6px 14px;border-radius:8px;border:1.5px solid #6366f1;background:rgba(99,102,241,0.15);color:#818cf8;font-family:monospace;font-size:12px;cursor:pointer}
select{outline:none}`,
      startCode: `
var A=0,B=0,S=0,C=0,pat='mux';
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

var PATTERNS={
  mux:{correct:'mux', inputs:['A','B','S'],
    compute:function(){return (A&(1-S))|(B&S);},
    draw:drawMUX, hint:'Observe: change S to 0 and F tracks A. Change S to 1 and F tracks B.'},
  maj:{correct:'maj', inputs:['A','B','C'],
    compute:function(){return (A&B)|(B&C)|(A&C);},
    draw:drawMAJ, hint:'Observe: F=1 exactly when 2 or 3 inputs are 1.'},
  cmp:{correct:'eq', inputs:['A','B'],
    compute:function(){return 1-(A^B);},
    draw:drawCMP, hint:'Observe: F=1 only when A and B are the same value.'},
};

function setPat(p){
  pat=p; A=0;B=0;S=0;C=0;
  document.getElementById('fb').textContent='';
  document.getElementById('selAnswer').value='';
  ['mux','maj','cmp'].forEach(function(k){
    document.getElementById('p-'+k).className='tab-btn'+(p===k?' active':'');
  });
  var inp=PATTERNS[p].inputs;
  document.getElementById('btnS').style.display=inp.includes('S')?'':'none';
  document.getElementById('btnC').style.display=inp.includes('C')?'':'none';
  refresh();
}

function w(x1,y1,x2,y2,v){
  ctx.strokeStyle=v?'#4ade80':'#475569'; ctx.lineWidth=v?2.5:1.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function dot(x,y,v){ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);ctx.fillStyle=v?'#4ade80':'#475569';ctx.fill();}
function gAND(cx,cy,ww,h,col,act){
  ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
  ctx.beginPath();ctx.moveTo(cx+4,cy+4);ctx.lineTo(cx+ww/2-4,cy+4);
  ctx.arc(cx+ww/2-4,cy+h/2,h/2-4,-Math.PI/2,Math.PI/2);ctx.lineTo(cx+4,cy+h-4);ctx.closePath();ctx.fill();ctx.stroke();
}
function gOR(cx,cy,ww,h,col,act){
  ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
  ctx.beginPath();ctx.moveTo(cx+4,cy+4);ctx.quadraticCurveTo(cx+ww/2-10,cy+h/2,cx+4,cy+h-4);
  ctx.quadraticCurveTo(cx+ww/2,cy+h,cx+ww-14,cy+h/2);ctx.quadraticCurveTo(cx+ww/2,cy,cx+4,cy+4);ctx.fill();ctx.stroke();
}
function gNOT(cx,cy,ww,h,col,act){
  ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
  ctx.beginPath();ctx.moveTo(cx+4,cy+4);ctx.lineTo(cx+ww-14,cy+h/2);ctx.lineTo(cx+4,cy+h-4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(cx+ww-9,cy+h/2,5,0,2*Math.PI);ctx.fill();ctx.stroke();
}
function gXNOR(cx,cy,ww,h,col,act){
  ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
  ctx.beginPath();ctx.moveTo(cx+8,cy+4);ctx.quadraticCurveTo(cx+ww/2-6,cy+h/2,cx+8,cy+h-4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+12,cy+4);ctx.quadraticCurveTo(cx+ww/2-6,cy+h/2,cx+12,cy+h-4);
  ctx.quadraticCurveTo(cx+ww/2+4,cy+h,cx+ww-14,cy+h/2);ctx.quadraticCurveTo(cx+ww/2+4,cy,cx+12,cy+4);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(cx+ww+5,cy+h/2,5,0,2*Math.PI);ctx.fillStyle=act?col+'44':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.fill();ctx.stroke();
}
function lbl(x,y,t,col,align){ctx.fillStyle=col||'rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign=align||'center';ctx.fillText(t,x,y);}

function drawMUX(){
  var F=(A&(1-S))|(B&S);
  var nS=1-S, p1=A&nS, p2=B&S;
  var notX=60,notY=10,gw=64,gh=48;
  // NOT(S)
  gNOT(notX,notY,gw,gh,'#f472b6',!S);
  w(20,notY+gh/2,notX,notY+gh/2,S);lbl(18,notY+gh/2+4,'S='+S,'#f472b6','right');
  // AND1: A · NOT(S)
  var a1X=180,a1Y=5;
  w(20,a1Y+gh*0.3,a1X,a1Y+gh*0.3,A);lbl(18,a1Y+gh*0.3+4,'A='+A,A?'#4ade80':'#f87171','right');
  var nsx=notX+gw+14;dot(nsx,notY+gh/2,!S);
  w(nsx,notY+gh/2,nsx,a1Y+gh*0.7,!S);w(nsx,a1Y+gh*0.7,a1X,a1Y+gh*0.7,!S);
  gAND(a1X,a1Y,gw,gh,'#0891b2',!!p1);
  // AND2: B · S
  var a2X=180,a2Y=100;
  w(20,a2Y+gh*0.3,a2X,a2Y+gh*0.3,B);lbl(18,a2Y+gh*0.3+4,'B='+B,B?'#4ade80':'#f87171','right');
  dot(nsx,notY+gh/2,!S);w(nsx,notY+gh/2,nsx,a2Y+gh*0.7+20,!S);
  var sx2=20+14;dot(sx2,notY+gh/2-20,S);w(sx2,notY+gh/2,sx2,a2Y+gh*0.7,S);w(sx2,a2Y+gh*0.7,a2X,a2Y+gh*0.7,S);
  gAND(a2X,a2Y,gw,gh,'#0891b2',!!p2);
  // OR
  var orX=360,orY=50;
  w(a1X+gw,a1Y+gh/2,orX,orY+gh*0.3,!!p1);
  w(a2X+gw,a2Y+gh/2,orX,orY+gh*0.7,!!p2);
  gOR(orX,orY,gw,gh,'#7c3aed',!!F);
  w(orX+gw-4,orY+gh/2,500,orY+gh/2,!!F);
  lbl(508,orY+gh/2+4,'F='+F,F?'#4ade80':'#475569','left');
}

function drawMAJ(){
  var F=(A&B)|(B&C)|(A&C);
  var ab=A&B,bc=B&C,ac=A&C;
  var gw=64,gh=46;
  var a1X=150,a1Y=10,a2X=150,a2Y=80,a3X=150,a3Y=150;
  // Inputs
  w(20,a1Y+gh*0.3,a1X,a1Y+gh*0.3,A);lbl(18,a1Y+gh*0.3+4,'A',A?'#4ade80':'#f87171','right');
  w(20,a1Y+gh*0.7,a1X,a1Y+gh*0.7,B);lbl(18,a1Y+gh*0.7+4,'B',B?'#4ade80':'#f87171','right');
  w(20,a2Y+gh*0.3,a2X,a2Y+gh*0.3,B);
  w(20,a2Y+gh*0.7,a2X,a2Y+gh*0.7,C);lbl(18,a2Y+gh*0.7+4,'C',C?'#4ade80':'#f87171','right');
  w(20,a3Y+gh*0.3,a3X,a3Y+gh*0.3,A);
  w(20,a3Y+gh*0.7,a3X,a3Y+gh*0.7,C);
  // ANDs
  gAND(a1X,a1Y,gw,gh,'#0891b2',!!ab);
  gAND(a2X,a2Y,gw,gh,'#0891b2',!!bc);
  gAND(a3X,a3Y,gw,gh,'#0891b2',!!ac);
  // OR (3-input look)
  var orX=340,orY=80;
  w(a1X+gw,a1Y+gh/2,orX,orY+gh*0.2,!!ab);
  w(a2X+gw,a2Y+gh/2,orX,orY+gh/2,!!bc);
  w(a3X+gw,a3Y+gh/2,orX,orY+gh*0.8,!!ac);
  gOR(orX,orY,gw,gh+20,'#7c3aed',!!F);
  w(orX+gw-4,orY+(gh+20)/2,500,orY+(gh+20)/2,!!F);
  lbl(508,orY+(gh+20)/2+4,'F='+F,F?'#4ade80':'#475569','left');
}

function drawCMP(){
  var F=1-(A^B);
  var gw=80,gh=58;
  var gX=200,gY=70;
  w(30,gY+gh*0.3,gX+12,gY+gh*0.3,A);lbl(28,gY+gh*0.3+4,'A='+A,A?'#4ade80':'#f87171','right');
  w(30,gY+gh*0.7,gX+12,gY+gh*0.7,B);lbl(28,gY+gh*0.7+4,'B='+B,B?'#4ade80':'#f87171','right');
  gXNOR(gX,gY,gw,gh,'#db2777',!!F);
  ctx.fillStyle='#db2777';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('XNOR',gX+gw/2,gY-8);
  w(gX+gw+10,gY+gh/2,480,gY+gh/2,!!F);
  lbl(490,gY+gh/2+4,'F='+F,F?'#4ade80':'#475569','left');
  lbl(340,gY+gh+24,F?'A equals B':'A \u2260 B','rgba(255,255,255,0.4)');
}

function gXNOR(cx,cy,ww,h,col,act){
  ctx.fillStyle=act?col+'33':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=act?2:1.5;
  ctx.beginPath();ctx.moveTo(cx+8,cy+4);ctx.quadraticCurveTo(cx+ww/2-6,cy+h/2,cx+8,cy+h-4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+12,cy+4);ctx.quadraticCurveTo(cx+ww/2-6,cy+h/2,cx+12,cy+h-4);
  ctx.quadraticCurveTo(cx+ww/2+4,cy+h,cx+ww-14,cy+h/2);ctx.quadraticCurveTo(cx+ww/2+4,cy,cx+12,cy+4);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(cx+ww+5,cy+h/2,5,0,2*Math.PI);ctx.fillStyle=act?col+'44':'#0d1527';ctx.strokeStyle=act?col:'#334155';ctx.fill();ctx.stroke();
  var iy1=cy+h*0.3,iy2=cy+h*0.7;
  ctx.strokeStyle=act?col:'#334155';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(cx,iy1);ctx.lineTo(cx+12,iy1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,iy2);ctx.lineTo(cx+12,iy2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+ww+10,cy+h/2);ctx.lineTo(cx+ww+20,cy+h/2);ctx.stroke();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  PATTERNS[pat].draw();
}

function refresh(){
  var inp=PATTERNS[pat].inputs;
  ['A','B','S','C'].forEach(function(k){
    var v=k==='A'?A:k==='B'?B:k==='S'?S:C;
    var btn=document.getElementById('btn'+k);
    btn.textContent=k+' = '+v; btn.className='inp-btn'+(v?' hi':'');
  });
  document.getElementById('fb').textContent='';
  draw();
}

document.getElementById('btnA').onclick=function(){A^=1;refresh();};
document.getElementById('btnB').onclick=function(){B^=1;refresh();};
document.getElementById('btnS').onclick=function(){S^=1;refresh();};
document.getElementById('btnC').onclick=function(){C^=1;refresh();};
document.getElementById('btnCheck').onclick=function(){
  var ans=document.getElementById('selAnswer').value;
  var fb=document.getElementById('fb');
  if(!ans){fb.textContent='Select an answer first.';fb.style.color='#94a3b8';return;}
  var correct=PATTERNS[pat].correct;
  if(ans===correct){
    fb.innerHTML='<span style="color:#4ade80">\u2714 Correct! '+PATTERNS[pat].hint+'</span>';
  } else {
    fb.innerHTML='<span style="color:#ef4444">\u2718 Not quite. Try toggling the inputs to see the pattern. '+PATTERNS[pat].hint+'</span>';
  }
};
window.setPat=setPat;
refresh();`,
      outputHeight: 440,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You trace through a 3-input circuit and find the output column of its truth table is: 0, 0, 0, 1, 0, 1, 1, 1 (for inputs 000 through 111). What function does this circuit implement?`,
      options: [
        { label: 'A', text: 'XOR of all three inputs' },
        { label: 'B', text: 'NAND of all three inputs' },
        { label: 'C', text: 'Majority — output is 1 when 2 or more inputs are 1' },
        { label: 'D', text: 'OR of all three inputs' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. Map the output to inputs: 000→0, 001→0, 010→0, 011→1, 100→0, 101→1, 110→1, 111→1. Output is 1 exactly for 011, 101, 110, 111 — all cases where at least two of the three inputs are 1. That is the majority function.',
      failMessage: 'Check each row: 000→0, 001→0, 010→0, 011→1, 100→0, 101→1, 110→1, 111→1. Output is 1 for exactly the cases with two or three 1s: (011), (101), (110), (111). That is majority. For comparison: XOR gives 0,1,1,0,1,0,0,1. OR gives 0,1,1,1,1,1,1,1. NAND gives 1,1,1,1,1,1,1,0.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Reading Logic Diagrams

**Signal tracing**: given specific input values, propagate values gate by gate from inputs to output. Evaluate each gate in order, left to right. Every intermediate wire gets a value.

**Truth table derivation**: repeat signal tracing for all $2^N$ input combinations in binary order (000...0 to 111...1). Record every intermediate wire value as a column — this makes errors visible and verifiable.

**Boolean expression extraction**: label each gate output with its Boolean expression, substituting upstream expressions as you go. The final gate's expression describes the entire circuit.

**Patterns to recognise immediately**:
- $A \\cdot \\bar{S} + B \\cdot S$ → 2:1 Multiplexer (select line S chooses A or B)
- $AB + BC + AC$ → Majority (output 1 when ≥ 2 of 3 inputs are 1)
- XNOR(A,B) → Equality detector
- NOT → NOT → wire (double inversion cancels)
- NAND → NOT → AND (double inversion)

These three skills — trace, tabulate, express — and pattern recognition cover all combinational logic analysis. The next unit applies Boolean algebra to simplify the expressions you extract, producing circuits with fewer gates.`,
    },
  ],
};

export default {
  id: 'df-3-4-logic-diagrams',
  slug: 'reading-logic-diagrams',
  chapter: 'df.3',
  order: 4,
  title: 'Reading Logic Diagrams',
  subtitle: 'Trace signals, derive truth tables, extract Boolean expressions from any schematic.',
  tags: ['digital', 'logic-diagrams', 'signal-tracing', 'truth-table', 'boolean-expression', 'schematic', 'multiplexer', 'majority'],
  hook: {
    question: 'Given a schematic with a dozen gates and no labels, how do you determine what function it computes?',
    realWorldContext: 'Every datasheet, PCB schematic, and HDL synthesis report shows logic diagrams. Reading them fluently is the difference between understanding a circuit and being lost in it. The three skills in this lesson — trace, tabulate, express — are what chip designers do every day.',
  },
  intuition: {
    prose: [
      'Signal tracing: substitute input values, evaluate each gate left-to-right, propagate outputs.',
      'Truth table: repeat for all 2ᴺ input combinations in binary order.',
      'Expression: label each wire with its Boolean sub-expression, left to right.',
      'Patterns: MUX, majority, equality — recognise them at a glance.',
    ],
    callouts: [
      { type: 'tip', title: 'Always trace left to right', body: 'A gate cannot be evaluated until all its inputs are known. Work left-to-right in a diagram and you will always have the inputs ready before you need them.' },
      { type: 'important', title: 'Intermediate columns are not optional', body: 'When building a truth table, always include intermediate wire values as columns. Skipping them makes errors impossible to find.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Reading Logic Diagrams', props: { lesson: LESSON_DF_3_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Signal tracing: inputs → gate 1 → intermediate → gate 2 → ... → output. One step at a time.',
    'Truth table: 2ᴺ rows, binary order 000...111. One column per wire in the diagram.',
    'Boolean expression: write sub-expression at each gate output, substitute left-to-right.',
    'MUX: F = A·S̄ + B·S. Majority: F = AB+BC+AC. Equality: XNOR. Double NOT: wire.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};