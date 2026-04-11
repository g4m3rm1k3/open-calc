// Digital Fundamentals · Unit 3 · Lesson 1
// AND, OR, NOT: The Three Primitive Gates
// ScienceNotebook format

export const LESSON_DF_3_0 = {
  title: 'AND, OR, NOT: The Three Primitive Gates',
  subtitle: 'The minimal set of operations that can express any Boolean function.',
  sequential: true,
  cells: [

    // ── Section 1 — The Three Gates ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### AND, OR, NOT: The Vocabulary of Logic

Every digital circuit — however complex — is ultimately a combination of three operations. These are not design choices; they are the minimal complete basis of Boolean algebra.

**AND** — output is 1 only when *every* input is 1. "All conditions must be true." Two inputs → output is HIGH only in the row where A=1 **and** B=1. Symbol: $A \\cdot B$ or $AB$.

**OR** — output is 1 when *at least one* input is 1. "Any condition is enough." Output is LOW only in the row where A=0 **and** B=0. Symbol: $A + B$.

**NOT** — output is the complement of the single input. "Flip it." Symbol: $\\bar{A}$ or $A'$.

Truth table for all three with 2-bit input space:

| A | B | A·B (AND) | A+B (OR) | $\\bar{A}$ (NOT A) |
|---|---|-----------|----------|------------------|
| 0 | 0 |     0     |    0     |        1         |
| 0 | 1 |     0     |    1     |        1         |
| 1 | 0 |     0     |    1     |        0         |
| 1 | 1 |     1     |    1     |        0         |

The gate symbols on schematics encode the function visually: AND uses a flat-backed D-shape; OR uses a curved "shield" with a pointed output; NOT uses a small triangle with a bubble (inversion circle) at the output.`,
    },

    // ── Visual 1 — AND / OR / NOT interactive truth table ─────────────────────
    {
      type: 'js',
      instruction: `Select a gate and toggle A and B. The truth table row matching the current inputs is highlighted. The output updates in real time. When you've verified all rows, move on.`,
      html: `<div id="root" style="padding:12px;font-family:sans-serif"></div>`,
      css: `body{margin:0;color:var(--color-text-primary,#1e293b)}
.btn{padding:7px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:0.5px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b)}
.btn.active{background:#0891b2;color:#fff;border-color:#0891b2}
.inp-btn{padding:7px 18px;border-radius:8px;border:0.5px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b);font-size:13px;cursor:pointer}
.inp-btn.hi{background:#059669;color:#fff;border-color:#059669;font-weight:700}
.inp-btn.lo{background:#ef4444;color:#fff;border-color:#ef4444;font-weight:700}
.tbl td,.tbl th{padding:8px 14px;text-align:center;font-size:13px;border:0.5px solid var(--color-border-tertiary,#e2e8f0)}
.tbl th{background:var(--color-background-secondary,#f8fafc);font-size:11px;color:#64748b;font-weight:600}
.card{background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px 14px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);margin-top:8px}`,
      startCode: `var gate='AND',a=0,b=0;
var GATES={
  AND:{label:'AND  A·B',inputs:2,fn:function(a,b){return a&&b?1:0;},
    truth:[[0,0,0],[0,1,0],[1,0,0],[1,1,1]],heads:['A','B','A·B'],
    symbol:'D-shape body (flat back)',expr:'A · B',
    desc:'Output is 1 only when A AND B are both 1. "All conditions must be met."'},
  OR:{label:'OR  A+B',inputs:2,fn:function(a,b){return a||b?1:0;},
    truth:[[0,0,0],[0,1,1],[1,0,1],[1,1,1]],heads:['A','B','A+B'],
    symbol:'Curved shield body, pointed output',expr:'A + B',
    desc:'Output is 1 when A OR B (or both) is 1. "Any condition is enough."'},
  NOT:{label:'NOT  Ā',inputs:1,fn:function(a){return a?0:1;},
    truth:[[0,1],[1,0]],heads:['A','Ā'],
    symbol:'Triangle with output bubble (inversion circle)',expr:'Ā',
    desc:'Output is the complement of input A. 0→1, 1→0. "Flip it."'},
};
var root=document.getElementById('root');
function render(){
  var g=GATES[gate];
  var out=g.inputs===1?g.fn(a):g.fn(a,b);
  var rows=g.truth.map(function(r){
    var active=g.inputs===1?(r[0]===a):(r[0]===a&&r[1]===b);
    return '<tr'+(active?' style="background:rgba(8,145,178,0.1)"':'')+'>'+
      r.map(function(v){return '<td style="font-weight:'+(active?600:400)+';color:'+(v?'#059669':'#ef4444')+'">'+v+'</td>';}).join('')+'</tr>';
  }).join('');
  root.innerHTML=
    '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">'+
      Object.keys(GATES).map(function(k){return '<button class="btn'+(k===gate?' active':'')+'" onclick="gate=\\''+k+'\\';render()">'+GATES[k].label+'</button>';}).join('')+
    '</div>'+
    '<div style="font-size:22px;font-weight:700;text-align:center;margin-bottom:4px;color:#0891b2">'+g.expr+'</div>'+
    '<div style="font-size:11px;text-align:center;color:#94a3b8;margin-bottom:14px">Symbol: '+g.symbol+'</div>'+
    '<div style="display:flex;gap:6px;justify-content:center;margin-bottom:14px">'+
      '<button class="inp-btn '+(a?'hi':'lo')+'" onclick="a=a?0:1;render()">A = '+a+'</button>'+
      (g.inputs===2?'<button class="inp-btn '+(b?'hi':'lo')+'" onclick="b=b?0:1;render()">B = '+b+'</button>':'')+
    '</div>'+
    '<div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:16px">'+
      '<span style="font-size:14px;color:#64748b">Output:</span>'+
      '<span style="font-size:32px;font-weight:700;color:'+(out?'#059669':'#ef4444')+'">'+out+'</span>'+
    '</div>'+
    '<table class="tbl" style="border-collapse:collapse;width:100%;margin-bottom:8px">'+
      '<thead><tr>'+g.heads.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead>'+
      '<tbody>'+rows+'</tbody>'+
    '</table>'+
    '<div class="card"><div style="font-size:13px;color:var(--color-text-secondary,#64748b);line-height:1.7">'+g.desc+'</div></div>';
}
render();`,
      outputHeight: 440,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 3-input AND gate has inputs A=1, B=1, C=0. What is the output?`,
      options: [
        { label: 'A', text: '1 — two of the three inputs are HIGH' },
        { label: 'B', text: '0 — AND requires ALL inputs to be HIGH' },
        { label: 'C', text: '1 — majority vote: more 1s than 0s' },
        { label: 'D', text: '0 — AND produces 0 unless all inputs are 1, which always happens once C flips' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. AND is strict — ALL inputs must be 1. With C=0, the output is 0 regardless of A and B. A 3-input AND is equivalent to ((A AND B) AND C). At any level, one 0 is enough to pull the output LOW.',
      failMessage: 'AND is not majority: it requires ALL inputs to be 1. With C=0, the gate outputs 0 no matter how many other inputs are HIGH. This is what makes AND useful as a "gating" signal — one controlling input can block an entire computation.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 — Functional Completeness ───────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Functional Completeness: Why These Three Are Enough

A set of logic operations is **functionally complete** if any Boolean function — no matter how complex — can be expressed using only those operations.

{AND, OR, NOT} is functionally complete. The proof follows from the **Sum of Products (SOP)** construction:

1. Write the truth table for any function $F(A, B, C, \\ldots)$
2. For each row where $F = 1$, write a **minterm** — an AND term that is true only for that row's input combination (invert any variable that is 0 in that row)
3. OR all the minterms together

The result is a two-level AND-OR circuit that implements exactly $F$. Since any function has a truth table, and any truth table has an SOP, and SOP only needs AND + OR + NOT, these three operations can implement anything.

**Example**: $F = 1$ only when $A=1, B=0, C=1$. Minterm: $A \\cdot \\bar{B} \\cdot C$. If $F = 1$ for two rows, OR the two minterms: $F = A \\cdot \\bar{B} \\cdot C + \\bar{A} \\cdot B \\cdot C$.

This is why logic synthesis tools start with truth tables and produce AND-OR networks. The SOP form is always correct (though not always minimal).`,
    },

    // ── Visual 2 — SOP builder ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Sum of Products builder

Toggle which rows of the 3-input truth table should output 1. The tool generates the minterm for each selected row and ORs them together. Verify with the test inputs below.`,
      html: `<div style="padding:12px;font-family:sans-serif">
  <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">Select output rows (F = 1):</div>
  <div id="ttbl" style="margin-bottom:14px"></div>
  <div style="background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px 14px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);margin-bottom:12px">
    <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">SOP expression:</div>
    <div id="sop" style="font-size:13px;font-weight:500;color:#0891b2;line-height:1.8;word-break:break-all"></div>
  </div>
  <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">Test: A=<button id="ta" onclick="tA=tA?0:1;refreshTest()" style="padding:2px 8px;border-radius:6px;border:0.5px solid #0891b2;background:transparent;cursor:pointer;color:#0891b2;font-size:11px">0</button> B=<button id="tb" onclick="tB=tB?0:1;refreshTest()" style="padding:2px 8px;border-radius:6px;border:0.5px solid #0891b2;background:transparent;cursor:pointer;color:#0891b2;font-size:11px">0</button> C=<button id="tc" onclick="tC=tC?0:1;refreshTest()" style="padding:2px 8px;border-radius:6px;border:0.5px solid #0891b2;background:transparent;cursor:pointer;color:#0891b2;font-size:11px">0</button></div>
  <div id="testOut" style="font-size:14px;font-weight:600"></div>
</div>`,
      css: `body{margin:0}.row{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;cursor:pointer;margin-bottom:3px;border:0.5px solid transparent}.row:hover{border-color:var(--color-border-secondary,#e2e8f0)}.row.sel{background:rgba(8,145,178,0.08);border-color:#0891b2}`,
      startCode: `var TRUTH=[];
for(var i=0;i<8;i++){TRUTH.push({a:(i>>2)&1,b:(i>>1)&1,c:i&1,f:0});}
var tA=0,tB=0,tC=0;

function minterm(row){
  return (row.a?'A':'Ā')+'·'+(row.b?'B':'B̄')+'·'+(row.c?'C':'C̄');
}
function evalSOP(a,b,c){
  return TRUTH.some(function(row){
    return row.f&&((row.a?a:!a)&&(row.b?b:!b)&&(row.c?c:!c));
  })?1:0;
}
function renderTT(){
  var d=document.getElementById('ttbl');
  d.innerHTML='<div style="display:flex;font-size:11px;color:#94a3b8;gap:30px;padding:4px 8px;margin-bottom:2px"><span>A</span><span>B</span><span>C</span><span style="margin-left:8px">F</span></div>'+
    TRUTH.map(function(row,i){
      return '<div class="row'+(row.f?' sel':'')+'" onclick="TRUTH['+i+'].f=TRUTH['+i+'].f?0:1;renderTT();refreshSOP();">'+
        '<span style="font-size:13px;color:'+(row.a?'#059669':'#ef4444')+'">'+row.a+'</span>'+
        '<span style="width:16px;text-align:center;font-size:13px;color:'+(row.b?'#059669':'#ef4444')+'">'+row.b+'</span>'+
        '<span style="width:16px;text-align:center;font-size:13px;color:'+(row.c?'#059669':'#ef4444')+'">'+row.c+'</span>'+
        '<span style="margin-left:8px;font-size:14px;font-weight:700;color:'+(row.f?'#0891b2':'#94a3b8')+'">'+(row.f?'1':'0')+'</span>'+
      '</div>';
    }).join('');
}
function refreshSOP(){
  var sel=TRUTH.filter(function(r){return r.f;});
  var sop=sel.length===0?'F = 0 (no output is ever 1)':
          sel.length===8?'F = 1 (output is always 1)':
          'F = '+sel.map(minterm).join('  +  ');
  document.getElementById('sop').textContent=sop;
  refreshTest();
}
function refreshTest(){
  document.getElementById('ta').textContent=tA;
  document.getElementById('tb').textContent=tB;
  document.getElementById('tc').textContent=tC;
  var out=evalSOP(tA,tB,tC);
  var d=document.getElementById('testOut');
  var sel=TRUTH.filter(function(r){return r.f;});
  d.innerHTML='F('+tA+','+tB+','+tC+') = <span style="font-size:20px;color:'+(out?'#059669':'#ef4444')+'">'+out+'</span>'+
    (sel.length>0&&sel.length<8?'<span style="font-size:11px;color:#94a3b8;margin-left:8px">('+(out?'matches minterm':'no minterm matches')+')</span>':'');
}
window.refreshTest=refreshTest;
renderTT(); refreshSOP();`,
      outputHeight: 480,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `The function $F = A \\cdot \\bar{B}$ is written in Sum-of-Products form. What is the output when A=1 and B=1?`,
      options: [
        { label: 'A', text: '1 — A=1 satisfies the A part of the AND term' },
        { label: 'B', text: '0 — B=1 means B̄ = 0, making the AND output 0' },
        { label: 'C', text: '1 — the bar over B only flips a copy, the original B is still 1' },
        { label: 'D', text: '0 — SOP expressions always output 0 when both inputs are 1' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. NOT B = B̄: when B=1, B̄=0. The AND gate requires both A=1 AND B̄=1. With B=1, B̄=0, so the AND gives 0. F = A·B̄ is 1 only when A=1 AND B=0 — that is the single minterm this expression captures.',
      failMessage: 'The bar (NOT) inverts: B̄ = NOT(B). When B=1, B̄=0. A·B̄ = 1·0 = 0. F = A·B̄ is only 1 when A=1 AND B=0 simultaneously. This is how minterms work — each one picks out exactly one input combination.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 — 74xx ICs and Propagation Delay ────────────────────────────
    {
      type: 'markdown',
      instruction: `### Real Gates: 74xx ICs and Propagation Delay

Logic gates are not abstract — they are physical circuits. The classic **74xx TTL** and **74HCxx CMOS** series packages are how discrete logic reached engineers for decades.

| IC | Gate | Qty per package | Description |
|----|------|----------------|-------------|
| 7404 | NOT | 6 inverters | Hex inverter (14-pin DIP) |
| 7408 | AND | 4 × 2-input | Quad 2-input AND (14-pin DIP) |
| 7432 | OR  | 4 × 2-input | Quad 2-input OR (14-pin DIP) |
| 7411 | AND | 3 × 3-input | Triple 3-input AND |
| 7421 | AND | 2 × 4-input | Dual 4-input AND |

All 74xx chips share a 14-pin DIP pinout with VCC on pin 14 and GND on pin 7.

**Propagation delay** $t_{pd}$: the time from when an input changes to when the output reaches its new stable value. This sets the maximum clock speed. 74HC series: ~7 ns per gate. 74AHC: ~3.5 ns. FPGA LUTs: ~0.5 ns.

**Chain delay**: in a circuit with $N$ gates on the critical path, the total delay is $N \\times t_{pd}$. A 10-gate chain at 7 ns/gate = 70 ns max → cannot clocked faster than ~14 MHz without pipelining.`,
    },

    // ── Visual 3 — Gate delay chain simulator ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Propagation delay through a gate chain

Adjust the number of AND gates and the per-gate delay. Watch the signal ripple through the chain. The **critical path delay** sets the maximum safe clock period.`,
      html: `<div style="padding:12px;font-family:sans-serif">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
    <div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Gates in chain: <span id="gVal">4</span></div>
      <input type="range" min="1" max="8" value="4" oninput="gates=+this.value;document.getElementById('gVal').textContent=gates;render()" style="width:100%;accent-color:#0891b2">
    </div>
    <div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Per-gate delay: <span id="dVal">7</span> ns</div>
      <input type="range" min="1" max="20" value="7" oninput="delay=+this.value;document.getElementById('dVal').textContent=delay;render()" style="width:100%;accent-color:#7c3aed">
    </div>
  </div>
  <canvas id="cv" height="180" style="width:100%;border-radius:8px"></canvas>
  <div id="stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px"></div>
</div>`,
      css: `body{margin:0;color:var(--color-text-primary,#1e293b)}.stat{background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);text-align:center}`,
      startCode: `var gates=4,delay=7;
var canvas=document.getElementById('cv');
function render(){
  var W=canvas.getBoundingClientRect().width||400;
  canvas.width=W; canvas.height=180;
  var ctx=canvas.getContext('2d');
  var bg=getComputedStyle(document.body).getPropertyValue('--color-background-primary')||'#fff';
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,180);

  var totalDelay=gates*delay;
  var maxClock=Math.round(1000/totalDelay*10)/10;

  // Draw gate boxes
  var margin=20,available=W-2*margin,gw=Math.min(56,(available-(gates+1)*8)/(gates));
  var startX=margin+(available-(gates*gw+(gates-1)*12))/2;
  var gy=60,gh=44;

  for(var i=0;i<gates;i++){
    var gx=startX+i*(gw+12);
    var active=i<Math.ceil(gates/2);
    // AND gate body
    ctx.fillStyle=active?'rgba(8,145,178,0.12)':'rgba(100,116,139,0.08)';
    ctx.strokeStyle=active?'#0891b2':'#cbd5e1';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(gx+4,gy+4); ctx.lineTo(gx+gw/2,gy+4);
    ctx.arc(gx+gw/2,gy+gh/2,gh/2-4,-Math.PI/2,Math.PI/2);
    ctx.lineTo(gx+4,gy+gh-4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Gate label
    ctx.fillStyle=active?'#0891b2':'#94a3b8';
    ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('AND',gx+gw/2,gy+gh/2+4);
    // Delay label
    ctx.fillStyle='#94a3b8'; ctx.font='9px sans-serif';
    ctx.fillText(delay+'ns',gx+gw/2,gy+gh+14);
    // Wire after gate
    if(i<gates-1){
      ctx.strokeStyle=active?'#0891b2':'#cbd5e1'; ctx.lineWidth=active?2:1.5;
      ctx.beginPath();ctx.moveTo(gx+gw,gy+gh/2);ctx.lineTo(gx+gw+12,gy+gh/2);ctx.stroke();
    }
  }
  // Input wire
  ctx.strokeStyle='#059669'; ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(margin,gy+gh/2);ctx.lineTo(startX,gy+gh/2);ctx.stroke();
  ctx.fillStyle='#059669';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('IN = 1',margin-2,gy+gh/2-8);
  // Output wire
  var endX=startX+gates*(gw+12)-12;
  ctx.strokeStyle='#d97706'; ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(endX,gy+gh/2);ctx.lineTo(W-margin,gy+gh/2);ctx.stroke();
  ctx.fillStyle='#d97706';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('OUT after '+totalDelay+'ns',W-margin,gy+gh/2-8);

  // Timeline
  var tlY=140,tlW=W-2*margin;
  ctx.strokeStyle='rgba(100,116,139,0.3)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(margin,tlY);ctx.lineTo(W-margin,tlY);ctx.stroke();
  ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='center';
  ctx.fillText('0 ns',margin,tlY+12);ctx.fillText(totalDelay+' ns',W-margin,tlY+12);
  // Signal segments
  var segW=tlW/(gates+1);
  for(var j=0;j<=gates;j++){
    var tx=margin+j*segW;
    ctx.strokeStyle=j===0?'#059669':j===gates?'#d97706':'#0891b2';
    ctx.lineWidth=j===0||j===gates?2.5:1.5;
    ctx.beginPath();ctx.moveTo(tx,tlY-20);ctx.lineTo(tx+segW,tlY-20);ctx.stroke();
    if(j<gates){
      ctx.strokeStyle='#0891b2'; ctx.lineWidth=1;
      ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(tx+segW,tlY-20);ctx.lineTo(tx+segW,tlY-4);ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle='#94a3b8';ctx.font='8px sans-serif';ctx.textAlign='center';
    ctx.fillText(j===0?'input':j===gates?'output':'G'+j,tx+segW/2,tlY-26);
  }

  document.getElementById('stats').innerHTML=
    '<div class="stat"><div style="font-size:11px;color:#94a3b8">Total delay</div><div style="font-size:20px;font-weight:700;color:#0891b2">'+totalDelay+' ns</div></div>'+
    '<div class="stat"><div style="font-size:11px;color:#94a3b8">Max frequency</div><div style="font-size:20px;font-weight:700;color:#7c3aed">'+maxClock+' MHz</div></div>'+
    '<div class="stat"><div style="font-size:11px;color:#94a3b8">Gate count</div><div style="font-size:20px;font-weight:700;color:#d97706">'+gates+' AND</div></div>';
}
render();
window.addEventListener('resize',render);`,
      outputHeight: 360,
    },

    // ── Challenge 3 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A combinational circuit has 6 gates on its critical path, each with a propagation delay of 5 ns. What is the minimum clock period that guarantees correct operation?`,
      options: [
        { label: 'A', text: '5 ns — only the last gate\'s delay matters' },
        { label: 'B', text: '30 ns — delays sum along the critical path (6 × 5 ns)' },
        { label: 'C', text: '15 ns — average of start and end delays' },
        { label: 'D', text: '11 ns — delays accumulate but overlap due to pipelining' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Combinational delays are cumulative: each gate must fully settle before its output can drive the next. 6 gates × 5 ns = 30 ns minimum clock period → maximum frequency ≈ 33 MHz. Without pipelining, every gate on the critical path contributes directly to the minimum clock period.',
      failMessage: 'Delays through a gate chain add up sequentially. Each gate must settle before the next can start (in combinational logic — no pipelining). So 6 gates × 5 ns = 30 ns total. The clock period must be at least 30 ns (plus setup time), giving a maximum frequency of ~33 MHz.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Key Terms ─────────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Key Terms: AND, OR, NOT Gates`,
      html: `<div style="padding:12px;font-family:sans-serif">
  <input id="q" placeholder="Filter terms…" oninput="filter()" style="width:100%;margin-bottom:10px;padding:8px 12px;border-radius:8px;border:0.5px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-primary,#fff);color:var(--color-text-primary,#1e293b);font-size:13px;box-sizing:border-box">
  <div id="list"></div>
</div>`,
      css: `body{margin:0}.card{background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px 14px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);margin-bottom:6px}`,
      startCode: `var TERMS=[
  {t:'AND gate',d:'Output is 1 only when ALL inputs are 1. Boolean: A·B. Symbol: D-shape with flat back. The "gating" primitive — one 0 input blocks the output.'},
  {t:'OR gate',d:'Output is 1 when ANY input (or more) is 1. Boolean: A+B. Symbol: curved shield with pointed output. The "any wins" primitive.'},
  {t:'NOT gate',d:'The only 1-input gate. Output is the complement of input: 0→1, 1→0. Boolean: Ā. Symbol: triangle with output bubble. Also called inverter.'},
  {t:'Boolean algebra',d:'The mathematical system describing logic operations. Variables can only be 0 or 1. Operations: AND (·), OR (+), NOT (¬). Rules mirror set theory.'},
  {t:'Truth table',d:'A table listing all 2^N input combinations and the corresponding output for a logic function. The complete, unambiguous specification of any Boolean function.'},
  {t:'Minterm',d:'An AND term that is true for exactly one row of the truth table. Variables appearing as 1 are uncomplemented; variables appearing as 0 are complemented.'},
  {t:'Sum of Products (SOP)',d:'A Boolean expression in the form of OR-ed AND terms (minterms). Every truth table has a canonical SOP. SOP → direct two-level AND-OR circuit.'},
  {t:'Functional completeness',d:'A set of operations is functionally complete if any Boolean function can be expressed using only those operations. {AND, OR, NOT} is complete. NAND alone is also complete.'},
  {t:'Complement',d:'The inverse of a signal. NOT gate produces the complement. In Boolean algebra, the complement of A is Ā (A-bar) or A\\' (A-prime).'},
  {t:'74xx series',d:'The TTL logic family of DIP ICs. 7404 = hex inverter, 7408 = quad AND, 7432 = quad OR. VCC on pin 14, GND on pin 7. The classic building blocks of discrete logic.'},
  {t:'DIP package',d:'Dual Inline Package. The traditional IC form factor with two rows of through-hole pins. 14-pin DIP is standard for 74xx logic gates.'},
  {t:'Propagation delay (t_pd)',d:'Time from input change to stable output. Typically nanoseconds. Delays accumulate along gate chains — the critical path delay sets the maximum clock frequency.'},
  {t:'Critical path',d:'The longest delay path through a combinational circuit. Its total propagation delay determines the minimum clock period and maximum operating frequency.'},
  {t:'Fan-out',d:'The number of gate inputs driven by a single gate output. High fan-out increases capacitive loading, slowing transitions and increasing propagation delay.'},
  {t:'Logic symbol',d:'A standardised graphical representation of a gate used in schematics. AND: flat-backed D. OR: curved shield. NOT: triangle with bubble.'},
  {t:'Active HIGH',d:'A signal or gate input that performs its function when the logic value is 1. Most standard AND, OR, NOT gates are drawn and analysed in active HIGH convention.'},
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
      instruction: `### Summary: The Three Primitive Gates

**AND**, **OR**, and **NOT** are the fundamental operations of Boolean logic:

- **AND** ($A \\cdot B$): output HIGH only when all inputs are HIGH — the intersection of conditions
- **OR** ($A + B$): output HIGH when any input is HIGH — the union of conditions  
- **NOT** ($\\bar{A}$): output is the complement of the single input — the logical inverse

Together they are **functionally complete**: any Boolean function, no matter how complex, can be expressed as a combination of AND, OR, and NOT. The Sum of Products construction proves it: for any truth table, you can always build a two-level AND-OR circuit.

In hardware, these gates appear in **74xx ICs** (7404, 7408, 7432) with 4-6 gates per DIP package. Physical gates have **propagation delay** — each gate adds nanoseconds, and these delays accumulate along the critical path.

In the next lesson: **NAND and NOR** — the inverting gates that are each individually universal, and why NAND is the preferred primitive for real chip designs.`,
    },

  ],
};

export default {
  id: 'df-3-0-and-or-not-gates',
  slug: 'and-or-not-gates',
  chapter: 'df.3',
  order: 0,
  title: 'AND, OR, NOT: The Three Primitive Gates',
  subtitle: 'The minimal set of operations that can express any Boolean function.',
  tags: [
    'digital', 'logic-gates', 'AND', 'OR', 'NOT', 'boolean-algebra',
    'truth-table', '74xx', 'TTL', 'CMOS', 'SOP', 'functional-completeness',
    'propagation-delay', 'fan-out', 'minterm',
  ],
  hook: {
    question: 'If you had to build a computer from scratch using only three rules, what three rules would be enough to compute anything?',
    realWorldContext: 'AND, OR, and NOT are the primitive operations that underpin every chip ever made. A CPU with billions of transistors is ultimately a hierarchy of these three rules, repeated at enormous scale.',
  },
  intuition: {
    prose: [
      'AND outputs 1 only when all its inputs are 1 — "all conditions met".',
      'OR outputs 1 when any input is 1 — "any condition met".',
      'NOT flips a single bit — the only 1-input primitive.',
      'Together these three are functionally complete: any Boolean function can be expressed using only AND, OR, and NOT.',
      'Real-world 74xx ICs (7408, 7432, 7404) put four or six of these gates in a single 14-pin DIP package.',
    ],
    callouts: [
      { type: 'tip', title: 'Mnemonics', body: 'AND: "all agree". OR: "any wins". NOT: "flip it". Write the mnemonic next to the gate symbol until it becomes automatic.' },
      { type: 'important', title: 'Functional completeness', body: '{AND, OR, NOT} is a complete basis — every logic function, however complex, is a combination of these three operations. NAND alone (or NOR alone) is also complete, but AND+OR+NOT is the classical foundation.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'AND, OR, NOT: The Three Primitive Gates', props: { lesson: LESSON_DF_3_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'AND = intersection (set theory). OR = union. NOT = complement.',
    'A truth table is the complete definition of a gate. Two inputs → 4 rows; three inputs → 8 rows (2^n).',
    'SOP proof: write 1 for minterms where F=1, OR them together → implemented with AND + OR + NOT.',
    'Propagation delay accumulates along the longest gate chain — that chain sets the maximum clock speed.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
