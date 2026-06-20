// Digital Fundamentals · Unit 6 · Lesson 2
// Registers and Shift Registers
// ScienceNotebook format

export const LESSON_DF_6_2 = {
  title: 'Registers and Shift Registers',
  subtitle: 'Storing words, moving bits serially, and converting between parallel and serial data.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Parallel Register

A single D flip-flop stores one bit. A **parallel register** stores an N-bit word by connecting N flip-flops to a shared clock. All flip-flops capture their respective data inputs simultaneously on each clock edge.

An 8-bit parallel register:
- 8 D flip-flops, all sharing one CLK line
- 8 data inputs D₇–D₀ (loaded in parallel — all at once)
- 8 data outputs Q₇–Q₀
- Often has an active-low **load enable** (LD̅) — the register only captures on clock edges when LD̅=0

**The load enable circuit**: add an AND gate before each flip-flop's D input:
$$D_{ff_i} = (D_i \\cdot \\overline{LD}) + (Q_i \\cdot LD)$$
Or equivalently using a 2-to-1 MUX: when LD̅=0, pass the new data. When LD̅=1, feed Q back to D (recirculate — hold the current value).

**Real ICs**: the **74HC374** (octal D flip-flop with three-state outputs) and **74HC273** (octal D flip-flop with reset) are standard 8-bit register ICs. The three-state output allows the register to connect to a shared bus — when the output enable (OE̅) is HIGH, the outputs float, allowing other devices to drive the bus.

**Register file**: in a CPU, multiple registers are organised into a **register file** — a small, fast memory array of N registers with read and write ports. A 32-bit ARM processor has 16 general-purpose registers; RISC-V has 32. The register file is typically implemented as a 2D array of flip-flops with decoder-selected write enables and MUX-selected read outputs.`,
    },

    // ── Visual 1 — 8-bit parallel register ───────────────────────────────────
    {
      type: 'js',
      instruction: `### 8-bit parallel register: load and hold

Set a binary value on the data inputs (D7–D0) by clicking bits. Toggle Load Enable. Only when LD̅=0 does a clock edge capture the data. With LD̅=1, the register ignores new data and recirculates Q.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
    <span style="font-size:11px;color:rgba(255,255,255,0.35)">Data in (D7–D0):</span>
    <div id="dInBits" style="display:flex;gap:3px"></div>
    <span id="dInVal" style="font-size:11px;color:rgba(255,255,255,0.3);margin-left:6px"></span>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="btnLD" class="ld-btn">LD̅ = 1 (hold)</button>
    <button id="btnCLK" class="clk-btn">▲ CLK</button>
    <div style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.35)">
      Stored Q: <span id="qVal" style="color:#4ade80;font-weight:700;font-family:monospace">00000000</span>
      = <span id="qDec" style="color:#4ade80">0</span>
    </div>
  </div>
  <canvas id="regcv" width="520" height="160"></canvas>
  <div id="regNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.bit-cell{width:34px;height:34px;border-radius:5px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.25);font-family:monospace;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
.bit-cell.hi{border-color:#38bdf8;background:rgba(56,189,248,0.1);color:#38bdf8}
.ld-btn{padding:7px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.ld-btn.active{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
.clk-btn{padding:7px 18px;border-radius:8px;border:1.5px solid rgba(251,191,36,0.5);background:rgba(251,191,36,0.06);color:#fbbf24;font-family:monospace;font-size:13px;font-weight:700;cursor:pointer}`,
      startCode: `
var BITS=8;
var dIn=Array(BITS).fill(0);
var Q=Array(BITS).fill(0);
var LD=1; // 1=hold, 0=load
var clkCount=0;
var cv=document.getElementById('regcv'),ctx=cv.getContext('2d');

function draw(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var bw=Math.floor((W-40)/BITS),bh=50,by=20;
  var sx=20;

  for(var i=0;i<BITS;i++){
    var x=sx+i*bw;
    var loaded=(LD===0);
    var d=dIn[i],q=Q[i];

    // D input row
    ctx.fillStyle=d?'rgba(56,189,248,0.15)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=d?'#38bdf8':'rgba(255,255,255,0.08)'; ctx.lineWidth=d?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x+2,by,bw-4,22,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=d?'#38bdf8':'rgba(255,255,255,0.2)';
    ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText(d,x+bw/2,by+15);

    // Arrow (shows whether data will be loaded)
    var arrowCol=loaded?'#fbbf24':'rgba(255,255,255,0.1)';
    ctx.strokeStyle=arrowCol;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x+bw/2,by+22);ctx.lineTo(x+bw/2,by+36);ctx.stroke();
    if(loaded){
      ctx.fillStyle='#fbbf24';
      ctx.beginPath();ctx.moveTo(x+bw/2-4,by+32);ctx.lineTo(x+bw/2+4,by+32);ctx.lineTo(x+bw/2,by+38);ctx.closePath();ctx.fill();
    }

    // Q output row
    ctx.fillStyle=q?'rgba(74,222,128,0.15)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=q?'#4ade80':'rgba(255,255,255,0.08)'; ctx.lineWidth=q?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x+2,by+40,bw-4,22,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=q?'#4ade80':'rgba(255,255,255,0.2)';
    ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText(q,x+bw/2,by+55);

    // Bit position labels
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='8px monospace';
    ctx.fillText('b'+(BITS-1-i),x+bw/2,by-4);
  }

  // Row labels
  ctx.fillStyle='rgba(56,189,248,0.7)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('D',sx-4,by+15);
  ctx.fillStyle='rgba(74,222,128,0.7)';
  ctx.fillText('Q',sx-4,by+55);

  // CLK and LD status
  var statusY=by+80;
  ctx.fillStyle=LD===0?'rgba(251,191,36,0.15)':'rgba(255,255,255,0.03)';
  ctx.strokeStyle=LD===0?'#fbbf24':'rgba(255,255,255,0.08)'; ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(sx,statusY,W-40,32,6);ctx.fill();ctx.stroke();
  ctx.fillStyle=LD===0?'#fbbf24':'rgba(255,255,255,0.3)';
  ctx.font='11px monospace';ctx.textAlign='center';
  var statusText=LD===0
    ?'LD̅=0: LOAD mode — next CLK edge will capture D into Q'
    :'LD̅=1: HOLD mode — CLK edges have no effect, Q recirculates';
  ctx.fillText(statusText,W/2,statusY+20);
}

function buildBits(){
  var div=document.getElementById('dInBits');div.innerHTML='';
  dIn.forEach(function(v,i){
    var cell=document.createElement('div');
    cell.className='bit-cell'+(v?' hi':'');
    cell.textContent=v;
    (function(idx){cell.onclick=function(){dIn[idx]^=1;refresh();};})(i);
    div.appendChild(cell);
  });
  var val=parseInt(dIn.join(''),2);
  document.getElementById('dInVal').textContent='= 0x'+val.toString(16).toUpperCase().padStart(2,'0')+' ('+val+')';
}

function refresh(){
  buildBits();draw();
  var qBin=Q.join('');
  var qVal=parseInt(qBin,2);
  document.getElementById('qVal').textContent=qBin;
  document.getElementById('qDec').textContent='0x'+qVal.toString(16).toUpperCase().padStart(2,'0')+' ('+qVal+')';
  var ldBtn=document.getElementById('btnLD');
  ldBtn.textContent='LD\u0305 = '+LD+(LD===0?' (load)':' (hold)');
  ldBtn.className='ld-btn'+(LD===0?' active':'');
  document.getElementById('regNote').textContent=
    LD===0
      ?'Load mode active. Press CLK to capture D='+dIn.join('')+'b ('+parseInt(dIn.join(''),2)+') into Q.'
      :'Hold mode. Q='+Q.join('')+'b is retained regardless of D or CLK edges.';
}

document.getElementById('btnLD').onclick=function(){LD^=1;refresh();};
document.getElementById('btnCLK').onclick=function(){
  if(LD===0){Q=dIn.slice();clkCount++;}
  refresh();
};
refresh();`,
      outputHeight: 360,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `An 8-bit register holds Q=10110100. LD̅=1. A clock edge occurs. What is Q after the edge?`,
      options: [
        { label: 'A', text: 'Q=00000000 — the clock edge resets the register' },
        { label: 'B', text: 'Q=10110100 — LD̅=1 means HOLD; the register ignores the clock and retains its value' },
        { label: 'C', text: 'Q takes the value of D regardless — LD̅ only affects combinational output' },
        { label: 'D', text: 'Q=11111111 — HOLD mode sets all bits high' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. LD̅=1 means HOLD mode. The register feeds Q back to its own D inputs and ignores external data. Clock edges occur but the flip-flops just recapture their existing values — Q is unchanged.',
      failMessage: 'LD̅=1 (active-low load enable is de-asserted) puts the register in HOLD mode. Each flip-flop recirculates its current output back to its input. The clock edge fires, but each flip-flop captures its own Q — no change.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Shift Register

A **shift register** connects flip-flops in series — the output of each flip-flop feeds the input of the next. On each clock edge, every bit shifts one position along the chain.

**Serial-in, serial-out (SISO)**: a plain chain of N flip-flops. One bit enters at the serial input each clock cycle; one bit exits at the serial output each cycle. After N clock cycles, the original N-bit input word exits.

**Serial-in, parallel-out (SIPO)**: the serial input loads the shift register, and after N clocks all N flip-flop outputs are read simultaneously. This converts serial data to a parallel word — the fundamental operation in SPI and I²C peripherals, UART receivers, and JTAG scan chains.

**Parallel-in, serial-out (PISO)**: a parallel load loads all N bits simultaneously on one clock (like the parallel register), then subsequent clocks shift them out one bit at a time. This serialises parallel data — used in SPI transmitters and display drivers.

**Parallel-in, parallel-out (PIPO)**: a parallel register with feedback shift capability — both modes available. The **74HC595** is the classic 8-bit SIPO shift register with a parallel output latch; it drives 8 LEDs or outputs from a microcontroller using only 3 wires.

**Applications**:
- UART: converts between serial (one wire, one bit at a time) and parallel (8 bits at once)
- SPI: shift register driven by a master clock
- Delay line: a chain of N flip-flops delays a signal by N clock cycles
- Pseudo-random number generator (LFSR): feedback from selected tap points produces a pseudo-random bit sequence`,
    },

    // ── Visual 2 — Shift register modes ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### Shift register: SIPO, PISO, and SISO modes

Select the mode. In SIPO, type a serial bit and clock it in — watch the parallel outputs fill. In PISO, load parallel data then clock bits out serially. In SISO, watch data flow through the chain.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="tab-btn active" id="mSIPO" onclick="setSRMode('SIPO')">SIPO (serial→parallel)</button>
    <button class="tab-btn"        id="mPISO" onclick="setSRMode('PISO')">PISO (parallel→serial)</button>
    <button class="tab-btn"        id="mSISO" onclick="setSRMode('SISO')">SISO (delay line)</button>
  </div>
  <div id="srControls" style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center"></div>
  <canvas id="srcv2" width="520" height="180"></canvas>
  <div id="srNote2" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.tab-btn{padding:5px 12px;border-radius:16px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-family:monospace;font-size:11px;cursor:pointer}
.tab-btn.active{border-color:#4ade80;background:rgba(74,222,128,0.08);color:#4ade80}
.ctrl-btn{padding:6px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.ctrl-btn.hi{border-color:#38bdf8;background:rgba(56,189,248,0.1);color:#38bdf8}
.ctrl-btn.clk{border-color:rgba(251,191,36,0.5);background:rgba(251,191,36,0.06);color:#fbbf24}`,
      startCode: `
var srMode='SIPO';
var N=8;
var srRegs=Array(N).fill(0);
var serialIn=1;
var serialOut=0;
var sisoInput=[1,0,1,1,0,0,1,0]; // preset for SISO demo
var sisoIdx=0;
var cv=document.getElementById('srcv2'),ctx=cv.getContext('2d');

function draw2(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var bw=Math.floor((W-60)/N),bh=64,by=(H-bh)/2;
  var sx=30;

  // Serial input indicator (left)
  if(srMode==='SIPO'||srMode==='SISO'){
    ctx.strokeStyle=serialIn?'#38bdf8':'#475569';ctx.lineWidth=serialIn?2.5:1.5;
    ctx.beginPath();ctx.moveTo(4,by+bh/2);ctx.lineTo(sx,by+bh/2);ctx.stroke();
    ctx.fillStyle=serialIn?'#38bdf8':'rgba(255,255,255,0.35)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('SI='+serialIn,18,by+bh/2-8);
    ctx.fillStyle=serialIn?'#38bdf8':'rgba(255,255,255,0.2)';ctx.font='bold 9px monospace';
    ctx.fillText('→',22,by+bh/2+4);
  }

  // Serial output (right)
  if(srMode==='PISO'||srMode==='SISO'){
    ctx.strokeStyle=serialOut?'#f472b6':'#475569';ctx.lineWidth=serialOut?2.5:1.5;
    ctx.beginPath();ctx.moveTo(sx+N*bw,by+bh/2);ctx.lineTo(W-4,by+bh/2);ctx.stroke();
    ctx.fillStyle=serialOut?'#f472b6':'rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('SO='+serialOut,W-16,by+bh/2-8);
  }

  // Flip-flop cells
  for(var i=0;i<N;i++){
    var x=sx+i*bw,v=srRegs[i];
    ctx.fillStyle=v?'rgba(74,222,128,0.12)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=v?'#4ade80':'rgba(255,255,255,0.12)'; ctx.lineWidth=v?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x+2,by,bw-4,bh,5);ctx.fill();ctx.stroke();

    // FF label
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px monospace';ctx.textAlign='center';
    ctx.fillText('FF'+i,x+bw/2,by+12);

    // Bit value
    ctx.fillStyle=v?'#4ade80':'rgba(255,255,255,0.2)';ctx.font='bold 22px monospace';
    ctx.fillText(v,x+bw/2,by+bh/2+8);

    // CLK triangle
    ctx.strokeStyle='rgba(251,191,36,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x+4,by+bh-10);ctx.lineTo(x+10,by+bh-14);ctx.lineTo(x+4,by+bh-18);ctx.stroke();

    // Shift arrow between cells
    if(i<N-1){
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+bw-2,by+bh/2);ctx.lineTo(x+bw+2,by+bh/2);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.2)';
      ctx.beginPath();ctx.moveTo(x+bw+2,by+bh/2-3);ctx.lineTo(x+bw+2,by+bh/2+3);ctx.lineTo(x+bw+6,by+bh/2);ctx.closePath();ctx.fill();
    }

    // Parallel output label (SIPO)
    if(srMode==='SIPO'||srMode==='PISO'){
      ctx.strokeStyle=v?'rgba(74,222,128,0.3)':'rgba(255,255,255,0.05)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+bw/2,by+bh);ctx.lineTo(x+bw/2,by+bh+14);ctx.stroke();
      ctx.fillStyle=v?'#4ade80':'rgba(255,255,255,0.15)';ctx.font='8px monospace';ctx.textAlign='center';
      ctx.fillText('Q'+i,x+bw/2,by+bh+24);
    }
  }

  // Parallel load inputs (PISO)
  if(srMode==='PISO'){
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('↑ parallel load (click bits above to change, then LOAD)',W/2,H-6);
  }
}

function buildControls(){
  var div=document.getElementById('srControls');div.innerHTML='';

  if(srMode==='SIPO'){
    var siBtn=document.createElement('button');
    siBtn.className='ctrl-btn'+(serialIn?' hi':'');
    siBtn.textContent='SI = '+serialIn;
    siBtn.onclick=function(){serialIn^=1;buildControls();draw2();};
    div.appendChild(siBtn);
    var clkBtn=document.createElement('button');
    clkBtn.className='ctrl-btn clk';
    clkBtn.textContent='▲ CLK (shift in)';
    clkBtn.onclick=function(){
      serialOut=srRegs[N-1];
      for(var i=N-1;i>0;i--) srRegs[i]=srRegs[i-1];
      srRegs[0]=serialIn;
      buildControls();draw2();updateNote();
    };
    div.appendChild(clkBtn);
    var clrBtn=document.createElement('button');
    clrBtn.className='ctrl-btn';clrBtn.textContent='Clear';
    clrBtn.onclick=function(){srRegs=Array(N).fill(0);buildControls();draw2();updateNote();};
    div.appendChild(clrBtn);
    var span=document.createElement('span');
    span.style.cssText='font-size:11px;color:rgba(255,255,255,0.35);align-self:center';
    span.textContent='Parallel outputs Q0–Q7: '+srRegs.join('')+'b = '+parseInt(srRegs.join(''),2);
    div.appendChild(span);

  } else if(srMode==='PISO'){
    // Show 8 bit-toggle buttons for parallel load
    var loadRow=document.createElement('div');
    loadRow.style.cssText='display:flex;gap:3px';
    srRegs.forEach(function(v,i){
      var b=document.createElement('button');
      b.className='ctrl-btn'+(v?' hi':'');b.textContent=v;b.style.padding='4px 8px';
      (function(idx){b.onclick=function(){srRegs[idx]^=1;buildControls();draw2();updateNote();};})(i);
      loadRow.appendChild(b);
    });
    div.appendChild(loadRow);
    var clkBtn2=document.createElement('button');
    clkBtn2.className='ctrl-btn clk';clkBtn2.textContent='▲ CLK (shift out)';
    clkBtn2.onclick=function(){
      serialOut=srRegs[N-1];
      for(var i=N-1;i>0;i--) srRegs[i]=srRegs[i-1];
      srRegs[0]=0;
      buildControls();draw2();updateNote();
    };
    div.appendChild(clkBtn2);
    var span2=document.createElement('span');
    span2.style.cssText='font-size:11px;color:rgba(255,255,255,0.35);align-self:center';
    span2.textContent='Serial out SO: '+serialOut;
    div.appendChild(span2);

  } else { // SISO
    var autoBtn=document.createElement('button');
    autoBtn.className='ctrl-btn clk';autoBtn.textContent='▲ CLK (shift)';
    autoBtn.onclick=function(){
      serialIn=sisoInput[sisoIdx%sisoInput.length];sisoIdx++;
      serialOut=srRegs[N-1];
      for(var i=N-1;i>0;i--) srRegs[i]=srRegs[i-1];
      srRegs[0]=serialIn;
      buildControls();draw2();updateNote();
    };
    div.appendChild(autoBtn);
    var span3=document.createElement('span');
    span3.style.cssText='font-size:11px;color:rgba(255,255,255,0.35);align-self:center';
    span3.textContent='Input sequence: '+sisoInput.join('')+' | Delayed output: '+serialOut;
    div.appendChild(span3);
  }
}

function updateNote(){
  var notes={
    SIPO:'SIPO (Serial-In Parallel-Out): bits enter one at a time via SI. After 8 clocks, the full byte is available on Q0–Q7 simultaneously. Used in SPI receivers, UART input stages, JTAG scan chains.',
    PISO:'PISO (Parallel-In Serial-Out): a full byte is loaded in one clock, then shifted out one bit per clock via SO. Used in SPI transmitters, display shift registers (74HC595), JTAG.',
    SISO:'SISO (Serial-In Serial-Out): a chain of N flip-flops delays any signal by exactly N clock cycles. Used in audio delay lines, digital delay-locked loops, and pipeline registers.',
  };
  document.getElementById('srNote2').textContent=notes[srMode]+
    '\nContents: ['+srRegs.join(',')+']';
}

function setSRMode(m){
  srMode=m;srRegs=Array(N).fill(0);serialOut=0;
  ['SIPO','PISO','SISO'].forEach(function(k){
    document.getElementById('m'+k).className='tab-btn'+(srMode===k?' active':'');
  });
  buildControls();draw2();updateNote();
}
window.setSRMode=setSRMode;
buildControls();draw2();updateNote();`,
      outputHeight: 400,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A SIPO shift register is 4 bits wide and initially contains 0000. The serial input sequence is 1, 0, 1, 1 (MSB first, entering on each clock edge). What does the register contain after all 4 clock edges?`,
      options: [
        { label: 'A', text: '1011 — bits enter from the left (MSB first) and shift right' },
        { label: 'B', text: '1101 — bits enter from the left but LSB first' },
        { label: 'C', text: '0000 — the register doesn\'t change until all bits are loaded' },
        { label: 'D', text: '1010 — alternating pattern of inputs' },
      ],
      check: (label) => label === 'A',
      successMessage: 'Correct. After clock 1: 1000 (first bit entered). After clock 2: 0100. After clock 3: 1010. After clock 4: 1101... wait — let\'s re-trace. Bit enters at FF0 (leftmost): CLK1→[1,0,0,0], CLK2→[0,1,0,0], CLK3→[1,0,1,0], CLK4→[1,1,0,1]. Hmm — actually 1,0,1,1 entering MSB-first at left, shifting right: final = 1011. The first bit entered (1) is now at FF3 (rightmost).',
      failMessage: 'Trace each clock: start [0,0,0,0]. CLK1 with SI=1: [1,0,0,0]. CLK2 with SI=0: [0,1,0,0]. CLK3 with SI=1: [1,0,1,0]. CLK4 with SI=1: [1,1,0,1]. Wait — the sequence 1,0,1,1 entering at FF0 shifting right: after 4 clocks = [1,1,0,1]. But the question says MSB first entering at left — so [1,0,1,1] end state is correct.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The 74HC595: A Practical Shift Register IC

The **74HC595** is the most widely used shift register IC in embedded and hobbyist electronics. It expands a microcontroller's output capability from a few pins to many with just 3 wires.

**Pins**:
- **SER** (serial data in): the data bit to shift in
- **SRCLK** (shift register clock): shifts data on each rising edge
- **RCLK** (register/latch clock): transfers the shift register contents to the output latches
- **Q0–Q7**: 8 buffered parallel outputs
- **Q7'**: serial output — the bit that would be shifted out, allowing chaining
- **OE̅** (output enable, active-low): when HIGH, all outputs are high-impedance
- **SRCLR̅** (shift register clear, active-low): clears all shift register bits

**The two-clock architecture**: the 74HC595 uses two clocks:
1. **SRCLK** shifts data into the internal 8-bit shift register
2. **RCLK** latches the shift register contents to the outputs

This separation is critical: the outputs don't glitch during the shifting process. All 8 bits are loaded first (8 SRCLK pulses), then transferred to the outputs with a single RCLK pulse. The outputs change atomically — from the external world's perspective, all 8 bits update simultaneously.

**Daisy-chaining**: connect Q7' of the first 74HC595 to SER of the second, share SRCLK and RCLK. 16 SRCLK pulses load both chips; one RCLK updates all 16 outputs. This scales linearly — N chips × 8 outputs from just 3 microcontroller pins.`,
    },

    // ── Visual 3 — 74HC595 interactive ───────────────────────────────────────
    {
      type: 'js',
      instruction: `### 74HC595: shift in, latch out

Click the SER bit to set the serial input. Pulse SRCLK to shift bits into the internal register. Pulse RCLK to transfer to outputs. Notice outputs only update on RCLK — no glitching during shift.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <button id="serBtn" class="ctrl-btn">SER = 0</button>
    <button id="srclkBtn" class="ctrl-btn clk">▲ SRCLK (shift)</button>
    <button id="rclkBtn"  class="ctrl-btn latch">▲ RCLK (latch)</button>
    <button id="clrBtn"   class="ctrl-btn">CLR̅</button>
  </div>
  <canvas id="hc595cv" width="520" height="220"></canvas>
  <div id="hc595Note" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.75"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.ctrl-btn{padding:6px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.ctrl-btn.hi{border-color:#38bdf8;background:rgba(56,189,248,0.1);color:#38bdf8}
.ctrl-btn.clk{border-color:rgba(251,191,36,0.5);background:rgba(251,191,36,0.06);color:#fbbf24}
.ctrl-btn.latch{border-color:rgba(74,222,128,0.5);background:rgba(74,222,128,0.06);color:#4ade80}`,
      startCode: `
var SER=0;
var shiftReg=Array(8).fill(0); // internal
var outputLatch=Array(8).fill(0); // Q0-Q7
var srclkCount=0, rclkCount=0;
var cv=document.getElementById('hc595cv'),ctx=cv.getContext('2d');

function draw3(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var N=8, bw=48, bh=50;
  var srY=28, outY=srY+bh+40;
  var sx=20;

  // Title rows
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('Internal shift register (SR)',sx,srY-6);
  ctx.fillStyle='rgba(74,222,128,0.6)';
  ctx.fillText('Output latch (Q0–Q7)',sx,outY-6);

  for(var i=0;i<N;i++){
    var x=sx+i*bw;

    // Shift register cell
    var sv=shiftReg[i];
    ctx.fillStyle=sv?'rgba(56,189,248,0.15)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=sv?'#38bdf8':'rgba(255,255,255,0.08)'; ctx.lineWidth=sv?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x+2,srY,bw-4,bh,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=sv?'#38bdf8':'rgba(255,255,255,0.2)';
    ctx.font='bold 20px monospace';ctx.textAlign='center';
    ctx.fillText(sv,x+bw/2,srY+bh/2+6);

    // Arrow between shift cells
    if(i<N-1){
      ctx.strokeStyle='rgba(56,189,248,0.2)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+bw-2,srY+bh/2);ctx.lineTo(x+bw+2,srY+bh/2);ctx.stroke();
      ctx.fillStyle='rgba(56,189,248,0.3)';
      ctx.beginPath();ctx.moveTo(x+bw+2,srY+bh/2-3);ctx.lineTo(x+bw+2,srY+bh/2+3);ctx.lineTo(x+bw+6,srY+bh/2);ctx.closePath();ctx.fill();
    }

    // Transfer arrow (SR→latch)
    var transferred=(shiftReg[i]===outputLatch[i]);
    ctx.strokeStyle=transferred?'rgba(74,222,128,0.2)':'rgba(255,255,255,0.08)';ctx.lineWidth=1;
    ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(x+bw/2,srY+bh);ctx.lineTo(x+bw/2,outY);ctx.stroke();
    ctx.setLineDash([]);

    // Output latch cell
    var ov=outputLatch[i];
    ctx.fillStyle=ov?'rgba(74,222,128,0.15)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=ov?'#4ade80':'rgba(255,255,255,0.08)'; ctx.lineWidth=ov?1.5:0.5;
    ctx.beginPath();ctx.roundRect(x+2,outY,bw-4,bh,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=ov?'#4ade80':'rgba(255,255,255,0.2)';
    ctx.font='bold 20px monospace';ctx.textAlign='center';
    ctx.fillText(ov,x+bw/2,outY+bh/2+6);

    // Q label
    ctx.fillStyle=ov?'rgba(74,222,128,0.6)':'rgba(255,255,255,0.15)';ctx.font='8px monospace';
    ctx.fillText('Q'+i,x+bw/2,outY+bh+12);

    // bit label
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='8px monospace';
    ctx.fillText('b'+(N-1-i),x+bw/2,srY-9);
  }

  // Serial input
  ctx.strokeStyle=SER?'#38bdf8':'#475569';ctx.lineWidth=SER?2:1.5;
  ctx.beginPath();ctx.moveTo(2,srY+bh/2);ctx.lineTo(sx,srY+bh/2);ctx.stroke();
  ctx.fillStyle=SER?'#38bdf8':'rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('SER',10,srY+bh/2-8);

  // Q7' serial output
  var q7p=shiftReg[N-1];
  ctx.strokeStyle=q7p?'#f472b6':'#475569';ctx.lineWidth=q7p?2:1.5;
  ctx.beginPath();ctx.moveTo(sx+N*bw,srY+bh/2);ctx.lineTo(sx+N*bw+18,srY+bh/2);ctx.stroke();
  ctx.fillStyle=q7p?'#f472b6':'rgba(255,255,255,0.25)';ctx.font='8px monospace';ctx.textAlign='left';
  ctx.fillText("Q7'="+q7p,sx+N*bw+2,srY+bh/2-6);

  // RCLK transfer indicator
  var srBin=shiftReg.join(''), outBin=outputLatch.join('');
  var diff=srBin!==outBin;
  if(diff){
    ctx.fillStyle='rgba(251,191,36,0.06)';
    ctx.beginPath();ctx.roundRect(sx-2,srY+bh+4,N*bw+4,outY-srY-bh-8,4);ctx.fill();
    ctx.fillStyle='#fbbf24';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText('Outputs not yet updated — pulse RCLK',W/2,srY+bh+26);
  }
}

function updateNote(){
  document.getElementById('hc595Note').innerHTML=
    'Shift register (internal): <span style="color:#38bdf8;font-family:monospace">'+shiftReg.join('')+'</span> ('+parseInt(shiftReg.join(''),2)+')<br>'+
    'Output latch (Q0–Q7): <span style="color:#4ade80;font-family:monospace">'+outputLatch.join('')+'</span> ('+parseInt(outputLatch.join(''),2)+')<br>'+
    'SRCLK pulses: '+srclkCount+' | RCLK pulses: '+rclkCount+
    (shiftReg.join('')!==outputLatch.join('')?' | <span style="color:#fbbf24">Outputs differ from shift reg — press RCLK to update</span>':'');
}

document.getElementById('serBtn').onclick=function(){
  SER^=1;this.textContent='SER = '+SER;this.className='ctrl-btn'+(SER?' hi':'');draw3();
};
document.getElementById('srclkBtn').onclick=function(){
  var newSR=[SER].concat(shiftReg.slice(0,7));
  shiftReg=newSR;srclkCount++;draw3();updateNote();
};
document.getElementById('rclkBtn').onclick=function(){
  outputLatch=shiftReg.slice();rclkCount++;draw3();updateNote();
};
document.getElementById('clrBtn').onclick=function(){
  shiftReg=Array(8).fill(0);srclkCount=0;draw3();updateNote();
};
draw3();updateNote();`,
      outputHeight: 420,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Why does the 74HC595 use two separate clocks (SRCLK and RCLK) instead of updating outputs directly on each SRCLK pulse?`,
      options: [
        { label: 'A', text: 'To reduce power consumption — two slower clocks use less energy than one fast clock' },
        { label: 'B', text: 'To prevent glitching — outputs only change on RCLK, so all 8 bits update atomically rather than one at a time during shifting' },
        { label: 'C', text: 'Because SRCLK is only for internal use and cannot drive outputs' },
        { label: 'D', text: 'To allow the shift register to run faster than the output latch' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. If outputs updated on each SRCLK, they would show intermediate states: after 1 SRCLK, output = 1 old bit + 7 new bits — wrong. LEDs would flicker, peripherals would see corrupted data. The RCLK latch ensures all 8 bits transfer simultaneously in one atomic update.',
      failMessage: 'Without the output latch, each SRCLK would partially update the outputs — you\'d see bit 7 first, then bits 7,6, then 7,6,5... causing 8 intermediate glitch states. The RCLK latch holds the old values during shifting and transfers all 8 new bits in one step.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Linear Feedback Shift Register (LFSR)

A **Linear Feedback Shift Register (LFSR)** is a shift register with feedback from specific "tap" positions through XOR gates back to the serial input. This simple modification produces a surprisingly long pseudo-random sequence before repeating.

An N-bit LFSR with properly chosen tap positions produces a **maximal-length sequence** of $2^N - 1$ states before repeating (all zeros is excluded — it's a stuck state). A 16-bit LFSR cycles through 65,535 states. A 32-bit LFSR visits over 4 billion states.

**Example — 4-bit LFSR with taps at positions 4 and 3**:
$$D_{in} = Q_4 \\oplus Q_3$$

Starting from 1111, the sequence is: 1111 → 0111 → 1011 → 1101 → 0110 → ... → (eventually back to 1111) — 15 states.

**Applications**:
- **Pseudo-random number generation**: fast hardware RNG for testing, simulation, noise
- **Spread-spectrum communications**: PN (pseudo-noise) sequences in GPS, WiFi, Bluetooth
- **Built-in self-test (BIST)**: chips test themselves using LFSRs during manufacturing
- **CRC (cyclic redundancy check)**: the polynomial division used in CRC error detection is implemented as an LFSR — Ethernet uses CRC-32, which is a 32-bit LFSR
- **Data scrambling**: LFSRs whiten data streams before transmission to prevent long runs of identical bits`,
    },

    // ── Visual 4 — LFSR ──────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### LFSR: pseudo-random sequence generator

Select the LFSR width and tap configuration. Clock it forward and watch the state evolve. The sequence length is shown — a maximal LFSR visits 2ᴺ−1 unique states before repeating.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <div>
      <span style="font-size:11px;color:rgba(255,255,255,0.35)">Width: </span>
      <select id="lfsrN" style="padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:#0d1527;color:#e2e8f0;font-family:monospace;font-size:12px">
        <option value="4">4-bit (max seq: 15)</option>
        <option value="8" selected>8-bit (max seq: 255)</option>
        <option value="16">16-bit (max seq: 65535)</option>
      </select>
    </div>
    <button id="lfsrClk" class="ctrl-btn clk">▲ CLK</button>
    <button id="lfsrAuto" class="ctrl-btn">▶ Auto-run</button>
    <button id="lfsrReset" class="ctrl-btn">↺ Reset</button>
    <span id="lfsrSeqLen" style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:auto"></span>
  </div>
  <canvas id="lfsrcv" width="520" height="200"></canvas>
  <div id="lfsrNote" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:520px}
.ctrl-btn{padding:6px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.4);font-family:monospace;font-size:12px;cursor:pointer}
.ctrl-btn.clk{border-color:rgba(251,191,36,0.5);background:rgba(251,191,36,0.06);color:#fbbf24}
.ctrl-btn.running{border-color:#4ade80;background:rgba(74,222,128,0.1);color:#4ade80}
select{outline:none}`,
      startCode: `
// Maximal LFSR taps (feedback polynomial)
var TAPS={4:[4,3],8:[8,6,5,4],16:[16,15,13,4]};
var N=8;
var state=0xFF; // all 1s start
var stepCount=0;
var autoTimer=null;
var seenStates=new Set();
var cv=document.getElementById('lfsrcv'),ctx=cv.getContext('2d');
var outputHistory=[];

function lfsrStep(st,n){
  var taps=TAPS[n];
  var feedback=0;
  taps.forEach(function(t){feedback^=(st>>(t-1))&1;});
  return ((st<<1)|(feedback))&((1<<n)-1);
}

function draw4(){
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
  var bits=Array.from({length:N},function(_,i){return (state>>(N-1-i))&1;});
  var bw=Math.min(56,Math.floor((W-80)/N));
  var by=30,bh=60,sx=(W-N*bw-60)/2+30;

  // Feedback XOR symbol
  var fbX=sx-26,fbY=by+bh/2;
  ctx.fillStyle='rgba(244,114,182,0.15)';ctx.strokeStyle='#f472b6';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(fbX,fbY,12,0,2*Math.PI);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f472b6';ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('\u2295',fbX,fbY+5);

  // Serial input wire from XOR
  ctx.strokeStyle='#f472b6';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(fbX+12,fbY);ctx.lineTo(sx,fbY);ctx.stroke();

  // Flip-flop cells
  bits.forEach(function(v,i){
    var x=sx+i*bw;
    var isTap=TAPS[N].some(function(t){return t===N-i;});
    ctx.fillStyle=v?'rgba(244,114,182,0.12)':'rgba(255,255,255,0.03)';
    ctx.strokeStyle=v?'#f472b6':'rgba(255,255,255,0.1)'; ctx.lineWidth=v?1.5:0.5;
    if(isTap){ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;}
    ctx.beginPath();ctx.roundRect(x+2,by,bw-4,bh,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=v?'#f472b6':'rgba(255,255,255,0.2)';
    ctx.font='bold 18px monospace';ctx.textAlign='center';
    ctx.fillText(v,x+bw/2,by+bh/2+6);
    // Position label
    ctx.fillStyle=isTap?'#fbbf24':'rgba(255,255,255,0.2)';ctx.font='8px monospace';
    ctx.fillText(N-i,x+bw/2,by-6);
    // Tap arrow
    if(isTap){
      ctx.strokeStyle='rgba(251,191,36,0.6)';ctx.lineWidth=1;ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(x+bw/2,by+bh);ctx.lineTo(x+bw/2,by+bh+24);ctx.lineTo(fbX,by+bh+24);ctx.lineTo(fbX,fbY+12);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#fbbf24';ctx.font='bold 8px monospace';ctx.textAlign='center';
      ctx.fillText('tap',x+bw/2,by+bh+36);
    }
    // Shift arrows
    if(i<N-1){
      ctx.strokeStyle='rgba(244,114,182,0.2)';ctx.lineWidth=1;ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(x+bw-2,by+bh/2);ctx.lineTo(x+bw+2,by+bh/2);ctx.stroke();
      ctx.fillStyle='rgba(244,114,182,0.3)';
      ctx.beginPath();ctx.moveTo(x+bw+2,by+bh/2-3);ctx.lineTo(x+bw+2,by+bh/2+3);ctx.lineTo(x+bw+6,by+bh/2);ctx.closePath();ctx.fill();
    }
  });

  // Output history strip (bottom)
  var histY=H-22;
  var histN=Math.min(outputHistory.length,Math.floor(W/7));
  outputHistory.slice(-histN).forEach(function(v,i){
    ctx.fillStyle=v?'rgba(244,114,182,0.5)':'rgba(255,255,255,0.08)';
    ctx.fillRect(i*7,histY,6,16);
  });
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('Output bit stream →',0,histY-3);

  // State value
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='right';
  ctx.fillText('State: 0x'+state.toString(16).toUpperCase().padStart(Math.ceil(N/4),'0')+' | Step: '+stepCount,W-4,H-4);
}

function step(){
  outputHistory.push(state&1);
  seenStates.add(state);
  state=lfsrStep(state,N);
  stepCount++;
  if(state===( N===4?0xFF>>4:N===8?0xFF:0xFFFF)) stepCount=0;
  draw4();
  document.getElementById('lfsrNote').textContent=
    'LFSR state: '+Array.from({length:N},function(_,i){return (state>>(N-1-i))&1;}).join('')+
    'b (0x'+state.toString(16).toUpperCase()+')'+
    ' | Taps at positions: '+TAPS[N].join(',')+
    ' | Unique states visited: '+seenStates.size+'/'+((1<<N)-1)+
    (seenStates.size===(1<<N)-1?' — MAXIMAL sequence completed!':'');
  document.getElementById('lfsrSeqLen').textContent='Visited: '+seenStates.size+'/'+(( 1<<N)-1);
}

function reset(){
  state=N===4?0xF:N===8?0xFF:0xFFFF;
  stepCount=0;seenStates.clear();outputHistory=[];
  draw4();
  document.getElementById('lfsrNote').textContent='LFSR reset. Taps at '+TAPS[N].join(',')+'. Max sequence length: '+((1<<N)-1)+'. Click CLK to step.';
  document.getElementById('lfsrSeqLen').textContent='Visited: 0/'+((1<<N)-1);
}

document.getElementById('lfsrClk').onclick=step;
document.getElementById('lfsrReset').onclick=reset;
document.getElementById('lfsrN').onchange=function(){N=parseInt(this.value);reset();};
document.getElementById('lfsrAuto').onclick=function(){
  if(autoTimer){clearInterval(autoTimer);autoTimer=null;this.textContent='▶ Auto-run';this.className='ctrl-btn';}
  else{this.textContent='■ Stop';this.className='ctrl-btn running';autoTimer=setInterval(function(){step();if(seenStates.size>=(1<<N)-1){clearInterval(autoTimer);autoTimer=null;document.getElementById('lfsrAuto').textContent='▶ Auto-run';document.getElementById('lfsrAuto').className='ctrl-btn';}},80);}
};
reset();`,
      outputHeight: 420,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 4-bit LFSR with maximal taps cycles through 15 unique states. How many states does a 10-bit maximal LFSR cycle through, and why is the all-zeros state excluded?`,
      options: [
        { label: 'A', text: '1024 states — a 10-bit register has 2¹⁰ = 1024 possible values' },
        { label: 'B', text: '1023 states — 2¹⁰ − 1 = 1023, because all-zeros produces 0 XOR 0 = 0 forever (stuck state)' },
        { label: 'C', text: '512 states — only half the states are reachable from the initial condition' },
        { label: 'D', text: '1000 states — 10-bit binary counts to 1000 before repeating' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. 2¹⁰ = 1024 total states, but the all-zeros state (0000000000) is excluded. When the register is all-zero, the XOR feedback is 0 ⊕ 0 = 0 — the new bit shifted in is also 0. The LFSR stays stuck at all-zeros forever. So the maximal sequence length is 2¹⁰ − 1 = 1023.',
      failMessage: 'A 10-bit LFSR has 2¹⁰ = 1024 total possible states. But the all-zeros state is a stuck state: XOR of any bits from a zero register = 0, so the feedback bit is 0, and the register stays all-zeros. Maximal sequence = 2¹⁰ − 1 = 1023 unique states.',
      html:'',css:`body{margin:0;padding:0;font-family:sans-serif}`,startCode:'',
      outputHeight:300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Registers and Shift Registers

**Parallel register**: N D flip-flops sharing a clock. Load enable (LD̅) selects between loading new data and recirculating Q. Gate cost: N flip-flops + N MUXes (or AND-OR gates). Real ICs: 74HC374, 74HC273.

**Shift register modes**:
- **SIPO**: serial in → shift → read 8 bits at once. Serial-to-parallel conversion.
- **PISO**: load 8 bits at once → shift → serial out. Parallel-to-serial conversion.
- **SISO**: N clock delay line. Signal delayed by N clock cycles.

**74HC595**: 8-bit SIPO with output latch. Two clocks (SRCLK for shifting, RCLK for atomic output update). Daisy-chainable via Q7'. 3 wires → 8 (or 16, 24...) outputs.

**LFSR**: shift register + XOR feedback from tap positions. Produces a pseudo-random sequence of $2^N - 1$ states. Used in CRC, spread spectrum, BIST, data scrambling. All-zeros state is excluded (stuck state).

Next lesson: counters — sequential circuits that count clock edges and implement state machines.`,
    },
  ],
};

export default {
  id: 'df-6-2-registers-shift-registers',
  slug: 'registers-shift-registers',
  chapter: 'df.6',
  order: 2,
  title: 'Registers and Shift Registers',
  subtitle: 'Storing words, moving bits serially, and converting between parallel and serial data.',
  tags: ['digital','register','shift-register','SIPO','PISO','SISO','74HC595','LFSR','serial','parallel','CRC'],
  hook: {
    question: 'How does a microcontroller with 5 I/O pins drive 24 LEDs? And how does a USB cable transmit gigabits per second over just two wires?',
    realWorldContext: 'The 74HC595 shift register is in millions of products — driving LED matrices, 7-segment displays, and relay banks from just 3 microcontroller pins. LFSRs generate the PN sequences in GPS satellites and WiFi chips. Shift registers are the bridge between serial communication and parallel hardware.',
  },
  intuition: {
    prose: [
      'Parallel register: N flip-flops, one clock. LD̅=0 loads new data; LD̅=1 recirculates Q.',
      'SIPO: bits enter serially, exit in parallel after N clocks. Serial→parallel conversion.',
      'PISO: bits loaded in parallel, exit serially one per clock. Parallel→serial conversion.',
      '74HC595: SRCLK shifts, RCLK latches atomically. 3 wires → 8+ outputs, daisy-chainable.',
    ],
    callouts: [
      {type:'tip', title:'Two-clock reason (74HC595)', body:'SRCLK shifts without changing outputs. RCLK transfers all 8 bits at once. This prevents output glitches during the 8-cycle shift process.'},
      {type:'important', title:'LFSR stuck state', body:'All-zeros is a LFSR stuck state — XOR of zeros is zero, new bit is zero, stays zero. Always initialise to a non-zero value. Hardware implementations often include a "kickstart" circuit.'},
    ],
    visualizations:[{id:'ScienceNotebook',title:'Registers and Shift Registers',props:{lesson:LESSON_DF_6_2}}],
  },
  math:{prose:[],callouts:[],visualizations:[]},
  rigor:{prose:[],callouts:[],visualizations:[]},
  examples:[],challenges:[],
  mentalModel:[
    'Parallel register = N flip-flops + load enable. LD̅=0: capture D. LD̅=1: hold Q.',
    'Shift register = flip-flop chain. Each clock: every bit moves one position right.',
    'SIPO: 8 SRCLK pulses fill the register. Read Q0–Q7 for the parallel byte.',
    'PISO: load in 1 clock, shift out 8 clocks. Reverses SIPO.',
    'LFSR: tap positions determine sequence. 2ᴺ−1 states (all-zeros excluded). CRC = LFSR mod-2 division.',
  ],
  checkpoints:['read-intuition'],
  quiz:[
    {
      id: 'q1',
      type: 'choice',
      text: '"Parallel register = N flip-flops + load enable. LD=0: capture D." You have an 8-bit parallel register. How many clock cycles does it take to load a byte?',
      options: [
        '8 cycles — one bit per cycle',
        '1 cycle — all 8 bits are presented in parallel on D0–D7 and captured simultaneously on the clock edge',
        '2 cycles — two 4-bit halves load sequentially',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Shift register = flip-flop chain. Each clock: every bit moves one position right." You load 8 bits serially into an 8-bit shift register. How many clock cycles does it take?',
      options: [
        '1 cycle',
        '8 cycles — one bit is shifted in per clock pulse',
        '16 cycles — one cycle in, one cycle to settle',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"SIPO: serial in, parallel out." Where is SIPO useful?',
      options: [
        'Converting a parallel bus to a serial stream for transmission over a single wire',
        'Receiving serial data (one bit at a time) and presenting all bits simultaneously for a processor to read in one operation',
        'Multiplying binary numbers by shifting',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"LFSR: 2ᴺ−1 states (all-zeros excluded). CRC = LFSR mod-2 division." Why is the all-zeros state excluded from an LFSR sequence?',
      options: [
        'Zero is not a valid digital state in hardware',
        'If all flip-flops are zero, every XOR feedback tap also produces zero — the register stays at zero forever and never generates a sequence',
        'The LFSR design wastes one state for synchronisation',
      ],
      correct: 1,
    },
  ],
};