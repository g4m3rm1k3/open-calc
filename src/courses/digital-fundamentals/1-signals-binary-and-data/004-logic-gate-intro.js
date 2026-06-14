// Digital Fundamentals · Chapter 1 · Lesson 4
// Logic Gate Introduction
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_1_4 = {
  title: 'Logic Gates',
  subtitle: 'The seven universal building blocks of digital logic.',
  sequential: true,

  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### From Transistors to Logic Gates

In the last lesson you spent time thinking about electrons, oxide layers, threshold voltages, and complementary transistor pairs. Now you seal all of that away.

A **logic gate** is an abstraction that:
1. Takes one or two binary inputs (each is 0 or 1)
2. Performs a Boolean operation
3. Produces one binary output (also 0 or 1)

The physical implementation — which transistors, which process, which voltage levels — is irrelevant once the abstraction works. A gate is a black box that maps inputs to outputs according to a fixed rule, always, with nanosecond timing and almost unlimited reliability. This is the power of abstraction in engineering.

There are seven fundamental gates. Every other digital function — adders, multiplexers, flip-flops, processors — is assembled from combinations of these seven:

| Gate | Inputs | Rule |
|------|--------|------|
| NOT | 1 | Output is the complement of input  |
| AND | 2 | Output is 1 only when **both** inputs are 1 |
| OR | 2 | Output is 1 when **at least one** input is 1 |
| NAND | 2 | NOT AND: output is 0 only when both inputs are 1 |
| NOR | 2 | NOT OR: output is 1 only when both inputs are 0 |
| XOR | 2 | Output is 1 when inputs are **different** |
| XNOR | 2 | Output is 1 when inputs are **the same** |

NAND and NOR are called **universal gates**: any Boolean function can be built from NAND gates alone (or from NOR gates alone). The entire logic of a processor can be expressed using only one gate type.`,
    },

    // ── Visual 1 — Abstraction layers ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Three levels of abstraction

Digital engineers work at different levels depending on the task. Click a layer to see what it contains. The arrow shows the direction of abstraction: higher layers use lower layers but do not depend on their internal details.`,
      html: `<div style="padding:14px">
  <canvas id="cv" width="560" height="300"></canvas>
  <div id="layerDesc" style="margin-top:12px;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.7;padding:8px 14px;border-left:2px solid rgba(255,255,255,0.12);min-height:56px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}canvas{border-radius:8px;display:block;width:100%;cursor:pointer}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var selected=-1;

var LAYERS=[
  {
    label:'System / Architecture',
    color:'#38bdf8',
    items:['Instruction set (ADD, JMP, LOAD)','CPU pipeline stages','Memory hierarchy'],
    desc:'The highest level: what the computer *does*. An architect specifies instructions and their behaviour without caring how they are implemented in logic. A program runs in this layer.',
  },
  {
    label:'Logic / Boolean',
    color:'#a78bfa',
    items:['Logic gates (AND, OR, NOT\u2026)','Boolean expressions: Y = A\u22c5(B\u2295C)','Truth tables and Karnaugh maps'],
    desc:'Gates are black boxes. A designer combines them to build adders, multiplexers, flip-flops. He writes: "Y = NAND(A, B)" \u2014 not "a P-type MOSFET whose gate is connected to\u2026"',
  },
  {
    label:'Device / Physical',
    color:'#4ade80',
    items:['NMOS / PMOS transistors','Threshold voltage, V_GS, V_DS','CMOS cell layout (nm-scale)'],
    desc:'Transistors, silicon, dopants, electric fields. A circuit designer works here when sizing transistors for speed or power. Invisible to the logic or system designer.',
  },
];

canvas.onclick=function(e){
  var rect=canvas.getBoundingClientRect();
  var y=(e.clientY-rect.top)*(H/rect.height);
  var layH=H/3;
  var idx=Math.floor(y/layH);
  if(idx>=0&&idx<3){selected=idx;draw();showDesc(idx);}
};

function showDesc(i){
  document.getElementById('layerDesc').textContent=LAYERS[i].desc;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var layH=Math.floor(H/3);
  LAYERS.forEach(function(l,i){
    var y=i*layH;
    var isSel=i===selected;
    ctx.fillStyle=isSel?l.color+'33':'rgba(255,255,255,0.04)';
    ctx.fillRect(4,y+2,W-8,layH-4);
    ctx.strokeStyle=isSel?l.color:'rgba(255,255,255,0.12)';
    ctx.lineWidth=isSel?2:1;
    ctx.strokeRect(4,y+2,W-8,layH-4);

    // Label
    ctx.fillStyle=isSel?l.color:'rgba(255,255,255,0.7)';
    ctx.font='bold 12px monospace';ctx.textAlign='left';
    ctx.fillText(l.label,16,y+22);

    // Items
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='11px monospace';
    l.items.forEach(function(item,j){
      ctx.fillText('\u2022 '+item,24,y+40+j*16);
    });

    // Arrow between layers
    if(i<2){
      var ay=y+layH-2;
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(W/2,ay);ctx.lineTo(W/2,ay+6);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.15)';
      ctx.beginPath();ctx.moveTo(W/2-5,ay+4);ctx.lineTo(W/2,ay+8);ctx.lineTo(W/2+5,ay+4);ctx.fill();
    }
  });

  if(selected===-1){
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('Click a layer to learn more',W/2,H-8);
  }
}

draw();`,
      outputHeight: 360,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Gate Library: Symbols, Truth Tables, and Mnemonics

Every gate has a standard schematic symbol, a Boolean operator notation, and a truth table. Memorise the rules; recognise the shapes.

**Boolean notation used here**:
- NOT A = **Ā** or **¬A** or **A'**
- A AND B = **A · B** or just **AB**
- A OR B = **A + B**
- XOR: **A ⊕ B**

**Mnemonic shortcuts**:
- AND: "all inputs must agree (be 1)"
- OR: "any 1 wins"
- NAND: "if any input is 0, output is 1"
- NOR: "only all-zeros gives a 1"
- XOR: "odd number of ones → output 1" (generalises to N inputs)
- XNOR: "even number of ones → output 1"; for 2 inputs: "inputs match → 1"`,
    },

    // ── Visual 2 — Interactive gate library ───────────────────────────────────
    {
      type: 'js',
      instruction: `### Interactive gate library

Click a gate tab to see its symbol and truth table. For gates with two inputs, toggle inputs A and B to explore all four input combinations. The highlighted row in the truth table shows the current output.`,
      html: `<div style="padding:12px">
  <div id="gtabs" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px"></div>
  <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="cv" width="240" height="180"></canvas>
    <div style="flex:1;min-width:200px">
      <table id="ttbl" style="border-collapse:collapse;font-size:12px;width:100%"></table>
      <div id="togRow" style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap"></div>
      <div id="gateDesc" style="margin-top:12px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.65"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
button{padding:5px 10px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:11px;cursor:pointer}
button.act{border-color:var(--gcolor);color:var(--gcolor);background:rgba(255,255,255,0.06)}
#togRow button{font-size:12px;padding:6px 14px}
th,td{padding:5px 10px;border:1px solid rgba(255,255,255,0.12);text-align:center}
th{color:rgba(255,255,255,0.6);font-weight:600}
tr.hi{background:rgba(255,255,255,0.1)}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var GATES=[
  {name:'NOT',inputs:1,color:'#059669',expr:'Y = \u00acA',
   compute:function(a){return a?0:1;},
   rows:[[0,null,1],[1,null,0]],
   mnemonic:'Inverts. The only 1-input gate.',
   desc:'NOT outputs the complement of its single input. In CMOS this is a single complementary transistor pair \u2014 the simplest and most fundamental gate.'},
  {name:'AND',inputs:2,color:'#0891b2',expr:'Y = A \u22c5 B',
   compute:function(a,b){return (a&&b)?1:0;},
   rows:[[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
   mnemonic:'Output is 1 only when ALL inputs are 1.',
   desc:'AND: all inputs must agree. Out of 4 input combinations, only one (11) gives a 1 output. Useful for detecting "all conditions met" situations.'},
  {name:'OR',inputs:2,color:'#7c3aed',expr:'Y = A + B',
   compute:function(a,b){return (a||b)?1:0;},
   rows:[[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
   mnemonic:'Output is 1 when ANY input is 1.',
   desc:'OR: at least one input is 1. Three of the four input combinations produce output 1. Useful for "any condition active" detection.'},
  {name:'NAND',inputs:2,color:'#d97706',expr:'Y = \u00ac(A\u22c5B)',
   compute:function(a,b){return (a&&b)?0:1;},
   rows:[[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
   mnemonic:'Output is 0 only when ALL inputs are 1.',
   desc:'NAND is a universal gate: any Boolean function can be built from NAND gates alone. It is the most efficient gate to build in CMOS and is used pervasively in commercial chips.'},
  {name:'NOR',inputs:2,color:'#e11d48',expr:'Y = \u00ac(A+B)',
   compute:function(a,b){return (a||b)?0:1;},
   rows:[[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
   mnemonic:'Output is 1 only when ALL inputs are 0.',
   desc:'NOR is also universal. Output is 1 only in the all-zeros case. NOR-based logic was used in the Apollo Guidance Computer (1960s). Any logic function can be realised with NOR only.'},
  {name:'XOR',inputs:2,color:'#6366f1',expr:'Y = A \u2295 B',
   compute:function(a,b){return (a^b)?1:0;},
   rows:[[0,0,0],[0,1,1],[1,0,1],[1,1,0]],
   mnemonic:'Output is 1 when inputs DIFFER.',
   desc:'XOR (exclusive-OR): output is 1 when inputs are different. Critical in arithmetic: the XOR of two bits is their binary sum without carry. The half-adder sum output is XOR.'},
  {name:'XNOR',inputs:2,color:'#db2777',expr:'Y = \u00ac(A\u2295B)',
   compute:function(a,b){return (a^b)?0:1;},
   rows:[[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
   mnemonic:'Output is 1 when inputs are THE SAME.',
   desc:'XNOR (exclusive-NOR or XNOR): output is 1 when inputs match. Used in comparators: "are these two bits equal?" If XNOR output is 1, the bits are equal.'},
];

var gIdx=0,inA=0,inB=0;

function buildTabs(){
  var row=document.getElementById('gtabs');
  GATES.forEach(function(g,i){
    var b=document.createElement('button');
    b.textContent=g.name;
    b.id='gt'+i;
    b.style.setProperty('--gcolor',g.color);
    b.onclick=function(){gIdx=i;inA=0;inB=0;refresh();};
    row.appendChild(b);
  });
}

function refresh(){
  var g=GATES[gIdx];
  GATES.forEach(function(_,i){document.getElementById('gt'+i).className=(i===gIdx)?'act':'';});

  // truth table
  var tbl=document.getElementById('ttbl');
  var hdr=g.inputs===1?'<tr><th>A</th><th>Y</th></tr>':'<tr><th>A</th><th>B</th><th>Y</th></tr>';
  var rows=g.rows.map(function(r){
    var curOut=g.inputs===1?g.compute(inA):g.compute(inA,inB);
    var isHi=(r[0]===inA&&(g.inputs===1||r[1]===inB));
    var cells=g.inputs===1?
      '<td>'+r[0]+'</td><td style="color:'+g.color+'">'+r[2]+'</td>':
      '<td>'+r[0]+'</td><td>'+r[1]+'</td><td style="color:'+g.color+'">'+r[2]+'</td>';
    return '<tr class="'+(isHi?'hi':'')+'">'+cells+'</tr>';
  }).join('');
  tbl.innerHTML=hdr+rows;

  // toggle buttons
  var tr=document.getElementById('togRow');
  tr.innerHTML='';
  function makeTog(label,val,setter){
    var b=document.createElement('button');
    b.textContent=label+': '+(val?'1':'0');
    b.style.color=val?g.color:'rgba(255,255,255,0.5)';
    b.style.borderColor=val?g.color:'rgba(255,255,255,0.2)';
    b.onclick=function(){setter(val?0:1);refresh();};
    tr.appendChild(b);
  }
  makeTog('A',inA,function(v){inA=v;});
  if(g.inputs===2) makeTog('B',inB,function(v){inB=v;});

  // description + mnemonic
  document.getElementById('gateDesc').innerHTML='<span style="color:'+g.color+';font-weight:600">'+g.expr+'</span><br><em>'+g.mnemonic+'</em><br><br>'+g.desc;

  drawGate();
}

function drawGate(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var g=GATES[gIdx];
  var cx=W/2,cy=H/2;

  var outA=g.inputs===1?g.compute(inA):g.compute(inA,inB);
  var colA=inA?'#4ade80':'#475569';
  var colB=inB?'#4ade80':'#475569';
  var colOut=outA?'#4ade80':'#ef4444';

  // Gate body
  var bx=cx-32,by=cy-36,bw=64,bh=72;
  ctx.fillStyle=g.color+'22';ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle=g.color;ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);

  // Gate name inside
  ctx.fillStyle=g.color;ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(g.name,cx,cy-6);
  ctx.font='11px monospace';ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.fillText(g.expr,cx,cy+11);
  ctx.textBaseline='alphabetic';

  // Input wires
  if(g.inputs===1){
    ctx.strokeStyle=colA;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(40,cy);ctx.lineTo(bx,cy);ctx.stroke();
    ctx.fillStyle=colA;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(inA,28,cy);
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
    ctx.fillText('A',18,cy-8);
  } else {
    var y1=cy-20,y2=cy+20;
    ctx.strokeStyle=colA;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(30,y1);ctx.lineTo(bx,y1);ctx.stroke();
    ctx.strokeStyle=colB;
    ctx.beginPath();ctx.moveTo(30,y2);ctx.lineTo(bx,y2);ctx.stroke();
    ctx.fillStyle=colA;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(inA,18,y1);
    ctx.fillStyle=colB;ctx.fillText(inB,18,y2);
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
    ctx.textAlign='right';ctx.fillText('A',12,y1-8);
    ctx.fillText('B',12,y2-8);
  }

  // Output wire
  ctx.strokeStyle=colOut;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(bx+bw,cy);ctx.lineTo(W-30,cy);ctx.stroke();
  ctx.fillStyle=colOut;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(outA,W-18,cy);
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('Y',W-8,cy-8);

  // Bubble on output for inverting gates
  if(g.name==='NOT'||g.name==='NAND'||g.name==='NOR'||g.name==='XNOR'){
    ctx.beginPath();ctx.arc(bx+bw+7,cy,6,0,Math.PI*2);
    ctx.strokeStyle=g.color;ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#0a0f1e';ctx.fill();
  }
}

buildTabs();
refresh();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Which gate outputs 1 only when its two inputs are different from each other?`,
      options: [
        { label: 'A', text: 'OR — because it outputs 1 unless both inputs are 0' },
        { label: 'B', text: 'NAND — because it outputs 0 only when both inputs are 1' },
        { label: 'C', text: 'XOR — because it outputs 1 exactly when the two inputs differ' },
        { label: 'D', text: 'NOR — because it outputs 1 only when both inputs are 0' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct! XOR (exclusive-OR) outputs 1 when inputs are different: 01→1, 10→1, but 00→0 and 11→0. This makes XOR essential for binary arithmetic — the sum bit of a half-adder is XOR(A, B). XNOR is the complement: it outputs 1 when inputs match.',
      failMessage: 'OR outputs 1 for 11 which XNOR does also; NAND outputs 1 for 00, 01, 10 — three cases. XOR is specifically the "different inputs" gate: truth table rows 01 and 10 give output 1, while 00 and 11 both give output 0. Think: "eXclusive OR — only one XOR the other."',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Propagation Delay

Gates are not instantaneous. After an input changes, the output takes a finite time to settle, called **propagation delay** (t_pd or t_p).

There are two variants:
- **t_pHL**: time from input change to output transitioning from High to Low
- **t_pLH**: time from input change to output transitioning from Low to High

Typical propagation delays in modern processes:
- Standard cell gate: **50–200 picoseconds** (10⁻¹² s) at 5 nm node
- The difference between t_pHL and t_pLH arises because PMOS and NMOS transistors have different mobilities — electrons in NMOS are more mobile than holes in PMOS, so NMOS pulls down faster.

**Combinational logic depth** (the number of gates a signal must pass through from input to output) determines the minimum clock period:

$T_{clock} \geq n \times t_{pd,max}$

where $n$ is the maximum logic depth and $t_{pd,max}$ is the slowest gate's delay. This is the fundamental timing constraint of synchronous digital design.

**Glitches**: because different paths through a combinational circuit have different propagation delays, intermediate outputs can briefly show incorrect values before all signals settle. Registers (flip-flops) at the end of combinational stages suppress glitches by only sampling at the stable point.`,
    },

    // ── Visual 3 — Multi-gate circuit ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Multi-gate circuit: NAND followed by NOT

This circuit implements: **Y = ¬(¬(A · B)) = A · B** — which is just AND, but built from two simpler gates. Toggle inputs A and B and verify that the output matches the AND truth table. Watch how the intermediate signal (NAND output) changes first, then the NOT output follows.`,
      html: `<div style="padding:16px">
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
    <button id="btnA">A = 0</button>
    <button id="btnB">B = 0</button>
    <span id="logic" style="font-size:12px;color:rgba(255,255,255,0.5);margin-left:8px"></span>
  </div>
  <canvas id="cv" width="560" height="200"></canvas>
  <div style="display:flex;gap:20px;margin-top:12px;flex-wrap:wrap">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Truth table for Y = A AND B</div>
      <table id="ttbl" style="border-collapse:collapse;font-size:12px"></table>
    </div>
    <div id="circDesc" style="font-size:12px;color:rgba(255,255,255,0.55);line-height:1.7;flex:1;min-width:180px"></div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
button{padding:6px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.6);font-family:monospace;font-size:12px;cursor:pointer}
button.on{color:#4ade80;border-color:#4ade80;background:rgba(74,222,128,0.1)}
th,td{padding:4px 10px;border:1px solid rgba(255,255,255,0.1);text-align:center;font-size:12px}
th{color:rgba(255,255,255,0.5);font-weight:600}
tr.hi{background:rgba(255,255,255,0.08)}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var inA=0,inB=0;

document.getElementById('btnA').onclick=function(){inA=inA?0:1;refresh();};
document.getElementById('btnB').onclick=function(){inB=inB?0:1;refresh();};

function refresh(){
  var na=document.getElementById('btnA'),nb=document.getElementById('btnB');
  na.textContent='A = '+inA;na.className=inA?'on':'';
  nb.textContent='B = '+inB;nb.className=inB?'on':'';
  var mid=(inA&&inB)?0:1;
  var out=mid?0:1;
  document.getElementById('logic').textContent='NAND(A,B) = '+mid+' \u2192 NOT = '+out;
  document.getElementById('circDesc').innerHTML=
    'Current inputs: A='+inA+', B='+inB+'<br>'+
    'NAND output: \u00ac('+inA+'\u22c5'+inB+') = '+mid+'<br>'+
    'NOT output: \u00ac'+mid+' = <strong style="color:'+(out?'#4ade80':'#ef4444')+'">'+out+'</strong><br><br>'+
    'The NAND\u2013NOT combination exactly mirrors an AND gate. This pattern appears in real CMOS: AND is synthesised as NAND + inverter because NAND has fewer transistors in its pull-down network.';
  buildTable(out);
  draw(mid,out);
}

function buildTable(curOut){
  var rows=[[0,0,0],[0,1,0],[1,0,0],[1,1,1]];
  var hdr='<tr><th>A</th><th>B</th><th>Y</th></tr>';
  var body=rows.map(function(r){
    var hi=r[0]===inA&&r[1]===inB;
    return '<tr class="'+(hi?'hi':'')+'"><td>'+r[0]+'</td><td>'+r[1]+'</td><td style="color:'+(r[2]?'#4ade80':'#ef4444')+'">'+r[2]+'</td></tr>';
  }).join('');
  document.getElementById('ttbl').innerHTML=hdr+body;
}

function seg(x1,y1,x2,y2,on){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=on?'#4ade80':'#334155';ctx.lineWidth=on?2.5:1.5;ctx.stroke();
}

function gateBox(x,y,w,h,label,col,on){
  ctx.fillStyle=col+'22';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=on?col:'rgba(255,255,255,0.2)';ctx.lineWidth=on?2:1.5;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle=on?col:'rgba(255,255,255,0.5)';ctx.font='bold 11px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,x+w/2,y+h/2);ctx.textBaseline='alphabetic';
}

function draw(mid,out){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var cy=H/2;
  var gW=90,gH=56;
  var g1x=120,g2x=300;
  var gy=cy-gH/2;

  // Input wires into NAND
  var y1=cy-16,y2=cy+16;
  seg(28,y1,g1x,y1,inA);seg(28,y2,g2x,y2,inB);
  // Vertical bus
  seg(28,y1,28,y2,inA||inB);
  seg(28,y1,g1x,y1,inA);
  seg(28,y2,g1x,y2,inB);

  // Input circles
  [y1,y2].forEach(function(yy,i){
    var val=i?inB:inA;
    ctx.beginPath();ctx.arc(14,yy,10,0,Math.PI*2);
    ctx.fillStyle=val?'rgba(74,222,128,0.15)':'rgba(71,85,105,0.3)';ctx.fill();
    ctx.strokeStyle=val?'#4ade80':'#475569';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=val?'#4ade80':'#94a3b8';ctx.font='bold 10px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(val,14,yy);
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='left';
    ctx.fillText(i?'B':'A',2,yy-12);
  });

  // NAND gate
  var nandOn=mid===0;
  gateBox(g1x,gy,gW,gH,'NAND','#d97706',nandOn);
  // bubble
  ctx.beginPath();ctx.arc(g1x+gW+6,cy,6,0,Math.PI*2);
  ctx.strokeStyle='#d97706';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#0a0f1e';ctx.fill();

  // Middle wire
  seg(g1x+gW+12,cy,g2x,cy,nandOn);
  // Mid label
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('mid='+mid,(g1x+gW+12+g2x)/2,cy-10);

  // NOT gate
  var notOn=out===1;
  gateBox(g2x,gy,gW,gH,'NOT','#059669',notOn);
  // bubble
  ctx.beginPath();ctx.arc(g2x+gW+6,cy,6,0,Math.PI*2);
  ctx.strokeStyle='#059669';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#0a0f1e';ctx.fill();

  // Output wire
  seg(g2x+gW+12,cy,W-30,cy,notOn);
  // Output circle
  ctx.beginPath();ctx.arc(W-18,cy,12,0,Math.PI*2);
  ctx.fillStyle=out?'rgba(74,222,128,0.2)':'rgba(239,68,68,0.15)';ctx.fill();
  ctx.strokeStyle=out?'#4ade80':'#ef4444';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=out?'#4ade80':'#ef4444';ctx.font='bold 11px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(out,W-18,cy);
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('Y',W-4,cy-14);

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('NAND',g1x+gW/2,gy-8);ctx.fillText('NOT',g2x+gW/2,gy-8);
  ctx.fillText('Y = \u00ac(A\u22c5B) then NOT \u2192 Y = A\u22c5B',W/2,H-8);
}

refresh();`,
      outputHeight: 380,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Why is NAND called a "universal gate"?`,
      options: [
        { label: 'A', text: 'Because NAND gates work at all voltage levels and process nodes' },
        { label: 'B', text: 'Because any Boolean logic function can be implemented using only NAND gates' },
        { label: 'C', text: 'Because NAND is the most common gate used in real processors' },
        { label: 'D', text: 'Because NAND replaces both AND and OR in one package' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! NAND is functionally complete: you can build NOT, AND, OR, and from those any Boolean function, using only NAND gates. NOT(A) = NAND(A,A). AND(A,B) = NOT(NAND(A,B)). OR(A,B) = NAND(NOT(A), NOT(B)). Because of this, chip designers can target a library of just one cell type if needed. NOR is also universal.',
      failMessage: 'Universality here is a mathematical property: a gate type is "universal" if you can construct NOT, AND, and OR using only that gate. From those three you can build any Boolean logic function. NAND achieves this: NAND(A,A) = NOT(A); NOT(NAND(A,B)) = AND(A,B); etc. Every logic expression ever written can be translated into a NAND-only circuit.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Key Terms ─────────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Key Terms: Logic Gates`,
      html: `<div style="padding:12px;font-family:sans-serif">
  <input id="q" placeholder="Filter terms…" oninput="filter()" style="width:100%;margin-bottom:10px;padding:8px 12px;border-radius:8px;border:0.5px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-primary,#fff);color:var(--color-text-primary,#1e293b);font-size:13px;box-sizing:border-box">
  <div id="list"></div>
</div>`,
      css: `body{margin:0}.card{background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px 14px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);margin-bottom:6px}`,
      startCode: `var TERMS=[
  {t:'Abstraction layer',d:'A level of description that hides lower-level details. Logic gates are the abstraction above transistors — you work with truth tables, not voltages.'},
  {t:'Logic gate',d:'A digital circuit with one or two binary inputs and one binary output, implementing a Boolean function. The basic building block of all digital systems.'},
  {t:'Logic symbol',d:'A standardised graphical shape representing a gate in circuit diagrams (e.g., D-shape for AND, curved D for OR, circle for NOT/inversion).'},
  {t:'Truth table',d:'A table listing every possible input combination and the corresponding output for a logic gate or Boolean expression.'},
  {t:'Boolean expression',d:'A formula using variables and operators (AND ·, OR +, NOT ¬) that describes the logic of a circuit. E.g., F = A · B + ¬C.'},
  {t:'NOT gate',d:'Output is the inverse of the single input. Symbol: triangle with a bubble. Boolean: Y = ¬A. Also called inverter.'},
  {t:'AND gate',d:'Output is 1 only when ALL inputs are 1. Symbol: D-shape. Boolean: Y = A · B. Implements logical conjunction.'},
  {t:'OR gate',d:'Output is 1 when ANY input is 1. Symbol: curved D-shape. Boolean: Y = A + B. Implements logical disjunction.'},
  {t:'NAND gate',d:'NOT-AND. Output is 0 only when ALL inputs are 1; otherwise 1. Universal — any logic can be built from NAND alone. Boolean: Y = ¬(A·B).'},
  {t:'NOR gate',d:'NOT-OR. Output is 1 only when ALL inputs are 0; otherwise 0. Universal — any logic can be built from NOR alone. Boolean: Y = ¬(A+B).'},
  {t:'XOR gate',d:'Exclusive OR. Output is 1 when inputs differ. Boolean: Y = A ⊕ B = A·¬B + ¬A·B. Key component in adders and parity generators.'},
  {t:'XNOR gate',d:'Exclusive NOR. Output is 1 when inputs are equal. Boolean: Y = ¬(A ⊕ B). Used in equality comparators.'},
  {t:'Universal gate',d:'A single gate type from which any Boolean function can be implemented. NAND and NOR are universal; AND/OR/NOT together are also sufficient.'},
  {t:'Propagation delay (t_pd)',d:'The time from when an input changes to when the output settles at its new stable value. Limits the maximum clock frequency of a digital circuit.'},
  {t:'Critical path',d:'The longest combinational path through a circuit in terms of propagation delay. Determines the minimum clock period and maximum speed.'},
  {t:'Fan-in',d:'The number of inputs to a single logic gate. High fan-in increases delay and physical size. Complex gates are often split into smaller stages.'},
  {t:'Fan-out',d:'The number of gate inputs a single output drives. High fan-out increases capacitive load and propagation delay. Buffers are inserted to restore drive strength.'},
];
function filter(){
  var q=document.getElementById('q').value.toLowerCase();
  var terms=q?TERMS.filter(function(x){return x.t.toLowerCase().includes(q)||x.d.toLowerCase().includes(q);}):TERMS;
  document.getElementById('list').innerHTML=terms.map(function(x){
    return '<div class="card"><div style="font-size:13px;font-weight:500;color:#0891b2;margin-bottom:3px">'+x.t+'</div>'+
           '<div style="font-size:13px;color:var(--color-text-secondary,#64748b);line-height:1.6">'+x.d+'</div></div>';
  }).join('');
}
filter();`,
      outputHeight: 420,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: The Seven Gates

You have now learned the complete foundation of Boolean logic in hardware:

- **NOT**: complement; 1 input
- **AND**: all-or-nothing; output 1 only when all inputs are 1
- **OR**: any-wins; output 1 when at least one input is 1
- **NAND**: NOT AND; universal gate — can build any logic function alone
- **NOR**: NOT OR; also universal
- **XOR**: difference detector; essential for arithmetic (sum bit = XOR)
- **XNOR**: equality detector; output 1 when inputs match

**Key facts to carry forward**:
- NAND and NOR are universal: every logic function = NAND-only (or NOR-only)
- XOR is the binary adder's sum bit; AND is the carry bit — these are the atoms of the ALU
- Propagation delay accumulates through gate chains — this is why clock frequency is finite
- Real combinational circuits are translated to gate netlists; synthesis tools optimise for area, speed, and power

The next step is to combine these gates into computational structures: adders, comparators, multiplexers. All of those emerge from the seven gates you now know.`,
    },
  ],
};

export default {
  id: 'df-1-4-logic-gate-intro',
  slug: 'logic-gate-intro',
  chapter: 'df.1',
  order: 4,
  title: 'Logic Gates',
  subtitle: 'The seven universal building blocks of digital logic.',
  tags: ['digital', 'logic-gates', 'boolean', 'NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR', 'truth-table', 'propagation-delay'],
  hook: {
    question: 'How does a processor built from billions of switches compute anything useful — what are the primitive rules it follows?',
    realWorldContext: 'Every arithmetic operation, every comparison, every branch in a program ultimately executes as a combination of these seven gate operations happening in parallel, billions of times per second.',
  },
  intuition: {
    prose: [
      'A logic gate is a black box: fixed inputs → fixed output, always, fast, reliably.',
      '7 gates: NOT, AND, OR, NAND, NOR, XOR, XNOR.',
      'NAND (and NOR) are universal: any logic function can be built from one gate type alone.',
      'XOR is the sum bit; AND is the carry bit — the atoms of addition.',
    ],
    callouts: [
      { type: 'tip', title: 'Mnemonic', body: 'AND: all agree. OR: any wins. XOR: they differ. NAND/NOR: add a NOT bubble to AND/OR. XNOR: they match.' },
      { type: 'important', title: 'Universal gates', body: 'NAND and NOR are functionally complete. Any Boolean expression can be translated into a circuit using only NAND gates. This is used in cell libraries and PLDs.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Logic Gate Intro', props: { lesson: LESSON_DF_1_4 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Gate = smallest Boolean unit. Input(s) → immediate output by a fixed rule.',
    'Truth table = complete specification of a gate. Memorise NOT, AND, OR; derive NAND/NOR/XOR/XNOR from those.',
    'Any digital circuit = tree of gates. Trace from inputs to outputs following each gate\'s rule.',
    'Clock period must exceed the longest path through all gate delays — this is the critical path.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
