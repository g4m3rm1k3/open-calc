// Chemistry · Chapter 3 · Lesson 0
// States of Matter

const LESSON_CHEM_3_0 = {
  title: 'States of Matter',
  subtitle: 'Solid, liquid, gas — the same molecules, completely different behaviour.',
  sequential: true,

  cells: [

    // ── Section 1 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Same Stuff, Three Different Worlds

Take water. At −10°C it is a rigid, crystalline solid. At 20°C it is a flowing liquid. At 110°C it is an invisible gas. The water molecules — H₂O — are identical in all three cases. The covalent bonds inside each molecule are unchanged. The molecular geometry is unchanged.

What changes is the **relationship between molecules**: how close they are, how they are arranged, and how much freedom they have to move.

This is the central insight of the molecular picture of matter: the **state** of a substance is not a property of the molecules themselves but of the collective behaviour of enormous numbers of molecules interacting with each other. The same molecules can produce a hard crystal, a liquid that flows around obstacles, or a gas that expands to fill any container — depending entirely on how much energy they have relative to the forces holding them together.

That competition — **thermal energy vs. intermolecular forces** — is the key to understanding all three states, every phase transition between them, and why different substances exist as solids, liquids, or gases at room temperature.

Before we look at each state in detail, let's establish the molecular picture of temperature itself, because without it the transitions between states are impossible to understand.`,
    },

    // ── Section 2 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Temperature Is Molecular Motion

In everyday language, temperature measures "how hot" something is. At the molecular level, it means something precise: **temperature is a measure of the average kinetic energy of the particles in a substance.**

Kinetic energy is energy of motion — ½mv². Faster-moving molecules have higher kinetic energy. Higher average kinetic energy means higher temperature.

But "average" is the crucial word. At any given temperature, molecules don't all move at the same speed. They have a distribution of speeds — some moving slowly, some quickly, with a characteristic spread described by the **Maxwell-Boltzmann distribution**. At higher temperatures, the entire distribution shifts toward higher speeds: the peak moves right, and the tail extends further.

This distribution has a critical consequence for phase transitions. To evaporate from a liquid, a molecule needs enough kinetic energy to escape the attractive forces holding it in the liquid. Most molecules don't have enough — but the fast-moving tail of the distribution does. Even at temperatures well below the boiling point, some molecules escape from the surface. This is evaporation. The molecules that escape are the fastest ones, which is why evaporation cools a liquid — the remaining molecules have lower average kinetic energy.

At the boiling point, enough molecules have enough energy that the liquid-to-gas transition happens throughout the bulk of the liquid (you see bubbles forming everywhere, not just at the surface). Below the boiling point, evaporation happens only at the surface.

This molecular picture makes phase transitions feel inevitable rather than arbitrary.`,
    },

    // ── Visual 1 — Maxwell-Boltzmann distribution ──────────────────────────────
    {
      type: 'js',
      instruction: `### The Maxwell-Boltzmann speed distribution

The curve below shows the distribution of molecular speeds at different temperatures. Drag the temperature slider to see how the distribution changes. Notice: at higher temperatures the peak shifts right (faster average) and the curve broadens. The shaded tail beyond the dashed line represents molecules with enough energy to escape the liquid — even at low temperatures, some molecules are in that tail.`,
      html: `<div style="padding:14px 14px 0 14px;background:#0a0f1e">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
    <span style="color:rgba(255,255,255,0.6);font-size:13px;font-family:monospace;white-space:nowrap">Temperature: <span id="temp-label" style="color:#38bdf8;font-weight:700;font-size:16px">300</span> K</span>
    <input type="range" id="temp-slider" min="100" max="800" value="300" style="flex:1">
    <span style="color:rgba(255,255,255,0.4);font-size:11px;font-family:monospace">100 K — 800 K</span>
  </div>
</div>
<canvas id="cv" width="700" height="280"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;font-family:monospace}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var slider=document.getElementById('temp-slider');
var tempLabel=document.getElementById('temp-label');

var escapeSpeed=550; // threshold for escape

function maxwellBoltzmann(v,T){
  // Probability density for speed v at temperature T (m=3.0e-26 kg, water-like)
  var m=3.0e-26,k=1.381e-23;
  var a=m/(k*T);
  return 4*Math.PI*Math.pow(a/Math.PI,1.5)*v*v*Math.exp(-a*v*v/2);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var T=parseInt(slider.value);
  tempLabel.textContent=T;

  var chartX=55,chartY=20,chartW=W-80,chartH=H-60;
  var maxV=2000,numPoints=200;

  // Find max PDF for scaling
  var maxPDF=0;
  for(var i=1;i<=numPoints;i++){
    var v=i*(maxV/numPoints);
    var p=maxwellBoltzmann(v,T);
    if(p>maxPDF)maxPDF=p;
  }
  // Use a slightly higher scale so curve doesn't clip
  var scaleY=chartH/(maxPDF*1.15);

  // Draw escape threshold shading
  var escapeX=chartX+(escapeSpeed/maxV)*chartW;
  ctx.fillStyle='rgba(248,113,113,0.12)';
  ctx.fillRect(escapeX,chartY,chartW-(escapeX-chartX),chartH);
  ctx.strokeStyle='rgba(248,113,113,0.4)';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(escapeX,chartY);ctx.lineTo(escapeX,chartY+chartH);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(248,113,113,0.65)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('escape energy threshold',escapeX+6,chartY+16);

  // Draw curve for reference temperature (300K) in grey
  var refT=300;
  ctx.beginPath();
  for(var i2=1;i2<=numPoints;i2++){
    var v2=i2*(maxV/numPoints);
    var p2=maxwellBoltzmann(v2,refT);
    var px2=chartX+(v2/maxV)*chartW;
    var py2=chartY+chartH-p2*scaleY*(T/refT); // scale relative
    if(i2===1)ctx.moveTo(px2,py2);else ctx.lineTo(px2,py2);
  }
  if(T!==refT){ctx.strokeStyle='rgba(148,163,184,0.25)';ctx.lineWidth=1.5;ctx.stroke();}

  // Compute current max for current T
  var curMaxPDF=0;
  for(var i3=1;i3<=numPoints;i3++){
    var v3=i3*(maxV/numPoints);
    var p3=maxwellBoltzmann(v3,T);
    if(p3>curMaxPDF)curMaxPDF=p3;
  }
  var curScale=chartH/(curMaxPDF*1.15);

  // Draw filled curve
  ctx.beginPath();
  ctx.moveTo(chartX,chartY+chartH);
  for(var i4=1;i4<=numPoints;i4++){
    var v4=i4*(maxV/numPoints);
    var p4=maxwellBoltzmann(v4,T);
    var px4=chartX+(v4/maxV)*chartW;
    var py4=chartY+chartH-p4*curScale;
    ctx.lineTo(px4,py4);
  }
  ctx.lineTo(chartX+chartW,chartY+chartH);ctx.closePath();
  var grad=ctx.createLinearGradient(0,chartY,0,chartY+chartH);
  grad.addColorStop(0,'rgba(56,189,248,0.35)');
  grad.addColorStop(1,'rgba(56,189,248,0.05)');
  ctx.fillStyle=grad;ctx.fill();

  // Outline
  ctx.beginPath();
  for(var i5=1;i5<=numPoints;i5++){
    var v5=i5*(maxV/numPoints);
    var p5=maxwellBoltzmann(v5,T);
    var px5=chartX+(v5/maxV)*chartW;
    var py5=chartY+chartH-p5*curScale;
    if(i5===1)ctx.moveTo(px5,py5);else ctx.lineTo(px5,py5);
  }
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.stroke();

  // Most probable speed marker
  var vmp=Math.sqrt(2*1.381e-23*T/3.0e-26);
  var vmpX=chartX+(vmp/maxV)*chartW;
  if(vmpX>chartX&&vmpX<chartX+chartW){
    ctx.strokeStyle='rgba(250,204,21,0.7)';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(vmpX,chartY);ctx.lineTo(vmpX,chartY+chartH);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(250,204,21,0.8)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('v\u2098\u2099 = '+Math.round(vmp)+' m/s',vmpX,chartY+12);
  }

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

  // X axis ticks
  [0,500,1000,1500,2000].forEach(function(v){
    var x=chartX+(v/maxV)*chartW;
    ctx.beginPath();ctx.moveTo(x,chartY+chartH);ctx.lineTo(x,chartY+chartH+5);
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(v,x,chartY+chartH+16);
  });

  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Molecular speed (m/s)',chartX+chartW/2,chartY+chartH+32);
  ctx.save();ctx.translate(16,chartY+chartH/2);ctx.rotate(-Math.PI/2);
  ctx.fillText('Probability',0,0);ctx.restore();

  // Temperature annotation
  var tempColor=T<300?'#93c5fd':T<500?'#38bdf8':'#f87171';
  ctx.fillStyle=tempColor;ctx.font='bold 13px monospace';ctx.textAlign='right';
  ctx.fillText('T = '+T+' K ('+(T-273)+'°C)',chartX+chartW,chartY+chartH-8);
}

slider.oninput=draw;
draw();`,
      outputHeight: 360,
    },

    // ── Section 3 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Solid State: Order and Rigidity

In a solid, molecules (or atoms, or ions) are packed close together and held in fixed positions by intermolecular forces. They cannot move past each other. They can only **vibrate** — oscillating back and forth around their equilibrium positions in the lattice.

This gives solids their defining macroscopic properties:
- **Fixed shape and volume.** Molecules can't flow past each other, so the solid holds its shape against gravity and moderate external forces.
- **Incompressibility.** The molecules are already in close contact; there is almost no empty space to compress them into.
- **High density.** Close packing means a lot of mass in a small volume.

There are several types of solids, differing in what holds them together:

**Ionic solids** (NaCl, CaCO₃): held together by electrostatic attraction between ions. Very high melting points. Hard but brittle.

**Metallic solids** (iron, copper, gold): metal cations surrounded by a "sea" of delocalised electrons. The electrons can move freely — explaining electrical and thermal conductivity. The electron sea allows layers to slide past each other without breaking bonds — explaining malleability and ductility.

**Molecular solids** (ice, sugar, iodine): individual molecules held together by intermolecular forces (hydrogen bonds, dipole-dipole, London dispersion). Much lower melting points than ionic or metallic solids, because intermolecular forces are weaker than ionic or metallic bonding.

**Network covalent solids** (diamond, quartz, graphite): atoms connected by a continuous web of covalent bonds extending throughout the solid. Extremely high melting points. Diamond is the hardest natural material because every direction requires breaking covalent bonds.

The melting point of a solid is determined by the strength of whatever holds it together — which is itself determined by the molecular structure.`,
    },

    // ── Visual 2 — Three states side by side ───────────────────────────────────
    {
      type: 'js',
      instruction: `### Molecular motion in solid, liquid, and gas

All three panels show the same type of molecule at the same temperature. Watch the difference in arrangement and motion: solids vibrate in place, liquids flow past each other while staying in contact, gases move freely with large empty spaces between them.`,
      html: `<canvas id="cv" width="700" height="300"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

var panelW=W/3;

// Solid: grid of vibrating particles
var solidParticles=[];
for(var row=0;row<5;row++){
  for(var col=0;col<5;col++){
    solidParticles.push({
      homeX:panelW*0.15+col*34+17,
      homeY:60+row*36,
      phase:Math.random()*Math.PI*2,
      phase2:Math.random()*Math.PI*2
    });
  }
}

// Liquid: particles that move but stay within bounds
var liquidParticles=[];
for(var i=0;i<18;i++){
  liquidParticles.push({
    x:panelW+20+Math.random()*(panelW-40),
    y:30+Math.random()*(H-60),
    vx:(Math.random()-0.5)*1.2,
    vy:(Math.random()-0.5)*1.2,
    phase:Math.random()*Math.PI*2
  });
}

// Gas: fast-moving particles with large gaps
var gasParticles=[];
for(var j=0;j<10;j++){
  gasParticles.push({
    x:panelW*2+15+Math.random()*(panelW-30),
    y:15+Math.random()*(H-30),
    vx:(Math.random()-0.5)*3.5,
    vy:(Math.random()-0.5)*3.5,
    phase:Math.random()*Math.PI*2
  });
}

var particleColor='#38bdf8';
var r=9;

function drawParticle(x,y,alpha){
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle='rgba(15,23,42,'+alpha+')';ctx.fill();
  ctx.strokeStyle='rgba(56,189,248,'+(alpha*0.9)+')';ctx.lineWidth=2;ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Panel backgrounds
  ctx.fillStyle='rgba(56,189,248,0.06)';ctx.fillRect(2,2,panelW-4,H-4);
  ctx.fillStyle='rgba(56,189,248,0.04)';ctx.fillRect(panelW+2,2,panelW-4,H-4);
  ctx.fillStyle='rgba(56,189,248,0.02)';ctx.fillRect(panelW*2+2,2,panelW-4,H-4);

  // Panel borders
  [0,panelW,panelW*2].forEach(function(px){
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
    ctx.strokeRect(px+1,1,panelW-2,H-2);
  });

  // Panel titles
  var titles=['SOLID','LIQUID','GAS'];
  var subtitles=['vibrate in fixed positions','flow past each other','move freely'];
  var colors=['#93c5fd','#38bdf8','#7dd3fc'];
  titles.forEach(function(title,i){
    ctx.fillStyle=colors[i];ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText(title,panelW*i+panelW/2,H-24);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px monospace';
    ctx.fillText(subtitles[i],panelW*i+panelW/2,H-10);
  });

  // ── SOLID ──
  solidParticles.forEach(function(p){
    var amp=2.5;
    var x=p.homeX+Math.sin(t*0.08+p.phase)*amp;
    var y=p.homeY+Math.cos(t*0.09+p.phase2)*amp*0.7;
    // Bond lines to neighbours
    solidParticles.forEach(function(q){
      var dx=p.homeX-q.homeX,dy=p.homeY-q.homeY;
      var dist=Math.sqrt(dx*dx+dy*dy);
      if(dist>5&&dist<40){
        ctx.beginPath();ctx.moveTo(x,y);
        var qx=q.homeX+Math.sin(t*0.08+q.phase)*amp;
        var qy=q.homeY+Math.cos(t*0.09+q.phase2)*amp*0.7;
        ctx.lineTo(qx,qy);
        ctx.strokeStyle='rgba(147,197,253,0.2)';ctx.lineWidth=1;ctx.stroke();
      }
    });
    drawParticle(x,y,1);
  });

  // ── LIQUID ──
  liquidParticles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    p.vx+=(Math.random()-0.5)*0.1;p.vy+=(Math.random()-0.5)*0.1;
    p.vx=Math.max(-1.8,Math.min(1.8,p.vx));
    p.vy=Math.max(-1.8,Math.min(1.8,p.vy));
    if(p.x<panelW+r){p.x=panelW+r;p.vx=Math.abs(p.vx);}
    if(p.x>panelW*2-r){p.x=panelW*2-r;p.vx=-Math.abs(p.vx);}
    if(p.y<r){p.y=r;p.vy=Math.abs(p.vy);}
    if(p.y>H-r){p.y=H-r;p.vy=-Math.abs(p.vy);}
  });
  // Draw liquid bonds (nearby pairs)
  liquidParticles.forEach(function(a,i){
    liquidParticles.forEach(function(b,j){
      if(i>=j)return;
      var dx=a.x-b.x,dy=a.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<36){
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle='rgba(56,189,248,'+(0.3*(1-dist/36))+')';ctx.lineWidth=1;ctx.stroke();
      }
    });
  });
  liquidParticles.forEach(function(p){drawParticle(p.x,p.y,0.9);});

  // ── GAS ──
  gasParticles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<panelW*2+r){p.x=panelW*2+r;p.vx=Math.abs(p.vx);}
    if(p.x>W-r){p.x=W-r;p.vx=-Math.abs(p.vx);}
    if(p.y<r){p.y=r;p.vy=Math.abs(p.vy);}
    if(p.y>H-r){p.y=H-r;p.vy=-Math.abs(p.vy);}
    drawParticle(p.x,p.y,0.75);
    // Velocity trail
    ctx.beginPath();ctx.moveTo(p.x,p.y);
    ctx.lineTo(p.x-p.vx*5,p.y-p.vy*5);
    ctx.strokeStyle='rgba(56,189,248,0.2)';ctx.lineWidth=1;ctx.stroke();
  });

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 320,
    },

    // ── Challenge 1 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Diamond and table salt (NaCl) both have very high melting points — around 3550°C and 801°C respectively. But the reason for their high melting points is different. What is the correct explanation?`,
      options: [
        { label: 'A', text: 'Both are held together by ionic bonds — the stronger the ionic bond, the higher the melting point' },
        { label: 'B', text: 'Diamond is a network covalent solid where all atoms are linked by covalent bonds throughout; NaCl is an ionic solid where melting requires breaking electrostatic attractions between ions across the entire lattice' },
        { label: 'C', text: 'Both melt at high temperatures because they are both made of heavy atoms' },
        { label: 'D', text: 'Diamond has metallic bonding; NaCl has ionic bonding — both types are very strong' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! Diamond is a network covalent solid — every carbon is bonded to 4 others with covalent bonds extending throughout the entire structure. Melting requires breaking those bonds, which takes enormous energy. NaCl is ionic — melting requires disrupting the electrostatic lattice. Both types of bonding are strong and extend through the whole solid, explaining both high melting points.",
      failMessage: "Diamond doesn't have ionic bonds — it's pure carbon with covalent bonds. NaCl doesn't have covalent bonds — it's ionic. The reason both have high melting points is that in both cases, strong bonding extends through the entire solid structure. Diamond: covalent bonds throughout. NaCl: electrostatic attractions throughout the lattice.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 4 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Liquid State: Ordered Chaos

The liquid state is the most complex and the hardest to describe precisely. It is intermediate — not as ordered as a solid, not as disordered as a gas.

In a liquid:
- Molecules are close together (nearly as close as in a solid).
- They have **no fixed positions** — they can slide past each other.
- But they are not free — at any given moment, each molecule is in contact with several neighbours, held loosely by intermolecular forces.
- The structure is **locally ordered but globally disordered** — zoom in on a tiny region and you see some short-range patterning; zoom out and it looks random.

This dual nature gives liquids their characteristic properties:

**Fixed volume but variable shape.** Molecules stay close together (intermolecular forces keep them from escaping), so volume is fixed. But they can flow past each other, so shape conforms to the container.

**Viscosity.** Resistance to flow comes from intermolecular forces between molecules as they slide past each other. Honey is more viscous than water because its long sugar molecules form more intermolecular contacts. Temperature reduces viscosity (more thermal energy overcomes the intermolecular drag).

**Surface tension.** Molecules at the surface are pulled inward and sideways by neighbours below and around them, but have no neighbours above. This asymmetry creates an inward force — the surface contracts to minimise its area. Surface tension is why droplets are spherical (minimum surface area for a given volume) and why some insects can walk on water.

**Vapour pressure.** Even below the boiling point, fast-moving surface molecules escape into the gas phase. The pressure exerted by these escaped molecules in a closed container is the **vapour pressure**. Higher temperature → more fast-moving molecules → higher vapour pressure. When vapour pressure equals atmospheric pressure, the liquid boils.`,
    },

    // ── Visual 3 — Phase transition interactive ─────────────────────────────────
    {
      type: 'js',
      instruction: `### From solid to liquid to gas: temperature drives the transition

The simulation below shows a substance heating up from a cold solid through melting and into a gas. Watch how molecular motion changes at each stage. The temperature bar shows where you are in the heating curve — including the flat regions at melting and boiling, where energy goes into breaking intermolecular forces rather than raising temperature.`,
      html: `<canvas id="cv" width="700" height="360"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;
var t=0;

// Particles
var NUM=36;
var particles=[];
var simW=360,simH=260,simX=20,simY=50;

// Grid initial positions
for(var row=0;row<6;row++){
  for(var col=0;col<6;col++){
    particles.push({
      x:simX+30+col*50,y:simY+20+row*38,
      vx:0,vy:0,
      homeX:simX+30+col*50,homeY:simY+20+row*38
    });
  }
}

// Heating curve points
var curve=[
  {time:0,temp:0,label:'Solid',color:'#93c5fd'},
  {time:80,temp:0,label:'Melting',color:'#38bdf8'},
  {time:160,temp:50,label:'Liquid',color:'#38bdf8'},
  {time:280,temp:50,label:'Boiling',color:'#fb923c'},
  {time:380,temp:100,label:'Gas',color:'#f87171'},
];

function getPhase(frame){
  var cyc=frame%400;
  if(cyc<80)return{phase:'solid',frac:cyc/80,temp:Math.round(cyc*0.25)};
  if(cyc<160)return{phase:'melting',frac:(cyc-80)/80,temp:20};
  if(cyc<280)return{phase:'liquid',frac:(cyc-160)/120,temp:Math.round(20+(cyc-160)*0.25)};
  if(cyc<360)return{phase:'boiling',frac:(cyc-280)/80,temp:50};
  return{phase:'gas',frac:(cyc-360)/40,temp:Math.round(50+(cyc-360)*1.5)};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  var state=getPhase(t);

  // ── Simulation box ──
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
  ctx.strokeRect(simX,simY,simW,simH);

  // Phase label
  var phaseColors={solid:'#93c5fd',melting:'#38bdf8',liquid:'#38bdf8',boiling:'#fb923c',gas:'#f87171'};
  ctx.fillStyle=phaseColors[state.phase];
  ctx.font='bold 14px monospace';ctx.textAlign='left';
  ctx.fillText(state.phase.charAt(0).toUpperCase()+state.phase.slice(1),simX,simY-10);

  // Update and draw particles
  particles.forEach(function(p,i){
    if(state.phase==='solid'){
      var amp=state.frac*3+0.5;
      var freq=0.08+state.frac*0.02;
      p.x=p.homeX+Math.sin(t*freq+(i*0.7))*amp;
      p.y=p.homeY+Math.cos(t*(freq+0.01)+(i*1.1))*amp*0.6;
    } else if(state.phase==='melting'){
      // Gradual disordering
      var mfrac=state.frac;
      var vib=3+mfrac*4;
      p.vx+=(Math.random()-0.5)*mfrac*0.4;
      p.vy+=(Math.random()-0.5)*mfrac*0.4;
      p.vx*=0.95;p.vy*=0.95;
      var tx=p.homeX+Math.sin(t*0.08+(i*0.7))*vib;
      var ty=p.homeY+Math.cos(t*0.09+(i*1.1))*vib*0.6;
      p.x+=(tx-p.x)*0.08+(p.vx*mfrac);
      p.y+=(ty-p.y)*0.08+(p.vy*mfrac);
    } else if(state.phase==='liquid'){
      p.vx+=(Math.random()-0.5)*0.25;
      p.vy+=(Math.random()-0.5)*0.25;
      var spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      var maxSpd=2.0+state.frac*0.5;
      if(spd>maxSpd){p.vx*=maxSpd/spd;p.vy*=maxSpd/spd;}
      p.x+=p.vx;p.y+=p.vy;
    } else if(state.phase==='boiling'){
      // Some particles escape upward
      if(i<Math.floor(state.frac*NUM*0.6)){
        p.vy-=0.08;p.vx+=(Math.random()-0.5)*0.2;
      } else {
        p.vx+=(Math.random()-0.5)*0.3;p.vy+=(Math.random()-0.5)*0.3;
        var spd2=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
        if(spd2>2.5){p.vx*=2.5/spd2;p.vy*=2.5/spd2;}
      }
      p.x+=p.vx;p.y+=p.vy;
    } else {
      p.vx+=(Math.random()-0.5)*0.15;
      p.vy+=(Math.random()-0.5)*0.15;
      var spd3=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      var gs=3.5+state.frac*1.5;
      if(spd3>gs){p.vx*=gs/spd3;p.vy*=gs/spd3;}
      if(spd3<1.5){p.vx*=1.5/Math.max(0.01,spd3);p.vy*=1.5/Math.max(0.01,spd3);}
      p.x+=p.vx;p.y+=p.vy;
    }

    // Boundary
    if(p.x<simX+10){p.x=simX+10;p.vx=Math.abs(p.vx);}
    if(p.x>simX+simW-10){p.x=simX+simW-10;p.vx=-Math.abs(p.vx);}
    if(p.y<simY+10){p.y=simY+10;p.vy=Math.abs(p.vy);}
    if(p.y>simY+simH-10){p.y=simY+simH-10;p.vy=-Math.abs(p.vy);}

    // Draw
    var pColor=phaseColors[state.phase];
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fillStyle='#0f172a';ctx.fill();
    ctx.strokeStyle=pColor+'cc';ctx.lineWidth=1.8;ctx.stroke();
  });

  // ── Heating curve ──
  var hcX=420,hcY=50,hcW=250,hcH=260;
  ctx.fillStyle='rgba(255,255,255,0.07)';ctx.fillRect(hcX,hcY,hcW,hcH);
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;ctx.strokeRect(hcX,hcY,hcW,hcH);

  // Draw the heating curve shape
  var points=[
    {x:0,y:0.85},{x:0.18,y:0.55},{x:0.2,y:0.55},
    {x:0.4,y:0.55},{x:0.42,y:0.55},{x:0.55,y:0.35},
    {x:0.68,y:0.35},{x:0.7,y:0.35},{x:1.0,y:0.05}
  ];
  ctx.beginPath();
  points.forEach(function(p,i){
    var px=hcX+p.x*hcW,py=hcY+p.y*hcH;
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  });
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.stroke();

  // Segment labels
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Solid',hcX+0.09*hcW,hcY+0.7*hcH);
  ctx.fillText('Melting',hcX+0.3*hcW,hcY+0.48*hcH);
  ctx.fillText('Liquid',hcX+0.53*hcW,hcY+0.28*hcH);
  ctx.fillText('Boiling',hcX+0.69*hcW,hcY+0.28*hcH);
  ctx.fillText('Gas',hcX+0.87*hcW,hcY+0.12*hcH);

  // Moving dot on curve
  var cyc=t%400;
  var normT=cyc/400;
  // Interpolate
  var ci=0;
  for(var pi=0;pi<points.length-1;pi++){
    if(normT>=points[pi].x&&normT<=points[pi+1].x){ci=pi;break;}
  }
  var seg=points[ci],segNext=points[ci+1]||points[ci];
  var segFrac=segNext.x>seg.x?(normT-seg.x)/(segNext.x-seg.x):0;
  var dotX=hcX+(seg.x+(segNext.x-seg.x)*segFrac)*hcW;
  var dotY=hcY+(seg.y+(segNext.y-seg.y)*segFrac)*hcH;
  ctx.beginPath();ctx.arc(dotX,dotY,6,0,Math.PI*2);
  ctx.fillStyle=phaseColors[state.phase];ctx.fill();

  // Axes labels
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px monospace';ctx.textAlign='center';
  ctx.fillText('Heat added \u2192',hcX+hcW/2,hcY+hcH+18);
  ctx.save();ctx.translate(hcX-18,hcY+hcH/2);ctx.rotate(-Math.PI/2);
  ctx.fillText('Temperature \u2192',0,0);ctx.restore();

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
  ctx.fillText('Flat regions: energy breaks IMFs,',hcX+hcW/2,hcY+hcH+34);
  ctx.fillText('not raising temperature',hcX+hcW/2,hcY+hcH+46);

  t++;requestAnimationFrame(draw);
}
draw();`,
      outputHeight: 400,
    },

    // ── Section 5 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Gas State: Freedom and Pressure

In a gas, molecules are far apart — typically separated by distances roughly 10 times their own diameter. The intermolecular forces are negligible (molecules spend almost no time close enough to feel each other). Each molecule moves independently in a straight line until it collides with another molecule or with the walls of its container.

This gives gases their defining properties:

**No fixed shape or volume.** Without significant intermolecular forces, nothing holds molecules near each other. They expand to fill any container. If you remove a wall, they spread out.

**Compressibility.** Most of a gas is empty space — the molecules themselves occupy only a tiny fraction of the total volume. Compressing a gas just reduces the empty space.

**Low density.** At standard conditions, air has density about 1.2 kg/m³. Water is about 830 times denser.

**Pressure.** Gas molecules are constantly hitting the walls of their container. Each collision transfers momentum to the wall. The average force per unit area from billions of collisions per second is **pressure**. Higher temperature → faster molecules → harder collisions → higher pressure. More molecules in the same volume → more frequent collisions → higher pressure.

This molecular picture gives us the ideal gas law: **PV = nRT**. Pressure times volume equals the number of moles times the gas constant times temperature. At constant temperature, doubling the pressure halves the volume (Boyle's Law). At constant volume, doubling the temperature doubles the pressure (Gay-Lussac's Law). All of this follows from the simple picture of molecules bouncing around in a box.

Real gases deviate from this ideal behaviour at high pressures or low temperatures, when molecules get close enough to feel each other's intermolecular forces — but for most practical purposes, the ideal gas model is remarkably accurate.`,
    },

    // ── Challenge 2 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `When water boils, the heating curve has a flat region — temperature stays at 100°C for some time even as heat is continuously added. What is happening at the molecular level during this flat region?`,
      options: [
        { label: 'A', text: 'The thermometer is broken — temperature must be rising if heat is being added' },
        { label: 'B', text: 'The energy is breaking hydrogen bonds between water molecules (overcoming intermolecular forces to convert liquid to gas), not increasing molecular kinetic energy' },
        { label: 'C', text: 'Water molecules are absorbing heat and storing it in their covalent bonds' },
        { label: 'D', text: 'At 100°C, water stops absorbing heat until all the liquid has evaporated' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! During a phase transition, the added energy goes into overcoming intermolecular forces (breaking hydrogen bonds in water's case) rather than speeding up molecules. Temperature measures average kinetic energy — if kinetic energy isn't increasing, temperature isn't rising. The energy absorbed during boiling is called the latent heat of vaporisation.",
      failMessage: "Temperature is a measure of average kinetic energy (molecular speed). At the boiling point, added energy is being used to break intermolecular forces — pulling molecules apart from the liquid into the gas phase — not to speed up the molecules. Until all the liquid is converted to gas, the temperature stays constant at 100°C.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Section 6 ───────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Phase Diagrams: Mapping the States

For any pure substance, there exists a **phase diagram** — a map showing which state is stable at any combination of temperature and pressure. Phase diagrams are one of the most useful tools in all of chemistry and materials science.

The phase diagram has three regions (solid, liquid, gas) separated by three curves:

**The solid-liquid boundary (melting curve):** Moving across this line at constant pressure converts solid to liquid. For most substances, this curve slopes to the right — higher pressure raises the melting point (squeezing atoms together stabilises the solid). Water is a famous exception: its melting curve slopes slightly to the left, meaning higher pressure lowers the melting point. This is a direct consequence of ice being less dense than liquid water.

**The liquid-gas boundary (vapour pressure curve):** This shows the vapour pressure at each temperature. The boiling point at any given pressure is where this curve is crossed. At 1 atm, water boils at 100°C. At 0.5 atm (high altitude), water boils at about 81°C — which is why cooking at altitude takes longer.

**The solid-gas boundary (sublimation curve):** At low pressures, solids can convert directly to gas without passing through the liquid phase. Dry ice (solid CO₂) sublimates at room temperature because CO₂'s triple point pressure (5.1 atm) is above atmospheric pressure — liquid CO₂ doesn't exist at 1 atm.

**The triple point:** The single temperature and pressure where all three phases coexist in equilibrium. For water: 0.01°C and 611.7 Pa.

**The critical point:** Above this temperature and pressure, the distinction between liquid and gas disappears — the substance becomes a **supercritical fluid** with properties of both. Supercritical CO₂ (above 31°C and 73 atm) is used industrially to extract caffeine from coffee and hops from beer.`,
    },

    // ── Visual 4 — Phase diagram ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Interactive phase diagram for water

Click anywhere on the phase diagram to see what state water is in at that temperature and pressure. The triple point, critical point, and normal boiling and melting points are labelled. Notice the slightly negative slope of the solid-liquid boundary — unique to water among common substances.`,
      html: `<canvas id="cv" width="700" height="340"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center;cursor:crosshair}
canvas{display:block;width:100%;max-width:700px}`,
      startCode: `var canvas=document.getElementById('cv');
var ctx=canvas.getContext('2d');
var W=canvas.width,H=canvas.height;

var chartX=70,chartY=20,chartW=W-100,chartH=H-70;
// X: temperature -50°C to 400°C, Y: pressure 0.001 to 220 atm (log scale)
var minT=-50,maxT=380;
var minLogP=-3,maxLogP=2.4; // log10(atm)

function toScreen(tempC,pressureAtm){
  var x=chartX+((tempC-minT)/(maxT-minT))*chartW;
  var logP=Math.log10(Math.max(0.0001,pressureAtm));
  var y=chartY+chartH-(logP-minLogP)/(maxLogP-minLogP)*chartH;
  return{x:x,y:y};
}

function fromScreen(sx,sy){
  var tempC=(sx-chartX)/(chartW)*(maxT-minT)+minT;
  var logP=(1-(sy-chartY)/chartH)*(maxLogP-minLogP)+minLogP;
  return{tempC:Math.round(tempC),pressureAtm:Math.pow(10,logP)};
}

var cursor=null;
canvas.addEventListener('mousemove',function(e){
  var rect=canvas.getBoundingClientRect();
  var sx=(e.clientX-rect.left)*(W/rect.width);
  var sy=(e.clientY-rect.top)*(H/rect.height);
  if(sx>chartX&&sx<chartX+chartW&&sy>chartY&&sy<chartY+chartH){
    cursor=fromScreen(sx,sy);
  } else {cursor=null;}
  draw();
});

// Key points
var tripleT=0.01,tripleP=0.00604;
var critT=374,critP=218;

function getPhaseLabel(tempC,pressureAtm){
  // Simplified water phase boundaries
  // Melting: P_melt ≈ 1 + (0-tempC)*135 atm (slightly negative slope)
  var meltP=1+(0-tempC)*130;
  // Vapour pressure (Antoine approx): log10(P_vap in atm) ≈ 8.07 - 1730/(233+T) - log10(760)
  var logPvap=8.07131-1730.63/(233.426+tempC)-Math.log10(760);
  var pvap=Math.pow(10,logPvap);

  if(tempC>critT&&pressureAtm>critP) return{label:'Supercritical\\nFluid',color:'#a78bfa'};
  if(tempC<tripleT&&pressureAtm>tripleP&&pressureAtm>meltP) return{label:'Solid (Ice)',color:'#93c5fd'};
  if(tempC<tripleT&&pressureAtm<tripleP) return{label:'Gas',color:'#fb923c'};
  if(pressureAtm>pvap&&pressureAtm<meltP) return{label:'Liquid',color:'#38bdf8'};
  if(pressureAtm>meltP) return{label:'Solid (Ice)',color:'#93c5fd'};
  return{label:'Gas',color:'#fb923c'};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);

  // Fill phase regions
  var res=8;
  for(var px=0;px<chartW;px+=res){
    for(var py=0;py<chartH;py+=res){
      var coords=fromScreen(chartX+px,chartY+py);
      var ph=getPhaseLabel(coords.tempC,coords.pressureAtm);
      var alpha=0.18;
      if(ph.label.indexOf('Solid')!==-1) ctx.fillStyle='rgba(147,197,253,'+alpha+')';
      else if(ph.label==='Liquid') ctx.fillStyle='rgba(56,189,248,'+alpha+')';
      else if(ph.label.indexOf('Super')!==-1) ctx.fillStyle='rgba(167,139,250,'+alpha+')';
      else ctx.fillStyle='rgba(251,146,60,'+alpha+')';
      ctx.fillRect(chartX+px,chartY+py,res,res);
    }
  }

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(chartX,chartY);ctx.lineTo(chartX,chartY+chartH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(chartX,chartY+chartH);ctx.lineTo(chartX+chartW,chartY+chartH);ctx.stroke();

  // X axis ticks
  [-50,0,50,100,150,200,250,300,350].forEach(function(T){
    var pt=toScreen(T,1);
    ctx.beginPath();ctx.moveTo(pt.x,chartY+chartH);ctx.lineTo(pt.x,chartY+chartH+5);
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(T+'°',pt.x,chartY+chartH+16);
  });

  // Y axis ticks (log)
  [0.001,0.01,0.1,1,10,100].forEach(function(P){
    var pt=toScreen(0,P);
    ctx.beginPath();ctx.moveTo(chartX-5,pt.y);ctx.lineTo(chartX,pt.y);
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='9px monospace';ctx.textAlign='right';
    var label=P<1?P+'':P>=100?P+'':P+'';
    ctx.fillText(P+' atm',chartX-8,pt.y+4);
    ctx.beginPath();ctx.moveTo(chartX,pt.y);ctx.lineTo(chartX+chartW,pt.y);
    ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.stroke();
  });

  // 1 atm line
  var atm1=toScreen(minT,1);var atm1b=toScreen(maxT,1);
  ctx.beginPath();ctx.moveTo(atm1.x,atm1.y);ctx.lineTo(atm1b.x,atm1b.y);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText('1 atm',chartX+chartW+4,atm1.y+4);

  // Key points
  var tp=toScreen(tripleT,tripleP);
  var cp=toScreen(critT,critP);
  var bp=toScreen(100,1);
  var mp=toScreen(0,1);

  [[tp,'Triple point\\n(0.01°C, 0.006 atm)','#4ade80'],
   [cp,'Critical point\\n(374°C, 218 atm)','#a78bfa'],
   [bp,'Normal boiling\\npoint (100°C)','#fb923c'],
   [mp,'Normal melting\\npoint (0°C)','#93c5fd']
  ].forEach(function(item){
    var pt=item[0],label=item[1],color=item[2];
    ctx.beginPath();ctx.arc(pt.x,pt.y,6,0,Math.PI*2);
    ctx.fillStyle=color;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=1.5;ctx.stroke();
    var lines=label.split('\\n');
    ctx.fillStyle=color;ctx.font='bold 10px monospace';ctx.textAlign='center';
    lines.forEach(function(l,li){ctx.fillText(l,pt.x,pt.y-12-li*13);});
  });

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px monospace';ctx.textAlign='center';
  ctx.fillText('Temperature (°C)',chartX+chartW/2,chartY+chartH+36);
  ctx.save();ctx.translate(18,chartY+chartH/2);ctx.rotate(-Math.PI/2);
  ctx.fillText('Pressure (atm, log scale)',0,0);ctx.restore();

  // Cursor readout
  if(cursor){
    var ph=getPhaseLabel(cursor.tempC,cursor.pressureAtm);
    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.fillRect(chartX+chartW-190,chartY+4,188,48);
    ctx.strokeStyle=ph.color;ctx.lineWidth=1.5;
    ctx.strokeRect(chartX+chartW-190,chartY+4,188,48);
    ctx.fillStyle=ph.color;ctx.font='bold 12px monospace';ctx.textAlign='center';
    var phLines=ph.label.split('\\n');
    phLines.forEach(function(l,li){ctx.fillText(l,chartX+chartW-96,chartY+18+li*16);});
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='10px monospace';
    ctx.fillText(cursor.tempC+'°C  |  '+cursor.pressureAtm.toFixed(3)+' atm',chartX+chartW-96,chartY+18+phLines.length*16+4);
  }

  // Region labels
  ctx.fillStyle='rgba(147,197,253,0.55)';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('ICE',toScreen(minT+30,10).x,toScreen(minT+30,10).y);
  ctx.fillStyle='rgba(56,189,248,0.55)';
  ctx.fillText('LIQUID',toScreen(150,5).x,toScreen(150,5).y);
  ctx.fillStyle='rgba(251,146,60,0.55)';
  ctx.fillText('GAS',toScreen(200,0.01).x,toScreen(200,0.01).y);
  ctx.fillStyle='rgba(167,139,250,0.6)';
  ctx.fillText('SUPER-\\nCRITICAL',toScreen(374,100).x,toScreen(374,100).y-10);
}

draw();`,
      outputHeight: 360,
    },

    // ── Challenge 3 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `At high altitude (e.g., on Mount Everest, ~0.33 atm), water boils at around 71°C instead of 100°C. Using your understanding of vapour pressure, why does lower atmospheric pressure reduce the boiling point?`,
      options: [
        { label: 'A', text: 'Thinner air contains less oxygen, which is needed to sustain boiling' },
        { label: 'B', text: 'Boiling occurs when vapour pressure equals atmospheric pressure. At lower atmospheric pressure, water needs less vapour pressure — and therefore less thermal energy — to reach that point' },
        { label: 'C', text: 'At high altitude, gravity is weaker, so molecules escape the liquid more easily' },
        { label: 'D', text: 'Cold temperatures at altitude cool the water before it can reach 100°C' },
      ],
      check: (label) => label === 'B',
      successMessage: "Correct! The boiling point is the temperature at which vapour pressure equals the external (atmospheric) pressure. At 0.33 atm, water only needs to reach a vapour pressure of 0.33 atm — which happens at about 71°C rather than 100°C. This is why eggs take longer to boil at altitude and why pressure cookers (increasing pressure above 1 atm) raise the boiling point above 100°C.",
      failMessage: "Boiling happens when vapour pressure = atmospheric pressure — bubbles can form and expand throughout the liquid. At lower atmospheric pressure, vapour pressure reaches the atmospheric pressure at a lower temperature. The liquid doesn't need as much thermal energy to boil, so the boiling point decreases.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Challenge 4 ─────────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Dry ice (solid CO₂) sublimes directly from solid to gas at room temperature and 1 atm, without forming liquid. What does this tell you about CO₂'s phase diagram?`,
      options: [
        { label: 'A', text: "CO₂'s triple point pressure is above 1 atm — so at 1 atm, liquid CO₂ is never stable" },
        { label: 'B', text: "CO₂ has no triple point — it can only exist as solid or gas" },
        { label: 'C', text: "CO₂'s critical point is below room temperature, making liquid impossible" },
        { label: 'D', text: 'CO₂ molecules are too light to remain liquid at any pressure' },
      ],
      check: (label) => label === 'A',
      successMessage: "Correct! CO₂'s triple point is at 5.1 atm and −56.6°C. At 1 atm (below the triple point pressure), the liquid phase of CO₂ doesn't exist — the only boundary crossed as you heat solid CO₂ at 1 atm is the solid-gas (sublimation) boundary. To get liquid CO₂, you need at least 5.1 atm of pressure.",
      failMessage: "Every substance has a triple point. For CO₂, it's at 5.1 atm — much higher than atmospheric pressure. Since 1 atm is below the triple point pressure, there's no liquid region accessible at 1 atm. The solid converts directly to gas (sublimation) when heated at atmospheric pressure.",
      html: '', css: `body{margin:0;padding:0;font-family:sans-serif}`, startCode: '',
      outputHeight: 300,
    },

    // ── Closing ──────────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### States of Matter: The Competition at the Core

Every state of matter, every phase transition, every feature of a phase diagram is a consequence of one competition: **thermal energy vs. intermolecular forces.**

- When thermal energy >> intermolecular forces: gas. Molecules move freely, too fast to be captured by their neighbours.
- When thermal energy ≈ intermolecular forces: liquid. Molecules stay in contact but can slide past each other.
- When thermal energy << intermolecular forces: solid. Molecules are locked in place, only vibrating.

The melting point and boiling point of a substance are simply the temperatures at which thermal energy equals intermolecular forces — the tipping points of the competition.

This is why helium (noble gas, essentially no intermolecular forces) boils at −269°C. Why water (strong hydrogen bonds) boils at 100°C. Why iron (strong metallic bonds) melts at 1538°C. The numbers aren't arbitrary memorisation — they are measurements of the strength of the forces holding those substances together.

In the next lesson, we'll zoom in on those intermolecular forces themselves — the London dispersion forces, dipole-dipole attractions, and hydrogen bonds that determine the melting and boiling points of every substance on Earth.`,
    },

  ],
};

export default {
  id: 'chem-3-0-states-of-matter',
  slug: 'states-of-matter',
  chapter: 'chem.3',
  order: 0,
  title: 'States of Matter',
  subtitle: 'Solid, liquid, gas — the same molecules, completely different behaviour.',
  tags: ['chemistry', 'states-of-matter', 'solid', 'liquid', 'gas', 'phase-transitions', 'phase-diagram', 'kinetic-theory', 'Maxwell-Boltzmann'],
  hook: {
    question: 'Why is water a liquid at room temperature, while oxygen — a molecule of similar size — is a gas? And why does the answer tell you everything about melting points and boiling points?',
    realWorldContext: 'The state of any substance is determined by one competition: the thermal energy of its molecules vs. the intermolecular forces holding them together. Understanding this competition explains phase diagrams, boiling points, and why dry ice sublimates.',
    previewVisualizationId: 'ScienceNotebook',
  },
  intuition: {
    prose: [
      'Temperature = average kinetic energy of molecules. Higher temperature = faster molecules.',
      'Solids: molecules vibrate in fixed positions. Liquids: molecules slide past each other. Gases: molecules move freely with large gaps between them.',
      'Phase transitions occur when thermal energy equals intermolecular forces. The flat regions on a heating curve show energy going into breaking forces, not raising temperature.',
      'Phase diagrams map which state is stable at any temperature-pressure combination. The triple point is where all three phases coexist.',
    ],
    callouts: [
      { type: 'important', title: 'The one competition that explains everything', body: 'State of matter = outcome of thermal energy vs. intermolecular forces. Gas: thermal wins. Solid: forces win. Liquid: a draw.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'States of Matter', props: { lesson: LESSON_CHEM_3_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Temperature = average molecular kinetic energy. Maxwell-Boltzmann distribution: molecules have a range of speeds.',
    'Solid: molecules in fixed positions, only vibrate. Hard, incompressible, high density.',
    'Liquid: molecules close but mobile. Fixed volume, variable shape. Vapour pressure rises with temperature.',
    'Gas: molecules far apart, move freely. No fixed shape or volume. Pressure from molecular collisions. PV = nRT.',
    'Phase transitions: thermal energy overcomes intermolecular forces. Flat regions on heating curve = latent heat.',
    'Phase diagram: maps stable state at each T and P. Triple point: all three phases coexist. Critical point: liquid/gas distinction disappears.',
    'Boiling point = temperature where vapour pressure = atmospheric pressure. Lower pressure → lower boiling point.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_CHEM_3_0 };
