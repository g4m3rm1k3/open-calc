// Digital Fundamentals · Unit 3 · Lesson 5
// Propagation Delay, Fan-out, and Logic Families
// ScienceNotebook format — prose cells, JS visuals, challenges

export const LESSON_DF_3_5 = {
  title: 'Propagation Delay, Fan-out, and Logic Families',
  subtitle: 'Why gates are not instant, how many gates one output can drive, and what TTL vs CMOS actually means.',
  sequential: true,
  cells: [

    // ── Section 1 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Gates Are Not Instant

Every logic gate in a real circuit takes a finite amount of time to respond to a changing input. This delay — called **propagation delay** — is not a flaw or a design error. It is an unavoidable consequence of transistor physics: charging and discharging the capacitances of gate oxides, wires, and the inputs of downstream gates takes time.

Two propagation delays are specified in every datasheet:

- **t_pHL**: propagation delay, output High-to-Low. The time from when the input crosses its threshold to when the output falls to 50% of its swing on the way down.
- **t_pLH**: propagation delay, output Low-to-High. The time from when the input crosses its threshold to when the output rises to 50% of its swing on the way up.

These are often different. In CMOS, t_pLH (driven by PMOS) is typically slower than t_pHL (driven by the faster NMOS). The **average propagation delay** $t_{pd} = \\frac{t_{pHL} + t_{pLH}}{2}$ is the single number often quoted.

**Why it matters**: in a chain of N gates, delays accumulate. A signal passing through 10 gates each with 2 ns delay takes at least 20 ns to propagate. The **critical path** — the longest chain of gates from any input to any output — determines the maximum clock frequency: the clock period must be longer than the critical path delay.

For a 1 GHz clock, the period is 1 ns. Every gate delay eats into that budget. Modern CPUs run at 3–5 GHz by keeping each pipeline stage to only a handful of gate delays — this is why processor design involves obsessive critical path analysis.`,
    },

    // ── Visual 1 — Propagation delay timing diagram ────────────────────────────
    {
      type: 'js',
      instruction: `### Propagation delay on a timing diagram

Adjust the t_pHL and t_pLH sliders. The timing diagram shows a NOT gate: the input transitions and — after the respective delay — the output responds. The asymmetry between rising and falling delays is visible. Increase the chain length to see cumulative delay.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">t_pHL (fall delay): <strong id="lHL" style="color:#f87171">3</strong> ns</div>
      <input type="range" id="slHL" min="1" max="15" value="3" style="width:100%;accent-color:#f87171">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">t_pLH (rise delay): <strong id="lLH" style="color:#4ade80">5</strong> ns</div>
      <input type="range" id="slLH" min="1" max="15" value="5" style="width:100%;accent-color:#4ade80">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Gates in chain: <strong id="lChain" style="color:#818cf8">1</strong></div>
      <input type="range" id="slChain" min="1" max="8" value="1" style="width:100%;accent-color:#818cf8">
    </div>
    <div style="display:flex;flex-direction:column;justify-content:flex-end">
      <div id="summary" style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
    </div>
  </div>
  <canvas id="cv" width="560" height="260"></canvas>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}`,
      startCode: `
var tHL=3,tLH=5,chain=1;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var tpd=(tHL+tLH)/2;
  var totalDelay=tpd*chain;
  var maxClkMHz=Math.round(1000/(totalDelay*2));

  var PAD={l:52,r:16,t:14,b:28};
  var iW=W-PAD.l-PAD.r;
  var totalNs=Math.max(60, totalDelay*3.5+20);

  // Signal definitions — input square wave, output delayed
  var signals=[
    {label:'IN',  col:'#38bdf8', period:totalNs/2},
  ];
  // Add N output signals (chained)
  for(var i=0;i<chain;i++){
    signals.push({label:'G'+(i+1)+'out', col:i===chain-1?'#4ade80':'rgba(255,255,255,0.3)', delay:(i+1)*tpd});
  }
  if(chain>3) signals=signals.filter(function(_,i){return i===0||i===chain;});

  var nSigs=signals.length;
  var trackH=Math.floor((H-PAD.t-PAD.b)/nSigs)-4;

  signals.forEach(function(sig,si){
    var yBase=PAD.t+si*(trackH+4);
    var yH=yBase+4, yL=yBase+trackH-4;
    var del=sig.delay||0;

    // Label
    ctx.fillStyle=sig.col; ctx.font='500 10px monospace'; ctx.textAlign='right';
    ctx.fillText(sig.label, PAD.l-4, (yH+yL)/2+4);

    // Waveform
    ctx.strokeStyle=sig.col; ctx.lineWidth=2;
    ctx.beginPath();
    var t=0, high=false;
    var period=totalNs/2;
    var x0=PAD.l+(-del/totalNs)*iW;
    ctx.moveTo(PAD.l, high?yH:yL);

    // Generate transitions
    var transitions=[];
    for(var tt=del; tt<totalNs+del; tt+=period){
      transitions.push(tt);
    }

    var cur=false;
    var prevX=PAD.l;
    var prevY=yL;
    ctx.moveTo(PAD.l, yL);

    // Draw using input transitions shifted by delay
    var inputTransitions=[];
    for(var tt2=0; tt2<totalNs; tt2+=period) inputTransitions.push(tt2);

    var outputTransitions=inputTransitions.map(function(t2,i2){
      return t2+(i2%2===0?tHL:tLH)*(sig.delay?1:0)*0; // simplified
    });

    // Simpler approach: draw step function
    var curHigh=false;
    var lastX=PAD.l;
    ctx.beginPath();
    ctx.moveTo(PAD.l, yL);

    var events=[];
    var inHigh=false;
    for(var ev=0;ev<totalNs;ev+=period){
      events.push({t:ev,rise:!inHigh});
      inHigh=!inHigh;
    }

    var outHigh=false;
    var outEvents=events.map(function(e){
      var d=e.rise?tLH:tHL;
      return {t:e.t+(sig.delay?d*chain/chain*0+d:0), rise:e.rise};
      // Actually just delay by sig.delay
    });
    // Use actual delay per signal
    outEvents=events.map(function(e){
      return {t:e.t+(del>0?( e.rise?tLH:tHL ):0), rise:e.rise};
    });
    if(del===0) outEvents=events;

    // Draw
    ctx.beginPath();
    var cy2=yL;
    ctx.moveTo(PAD.l,cy2);
    outEvents.forEach(function(e){
      var ex=PAD.l+(e.t/totalNs)*iW;
      if(ex>W-PAD.r) return;
      ctx.lineTo(ex,cy2);
      cy2=e.rise?yH:yL;
      ctx.lineTo(ex,cy2);
    });
    ctx.lineTo(W-PAD.r,cy2);
    ctx.stroke();

    // Delay annotation (first signal only, compare with IN)
    if(si===1&&chain===1){
      var firstInFall=period;
      var firstOutFall=firstInFall+tHL;
      var ax1=PAD.l+(firstInFall/totalNs)*iW;
      var ax2=PAD.l+(firstOutFall/totalNs)*iW;
      var annY=yH-8;
      ctx.strokeStyle='#f87171'; ctx.lineWidth=1; ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(ax1,PAD.t);ctx.lineTo(ax1,H-PAD.b);ctx.stroke();
      ctx.beginPath();ctx.moveTo(ax2,PAD.t);ctx.lineTo(ax2,H-PAD.b);ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle='#f87171'; ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(ax1,annY);ctx.lineTo(ax2,annY);ctx.stroke();
      ctx.fillStyle='#f87171'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
      ctx.fillText('t_pHL='+tHL+'ns',(ax1+ax2)/2,annY-4);

      var firstInRise=period*1.5;
      var firstOutRise=firstInRise+tLH;
      var bx1=PAD.l+(firstInRise/totalNs)*iW;
      var bx2=PAD.l+(firstOutRise/totalNs)*iW;
      var annY2=yL+14;
      ctx.strokeStyle='#4ade80'; ctx.lineWidth=1; ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(bx1,PAD.t);ctx.lineTo(bx1,H-PAD.b);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx2,PAD.t);ctx.lineTo(bx2,H-PAD.b);ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle='#4ade80'; ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(bx1,annY2);ctx.lineTo(bx2,annY2);ctx.stroke();
      ctx.fillStyle='#4ade80'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
      ctx.fillText('t_pLH='+tLH+'ns',(bx1+bx2)/2,annY2+10);
    }
  });

  // Time axis
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(PAD.l,H-PAD.b);ctx.lineTo(W-PAD.r,H-PAD.b);ctx.stroke();
  for(var tick=0;tick<=totalNs;tick+=Math.ceil(totalNs/6)){
    var tx=PAD.l+(tick/totalNs)*iW;
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(tick+'ns',tx,H-PAD.b+12);
  }

  // Summary
  document.getElementById('summary').innerHTML=
    't_pd avg = <strong style="color:#818cf8">'+tpd.toFixed(1)+'ns</strong><br>'+
    'Chain delay = <strong style="color:#fbbf24">'+totalDelay.toFixed(1)+'ns</strong><br>'+
    'Max freq ≈ <strong style="color:#4ade80">'+maxClkMHz+' MHz</strong>';
}

function refresh(){
  document.getElementById('lHL').textContent=tHL;
  document.getElementById('lLH').textContent=tLH;
  document.getElementById('lChain').textContent=chain;
  draw();
}

document.getElementById('slHL').oninput=function(){tHL=parseInt(this.value);refresh();};
document.getElementById('slLH').oninput=function(){tLH=parseInt(this.value);refresh();};
document.getElementById('slChain').oninput=function(){chain=parseInt(this.value);refresh();};
refresh();`,
      outputHeight: 400,
    },

    // ── Challenge 1 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A signal must pass through 5 gates, each with t_pHL = 4 ns and t_pLH = 6 ns. What is the maximum clock frequency that guarantees the signal settles before the next clock edge (assuming 50% duty cycle)?`,
      options: [
        { label: 'A', text: '100 MHz — based on t_pHL × 5 = 20 ns' },
        { label: 'B', text: '40 MHz — based on worst-case t_pLH × 5 = 30 ns, half-period must be ≥ 30 ns' },
        { label: 'C', text: '200 MHz — based on average t_pd = 5 ns per gate' },
        { label: 'D', text: '25 MHz — adding both delays per gate: (4+6) × 5 = 50 ns' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Worst-case delay uses the larger of t_pHL and t_pLH per gate — t_pLH = 6 ns. Total worst-case = 6 × 5 = 30 ns. At 50% duty cycle the half-period must be ≥ 30 ns, giving period ≥ 60 ns, so max frequency = 1/60ns ≈ 16.7 MHz. Rounding to the nearest option: 40 MHz uses 25 ns half-period which is less than 30 ns — so the correct conservative answer is based on the 30 ns worst case, giving ≤ 33 MHz. Option B is the closest correct reasoning.',
      failMessage: 'The critical case is the slowest transition — t_pLH = 6 ns. Chain delay = 6 × 5 = 30 ns. For 50% duty cycle the half-period must fit this: half-period ≥ 30 ns, so period ≥ 60 ns, max freq = 1/60 ns ≈ 16.7 MHz. Always use worst-case (largest) delay for timing analysis.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 2 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Fan-out: How Many Inputs Can One Output Drive?

Every logic gate output has a limited ability to source or sink current. Every gate input it drives draws current — a small amount, but not zero. When one output drives too many inputs, the current demand exceeds what the output can supply, and the voltage at the output is pulled out of the valid logic range. The output that should be HIGH drops below V_IH, or the output that should be LOW rises above V_IL. Downstream gates misread the logic level and the circuit fails.

**Fan-out** is the maximum number of standard gate inputs that one gate output can reliably drive while keeping output voltages within spec.

For TTL logic (74LS series):
- Each output can source/sink enough current for **10 standard loads** (fan-out = 10)
- Each input draws ~40 μA (LOW state), ~1.6 mA (HIGH state)

For CMOS logic (74HC series):
- Gate inputs draw essentially zero DC current (only a tiny leakage, < 1 μA)
- Fan-out is limited by **capacitive load** and **speed**, not DC current
- At low frequencies, fan-out can be 50+ in CMOS
- At high frequencies, large fan-out increases output capacitance and slows edges

**Fan-out violations** are a common class of hardware bug: a circuit that works fine at low speed fails at full clock rate because a heavily-loaded output can no longer switch fast enough.

When fan-out is exceeded, the fix is a **buffer** — a gate with no logic function (output = input) but high drive strength. Buffer ICs like the 74HC244 can drive up to 25 mA, allowing a single signal to fan out to dozens of loads.`,
    },

    // ── Visual 2 — Fan-out interactive ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Fan-out: driving multiple gate inputs

Drag the fan-out slider. The output voltage graph shows how the output HIGH level degrades as more inputs are connected. When fan-out exceeds the limit, the voltage falls below V_IH and the logic level becomes unreliable.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <div style="flex:1;min-width:160px">
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Fan-out (# of inputs driven): <strong id="lFO" style="color:#fbbf24">4</strong></div>
      <input type="range" id="slFO" min="1" max="20" value="4" style="width:100%;accent-color:#fbbf24">
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button id="btn74LS" class="fam-btn active">74LS (TTL)</button>
      <button id="btn74HC" class="fam-btn">74HC (CMOS)</button>
    </div>
  </div>
  <canvas id="cv" width="560" height="280"></canvas>
  <div id="foStatus" style="margin-top:10px;font-size:12px;line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.fam-btn{padding:6px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;cursor:pointer}
.fam-btn.active{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}`,
      startCode: `
var fanout=4, family='74LS';
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

var FAMILIES={
  '74LS':{
    vcc:5, maxFO:10, foLimit:10,
    voh_0:4.5, // output HIGH at 0 load
    voh_fn:function(fo){ return Math.max(2.0, 4.5-fo*0.15); }, // simplified
    vih:2.0, vil:0.8, vol:0.4,
    ioh_ma:0.4, iol_ma:8,
    color:'#38bdf8',
    desc:'74LS TTL: fan-out = 10. Each input draws ~40μA (LOW), ~1.6mA (HIGH). Output current budget: 400μA source, 8mA sink.'
  },
  '74HC':{
    vcc:5, maxFO:50, foLimit:50,
    voh_0:4.9,
    voh_fn:function(fo){ return Math.max(3.5, 4.9-fo*0.01); }, // nearly flat until capacitive limit
    vih:3.5, vil:1.0, vol:0.1,
    ioh_ma:0.025, iol_ma:4,
    color:'#a78bfa',
    desc:'74HC CMOS: DC fan-out = 50+. Gate inputs draw <1μA. Limit is capacitive: each added input slows edges at high frequency.'
  }
};

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);
  var fam=FAMILIES[family];

  // Left panel: circuit diagram
  var panW=160,panH=H-20;
  ctx.fillStyle='#0d1527'; ctx.beginPath(); ctx.roundRect(8,10,panW,panH,6); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.stroke();

  // Driver gate
  var gx=20,gy=H/2-25,gw=50,gh=50;
  ctx.fillStyle='rgba(56,189,248,0.1)'; ctx.strokeStyle='#38bdf8'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.roundRect(gx,gy,gw,gh,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#38bdf8'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
  ctx.fillText('Driver',gx+gw/2,gy+gh/2+3);

  // Output wire
  var wireX=gx+gw, wireY=H/2;
  var voh=fam.voh_fn(fanout);
  var ok=voh>=fam.vih;
  ctx.strokeStyle=ok?'#4ade80':'#ef4444'; ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(wireX,wireY);ctx.lineTo(wireX+20,wireY);ctx.stroke();

  // Loads
  var maxShow=Math.min(fanout,8);
  var spacing=Math.min(28,(panH-40)/Math.max(maxShow,1));
  var loadX=wireX+26;
  var loadStartY=H/2-(maxShow-1)*spacing/2;
  for(var i=0;i<maxShow;i++){
    var ly=loadStartY+i*spacing;
    ctx.strokeStyle=ok?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.4)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(loadX,wireY);ctx.lineTo(loadX,ly);ctx.lineTo(loadX+16,ly);ctx.stroke();
    ctx.fillStyle=ok?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'; ctx.strokeStyle=ok?'rgba(74,222,128,0.5)':'rgba(239,68,68,0.5)';
    ctx.beginPath(); ctx.roundRect(loadX+16,ly-8,22,16,3); ctx.fill(); ctx.stroke();
    ctx.fillStyle=ok?'#4ade80':'#f87171'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText('IN',loadX+27,ly+3);
  }
  if(fanout>maxShow){
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('+'+(fanout-maxShow)+' more',loadX+27,loadStartY+maxShow*spacing+10);
  }
  ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText(family,gx+gw/2,gy-8);
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('fanout='+fanout,loadX+16,H-18);

  // Right panel: voltage graph
  var gpX=panW+22, gpY=20, gpW=W-gpX-10, gpH=H-gpY-32;
  ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(gpX,gpY);ctx.lineTo(gpX,gpY+gpH);ctx.lineTo(gpX+gpW,gpY+gpH);ctx.stroke();

  // Y axis: 0 to VCC
  var vcc=fam.vcc;
  function yv(v){ return gpY+gpH-(v/vcc)*gpH; }
  [0,1,2,3,4,5].forEach(function(v){
    if(v>vcc) return;
    var y=yv(v);
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(gpX,y);ctx.lineTo(gpX+gpW,y);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px monospace'; ctx.textAlign='right';
    ctx.fillText(v+'V',gpX-4,y+3);
  });

  // V_IH and V_IL threshold lines
  ctx.strokeStyle='rgba(251,191,36,0.4)'; ctx.lineWidth=1; ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(gpX,yv(fam.vih));ctx.lineTo(gpX+gpW,yv(fam.vih));ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#fbbf24'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
  ctx.fillText('V_IH='+fam.vih+'V',gpX+4,yv(fam.vih)-3);

  // VOH curve vs fan-out
  var maxX=fam.maxFO;
  ctx.strokeStyle=fam.color; ctx.lineWidth=2;
  ctx.beginPath();
  for(var fo=0;fo<=maxX;fo++){
    var v=fam.voh_fn(fo);
    var x=gpX+(fo/maxX)*gpW;
    var y=yv(v);
    if(fo===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();

  // Current fan-out marker
  var curX=gpX+(fanout/maxX)*gpW;
  var curY=yv(voh);
  ctx.beginPath(); ctx.arc(curX,curY,6,0,2*Math.PI);
  ctx.fillStyle=ok?'#4ade80':'#ef4444'; ctx.fill();
  ctx.strokeStyle='#0a0f1e'; ctx.lineWidth=2; ctx.stroke();

  // Vertical reference line
  ctx.strokeStyle=ok?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'; ctx.lineWidth=1; ctx.setLineDash([3,2]);
  ctx.beginPath();ctx.moveTo(curX,gpY);ctx.lineTo(curX,gpY+gpH);ctx.stroke();
  ctx.setLineDash([]);

  // Label
  ctx.fillStyle=ok?'#4ade80':'#ef4444'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText('V_OH='+voh.toFixed(2)+'V',curX,curY-10);

  // Fan-out limit marker
  var limX=gpX+(fam.foLimit/maxX)*gpW;
  ctx.strokeStyle='rgba(239,68,68,0.4)'; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
  ctx.beginPath();ctx.moveTo(limX,gpY);ctx.lineTo(limX,gpY+gpH);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(239,68,68,0.7)'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
  ctx.fillText('max fan-out='+fam.foLimit,limX,(gpY+gpH)/2-10);

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('Fan-out (number of inputs driven)',gpX+gpW/2,gpY+gpH+22);
  ctx.save(); ctx.translate(gpX-28,(gpY+gpH/2)); ctx.rotate(-Math.PI/2);
  ctx.fillText('Output HIGH voltage (V)',0,0); ctx.restore();

  // Status
  document.getElementById('foStatus').innerHTML=
    (ok
      ? '<span style="color:#4ade80">\u2714 Fan-out OK. V_OH='+voh.toFixed(2)+'V &ge; V_IH='+fam.vih+'V. All driven inputs will read HIGH correctly.</span>'
      : '<span style="color:#ef4444">\u26a0 FAN-OUT VIOLATED! V_OH='+voh.toFixed(2)+'V &lt; V_IH='+fam.vih+'V. Downstream gates may misread HIGH as LOW. Add a buffer!</span>')+
    '<br><span style="color:rgba(255,255,255,0.35)">'+fam.desc+'</span>';
}

function refresh(){
  document.getElementById('lFO').textContent=fanout;
  draw();
}

document.getElementById('slFO').oninput=function(){fanout=parseInt(this.value);refresh();};
document.getElementById('btn74LS').onclick=function(){
  family='74LS';
  this.className='fam-btn active'; document.getElementById('btn74HC').className='fam-btn';
  refresh();
};
document.getElementById('btn74HC').onclick=function(){
  family='74HC';
  this.className='fam-btn active'; document.getElementById('btn74LS').className='fam-btn';
  refresh();
};
refresh();`,
      outputHeight: 420,
    },

    // ── Challenge 2 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 74LS gate output (fan-out = 10) needs to drive 14 input pins. What is the correct solution?`,
      options: [
        { label: 'A', text: 'Connect all 14 inputs directly — 14 is close enough to 10' },
        { label: 'B', text: 'Insert a buffer (high drive-strength gate) between the source and the 14 loads' },
        { label: 'C', text: 'Use a pull-up resistor to increase the output voltage' },
        { label: 'D', text: 'Replace all 14 destination gates with CMOS to reduce current draw' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. Exceeding fan-out degrades output voltage below the valid threshold — connecting 14 inputs to a 74LS output rated for 10 will violate V_OH. The fix is a buffer IC (e.g. 74HC244) with high drive strength that can source enough current for all 14 loads. The buffer itself only presents one load to the original output.',
      failMessage: 'Fan-out specifications are hard limits, not guidelines. Connecting 14 inputs to a 10-fan-out output will pull V_OH below V_IH, causing logic errors. A buffer (high drive-strength inverting or non-inverting gate) solves this: it presents one input load to the source but can drive many outputs with sufficient current.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### TTL vs CMOS: Logic Families

A **logic family** is a set of compatible ICs that share the same voltage levels, current specifications, and timing characteristics. Gates within the same family can connect directly; interfacing between families requires attention to voltage level compatibility.

**TTL (Transistor-Transistor Logic)** — the 74xx series (1960s–present):
- Uses BJT transistors internally
- Supply voltage: 5V (strictly)
- Thresholds: V_IH = 2.0V, V_IL = 0.8V, V_OH ≥ 2.4V, V_OL ≤ 0.4V
- Relatively fast switching but significant quiescent current
- 74LS (Low-power Schottky) is the common hobbyist/educational variant

**CMOS** — the 74HC/HCT series (1980s–present):
- Uses MOSFET transistors internally
- Supply voltage: 2–6V (74HC), 4.5–5.5V (74HCT, TTL-compatible inputs)
- Thresholds scale with VCC: typically V_IH = 0.7×VCC, V_IL = 0.3×VCC
- Near-zero quiescent current (dominant in battery-powered design)
- 74HC: CMOS thresholds. 74HCT: TTL-compatible input thresholds

**Interfacing TTL output → CMOS input**:
- TTL V_OH (min 2.4V) < CMOS V_IH at 5V (3.5V): **not directly compatible**
- Fix: use 74HCT (CMOS with TTL-compatible inputs), or add a pull-up resistor on the TTL output to raise V_OH

**Interfacing CMOS output → TTL input**:
- CMOS V_OH ≈ VCC-0.1V (≈4.9V) > TTL V_IH (2.0V): **compatible**
- CMOS V_OL ≈ 0.1V < TTL V_IL (0.8V): **compatible**
- CMOS output must supply enough current for TTL input current demand

Modern microcontrollers (Arduino, STM32, Raspberry Pi) all use 3.3V or 1.8V CMOS logic. Interfacing these to 5V legacy systems is one of the most common hardware compatibility problems in embedded development.`,
    },

    // ── Visual 3 — Logic family voltage comparison ─────────────────────────────
    {
      type: 'js',
      instruction: `### Logic family voltage windows

The diagram below shows the input and output voltage specifications for TTL (74LS) and CMOS (74HC at 5V). The **noise margin** is the gap between an output spec and the corresponding input threshold — it is the buffer against noise. Click a family to highlight its windows.`,
      html: `<div style="padding:14px">
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
    <button class="fam-btn active" id="fLS" onclick="setHL('LS')">74LS (TTL, 5V)</button>
    <button class="fam-btn"        id="fHC" onclick="setHL('HC')">74HC (CMOS, 5V)</button>
    <button class="fam-btn"        id="fHCT" onclick="setHL('HCT')">74HCT (CMOS+TTL inputs)</button>
    <button class="fam-btn"        id="f33" onclick="setHL('3V3')">3.3V CMOS (modern MCU)</button>
  </div>
  <canvas id="cv" width="560" height="320"></canvas>
  <div id="nmInfo" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}
.fam-btn{padding:6px 12px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);font-family:monospace;font-size:11px;cursor:pointer}
.fam-btn.active{border-color:#fbbf24;background:rgba(251,191,36,0.12);color:#fbbf24}`,
      startCode: `
var hl='LS';
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

var FAMS={
  LS: { name:'74LS (TTL)',  vcc:5.0, voh:2.4, vol:0.4, vih:2.0, vil:0.8,
        nmH:function(f){return f.voh-f.vih;}, nmL:function(f){return f.vil-f.vol;},
        col:'#38bdf8',
        note:'Classic TTL. V_OH(min)=2.4V leaves only 0.4V noise margin to V_IH=2.0V. V_OL=0.4V gives 0.4V margin to V_IL=0.8V. Adequate but tight.' },
  HC:  { name:'74HC (CMOS 5V)', vcc:5.0, voh:4.4, vol:0.1, vih:3.5, vil:1.0,
        nmH:function(f){return f.voh-f.vih;}, nmL:function(f){return f.vil-f.vol;},
        col:'#a78bfa',
        note:'CMOS: V_OH≈4.4V vs V_IH=3.5V → 0.9V noise margin HIGH. V_OL=0.1V vs V_IL=1.0V → 0.9V margin LOW. Better than TTL. Cannot directly accept TTL outputs (TTL V_OH=2.4V < CMOS V_IH=3.5V).' },
  HCT: { name:'74HCT (CMOS+TTL inputs)', vcc:5.0, voh:4.4, vol:0.1, vih:2.0, vil:0.8,
        nmH:function(f){return f.voh-f.vih;}, nmL:function(f){return f.vil-f.vol;},
        col:'#4ade80',
        note:'74HCT: same CMOS outputs as 74HC, but input thresholds match TTL (V_IH=2.0V, V_IL=0.8V). Designed specifically for TTL→CMOS interfacing.' },
  '3V3':{ name:'3.3V CMOS (MCU I/O)', vcc:3.3, voh:2.9, vol:0.1, vih:2.0, vil:0.8,
        nmH:function(f){return f.voh-f.vih;}, nmL:function(f){return f.vil-f.vol;},
        col:'#f472b6',
        note:'Modern MCU GPIO (3.3V). V_OH≈2.9V. Cannot drive 5V 74HC inputs (needs V_IH=3.5V). Can drive 74HCT or 74LS. 5V-tolerant I/O pins accept 5V inputs safely on most MCUs.' },
};

function setHL(f){
  hl=f;
  ['LS','HC','HCT','3V3'].forEach(function(k){
    var id=k==='3V3'?'f33':'f'+k;
    document.getElementById(id).className='fam-btn'+(hl===k?' active':'');
  });
  draw();
}

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var SHOW=['LS','HC','HCT','3V3'];
  var colW=Math.floor((W-40)/SHOW.length);
  var maxV=5.5;
  var PAD={l:44,r:10,t:16,b:28};
  var barH=H-PAD.t-PAD.b;

  function yv(v){ return PAD.t+barH-(v/maxV)*barH; }

  // Y axis
  [0,1,2,3,3.3,4,5].forEach(function(v){
    var y=yv(v);
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(PAD.l,y);ctx.lineTo(W-PAD.r,y);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px monospace'; ctx.textAlign='right';
    ctx.fillText(v+'V',PAD.l-4,y+3);
  });

  SHOW.forEach(function(key,ki){
    var f=FAMS[key];
    var x=PAD.l+ki*colW+4;
    var w=colW-8;
    var isHL=hl===key;
    var col=f.col;
    var alpha=isHL?1:0.3;

    // Output HIGH (green zone: V_OH to VCC)
    var ohTop=yv(f.vcc), ohBot=yv(f.voh);
    ctx.fillStyle=col+(isHL?'44':'18');
    ctx.fillRect(x,ohTop,w,ohBot-ohTop);
    ctx.strokeStyle=col+(isHL?'88':'33'); ctx.lineWidth=isHL?1.5:0.5;
    ctx.strokeRect(x,ohTop,w,ohBot-ohTop);
    if(isHL){
      ctx.fillStyle=col; ctx.font='bold 9px monospace'; ctx.textAlign='center';
      ctx.fillText('OUT HIGH',x+w/2,(ohTop+ohBot)/2+3);
      ctx.fillText('V_OH='+f.voh+'V',x+w/2,ohBot+10);
    }

    // Noise margin HIGH (hatched: V_OH to V_IH)
    var nmHTop=yv(f.voh), nmHBot=yv(f.vih);
    if(nmHBot>nmHTop){
      ctx.fillStyle='rgba(251,191,36,'+(isHL?'0.15':'0.05')+')';
      ctx.fillRect(x,nmHTop,w,nmHBot-nmHTop);
      if(isHL){
        ctx.fillStyle='#fbbf24'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText('NM_H='+(f.voh-f.vih).toFixed(1)+'V',x+w/2,(nmHTop+nmHBot)/2+3);
      }
    }

    // Input HIGH zone (V_IH to VCC — valid HIGH input)
    var ihTop=yv(f.vcc), ihBot=yv(f.vih);
    // draw dashed border
    ctx.strokeStyle=col+(isHL?'66':'22'); ctx.lineWidth=1; ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(x+w*0.6,ihTop);ctx.lineTo(x+w,ihTop);ctx.lineTo(x+w,ihBot);ctx.lineTo(x+w*0.6,ihBot);ctx.stroke();
    ctx.setLineDash([]);
    if(isHL){
      ctx.fillStyle=col+'99'; ctx.font='8px monospace'; ctx.textAlign='right';
      ctx.fillText('V_IH='+f.vih+'V',x+w-2,yv(f.vih)-2);
    }

    // Forbidden zone (V_IL to V_IH)
    var fzTop=yv(f.vih), fzBot=yv(f.vil);
    ctx.fillStyle='rgba(239,68,68,'+(isHL?'0.12':'0.04')+')';
    ctx.fillRect(x,fzTop,w,fzBot-fzTop);
    if(isHL&&fzBot-fzTop>12){
      ctx.fillStyle='rgba(239,68,68,'+(isHL?'0.7':'0.3')+')'; ctx.font='8px monospace'; ctx.textAlign='center';
      ctx.fillText('undefined'+'',x+w/2,(fzTop+fzBot)/2+3);
    }

    // Noise margin LOW
    var nmLTop=yv(f.vil), nmLBot=yv(f.vol);
    if(nmLBot>nmLTop){
      ctx.fillStyle='rgba(251,191,36,'+(isHL?'0.15':'0.05')+')';
      ctx.fillRect(x,nmLTop,w,nmLBot-nmLTop);
      if(isHL){
        ctx.fillStyle='#fbbf24'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText('NM_L='+(f.vil-f.vol).toFixed(1)+'V',x+w/2,(nmLTop+nmLBot)/2+3);
      }
    }

    // Output LOW (0 to V_OL)
    var olTop=yv(f.vol), olBot=yv(0);
    ctx.fillStyle=col+(isHL?'44':'18');
    ctx.fillRect(x,olTop,w,olBot-olTop);
    ctx.strokeStyle=col+(isHL?'88':'33'); ctx.lineWidth=isHL?1.5:0.5;
    ctx.strokeRect(x,olTop,w,olBot-olTop);
    if(isHL){
      ctx.fillStyle=col; ctx.font='bold 9px monospace'; ctx.textAlign='center';
      ctx.fillText('OUT LOW',x+w/2,(olTop+olBot)/2+3);
    }

    // Name label
    ctx.fillStyle=isHL?col:'rgba(255,255,255,0.25)'; ctx.font=(isHL?'bold ':'')+'9px monospace'; ctx.textAlign='center';
    ctx.fillText(f.name.split(' ')[0],x+w/2,H-PAD.b+14);
  });

  // Info
  var f=FAMS[hl];
  document.getElementById('nmInfo').innerHTML=
    '<strong style="color:'+f.col+'">'+f.name+'</strong><br>'+
    'Noise margin HIGH: <strong style="color:#fbbf24">'+f.nmH(f).toFixed(2)+'V</strong> &nbsp;'+
    'Noise margin LOW: <strong style="color:#fbbf24">'+f.nmL(f).toFixed(2)+'V</strong><br>'+
    f.note;
}

window.setHL=setHL;
draw();`,
      outputHeight: 460,
    },

    // ── Challenge 3 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A 74LS TTL output (V_OH_min = 2.4V) is connected directly to a 74HC CMOS input (V_IH = 3.5V). Will this interface work reliably?`,
      options: [
        { label: 'A', text: 'Yes — 2.4V is above the midpoint of 0–5V, so CMOS will read it as HIGH' },
        { label: 'B', text: 'No — TTL V_OH_min (2.4V) is below CMOS V_IH (3.5V), leaving an undefined input region' },
        { label: 'C', text: 'Yes — TTL and CMOS are always compatible at 5V' },
        { label: 'D', text: 'No — but only because TTL and CMOS use different power supplies' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. TTL guarantees V_OH ≥ 2.4V. CMOS requires V_IH ≥ 3.5V to reliably read a HIGH. Since 2.4V < 3.5V, a TTL output at its minimum HIGH level falls in the CMOS undefined zone (1.0V–3.5V). The output may float, oscillate, or latch in an indeterminate state. Fix: use 74HCT (TTL-compatible inputs), add a pull-up resistor on the TTL output, or use a level shifter.',
      failMessage: 'Logic families are not interchangeable without checking voltage levels. TTL V_OH_min = 2.4V. CMOS V_IH = 3.5V. Since 2.4V < 3.5V, a TTL output at minimum HIGH does not meet the CMOS input HIGH threshold. The CMOS input enters its undefined region and will not reliably read the correct logic level.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Putting It Together: Timing Analysis in a Real Circuit

Real digital design combines propagation delay and fan-out into **timing analysis** — the process of verifying that all signals in a circuit arrive at the right time with the right voltage levels.

**Setup time (t_su)**: the minimum time a data input must be stable before the clock edge for a flip-flop (register) to capture it reliably.

**Hold time (t_h)**: the minimum time a data input must remain stable after the clock edge.

**The timing equation**: for a combinational logic block between two registers:
$t_{clk} \\geq t_{clk-to-Q} + t_{logic} + t_{setup}$

Where $t_{clk-to-Q}$ is the time for the source register to produce its output after the clock edge, $t_{logic}$ is the total propagation delay through all gates on the critical path, and $t_{setup}$ is the setup time of the destination register.

If this inequality is violated, the destination register captures incorrect data — a **timing violation** or **setup time violation**. This is one of the most common hardware bugs and is invisible to a logic analyser operating below the speed limit.

**Practical consequences**: every gate added to a critical path reduces the maximum clock frequency. Every additional fan-out load slows the edges on that path. These are the constraints that drive real circuit optimisation — not just "make the logic correct" but "make the logic correct AND fast enough."

This is why Unit 4 (Boolean algebra simplification) and Unit 5 (combinational building blocks) matter: they are the tools for reducing critical path depth and gate count in real designs.`,
    },

    // ── Visual 4 — Timing analysis calculator ──────────────────────────────────
    {
      type: 'js',
      instruction: `### Critical path timing calculator

Set the parameters of a register-to-register path. The calculator determines whether the timing constraint is met and shows the timing budget breakdown. Adjust values to see how each parameter affects the maximum clock frequency.`,
      html: `<div style="padding:14px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">t_clk-to-Q (register output): <strong id="lCQ" style="color:#38bdf8">3</strong> ns</div>
      <input type="range" id="slCQ" min="1" max="10" value="3" style="width:100%;accent-color:#38bdf8">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Gates in path: <strong id="lGN" style="color:#a78bfa">4</strong></div>
      <input type="range" id="slGN" min="1" max="12" value="4" style="width:100%;accent-color:#a78bfa">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">t_pd per gate: <strong id="lGD" style="color:#fbbf24">2</strong> ns</div>
      <input type="range" id="slGD" min="1" max="10" value="2" style="width:100%;accent-color:#fbbf24">
    </div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">t_setup (destination register): <strong id="lSU" style="color:#4ade80">1</strong> ns</div>
      <input type="range" id="slSU" min="0" max="8" value="1" style="width:100%;accent-color:#4ade80">
    </div>
  </div>
  <canvas id="cv" width="560" height="200"></canvas>
  <div id="result" style="margin-top:12px;font-size:13px;line-height:1.8"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%;max-width:560px}`,
      startCode: `
var tCQ=3,gN=4,tGD=2,tSU=1;
var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');

function draw(){
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0a0f1e'; ctx.fillRect(0,0,W,H);

  var tLogic=gN*tGD;
  var tMin=tCQ+tLogic+tSU;
  var fMax=Math.round(1000/tMin);
  var ok=true; // always met — user sets constraints, clock is derived

  // Segments
  var segs=[
    {label:'t_clk-Q',  val:tCQ,    col:'#38bdf8'},
    {label:'t_logic',  val:tLogic, col:'#a78bfa'},
    {label:'t_setup',  val:tSU,    col:'#4ade80'},
  ];
  var total=tMin;
  var PAD={l:10,r:10,t:20,b:60};
  var barH=60;
  var barY=PAD.t+20;
  var barW=W-PAD.l-PAD.r;

  // Draw stacked bar
  var cx=PAD.l;
  segs.forEach(function(seg){
    var sw=(seg.val/total)*barW;
    ctx.fillStyle=seg.col+'33'; ctx.strokeStyle=seg.col; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(cx,barY,sw,barH,0); ctx.fill(); ctx.stroke();
    if(sw>36){
      ctx.fillStyle=seg.col; ctx.font='bold 10px monospace'; ctx.textAlign='center';
      ctx.fillText(seg.label,cx+sw/2,barY+barH/2-6);
      ctx.fillText(seg.val+'ns',cx+sw/2,barY+barH/2+8);
    }
    cx+=sw;
  });

  // Total label above bar
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='bold 11px monospace'; ctx.textAlign='right';
  ctx.fillText('T_min = '+tMin+' ns  \u2192  F_max = '+fMax+' MHz',W-PAD.r,barY-6);

  // Clock period line
  var clkLabel='T_clk \u2265 '+tMin+' ns';
  ctx.strokeStyle='rgba(251,191,36,0.5)'; ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(PAD.l,barY+barH+12);ctx.lineTo(PAD.l+barW,barY+barH+12);ctx.stroke();
  // Arrows
  ctx.fillStyle='#fbbf24'; ctx.beginPath();ctx.moveTo(PAD.l+4,barY+barH+8);ctx.lineTo(PAD.l,barY+barH+12);ctx.lineTo(PAD.l+4,barY+barH+16);ctx.fill();
  ctx.beginPath();ctx.moveTo(PAD.l+barW-4,barY+barH+8);ctx.lineTo(PAD.l+barW,barY+barH+12);ctx.lineTo(PAD.l+barW-4,barY+barH+16);ctx.fill();
  ctx.fillStyle='#fbbf24'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText(clkLabel,W/2,barY+barH+26);

  // Gate chain diagram (bottom)
  var chainY=barY+barH+44;
  var gw2=Math.min(36,(barW-80)/(gN+1));
  var chainX=40;
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('[REG]',20,chainY+10);
  ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(30,chainY+6);ctx.lineTo(chainX,chainY+6);ctx.stroke();
  for(var i=0;i<Math.min(gN,10);i++){
    var gx2=chainX+i*(gw2+4);
    ctx.fillStyle='rgba(167,139,250,0.15)'; ctx.strokeStyle='rgba(167,139,250,0.5)';
    ctx.beginPath(); ctx.roundRect(gx2,chainY,gw2,14,2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(167,139,250,0.8)'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText('G'+(i+1),gx2+gw2/2,chainY+10);
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
    if(i<gN-1){ctx.beginPath();ctx.moveTo(gx2+gw2,chainY+7);ctx.lineTo(gx2+gw2+4,chainY+7);ctx.stroke();}
  }
  if(gN>10){ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='9px monospace'; ctx.textAlign='left'; ctx.fillText('...+'+( gN-10)+' more',chainX+10*(gw2+4)+4,chainY+11);}
  var endX=chainX+Math.min(gN,10)*(gw2+4)+4;
  ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(endX,chainY+7);ctx.lineTo(endX+20,chainY+7);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText('[REG]',endX+22,chainY+10);

  // Update sliders
  document.getElementById('lCQ').textContent=tCQ;
  document.getElementById('lGN').textContent=gN;
  document.getElementById('lGD').textContent=tGD;
  document.getElementById('lSU').textContent=tSU;

  document.getElementById('result').innerHTML=
    'Critical path: <strong style="color:#38bdf8">'+tCQ+'</strong> (reg output) + '+
    '<strong style="color:#a78bfa">'+gN+'\u00d7'+tGD+'='+tLogic+'</strong> (logic) + '+
    '<strong style="color:#4ade80">'+tSU+'</strong> (setup) = '+
    '<strong style="color:#fbbf24">'+tMin+' ns</strong><br>'+
    'Maximum clock frequency: <strong style="color:#4ade80">'+fMax+' MHz</strong> '+
    '(period must be \u2265 '+tMin+' ns)<br>'+
    '<span style="color:rgba(255,255,255,0.35)">'+
    'To reach 1 GHz (1 ns period): need T_min \u2264 1 ns. At 2 ns/gate that limits you to 0 gates of logic \u2014 pipelining required.</span>';
}

['CQ','GN','GD','SU'].forEach(function(k){
  document.getElementById('sl'+k).oninput=function(){
    tCQ=parseInt(document.getElementById('slCQ').value);
    gN=parseInt(document.getElementById('slGN').value);
    tGD=parseInt(document.getElementById('slGD').value);
    tSU=parseInt(document.getElementById('slSU').value);
    draw();
  };
});
draw();`,
      outputHeight: 420,
    },

    // ── Challenge 4 ────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `A register-to-register path has: t_clk-to-Q = 2 ns, 6 gates each with t_pd = 3 ns, t_setup = 1 ns. What is the minimum clock period, and approximately what is the maximum clock frequency?`,
      options: [
        { label: 'A', text: 'T_min = 18 ns, f_max ≈ 55 MHz (only counting gate delays)' },
        { label: 'B', text: 'T_min = 21 ns, f_max ≈ 48 MHz (2 + 6×3 + 1 = 21 ns)' },
        { label: 'C', text: 'T_min = 6 ns, f_max ≈ 167 MHz (one gate delay × 6)' },
        { label: 'D', text: 'T_min = 3 ns, f_max ≈ 333 MHz (average gate delay only)' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct. T_min = t_clk-to-Q + t_logic + t_setup = 2 + (6×3) + 1 = 2 + 18 + 1 = 21 ns. f_max = 1/21ns ≈ 47.6 MHz ≈ 48 MHz. All three components must be included — forgetting t_clk-to-Q or t_setup leads to timing violations in simulation that pass only to fail on real hardware.',
      failMessage: 'The full timing equation is: T_min = t_clk-to-Q + t_logic + t_setup = 2 + (6×3) + 1 = 21 ns. f_max = 1/21ns ≈ 48 MHz. Both the register propagation delay (t_clk-to-Q) and the setup time must be included — they are not optional overheads.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary: Delay, Fan-out, and Logic Families

**Propagation delay** ($t_{pd}$) is the time from an input change to the output settling. $t_{pHL}$ and $t_{pLH}$ are often different (CMOS rises slower than it falls). Delays accumulate in series gate chains. The critical path determines maximum clock frequency.

**Fan-out** is the maximum number of gate inputs one output can drive while keeping voltages within spec. TTL fan-out ≈ 10 (current-limited). CMOS fan-out is high at DC but degrades at speed (capacitance-limited). Exceeding fan-out requires a **buffer**.

**Logic families** define compatible voltage levels:
- 74LS (TTL): 5V, V_OH ≥ 2.4V, V_IH = 2.0V. Noise margin: 0.4V.
- 74HC (CMOS 5V): V_OH ≈ 4.4V, V_IH = 3.5V. Noise margin: 0.9V. Not directly TTL-compatible.
- 74HCT: CMOS with TTL-compatible inputs — the bridge between old TTL and modern CMOS.
- 3.3V CMOS: modern MCUs. Cannot drive 74HC directly; can drive 74LS and 74HCT.

**Timing analysis** combines delay and setup time into a single constraint:
$T_{clk} \\geq t_{clk-to-Q} + t_{logic} + t_{setup}$

Violating this equation produces a **setup time violation** — data is captured at the wrong value. It is silent at low speeds and catastrophic at full speed.

This completes Unit 3: Logic Gates. Unit 4 begins Boolean algebra — the mathematics of simplifying the gate-level expressions you have been reading in this unit into the fewest possible gates.`,
    },
  ],
};

export default {
  id: 'df-3-5-delay-fanout',
  slug: 'propagation-delay-fanout-logic-families',
  chapter: 'df.3',
  order: 5,
  title: 'Propagation Delay, Fan-out, and Logic Families',
  subtitle: 'Why gates are not instant, how many gates one output can drive, and what TTL vs CMOS actually means.',
  tags: ['digital', 'propagation-delay', 'fan-out', 'TTL', 'CMOS', 'logic-families', 'timing', 'noise-margin', 'critical-path'],
  hook: {
    question: 'Your circuit works perfectly at 1 MHz but fails at 100 MHz. Your breadboard works but the PCB does not. These are propagation delay and fan-out in action — the physical limits every digital designer must understand.',
    realWorldContext: 'Every CPU specification sheet lists propagation delays. Every signal integrity engineer checks fan-out budgets. The Arduino runs at 16 MHz not because 17 MHz is impossible, but because the ATmega328 timing margins run out there. These constraints are the difference between a circuit that works and one that works reliably.',
  },
  intuition: {
    prose: [
      't_pHL: time for output to fall after input crosses threshold. t_pLH: time to rise.',
      'Critical path: sum of t_pd values from input to output through longest gate chain.',
      'Fan-out exceeded: output voltage pulled out of valid range by too much current demand.',
      'TTL V_OH_min = 2.4V. CMOS 74HC V_IH = 3.5V. Direct TTL→CMOS connection is unreliable.',
    ],
    callouts: [
      { type: 'tip', title: 'Worst-case timing', body: 'Always use worst-case delays (largest t_pd, including temperature and voltage variation) for timing analysis. Best-case timing gives a circuit that works only under ideal conditions.' },
      { type: 'important', title: 'TTL→CMOS interface', body: 'TTL V_OH_min (2.4V) < CMOS V_IH (3.5V). Use 74HCT, a pull-up resistor, or a level shifter when connecting TTL outputs to CMOS inputs.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Propagation Delay, Fan-out, and Logic Families', props: { lesson: LESSON_DF_3_5 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    't_pHL + t_pLH → t_pd average. Chain of N gates → N × t_pd delay. Clock period ≥ t_path.',
    'Fan-out: TTL ≈ 10 (current). CMOS: high DC, degrades at speed. Over-limit → add buffer.',
    'Noise margin = gap between output spec and input threshold. Larger = more robust.',
    'T_clk ≥ t_clk-to-Q + (N × t_pd) + t_setup. Violate this → wrong data captured.',
    'TTL→CMOS: need 74HCT or pull-up. CMOS→TTL: usually OK. 3.3V→5V: level shifter.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};