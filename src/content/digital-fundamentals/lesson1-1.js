// Digital Fundamentals · Chapter 1 · Lesson 1
// Binary Numbers and Waveforms
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_1_1 = {
  title: 'Binary Numbers and Waveforms',
  subtitle: 'How 0s and 1s represent every number, and what they look like on a wire.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `### Counting with two symbols

You already know how to count in base 10 (decimal): you have ten symbols (0–9), and when you run out of symbols in one column you carry into the next.

Binary works exactly the same way — but with only two symbols: **0** and **1**.

In decimal: ...7, 8, 9, **10** (carry!), 11, 12...  
In binary: ...0, 1, **10** (carry!), 11, 100 (carry!), 101, 110, 111, **1000** (carry!), ...

Each position in a binary number represents a power of 2 (just as decimal positions represent powers of 10):

| Position | 2³ | 2² | 2¹ | 2⁰ |
|---|---|---|---|---|
| Value | 8 | 4 | 2 | 1 |

So the binary number **1011** means: **1**×8 + **0**×4 + **1**×2 + **1**×1 = **11** in decimal.

Each 0 or 1 is called a **bit** (binary digit). Eight bits form a **byte** — the standard unit of digital data storage.`,
    },

    // ── Visual 1 — Binary counter with bit visualisation ─────────────────────
    {
      type: 'js',
      instruction: `**Count in binary** using the buttons below, or drag the slider directly to any value 0–31.

Watch the individual bits light up as the number changes. Notice the pattern: bit 0 (the rightmost) flips every step; bit 1 flips every 2 steps; bit 2 every 4 steps; and so on. Each bit is exactly twice as slow as the one to its right.`,
      html: `<div class="scene">
  <div class="bits-display" id="bd"></div>
  <div class="value-row">
    <span id="binval" class="binval"></span>
    <span class="eq">=</span>
    <span id="decval" class="decval"></span>
    <span class="suffix">in decimal</span>
  </div>
  <div class="btn-row">
    <button id="btnDown">◀ –1</button>
    <input type="range" id="sl" min="0" max="31" value="0" style="flex:1">
    <button id="btnUp">+1 ▶</button>
  </div>
  <div id="breakdown" class="breakdown"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.bits-display{display:flex;gap:8px;justify-content:center;padding:8px 0}
.bit{width:52px;height:64px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:all .12s;border:1.5px solid}
.bit.on{background:#eff6ff;border-color:#3b82f6;color:#1d4ed8}
.bit.off{background:var(--color-background-secondary);border-color:var(--color-border-tertiary);color:var(--color-text-tertiary)}
.bit-val{font-size:22px;font-weight:700;font-family:monospace}
.bit-pow{font-size:10px;font-weight:500}
.value-row{display:flex;align-items:center;gap:8px;justify-content:center}
.binval{font-size:22px;font-family:monospace;font-weight:700;color:var(--color-text-info,#2563eb)}
.decval{font-size:22px;font-family:monospace;font-weight:700;color:#059669}
.eq,.suffix{color:var(--color-text-secondary);font-size:14px}
.btn-row{display:flex;align-items:center;gap:10px}
button{padding:7px 18px;border-radius:8px;border:1px solid var(--color-border-secondary);background:transparent;color:var(--color-text-primary);cursor:pointer;font-size:13px}
.breakdown{font-size:12px;color:var(--color-text-secondary);line-height:1.7;text-align:center;min-height:20px}`,
      startCode: `var BITS=5,val=0;
var sl=document.getElementById('sl');
function render(){
  var bd=document.getElementById('bd');bd.innerHTML='';
  var parts=[];
  for(var i=BITS-1;i>=0;i--){
    var b=(val>>i)&1,pw=Math.pow(2,i);
    var div=document.createElement('div');
    div.className='bit '+(b?'on':'off');
    div.innerHTML='<span class="bit-val">'+b+'</span><span class="bit-pow">2<sup>'+i+'</sup>='+pw+'</span>';
    bd.appendChild(div);
    if(b)parts.push(b+'×'+pw);
  }
  document.getElementById('binval').textContent=val.toString(2).padStart(BITS,'0');
  document.getElementById('decval').textContent=val;
  document.getElementById('breakdown').textContent=val===0?'All bits off = 0':parts.join(' + ')+' = '+val;
  sl.value=val;
}
document.getElementById('btnUp').onclick=function(){if(val<31){val++;render();}};
document.getElementById('btnDown').onclick=function(){if(val>0){val--;render();}};
sl.oninput=function(){val=+sl.value;render();};
render();`,
      outputHeight: 320,
    },

    // ── Visual 2 — Binary ↔ Decimal converter ─────────────────────────────────
    {
      type: 'js',
      instruction: `**Converting between binary and decimal** is a skill you will use constantly when working with digital systems.

**Decimal → Binary**: repeatedly divide by 2 and record remainders (read bottom-up).  
**Binary → Decimal**: write the bit weights (1, 2, 4, 8, 16…) above each bit, then add the weights where the bit is 1.

Use the tool below — type in either box and watch the other update, with the working shown step by step.`,
      html: `<div class="scene">
  <div class="cols">
    <div class="col">
      <label class="lbl">Decimal</label>
      <input id="dec" type="number" min="0" max="255" value="42" class="inp">
    </div>
    <div class="arrow">⇄</div>
    <div class="col">
      <label class="lbl">Binary (8-bit)</label>
      <input id="bin" type="text" value="" class="inp mono">
    </div>
  </div>
  <div class="steps" id="steps"></div>
  <div class="bit-weights" id="bw"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:12px}
.cols{display:flex;align-items:center;gap:12px}
.col{display:flex;flex-direction:column;gap:5px;flex:1}
.lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-secondary)}
.inp{padding:9px 12px;border-radius:8px;border:1.5px solid var(--color-border-secondary);background:var(--color-background-secondary);color:var(--color-text-primary);font-size:16px;width:100%;box-sizing:border-box}
.inp.mono{font-family:monospace;letter-spacing:.15em}
.inp:focus{outline:none;border-color:var(--color-text-info,#3b82f6)}
.arrow{font-size:20px;color:var(--color-text-secondary);flex-shrink:0}
.steps{font-size:12px;color:var(--color-text-secondary);line-height:1.85;padding:10px 14px;background:var(--color-background-secondary);border-radius:8px;border:1px solid var(--color-border-tertiary);min-height:48px}
.bit-weights{display:flex;gap:4px;justify-content:flex-end}
.bw-cell{width:34px;text-align:center}
.bw-pow{font-size:10px;color:var(--color-text-tertiary);font-family:monospace}
.bw-bit{font-size:16px;font-weight:700;font-family:monospace;padding:4px 0}
.bw-on{color:#2563eb}.bw-off{color:var(--color-text-tertiary)}
.bw-val{font-size:10px;color:var(--color-text-secondary)}`,
      startCode: `function decToBin(n){return Math.max(0,Math.min(255,n)).toString(2).padStart(8,'0');}
function binToDec(s){return parseInt(s.replace(/[^01]/g,'').padStart(8,'0').slice(-8),2)||0;}
function showWeights(n){
  var bw=document.getElementById('bw');bw.innerHTML='';
  var bits=n.toString(2).padStart(8,'0');
  for(var i=7;i>=0;i--){
    var b=bits[7-i]|0,pw=Math.pow(2,i),cl=b?'bw-on':'bw-off';
    var cell=document.createElement('div');cell.className='bw-cell';
    cell.innerHTML='<div class="bw-pow">2<sup>'+i+'</sup></div><div class="bw-bit '+cl+'">'+b+'</div><div class="bw-val '+(b?'bw-on':'')+'">'+( b?pw:'')+'</div>';
    bw.appendChild(cell);
  }
}
function showStepsDtoB(n){
  if(n===0){document.getElementById('steps').innerHTML='0 in decimal = <strong>00000000</strong> in binary';return;}
  var rows=[],q=n;var parts=[];
  while(q>0){rows.push(q+'÷2 = '+Math.floor(q/2)+' remainder <strong>'+(q%2)+'</strong>');q=Math.floor(q/2);}
  document.getElementById('steps').innerHTML='<strong>'+n+'</strong> → binary: divide by 2, read remainders upward:<br>'+rows.join('<br>')+'<br>Result (bottom→top): <strong>'+decToBin(n)+'</strong>';
}
function showStepsBtoD(s){
  var bits=s.padStart(8,'0').replace(/[^01]/g,'0').slice(-8);
  var n=binToDec(bits);
  var parts=[];
  for(var i=0;i<8;i++){if(bits[i]==='1')parts.push('1×'+Math.pow(2,7-i));}
  document.getElementById('steps').innerHTML='<strong>'+bits+'</strong> → decimal: '+(parts.length?parts.join(' + ')+' = <strong>'+n+'</strong>':'0');
}
var decEl=document.getElementById('dec'),binEl=document.getElementById('bin');
function fromDec(){var n=Math.max(0,Math.min(255,+decEl.value||0));binEl.value=decToBin(n);showStepsDtoB(n);showWeights(n);}
function fromBin(){var n=binToDec(binEl.value);decEl.value=n;showStepsBtoD(binEl.value);showWeights(n);}
decEl.oninput=fromDec;binEl.oninput=fromBin;
fromDec();`,
      outputHeight: 380,
    },

    // ── Visual 3 — Digital waveforms and timing diagrams ─────────────────────
    {
      type: 'js',
      instruction: `In a real digital circuit, bits are not just numbers on paper — they are **voltages on wires** that switch over time. A **timing diagram** shows how multiple signals change together.

The diagram below shows three signals: **CLK** (a clock that ticks at a fixed rate), **A** (a data signal), and **B** (another data signal). The circuit samples A and B on each rising edge of the clock.

**Click on the HIGH/LOW blocks** to flip individual bits and see how the binary value changes.`,
      html: `<div class="scene">
  <canvas id="cv" width="540" height="280"></canvas>
  <div class="legend">
    <span>Click any block to toggle it</span>
    <span class="sep">·</span>
    <span>↑ = rising edge (clock samples here)</span>
  </div>
  <div class="readout" id="ro"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
canvas{border-radius:10px;cursor:pointer;display:block;width:100%}
.legend{font-size:11px;color:var(--color-text-secondary);display:flex;gap:8px;align-items:center}
.sep{color:var(--color-border-secondary)}
.readout{background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--color-text-primary);line-height:1.75;font-family:monospace}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
var CYCLES=8,LANE_H=60,PAD_L=48,PAD_T=20,row_y=[PAD_T,PAD_T+LANE_H,PAD_T+LANE_H*2,PAD_T+LANE_H*3];
var CW=(W-PAD_L-12)/CYCLES;
// signals: CLK fixed, A and B user-editable
var clk=Array(CYCLES).fill(0).map(function(_,i){return i%2;});
var A=[1,0,1,1,0,0,1,0];
var B=[0,1,1,0,1,0,0,1];
function drawRow(label,bits,y,color,editable){
  ctx.fillStyle='#94a3b8';ctx.font='500 11px monospace';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(label,PAD_L-8,y+LANE_H/2);
  for(var i=0;i<CYCLES;i++){
    var x=PAD_L+i*CW,hi=bits[i]===1;
    var yTop=y+6,yBot=y+LANE_H-10;
    // block fill
    ctx.fillStyle=hi?(editable?'rgba(59,130,246,0.12)':'rgba(148,163,184,0.08)'):'rgba(0,0,0,0)';
    ctx.fillRect(x,yTop,CW,yBot-yTop);
    // horizontal line
    var lineY=hi?yTop:yBot;
    ctx.strokeStyle=hi?color:'rgba(148,163,184,0.5)';ctx.lineWidth=hi?2.5:1.5;
    ctx.beginPath();ctx.moveTo(x,lineY);ctx.lineTo(x+CW,lineY);ctx.stroke();
    // transition edge
    if(i>0&&bits[i]!==bits[i-1]){var prevY=bits[i-1]===1?yTop:yBot;ctx.beginPath();ctx.moveTo(x,prevY);ctx.lineTo(x,lineY);ctx.stroke();}
    // rising edge marker on CLK
    if(label==='CLK'&&bits[i]===1&&(i===0||bits[i-1]===0)){ctx.strokeStyle='#f59e0b';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x,PAD_T);ctx.lineTo(x,H-PAD_T);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#f59e0b';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText('↑',x,PAD_T-6);}
  }
}
function draw(){
  ctx.clearRect(0,0,W,H);
  // grid
  ctx.strokeStyle='rgba(148,163,184,0.1)';ctx.lineWidth=0.75;
  for(var i=0;i<=CYCLES;i++){ctx.beginPath();ctx.moveTo(PAD_L+i*CW,PAD_T);ctx.lineTo(PAD_L+i*CW,H-PAD_T);ctx.stroke();}
  drawRow('CLK',clk,row_y[0],'#94a3b8',false);
  drawRow('A',A,row_y[1],'#3b82f6',true);
  drawRow('B',B,row_y[2],'#10b981',true);
  // sampled values row
  ctx.fillStyle='#94a3b8';ctx.font='500 11px monospace';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('A+B',PAD_L-8,row_y[3]+LANE_H/2);
  var risingEdges=[];for(var i=0;i<CYCLES;i++){if(clk[i]===1&&(i===0||clk[i-1]===0))risingEdges.push(i);}
  var aStr='',bStr='';
  risingEdges.forEach(function(i){
    var x=PAD_L+i*CW+CW/2;
    ctx.fillStyle='#94a3b8';ctx.font='700 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(A[i],x,row_y[3]+LANE_H/2-8);
    ctx.fillStyle='#64748b';ctx.fillText(B[i],x,row_y[3]+LANE_H/2+8);
    aStr+=A[i];bStr+=B[i];
  });
  document.getElementById('ro').innerHTML=
    'On CLK rising edges — A: <strong>'+aStr+'</strong> (dec '+parseInt(aStr,2)+') · B: <strong>'+bStr+'</strong> (dec '+parseInt(bStr,2)+')<br>'+
    'A XOR B: <strong>'+aStr.split('').map(function(a,i){return a^bStr[i]}).join('')+'</strong>';
}
cv.addEventListener('click',function(e){
  var rect=cv.getBoundingClientRect(),mx=(e.clientX-rect.left)*cv.width/rect.width,my=(e.clientY-rect.top)*cv.height/rect.height;
  var col=Math.floor((mx-PAD_L)/CW);
  if(col<0||col>=CYCLES)return;
  if(my>row_y[1]&&my<row_y[1]+LANE_H){A[col]=A[col]^1;draw();}
  else if(my>row_y[2]&&my<row_y[2]+LANE_H){B[col]=B[col]^1;draw();}
});
draw();`,
      outputHeight: 360,
    },

    // ── Visual 4 — Bytes, kilobytes, megabytes ────────────────────────────────
    {
      type: 'js',
      instruction: `Once you have bits, you can measure data. **8 bits = 1 byte**, and from there the standard prefixes build up in steps of 1,024 (2¹⁰):

| Unit | Size | Holds approximately |
|---|---|---|
| 1 byte | 8 bits | 1 character of text |
| 1 KB | 1,024 bytes | Half a page of text |
| 1 MB | 1,024 KB | A 3-minute MP3 song |
| 1 GB | 1,024 MB | ~250 songs, or 1 HD movie |
| 1 TB | 1,024 GB | ~250 HD movies |

The interactive below lets you feel the scale — drag through any data size and see how many bits are involved.`,
      html: `<div class="scene">
  <div class="ctrl-row">
    <input type="range" id="ps" min="0" max="40" value="10" style="flex:1">
  </div>
  <canvas id="cv" width="540" height="200"></canvas>
  <div class="detail" id="det"></div>
</div>`,
      css: `body{margin:0;padding:12px;font-family:sans-serif}
.scene{display:flex;flex-direction:column;gap:10px}
.ctrl-row{display:flex;align-items:center;gap:10px}
canvas{border-radius:10px;display:block;width:100%}
.detail{padding:10px 14px;border-radius:8px;background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary);font-size:12px;color:var(--color-text-primary);line-height:1.75}`,
      startCode: `var cv=document.getElementById('cv'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
var ps=document.getElementById('ps');
var units=[
  {name:'bit',bits:1,example:'a single 0 or 1'},
  {name:'nibble',bits:4,example:'one hex digit (0–F)'},
  {name:'byte',bits:8,example:'one ASCII character'},
  {name:'word (16-bit)',bits:16,example:'a small integer'},
  {name:'double word',bits:32,example:'an int32 or float'},
  {name:'quad word',bits:64,example:'a double-precision float'},
  {name:'kilobyte',bits:8192,example:'~half a page of plain text'},
  {name:'16 KB',bits:131072,example:'a simple HTML page'},
  {name:'megabyte',bits:8388608,example:'a 3-min MP3 at low quality'},
  {name:'10 MB',bits:83886080,example:'a hi-res JPEG photo'},
  {name:'100 MB',bits:838860800,example:'a short HD video clip'},
  {name:'gigabyte',bits:8589934592,example:'~250 songs or 4 min of 4K video'},
  {name:'10 GB',bits:85899345920,example:'a full HD movie download'},
  {name:'terabyte',bits:8796093022208,example:'~250 HD movies'},
];
function fmt(n){if(n<1e6)return n.toLocaleString()+' bits';if(n<1e9)return (n/1e6).toFixed(2)+' Mbits';if(n<1e12)return (n/1e9).toFixed(2)+' Gbits';return (n/1e12).toFixed(2)+' Tbits';}
function draw(){
  var idx=Math.min(+ps.value,units.length-1);
  var u=units[Math.round(idx/40*(units.length-1))];
  ctx.clearRect(0,0,W,H);
  // progress bar
  var pct=idx/40;
  ctx.fillStyle='var(--color-background-secondary,#f1f5f9)';ctx.beginPath();ctx.roundRect(20,H/2-20,W-40,40,8);ctx.fill();
  ctx.fillStyle='#3b82f6';ctx.beginPath();ctx.roundRect(20,H/2-20,(W-40)*pct,40,8);ctx.fill();
  // unit markers
  var marks=['bit','byte','KB','MB','GB','TB'];
  marks.forEach(function(m,i){var x=20+(W-40)*i/(marks.length-1);ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(m,x,H/2+30);});
  // current label
  ctx.fillStyle='white';ctx.font='700 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(u.name,W/2,H/2);
  document.getElementById('det').innerHTML='<strong>'+u.name+'</strong> = '+fmt(u.bits)+'<br>Example: '+u.example;
}
ps.oninput=draw;draw();`,
      outputHeight: 300,
    },

    // ── Challenges ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Check your understanding`,
    },

    {
      type: 'challenge',
      instruction: `What is the decimal value of the binary number **1101**?`,
      options: [
        { label: 'A', text: '13 — 1×8 + 1×4 + 0×2 + 1×1' },
        { label: 'B', text: '11 — count the 1s: there are four, but one column is 0' },
        { label: 'C', text: '1101 — it just looks like 1,101 in decimal' },
        { label: 'D', text: '14 — 1×8 + 1×4 + 0×2 + 1×1 + 1 carry' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. Work right to left: 1×1 = 1, 0×2 = 0, 1×4 = 4, 1×8 = 8. Sum = 13. The bit weights double with each position: 1, 2, 4, 8, 16, 32, 64, 128 for an 8-bit number.',
      failMessage: 'Work out the bit weights: position 0 (rightmost) = 2⁰ = 1, position 1 = 2¹ = 2, position 2 = 2² = 4, position 3 = 2³ = 8. So 1101 = 1×8 + 1×4 + 0×2 + 1×1 = 8+4+0+1 = 13.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 250,
    },

    {
      type: 'challenge',
      instruction: `What is the 8-bit binary representation of the decimal number **42**?`,
      options: [
        { label: 'A', text: '00101010' },
        { label: 'B', text: '00011010' },
        { label: 'C', text: '01010100' },
        { label: 'D', text: '00101100' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. 42 = 32 + 8 + 2 = 2⁵ + 2³ + 2¹. In an 8-bit field: positions 5, 3, and 1 are 1; the rest are 0 → 00101010. Verify: 0+0+32+0+8+0+2+0 = 42 ✓',
      failMessage: 'Decompose 42 into powers of 2: 42 - 32 = 10, 10 - 8 = 2, 2 - 2 = 0. So 42 = 2⁵ + 2³ + 2¹. Bits 5, 3, 1 are on: 00101010.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 250,
    },

    {
      type: 'challenge',
      instruction: `A file is described as **2 MB** (megabytes). Approximately how many bytes is that?`,
      options: [
        { label: 'A', text: '2,000 bytes — 2 × 1,000 since "mega" means million in SI units.' },
        { label: 'B', text: '2,048 bytes — 2 × 1,024 since 1 KB = 1,024 bytes.' },
        { label: 'C', text: '2,097,152 bytes — 2 × 1,024² since 1 MB = 1,024 KB = 1,024 × 1,024 bytes.' },
        { label: 'D', text: '16,777,216 bytes — 2 megabytes × 8 megabits = 16 mega-bits converted to bytes.' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct. 1 KB = 2¹⁰ = 1,024 bytes. 1 MB = 1,024 KB = 1,024² = 1,048,576 bytes. 2 MB = 2 × 1,048,576 = 2,097,152 bytes. (Note: hard drive manufacturers often use SI megabytes = 1,000,000 bytes, which is slightly different — a common source of confusion.)',
      failMessage: '1 KB = 1,024 bytes (2¹⁰), not 1,000. 1 MB = 1,024 KB = 1,024 × 1,024 = 1,048,576 bytes. 2 MB = 2,097,152 bytes. The factor of 1,024 comes from binary: the closest power of 2 to 1,000 is 2¹⁰ = 1,024.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '', outputHeight: 270,
    },

  ],
}

export default {
  id: 'df-1-1-binary-and-waveforms',
  slug: 'binary-and-waveforms',
  chapter: 'df.1',
  order: 1,
  title: 'Binary Numbers and Waveforms',
  subtitle: 'How 0s and 1s represent every number, and what they look like on a wire.',
  tags: ['digital', 'binary', 'waveforms', 'bits', 'bytes', 'timing diagram', 'ADC'],
  hook: {
    question: 'How does a computer represent the number 42 — or a whole song — using only 0s and 1s?',
    realWorldContext: 'Every number, text character, pixel, and sound sample in your computer is stored as a sequence of binary digits.',
  },
  intuition: {
    prose: [
      'Binary is base-2: same carry rules as decimal, but only two symbols.',
      'Bit weights double left-ward: 1, 2, 4, 8, 16, 32, 64, 128 for 8 bits.',
      'Timing diagrams show how digital signals change over time — bits are voltages on wires.',
    ],
    callouts: [{ type: 'important', title: 'Bit weights', body: 'Position n from the right has weight 2ⁿ. An 8-bit byte holds values 0–255. Each extra bit doubles the range.' }],
    visualizations: [{ id: 'BinaryAndWaveforms', title: 'Binary Numbers and Waveforms' }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Binary is base-2: position n has weight 2ⁿ.',
    'Binary → decimal: sum the weights where bits are 1.',
    'Decimal → binary: divide by 2 repeatedly, read remainders upward.',
    '8 bits = 1 byte. 1 KB = 1,024 bytes. Each prefix multiplies by 1,024.',
    'Timing diagrams show digital signals (voltages) changing over time on multiple wires.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}
