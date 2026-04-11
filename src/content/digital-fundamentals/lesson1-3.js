// Digital Fundamentals · Chapter 1 · Lesson 3
// The Transistor as a Switch
// ScienceNotebook format — visuals + challenges

export const LESSON_DF_1_3 = {
  title: 'The Transistor as a Switch',
  subtitle: 'How a voltage controls a current — and why MOSFETs made modern computing possible.',
  sequential: true,

  cells: [

    // ── Section 1 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Switch: The Atom of Digital Logic

Every logic gate — AND, OR, NOT, NAND — is, at its core, a fast and reliable switch. A switch that is off represents **0**. A switch that is on represents **1**. Everything else — adders, memory, processors — is built from combinations of these switches.

Three generations of technology have defined this history:

**1. Relay (1830s)**: An electric current through a coil creates an electromagnet, physically pulling a metal contact to close a circuit. Response time: milliseconds. Size: centimetres. You can hear them click.

**2. Bipolar Junction Transistor — BJT (1947)**: A small *current* into the base terminal allows a much larger current to flow from collector to emitter. Response time: nanoseconds. Size: micrometres. Completely silent — but the base still requires current input.

**3. Metal-Oxide-Semiconductor FET — MOSFET (1959)**: A *voltage* on the gate creates an electric field that forms a conducting channel between source and drain. Zero gate current. Response time: picoseconds. Size: nanometres. Billions fit on a chip.

The revolutionary feature of the MOSFET: because the gate is separated from the channel by an insulating oxide layer, it draws essentially zero current in steady state. This is the reason a modern CPU can switch billions of transistors per second without burning up.`,
    },

    // ── Visual 1 — Three generations of the switch ────────────────────────────
    {
      type: 'js',
      instruction: `### Three generations of the electronic switch

Click the generation tabs to compare relay, BJT, and MOSFET schematics. Toggle the input HIGH/LOW to see the current path and output lamp state. Notice: the MOSFET's gate is connected by a dashed line (voltage, no current), while the relay and BJT carry real current through their control terminals.`,
      html: `<div style="padding:12px">
  <div id="tab-row" style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap"></div>
  <canvas id="cv" width="560" height="280"></canvas>
  <div style="display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap">
    <button id="toggleBtn">INPUT: LOW (0)</button>
    <span id="ctrlInfo" style="font-size:11px;color:rgba(255,255,255,0.45)"></span>
  </div>
  <div id="stageNote" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.65;padding:8px 12px;border-left:2px solid rgba(255,255,255,0.12)"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
button{padding:6px 14px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.45);font-family:monospace;font-size:11px;cursor:pointer}
button.act{color:#38bdf8;border-color:#38bdf8;background:rgba(56,189,248,0.1)}
#toggleBtn{color:#4ade80;border-color:#4ade80;background:rgba(74,222,128,0.08);padding:8px 20px;font-size:12px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var stage=2,inputHigh=false;

var STAGES=[
  {label:'Relay (1830s)',ctrl:'Current\u2009(coil)',speed:'ms',size:'cm',color:'#fb923c',
   note:'A coil becomes an electromagnet that physically pulls a contact closed. The control path carries real current. Mechanical, slow, centimetres large \u2014 but the principle is identical to a transistor: a small signal controls a large one.'},
  {label:'BJT (1947)',ctrl:'Current\u2009(base)',speed:'ns',size:'\u03bcm',color:'#a78bfa',
   note:'A small base current allows a large collector\u2013emitter current. Nanoseconds fast, micrometres small \u2014 but the base terminal still draws current, which limits packing density and increases quiescent power.'},
  {label:'MOSFET (1959)',ctrl:'Voltage only',speed:'ps',size:'nm',color:'#38bdf8',
   note:'Gate voltage creates an electric field across insulating oxide, forming a conducting channel. Zero gate current in steady state. Picoseconds fast, nanometres small. This is why billions fit on one chip.'},
];

function buildTabs(){
  var row=document.getElementById('tab-row');
  STAGES.forEach(function(s,i){
    var b=document.createElement('button');
    b.textContent=s.label;
    b.id='tab'+i;
    b.onclick=function(){setStage(i);};
    row.appendChild(b);
  });
}

function setStage(s){
  stage=s;
  for(var i=0;i<3;i++) document.getElementById('tab'+i).className=(i===s)?'act':'';
  draw();updateNote();
}

document.getElementById('toggleBtn').onclick=function(){
  inputHigh=!inputHigh;
  this.textContent='INPUT: '+(inputHigh?'HIGH (1)':'LOW (0)');
  draw();
};

function updateNote(){
  var s=STAGES[stage];
  document.getElementById('stageNote').textContent=s.note;
  document.getElementById('ctrlInfo').textContent='Control: '+s.ctrl+' \u2502 Speed: '+s.speed+' \u2502 Size: '+s.size;
}

function wire(x1,y1,x2,y2,on){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=on?'#4ade80':'#1e3a2a';
  ctx.lineWidth=on?2.5:1.5;ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var cx=W/2,vcc=52,gnd=H-52;
  var col=STAGES[stage].color;

  // VDD
  ctx.fillStyle='#f87171';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('VDD',cx,vcc-12);
  ctx.strokeStyle='#f87171';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-24,vcc);ctx.lineTo(cx+24,vcc);ctx.stroke();

  // GND
  ctx.fillStyle='#64748b';ctx.font='bold 11px monospace';
  ctx.fillText('GND',cx,gnd+22);
  ctx.strokeStyle='#64748b';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-24,gnd);ctx.lineTo(cx+24,gnd);ctx.stroke();

  var mY=H/2;

  if(stage===0){
    // Relay
    ctx.strokeStyle='#475569';ctx.lineWidth=1.5;
    ctx.strokeRect(cx-64,mY-18,44,36);
    ctx.fillStyle='#64748b';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('coil',cx-42,mY+4);
    var armY=inputHigh?mY-12:mY+12;
    ctx.beginPath();ctx.moveTo(cx-18,mY);ctx.lineTo(cx+4,armY);
    ctx.strokeStyle=inputHigh?'#4ade80':'#475569';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(cx+6,mY-14,5,0,Math.PI*2);
    ctx.fillStyle='#475569';ctx.fill();
    wire(cx,vcc,cx,mY-14,inputHigh);
    wire(cx,armY,cx,gnd,inputHigh);
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(36,mY);ctx.lineTo(cx-64,mY);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#38bdf8';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('control current',6,mY+4);

  } else if(stage===1){
    // BJT
    ctx.beginPath();ctx.arc(cx,mY,30,0,Math.PI*2);
    ctx.fillStyle='#1e293b';ctx.fill();
    ctx.strokeStyle='#475569';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('NPN',cx,mY+4);
    wire(cx,vcc,cx,mY-30,inputHigh);
    wire(cx,mY+30,cx,gnd,inputHigh);
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(36,mY);ctx.lineTo(cx-30,mY);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#38bdf8';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('base current',6,mY-5);
    ctx.fillText('controls C\u2013E',6,mY+9);

  } else {
    // MOSFET
    var mw=40,mh=54;
    ctx.fillStyle='#1e293b';
    ctx.fillRect(cx-mw/2,mY-mh/2,mw,mh);
    ctx.strokeStyle='#475569';ctx.lineWidth=1.5;
    ctx.strokeRect(cx-mw/2,mY-mh/2,mw,mh);
    // Gate oxide gap
    ctx.fillStyle='#0a0f1e';ctx.fillRect(cx-mw/2-4,mY-12,4,24);
    // Gate plate
    ctx.fillStyle='#38bdf8';ctx.fillRect(cx-mw/2-15,mY-12,11,24);
    // Channel (only when on)
    if(inputHigh){
      ctx.fillStyle='rgba(74,222,128,0.25)';
      ctx.fillRect(cx-8,mY-mh/2+8,16,mh-16);
    }
    wire(cx,vcc,cx,mY-mh/2,inputHigh);
    wire(cx,mY+mh/2,cx,gnd,inputHigh);
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(36,mY);ctx.lineTo(cx-mw/2-15,mY);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#38bdf8';ctx.font='10px monospace';ctx.textAlign='left';
    ctx.fillText('gate voltage',6,mY-6);
    ctx.fillText('(zero current)',6,mY+8);
    ctx.fillStyle='#f87171';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('D',cx,mY-mh/2-7);
    ctx.fillStyle='#64748b';ctx.fillText('S',cx,mY+mh/2+14);
    ctx.fillStyle='#38bdf8';ctx.textAlign='right';
    ctx.fillText('G',cx-mw/2-17,mY+4);
    ctx.fillStyle=inputHigh?'#4ade80':'#475569';
    ctx.font='bold 8px monospace';ctx.textAlign='center';
    ctx.fillText(inputHigh?'CHANNEL':'BLOCKED',cx,mY+3);
  }

  // Output lamp
  var lx=W-56,ly=(vcc+gnd)/2;
  ctx.beginPath();ctx.arc(lx,ly,20,0,Math.PI*2);
  ctx.fillStyle=inputHigh?'#fbbf24':'#1a1a1a';ctx.fill();
  ctx.strokeStyle='#fbbf24';ctx.lineWidth=inputHigh?2.5:1;ctx.stroke();
  ctx.fillStyle=inputHigh?'#1c1000':'#64748b';
  ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(inputHigh?'ON':'OFF',lx,ly);
  ctx.textBaseline='alphabetic';
  // Connection to circuit
  ctx.strokeStyle=inputHigh?'#4ade80':'#1e3a2a';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(cx+22,H/2);ctx.lineTo(lx-20,ly);ctx.stroke();
  ctx.setLineDash([]);
}

buildTabs();
setStage(2);`,
      outputHeight: 400,
    },

    // ── Section 2 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Inside the MOSFET: Gate Voltage and the Channel

The N-channel MOSFET (NMOS) has four terminals:

- **Gate (G)**: The control terminal. Connected to a metal plate, separated from the silicon by a thin insulating oxide layer.
- **Drain (D)**: The positive terminal — connected to VDD through a load.
- **Source (S)**: The return terminal — connected to ground.
- **Bulk (B)**: The substrate (usually ground in NMOS).

The silicon body between source and drain is a **P-type** semiconductor — it doesn't normally conduct. When the gate voltage (V_GS) rises above the **threshold voltage** (V_th, typically 0.5–2 V), the electric field from the gate repels holes and attracts electrons, forming a thin **inversion layer** — an N-type channel — directly beneath the gate oxide.

Once the channel forms, current can flow from drain to source. Below V_th: no channel, no current, transistor off. Above V_th: channel exists, current flows, transistor on.

The oxide thickness matters critically. Modern processes use gate oxides only a few atoms thick. At 2 nm oxide thickness, quantum tunnelling allows electrons to leak through even when the transistor is "off" — one of the fundamental limits of CMOS scaling.`,
    },

    // ── Visual 2 — NMOS cross-section ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `### NMOS cross-section: the channel forms

Drag the slider to change V_GS. Watch the inversion channel form beneath the gate oxide when V_GS exceeds the threshold voltage (V_th = 2V). The colour intensity of the channel indicates how strongly it conducts.`,
      html: `<div style="padding:12px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap">
    <span style="font-size:12px;color:rgba(255,255,255,0.6);min-width:100px">V_GS = <strong id="vgsVal">0.0</strong> V</span>
    <input type="range" id="vgsSlider" min="0" max="50" value="0" style="flex:1;min-width:140px">
    <span id="vgsState" style="font-size:12px;font-weight:600;min-width:90px;text-align:right"></span>
  </div>
  <canvas id="cv" width="560" height="300"></canvas>
  <div id="vgsDesc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.65;padding:8px 12px;border-left:2px solid rgba(255,255,255,0.12)"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
input[type=range]{accent-color:#38bdf8}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var VTH=2.0,vgs=0;

document.getElementById('vgsSlider').oninput=function(){
  vgs=this.value/10;
  document.getElementById('vgsVal').textContent=vgs.toFixed(1);
  draw();updateDesc();
};

function updateDesc(){
  var on=vgs>=VTH;
  var str=Math.max(0,Math.min(1,(vgs-VTH)/(5-VTH)));
  document.getElementById('vgsState').textContent=on?'CHANNEL ON':'CHANNEL OFF';
  document.getElementById('vgsState').style.color=on?'#4ade80':'#ef4444';
  document.getElementById('vgsDesc').textContent=on
    ?'V_GS = '+vgs.toFixed(1)+'V \u2265 V_th ('+VTH+'V). The electric field has inverted the P-type silicon beneath the gate, forming an N-type channel. Current flows from drain to source. Channel strength \u2248 '+Math.round(str*100)+'% of maximum.'
    :'V_GS = '+vgs.toFixed(1)+'V < V_th ('+VTH+'V). No inversion layer. The P-type silicon between drain and source blocks current. MOSFET is OFF.';
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var padX=70,subTop=80,subH=170,crossW=W-padX*2;
  var oxH=14,oxTop=subTop-oxH;
  var gateH=20,gateTop=oxTop-gateH;
  var nW=crossW*0.22;

  var on=vgs>=VTH;
  var str=Math.max(0,Math.min(1,(vgs-VTH)/(5-VTH)));

  // P-type substrate
  ctx.fillStyle='rgba(148,163,184,0.15)';
  ctx.fillRect(padX,subTop,crossW,subH);
  ctx.strokeStyle='rgba(148,163,184,0.3)';ctx.lineWidth=1;
  ctx.strokeRect(padX,subTop,crossW,subH);
  ctx.fillStyle='rgba(148,163,184,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('P-type silicon substrate',W/2,subTop+subH-14);

  // N+ source and drain regions
  [[padX,nW],[padX+crossW-nW,nW]].forEach(function(pair){
    ctx.fillStyle='rgba(56,189,248,0.3)';
    ctx.fillRect(pair[0],subTop,pair[1],40);
    ctx.strokeStyle='rgba(56,189,248,0.6)';ctx.lineWidth=1;
    ctx.strokeRect(pair[0],subTop,pair[1],40);
  });
  ctx.fillStyle='#38bdf8';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('N+\\nSource',padX+nW/2,subTop+20);
  ctx.fillText('N+\\nDrain',padX+crossW-nW/2,subTop+20);

  // Inversion channel (if on)
  if(on){
    var chAlpha=0.15+str*0.35;
    ctx.fillStyle='rgba(74,222,128,'+chAlpha+')';
    ctx.fillRect(padX+nW,subTop,crossW-nW*2,16);
    ctx.strokeStyle='rgba(74,222,128,'+(chAlpha+0.2)+')';ctx.lineWidth=1;
    ctx.strokeRect(padX+nW,subTop,crossW-nW*2,16);
    ctx.fillStyle='rgba(74,222,128,0.85)';ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText('N-channel (inversion layer)',W/2,subTop+11);
  } else {
    ctx.fillStyle='rgba(148,163,184,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('No channel',W/2,subTop+11);
  }

  // Gate oxide
  ctx.fillStyle='rgba(251,191,36,0.15)';
  ctx.fillRect(padX+nW,oxTop,crossW-nW*2,oxH);
  ctx.strokeStyle='rgba(251,191,36,0.5)';ctx.lineWidth=1;
  ctx.strokeRect(padX+nW,oxTop,crossW-nW*2,oxH);
  ctx.fillStyle='rgba(251,191,36,0.7)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('SiO\u2082 oxide (~5nm)',W/2,oxTop+oxH/2+3);

  // Gate metal
  var gateCol=on?'#38bdf8':'#64748b';
  ctx.fillStyle=gateCol+'44';
  ctx.fillRect(padX+nW,gateTop,crossW-nW*2,gateH);
  ctx.strokeStyle=gateCol;ctx.lineWidth=1.5;
  ctx.strokeRect(padX+nW,gateTop,crossW-nW*2,gateH);
  ctx.fillStyle=gateCol;ctx.font='bold 10px monospace';ctx.textAlign='center';
  ctx.fillText('Gate metal  V_GS = '+vgs.toFixed(1)+'V',W/2,gateTop+gateH/2+4);

  // Terminal wires
  // Source
  ctx.strokeStyle='#64748b';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(padX+nW/2,subTop-2);ctx.lineTo(padX+nW/2,subTop-28);ctx.stroke();
  ctx.fillStyle='#64748b';ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('S',padX+nW/2,subTop-32);

  // Drain
  var drainColor=on?'#f87171':'#64748b';
  ctx.strokeStyle=drainColor;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(padX+crossW-nW/2,subTop-2);ctx.lineTo(padX+crossW-nW/2,subTop-28);ctx.stroke();
  ctx.fillStyle=drainColor;ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('D',padX+crossW-nW/2,subTop-32);

  // Gate wire
  ctx.strokeStyle=gateCol;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(padX+nW+(crossW-nW*2)/2,gateTop);ctx.lineTo(padX+nW+(crossW-nW*2)/2,gateTop-28);ctx.stroke();
  ctx.fillStyle=gateCol;ctx.font='bold 11px monospace';ctx.textAlign='center';
  ctx.fillText('G',padX+nW+(crossW-nW*2)/2,gateTop-32);

  // Current arrow if on
  if(on){
    var arrowY=subTop+8;
    var x1=padX+nW+6,x2=padX+crossW-nW-6;
    ctx.strokeStyle='#4ade80';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x2,arrowY);ctx.lineTo(x1+10,arrowY);ctx.stroke();
    ctx.fillStyle='#4ade80';
    ctx.beginPath();ctx.moveTo(x1+10,arrowY-5);ctx.lineTo(x1,arrowY);ctx.lineTo(x1+10,arrowY+5);ctx.fill();
    ctx.fillStyle='#4ade80';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText('I_DS (current flows)',W/2,subTop+H-222);
  }

  // V_th marker on a mini graph at bottom
  var gx=padX+10,gy=H-30,gw=crossW-20,gh=24;
  ctx.fillStyle='rgba(255,255,255,0.06)';ctx.fillRect(gx,gy,gw,gh);
  var thX=gx+gw*(VTH/5);
  ctx.strokeStyle='#ef4444';ctx.lineWidth=1;ctx.setLineDash([3,2]);
  ctx.beginPath();ctx.moveTo(thX,gy);ctx.lineTo(thX,gy+gh);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#ef4444';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('V_th='+VTH+'V',thX,gy-4);
  var curX=gx+gw*(vgs/5);
  ctx.fillStyle=on?'#4ade80':'#38bdf8';
  ctx.beginPath();ctx.arc(curX,gy+gh/2,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('0V',gx+2,gy+gh/2+4);
  ctx.textAlign='right';ctx.fillText('5V',gx+gw-2,gy+gh/2+4);
}

draw();updateDesc();`,
      outputHeight: 380,
    },

    // ── Challenge 1 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Why can MOSFETs be packed far more densely than BJT transistors on a chip?`,
      options: [
        { label: 'A', text: 'MOSFETs are made of different materials that allow them to be physically smaller' },
        { label: 'B', text: 'The MOSFET gate draws essentially zero steady-state current, eliminating the power dissipation and heat that would prevent dense packing of BJTs' },
        { label: 'C', text: 'MOSFETs switch faster than BJTs, so fewer are needed for the same computation' },
        { label: 'D', text: 'BJTs require connection to the power supply, but MOSFETs do not' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! A BJT base draws current in steady state — if you pack millions of them, the total quiescent power becomes enormous and the chip burns up. The MOSFET gate is insulated by oxide, drawing near-zero current. This is the key to VLSI: billions of switches with manageable total power.',
      failMessage: 'While MOSFETs can be made at nanometre scales, the fundamental reason for superior density is power. A BJT base draws current even when the transistor is just "held on". Scale to billions and the total current is unmanageable. The MOSFET gate draws essentially zero current — the oxide layer acts as a capacitor, not a resistor.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 3 ─────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### CMOS: Building Logic with Complementary Pairs

Real digital circuits don't use a single MOSFET type. They use **CMOS** — Complementary Metal-Oxide-Semiconductor — which combines an N-type MOSFET (NMOS) with a P-type MOSFET (PMOS) to build each gate.

The key difference: an NMOS transistor turns **on** when V_GS is high (gate voltage above threshold). A PMOS transistor turns **on** when V_GS is **low** (gate voltage below threshold). They are complementary: when one is on, the other is off.

The simplest CMOS gate is the **NOT gate** (inverter). Construction:
- PMOS between VDD and output
- NMOS between output and GND
- Both gates connected to the same input

**When input = 0 (LOW)**:
- PMOS: V_GS = 0 − V_DD = −V_DD → below threshold → **on** → output connected to VDD → output = HIGH (1)
- NMOS: V_GS = 0 → below threshold → **off**

**When input = 1 (HIGH)**:
- PMOS: V_GS = V_DD − V_DD = 0 → above threshold (for PMOS) → **off**
- NMOS: V_GS = V_DD → above threshold → **on** → output connected to GND → output = LOW (0)

The complementary nature means that in either steady state, one transistor is always off. This means **zero steady-state current** flows from VDD to GND — CMOS gates only consume power during transitions. This is why CMOS is the universal technology for digital logic.`,
    },

    // ── Visual 3 — CMOS NOT gate ──────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### CMOS NOT gate (inverter)

Click the input button to toggle between HIGH and LOW. Watch which transistor conducts and which is cut off. The output is always the complement of the input — that's the NOT function. The green path shows where current flows; the gap shows where it is blocked.`,
      html: `<div style="padding:16px">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap">
    <button id="inputBtn" style="font-size:13px;padding:8px 24px">INPUT: 0 (LOW)</button>
    <span id="outputLabel" style="font-size:14px;font-weight:600"></span>
  </div>
  <canvas id="cv" width="560" height="320"></canvas>
  <div id="cmosdesc" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.65;padding:8px 12px;border-left:2px solid rgba(255,255,255,0.12)"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace;color:#e2e8f0}
canvas{border-radius:8px;display:block;width:100%}
button{padding:8px 24px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#e2e8f0;font-family:monospace;font-size:13px;cursor:pointer}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var inputHigh=false;

document.getElementById('inputBtn').onclick=function(){
  inputHigh=!inputHigh;
  this.textContent='INPUT: '+(inputHigh?'1 (HIGH)':'0 (LOW)');
  draw();updateDesc();
};

function updateDesc(){
  var out=!inputHigh;
  document.getElementById('outputLabel').textContent='OUTPUT: '+(out?'1 (HIGH)':'0 (LOW)');
  document.getElementById('outputLabel').style.color=out?'#4ade80':'#ef4444';
  document.getElementById('cmosdesc').textContent=inputHigh
    ?'Input HIGH: PMOS gate-source voltage \u2248 0V, far from PMOS threshold \u2192 PMOS OFF (no path from VDD). NMOS gate voltage = V_DD, above threshold \u2192 NMOS ON. Output pulls to GND \u2192 OUTPUT = 0. No static current: PMOS is blocking.'
    :'Input LOW: PMOS gate-source voltage = \u2212V_DD, below PMOS threshold \u2192 PMOS ON (path from VDD to output). NMOS gate voltage = 0, below NMOS threshold \u2192 NMOS OFF. Output pulls to VDD \u2192 OUTPUT = 1. No static current: NMOS is blocking.';
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var cx=W/2,vcc=40,gnd=H-40;
  var midY=H/2;
  var pmosY=midY-70,nmosY=midY+70;
  var tw=36,th=48;

  var pOn=!inputHigh,nOn=inputHigh;
  var outHigh=pOn;

  // VDD
  ctx.fillStyle='#f87171';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('VDD',cx,vcc-10);
  ctx.strokeStyle='#f87171';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-26,vcc);ctx.lineTo(cx+26,vcc);ctx.stroke();

  // GND
  ctx.fillStyle='#64748b';ctx.font='bold 12px monospace';
  ctx.fillText('GND',cx,gnd+22);
  ctx.strokeStyle='#64748b';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-26,gnd);ctx.lineTo(cx+26,gnd);ctx.stroke();

  function drawMOS(cx2,cy,type,on){
    var fillC=on?(type==='P'?'rgba(167,139,250,0.25)':'rgba(74,222,128,0.2)'):'rgba(30,41,59,0.8)';
    var strokeC=on?(type==='P'?'#a78bfa':'#4ade80'):'#475569';
    ctx.fillStyle=fillC;
    ctx.fillRect(cx2-tw/2,cy-th/2,tw,th);
    ctx.strokeStyle=strokeC;ctx.lineWidth=1.5;
    ctx.strokeRect(cx2-tw/2,cy-th/2,tw,th);
    ctx.fillStyle=strokeC;ctx.font='bold 10px monospace';ctx.textAlign='center';
    ctx.fillText(type+'-MOS',cx2,cy+4);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='9px monospace';
    ctx.fillText(on?'ON':'OFF',cx2,cy+16);
    // Gate wire (dashed from input)
    ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(cx2-tw/2-4,cy);ctx.lineTo(cx2-tw/2-20,cy);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#38bdf8';ctx.font='9px monospace';ctx.textAlign='right';
    ctx.fillText('G',cx2-tw/2-22,cy+4);
  }

  // PMOS
  drawMOS(cx,pmosY,'P',pOn);
  // NMOS
  drawMOS(cx,nmosY,'N',nOn);

  // Wires
  function seg(x1,y1,x2,y2,on2){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
    ctx.strokeStyle=on2?'#4ade80':'#1e3a2a';
    ctx.lineWidth=on2?2.5:1.5;ctx.stroke();
  }

  seg(cx,vcc,cx,pmosY-th/2,pOn);
  seg(cx,pmosY+th/2,cx,midY,pOn||!nOn);
  seg(cx,midY,cx,nmosY-th/2,nOn||!pOn);
  seg(cx,nmosY+th/2,cx,gnd,nOn);

  // Output horizontal
  var outX=cx+80;
  ctx.beginPath();ctx.moveTo(cx,midY);ctx.lineTo(outX,midY);
  ctx.strokeStyle=outHigh?'#4ade80':'#ef4444';ctx.lineWidth=2.5;ctx.stroke();

  // Output circle
  ctx.beginPath();ctx.arc(outX+10,midY,14,0,Math.PI*2);
  ctx.fillStyle=outHigh?'rgba(74,222,128,0.2)':'rgba(239,68,68,0.2)';ctx.fill();
  ctx.strokeStyle=outHigh?'#4ade80':'#ef4444';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=outHigh?'#4ade80':'#ef4444';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(outHigh?'1':'0',outX+10,midY);
  ctx.textBaseline='alphabetic';

  // Input label
  var inX=cx-120;
  ctx.beginPath();ctx.arc(inX,midY,14,0,Math.PI*2);
  ctx.fillStyle=inputHigh?'rgba(56,189,248,0.2)':'rgba(100,116,139,0.2)';ctx.fill();
  ctx.strokeStyle=inputHigh?'#38bdf8':'#64748b';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=inputHigh?'#38bdf8':'#64748b';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(inputHigh?'1':'0',inX,midY);
  ctx.textBaseline='alphabetic';

  // Input wires to both gates
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(inX+14,midY);ctx.lineTo(cx-tw/2-20,pmosY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(inX+14,midY);ctx.lineTo(cx-tw/2-20,nmosY);ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Input A',inX,midY+28);
  ctx.fillText('Output Y = \u00acA',outX+10,midY+28);
  ctx.fillStyle='rgba(255,255,255,0.25)';
  ctx.fillText('CMOS NOT gate (inverter)',W/2,H-10);
}

draw();updateDesc();`,
      outputHeight: 380,
    },

    // ── Challenge 2 ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `In a CMOS NOT gate, when the input is LOW (0), which transistor connects the output to VDD?`,
      options: [
        { label: 'A', text: 'The NMOS transistor, because its gate voltage is 0 which turns it on' },
        { label: 'B', text: 'Both transistors turn on simultaneously, so current flows both ways' },
        { label: 'C', text: 'The PMOS transistor, because a LOW gate voltage is below the PMOS threshold, turning it on' },
        { label: 'D', text: 'Neither — the output floats when the input is LOW' },
      ],
      check: (label) => label === 'C',
      successMessage: 'Correct! PMOS turns ON when its gate voltage is LOW (below threshold). With input = 0, V_GS of the PMOS is −VDD, well below threshold → PMOS conducts → output is pulled to VDD → output = 1. Simultaneously, NMOS is off (its V_GS = 0 < threshold). No static current flows.',
      failMessage: 'Remember: PMOS and NMOS are complementary opposites. NMOS turns on when gate is HIGH. PMOS turns on when gate is LOW (V_GS must be below its threshold, which is negative). With input = 0, the PMOS gate is at 0V and its source at VDD, so V_GS = 0 − VDD = −VDD — strongly on. NMOS with V_GS = 0 is off.',
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 — Gates from Transistors ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Transistors → Logic Gates

A single transistor is just a switch. Combine two or more and you get a **logic gate** — a circuit whose output is determined entirely by its inputs according to a truth table.

**CMOS NOT (inverter)**: one PMOS (pull-up) + one NMOS (pull-down). When input = 0, PMOS on → output = 1. When input = 1, NMOS on → output = 0. No path from VDD to GND can exist simultaneously → zero static current.

**CMOS NAND**: two PMOS in parallel (pull-up) + two NMOS in series (pull-down). Output is 0 only when *both* inputs are 1 (both pull-downs on, both pull-ups off). NAND is universal — any gate can be built from NAND alone.

**CMOS NOR**: two PMOS in series (pull-up) + two NMOS in parallel (pull-down). Output is 1 only when *both* inputs are 0. NOR is also universal.`,
    },

    // ── Visual 4 — Gate truth-table explorer ─────────────────────────────────
    {
      type: 'js',
      instruction: `Select a gate, then toggle the inputs to verify every row of the truth table. The circuit description updates to link the gate behaviour back to the transistor network.`,
      html: `<div id="root" style="padding:12px;font-family:sans-serif"></div>`,
      css: `body{margin:0;color:var(--color-text-primary,#1e293b)}
.btn{padding:7px 12px;border-radius:8px;font-size:12px;cursor:pointer;border:0.5px solid var(--color-border-secondary,#e2e8f0);background:transparent;color:var(--color-text-secondary,#64748b)}
.btn.active{background:#0891b2;color:#fff;border-color:#0891b2}
.tbl td,.tbl th{padding:8px 12px;text-align:center;font-size:13px;border:0.5px solid var(--color-border-tertiary,#e2e8f0)}
.tbl th{background:var(--color-background-secondary,#f8fafc);font-weight:600;font-size:11px;color:#64748b}
.card{background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px 14px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);margin-top:8px}
.hi{color:#059669;font-weight:700}.lo{color:#ef4444;font-weight:700}`,
      startCode: `var gate='NOT',a=0,b=0;
var GATES={
  NOT:{symbol:'NOT (¬A)',inputs:1,logic:function(a){return 1-a;},
    transistors:'1 PMOS (pull-up) + 1 NMOS (pull-down). Complementary pair — exactly one is on for any input, so output is always the inverse.',
    truth:[[0,1],[1,0]],headers:['A','Output']},
  NAND:{symbol:'NAND (¬(A·B))',inputs:2,logic:function(a,b){return (a&b)^1;},
    transistors:'2 PMOS in parallel (pull-up) + 2 NMOS in series (pull-down). Series pull-down requires BOTH inputs = 1 to pull output low.',
    truth:[[0,0,1],[0,1,1],[1,0,1],[1,1,0]],headers:['A','B','Output']},
  NOR:{symbol:'NOR (¬(A+B))',inputs:2,logic:function(a,b){return (a|b)^1;},
    transistors:'2 PMOS in series (pull-up) + 2 NMOS in parallel (pull-down). Series pull-up requires BOTH inputs = 0 to pull output high.',
    truth:[[0,0,1],[0,1,0],[1,0,0],[1,1,0]],headers:['A','B','Output']},
};
var root=document.getElementById('root');
function render(){
  var g=GATES[gate];
  var out=g.inputs===1?g.logic(a):g.logic(a,b);
  var rows=g.truth.map(function(r){
    var highlight=g.inputs===1?(r[0]===a):(r[0]===a&&r[1]===b);
    return '<tr'+(highlight?' style="background:rgba(8,145,178,0.08)"':'')+'>'+
      r.map(function(v,i){return '<td class="'+(v?'hi':'lo')+'">'+v+'</td>';}).join('')+'</tr>';
  }).join('');
  root.innerHTML=
    '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">'+
      Object.keys(GATES).map(function(k){return '<button class="btn'+(k===gate?' active':'')+'" onclick="gate=\\''+k+'\\';render()">'+k+'</button>';}).join('')+
    '</div>'+
    '<div style="text-align:center;font-size:22px;font-weight:700;margin-bottom:10px;letter-spacing:1px;color:#0891b2">'+g.symbol+'</div>'+
    (g.inputs===2?
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
        '<div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Input A</div>'+
        '<div style="display:flex;gap:6px">'+
          '<button class="btn'+(a===0?' active':'')+'" onclick="a=0;render()">0</button>'+
          '<button class="btn'+(a===1?' active':'')+'" onclick="a=1;render()">1</button>'+
        '</div></div>'+
        '<div><div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Input B</div>'+
        '<div style="display:flex;gap:6px">'+
          '<button class="btn'+(b===0?' active':'')+'" onclick="b=0;render()">0</button>'+
          '<button class="btn'+(b===1?' active':'')+'" onclick="b=1;render()">1</button>'+
        '</div></div>'+
      '</div>'
    :
      '<div style="margin-bottom:12px"><div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Input A</div>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn'+(a===0?' active':'')+'" onclick="a=0;render()">0</button>'+
        '<button class="btn'+(a===1?' active':'')+'" onclick="a=1;render()">1</button>'+
      '</div></div>'
    )+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'+
      '<span style="font-size:13px;color:#64748b">Output:</span>'+
      '<span style="font-size:28px;font-weight:700;color:'+(out?'#059669':'#ef4444')+'">'+out+'</span>'+
    '</div>'+
    '<table class="tbl" style="border-collapse:collapse;width:100%;margin-bottom:8px">'+
      '<thead><tr>'+g.headers.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead>'+
      '<tbody>'+rows+'</tbody>'+
    '</table>'+
    '<div class="card">'+
      '<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Transistor network</div>'+
      '<div style="font-size:13px;line-height:1.7;color:var(--color-text-secondary,#64748b)">'+g.transistors+'</div>'+
    '</div>';
}
render();`,
      outputHeight: 480,
    },

    // ── Key Terms ─────────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Key Terms: Transistors & Switches`,
      html: `<div style="padding:12px;font-family:sans-serif">
  <input id="q" placeholder="Filter terms…" oninput="filter()" style="width:100%;margin-bottom:10px;padding:8px 12px;border-radius:8px;border:0.5px solid var(--color-border-secondary,#e2e8f0);background:var(--color-background-primary,#fff);color:var(--color-text-primary,#1e293b);font-size:13px;box-sizing:border-box">
  <div id="list"></div>
</div>`,
      css: `body{margin:0}.card{background:var(--color-background-secondary,#f8fafc);border-radius:8px;padding:10px 14px;border:0.5px solid var(--color-border-tertiary,#e2e8f0);margin-bottom:6px}`,
      startCode: `var TERMS=[
  {t:'Transistor',d:'A semiconductor switch controlled by an electrical signal. The fundamental building block of all digital logic circuits.'},
  {t:'MOSFET',d:'Metal-Oxide-Semiconductor Field-Effect Transistor. Uses voltage on the Gate to control current flow between Drain and Source.'},
  {t:'NMOS',d:'N-channel MOSFET. Turns ON (conducts) when gate voltage is HIGH. Used in the pull-down network of CMOS gates.'},
  {t:'PMOS',d:'P-channel MOSFET. Turns ON (conducts) when gate voltage is LOW. Used in the pull-up network of CMOS gates.'},
  {t:'Gate (transistor terminal)',d:'The control terminal of a MOSFET. Voltage applied here determines whether the channel between Drain and Source forms.'},
  {t:'Drain',d:'The terminal current flows out of (NMOS) or into (PMOS) when the transistor is on.'},
  {t:'Source',d:'The terminal current flows into (NMOS) or out of (PMOS). In NMOS it connects toward GND; in PMOS toward VDD.'},
  {t:'Channel',d:'The conductive path between Drain and Source that forms when sufficient gate voltage attracts charge carriers to the semiconductor surface.'},
  {t:'Inversion layer',d:'The thin layer of charge carriers induced at the semiconductor surface by the gate field. Its formation is what turns the MOSFET on.'},
  {t:'Threshold voltage',d:'The minimum gate-to-source voltage required to form the inversion layer and turn the MOSFET on.'},
  {t:'CMOS',d:'Complementary MOS. Uses paired PMOS and NMOS transistors. Key advantage: one transistor is always off, so no static current path from VDD to GND.'},
  {t:'CMOS inverter',d:'The simplest CMOS gate: one PMOS (pull-up) + one NMOS (pull-down). Output is always the complement of input.'},
  {t:'Pull-up network',d:'The PMOS portion of a CMOS gate. Connects output to VDD (logic 1) when the required input combination is LOW.'},
  {t:'Pull-down network',d:'The NMOS portion of a CMOS gate. Connects output to GND (logic 0) when the required input combination is HIGH.'},
  {t:'Static power',d:'Power consumed when inputs are stable. CMOS nearly eliminates static power because complementary networks ensure only one path is active at a time.'},
  {t:'Dynamic power',d:'Power consumed during transitions as capacitances charge and discharge. Main source of power use in modern CMOS: P ∝ C·V²·f.'},
  {t:'Universal gate',d:'A gate from which any Boolean function can be built. NAND and NOR are both universal; NOT, AND, and OR together are also universal.'},
  {t:'BJT',d:'Bipolar Junction Transistor. Older transistor type controlled by base current rather than voltage. Used in TTL logic but mostly replaced by CMOS.'},
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
      instruction: `### The Switch as Foundation

You now understand the physical basis of all digital logic:

- Every logic gate is a fast, precisely controlled switch.
- MOSFETs dominate because they are voltage-controlled (zero gate current), enabling billions to coexist on a chip.
- CMOS uses complementary P-type and N-type pairs to ensure that exactly one transistor is always off in every steady state — eliminating static power consumption.
- The NOT gate proves the pattern: input LOW → PMOS on, output HIGH. Input HIGH → NMOS on, output LOW. The transistors take turns; they never both conduct together.

In the next lesson, you will stop thinking about transistors entirely. Once you know a CMOS gate works reliably, you seal that knowledge inside an abstraction — a logic symbol — and reason at the level of Boolean functions. This is how engineers build processors with tens of billions of gates: one abstraction at a time.`,
    },
  ],
};

export default {
  id: 'df-1-3-transistor-switch',
  slug: 'transistor-as-switch',
  chapter: 'df.1',
  order: 3,
  title: 'The Transistor as a Switch',
  subtitle: 'How a voltage controls a current — and why MOSFETs made modern computing possible.',
  tags: ['digital', 'transistor', 'MOSFET', 'CMOS', 'BJT', 'relay', 'logic-gate', 'semiconductor', 'threshold-voltage'],
  hook: {
    question: 'What physical device implements a logic 0 and logic 1 — and why can billions of them fit on a chip the size of a fingernail?',
    realWorldContext: 'Every computation, every pixel on this screen, every bit stored in memory relies on a MOSFET switching faster than a nanosecond. Understanding the MOSFET explains why modern chips are possible.',
  },
  intuition: {
    prose: [
      'A logic gate is an electronic switch. OFF = 0. ON = 1.',
      'MOSFETs are voltage-controlled: the gate draws zero current, enabling extreme density.',
      'CMOS = complementary NMOS + PMOS: in steady state, one is always off, so no static power is dissipated.',
      'Channel forms only when V_GS exceeds threshold voltage V_th.',
    ],
    callouts: [
      { type: 'important', title: 'Why MOSFET wins', body: 'The gate oxide insulates the gate from the channel. Zero gate current means zero standby power per transistor. Scale to 20 billion transistors and this property becomes non-negotiable.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Transistor as a Switch', props: { lesson: LESSON_DF_1_3 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Relay → BJT → MOSFET: each generation is faster, smaller, and consumes less control power.',
    'NMOS on when V_GS > V_th. PMOS on when V_GS < V_th (complementary).',
    'CMOS NOT gate: PMOS pulls output to VDD when input LOW; NMOS pulls to GND when input HIGH.',
    'No transistor = no gate = no logic. The MOSFET is the atom of digital computation.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
