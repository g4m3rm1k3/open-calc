// Digital Fundamentals · Unit 5 · Lesson 4
// Decoders and Encoders
// ScienceNotebook format

export const LESSON_DF_5_4 = {
  title: 'Decoders and Encoders',
  subtitle: 'Converting between binary codes and one-hot representations — address decoding, 7-segment displays, and priority arbitration.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Binary Decoder

A **binary decoder** converts a binary address into a one-hot output — exactly one of its $2^N$ outputs is active (HIGH) for each of the $2^N$ possible N-bit input combinations.

A 2-to-4 decoder takes a 2-bit input (A₁A₀) and activates one of four outputs:

$$Y_0 = \\bar{A_1} \\cdot \\bar{A_0} \\qquad Y_1 = \\bar{A_1} \\cdot A_0 \\qquad Y_2 = A_1 \\cdot \\bar{A_0} \\qquad Y_3 = A_1 \\cdot A_0$$

Each output is a **minterm** of the input variables. A 3-to-8 decoder generates all 8 minterms of three variables. This makes decoders directly useful for SOP circuit implementation — connect decoder outputs to an OR gate and you implement any Sum-of-Products expression with no additional AND gates.

**Enable input**: most decoder ICs have an active-low enable pin (G̅ or E̅). When enable is HIGH (disabled), all outputs are forced LOW regardless of address inputs. This allows multiple decoders to share address lines — only the enabled decoder responds.

**Active-low outputs**: real decoder ICs like the 74HC138 have active-low outputs (Y̅₀ through Y̅₇). The selected output goes LOW; all others remain HIGH. This is convenient for driving active-low chip-select pins on memory and peripheral ICs.

**Gate cost**: an N-to-2ᴺ decoder uses $2^N$ AND gates (one per minterm), each with N inputs. Plus N NOT gates for the complemented inputs.`,
    },

    // ── Visual 1 — 2-to-4 decoder interactive ────────────────────────────────
    {
      type: 'js',
      instruction: `### 2-to-4 decoder: one-hot output

Toggle A1 and A0 to select the active output. The AND gate structure generating each minterm is shown — every output is one AND gate of the input literals.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="bA1" class="inp-btn">A1 = 0</button>
    <button id="bA0" class="inp-btn">A0 = 0</button>
    <div id="enRow" style="display:flex;align-items:center;gap:8px;margin-left:auto">
      <span style="font-size:11px;color:rgba(255,255,255,0.3)">Enable (active-low):</span>
      <button id="bEN" class="en-btn">G̅ = 0 (enabled)</button>
    </div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <canvas id="deccv" width="360" height="280"></canvas>
    <div style="flex:1;min-width:160px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Outputs</div>
      <div id="decOuts" style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px"></div>
      <div id="decNote" style="font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.inp-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.5);background:rgba(239,68,68,0.1);color:#f87171;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}
.inp-btn.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.en-btn{padding:5px 12px;border-radius:8px;border:1.5px solid rgba(74,222,128,0.4);background:rgba(74,222,128,0.06);color:#4ade80;font-family:monospace;font-size:11px;cursor:pointer}
.en-btn.dis{border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.06);color:#f87171}
.out-row{padding:6px 12px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.08);font-size:12px;font-family:monospace;color:rgba(255,255,255,0.2)}
.out-row.active{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80;font-weight:700}`,
      startCode: `
var A1=0,A0=0,EN=0; // EN=0 means enabled (active-low)
var cv=document.getElementById('deccv'),ctx=cv.getContext('2d');

function andGate(c,x,y,w,h,col,active,nIn){
  c.fillStyle=active?col+'33':'#0d1527';
  c.strokeStyle=active?col:'#334155'; c.lineWidth=active?2:1.5;
  c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+w/2-4,y+4);
  c.arc(x+w/2-4,y+h/2,h/2-4,-Math.PI/2,Math.PI/2);
  c.lineTo(x+4,y+h-4);c.closePath();c.fill();c.stroke();
}
function wire(c,x1,y1,x2,y2,v){
  c.strokeStyle=v?'#4ade80':'#475569'; c.lineWidth=v?2.5:1.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function dot(c,x,y,v){c.beginPath();c.arc(x,y,4,0,2*Math.PI);c.fillStyle=v?'#4ade80':'#475569';c.fill();}
function bubble(c,x,y,v){
  c.beginPath();c.arc(x,y,5,0,2*Math.PI);
  c.fillStyle=v?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.04)';
  c.strokeStyle=v?'#ef4444':'#334155'; c.lineWidth=1.5; c.fill(); c.stroke();
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var enabled=(EN===0);
  var addr=A1*2+A0;
  var outs=[0,0,0,0];
  if(enabled) outs[addr]=1;

  var notA1=A1?0:1, notA0=A0?0:1;
  var minterms=[notA1&notA0, notA1&A0, A1&notA0, A1&A0];

  var gw=60,gh=48;
  var gateX=200;
  var gateYs=[20,90,160,228];
  var forkA1=40, forkA0=70;

  // NOT outputs (inverted lines)
  var notY1=H/2-30, notY0=H/2+10;

  // Draw input trunk lines
  wire(ctx,16,notY1,W,notY1,A1); // A1 horizontal
  wire(ctx,16,notY0,W,notY0,A0); // A0 horizontal
  ctx.fillStyle=A1?'#4ade80':'#f87171';ctx.font='500 11px monospace';ctx.textAlign='right';
  ctx.fillText('A1='+A1,14,notY1+4);
  ctx.fillStyle=A0?'#4ade80':'#f87171';
  ctx.fillText('A0='+A0,14,notY0+4);

  // NOT bubbles on the lines
  bubble(ctx,forkA1,notY1,!A1); // A1 with bubble = Ā1
  bubble(ctx,forkA0,notY0,!A0); // A0 with bubble = Ā0

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('Ā1',forkA1,notY1-10); ctx.fillText('Ā0',forkA0,notY0-10);
  ctx.fillText('A1',forkA1+40,notY1-10); ctx.fillText('A0',forkA0+40,notY0-10);

  // Each AND gate
  var termDefs=[
    {a1:notA1,a0:notA0,la:'Ā1',la0:'Ā0',useNA1:true,useNA0:true},
    {a1:notA1,a0:A0,   la:'Ā1',la0:'A0',useNA1:true,useNA0:false},
    {a1:A1,   a0:notA0,la:'A1',la0:'Ā0',useNA1:false,useNA0:true},
    {a1:A1,   a0:A0,   la:'A1',la0:'A0',useNA1:false,useNA0:false},
  ];

  termDefs.forEach(function(td,i){
    var gy=gateYs[i];
    var active=(outs[i]&&enabled);

    // Wires from trunk to gate
    var in1x=td.useNA1?forkA1+5:forkA1+40;
    var in2x=td.useNA0?forkA0+5:forkA0+40;
    wire(ctx,in1x,notY1,in1x,gy+gh*0.3,td.a1);
    wire(ctx,in1x,gy+gh*0.3,gateX,gy+gh*0.3,td.a1);
    wire(ctx,in2x,notY0,in2x,gy+gh*0.7,td.a0);
    wire(ctx,in2x,gy+gh*0.7,gateX,gy+gh*0.7,td.a0);
    dot(ctx,in1x,notY1,td.a1);dot(ctx,in2x,notY0,td.a0);

    andGate(ctx,gateX,gy,gw,gh,'#38bdf8',active,2);
    ctx.fillStyle='#38bdf8';ctx.font='7px monospace';ctx.textAlign='center';
    ctx.fillText(td.la+'\u00b7'+td.la0,gateX+gw/2,gy-4);

    // Output
    var outV=(enabled&&minterms[i])?1:0;
    wire(ctx,gateX+gw,gy+gh/2,W-16,gy+gh/2,!!outV);
    ctx.fillStyle=outV?'#4ade80':'rgba(255,255,255,0.2)';
    ctx.font=(active?'bold ':'')+'10px monospace';ctx.textAlign='left';
    ctx.fillText('Y'+i+'='+outV,W-14,gy+gh/2+4);
  });

  // Enable line
  if(!enabled){
    ctx.fillStyle='rgba(239,68,68,0.3)';
    ctx.fillRect(gateX-4,gateYs[0],gw+8,gateYs[3]+gh-gateYs[0]);
    ctx.fillStyle='#ef4444';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('DISABLED',gateX+gw/2,(gateYs[0]+gateYs[3]+gh)/2);
  }
}

function buildOuts(){
  var enabled=(EN===0);
  var addr=A1*2+A0;
  var div=document.getElementById('decOuts');div.innerHTML='';
  for(var i=0;i<4;i++){
    var v=(enabled&&i===addr)?1:0;
    var d=document.createElement('div');
    d.className='out-row'+(v?' active':'');
    d.textContent='Y'+i+' = '+v+'  ('+['Ā1·Ā0','Ā1·A0','A1·Ā0','A1·A0'][i]+')';
    div.appendChild(d);
  }
}

function refresh(){
  document.getElementById('bA1').textContent='A1 = '+A1;
  document.getElementById('bA1').className='inp-btn'+(A1?' hi':'');
  document.getElementById('bA0').textContent='A0 = '+A0;
  document.getElementById('bA0').className='inp-btn'+(A0?' hi':'');
  var eb=document.getElementById('bEN');
  eb.textContent='G\u0305 = '+EN+(EN===0?' (enabled)':' (disabled)');
  eb.className='en-btn'+(EN?' dis':'');
  buildOuts();draw();
  var enabled=(EN===0);
  document.getElementById('decNote').textContent=
    enabled
      ?'Address A1A0='+A1+''+A0+'b ('+( A1*2+A0)+') activates Y'+(A1*2+A0)+'. All other outputs = 0. One-hot output.'
      :'Decoder disabled (G̅=1). All outputs forced LOW regardless of address inputs.';
}
document.getElementById('bA1').onclick=function(){A1^=1;refresh();};
document.getElementById('bA0').onclick=function(){A0^=1;refresh();};
document.getElementById('bEN').onclick=function(){EN^=1;refresh();};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 3-to-8 decoder has inputs A2=1, A1=0, A0=1. Which output is active, and what is its Boolean expression?`,
      options: [
        { label: 'A', text: 'Y5 = A2·Ā1·A0 — binary 101 = decimal 5' },
        { label: 'B', text: 'Y6 = A2·A1·Ā0 — binary 110 = decimal 6' },
        { label: 'C', text: 'Y4 = A2·Ā1·Ā0 — binary 100 = decimal 4' },
        { label: 'D', text: 'Y7 = A2·A1·A0 — all bits are 1' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. A2A1A0 = 101 binary = 5 decimal. Y5 is the output corresponding to minterm 5, which is A2·Ā1·A0 — the product of A2 (true, since A2=1), NOT A1 (true, since A1=0), and A0 (true, since A0=1).',
      failMessage: 'A2=1, A1=0, A0=1 → binary 101 → decimal 5. Output Y5 is active. Its expression is the minterm of binary 5: A2·Ā1·A0 (A2 true, A1 complemented because it is 0, A0 true).',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Binary Encoder

An **encoder** is the inverse of a decoder. It takes $2^N$ one-hot inputs (exactly one is HIGH at a time) and produces an N-bit binary output representing which input is active.

A 4-to-2 encoder takes inputs I0–I3 (exactly one HIGH) and outputs A1, A0:

$$A_1 = I_2 + I_3 \\qquad A_0 = I_1 + I_3$$

The output is the binary address of the active input. This works because:
- I0 active → (A1=0, A0=0)
- I1 active → (A1=0, A0=1)
- I2 active → (A1=1, A0=0)
- I3 active → (A1=1, A0=1)

**Limitation**: a basic encoder only works correctly when **exactly one input** is HIGH. If two inputs are simultaneously HIGH (which happens in real systems — two devices requesting service at the same time), the output is the OR of their individual codes, which may not correspond to either input.

**The priority encoder** solves this: when multiple inputs are simultaneously HIGH, it outputs the binary address of the **highest-priority** (typically highest-numbered) active input, and asserts a **V (valid)** output indicating at least one input is active.

$$A_1 = I_3 + I_2 \\qquad A_0 = I_3 + (\\bar{I_2} \\cdot I_1) \\qquad V = I_3 + I_2 + I_1 + I_0$$

Priority encoders are the core of interrupt controllers (which input gets the CPU's attention first?), arbitration circuits (which bus master wins?), and floating-point normalisation (which is the highest-order 1 bit?).`,
    },

    // ── Visual 2 — Encoder and priority encoder ───────────────────────────────
    {
      type: 'js',
      instruction: `### Basic encoder vs priority encoder

Toggle the active inputs. In basic mode, simultaneous HIGH inputs produce a corrupted output. Switch to priority mode — the highest-numbered active input wins cleanly. The V flag confirms at least one input is asserted.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="tab-btn active" id="eBasic" onclick="setEncMode('basic')">Basic encoder</button>
    <button class="tab-btn"        id="ePri"   onclick="setEncMode('priority')">Priority encoder</button>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <div style="flex:0 0 auto">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Inputs (click to toggle)</div>
      <div id="encInputs" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px"></div>
    </div>
    <canvas id="enccv" width="300" height="220"></canvas>
    <div style="flex:1;min-width:160px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Outputs</div>
      <div id="encOuts" style="font-size:13px;line-height:2;margin-bottom:8px"></div>
      <div id="encNote" style="font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.tab-btn.active{border-color:#f472b6;background:rgba(219,39,119,0.1);color:#f472b6}
.enc-in{padding:6px 14px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);font-size:12px;font-family:monospace;color:rgba(255,255,255,0.25);cursor:pointer;text-align:left}
.enc-in.hi{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80;font-weight:700}`,
      startCode: `
var encMode='basic';
var inputs=[0,0,0,0]; // I0..I3
var cv=document.getElementById('enccv'),ctx=cv.getContext('2d');

function basicEncode(inp){
  var A1=(inp[2]||inp[3])?1:0;
  var A0=(inp[1]||inp[3])?1:0;
  var V=(inp[0]||inp[1]||inp[2]||inp[3])?1:0;
  var multi=inp.filter(Boolean).length>1;
  return {A1:A1,A0:A0,V:V,valid:!multi,multi:multi};
}
function priEncode(inp){
  var A1=(inp[3]||inp[2])?1:0;
  var A0=(inp[3]||((!inp[2])&&inp[1]))?1:0;
  var V=(inp[0]||inp[1]||inp[2]||inp[3])?1:0;
  // Which input is highest priority?
  var pri=inp[3]?3:inp[2]?2:inp[1]?1:inp[0]?0:-1;
  return {A1:A1,A0:A0,V:V,pri:pri,valid:true};
}

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var res=encMode==='basic'?basicEncode(inputs):priEncode(inputs);
  var isOK=res.valid;

  // Box
  var bx=80,by=40,bw=90,bh=140;
  ctx.fillStyle=isOK?'rgba(244,114,182,0.06)':'rgba(239,68,68,0.06)';
  ctx.strokeStyle=isOK?'#f472b6':'#ef4444'; ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=isOK?'#f472b6':'#ef4444';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText(encMode==='basic'?'4-to-2':'Priority',bx+bw/2,by+16);
  ctx.fillText('Encoder',bx+bw/2,by+28);

  // Input wires
  var iSpacing=bh/5;
  for(var i=3;i>=0;i--){
    var iy=by+iSpacing*(4-i);
    ctx.strokeStyle=inputs[i]?'#4ade80':'#475569'; ctx.lineWidth=inputs[i]?2.5:1.5;
    ctx.beginPath();ctx.moveTo(14,iy);ctx.lineTo(bx,iy);ctx.stroke();
    ctx.fillStyle=inputs[i]?'#4ade80':'rgba(255,255,255,0.2)';
    ctx.font=(inputs[i]?'bold ':'')+'11px monospace';ctx.textAlign='right';
    ctx.fillText('I'+i+'='+inputs[i],12,iy+4);
    // Priority marker
    if(encMode==='priority'&&i>0&&inputs[i]){
      ctx.fillStyle='rgba(251,191,36,0.6)';ctx.font='8px monospace';ctx.textAlign='right';
      ctx.fillText('pri='+(i),12,iy+14);
    }
  }

  // Output wires
  var outY1=by+bh/2-16, outY0=by+bh/2+4, outYV=by+bh/2+24;
  var outs=[{y:outY1,v:res.A1,lbl:'A1='+res.A1},{y:outY0,v:res.A0,lbl:'A0='+res.A0},{y:outYV,v:res.V,lbl:'V='+res.V}];
  outs.forEach(function(o){
    ctx.strokeStyle=o.v?'#f472b6':'#475569'; ctx.lineWidth=o.v?2.5:1.5;
    ctx.beginPath();ctx.moveTo(bx+bw,o.y);ctx.lineTo(W-14,o.y);ctx.stroke();
    ctx.fillStyle=o.v?'#f472b6':'rgba(255,255,255,0.25)';
    ctx.font='bold 11px monospace';ctx.textAlign='left';
    ctx.fillText(o.lbl,W-12,o.y+4);
  });

  // Error marker
  if(encMode==='basic'&&res.multi){
    ctx.fillStyle='rgba(239,68,68,0.15)';ctx.strokeStyle='#ef4444';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(bx-2,by-2,bw+4,bh+4,10);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ef4444';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText('INVALID',bx+bw/2,by+bh+12);
  }
  if(encMode==='priority'&&res.pri>=0){
    ctx.fillStyle='#fbbf24';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('highest: I'+res.pri,bx+bw/2,by+bh+12);
  }
}

function buildInputs(){
  var div=document.getElementById('encInputs');div.innerHTML='';
  for(var i=3;i>=0;i--){
    var btn=document.createElement('button');
    btn.className='enc-in'+(inputs[i]?' hi':'');
    btn.textContent='I'+i+' = '+inputs[i]+(encMode==='priority'&&i>0?' (priority '+i+')':'');
    (function(idx){btn.onclick=function(){inputs[idx]^=1;refresh4();};})(i);
    div.appendChild(btn);
  }
}

function updateOuts(){
  var res=encMode==='basic'?basicEncode(inputs):priEncode(inputs);
  var html='';
  var binOut=res.A1+''+res.A0;
  var dec=parseInt(binOut,2);
  html+='<span style="color:#f472b6">A1A0 = '+binOut+'b = '+dec+'</span><br>';
  html+='<span style="color:'+(res.V?'#4ade80':'rgba(255,255,255,0.3)')+'">V = '+res.V+(res.V?' (active input detected)':' (no inputs)')+'</span>';
  if(encMode==='basic'&&res.multi){
    html+='<br><span style="color:#ef4444">⚠ Multiple inputs HIGH — output '+binOut+' is garbage (OR of codes)</span>';
  }
  if(encMode==='priority'&&res.pri>=0){
    html+='<br><span style="color:#fbbf24">Highest active: I'+res.pri+' → code '+dec+'</span>';
  }
  document.getElementById('encOuts').innerHTML=html;

  var n=inputs.filter(Boolean).length;
  document.getElementById('encNote').textContent=
    n===0?'No inputs active. V=0.':
    n===1?'Single input active: I'+inputs.indexOf(1)+' → clean output.':
    encMode==='basic'?n+' inputs active simultaneously — basic encoder output is invalid. Use priority encoder.':
    n+' inputs active. Priority encoder selects highest (I'+( priEncode(inputs).pri)+').';
}

function refresh4(){buildInputs();draw();updateOuts();}

function setEncMode(m){
  encMode=m;
  document.getElementById('eBasic').className='tab-btn'+(m==='basic'?' active':'');
  document.getElementById('ePri').className='tab-btn'+(m==='priority'?' active':'');
  refresh4();
}
window.setEncMode=setEncMode;
refresh4();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 4-to-2 priority encoder has I3=0, I2=1, I1=1, I0=0 simultaneously asserted. What are the outputs A1, A0, and which input is selected?`,
      options: [
        { label: 'A', text: 'A1=1, A0=1 — I3 and I1 are both odd-numbered so they combine' },
        { label: 'B', text: 'A1=1, A0=0 — I2 is the highest-priority active input (I3 is inactive); I2 corresponds to binary 10' },
        { label: 'C', text: 'A1=0, A0=1 — I1 wins because it has lower index' },
        { label: 'D', text: 'A1=1, A0=1 — I2 and I1 OR together to give binary 11' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. I3=0, I2=1 → I2 is the highest active input (I3 would override if set, but it is 0). I2 corresponds to address 2 = binary 10. So A1=1, A0=0. The priority encoder ignores I1 because I2 has higher priority.',
      failMessage: 'Priority encoder selects the highest-numbered active input. I3=0 (inactive), I2=1 (active, highest). I2 → address 2 → binary 10 → A1=1, A0=0. I1 is ignored because I2 has higher priority.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The BCD-to-7-Segment Decoder

The most visually tangible decoder is the **BCD-to-7-segment decoder**, which converts a 4-bit BCD digit (0–9) into the seven control signals that drive a 7-segment LED display.

A 7-segment display has seven segments labelled a–g:

\`\`\`
 _
|_|   ← segments: a (top), b (top-right), c (bottom-right),
|_|      d (bottom), e (bottom-left), f (top-left), g (middle)
\`\`\`

For each digit 0–9, a specific set of segments is ON. The decoder maps the BCD input to these seven outputs. For example:
- BCD 0 (0000) → segments a,b,c,d,e,f ON, g OFF
- BCD 1 (0001) → segments b,c ON, rest OFF
- BCD 8 (1000) → all seven segments ON

**Gate implementation**: each segment output is a Boolean function of the four BCD inputs (A, B, C, D where A is MSB). K-map minimisation gives the expression for each segment. For segment 'a': $a = A + C + B \\oplus D + \\bar{B}\\bar{D}$ (varies by implementation).

**Real ICs**: the **74HC4511** (CMOS) and **7447** (TTL, active-low outputs) implement BCD-to-7-segment decoding in hardware. They also include a **lamp test** input (forces all segments ON), a **blanking** input (forces all OFF), and handle the ripple-blanking for leading-zero suppression in multi-digit displays.`,
    },

    // ── Visual 3 — BCD to 7-segment decoder ───────────────────────────────────
    {
      type: 'js',
      instruction: `### BCD-to-7-segment decoder: live display

Click digit buttons or toggle BCD bits to see the segment pattern. Invalid BCD inputs (1010–1111) are shown with the display blanked. The segment truth table is shown alongside.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-size:11px;color:rgba(255,255,255,0.35);align-self:center">Digit:</span>
    <div id="digitBtns" style="display:flex;gap:4px;flex-wrap:wrap"></div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
    <div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:6px">BCD input (click to toggle)</div>
      <div id="bcdBits" style="display:flex;gap:6px;margin-bottom:12px"></div>
      <canvas id="seg7cv" width="220" height="200"></canvas>
    </div>
    <div style="flex:1;min-width:180px">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Segment outputs</div>
      <canvas id="segTbl" width="220" height="220"></canvas>
      <div id="seg7Note" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7"></div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block}
.dgt-btn{width:34px;height:34px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.3);font-family:monospace;font-size:15px;font-weight:700;cursor:pointer}
.dgt-btn.sel{border-color:#fbbf24;background:rgba(217,119,6,0.15);color:#fbbf24}
.bit-btn{width:44px;height:44px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.25);font-family:monospace;font-size:16px;font-weight:700;cursor:pointer}
.bit-btn.hi{border-color:#d97706;background:rgba(217,119,6,0.15);color:#fbbf24}`,
      startCode: `
var bcd=[0,1,0,1]; // 0101 = 5 by default
var selDgt=5;
var SEG={
  0:[1,1,1,1,1,1,0], 1:[0,1,1,0,0,0,0], 2:[1,1,0,1,1,0,1],
  3:[1,1,1,1,0,0,1], 4:[0,1,1,0,0,1,1], 5:[1,0,1,1,0,1,1],
  6:[1,0,1,1,1,1,1], 7:[1,1,1,0,0,0,0], 8:[1,1,1,1,1,1,1],
  9:[1,1,1,1,0,1,1]
};
var SEG_NAMES=['a','b','c','d','e','f','g'];
var cv=document.getElementById('seg7cv'),ctx=cv.getContext('2d');
var tc=document.getElementById('segTbl'),tctx=tc.getContext('2d');

function drawSeg(ctx2,cx,cy,digit,size){
  var p=(digit!==null&&SEG[digit])?SEG[digit]:[0,0,0,0,0,0,0];
  var t=Math.round(size*0.1), l=Math.round(size*0.42), g=2;
  var ON='#fbbf24', OFF='#1a2438';
  function rect(x,y,w,h){ctx2.fillRect(cx+x+g,cy+y+g,w-g*2,h-g*2);}
  var ox=cx-(l+t*2)/2-cx, oy=cy-(l*2+t*3)/2-cy;
  cx=cx-(l+t*2)/2; cy=cy-(l*2+t*3)/2;
  ctx2.fillStyle=p[0]?ON:OFF;rect(t,0,l,t);
  ctx2.fillStyle=p[1]?ON:OFF;rect(t+l,t,t,l);
  ctx2.fillStyle=p[2]?ON:OFF;rect(t+l,t*2+l,t,l);
  ctx2.fillStyle=p[3]?ON:OFF;rect(t,t*2+l*2,l,t);
  ctx2.fillStyle=p[4]?ON:OFF;rect(0,t*2+l,t,l);
  ctx2.fillStyle=p[5]?ON:OFF;rect(0,t,t,l);
  ctx2.fillStyle=p[6]?ON:OFF;rect(t,t+l,l,t);
}

function drawDisplay(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var val=parseInt(bcd.join(''),2);
  var valid=val<=9;

  // Display panel
  ctx.fillStyle='#0c1424';ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(40,20,140,160,8);ctx.fill();ctx.stroke();

  if(valid){
    drawSeg(ctx,110,100,val,100);
  } else {
    ctx.fillStyle='rgba(239,68,68,0.5)';ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText('INVALID',110,95);ctx.fillText('BCD',110,112);
  }

  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('BCD: '+bcd.join(' ')+' = '+val,110,H-6);
}

function drawTable(){
  var W=tc.width,H=tc.height;
  tctx.clearRect(0,0,W,H);tctx.fillStyle='#0a0f1e';tctx.fillRect(0,0,W,H);
  var val=parseInt(bcd.join(''),2);
  var segs=SEG[val]||[0,0,0,0,0,0,0];
  var valid=val<=9;

  // Segment names header
  tctx.fillStyle='rgba(255,255,255,0.35)';tctx.font='bold 11px monospace';tctx.textAlign='center';
  SEG_NAMES.forEach(function(s,i){tctx.fillText(s,22+i*28,16);});
  tctx.strokeStyle='rgba(255,255,255,0.08)';tctx.lineWidth=0.5;
  tctx.beginPath();tctx.moveTo(8,20);tctx.lineTo(W-8,20);tctx.stroke();

  // Show all digits in table
  for(var d=0;d<10;d++){
    var y=28+d*18;
    var isSel=d===val&&valid;
    if(isSel){tctx.fillStyle='rgba(217,119,6,0.12)';tctx.fillRect(8,y-12,W-16,16);}
    tctx.fillStyle=isSel?'#fbbf24':'rgba(255,255,255,0.25)';
    tctx.font=(isSel?'bold ':'')+'10px monospace';tctx.textAlign='right';
    tctx.fillText(d,16,y);
    SEG[d].forEach(function(v,i){
      tctx.fillStyle=v?(isSel?'#fbbf24':'rgba(251,191,36,0.5)'):'rgba(255,255,255,0.08)';
      tctx.font=(isSel&&v?'bold ':'')+'11px monospace';tctx.textAlign='center';
      tctx.fillText(v,22+i*28,y);
    });
  }

  // Current segment values
  var curY=28+10*18+8;
  tctx.strokeStyle='rgba(255,255,255,0.08)';tctx.lineWidth=0.5;
  tctx.beginPath();tctx.moveTo(8,curY-6);tctx.lineTo(W-8,curY-6);tctx.stroke();
  if(valid){
    tctx.fillStyle='#fbbf24';tctx.font='bold 10px monospace';tctx.textAlign='right';
    tctx.fillText(val+'→',16,curY+4);
    SEG[val].forEach(function(v,i){
      tctx.fillStyle=v?'#fbbf24':'#475569';tctx.font='bold 11px monospace';tctx.textAlign='center';
      tctx.fillText(v,22+i*28,curY+4);
    });
  } else {
    tctx.fillStyle='#ef4444';tctx.font='bold 10px monospace';tctx.textAlign='center';
    tctx.fillText('INVALID BCD',W/2,curY+4);
  }
}

function buildUI(){
  // Digit buttons
  var db=document.getElementById('digitBtns');db.innerHTML='';
  for(var d=0;d<10;d++){
    var btn=document.createElement('button');
    btn.className='dgt-btn'+(d===selDgt?' sel':'');
    btn.textContent=d;
    (function(dv){btn.onclick=function(){
      selDgt=dv; bcd=dv.toString(2).padStart(4,'0').split('').map(Number); refresh5();
    };})(d);
    db.appendChild(btn);
  }
  // BCD bit buttons
  var bb=document.getElementById('bcdBits');bb.innerHTML='';
  ['8','4','2','1'].forEach(function(w,i){
    var btn=document.createElement('button');
    btn.className='bit-btn'+(bcd[i]?' hi':'');
    btn.innerHTML='<div style="font-size:9px;color:inherit;margin-bottom:1px">'+w+'</div>'+bcd[i];
    (function(idx){btn.onclick=function(){bcd[idx]^=1;selDgt=null;refresh5();};})(i);
    bb.appendChild(btn);
  });
}

function refresh5(){
  buildUI();drawDisplay();drawTable();
  var val=parseInt(bcd.join(''),2);
  var valid=val<=9;
  document.getElementById('seg7Note').textContent=valid
    ?'Digit '+val+': segments '+SEG[val].map(function(v,i){return v?SEG_NAMES[i]:null;}).filter(Boolean).join(',')+' are ON.'
    :'BCD '+bcd.join('')+' ('+val+') is not a valid BCD digit. 74HC4511 blanks the display for inputs 10–15.';
}
refresh5();`,
      outputHeight: 460,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A BCD-to-7-segment decoder receives input 0111 (BCD 7). Which segments are ON to display the digit 7?`,
      options: [
        { label: 'A', text: 'Segments a, b, c — top, top-right, bottom-right only' },
        { label: 'B', text: 'Segments a, b, c, d, e, f, g — all seven (same as digit 8)' },
        { label: 'C', text: 'Segments b, c, f, g — the segments forming a 7 with a serif' },
        { label: 'D', text: 'Segments a, b, c, d — top, top-right, bottom-right, bottom' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. The digit 7 on a standard 7-segment display uses only segments a (top), b (top-right), and c (bottom-right). The result looks like: top horizontal bar, then a vertical line down the right side. BCD pattern: [a=1, b=1, c=1, d=0, e=0, f=0, g=0].',
      failMessage: 'For digit 7: only the top bar (a), top-right (b), and bottom-right (c) segments are lit. This traces the number 7: horizontal stroke at top, diagonal/vertical down the right. Segments d,e,f,g are OFF. Pattern: a=1,b=1,c=1,d=0,e=0,f=0,g=0.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The 74HC138: A Versatile Decoder IC

The **74HC138** 3-to-8 decoder is one of the most commonly used ICs in digital design, appearing in virtually every microprocessor interface circuit built before the era of programmable logic.

**Pin functions**:
- **A0, A1, A2**: 3-bit address input
- **Y̅₀–Y̅₇**: 8 active-low outputs (selected output goes LOW)
- **G1**: active-high enable (must be HIGH to operate)
- **G̅₂A, G̅₂B**: active-low enables (both must be LOW to operate)

The three enable pins allow building **4-to-16 decoders** from two 74HC138s:
- Connect G1 of both to a HIGH signal (always enabled internally)
- Use address bit A3 (the 4th bit) to select which chip is active:
  - When A3=0: upper chip enabled (G1=1, G̅₂A tied to A3 through inverter = 0)
  - When A3=1: lower chip enabled
- A2–A0 drive both chips' address inputs in parallel
- The selected chip activates one of its 8 outputs; the other chip is disabled (all outputs HIGH = inactive for active-low)

**Memory decoding example**: a system with 64KB of address space uses an 8-bit address. Split A7–A5 (3 bits) into the 74HC138 → 8 × 8KB regions. Connect each Y̅ output to the chip-select input of one 8KB RAM or ROM chip. Only the addressed chip is selected at any time — the others see their CS̅ pin HIGH (unselected).

This is exactly how the Apple II, IBM PC, and virtually every 1970s–1990s microcomputer decoded memory.`,
    },

    // ── Visual 4 — 74HC138 decoder with memory map ────────────────────────────
    {
      type: 'js',
      instruction: `### 74HC138 as a memory address decoder

Set a memory address. The top 3 bits select which 8KB region (and therefore which memory chip) is active. The bottom 13 bits address within that chip. Toggle the enable inputs to see how chip-select is controlled.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Address: <strong id="addrLbl" style="color:#38bdf8">0x0000</strong></div>
      <input type="range" id="addrSl" min="0" max="65535" value="0" style="width:100%;accent-color:#38bdf8">
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;justify-content:center">
      <label style="font-size:11px;color:rgba(255,255,255,0.4);display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="chkG1" checked style="accent-color:#4ade80"> G1 (active-high enable)
      </label>
      <label style="font-size:11px;color:rgba(255,255,255,0.4);display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="chkG2" style="accent-color:#ef4444"> G̅2A,G̅2B (active-low, check=disabled)
      </label>
    </div>
  </div>
  <canvas id="mmapcv" width="520" height="240"></canvas>
  <div id="mmapNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.75"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}`,
      startCode: `
var addr=0, G1=true, G2dis=false;
var cv=document.getElementById('mmapcv'),ctx=cv.getContext('2d');

var REGIONS=[
  {name:'ROM 0', color:'#7c3aed', desc:'0x0000–0x1FFF'},
  {name:'ROM 1', color:'#6366f1', desc:'0x2000–0x3FFF'},
  {name:'RAM 0', color:'#0891b2', desc:'0x4000–0x5FFF'},
  {name:'RAM 1', color:'#0e7490', desc:'0x6000–0x7FFF'},
  {name:'RAM 2', color:'#059669', desc:'0x8000–0x9FFF'},
  {name:'RAM 3', color:'#047857', desc:'0xA000–0xBFFF'},
  {name:'I/O  ', color:'#d97706', desc:'0xC000–0xDFFF'},
  {name:'BIOS ', color:'#dc2626', desc:'0xE000–0xFFFF'},
];

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var enabled=G1&&!G2dis;
  var region=addr>>13; // top 3 bits of 16-bit address → 0-7
  var offset=addr&0x1FFF; // bottom 13 bits

  // Memory map (left panel)
  var mapX=10,mapW=160,barH=Math.floor((H-28)/8),topY=14;
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Memory map (64KB)',mapX,topY-2);

  REGIONS.forEach(function(r,i){
    var y=topY+i*barH;
    var isActive=i===region&&enabled;
    ctx.fillStyle=isActive?r.color+'44':'r.color'+'11';
    ctx.fillStyle=isActive?r.color+'33':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=isActive?r.color:'rgba(255,255,255,0.06)';
    ctx.lineWidth=isActive?2:0.5;
    ctx.beginPath();ctx.roundRect(mapX,y,mapW,barH-1,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=isActive?r.color:'rgba(255,255,255,0.25)';
    ctx.font=(isActive?'bold ':'')+'10px monospace';ctx.textAlign='left';
    ctx.fillText(r.name+' '+r.desc,mapX+5,y+barH/2+4);
    if(isActive){
      ctx.fillStyle=r.color;ctx.font='bold 9px monospace';
      ctx.fillText('← ACTIVE',mapX+mapW-60,y+barH/2+4);
    }
  });

  // 74HC138 box
  var chipX=190,chipY=20,chipW=100,chipH=H-40;
  ctx.fillStyle='rgba(255,255,255,0.03)';ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(chipX,chipY,chipW,chipH,6);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('74HC138',chipX+chipW/2,chipY+16);
  ctx.font='9px monospace';
  ctx.fillText('3-to-8 Decoder',chipX+chipW/2,chipY+28);

  // Address input wires (A2,A1,A0 from top 3 bits of addr)
  var a=[( addr>>15)&1,(addr>>14)&1,(addr>>13)&1];
  ['A2','A1','A0'].forEach(function(lbl,i){
    var wy=chipY+44+i*16;
    ctx.strokeStyle=a[i]?'#38bdf8':'#475569';ctx.lineWidth=a[i]?2:1.5;
    ctx.beginPath();ctx.moveTo(chipX-40,wy);ctx.lineTo(chipX,wy);ctx.stroke();
    ctx.fillStyle=a[i]?'#38bdf8':'rgba(255,255,255,0.25)';
    ctx.font='10px monospace';ctx.textAlign='right';
    ctx.fillText(lbl+'='+a[i],chipX-42,wy+4);
  });

  // Enable lines
  ctx.strokeStyle=G1?'#4ade80':'#ef4444';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(chipX-40,chipY+chipH-30);ctx.lineTo(chipX,chipY+chipH-30);ctx.stroke();
  ctx.fillStyle=G1?'#4ade80':'#ef4444';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('G1='+( G1?1:0),chipX-42,chipY+chipH-26);
  ctx.strokeStyle=G2dis?'#ef4444':'#4ade80';
  ctx.beginPath();ctx.moveTo(chipX-40,chipY+chipH-14);ctx.lineTo(chipX,chipY+chipH-14);ctx.stroke();
  ctx.fillStyle=G2dis?'#ef4444':'#4ade80';
  ctx.fillText('G\u02052='+(G2dis?1:0),chipX-42,chipY+chipH-10);

  // Disabled overlay
  if(!enabled){
    ctx.fillStyle='rgba(239,68,68,0.1)';
    ctx.beginPath();ctx.roundRect(chipX+1,chipY+1,chipW-2,chipH-2,5);ctx.fill();
    ctx.fillStyle='#ef4444';ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText('DISABLED',chipX+chipW/2,chipY+chipH/2);
  }

  // Output wires
  var outSpacing=(chipH-20)/8;
  REGIONS.forEach(function(r,i){
    var wy=chipY+16+i*outSpacing;
    var isActive=(i===region)&&enabled;
    var outVal=isActive?0:1; // active-low!
    ctx.strokeStyle=isActive?r.color:'rgba(255,255,255,0.1)';
    ctx.lineWidth=isActive?2:0.5;
    ctx.beginPath();ctx.moveTo(chipX+chipW,wy);ctx.lineTo(W-14,wy);ctx.stroke();
    ctx.fillStyle=isActive?r.color:'rgba(255,255,255,0.15)';
    ctx.font=(isActive?'bold ':'')+'9px monospace';ctx.textAlign='left';
    ctx.fillText('Y\u0305'+i+'='+(enabled?outVal:1)+(isActive?' (CS̅ LOW = selected)':''),chipX+chipW+4,wy+4);
  });

  // Address breakdown
  var abY=H-12;
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('Addr: 0x'+addr.toString(16).toUpperCase().padStart(4,'0')+
    ' = [A15–A13='+region+'] region + [A12–A0=0x'+offset.toString(16).toUpperCase().padStart(4,'0')+'] offset',10,abY);

  document.getElementById('addrLbl').textContent='0x'+addr.toString(16).toUpperCase().padStart(4,'0');
  document.getElementById('mmapNote').innerHTML=
    'Address 0x'+addr.toString(16).toUpperCase().padStart(4,'0')+
    (enabled
      ?': selects <strong style="color:'+REGIONS[region].color+'">'+REGIONS[region].name+'</strong> ('+REGIONS[region].desc+
        '). Y\u0305'+region+' goes LOW (active-low chip-select). Offset within chip: 0x'+offset.toString(16).toUpperCase().padStart(4,'0')+'.'
      :': decoder is <strong style="color:#ef4444">disabled</strong>. All Y\u0305 outputs are HIGH — no chip selected.');
}

document.getElementById('addrSl').oninput=function(){addr=parseInt(this.value);draw();};
document.getElementById('chkG1').onchange=function(){G1=this.checked;draw();};
document.getElementById('chkG2').onchange=function(){G2dis=this.checked;draw();};
draw();`,
      outputHeight: 420,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 74HC138 has G1=1, G̅2A=0, G̅2B=0, and address inputs A2=1, A1=0, A0=1. Which output is active and what logic level does it have?`,
      options: [
        { label: 'A', text: 'Y5 is active, output is HIGH (active-high decoder)' },
        { label: 'B', text: 'Y5 is active, output is LOW (74HC138 has active-low outputs)' },
        { label: 'C', text: 'Y4 is active, output is LOW (A2A1A0 = 100 = 4)' },
        { label: 'D', text: 'All outputs are HIGH because G̅2A and G̅2B are both 0' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Enable check: G1=1 (OK), G̅2A=0 (OK), G̅2B=0 (OK) — decoder is enabled. Address A2A1A0 = 101 binary = 5 decimal → Y̅₅ is selected. The 74HC138 has active-low outputs: the selected output goes LOW (0), all others stay HIGH (1).',
      failMessage: 'Enable: G1=1 ✓, G̅2A=0 ✓, G̅2B=0 ✓ — enabled. Address: A2=1,A1=0,A0=1 → 101b = 5 → Y̅₅ selected. The 74HC138 has ACTIVE-LOW outputs — Y̅₅ goes LOW. All other outputs remain HIGH.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Decoders and Encoders

**Binary decoder** (N-to-2ᴺ): converts an N-bit address into a one-hot output. Each output is a minterm of the inputs. Gate cost: 2ᴺ AND gates + N NOT gates. Used for memory decoding, chip-select generation, and SOP implementation.

**Enable inputs**: allow multiple decoders to share address lines — only the enabled decoder responds. Essential for cascading to wider decoders.

**Binary encoder** (2ᴺ-to-N): converts a one-hot input into an N-bit binary code. Only correct when exactly one input is HIGH.

**Priority encoder**: handles multiple simultaneous inputs by selecting the highest-priority (highest-numbered) active input. Outputs include a V (valid) flag. Used in interrupt controllers and arbitration circuits.

**BCD-to-7-segment decoder**: maps 4-bit BCD (0–9) to 7 segment control outputs. Invalid inputs (10–15) blank the display. Real ICs (74HC4511, 7447) include lamp test and blanking inputs.

**74HC138**: 3-to-8 decoder with active-low outputs and three enable inputs (G1 active-high, G̅2A/G̅2B active-low). Standard building block for memory address decoding. Two 74HC138s build a 4-to-16 decoder.

Next lesson: the ALU — combining adders, comparators, and logic operations into a single configurable arithmetic and logic unit.`,
    },
  ],
};

export default {
  id: 'df-5-4-decoders-encoders',
  slug: 'decoders-encoders',
  chapter: 'df.5',
  order: 4,
  title: 'Decoders and Encoders',
  subtitle: 'Converting between binary and one-hot — address decoding, 7-segment displays, priority arbitration.',
  tags: ['digital','decoder','encoder','priority-encoder','BCD','7-segment','74HC138','address-decoding','one-hot','minterm'],
  hook: {
    question: 'How does a microprocessor select one specific chip out of dozens in a memory system when millions of addresses are accessed per second?',
    realWorldContext: 'Every computer system ever built uses address decoders. The 74HC138 appears in the IBM PC schematic, the Apple II, the Commodore 64, and virtually every embedded system with external memory. Priority encoders are in every interrupt controller — the 8259A PIC that managed interrupts in the original IBM PC is a priority encoder at its core.',
  },
  intuition: {
    prose: [
      'Decoder: binary address in → one-hot out. Each output = one minterm of inputs.',
      'Enable pin: all outputs forced inactive when disabled. Allows cascading.',
      'Encoder: one-hot in → binary out. Only valid when exactly one input is HIGH.',
      'Priority encoder: highest-numbered active input wins. V flag = any input active.',
    ],
    callouts: [
      {type:'tip', title:'Decoder for SOP', body:'Connect decoder outputs directly to an OR gate to implement any SOP expression. The decoder provides all minterms; the OR gate selects which ones contribute.'},
      {type:'important', title:'74HC138 active-low outputs', body:'Y̅₀–Y̅₇ are active-low: the selected output goes LOW, all others stay HIGH. Connect to active-low chip-select pins (CE̅, CS̅, OE̅) directly without inverters.'},
    ],
    visualizations:[{id:'ScienceNotebook',title:'Decoders and Encoders',props:{lesson:LESSON_DF_5_4}}],
  },
  math:{prose:[],callouts:[],visualizations:[]},
  rigor:{prose:[],callouts:[],visualizations:[]},
  examples:[],challenges:[],
  mentalModel:[
    'N-to-2ᴺ decoder: 2ᴺ AND gates, each is one minterm. Exactly one HIGH at a time.',
    'Enable = AND gate on all outputs. Disabled → all LOW (or all HIGH for active-low).',
    '4-to-2 encoder: A1=I3+I2, A0=I3+I1. Fails for simultaneous inputs.',
    'Priority: A1=I3+I2, A0=I3+(Ī2·I1). Highest wins. V=I3+I2+I1+I0.',
    '74HC138: G1=1 AND G̅2A=0 AND G̅2B=0 → enabled. A2A1A0 → Y̅ₙ goes LOW.',
  ],
  checkpoints:['read-intuition'],
  quiz:[
    {
      id: 'q1',
      type: 'choice',
      text: '"N-to-2ᴺ decoder: exactly one output HIGH at a time." A 3-to-8 decoder with input A2A1A0=011. Which output is asserted?',
      options: [
        'Y2',
        'Y3',
        'Y4',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Enable = AND gate on all outputs. Disabled → all LOW." Why is an enable input useful on a decoder?',
      options: [
        'Enable reduces the decoder\'s power consumption when idle',
        'Enable lets you select one of several decoders in a system — only the enabled decoder asserts its outputs, allowing multiple decoders to share output buses',
        'Enable adds an extra output bit to the decoder',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Basic encoder fails for simultaneous inputs." A simple 4-to-2 encoder has I2=1 and I3=1 simultaneously. What goes wrong?',
      options: [
        'Both outputs assert, which is correct — two inputs can be encoded at once',
        'The outputs produce the wrong binary code because the logic was designed assuming only one input is active at a time',
        'The encoder overheats from the conflict',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Priority encoder: highest input wins." Inputs I3=1 and I1=1 are both active. What does the priority encoder output?',
      options: [
        'Code for I1 (01) — first active input wins',
        'Code for I3 (11) — highest-index (highest-priority) input wins',
        'An error code — two simultaneous inputs are forbidden',
      ],
      correct: 1,
    },
  ],
};